import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { contrast, edgeContext, MIN_CONTRAST, visit } from './helpers'

const LAB_PAGES = ['/', '/foundation', '/components', '/screens/overlays', '/screens/edges'] as const
const BLOCKING: ReadonlySet<string> = new Set(['serious', 'critical'])
const CONTRAST = 'color-contrast'
const PLATE_INSET = 3
const OUTLINE_RULES =['heading-order', 'landmark-one-main', 'region', 'page-has-heading-one'] as const
const VIVID_ROLES: readonly string[] = ['tint', 'tint-bright', 'tint-dim', 'success', 'warning', 'danger', 'info']
const NEUTRAL_ROLES: readonly string[] = ['label', 'secondary-label', 'hint-label', 'tertiary-label', 'quaternary-label', 'inverse-label', 'tooltip-label']

function vividText(page: Page, targets: readonly string[]): Promise<boolean[]> {
  return page.evaluate(
    ({ targets, vivid, neutral }) => {
      const colorOf = (role: string): string => {
        const probe = document.createElement('span')
        probe.style.color = `var(--ts-color-${role})`
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      const neutralColors = new Set(neutral.map(colorOf))
      const vividColors = new Set(vivid.map(colorOf).filter((color) => !neutralColors.has(color)))
      return targets.map((target) => {
        const element = target === '' ? null : document.querySelector(target)
        return element !== null && vividColors.has(getComputedStyle(element).color)
      })
    },
    { targets, vivid: VIVID_ROLES, neutral: NEUTRAL_ROLES },
  )
}

for (const path of LAB_PAGES) {
  test(`outlines ${path} with one h1, headings without a skipped level and the main and navigation landmarks`, async ({ page }) => {
    await visit(page, path)
    const outline = await page.evaluate(() => ({
      levels: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName.slice(1))),
      main: document.querySelectorAll('main').length,
      navigation: document.querySelectorAll('nav').length,
    }))
    expect(outline.levels.filter((level) => level === 1)).toHaveLength(1)
    expect(outline.levels[0]).toBe(1)
    expect(outline.levels.flatMap((level, index) => (index > 0 && level > (outline.levels[index - 1] ?? 0) + 1 ? [`h${outline.levels[index - 1]} → h${level}`] : []))).toEqual([])
    expect(outline.main).toBe(1)
    expect(outline.navigation).toBeGreaterThan(0)
    const { violations } = await new AxeBuilder({ page }).withRules([...OUTLINE_RULES]).analyze()
    expect(violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([])
  })
}

test('renders every component as its element and role', async ({ page }) => {
  await visit(page, '/components')
  const region = (name: string): Locator => page.getByRole('region', { name, exact: true })
  const tags = (scope: Locator, selector: string): Promise<string[]> => scope.locator(selector).evaluateAll((elements) => elements.map((element) => element.tagName.toLowerCase()))
  const roles = (scope: Locator, selector: string): Promise<(string | null)[]> => scope.locator(selector).evaluateAll((elements) => elements.map((element) => element.getAttribute('role')))
  const only = (found: readonly (string | null)[], allowed: readonly string[], name: string): void => {
    expect(found.length, name).toBeGreaterThan(0)
    expect(found.filter((value) => value === null || !allowed.includes(value)), name).toEqual([])
  }
  const main = page.locator('main')
  only(await tags(region('Button'), '[data-recipe="control"][data-focus]:not([data-variant="field"])'), ['button', 'a'], 'Button')
  expect(await region('Button').locator('a[data-recipe="control"]:not([href])').count(), 'Button link without href').toBe(0)
  only(await tags(main, '[data-component="field"] > [data-slot="label"]'), ['label'], 'FieldLabel')
  only(await tags(main, '[data-component="field"] > [data-slot="description"]'), ['p'], 'FieldDescription')
  only(await roles(main, '[data-component="button-group"]'), ['group'], 'ButtonGroup')
  only(await roles(main, '[data-component="toggle-group"]'), ['radiogroup'], 'ToggleGroup')
  only(await tags(main, '[data-component="toggle-group"] > [data-recipe="control"]'), ['button'], 'ToggleGroupItem')
  only(await roles(main, '[data-component="toggle-group"] > [data-recipe="control"]'), ['radio'], 'ToggleGroupItem role')
  only(await roles(region('Alert'), '[data-component="alert"]'), ['alert', 'status', 'note'], 'Alert')
  expect(await region('Alert').getByRole('note').count(), 'Alert with the role of its prop').toBeGreaterThan(0)
  only(await tags(region('Badge'), '[data-recipe="control"]:not([data-focus])'), ['span'], 'Badge')
  only(await tags(region('Kbd'), 'kbd[data-recipe="control"]'), ['kbd'], 'Kbd')
  only(await tags(main, '[data-component="field"] input[data-slot="input"]'), ['input'], 'Input')
  only(await tags(main, 'textarea[data-slot="input"]'), ['textarea'], 'Textarea')
  only(await roles(region('Checkbox'), '[data-slot="box"]'), ['checkbox'], 'Checkbox')
  only(await tags(region('Checkbox'), '[data-component="checkbox"][data-slot="choice"]:has(> [data-variant="label"])'), ['label'], 'Checkbox label')
  only(await roles(region('Switch'), '[data-slot="track"]'), ['switch'], 'Switch')
  only(await roles(region('Radio'), '[data-component="radio"]:not([data-slot])'), ['radiogroup'], 'RadioGroup')
  only(await roles(region('Radio'), '[data-slot="box"]'), ['radio'], 'Radio')
  for (const [trigger, role] of [
    ['Rename chapter', 'dialog'],
    ['Details', 'dialog'],
    ['Discard', 'alertdialog'],
  ] as const) {
    await page.getByRole('button', { name: trigger, exact: true }).click()
    const popup = page.getByRole(role)
    await expect(popup).toBeVisible()
    const title = await popup.evaluate((element) => {
      const id = element.getAttribute('aria-labelledby')
      const named = id ? document.getElementById(id) : null
      return { tag: named?.tagName.toLowerCase() ?? null, slot: named?.getAttribute('data-slot') ?? null }
    })
    expect(title, trigger).toEqual({ tag: 'h2', slot: 'title' })
    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)
  }
  await region('Menu').getByRole('button', { name: 'Project', exact: true }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  only(await roles(page.locator('body'), '[role="menu"] > [data-recipe="row"]:not([data-variant])'), ['menuitem', 'menuitemcheckbox'], 'MenuItem')
})

for (const media of ['light', 'dark'] as const) {
  test.describe(`in ${media}`, () => {
    test.use(edgeContext({ media }))

    for (const path of LAB_PAGES) {
      test(`finds no serious or critical violation on ${path}, with the contrast of accent and status text only reported`, async ({ page }) => {
        await visit(page, path)
        const { violations } = await new AxeBuilder({ page }).analyze()
        const nodes = violations
          .filter((violation) => BLOCKING.has(violation.impact ?? ''))
          .flatMap((violation) => violation.nodes.map((node) => ({ rule: violation.id, target: node.target.join(' '), summary: node.failureSummary ?? '' })))
        const vivid = await vividText(page, nodes.map((node) => (node.rule === CONTRAST ? node.target : '')))
        const reported = nodes.filter((_, index) => vivid[index])
        for (const node of reported) test.info().annotations.push({ type: CONTRAST, description: `${node.target}: ${node.summary}` })
        expect(nodes.filter((_, index) => !vivid[index]).map((node) => `${node.rule}: ${node.target} ${node.summary}`)).toEqual([])
      })

      test(`keeps the label of every enabled control on ${path} readable on the painted plate behind it, which axe leaves unchecked`, async ({ page }) => {
        await visit(page, path)
        const width = page.viewportSize()?.width ?? 0
        await page.setViewportSize({ width, height: await page.evaluate(() => document.documentElement.scrollHeight) })
        const shot = await page.screenshot({ animations: 'disabled' })
        const labels = await page.evaluate(
          async ({ data, inset, vivid, neutral }) => {
            const image = new Image()
            image.src = `data:image/png;base64,${data}`
            await image.decode()
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            const context = canvas.getContext('2d')
            if (!context) throw new Error('no canvas')
            context.drawImage(image, 0, 0)
            const scale = image.width / document.documentElement.scrollWidth
            const colorOf = (role: string): string => {
              const probe = document.createElement('span')
              probe.style.color = `var(--ts-color-${role})`
              document.body.append(probe)
              const color = getComputedStyle(probe).color
              probe.remove()
              return color
            }
            const neutralColors = new Set(neutral.map(colorOf))
            const vividColors = new Set(vivid.map(colorOf).filter((color) => !neutralColors.has(color)))
            return [...document.querySelectorAll('[data-recipe="control"] > [data-slot="label"]')].flatMap((label) => {
              const control = label.parentElement
              if (!control || control.closest(':disabled, [aria-disabled="true"], [data-disabled]')) return []
              if (!label.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return []
              const rect = control.getBoundingClientRect()
              if (rect.width === 0) return []
              const x = Math.round((rect.left + scrollX + inset) * scale)
              const y = Math.round((rect.top + scrollY + rect.height / 2) * scale)
              const [red = 0, green = 0, blue = 0] = context.getImageData(x, y, 1, 1).data
              const color = getComputedStyle(label).color
              return [{ name: `${control.tagName} "${label.textContent?.slice(0, 24)}"`, color, plate: `rgb(${red}, ${green}, ${blue})`, vivid: vividColors.has(color) }]
            })
          },
          { data: shot.toString('base64'), inset: PLATE_INSET, vivid: VIVID_ROLES, neutral: NEUTRAL_ROLES },
        )
        expect(labels.length).toBeGreaterThan(0)
        for (const label of labels.filter((found) => found.vivid && contrast(found.color, found.plate) < MIN_CONTRAST))
          test.info().annotations.push({ type: CONTRAST, description: `${label.name}: ${label.color} on ${label.plate}` })
        expect(
          labels
            .filter((label) => !label.vivid && contrast(label.color, label.plate) < MIN_CONTRAST)
            .map((label) => `${label.name}: ${label.color} on ${label.plate} = ${contrast(label.color, label.plate).toFixed(2)}`),
        ).toEqual([])
      })
    }
  })
}
