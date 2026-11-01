import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { THEME_CONFIG, applyChoices, readSaved, resolveChoices, themeScript, writeSaved, type Theme } from './theme'

type FakeRoot = { attributes: Map<string, string>; style: { colorScheme: string }; setAttribute: (name: string, value: string) => void }

function memoryStorage(entries: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> {
  const items = new Map(Object.entries(entries))
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value)
    },
  }
}

function savedScope(record: unknown) {
  return { localStorage: memoryStorage({ [THEME_CONFIG.storageKey]: JSON.stringify(record) }) }
}

const blockedScope = {
  get localStorage(): Pick<Storage, 'getItem' | 'setItem'> {
    throw new DOMException('denied', 'SecurityError')
  },
}

function fakeRoot(): FakeRoot {
  const attributes = new Map<string, string>()
  return { attributes, style: { colorScheme: '' }, setAttribute: (name, value) => attributes.set(name, value) }
}

let changes = 0
const countChange = () => {
  changes += 1
}

beforeEach(() => {
  changes = 0
  const target = new EventTarget()
  target.addEventListener(THEME_CONFIG.changeEvent, countChange)
  vi.stubGlobal('window', target)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

it('layers defaults, then the theme, then the saved choices', () => {
  const choices = resolveChoices({ accent: 'red', motion: 'firm' }, { accent: 'blue' })
  expect(choices).toEqual({ ...THEME_CONFIG.defaults, accent: 'blue', motion: 'firm' })
})

it('keeps every valid saved value and drops invalid values and unknown axes one by one', () => {
  const scope = savedScope({ version: 1, choices: { accent: 'teal', corners: 'xl', density: 'snug', mode: 7, radius: 'lg' } })
  expect(readSaved(scope)).toEqual({ accent: 'teal', density: 'snug' })
})

it('drops the removed profile axis of a saved record and keeps its platform and typeset', () => {
  const profile = 'web'
  const scope = savedScope({ version: 1, choices: { profile, platform: 'web', typeset: 'inter' } })
  expect(readSaved(scope)).toEqual({ platform: 'web', typeset: 'inter' })
})

it('treats a record of another version, a malformed record and a missing record as nothing saved', () => {
  expect(readSaved(savedScope({ version: 2, choices: { accent: 'teal' } }))).toEqual({})
  expect(readSaved(savedScope({ accent: 'teal' }))).toEqual({})
  expect(readSaved(savedScope({ version: 1, choices: null }))).toEqual({})
  expect(readSaved({ localStorage: memoryStorage({ [THEME_CONFIG.storageKey]: '{' }) })).toEqual({})
  expect(readSaved({ localStorage: memoryStorage() })).toEqual({})
})

it('tells unavailable storage apart from a missing record', () => {
  expect(readSaved(blockedScope)).toBeUndefined()
  const throwing = { localStorage: { ...memoryStorage(), getItem: () => { throw new DOMException('denied', 'SecurityError') } } }
  expect(readSaved(throwing)).toBeUndefined()
})

it('writes a versioned record that reads back as the same choices', () => {
  const scope = { localStorage: memoryStorage() }
  writeSaved(scope, { mode: 'dark', neon: 'full', platform: 'web', typeset: 'inter' })
  expect(JSON.parse(scope.localStorage.getItem(THEME_CONFIG.storageKey) ?? '')).toEqual({
    version: 1,
    choices: { mode: 'dark', neon: 'full', platform: 'web', typeset: 'inter' },
  })
  expect(readSaved(scope)).toEqual({ mode: 'dark', neon: 'full', platform: 'web', typeset: 'inter' })
})

it('ignores a write to unavailable storage', () => {
  expect(() => writeSaved(blockedScope, { mode: 'dark' })).not.toThrow()
})

it('applies every axis as a data attribute and announces the change', () => {
  const root = fakeRoot()
  applyChoices(root, resolveChoices({}, { mode: 'light', accent: 'violet' }), true)
  expect(Object.fromEntries(root.attributes)).toEqual({
    'data-mode': 'light',
    'data-accent': 'violet',
    'data-neutral': 'k2',
    'data-corners': 'full',
    'data-curve': 'squircle',
    'data-density': 'compact',
    'data-size': 'lg',
    'data-motion': 'spring',
    'data-neon': 'off',
    'data-material': 'solid',
    'data-platform': 'desktop',
    'data-typeset': 'inter',
  })
  expect(root.style.colorScheme).toBe('light')
  expect(changes).toBe(1)
})

it('resolves the system mode from the color scheme preference', () => {
  const dark = fakeRoot()
  const light = fakeRoot()
  applyChoices(dark, resolveChoices({}, {}), true)
  applyChoices(light, resolveChoices({}, {}), false)
  expect([dark.attributes.get('data-mode'), dark.style.colorScheme]).toEqual(['dark', 'dark'])
  expect([light.attributes.get('data-mode'), light.style.colorScheme]).toEqual(['light', 'light'])
})

function bootPage(theme: Theme, saved: Theme) {
  const base = fakeRoot()
  const root = Object.assign(base, { getAttribute: (name: string) => base.attributes.get(name) ?? null })
  const media = Object.assign(new EventTarget(), { matches: true })
  const page = Object.assign(new EventTarget(), {
    localStorage: memoryStorage({ [THEME_CONFIG.storageKey]: JSON.stringify({ version: 1, choices: saved }) }),
    matchMedia: (query: string) => (query === THEME_CONFIG.darkQuery ? media : undefined),
  })
  const document = Object.assign(new EventTarget(), { documentElement: root })
  let announced = 0
  page.addEventListener(THEME_CONFIG.changeEvent, () => {
    announced += 1
  })
  new Function('window', 'document', themeScript(theme))(page, document)
  return { root, media, page, document, announced: () => announced }
}

function switchScheme(media: EventTarget & { matches: boolean }, dark: boolean): void {
  media.matches = dark
  media.dispatchEvent(new Event('change'))
}

it('runs the boot script to the same attributes as applyChoices', () => {
  const theme: Theme = { accent: 'rose', motion: 'firm' }
  const saved: Theme = { corners: 'md', mode: 'system' }
  const { root, announced } = bootPage(theme, saved)
  const expected = fakeRoot()
  applyChoices(expected, resolveChoices(theme, saved), true)
  expect(root.attributes).toEqual(expected.attributes)
  expect(root.style.colorScheme).toBe('dark')
  expect(announced()).toBe(1)
})

it('follows the system color scheme from the boot script while the saved mode is system', () => {
  const { root, media, page, announced } = bootPage({}, { mode: 'system' })
  switchScheme(media, false)
  expect([root.attributes.get('data-mode'), root.style.colorScheme]).toEqual(['light', 'light'])
  expect(announced()).toBe(2)

  writeSaved(page, { mode: 'dark' })
  switchScheme(media, true)
  switchScheme(media, false)
  expect(announced()).toBe(2)
})

it('marks the input that moved the focus from the boot script', () => {
  const { root, document } = bootPage({}, {})
  document.dispatchEvent(new Event('pointerdown'))
  expect(root.attributes.get('data-input')).toBe('pointer')
  const tab = new Event('keydown')
  Object.defineProperty(tab, 'key', { value: 'Tab' })
  document.dispatchEvent(tab)
  expect(root.attributes.get('data-input')).toBe('keyboard')
})

it('escapes every < of the embedded data in the boot script', () => {
  const hostile: Theme = JSON.parse('{"accent":"</script><script>alert(1)</script>"}')
  expect(themeScript(hostile)).not.toContain('</script>')
})
