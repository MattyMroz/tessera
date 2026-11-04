'use client'

import type { ComponentProps, ReactNode } from 'react'
import type { Tone } from '../../lib/tone'
import type { Unstyled } from '../../lib/unstyled'
import { Text } from '../text/text'

const DESCRIPTION = { variant: 'description' } as const

export type AlertRole = 'alert' | 'status' | 'note'

export type AlertProps = Unstyled<ComponentProps<'div'>, 'children' | 'role' | 'title'> & {
  tone?: Tone
  icon?: ReactNode
  title?: ReactNode
  role?: AlertRole
  children?: ReactNode
}

export function Alert({ tone, icon, title, role, children, ...props }: AlertProps) {
  return (
    <div
      {...props}
      role={role ?? 'alert'}
      data-component="alert"
      data-recipe="surface"
      data-surface=""
      data-inset="card-small"
      data-tone={tone ?? 'neutral'}
    >
      {icon != null && <span data-slot="icon">{icon}</span>}
      {title != null && (
        <Text as="div" variant="label" data-slot="title">
          {title}
        </Text>
      )}
      {children != null && (
        <Text as="div" {...(title == null ? {} : DESCRIPTION)} data-slot="description">
          {children}
        </Text>
      )}
    </div>
  )
}
