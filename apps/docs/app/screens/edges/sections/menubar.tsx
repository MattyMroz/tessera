import { MenuItem, MenuSeparator } from '@mattymroz/tessera/components/menu/menu'
import { Menubar, MenubarMenu } from '@mattymroz/tessera/components/menu/menubar'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function MenubarEdge() {
  return (
    <Edge data-edge-component="menubar" title="Menubar">
      <Menubar moreLabel="More menus">
        <MenubarMenu label="A">
          <MenuItem>A</MenuItem>
        </MenubarMenu>
        <MenubarMenu label={LONG}>
          <MenuItem icon={<Plus />} trail="Ctrl+E">
            {LONG}
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Close</MenuItem>
        </MenubarMenu>
        <MenubarMenu label="Help">
          <MenuItem>About</MenuItem>
        </MenubarMenu>
      </Menubar>
    </Edge>
  )
}
