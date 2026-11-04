import { expectTypeOf, it } from 'vitest'
import type { TextProps } from './text'

it('names a field with htmlFor only on a label', () => {
  expectTypeOf<{ as: 'label'; htmlFor: string }>().toExtend<TextProps>()
  expectTypeOf<{ as: 'span'; htmlFor: string }>().not.toExtend<TextProps>()
  expectTypeOf<{ htmlFor: string }>().not.toExtend<TextProps>()
  expectTypeOf<{ as: 'p' }>().toExtend<TextProps>()
})
