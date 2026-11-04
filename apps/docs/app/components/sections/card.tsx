'use client'

import { Badge } from '@mattymroz/tessera/components/badge/badge'
import { Button } from '@mattymroz/tessera/components/button/button'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Group } from './group'

export function CardSection() {
  return (
    <section aria-labelledby="card-title" className="flex flex-col gap-group">
      <h2 id="card-title">Card</h2>
      <div className="grid grid-cols-1 gap-group md:grid-cols-2">
        <Group title="Header, text and actions">
          <Card data-testid="invite-card">
            <CardHeader
              level={4}
              title="Invite your team"
              description="Translators and editors join the project with their own roles."
              action={
                <Badge variant="ghost" tone="success" size="sm" dot>
                  Active
                </Badge>
              }
            />
            <Text as="p">Everyone you invite sees the chapters you share with them.</Text>
            <CardActions>
              <Button>Later</Button>
              <Button variant="solid">Copy link</Button>
            </CardActions>
          </Card>
        </Group>
        <Group title="Base level in a container">
          <Card data-testid="export-card" level="base" container>
            <CardHeader level={4} title="Export" action={<Button variant="soft">Settings</Button>} />
            <Text as="p" variant="description">
              With container the actions stack in a column when the card is narrower than the narrow container width.
            </Text>
          </Card>
        </Group>
        <Group title="Link">
          <Card data-testid="link-card" href="#card-title">
            <CardHeader level={4} title="Chapter 12" description="24 pages, translated" />
          </Card>
        </Group>
      </div>
    </section>
  )
}
