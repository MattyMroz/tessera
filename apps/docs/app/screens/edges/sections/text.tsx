import { Text } from '@mattymroz/tessera/components/text/text'
import { Edge, LONG } from '../edge'

const LONG_COUNT = '1,024,512 pages in 2,048 panels'

export function TextEdge() {
  return (
    <Edge data-edge-component="text" title="Text">
      <Text variant="label">A</Text>
      <Text as="p" variant="description">
        {LONG}
      </Text>
      <Text variant="error">{LONG}</Text>
      <Text variant="kbd">Ctrl+Shift+Alt+E</Text>
      <Text variant="label" numeric>
        {LONG_COUNT}
      </Text>
    </Edge>
  )
}
