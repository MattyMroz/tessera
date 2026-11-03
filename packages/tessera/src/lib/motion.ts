export type Motion = {
  readonly pressHold: number
  readonly follow: number
  readonly choice: number
  readonly overshoot: number
  readonly ease: string
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
  const overshoot = Number.parseFloat(read('--ts-motion-choice-overshoot'))
  return {
    pressHold: milliseconds(read('--ts-motion-press-hold')),
    follow: milliseconds(read('--ts-motion-duration-follow')),
    choice: milliseconds(read('--ts-motion-duration-choice')),
    overshoot: Number.isFinite(overshoot) ? overshoot : 0,
    ease: read('--ts-motion-ease-hover').trim(),
  }
}

export function readMotion(element: Element): Motion {
  const style = getComputedStyle(element)
  return parseMotion((name) => style.getPropertyValue(name))
}
