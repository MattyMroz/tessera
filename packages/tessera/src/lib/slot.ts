'use client'

import { createContext, use, useLayoutEffect, useRef, type Context, type RefCallback } from 'react'

export type SlotOrder = readonly (string | null)[]

export const SlotHost = createContext<string | null>(null)

function misplacedPart(part: string, host: string, place: string): Error {
  return new Error(`Tessera: <${part}> is a part of <${host}>: place it ${place}.`)
}

export function usePart(host: string, part: string): void {
  if (use(SlotHost) !== host) throw misplacedPart(part, host, `inside <${host}>, outside its other parts`)
}

export function useHost<T>(context: Context<T | null>, host: string, part: string): T {
  const value = use(context)
  if (value === null) throw misplacedPart(part, host, `inside <${host}>`)
  return value
}

function nameOf(slot: string | null): string {
  return slot ?? 'content'
}

export function misplacedSlot(host: string, order: SlotOrder, slots: readonly (string | null)[]): string | undefined {
  let reached = 0
  let previous: string | null = null
  for (const found of slots) {
    const slot = found !== null && order.includes(found) ? found : null
    const rank = order.indexOf(slot)
    if (rank < reached) {
      return `Tessera: <${host}> lays out its slots in the order ${order.map(nameOf).join(', ')}, so the ${nameOf(slot)} cannot come after the ${nameOf(previous)}.`
    }
    reached = rank
    previous = slot
  }
  return undefined
}

function verifySlots(host: string, order: SlotOrder, element: Element | null): void {
  if (!element) return
  const problem = misplacedSlot(
    host,
    order,
    Array.from(element.children, (child) => child.getAttribute('data-slot')),
  )
  if (problem !== undefined) throw new Error(problem)
}

export function useSlotOrder(host: string, order: SlotOrder): RefCallback<Element> {
  const attached = useRef<Element | null>(null)
  useLayoutEffect(() => verifySlots(host, order, attached.current))
  return (node: Element | null) => {
    attached.current = node
    verifySlots(host, order, node)
  }
}
