import './globals.css'
import { ConfirmHost } from '@mattymroz/tessera/components/dialog/alert-dialog'
import { ThemeScript } from '@mattymroz/tessera/lib/theme-script'
import { mangashift } from '@mattymroz/tessera/themes/mangashift'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { LAB_ELEMENTS, STATUS_MARKS } from './elements'
import { Panel } from './panel'

export const metadata: Metadata = {
  title: 'Tessera lab',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript theme={mangashift} />
      </head>
      <body data-recipe="surface" data-variant="page" className="min-h-dvh">
        <div className="flex flex-col gap-card p-card md:flex-row md:items-start">
          <nav aria-label="Elements" className="flex flex-row flex-wrap gap-inset md:sticky md:top-card md:z-10 md:w-36 md:flex-none md:flex-col">
            {LAB_ELEMENTS.map(({ id, name, status }) => (
              <div key={id} className="flex items-baseline gap-inset">
                <span role="img" aria-label={STATUS_MARKS[status].label} title={STATUS_MARKS[status].label} className="w-3 flex-none text-center">
                  {STATUS_MARKS[status].mark}
                </span>
                <a href={`/#${id}`}>{name}</a>
              </div>
            ))}
          </nav>
          <main id="lab-main" className="flex min-w-0 flex-col gap-card md:flex-1">
            {children}
          </main>
          <Panel />
        </div>
        <ConfirmHost />
      </body>
    </html>
  )
}
