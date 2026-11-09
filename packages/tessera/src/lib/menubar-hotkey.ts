'use client'

import { useEffect } from 'react'

export type HotkeyEvent = {
  readonly key: string
  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean
  readonly repeat: boolean
}

export type HotkeyState = { readonly altAlone: boolean }

export const HOTKEY_IDLE: HotkeyState = { altAlone: false }

export type HotkeyStep = { readonly state: HotkeyState; readonly focus: boolean }

export function hotkeyDown(state: HotkeyState, event: HotkeyEvent, idle: boolean): HotkeyStep {
  if (event.key === 'Alt') return { state: { altAlone: !event.repeat || state.altAlone }, focus: false }
  const plain = !event.altKey && !event.ctrlKey && !event.metaKey
  if (event.key === 'F10' && plain && !event.shiftKey) return { state: HOTKEY_IDLE, focus: true }
  if (event.key === 'Tab' && plain && !event.shiftKey && idle) return { state: HOTKEY_IDLE, focus: true }
  return { state: HOTKEY_IDLE, focus: false }
}

export function hotkeyUp(state: HotkeyState, event: HotkeyEvent): HotkeyStep {
  if (event.key === 'Alt' && state.altAlone) return { state: HOTKEY_IDLE, focus: true }
  return { state, focus: false }
}

const FIRST_MENU = '[role="menubar"] > [role="menuitem"]:not(:disabled)'

export function useMenubarHotkeys(): void {
  useEffect(() => watchMenubarHotkeys(() => globalThis.document.querySelector<HTMLElement>(FIRST_MENU)), [])
}

function watchMenubarHotkeys(first: () => HTMLElement | null): () => void {
  let state = HOTKEY_IDLE
  const view = globalThis.document
  const idle = () => view.activeElement === null || view.activeElement === view.body
  const go = (step: HotkeyStep, event: KeyboardEvent) => {
    state = step.state
    const target = step.focus ? first() : null
    if (target === null) return
    event.preventDefault()
    target.focus()
  }
  const down = (event: KeyboardEvent) => go(hotkeyDown(state, event, idle()), event)
  const up = (event: KeyboardEvent) => go(hotkeyUp(state, event), event)
  const reset = () => {
    state = HOTKEY_IDLE
  }
  view.addEventListener('keydown', down)
  view.addEventListener('keyup', up)
  view.addEventListener('pointerdown', reset)
  return () => {
    view.removeEventListener('keydown', down)
    view.removeEventListener('keyup', up)
    view.removeEventListener('pointerdown', reset)
  }
}
