# Text

Text outside a control, styled by the `text` recipe: a label, a description, an error message, a keyboard shortcut or plain body text. The component has no appearance of its own; the variant gives the look. Import: `@mattymroz/tessera/components/text/text`.

## Props

| Prop       | Type                                           | Default  | Notes                                                                                                |
| ---------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `as`       | `'span' \| 'p' \| 'div' \| 'label'`            | `'span'` | element to render; `label` with `htmlFor` names a field                                              |
| `variant`  | `'label' \| 'description' \| 'error' \| 'kbd'` | —        | sets `data-variant`; without it the text is body text                                                |
| `numeric`  | `boolean`                                      | `false`  | sets `data-numeric`: digits of equal width (`tabular-nums`) in any variant                           |
| `htmlFor`  | `string`                                       | —        | only with `as="label"`: the props type is a union, so `htmlFor` on any other element is a type error |
| `children` | `ReactNode`                                    | —        | the text                                                                                             |

Every other HTML attribute reaches the element. The text takes no `className` or `style`: the parent lays it out.

## Rendered attributes

`data-recipe="text"`, `data-variant` (when set), `data-numeric` (when `numeric`).

## Variants

- none: body text (`--ts-type-body-*`) in the colour of its parent, so a text in a tooltip or on a `solid` button takes the colour of that background. `label` and `kbd` inherit the colour too; only `description` and `error` set their own.
- `label`: the text step of the nearest `size` (`--ts-size-text`, `--ts-size-leading`), medium weight, so a label beside a control has the size of the control.
- `description`: the `detail` step in the `secondary-label` colour, `text-wrap: pretty`.
- `error`: like `description`, in `--ts-state-invalid-color`. As the error of a [Field](field.md) it also has `contain: inline-size`: it takes the width of its grid cell and wraps there, so a long error never widens the column under the control.
- `kbd`: the mono family at the `small` step with `tabular-nums`. Only the typography; a keycap is a separate component (E3).

The label of a field is `Text` with `as="label"` and `variant="label"`, not another component.

## Overflow

Every variant wraps, and a word longer than the line (a URL, a Windows path, a hash, a long number) breaks anywhere: `overflow-wrap: anywhere` of the recipe, also counted in the smallest width of the text, so a text in a grid or flex cell lets the cell shrink instead of pushing it out of its parent. The `surface` recipe gives the same rule to any text inside a surface.

## Example

```tsx
import { Input } from '@mattymroz/tessera/components/input/input'
import { Text } from '@mattymroz/tessera/components/text/text'

<Text as="label" variant="label" htmlFor="chapter-name">Chapter name</Text>
<Input id="chapter-name" />
<Text as="p" variant="description">Shown above every page of the chapter.</Text>
<Text variant="label" numeric>1,024 pages</Text>
```
