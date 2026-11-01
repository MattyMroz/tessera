import { THEME_CONFIG, type Choices } from './theme'

export type MotionMode = Choices['motion']

export type Motion = {
  readonly mode: MotionMode
  readonly fast: number
  readonly slide: number
  readonly elastic: number
  readonly standard: string
  readonly stiffness: number
  readonly damping: number
  readonly overshoot: number
}

export const MILLISECONDS_PER_SECOND = 1000

export function milliseconds(value: string): number {
  const text = value.trim()
  const amount = Number.parseFloat(text)
  if (!Number.isFinite(amount)) return 0
  if (text.endsWith('ms')) return amount
  return text.endsWith('s') ? amount * MILLISECONDS_PER_SECOND : 0
}

export function parseMotion(read: (name: string) => string): Motion {
  const mode = read('--ts-motion-mode').trim()
  const number = (name: string): number => {
    const value = Number.parseFloat(read(name))
    return Number.isFinite(value) ? value : 0
  }
  return {
    mode: THEME_CONFIG.axes.motion.find((option) => option === mode) ?? 'off',
    fast: milliseconds(read('--ts-motion-duration-fast')),
    slide: milliseconds(read('--ts-motion-duration-slide')),
    elastic: milliseconds(read('--ts-motion-duration-elastic')),
    standard: read('--ts-motion-ease-standard').trim(),
    stiffness: number('--ts-motion-spring-stiffness'),
    damping: number('--ts-motion-spring-damping'),
    overshoot: number('--ts-motion-elastic-overshoot'),
  }
}

export function readMotion(element: Element): Motion {
  const style = getComputedStyle(element)
  return parseMotion((name) => style.getPropertyValue(name))
}
