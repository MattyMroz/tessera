# Context menu

Menu opened by the secondary button (or the context menu key, or a long press on touch) on an area, built on Base UI `ContextMenu`. Import: `@mattymroz/tessera/components/menu/context-menu`. The rows, groups, separators and submenus are the parts of [menu.md](menu.md).

## Parts

| Part                 | Base UI part                      | Notes                                                                                                                         |
| -------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ContextMenu`        | `ContextMenu.Root`                | state: `open`, `defaultOpen`, `onOpenChange`                                                                                  |
| `ContextMenuArea`    | `ContextMenu.Trigger`             | wraps the area that opens the menu; renders `display: contents`, so the children keep their own layout                        |
| `ContextMenuContent` | `Portal` → `Positioner` → `Popup` | takes `Menu.Popup` props; the same popup as `MenuContent` (`data-variant="context"`); rows from `menu.tsx` go inside directly |

`ContextMenuArea` and `ContextMenuContent` outside `ContextMenu` throw while rendering (`useHost` of `lib/slot.ts`).

## Behaviour

- The edge of the first row stands at the pointer: the positioner has no side and no align offset, and the `surface` recipe moves the popup back by `--ts-shape-inset` (up and to the start; down when the menu opens above the pointer, to the end when it opens before it). Near an edge of the window Base UI flips and shifts it inside.
- The popup takes the subtree axes of the area (`lib/scope.ts`), as a menu takes them from its trigger.
- Base UI makes a context menu modal: while it is open the page does not scroll and the rest of the page is inert.
- Everything else (pill, keyboard, submenus, column of text, no entry or exit animation) is the behaviour of [menu.md](menu.md).

## Example

```tsx
import { ContextMenu, ContextMenuArea, ContextMenuContent } from '@mattymroz/tessera/components/menu/context-menu'
import { MenuItem, MenuSeparator } from '@mattymroz/tessera/components/menu/menu'

<ContextMenu>
  <ContextMenuArea>
    <Page />
  </ContextMenuArea>
  <ContextMenuContent>
    <MenuItem trail="Ctrl+C">Copy</MenuItem>
    <MenuSeparator />
    <MenuItem tone="danger">Delete page</MenuItem>
  </ContextMenuContent>
</ContextMenu>
```
