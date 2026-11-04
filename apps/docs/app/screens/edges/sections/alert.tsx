import { Alert } from '@mattymroz/tessera/components/alert/alert'
import CircleAlert from 'lucide-react/icons/circle-alert'
import { Edge, LONG } from '../edge'

export function AlertEdge() {
  return (
    <Edge data-edge-component="alert" title="Alert">
      <Alert role="note">A</Alert>
      <Alert tone="danger" icon={<CircleAlert />} title={LONG}>
        {LONG}
      </Alert>
      <Alert tone="info" role="status" icon={<CircleAlert />}>
        {LONG}
      </Alert>
    </Edge>
  )
}
