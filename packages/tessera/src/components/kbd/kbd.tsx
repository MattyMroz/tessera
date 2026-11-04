'use client'

import { Fragment, type ComponentProps, type ReactNode } from 'react'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

const COMBINATION_SEPARATOR = '+'

type KbdBase = Unstyled<ComponentProps<'kbd'>, 'children'> & {
  size?: Choices['size']
}

export type KbdProps = KbdBase & ({ children: ReactNode; keys?: undefined } | { keys: readonly string[]; children?: undefined })

function keyLook(size: Choices['size'] | undefined) {
  return { 'data-recipe': 'control', 'data-variant': 'raised', 'data-size': size, 'data-numeric': '' } as const
}

export function Kbd({ size, keys, children, ...props }: KbdProps) {
  if (keys === undefined) {
    return (
      <kbd {...props} {...keyLook(size)}>
        <span data-slot="label">{children}</span>
      </kbd>
    )
  }
  return (
    <kbd {...props} data-recipe="text" data-variant="kbd">
      {keys.map((key, index) => (
        <Fragment key={`${index}-${key}`}>
          {index > 0 && COMBINATION_SEPARATOR}
          <kbd {...keyLook(size)}>
            <span data-slot="label">{key}</span>
          </kbd>
        </Fragment>
      ))}
    </kbd>
  )
}
