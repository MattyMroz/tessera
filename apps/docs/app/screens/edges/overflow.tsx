import { Alert } from '@mattymroz/tessera/components/alert/alert'
import { Badge } from '@mattymroz/tessera/components/badge/badge'
import { Button } from '@mattymroz/tessera/components/button/button'
import { ButtonGroup } from '@mattymroz/tessera/components/button/button-group'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Checkbox } from '@mattymroz/tessera/components/checkbox/checkbox'
import { AlertDialog, AlertDialogTrigger } from '@mattymroz/tessera/components/dialog/alert-dialog'
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
import { Field, FieldDescription, FieldError, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'
import { Textarea } from '@mattymroz/tessera/components/input/textarea'
import { Kbd } from '@mattymroz/tessera/components/kbd/kbd'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@mattymroz/tessera/components/menu/menu'
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverDescription,
  PopoverDismiss,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@mattymroz/tessera/components/popover/popover'
import { Radio, RadioGroup } from '@mattymroz/tessera/components/radio/radio'
import { Switch } from '@mattymroz/tessera/components/switch/switch'
import { Heading } from '@mattymroz/tessera/components/text/heading'
import { Text } from '@mattymroz/tessera/components/text/text'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { Tooltip } from '@mattymroz/tessera/components/tooltip/tooltip'
import CircleAlert from 'lucide-react/icons/circle-alert'
import Link from 'lucide-react/icons/link'
import Plus from 'lucide-react/icons/plus'
import type { ReactNode } from 'react'

const ADDRESS = 'https://mangashift.com/projects/7f3a9c2e/chapters/0012/pages/0003/bubbles?highlight=translation-review&language=pl-PL'
const PATH = 'C:\\Users\\MattyMroz\\AppData\\Local\\MangaShift\\workspace\\projects\\7f3a9c2e\\chapters\\0012\\page-0003.webp'
const HASH = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const WORD = 'Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft'
const NUMBER = '123456789012345678901234567890'
const CASES = [
  ['url', ADDRESS],
  ['path', PATH],
  ['hash', HASH],
  ['word', WORD],
  ['number', NUMBER],
] as const
const TALL_LINES = 40
const TALL = Array.from({ length: TALL_LINES }, (_, index) => `Line ${index + 1} of a description far taller than a small window.`).join(' ')

type Render = (text: string) => ReactNode

const COMPONENTS: readonly (readonly [string, Render])[] = [
  ['button', (text) => <Button variant="outline" icon={<Plus />}>{text}</Button>],
  [
    'button-group',
    (text) => (
      <ButtonGroup variant="track" aria-label="Long group">
        <Button>{text}</Button>
        <Button>{text}</Button>
      </ButtonGroup>
    ),
  ],
  ['input', (text) => <Input aria-label="Long value" defaultValue={text} start={<Link />} />],
  [
    'toggle-group',
    (text) => (
      <ToggleGroup aria-label="Long choice" defaultValue="first">
        <ToggleGroupItem value="first">{text}</ToggleGroupItem>
        <ToggleGroupItem value="second">{text}</ToggleGroupItem>
      </ToggleGroup>
    ),
  ],
  ['checkbox', (text) => <Checkbox defaultChecked>{text}</Checkbox>],
  [
    'switch',
    (text) => (
      <Field>
        <FieldLabel>{text}</FieldLabel>
        <Switch defaultChecked />
      </Field>
    ),
  ],
  [
    'radio',
    (text) => (
      <RadioGroup aria-label="Long choice" defaultValue="first">
        <Radio value="first">{text}</Radio>
      </RadioGroup>
    ),
  ],
  [
    'menu',
    (text) => (
      <Menu>
        <MenuTrigger variant="outline">{text}</MenuTrigger>
        <MenuContent>
          <MenuItem trail={text}>{text}</MenuItem>
        </MenuContent>
      </Menu>
    ),
  ],
  [
    'tooltip',
    (text) => (
      <Tooltip content={text}>
        <Button variant="outline">{text}</Button>
      </Tooltip>
    ),
  ],
  [
    'popover',
    (text) => (
      <Popover>
        <PopoverTrigger variant="outline">{text}</PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>{text}</PopoverTitle>
        </PopoverPopup>
      </Popover>
    ),
  ],
  [
    'dialog',
    (text) => (
      <Dialog>
        <DialogTrigger variant="outline">{text}</DialogTrigger>
        <DialogPopup>
          <DialogTitle>{text}</DialogTitle>
        </DialogPopup>
      </Dialog>
    ),
  ],
  ['text', (text) => <Text as="p">{text}</Text>],
  ['heading', (text) => <Heading level={3}>{text}</Heading>],
  ['kbd', (text) => <Kbd keys={[text, 'K']} />],
  ['badge', (text) => <Badge numeric dot>{text}</Badge>],
  [
    'card',
    (text) => (
      <Card>
        <CardHeader level={3} title={text} description={text} action={<Button variant="soft">{text}</Button>} />
        <Text as="p">{text}</Text>
        <CardActions>
          <Button>{text}</Button>
          <Button variant="solid">{text}</Button>
        </CardActions>
      </Card>
    ),
  ],
  [
    'alert',
    (text) => (
      <Alert tone="danger" icon={<CircleAlert />} title={text}>
        {text}
      </Alert>
    ),
  ],
  [
    'field',
    (text) => (
      <Field invalid>
        <FieldLabel>{text}</FieldLabel>
        <FieldDescription>{text}</FieldDescription>
        <Input defaultValue={text} />
        <FieldError match>{text}</FieldError>
      </Field>
    ),
  ],
  ['textarea', (text) => <Textarea aria-label="Long notes" defaultValue={text} />],
  [
    'alert-dialog',
    (text) => (
      <AlertDialog>
        <AlertDialogTrigger variant="outline">{text}</AlertDialogTrigger>
        <DialogPopup>
          <DialogTitle>{text}</DialogTitle>
        </DialogPopup>
      </AlertDialog>
    ),
  ],
]

function Words() {
  return (
    <>
      {[PATH, HASH, WORD, NUMBER].map((text) => (
        <Text key={text} as="p" variant="description">
          {text}
        </Text>
      ))}
    </>
  )
}

function Popups() {
  return (
    <div className="flex flex-wrap items-center gap-inset">
      <Menu>
        <MenuTrigger variant="outline" data-overflow-open="">
          Long menu
        </MenuTrigger>
        <MenuContent>
          {CASES.map(([kind, text]) => (
            <MenuItem key={kind} trail={kind}>
              {text}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
      <Popover>
        <PopoverTrigger variant="outline" data-overflow-open="">
          Long popover
        </PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>{ADDRESS}</PopoverTitle>
          <PopoverDescription>{PATH}</PopoverDescription>
          <Words />
          <PopoverActions>
            <PopoverClose>{HASH}</PopoverClose>
            <PopoverClose variant="solid">{WORD}</PopoverClose>
          </PopoverActions>
          <PopoverDismiss aria-label="Close" />
        </PopoverPopup>
      </Popover>
      <Dialog>
        <DialogTrigger variant="outline" data-overflow-open="">
          Long dialog
        </DialogTrigger>
        <DialogPopup>
          <DialogTitle>{ADDRESS}</DialogTitle>
          <DialogDescription>{PATH}</DialogDescription>
          <Words />
          <DialogActions>
            <DialogClose>{HASH}</DialogClose>
            <DialogClose variant="solid">{WORD}</DialogClose>
          </DialogActions>
          <DialogDismiss aria-label="Close" />
        </DialogPopup>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger variant="outline" data-overflow-open="">
          Long alert dialog
        </AlertDialogTrigger>
        <DialogPopup>
          <DialogTitle>{ADDRESS}</DialogTitle>
          <DialogDescription>{PATH}</DialogDescription>
          <Words />
          <DialogActions>
            <DialogClose>{HASH}</DialogClose>
            <DialogClose variant="solid">{WORD}</DialogClose>
          </DialogActions>
        </DialogPopup>
      </AlertDialog>
      <Tooltip content={ADDRESS}>
        <Button variant="outline" data-overflow-open="hover">
          Long tooltip
        </Button>
      </Tooltip>
      <Dialog>
        <DialogTrigger variant="outline" data-overflow-open="">
          Nested
        </DialogTrigger>
        <DialogPopup>
          <DialogTitle>{WORD}</DialogTitle>
          <Card>
            <CardHeader level={3} title={ADDRESS} action={<Button variant="soft">{HASH}</Button>} />
            <Field>
              <FieldLabel>{PATH}</FieldLabel>
              <Input defaultValue={PATH} />
            </Field>
            <CardActions>
              <Button>{NUMBER}</Button>
              <Button variant="solid">{WORD}</Button>
            </CardActions>
          </Card>
          <DialogActions>
            <DialogClose variant="solid">{ADDRESS}</DialogClose>
          </DialogActions>
        </DialogPopup>
      </Dialog>
      <Dialog>
        <DialogTrigger variant="outline" data-overflow-open="" data-overflow-tall="">
          Tall dialog
        </DialogTrigger>
        <DialogPopup>
          <DialogTitle>Tall dialog</DialogTitle>
          <DialogDescription>{TALL}</DialogDescription>
          <DialogActions>
            <DialogClose variant="solid">Done</DialogClose>
          </DialogActions>
        </DialogPopup>
      </Dialog>
      <Popover>
        <PopoverTrigger variant="outline" data-overflow-open="" data-overflow-tall="">
          Tall popover
        </PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>Tall popover</PopoverTitle>
          <PopoverDescription>{TALL}</PopoverDescription>
        </PopoverPopup>
      </Popover>
    </div>
  )
}

export function OverflowSample() {
  return (
    <>
      {COMPONENTS.map(([name, render]) => (
        <div key={name} data-overflow-component={name} className="flex flex-wrap items-start gap-inset">
          {CASES.map(([kind, text]) => (
            <div key={kind} data-overflow-case={kind} className="w-30">
              {render(text)}
            </div>
          ))}
        </div>
      ))}
      <Popups />
    </>
  )
}
