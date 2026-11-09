import { expect, test, type Page } from '@playwright/test'
import { contrast, hydrated, MIN_CONTRAST, srgbOf } from './helpers'

const FOUNDATION = '/foundation'
const CAP_TOLERANCE = 1
const INHERITING_VARIANTS = ['label', 'kbd'] as const

for (const mode of ['light', 'dark'] as const) {
  test.describe(`in the ${mode} mode`, () => {
    test.use({ colorScheme: mode })

    test('writes a label and a key of a text in a tooltip in the colour of the tooltip', async ({ page }) => {
      await page.goto('/components')
      await hydrated(page)
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode)
      await page.getByRole('button', { name: 'Print', exact: true }).hover()
      const tooltip = page.locator('[data-variant="tooltip"]')
      await expect(tooltip).toHaveText('Print Ctrl+P')
      const background = await srgbOf(page, await tooltip.evaluate((element) => getComputedStyle(element).backgroundColor))
      for (const variant of INHERITING_VARIANTS) {
        const color = await tooltip.locator(`[data-recipe="text"][data-variant="${variant}"]`).evaluate((element) => getComputedStyle(element).color)
        expect(contrast(await srgbOf(page, color), background), variant).toBeGreaterThanOrEqual(MIN_CONTRAST)
      }
    })
  })
}

async function open(page: Page): Promise<void> {
  await page.goto(FOUNDATION)
  await hydrated(page)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

function capAndHeight(page: Page, testId: string, textBox: string): Promise<{ cap: number; height: number }> {
  return page.getByTestId(testId).evaluate((element, trim) => {
    if (!(element instanceof HTMLElement)) throw new Error('not an element')
    element.textContent = 'Hx'
    element.style.textBox = trim
    const context = document.createElement('canvas').getContext('2d')
    if (!context) throw new Error('no canvas')
    context.font = getComputedStyle(element).font
    return { cap: context.measureText('H').actualBoundingBoxAscent, height: element.getBoundingClientRect().height }
  }, textBox)
}

function width(page: Page, testId: string): Promise<number> {
  return page.getByTestId(testId).evaluate((element) => element.getBoundingClientRect().width)
}

test('trims a title to the height of its capitals', async ({ page }) => {
  await open(page)
  const trimmed = await capAndHeight(page, 'text-title', '')
  expect(Math.abs(trimmed.height - trimmed.cap)).toBeLessThanOrEqual(CAP_TOLERANCE)
  const plain = await capAndHeight(page, 'text-title', 'normal')
  expect(plain.height).toBeGreaterThan(plain.cap + CAP_TOLERANCE)
})

test('gives the digits of a label equal widths only with data-numeric', async ({ page }) => {
  await open(page)
  expect(await width(page, 'numeric-111')).toBeCloseTo(await width(page, 'numeric-888'), 1)
  expect(Math.abs((await width(page, 'proportional-111')) - (await width(page, 'proportional-888')))).toBeGreaterThan(CAP_TOLERANCE)
})

test('renders a heading of level 2 and 3 as its h element and a text as the element it asks for', async ({ page }) => {
  await page.goto('/components')
  const section = page.getByRole('region', { name: 'Text', exact: true })
  const heading = section.getByTestId('heading-level-2')
  expect(await heading.evaluate((element) => element.localName)).toBe('h2')
  await expect(heading).toHaveAttribute('data-variant', 'display')
  await expect(section.getByRole('heading', { name: 'Bubble style', level: 3 })).toHaveAttribute('data-variant', 'title')
  const label = section.getByText('Chapter name', { exact: true })
  expect(await label.evaluate((element) => element.localName)).toBe('label')
  await expect(section.getByRole('textbox', { name: 'Chapter name' })).toBeVisible()
  expect(await section.getByText('The name is already taken.').evaluate((element) => element.localName)).toBe('span')
})

test('draws every text variant from the type and state engines', async ({ page }) => {
  await open(page)
  const looks = await page.locator('[data-testid^="text-"]').evaluateAll((elements) =>
    Object.fromEntries(
      elements.map((element) => {
        const style = getComputedStyle(element)
        return [element.getAttribute('data-testid'), { size: style.fontSize, weight: style.fontWeight, color: style.color }]
      }),
    ),
  )
  const output = (name: string): Promise<string> =>
    page.evaluate((property) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${property})`
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }, name)
  expect(looks['text-display']?.size).toBe('28px')
  expect(looks['text-title']?.size).toBe('15px')
  expect(looks['text-description']?.size).toBe('12px')
  expect(looks['text-description']?.color).toBe(await output('--ts-color-secondary-label'))
  expect(looks['text-error']?.color).toBe(await output('--ts-state-invalid-color'))
  expect(looks['text-title']?.weight).toBe('600')
  expect(looks['text-label']?.weight).toBe('500')
})
