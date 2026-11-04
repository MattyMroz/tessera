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

export const LAB_ELEMENTS: readonly { readonly id: string; readonly name: string; readonly Section: ComponentType }[] = [
  { id: 'alert', name: 'Alert', Section: AlertSection },
  { id: 'alert-dialog', name: 'Alert dialog', Section: AlertDialogSection },
  { id: 'badge', name: 'Badge', Section: BadgeSection },
  { id: 'button', name: 'Button', Section: ButtonSection },
  { id: 'button-group', name: 'Button group', Section: ButtonGroupSection },
  { id: 'card', name: 'Card', Section: CardSection },
  { id: 'checkbox', name: 'Checkbox', Section: CheckboxSection },
  { id: 'context-menu', name: 'Context menu', Section: ContextMenuSection },
  { id: 'dialog', name: 'Dialog', Section: DialogSection },
  { id: 'field', name: 'Field', Section: FieldSection },
  { id: 'input', name: 'Input', Section: InputSection },
  { id: 'kbd', name: 'Kbd', Section: KbdSection },
  { id: 'menu', name: 'Menu', Section: MenuSection },
  { id: 'menubar', name: 'Menubar', Section: MenubarSection },
  { id: 'popover', name: 'Popover', Section: PopoverSection },
  { id: 'radio', name: 'Radio', Section: RadioSection },
  { id: 'select', name: 'Select', Section: SelectSection },
  { id: 'switch', name: 'Switch', Section: SwitchSection },
  { id: 'text', name: 'Text', Section: TextSection },
  { id: 'textarea', name: 'Textarea', Section: TextareaSection },
  { id: 'toggle-group', name: 'Toggle group', Section: ToggleGroupSection },
  { id: 'tooltip', name: 'Tooltip', Section: TooltipSection },
]
