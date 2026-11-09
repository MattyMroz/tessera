import { ContextMenu, ContextMenuArea, ContextMenuContent } from '@mattymroz/tessera/components/menu/context-menu'
import { MenuItem, MenuSeparator } from '@mattymroz/tessera/components/menu/menu'
import Plus from 'lucide-react/icons/plus'
import { Edge, LONG } from '../edge'

export function ContextMenuEdge() {
  return (
    <Edge data-edge-component="context-menu" title="Context menu">
      <ContextMenu>
        <ContextMenuArea>
          <span data-recipe="surface" data-level="sunken" data-surface="" data-inset="card">
            {LONG}
          </span>
        </ContextMenuArea>
        <ContextMenuContent>
          <MenuItem icon={<Plus />} trail="Ctrl+E">
            {LONG}
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Close</MenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Edge>
  )
}
