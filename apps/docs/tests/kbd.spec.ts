import { expect, test, type Locator, type Page } from '@playwright/test'
import { contrast, edgeContext, hover, MIN_CONTRAST, raisedShadow, srgbOf, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const TOUCH_TARGET = 24
const XS_HEIGHT = 16

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Kbd', exact: true })
}

function keycaps(scope: Locator): Locator {
  return scope.locator('kbd[data-recipe="control"]')
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('renders one keycap for one key and one keycap per key with a plus between them for a combination', async ({ page }) => {
    const single = section(page).getByText('Press').locator('kbd')
    await expect(single).toHaveCount(1)
    expect(await single.evaluate((element) => ({ recipe: element.dataset.recipe, variant: element.dataset.variant, size: element.dataset.size, keys: element.querySelectorAll('kbd').length }))).toEqual({
      recipe: 'control',
      variant: 'raised',
      size: 'xs',
      keys: 0,
    })
    const combination = section(page).getByText('Save as').locator(':scope > kbd')
    expect(await combination.evaluate((element) => ({ recipe: element.dataset.recipe, variant: element.dataset.variant, text: element.textContent }))).toEqual({
      recipe: 'text',
      variant: 'kbd',
      text: 'Ctrl+Shift+S',
    })
    await expect(keycaps(combination)).toHaveText(['Ctrl', 'Shift', 'S'])
  })

  test('writes the keycap in the mono font with tabular figures and makes one letter a square', async ({ page }) => {
    const single = section(page).getByText('Press').locator('kbd')
    const look = await single.evaluate((element) => {
      const probe = document.createElement('span')
      probe.style.fontFamily = 'var(--ts-type-family-mono)'
      document.body.append(probe)
      const mono = getComputedStyle(probe).fontFamily
      probe.remove()
      const rect = element.getBoundingClientRect()
      return { font: getComputedStyle(element).fontFamily, mono, figures: getComputedStyle(element).fontVariantNumeric, width: rect.width, height: rect.height }
    })
    expect(look.font).toBe(look.mono)
    expect(look.figures).toBe('tabular-nums')
    expect(Math.abs(look.width - look.height)).toBeLessThanOrEqual(TOLERANCE)
  })

  test('stays static: no hover step, the default cursor and no Tab stop', async ({ page }) => {
    const single = section(page).getByText('Press').locator('kbd')
    const before = await single.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)
    await hover(page, single)
    expect(await single.evaluate((element) => ({ background: getComputedStyle(element, '::before').backgroundColor, cursor: getComputedStyle(element).cursor, tab: element.tabIndex }))).toEqual({
      background: before,
      cursor: 'default',
      tab: -1,
    })
  })
})

for (const mode of ['light', 'dark'] as const) {
  test.describe(`in the ${mode} mode`, () => {
    test.use({ colorScheme: mode })

    test('raises the keycaps in a tooltip on their own background in the label color', async ({ page }) => {
      await visit(page, PAGE)
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode)
      await section(page).getByRole('button', { name: 'Save', exact: true }).hover()
      const tooltip = page.locator('[data-variant="tooltip"]')
      await expect(tooltip).toHaveText('Save Ctrl+S')
      const [raised, label, shadow] = await Promise.all([srgbOf(page, 'var(--ts-depth-raised-bg)'), srgbOf(page, 'var(--ts-color-label)'), raisedShadow(page)])
      const caps = keycaps(tooltip)
      await expect(caps).toHaveCount(2)
      const looks = await caps.evaluateAll((elements) =>
        elements.map((element) => {
          const plate = getComputedStyle(element, '::before')
          return { background: plate.backgroundColor, ink: getComputedStyle(element).color, shadow: plate.boxShadow }
        }),
      )
      for (const look of looks) {
        const [background, ink] = await Promise.all([srgbOf(page, look.background), srgbOf(page, look.ink)])
        expect({ background, ink, shadow: look.shadow }).toEqual({ background: raised, ink: label, shadow })
        expect(contrast(ink, background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
      }
    })

    test('keeps the keycaps in the trail of a menu row readable on the menu', async ({ page }) => {
      await visit(page, PAGE)
      await section(page).getByRole('button', { name: 'Edit', exact: true }).click()
      const menu = page.getByRole('menu')
      const trail = menu.getByRole('menuitem', { name: /^Undo/ }).locator('[data-slot="trail"]')
      const background = await srgbOf(page, await menu.evaluate((element) => getComputedStyle(element).backgroundColor))
      const inks = await keycaps(trail).evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color))
      expect(inks).toHaveLength(2)
      for (const ink of inks) expect(contrast(await srgbOf(page, ink), background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })
  })
}

test.describe('with a touch screen', () => {
  test.use(edgeContext({ media: 'touch' }))

  test('keeps a keycap at the height of its step while the button beside it grows to 24 px', async ({ page }) => {
    await visit(page, EDGES)
    const edge = page.locator('[data-edge-component="kbd"]').getByTestId('full')
    const [keycap, button] = await Promise.all([keycaps(edge).first().boundingBox(), edge.getByRole('button', { name: 'Find', exact: true }).boundingBox()])
    expect(Math.abs((keycap?.height ?? 0) - XS_HEIGHT)).toBeLessThanOrEqual(TOLERANCE)
    expect(button?.height ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET - TOLERANCE)
  })
})
