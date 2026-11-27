'use client'

import { onlyDigitsChange } from '@mattymroz/tessera/lib/range'
import { useState } from 'react'

type Shown = { readonly text: string; readonly left: string | null; readonly swaps: number }

export function ValueText({ text, align }: { readonly text: string; readonly align?: 'start' | 'end' }) {
  const [shown, setShown] = useState<Shown>({ text, left: null, swaps: 0 })
  if (shown.text !== text) {
    const word = !onlyDigitsChange(shown.text, text)
    setShown({ text, left: word ? shown.text : null, swaps: shown.swaps + (word ? 1 : 0) })
  }

  return (
    <span className="pv" data-align={align}>
      {shown.left !== null && (
        <span
          key={`left-${shown.swaps}`}
          aria-hidden="true"
          data-swap="leave"
          onAnimationEnd={() => setShown((now) => (now.left === null ? now : { ...now, left: null }))}
        >
          {shown.left}
        </span>
      )}
      <span key={`now-${shown.swaps}`} data-swap={shown.swaps > 0 ? 'enter' : undefined} data-value="">
        {text}
      </span>
    </span>
  )
}
