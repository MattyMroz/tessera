'use client'

import {
  createContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { moveInCollection, NO_TYPEAHEAD, type CollectionItem, type Typeahead } from '../../lib/collection'
import { composeRefs } from '../../lib/compose-refs'
import { useIndicator, type IndicatorParts } from '../../lib/indicator'
import { createSingleChoice, type ChoiceOption, type SingleChoice } from '../../lib/single-choice'
import { useHost } from '../../lib/slot'
import type { Choices } from '../../lib/theme'

const ITEM = '[role="radio"]'

type Group = {
  readonly choice: SingleChoice
  readonly showChosen: (option: HTMLElement | null) => void
}

const GroupContext = createContext<Group | null>(null)

export const TOGGLE_GROUP_VARIANTS = ['raised', 'active'] as const

export type ToggleGroupVariant = (typeof TOGGLE_GROUP_VARIANTS)[number]

export type ToggleGroupProps = {
  readonly value?: string
  readonly defaultValue?: string
  readonly onValueChange?: (value: string) => void
  readonly variant?: ToggleGroupVariant
  readonly size?: Choices['size']
  readonly 'aria-label': string
  readonly children: ReactNode
}

type ToggleGroupItemBase = {
  readonly value: string
  readonly icon?: ReactNode
  readonly disabled?: boolean
}

export type ToggleGroupItemProps = ToggleGroupItemBase &
  ({ readonly children: ReactNode; readonly 'aria-label'?: string } | { readonly children?: undefined; readonly 'aria-label': string })

type PillProps = Pick<IndicatorParts, 'ride' | 'squash'> & { readonly variant: 'hover' | ToggleGroupVariant }

function Pill({ variant, ride, squash }: PillProps) {
  return (
    <div ref={ride} data-recipe="indicator" data-variant={variant} aria-hidden="true">
      <div ref={squash} data-slot="squash" />
    </div>
  )
}

function optionAt(group: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest(ITEM) : null
  return option instanceof HTMLButtonElement && group.contains(option) && !option.disabled ? option : null
}

function optionsIn(group: HTMLElement): HTMLButtonElement[] {
  return Array.from(group.querySelectorAll<HTMLButtonElement>(ITEM))
}

function itemOf(option: HTMLButtonElement): CollectionItem {
  return { name: option.getAttribute('aria-label') ?? option.textContent, disabled: option.disabled }
}

function choiceOf(option: HTMLButtonElement): ChoiceOption {
  return { value: option.value, disabled: option.disabled }
}

export function ToggleGroup({ value, defaultValue, onValueChange, variant, size, 'aria-label': label, children }: ToggleGroupProps) {
  const [choice] = useState(() => createSingleChoice(value ?? defaultValue ?? null))
  const track = useRef<HTMLDivElement>(null)
  const active = useIndicator({ axis: 'x', items: ITEM })
  const hover = useIndicator({ axis: 'x', items: ITEM, hover: true })
  const [group] = useState<Group>(() => ({
    choice,
    showChosen: (option) => {
      active.select(option, null)
      hover.select(null, option)
    },
  }))
  const typeahead = useRef<Typeahead>(NO_TYPEAHEAD)

  useLayoutEffect(() => {
    if (value !== undefined) choice.choose(value)
  }, [choice, value])

  useLayoutEffect(() => {
    if (track.current) choice.arrange(optionsIn(track.current).map(choiceOf))
  })

  const choose = (next: string): void => {
    if (next === choice.value()) return
    if (value === undefined) choice.choose(next)
    onValueChange?.(next)
  }

  const onClick = (event: MouseEvent<HTMLDivElement>): void => {
    const option = optionAt(event.currentTarget, event.target)
    if (option) choose(option.value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const from = optionAt(event.currentTarget, event.target)
    if (!from || event.altKey || event.ctrlKey || event.metaKey) return
    const options = optionsIn(event.currentTarget)
    const move = moveInCollection({
      items: options.map(itemOf),
      current: options.indexOf(from),
      key: event.key,
      orientation: 'both',
      direction: event.currentTarget.matches(':dir(rtl)') ? 'rtl' : 'ltr',
      typeahead: typeahead.current,
      now: event.timeStamp,
    })
    typeahead.current = move.typeahead
    const next = move.index === undefined ? undefined : options[move.index]
    if (!next) return
    event.preventDefault()
    next.focus()
    choose(next.value)
  }

  return (
    <div
      ref={composeRefs(track, active.container, hover.container)}
      role="radiogroup"
      aria-label={label}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-component="toggle-group"
      data-recipe="surface"
      data-level="sunken"
      data-surface="track"
      data-inset="inset"
      data-size={size}
    >
      <Pill variant="hover" ride={hover.ride} squash={hover.squash} />
      <Pill variant={variant ?? 'raised'} ride={active.ride} squash={active.squash} />
      <GroupContext value={group}>{children}</GroupContext>
    </div>
  )
}

export function ToggleGroupItem({ value, icon, children, disabled, 'aria-label': label }: ToggleGroupItemProps) {
  const { choice, showChosen } = useHost(GroupContext, 'ToggleGroup', 'ToggleGroupItem')
  const read = () => choice.stateOf(value)
  const state = useSyncExternalStore(choice.subscribe, read, read)
  const button = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (state !== 'chosen') return
    showChosen(button.current)
    return () => showChosen(null)
  }, [showChosen, state])

  return (
    <button
      ref={button}
      type="button"
      role="radio"
      aria-checked={state === 'chosen'}
      tabIndex={state === 'idle' ? -1 : 0}
      value={value}
      disabled={disabled}
      aria-label={label}
      data-recipe="control"
      data-variant="ghost"
      data-focus="inset"
    >
      {icon != null && (
        <span data-slot="icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children != null && <span data-slot="label">{children}</span>}
    </button>
  )
}
