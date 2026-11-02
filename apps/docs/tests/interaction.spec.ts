import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, PRESS_GROUPS, pressReport, visit, type PressGroup } from './helpers'

declare global {
  interface Window {
    pressMarks?: { readonly pressed: boolean; readonly at: number }[]
  }
}

const LAB_PAGES = ['/', '/foundation', '/components', '/screens/overlays', '/screens/edges'] as const
const PAGE = '/components'
const HELD = 300
const OUTSIDE = 40
const MOVE_STEPS = 4
const EDGE_INSET = 1
const JIGGLE = 0.4
const JIGGLES = 12
const JIGGLE_PAUSE = 40
const HOLD_TOLERANCE = 20

function solid(page: Page): Locator {
  return page.getByRole('region', { name: 'Button', exact: true }).getByRole('button', { name: 'solid', exact: true })
}

async function watchMarks(target: Locator): Promise<void> {
  await target.evaluate((element) => {
    window.pressMarks = []
    new MutationObserver(() => window.pressMarks?.push({ pressed: element.hasAttribute('data-pressing'), at: performance.now() })).observe(element, {
      attributes: true,
      attributeFilter: ['data-pressing'],
    })
  })
}

function marks(page: Page): Promise<{ readonly pressed: boolean; readonly at: number }[]> {
  return page.evaluate(() => window.pressMarks ?? [])
}

function pressHold(target: Locator): Promise<number> {
  return target.evaluate((element) => {
    const value = getComputedStyle(element).getPropertyValue('--ts-motion-press-hold').trim()
    return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000
  })
}

for (const path of LAB_PAGES) {
  test(`gives every interactive element of ${path} exactly one press group and the press of its group`, async ({ page }) => {
    await visit(page, path)
    const report = await pressReport(page)
    expect(report.problems).toEqual([])
    expect(report.counts.anchor ?? 0).toBeGreaterThan(0)
  })
}

test('finds every press group on the lab pages, the ones that wait for the owner (O7) included', async ({ page }) => {
  const counts: Record<string, number> = {}
  for (const path of LAB_PAGES) {
    await visit(page, path)
    for (const [group, count] of Object.entries((await pressReport(page)).counts)) counts[group] = (counts[group] ?? 0) + count
  }
  expect(Object.keys(counts).sort()).toEqual((Object.keys(PRESS_GROUPS) as PressGroup[]).sort())
})

test.describe('the press mechanism', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('holds a press of Space until the key goes up', async ({ page }) => {
    const button = solid(page)
    await button.focus()
    await page.keyboard.down('Space')
    await expect(button).toHaveAttribute('data-pressing', '')
    await page.waitForTimeout(HELD)
    await expect(button).toHaveAttribute('data-pressing', '')
    await page.keyboard.up('Space')
    await expect(button).not.toHaveAttribute('data-pressing')
  })

  test('flashes a press of Enter for the press hold of the engine', async ({ page }) => {
    const button = solid(page)
    await button.focus()
    await watchMarks(button)
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await marks(page)).length).toBe(2)
    const [down, up] = await marks(page)
    expect([down?.pressed, up?.pressed]).toEqual([true, false])
    expect((up?.at ?? 0) - (down?.at ?? 0)).toBeGreaterThanOrEqual((await pressHold(button)) - HOLD_TOLERANCE)
  })

  test('lifts a press when the pointer leaves the control and presses again when it comes back', async ({ page }) => {
    const button = solid(page)
    const target = await box(button)
    const middle = { x: target.x + target.width / 2, y: target.y + target.height / 2 }
    await page.mouse.move(middle.x, middle.y)
    await page.mouse.down()
    await expect(button).toHaveAttribute('data-pressing', '')
    await page.mouse.move(target.x + target.width + OUTSIDE, middle.y, { steps: MOVE_STEPS })
    await expect(button).not.toHaveAttribute('data-pressing')
    await page.mouse.move(middle.x, middle.y, { steps: MOVE_STEPS })
    await expect(button).toHaveAttribute('data-pressing', '')
    await page.mouse.up()
    await expect(button).not.toHaveAttribute('data-pressing')
  })

  test('keeps a press held one pixel inside the edge of the control while the pointer jiggles, although the pressed control shrinks', async ({ page }) => {
    const button = solid(page)
    const target = await box(button)
    const edge = { x: target.x + EDGE_INSET, y: target.y + target.height / 2 }
    await page.mouse.move(edge.x, edge.y)
    await page.mouse.down()
    await expect(button).toHaveAttribute('data-pressing', '')
    await watchMarks(button)
    for (let step = 0; step < JIGGLES; step++) {
      await page.mouse.move(edge.x + (step % 2) * JIGGLE, edge.y)
      await page.waitForTimeout(JIGGLE_PAUSE)
    }
    expect(await marks(page)).toEqual([])
    await page.mouse.up()
    await expect(button).not.toHaveAttribute('data-pressing')
  })

  test('never presses a disabled, an aria-disabled or a busy control, by pointer or by key', async ({ page }) => {
    const blocked = [
      page.getByRole('radiogroup', { name: 'With a disabled option', exact: true }).getByRole('radio', { name: 'Week' }),
      page.getByRole('form', { name: 'Blocked activation', exact: true }).getByRole('button', { name: 'Disabled submit', exact: true }),
      page.getByRole('form', { name: 'Blocked activation', exact: true }).getByRole('button', { name: 'Busy submit', exact: true }),
    ]
    for (const control of blocked) {
      await control.scrollIntoViewIfNeeded()
      await watchMarks(control)
      const target = await box(control)
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2)
      await page.mouse.down()
      await page.mouse.up()
      await control.evaluate((element) => {
        if (element instanceof HTMLElement) element.focus()
      })
      await page.keyboard.press('Space')
      await page.keyboard.press('Enter')
      expect(await marks(page)).toEqual([])
    }
  })
})
