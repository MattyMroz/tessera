'use client'

import type { HTMLAttributes } from 'react'
import type { Unstyled } from '../../lib/unstyled'

export type TextVariant = 'label' | 'description' | 'error' | 'kbd'

export type TextElement = 'span' | 'p' | 'div' | 'label'

type TextBase = Unstyled<HTMLAttributes<HTMLElement>> & {
  variant?: TextVariant
  numeric?: boolean
}

export type TextProps = TextBase &
  ({ as: 'label'; htmlFor?: string } | { as?: Exclude<TextElement, 'label'>; htmlFor?: never })

export function Text({ as, variant, numeric, ...props }: TextProps) {
  const Element = as ?? 'span'
  return <Element {...props} data-recipe="text" data-variant={variant} data-numeric={numeric ? '' : undefined} />
}
