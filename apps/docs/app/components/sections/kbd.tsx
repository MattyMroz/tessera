'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Kbd } from '@mattymroz/tessera/components/kbd/kbd'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'

export function KbdSection() {
  return (
    <section aria-labelledby="kbd-title" className="flex flex-col gap-group">
      <h2 id="kbd-title">Kbd</h2>
      <div className="flex flex-wrap items-center gap-group">
        <Text>
          Press <Kbd size="xs">K</Kbd> to open the search
        </Text>
        <Text>
          Save as <Kbd size="xs" keys={['Ctrl', 'Shift', 'S']} />
        </Text>
        <Tooltip
          content={
            <>
              Save <Kbd size="xs" keys={['Ctrl', 'S']} />
            </>
          }
        >
          <Button variant="soft">Save</Button>
        </Tooltip>
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
      <div className="flex flex-wrap items-center gap-inset">
        <Button variant="soft">Search</Button>
        <Kbd data-testid="kbd-inherit">K</Kbd>
      </div>
      <div className="flex flex-wrap items-end gap-inset">
        {THEME_CONFIG.axes.size.map((size) => (
          <Kbd key={size} size={size}>
            {`${size} Esc`}
          </Kbd>
        ))}
      </div>
    </section>
  )
}
