'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import ChevronRight from 'lucide-react/icons/chevron-right'
import { createContext, use, useLayoutEffect, useState, useSyncExternalStore, type ReactElement, type ReactNode, type RefObject } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { useIndicator } from '../../lib/indicator'
import { createMenuFlight, usePopupFlight, type PopupFlight } from '../../lib/popup-flight'
import { createScopeAnchor, ScopeContext, type ScopeAnchor } from '../../lib/scope'
import { createSubmenuStore, watchMenuPointer, type SubmenuStore } from '../../lib/submenu-pointer'
import { useHost } from '../../lib/slot'
import type { Tone } from '../../lib/tone'
import type { Unstyled } from '../../lib/unstyled'
import { Button, type ButtonProps } from '../button/button'
import { Mark, type MarkKind } from '../checkbox/checkbox'
import { Pill } from '../toggle-group/toggle-group'

type RowContent = {
  icon?: ReactNode
  trail?: ReactNode
  children?: ReactNode
}

export type MenuWidth = 'content' | 'trigger'

type MenuPopupProps = Unstyled<BaseMenu.Popup.Props>

type MenuPopupWidthProps = MenuPopupProps & { width?: MenuWidth }

export type MenuContentProps = MenuPopupWidthProps & { anchor?: RefObject<Element | null> }

type Submenus = {
  readonly open: SubmenuStore<HTMLElement>
  readonly flight: PopupFlight<HTMLElement>
}

const MENU_ITEM = '[role^="menuitem"]'
const CLOSED = (): boolean => false
const POINTER_DECIDES: ReadonlySet<string> = new Set(['focus-out', 'sibling-open'])

const SubmenusContext = createContext<Submenus | null>(null)
const SubmenuTriggerContext = createContext<((trigger: HTMLElement | null) => void) | null>(null)

function createSubmenus(): Submenus {
  return { open: createSubmenuStore<HTMLElement>(), flight: createMenuFlight() }
}

export const LIST_POPUP = {
  'data-recipe': 'surface',
  'data-level': 'overlay',
  'data-material': 'solid',
  'data-surface': '',
  'data-inset': 'inset',
  'data-content': 'controls',
} as const

export const FillContext = createContext<true | null>(null)

export function useListPill(items: string, fill: true | null = null, hover = true) {
  const { container, ride, squash, select } = useIndicator({ axis: 'y', items, hover, follow: !hover, focus: true })
  return { container, select, pill: <Pill variant="hover" fill={fill} ride={ride} squash={squash} /> }
}

export function ListRow({ mark, icon, trail, label }: Omit<RowContent, 'children'> & { mark?: MarkKind | undefined; label: ReactElement }) {
  return (
    <>
      {mark !== undefined && <Mark kind={mark} />}
      {icon != null && <span data-slot="icon">{icon}</span>}
      {label}
      {trail != null && <span data-slot="trail">{trail}</span>}
    </>
  )
}

function Row({ mark, icon, trail, children }: RowContent & { mark?: MarkKind }) {
  return <ListRow mark={mark} icon={icon} trail={trail} label={<span data-slot="label">{children}</span>} />
}

export function MenuPopup({ children, width, scope, place, ref, ...props }: MenuPopupWidthProps & { readonly scope: ScopeAnchor; readonly place?: 'context' | 'bar' }) {
  const [submenus] = useState(createSubmenus)
  const [menu, setMenu] = useState<Element | null>(null)
  const { container, select, pill } = useListPill(MENU_ITEM, use(FillContext), false)
  useLayoutEffect(() => {
    if (!menu) return
    return watchMenuPointer(menu, { items: MENU_ITEM, submenus: submenus.open, show: (row) => select(row, null) })
  }, [menu, submenus, select])

  return (
    <BaseMenu.Popup {...props} {...LIST_POPUP} ref={composeRefs(ref, scope.copyTo, container, setMenu)} data-width={width === 'trigger' ? width : undefined} data-variant={place}>
      {pill}
      <SubmenusContext value={submenus}>{children}</SubmenusContext>
    </BaseMenu.Popup>
  )
}

export function Menu({ modal, ...props }: BaseMenu.Root.Props) {
  const [anchor] = useState(createScopeAnchor)
  return (
    <ScopeContext value={anchor}>
      <BaseMenu.Root {...props} modal={modal ?? false} />
    </ScopeContext>
  )
}

export function MenuGroup(props: Unstyled<BaseMenu.Group.Props>) {
  return <BaseMenu.Group {...props} />
}

export function MenuTrigger(props: ButtonProps) {
  const { register } = useHost(ScopeContext, 'Menu', 'MenuTrigger')
  return <BaseMenu.Trigger ref={register} render={<Button {...props} />} />
}

export function MenuContent({ anchor, ...props }: MenuContentProps) {
  const scope = useHost(ScopeContext, 'Menu', 'MenuContent')
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner align="start" anchor={anchor}>
        <MenuPopup {...props} scope={scope} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

export type MenuItemProps = Unstyled<BaseMenu.Item.Props, 'children'> & RowContent & { tone?: Tone }

export function MenuItem({ icon, trail, tone, children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item {...props} data-recipe="row" data-tone={tone}>
      <Row icon={icon} trail={trail}>
        {children}
      </Row>
    </BaseMenu.Item>
  )
}

export type MenuCheckboxItemProps = Unstyled<BaseMenu.CheckboxItem.Props, 'children'> & Omit<RowContent, 'icon'>

export function MenuCheckboxItem({ trail, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem {...props} data-recipe="row">
      <Row mark="check" trail={trail}>
        {children}
      </Row>
    </BaseMenu.CheckboxItem>
  )
}

export function MenuRadioGroup(props: Unstyled<BaseMenu.RadioGroup.Props>) {
  return <BaseMenu.RadioGroup {...props} />
}

export type MenuRadioItemProps = Unstyled<BaseMenu.RadioItem.Props, 'children'> & Omit<RowContent, 'icon'>

export function MenuRadioItem({ trail, children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem {...props} data-recipe="row">
      <Row mark="dot" trail={trail}>
        {children}
      </Row>
    </BaseMenu.RadioItem>
  )
}

export function MenuSeparator(props: Unstyled<BaseMenu.Separator.Props>) {
  return <BaseMenu.Separator {...props} data-recipe="row" data-variant="separator" />
}

export function MenuGroupLabel({ children, ...props }: Unstyled<BaseMenu.GroupLabel.Props>) {
  return (
    <BaseMenu.GroupLabel {...props} data-recipe="row" data-variant="group-label">
      <span data-slot="label">{children}</span>
    </BaseMenu.GroupLabel>
  )
}

export type MenuSubmenuProps = Omit<BaseMenu.SubmenuRoot.Props, 'open'>

export function MenuSubmenu({ onOpenChange, defaultOpen, ...props }: MenuSubmenuProps) {
  const { open: store } = useHost(SubmenusContext, 'MenuContent', 'MenuSubmenu')
  const [anchor] = useState(createScopeAnchor)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const open = useSyncExternalStore(store.subscribe, () => trigger !== null && store.trigger() === trigger, CLOSED)
  useLayoutEffect(() => {
    if (trigger && defaultOpen) store.open(trigger)
  }, [store, trigger, defaultOpen])

  return (
    <ScopeContext value={anchor}>
      <SubmenuTriggerContext value={setTrigger}>
        <BaseMenu.SubmenuRoot
          {...props}
          open={open}
          onOpenChange={(next, details) => {
            if (!next && POINTER_DECIDES.has(details.reason)) return
            if (trigger) {
              if (next) store.open(trigger)
              else store.close(trigger)
            }
            onOpenChange?.(next, details)
          }}
        />
      </SubmenuTriggerContext>
    </ScopeContext>
  )
}

export type MenuSubmenuTriggerProps = Unstyled<BaseMenu.SubmenuTrigger.Props, 'children' | 'delay' | 'closeDelay' | 'openOnHover'> & Omit<RowContent, 'trail'>

export function MenuSubmenuTrigger({ icon, children, ref, ...props }: MenuSubmenuTriggerProps) {
  const hold = useHost(SubmenuTriggerContext, 'MenuSubmenu', 'MenuSubmenuTrigger')
  const { register } = useHost(ScopeContext, 'MenuSubmenu', 'MenuSubmenuTrigger')
  return (
    <BaseMenu.SubmenuTrigger {...props} ref={composeRefs(ref, hold, register)} openOnHover={false} data-recipe="row">
      <Row
        icon={icon}
        trail={
          <span data-slot="icon">
            <ChevronRight />
          </span>
        }
      >
        {children}
      </Row>
    </BaseMenu.SubmenuTrigger>
  )
}

export function MenuSubmenuContent({ ref, ...props }: MenuPopupProps) {
  const scope = useHost(ScopeContext, 'MenuSubmenu', 'MenuSubmenuContent')
  const submenus = useHost(SubmenusContext, 'MenuContent', 'MenuSubmenuContent')
  const { positioner, popup } = usePopupFlight(submenus.flight)
  const [element, setElement] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (!element) return
    submenus.open.place(element)
    return () => submenus.open.leave(element)
  }, [submenus, element])
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner ref={positioner}>
        <MenuPopup {...props} scope={scope} ref={composeRefs(ref, popup, setElement)} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}
