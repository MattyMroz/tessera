'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import X from 'lucide-react/icons/x'
import { composeRefs } from '../../lib/compose-refs'
import { POPUP_SLOTS, TITLE_LINE_SIZE, type PopupActionsProps, type PopupDismissProps } from '../../lib/popup-slots'
import { SlotHost, usePart, useSlotOrder } from '../../lib/slot'
import type { Unstyled } from '../../lib/unstyled'
import { Button, type ButtonProps } from '../button/button'

const HOST = 'DialogPopup'

export type DialogDismissProps = PopupDismissProps

export type DialogActionsProps = PopupActionsProps

export const Dialog = BaseDialog.Root

export function DialogTrigger(props: ButtonProps) {
  return <BaseDialog.Trigger render={<Button {...props} />} />
}

export function DialogPopup({ ref, children, ...props }: Unstyled<BaseDialog.Popup.Props>) {
  const slots = useSlotOrder(HOST, POPUP_SLOTS)
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop data-recipe="surface" data-variant="backdrop" />
      <BaseDialog.Popup
        {...props}
        ref={composeRefs(ref, slots)}
        data-recipe="surface"
        data-level="modal"
        data-variant="dialog"
        data-surface=""
        data-inset="card"
      >
        <SlotHost value={HOST}>{children}</SlotHost>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function DialogTitle({ children, ...props }: Unstyled<BaseDialog.Title.Props>) {
  usePart(HOST, 'DialogTitle')
  return (
    <BaseDialog.Title {...props} data-recipe="text" data-variant="title" data-slot="title" data-size={TITLE_LINE_SIZE}>
      <SlotHost value={null}>{children}</SlotHost>
    </BaseDialog.Title>
  )
}

export function DialogDescription({ children, ...props }: Unstyled<BaseDialog.Description.Props>) {
  usePart(HOST, 'DialogDescription')
  return (
    <BaseDialog.Description {...props} data-recipe="text" data-variant="description" data-slot="description">
      <SlotHost value={null}>{children}</SlotHost>
    </BaseDialog.Description>
  )
}

export function DialogActions({ children, ...props }: DialogActionsProps) {
  usePart(HOST, 'DialogActions')
  return (
    <div {...props} data-slot="actions">
      <SlotHost value={null}>{children}</SlotHost>
    </div>
  )
}

export function DialogClose(props: ButtonProps) {
  return <BaseDialog.Close render={<Button {...props} />} />
}

export function DialogDismiss(props: DialogDismissProps) {
  usePart(HOST, 'DialogDismiss')
  return <BaseDialog.Close render={<Button {...props} size={TITLE_LINE_SIZE} icon={<X />} data-slot="close" />} />
}
