import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@mattymroz/tessera/components/dialog/dialog'
import { Edge, LONG } from '../edge'

export function DialogEdge() {
  return (
    <Edge data-edge-component="dialog" title="Dialog">
      <Dialog>
        <DialogTrigger variant="outline">A</DialogTrigger>
        <DialogPopup>
          <DialogTitle>A</DialogTitle>
          <DialogActions>
            <DialogClose variant="solid">A</DialogClose>
          </DialogActions>
        </DialogPopup>
      </Dialog>
      <Dialog>
        <DialogTrigger variant="outline" data-edge-open="click">
          {LONG}
        </DialogTrigger>
        <DialogPopup>
          <DialogTitle>{LONG}</DialogTitle>
          <DialogDescription>{LONG}</DialogDescription>
          <DialogActions>
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="solid">{LONG}</DialogClose>
          </DialogActions>
        </DialogPopup>
      </Dialog>
    </Edge>
  )
}
