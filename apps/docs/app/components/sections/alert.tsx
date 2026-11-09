'use client'

import { Alert } from '@mattymroz/tessera/components/alert/alert'
import { TONES } from '@mattymroz/tessera/lib/tone'
import CircleAlert from 'lucide-react/icons/circle-alert'
import Info from 'lucide-react/icons/info'
import { Group } from './group'

export function AlertSection() {
  return (
    <section aria-labelledby="alert-title" className="flex flex-col gap-group">
      <h2 id="alert-title">Alert</h2>
      <Group title="Tones with a title">
        <div className="flex max-w-xl flex-col gap-inset">
          {TONES.map((tone) => (
            <Alert key={tone} tone={tone} role="note" icon={<Info />} title={`${tone} title`}>
              {`A short description in the ${tone} tone.`}
            </Alert>
          ))}
        </div>
      </Group>
      <Group title="Without a title">
        <div className="flex max-w-xl flex-col gap-inset">
          <Alert tone="danger" icon={<CircleAlert />}>
            Enter a valid URL, for example http://127.0.0.1:8721.
          </Alert>
          <Alert role="status">The backend restarts in a moment.</Alert>
        </div>
      </Group>
    </section>
  )
}
