'use client'

import LoaderCircle from 'lucide-react/icons/loader-circle'
import type { ComponentProps, ComponentType, MouseEvent, MouseEventHandler, ReactNode, Ref } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { watchPresses } from '../../lib/press'
import type { Choices } from '../../lib/theme'
import { titleWhenCut } from '../../lib/title-when-cut'
import type { Tone } from '../../lib/tone'
import type { Unstyled } from '../../lib/unstyled'

export const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'raised', 'ghost'] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]

type ButtonLook = {
  variant?: ButtonVariant
  tone?: Tone
  size?: Choices['size']
  busy?: boolean
  hug?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
}

type LookAttributes = {
  variant: ButtonVariant | undefined
  tone: Tone | undefined
  size: Choices['size'] | undefined
  busy: boolean | undefined
  hug: boolean | undefined
}

type ContentProps = {
  busy: boolean | undefined
  icon: ReactNode
  iconEnd: ReactNode
  children: ReactNode
}

type ButtonName = { children: ReactNode } | { children?: undefined; 'aria-label': string }

export type ButtonLink = ComponentType<{
  href: string
  ref?: Ref<HTMLAnchorElement>
  onClick?: MouseEventHandler<HTMLAnchorElement>
  onAuxClick?: MouseEventHandler<HTMLAnchorElement>
  children?: ReactNode
}>

export type ButtonProps = ButtonLook & ButtonName & Unstyled<ComponentProps<'button'>, 'children' | 'aria-busy'> & { href?: undefined; link?: undefined }

export type ButtonLinkProps = ButtonLook &
  ButtonName &
  Unstyled<ComponentProps<'a'>, 'children' | 'aria-busy' | 'href' | 'type'> & { href: string; link?: ButtonLink; type?: undefined; disabled?: undefined }

function titled(node: HTMLElement | null): (() => void) | undefined {
  return node ? titleWhenCut(node) : undefined
}

function stop(event: MouseEvent): void {
  event.preventDefault()
}

function isBlocked(busy: boolean | undefined, ariaDisabled: ButtonProps['aria-disabled']): boolean {
  return busy === true || ariaDisabled === true || ariaDisabled === 'true'
}

function lookOf({ variant, tone, size, busy, hug }: LookAttributes) {
  return {
    'aria-busy': busy || undefined,
    'data-recipe': 'control',
    'data-variant': variant ?? 'ghost',
    'data-tone': tone,
    'data-size': size,
    'data-hug': hug || undefined,
    'data-focus': 'outer',
  } as const
}

function Content({ busy, icon, iconEnd, children }: ContentProps) {
  const lead = busy && icon != null ? <LoaderCircle /> : icon
  return (
    <>
      {busy && icon == null && (
        <span data-slot="busy">
          <LoaderCircle />
        </span>
      )}
      {lead != null && <span data-slot="icon">{lead}</span>}
      {children != null && <span data-slot="label">{children}</span>}
      {iconEnd != null && <span data-slot="icon">{iconEnd}</span>}
    </>
  )
}

function NativeButton({ variant, tone, size, busy, hug, icon, iconEnd, children, ref, onClick, ...button }: ButtonProps) {
  const blocked = isBlocked(busy, button['aria-disabled'])
  return (
    <button type="button" {...button} {...lookOf({ variant, tone, size, busy, hug })} ref={composeRefs(ref, watchPresses, titled)} onClick={blocked ? stop : onClick}>
      <Content busy={busy} icon={icon} iconEnd={iconEnd}>
        {children}
      </Content>
    </button>
  )
}

function AnchorButton({ variant, tone, size, busy, hug, icon, iconEnd, children, ref, link, onClick, onAuxClick, ...anchor }: ButtonLinkProps) {
  const blocked = isBlocked(busy, anchor['aria-disabled'])
  const Anchor = link ?? 'a'
  return (
    <Anchor
      {...anchor}
      {...lookOf({ variant, tone, size, busy, hug })}
      ref={composeRefs(ref, watchPresses, titled)}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => (blocked ? stop(event) : onClick?.(event))}
      onAuxClick={(event: MouseEvent<HTMLAnchorElement>) => (blocked ? stop(event) : onAuxClick?.(event))}
    >
      <Content busy={busy} icon={icon} iconEnd={iconEnd}>
        {children}
      </Content>
    </Anchor>
  )
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  return props.href === undefined ? <NativeButton {...props} /> : <AnchorButton {...props} />
}
