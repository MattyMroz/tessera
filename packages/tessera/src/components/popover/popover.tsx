'use client'

import { Popover as BasePopover } from '@base-ui/react/popover'
import X from 'lucide-react/icons/x'
import { useState } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { POPUP_SLOTS, type PopupActionsProps, type PopupDismissProps } from '../../lib/popup-slots'
import { createScopeAnchor, ScopeContext } from '../../lib/scope'
import { SlotHost, useHost, usePart, useSlotOrder } from '../../lib/slot'
import type { Unstyled } from '../../lib/unstyled'
import { Button, type ButtonProps } from '../button/button'

const HOST = 'PopoverPopup'

export type PopoverDismissProps = PopupDismissProps

export type PopoverActionsProps = PopupActionsProps

export function Popover(props: BasePopover.Root.Props) {
  const [anchor] = useState(createScopeAnchor)
  return (
    <ScopeContext value={anchor}>
      <BasePopover.Root {...props} />
    </ScopeContext>
  )
}

export function PopoverTrigger(props: ButtonProps) {
  const { register } = useHost(ScopeContext, 'Popover', 'PopoverTrigger')
  return <BasePopover.Trigger ref={register} render={<Button {...props} />} />
}

export function PopoverPopup({ ref, children, ...props }: Unstyled<BasePopover.Popup.Props>) {
  const { copyTo } = useHost(ScopeContext, 'Popover', 'PopoverPopup')
  const slots = useSlotOrder(HOST, POPUP_SLOTS)
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner>
        <BasePopover.Popup
          {...props}
          ref={composeRefs(ref, copyTo, slots)}
          data-recipe="surface"
          data-level="overlay"
          data-variant="popover"
          data-surface=""
          data-inset="group"
        >
          <SlotHost value={HOST}>{children}</SlotHost>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

export function PopoverTitle({ children, ...props }: Unstyled<BasePopover.Title.Props>) {
  usePart(HOST, 'PopoverTitle')
  return (
    <BasePopover.Title {...props} data-recipe="text" data-variant="title" data-slot="title">
      <SlotHost value={null}>{children}</SlotHost>
    </BasePopover.Title>
  )
}

export function PopoverDescription({ children, ...props }: Unstyled<BasePopover.Description.Props>) {
  usePart(HOST, 'PopoverDescription')
  return (
    <BasePopover.Description {...props} data-recipe="text" data-variant="description" data-slot="description">
      <SlotHost value={null}>{children}</SlotHost>
    </BasePopover.Description>
  )
}

export function PopoverActions({ children, ...props }: PopoverActionsProps) {
  usePart(HOST, 'PopoverActions')
  return (
    <div {...props} data-slot="actions">
      <SlotHost value={null}>{children}</SlotHost>
    </div>
  )
}

export function PopoverClose(props: ButtonProps) {
  return <BasePopover.Close render={<Button {...props} />} />
}

export function PopoverDismiss(props: PopoverDismissProps) {
  usePart(HOST, 'PopoverDismiss')
  return <BasePopover.Close render={<Button {...props} icon={<X />} data-slot="close" />} />
}
