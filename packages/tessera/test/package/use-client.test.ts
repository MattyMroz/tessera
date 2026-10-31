import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { relative, resolve } from 'node:path'
import ts from 'typescript'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { filesIn, packageDir } from './helpers'

const HOOK = /^use(?:[A-Z]|$)/
const HANDLER = /^on[A-Z]/

const button = `({ label, onPick }: { label: string; onPick: (label: string) => void }) {
  return <button onClick={() => onPick(label)}>{label}</button>
}
`
const format = `export function format(value: number): string {
  return value.toFixed(2)
}
`
const fixture: Record<string, string> = {
  'button.tsx': `export function Button${button}`,
  'client-button.tsx': `'use client'\nexport function ClientButton${button}`,
  'label.tsx': 'export function Label({ text }: { text: string }) {\n  return <span title={text}>{text}</span>\n}\n',
  'use-open.ts': "import { useState } from 'react'\nexport function useOpen() {\n  return useState(false)\n}\n",
  'handlers.ts': 'export function handlers(pick: () => void) {\n  return { onClick: pick }\n}\n',
  'format.ts': format,
  'client-format.ts': `'use client'\n${format}`,
}

let fixtureDir = ''

beforeAll(() => {
  fixtureDir = mkdtempSync(resolve(tmpdir(), 'tessera-use-client-'))
  mkdirSync(resolve(fixtureDir, 'src'))
  writeFileSync(resolve(fixtureDir, 'package.json'), JSON.stringify({ type: 'module', peerDependencies: { react: '*' } }))
  for (const [name, code] of Object.entries(fixture)) writeFileSync(resolve(fixtureDir, 'src', name), code)
  const result = spawnSync('node', ['--input-type=module', '--eval', `
    import { build } from 'tsdown';
    const [config, cwd] = process.argv.slice(-2);
    await build({ config, cwd, logLevel: 'error' });
  `, resolve(packageDir, 'tsdown.config.ts'), fixtureDir], { cwd: packageDir, encoding: 'utf8', timeout: 60_000 })
  expect(result.error).toBeUndefined()
  expect(result.status, result.stdout + result.stderr).toBe(0)
}, 60_000)

afterAll(() => {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
}

function hasClientDirective(source: ts.SourceFile): boolean {
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) return false
    if (statement.expression.text === 'use client') return true
  }
  return false
}

function importsOf(source: ts.SourceFile): string[] {
  return source.statements.flatMap((statement) =>
    ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) ? [statement.moduleSpecifier.text] : [],
  )
}

function calleeName(callee: ts.Expression): string {
  if (ts.isIdentifier(callee)) return callee.text
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text
  return ''
}

function isHandlerProperty(node: ts.Node): boolean {
  if (!ts.isPropertyAssignment(node) && !ts.isShorthandPropertyAssignment(node) && !ts.isMethodDeclaration(node)) return false
  if (!ts.isObjectLiteralExpression(node.parent)) return false
  return (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && HANDLER.test(node.name.text)
}

function needsClient(source: ts.SourceFile): boolean {
  if (importsOf(source).includes('react/compiler-runtime')) return true
  const visit = (node: ts.Node): boolean => {
    if (ts.isCallExpression(node) && HOOK.test(calleeName(node.expression))) return true
    if (isHandlerProperty(node)) return true
    return ts.forEachChild(node, visit) === true
  }
  return visit(source)
}

function misplacedDirectives(directory: string): string[] {
  const modules = filesIn(directory, /\.js$/)
  expect(modules.length, directory).toBeGreaterThan(0)
  return modules
    .filter((file) => {
      const source = parse(file)
      return hasClientDirective(source) !== needsClient(source)
    })
    .map((file) => relative(directory, file).replaceAll('\\', '/'))
}

it('marks exactly the dist modules that use hooks, handlers or the compiler runtime as client modules', () => {
  expect(misplacedDirectives(resolve(packageDir, 'dist'))).toEqual([])
})

it('flags every fixture module whose use-client directive is missing or needless', () => {
  expect(misplacedDirectives(resolve(fixtureDir, 'dist'))).toEqual(['button.js', 'client-format.js', 'handlers.js', 'label.js', 'use-open.js'])
})

it('compiles components with React Compiler in the package build', () => {
  expect(importsOf(parse(resolve(fixtureDir, 'dist/button.js')))).toContain('react/compiler-runtime')
  expect(importsOf(parse(resolve(fixtureDir, 'dist/label.js')))).toContain('react/compiler-runtime')
})
