import { Heading } from '@mattymroz/tessera/components/text/heading'
import { Edge, LONG } from '../edge'

export function HeadingEdge() {
  return (
    <Edge data-edge-component="heading" title="Heading">
      <Heading level={3}>A</Heading>
      <Heading level={3}>{LONG}</Heading>
      <Heading level={4} variant="display">
        {LONG}
      </Heading>
    </Edge>
  )
}
