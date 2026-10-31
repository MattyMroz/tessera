import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { checkLayers } from './css-layers'

const fixtures = resolve(import.meta.dirname, 'fixtures')
const bad = checkLayers(resolve(fixtures, 'bad'))

function found(file: string): [string, string][] {
  return bad.filter((v) => v.file === file).map((v) => [v.text, v.rule])
}

it('finds no violation in the package source', () => {
  expect(checkLayers(resolve(import.meta.dirname, '../../src'))).toEqual([])
})

it('accepts every allowed form of each layer', () => {
  expect(checkLayers(resolve(fixtures, 'good'))).toEqual([])
})

it('rejects look, locals, fallbacks, numbers and !important in component declarations', () => {
  expect(found('components/button.css')).toEqual([
    ['border-radius: 8px', 'not a layout property'],
    ['background: #fff', 'not a layout property'],
    ['gap: 8px', 'literal value'],
    ['--button-height: 28px', 'not a layout property'],
    ['transition: opacity 150ms', 'not a layout property'],
    ['--_bg: hotpink', 'not a layout property'],
    ['--_gap: 13px', 'not a layout property'],
    ['width: var(--size-h, 999px)', 'not a layout property'],
    ['gap: var(--size-gap, 999px)', 'var() fallback'],
    ['display: none !important', '!important'],
    ['order: 99', 'literal value'],
    ['order: -5', 'literal value'],
    ['flex-grow: 1.5', 'literal value'],
    ['grid-template-columns: 37% 1fr', 'literal value'],
    ['gap: calc(var(--space-2) * 1.5)', 'function not allowed'],
    ['gap: var(--brand-gap)', 'variable not allowed'],
    ['padding-inline: var(--space-2)', 'not a layout property'],
    ['position: absolute', 'not a layout property'],
    ['min-width: 0', 'not a layout property'],
  ])
})

it('rejects every at-rule in component CSS except the components layer block', () => {
  expect(found('components/panel.css')).toEqual([
    ['@import "../styles/look.css"', 'at-rule not allowed'],
    ['@layer components, utilities', 'at-rule not allowed'],
    ['@media (min-width: 640px)', 'at-rule not allowed'],
    ['@container (min-width: 1px)', 'at-rule not allowed'],
    ['@supports (display: grid)', 'at-rule not allowed'],
    ['@keyframes pulse', 'at-rule not allowed'],
    ['@layer utilities', 'at-rule not allowed'],
  ])
})

it('rejects literals, foreign variables and fallbacks in recipes, also through --_* locals', () => {
  expect(found('recipes/control.css')).toEqual([
    ['padding: 0 12px', 'literal value'],
    ['color: var(--brand-blue)', 'variable not allowed'],
    ['--control-height: var(--size-h)', 'recipes declare only --_* variables'],
    ['--_c: var(--brand-blue)', 'variable not allowed'],
    ['--_h: 28px', 'literal value'],
    ['background: var(--color-surface, red)', 'var() fallback'],
    ['gap: calc(var(--space-2) * 1.5)', 'literal value'],
    ['transition: width var(--motion-fast)', 'literal value'],
    ['background: var(--color-surface) !important', '!important'],
    ['background: rgb(0 0 0)', 'function not allowed'],
    ['color: var(--in-accent)', 'variable not allowed'],
    ['hotpink', 'not a declaration'],
    ['@media (hover: hover)', 'at-rule not allowed'],
    ['@layer theme', 'at-rule not allowed'],
  ])
})

it('rejects foreign names, reads outside the engine graph and component styling in engines', () => {
  expect(found('engines/shape/shape.css')).toEqual([
    ['@property --color-k', 'name not owned by the engine'],
    ['color: red', 'not an @property descriptor'],
    ['--color-surface: #000', 'name not owned by the engine'],
    ['--shape-ring: var(--depth-shadow)', 'read outside the engine graph'],
    ['--shape-tint: var(--brand-blue)', 'read outside the engine graph'],
    ['--shape-cap: 1 !important', '!important'],
    ['border-radius: 9px', 'engines declare only variables'],
    ['.ts-button', 'selector not allowed'],
    ['@media (min-width: 640px)', 'at-rule not allowed'],
  ])
  expect(found('engines/color/color.css')).toEqual([
    ['--color-text: var(--type-size)', 'read outside the engine graph'],
    ['.ts-button', 'selector not allowed'],
    ['background: red', 'engines declare only variables'],
    ['border-radius: 9px', 'engines declare only variables'],
    ['transition: width 300ms', 'engines declare only variables'],
  ])
})

it('rejects anything but layer order and layer imports in styles', () => {
  expect(found('styles/look.css')).toEqual([
    ['@import "./extra.css"', 'styles hold only layer order and layer imports'],
    ['@import "tailwindcss"', 'styles hold only layer order and layer imports'],
    ['.ts-button', 'styles hold only layer order and layer imports'],
    ['background: red', 'styles hold only layer order and layer imports'],
    ['@layer components', 'styles hold only layer order and layer imports'],
  ])
})

it('rejects CSS outside the four layers and engines outside the graph', () => {
  const outside = bad.filter((v) => v.rule === 'CSS outside a layer').map((v) => v.file)
  expect(outside.toSorted()).toEqual(['engines/neon/neon.css', 'lib/theme.css', 'look.css'])
})
