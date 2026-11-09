import { Textarea } from '@mattymroz/tessera/components/input/textarea'
import { Edge, LONG } from '../edge'

const WORD = 'Supercalifragilisticexpialidocious'.repeat(4)

export function TextareaEdge() {
  return (
    <Edge data-edge-component="textarea" title="Textarea">
      <Textarea aria-label="One character" defaultValue="A" />
      <Textarea aria-label="Long text" maxRows={3} defaultValue={`${LONG} ${LONG} ${LONG}`} />
      <Textarea aria-label="One long word" defaultValue={WORD} />
    </Edge>
  )
}
