# Alert

A message on a surface in the color of its tone. Import: `@mattymroz/tessera/components/alert/alert`.

## Props

| Prop       | Type                                                                    | Default     | Notes                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`     | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning' \| 'info'` | `'neutral'` | sets `data-tone` of the `surface` recipe: the background mixes the tone into the surface, without a border and without a line at the side           |
| `icon`     | `ReactNode`                                                             | —           | an icon in `<span data-slot="icon">`, in the color of the tone, at the first line                                                                   |
| `title`    | `ReactNode`                                                             | —           | optional: most alerts of the desktop have the description only                                                                                      |
| `role`     | `'alert' \| 'status' \| 'note'`                                         | `'alert'`   | `alert` for an error that appears after an action, `status` for progress, `note` for a lasting hint that should not be read out when the page loads |
| `children` | `ReactNode`                                                             | —           | the description                                                                                                                                     |

Every other `<div>` prop reaches the element. Alert takes no `className` or `style`.

## Rendered attributes

`<div role data-component="alert" data-recipe="surface" data-surface="" data-inset="card-small" data-tone>`: the padding is `--ts-shape-inset` (`--ts-space-card-small` of the density plus a quarter of the round radius) on all four sides, measured from the trimmed first and last line of text and from the icon, and the radius is concentric with the parent like a card. The title is a `Text` `label` (`data-slot="title"`); the description is a `Text` `description` under a title, or body text without one (`data-slot="description"`). `alert.css` puts the icon in its own column beside the title and the description; the `surface` recipe gives the icon slot and the glyph the size of an icon (`SURFACE_ICON_GLYPH`), so the icon starts in the corner of the content, and the `text` recipe moves the first line down by `--ts-size-icon-cap-pad`, so its capitals are centred on the icon.

## Behaviour

- No border and no line at the side (W12, W14); the tone shows in the background and in the icon. No neon.
- An alert does not appear with motion.
- In forced colors the tint is replaced by the system background and the browser draws the transparent border; the icon and the text tell the tone.
- Inside a popup the tint mixes into the background of the alert, not of the popup.

## Overflow

The title and the description wrap and break a word longer than the line anywhere (a URL, a Windows path, a hash: `overflow-wrap: anywhere` of the `surface` and `text` recipes); the icon keeps its size and its column. An alert is never wider than its parent.

## Example

```tsx
import { Alert } from '@mattymroz/tessera/components/alert/alert'
import CircleAlert from 'lucide-react/icons/circle-alert'

<Alert tone="danger" icon={<CircleAlert />}>Enter a valid URL.</Alert>
<Alert role="note" title="How shortcuts work">Press the keys you want to use.</Alert>
```
