'use client'

import { Radio as BaseRadio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import type { ReactNode } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { watchPresses } from '../../lib/press'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

export type RadioGroupProps = Unstyled<BaseRadioGroup.Props<string>> & {
  size?: Choices['size']
}

export type RadioProps = Unstyled<BaseRadio.Root.Props<string>, 'children' | 'nativeButton'> & {
  children: ReactNode
}

export function RadioGroup({ size, ...props }: RadioGroupProps) {
  return <BaseRadioGroup {...props} data-component="radio" data-size={size} />
}

export function Radio({ ref, children, ...props }: RadioProps) {
  return (
    <label data-component="radio" data-slot="choice">
      <BaseRadio.Root {...props} ref={composeRefs(ref, watchPresses)} data-recipe="control" data-slot="box" data-focus="outer">
        <span data-slot="dot" aria-hidden="true" />
      </BaseRadio.Root>
      <span data-recipe="text" data-variant="label">
        {children}
      </span>
    </label>
  )
}
