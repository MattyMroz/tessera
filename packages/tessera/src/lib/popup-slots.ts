import type { ComponentProps } from 'react'
import type { ButtonProps } from '../components/button/button'
import type { SlotOrder } from './slot'
import type { Choices } from './theme'
import type { Unstyled } from './unstyled'

export const POPUP_SLOTS: SlotOrder = ['title', 'description', null, 'actions', 'close']

export const TITLE_LINE_SIZE: Choices['size'] = 'sm'

export type PopupDismissProps = Omit<ButtonProps, 'children' | 'icon' | 'iconEnd' | 'size' | 'aria-label'> & { 'aria-label': string }

export type PopupActionsProps = Unstyled<ComponentProps<'div'>>
