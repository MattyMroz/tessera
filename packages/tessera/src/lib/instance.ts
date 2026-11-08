export const INSTANCE_KEYS = {
  '--ts-i-value': '<number>',
  '--ts-i-inline-size': '<length>',
  '--ts-i-block-size': '<length>',
  '--ts-i-tip-x': '<length>',
  '--ts-i-tip-y': '<length>',
  '--ts-i-tip-width': '<length>',
  '--ts-i-tip-arrow': '<length>',
  '--ts-i-tip-room': '<length>',
} as const

export type InstanceKey = keyof typeof INSTANCE_KEYS

export type InstanceValues = { readonly [K in InstanceKey]?: string | number }

export function writeInstance(element: ElementCSSInlineStyle, values: InstanceValues): void {
  for (const [key, value] of Object.entries(values)) element.style.setProperty(key, String(value))
}
