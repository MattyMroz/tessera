import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Rule } from 'eslint'
import { child, children, HOLE, texts, unwrap } from './static-values'
import type { Node } from './static-values'

const STYLE_FILE = /\.(?:css|scss|sass|less|styl|pcss)(?:[?#].*)?$/i
const PACKAGE = /^(?:@[a-z\d][\w.-]*\/)?[a-z\d][\w.-]*(?:\/|$)/i
const REMOTE = /^(?:https?:)?\/\//i
const TESSERA = '@mattymroz/tessera/tessera.css'
const ENTRY_IMPORTS: ReadonlySet<string> = new Set(['tailwindcss', TESSERA, '@mattymroz/tessera/tailwind.css'])
const IMPORT = /@import[\t ]*(["'])([^"'\r\n]*)\1[\t ]*;/g
const known = (values: string[]) => values.filter((value) => !value.startsWith(HOLE))

function entry(css: string): boolean {
  const imports = [...css.matchAll(IMPORT)].map((match) => match[2] ?? '')
  return css.replace(IMPORT, '').trim() === ''
    && imports.includes(TESSERA)
    && new Set(imports).size === imports.length
    && imports.every((name) => ENTRY_IMPORTS.has(name))
}

export const noLocalCss: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Import Tessera CSS directly or through a CSS entry instead of local style files.' },
    schema: [],
    messages: {
      css: 'Local CSS is not allowed. A local CSS entry holds only @import of tailwindcss, @mattymroz/tessera/tessera.css and @mattymroz/tessera/tailwind.css, each once and with tessera.css.',
      style: '<style> is not allowed. Use a Tessera component or variant.',
    },
  },
  create(context) {
    const isEntry = (specifier: string) => {
      if (!specifier.startsWith('.')) return false
      try {
        return entry(readFileSync(resolve(dirname(context.physicalFilename), specifier.replace(/[?#].*/, '')), 'utf8'))
      } catch {
        return false
      }
    }
    const check = (node: Node, source: Node | undefined) => {
      const local = known(texts(source, context.sourceCode)).some((specifier) => STYLE_FILE.test(specifier) && !PACKAGE.test(specifier.replace(/[?#].*/, '')) && !isEntry(specifier))
      if (local) context.report({ node, messageId: 'css' })
    }
    const attribute = (element: Node, name: string) => {
      const found = children(element, 'attributes').find((item) => child(item, 'name')?.name === name)
      return texts(child(found, 'value'), context.sourceCode)
    }
    return {
      'ImportDeclaration, ExportAllDeclaration, ExportNamedDeclaration'(raw: unknown) {
        check(raw as Node, child(raw as Node, 'source'))
      },
      ImportExpression(raw: unknown) {
        check(raw as Node, child(raw as Node, 'source'))
      },
      TSExternalModuleReference(raw: unknown) {
        check(raw as Node, child(raw as Node, 'expression'))
      },
      CallExpression(raw: unknown) {
        const node = raw as Node
        if (unwrap(child(node, 'callee'))?.name === 'require') check(node, children(node, 'arguments')[0])
      },
      JSXOpeningElement(raw: unknown) {
        const node = raw as Node
        const name = child(node, 'name')?.name
        if (name === 'style') context.report({ node, messageId: 'style' })
        if (name !== 'link' || !attribute(node, 'rel').some((rel) => rel.toLowerCase().split(/\s+/).includes('stylesheet'))) return
        if (known(attribute(node, 'href')).some((href) => !REMOTE.test(href))) context.report({ node, messageId: 'css' })
      },
    }
  },
}
