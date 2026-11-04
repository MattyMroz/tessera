# Alert Dialog

A modal question that needs an answer, built on Base UI `AlertDialog`, and `confirm()`: one awaited call for the usual "are you sure" window. Import: `@mattymroz/tessera/components/dialog/alert-dialog`.

## confirm

```ts
confirm(options: ConfirmOptions): Promise<boolean>

type ConfirmOptions = {
  title: ReactNode
  description?: ReactNode
  tone?: Tone              // tone of the confirm button; 'danger' for a destructive action
  confirmLabel: ReactNode
  cancelLabel: ReactNode   // the library has no UI text of its own: every label comes from the app
  onConfirm?: () => Promise<void>
}
```

Below, "Cancel" stands for the button with `cancelLabel`.

`confirm()` opens the one window of `ConfirmHost` through a Base UI handle (`AlertDialog.createHandle()` and `openWithPayload`); there is no store of its own. Mount `ConfirmHost` once, near the root of the app. Without a mounted host the promise resolves `false` at once.

- Without `onConfirm`: the confirm button closes the window and resolves `true`; "Cancel" and Escape resolve `false`.
- With `onConfirm`: the confirm button shows `busy` and runs it; meanwhile Escape and "Cancel" do nothing (Cancel is `aria-disabled`) and a second press of the busy button does nothing. A resolved promise closes the window and resolves `true`. A rejected promise shows its message in an `Alert` with tone `danger` and `role="alert"` inside the window, which stays open for another try or "Cancel".
- The content stays as it was while the window fades out: a closing window keeps its title, description and button state.
- "Cancel" comes first in the DOM, so it takes the first focus; Enter on a fresh window cancels.
- A click on the backdrop never closes the window (`role="alertdialog"`, Base UI).
- A second `confirm()` while the window is open resolves the first with `false` and shows the new question.

## Parts

| Part                 | Base UI part                                 | Notes                                                                      |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `ConfirmHost`        | `AlertDialog.Root` with the `confirm` handle | renders the window of `confirm()`; mount once                              |
| `AlertDialog`        | `AlertDialog.Root`                           | for a custom alert dialog: `open`, `defaultOpen`, `onOpenChange`, `handle` |
| `AlertDialogTrigger` | `AlertDialog.Trigger`                        | renders a Tessera `Button`; takes `ButtonProps`                            |

The content of a custom alert dialog uses the parts of [Dialog](dialog.md): `DialogPopup`, `DialogTitle`, `DialogDescription`, `DialogActions`, `DialogClose`, with the same slot order and the same errors for a part in a wrong place ([Dialog, Slots](dialog.md#slots)). Base UI `AlertDialog` reuses the dialog parts, so they work under `AlertDialog` unchanged and give the popup `role="alertdialog"`.

## Overflow

As [Dialog](dialog.md#overflow): the title and the description wrap and break a long word anywhere, the button labels end with an ellipsis, and a window taller than the screen scrolls. The window is at most `--ts-type-measure` wide plus its padding.

## Rendered attributes

The window of `confirm()`:

```html
<div data-recipe="surface" data-variant="backdrop" />
<div role="alertdialog" data-recipe="surface" data-level="modal" data-variant="dialog" data-surface data-inset="card">
  <h2 data-recipe="text" data-variant="title" data-slot="title">title</h2>
  <p data-recipe="text" data-variant="description" data-slot="description">description</p>?
  <div role="alert" data-component="alert" data-tone="danger">error</div>?
  <div data-slot="actions"><button>cancelLabel</button><button data-variant="solid" data-tone>confirmLabel</button></div>
</div>
```

An alert dialog is at most `--ts-type-measure` wide plus its padding (`surface` recipe, `[role='alertdialog']`), so a long description wraps at a readable measure; everything else is the dialog surface (entry by `opacity`, scroll when taller than the window).

Its text is centred and the buttons of its actions share the width equally (`control` recipe, `[role='alertdialog'] > [data-slot='actions']`). In a container narrower than `narrow` (400 px) the actions stack, so "Cancel" stays on top and the action comes last, without a change of the DOM order.

## Example

```tsx
import { confirm, ConfirmHost } from '@mattymroz/tessera/components/dialog/alert-dialog'

<ConfirmHost />

const deleted = await confirm({
  title: 'Delete project?',
  description: 'All chapters and their history are removed.',
  tone: 'danger',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  onConfirm: () => api.deleteProject(id),
})
```
