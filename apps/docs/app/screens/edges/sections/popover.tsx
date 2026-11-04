import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import { Edge, LONG } from '../edge'

export function PopoverEdge() {
  return (
    <Edge data-edge-component="popover" title="Popover">
      <Popover>
        <PopoverTrigger variant="outline">A</PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>A</PopoverTitle>
        </PopoverPopup>
      </Popover>
      <Popover>
        <PopoverTrigger variant="outline" data-edge-open="click">
          {LONG}
        </PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>{LONG}</PopoverTitle>
          <PopoverDescription>{LONG}</PopoverDescription>
          <PopoverActions>
            <PopoverClose>Cancel</PopoverClose>
            <PopoverClose variant="solid">{LONG}</PopoverClose>
          </PopoverActions>
        </PopoverPopup>
      </Popover>
    </Edge>
  )
}
