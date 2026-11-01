# Tooltip

Short visual label for a control on hover and keyboard focus: Base UI `Tooltip` without `Viewport`, popup styled by the `surface` recipe. Import: `@mattymroz/tessera/components/tooltip/tooltip`.

## Parts

| Part              | Props                                                                                                             | Notes                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `TooltipProvider` | `children`                                                                                                        | group: after the first tooltip (600 ms) the next one in the group opens at once while the previous one closed less than 400 ms ago |
| `Tooltip`         | `content: ReactNode`, `side?: 'top' \| 'bottom' \| 'left' \| 'right'` (default `'top'`), `children: ReactElement` | the child is the trigger and must accept a `ref` and spread props (a native element or `Button`)                                   |
| `TooltipBar`      | `side?` (default `'top'`), `children`                                                                             | one popup for every `Tooltip` inside (Base UI `createHandle`); `side` of the bar wins over `side` of its tooltips                  |

The trigger keeps its own accessible name: give icon-only triggers `aria-label`. Base UI does not set `role="tooltip"` or `aria-describedby`. No part takes `className` or `style`: the parent lays the triggers out.

## Rendered attributes

Popup: `data-recipe="surface"`, `data-surface`, `data-inset="inset"`, `data-level="overlay"`, `data-variant="tooltip"`, `data-material="solid"`, plus Base UI `data-side`, `data-align`, `data-open`/`data-closed`, `data-instant`. Trigger: `data-popup-open` while its tooltip is open. A closed tooltip renders no DOM.

## Behaviour

- No entry animation (spec W16).
- The popup sits `--ts-space-inset` away from its trigger on the side it opens to.
- A long text wraps at `--ts-type-measure-narrow` (or the room left in the window, `--available-width`, when that is less) and breaks a word longer than the line anywhere (`overflow-wrap: anywhere` of the `surface` recipe); the tooltip lies above every other popup (`--ts-depth-layer-tooltip`).
- Moving between triggers of one bar flies the popup to the new trigger by `transform` on the popup (`lib/popup-flight.ts`, one flight per `TooltipBar`, time and curve from the `motion` engine, none with motion `off`). An open popup that stays on its trigger follows it through scrolling and resizing without a flight.
- Within a bar the flight starts only while the previous popup is open or closed at most 400 ms ago (`TOOLTIP_GROUP_GRACE` in `lib/tooltip-group.ts`, also the `TooltipProvider` timeout). A `Tooltip` outside a bar never flies: it opens in place, also while another tooltip is still open; the `TooltipProvider` group only opens it at once.
- The popup takes the subtree axes of its trigger (`size`, `density`, `corners`, `curve`, `motion` from the nearest ancestors below `<html>`, `lib/scope.ts`), so a tooltip of an `xs` bar is `xs`. Every trigger registers its node in its own scope anchor and hands it to the popup with its payload; the one popup of a bar copies the axes again whenever it moves to another trigger.

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { Tooltip, TooltipBar, TooltipProvider } from '@mattymroz/tessera/components/tooltip/tooltip'
import Redo2 from 'lucide-react/icons/redo-2'
import Undo2 from 'lucide-react/icons/undo-2'

<TooltipProvider>
  <TooltipBar side="bottom">
    <Tooltip content="Undo">
      <Button aria-label="Undo" icon={<Undo2 />} />
    </Tooltip>
    <Tooltip content="Redo">
      <Button aria-label="Redo" icon={<Redo2 />} />
    </Tooltip>
  </TooltipBar>
</TooltipProvider>
```
