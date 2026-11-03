'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { useRef, type ReactNode } from 'react'

const TRAVEL = 'translateX(64px)'
const HOME = 'translateX(0)'
const MILLISECONDS_PER_SECOND = 1000

function milliseconds(duration: string): number {
  const value = Number.parseFloat(duration)
  return duration.trim().endsWith('ms') ? value : value * MILLISECONDS_PER_SECOND
}

export function MotionSample({ children }: { children: ReactNode }) {
  const track = useRef<HTMLSpanElement>(null)
  const away = useRef(false)

  const move = () => {
    const element = track.current
    if (!element) return
    const motion = getComputedStyle(document.documentElement)
    const [from, to] = away.current ? [TRAVEL, HOME] : [HOME, TRAVEL]
    element.animate([{ transform: from }, { transform: to }], {
      duration: milliseconds(motion.getPropertyValue('--ts-motion-duration-choice')),
      easing: motion.getPropertyValue('--ts-motion-ease-emphasized').trim(),
      fill: 'forwards',
    })
    away.current = !away.current
  }

  return (
    <div className="flex items-center gap-group">
      <Button variant="outline" onClick={move}>
        Move
      </Button>
      <span ref={track} className="inline-flex">
        {children}
      </span>
    </div>
  )
}
