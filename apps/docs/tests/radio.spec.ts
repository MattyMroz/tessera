import { expect, test, type Locator, type Page } from '@playwright/test'
import { settle, visit } from './helpers'

const CENTRE_TOLERANCE = 0.01

function group(page: Page, size: string): Locator {
  return page.getByTestId(`radio-group-${size}`)
}

test.beforeEach(async ({ page }) => {
  await visit(page, '/components')
})

test('shows the dot only in the chosen circle, in its centre and in one proportion at every size', async ({ page }) => {
  await settle(page)
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
    const dots = await group(page, size)
      .getByRole('radio')
      .evaluateAll((radios) => radios.map((radio) => getComputedStyle(radio.querySelector('[data-slot="dot"]') as Element).scale))
    const proportion = await group(page, size).evaluate((element) => getComputedStyle(element).getPropertyValue('--ts-size-dot-scale').trim())
    expect(dots.map(Number), size).toEqual([0, Number(proportion), 0, 0])
    const seen = await group(page, size)
      .getByRole('radio', { checked: true })
      .evaluate((radio) => {
        const outer = radio.getBoundingClientRect()
        const dot = (radio.querySelector('[data-slot="dot"]') as Element).getBoundingClientRect()
        return { dx: dot.left + dot.width / 2 - (outer.left + outer.width / 2), dy: dot.top + dot.height / 2 - (outer.top + outer.height / 2), ratio: dot.width / outer.width }
      })
    expect(Math.abs(seen.dx), `${size} centred across`).toBeLessThanOrEqual(CENTRE_TOLERANCE)
    expect(Math.abs(seen.dy), `${size} centred down`).toBeLessThanOrEqual(CENTRE_TOLERANCE)
    expect(Math.abs(seen.ratio - Number(proportion)), `${size} proportion`).toBeLessThanOrEqual(CENTRE_TOLERANCE)
  }
})

test('moves the choice with the arrows and from a click on a label, never moving the dot between options', async ({ page }) => {
  const options = group(page, 'lg').getByRole('radio')
  await options.nth(1).focus()
  await page.keyboard.press('ArrowDown')
  await expect(options.nth(2)).toHaveAttribute('aria-checked', 'true')
  await group(page, 'lg').getByText('Fast', { exact: true }).click()
  await expect(options.nth(0)).toHaveAttribute('aria-checked', 'true')
  expect(await options.nth(2).evaluate((radio) => getComputedStyle(radio.querySelector('[data-slot="dot"]') as Element).scale)).toBe('0')
})

test('presses the circle like a button and grows the dot on the elastic curve of the engine', async ({ page }) => {
  const target = group(page, 'lg').getByRole('radio').nth(2)
  await target.scrollIntoViewIfNeeded()
  const rect = await target.boundingBox()
  if (!rect) throw new Error('no radio')
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await page.mouse.down()
  await expect(target).toHaveAttribute('data-pressing', '')
  await page.mouse.up()
  const growth = await target.evaluate((radio) => {
    const dot = radio.querySelector('[data-slot="dot"]') as Element
    const probe = document.createElement('span')
    probe.style.transitionTimingFunction = 'var(--ts-motion-ease-elastic)'
    radio.append(probe)
    const engine = getComputedStyle(probe).transitionTimingFunction
    probe.remove()
    return { easing: getComputedStyle(dot).transitionTimingFunction, engine }
  })
  expect(growth.easing).toBe(growth.engine)
})
