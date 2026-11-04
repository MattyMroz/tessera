---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, HEAD 378bcee + niezacommitowany working tree (stan z 2026-11-01, w trakcie równoległych poprawek innego wykonawcy)
date: 2026-11-01
---

# Review: jakość kodu laboratorium `apps/docs`

## Zakres

- przedmiot: `apps/docs/app/**` (strony, `components/sections/*`, `screens/**`, `foundation/*`, `stress`, `panel.tsx`, `layout.tsx`), `apps/docs/tests/**`, `apps/docs/perf/**`, konfiguracje `apps/docs/*` oraz korzeniowe `eslint.config.js`, `package.json`, `vitest.config.ts`.
- baseline: bieżący working tree; inny wykonawca równolegle poprawia błędy, więc numery linii mogą się przesunąć o kilka pozycji.
- authority: wymaganie właściciela („prosto, bez zawiłości, wszystko w odpowiednim zakresie i miejscu, bez redundancji, bez dziwnych konstrukcji, najlepsze praktyki React i TS/JS”), globalna reguła „zero legacy”, skill `simple` (jedno źródło prawdy, DRY wiedzy, a nie linii).
- ryzyka: duplikacja wiedzy, która się rozjedzie; niespójne wzorce między plikami; pliki-worki; testy ze sztywnymi odczekaniami.
- poza review: poprawność zachowania komponentów biblioteki, wygląd, wydajność, CI.

## Werdykt

**Status:** FAIL (względem progu jakości właściciela, nie poprawności działania).

**Najważniejszy powód:** kod jest ściśle typowany i w większości pisany pętlami po danych, ale ta sama wiedza (lista stron, warianty przycisku, długi tekst, zestawy opcji, nazwy tokenów ruchu, stałe testów) żyje w 3–5 kopiach. Do tego dochodzi pięć różnych opakowań sekcji, dwa pliki-worki po 600–900 linii (`foundation/page.tsx`, `tests/helpers.ts`, `tests/lab.spec.ts`, `tests/edges.spec.ts`) i 14 sztywnych `waitForTimeout`. Struktura się nie powtarza: każda strona ma własny wzór, więc czytelnik musi się go uczyć od nowa. Właśnie to właściciel nazwał burdelem.

Na plus: `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`, brak `any`, tylko 4 rzutowania, klucze stabilne. Sekcje `screens/edges/sections/*` są małe i jednolite (to wzorzec do skopiowania). Dane w większości idą pętlami.

## Findings

### Poważne

#### P1. Pięć różnych opakowań sekcji zamiast jednego

- miejsce: `components/sections/*.tsx` (16 razy ręcznie `<section aria-labelledby="x-title" className="flex flex-col gap-group"><h2 id="x-title">`), `screens/edges/page.tsx:55` (`Foundation`, `aria-label`), `screens/edges/edge.tsx:12` (`Edge`, `aria-label`), `foundation/page.tsx:118` (`Section`, bez nazwy dostępnej, więc to nie jest landmark `region`), `stress/page.tsx:62` (`Region`, kopia `Foundation`), `screens/overlays/page.tsx:156-182` (gołe `<section aria-label>`).
- dowód: ten sam kształt (sekcja + h2 + `flex flex-col gap-group`) zapisano na pięć sposobów, z trzema różnymi sposobami nazywania. Nazwa `Foundation` w edges myli się ze stroną `/foundation`.
- wpływ: brak jednego wzoru, a każda strona wygląda inaczej w kodzie. Sekcje fundamentu nie są regionami, więc testy muszą je łapać po `data-testid`.
- minimalna reakcja: jeden `app/lab/section.tsx` → `LabSection({ title, children, ...data })` (h2 z `id` ze sluga + `aria-labelledby`). Zastąpić nim wszystkie pięć wariantów; `Edge` składa się z `LabSection` i dwóch ramek. Stare nazwy (`Foundation`, `Section`, `Region`) usunąć w tym samym diffie.

#### P2. Ta sama wiedza w wielu kopiach

- lista stron laboratorium: `layout.tsx:22-28` (bez Stress), `page.tsx:7-23` (ze Stress), `tests/a11y.spec.ts:5`, `tests/edges.spec.ts:28`. Nawigacja i strona główna już się rozjechały.
- warianty przycisku: `components/sections/button.tsx:14`, `stress/page.tsx:39` (inna kolejność), `tests/button.spec.ts:8`, `tests/symmetry.spec.ts:18`, `foundation/page.tsx:36` (`TONE_VARIANTS`). Warianty badge: `components/sections/badge.tsx:10`; toggle group: `components/sections/toggle-group.tsx:9`. Biblioteka eksportuje `TONES` jako stałą, a warianty tylko jako typy (`packages/tessera/src/components/button/button.tsx:20`, `badge/badge.tsx:8`, `toggle-group/toggle-group.tsx:31`), więc każdy konsument przepisuje listę ręcznie.
- długi tekst `LONG`: `screens/edges/edge.tsx:3`, `tests/edges.spec.ts:34`, `tests/button.spec.ts:13`.
- nazwy wyjść silnika ruchu: `foundation/page.tsx:18-22` i `tests/lab.spec.ts` (`MOTION_NAMES`, ok. l. 105); `BAR_VALUE = 0.4` w `foundation/page.tsx:32` i w `tests/lab.spec.ts`.
- `TOOLS` (pasek narzędzi): `components/sections/tooltip.tsx:10`, `screens/edges/page.tsx:35`, `screens/overlays/page.tsx:34`.
- `RANGES` Day/Week/Month: `components/sections/toggle-group.tsx:10`, `screens/edges/page.tsx:41`, `tests/toggle-group.spec.ts:22`; zestawy opcji `COUNTS` (`components/sections/toggle-group.tsx:11`) i `GROUPS` (`screens/edges/page.tsx:44`) to prawie ta sama tabela.
- osie motywu przepisane ręcznie: `foundation/page.tsx:24` (`SIZES`), `tests/toggle-group.spec.ts:23-24` (`CORNERS`, `CURVES`), choć istnieje `THEME_CONFIG.axes`.
- zasada: jedno źródło prawdy; DRY wiedzy.
- minimalna reakcja: `app/lab/pages.ts` (jedna tablica `{ href, title, summary }`) dla nawigacji, strony głównej i obu specyfikacji. `app/lab/samples.ts` na `LONG`, `TOOLS`, `RANGES`, zestawy opcji. Testy importują z tych modułów. Osie zawsze z `THEME_CONFIG.axes`. Warianty: patrz paczka R0 (decyzja właściciela, bo to zmiana API biblioteki).

#### P3. `foundation/page.tsx` ma 606 linii, czternaście sekcji i wyłączony strażnik na cały plik

- miejsce: `apps/docs/app/foundation/page.tsx`, `eslint.config.js:28-32` (`tessera/no-local-appearance: off` dla całego pliku).
- dowód: w jednym pliku są definicje stylów inline (`text`, `tile`, `checkBox`, `track`, `thumb`, `rail`, `barFill`, l. 46-108), pięć komponentów pomocniczych, listy tokenów i 14 sekcji. Pomocnik `Control` (l. 136) istnieje, a ten sam markup `<span data-recipe="control" ...><span data-slot="label">` jest wpisany ręcznie jeszcze kilkanaście razy (l. 286, 290, 302, 391, 420, 424, 529-573). Sekcja State to siedem niemal identycznych bloków (l. 528-578).
- wpływ: plik trudno czytać; wyjątek od reguły lintera obejmuje także kod, który go nie potrzebuje.
- minimalna reakcja: `foundation/page.tsx` składa tylko sekcje; `foundation/sections/<nazwa>.tsx` (color, type, motion, space, size, geometry, shape, recipes, tones, text, tree, depth, state, focus); `foundation/styles.ts` na obiekty `CSSProperties`; `foundation/tokens.ts` na listy nazw tokenów, które importuje też `lab.spec.ts`. `Control` przyjmuje `variant`, `size` i atrybuty stanu, a stany idą pętlą po tablicy. Wyjątek ESLint zawęzić do `foundation/styles.ts` i sekcji, które naprawdę rysują tokeny.

#### P4. `tests/helpers.ts` ma 719 linii i jest workiem siedmiu dziedzin

- miejsce: `apps/docs/tests/helpers.ts`.
- dowód: w jednym pliku są nawigacja i motyw (`visit`, `hydrated`, `choose`), matematyka kolorów (`colorOf`, `alphaOf`, `srgbOf`, `luminance`, `contrast`), śledzenie CDP i ramki ruchu (`startTrace`, `motionFrames`, `motionWork`), liczenie warstw kompozytora (l. 214-371), nagrywanie animacji i sonda commitów Reacta przez prywatne pola fibera (l. 373-454), konteksty skrajności (l. 501-536), geometria przepełnień (l. 544-605) i luki optyczne (l. 607-719). Dodatkowo:
  - ten sam selektor ma dwie nazwy: `INDICATOR` (l. 44) i `PILL` (l. 250);
  - `frameOf` to dwie różne rzeczy: lokalna funkcja w `motionFrames` (l. 167) i eksportowa wersja dla warstw (l. 295);
  - sonda „utwórz span, odczytaj computed, usuń” jest skopiowana w `colorOf` (l. 97), `srgbOf` (l. 117), `raisedShadow` (l. 490) i `tests/a11y.spec.ts:14`;
  - `TOLERANCE = 0.5` jest zdefiniowane dwa razy w samym pliku (l. 546, 601);
  - stałe są rozsiane po pliku (l. 36-55, 250-258, 513);
  - eksporty bez konsumenta: `TraceEvent`, `RecordedAnimation`, `CommittedRender`, `COMPOSITOR_PROPERTIES`, `MotionWork`, `LayerPart`, `CountedLayer`, `LayerWatch`, `EdgeContext`, `EdgeMedia` (sprawdzone grep po `tests/*.ts` i `perf/*.ts`);
  - pomocniki używane tylko w jednej specyfikacji: `overflowProblems`, `windowProblems`, `pageScroll`, `INTERACTIVE_CONTROL`, `EDGE_*` (tylko `edges.spec.ts`) oraz `opticalGaps` (tylko `symmetry.spec.ts`).
- wpływ: nie da się zrozumieć jednej dziedziny bez przewinięcia pozostałych; duplikaty i niejednoznaczne nazwy wprowadzają w błąd.
- minimalna reakcja: `tests/support/` z plikami według dziedzin: `navigation.ts`, `color.ts`, `trace.ts`, `layers.ts`, `probes.ts` (animacje + commity), `edges.ts` (konteksty, przepełnienia, okno), `optics.ts`. Jedna stała `INDICATOR`, jedna funkcja-sonda `computedOf(page, property, value)`, eksport tylko tego, czego ktoś używa. Stary `helpers.ts` usunąć w tym samym diffie.

#### P5. Specyfikacje powtarzają pomocniki i stałe

- `TOLERANCE = 0.5` w 14 specyfikacjach (`alert`, `badge`, `button-group`, `button`, `edges`, `field`, `kbd`, `lab`, `menu`, `symmetry`, `textarea`, `toggle-group`; `alert-dialog` ma 1).
- `region(page, name)` / `section(page)` = `page.getByRole('region', { name, exact: true })` w 11 plikach (`alert-dialog:9`, `alert:8`, `badge:10`, `budgets:32`, `button-group:30`, `edges:118`, `field:11`, `kbd:10`, `lab:143`, `symmetry:44`, `textarea:11`).
- typ `Box` na trzy sposoby: `alert-dialog.spec.ts:173`, `button-group.spec.ts:14`, `edges.spec.ts:57`, a `box()` z helpers zwraca typ anonimowy.
- ścieżki `PAGE`/`EDGES`/`FOUNDATION`/`OVERLAYS` zapisane jako literały w każdym pliku.
- `activePill` w `edges.spec.ts:126` i wersja w `toggle-group.spec.ts`.
- minimalna reakcja: `tests/support/locators.ts` (`region`, `activePill`, `hoverPill`, `row`), `tests/support/constants.ts` (`TOLERANCE`, `SETTLE` po P6, ścieżki z `app/lab/pages.ts`) i eksport `type Box`.

#### P6. Sztywne odczekania zamiast warunków

- miejsce: `waitForTimeout(SETTLE)` w `edges.spec.ts:516, 520, 610, 813`, `lab.spec.ts:494, 728`, `menu.spec.ts:110, 145, 154, 232`, `toggle-group.spec.ts:140, 293, 360, 406`; `SETTLE` zdefiniowane czterokrotnie jako 600 i raz jako 300 (`menu.spec.ts:21`).
- dowód: `helpers.ts:325` ma `settle(page)`, czyli czekanie na koniec animacji plus dwie klatki, ale specyfikacje go nie używają.
- wpływ: testy są wolniejsze i podatne na flaki; liczba 600 ms nie wyraża żadnego warunku.
- minimalna reakcja: `await settle(page)` albo `expect.poll`. Uzasadnione wyjątki, które zostają: `toggle-group.spec.ts:181` (reset typeahead z biblioteki) i `button.spec.ts:211` (dowód nieobecności nowej karty), każdy ze stałą nazwaną od warunku.

#### P7. Dwa pliki testów-worki po ok. 890 linii

- `tests/lab.spec.ts` (889 linii, 38 testów) miesza geometrię fundamentu, tony, stan, fokus, skrypt motywu przed pierwszą klatką, ruch na `/screens/overlays`, warstwy kompozytora i stos warstw dialogów. Nazwa „lab” nie mówi, co plik sprawdza.
- `tests/edges.spec.ts` (883 linie, 32 testy) miesza układ, przepełnienia, zoom, forced colors, dotyk, kolekcje i zakres poddrzewa.
- minimalna reakcja: podział według kontraktu, np. `foundation.spec.ts` (rozmiar, kształt, geometria, stany, tony), `theme.spec.ts` (zapisane wybory, tryb systemowy, fokus), `compositor.spec.ts` (warstwy, ślad ruchu); `edges-layout.spec.ts`, `edges-overflow.spec.ts`, `edges-forced-colors.spec.ts`, `edges-input.spec.ts` (mysz, dotyk), `edges-scope.spec.ts`.

### Mniejsze

- **M1. Zbędne `'use client'`.** Wszystkie komponenty biblioteki mają własne `'use client'` (sprawdzone `grep -L` po `packages/tessera/src/components`), a sekcje `components/sections/alert.tsx:1`, `badge.tsx:1`, `card.tsx:1`, `field.tsx:1`, `kbd.tsx:1`, `textarea.tsx:1` nie mają stanu, efektów ani handlerów. Sekcje `dialog`, `menu`, `popover`, `input`, `text` poprawnie są serwerowe, więc wzór jest niespójny. Usunąć dyrektywę z tych sześciu plików.
- **M2. Surowa powierzchnia „karty” skopiowana 7 razy.** `data-recipe="surface" data-level="raised" data-surface="" data-inset="card"` + `flex flex-wrap items-center gap-inset` stoi w `components/sections/button-group.tsx:78`, `button.tsx:130`, `dialog.tsx:64`, `input.tsx:32`, `menu.tsx:75`, `popover.tsx:62`, `toggle-group.tsx:117`; podobnie w `screens/overlays/page.tsx:159-177` i `screens/edges/page.tsx:78-86`. Klasa `flex flex-wrap items-center gap-inset` występuje 44 razy. Wydzielić `app/lab/layout.tsx` z `Row` i `RaisedFrame` (albo użyć `Card` z biblioteki, jeśli surowa powierzchnia nie jest celowa).
- **M3. Lokalny `Card` zasłania kartę z biblioteki.** `screens/edges/page.tsx:76` definiuje własny `Card` z surowych atrybutów, podczas gdy `composition.tsx` i `sections/card.tsx` importują `Card` z biblioteki. Zmienić nazwę na `ContainerProbe` albo zbudować go z `Card` + `CardActions`.
- **M4. Powtórzony JSX mimo istniejącego komponentu.** `screens/edges/page.tsx:224-230` i `179-185` przepisują `Range` (l. 64) zamiast go użyć (różnica tylko w `variant`; wystarczy dodać prop). `screens/overlays/page.tsx:101-115` (`NestedPopover`) i `117-131` (`QuickEdit`) różnią się tylko trzema napisami; wystarczy jeden komponent z propsami. `screens/edges/overflow.tsx` ok. l. 212-240: ciała `Dialog` i `AlertDialog` są identyczne.
- **M5. Trzy równoległe rejestry „każdy komponent”.** `components/sections/*`, `screens/edges/sections/*` i `screens/edges/overflow.tsx` (`COMPONENTS`, ok. l. 58) mają po 16–17 pozycji. Nowy komponent wymaga trzech dopisań, a test nie wychwyci pominięcia. Sugestia: jedna lista nazw komponentów w `app/lab/components.ts` i test, że każda ma sekcję, krawędź i przypadek przepełnienia.
- **M6. Niespójne nazwy plików i eksportów w `screens/edges`.** Są tam `indicator-samples.tsx`, `scope-sample.tsx`, `composition.tsx`, `overflow.tsx` i `blocked.tsx` (eksportuje `BlockedSample`). Ujednolicić do `samples/<nazwa>.tsx` z eksportem `<Nazwa>Sample`.
- **M7. Dziwne konstrukcje.**
  - `components/sections/tooltip.tsx:42`: `label.split(' ')[0]` wylicza napis przycisku z treści podpowiedzi; lepsze są jawne pary `{ label, tip }`.
  - `components/sections/toggle-group.tsx:49`: `key={labels.length}` jako klucz, a nazwa `COUNTS` oznacza tam zestawy etykiet, w `badge.tsx:11` liczby.
  - `screens/edges/edge.tsx:6`: wymagany prop `'data-edge-component'` z myślnikiem zamiast `component: string` mapowanego na atrybut.
  - `panel.tsx:10`: `OPTIONS` poszerza typ osi do `string[]`, przez co potrzebne są strażniki `isChoice` (l. 33, 55), a l. 36 i tak sięga do `THEME_CONFIG.axes.mode`.
- **M8. Martwe kotwice.** `screens/edges/sections/button.tsx:21` (`#button-edge`) i `sections/card.tsx:19` (`#card-edge`) wskazują id, których nie ma (`Edge` nie nadaje id).
- **M9. Konflikt nazw ikon.** `Link` z `lucide-react/icons/link` (`components/sections/field.tsx:7`, `screens/edges/sections/field.tsx:3`, `overflow.tsx`) obok `Link` z `next/link` (`layout.tsx`, `page.tsx`, `components/sections/button.tsx:11`). Importować jako `LinkIcon`.
- **M10. Rzutowanie zamiast deklaracji.** `tests/alert-dialog.spec.ts:124, 126` używa `window as unknown as { closingChanges }`, a `helpers.ts:27-34` ma już `declare global interface Window`. Dopisać pole do deklaracji.
- **M11. Pominięcia powtarzane w każdym teście.** `test.skip(browserName !== 'chromium', ...)` stoi w każdym teście bloku: `edges.spec.ts:605, 628, 685, 700` (cały blok „in forced colors”) i `lab.spec.ts:554, 566, 594` (blok DPR). Wystarczy jedno `test.skip` na poziomie `describe`.
- **M12. Atrybuty testowe w kilku konwencjach.** Używane są `data-testid`, `data-edge-component`, `data-edge-open`, `data-overflow-component`, `data-overflow-case`, `data-overflow-open`, `data-overflow-tall`, `data-part`, `data-variable`. Sugestia: role i nazwy dostępne tam, gdzie się da, a resztę ujednolicić do jednego prefiksu (`data-lab-*`).
- **M13. Konfiguracje.**
  - `perf/playwright.config.ts` powiela `playwright.config.ts` (PORT, ORIGIN, webServer, use); wystarczy wspólna baza.
  - `eslint.config.js:13`: blok bazowy ma `files: ['**/*.{js,ts,tsx}']` bez `.mjs`, a blok laboratorium (l. 25) z `.mjs`, więc `postcss.config.mjs` dostaje regułę Tessery bez reguł bazowych.
  - `perf/last.json` (wynik z jednej maszyny) nie jest ani ignorowany, ani zacommitowany. Trzeba zdecydować: baza porównawcza w repo czy `.gitignore`.
  - `tests/serve.ts` to serwer statyczny, a nie test; jego miejsce to `apps/docs/scripts/serve.ts`.

### Sugestie

- `stress/page.tsx` jest w całości kliencki tylko z powodu przycisku montującego scenę. Mały kliencki `MountOnDemand` z `children` pozwoliłby `Scene` zostać serwerowym. Zysk jest niewielki, ale wzór lepszy.
- `screens/edges/page.tsx` (307 linii) po P1 i M6 powinien tylko składać sekcje, a samples z „Foundation” przenieść do `samples/`.
- `layout.tsx` po P2 renderuje nawigację z `pages.ts`, a strona główna listę z tego samego źródła.

## Zgodność z kontraktem właściciela

- „bez redundancji”: fail; P2, P5, M2, M4, M5.
- „wszystko w odpowiednim miejscu i zakresie”: fail; P3, P4, P7, M13 (`serve.ts`).
- „bez dziwnych konstrukcji”: częściowo; M7, M3, M9.
- „najlepsze praktyki React”: częściowo; M1 (`'use client'`), klucze poprawne poza M7, efekty poprawne (`live-values.tsx` sprząta listener).
- „najlepsze praktyki TS”: pass z uwagami; strict, brak `any`, 4 rzutowania (`helpers.ts:151, 277` uzasadnione granicą CDP; `alert-dialog.spec.ts:124, 126` do usunięcia).
- „najlepsze praktyki Playwright”: fail; P6, M11, P5.

## Wykonane kontrole

```text
odczyt wszystkich plików apps/docs/app/** (strony, sekcje, screens, foundation, stress, panel, layout)
odczyt tests/helpers.ts w całości, nagłówków i konspektów specyfikacji, wybranych fragmentów (button, toggle-group, edges, lab, a11y, alert-dialog, budgets)
odczyt perf/stress.perf.ts (l. 1-80), obu konfiguracji Playwright, eslint.config.js, package.json, vitest.config.ts, tsconfig.base.json
grep: konsumenci każdego eksportu helpers.ts; 'use client' w bibliotece i w laboratorium; duplikaty stałych (TOLERANCE, SETTLE, LONG, VARIANTS, CORNERS, Box, region)
wc -l: rozmiary plików apps/docs
```

## Niewykonane lub nierozstrzygające kontrole

- Bez buildu, typecheck, lint i testów (zakaz w zleceniu), więc twierdzenia o nieużywanych eksportach opierają się na grep, nie na knip.
- Nie czytano w całości `menu.spec.ts`, `symmetry.spec.ts`, `field.spec.ts`, `text.spec.ts`, `kbd.spec.ts`, `badge.spec.ts`, `card.spec.ts`, `textarea.spec.ts`, `tooltip.spec.ts`, `button-group.spec.ts` ani drugiej połowy `perf/stress.perf.ts`; findingi o nich pochodzą z grep po wzorcach.
- Nie oceniano, czy surowe atrybuty receptur w sekcjach (M2) są celowym testem przepisu, czy skrótem.

## Plan refaktoru

Reguła dla każdego wykonawcy: zero legacy. Stara nazwa, plik i kopia znikają w tym samym diffie, nie zostają aliasy ani reeksporty „dla zgodności”. Bez komentarzy w kodzie (Tessera). Testy uruchamia tylko integrator, z jawnym limitem procesów. Paczki R2–R4 dotykają rozłącznych plików i mogą iść równolegle; reszta idzie po kolei.

0. **R0, decyzja właściciela, biblioteka (opcjonalne, ale usuwa źródło P2).** Eksportować stałe wariantów jak `TONES`: `BUTTON_VARIANTS`, `BADGE_VARIANTS`, `TOGGLE_GROUP_VARIANTS` (typy wyprowadzone przez `[number]`). Pliki: `packages/tessera/src/components/{button/button,badge/badge,toggle-group/toggle-group}.tsx`. Bez tej zgody R1 trzyma jedną lokalną listę w `app/lab/samples.ts`.
1. **R1, fundament laboratorium.** Nowe `app/lab/section.tsx` (`LabSection`), `app/lab/layout.tsx` (`Row`, `RaisedFrame`), `app/lab/pages.ts`, `app/lab/samples.ts` (`LONG`, `TOOLS`, `RANGES`, zestawy opcji, warianty). Przepiąć `layout.tsx`, `page.tsx`, `panel.tsx` (M7: typ osi bez poszerzania). Warunek: `Section`, `Region`, `Foundation` i lokalne kopie list nie istnieją (grep pusty).
2. **R2, sekcje komponentów** (`components/sections/*`): `LabSection` + `Row` + `RaisedFrame`, usunięcie zbędnego `'use client'` (M1), `tooltip.tsx` z jawnymi parami (M7), `toggle-group.tsx` z kluczem i nazwą z danych, `LinkIcon` (M9).
3. **R3, fundament** (`foundation/*`): podział na `sections/`, `styles.ts`, `tokens.ts`; `Control` z wariantem, stanami i pętlą; zawężenie wyjątku w `eslint.config.js` (P3).
4. **R4, ekrany** (`screens/**`, `stress/page.tsx`): `samples/` z jednolitym nazewnictwem (M6), `Range` z `variant`, jeden komponent zamiast `NestedPopover`/`QuickEdit`, wspólne ciało dialogów w `overflow`, `ContainerProbe` zamiast lokalnego `Card` (M3), martwe kotwice (M8), `Edge` z propem `component`, `stress` przez `MountOnDemand`.
5. **R5, wsparcie testów** (po R1, bo importuje `pages.ts` i `samples.ts`): `tests/support/*` według dziedzin (P4), `locators.ts` i `constants.ts` (P5), eksport `type Box`, rozszerzenie `Window` (M10), usunięcie `helpers.ts` i nieużywanych eksportów. Przepiąć importy we wszystkich specyfikacjach i `perf/stress.perf.ts`.
6. **R6, specyfikacje** (po R5): `waitForTimeout` → `settle`/`expect.poll` (P6), `test.skip` na poziomie `describe` (M11), osie z `THEME_CONFIG`, podział `lab.spec.ts` i `edges.spec.ts` (P7). Warunek: liczba testów przed i po taka sama (`playwright test --list`), zero `waitForTimeout` poza dwoma nazwanymi wyjątkami.
7. **R7, konfiguracje** (na koniec): wspólna baza Playwright, `.mjs` w bloku bazowym ESLint, `tests/serve.ts` → `scripts/serve.ts` (z poprawką `webServer.command` w obu konfiguracjach), decyzja o `perf/last.json` (M13).
8. **Kontrola integratora po każdej paczce:** `bun run typecheck`, `bun run lint`, `bun run build`, a po R5–R6 `bun run --filter @mattymroz/tessera-docs test:browser` (Playwright ma `workers: 1`). Na koniec grep na stare nazwy: `Foundation(`, `function Section`, `function Region`, `helpers'`, `const TOLERANCE`, `const SETTLE`, `const LONG`.

## Ograniczenia review

- Stan zmienia się równolegle (inny wykonawca), więc linie są przybliżone.
- Ocena dotyczy struktury i czytelności, nie poprawności zachowania ani wyglądu.
