'use client'

import type { ReactNode, Ref } from 'react'
import type { Choices } from '../../lib/theme'

export type ButtonGroupVariant = 'track' | 'joined'

export type ButtonGroupProps = {
  readonly variant: ButtonGroupVariant
  readonly size?: Choices['size']
  readonly 'aria-label': string
  readonly ref?: Ref<HTMLDivElement>
  readonly children: ReactNode
}

export function ButtonGroup({ variant, size, 'aria-label': label, ref, children }: ButtonGroupProps) {
  const track = variant === 'track'
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-component="button-group"
      data-recipe="surface"
      data-level={track ? 'sunken' : undefined}
      data-surface={variant}
      data-inset={track ? 'inset' : undefined}
      data-size={size}
    >
      {children}
    </div>
  )
}
