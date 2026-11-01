export type InputModality = 'pointer' | 'keyboard'

export type KeyStroke = Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'isComposing' | 'target'>

export type ModalityRoot = Pick<Document, 'addEventListener'> & {
  readonly documentElement: Pick<Element, 'getAttribute' | 'setAttribute'>
}

export const INPUT_CONFIG = {
  attribute: 'data-input',
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
  const mark = (modality: InputModality): void => {
    const element = root.documentElement
    if (element.getAttribute(config.attribute) !== modality) element.setAttribute(config.attribute, modality)
  }
  root.addEventListener('pointerdown', () => mark('pointer'), { capture: true })
  root.addEventListener(
    'keydown',
    (event) => {
      if (isNavigation(event, config)) mark('keyboard')
    },
    { capture: true },
  )
}
