'use client'

import { Card, CardHeader } from '@mattymroz/tessera/components/card/card'
import { Slider } from '@mattymroz/tessera/components/slider/slider'
import { Text } from '@mattymroz/tessera/components/text/text'
import Brain from 'lucide-react/icons/brain'
import Rabbit from 'lucide-react/icons/rabbit'
import Sun from 'lucide-react/icons/sun'
import SunDim from 'lucide-react/icons/sun-dim'
import Turtle from 'lucide-react/icons/turtle'
import Volume from 'lucide-react/icons/volume'
import Volume1 from 'lucide-react/icons/volume-1'
import Volume2 from 'lucide-react/icons/volume-2'
import VolumeX from 'lucide-react/icons/volume-x'
import { useState, type ReactNode } from 'react'
import { clock, effort, EFFORT_STOPS, Icon, percent, TRACK_SECONDS } from './parts'
import { Scrub } from './scrub'
import { Track } from './track'
import { ValueText } from './value-text'

type VariantProps = { readonly id: string; readonly title: string; readonly from: string; readonly note: string; readonly children: ReactNode }

function Variant({ id, title, from, note, children }: VariantProps) {
  return (
    <Card data-testid={`variant-${id}`}>
      <CardHeader level={3} title={title} description={from} />
      <div className="pp-stage">{children}</div>
      <Text as="p" variant="description">
        {note}
      </Text>
    </Card>
  )
}

function Accepted() {
  return (
    <Variant id="accepted" title="Pill with the value" from="Slider E, accepted 09.11" note="The reference: the real component. The value sits in a white pill that grows in the track.">
      <Slider min={0} max={3} defaultValue={1} format={effort} aria-label="Effort, pill" />
      <Slider min={0} max={100} defaultValue={40} format={percent} end="100%" aria-label="Opacity, pill" />
    </Variant>
  )
}

function Timeline() {
  const [time, setTime] = useState(73)
  return (
    <Variant id="timeline" title="Timeline" from="YouTube, Spotify" note="A thin line at rest. Under the pointer it thickens, the thumb appears and a bubble shows the time under the pointer before you click.">
      <div className="pp-stack">
        <Track look="timeline" bubble="peek" min={0} max={TRACK_SECONDS} value={time} onValueChange={setTime} format={clock} aria-label="Position" />
        <div className="pp-head">
          <span className="pp-small">{clock(time)}</span>
          <span className="pp-small">{clock(TRACK_SECONDS)}</span>
        </div>
      </div>
    </Variant>
  )
}

function Loudness() {
  const [volume, setVolume] = useState(64)
  return (
    <Variant id="volume" title="Volume with squishy icons" from="Arc UI Elastic, iOS" note="Drag past an end: the track stretches to a hard limit and pushes the icon on that side; on release everything springs back. The icons follow the level.">
      <Track
        look="line"
        min={0}
        max={100}
        value={volume}
        onValueChange={setVolume}
        format={percent}
        start={<Icon>{volume === 0 ? <VolumeX /> : <Volume />}</Icon>}
        end={<Icon>{volume < 50 ? <Volume1 /> : <Volume2 />}</Icon>}
        aria-label="Volume"
      />
    </Variant>
  )
}

function Steps() {
  const [level, setLevel] = useState(2)
  return (
    <Variant id="square" title="Square steps" from="Kevin @keviduk" note="A 160 × 20 track with a 4 px radius and a tick per step. The thumb waits for the pointer to reach the next tick; the name of the step cross-fades above.">
      <div className="pp-stack" data-gap="group">
        <span className="pp-step-name">
          <Icon>
            <Brain />
          </Icon>
          <ValueText text={effort(level)} />
        </span>
        <Track look="square" marks min={0} max={EFFORT_STOPS} value={level} onValueChange={setLevel} format={effort} aria-label="Effort, square" />
      </div>
    </Variant>
  )
}

function Named() {
  const [brightness, setBrightness] = useState(64)
  const [level, setLevel] = useState(1)
  return (
    <Variant id="named" title="Name and value above" from="Pratyush, Arc UI Elastic" note="The name on the left, the value on the right, the track below. Numbers change at once, words cross-fade.">
      <div className="pp-stack" data-gap="group">
        <div className="pp-head">
          <span className="pp-name">Brightness</span>
          <span className="pp-quiet">
            <ValueText text={percent(brightness)} align="end" />
          </span>
        </div>
        <Track look="line" min={0} max={100} value={brightness} onValueChange={setBrightness} format={percent} aria-label="Brightness" />
      </div>
      <div className="pp-stack" data-gap="group">
        <div className="pp-head">
          <span className="pp-name">Effort</span>
          <span className="pp-quiet">
            <ValueText text={effort(level)} align="end" />
          </span>
        </div>
        <Track look="capsule" marks min={0} max={EFFORT_STOPS} value={level} onValueChange={setLevel} format={effort} aria-label="Effort, capsule" />
        <div className="pp-head">
          <span className="pp-small">Faster</span>
          <span className="pp-small">Smarter</span>
        </div>
      </div>
    </Variant>
  )
}

function Mini() {
  const [light, setLight] = useState(0)
  const [zoom, setZoom] = useState(100)
  return (
    <Variant id="mini" title="Small, no text" from="Base UI, macOS" note="A 2 px line and a 10 px dot. The dot stops at the ends of the line, so 0 and 100 are mirror images.">
      <div className="pp-row" data-start="">
        <div className="pp-narrow">
          <Track look="mini" min={0} max={100} value={light} onValueChange={setLight} format={percent} aria-label="Light" />
        </div>
        <div className="pp-narrow">
          <Track look="mini" min={0} max={100} value={zoom} onValueChange={setZoom} format={percent} aria-label="Zoom" />
        </div>
      </div>
      <Track
        look="mini"
        min={0}
        max={100}
        value={light}
        onValueChange={setLight}
        format={percent}
        start={
          <Icon>
            <SunDim />
          </Icon>
        }
        end={
          <Icon>
            <Sun />
          </Icon>
        }
        aria-label="Light with icons"
      />
    </Variant>
  )
}

function Bubble() {
  const [speed, setSpeed] = useState(46)
  return (
    <Variant id="bubble" title="Bubble over the thumb" from="Raul, Arc UI Elastic, Material 3" note="No text at rest. The value appears over the thumb while you hold it or use the keys.">
      <Track
        look="line"
        bubble="drag"
        min={0}
        max={100}
        value={speed}
        onValueChange={setSpeed}
        start={
          <Icon>
            <Turtle />
          </Icon>
        }
        end={
          <Icon>
            <Rabbit />
          </Icon>
        }
        aria-label="Speed"
      />
    </Variant>
  )
}

function Scrubs() {
  const [x, setX] = useState(0)
  const [width, setWidth] = useState(176)
  const [opacity, setOpacity] = useState(60)
  const [price, setPrice] = useState(150)
  return (
    <Variant id="scrub" title="Scrub field" from="Figma, Blender, Arc UI Scrub" note="Drag sideways to change, click to type, arrows step, Shift steps by ten. With a range the field fills; without one a pixel is a step. Past a limit the field stretches.">
      <div className="pp-pair">
        <Scrub label="X" value={x} onValueChange={setX} unit="px" aria-label="X" />
        <Scrub label="W" value={width} onValueChange={setWidth} min={0} unit="px" aria-label="Width" />
        <Scrub label="O" value={opacity} onValueChange={setOpacity} min={0} max={100} unit="%" aria-label="Opacity" />
        <Scrub label="$" value={price} onValueChange={setPrice} min={0} max={500} step={10} aria-label="Price" />
      </div>
    </Variant>
  )
}

export function Variants() {
  return (
    <div className="pp-grid">
      <Accepted />
      <Timeline />
      <Loudness />
      <Steps />
      <Named />
      <Mini />
      <Bubble />
      <Scrubs />
    </div>
  )
}
