# Menubar

A bar of menus (File, Edit, View…) built on Base UI `Menubar`. Import: `@mattymroz/tessera/components/menu/menubar`. The rows, groups, separators and submenus inside each menu are the parts of [menu.md](menu.md).

## Parts

| Part          | Base UI part                                                    | Notes                                                                                                                                                                                                              |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Menubar`     | `Menubar`                                                       | `moreLabel` (required: the accessible name of the "…" menu), `size`, `variant` (none: one neutral pill; `'accent'`: a second pill in the accent on the trigger of the open menu, as in the MangaShift desktop app) |
| `MenubarMenu` | `Menu.Root` → `Menu.Trigger`, `Portal` → `Positioner` → `Popup` | `label` (the text of the trigger); the rows of the menu are its children                                                                                                                                           |

`MenubarMenu` outside `Menubar` throws while rendering (`useHost` of `lib/slot.ts`).

The keyboard shortcuts of the main bar of an application (spec F15: Alt alone, F10 and Tab with nothing focused move the focus to the first menu of the first bar of the page) are a hook the application calls once: `useMenubarHotkeys()` from `@mattymroz/tessera/lib/menubar-hotkey`. A bar does not install them itself, because a page may hold several bars and only the main one answers.

## Rendered attributes

- Bar: `<div role="menubar" data-component="menubar" data-recipe="surface" data-surface="bar">`: no background, no border and no padding; it takes the width of its parent (`flex: 1`, `min-inline-size: 0`), so hiding a menu never changes its width. Its first child is the pill (`data-recipe="indicator" data-variant="hover"`).
- Triggers: a Tessera `Button` in the `ghost` variant with `role="menuitem"`; an anchor of a popup, so it stands still on press and only its label and plate press (AGENTS.md).
- A trigger that does not fit has `data-overflow` and `disabled`: the `control` recipe takes it out of the flow (`position: absolute`, `visibility: hidden`), so it keeps its width for the measure, Base UI skips it with the arrows and the pill skips it.
- Popup: the popup of [menu.md](menu.md) with `data-variant="bar"`: the edge of its rows stands on the edge of the trigger (moved back by `--ts-shape-inset`), one `--ts-space-inset` below the bar.

## Behaviour

- One pill for the bar (`useIndicator`, axis `x`): it follows the pointer and the keyboard focus over the triggers and holds the trigger of the open menu, also while the pointer is inside the menu. The same mechanics hold the pill on the trigger of an open submenu.
- `variant="accent"`: the bar draws the two pills of a `ToggleGroup` track: the neutral hover pill follows the pointer and the focus, and the `active` pill (`--ts-state-selected-fill-color` at `--ts-state-selected-fill`: 16 % of the accent, the neutral ink when the accent is neutral) stands on the trigger of the open menu and moves with the `follow` time and curve, like the hover pill (no overshoot; owner decision 04.11: one motion for both pills); from a closed bar it appears on the trigger without a flight. While a menu of the bar is open the hover pill is off at once, without the hover exit (`off` of `select` in `lib/indicator.ts`, `data-off` on the pill), and only the `active` pill moves: it follows the pointer, because the open menu follows the pointer; so no grey pill lags or swaps places with it. The hover pill of the rows of its menus and submenus takes the colour of the `active` pill (`PillFillContext`, `data-fill="selected"` on the pill).
- A row with a tone (`danger` and the others) gets a hover pill in the colour of its tone, at the hover step (shadcn, Primer, MangaShift). The pill driver writes the tone of the row it stands on (`data-tone` on the pill) and keeps it while the pill fades out, so the pill never turns grey when the pointer leaves the row.
- Triggers never shrink (`flex-shrink: 0`): a trigger that does not fit goes behind "…" whole, never cut to a letter.
- No press on the triggers for now (owner, 04.11: it returns with the general rules of the press of anchors). The menu rows have no press step.
- A closed bar opens a menu on click or on Enter, Space and ArrowDown; while a menu is open, the pointer on another trigger switches to its menu (Base UI). The new menu flies from the old one on `transform` only (`lib/popup-flight.ts`, `--ts-motion-duration-follow`, while the old one closed at most `FLIGHT_GRACE` = 150 ms ago, the same grace as a submenu).
- ArrowLeft and ArrowRight move between the triggers and between open menus (Base UI). Tab and Shift+Tab inside an open menu open the next and the previous menu (they become ArrowRight and ArrowLeft for Base UI), past the last or the first shown trigger they close the menu (Escape) (spec F15, desktop app). Which menu is open is the state of Base UI alone; the bar only keeps the trigger whose menu is open for the pill.
- The menus that do not fit hide behind "…" (`lib/bar-overflow.ts`): the widths of the real triggers decide how many fit, every trigger but the last keeps room for "…" after it, the "…" button stays measured while hidden. "…" holds one submenu per hidden menu with the same rows. Nothing is measured while nothing changes size (`ResizeObserver` on the bar, the "…" button and every trigger). When the count changes, "…" slides in from the place of the first menu it hides and fades in, a menu that comes back slides out of "…" and fades in, and a trigger that only moves slides to its place: `transform` and `opacity` only, in the `follow` time and curve of the `motion` engine, on the parts and the `::before` plate of each trigger, never on the trigger, an anchor (owner, 04.11).
- Not modal (`modal={false}`): the page keeps its scroll and nothing turns inert.
- No entry and no exit animation. Near the window edge Base UI shifts a menu and flips a submenu inside the window.

## Example

```tsx
import { MenuItem, MenuSeparator } from '@mattymroz/tessera/components/menu/menu'
import { Menubar, MenubarMenu } from '@mattymroz/tessera/components/menu/menubar'

<Menubar moreLabel="More menus">
  <MenubarMenu label="File">
    <MenuItem trail="Ctrl+O">Open</MenuItem>
    <MenuSeparator />
    <MenuItem tone="danger">Close project</MenuItem>
  </MenubarMenu>
  <MenubarMenu label="Edit">
    <MenuItem trail="Ctrl+C">Copy</MenuItem>
  </MenubarMenu>
</Menubar>
```
