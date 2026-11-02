# ButtonGroup

A row of buttons in one group (`role="group"`), in two forms: separate buttons on a shared track, or segments joined into one shape. Import: `@mattymroz/tessera/components/button/button-group`.

## Props

| Prop         | Type                                   | Default   | Notes                                                                                                                                  |
| ------------ | -------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`    | `'track' \| 'joined'`                  | required  | `track`: separate buttons on a sunken track, like a `ToggleGroup`; `joined`: segments glued into one shape, without lines between them |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | sets `data-size` on the group; set the size here, not on the buttons, so the radius of the group fits the height of its segments       |
| `aria-label` | `string`                               | required  | name of the group                                                                                                                      |
| `ref`        | `Ref<HTMLDivElement>`                  | —         | the group element, e.g. the anchor of the menu of a split button                                                                       |
| `children`   | `ReactNode`                            | required  | `Button` and `MenuTrigger` elements                                                                                                    |

## Rendered attributes

- `track`: `<div role="group" data-component="button-group" data-recipe="surface" data-level="sunken" data-surface="track" data-inset="inset">`, the same track as `ToggleGroup`: the gap to the buttons follows the size, not the density (`--ts-size-wrap` plus the stroke), and the radius of the track follows the radius of the control plus that gap, so its sides run along the buttons for every size, `corners` and `curve`. Use `ghost` buttons (the default variant); one primary action may stay `solid`.
- `joined`: `<div role="group" data-component="button-group" data-recipe="surface" data-surface="joined">`. The `shape` engine gives the group the radius of a control (concentric with its parent) and its segments the radius 0; the `surface` recipe clips the segments to the group (`overflow: clip`, also along `corner-shape` in Chromium), paints no background and no padding, and paints the shadow of a `raised` segment or the neon glow of a `solid` accent segment on the group, while the segments paint none, so there is no line where two segments meet. With `outline` segments the group draws one outline along its own rounded edge (a `::after` ring over the segments, in `--ts-color-control-border`) and the segments draw no border of their own, so the corners stay continuous and nothing divides the segments; the ring keeps the neutral border color also for an `outline` segment with a tone. The focus ring of a segment is drawn inside it (the inset offset of the `focus` recipe), so the clip does not cut it.
- The group adds one DOM node; the buttons keep theirs.

## Behaviour

- Every button is its own Tab stop, as in v2; arrow keys do nothing in a group (arrows come with `role="toolbar"` in E4). Text and separators are not part of a group (no separator, W9).
- Segments take the width of their content; no segment is narrower than it is tall, and an icon-only segment is square.
- The group never breaks into a second line. When the room runs out, the buttons narrow down together to their height and cut their labels with an ellipsis (`title-when-cut` gives the full name). A group that must keep its labels goes into a `ScrollArea` of the consumer (E3, round E); the group does not scroll by itself.
- Horizontal only: there is no vertical consumer (the vertical tool bar of the workbench is a `ToggleGroup`).
- In forced colors the transparent border of each segment of a `joined` group is forced into a visible line by the browser; this is the system mode, not a look of Tessera.

## Split button

A split button is a `joined` group with an action `Button` and a `MenuTrigger` holding only the arrow; the menu anchors to the whole group through `anchor` of `MenuContent`, so it opens at the start edge of the group and `width="trigger"` makes it as wide as the group.

```tsx
'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { ButtonGroup } from '@mattymroz/tessera/components/button/button-group'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import ChevronDown from 'lucide-react/icons/chevron-down'
import { useRef } from 'react'

function ExportButton() {
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
```

## Overflow

The group never breaks into a second line and never grows wider than its parent: its buttons narrow down together to their height and end their labels with an ellipsis. A group that must keep whole labels goes into a `ScrollArea` of the consumer (F20).

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { ButtonGroup } from '@mattymroz/tessera/components/button/button-group'
import Redo from 'lucide-react/icons/redo-2'
import Undo from 'lucide-react/icons/undo-2'

<ButtonGroup variant="track" aria-label="History">
  <Button aria-label="Undo" icon={<Undo />} />
  <Button aria-label="Redo" icon={<Redo />} />
</ButtonGroup>
```
