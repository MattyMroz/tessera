import './proposals.css'
import { Heading } from '@mattymroz/tessera/components/text/heading'
import { Text } from '@mattymroz/tessera/components/text/text'
import { Mocks } from './mocks'
import { Variants } from './variants'

export default function Page() {
  return (
    <>
      <div className="pp-stack" data-gap="group">
        <Heading level={1} variant="display">
          Proposals: the slider family
        </Heading>
        <div className="pp-intro">
          <Text as="p" variant="description">
            Every slider works: click anywhere on the track, drag, drag past an end, use the arrows, Page Up, Page Down, Home and End. Numbers change at once, words cross-fade.
          </Text>
        </div>
      </div>
      <section aria-labelledby="variants-title" className="pp-body">
        <Heading level={2} id="variants-title">
          The family
        </Heading>
        <Variants />
      </section>
      <section aria-labelledby="mocks-title" className="pp-body">
        <Heading level={2} id="mocks-title">
          In real places
        </Heading>
        <Mocks />
      </section>
    </>
  )
}
