# Badge

A static label of a status or a count, as a `<span>` of the `control` recipe. Import: `@mattymroz/tessera/components/badge/badge`.

## Props

| Prop       | Type                                                                    | Default   | Notes                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `'soft' \| 'outline' \| 'solid' \| 'ghost'` (the list `BADGE_VARIANTS`) | `'soft'`  | the variants of the `control` recipe; `ghost` is a status without a background: a dot and the text in the color of the tone                                                                         |
| `tone`     | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning' \| 'info'` | —         | sets `data-tone`; `soft`, `outline` and `ghost` write in the tone, `solid` fills with it                                                                                                            |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                  | inherited | sets `data-size`; without it the badge takes the size around it (the nearest `data-size`), so a badge beside a `lg` button is as tall as the button; in a menu row or a tooltip give a smaller step |
| `numeric`  | `boolean`                                                               | `false`   | a count: tabular figures and the side padding of an icon side, so one digit makes a circle and more digits a capsule                                                                                |
| `dot`      | `boolean`                                                               | `false`   | a status dot before the text: the lucide `CircleSmall` glyph filled with `currentColor`, so it takes the color of the tone; there is no other color                                                 |
| `children` | `ReactNode`                                                             | —         | the text                                                                                                                                                                                            |

Every other `<span>` prop reaches the element. Badge takes no `className` or `style`.

## Rendered attributes

`<span data-recipe="control" data-variant data-tone data-size data-numeric>`, the dot in `<span data-slot="icon" data-dot>` (the `control` recipe fills its `<svg>`), the text in `<span data-slot="label">` (one line, an ellipsis on overflow). Up to 3 DOM nodes.

## Behaviour

- Static: no hover, no press, no `pointer` cursor and no focus. A badge is not a link or a button; an action belongs to a `Button`.
- In a tooltip the label and the state ink of a neutral badge are `currentColor`, so the badge takes the color of the tooltip text and stays readable on the dark tooltip in both modes.
- With a coarse pointer a badge keeps the height of its step: the 24 px minimum of touch belongs to interactive controls only.
- A dot without text needs a text for a screen reader beside it; `aria-label` on a `<span>` without a role is not read.
- In forced colors the tint and the dot color are replaced by the system colors; the text tells the status.

## Overflow

A badge is never wider than its parent (`max-inline-size: 100%` of the `control` recipe): a long text or a long number ends with an ellipsis on one line; the dot keeps its size.

## Example

```tsx
import { Badge } from '@mattymroz/tessera/components/badge/badge'

<Badge variant="ghost" tone="success" dot>Running</Badge>
<Badge numeric>3</Badge>
<Badge tone="warning">Modified</Badge>
```
