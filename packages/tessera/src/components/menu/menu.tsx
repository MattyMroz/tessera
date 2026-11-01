'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import Check from 'lucide-react/icons/check'
import ChevronRight from 'lucide-react/icons/chevron-right'
import { createContext, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { useIndicator } from '../../lib/indicator'
import { readMotion } from '../../lib/motion'
import { createPopupFlight, SUBMENU_FLIGHT_GRACE, usePopupFlight, type PopupFlight } from '../../lib/popup-flight'
import { createScopeAnchor, ScopeContext, type ScopeAnchor } from '../../lib/scope'
import { useHost } from '../../lib/slot'
import type { Tone } from '../../lib/tone'
import type { Unstyled } from '../../lib/unstyled'
import { Button, type ButtonProps } from '../button/button'

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
  readonly hold: (trigger: HTMLElement) => void
  readonly release: (trigger: HTMLElement) => void
  readonly flight: PopupFlight<HTMLElement>
}

const MENU_ITEM = '[role^="menuitem"]'

const SubmenusContext = createContext<Submenus | null>(null)
const SubmenuTriggerContext = createContext<((trigger: HTMLElement | null) => void) | null>(null)

function Row({ icon, trail, children }: RowContent) {
  return (
    <>
      {icon != null && <span data-slot="icon">{icon}</span>}
      <span data-slot="label">{children}</span>
      {trail != null && <span data-slot="trail">{trail}</span>}
    </>
  )
}

function MenuPopup({ children, width, scope, ref, ...props }: MenuPopupWidthProps & { readonly scope: ScopeAnchor }) {
  const [held, setHeld] = useState<HTMLElement | null>(null)
  const [submenus] = useState<Submenus>(() => ({
    hold: setHeld,
    release: (trigger) => setHeld((current) => (current === trigger ? null : current)),
    flight: createPopupFlight<HTMLElement>({ grace: SUBMENU_FLIGHT_GRACE, motion: readMotion }),
  }))
  const { container, ride, squash, select } = useIndicator({ axis: 'y', items: MENU_ITEM, hover: true, focus: true })
  useLayoutEffect(() => {
    select(held, null)
  }, [select, held])

  return (
    <BaseMenu.Popup
      {...props}
      ref={composeRefs(ref, scope.copyTo, container)}
      data-recipe="surface"
      data-level="overlay"
      data-material="solid"
      data-surface=""
      data-inset="inset"
      data-content="controls"
      data-width={width === 'trigger' ? width : undefined}
    >
      <div ref={ride} data-recipe="indicator" data-variant="hover" aria-hidden="true">
        <div ref={squash} data-slot="squash" />
      </div>
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
      <Row icon={<BaseMenu.CheckboxItemIndicator render={<Check />} />} trail={trail}>
        {children}
      </Row>
    </BaseMenu.CheckboxItem>
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

export function MenuSubmenu({ open, defaultOpen, onOpenChange, ...props }: BaseMenu.SubmenuRoot.Props) {
  const submenus = useHost(SubmenusContext, 'MenuContent', 'MenuSubmenu')
  const [anchor] = useState(createScopeAnchor)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [opened, setOpened] = useState(open ?? defaultOpen ?? false)
  const shown = open ?? opened

  useLayoutEffect(() => {
    if (!trigger || !shown) return
    submenus.hold(trigger)
    return () => submenus.release(trigger)
  }, [submenus, trigger, shown])

  return (
    <ScopeContext value={anchor}>
      <SubmenuTriggerContext value={setTrigger}>
        <BaseMenu.SubmenuRoot
          {...props}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={(next, details) => {
            setOpened(next)
            onOpenChange?.(next, details)
          }}
        />
      </SubmenuTriggerContext>
    </ScopeContext>
  )
}

export type MenuSubmenuTriggerProps = Unstyled<BaseMenu.SubmenuTrigger.Props, 'children' | 'delay'> & Omit<RowContent, 'trail'>

export function MenuSubmenuTrigger({ icon, children, ref, ...props }: MenuSubmenuTriggerProps) {
  const hold = useHost(SubmenuTriggerContext, 'MenuSubmenu', 'MenuSubmenuTrigger')
  const { register } = useHost(ScopeContext, 'MenuSubmenu', 'MenuSubmenuTrigger')
  return (
    <BaseMenu.SubmenuTrigger {...props} ref={composeRefs(ref, hold, register)} delay={0} data-recipe="row">
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
  const { positioner, popup } = usePopupFlight(useHost(SubmenusContext, 'MenuContent', 'MenuSubmenuContent').flight)
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner ref={positioner}>
        <MenuPopup {...props} scope={scope} ref={composeRefs(ref, popup)} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}
