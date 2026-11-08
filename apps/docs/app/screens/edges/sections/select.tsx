import { Select, SelectContent, SelectItem, SelectTrigger } from '@mattymroz/tessera/components/select/select'
import { Edge, LONG } from '../edge'

const SHORT = { a: 'A' } as const
const LONG_LABELS = { long: LONG, short: 'A' } as const

export function SelectEdge() {
  return (
    <Edge data-edge-component="select" title="Select">
      <Select defaultValue="a">
        <SelectTrigger variant="outline" aria-label="Pick" placeholder="Pick" labels={SHORT} />
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="long">
        <SelectTrigger variant="outline" aria-label="Pick" placeholder="Pick" labels={LONG_LABELS} data-edge-open="click" />
        <SelectContent>
          <SelectItem value="long" trail="Ctrl+E">
            {LONG}
          </SelectItem>
          <SelectItem value="short">A</SelectItem>
        </SelectContent>
      </Select>
    </Edge>
  )
}
