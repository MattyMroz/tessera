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

it('accepts every allowed form of each layer with the listed exceptions and vendor variables', () => {
  expect(checkLayers(resolve(fixtures, 'good'))).toEqual([])
})

it('rejects look, vendor prefixes, variables other than space and gap, fallbacks, numbers, own focus, selectors outside the component and unlayered rules in components', () => {
  expect(found('components/button.css')).toEqual([
    ['border-radius: 8px', 'not a layout property'],
    ['background: #fff', 'not a layout property'],
    ['gap: 8px', 'literal value'],
    ['--button-height: 28px', 'not a layout property'],
    ['transition: opacity 150ms', 'not a layout property'],
    ['--_bg: hotpink', 'not a layout property'],
    ['--_gap: 13px', 'not a layout property'],
    ['gap: var(--_gap)', 'variable not allowed'],
    ['width: var(--ts-size-height, 999px)', 'not a layout property'],
    ['gap: var(--ts-size-gap, 999px)', 'var() fallback'],
    ['display: none !important', '!important'],
    ['order: 99', 'literal value'],
    ['order: -5', 'literal value'],
    ['flex-grow: 1.5', 'literal value'],
    ['grid-template-columns: 37% 1fr', 'literal value'],
    ['gap: calc(var(--ts-space-inset) * 1.5)', 'function not allowed'],
    ['gap: var(--brand-gap)', 'variable not allowed'],
    ['gap: var(--space-inset)', 'variable not allowed'],
    ['gap: var(--ts-in-space-density)', 'variable not allowed'],
    ['gap: var(--_ts-space-step)', 'variable not allowed'],
    ['padding-inline: var(--ts-space-inset)', 'not a layout property'],
    ['position: absolute', 'not a layout property'],
    ['min-width: 0', 'not a layout property'],
    ['flex-basis: var(--ts-size-height)', 'variable not allowed'],
    ['grid-template-columns: var(--ts-shape-surface) 1fr', 'variable not allowed'],
    ['row-gap: var(--ts-size-gap-x)', 'variable not allowed'],
    ['-webkit-box-ordinal-group: 1', 'vendor-prefixed property'],
    ['-ms-flex-order: 1', 'vendor-prefixed property'],
    ["[data-component='button']:focus-visible", 'selector not allowed'],
    ["[data-component='button'] > *", 'selector not allowed'],
    ['*, ::before', 'selector not allowed'],
    ["[data-recipe='control']", 'selector outside the component'],
    ['button', 'selector outside the component'],
    ["[data-component='panel']", 'selector outside the component'],
    ["[data-component='button-group']", 'selector outside the component'],
    ["[data-slot='icon']", 'selector outside the component'],
    ["[data-component='button'] ~ [data-component='button']", 'sibling combinator in a selector'],
    [":root [data-component='button']", 'page root in a selector'],
    ["& + [data-component='button']", 'sibling combinator in a selector'],
    ['& > div', 'selector outside the component'],
    [':has(> &)', 'selector outside the component'],
    ["[data-component='button']", 'rule outside @layer components'],
  ])
})

it('rejects every at-rule in component CSS except the top-level components layer block and a container query on a listed width', () => {
  expect(found('components/panel.css')).toEqual([
    ['@import "../styles/look.css"', 'at-rule not allowed'],
    ['@layer components, utilities', 'at-rule not allowed'],
    ['@media (min-width: 640px)', 'at-rule not allowed'],
    ["[data-component='panel']", 'rule outside @layer components'],
    ['@container (min-width: 1px)', 'at-rule not allowed'],
    ['@supports (display: grid)', 'at-rule not allowed'],
    ['@keyframes pulse', 'at-rule not allowed'],
    ['@layer utilities', 'at-rule not allowed'],
    ['@container (inline-size < 500px)', 'container condition outside CONTAINER_WIDTHS'],
    ['@container (inline-size <= 400px)', 'container condition outside CONTAINER_WIDTHS'],
    ['@container panel (inline-size < 400px)', 'container condition outside CONTAINER_WIDTHS'],
    ['@layer components', 'at-rule not allowed'],
  ])
})

it('rejects literals other than 0, 1, -1 and 100%, non-compositor motion, vendor prefixes, literal sums and arithmetic on literal locals, foreign selectors and variables, fallbacks, other media, other supports conditions, non-clip properties under the clip condition, a clip condition that clips nothing and unlayered rules in recipes', () => {
  expect(found('recipes/control.css')).toEqual([
    ['padding: 0 12px', 'literal value'],
    ['color: var(--brand-blue)', 'variable not allowed'],
    ['--control-height: var(--ts-size-height)', 'recipes declare only --_* variables'],
    ['--ts-control-height: var(--ts-size-height)', 'recipes declare only --_* variables'],
    ['--_ts-control-height: var(--ts-size-height)', 'recipes declare only --_* variables'],
    ['--_c: var(--brand-blue)', 'variable not allowed'],
    ['--_h: 28px', 'literal value'],
    ['background: var(--ts-color-background, red)', 'var() fallback'],
    ['gap: calc(var(--ts-space-inset) * 1.5)', 'literal value'],
    ['opacity: 0.5', 'literal value'],
    ['z-index: 2', 'literal value'],
    ['width: 50%', 'literal value'],
    ['transition: width var(--ts-motion-duration-fast)', 'motion of a non-compositor property'],
    ['background: var(--ts-color-background) !important', '!important'],
    ['background: rgb(0 0 0)', 'function not allowed'],
    ['color: var(--ts-in-color-accent)', 'variable not allowed'],
    ['color: var(--_ts-color-tint)', 'variable not allowed'],
    ['color: var(--color-tint)', 'variable not allowed'],
    ["font-family: ''", 'literal value'],
    ["content: 'x'", 'literal value'],
    ['hotpink', 'not a declaration'],
    [
      'transition: top var(--ts-motion-duration-fast) var(--ts-motion-ease-out), left var(--ts-motion-duration-fast) var(--ts-motion-ease-out)',
      'motion of a non-compositor property',
    ],
    ['transition: all var(--ts-motion-duration-fast)', 'motion of a non-compositor property'],
    ['transition: opacity var(--_fast)', 'variable not allowed'],
    ['transition-property: opacity, left', 'motion of a non-compositor property'],
    ['will-change: width', 'motion of a non-compositor property'],
    ['width: opacity', 'literal value'],
    ['z-index: calc(1 + 1 + 1)', 'more than one literal in an expression'],
    ['width: calc(var(--ts-size-height) * (1 + 1 + 1))', 'more than one literal in an expression'],
    ['opacity: calc(1 / (1 + 1))', 'more than one literal in an expression'],
    ['width: min(100%, 100%)', 'more than one literal in an expression'],
    ['body', 'page root in a selector'],
    ['*', 'selector outside the recipe'],
    [':root', 'page root in a selector'],
    ["[data-recipe='control'], button", 'selector outside the recipe'],
    ["[data-recipe='surface']", 'selector outside the recipe'],
    ['[data-focus]', 'selector outside the recipe'],
    ["[data-recipe-x='control']", 'selector outside the recipe'],
    ['-webkit-transition: top var(--ts-motion-duration-fast) var(--ts-motion-ease-out)', 'vendor-prefixed property'],
    ['-moz-transition: opacity var(--ts-motion-duration-fast)', 'vendor-prefixed property'],
    ['-webkit-box-shadow: var(--ts-depth-glow)', 'vendor-prefixed property'],
    ['--_two: calc(var(--_one) + 1)', 'arithmetic on a --_* variable built from a literal'],
    ['--_three: calc(var(--_one) + var(--_one) + var(--_one))', 'arithmetic on a --_* variable built from a literal'],
    ['z-index: calc(var(--_two) + 1)', 'arithmetic on a --_* variable built from a literal'],
    ['width: calc(var(--ts-size-height) * var(--_three))', 'arithmetic on a --_* variable built from a literal'],
    ['height: calc(var(--ts-size-height) * var(--_copy))', 'arithmetic on a --_* variable built from a literal'],
    ['margin: max(var(--_copy), var(--ts-space-inset))', 'arithmetic on a --_* variable built from a literal'],
    ["[data-recipe='control'] ~ *", 'sibling combinator in a selector'],
    ["[data-recipe='control'] + [data-recipe='control']", 'sibling combinator in a selector'],
    [":root:has([data-recipe='control'])", 'page root in a selector'],
    ["html [data-recipe='control']", 'page root in a selector'],
    ["body > [data-recipe='control']", 'page root in a selector'],
    ["[data-slot='icon']", 'selector outside the recipe'],
    [":has(> [data-recipe='indicator'])", 'selector outside the recipe'],
    ['& ~ body', 'sibling combinator in a selector'],
    ['& + &', 'sibling combinator in a selector'],
    ['& > div', 'selector outside the recipe'],
    ["& [data-recipe='surface']", 'selector outside the recipe'],
    [':has(> &)', 'selector outside the recipe'],
    ['& > svg > path', 'selector outside the recipe'],
    ['@media (hover: none)', 'at-rule not allowed'],
    ['@media (min-width: 640px)', 'at-rule not allowed'],
    ['@media (hover: hover) and (pointer: fine)', 'at-rule not allowed'],
    ['@supports (overflow-clip-margin: 1px)', 'at-rule not allowed'],
    ['opacity: 0', 'not a clip property in @supports'],
    ['@layer theme', 'at-rule not allowed'],
    ["[data-recipe='control']", 'rule outside @layer components'],
    ['@media (hover: hover)', 'at-rule not allowed'],
    ["[data-recipe='control']:hover", 'rule outside @layer components'],
    ['@layer theme', 'at-rule not allowed'],
    ["[data-recipe='control'] > [data-slot='icon'] > svg", 'unused selector exception'],
    ["[data-recipe='control'] > [data-slot='busy'] > svg", 'unused selector exception'],
    ["[data-recipe='control'] > [data-slot='icon'][data-dot] > svg", 'unused selector exception'],
    ["[data-recipe='control'] > [data-slot='mark'] > svg", 'unused selector exception'],
    ["[data-recipe='control'][aria-haspopup='listbox'] > [data-slot='icon']:last-child > svg", 'unused selector exception'],
    ["[data-recipe='control'][aria-haspopup='listbox'][data-popup-open] > [data-slot='icon']:last-child > svg", 'unused selector exception'],
    ["[data-slot='choice']:has(> [data-recipe='control'])", 'unused selector exception'],
    [
      "[data-recipe='control']:where(button:not([role]), [role='button'], [data-slot='box'], [data-slot='track'], a[href]:not([role]), [aria-haspopup='listbox'], [data-variant='field']):not(:hover, [data-pressing], [aria-expanded='true'], [data-popup-open], [aria-pressed='true'], [aria-selected='true'])::before",
      'unused value exception',
    ],
    [
      "[data-recipe='control']:where(button:not([role]), [role='button'], [data-slot='box'], a[href]:not([role])):not(:disabled, [data-disabled], [aria-disabled='true'], [aria-busy='true'], [data-variant='field'], [aria-haspopup='listbox'], [data-surface='joined'] > *):is([aria-haspopup], [aria-expanded], [data-popup-open], [data-tooltip-trigger]):not(:hover, [data-pressing], [aria-expanded='true'], [data-popup-open], [aria-pressed='true'], [aria-selected='true'])::before",
      'unused value exception',
    ],
    ["[data-slot='choice']:has(> [data-recipe='control'])", 'unused value exception'],
    ['(overflow-clip-margin: border-box)', 'unused supports condition'],
  ])
})

it('rejects color-mix outside oklab, system colors outside forced colors, unlisted vendor variables and instance keys, other functions, keyframe names, @starting-style, unlisted container widths and non-layout properties in a container query in recipes', () => {
  expect(found('recipes/surface.css')).toEqual([
    ['background: color-mix(in srgb, var(--ts-color-background) calc(var(--ts-state-tint-rest) * 100%), transparent)', 'color-mix outside in oklab'],
    ['color: color-mix(var(--ts-color-label), transparent)', 'color-mix outside in oklab'],
    ['color: CanvasText', 'system color outside @media (forced-colors: active)'],
    ['border-color: Highlight', 'system color outside @media (forced-colors: active)'],
    ['max-block-size: var(--anchor-height)', 'variable not allowed'],
    ['inline-size: var(--ts-i-other)', 'variable not allowed'],
    ['animation-timing-function: linear(0, 1)', 'function not allowed'],
    ['animation: ts-spin var(--ts-motion-loop) linear infinite', 'literal value'],
    ['box-shadow: inset 0 0 0 var(--ts-shape-stroke) var(--ts-color-danger)', 'literal value'],
    ['@starting-style', 'at-rule not allowed'],
    ['@container (inline-size < 500px)', 'container condition outside CONTAINER_WIDTHS'],
    ['padding: 0', 'not a layout property in @container'],
    ['@container card (inline-size < 400px)', 'container condition outside CONTAINER_WIDTHS'],
    ['@container (min-width: 400px)', 'container condition outside CONTAINER_WIDTHS'],
    ['@media (forced-colors: none)', 'at-rule not allowed'],
    ['@keyframes ts-spin', 'at-rule not allowed'],
    ['@media (forced-colors: active)', 'at-rule not allowed'],
    ["[data-recipe='surface']", 'rule outside @layer components'],
    ["[data-side]:has(> [data-recipe='surface'][data-level='overlay'])", 'unused selector exception'],
    ["[data-recipe='surface'] > [data-slot='icon'] > svg", 'unused selector exception'],
    [":root:has(> [data-recipe='surface'][data-variant='page'])", 'unused selector exception'],
    ["[data-recipe='surface'][data-variant='tooltip']", 'unused value exception'],
    ["[data-recipe='surface'][data-variant='tooltip'][data-open]", 'unused value exception'],
    ["[data-recipe='surface'][data-variant='tooltip'] [data-slot='label']", 'unused value exception'],
  ])
})

it('accepts a literal --_level only under the listed aria-level rules, keeps every other literal level out of arithmetic and the clip condition out of every recipe but control', () => {
  expect(found('recipes/row.css')).toEqual([
    ['padding-inline-start: calc(var(--ts-shape-control-side) + var(--_level) * var(--ts-space-indent))', 'arithmetic on a --_* variable built from a literal'],
    ['--_level: 7', 'literal value'],
    ['--_level: 2', 'literal value'],
    ['@supports (overflow-clip-margin: border-box)', 'at-rule not allowed'],
    ["[data-recipe='row'] [data-slot='icon'] > svg", 'unused selector exception'],
    ["[data-recipe='row'] > [data-slot='mark'] > svg", 'unused selector exception'],
    ["[data-recipe='row'][aria-level='7']", 'unused value exception'],
  ])
})

it('rejects a vendor variable from the list that no recipe reads', () => {
  expect(found('recipes')).toEqual([
    ['--available-height', 'unused vendor variable'],
    ['--available-width', 'unused vendor variable'],
  ])
})

it('rejects foreign names, reads outside the engine graph, other selectors and conditions, and unlayered rules in engines', () => {
  expect(found('engines/shape.css')).toEqual([
    ['@property --ts-color-k', 'name not owned by the engine'],
    ['color: red', 'not an @property descriptor'],
    ['@property --ts-in-color-k', 'name not owned by the engine'],
    ['--ts-color-surface: #000', 'name not owned by the engine'],
    ['--ts-in-color-accent: 1', 'name not owned by the engine'],
    ['--_ts-color-step: 1', 'name not owned by the engine'],
    ['--_shape-step: 1', 'name not owned by the engine'],
    ['--shape-control: 1', 'name not owned by the engine'],
    ['--ts-shape-ring: var(--ts-depth-shadow)', 'read outside the engine graph'],
    ['--ts-shape-tint: var(--brand-blue)', 'read outside the engine graph'],
    ['--ts-shape-mix: var(--_ts-size-step)', 'read outside the engine graph'],
    ['--ts-shape-pick: var(--ts-in-size-scale)', 'read outside the engine graph'],
    ['--ts-shape-cap: 1 !important', '!important'],
    ['border-radius: 9px', 'engines declare only variables'],
    ['.ts-button', 'selector not allowed'],
    ['button', 'selector not allowed'],
    [':root:not(.dark)', 'selector not allowed'],
    ['[data-corners]:hover', 'selector not allowed'],
    ['@supports (corner-shape: superellipse(2)) or (display: grid)', 'at-rule not allowed'],
    ['@media (prefers-reduced-motion: reduce) and (min-width: 1px)', 'at-rule not allowed'],
    ['@media not (pointer: coarse)', 'at-rule not allowed'],
    ['@media (corner-shape: superellipse(2))', 'at-rule not allowed'],
    ['@layer theme', 'at-rule not allowed'],
    ['@property --ts-shape-nested', 'at-rule not allowed'],
    ['@media (min-width: 640px)', 'at-rule not allowed'],
    [':root', 'rule outside @layer theme'],
    ['@supports (corner-shape: superellipse(2))', 'at-rule not allowed'],
    [':root', 'rule outside @layer theme'],
    ['@font-face', '@font-face outside the type engine'],
    ['@keyframes ts-spin', '@keyframes outside the motion engine'],
    ['@property --ts-i-value', 'name not owned by the engine'],
  ])
  expect(found('engines/color.css')).toEqual([
    ['--ts-color-label: var(--ts-type-body-size)', 'read outside the engine graph'],
    ['.ts-button', 'selector not allowed'],
    ['background: red', 'engines declare only variables'],
    ['border-radius: 9px', 'engines declare only variables'],
    ['transition: width 300ms', 'engines declare only variables'],
  ])
})

it('accepts only the listed keyframes at the top of the motion engine, with frame selectors and compositor properties', () => {
  expect(found('engines/motion.css')).toEqual([
    ['@keyframes ts-bounce', 'keyframes name not listed'],
    ['width: 0', 'non-compositor property in @keyframes'],
    ['half', 'keyframe selector not allowed'],
    ['rotate: 1turn !important', '!important'],
    ['opacity: var(--ts-size-height)', 'read outside the engine graph'],
    ['@keyframes ts-sweep', 'at-rule not allowed'],
  ])
})

it('registers only the instance keys in the size engine', () => {
  expect(found('engines/size.css')).toEqual([['@property --ts-i-extra', 'name not owned by the engine']])
})

it('accepts only the listed @font-face descriptors at the top of the type engine', () => {
  expect(found('engines/type.css')).toEqual([
    ["font-feature-settings: 'ss01'", 'not a @font-face descriptor'],
    ['color: red', 'not a @font-face descriptor'],
    ['@font-face', 'at-rule not allowed'],
  ])
})

it('rejects another layer order, a missing import of a layer file and anything but layer imports and the listed font imports in tessera.css', () => {
  expect(found('styles/tessera.css')).toEqual([
    ['@layer utilities, components, base, theme, extra', 'layer order is theme, base, components, utilities'],
    ['@import "../recipes/control.css" layer(components)', 'tessera.css holds only layer order and imports'],
    ['@import "./extra.css"', 'tessera.css holds only layer order and imports'],
    ['@import "../lib/theme.css"', 'tessera.css holds only layer order and imports'],
    ['@import url("../engines/shape.css")', 'tessera.css holds only layer order and imports'],
    ['@import "tailwindcss"', 'tessera.css holds only layer order and imports'],
    ['@import "@fontsource-variable/inter"', 'tessera.css holds only layer order and imports'],
    ['@import "@fontsource-variable/inter/wght-italic.css"', 'tessera.css holds only layer order and imports'],
    ['.ts-button', 'tessera.css holds only layer order and imports'],
    ['background: red', 'tessera.css holds only layer order and imports'],
    ['@layer components', 'tessera.css holds only layer order and imports'],
    ['theme, base, components, utilities', 'tessera.css opens with the layer order'],
    ['components/button.css', 'import missing from tessera.css'],
    ['components/panel.css', 'import missing from tessera.css'],
    ['engines/color.css', 'import missing from tessera.css'],
    ['engines/motion.css', 'import missing from tessera.css'],
    ['engines/size.css', 'import missing from tessera.css'],
    ['engines/type.css', 'import missing from tessera.css'],
    ['recipes/control.css', 'import missing from tessera.css'],
    ['recipes/row.css', 'import missing from tessera.css'],
    ['recipes/surface.css', 'import missing from tessera.css'],
  ])
})

it('rejects anything but @theme inline bridges to engine outputs in tailwind.css', () => {
  expect(found('styles/tailwind.css')).toEqual([
    ['@import "tailwindcss"', 'tailwind.css holds only @theme inline bridges'],
    ['--spacing-card: 16px', 'tailwind.css holds only @theme inline bridges'],
    ['--color-brand: var(--brand-blue)', 'tailwind.css holds only @theme inline bridges'],
    ['--spacing-density: var(--ts-in-space-density)', 'tailwind.css holds only @theme inline bridges'],
    ['--spacing-double: calc(var(--ts-space-card) * 2)', 'tailwind.css holds only @theme inline bridges'],
    ['--spacing-safe: var(--ts-space-card, 1px)', 'tailwind.css holds only @theme inline bridges'],
    ['gap: var(--ts-space-inset)', 'tailwind.css holds only @theme inline bridges'],
    ['@theme', 'tailwind.css holds only @theme inline bridges'],
    ['--spacing-group: var(--ts-space-group)', 'tailwind.css holds only @theme inline bridges'],
    ['.ts-gap', 'tailwind.css holds only @theme inline bridges'],
    ['gap: var(--ts-space-inset)', 'tailwind.css holds only @theme inline bridges'],
  ])
})

it('rejects CSS outside the four layers, other style files and engines outside the graph or in a folder', () => {
  const outside = bad.filter((v) => v.rule === 'CSS outside a layer').map((v) => v.file)
  expect(outside.toSorted()).toEqual(['engines/neon.css', 'engines/shape/shape.css', 'lib/theme.css', 'look.css', 'styles/look.css'])
})
