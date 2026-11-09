import { ContextMenu, ContextMenuArea, ContextMenuContent } from '@mattymroz/tessera/components/menu/context-menu'
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'
import Copy from 'lucide-react/icons/copy'
import Scissors from 'lucide-react/icons/scissors'
import Trash2 from 'lucide-react/icons/trash-2'
import { Group } from './group'

export function ContextMenuSection() {
  return (
    <section aria-labelledby="context-menu-title" className="flex flex-col gap-group">
      <h2 id="context-menu-title">Context menu</h2>
      <Group title="Right-click the area">
        <ContextMenu>
          <ContextMenuArea>
            <div data-recipe="surface" data-level="sunken" data-surface="" data-inset="card" className="flex items-center justify-center">
              Right-click this page
            </div>
          </ContextMenuArea>
          <ContextMenuContent>
            <MenuItem icon={<Scissors />} trail="Ctrl+X">
              Cut
            </MenuItem>
            <MenuItem icon={<Copy />} trail="Ctrl+C">
              Copy
            </MenuItem>
            <MenuItem disabled trail="Ctrl+V">
              Paste
            </MenuItem>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>Page</MenuGroupLabel>
              <MenuCheckboxItem defaultChecked>Show bubbles</MenuCheckboxItem>
              <MenuRadioGroup defaultValue="fit">
                <MenuRadioItem value="fit">Fit page</MenuRadioItem>
                <MenuRadioItem value="width">Fit width</MenuRadioItem>
              </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuSubmenu>
              <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>Page as PNG</MenuItem>
                <MenuItem>Page as WebP</MenuItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
            <MenuSeparator />
            <MenuItem tone="danger" icon={<Trash2 />}>
              Delete page
            </MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Group>
    </section>
  )
}
