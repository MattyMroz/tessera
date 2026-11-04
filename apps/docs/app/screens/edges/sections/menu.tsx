import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function MenuEdge() {
  return (
    <Edge data-edge-component="menu" title="Menu">
      <Menu>
        <MenuTrigger variant="outline">A</MenuTrigger>
        <MenuContent>
          <MenuItem>A</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger variant="outline" aria-label="More" icon={<Plus />} />
        <MenuContent>
          <MenuItem icon={<Plus />}>Add</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger variant="outline" data-edge-open="click">
          {LONG}
        </MenuTrigger>
        <MenuContent>
          <MenuItem>A</MenuItem>
          <MenuItem icon={<Plus />} trail="Ctrl+E">
            {LONG}
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Close</MenuItem>
        </MenuContent>
      </Menu>
    </Edge>
  )
}
