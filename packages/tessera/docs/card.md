# Card

A surface of the `surface` recipe that groups content, with an optional header and actions. Import: `@mattymroz/tessera/components/card/card`.

## Parts

| Part          | Props                                                                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`        | `level?: 'raised' \| 'base'` (default `'raised'`), `container?: boolean`, `href?: string`, `children` | the host of the slots below; `raised`: background and shadow of the `raised` depth level, without a border; `base` for a card straight on a page without an island; `container` makes the card a size container, so its actions and fields react to the width of the card; a container takes no width from its content, so such a card needs its width from the layout of its parent (a block, a grid cell, a stretched flex item); `href` renders the card as a link |
| `CardHeader`  | `title: ReactNode`, `level: 1 \| 2 \| 3 \| 4`, `description?: ReactNode`, `action?: ReactNode`        | slot `header`; the title is a `Heading` of the given level, the description a `Text` `description`, the action a slot at the end of the title; its own parts are props, so they cannot stand anywhere else                                                                                                                                                                                                                                                            |
| `CardActions` | `children`                                                                                            | slot `actions` of the `surface` recipe: the buttons at the end, in a column in a narrow container; the same rule as `DialogActions` and `PopoverActions`                                                                                                                                                                                                                                                                                                              |

Every other `<div>` (or `<a>`) prop of `Card` reaches the element. The parts take no `className` or `style`.

## Slots

`Card` takes `CardHeader`, any content, `CardActions` in this order. A part outside `Card` or inside another part (`CardActions` as the `action` of `CardHeader`, `CardHeader` in `CardActions`) throws while rendering; slots out of order throw when the card mounts and after every render (`lib/slot.ts`, the same model as [Dialog](dialog.md#slots)).

## Overflow

- Title, description and text: wrap and break a word longer than the line anywhere (a URL, a path, a hash).
- The action of the header and the buttons of `CardActions`: one line with an ellipsis; both slots may shrink below the width of their labels (`min-inline-size: 0` in the `surface` recipe), so a long label never widens the card. The buttons of `CardActions` (and of `DialogActions`, `PopoverActions`) wrap to a new line at the end when they do not fit, so a button never sticks out of a narrow card.
- A card never grows wider than its parent.

## Rendered attributes

- `<div data-component="card" data-recipe="surface" data-level="raised" data-surface="" data-inset="card">`; `data-container` with `container`. A card with `href` is `<a href>` with the same attributes and `data-focus="outer"`.
- `CardHeader`: `<div data-slot="header">` with the `Heading` (`data-slot="title"`), the `Text` (`data-slot="description"`) and `<div data-slot="action">`. `card.css` lays the header out as a wrapping flex row: the action stands in the top-end corner on the line of the title and centres the title on it, the description goes under them (`order: 1`, full width). The title never gets narrower than `min(--ts-type-measure-min, 100%)` (12 ch of the title font, `type` engine); when the title at that width and the action do not fit on one line, the action goes to the next line, so in a narrow card the title takes the full width, without a container query.
- The radius of the card is concentric with its parent (`data-surface`); the padding is `--ts-shape-inset`: `--ts-space-card` of the density plus a quarter of the round radius, the same on all four sides, measured from the trimmed first and last line of text. The padding of a card is 16 px or more at every density, so the controls inside it, also the one in the corner action, keep their own radius (`--ts-shape-control-radius` and `--ts-shape-concentric` of the `shape` engine give the own radius from 16 px of offset; concentric radii belong to tight wrappers only).
- A card with `Field` children is a two-column grid: the fields share its columns (`subgrid`), so every control starts on one line and has one width; header and actions span both columns. Other content of such a card belongs in the header or the actions.

## Behaviour

- No border in any mode; a card stands out by its fill and the shadow of its level. In forced colors the browser forces the transparent border into a visible line.
- A card with `href` is one link: its name is the whole text of the card. Put no button, link or field inside a card link, because interactive content inside `<a>` is invalid HTML and a screen reader cannot reach it; a card with actions is a plain `Card` with a `Button href` inside.
- The focus ring of a card link is the ring of the `focus` recipe over the shadow of the level, which stays under the ring.
- No glass (`backdrop-filter`) on a card, also with `material: translucent` (W10).

## Example

```tsx
import { Button } from '@mattymroz/tessera/components/button/button'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Text } from '@mattymroz/tessera/components/text/text'

<Card>
  <CardHeader level={3} title="Invite your team" description="Translators join with their own roles." />
  <Text as="p">Everyone you invite sees the chapters you share.</Text>
  <CardActions>
    <Button>Later</Button>
    <Button variant="solid">Copy link</Button>
  </CardActions>
</Card>
<Card href="/chapters/12">
  <CardHeader level={3} title="Chapter 12" description="24 pages" />
</Card>
```
