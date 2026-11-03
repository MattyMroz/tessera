import { expect, test, type Locator, type Page } from '@playwright/test'
import { hover, settle, visit } from './helpers'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const TOLERANCE = 0.5
const BOX_RADIUS_CAP = 0.35
const PIXEL_ROUNDING = 0.01

function box(page: Page, name: string): Locator {
  return page.getByRole('region', { name: 'Checkbox', exact: true }).getByRole('checkbox', { name, exact: true })
}

function lengthOf(target: Locator, output: string): Promise<number> {
  return target.evaluate((element, name) => {
    const probe = document.createElement('span')
    probe.style.position = 'absolute'
    probe.style.width = `var(${name})`
    element.append(probe)
    const width = probe.getBoundingClientRect().width
    probe.remove()
    return width
  }, output)
}

function offsetsOf(target: Locator): Promise<string[]> {
  return target.evaluate((element) => [...element.querySelectorAll('[data-slot="mark"] > svg')].map((glyph) => getComputedStyle(glyph).strokeDashoffset))
}

test.beforeEach(async ({ page }) => {
  await visit(page, '/components')
})

test('sizes the box and its mark from the size engine and caps the radius at 35 % of the box', async ({ page }) => {
  for (const size of SIZES) {
    const target = box(page, `${size} on`)
    const rect = await target.boundingBox()
    if (!rect) throw new Error('no box')
    const boxSize = await lengthOf(target, '--ts-size-box')
    const glyph = await target.locator('svg').first().boundingBox()
    const radius = await target.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius))
    expect(Math.abs(rect.width - boxSize), `${size} box`).toBeLessThanOrEqual(TOLERANCE)
    if (!glyph) throw new Error('no mark')
    expect(Math.abs(glyph.x + glyph.width / 2 - (rect.x + rect.width / 2)), `${size} mark centred across`).toBeLessThanOrEqual(PIXEL_ROUNDING)
    expect(Math.abs(glyph.y + glyph.height / 2 - (rect.y + rect.height / 2)), `${size} mark centred down`).toBeLessThanOrEqual(PIXEL_ROUNDING)
    expect(Math.abs(glyph.width - rect.width), `${size} mark spans the box`).toBeLessThanOrEqual(PIXEL_ROUNDING)
    expect(radius, `${size} radius`).toBeLessThanOrEqual(boxSize * BOX_RADIUS_CAP + TOLERANCE)
  }
})

test('draws the check of a checked box and the minus of a mixed box and hides both on an empty box', async ({ page }) => {
  await settle(page)
  expect(await offsetsOf(box(page, 'lg off'))).toEqual(['1px', '1px'])
  expect(await offsetsOf(box(page, 'lg on'))).toEqual(['0px', '1px'])
  expect(await offsetsOf(box(page, 'lg mixed'))).toEqual(['1px', '0px'])
})

test('presses the whole box like a button and toggles it from a click on its label', async ({ page }) => {
  const group = page.getByTestId('checkbox-group-lg')
  const target = group.getByRole('checkbox', { name: 'Page 2', exact: true })
  await target.scrollIntoViewIfNeeded()
  const label = await group.getByText('Page 2', { exact: true }).boundingBox()
  if (!label) throw new Error('no label')
  await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2)
  await page.mouse.down()
  await expect(target).toHaveAttribute('data-pressing', '')
  await page.mouse.up()
  await expect(target).toHaveAttribute('aria-checked', 'true')
  const pressed = await target.evaluate((element) => getComputedStyle(element).getPropertyValue('--ts-motion-press-scale').trim())
  expect(Number(pressed)).toBeLessThan(1)
})

test('mixes the parent box of a group and checks every box from it', async ({ page }) => {
  const group = page.getByTestId('checkbox-group-md')
  const parent = group.getByRole('checkbox', { name: 'Select all', exact: true })
  await expect(parent).toHaveAttribute('aria-checked', 'mixed')
  await parent.click()
  await expect(group.getByRole('checkbox', { checked: true })).toHaveCount(4)
})

test('steps the plate on hover and fades it out in the hover-out time of the engine', async ({ page }) => {
  const target = box(page, 'lg on')
  await target.scrollIntoViewIfNeeded()
  const plate = (): Promise<string> => target.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)
  const rest = await plate()
  await hover(page, target)
  expect(await plate()).not.toBe(rest)
  await page.mouse.move(0, 0)
  const fade = await target.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.transitionDuration = 'var(--ts-motion-duration-hover-out)'
    element.append(probe)
    const engine = getComputedStyle(probe).transitionDuration
    probe.remove()
    return { engine, plate: getComputedStyle(element, '::before').transitionDuration }
  })
  expect(fade.plate).toBe(fade.engine)
})
