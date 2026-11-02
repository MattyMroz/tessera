import type { Choices } from '@mattymroz/tessera/lib/theme'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, lightness, pixels, visit } from './helpers'

const PAGE = '/components'
const TOLERANCE = 0.5
const HOVER_STEP = 0.028
const PLATE_EDGE = 4
const CARD_PROBE = 20
const OVERLAY_LIFT = 0.04
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const SIZES: readonly Choices['size'][] = ['xs', 'sm', 'md', 'lg', 'xl']
const CORNERS: readonly Choices['corners'][] = ['none', 'sm', 'md', 'lg', 'full']
const CURVES: readonly Choices['curve'][] = ['round', 'squircle']
const MODES = ['light', 'dark'] as const
const RING = /(?:^|,\s*)(?:rgba?\([^)]*\)\s+)?0px 0px 0px 1px/

type Metrics = {
  readonly height: number
  readonly font: number
  readonly side: number
  readonly top: number
  readonly wrap: number
  readonly radius: number
  readonly gap: number
}

function section(page: Page, id: string): Locator {
  return page.locator(`section[aria-labelledby="${id}-title"]`)
}

function softButton(page: Page): Locator {
  return section(page, 'button').locator('> div').first().locator('[data-variant="soft"]').first()
}

function cardButton(page: Page): Locator {
  return section(page, 'button').locator('[data-recipe="surface"]').last().locator('[data-variant="soft"]').first()
}

async function axes(page: Page, values: Partial<Choices>): Promise<void> {
  await page.evaluate((choices) => {
    for (const [axis, value] of Object.entries(choices)) document.documentElement.setAttribute(`data-${axis}`, String(value))
  }, values)
}

function style(target: Locator): Promise<Metrics> {
  return target.evaluate((element) => {
    const computed = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return {
      height: rect.height,
      font: Number.parseFloat(computed.fontSize),
      side: Number.parseFloat(computed.paddingLeft),
      top: Number.parseFloat(computed.paddingTop),
      wrap: Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.borderTopWidth),
      radius: Number.parseFloat(computed.borderTopLeftRadius),
      gap: Number.parseFloat(computed.columnGap),
    }
  })
}

async function opened(page: Page, trigger: Locator, popup: Locator, how: 'click' | 'hover' = 'click'): Promise<Locator> {
  await trigger.scrollIntoViewIfNeeded()
  if (how === 'click') await trigger.click()
  else await trigger.hover()
  await expect(popup).toBeVisible()
  await expect.poll(() => popup.evaluate((element) => element.getAnimations({ subtree: true }).length === 0 && getComputedStyle(element).opacity === '1')).toBe(true)
  return popup
}

async function closed(page: Page, popup: Locator): Promise<void> {
  await page.keyboard.press('Escape')
  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
}

async function scale(page: Page): Promise<Record<string, number>> {
  const button = await style(softButton(page))
  const iconButton = section(page, 'button').locator('> div').nth(1).locator('[data-variant="soft"]').first()
  const toggle = await style(page.getByRole('radiogroup', { name: 'Range (raised)', exact: true }))
  const track = await style(section(page, 'button-group').getByRole('group', { name: 'History', exact: true }))
  const menu = await opened(page, section(page, 'menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
  const menuBox = await style(menu)
  const row = await style(menu.getByRole('menuitem').first())
  await closed(page, menu)
  const tip = await opened(page, section(page, 'tooltip').getByRole('button', { name: 'Save', exact: true }).first(), page.locator('[data-variant="tooltip"]'), 'hover')
  const tooltip = await style(tip)
  await closed(page, tip)
  return {
    'button height': button.height,
    'button side': button.side,
    'button font': button.font,
    'button radius': button.radius,
    'button icon': (await box(iconButton.locator('[data-slot="icon"]').first())).width,
    'button icon gap': (await style(iconButton)).gap,
    'toggle track gap': toggle.wrap,
    'toggle track radius': toggle.radius,
    'button group track gap': track.wrap,
    'button group track radius': track.radius,
    'menu gap': menuBox.wrap,
    'menu radius': menuBox.radius,
    'menu row height': row.height,
    'tooltip height': tooltip.height,
    'tooltip font': tooltip.font,
    'tooltip side': tooltip.side,
    'tooltip top': tooltip.top,
    'kbd height': (await style(page.getByTestId('kbd-inherit'))).height,
    'badge height': (await style(section(page, 'badge').locator('> div').first().locator('[data-recipe="control"]').first())).height,
  }
}

async function wrappers(page: Page): Promise<Readonly<Record<string, number>>> {
  const button = await style(softButton(page))
  const toggle = await style(page.getByRole('radiogroup', { name: 'Range (raised)', exact: true }))
  const track = await style(section(page, 'button-group').getByRole('group', { name: 'History', exact: true }))
  const joined = await style(section(page, 'button-group').getByRole('group', { name: 'Pages', exact: true }))
  const menu = await opened(page, section(page, 'menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
  const menuBox = await style(menu)
  const row = await style(menu.getByRole('menuitem').first())
  await closed(page, menu)
  return {
    'button height': button.height,
    'button side': button.side,
    'button radius': button.radius,
    'toggle height': toggle.height,
    'toggle gap': toggle.wrap,
    'toggle radius': toggle.radius,
    'track height': track.height,
    'track gap': track.wrap,
    'track radius': track.radius,
    'joined height': joined.height,
    'joined radius': joined.radius,
    'menu gap': menuBox.wrap,
    'menu radius': menuBox.radius,
    'menu row height': row.height,
  }
}

test.describe('size scale', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('grows every value that follows the size strictly from xs to xl: controls, their wrappers, the tooltip and a key and a badge without a size', async ({ page }) => {
    await visit(page, PAGE)
    const columns = new Map<string, number[]>()
    for (const size of SIZES) {
      await axes(page, { size })
      for (const [name, value] of Object.entries(await scale(page))) columns.set(name, [...(columns.get(name) ?? []), value])
    }
    const flat = [...columns].filter(([, values]) => values.some((value, index) => index > 0 && value <= (values[index - 1] ?? 0)))
    expect(flat.map(([name, values]) => `${name}: ${values.join(' / ')}`)).toEqual([])
  })

  test('sizes the close button of a popover and a dialog by the line of the title, below the title at every size', async ({ page }) => {
    await visit(page, PAGE)
    for (const size of SIZES) {
      await axes(page, { size })
      for (const [trigger, name] of [
        ['Notes', 'popover'],
        ['Chapter info', 'dialog'],
      ] as const) {
        const popup = await opened(page, page.getByRole('button', { name: trigger, exact: true }), page.getByRole('dialog'))
        const close = await style(popup.getByRole('button', { name: 'Close', exact: true }))
        const title = await popup.locator('[data-slot="title"]').evaluate((element) => {
          const computed = getComputedStyle(element)
          return { leading: Number.parseFloat(computed.lineHeight), font: Number.parseFloat(computed.fontSize) }
        })
        const icon = await box(popup.getByRole('button', { name: 'Close', exact: true }).locator('[data-slot="icon"]'))
        expect(Math.abs(close.height - title.leading), `${size} ${name}: close ${close.height} title line ${title.leading}`).toBeLessThanOrEqual(TOLERANCE)
        expect(icon.height, `${size} ${name}: icon ${icon.height} title font ${title.font}`).toBeLessThan(title.font)
        await closed(page, popup)
      }
    }
  })

  test('takes the gap and the radius of a track, a joined group and a menu from the size, not from the density', async ({ page }) => {
    await visit(page, PAGE)
    await axes(page, { density: 'compact' })
    const compact = await wrappers(page)
    const compactCard = await style(page.getByTestId('invite-card'))
    await axes(page, { density: 'spacious' })
    const spacious = await wrappers(page)
    expect(spacious).toEqual(compact)
    expect((await style(page.getByTestId('invite-card'))).side).toBeGreaterThan(compactCard.side)
  })

  for (const curve of CURVES) {
    test(`keeps the own radius of a control in a card and a dialog and the radius of a menu row concentric with the menu at every corner (${curve})`, async ({ page }) => {
      await visit(page, PAGE)
      for (const corners of CORNERS) {
        await axes(page, { corners, curve })
        const own = (await style(softButton(page))).radius
        const field = page.getByTestId('field-card').locator('[data-variant="field"]').first()
        expect(Math.abs((await style(cardButton(page))).radius - own), `${corners} button in a card`).toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs((await style(field)).radius - own), `${corners} field in a card`).toBeLessThanOrEqual(TOLERANCE)
        const dialog = await opened(page, section(page, 'dialog').getByRole('button', { name: 'Rename chapter', exact: true }), page.getByRole('dialog'))
        for (const control of [dialog.locator('[data-variant="field"]'), dialog.locator('[data-slot="actions"] [data-recipe="control"]').first()]) {
          expect(Math.abs((await style(control)).radius - own), `${corners} control in a dialog`).toBeLessThanOrEqual(TOLERANCE)
        }
        await closed(page, dialog)
        const menu = await opened(page, section(page, 'menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
        const outer = await style(menu)
        const row = await style(menu.getByRole('menuitem').first())
        const concentric = corners === 'none' ? 0 : outer.radius - outer.wrap
        expect(Math.abs(row.radius - concentric), `${corners} menu row ${row.radius} menu ${outer.radius} gap ${outer.wrap}`).toBeLessThanOrEqual(TOLERANCE)
        await closed(page, menu)
      }
    })
  }

  for (const mode of MODES) {
    test(`paints every raised control, pill, card and joined group without a ring in the shadow (${mode})`, async ({ page }) => {
      await visit(page, PAGE)
      await axes(page, { mode })
      const shadows = await page.evaluate(() =>
        [
          ...[...document.querySelectorAll('[data-recipe="control"][data-variant="raised"]')].map((element) => getComputedStyle(element, '::before').boxShadow),
          ...[...document.querySelectorAll('[data-recipe="indicator"][data-variant="raised"] > [data-slot="squash"]')].map((element) => getComputedStyle(element).boxShadow),
          ...[...document.querySelectorAll('[data-recipe="surface"][data-level="raised"], [data-surface="joined"]:has(> [data-variant="raised"])')].map((element) => getComputedStyle(element).boxShadow),
        ].filter((shadow) => shadow !== 'none'),
      )
      expect(shadows.length).toBeGreaterThan(0)
      expect(shadows.filter((shadow) => RING.test(shadow))).toEqual([])
    })

    test(`draws no border on a menu, a popover and a dialog and lifts a menu over a card by its fill only in the dark mode (${mode})`, async ({ page }) => {
      await visit(page, PAGE)
      await axes(page, { mode })
      const popups: readonly [Locator, Locator][] = [
        [section(page, 'menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu')],
        [page.getByRole('button', { name: 'Notes', exact: true }), page.getByRole('dialog')],
        [page.getByRole('button', { name: 'Chapter info', exact: true }), page.getByRole('dialog')],
      ]
      for (const [trigger, target] of popups) {
        const popup = await opened(page, trigger, target)
        const edge = await popup.evaluate((element) => ({ width: Number.parseFloat(getComputedStyle(element).borderTopWidth), color: getComputedStyle(element).borderTopColor }))
        expect(edge.color, `${mode} popup border`).toBe(TRANSPARENT)
        expect(edge.width, `${mode} popup keeps a transparent border for forced colors`).toBeGreaterThan(0)
        await closed(page, popup)
      }
      const card = section(page, 'menu').locator('[data-recipe="surface"]').last()
      const menu = await opened(page, card.getByRole('button').first(), page.getByRole('menu'))
      const [over, under] = await Promise.all([box(menu), box(card)])
      const [lifted, ground] = await pixels(page, [
        { x: over.x + over.width / 2, y: over.y + over.height - PLATE_EDGE },
        { x: under.x + CARD_PROBE, y: under.y + PLATE_EDGE },
      ])
      if (!lifted || !ground) throw new Error('no pixel')
      const lift = Math.abs(lightness(lifted) - lightness(ground))
      if (mode === 'dark') expect(lift, `dark menu over a card ${lift}`).toBeGreaterThanOrEqual(OVERLAY_LIFT)
      else expect(lift, `light menu over a card ${lift}`).toBeLessThan(HOVER_STEP)
    })

    test(`shows the hover of a soft, ghost, outline and raised button, a menu trigger and a menu row clearly in the ${mode} mode`, async ({ page }) => {
      await visit(page, PAGE)
      await axes(page, { mode })
      const first = section(page, 'button').locator('> div').first()
      const targets: readonly [string, Locator][] = [
        ['soft', first.locator('[data-variant="soft"]').first()],
        ['ghost', first.locator('[data-variant="ghost"]').first()],
        ['outline', first.locator('[data-variant="outline"]').first()],
        ['raised', first.locator('[data-variant="raised"]').first()],
        ['soft in a card', cardButton(page)],
        ['menu trigger', section(page, 'menu').getByRole('button', { name: 'Project', exact: true })],
      ]
      for (const [name, target] of targets) {
        await target.scrollIntoViewIfNeeded()
        await page.mouse.move(0, 0)
        const frame = await box(target)
        const plate = { x: frame.x + PLATE_EDGE, y: frame.y + frame.height / 2 }
        const [rest] = await pixels(page, [plate])
        await target.hover()
        const [hovered] = await pixels(page, [plate])
        if (!rest || !hovered) throw new Error('no pixel')
        expect(Math.abs(lightness(rest) - lightness(hovered)), `${mode} ${name}`).toBeGreaterThanOrEqual(HOVER_STEP)
      }
      const menu = await opened(page, section(page, 'menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
      const item = menu.getByRole('menuitem', { name: 'Open' })
      const frame = await box(item)
      const plate = { x: frame.x + PLATE_EDGE, y: frame.y + frame.height / 2 }
      const [rest] = await pixels(page, [plate])
      await item.hover()
      await expect.poll(() => menu.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
      const [hovered] = await pixels(page, [plate])
      if (!rest || !hovered) throw new Error('no pixel')
      expect(Math.abs(lightness(rest) - lightness(hovered)), `${mode} menu row`).toBeGreaterThanOrEqual(HOVER_STEP)
    })
  }
})
