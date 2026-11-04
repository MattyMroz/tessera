import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import TextAlignCenter from 'lucide-react/icons/text-align-center'
import TextAlignEnd from 'lucide-react/icons/text-align-end'
import TextAlignStart from 'lucide-react/icons/text-align-start'
import { Edge, LONG } from '../edge'

const ALIGNMENTS = [
  { value: 'left', Icon: TextAlignStart },
  { value: 'centre', Icon: TextAlignCenter },
  { value: 'right', Icon: TextAlignEnd },
] as const
const DIGITS = ['1', '2', '3'] as const

export function ToggleGroupEdge() {
  return (
    <Edge data-edge-component="toggle-group" title="Toggle group">
      <ToggleGroup aria-label="One character" defaultValue="1">
        {DIGITS.map((digit) => (
          <ToggleGroupItem key={digit} value={digit}>
            {digit}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup aria-label="Icons only" defaultValue="left">
        {ALIGNMENTS.map((alignment) => (
          <ToggleGroupItem key={alignment.value} value={alignment.value} aria-label={alignment.value} icon={<alignment.Icon />} />
        ))}
      </ToggleGroup>
      <ToggleGroup aria-label="Long label" defaultValue="short">
        <ToggleGroupItem value="short">Short</ToggleGroupItem>
        <ToggleGroupItem value="long">{LONG}</ToggleGroupItem>
      </ToggleGroup>
    </Edge>
  )
}
