const LABEL = ':scope > [data-slot="label"]'
const TOOLTIP_TRIGGER = 'data-base-ui-tooltip-trigger'
const CHECKS = ['pointerenter', 'focusin'] as const

export function titleWhenCut(element: HTMLElement): () => void {
  let generated: string | null = null
  const owned = (): boolean => generated !== null && element.getAttribute('title') === generated
  const clear = (): void => {
    if (owned()) element.removeAttribute('title')
    generated = null
  }
  const update = (): void => {
    if (element.hasAttribute(TOOLTIP_TRIGGER)) return clear()
    if (element.hasAttribute('title') && !owned()) return
    const label = element.querySelector<HTMLElement>(LABEL)
    if (!label || label.scrollWidth <= label.clientWidth) return clear()
    generated = label.textContent
    element.title = generated
  }
  for (const type of CHECKS) element.addEventListener(type, update)
  return () => {
    for (const type of CHECKS) element.removeEventListener(type, update)
    clear()
  }
}
