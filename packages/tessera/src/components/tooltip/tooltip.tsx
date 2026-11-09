'use client'

import { useRender } from '@base-ui/react/use-render'
import { createContext, use, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { createTipGroup, type TipGroup, type TipShown, type TipSide } from '../../lib/tooltip'

const DEFAULT_SIDE: TooltipSide = 'top'
const BAR_SIDE: Readonly<Record<TooltipBarOrientation, TooltipSide>> = { horizontal: 'top', vertical: 'right' }

const BarContext = createContext<TipGroup | null>(null)

export type TooltipSide = TipSide

export type TooltipBarOrientation = 'horizontal' | 'vertical'

export type TooltipProps = {
  readonly content: ReactNode
  readonly side?: TooltipSide
  readonly arrow?: boolean
  readonly children: ReactElement
}

export type TooltipBarProps = {
  readonly orientation?: TooltipBarOrientation
  readonly side?: TooltipSide
  readonly arrow?: boolean
  readonly children: ReactNode
}

type BubbleProps = {
  readonly group: TipGroup
  readonly arrow: boolean
}

const NOTHING: TipShown = { content: null, previous: null, turn: 0 }

function nothing(): TipShown {
  return NOTHING
}

function Bubble({ group, arrow }: BubbleProps) {
  const shown = useSyncExternalStore(group.subscribe, group.shown, nothing)
  const id = useId()
  const { placed, attach } = group

  useLayoutEffect(placed, [shown, placed])

  if (shown.turn === 0) return null
  return createPortal(
    <div
      ref={attach}
      id={id}
      popover="manual"
      role="tooltip"
      data-recipe="surface"
      data-surface=""
      data-inset="inset"
      data-level="overlay"
      data-variant="tooltip"
      data-material="solid"
    >
      {arrow ? (
        <svg data-slot="arrow" fill="currentColor" aria-hidden="true" focusable="false">
          <path />
        </svg>
      ) : null}
      <span data-slot="clip">
        {shown.previous === null ? null : (
          <span key={shown.turn - 1} data-slot="label" data-leaving="">
            {shown.previous}
          </span>
        )}
        <span key={shown.turn} data-slot="label" data-entering={shown.previous === null ? undefined : ''}>
          {shown.content}
        </span>
      </span>
    </div>,
    document.body,
  )
}

function useTrigger(group: TipGroup, content: ReactNode, children: ReactElement): ReactElement {
  const trigger = useRef<HTMLElement | null>(null)
  const { describe } = group

  useLayoutEffect(() => {
    if (trigger.current) describe(trigger.current, content)
  })

  return useRender({ render: children, ref: trigger, props: group.trigger })
}

export function Tooltip({ content, side, arrow, children }: TooltipProps) {
  const bar = use(BarContext)
  const wanted = side ?? DEFAULT_SIDE
  const [own] = useState(() => createTipGroup({ side: () => wanted, heldByGroup: false }))
  const element = useTrigger(bar ?? own, content, children)
  if (bar) return element
  return (
    <>
      {element}
      <Bubble group={own} arrow={arrow ?? true} />
    </>
  )
}

export function TooltipBar({ orientation, side, arrow, children }: TooltipBarProps) {
  const axis = orientation ?? 'horizontal'
  const wanted = side ?? BAR_SIDE[axis]
  const [group] = useState(() => createTipGroup({ side: () => wanted, heldByGroup: true }))
  const { enterGroup, leaveGroup } = group

  return (
    <BarContext value={group}>
      <div data-component="tooltip-bar" data-orientation={axis} onPointerEnter={enterGroup} onPointerLeave={leaveGroup}>
        {children}
      </div>
      <Bubble group={group} arrow={arrow ?? true} />
    </BarContext>
  )
}
