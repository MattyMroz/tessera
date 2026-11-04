'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { THEME_CONFIG, applyChoices, readSaved, resolveChoices, writeSaved, type Axis, type Choices, type Theme } from './theme'

export type ThemeControls = {
  choices: Choices
  setChoice: <A extends Axis>(axis: A, value: Choices[A]) => void
  reset: () => void
}

const NOTHING_SAVED: Theme = {}
const listeners = new Set<() => void>()
let saved: Theme | undefined

function savedSnapshot(): Theme {
  saved ??= readSaved(window) ?? NOTHING_SAVED
  return saved
}

function serverSnapshot(): Theme {
  return NOTHING_SAVED
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function publish(next: Theme): void {
  saved = next
  for (const listener of listeners) listener()
}

function show(theme: Theme, next: Theme): void {
  applyChoices(document.documentElement, resolveChoices(theme, next), window.matchMedia(THEME_CONFIG.darkQuery).matches)
}

export function useTheme(theme: Theme): ThemeControls {
  const layer = useSyncExternalStore(subscribe, savedSnapshot, serverSnapshot)
  const choices = resolveChoices(theme, layer)

  useEffect(() => {
    const follow = (event: StorageEvent) => {
      if (event.key !== null && event.key !== THEME_CONFIG.storageKey) return
      const next = readSaved(window) ?? NOTHING_SAVED
      show(theme, next)
      publish(next)
    }
    window.addEventListener('storage', follow)
    return () => window.removeEventListener('storage', follow)
  }, [theme])

  const save = (next: Theme) => {
    writeSaved(window, next)
    show(theme, next)
    publish(next)
  }

  return {
    choices,
    setChoice: (axis, value) => save({ ...savedSnapshot(), [axis]: value }),
    reset: () => save(NOTHING_SAVED),
  }
}
