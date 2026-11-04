const ALIGN_PASSES = 3

function textRect(element: HTMLElement): DOMRect {
  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
}

function alignText(positioner: HTMLElement, popup: HTMLElement, value: HTMLElement | null, chosen: string): void {
  const text = popup.querySelector<HTMLElement>(chosen)
  if (value === null || text === null) return
  const from = textRect(text)
  const to = textRect(value)
  const box = positioner.getBoundingClientRect()
  const view = positioner.ownerDocument.defaultView
  if (view === null) return
  const zoom = positioner.currentCSSZoom
  const margin = Number.parseFloat(getComputedStyle(positioner).marginTop)
  positioner.style.position = 'absolute'
  positioner.style.bottom = 'auto'
  if (popup.scrollHeight - popup.clientHeight <= 1) {
    positioner.style.height = 'auto'
    popup.style.height = 'auto'
    popup.style.overflow = 'visible'
  }
  let left = (box.left + to.left - from.left) / zoom + view.scrollX
  let top = (box.top + to.top - from.top) / zoom + view.scrollY - margin
  for (let pass = 0; pass < ALIGN_PASSES; pass += 1) {
    positioner.style.left = `${left}px`
    positioner.style.top = `${top}px`
    const placed = textRect(text)
    left += (to.left - placed.left) / zoom
    top += (to.top - placed.top) / zoom
  }
}

export type AlignParts = {
  readonly positioner: HTMLElement
  readonly popup: HTMLElement
  readonly value: () => HTMLElement | null
  readonly chosen: string
}

export function watchAlignText({ positioner, popup, value, chosen }: AlignParts): () => void {
  let frame = 0
  const align = () => {
    if (!popup.hasAttribute('data-open')) return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      alignText(positioner, popup, value(), chosen)
      observer.takeRecords()
    })
  }
  const follow = (event: Event) => {
    if (event.target instanceof Node && popup.contains(event.target)) return
    align()
  }
  const observer = new MutationObserver(align)
  observer.observe(positioner, { attributes: true, attributeFilter: ['style'] })
  observer.observe(popup, { attributes: true, attributeFilter: ['data-open'] })
  const view = positioner.ownerDocument
  view.addEventListener('scroll', follow, { capture: true, passive: true })
  align()
  return () => {
    observer.disconnect()
    view.removeEventListener('scroll', follow, { capture: true })
    cancelAnimationFrame(frame)
  }
}
