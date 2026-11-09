'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { useIndicator } from '../../lib/indicator'
import { watchPresses } from '../../lib/press'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'

const SPOT = "[data-slot='spot']"

export type SwitchProps = Unstyled<BaseSwitch.Root.Props, 'children' | 'nativeButton'> & {
  size?: Choices['size']
  children?: ReactNode
}

export function Switch({ size, ref, children, checked, defaultChecked, onCheckedChange, ...props }: SwitchProps) {
  const [own, setOwn] = useState(defaultChecked ?? false)
  const on = checked ?? own
  const { container, ride, squash, select } = useIndicator({ axis: 'x', items: SPOT, placed: true })
  const offSpot = useRef<HTMLSpanElement>(null)
  const onSpot = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    select(on ? onSpot.current : offSpot.current, null)
  })

  const track = (
    <BaseSwitch.Root
      {...props}
      checked={on}
      onCheckedChange={(next, details) => {
        onCheckedChange?.(next, details)
        if (checked === undefined && !details.isCanceled) setOwn(next)
      }}
      ref={composeRefs(ref, watchPresses, container)}
      data-recipe="control"
      data-slot="track"
      data-size={size}
      data-focus="outer"
    >
      <span ref={ride} data-recipe="indicator" data-variant="thumb" data-on={on ? '' : undefined} aria-hidden="true">
        <span ref={squash} data-slot="squash">
          <span data-slot="bar" />
          <span data-slot="bar" />
        </span>
      </span>
      <span ref={offSpot} data-slot="spot" aria-hidden="true" />
      <span ref={onSpot} data-slot="spot" aria-hidden="true" />
    </BaseSwitch.Root>
  )
  if (children == null)
    return (
      <span data-component="switch" data-slot="choice" data-size={size}>
        {track}
      </span>
    )
  return (
    <label data-component="switch" data-slot="choice" data-size={size}>
      {track}
      <span data-recipe="text" data-variant="label">
        {children}
      </span>
    </label>
  )
}
