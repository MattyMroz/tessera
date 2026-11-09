import * as parser from '@typescript-eslint/parser'
import { RuleTester } from '@typescript-eslint/rule-tester'
import type { Rule } from 'eslint'
import { afterAll, describe, it } from 'vitest'
import { componentAppearance } from './component-appearance.ts'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({ languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } } })

const testRule = (rule: Rule.RuleModule) => rule as unknown as Parameters<RuleTester['run']>[1]

tester.run('component-appearance', testRule(componentAppearance), {
  valid: [
    '<Primitive.Root data-recipe="control" data-variant={variant} data-size={size} {...props} />',
    '<span data-slot="icon" aria-hidden>{icon}</span>; clsx("flex"); <Model modelClassName="x" />',
    '<div data-slot="fill" style={{ "--ts-i-value": value, ["--ts-i-inline-size"]: `${size}px`, \'--ts-i-block-size\': size } as const} />',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"><path d="M4 12h16" /><circle cx={12} cy={12} r={4} fill="currentColor" /><polyline points="4 4 8 8" />{steps.map((step) => <rect x={2} y={step * 2} style={{ "--ts-i-value": step }} />)}</svg>',
    'type HeadingProps = { level: 1 | 2 | 3 | 4 }; function Heading({ level }: HeadingProps) { const Tag = `h${level}` as const; return <Tag tabIndex={-1} data-first={items.at(0)} data-last={items.at(-1)} /> }',
    'type Pair = [2, 3]; type Offset = 2 | -2; const box = <svg viewBox="0 0 24 24"><circle r={9} /></svg>',
    '<svg data-slot="arrow" viewBox="-16 -16 32 32" fill="currentColor"><path d="M0 0" /></svg>',
    '<Menu.Indicator render={<svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16" /></svg>} />; <path d="M4 12h16" stroke="currentColor" />; <span {...{ "data-slot": "icon", style: { "--ts-i-value": 1 } }} />',
  ],
  invalid: [
    { code: '<div className="ts-toggle-group" />', errors: [{ messageId: 'component', data: { value: 'className' } }] },
    { code: '<div className="flex gap-2" style={{ display: "flex" }} />', errors: [{ messageId: 'component', data: { value: 'className' } }, { messageId: 'instance', data: { value: 'display' } }] },
    { code: '<Popover.Popup className={(state) => state.open ? "a" : "b"} style={undefined} />', errors: [{ messageId: 'component', data: { value: 'className' } }, { messageId: 'component', data: { value: 'style' } }] },
    { code: 'const classes = cn("flex"); const recipe = utils.cva("grid")', errors: [{ messageId: 'component', data: { value: 'cn()' } }, { messageId: 'component', data: { value: 'cva()' } }] },
    { code: '<div style={{ color }} />; <div style={{ "--ts-i-other": 1, "--ts-size-height": height }} />', errors: [{ messageId: 'instance', data: { value: 'color' } }, { messageId: 'instance', data: { value: '--ts-i-other' } }, { messageId: 'instance', data: { value: '--ts-size-height' } }] },
    { code: '<div style={{ ...extra, [key]: 1, "--ts-i-value": 0 }} />; <div style={styles} />; <div style={open ? { "--ts-i-value": 1 } : undefined} />', errors: [{ messageId: 'instance', data: { value: '...extra' } }, { messageId: 'instance', data: { value: '[key]: 1' } }, { messageId: 'component', data: { value: 'style' } }, { messageId: 'component', data: { value: 'style' } }] },
    {
      code: '<svg viewBox="0 0 24 24" strokeWidth={1.5} width="16" fill="red" stroke={tone} xmlns:xlink="http://www.w3.org/1999/xlink" {...props}><path d="M0 0" stroke-width="2" vectorEffect="non-scaling-stroke" fill={color} /><g><circle r={4} stroke="currentColor" opacity={0.5} /></g></svg>',
      errors: [
        { messageId: 'svg', data: { value: 'strokeWidth={1.5}' } },
        { messageId: 'literal', data: { value: '1.5' } },
        { messageId: 'svg', data: { value: 'width="16"' } },
        { messageId: 'svg', data: { value: 'fill="red"' } },
        { messageId: 'svg', data: { value: 'stroke={tone}' } },
        { messageId: 'svg', data: { value: 'xmlns:xlink="http://www.w3.org/1999/xlink"' } },
        { messageId: 'svg', data: { value: '{...props}' } },
        { messageId: 'svg', data: { value: 'stroke-width="2"' } },
        { messageId: 'svg', data: { value: 'vectorEffect="non-scaling-stroke"' } },
        { messageId: 'svg', data: { value: 'fill={color}' } },
        { messageId: 'svg', data: { value: 'opacity={0.5}' } },
        { messageId: 'literal', data: { value: '0.5' } },
      ],
    },
    {
      code: 'const GRACE = 150; <Tooltip.Provider timeout={400} delay={-2}><svg strokeWidth={1.5} viewBox="0 0 24 24" /></Tooltip.Provider>; const third = items[2]; const ratio = 0.5; enum Level { Deep = 3 }',
      errors: [
        { messageId: 'literal', data: { value: '150' } },
        { messageId: 'literal', data: { value: '400' } },
        { messageId: 'literal', data: { value: '2' } },
        { messageId: 'svg', data: { value: 'strokeWidth={1.5}' } },
        { messageId: 'literal', data: { value: '1.5' } },
        { messageId: 'literal', data: { value: '2' } },
        { messageId: 'literal', data: { value: '0.5' } },
        { messageId: 'literal', data: { value: '3' } },
      ],
    },
    {
      code: 'const glyph = <path d="M0 0" strokeWidth="1.5" />; const group = <g opacity="0.5"><circle r={4} vectorEffect="non-scaling-stroke" /></g>; <svg data-slot="icon" viewBox="0 0 24 24" />; <rect {...props} />',
      errors: [
        { messageId: 'svg', data: { value: 'strokeWidth="1.5"' } },
        { messageId: 'svg', data: { value: 'opacity="0.5"' } },
        { messageId: 'svg', data: { value: 'vectorEffect="non-scaling-stroke"' } },
        { messageId: 'svg', data: { value: 'data-slot="icon"' } },
        { messageId: 'svg', data: { value: '{...props}' } },
      ],
    },
    {
      code: '<span {...{ className: "x", style: { color: "red" } }} />; <div {...{ ...rest }} />; <div {...({ style: styles })} />',
      errors: [
        { messageId: 'component', data: { value: 'className' } },
        { messageId: 'instance', data: { value: 'color' } },
        { messageId: 'component', data: { value: '...rest' } },
        { messageId: 'component', data: { value: 'style' } },
      ],
    },
  ],
})
