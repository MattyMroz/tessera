'use client'

import CircleSmall from 'lucide-react/icons/circle-small'
import type { ComponentProps, ReactNode } from 'react'
import type { Choices } from '../../lib/theme'
import type { Tone } from '../../lib/tone'
import type { Unstyled } from '../../lib/unstyled'

export const BADGE_VARIANTS = ['soft', 'outline', 'solid', 'ghost'] as const

export type BadgeVariant = (typeof BADGE_VARIANTS)[number]

export type BadgeProps = Unstyled<ComponentProps<'span'>, 'children'> & {
  variant?: BadgeVariant
  tone?: Tone
  size?: Choices['size']
  numeric?: boolean
  dot?: boolean
  children?: ReactNode
}

export function Badge({ variant, tone, size, numeric, dot, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      data-recipe="control"
      data-variant={variant ?? 'soft'}
      data-tone={tone}
      data-size={size ?? 'sm'}
      data-numeric={numeric ? '' : undefined}
    >
      {dot && (
        <span data-slot="icon" data-dot="">
          <CircleSmall />
        </span>
      )}
      {children != null && <span data-slot="label">{children}</span>}
    </span>
  )
}
