import ts from 'typescript'

export type SourceProblem = { readonly line: number; readonly rule: string; readonly text: string }

const LETTER = /\p{L}/u
const CAPITAL = /^\p{Lu}/u
const TEXT_ATTRIBUTES: ReadonlySet<string> = new Set([
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'aria-placeholder',
  'title',
  'placeholder',
  'alt',
  'label',
])
const LABEL_NAME = /(?:label|text|title|placeholder|description|caption)$/i
const FALLBACKS: ReadonlySet<ts.SyntaxKind> = new Set([ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken])
const INTERACTIVE_TAGS: ReadonlySet<string> = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary'])
const INTERACTIVE_ROLES: ReadonlySet<string> = new Set([
  'button',
  'link',
  'checkbox',
  'radio',
  'radiogroup',
  'switch',
  'tab',
  'tablist',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'listbox',
  'combobox',
  'textbox',
  'slider',
  'spinbutton',
  'tree',
  'treeitem',
  'grid',
  'gridcell',
  'toolbar',
])

function isText(node: ts.Node): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && LETTER.test(node.text)
}

function attributeName(attribute: ts.JsxAttribute): string {
  return attribute.name.getText()
}

function stringAttribute(element: ts.JsxOpeningLikeElement, name: string): string | undefined {
  for (const property of element.attributes.properties) {
    if (!ts.isJsxAttribute(property) || attributeName(property) !== name) continue
    const value = property.initializer
    if (value && ts.isStringLiteral(value)) return value.text
  }
  return undefined
}

function nameOf(node: ts.BindingName | ts.PropertyName | undefined): string {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : ''
}

function lastName(node: ts.Expression): string {
  if (ts.isIdentifier(node)) return node.text
  return ts.isPropertyAccessExpression(node) ? node.name.text : ''
}

export function componentSourceProblems(source: string, file = 'component.tsx'): SourceProblem[] {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const problems: SourceProblem[] = []
  const report = (node: ts.Node, rule: string): void => {
    problems.push({ line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, rule, text: node.getText().slice(0, 80) })
  }
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node) && LETTER.test(node.text)) report(node, 'UI text in JSX')
    if (ts.isJsxExpression(node) && node.expression && isText(node.expression) && !ts.isJsxAttribute(node.parent)) report(node, 'UI text in JSX')
    if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(attributeName(node))) {
      const value = node.initializer
      const literal = value && ts.isJsxExpression(value) ? value.expression : value
      if (literal && isText(literal)) report(node, 'UI text in a text attribute')
    }
    if (ts.isBinaryExpression(node) && FALLBACKS.has(node.operatorToken.kind) && isText(node.right) && (LABEL_NAME.test(lastName(node.left)) || CAPITAL.test(node.right.text)))
      report(node, 'UI text as a fallback')
    if ((ts.isBindingElement(node) || ts.isParameter(node)) && node.initializer && isText(node.initializer)) {
      const name = nameOf(ts.isBindingElement(node) ? (node.propertyName ?? node.name) : node.name)
      if (LABEL_NAME.test(name)) report(node, 'UI text as a default value')
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText()
      const clickable = node.attributes.properties.some((property) => ts.isJsxAttribute(property) && attributeName(property) === 'onClick')
      const role = stringAttribute(node, 'role')
      const intrinsic = /^[a-z]/.test(tag)
      if (clickable && intrinsic && !INTERACTIVE_TAGS.has(tag) && !(role && INTERACTIVE_ROLES.has(role))) report(node, 'onClick on a non-interactive element')
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return problems
}

const CONTEXT_READERS: ReadonlySet<string> = new Set(['useHost', 'usePart'])

function enclosingFunction(node: ts.Node): string {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isFunctionDeclaration(parent)) return parent.name?.text ?? ''
  }
  return ''
}

export function hostContextProblems(source: string, optional: ReadonlySet<string>, file = 'module.tsx'): SourceProblem[] {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const problems: SourceProblem[] = []
  const report = (node: ts.Node, rule: string): void => {
    problems.push({ line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, rule, text: node.getText().slice(0, 80) })
  }
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const [argument] = node.arguments
      const name = node.expression.text
      if (name === 'createContext' && argument?.kind !== ts.SyntaxKind.NullKeyword) report(node, 'context with a default value')
      if (name === 'use' && argument && ts.isIdentifier(argument) && !optional.has(argument.text) && !CONTEXT_READERS.has(enclosingFunction(node)))
        report(node, 'context read outside useHost')
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return problems
}
