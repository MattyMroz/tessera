import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, it } from 'vitest'
import { Card, CardActions, CardHeader } from '../components/card/card'
import { DialogActions, DialogDismiss, DialogTitle } from '../components/dialog/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/field/field'
import { MenuTrigger } from '../components/menu/menu'
import { PopoverActions, PopoverTitle, PopoverTrigger } from '../components/popover/popover'
import { ToggleGroupItem } from '../components/toggle-group/toggle-group'
import { misplacedSlot, SlotHost } from './slot'

const ORDER = ['title', 'description', null, 'actions', 'close'] as const

function render(element: ReactElement): string {
  return renderToString(element)
}

function inside(host: string, ...children: ReactElement[]): ReactElement {
  return createElement(SlotHost, { value: host }, ...children)
}

it('accepts the slots of a host in their order, with any content between, and slots it does not know as content', () => {
  expect(misplacedSlot('DialogPopup', ORDER, ['title', 'description', null, null, 'actions', 'close'])).toBeUndefined()
  expect(misplacedSlot('DialogPopup', ORDER, ['title', 'icon', 'actions'])).toBeUndefined()
  expect(misplacedSlot('DialogPopup', ORDER, [null, 'actions'])).toBeUndefined()
  expect(misplacedSlot('DialogPopup', ORDER, [])).toBeUndefined()
})

it.each([
  [['actions', 'title'], /title cannot come after the actions/],
  [['description', 'title'], /title cannot come after the description/],
  [['title', 'actions', null], /content cannot come after the actions/],
  [['close', 'actions'], /actions cannot come after the close/],
])('names the slot out of order in %j', (slots, message) => {
  expect(misplacedSlot('DialogPopup', ORDER, slots)).toMatch(message)
})

it('renders the parts of a card and a field inside their host', () => {
  const card = render(
    createElement(
      Card,
      null,
      createElement(CardHeader, { level: 3, title: 'Export' }),
      createElement(CardActions, null, createElement('button', null, 'Save')),
    ),
  )
  expect(card).toContain('data-slot="header"')
  expect(card).toContain('data-slot="actions"')
  const field = render(createElement(Field, null, createElement(FieldLabel, null, 'Name'), createElement(FieldDescription, null, 'Shown in the tree')))
  expect(field).toContain('data-slot="label"')
})

it.each([
  ['a dialog title outside its popup', () => createElement(DialogTitle, null, 'Rename'), /<DialogTitle> is a part of <DialogPopup>/],
  ['the actions of a dialog outside its popup', () => createElement(DialogActions, null, 'Save'), /<DialogActions> is a part of <DialogPopup>/],
  [
    'a dismiss button in the actions of a dialog',
    () => inside('DialogPopup', createElement(DialogActions, null, createElement(DialogDismiss, { 'aria-label': 'Close' }))),
    /<DialogDismiss> is a part of <DialogPopup>/,
  ],
  ['a popover title in a dialog', () => inside('DialogPopup', createElement(PopoverTitle, null, 'Notes')), /<PopoverTitle> is a part of <PopoverPopup>/],
  [
    'the actions of a popover in the actions of a popover',
    () => inside('PopoverPopup', createElement(PopoverActions, null, createElement(PopoverActions, null, 'Save'))),
    /<PopoverActions> is a part of <PopoverPopup>/,
  ],
  ['the actions of a card outside a card', () => createElement(CardActions, null, 'Save'), /<CardActions> is a part of <Card>/],
  [
    'the actions of a card in the action of its header',
    () => createElement(Card, null, createElement(CardHeader, { level: 3, title: 'Export', action: createElement(CardActions, null, 'Save') })),
    /<CardActions> is a part of <Card>/,
  ],
  [
    'a header of a card in its actions',
    () => createElement(Card, null, createElement(CardActions, null, createElement(CardHeader, { level: 3, title: 'Export' }))),
    /<CardHeader> is a part of <Card>/,
  ],
  [
    'a field error in the label of the field',
    () => createElement(Field, null, createElement(FieldLabel, null, createElement(FieldError, null, 'Required'))),
    /<FieldError> is a part of <Field>/,
  ],
  [
    'a field label in a card outside a field',
    () => createElement(Card, null, createElement(FieldLabel, null, 'Name')),
    /<FieldLabel> is a part of <Field>/,
  ],
  ['an option outside a toggle group', () => createElement(ToggleGroupItem, { value: 'day', children: 'Day' }), /<ToggleGroupItem> is a part of <ToggleGroup>: place it inside <ToggleGroup>\./],
  ['a popover trigger outside a popover', () => createElement(PopoverTrigger, null, 'Notes'), /<PopoverTrigger> is a part of <Popover>/],
  ['a menu trigger outside a menu', () => createElement(MenuTrigger, null, 'File'), /<MenuTrigger> is a part of <Menu>/],
])('refuses to render %s', (_, element, message) => {
  expect(() => render(element())).toThrow(message)
})
