import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function InputEdge() {
  return (
    <Edge data-edge-component="input" title="Input">
      <Input aria-label="One character" defaultValue="A" />
      <Input aria-label="Long value" defaultValue={LONG} />
      <Input aria-label="With a clear button" placeholder={LONG} end={<Button size="sm" aria-label="Clear" icon={<Plus />} />} />
    </Edge>
  )
}
