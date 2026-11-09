import { bezierCurve, planFlight } from './flight'
import { writeInstance } from './instance'
import { readMotion, type Motion } from './motion'
import { bandStretch, fractionOf, isStepped, keyStop, stopsOf, TAP_SLOP, trailingStop, valueOfStop, type Range } from './range'

type SliderParts = {
  readonly root: HTMLElement
  readonly lane: HTMLElement
  readonly bar: HTMLElement
  readonly ride: HTMLElement
  readonly end: HTMLElement | null
}

export type SliderOptions = {
  range(): Range
  value(): number
  text(value: number): string
  onInput(value: number): void
  onCommit(value: number): void
}

export type SliderDrive = { show(): void; disconnect(): void }

type Course = { readonly at: (elapsed: number) => number; readonly duration: number; readonly animations: readonly Animation[] }

type Held = {
  readonly origin: number
  readonly width: number
  readonly span: number
  readonly height: number
  readonly sign: number
  readonly offset: number
  readonly lands: number
  readonly downX: number
  readonly before: number
  readonly motion: Motion
  seeking: boolean
  tapped: boolean
  stop: number | null
}

const PRIMARY_BUTTON = 0
const LANE = 100
const CLEAR = 0.9
const STILL = 0.05
const DISABLED = "[aria-disabled='true']"
const RTL = ':dir(rtl)'
const SEEK_OFFSETS: readonly number[] = [0, 1]
const PARTS = ["[data-slot='lane']", "[data-slot='bar']", "[data-slot='ride']"] as const
const END = ":scope > [data-slot='end']"

function partsOf(root: HTMLElement): SliderParts {
  const [lane, bar, ride] = PARTS.map((part) => root.querySelector<HTMLElement>(part))
  if (!lane || !bar || !ride) throw new Error('driveSlider needs the lane, the bar and the ride of a slider')
  return { root, lane, bar, ride, end: root.querySelector<HTMLElement>(END) }
}

function unit(fraction: number): number {
  return Math.min(1, Math.max(0, fraction))
}

function elapsedOf(animation: Animation | undefined): number {
  const time = animation?.currentTime
  return typeof time === 'number' ? time : Number.POSITIVE_INFINITY
}

export function swapText(label: HTMLElement, leaving: boolean): void {
  const motion = readMotion(label)
  if (motion.choice <= 0) return
  const faded: Keyframe = { opacity: 0, filter: getComputedStyle(label).getPropertyValue('--ts-motion-swap-blur') }
  label.animate(leaving ? [{}, faded] : [faded, {}], { duration: motion.choice, easing: motion.ease, fill: leaving ? 'forwards' : 'none' })
}

function watchEnd({ root, ride, end }: SliderParts): (() => void) | undefined {
  if (!end) return undefined
  const frame = root.getBoundingClientRect()
  const label = end.getBoundingClientRect()
  const rtl = root.matches(RTL)
  const reach = (rtl ? label.right - frame.left : frame.right - label.left) + frame.height / 2
  const observer = new IntersectionObserver(([entry]) => end.toggleAttribute('data-covered', entry !== undefined && entry.intersectionRatio < CLEAR), {
    root,
    rootMargin: rtl ? `0px 0px 0px ${-reach}px` : `0px ${-reach}px 0px 0px`,
    threshold: CLEAR,
  })
  observer.observe(ride)
  return () => observer.disconnect()
}

export function driveSlider(root: HTMLElement, options: SliderOptions): SliderDrive {
  const parts = partsOf(root)
  const { lane, bar, ride } = parts
  let shown = fractionOf(options.value(), options.range())
  let course: Course | undefined
  let held: Held | undefined
  const unwatchEnd = watchEnd(parts)

  const flying = (): boolean => course !== undefined && elapsedOf(course.animations[0]) < course.duration

  const position = (): number => (course && flying() ? course.at(elapsedOf(course.animations[0])) : shown)

  const halt = (): void => {
    course?.animations.forEach((animation) => animation.cancel())
    course = undefined
  }

  const write = (fraction: number): void => {
    shown = fraction
    writeInstance(bar, { '--ts-i-value': fraction })
    writeInstance(ride, { '--ts-i-value': fraction })
  }

  const run = (at: (elapsed: number) => number, duration: number, offsets: readonly number[], easing: string): void => {
    const timing: KeyframeAnimationOptions = { duration, easing }
    const animations = [
      ride.animate(offsets.map((offset) => ({ offset, translate: `${at(offset * duration) * LANE}cqi 0` })), timing),
      bar.animate(offsets.map((offset) => ({ offset, scale: `${at(offset * duration)} 1` })), timing),
    ]
    const now = document.timeline.currentTime
    if (typeof now === 'number') animations.forEach((animation) => (animation.startTime = now))
    course = { at, duration, animations }
  }

  const hop = (to: number, width: number, height: number): void => {
    const from = position()
    halt()
    write(to)
    const flight = planFlight({ kind: 'choice', from: { x: from * width, y: 0 }, to: { x: to * width, y: 0, width: height, height }, motion: readMotion(root) })
    if (flight) run((elapsed) => unit(flight.at(elapsed).x / width), flight.duration, flight.offsets, flight.easing)
  }

  const seek = (to: number, left: number, ease: string): void => {
    const from = position()
    const curve = bezierCurve(ease)
    halt()
    write(to)
    if (from !== to) run((elapsed) => from + (to - from) * curve(Math.min(1, elapsed / left)), left, SEEK_OFFSETS, ease)
  }

  const announce = (value: number): void => {
    root.setAttribute('aria-valuenow', String(value))
    root.setAttribute('aria-valuetext', options.text(value))
  }

  const settle = (stop: number): void => {
    const next = valueOfStop(stop, options.range())
    if (next === options.value()) return
    announce(next)
    options.onInput(next)
  }

  const pull = (over: number, { height, span }: Held): void => {
    writeInstance(root, { '--ts-i-stretch': bandStretch(Math.abs(over), height) / span })
    root.toggleAttribute('data-over', over !== 0)
    if (over !== 0) root.setAttribute('data-wall', over > 0 ? 'end' : 'start')
  }

  const place = (x: number, now: number, grip: Held): void => {
    const range = options.range()
    const stops = stopsOf(range)
    const raw = (grip.sign * (x - grip.offset - grip.origin)) / grip.width
    const fraction = unit(raw)
    pull((raw - fraction) * grip.width, grip)
    if (isStepped(range)) {
      grip.stop = trailingStop(grip.stop, fraction * stops)
      if (grip.stop / stops !== shown) hop(grip.stop / stops, grip.width, grip.height)
      settle(grip.stop)
      return
    }
    const left = grip.lands - now
    if (grip.seeking && left > 0) seek(fraction, left, grip.motion.ease)
    else if (flying() || Math.abs(fraction - shown) * grip.width > STILL) {
      grip.seeking = false
      halt()
      write(fraction)
      root.setAttribute('data-moving', '')
    }
    settle(Math.round(fraction * stops))
  }

  const move = (event: PointerEvent): void => {
    if (!held) return
    if (Math.abs(event.clientX - held.downX) > TAP_SLOP) held.tapped = false
    place(event.clientX, event.timeStamp, held)
  }

  const up = (): void => {
    const grip = held
    if (!grip) return
    held = undefined
    root.removeEventListener('pointermove', move)
    root.removeEventListener('pointerup', up)
    root.removeEventListener('pointercancel', up)
    const range = options.range()
    const stops = stopsOf(range)
    if (grip.tapped) {
      const stop = Math.round(unit((grip.sign * (grip.downX - grip.origin)) / grip.width) * stops)
      settle(stop)
      hop(stop / stops, grip.width, grip.height)
    } else if (!isStepped(range)) write(fractionOf(options.value(), range))
    const style = root.hasAttribute('data-over') && grip.motion.choice > 0 ? getComputedStyle(root) : undefined
    const scale = style?.scale
    writeInstance(root, { '--ts-i-stretch': 0 })
    if (style && scale) root.animate([{ scale }, {}], { duration: grip.motion.choice, easing: style.getPropertyValue('--ts-motion-ease-elastic') })
    for (const state of ['data-dragging', 'data-moving', 'data-over']) root.removeAttribute(state)
    if (options.value() !== grip.before) options.onCommit(options.value())
  }

  const down = (event: PointerEvent): void => {
    if (event.button !== PRIMARY_BUTTON || root.matches(DISABLED)) return
    const track = lane.getBoundingClientRect()
    const end = ride.getBoundingClientRect()
    const sign = root.matches(RTL) ? -1 : 1
    const range = options.range()
    const onCap = event.clientX >= end.left && event.clientX <= end.right
    const motion = readMotion(root)
    if (onCap && !isStepped(range)) {
      const at = position()
      halt()
      write(at)
    }
    held = {
      origin: (sign > 0 ? track.left : track.right) - (sign * end.width) / 2,
      width: track.width,
      span: root.getBoundingClientRect().width,
      height: end.height,
      sign,
      offset: onCap ? event.clientX - (end.left + end.width / 2) : 0,
      lands: event.timeStamp + motion.choice,
      downX: event.clientX,
      before: options.value(),
      motion,
      seeking: !onCap,
      tapped: onCap,
      stop: onCap ? Math.round(shown * stopsOf(range)) : null,
    }
    root.setPointerCapture(event.pointerId)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerup', up)
    root.addEventListener('pointercancel', up)
    root.setAttribute('data-dragging', '')
    if (!onCap) place(event.clientX, event.timeStamp, held)
  }

  const key = (event: KeyboardEvent): void => {
    if (held || event.altKey || event.ctrlKey || event.metaKey || root.matches(DISABLED)) return
    const range = options.range()
    const stops = stopsOf(range)
    const current = Math.round(fractionOf(options.value(), range) * stops)
    const stop = keyStop(event.key, current, stops, root.matches(RTL))
    if (stop === undefined) return
    event.preventDefault()
    if (stop === current) return
    settle(stop)
    hop(stop / stops, lane.getBoundingClientRect().width, ride.getBoundingClientRect().height)
    options.onCommit(options.value())
  }

  root.addEventListener('pointerdown', down)
  root.addEventListener('keydown', key)

  return {
    show() {
      const fraction = fractionOf(options.value(), options.range())
      if (held) return
      announce(options.value())
      if (fraction === shown) return
      halt()
      write(fraction)
    },
    disconnect() {
      up()
      halt()
      unwatchEnd?.()
      root.removeEventListener('pointerdown', down)
      root.removeEventListener('keydown', key)
    },
  }
}
