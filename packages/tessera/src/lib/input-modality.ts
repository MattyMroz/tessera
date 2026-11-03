export type InputModality = 'pointer' | 'keyboard'

export type KeyStroke = Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'isComposing' | 'target'>

export type ModalityRoot = Pick<Document, 'addEventListener'> & {
  readonly documentElement: Pick<Element, 'getAttribute' | 'setAttribute'>
  readonly activeElement: EventTarget | null
}

export const INPUT_CONFIG = {
  attribute: 'data-input',
  focusTarget: '[data-focus]',
  keys: ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'],
  textField: 'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
} as const

type InputConfig = typeof INPUT_CONFIG

export function navigates(stroke: KeyStroke, config: InputConfig = INPUT_CONFIG): boolean {
  if (stroke.isComposing || stroke.altKey || stroke.ctrlKey || stroke.metaKey) return false
  if (stroke.key.length !== 1) return config.keys.some((key) => key === stroke.key)
  return !(stroke.target instanceof Element && stroke.target.matches(config.textField))
}

export function trackInputModality(root: ModalityRoot, config: InputConfig, isNavigation: typeof navigates): void {
  let last: InputModality | null = null
  const stamp = (target: EventTarget | null): void => {
    if (last === null || target === null || !(target instanceof Element) || !target.matches(config.focusTarget)) return
    if (target.getAttribute(config.attribute) !== last) target.setAttribute(config.attribute, last)
  }
  const mark = (modality: InputModality): void => {
    last = modality
    const element = root.documentElement
    if (element.getAttribute(config.attribute) !== modality) element.setAttribute(config.attribute, modality)
    stamp(root.activeElement)
  }
  root.addEventListener('focusin', (event) => stamp(event.target), { capture: true })
  root.addEventListener('pointerdown', () => mark('pointer'), { capture: true })
  root.addEventListener(
    'keydown',
    (event) => {
      if (isNavigation(event, config)) mark('keyboard')
    },
    { capture: true },
  )
}
