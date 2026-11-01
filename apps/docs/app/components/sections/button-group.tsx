'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { ButtonGroup } from '@mattymroz/tessera/components/button/button-group'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import ChevronDown from 'lucide-react/icons/chevron-down'
import Crop from 'lucide-react/icons/crop'
import Redo from 'lucide-react/icons/redo-2'
import Undo from 'lucide-react/icons/undo-2'
import X from 'lucide-react/icons/x'
import { useRef } from 'react'

function History({ label }: { label: string }) {
  return (
    <ButtonGroup variant="track" aria-label={label}>
      <Button aria-label="Step back" icon={<Undo />} />
      <Button aria-label="Step forward" icon={<Redo />} />
      <Button icon={<Crop />}>Crop</Button>
    </ButtonGroup>
  )
}

function SplitExport() {
  const group = useRef<HTMLDivElement>(null)
  return (
    <ButtonGroup variant="joined" aria-label="Export" ref={group}>
      <Button variant="solid">Export</Button>
      <Menu>
        <MenuTrigger variant="solid" aria-label="More export options" icon={<ChevronDown />} />
        <MenuContent anchor={group} width="trigger">
          <MenuItem>Pages as WebP</MenuItem>
          <MenuItem>Pages as PNG</MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  )
}

function Filter() {
  return (
    <ButtonGroup variant="joined" aria-label="Filter">
      <Button variant="raised">Filter · 2</Button>
      <Button variant="raised" aria-label="Clear the filter" icon={<X />} />
    </ButtonGroup>
  )
}

export function ButtonGroupSection() {
  return (
    <section aria-labelledby="button-group-title" className="flex flex-col gap-group">
      <h2 id="button-group-title">Button group</h2>
      <div className="flex flex-wrap items-center gap-inset">
        <History label="History" />
        <SplitExport />
        <Filter />
        <ButtonGroup variant="joined" aria-label="Pages">
          <Button variant="soft">First</Button>
          <Button variant="soft">Previous</Button>
          <Button variant="soft">Next</Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-wrap items-end gap-inset">
        {THEME_CONFIG.axes.size.map((size) => (
          <ButtonGroup key={size} variant="joined" size={size} aria-label={`Joined ${size}`}>
            <Button variant="outline">{size}</Button>
            <Button variant="outline" aria-label={`More ${size}`} icon={<ChevronDown />} />
          </ButtonGroup>
        ))}
      </div>
      <div className="flex flex-col items-start gap-inset">
        <Button variant="outline">Lone outline</Button>
        <ButtonGroup variant="joined" aria-label="Joined outline">
          <Button variant="outline">Joined outline</Button>
          <Button variant="outline" aria-label="More outline" icon={<ChevronDown />} />
        </ButtonGroup>
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
        <History label="History in a card" />
        <Filter />
      </div>
    </section>
  )
}
