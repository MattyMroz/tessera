---
kind: plan
status: in-progress
baseline: feat/e3-motion f27ab64 + niezacommitowane laboratorium
created: 2026-11-04
---

# Plan: Menubar do oceny (uwagi właściciela 04.11)

## Uwagi właściciela

1. Rodzic paska ma się dać zwężać i poszerzać w laboratorium, żeby sprawdzić chowanie menu za „…”.
2. Menu paska bogatsze: więcej zagnieżdżeń i wszystkie rodzaje wierszy.
3. Wariant `accent`: dwie pigułki nakładają się na triggerze otwartego menu; ma jechać jedna.
4. Pytanie: czy trigger paska ma mieć wciśnięcie (w MangaShift jest).
5. Wiersz z tonem (`Close project`, `danger`): pigułka ma być w kolorze tonu zawsze, także gdy kursor z niego schodzi; nigdy szara.
6. Wariant `accent`: pigułka hover w wierszach menu w kolorze akcentu, tym samym co pigułka otwartego menu na pasku (jak w MangaShift).

## Przyczyny (z kodu)

- 3: `Menubar` w `accent` rysuje dwie pigułki (`hover` i `active`); pigułka `hover` wchodzi też na trigger otwartego menu, więc stoją dwie naraz. MangaShift (`packages/ui/src/menu/menubar.tsx`, `showPointer`) chowa pigułkę hover, gdy kursor stoi na triggerze otwartego menu.
- 4: MangaShift wciska pigułki i etykietę triggera (`usePressTracker`, `setPressed`). U nas trigger paska to kotwica: wciskają się tylko etykieta i płytka `::before`, a płytka `ghost` jest przezroczysta, więc wciśnięcia nie widać.
- 5: kolor pigułki bierze się z `:has(> [data-recipe='row'][data-highlighted][data-tone=…])` (`recipes/indicator.css`). Gdy kursor schodzi z wiersza, Base UI zdejmuje `data-highlighted` od razu, a pigułka jeszcze gaśnie, więc przez ten czas jest szara.
- 6: pigułka wierszy zawsze bierze neutralny krok hover; wariant paska nie dochodzi do menu.

## Zmiany

1. Laboratorium (`apps/docs/app/components/sections/menubar.tsx`): pasek w ramce, której szerokość zmienia się uchwytem (`resize: horizontal`, bez paska przewijania); każdy wariant w takiej ramce. Menu: File, Edit, View, Insert, Format, Translate, Window, Help: ikony, skróty, wyłączone wiersze, grupy z nagłówkami, checkboxy, radio, separatory, wiersze z tonem, podmenu do trzech poziomów, jedno długie menu (przewijanie).
2. Jedna pigułka w `accent`: sterownik pigułki (`lib/indicator.ts`) dostaje element pomijany przez pigułkę hover (trigger otwartego menu); na nim stoi tylko pigułka `active`.
3. Kolor pigułki z celu, nie z podświetlenia: sterownik zapisuje na pigułce `data-tone` wiersza, na którym stoi, i trzyma go do końca gaśnięcia; reguły `:has(…)` w `indicator.css` zastępuje `[data-variant='hover'][data-tone=…]` (mniej przeliczeń stylu).
4. `accent` w menu: `Menubar` z `variant="accent"` przekazuje wariant menu, a pigułka hover wierszy bierze kolor pigułki `active` (`--ts-state-selected-fill-color`); wiersz z tonem zostaje w kolorze tonu.
5. Wciśnięcie triggera paska (rekomendacja: tak, jak MangaShift i jak każda kotwica): przy `data-pressing` na triggerze pigułka, która na nim stoi, wciska się z `--ts-motion-press-scale` (ruch tylko `scale`, czasy wciśnięcia z silnika `motion`); kotwica dalej stoi (AGENTS.md).

## Dowody

- `menubar.spec.ts`: jedna widoczna pigułka na triggerze otwartego menu w `accent` (kursor na nim i obok); pigułka wiersza `danger` w kolorze tonu w każdej klatce zejścia kursora; kolor pigułki wiersza w `accent` = kolor pigułki `active`; trigger z wciśniętą pigułką, kotwica bez `scale`; zwężenie ramki chowa menu za „…”, poszerzenie je przywraca.
- Zrzuty jasny i ciemny, klatki ruchu pigułki, `bun run check` (bez znanych czerwonych testów migracji laboratorium).

## Ocena właściciela 05.11

- Wygląd Menubara przyjęty („wyglądowo akceptuję… powiedzmy”). Otwarte: ślad wydajności przy CPU ×4 (nie zrobiony), budżet B6 `menubar.js` 3586 B > 3072 B, wciśnięcie triggerów (zasady kotwic).

## Stan 04.11

- Zrobione: 1, 2 (Format do czterech poziomów), 3, 5 i 6 z uwag; triggery paska się nie kurczą; pigułka akcentu jedzie jak szara (`follow`).
- Wciśnięcie (4): na razie bez, decyzja właściciela; wraca z zasadami wciśnięcia kotwic.
- Otwarte: animacja chowania za „…”; budżet B6 `menubar.js` 3154 B > 3072 B (bez zmian z 04.11 ok. 3090 B, przekroczony już wcześniej).
