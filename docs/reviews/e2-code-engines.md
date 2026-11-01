---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2 (feat/e2-foundation), zmiany niezacommitowane względem 378bcee, stan plików 2026-10-31
date: 2026-10-31
---

# Review: E2, silniki, przepisy, strażnicy, zgodność ze specyfikacją

## Zakres

- przedmiot: `packages/tessera/src/engines/*.css`, `scripts/{palette,colors}.ts`, `src/recipes/*.css`, `src/styles/{tessera,tailwind}.css`, `src/eslint/**`, `test/guards/**`, `test/package/budget.test.ts`, `tsdown.config.ts`, `package.json`; komponenty i `lib/` tylko tam, gdzie dotykają kontraktu silników (atrybuty, `className`, odczyt ruchu).
- baseline: 378bcee + zmiany robocze (git nieużywany, zgodnie z briefem).
- authority: `docs/specification.md`, `docs/plans/e2-foundation.md` (D1–D28), `docs/decisions/e0-concentric.md`, `e2-base-ui.md`, `AGENTS.md`; v2 (`MangaShift/tessera/packages/tessera/src`, working tree `refactor/tessera-motion`) jako źródło przeniesionych wartości.
- ryzyka: przemyt wyglądu lub liczb obok strażnika, ruch poza kompozytorem, rozjazd wyjść silników ze spec, drugie źródło wiedzy.
- poza review: zachowanie `lib/*` (sliding, przelot), laboratorium, testy Playwright, wygląd na żywo.

## Werdykt

**Status:** FAIL (bramka fazy 7: brak uwag krytycznych i poważnych).

**Najważniejszy powód:** wybór `motion: off` nie wyłącza ruchu przepisów (W20), a biała lista strażnika przepuszcza ruch `top/left` i liczby budowane z jedynek; wygląd komponentów można też zmienić z aplikacji przez `className`/`style`, a TSX komponentów nie ma żadnego strażnika. Silniki same w sobie są zgodne ze spec w wartościach (W1, W3, W4, W8, W14, D13, D15) i nie mają komentarzy ani nazw legacy.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. `data-motion='off'` wyłącza tylko sliding; przepisy dalej animują

- miejsce: `src/engines/motion.css:29-31` (tryb `off` ustawia tylko `--ts-motion-mode`) wobec `motion.css:33-45` (reduced motion zeruje czasy i `press-scale`); konsumenci czasu: `recipes/control.css:30,42,131-133`, `recipes/indicator.css:19,58-63`, `recipes/surface.css:115-122,135`.
- dowód: przy `data-motion="off"` i bez `prefers-reduced-motion` `--ts-motion-duration-*` zostają 50–250 ms, a `--ts-motion-press-scale` 0,97; JS (`lib/indicator.ts:88-104`) czyta tryb `off`, CSS go nie zna.
- wpływ: W20/D6 mówi „`off` (też przy reduced motion)”, a squishy to wciśnięcie. Wybór `off` w panelu zostawia uginanie przycisku, zoom dialogu i przenikanie nakładek, czyli inny stan niż reduced motion. Właściciel na checkpoincie 2 ocenia tryby ruchu, w tym `off`.
- minimalna reakcja: `[data-motion='off']` dostaje te same zera co gałąź reduced motion (jedna reguła z oboma selektorami albo jeden blok w `@media` i jeden poza nim, bez trzeciej kopii wartości); przypadek w `lab.spec.ts`.

#### P2. Biała lista przepisu nie jest per właściwość: furtki dla ruchu, liczb i selektorów

- miejsce: `test/guards/css-layers.ts:35-40` (`RECIPE_KEYWORDS` wspólne dla wszystkich właściwości), `:42` + `:178-183` (tokeny po usunięciu `+`, `-`, `*`, `/`), `:197-198` (selektor przepisu niesprawdzany).

- dowód: sonda w scratchpadzie (`checkLayers` na przygotowanym `src/`) zwróciła `[]` dla:

  ```css
  @layer components {
    [data-recipe='x'] {
      transition: top var(--ts-motion-duration-fast) var(--ts-motion-ease-out), left var(--ts-motion-duration-fast) var(--ts-motion-ease-out);
      z-index: calc(1 + 1 + 1);
      width: calc(var(--ts-size-height) * (1 + 1 + 1));
      opacity: calc(1 / (1 + 1));
    }
    body { background: var(--ts-color-tint); }
  }
  ```

- wpływ: `top`/`left`/`right`/`bottom` są na liście, bo służą `transform-origin` i pozycji, więc `transition: top …` przechodzi (Q2, Z4: ruch poza kompozytorem). Dowolna liczba powstaje z sumy jedynek (warunek końcowy planu: „liczby `0`, `1`, `-1`, `100%`”). Przepis może stylować dowolny element globalnie (`body`, `button`), a nie tylko swój `[data-recipe]`. U25 wymaga białej listy bez furtek; S4 zakłada, że strażnik łapie celowy przemyt.

- minimalna reakcja: słowa ruchu (`transform`, `translate`, `scale`, `rotate`, `opacity`) dozwolone tylko w `transition`/`transition-property`/`will-change`, a słowa pozycji tylko w `transform-origin`/`position`/offsetach, nie w `transition*`; zakaz sumy i iloczynu samych literałów w `calc` (literał tylko jako mnożnik wyjścia silnika albo `100%`); selektor przepisu musi zawierać `[data-recipe=` (wyjątek nazwany dla `:has(> [data-recipe=…])` i `[data-side]:has(…)`). Do każdego przypadku fixture `bad/`.

#### P3. TSX komponentów bez strażnika, wbrew spec

- miejsce: `docs/specification.md:118` („`no-data-theme`, tryb komponentów i laboratorium wracają przepisane w E2”); `eslint.config.js:17-26` (wtyczka tylko dla `apps/docs/**`); `src/eslint/index.ts:31-36` (4 reguły, bez trybu komponentów i bez `no-data-theme`); plan E2 tego punktu nie przenosi ani nie odkłada.
- dowód: `packages/tessera/src/components/**` nie jest objęte żadną regułą wyglądu; `checkLayers` czyta tylko `*.css`. Komponent może dziś dodać `style={{ borderRadius: 8, color: 'red' }}` i przejdzie `check`.
- wpływ: I1/F7 egzekwowane tylko w połowie (CSS). Dziś komponenty są czyste (jedyna klasa to `ts-toggle-group`), ale reguła stoi na pamięci autora, wbrew zasadzie U25.
- minimalna reakcja: reguły `no-local-appearance` i `no-literal-colors` w trybie komponentu dla `packages/tessera/src/components/**` (zero `style`, zero klas poza `ts-*`) albo jawna decyzja w spec i planie, że tryb komponentów i `no-data-theme` przechodzą do E3, z powodem.

#### P4. Aplikacja zmienia wysokość i padding kontrolki przez `className`/`style`

- miejsce: `src/components/button/button.tsx:23-27` (i analogicznie Input, Menu, Dialog: `...props` z `className`/`style` trafia na element przepisu); `src/eslint/layout.ts:8-19` (`APP_LAYOUT` z `width`, `height`, `padding`, `margin`, `translate`); `styles/tessera.css:1` (utility Tailwinda w warstwie `utilities` wygrywają z `components`).
- dowód: `<Button className="h-12 px-10" />` i `<Button style={{ height: 40 }} />` przechodzą `tessera/no-local-appearance` (klasy i właściwości układu), a utility nadpisują `height` i `padding-inline` z `recipes/control.css:14,17`.
- wpływ: łamie I3 („konsument nie zmienia wyglądu inaczej niż przez wybory motywu i warianty”), W1 (jedna skala) i W4 (padding optyczny). To właśnie scenariusz „jeden przycisk inny niż reszta”, przed którym Tessera ma chronić.
- minimalna reakcja (decyzja prowadzącego): komponenty nie przyjmują `className`/`style` (układ przez element opakowujący), albo reguła konsumenta dla elementów z `@mattymroz/tessera` dopuszcza tylko klasy rozmieszczenia elementu w rodzicu (`grow`, `shrink`, `self-*`, `order-*`, `col-*`, `row-*`), bez `w`/`h`/`p`/`m`.

#### P5. Dialog z blur 24 px animuje `scale` i `opacity` przy wejściu (Q14)

- miejsce: `src/engines/depth.css:42-46` (`blur(24px)`), `src/recipes/surface.css:81-88` (`backdrop-filter` na `modal`), `:102-123` (przejście `opacity` + `scale` dialogu, W16).
- dowód: przy `data-material="translucent"` popup dialogu ma `backdrop-filter: blur(24px)` i jednocześnie skaluje się przez 250 ms. Q14: „na elementach ruchomych ≤ 10 px”. D16 cytuje ten limit, a mimo to daje dialogowi 24 px.
- wpływ: sprzeczność D16 z Q14; rozmycie liczone na nowo w każdej klatce wejścia, czyli dokładnie koszt, który Q14 ma wykluczyć (priorytet nr 1: wydajność).
- minimalna reakcja: na czas wejścia blur ≤ 10 px albo bez blur (np. `--ts-depth-backdrop` w `[data-starting-style]`), albo wejście bez `scale`; jeśli 24 px zostaje, to decyzja właściciela z wpisem w spec (Q14 lub D16).

### Mniejsze

#### M1. Wejścia `mode`/`accent`/`neutral` na poddrzewie działają połowicznie (D14)

- miejsce: `src/engines/color.css` (reguły złożone `[data-mode="dark"][data-neutral=…]`, `[data-mode="dark"][data-accent=…]`, brak reguły `[data-mode="light"]`); `depth.css:2-4,17-18,67-71`, `state.css:2-3,38-41`, `focus.css:8-9,26-29` deklarują `[data-mode]`, `[data-accent]`, `[data-neutral]` jak wejścia poddrzewa; `depth.css:2-15` przy `[data-mode]` na poddrzewie przywraca tło `solid` mimo `translucent` z korzenia; `size.css` nie ma `[data-profile]` w selektorach, choć czyta `type`.
- dowód: `data-neutral="k1"` na elemencie wewnątrz ciemnego `<html>` nie zmienia koloru (reguła wymaga obu atrybutów na jednym elemencie); `data-mode="light"` w ciemnym korzeniu daje `--ts-state-ink: #000` przy ciemnych kolorach.
- wpływ: dziś brak skutku (motyw zapisuje te osie tylko na `<html>`, a laboratorium nie ustawia ich na poddrzewie), ale kontrakt jest niespójny i zachęca do użycia, które da złe kolory.
- minimalna reakcja: zapisać w spec, że `mode`, `accent`, `neutral`, `profile`, `material` (poza `solid` na popupach) są osiami korzenia, i usunąć zbędne selektory poddrzewa; albo dodać pełną obsługę poddrzewa w generatorze.

#### M2. Duplikacja wiedzy w `shape.css` i przepisach (I2)

- miejsce: wzmocnienie squircle `0.6` w `shape.css:57` i `:118`; minimum `4px` w `:120, :126, :132, :138`; promień kontrolki `min(var(--ts-shape-control), var(--ts-shape-inner))` + `corner-shape: var(--ts-shape-control-corner)` w `recipes/control.css:19-20`, `row.css:11-12`, `indicator.css:54-55`.
- wpływ: zmiana współczynnika squircle albo minimum wymaga edycji w kilku miejscach; trzy przepisy powtarzają regułę koncentryczności, którą F2 przypisuje silnikowi `shape`.
- minimalna reakcja: `--_ts-shape-squircle-gain` i `--_ts-shape-min` raz; silnik publikuje jedno wyjście promienia kontrolki (`min` liczony w selektorach `:root, [data-size], [data-surface], [data-corners], [data-curve]`, zgodnie z D14), przepisy je czytają.

#### M3. Flaga „akcent ≠ contrast” liczona dwa razy

- miejsce: `state.css:29-36` (`--_ts-state-accent`) i `focus.css:17-24` (`--_ts-focus-accent`); ta sama wiedza jest w generatorze (`scripts/colors.ts:292-298`, `CONTRAST_ROLES`).
- wpływ: trzecie miejsce przy nowym akcencie „bez koloru” (np. drugi tryb kontrastu) łatwo pominąć.
- minimalna reakcja: jedno wyjście w silniku `color` (generator zna `contrast`), czytane przez `state` i `focus`.

#### M4. Listy osi i wartości domyślne w kilku miejscach

- miejsce: `src/lib/theme.ts:1-16` (akcenty i czernie) wobec `scripts/palette.ts:11,15-45`; `theme.ts:27-39` (`neutral: 'k2'`) wobec `palette.ts:47` (`DEFAULT_NEUTRAL`); domyślne `:root` w `shape.css:11`, `space.css:2-3`, `size.css:2-3`, `motion.css:2-3`, `depth.css:32-33,54-55` wobec `DEFAULT_CHOICES`; `lib/indicator.ts:56` (`MOTION_MODES`) jako trzecia kopia trybów.
- dowód: `test/guards/contracts.test.ts:81-92` sprawdza tylko kierunek motyw → CSS; nowy akcent w palecie albo inna wartość domyślna `:root` niż w `DEFAULT_CHOICES` przechodzą.
- minimalna reakcja: jedna lista (np. `theme.ts` importowany przez `palette.ts`, albo odwrotnie przez wspólny moduł w `src/`) i test, że wartość `:root` każdego silnika = `THEME_CONFIG.defaults`.

#### M5. Kolory poza silnikiem `color` i powtórzony blok tła

- miejsce: `depth.css:21` (`rgb(20 20 23 / …)` = `label` `#141417` z palety), `depth.css:22-29` (`oklch(0% 0 0 / …)`), `state.css:4,13` (`#000000`, `#ffffff` = `SCRIM_INK`, `WHITE` z `palette.ts:60-62`); `depth.css:37-40` powtarza wartości z `:8-9`.
- wpływ: I2 i W6 („każdy kolor ma nazwę”); dwa zapisy czerni cienia w jednym pliku.
- minimalna reakcja: atrament i barwa cienia jako role silnika `color`; `[data-material='solid']` dopisane do selektora pierwszego bloku zamiast osobnej kopii.

#### M6. Neon `full` daje inną poświatę na kontrolce niż `mini`

- miejsce: `depth.css:59-65` (6 px wobec 10 px).
- dowód: W11: „full (mini + orby w tle)”; v2 `styles/settings.css:187-196` ma w obu trybach ten sam `--control-glow`, a `full` różni się tylko orbami.
- minimalna reakcja: jedna wartość poświaty dla `mini` i `full`; różnica `full` przyjdzie z orbami (E3).

#### M7. Wyjścia i wejścia bez odbiorcy

- miejsce: `--ts-size-hit` (`size.css:43-51`, F3, nieużyte w żadnym przepisie, więc obszar trafienia na dotyku nie rośnie); `--ts-state-tint-rest/hover/press/border` (`state.css:22-25`, drabinka akcentu W8 i „albo akcent” z D11 nie trafia do żadnego przepisu); `--ts-motion-ease-spring`, `--ts-motion-duration-emphasized` (`motion.css:8,13`); wejście `--ts-in-shape-radius` (`shape.css:3`) bez osi i bez zapisu w motywie.
- wpływ: F3 i W8 zadeklarowane, ale bez skutku w komponentach; reszta to API na zapas (YAGNI), liczone do B8.
- minimalna reakcja: `--ts-size-hit` w `control`/`row` (np. pseudo-element obszaru trafienia), drabinka akcentu w wariancie, który jej potrzebuje, albo usunięcie do pierwszego odbiorcy; decyzja prowadzącego.

#### M8. Rozjazdy kod ↔ plan do domknięcia w fazie 8

- `depth`: wyjście `backdrop` zamiast `blur` z tabeli planu (`e2-foundation.md:235`); `shape`: 9 wyjść (dodatkowe `control-corner`) wobec 8; `state`: dodatkowe `indicator-active-color`.
- D13: plan mówi `R₁ = REF + spread × inset`, kod (`shape.css:113-119`) liczy `spread × gap` bez obrysu, tak jak v2 (`lib/shape.ts:100-102`); różnica 0,5–1 px.
- Sliding w planie (`e2-foundation.md:284`): „`will-change: transform` tylko na czas ruchu”, wbrew D8 i kodowi (`indicator.css:17` stale); `lib/indicator.ts:469` ustawia to samo jeszcze raz z JS.
- minimalna reakcja: poprawić plan i spec do kodu (albo kod do D13), usunąć zapis `willChange` z JS.

#### M9. Strażnik `tessera.css` nie pilnuje kolejności ani kompletności warstw

- miejsce: `css-layers.ts:244-251`.
- dowód: sonda z `@layer utilities, components, base, theme, extra;` przeszła; plik przepisu bez `@import` w `tessera.css` nie jest wykrywany.
- wpływ: I4 trzyma się tylko tego, że plik napisano dobrze; brakujący import da komponent bez stylu.
- minimalna reakcja: dokładna lista `@layer theme, base, components, utilities` i test, że `tessera.css` importuje każdy plik `engines/`, `recipes/`, `components/**/*.css`.

#### M10. CSS komponentu może użyć tokenu rozmiaru i kształtu oraz prywatnej zmiennej przepisu

- miejsce: `css-layers.ts:46-49, 175`, `src/eslint/layout.ts:1-6`.
- dowód: sonda z `flex-basis: var(--ts-size-height)`, `grid-template-columns: var(--ts-shape-surface) 1fr`, `gap: var(--_side-start)` przeszła.
- wpływ: F7 („nie zawiera rozmiaru… promienia”) obejściem przez właściwość układu.
- minimalna reakcja: komponent czyta tylko `--ts-space-*` i `--ts-size-gap`; bez `--_*`.

### Sugestie

- S1. `:has()` w gorących selektorach: `control.css:77-88` (trzy na każdą kontrolkę), `indicator.css:2-4` (podmiot uniwersalny), `surface.css:2-8`. Komponent zna swoje dzieci (Button wie, czy ma `icon`/`iconEnd`), więc atrybut (`data-icon="start|end|only"`) jest prostszy i tańszy przy 500 kontrolkach (priorytet nr 1).
- S2. `data-recipe="surface"` i `data-surface` muszą wystąpić razem; bez `data-surface` padding i promień są po cichu nieważne (`--ts-shape-inset` istnieje tylko na `[data-surface]`). Jeden atrybut albo test komponentów.
- S3. `lib/indicator.ts:64-67` (`ELASTIC_PEAK`, `FIRM_*`) to parametry trybów ruchu poza silnikiem; D7 przypisuje „parametry sprężyny i elastic” silnikowi, tabela wyjść planu ich nie ma. Do rozstrzygnięcia z recenzentem zachowania.
- S4. `--ts-depth-layer-overlay` = `--ts-depth-layer-modal` = 1040: dwa wyjścia, jedna wartość, kolejność zależy od DOM. Wystarczy jedno albo jawna różnica.
- S5. Dla P2, M9 i M10 dopisać fixture `bad/` (przypadki z sond powyżej).

## Zgodność z kontraktem

| Wymaganie                                                                | Stan                                                                     | Dowód                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| U7/F1 9 silników, plik na silnik                                         | pass                                                                     | `contracts.test.ts:19-21`, `ls src/engines`                                                  |
| U8 graf bez cykli, odczyt tylko w górę                                   | pass                                                                     | `css-layers.ts:214-218`; ręczny odczyt: size←type, shape←size/space, depth/state/focus←color |
| U9/D5 `--ts-<silnik>-<rola>`, `--ts-in-*`, `--_ts-*`                     | pass                                                                     | strażnik `owns`; 124 publiczne nazwy, wszystkie z prefiksem                                  |
| U10 pięć przepisów, `field` w `control`                                  | pass                                                                     | `recipes/*.css`, `control.css:105-110`                                                       |
| U11 brak publicznych tokenów komponentu                                  | pass (CSS) / fail (TSX)                                                  | P3, P4                                                                                       |
| U14 komponenty bez klas Tailwinda                                        | pass                                                                     | jedyna klasa `ts-toggle-group`                                                               |
| U15 `tessera.css` + `tailwind.css`                                       | pass                                                                     | `styles/*.css`; most tylko `--ts-space-*`                                                    |
| U16 tsdown ESM, `exports` bez `.`, `sideEffects` CSS                     | pass                                                                     | `package.json`, `tsdown.config.ts` (`flatten: false`)                                        |
| U25 strażnik jako biała lista bez furtek                                 | fail                                                                     | P2, M9, M10                                                                                  |
| U32/D4 kolor z generatora, test zgodności                                | pass                                                                     | `contracts.test.ts:61-79` (240 kombinacji)                                                   |
| W1 skala 16/20/24/28/36, font 10–15, ikona 10–18                         | pass                                                                     | `size.css`                                                                                   |
| W2 gęstość tylko kontenery                                               | pass                                                                     | `space-*` tylko w `surface`, separatorze, odstępie popupu                                    |
| W3 kapsuła, squircle × 1,6 ≤ 45 %, łuk zapasowy                          | pass                                                                     | `shape.css:51-59, 68-85`                                                                     |
| W4 padding optyczny                                                      | pass                                                                     | `shape.css:60-65` = v2 `_internal/control.css:23-28`                                         |
| W8 drabinka atramentu, wyłączenie 40 %                                   | pass                                                                     | `state.css`                                                                                  |
| W8 drabinka akcentu 8/16/24 + 25 % w przepisach                          | fail (brak odbiorcy)                                                     | M7                                                                                           |
| W11 neon mini/full                                                       | częściowo                                                                | M6                                                                                           |
| W14/D12 krycie pigułki 10/12, active 16 / 10–16                          | pass                                                                     | `state.css:8,17,42-49`                                                                       |
| W16 brak animacji wejścia popupów poza dialogiem                         | pass                                                                     | `surface.css` (przejście tylko w `dialog` i `backdrop`)                                      |
| W18 nagłówek grupy wielkimi szarymi                                      | pass                                                                     | `row.css:55-62`                                                                              |
| W20/D6 tryby `spring/elastic/firm/off`                                   | fail                                                                     | P1                                                                                           |
| F2/D13 koncentryczność sposobem B, 4 poziomy, `inner` 9999 px na `:root` | pass (drobny rozjazd z tekstem)                                          | `shape.css:93-140`, M8                                                                       |
| F3 rozmiar: wysokość, odstęp, ikona, tekst, obszar trafienia             | częściowo                                                                | `--ts-size-hit` bez odbiorcy, M7                                                             |
| F4 poziomy głębi, z-index tylko overlay/modal/tooltip                    | pass                                                                     | `depth.css`, `surface.css`                                                                   |
| F6/D7 15 wyjść ruchu, jedno źródło                                       | pass (CSS) / do decyzji (stałe w JS)                                     | `motion.css`, S3                                                                             |
| F7/I1 CSS komponentu tylko układ                                         | pass dla `toggle-group.css`; furtka                                      | M10                                                                                          |
| F8 jeden przepis focus                                                   | pass                                                                     | `recipes/focus.css`                                                                          |
| D11 nakładka `::after` z `opacity`, 100 ms                               | pass                                                                     | `control.css:32-43`                                                                          |
| D14 wyjścia zależne od poddrzewa w selektorach wejść                     | pass dla `size`, `surface`, `corners`, `curve`; częściowo dla osi koloru | M1                                                                                           |
| D15 `@supports (corner-shape: superellipse(2))`                          | pass                                                                     | `shape.css:68`                                                                               |
| D16 materiał tylko Popover/Dialog, ≤ 2 blur                              | pass co do liczby; konflikt z Q14                                        | P5                                                                                           |
| Q2/Z4 ruch tylko transform/opacity                                       | pass w kodzie; strażnik nie egzekwuje                                    | P2                                                                                           |
| Q14 blur ≤ 10 px na ruchomych                                            | fail                                                                     | P5                                                                                           |
| Q16 wersja zapasowa funkcji jednego silnika                              | pass                                                                     | `corner-shape` w `@supports`, łuk poza nim                                                   |
| I2 jedno źródło reguły                                                   | fail (drobne)                                                            | M2–M5                                                                                        |
| I3 konsument zmienia wygląd tylko motywem i wariantem                    | fail                                                                     | P4                                                                                           |
| I4 kolejność `@layer` w jednym wejściu                                   | pass w kodzie; nieegzekwowane                                            | M9                                                                                           |
| B8 ≤ 250                                                                 | pass                                                                     | 124 (`grep` po `src/engines`, `src/recipes`)                                                 |
| Z3 zero legacy, AGENTS: zero komentarzy                                  | pass                                                                     | `grep` po `/*`, `//`, `legacy`, `--primary`, `--ink-`, `tessera-appearance`: brak            |

## Regresje i integracja

- Przepisy z silnikami: nazwy czytane w przepisach istnieją w silnikach (89 unikalnych `var(--ts-*)` w przepisach i `/foundation`; strażnik odrzuca odczyt spoza wyjść).
- Kaskada na `<html>`: kolejność reguł w `motion`, `state`, `focus`, `depth`, `shape` daje poprawne wartości, gdy wszystkie atrybuty stoją na korzeniu (sprawdzone ręcznie: specyficzność 0,1,0 i kolejność źródła).
- Portal: popup jako głębokość 1 działa, bo `body` i korzeń laboratorium nie mają `data-surface` (D13).
- Utility Tailwinda nad przepisami (warstwa `utilities` > `components`): zob. P4.

## Wykonane kontrole

```text
bunx vitest run packages/tessera/test/guards
Test Files 2 passed (2), Tests 239 passed (239), 193 ms

bun <scratchpad>/probe/run.ts <scratchpad>/probe   (checkLayers na spreparowanym src/)
recipes/x.css: transition top/left, calc(1 + 1 + 1), body { background }  -> []
components/x/x.css: flex-basis var(--ts-size-height), grid-template-columns var(--ts-shape-surface) 1fr, gap var(--_side-start) -> []
styles/tessera.css: @layer utilities, components, base, theme, extra; -> []

grep komentarzy i nazw legacy w src/engines, src/recipes, src/styles, src/components, scripts, src/eslint, test -> brak
liczenie publicznych zmiennych w src: 124 (color 34, depth 20, type 19, motion 15, state 12, shape 9, size 6, space 4, focus 4, in 1)
porównanie z v2: lib/shape.ts:63-71, 100-102; _internal/control.css:15-29; styles/settings.css:181-196
```

## Niewykonane lub nierozstrzygające kontrole

- `bun run check`, build, Playwright: zakazane w briefie (maszyna współdzielona). `test/package/budget.test.ts` niewykonany (wymaga `dist`); B8 policzone na `src`.
- Wartości obliczone (promienie, padding) nie były mierzone w przeglądarce; zgodność z W3/W4 oparta na odczycie formuł i porównaniu z v2.
- Wygląd (kolory, cienie, poświata, squircle przy koncentryczności): tylko ocena właściciela.

## Wymagana ocena człowieka

```text
Uruchom: bun run dev -> http://localhost:3000/screens/overlays
Zrób: w panelu ruch = off; kliknij przycisk, otwórz dialog; potem materiał = translucent i otwórz dialog z popoverem
Oczekiwany wynik: przy off brak uginania i zoomu (po P1); dialog bez szarpnięcia przy wejściu z blur (P5)
Zwróć uwagę na: czy neon full ma wyglądać tak samo jak mini na kontrolce (M6)
```

## Ograniczenia review

- Recenzja na stanie niezacommitowanym, bez diffu git; „zmiana względem 378bcee” odtworzona z plików, nie z historii.
- `lib/*`, komponenty i laboratorium czytane tylko na styku z silnikami; ocena zachowania należy do recenzentów 2 i 3.

## Zalecany następny krok

1. P1 i P5 (silnik `motion`, `depth`/`surface`) z testem w `lab.spec.ts`.
2. P2, M9, M10: zawężenie białej listy per właściwość i fixture `bad/` z sond.
3. P3 i P4: decyzja prowadzącego (tryb komponentów ESLint w E2 czy wpis do spec; `className`/`style` w komponentach).
4. M1–M8 w jednej rundzie porządkowej silników; rozjazdy planu w fazie 8.
