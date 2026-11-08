import { TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import { AlertSection } from './sections/alert'
import { AlertDialogSection } from './sections/alert-dialog'
import { BadgeSection } from './sections/badge'
import { ButtonSection } from './sections/button'
import { ButtonGroupSection } from './sections/button-group'
import { CardSection } from './sections/card'
import { CheckboxSection } from './sections/checkbox'
import { ContextMenuSection } from './sections/context-menu'
import { DialogSection } from './sections/dialog'
import { FieldSection } from './sections/field'
import { InputSection } from './sections/input'
import { KbdSection } from './sections/kbd'
import { MenuSection } from './sections/menu'
import { MenubarSection } from './sections/menubar'
import { PopoverSection } from './sections/popover'
import { RadioSection } from './sections/radio'
import { SelectSection } from './sections/select'
import { SwitchSection } from './sections/switch'
import { TextSection } from './sections/text'
import { TextareaSection } from './sections/textarea'
import { ToggleGroupSection } from './sections/toggle-group'
import { TooltipSection } from './sections/tooltip'

export default function Page() {
  return (
    <TooltipProvider>
      <h1>Components</h1>
      <ButtonSection />
      <ButtonGroupSection />
      <InputSection />
      <ToggleGroupSection />
      <CheckboxSection />
      <RadioSection />
      <SwitchSection />
      <MenuSection />
      <ContextMenuSection />
      <MenubarSection />
      <SelectSection />
      <PopoverSection />
      <DialogSection />
      <TooltipSection />
      <TextSection />
      <KbdSection />
      <BadgeSection />
      <CardSection />
      <AlertSection />
      <FieldSection />
      <TextareaSection />
      <AlertDialogSection />
    </TooltipProvider>
  )
}
