import { Button } from '@mattymroz/tessera/components/button/button'
import { Kbd } from '@mattymroz/tessera/components/kbd/kbd'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import { Edge } from '../edge'

export function KbdEdge() {
  return (
    <Edge data-edge-component="kbd" title="Kbd">
      <Kbd>K</Kbd>
      <Kbd>Backspace</Kbd>
      <Kbd keys={['Ctrl', 'Alt', 'Shift', 'PageDown']} />
      <Kbd size="xl">Esc</Kbd>
      <Tooltip
        content={
          <>
            Find <Kbd keys={['Ctrl', 'F']} />
          </>
        }
      >
        <Button variant="ghost">Find</Button>
      </Tooltip>
    </Edge>
  )
}
