import type { Choices } from '@mattymroz/tessera/lib/theme'
import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  choose,
  clearRecorded,
  clearRenders,
  failures,
  hover,
  installCommitProbe,
  motionWork,
  mountStress,
  offCompositor,
  recordAnimations,
  recorded,
  row,
  settle,
  STRESS,
  visit,
} from './helpers'

const TYPICAL_CONTROL_NODES = 3
const MIN_SCENE_CONTROLS = 1000
const MAX_COMMITS = 1
const POPUP = '[role="menu"], [role="dialog"], [data-recipe="surface"]:is([data-level="overlay"], [data-level="modal"], [data-variant="backdrop"])'
const THEME_CHANGES: readonly { readonly path: string; readonly accent: Choices['accent']; readonly corners: Choices['corners'] }[] = [
  { path: '/screens/overlays', accent: 'violet', corners: 'sm' },
  { path: '/screens/edges', accent: 'teal', corners: 'lg' },
  { path: STRESS, accent: 'rose', corners: 'none' },
]
const PROBE_STYLE = '@keyframes budget-probe { from { width: 1px } to { width: 200px } } [data-budget-probe] { display: block; height: 1px; animation: budget-probe 400ms linear }'

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function option(page: Page, group: string, name: string): Locator {
  return page.getByRole('radiogroup', { name: group, exact: true }).getByRole('radio', { name, exact: true })
}

type Scene = { readonly name: string; readonly before: (page: Page) => Promise<unknown>; readonly motion: (page: Page) => Promise<unknown>; readonly after: (page: Page) => Promise<unknown> }

const NOTHING = async (): Promise<void> => undefined

const SCENES: readonly Scene[] = [
  {
    name: 'the hover pill of a group',
    before: (page) => option(page, 'Raised group', '2').hover(),
    motion: (page) => option(page, 'Raised group', '12').hover(),
    after: NOTHING,
  },
  {
    name: 'the choice pill of a group',
    before: (page) => option(page, 'Active group', '3').hover(),
    motion: (page) => option(page, 'Active group', '3').click(),
    after: NOTHING,
  },
  {
    name: 'the pill of a menu',
    before: async (page) => {
      await page.getByRole('button', { name: 'Menu 2', exact: true }).click()
      await hover(page, row(page.getByRole('menu'), 'Open'))
    },
    motion: (page) => row(page.getByRole('menu'), 'Delete').hover(),
    after: async (page) => {
      await page.keyboard.press('Escape')
      await expect(page.getByRole('menu')).toHaveCount(0)
    },
  },
  {
    name: 'the flight of a tooltip',
    before: async (page) => {
      await region(page, 'List').getByRole('button', { name: 'Item 1', exact: true }).hover()
      await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Tip 1')
    },
    motion: (page) => region(page, 'List').getByRole('button', { name: 'Item 2', exact: true }).hover(),
    after: (page) => page.mouse.move(0, 0),
  },
  {
    name: 'a dialog opening',
    before: NOTHING,
    motion: (page) => page.getByRole('button', { name: 'Dialog', exact: true }).click(),
    after: NOTHING,
  },
  {
    name: 'a dialog closing',
    before: (page) => expect(page.getByRole('dialog')).toBeVisible(),
    motion: async (page) => {
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveCount(0)
    },
    after: NOTHING,
  },
]

test.describe('on the stress scene', () => {
  test.describe.configure({ mode: 'serial' })
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const { baseURL } = test.info().project.use
    page = await browser.newPage(baseURL === undefined ? {} : { baseURL })
    await page.addInitScript(recordAnimations)
    await mountStress(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  for (const scene of SCENES) {
    test(`moves ${scene.name} only on the compositor, with no layout and no paint between its first and last frame`, async () => {
      await scene.before(page)
      await clearRecorded(page)
      const { animations, work, events } = await motionWork(page, () => scene.motion(page))
      await scene.after(page)
      expect(animations).toBeGreaterThan(0)
      expect(offCompositor(await recorded(page))).toEqual([])
      expect(failures(events)).toEqual([])
      expect(work).toEqual([])
    })
  }

  test('catches a layout started inside a moving subtree', async () => {
    await option(page, 'Raised group', '2').hover()
    const { work } = await motionWork(page, async () => {
      await page.evaluate((css) => {
        const style = document.createElement('style')
        style.dataset.budgetProbe = 'style'
        style.textContent = css
        document.head.append(style)
        const probe = document.createElement('span')
        probe.dataset.budgetProbe = ''
        document.querySelector('[aria-label="Raised group"]')?.append(probe)
      }, PROBE_STYLE)
      await option(page, 'Raised group', '12').hover()
    })
    await page.evaluate(() => {
      for (const probe of document.querySelectorAll('[data-budget-probe]')) probe.remove()
    })
    expect(work).toContain('Layout')
  })

  test('keeps every control of the scene within its DOM nodes', async () => {
    const controls = await page.evaluate((typical) => {
      const count = (element: Element): number => {
        if (element.matches('[data-slot="icon"]')) return 1
        return [...element.children].filter((child) => !child.matches('[data-recipe="control"]')).reduce((total, child) => total + count(child), 1)
      }
      return [...document.querySelectorAll('main [data-recipe="control"]')].map((control) => ({
        name: control.getAttribute('aria-label') ?? control.textContent ?? '',
        nodes: count(control),
        limit: typical + Math.max(0, control.querySelectorAll(':scope > [data-slot="icon"]').length - 1),
      }))
    }, TYPICAL_CONTROL_NODES)
    expect(controls.length).toBeGreaterThan(MIN_SCENE_CONTROLS)
    expect(controls.filter((control) => control.nodes > control.limit)).toEqual([])
  })

  test('leaves no node of a menu, a popover, a dialog or a tooltip after it closes', async () => {
    const body = (): Promise<number> => page.evaluate(() => document.body.childElementCount)
    const before = await body()
    await page.getByRole('button', { name: 'Menu 1', exact: true }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Popover 1', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Dialog', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await region(page, 'List').getByRole('button', { name: 'Item 3', exact: true }).hover()
    await expect(page.locator('[data-variant="tooltip"]')).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(page.locator(POPUP)).toHaveCount(0)
    await expect(page.locator('[data-variant="tooltip"]')).toHaveCount(0)
    expect(await body()).toBe(before)
  })
})

test.describe('with the commit probe', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(installCommitProbe)
  })

  test('commits at most once for a hover or a press of a button and of the chosen option and for a change of the choice', async ({ page }) => {
    await mountStress(page)
    const button = region(page, 'Buttons').getByRole('button', { name: 'Button 7', exact: true })
    const choice = option(page, 'Segment 2', '1')
    const next = option(page, 'Segment 2', '2')
    const commits = async (action: () => Promise<unknown>): Promise<number> => {
      await page.mouse.move(0, 0)
      await settle(page)
      await clearRenders(page)
      await action()
      await settle(page)
      return page.evaluate(() => window.labCommits ?? 0)
    }
    expect(await commits(() => button.hover())).toBeLessThanOrEqual(MAX_COMMITS)
    expect(await commits(() => button.click())).toBeLessThanOrEqual(MAX_COMMITS)
    expect(await commits(() => choice.hover())).toBeLessThanOrEqual(MAX_COMMITS)
    expect(await commits(() => choice.click())).toBeLessThanOrEqual(MAX_COMMITS)
    await expect(choice).toHaveAttribute('aria-checked', 'true')
    expect(await commits(() => next.click())).toBeLessThanOrEqual(MAX_COMMITS)
    await expect(next).toHaveAttribute('aria-checked', 'true')
    await expect(choice).toHaveAttribute('aria-checked', 'false')
  })

  test('changes a theme axis without re-rendering any component outside the panel', async ({ page }) => {
    for (const { path, accent, corners } of THEME_CHANGES) {
      await (path === STRESS ? mountStress(page) : visit(page, path))
      await expect.poll(() => page.evaluate(() => window.labRenders?.some((render) => render.area === 'page') ?? false), path).toBe(true)
      await clearRenders(page)
      await choose(page, 'accent', accent)
      await choose(page, 'corners', corners)
      const renders = await page.evaluate(() => window.labRenders?.map((render) => render.area) ?? [])
      expect(renders, path).toContain('panel')
      expect(renders.filter((render) => render !== 'panel'), path).toEqual([])
    }
  })
})
