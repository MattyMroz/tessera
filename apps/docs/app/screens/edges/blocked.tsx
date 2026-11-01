'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Component, type ReactNode } from 'react'

type BlockedState = { readonly message: string | null }

class Blocked extends Component<{ readonly children: ReactNode }, BlockedState> {
  override state: BlockedState = { message: null }

  static getDerivedStateFromError(error: unknown): BlockedState {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  override render() {
    if (this.state.message === null) return this.props.children
    return (
      <Text as="p" variant="error" data-testid="blocked">
        {this.state.message}
      </Text>
    )
  }
}

export function BlockedSample() {
  return (
    <>
      <Popover>
        <PopoverTrigger variant="outline">Actions before the title</PopoverTrigger>
        <Blocked>
          <PopoverPopup>
            <PopoverActions>
              <PopoverClose variant="solid">Delete</PopoverClose>
            </PopoverActions>
            <PopoverTitle>Delete page 3?</PopoverTitle>
          </PopoverPopup>
        </Blocked>
      </Popover>
      <Popover>
        <PopoverTrigger variant="outline">A title in the actions</PopoverTrigger>
        <Blocked>
          <PopoverPopup>
            <PopoverActions>
              <PopoverTitle>Delete page 3?</PopoverTitle>
              <Button variant="solid">Delete</Button>
            </PopoverActions>
          </PopoverPopup>
        </Blocked>
      </Popover>
    </>
  )
}
