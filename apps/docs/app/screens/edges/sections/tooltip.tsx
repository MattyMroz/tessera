import { Button } from '@mattymroz/tessera/components/button/button'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function TooltipEdge() {
  return (
    <Edge data-edge-component="tooltip" title="Tooltip">
      <Tooltip content="A">
        <Button variant="outline">A</Button>
      </Tooltip>
      <Tooltip content={LONG}>
        <Button variant="outline" aria-label="Help" icon={<Plus />} data-edge-open="hover" />
      </Tooltip>
    </Edge>
  )
}
