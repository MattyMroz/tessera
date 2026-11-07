import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { Tooltip, TooltipBar, TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import Eraser from 'lucide-react/icons/eraser'
import MessageSquare from 'lucide-react/icons/message-square'
import MousePointer2 from 'lucide-react/icons/mouse-pointer-2'
import Move from 'lucide-react/icons/move'
import Plus from 'lucide-react/icons/plus'
import type { ReactNode } from 'react'
import { CompositionSample } from './composition'
import { ChoiceListsSample, MovingTargetSample } from './indicator-samples'
import { OverflowSample } from './overflow'
import { ScopeSample } from './scope-sample'
import { AlertEdge } from './sections/alert'
import { AlertDialogEdge } from './sections/alert-dialog'
import { BadgeEdge } from './sections/badge'
import { ButtonEdge } from './sections/button'
import { ButtonGroupEdge } from './sections/button-group'
import { CardEdge } from './sections/card'
import { CheckboxEdge } from './sections/checkbox'
import { DialogEdge } from './sections/dialog'
import { FieldEdge } from './sections/field'
import { HeadingEdge } from './sections/heading'
import { InputEdge } from './sections/input'
import { KbdEdge } from './sections/kbd'
import { MenuEdge } from './sections/menu'
import { PopoverEdge } from './sections/popover'
import { RadioEdge } from './sections/radio'
import { SwitchEdge } from './sections/switch'
import { TextEdge } from './sections/text'
import { TextareaEdge } from './sections/textarea'
import { ToggleGroupEdge } from './sections/toggle-group'
import { TooltipEdge } from './sections/tooltip'

const TOOLS = [
  { label: 'Select', Icon: MousePointer2 },
  { label: 'Pan', Icon: Move },
  { label: 'Draw bubble', Icon: MessageSquare },
  { label: 'Erase text', Icon: Eraser },
] as const
const RANGES = ['Day', 'Week', 'Month'] as const
const HIT_SIZES = ['xs', 'md'] as const
const CHAPTERS = Array.from({ length: 20 }, (_, index) => `Chapter ${index + 1}`)
const GROUPS: readonly (readonly [string, ...string[]])[] = [
  ['On', 'Off'],
  ['Day', 'Week', 'Month'],
  ['XS', 'S', 'M', 'L', 'XL'],
  ['Pages', 'Panels', 'Bubbles', 'Timeline'],
  ['Original', 'Translated'],
  ['1', '2', '3', '4', '5', '6'],
  ['Left', 'Centre', 'Right'],
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
]

function Foundation({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-group">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Range({ label }: { label: string }) {
  return (
    <ToggleGroup aria-label={label} defaultValue="Week">
      {RANGES.map((range) => (
        <ToggleGroupItem key={range} value={range}>
          {range}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function Card({ testId, container = false, children }: { testId: string; container?: boolean; children: ReactNode }) {
  return (
    <div
      data-testid={testId}
      data-recipe="surface"
      data-level="raised"
      data-surface=""
      data-inset="card"
      data-container={container ? '' : undefined}
      className="flex flex-col gap-group"
    >
      <p>{children}</p>
      <div data-slot="actions">
        <Button>Cancel</Button>
        <Button variant="solid">Save</Button>
      </div>
    </div>
  )
}

function FileMenu({ label }: { label: string }) {
  return (
    <Menu>
      <MenuTrigger variant="soft">{label}</MenuTrigger>
      <MenuContent>
        <MenuItem trail="Ctrl+O">Open</MenuItem>
        <MenuItem trail="Ctrl+D">Duplicate</MenuItem>
        <MenuItem disabled>Revert</MenuItem>
        <MenuSeparator />
        <MenuItem>Close</MenuItem>
      </MenuContent>
    </Menu>
  )
}

export default function Page() {
  return (
    <TooltipProvider>
      <h1>Edges</h1>

      <ButtonEdge />
      <ButtonGroupEdge />
      <InputEdge />
      <ToggleGroupEdge />
      <CheckboxEdge />
      <SwitchEdge />
      <RadioEdge />
      <MenuEdge />
      <TooltipEdge />
      <PopoverEdge />
      <DialogEdge />
      <TextEdge />
      <HeadingEdge />
      <KbdEdge />
      <BadgeEdge />
      <CardEdge />
      <AlertEdge />
      <FieldEdge />
      <TextareaEdge />
      <AlertDialogEdge />

      <Foundation title="Composition">
        <CompositionSample />
      </Foundation>

      <Foundation title="Overflow">
        <OverflowSample />
      </Foundation>

      <Foundation title="Sizes and corners">
        {THEME_CONFIG.axes.corners.map((corners) => (
          <div key={corners} data-corners={corners} className="flex flex-wrap items-center gap-inset">
            {THEME_CONFIG.axes.size.map((size) => (
              <Button key={size} variant="outline" size={size}>
                {`${corners} ${size}`}
              </Button>
            ))}
            {THEME_CONFIG.axes.size.map((size) => (
              <Button key={size} variant="solid" size={size} aria-label={`Add ${corners} ${size}`} icon={<Plus />} />
            ))}
          </div>
        ))}
      </Foundation>

      <Foundation title="States">
        <div className="flex flex-wrap items-center gap-inset">
          <Button variant="outline" disabled>
            Disabled
          </Button>
          <Button variant="solid" busy icon={<Plus />}>
            Saving
          </Button>
          <Button variant="soft" aria-pressed="true">
            Pressed
          </Button>
          <Input aria-label="Disabled field" defaultValue="Disabled" disabled />
          <Input aria-label="Read-only field" defaultValue="Read only" readOnly />
          <Input aria-label="Invalid field" type="email" defaultValue="not an email" aria-invalid="true" />
          <Input aria-label="E-mail field" type="email" placeholder="name@example.com" />
          <ToggleGroup aria-label="With a disabled option" defaultValue="Day">
            <ToggleGroupItem value="Day">Day</ToggleGroupItem>
            <ToggleGroupItem value="Week" disabled>
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="Month">Month</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup aria-label="Flat choice" variant="active" defaultValue="Week">
            {RANGES.map((range) => (
              <ToggleGroupItem key={range} value={range}>
                {range}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FileMenu label="With a disabled item" />
        </div>
      </Foundation>

      <Foundation title="Small bar">
        <div data-size="xs" data-density="compact" data-corners="none" className="flex flex-wrap items-center gap-inset">
          <TooltipBar>
            {TOOLS.map((tool) => (
              <Tooltip key={tool.label} content={tool.label}>
                <Button variant="ghost" aria-label={tool.label} icon={<tool.Icon />} />
              </Tooltip>
            ))}
          </TooltipBar>
          <Range label="Small range" />
          <FileMenu label="File" />
        </div>
      </Foundation>

      <Foundation title="Scope">
        <ScopeSample />
      </Foundation>

      <Foundation title="Moving target">
        <MovingTargetSample />
      </Foundation>

      <Foundation title="Choice lists">
        <ChoiceListsSample />
      </Foundation>

      <Foundation title="Hit area">
        {HIT_SIZES.map((size) => (
          <div key={size} data-size={size} className="flex flex-wrap items-center gap-group">
            <div data-testid={`hit-bar-${size}`} className="flex items-center gap-inset">
              {TOOLS.map((tool) => (
                <Button key={tool.label} variant="outline" aria-label={`${tool.label} ${size}`} icon={<tool.Icon />} />
              ))}
            </div>
            <ToggleGroup aria-label={`Hit range ${size}`} defaultValue="Week">
              {RANGES.map((range) => (
                <ToggleGroupItem key={range} value={range}>
                  {range}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ))}
      </Foundation>

      <Foundation title="Container">
        <div className="flex w-80 max-w-full flex-col gap-group">
          <Card testId="container-card" container>
            With data-container the actions stack when the card is narrower than the narrow container width.
          </Card>
          <Card testId="page-card">Without data-container the actions follow the width of the page.</Card>
        </div>
      </Foundation>

      <Foundation title="Long menu">
        <div className="flex flex-wrap items-center gap-inset">
          <Menu>
            <MenuTrigger variant="outline">Chapters</MenuTrigger>
            <MenuContent>
              {CHAPTERS.map((chapter) => (
                <MenuItem key={chapter}>{chapter}</MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </div>
      </Foundation>

      <Foundation title="Motion off">
        <div data-motion="off" className="flex flex-wrap items-center gap-inset">
          <Range label="Still range" />
          <FileMenu label="Still menu" />
        </div>
        <div className="flex flex-wrap items-center gap-inset">
          <TooltipBar>
            <div data-motion="off" className="flex items-center gap-inset">
              <Tooltip content="First still tip">
                <Button variant="ghost">First still</Button>
              </Tooltip>
              <Tooltip content="Second still tip">
                <Button variant="ghost">Second still</Button>
              </Tooltip>
            </div>
            <div data-motion="on" className="flex items-center">
              <Tooltip content="Moving tip">
                <Button variant="ghost">Moving</Button>
              </Tooltip>
            </div>
          </TooltipBar>
        </div>
      </Foundation>

      <Foundation title="Right to left">
        <div dir="rtl" className="flex flex-wrap items-center gap-inset">
          <Range label="Range from the right" />
          <Button variant="outline" icon={<Plus />}>
            Add page
          </Button>
          <Input aria-label="Field from the right" defaultValue="Chapter 12" />
        </div>
      </Foundation>

      <Foundation title="Eight groups">
        <div className="flex flex-wrap items-center gap-group">
          {GROUPS.map((labels, index) => (
            <ToggleGroup key={labels.join()} aria-label={`Group ${index + 1}`} defaultValue={labels[0]}>
              {labels.map((label) => (
                <ToggleGroupItem key={label} value={label}>
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ))}
          <FileMenu label="Groups menu" />
        </div>
      </Foundation>
    </TooltipProvider>
  )
}
