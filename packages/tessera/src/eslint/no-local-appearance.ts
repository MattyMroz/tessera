import type { Rule } from 'eslint'
import { classTokens, HOLE, stylingVisitor } from './static-values'
import { appearanceProperty, arbitraryProperty, childVariant, layoutClass } from './style-policy'

export const noLocalAppearance: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep application appearance in Tessera components and variants.' },
    schema: [],
    messages: {
      class: '"{{value}}" is an appearance class. Use a Tessera component or variant; if it is layout, report it to Tessera.',
      arbitrary: 'Arbitrary property class "{{value}}" is not allowed. Use a named class.',
      child: '"{{value}}" styles the children of the element. A child takes its look from its own Tessera component or recipe.',
      style: 'Style "{{value}}" is not a layout property. Use a Tessera component or variant; if it is layout, report it to Tessera.',
    },
  },
  create(context) {
    return stylingVisitor(context, (node, classes) => {
      for (const value of classTokens(classes)) {
        if (childVariant(value)) context.report({ node, messageId: 'child', data: { value } })
        else if (!layoutClass(value)) context.report({ node, messageId: arbitraryProperty(value) ? 'arbitrary' : 'class', data: { value } })
      }
    }, (styles) => {
      for (const { node, name } of styles) {
        if (!appearanceProperty(name)) continue
        context.report({ node, messageId: 'style', data: { value: name === HOLE ? context.sourceCode.getText(node as unknown as Rule.Node) : name } })
      }
    })
  },
}
