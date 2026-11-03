'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import type { ReactNode } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { watchPresses } from '../../lib/press'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

export type CheckboxProps = Unstyled<BaseCheckbox.Root.Props, 'children' | 'nativeButton'> & {
  size?: Choices['size']
  children?: ReactNode
}

export type CheckboxGroupProps = Unstyled<BaseCheckboxGroup.Props> & {
  size?: Choices['size']
}

export function CheckboxGroup({ size, ...props }: CheckboxGroupProps) {
  return <BaseCheckboxGroup {...props} data-component="checkbox" data-size={size} />
}

export function Checkbox({ size, ref, children, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root {...props} ref={composeRefs(ref, watchPresses)} data-recipe="control" data-slot="box" data-size={size} data-focus="outer">
      <span data-slot="mark" aria-hidden="true">
        <svg viewBox="-4 -4 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
        </svg>
        <svg viewBox="-4 -4 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12" pathLength={1} />
        </svg>
      </span>
    </BaseCheckbox.Root>
  )
  if (children == null)
    return (
      <span data-component="checkbox" data-slot="choice" data-size={size}>
        {box}
      </span>
    )
  return (
    <label data-component="checkbox" data-slot="choice" data-size={size}>
      {box}
      <span data-recipe="text" data-variant="label">
        {children}
      </span>
    </label>
  )
}
