'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Menu, MenuCheckboxItem, MenuContent, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { THEME_CONFIG, type Axis, type Choices } from '@mattymroz/tessera/lib/theme'
import { useTheme } from '@mattymroz/tessera/lib/use-theme'
import { mangashift } from '@mattymroz/tessera/themes/mangashift'
import Activity from 'lucide-react/icons/activity'
import Contrast from 'lucide-react/icons/contrast'
import Layers from 'lucide-react/icons/layers'
import Monitor from 'lucide-react/icons/monitor'
import Palette from 'lucide-react/icons/palette'
import Rows3 from 'lucide-react/icons/rows-3'
import Ruler from 'lucide-react/icons/ruler'
import Sparkles from 'lucide-react/icons/sparkles'
import Spline from 'lucide-react/icons/spline'
import SquareRoundCorner from 'lucide-react/icons/square-round-corner'
import SunMoon from 'lucide-react/icons/sun-moon'
import Type from 'lucide-react/icons/type'
import type { ReactNode } from 'react'
import { MotionLab } from './motion-lab'

const OPTIONS: Readonly<Record<Axis, readonly string[]>> = THEME_CONFIG.axes

const AXIS_ICONS: Readonly<Record<Axis, ReactNode>> = {
  mode: <SunMoon />,
  accent: <Palette />,
  neutral: <Contrast />,
  corners: <SquareRoundCorner />,
  curve: <Spline />,
  density: <Rows3 />,
  size: <Ruler />,
  motion: <Activity />,
  neon: <Sparkles />,
  material: <Layers />,
  platform: <Monitor />,
  typeset: <Type />,
}

const ZOOMS = ['1', '2', '4'] as const

function zoomKeepingCentre(value: string): void {
  const main = document.getElementById('lab-main')
  if (!main) return
  const frame = main.getBoundingClientRect()
  const anchor = document.elementFromPoint(frame.left + frame.width / 2, window.innerHeight / 2) ?? main
  const before = anchor.getBoundingClientRect()
  const zoom = Number(main.style.getPropertyValue('zoom') || 1)
  main.dataset.width ??= String(frame.width / zoom)
  main.style.setProperty('zoom', value)
  main.style.setProperty('width', value === '1' ? '' : `${main.dataset.width}px`)
  main.style.setProperty('flex-shrink', value === '1' ? '' : '0')
  const after = anchor.getBoundingClientRect()
  window.scrollBy(after.left - before.left, after.top - before.top)
}

function isAxis(name: string): name is Axis {
  return Object.hasOwn(OPTIONS, name)
}

function isChoice<A extends Axis>(axis: A, value: string): value is Choices[A] {
  return OPTIONS[axis].includes(value)
}

const MENU_AXES: readonly Axis[] = Object.keys(OPTIONS).filter(isAxis)

export function Panel() {
  const { choices, setChoice, reset } = useTheme(mangashift)

  return (
    <aside aria-label="Theme" data-size="sm" className="flex flex-col gap-group md:sticky md:top-card md:z-10 md:w-44 md:flex-none">
      <ToggleGroup
        aria-label="zoom"
        defaultValue="1"
        onValueChange={zoomKeepingCentre}
      >
        {ZOOMS.map((zoom) => (
          <ToggleGroupItem key={zoom} value={zoom}>
            {`${zoom}×`}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {MENU_AXES.map((axis) => (
        <div key={axis} className="flex flex-col gap-inset">
          <span id={`axis-${axis}`}>{axis}</span>
          <Menu>
            <MenuTrigger variant="soft" icon={AXIS_ICONS[axis]} aria-labelledby={`axis-${axis} axis-${axis}-value`}>
              <span id={`axis-${axis}-value`}>{choices[axis]}</span>
            </MenuTrigger>
            <MenuContent width="trigger">
              {OPTIONS[axis].map((option) => (
                <MenuCheckboxItem
                  key={option}
                  checked={choices[axis] === option}
                  onCheckedChange={() => {
                    if (isChoice(axis, option)) setChoice(axis, option)
                  }}
                  closeOnClick
                >
                  {option}
                </MenuCheckboxItem>
              ))}
            </MenuContent>
          </Menu>
        </div>
      ))}
      <Button variant="outline" onClick={reset}>
        Reset
      </Button>
      <MotionLab />
    </aside>
  )
}
