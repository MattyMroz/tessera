import { describe, expect, it } from 'vitest'
import { HOTKEY_IDLE, hotkeyDown, hotkeyUp, type HotkeyEvent } from './menubar-hotkey'

const press = (key: string, extra: Partial<HotkeyEvent> = {}): HotkeyEvent => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  repeat: false,
  ...extra,
})

describe('menubar hotkeys', () => {
  it('focuses the bar on Alt pressed and released alone', () => {
    const down = hotkeyDown(HOTKEY_IDLE, press('Alt', { altKey: true }), false)
    expect(down.focus).toBe(false)
    expect(hotkeyUp(down.state, press('Alt')).focus).toBe(true)
  })

  it('leaves Alt alone when another key comes between its press and its release', () => {
    const down = hotkeyDown(HOTKEY_IDLE, press('Alt', { altKey: true }), false)
    const chord = hotkeyDown(down.state, press('f', { altKey: true }), false)
    expect(hotkeyUp(chord.state, press('Alt')).focus).toBe(false)
  })

  it('focuses the bar on F10 without modifiers', () => {
    expect(hotkeyDown(HOTKEY_IDLE, press('F10'), false).focus).toBe(true)
    expect(hotkeyDown(HOTKEY_IDLE, press('F10', { shiftKey: true }), false).focus).toBe(false)
    expect(hotkeyDown(HOTKEY_IDLE, press('F10', { ctrlKey: true }), false).focus).toBe(false)
  })

  it('focuses the bar on Tab only while nothing has focus', () => {
    expect(hotkeyDown(HOTKEY_IDLE, press('Tab'), true).focus).toBe(true)
    expect(hotkeyDown(HOTKEY_IDLE, press('Tab'), false).focus).toBe(false)
    expect(hotkeyDown(HOTKEY_IDLE, press('Tab', { shiftKey: true }), true).focus).toBe(false)
  })
})
