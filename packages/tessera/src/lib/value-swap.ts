const RISE = '60%'

export const SWAP_IN: Keyframe[] = [
  { translate: `0 ${RISE}`, opacity: 0 },
  { translate: '0 0', opacity: 1 },
]

export const SWAP_OUT: Keyframe[] = [
  { translate: '0 0', opacity: 1 },
  { translate: `0 -${RISE}`, opacity: 0 },
]
