import type { Motion } from '../../src/lib/motion'

export const SPRING: Motion = {
  mode: 'spring',
  pressHold: 100,
  slide: 150,
  elastic: 220,
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  stiffness: 420,
  damping: 36,
  overshoot: 0.1,
}
