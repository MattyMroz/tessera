import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, visit } from './helpers'

const PAGE = '/'
const SETTLE = 600
const AWAY = 60
const WARM_RETURN = 40
const COLD_RETURN = 400
const WATCH = 400
const STILL_OPEN = 1000
const STEADY = 0.01
const BETWEEN = 2

type Frame = { readonly opacity: number; readonly x: number; readonly y: number; readonly menus: number }

const WITH_SUBMENU = 2

const STEP = 0.25
const SHOWN = 0.5

function group(page: Page, name: string): Locator {
  return page.getByRole('radiogroup', { name, exact: true })
}

function hoverPill(scope: Locator): Locator {
  return scope.locator('[data-recipe="indicator"][data-variant="hover"]')
}

async function centre(target: Locator): Promise<{ x: number; y: number }> {
  const rect = await box(target)
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

async function watch(pill: Locator): Promise<() => Promise<Frame[]>> {
  await pill.evaluate((element) => {
    const frames: { opacity: number; x: number; y: number; menus: number }[] = []
    const store = window as unknown as { __frames: typeof frames; __watching: boolean }
    store.__frames = frames
    store.__watching = true
    const sample = (): void => {
      if (!store.__watching) return
      const rect = element.getBoundingClientRect()
      const seen = (menu: Element): boolean =>
        menu.getBoundingClientRect().width > 0 &&
        [menu, menu.parentElement].every((part) => {
          if (!part) return false
          const style = getComputedStyle(part)
          return style.visibility === 'visible' && Number.parseFloat(style.opacity) > 0 && style.display !== 'none'
        })
      const menus = [...document.querySelectorAll('[role="menu"]')].filter(seen).length
      frames.push({ opacity: Number.parseFloat(getComputedStyle(element).opacity), x: rect.x, y: rect.y, menus })
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  return () =>
    pill.evaluate(() => {
      const store = window as unknown as { __frames: Frame[]; __watching: boolean }
      store.__watching = false
      return store.__frames
    })
}

async function leaveAndReturn(page: Page, wait: number): Promise<{ frames: Frame[]; from: number; to: number }> {
  await visit(page, PAGE)
  const range = group(page, 'Range (raised)')
  await range.scrollIntoViewIfNeeded()
  const pill = hoverPill(range)
  const month = range.getByRole('radio', { name: 'Month', exact: true })
  const week = range.getByRole('radio', { name: 'Week', exact: true })
  const start = await centre(month)
  await page.mouse.move(start.x, start.y)
  await expect(pill).toHaveAttribute('data-visible', 'true')
  await page.waitForTimeout(SETTLE)
  const from = (await box(month)).x
  const to = (await box(week)).x
  const stop = await watch(pill)
  await page.mouse.move(start.x, start.y - AWAY)
  await page.waitForTimeout(wait)
  const end = await centre(week)
  await page.mouse.move(end.x, end.y)
  await page.waitForTimeout(WATCH)
  return { frames: await stop(), from, to }
}

function afterReturn(frames: readonly Frame[]): Frame[] {
  const lowest = frames.reduce((index, frame, at) => (frame.opacity < (frames[index]?.opacity ?? 1) ? at : index), 0)
  return frames.slice(lowest)
}

test('brings the hover pill back from where it faded with a flight and a rising opacity when the pointer returns while the group is warm', async ({ page }) => {
  const { frames, from, to } = await leaveAndReturn(page, WARM_RETURN)
  const back = afterReturn(frames)
  expect(back.length).toBeGreaterThan(1)
  for (const [index, frame] of back.entries()) {
    const previous = back[index - 1]
    if (previous) expect(frame.opacity, `opacity ${previous.opacity} → ${frame.opacity}`).toBeGreaterThanOrEqual(previous.opacity - STEADY)
  }
  const [low] = back
  const next = back[1]
  if (!low || !next) throw new Error('no frames')
  expect(next.opacity - low.opacity, 'no jump to full opacity in one frame').toBeLessThan(1 - low.opacity - STEADY)
  expect(back.some((frame) => frame.x < from - BETWEEN && frame.x > to + BETWEEN)).toBe(true)
})

test('shows the hover pill on its new place without a flight when the pointer returns after the group got cold', async ({ page }) => {
  const { frames, to } = await leaveAndReturn(page, COLD_RETURN)
  const visible = afterReturn(frames).filter((frame) => frame.opacity > STEADY)
  expect(visible.length).toBeGreaterThan(0)
  expect(visible[0]?.opacity, 'shown at once').toBeGreaterThan(1 - STEADY)
  for (const frame of visible) expect(Math.abs(frame.x - to), `x ${frame.x}`).toBeLessThan(BETWEEN)
})

for (const dwell of [0, 150, 400]) {
  test(`keeps the row pill shown and flies it from an open submenu row to the next submenu row across their border after ${dwell} ms there`, async ({ page }) => {
    await visit(page, PAGE)
    const bar = page.getByRole('group', { name: 'Bar A', exact: true })
    const format = bar.getByRole('menuitem', { name: 'Format', exact: true })
    await format.scrollIntoViewIfNeeded()
    await format.click()
    const menu = page.getByRole('menu').first()
    const text = menu.getByRole('menuitem', { name: 'Text', exact: true })
    const bubble = menu.getByRole('menuitem', { name: 'Bubble', exact: true })
    const start = await centre(text)
    await page.mouse.move(start.x, start.y)
    await expect(text).toHaveAttribute('data-popup-open', '')
    await page.waitForTimeout(SETTLE)
    const from = (await box(text)).y
    const to = (await box(bubble)).y
    const pill = menu.locator(':scope > [data-recipe="indicator"]')
    const stop = await watch(pill)
    for (let y = start.y; y < to; y += STEP) await page.mouse.move(start.x, y)
    await page.waitForTimeout(dwell)
    const end = await centre(bubble)
    for (let y = to; y <= end.y; y += STEP * 8) await page.mouse.move(start.x, y)
    await expect(bubble).toHaveAttribute('data-popup-open', '')
    await page.waitForTimeout(WATCH)
    const frames = await stop()
    for (const frame of frames) expect(frame.opacity, `opacity at y ${frame.y}`).toBeGreaterThan(SHOWN)
    expect(frames.filter((frame) => frame.menus < WITH_SUBMENU).length, 'frames without a submenu').toBe(0)
    expect(frames.some((frame) => frame.y > from + BETWEEN && frame.y < to - BETWEEN), 'a frame between the rows').toBe(true)
    expect(Math.abs((frames.at(-1)?.y ?? 0) - to)).toBeLessThan(BETWEEN)
  })
}

test('keeps the row pill on a submenu row while the pointer crosses the separator under it and flies it to the next row', async ({ page }) => {
  await visit(page, PAGE)
  const bar = page.getByRole('group', { name: 'Bar A', exact: true })
  const format = bar.getByRole('menuitem', { name: 'Format', exact: true })
  await format.scrollIntoViewIfNeeded()
  await format.click()
  const menu = page.getByRole('menu').first()
  const bubble = menu.getByRole('menuitem', { name: 'Bubble', exact: true })
  const next = menu.getByRole('menuitemradio', { name: 'Align left', exact: true })
  const start = await centre(bubble)
  await page.mouse.move(start.x, start.y)
  await expect(bubble).toHaveAttribute('data-popup-open', '')
  await page.waitForTimeout(SETTLE)
  const from = (await box(bubble)).y
  const to = (await box(next)).y
  const pill = menu.locator(':scope > [data-recipe="indicator"]')
  const stop = await watch(pill)
  for (let y = start.y; y < to; y += 1) await page.mouse.move(start.x, y)
  await page.waitForTimeout(WATCH)
  const crossing = await stop()
  for (const frame of crossing) expect(frame.opacity, `opacity at y ${frame.y}`).toBeGreaterThan(SHOWN)
  expect(Math.abs((crossing.at(-1)?.y ?? 0) - from), 'still on the submenu row over the separator').toBeLessThan(BETWEEN)
  const again = await watch(pill)
  const end = await centre(next)
  for (let y = to; y <= end.y; y += 2) await page.mouse.move(start.x, y)
  await page.waitForTimeout(WATCH)
  const arriving = await again()
  for (const frame of arriving) expect(frame.opacity, `opacity at y ${frame.y}`).toBeGreaterThan(SHOWN)
  expect(arriving.some((frame) => frame.y > from + BETWEEN && frame.y < to - BETWEEN), 'a frame between the rows').toBe(true)
})

for (const into of [1, 4, 14]) {
test(`opens the submenu of the next row and moves the row pill there when the pointer stops ${into} px into that row while the submenu above is open`, async ({ page }) => {
  await visit(page, PAGE)
  const bar = page.getByRole('group', { name: 'Bar A', exact: true })
  const format = bar.getByRole('menuitem', { name: 'Format', exact: true })
  await format.scrollIntoViewIfNeeded()
  await format.click()
  const menu = page.getByRole('menu').first()
  const text = menu.getByRole('menuitem', { name: 'Text', exact: true })
  const bubble = menu.getByRole('menuitem', { name: 'Bubble', exact: true })
  const start = await centre(text)
  await page.mouse.move(start.x, start.y)
  await expect(text).toHaveAttribute('data-popup-open', '')
  await page.waitForTimeout(SETTLE)
  const pill = menu.locator(':scope > [data-recipe="indicator"]')
  const stop = await watch(pill)
  const end = (await box(bubble)).y + into
  for (let y = start.y; y < end; y += STEP * 8) await page.mouse.move(start.x, y)
  await page.mouse.move(start.x, end)
  await expect(bubble).toHaveAttribute('data-popup-open', '', { timeout: STILL_OPEN })
  await page.waitForTimeout(WATCH)
  const frames = await stop()
  expect(frames.filter((frame) => frame.menus < WITH_SUBMENU).length, 'frames without a submenu').toBe(0)
  expect(Math.abs((frames.at(-1)?.y ?? 0) - (await box(bubble)).y)).toBeLessThan(BETWEEN)
})
}

const SCALES = [1, 1.25, 1.5] as const
const BORDER_REACH = 3
const BORDER_REST = 450

type RowState = { readonly pill: string; readonly open: string; readonly submenu: string }

function rowState(page: Page): Promise<RowState> {
  return page.evaluate(() => {
    const [menu, submenu] = document.querySelectorAll('[role="menu"]')
    if (!menu) throw new Error('no menu')
    const rows = [...menu.querySelectorAll('[role^="menuitem"]')]
    const pill = menu.querySelector(':scope > [data-recipe="indicator"]')
    const top = pill?.getBoundingClientRect().y ?? Number.NaN
    const name = (row: Element | undefined): string => row?.textContent.trim() ?? 'none'
    return {
      pill: pill?.getAttribute('data-visible') === 'true' ? name(rows.find((row) => Math.abs(row.getBoundingClientRect().y - top) < 1)) : 'hidden',
      open: name(rows.find((row) => row.hasAttribute('data-popup-open'))),
      submenu: name(submenu?.querySelector('[role^="menuitem"]') ?? undefined),
    }
  })
}

for (const scale of SCALES) {
  test.describe(`at a device scale of ${scale}`, () => {
    test.use({ deviceScaleFactor: scale })

    for (const way of ['down', 'up'] as const) {
      test(`keeps the row pill and the open submenu on one row on every device pixel across the border of two submenu rows going ${way}`, async ({ page }) => {
        await visit(page, PAGE)
        const bar = page.getByRole('group', { name: 'Accent A', exact: true })
        const format = bar.getByRole('menuitem', { name: 'Format', exact: true })
        await format.scrollIntoViewIfNeeded()
        await format.click()
        const menu = page.getByRole('menu').first()
        const [text, bubble] = await Promise.all([box(menu.getByRole('menuitem', { name: 'Text', exact: true })), box(menu.getByRole('menuitem', { name: 'Bubble', exact: true }))])
        const x = text.x + text.width / 2
        const snap = (value: number): number => Math.round(value * scale) / scale
        const points: number[] = []
        for (let y = snap(bubble.y - BORDER_REACH); y <= snap(bubble.y + BORDER_REACH); y = snap(y + 1 / scale)) points.push(y)
        const from = way === 'down' ? text : bubble
        await page.mouse.move(x, from.y + from.height / 2)
        await expect(menu.getByRole('menuitem', { name: way === 'down' ? 'Text' : 'Bubble', exact: true })).toHaveAttribute('data-popup-open', '')
        const owners: Readonly<Record<string, string>> = { Text: 'Font', Bubble: 'Shape' }
        for (const y of way === 'down' ? points : points.toReversed()) {
          await page.mouse.move(x, y)
          await page.waitForTimeout(BORDER_REST)
          const state = await rowState(page)
          expect(state, `y ${y} (border ${bubble.y})`).toEqual({ pill: state.open, open: state.open, submenu: owners[state.open] ?? 'missing' })
          expect(Object.keys(owners), `y ${y}: an open row`).toContain(state.open)
        }
      })
    }
  })
}

type SyncFrame = { readonly pillAt: string; readonly open: string; readonly submenus: number }

const TOOL_ROWS = ['Brush', 'Eraser', 'Lasso', 'Pen', 'Bucket'] as const
const SWEEP_STEP = 2
const SWEEP_PAUSE = 16

for (const scale of SCALES) {
  test.describe(`moving through a stack of submenu rows at a device scale of ${scale}`, () => {
    test.use({ deviceScaleFactor: scale })

    test('moves the row pill together with the open submenu, never resting on a row whose submenu is closed and never leaving a frame without a submenu', async ({ page }) => {
      await visit(page, PAGE)
      const bar = page.getByRole('group', { name: 'Accent A', exact: true })
      const tools = bar.getByRole('menuitem', { name: 'Tools', exact: true })
      await tools.scrollIntoViewIfNeeded()
      await tools.click()
      const menu = page.getByRole('menu').first()
      const first = await box(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true }))
      const last = await box(menu.getByRole('menuitem', { name: TOOL_ROWS[TOOL_ROWS.length - 1], exact: true }))
      const x = first.x + first.width / 2
      await page.mouse.move(x, first.y + first.height / 2)
      await expect(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true })).toHaveAttribute('data-popup-open', '')
      await page.waitForTimeout(SETTLE)
      await page.evaluate(() => {
        const frames: SyncFrame[] = []
        const store = window as unknown as { __sync: SyncFrame[]; __syncing: boolean }
        store.__sync = frames
        store.__syncing = true
        const tick = (): void => {
          if (!store.__syncing) return
          const [parent, ...rest] = document.querySelectorAll('[role="menu"]')
          const rows = [...(parent?.querySelectorAll('[role^="menuitem"]') ?? [])]
          const pill = parent?.querySelector(':scope > [data-recipe="indicator"]')
          const top = pill?.getBoundingClientRect().y ?? Number.NaN
          const resting = rows.find((row) => Math.abs(row.getBoundingClientRect().y - top) < 1)
          const shown = rest.filter((menu) => menu.getBoundingClientRect().width > 0 && getComputedStyle(menu.parentElement ?? menu).visibility === 'visible')
          frames.push({
            pillAt: pill?.getAttribute('data-visible') !== 'true' ? 'hidden' : (resting?.textContent.trim() ?? 'moving'),
            open: shown.at(-1)?.querySelector('[role^="menuitem"]')?.textContent.trim().split(' ')[0] ?? 'none',
            submenus: shown.length,
          })
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      const bottom = last.y + last.height / 2
      const top = first.y + first.height / 2
      for (let y = top; y <= bottom; y += SWEEP_STEP) {
        await page.mouse.move(x, y)
        await page.waitForTimeout(SWEEP_PAUSE)
      }
      for (let y = bottom; y >= top; y -= SWEEP_STEP) {
        await page.mouse.move(x, y)
        await page.waitForTimeout(SWEEP_PAUSE)
      }
      await page.waitForTimeout(SETTLE)
      const frames = await page.evaluate(() => {
        const store = window as unknown as { __sync: SyncFrame[]; __syncing: boolean }
        store.__syncing = false
        return store.__sync
      })
      expect(frames.filter((frame) => frame.submenus === 0), 'frames without a submenu').toEqual([])
      expect(frames.filter((frame) => frame.pillAt !== 'moving' && frame.pillAt !== frame.open), 'the pill rests on a row whose submenu is closed').toEqual([])
      expect(new Set(frames.map((frame) => frame.open))).toEqual(new Set(TOOL_ROWS))
    })
  })
}

type OwnerFrame = { readonly resting: string; readonly owner: string }

const QUICK_STEPS = 3
const QUICK_ROUNDS = 12
const QUICK_PAUSE = 40
const QUICK_SPREAD = 60

test('keeps the row pill on the row of the shown submenu in every frame while the pointer darts between two submenu rows', async ({ page }) => {
  await visit(page, PAGE)
  const bar = page.getByRole('group', { name: 'Accent A', exact: true })
  const format = bar.getByRole('menuitem', { name: 'Format', exact: true })
  await format.scrollIntoViewIfNeeded()
  await format.click()
  const menu = page.getByRole('menu').first()
  const [text, bubble] = await Promise.all([box(menu.getByRole('menuitem', { name: 'Text', exact: true })), box(menu.getByRole('menuitem', { name: 'Bubble', exact: true }))])
  const x = text.x + text.width / 2
  await page.mouse.move(x, text.y + text.height / 2)
  await expect(menu.getByRole('menuitem', { name: 'Text', exact: true })).toHaveAttribute('data-popup-open', '')
  await page.evaluate(() => {
    const frames: OwnerFrame[] = []
    const store = window as unknown as { __owners: OwnerFrame[]; __owning: boolean }
    store.__owners = frames
    store.__owning = true
    const owners: Readonly<Record<string, string>> = { Font: 'Text', Shape: 'Bubble' }
    const tick = (): void => {
      if (!store.__owning) return
      const [parent, ...rest] = document.querySelectorAll('[role="menu"]')
      const rows = [...(parent?.querySelectorAll('[role^="menuitem"]') ?? [])]
      const pill = parent?.querySelector(':scope > [data-recipe="indicator"]')
      const top = pill?.getBoundingClientRect().y ?? Number.NaN
      const shown = rest.filter((menu) => menu.getBoundingClientRect().width > 0 && getComputedStyle(menu.parentElement ?? menu).visibility === 'visible')
      frames.push({
        resting: pill?.getAttribute('data-visible') !== 'true' ? 'hidden' : (rows.find((row) => Math.abs(row.getBoundingClientRect().y - top) < 1)?.textContent.trim() ?? 'moving'),
        owner: owners[shown.at(-1)?.querySelector('[role^="menuitem"]')?.textContent.trim() ?? ''] ?? 'none',
      })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  for (let round = 0; round < QUICK_ROUNDS; round += 1) {
    await page.mouse.move(x, bubble.y + bubble.height / 2, { steps: QUICK_STEPS })
    await page.waitForTimeout(QUICK_PAUSE + (round % 4) * QUICK_SPREAD)
    await page.mouse.move(x, text.y + text.height / 2, { steps: QUICK_STEPS })
    await page.waitForTimeout(QUICK_PAUSE + (round % 3) * QUICK_SPREAD)
  }
  await page.waitForTimeout(SETTLE)
  const frames = await page.evaluate(() => {
    const store = window as unknown as { __owners: OwnerFrame[]; __owning: boolean }
    store.__owning = false
    return store.__owners
  })
  expect(frames.filter((frame) => frame.owner === 'none'), 'frames without a submenu').toEqual([])
  expect(frames.filter((frame) => frame.resting !== 'moving' && frame.resting !== frame.owner), 'frames with the pill on another row than the submenu').toEqual([])
})

type TriangleFrame = { readonly resting: string; readonly submenu: string }

const GLIDE_STEP = 3

for (const scale of SCALES) {
  test.describe(`heading into a submenu at a device scale of ${scale}`, () => {
    test.use({ deviceScaleFactor: scale })

    test('keeps the row pill and the submenu of the first row while the pointer glides diagonally over the rows below into the submenu', async ({ page }) => {
      await visit(page, PAGE)
      const bar = page.getByRole('group', { name: 'Accent A', exact: true })
      const tools = bar.getByRole('menuitem', { name: 'Tools', exact: true })
      await tools.scrollIntoViewIfNeeded()
      await tools.click()
      const menu = page.getByRole('menu').first()
      const brush = await box(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true }))
      const start = { x: brush.x + brush.width / 4, y: brush.y + brush.height / 2 }
      await page.mouse.move(start.x, start.y)
      await expect(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true })).toHaveAttribute('data-popup-open', '')
      await page.waitForTimeout(SETTLE)
      const goal = await box(page.getByRole('menu').nth(1).getByRole('menuitem').last())
      const end = { x: goal.x + goal.width / 4, y: goal.y + goal.height / 2 }
      await page.evaluate(() => {
        const frames: TriangleFrame[] = []
        const store = window as unknown as { __triangle: TriangleFrame[]; __gliding: boolean }
        store.__triangle = frames
        store.__gliding = true
        const tick = (): void => {
          if (!store.__gliding) return
          const [parent, ...rest] = document.querySelectorAll('[role="menu"]')
          const rows = [...(parent?.querySelectorAll('[role^="menuitem"]') ?? [])]
          const top = parent?.querySelector(':scope > [data-recipe="indicator"]')?.getBoundingClientRect().y ?? Number.NaN
          frames.push({
            resting: rows.find((row) => Math.abs(row.getBoundingClientRect().y - top) < 1)?.textContent.trim() ?? 'moving',
            submenu: rest.at(-1)?.querySelector('[role^="menuitem"]')?.textContent.trim().split(' ')[0] ?? 'none',
          })
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      const steps = Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / GLIDE_STEP)
      for (let step = 1; step <= steps; step += 1) {
        await page.mouse.move(start.x + ((end.x - start.x) * step) / steps, start.y + ((end.y - start.y) * step) / steps)
        await page.waitForTimeout(SWEEP_PAUSE)
      }
      await page.waitForTimeout(SETTLE)
      const frames = await page.evaluate(() => {
        const store = window as unknown as { __triangle: TriangleFrame[]; __gliding: boolean }
        store.__gliding = false
        return store.__triangle
      })
      expect(frames.filter((frame) => frame.resting !== TOOL_ROWS[0] || frame.submenu !== TOOL_ROWS[0])).toEqual([])
    })
  })
}

type Glide = { readonly from: number; readonly step: number; readonly pause: number; readonly switches: boolean }

const GLIDES: readonly Glide[] = [
  { from: 0.25, step: 1, pause: 0, switches: false },
  { from: 0.25, step: 2, pause: 0, switches: false },
  { from: 0.5, step: 1, pause: 0, switches: false },
  { from: 0.5, step: 2, pause: 0, switches: false },
  { from: 0.9, step: 1, pause: 0, switches: false },
  { from: 0.5, step: 3, pause: 60, switches: false },
  { from: 0.5, step: 3, pause: 150, switches: true },
]
const GLIDE_END = 20
const PAUSE_AT = 0.4

for (const glide of GLIDES) {
  test(`${glide.switches ? 'switches to' : 'keeps'} the submenu of the first row when the pointer glides from ${glide.from} of its width in ${glide.step} px steps${glide.pause ? ` and rests ${glide.pause} ms on a row below` : ''}`, async ({ page }) => {
    await visit(page, PAGE)
    const bar = page.getByRole('group', { name: 'Accent A', exact: true })
    const tools = bar.getByRole('menuitem', { name: 'Tools', exact: true })
    await tools.scrollIntoViewIfNeeded()
    await tools.click()
    const menu = page.getByRole('menu').first()
    const brush = await box(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true }))
    const start = { x: brush.x + brush.width * glide.from, y: brush.y + brush.height / 2 }
    await page.mouse.move(start.x, start.y)
    await expect(menu.getByRole('menuitem', { name: TOOL_ROWS[0], exact: true })).toHaveAttribute('data-popup-open', '')
    await page.waitForTimeout(SETTLE)
    const goal = await box(page.getByRole('menu').nth(1).getByRole('menuitem').last())
    const end = { x: goal.x + GLIDE_END, y: goal.y + goal.height / 2 }
    const steps = Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / glide.step)
    const seen = new Set<string>()
    for (let step = 1; step <= steps; step += 1) {
      await page.mouse.move(start.x + ((end.x - start.x) * step) / steps, start.y + ((end.y - start.y) * step) / steps)
      await page.waitForTimeout(glide.pause && step === Math.round(steps * PAUSE_AT) ? glide.pause : SWEEP_PAUSE)
      seen.add(await page.evaluate(() => document.querySelectorAll('[role="menu"]')[1]?.querySelector('[role^="menuitem"]')?.textContent.trim().split(' ')[0] ?? 'none'))
    }
    if (glide.switches) expect([...seen]).toContain(TOOL_ROWS[1])
    else expect([...seen]).toEqual([TOOL_ROWS[0]])
  })
}
