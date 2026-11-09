export const COMPONENT_LAYOUT: readonly string[] = [
  'display', 'gap', 'row-gap', 'column-gap', 'align-items', 'align-self', 'align-content', 'justify-content', 'justify-items',
  'justify-self', 'place-items', 'place-content', 'place-self', 'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
  'flex-basis', 'order', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'grid-auto-flow',
  'grid-auto-columns', 'grid-auto-rows',
]

export const APP_LAYOUT: readonly string[] = [
  ...COMPONENT_LAYOUT,
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'inline-size', 'block-size', 'min-inline-size',
  'max-inline-size', 'min-block-size', 'max-block-size', 'aspect-ratio', 'box-sizing', 'position', 'inset', 'top', 'right',
  'bottom', 'left', 'z-index', 'visibility', 'grid', 'align', 'justify', 'place', 'margin', 'padding', 'overflow',
  'overscroll-behavior', 'transform', 'translate', 'pointer-events', 'cursor', 'user-select', 'touch-action', 'contain',
  'will-change', 'scroll-margin', 'scroll-padding', 'scroll-snap', 'object-fit', 'object-position', 'text-align',
  'white-space', 'word-break', 'hyphens', 'text-wrap', 'text-overflow', 'line-clamp', 'vertical-align', 'float', 'clear',
  'columns', 'column-count', 'column-width', 'column-span', 'table-layout', 'border-collapse', 'border-spacing',
  'caption-side', 'resize', 'scrollbar-gutter', 'container', 'isolation', 'field-sizing', 'scroll-behavior', 'break-before',
  'break-after', 'break-inside', 'box-orient',
]

export const LAYOUT_CLASSES: readonly string[] = [
  'block', 'inline', 'flex(?:-.+)?', 'grid(?:-.+)?', 'table(?:-.+)?', 'contents', 'flow-root', 'list-item', 'hidden',
  'static', 'fixed', 'absolute', 'relative', 'sticky', 'isolate', 'isolation-auto', 'container', 'sr-only', 'not-sr-only',
  'visible', 'invisible', 'collapse', 'truncate', 'transform-(?:gpu|cpu|none)', 'scroll-(?:auto|smooth)', 'resize(?:-.+)?',
  'grow(?:-.+)?', 'shrink(?:-.+)?', 'box-(?:border|content)', 'caption-(?:top|bottom)', '(?:group|peer)(?:/.+)?',
  '@container(?:-(?:normal|size|[[].+))?(?:/.+)?',
  'content-(?:normal|center|start|end|between|around|evenly|baseline|stretch|center-safe|end-safe)',
  'text-(?:left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)',
  'border-(?:collapse|separate|spacing(?:-.+)?)',
]

export const LAYOUT_FAMILIES: readonly string[] = [
  'p(?:[xytrblse]|b[se])?', 'm(?:[xytrblse]|b[se])?', 'scroll-[mp](?:[xytrblse]|b[se])?', 'space-[xy]', 'gap(?:-[xy])?',
  'size', 'w', 'h', 'block', 'inline', 'min', 'max', 'inset(?!-(?:ring|shadow))', 'top', 'right', 'bottom', 'left', 'start',
  'end', 'z', 'overflow', 'overscroll', 'order', 'col', 'row', 'basis', 'auto-cols', 'auto-rows', 'place', 'justify', 'items',
  'self', 'aspect', 'columns', 'float', 'clear', 'whitespace', 'break', 'wrap', 'hyphens', 'translate', 'origin',
  'pointer-events', 'cursor', 'select', 'touch', 'snap', 'scrollbar-gutter', 'will-change', 'contain', 'field-sizing',
  'object', 'line-clamp', 'align',
]
