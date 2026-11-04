import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverDescription,
  PopoverDismiss,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import Info from 'lucide-react/icons/info'

export function PopoverSection() {
  return (
    <section aria-labelledby="popover-title" className="flex flex-col gap-group">
      <h2 id="popover-title">Popover</h2>
      <div className="flex flex-wrap items-center gap-inset">
        <Popover>
          <PopoverTrigger variant="outline">Notes</PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Page 3 notes</PopoverTitle>
            <PopoverDescription>Two bubbles wait for a second look.</PopoverDescription>
            <PopoverDismiss aria-label="Close" />
          </PopoverPopup>
        </Popover>
        <Popover>
          <PopoverTrigger variant="outline">Details</PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Chapter 12</PopoverTitle>
            <PopoverDescription>24 pages, translated and ready for review.</PopoverDescription>
            <PopoverActions>
              <PopoverClose variant="solid">Got it</PopoverClose>
            </PopoverActions>
          </PopoverPopup>
        </Popover>
        <Popover>
          <PopoverTrigger variant="soft">Rename</PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Rename page</PopoverTitle>
            <Input aria-label="Page name" defaultValue="Page 3" />
            <PopoverActions>
              <PopoverClose>Cancel</PopoverClose>
              <PopoverClose variant="solid">Save</PopoverClose>
            </PopoverActions>
          </PopoverPopup>
        </Popover>
        <Popover>
          <PopoverTrigger aria-label="About" icon={<Info />} />
          <PopoverPopup>
            <PopoverDescription>The popup takes its gap and radius from the theme.</PopoverDescription>
          </PopoverPopup>
        </Popover>
        <Popover>
          <PopoverTrigger disabled>Disabled</PopoverTrigger>
          <PopoverPopup>
            <PopoverDescription>Never shown.</PopoverDescription>
          </PopoverPopup>
        </Popover>
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
        <Popover>
          <PopoverTrigger variant="solid">From a card</PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Export</PopoverTitle>
            <PopoverDescription>The popup is a first-level surface wherever the trigger sits.</PopoverDescription>
            <PopoverActions>
              <Button>Later</Button>
              <PopoverClose variant="solid">Export</PopoverClose>
            </PopoverActions>
          </PopoverPopup>
        </Popover>
      </div>
    </section>
  )
}
