import type { ReactNode } from 'react'

const EFFORT = ['Low', 'Medium', 'High', 'Extra high'] as const

export const EFFORT_STOPS = EFFORT.length - 1
export const TRACK_SECONDS = 245

const SECONDS_IN_MINUTE = 60
const CLOCK_DIGITS = 2

export function effort(value: number): string {
  return EFFORT[value] ?? ''
}

export function percent(value: number): string {
  return `${value}%`
}

export function dollars(value: number): string {
  return `$${value}`
}

export function clock(seconds: number): string {
  return `${Math.floor(seconds / SECONDS_IN_MINUTE)}:${String(seconds % SECONDS_IN_MINUTE).padStart(CLOCK_DIGITS, '0')}`
}

export function Icon({ children }: { readonly children: ReactNode }) {
  return (
    <span className="px-icon" aria-hidden="true">
      {children}
    </span>
  )
}
