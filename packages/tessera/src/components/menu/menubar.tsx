'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import Ellipsis from 'lucide-react/icons/ellipsis'
import {
  createContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react'
import { watchBarOverflow } from '../../lib/bar-overflow'
import { composeRefs } from '../../lib/compose-refs'
import { useIndicator } from '../../lib/indicator'
import { createMenuFlight, usePopupFlight, type PopupFlight } from '../../lib/popup-flight'
import { createScopeAnchor, ScopeContext } from '../../lib/scope'
import { useHost } from '../../lib/slot'
import type { Choices } from '../../lib/theme'
import { Pill } from '../toggle-group/toggle-group'
import { MenuPopup, MenuSubmenu, MenuSubmenuContent, MenuSubmenuTrigger, MenuTrigger, FillContext } from './menu'

const TRIGGER = '[role="menuitem"]'
const SHOWN = `:scope > ${TRIGGER}:not(:disabled)`

type Entry = { readonly trigger: HTMLElement; readonly label: ReactNode; readonly rows: ReactNode }

type Bar = {
  readonly flight: PopupFlight<HTMLElement>
  readonly hold: (trigger: HTMLElement | null) => void
  readonly release: (trigger: HTMLElement | null) => void
  readonly subscribe: (listener: () => void) => () => void
  readonly membership: () => number
  readonly register: (id: string, entry: Entry) => () => void
  readonly triggers: () => HTMLElement[]
  readonly overflowed: () => readonly [string, Entry][]
  readonly showCount: (count: number) => void
}

const BarContext = createContext<Bar | null>(null)

function createBar(setHeld: Dispatch<SetStateAction<HTMLElement | null>>): Bar {
  const entries = new Map<string, Entry>()
  const listeners = new Set<() => void>()
  let membership = 0
  let count = Number.POSITIVE_INFINITY
  let overflowed: readonly [string, Entry][] = []
  const placed = (): [string, Entry][] => [...entries].sort(([, a], [, b]) => (a.trigger.compareDocumentPosition(b.trigger) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  const notify = () => {
    overflowed = placed().slice(count)
    for (const listener of listeners) listener()
  }
  return {
    flight: createMenuFlight(),
    hold: setHeld,
    release: (trigger) => setHeld((current) => (current === trigger ? null : current)),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    membership: () => membership,
    register: (id, entry) => {
      if (entries.get(id)?.trigger !== entry.trigger) membership += 1
      entries.set(id, entry)
      notify()
      return () => {
        entries.delete(id)
        membership += 1
        notify()
      }
    },
    triggers: () => placed().map(([, entry]) => entry.trigger),
    overflowed: () => overflowed,
    showCount: (next) => {
      if (next === count) return
      count = next
      notify()
    },
  }
}

export type MenubarProps = {
  readonly moreLabel: string
  readonly size?: Choices['size']
  readonly variant?: 'accent'
  readonly children: ReactNode
}

export function Menubar({ moreLabel, size, variant, children }: MenubarProps) {
  const element = useRef<HTMLDivElement>(null)
  const more = useRef<HTMLButtonElement>(null)
  const [held, setHeld] = useState<HTMLElement | null>(null)
  const [bar] = useState(() => createBar(setHeld))
  const hover = useIndicator({ axis: 'x', items: TRIGGER, hover: true, focus: true })
  const open = useIndicator({ axis: 'x', items: TRIGGER, follow: true })
  const accent = variant === 'accent'

  useLayoutEffect(() => {
    open.select(held, null)
    hover.select(accent ? null : held, null, accent && held !== null)
  }, [accent, open, hover, held])

  useLayoutEffect(() => {
    const button = more.current
    if (element.current === null || button === null) return
    let seen = Number.NaN
    let stop = () => {}
    const watch = () => {
      if (element.current === null || bar.membership() === seen) return
      seen = bar.membership()
      stop()
      stop = watchBarOverflow({ bar: element.current, more: button, triggers: bar.triggers }, bar.showCount)
    }
    watch()
    const unsubscribe = bar.subscribe(watch)
    return () => {
      unsubscribe()
      stop()
    }
  }, [bar])

  return (
    <BaseMenubar
      ref={composeRefs(element, hover.container, open.container)}
      modal={false}
      data-component="menubar"
      data-recipe="surface"
      data-surface="bar"
      data-size={size}
    >
      <Pill variant="hover" ride={hover.ride} squash={hover.squash} />
      {accent && <Pill variant="active" ride={open.ride} squash={open.squash} />}
      <BarContext value={bar}>
        <FillContext value={accent || null}>
          {children}
          <More label={moreLabel} button={more} />
        </FillContext>
      </BarContext>
    </BaseMenubar>
  )
}

function BarMenu({ trigger, label, icon, overflow, children }: { trigger: RefObject<HTMLButtonElement | null>; label: ReactNode; icon?: ReactNode; overflow: boolean; children: ReactNode }) {
  const bar = useHost(BarContext, 'Menubar', 'MenubarMenu')
  const [anchor] = useState(createScopeAnchor)
  const { positioner, popup } = usePopupFlight(bar.flight)
  const onOpenChange = (open: boolean) => {
    if (open) bar.hold(trigger.current)
    else bar.release(trigger.current)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return
    event.preventDefault()
    const shown = [...(trigger.current?.parentElement?.querySelectorAll<HTMLElement>(SHOWN) ?? [])]
    const next = shown[shown.findIndex((item) => item === trigger.current) + (event.shiftKey ? -1 : 1)]
    const target = next ?? event.target
    if (next !== undefined) next.focus()
    queueMicrotask(() => target.dispatchEvent(new globalThis.KeyboardEvent('keydown', { key: next === undefined ? 'Escape' : 'ArrowDown', bubbles: true })))
  }
  return (
    <ScopeContext value={anchor}>
      <BaseMenu.Root onOpenChange={onOpenChange}>
        <MenuTrigger ref={trigger} variant="ghost" icon={icon} disabled={overflow} data-overflow={overflow ? '' : undefined} {...(icon === undefined ? {} : { 'aria-label': String(label) })}>
          {icon === undefined ? label : undefined}
        </MenuTrigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner ref={positioner} align="start">
            <MenuPopup scope={anchor} place="bar" ref={popup} onKeyDown={onKeyDown}>
              {children}
            </MenuPopup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </ScopeContext>
  )
}

export type MenubarMenuProps = {
  readonly label: string
  readonly children: ReactNode
}

export function MenubarMenu({ label, children }: MenubarMenuProps) {
  const id = useId()
  const bar = useHost(BarContext, 'Menubar', 'MenubarMenu')
  const trigger = useRef<HTMLButtonElement>(null)
  const overflowed = useSyncExternalStore(bar.subscribe, bar.overflowed, bar.overflowed)

  useLayoutEffect(() => {
    if (trigger.current === null) return
    return bar.register(id, { trigger: trigger.current, label, rows: children })
  }, [bar, id, label, children])

  return (
    <BarMenu trigger={trigger} label={label} overflow={overflowed.some(([key]) => key === id)}>
      {children}
    </BarMenu>
  )
}

function More({ label, button }: { label: string; button: RefObject<HTMLButtonElement | null> }) {
  const bar = useHost(BarContext, 'Menubar', 'More')
  const hidden = useSyncExternalStore(bar.subscribe, bar.overflowed, bar.overflowed)
  return (
    <BarMenu trigger={button} label={label} icon={<Ellipsis />} overflow={hidden.length === 0}>
      {hidden.map(([id, entry]) => (
        <MenuSubmenu key={id}>
          <MenuSubmenuTrigger>{entry.label}</MenuSubmenuTrigger>
          <MenuSubmenuContent>{entry.rows}</MenuSubmenuContent>
        </MenuSubmenu>
      ))}
    </BarMenu>
  )
}
