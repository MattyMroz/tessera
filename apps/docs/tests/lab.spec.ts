import { THEME_CONFIG, type Choices } from '@mattymroz/tessera/lib/theme'
import { TONES, type Tone } from '@mattymroz/tessera/lib/tone'
import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  alphaOf,
  box,
  choose,
  clearRecorded,
  colorOf,
  failures,
  hover,
  offCompositor,
  raisedShadow,
  recordAnimations,
  recorded,
  row,
  settle,
  srgbOf,
  startTrace,
  stateStep,
  TONE_ROLES,
  visit,
  watchLayers,
  type LayerCount,
} from './helpers'

const TOLERANCE = 0.5
const FOUNDATION = '/foundation'
const TUNED_STIFFNESS = '200'
const TUNED_FIRM = '300'
const OVERLAYS = '/screens/overlays'
const SETTLE = 600
const LONG_LIVED_LAYERS = 12
const LAYER_VIEWPORT = { width: 1280, height: 800 } as const
const LAYER_RATIO = 1.5
const BUSY_RATIOS: readonly number[] = [1, LAYER_RATIO]
const SPIN_REASON = 'ActiveRotateAnimation'
const EIGHT_GROUPS = 8
const VISIBLE_BLURS = 2
const CONTROL_HEIGHT = { xs: 16, sm: 20, md: 24, lg: 28, xl: 36 } as const
const CONTROL_RADIUS_LG: readonly (readonly [Choices['corners'], Choices['curve'], number])[] = [
  ['none', 'round', 0],
  ['none', 'squircle', 0],
  ['sm', 'round', 4],
  ['sm', 'squircle', 6.4],
  ['md', 'round', 6],
  ['md', 'squircle', 9.6],
  ['lg', 'round', 10],
  ['lg', 'squircle', 12.6],
  ['full', 'round', 14],
  ['full', 'squircle', 14],
]
const PLAIN_RADIUS_LG = 10
const NESTED_XS_RADIUS_LG = (CONTROL_HEIGHT.xs * 10) / 28
const SQUIRCLE = 'superellipse(2)'
const CONCENTRIC_LG_ROUND = {
  'size-lg': 10,
  'control-page': 10,
  'row-page': 10,
  'surface-inset': 14,
  'control-inset': 5.5,
  'row-inset': 5.5,
  'surface-group': 18,
  'control-group': 4.5,
  'row-group': 4.5,
  'surface-card': 18,
  'control-card': 10,
  'row-card': 10,
  'surface-depth-1': 14,
  'control-depth-1': 5.5,
  'row-depth-1': 5.5,
  'surface-depth-2': 5.5,
  'control-depth-2': 4,
  'row-depth-2': 4,
  'surface-depth-3': 4,
  'control-depth-3': 4,
  'row-depth-3': 4,
  'surface-depth-4': 4,
  'control-depth-4': 4,
  'row-depth-4': 4,
} as const
const SURFACE_CONTROLS = ['inset', 'group', 'card', 'depth-1', 'depth-2', 'depth-3'] as const
const PADDING_CASES: readonly (readonly [Choices['corners'], Choices['curve']])[] = [
  ['none', 'round'],
  ['lg', 'round'],
  ['full', 'squircle'],
]
const STATE_STEPS = {
  light: { rest: 0.04, hover: 0.08, press: 0.12 },
  dark: { rest: 0.08, hover: 0.12, press: 0.16 },
} as const
const STATE_PRECISION = 0.001
const SAVED: Partial<Choices> = { mode: 'dark', accent: 'violet', corners: 'lg' }
const FIRST_FRAME = 'lab-first-frame'
const CONTENT_LOADED = 'lab-content-loaded'
const APPLICATION_SCRIPTS = '**/_next/static/**/*.js'
const ROOT = 'html'
const TRACK_PADDING = 2
const TRACK_RATIO = 1.75
const MIN_RAIL = 2
const BAR_VALUE = 0.4
const LOOPS = ['spin', 'sweep', 'pulse'] as const
const LOOP_PROPERTIES: Readonly<Record<(typeof LOOPS)[number], string>> = { spin: 'rotate', sweep: 'translate', pulse: 'opacity' }
const EDGES = '/screens/edges'
const RAIL_TRACKS = 3
const COLOURED_TONES: readonly Tone[] = TONES.filter((tone) => tone !== 'neutral')
const TREE_INDENT: readonly (readonly [number, number])[] = [
  [3, 2],
  [7, 6],
  [8, 7],
  [12, 7],
]
const MOTION_NAMES: readonly string[] = [
  'duration-instant', 'duration-slide', 'duration-emphasized', 'duration-overlay', 'duration-elastic',
  'ease-standard', 'ease-out', 'ease-emphasized', 'ease-spring', 'press-scale', 'press-rest', 'press-hold',
  'duration-press-in', 'duration-press-out', 'ease-press-in', 'ease-press-out', 'spring-stiffness', 'spring-damping',
  'elastic-overshoot', 'mode', 'spin', 'sweep', 'pulse', 'loop',
]

function radius(page: Page, testId: string): Promise<number> {
  return page.getByTestId(testId).evaluate((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius))
}

function cornerShape(page: Page, testId: string): Promise<string> {
  return page.getByTestId(testId).evaluate((element) => getComputedStyle(element).getPropertyValue('corner-top-left-shape'))
}

function height(page: Page, testId: string): Promise<number> {
  return page.getByTestId(testId).evaluate((element) => element.getBoundingClientRect().height)
}

function padding(target: Locator): Promise<string> {
  return target.evaluate((element) => {
    const style = getComputedStyle(element)
    return `${style.paddingLeft} ${style.paddingRight}`
  })
}

function stateStepOf(page: Page, testId: string): Promise<number> {
  return stateStep(page.getByTestId(testId))
}

function island(page: Page): Locator {
  return page.getByRole('region', { name: 'Island', exact: true })
}

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function countStyled(page: Page, property: 'backdropFilter', match: string): Promise<number> {
  return page.evaluate(
    ({ property, match }) => [...document.querySelectorAll('*')].filter((element) => getComputedStyle(element)[property].includes(match)).length,
    { property, match },
  )
}

test('sizes the control and the row from xs to xl', async ({ page }) => {
  await page.goto(FOUNDATION)
  for (const [size, expected] of Object.entries(CONTROL_HEIGHT)) {
    expect(await height(page, `size-${size}`), size).toBeCloseTo(expected, 1)
    expect(await height(page, `icon-only-${size}`), `icon only ${size}`).toBeCloseTo(expected, 1)
    expect(await height(page, `row-${size}`), `row ${size}`).toBeCloseTo(expected, 1)
  }
})

test('rounds the lg control for every corner and curve', async ({ page }) => {
  await page.goto(FOUNDATION)
  for (const [corners, curve, expected] of CONTROL_RADIUS_LG) {
    await choose(page, 'corners', corners)
    await choose(page, 'curve', curve)
    expect(Math.abs((await radius(page, 'size-lg')) - expected), `${corners} ${curve}`).toBeLessThanOrEqual(TOLERANCE)
    const squircle = curve === 'squircle' && corners !== 'full'
    expect((await cornerShape(page, 'size-lg')) === SQUIRCLE, `${corners} ${curve} corner shape`).toBe(squircle)
  }
})

test('sizes a nested xs control from its own size inside xl', async ({ page }) => {
  await page.goto(FOUNDATION)
  await choose(page, 'corners', 'lg')
  await choose(page, 'curve', 'round')
  expect(await height(page, 'size-nested-xs')).toBeCloseTo(CONTROL_HEIGHT.xs, 1)
  expect(Math.abs((await radius(page, 'size-nested-xs')) - NESTED_XS_RADIUS_LG)).toBeLessThanOrEqual(TOLERANCE)
})

test('derives the box, the track, the thumb and the rail of every size from the size engine', async ({ page }) => {
  await page.goto(FOUNDATION)
  const sizes = await page.locator('[data-testid^="geometry-"]').evaluateAll((groups) =>
    groups.map((group) => {
      const rect = (part: string): { x: number; width: number; height: number } => {
        const { x, width, height } = group.querySelector(`[data-part="${part}"]`)?.getBoundingClientRect() ?? new DOMRect()
        return { x, width, height }
      }
      const output = (name: string): number => {
        const probe = document.createElement('span')
        probe.style.position = 'absolute'
        probe.style.width = `var(--ts-size-${name})`
        group.append(probe)
        const width = probe.getBoundingClientRect().width
        probe.remove()
        return width
      }
      return {
        size: group.getAttribute('data-size'),
        icon: output('icon'),
        engine: { block: output('track-block'), inline: output('track-inline'), thumb: output('thumb') },
        square: rect('box'),
        track: rect('track-off'),
        thumb: rect('thumb-off'),
        trackOn: rect('track-on'),
        thumbOn: rect('thumb-on'),
        rail: rect('rail'),
      }
    }),
  )
  expect(sizes.map(({ size }) => size)).toEqual(Object.keys(CONTROL_HEIGHT))
  for (const { size, icon, engine, square, track, thumb, trackOn, thumbOn, rail } of sizes) {
    const inset = (engine.block - engine.thumb) / 2
    expect([square.width, square.height], `${size} box`).toEqual([icon, icon])
    expect(engine.block, `${size} track block`).toBeCloseTo(icon + TRACK_PADDING * 2, 1)
    expect(engine.inline, `${size} track inline`).toBeCloseTo(Math.round(engine.block * TRACK_RATIO), 1)
    expect([track.width, track.height], `${size} track`).toEqual([engine.inline, engine.block])
    expect([thumb.width, thumb.height], `${size} thumb`).toEqual([engine.thumb, engine.thumb])
    expect(inset, `${size} thumb inset`).toBeGreaterThan(0)
    expect(Math.abs(thumb.x - track.x - inset), `${size} thumb off`).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(trackOn.x + trackOn.width - thumbOn.x - thumbOn.width - inset), `${size} thumb on`).toBeLessThanOrEqual(TOLERANCE)
    expect(rail.height, `${size} rail`).toBeGreaterThanOrEqual(MIN_RAIL)
  }
})

test('keeps the check box a rounded square with full corners, never a circle like a radio', async ({ page }) => {
  await page.goto(FOUNDATION)
  await choose(page, 'corners', 'full')
  for (const curve of ['round', 'squircle'] as const) {
    await choose(page, 'curve', curve)
    const boxes = await page.locator('[data-testid^="geometry-"] [data-part="box"]').evaluateAll((elements) =>
      elements.map((element) => ({ radius: Number.parseFloat(getComputedStyle(element).borderTopLeftRadius), width: element.getBoundingClientRect().width })),
    )
    expect(boxes).toHaveLength(Object.keys(CONTROL_HEIGHT).length)
    for (const { radius, width } of boxes) {
      expect(radius, `${curve} ${width}`).toBeGreaterThan(0)
      expect(radius, `${curve} ${width}`).toBeLessThan(width / 2 - TOLERANCE)
    }
  }
})

test('fills the bar to the instance value written on its fill and keeps the value off its children', async ({ page }) => {
  await page.goto(FOUNDATION)
  const [bar, fill] = await Promise.all([box(page.getByTestId('bar')), box(page.getByTestId('bar-fill'))])
  const registry = await page.getByTestId('bar-fill').evaluate((element) => {
    const child = document.createElement('span')
    child.style.position = 'absolute'
    child.style.width = 'var(--ts-size-track-inline)'
    element.append(child)
    const values = {
      track: child.getBoundingClientRect().width,
      own: getComputedStyle(element).getPropertyValue('--ts-i-value'),
      child: getComputedStyle(child).getPropertyValue('--ts-i-value'),
    }
    child.remove()
    return values
  })
  expect(Math.abs(bar.width - registry.track * RAIL_TRACKS)).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(fill.width - registry.track * RAIL_TRACKS * BAR_VALUE)).toBeLessThanOrEqual(TOLERANCE)
  expect({ own: registry.own, child: registry.child }).toEqual({ own: String(BAR_VALUE), child: '0' })
})

test('grows the content-sized text area with its lines', async ({ page }) => {
  await page.goto(FOUNDATION)
  const field = page.getByTestId('field-sizing')
  const empty = await height(page, 'field-sizing')
  await field.fill('one\ntwo\nthree')
  expect(await height(page, 'field-sizing')).toBeGreaterThan(empty)
})

function loops(page: Page): Promise<{ name: string; output: string; properties: string[] }[]> {
  return page.evaluate((names) => {
    const timing = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    return names.map((name) => {
      const sample = document.querySelector(`[data-testid="loop-${name}"]`)
      const animations = sample?.getAnimations() ?? []
      const properties = animations.flatMap((animation) =>
        animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes().flatMap((frame) => Object.keys(frame)) : [],
      )
      return {
        name,
        output: sample ? getComputedStyle(sample).getPropertyValue(`--ts-motion-${name}`).trim() : '',
        properties: [...new Set(properties.filter((property) => !timing.has(property)))],
      }
    })
  }, LOOPS)
}

test('runs the loops only on compositor properties and stops them with the motion off and with reduced motion', async ({ page }) => {
  await page.goto(FOUNDATION)
  expect(await loops(page)).toEqual(LOOPS.map((name) => ({ name, output: `ts-${name}`, properties: [LOOP_PROPERTIES[name]] })))
  await choose(page, 'motion', 'off')
  expect(await loops(page)).toEqual(LOOPS.map((name) => ({ name, output: 'none', properties: [] })))
  await choose(page, 'motion', 'spring')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await loops(page)).toEqual(LOOPS.map((name) => ({ name, output: 'none', properties: [] })))
})

test('falls back to round corners at their plain radius without corner-shape support', async ({ page }) => {
  await page.goto(FOUNDATION)
  await choose(page, 'corners', 'lg')
  await choose(page, 'curve', 'squircle')
  const removed = await page.evaluate(() => {
    let count = 0
    const strip = (owner: CSSStyleSheet | CSSGroupingRule): void => {
      for (let index = owner.cssRules.length - 1; index >= 0; index -= 1) {
        const rule = owner.cssRules[index]
        if (rule instanceof CSSSupportsRule && rule.conditionText.includes('corner-shape')) {
          owner.deleteRule(index)
          count += 1
        } else if (rule instanceof CSSGroupingRule) strip(rule)
      }
    }
    for (const sheet of document.styleSheets) strip(sheet)
    return count
  })
  expect(removed).toBe(1)
  expect(Math.abs((await radius(page, 'size-lg')) - PLAIN_RADIUS_LG)).toBeLessThanOrEqual(TOLERANCE)
  expect(await cornerShape(page, 'size-lg')).not.toBe(SQUIRCLE)
})

test('keeps the radii of nested surfaces, their controls and rows concentric', async ({ page }) => {
  await page.goto(FOUNDATION)
  await choose(page, 'corners', 'lg')
  await choose(page, 'curve', 'round')
  for (const [testId, expected] of Object.entries(CONCENTRIC_LG_ROUND)) {
    expect(Math.abs((await radius(page, testId)) - expected), testId).toBeLessThanOrEqual(TOLERANCE)
  }
  await choose(page, 'corners', 'none')
  for (const testId of Object.keys(CONCENTRIC_LG_ROUND)) {
    expect(await radius(page, testId), testId).toBe(0)
  }
})

test('pads a control and a row the same outside and inside surfaces of levels 1 to 3', async ({ page }) => {
  await page.goto(FOUNDATION)
  for (const [corners, curve] of PADDING_CASES) {
    await choose(page, 'corners', corners)
    await choose(page, 'curve', curve)
    for (const recipe of ['control', 'row'] as const) {
      const outside = await padding(page.getByTestId(`${recipe}-page`))
      for (const place of SURFACE_CONTROLS) {
        expect(await padding(page.getByTestId(`${recipe}-${place}`)), `${corners} ${curve} ${recipe} in ${place}`).toBe(outside)
      }
    }
  }
})

test('pads a control on the page the same as in an island, a card and a dialog', async ({ page }) => {
  await page.goto(OVERLAYS)
  const project = (scope: Locator): Locator => scope.getByRole('button', { name: 'Project', exact: true })
  const onPage = await padding(project(region(page, 'Page')))
  expect(await padding(project(island(page)))).toBe(onPage)
  expect(await padding(project(region(page, 'Card')))).toBe(onPage)
  await region(page, 'Card').getByRole('button', { name: 'Chapter settings' }).click()
  expect(await padding(project(page.getByRole('dialog', { name: 'Chapter settings' })))).toBe(onPage)
})

test('switches the state ladder of the control with the mode', async ({ page }) => {
  await page.goto(FOUNDATION)
  for (const mode of ['light', 'dark'] as const) {
    await choose(page, 'mode', mode)
    for (const [state, expected] of Object.entries(STATE_STEPS[mode])) {
      await expect.poll(() => stateStepOf(page, `state-${state}`), `${mode} ${state}`).toBeCloseTo(expected, 3)
    }
  }
})

test('steps the state of a control under the pointer at once, with no animation', async ({ page }) => {
  await page.goto(FOUNDATION)
  const button = page.getByTestId('focus-outer')
  await button.hover()
  expect(await button.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  expect(await stateStepOf(page, 'focus-outer')).toBeCloseTo(STATE_STEPS.light.hover, 3)
})

test('applies the saved choices before the first frame and before the application loads', async ({ page }) => {
  await page.addInitScript(
    ({ key, record, firstFrame, contentLoaded }) => {
      localStorage.setItem(key, record)
      const snapshot = () =>
        JSON.stringify(['mode', 'accent', 'corners'].map((axis) => document.documentElement.getAttribute(`data-${axis}`)))
      requestAnimationFrame(() => sessionStorage.setItem(firstFrame, snapshot()))
      document.addEventListener('DOMContentLoaded', () => sessionStorage.setItem(contentLoaded, snapshot()))
    },
    {
      key: THEME_CONFIG.storageKey,
      record: JSON.stringify({ version: THEME_CONFIG.storageVersion, choices: SAVED }),
      firstFrame: FIRST_FRAME,
      contentLoaded: CONTENT_LOADED,
    },
  )
  await page.goto(FOUNDATION)
  const expected = JSON.stringify([SAVED.mode, SAVED.accent, SAVED.corners])
  await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(key), FIRST_FRAME)).toBe(expected)
  expect(await page.evaluate((key) => sessionStorage.getItem(key), CONTENT_LOADED)).toBe(expected)
})

test('follows the system color scheme in system mode with the theme script alone', async ({ page }) => {
  await page.route(APPLICATION_SCRIPTS, (route) => route.abort())
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(FOUNDATION)
  const root = page.locator(ROOT)
  await expect(root).toHaveAttribute('data-mode', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(root).toHaveAttribute('data-mode', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).toHaveAttribute('data-mode', 'light')
})

test('shows the focus ring of a field after a click and of a button only after keyboard input', async ({ page }) => {
  await visit(page, OVERLAYS)
  const root = page.locator(ROOT)
  const field = island(page).getByRole('textbox', { name: 'Search' })
  const outline = (target: Locator): Promise<string> => target.evaluate((element) => getComputedStyle(element).outlineStyle)
  const control = field.locator('xpath=..')
  const clear = island(page).getByRole('button', { name: 'Clear search' })
  await clear.click()
  await expect(root).toHaveAttribute('data-input', 'pointer')
  expect(await outline(clear)).toBe('none')
  await field.click()
  await expect(field).toBeFocused()
  expect(await outline(control)).toBe('solid')
  await page.keyboard.press('Tab')
  await expect(root).toHaveAttribute('data-input', 'keyboard')
  await expect(clear).toBeFocused()
  expect(await outline(clear)).toBe('solid')
  await page.keyboard.press('Shift+Tab')
  await expect(root).toHaveAttribute('data-input', 'keyboard')
  await expect(field).toBeFocused()
  expect(await outline(control)).toBe('solid')
})

test('draws the outer and the inset focus samples with the focus recipe', async ({ page }) => {
  await visit(page, FOUNDATION)
  const outer = page.getByTestId('focus-outer')
  const inset = page.getByTestId('focus-inset')
  const ring = (target: Locator): Promise<string> =>
    target.evaluate((element) => {
      const style = getComputedStyle(element)
      return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineOffset}`
    })
  const output = (name: string): Promise<string> =>
    page.evaluate((property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(), name)
  const width = await output('--ts-focus-width')
  expect(await ring(outer)).toMatch(/^none /)
  await outer.focus()
  await page.keyboard.press('Tab')
  await expect(inset).toBeFocused()
  expect(await ring(inset)).toBe(`solid ${width} ${await output('--ts-focus-offset-inset')}`)
  await page.keyboard.press('Shift+Tab')
  await expect(outer).toBeFocused()
  expect(await ring(outer)).toBe(`solid ${width} ${await output('--ts-focus-offset')}`)
  expect(await ring(inset)).toMatch(/^none /)
})

test('moves only transform and opacity through the overlays screen', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the trace comes from the Chrome DevTools protocol')
  await page.addInitScript(recordAnimations)
  await visit(page, OVERLAYS)
  await choose(page, 'motion', 'elastic')
  const scope = island(page)
  const tooltip = page.locator('[data-variant="tooltip"]')
  await clearRecorded(page)
  const trace = await startTrace(page)

  const view = scope.getByRole('radiogroup', { name: 'View' })
  for (const name of ['Panels', 'Bubbles', 'Timeline', 'Panels']) await view.getByRole('radio', { name }).hover()
  const timeline = view.getByRole('radio', { name: 'Timeline' })
  await timeline.hover()
  await page.mouse.down()
  await page.mouse.up()
  await expect(timeline).toHaveAttribute('aria-checked', 'true')

  await scope.getByRole('button', { name: 'Select', exact: true }).hover()
  await expect(tooltip).toHaveText('Select')
  for (const name of ['Pan', 'Draw bubble', 'Erase text']) await scope.getByRole('button', { name, exact: true }).hover()
  await expect(tooltip).toHaveText('Erase text')

  await scope.getByRole('button', { name: 'Project', exact: true }).click()
  const menus = page.getByRole('menu')
  for (const name of ['Open', 'Show bubbles', 'Delete project', 'Duplicate']) await hover(page, row(menus, name))
  await page.keyboard.press('Escape')
  await expect(menus).toHaveCount(0)

  await scope.getByRole('button', { name: 'Quick edit', exact: true }).click()
  await page.getByRole('dialog', { name: 'Quick edit' }).getByRole('button', { name: 'Project', exact: true }).click()
  await hover(page, row(menus.first(), 'Export'))
  await expect(menus).toHaveCount(2)
  await hover(page, row(menus.nth(1), 'Video'))
  await expect(menus).toHaveCount(3)
  await hover(page, row(menus.nth(2), 'WebM'))
  await page.waitForTimeout(SETTLE)
  const events = await trace.stop()

  expect(offCompositor(await recorded(page))).toEqual([])
  expect(events.some((event) => event.name === 'Animation')).toBe(true)
  expect(failures(events)).toEqual([])
})

test('moves nothing on the overlays screen with the motion off', async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await visit(page, OVERLAYS)
  await choose(page, 'motion', 'off')
  const scope = island(page)
  const menus = page.getByRole('menu')
  await clearRecorded(page)

  const view = scope.getByRole('radiogroup', { name: 'View' })
  await view.getByRole('radio', { name: 'Bubbles' }).hover()
  await view.getByRole('radio', { name: 'Timeline' }).click()
  await expect(view.getByRole('radio', { name: 'Timeline' })).toHaveAttribute('aria-checked', 'true')
  await scope.getByRole('button', { name: 'Select', exact: true }).hover()
  await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Select')
  await scope.getByRole('button', { name: 'Pan', exact: true }).hover()
  await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Pan')
  await scope.getByRole('button', { name: 'Project', exact: true }).click()
  for (const name of ['Open', 'Show bubbles', 'Export']) await hover(page, row(menus, name))
  await expect(menus).toHaveCount(2)
  await hover(page, row(menus.nth(1), 'Video'))
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await expect(menus).toHaveCount(0)
  await region(page, 'Card').getByRole('button', { name: 'Chapter settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Chapter settings' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)

  expect(await recorded(page)).toEqual([])
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
})

test('keeps at most two backdrop filters with a popover over a dialog', async ({ page }) => {
  await page.goto(OVERLAYS)
  await choose(page, 'material', 'translucent')
  await region(page, 'Card').getByRole('button', { name: 'Chapter settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Chapter settings' })
  await dialog.getByRole('button', { name: 'Style', exact: true }).click()
  const popover = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Bubble style' }) })
  await popover.getByRole('button', { name: 'Project', exact: true }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  const blurs = await countStyled(page, 'backdropFilter', 'blur')
  expect(blurs).toBeGreaterThan(0)
  expect(blurs).toBeLessThanOrEqual(VISIBLE_BLURS)
})

test.describe('at DPR 1.5', () => {
  test.use({ viewport: LAYER_VIEWPORT, deviceScaleFactor: LAYER_RATIO })

  test('gives no pill and no content over a pill a compositor layer at rest', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit has no CDP LayerTree, see docs/structure.md')
    await visit(page, EDGES)
    const groups = region(page, 'Eight groups')
    await groups.scrollIntoViewIfNeeded()
    await expect(groups.locator('[data-recipe="indicator"][data-visible="true"]')).toHaveCount(EIGHT_GROUPS)
    const layers = await watchLayers(page)
    const rest = await layers.now()
    expect(rest.count).toBeGreaterThan(0)
    expect(rest.layers.filter((layer) => layer.part !== 'other')).toEqual([])
  })

  test('keeps the compositor layers within budget while a group and a menu move their pills', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit has no CDP LayerTree, see docs/structure.md')
    await visit(page, OVERLAYS)
    const layers = await watchLayers(page)
    const views = island(page).getByRole('radiogroup', { name: 'View', exact: true }).getByRole('radio')
    await views.first().hover()
    await layers.now()
    const group = await layers.peak(() => views.last().hover())
    expect(group.layers.filter((layer) => layer.part === 'pill').length).toBeGreaterThan(0)
    expect(group.count).toBeLessThanOrEqual(LONG_LIVED_LAYERS)

    await island(page).getByRole('button', { name: 'Project', exact: true }).click()
    const rows = page.getByRole('menu').getByRole('menuitem')
    await hover(page, rows.first())
    await layers.now()
    const menu = await layers.peak(() => hover(page, rows.nth(1)))
    expect(menu.layers.filter((layer) => layer.part === 'pill').length).toBeGreaterThan(0)
    expect(menu.count).toBeLessThanOrEqual(LONG_LIVED_LAYERS)
  })
})

for (const ratio of BUSY_RATIOS) {
  test.describe(`with a busy button at DPR ${ratio}`, () => {
    test.use({ viewport: LAYER_VIEWPORT, deviceScaleFactor: ratio })

    test('adds exactly one compositor layer of its own to the page while the loop runs, at rest and under an open menu', async ({
      page,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'WebKit has no CDP LayerTree, see docs/structure.md')
      await visit(page, EDGES)
      const icon = busyIcon(page)
      expect(await loopProperties(icon)).toEqual(['rotate'])
      const groups = region(page, 'Eight groups')
      await groups.scrollIntoViewIfNeeded()
      await page.mouse.move(0, 0)
      const layers = await watchLayers(page)

      const rest = await layers.now()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      expect(await loopProperties(icon)).toEqual([])
      expectOnlyTheLoopLayer(rest, await layers.now())

      await page.emulateMedia({ reducedMotion: 'no-preference' })
      expect(await loopProperties(icon)).toEqual(['rotate'])
      await layers.peak(() => groups.getByRole('button', { name: 'Groups menu', exact: true }).click())
      await expect(page.getByRole('menu')).toBeVisible()
      await settle(page)
      const spinning = await layers.now()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      expect(await loopProperties(icon)).toEqual([])
      expectOnlyTheLoopLayer(spinning, await layers.now())
    })
  })
}

function busyIcon(page: Page): Locator {
  return region(page, 'States').getByRole('button', { name: 'Saving', exact: true }).locator('[data-slot="icon"]')
}

function layerNames(layers: LayerCount['layers']): string[] {
  return layers.map((layer) => `${layer.reasons.join('+')} ${layer.node}`).sort()
}

function expectOnlyTheLoopLayer(spinning: LayerCount, still: LayerCount): void {
  const loop = spinning.layers.filter((layer) => layer.reasons.includes(SPIN_REASON))
  expect(loop).toHaveLength(1)
  expect(layerNames(spinning.layers.filter((layer) => !loop.includes(layer)))).toEqual(layerNames(still.layers))
  expect(spinning.count).toBeLessThanOrEqual(LONG_LIVED_LAYERS)
}

function look(target: Locator): Promise<{ background: string; color: string; border: string; shadow: string }> {
  return target.evaluate((element) => {
    const paint = getComputedStyle(element, element.matches('[data-recipe="control"]') ? '::before' : null)
    return { background: paint.backgroundColor, color: getComputedStyle(element).color, border: paint.borderTopColor, shadow: paint.boxShadow }
  })
}

test('fills a solid control with the role of its tone and writes its on-* text, with the accent by default', async ({ page }) => {
  await page.goto(FOUNDATION)
  const paint = async (target: Locator): Promise<{ background: string; color: string }> => {
    const { background, color } = await look(target)
    return { background: await srgbOf(page, background), color }
  }
  for (const tone of TONES) {
    const [fill, text] = TONE_ROLES[tone]
    expect(await paint(page.getByTestId(`tone-solid-${tone}`)), tone).toEqual({
      background: await srgbOf(page, `var(--ts-color-${fill})`),
      color: await colorOf(page, `var(--ts-color-${text})`),
    })
  }
  expect(await paint(page.getByTestId('tone-solid-none'))).toEqual({
    background: await srgbOf(page, 'var(--ts-color-tint)'),
    color: await colorOf(page, 'var(--ts-color-on-tint)'),
  })
})

test('keeps a raised control with a tone raised and colours only its text and its state step', async ({ page }) => {
  await page.goto(FOUNDATION)
  const shadow = await raisedShadow(page)
  const plain = await look(page.getByTestId('tone-raised-none'))
  for (const tone of COLOURED_TONES) {
    const target = page.getByTestId(`tone-raised-${tone}`)
    const roleOf = `var(--ts-color-${TONE_ROLES[tone][0]})`
    const { background, color, shadow: lifted } = await look(target)
    expect({ background, color, shadow: lifted }, tone).toEqual({ background: plain.background, color: await colorOf(page, roleOf), shadow })
    await target.evaluate((element) => element.setAttribute('data-popup-open', ''))
    expect(await srgbOf(page, (await look(target)).background), tone).toBe(
      await srgbOf(page, `color-mix(in oklab, ${roleOf} calc(var(--ts-state-tint-hover) * 100%), var(--ts-depth-raised-bg))`),
    )
  }
})

test('tints the soft step and the outline border with a tone and keeps the ink ladder without one', async ({ page }) => {
  await page.goto(FOUNDATION)
  expect((await look(page.getByTestId('tone-soft-danger'))).background).toBe(
    await colorOf(page, 'color-mix(in oklab, var(--ts-color-danger) calc(var(--ts-state-tint-rest) * 100%), transparent)'),
  )
  const plain = (await look(page.getByTestId('tone-soft-none'))).background
  expect(plain).toBe(await colorOf(page, 'color-mix(in oklab, var(--ts-state-ink) calc(var(--ts-state-rest) * 100%), transparent)'))
  expect(alphaOf(plain)).toBeCloseTo(STATE_STEPS.light.rest, 3)
  expect((await look(page.getByTestId('tone-outline-danger'))).border).toBe(
    await colorOf(page, 'color-mix(in oklab, var(--ts-color-danger) calc(var(--ts-state-tint-border) * 100%), transparent)'),
  )
})

test('colours the text of a row with its tone', async ({ page }) => {
  await page.goto(FOUNDATION)
  expect((await look(page.getByTestId('tone-row-none'))).color).toBe(await colorOf(page, 'var(--ts-color-label)'))
  for (const tone of TONES) {
    expect((await look(page.getByTestId(`tone-row-${tone}`))).color, tone).toBe(await colorOf(page, `var(--ts-color-${TONE_ROLES[tone][0]})`))
  }
})

test('fills a surface with its tone over the level background, keeps the level shadow and draws no border', async ({ page }) => {
  await page.goto(FOUNDATION)
  const plain = await look(page.getByTestId('tone-surface-none'))
  for (const tone of TONES) {
    const toned = await look(page.getByTestId(`tone-surface-${tone}`))
    expect(toned.border, tone).toBe('rgba(0, 0, 0, 0)')
    expect(toned.shadow, tone).toBe(plain.shadow)
    expect(toned.background, tone).not.toBe(plain.background)
  }
})

test('paints the selected fill on a pressed control, never on a checked switch or a checked row', async ({ page }) => {
  await page.goto(FOUNDATION)
  const fill = await page.getByTestId('state-selected-fill').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  expect(fill).toBeGreaterThan(0)
  expect(await stateStepOf(page, 'state-pressed')).toBeCloseTo(fill, 3)
  expect(await stateStepOf(page, 'state-not-pressed')).toBe(0)
  expect(await stateStepOf(page, 'state-checked')).toBe(0)
  expect(await stateStepOf(page, 'row-checked')).toBe(0)
})

test('keeps a static span with the control recipe still under the pointer, with the default cursor', async ({ page }) => {
  await page.goto(FOUNDATION)
  await choose(page, 'platform', 'web')
  const button = page.getByTestId('focus-outer')
  await button.hover()
  await expect.poll(() => stateStepOf(page, 'focus-outer')).toBeGreaterThan(0)
  expect(await button.evaluate((element) => getComputedStyle(element).cursor)).toBe('pointer')
  const badge = page.getByTestId('variant-ghost')
  await badge.hover()
  await page.waitForTimeout(SETTLE)
  expect(await stateStepOf(page, 'variant-ghost')).toBe(0)
  expect(await badge.evaluate((element) => getComputedStyle(element).cursor)).toBe('default')
})

test('draws no border around a base island and a raised card in either mode and keeps the card shadow', async ({ page }) => {
  await page.goto(OVERLAYS)
  for (const mode of ['light', 'dark'] as const) {
    await choose(page, 'mode', mode)
    for (const name of ['Island', 'Card']) {
      expect(await region(page, name).evaluate((element) => getComputedStyle(element).borderTopColor), `${mode} ${name}`).toBe('rgba(0, 0, 0, 0)')
    }
    expect(await region(page, 'Card').evaluate((element) => getComputedStyle(element).boxShadow), mode).toBe(await raisedShadow(page))
  }
})

test('outlines an invalid field in the invalid colour and keeps a read-only field still under the pointer', async ({ page }) => {
  await visit(page, EDGES)
  const states = region(page, 'States')
  const invalid = await colorOf(page, 'var(--ts-state-invalid-color)')
  const wrapper = (name: string): Locator => states.getByRole('textbox', { name, exact: true }).locator('xpath=..')
  const border = (name: string): Promise<string> => wrapper(name).evaluate((element) => getComputedStyle(element, '::before').borderTopColor)
  const settled = async (name: string): Promise<{ step: number; rest: number; hover: number } | null> => {
    const found = await wrapper(name).evaluate((element) => {
      if (element.getAnimations({ subtree: true }).length > 0) return null
      const style = getComputedStyle(element)
      const read = (property: string): number => Number.parseFloat(style.getPropertyValue(property))
      return { background: getComputedStyle(element, '::before').backgroundColor, rest: read('--ts-state-rest'), hover: read('--ts-state-hover') }
    })
    return found && { step: alphaOf(found.background), rest: found.rest, hover: found.hover }
  }
  expect(await border('Invalid field')).toBe(invalid)
  const email = states.getByRole('textbox', { name: 'E-mail field', exact: true })
  expect(await border('E-mail field')).not.toBe(invalid)
  await email.fill('not an email')
  await page.keyboard.press('Tab')
  expect(await border('E-mail field')).toBe(invalid)
  for (const [name, state] of [
    ['E-mail field', 'hover'],
    ['Read-only field', 'rest'],
  ] as const) {
    await wrapper(name).hover()
    await expect
      .poll(async () => {
        const found = await settled(name)
        return found && Math.abs(found.step - found[state]) <= STATE_PRECISION && found.rest !== found.hover
      }, name)
      .toBe(true)
  }
})

function loopProperties(target: Locator): Promise<string[]> {
  return target.evaluate((element) => {
    const timing = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    const properties = element
      .getAnimations()
      .flatMap((animation) => (animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes().flatMap((frame) => Object.keys(frame)) : []))
    return [...new Set(properties.filter((property) => !timing.has(property)))]
  })
}

test('turns the icon of a busy button by rotate only and stops it with the motion off and reduced motion', async ({ page }) => {
  await page.goto(EDGES)
  const icon = busyIcon(page)
  expect(await loopProperties(icon)).toEqual(['rotate'])
  await choose(page, 'motion', 'off')
  expect(await loopProperties(icon)).toEqual([])
  await choose(page, 'motion', 'spring')
  expect(await loopProperties(icon)).toEqual(['rotate'])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await loopProperties(icon)).toEqual([])
})

test('indents a tree row by its aria-level and every level from the eighth by seven steps', async ({ page }) => {
  await page.goto(FOUNDATION)
  const start = (level: number): Promise<number> =>
    page.getByTestId(`tree-level-${level}`).evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart))
  const indent = await page.getByTestId('tree-level-1').evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--ts-space-indent')))
  expect(indent).toBeGreaterThan(0)
  const first = await start(1)
  for (const [level, steps] of TREE_INDENT) expect(await start(level), `level ${level}`).toBeCloseTo(first + steps * indent, 1)
})

test('takes the stroke width of an icon in a control and a row from the size engine, also over its own attribute', async ({ page }) => {
  await page.goto(FOUNDATION)
  for (const size of Object.keys(CONTROL_HEIGHT)) {
    for (const testId of [`size-${size}`, `row-${size}`]) {
      const [stroke, expected] = await page.getByTestId(testId).evaluate((element) => {
        const icon = element.querySelector('[data-slot="icon"] > svg')
        if (!icon) throw new Error('no icon')
        icon.setAttribute('stroke-width', '2')
        return [Number.parseFloat(getComputedStyle(icon).strokeWidth), Number.parseFloat(getComputedStyle(element).getPropertyValue('--ts-size-icon-stroke'))]
      })
      expect(expected, testId).toBeGreaterThan(0)
      expect(stroke, testId).toBeCloseTo(expected ?? 0, 3)
    }
  }
})

test('gives an elastic subtree inside a subtree with the motion off the times and curves of elastic', async ({ page }) => {
  await page.goto(FOUNDATION)
  const [nested, alone] = await page.evaluate((names) => {
    const read = (element: Element): string[] => names.map((name) => getComputedStyle(element).getPropertyValue(`--ts-motion-${name}`).trim())
    const off = document.createElement('div')
    off.dataset.motion = 'off'
    const inner = document.createElement('div')
    inner.dataset.motion = 'elastic'
    off.append(inner)
    const plain = document.createElement('div')
    plain.dataset.motion = 'elastic'
    document.body.append(off, plain)
    const values = [read(inner), read(plain)]
    off.remove()
    plain.remove()
    return values
  }, MOTION_NAMES)
  expect(nested).toEqual(alone)
  expect(Number.parseFloat(nested?.[MOTION_NAMES.indexOf('duration-slide')] ?? '0')).toBeGreaterThan(0)
  expect(nested?.[MOTION_NAMES.indexOf('mode')]).toBe('elastic')
})

function covers(target: Locator): Promise<boolean> {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2))
  })
}

test('stacks a menu and a popover opened from a dialog over it, a toast over the dialog and a tooltip over the toast', async ({ page }) => {
  await visit(page, OVERLAYS)
  await region(page, 'Card').getByRole('button', { name: 'Chapter settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Chapter settings' })
  await dialog.getByRole('button', { name: 'Project', exact: true }).click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  expect(await covers(menu)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Style', exact: true }).click()
  const popover = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Bubble style' }) })
  await expect(popover).toBeVisible()
  expect(await covers(popover)).toBe(true)
  const above = await dialog.evaluate((element) => {
    const rect = element.querySelector('h2')?.getBoundingClientRect() ?? new DOMRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const probe = (layer: string): string | null => {
      const layerProbe = document.createElement('div')
      layerProbe.dataset.probe = layer
      layerProbe.style.position = 'fixed'
      layerProbe.style.inset = '0'
      layerProbe.style.zIndex = `var(--ts-depth-layer-${layer})`
      document.body.prepend(layerProbe)
      return document.elementFromPoint(x, y)?.getAttribute('data-probe') ?? null
    }
    const dialogOnTop = element.contains(document.elementFromPoint(x, y))
    const found = [probe('toast'), probe('tooltip')]
    for (const leftover of document.querySelectorAll('[data-probe]')) leftover.remove()
    return { dialogOnTop, found }
  })
  expect(above).toEqual({ dialogOnTop: true, found: ['toast', 'tooltip'] })
})

test('tunes the spring and the hover exit on <html> from the motion lab of the panel and resets them to the engine', async ({ page }) => {
  await visit(page, FOUNDATION)
  const read = (name: string): Promise<string> => page.evaluate((property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(), name)
  const engine = await read('--ts-motion-spring-stiffness')
  await page.getByRole('button', { name: 'Motion lab', exact: true }).click()
  const lab = page.getByRole('dialog', { name: 'Motion lab' })
  const stiffness = lab.getByRole('spinbutton', { name: 'Spring stiffness', exact: true })
  await expect(stiffness).toHaveValue(engine)
  await stiffness.fill(TUNED_STIFFNESS)
  await lab.getByRole('spinbutton', { name: 'Firm duration (ms)', exact: true }).fill(TUNED_FIRM)
  await expect(lab.getByRole('radio', { name: 'fade', exact: true })).toBeChecked()
  expect(await read('--ts-in-motion-hover-fade')).toBe('1')
  await lab.getByRole('radio', { name: 'cut', exact: true }).click()
  expect(await read('--ts-motion-spring-stiffness')).toBe(TUNED_STIFFNESS)
  expect(await read('--ts-motion-duration-slide')).toBe(`${TUNED_FIRM}ms`)
  expect(await read('--ts-in-motion-hover-fade')).toBe('0')
  await lab.getByRole('button', { name: 'Reset motion', exact: true }).click()
  expect(await read('--ts-motion-spring-stiffness')).toBe(engine)
  expect(await read('--ts-in-motion-hover-fade')).toBe('1')
  await expect(lab.getByRole('radio', { name: 'fade', exact: true })).toBeChecked()
  expect(await page.evaluate(() => [...document.documentElement.style].filter((property) => property.startsWith('--ts-')))).toEqual([])
})
