import { LAB_ELEMENTS } from './elements'

export default function Page() {
  return (
    <>
      <h1>Tessera lab</h1>
      {LAB_ELEMENTS.map(({ id, Section }) => (
        <div key={id} id={id}>
          <Section />
        </div>
      ))}
    </>
  )
}
