# Checkbox

A box that is checked, unchecked or mixed, and a group of them with a parent box, on the Base UI `Checkbox` and `CheckboxGroup`. The box is the `box` part of the `control` recipe. Import: `@mattymroz/tessera/components/checkbox/checkbox`.

## Props

`Checkbox`:

| Prop                           | Type                                   | Default   | Notes                                                                                   |
| ------------------------------ | -------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `children`                     | `ReactNode`                            | —         | the label beside the box; the whole label toggles the box. Without it give `aria-label` |
| `size`                         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | the box is the icon of the step: 10–18 px, at least 24 px with a coarse pointer         |
| `checked`, `defaultChecked`    | `boolean`                              | —         | controlled or uncontrolled state                                                        |
| `indeterminate`                | `boolean`                              | `false`   | the mixed state: filled like checked, with a minus                                      |
| `parent`                       | `boolean`                              | `false`   | inside a `CheckboxGroup`: checks and unchecks every box and shows the mixed state       |
| `value`, `name`, `disabled`, … | from Base UI                           | —         | every other prop of `Checkbox.Root`                                                     |

`CheckboxGroup`: `value`, `defaultValue`, `onValueChange`, `allValues` (the values the parent box controls) from Base UI and `size`.

Checkbox takes no `className`, `style` or `render`.

## Rendered attributes

`<span role="checkbox" aria-checked data-recipe="control" data-slot="box" data-focus="outer">` with `<span data-slot="mark">` holding the check and the minus (`<svg>` with one path, `pathLength` 1), and the hidden `<input>` of Base UI. With `children` the box sits in `<label data-component="checkbox" data-slot="choice">` beside `<span data-recipe="text" data-variant="label">`; without `children` it sits in `<span data-component="checkbox" data-slot="choice">`. The wrapper has `contain: layout`, so the hidden input of Base UI (`position: fixed` without `name`) makes no compositor layer. A group is `<div data-component="checkbox" role="group">`.

## Behaviour

- Look (v2): unchecked is the rest ink of the state ladder with the 1 px control border; checked and mixed are filled with the tint, the border hides under the fill, the mark is the color on the tint, with the neon glow. Hover steps the ladder in every state. Radius: the rule of a control, capped at 35 % of the box.
- The label is half a box from the box (`--ts-size-label-gap`, 8 px at `lg`); boxes of a group are 12 px apart.
- Press: the whole box presses like a button (`--ts-motion-press-scale`).
- Mark (v2): the check draws itself short arm first, the minus from the left, in `--ts-motion-duration-draw-in` (350 ms) and erases in `--ts-motion-duration-draw-out` (150 ms) on `--ts-motion-ease-draw`. With `motion: off` and reduced motion it shows in one frame.
- `aria-invalid` paints the border in the invalid color. In forced colors a checked box is `Highlight` with the mark in `HighlightText`.

## Example

```tsx
import { Checkbox, CheckboxGroup } from '@mattymroz/tessera/components/checkbox/checkbox'

<CheckboxGroup aria-label="Pages" allValues={['1', '2']} defaultValue={['1']}>
  <Checkbox parent>Select all</Checkbox>
  <Checkbox value="1">Page 1</Checkbox>
  <Checkbox value="2">Page 2</Checkbox>
</CheckboxGroup>
```
