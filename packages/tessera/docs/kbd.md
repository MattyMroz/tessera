# Kbd

A keyboard key, or a combination of keys, as a static keycap of the `control` recipe. Import: `@mattymroz/tessera/components/kbd/kbd`.

## Props

| Prop       | Type                                   | Default   | Notes                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children` | `ReactNode`                            | —         | one key; give either `children` or `keys`                                                                                                                                                                                                  |
| `keys`     | `readonly string[]`                    | —         | a combination: one keycap per key with `+` between them, as the `KbdCombo` of the desktop                                                                                                                                                  |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | sets `data-size` on every keycap; without it the keycap takes the size around it (the nearest `data-size`), like a button; in running text, a menu row or a tooltip give a smaller step (`size="xs"`), or the keycap is as tall as the row |

Every other `<kbd>` prop reaches the outer element. Kbd takes no `className` or `style`.

## Rendered attributes

- One key: `<kbd data-recipe="control" data-variant="raised" data-size data-numeric>`: a raised keycap, like a physical key, with the background and the shadow of the `raised` depth level and no border.
- A combination: `<kbd data-recipe="text" data-variant="kbd">` (the separator in the mono font of the text recipe) holding one keycap `<kbd>` per key, as HTML nests `<kbd>` for a key combination. One DOM node per key plus one for the combination.
- The keycap writes in the mono font (`--ts-type-family-mono`, the rule `kbd` of the `control` recipe) with tabular figures (`data-numeric`); `data-numeric` also gives the keycap the narrower side padding of an icon side, so one letter makes a square keycap (no control is narrower than it is tall).

## Behaviour

- Static: no hover, no press, no `pointer` cursor and no focus; it is not on the white list of interactive elements of the `control` recipe.
- The keycap writes in `--ts-color-label` on its own `raised` background everywhere, also in a tooltip: a static control without its own background takes `currentColor` there, but a `raised` one keeps the label color, so the keycap stays readable on the dark tooltip in both modes. An inverted section resolves the label and the level for its own mode.
- With a coarse pointer the keycap keeps the height of its step (`--ts-size-step`): the 24 px minimum of touch belongs to interactive controls only.
- Write key names as text (`Ctrl`, `Alt`, `Shift`, `Cmd`): the Cascadia Code subsets shipped with Tessera have no glyphs for ⌘ ⌥ ⇧ ⌃ (none of the `unicode-range` blocks of `@fontsource-variable/cascadia-code` covers U+2318, U+2325, U+21E7, U+2303), so those signs would fall back to another font.
- A screen reader reads the text of the keys and the `+`; give the name of the action in the text around the keycap.

## Overflow

- A keycap is never wider than its parent (`max-inline-size: 100%` of the `control` recipe); a key name longer than that ends with an ellipsis in `<span data-slot="label">`, one line.
- A combination wraps between its keycaps like text, and a separator never leaves the parent.

## Example

```tsx
import { Kbd } from '@mattymroz/tessera/components/kbd/kbd'
import { MenuItem } from '@mattymroz/tessera/components/menu/menu'

<Kbd>K</Kbd>
<Kbd keys={['Ctrl', 'Shift', 'S']} />
<MenuItem trail={<Kbd keys={['Ctrl', 'Z']} />}>Undo</MenuItem>
```
