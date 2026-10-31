import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import * as parser from '@typescript-eslint/parser'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { ESLint } from 'eslint'
import type { Linter, Rule } from 'eslint'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { afterAll, describe, expect, it } from 'vitest'
import { compositorMotion } from './compositor-motion'
import tessera from './index'
import { noLiteralColors } from './no-literal-colors'
import { noLocalAppearance } from './no-local-appearance'
import { noLocalCss } from './no-local-css'
import { appearanceProperty, classColor, LAYOUT_CLASSES, LAYOUT_FAMILIES, layoutClass } from './style-policy'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({ languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } } })

const testRule = (rule: Rule.RuleModule) => rule as unknown as Parameters<RuleTester['run']>[1]

tester.run('no-local-appearance', testRule(noLocalAppearance), {
  valid: [
    '<div className="block inline-flex flex grid hidden md:block lg:invisible sm:visible collapse sr-only not-sr-only flex-col flex-1 grow shrink-0 basis-1/2 grid-cols-3 col-span-2 row-start-1 auto-rows-fr items-center justify-between content-end place-items-center self-start gap-4 gap-x-2 space-y-4 p-4 md:px-8 -mt-2 mx-auto w-full min-w-0 max-w-xl h-dvh size-6 aspect-square absolute relative inset-0 inset-x-0 -top-4 start-0 z-10 overflow-auto overscroll-contain order-2 columns-2 box-border float-right clear-both isolate container" />',
    '<div className="table border-collapse hover:border-separate md:border-spacing-2 text-left dark:text-right text-start text-wrap text-balance truncate whitespace-nowrap break-words hyphens-auto -translate-x-1/2 transform-gpu origin-center pointer-events-none cursor-pointer select-none touch-none resize-y scroll-mt-4 scroll-px-2 snap-x will-change-transform contain-layout field-sizing-content group group/item peer/field @container @container/main object-cover line-clamp-2 align-middle text-ellipsis" />',
    '<div className="block-4 block-full inline-full min-block-4 max-inline-4 pbs-4 pbe-4 mbs-2 -mbe-2 scroll-pbs-2 scroll-mbe-2 @container-normal @container-size/main caption-top scrollbar-gutter-stable content-center-safe scroll-smooth transform-none md:pbs-2! data-[state=open]:block-full" />',
    '<div className="w-[calc(100%-2rem)] grid-cols-[1fr_2fr] hover:m-[4px] data-[state=open]:flex [&:nth-child(2)]:grid md:!flex tw:md:grid group-hover/item:block" />',
    '<div className="data-[label=\'(\']:grid data-[label=\']\']:flex data-[label=\':\']:block" />',
    '<div style={{ display: "flex", padding: 4, gap: 8, width: 100, minBlockSize: 0, aspectRatio: 1, boxSizing: "border-box", position: "absolute", insetInlineStart: 0, top: 0, zIndex: 1, visibility: "hidden", flexDirection: "column", gridTemplateColumns: "1fr 2fr", rowGap: 2, order: 1, alignItems: "center", justifyContent: "end", placeSelf: "start", marginBlockStart: 4, paddingInline: 2, overflowX: "auto", overscrollBehaviorY: "contain", transform: `translateY(${start}px)`, WebkitTransform: "none", translate: "10px 0", transformOrigin: "top", pointerEvents: "none", cursor: "grab", userSelect: "none", touchAction: "none", contain: "layout", willChange: "transform", scrollMarginTop: 8, scrollPaddingInline: 4, scrollSnapType: "x mandatory", objectFit: "cover", objectPosition: "center", textAlign: "center", whiteSpace: "nowrap", wordBreak: "break-all", overflowWrap: "anywhere" }} />',
    '<table style={{ borderCollapse: "collapse", borderSpacing: 0, tableLayout: "fixed", captionSide: "top", verticalAlign: "top", float: "left", clear: "both", columns: 2, resize: "none", textOverflow: "ellipsis", lineClamp: 2, scrollbarGutter: "stable", containerType: "inline-size", isolation: "isolate" }} />',
    '<Model modelClassName="bg-primary" />; clsx("bg-primary"); registry.cx("rounded-lg"); twMerge("shadow")',
    'cn(mode === "bg-red-500" && "flex", [active ? "md:grid" : "hidden"], { "p-4": status === "text-red-500" })',
    'cva("flex", { variants: { style: { border: "p-4", background: "grid" } }, compoundVariants: [{ style: "border", className: "m-2" }] })',
    '<div className={`flex ${size} gap-2 text-${alignment}`} />',
    'const label = "bg-red-500"; <div title={label} />',
    'const loop = loop; const list = [list, "flex"]; <div className={cn(loop, list)} />',
    'const { tone } = { tone: "bg-primary" }; <div className={tone} />',
    'let tone = "bg-primary"; <div className={tone} />',
    'const classes = { a: "bg-primary" }; <div className={classes.a} />',
    'const key = "color"; <div style={{ [key]: "red" }} />',
    '<div {...{ className: "bg-primary" }} />',
    'const box = { width: 4 } as const; const more = { ...box }; <div style={{ ...more, ...(active ? { height: 2 } : {}), ...(open && { gap: 2 }), ...(wide ? { flex: 1 } : undefined), ...(narrow ? null : { top: 0 }) }} />',
    'const layout = { width: 4, display: "flex" } as const; <div style={active ? { width: 1 } : undefined} />; <div style={layout} />; <div style={null} />; <div style={open && { gap: 2 }} />',
    'cva("flex", { compoundVariants: [...more] }); <div className={getClasses()} />',
    '<div className="@container-[inline-size] hover:@container-[size]/main!" style={{ fieldSizing: "content", scrollBehavior: "smooth", breakBefore: "page", breakAfter: "avoid", breakInside: "avoid", WebkitBoxOrient: "vertical", msFlex: 1 }} />',
  ],
  invalid: [
    ...['hover:bg-primary', 'dark:text-foreground', 'md:text-sm', 'border', 'border-primary', 'ring-2', 'outline-none', 'shadow-lg', 'inset-shadow-sm', 'inset-ring-2', 'rounded-lg', 'font-mono', 'leading-6', 'opacity-50', 'bg-linear-to-r', 'blur-sm', 'animate-spin', 'transition-all', 'underline', 'uppercase', 'rotate-45', 'scale-105', 'indent-4', 'focus:!bg-primary', 'md:rounded-lg!', '[&:nth-child(2)]:bg-primary', 'placeholder-red-500', 'scrollbar-thumb-red-500', 'scheme-dark', 'transform-[rotate(45deg)]', 'list-[square]', 'shimmer', 'zoom-in-95', 'card-body', 'content-none', "content-['x']", 'box-decoration-clone'].map((value) => ({
      code: `<div className="${value}" />`, errors: [{ messageId: 'class' as const, data: { value } }],
    })),
    ...['[width:20px]', 'hover:[margin:4px]', '[grid-template-columns:1fr_2fr]', '[all:unset]', '[color:var(--primary)]', '[--local:4px]'].map((value) => ({
      code: `<div className="${value}" />`, errors: [{ messageId: 'arbitrary' as const, data: { value } }],
    })),
    { code: 'const a = "bg-primary"; const b = a; <div className={b} />; cn({ ["rounded-lg"]: active })', errors: [{ messageId: 'class' }, { messageId: 'class' }] },
    { code: 'cva("flex", { variants: { size: { 1: "bg-primary", 2: "text-sm" } } }); cn({ [`rounded-lg`]: active })', errors: [{ messageId: 'class' }, { messageId: 'class' }, { messageId: 'class' }] },
    { code: 'cn(active && "bg-primary", ["flex", { "dark:text-foreground": active }])', errors: [{ messageId: 'class' }, { messageId: 'class' }] },
    { code: '<div className={cn("bg-primary")} />', errors: [{ messageId: 'class' }] },
    { code: 'utils.cn("bg-primary"); kit.cva("rounded-lg")', errors: [{ messageId: 'class' }, { messageId: 'class' }] },
    { code: 'cn!("bg-primary"); (utils.cva as typeof utils.cva)("shadow-lg"); utils?.cn("ring-2")', errors: [{ messageId: 'class' }, { messageId: 'class' }, { messageId: 'class' }] },
    { code: 'const classes = "bg-primary"; <div className={classes} />', errors: [{ messageId: 'class' }] },
    { code: 'const classes = ["flex", isActive ? "bg-primary" : "grid"]; <div className={classes} />', errors: [{ messageId: 'class' }] },
    { code: '<div className={`flex ${active ? "bg-primary" : "grid"} dark:text-primary`} />', errors: [{ messageId: 'class' }, { messageId: 'class' }] },
    { code: 'const suffix = "primary"; <div className={`bg-${suffix}`} />', errors: [{ messageId: 'class' }] },
    { code: 'const config = { variants: { size: { sm: "text-sm" } }, compoundVariants: [{ size: "sm", class: "bg-primary" }] }; cva("flex", config)', errors: [{ messageId: 'class' }, { messageId: 'class' }] },
    { code: '<div style={{ color: "var(--primary)", fontSize: 12, opacity: 0.5, rotate: "45deg" }} />', errors: [{ messageId: 'style' }, { messageId: 'style' }, { messageId: 'style' }, { messageId: 'style' }] },
    { code: 'const styles = { WebkitTextFillColor: "red", scrollbarColor: "red blue" } as const; <div style={styles} />', errors: [{ messageId: 'style' }, { messageId: 'style' }] },
    { code: 'const extra = { color: "red" }; <div style={{ width: 4, ...extra }} />', errors: [{ messageId: 'style', data: { value: 'color' } }] },
    { code: '<div style={{ height: 4, ...(active ? { color: "red" } : {}) }} />', errors: [{ messageId: 'style', data: { value: 'color' } }] },
    { code: '<div style={{ ...{ ...(on || { opacity: 0.5 }) } }} />', errors: [{ messageId: 'style', data: { value: 'on' } }, { messageId: 'style', data: { value: 'opacity' } }] },
    { code: '<div style={{ width: 4, ...props.style, ...textStyle(layout) }} />', errors: [{ messageId: 'style', data: { value: 'props.style' } }, { messageId: 'style', data: { value: 'textStyle(layout)' } }] },
    { code: '<div style={{ ...extra }} />', errors: [{ messageId: 'style', data: { value: 'extra' } }] },
    { code: '<div style={props.style} />', errors: [{ messageId: 'style', data: { value: 'props.style' } }] },
    { code: '<div style={getStyle()} />', errors: [{ messageId: 'style', data: { value: 'getStyle()' } }] },
    { code: '<div style={active ? base : undefined} />', errors: [{ messageId: 'style', data: { value: 'base' } }] },
    { code: '<div style={extra} />', errors: [{ messageId: 'style', data: { value: 'extra' } }] },
    { code: 'cn({ flex: true, ...(on ? { "bg-primary": true } : {}) })', errors: [{ messageId: 'class', data: { value: 'bg-primary' } }] },
    { code: '<div style={{ all: "unset", textIndent: 16, zoom: 1.5, clipPath: "circle(50%)", paintOrder: "stroke" }} />', errors: Array.from({ length: 5 }, () => ({ messageId: 'style' as const })) },
    { code: '<svg style={{ "--gap": "4px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", scrollbarWidth: "none", forcedColorAdjust: "none", stopColor: "red", stopOpacity: 0.5, floodColor: "red", lightingColor: "blue" }} />', errors: Array.from({ length: 9 }, () => ({ messageId: 'style' as const })) },
  ],
})

tester.run('no-literal-colors', testRule(noLiteralColors), {
  valid: [
    '<div className="md:flex dark:grid text-center border-spacing-4 w-[24px] [width:20px] bg-primary text-foreground grid-cols-[1fr_2fr]" />',
    '<div className="w-[calc(100vh-7rem)] max-w-[min(20rem,calc(100vw-1rem))] h-[clamp(4rem,1.6rem+4.8vw,7.2rem)] -translate-y-[62.5%] -ml-[0.44rem] z-[99999] flex-[2] max-w-[64ch] w-[18.8cqw] tracking-[-0.02em]" />',
    '<div className="grid-cols-[auto_minmax(0,1fr)] grid-rows-[0fr] grid-cols-[1fr_auto_1fr] aspect-[16/10] aspect-[1/1.618] gap-[length:inherit] leading-[inherit] max-h-[80vh] rounded-[1.6rem]" />',
    '<div className="group/red peer/blue @container/white @container/[white] md:@container-size/[blue]! font-black bg-primary/50 text-foreground/[.8] data-[state=open]:flex [&>svg]:size-4 @[160px]/layers:grid" />',
    'cn(kind === "red" && "flex", { grid: name === "blue" })',
    'const text = "red rgb(0 0 0) #fff"; <div title={text} />',
    '<div style={{ color: "red", width: "var(--panel)" }} />',
    'cn("w-[10cqmin] h-[5cqmax]"); cn(`w-[${size}rem]`, `grid-cols-[${columns}]`, "@container-[inline-size] hover:@container-[size]/main! [width:20px] [grid-template-columns:1fr_2fr]")',
    '<div className="min-[480px]:flex max-[40rem]:grid @min-[20rem]/main:flex @max-[calc(100%-2rem)]:grid [@media(max-height:500px)]:hidden [@media(width>=48rem)]:flex supports-[display:grid]:grid aria-[sort=ascending]:flex" />',
    '<div className="not-min-[480px]:flex not-[@media(max-height:500px)]:hidden not-data-[state=open]:flex group-hover/item:flex [&:not(:first-child)]:grid" />',
  ],
  invalid: [
    ...['w-[var(--width)]', 'hover:p-[var(--pad)]', 'bg-(--primary)', 'text-(color:--primary)', 'bg-(--primary)/50', 'w-(--panel-width,20px)', 'md:w-(length:--panel-width,20px)!', 'content-[var(--primary)]', 'bg-current/(--opacity)', 'hover:bg-current/(--opacity)!', 'w-[--theme(--container-md)]', 'bg-[theme(--color-red-500)]', 'bg-[#fff]', 'bg-[#fff]/50', 'dark:text-[red]', 'hover:bg-[rgb(0_0_0)]', 'bg-[device-cmyk(0_1_1_0)]', 'mask-b-from-[red]', 'cursor-[url(/a.cur),auto]', "content-['x']", 'left-[anchor(--trigger_left)]', 'w-[calc(10px*tan(45deg))]', 'gap-[--spacing(var(--gap))]', 'shadow-[0_0_6px_var(--glow)]', String.raw`content-['it\'s_red']`, '[color:red]', '[background-color:#ff0000]', '[color:var(--primary)]', '[width:var(--panel-width)]', '@container-[var(--type)]', '@container/(--name)', '@container/[var(--name)]', 'hover:@container-size/[theme(--x)]!', 'min-[--theme(--breakpoint-md)]:flex', '@min-[--theme(--container-md)]/main:flex', 'max-[var(--x)]:grid', 'md:@max-(--x):grid', '[@media(width>=--theme(--breakpoint-md))]:flex', '[@media(prefers-color-scheme:dark)]:flex', '[@supports(color:red)]:flex', 'not-min-[--theme(--breakpoint-md)]:flex', 'not-@min-[--theme(--container-sm)]:flex', 'not-[@media(prefers-color-scheme:dark)]:flex', 'not-[@media(width>=--theme(--breakpoint-md))]:flex', 'supports-[width:--theme(--x)]:flex', 'data-[size=var(--x)]:flex', 'group-[.a_&]:[&:has(--x)]:grid', 'group-hover/item:not-max-[theme(--breakpoint-sm)]:grid', 'not-min-[red]:flex', 'not-@[red]/main:grid'].map((value) => ({
      code: `<div className="${value}" />`, errors: [{ messageId: 'value' as const, data: { value } }],
    })),
    ...['/images/icon[1.png', String.raw`'/images/it\\'s.png'`].map((url) => ({
      code: `cn("bg-[image:url(${url}),linear-gradient(red,blue)]")`, errors: [{ messageId: 'value' as const }],
    })),
    { code: 'cn(`bg-[var(--${tone})]`)', errors: [{ messageId: 'value', data: { value: 'bg-[var(--${…})]' } }] },
    ...['red', 'bg-black', 'text-white/50', 'bg-red-500', 'hover:border-gray-200/50', 'placeholder-red-500', 'scrollbar-thumb-slate-900', 'mask-b-from-zinc-500', 'text-stone-50', 'bg-taupe-950', 'bg-red-500/[.5]', 'bg-black/[.5]', 'text-white/[0.8]', 'text-transparent'].map((value) => ({
      code: `<div className="${value}" />`, errors: [{ messageId: 'color' as const }],
    })),
    { code: 'const tone = "red"; <div className={`text-[${tone}]`} />', errors: [{ messageId: 'value' }] },
    { code: '<div className={`text-[${active ? "red" : "blue"}]`} />', errors: [{ messageId: 'value' }, { messageId: 'value' }] },
    { code: 'cn(`bg-red-500/${opacity}`, `data-[state=${state}]:bg-red-500`)', errors: [{ messageId: 'color' }, { messageId: 'color' }] },
    {
      code: ['s', 'v', 't'].map((name) => `const ${name} = a ? "p-1" : b ? "p-2" : c ? "p-3" : d ? "p-4" : "${name === 't' ? 'bg-red-500' : 'p-5'}";`).join(' ') + ' <div className={`${s} ${v} ${t}`} />',
      errors: [{ messageId: 'color' }],
    },
  ],
})

describe('value grammar', () => {
  it('refuses a long number with an unknown unit in linear time', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: tessera.configs.recommended })
    const startedAt = performance.now()
    const messages = await eslint.lintText(`cn("w-[0.${'1'.repeat(40)}q]")`)
    expect(messages[0]?.messages.map((message) => message.messageId)).toEqual(['value'])
    expect(performance.now() - startedAt).toBeLessThan(5000)
  })

  it('does not follow a constant into its own initializer', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: tessera.configs.recommended })
    const startedAt = performance.now()
    await eslint.lintText(`const a = \`${'${a}'.repeat(14)}\`; cn(a)`)
    expect(performance.now() - startedAt).toBeLessThan(5000)
  })
})

tester.run('no-local-css', testRule(noLocalCss), {
  valid: [
    'import "@mattymroz/tessera/tessera.css"; import "@mattymroz/tessera/tailwind.css"',
    'import "katex/dist/katex.min.css"; import "@xyflow/react/dist/style.css"',
    'import { Button } from "./button"; import data from "./data.json"; await import(`./pages/${name}`)',
    'import "normalize.css"; require("@fontsource/inter/400.css"); new URL("./a.css", import.meta.url)',
    '<><link rel="stylesheet" href="https://cdn.example.com/a.css" /><link rel="stylesheet" href="//cdn.example.com/b.css" /><link rel="icon" href="/favicon.ico" /></>',
    'import "normalize.css?inline"; import "@scope/normalize.css#theme"; import(`${pkg}/dist/a.css`); <link rel="stylesheet" href={`${cdn}/katex.css`} />',
  ],
  invalid: [
    ...['import "./local.css"', 'import styles from "./local.module.scss"', 'import "../theme.sass"', 'import "./a.less"', 'import "./a.styl"', 'import "./a.pcss"', 'import "./local.css?inline"', 'await import("./local.css")', 'require("../local.css")', 'import "/src/app.css"', 'import "@/styles.css"', 'import(`./themes/${name}.css`)', 'import "~/styles/app.css"', 'import "#styles/app.css"', String.raw`require("C:\\app\\a.css")`, String.raw`require(".\\src\\a.css")`, 'import "C:/app/a.css"', 'import "file:///app/a.css"', '<link rel="stylesheet" href="/app.css" />', '<link rel="preload stylesheet" href={`./${theme}.css`} />', '<link rel="stylesheet" href="file:///app/a.css" />', '<link rel="stylesheet" href="data:text/css,body{opacity:0}" />', 'require!("./a.css")', '(require as NodeRequire)("./a.css")', 'export { default as css } from "./local.module.css"', 'export * from "./local.css"', 'export * as styles from "./local.css"', 'import styles = require("./local.module.css")'].map((code) => ({
      code, errors: [{ messageId: 'css' as const }],
    })),
    { code: '<style>{".x { color: red }"}</style>', errors: [{ messageId: 'style' }] },
  ],
})

const animationFrame = [{ animationFrameReason: 'scroll-linked loop that CSS cannot express' }]

tester.run('compositor-motion', testRule(compositorMotion), {
  valid: [
    'node.animate([{ opacity: 0, translate: "0 4px", scale: "0.9", rotate: "0deg", transform: "none", offset: 0, easing: "ease-out", composite: "add" }, { opacity: 1 }], { duration: 200 })',
    'node.animate({ opacity: [0, 1], translate: ["0 4px", "0 0"] }, 200); node.animate(null, 200); node?.animate?.([{ ["opacity"]: 0 }], 200)',
    'const FRAMES: Keyframe[] = [{ opacity: 0.9, scale: "0.25" }, { opacity: 0, scale: "1.8" }]; ring.animate(FRAMES, { duration: 420 })',
    'const shift = (y: number): Keyframe => ({ translate: `0 ${y}px` }); node.animate([shift(4), shift(0)], 200)',
    'function fade(to: number): Keyframe { if (to > 0) return { opacity: to }; return { opacity: 0, scale: "0.9" } } node.animate([fade(1), fade(0)], 200)',
    'const axis = vertical ? "translate" : "scale"; node.animate([{ [axis]: "0" }], 200); node.animate(open ? [{ opacity: 0 }] : [{ opacity: 1 }], 200)',
    'cancelAnimationFrame(frame); queueMicrotask(tick); setTimeout(tick, 16); scroller.animate()',
    { options: animationFrame, code: 'frame = requestAnimationFrame(tick); window.requestAnimationFrame(tick)' },
  ],
  invalid: [
    { code: 'node.animate([{ width: "0px", opacity: 0 }, { width: "10px" }], 200)', errors: [{ messageId: 'property', data: { name: 'width' } }] },
    { code: 'node.animate({ height: [0, 10], boxShadow: ["none", "0 0 4px"] }, 200)', errors: [{ messageId: 'property', data: { name: 'height' } }, { messageId: 'property', data: { name: 'boxShadow' } }] },
    { code: 'node.animate([{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)" }], 200)', errors: [{ messageId: 'property', data: { name: 'filter' } }] },
    { code: 'const property = column ? "marginBlockEnd" : "marginInlineEnd"; node.animate([{ [property]: "0px" }], 200)', errors: [{ messageId: 'property', data: { name: 'marginBlockEnd' } }, { messageId: 'property', data: { name: 'marginInlineEnd' } }] },
    { code: 'const FRAMES = [{ clipPath: "inset(0)" }]; node.animate(FRAMES, 200)', errors: [{ messageId: 'property', data: { name: 'clipPath' } }] },
    { code: 'const size = (w: number) => ({ translate: "0 0", width: `${w}px` }); node.animate([size(0), size(4)], 200)', errors: [{ messageId: 'property', data: { name: 'width' } }] },
    { code: 'node.animate(frames, 200); node.animate([makeFrame(), { ...extra }], 200)', errors: [{ messageId: 'dynamic' }, { messageId: 'dynamic' }, { messageId: 'dynamic' }] },
    { code: 'function frame(sized: boolean): Keyframe { const result: Keyframe = { translate: "0 0" }; if (sized) result[key] = "4px"; return result } node.animate([frame(true)], 200)', errors: [{ messageId: 'dynamic' }] },
    { code: 'const FRAMES: Keyframe[] = [{ opacity: 0 }]; FRAMES.push({ height: "0" }); node.animate(FRAMES, 200)', errors: [{ messageId: 'dynamic' }] },
    { code: 'let frames = [{ opacity: 0 }]; node.animate(frames, 200); node.animate([{ [name]: 0 }], 200)', errors: [{ messageId: 'dynamic' }, { messageId: 'dynamic' }] },
    { code: 'frame = requestAnimationFrame(tick); window.requestAnimationFrame(() => requestAnimationFrame(tick))', errors: [{ messageId: 'animationFrame' }, { messageId: 'animationFrame' }, { messageId: 'animationFrame' }] },
    { options: animationFrame, code: 'cancelAnimationFrame(frame)', errors: [{ messageId: 'unusedException' }] },
  ],
})

describe('layout classes and layout style properties stay symmetric', () => {
  const accessibility = new Set(['sr-only', 'not-sr-only'])
  const theme = createRequire(import.meta.url).resolve('tailwindcss/theme.css')
  const loading = __unstable__loadDesignSystem(readFileSync(theme, 'utf8'), { base: dirname(theme) })
  const properties = (css: string | null) => ((css ?? '').replace(/@property[^{]*\{[^}]*\}/g, '').match(/[\w-]+(?=\s*:[^;{}]*;)/g) ?? []).filter((property) => !property.startsWith('--'))

  it('every layout class of the installed Tailwind generates only layout properties', async () => {
    const system = await loading
    const classes = system.getClassList().map(([name]) => name).filter((name) => layoutClass(name) && !accessibility.has(name))
    const leaks = system.candidatesToCss(classes).flatMap((css, index) => properties(css).filter(appearanceProperty).map((property) => `${classes[index]}: ${property}`))
    expect(classes.length).toBeGreaterThan(5000)
    expect(leaks).toEqual([])
  }, 60_000)

  it('every Tailwind class with only layout properties is a layout class', async () => {
    const system = await loading
    const classes = system.getClassList().map(([name]) => name)
    const missed = system.candidatesToCss(classes).flatMap((css, index) => {
      const written = properties(css)
      const layoutOnly = written.length > 0 && !written.some((property) => /^transform(?:-style|-box)?$/.test(property) || appearanceProperty(property))
      const name = classes[index] ?? ''
      return layoutOnly && !layoutClass(name) ? [name] : []
    })
    expect(missed).toEqual([])
  }, 60_000)

  it('every Tailwind class that paints a palette color raises a color alarm', async () => {
    const system = await loading
    const classes = system.getClassList().map(([name]) => name)
    const painted = system.candidatesToCss(classes).flatMap((css, index) => (/var\(--color-[a-z]+-\d+\)/.test(css ?? '') ? [classes[index] ?? ''] : []))
    expect(painted.length).toBeGreaterThan(1000)
    expect(painted.filter((name) => classColor(name) === undefined)).toEqual([])
  }, 60_000)

  it('every layout list entry matches at least one real Tailwind class', async () => {
    const classes = [...(await loading).getClassList().map(([name]) => name.replace(/^-/, '')), 'group', 'peer']
    const patterns = [...LAYOUT_CLASSES.map((entry) => `^(?:${entry})$`), ...LAYOUT_FAMILIES.map((family) => `^(?:${family})-.+$`)]
    expect(patterns.filter((pattern) => !classes.some((name) => new RegExp(pattern).test(name)))).toEqual([])
  }, 60_000)
})

const TAILWIND = '@import "tailwindcss";\n'
const TESSERA = '@import "@mattymroz/tessera/tessera.css";\n'
const BRIDGE = '@import "@mattymroz/tessera/tailwind.css";\n'
const entries = {
  'entry.css': TAILWIND + TESSERA + BRIDGE,
  'reordered.css': `${String.fromCharCode(0xfeff)}  @import '@mattymroz/tessera/tailwind.css' ;\r\n@import "@mattymroz/tessera/tessera.css";\r\n\r\n`,
  'tessera.css': TESSERA,
  'declaration.css': `${TAILWIND}${TESSERA}${BRIDGE}body { color: red; }\n`,
  'fourth.css': `${TAILWIND}${TESSERA}${BRIDGE}@import "./theme.css";\n`,
  'comment.css': `/* app */\n${TESSERA}`,
  'missing-tessera.css': TAILWIND + BRIDGE,
  'duplicate.css': TESSERA + TAILWIND + TESSERA,
  'split.css': '@import\n"@mattymroz/tessera/tessera.css";\n',
}
const fixtures = mkdtempSync(join(tmpdir(), 'tessera-eslint-'))
afterAll(() => rmSync(fixtures, { recursive: true, force: true }))
for (const [file, css] of Object.entries(entries)) writeFileSync(join(fixtures, file), css)

const lint = async (code: string, file: string, config: Linter.Config[] = []) => {
  const eslint = new ESLint({ cwd: fixtures, overrideConfigFile: true, overrideConfig: [...tessera.configs.recommended, ...config] })
  const [result] = await eslint.lintText(code, { filePath: join(fixtures, file) })
  return result?.messages ?? []
}

describe('recommended flat config', () => {
  it('enables every rule as an error with the native ESLint parser', async () => {
    const messages = await lint('import "./local.css"; cn("bg-primary", "text-[#fff]"); requestAnimationFrame(tick);', 'app.js')
    expect(new Set(messages.map((message) => message.ruleId))).toEqual(new Set(Object.keys(tessera.rules ?? {}).map((name) => `tessera/${name}`)))
    expect(messages.every((message) => message.severity === 2)).toBe(true)
  })

  it('reads meta.version from package.json', () => {
    const { version } = JSON.parse(readFileSync(join(import.meta.dirname, '../../package.json'), 'utf8')) as { version: string }
    expect(tessera.meta).toEqual({ name: '@mattymroz/tessera', version })
  })

  it('allows a CSS entry that imports only Tailwind and the Tessera entries, each once, with tessera.css', async () => {
    for (const file of ['./entry.css', './reordered.css', './tessera.css', './entry.css?inline']) {
      expect(await lint(`import "${file}";`, 'app.js')).toEqual([])
    }
  })

  it('refuses a CSS entry with a fourth declaration, without tessera.css or with a duplicate import', async () => {
    for (const file of ['./declaration.css', './fourth.css', './comment.css', './missing-tessera.css', './duplicate.css', './split.css', './missing.css', '@/entry.css']) {
      expect((await lint(`import "${file}";`, 'app.js')).map((message) => message.messageId)).toEqual(['css'])
    }
  })

  const jsx: Linter.Config = { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } }

  it('scopes a requestAnimationFrame exception with ESLint files and refuses an unused one', async () => {
    const loop: Linter.Config[] = [{ files: ['loop/**'], rules: { 'tessera/compositor-motion': ['error', ...animationFrame] } }]
    expect(await lint('requestAnimationFrame(tick);', 'loop/scroll.js', loop)).toEqual([])
    expect((await lint('cancelAnimationFrame(frame);', 'loop/idle.js', loop)).map((message) => message.messageId)).toEqual(['unusedException'])
    expect((await lint('requestAnimationFrame(tick);', 'app.js', loop)).map((message) => message.messageId)).toEqual(['animationFrame'])
  })

  it('lets a file that paints domain data colors turn both color rules off with ESLint files', async () => {
    const domain: Linter.Config[] = [jsx, { files: ['domain/**'], rules: { 'tessera/no-local-appearance': 'off', 'tessera/no-literal-colors': 'off' } }]
    const code = 'const k = "#8b5cf6"; <rect style={{ fill: k, stroke: "rgb(10 20 30)" }} className="bg-[#ff0000]" />'
    expect(await lint(code, 'domain/overlay.js', domain)).toEqual([])
    expect((await lint(code, 'app.js', domain)).map((message) => message.ruleId)).toContain('tessera/no-literal-colors')
  })
})
