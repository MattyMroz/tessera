import { Button } from '@mattymroz/tessera/components/button/button'
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogDismiss,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@mattymroz/tessera/components/dialog/dialog'
import { Input } from '@mattymroz/tessera/components/input/input'
import { Popover, PopoverDescription, PopoverPopup, PopoverTrigger } from '@mattymroz/tessera/components/popover/popover'

export function DialogSection() {
  return (
    <section aria-labelledby="dialog-title" className="flex flex-col gap-group">
      <h2 id="dialog-title">Dialog</h2>
      <div className="flex flex-wrap items-center gap-inset">
        <Dialog>
          <DialogTrigger variant="outline">Chapter info</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Chapter 12</DialogTitle>
            <DialogDescription>24 pages, translated on 1 November and waiting for review.</DialogDescription>
            <DialogDismiss aria-label="Close" />
          </DialogPopup>
        </Dialog>
        <Dialog>
          <DialogTrigger variant="outline">Delete page</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Delete page 3?</DialogTitle>
            <DialogDescription>The page and its translations are removed from the chapter.</DialogDescription>
            <DialogActions>
              <DialogClose>Cancel</DialogClose>
              <DialogClose variant="solid">Delete</DialogClose>
            </DialogActions>
          </DialogPopup>
        </Dialog>
        <Dialog>
          <DialogTrigger variant="solid">Rename chapter</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Rename chapter</DialogTitle>
            <DialogDescription>The new name shows in the project tree.</DialogDescription>
            <Input aria-label="Chapter name" defaultValue="Chapter 12" />
            <DialogActions>
              <Popover>
                <PopoverTrigger>Help</PopoverTrigger>
                <PopoverPopup>
                  <PopoverDescription>A popover opened from a dialog is a first-level surface.</PopoverDescription>
                </PopoverPopup>
              </Popover>
              <DialogClose>Cancel</DialogClose>
              <DialogClose variant="solid">Save</DialogClose>
            </DialogActions>
          </DialogPopup>
        </Dialog>
        <Dialog>
          <DialogTrigger disabled>Disabled</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Never shown</DialogTitle>
          </DialogPopup>
        </Dialog>
      </div>
      <div data-recipe="surface" data-level="raised" data-surface="" data-inset="card" className="flex flex-wrap items-center gap-inset">
        <Dialog>
          <DialogTrigger variant="soft">From a card</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Share project</DialogTitle>
            <DialogDescription>Anyone with the link can view the chapters.</DialogDescription>
            <div className="flex items-center gap-inset">
              <Input aria-label="Link" defaultValue="mangashift.com/p/7f3a" readOnly />
              <Button variant="soft">Copy</Button>
            </div>
            <DialogActions>
              <DialogClose variant="solid">Done</DialogClose>
            </DialogActions>
          </DialogPopup>
        </Dialog>
      </div>
    </section>
  )
}
