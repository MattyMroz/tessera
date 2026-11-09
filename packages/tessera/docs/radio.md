# Radio

A group of options with one choice on the Base UI `RadioGroup` and `Radio`. The circle is the `box` part of the `control` recipe. Import: `@mattymroz/tessera/components/radio/radio`.

## Props

`RadioGroup`: `value`, `defaultValue`, `onValueChange`, `name`, `disabled` from Base UI, `size` and `aria-label` (or a `Field` label).

`Radio`:

| Prop       | Type        | Default | Notes                                       |
| ---------- | ----------- | ------- | ------------------------------------------- |
| `value`    | `string`    | —       | the value of the option                     |
| `children` | `ReactNode` | —       | the label; the whole label picks the option |
| `disabled` | `boolean`   | `false` |                                             |

Radio takes no `className`, `style` or `render`.

## Rendered attributes

`<div role="radiogroup" data-component="radio">` with one `<label data-component="radio" data-slot="choice">` per option: `<span role="radio" aria-checked data-recipe="control" data-slot="box" data-focus="outer">` with the shared mark part `<span data-slot="mark" data-recipe="indicator" data-variant="dot">` (`docs/decisions/e3-marks.md`) and `<span data-recipe="text" data-variant="label">`.

## Behaviour

- Look: the circle is the box of a checkbox with a full radius; unchecked is the rest ink with the control border, checked is filled with the tint and has a dot of 7/16 of the circle (`--ts-size-dot`, 7 px at `lg`) in the color on the tint.
- The label is half a circle from it (`--ts-size-label-gap`); options are 12 px apart.
- Press: the circle presses like a button.
- Choice: the dot grows from the centre on the elastic curve of the library (`--ts-motion-ease-elastic`, `--ts-motion-duration-choice`), the same spring as the switch; the old dot goes in one frame and never travels between options.
- Arrows move the choice, Tab enters the group at the chosen option (Base UI).

## Example

```tsx
<RadioGroup aria-label="Quality" defaultValue="balanced">
  <Radio value="fast">Fast</Radio>
  <Radio value="balanced">Balanced</Radio>
</RadioGroup>
```
