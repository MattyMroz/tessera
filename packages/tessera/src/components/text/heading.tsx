'use client'

import type { ComponentProps } from 'react'
import type { Unstyled } from '../../lib/unstyled'

export type HeadingLevel = 1 | 2 | 3 | 4

export type HeadingVariant = 'title' | 'display'

export type HeadingProps = Unstyled<ComponentProps<'h1'>> & {
  level: HeadingLevel
  variant?: HeadingVariant
}

export function Heading({ level, variant, ...props }: HeadingProps) {
  const Element = `h${level}` as const
  return <Element {...props} data-recipe="text" data-variant={variant ?? 'title'} />
}
