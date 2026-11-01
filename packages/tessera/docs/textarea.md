# Textarea

Native `<textarea>` inside a `field` control, wired to `Field` through Base UI `Field.Control`. Import: `@mattymroz/tessera/components/input/textarea`.

## Props

| Prop      | Type                                   | Default   | Notes                                                                                         |
| --------- | -------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | sets `data-size` on the wrapper                                                               |
| `maxRows` | `number`                               | —         | the field grows up to this many lines, then scrolls; without it the field grows with no limit |

Every other `<textarea>` prop reaches the `<textarea>`. `value`, `defaultValue`, `disabled`, `id` and `name` go through `Field.Control`, so a `Field` labels, describes, validates and disables the textarea. No `className` or `style`.

## Rendered attributes

```html
<div data-recipe="control" data-variant="field" data-focus="outer" data-size?>
  <textarea data-slot="input" data-max-rows? style="--ts-i-value: maxRows" />
</div>
```

`data-max-rows` is present only with `maxRows`; the limit rule reads `--ts-i-value` only under it, because the registered value starts at 0.

## Behaviour

- Grows with its text (`field-sizing: content`) from three lines; a change of height happens in one frame, never in motion. `resize: none`.
- With `maxRows` the text area stops at that many lines of `--ts-size-leading` and scrolls with a thin scrollbar.
- The wrapper is a block-level field: it takes the width of its container and does not widen while you type.
- The vertical padding puts the capitals of the first line as far from the top as the text is from the side: `--ts-shape-control-side` minus the stroke and minus `--ts-size-cap-pad` (half the leading above the capitals).
- A long word without spaces breaks anywhere.
- Focus, invalid border, read-only and disabled behave as in [Input](input.md); a press on the wrapper padding focuses the text area.
- `spellCheck` is off unless you pass it.

## Edges

- A `Field` with a textarea always lays out in one column: the field grows by its text, so it never sits in the narrow right column.
- Overflow: the text wraps and breaks a long word anywhere, the wrapper takes the width of its parent, and only a text area with `maxRows` scrolls (vertically).
- Safari before 26.2 has no `field-sizing`; Tessera does not support it (O7).

## Example

```tsx
import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Textarea } from '@mattymroz/tessera/components/input/textarea'

<Field>
  <FieldLabel>Translator notes</FieldLabel>
  <FieldDescription>Sent with every page of the chapter.</FieldDescription>
  <Textarea maxRows={6} />
</Field>
```
