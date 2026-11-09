'use client'

import { Badge } from '@mattymroz/tessera/components/badge/badge'
import { Button } from '@mattymroz/tessera/components/button/button'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { TONES } from '@mattymroz/tessera/lib/tone'
import { Group } from './group'

const VARIANTS = ['soft', 'outline', 'solid', 'ghost'] as const
const COUNTS = ['3', '12', '128'] as const

export function BadgeSection() {
  return (
    <section aria-labelledby="badge-title" className="flex flex-col gap-group">
      <h2 id="badge-title">Badge</h2>
      <Group title="Variants and tones">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-inset">
            {TONES.map((tone) => (
              <Badge key={tone} variant={variant} tone={tone} dot={variant === 'ghost'}>
                {`${variant} ${tone}`}
              </Badge>
            ))}
          </div>
        ))}
      </Group>
      <Group title="Counts">
        <div className="flex flex-wrap items-center gap-inset">
          {COUNTS.map((count) => (
            <Badge key={count} numeric>
              {count}
            </Badge>
          ))}
        </div>
      </Group>
      <Group title="Next to other elements">
        <div className="flex flex-wrap items-center gap-inset">
          <Button variant="soft">Approvals</Button>
          <Badge variant="solid" tone="danger" numeric>
            4
          </Badge>
          <Badge variant="ghost" tone="success" dot>
            Running · port 8721
          </Badge>
          <Tooltip
            content={
              <>
                Inbox <Badge size="xs" numeric>2</Badge>
              </>
            }
          >
            <Button variant="soft">Inbox</Button>
          </Tooltip>
          <Menu>
            <MenuTrigger variant="soft">Folders</MenuTrigger>
            <MenuContent>
              <MenuItem trail={<Badge size="sm" numeric>7</Badge>}>Drafts</MenuItem>
              <MenuItem trail={<Badge size="sm" numeric>24</Badge>}>Chapters</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Group>
      <Group title="Sizes">
        <div className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Badge key={size} size={size} tone="info" dot>
              {size}
            </Badge>
          ))}
        </div>
      </Group>
    </section>
  )
}
