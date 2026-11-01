export type OptionState = 'chosen' | 'stop' | 'idle'

export type ChoiceOption = { readonly value: string; readonly disabled: boolean }

export type SingleChoice = {
  readonly value: () => string | null
  readonly stateOf: (option: string) => OptionState
  readonly subscribe: (listener: () => void) => () => void
  readonly choose: (option: string | null) => void
  readonly arrange: (options: readonly ChoiceOption[]) => void
}

function stopOf(current: string | null, options: readonly ChoiceOption[]): string | null {
  const chosen = options.find((option) => option.value === current)
  if (chosen && !chosen.disabled) return null
  return options.find((option) => !option.disabled)?.value ?? null
}

export function createSingleChoice(initial: string | null): SingleChoice {
  let current = initial
  let options: readonly ChoiceOption[] = []
  let stop: string | null = null
  const listeners = new Set<() => void>()
  const update = (next: string | null, arranged: readonly ChoiceOption[]): void => {
    const nextStop = stopOf(next, arranged)
    options = arranged
    if (next === current && nextStop === stop) return
    current = next
    stop = nextStop
    for (const listener of listeners) listener()
  }
  return {
    value: () => current,
    stateOf: (option) => {
      if (option === current) return 'chosen'
      return option === stop ? 'stop' : 'idle'
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    choose: (option) => {
      update(option, options)
    },
    arrange: (arranged) => {
      update(current, arranged)
    },
  }
}
