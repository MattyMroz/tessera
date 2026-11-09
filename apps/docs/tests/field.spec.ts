import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, colorOf, edgeContext, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const EDGE_PRESS = 2
const FIELD_NODES = 2

function section(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function fieldOf(control: Locator): Locator {
  return control.locator('xpath=ancestor::*[@data-component="field"][1]')
}

function hostOf(input: Locator): Locator {
  return input.locator('xpath=..')
}

function nodesOf(host: Locator): Promise<number> {
  return host.evaluate((element) => {
    const count = (node: Element): number => {
      if (node.matches('[data-slot="icon"]')) return 1
      return [...node.children].filter((child) => !child.matches('[data-recipe="control"]')).reduce((total, child) => total + count(child), 1)
    }
    return count(element)
  })
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('labels the input from the label and describes it with the description', async ({ page }) => {
    const input = section(page, 'Field').getByRole('textbox', { name: 'Backend URL', exact: true })
    await expect(input).toHaveAccessibleDescription('The address of the local backend.')
    await section(page, 'Field').getByText('Backend URL', { exact: true }).click()
    await expect(input).toBeFocused()
  })

  test('focuses a control that a label cannot name from a click on the label', async ({ page }) => {
    await section(page, 'Field').getByText('Quality', { exact: true }).click()
    await expect(section(page, 'Field').getByRole('radio', { name: 'Balanced', exact: true })).toBeFocused()
  })

  test('shows the error, the invalid state and the invalid border in the same moment the field loses focus', async ({ page }) => {
    const scope = section(page, 'Field')
    const input = scope.getByRole('textbox', { name: 'Contact e-mail', exact: true })
    const field = fieldOf(input)
    const invalid = await colorOf(page, 'var(--ts-state-invalid-color)')
    const look = (): Promise<{ border: string; errors: number; invalid: string | null; state: string | null }> =>
      field.evaluate((element) => {
        const control = element.querySelector('[data-slot="input"]')
        return {
          border: getComputedStyle(control?.parentElement ?? element, '::before').borderTopColor,
          errors: element.querySelectorAll('[role="alert"]').length,
          invalid: control?.getAttribute('aria-invalid') ?? null,
          state: element.getAttribute('data-invalid'),
        }
      })
    await input.focus()
    await input.press('End')
    await input.press('Backspace')
    expect(await look()).toEqual({ border: TRANSPARENT, errors: 0, invalid: null, state: null })
    await page.keyboard.press('Tab')
    expect(await look()).toEqual({ border: invalid, errors: 1, invalid: 'true', state: '' })
    const error = field.getByRole('alert')
    await expect(error).not.toHaveText('')
    await expect(input).toHaveAccessibleDescription(await error.innerText())
  })

  test('reports a required value cleared by the user when the field loses focus', async ({ page }) => {
    const input = section(page, 'Field').getByRole('textbox', { name: 'Backend URL', exact: true })
    await input.focus()
    await page.keyboard.type('h')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Tab')
    await expect(fieldOf(input).getByRole('alert')).toBeVisible()
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  test('disables and dims the input of a disabled field', async ({ page }) => {
    const input = section(page, 'Field').getByRole('textbox', { name: 'Project folder', exact: true })
    await expect(input).toBeDisabled()
    const [dimmed, rest] = await Promise.all([
      hostOf(input).evaluate((element) => getComputedStyle(element).opacity),
      page.evaluate(() => {
        const probe = document.createElement('div')
        probe.style.opacity = 'var(--ts-state-disabled)'
        document.body.append(probe)
        const value = getComputedStyle(probe).opacity
        probe.remove()
        return value
      }),
    ])
    expect(dimmed).toBe(rest)
    expect(Number.parseFloat(dimmed)).toBeLessThan(1)
  })

  test('puts the label and the description on the left and the control on the first line on the right in a wide container', async ({ page }) => {
    const input = section(page, 'Field').getByRole('textbox', { name: 'Backend URL', exact: true })
    const field = fieldOf(input)
    const [label, description, control] = await Promise.all([
      box(field.locator('[data-slot="label"]')),
      box(field.locator('[data-slot="description"]')),
      box(hostOf(input)),
    ])
    const leading = await field.locator('[data-slot="label"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight))
    expect(control.x).toBeGreaterThanOrEqual(label.x + label.width - TOLERANCE)
    expect(control.x).toBeGreaterThanOrEqual(description.x + description.width - TOLERANCE)
    expect(Math.abs(description.x - label.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(description.y).toBeGreaterThanOrEqual(label.y + label.height - TOLERANCE)
    expect(Math.abs(label.y + leading / 2 - (control.y + control.height / 2))).toBeLessThanOrEqual(1)
  })

  test('puts the error under the control in the right column in a wide container and keeps the control in place', async ({ page }) => {
    const input = section(page, 'Field').getByRole('textbox', { name: 'Backend URL', exact: true })
    const field = fieldOf(input)
    const valid = await box(hostOf(input))
    await input.focus()
    await page.keyboard.type('h')
    await page.keyboard.press('Tab')
    const error = field.getByRole('alert')
    await expect(error).toBeVisible()
    const [description, control, message] = await Promise.all([box(field.locator('[data-slot="description"]')), box(hostOf(input)), box(error)])
    expect(Math.abs(message.x - control.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(message.x).toBeGreaterThanOrEqual(description.x + description.width - TOLERANCE)
    expect(message.y).toBeGreaterThanOrEqual(control.y + control.height - TOLERANCE)
    expect(Math.abs(control.x - valid.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(control.width - valid.width)).toBeLessThanOrEqual(TOLERANCE)
  })

  test('stacks the label, the description, the control and the error in one column in a container narrower than the narrow width', async ({ page }) => {
    const field = page.getByTestId('field-column').locator('[data-component="field"]')
    const input = field.getByRole('textbox')
    await input.focus()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Tab')
    const error = field.getByRole('alert')
    await expect(error).toBeVisible()
    const [whole, label, description, control, message] = await Promise.all([
      box(field),
      box(field.locator('[data-slot="label"]')),
      box(field.locator('[data-slot="description"]')),
      box(hostOf(input)),
      box(error),
    ])
    expect(description.y).toBeGreaterThanOrEqual(label.y + label.height - TOLERANCE)
    expect(control.y).toBeGreaterThanOrEqual(description.y + description.height - TOLERANCE)
    expect(message.y).toBeGreaterThanOrEqual(control.y + control.height - TOLERANCE)
    expect(Math.abs(message.x - label.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(control.width - whole.width)).toBeLessThanOrEqual(TOLERANCE)
  })

  test('focuses the input from a press on its icon and on its padding, but not from a press on a button in a slot', async ({ page }) => {
    const input = section(page, 'Input').getByRole('textbox', { name: 'Search', exact: true })
    const host = hostOf(input)
    const icon = host.locator(':scope > [data-slot="icon"]').first()
    await icon.click()
    await expect(input).toBeFocused()
    await page.locator('h1').click()
    await host.scrollIntoViewIfNeeded()
    const frame = await box(host)
    await page.mouse.click(frame.x + EDGE_PRESS, frame.y + frame.height / 2)
    await expect(input).toBeFocused()
    await page.locator('h1').click()
    await host.getByRole('button', { name: 'Clear search', exact: true }).click()
    await expect(input).not.toBeFocused()
  })

  test('wraps start and end in icon slots that keep the size of a glyph and take the size of a button', async ({ page }) => {
    const host = hostOf(section(page, 'Input').getByRole('textbox', { name: 'Search', exact: true }))
    const [glyph, button, icon, buttonSlot] = await Promise.all([
      box(host.locator(':scope > [data-slot="icon"]').first()),
      box(host.getByRole('button')),
      host.evaluate((element) => {
        const probe = document.createElement('span')
        probe.style.width = 'var(--ts-size-icon)'
        element.append(probe)
        const width = probe.getBoundingClientRect().width
        probe.remove()
        return width
      }),
      box(host.locator(':scope > [data-slot="icon"]').last()),
    ])
    expect(Math.abs(glyph.width - icon)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(buttonSlot.width - button.width)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(buttonSlot.height - button.height)).toBeLessThanOrEqual(TOLERANCE)
  })

  test('draws a glyph in an icon slot in the secondary label colour and leaves a button in a slot its own colour', async ({ page }) => {
    const host = hostOf(section(page, 'Input').getByRole('textbox', { name: 'Search', exact: true }))
    const secondary = await colorOf(page, 'var(--ts-color-secondary-label)')
    const colour = (target: Locator): Promise<string> => target.evaluate((element) => getComputedStyle(element).color)
    expect(await colour(host.locator(':scope > [data-slot="icon"]').first())).toBe(secondary)
    expect(await colour(host.getByRole('button'))).not.toBe(secondary)
  })

  test('builds an input of two nodes and one more for each filled slot', async ({ page }) => {
    const scope = section(page, 'Input')
    expect(await nodesOf(hostOf(scope.getByRole('textbox', { name: 'Name', exact: true })))).toBe(FIELD_NODES)
    expect(await nodesOf(hostOf(scope.getByRole('textbox', { name: 'Search', exact: true })))).toBe(FIELD_NODES + 2)
  })
})

test.describe('on the edges screen', () => {
  test('wraps a long label, description and error inside a 320 px container', async ({ page }) => {
    await visit(page, EDGES)
    const field = section(page, 'Field').getByTestId('narrow').locator('[data-component="field"]').last()
    const frame = await box(section(page, 'Field').getByTestId('narrow'))
    for (const slot of ['label', 'description', 'error']) {
      const part = field.locator(`[data-slot="${slot}"]`)
      const [rect, leading] = await Promise.all([box(part), part.evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight))])
      expect(rect.height, slot).toBeGreaterThan(leading + TOLERANCE)
      expect(rect.x + rect.width, slot).toBeLessThanOrEqual(frame.x + frame.width + TOLERANCE)
    }
  })
})

test.describe('in forced colors', () => {
  test.use(edgeContext({ media: 'forced colors' }))

  test('outlines the invalid field of a field section thicker and keeps its error readable', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await visit(page, EDGES)
    const fields = section(page, 'Field').getByTestId('full').locator('[data-component="field"]')
    const width = (field: Locator): Promise<number> =>
      field.locator('[data-slot="input"]').evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement ?? element, '::before').borderTopWidth))
    expect(await width(fields.last())).toBeGreaterThan(await width(fields.first()))
    const error = fields.last().getByRole('alert')
    await expect(error).toBeVisible()
    expect(await error.evaluate((element) => getComputedStyle(element).color)).not.toBe(TRANSPARENT)
  })
})
