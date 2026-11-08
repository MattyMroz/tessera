import type { Axis, Choices } from '@mattymroz/tessera/lib/theme'
import type { Tone } from '@mattymroz/tessera/lib/tone'
import { expect, type BrowserContextOptions, type CDPSession, type Locator, type Page } from '@playwright/test'

export type TraceEvent = {
  readonly name?: string
  readonly cat?: string
  readonly ph?: string
  readonly ts?: number
  readonly id?: string
  readonly id2?: { readonly local?: string }
  readonly args?: { readonly data?: { readonly compositeFailed?: number; readonly unsupportedProperties?: readonly string[]; readonly nodeName?: string; readonly displayName?: string } }
}

export type RecordedAnimation = {
  readonly role: string | null
  readonly variant: string | null
  readonly recipe: string | null
  readonly plate: boolean
  readonly duration: number | null
  readonly easing: string | null
  readonly properties: readonly string[]
}

export type CommittedRender = {
  readonly area: 'panel' | 'page' | 'detached'
  readonly host: Element | null
}

declare global {
  interface Window {
    recordedAnimations?: RecordedAnimation[]
    labRenders?: CommittedRender[]
    labCommits?: number
    settledFrames?: number
  }
}

export const COMPOSITOR_PROPERTIES: readonly string[] = ['transform', 'opacity', 'scale', 'translate', 'rotate']

const TRACE_CATEGORIES = 'blink.animations,devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame'
const FRAME_START = 'BeginMainThreadFrame'
const RENDER_WORK: ReadonlySet<string> = new Set(['Layout', 'Paint'])
export const STRESS = '/stress'
export const MOTION_HOLD = 'data-motion-hold'
const ROW = '[role^="menuitem"]'
const MOVE_STEPS = 4
const INDICATOR = '[data-recipe="indicator"]'
const CHANNEL_MAX = 255
const SRGB_KNEE = 0.04045
const SRGB_SLOPE = 12.92
const SRGB_OFFSET = 0.055
const SRGB_GAMMA = 2.4
const LUMA_RED = 0.2126
const LUMA_GREEN = 0.7152
const LUMA_BLUE = 0.0722
const CONTRAST_FLARE = 0.05

export const MIN_CONTRAST = 4.5

export const INTERACTIVE_CONTROL =
  ":where(button, a[href], input, select, textarea, [role='button'], [role='radio'], [role='tab'], [role='menuitem'], [tabindex], :has(> [data-slot='input']))"

export const TONE_ROLES: Readonly<Record<Tone, readonly [string, string]>> = {
  neutral: ['label', 'inverse-label'],
  accent: ['tint', 'on-tint'],
  danger: ['danger', 'on-danger'],
  success: ['success', 'on-success'],
  warning: ['warning', 'on-warning'],
  info: ['info', 'on-info'],
}

export async function hydrated(page: Page): Promise<void> {
  const main = page.locator('main')
  const scope = (await main.locator(INDICATOR).count()) > 0 ? main : page.getByRole('complementary', { name: 'Theme' })
  await scope.locator(`${INDICATOR}[data-visible="true"]`).first().waitFor({ state: 'attached' })
  await expect(page.locator('html')).not.toHaveAttribute(MOTION_HOLD)
}

export async function visit(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await hydrated(page)
}

export async function mountStress(page: Page): Promise<void> {
  await visit(page, STRESS)
  await page.getByRole('button', { name: 'Mount scene', exact: true }).click()
  await page.getByRole('region', { name: 'Rows', exact: true }).waitFor()
}

export async function choose<A extends Axis>(page: Page, axis: A, value: Choices[A]): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${axis} `) }).click()
  await page.getByRole('menuitemcheckbox', { name: value, exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute(`data-${axis}`, value)
  await expect(page.locator('html')).not.toHaveAttribute(MOTION_HOLD)
}

export function colorOf(page: Page, value: string): Promise<string> {
  return page.evaluate((color) => {
    const probe = document.createElement('span')
    probe.style.color = color
    document.body.append(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    return computed
  }, value)
}

export function alphaOf(color: string): number {
  const alpha = /\/\s*([\d.]+)\)$/.exec(color)?.[1] ?? /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/.exec(color)?.[1]
  return alpha === undefined ? 1 : Number.parseFloat(alpha)
}

export function paintOf(target: Locator): Promise<{ background: string; border: string; shadow: string }> {
  return target.evaluate((element) => {
    const style = getComputedStyle(element, element.matches('[data-recipe="control"]') ? '::before' : null)
    return { background: style.backgroundColor, border: style.borderTopColor, shadow: style.boxShadow }
  })
}

export async function stateStep(target: Locator): Promise<number> {
  return alphaOf((await paintOf(target)).background)
}

export function srgbOf(page: Page, value: string): Promise<string> {
  return page.evaluate((color) => {
    const probe = document.createElement('span')
    probe.style.color = color
    document.body.append(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    const context = document.createElement('canvas').getContext('2d')
    if (!context) throw new Error('no canvas')
    context.fillStyle = resolved
    context.fillRect(0, 0, 1, 1)
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data
    return `rgb(${red}, ${green}, ${blue})`
  }, value)
}

function luminance(color: string): number {
  const channels = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((value) => Number(value) / CHANNEL_MAX)
  const [red = 0, green = 0, blue = 0] = channels.map((value) => (value <= SRGB_KNEE ? value / SRGB_SLOPE : ((value + SRGB_OFFSET) / (1 + SRGB_OFFSET)) ** SRGB_GAMMA))
  return LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue
}

export function contrast(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].toSorted((a, b) => b - a)
  return ((light ?? 0) + CONTRAST_FLARE) / ((dark ?? 0) + CONTRAST_FLARE)
}

export type Pixel = readonly [number, number, number]

export async function pixels(page: Page, points: readonly { readonly x: number; readonly y: number }[]): Promise<Pixel[]> {
  const shot = await page.screenshot({ animations: 'disabled' })
  return page.evaluate(
    async ({ data, at }) => {
      const image = new Image()
      image.src = `data:image/png;base64,${data}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('no canvas')
      context.drawImage(image, 0, 0)
      const scale = image.width / innerWidth
      return at.map(({ x, y }) => {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) throw new Error(`pixel ${x}, ${y} outside the window`)
        const [red = 0, green = 0, blue = 0] = context.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data
        return [red, green, blue] as const
      })
    },
    { data: shot.toString('base64'), at: points },
  )
}

const OKLAB_LMS: readonly (readonly [number, number, number])[] = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
]
const OKLAB_LIGHTNESS: readonly [number, number, number] = [0.2104542553, 0.793617779, -0.0040720468]

export function lightness(pixel: Pixel): number {
  const linear = pixel.map((channel) => {
    const value = channel / CHANNEL_MAX
    return value <= SRGB_KNEE ? value / SRGB_SLOPE : ((value + SRGB_OFFSET) / (1 + SRGB_OFFSET)) ** SRGB_GAMMA
  })
  const cone = OKLAB_LMS.map((row) => Math.cbrt(row.reduce((sum, weight, index) => sum + weight * (linear[index] ?? 0), 0)))
  return OKLAB_LIGHTNESS.reduce((sum, weight, index) => sum + weight * (cone[index] ?? 0), 0)
}

export function pageScroll(page: Page): Promise<{ scroll: number; client: number }> {
  return page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
}

export async function startTrace(page: Page): Promise<{ stop: () => Promise<TraceEvent[]> }> {
  const cdp = await page.context().newCDPSession(page)
  const events: TraceEvent[] = []
  cdp.on('Tracing.dataCollected', ({ value }) => events.push(...(value as TraceEvent[])))
  await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES, transferMode: 'ReportEvents' })
  return {
    stop: async () => {
      const complete = new Promise<void>((resolve) => cdp.once('Tracing.tracingComplete', () => resolve()))
      await cdp.send('Tracing.end')
      await complete
      return events
    },
  }
}

export type MotionWork = { readonly animations: number; readonly work: readonly string[]; readonly events: readonly TraceEvent[] }

export type FadeSpan = { readonly begin: number; readonly end: number }

function motionFrames(events: readonly TraceEvent[]): {
  animations: number
  frameOf: (ts: number) => number | undefined
  inner: ReadonlySet<number>
  fades: readonly FadeSpan[]
} {
  const frames = events.flatMap((event) => (event.name === FRAME_START && event.ts !== undefined ? [event.ts] : [])).sort((a, b) => a - b)
  const frameOf = (ts: number): number | undefined => frames.findLast((frame) => frame <= ts) ?? frames[0]
  const open = new Map<string, { begin: number; running?: number; fade: boolean }>()
  const spans: { readonly begin: number; readonly running: number; readonly end: number }[] = []
  const fades: FadeSpan[] = []
  for (const event of events.filter((found) => found.name === 'Animation').toSorted((a, b) => (a.ts ?? 0) - (b.ts ?? 0))) {
    if (event.ts === undefined) continue
    const key = event.id2?.local ?? event.id ?? ''
    const span = open.get(key)
    if (event.ph === 'b') open.set(key, { begin: event.ts, fade: event.args?.data?.displayName === HOVER_EXIT_PROPERTY })
    if (event.ph === 'n' && span && span.running === undefined && event.ts > span.begin) span.running = event.ts
    if (event.ph === 'e' && span) {
      spans.push({ begin: span.begin, running: span.running ?? span.begin, end: event.ts })
      if (span.fade) fades.push({ begin: span.begin, end: event.ts })
      open.delete(key)
    }
  }
  const bounds = spans.flatMap(({ begin, running, end }) => {
    const start = frameOf(begin)
    const last = frameOf(end)
    if (start === undefined || last === undefined) return []
    const first = frames.find((frame) => frame > start && frame >= running)
    const settled = frames[frames.indexOf(last) - 1]
    return first !== undefined && settled !== undefined ? [[start, first, settled, last] as const] : []
  })
  const edges = new Set(bounds.flat())
  const inner = new Set(frames.filter((frame) => !edges.has(frame) && bounds.some(([, first, , last]) => frame > first && frame < last)))
  return { animations: spans.length + open.size, frameOf, inner, fades }
}

export async function motionWork(page: Page, action: () => Promise<unknown>): Promise<MotionWork> {
  await settle(page)
  const trace = await startTrace(page)
  await action()
  await settle(page)
  const events = await trace.stop()
  const { animations, frameOf, inner, fades } = motionFrames(events)
  const fading = (ts: number): boolean => fades.some((fade) => ts >= fade.begin && ts <= fade.end)
  const work = events.flatMap((event) => {
    const frame = event.ts === undefined ? undefined : frameOf(event.ts)
    const plate = event.args?.data?.nodeName === '#document' || event.args?.data?.nodeName?.startsWith('BUTTON')
    if (event.name === 'Paint' && event.ts !== undefined && plate && fading(event.ts)) return []
    return RENDER_WORK.has(event.name ?? '') && frame !== undefined && inner.has(frame) ? [`${event.name} ${event.args?.data?.nodeName ?? ''}`.trim()] : []
  })
  return { animations, work, events }
}

export function failures(events: readonly TraceEvent[]): TraceEvent[] {
  return events.filter((event) => {
    const data = event.args?.data
    return Boolean(data?.compositeFailed) || (data?.unsupportedProperties?.length ?? 0) > 0
  })
}

export type LayerPart = 'pill' | 'over pill' | 'other'

export type CountedLayer = {
  readonly node: string
  readonly part: LayerPart
  readonly reasons: readonly string[]
  readonly width: number
  readonly height: number
  readonly bytes: number
}

export type LayerCount = { readonly count: number; readonly bytes: number; readonly layers: readonly CountedLayer[] }

export type LayerWatch = {
  now(): Promise<LayerCount>
  peak(action: () => Promise<unknown>): Promise<LayerCount>
}

type RawLayer = {
  readonly layerId: string
  readonly parentLayerId?: string
  readonly backendNodeId?: number
  readonly width: number
  readonly height: number
  readonly drawsContent: boolean
  readonly transform?: readonly number[]
}

type Owner = { readonly node: string; readonly pill: boolean }

type Details = { readonly owner: Owner; readonly reasons: readonly string[] }

type CapturedLayer = RawLayer & Details

type Frame = { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number }

const PILL = '[data-recipe="indicator"]'
const BYTES_PER_PIXEL = 4
const OVERLAP_REASONS: ReadonlySet<string> = new Set(['Overlap', 'AssumedOverlap'])
const TRANSLATE_X = 12
const TRANSLATE_Y = 13
const LABEL_ATTRIBUTES: readonly string[] = ['data-recipe', 'data-variant', 'role', 'aria-label']
const LABEL_TEXT = 24
const NO_OWNER: Owner = { node: '(no node)', pill: false }
const SETTLED_FRAMES = 2

function describeOwner(this: Node, pill: string, attributes: readonly string[], text: number): Owner {
  const element = this instanceof Element ? this : this.parentElement
  if (!element) return { node: this.nodeName, pill: false }
  const marks = attributes.flatMap((name) => (element.hasAttribute(name) ? [`[${name}="${element.getAttribute(name)}"]`] : []))
  return { node: `${element.localName}${marks.join('')} "${(element.textContent ?? '').trim().slice(0, text)}"`, pill: element.closest(pill) !== null }
}

async function ownerOf(cdp: CDPSession, backendNodeId: number | undefined): Promise<Owner> {
  if (backendNodeId === undefined) return NO_OWNER
  const { object } = await cdp.send('DOM.resolveNode', { backendNodeId })
  if (object.objectId === undefined) return NO_OWNER
  const { result } = await cdp.send('Runtime.callFunctionOn', {
    objectId: object.objectId,
    functionDeclaration: describeOwner.toString(),
    arguments: [{ value: PILL }, { value: LABEL_ATTRIBUTES }, { value: LABEL_TEXT }],
    returnByValue: true,
  })
  return result.value as Owner
}

async function detailsOf(cdp: CDPSession, layer: RawLayer): Promise<Details> {
  const [owner, reasons] = await Promise.all([
    ownerOf(cdp, layer.backendNodeId).catch(() => NO_OWNER),
    cdp
      .send('LayerTree.compositingReasons', { layerId: layer.layerId })
      .then(({ compositingReasonIds }) => compositingReasonIds ?? [])
      .catch(() => []),
  ])
  return { owner, reasons }
}

function isBudgetLayer(layer: RawLayer): boolean {
  return layer.parentLayerId !== undefined && layer.drawsContent && layer.width * layer.height > 0
}

function frameOf(layer: RawLayer): Frame {
  const left = layer.transform?.[TRANSLATE_X] ?? 0
  const top = layer.transform?.[TRANSLATE_Y] ?? 0
  return { left, top, right: left + layer.width, bottom: top + layer.height }
}

function overlaps(a: Frame, b: Frame): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

function partOf(layer: CapturedLayer, pills: readonly Frame[]): LayerPart {
  if (layer.owner.pill) return 'pill'
  const overlap = layer.reasons.some((reason) => OVERLAP_REASONS.has(reason))
  return overlap && pills.some((pill) => overlaps(pill, frameOf(layer))) ? 'over pill' : 'other'
}

async function countOf(page: Page, captured: readonly CapturedLayer[]): Promise<LayerCount> {
  const ratio = await page.evaluate(() => devicePixelRatio)
  const pills = captured.filter((layer) => layer.owner.pill).map(frameOf)
  const layers = captured.map((layer) => ({
    node: layer.owner.node,
    part: partOf(layer, pills),
    reasons: layer.reasons,
    width: layer.width,
    height: layer.height,
    bytes: layer.width * layer.height * ratio * ratio * BYTES_PER_PIXEL,
  }))
  return { count: layers.length, bytes: layers.reduce((total, layer) => total + layer.bytes, 0), layers }
}

const BLOCKED = ":disabled, [data-disabled], [aria-disabled='true'], [aria-busy='true']"
const ANCHOR = "[aria-haspopup], [aria-expanded], [data-popup-open], [data-base-ui-tooltip-trigger]"
const BUTTON_KIND = "[data-recipe='control']:is(button:not([role]), button[role='combobox'], [role='button'], [data-slot='box'], [data-slot='track'], a[href]:not([role])):not([data-variant='field'])"
const PILL_KIND = ":has(> [data-recipe='indicator']) > [data-recipe='control']:is([role='radio'], [role='tab'], [role='menuitem']), [data-recipe='row'][role='menuitem']"

export const FORM_PROXY = "input[aria-hidden='true'][tabindex='-1']"

export const INTERACTIVE_ELEMENTS = `:is(a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable='false']), [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio'], [role='option'], [role='slider'], [role='treeitem'], [role='textbox'], [role='combobox'], [role='spinbutton']):not(${FORM_PROXY})`

const FLAT = "[aria-haspopup='listbox'], [data-surface='joined'] > *, [data-slot='track']"

export const PRESS_GROUPS = {
  scale: `${BUTTON_KIND}:not(${BLOCKED}, ${ANCHOR}, ${FLAT})`,
  anchor: `${BUTTON_KIND}:is(${ANCHOR}):not(${BLOCKED}, ${FLAT})`,
  flat: `${BUTTON_KIND}:is(${FLAT}):not(${BLOCKED})`,
  pill: `:is(${PILL_KIND}):not(${BLOCKED})`,
  field: "[data-variant='field'] > [data-slot='input']",
  still: `:is(${BUTTON_KIND}, ${PILL_KIND}):is(${BLOCKED})`,
  owner: "a[href][data-recipe='surface'], [role='switch']:not([data-slot='track']), [role='slider'], [role='option'], [role='treeitem'], [role='menuitemcheckbox'], [role='menuitemradio']",
  lab: "a[href]:not([data-recipe]), [data-testid='field-sizing']",
} as const

export type PressGroup = keyof typeof PRESS_GROUPS

export type PressReport = { readonly counts: Readonly<Record<string, number>>; readonly problems: readonly string[] }

export function pressReport(page: Page, only: readonly PressGroup[] = Object.keys(PRESS_GROUPS) as PressGroup[]): Promise<PressReport> {
  return page.evaluate(
    ({ interactive, groups, only }) => {
      const probe = document.createElement('div')
      document.body.append(probe)
      const timing = (value: string): string => {
        probe.style.transitionTimingFunction = value
        return getComputedStyle(probe).transitionTimingFunction
      }
      const scaleOf = (value: string): string => {
        probe.style.scale = value
        return getComputedStyle(probe).scale
      }
      const seconds = (value: string): number => {
        const text = value.trim()
        return text.endsWith('ms') ? Number.parseFloat(text) / 1000 : Number.parseFloat(text)
      }
      const name = (element: Element): string =>
        `${element.localName}${element.getAttribute('role') ? `[${element.getAttribute('role')}]` : ''} "${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 24)}"`
      const engine = (element: Element) => {
        const style = getComputedStyle(element)
        const read = (output: string): string => style.getPropertyValue(`--ts-motion-${output}`).trim()
        return {
          rest: scaleOf(read('press-rest')),
          pressed: scaleOf(read('press-scale')),
          into: { duration: seconds(read('duration-press-in')), easing: timing(read('ease-press-in')) },
          back: { duration: seconds(read('duration-press-out')), easing: timing(read('ease-press-out')) },
        }
      }
      const look = (element: Element, pseudo?: string) => {
        const style = getComputedStyle(element, pseudo)
        return {
          scale: style.scale,
          transform: style.transform,
          property: style.transitionProperty.split(',')[0]?.trim() ?? '',
          duration: seconds(style.transitionDuration.split(',')[0] ?? ''),
          easing: style.transitionTimingFunction.split(/,(?![^(]*\))/)[0]?.trim() ?? '',
          layer: style.willChange,
        }
      }
      const parts = (element: Element): Element[] => [...element.querySelectorAll(":scope > [data-slot='icon'], :scope > [data-slot='label']")]
      const finish = (): void => {
        for (const animation of document.getAnimations()) if (animation instanceof CSSTransition) animation.finish()
      }
      const elements = [...document.querySelectorAll(interactive)]
      const classified = elements.map((element) => ({ element, found: Object.entries(groups).filter(([, selector]) => element.matches(selector)).map(([group]) => group) }))
      const problems: string[] = classified.filter(({ found }) => found.length !== 1).map(({ element, found }) => `${name(element)}: groups [${found.join(', ')}]`)
      const counts: Record<string, number> = {}
      for (const { found } of classified) if (found.length === 1 && found[0]) counts[found[0]] = (counts[found[0]] ?? 0) + 1
      const checked = classified.flatMap(({ element, found }) => (found.length === 1 && only.some((group) => group === found[0]) ? [{ element, group: found[0] ?? '' }] : []))
      const hosts = checked.map(({ element, group }) => ({ element, group, host: group === 'field' ? element.closest("[data-variant='field']") ?? element : element }))
      const ancestors = (element: Element): Element[] => {
        const found: Element[] = []
        for (let node = element.parentElement; node; node = node.parentElement) found.push(node)
        return found
      }
      const transformed = (element: Element): boolean => getComputedStyle(element).scale !== 'none' || getComputedStyle(element).transform !== 'none'
      const sampled = new Set(hosts.filter(({ host }) => host.hasAttribute('data-pressing')).map(({ host }) => host))
      const check = (all: boolean): void => {
        for (const { element, group, host } of hosts) {
          const pressed = all || sampled.has(host)
          const values = engine(host)
          const own = look(host)
          const plate = look(host, '::before')
          const label = `${pressed ? 'pressed' : 'rest'} ${group} ${name(element)}`
          const target = pressed ? values.pressed : values.rest
          const motion = pressed ? values.into : values.back
          if (group === 'scale') {
            if (own.scale !== target) problems.push(`${label}: scale ${own.scale}, engine ${target}`)
            if (own.property !== 'scale' || own.duration !== motion.duration || own.easing !== motion.easing) {
              problems.push(`${label}: transition ${own.property} ${own.duration}s ${own.easing}, engine scale ${motion.duration}s ${motion.easing}`)
            }
            if ((own.layer === 'scale') !== pressed) problems.push(`${label}: will-change ${own.layer}`)
            if (plate.scale !== 'none') problems.push(`${label}: plate scale ${plate.scale}`)
          } else if (group === 'anchor') {
            for (const node of [host, ...ancestors(host)]) if (transformed(node)) problems.push(`${label}: ${node === host ? 'anchor' : `ancestor ${name(node)}`} transformed`)
            for (const [part, seen] of [...parts(host).map((slot) => [slot.getAttribute('data-slot') ?? '', look(slot)] as const), ['plate', plate] as const]) {
              if (seen.scale !== target) problems.push(`${label}: ${part} scale ${seen.scale}, engine ${target}`)
              if (seen.property !== 'scale' || seen.duration !== motion.duration || seen.easing !== motion.easing) problems.push(`${label}: ${part} transition ${seen.property} ${seen.duration}s`)
              if ((seen.layer === 'scale') !== pressed) problems.push(`${label}: ${part} will-change ${seen.layer}`)
            }
          } else if (group !== 'lab') {
            const moved = [own, plate, ...parts(host).map((slot) => look(slot))].filter((seen) => seen.scale !== 'none' || seen.transform !== 'none')
            if (moved.length > 0) problems.push(`${label}: scaled`)
          }
        }
      }
      check(false)
      for (const { host } of hosts) host.setAttribute('data-pressing', '')
      finish()
      check(true)
      for (const { host } of hosts) if (!sampled.has(host)) host.removeAttribute('data-pressing')
      finish()
      probe.remove()
      return { counts, problems }
    },
    { interactive: INTERACTIVE_ELEMENTS, groups: PRESS_GROUPS, only },
  )
}

const HOVER_PLATES =
  "[data-recipe='control']:is(button:not([role]), [role='button'], [data-slot='box'], [data-slot='track'], a[href]:not([role]), [aria-haspopup='listbox'], [data-variant='field'])"
const HOT_PLATES = ":hover, [data-pressing], [aria-expanded='true'], [data-popup-open], [aria-pressed='true'], [aria-selected='true']"

export type TimingReport = {
  readonly engine: Readonly<Record<string, number>>
  readonly counts: Readonly<Record<string, number>>
  readonly problems: readonly string[]
}

export function timingReport(page: Page): Promise<TimingReport> {
  return page.evaluate(
    ({ plates, hot }) => {
      const probe = document.createElement('div')
      document.body.append(probe)
      const root = getComputedStyle(document.documentElement)
      const output = (element: Element, name: string): string => getComputedStyle(element).getPropertyValue(`--ts-motion-${name}`).trim()
      const milliseconds = (value: string): number => (value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000)
      const curve = (value: string): string => {
        probe.style.transitionTimingFunction = value
        return getComputedStyle(probe).transitionTimingFunction
      }
      const items = (list: string): string[] => list.split(/,(?![^(]*\))/).map((item) => item.trim())
      const first = (list: string): string => items(list)[0] ?? ''
      const seenAt = (element: Element, pseudo?: string) => {
        const style = getComputedStyle(element, pseudo)
        const [durations, easings] = [items(style.transitionDuration), items(style.transitionTimingFunction)]
        return items(style.transitionProperty).map((property, index) => ({
          property,
          duration: milliseconds(durations[index % durations.length] ?? '0s'),
          easing: easings[index % easings.length] ?? '',
        }))
      }
      const of = (seen: ReturnType<typeof seenAt>, property: string) =>
        seen.find((entry) => entry.property === property) ?? seen.find((entry) => entry.property === 'all') ?? { property, duration: 0, easing: '' }
      const name = (element: Element): string => `${element.localName}${element.getAttribute('role') ? `[${element.getAttribute('role')}]` : ''} "${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 24)}"`
      const problems: string[] = []
      const counts: Record<string, number> = {}
      const count = (category: string): void => {
        counts[category] = (counts[category] ?? 0) + 1
      }
      const expectTiming = (label: string, element: Element, all: ReturnType<typeof seenAt>, property: string, time: string, ease: string): void => {
        const seen = of(all, property)
        const duration = milliseconds(output(element, time))
        if (seen.duration !== duration) problems.push(`${label}: ${seen.duration} ms, engine ${time} ${duration} ms`)
        if (duration > 0 && seen.easing !== curve(output(element, ease))) problems.push(`${label}: curve ${seen.easing}, engine ${ease} ${curve(output(element, ease))}`)
      }
      const expectStill = (label: string, all: ReturnType<typeof seenAt>, property?: string): void => {
        const moving = property === undefined ? all.filter((entry) => entry.duration !== 0) : [of(all, property)].filter((entry) => entry.duration !== 0)
        if (moving.length > 0) problems.push(`${label}: ${moving.map((entry) => `${entry.property} ${entry.duration} ms`).join(', ')}, expected none`)
      }

      const controls = [...document.querySelectorAll("[data-recipe='control']")]
      const hovered = new Set(document.querySelectorAll(plates))
      for (const element of controls) {
        const label = name(element)
        if (hovered.has(element)) {
          if (!element.matches(hot)) {
            count('plate exit')
            expectTiming(`plate exit ${label}`, element, seenAt(element, '::before'), 'background-color', 'duration-hover-out', 'ease-hover')
          }
          const held = element.hasAttribute('data-pressing')
          element.setAttribute('data-pressing', '')
          count('plate entry')
          expectStill(`plate entry ${label}`, seenAt(element, '::before'), 'background-color')
          if (!held) element.removeAttribute('data-pressing')
        } else {
          count('plate flat')
          expectStill(`plate flat ${label}`, seenAt(element, '::before'))
        }
      }
      for (const element of document.querySelectorAll("[data-recipe='row']")) {
        count('row')
        expectStill(`row ${name(element)}`, seenAt(element))
        expectStill(`row plate ${name(element)}`, seenAt(element, '::before'))
      }
      for (const pill of document.querySelectorAll("[data-recipe='indicator']")) {
        const variant = pill.getAttribute('data-variant') ?? ''
        const visible = pill.getAttribute('data-visible')
        if (variant === 'hover') {
          pill.setAttribute('data-visible', 'false')
          count('pill exit')
          expectTiming('hover pill exit', pill, seenAt(pill), 'opacity', 'duration-hover-out', 'ease-hover')
          pill.setAttribute('data-visible', 'true')
          count('pill entry')
          expectStill('hover pill entry', seenAt(pill), 'opacity')
        } else if (variant === 'dot') {
          count('pill choice')
          if (pill.parentElement?.matches("[aria-checked='true'], [aria-selected='true']")) {
            expectTiming('chosen dot pill', pill, seenAt(pill), 'scale', 'duration-choice', 'ease-elastic')
          } else {
            expectStill('unchosen dot pill', seenAt(pill))
          }
        } else {
          for (const state of ['false', 'true']) {
            pill.setAttribute('data-visible', state)
            count('pill choice')
            expectStill(`${variant} pill ${state}`, seenAt(pill))
          }
        }
        if (visible === null) pill.removeAttribute('data-visible')
        else pill.setAttribute('data-visible', visible)
      }
      for (const icon of document.querySelectorAll("[data-recipe='control'][aria-busy='true'] > [data-slot='icon']:first-child")) {
        count('spinner')
        const style = getComputedStyle(icon)
        if (style.animationName !== output(icon, 'spin')) problems.push(`spinner ${name(icon)}: ${style.animationName}, engine ${output(icon, 'spin')}`)
        if (milliseconds(first(style.animationDuration)) !== milliseconds(output(icon, 'loop'))) problems.push(`spinner ${name(icon)}: duration ${style.animationDuration}`)
        if (!icon.getAnimations().some((animation) => animation.playState === 'running')) problems.push(`spinner ${name(icon)}: not running`)
      }
      probe.remove()
      const engine = Object.fromEntries(
        ['duration-hover-out', 'duration-follow', 'duration-choice', 'duration-scene', 'duration-press-in', 'duration-press-out'].map((time) => [
          time,
          milliseconds(root.getPropertyValue(`--ts-motion-${time}`).trim()),
        ]),
      )
      return { engine, counts, problems }
    },
    { plates: HOVER_PLATES, hot: HOT_PLATES },
  )
}

export async function settle(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Number.POSITIVE_INFINITY)
        .map((animation) => animation.finished.catch(() => undefined)),
    ).then(() => {
      window.settledFrames = 0
    }),
  )
  await page.waitForFunction((frames) => (window.settledFrames = (window.settledFrames ?? 0) + 1) > frames, SETTLED_FRAMES, { polling: 'raf' })
}

export async function watchLayers(page: Page): Promise<LayerWatch> {
  const cdp = await page.context().newCDPSession(page)
  const details = new Map<string, Promise<Details>>()
  const known = (layer: RawLayer): Promise<Details> => {
    const found = details.get(layer.layerId) ?? detailsOf(cdp, layer)
    details.set(layer.layerId, found)
    return found
  }
  const captured = (layers: readonly RawLayer[]): Promise<CapturedLayer[]> =>
    Promise.all(layers.map(async (layer) => ({ ...layer, ...(await known(layer)) })))
  let latest: readonly RawLayer[] = []
  let most: readonly RawLayer[] = []
  cdp.on('LayerTree.layerTreeDidChange', ({ layers }) => {
    latest = (layers ?? []).filter(isBudgetLayer)
    latest.forEach(known)
    if (latest.length > most.length) most = latest
  })
  await cdp.send('DOM.getDocument', { depth: 0 })
  await cdp.send('LayerTree.enable')
  await settle(page)
  return {
    now: async () => {
      await settle(page)
      return countOf(page, await captured(latest))
    },
    peak: async (action) => {
      most = latest
      await action()
      await settle(page)
      return countOf(page, await captured(most))
    },
  }
}

export function recordAnimations(): void {
  const timing = new Set(['offset', 'easing', 'composite'])
  const animate = Element.prototype.animate
  window.recordedAnimations = []
  const record = (element: Element, properties: readonly string[], plate: boolean, duration: number | null, easing: string | null): void => {
    window.recordedAnimations?.push({
      role: element.getAttribute('role'),
      variant: element.getAttribute('data-variant'),
      recipe: element.closest('[data-recipe="indicator"]') ? 'indicator' : null,
      plate,
      duration,
      easing,
      properties,
    })
  }
  Element.prototype.animate = function (keyframes, options) {
    const frames: readonly object[] = Array.isArray(keyframes) ? keyframes : keyframes ? [keyframes] : []
    const duration = typeof options === 'number' ? options : typeof options?.duration === 'number' ? options.duration : null
    const easing = typeof options === 'object' && options !== null ? (options.easing ?? null) : null
    record(this, [...new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => !timing.has(key))))], false, duration, easing)
    return animate.call(this, keyframes, options)
  }
  document.addEventListener('transitionrun', (event) => {
    if (event.target instanceof Element) {
      record(event.target, [event.propertyName], event.pseudoElement === '::before' && event.target.getAttribute('data-recipe') === 'control', null, null)
    }
  })
}

export function installCommitProbe(): void {
  type Fiber = {
    tag: number
    flags: number
    alternate: Fiber | null
    child: Fiber | null
    sibling: Fiber | null
    return: Fiber | null
    stateNode: unknown
  }
  const PERFORMED_WORK = 1
  const COMPONENT_TAGS = new Set([0, 1, 11, 14, 15])
  const HOST_TAGS = new Set([5, 6, 26, 27])

  const hostOf = (fiber: Fiber): Element | null => {
    for (let node: Fiber | null = fiber; node; node = node.child) {
      if (!HOST_TAGS.has(node.tag)) continue
      const host = node.stateNode
      return host instanceof Element ? host : host instanceof Text ? host.parentElement : null
    }
    return null
  }

  const isPanel = (node: unknown): boolean => node instanceof Element && node.localName === 'aside'

  const inPanel = (fiber: Fiber): boolean => {
    for (let node: Fiber | null = fiber; node; node = node.return) if (isPanel(node.stateNode)) return true
    return isPanel(hostOf(fiber))
  }

  const collect = (fiber: Fiber, found: CommittedRender[]): void => {
    const previous = fiber.alternate
    if (COMPONENT_TAGS.has(fiber.tag) && (previous === null || (fiber.flags & PERFORMED_WORK) !== 0)) {
      const host = hostOf(fiber)
      found.push({ area: inPanel(fiber) ? 'panel' : host === null ? 'detached' : 'page', host })
    }
    if (previous !== null && previous.child === fiber.child) return
    for (let next = fiber.child; next; next = next.sibling) collect(next, found)
  }

  window.labRenders = []
  window.labCommits = 0
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    value: {
      renderers: new Map(),
      supportsFiber: true,
      inject: () => 1,
      checkDCE: () => undefined,
      onScheduleFiberRoot: () => undefined,
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
      onCommitFiberRoot: (_renderer: number, root: { current: Fiber }) => {
        const found: CommittedRender[] = []
        collect(root.current, found)
        window.labRenders?.push(...found)
        window.labCommits = (window.labCommits ?? 0) + 1
      },
    },
  })
}

export async function clearRenders(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.labRenders = []
    window.labCommits = 0
  })
}

export function recorded(page: Page): Promise<RecordedAnimation[]> {
  return page.evaluate(() => window.recordedAnimations ?? [])
}

export async function clearRecorded(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.recordedAnimations = []
  })
}

export const HOVER_EXIT_PROPERTY = 'background-color'

export function offCompositor(animations: readonly RecordedAnimation[]): string[] {
  return animations.flatMap((animation) =>
    animation.properties.filter((name) => !COMPOSITOR_PROPERTIES.includes(name) && !(animation.plate && name === HOVER_EXIT_PROPERTY)),
  )
}

export function row(menu: Locator, name: string): Locator {
  return menu.locator(ROW).filter({ hasText: name })
}

export async function hover(page: Page, target: Locator): Promise<void> {
  await target.evaluate((element) =>
    Promise.all(element.closest('[role="menu"]')?.getAnimations().map((animation) => animation.finished.catch(() => undefined)) ?? []),
  )
  const { x, y, width, height } = await box(target)
  await page.mouse.move(x + width / 2, y + height / 2, { steps: MOVE_STEPS })
}

export function raisedShadow(page: Page): Promise<string> {
  return page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.boxShadow = 'var(--ts-depth-raised-shadow)'
    document.body.append(probe)
    const shadow = getComputedStyle(probe).boxShadow
    probe.remove()
    return shadow
  })
}

export type EdgeContext = Pick<
  BrowserContextOptions,
  'viewport' | 'deviceScaleFactor' | 'colorScheme' | 'contrast' | 'reducedMotion' | 'hasTouch' | 'forcedColors'
>

export type EdgeMedia = 'light' | 'dark' | 'touch' | 'contrast' | 'reduced motion' | 'forced colors'

export type EdgeCase = { readonly zoom: number } | { readonly width: number } | { readonly media: EdgeMedia }

export const EDGE_ZOOMS: readonly number[] = [0.5, 1, 1.5, 2]
export const EDGE_WIDTHS: readonly number[] = [320, 768, 1280, 1920]

const EDGE_VIEWPORT = { width: 1280, height: 800 } as const
const EDGE_MEDIA_OPTIONS: Readonly<Record<EdgeMedia, EdgeContext>> = {
  light: { colorScheme: 'light' },
  dark: { colorScheme: 'dark' },
  touch: { hasTouch: true },
  contrast: { contrast: 'more' },
  'reduced motion': { reducedMotion: 'reduce' },
  'forced colors': { forcedColors: 'active' },
}

export const EDGE_MEDIA: readonly EdgeMedia[] = Object.keys(EDGE_MEDIA_OPTIONS).filter((name): name is EdgeMedia =>
  Object.hasOwn(EDGE_MEDIA_OPTIONS, name),
)

export function edgeContext(edge: EdgeCase): EdgeContext {
  if ('zoom' in edge) {
    return {
      viewport: { width: Math.round(EDGE_VIEWPORT.width / edge.zoom), height: Math.round(EDGE_VIEWPORT.height / edge.zoom) },
      deviceScaleFactor: edge.zoom,
    }
  }
  if ('width' in edge) return { viewport: { width: edge.width, height: EDGE_VIEWPORT.height } }
  return { viewport: EDGE_VIEWPORT, ...EDGE_MEDIA_OPTIONS[edge.media] }
}

export async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox()
  if (!rect) throw new Error('no box')
  return rect
}

export function overflowProblems(frames: Locator): Promise<string[]> {
  return frames.evaluateAll((elements, formProxy) => {
    const TOLERANCE = 0.5
    const ROUNDING = 1
    const CUTTING = new Set(['hidden', 'clip'])
    const problems: string[] = []
    if (elements.length === 0) problems.push('no frames')
    const nameOf = (frame: Element): string =>
      [
        frame.closest('[data-edge-component]')?.getAttribute('data-edge-component'),
        frame.closest('[data-overflow-component]')?.getAttribute('data-overflow-component'),
        frame.getAttribute('data-overflow-case'),
        frame.getAttribute('role'),
      ]
        .filter(Boolean)
        .join(' ')
    const labelOf = (element: Element): string =>
      `${element.localName}${element.getAttribute('data-slot') ? `[${element.getAttribute('data-slot')}]` : ''} "${(element.textContent ?? '').slice(0, 16)}"`
    const clips = (element: Element): boolean => getComputedStyle(element).overflowX !== 'visible'
    const scrollsByDesign = (element: Element): boolean =>
      element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || getComputedStyle(element).textOverflow === 'ellipsis'
    for (const frame of elements) {
      const name = nameOf(frame)
      const outer = frame.getBoundingClientRect()
      if (frame.scrollWidth > frame.clientWidth + ROUNDING) problems.push(`${name}: scrolls ${frame.scrollWidth} px in ${frame.clientWidth} px`)
      if (frame.scrollHeight > frame.clientHeight + ROUNDING && CUTTING.has(getComputedStyle(frame).overflowY)) {
        problems.push(`${name}: cuts ${frame.scrollHeight} px of content to ${frame.clientHeight} px`)
      }
      const visit = (parent: Element, clipped: boolean): void => {
        for (const element of parent.children) {
          if (!element.checkVisibility() || element.matches(formProxy)) continue
          const pointsOut = element.matches("[data-slot='arrow']")
          const rect = element.getBoundingClientRect()
          const outside =
            rect.left < outer.left - TOLERANCE ||
            rect.right > outer.right + TOLERANCE ||
            rect.top < outer.top - TOLERANCE ||
            rect.bottom > outer.bottom + TOLERANCE
          if (!clipped && !pointsOut && (rect.width > 0 || rect.height > 0) && outside) {
            problems.push(
              `${name}: ${labelOf(element)} spans ${Math.round(rect.left - outer.left)}..${Math.round(rect.right - outer.left)} × ${Math.round(rect.top - outer.top)}..${Math.round(rect.bottom - outer.top)} px`,
            )
          }
          if (!scrollsByDesign(element) && element.scrollWidth > element.clientWidth + ROUNDING && element.clientWidth > 0) {
            problems.push(`${name}: ${labelOf(element)} scrolls ${element.scrollWidth} px in ${element.clientWidth} px`)
          }
          visit(element, clipped || clips(element))
        }
      }
      visit(frame, clips(frame))
    }
    return problems
  }, FORM_PROXY)
}

export function letterBreaks(scopes: Locator): Promise<string[]> {
  return scopes.evaluateAll((elements) => {
    const MIN_CHARACTERS_PER_LINE = 2
    const problems: string[] = []
    for (const scope of elements) {
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent?.trim() ?? ''
        const parent = node.parentElement
        if (text.length < MIN_CHARACTERS_PER_LINE + 1 || !parent?.checkVisibility()) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        const lines = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top))).size
        if (lines > 1 && text.length / lines < MIN_CHARACTERS_PER_LINE) {
          const slot = parent.getAttribute('data-slot')
          problems.push(`${parent.localName}${slot ? `[${slot}]` : ''} "${text.slice(0, 16)}" breaks into ${lines} lines in ${parent.getBoundingClientRect().width.toFixed(1)} px`)
        }
      }
    }
    return problems
  })
}

export async function windowProblems(popup: Locator, name: string): Promise<string[]> {
  const rect = await box(popup)
  const window = await popup.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }))
  const TOLERANCE = 0.5
  const inside =
    rect.x >= -TOLERANCE && rect.y >= -TOLERANCE && rect.x + rect.width <= window.width + TOLERANCE && rect.y + rect.height <= window.height + TOLERANCE
  return inside ? [] : [`${name}: popup spans ${Math.round(rect.x)}..${Math.round(rect.x + rect.width)} × ${Math.round(rect.y)}..${Math.round(rect.y + rect.height)} px`]
}

export type OpticalGaps = {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
  readonly height: number
  readonly radius: number
  readonly squircle: boolean
  readonly textSize: number
  readonly stroke: number
}

export function opticalGaps(target: Locator): Promise<OpticalGaps> {
  return target.evaluate((container) => {
    const SKIP = '[data-recipe="indicator"], [data-variant="separator"]'
    const NESTED = '[data-recipe="control"], [data-recipe="row"], [data-recipe="surface"]'
    const FONT_PROPERTIES = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch', 'fontVariationSettings'] as const
    const fonts = new Map<string, { ascent: number; cap: number; content: number }>()
    const edges = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity }
    const across = (left: number, right: number): void => {
      edges.left = Math.min(edges.left, left)
      edges.right = Math.max(edges.right, right)
    }
    const down = (top: number, bottom: number): void => {
      edges.top = Math.min(edges.top, top)
      edges.bottom = Math.max(edges.bottom, bottom)
    }
    const trimmed = (style: CSSStyleDeclaration, edge: string): number => {
      const probe = document.createElement('div')
      for (const property of FONT_PROPERTIES) probe.style[property] = style[property]
      probe.style.position = 'absolute'
      probe.style.whiteSpace = 'nowrap'
      probe.style.visibility = 'hidden'
      probe.style.setProperty('text-box', edge)
      probe.textContent = 'H'
      document.body.append(probe)
      const height = probe.getBoundingClientRect().height
      probe.remove()
      return height
    }
    const metricsOf = (element: Element): { ascent: number; cap: number; content: number } => {
      const style = getComputedStyle(element)
      const key = FONT_PROPERTIES.map((property) => style[property]).join('|')
      const known = fonts.get(key)
      if (known) return known
      const metrics = {
        ascent: trimmed(style, 'trim-both text alphabetic'),
        cap: trimmed(style, 'trim-both cap alphabetic'),
        content: trimmed(style, 'trim-both text text'),
      }
      fonts.set(key, metrics)
      return metrics
    }
    const shown = (element: Element): boolean =>
      element.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !element.closest(SKIP)
    const field = (input: HTMLInputElement | HTMLTextAreaElement): void => {
      const rect = input.getBoundingClientRect()
      const style = getComputedStyle(input)
      const metrics = metricsOf(input)
      const leading = Number.parseFloat(style.lineHeight)
      const top = rect.top + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.paddingTop)
      const inner = rect.bottom - Number.parseFloat(style.borderBottomWidth) - Number.parseFloat(style.paddingBottom) - top
      const lines = input instanceof HTMLTextAreaElement ? Math.max(1, (input.value || input.placeholder).split('\n').length) : 1
      const first = input instanceof HTMLTextAreaElement ? top - input.scrollTop : top + (inner - leading) / 2
      const lead = (leading - metrics.content) / 2 + metrics.ascent
      across(rect.left, rect.right)
      down(first + lead - metrics.cap, first + (lines - 1) * leading + lead)
    }
    const walk = (node: Element): void => {
      for (const child of node.childNodes) {
        if (child instanceof Text) {
          if (!child.data.trim() || !shown(node)) continue
          const metrics = metricsOf(node)
          const range = document.createRange()
          range.selectNodeContents(child)
          for (const rect of range.getClientRects()) {
            if (rect.width === 0) continue
            across(rect.left, rect.right)
            down(rect.top + metrics.ascent - metrics.cap, rect.top + metrics.ascent)
          }
          continue
        }
        if (!(child instanceof Element) || !shown(child)) continue
        const style = getComputedStyle(child)
        if (style.position === 'absolute' || style.position === 'fixed') continue
        const rect = child.getBoundingClientRect()
        if (child instanceof SVGSVGElement || child.matches(NESTED)) {
          across(rect.left, rect.right)
          down(rect.top, rect.bottom)
          continue
        }
        if (child instanceof HTMLInputElement || child instanceof HTMLTextAreaElement) {
          field(child)
          continue
        }
        if (style.display !== 'inline' && style.display !== 'contents') across(rect.left, rect.right)
        walk(child)
      }
    }
    walk(container)
    const outer = container.getBoundingClientRect()
    const style = getComputedStyle(container)
    return {
      left: edges.left - outer.left,
      right: outer.right - edges.right,
      top: edges.top - outer.top,
      bottom: outer.bottom - edges.bottom,
      height: Number.parseFloat(style.getPropertyValue('--ts-size-height')) || outer.height,
      radius: Math.min(Number.parseFloat(style.borderTopLeftRadius), outer.height / 2, outer.width / 2),
      squircle: style.getPropertyValue('corner-top-left-shape').startsWith('superellipse(2'),
      textSize: Number.parseFloat(style.getPropertyValue('--ts-size-text')) || Number.parseFloat(style.fontSize),
      stroke: Number.parseFloat(style.borderLeftWidth),
    }
  })
}
