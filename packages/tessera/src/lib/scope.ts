import { createContext } from 'react'
import { THEME_CONFIG } from './theme'

export type ScopeAnchor = {
  readonly register: (trigger: Element | null) => void
  readonly copyTo: (popup: Element | null) => void
}

const SCOPE_ATTRIBUTES: readonly string[] = THEME_CONFIG.subtreeAxes.map((axis) => `data-${axis}`)

function inheritScope(trigger: Element, popup: Element): void {
  const root = trigger.ownerDocument.documentElement
  for (const attribute of SCOPE_ATTRIBUTES) {
    const source = trigger.parentElement?.closest(`[${attribute}]`)
    const value = source && source !== root ? source.getAttribute(attribute) : null
    if (value === null) popup.removeAttribute(attribute)
    else popup.setAttribute(attribute, value)
  }
}

export function createScopeAnchor(): ScopeAnchor {
  let current: Element | null = null
  return {
    register: (trigger) => {
      current = trigger
    },
    copyTo: (popup) => {
      if (current && popup) inheritScope(current, popup)
    },
  }
}

export const ScopeContext = createContext<ScopeAnchor | null>(null)
