import Link from 'next/link'

export default function Page() {
  return (
    <>
      <h1>Tessera lab</h1>
      <ul className="flex flex-col gap-inset">
        <li>
          <Link href="/foundation">Foundation</Link>: every output of the nine engines
        </li>
        <li>
          <Link href="/components">Components</Link>: each component in several situations
        </li>
        <li>
          <Link href="/screens/overlays">Overlays</Link>: overlays in overlays, every control on three levels
        </li>
        <li>
          <Link href="/screens/edges">Edges</Link>: every component and the foundation at their extremes
        </li>
        <li>
          <Link href="/stress">Stress</Link>: the measuring scene of the budgets, mounted on demand
        </li>
      </ul>
    </>
  )
}
