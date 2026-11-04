# Menu

Dropdown menu with groups, checkbox items and submenus, built on Base UI `Menu`. Import: `@mattymroz/tessera/components/menu/menu`.

## Parts

| Part                 | Base UI part                      | Notes                                                                                                                                                                                                                                                                                                                    |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Menu`               | `Menu.Root`                       | state: `open`, `defaultOpen`, `onOpenChange`, `modal` (default `false`, as in the desktop app and v2: a modal menu locks the scroll of the page with `overflow: hidden` on `<body>`, which with a classic scrollbar reflows the whole page and costs a long frame on every open)                                         |
| `MenuTrigger`        | `Menu.Trigger`                    | renders a Tessera `Button`; takes `ButtonProps`                                                                                                                                                                                                                                                                          |
| `MenuContent`        | `Portal` → `Positioner` → `Popup` | takes `Menu.Popup` props, `width?: 'content' \| 'trigger'` (default `'content'`): `trigger` keeps the popup at least as wide as its anchor, and `anchor?: RefObject<Element \| null>` (default: the trigger): the element the menu opens at, e.g. the whole group of a split button ([button-group.md](button-group.md)) |
| `MenuItem`           | `Menu.Item`                       | `icon`, `trail` (shortcut text), `tone` (`data-tone`: `neutral`, `accent`, `danger`, `success`, `warning`, `info`; colours the text), `disabled`, `closeOnClick`                                                                                                                                                         |
| `MenuCheckboxItem`   | `Menu.CheckboxItem`               | `checked`, `defaultChecked`, `onCheckedChange`, `trail`; keeps the menu open                                                                                                                                                                                                                                             |
| `MenuRadioGroup`     | `Menu.RadioGroup`                 | `value`, `defaultValue`, `onValueChange`                                                                                                                                                                                                                                                                                 |
| `MenuRadioItem`      | `Menu.RadioItem`                  | `value`, `trail`; keeps the menu open                                                                                                                                                                                                                                                                                    |
| `MenuSeparator`      | `Menu.Separator`                  |                                                                                                                                                                                                                                                                                                                          |
| `MenuGroup`          | `Menu.Group`                      |                                                                                                                                                                                                                                                                                                                          |
| `MenuGroupLabel`     | `Menu.GroupLabel`                 | uppercase grey heading                                                                                                                                                                                                                                                                                                   |
| `MenuSubmenu`        | `Menu.SubmenuRoot`                | state: `open`, `defaultOpen`, `onOpenChange`                                                                                                                                                                                                                                                                             |
| `MenuSubmenuTrigger` | `Menu.SubmenuTrigger`             | `icon`; opens the submenu at once (`delay={0}`), ends with a chevron                                                                                                                                                                                                                                                     |
| `MenuSubmenuContent` | `Portal` → `Positioner` → `Popup` | takes `Menu.Popup` props                                                                                                                                                                                                                                                                                                 |

No part takes `className`, `style` or the Base UI `render`: the parent lays the trigger out. `MenuTrigger` and `MenuContent` outside `Menu`, `MenuSubmenu` outside a menu popup and `MenuSubmenuTrigger` or `MenuSubmenuContent` outside `MenuSubmenu` throw while rendering: `Tessera: <MenuTrigger> is a part of <Menu>: place it inside <Menu>.` (`useHost` of `lib/slot.ts`).

## Rendered attributes

- Popup: `data-recipe="surface" data-level="overlay" data-material="solid" data-surface data-inset="inset" data-content="controls"`, `data-width="trigger"` with `width="trigger"` (`min-inline-size: var(--anchor-width)`). Menus stay solid in every material. A long menu stops at the room left in the window (`--available-height` minus the `inset` gap) and scrolls; a submenu beside its parent stops at `--available-width` minus the `inset` gap, so it stays in a narrow window; it scrolls without a native scrollbar and without a gutter, so the padding is the same on all four sides. The menu wraps its rows like a track wraps its options (`data-content="controls"` of the `shape` engine): the padding (`--ts-shape-inset`) is the wrap gap of the `size` engine (`--ts-size-wrap` = an eighth of the row height rounded to 0.5 px: 2 / 2.5 / 3 / 3.5 / 4.5 px from `xs` to `xl`) plus the stroke, without the quarter of the radius and without the density; the radius of the popup is the radius of a row plus that padding, with the corner shape of the row, so the rows stay concentric with the popup at every size, `corners` and `curve`. The label of a row and of a group label is `<span data-slot="label">`, trimmed to the cap height and centred in the row.
- Rows: `data-recipe="row"` with the slots `mark`, `icon`, `label`, `trail` in this order; `data-tone` when the item has a tone. The `icon` slot is the same as in a button: a `<span data-slot="icon">` with the `<svg>` inside (the icon of the application, and the chevron of a submenu trigger inside `trail`, the lucide `ChevronRight`). A checkbox item starts with the check and a radio item with the dot: the shared part `Mark` of [checkbox.md](checkbox.md) (`data-slot="mark" data-recipe="indicator" data-variant="check|dot"`), the same drawing and the same motion as in `Checkbox` and `Radio`, in a box of the icon size; it keeps its place while unchecked. The stroke width comes from `--ts-size-icon-stroke`. Separator: `data-variant="separator"`, one stroke from the border to the border of the popup. Group label: `data-variant="group-label"`.
- Column of text: in a popup where a row starts with a mark or an icon, every other row (also a group label) starts its text in the same column; a popup without marks and icons keeps the plain side. Each popup counts on its own, so a submenu without icons has no empty column. A row ending with an icon (the chevron of a submenu) has the icon side at the end.
- The rows, the pill and the popup attributes are shared with `Select` and the context menu (`ListRow`, `useListPill`, `LIST_POPUP` exported from `menu.tsx`).
- A row with `aria-checked` shows the check, not a background; `aria-selected` and `aria-current` paint the selected fill only inside `[aria-multiselectable='true']` (lists and trees, E3), because one choice is shown by the pill.
- Pill: first child of the popup, `data-recipe="indicator" data-variant="hover"` with one `squash` inside that paints the pill.

## Behaviour

- One hover pill per popup slides between rows (`useIndicator`, axis `y`). A freshly opened menu shows no pill until the pointer reaches a row or an arrow key is pressed. The pill shows the real highlight: it follows the pointer and the keyboard focus and stays on the last row over a separator, a group label, a gap and a disabled row (also when the arrows reach a disabled row); it fades out when the pointer leaves the popup and when the window loses focus, and appears on the next row the pointer reaches. An open submenu trigger keeps the pill of its menu, also while the pointer is in the submenu and when the submenu opens with `defaultOpen` or `open`, and the submenu has its own pill.
- While the pointer crosses other rows inside the safe triangle on its way into a submenu, the parent pill does not move: Base UI blocks pointer events on the parent menu while the submenu is open.
- An arrow key pressed while the pointer is on a row moves on from that row. After the pointer has left the popup, Base UI drops its highlight and the arrows start again at the first row, as in native Windows and macOS menus; the pill appears there.
- The hover pill takes the colour of the tone of the highlighted row (`data-highlighted` with `data-tone`: accent, danger, success, warning, info) at the same hover step; a row without a tone keeps the neutral ink (indicator recipe).
- Pressing a row gives no press step: `lib/press.ts` does not press a row and the pill keeps its fill.
- Rows take the cursor of the `platform` (`--ts-state-cursor`: `default` on `desktop`, `pointer` on `web`); disabled rows, separators and group labels keep `default`.
- The menu opens aligned to the start of its trigger (or of its `anchor`), one `--ts-space-inset` away from it; a submenu touches the edge of its trigger row, so it overlaps its parent by the padding of the parent (`--ts-shape-inset`, as in v2 and the desktop app), and lifts by `--ts-shape-inset`, so its first row lines up with the trigger row; beside the window edge it flips to the other side and overlaps the same way.
- The popup takes the subtree axes of its trigger (`size`, `density`, `corners`, `curve`, `motion` from the nearest ancestors below `<html>`, `lib/scope.ts`), so a menu opened from an `xs` bar is `xs` and a menu from a subtree with the motion `off` slides no pill. `Menu` and `MenuSubmenu` keep a fixed handle to the node of their trigger, which the trigger registers when it mounts; the popup copies the axes when it mounts, however the menu opens (click, keyboard, `open`, `defaultOpen`). A submenu takes them from its parent popup.
- No entry and no exit animation; a popup appears and disappears in one frame. Switching straight from one submenu to its sibling flies the new submenu from the old one (`lib/popup-flight.ts`, `transform` only, `--ts-motion-duration-follow` on `--ts-motion-ease-hover` of the `motion` engine of the popup, none when that time is 0; the flight starts only while the previous submenu closed at most `FLIGHT_GRACE` = 150 ms ago).
- Base UI gives the keyboard (arrows, Home/End, typeahead, ArrowRight/ArrowLeft for submenus, Escape), the safe triangle towards a submenu and focus return to the trigger.
- A closed menu renders no DOM and keeps no position listeners.

## Overflow

- A row: one line; the label ends with an ellipsis and the icon and the `trail` keep their size.
- The popup: never wider or taller than the room in the window; a longer list scrolls inside it, never sideways.
- The trigger: a `Button`, so its label ends with an ellipsis.

## Example

```tsx
import {
  Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuSeparator, MenuSubmenu, MenuSubmenuContent, MenuSubmenuTrigger, MenuTrigger,
} from '@mattymroz/tessera/components/menu/menu'

<Menu>
  <MenuTrigger variant="soft">Project</MenuTrigger>
  <MenuContent>
    <MenuItem trail="Ctrl+O">Open</MenuItem>
    <MenuCheckboxItem defaultChecked>Show bubbles</MenuCheckboxItem>
    <MenuSeparator />
    <MenuSubmenu>
      <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
      <MenuSubmenuContent>
        <MenuItem>Pages as WebP</MenuItem>
      </MenuSubmenuContent>
    </MenuSubmenu>
    <MenuItem tone="danger">Delete project</MenuItem>
  </MenuContent>
</Menu>
```
