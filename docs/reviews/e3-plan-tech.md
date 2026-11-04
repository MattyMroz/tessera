---
kind: review
status: fail
reviewed-state: docs/plans/e3-first-round.md (draft, 828 linii, niezacommitowany), worktree .worktrees/e2, branch feat/e2-foundation @ 378bcee + praca E2; dist z 2026-11-01 06:29; @base-ui/react 1.9.0
date: 2026-11-01
---

# Review: wykonalność i dowód planu E3 (recenzja techniczna)

## Zakres

- przedmiot: `docs/plans/e3-first-round.md`, decyzje D48–D75, fazy 0–13, strategia dowodu, jednostki;
- baseline: kod E2 w worktree (`packages/tessera/src/**`, `test/**`, `apps/docs/tests/**`), zbudowany `dist`, Base UI 1.9.0 z `packages/tessera/node_modules/@base-ui/react`, v2 w working tree MangaShift (`tessera/packages/tessera`, branch `refactor/tessera-motion`, tylko odczyt plików);
- authority: `docs/specification.md` (B1–B8, T1–T5, Q7, O7, U18, U27), `AGENTS.md`, strażnik `test/guards/css-layers.ts` i `contracts.test.ts`;
- ryzyka: mechanizm, którego nie da się zbudować w obecnej architekturze albo strażniku; test, który przejdzie przy złej implementacji albo obleje przy dobrej; budżet nierealny z góry; niebezpieczny pomiar v2;
- poza review: zakres i zgodność z masterplanem (recenzja `e3-plan-scope.md`), wygląd, ocena właściciela.

## Werdykt

**Status:** fail (do poprawy przed akceptacją; poprawki są lokalne w decyzjach, bez zmiany architektury).

**Najważniejszy powód:** trzy mechanizmy planu nie przejdą obecnych bramek w zapisanej postaci: B6 jest czerwony już na kodzie E2 (niezdefiniowany sposób pomiaru), klatki `ts-scroll` z D54 łamią graf silników w strażniku, a Base UI `Select` w trybie „na triggerze” uruchamia JS i zmienia wysokość na każdym `scroll`, więc kryterium P-LANE i część testów D63 są niespełnialne dla Selecta. Krytycznych nie ma.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. B6 ≤ 3 kB jest czerwony na E2, bo plan nie mówi, co się gzipuje

- miejsce: D71 (plan:116, „gzip pliku komponentu z prywatnymi modułami `lib/`”), gate fazy 1 (plan:510), ryzyko Tree/Select (plan:769).
- dowód: `dist` jest niezminifikowany (`tsdown.config.ts` bez `minify`; nagłówek `dist/components/menu/menu.js` czytelny). Pomiar `gzip -9`: `menu.js` 3074 B (> 3072); `toggle-group.js` 2748 B + prywatny `lib/single-choice.js` 477 B = 3225 B. Te same pliki po `bun build --minify` z importami na zewnątrz: menu 2426 B, toggle-group 2224 + 313 = 2537 B. v2 dla skali: `tree.js` 9390 B gz, `slider.js` 5807 B, `item.js` 6544 B (bez minifikacji).
- wpływ: faza 1 startuje od dwóch czerwonych budżetów („znalezisko poważne”, plan:510) albo wykonawca sam wybiera definicję; Tree z prywatnymi `lib/tree.ts` i `lib/virtual-list.ts` (jedyny konsument, więc liczone razem) ma realną szansę przekroczyć 3 kB nawet po minifikacji.
- minimalna reakcja: w D71 i w spec B6 wpisać „minify + gzip pliku `dist` z importami zewnętrznymi (`react`, `@base-ui/*`, `../`), prywatne moduły `lib/` doliczone”; test w `budget.test.ts` z tą samą procedurą; dla Tree z góry decyzja, czy `virtual-list.ts` (czysta funkcja, przyszły drugi konsument: Select/Combobox E4) liczy się jako wspólny.

#### P2. Base UI `Select` „na triggerze” uruchamia JS i zmienia rozmiar przy każdym przewinięciu, wyłącza się przy dotyku i przy krawędzi

- miejsce: D63, D54 (konsument „lista Selecta”), P-LANE (plan:580-589), testy fazy 7 (plan:597), streszczenie pkt 8.
- dowód (odczyt `node_modules/@base-ui/react/select`):
  - `list/SelectList.js:42-44` i `popup/SelectPopup.js:338-343`: `onScroll` zawsze woła `handleScroll`/`handleScrollArrowVisibility` (`root/SelectRoot.js:284-291`, `store.set` dwóch pól);
  - `popup/SelectPopup.js:87-151`: w trybie „na triggerze” każdy `scroll` czyta `getBoundingClientRect` i `getComputedStyle` i ustawia `positionerElement.style.height` (popup rośnie w trakcie przewijania, aż osiągnie maksimum);
  - `positioner/SelectPositioner.js:72`: `alignItemWithTriggerActive = … && openMethod !== 'touch'`;
  - `popup/SelectPopup.js:277-283`: przy triggerze blisko góry/dołu okna albo za niskiej liście wraca do trybu popper (`setControlledAlignItemWithTrigger(false)`);
  - `popup/SelectPopup.js:248-254`: wyrównanie liczy środek `Select.Value` względem `Select.ItemText`.
- wpływ: kryterium P-LANE „brak zadań JS na zdarzenie scroll, B2 = 0” jest niespełnialne dla listy Selecta niezależnie od „lane” (wynik zależy od tego, czy próba użyje Selecta, czy Menu); `ResizeObserver` z `lib/lane.ts` odpali co klatkę, póki popup rośnie; test „środek opcji = środek triggera ± 1 px” oblewa w kontekście 320 × 480 i `hasTouch` z macierzy skrajności; właściciel na dotyku zobaczy popper, nie „opcję nad polem”.
- minimalna reakcja: P-LANE mierzy „brak zadań z kodu Tessery na `scroll`” i osobno zapisuje koszt dostawcy; decyzja w D63, czy wzrost popupu przy przewijaniu (zmiana rozmiaru w trakcie gestu) jest akceptowany wobec reguły „rozmiar w jednej klatce”; test trybu domyślnego z triggerem na środku okna, osobny przypadek: dotyk i małe okno = popper; `Select.Value` i `Select.ItemText` jako wymagane części w D63; zdanie o dotyku w streszczeniu i `docs/select.md`.

#### P3. Klatki `ts-scroll` i reguły „lane” w zapisanej postaci nie przejdą strażnika

- miejsce: D54 („klatki `ts-scroll` (`translate`) w `motion.css`”), impact scan (plan:236 wymienia tylko `ts-scroll` i `100cqi`).
- dowód: `css-layers.ts:541-545` (`reads`): `motion` stoi w pierwszym poziomie grafu, więc klatka może czytać tylko `--ts-motion-*`; translacja zależna od rozmiaru kciuka (`--ts-i-block-size`, `--ts-size-*`) oblewa „read outside the engine graph” (`checkKeyframe`, `css-layers.ts:565-569`). `@supports` w przepisie dozwolone tylko jako przycięcie w `control` (`css-layers.ts:95`, `506-511`), a fallback D54 potrzebuje `@supports (animation-timeline: …)` z innymi właściwościami. `size` (oś pionowego toru, `container-type: size`) nie ma w `RECIPE_KEYWORDS` (`css-layers.ts:52-58`); nazwy osi (`--lane`) to dashed-ident, którego polityka wartości nie zna.
- sonda 2 (Playwright 1.64.1, headless, `page.setContent`): wariant zgodny ze strażnikiem działa w obu silnikach: tor z `padding-block-end` = rozmiar kciuka, w nim kontener `container-type: size` o długości tor − kciuk, klatki `to { translate: 0 100cqb }` bez żadnej zmiennej, `scroll-timeline` na przewijaczu i `timeline-scope` na opakowaniu. Kciuk na końcu = 240 / 240 px, zagnieżdżone obszary z tą samą nazwą osi nie przeszkadzają sobie (wewnętrzny 240, zewnętrzny 0, potem oba 240), Chromium 156 i WebKit 27.2.
- wpływ: R2 rundy E stanie na strażniku albo wykonawca dopisze wyjątek „czytaj `--ts-i-*` w `motion`”, który otwiera graf.
- minimalna reakcja: w D54 wpisać kształt „travel container” (klatki z literałem `100cqb`/`100cqi`, bez zmiennych), a w impact scan komplet zmian strażnika: nazwa `ts-scroll` w `KEYFRAMES`, warunek `@supports (animation-timeline: scroll())` z białą listą właściwości (`scrollbar-width`, `scrollbar-color`, `display`), słowo `size`, polityka nazw osi (jedna stała nazwa), właściwości `scroll-timeline`, `timeline-scope`, `animation-timeline`.

#### P4. Kciuk „lane” to stała animacja z własną warstwą, a B1, B7 i macierz ruchu tego nie przewidują

- miejsce: macierz skrajności „ruch `off`: `getAnimations()` puste” (plan:286), B7 (spec: „w spoczynku … ≤ 12” na `/screens/edges`), B1 (lista wyjątków), D54 „pojawianie się paska … `LANE_IDLE`”.
- dowód: sonda 1: kciuk ma animację z `ScrollTimeline` (`getAnimations()` = 1) w obu silnikach, zawsze, także w spoczynku. Sonda 2 (Chromium, CDP `LayerTree`): 5 obszarów „lane” w spoczynku = 9 rysujących warstw (liczba obejmuje też warstwy przewijaczy; bez pomiaru bazowego przypisanie do kciuków jest szacunkiem). Istniejący test `lab.spec.ts:548` sprawdza `document.getAnimations().length === 0` przy ruchu `off`.
- wpływ: każda sekcja ScrollArea, lista Selecta i popup Menu z „lane” obleje automatyczną macierz ruchu `off`; budżet B7 ≤ 12 na `/screens/edges` i warstwy na ekranie Panel roboczy (drzewo, lista, właściwości) zjedzą zapas; ukrycie kciuka przez `opacity` nie usuwa warstwy.
- minimalna reakcja: `ts-scroll` jako nazwany wyjątek w B1 i w macierzy ruchu (przewijanie to nie ruch, D54 już tak mówi); B7: kciuk „lane” liczony osobno albo jawny przydział warstw na ekran; test, że przy ruchu `off` kciuk dalej jedzie za przewinięciem (dziś plan sprawdza tylko, że przewijanie działa).

#### P5. Próby N7 stoją w R3, a reguły części, które od nich zależą, w R2

- miejsce: D50, D59, D60, D69; przebieg rundy R2 → R3 (plan:248-249); faza 6 R2/R3 (plan:570-572), faza 10 (plan:641-643).
- dowód: D50 zakłada slot-dziecko gospodarza; natywny `<input type="checkbox">` nie ma dzieci, więc część musiałaby być rodzeństwem, a strażnik zabrania `~`/`+` (`css-layers.ts:409`), albo gospodarzem jest `<label>` z `:has(:checked)`, czyli dodatkowy wrapper (kryterium Q11 z D60). Base UI `Checkbox` i `Switch` zawsze renderują ukryty `<input>` (`checkbox/root/CheckboxRoot.js:336`, `switch/root/SwitchRoot.js:207`), więc B5 zależy od tego, czy węzeł dostawcy się liczy, czego D71 nie mówi („elementy renderowane przez Tesserę”). Warstwa toastu (D69, reguła obok `POSITIONER_LAYERS`) zależy od DOM regionu wybranego w N7.
- wpływ: prowadzący pisze w R2 reguły pod DOM, który jednostka może w R3 zmienić; druga iteracja R2 albo zmiana przepisu przez jednostkę (zakazana).
- minimalna reakcja: próba N7 jako krok prowadzącego przed R2 tej rundy (albo R2 części po R3); w D71 rozstrzygnąć, czy ukryte `<input>` dostawcy liczą się do B5.

#### P6. Test Slidera „przeciąganie bez `Layout` i bez re-renderu” jest sprzeczny z D61

- miejsce: D61 (liczba z `data-numeric`, `onValueChange`, wartość z propsów), testy fazy 6 (plan:576), strategia D53/D61.
- dowód: zmiana tekstu liczby przy suwaku w trakcie przeciągania to `Layout` i `Paint`; sterowany Slider (`value` + `onValueChange`) re-renderuje się na każdy krok z definicji. Rejestr `--ts-i-value` ma `inherits: false` (`engines/size.css:1-5`), a D53 czyta go na kciuku (`translate`) i na wypełnieniu (`scale`), więc `writeInstance` musi pisać na dwa elementy (albo przepis kopiuje go do `--_value` na korzeniu).
- wpływ: test albo obleje przy poprawnej implementacji, albo wykonawca wytnie liczbę z poddrzewa bez decyzji.
- minimalna reakcja: test B2/B3 na niesterowanym Sliderze bez liczby albo liczba poza mierzonym poddrzewem; `aria-valuenow` i liczba aktualizowane w `lib/slider.ts` jako nazwany wyjątek `Layout` tekstu; w D53 jedno zdanie o `inherits: false`.

#### P7. `ThemeScope` nie ma gdzie ustawić `color-scheme`, nie rozwiązuje `system`, a `typeset` ma jedną wartość

- miejsce: D70, faza 12.
- dowód: `color-scheme` ustawia tylko JS na korzeniu (`lib/theme.ts:94-96`, `root.style.colorScheme`); silniki deklarują wyłącznie zmienne (`css-layers.ts:585`), TSX nie może mieć `style` poza `--ts-i-*`. `mode: 'system'` rozwiązuje tylko `bootTheme` przez `matchMedia` (`lib/theme.ts:108-114`). `typeset: ['inter']` (`lib/theme.ts:18`), więc „kroje strony na wycinku” wymagają nowych wartości osi i `@font-face` (warunek stopu „nowa oś motywu”). Jasny tryb istnieje tylko na `:root` (`engines/color.css:2`), co D70 już adresuje generatorem.
- wpływ: sekcja odwrócona dostanie natywne paski (fallback „lane”), pola i podświetlenia w schemacie strony, nie sekcji; `ThemeScope` z `system` nie zadziała bez JS; „kroje strony” nie mają drogi w planie.
- minimalna reakcja: w D70 nazwany wyjątek `color-scheme: light | dark` dla `[data-mode]` (w przepisie `surface` albo jako właściwość silnika z powodem); `ThemeScope` przyjmuje tylko `light`/`dark` (albo reguły `@media (prefers-color-scheme)` z generatora); `typeset` dla wycinka: osobna decyzja z listą krojów albo usunięcie z D70.

### Mniejsze

#### M1. `ButtonGroup variant="joined"` z przycięciem przytnie fokus i wciśnięcie

- miejsce: D55 (a), strategia D55.
- dowód: fokus rysuje `outline` z dodatnim `outline-offset` (`recipes/focus.css:11-15`, `--ts-focus-offset: 2px`); przycięcie grupy go odetnie. Istnieje gotowy wariant `[data-focus='inset']` (`focus.css:7-9`, `-2px`).
- minimalna reakcja: segmenty w `joined` dostają `data-focus="inset"`; test widoczności fokusu skrajnego i środkowego segmentu.

#### M2. Wirtualizacja drzewa: fokus, klucz pigułki i wysokość wiersza

- miejsce: D65.
- dowód: `useIndicator` przyjmuje element (`lib/indicator.ts:376-383`, `active?: HTMLElement`), a „Docelowe drzewo” nie wymienia `indicator.ts` jako MODIFY. v2 rozwiązuje oba problemy przypinaniem wiersza aktywnego (`lib/virtual-list.ts` v2, `pins`) i `aria-activedescendant` (`components/tree.tsx:898` v2). v2 `virtual-list.ts` to czysta funkcja bez DOM, mierzy hook `hooks/use-virtual-list.ts`. Wysokość wiersza po `ts-theme-change`: zdarzenie wysyła tylko `applyChoices` na korzeniu (`lib/theme.ts:97`), zmiana osi na poddrzewie go nie wysyła.
- minimalna reakcja: w D65 „wiersz aktywny i fokusowany przypięty (pins)”, test: fokus po przewinięciu kółkiem na koniec i powrocie; na listę Q7 plik, który mierzy (hook), nie czysta funkcja; wysokość wiersza czytana też przy zmianie rozmiaru widoku albo pierwszego wiersza.

#### M3. Trigger Selecta ma 4 węzły

- dowód: `Select.Trigger` (`button`) + `Select.Value` (`span`, `value/SelectValue.js:55`) + `Select.Icon` (`span`, `icon/SelectIcon.js:31`) + SVG = 4; do tego ukryte `<input>` (`root/SelectRoot.js:403-417`). D71 liczy własną ikonę jako 1 węzeł, ale nie slot.
- minimalna reakcja: `Select.Icon` renderowany jako `<svg data-slot="icon">` (wewnętrzny `render`) albo jawna reguła B5 dla triggera.

#### M4. Kontrakt Q7 nie widzi `scrollWidth`, `clientWidth`, `scrollTop`

- dowód: `contracts.test.ts:14` (`DOM_MEASUREMENT` = `getBoundingClientRect|offset*|ResizeObserver|getComputedStyle`). `lib/title-when-cut.ts` (D55 g) i obliczenia wirtualizacji mierzą bez tych słów.
- minimalna reakcja: rozszerzyć wyrażenie w R2 fazy 3 razem z pierwszym konsumentem.

#### M5. Pomiar v2 (D72): bezpieczny, ale droższy niż potrzeba i harness v3 nie pasuje do DOM v2

- dowód bezpieczeństwa: `git archive` tylko czyta obiekty; kopia poza oboma repo; w `tessera/packages/*/package.json` i `tessera/apps/*/package.json` v2 nie ma `link:` ani `file:`, tylko `workspace:*`, więc linki bun w kopii wskazują do wnętrza kopii. Uwaga: zdanie „bez junctionów” jest nieprawdziwe, bun tworzy linki członków workspace.
- dowód kosztu: `dist` v2 leży w working tree MangaShift (`tessera/packages/tessera/dist`, 2026-10-30): CSS (bez fontów) 80 707 B gz po sklejeniu, v3 8 527 B, więc próg „v2 − 30 %” jest spełniony dziewięciokrotnie bez kopii. `tessera/apps/*` w kopii wciąga `_legacy` i dwa fixture Next. Testy B3–B7 v3 szukają `data-recipe`, `data-edge-component` i tras laboratorium, których v2 nie ma; B5 „węzły Tessery” nie ma definicji dla v2. v2 używa Base UI 1.8.0.
- minimalna reakcja: B6 CSS ze statycznego `dist` v2 (bez kopii); kopia tylko dla T1–T5 i B7 (liczniki ogólne) z workspace zawężonym do `tessera/packages/*` i `tessera/apps/gallery`; usuwanie kopii przez `rm -rf` w Git Bash albo `rmdir /s /q`, nigdy PS 5.1 `Remove-Item -Recurse` ani `git worktree`; przed usunięciem lista punktów reparse (`find <kopia> -type l`) z celami wewnątrz kopii.

#### M6. Gate „zero `data-proposal` w repo” trafi w plan i spec

- dowód: plan (D49, warunki końcowe) i spec zawierają ten napis.
- minimalna reakcja: grep zawężony do `packages/` i `apps/`.

#### M7. `inheritScope` pomija atrybut na samym obszarze menu kontekstowego

- dowód: `lib/scope.ts:19` szuka od `trigger.parentElement`; obszar `ContextMenuTrigger` z `data-size` na sobie nie przekaże osi.
- minimalna reakcja: test D66 z `data-size="xs"` na elemencie obszaru, nie na opakowaniu.

#### M8. Dowód WebKit to 27.2, nie 26.2

- dowód: sonda 1, `webkit.version()` = 27.2; O7 wymaga Safari 26.2 i przyjmuje Playwright bez testu.
- minimalna reakcja: w wyniku P-LANE zapisać wersję; Safari 26.2 na macOS w „Human acceptance” obok WebView2.

### Sugestie

- S1. Toast (D69): Base UI oznacza wejście i wyjście atrybutami stanu przejścia; jeśli N7 to potwierdzi dla `Toast`, wariant „`translate` + `opacity`” nie potrzebuje `@starting-style` i wyjątku od zakazu at-rule (zostaje tylko decyzja W16). Do sprawdzenia w próbie, nie zweryfikowane tutaj.
- S2. U-TREE jest największą jednostką (APG, typeahead, wirtualizacja, trzy stany, pigułka, kompozycja z ContextMenu, 10 000 węzłów). Podział na dwie jednostki (wirtualizacja z klawiaturą; trzy stany z menu kontekstowym) zmniejsza ryzyko przekroczenia budżetu jednego subagenta przy 1 workerze Playwright.
- S3. B2 przez trace wymaga mapowania `Layout.endData.layoutRoots` i `Paint.data.nodeId` na poddrzewo (CDP `DOM.pushNodesByBackendIdsToFrontend`); `tests/helpers.ts` tego nie ma (`startTrace`, `failures`). Wpisać do fazy 1 jako osobny krok z testem negatywnym (już jest w strategii D71).

## Zgodność z kontraktem

- B6 ≤ 3 kB (spec): fail na E2 bez definicji pomiaru; pass po min + gz (P1).
- Q7 lista plików pomiaru: częściowo; kontrakt nie widzi części API pomiaru (M4).
- Q2/F6 klatki tylko kompozytora: pass dla wariantu z P3 (sam `translate`).
- O7 Safari 26.2: unknown (M8).
- U27 Firefox: fallback natywny paska jest w D54; nie sprawdzane.
- AGENTS „rozmiar w jednej klatce”: konflikt z Base UI Select „na triggerze” (P2), wymaga decyzji.

## Regresje i integracja

- `lab.spec.ts:548` (`document.getAnimations()` = 0 przy ruchu `off`) i B7 `lab.spec.ts:567-578` złamią się na pierwszym ekranie z „lane” (P4).
- Menu dostaje w fazie 7 „lane” i w fazie 10 eksporty części: B6 menu już na granicy (P1).

## Wykonane kontrole

```text
gzip -9 plików dist (wc -c)                       menu 3074 B, toggle-group 2748 B, single-choice 477 B, indicator 6184 B
bun build --minify -e '../*' -e '../../*' -e react -e 'react/*' -e '@base-ui/*'   menu 2426 B, toggle-group 2224 B, single-choice 313 B (min+gz)
gzip CSS v2 (MangaShift/tessera/packages/tessera/dist, bez fontów, sklejone)       80 707 B; v3: 8 527 B
sonda 1 (scratchpad e3-tech/probe.mjs, page.setContent, headless, 1 przeglądarka naraz)
  Chromium 156.0.8078.4 i WebKit 27.2: animation-timeline, scroll-timeline, timeline-scope, cqb, field-sizing, scrollbar-width = wspierane;
  kciuk z klatkami calc(100cqb - var(--ts-i-block-size)): 0 / 120 / 240 px przy 0 / 50 / 100 %; getAnimations() = 1 (ScrollTimeline)
sonda 2 (probe2.mjs): wariant bez zmiennych (travel container, translate 0 100cqb): koniec 240/240 w obu;
  zagnieżdżone osie --lane z timeline-scope rozdzielne; Chromium: 5 obszarów = 9 rysujących warstw w spoczynku
odczyt Base UI 1.9.0: select/{popup,positioner,list,root,value,icon}, checkbox/root, switch/root
```

## Niewykonane lub nierozstrzygające kontrole

- Base UI `Select` w przeglądarce z „lane” (wymaga Reacta i builda); wnioski P2 z odczytu kodu dostawcy.
- Udział kciuków w liczbie warstw bez pomiaru bazowego (P4).
- Rozmiar Tree i Select po implementacji (P1 to szacunek z v2 i Menu).
- Safari 26.2, WebView2, Firefox.
- Pełne bramki i czas `bun run check` (zakaz w briefie).

## Wymagana ocena człowieka

```text
Uruchom: nic do E3 fazy 7.
Zrób: zdecyduj (P2), czy lista Selecta w trybie „na triggerze” może rosnąć w trakcie przewijania (zachowanie Base UI jak w macOS), i przyjmij, że na dotyku Select otwiera się pod polem.
Oczekiwany wynik: „tak” albo „tylko popper”.
```

## Ograniczenia review

- Plan czytany w całości; kod E2 czytany wybiórczo pod mechanizmy z osi (strażnik, indicator, scope, theme, silniki size/shape/motion/color/focus).
- v2 czytane z working tree MangaShift (HEAD `7a48b43`, po `186fdcd37` zmienia tylko szablon ustawień), bez git.

## Zalecany następny krok

- Poprawić D71 (P1, P5 część B5), D54 + impact scan (P3, P4), D63 + P-LANE (P2), D61 (P6), D70 (P7), przebieg rundy R1/R2 (P5); mniejsze jako zdania w decyzjach. Potem druga runda recenzji technicznej tylko dla zmienionych decyzji.
