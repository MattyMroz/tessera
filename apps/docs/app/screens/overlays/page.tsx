import { Button } from '@mattymroz/tessera/components/button/button'
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@mattymroz/tessera/components/dialog/dialog'
import { Input } from '@mattymroz/tessera/components/input/input'
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'
import { Popover, PopoverActions, PopoverClose, PopoverPopup, PopoverTitle, PopoverTrigger } from '@mattymroz/tessera/components/popover/popover'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { Tooltip, TooltipBar, TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import Eraser from 'lucide-react/icons/eraser'
import MessageSquare from 'lucide-react/icons/message-square'
import MousePointer2 from 'lucide-react/icons/mouse-pointer-2'
import Move from 'lucide-react/icons/move'
import Volume2 from 'lucide-react/icons/volume-2'
import X from 'lucide-react/icons/x'
import type { ReactNode } from 'react'

const TOOLS = [
  { label: 'Select', Icon: MousePointer2 },
  { label: 'Pan', Icon: Move },
  { label: 'Draw bubble', Icon: MessageSquare },
  { label: 'Erase text', Icon: Eraser },
  { label: 'Read aloud', Icon: Volume2 },
] as const
const VIEWS = ['Pages', 'Panels', 'Bubbles', 'Timeline'] as const

function ProjectMenu() {
  return (
    <Menu>
      <MenuTrigger variant="raised">Project</MenuTrigger>
      <MenuContent>
        <MenuItem trail="Ctrl+O">Open</MenuItem>
        <MenuItem trail="Ctrl+D">Duplicate</MenuItem>
        <MenuCheckboxItem defaultChecked>Show bubbles</MenuCheckboxItem>
        <MenuSeparator />
        <MenuSubmenu>
          <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Pages as WebP</MenuItem>
            <MenuItem>Pages as PNG</MenuItem>
            <MenuSubmenu>
              <MenuSubmenuTrigger>Video</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>MP4</MenuItem>
                <MenuItem>WebM</MenuItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem tone="danger">Delete project</MenuItem>
      </MenuContent>
    </Menu>
  )
}

function Controls({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-inset">
        <TooltipBar>
          {TOOLS.map((tool) => (
            <Tooltip key={tool.label} content={tool.label}>
              <Button variant="ghost" aria-label={tool.label} icon={<tool.Icon />} />
            </Tooltip>
          ))}
        </TooltipBar>
      </div>
      <ToggleGroup aria-label="View" defaultValue="Pages">
        {VIEWS.map((view) => (
          <ToggleGroupItem key={view} value={view}>
            {view}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Input aria-label="Search" placeholder="Search" end={<Button size="sm" aria-label="Clear search" icon={<X />} />} />
      <div className="flex flex-wrap items-center gap-inset">
        <ProjectMenu />
        {children}
      </div>
    </>
  )
}

function NestedPopover() {
  return (
    <Popover>
      <PopoverTrigger variant="outline">Style</PopoverTrigger>
      <PopoverPopup>
        <PopoverTitle>Bubble style</PopoverTitle>
        <Controls />
        <PopoverActions>
          <PopoverClose>Cancel</PopoverClose>
          <PopoverClose variant="solid">Apply</PopoverClose>
        </PopoverActions>
      </PopoverPopup>
    </Popover>
  )
}

function QuickEdit() {
  return (
    <Popover>
      <PopoverTrigger variant="outline">Quick edit</PopoverTrigger>
      <PopoverPopup>
        <PopoverTitle>Quick edit</PopoverTitle>
        <Controls />
        <PopoverActions>
          <PopoverClose>Cancel</PopoverClose>
          <PopoverClose variant="solid">Save</PopoverClose>
        </PopoverActions>
      </PopoverPopup>
    </Popover>
  )
}

function ChapterSettings() {
  return (
    <Dialog>
      <DialogTrigger variant="solid">Chapter settings</DialogTrigger>
      <DialogPopup>
        <DialogTitle>Chapter settings</DialogTitle>
        <DialogDescription>Every control here sits one level deeper than on the page.</DialogDescription>
        <Controls>
          <NestedPopover />
        </Controls>
        <DialogActions>
          <DialogClose>Cancel</DialogClose>
          <DialogClose variant="solid">Save</DialogClose>
        </DialogActions>
      </DialogPopup>
    </Dialog>
  )
}

export default function Page() {
  return (
    <TooltipProvider>
      <h1>Overlays in overlays</h1>
      <section aria-label="Page" className="flex flex-col items-start gap-inset">
        <Controls />
      </section>
      <section
        aria-label="Island"
        data-recipe="surface"
        data-level="base"
        data-surface=""
        data-inset="inset"
        className="flex flex-col items-start gap-inset self-start"
      >
        <Controls>
          <QuickEdit />
        </Controls>
      </section>
      <section
        aria-label="Card"
        data-recipe="surface"
        data-level="raised"
        data-surface=""
        data-inset="card"
        className="flex flex-col items-start gap-group self-start"
      >
        <Controls>
          <ChapterSettings />
        </Controls>
      </section>
    </TooltipProvider>
  )
}
