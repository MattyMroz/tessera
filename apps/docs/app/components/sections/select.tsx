'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Card } from '@mattymroz/tessera/components/card/card'
import type { MarkKind } from '@mattymroz/tessera/components/checkbox/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  type SelectAlign,
} from '@mattymroz/tessera/components/select/select'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Group } from './group'

const FONTS = { inter: 'Inter', noto: 'Noto Sans', roboto: 'Roboto', cascadia: 'Cascadia Mono', system: 'System' } as const

const MODELS = { opus: 'Opus 5.5', gpt: 'GPT-6.1 Sol', haiku: 'Haiku 4.5', qwen: 'Qwen3.5 9B' } as const

const PRICES = { opus: '$0.0126', gpt: '$0.0048', haiku: '$0.0007', qwen: '$0.0019' } as const

const CLOUD = ['opus', 'gpt', 'haiku'] as const

function FontSelect({ align, mark = 'check', size }: { align: SelectAlign; mark?: MarkKind; size?: (typeof THEME_CONFIG.axes.size)[number] }) {
  return (
    <Select defaultValue="roboto" {...(size === undefined ? {} : { size })}>
      <SelectTrigger variant="soft" aria-label="Font" placeholder="Font" labels={FONTS} />
      <SelectContent align={align} mark={mark}>
        {Object.entries(FONTS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ModelSelect({ align, value }: { align: SelectAlign; value: keyof typeof MODELS }) {
  return (
    <Select defaultValue={value} size="sm">
      <SelectTrigger variant="outline" aria-label="Model" placeholder="Model" labels={MODELS} />
      <SelectContent align={align}>
        <SelectGroup>
          <SelectGroupLabel>Cloud</SelectGroupLabel>
          {CLOUD.map((model) => (
            <SelectItem key={model} value={model} trail={PRICES[model]}>
              {MODELS[model]}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Local</SelectGroupLabel>
          <SelectItem value="qwen" trail={PRICES.qwen}>
            {MODELS.qwen}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function SelectSection() {
  return (
    <section aria-labelledby="select-title" className="flex flex-col gap-group">
      <h2 id="select-title">Select</h2>
      <Group title="On the trigger in every size">
        <div className="flex flex-wrap items-center gap-group">
          {THEME_CONFIG.axes.size.map((size) => (
            <FontSelect key={size} align="trigger" size={size} />
          ))}
        </div>
      </Group>
      <Group title="Below and above">
        <div className="flex flex-wrap items-center gap-group">
          <FontSelect align="bottom" />
          <FontSelect align="top" />
        </div>
      </Group>
      <Group title="Check and dot">
        <div className="flex flex-wrap items-center gap-group">
          <FontSelect align="trigger" mark="check" />
          <FontSelect align="trigger" mark="dot" />
        </div>
      </Group>
      <Group title="Groups and trails in a card row">
        <Card>
          <div className="flex flex-wrap items-center gap-group">
            <span>Fallback if</span>
            <ModelSelect align="top" value="opus" />
            <span>fails, retry on</span>
            <ModelSelect align="trigger" value="gpt" />
            <Button variant="solid" size="sm">
              Deploy policy
            </Button>
          </div>
        </Card>
      </Group>
    </section>
  )
}
