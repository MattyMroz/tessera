'use client'

import { Field as BaseField } from '@base-ui/react/field'
import type { ReactNode } from 'react'
import { focusFieldOnPress } from '../../lib/focus-field'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

export type InputProps = Unstyled<BaseField.Control.Props, 'size'> & {
  size?: Choices['size']
  start?: ReactNode
  end?: ReactNode
}

export function Input({ size, start, end, ...props }: InputProps) {
  return (
    <div data-recipe="control" data-variant="field" data-size={size} data-focus="outer" onMouseDown={focusFieldOnPress}>
      {start != null && <span data-slot="icon">{start}</span>}
      <BaseField.Control spellCheck={false} {...props} data-slot="input" />
      {end != null && <span data-slot="icon">{end}</span>}
    </div>
  )
}
