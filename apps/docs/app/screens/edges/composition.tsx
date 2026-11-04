import { Button } from '@mattymroz/tessera/components/button/button'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogDismiss,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@mattymroz/tessera/components/dialog/dialog'
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverDismiss,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import { BlockedSample } from './blocked'

const CORNERS = ['none', 'md', 'full'] as const
const SIZES = ['sm', 'lg'] as const

export function CompositionSample() {
  return (
    <>
      <div className="grid grid-cols-1 gap-group md:grid-cols-3">
        {CORNERS.flatMap((corners) =>
          SIZES.map((size) => (
            <div key={`${corners}-${size}`} data-corners={corners} data-size={size} className="flex flex-col items-start gap-inset">
              <Card data-testid={`composed-card-${corners}-${size}`}>
                <CardHeader level={3} title="Delete page 3?" />
                <CardActions>
                  <Button>Cancel</Button>
                  <Button variant="solid">Delete</Button>
                </CardActions>
              </Card>
              <Popover>
                <PopoverTrigger variant="outline">{`Composed popover ${corners} ${size}`}</PopoverTrigger>
                <PopoverPopup>
                  <PopoverTitle>Delete page 3?</PopoverTitle>
                  <PopoverActions>
                    <PopoverClose>Cancel</PopoverClose>
                    <PopoverClose variant="solid">Delete</PopoverClose>
                  </PopoverActions>
                  <PopoverDismiss aria-label="Close" />
                </PopoverPopup>
              </Popover>
            </div>
          )),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-inset">
        <Dialog>
          <DialogTrigger variant="outline">Composed dialog</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Delete page 3?</DialogTitle>
            <DialogActions>
              <DialogClose>Cancel</DialogClose>
              <DialogClose variant="solid">Delete</DialogClose>
            </DialogActions>
            <DialogDismiss aria-label="Close" />
          </DialogPopup>
        </Dialog>
        <BlockedSample />
      </div>
    </>
  )
}
