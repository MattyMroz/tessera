'use client'

import { Button, type ButtonVariant } from '@mattymroz/tessera/components/button/button'
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
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import { ToggleGroup, ToggleGroupItem, type ToggleGroupVariant } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { Tooltip, TooltipBar, TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import { THEME_CONFIG, type Choices } from '@mattymroz/tessera/lib/theme'
import Plus from 'lucide-react/icons/plus'
import { useState, type ReactNode } from 'react'

const VARIANTS: readonly ButtonVariant[] = ['ghost', 'solid', 'soft', 'outline', 'raised']
const SIZES: readonly Choices['size'][] = THEME_CONFIG.axes.size
const ICON_EVERY = 3
const SUBMENU_EVERY = 5
const OPTIONS_PER_SEGMENT = 5

function numbered(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1)
}

const BUTTONS = numbered(300)
const SEGMENTS = numbered(20)
const FIELDS = numbered(100)
const LIST = numbered(200)
const TRIGGERS = numbered(25)
const GROUP_OPTIONS = numbered(20)
const ROWS = numbered(500)
const GROUPS: readonly { readonly 'aria-label': string; readonly variant: ToggleGroupVariant; readonly size?: Choices['size'] }[] = [
  { 'aria-label': 'Raised group', variant: 'raised' },
  { 'aria-label': 'Active group', variant: 'active' },
  { 'aria-label': 'Small group', variant: 'raised', size: 'xs' },
]

function Region({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-group">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Scene() {
  return (
    <TooltipProvider>
      <Region title="Buttons">
        <div className="flex flex-wrap items-center gap-inset">
          {BUTTONS.map((index) => (
            <Button
              key={index}
              variant={VARIANTS[index % VARIANTS.length] ?? 'ghost'}
              size={SIZES[index % SIZES.length] ?? 'lg'}
              icon={index % ICON_EVERY === 0 ? <Plus /> : null}
            >
              {`Button ${index}`}
            </Button>
          ))}
        </div>
      </Region>

      <Region title="Segments">
        <div className="flex flex-wrap items-center gap-inset">
          {SEGMENTS.map((segment) => (
            <ToggleGroup key={segment} aria-label={`Segment ${segment}`} defaultValue="1">
              {numbered(OPTIONS_PER_SEGMENT).map((option) => (
                <ToggleGroupItem key={option} value={String(option)}>
                  {String(option)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ))}
        </div>
      </Region>

      <Region title="Fields">
        <div className="flex flex-wrap items-center gap-inset">
          {FIELDS.map((index) => (
            <Input key={index} aria-label={`Field ${index}`} placeholder={`Field ${index}`} />
          ))}
        </div>
      </Region>

      <Region title="List">
        <div className="flex flex-col items-start">
          <TooltipBar orientation="vertical">
            {LIST.map((index) => (
              <Tooltip key={index} content={`Tip ${index}`}>
                <Button variant="ghost">{`Item ${index}`}</Button>
              </Tooltip>
            ))}
          </TooltipBar>
        </div>
      </Region>

      <Region title="Triggers">
        <div className="flex flex-wrap items-center gap-inset">
          {TRIGGERS.map((index) => (
            <Menu key={`menu-${index}`}>
              <MenuTrigger variant="outline">{`Menu ${index}`}</MenuTrigger>
              <MenuContent>
                <MenuItem trail="Ctrl+O">Open</MenuItem>
                <MenuItem trail="Ctrl+D">Duplicate</MenuItem>
                <MenuItem>Rename</MenuItem>
                <MenuSeparator />
                {index % SUBMENU_EVERY === 0 ? (
                  <MenuSubmenu>
                    <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
                    <MenuSubmenuContent>
                      <MenuItem>Pages as WebP</MenuItem>
                      <MenuItem>Pages as PNG</MenuItem>
                    </MenuSubmenuContent>
                  </MenuSubmenu>
                ) : (
                  <MenuItem>Export</MenuItem>
                )}
                <MenuItem tone="danger">Delete</MenuItem>
              </MenuContent>
            </Menu>
          ))}
          <Dialog>
            <DialogTrigger variant="outline">Dialog</DialogTrigger>
            <DialogPopup>
              <DialogTitle>Dialog</DialogTitle>
              <DialogDescription>A dialog of the stress scene.</DialogDescription>
              <DialogActions>
                <DialogClose variant="solid">Close</DialogClose>
              </DialogActions>
            </DialogPopup>
          </Dialog>
          {TRIGGERS.map((index) => (
            <Popover key={`popover-${index}`}>
              <PopoverTrigger variant="outline">{`Popover ${index}`}</PopoverTrigger>
              <PopoverPopup>
                <PopoverTitle>{`Popover ${index}`}</PopoverTitle>
                <PopoverDescription>A popover of the stress scene.</PopoverDescription>
                <PopoverActions>
                  <PopoverClose variant="solid">Close</PopoverClose>
                </PopoverActions>
              </PopoverPopup>
            </Popover>
          ))}
        </div>
      </Region>

      <Region title="Groups">
        <div className="flex flex-col items-start gap-group">
          {GROUPS.map((group) => (
            <ToggleGroup key={group['aria-label']} {...group} defaultValue="1">
              {GROUP_OPTIONS.map((option) => (
                <ToggleGroupItem key={option} value={String(option)}>
                  {String(option)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ))}
        </div>
      </Region>

      <Region title="Toolbar">
        <div className="flex flex-col items-start">
          {ROWS.map((index) => (
            <Button key={index} variant="ghost">{`Cell ${index}`}</Button>
          ))}
        </div>
      </Region>

      <Region title="Rows">
        <Menu>
          <MenuTrigger variant="outline">Rows menu</MenuTrigger>
          <MenuContent>
            {ROWS.map((index) => (
              <MenuItem key={index}>{`Row ${index}`}</MenuItem>
            ))}
          </MenuContent>
        </Menu>
      </Region>
    </TooltipProvider>
  )
}

export default function Page() {
  const [mounted, setMounted] = useState(false)

  return (
    <>
      <h1>Stress</h1>
      <div className="flex flex-wrap items-center gap-inset">
        <Button variant="solid" disabled={mounted} onClick={() => setMounted(true)}>
          Mount scene
        </Button>
      </div>
      {mounted && <Scene />}
    </>
  )
}
