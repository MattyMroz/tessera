import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import Search from 'lucide-react/icons/search'
import X from 'lucide-react/icons/x'
import { Group } from './group'

export function InputSection() {
  return (
    <section aria-labelledby="input-title" className="flex flex-col gap-group">
      <h2 id="input-title">Input</h2>
      <Group title="Placeholder">
        <div className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Name" placeholder="Name" />
        </div>
      </Group>
      <Group title="Value">
        <div className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Chapter" defaultValue="Chapter 12" />
        </div>
      </Group>
      <Group title="Icon at the start, button at the end">
        <div className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Search" placeholder="Search" start={<Search />} end={<Button size="sm" aria-label="Clear search" icon={<X />} />} />
        </div>
      </Group>
      <Group title="Sizes">
        <div className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Input key={size} size={size} aria-label={`Size ${size}`} placeholder={size} />
          ))}
        </div>
      </Group>
      <Group title="States">
        <div className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Disabled" placeholder="Disabled" disabled />
          <Input aria-label="Disabled with value" defaultValue="Read only value" disabled />
          <Input aria-label="Read only" defaultValue="Read only" readOnly />
          <Input aria-label="E-mail" type="email" placeholder="name@example.com" />
          <Input aria-label="Invalid" defaultValue="Wrong value" aria-invalid="true" />
        </div>
      </Group>
      <Group title="Next to a button">
        <div className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Project name" placeholder="Project name" />
          <Button variant="solid">Create</Button>
        </div>
      </Group>
      <Group title="In a card">
        <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
          <Input aria-label="Name in a card" placeholder="Name" />
          <Button variant="solid">Save</Button>
        </div>
      </Group>
    </section>
  )
}
