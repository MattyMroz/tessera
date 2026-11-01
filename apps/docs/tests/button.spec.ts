import { TONES } from '@mattymroz/tessera/lib/tone'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, colorOf, raisedShadow, settle, srgbOf, TONE_ROLES, visit } from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const PRESSED_SCALE = '0.97'
const STILL_FRAMES = 60
const STILL_EVERY = 8
const PRESS_HOLD = 250
const VARIANTS = ['solid', 'soft', 'outline', 'raised', 'ghost'] as const
const BLOCKED = ['Busy submit', 'Disabled submit', 'Busy link', 'Disabled link'] as const
const LINK_WAIT = 600
const TOLERANCE = 0.5
const DISABLED_OPACITY = '0.4'
const LONG = 'Export every chapter of this volume as one continuous vertical video'

function variant(page: Page, name: string): Locator {
  return page.getByRole('region', { name: 'Button', exact: true }).getByRole('button', { name, exact: true })
}

function blockedForm(page: Page): Locator {
  return page.getByRole('form', { name: 'Blocked activation', exact: true })
}

function blocked(page: Page, name: string): Locator {
  return blockedForm(page).getByRole(name.endsWith('link') ? 'link' : 'button', { name, exact: true })
}

async function counts(page: Page): Promise<{ clicks: string | null; submits: string | null }> {
  const form = blockedForm(page)
  return { clicks: await form.getByLabel('Clicks', { exact: true }).textContent(), submits: await form.getByLabel('Submits', { exact: true }).textContent() }
}

function edgeButtons(page: Page, container: 'narrow' | 'full'): Locator {
  return page.getByRole('region', { name: 'Button', exact: true }).getByTestId(container)
}

function solid(page: Page): Locator {
  return variant(page, 'solid')
}

test.beforeEach(async ({ page }) => {
  await visit(page, PAGE)
})

test('gives a button with a tone its data-tone and the colours of the tone in every variant', async ({ page }) => {
  for (const tone of TONES) {
    const [fill, text] = TONE_ROLES[tone]
    const expected = {
      fill: await colorOf(page, `var(--ts-color-${fill})`),
      paint: await srgbOf(page, `var(--ts-color-${fill})`),
      text: await colorOf(page, `var(--ts-color-${text})`),
    }
    const looks = await variant(page, tone).evaluateAll((buttons) =>
      buttons.map((button) => ({
        tone: button.getAttribute('data-tone'),
        variant: button.getAttribute('data-variant'),
        background: getComputedStyle(button, '::before').backgroundColor,
        color: getComputedStyle(button).color,
      })),
    )
    expect(looks.map((look) => look.variant), tone).toEqual([...VARIANTS])
    for (const look of looks) {
      const painted = { ...look, background: await srgbOf(page, look.background) }
      const colours = look.variant === 'solid' ? { background: expected.paint, color: expected.text } : { color: expected.fill }
      expect(painted, `${tone} ${look.variant}`).toMatchObject({ tone, ...colours })
    }
  }
})

test('lifts the raised button with the raised shadow of its plate and no outline', async ({ page }) => {
  const shadow = await raisedShadow(page)
  expect(shadow).not.toBe('none')
  const look = await variant(page, 'raised').evaluate((element) => {
    const plate = getComputedStyle(element, '::before')
    return { shadow: plate.boxShadow, border: plate.borderTopColor }
  })
  expect(look).toEqual({ shadow, border: 'rgba(0, 0, 0, 0)' })
  expect(await variant(page, 'ghost').evaluate((element) => getComputedStyle(element, '::before').boxShadow)).toBe('none')
})

test('keeps the raised shadow of the plate under the focus ring of a raised button', async ({ page }) => {
  const shadow = await raisedShadow(page)
  const raised = variant(page, 'raised')
  await variant(page, 'outline').focus()
  await page.keyboard.press('Tab')
  await expect(raised).toBeFocused()
  const look = await raised.evaluate((element) => ({
    outline: getComputedStyle(element).outlineStyle,
    shadow: getComputedStyle(element).boxShadow,
    plate: getComputedStyle(element, '::before').boxShadow,
  }))
  expect(look.outline).toBe('solid')
  expect(look.plate).toBe(shadow)
  expect(look.shadow).not.toContain(shadow)
})

test('replaces the icon of a busy button with the turning spinner in its slot and centres the spinner without an icon', async ({ page }) => {
  const section = page.getByRole('region', { name: 'Button', exact: true })
  const slots = (name: string): Promise<{ slot: string | null; glyph: string; spin: string; opacity: string }[]> =>
    section
      .getByRole('button', { name, exact: true })
      .locator(':scope > [data-slot]')
      .evaluateAll((parts) =>
        parts.map((part) => ({
          slot: part.getAttribute('data-slot'),
          glyph: part.querySelector('svg')?.getAttribute('class') ?? '',
          spin: getComputedStyle(part).animationName,
          opacity: getComputedStyle(part).opacity,
        })),
      )
  const exporting = await slots('Exporting')
  expect(exporting.map(({ slot, spin, opacity }) => ({ slot, spin, opacity }))).toEqual([
    { slot: 'icon', spin: 'ts-spin', opacity: '1' },
    { slot: 'label', spin: 'none', opacity: '1' },
    { slot: 'icon', spin: 'none', opacity: '1' },
  ])
  expect(exporting[0]?.glyph).toContain('lucide-loader-circle')
  expect(exporting[0]?.glyph).not.toContain('lucide-plus')
  expect(exporting[2]?.glyph).toContain('lucide-chevron-down')
  expect((await slots('Loading')).map(({ slot, spin, opacity }) => ({ slot, spin, opacity }))).toEqual([
    { slot: 'busy', spin: 'ts-spin', opacity: '1' },
    { slot: 'label', spin: 'none', opacity: '0' },
  ])
  const glyph = await section
    .getByRole('button', { name: 'Loading', exact: true })
    .locator(':scope > [data-slot="busy"] > svg')
    .evaluate((svg) => ({
      icon: svg.classList.contains('lucide-loader-circle'),
      viewBox: svg.getAttribute('viewBox'),
      hidden: svg.getAttribute('aria-hidden'),
      stroke: Number.parseFloat(getComputedStyle(svg).strokeWidth),
      engine: Number.parseFloat(getComputedStyle(svg).getPropertyValue('--ts-size-icon-stroke')),
    }))
  expect({ icon: glyph.icon, viewBox: glyph.viewBox, hidden: glyph.hidden }).toEqual({ icon: true, viewBox: '0 0 24 24', hidden: 'true' })
  expect(glyph.engine).toBeGreaterThan(0)
  expect(glyph.stroke).toBeCloseTo(glyph.engine, 3)
})

test('presses a button while the pointer is down', async ({ page }) => {
  const button = solid(page)
  await button.hover()
  await page.mouse.down()
  await expect(button).toHaveAttribute('data-pressing', '')
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element, '::before').scale)).toBe(PRESSED_SCALE)
  expect(await button.evaluate((element) => getComputedStyle(element).scale)).toBe('none')
  await page.mouse.up()
  await expect(button).not.toHaveAttribute('data-pressing')
})

test('presses only the plate of a control, so no control, anchor or ancestor of an anchor is ever transformed', async ({ page }) => {
  for (const path of [PAGE, EDGES, '/screens/overlays']) {
    await visit(page, path)
    const found = await page.evaluate(() => {
      const controls = [...document.querySelectorAll('[data-recipe="control"]')]
      for (const control of controls) control.setAttribute('data-pressing', '')
      const moved = [...document.querySelectorAll('*')].filter((element) => {
        const style = getComputedStyle(element)
        return style.scale !== 'none' || style.transform !== 'none'
      })
      const pressed = controls.filter((control) => getComputedStyle(control, '::before').scale !== 'none').length
      const anchors = controls.filter((control) => control.matches('[aria-haspopup], [aria-expanded], [data-popup-open]')).length
      for (const control of controls) control.removeAttribute('data-pressing')
      return {
        pressed,
        anchors,
        moved: moved
          .filter((element) => element.matches('[data-recipe="control"]') || element.querySelector('[data-recipe="control"]') !== null)
          .map((element) => element.outerHTML.slice(0, 80)),
      }
    })
    expect(found.pressed, path).toBeGreaterThan(0)
    expect(found.anchors, path).toBeGreaterThan(0)
    expect(found.moved, path).toEqual([])
  }
})

test('keeps a popup and its trigger still before, while and after the trigger is pressed', async ({ page }) => {
  const still = async (name: string, trigger: Locator, popup: Locator, open: () => Promise<void>): Promise<void> => {
    await open()
    await expect(popup).toBeVisible()
    await settle(page)
    await trigger.evaluate((element) => element.setAttribute('data-still-trigger', ''))
    await popup.evaluate((element) => element.setAttribute('data-still-popup', ''))
    await page.evaluate(
      ({ count, every }) => {
        const rect = (selector: string): string => {
          const found = document.querySelector(selector)?.getBoundingClientRect()
          return found ? [found.x, found.y, found.width, found.height].map((value) => value.toFixed(2)).join(' ') : ''
        }
        const frames: { trigger: string; popup: string; animations: number }[] = []
        Object.assign(window, { stillFrames: frames })
        const timer = setInterval(() => {
          frames.push({
            trigger: rect('[data-still-trigger]'),
            popup: rect('[data-still-popup]'),
            animations: document.querySelector('[data-still-popup]')?.getAnimations({ subtree: true }).length ?? 0,
          })
          if (frames.length >= count) clearInterval(timer)
        }, every)
      },
      { count: STILL_FRAMES, every: STILL_EVERY },
    )
    const target = await box(trigger)
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(PRESS_HOLD)
    await page.mouse.up()
    const framesOf = (): Promise<{ trigger: string; popup: string; animations: number }[]> =>
      page.evaluate(() => (window as unknown as { stillFrames: { trigger: string; popup: string; animations: number }[] }).stillFrames)
    await expect.poll(async () => (await framesOf()).length).toBe(STILL_FRAMES)
    const frames = await framesOf()
    const shown = frames.filter((frame) => frame.popup !== '')
    expect(shown.length, name).toBeGreaterThan(0)
    expect(new Set(frames.map((frame) => frame.trigger)).size, `${name} trigger`).toBe(1)
    expect(new Set(shown.map((frame) => frame.popup)).size, `${name} popup`).toBe(1)
    expect(shown.filter((frame) => frame.animations > 0), `${name} animations`).toEqual([])
    await trigger.evaluate((element) => element.removeAttribute('data-still-trigger'))
    await page.keyboard.press('Escape')
    await page.mouse.move(0, 0)
  }
  const menuTrigger = page.getByRole('region', { name: 'Menu', exact: true }).getByRole('button', { name: 'Project', exact: true })
  await still('menu', menuTrigger, page.getByRole('menu'), () => menuTrigger.click())
  const popoverTrigger = page.getByRole('button', { name: 'Details', exact: true })
  await still('popover', popoverTrigger, page.getByRole('dialog'), () => popoverTrigger.click())
  const panelTrigger = page.getByRole('button', { name: /^corners / })
  await still('menu of the trigger width', panelTrigger, page.getByRole('menu'), () => panelTrigger.click())
  const tooltipTrigger = page.getByRole('region', { name: 'Tooltip', exact: true }).getByRole('button', { name: 'Save', exact: true })
  await still('tooltip', tooltipTrigger, page.locator('[data-variant="tooltip"]'), () => tooltipTrigger.hover())
  await menuTrigger.click()
  const exportRow = page.getByRole('menu').getByRole('menuitem', { name: 'Export', exact: true })
  await still('submenu', exportRow, page.getByRole('menu').nth(1), () => exportRow.hover())
})

test('shows the cursor of the platform on controls and rows, the default one on disabled parts and a text cursor on fields', async ({ page }) => {
  const options = page.getByRole('radiogroup', { name: 'With a disabled option', exact: true })
  await page.getByRole('region', { name: 'Menu', exact: true }).getByRole('button', { name: 'Project', exact: true }).click()
  const menu = page.getByRole('menu').first()
  const rows = menu.locator('[role^="menuitem"]')
  const parts = {
    button: solid(page),
    option: options.getByRole('radio', { name: 'Day' }),
    row: rows.filter({ hasText: 'Open' }),
    disabledOption: options.getByRole('radio', { name: 'Week' }),
    disabledRow: rows.filter({ hasText: 'Revert' }),
    field: page.getByRole('textbox', { name: 'Name', exact: true }).locator('..'),
  }
  const cursors = async (): Promise<Record<string, string>> => {
    const found: Record<string, string> = {}
    for (const [name, part] of Object.entries(parts)) found[name] = await part.evaluate((element) => getComputedStyle(element).cursor)
    return found
  }
  for (const [platform, cursor] of [['desktop', 'default'], ['web', 'pointer']] as const) {
    await page.evaluate((value) => document.documentElement.setAttribute('data-platform', value), platform)
    expect(await cursors(), platform).toEqual({
      button: cursor,
      option: cursor,
      row: cursor,
      disabledOption: 'default',
      disabledRow: 'default',
      field: 'text',
    })
  }
})

test('holds a short click pressed until the fast duration has passed', async ({ page }) => {
  const button = solid(page)
  const pressedAfterRelease = await button.evaluate((element) => {
    element.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
    window.dispatchEvent(new PointerEvent('pointerup', { button: 0 }))
    return element.hasAttribute('data-pressing')
  })
  expect(pressedAfterRelease).toBe(true)
  await expect(button).not.toHaveAttribute('data-pressing')
})

test('keeps a busy or aria-disabled button and link in the Tab order and lets no click, key or submit through', async ({ page, browserName }) => {
  const field = blockedForm(page).getByRole('textbox', { name: 'Chapter title', exact: true })
  await field.focus()
  for (const name of BLOCKED) {
    if (browserName === 'webkit' && name.endsWith('link')) await blocked(page, name).focus()
    else await page.keyboard.press('Tab')
    await expect(blocked(page, name), name).toBeFocused()
    await page.keyboard.press('Enter')
    if (!name.endsWith('link')) await page.keyboard.press('Space')
    await blocked(page, name).click({ force: true })
  }
  await field.focus()
  await page.keyboard.press('Enter')
  expect(await counts(page)).toEqual({ clicks: '0', submits: '0' })
  expect(new URL(page.url()).hash).toBe('')
  await blockedForm(page).getByRole('button', { name: 'Submit', exact: true }).click()
  expect(await counts(page)).toEqual({ clicks: '1', submits: '1' })
})

test('opens no tab for a middle click on a blocked link', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'only headless Chromium opens a middle-clicked link in a new page')
  const opened: string[] = []
  page.context().on('page', (next) => opened.push(next.url()))
  await blocked(page, 'Busy link').click({ button: 'middle' })
  await blocked(page, 'Disabled link').click({ button: 'middle', force: true })
  await page.waitForTimeout(LINK_WAIT)
  expect(opened).toEqual([])
  await page.getByRole('navigation', { name: 'Button links', exact: true }).getByRole('link', { name: 'Get started', exact: true }).click({ button: 'middle' })
  await expect.poll(() => opened.length).toBe(1)
})

test('dims an aria-disabled button but not a busy one, and neither presses nor scales them', async ({ page }) => {
  expect(await blocked(page, 'Disabled submit').evaluate((element) => getComputedStyle(element).opacity)).toBe(DISABLED_OPACITY)
  expect(await blocked(page, 'Busy submit').evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  for (const name of ['Busy submit', 'Disabled submit'] as const) {
    const button = blocked(page, name)
    await button.hover()
    await page.mouse.down()
    await expect(button).toHaveAttribute('data-pressing', '')
    expect(await button.evaluate((element) => getComputedStyle(element, '::before').scale), name).toBe('none')
    await page.mouse.up()
  }
})

test('keeps the width of a busy button and turns a spinner in place of its icon', async ({ page }) => {
  const form = blockedForm(page)
  const upload = form.getByRole('button', { name: 'Upload', exact: true })
  const chapter = form.getByRole('button', { name: 'Upload chapter', exact: true })
  const before = await Promise.all([box(upload), box(chapter)])
  await form.getByRole('button', { name: 'Work', exact: true }).click()
  await expect(chapter).toHaveAttribute('aria-busy', 'true')
  const after = await Promise.all([box(upload), box(chapter)])
  for (const [index, rect] of after.entries()) {
    expect(Math.abs(rect.width - (before[index]?.width ?? 0)), `button ${index}`).toBeLessThanOrEqual(TOLERANCE)
  }
  const glyphs = await upload.locator(':scope > [data-slot="icon"] > svg').evaluateAll((svgs) => svgs.map((svg) => svg.getAttribute('class') ?? ''))
  expect(glyphs).toHaveLength(1)
  expect(glyphs[0]).toContain('lucide-loader-circle')
  const [spinner, button] = await Promise.all([box(chapter.locator(':scope > [data-slot="busy"]')), box(chapter)])
  expect(Math.abs(spinner.x + spinner.width / 2 - (button.x + button.width / 2))).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(spinner.y + spinner.height / 2 - (button.y + button.height / 2))).toBeLessThanOrEqual(TOLERANCE)
  await form.getByRole('button', { name: 'Work', exact: true }).click()
  await expect(upload.locator(':scope > [data-slot="icon"] > svg.lucide-upload')).toHaveCount(1)
})

test('renders a link as an anchor with its href and no type, with the pointer cursor on every platform', async ({ page }) => {
  const links = page.getByRole('navigation', { name: 'Button links', exact: true })
  const started = links.getByRole('link', { name: 'Get started', exact: true })
  await expect(started).toHaveAttribute('href', '#button-title')
  expect(await started.evaluate((element) => ({ tag: element.localName, type: element.getAttribute('type'), recipe: element.getAttribute('data-recipe') }))).toEqual({
    tag: 'a',
    type: null,
    recipe: 'control',
  })
  await expect(page.getByRole('region', { name: 'Button', exact: true }).getByRole('button', { name: 'Get started' })).toHaveCount(0)
  for (const platform of ['desktop', 'web'] as const) {
    await page.evaluate((value) => document.documentElement.setAttribute('data-platform', value), platform)
    const cursors = await links.getByRole('link').evaluateAll((anchors) => anchors.map((anchor) => getComputedStyle(anchor).cursor))
    expect(cursors, platform).toEqual(['pointer', 'pointer', 'pointer'])
  }
  await started.hover()
  await page.mouse.down({ button: 'middle' })
  await expect(started).not.toHaveAttribute('data-pressing')
  await page.mouse.up({ button: 'middle' })
})

test('navigates a link with the anchor component of the framework without reloading the page', async ({ page }) => {
  await page.evaluate(() => document.documentElement.setAttribute('data-lab-before-navigation', ''))
  await page.getByRole('navigation', { name: 'Button links', exact: true }).getByRole('link', { name: 'Edges screen', exact: true }).click()
  await expect(page).toHaveURL(/\/screens\/edges$/)
  await expect(page.getByRole('heading', { name: 'Edges', level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-lab-before-navigation', '')
})

test('draws the focus ring of a button with a tone other than the accent without the neon glow', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-neon', 'mini')
    document.documentElement.setAttribute('data-accent', 'violet')
  })
  const glow = await colorOf(page, 'var(--ts-color-glow)')
  const ring = async (tone: string): Promise<string> => {
    const button = variant(page, tone).first()
    await expect(button).toBeFocused()
    return button.evaluate((element) => getComputedStyle(element).boxShadow)
  }
  await variant(page, 'neutral').first().focus()
  await page.keyboard.press('Tab')
  expect(await ring('accent')).toContain(glow)
  await page.keyboard.press('Tab')
  expect(await ring('danger')).not.toContain(glow)
})

test('names a cut label with a title on hover and focus, never over a title of the consumer or a tooltip, and drops it when the label fits', async ({ page }) => {
  await visit(page, EDGES)
  const narrow = edgeButtons(page, 'narrow')
  const cut = narrow.getByRole('button', { name: LONG, exact: true })
  const plain = cut.and(narrow.locator('[data-variant="outline"]:not([title="Own title"])'))
  await plain.hover()
  await expect(plain).toHaveAttribute('title', LONG)
  const link = narrow.getByRole('link', { name: LONG, exact: true })
  await link.focus()
  await expect(link).toHaveAttribute('title', LONG)
  const own = narrow.locator('[title="Own title"]')
  await own.hover()
  await expect(own).toHaveAttribute('title', 'Own title')
  const tipped = cut.and(narrow.locator('[data-variant="soft"]:not([aria-busy])'))
  await tipped.hover()
  await expect(page.locator('[data-variant="tooltip"]')).toBeVisible()
  await expect(tipped).not.toHaveAttribute('title')
  const short = edgeButtons(page, 'full').getByRole('button', { name: 'A', exact: true })
  await short.hover()
  await expect(short).not.toHaveAttribute('title')
  await narrow.evaluate((element) => element.style.setProperty('width', 'max-content'))
  await plain.hover()
  await expect(plain).not.toHaveAttribute('title')
})
