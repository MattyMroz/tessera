import { createRef } from 'react'
import { expect, it, vi } from 'vitest'
import { composeRefs } from './compose-refs'

type Node = { id: string }

it('assigns and clears object and callback refs', () => {
  const object = createRef<Node>()
  const callback = vi.fn()
  const node = { id: 'a' }
  const cleanup = composeRefs<Node>(object, callback, undefined, null)(node)
  expect(object.current).toBe(node)
  expect(callback).toHaveBeenLastCalledWith(node)
  expect(cleanup).toBeUndefined()
})

it('detaches every ref when React calls the composed ref with null', () => {
  const object = createRef<Node>()
  const callback = vi.fn()
  const composed = composeRefs<Node>(object, callback)
  composed({ id: 'a' })
  composed(null)
  expect(object.current).toBeNull()
  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback).toHaveBeenLastCalledWith(null)
})

it('honors React 19 cleanup callbacks while clearing the other refs', () => {
  const object = createRef<Node>()
  const release = vi.fn()
  const withCleanup = vi.fn(() => release)
  const callback = vi.fn()
  const cleanup = composeRefs<Node>(object, withCleanup, callback)({ id: 'a' })
  expect(typeof cleanup).toBe('function')
  if (typeof cleanup === 'function') cleanup()
  expect(release).toHaveBeenCalledOnce()
  expect(withCleanup).toHaveBeenCalledOnce()
  expect(callback).toHaveBeenLastCalledWith(null)
  expect(object.current).toBeNull()
})
