'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'
import { Tooltip, TooltipBar } from '@mattymroz/tessera/components/tooltip/tooltip'
import { useState } from 'react'

function ScopeMenuContent() {
  return (
    <MenuContent>
      <MenuItem>Open</MenuItem>
      <MenuItem>Duplicate</MenuItem>
      <MenuSubmenu>
        <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
        <MenuSubmenuContent>
          <MenuItem>Pages as WebP</MenuItem>
          <MenuItem>Pages as PNG</MenuItem>
        </MenuSubmenuContent>
      </MenuSubmenu>
    </MenuContent>
  )
}

export function ScopeSample() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [submenu, setSubmenu] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-group">
      <Button variant="outline" onClick={() => setMounted(true)}>
        Mount an open menu
      </Button>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the controlled menu
      </Button>
      <Button variant="outline" onClick={() => setSubmenu(true)}>
        Mount a menu with an open submenu
      </Button>
      {submenu ? (
        <Menu defaultOpen>
          <MenuTrigger variant="soft">Mounted with a submenu</MenuTrigger>
          <MenuContent>
            <MenuItem>Open</MenuItem>
            <MenuSubmenu defaultOpen>
              <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>Pages as WebP</MenuItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
            <MenuItem>Close</MenuItem>
          </MenuContent>
        </Menu>
      ) : null}
      <div data-size="xs" data-corners="none" className="flex flex-wrap items-center gap-inset">
        <Menu>
          <MenuTrigger variant="soft">Clicked</MenuTrigger>
          <ScopeMenuContent />
        </Menu>
        <Menu open={open} onOpenChange={setOpen}>
          <MenuTrigger variant="soft">Controlled</MenuTrigger>
          <ScopeMenuContent />
        </Menu>
        {mounted ? (
          <Menu defaultOpen>
            <MenuTrigger variant="soft">Mounted open</MenuTrigger>
            <ScopeMenuContent />
          </Menu>
        ) : null}
        <TooltipBar side="bottom">
          <Tooltip content="Small tip">
            <Button variant="ghost">Small</Button>
          </Tooltip>
          <div data-size="xl" className="flex items-center">
            <Tooltip content="Large tip">
              <Button variant="ghost">Large</Button>
            </Tooltip>
          </div>
        </TooltipBar>
      </div>
    </div>
  )
}
