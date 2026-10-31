import type { Ref, RefCallback } from 'react'

export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node)
      if (ref) ref.current = node
    })
    if (!cleanups.some((cleanup) => typeof cleanup === 'function')) return
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]
        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      })
    }
  }
}
