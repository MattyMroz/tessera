import { expect, test, type Locator, type Page } from '@playwright/test'
import { alphaOf, colorOf, contrast, edgeContext, hover, MIN_CONTRAST, srgbOf, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const TOUCH_TARGET = 24
const SM_HEIGHT = 20

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Badge', exact: true })
}

function badge(scope: Locator, text: string): Locator {
  return scope.locator('span[data-recipe="control"]').filter({ hasText: text }).first()
}

function sizeOf(locator: Locator): Promise<{ width: number; height: number }> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  })
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('fills the status dot with the color of the tone and writes the ghost status on no background', async ({ page }) => {
    const running = badge(section(page), 'Running')
    const look = await running.evaluate((element) => {
      const dot = element.querySelector('[data-slot="icon"][data-dot] > svg')
      return {
        background: getComputedStyle(element, '::before').backgroundColor,
        color: getComputedStyle(element).color,
        fill: dot ? getComputedStyle(dot).fill : null,
      }
    })
    expect(alphaOf(look.background)).toBe(0)
    expect(look.color).toBe(await colorOf(page, 'var(--ts-color-success)'))
    expect(look.fill).toBe(look.color)
  })

  test('makes a count of one digit a circle, wider counts a capsule, with equal digit widths', async ({ page }) => {
    const scope = section(page)
    const one = await sizeOf(badge(scope, '3'))
    expect(Math.abs(one.width - one.height)).toBeLessThanOrEqual(TOLERANCE)
    expect((await sizeOf(badge(scope, '128'))).width).toBeGreaterThan(one.width + TOLERANCE)
    const digits = await scope.locator('span[data-recipe="control"][data-numeric]').first().evaluate((element) => {
      const label = element.querySelector('[data-slot="label"]')
      if (!(label instanceof HTMLElement)) throw new Error('no label')
      const widthOf = (text: string): number => {
        label.textContent = text
        return label.getBoundingClientRect().width
      }
      return { ones: widthOf('111'), eights: widthOf('888'), figures: getComputedStyle(element).fontVariantNumeric }
    })
    expect(digits.figures).toBe('tabular-nums')
    expect(Math.abs(digits.ones - digits.eights)).toBeLessThanOrEqual(TOLERANCE)
  })

  test('stays static: no hover step, the default cursor and no Tab stop', async ({ page }) => {
    const count = badge(section(page), '12')
    const before = await count.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)
    await hover(page, count)
    expect(await count.evaluate((element) => ({ background: getComputedStyle(element, '::before').backgroundColor, cursor: getComputedStyle(element).cursor, tab: element.tabIndex }))).toEqual({
      background: before,
      cursor: 'default',
      tab: -1,
    })
  })
})

for (const mode of ['light', 'dark'] as const) {
  test.describe(`in the ${mode} mode`, () => {
    test.use({ colorScheme: mode })

    test('keeps a neutral badge in a tooltip readable on the dark tooltip', async ({ page }) => {
      await visit(page, PAGE)
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode)
      await section(page).getByRole('button', { name: 'Inbox', exact: true }).hover()
      const tooltip = page.locator('[data-variant="tooltip"]')
      await expect(tooltip).toHaveText('Inbox 2')
      const background = await srgbOf(page, await tooltip.evaluate((element) => getComputedStyle(element).backgroundColor))
      const ink = await srgbOf(page, await badge(tooltip, '2').evaluate((element) => getComputedStyle(element).color))
      expect(ink).toBe(await srgbOf(page, await tooltip.evaluate((element) => getComputedStyle(element).color)))
      expect(contrast(ink, background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })

    test('keeps a neutral badge in the trail of a menu row readable on the menu', async ({ page }) => {
      await visit(page, PAGE)
      await section(page).getByRole('button', { name: 'Folders', exact: true }).click()
      const menu = page.getByRole('menu')
      const trail = menu.getByRole('menuitem', { name: /^Drafts/ }).locator('[data-slot="trail"]')
      const background = await srgbOf(page, await menu.evaluate((element) => getComputedStyle(element).backgroundColor))
      const ink = await srgbOf(page, await badge(trail, '7').evaluate((element) => getComputedStyle(element).color))
      expect(contrast(ink, background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })
  })
}

test.describe('with a touch screen', () => {
  test.use(edgeContext({ media: 'touch' }))

  test('keeps a badge at the height of its step while the button beside it grows to 24 px', async ({ page }) => {
    await visit(page, EDGES)
    const edge = page.locator('[data-edge-component="badge"]').getByTestId('full')
    const [count, button] = await Promise.all([sizeOf(badge(edge, '1284')), sizeOf(edge.getByRole('button', { name: 'Next to a button', exact: true }))])
    expect(Math.abs(count.height - SM_HEIGHT)).toBeLessThanOrEqual(TOLERANCE)
    expect(button.height).toBeGreaterThanOrEqual(TOUCH_TARGET - TOLERANCE)
  })
})
