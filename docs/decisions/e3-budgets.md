---
kind: decision
date: 2026-11-01
stage: E3 (faza 1)
---

# Budżety B1–B8, pomiary T1–T5, N8 i S-A

## Odpowiedź

- B1–B8 są testami w `bun run check` i przechodzą na kodzie E2: B1–B5 w `apps/docs/tests/budgets.spec.ts` (Chromium), B6 i B8 w `packages/tessera/test/package/budget.test.ts`, B7 bez zmian w `apps/docs/tests/lab.spec.ts`.
- T1–T5 mierzy `bun run perf` (`apps/docs/perf/`), punkt odniesienia w `apps/docs/perf/last.json`. Po zmianie N8 cel spełnia T3 przy 1x (14–15 ms); T1, T2, T4 i T5 przy 4x nadal są ponad celem (tabela „T1–T5”). Spec traktuje T1–T5 jako raport, nie bramkę, więc progi zostają, a decyzja należy do właściciela.
- **N8 zamknięte: krok rampy.** Stan kontrolki i wiersza to krok rampy koloru tła bez przejścia, nakładka `::after` znika. Hover wiersza przy 4x: 24,48 → 7–8 ms, warstwy 5 → 1, T2 hover 40,34 → 10,5–12,4 ms, T3 (4x) 211 → 84–127 ms; cel T2 4 ms nadal nie jest spełniony.
- **S-A: podmiot `:has` nie wchodzi.** T3 i T5 z podmiotem różnią się od wersji bez podmiotu mniej niż rozrzut pomiaru (D74).
- **axe: 10 z 10 zielonych.** Etykieta na pełnym wypełnieniu `danger`, `info` i akcentów `red`, `blue`, `violet`, `purple`, `rose` jest teraz ciemnym atramentem zamiast białej; wypełnienia zostają bez zmian (sekcja „Kontrast etykiety na wypełnieniu”).
- **B3 obejmuje zmianę wyboru w `ToggleGroup`:** 1 commit zamiast 2 (sekcja „B3: zmiana wyboru”).
- Czas `check` (suma kroków) wzrósł z 3,3 min do 4,7 min, czyli 1,41 × E2. Mieści się w limicie 1,5 ×.

## Definicje i testy

| ID  | Definicja w teście                                                                                                                                                                                                                                                                                                                                                                  | Test (plik: nazwa)                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Rejestrator animacji (`recordAnimations`) nie widzi właściwości spoza `transform`, `translate`, `scale`, `rotate`, `opacity`. Trace nie ma zdarzeń `compositeFailed` ani `unsupportedProperties`. Lista wyjątków Q2 jest pusta, więc pliku wyjątków nie ma (G5).                                                                                                                    | `budgets.spec.ts`: „moves … only on the compositor, with no layout and no paint between its first and last frame”, sześć scen                                         |
| B2  | Zero zdarzeń `Layout` i `Paint` w klatkach wewnętrznych ruchu (metoda niżej).                                                                                                                                                                                                                                                                                                       | jw.; test negatywny „catches a layout started inside a moving subtree”                                                                                                |
| B3  | Licznik commitów Reacta (`installCommitProbe`, `window.labCommits`): hover i wciśnięcie `Button`, hover i wciśnięcie wybranej opcji `ToggleGroup` oraz zmiana wyboru (klik innej opcji) dają najwyżej 1 commit.                                                                                                                                                                     | `budgets.spec.ts`: „commits at most once for a hover or a press of a button and of the chosen option and for a change of the choice”                                  |
| B4  | Zmiana `accent` i `corners` w panelu nie renderuje żadnego komponentu poza panelem na `/screens/overlays`, `/screens/edges` i zamontowanym `/stress`. Test przeniesiony z `lab.spec.ts`.                                                                                                                                                                                            | `budgets.spec.ts`: „changes a theme axis without re-rendering any component outside the panel”                                                                        |
| B5  | Każda kontrolka `main [data-recipe="control"]` na `/stress` (ponad 1000), liczona z węzłami dostawcy. Slot `[data-slot="icon"]` liczy się jako 1, zagnieżdżona kontrolka konsumenta się nie liczy. Limit = 3 + (liczba slotów ikony − 1). Po zamknięciu menu, popovera, dialogu i tooltipa nie zostaje żaden węzeł popupu, a liczba dzieci `<body>` wraca do stanu sprzed otwarcia. | `budgets.spec.ts`: „keeps every control of the scene within its DOM nodes”, „leaves no node of a menu, a popover, a dialog or a tooltip after it closes”              |
| B6  | Opis niżej.                                                                                                                                                                                                                                                                                                                                                                         | `budget.test.ts`: „keeps the minified and gzipped … within its budget”, raport „reports the minified and gzipped size of every lib module…”, „keeps the gzipped CSS…” |
| B7  | Bez zmian (`decisions/e2-layers.md`).                                                                                                                                                                                                                                                                                                                                               | `lab.spec.ts`                                                                                                                                                         |
| B8  | Bez zmian. W fazie 1 nie zmienił się CSS.                                                                                                                                                                                                                                                                                                                                           | `budget.test.ts`                                                                                                                                                      |

Budżety i axe biegną tylko w Chromium: projekt `webkit` pomija `budgets.spec.ts` i `a11y.spec.ts` przez `testIgnore` (powód w `structure.md`). Sceny B1–B3 i B5 współdzielą jedną stronę `/stress`, zamontowaną raz na `describe` (tryb `serial`).

### B2: klatki wewnętrzne ruchu

Mapowanie zdarzeń na poddrzewo, przewidziane w planie, nie działa. Trace sceny z pigułką (Chromium 156) daje `Layout.endData.layoutRoots[].nodeName = "#document"` i `Paint.data.nodeId` = korzeń warstwy (`#document` albo `DIV` warstwy przewijania). Zdarzenie nie wskazuje więc elementu, który się zmienił. Zgodnie z G4 test używa metody zapasowej: scena, w której rusza się jedno poddrzewo, i liczenie każdego `Layout`/`Paint` w klatkach wewnętrznych ruchu.

- Klatka to odcinek między kolejnymi zdarzeniami `BeginMainThreadFrame` (kategoria `disabled-by-default-devtools.timeline.frame`).
- Ruch to para `Animation` `b`/`e` z jednym `id2.local`. Jedno `id` bywa użyte kilka razy z rzędu (pigułka zmienia cel), więc pary łączy się po kolei.
- Brzegi ruchu to cztery klatki: ta, w której ruch powstał (`b`), pierwsza klatka, w której biegnie (`n` po `b`, a dla WAAPI w tej samej klatce następna klatka), ostatnia (z `e`) i klatka tuż przed ostatnią.
  - Przejście CSS przechodzi w stan `running` dopiero klatkę lub dwie po utworzeniu. W tej klatce Chromium promuje element na warstwę i maluje dokument (2 × `Paint`).
  - Na końcu ruchu warstwa znika i dokument maluje się ponownie, czasem już klatkę przed zdarzeniem `e`.
- Liczą się klatki leżące ściśle między pierwszą a ostatnią klatką jakiegokolwiek ruchu i niebędące brzegiem żadnego ruchu. Bez tej reguły brzegi jednego ruchu (np. zanikania pigułki hover po kliknięciu) wpadały w środek innego (przejazdu pigułki wyboru).
- Przed trace scena czeka, aż skończą się wszystkie skończone animacje (`settle`). Bez tego koniec przejścia wciśnięcia triggera, rozpoczętego przed trace, liczył się jako praca w środku ruchu menu.
- Sceny: przejazd pigułki hover w grupie, przejazd pigułki wyboru po kliknięciu, pigułka menu (jeden ruch myszy z „Open” na „Delete” w menu bez podmenu), przelot tooltipa w `TooltipBar`, otwarcie i zamknięcie dialogu. Menu z podmenu odpada, bo przejazd przez „Export” otwiera podmenu, czyli nowy popup.
- Test negatywny: animacja CSS `width` sondy wstawionej w grupę w trakcie przejazdu daje `Layout` w klatkach wewnętrznych.
- Stabilność: `budgets.spec.ts` z `--repeat-each=4` dał 44/44, a 12 kolejnych otwarć dialogu dało 0 zdarzeń w klatkach wewnętrznych.

### B6: minify + gzip (rozstrzygnięcie G1)

- Każdy plik `dist` minifikuje osobno `minifySync(nazwa, kod)` z `rolldown/utils` (rolldown 1.2.16, dodany jako `devDependencies` paczki w zakresie `~1.2.16`, tym samym co tsdown). Importy zostają zewnętrzne, a test wymaga `errors = []`.
- Rozmiar komponentu = `gzipSync(…, { level: 9 })` konkatenacji (`\n`) zminifikowanego pliku komponentu i jego prywatnych modułów `lib/`.
- Prywatny moduł to moduł `dist/lib/*.js`, który z przechodniego grafu względnych importów `dist` osiąga tylko ten jeden plik `dist/components/**`. Moduły z ≥ 2 konsumentami (albo bez konsumenta) test mierzy osobno i zapisuje w adnotacji.
- Próg komponentu: 3072 B.
- CSS = gzip poziomu 9 konkatenacji wszystkich plików `.css` w `dist` bez mostu `styles/tailwind.css` (fontów w `dist` nie ma). Próg ⌊80 707 × 0,7⌋ = 56 494 B.

Wyniki (świeży build, 2026-11-01):

| Komponent      | Prywatne `lib/`               | min + gz |
| -------------- | ----------------------------- | -------- |
| `toggle-group` | `collection`, `single-choice` | 2984 B   |
| `menu`         | —                             | 2457 B   |
| `tooltip`      | —                             | 1366 B   |
| `button`       | —                             | 768 B    |
| `popover`      | —                             | 716 B    |
| `dialog`       | —                             | 539 B    |
| `input`        | —                             | 397 B    |
| `text`         | —                             | 308 B    |
| `heading`      | —                             | 281 B    |

Moduły wspólne (osobno, w adnotacji testu): `indicator` 4291 B (6 komponentów), `popup-flight` 1423 B (2), `theme` 1230 B (6), `input-modality` 449 B (6), `scope` 405 B (3), `press` 401 B (4), `instance` 190 B (6), `compose-refs` 180 B (6). Bez konsumenta wśród komponentów: `use-theme` 688 B, `theme-script` 168 B, `tone` 99 B.

CSS: v3 8504 B gz (z mostem `tailwind.css`: 8548 B) wobec v2 80 707 B (`MangaShift/tessera/packages/tessera/dist`, bez fontów), czyli 10,5 % v2; próg 56 494 B.

Zapas `toggle-group` to 88 B. Po rundzie B (2026-11-01) `toggle-group` ma 3008 B, zapas 64 B. Rozmiar jest powtarzalny: przy globie w `entry` tsdown dostawał pliki w zmiennej kolejności, od której zależy kolejność importów zewnętrznych (`react`, `react/jsx-runtime`) w `dist`, więc ten sam kod dawał 3071 albo 3074 B; `tsdown.config.ts` podaje teraz wejścia jako posortowaną listę i pięć kolejnych buildów daje identyczny `dist`. Plan przenosi `collection` do Tabs i Tree (D64, D65), więc moduł stanie się wspólny i wyjdzie z sumy.

### B6: `menubar` (2026-11-08)

`components/menu/menubar.js` z `lib/bar-overflow.js` miał 3586 B przy progu 3072 B; po zmianie ma 2991 B (próg bez zmian).

- Co zadecydował prowadzący z upoważnienia, do potwierdzenia przez właściciela: `'use no memo'` w `BarMenu`. Bez dyrektywy po wszystkich skróceniach kodu zostawało 3193 B, a samą dyrektywą schodzi do 2991 B (−202 B: gzip źle kompresuje wynik kompilatora, bo tablica pamięci podręcznej ma osobne warunki dla każdego propsa i elementu). Koszt: `BarMenu` nie zapamiętuje elementów potomnych. `Menubar` i `MenubarMenu` dalej przekazują mu zapamiętany element, więc `BarMenu` renderuje się, gdy zmieni się jego `overflow`, etykieta albo dzieci (nie zmierzono liczby renderów). Odrzucone: podniesienie progu (zakazane), przeniesienie obsługi Tab do `lib/menubar-hotkey.ts` (wypadłoby z pomiaru, a nie jest wspólne dla komponentów).
- Skrócenia bez zmiany zachowania: `BarMenu` składa `Menu` i `MenuContent` zamiast własnego `Root`, kontekstu zasięgu, portalu, pozycjonera i popupu (`MenuContent` dostał `positioner` i `place`); pigułka hover paska z `useListPill(…, 'x')` zamiast własnego `useIndicator` i `Pill`; `More` to `BarMenu` w `Menubar`; jeden `hold(trigger, open)` zamiast `hold` i `release`; jeden obserwator `ResizeObserver` bez `MutationObserver`, bo animację odtwarza mikrozadanie po `onCount`; zapis „widoczne przed” tylko dla pokazanych elementów (`Map<element, left>` zamiast `Seen`).

### B6: `tooltip` (2026-11-08)

`components/tooltip/tooltip.js` z `lib/tooltip.js` ma 3201 B przy progu 3072 B. Próg tooltipa podniesiony do 3584 B (3,5 kB), jako nazwany wyjątek `COMPONENT_BYTES_RAISED` w `budget.test.ts`; pozostałe komponenty zostają przy 3072 B.

- Kto: właściciel, 2026-11-08 („możesz podnieść limit dla tooltipa… jeżeli potrzebujemy więcej na dany element, to trzeba więcej… to jest soft limit”). Zastępuje dla tego jednego komponentu zakaz podnoszenia progu z wpisu `menubar`.
- Dlaczego: przyrost to zachowanie, którego wymaga wybrany wariant T6 (`docs/decisions/e3-choices.md`): etykieta, która jeszcze wjeżdża, dostaje nowy tekst w miejscu (bez pustego dymka przy szybkim ruchu), ściśnięcie tekstu do szerokości dymka (`--ts-i-tip-squish`), pomiar szerokości bez bieżącej skali, Tab bez zamykania dymka między przyciskami jednej grupy, zamykanie przy Enter i Spacji.
- Odrzucone: cięcie innych części tooltipa (właściciel wybrał podniesienie progu).
- 2026-11-09: próg 4096 B (4 kB). Strzałka jako jedna ścieżka SVG ze stykiem liczonym z krawędzi dymka (`lib/tip-arrow.js`) dokłada ok. 470 B, razem 4070 B. Prowadzący z upoważnienia właściciela (soft limit z 08.11).

### Znany błąd: regres T2, T3 i N8 od 2026-11-02 (otwarte)

`bun run perf` 2026-11-09 wobec `last.json` (2026-11-02, `0a84693`): T2 hover 72,5 ms (było 12,4), T2 press 115 ms (54), T3 1x 49 ms (15), N8 row hover 65 ms (7,9), N8 row layers 7 (1). Na `ca35a38` (przed tooltipem T6) te same liczby (T2 hover 76, N8 64, T3 49, warstwy 7), więc tooltip T6 nie jest przyczyną. Bisekcja 2026-11-09 (`bun run perf`, `.worktrees/perf-ca35`, ta sama maszyna i dzień): `0a84693` T2 hover 23 ms, N8 14 ms, warstwy 1 (dryf 12 → 23 ms to obciążenie maszyny); `a94c958` 29 / 19 ms, 1; `297e1ba` (skala spoczynkowa kontrolek i części, TE) 48 / 42 ms, 1; `0408e5c` (gaśnięcie hovera `background-color` 150 ms na płytce `::before`, wyjątek B2, i krycie pigułek w `hover-out`) 76 / 65 ms, warstwy 4. Przyczyna: dwa wybrane ruchy, nie pomyłka w kodzie; liczby zgadzają się z pomiarem technik z 2026-11-03 (`e3-motion.md`, „B. Hover z wyjściem”: H1 150 ms 70,8 ms, nakładka `opacity` 79,1 ms i 9 warstw, `@property` 104,6 ms). Właściciel 09.11: gaśnięcie hovera zostaje 150 ms; hover ma tylko element pod kursorem, więc naraz gaśnie kilka płytek, a liczba elementów strony prawie nie zmienia kosztu (500 wierszy ≈ 10 przycisków). Do sprawdzenia pomiarem: koszt malowania płytki z `corner-shape` kontra zwykły promień w trakcie gaśnięcia; mniej malowań przy tym samym czasie (`steps`), z oceną płynności przez właściciela.

Koszt tooltipa w pasku (ślad, CPU ×4, jedno przejście, mediana z 3): 266 ms głównego wątku w oknie 400 ms, zwykły przycisk 110–140 ms; płynna `width` i blur razem ok. 55 ms (bez obu 210 ms). `placed()` czyta DOM raz przed zapisami, `--ts-i-tip-room` zapisuje tylko przy zmianie.

## T1–T5 (`bun run perf`)

Metoda (`apps/docs/perf/stress.perf.ts`):

- Chromium headless shell 156.0.8078.4, Intel Core Ultra 7 265KF, okno 1280 × 720.
- 1 przebieg rozgrzewkowy (odrzucony) i 5 zapisanych, każdy w świeżym kontekście.
- Wartość = mediana z 5, rozrzut = (max − min) / mediana.
- Throttling przez CDP `Emulation.setCPUThrottlingRate`.
- Czas wątku głównego to przyrost `TaskDuration` z CDP `Performance.getMetrics` od stanu ustalonego do ustalonego, minus mediana tego samego pomiaru bez akcji (3 próby). Odejmowanie usuwa koszt `settle` i `evaluate`.
- Ruch myszy w T2 i N8 idzie przez `page.mouse` na wcześniej zmierzone współrzędne. Lokator Playwrighta wstrzykuje do strony własne skrypty sprawdzające, a te liczyłyby się do `TaskDuration`.

Trzy przebiegi po 5 pomiarów: „przed” to nakładka stanu `::after` (13:16, punkt odniesienia fazy 1), „po 1” i „po 2” to krok rampy (dwa kolejne `bun run perf:save` po zmianie N8; `last.json` = „po 2”). Przebieg „po 2” szedł przy większym obciążeniu maszyny przez inne sesje: T5, którego zmiana N8 nie dotyka, urósł w nim z 443 do 592 ms, a rozrzuty wielu pomiarów przekroczyły 20 %.

| ID       | Co mierzy                                                                                                                                                                                                                    | CPU | Przed           | Po 1            | Po 2             | Cel      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------- | --------------- | ---------------- | -------- |
| T1       | ramki LoAF > 50 ms w scenach ruchu: pigułka w grupie (4 przejazdy i klik), hover w dół menu, przelot tooltipa przez 6 pozycji, otwarcie i zamknięcie dialogu, popover, przewinięcie `/stress` 3 × 3000 px w dół i z powrotem | 4x  | 10 (0 %)        | 9 (11 %)        | 9 (0 %)          | 0        |
| T2 hover | hover 10 `Button`                                                                                                                                                                                                            | 4x  | 40,34 ms (7 %)  | 10,54 ms (18 %) | 12,37 ms (32 %)  | ≤ 4 ms   |
| T2 press | wciśnięcie i puszczenie 10 `Button`                                                                                                                                                                                          | 4x  | 47,21 ms (17 %) | 42,64 ms (34 %) | 54,32 ms (25 %)  | ≤ 4 ms   |
| T3       | zmiana `data-mode` na `<html>` (3 przełączenia)                                                                                                                                                                              | 1x  | 37,77 ms (5 %)  | 14,33 ms (5 %)  | 15,19 ms (7 %)   | ≤ 16 ms  |
| T3       | jw.                                                                                                                                                                                                                          | 4x  | 211,33 ms (9 %) | 84,07 ms (52 %) | 127,23 ms (22 %) | ≤ 100 ms |
| T4       | najdłuższe zdarzenie z `interactionId` (`PerformanceObserver` `event`, próg 16 ms) w scenach T1                                                                                                                              | 4x  | 136 ms (24 %)   | 128 ms (38 %)   | 168 ms (48 %)    | ≤ 100 ms |
| T5       | montaż sceny: od kliknięcia „Mount scene” do drugiej klatki (`raf`) po nim                                                                                                                                                   | 4x  | 426 ms (7 %)    | 443,2 ms (19 %) | 591,7 ms (23 %)  | ≤ 300 ms |

W nawiasach rozrzut. Po zmianie N8 cel spełnia T3 przy 1x (oba przebiegi), a T3 przy 4x w jednym z dwóch. T2 hover spada o 69–74 %, ale nadal przekracza 4 ms. T2 press prawie się nie zmienia: wciśnięcie dalej animuje `scale`, a element dostaje i traci przy tym warstwę kompozytora (N5, „wciśnięcie przycisku”).

Przyczyna kosztu hover przed zmianą (trace, 1x, hover jednego `Button`, ok. 8 ms wątku głównego):

- `Layerize` 2,7 ms na początku i 0,9 ms na końcu przejścia `opacity` nakładki `::after`, bo element dostaje i traci warstwę kompozytora;
- `HitTest` 0,8 ms;
- dwa `Paint` po ok. 0,5 ms.

`Layerize` obejmuje całą stronę (ok. 1300 kontrolek), więc ten koszt rósł z wielkością sceny, a nie z kontrolką. Krok rampy nie tworzy warstwy, więc zostaje `HitTest`, przeliczenie stylu i `Paint`.

Ograniczenia:

- T1 i T4 sterują scenami przez lokatory Playwrighta, więc ich skrypty mogą wydłużać ramki. Podziału T1 na sceny raport nie ma.
- T4 ma rozrzut 24–48 % (zdarzenia zaokrąglone do 8 ms), więc jest niestabilny według progu 20 %.

## N8: krok rampy zamiast nakładki

**Decyzja (prowadzący, zgodnie z regułą planu „nakładka zostaje, jeśli mieści się przy 4x, inaczej krok rampy”):** stan kontrolki i wiersza to krok rampy koloru tła, nie animowana nakładka. N8 jest zamknięte.

Pomiar fazy 1 na sekcji `Rows` (500 przycisków `ghost`, hover na 20 wierszach w widoku, 4x): nakładka 24,48 ms i 5 warstw, krok rampy doklejony arkuszem w teście 10,14 ms i 1 warstwa.

Mechanizm (`packages/tessera/src/recipes/control.css`):

- tło kontrolki = `color-mix(in oklab, var(--_wash) calc(var(--_step) * 100%), var(--_base))`;
- `--_base` to wypełnienie wariantu: `transparent`, `--_tint` w `solid`, `--ts-depth-raised-bg` w `raised`;
- `--_wash` to kolor kroku: w spoczynku samo `--_base` (mieszanka koloru z nim samym nic nie zmienia), w `soft`, `field`, hover, wciśnięciu i `aria-expanded` atrament `--_ink`, przy zaznaczeniu `--ts-state-selected-fill-color`;
- `--_step` to szczebel drabinki W8 z silnika `state` (`--_quiet`, `--_hover`, `--_press`, `--ts-state-selected-fill`);
- zmiana stanu przestawia tylko te dwie zmienne, bez `transition`, więc dzieje się w jednej klatce (Q2: koloru nie animujemy);
- `row` maluje tło zaznaczenia w `[aria-multiselectable='true']` tym samym `color-mix` z `transparent`;
- w grupie z pigułką `indicator.css` daje kontrolce `background: var(--_base)` (wyjątek `INDICATOR_REPLACES_CONTROL_INK`);
- w `forced-colors` zaznaczona kontrolka i wiersz mają `background: Highlight`.

Pseudo-element `::after` stanu i `isolation: isolate` (służyło tylko jego `z-index: -1`) znikają z `control` i `row`. `::after` nie służył niczemu innemu: fokus rysuje przepis `focus` (`outline`), pętla `aria-busy` kręci slot ikony, a `forced-colors` przechodzi na `background`. W przepisach nie zostaje żadne `::after`. Od oceny 01.11 `control` maluje tło, obrys i cień na płytce `::before` (z `isolation: isolate`), żeby wciśnięcie skalowało tylko płytkę (B1); to ta sama rampa koloru w jednej klatce, nie nakładka stanu.

Domyślny szczebel to `--_quiet`, a nie literał `0`, bo strażnik warstw zabrania arytmetyki na `--_*` zbudowanej z literału. Niewidoczny spoczynek daje `--_wash` równe `--_base`.

| Pomiar (4x)                                       | Nakładka (przed) | Krok rampy (po 1 / po 2)        | Cel         |
| ------------------------------------------------- | ---------------- | ------------------------------- | ----------- |
| hover wiersza `Rows`, wątek główny                | 24,48 ms (6 %)   | 7,09 ms (27 %) / 7,93 ms (27 %) | ≤ 4 ms (T2) |
| szczyt warstw B7 przy przejeździe po 20 wierszach | 5                | 1 / 1                           | ≤ 12        |
| T2 hover (10 `Button`)                            | 40,34 ms         | 10,54 / 12,37 ms                | ≤ 4 ms      |

Pomiar `Layout`/`Paint` w klatkach wewnętrznych przejścia nakładki (B2) odpadł razem z przejściem. Cel 4 ms nadal nie jest spełniony przy 4x.

Wygląd przed i po (Chromium, 1280 × 800, `/foundation` i `/components` w obu trybach, hover i wciśnięcie 5 wariantów × 3 tony, zrzuty poza repo, w katalogu tymczasowym sesji `…\scratchpad\n8\before` i `…\after`):

- w spoczynku pełne strony różnią się tylko o 1–2 poziomy na kanał (zaokrąglenia), poza etykietami `on-*` zmienionymi celowo (sekcja „Kontrast etykiety na wypełnieniu”);
- `ghost` i `soft` w hover: 0–2 poziomy, bo `color-mix` z `transparent` daje atrament z kryciem szczebla, tak jak nakładka;
- `solid` i `raised` w hover i wciśnięciu: do 4–13 poziomów, bo krok miesza w `oklab` (jedyna przestrzeń dozwolona w przepisach), a nakładka składała kolory w sRGB;
- `outline` w hover i wciśnięciu: do 38 poziomów na pikselach ramki, bo nakładka leżała nad ramką, a tło leży pod nią.

## B3: zmiana wyboru

Przed: klik innej opcji `ToggleGroup` dawał 2 commity. Pierwszy renderował dwie opcje (stary i nowy wybór, `useSyncExternalStore`), a w jego fazie commit ref nowej opcji wołał `setActive` (stan Reacta w `ToggleGroup`), co wymuszało drugi, synchroniczny commit grupy, żeby podać pigułkom nowy element.

Po: 1 commit. Stan pigułki żyje poza Reactem, w `lib/indicator.ts`:

- `useIndicator` zwraca `select(active, under)` zamiast opcji `active` i `under`; cel zapisuje w refie i od razu przekazuje podłączonemu wskaźnikowi;
- ref wybranej opcji woła `setActive` grupy, a to wywołuje `select` obu pigułek (wyboru i hover) bez stanu Reacta;
- `Menu` i próbki pigułek na `/screens/edges` (`indicator-samples.tsx`) przechodzą na `select` (menu w efekcie układu po zmianie `held`, próbki przez ref).

Q9 zostaje: zmiana wyboru renderuje tylko dwie opcje (`toggle-group.spec.ts`: „re-renders only the previously and the newly chosen option when the choice changes”).

Dowód oblania: rozszerzony test B3 („… and for a change of the choice”) na kodzie sprzed zmiany: `Expected: <= 1, Received: 2` przy kliku opcji „2” w „Segment 2”; po zmianie zielony.

## S-A: podmiot reguły gospodarza pigułki

Wariant „z podmiotem” podmienia w CSSOM selektor `:has(> [data-recipe="indicator"])` (jedna reguła, `indicator.css`) na `[data-recipe]:has(> [data-recipe="indicator"])` przed montażem. Test sprawdza, że oba selektory łapią na scenie tyle samo gospodarzy.

| Pomiar (4x) | Bez podmiotu | Z podmiotem | Różnica | Rozrzut    |
| ----------- | ------------ | ----------- | ------- | ---------- |
| T3          | 211,33 ms    | 206,30 ms   | −2,4 %  | 9 % / 14 % |
| T5          | 426,00 ms    | 428,10 ms   | +0,5 %  | 7 % / 5 %  |

Według D74 podmiot wchodzi, gdy T3 lub T5 spada o więcej niż rozrzut. Tak nie jest, więc `indicator.css` zostaje bez zmian, a S-A jest zamknięte.

## axe

`apps/docs/tests/a11y.spec.ts` sprawdza `@axe-core/playwright` 4.14.0 (axe-core 4.14.0, licencja MPL-2.0, tylko narzędzie testowe w `devDependencies` laboratorium) na stronach z testu responsywności: `/`, `/foundation`, `/components`, `/screens/overlays`, `/screens/edges`, w trybie jasnym i ciemnym.

- Liczą się tylko naruszenia (`violations`) o wadze `serious` i `critical`; wyniki `incomplete` nie są błędem.
- `color-contrast` jest informacyjny (adnotacja testu), gdy kolor tekstu to rola akcentu albo statusu (`tint`, `tint-bright`, `tint-dim`, `success`, `warning`, `danger`, `info`) różna od każdej neutralnej roli etykiety. Tak mówi W7: żywe kolory przed WCAG. Pozostałe naruszenia kontrastu, w tym etykieta `on-*` na wypełnieniu, są twarde (Q17).

Przed: 6 z 10 testów czerwonych.

- `/foundation`:
  - `aria-allowed-attr`: `aria-pressed` na `<span>`;
  - `aria-required-parent`: `menuitemcheckbox` bez menu;
  - `color-contrast` na próbkach wyłączonych bez `aria-disabled`;
  - kontrast tekstu w kolorach tonów.
- `/components`, `/screens/edges` (jasny): kontrast tekstu w kolorach tonów i tekstu błędu.

Naprawione u źródła w laboratorium (`apps/docs/app/foundation/page.tsx`):

- próbki `pressed` i `not pressed` są przyciskami (`<button>`);
- próbki wyłączone mają `aria-disabled="true"`, a wyłączony wiersz także `role="menuitem"`;
- powierzchnia próbek wierszy ma `role="menubar"` z `aria-orientation="vertical"`.

`menu` odpadło, bo panel motywu w testach czeka na brak jakiegokolwiek `role="menu"` na stronie.

Po naprawach w laboratorium zostały 4 czerwone (`/foundation` i `/components`, oba tryby) z jednej przyczyny: biała etykieta `on-danger` (3,8) i `on-info` (3,76) przy progu 4,5. Po zmianie etykiety (sekcja niżej) axe daje 10 z 10 zielonych bez wyłączania reguł.

## Kontrast etykiety na wypełnieniu

**Decyzja (prowadzący, do późniejszej korekty kolorów przez właściciela):** wypełnienia akcentów i statusów zostają żywe, bez zmian (W7). Zmienia się tylko etykieta na wypełnieniu, czyli rola, w której Q17 każe wymuszać kontrast:

- `foreground` rodzin `red`, `blue`, `violet`, `purple` i `rose` w `packages/tessera/scripts/palette.ts`: `white` → `dark`, ten sam ciemny atrament co na jasnych wypełnieniach (`orange`, `green` i reszta);
- ten atrament (`DARK_FOREGROUND`) ściemniony z L = 0,15 (`#0b0b0b`) do L = 0,13 (`#070707`), bo `violet` nie osiąga 4,5 ani z białą (4,40), ani z `#0b0b0b` (4,47);
- `color.css` wygenerowany od nowa (`bun run generate:colors`): `on-danger`, `on-info` i `on-tint` tych pięciu akcentów = `#070707`, a wszystkie dotychczas ciemne etykiety z `#0b0b0b` na `#070707`.

Kontrast etykiety na `solid` (WCAG 2, zmierzony w Chromium na wyrenderowanym przycisku `solid`, wartości w obu trybach równe, bo wypełnienie ma jedną wartość, W6):

| Rodzina (rola)                    | Przed         | Po                              |
| --------------------------------- | ------------- | ------------------------------- |
| `red` (`danger`)                  | 3,81 (biała)  | 5,29                            |
| `blue` (`info`)                   | 3,76 (biała)  | 5,35                            |
| `violet`                          | 4,40 (biała)  | 4,58                            |
| `purple`                          | 4,12 (biała)  | 4,89                            |
| `rose`                            | 3,75 (biała)  | 5,37                            |
| `indigo`                          | 4,58 (biała)  | 4,58 (bez zmian, biała zostaje) |
| `slate`                           | 4,76 (biała)  | 4,76 (bez zmian)                |
| `zinc`                            | 4,83 (biała)  | 4,83 (bez zmian)                |
| `orange` (`warning`)              | 6,82          | 6,98                            |
| `green` (`success`)               | 8,88          | 9,08                            |
| pozostałe ciemne (`amber`…`pink`) | 5,49–10,30    | 5,62–10,55                      |
| `contrast` (jasny / ciemny)       | 18,09 / 16,95 | bez zmian (role neutralne)      |

`indigo` z ciemnym atramentem miałby 4,40, więc zostaje biały. Najmniejszy zapas ma `violet` i `indigo` (4,58).

## B5 oceny na żywo: lag nakładek (2026-11-01)

Objaw właściciela: „nakładki laggują w zwykłej przeglądarce”. Pomiar: Chromium headless 156 (`apps/docs` z `bun run build`, serwer `tests/serve.ts`), `/components` 1280 × 800, CPU 1× i 4× (`Emulation.setCPUThrottlingRate`), mediana z 3 świeżych przeglądarek. Scena po scenie, każda w osobnym trace (`devtools.timeline`): `main` = suma `RunTask`, `Layerize`, `Paint`, `Layout`, `UpdateLayoutTree` = suma czasu zdarzeń, `paints` = liczba `Paint`, LoAF = najdłuższa ramka `long-animation-frame` (> 50 ms). Sceny: otwarcie menu „Project” przez wciśnięcie triggera (120 ms), hover w dół 4 pozycji menu, przejazd pigułki hover tam i z powrotem po „Range (raised)”, wciśnięcie przycisku. Skrypt: scratchpad `review-fix/probe-b5.mjs`.

„Przed” = menu modalne Base UI i `scale` wciśnięcia na całej kontrolce (stary przepis wstrzyknięty arkuszem, kod `modal` przywrócony na czas pomiaru); „po” = stan po naprawie.

| Scena                | CPU | `main` przed → po | `UpdateLayoutTree` | `Layerize`  | `Paint` (liczba)    | LoAF             |
| -------------------- | --- | ----------------- | ------------------ | ----------- | ------------------- | ---------------- |
| otwarcie menu        | 1×  | 96,3 → 86,1 ms    | 16,4 → 14,9        | 6,5 → 4,2   | 4,3 (16) → 3,4 (11) | 0 → 0            |
| otwarcie menu        | 4×  | 463,1 → 366,4 ms  | 133,1 → 109,8      | 25,5 → 16,6 | 26,2 (8) → 15,9 (7) | 280,5 → 234,7 ms |
| hover w menu         | 4×  | 522,2 → 503,4 ms  | 53,7 → 50,0        | 31,8 → 35,0 | 17,7 → 19,4         | 126,8 → 121,1 ms |
| przejazd pigułki     | 4×  | 385,3 → 369,9 ms  | 46,7 → 42,2        | 46,9 → 44,4 | 22,4 → 21,7         | 0 → 0            |
| wciśnięcie przycisku | 4×  | 163,5 → 165,5 ms  | 32,8 → 36,2        | 28,0 → 19,5 | 7,9 (7) → 13,2 (9)  | 0 → 0            |

Przyczyny (trace otwarcia menu przy 4×):

- Jedna ramka `FireAnimationFrame` ok. 160 ms: wywołanie JS (pozycjonowanie, wskaźnik) czyta geometrię i wymusza przeliczenie stylu 522 elementów (79 ms). Przeliczenie wywołują zmiany Base UI przy otwarciu: `data-base-ui-inert` na rodzeństwie portalu (dziedziczone `pointer-events`) oraz w menu modalnym `overflow: hidden` na `<body>`.
- Menu modalne blokuje przewijanie przez `overflow: hidden` na `<body>`. W Chromium headless pasek jest nakładany, więc pomiar widzi tylko przeliczenie stylu; w zwykłej przeglądarce na Windows klasyczny pasek (17 px) znika, szerokość strony się zmienia i cała strona przechodzi przez układ i malowanie przy każdym otwarciu i zamknięciu. To jedyny składnik różniący „nagrania” od „zwykłej przeglądarki”.
- `scale` triggera (B1) dokładał 5 malowań na otwarcie (16 → 11 przy 1×) i ponowne pozycjonowanie popupu w każdej klatce przejścia.

Naprawa: `Menu` domyślnie `modal={false}` (desktop i v2), wciśnięcie na płytce `::before` (B1). Zostaje: ramka 235 ms przy 4× z przeliczeniem stylu po `data-base-ui-inert` (zachowanie Base UI) i koszt przeliczenia stylu na element (ok. 0,15 ms przy 4×). Wciśnięcie przycisku maluje więcej (płytka jest osobnym obiektem malowania), a `Layerize` spada o 30 %. Następny krok (otwarty): zmierzyć udział selektorów `:has()` przepisu `control` w koszcie przeliczenia i to, czy `data-base-ui-inert` da się ograniczyć do jednego węzła; T1–T5 (`bun run perf`) do ponownego zapisu przez właściciela.

## Czas `bun run check`

Kroki uruchomione po kolei na tej samej maszynie, z innymi sesjami w tle, 2026-11-01:

| Krok                                  | Czas                           |
| ------------------------------------- | ------------------------------ |
| typecheck                             | 1 s                            |
| build                                 | 7 s                            |
| lint                                  | 2 s                            |
| `bunx vitest run --maxWorkers=6`      | 5 s (773 testy)                |
| Playwright (`test:browser`, 1 worker) | 265 s (277 passed, 12 skipped) |
| **suma**                              | **280 s ≈ 4,7 min**            |

E2: 3,3 min, więc 1,41 ×, w limicie 1,5 ×.

- Nowe pliki kosztują ok. 25 s: `budgets.spec.ts` ok. 11 s i `a11y.spec.ts` ok. 13 s.
- Reszta przyrostu Playwrighta (ok. 50 s) nie została rozłożona, bo pomiar E2 nie powstał w tych samych warunkach.
- `bun run perf` nie wchodzi do `check` ani pre-push: jeden przebieg trwa 2,4 min plus build.
