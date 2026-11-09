'use client'

import { Field as BaseField } from '@base-ui/react/field'
import type { ComponentProps, CSSProperties } from 'react'
import { focusFieldOnPress } from '../../lib/focus-field'
import type { InstanceValues } from '../../lib/instance'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

export type TextareaProps = Unstyled<ComponentProps<'textarea'>> & {
  size?: Choices['size']
  maxRows?: number
}

export function Textarea({ size, maxRows, value, defaultValue, disabled, id, name, ...props }: TextareaProps) {
  return (
    <div data-recipe="control" data-variant="field" data-size={size} data-focus="outer" onMouseDown={focusFieldOnPress}>
      <BaseField.Control
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        render={
          <textarea
            spellCheck={false}
            {...props}
            data-slot="input"
            data-max-rows={maxRows === undefined ? undefined : ''}
            style={{ '--ts-i-value': maxRows ?? 0 } satisfies InstanceValues as CSSProperties}
          />
        }
      />
    </div>
  )
}
