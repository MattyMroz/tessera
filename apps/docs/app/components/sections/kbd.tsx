'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Kbd } from '@mattymroz/tessera/components/kbd/kbd'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Group } from './group'

export function KbdSection() {
  return (
    <section aria-labelledby="kbd-title" className="flex flex-col gap-group">
      <h2 id="kbd-title">Kbd</h2>
      <Group title="One key in text">
        <Text>
          Press <Kbd size="xs">K</Kbd> to open the search
        </Text>
      </Group>
      <Group title="Several keys">
        <Text>
          Save as <Kbd size="xs" keys={['Ctrl', 'Shift', 'S']} />
        </Text>
      </Group>
      <Group title="In a tooltip">
        <div className="flex flex-wrap items-center gap-inset">
          <Tooltip
            content={
              <>
                Save <Kbd size="xs" keys={['Ctrl', 'S']} />
              </>
            }
          >
            <Button variant="soft">Save</Button>
          </Tooltip>
        </div>
      </Group>
      <Group title="In a menu">
        <div className="flex flex-wrap items-center gap-inset">
          <Menu>
            <MenuTrigger variant="soft">Edit</MenuTrigger>
            <MenuContent>
              <MenuItem trail={<Kbd size="xs" keys={['Ctrl', 'Z']} />}>Undo</MenuItem>
              <MenuItem trail={<Kbd size="xs" keys={['Ctrl', 'Y']} />}>Redo</MenuItem>
              <MenuItem disabled trail={<Kbd size="xs" keys={['Ctrl', 'X']} />}>
                Cut
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Group>
      <Group title="Next to a button, the size of the page">
        <div className="flex flex-wrap items-center gap-inset">
          <Button variant="soft">Search</Button>
          <Kbd data-testid="kbd-inherit">K</Kbd>
        </div>
      </Group>
      <Group title="Sizes">
        <div className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Kbd key={size} size={size}>
              {`${size} Esc`}
            </Kbd>
          ))}
        </div>
      </Group>
    </section>
  )
}
