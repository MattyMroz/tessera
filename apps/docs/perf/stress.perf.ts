import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { cpus } from 'node:os'
import { resolve } from 'node:path'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { expect, test, type Browser, type CDPSession, type Locator, type Page } from '@playwright/test'
import { row, settle, STRESS, visit, watchLayers } from '../tests/helpers'

declare global {
  interface Window {
    labLongFrames?: number[]
    labInteractions?: number[]
  }
}

const RUNS = 5
const WARM_UPS = 1
const THROTTLED = 4
const FULL_SPEED = 1
const REGRESSION = 0.2
const BROKEN = 1
const UNSTABLE = 0.2
const LONG_FRAME = 50
const INTERACTION_THRESHOLD = 16
const SAMPLES = 10
const ROW_SAMPLES = 20
const THEME_SWITCHES = 3
const IDLE_SAMPLES = 3
const MOUNT_FRAMES = 2
const SCROLL_STEP = 3000
const SCROLLS = 3
const MILLISECONDS = 1000
const LAST = resolve(import.meta.dirname, 'last.json')
const SAVE = process.env.PERF_SAVE === '1'
const MOUNT_MARK = 'lab-mount'
const HOLD_TIME = 50
const INDICATOR_HOST = ':has(> [data-recipe="indicator"])'
const SUBJECT_HOST = '[data-recipe]:has(> [data-recipe="indicator"])'

const METRICS = {
  T1: { unit: 'frames > 50 ms', target: 0 },
  'T2 hover': { unit: 'ms', target: 4 },
  'T2 press': { unit: 'ms', target: 4 },
  'T3 1x': { unit: 'ms', target: 16 },
  'T3 4x': { unit: 'ms', target: 100 },
  T4: { unit: 'ms', target: 100 },
  T5: { unit: 'ms', target: 300 },
  'N8 row hover': { unit: 'ms', target: 4 },
  'N8 row layers': { unit: 'layers', target: 12 },
  'S-A subject T3 4x': { unit: 'ms', target: 100 },
  'S-A subject T5': { unit: 'ms', target: 300 },
} as const

type Name = keyof typeof METRICS
type Sample = Partial<Record<Name, number>>
type Measured = { readonly median: number; readonly runs: readonly number[]; readonly spread: number; readonly unit: string; readonly target: number }
type Report = { readonly date: string; readonly chromium: string; readonly cpu: string; readonly runs: number; readonly metrics: Partial<Record<Name, Measured>> }

const NAMES = Object.keys(METRICS).filter((name): name is Name => Object.hasOwn(METRICS, name))

function median(values: readonly number[]): number {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? (sorted[middle] ?? 0) : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
}

function observeFrames(durationThreshold: number): void {
  window.labLongFrames = []
  window.labInteractions = []
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.labLongFrames?.push(entry.duration)
  }).observe({ type: 'long-animation-frame', buffered: true })
  const events: PerformanceObserverInit & { durationThreshold: number } = { type: 'event', durationThreshold, buffered: true }
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry instanceof PerformanceEventTiming && entry.interactionId > 0) window.labInteractions?.push(entry.duration)
    }
  }).observe(events)
}

async function taskTime(cdp: CDPSession): Promise<number> {
  const { metrics } = await cdp.send('Performance.getMetrics')
  return (metrics.find((metric) => metric.name === 'TaskDuration')?.value ?? 0) * MILLISECONDS
}

async function busy(page: Page, cdp: CDPSession, action: () => Promise<unknown>): Promise<number> {
  await settle(page)
  const before = await taskTime(cdp)
  await action()
  await settle(page)
  return (await taskTime(cdp)) - before
}

async function netBusy(page: Page, cdp: CDPSession, actions: readonly (() => Promise<unknown>)[]): Promise<number> {
  const idle: number[] = []
  for (let sample = 0; sample < IDLE_SAMPLES; sample += 1) idle.push(await busy(page, cdp, async () => undefined))
  const spent: number[] = []
  for (const action of actions) spent.push(await busy(page, cdp, action))
  return Math.max(0, median(spent) - median(idle))
}

async function throttle(cdp: CDPSession, rate: number): Promise<void> {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate })
}

async function mount(page: Page): Promise<number> {
  await page.evaluate((mark) => {
    window.settledFrames = 0
    performance.mark(mark)
    for (const button of document.querySelectorAll('button')) if (button.textContent === 'Mount scene') button.click()
  }, MOUNT_MARK)
  const elapsed = await page.waitForFunction(
    ({ mark, frames }) => {
      window.settledFrames = (window.settledFrames ?? 0) + 1
      return window.settledFrames > frames && performance.now() - (performance.getEntriesByName(mark)[0]?.startTime ?? 0)
    },
    { mark: MOUNT_MARK, frames: MOUNT_FRAMES },
    { polling: 'raf' },
  )
  const time = Number(await elapsed.jsonValue())
  await page.getByRole('region', { name: 'Rows', exact: true }).waitFor()
  return time
}

function themeSwitches(page: Page): (() => Promise<unknown>)[] {
  return Array.from({ length: THEME_SWITCHES }, () => () =>
    page.evaluate(
      ([hold, frames]) => {
        const root = document.documentElement
        root.setAttribute(hold, '')
        root.dataset.mode = root.dataset.mode === 'dark' ? 'light' : 'dark'
        return new Promise<void>((done) =>
          setTimeout(() => {
            root.removeAttribute(hold)
            done()
          }, frames),
        )
      },
      [THEME_CONFIG.holdAttribute, HOLD_TIME] as const,
    ),
  )
}

async function centres(page: Page, scope: Locator, role: 'button' | 'menuitem', targets: readonly string[]): Promise<{ x: number; y: number }[]> {
  const height = page.viewportSize()?.height ?? 0
  const found: { x: number; y: number }[] = []
  for (const target of targets) {
    const box = await scope.getByRole(role, { name: target, exact: true }).boundingBox()
    if (box && box.y >= 0 && box.y + box.height <= height) found.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
  }
  expect(found).toHaveLength(targets.length)
  return found
}

function region(page: Page, name: string): Locator {
  return page.getByRole('region', { name, exact: true })
}

async function hoverAndPress(page: Page, cdp: CDPSession): Promise<{ hover: number; press: number }> {
  await region(page, 'Buttons').evaluate((element) => element.scrollIntoView({ block: 'start' }))
  const buttons = await centres(page, region(page, 'Buttons'), 'button', Array.from({ length: SAMPLES }, (_, index) => `Button ${index + 1}`))
  const hover = await netBusy(page, cdp, buttons.map(({ x, y }) => () => page.mouse.move(x, y)))
  const press = async (): Promise<void> => {
    await page.mouse.down()
    await page.mouse.up()
  }
  return { hover, press: await netBusy(page, cdp, buttons.map(() => press)) }
}

async function rowRide(page: Page, cdp: CDPSession): Promise<{ hover: number; layers: number }> {
  await region(page, 'Rows').evaluate((element) => element.scrollIntoView({ block: 'start' }))
  await region(page, 'Rows').getByRole('button', { name: 'Rows menu', exact: true }).click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await settle(page)
  const rows = await centres(page, menu, 'menuitem', Array.from({ length: ROW_SAMPLES }, (_, index) => `Row ${index + 1}`))
  const hover = await netBusy(page, cdp, rows.map(({ x, y }) => () => page.mouse.move(x, y)))
  const layers = await watchLayers(page)
  const peak = await layers.peak(async () => {
    for (const { x, y } of rows) await page.mouse.move(x, y)
  })
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  return { hover, layers: peak.count }
}

async function motionScenes(page: Page): Promise<{ longFrames: number; interaction: number }> {
  await page.evaluate(() => {
    window.labLongFrames = []
    window.labInteractions = []
  })
  const group = page.getByRole('radiogroup', { name: 'Raised group', exact: true })
  for (const name of ['2', '8', '14', '20']) await group.getByRole('radio', { name, exact: true }).hover()
  await group.getByRole('radio', { name: '10', exact: true }).click()
  await page.getByRole('button', { name: 'Menu 1', exact: true }).click()
  for (const name of ['Open', 'Duplicate', 'Rename', 'Export', 'Delete']) await row(page.getByRole('menu'), name).hover()
  await page.keyboard.press('Escape')
  for (const index of [1, 2, 3, 4, 5, 6]) await region(page, 'List').getByRole('button', { name: `Item ${index}`, exact: true }).hover()
  await page.getByRole('button', { name: 'Dialog', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Popover 1', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.mouse.move(0, 0)
  for (let scroll = 0; scroll < SCROLLS; scroll += 1) await page.mouse.wheel(0, SCROLL_STEP)
  for (let scroll = 0; scroll < SCROLLS; scroll += 1) await page.mouse.wheel(0, -SCROLL_STEP)
  await settle(page)
  return page.evaluate((long) => {
    const frames = window.labLongFrames ?? []
    const interactions = window.labInteractions ?? []
    return { longFrames: frames.filter((duration) => duration > long).length, interaction: Math.max(0, ...interactions) }
  }, LONG_FRAME)
}

async function hostSelector(page: Page, from: string, to: string): Promise<number> {
  return page.evaluate(
    ({ from, to }) => {
      let changed = 0
      const visitRules = (rules: CSSRuleList): void => {
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule && rule.selectorText === from) {
            rule.selectorText = to
            changed += 1
          } else if (rule instanceof CSSGroupingRule) visitRules(rule.cssRules)
        }
      }
      for (const sheet of document.styleSheets) visitRules(sheet.cssRules)
      return changed
    },
    { from, to },
  )
}

async function open(browser: Browser): Promise<{ page: Page; cdp: CDPSession; close: () => Promise<void> }> {
  const { baseURL } = test.info().project.use
  const context = await browser.newContext(baseURL === undefined ? {} : { baseURL })
  const page = await context.newPage()
  await page.addInitScript(observeFrames, INTERACTION_THRESHOLD)
  await visit(page, STRESS)
  const cdp = await context.newCDPSession(page)
  await cdp.send('Performance.enable')
  return { page, cdp, close: () => context.close() }
}

async function baseRun(browser: Browser): Promise<Sample> {
  const { page, cdp, close } = await open(browser)
  await throttle(cdp, THROTTLED)
  const sample: Sample = { T5: await mount(page) }
  sample['T3 4x'] = await netBusy(page, cdp, themeSwitches(page))
  await throttle(cdp, FULL_SPEED)
  sample['T3 1x'] = await netBusy(page, cdp, themeSwitches(page))
  await throttle(cdp, THROTTLED)
  const { hover, press } = await hoverAndPress(page, cdp)
  sample['T2 hover'] = hover
  sample['T2 press'] = press
  const { longFrames, interaction } = await motionScenes(page)
  sample.T1 = longFrames
  sample.T4 = interaction
  const rows = await rowRide(page, cdp)
  sample['N8 row hover'] = rows.hover
  sample['N8 row layers'] = rows.layers
  await close()
  return sample
}

async function subjectRun(browser: Browser): Promise<Sample> {
  const { page, cdp, close } = await open(browser)
  expect(await hostSelector(page, INDICATOR_HOST, SUBJECT_HOST)).toBe(1)
  await throttle(cdp, THROTTLED)
  const sample: Sample = { 'S-A subject T5': await mount(page) }
  const hosts = await page.evaluate((selectors) => selectors.map((selector) => document.querySelectorAll(selector).length), [INDICATOR_HOST, SUBJECT_HOST])
  expect(hosts[0]).toBe(hosts[1])
  sample['S-A subject T3 4x'] = await netBusy(page, cdp, themeSwitches(page))
  await close()
  return sample
}

function previous(): Report | undefined {
  return existsSync(LAST) ? (JSON.parse(readFileSync(LAST, 'utf8')) as Report) : undefined
}

function flagsOf(name: Name, measured: Measured, before: Measured | undefined): string[] {
  const flags: string[] = []
  if (measured.median > METRICS[name].target) flags.push('over target')
  if (measured.spread > UNSTABLE) flags.push('unstable')
  if (before && before.median > 0 && (measured.median - before.median) / before.median > REGRESSION) flags.push('regression')
  return flags
}

test('measures T1 to T5, N8 and S-A on the stress scene', async ({ browser }) => {
  for (let warm = 0; warm < WARM_UPS; warm += 1) {
    await baseRun(browser)
    await subjectRun(browser)
  }
  const samples: Sample[] = []
  for (let run = 0; run < RUNS; run += 1) samples.push({ ...(await baseRun(browser)), ...(await subjectRun(browser)) })
  const metrics: Partial<Record<Name, Measured>> = {}
  for (const name of NAMES) {
    const runs = samples.map((sample) => sample[name] ?? 0)
    const middle = median(runs)
    metrics[name] = {
      median: middle,
      runs,
      spread: middle > 0 ? (Math.max(...runs) - Math.min(...runs)) / middle : 0,
      unit: METRICS[name].unit,
      target: METRICS[name].target,
    }
  }
  const report: Report = { date: new Date().toISOString(), chromium: browser.version(), cpu: cpus()[0]?.model ?? '', runs: RUNS, metrics }
  const before = previous()
  if (before && (before.chromium !== report.chromium || before.cpu !== report.cpu)) console.log(`compared with ${before.chromium} on ${before.cpu}: not comparable`)
  for (const name of NAMES) {
    const measured = metrics[name]
    if (!measured) continue
    const last = before?.metrics[name]
    const change = last && last.median > 0 ? `${(((measured.median - last.median) / last.median) * 100).toFixed(0)} %` : '-'
    const flags = flagsOf(name, measured, last)
    console.log(`${name}: ${measured.median.toFixed(2)} ${measured.unit} (target ${measured.target}, spread ${(measured.spread * 100).toFixed(0)} %, before ${last?.median.toFixed(2) ?? '-'}, change ${change}) ${flags.join(', ')}`)
  }
  if (SAVE) writeFileSync(LAST, `${JSON.stringify(report, null, 2)}\n`)
  expect(samples).toHaveLength(RUNS)
  const comparable = before !== undefined && before.chromium === report.chromium && before.cpu === report.cpu
  const doubled = NAMES.filter((name) => {
    const [now, last] = [metrics[name]?.median ?? 0, before?.metrics[name]?.median ?? 0]
    return comparable && !SAVE && last > 0 && (now - last) / last > BROKEN
  })
  expect(doubled, 'more than twice as slow as apps/docs/perf/last.json').toEqual([])
})
