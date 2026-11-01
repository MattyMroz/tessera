# Dialog

Modal window over a scrim, built on Base UI `Dialog`. Import: `@mattymroz/tessera/components/dialog/dialog`. A question that needs an answer ("Delete project?") is an [Alert Dialog](alert-dialog.md): `confirm()` or `AlertDialog` with the parts below.

## Parts

| Part                | Base UI part                    | Notes                                                                                                                                                           |
| ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dialog`            | `Dialog.Root`                   | state: `open`, `defaultOpen`, `onOpenChange`, `modal`                                                                                                           |
| `DialogTrigger`     | `Dialog.Trigger`                | renders a Tessera `Button`; takes `ButtonProps`                                                                                                                 |
| `DialogPopup`       | `Portal` → `Backdrop` + `Popup` | the host of the slots below; takes `Dialog.Popup` props (`initialFocus`, `finalFocus`, native props)                                                            |
| `DialogTitle`       | `Dialog.Title`                  | slot `title`: `text` recipe, variant `title`; names the dialog                                                                                                  |
| `DialogDescription` | `Dialog.Description`            | slot `description`: `text` recipe, variant `description`; describes the dialog                                                                                  |
| `DialogActions`     | —                               | slot `actions`: `<div data-slot="actions">`, the buttons of the dialog aligned to the end; a column when the page is narrower than the `narrow` container width |
| `DialogClose`       | `Dialog.Close`                  | renders a Tessera `Button`; takes `ButtonProps`; a control, not a slot: it stands in the actions or in the content                                              |
| `DialogDismiss`     | `Dialog.Close`                  | slot `close`: icon-only `Button` with the lucide `X` in the top-end corner; `aria-label` required                                                               |

No part takes `className`, `style` or the Base UI `render`: the parent lays the dialog content out.

## Slots

`DialogPopup` takes its slots in one order: `DialogTitle`, `DialogDescription`, any content, `DialogActions`, `DialogDismiss`. The DOM order is the reading, Tab and visual order, so the main action written last in `DialogActions` is also the last button, and the close button is the last stop of Tab. The recipes place every slot: the title at the top, trimmed to the cap height, the actions at the end, the close button in the corner. The consumer writes no style.

A slot in a wrong place does not render (`lib/slot.ts`):

- a part outside `DialogPopup` or inside another part (`DialogDismiss` in `DialogActions`, `DialogTitle` in `DialogDescription`) throws while rendering: `Tessera: <DialogDismiss> is a part of <DialogPopup>: place it inside <DialogPopup>, outside its other parts.`;
- slots out of order throw when the popup mounts and after every render of the popup: `Tessera: <DialogPopup> lays out its slots in the order title, description, content, actions, close, so the title cannot come after the actions.`

A part wrapped in an element of the consumer still renders: the check sees the host component, not the DOM between them.

## Overflow

- Title, description and any text inside: wrap, and a word longer than the line (a URL, a Windows path, a hash) breaks anywhere (`overflow-wrap: anywhere` of the `surface` and `text` recipes).
- Labels of the buttons in `DialogActions`: one line with an ellipsis; the buttons shrink together down to their height.
- The dialog: never wider than the window minus the `card` gap on each side and never taller; taller content scrolls inside it.

## Rendered attributes

- Backdrop: `data-recipe="surface" data-variant="backdrop"`: fixed over the viewport, `--ts-color-scrim`, no blur.
- Popup: `data-recipe="surface" data-level="modal" data-variant="dialog" data-surface data-inset="card"`: fixed and centred, sized by its content up to the viewport minus the `card` gap on each side, scrolls when taller without a native scrollbar and without a gutter, so the padding stays the same on all four sides. The padding is `--ts-shape-inset`: the `card` gap plus a quarter of the round radius of the dialog; the first and the last line of text are trimmed to the cap height and the baseline, so the text is as far from the top as from the side. Children form a column with the `group` gap. The dialog is not a container: its actions follow the page width (`data-variant="page"` is the container).
- Title: `data-recipe="text" data-variant="title" data-slot="title"`, trimmed to the cap height. Description: `data-recipe="text" data-variant="description" data-slot="description"`.
- `DialogDismiss`: absolute in the top-end corner, `--ts-shape-inset` from the top and the end edge, so it is concentric with the corner: its radius is `--ts-shape-concentric`, the dialog radius minus that offset (at least 4 px, at most a circle) at every size. With it the title is as tall as the button, centred on it, and keeps the button width plus the `group` gap free at its end.

## Behaviour

- The only popup with an entry animation: `opacity` alone, without `scale`, over `--ts-motion-duration-overlay` with `--ts-motion-ease-emphasized`, driven by Base UI `data-starting-style` and `data-ending-style`; the backdrop fades with it. Reduced motion makes both instant.
- Focus moves to the first tabbable element inside and returns to the trigger on close; Escape and a click on the backdrop close the dialog; page scroll is locked.
- Popups opened from the dialog (popover, menu) are first-level surfaces of their own and lie above it: popups and dialogs share `--ts-depth-layer-popup`, and Base UI puts the portal of a child popup after the dialog in the DOM.

## Example

```tsx
import { Dialog, DialogActions, DialogClose, DialogDescription, DialogPopup, DialogTitle, DialogTrigger } from '@mattymroz/tessera/components/dialog/dialog'

<Dialog>
  <DialogTrigger variant="solid">Rename</DialogTrigger>
  <DialogPopup>
    <DialogTitle>Rename chapter</DialogTitle>
    <DialogDescription>The new name shows in the project tree.</DialogDescription>
    <DialogActions>
      <DialogClose>Cancel</DialogClose>
      <DialogClose variant="solid">Save</DialogClose>
    </DialogActions>
  </DialogPopup>
</Dialog>
```
