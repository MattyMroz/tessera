# Tooltip

Short visual label for a control on hover and keyboard focus: Base UI `Tooltip` without `Viewport`, popup styled by the `surface` recipe. Import: `@mattymroz/tessera/components/tooltip/tooltip`.

## Parts

| Part              | Props                                                                                                                                                                                    | Notes                                                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TooltipProvider` | `children`                                                                                                                                                                               | group: after the first tooltip (400 ms) the next one in the group opens at once while the previous one closed less than 400 ms ago                                                                                                        |
| `Tooltip`         | `content: ReactNode`, `side?: 'top' \| 'bottom' \| 'left' \| 'right'` (default `'top'`), `arrow?: boolean` (default `true`), `children: ReactElement`                                    | the child is the trigger and must accept a `ref` and spread props (a native element or `Button`)                                                                                                                                          |
| `TooltipBar`      | `orientation?: 'horizontal' \| 'vertical'` (default `'horizontal'`), `side?` (default `'top'` for a horizontal bar, `'right'` for a vertical one), `arrow?` (default `true`), `children` | renders the bar group `div` with `data-component="tooltip-bar"` (flex row or column, gap `--ts-space-inset`); one popup for every `Tooltip` inside (Base UI `createHandle`); `side` and `arrow` of the bar win over those of its tooltips |

The trigger keeps its own accessible name: give icon-only triggers `aria-label`. Base UI does not set `role="tooltip"` or `aria-describedby`. No part takes `className` or `style`: `TooltipBar` lays out its triggers, the parent lays out the rest.

## Rendered attributes

Popup: `data-recipe="surface"`, `data-surface`, `data-inset="inset"`, `data-level="overlay"`, `data-variant="tooltip"`, `data-material="solid"`, plus Base UI `data-side`, `data-align`, `data-open`/`data-closed`, `data-instant`. Trigger: `data-popup-open` while its tooltip is open. A closed tooltip renders no DOM.

## Behaviour

- No entry animation (spec W16).
- The colours are inverted against the mode: a dark tooltip with a light label in the light mode, a light one with a dark label in the dark mode (`--ts-color-tooltip`, `--ts-color-tooltip-label`).
- The popup opens on its side and flips to the opposite side when there is no room there (Base UI collision avoidance): above the trigger, below it without room above; a vertical bar on the right, on the left without room on the right.
- The arrow (Base UI `Tooltip.Arrow`, `data-slot="arrow"`) is a square of `--ts-size-arrow` (a quarter of the control height) turned by `--ts-shape-arrow-turn` with the corner `--ts-shape-arrow`, in the colour of the popup, centred on the edge that faces the trigger and on the middle of the trigger. The popup sits `--ts-space-inset` away from its trigger; with the arrow the arrow tip sits that far away (`--ts-size-arrow-reach` more for the popup).
- The popup is a label beside a control, so it follows the `size` axis like a control (the `tooltip` variant of the `surface` recipe): the text in the size step (`--ts-size-text`, `--ts-size-leading`), one line as tall as a control of that step (block padding `--ts-size-cap-inset`: half the step minus half the cap height, with the line trimmed to the cap height and the baseline), the side padding of a control (`--ts-shape-control-side`) and the radius and corner shape of a control (`--ts-shape-control`, `--ts-shape-control-corner`), so a tooltip at `full` corners is a capsule. A key or a badge inside the text keeps the size it is given; give it a smaller step (`size="xs"`), since without a size it would be as tall as the tooltip.
- A long text wraps at `--ts-type-measure-narrow` (or the room left in the window, `--available-width`, when that is less) and breaks a word longer than the line anywhere (`overflow-wrap: anywhere` of the `surface` recipe); the tooltip lies above every other popup (`--ts-depth-layer-tooltip`).
- Moving between triggers of one bar flies the popup to the new trigger by `transform` on the popup (`lib/popup-flight.ts`, one flight per `TooltipBar`, `--ts-motion-duration-follow` on `--ts-motion-ease-hover` of the `motion` engine, none with the motion `off` or under the system reduced motion). An open popup that stays on its trigger follows it through scrolling and resizing without a flight.
- Within a bar the flight starts only while the previous popup is open or closed at most 400 ms ago (`TOOLTIP_GROUP_GRACE` in `lib/tooltip-group.ts`, also the `TooltipProvider` timeout). A `Tooltip` outside a bar never flies: it opens in place, also while another tooltip is still open; the `TooltipProvider` group only opens it at once.
- A tooltip opens 400 ms after the pointer rests on its trigger (`TOOLTIP_OPEN_DELAY`, Base UI `delay` of every trigger, the delay of the MangaShift desktop).
- Leaving a trigger closes its tooltip after 100 ms (`TOOLTIP_CLOSE_DELAY`, Base UI `closeDelay` of every trigger). The pointer that reaches the next trigger within that time cancels the close, so crossing the gap between two lone triggers never shows a frame without a tooltip: the `TooltipProvider` group opens the next one and closes the previous one at once.
- In a bar the popup stays on its last trigger as long as the pointer is inside the bar group, gaps included, without a time limit (the sliding standard, `docs/plans/e3-sliding.md`): the bar cancels the hover close of Base UI while the group is hovered and closes the popup 100 ms after the pointer leaves the group (not towards the popup, not while a trigger of the bar holds the keyboard focus).
- The flight starts where the previous popup stands now: its rectangle is kept with the window scroll it was measured at and moved by the scroll since, so a tooltip opened right after the page scrolls opens in place.
- A press on the trigger closes the tooltip (Base UI `closeOnClick`); it opens again only after the pointer leaves the trigger and comes back. A neighbour reached within 400 ms of the press opens at once (the `TooltipProvider` group).
- The popup takes the subtree axes of its trigger (`size`, `density`, `corners`, `curve`, `motion` from the nearest ancestors below `<html>`, `lib/scope.ts`), so a tooltip of an `xs` bar is `xs`. Every trigger registers its node in its own scope anchor and hands it to the popup with its payload; the one popup of a bar copies the axes again whenever it moves to another trigger.

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { Tooltip, TooltipBar, TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import Redo2 from 'lucide-react/icons/redo-2'
import Undo2 from 'lucide-react/icons/undo-2'

<TooltipProvider>
  <TooltipBar>
    <Tooltip content="Undo">
      <Button aria-label="Undo" icon={<Undo2 />} />
    </Tooltip>
    <Tooltip content="Redo">
      <Button aria-label="Redo" icon={<Redo2 />} />
    </Tooltip>
  </TooltipBar>
</TooltipProvider>
```
