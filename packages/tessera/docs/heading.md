# Heading

Heading of a page, a section or a popup, styled by the `text` recipe. The level is the place in the document outline, not a size: the look comes from the variant. Import: `@mattymroz/tessera/components/text/heading`.

## Props

| Prop       | Type                   | Default   | Notes                |
| ---------- | ---------------------- | --------- | -------------------- |
| `level`    | `1 \| 2 \| 3 \| 4`     | required  | renders `h1` to `h4` |
| `variant`  | `'title' \| 'display'` | `'title'` | sets `data-variant`  |
| `children` | `ReactNode`            | —         | the heading text     |

Every other heading attribute reaches the element. The heading takes no `className` or `style`: the parent lays it out.

## Rendered attributes

`<h1>`…`<h4>` with `data-recipe="text"` and `data-variant`.

## Variants

- `title`: the `title` step in the `heading` family, semibold.
- `display`: the `display` step in the `heading` family, semibold.

Both trim the box to the capitals and the baseline (`text-box: trim-both cap alphabetic`), so the heading sits on its gap without the empty line space above and below, and balance their lines (`text-wrap: balance`).

## Overflow

A heading wraps, and a word longer than the line (a URL, a path, a long compound word) breaks anywhere (`overflow-wrap: anywhere` of the `text` recipe), so it never leaves its parent. The trimmed box lets the accents and descenders of the first and the last line reach past it, by design.

## Example

```tsx
import { Heading } from '@mattymroz/tessera/components/text/heading'

<Heading level={1} variant="display">Chapter 12</Heading>
<Heading level={2}>Bubble style</Heading>
```
