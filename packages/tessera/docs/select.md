# Select

A choice of one value from a list, built on Base UI `Select`. Import: `@mattymroz/tessera/components/select/select`. The list is the list of [menu.md](menu.md): the same popup, pill, rows, group labels and separators (`LIST_POPUP`, `useListPill`, `ListRow` from `menu.tsx`).

## Parts

| Part               | Base UI part                      | Notes                                                                                                                                                             |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Select`           | `Select.Root`                     | `value`, `defaultValue`, `onValueChange`, `modal` (default `false`), `size`                                                                                       |
| `SelectTrigger`    | `Select.Trigger` → `Select.Value` | a Tessera `Button` with a chevron at the end; `placeholder` and `labels` (required: the text of each value, the component holds no UI text) and the `ButtonProps` |
| `SelectContent`    | `Portal` → `Positioner` → `Popup` | `align`: `'trigger'` (default: the chosen option lies on the value of the trigger), `'bottom'`, `'top'`; `mark`: `'check'` (default) or `'dot'`                   |
| `SelectItem`       | `Select.Item`                     | `value`, `icon`, `trail`, `disabled`; the text goes through `Select.ItemText`                                                                                     |
| `SelectGroup`      | `Select.Group`                    |                                                                                                                                                                   |
| `SelectGroupLabel` | `Select.GroupLabel`               | uppercase grey heading                                                                                                                                            |
| `SelectSeparator`  | `Select.Separator`                | one stroke from border to border                                                                                                                                  |

`SelectTrigger` and `SelectContent` outside `Select` and `SelectItem` outside `SelectContent` throw while rendering (`useHost` of `lib/slot.ts`).

## Behaviour

- Every option starts with the mark of [checkbox.md](checkbox.md) (`Mark`): the check draws itself on the chosen option, the dot springs with `mark="dot"`; the column of text is fixed.
- On the trigger (`align="trigger"`, the default): the list hangs below the trigger by the ordinary anchored placement and is moved up and left by the offsets that lay the text of the chosen option on the text of the value (`lib/select-align.ts`, measurement file Q7: `sideOffset` and `alignOffset` measured at every placement). It does not use the Base UI `alignItemWithTrigger` mode, because that mode pins the list to the window and locks the scroll of the whole page, which hides the page scrollbar. The list follows the trigger while the page scrolls; it shifts to stay in the window instead of flipping. Error at DSF 1, 1.25 and 1.5 and at the lab magnifier 1× and 2×: at most 0.45 px (rounding of the placement). A list taller than the room keeps its own scroll.
- The chevron of the trigger turns half a turn on open and back on close (`--ts-motion-flip`, `scene` time and the standard curve of the `motion` engine).
- A new value replaces the old one in the trigger: the old value slides up and fades out, the new one slides in from below and fades in, with `translate` and `opacity` only, in the `follow` time and curve of the `motion` engine (`lib/value-swap.ts`; owner decision in `docs/decisions/e3-choices.md`).
- Base UI gives the keyboard (arrows, Home/End, typeahead, Enter, Escape) and the focus return. Not modal by default: an open list never locks the scroll of the page and never hides its scrollbar.
- No entry and no exit animation of the list.

## Example

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from '@mattymroz/tessera/components/select/select'

const FONTS = { inter: 'Inter', roboto: 'Roboto' }

<Select defaultValue="roboto">
  <SelectTrigger variant="soft" placeholder="Font" labels={FONTS} aria-label="Font" />
  <SelectContent>
    <SelectItem value="inter">Inter</SelectItem>
    <SelectItem value="roboto">Roboto</SelectItem>
  </SelectContent>
</Select>
```
