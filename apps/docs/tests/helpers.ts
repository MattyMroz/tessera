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
  readonly args?: { readonly data?: { readonly compositeFailed?: number; readonly unsupportedProperties?: readonly string[]; readonly nodeName?: string } }
}

export type RecordedAnimation = {
  readonly role: string | null
  readonly variant: string | null
  readonly recipe: string | null
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
  if (axis === 'mode') {
    await page.getByRole('radiogroup', { name: 'mode', exact: true }).getByRole('radio', { name: value, exact: true }).click()
  } else {
    await page.getByRole('button', { name: new RegExp(`^${axis} `) }).click()
    await page.getByRole('menuitemcheckbox', { name: value, exact: true }).click()
    await expect(page.getByRole('menu')).toHaveCount(0)
  }
  await expect(page.locator('html')).toHaveAttribute(`data-${axis}`, value)
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

function motionFrames(events: readonly TraceEvent[]): { animations: number; frameOf: (ts: number) => number | undefined; inner: ReadonlySet<number> } {
  const frames = events.flatMap((event) => (event.name === FRAME_START && event.ts !== undefined ? [event.ts] : [])).sort((a, b) => a - b)
  const frameOf = (ts: number): number | undefined => frames.findLast((frame) => frame <= ts) ?? frames[0]
  const open = new Map<string, { begin: number; running?: number }>()
  const spans: { readonly begin: number; readonly running: number; readonly end: number }[] = []
  for (const event of events.filter((found) => found.name === 'Animation').toSorted((a, b) => (a.ts ?? 0) - (b.ts ?? 0))) {
    if (event.ts === undefined) continue
    const key = event.id2?.local ?? event.id ?? ''
    const span = open.get(key)
    if (event.ph === 'b') open.set(key, { begin: event.ts })
    if (event.ph === 'n' && span && span.running === undefined && event.ts > span.begin) span.running = event.ts
    if (event.ph === 'e' && span) {
      spans.push({ begin: span.begin, running: span.running ?? span.begin, end: event.ts })
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
  return { animations: spans.length + open.size, frameOf, inner }
}

export async function motionWork(page: Page, action: () => Promise<unknown>): Promise<MotionWork> {
  await settle(page)
  const trace = await startTrace(page)
  await action()
  await settle(page)
  const events = await trace.stop()
  const { animations, frameOf, inner } = motionFrames(events)
  const work = events.flatMap((event) => {
    const frame = event.ts === undefined ? undefined : frameOf(event.ts)
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
  const record = (element: Element, properties: readonly string[]): void => {
    window.recordedAnimations?.push({
      role: element.getAttribute('role'),
      variant: element.getAttribute('data-variant'),
      recipe: element.closest('[data-recipe="indicator"]') ? 'indicator' : null,
      properties,
    })
  }
  Element.prototype.animate = function (keyframes, options) {
    const frames: readonly object[] = Array.isArray(keyframes) ? keyframes : keyframes ? [keyframes] : []
    record(this, [...new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => !timing.has(key))))])
    return animate.call(this, keyframes, options)
  }
  document.addEventListener('transitionrun', (event) => {
    if (event.target instanceof Element) record(event.target, [event.propertyName])
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

export function offCompositor(animations: readonly RecordedAnimation[]): string[] {
  return animations.flatMap((animation) => animation.properties.filter((name) => !COMPOSITOR_PROPERTIES.includes(name)))
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
  await page.mouse.move(x + width / 2 + 1, y + height / 2)
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
  return frames.evaluateAll((elements) => {
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
          if (!element.checkVisibility()) continue
          const rect = element.getBoundingClientRect()
          const outside =
            rect.left < outer.left - TOLERANCE ||
            rect.right > outer.right + TOLERANCE ||
            rect.top < outer.top - TOLERANCE ||
            rect.bottom > outer.bottom + TOLERANCE
          if (!clipped && (rect.width > 0 || rect.height > 0) && outside) {
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
}

export function opticalGaps(target: Locator): Promise<OpticalGaps> {
  return target.evaluate((container) => {
    const SKIP = '[data-recipe="indicator"]'
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
    }
  })
}
