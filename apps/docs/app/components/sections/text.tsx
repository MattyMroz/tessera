import { Input } from '@mattymroz/tessera/components/input/input'
import { Heading } from '@mattymroz/tessera/components/text/heading'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Group } from './group'

export function TextSection() {
  return (
    <section aria-labelledby="text-title" className="flex flex-col gap-group">
      <h2 id="text-title">Text</h2>
      <Group title="Headings">
        <Heading level={2} variant="display" data-testid="heading-level-2">
          Chapter 12
        </Heading>
        <Heading level={3}>Bubble style</Heading>
      </Group>
      <Group title="Description">
        <Text as="p" variant="description">
          Pick the font and the outline of every bubble in this chapter.
        </Text>
      </Group>
      <Group title="Label, field and error">
        <Text as="label" variant="label" htmlFor="text-chapter-name">
          Chapter name
        </Text>
        <Input id="text-chapter-name" defaultValue="Chapter 12" aria-invalid="true" />
        <Text variant="error">The name is already taken.</Text>
      </Group>
      <Group title="Key in text">
        <Text>
          Export with <Text variant="kbd">Ctrl+Shift+E</Text>
        </Text>
      </Group>
      <Group title="Numbers">
        <Text variant="label" numeric>
          1,024 pages
        </Text>
      </Group>
    </section>
  )
}
