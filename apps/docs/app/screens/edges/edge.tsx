import type { ReactNode } from 'react'

export const LONG = 'Export every chapter of this volume as one continuous vertical video'

type EdgeProps = {
  readonly 'data-edge-component': string
  readonly title: string
  readonly children: ReactNode
}

export function Edge({ title, children, ...props }: EdgeProps) {
  return (
    <section {...props} aria-label={title} className="flex flex-col gap-group">
      <h2>{title}</h2>
      <div data-testid="narrow" className="flex w-80 max-w-full flex-wrap items-center gap-inset">
        {children}
      </div>
      <div data-testid="full" className="flex flex-wrap items-center gap-inset">
        {children}
      </div>
    </section>
  )
}
