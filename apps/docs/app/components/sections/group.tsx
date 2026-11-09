import type { ReactNode } from 'react'

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-inset">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
