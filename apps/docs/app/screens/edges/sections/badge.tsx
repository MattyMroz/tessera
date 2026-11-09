import { Badge } from '@mattymroz/tessera/components/badge/badge'
import { Button } from '@mattymroz/tessera/components/button/button'
import { Edge, LONG } from '../edge'

export function BadgeEdge() {
  return (
    <Edge data-edge-component="badge" title="Badge">
      <Badge numeric>1</Badge>
      <Badge size="sm" numeric>
        1284
      </Badge>
      <Badge size="xs">A</Badge>
      <Badge tone="warning" dot>
        {LONG}
      </Badge>
      <Button size="sm">Next to a button</Button>
      <Badge variant="ghost" tone="success" dot>
        Running
      </Badge>
    </Edge>
  )
}
