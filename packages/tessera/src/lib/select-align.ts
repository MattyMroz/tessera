function textRect(element: HTMLElement): DOMRect {
  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
}

export type AlignParts = {
  readonly positioner: HTMLElement | null
  readonly value: HTMLElement | null
  readonly chosen: string
}

type Offsets = { readonly side: number; readonly align: number }

const NO_OFFSETS: Offsets = { side: 0, align: 0 }

function measure({ positioner: frame, value: shown, chosen }: AlignParts): Offsets {
  const text = frame?.querySelector<HTMLElement>(chosen) ?? null
  const trigger = shown?.closest('button') ?? null
  if (frame === null || shown === null || text === null || trigger === null) return NO_OFFSETS
  const zoom = frame.currentCSSZoom ?? 1
  const anchor = trigger.getBoundingClientRect()
  const box = frame.getBoundingClientRect()
  const to = textRect(shown)
  const from = textRect(text)
  return {
    side: (to.top - anchor.bottom - (from.top - box.top)) / zoom,
    align: (to.left - anchor.left - (from.left - box.left)) / zoom,
  }
}

export function textOnValue(parts: AlignParts): { readonly side: () => number; readonly align: () => number } {
  return { side: () => measure(parts).side, align: () => measure(parts).align }
}
