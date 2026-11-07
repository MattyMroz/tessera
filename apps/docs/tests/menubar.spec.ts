import { expect, test, type Locator, type Page } from '@playwright/test'
import { clearRecorded, recordAnimations, recorded, settle, visit } from './helpers'

const FRAME_MS = 16
const FADE_FRAMES = 20
const NARROW = 220
const CENTRE_TOLERANCE = 0.5
const SWEEP_STEPS = 12
const GLIDE_STEPS = 6
const HESITATION_MS = 200
const CLOSE_FRAMES = 3
const GAP_OFFSET = 3
const TALL_WINDOW = { width: 1280, height: 900 }
const REST_MS = 100

type Point = { readonly x: number; readonly y: number }

async function glide(page: Page, from: Point, to: Point): Promise<void> {
  for (let step = 1; step <= GLIDE_STEPS; step += 1) {
    await page.mouse.move(from.x + ((to.x - from.x) * step) / GLIDE_STEPS, from.y + ((to.y - from.y) * step) / GLIDE_STEPS)
    await page.waitForTimeout(FRAME_MS)
  }
}

async function centre(target: Locator): Promise<Point> {
  const box = await target.boundingBox()
  if (!box) throw new Error('no box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function rest(page: Page, target: Locator): Promise<void> {
  const point = await centre(target)
  await page.mouse.move(point.x, point.y)
}

async function openArchive(page: Page): Promise<{ archive: Locator; compression: Locator }> {
  await open(page, 'Bar A', 'File')
  await rest(page, page.getByRole('menuitem', { name: 'Export', exact: true }))
  const archive = page.getByRole('menuitem', { name: 'Archive', exact: true })
  await expect(archive).toBeVisible()
  await rest(page, archive)
  const compression = page.getByRole('menuitem', { name: 'Compression', exact: true })
  await expect(compression).toBeVisible()
  return { archive, compression }
}

function frame(page: Page, label: string): Locator {
  return page.getByRole('group', { name: label, exact: true })
}

function trigger(page: Page, label: string, name: string): Locator {
  return frame(page, label).getByRole('menuitem', { name, exact: true })
}

async function open(page: Page, label: string, name: string): Promise<Locator> {
  const target = trigger(page, label, name)
  await target.scrollIntoViewIfNeeded()
  await target.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await settle(page)
  return menu
}

function pillsOn(target: Locator): Promise<number> {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const pills = element.parentElement?.querySelectorAll<HTMLElement>(':scope > [data-recipe="indicator"]') ?? []
    return [...pills].filter((pill) => {
      const box = pill.getBoundingClientRect()
      const overlap = Math.min(box.right, rect.right) - Math.max(box.left, rect.left)
      return Number.parseFloat(getComputedStyle(pill).opacity) > 0 && overlap > rect.width / 2
    }).length
  })
}

function rowPill(menu: Locator) {
  return menu.locator(':scope > [data-recipe="indicator"]')
}

function paint(pill: Locator) {
  return pill.evaluate((element) => {
    const squash = element.querySelector('[data-slot="squash"]')
    if (!squash) throw new Error('no squash')
    const style = getComputedStyle(squash)
    return { color: style.backgroundColor, opacity: style.opacity }
  })
}

test.beforeEach(async ({ page }) => {
  await visit(page, '/')
})

test('shows one pill on the trigger of the open menu of an accent bar, also under the pointer', async ({ page }) => {
  await open(page, 'Accent A', 'File')
  const file = trigger(page, 'Accent A', 'File')
  await file.hover()
  await settle(page)
  expect(await pillsOn(file)).toBe(1)
})

test('shows the accent pill on the trigger of a menu opened from a closed bar at once, without flying from the menu opened before', async ({ page }) => {
  await open(page, 'Accent A', 'File')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  const help = trigger(page, 'Accent A', 'Help')
  await help.click()
  const pill = frame(page, 'Accent A').locator('[data-recipe="indicator"][data-variant="active"]')
  const first = await pill.evaluate((element) => ({ moving: element.getAnimations().length, left: element.getBoundingClientRect().left }))
  const target = await help.evaluate((element) => element.getBoundingClientRect().left)
  expect(first.moving).toBe(0)
  expect(Math.abs(first.left - target)).toBeLessThanOrEqual(CENTRE_TOLERANCE)
})

test('shows no grey pill in any frame while the pointer sweeps an accent bar with an open menu', async ({ page }) => {
  await open(page, 'Accent A', 'File')
  const bar = frame(page, 'Accent A')
  const grey = bar.locator('[data-recipe="indicator"][data-variant="hover"]')
  await grey.evaluate((element, ms) => {
    const seen: number[] = []
    const sample = () => {
      seen.push(Number.parseFloat(getComputedStyle(element).opacity))
      if (element.isConnected) setTimeout(sample, ms)
    }
    sample()
    Object.assign(element, { seen })
  }, FRAME_MS)
  const [first, last] = await Promise.all([trigger(page, 'Accent A', 'File').boundingBox(), trigger(page, 'Accent A', 'Help').boundingBox()])
  if (!first || !last) throw new Error('no triggers')
  const y = first.y + first.height / 2
  await page.mouse.move(first.x + first.width / 2, y)
  await page.mouse.move(last.x + last.width / 2, y, { steps: SWEEP_STEPS })
  await page.mouse.move(first.x + first.width / 2, y, { steps: SWEEP_STEPS })
  await settle(page)
  const seen = await grey.evaluate((element) => (element as HTMLElement & { seen: number[] }).seen)
  expect(seen.length).toBeGreaterThan(0)
  expect(Math.max(...seen)).toBe(0)
})

test('keeps the pill of a danger row in the danger colour in every frame while the pointer leaves the menu', async ({ page }) => {
  const menu = await open(page, 'Bar A', 'File')
  const close = menu.getByRole('menuitem', { name: /^Close project/ })
  await close.hover()
  await settle(page)
  const pill = rowPill(menu)
  const danger = await paint(pill)
  await page.mouse.move(1, 1)
  const frames = await pill.evaluate(
    async (element, { count, ms }) => {
      const squash = element.querySelector('[data-slot="squash"]')
      if (!squash) throw new Error('no squash')
      const seen: { color: string; opacity: number }[] = []
      for (let index = 0; index < count; index += 1) {
        seen.push({ color: getComputedStyle(squash).backgroundColor, opacity: Number.parseFloat(getComputedStyle(element).opacity) })
        await new Promise((resolve) => setTimeout(resolve, ms))
      }
      return seen
    },
    { count: FADE_FRAMES, ms: FRAME_MS },
  )
  expect(frames.filter((seen) => seen.opacity > 0).map((seen) => seen.color).filter((color) => color !== danger.color)).toEqual([])
})

test('fills the hover pill of the rows of an accent bar like its open trigger and keeps the colour of a tone', async ({ page }) => {
  const menu = await open(page, 'Accent A', 'File')
  const openPill = page.getByRole('group', { name: 'Accent A', exact: true }).locator('[data-recipe="indicator"][data-variant="active"]')
  await menu.getByRole('menuitem', { name: /^Save Ctrl\+S/ }).hover()
  await settle(page)
  expect(await paint(rowPill(menu))).toEqual(await paint(openPill))
  await menu.getByRole('menuitem', { name: /^Close project/ }).hover()
  await settle(page)
  expect(await rowPill(menu).getAttribute('data-tone')).toBe('danger')
  expect((await paint(rowPill(menu))).color).not.toBe((await paint(openPill)).color)
})

test('moves the accent pill between open menus with the time and the curve of the grey pill, without an overshoot', async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await visit(page, '/')
  const flight = async (label: string, variant: string) => {
    await open(page, label, 'File')
    await clearRecorded(page)
    await trigger(page, label, 'Edit').hover()
    await expect.poll(async () => (await recorded(page)).filter((animation) => animation.variant === variant).length).toBeGreaterThan(0)
    const [first] = (await recorded(page)).filter((animation) => animation.variant === variant)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
    return { duration: first?.duration, easing: first?.easing }
  }
  const grey = await flight('Bar A', 'hover')
  const accent = await flight('Accent A', 'active')
  expect(accent).toEqual(grey)
})

test('slides "…" in from the first hidden menu on compositor properties only and never transforms a trigger, an anchor', async ({ page }) => {
  const bar = frame(page, 'Bar A')
  await bar.scrollIntoViewIfNeeded()
  const more = bar.getByRole('menuitem', { name: 'More menus', exact: true })
  const sampled = bar.evaluate(async (element, { count, ms }) => {
    const seen: { parts: string[]; anchors: string[] }[] = []
    for (let index = 0; index < count; index += 1) {
      const triggers = [...element.querySelectorAll<HTMLElement>('[role="menuitem"]')]
      seen.push({
        parts: triggers.flatMap((trigger) => [...trigger.children, trigger].flatMap((node) => node.getAnimations().flatMap((animation) => Object.keys((animation.effect as KeyframeEffect).getKeyframes()[0] ?? {})))),
        anchors: triggers.map((trigger) => getComputedStyle(trigger).transform).filter((transform) => transform !== 'none'),
      })
      await new Promise((resolve) => setTimeout(resolve, ms))
    }
    return seen
  }, { count: FADE_FRAMES, ms: FRAME_MS })
  await bar.evaluate((element, width) => (element.style.width = `${width}px`), NARROW)
  const seen = await sampled
  await expect(more).toBeVisible()
  const properties = new Set(seen.flatMap((sample) => sample.parts))
  expect(properties.has('transform')).toBe(true)
  expect([...properties].filter((property) => !['transform', 'opacity', 'offset', 'easing', 'composite', 'computedOffset'].includes(property))).toEqual([])
  expect(seen.flatMap((sample) => sample.anchors)).toEqual([])
})

test('hides the menus that no longer fit behind "…" when the frame narrows and shows them again when it widens', async ({ page }) => {
  const bar = frame(page, 'Bar A')
  await bar.scrollIntoViewIfNeeded()
  const more = bar.getByRole('menuitem', { name: 'More menus', exact: true })
  await expect(more).toBeHidden()
  await bar.evaluate((element, width) => (element.style.width = `${width}px`), NARROW)
  await expect(more).toBeVisible()
  await expect(bar.getByRole('menuitem', { name: 'Help', exact: true })).toBeHidden()
  const cut = await bar
    .locator('[role="menuitem"] [data-slot="label"]')
    .evaluateAll((labels) => labels.filter((label) => label.checkVisibility() && label.scrollWidth > label.clientWidth + 1).map((label) => label.textContent))
  expect(cut).toEqual([])
  await bar.evaluate((element) => (element.style.width = ''))
  await expect(more).toBeHidden()
  await expect(bar.getByRole('menuitem', { name: 'Help', exact: true })).toBeVisible()
})

test('keeps a nested submenu open while the pointer pauses on its diagonal way into it', async ({ page }) => {
  await page.setViewportSize(TALL_WINDOW)
  const { archive, compression } = await openArchive(page)
  const row = await archive.boundingBox()
  const target = await compression.boundingBox()
  if (!row || !target) throw new Error('no box')
  expect(target.y).toBeGreaterThan(row.y + row.height)
  const start = { x: row.x + row.width - row.height, y: row.y + row.height / 2 }
  const gap = { x: row.x + row.width - GAP_OFFSET, y: row.y + row.height + GAP_OFFSET }
  await glide(page, start, gap)
  await page.waitForTimeout(HESITATION_MS)
  await glide(page, gap, { x: target.x + target.height, y: target.y + target.height / 2 })
  await expect(compression).toBeVisible()
})

test('closes a nested submenu at once when the pointer leaves its trigger for another row', async ({ page }) => {
  const { archive, compression } = await openArchive(page)
  await glide(page, await centre(archive), await centre(page.getByRole('menuitem', { name: 'Pages as WebP', exact: true })))
  await page.waitForTimeout(FRAME_MS * CLOSE_FRAMES)
  await expect(compression).toBeHidden({ timeout: 0 })
})

async function arriveOnCloseProject(page: Page): Promise<Locator> {
  await page.setViewportSize(TALL_WINDOW)
  await open(page, 'Bar A', 'File')
  const exportRow = page.getByRole('menuitem', { name: 'Export', exact: true })
  await rest(page, exportRow)
  await expect(page.getByRole('menuitem', { name: 'Pages as PNG', exact: true })).toBeVisible()
  const closeProject = page.getByRole('menuitem', { name: /^Close project/ })
  const row = await closeProject.boundingBox()
  if (!row) throw new Error('no box')
  await glide(page, await centre(exportRow), { x: row.x + row.width - row.height, y: row.y + row.height / 2 })
  return closeProject
}

test('hands the hover to a row of the menu where the pointer rests under an open submenu, without another move', async ({ page }) => {
  const closeProject = await arriveOnCloseProject(page)
  await expect(closeProject).toHaveAttribute('data-highlighted', '', { timeout: REST_MS + FRAME_MS * CLOSE_FRAMES })
  await expect(page.getByRole('menuitem', { name: 'Pages as PNG', exact: true })).toBeHidden()
})

test('runs a row of the menu clicked right after the pointer arrives on it under an open submenu', async ({ page }) => {
  await arriveOnCloseProject(page)
  await page.mouse.down()
  await page.mouse.up()
  await expect(page.getByRole('menuitem', { name: 'Save as', exact: true })).toBeHidden()
})

test('moves the hover row by row while the pointer goes straight down the menu under an open submenu', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit moves the mouse with movementX and movementY 0, and Base UI ignores such moves over a row in WebKit')
  await page.setViewportSize(TALL_WINDOW)
  await open(page, 'Bar A', 'File')
  const recent = page.getByRole('menuitem', { name: 'Open recent', exact: true })
  await rest(page, recent)
  await expect(page.getByRole('menu')).toHaveCount(2)
  let from = await centre(recent)
  for (const name of ['Save Ctrl+S', 'Save as Ctrl+Shift+S']) {
    const row = page.getByRole('menuitem', { name, exact: true })
    const to = { x: from.x, y: (await centre(row)).y }
    await glide(page, from, to)
    await expect(row).toHaveAttribute('data-highlighted', '', { timeout: FRAME_MS * CLOSE_FRAMES })
    from = to
  }
  await expect(page.getByRole('menu')).toHaveCount(1)
})
