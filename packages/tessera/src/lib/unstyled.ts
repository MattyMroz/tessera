export const APPEARANCE_PROPS = ['className', 'style', 'render'] as const

export type Unstyled<P, K extends keyof P = never> = Omit<P, (typeof APPEARANCE_PROPS)[number] | K>
