import { expect, test, type Locator, type Page } from '@playwright/test'
import { hydrated, PRESS_GROUPS, settle } from './helpers'

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

type Target = { readonly name: string; readonly clip: Box; readonly label: Box | null; readonly glyphs: Box | null; readonly icons: readonly Box[] }

type Difference = { readonly part: string; readonly value: number; readonly limit: number; readonly unit: string }

const PAGE = '/components'
const RATIOS: readonly number[] = [1, 1.25, 1.5, 2]
const WINDOW = { width: 1280, height: 900 }
const SAMPLES: readonly { readonly section: string; readonly group: 'scale' | 'anchor'; readonly count: number }[] = [
  { section: 'button-title', group: 'scale', count: 10 },
  { section: 'button-group-title', group: 'scale', count: 12 },
  { section: 'menu-title', group: 'anchor', count: 2 },
  { section: 'tooltip-title', group: 'anchor', count: 2 },
]
const MARGIN = 3
const PART_MARGIN = 1.5
const GLYPH_MARGIN = 3
const ICON_SHIFT = 0.1
const LABEL_SHIFT = 0.45
const PLATE_CHANGED = 4
const CHANNEL_STEP = 32
const BUCKET = 4
const NOISE = 8
const HALF = 0.5
const LAYER_RULES =
  "[data-jump-probe='scale'] { will-change: scale; } [data-jump-probe='anchor'] > [data-slot='icon'], [data-jump-probe='anchor'] > [data-slot='label'], [data-jump-probe='anchor']::before { will-change: scale; }"

function measure(element: Locator): Promise<Target> {
  return element.evaluate(
    (node, { margin, partMargin, glyphMargin }) => {
      const grown = (rect: DOMRect, by: number): Box => ({ x: rect.x - by, y: rect.y - by, width: rect.width + by + by, height: rect.height + by + by })
      const label = node.querySelector(":scope > [data-slot='label']")
      return {
        name: (node.getAttribute('aria-label') ?? node.textContent ?? '').trim().slice(0, 20),
        clip: grown(node.getBoundingClientRect(), margin),
        label: label ? grown(label.getBoundingClientRect(), partMargin) : null,
        glyphs: label ? grown(label.getBoundingClientRect(), glyphMargin) : null,
        icons: [...node.querySelectorAll(":scope > [data-slot='icon']")].map((icon) => grown(icon.getBoundingClientRect(), partMargin)),
      }
    },
    { margin: MARGIN, partMargin: PART_MARGIN, glyphMargin: GLYPH_MARGIN },
  )
}

function differences(page: Page, rest: Buffer, layered: Buffer, target: Target, ratio: number): Promise<Difference[]> {
  return page.evaluate(
    async ({ rest, layered, target, ratio, limits, bucket, noise, half, step }) => {
      const load = async (data: string): Promise<ImageData> => {
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('no canvas')
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, image.width, image.height)
      }
      const [one, two] = await Promise.all([load(rest), load(layered)])
      const inside = (box: Box | null, x: number, y: number): boolean =>
        box !== null &&
        x >= (box.x - target.clip.x) * ratio &&
        x < (box.x - target.clip.x + box.width) * ratio &&
        y >= (box.y - target.clip.y) * ratio &&
        y < (box.y - target.clip.y + box.height) * ratio
      const lightness = (image: ImageData, at: number): number => 0.2126 * (image.data[at] ?? 0) + 0.7152 * (image.data[at + 1] ?? 0) + 0.0722 * (image.data[at + 2] ?? 0)
      const centroid = (image: ImageData, box: Box): { x: number; y: number } | null => {
        const light: { x: number; y: number; value: number }[] = []
        for (let y = 0; y < image.height; y++) {
          for (let x = 0; x < image.width; x++) if (inside(box, x, y)) light.push({ x, y, value: lightness(image, (y * image.width + x) * 4) })
        }
        const tally = new Map<number, number>()
        for (const { value } of light) tally.set(Math.round(value / bucket), (tally.get(Math.round(value / bucket)) ?? 0) + 1)
        const ground = ([...tally].sort((first, second) => second[1] - first[1])[0]?.[0] ?? 0) * bucket
        let sum = 0
        let sumX = 0
        let sumY = 0
        for (const { x, y, value } of light) {
          const weight = Math.max(0, Math.abs(value - ground) - noise)
          sum += weight
          sumX += weight * (x + half)
          sumY += weight * (y + half)
        }
        return sum === 0 ? null : { x: sumX / sum / ratio, y: sumY / sum / ratio }
      }
      const shift = (box: Box): number => {
        const before = centroid(one, box)
        const after = centroid(two, box)
        return before && after ? Math.hypot(after.x - before.x, after.y - before.y) : 0
      }
      let changed = 0
      for (let y = 0; y < one.height; y++) {
        for (let x = 0; x < one.width; x++) {
          if (inside(target.glyphs, x, y) || target.icons.some((icon) => inside(icon, x, y))) continue
          const at = (y * one.width + x) * 4
          const delta = Math.max(...[0, 1, 2].map((channel) => Math.abs((one.data[at + channel] ?? 0) - (two.data[at + channel] ?? 0))))
          if (delta > step) changed++
        }
      }
      return [
        { part: 'plate', value: changed, limit: limits.plate, unit: 'changed pixels' },
        ...target.icons.map((icon, index) => ({ part: `icon ${index}`, value: shift(icon), limit: limits.icon, unit: 'px' })),
        ...(target.label ? [{ part: 'label', value: shift(target.label), limit: limits.label, unit: 'px' }] : []),
      ]
    },
    {
      rest: rest.toString('base64'),
      layered: layered.toString('base64'),
      target,
      ratio,
      limits: { plate: PLATE_CHANGED, icon: ICON_SHIFT, label: LABEL_SHIFT },
      bucket: BUCKET,
      noise: NOISE,
      half: HALF,
      step: CHANNEL_STEP,
    },
  )
}

test('draws every pressable button and anchor at rest as in the first frame of its press at real device scales', async ({ playwright, baseURL }) => {
  test.skip(process.platform !== 'win32', 'Chromium outside Windows keeps glyphs in a layer on half pixels; docs/decisions/e3-motion.md, point 24')
  const problems: string[] = []
  let measured = 0
  for (const ratio of RATIOS) {
    const browser = await playwright.chromium.launch({ args: [`--force-device-scale-factor=${ratio}`, `--window-size=${WINDOW.width},${WINDOW.height}`] })
    const page = await browser.newPage()
    await page.goto(`${baseURL ?? ''}${PAGE}`)
    await hydrated(page)
    await page.addStyleTag({ content: LAYER_RULES })
    expect(await page.evaluate(() => devicePixelRatio)).toBe(ratio)
    await page.mouse.move(0, 0)
    for (const { section, group, count } of SAMPLES) {
      const found = page.locator(`main section[aria-labelledby='${section}'] ${PRESS_GROUPS[group]}`).filter({ visible: true })
      for (let index = 0; index < Math.min(count, await found.count()); index++) {
        const element = found.nth(index)
        await element.scrollIntoViewIfNeeded()
        await settle(page)
        const target = await measure(element)
        const rest = await page.screenshot({ clip: target.clip, animations: 'allow', caret: 'hide' })
        await element.evaluate((node, value) => node.setAttribute('data-jump-probe', value), group)
        await settle(page)
        const layered = await page.screenshot({ clip: target.clip, animations: 'allow', caret: 'hide' })
        await element.evaluate((node) => node.removeAttribute('data-jump-probe'))
        for (const { part, value, limit, unit } of await differences(page, rest, layered, target, ratio)) {
          if (value > limit) problems.push(`DSF ${ratio} ${group} "${target.name}" ${part}: ${value.toFixed(3)} ${unit}`)
        }
        measured++
      }
    }
    await browser.close()
  }
  expect(measured).toBeGreaterThan(0)
  expect(problems).toEqual([])
})
