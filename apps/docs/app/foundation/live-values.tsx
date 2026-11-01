'use client'

import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Fragment, useEffect, useRef } from 'react'

export function LiveValues({ names }: { names: readonly string[] }) {
  const list = useRef<HTMLDListElement>(null)

  useEffect(() => {
    const show = () => {
      const computed = getComputedStyle(document.documentElement)
      for (const value of list.current?.querySelectorAll<HTMLElement>('[data-variable]') ?? []) {
        value.textContent = computed.getPropertyValue(value.dataset.variable ?? '').trim()
      }
    }
    show()
    window.addEventListener(THEME_CONFIG.changeEvent, show)
    return () => window.removeEventListener(THEME_CONFIG.changeEvent, show)
  }, [])

  return (
    <dl ref={list} className="grid grid-cols-2 gap-inset">
      {names.map((name) => (
        <Fragment key={name}>
          <dt>{name}</dt>
          <dd data-variable={name} />
        </Fragment>
      ))}
    </dl>
  )
}
