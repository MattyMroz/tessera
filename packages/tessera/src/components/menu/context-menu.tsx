'use client'

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { useState } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import { createScopeAnchor, ScopeContext } from '../../lib/scope'
import { useHost } from '../../lib/slot'
import type { Unstyled } from '../../lib/unstyled'
import { MenuPopup } from './menu'

export function ContextMenu(props: BaseContextMenu.Root.Props) {
  const [anchor] = useState(createScopeAnchor)
  return (
    <ScopeContext value={anchor}>
      <BaseContextMenu.Root {...props} />
    </ScopeContext>
  )
}

export function ContextMenuArea({ ref, ...props }: Unstyled<BaseContextMenu.Trigger.Props>) {
  const { register } = useHost(ScopeContext, 'ContextMenu', 'ContextMenuArea')
  return <BaseContextMenu.Trigger {...props} ref={composeRefs(ref, register)} data-component="context-menu" />
}

export function ContextMenuContent(props: Unstyled<BaseContextMenu.Popup.Props>) {
  const scope = useHost(ScopeContext, 'ContextMenu', 'ContextMenuContent')
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner sideOffset={0} alignOffset={0}>
        <MenuPopup {...props} scope={scope} place="context" />
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}
