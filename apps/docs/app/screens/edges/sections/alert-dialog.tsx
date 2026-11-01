'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { confirm } from '@mattymroz/tessera/components/dialog/alert-dialog'
import { Edge, LONG } from '../edge'

export function AlertDialogEdge() {
  return (
    <Edge data-edge-component="alert-dialog" title="Alert dialog">
      <Button variant="outline" onClick={() => void confirm({ title: 'A', confirmLabel: 'A', cancelLabel: 'B' })}>
        A
      </Button>
      <Button
        variant="outline"
        data-edge-open="click"
        onClick={() => void confirm({ title: LONG, description: `${LONG}. ${LONG}.`, tone: 'danger', confirmLabel: LONG, cancelLabel: LONG })}
      >
        {LONG}
      </Button>
    </Edge>
  )
}
