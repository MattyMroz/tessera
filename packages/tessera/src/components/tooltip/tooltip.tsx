'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { createContext, use, useId, useState, type ReactElement, type ReactNode, type RefCallback } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { readMotion } from '../../lib/motion'
import { createPopupFlight, usePopupFlight, type PopupFlight } from '../../lib/popup-flight'
import { createScopeAnchor, type ScopeAnchor } from '../../lib/scope'
import { TOOLTIP_GROUP_GRACE } from '../../lib/tooltip-group'

const DEFAULT_SIDE: TooltipSide = 'top'

type BarTip = { readonly trigger: string; readonly copyScope: ScopeAnchor['copyTo']; readonly content: ReactNode }

type Bar = { readonly handle: BaseTooltip.Handle<BarTip>; readonly flight: PopupFlight<HTMLElement> }

const BarContext = createContext<Bar | null>(null)

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export type TooltipProviderProps = {
  readonly children: ReactNode
}

export type TooltipProps = {
  readonly content: ReactNode
  readonly side?: TooltipSide
  readonly children: ReactElement
}

export type TooltipBarProps = {
  readonly side?: TooltipSide
  readonly children: ReactNode
}

type TooltipPopupProps = {
  readonly side: TooltipSide
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
    flight: createPopupFlight<HTMLElement>({ grace: TOOLTIP_GROUP_GRACE, motion: readMotion }),
  }
}

function TooltipPopup({ side, copyScope, positioner, popup, children }: TooltipPopupProps) {
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

export function Tooltip({ content, side, children }: TooltipProps) {
  const bar = use(BarContext)
  const trigger = useId()
  const [{ register, copyTo }] = useState(createScopeAnchor)
  if (bar) {
    return <BaseTooltip.Trigger ref={register} handle={bar.handle} payload={{ trigger, copyScope: copyTo, content }} render={children} />
  }

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger ref={register} render={children} />
      <TooltipPopup side={side ?? DEFAULT_SIDE} copyScope={copyTo}>
        {content}
      </TooltipPopup>
    </BaseTooltip.Root>
  )
}

export function TooltipBar({ side, children }: TooltipBarProps) {
  const [bar] = useState(createBar)

  return (
    <BarContext value={bar}>
      {children}
      <BaseTooltip.Root handle={bar.handle}>
        {({ payload }) => (
          <BarPopup side={side ?? DEFAULT_SIDE} trigger={payload?.trigger} copyScope={payload?.copyScope} flight={bar.flight}>
            {payload?.content}
          </BarPopup>
        )}
      </BaseTooltip.Root>
    </BarContext>
  )
}
