import type { Rule, SourceCode } from 'eslint'
import { asNode, child, children, HOLE, keyName, texts, unwrap, variableOf } from './static-values'
import type { Node } from './static-values'

const KEYFRAME_KEYS = new Set(['transform', 'translate', 'scale', 'rotate', 'opacity', 'offset', 'easing', 'composite'])
const MUTATING_METHODS = new Set(['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort', 'fill', 'copyWithin'])
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])
// Self-referencing builders would recurse forever; real keyframe builders stay far below this depth.
const MAX_DEPTH = 6

export type MotionOptions = {
  /** Allows `requestAnimationFrame` in the files this option is scoped to with ESLint `files`; the reason is required and the file must call it. */
  animationFrameReason?: string
}

type Key = { node: Node; name: string | undefined }

function mutates(identifier: Node): boolean {
  const parent = child(identifier, 'parent')
  if (parent?.type === 'CallExpression' && children(parent, 'arguments')[0] === identifier) {
    const callee = unwrap(child(parent, 'callee'))
    return callee?.type === 'MemberExpression' && child(callee, 'object')?.name === 'Object' && ['assign', 'defineProperty'].includes(keyName(callee) ?? '')
  }
  if (parent?.type !== 'MemberExpression' || child(parent, 'object') !== identifier) return false
  const use = child(parent, 'parent')
  if (use?.type === 'AssignmentExpression') return child(use, 'left') === parent
  if (use?.type === 'UpdateExpression' || (use?.type === 'UnaryExpression' && use.operator === 'delete')) return true
  return use?.type === 'CallExpression' && child(use, 'callee') === parent && MUTATING_METHODS.has(keyName(parent) ?? '')
}

// A const binding counts only while nothing writes into it, so a frame object filled in later stays unknown.
function binding(identifier: Node, source: SourceCode): Node | undefined {
  const variable = variableOf(identifier, source)
  const definition = variable?.defs[0]
  if (definition?.type === 'FunctionName') return definition.node as unknown as Node
  if (definition?.type !== 'Variable' || definition.parent.kind !== 'const' || definition.node.id.type !== 'Identifier') return undefined
  if (variable?.references.some((reference) => mutates(reference.identifier as unknown as Node))) return undefined
  return asNode(definition.node.init)
}

function returned(fn: Node): Node[] {
  const body = child(fn, 'body')
  if (fn.type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') return body ? [body] : []
  const found: Node[] = []
  const visit = (node: Node): void => {
    if (FUNCTIONS.has(node.type)) return
    const argument = child(node, 'argument')
    if (node.type === 'ReturnStatement' && argument) found.push(argument)
    for (const [key, value] of Object.entries(node)) {
      if (key === 'parent') continue
      for (const item of Array.isArray(value) ? value : [value]) {
        const next = asNode(item)
        if (next) visit(next)
      }
    }
  }
  children(body, 'body').forEach(visit)
  return found
}

function keysOf(expression: Node | undefined, source: SourceCode, depth = 0): Key[] {
  const node = unwrap(expression)
  if (!node) return []
  if (depth > MAX_DEPTH) return [{ node, name: undefined }]
  const next = (value: Node | undefined) => keysOf(value, source, depth + 1)
  if (node.type === 'ConditionalExpression') return [...next(child(node, 'consequent')), ...next(child(node, 'alternate'))]
  if (node.type === 'LogicalExpression') return [...next(child(node, 'left')), ...next(child(node, 'right'))]
  if (node.type === 'ArrayExpression') return children(node, 'elements').flatMap(next)
  if (node.type === 'SpreadElement') return next(child(node, 'argument'))
  if (node.type === 'ObjectExpression') return children(node, 'properties').flatMap((property) => (property.type === 'Property' ? propertyKeys(property, source) : next(property)))
  if (node.type === 'Literal' && node.value === null) return []
  const bound = node.type === 'Identifier' ? binding(node, source) : undefined
  if (bound && !FUNCTIONS.has(bound.type)) return next(bound)
  const callee = node.type === 'CallExpression' ? unwrap(child(node, 'callee')) : undefined
  const builder = callee?.type === 'Identifier' ? binding(callee, source) : undefined
  if (builder && FUNCTIONS.has(builder.type)) return returned(builder).flatMap(next)
  return [{ node, name: undefined }]
}

function propertyKeys(property: Node, source: SourceCode): Key[] {
  const name = keyName(property)
  if (name !== undefined) return [{ node: property, name }]
  return texts(child(property, 'key'), source).map((text) => ({ node: property, name: text.includes(HOLE) ? undefined : text }))
}

export const compositorMotion: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Animate from script only with compositor properties and without animation frame loops.' },
    schema: [{ type: 'object', properties: { animationFrameReason: { type: 'string', minLength: 12 } }, additionalProperties: false }],
    messages: {
      property: 'Keyframe property "{{name}}" runs on the main thread. Animate only transform, translate, scale, rotate or opacity.',
      dynamic: 'Keyframes passed to animate() must be literal objects, or built by a function in this file, so their properties can be checked.',
      animationFrame: 'requestAnimationFrame schedules main-thread work in the rendering frame. Animate with CSS or animate() on compositor properties, or scope animationFrameReason to this file.',
      unusedException: 'This file is a requestAnimationFrame exception but never calls it. Remove the exception.',
    },
  },
  create(context) {
    const { animationFrameReason }: MotionOptions = context.options[0] ?? {}
    const source = context.sourceCode
    let animationFrames = 0
    // One report per property name in a call; an unknown frame is reported where it is passed.
    const checkFrames = (sites: Node[]): void => {
      const reported = new Set<string>()
      for (const site of sites) {
        const keys = keysOf(site, source)
        if (keys.some(({ name }) => name === undefined)) context.report({ node: site, messageId: 'dynamic' })
        for (const { node, name } of keys) {
          if (name === undefined || reported.has(name) || KEYFRAME_KEYS.has(name)) continue
          reported.add(name)
          context.report({ node, messageId: 'property', data: { name } })
        }
      }
    }
    return {
      CallExpression(raw: unknown) {
        const node = raw as Node
        const callee = unwrap(child(node, 'callee'))
        const name = callee?.type === 'MemberExpression' ? keyName(callee) : callee?.name
        if (name === 'requestAnimationFrame') {
          animationFrames++
          if (animationFrameReason === undefined) context.report({ node, messageId: 'animationFrame' })
        }
        const [frames] = children(node, 'arguments')
        if (name !== 'animate' || callee?.type !== 'MemberExpression' || !frames) return
        const list = unwrap(frames)
        checkFrames(list?.type === 'ArrayExpression' ? children(list, 'elements') : [frames])
      },
      'Program:exit'(raw: unknown) {
        if (animationFrameReason !== undefined && animationFrames === 0) context.report({ node: raw as Node, messageId: 'unusedException' })
      },
    }
  },
}
