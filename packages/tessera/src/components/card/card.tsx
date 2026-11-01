'use client'

import type { ComponentProps, ReactNode } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { SlotHost, usePart, useSlotOrder, type SlotOrder } from '../../lib/slot'
import type { Unstyled } from '../../lib/unstyled'
import { Heading, type HeadingLevel } from '../text/heading'
import { Text } from '../text/text'

const HOST = 'Card'

const CARD_SLOTS: SlotOrder = ['header', null, 'actions']

export type CardLevel = 'raised' | 'base'

type CardLook = {
  level?: CardLevel
  container?: boolean
  children: ReactNode
}

type LookAttributes = {
  level: CardLevel | undefined
  container: boolean | undefined
}

export type CardProps = CardLook & Unstyled<ComponentProps<'div'>, 'children'> & { href?: undefined }

export type CardLinkProps = CardLook & Unstyled<ComponentProps<'a'>, 'children' | 'href'> & { href: string }

export type CardHeaderProps = {
  title: ReactNode
  level: HeadingLevel
  description?: ReactNode
  action?: ReactNode
}

export type CardActionsProps = {
  children: ReactNode
}

function lookOf({ level, container }: LookAttributes) {
  return {
    'data-component': 'card',
    'data-recipe': 'surface',
    'data-level': level === 'base' ? undefined : 'raised',
    'data-surface': '',
    'data-inset': 'card',
    'data-container': container ? '' : undefined,
  } as const
}

export function Card(props: CardProps | CardLinkProps) {
  const slots = useSlotOrder(HOST, CARD_SLOTS)
  const { ref } = props
  const cardRef = composeRefs<HTMLDivElement | HTMLAnchorElement>(ref, slots)
  if (props.href === undefined) {
    const { level, container, children, ...div } = props
    return (
      <div {...div} ref={cardRef} {...lookOf({ level, container })}>
        <SlotHost value={HOST}>{children}</SlotHost>
      </div>
    )
  }
  const { level, container, children, ...anchor } = props
  return (
    <a {...anchor} ref={cardRef} {...lookOf({ level, container })} data-focus="outer">
      <SlotHost value={HOST}>{children}</SlotHost>
    </a>
  )
}

export function CardHeader({ title, description, action, level }: CardHeaderProps) {
  usePart(HOST, 'CardHeader')
  return (
    <div data-slot="header">
      <SlotHost value={null}>
        <Heading level={level} data-slot="title">
          {title}
        </Heading>
        {description != null && (
          <Text as="p" variant="description" data-slot="description">
            {description}
          </Text>
        )}
        {action != null && <div data-slot="action">{action}</div>}
      </SlotHost>
    </div>
  )
}

export function CardActions({ children }: CardActionsProps) {
  usePart(HOST, 'CardActions')
  return (
    <div data-slot="actions">
      <SlotHost value={null}>{children}</SlotHost>
    </div>
  )
}
