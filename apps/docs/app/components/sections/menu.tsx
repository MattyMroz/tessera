import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'
import Trash2 from 'lucide-react/icons/trash-2'

function ProjectMenu({ label }: { label: string }) {
  return (
    <Menu>
      <MenuTrigger variant="soft">{label}</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Project</MenuGroupLabel>
          <MenuItem trail="Ctrl+N">New chapter</MenuItem>
          <MenuItem trail="Ctrl+O">Open</MenuItem>
          <MenuItem disabled>Revert</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>View</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked>Show bubbles</MenuCheckboxItem>
          <MenuCheckboxItem>Show reading order</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuSubmenu>
          <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Pages as WebP</MenuItem>
            <MenuItem>Pages as PNG</MenuItem>
            <MenuItem>Pages as PDF</MenuItem>
            <MenuItem>Chapter as CBZ</MenuItem>
            <MenuSubmenu>
              <MenuSubmenuTrigger>Video</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>MP4</MenuItem>
                <MenuItem>WebM</MenuItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Share</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Copy link</MenuItem>
            <MenuItem>Invite people</MenuItem>
            <MenuItem>Publish</MenuItem>
            <MenuItem>Embed</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem tone="danger" icon={<Trash2 />}>
          Delete project
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export function MenuSection() {
  return (
    <section aria-labelledby="menu-title" className="flex flex-col gap-group">
      <h2 id="menu-title">Menu</h2>
      <div className="flex flex-wrap items-center gap-inset">
        <ProjectMenu label="Project" />
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
        <ProjectMenu label="From a card" />
      </div>
    </section>
  )
}
