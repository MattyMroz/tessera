'use client'

import { Button, type ButtonVariant } from '@mattymroz/tessera/components/button/button'
import { Input } from '@mattymroz/tessera/components/input/input'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { TONES } from '@mattymroz/tessera/lib/tone'
import ArrowRight from 'lucide-react/icons/arrow-right'
import ChevronDown from 'lucide-react/icons/chevron-down'
import Plus from 'lucide-react/icons/plus'
import Upload from 'lucide-react/icons/upload'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Group } from './group'

const VARIANTS: readonly ButtonVariant[] = ['solid', 'soft', 'outline', 'raised', 'ghost']

function BlockedActivation() {
  const [clicks, setClicks] = useState(0)
  const [submits, setSubmits] = useState(0)
  const [busy, setBusy] = useState(false)
  const click = (): void => setClicks((count) => count + 1)
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setSubmits((count) => count + 1)
  }
  return (
    <form aria-label="Blocked activation" onSubmit={submit} className="flex flex-wrap items-center gap-inset">
      <Input aria-label="Chapter title" defaultValue="Chapter 1" />
      <Button type="submit" variant="solid" busy onClick={click}>
        Busy submit
      </Button>
      <Button type="submit" aria-disabled="true" onClick={click}>
        Disabled submit
      </Button>
      <Button href="#blocked" busy onClick={click}>
        Busy link
      </Button>
      <Button href="#blocked" aria-disabled onClick={click}>
        Disabled link
      </Button>
      <Button type="submit" variant="outline" onClick={click}>
        Submit
      </Button>
      <Button variant="soft" aria-pressed={busy} onClick={() => setBusy((current) => !current)}>
        Work
      </Button>
      <Button variant="solid" busy={busy} icon={<Upload />}>
        Upload
      </Button>
      <Button variant="soft" busy={busy} iconEnd={<ChevronDown />}>
        Upload chapter
      </Button>
      <output aria-label="Clicks">{clicks}</output>
      <output aria-label="Submits">{submits}</output>
    </form>
  )
}

export function ButtonSection() {
  return (
    <section aria-labelledby="button-title" className="flex flex-col gap-group">
      <h2 id="button-title">Button</h2>
      <Group title="Variants">
        <div className="flex flex-wrap items-center gap-inset">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </Group>
      <Group title="Tones">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-inset">
            {TONES.map((tone) => (
              <Button key={tone} variant={variant} tone={tone}>
                {tone}
              </Button>
            ))}
          </div>
        ))}
      </Group>
      <Group title="Icons">
        <div className="flex flex-wrap items-center gap-inset">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} icon={<Plus />} iconEnd={<ChevronDown />}>
              New
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-inset">
          {VARIANTS.map((variant) => (
            <Button key={`${variant}-icon`} variant={variant} aria-label={`Add (${variant})`} icon={<Plus />} />
          ))}
        </div>
      </Group>
      <Group title="Sizes">
        <div className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Button key={size} variant="soft" size={size} icon={<Plus />}>
              {size}
            </Button>
          ))}
        </div>
        <div role="group" aria-label="Least width" className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Button key={size} variant="outline" size={size}>
              OK
            </Button>
          ))}
        </div>
        <div role="group" aria-label="Hug" className="flex flex-wrap items-end gap-inset">
          {THEME_CONFIG.axes.size.map((size) => (
            <Button key={size} variant="outline" size={size} hug>
              OK
            </Button>
          ))}
        </div>
      </Group>
      <Group title="States">
        <div className="flex flex-wrap items-center gap-inset">
          <Button variant="solid" busy icon={<Plus />}>
            Saving
          </Button>
          <Button variant="outline" busy aria-label="Saving" icon={<Plus />} />
          <Button variant="outline" busy icon={<Plus />} iconEnd={<ChevronDown />}>
            Exporting
          </Button>
          <Button variant="soft" busy>
            Loading
          </Button>
          <Button variant="soft" aria-pressed="true">
            Pressed
          </Button>
          <Button variant="solid" tone="neutral">
            Inverse
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-inset">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              Disabled
            </Button>
          ))}
        </div>
      </Group>
      <Group title="Blocked activation">
        <BlockedActivation />
      </Group>
      <Group title="Links">
        <nav aria-label="Button links" className="flex flex-wrap items-center gap-inset">
          <Button href="#button-title" variant="solid" iconEnd={<ArrowRight />}>
            Get started
          </Button>
          <Button href="/screens/edges" link={Link} variant="ghost" iconEnd={<ArrowRight />}>
            Edges screen
          </Button>
          <Button href="#button-title" aria-label="Back to the button title" icon={<ArrowRight />} />
        </nav>
      </Group>
      <Group title="In a card">
        <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              In a card
            </Button>
          ))}
          <Button aria-label="Add in a card" icon={<Plus />} />
        </div>
      </Group>
    </section>
  )
}
