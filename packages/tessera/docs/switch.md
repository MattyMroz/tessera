# Switch

An on and off switch on the Base UI `Switch`. The track is the `track` part of the `control` recipe and the thumb is the pill of the `indicator` recipe, moved by the indicator engine (`lib/indicator.ts`). Import: `@mattymroz/tessera/components/switch/switch`.

## Props

| Prop                           | Type                                   | Default   | Notes                                  |
| ------------------------------ | -------------------------------------- | --------- | -------------------------------------- |
| `size`                         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | track height = height × 6/7 (14–31 px) |
| `checked`, `defaultChecked`    | `boolean`                              | —         | controlled or uncontrolled state       |
| `onCheckedChange`              | `(checked, details) => void`           | —         |                                        |
| `children`                     | `ReactNode`                            | —         | label beside the track                 |
| `name`, `value`, `disabled`, … | from Base UI                           | —         | every other prop of `Switch.Root`      |

A switch needs a name: `children`, a `FieldLabel` of its `Field` or `aria-label`. Switch takes no `className`, `style` or `render`.

## Rendered attributes

`<span role="switch" aria-checked data-recipe="control" data-slot="track" data-focus="outer">` with the thumb `<span data-recipe="indicator" data-variant="thumb" data-on>` (`<span data-slot="squash">` with two `<span data-slot="bar">` inside) and two `<span data-slot="spot">` that mark the off and on places of the thumb, and the hidden `<input>` of Base UI. With `children` the track and `<span data-recipe="text" data-variant="label">` sit in `<label data-component="switch" data-slot="choice">`; without `children` the track sits in `<span data-component="switch" data-slot="choice">`. The wrapper has `contain: layout`, so the hidden input of Base UI (`position: fixed` without `name`) makes no compositor layer.

## Behaviour

- Geometry: track = height × 6/7 (at least 24 px on touch), inset = round(track / 8), thumb = track − 2 × inset, width = track + thumb; every value on whole pixels.
- Look: off is a 12 % base of the ink without a border, on is filled with the tint and its glow; hover and press step the plate on the `state` ladder and the hover fades out in the hover-out time; the thumb is raised (white with a shadow) when off and the color on the tint when on.
- Label: half the box from the track (`--ts-size-label-gap`), centred on it; a click on the label presses and toggles the track.
- Click: the thumb stretches to a capsule 1.25 × its width from the side it stands on, on the elastic curve of the indicator (`--ts-motion-ease-elastic`, `--ts-motion-duration-choice`) with compositor properties only: two round ends (`::before`, `::after` of the squash) and two bars (`data-slot="bar"`), one end translated by `--ts-size-thumb-stretch` and the bar between the ends scaled on X; the track does not scale.
- Toggle: the thumb rides to the other place on the indicator engine, 220 ms with an overshoot of 0.1 × the height, the same both ways.
- With `motion: off` and reduced motion the thumb stands at its place in one frame.

## Example

```tsx
<Field>
  <FieldLabel>Transparency</FieldLabel>
  <Switch defaultChecked />
</Field>
```
