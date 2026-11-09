import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, edgeContext, visit } from './helpers'

const PAGE = '/components'
const TOLERANCE = 1
const NARROW = 320
const ERROR = 'The settings file is locked. Close the other window and try again.'

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Alert dialog', exact: true })
}

function opener(page: Page, name: string): Locator {
  return section(page).getByRole('button', { name, exact: true })
}

function answer(page: Page): Locator {
  return page.getByTestId('confirm-answer')
}

async function closed(page: Page): Promise<void> {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('puts Cancel first in the DOM and gives it the first focus', async ({ page }) => {
    await opener(page, 'Discard').click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button').first()).toHaveText('Cancel')
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  })

  test('resolves true from the confirm button, false from Cancel and false from Escape', async ({ page }) => {
    await opener(page, 'Discard').click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Discard', exact: true }).click()
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: true')
    await opener(page, 'Discard').click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click()
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: false')
    await opener(page, 'Discard').click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Discard', exact: true }).click()
    await expect(answer(page)).toHaveText('Answer: true')
    await opener(page, 'Discard').click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: false')
  })

  test('cancels from Enter on a fresh window', async ({ page }) => {
    await opener(page, 'Discard').click()
    await expect(page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: false')
  })

  test('stays open after a click on the backdrop', async ({ page }) => {
    await opener(page, 'Discard').click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.mouse.click(1, 1)
    await expect(page.getByRole('alertdialog')).toBeVisible()
  })

  test('gives the confirm button the danger tone for a destructive action', async ({ page }) => {
    await opener(page, 'Delete project').click()
    await expect(page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true })).toHaveAttribute('data-tone', 'danger')
  })

  test('keeps the window open with a busy action while onConfirm runs and ignores Escape and Cancel', async ({ page }) => {
    await opener(page, 'Delete project').click()
    const dialog = page.getByRole('alertdialog')
    const action = dialog.getByRole('button', { name: 'Delete', exact: true })
    const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true })
    await action.click()
    await expect(action).toHaveAttribute('aria-busy', 'true')
    await expect(cancel).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Escape')
    await cancel.click({ force: true })
    await action.click()
    await expect(dialog).toBeVisible()
    await expect(answer(page)).toHaveText('Answer: none')
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: true')
  })

  test('shows a rejected onConfirm as a danger alert in the open window and closes on the next try', async ({ page }) => {
    await opener(page, 'Reset shortcuts').click()
    const dialog = page.getByRole('alertdialog')
    await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
    const error = dialog.getByRole('alert')
    await expect(error).toHaveText(ERROR)
    await expect(error).toHaveAttribute('data-tone', 'danger')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reset', exact: true })).not.toHaveAttribute('aria-busy', 'true')
    await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
    await closed(page)
    await expect(answer(page)).toHaveText('Answer: true')
  })

  test('keeps the text and the state of the window while it closes', async ({ page }) => {
    await opener(page, 'Delete project').click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await dialog.evaluate((element) => {
      const changes: string[] = []
      new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === 'attributes' && !['aria-busy', 'aria-disabled'].includes(record.attributeName ?? '')) continue
          changes.push(record.type === 'attributes' ? `${record.attributeName}` : record.type)
        }
      }).observe(element, { subtree: true, childList: true, characterData: true, attributes: true })
      Object.assign(window, { closingChanges: changes })
    })
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Delete', exact: true })).toHaveAttribute('aria-busy', 'true')
    await page.evaluate(() => (window as unknown as { closingChanges: string[] }).closingChanges.splice(0))
    await closed(page)
    expect(await page.evaluate(() => (window as unknown as { closingChanges: string[] }).closingChanges)).toEqual([])
  })

  test('wraps a long description at the measure of the alert dialog', async ({ page }) => {
    await opener(page, 'Delete project').click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    const limit = await dialog.evaluate((element) => {
      const probe = document.createElement('div')
      probe.style.width = 'calc(var(--ts-type-measure) + var(--ts-shape-inset) + var(--ts-shape-inset))'
      element.append(probe)
      const width = probe.getBoundingClientRect().width
      probe.remove()
      return width
    })
    const { width } = await box(dialog)
    expect(width).toBeLessThanOrEqual(limit + TOLERANCE)
    expect(width).toBeGreaterThan(limit / 2)
  })

  test('opens a custom alert dialog from its trigger with the dialog parts', async ({ page }) => {
    await section(page).getByRole('button', { name: 'Custom', exact: true }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toHaveAccessibleName('Leave the editor?')
    await dialog.getByRole('button', { name: 'Stay', exact: true }).click()
    await closed(page)
  })

  test('centres its text and puts Cancel and the action side by side at one width', async ({ page }) => {
    const [cancel, action] = await confirmButtons(page)
    expect(Math.abs(cancel.width - action.width)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(cancel.y - action.y)).toBeLessThanOrEqual(TOLERANCE)
    expect(action.x).toBeGreaterThanOrEqual(cancel.x + cancel.width)
  })
})

test.describe('in a 320 px window', () => {
  test.use(edgeContext({ width: NARROW }))

  test('stacks Cancel over the action at one width', async ({ page }) => {
    await visit(page, PAGE)
    const [cancel, action] = await confirmButtons(page)
    expect(Math.abs(cancel.width - action.width)).toBeLessThanOrEqual(TOLERANCE)
    expect(action.y).toBeGreaterThanOrEqual(cancel.y + cancel.height)
  })
})

type Box = Awaited<ReturnType<typeof box>>

async function confirmButtons(page: Page): Promise<[Box, Box]> {
  await opener(page, 'Discard').click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate((element) => getComputedStyle(element).textAlign)).toBe('center')
  return Promise.all([box(dialog.getByRole('button', { name: 'Cancel', exact: true })), box(dialog.getByRole('button', { name: 'Discard', exact: true }))])
}
