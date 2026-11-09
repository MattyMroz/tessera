import { expect, test, type Locator, type Page } from '@playwright/test'
import { colorOf, contrast, edgeContext, MIN_CONTRAST, visit } from './helpers'

const PAGE = '/components'
const TOLERANCE = 0.5
const TRANSPARENT = 'rgba(0, 0, 0, 0)'

function section(page: Page): Locator {
  return page.getByRole('region', { name: 'Alert', exact: true })
}

test.describe('on the components page', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, PAGE)
  })

  test('takes the role from the list with alert by default and shows no title slot without a title', async ({ page }) => {
    const scope = section(page)
    await expect(scope.getByRole('alert')).toHaveCount(1)
    await expect(scope.getByRole('status')).toHaveCount(1)
    await expect(scope.getByRole('note')).toHaveCount(6)
    const untitled = scope.getByRole('alert')
    await expect(untitled.locator('[data-slot="title"]')).toHaveCount(0)
    await expect(untitled.locator('[data-slot="description"]')).toHaveText('Enter a valid URL, for example http://127.0.0.1:8721.')
  })

  test('paints the tone in the background and the icon, with no border, no side line and no inset shadow', async ({ page }) => {
    const danger = section(page).getByRole('alert')
    const plain = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.dataset.recipe = 'surface'
      document.body.append(probe)
      const background = getComputedStyle(probe).backgroundColor
      probe.remove()
      return background
    })
    const look = await danger.evaluate((element) => {
      const style = getComputedStyle(element)
      const icon = element.querySelector('[data-slot="icon"]')
      return {
        borders: ['top', 'right', 'bottom', 'left'].map((side) => style.getPropertyValue(`border-${side}-color`)),
        shadow: style.boxShadow,
        background: style.backgroundColor,
        icon: icon ? getComputedStyle(icon).color : null,
      }
    })
    expect(look.borders).toEqual([TRANSPARENT, TRANSPARENT, TRANSPARENT, TRANSPARENT])
    expect(look.shadow).not.toContain('inset')
    expect(look.background).not.toBe(plain)
    expect(look.icon).toBe(await colorOf(page, 'var(--ts-color-danger)'))
  })

  test('pads the alert on every side by more than the card-small gap of the density', async ({ page }) => {
    const look = await section(page)
      .getByRole('alert')
      .evaluate((element) => {
        const probe = document.createElement('div')
        probe.style.width = 'var(--ts-space-card-small)'
        document.body.append(probe)
        const gap = probe.getBoundingClientRect().width
        probe.remove()
        const style = getComputedStyle(element)
        return { gap, sides: ['top', 'right', 'bottom', 'left'].map((side) => Number.parseFloat(style.getPropertyValue(`padding-${side}`))) }
      })
    const [first] = look.sides
    expect(look.gap).toBeGreaterThan(0)
    for (const side of look.sides) {
      expect(side).toBeGreaterThan(look.gap)
      expect(Math.abs(side - (first ?? 0))).toBeLessThanOrEqual(TOLERANCE)
    }
  })

  test('sizes the glyph like an icon and centres it on the capitals of the first line of text', async ({ page }) => {
    for (const alert of [section(page).getByRole('alert'), section(page).getByRole('note').first()]) {
      const place = await alert.evaluate((element) => {
        const slot = element.querySelector('[data-slot="icon"]')
        const glyph = slot?.querySelector('svg')
        const text = element.querySelector('[data-slot="title"], [data-slot="description"]')
        if (!slot || !glyph || !text) throw new Error('no parts')
        const probe = document.createElement('div')
        probe.style.width = 'var(--ts-size-icon)'
        element.append(probe)
        const icon = probe.getBoundingClientRect().width
        probe.remove()
        const capProbe = document.createElement('div')
        capProbe.style.height = '1cap'
        text.append(capProbe)
        const cap = capProbe.getBoundingClientRect().height
        capProbe.remove()
        const glyphRect = glyph.getBoundingClientRect()
        const textRect = text.getBoundingClientRect()
        return { icon, width: glyphRect.width, height: glyphRect.height, glyphMiddle: glyphRect.top + glyphRect.height / 2, lineMiddle: textRect.top + cap / 2 }
      })
      expect(Math.abs(place.width - place.icon)).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(place.height - place.icon)).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(place.glyphMiddle - place.lineMiddle)).toBeLessThanOrEqual(TOLERANCE)
    }
  })
})

test.describe('in forced colors', () => {
  test.use(edgeContext({ media: 'forced colors' }))

  test('keeps the text readable and draws the border the browser forces', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit does not force colors, see docs/structure.md')
    await visit(page, PAGE)
    const danger = section(page).getByRole('alert')
    const look = await danger.evaluate((element) => ({
      text: getComputedStyle(element.querySelector('[data-slot="description"]') ?? element).color,
      background: getComputedStyle(element).backgroundColor,
      border: getComputedStyle(element).borderTopColor,
    }))
    expect(look.border).not.toBe(TRANSPARENT)
    expect(look.text).toMatch(/^rgb\(/)
    expect(look.background).toMatch(/^rgb\(/)
    expect(contrast(look.text, look.background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
