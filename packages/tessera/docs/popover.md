# Popover

Popup anchored to a button, built on Base UI `Popover`. Import: `@mattymroz/tessera/components/popover/popover`.

## Parts

| Part                 | Base UI part                      | Notes                                                                                                                                              |
| -------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Popover`            | `Popover.Root`                    | state: `open`, `defaultOpen`, `onOpenChange`, `modal`                                                                                              |
| `PopoverTrigger`     | `Popover.Trigger`                 | renders a Tessera `Button`; takes `ButtonProps`                                                                                                    |
| `PopoverPopup`       | `Portal` → `Positioner` → `Popup` | the host of the slots below; takes `Popover.Popup` props (`initialFocus`, `finalFocus`, native props)                                              |
| `PopoverTitle`       | `Popover.Title`                   | slot `title`: `text` recipe, variant `title`                                                                                                       |
| `PopoverDescription` | `Popover.Description`             | slot `description`: `text` recipe, variant `description`                                                                                           |
| `PopoverActions`     | —                                 | slot `actions`: `<div data-slot="actions">`, the buttons of the popover aligned to the end, the same rule as `DialogActions` and `CardActions`     |
| `PopoverClose`       | `Popover.Close`                   | renders a Tessera `Button`; takes `ButtonProps`; a control, not a slot                                                                             |
| `PopoverDismiss`     | `Popover.Close`                   | slot `close`: icon-only `Button` with the lucide `X` in the top-end corner, concentric with the corner like `DialogDismiss`; `aria-label` required |

No part takes `className`, `style` or the Base UI `render`: the parent lays the popover content out. `PopoverTrigger` and `PopoverPopup` outside `Popover` throw while rendering: `Tessera: <PopoverTrigger> is a part of <Popover>: place it inside <Popover>.` (`useHost` of `lib/slot.ts`).

## Slots

The same model as [Dialog](dialog.md#slots): `PopoverPopup` takes `PopoverTitle`, `PopoverDescription`, any content, `PopoverActions`, `PopoverDismiss` in this order; a part outside `PopoverPopup` or inside another part throws while rendering, and slots out of order throw when the popup mounts. The consumer writes no style: a row of buttons is `PopoverActions`, not a `<div>` with layout classes.

## Overflow

- Title, description and text: wrap and break a word longer than the line anywhere.
- Labels of the buttons in `PopoverActions`: one line with an ellipsis.
- The popup: never wider or taller than the room in the window; taller content scrolls inside it without a sideways scroll.

## Rendered attributes

The popup: `data-recipe="surface" data-level="overlay" data-variant="popover" data-surface data-inset="group"`. It lays its children out in a column with the `group` gap and keeps the `inset` gap from the trigger on the side it opens to. The material follows the theme, so `translucent` blurs the popup. The popup fits the window: its height and width stop at the room Base UI measures (`--available-height` minus the `inset` gap, `--available-width`, also minus the `inset` gap when the popup opens to the left or right), and longer content scrolls without a native scrollbar and without a gutter. The padding is `--ts-shape-inset` (the `group` gap plus a quarter of the round radius) on all four sides, measured from the trimmed first and last line of text.

## Behaviour

- No entry animation; the popup appears in one frame.
- Positioned below the trigger, centred, and flipped by Base UI when space runs out. The Positioner carries no appearance.
- A popup in a portal is always the first surface level, so its radius does not depend on the surfaces around the trigger.
- The popup takes the subtree axes of its trigger (`size`, `density`, `corners`, `curve`, `motion` from the nearest ancestors below `<html>`, `lib/scope.ts`): `Popover` keeps a fixed handle to the node of its trigger and the popup copies the axes when it mounts, however it opens.
- A closed popover renders no DOM and keeps no position listeners.

## Example

```tsx
import { Popover, PopoverActions, PopoverClose, PopoverDescription, PopoverPopup, PopoverTitle, PopoverTrigger } from '@mattymroz/tessera/components/popover/popover'

<Popover>
  <PopoverTrigger variant="outline">Share</PopoverTrigger>
  <PopoverPopup>
    <PopoverTitle>Share project</PopoverTitle>
    <PopoverDescription>Anyone with the link can view.</PopoverDescription>
    <PopoverActions>
      <PopoverClose variant="solid">Copy link</PopoverClose>
    </PopoverActions>
  </PopoverPopup>
</Popover>
```
