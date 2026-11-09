import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, visit } from './helpers'

const PAGE = '/components'
const TOLERANCE = 0.5
const MIN_LINES = 3
const MAX_ROWS = 4
const TYPED_LINES = 9
const TEXTAREA_NODES = 2

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Textarea', exact: true })
}

function hostOf(textarea: Locator): Locator {
  return textarea.locator('xpath=..')
}

type Metrics = { height: number; leading: number; padding: number; scroll: number; client: number }

function metricsOf(textarea: Locator): Promise<Metrics> {
  return textarea.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      height: element.getBoundingClientRect().height,
      leading: Number.parseFloat(style.lineHeight),
      padding: Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
      scroll: element.scrollHeight,
      client: element.clientHeight,
    }
  })
}

async function typeLines(page: Page, textarea: Locator, count: number): Promise<void> {
  await textarea.click()
  await page.keyboard.press('Control+End')
  for (let line = 0; line < count; line += 1) await page.keyboard.press('Enter')
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('starts at three lines and grows with every new line without a limit', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Notes', exact: true })
    const empty = await metricsOf(textarea)
    expect(Math.abs(empty.height - empty.padding - MIN_LINES * empty.leading)).toBeLessThanOrEqual(TOLERANCE)
    await typeLines(page, textarea, TYPED_LINES)
    const full = await metricsOf(textarea)
    expect(Math.abs(full.height - full.padding - (TYPED_LINES + 1) * full.leading)).toBeLessThanOrEqual(TOLERANCE)
    expect(full.scroll).toBeLessThanOrEqual(full.client)
  })

  test('grows up to maxRows lines and then scrolls', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Summary', exact: true })
    await typeLines(page, textarea, TYPED_LINES)
    const full = await metricsOf(textarea)
    expect(Math.abs(full.height - full.padding - MAX_ROWS * full.leading)).toBeLessThanOrEqual(TOLERANCE)
    expect(full.scroll).toBeGreaterThan(full.client)
  })

  test('keeps the width of the field while a long line is typed', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Notes', exact: true })
    const before = await box(hostOf(textarea))
    await textarea.click()
    await page.keyboard.type('A long line that is much longer than the field is wide, so it has to wrap inside the field.')
    const after = await box(hostOf(textarea))
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(TOLERANCE)
    expect(after.height).toBeGreaterThan(before.height - TOLERANCE)
  })

  test('takes the label of its field and the focus from a click on that label', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Translator notes', exact: true })
    await expect(textarea).toHaveAccessibleDescription('Sent with every page of the chapter.')
    await section(page).getByText('Translator notes', { exact: true }).click()
    await expect(textarea).toBeFocused()
  })

  test('shows the focus ring after a click with the mouse', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Notes', exact: true })
    await textarea.click()
    const outline = await hostOf(textarea).evaluate((element) => ({ style: getComputedStyle(element).outlineStyle, width: Number.parseFloat(getComputedStyle(element).outlineWidth) }))
    expect(outline.style).toBe('solid')
    expect(outline.width).toBeGreaterThan(0)
  })

  test('is disabled and dimmed by a disabled field and does not resize by hand', async ({ page }) => {
    const textarea = section(page).getByRole('textbox', { name: 'Locked notes', exact: true })
    await expect(textarea).toBeDisabled()
    expect(Number.parseFloat(await hostOf(textarea).evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(1)
    expect(await textarea.evaluate((element) => getComputedStyle(element).resize)).toBe('none')
  })

  test('builds a textarea of two nodes', async ({ page }) => {
    const nodes = await hostOf(section(page).getByRole('textbox', { name: 'Notes', exact: true })).evaluate((element) => element.querySelectorAll('*').length + 1)
    expect(nodes).toBe(TEXTAREA_NODES)
  })
})
