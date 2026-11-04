import { ToggleGroup, ToggleGroupItem, type ToggleGroupVariant } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import LayoutGrid from 'lucide-react/icons/layout-grid'
import List from 'lucide-react/icons/list'
import TextAlignCenter from 'lucide-react/icons/text-align-center'
import TextAlignEnd from 'lucide-react/icons/text-align-end'
import TextAlignStart from 'lucide-react/icons/text-align-start'

const VARIANTS: readonly ToggleGroupVariant[] = ['raised', 'active']
const RANGES = ['Day', 'Week', 'Month'] as const
const COUNTS: readonly (readonly [string, ...string[]])[] = [
  ['On', 'Off'],
  ['Day', 'Week', 'Month'],
  ['XS', 'S', 'M', 'L'],
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
]
const WIDTHS = ['A', 'Medium', 'A much longer label', 'B'] as const
const LETTERS = ['1', '2', '3', '4'] as const
const VIEWS = ['Original', 'Translated', 'Side by side'] as const

export function ToggleGroupSection() {
  return (
    <section aria-labelledby="toggle-group-title" className="flex flex-col gap-group">
      <h2 id="toggle-group-title">Toggle group</h2>
      <div className="flex flex-wrap items-center gap-group">
        {VARIANTS.map((variant) => (
          <ToggleGroup key={variant} aria-label={`Range (${variant})`} variant={variant} defaultValue="Day">
            {RANGES.map((range) => (
              <ToggleGroupItem key={range} value={range}>
                {range}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-group">
        {THEME_CONFIG.axes.size.map((size) => (
          <ToggleGroup key={size} aria-label={`Range (${size})`} size={size} defaultValue="Week">
            {RANGES.map((range) => (
              <ToggleGroupItem key={range} value={range}>
                {range}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-group">
        {COUNTS.map((labels) => (
          <ToggleGroup key={labels.length} aria-label={`${labels.length} options`} defaultValue={labels[0]}>
            {labels.map((label) => (
              <ToggleGroupItem key={label} value={label}>
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-group">
        <ToggleGroup aria-label="Different widths" defaultValue="Medium">
          {WIDTHS.map((label) => (
            <ToggleGroupItem key={label} value={label}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup aria-label="View" defaultValue="list">
          <ToggleGroupItem value="list" icon={<List />}>
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" icon={<LayoutGrid />}>
            Grid
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Alignment" defaultValue="left">
          <ToggleGroupItem value="left" aria-label="Left" icon={<TextAlignStart />} />
          <ToggleGroupItem value="centre" aria-label="Centre" icon={<TextAlignCenter />} />
          <ToggleGroupItem value="right" aria-label="Right" icon={<TextAlignEnd />} />
        </ToggleGroup>
        <ToggleGroup aria-label="With a disabled option" defaultValue="Day">
          <ToggleGroupItem value="Day">Day</ToggleGroupItem>
          <ToggleGroupItem value="Week" disabled>
            Week
          </ToggleGroupItem>
          <ToggleGroupItem value="Month">Month</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Chosen option disabled" defaultValue="Day">
          <ToggleGroupItem value="Day" disabled>
            Day
          </ToggleGroupItem>
          <ToggleGroupItem value="Week">Week</ToggleGroupItem>
          <ToggleGroupItem value="Month">Month</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Nothing chosen yet">
          {RANGES.map((range) => (
            <ToggleGroupItem key={range} value={range}>
              {range}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup aria-label="One character" defaultValue="1">
          {LETTERS.map((letter) => (
            <ToggleGroupItem key={letter} value={letter}>
              {letter}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="w-48">
        <ToggleGroup aria-label="In a narrow container" defaultValue="Original">
          {VIEWS.map((view) => (
            <ToggleGroupItem key={view} value={view}>
              {view}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-group">
        {VARIANTS.map((variant) => (
          <ToggleGroup key={variant} aria-label={`Range in a card (${variant})`} variant={variant} defaultValue="Month">
            {RANGES.map((range) => (
              <ToggleGroupItem key={range} value={range}>
                {range}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ))}
      </div>
    </section>
  )
}
