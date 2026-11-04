import { describe, expect, it, vi, type Mock } from 'vitest'
import { MOTION } from '../../test/fixtures/motion'
import type { Rect } from './flight'
import type { Motion } from './motion'
import { createPopupFlight, flightOffset, flightOrigin, type FlightPopup, type FlightPositioner } from './popup-flight'

const GRACE = 400

const rect = (left: number, top: number, width: number, height: number): Rect => ({ left, top, width, height })
const from = (left: number, top: number, width: number, height: number, side: string) => ({ rect: rect(left, top, width, height), side })

describe('flightOffset', () => {
  it('keeps the edge at the trigger still when a tooltip beside a column moves down', () => {
    expect(flightOffset(from(54, 46, 60, 24, 'right'), rect(54, 86, 110, 24), 'right', 'center')).toEqual({ x: 0, y: -40 })
    expect(flightOffset(from(40, 46, 60, 24, 'left'), rect(-10, 86, 110, 24), 'left', 'center')).toEqual({ x: 0, y: -40 })
  })

  it('slides centre to centre along a row of centred tooltips', () => {
    expect(flightOffset(from(100, 46, 60, 24, 'bottom'), rect(140, 46, 100, 30), 'bottom', 'center')).toEqual({ x: -60, y: 0 })
    expect(flightOffset(from(100, 10, 60, 24, 'top'), rect(140, 4, 100, 30), 'top', 'center')).toEqual({ x: -60, y: 0 })
  })

  it('lines up the start edges of menus opened from a bar and of submenus in a list', () => {
    expect(flightOffset(from(95, 40, 200, 300, 'bottom'), rect(147, 40, 240, 180), 'bottom', 'start')).toEqual({ x: -52, y: 0 })
    expect(flightOffset(from(300, 120, 180, 200, 'right'), rect(300, 160, 220, 90), 'right', 'start')).toEqual({ x: 0, y: -40 })
  })

  it('lines up the end edges for an end alignment', () => {
    expect(flightOffset(from(95, 40, 200, 300, 'bottom'), rect(155, 40, 240, 180), 'bottom', 'end')).toEqual({ x: -100, y: 0 })
  })

  it('only moves along the row when the new popup opens on the other side', () => {
    expect(flightOffset(from(95, 40, 200, 300, 'bottom'), rect(147, 10, 200, 20), 'top', 'start')).toEqual({ x: -52, y: 0 })
  })

  it('reads the logical sides of a submenu as left and right', () => {
    expect(flightOffset(from(300, 120, 180, 200, 'inline-end'), rect(300, 160, 220, 90), 'inline-end', 'start')).toEqual({ x: 0, y: -40 })
  })
})

type FakePopup = FlightPopup & {
  readonly animate: Mock<FlightPopup['animate']>
  readonly cancel: Mock<() => void>
  moveTo(left: number): void
  drift(x: number): void
  land(): void
}

class ClientRect implements Rect {
  readonly #rect: Rect

  constructor(rect: Rect) {
    this.#rect = rect
  }

  get left() {
    return this.#rect.left
  }

  get top() {
    return this.#rect.top
  }

  get width() {
    return this.#rect.width
  }

  get height() {
    return this.#rect.height
  }
}

function popupAt(left: number, init: { isConnected?: boolean; size?: number } = {}): FakePopup {
  const size = init.size ?? 200
  let place = rect(left, 40, size, size)
  let shift = 0
  let playState: AnimationPlayState = 'idle'
  const cancel = vi.fn(() => {
    shift = 0
    playState = 'idle'
  })
  const animation = {
    cancel,
    get playState() {
      return playState
    },
  }
  return {
    isConnected: init.isConnected ?? true,
    dataset: { side: 'bottom', align: 'start' },
    getBoundingClientRect: () => new ClientRect({ ...place, left: place.left + shift }),
    animate: vi.fn<FlightPopup['animate']>(() => {
      playState = 'running'
      return animation
    }),
    cancel,
    moveTo(next) {
      place = rect(next, 40, size, size)
    },
    drift(x) {
      shift = x
    },
    land() {
      shift = 0
      playState = 'finished'
    },
  }
}

type FakePositioner = FlightPositioner & { place(left: number): void; close(): void }

function positioner(left?: number): FakePositioner {
  const style = { transform: left === undefined ? '' : `translate(${left}px, 40px)` }
  let closed = false
  return {
    style,
    hasAttribute: (name) => closed && name === 'data-closed',
    place(next) {
      style.transform = `translate(${next}px, 40px)`
    },
    close() {
      closed = true
    },
  }
}

function setup(motion: Motion = MOTION) {
  const clock = { time: 0 }
  const page = { scroll: { x: 0, y: 0 }, panes: 0 }
  const flight = createPopupFlight({ grace: GRACE, motion: () => motion, now: () => clock.time, scroll: () => page.scroll, panes: () => page.panes })
  const open = (left: number, trigger?: string) => {
    const anchor = positioner(left)
    const popup = popupAt(left)
    flight.update(anchor, popup, trigger)
    return { anchor, popup }
  }
  const move = (anchor: FakePositioner, popup: FakePopup, left: number, trigger?: string) => {
    popup.moveTo(left)
    anchor.place(left)
    flight.update(anchor, popup, trigger)
  }
  const close = (anchor: FakePositioner, popup: FlightPopup) => {
    anchor.close()
    flight.update(anchor, popup)
  }
  return { clock, page, flight, open, move, close }
}

describe('flightOrigin', () => {
  it('reads a placed popup and skips one without a position or out of the document', () => {
    expect(flightOrigin(popupAt(120))).toEqual({ rect: rect(120, 40, 200, 200), side: 'bottom' })
    expect(flightOrigin(popupAt(0, { size: 0 }))).toBeNull()
    expect(flightOrigin(popupAt(120, { isConnected: false }))).toBeNull()
    expect(flightOrigin(null)).toBeNull()
  })
})

describe('createPopupFlight', () => {
  it('opens the first popup on its place', () => {
    const { open } = setup()
    expect(open(100).popup.animate).not.toHaveBeenCalled()
  })

  it('flies the next popup of a group on transform for the follow time of the engine', () => {
    const { clock, open, close } = setup()
    const file = open(100)
    close(file.anchor, file.popup)
    clock.time = 100
    expect(open(900).popup.animate).toHaveBeenCalledWith(
      [{ transform: 'translate(-800px, 0px)' }, { transform: 'translate(0, 0)' }],
      { duration: 100, easing: MOTION.ease },
    )
  })

  it('flies while the previous popup has not closed yet, however long it has been open', () => {
    const { clock, open } = setup()
    open(100)
    clock.time = 5000
    expect(open(160).popup.animate).toHaveBeenCalledOnce()
  })

  it('flies within the grace time after the previous popup closed and opens on its place after it', () => {
    const late = setup()
    const first = late.open(100)
    late.close(first.anchor, first.popup)
    late.clock.time = GRACE + 1
    expect(late.open(160).popup.animate).not.toHaveBeenCalled()

    const early = setup()
    const second = early.open(100)
    early.close(second.anchor, second.popup)
    early.clock.time = GRACE
    expect(early.open(160).popup.animate).toHaveBeenCalledOnce()
  })

  it('counts a popup removed without a closing state as closed', () => {
    const { clock, flight, open } = setup()
    const file = open(100)
    flight.release(file.anchor, file.popup)
    clock.time = GRACE + 1
    expect(open(160).popup.animate).not.toHaveBeenCalled()
  })

  it('skips a positioner that has no position yet and flies once it gets one', () => {
    const { flight, open } = setup()
    open(100)
    const anchor = positioner()
    const popup = popupAt(160)
    flight.update(anchor, popup)
    expect(popup.animate).not.toHaveBeenCalled()
    anchor.place(160)
    flight.update(anchor, popup)
    expect(popup.animate).toHaveBeenCalledWith([{ transform: 'translate(-60px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
  })

  it('cancels its own animation when the popup starts closing', () => {
    const { open, close } = setup()
    open(100)
    const edit = open(160)
    expect(edit.popup.animate).toHaveBeenCalledOnce()
    close(edit.anchor, edit.popup)
    expect(edit.popup.cancel).toHaveBeenCalledOnce()
  })

  it('starts the next popup from where the previous one was heading, not where it is mid-flight', () => {
    const { open, close } = setup()
    open(100)
    const view = open(300)
    view.popup.drift(-100)
    close(view.anchor, view.popup)
    expect(open(360).popup.animate).toHaveBeenCalledWith([{ transform: 'translate(-60px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
  })

  it('opens the next popup on its place when the page scrolled after the previous one closed', () => {
    const { page, open, close } = setup()
    const file = open(100)
    close(file.anchor, file.popup)
    page.scroll = { x: 50, y: 0 }
    expect(open(50).popup.animate).not.toHaveBeenCalled()
  })

  it('opens the next popup on its place when a pane scrolled after the previous one closed', () => {
    const { page, open, close } = setup()
    const file = open(100)
    close(file.anchor, file.popup)
    page.panes += 1
    expect(open(50).popup.animate).not.toHaveBeenCalled()
  })

  it('moves a shown popup to another trigger without a flight when a pane scrolled meanwhile', () => {
    const { page, open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    page.panes += 1
    popup.moveTo(50)
    move(anchor, popup, 150, 'redo')
    expect(popup.animate).not.toHaveBeenCalled()
  })

  it('flies a popup that moves to another trigger from where it is seen after the page scrolled', () => {
    const { page, open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    page.scroll = { x: 50, y: 0 }
    popup.moveTo(50)
    move(anchor, popup, 150, 'redo')
    expect(popup.animate).toHaveBeenCalledWith([{ transform: 'translate(-100px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
  })

  it('keeps a popup on its place while its own trigger scrolls or resizes', () => {
    const { clock, open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    clock.time = 5000
    move(anchor, popup, 200, 'undo')
    move(anchor, popup, 260, 'undo')
    expect(popup.animate).not.toHaveBeenCalled()
  })

  it('flies a popup whose positioner moves to another trigger from the place it is seen at', () => {
    const { clock, open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    clock.time = 5000
    move(anchor, popup, 200, 'redo')
    expect(popup.animate).toHaveBeenLastCalledWith([{ transform: 'translate(-100px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
    popup.drift(-40)
    move(anchor, popup, 300, 'cut')
    expect(popup.cancel).toHaveBeenCalledOnce()
    expect(popup.animate).toHaveBeenLastCalledWith([{ transform: 'translate(-140px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
  })

  it('carries a running flight on when the positioner of the same trigger moves again', () => {
    const { open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    move(anchor, popup, 200, 'redo')
    popup.drift(-40)
    move(anchor, popup, 260, 'redo')
    expect(popup.animate).toHaveBeenCalledTimes(2)
    expect(popup.animate).toHaveBeenLastCalledWith([{ transform: 'translate(-100px, 0px)' }, { transform: 'translate(0, 0)' }], expect.anything())
  })

  it('keeps a popup that has landed on its place when its trigger moves', () => {
    const { open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    move(anchor, popup, 200, 'redo')
    popup.land()
    move(anchor, popup, 260, 'redo')
    expect(popup.animate).toHaveBeenCalledOnce()
  })

  it('merges a repeated mutation that keeps the position into one flight', () => {
    const { flight, open, move } = setup()
    const { anchor, popup } = open(100, 'undo')
    move(anchor, popup, 200, 'redo')
    flight.update(anchor, popup, 'redo')
    expect(popup.animate).toHaveBeenCalledOnce()
    expect(popup.cancel).not.toHaveBeenCalled()
  })

  it('skips a flight under half a pixel', () => {
    const { open } = setup()
    open(100)
    expect(open(100.3).popup.animate).not.toHaveBeenCalled()
  })

  it('opens on its place with motion off', () => {
    const { open } = setup({ ...MOTION, follow: 0 })
    open(100)
    expect(open(160).popup.animate).not.toHaveBeenCalled()
  })
})
