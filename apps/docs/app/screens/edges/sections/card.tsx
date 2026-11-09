import { Button } from '@mattymroz/tessera/components/button/button'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Edge, LONG } from '../edge'

export function CardEdge() {
  return (
    <Edge data-edge-component="card" title="Card">
      <div className="w-full">
        <Card container>
          <CardHeader level={3} title={LONG} description={LONG} action={<Button variant="soft">Edit</Button>} />
          <Text as="p">{LONG}</Text>
          <CardActions>
            <Button>Cancel</Button>
            <Button variant="solid">Save</Button>
          </CardActions>
        </Card>
      </div>
      <Card href="#card-edge">
        <CardHeader level={3} title="A" />
      </Card>
    </Edge>
  )
}
