---
kind: decision
date: 2026-11-01
stage: E3
---

# Zestaw ikon: lucide

## Decyzja

Tessera i jej aplikacje biorą ikony z lucide (`lucide-react` 1.66.0). Wybrał prowadzący z upoważnienia właściciela („przy wyborze wybieraj te najlepsze”), bez porównania trzech zestawów na ekranach, które plan E3 przewidywał w fazie 0 (D76, krok 4). Właściciel może wybór zmienić po obejrzeniu ikon w laboratorium; wtedy wraca porównanie z D76.

## Powód

- Grubość kreski z silnika działa bez wyjątków. Ikona lucide to sama kreska (`fill="none"`, `stroke="currentColor"`) na `viewBox` 24, więc przepisy `control` i `row` nadpisują jej `stroke-width` wyjściem `--ts-size-icon-stroke` (U7) tak samo jak dla każdej ikony aplikacji.
- Zero migracji pierwszego konsumenta. MangaShift już używa lucide: `lucide-react` jest w katalogu korzenia (`^1.47.0`) i w `desktop`, `packages/ui` i `web`, a import z `lucide-react` ma 124 pliki desktopu i starego kitu.
- Import ikona po ikonie. Każda ikona ma własny moduł `lucide-react/icons/<nazwa>` (wpis `./icons/*` w `exports`), a paczka deklaruje `sideEffects: false`, więc do `dist` i do bundla konsumenta trafiają tylko użyte ikony, także w trybie dev bez tree-shakingu.
- Wspiera React 19 (peer `react` `^16.5.1 || … || ^19.0.0`), licencja ISC.

## Odrzucone

- **Phosphor** (`@phosphor-icons/react` 2.1.10): ikona to wypełniony kontur na `viewBox` 256 (`fill="currentColor"`, np. `check.svg` w `@phosphor-icons/core` 2.1.1), a grubość to sześć osobnych rysunków (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`). Silnik `size` nie zmieni grubości konturu, więc U7 by na nim nie działało, a grubość ikon nie szłaby za rozmiarem kontrolki.
- **Tabler** (`@tabler/icons-react` 3.50.0): też kreska na `viewBox` 24 (`stroke-width="2"`), więc silnik grubości by działał, i ma więcej ikon (5203 w `outline` wobec 2015 w lucide). Przegrywa, bo konsument używa lucide: Tabler oznaczałby wymianę ikon w 124 plikach MangaShift przy migracji desktopu (E5) albo dwa zestawy w jednej aplikacji z dwoma rysunkami tej samej ikony.

## Skutek dla paczki

- Zależność: `lucide-react` w `dependencies` paczki `packages/tessera`, wersja w `catalog` korzeniowego `package.json` (`^1.66.0`); `apps/docs` bierze ten sam wpis katalogu. Paczka po `bun pm pack` ma w `dependencies` zwykły zakres wersji.
- Glify Tessery pochodzą z zestawu: wskaźnik zajętości przycisku to `LoaderCircle` (`components/button/button.tsx`), ptaszek pozycji menu z zaznaczeniem `Check`, a strzałka podmenu `ChevronRight` (`components/menu/menu.tsx`). Własne rysunki SVG w komponentach zniknęły. Następne glify (minus stanu `mixed`, zamknięcie) też biorą ikony lucide.
- Ikona w komponencie nie dostaje propsów wyglądu (`size`, `strokeWidth`, `width`, `height`, `className`, `style`): rozmiar daje slot ikony, a grubość przepis. Atrybuty, które lucide wpisuje sam (`width`, `height`, `stroke-width="2"`, klasa `lucide`), przegrywają z CSS przepisu.
- Import wyłącznie przez domyślny eksport modułu jednej ikony: `import Check from 'lucide-react/icons/check'`. Zbiorczy import z `lucide-react` jest zakazany w paczce (test niżej).
- Laboratorium (`apps/docs`) używa ikon lucide zamiast własnych `<svg>`.

## Jak sprawdzono

- `npm view` (2026-11-01): `lucide-react` 1.66.0 (`latest`), `@tabler/icons-react` 3.50.0, `@phosphor-icons/react` 2.1.10; rysunki porównane w plikach `@tabler/icons` 3.50.0 (`icons/outline/check.svg`) i `@phosphor-icons/core` 2.1.1 (`assets/regular/check.svg`); liczba ikon: pliki rysunków Tablera (`outline`) i moduły lucide z `createLucideIcon` (bez aliasów).
- `test/package/package.test.ts`: paczka z `bun pm pack` ma `lucide-react` w `dependencies` z zakresem wersji, a każdy import zestawu w zbudowanym `dist` to domyślny import modułu `lucide-react/icons/<nazwa>`; zbiorczy import, import nazwany, `export … from` i dynamiczny `import()` z `lucide-react` oblewają test. Ten sam plik importuje każdy wpis `exports` w konsumencie Node, więc moduły ikon rozwiązują się z paczki.
- `apps/docs/tests/button.spec.ts`: wskaźnik zajętości to `LoaderCircle` na `viewBox` 24, ukryty przed czytnikiem ekranu, z grubością kreski równą `--ts-size-icon-stroke`; `lab.spec.ts` sprawdza to samo nadpisanie atrybutu dla każdego rozmiaru w kontrolce i wierszu.
