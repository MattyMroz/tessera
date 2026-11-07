import type { ComponentType } from 'react'
import { AlertSection } from './components/sections/alert'
import { AlertDialogSection } from './components/sections/alert-dialog'
import { BadgeSection } from './components/sections/badge'
import { ButtonSection } from './components/sections/button'
import { ButtonGroupSection } from './components/sections/button-group'
import { CardSection } from './components/sections/card'
import { CheckboxSection } from './components/sections/checkbox'
import { ContextMenuSection } from './components/sections/context-menu'
import { DialogSection } from './components/sections/dialog'
import { FieldSection } from './components/sections/field'
import { InputSection } from './components/sections/input'
import { KbdSection } from './components/sections/kbd'
import { MenuSection } from './components/sections/menu'
import { MenubarSection } from './components/sections/menubar'
import { PopoverSection } from './components/sections/popover'
import { RadioSection } from './components/sections/radio'
import { SelectSection } from './components/sections/select'
import { SwitchSection } from './components/sections/switch'
import { TextSection } from './components/sections/text'
import { TextareaSection } from './components/sections/textarea'
import { ToggleGroupSection } from './components/sections/toggle-group'
import { TooltipSection } from './components/sections/tooltip'

export type ElementStatus = 'not-ready' | 'accepted' | 'done'

export const STATUS_MARKS: Readonly<Record<ElementStatus, { readonly mark: string; readonly label: string }>> = {
  'not-ready': { mark: '✗', label: 'Not ready' },
  accepted: { mark: '–', label: 'Accepted with work left' },
  done: { mark: '✓', label: 'Done' },
}

export const LAB_ELEMENTS: readonly {
  readonly id: string
  readonly name: string
  readonly status: ElementStatus
  readonly Section: ComponentType
}[] = [
  { id: 'alert', name: 'Alert', status: 'not-ready', Section: AlertSection },
  { id: 'alert-dialog', name: 'Alert dialog', status: 'not-ready', Section: AlertDialogSection },
  { id: 'badge', name: 'Badge', status: 'not-ready', Section: BadgeSection },
  { id: 'button', name: 'Button', status: 'accepted', Section: ButtonSection },
  { id: 'button-group', name: 'Button group', status: 'not-ready', Section: ButtonGroupSection },
  { id: 'card', name: 'Card', status: 'not-ready', Section: CardSection },
  { id: 'checkbox', name: 'Checkbox', status: 'accepted', Section: CheckboxSection },
  { id: 'context-menu', name: 'Context menu', status: 'not-ready', Section: ContextMenuSection },
  { id: 'dialog', name: 'Dialog', status: 'not-ready', Section: DialogSection },
  { id: 'field', name: 'Field', status: 'not-ready', Section: FieldSection },
  { id: 'input', name: 'Input', status: 'not-ready', Section: InputSection },
  { id: 'kbd', name: 'Kbd', status: 'not-ready', Section: KbdSection },
  { id: 'menu', name: 'Menu', status: 'not-ready', Section: MenuSection },
  { id: 'menubar', name: 'Menubar', status: 'accepted', Section: MenubarSection },
  { id: 'popover', name: 'Popover', status: 'not-ready', Section: PopoverSection },
  { id: 'radio', name: 'Radio', status: 'accepted', Section: RadioSection },
  { id: 'select', name: 'Select', status: 'not-ready', Section: SelectSection },
  { id: 'switch', name: 'Switch', status: 'accepted', Section: SwitchSection },
  { id: 'text', name: 'Text', status: 'not-ready', Section: TextSection },
  { id: 'textarea', name: 'Textarea', status: 'not-ready', Section: TextareaSection },
  { id: 'toggle-group', name: 'Toggle group', status: 'not-ready', Section: ToggleGroupSection },
  { id: 'tooltip', name: 'Tooltip', status: 'not-ready', Section: TooltipSection },
]
