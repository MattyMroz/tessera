import type { Choices } from '@mattymroz/tessera/lib/theme'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, opticalGaps, visit, type OpticalGaps } from './helpers'

const PAGE = '/components'
const OVERLAYS = '/screens/overlays'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const FONT_ROUNDING = 0.75
const WEBKIT_TEXT_SNAP = 1
const SQUIRCLE_GAIN = 1.6
const QUARTER = 4
const HALF = 2
const ICON_SIDE = 0.6
const MIN_RADIUS = 4
const LOOSE_INSET = 16
const SIDE_STEP = 2
const SIZES: readonly Choices['size'][] = ['xs', 'sm', 'md', 'lg', 'xl']
const VARIANTS = ['solid', 'soft', 'outline', 'raised', 'ghost'] as const
const CORNERS: readonly Choices['corners'][] = ['none', 'md', 'full']
const DENSITIES: readonly Choices['density'][] = ['compact', 'default']
const CORNER_CLOSE: readonly Choices['corners'][] = ['md', 'full']
const COMPOSED_SIZES: readonly Choices['size'][] = ['sm', 'lg']
const TEXTAREA_LINES = 'First line\nSecond line\nThird line'
const CAPSULES = [
  "main [data-recipe='control']:not([data-surface='joined'] > *, [data-slot='action'] > *, [data-slot='close'], :has(> textarea), [role='checkbox'][data-slot='box'])",
  "main [data-surface='track']",
  "main [data-surface='joined']",
  "main [data-recipe='indicator'] > [data-slot='squash']",
].join(', ')

type Theme = { readonly corners: Choices['corners']; readonly density: Choices['density']; readonly mode: 'light' | 'dark' }

type Engine = { readonly gap: number; readonly stroke: number; readonly surface: number; readonly squircle: boolean }

type Content = 'text' | 'controls'

const THEMES: readonly Theme[] = [
  ...CORNERS.flatMap((corners) => DENSITIES.map((density) => ({ corners, density, mode: 'light' as const }))),
  { corners: 'full', density: 'compact', mode: 'dark' },
]

async function theme(page: Page, choices: Theme): Promise<void> {
  await page.evaluate((values) => {
    for (const [axis, value] of Object.entries(values)) document.documentElement.setAttribute(`data-${axis}`, value)
  }, choices)
}

function nameOf(choices: Theme): string {
  return `${choices.corners} ${choices.density} ${choices.mode}`
}

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

function round(gaps: OpticalGaps): number {
  return gaps.squircle ? gaps.radius / SQUIRCLE_GAIN : gaps.radius
}

function controlSide(gaps: OpticalGaps): number {
  const base = Math.max(gaps.height - gaps.textSize, gaps.height / HALF) - gaps.height / (HALF * QUARTER)
  return Math.round((base + Math.min(round(gaps), gaps.height / HALF) / QUARTER) * SIDE_STEP) / SIDE_STEP
}

function inset(gaps: OpticalGaps, side: number): number {
  return side + gaps.stroke
}

function engineOf(target: Locator): Promise<Engine> {
  return target.evaluate((element) => {
    const NAMES: Readonly<Record<string, string>> = {
      inset: '--ts-space-inset',
      group: '--ts-space-group',
      card: '--ts-space-card',
      'card-small': '--ts-space-card-small',
    }
    const length = (value: string): number => {
      const probe = document.createElement('div')
      probe.style.position = 'absolute'
      probe.style.width = value
      element.append(probe)
      const width = probe.getBoundingClientRect().width
      probe.remove()
      return width
    }
    const wraps = element.getAttribute('data-content') === 'controls'
    return {
      gap: length(wraps ? 'var(--ts-size-wrap)' : `var(${NAMES[element.getAttribute('data-inset') ?? 'inset'] ?? '--ts-space-inset'})`),
      stroke: length('var(--ts-shape-stroke)'),
      surface: length('var(--ts-shape-surface)'),
      squircle: getComputedStyle(element).getPropertyValue('corner-top-left-shape').startsWith('superellipse(2'),
    }
  })
}

async function surfaceSide(target: Locator, content: Content = 'text'): Promise<number> {
  const engine = await engineOf(target)
  if (content === 'controls') return engine.gap + engine.stroke
  return engine.gap + engine.stroke + (engine.squircle ? engine.surface / SQUIRCLE_GAIN : engine.surface) / QUARTER
}

function textTolerance(): number {
  return test.info().project.name === 'webkit' ? WEBKIT_TEXT_SNAP : TOLERANCE
}

function expectEven(gaps: OpticalGaps, label: string): void {
  expect(Math.abs(gaps.left - gaps.right), `${label}: left ${gaps.left} right ${gaps.right}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(gaps.top - gaps.bottom), `${label}: top ${gaps.top} bottom ${gaps.bottom}`).toBeLessThanOrEqual(textTolerance())
}

async function expectSurface(target: Locator, label: string, content: Content = 'text'): Promise<void> {
  const gaps = await opticalGaps(target)
  const side = await surfaceSide(target, content)
  expectEven(gaps, label)
  expect(Math.abs(gaps.top - gaps.left), `${label}: top ${gaps.top} side ${gaps.left}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(gaps.left - side), `${label}: side ${gaps.left} rule ${side}`).toBeLessThanOrEqual(TOLERANCE)
}

async function sized(target: Locator, size: Choices['size']): Promise<void> {
  await target.evaluate((element, value) => element.setAttribute('data-size', value), size)
}

async function opened(page: Page, trigger: Locator, popup: Locator): Promise<Locator> {
  await trigger.click()
  await expect(popup).toBeVisible()
  await expect
    .poll(() => popup.evaluate((element) => element.getAnimations({ subtree: true }).length === 0 && getComputedStyle(element).opacity === '1'))
    .toBe(true)
  return popup
}

async function closed(page: Page, popup: Locator): Promise<void> {
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
}

function ownRadius(control: Locator): Promise<number> {
  return control.evaluate((element) => {
    const twin = element.cloneNode(false)
    if (!(twin instanceof HTMLElement)) throw new Error('no twin')
    twin.removeAttribute('data-slot')
    document.body.append(twin)
    const radius = Number.parseFloat(getComputedStyle(twin).borderTopRightRadius)
    twin.remove()
    return radius
  })
}

async function expectCorner(container: Locator, corner: Locator, title: Locator, label: string): Promise<void> {
  const side = await surfaceSide(container)
  const host = await container.elementHandle()
  const geometry = await corner.evaluate((element, frameOf) => {
    if (!frameOf) throw new Error('no container')
    const frame = frameOf.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    return {
      top: rect.top - frame.top,
      end: frame.right - rect.right,
      middle: rect.top + rect.height / 2,
      start: rect.left,
      height: rect.height,
      outer: Number.parseFloat(getComputedStyle(frameOf).borderTopRightRadius),
      inner: Number.parseFloat(getComputedStyle(element).borderTopRightRadius),
    }
  }, host)
  const words = await opticalGaps(title)
  const titleBox = await box(title)
  const capMiddle = titleBox.y + words.top + (titleBox.height - words.top - words.bottom) / HALF
  const tight = geometry.outer === 0 ? 0 : Math.min(Math.max(geometry.outer - geometry.top, MIN_RADIUS), geometry.height / HALF)
  const concentric = geometry.top >= LOOSE_INSET ? await ownRadius(corner) : tight
  expect(Math.abs(geometry.top - geometry.end), `${label}: top ${geometry.top} end ${geometry.end}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(geometry.top - side), `${label}: offset ${geometry.top} side ${side}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(geometry.inner - concentric), `${label}: radius ${geometry.inner} concentric ${concentric}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(capMiddle - geometry.middle), `${label}: title middle ${capMiddle} button middle ${geometry.middle}`).toBeLessThanOrEqual(textTolerance())
  expect(titleBox.x + titleBox.width - words.right, `${label}: title runs under the button`).toBeLessThanOrEqual(geometry.start)
}

async function expectComposed(container: Locator, label: string): Promise<void> {
  const gaps = await opticalGaps(container)
  const side = await surfaceSide(container)
  expect(Math.abs(gaps.left - gaps.right), `${label}: left ${gaps.left} right ${gaps.right}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(gaps.left - side), `${label}: side ${gaps.left} rule ${side}`).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(gaps.bottom - side), `${label}: bottom ${gaps.bottom} rule ${side}`).toBeLessThanOrEqual(TOLERANCE)
  await expectCorner(container, container.getByRole('button', { name: 'Close', exact: true }), container.locator('[data-slot="title"]'), label)
}

test.describe('optical symmetry', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('centres the label of every button variant and size and pads its sides by base plus a quarter of the radius', async ({ page }) => {
    await visit(page, PAGE)
    const buttons = region(page, 'Button').locator('> div').first().getByRole('button')
    await buttons.evaluateAll((elements) => {
      for (const element of elements) element.setAttribute('data-hug', '')
    })
    for (const corners of CORNERS) {
      await theme(page, { corners, density: 'compact', mode: 'light' })
      for (const [index, variant] of VARIANTS.entries()) {
        for (const size of SIZES) {
          await sized(buttons.nth(index), size)
          const gaps = await opticalGaps(buttons.nth(index))
          const label = `${corners} ${variant} ${size}`
          expectEven(gaps, label)
          expect(Math.abs(gaps.left - inset(gaps, controlSide(gaps))), `${label}: side ${gaps.left}`).toBeLessThanOrEqual(TOLERANCE)
        }
      }
    }
  })

  test('centres the glyphs of a badge, a key, a menu row and a group label', async ({ page }) => {
    await visit(page, PAGE)
    for (const corners of CORNERS) {
      await theme(page, { corners, density: 'compact', mode: 'light' })
      const badge = await opticalGaps(region(page, 'Badge').locator('[data-recipe="control"]').first())
      expectEven(badge, `${corners} badge`)
      expect(Math.abs(badge.left - inset(badge, controlSide(badge))), `${corners} badge side`).toBeLessThanOrEqual(TOLERANCE)
      const key = await opticalGaps(region(page, 'Kbd').locator('kbd[data-recipe="control"]').first())
      expectEven(key, `${corners} key`)
      const menu = await opened(page, region(page, 'Menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
      for (const row of [menu.getByRole('menuitem', { name: 'New chapter' }), menu.locator('[data-variant="group-label"]').first()]) {
        const gaps = await opticalGaps(row)
        const column = await row.evaluate((element) => {
          const probe = document.createElement('div')
          probe.style.position = 'absolute'
          probe.style.width = 'calc(var(--ts-size-icon) + var(--ts-size-gap))'
          element.append(probe)
          const width = probe.getBoundingClientRect().width
          probe.remove()
          return width
        })
        const side = inset(gaps, controlSide(gaps))
        expect(Math.abs(gaps.left - Math.round(side * ICON_SIDE) - column), `${corners} menu row: left ${gaps.left} column ${column}`).toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs(gaps.right - side), `${corners} menu row: right ${gaps.right} side ${side}`).toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs(gaps.top - gaps.bottom), `${corners} menu row: top ${gaps.top} bottom ${gaps.bottom}`).toBeLessThanOrEqual(textTolerance())
      }
      await closed(page, menu)
    }
    const keyGaps = await opticalGaps(region(page, 'Kbd').locator('kbd[data-recipe="control"]').first())
    expect(Math.abs(keyGaps.left - Math.round(controlSide(keyGaps) * ICON_SIDE))).toBeLessThanOrEqual(TOLERANCE)
  })

  test('pads inputs and textareas of every size by the side rule, with the first line of a textarea as far from the top as the side', async ({ page }) => {
    await visit(page, PAGE)
    const notes = page.getByRole('textbox', { name: 'Notes', exact: true })
    await notes.fill(TEXTAREA_LINES)
    for (const size of SIZES) {
      const input = await opticalGaps(page.getByRole('textbox', { name: `Size ${size}`, exact: true }).locator('..'))
      expect(Math.abs(input.left - input.right), `input ${size} sides`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(input.left - inset(input, controlSide(input))), `input ${size} side`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(input.top - input.bottom), `input ${size} text`).toBeLessThanOrEqual(FONT_ROUNDING)
      await sized(notes.locator('..'), size)
      const area = await opticalGaps(notes.locator('..'))
      const side = inset(area, controlSide(area))
      expect(Math.abs(area.left - area.right), `textarea ${size} sides`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(area.left - side), `textarea ${size} side`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(area.top - side), `textarea ${size} top ${area.top} side ${side}`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(area.bottom - side), `textarea ${size} bottom ${area.bottom} side ${side}`).toBeLessThanOrEqual(FONT_ROUNDING)
    }
  })

  for (const choices of THEMES) {
    test(`pads every surface on all four sides by its gap, plus a quarter of its radius around text, only the wrap gap of the size around rows and like a control in a tooltip (${nameOf(choices)})`, async ({ page }) => {
      await visit(page, PAGE)
      await theme(page, choices)
      const label = nameOf(choices)
      await expectSurface(page.getByTestId('invite-card'), `${label} card`)
      await expectSurface(page.getByTestId('link-card'), `${label} link card`)
      await expectSurface(page.getByTestId('field-card'), `${label} field card`)
      await expectSurface(region(page, 'Alert').getByRole('note').first(), `${label} alert with icon`)
      await expectSurface(region(page, 'Alert').getByRole('status'), `${label} alert`)
      const menu = await opened(page, region(page, 'Menu').getByRole('button', { name: 'Project', exact: true }), page.getByRole('menu'))
      await expectSurface(menu, `${label} menu`, 'controls')
      await closed(page, menu)
      const popover = await opened(page, page.getByRole('button', { name: 'Details', exact: true }), page.getByRole('dialog'))
      await expectSurface(popover, `${label} popover`)
      await closed(page, popover)
      const dialog = await opened(page, page.getByRole('button', { name: 'Rename chapter', exact: true }), page.getByRole('dialog'))
      await expectSurface(dialog, `${label} dialog`)
      await closed(page, dialog)
      const confirm = await opened(page, page.getByRole('button', { name: 'Discard', exact: true }), page.getByRole('alertdialog'))
      await expectSurface(confirm, `${label} confirm`)
      await closed(page, confirm)
      await region(page, 'Tooltip').getByRole('button', { name: 'Save', exact: true }).hover()
      const tooltip = page.locator('[data-variant="tooltip"]')
      await expect(tooltip).toHaveCSS('opacity', '1')
      const tip = await opticalGaps(tooltip)
      expectEven(tip, `${label} tooltip`)
      expect(Math.abs(tip.left - controlSide(tip)), `${label} tooltip side ${tip.left}`).toBeLessThanOrEqual(TOLERANCE)
      await visit(page, OVERLAYS)
      await theme(page, choices)
      await expectSurface(region(page, 'Island'), `${label} island`)
    })
  }

  test('rounds every one-line control, pill and track into a capsule with full corners, also inside a surface, but a check box', async ({ page }) => {
    for (const path of [PAGE, OVERLAYS]) {
      await visit(page, path)
      await theme(page, { corners: 'full', density: 'compact', mode: 'light' })
      const shapes = await page.evaluate(
        (selector) =>
          [...document.querySelectorAll(selector)]
            .filter((element) => element.getBoundingClientRect().width > 0)
            .map((element) => {
              const rect = element.getBoundingClientRect()
              return {
                name: `${element.tagName} ${element.getAttribute('data-variant') ?? ''} ${element.getAttribute('aria-label') ?? element.textContent?.slice(0, 20) ?? ''}`,
                radius: Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
                half: Math.min(rect.width, rect.height) / 2,
              }
            }),
        CAPSULES,
      )
      expect(shapes.length, path).toBeGreaterThan(0)
      expect(shapes.filter((shape) => shape.radius < shape.half - TOLERANCE).map((shape) => `${shape.name}: ${shape.radius} < ${shape.half}`), path).toEqual([])
    }
  })

  test('starts every control of the fields in a card on one line, stretches inputs to one width and ends the group with them', async ({ page }) => {
    await visit(page, PAGE)
    for (const corners of CORNERS) {
      await theme(page, { corners, density: 'compact', mode: 'light' })
      const card = page.getByTestId('field-card')
      const inputs = await Promise.all((await card.locator('[data-component="field"] > [data-recipe="control"]').all()).map(box))
      const group = await box(card.getByRole('radiogroup', { name: 'Quality' }))
      const [first] = inputs
      if (!first) throw new Error('no inputs')
      for (const input of inputs) {
        expect(Math.abs(input.x - first.x), `${corners} input start`).toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs(input.width - first.width), `${corners} input width`).toBeLessThanOrEqual(TOLERANCE)
      }
      expect(Math.abs(group.x + group.width - first.x - first.width), `${corners} group end`).toBeLessThanOrEqual(TOLERANCE)
      expect(group.x, `${corners} group start`).toBeGreaterThanOrEqual(first.x - TOLERANCE)
    }
  })

  for (const corners of CORNERS) {
    test(`pads a card, a popover and a dialog composed of their parts alone evenly at every size, with the actions at the end (${corners})`, async ({ page }) => {
      await visit(page, EDGES)
      const composition = region(page, 'Composition')
      for (const size of COMPOSED_SIZES) {
        const label = `${corners} ${size}`
        const card = composition.getByTestId(`composed-card-${corners}-${size}`)
        await expectSurface(card, `${label} card`)
        expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth), `${label} card overflow`).toBe(true)
        const popover = await opened(page, composition.getByRole('button', { name: `Composed popover ${label}`, exact: true }), page.getByRole('dialog'))
        await expectComposed(popover, `${label} popover`)
        await closed(page, popover)
        await theme(page, { corners, density: 'compact', mode: 'light' })
        await sized(page.locator('html'), size)
        const dialog = await opened(page, composition.getByRole('button', { name: 'Composed dialog', exact: true }), page.getByRole('dialog'))
        await expectComposed(dialog, `${label} dialog`)
        await closed(page, dialog)
      }
    })
  }

  for (const corners of CORNER_CLOSE) {
    test(`puts the close button of a dialog and a popover and the action of a card header in the corner, concentric when tight and with its own radius when roomy, with the title centred on it (${corners})`, async ({ page }) => {
      await visit(page, PAGE)
      await theme(page, { corners, density: 'compact', mode: 'light' })
      const dialog = await opened(page, page.getByRole('button', { name: 'Chapter info', exact: true }), page.getByRole('dialog'))
      await expectCorner(dialog, dialog.getByRole('button', { name: 'Close', exact: true }), dialog.locator('[data-variant="title"]'), `${corners} dialog`)
      await closed(page, dialog)
      const popover = await opened(page, page.getByRole('button', { name: 'Notes', exact: true }), page.getByRole('dialog'))
      await expectCorner(popover, popover.getByRole('button', { name: 'Close', exact: true }), popover.locator('[data-variant="title"]'), `${corners} popover`)
      await closed(page, popover)
      const card = page.getByTestId('export-card')
      await expectCorner(card, card.locator('[data-slot="action"] > [data-recipe="control"]'), card.locator('[data-slot="title"]'), `${corners} card`)
    })
  }
})
