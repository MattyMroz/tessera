'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import ChevronDown from 'lucide-react/icons/chevron-down'
import { createContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { readMotion } from '../../lib/motion'
import { textOnValue } from '../../lib/select-align'
import { SWAP_IN, SWAP_OUT } from '../../lib/value-swap'
import { useHost } from '../../lib/slot'
import type { Choices } from '../../lib/theme'
import type { Unstyled } from '../../lib/unstyled'
import { Button, type ButtonProps } from '../button/button'
import type { MarkKind } from '../checkbox/checkbox'
import { LIST_POPUP, ListRow, useListPill } from '../menu/menu'

export type SelectAlign = 'trigger' | 'top' | 'bottom'

const OPTION = '[role="option"]'

const CHOSEN_TEXT = `${OPTION}[aria-selected="true"] [data-slot="label"]`

type Host = { readonly size: Choices['size'] | undefined; readonly value: HTMLSpanElement | null; readonly setValue: (element: HTMLSpanElement | null) => void }

const MarkContext = createContext<{ readonly mark: MarkKind } | null>(null)
const HostContext = createContext<Host | null>(null)

export type SelectProps = BaseSelect.Root.Props<string> & { size?: Choices['size'] }

export function Select({ modal, size, ...props }: SelectProps) {
  const [value, setValue] = useState<HTMLSpanElement | null>(null)
  return (
    <HostContext value={{ size, value, setValue }}>
      <span data-component="select" data-slot="choice">
        <BaseSelect.Root {...props} modal={modal ?? false} />
      </span>
    </HostContext>
  )
}

type Shown = { readonly key: string; readonly label: ReactNode }

function Swap({ shown }: { shown: Shown }) {
  const { setValue } = useHost(HostContext, 'Select', 'SelectTrigger')
  const [current, setCurrent] = useState(shown)
  const [previous, setPrevious] = useState<Shown | null>(null)
  if (current.key !== shown.key) {
    setPrevious(current)
    setCurrent(shown)
  }
  const into = useRef<HTMLSpanElement>(null)
  const out = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const entering = into.current
    const leaving = out.current
    if (previous === null || entering === null || leaving === null) return
    const { follow, ease } = readMotion(entering)
    const timing = { duration: follow, easing: ease }
    entering.animate(SWAP_IN, timing)
    const leave = leaving.animate(SWAP_OUT, { ...timing, fill: 'forwards' })
    leave.onfinish = () => setPrevious(null)
    return () => leave.cancel()
  }, [previous])

  return (
    <span data-slot="swap">
      {previous !== null && (
        <span ref={out} data-slot="swap-out" aria-hidden="true">
          {previous.label}
        </span>
      )}
      <span ref={composeRefs(into, setValue)} data-slot="swap-in">
        {current.label}
      </span>
    </span>
  )
}

export type SelectTriggerProps = Omit<ButtonProps, 'children'> & { placeholder: string; labels: Readonly<Record<string, ReactNode>> }

export function SelectTrigger({ placeholder, labels, ...props }: SelectTriggerProps) {
  const { size } = useHost(HostContext, 'Select', 'SelectTrigger')
  return (
    <BaseSelect.Trigger
      render={
        <Button {...props} {...(size === undefined ? {} : { size })} iconEnd={<ChevronDown />}>
          <BaseSelect.Value>
            {(value: string | null) => <Swap shown={value === null ? { key: '', label: placeholder } : { key: value, label: labels[value] ?? value }} />}
          </BaseSelect.Value>
        </Button>
      }
    />
  )
}

export type SelectContentProps = Unstyled<BaseSelect.Popup.Props> & { align?: SelectAlign; mark?: MarkKind }

const ON_TRIGGER_COLLISION = { side: 'shift', align: 'shift', fallbackAxisSide: 'none' } as const

export function SelectContent({ align, mark, children, ref, ...props }: SelectContentProps) {
  const { container, pill } = useListPill(OPTION)
  const { size, value } = useHost(HostContext, 'Select', 'SelectContent')
  const [positioner, setPositioner] = useState<HTMLDivElement | null>(null)
  const onTrigger = (align ?? 'trigger') === 'trigger'
  const offsets = textOnValue({ positioner, value, chosen: CHOSEN_TEXT })
  const placement = onTrigger ? { sideOffset: offsets.side, alignOffset: offsets.align, collisionAvoidance: ON_TRIGGER_COLLISION } : {}

  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner ref={setPositioner}positionMethod="absolute" alignItemWithTrigger={false} side={align === 'top' ? 'top' : 'bottom'} align="start" {...placement}>
        <BaseSelect.Popup {...props} {...LIST_POPUP} ref={composeRefs(ref, container)} data-width="trigger" data-size={size}>
          {pill}
          <MarkContext value={{ mark: mark ?? 'check' }}>{children}</MarkContext>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

export type SelectItemProps = Unstyled<BaseSelect.Item.Props, 'children'> & { icon?: ReactNode; trail?: ReactNode; children: ReactNode }

export function SelectItem({ icon, trail, children, ...props }: SelectItemProps) {
  const { mark } = useHost(MarkContext, 'SelectContent', 'SelectItem')
  return (
    <BaseSelect.Item {...props} data-recipe="row">
      <ListRow mark={mark} icon={icon} trail={trail} label={<BaseSelect.ItemText render={<span data-slot="label" />}>{children}</BaseSelect.ItemText>} />
    </BaseSelect.Item>
  )
}

export function SelectGroup(props: Unstyled<BaseSelect.Group.Props>) {
  return <BaseSelect.Group {...props} />
}

export function SelectGroupLabel({ children, ...props }: Unstyled<BaseSelect.GroupLabel.Props>) {
  return (
    <BaseSelect.GroupLabel {...props} data-recipe="row" data-variant="group-label">
      <span data-slot="label">{children}</span>
    </BaseSelect.GroupLabel>
  )
}

export function SelectSeparator(props: Unstyled<BaseSelect.Separator.Props>) {
  return <BaseSelect.Separator {...props} data-recipe="row" data-variant="separator" />
}
