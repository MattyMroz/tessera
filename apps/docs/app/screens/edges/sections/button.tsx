import { Button } from '@mattymroz/tessera/components/button/button'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function ButtonEdge() {
  return (
    <Edge data-edge-component="button" title="Button">
      <Button variant="outline">A</Button>
      <Button variant="outline" aria-label="Add" icon={<Plus />} />
      <Button variant="solid" icon={<Plus />}>
        {LONG}
      </Button>
      <Button variant="outline">{LONG}</Button>
      <Button variant="outline" title="Own title">
        {LONG}
      </Button>
      <Tooltip content="Tooltip name">
        <Button variant="soft">{LONG}</Button>
      </Tooltip>
      <Button href="#button-edge" variant="ghost">
        {LONG}
      </Button>
    </Edge>
  )
}
