---
kind: review
status: fail
reviewed-state: feat/e2-foundation, HEAD 378bcee + niezacommitowany working tree (stan 2026-11-01)
date: 2026-11-01
---

# Review: E2 część 2, silniki, przepisy i strażnicy

## Zakres

- przedmiot: `packages/tessera/src/engines/*.css`, `src/recipes/*.css`, `src/styles/*.css`, `scripts/colors.ts` i `scripts/palette.ts`, `test/guards/**` (`css-layers.ts`, `contracts.test.ts`, fixture), `src/eslint/**`, `eslint.config.js`, `test/package/**`.
- baseline: commit `378bcee` (bootstrap). Część 1 nie jest zacommitowana, więc diff z `git diff` obejmuje obie części; pliki czytane bezpośrednio.
- authority: `docs/plans/e2-foundation.md` część 2 (D29–D47, rozstrzygnięcia rund 2–3) z późniejszymi decyzjami prowadzącego (statusy jak akcenty, tylko próg `narrow`, obszar trafienia = pudełko, B7 = warstwy rysujące, przycięcie pętli `aria-busy` z `docs/decisions/e2-layers.md`), `docs/specification.md`, `AGENTS.md`, `docs/structure.md`.
- ryzyka: kaskada i specyficzność nowych stanów, `forced-colors`, dziury w białych listach, ślady starych nazw, ruch poza kompozytorem, B8.
- poza review: `lib/`, komponenty TSX (poza tym, co czytają przepisy), laboratorium i specy Playwright, pomiary B7.

## Werdykt

**Status:** FAIL (jedna uwaga poważna, poprawka lokalna w jednym przepisie).

**Najważniejszy powód:** w `control` stan zaznaczenia przegrywa specyficznością z hover i wciśnięciem. W trybie `forced-colors` etykieta wciśniętego przycisku pod kursorem jest w kolorze `HighlightText` na prawie gołym `Canvas`, czyli praktycznie znika (łamie Q19). W zwykłym trybie hover zdejmuje wypełnienie zaznaczenia. Reszta zakresu jest zgodna z D29–D47: zero komentarzy, zero starych nazw, strażnicy i kontrakty zielone (274 testy), B8 = 146.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Zaznaczenie kontrolki przegrywa z hover i wciśnięciem; w `forced-colors` tekst wciśniętego przycisku znika

- miejsce: `packages/tessera/src/recipes/control.css:180-183` (zaznaczony, specyficzność (0,2,1)), `:195-199` (hover, (0,4,1)), `:201-203` (wciśnięcie, (0,4,1)), `:221-228` (blok `forced-colors`, (0,2,1)); konsument: `apps/docs/app/screens/edges/page.tsx:288` (`<Button variant="soft" aria-pressed="true">`).
- dowód (DIRECT, odczyt kaskady): reguła hover `[data-recipe='control']:hover:not(:disabled, [data-disabled], :has(> [data-slot='input'][readonly]))::after` ma specyficzność (0,4,1), bo `:not()` i `:has()` biorą specyficzność najmocniejszego argumentu (`[data-slot][readonly]` = (0,2,0)). Reguła zaznaczenia `[data-recipe='control']:is([aria-pressed='true'], …)::after` i jej odpowiednik w bloku `forced-colors` mają (0,2,1). Dla wciśniętego przycisku pod kursorem `opacity` `::after` to więc `--_hover` (0,07 atramentu albo 0,16 tonu), a nie `--ts-state-selected-fill` ani `1`. W `forced-colors` tło `::after` zostaje `Highlight` (hover zmienia tylko krycie), krycie spada do ok. 0,07, a tekst ma `color: HighlightText` (`:222`). W motywach Windows `HighlightText` jest dobrany do `Highlight`, nie do `Canvas` (np. „Desert”: `HighlightText` #FFF5E3 na `Canvas` #FFFAEF; „Night sky”: #2B2B2B na #000000), więc etykieta jest nieczytelna. Test `edges.spec.ts:453-517` sprawdza „Pressed” tylko jako cel kliknięcia i nie mierzy jego wyglądu pod kursorem; Runtime nie był obserwowany (bez sondy, wniosek z kaskady jest deterministyczny).
- wpływ: łamie Q19 („każdy stan widoczny”) na głównym celu U28 (WebView2 na Windows), od pierwszego konsumenta `aria-pressed`. W zwykłym trybie wciśnięty przycisk pod kursorem traci wypełnienie zaznaczenia (0,16 → 0,07) i wygląda jak niewciśnięty z hover, co przeczy D37 i W8 („zaznaczony” jako stan z ARIA). Każda rodzina E3 z `aria-pressed`, `aria-checked` albo `:checked` na `control` (Toggle, Checkbox jako przycisk) dziedziczy ten błąd.
- minimalna reakcja: rozstrzygnąć kolejność stanów w jednym miejscu przepisu. Najprościej: hover i wciśnięcie nie zmieniają krycia zaznaczonej kontrolki (dopisać listę zaznaczenia do `:not(…)` w `:196` i `:201`) albo blok `forced-colors` zaznaczenia dostaje specyficzność ≥ (0,4,1). Do testu `forced-colors` w `edges.spec.ts` dopisać hover nad „Pressed”: tło `::after` ma krycie 1 i kolor ≠ tła strony. O tym, czy w zwykłym trybie zaznaczenie ma reagować na hover, decyduje prowadzący (wygląd).

### Mniejsze

#### M1. Kontrakt „ton `surface` bez obrysu” da się obejść zmienną lokalną

- miejsce: `packages/tessera/test/guards/css-layers.ts:688-692`; reguła w produkcie `src/recipes/surface.css:193-196`.
- dowód: `toneProblems` szuka tylko deklaracji, których nazwa zaczyna się od `border`. `--_border: var(--_tint)` w regule tonu (zmienna, którą czyta `border` w `:16`) przechodzi, tak samo `outline` albo `box-shadow: inset …`. Fixture `bad/recipes/surface.css` sprawdza tylko `border-color`.
- wpływ: furtka w strażniku z „Forbidden” („obrys powierzchni z tonem”). Łapie ją dopiero test Playwright `lab.spec.ts:678-686` (sprawdza `border-color`, ale nie `outline`).
- minimalna reakcja: w `toneProblems` zakazać też `--_border` z wartością inną niż `transparent` oraz `outline*`; dopisać przypadek do fixture `bad/`.

#### M2. Nowe wpisy białych list bez konsumenta i bez kontroli „nieużyty oblewa”

- miejsce: `css-layers.ts:55-57` (`ease-in-out`, `content` w `RECIPE_KEYWORDS`), `css-layers.ts:94-95`, `:492`, `:510` (`CLIP_SUPPORTS`, `CLIP_PROPERTIES`).
- dowód: grep wartości w `src/recipes/*.css`: `ease-in-out` i `content` (jako słowo wartości) nie występują nigdzie. Ich konsumenci (szkielet `pulse`, `field-sizing` w Textarea) są odłożeni do E3/E4 („Deferred”). Blok `@supports (overflow-clip-margin: border-box)` ma konsumenta (`control.css:209-214`), ale strażnik nie oblewa, gdy go zabraknie, i nie wiąże go z plikiem `control`, choć `structure.md:142` opisuje go jako „dziś tylko w `control`”. Wyjątki selektorów i zmienne dostawcy mają kontrolę nieużycia (`css-layers.ts:663-669`), te pozwolenia jej nie mają.
- wpływ: pozwolenia „na zapas”, sprzeczne z zasadą D35 i U25 („wpis bez użycia łamie regułę”); po usunięciu konsumenta furtka zostaje otwarta bez sygnału.
- minimalna reakcja: usunąć `ease-in-out` i `content` do czasu konsumenta albo zapisać w planie, że słowa kluczowe są wyjątkiem od tej zasady; `CLIP_SUPPORTS` przypisać do `control` jak `RECIPE_SELECTOR_EXCEPTIONS` i oblewać nieużyty.

#### M3. Zajęty przycisk obraca każdy slot ikony, także `iconEnd`

- miejsce: `src/recipes/control.css:101-103`; `src/components/button/button.tsx:39,41`.
- dowód: selektor `&[aria-busy='true'] > [data-slot='icon']` trafia oba sloty. `Button` z `icon` i `iconEnd` (np. etykieta i strzałka menu) obraca obie ikony; `docs/button.md:11` mówi o jednym slocie („the icon slot turns”). Przycisk zajęty bez ikony nie pokazuje pętli wcale.
- wpływ: dwie pętle naraz (w Chromium dwie warstwy `ActiveRotateAnimation` zamiast jednej, którą liczy `e2-layers.md`), strzałka, która się kręci; zajętość bez ikony niewidoczna.
- minimalna reakcja: obracać tylko pierwszy slot (`> [data-slot='icon']:first-child` albo jawny slot pętli) i zapisać w `docs/button.md`, co pokazuje zajęty przycisk bez ikony.

#### M4. Przy `corners: full` pole wyboru jest kołem, czyli wygląda jak radio

- miejsce: `src/engines/shape.css:150-153` z `:95-101` (`--_ts-shape-ratio: 0.5`, `capsule: 1`).
- dowód: przy `full` krzywa kontrolki = 0, więc `--ts-shape-box = min(0,5 × box, 0,5 × box) = box / 2`. W3 ustala „Radio = koło”, a `box` ma być „w proporcji kontrolki”; przy domyślnym `corners: full` obie reguły dają ten sam kształt dla checkboxa i radia.
- wpływ: domyślny motyw w E3 nie odróżni checkboxa od radia kształtem.
- minimalna reakcja: punkt do checkpointu 3 (liczby D38 kalibruje właściciel): np. górna granica proporcji `box` poniżej koła.

#### M5. Margines strony popupu odjęty tylko w osi bloku

- miejsce: `src/recipes/surface.css:54-67` (marginesy stron `left`, `right`, `inline-start`, `inline-end`), `:81-82`.
- dowód: `max-block-size` odejmuje `--ts-space-inset`, `max-inline-size: var(--available-width)` nie. Dla popupu po stronie inline (podmenu) margines leży w osi inline, więc przy braku miejsca popup wychodzi poza okno o `inset` (4–8 px).
- wpływ: drobne przepełnienie podmenu w wąskim oknie (F16 „popup mieści się w oknie”).
- minimalna reakcja: `max-inline-size: calc(var(--available-width) - var(--ts-space-inset))` dla stron inline albo test podmenu przy 320 px.

#### M6. Slot `icon` znaczy co innego w `control` i w `row`

- miejsce: `src/components/menu/menu.tsx:45,53` (`<svg data-slot="icon">`), `src/components/button/button.tsx:39` (`<span data-slot="icon">`), `src/recipes/row.css:37-49`, `apps/docs/app/foundation/page.tsx:109-116` (span w wierszu).
- dowód: w `control` slot to opakowanie HTML, w `row` raz samo `<svg>` (menu), raz span (`/foundation`); przepis `row` obsługuje oba przypadki dwiema regułami, a `ROW_ICON_GLYPH` ma gałąź `[data-slot='icon'] > svg` tylko dla próbki laboratorium.
- wpływ: wspólny słownik slotów (U10) przestaje być jednoznaczny; pętla albo ruch na slocie `icon` w wierszu trafiłby w element SVG, czego zakazuje Q2.
- minimalna reakcja: jedno znaczenie slotu (opakowanie HTML) w menu i w przepisie `row`, potem zawęzić `ROW_ICON_GLYPH`.

#### M7. Furtki ESLint w trybie `components`

- miejsce: `src/eslint/no-local-appearance.ts:23-28`, `:63-73`; `contracts.test.ts:301-302`.
- dowód: (a) atrybut SVG jest sprawdzany tylko pod `<svg>` w tym samym pliku, więc `<path strokeWidth="1.5">` zwracane bez `<svg>` przechodzi (literał w ciągu znaków nie jest liczbą); (b) `JSXSpreadAttribute` poza SVG nie jest sprawdzany, więc `<span {...{ className: 'x', style: { color: 'red' } }} />` omija zakaz `className` i `style`; (c) kontrakt stałych czasu łapie tylko nazwy `UPPER_CASE` (`NUMERIC_CONSTANT`, `TIME_USE`), więc `const hold = 300; setTimeout(fn, hold)` w `lib/` przechodzi przez oba testy.
- wpływ: mało prawdopodobne, ale realne obejścia białych list z D39 i D43.
- minimalna reakcja: atrybuty SVG sprawdzać po nazwie elementu (`path`, `circle`, `g`…), nie tylko po przodku `<svg>`; spread z literałem obiektu rozwijać jak `style`; w kontrakcie czasu liczyć każdą stałą liczbową użytą jako czas.

#### M8. `AGENTS.md` opisuje stan przejściowy faz

- miejsce: `AGENTS.md:40`, zdanie „Reguły części 2 E2 włączają się na kodzie produktu w fazie z tabeli „Włączenie” …; do tej fazy działają tylko na fixture”.
- dowód: po fazie 14b wszystkie pozycje tabeli „Włączenie” działają na `src/` (`css-layers.test.ts:12-14`, `contracts.test.ts` na `src`, blok `tessera/components`).
- wpływ: nieaktualna instrukcja dla agentów (Z3, „spec, `AGENTS.md` zgodne z kodem”).
- minimalna reakcja: usunąć zdanie przy zamknięciu E2 (faza 16).

### Sugestie

- S1. Separator wiersza (`row.css:144-150`, tło `--ts-color-separator` z kryciem 0,26) i obrys popupu (`surface.css:16` z `--ts-depth-overlay-border`) w `forced-colors` zostają półprzezroczyste, bo Chromium wymusza kolor, a alfę zostawia (baseline planu). Menu na `Canvas` strony ma wtedy ledwo widoczną krawędź. D36 tego nie obejmuje; do oceny w motywie kontrastowym Windows w checkpoincie 3 (punkt 7 listy na komputerze).
- S2. Strażnik nie pilnuje `forced-color-adjust: none` (Q19: „tylko punktowo”); fixture `good/recipes/control.css` używa go swobodnie. Wystarczy pozwolić na niego tylko w bloku `forced-colors`.
- S3. Parser strażnika pomija komentarze CSS (`css-layers.ts:202`), a hook `no-test-prose` obejmuje tylko testy. Odrzucenie komentarza w `src/**/*.css` zamknęłoby regułę „zero komentarzy” maszynowo.
- S4. Przed pierwszym pomiarem pigułki (`indicator.css:19`, `opacity: 0`) wybrana opcja ToggleGroup w `forced-colors` ma tekst `HighlightText` na `Canvas` (`control.css:221-222`), bo `::after` kontrolki jest wyłączone (`indicator.css:6-8`). Warto sprawdzić pierwszą klatkę statycznego eksportu w tym trybie.
- S5. Poza zakresem części 2 (stan z części 1): obwódka fokusu nadpisuje `box-shadow` kontrolki (`recipes/focus.css:186-191`, specyficzność (0,4,0)), więc przycisk `raised` i `solid` z poświatą traci cień przy fokusie z klawiatury, gdy neon jest wyłączony. Do decyzji wyglądu, nie do tej rundy.
- S6. Popover i dialog są kontenerami przewijania (`surface.css:80-87`, `:141`), więc przycinają poświatę neonu i cień `raised` kontrolek przy krawędzi; obwódka fokusu mieści się na styk w gęstości `compact` (padding 4 px = offset 2 + grubość 2). Ocena człowieka przy `neon: full`.

## Zgodność z kontraktem

- D29 `text`: pass; `recipes/text.css` ma dokładnie warianty `label`, `description`, `error`, `title`, `kbd`, `display`, `data-numeric`, `text-box` i `text-wrap` jak w decyzji; stopnie `display-*` i `measure-narrow` tylko w `type.css:197-199`.
- D30 ton: pass z P1; `control.css:105-147`, `row.css:74-96`, `surface.css:169-196`; poświata tylko przy `accent` (`--_glow: none` dla pozostałych); `raised` z tonem zostaje wypukły; statusy jedna wartość w obu trybach (`scripts/colors.ts:189-197`, `color.css` zgodny z generatorem: test).
- D31: pass dla przepisu; `will-change` nie występuje w `src/**/*.css` ani `src/lib` (grep); pomiar i B7 poza zakresem.
- D32: pass; `recipes/focus.css:186-187`, wyjątek `KEYBOARD_FOCUS` obejmuje tylko selektor przycisków.
- D33: pass; `container-type` tylko na `data-container` i `page` (`surface.css:103-105`), `CONTAINER_WIDTHS = { narrow: 400 }` (`eslint/layout.ts:8`), jedyny konsument `surface.css:205-209`, kontrakt „każdy próg użyty” zielony; `data-profile` i `profile` nie występują poza testem odrzucenia zapisu (`theme.test.ts:57-59`).
- D34: pass z M3; `motion.css:1-21` (trzy klatki, tylko `rotate`, `translate`, `opacity`), wyjścia pętli zerowane w `off` i `prefers-reduced-motion` (`:65-94`), strażnik klatek z fixture `bad/` (nazwa, `width`, selektor, `!important`, zagnieżdżenie).
- D35: pass z M5; `surface.css:80-87`, `:99-101`, `:116-122`; `VENDOR_VARIABLES` = 3 wpisy z powodem i kontrolą nieużycia.
- D36: pass z P1; bloki w `control`, `row`, `surface`, `indicator`; kolory systemowe tylko w bloku (strażnik + fixture).
- D37: pass z P1; lista selektorów jak w decyzji, `selected-fill*` w `state.css:142-154`, `indicator-active*` nie występuje.
- D38: pass z M4; `size.css:66-81` (geometria, ≥ 24 px przy `pointer: coarse`), `--ts-size-hit` i `control::before` nie występują.
- D39: pass; `@property --ts-i-*` = `INSTANCE_KEYS` (`size.css:1-17`, `lib/instance.ts`, kontrakt), wcięcie `row.css:98-129` z wyjątkiem `ARIA_LEVEL_INDENT` i fixture.
- D42: pass; `depth.css:52-56`, `layer-overlay` i `layer-modal` nie występują.
- D43: pass z M7; `stroke-width` na `<svg>` slotów (`control.css:60-65`, `row.css:37-49`), biała lista atrybutów SVG i literałów w `no-local-appearance.ts` z testami w `rules.test.ts`.
- D47 i zero legacy: pass; grep starych nazw z „Forbidden” w `packages/tessera/{src,test,scripts,docs}`, `apps/docs/{app,tests}`, spec, `structure.md`, `AGENTS.md`: tylko celowy test odrzucenia `profile`.
- Zero komentarzy: pass w zakresie (grep `//` i `/*` w CSS, TS skryptów, strażników, ESLint, testów paczki i `eslint.config.js`).
- B8: pass; 146 unikalnych nazw `--ts-*` (deklaracje i `@property`) w `src/engines`, `src/recipes`, `src/components/*/*.css`, zgodnie z planem.
- Ruch tylko kompozytor: pass; przejścia w przepisach tylko `opacity` i `scale`, pętla `rotate`; `@supports` przycięcia nie animuje niczego.

## Regresje i integracja

- Kaskada stanów `control` (P1) to jedyna znaleziona kolizja przepisów; `indicator` wyłącza `::after` kontrolek w grupie (`indicator.css:6-8`), więc ToggleGroup jej nie ma.
- Osie poddrzewa: każda oś z `subtreeAxes` ma regułę silnika poza `:root` (kontrakt zielony); silniki przeliczają pochodne na `[data-size]`, `[data-corners]`, `[data-curve]`, `[data-motion]`, więc atrybut skopiowany na popup działa jak na poddrzewie. Wysokość przy `pointer: coarse` przechodzi do `shape` (te same selektory, później w kaskadzie).
- Wysokość przy dotyku podnosi też wiersze (`row` czyta `--ts-size-height`); zgodne z intencją D38, bez osobnego testu wierszy.

## Wykonane kontrole

```text
bunx vitest run --maxWorkers=6 packages/tessera/test/guards/css-layers.test.ts packages/tessera/test/guards/contracts.test.ts
Test Files 2 passed (2); Tests 274 passed (274); 211 ms

grep starych nazw (profile, size-hit, indicator-active, layer-overlay, layer-modal, MenuItemVariant, nextOption,
data-variant='danger', data-slot='header'/'body') w src, test, scripts, docs paczki, apps/docs/{app,tests}, spec, structure, AGENTS
jedyne trafienia: src/lib/theme.test.ts:57-59 (test odrzucenia zapisu z profile)

grep komentarzy w zakresie: brak
licznik nazw publicznych (src): 146
grep słów RECIPE_KEYWORDS w wartościach recipes/*.css: nieużyte m.in. ease-in-out, content (nowe w części 2)
```

## Niewykonane lub nierozstrzygające kontrole

- P1 nie był obserwowany w przeglądarce (zakaz zapisu poza raportem uniemożliwił sondę spec). Wniosek wynika ze specyficzności selektorów; potwierdzenie: test z P1.
- `budget.test.ts` i `package.test.ts` nie uruchomione (wymagają świeżego `dist`); B8 policzone na `src`.
- `rules.test.ts` nie uruchomiony; ocena ESLint z odczytu kodu i istniejących przypadków testowych.

## Wymagana ocena człowieka

```text
Uruchom: bun run dev → /screens/edges, sekcja States; Edge z motywem kontrastowym Windows (lewy Alt + lewy Shift + Print Screen)
Zrób: najedź kursorem na przycisk „Pressed”, potem przytrzymaj na nim przycisk myszy
Oczekiwany wynik: etykieta „Pressed” czytelna w obu chwilach, tło zaznaczenia nie znika
Zwróć uwagę na: krawędź otwartego menu i separatory (S1), checkbox przy corners: full (M4)
```

## Ograniczenia review

- Część 1 nie ma commita, więc nie da się oddzielić zmian części 2 od części 1 diffem; za stan części 1 uznano to, co plan opisuje jako baseline.
- Komponenty i `lib/` czytane tylko tam, gdzie wpływają na przepisy (sloty, `aria-busy`, `aria-pressed`).

## Zalecany następny krok

- Poprawić P1 w `control.css` z testem hover nad „Pressed” w `forced-colors`, potem runda kontrolna tylko dla tego przepisu.
- M1, M2 i M7 zamknąć w strażnikach z fixture `bad/` w tej samej rundzie (małe zmiany); M3–M6 do decyzji prowadzącego, M4 i S1 do checkpointu 3.
