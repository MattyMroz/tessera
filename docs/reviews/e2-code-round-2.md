---
kind: review
status: fail
reviewed-state: feat/e2-foundation 378bcee + working tree
date: 2026-10-31
---

# Review: E2, runda kontrolna po poprawkach F1–F3

## Werdykt

**Status:** FAIL (bramka fazy 7: brak uwag krytycznych i poważnych).

Dziesięć z dwunastu uwag P\* jest naprawionych w kodzie i ma test zdolny wykryć regresję. Dwie są naprawione częściowo, a pozostałe drogi obejścia to dokładnie te scenariusze, o które chodziło w pierwszej rundzie:

- silniki P2: strażnik przepisów nadal przepuszcza ruch `top`/`left` (przez `-webkit-transition`) i dowolne liczby (przez arytmetykę na `--_*`);
- silniki P4: komponenty Base UI nadal przyjmują `render`, którym aplikacja podmienia `className`, `style`, a nawet `data-recipe` części.

Obie poprawki są małe. Nowych błędów krytycznych nie ma. Komentarzy w kodzie i śladów legacy nie znalazłem.

## Tabela P\*

| Uwaga                                               | Werdykt                         | Dowód                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| silniki P1 (`motion: off` nie wyłącza przepisów)    | naprawione                      | `src/engines/motion.css:29-38` (zera czasów, `press-scale: 1`), `:40-52` (ta sama gałąź dla reduced motion; dwie kopie, bez trzeciej); test `apps/docs/tests/lab.spec.ts:393-425` łapie przejścia CSS przez `transitionrun` (`tests/helpers.ts:67-69`), które przy czasie 0 nie powstają, więc test oblałby niezerowy czas                                            |
| silniki P2 (furtki białej listy przepisu)           | **częściowo**                   | formy z pierwszej rundy odrzucane (`test/guards/css-layers.ts:50,76-81,224-226,264-272`; fixture `bad/recipes/control.css`, test `css-layers.test.ts:92-111`). Równoważne formy przechodzą, zob. N1                                                                                                                                                                   |
| silniki P3 (TSX komponentów bez strażnika)          | naprawione                      | `eslint.config.js:17-22`; `src/eslint/no-local-appearance.ts:8-23,39` (zakaz `className`, `style` i budowania klas); spec `docs/specification.md:118` opisuje zakres i zostawia `no-data-theme` jako nieprzepisaną. Furtki mniejsze: spread `{...{ style }}`, pliki `.ts` w `components/`                                                                             |
| silniki P4 (`className`/`style` z aplikacji)        | **częściowo**                   | `className`/`style` zdjęte z typów (`button/button.tsx:10`, `menu/menu.tsx:18,112,124`, `dialog/dialog.tsx:13`, `popover/popover.tsx:12`), ale `render` zostaje, zob. N2                                                                                                                                                                                              |
| silniki P5 + lab M6 (blur dialogu w ruchu, Q14)     | naprawione                      | `src/recipes/surface.css:111-129`: dialog wchodzi samym `opacity`, bez `scale`; Popover z `translucent` nie leci (`popover/popover.tsx` bez przelotu), Menu i Tooltip mają `data-material="solid"`                                                                                                                                                                    |
| zachowanie P1 (React Compiler pomija funkcje)       | naprawione                      | `packages/tessera/tsdown.config.ts:17` (`panicThreshold: 'all_errors'`: każdy błąd kompilatora przerywa build); `dist` z 17:37 po ostatniej zmianie źródeł (17:13): `react/compiler-runtime` w `lib/indicator.js`, `components/{menu,tooltip,toggle-group,button}/*.js`, `lib/popup-flight.js`, `lib/use-theme.js`                                                    |
| zachowanie P2 (ToggleGroup re-renderuje grupę, Q9)  | naprawione (kod), test pośredni | `src/lib/single-choice.ts:12-33` (`stateOf` → każdy element subskrybuje tylko swój stan); `components/toggle-group/toggle-group.tsx:125-128` (`useSyncExternalStore` per element), `:72` (stabilny obiekt kontekstu), `:120` (dzieci przechodzą bez zmiany tożsamości, więc re-render grupy po `setActive` nie schodzi do elementów). Dowód tylko na sklepie, zob. m2 |
| zachowanie P3 + M6 (modalność wejścia, `system`)    | naprawione                      | `src/lib/theme.ts:94-118` (skrypt instaluje `trackInputModality` i nasłuch `prefers-color-scheme`); `use-theme.ts` bez drugiego nasłuchu; testy `lab.spec.ts:302-312` (zablokowane skrypty aplikacji, sam skrypt motywu) i `:314-332` (klik bez obwódki, Tab z obwódką)                                                                                               |
| laboratorium P1 (przepisy bez strony i testu)       | naprawione                      | `apps/docs/app/foundation/page.tsx:87-120,189-275` (prawdziwe `data-recipe` `control`/`surface`/`row`); testy wysokości, promienia, squircle, koncentryczności z wierszami, W4 i drabinki stanów na `::after`: `lab.spec.ts:182-278`; `css-properties.d.ts` nie istnieje. Resztka kopii: m4                                                                           |
| laboratorium P2 (B4 bez komponentów)                | naprawione                      | `lab.spec.ts:334-347`: `/screens/overlays`, warunek wstępny (commit `page` i widoczna pigułka), dwie osie, wszystko poza panelem (także `detached`) musi być puste; sonda `:117-173` przypisuje portale panelu przez łańcuch `return`                                                                                                                                 |
| laboratorium P3 (Playwright bez przeglądarek w CI)  | naprawione                      | `.github/workflows/ci.yml:37-44`; `.pre-commit-config.yaml` pre-push: build → lint → vitest → playwright; `AGENTS.md:8,15` (pięć kroków, instalacja przeglądarek po klonie)                                                                                                                                                                                           |
| laboratorium P4 (dokument bez wyglądu Tessery)      | naprawione                      | `apps/docs/app/layout.tsx:19` (`surface` wariant `page`, `surface.css:90-97`); `foundation/motion-sample.tsx:35` = `Button`; nagłówki i linki bez własnego CSS (dziedziczą font i kolor z `body`)                                                                                                                                                                     |
| lab M1 (wyjątki lintu)                              | **częściowo**                   | test `contracts.test.ts:144-154` pilnuje D23; drugi wyjątek nadal bez śladu w spec i planie, zob. m1                                                                                                                                                                                                                                                                  |
| lab M2 (strażnicy F12, osie ↔ CSS)                  | naprawione                      | `contracts.test.ts:89-108,134-142`                                                                                                                                                                                                                                                                                                                                    |
| lab M3 (drzewo)                                     | naprawione                      | testy po komponencie (`button`, `menu`, `toggle-group`, `tooltip`.spec.ts); `docs/structure.md` opisuje faktyczne drzewo                                                                                                                                                                                                                                              |
| lab M4 (jeden rejestrator, klatki obiektowe)        | naprawione                      | `tests/helpers.ts:50-70`; jedyne `Element.prototype.animate` w testach                                                                                                                                                                                                                                                                                                |
| lab M5 (stały sen przy pomiarze)                    | naprawione                      | pomiary przez `expect.poll`; pozostałe `waitForTimeout` tylko przed zatrzymaniem trace i na okno łaski tooltipa (`tooltip.spec.ts:66`)                                                                                                                                                                                                                                |
| lab M8 (kontrolka na stronie, W4 na „Nakładkach”)   | naprawione                      | `lab.spec.ts:260-268`                                                                                                                                                                                                                                                                                                                                                 |
| lab M9 (port)                                       | naprawione                      | `apps/docs/playwright.config.ts:3,17`                                                                                                                                                                                                                                                                                                                                 |
| zachowanie M2 (przelot tylko przy zmianie triggera) | naprawione                      | `src/lib/popup-flight.ts:137` (`stays`: ten sam Positioner, ten sam trigger, brak lotu); unit `popup-flight.test.ts:242-280`; Playwright `menu.spec.ts:139-181` (przewinięcie dialogu i zmiana szerokości okna, asercja: zero animacji `role=menu`). Tooltip bez paska ma `trigger` zawsze `undefined`, więc nie leci przy przestawieniu                              |
| zachowanie M3 (nasłuchy `window` na stałe)          | naprawione                      | `src/lib/press.ts:31-48` (nasłuch od wciśnięcia do puszczenia); test `press.test.ts:145`                                                                                                                                                                                                                                                                              |

## Nowe uwagi

### Krytyczne

Brak.

### Poważne

#### N1. Strażnik przepisów: ruch spoza kompozytora i liczby nadal przechodzą (dokończenie silniki P2)

- miejsce: `packages/tessera/test/guards/css-layers.ts:50` (`MOTION_DECLARATIONS` bez aliasów z prefiksem), `:224` (limit liczy literały w jednym wyrażeniu, nie wartość wyliczoną przez `--_*`), `:268-272` (selektor musi tylko zawierać zakres przepisu, reguły zagnieżdżone nie są sprawdzane).

- dowód: sonda w scratchpadzie (`checkLayers` na czystym `src/` z `recipes/control.css` zaimportowanym w `tessera.css`) zwróciła `[]` dla:

  ```css
  @layer components {
    [data-recipe='control'] {
      --_one: 1;
      --_two: calc(var(--_one) + 1);
      --_three: calc(var(--_one) + var(--_one) + var(--_one));
      z-index: calc(var(--_two) + 1);
      width: calc(var(--ts-size-height) * var(--_three));
      -webkit-transition: top var(--ts-motion-duration-fast) var(--ts-motion-ease-out);
    }
    [data-recipe='control'] ~ * { background: var(--ts-color-tint); }
    :root:has([data-recipe='control']) { background: var(--ts-color-tint); }
    [data-recipe='control'] { & ~ body { color: var(--ts-color-tint); } }
  }
  ```

  Kontrola: dopisanie `z-index: calc(1 + 1)` do tego samego pliku daje jedno naruszenie, więc sonda działa.

- wpływ: `-webkit-transition` to w Chromium i WebKit alias `transition`, więc ruch `top`/`left` (Q2, Z4) przechodzi obok polityki ruchu. Liczby 2, 3 i dalsze powstają z `--_*` bez ograniczeń, czyli warunek „liczby `0`, `1`, `-1`, `100%`” wciąż zależy od dobrej woli autora (U25, S4). Selektory z zakresem przepisu mogą stylować obce elementy (`~ *`, `:root:has(…)`, zagnieżdżone `& ~ body`).

- minimalna reakcja: (1) właściwość normalizować przed sprawdzeniem (`-webkit-`/`-moz-` zdjęte, jak robi to `appearanceProperty` w `style-policy.ts:84`) albo wprowadzić białą listę właściwości przepisu; (2) zakazać literału w wyrażeniu matematycznym, które czyta `--_*` (literał tylko obok wyjścia silnika albo jako `100%`); (3) dla selektorów: podmiot (ostatni złożony selektor) musi mieć zakres przepisu, z nazwanym wyjątkiem `[data-side]:has(> [data-recipe=…])`. Do każdego przypadku fixture `bad/`.

#### N2. `render` Base UI omija zakaz `className`/`style` (dokończenie silniki P4)

- miejsce: `src/components/menu/menu.tsx:18,94,112,124,143,147,177`, `dialog/dialog.tsx:13,29,33`, `popover/popover.tsx:12,29,33`: typy to `Omit<Base….Props, 'className' | 'style'>`, więc zostaje `render` z `BaseUIComponentProps` (`node_modules/@base-ui/react/internals/types.d.ts:33`).
- dowód: Base UI klonuje element z `render` przez `mergeProps(props, render.props)` (`@base-ui/react/internals/useRenderElement.js:132,148`). `className` i `style` się łączą, a pozostałe propsy elementu `render` wygrywają. `<MenuItem render={<div className="h-12 px-10" />}>` albo `render={<div data-variant="danger" style={{ height: 40 }} />}` zmienia wysokość, padding i wariant wiersza. Reguła aplikacji przepuszcza `h-12`, `px-10` i `height` jako układ (`src/eslint/layout.ts:8-19`). Druga droga do tego samego to klasy z wariantem dziecka na elemencie rodzica (`*:h-12`, `[&_button]:h-12`): `style-policy.ts:88-90` ocenia tylko bazę klasy, a `rules.test.ts:107` jawnie uznaje `[&>svg]:size-4` za poprawne.
- wpływ: I3 i W1/W4 nadal da się złamać z aplikacji bez sygnału lintu, czyli dokładnie scenariusz „jeden przycisk inny niż reszta” z P4. Dokumenty komponentów piszą „Neither part takes `className` or `style`”, co jest prawdą tylko dla tych dwóch nazw.
- minimalna reakcja: dodać `render` do `Omit` we wszystkich opakowaniach części Base UI (E2 go nie używa), a wariantami dziecka zajmuje się prowadzący: albo zakaz wariantów `*:`/`**:`/`[&…]` z właściwością rozmiaru lub odstępu w trybie aplikacji, albo jawny wpis w spec, że tej drogi strażnik nie obejmuje.

### Mniejsze

#### m1. Drugi wyjątek lintu laboratorium nadal poza spec i strażnikiem (lab M1 częściowo)

- miejsce: `eslint.config.js:33-42` (`lab/first-frame-probe`); `docs/structure.md:102`, `AGENTS.md:57` („jedyny wyjątek … D23”); `contracts.test.ts:145-150`.
- dowód: test liczy tylko reguły ustawione na `'off'`. Wyjątek przez przekonfigurowanie reguły (jak `first-frame-probe`), przez `0` albo przez `"off"` w cudzysłowie podwójnym przechodzi.
- wpływ: dokumenty twierdzą, że wyjątek jest jeden, a są dwa; następny wyjątek tej postaci też przejdzie bez śladu.
- minimalna reakcja: wpis drugiego wyjątku w spec (U19) i planie oraz test, który porównuje pełną listę bloków `lab/*` w `eslint.config.js` z listą oczekiwaną.

#### m2. Q9 bez testu na prawdziwym komponencie

- miejsce: `src/lib/single-choice.test.ts:5-27` (symulacja subskrypcji na sklepie); `apps/docs/tests/toggle-group.spec.ts` (DOM, klawiatura, pigułka).
- dowód: żaden test nie liczy renderów `ToggleGroupItem`. Gdyby wybór wrócił do kontekstu albo do propsów elementów, testy zostałyby zielone.
- wpływ: twardy budżet Q9 ma dowód tylko pośredni.
- minimalna reakcja: sonda fiberów z `lab.spec.ts:117-173` na `/components`: klik w grupie z N opcjami → dokładnie 2 commity `ToggleGroupItem`.

#### m3. CSS komponentu może celować w dowolny element

- miejsce: `css-layers.ts:237-241` (`checkComponent` sprawdza tylko `:focus-visible`, `*` i warstwę).
- dowód: ta sama sonda: `components/x/x.css` z `[data-recipe='control'] { display: none; }` i `button { order: -1; }` → `[]`.
- wpływ: tylko właściwości układu, ale globalnie: jeden komponent może ukryć albo przestawić części innych.
- minimalna reakcja: selektor komponentu musi zawierać `[data-component='<nazwa pliku>']`.

#### m4. Próbki fokusu na `/foundation` to kopia przepisu inline

- miejsce: `apps/docs/app/foundation/page.tsx:53,357-379`.
- dowód: obwódka jest wpisana stylem (`outline`, `outlineOffset`) zamiast `data-focus` z przepisu `recipes/focus.css`; żaden test nie czyta `focus-outer`/`focus-inset`.
- wpływ: ten sam rodzaj rozjazdu co lab P1, w małej skali: zmiana `focus.css` (np. `box-shadow: var(--ts-depth-glow)`) nie będzie widoczna na próbce, którą ocenia właściciel.
- minimalna reakcja: próbki z `data-focus="outer"`/`"inset"` na elemencie z fokusem programowym albo zapis w D23, że fokus jest pokazywany jako próbka wyjść silnika.

## Wykonane kontrole

- Odczyt: `AGENTS.md`, plan E2 (sekcja „Wynik recenzji kodu”), trzy raporty pierwszej rundy, `git status`/`git diff --stat` worktree (tylko odczyt).
- Kod: `engines/motion.css`, `engines/depth.css`, `recipes/{surface,focus}.css`, `test/guards/{css-layers.ts,css-layers.test.ts,contracts.test.ts}`, `src/eslint/{no-local-appearance,style-policy,layout,index}.ts`, `eslint.config.js`, wszystkie komponenty, `lib/{single-choice,popup-flight,press,theme,theme-script,input-modality,use-theme,compose-refs}.ts(x)`, `tsdown.config.ts`, `.github/workflows/ci.yml`, diff `.pre-commit-config.yaml`, `apps/docs/{playwright.config.ts,app/layout.tsx,app/globals.css,app/foundation/*}`, wszystkie speki i `helpers.ts`; `packages/tessera/docs/toggle-group.md`, `docs/decisions/e2-base-ui.md` (rewizja), `docs/specification.md:65,69,118`, `docs/structure.md`.
- Sonda strażnika CSS: `bun` z `checkLayers` na drzewie w scratchpadzie (z kontrolą pozytywną) → N1, m3.
- Base UI 1.9.0: `internals/types.d.ts`, `internals/useRenderElement.js`, `merge-props/mergeProps.js` → N2.
- `dist`: daty plików i import `react/compiler-runtime` w 7 modułach.
- grep: komentarze, `legacy`/`compat`/`TODO`/`eslint-disable`/`@ts-*` w `packages/tessera/{src,test,scripts}`, `apps/docs/{app,tests}`, `eslint.config.js`: brak (poza generowanym `next-env.d.ts` i tekstem komunikatu reguły).

## Ograniczenia

- Nie uruchamiałem vitest ani Playwrighta (zgodnie ze zleceniem; wynik 687 + 66 przyjęty od zlecającego). Zachowanie w przeglądarce oceniane z kodu i testów.
- N2: ścieżka `render` potwierdzona kodem Base UI i typami, bez uruchomienia w przeglądarce; ścieżka wariantów dziecka potwierdzona testem reguły (`rules.test.ts:107`), bez osobnego uruchomienia lintu.
- Wygląd i ocena UX fokusu (np. obwódka po strzałce w polu tekstowym) poza zakresem: ocenia właściciel.
