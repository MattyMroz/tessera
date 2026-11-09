import { describe, expect, it } from 'vitest'
import { createSingleChoice, type ChoiceOption, type OptionState, type SingleChoice } from './single-choice'

const OPTIONS = ['day', 'week', 'month', 'year', 'all']

function arranged(disabled: readonly string[] = []): ChoiceOption[] {
  return OPTIONS.map((value) => ({ value, disabled: disabled.includes(value) }))
}

function statesOf(choice: SingleChoice): OptionState[] {
  return OPTIONS.map((option) => choice.stateOf(option))
}

function renders(choice: SingleChoice, change: () => void): string[] {
  const seen = new Map<string, OptionState>(OPTIONS.map((option) => [option, choice.stateOf(option)]))
  const rendered: string[] = []
  for (const option of OPTIONS) {
    choice.subscribe(() => {
      const state = choice.stateOf(option)
      if (state === seen.get(option)) return
      seen.set(option, state)
      rendered.push(option)
    })
  }
  change()
  return rendered
}

function arrangedChoice(initial: string | null, disabled: readonly string[] = []): SingleChoice {
  const choice = createSingleChoice(initial)
  choice.arrange(arranged(disabled))
  return choice
}

describe('createSingleChoice', () => {
  it('re-renders only the previous and the new choice', () => {
    const choice = arrangedChoice('week')
    expect(renders(choice, () => choice.choose('year'))).toEqual(['week', 'year'])
  })

  it('re-renders nothing for the same choice', () => {
    const choice = arrangedChoice('week')
    expect(renders(choice, () => choice.choose('week'))).toEqual([])
  })

  it('makes the chosen option the only tab stop', () => {
    expect(statesOf(arrangedChoice('month'))).toEqual(['idle', 'idle', 'chosen', 'idle', 'idle'])
  })

  it('makes the first enabled option the only tab stop while nothing is chosen', () => {
    expect(statesOf(arrangedChoice(null))).toEqual(['stop', 'idle', 'idle', 'idle', 'idle'])
    expect(statesOf(arrangedChoice(null, ['day', 'week']))).toEqual(['idle', 'idle', 'stop', 'idle', 'idle'])
  })

  it('makes the first enabled option the tab stop while the chosen option is disabled', () => {
    expect(statesOf(arrangedChoice('day', ['day']))).toEqual(['chosen', 'stop', 'idle', 'idle', 'idle'])
    expect(statesOf(arrangedChoice('month', ['day', 'month']))).toEqual(['idle', 'stop', 'chosen', 'idle', 'idle'])
  })

  it('re-renders at most two options on the first choice', () => {
    const choice = arrangedChoice(null)
    expect(renders(choice, () => choice.choose('month'))).toEqual(['day', 'month'])
    const first = arrangedChoice(null)
    expect(renders(first, () => first.choose('day'))).toEqual(['day'])
    expect(first.value()).toBe('day')
  })

  it('moves the tab stop when the chosen option becomes disabled and back', () => {
    const choice = arrangedChoice('month')
    expect(renders(choice, () => choice.arrange(arranged(['month'])))).toEqual(['day'])
    expect(statesOf(choice)).toEqual(['stop', 'idle', 'chosen', 'idle', 'idle'])
    choice.arrange(arranged())
    expect(statesOf(choice)).toEqual(['idle', 'idle', 'chosen', 'idle', 'idle'])
  })

  it('has no tab stop while every option is disabled', () => {
    expect(statesOf(arrangedChoice(null, OPTIONS))).toEqual(['idle', 'idle', 'idle', 'idle', 'idle'])
  })

  it('stops telling a listener that unsubscribed', () => {
    const choice = arrangedChoice('day')
    let calls = 0
    const unsubscribe = choice.subscribe(() => {
      calls++
    })
    choice.choose('week')
    unsubscribe()
    choice.choose('month')
    expect(calls).toBe(1)
  })
})
