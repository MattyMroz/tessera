import type { Rule } from 'eslint'
import { classTokens, HOLE, stylingVisitor } from './static-values'
import { classColor, unsafeValue } from './style-policy'

export const noLiteralColors: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Use Tessera variants instead of palette colors and arbitrary values outside plain layout lengths.' },
    schema: [],
    messages: {
      color: 'Literal color "{{value}}" is not a Tessera role. Use a Tessera variant.',
      value: '"{{value}}" has an arbitrary value outside plain layout lengths. Use a Tessera class or variant; a real need gets an eslint-disable comment with the reason.',
    },
  },
  create(context) {
    return stylingVisitor(context, (node, classes) => {
      for (const token of classTokens(classes, true)) {
        const known = token.replaceAll(HOLE, '0')
        if (unsafeValue(known)) context.report({ node, messageId: 'value', data: { value: token.replaceAll(HOLE, '${…}') } })
        const color = classColor(known)
        if (color) context.report({ node, messageId: 'color', data: { value: color } })
      }
    }, () => {})
  },
}
