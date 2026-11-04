import { TONES } from '@mattymroz/tessera/lib/tone'
import LoaderCircle from 'lucide-react/icons/loader-circle'
import Plus from 'lucide-react/icons/plus'
import type { CSSProperties, ReactNode } from 'react'
import { LiveValues } from './live-values'
import { MotionSample } from './motion-sample'

const COLOR_ROLES = [
  'background', 'secondary-background', 'tertiary-background', 'raised-background', 'inverse-background', 'chip', 'tooltip',
  'label', 'secondary-label', 'hint-label', 'tertiary-label', 'quaternary-label', 'inverse-label', 'tooltip-label',
  'inverse-hover', 'inverse-press', 'thumb', 'separator', 'opaque-separator', 'control-border', 'tint', 'tint-bright',
  'tint-dim', 'on-tint', 'glow', 'success', 'on-success', 'warning', 'on-warning', 'danger', 'on-danger', 'info', 'on-info',
  'scrim',
] as const
const TYPE_FAMILIES = ['sans', 'mono', 'heading'] as const
const TYPE_STEPS = ['mini', 'small', 'detail', 'body', 'title', 'screen-title', 'display'] as const
const TYPE_WEIGHTS = ['regular', 'medium', 'semibold'] as const
const MOTION_OUTPUTS = [
  'duration-hover-out', 'duration-follow', 'duration-choice', 'duration-scene', 'duration-press-in', 'duration-press-out',
  'ease-hover', 'ease-standard', 'ease-out', 'ease-emphasized', 'ease-press-in', 'ease-press-out',
  'choice-overshoot', 'press-scale', 'press-rest', 'press-hold', 'spin', 'sweep', 'pulse', 'loop',
].map((name) => `--ts-motion-${name}`)
const SPACES = ['inset', 'group', 'card', 'card-small', 'indent'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SIZE_OUTPUTS = [
  'height', 'text', 'leading', 'icon', 'icon-stroke', 'gap', 'box', 'track-block', 'track-inline', 'thumb', 'rail',
].map((name) => `--ts-size-${name}`)
const SHAPE_OUTPUTS = [
  'stroke', 'control', 'control-radius', 'concentric', 'control-side', 'control-side-icon', 'corner', 'control-corner', 'box', 'track',
  'thumb',
].map((name) => `--ts-shape-${name}`)
const BAR_VALUE = 0.4
const LONG_TEXT =
  'A tooltip or a short note wraps at the narrow measure, so a long sentence stays readable instead of running across the screen'
const CONTROL_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'field'] as const
const TONE_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'raised'] as const
const TEXT_VARIANTS = ['display', 'title', 'label', 'description', 'error', 'kbd'] as const
const TREE_LEVELS = Array.from({ length: 12 }, (_, index) => index + 1)
const INSETS = ['inset', 'group', 'card'] as const
const LEVELS = ['sunken', 'base', 'raised', 'overlay', 'modal'] as const
const NESTED_LEVELS = ['base', 'raised', 'sunken', 'raised'] as const
const DEPTH_LAYERS = ['popup', 'toast', 'tooltip'].map((name) => `--ts-depth-layer-${name}`)
const TINT_STATES = ['tint-rest', 'tint-hover', 'tint-press', 'tint-border'] as const
const SAMPLE_TEXT = 'Turn every page into motion'

const text: CSSProperties = {
  fontFamily: 'var(--ts-type-family-sans)',
  fontSize: 'var(--ts-type-body-size)',
  lineHeight: 'var(--ts-type-body-leading)',
  color: 'var(--ts-color-label)',
}

const tile: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  width: 'calc(var(--ts-size-height) * 2)',
  height: 'calc(var(--ts-size-height) * 2)',
  border: 'var(--ts-shape-stroke) solid var(--ts-color-separator)',
  borderRadius: 'var(--ts-shape-control-radius)',
}

function overlay(color: string, opacity: string): CSSProperties {
  return { position: 'absolute', inset: 0, background: color, opacity }
}

const checkBox: CSSProperties = {
  boxSizing: 'border-box',
  width: 'var(--ts-size-box)',
  height: 'var(--ts-size-box)',
  border: 'var(--ts-shape-stroke) solid var(--ts-color-control-border)',
  borderRadius: 'var(--ts-shape-box)',
}

const track: CSSProperties = {
  position: 'relative',
  width: 'var(--ts-size-track-inline)',
  height: 'var(--ts-size-track-block)',
  borderRadius: 'var(--ts-shape-track)',
  background: 'var(--ts-color-quaternary-label)',
}

const thumb: CSSProperties = {
  position: 'absolute',
  insetBlockStart: 'calc((var(--ts-size-track-block) - var(--ts-size-thumb)) / 2)',
  insetInlineStart: 'calc((var(--ts-size-track-block) - var(--ts-size-thumb)) / 2)',
  width: 'var(--ts-size-thumb)',
  height: 'var(--ts-size-thumb)',
  borderRadius: 'var(--ts-shape-thumb)',
  background: 'var(--ts-color-thumb)',
  boxShadow: 'var(--ts-depth-raised-shadow)',
}

const rail: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  width: 'calc(var(--ts-size-track-inline) * 2)',
  height: 'var(--ts-size-rail)',
  borderRadius: 'var(--ts-size-rail)',
  background: 'var(--ts-color-quaternary-label)',
}

const barFill: CSSProperties & Record<'--ts-i-value', number> = {
  '--ts-i-value': BAR_VALUE,
  width: 'calc(var(--ts-i-value) * 100%)',
  height: '100%',
  background: 'var(--ts-color-tint)',
}

function IconSlot() {
  return (
    <span data-slot="icon">
      <Plus />
    </span>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-group">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-inset">
      {children}
      <span>{label}</span>
    </div>
  )
}

function Control({ testId, label }: { testId: string; label: string }) {
  return (
    <span data-recipe="control" data-variant="outline" data-testid={testId}>
      <span data-slot="label">{label}</span>
    </span>
  )
}

function Row({ testId, label }: { testId: string; label: string }) {
  return (
    <div data-recipe="row" data-testid={testId}>
      <span data-slot="label">{label}</span>
    </div>
  )
}

function NestedSurface({ depth }: { depth: number }) {
  const level = NESTED_LEVELS[depth - 1]
  if (!level) return null
  return (
    <div
      data-recipe="surface"
      data-level={level}
      data-surface=""
      data-inset="inset"
      data-testid={`surface-depth-${depth}`}
      className="flex flex-col items-start gap-group"
    >
      <Control testId={`control-depth-${depth}`} label={`Level ${depth}`} />
      <Row testId={`row-depth-${depth}`} label={`Row ${depth}`} />
      <NestedSurface depth={depth + 1} />
    </div>
  )
}

export default function FoundationPage() {
  return (
    <>
      <h1>Foundation</h1>

      <Section title="Color">
        <div className="flex flex-wrap gap-group">
          {COLOR_ROLES.map((role) => (
            <Labelled key={role} label={role}>
              <div data-testid={`color-${role}`} style={{ ...tile, background: `var(--ts-color-${role})` }} />
            </Labelled>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-group">
          {TYPE_STEPS.map((step) => (
            <Labelled key={step} label={step}>
              <p
                data-testid={`type-${step}`}
                style={{ ...text, fontSize: `var(--ts-type-${step}-size)`, lineHeight: `var(--ts-type-${step}-leading)` }}
              >
                {SAMPLE_TEXT}
              </p>
            </Labelled>
          ))}
          {TYPE_FAMILIES.map((family) => (
            <Labelled key={family} label={`family-${family}`}>
              <p style={{ ...text, fontFamily: `var(--ts-type-family-${family})` }}>{SAMPLE_TEXT}</p>
            </Labelled>
          ))}
          {TYPE_WEIGHTS.map((weight) => (
            <Labelled key={weight} label={`weight-${weight}`}>
              <p style={{ ...text, fontWeight: `var(--ts-type-weight-${weight})` }}>{SAMPLE_TEXT}</p>
            </Labelled>
          ))}
          <Labelled label="tracking-caps">
            <p style={{ ...text, textTransform: 'uppercase', letterSpacing: 'var(--ts-type-tracking-caps)' }}>{SAMPLE_TEXT}</p>
          </Labelled>
          <Labelled label="measure-narrow">
            <p data-testid="type-measure-narrow" style={{ ...text, maxInlineSize: 'var(--ts-type-measure-narrow)' }}>
              {LONG_TEXT}
            </p>
          </Labelled>
        </div>
      </Section>

      <Section title="Motion">
        <LiveValues names={MOTION_OUTPUTS} />
        <MotionSample>
          <span
            data-testid="motion-sample"
            style={{ ...tile, width: 'var(--ts-size-height)', height: 'var(--ts-size-height)', background: 'var(--ts-color-tint)' }}
          />
        </MotionSample>
        <div className="flex flex-wrap items-center gap-card">
          <Labelled label="spin">
            <span
              data-testid="loop-spin"
              className="inline-flex"
              style={{
                width: 'var(--ts-size-icon)',
                height: 'var(--ts-size-icon)',
                animation: 'var(--ts-motion-spin) var(--ts-motion-loop) linear infinite',
              }}
            >
              <LoaderCircle width="100%" height="100%" />
            </span>
          </Labelled>
          <Labelled label="pulse">
            <span
              data-testid="loop-pulse"
              className="block"
              style={{
                width: 'calc(var(--ts-size-height) * 6)',
                height: 'var(--ts-size-height)',
                borderRadius: 'var(--ts-shape-control-radius)',
                background: 'var(--ts-color-quaternary-label)',
                animation: 'var(--ts-motion-pulse) var(--ts-motion-loop) ease-in-out infinite',
              }}
            />
          </Labelled>
          <Labelled label="sweep">
            <span className="block" style={rail}>
              <span
                data-testid="loop-sweep"
                className="block size-full"
                style={{ background: 'var(--ts-color-tint)', animation: 'var(--ts-motion-sweep) var(--ts-motion-loop) linear infinite' }}
              />
            </span>
          </Labelled>
        </div>
      </Section>

      <Section title="Space">
        <LiveValues names={SPACES.map((space) => `--ts-space-${space}`)} />
        <div className="flex flex-col gap-inset">
          {SPACES.map((space) => (
            <Labelled key={space} label={space}>
              <div
                data-testid={`space-${space}`}
                style={{ width: `var(--ts-space-${space})`, height: 'var(--ts-size-icon)', background: 'var(--ts-color-tint)' }}
              />
            </Labelled>
          ))}
        </div>
      </Section>

      <Section title="Size">
        <LiveValues names={SIZE_OUTPUTS} />
        <div className="flex flex-wrap items-end gap-group">
          {SIZES.map((size) => (
            <Labelled key={size} label={size}>
              <div className="flex items-center gap-inset">
                <span data-recipe="control" data-variant="outline" data-size={size} data-testid={`size-${size}`}>
                  <IconSlot />
                  <span data-slot="label">Control</span>
                </span>
                <span data-recipe="control" data-variant="outline" data-size={size} data-testid={`icon-only-${size}`}>
                  <IconSlot />
                </span>
                <div data-recipe="row" data-size={size} data-testid={`row-${size}`}>
                  <IconSlot />
                  <span data-slot="label">Row</span>
                </div>
              </div>
            </Labelled>
          ))}
          <Labelled label="xs inside xl">
            <div data-size="xl" className="flex">
              <span data-recipe="control" data-variant="outline" data-size="xs" data-testid="size-nested-xs">
                <span data-slot="label">Nested</span>
              </span>
            </div>
          </Labelled>
        </div>
      </Section>

      <Section title="Geometry">
        <div className="flex flex-wrap items-end gap-card">
          {SIZES.map((size) => (
            <Labelled key={size} label={size}>
              <div data-size={size} data-testid={`geometry-${size}`} className="flex items-center gap-group">
                <span data-part="box" className="block" style={checkBox} />
                <span data-part="track-off" className="block" style={track}>
                  <span data-part="thumb-off" className="block" style={thumb} />
                </span>
                <span data-part="track-on" className="block" style={{ ...track, background: 'var(--ts-color-tint)' }}>
                  <span
                    data-part="thumb-on"
                    className="block"
                    style={{ ...thumb, translate: 'calc(var(--ts-size-track-inline) - var(--ts-size-track-block)) 0' }}
                  />
                </span>
                <span data-part="rail" className="block" style={{ ...rail, overflow: 'visible' }}>
                  <span
                    className="block"
                    style={{ ...thumb, insetBlockStart: '50%', insetInlineStart: '50%', translate: '-50% -50%' }}
                  />
                </span>
              </div>
            </Labelled>
          ))}
        </div>
        <Labelled label={`bar at ${BAR_VALUE}`}>
          <span data-testid="bar" className="block" style={rail}>
            <span data-testid="bar-fill" className="block" style={barFill} />
          </span>
        </Labelled>
        <Labelled label="field-sizing content">
          <textarea
            data-testid="field-sizing"
            aria-label="Grows with its text"
            style={{
              ...text,
              fieldSizing: 'content',
              resize: 'none',
              inlineSize: 'calc(var(--ts-size-height) * 8)',
              padding: 'var(--ts-space-inset)',
              border: 'var(--ts-shape-stroke) solid var(--ts-color-control-border)',
              borderRadius: 'var(--ts-shape-control-radius)',
              background: 'transparent',
            }}
          />
        </Labelled>
      </Section>

      <Section title="Shape">
        <LiveValues names={SHAPE_OUTPUTS} />
        <div className="flex flex-wrap items-start gap-card">
          <Labelled label="no surface">
            <div className="flex flex-col items-start gap-group">
              <Control testId="control-page" label="Control" />
              <Row testId="row-page" label="Row" />
            </div>
          </Labelled>
          {INSETS.map((inset) => (
            <Labelled key={inset} label={`surface ${inset}`}>
              <div
                data-recipe="surface"
                data-surface=""
                data-inset={inset}
                data-testid={`surface-${inset}`}
                className="flex flex-col items-start gap-group"
              >
                <Control testId={`control-${inset}`} label="Control" />
                <Row testId={`row-${inset}`} label="Row" />
              </div>
            </Labelled>
          ))}
          <Labelled label="surfaces 1 to 4">
            <NestedSurface depth={1} />
          </Labelled>
        </div>
      </Section>

      <Section title="Recipes">
        <div className="flex flex-wrap items-center gap-inset">
          {CONTROL_VARIANTS.map((variant) => (
            <span key={variant} data-recipe="control" data-variant={variant} data-testid={`variant-${variant}`}>
              <span data-slot="label">{variant}</span>
            </span>
          ))}
        </div>
        <div role="menubar" aria-orientation="vertical" aria-label="Rows" data-recipe="surface" data-level="raised" data-surface="" data-inset="inset" className="flex flex-col self-start">
          <div data-recipe="row" data-variant="group-label">
            <span data-slot="label">Rows</span>
          </div>
          <div data-recipe="row">
            <IconSlot />
            <span data-slot="label">default</span>
            <span data-slot="trail">Ctrl+O</span>
          </div>
          <div data-recipe="row" data-variant="separator" />
          <div data-recipe="row" role="menuitemcheckbox" aria-checked="true" data-testid="row-checked">
            <IconSlot />
            <span data-slot="label">checked</span>
          </div>
          <div data-recipe="row" role="menuitem" data-disabled="" aria-disabled="true">
            <span data-slot="label">disabled</span>
          </div>
        </div>
      </Section>

      <Section title="Tones">
        <div className="flex flex-col items-start gap-inset">
          {TONE_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-inset">
              <span data-recipe="control" data-variant={variant} data-testid={`tone-${variant}-none`}>
                <span data-slot="label">{variant}</span>
              </span>
              {TONES.map((tone) => (
                <span key={tone} data-recipe="control" data-variant={variant} data-tone={tone} data-testid={`tone-${variant}-${tone}`}>
                  <span data-slot="label">{tone}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <div data-recipe="surface" data-level="raised" data-surface="" data-inset="inset" className="flex flex-col self-start">
          <div data-recipe="row" data-testid="tone-row-none">
            <span data-slot="label">no tone</span>
          </div>
          {TONES.map((tone) => (
            <div key={tone} data-recipe="row" data-tone={tone} data-testid={`tone-row-${tone}`}>
              <span data-slot="label">{tone}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-start gap-group">
          <div data-recipe="surface" data-level="raised" data-surface="" data-inset="group" data-testid="tone-surface-none">
            no tone
          </div>
          {TONES.map((tone) => (
            <div key={tone} data-recipe="surface" data-level="raised" data-surface="" data-inset="group" data-tone={tone} data-testid={`tone-surface-${tone}`}>
              {tone}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Text">
        <div className="flex flex-col items-start gap-group">
          {TEXT_VARIANTS.map((variant) => (
            <Labelled key={variant} label={variant}>
              <p data-recipe="text" data-variant={variant} data-testid={`text-${variant}`}>
                {variant === 'kbd' ? 'Ctrl+Shift+12' : SAMPLE_TEXT}
              </p>
            </Labelled>
          ))}
          <Labelled label="label with and without data-numeric">
            <div className="flex items-start gap-group">
              <span data-recipe="text" data-variant="label" data-numeric="" data-testid="numeric-111">
                111
              </span>
              <span data-recipe="text" data-variant="label" data-numeric="" data-testid="numeric-888">
                888
              </span>
              <span data-recipe="text" data-variant="label" data-testid="proportional-111">
                111
              </span>
              <span data-recipe="text" data-variant="label" data-testid="proportional-888">
                888
              </span>
            </div>
          </Labelled>
        </div>
      </Section>

      <Section title="Tree">
        <div role="tree" aria-label="Levels" data-recipe="surface" data-level="raised" data-surface="" data-inset="inset" className="flex flex-col self-start">
          {TREE_LEVELS.map((level) => (
            <div key={level} role="treeitem" aria-level={level} aria-selected={level === 3} data-recipe="row" data-testid={`tree-level-${level}`}>
              <span data-slot="label">{`Level ${level}`}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Depth">
        <div className="flex flex-wrap gap-group">
          {LEVELS.map((level) => (
            <Labelled key={level} label={level}>
              <div
                data-testid={`level-${level}`}
                style={{
                  ...tile,
                  background: `var(--ts-depth-${level}-bg)`,
                  borderColor: `var(--ts-depth-${level}-border)`,
                  boxShadow: `var(--ts-depth-${level}-shadow)`,
                  overflow: 'visible',
                }}
              />
            </Labelled>
          ))}
          <Labelled label="material">
            <div
              className="flex items-center justify-center p-inset"
              style={{ ...tile, backgroundImage: 'linear-gradient(90deg, var(--ts-color-tint), var(--ts-color-background))' }}
            >
              <div
                data-testid="material"
                className="size-full"
                style={{ background: 'var(--ts-depth-overlay-bg)', backdropFilter: 'var(--ts-depth-backdrop)' }}
              />
            </div>
          </Labelled>
          <Labelled label="glow">
            <div data-testid="glow" style={{ ...tile, background: 'var(--ts-color-tint)', boxShadow: 'var(--ts-depth-glow)', overflow: 'visible' }} />
          </Labelled>
        </div>
        <LiveValues names={DEPTH_LAYERS} />
      </Section>

      <Section title="State">
        <div className="flex flex-wrap items-center gap-group">
          <Labelled label="rest">
            <span data-recipe="control" data-variant="soft" data-testid="state-rest">
              <span data-slot="label">Control</span>
            </span>
          </Labelled>
          <Labelled label="hover">
            <span data-recipe="control" data-variant="ghost" data-popup-open="" data-testid="state-hover">
              <span data-slot="label">Control</span>
            </span>
          </Labelled>
          <Labelled label="press">
            <button type="button" data-recipe="control" data-variant="ghost" data-pressing="" data-testid="state-press">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
          <Labelled label="disabled">
            <span data-recipe="control" data-variant="outline" data-disabled="" aria-disabled="true" data-testid="state-disabled">
              <span data-slot="label">Control</span>
            </span>
          </Labelled>
          <Labelled label="indicator">
            <div style={{ ...tile, background: 'var(--ts-color-background)' }}>
              <span data-testid="state-indicator" style={overlay('var(--ts-state-ink)', 'var(--ts-state-indicator)')} />
            </div>
          </Labelled>
          <Labelled label="selected-fill">
            <div style={{ ...tile, background: 'var(--ts-color-background)' }}>
              <span
                data-testid="state-selected-fill"
                style={overlay('var(--ts-state-selected-fill-color)', 'var(--ts-state-selected-fill)')}
              />
            </div>
          </Labelled>
          <Labelled label="pressed">
            <button type="button" data-recipe="control" data-variant="ghost" aria-pressed="true" data-testid="state-pressed">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
          <Labelled label="not pressed">
            <button type="button" data-recipe="control" data-variant="ghost" aria-pressed="false" data-testid="state-not-pressed">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
          <Labelled label="checked switch">
            <button type="button" role="switch" aria-checked="true" data-recipe="control" data-variant="ghost" data-testid="state-checked">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
          <Labelled label="invalid-color">
            <div data-testid="state-invalid-color" style={{ ...tile, background: 'var(--ts-state-invalid-color)' }} />
          </Labelled>
          {TINT_STATES.map((state) => (
            <Labelled key={state} label={state}>
              <div style={{ ...tile, background: 'var(--ts-color-background)' }}>
                <span data-testid={`state-${state}`} style={overlay('var(--ts-color-tint)', `var(--ts-state-${state})`)} />
              </div>
            </Labelled>
          ))}
        </div>
      </Section>

      <Section title="Focus">
        <p>Press Tab to move the focus ring onto a sample.</p>
        <div className="flex flex-wrap gap-card p-inset">
          <Labelled label="outer">
            <button type="button" data-recipe="control" data-variant="outline" data-focus="outer" data-testid="focus-outer">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
          <Labelled label="inset">
            <button type="button" data-recipe="control" data-variant="outline" data-focus="inset" data-testid="focus-inset">
              <span data-slot="label">Control</span>
            </button>
          </Labelled>
        </div>
      </Section>
    </>
  )
}
