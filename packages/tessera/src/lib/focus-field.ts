import type { MouseEvent } from 'react'

const FOCUSABLE = ':is(button, input, select, textarea, [tabindex]):not(:disabled, [tabindex="-1"])'

export function focusFieldOnPress(event: MouseEvent<HTMLElement>): void {
  const host = event.currentTarget
  const field = host.querySelector(':scope > [data-slot="input"]')
  const target = event.target
  if (!(field instanceof HTMLElement) || !(target instanceof Element) || target === field || field.matches(':disabled')) return
  if (host.contains(target.closest('button, a[href]'))) return
  event.preventDefault()
  field.focus()
}

export function focusFieldOfLabel(event: MouseEvent<HTMLLabelElement>): void {
  const label = event.currentTarget
  if (event.defaultPrevented || label.control) return
  const target =
    (label.htmlFor ? label.ownerDocument.getElementById(label.htmlFor) : null) ??
    label.closest('[data-component="field"]')?.querySelector(FOCUSABLE)
  if (target instanceof HTMLElement) target.focus()
}
