'use client'

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
import { Menubar, MenubarMenu } from '@mattymroz/tessera/components/menu/menubar'
import { useMenubarHotkeys } from '@mattymroz/tessera/lib/menubar-hotkey'
import Bold from 'lucide-react/icons/bold'
import ClipboardPaste from 'lucide-react/icons/clipboard-paste'
import Copy from 'lucide-react/icons/copy'
import FileDown from 'lucide-react/icons/file-down'
import FilePlus from 'lucide-react/icons/file-plus'
import FolderOpen from 'lucide-react/icons/folder-open'
import ImagePlus from 'lucide-react/icons/image-plus'
import Italic from 'lucide-react/icons/italic'
import Languages from 'lucide-react/icons/languages'
import MessageSquare from 'lucide-react/icons/message-square'
import Redo from 'lucide-react/icons/redo-2'
import Save from 'lucide-react/icons/save'
import Scissors from 'lucide-react/icons/scissors'
import Search from 'lucide-react/icons/search'
import Trash2 from 'lucide-react/icons/trash-2'
import Undo from 'lucide-react/icons/undo-2'
import ZoomIn from 'lucide-react/icons/zoom-in'
import ZoomOut from 'lucide-react/icons/zoom-out'
import type { ReactNode } from 'react'
import { Group } from './group'

const RECENT = Array.from({ length: 24 }, (_, index) => `Chapter ${index + 1}.msproj`)
const TOOLS = ['Brush', 'Eraser', 'Lasso', 'Pen', 'Bucket'] as const
const TOOL_OPTIONS = ['size', 'hardness', 'opacity'] as const

function AppMenus() {
  return (
    <>
      <MenubarMenu label="File">
        <MenuItem icon={<FilePlus />} trail="Ctrl+N">
          New project
        </MenuItem>
        <MenuItem icon={<FolderOpen />} trail="Ctrl+O">
          Open
        </MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Open recent</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            {RECENT.map((name) => (
              <MenuItem key={name}>{name}</MenuItem>
            ))}
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem icon={<Save />} trail="Ctrl+S">
          Save
        </MenuItem>
        <MenuItem trail="Ctrl+Shift+S">Save as</MenuItem>
        <MenuItem disabled>Save a copy to the cloud</MenuItem>
        <MenuSeparator />
        <MenuSubmenu>
          <MenuSubmenuTrigger icon={<FileDown />}>Export</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Pages as PNG</MenuItem>
            <MenuItem>Pages as WebP</MenuItem>
            <MenuItem disabled>Pages as AVIF</MenuItem>
            <MenuSeparator />
            <MenuSubmenu>
              <MenuSubmenuTrigger>Archive</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>ZIP</MenuItem>
                <MenuItem>CBZ</MenuItem>
                <MenuSubmenu>
                  <MenuSubmenuTrigger>Compression</MenuSubmenuTrigger>
                  <MenuSubmenuContent>
                    <MenuRadioGroup defaultValue="normal">
                      <MenuRadioItem value="none">None</MenuRadioItem>
                      <MenuRadioItem value="normal">Normal</MenuRadioItem>
                      <MenuRadioItem value="best">Best</MenuRadioItem>
                    </MenuRadioGroup>
                  </MenuSubmenuContent>
                </MenuSubmenu>
              </MenuSubmenuContent>
            </MenuSubmenu>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem tone="danger" icon={<Trash2 />} trail="Ctrl+W">
          Close project
        </MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit">
        <MenuItem icon={<Undo />} trail="Ctrl+Z">
          Undo
        </MenuItem>
        <MenuItem icon={<Redo />} trail="Ctrl+Y" disabled>
          Redo
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Scissors />} trail="Ctrl+X">
          Cut
        </MenuItem>
        <MenuItem icon={<Copy />} trail="Ctrl+C">
          Copy
        </MenuItem>
        <MenuItem icon={<ClipboardPaste />} trail="Ctrl+V">
          Paste
        </MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Paste special</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Text only</MenuItem>
            <MenuItem>Keep the style</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem icon={<Search />} trail="Ctrl+F">
          Find
        </MenuItem>
        <MenuItem trail="Ctrl+H">Replace</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <MenuGroup>
          <MenuGroupLabel>Layers</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked>Show bubbles</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked>Show text</MenuCheckboxItem>
          <MenuCheckboxItem>Show reading order</MenuCheckboxItem>
          <MenuCheckboxItem disabled>Show the source scan</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Fit</MenuGroupLabel>
          <MenuRadioGroup defaultValue="fit">
            <MenuRadioItem value="fit">Fit page</MenuRadioItem>
            <MenuRadioItem value="width">Fit width</MenuRadioItem>
            <MenuRadioItem value="actual">Actual size</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem icon={<ZoomIn />} trail="Ctrl++">
          Zoom in
        </MenuItem>
        <MenuItem icon={<ZoomOut />} trail="Ctrl+-">
          Zoom out
        </MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Insert">
        <MenuItem icon={<MessageSquare />}>Bubble</MenuItem>
        <MenuItem icon={<ImagePlus />}>Image</MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Sound effect</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuItem>Onomatopoeia</MenuItem>
            <MenuItem>Background text</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
      </MenubarMenu>
      <MenubarMenu label="Format">
        <MenuItem icon={<Bold />} trail="Ctrl+B">
          Bold
        </MenuItem>
        <MenuItem icon={<Italic />} trail="Ctrl+I">
          Italic
        </MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Text</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuSubmenu>
              <MenuSubmenuTrigger>Font</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuSubmenu>
                  <MenuSubmenuTrigger>Family</MenuSubmenuTrigger>
                  <MenuSubmenuContent>
                    <MenuSubmenu>
                      <MenuSubmenuTrigger>Comic</MenuSubmenuTrigger>
                      <MenuSubmenuContent>
                        <MenuRadioGroup defaultValue="wild">
                          <MenuRadioItem value="wild">Wild Words</MenuRadioItem>
                          <MenuRadioItem value="anime">Anime Ace</MenuRadioItem>
                          <MenuRadioItem value="badaboom">Badaboom</MenuRadioItem>
                        </MenuRadioGroup>
                      </MenuSubmenuContent>
                    </MenuSubmenu>
                    <MenuSubmenu>
                      <MenuSubmenuTrigger>Sans</MenuSubmenuTrigger>
                      <MenuSubmenuContent>
                        <MenuItem>Inter</MenuItem>
                        <MenuItem>Noto Sans</MenuItem>
                      </MenuSubmenuContent>
                    </MenuSubmenu>
                    <MenuItem disabled>Serif</MenuItem>
                  </MenuSubmenuContent>
                </MenuSubmenu>
                <MenuSubmenu>
                  <MenuSubmenuTrigger>Size</MenuSubmenuTrigger>
                  <MenuSubmenuContent>
                    <MenuRadioGroup defaultValue="14">
                      <MenuRadioItem value="12">12 pt</MenuRadioItem>
                      <MenuRadioItem value="14">14 pt</MenuRadioItem>
                      <MenuRadioItem value="18">18 pt</MenuRadioItem>
                    </MenuRadioGroup>
                  </MenuSubmenuContent>
                </MenuSubmenu>
                <MenuCheckboxItem defaultChecked>Outline</MenuCheckboxItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
            <MenuSubmenu>
              <MenuSubmenuTrigger>Case</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuItem>UPPER</MenuItem>
                <MenuItem>lower</MenuItem>
                <MenuItem>Title</MenuItem>
              </MenuSubmenuContent>
            </MenuSubmenu>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Bubble</MenuSubmenuTrigger>
          <MenuSubmenuContent>
            <MenuSubmenu>
              <MenuSubmenuTrigger>Shape</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuRadioGroup defaultValue="oval">
                  <MenuRadioItem value="oval">Oval</MenuRadioItem>
                  <MenuRadioItem value="cloud">Cloud</MenuRadioItem>
                  <MenuRadioItem value="burst">Burst</MenuRadioItem>
                </MenuRadioGroup>
              </MenuSubmenuContent>
            </MenuSubmenu>
            <MenuItem tone="danger">Remove the tail</MenuItem>
          </MenuSubmenuContent>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuRadioGroup defaultValue="center">
          <MenuRadioItem value="left">Align left</MenuRadioItem>
          <MenuRadioItem value="center">Align centre</MenuRadioItem>
          <MenuRadioItem value="right">Align right</MenuRadioItem>
        </MenuRadioGroup>
      </MenubarMenu>
      <MenubarMenu label="Translate">
        <MenuItem icon={<Languages />} trail="F5">
          Translate the page
        </MenuItem>
        <MenuItem trail="Shift+F5">Translate the chapter</MenuItem>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Engine</MenuGroupLabel>
          <MenuRadioGroup defaultValue="opus">
            <MenuRadioItem value="opus">Opus 5.5</MenuRadioItem>
            <MenuRadioItem value="gpt">GPT-6.1 Sol</MenuRadioItem>
            <MenuRadioItem value="local" disabled>
              Local model
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem tone="success">Approve the chapter</MenuItem>
        <MenuItem tone="warning">Mark for review</MenuItem>
        <MenuItem tone="info">Show the glossary</MenuItem>
        <MenuItem tone="accent">Publish</MenuItem>
        <MenuItem tone="danger">Discard the translation</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Tools">
        {TOOLS.map((tool) => (
          <MenuSubmenu key={tool}>
            <MenuSubmenuTrigger>{tool}</MenuSubmenuTrigger>
            <MenuSubmenuContent>
              {TOOL_OPTIONS.map((option) => (
                <MenuItem key={option}>{`${tool} ${option}`}</MenuItem>
              ))}
            </MenuSubmenuContent>
          </MenuSubmenu>
        ))}
      </MenubarMenu>
      <MenubarMenu label="Window">
        <MenuItem>Minimise</MenuItem>
        <MenuItem>Zoom</MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem defaultChecked>Panels</MenuCheckboxItem>
        <MenuCheckboxItem>Full screen</MenuCheckboxItem>
      </MenubarMenu>
      <MenubarMenu label="Help">
        <MenuItem trail="Ctrl+/">Shortcuts</MenuItem>
        <MenuItem>Documentation</MenuItem>
        <MenuSeparator />
        <MenuItem>About</MenuItem>
      </MenubarMenu>
    </>
  )
}

function Resizable({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-label={label} role="group" data-recipe="surface" data-level="sunken" data-surface="" data-inset="inset" className="flex resize-x overflow-hidden">
      {children}
    </div>
  )
}

function MainMenubar() {
  useMenubarHotkeys()
  return (
    <Menubar moreLabel="More menus">
      <AppMenus />
    </Menubar>
  )
}

export function MenubarSection() {
  return (
    <section aria-labelledby="menubar-title" className="flex flex-col gap-group">
      <h2 id="menubar-title">Menubar</h2>
      <Group title="Main menubar with the hotkeys Alt, F10; drag the corner to narrow it">
        <Resizable label="Bar A">
          <MainMenubar />
        </Resizable>
      </Group>
      <Group title="Accent">
        <Resizable label="Accent A">
          <Menubar moreLabel="More menus" variant="accent">
            <AppMenus />
          </Menubar>
        </Resizable>
      </Group>
    </section>
  )
}
