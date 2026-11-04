export const TONES = ['neutral', 'accent', 'danger', 'success', 'warning', 'info'] as const

export type Tone = (typeof TONES)[number]
