# Field

A label, a description, an error and one control that belong together, built on Base UI `Field`. Import: `@mattymroz/tessera/components/field/field`.

## Parts

| Part               | Base UI part        | Notes                                                                                                                                                                         |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Field`            | `Field.Root`        | `<div data-component="field">`; takes `Field.Root` props (`name`, `disabled`, `invalid`, `validate`, `validationMode`, `actionsRef`); `validationMode` defaults to `'onBlur'` |
| `FieldLabel`       | `Field.Label`       | `<label>`, `text` recipe, variant `label`, `data-slot="label"`                                                                                                                |
| `FieldDescription` | `Field.Description` | `<p>`, `text` recipe, variant `description`, `data-slot="description"`                                                                                                        |
| `FieldError`       | `Field.Error`       | `<div role="alert">`, `text` recipe, variant `error`, `data-slot="error"`; rendered only while the field is invalid; takes `match`                                            |

No part takes `className`, `style` or the Base UI `render`. The control is a Tessera control that Base UI wires to the field: `Input`, `Textarea` and, from later rounds, `Select`, `Checkbox` and `Switch`.

## Behaviour

- The label points at the control (`htmlFor`), the control gets `aria-labelledby`, and `aria-describedby` lists the description and the error, so a screen reader reads them with the control.
- A click on the label focuses a control that a `<label>` cannot name (for example a `role="slider"` element): with `htmlFor` the element with that id, without it the first focusable element of the field. A click on a native control's label keeps the browser's own focus.
- `validationMode` defaults to `'onBlur'`: when the control loses focus Base UI checks it, sets `aria-invalid` and `data-invalid` and shows `FieldError` with the browser's message (or the children of `FieldError`), in the same moment the field draws its invalid border from `:user-invalid`. The Base UI default `'onSubmit'` would draw the border first and the text only after a submit. An empty required field that the user never typed in stays valid on blur, for Base UI and for `:user-invalid` alike; it reports on submit. Pass `validationMode="onChange"` or `"onSubmit"` to choose another moment.
- `FieldError` has `role="alert"`, so the message is announced when it appears.
- `disabled` on `Field` disables the control; the field control dims from its own disabled input (`:has(> [data-slot='input']:disabled)` in the `control` recipe), so a disabled `Field` dims an `Input` and a `Textarea` without a prop on them.
- A double click on the label does not select its text (Base UI).

## Layout

`field.css` lays the parts out on a grid by the width of the nearest container (`data-container` or the page):

- from the `narrow` container width (400 px): the label and the description in the left column, the control in the right column on the first line of the label (`align-items: baseline`) and the error under the control in the same column; the parts take their place by slot, the control fills the first free cell, so the order in the DOM does not move them;
- below it, and always with a `Textarea` in the field: one column in DOM order with the `inset` gap.

## Slots

`Field` takes `FieldLabel`, `FieldDescription`, the control and any other content, `FieldError` in this order. A part outside `Field` or inside another part (`FieldError` in `FieldLabel`) throws while rendering, and parts out of order throw when the field mounts and after every render (`lib/slot.ts`, the same model as [Dialog](dialog.md#slots)).

The right column takes the width of the control. Fields that are children of one `Card` share the columns of the card (`subgrid`): the right column is as wide as the widest control, inputs stretch to it, and a narrower `ToggleGroup` ends at its end edge (as `setting-row` of the desktop). The error wraps inside it and never widens it (`contain: inline-size` from the `text` recipe on the error of a field), so the control does not move or grow when an error appears.

## Edges

- A long label, description or error wraps in its column and breaks a word longer than the line anywhere (a URL, a path, a hash); the control keeps the first line, and its value scrolls inside the native field.
- In a parent narrower than the field the label column shrinks before the control column; nothing leaves the parent.
- A field without a label names its control with `aria-label`; Base UI leaves `aria-labelledby` empty.
- An error that comes and goes changes the height of the field by its lines; that is intended, the field does not reserve them.

## Example

```tsx
import { Field, FieldDescription, FieldError, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'

<Field>
  <FieldLabel>Backend URL</FieldLabel>
  <FieldDescription>The address of the local backend.</FieldDescription>
  <Input type="url" required placeholder="http://127.0.0.1:8721" />
  <FieldError />
</Field>
```
