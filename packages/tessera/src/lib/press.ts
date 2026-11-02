import { readMotion } from './motion'

export const PRESSING = 'data-pressing'

const PRIMARY_BUTTON = 0
const RELEASE_EVENTS = ['pointerup', 'pointercancel', 'blur'] as const

export function releaseDelay(pressedAt: number, releasedAt: number, hold: number): number {
  return Math.max(0, hold - (releasedAt - pressedAt))
}

export function trackPress(element: Element): () => void {
  let pressedAt: number | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const lift = (): void => {
    clearTimeout(timer)
    timer = undefined
    element.removeAttribute(PRESSING)
  }
  const unwatch = (): void => {
    for (const type of RELEASE_EVENTS) window.removeEventListener(type, release)
  }
  const release = (event: Event): void => {
    unwatch()
    if (pressedAt === undefined) return
    const delay = releaseDelay(pressedAt, event.timeStamp, readMotion(element).fast)
    pressedAt = undefined
    if (delay === 0) lift()
    else timer = setTimeout(lift, delay)
  }
  const press = (event: Event): void => {
    if (!(event instanceof PointerEvent) || event.button !== PRIMARY_BUTTON) return
    clearTimeout(timer)
    pressedAt = event.timeStamp
    element.setAttribute(PRESSING, '')
    for (const type of RELEASE_EVENTS) window.addEventListener(type, release)
  }

  element.addEventListener('pointerdown', press)
  return () => {
    element.removeEventListener('pointerdown', press)
    unwatch()
    lift()
  }
}

export function pressable(node: Element | null): (() => void) | undefined {
  return node ? trackPress(node) : undefined
}
