'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { AlertDialog, AlertDialogTrigger, confirm } from '@mattymroz/tessera/components/dialog/alert-dialog'
import { DialogActions, DialogClose, DialogDescription, DialogPopup, DialogTitle } from '@mattymroz/tessera/components/dialog/dialog'
import { Text } from '@mattymroz/tessera/components/text/text'
import { useState } from 'react'
import { Group } from './group'

const SAVING = 600
const LONG_DESCRIPTION =
  'The project, its chapters, every translated page, the audio of each line and the whole history of versions are removed from this computer. Exported videos stay where you saved them.'

function wait(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function AlertDialogSection() {
  const [answer, setAnswer] = useState('none')
  const ask = async (question: Promise<boolean>): Promise<void> => setAnswer(String(await question))

  return (
    <section aria-labelledby="alert-dialog-title" className="flex flex-col gap-group">
      <h2 id="alert-dialog-title">Alert dialog</h2>
      <Group title="confirm()">
        <div className="flex flex-wrap items-center gap-inset">
          <Button
            variant="outline"
            onClick={() => void ask(confirm({ title: 'Discard changes?', description: 'Your edits to page 3 are lost.', confirmLabel: 'Discard', cancelLabel: 'Cancel' }))}
          >
            Discard
          </Button>
        </div>
      </Group>
      <Group title="Danger, a long description and a slow action">
        <div className="flex flex-wrap items-center gap-inset">
          <Button
            variant="outline"
            onClick={() =>
              void ask(
                confirm({
                  title: 'Delete project?',
                  description: LONG_DESCRIPTION,
                  tone: 'danger',
                  confirmLabel: 'Delete',
                  cancelLabel: 'Cancel',
                  onConfirm: () => wait(SAVING),
                }),
              )
            }
          >
            Delete project
          </Button>
        </div>
      </Group>
      <Group title="An action that fails once">
        <div className="flex flex-wrap items-center gap-inset">
          <Button
            variant="outline"
            onClick={() => {
              let tries = 0
              void ask(
                confirm({
                  title: 'Reset shortcuts?',
                  tone: 'danger',
                  confirmLabel: 'Reset',
                  cancelLabel: 'Keep',
                  onConfirm: async () => {
                    tries += 1
                    await wait(SAVING)
                    if (tries === 1) throw new Error('The settings file is locked. Close the other window and try again.')
                  },
                }),
              )
            }}
          >
            Reset shortcuts
          </Button>
        </div>
      </Group>
      <Group title="Built from the dialog parts">
        <div className="flex flex-wrap items-center gap-inset">
          <AlertDialog>
            <AlertDialogTrigger variant="outline">Custom</AlertDialogTrigger>
            <DialogPopup>
              <DialogTitle>Leave the editor?</DialogTitle>
              <DialogDescription>A custom alert dialog built from the dialog parts.</DialogDescription>
              <DialogActions>
                <DialogClose>Stay</DialogClose>
                <DialogClose variant="solid">Leave</DialogClose>
              </DialogActions>
            </DialogPopup>
          </AlertDialog>
        </div>
      </Group>
      <Text as="p" variant="description" data-testid="confirm-answer">
        {`Answer: ${answer}`}
      </Text>
    </section>
  )
}
