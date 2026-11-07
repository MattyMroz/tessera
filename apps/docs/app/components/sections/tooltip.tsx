import { Button } from '@mattymroz/tessera/components/button/button'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Tooltip, TooltipBar } from '@mattymroz/tessera/components/tooltip/tooltip'
import Eraser from 'lucide-react/icons/eraser'
import MessageSquare from 'lucide-react/icons/message-square'
import MousePointer2 from 'lucide-react/icons/mouse-pointer-2'
import Move from 'lucide-react/icons/move'
import Volume2 from 'lucide-react/icons/volume-2'
import { Group } from './group'

const TOOLS = [
  { label: 'Select', Icon: MousePointer2 },
  { label: 'Pan', Icon: Move },
  { label: 'Draw bubble', Icon: MessageSquare },
  { label: 'Erase text', Icon: Eraser },
  { label: 'Read aloud', Icon: Volume2 },
] as const

const GROUP = ['Undo', 'Redo', 'Copy', 'Paste the copied bubble'] as const
const COLUMN = ['Pages', 'Layers', 'History'] as const

export function TooltipSection() {
  return (
    <section aria-labelledby="tooltip-title" className="flex flex-col gap-group">
      <h2 id="tooltip-title">Tooltip</h2>
      <Group title="Text">
        <div className="flex flex-wrap items-center gap-group">
          <Tooltip content="Saves the chapter">
            <Button variant="soft">Save</Button>
          </Tooltip>
        </div>
      </Group>
      <Group title="With a key">
        <div className="flex flex-wrap items-center gap-group">
          <Tooltip
            content={
              <>
                <Text variant="label">Print</Text> <Text variant="kbd">Ctrl+P</Text>
              </>
            }
          >
            <Button variant="soft">Print</Button>
          </Tooltip>
        </div>
      </Group>
      <Group title="Next to each other">
        <div className="flex flex-wrap items-center gap-inset">
          {GROUP.map((label) => (
            <Tooltip key={label} content={label}>
              <Button>{label.split(' ')[0]}</Button>
            </Tooltip>
          ))}
        </div>
      </Group>
      <Group title="Without an arrow">
        <div className="flex flex-wrap items-center gap-group">
          <Tooltip content="No arrow" arrow={false}>
            <Button variant="soft">Plain</Button>
          </Tooltip>
        </div>
      </Group>
      <Group title="In a bar">
        <div data-recipe="surface" data-level="base" data-surface="" data-inset="inset" className="self-start">
          <TooltipBar>
            {TOOLS.map((tool) => (
              <Tooltip key={tool.label} content={tool.label}>
                <Button aria-label={tool.label} icon={<tool.Icon />} />
              </Tooltip>
            ))}
          </TooltipBar>
        </div>
      </Group>
      <Group title="In a vertical bar">
        <div data-recipe="surface" data-level="base" data-surface="" data-inset="inset" className="self-start">
          <TooltipBar orientation="vertical">
            {COLUMN.map((label) => (
              <Tooltip key={label} content={`Show ${label.toLowerCase()}`}>
                <Button>{label}</Button>
              </Tooltip>
            ))}
          </TooltipBar>
        </div>
      </Group>
    </section>
  )
}
