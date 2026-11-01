import { Button } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import Search from 'lucide-react/icons/search'
import X from 'lucide-react/icons/x'

export function InputSection() {
  return (
    <section aria-labelledby="input-title" className="flex flex-col gap-group">
      <h2 id="input-title">Input</h2>
      <div className="flex flex-wrap items-center gap-inset">
        <Input aria-label="Name" placeholder="Name" />
        <Input aria-label="Chapter" defaultValue="Chapter 12" />
        <Input aria-label="Search" placeholder="Search" start={<Search />} end={<Button size="sm" aria-label="Clear search" icon={<X />} />} />
      </div>
      <div className="flex flex-wrap items-end gap-inset">
        {THEME_CONFIG.axes.size.map((size) => (
          <Input key={size} size={size} aria-label={`Size ${size}`} placeholder={size} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-inset">
        <Input aria-label="Disabled" placeholder="Disabled" disabled />
        <Input aria-label="Disabled with value" defaultValue="Read only value" disabled />
        <Input aria-label="Read only" defaultValue="Read only" readOnly />
        <Input aria-label="E-mail" type="email" placeholder="name@example.com" />
        <Input aria-label="Invalid" defaultValue="Wrong value" aria-invalid="true" />
      </div>
      <div className="flex flex-wrap items-center gap-inset">
        <Input aria-label="Project name" placeholder="Project name" />
        <Button variant="solid">Create</Button>
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
        <Input aria-label="Name in a card" placeholder="Name" />
        <Button variant="solid">Save</Button>
      </div>
    </section>
  )
}
