---
kind: decision
date: 2026-10-31
stage: E1
---

# Laboratorium czyta `dist`, nie `src`

## Fakt

Next 16.4.3 z Turbopackiem nie pozwala dodać własnego warunku rozwiązywania `exports`:

- dokumentacja dołączona do paczki (`next/dist/docs/.../turbopack.md`, opcja `resolveAlias`): „At the moment only the `browser` condition is supported”;
- `TurbopackOptions` w `next/dist/server/config-shared.d.ts` nie ma opcji warunków;
- pomiar `next dev` w `apps/docs`: CSS strony pochodzi z `packages/tessera/dist/styles/tessera.css`, gałąź `source` jest pomijana.

## Decyzja

`apps/docs` czyta `dist`, tak jak każdy konsument. `bun run dev` w korzeniu uruchamia `bun run --filter '*' --parallel dev`: `tsdown --watch` w paczce i `next dev` w laboratorium. Warunek `source` zostaje tylko dla TypeScriptu (`customConditions` w `tsconfig.base.json`), żeby typecheck nie wymagał builda.

## Odrzucone

| Wariant                                         | Powód                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `next dev --webpack` z `resolve.conditionNames` | wolniejszy dev; webpack w Next 16 jest opcją, nie domyślnym bundlerem                 |
| `turbopack.resolveAlias` paczki do `src`        | drugie źródło prawdy obok `exports`; laboratorium testowałoby co innego niż konsument |

## Skutek

- Na świeżym klonie laboratorium wymaga zbudowanej paczki; `bun run build` w korzeniu buduje workspace w kolejności zależności, a `check` uruchamia build przed testami.
- Spec U17 zaktualizowane.
- Warunek przy pierwszej publikacji (E5): w spakowanej paczce `source` wskazuje `./src/...`, którego `files` nie wysyła. Przed publikacją warunek trzeba usunąć z manifestu paczki albo pokazać, że żaden konsument go nie włącza.
