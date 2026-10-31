import type { Rule, Scope, SourceCode } from 'eslint'

export type Node = { type: string; loc?: { start: { line: number; column: number }; end: { line: number; column: number } }; [key: string]: unknown }
export type Entry = { node: Node; name: string; value: Node | undefined }

// Stands for an unknown interpolation; a private-use character never occurs in real class or CSS text.
export const HOLE = String.fromCharCode(0xe000)
const WRAPPERS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion', 'ChainExpression', 'JSXExpressionContainer'])
const BUILDERS = new Set(['cn', 'cva'])
// Self-referencing constants would recurse forever; real class expressions stay far below this depth.
const MAX_DEPTH = 6
const MAX_COMBINATIONS = 1024

export function asNode(value: unknown): Node | undefined {
  return value !== null && typeof value === 'object' && 'type' in value && typeof value.type === 'string' ? value as Node : undefined
}

export function child(node: Node | undefined, key: string): Node | undefined {
  return asNode(node?.[key])
}

export function children(node: Node | undefined, key: string): Node[] {
  const value = node?.[key]
  return Array.isArray(value) ? value.flatMap((item: unknown) => asNode(item) ?? []) : []
}

export function unwrap(node: Node | undefined): Node | undefined {
  return node && WRAPPERS.has(node.type) ? unwrap(child(node, 'expression')) : node
}

function outermost(node: Node): Node {
  const parent = child(node, 'parent')
  return parent && WRAPPERS.has(parent.type) ? outermost(parent) : node
}

export function keyName(node: Node): string | undefined {
  const key = child(node, node.type === 'MemberExpression' ? 'property' : 'key')
  if (key?.type === 'Identifier' && !node.computed) return key.name as string
  if (key?.type === 'Literal' && (typeof key.value === 'string' || typeof key.value === 'number')) return String(key.value)
  const [quasi] = children(key, 'quasis')
  const cooked = (quasi?.value as { cooked?: unknown } | undefined)?.cooked
  return key?.type === 'TemplateLiteral' && children(key, 'expressions').length === 0 && typeof cooked === 'string' ? cooked : undefined
}

export function variableOf(identifier: Node, source: SourceCode): Scope.Variable | undefined {
  const name = identifier.name as string
  let scope: Scope.Scope | null = source.getScope(identifier as Node & { type: 'Identifier'; name: string })
  while (scope && !scope.set.has(name)) scope = scope.upper
  return scope?.set.get(name)
}

function constInit(node: Node, source: SourceCode): Node | undefined {
  const definition = variableOf(node, source)?.defs[0]
  if (definition?.type !== 'Variable' || definition.parent.kind !== 'const' || definition.node.id.type !== 'Identifier') return undefined
  const init = asNode(definition.node.init)
  // A constant read inside its own initializer never runs, and following it would only multiply the work.
  const [start, end] = (node.range as [number, number] | undefined) ?? [0, 0]
  const [from, to] = (init?.range as [number, number] | undefined) ?? [0, 0]
  return start >= from && end <= to && to > 0 ? undefined : init
}

/**
 * Returns the possible value nodes of an expression, following only type wrappers, `? :`, both operands of `&&`/`||`/`??` and
 * identifiers bound by `const x = <value>` (so `const b = a` too), with object keys read only when plain or string
 * literals; anything else, including an unbound identifier, is returned as itself and counts as unknown.
 */
function resolve(expression: Node | undefined, source: SourceCode, depth = 0): Node[] {
  const node = unwrap(expression)
  if (!node) return []
  if (depth > MAX_DEPTH) return [node]
  const next = (key: string) => resolve(child(node, key), source, depth)
  if (node.type === 'ConditionalExpression') return [...next('consequent'), ...next('alternate')]
  if (node.type === 'LogicalExpression') return [...next('left'), ...next('right')]
  const init = node.type === 'Identifier' ? constInit(node, source) : undefined
  return init ? resolve(init, source, depth + 1) : [node]
}

function cooked(quasi: Node): string {
  return (quasi.value as { cooked?: string | null } | undefined)?.cooked ?? ''
}

// A hole renders any literal as text, and every value the resolver cannot follow is HOLE, never dropped.
function holeTexts(expression: Node, source: SourceCode, depth: number): string[] {
  return resolve(expression, source, depth).flatMap((value) => {
    if (value.type === 'Literal') return [String(value.value)]
    return value.type === 'TemplateLiteral' ? templateTexts(value, source, depth + 1) : [HOLE]
  })
}

function templateTexts(node: Node, source: SourceCode, depth: number): string[] {
  const quasis = children(node, 'quasis').map(cooked)
  let results = [quasis[0] ?? '']
  for (const [index, expression] of children(node, 'expressions').entries()) {
    const values = holeTexts(expression, source, depth)
    // Bound conditional combinations so analysis stays cheap in the editor; real templates stay far below the bound.
    const parts = results.length * values.length <= MAX_COMBINATIONS ? values : [HOLE]
    results = results.flatMap((prefix) => parts.map((part) => prefix + part + quasis[index + 1]))
  }
  return results
}

// A non-string literal means no class or value, as cn and React treat it; anything the resolver cannot follow is HOLE.
export function texts(node: Node | undefined, source: SourceCode, depth = 0): string[] {
  return resolve(node, source, depth).flatMap((value) => {
    if (value.type === 'Literal') return typeof value.value === 'string' ? [value.value] : []
    return value.type === 'TemplateLiteral' ? templateTexts(value, source, depth + 1) : [HOLE]
  })
}

// `a && b` yields a only when a is falsy, and spreading a falsy value adds no property.
function falsyOperand(node: Node): boolean {
  const outer = outermost(node)
  const parent = child(outer, 'parent')
  return parent?.type === 'LogicalExpression' && parent.operator === '&&' && child(parent, 'left') === outer
}

// A value, such as a style or a spread, adds the properties of every object the resolver reaches; a primitive adds none,
// and any other value is one unknown property named HOLE, never dropped.
function entries(node: Node | undefined, source: SourceCode, depth = 0): Entry[] {
  return resolve(node, source, depth).flatMap((value) => {
    if (value.type === 'ObjectExpression') return children(value, 'properties').flatMap((property) => propertyEntries(property, source, depth))
    if (value.type === 'Literal' || (value.type === 'Identifier' && value.name === 'undefined') || falsyOperand(value)) return []
    return [{ node: value, name: HOLE, value: undefined }]
  })
}

function propertyEntries(property: Node, source: SourceCode, depth: number): Entry[] {
  if (property.type === 'SpreadElement') return entries(child(property, 'argument'), source, depth + 1)
  const name = property.type === 'Property' ? keyName(property) : undefined
  return name === undefined ? [] : [{ node: property, name, value: child(property, 'value') }]
}

function classTexts(node: Node | undefined, source: SourceCode, depth = 0): string[] {
  return resolve(node, source, depth).flatMap((value) => {
    if (value.type === 'ArrayExpression') return children(value, 'elements').flatMap((element) => classTexts(element, source, depth + 1))
    if (value.type === 'ObjectExpression') return entries(value, source, depth).map((entry) => entry.name)
    return texts(value, source, depth)
  })
}

function recipeTexts(call: Node, source: SourceCode): string[] {
  const [base, config] = children(call, 'arguments')
  const values: (Node | undefined)[] = [base]
  for (const { name, value } of entries(config, source)) {
    if (name === 'variants') values.push(...entries(value, source).flatMap((variant) => entries(variant.value, source)).map((choice) => choice.value))
    if (name !== 'compoundVariants') continue
    const items = resolve(value, source).flatMap((array) => children(array, 'elements'))
    values.push(...items.flatMap((item) => entries(item, source)).filter((entry) => entry.name === 'class' || entry.name === 'className').map((entry) => entry.value))
  }
  return values.flatMap((value) => classTexts(value, source))
}

// With partial, a token that holds an unknown interpolation stays, so its static text can still be checked.
export function classTokens(classes: string[], partial = false): string[] {
  return [...new Set(classes.flatMap((text) => text.split(/\s+/)))].filter((token) => token && (partial || !token.includes(HOLE)))
}

export function stylingVisitor(context: Rule.RuleContext, checkClasses: (node: Node, classes: string[]) => void, checkStyles: (styles: Entry[]) => void): Rule.RuleListener {
  const source = context.sourceCode
  return {
    JSXAttribute(raw: unknown) {
      const node = raw as Node
      const name = child(node, 'name')?.name
      if (name === 'className') checkClasses(node, classTexts(child(node, 'value'), source))
      if (name === 'style') checkStyles(entries(child(node, 'value'), source))
    },
    CallExpression(raw: unknown) {
      const node = raw as Node
      const callee = unwrap(child(node, 'callee'))
      const name = callee?.type === 'MemberExpression' ? keyName(callee) : callee?.name
      if (typeof name !== 'string' || !BUILDERS.has(name)) return
      checkClasses(node, name === 'cva' ? recipeTexts(node, source) : children(node, 'arguments').flatMap((argument) => classTexts(argument, source)))
    },
  }
}
