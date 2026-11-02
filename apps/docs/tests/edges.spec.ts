import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  box,
  clearRecorded,
  clearRenders,
  colorOf,
  contrast,
  EDGE_MEDIA,
  EDGE_WIDTHS,
  EDGE_ZOOMS,
  edgeContext,
  hover,
  hydrated,
  installCommitProbe,
  INTERACTIVE_CONTROL,
  letterBreaks,
  MIN_CONTRAST,
  overflowProblems,
  pageScroll,
  recordAnimations,
  recorded,
  row,
  stateStep,
  windowProblems,
  type EdgeCase,
} from './helpers'

const EDGES = '/screens/edges'
const LAB_PAGES = ['/', '/foundation', '/components', '/screens/overlays', EDGES] as const
const HIDE_BORDER = ['--_edge', 'transparent'] as const
const HIDE_LINE = ['visibility', 'hidden'] as const
const CONTRAST_STROKE = 2
const TOLERANCE = 0.5
const NARROW = 320
const LONG = 'Export every chapter of this volume as one continuous vertical video'
const SECTION = '[data-edge-component]'
const POPUP = '[data-recipe="surface"]:is([data-level="overlay"], [data-level="modal"])'
const LINE_MARGIN = 2
const MIN_MAIN_WIDTH = 280
const LOW_WINDOW = { width: 900, height: 360 } as const
const TOUCH_TARGET = 24
const INSIDE = 2
const OUTSIDE = 1
const REST_SNAP = 1
const MIN_FOCUS_WIDTH = 2
const HIT_SIZES = ['xs', 'md'] as const
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const XS_HEIGHT = 16
const TOOLTIP = '[data-variant="tooltip"]'
const FOCUS_GUARD = '[data-base-ui-focus-guard]'
const HOST_EXCERPT = 120
const SETTLE = 600
const OVERFLOW_FRAME = '[data-overflow-case]'
const OVERFLOW_OPEN = '[data-overflow-open]'
const TALL_OPEN = '[data-overflow-tall]'
const OVERFLOW_EDGES: readonly EdgeCase[] = [{ media: 'light' }, { media: 'dark' }, { zoom: 2 }, { width: NARROW }]
const SMALL_WINDOW = { width: NARROW, height: 480 } as const

type Box = { x: number; y: number; width: number; height: number }

type Scope = { size: string | null; corners: string | null; radius: number; row: number }

function scopeOf(popup: Locator): Promise<Scope> {
  return popup.evaluate((element) => ({
    size: element.getAttribute('data-size'),
    corners: element.getAttribute('data-corners'),
    radius: Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
    row: element.querySelector('[role^="menuitem"]')?.getBoundingClientRect().height ?? 0,
  }))
}

async function expectSmallMenu(popup: Locator, label: string): Promise<void> {
  await expect(popup).toBeVisible()
  const scope = await scopeOf(popup)
  expect(scope, label).toMatchObject({ size: 'xs', corners: 'none', radius: 0 })
  expect(Math.abs(scope.row - XS_HEIGHT), label).toBeLessThanOrEqual(TOLERANCE)
}

async function closeMenus(page: Page): Promise<void> {
  const menus = page.getByRole('menu')
  while ((await menus.count()) > 0) await page.keyboard.press('Escape')
  await expect(menus).toHaveCount(0)
}

function controlAt(page: Page, x: number, y: number): Promise<string | null> {
  return page.evaluate(
    ([left, top]) => {
      const control = document.elementFromPoint(left ?? 0, top ?? 0)?.closest('[data-recipe="control"]')
      return control ? (control.getAttribute('aria-label') ?? control.textContent) : null
    },
    [x, y],
  )
}

function middle(rect: Box): number {
  return rect.y + rect.height / 2
}

function actionsDirection(page: Page, card: string): Promise<string> {
  return region(page, 'Container')
    .getByTestId(card)
    .locator(':scope > [data-slot="actions"]')
    .evaluate((element) => getComputedStyle(element).flexDirection)
}

function sideGutters(menu: Locator): Promise<{ start: number; end: number }> {
  return menu.evaluate((element) => {
    const popup = element.getBoundingClientRect()
    const first = element.querySelector('[role^="menuitem"]')?.getBoundingClientRect() ?? new DOMRect()
    return { start: first.left - popup.left, end: popup.right - first.right }
  })
}

async function open(page: Page): Promise<void> {
  await page.goto(EDGES)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await hydrated(page)
}

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function outlineControl(page: Page): Locator {
  return region(page, 'Button').getByTestId('full').getByRole('button', { name: 'A', exact: true })
}

function activePill(scope: Locator): Locator {
  return scope.locator('[data-recipe="indicator"]:not([data-variant="hover"])')
}

function sectionOverflow(page: Page): Promise<string[]> {
  return page.locator(SECTION).evaluateAll(
    (sections, { width, tolerance }) => {
      const problems: string[] = []
      const label = (element: Element): string =>
        `${element.localName}${element.getAttribute('data-recipe') ? `[${element.getAttribute('data-recipe')}]` : ''} "${(element.textContent ?? '').slice(0, 16)}"`
      if (sections.length === 0) problems.push('no edge sections')
      for (const section of sections) {
        const name = section.getAttribute('data-edge-component') ?? ''
        const narrow = section.querySelector('[data-testid="narrow"]')
        if (!narrow) {
          problems.push(`${name}: no ${width} px container`)
          continue
        }
        const frame = narrow.getBoundingClientRect()
        if (Math.abs(frame.width - width) > tolerance) problems.push(`${name}: container ${frame.width} px wide`)
        if (narrow.scrollWidth > narrow.clientWidth) problems.push(`${name}: scrolls ${narrow.scrollWidth} px in ${narrow.clientWidth} px`)
        for (const element of narrow.querySelectorAll('*')) {
          const rect = element.getBoundingClientRect()
          if (rect.width === 0 && rect.height === 0) continue
          if (rect.left < frame.left - tolerance || rect.right > frame.right + tolerance) {
            problems.push(`${name}: ${label(element)} spans ${Math.round(rect.left - frame.left)}..${Math.round(rect.right - frame.left)} px`)
          }
        }
      }
      return problems
    },
    { width: NARROW, tolerance: TOLERANCE },
  )
}

async function linePixels(page: Page, line: Locator, clip: Box, [property, value]: readonly [string, string]): Promise<boolean> {
  const element = await line.elementHandle()
  const hide = (next: string): Promise<void> =>
    element.evaluate((node, [name, style]) => {
      if (node instanceof HTMLElement) node.style.setProperty(name, style)
    }, [property, next] as const)
  const shown = await page.screenshot({ clip, animations: 'disabled' })
  await hide(value)
  const hidden = await page.screenshot({ clip, animations: 'disabled' })
  await hide('')
  return !shown.equals(hidden)
}

function edgeName(edge: EdgeCase): string {
  if ('zoom' in edge) return `at ${edge.zoom * 100}% zoom`
  if ('width' in edge) return `at a ${edge.width} px window`
  return `in ${edge.media}`
}

async function openPopup(page: Page, opener: Locator): Promise<Locator> {
  if ((await opener.getAttribute('data-overflow-open')) === 'hover') await opener.hover()
  else await opener.click()
  const popup = page.locator(POPUP).last()
  await expect(popup).toBeVisible()
  return popup
}

async function closePopup(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.mouse.move(0, 0)
  await expect(page.locator(POPUP)).toHaveCount(0)
}

function namesOf(page: Page, attribute: string): Promise<string[]> {
  return page.locator(`[${attribute}]`).evaluateAll((elements, name) => elements.map((element) => element.getAttribute(name) ?? '').toSorted(), attribute)
}

function leftEdge(rect: Box, width: number): Box {
  return { x: rect.x - LINE_MARGIN, y: rect.y + rect.height / 2 - LINE_MARGIN, width: LINE_MARGIN * 2 + width, height: LINE_MARGIN * 2 }
}

test.describe('at 1280 px', () => {
  test.use(edgeContext({ media: 'light' }))

  test('shortens a long label with an ellipsis inside a 320 px container', async ({ page }) => {
    await open(page)
    const { labels, problems } = await page.locator(`${SECTION} [data-testid="narrow"]`).evaluateAll(
      (containers, { long, tolerance }) => {
        const found = containers.flatMap((container) => {
          const frame = container.getBoundingClientRect()
          const name = container.closest('[data-edge-component]')?.getAttribute('data-edge-component') ?? ''
          return [...container.querySelectorAll('[data-slot="label"]:not([data-recipe="text"])')]
            .filter((label) => label.textContent === long)
            .map((label) => {
              const control = label.closest('[data-recipe]') ?? label
              const problems: string[] = []
              if (control.getBoundingClientRect().right > frame.right + tolerance) problems.push(`${name}: the control leaves the container`)
              if (label.scrollWidth <= label.clientWidth) problems.push(`${name}: the label is not shortened`)
              if (getComputedStyle(label).textOverflow !== 'ellipsis') problems.push(`${name}: no ellipsis`)
              return problems
            })
        })
        return { labels: found.length, problems: found.flat() }
      },
      { long: LONG, tolerance: TOLERANCE },
    )
    expect(labels).toBeGreaterThan(0)
    expect(problems).toEqual([])
  })

  test('keeps every control at least as wide as the height of one line of its size, a growing text area included', async ({ page }) => {
    await open(page)
    const narrower = await page.locator('main [data-recipe="control"]').evaluateAll((controls, tolerance) => {
      const visible = controls
        .map((control) => ({ rect: control.getBoundingClientRect(), line: Number.parseFloat(getComputedStyle(control).getPropertyValue('--ts-size-height')) }))
        .filter(({ rect }) => rect.height > 0)
      return { count: visible.length, narrower: visible.filter(({ rect, line }) => rect.width < Math.min(rect.height, line) - tolerance).length }
    }, TOLERANCE)
    expect(narrower.count).toBeGreaterThan(0)
    expect(narrower.narrower).toBe(0)
  })

  test('stacks the actions of a narrow card with data-container by its own width and lays them in a row by the page width without', async ({ page }) => {
    await open(page)
    expect(await actionsDirection(page, 'container-card')).toBe('column')
    expect(await actionsDirection(page, 'page-card')).toBe('row')
  })
})

for (const media of EDGE_MEDIA) {
  test.describe(`in ${media}`, () => {
    test.use(edgeContext({ media }))

    test('keeps every component section inside its 320 px container', async ({ page, browserName }) => {
      test.skip(media === 'forced colors' && browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
      await open(page)
      expect(await sectionOverflow(page)).toEqual([])
    })
  })
}

for (const width of EDGE_WIDTHS) {
  test.describe(`at a ${width} px window`, () => {
    test.use(edgeContext({ width }))

    test('scrolls every page of the lab only vertically', async ({ page }) => {
      const wider: string[] = []
      for (const path of LAB_PAGES) {
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready.then(() => undefined))
        await hydrated(page)
        const { scroll, client } = await pageScroll(page)
        if (scroll > client) wider.push(`${path}: ${scroll} px in ${client} px`)
      }
      expect(wider).toEqual([])
    })

    test('keeps the label of every control and row of every lab page on one line', async ({ page }) => {
      const broken: string[] = []
      for (const path of LAB_PAGES) {
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready.then(() => undefined))
        await hydrated(page)
        const lines = await page.evaluate(() =>
          [...document.querySelectorAll('[data-recipe="control"] > [data-slot="label"], [data-recipe="row"] > [data-slot="label"]')].flatMap((label) => {
            const range = document.createRange()
            range.selectNodeContents(label)
            const tops = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)))
            return tops.size > 1 ? [`"${label.textContent?.slice(0, 30)}" on ${tops.size} lines`] : []
          }),
        )
        broken.push(...lines.map((line) => `${path}: ${line}`))
      }
      expect(broken).toEqual([])
    })

    test('breaks no text of any lab page into lines of a letter or two', async ({ page }) => {
      const broken: string[] = []
      for (const path of LAB_PAGES) {
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready.then(() => undefined))
        await hydrated(page)
        broken.push(...(await letterBreaks(page.locator('body'))).map((problem) => `${path}: ${problem}`))
      }
      expect(broken).toEqual([])
    })
  })
}

test.describe('at a 320 px window', () => {
  test.use(edgeContext({ width: NARROW }))

  test('stacks the page navigation, the page and the theme panel so the page takes the full width', async ({ page }) => {
    await open(page)
    const [navigation, main, panel] = await Promise.all([
      box(page.getByRole('navigation', { name: 'Pages' })),
      box(page.getByRole('main')),
      box(page.getByRole('complementary', { name: 'Theme' })),
    ])
    expect(main.width).toBeGreaterThanOrEqual(MIN_MAIN_WIDTH)
    expect(navigation.y + navigation.height).toBeLessThanOrEqual(main.y + TOLERANCE)
    expect(main.y + main.height).toBeLessThanOrEqual(panel.y + TOLERANCE)
    const { scroll, client } = await pageScroll(page)
    expect(scroll).toBeLessThanOrEqual(client)
  })

  test('stacks the actions of a card in a column also by the width of the page', async ({ page }) => {
    await open(page)
    expect(await actionsDirection(page, 'container-card')).toBe('column')
    expect(await actionsDirection(page, 'page-card')).toBe('column')
  })

  test('keeps the popup of every section inside the window', async ({ page }) => {
    await open(page)
    const problems: string[] = []
    const sections = page.locator(SECTION)
    for (let index = 0; index < (await sections.count()); index += 1) {
      const section = sections.nth(index)
      const name = (await section.getAttribute('data-edge-component')) ?? ''
      const opener = section.getByTestId('narrow').locator('[data-edge-open]')
      if ((await opener.count()) === 0) continue
      if ((await opener.getAttribute('data-edge-open')) === 'hover') await opener.hover()
      else await opener.click()
      const popup = page.locator(POPUP).last()
      await expect(popup).toBeVisible()
      const { x, width } = await box(popup)
      const window = await page.evaluate(() => document.documentElement.clientWidth)
      if (x < -TOLERANCE || x + width > window + TOLERANCE) problems.push(`${name}: popup spans ${Math.round(x)}..${Math.round(x + width)} px`)
      await page.keyboard.press('Escape')
      await page.mouse.move(0, 0)
      await expect(page.locator(POPUP)).toHaveCount(0)
    }
    expect(problems).toEqual([])
  })
})

for (const edge of OVERFLOW_EDGES) {
  test.describe(`overflow ${edgeName(edge)}`, () => {
    test.use(edgeContext(edge))

    test('keeps every long-string case of every component inside its 120 px frame and every edge section inside its 320 px container', async ({ page }) => {
      await open(page)
      expect(await namesOf(page, 'data-overflow-component')).toEqual(await namesOf(page, 'data-edge-component'))
      expect(await overflowProblems(page.locator(OVERFLOW_FRAME))).toEqual([])
      expect(await overflowProblems(page.locator(`${SECTION} [data-testid="narrow"]`))).toEqual([])
      expect(await letterBreaks(page.locator(OVERFLOW_FRAME))).toEqual([])
      const inputs = page.locator(`${OVERFLOW_FRAME} input`)
      expect(await inputs.count()).toBeGreaterThan(0)
      expect(await inputs.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).textOverflow))).toEqual(
        Array.from({ length: await inputs.count() }, () => 'ellipsis'),
      )
    })

    test('keeps every popup with long strings in the window and its content inside it without a sideways scroll', async ({ page }) => {
      await open(page)
      const problems: string[] = []
      const openers = region(page, 'Overflow').locator(OVERFLOW_OPEN)
      expect(await openers.count()).toBeGreaterThan(0)
      for (let index = 0; index < (await openers.count()); index += 1) {
        const opener = openers.nth(index)
        const name = (await opener.textContent()) ?? ''
        const popup = await openPopup(page, opener)
        problems.push(...(await windowProblems(popup, name)), ...(await overflowProblems(popup)))
        await closePopup(page)
      }
      expect(problems).toEqual([])
    })
  })
}

test.describe('in a composition', () => {
  test.use(edgeContext({ media: 'light' }))

  test('blocks a part out of the slot order of its host and a part inside another part with the rule in the message', async ({ page }) => {
    await open(page)
    const composition = region(page, 'Composition')
    await composition.getByRole('button', { name: 'Actions before the title', exact: true }).click()
    await expect(composition.getByTestId('blocked').filter({ hasText: 'the title cannot come after the actions' })).toBeVisible()
    await page.keyboard.press('Escape')
    await composition.getByRole('button', { name: 'A title in the actions', exact: true }).click()
    await expect(composition.getByTestId('blocked').filter({ hasText: '<PopoverTitle> is a part of <PopoverPopup>' })).toBeVisible()
  })
})

test.describe(`in a ${SMALL_WINDOW.width} × ${SMALL_WINDOW.height} px window`, () => {
  test.use({ viewport: SMALL_WINDOW })

  test('fits a dialog and a popover far taller than the window in it and scrolls them', async ({ page }) => {
    await open(page)
    const openers = region(page, 'Overflow').locator(TALL_OPEN)
    expect(await openers.count()).toBeGreaterThan(0)
    for (let index = 0; index < (await openers.count()); index += 1) {
      const opener = openers.nth(index)
      const name = (await opener.textContent()) ?? ''
      const popup = await openPopup(page, opener)
      expect(await windowProblems(popup, name)).toEqual([])
      expect(await overflowProblems(popup)).toEqual([])
      expect(await popup.evaluate((element) => element.scrollHeight > element.clientHeight), `${name} scrolls`).toBe(true)
      await closePopup(page)
    }
  })
})

for (const zoom of EDGE_ZOOMS) {
  test.describe(`at ${zoom * 100}% zoom`, () => {
    test.use(edgeContext({ zoom }))

    test('scrolls the page only vertically and lands the pill on the chosen option', async ({ page }) => {
      await open(page)
      const { scroll, client } = await pageScroll(page)
      expect(scroll).toBeLessThanOrEqual(client)
      const group = region(page, 'Eight groups').getByRole('radiogroup', { name: 'Group 3', exact: true })
      const pill = activePill(group)
      const target = group.getByRole('radio', { name: 'L', exact: true })
      await expect(pill).toHaveAttribute('data-visible', 'true')
      await target.click()
      await expect(target).toHaveAttribute('aria-checked', 'true')
      await expect
        .poll(async () => {
          const [from, to] = await Promise.all([box(pill), box(target)])
          return Math.max(Math.abs(from.x - to.x), Math.abs(from.width - to.width))
        })
        .toBeLessThanOrEqual(TOLERANCE)
    })
  })
}

test.describe('at 50% zoom', () => {
  test.use(edgeContext({ zoom: 0.5 }))

  test('draws the 1 px lines of a control border and a menu separator', async ({ page }) => {
    await open(page)
    const control = outlineControl(page)
    expect(await linePixels(page, control, leftEdge(await box(control), 1), HIDE_BORDER), 'control border').toBe(true)

    await region(page, 'Menu').getByTestId('full').locator('[data-edge-open]').click()
    const separator = page.getByRole('menu').getByRole('separator')
    await expect(separator).toBeVisible()
    const line = await box(separator)
    const rule = { x: line.x + LINE_MARGIN, y: line.y - LINE_MARGIN, width: line.width - LINE_MARGIN * 2, height: line.height + LINE_MARGIN * 2 }
    expect(await linePixels(page, separator, rule, HIDE_LINE), 'menu separator').toBe(true)
  })
})

test.describe('in more contrast', () => {
  test.use(edgeContext({ media: 'contrast' }))

  test('thickens the stroke to 2 px and draws it on an outline control', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ts-shape-stroke').trim())).toBe(`${CONTRAST_STROKE}px`)
    const control = outlineControl(page)
    expect(await control.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderLeftWidth))).toBe(CONTRAST_STROKE)
    expect(await linePixels(page, control, leftEdge(await box(control), CONTRAST_STROKE), HIDE_BORDER)).toBe(true)
  })
})

test.describe(`in a ${LOW_WINDOW.width} × ${LOW_WINDOW.height} px window`, () => {
  test.use({ viewport: LOW_WINDOW })

  test('fits a long menu in the window, scrolls it to the last item with the pill on it and reserves no scrollbar gutter', async ({ page }) => {
    await open(page)
    await region(page, 'Long menu').getByRole('button', { name: 'Chapters', exact: true }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const fit = await menu.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const borders = Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.borderRightWidth)
      const gutters = rect.width - element.clientWidth - borders
      return { top: rect.top, bottom: rect.bottom, window: innerHeight, scroll: element.scrollHeight, client: element.clientHeight, gutters }
    })
    expect(fit.top).toBeGreaterThanOrEqual(-TOLERANCE)
    expect(fit.bottom).toBeLessThanOrEqual(fit.window + TOLERANCE)
    expect(fit.scroll).toBeGreaterThan(fit.client)
    expect(fit.gutters, 'scrollbar gutters').toBeLessThan(1)
    const scrolling = await sideGutters(menu)
    expect(Math.abs(scrolling.start - scrolling.end)).toBeLessThanOrEqual(TOLERANCE)

    await expect(menu).toBeFocused()
    await page.keyboard.press('End')
    const last = menu.getByRole('menuitem', { name: 'Chapter 20', exact: true })
    await expect(last).toHaveAttribute('data-highlighted', '')
    const pill = menu.locator('[data-recipe="indicator"]')
    await expect
      .poll(async () => {
        const [from, to, frame] = await Promise.all([box(pill), box(last), box(menu)])
        const inside = to.y >= frame.y - TOLERANCE && to.y + to.height <= frame.y + frame.height + TOLERANCE
        return inside && Math.abs(from.y - to.y) <= TOLERANCE && Math.abs(from.height - to.height) <= TOLERANCE
      })
      .toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)

    await region(page, 'Small bar').getByRole('button', { name: 'File', exact: true }).click()
    await expect(menu).toBeVisible()
    expect(await menu.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(false)
    const still = await sideGutters(menu)
    expect(Math.abs(still.start - still.end)).toBeLessThanOrEqual(TOLERANCE)
  })
})

test.describe('with a mouse', () => {
  test.use(edgeContext({ media: 'light' }))

  test('hits a control and an option only inside its box', async ({ page }) => {
    await open(page)
    for (const size of HIT_SIZES) {
      await page.getByTestId(`hit-bar-${size}`).scrollIntoViewIfNeeded()
      const [first, second] = await Promise.all([0, 1].map((index) => box(page.getByTestId(`hit-bar-${size}`).getByRole('button').nth(index))))
      if (!first || !second) throw new Error('no bar')
      expect(await controlAt(page, first.x + first.width / 2, middle(first)), size).not.toBeNull()
      expect(await controlAt(page, first.x - OUTSIDE - REST_SNAP, middle(first)), size).toBeNull()
      expect(await controlAt(page, (first.x + first.width + second.x) / 2, middle(first)), size).toBeNull()

      const range = page.getByRole('radiogroup', { name: `Hit range ${size}`, exact: true })
      const option = range.getByRole('radio').first()
      const [track, segment, name] = await Promise.all([box(range), box(option), option.textContent()])
      expect(await controlAt(page, segment.x + segment.width / 2, middle(segment)), `${size} option`).toBe(name)
      expect(await controlAt(page, segment.x - OUTSIDE, middle(segment)), `${size} track padding`).toBeNull()
      expect(await controlAt(page, track.x - OUTSIDE, middle(segment)), `${size} outside the track`).toBeNull()
    }
  })

  test('keeps the selected fill of a pressed button under the pointer and while it is held down', async ({ page }) => {
    await open(page)
    const pressed = region(page, 'States').getByRole('button', { name: 'Pressed', exact: true })
    const hoverStep = await pressed.evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--ts-state-hover')))
    const rest = await stateStep(pressed)
    expect(rest).toBeGreaterThan(0)
    expect(rest).not.toBeCloseTo(hoverStep, 3)
    await pressed.hover()
    await page.waitForTimeout(SETTLE)
    expect(await stateStep(pressed)).toBeCloseTo(rest, 3)
    await page.mouse.down()
    await expect(pressed).toHaveAttribute('data-pressing', '')
    await page.waitForTimeout(SETTLE)
    expect(await stateStep(pressed)).toBeCloseTo(rest, 3)
    await page.mouse.up()
  })

  test('wraps a long tooltip at the narrow measure', async ({ page }) => {
    await open(page)
    await region(page, 'Tooltip').getByTestId('full').getByRole('button', { name: 'Help', exact: true }).hover()
    const tooltip = page.locator('[data-variant="tooltip"]')
    await expect(tooltip).toHaveText(LONG)
    const { width, measure, height, line } = await tooltip.evaluate((element) => {
      const probe = document.createElement('span')
      probe.style.display = 'block'
      probe.style.width = 'var(--ts-type-measure-narrow)'
      element.append(probe)
      const found = {
        width: element.getBoundingClientRect().width,
        measure: probe.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
        line: Number.parseFloat(getComputedStyle(element).lineHeight),
      }
      probe.remove()
      return found
    })
    expect(width).toBeLessThanOrEqual(measure + TOLERANCE)
    expect(height).toBeGreaterThan(line * 2)
  })
})

test.describe('with a touch screen', () => {
  test.use(edgeContext({ media: 'touch' }))

  test('gives every interactive control in the sections a box of at least 24 × 24 px and every static control the height of its step', async ({ page }) => {
    await open(page)
    const { interactive, statics, smaller, stretched } = await page.locator('main section [data-recipe="control"]').evaluateAll(
      (controls, { target, tolerance, selector }) => {
        const visible = controls.filter((control) => control.getBoundingClientRect().height > 0)
        const name = (control: Element): string | null => control.getAttribute('aria-label') ?? control.textContent
        const step = (control: Element): number => Number.parseFloat(getComputedStyle(control).getPropertyValue('--ts-size-step'))
        const active = visible.filter((control) => control.matches(selector))
        const still = visible.filter((control) => !control.matches(selector))
        return {
          interactive: active.length,
          statics: still.length,
          smaller: active
            .filter((control) => {
              const rect = control.getBoundingClientRect()
              return Math.min(rect.width, rect.height) < target - tolerance
            })
            .map(name),
          stretched: still.filter((control) => Math.abs(control.getBoundingClientRect().height - step(control)) > tolerance).map(name),
        }
      },
      { target: TOUCH_TARGET, tolerance: TOLERANCE, selector: INTERACTIVE_CONTROL },
    )
    expect(interactive).toBeGreaterThan(0)
    expect(statics).toBeGreaterThan(0)
    expect(smaller).toEqual([])
    expect(stretched).toEqual([])
  })

  test('lets a tap 2 px from the edge facing a neighbour hit the touched control', async ({ page }) => {
    await open(page)
    for (const size of HIT_SIZES) {
      await page.getByTestId(`hit-bar-${size}`).scrollIntoViewIfNeeded()
      const bar = page.getByTestId(`hit-bar-${size}`).getByRole('button')
      const options = page.getByRole('radiogroup', { name: `Hit range ${size}`, exact: true }).getByRole('radio')
      for (const group of [bar, options]) {
        const boxes = await Promise.all([0, 1, 2].map((index) => box(group.nth(index))))
        const names = await Promise.all([0, 1, 2].map((index) => group.nth(index).evaluate((element) => element.getAttribute('aria-label') ?? element.textContent)))
        const [first, second, third] = boxes
        if (!first || !second || !third) throw new Error('no group')
        expect(await controlAt(page, second.x + INSIDE, middle(second)), `${size} start of ${names[1]}`).toBe(names[1])
        expect(await controlAt(page, first.x + first.width - INSIDE, middle(first)), `${size} end of ${names[0]}`).toBe(names[0])
        expect(await controlAt(page, second.x + second.width - INSIDE, middle(second)), `${size} end of ${names[1]}`).toBe(names[1])
        expect(await controlAt(page, third.x + INSIDE, middle(third)), `${size} start of ${names[2]}`).toBe(names[2])
      }
    }
  })
})

test.describe('in forced colors', () => {
  test.use(edgeContext({ media: 'forced colors' }))

  test('keeps the label of a pressed button readable on its highlight under the pointer and while it is held down', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await open(page)
    const pressed = region(page, 'States').getByRole('button', { name: 'Pressed', exact: true })
    const highlight = await colorOf(page, 'Highlight')
    const expectReadable = async (moment: string): Promise<void> => {
      await page.waitForTimeout(SETTLE)
      const look = await pressed.evaluate((element) => ({ label: getComputedStyle(element).color, fill: getComputedStyle(element, '::before').backgroundColor }))
      expect(look.fill, moment).toBe(highlight)
      expect(contrast(look.label, look.fill), moment).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
    await expectReadable('at rest')
    await pressed.hover()
    await expectReadable('under the pointer')
    await page.mouse.down()
    await expect(pressed).toHaveAttribute('data-pressing', '')
    await expectReadable('held down')
    await page.mouse.up()
  })

  test('keeps the chosen option, the hover pill, disabled parts, fields, tracks, the edge of a menu and the focus ring visible', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await open(page)
    const groups = [
      region(page, 'Eight groups').getByRole('radiogroup', { name: 'Group 1', exact: true }),
      region(page, 'States').getByRole('radiogroup', { name: 'Flat choice', exact: true }),
    ]
    for (const group of groups) {
      const pill = activePill(group).locator('[data-slot="squash"]')
      await expect(activePill(group)).toHaveAttribute('data-visible', 'true')
      const [fill, track] = await Promise.all([
        pill.evaluate((element) => getComputedStyle(element).backgroundColor),
        group.evaluate((element) => getComputedStyle(element).backgroundColor),
      ])
      expect(fill).not.toBe(track)
      const [chosen, other] = await Promise.all(
        ['true', 'false'].map((checked) =>
          group.locator(`[role="radio"][aria-checked="${checked}"]`).first().evaluate((element) => getComputedStyle(element).color),
        ),
      )
      expect(chosen).not.toBe(other)
      const border = await group.evaluate((element) => ({ width: Number.parseFloat(getComputedStyle(element).borderTopWidth), color: getComputedStyle(element).borderTopColor }))
      expect(border.width).toBeGreaterThan(0)
      expect(border.color).not.toBe(TRANSPARENT)
    }

    const states = region(page, 'States')
    const disabled = states.getByRole('button', { name: 'Disabled', exact: true })
    expect(await disabled.evaluate((element) => ({ color: getComputedStyle(element).color, opacity: getComputedStyle(element).opacity }))).toEqual({
      color: await colorOf(page, 'GrayText'),
      opacity: '1',
    })
    const field = states.getByRole('textbox', { name: 'Read-only field', exact: true }).locator('xpath=..')
    const fieldBorder = await field.evaluate((element) => ({ width: Number.parseFloat(getComputedStyle(element).borderTopWidth), color: getComputedStyle(element).borderTopColor }))
    expect(fieldBorder.width).toBeGreaterThan(0)
    expect(fieldBorder.color).not.toBe(TRANSPARENT)

    await states.getByRole('button', { name: 'Pressed', exact: true }).click()
    await page.keyboard.press('Shift+Tab')
    const saving = states.getByRole('button', { name: 'Saving', exact: true })
    await expect(saving).toBeFocused()
    expect(await saving.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(MIN_FOCUS_WIDTH)

    await states.getByRole('button', { name: 'With a disabled item', exact: true }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const menuBorder = await menu.evaluate((element) => ({ width: Number.parseFloat(getComputedStyle(element).borderTopWidth), color: getComputedStyle(element).borderTopColor }))
    expect(menuBorder.width).toBeGreaterThan(0)
    expect(menuBorder.color).not.toBe(TRANSPARENT)
    await menu.getByRole('menuitem', { name: /Open/ }).hover()
    const hoverPill = menu.locator('[data-recipe="indicator"][data-variant="hover"]')
    await expect(hoverPill).toHaveAttribute('data-visible', 'true')
    const outline = await hoverPill.locator('[data-slot="squash"]').evaluate((element) => ({
      width: Number.parseFloat(getComputedStyle(element).outlineWidth),
      style: getComputedStyle(element).outlineStyle,
    }))
    expect(outline.width).toBeGreaterThan(0)
    expect(outline.style).toBe('solid')
  })

  test('outlines an invalid field thicker than a valid one', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await open(page)
    const states = region(page, 'States')
    const outlineOf = (name: string): Promise<{ width: number; color: string }> =>
      states
        .getByRole('textbox', { name, exact: true })
        .locator('xpath=..')
        .evaluate((element) => {
          const plate = getComputedStyle(element, '::before')
          return { width: Number.parseFloat(plate.borderTopWidth), color: plate.borderTopColor }
        })
    const [invalid, valid] = await Promise.all([outlineOf('Invalid field'), outlineOf('E-mail field')])
    expect(valid.width).toBeGreaterThan(0)
    expect(valid.color).not.toBe(TRANSPARENT)
    expect(invalid.width).toBeGreaterThan(valid.width)
  })

  test('outlines a raised card whose border is transparent in the other modes', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await open(page)
    const border = await region(page, 'Container')
      .getByTestId('page-card')
      .evaluate((element) => ({ width: Number.parseFloat(getComputedStyle(element).borderTopWidth), color: getComputedStyle(element).borderTopColor }))
    expect(border.width).toBeGreaterThan(0)
    expect(border.color).not.toBe(TRANSPARENT)
  })
})

test.describe('in a collection that changes', () => {
  test.use(edgeContext({ media: 'light' }))

  test('moves the pill with its target when a tab before it gets a longer name', async ({ page }) => {
    await open(page)
    const section = region(page, 'Moving target')
    const target = section.getByRole('tab', { name: 'Layers', exact: true })
    const pill = section.locator('[data-recipe="indicator"]')
    await expect(pill).toHaveAttribute('data-visible', 'true')
    const before = await box(target)
    await section.getByRole('button', { name: 'Rename the first tab', exact: true }).click()
    await expect.poll(async () => (await box(target)).x).toBeGreaterThan(before.x + TOLERANCE)
    await expect
      .poll(async () => {
        const [ride, tab] = await Promise.all([box(pill), box(target)])
        return Math.max(Math.abs(ride.x - tab.x), Math.abs(ride.width - tab.width))
      })
      .toBeLessThanOrEqual(TOLERANCE)
  })

  test('shows the one choice of a list with the pill and many choices with the selected fill', async ({ page }) => {
    await open(page)
    const section = region(page, 'Choice lists')
    const selectedFill = await section.evaluate((element) => {
      const probe = document.createElement('div')
      probe.style.opacity = 'var(--ts-state-selected-fill)'
      element.append(probe)
      const opacity = Number.parseFloat(getComputedStyle(probe).opacity)
      probe.remove()
      return opacity
    })
    expect(selectedFill).toBeGreaterThan(0)

    const one = section.getByRole('listbox', { name: 'One layer', exact: true })
    const chosen = one.getByRole('option', { name: 'Bubbles', exact: true })
    const pill = one.locator('[data-recipe="indicator"]')
    await expect(pill).toHaveAttribute('data-visible', 'true')
    const [ride, option] = await Promise.all([box(pill), box(chosen)])
    expect(Math.abs(ride.y - option.y)).toBeLessThanOrEqual(TOLERANCE)
    expect(await stateStep(chosen)).toBe(0)

    const many = section.getByRole('listbox', { name: 'Many layers', exact: true })
    for (const name of ['Text', 'Panels']) expect(await stateStep(many.getByRole('option', { name, exact: true })), name).toBeCloseTo(selectedFill, 3)
    expect(await stateStep(many.getByRole('option', { name: 'Bubbles', exact: true }))).toBe(0)
  })
})

test.describe('in the scope of a subtree', () => {
  test.use(edgeContext({ media: 'light' }))

  test('opens a menu and its submenu of an xs bar with no corners at the size and corners of the bar however the menu opens', async ({ page }) => {
    await open(page)
    const scope = region(page, 'Scope')
    const menus = page.getByRole('menu')

    await scope.getByRole('button', { name: 'Clicked', exact: true }).click()
    await expectSmallMenu(menus.first(), 'click')
    await hover(page, row(menus.first(), 'Export'))
    await expect(menus).toHaveCount(2)
    await expectSmallMenu(menus.nth(1), 'submenu')
    await closeMenus(page)

    await scope.getByRole('button', { name: 'Clicked', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expectSmallMenu(menus.first(), 'keyboard')
    await closeMenus(page)

    await scope.getByRole('button', { name: 'Open the controlled menu', exact: true }).click()
    await expectSmallMenu(menus.first(), 'controlled open')
    await closeMenus(page)

    await scope.getByRole('button', { name: 'Mount an open menu', exact: true }).click()
    await expectSmallMenu(menus.first(), 'default open')
    await hover(page, row(menus.first(), 'Export'))
    await expect(menus).toHaveCount(2)
    await expectSmallMenu(menus.nth(1), 'submenu of default open')
  })

  test('gives the one tooltip of a bar the size of each trigger it moves to', async ({ page }) => {
    await open(page)
    const scope = region(page, 'Scope')
    const tooltip = page.locator(TOOLTIP)
    const small = scope.getByRole('button', { name: 'Small', exact: true })
    await small.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await small.hover()
    await expect(tooltip).toHaveText('Small tip')
    expect(await tooltip.evaluate((element) => [element.getAttribute('data-size'), element.getAttribute('data-corners')])).toEqual(['xs', 'none'])
    const first = await tooltip.elementHandle()

    await scope.getByRole('button', { name: 'Large', exact: true }).hover()
    await expect(tooltip).toHaveText('Large tip')
    expect(await tooltip.evaluate((element, previous) => element === previous, first)).toBe(true)
    expect(await tooltip.evaluate((element) => [element.getAttribute('data-size'), element.getAttribute('data-corners')])).toEqual(['xl', 'none'])
  })

  test('slides no pill in a group or a menu of a subtree with the motion off', async ({ page }) => {
    await page.addInitScript(recordAnimations)
    await open(page)
    const still = region(page, 'Motion off')
    const range = still.getByRole('radiogroup', { name: 'Still range', exact: true })
    const day = range.getByRole('radio', { name: 'Day', exact: true })
    await expect(activePill(range)).toHaveAttribute('data-visible', 'true')
    await page.waitForTimeout(SETTLE)
    await clearRecorded(page)
    await range.getByRole('radio', { name: 'Month', exact: true }).hover()
    await day.click()
    await expect(day).toHaveAttribute('aria-checked', 'true')

    await still.getByRole('button', { name: 'Still menu', exact: true }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toHaveAttribute('data-motion', 'off')
    for (const name of ['Open', 'Duplicate', 'Close']) await hover(page, row(menu, name))
    await expect(menu.locator('[data-recipe="indicator"]')).toHaveAttribute('data-visible', 'true')

    expect((await recorded(page)).filter((animation) => animation.recipe === 'indicator')).toEqual([])
  })

  test('flies the one tooltip of a bar only to a trigger whose subtree has motion', async ({ page }) => {
    await page.addInitScript(recordAnimations)
    await open(page)
    const still = region(page, 'Motion off')
    const tooltip = page.locator(TOOLTIP)
    const flights = async (): Promise<number> => (await recorded(page)).filter((animation) => animation.variant === 'tooltip').length
    const settled = async (name: string): Promise<boolean> => {
      const [tip, trigger] = await Promise.all([box(tooltip), box(still.getByRole('button', { name, exact: true }))])
      return Math.abs(tip.x + tip.width / 2 - (trigger.x + trigger.width / 2)) <= TOLERANCE
    }
    await page.mouse.move(0, 0)

    await still.getByRole('button', { name: 'First still', exact: true }).hover()
    await expect(tooltip).toHaveText('First still tip')
    await still.getByRole('button', { name: 'Second still', exact: true }).hover()
    await expect(tooltip).toHaveText('Second still tip')
    await expect(tooltip).toHaveAttribute('data-motion', 'off')
    await expect.poll(() => settled('Second still')).toBe(true)
    expect(await flights()).toBe(0)

    await still.getByRole('button', { name: 'Moving', exact: true }).hover()
    await expect(tooltip).toHaveText('Moving tip')
    await expect(tooltip).toHaveAttribute('data-motion', 'spring')
    await expect.poll(flights).toBe(1)
  })

  test('changes a theme axis and opens a menu without re-rendering a component outside the menu but its trigger', async ({ page }) => {
    await page.addInitScript(installCommitProbe)
    await open(page)
    await expect.poll(() => page.evaluate(() => window.labRenders?.some((render) => render.area === 'page') ?? false)).toBe(true)
    await clearRenders(page)
    await page.getByRole('complementary', { name: 'Theme' }).getByRole('button', { name: /^corners / }).click()
    await page.getByRole('menuitemcheckbox', { name: 'sm', exact: true }).click()
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-corners', 'sm')
    expect(await page.evaluate(() => (window.labRenders ?? []).filter((render) => render.area !== 'panel').length)).toBe(0)

    await clearRenders(page)
    const trigger = region(page, 'Small bar').getByRole('button', { name: 'File', exact: true })
    await trigger.click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const outside = await page.evaluate(
      ([popup, opener, guard, excerpt]) => {
        let layer: Element | null = popup
        while (layer?.parentElement && layer.parentElement !== document.body) layer = layer.parentElement
        return (window.labRenders ?? [])
          .flatMap((render) => (render.area === 'page' && render.host ? [render.host] : []))
          .filter((host) => !layer?.contains(host) && host !== opener && !host.matches(guard))
          .map((host) => host.outerHTML.slice(0, excerpt))
      },
      [await menu.elementHandle(), await trigger.elementHandle(), FOCUS_GUARD, HOST_EXCERPT] as const,
    )
    expect(outside).toEqual([])
  })
})
