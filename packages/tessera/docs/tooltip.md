# Tooltip

Short visual label for a control on hover and keyboard focus. Tessera's own element (`lib/tooltip.ts`): the trigger props come from Base UI `useRender`, the popup is a `popover="manual"` element in the top layer styled by the `surface` recipe. Import: `@mattymroz/tessera/components/tooltip/tooltip`.

## Parts

| Part         | Props                                                                                                                                                                                    | Notes                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tooltip`    | `content: ReactNode`, `side?: 'top' \| 'bottom' \| 'left' \| 'right'` (default `'top'`), `arrow?: boolean` (default `true`), `children: ReactElement`                                    | the child is the trigger and must accept a `ref` and spread props (a native element or `Button`); outside a bar it owns its popup                                                     |
| `TooltipBar` | `orientation?: 'horizontal' \| 'vertical'` (default `'horizontal'`), `side?` (default `'top'` for a horizontal bar, `'right'` for a vertical one), `arrow?` (default `true`), `children` | renders the bar group `div` with `data-component="tooltip-bar"` (flex row or column, gap `--ts-space-inset`); one popup for every `Tooltip` inside; `side` and `arrow` of the bar win |

The trigger keeps its own accessible name: give icon-only triggers `aria-label`. While its tooltip is shown the trigger has `aria-describedby` pointing at the popup, which has `role="tooltip"`. No part takes `className` or `style`.

## Rendered attributes

Popup: `popover="manual"`, `role="tooltip"`, `data-recipe="surface"`, `data-surface`, `data-inset="inset"`, `data-level="overlay"`, `data-variant="tooltip"`, `data-material="solid"`, `data-side`, `data-open` while shown, `data-snap` and `data-instant` for one frame while it is placed; the instance values `--ts-i-tip-x`, `--ts-i-tip-y`, `--ts-i-tip-width`, `--ts-i-tip-arrow`, and `--ts-i-tip-room` and `--ts-i-tip-squish` on a label. Inside: `[data-slot='arrow']` and `[data-slot='clip']` with one `[data-slot='label']` (two while the text changes: the old one with `data-leaving`, the new one with `data-entering` until it is placed; a label carries `data-squish` for the one frame its squeeze is set). Trigger: `data-tooltip-trigger`. A popup that was never shown or has closed renders no DOM.

## Behaviour

- The first tooltip opens 400 ms after the pointer enters its trigger (`TOOLTIP_OPEN_DELAY`). It fades in for `--ts-motion-duration-hover-out` and slides `--ts-motion-appear-shift` (4 px) away from its trigger for `--ts-motion-duration-follow` (owner, 2026-11-08).
- Leaving a lone trigger, or a bar, closes the tooltip after 100 ms (`TOOLTIP_CLOSE_DELAY`); it fades out for `--ts-motion-duration-press-in`.
- A tooltip opened while another one is shown, or within 400 ms after one closed (`TOOLTIP_GROUP_GRACE`), opens at once in place without the entrance. Lone tooltips never fly between each other.
- In a bar one popup moves to the next trigger: it slides (`translate`) and changes its width (`width`) for `--ts-motion-duration-follow` on `--ts-motion-ease-hover`, the time and the curve of the hover pill it rides with, and a new target during the move takes over from where the popup is. The old text fades out and blurs while the new one fades in and sharpens (`--ts-motion-swap-blur`) over the same time, and in every frame both are as wide as the popup: the new one starts squeezed (`scale` on the inline axis, never above 1, from `--ts-i-tip-squish`) to the current width and spreads with the popup, the old one squeezes to the new width. Above and below the trigger the text stands and squeezes in the middle, on the right of it from its left, on the left from its right. A label that is still coming in takes a new text in place, so a fast sweep never leaves the popup empty. At rest the label keeps `--ts-motion-press-rest`, so the text does not snap to another pixel when the squeeze ends. A text longer than the narrow measure stays on one line and ends with an ellipsis. The width and the blur are named exceptions to compositor-only motion (`test/guards/css-layers.ts`).
- In a bar the popup stays on its last trigger as long as the pointer is inside the bar group, gaps included, without a time limit (the sliding standard, `docs/plans/e3-sliding.md`).
- The keyboard focus (`:focus-visible`) opens the tooltip at once; Escape and a blur close it, except a blur to another trigger of the same bar, where the popup moves on like for the pointer. A press on the trigger, Enter and Space close it; it opens again only after the pointer or the focus leaves the trigger and comes back. Touch pointers open nothing.
- Scrolling the page or any pane closes the tooltip.
- The popup opens on its side and flips to the opposite side when there is no room there: above the trigger, below it without room above; a vertical bar on the right, on the left without room on the right. Along the edge it stays inside the window; the arrow keeps pointing at the middle of the trigger.
- The colours are inverted against the mode (`--ts-color-tooltip`, `--ts-color-tooltip-label`).
- The arrow is a square of `--ts-size-arrow` turned by `--ts-shape-arrow-turn` with the corner `--ts-shape-arrow`, in the colour of the popup. The popup sits `--ts-space-inset` away from its trigger, `--ts-size-arrow-reach` more with the arrow.
- The popup follows the `size` axis like a control: text in the size step, one line as tall as a control, the side padding, radius and corner shape of a control; a long text wraps at `--ts-type-measure-narrow`.
- The popup takes the subtree axes of its trigger (`size`, `density`, `corners`, `curve`, `motion`, `lib/scope.ts`), copied every time it is placed.
- With the motion `off` or under the system reduced motion nothing slides or moves; under the reduced motion the fade stays.
- The popup does not take the pointer (`pointer-events: none`): moving onto it counts as leaving the trigger.

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { Tooltip, TooltipBar } from '@mattymroz/tessera/components/tooltip/tooltip'
import Redo2 from 'lucide-react/icons/redo-2'
import Undo2 from 'lucide-react/icons/undo-2'

<TooltipBar>
  <Tooltip content="Undo">
    <Button aria-label="Undo" icon={<Undo2 />} />
  </Tooltip>
  <Tooltip content="Redo">
    <Button aria-label="Redo" icon={<Redo2 />} />
  </Tooltip>
</TooltipBar>
```
