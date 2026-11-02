import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, edgeContext, raisedShadow, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const TYPICAL_CONTROL_NODES = 3
const JOINT = 3
const NARROW = 320
const CORNER = 10
const CHANNEL_TOLERANCE = 48
const TRANSPARENT = 'rgba(0, 0, 0, 0)'

type Box = { x: number; y: number; width: number; height: number }

async function pixelsOf(page: Page, clip: Box): Promise<number[]> {
  const png = await page.screenshot({ clip, animations: 'disabled' })
  return page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('no canvas')
    context.drawImage(bitmap, 0, 0)
    return [...context.getImageData(0, 0, bitmap.width, bitmap.height).data]
  }, png.toString('base64'))
}

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Button group', exact: true })
}

function group(page: Page, name: string): Locator {
  return section(page).getByRole('group', { name, exact: true }).first()
}

function edgeGroups(page: Page): Locator {
  return page.getByRole('region', { name: 'Button group', exact: true }).getByTestId('narrow').getByRole('group')
}

function singleLine(groups: Locator): Promise<{ name: string | null; rows: number; left: number; right: number; frame: number }[]> {
  return groups.evaluateAll((elements) =>
    elements.map((element) => {
      const frame = element.parentElement?.getBoundingClientRect() ?? new DOMRect()
      const rect = element.getBoundingClientRect()
      return {
        name: element.getAttribute('aria-label'),
        rows: new Set([...element.children].map((child) => Math.round(child.getBoundingClientRect().top))).size,
        left: rect.left - frame.left,
        right: rect.right - frame.left,
        frame: frame.width,
      }
    }),
  )
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('renders a track group like a toggle group and a joined group as one clipped shape', async ({ page }) => {
    const attributes = (name: string): Promise<Record<string, string | null>> =>
      group(page, name).evaluate((element) =>
        Object.fromEntries(['role', 'data-recipe', 'data-level', 'data-surface', 'data-inset'].map((name) => [name, element.getAttribute(name)])),
      )
    expect(await attributes('History')).toEqual({ role: 'group', 'data-recipe': 'surface', 'data-level': 'sunken', 'data-surface': 'track', 'data-inset': 'inset' })
    expect(await attributes('Pages')).toEqual({ role: 'group', 'data-recipe': 'surface', 'data-level': null, 'data-surface': 'joined', 'data-inset': null })
    const lone = await page.getByRole('region', { name: 'Button', exact: true }).getByRole('button', { name: 'solid', exact: true }).evaluate((element) => getComputedStyle(element).borderTopLeftRadius)
    const pages = await group(page, 'Pages').evaluate((element) => ({
      radius: getComputedStyle(element).borderTopLeftRadius,
      overflow: getComputedStyle(element).overflow,
      padding: getComputedStyle(element).paddingLeft,
      segments: [...element.children].map((child) => getComputedStyle(child).borderTopLeftRadius),
    }))
    expect(pages).toEqual({ radius: lone, overflow: 'clip', padding: '0px', segments: ['0px', '0px', '0px'] })
  })

  test('paints the raised shadow on the joined group and none on its segments, so no line shows where they meet', async ({ page }) => {
    const filter = group(page, 'Filter')
    const shadow = await raisedShadow(page)
    const looks = await filter.evaluate((element) => ({
      group: getComputedStyle(element).boxShadow,
      segments: [...element.children].map((child) => getComputedStyle(child).boxShadow),
    }))
    expect(looks).toEqual({ group: shadow, segments: ['none', 'none'] })
    await filter.scrollIntoViewIfNeeded()
    const [first, second] = await Promise.all([box(filter.getByRole('button').first()), box(filter.getByRole('button').last())])
    expect(Math.abs(first.x + first.width - second.x)).toBeLessThanOrEqual(TOLERANCE)
    const clip = { x: second.x - JOINT, y: second.y + second.height / 2 - JOINT, width: JOINT * 2, height: JOINT * 2 }
    const shown = await page.screenshot({ clip, animations: 'disabled' })
    await filter.evaluate((element) => {
      for (const child of element.children) if (child instanceof HTMLElement) child.style.setProperty('box-shadow', 'none', 'important')
    })
    expect(shown.equals(await page.screenshot({ clip, animations: 'disabled' }))).toBe(true)
  })

  test('draws one rounded outline along a joined outline group, with corners like a lone outline button and no border on the segments', async ({ page }) => {
    const lone = section(page).getByRole('button', { name: 'Lone outline', exact: true })
    const joined = group(page, 'Joined outline')
    expect(await joined.evaluate((element) => [...element.children].map((child) => getComputedStyle(child).borderTopColor))).toEqual([TRANSPARENT, TRANSPARENT])
    await joined.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const [single, both] = await Promise.all([box(lone), box(joined)])
    expect(Math.abs(single.x - both.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(single.height - both.height)).toBeLessThanOrEqual(TOLERANCE)
    const corners = (rect: Box): Box[] => [
      { x: rect.x, y: rect.y, width: CORNER, height: CORNER },
      { x: rect.x, y: rect.y + rect.height - CORNER, width: CORNER, height: CORNER },
    ]
    const groupCorners = corners(both)
    for (const [index, clip] of corners(single).entries()) {
      const groupClip = groupCorners[index]
      if (!groupClip) throw new Error('no corner')
      const [expected, shown] = await Promise.all([pixelsOf(page, clip), pixelsOf(page, groupClip)])
      expect(Math.max(...expected.map((value, channel) => Math.abs(value - (shown[channel] ?? 0)))), `corner ${index}`).toBeLessThanOrEqual(CHANNEL_TOLERANCE)
    }
  })

  test('makes every button its own Tab stop and leaves the arrow keys to the page', async ({ page }) => {
    const history = group(page, 'History')
    const buttons = history.getByRole('button')
    await buttons.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(buttons.first()).toBeFocused()
    for (const index of [1, 2]) {
      await page.keyboard.press('Tab')
      await expect(buttons.nth(index)).toBeFocused()
    }
    const pages = group(page, 'Pages').getByRole('button')
    await pages.first().focus()
    await page.keyboard.press('Tab')
    await expect(pages.nth(1)).toBeFocused()
  })

  test('draws the focus ring inside the first, a middle and the last segment of a joined group', async ({ page }) => {
    const segments = group(page, 'Pages').getByRole('button')
    const inset = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.outlineOffset = 'var(--ts-focus-offset-inset)'
      document.body.append(probe)
      const offset = getComputedStyle(probe).outlineOffset
      probe.remove()
      return offset
    })
    expect(Number.parseFloat(inset)).toBeLessThan(0)
    await segments.first().focus()
    for (const index of [0, 1, 2]) {
      if (index > 0) await page.keyboard.press('Tab')
      const segment = segments.nth(index)
      await expect(segment).toBeFocused()
      expect(await segment.evaluate((element) => ({ style: getComputedStyle(element).outlineStyle, offset: getComputedStyle(element).outlineOffset })), `segment ${index}`).toEqual({
        style: 'solid',
        offset: inset,
      })
    }
  })

  test('opens the menu of a split button at the start edge of the whole group, at least as wide as the group', async ({ page }) => {
    const exporting = group(page, 'Export')
    await exporting.getByRole('button', { name: 'More export options', exact: true }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const [popup, anchor] = await Promise.all([box(menu), box(exporting)])
    expect(Math.abs(popup.x - anchor.x)).toBeLessThanOrEqual(TOLERANCE)
    expect(popup.width).toBeGreaterThanOrEqual(anchor.width - TOLERANCE)
  })

  test('adds one DOM node: the group holds the buttons themselves', async ({ page }) => {
    const groups = await section(page).getByRole('group').evaluateAll(
      (elements, typical) =>
        elements.map((element) => {
          const count = (node: Element): number =>
            node.matches('[data-slot="icon"]') ? 1 : [...node.children].reduce((total, child) => total + count(child), 1)
          const children = [...element.children]
          return {
            name: element.getAttribute('aria-label'),
            wrappers: children.filter((child) => !child.matches('[data-recipe="control"]')).length,
            heavy: children.filter((child) => count(child) > typical + Math.max(0, child.querySelectorAll(':scope > [data-slot="icon"]').length - 1)).length,
          }
        }),
      TYPICAL_CONTROL_NODES,
    )
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.filter((found) => found.wrappers > 0 || found.heavy > 0)).toEqual([])
  })
})

test.describe('on the edges screen at 320 px', () => {
  test.use(edgeContext({ width: NARROW }))

  test('keeps every group on one line inside the 320 px container', async ({ page }) => {
    await visit(page, EDGES)
    const lines = await singleLine(edgeGroups(page))
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.filter((line) => line.rows !== 1 || line.left < -TOLERANCE || line.right > line.frame + TOLERANCE)).toEqual([])
  })
})

test.describe('on the edges screen at 200% zoom', () => {
  test.use(edgeContext({ zoom: 2 }))

  test('keeps every group on one line inside the 320 px container', async ({ page }) => {
    await visit(page, EDGES)
    const lines = await singleLine(edgeGroups(page))
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.filter((line) => line.rows !== 1 || line.left < -TOLERANCE || line.right > line.frame + TOLERANCE)).toEqual([])
  })
})
