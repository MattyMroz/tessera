import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, edgeContext, raisedShadow, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const NARROW = 320

function card(page: Page, testId: string): Locator {
  return page.getByTestId(testId)
}

function edgeCard(page: Page, frame: 'narrow' | 'full'): Locator {
  return page.locator('[data-edge-component="card"]').getByTestId(frame).locator('[data-component="card"]').first()
}

async function actionBeside(header: Locator): Promise<boolean> {
  const [title, action] = await Promise.all([box(header.locator('[data-slot="title"]')), box(header.locator('[data-slot="action"]'))])
  return action.x >= title.x + title.width && action.y < title.y + title.height
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('raises a card by default with the fill and shadow of its level and no border', async ({ page }) => {
    const shadow = await raisedShadow(page)
    const look = await card(page, 'invite-card').evaluate((element) => ({
      level: element.getAttribute('data-level'),
      shadow: getComputedStyle(element).boxShadow,
      borders: ['Top', 'Right', 'Bottom', 'Left'].map((side) => getComputedStyle(element).getPropertyValue(`border-${side.toLowerCase()}-color`)),
    }))
    expect(look).toEqual({ level: 'raised', shadow, borders: [TRANSPARENT, TRANSPARENT, TRANSPARENT, TRANSPARENT] })
    expect(await card(page, 'export-card').getAttribute('data-level')).toBeNull()
  })

  test('renders a card with href as one link named by its content, with nothing interactive inside', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Chapter 12 24 pages, translated', exact: true })
    await expect(link).toHaveAttribute('data-component', 'card')
    expect(await link.evaluate((element) => element.querySelectorAll('a, button, input, select, textarea, [tabindex]').length)).toBe(0)
  })

  test('keeps the shadow of the level under the focus ring of a card link', async ({ page }) => {
    const link = card(page, 'link-card')
    const shadow = await raisedShadow(page)
    await page.keyboard.press('Tab')
    await link.focus()
    await expect(link).toBeFocused()
    await expect(page.locator('html')).toHaveAttribute('data-input', 'keyboard')
    const look = await link.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, shadow: getComputedStyle(element).boxShadow }))
    expect(look.outline).toBe('solid')
    expect(look.shadow.endsWith(shadow)).toBe(true)
  })
})

test.describe('on the edges screen', () => {
  test('stacks the action of the header under the title in a 320 px card and keeps it beside the title in a wide card', async ({ page }) => {
    await visit(page, EDGES)
    const narrow = edgeCard(page, 'narrow')
    expect((await box(narrow)).width).toBeLessThanOrEqual(NARROW)
    expect(await actionBeside(narrow.locator('[data-slot="header"]'))).toBe(false)
    expect(await actionBeside(edgeCard(page, 'full').locator('[data-slot="header"]'))).toBe(true)
  })
})

test.describe('in forced colors', () => {
  test.use(edgeContext({ media: 'forced colors' }))

  test('outlines a card whose border is transparent in the other modes', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await visit(page, PAGE)
    const border = await card(page, 'invite-card').evaluate((element) => getComputedStyle(element).borderTopColor)
    expect(border).not.toBe(TRANSPARENT)
  })
})
