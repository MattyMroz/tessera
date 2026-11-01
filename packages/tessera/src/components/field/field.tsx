'use client'

import { Field as BaseField } from '@base-ui/react/field'
import { composeRefs } from '../../lib/compose-refs'
import { focusFieldOfLabel } from '../../lib/focus-field'
import { SlotHost, usePart, useSlotOrder, type SlotOrder } from '../../lib/slot'
import type { Unstyled } from '../../lib/unstyled'

const HOST = 'Field'

const FIELD_SLOTS: SlotOrder = ['label', 'description', null, 'error']

export type FieldProps = Unstyled<BaseField.Root.Props>

export type FieldLabelProps = Unstyled<BaseField.Label.Props, 'nativeLabel'>

export type FieldDescriptionProps = Unstyled<BaseField.Description.Props>

export type FieldErrorProps = Unstyled<BaseField.Error.Props, 'role'>

export function Field({ validationMode, ref, children, ...props }: FieldProps) {
  const slots = useSlotOrder(HOST, FIELD_SLOTS)
  return (
    <BaseField.Root {...props} ref={composeRefs(ref, slots)} validationMode={validationMode ?? 'onBlur'} data-component="field">
      <SlotHost value={HOST}>{children}</SlotHost>
    </BaseField.Root>
  )
}

export function FieldLabel({ onClick, children, ...props }: FieldLabelProps) {
  usePart(HOST, 'FieldLabel')
  return (
    <BaseField.Label
      {...props}
      data-recipe="text"
      data-variant="label"
      data-slot="label"
      onClick={(event) => {
        onClick?.(event)
        focusFieldOfLabel(event)
      }}
    >
      <SlotHost value={null}>{children}</SlotHost>
    </BaseField.Label>
  )
}

export function FieldDescription({ children, ...props }: FieldDescriptionProps) {
  usePart(HOST, 'FieldDescription')
  return (
    <BaseField.Description {...props} data-recipe="text" data-variant="description" data-slot="description">
      <SlotHost value={null}>{children}</SlotHost>
    </BaseField.Description>
  )
}

export function FieldError({ children, ...props }: FieldErrorProps) {
  usePart(HOST, 'FieldError')
  const own = children === undefined ? {} : { children: <SlotHost value={null}>{children}</SlotHost> }
  return <BaseField.Error {...props} {...own} role="alert" data-recipe="text" data-variant="error" data-slot="error" />
}
