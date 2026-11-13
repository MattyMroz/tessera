# Slider

A slider with the value inside a white pill that grows in the track of the toggle group. Own code, no provider: the host has `role="slider"` and `lib/slider.ts` drives the pointer, the keys and the flights. Import: `@mattymroz/tessera/components/slider/slider`.

## Props

| Prop                              | Type                                   | Default   | Notes                                                          |
| --------------------------------- | -------------------------------------- | --------- | -------------------------------------------------------------- |
| `min`, `max`                      | `number`                               | required  | ends of the range                                              |
| `step`                            | `number`                               | `1`       | a range of at most 12 steps is stepped: step dots and snapping |
| `value`, `defaultValue`           | `number`                               | `min`     | controlled or uncontrolled value                               |
| `onValueChange`                   | `(value) => void`                      | —         | on every change of the value                                   |
| `onValueCommit`                   | `(value) => void`                      | —         | once when a drag ends, at once for a key                       |
| `format`                          | `(value) => string`                    | the value | text in the pill and `aria-valuetext`                          |
| `end`                             | `string`                               | —         | text at the end of the track; fades before the pill reaches it |
| `size`                            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | pill height = control height                                   |
| `disabled`                        | `boolean`                              | `false`   | `aria-disabled`, out of the tab order                          |
| `aria-label` or `aria-labelledby` | `string`                               | required  | the name of the slider                                         |

Slider takes no `className`, `style` or `render`. It fills the width its parent gives it and is never narrower than the pill of its widest value plus 2.5 × the height.

## Rendered attributes

`<div role="slider" tabindex="0" aria-valuemin aria-valuemax aria-valuenow aria-valuetext data-component="slider" data-recipe="surface" data-level="sunken" data-surface="track" data-variant="slider" data-focus="outer">` with, in paint order:

- `<span data-slot="marks">` with one `<span data-slot="mark">` per step after the first (stepped ranges only);
- `<span data-slot="end">` (with `end`), `data-covered` while the pill is near it;
- `<span data-recipe="indicator" data-variant="fill">`: `<span data-slot="cap">` (the start, as wide as the value text), `<span data-slot="lane">` (a container, so the end moves in `cqi` of its length) with `<span data-slot="bar">` (scaled on X) and `<span data-slot="ride">` (the end of the pill, translated on X) that holds `<span data-slot="grip">`;
- `<span data-slot="value">` with hidden `<span data-slot="sizer">` samples of the widest values and the shown `<span data-slot="label">`.

While it is used the host carries `data-dragging` (pointer down), `data-moving` (the pill follows the pointer), `data-over` and `data-wall="start|end"` (pulled past an end).

## Behaviour

- Geometry: track and pill of the toggle group (`--ts-size-height`, `--ts-shape-control-radius`, inset of the `track` surface); the end of the pill is one height wide and the grip is `--ts-size-grip` long (2/5 of the height). The start of the pill is as wide as the widest value text, so the pill never jumps when the text changes.
- Grab: a press on the end of the pill (the cap around the grip) changes nothing and the pill follows the pointer 1:1. A press and release without a move puts the end of the pill where it was pressed.
- Press elsewhere (the middle of the pill, the empty track): the end of the pill flies under the pointer and lands after `--ts-motion-duration-choice`, also while the pointer moves; then it follows 1:1.
- Stepped range: the pill stands on a step and flies to the next one when the pointer reaches it, never ahead of the pointer; the flight is the choice flight of the indicator (`lib/flight.ts`: 220 ms, overshoot 0.1 × the height, kept inside the track).
- Past an end the track stretches towards the pointer, at most 2/7 of the height, and springs back when released.
- Keys: arrows step (mirrored from right to left), Page Up and Page Down step by a tenth of the range, Home and End jump to the ends. Each key flies the pill and commits at once.
- Text: a number changes in the same frame, so the new value is readable at once; a word (Low → Medium) fades the old text out and the new one in with the swap blur for `--ts-motion-duration-choice`, the time of the flight of the pill. A change is a number change when the two texts differ only in digits, separators and spaces (`$100` → `$200`, `9%` → `10%`).
- Motion uses compositor properties only (`translate` of the ride, `scale` of the bar and of the track); layers exist from the first move to the release. With `motion: off` and reduced motion the pill stands at its place in one frame and nothing stretches.

## Example

```tsx
<Slider min={0} max={100} defaultValue={40} format={(value) => `${value}%`} end="100%" aria-label="Opacity" />
<Slider min={0} max={3} defaultValue={1} format={(value) => EFFORT[value]} aria-label="Effort" />
```
