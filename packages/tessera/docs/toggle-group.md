# ToggleGroup

Segmented control with a single choice: a radio group of native `<button>` elements, with a sliding pill for hover and one for the chosen option. Import: `@mattymroz/tessera/components/toggle-group/toggle-group`.

## Props

`ToggleGroup`:

| Prop            | Type                                                      | Default    | Notes                                                                                                                   |
| --------------- | --------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `aria-label`    | `string`                                                  | required   | name of the group for assistive technology                                                                              |
| `value`         | `string`                                                  | —          | controlled choice                                                                                                       |
| `defaultValue`  | `string`                                                  | —          | initial choice when uncontrolled; without it nothing is chosen                                                          |
| `onValueChange` | `(value: string) => void`                                 | —          | called with the new choice                                                                                              |
| `variant`       | `'raised' \| 'active'` (the list `TOGGLE_GROUP_VARIANTS`) | `'raised'` | look of the chosen pill: `raised` is the `raised` depth level (background and shadow, no outline), `active` a flat tint |
| `size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                    | inherited  | sets `data-size` on the track                                                                                           |
| `children`      | `ReactNode`                                               | —          | `ToggleGroupItem` elements                                                                                              |

`ToggleGroupItem`:

| Prop         | Type        | Default  | Notes                                                                              |
| ------------ | ----------- | -------- | ---------------------------------------------------------------------------------- |
| `value`      | `string`    | required | value reported by the group                                                        |
| `children`   | `ReactNode` | —        | label; without it the option is icon-only and `aria-label` is required by the type |
| `icon`       | `ReactNode` | —        | icon before the label; alone it makes the option square                            |
| `aria-label` | `string`    | —        | name of the option; required for an icon-only option                               |
| `disabled`   | `boolean`   | `false`  | option cannot be chosen                                                            |

Neither part takes `className` or `style`: the parent lays the group out. A `ToggleGroupItem` outside `ToggleGroup` throws while rendering: `Tessera: <ToggleGroupItem> is a part of <ToggleGroup>: place it inside <ToggleGroup>.` (`useHost` of `lib/slot.ts`).

## Rendered attributes

- Track: `<div role="radiogroup">` with `aria-label`, `data-component="toggle-group"` (inline grid row of equal columns), `data-recipe="surface"`, `data-level="sunken"` (a grey fill without an outline), `data-surface="track"`, `data-inset="inset"`, `data-size` (when set). The gap between the track and the options (`--ts-shape-inset`) follows the size, not the density: the wrap gap of the `size` engine (`--ts-size-wrap`, an eighth of the option height rounded to 0.5 px) plus the stroke, 3 / 3.5 / 4 / 4.5 / 5.5 px from `xs` to `xl`. The `track` surface takes its radius from the control inside it, `--ts-shape-control` plus `--ts-shape-inset`, and the corner shape of the control, so the track stays concentric with the pill at every `corners` and `curve`.
- Option: `<button type="button" role="radio">` with `aria-checked`, `value`, `tabindex` (`0` on the tab stop of the group, `-1` on the others), `disabled`, `data-recipe="control"`, `data-variant="ghost"`, `data-focus="inset"`; icon in `<span data-slot="icon">`, label in `<span data-slot="label">`. One element per option.
- Two pills before the options, the hover pill first, so it always paints under the chosen pill, also while it slides across it: `data-recipe="indicator"` with `data-variant="hover"` and then the one for the chosen option with `data-variant` from the `variant` prop, each with one `[data-slot="squash"]` that paints the pill. The hook sets `data-axis="x"`, `data-visible` and `data-wall` on them.
- The options stand `--ts-space-segment` (2 px, `space` engine) apart, the gap of every `track` surface, so the hover pill never touches the chosen one.

## Behaviour

- Arrow keys move the focus and the choice to the next or previous enabled option and wrap around; Home and End go to the first and last enabled option. Down and Right go to the next option, Up and Left to the previous one; in a group laid out from right to left (`:dir(rtl)`) Left and Right swap. A typed letter moves the focus and the choice to the next enabled option whose name (`aria-label`, else the text) starts with it; letters typed within 500 ms (`TYPEAHEAD_RESET`) make one text, and the same letter typed again cycles through the options that start with it. The keyboard logic is the pure module `lib/collection.ts`. A typed letter counts as keyboard input, so the option it focuses shows the focus ring. The group is one tab stop: Tab enters on the chosen option when it is enabled, otherwise (nothing chosen, or the chosen option disabled) on the first enabled option. Space, Enter and a click choose the focused option; a click on the chosen option keeps it.
- A change of the choice re-renders only the previously and the newly chosen option, the first choice also only the option that was the tab stop and the newly chosen one (`lib/single-choice.ts`, one subscription per option).
- Every option is as wide as the widest one (equal grid columns, plain CSS), never narrower than it is tall; in a narrow parent the options narrow together and cut their labels with an ellipsis. With equal options the active pill moves only, it never changes its size.
- The active pill slides to the chosen option; the hover pill follows the pointer, stays on the last option over gaps and over a disabled option, hides over the chosen option, when the pointer leaves the track and when the window loses focus (the same rule as the menu).
- Options take the cursor of the `platform` (`default` on `desktop`, `pointer` on `web`); a disabled option keeps `default`.
- Both pills move only by `transform` (`lib/indicator.ts`, motion mode read from the `motion` engine of the track at the start of every slide, so a group in a subtree with the motion `off` does not slide, also after the application switches `data-motion` of that subtree), take the size of their option through the instance keys `--ts-i-inline-size` and `--ts-i-block-size` (`writeInstance`), bounce off the track wall and squash there. Pressing an option scales nothing (an option with a pill never scales): the document press listener of `lib/press.ts` sets `data-pressing` on it, and the hover pill under a pressed option that is not chosen takes one press step of the state ramp (`--ts-state-indicator-track` plus the difference of `--ts-state-press` and `--ts-state-hover`), as in v2.
- The pills paint under the option labels and replace the state overlay of the `control` recipe. The `active` pill takes the flat selected fill of the `state` engine (`--ts-state-selected-fill`). The hover pill on the grey track takes `--ts-state-indicator-track` (4 % ink in both modes), so it stays clearly weaker than the raised pill: at least 0.06 apart in OKLab lightness in both modes.
- The hover pill fades out over `--ts-motion-duration-hover-exit` of the `motion` engine: the instant plus the overlay time by default, the instant time alone with the input `--ts-in-motion-hover-fade: 0` (the motion lab compares both), at once with the motion `off`.
- In forced colors the chosen pill is `Highlight` with the chosen label in `HighlightText`, the hover pill is an outline in `ButtonText` and the browser paints the transparent border of the track in a system color.
- The hit area of an option is its box. With a coarse pointer every option is at least 24 × 24 px.

## Overflow

The group never breaks into a second line and never leaves its parent: the options narrow together down to their height and end their labels with an ellipsis (F20).

## Example

```tsx
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'

<ToggleGroup aria-label="Range" defaultValue="week" onValueChange={setRange}>
  <ToggleGroupItem value="day">Day</ToggleGroupItem>
  <ToggleGroupItem value="week">Week</ToggleGroupItem>
  <ToggleGroupItem value="month">Month</ToggleGroupItem>
</ToggleGroup>
```
