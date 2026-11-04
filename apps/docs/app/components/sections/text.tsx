import { Input } from '@mattymroz/tessera/components/input/input'
import { Heading } from '@mattymroz/tessera/components/text/heading'
import { Text } from '@mattymroz/tessera/components/text/text'

export function TextSection() {
  return (
    <section aria-labelledby="text-title" className="flex flex-col gap-group">
      <h2 id="text-title">Text</h2>
      <div className="flex flex-col gap-inset">
        <Heading level={2} variant="display" data-testid="heading-level-2">
          Chapter 12
        </Heading>
        <Heading level={3}>Bubble style</Heading>
        <Text as="p" variant="description">
          Pick the font and the outline of every bubble in this chapter.
        </Text>
        <Text as="label" variant="label" htmlFor="text-chapter-name">
          Chapter name
        </Text>
        <Input id="text-chapter-name" defaultValue="Chapter 12" aria-invalid="true" />
        <Text variant="error">The name is already taken.</Text>
        <Text>
          Export with <Text variant="kbd">Ctrl+Shift+E</Text>
        </Text>
        <Text variant="label" numeric>
          1,024 pages
        </Text>
      </div>
    </section>
  )
}
