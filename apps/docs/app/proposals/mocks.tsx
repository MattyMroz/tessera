'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Card, CardActions, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Checkbox } from '@mattymroz/tessera/components/checkbox/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@mattymroz/tessera/components/select/select'
import { Switch } from '@mattymroz/tessera/components/switch/switch'
import { Text } from '@mattymroz/tessera/components/text/text'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { Tooltip, TooltipBar } from '@mattymroz/tessera/components/tooltip/tooltip'
import AArrowDown from 'lucide-react/icons/a-arrow-down'
import AArrowUp from 'lucide-react/icons/a-arrow-up'
import ArrowUp from 'lucide-react/icons/arrow-up'
import Blend from 'lucide-react/icons/blend'
import Eye from 'lucide-react/icons/eye'
import FlipHorizontal2 from 'lucide-react/icons/flip-horizontal-2'
import FlipVertical2 from 'lucide-react/icons/flip-vertical-2'
import Heart from 'lucide-react/icons/heart'
import Lock from 'lucide-react/icons/lock'
import LockOpen from 'lucide-react/icons/lock-open'
import Music from 'lucide-react/icons/music'
import Pause from 'lucide-react/icons/pause'
import Play from 'lucide-react/icons/play'
import Repeat from 'lucide-react/icons/repeat'
import RotateCw from 'lucide-react/icons/rotate-cw'
import Shuffle from 'lucide-react/icons/shuffle'
import SkipBack from 'lucide-react/icons/skip-back'
import SkipForward from 'lucide-react/icons/skip-forward'
import SquareRoundCorner from 'lucide-react/icons/square-round-corner'
import Volume from 'lucide-react/icons/volume'
import Volume1 from 'lucide-react/icons/volume-1'
import Volume2 from 'lucide-react/icons/volume-2'
import VolumeX from 'lucide-react/icons/volume-x'
import X from 'lucide-react/icons/x'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { clock, dollars, effort, EFFORT_STOPS, Icon, percent, TRACK_SECONDS } from './parts'
import { Scrub } from './scrub'
import { Track } from './track'
import { ValueText } from './value-text'

const TICK = 1000
const QUIET = 34
const HALF = 67
const HALF_TURN = 180
const MAX_RADIUS = 64
const MODELS = { fable: 'Fable 5', opus: 'Opus 5.5', haiku: 'Haiku 4.5' } as const
const EFFORT_NOTES = ['Answers at once, best for quick edits.', 'Thinks briefly before it answers.', 'Plans, checks its work, then answers.', 'Takes its time on the hardest problems.'] as const
const PRICE_MAX = 500
const PRICE_STEP = 10
const OFFERS = 6
const FASTER_SHARE = 0.4
const STOCK_SHARE = 0.75

function Named({ name, value, children }: { readonly name: string; readonly value: string; readonly children: ReactNode }) {
  return (
    <div className="pp-stack" data-gap="group">
      <div className="pp-head">
        <span className="pp-name">{name}</span>
        <span className="pp-quiet">
          <ValueText text={value} align="end" />
        </span>
      </div>
      {children}
    </div>
  )
}

function levelIcon(volume: number): ReactNode {
  if (volume === 0) return <VolumeX />
  if (volume < QUIET) return <Volume />
  return volume < HALF ? <Volume1 /> : <Volume2 />
}

function pixels(value: number): string {
  return `${value} px`
}

function mirrored(turn: number): number {
  const next = HALF_TURN - turn
  return next > HALF_TURN ? next - HALF_TURN * 2 : next
}

function Player() {
  const [time, setTime] = useState(73)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [muted, setMuted] = useState(false)
  const heard = muted ? 0 : volume

  useEffect(() => {
    if (!playing) return
    const beat = window.setInterval(() => setTime((now) => (now + 1) % (TRACK_SECONDS + 1)), TICK)
    return () => window.clearInterval(beat)
  }, [playing])

  return (
    <div className="pp-mock">
      <Card data-testid="mock-player">
        <div className="pp-row">
          <span className="pp-art" aria-hidden="true">
            <Music />
          </span>
          <div className="pp-stack pp-grow">
            <span className="pp-track-title">Glass Skies</span>
            <Text variant="description">Evelyn Rae · Low Tide</Text>
          </div>
          <Button variant="ghost" icon={<Heart />} aria-label="Like" />
        </div>
        <div className="pp-stack">
          <Track look="timeline" bubble="peek" min={0} max={TRACK_SECONDS} value={time} onValueChange={setTime} format={clock} aria-label="Position in the track" />
          <div className="pp-head">
            <span className="pp-small">{clock(time)}</span>
            <span className="pp-small">{`-${clock(TRACK_SECONDS - time)}`}</span>
          </div>
        </div>
        <div className="pp-row" data-centre="">
          <TooltipBar>
            <Tooltip content="Shuffle">
              <Button variant="ghost" icon={<Shuffle />} aria-label="Shuffle" />
            </Tooltip>
            <Tooltip content="Previous">
              <Button variant="ghost" icon={<SkipBack />} aria-label="Previous" />
            </Tooltip>
            <Tooltip content={playing ? 'Pause' : 'Play'}>
              <Button variant="solid" icon={playing ? <Pause /> : <Play />} aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)} />
            </Tooltip>
            <Tooltip content="Next">
              <Button variant="ghost" icon={<SkipForward />} aria-label="Next" />
            </Tooltip>
            <Tooltip content="Repeat">
              <Button variant="ghost" icon={<Repeat />} aria-label="Repeat" />
            </Tooltip>
          </TooltipBar>
        </div>
        <Track
          look="line"
          min={0}
          max={100}
          value={heard}
          onValueChange={(next) => {
            setVolume(next)
            setMuted(false)
          }}
          format={percent}
          start={<Button variant="ghost" icon={levelIcon(heard)} aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(!muted)} />}
          end={
            <Icon>
              <Volume2 />
            </Icon>
          }
          aria-label="Player volume"
        />
      </Card>
    </div>
  )
}

function Inspector() {
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 176, height: 120, turn: 0, radius: 12 })
  const [locked, setLocked] = useState(false)
  const [opacity, setOpacity] = useState(100)
  const set = (key: 'x' | 'y' | 'turn' | 'radius') => (value: number) => setFrame((now) => ({ ...now, [key]: value }))
  const resize = (key: 'width' | 'height') => (value: number) =>
    setFrame((now) => {
      const other = key === 'width' ? 'height' : 'width'
      const kept = locked && now[key] > 0 ? Math.round((now[other] * value) / now[key]) : now[other]
      return { ...now, [key]: value, [other]: kept }
    })
  const shape = {
    '--pp-x': frame.x,
    '--pp-y': frame.y,
    '--pp-w': frame.width,
    '--pp-h': frame.height,
    '--pp-r': frame.radius,
    '--pp-turn': frame.turn,
    '--pp-o': opacity / 100,
  } as CSSProperties

  return (
    <div className="pp-mock">
      <Card data-testid="mock-inspector">
        <CardHeader level={3} title="Rectangle 4" description="Frame · Page 1" action={<Button variant="ghost" icon={<Eye />} aria-label="Hide the layer" />} />
        <div className="pp-canvas" aria-hidden="true">
          <div className="pp-shape" style={shape} />
        </div>
        <div className="pp-stack" data-gap="group">
          <span className="pp-section-title">Position</span>
          <div className="pp-pair" data-tool="">
            <Scrub label="X" value={frame.x} onValueChange={set('x')} aria-label="X position" />
            <Scrub label="Y" value={frame.y} onValueChange={set('y')} aria-label="Y position" />
            <Button variant="ghost" icon={<FlipHorizontal2 />} aria-label="Flip horizontally" onClick={() => setFrame((now) => ({ ...now, turn: -now.turn }))} />
            <Scrub
              label={
                <Icon>
                  <RotateCw />
                </Icon>
              }
              value={frame.turn}
              onValueChange={set('turn')}
              min={-HALF_TURN}
              max={HALF_TURN}
              plain
              unit="°"
              aria-label="Rotation"
            />
            <Scrub
              label={
                <Icon>
                  <SquareRoundCorner />
                </Icon>
              }
              value={frame.radius}
              onValueChange={set('radius')}
              min={0}
              max={MAX_RADIUS}
              aria-label="Corner radius"
            />
            <Button variant="ghost" icon={<FlipVertical2 />} aria-label="Flip vertically" onClick={() => setFrame((now) => ({ ...now, turn: mirrored(now.turn) }))} />
          </div>
        </div>
        <hr className="pp-rule" />
        <div className="pp-stack" data-gap="group">
          <span className="pp-section-title">Layout</span>
          <div className="pp-pair" data-tool="">
            <Scrub label="W" value={frame.width} onValueChange={resize('width')} min={0} aria-label="Frame width" />
            <Scrub label="H" value={frame.height} onValueChange={resize('height')} min={0} aria-label="Frame height" />
            <Button variant="ghost" icon={locked ? <Lock /> : <LockOpen />} aria-label="Keep the proportions" aria-pressed={locked} onClick={() => setLocked(!locked)} />
          </div>
        </div>
        <hr className="pp-rule" />
        <div className="pp-stack" data-gap="group">
          <span className="pp-section-title">Layer</span>
          <div className="pp-with-field">
            <Track
              look="mini"
              min={0}
              max={100}
              value={opacity}
              onValueChange={setOpacity}
              format={percent}
              start={
                <Icon>
                  <Blend />
                </Icon>
              }
              aria-label="Layer opacity"
            />
            <Scrub value={opacity} onValueChange={setOpacity} min={0} max={100} plain unit="%" aria-label="Layer opacity value" />
          </div>
          <Switch defaultChecked>Clip content</Switch>
        </div>
      </Card>
    </div>
  )
}

function Reader() {
  const [size, setSize] = useState(16)
  const [bubble, setBubble] = useState(85)
  const [level, setLevel] = useState(1)

  return (
    <div className="pp-mock">
      <Card data-testid="mock-reader">
        <CardHeader level={3} title="Reader" description="Chapter 12 · Japanese to English" action={<Button variant="ghost" icon={<X />} aria-label="Close" />} />
        <div className="pp-body">
          <Named name="Text size" value={pixels(size)}>
            <Track
              look="line"
              min={12}
              max={32}
              value={size}
              onValueChange={setSize}
              format={pixels}
              start={
                <Icon>
                  <AArrowDown />
                </Icon>
              }
              end={
                <Icon>
                  <AArrowUp />
                </Icon>
              }
              aria-label="Text size"
            />
          </Named>
          <Named name="Bubble opacity" value={percent(bubble)}>
            <Track look="line" min={0} max={100} step={5} value={bubble} onValueChange={setBubble} format={percent} aria-label="Bubble opacity" />
          </Named>
          <div className="pp-row">
            <div className="pp-stack">
              <span className="pp-name">Translation effort</span>
              <span className="pp-quiet">
                <ValueText text={effort(level)} />
              </span>
            </div>
            <Track look="square" marks min={0} max={EFFORT_STOPS} value={level} onValueChange={setLevel} format={effort} aria-label="Translation effort" />
          </div>
          <hr className="pp-rule" />
          <div className="pp-row">
            <span className="pp-name">Quality</span>
            <ToggleGroup aria-label="Quality" defaultValue="balanced" size="sm">
              <ToggleGroupItem value="fast">Fast</ToggleGroupItem>
              <ToggleGroupItem value="balanced">Balanced</ToggleGroupItem>
              <ToggleGroupItem value="best">Best</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Switch defaultChecked>Translate when a chapter opens</Switch>
        </div>
        <CardActions>
          <Button
            onClick={() => {
              setSize(16)
              setBubble(85)
              setLevel(1)
            }}
          >
            Reset
          </Button>
          <Button variant="solid">Done</Button>
        </CardActions>
      </Card>
    </div>
  )
}

function Model() {
  const [level, setLevel] = useState(2)

  return (
    <div className="pp-mock">
      <Card data-testid="mock-model">
        <div className="pp-composer">
          <Text as="p" variant="description">
            Rewrite the indicator so the pill never runs ahead of the pointer…
          </Text>
          <div className="pp-row">
            <Select defaultValue="fable" size="sm">
              <SelectTrigger variant="ghost" aria-label="Model" placeholder="Model" labels={MODELS} />
              <SelectContent align="trigger">
                {Object.entries(MODELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="solid" size="sm" icon={<ArrowUp />} aria-label="Send" />
          </div>
        </div>
        <Named name="Effort" value={effort(level)}>
          <Track look="capsule" marks min={0} max={EFFORT_STOPS} value={level} onValueChange={setLevel} format={effort} aria-label="Model effort" />
          <div className="pp-head">
            <span className="pp-small">Faster</span>
            <span className="pp-small">Smarter</span>
          </div>
        </Named>
        <span className="pp-small">
          <ValueText text={EFFORT_NOTES[level] ?? ''} />
        </span>
      </Card>
    </div>
  )
}

function Filters() {
  const [price, setPrice] = useState(240)
  const [fast, setFast] = useState(false)
  const [stocked, setStocked] = useState(true)
  const offers = Math.round((price / PRICE_STEP) * OFFERS * (fast ? FASTER_SHARE : 1) * (stocked ? STOCK_SHARE : 1))

  return (
    <div className="pp-mock">
      <Card data-testid="mock-filters">
        <CardHeader
          level={3}
          title="Filters"
          description="Headphones"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPrice(PRICE_MAX)
                setFast(false)
                setStocked(false)
              }}
            >
              Clear
            </Button>
          }
        />
        <div className="pp-stack" data-gap="group">
          <span className="pp-name">Price up to</span>
          <div className="pp-with-field">
            <Track look="line" bubble="drag" min={0} max={PRICE_MAX} step={PRICE_STEP} value={price} onValueChange={setPrice} format={dollars} aria-label="Highest price" />
            <Scrub label="$" value={price} onValueChange={setPrice} min={0} max={PRICE_MAX} step={PRICE_STEP} aria-label="Highest price value" />
          </div>
          <div className="pp-with-field">
            <div className="pp-head">
              <span className="pp-small">{dollars(0)}</span>
              <span className="pp-small">{dollars(PRICE_MAX)}</span>
            </div>
          </div>
        </div>
        <hr className="pp-rule" />
        <div className="pp-stack" data-gap="group">
          <Checkbox checked={fast} onCheckedChange={setFast}>
            Delivery by tomorrow
          </Checkbox>
          <Checkbox checked={stocked} onCheckedChange={setStocked}>
            In stock only
          </Checkbox>
        </div>
        <CardActions>
          <Button variant="solid">{`Show ${offers} offers`}</Button>
        </CardActions>
      </Card>
    </div>
  )
}

export function Mocks() {
  return (
    <div className="pp-mocks">
      <Player />
      <Inspector />
      <Reader />
      <Model />
      <Filters />
    </div>
  )
}
