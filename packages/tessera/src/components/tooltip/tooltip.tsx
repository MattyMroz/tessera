'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { createContext, use, useId, useRef, useState, type PointerEvent, type ReactElement, type ReactNode, type RefCallback } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { readMotion } from '../../lib/motion'
import { createPopupFlight, usePopupFlight, type PopupFlight } from '../../lib/popup-flight'
import { createScopeAnchor, type ScopeAnchor } from '../../lib/scope'
import { TOOLTIP_CLOSE_DELAY, TOOLTIP_GROUP_GRACE, TOOLTIP_OPEN_DELAY } from '../../lib/tooltip-group'

const DEFAULT_SIDE: TooltipSide = 'top'
const BAR_SIDE: Readonly<Record<TooltipBarOrientation, TooltipSide>> = { horizontal: 'top', vertical: 'right' }
const TOOLTIP_POPUP = "[data-variant='tooltip']"
const TRIGGER_TIMING ={ delay: TOOLTIP_OPEN_DELAY, closeDelay: TOOLTIP_CLOSE_DELAY } as const

type BarTip = { readonly trigger: string; readonly copyScope: ScopeAnchor['copyTo']; readonly content: ReactNode }

type Bar = { readonly handle: BaseTooltip.Handle<BarTip>; readonly flight: PopupFlight<HTMLElement> }

const BarContext = createContext<Bar | null>(null)

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export type TooltipBarOrientation = 'horizontal' | 'vertical'

export type TooltipProviderProps = {
  readonly children: ReactNode
}

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

type TooltipPopupProps = {
  readonly side: TooltipSide
  readonly arrow: boolean
  readonly copyScope: ScopeAnchor['copyTo'] | undefined
  readonly positioner?: RefCallback<HTMLElement>
  readonly popup?: RefCallback<HTMLElement>
  readonly children: ReactNode
}

type BarPopupProps = Omit<TooltipPopupProps, 'positioner' | 'popup'> & {
  readonly trigger: string | undefined
  readonly flight: PopupFlight<HTMLElement>
}

function createBar(): Bar {
  return {
    handle: BaseTooltip.createHandle<BarTip>(),
    flight: createPopupFlight<HTMLElement>({ grace: () => TOOLTIP_GROUP_GRACE, motion: readMotion }),
  }
}

function TooltipPopup({ side, arrow, copyScope, positioner, popup, children }: TooltipPopupProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner ref={positioner} side={side}>
        <BaseTooltip.Popup
          ref={composeRefs(popup, copyScope)}
          data-recipe="surface"
          data-surface=""
          data-inset="inset"
          data-level="overlay"
          data-variant="tooltip"
          data-material="solid"
        >
          {arrow ? <BaseTooltip.Arrow data-slot="arrow" /> : null}
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}

function BarPopup({ flight, trigger, ...props }: BarPopupProps) {
  const { positioner, popup } = usePopupFlight(flight, trigger)
  return <TooltipPopup {...props} positioner={positioner} popup={popup} />
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <BaseTooltip.Provider timeout={TOOLTIP_GROUP_GRACE}>{children}</BaseTooltip.Provider>
}

export function Tooltip({ content, side, arrow, children }: TooltipProps) {
  const bar = use(BarContext)
  const trigger = useId()
  const [{ register, copyTo }] = useState(createScopeAnchor)
  if (bar) {
    return (
      <BaseTooltip.Trigger
        ref={register}
        handle={bar.handle}
        payload={{ trigger, copyScope: copyTo, content }}
        {...TRIGGER_TIMING}
        render={children}
      />
    )
  }

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger ref={register} {...TRIGGER_TIMING} render={children} />
      <TooltipPopup side={side ?? DEFAULT_SIDE} arrow={arrow ?? true} copyScope={copyTo}>
        {content}
      </TooltipPopup>
    </BaseTooltip.Root>
  )
}

export function TooltipBar({ orientation, side, arrow, children }: TooltipBarProps) {
  const [bar] = useState(createBar)
  const axis = orientation ?? 'horizontal'
  const group = useRef<HTMLDivElement>(null)
  const leaving = useRef<number | undefined>(undefined)

  const holdInGap = (open: boolean, details: BaseTooltip.Root.ChangeEventDetails): void => {
    if (!open && details.reason === 'trigger-hover' && group.current?.matches(':hover')) details.cancel()
  }
  const stay = (): void => window.clearTimeout(leaving.current)
  const leave = (event: PointerEvent<HTMLDivElement>): void => {
    stay()
    const onPopup = event.relatedTarget instanceof Element && event.relatedTarget.closest(TOOLTIP_POPUP) !== null
    const focused = group.current?.querySelector(':focus-visible') ?? null
    if (onPopup || focused) return
    leaving.current = window.setTimeout(() => bar.handle.close(), TOOLTIP_CLOSE_DELAY)
  }

  return (
    <BarContext value={bar}>
      <div ref={group} data-component="tooltip-bar" data-orientation={axis} onPointerEnter={stay} onPointerLeave={leave}>
        {children}
      </div>
      <BaseTooltip.Root handle={bar.handle} onOpenChange={holdInGap}>
        {({ payload }) => (
          <BarPopup side={side ?? BAR_SIDE[axis]} arrow={arrow ?? true} trigger={payload?.trigger} copyScope={payload?.copyScope} flight={bar.flight}>
            {payload?.content}
          </BarPopup>
        )}
      </BaseTooltip.Root>
    </BarContext>
  )
}
