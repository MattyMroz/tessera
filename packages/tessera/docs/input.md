# Input

Native `<input>` inside a `field` control, wired to `Field` through Base UI `Field.Control`. Import: `@mattymroz/tessera/components/input/input`.

## Props

| Prop    | Type                                   | Default   | Notes                                                                        |
| ------- | -------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | sets `data-size` on the wrapper                                              |
| `start` | `ReactNode`                            | —         | content before the field in a `data-slot="icon"` slot: an icon or a `Button` |
| `end`   | `ReactNode`                            | —         | content after the field in a `data-slot="icon"` slot                         |

Every other `Field.Control` prop (the `<input>` props, `value`, `defaultValue`, `onValueChange`, `ref`) reaches the `<input>`. The field takes no `className`, `style` or `render`: the parent lays it out.

## Rendered attributes

```html
<div data-recipe="control" data-variant="field" data-focus="outer" data-size?>
  <span data-slot="icon">start</span>?
  <input data-slot="input" />
  <span data-slot="icon">end</span>?
</div>
```

The wrapper exists for behaviour: it holds the content before and after the field and draws one shape around all of it. The field has no border; its background is the state step at rest, so it sits flat in its surface: raised is kept for selection and buttons. A glyph in an icon slot is drawn in `--ts-color-secondary-label`; a control in a slot keeps its own colour. An icon slot gives the field the optical padding next to an icon (W4); a slot that holds a control takes the size of that control.

## Behaviour

- The focus ring is drawn on the wrapper whenever the browser treats the `<input>` as `:focus-visible`, which includes a click with the mouse: the field has no border, so the ring is its only focus signal. Buttons inside the field keep the keyboard-only ring.
- A press on an icon or on the padding of the wrapper focuses the field without blurring it first; a press on a button or a link in a slot does not.
- Inside a `Field` the input is labelled, described and validated by the field (see [Field](field.md)); outside it works alone.
- `aria-invalid="true"` or `:user-invalid` on the input (for example a wrong e-mail after the field loses focus) draws the border in `--ts-state-invalid-color`.
- `readOnly` keeps the rest step but turns off hover and press.
- A disabled input (its own `disabled` or a disabled `Field`) dims the whole wrapper through `:has(> [data-slot='input']:disabled)`.
- `spellCheck` is off unless you pass it.
- In forced colors the browser paints the transparent border of the field in a system color, so the field stays visible without a background; an invalid field gets a border two `--ts-shape-stroke` wide, because the system color replaces the invalid color.
- The field does not scale when pressed.

## Overflow

The wrapper is never wider than its parent (`max-inline-size: 100%` of the `control` recipe); a long value or placeholder scrolls inside the native field, and the slots keep their size.

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import Search from 'lucide-react/icons/search'
import X from 'lucide-react/icons/x'

<Input placeholder="Search" aria-label="Search" start={<Search />} end={<Button size="sm" aria-label="Clear" icon={<X />} />} />
```
