import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, choose, clearRecorded, failures, hydrated, recordAnimations, recorded, startTrace, TOOLTIP_EXCEPTIONS } from './helpers'

declare global {
  interface Window {
    tooltipFrames?: TooltipFrame[]
    tooltipOpening?: { entered?: number; opened?: number }
    tooltipLeft?: number
    tooltipStrays?: string[]
    tooltipSlide?: string[]
    tooltipFade?: number
  }
}

type ShownLabel = { readonly text: string; readonly leaving: boolean; readonly opacity: number; readonly filter: string; readonly spill: number }
type Point = { readonly x: number; readonly y: number }
type ShownTip = {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly opacity: number
  readonly open: boolean
  readonly scale: string
  readonly transform: string
  readonly side: string
  readonly labels: readonly ShownLabel[]
  readonly arrow: Point | null
}
type TooltipFrame = { readonly time: number; readonly tips: readonly ShownTip[] }

const PAGE = '/components'
const OVERLAYS = '/screens/overlays'
const SETTLE = 600
const GAP_PAUSE = 20
const STILL = 1000
const JITTER_STEPS = 10
const OUTSIDE_X = 4
const SCROLL = 120
const PIXEL = 0.5
const WHOLE_PIXEL_SNAP = 1.5
const FADE_LEAST = 60
const OPEN_DELAY = 400
const CLOSE_DELAY = 100
const GRACE = 400
const AT_ONCE = 100
const APPEAR_SHIFT = 4
const SCALES = [1, 1.25, 1.5] as const
const BAR_MOVES = ['translate', 'width', 'opacity', 'filter', 'scale']
const LONE_MOVES = ['translate', 'opacity']
const GAP_HOLD = 400
const EDGE_ROOM = 2
const BRIGHT = 0.8
const DIM = 0.3
const FULL = 0.99

async function flights(page: Page): Promise<{ properties: readonly string[] }[]> {
  return (await recorded(page)).filter((animation) => animation.tooltip).map(({ properties }) => ({ properties }))
}

function flown(list: readonly { properties: readonly string[] }[]): Set<string> {
  return new Set(list.flatMap(({ properties }) => properties))
}

async function recordTooltips(page: Page): Promise<void> {
  await page.evaluate(() => {
    const frames: TooltipFrame[] = []
    window.tooltipFrames = frames
    const shown = (popup: HTMLElement): boolean => {
      const style = getComputedStyle(popup)
      return popup.matches(':popover-open') && style.visibility === 'visible' && Number(style.opacity) > 0
    }
    const read = (popup: HTMLElement): ShownTip => {
      const rect = popup.getBoundingClientRect()
      const style = getComputedStyle(popup)
      const labels = [...popup.querySelectorAll<HTMLElement>('[data-slot="label"]')].map((label) => {
        const seen = getComputedStyle(label)
        const spill = label.getBoundingClientRect().width - (label.parentElement?.getBoundingClientRect().width ?? 0)
        return { text: label.textContent ?? '', leaving: label.hasAttribute('data-leaving'), opacity: Number(seen.opacity), filter: seen.filter, spill }
      })
      const arrow = popup.querySelector('[data-slot="arrow"]')?.getBoundingClientRect()
      return {
        text: labels.find((label) => !label.leaving)?.text ?? '',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        opacity: Number(style.opacity),
        open: popup.hasAttribute('data-open'),
        scale: style.scale,
        transform: style.transform,
        side: popup.getAttribute('data-side') ?? '',
        labels,
        arrow: arrow ? { x: arrow.x + arrow.width / 2, y: arrow.y + arrow.height / 2 } : null,
      }
    }
    const tick = (time: number): void => {
      if (window.tooltipFrames !== frames) return
      frames.push({ time, tips: [...document.querySelectorAll<HTMLElement>('[data-variant="tooltip"]')].filter(shown).map(read) })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function tooltipFrames(page: Page): Promise<TooltipFrame[]> {
  return page.evaluate(() => window.tooltipFrames ?? [])
}

async function watch(page: Page, action: () => Promise<unknown>): Promise<TooltipFrame[]> {
  await recordTooltips(page)
  await action()
  await page.waitForTimeout(SETTLE)
  return tooltipFrames(page)
}

function centre(rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function openOf(frame: TooltipFrame): ShownTip[] {
  return frame.tips.filter((tip) => tip.open)
}

function shownTips(frames: readonly TooltipFrame[]): ShownTip[] {
  return frames.flatMap((frame) => frame.tips)
}

function ofText(frames: readonly TooltipFrame[], text: string): ShownTip[] {
  return shownTips(frames).filter((tip) => tip.text === text)
}

async function moveOffTriggers(page: Page, x: number, y: number): Promise<void> {
  const trigger = await page.evaluate(
    ([left, top]) => document.elementFromPoint(left, top)?.closest('[data-tooltip-trigger]')?.outerHTML ?? null,
    [x, y] as const,
  )
  expect(trigger).toBeNull()
  await page.mouse.move(x, y)
}

async function openingTime(page: Page, trigger: Locator, text: string): Promise<number> {
  const { x, y } = centre(await box(trigger))
  await trigger.evaluate((_element, label) => {
    const opening: { entered?: number; opened?: number } = { entered: performance.now() }
    window.tooltipOpening = opening
    const observer = new MutationObserver(() => {
      const open = [...document.querySelectorAll('[data-variant="tooltip"][data-open]')].some((popup) => popup.textContent === label)
      if (!open || opening.entered === undefined) return
      opening.opened = performance.now()
      observer.disconnect()
    })
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
  }, text)
  await page.mouse.move(x, y)
  await expect(page.locator('[data-variant="tooltip"][data-open]', { hasText: text })).toHaveCount(1)
  return page.evaluate(() => (window.tooltipOpening?.opened ?? Number.NaN) - (window.tooltipOpening?.entered ?? Number.NaN))
}

function focusTime(trigger: Locator): Promise<number> {
  return trigger.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const start = performance.now()
        const poll = (): void => {
          if (document.querySelector('[data-variant="tooltip"][data-open]')) return resolve(performance.now() - start)
          if (performance.now() - start > 1000) return resolve(Number.NaN)
          requestAnimationFrame(poll)
        }
        if (element instanceof HTMLElement) element.focus()
        poll()
      }),
  )
}

async function shownAgainAfterClosing(page: Page): Promise<number> {
  const frames = await tooltipFrames(page)
  const closed = frames.findIndex((frame) => frame.tips.length === 0)
  expect(closed).toBeGreaterThanOrEqual(0)
  return frames.slice(closed).filter((frame) => frame.tips.length > 0).length
}

function tipTrigger(page: Page, name: string): Locator {
  return page.getByRole('region', { name: 'Tooltip', exact: true }).getByRole('button', { name, exact: true })
}

function popupOf(page: Page, text: string): Locator {
  return page.locator('[data-variant="tooltip"][data-open]', { hasText: text })
}

async function openTip(page: Page, trigger: Locator, text: string): Promise<Locator> {
  await trigger.scrollIntoViewIfNeeded()
  const { x, y } = centre(await box(trigger))
  await page.mouse.move(x, y)
  const popup = popupOf(page, text)
  await expect(popup).toHaveCount(1)
  await page.waitForTimeout(SETTLE)
  return popup
}

async function hoverAndWait(page: Page, trigger: Locator, text: string): Promise<void> {
  await trigger.hover()
  await expect(popupOf(page, text)).toHaveCount(1)
}

function lightnessOf(popup: Locator, property: 'backgroundColor' | 'color'): Promise<number> {
  return popup.evaluate((element, key) => {
    const probe = document.createElement('div')
    probe.style.color = getComputedStyle(element)[key]
    probe.style.color = `oklab(from ${probe.style.color} l a b)`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return Number.parseFloat(value.replace(/^oklab\(/, ''))
  }, property)
}

type Course = { readonly inside: number; readonly step: number; readonly stray: number; readonly end: number }

function course(frames: readonly TooltipFrame[], start: number, read: (tip: ShownTip) => number): Course {
  const values = [start, ...frames.flatMap((frame) => openOf(frame).slice(0, 1).map(read))]
  const end = values.at(-1) ?? Number.NaN
  const [low, high] = [Math.min(start, end), Math.max(start, end)]
  return {
    end,
    inside: values.filter((value) => Math.abs(value - start) > PIXEL && Math.abs(value - end) > PIXEL).length,
    step: Math.max(...values.slice(1).map((value, index) => Math.abs(value - (values[index] ?? value)))),
    stray: values.filter((value) => value < low - PIXEL || value > high + PIXEL).length,
  }
}

async function crossBar(page: Page, from: string, to: string) {
  const popup = await openTip(page, tipTrigger(page, from), from)
  const handle = await popup.elementHandle()
  const start = await box(popup)
  const target = tipTrigger(page, to)
  const frames = await watch(page, async () => {
    await clearRecorded(page)
    const { x, y } = centre(await box(target))
    await page.mouse.move(x, y)
  })
  return { popup, handle, start, frames, target: await box(target), flights: await flights(page) }
}

const GAPS = [
  { path: PAGE, from: 'Pan', to: 'Draw bubble', bar: true },
  { path: PAGE, from: 'Undo', to: 'Redo', bar: false },
  { path: OVERLAYS, from: 'Pan', to: 'Draw bubble', bar: true },
] as const

test.beforeEach(async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await page.goto(PAGE)
  await hydrated(page)
})

for (const scale of SCALES) {
  test.describe(`at a device scale of ${scale}`, () => {
    test.use({ deviceScaleFactor: scale })

    for (const { path, from, to, bar } of GAPS) {
      test(`keeps a tooltip shown in every frame while the pointer crosses the gap from ${from} to ${to} on ${path}`, async ({ page }) => {
        if (path !== PAGE) {
          await page.goto(path)
          await hydrated(page)
        }
        const source = page.getByRole('button', { name: from, exact: true }).first()
        const target = page.getByRole('button', { name: to, exact: true }).first()
        await source.hover()
        const popup = page.locator('[data-variant="tooltip"]')
        await expect(popup).toHaveText(from)
        const left = await box(source)
        const right = await box(target)
        const y = centre(left).y
        const gap = right.x - (left.x + left.width)
        expect(gap).toBeGreaterThan(1)
        await clearRecorded(page)
        await recordTooltips(page)
        await page.mouse.move(left.x + left.width - 1, y)
        for (const share of [1 / 3, 2 / 3]) {
          await page.mouse.move(left.x + left.width + gap * share, y)
          await page.waitForTimeout(GAP_PAUSE)
        }
        await page.mouse.move(right.x + 1, y)
        await page.mouse.move(centre(right).x, y)
        await expect(popup.filter({ hasText: to })).toBeVisible()
        await page.waitForTimeout(SETTLE)

        const frames = await tooltipFrames(page)
        expect(frames.filter((frame) => (bar ? openOf(frame) : frame.tips).length === 0)).toEqual([])
        expect(frames.at(-1)?.tips.map((tip) => tip.text)).toEqual([to])
        const moved = flown(await flights(page))
        for (const property of moved) expect(bar ? BAR_MOVES : LONE_MOVES, property).toContain(property)
        if (bar) expect(moved.has('translate')).toBe(true)
        else expect(moved.has('width')).toBe(false)
      })
    }
  })
}

test('closes the tooltip of a bar when the pointer leaves the bar through a gap', async ({ page }) => {
  await page.getByRole('button', { name: 'Pan' }).hover()
  const popup = page.locator('[data-variant="tooltip"]')
  await expect(popup).toHaveText('Pan')
  const pan = await box(page.getByRole('button', { name: 'Pan' }))
  const draw = await box(page.getByRole('button', { name: 'Draw bubble' }))
  const gap = (pan.x + pan.width + draw.x) / 2
  await page.mouse.move(gap, centre(pan).y)
  await moveOffTriggers(page, gap, pan.y + pan.height * 2)
  await expect(popup).toHaveCount(0)
})

for (const name of ['Pan', 'Save']) {
  test(`keeps the tooltip of ${name} closed after a click until the pointer leaves and comes back`, async ({ page }) => {
    const trigger = tipTrigger(page, name)
    await trigger.hover()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveCount(1)
    const { x, y } = centre(await box(trigger))
    await recordTooltips(page)
    await page.mouse.down()
    await page.mouse.up()
    for (let step = 0; step < JITTER_STEPS; step += 1) {
      await page.waitForTimeout(STILL / JITTER_STEPS)
      await page.mouse.move(x + (step % 2), y)
    }
    expect(await shownAgainAfterClosing(page)).toBe(0)

    await moveOffTriggers(page, OUTSIDE_X, y)
    await expect(popup).toHaveCount(0)
    await page.mouse.move(x, y)
    await expect(popup).toHaveCount(1)
  })
}

test('opens the first tooltip the open delay after the pointer enters its trigger', async ({ page }) => {
  const save = tipTrigger(page, 'Save')
  await save.scrollIntoViewIfNeeded()
  await moveOffTriggers(page, OUTSIDE_X, centre(await box(save)).y)
  const time = await openingTime(page, save, 'Saves the chapter')
  expect(time).toBeGreaterThanOrEqual(OPEN_DELAY - AT_ONCE / 2)
  expect(time).toBeLessThan(OPEN_DELAY + AT_ONCE)
})

test('opens the tooltip of a neighbour in a bar at once right after a click', async ({ page }) => {
  const pan = page.getByRole('button', { name: 'Pan' })
  await pan.hover()
  await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Pan')
  await page.mouse.down()
  await page.mouse.up()
  expect(await openingTime(page, page.getByRole('button', { name: 'Draw bubble' }), 'Draw bubble')).toBeLessThan(AT_ONCE)
})

test('builds one tooltip element on the top layer for a whole bar and for a lone trigger', async ({ page }) => {
  const save = tipTrigger(page, 'Save')
  const lone = await openTip(page, save, 'Saves the chapter')
  const facts = await lone.evaluate((popup) => ({
    popover: popup.getAttribute('popover'),
    top: popup.matches(':popover-open'),
    role: popup.getAttribute('role'),
    parent: popup.parentElement === document.body,
    side: popup.getAttribute('data-side'),
    widthMatches: Math.abs(popup.getBoundingClientRect().width - Number.parseFloat(popup.style.getPropertyValue('--ts-i-tip-width'))) <= 0.5,
    positioned: popup.style.getPropertyValue('--ts-i-tip-x') !== '' && popup.style.getPropertyValue('--ts-i-tip-y') !== '',
    id: popup.id,
  }))
  expect(facts).toMatchObject({ popover: 'manual', top: true, role: 'tooltip', parent: true, side: 'top', widthMatches: true, positioned: true })
  await expect(save).toHaveAttribute('aria-describedby', facts.id)
  await page.mouse.move(0, 0)
  await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)

  expect(await page.locator('[data-tooltip-trigger]').count()).toBeGreaterThan(0)
  expect(await page.locator('[data-base-ui-tooltip-trigger]').count()).toBe(0)
  const popups = page.locator('[data-variant="tooltip"]')
  for (const name of ['Select', 'Pan', 'Draw bubble']) {
    await tipTrigger(page, name).hover()
    await expect(popupOf(page, name)).toHaveCount(1)
    await expect(popups).toHaveCount(1)
  }
})

test('fades a tooltip in while it slides the appear shift from the trigger and never scales it', async ({ page }) => {
  await page.evaluate(() => {
    window.tooltipSlide = []
    document.addEventListener('transitionrun', (event) => {
      const popup = event.target
      if (!(popup instanceof HTMLElement) || !popup.matches('[data-variant="tooltip"]')) return
      if (event.propertyName === 'opacity') {
        const fade = popup.getAnimations().find((animation) => animation instanceof CSSTransition && animation.transitionProperty === 'opacity')
        window.tooltipFade = Number(fade?.effect?.getComputedTiming().duration ?? 0)
      }
      if (event.propertyName !== 'translate') return
      const effect = popup.getAnimations().find((animation) => animation instanceof CSSTransition && animation.transitionProperty === 'translate')?.effect
      const frames = effect instanceof KeyframeEffect ? effect.getKeyframes() : []
      window.tooltipSlide = frames.map((frame) => String(frame['translate'] ?? ''))
    })
  })
  const frames = await watch(page, () => hoverAndWait(page, tipTrigger(page, 'Save'), 'Saves the chapter'))
  const tips = shownTips(frames)
  const [first, last] = [tips[0], tips.at(-1)]
  if (!first || !last) throw new Error('no tooltip frame')
  expect(first.opacity).toBeLessThan(FULL)
  expect(last.opacity).toBeGreaterThanOrEqual(FULL)
  const slide = (await page.evaluate(() => window.tooltipSlide ?? [])).map((value) => Number.parseFloat(value.split(' ')[1] ?? '0'))
  expect(slide).toHaveLength(2)
  expect((slide[0] ?? 0) - (slide[1] ?? 0)).toBeGreaterThan(PIXEL)
  expect((slide[0] ?? 0) - (slide[1] ?? 0)).toBeLessThanOrEqual(APPEAR_SHIFT + PIXEL)
  expect(Math.abs(first.x - last.x)).toBeLessThanOrEqual(PIXEL)
  expect(Math.abs(first.width - last.width)).toBeLessThanOrEqual(PIXEL)
  expect(tips.filter((tip) => tip.scale !== 'none' || tip.transform !== 'none')).toEqual([])
  const rising = tips.map((tip) => tip.opacity)
  expect(rising).toEqual([...rising].sort((a, b) => a - b))
  const fade = await page.evaluate(() => window.tooltipFade ?? 0)
  expect(fade).toBeGreaterThan(FADE_LEAST)
  expect(fade).toBeLessThan(400)
})

for (const target of ['Save', 'Pan'] as const) {
  test(`closes the tooltip of ${target} the close delay after the pointer leaves, fading it out before it leaves the top layer`, async ({ page }) => {
    const trigger = tipTrigger(page, target)
    const text = target === 'Save' ? 'Saves the chapter' : 'Pan'
    const popup = await openTip(page, trigger, text)
    const rect = await box(trigger)
    const exit = target === 'Save' ? { x: OUTSIDE_X, y: centre(rect).y } : { x: centre(rect).x, y: rect.y + rect.height * 2 }
    await trigger.evaluate((element) => element.addEventListener('pointerleave', () => (window.tooltipLeft = performance.now()), { once: true }))
    const frames = await watch(page, () => moveOffTriggers(page, exit.x, exit.y))
    const left = await page.evaluate(() => window.tooltipLeft ?? Number.NaN)
    const after = frames.filter((frame) => frame.time >= left)
    const closing = after.find((frame) => openOf(frame).length === 0)
    const gone = after.find((frame) => frame.tips.length === 0)
    expect((closing?.time ?? Number.NaN) - left).toBeGreaterThanOrEqual(CLOSE_DELAY - AT_ONCE / 5)
    expect((closing?.time ?? Number.NaN) - left).toBeLessThan(CLOSE_DELAY + AT_ONCE * 2)
    const fading = after.filter((frame) => frame.tips.length > 0 && openOf(frame).length === 0).flatMap((frame) => frame.tips.map((tip) => tip.opacity))
    expect(fading.length).toBeGreaterThan(0)
    expect(fading).toEqual([...fading].sort((a, b) => b - a))
    expect((gone?.time ?? Number.NaN) - (closing?.time ?? Number.NaN)).toBeGreaterThan(0)
    expect((gone?.time ?? Number.NaN) - (closing?.time ?? Number.NaN)).toBeLessThan(AT_ONCE * 2)
    await expect(popup).toHaveCount(0)
    await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)
  })
}

for (const scroll of ['wheel', 'scrollBy'] as const) {
  test(`opens a tooltip of a bar on its place right after the page scrolls by ${scroll}`, async ({ page }) => {
    const pan = page.getByRole('button', { name: 'Pan' })
    await pan.scrollIntoViewIfNeeded()
    await page.evaluate((by) => window.scrollBy(0, -by), SCROLL)
    await pan.hover()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveText('Pan')
    const before = centre(await box(pan))
    await moveOffTriggers(page, OUTSIDE_X, before.y)
    await expect(popup).toHaveCount(0)
    if (scroll === 'wheel') await page.mouse.wheel(0, SCROLL)
    else await page.evaluate((by) => window.scrollBy(0, by), SCROLL)
    await expect.poll(async () => centre(await box(pan)).y).toBeCloseTo(before.y - SCROLL, 0)
    await clearRecorded(page)
    await recordTooltips(page)
    await pan.hover()
    await expect(popup).toHaveText('Pan')
    await page.waitForTimeout(SETTLE)

    const placed = await box(popup)
    const first = (await tooltipFrames(page)).find((frame) => frame.tips.length > 0)?.tips[0]
    expect(Math.abs((first?.x ?? Number.NaN) - placed.x)).toBeLessThanOrEqual(PIXEL)
    expect(Math.abs((first?.y ?? Number.NaN) - placed.y)).toBeLessThanOrEqual(APPEAR_SHIFT + PIXEL)
    for (const property of flown(await flights(page))) expect(LONE_MOVES, property).toContain(property)
  })
}

for (const scrolled of ['page', 'panel'] as const) {
  test(`closes a tooltip when a ${scrolled} scrolls and opens the next one beside its own trigger`, async ({ page, browserName }) => {
    const pan: Locator = tipTrigger(page, 'Pan')
    await pan.scrollIntoViewIfNeeded()
    await page.waitForTimeout(SETTLE)
    await pan.focus()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveText('Pan')
    const offset = async (trigger: Locator): Promise<number> => (await box(popup)).y - (await box(trigger)).y
    await page.waitForTimeout(SETTLE)
    const attached = await offset(pan)
    if (scrolled === 'page') {
      await page.evaluate((by) => window.scrollBy(0, by), SCROLL)
    } else {
      const panel = await page.evaluateHandle(() => {
        const element = document.createElement('div')
        element.style.cssText = 'position:fixed;top:0;left:0;width:50px;height:50px;overflow:auto'
        const inner = document.createElement('div')
        inner.style.height = '500px'
        element.append(inner)
        document.body.append(element)
        return element
      })
      await panel.evaluate((element) => (element.scrollTop = 40))
    }
    await expect(popup).toHaveCount(0)
    await page.waitForTimeout(SETTLE)
    await expect(popup).toHaveCount(0)

    const draw = tipTrigger(page, 'Draw bubble')
    await page.keyboard.press('Tab')
    await expect(draw).toBeFocused()
    await expect(popupOf(page, 'Draw bubble')).toHaveCount(1)
    await page.waitForTimeout(SETTLE)
    expect(Math.abs((await offset(draw)) - attached)).toBeLessThanOrEqual(browserName === 'webkit' ? WHOLE_PIXEL_SNAP : PIXEL)
  })
}

test('moves one tooltip of a bar to the next trigger with its width and position and never hides it on the way', async ({ page }) => {
  const { handle, start, frames, target, flights: moves } = await crossBar(page, 'Pan', 'Draw bubble')

  const current = await page.locator('[data-variant="tooltip"]').elementHandle()
  expect(await current?.evaluate((element, previous) => element === previous, handle)).toBe(true)
  expect(frames.filter((frame) => openOf(frame).length !== 1 || (openOf(frame)[0]?.opacity ?? 0) < FULL)).toEqual([])
  expect(flown(moves)).toEqual(new Set(['translate', 'width', 'opacity', 'filter', 'scale']))
  const [from, to] = [centre(start).x, ofText(frames, 'Draw bubble').at(-1)]
  if (!to) throw new Error('no tooltip frame')
  const middle = course(frames, from, (tip) => tip.x + tip.width / 2)
  const width = course(frames, start.width, (tip) => tip.width)
  expect(Math.abs(middle.end - from)).toBeGreaterThan(OUTSIDE_X)
  expect(Math.abs(width.end - start.width)).toBeGreaterThan(OUTSIDE_X)
  for (const run of [middle, width]) {
    expect(run.inside).toBeGreaterThanOrEqual(1)
    expect(run.stray).toBe(0)
  }
  expect(middle.step).toBeLessThanOrEqual(Math.abs(middle.end - from) * 0.75)
  expect(width.step).toBeLessThanOrEqual(Math.abs(width.end - start.width) * 0.75)
  expect(Math.abs((to.arrow?.x ?? Number.NaN) - centre(target).x)).toBeLessThanOrEqual(PIXEL)
  const arrows = frames.flatMap((frame) => openOf(frame).map((tip) => tip.arrow?.x ?? Number.NaN))
  expect(arrows.filter((x) => x < Math.min(from, centre(target).x) - 1 || x > Math.max(from, centre(target).x) + 1)).toEqual([])
})

test('cross-fades the label of a bar tooltip through two labels with a blur and leaves one label', async ({ page }) => {
  const { frames } = await crossBar(page, 'Pan', 'Draw bubble')
  const two = frames.filter((frame) => openOf(frame)[0]?.labels.length === 2)
  expect(two.length).toBeGreaterThan(0)
  const labels = two.flatMap((frame) => openOf(frame).flatMap((tip) => tip.labels))
  const [leaving, entering] = [labels.filter((label) => label.leaving), labels.filter((label) => !label.leaving)]
  expect(new Set(leaving.map((label) => label.text))).toEqual(new Set(['Pan']))
  expect(new Set(entering.map((label) => label.text))).toEqual(new Set(['Draw bubble']))
  expect(leaving.some((label) => label.opacity > 0 && label.opacity < FULL)).toBe(true)
  expect(entering.some((label) => label.opacity > 0 && label.opacity < FULL)).toBe(true)
  expect(leaving.some((label) => label.filter.includes('blur(')) && entering.some((label) => label.filter.includes('blur('))).toBe(true)
  const lasted = (two.at(-1)?.time ?? Number.NaN) - (two[0]?.time ?? Number.NaN)
  expect(lasted).toBeGreaterThan(40)
  expect(lasted).toBeLessThan(300)
  const settled = openOf(frames.at(-1) ?? { time: 0, tips: [] })[0]
  expect(settled?.labels.map(({ text, leaving, opacity, filter }) => ({ text, leaving, opacity, filter }))).toEqual([{ text: 'Draw bubble', leaving: false, opacity: 1, filter: 'none' }])
})

test('opens a lone tooltip in place and at once next to another lone tooltip, which closes as a separate element', async ({ page }) => {
  const popup = page.locator('[data-variant="tooltip"]')
  await page.getByRole('button', { name: 'Undo' }).hover()
  await expect(popup).toHaveText('Undo')
  const undo = await popup.elementHandle()
  await clearRecorded(page)
  const frames = await watch(page, async () => {
    await page.getByRole('button', { name: 'Redo' }).hover()
    await expect(popupOf(page, 'Redo')).toHaveCount(1)
  })
  const redo = ofText(frames, 'Redo')
  const [first, last] = [redo[0], redo.at(-1)]
  if (!first || !last) throw new Error('no tooltip frame')
  expect(first.open).toBe(true)
  expect(first.opacity).toBeGreaterThanOrEqual(FULL)
  expect(Math.abs(first.x - last.x)).toBeLessThanOrEqual(PIXEL)
  expect(Math.abs(first.y - last.y)).toBeLessThanOrEqual(PIXEL)
  expect(await undo?.evaluate((element) => element.isConnected)).toBe(false)
  expect(frames.at(-1)?.tips.map((tip) => tip.text)).toEqual(['Redo'])
  const moved = flown(await flights(page))
  expect(moved.has('width')).toBe(false)
  expect(moved.has('filter')).toBe(false)

  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
  await page.waitForTimeout(SETTLE)
  await tipTrigger(page, 'Save').focus()
  await expect(popup).toHaveText('Saves the chapter')
  const afterFocus = await watch(page, async () => {
    await page.getByRole('button', { name: 'Paste' }).hover()
    await expect(popupOf(page, 'Paste the copied bubble')).toHaveCount(1)
  })
  const paste = ofText(afterFocus, 'Paste the copied bubble')
  expect(paste[0]?.opacity).toBeGreaterThanOrEqual(FULL)
  expect(Math.abs((paste[0]?.y ?? Number.NaN) - (paste.at(-1)?.y ?? Number.NaN))).toBeLessThanOrEqual(PIXEL)
})

test('opens a tooltip at once within the grace window after the previous one closed and after the open delay once the window has passed', async ({ page }) => {
  const [undo, redo, copy] = [tipTrigger(page, 'Undo'), tipTrigger(page, 'Redo'), tipTrigger(page, 'Copy')]
  await undo.scrollIntoViewIfNeeded()
  const { y } = centre(await box(undo))
  const popup = page.locator('[data-variant="tooltip"]')
  await hoverAndWait(page, undo, 'Undo')
  await moveOffTriggers(page, OUTSIDE_X, y)
  await expect(popup).toHaveCount(0)
  await page.waitForTimeout(GRACE / 4)
  expect(await openingTime(page, redo, 'Redo')).toBeLessThan(AT_ONCE)

  await moveOffTriggers(page, OUTSIDE_X, y)
  await expect(popup).toHaveCount(0)
  await page.waitForTimeout(GRACE + CLOSE_DELAY)
  const late = await openingTime(page, copy, 'Copy')
  expect(late).toBeGreaterThanOrEqual(OPEN_DELAY - AT_ONCE / 2)
})

test('shows the tooltip of a focused trigger at once and closes it on blur and on Escape', async ({ page }) => {
  const save = tipTrigger(page, 'Save')
  const popup = page.locator('[data-variant="tooltip"]')
  await save.evaluate((element) => element.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(AT_ONCE)
  expect(await focusTime(save)).toBeLessThan(OPEN_DELAY / 2)
  await expect(popup).toHaveText('Saves the chapter')
  await save.evaluate((element) => element instanceof HTMLElement && element.blur())
  await expect(popup).toHaveCount(0)

  await save.focus()
  await expect(popup).toHaveText('Saves the chapter')
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
  await expect(save).toBeFocused()
})

test('does not open a tooltip for a trigger that a click focused', async ({ page }) => {
  const save = tipTrigger(page, 'Save')
  await save.scrollIntoViewIfNeeded()
  const { x, y } = centre(await box(save))
  await moveOffTriggers(page, OUTSIDE_X, y)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(OPEN_DELAY + SETTLE / 2)
  await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)
})

test('opens a tooltip with the fade of the reduced motion and without the slide, and with nothing at all when the motion is off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = shownTips(await watch(page, () => hoverAndWait(page, tipTrigger(page, 'Save'), 'Saves the chapter')))
  expect(reduced[0]?.opacity).toBeLessThan(FULL)
  expect(Math.abs((reduced[0]?.y ?? Number.NaN) - (reduced.at(-1)?.y ?? Number.NaN))).toBeLessThanOrEqual(PIXEL)
  const crossed = await crossBar(page, 'Pan', 'Draw bubble')
  expect(course(crossed.frames, centre(crossed.start).x, (tip) => tip.x + tip.width / 2).inside).toBe(0)
  expect(flown(crossed.flights).has('translate')).toBe(false)
  expect(flown(crossed.flights).has('width')).toBe(false)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.mouse.move(0, 0)
  await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)
  await choose(page, 'motion', 'off')
  const off = shownTips(await watch(page, () => hoverAndWait(page, tipTrigger(page, 'Save'), 'Saves the chapter')))
  expect(off[0]?.opacity).toBeGreaterThanOrEqual(FULL)
  expect(Math.abs((off[0]?.y ?? Number.NaN) - (off.at(-1)?.y ?? Number.NaN))).toBeLessThanOrEqual(PIXEL)
  await page.mouse.move(0, 0)
  await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)
  const moved = await crossBar(page, 'Pan', 'Draw bubble')
  expect(course(moved.frames, centre(moved.start).x, (tip) => tip.x + tip.width / 2).inside).toBe(0)
  expect(course(moved.frames, moved.start.width, (tip) => tip.width).inside).toBe(0)
  expect(moved.flights).toEqual([])
})

for (const mode of ['light', 'dark'] as const) {
  test(`inverts the tooltip against the ${mode} mode`, async ({ page }) => {
    await page.evaluate((value) => document.documentElement.setAttribute('data-mode', value), mode)
    const popup = await openTip(page, tipTrigger(page, 'Save'), 'Saves the chapter')
    const [fill, label] = [await lightnessOf(popup, 'backgroundColor'), await lightnessOf(popup, 'color')]
    if (mode === 'light') expect([fill < DIM, label > BRIGHT], `fill ${fill} label ${label}`).toEqual([true, true])
    else expect([fill > BRIGHT, label < DIM], `fill ${fill} label ${label}`).toEqual([true, true])
  })
}

test('opens a lone tooltip above its trigger with an arrow pointing at the middle of the trigger', async ({ page }) => {
  const trigger = tipTrigger(page, 'Save')
  const popup = await openTip(page, trigger, 'Saves the chapter')
  await expect(popup).toHaveAttribute('data-side', 'top')
  const [tip, body, target] = await Promise.all([box(popup.locator('[data-slot="arrow"]')), box(popup), box(trigger)])
  expect(body.y + body.height).toBeLessThan(target.y)
  expect(Math.abs(centre(tip).x - centre(target).x)).toBeLessThanOrEqual(PIXEL)
  expect(tip.y + tip.height).toBeGreaterThan(body.y + body.height)
  expect(tip.y + tip.height).toBeLessThan(target.y)
})

test('opens a tooltip without an arrow when the arrow is turned off', async ({ page }) => {
  const popup = await openTip(page, tipTrigger(page, 'Plain'), 'No arrow')
  await expect(popup.locator('[data-slot="arrow"]')).toHaveCount(0)
})

test('opens a lone tooltip below its trigger when there is no room above', async ({ page }) => {
  const trigger = tipTrigger(page, 'Save')
  await trigger.scrollIntoViewIfNeeded()
  await trigger.evaluate((element, room) => window.scrollBy(0, element.getBoundingClientRect().top - room), EDGE_ROOM)
  const popup = await openTip(page, trigger, 'Saves the chapter')
  await expect(popup).toHaveAttribute('data-side', 'bottom')
  const [tip, body, target] = await Promise.all([box(popup.locator('[data-slot="arrow"]')), box(popup), box(trigger)])
  expect(body.y).toBeGreaterThan(target.y + target.height)
  expect(tip.y).toBeLessThan(body.y)
})

test('opens the tooltip of a horizontal bar above it and below it when there is no room above', async ({ page }) => {
  const pan = tipTrigger(page, 'Pan')
  const popup = await openTip(page, pan, 'Pan')
  await expect(popup).toHaveAttribute('data-side', 'top')
  const [body, target] = await Promise.all([box(popup), box(pan)])
  expect(body.y + body.height).toBeLessThan(target.y)
  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
  await pan.evaluate((element, room) => window.scrollBy(0, element.getBoundingClientRect().top - room), EDGE_ROOM)
  const flipped = await openTip(page, pan, 'Pan')
  await expect(flipped).toHaveAttribute('data-side', 'bottom')
  const [under, moved] = await Promise.all([box(flipped), box(pan)])
  expect(under.y).toBeGreaterThan(moved.y + moved.height)
})

test('opens the tooltip of a vertical bar on its right and on its left when there is no room on the right', async ({ page }) => {
  const trigger = tipTrigger(page, 'Layers')
  const popup = await openTip(page, trigger, 'Show layers')
  await expect(popup).toHaveAttribute('data-side', 'right')
  const [body, target] = await Promise.all([box(popup), box(trigger)])
  expect(body.x).toBeGreaterThan(target.x + target.width)
  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
  await trigger.evaluate((element, room) => {
    const bar = element.closest('[data-component="tooltip-bar"]')
    if (!(bar instanceof HTMLElement)) throw new Error('no bar')
    bar.style.position = 'fixed'
    bar.style.top = `${room * room * room * room}px`
    bar.style.right = `${room}px`
    bar.style.zIndex = `${room * room * room * room}`
  }, EDGE_ROOM)
  const flipped = await openTip(page, trigger, 'Show layers')
  await expect(flipped).toHaveAttribute('data-side', 'left')
  const [left, moved] = await Promise.all([box(flipped), box(trigger)])
  expect(left.x + left.width).toBeLessThan(moved.x)
})

test('keeps the tooltip of a bar on its trigger while the pointer rests in the gap and closes it once the pointer leaves the bar', async ({ page }) => {
  const pan = page.getByRole('button', { name: 'Pan', exact: true }).first()
  const draw = page.getByRole('button', { name: 'Draw bubble', exact: true }).first()
  const popup = await openTip(page, pan, 'Pan')
  const [left, right] = await Promise.all([box(pan), box(draw)])
  await recordTooltips(page)
  await page.mouse.move((left.x + left.width + right.x) / 2, centre(left).y)
  await page.waitForTimeout(GAP_HOLD)
  const frames = await tooltipFrames(page)
  expect(frames.filter((frame) => openOf(frame).length === 0)).toEqual([])
  await expect(popup).toHaveCount(1)
  await moveOffTriggers(page, (left.x + left.width + right.x) / 2, left.y + left.height * 2)
  await expect(popup).toHaveCount(0)
})

test('lets nothing but the width of the tooltip and the blur of its label fall off the compositor while it opens, moves and closes', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the compositor trace needs CDP')
  await page.goto(OVERLAYS)
  await hydrated(page)
  const island = page.getByRole('region', { name: 'Island', exact: true })
  const popup = page.locator('[data-variant="tooltip"]')
  const trace = await startTrace(page)
  for (const name of ['Select', 'Pan', 'Draw bubble']) {
    await island.getByRole('button', { name, exact: true }).hover()
    await expect(popup).toHaveText(name)
  }
  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
  const events = await trace.stop()
  expect(events.some((event) => event.name === 'Animation')).toBe(true)
  expect(failures(events, TOOLTIP_EXCEPTIONS)).toEqual([])
  expect(failures(events).length).toBeGreaterThan(0)
})

const WHOLE_TEXTS = [
  ['Pages', 'Show pages'],
  ['History', 'Show history'],
  ['Paste', 'Paste the copied bubble'],
  ['Plain', 'No arrow'],
  ['Draw bubble', 'Draw bubble'],
] as const

test('shows the whole text of every tooltip: the label fits its clip across and nothing clips its descenders', async ({ page }) => {
  for (const [name, text] of WHOLE_TEXTS) {
    await page.mouse.move(0, 0)
    const popup = await openTip(page, tipTrigger(page, name), text)
    const fit = await popup.evaluate((element) => {
      const label = element.querySelector('[data-slot="label"]')?.getBoundingClientRect()
      const clip = element.querySelector('[data-slot="clip"]')
      const room = clip?.getBoundingClientRect()
      if (!label || !clip || !room) return null
      return { start: label.left - room.left, end: room.right - label.right, down: getComputedStyle(clip).overflowY }
    })
    expect(fit, text).not.toBeNull()
    expect(fit?.start, text).toBeGreaterThanOrEqual(0)
    expect(fit?.end, text).toBeGreaterThanOrEqual(0)
    expect(fit?.down, text).toBe('visible')
  }
})

const ARROW_WALK = [
  ['Select', SETTLE],
  ['Pan', GAP_HOLD],
  ['Read aloud', GAP_HOLD],
  [null, CLOSE_DELAY + GAP_PAUSE],
  ['Draw bubble', GAP_HOLD],
  [null, GRACE + SETTLE],
  ['Pages', SETTLE],
  ['History', GAP_HOLD],
  [null, CLOSE_DELAY + GAP_PAUSE],
  ['Erase text', GAP_HOLD],
  [null, GRACE + SETTLE],
  ['Select', SETTLE],
] as const

test('keeps the arrow on the middle of its trigger in every frame the bubble does not move between triggers', async ({ page }) => {
  await tipTrigger(page, 'Select').scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    const strays: string[] = []
    window.tooltipStrays = strays
    const look = (): void => {
      const popup = document.querySelector<HTMLElement>('[data-variant="tooltip"]:popover-open[data-open]')
      const arrow = popup?.querySelector('[data-slot="arrow"]')
      const trigger = popup ? document.querySelector(`[aria-describedby="${popup.id}"]`) : null
      if (popup && arrow && trigger && !popup.getAnimations().some((animation) => animation.playState === 'running' && 'transitionProperty' in animation && animation.transitionProperty === 'width')) {
        const [tip, anchor] = [arrow.getBoundingClientRect(), trigger.getBoundingClientRect()]
        const across = popup.dataset.side === 'top' || popup.dataset.side === 'bottom'
        const off = across ? tip.left + tip.width / 2 - (anchor.left + anchor.width / 2) : tip.top + tip.height / 2 - (anchor.top + anchor.height / 2)
        if (Math.abs(off) > 1) strays.push(`${trigger.getAttribute('aria-label') ?? trigger.textContent}: ${off.toFixed(1)}`)
      }
      requestAnimationFrame(look)
    }
    requestAnimationFrame(look)
  })
  for (const [name, wait] of ARROW_WALK) {
    if (name === null) await page.mouse.move(0, 0, { steps: JITTER_STEPS })
    else {
      const { x, y } = centre(await box(tipTrigger(page, name)))
      await page.mouse.move(x, y, { steps: JITTER_STEPS })
    }
    await page.waitForTimeout(wait)
  }
  expect(await page.evaluate(() => window.tooltipStrays ?? [])).toEqual([])
})

const SLIDES = [
  ['Pan', 'Pan', 'Rotate the page', 'Rotate the page', 6],
  ['Rotate the page', 'Rotate the page', 'Pan', 'Pan', 6],
  ['Select', 'Select', 'Add text', 'Add text', 3],
  ['Add text', 'Add text', 'Select', 'Select', 3],
  ['Pages', 'Show pages', 'Export', 'Export as PDF', 3],
  ['Export', 'Export as PDF', 'Pages', 'Show pages', 6],
] as const
const SEEN = 0.05
const READABLE = 0.45
const RETARGET_SPILL = 2

test('keeps the text of a bar tooltip inside the bubble and readable in every frame while the pointer slides slowly and fast', async ({ page }) => {
  for (const [from, fromText, to, toText, steps] of SLIDES) {
    await openTip(page, tipTrigger(page, from), fromText)
    const end = centre(await box(tipTrigger(page, to)))
    const open = (await watch(page, () => page.mouse.move(end.x, end.y, { steps }))).flatMap(openOf)
    const route = `${from} → ${to}`
    expect(open.length, route).toBeGreaterThan(0)
    expect(open.flatMap((tip) => tip.labels.filter((label) => label.opacity > SEEN && label.spill > RETARGET_SPILL)), route).toEqual([])
    expect(open.filter((tip) => Math.max(...tip.labels.map((label) => label.opacity)) < READABLE).map((tip) => tip.labels), route).toEqual([])
    expect(open.at(-1)?.labels.map((label) => label.text), route).toEqual([toText])
  }
  const rest = await popupOf(page, 'Show pages').evaluate((popup) => ({
    scale: getComputedStyle(popup.querySelector('[data-slot="label"]') as Element).scale,
    still: getComputedStyle(popup).getPropertyValue('--ts-motion-press-rest').trim(),
  }))
  expect(Number(rest.scale)).toBe(Number(rest.still))
})

test('slides the tooltip of a bar to the next trigger on Tab without closing it, and closes it on Enter and Space until the focus leaves', async ({ page }) => {
  await tipTrigger(page, 'Pan').scrollIntoViewIfNeeded()
  await page.waitForTimeout(SETTLE)
  await tipTrigger(page, 'Pan').focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(popupOf(page, 'Pan')).toHaveCount(1)
  await page.waitForTimeout(SETTLE)
  const frames = await watch(page, () => page.keyboard.press('Tab'))
  expect(frames.filter((frame) => openOf(frame).length !== 1)).toEqual([])
  expect(new Set(frames.map((frame) => openOf(frame)[0]?.x)).size).toBeGreaterThan(1)
  expect(frames.at(-1)?.tips.map((tip) => tip.text)).toEqual(['Draw bubble'])
  for (const key of ['Enter', 'Space']) {
    await page.keyboard.press(key)
    await expect(page.locator('[data-variant="tooltip"][data-open]'), key).toHaveCount(0)
    await page.keyboard.press('Tab')
    await expect(popupOf(page, 'Erase text'), key).toHaveCount(1)
    await page.keyboard.press('Shift+Tab')
    await expect(popupOf(page, 'Draw bubble'), key).toHaveCount(1)
  }
})

test('opens the tooltip of the vertical bar every time the pointer comes from the horizontal one', async ({ page }) => {
  for (const [from, to, text] of [['Add text', 'Pages', 'Show pages'], ['Select', 'Comments', 'Show all the comments'], ['Read aloud', 'History', 'Show history']] as const) {
    await openTip(page, tipTrigger(page, from), from)
    const end = centre(await box(tipTrigger(page, to)))
    await page.mouse.move(end.x, end.y, { steps: JITTER_STEPS })
    await expect(popupOf(page, text), `${from} → ${to}`).toHaveCount(1)
  }
})
