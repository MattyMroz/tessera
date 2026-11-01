import { Button } from '@mattymroz/tessera/components/button/button'
import { ButtonGroup } from '@mattymroz/tessera/components/button/button-group'
import ChevronDown from 'lucide-react/icons/chevron-down'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function ButtonGroupEdge() {
  return (
    <Edge data-edge-component="button-group" title="Button group">
      <ButtonGroup variant="track" aria-label="One character track">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>
      <ButtonGroup variant="joined" aria-label="Icons only">
        <Button variant="outline" aria-label="Add" icon={<Plus />} />
        <Button variant="outline" aria-label="More" icon={<ChevronDown />} />
      </ButtonGroup>
      <ButtonGroup variant="track" aria-label="Long track">
        <Button icon={<Plus />}>{LONG}</Button>
        <Button>{LONG}</Button>
        <Button aria-label="More" icon={<ChevronDown />} />
      </ButtonGroup>
      <ButtonGroup variant="joined" aria-label="Long joined">
        <Button variant="solid">{LONG}</Button>
        <Button variant="solid" aria-label="More options" icon={<ChevronDown />} />
      </ButtonGroup>
    </Edge>
  )
}
