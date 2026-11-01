import type { Rule } from 'eslint'
import { builderName, child, children, keyName, texts, unwrap, type Node } from '../../src/eslint/static-values.ts'
import { INSTANCE_KEYS } from '../../src/lib/instance.ts'

const INSTANCE_NAMES: ReadonlySet<string> = new Set(Object.keys(INSTANCE_KEYS))
const SVG_GEOMETRY: ReadonlySet<string> = new Set(['viewBox', 'd', 'points', 'cx', 'cy', 'r', 'x', 'y'])
const SVG_PAINT: Readonly<Record<string, readonly string[]>> = { fill: ['none', 'currentColor'], stroke: ['currentColor'] }
const SVG_ATTRIBUTES: ReadonlySet<string> = new Set([
  ...SVG_GEOMETRY, ...Object.keys(SVG_PAINT), 'strokeLinecap', 'strokeLinejoin', 'aria-hidden', 'focusable',
])
const SVG_ELEMENTS: ReadonlySet<string> = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect', 'use', 'symbol', 'defs', 'clipPath', 'mask',
  'pattern', 'marker', 'linearGradient', 'radialGradient', 'stop', 'filter', 'text', 'tspan', 'textPath', 'image', 'foreignObject',
])
const STRUCTURAL_NUMBERS: ReadonlySet<number> = new Set([0, 1])

function attributeName(attribute: Node): string {
  const name = child(attribute, 'name')
  if (name?.type === 'JSXNamespacedName') return `${String(child(name, 'namespace')?.name)}:${String(child(name, 'name')?.name)}`
  return String(name?.name)
}

function inSvg(attribute: Node): boolean {
  for (let node = child(attribute, 'parent'); node; node = child(node, 'parent')) {
    const opening = node.type === 'JSXElement' ? child(node, 'openingElement') : node.type === 'JSXOpeningElement' ? node : undefined
    const element = child(opening, 'name')
    if (element?.type === 'JSXIdentifier' && SVG_ELEMENTS.has(String(element.name))) return true
  }
  return false
}

function typePosition(literal: Node): boolean {
  const owner = child(literal, 'parent')
  const signed = owner?.type === 'UnaryExpression' ? child(owner, 'parent') : owner
  return signed?.type === 'TSLiteralType'
}

function geometryValue(literal: Node): boolean {
  for (let node = child(literal, 'parent'); node; node = child(node, 'parent')) {
    if (node.type === 'JSXAttribute') return SVG_GEOMETRY.has(attributeName(node)) && inSvg(node)
  }
  return false
}

export const componentAppearance: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep the appearance of a Tessera component in recipes, reached through data-* attributes.' },
    schema: [],
    messages: {
      component: '"{{value}}" is not allowed in a Tessera component. Take the appearance from a recipe through data-* attributes.',
      instance: 'Style key "{{value}}" is not an instance key. A Tessera component writes only keys of INSTANCE_KEYS through a literal style object.',
      svg: '"{{value}}" is not an allowed SVG attribute in a Tessera component. Draw on viewBox 24 with currentColor; the recipe sets the stroke.',
      literal: 'Number {{value}} in a Tessera component. Sizes come from engines and behaviour times from named constants in lib/.',
    },
  },
  create(context) {
    const source = context.sourceCode
    const text = (node: Node): string => source.getText(node as unknown as Rule.Node)
    const checkStyle = (node: Node): void => {
      const value = unwrap(child(node, 'value'))
      if (value?.type !== 'ObjectExpression') {
        context.report({ node, messageId: 'component', data: { value: 'style' } })
        return
      }
      for (const property of children(value, 'properties')) {
        const key = property.type === 'Property' ? keyName(property) : undefined
        if (key === undefined || !INSTANCE_NAMES.has(key)) context.report({ node: property, messageId: 'instance', data: { value: key ?? text(property) } })
      }
    }
    const checkSvg = (node: Node, name: string): void => {
      const paint = Object.hasOwn(SVG_PAINT, name) ? SVG_PAINT[name] : undefined
      const allowed = SVG_ATTRIBUTES.has(name) && (!paint || texts(child(node, 'value'), source).every((value) => paint.includes(value)))
      if (!allowed) context.report({ node, messageId: 'svg', data: { value: text(node) } })
    }
    const checkSpread = (node: Node): void => {
      const argument = unwrap(child(node, 'argument'))
      if (argument?.type !== 'ObjectExpression') return
      for (const property of children(argument, 'properties')) {
        const key = property.type === 'Property' ? keyName(property) : undefined
        if (key === 'style') checkStyle(property)
        else if (key === undefined || key === 'className') context.report({ node: property, messageId: 'component', data: { value: key ?? text(property) } })
      }
    }
    return {
      JSXAttribute(raw: unknown) {
        const node = raw as Node
        const name = attributeName(node)
        if (name === 'className') context.report({ node, messageId: 'component', data: { value: name } })
        else if (name === 'style') checkStyle(node)
        else if (inSvg(node)) checkSvg(node, name)
      },
      JSXSpreadAttribute(raw: unknown) {
        const node = raw as Node
        if (inSvg(node)) context.report({ node, messageId: 'svg', data: { value: text(node) } })
        else checkSpread(node)
      },
      CallExpression(raw: unknown) {
        const node = raw as Node
        const name = builderName(node)
        if (name) context.report({ node, messageId: 'component', data: { value: `${name}()` } })
      },
      Literal(raw: unknown) {
        const node = raw as Node
        if (typeof node.value !== 'number' || STRUCTURAL_NUMBERS.has(node.value)) return
        if (typePosition(node) || geometryValue(node)) return
        context.report({ node, messageId: 'literal', data: { value: text(node) } })
      },
    }
  },
}
