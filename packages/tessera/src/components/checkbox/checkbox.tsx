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

export type MarkKind = 'check' | 'dot'

export function Mark({ kind, mixed }: { kind: MarkKind; mixed?: boolean }) {
  return (
    <span data-slot="mark" data-recipe="indicator" data-variant={kind} aria-hidden="true">
      {kind === 'check' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.25l4.5 4.5L19 7.25" pathLength={1} />
        </svg>
      )}
      {mixed === true && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12" pathLength={1} />
        </svg>
      )}
    </span>
  )
}

export function Checkbox({ size, ref, children, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root {...props} ref={composeRefs(ref, watchPresses)} data-recipe="control" data-slot="box" data-size={size} data-focus="outer">
      <Mark kind="check" mixed />
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
