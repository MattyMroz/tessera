'use client'

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { useLayoutEffect, useState, type ReactNode } from 'react'
import type { Tone } from '../../lib/tone'
import { Alert } from '../alert/alert'
import { Button, type ButtonProps } from '../button/button'
import { DialogActions, DialogClose, DialogDescription, DialogPopup, DialogTitle } from './dialog'

export type ConfirmOptions = {
  title: ReactNode
  description?: ReactNode
  tone?: Tone
  confirmLabel: ReactNode
  cancelLabel: ReactNode
  onConfirm?: () => Promise<void>
}

type ConfirmRequest = ConfirmOptions & {
  readonly id: number
  readonly settle: (confirmed: boolean) => void
}

type Run = { readonly id: number; readonly pending: boolean; readonly error?: string }

type ConfirmPopupProps = {
  readonly request: ConfirmRequest
  readonly run: Run | undefined
  readonly onRun: (run: Run) => void
}

const CLOSED_BY_CODE = 'imperative-action'

const confirmHandle = BaseAlertDialog.createHandle<ConfirmRequest>()

let latest: ConfirmRequest | undefined

export const AlertDialog = BaseAlertDialog.Root

export function AlertDialogTrigger(props: ButtonProps) {
  return <BaseAlertDialog.Trigger render={<Button {...props} />} />
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const request: ConfirmRequest = { ...options, id: (latest?.id ?? 0) + 1, settle: resolve }
    latest = request
    confirmHandle.openWithPayload(request)
    if (!confirmHandle.isOpen) resolve(false)
  })
}

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

function ConfirmPopup({ request, run, onRun }: ConfirmPopupProps) {
  const pending = run?.pending ?? false

  useLayoutEffect(() => () => request.settle(false), [request])

  const accept = async (): Promise<void> => {
    if (request.onConfirm === undefined) {
      request.settle(true)
      confirmHandle.close()
      return
    }
    onRun({ id: request.id, pending: true })
    try {
      await request.onConfirm()
    } catch (reason) {
      onRun({ id: request.id, pending: false, error: messageOf(reason) })
      return
    }
    request.settle(true)
    confirmHandle.close()
  }

  return (
    <DialogPopup>
      <DialogTitle>{request.title}</DialogTitle>
      {request.description != null && <DialogDescription>{request.description}</DialogDescription>}
      {run?.error !== undefined && <Alert tone="danger">{run.error}</Alert>}
      <DialogActions>
        <DialogClose aria-disabled={pending || undefined}>{request.cancelLabel}</DialogClose>
        <Button variant="solid" tone={request.tone ?? 'accent'} busy={pending} onClick={() => void accept()}>
          {request.confirmLabel}
        </Button>
      </DialogActions>
    </DialogPopup>
  )
}

export function ConfirmHost() {
  const [run, setRun] = useState<Run>()
  return (
    <BaseAlertDialog.Root
      handle={confirmHandle}
      onOpenChange={(open, details) => {
        if (open || latest === undefined) return
        if (run?.id === latest.id && run.pending && details.reason !== CLOSED_BY_CODE) details.cancel()
        else latest.settle(false)
      }}
    >
      {({ payload }) => payload && <ConfirmPopup key={payload.id} request={payload} run={run?.id === payload.id ? run : undefined} onRun={setRun} />}
    </BaseAlertDialog.Root>
  )
}
