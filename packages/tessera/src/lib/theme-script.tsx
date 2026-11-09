import { themeScript, type Theme } from './theme'

export function ThemeScript({ theme }: { theme: Theme }) {
  'use no memo'
  return <script dangerouslySetInnerHTML={{ __html: themeScript(theme) }} />
}
