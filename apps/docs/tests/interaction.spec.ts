import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, choose, clearRecorded, hover, PRESS_GROUPS, pressReport, recordAnimations, recorded, row, timingReport, visit, type PressGroup } from './helpers'

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

const OVERLAYS = '/screens/overlays'
const SETTLE = 600
const ENGINE_TIMES = ['duration-hover-out', 'duration-follow', 'duration-choice', 'duration-scene', 'duration-press-in', 'duration-press-out'] as const
const MOTION_MODES = [
  { name: 'ordinary motion', times: [150, 100, 220, 250, 50, 224], prepare: async (): Promise<void> => undefined },
  {
    name: 'system reduced motion',
    times: [150, 0, 0, 250, 0, 0],
    prepare: (page: Page): Promise<void> => page.emulateMedia({ reducedMotion: 'reduce' }),
  },
  { name: 'motion off', times: [0, 0, 0, 0, 0, 0], prepare: (page: Page): Promise<void> => choose(page, 'motion', 'off') },
] as const

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function popupTimings(page: Page, selector: string): Promise<{ property: string; duration: number; easing: string; engine: { scene: number; ease: string } }[]> {
  return page.evaluate((query) => {
    const probe = document.createElement('div')
    document.body.append(probe)
    const first = (list: string): string => list.split(/,(?![^(]*\))/)[0]?.trim() ?? ''
    const milliseconds = (value: string): number => (value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000)
    const found = [...document.querySelectorAll(query)].map((element) => {
      const style = getComputedStyle(element)
      probe.style.transitionTimingFunction = style.getPropertyValue('--ts-motion-ease-emphasized').trim()
      return {
        property: first(style.transitionProperty),
        duration: milliseconds(first(style.transitionDuration)),
        easing: first(style.transitionTimingFunction),
        engine: { scene: milliseconds(style.getPropertyValue('--ts-motion-duration-scene').trim()), ease: getComputedStyle(probe).transitionTimingFunction },
      }
    })
    probe.remove()
    return found
  }, selector)
}

for (const mode of MOTION_MODES) {
  test.describe(`the time and the curve of every element with ${mode.name}`, () => {
    test('equal the engine output of the category of each element on the lab pages', async ({ page }) => {
      await visit(page, '/components')
      await mode.prepare(page)
      const found = await timingReport(page)
      expect(Object.values(found.engine)).toEqual([...mode.times])
      expect(Object.keys(found.engine)).toEqual([...ENGINE_TIMES])
      expect(found.problems).toEqual([])
      for (const category of ['plate exit', 'plate entry', 'plate flat', 'pill exit', 'pill entry', 'pill choice', 'spinner']) {
        expect(found.counts[category] ?? 0, category).toBeGreaterThan(0)
      }
      await visit(page, '/foundation')
      await mode.prepare(page)
      const foundation = await timingReport(page)
      expect(foundation.problems).toEqual([])
      expect(foundation.counts.row ?? 0).toBeGreaterThan(0)
      for (const path of LAB_PAGES) {
        await visit(page, path)
        await mode.prepare(page)
        const report = await pressReport(page)
        expect(report.problems, path).toEqual([])
      }
    })

    test('equal the scene time for a dialog and its backdrop, none for a menu and a popover and the hover exit time for a tooltip', async ({ page }) => {
      await visit(page, OVERLAYS)
      await mode.prepare(page)
      await region(page, 'Card').getByRole('button', { name: 'Chapter settings' }).click()
      const dialog = page.getByRole('dialog', { name: 'Chapter settings' })
      await expect(dialog).toBeVisible()
      await page.waitForTimeout(SETTLE)
      const scene = await popupTimings(page, '[data-variant="dialog"], [data-variant="backdrop"]')
      expect(scene.length).toBeGreaterThanOrEqual(2)
      for (const seen of scene) {
        expect(seen.duration).toBe(seen.engine.scene)
        if (seen.duration > 0) expect([seen.property, seen.easing]).toEqual(['opacity', seen.engine.ease])
      }
      expect(scene[0]?.engine.scene).toBe(mode.times[3])

      await dialog.getByRole('button', { name: 'Project', exact: true }).click()
      await expect(page.getByRole('menu')).toBeVisible()
      await page.waitForTimeout(SETTLE)
      expect((await popupTimings(page, '[role="menu"]')).map((seen) => seen.duration)).toEqual([0])
      await page.keyboard.press('Escape')
      await expect(page.getByRole('menu')).toHaveCount(0)

      await dialog.getByRole('button', { name: 'Style', exact: true }).click()
      const popover = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Bubble style' }) })
      await expect(popover).toBeVisible()
      await page.waitForTimeout(SETTLE)
      expect((await popupTimings(page, '[data-variant="popover"]')).map((seen) => seen.duration)).toEqual([0])
      await page.keyboard.press('Escape')
      await expect(popover).toHaveCount(0)
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)

      await region(page, 'Island').getByRole('button', { name: 'Select', exact: true }).hover()
      await expect(page.locator('[data-variant="tooltip"]')).toBeVisible()
      await page.waitForTimeout(SETTLE)
      const tooltip = await popupTimings(page, '[data-variant="tooltip"]')
      expect(tooltip.map((seen) => [seen.property, seen.duration])).toEqual([['opacity', mode.times[0]]])
    })

    test('fly the pills for the follow and the choice time and the tooltip for the follow time', async ({ page }) => {
      await page.addInitScript(recordAnimations)
      await visit(page, '/components')
      await mode.prepare(page)
      const range = page.getByRole('radiogroup', { name: 'Range (md)', exact: true })
      await range.getByRole('radio', { name: 'Week' }).click()
      await page.waitForTimeout(SETTLE)
      await clearRecorded(page)
      await range.getByRole('radio', { name: 'Day' }).hover()
      await range.getByRole('radio', { name: 'Month' }).hover()
      await range.getByRole('radio', { name: 'Month' }).click()
      await page.waitForTimeout(SETTLE)
      const pills = (await recorded(page)).filter((animation) => animation.recipe === 'indicator' && animation.duration !== null)
      const [, follow = 0, choice = 0] = mode.times
      if (follow === 0) {
        expect(pills).toEqual([])
      } else {
        const hovers = pills.filter((animation) => animation.easing !== 'linear')
        const choices = pills.filter((animation) => animation.easing === 'linear')
        expect(hovers.length).toBeGreaterThan(0)
        expect(choices.length).toBeGreaterThan(0)
        expect(hovers.map((animation) => animation.duration)).toEqual(hovers.map(() => follow))
        expect(new Set(hovers.map((animation) => animation.easing))).toEqual(new Set(['ease-out']))
        expect(choices.map((animation) => animation.duration)).toEqual(choices.map(() => choice))
      }

      await visit(page, OVERLAYS)
      await mode.prepare(page)
      const island = region(page, 'Island')
      await island.getByRole('button', { name: 'Select', exact: true }).hover()
      await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Select')
      await page.waitForTimeout(SETTLE)
      await clearRecorded(page)
      await island.getByRole('button', { name: 'Pan', exact: true }).hover()
      await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Pan')
      await page.waitForTimeout(SETTLE)
      const tooltips = (await recorded(page)).filter((animation) => animation.tooltip)
      const flown = new Set(tooltips.flatMap((animation) => animation.properties))
      if (follow === 0) {
        expect(tooltips).toEqual([])
      } else {
        expect(flown).toEqual(new Set(['translate', 'width', 'opacity', 'filter', 'scale']))
        const timings = await page.locator('[data-variant="tooltip"]').evaluate((popup) => {
          const probe = document.createElement('div')
          document.body.append(probe)
          probe.style.transitionTimingFunction = getComputedStyle(popup).getPropertyValue('--ts-motion-ease-hover').trim()
          const ease = getComputedStyle(probe).transitionTimingFunction
          probe.remove()
          const split = (list: string): string[] => list.split(/,(?![^(]*\))/).map((item) => item.trim())
          const style = getComputedStyle(popup)
          const label = getComputedStyle(popup.querySelector('[data-slot="label"]') as Element)
          const rows = (target: CSSStyleDeclaration): [string, number, string][] => {
            const [names, durations, curves] = [split(target.transitionProperty), split(target.transitionDuration), split(target.transitionTimingFunction)]
            return names.map((name, index): [string, number, string] => [name, Number.parseFloat(durations[index] ?? '') * (durations[index]?.endsWith('ms') ? 1 : 1000), curves[index] ?? ''])
          }
          return { ease, popup: rows(style), label: rows(label) }
        })
        const fade = timings.popup.find(([name]) => name === 'opacity')
        const moves = timings.popup.filter(([name]) => name !== 'opacity')
        expect([fade?.[0], fade?.[1]]).toEqual(['opacity', mode.times[0]])
        for (const [name, duration, curve] of [...moves, ...timings.label]) expect([name, duration, curve], name).toEqual([name, follow, timings.ease])
        expect(moves.map(([name]) => name).sort()).toEqual(['translate', 'width'])
        expect(timings.label.map(([name]) => name).sort()).toEqual(['filter', 'opacity', 'scale'])
      }
    })
  })
}

test.describe('the interaction of options, rows and a listbox trigger', () => {
  test('keeps the chosen option without a hover and gives an option and a menu row no press step', async ({ page }) => {
    await visit(page, '/components')
    const range = page.getByRole('radiogroup', { name: 'Range (md)', exact: true })
    const pill = range.locator('[data-recipe="indicator"][data-variant="hover"]')
    const chosen = range.getByRole('radio', { checked: true })
    const other = range.getByRole('radio', { checked: false }).first()
    const plate = (target: Locator): Promise<string> => target.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)
    await chosen.hover()
    await page.waitForTimeout(SETTLE)
    await expect(pill).toHaveAttribute('data-visible', 'false')
    expect(await plate(chosen)).toBe('rgba(0, 0, 0, 0)')
    await other.hover()
    await expect(pill).toHaveAttribute('data-visible', 'true')
    const hovered = await pill.locator('[data-slot="squash"]').evaluate((element) => getComputedStyle(element).opacity)
    await page.mouse.down()
    await page.waitForTimeout(SETTLE)
    await expect(other).not.toHaveAttribute('data-pressing')
    expect(await plate(other)).toBe('rgba(0, 0, 0, 0)')
    expect(await pill.locator('[data-slot="squash"]').evaluate((element) => getComputedStyle(element).opacity)).toBe(hovered)
    await page.mouse.up()

    await visit(page, OVERLAYS)
    await region(page, 'Island').getByRole('button', { name: 'Project', exact: true }).click()
    const menu = page.getByRole('menu')
    const open = row(menu, 'Open')
    await hover(page, open)
    const fill = (): Promise<string> => menu.locator('[data-recipe="indicator"] [data-slot="squash"]').evaluate((element) => getComputedStyle(element).opacity)
    const before = await fill()
    await page.mouse.down()
    await page.waitForTimeout(SETTLE)
    await expect(open).not.toHaveAttribute('data-pressing')
    expect(await fill()).toBe(before)
    await page.mouse.up()
  })

  test('scales nothing of a listbox trigger, neither the box nor a slot nor the plate, and gives it only the colour step of a press', async ({ page }) => {
    await visit(page, '/components')
    await page.evaluate(() => {
      const trigger = document.createElement('button')
      trigger.type = 'button'
      trigger.dataset.testid = 'listbox-trigger'
      trigger.dataset.recipe = 'control'
      trigger.dataset.variant = 'soft'
      trigger.setAttribute('aria-haspopup', 'listbox')
      trigger.innerHTML = '<span data-slot="label">Select</span>'
      document.querySelector('main')?.prepend(trigger)
    })
    const trigger = page.getByTestId('listbox-trigger')
    await trigger.scrollIntoViewIfNeeded()
    const report = await pressReport(page, ['flat'])
    expect(report.problems).toEqual([])
    expect(report.counts.flat ?? 0).toBeGreaterThan(0)
    const look = (): Promise<{ step: string; scales: string[]; layers: string[] }> =>
      trigger.evaluate((element) => {
        const parts = [element, element.querySelector('[data-slot="label"]')].filter((part) => part !== null)
        const styles = [...parts.map((part) => getComputedStyle(part)), getComputedStyle(element, '::before')]
        return {
          step: getComputedStyle(element).getPropertyValue('--_step').trim(),
          scales: styles.map((style) => style.scale),
          layers: styles.map((style) => style.willChange),
        }
      })
    const steps = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return { hover: style.getPropertyValue('--ts-state-hover').trim(), press: style.getPropertyValue('--ts-state-press').trim() }
    })
    const rest = await look()
    expect(rest.scales).toEqual(['none', 'none', 'none'])
    const target = await box(trigger)
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2)
    expect((await look()).step).toBe(steps.hover)
    await page.mouse.down()
    await expect(trigger).toHaveAttribute('data-pressing', '')
    await page.waitForTimeout(SETTLE)
    const pressed = await look()
    expect(pressed.step).toBe(steps.press)
    expect(pressed.scales).toEqual(['none', 'none', 'none'])
    expect(pressed.layers).toEqual(rest.layers)
    await page.mouse.up()
  })
})
