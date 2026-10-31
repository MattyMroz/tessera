import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

export const packageDir = resolve(import.meta.dirname, '../..')

export function filesIn(directory: string, pattern: RegExp): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort()
}
