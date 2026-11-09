---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, HEAD 378bcee + niezacommitowany working tree; build laboratorium apps/docs/out z 2026-11-01 04:19
date: 2026-11-01
---

# Review: E2 część 2, laboratorium, testy i dokumenty (R3)

## Zakres

- przedmiot: `apps/docs/app/**`, `apps/docs/tests/**`, `apps/docs/playwright.config.ts`, `.github/workflows/ci.yml`, korzeniowy `package.json`, `.pre-commit-config.yaml`; dokumenty `docs/specification.md`, `docs/structure.md`, `AGENTS.md`, `docs/plans/masterplan.md`, `docs/plans/e2-foundation.md` (część 2), `docs/decisions/*.md`.
- baseline: plan części 2 (D29–D47, „Strategia dowodu”, tabela skrajności fazy 11, decyzje prowadzącego zapisane w planie i w `decisions/e2-layers.md`).
- authority: plan część 2, `docs/specification.md`, `AGENTS.md`.
- ryzyka: testy, które nie mogą zawieść przy złej implementacji; ślepota B7; responsywność 320–1920 px; komentarze i legacy; rozjazd dokumentów z kodem; CI ≠ lokalny `check`; budżet procesów.
- poza review: silniki, przepisy, strażnicy i `lib/` (R1, R2) poza tym, co trzeba było przeczytać, żeby ocenić siłę testu.

## Werdykt

**Status:** FAIL (0 krytycznych, 4 poważne).

**Najważniejszy powód:** warunek końcowy części 2 „każda decyzja ma test, który zawodzi przy złej implementacji” nie jest spełniony dla D33, D36, D37 i części D46: sondy pokazały, że te asercje przechodzą także po usunięciu mechanizmu, który mają chronić. Kod laboratorium, B7 i CI są poza tym w dobrym stanie.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. D36: asercje „pole i tor mają obrys” w `forced-colors` przechodzą bez reguły D36

- miejsce: `apps/docs/tests/edges.spec.ts:477-479` (tor), `:488-491` (pole).
- dowód (sonda, Chromium, `forcedColors: 'active'`, `/screens/edges`): po usunięciu z arkuszy wszystkich 4 bloków `@media (forced-colors: active)` pole „Read-only field” ma dalej `1px rgb(0, 0, 0)`, tor „Group 1” `1px rgb(0, 0, 0)`, a nawet przycisk `ghost` „First still” `1px rgb(0, 0, 0)`. Przyczyna: `control` ma zawsze `border: var(--ts-shape-stroke) solid transparent` (`packages/tessera/src/recipes/control.css:27`), a Chromium w tym trybie wymusza kolor ramki niezależnie od reguły autora. Asercje pigułki i tekstu wybranej opcji rozróżniają (bez D36: pigułka = tor = `rgb(255, 255, 255)`, wybrana = niewybrana).
- wpływ: test D36 dla pola i toru nie może zawieść; zarazem reguła `ButtonText` dla pola i toru (`control.css:217-218`) wygląda w Chromium na zbędną.
- minimalna reakcja: decyzja R1/prowadzącego: albo usunąć regułę pola i toru z bloku `forced-colors` (przeglądarka już daje obrys; test zostaje jako kontrakt zachowania), albo wskazać przypadek, w którym reguła zmienia wynik (np. WebView2 z prawdziwym motywem), i tam ją testować. W obu wariantach poprawić opis W9/Q19 w spec, jeśli reguła zniknie.

#### P2. D37: „read-only nie reaguje na hover” jest sprawdzane przed startem przejścia

- miejsce: `apps/docs/tests/lab.spec.ts:717-719`.
- dowód (sonda, Chromium): dla pola „E-mail field”, które reaguje na hover, odczyt `::after` od razu po `hover()` daje `0.04` = spoczynek, a dopiero po 400 ms `0.07`. Nakładka ma `transition: opacity var(--ts-motion-duration-fast)` (`control.css:52`). Test pola zwykłego używa `expect.poll`, a test pola tylko do odczytu czyta raz, natychmiast.
- wpływ: asercja `toBe(rest)` przechodzi także wtedy, gdy `[readonly]` przestanie wyłączać drabinkę hover.
- minimalna reakcja: odczyt pola tylko do odczytu po czasie przejścia (np. po `expect.poll` na polu zwykłym w tym samym stanie albo z `motion: off`, gdzie przejście ma 0 ms).

#### P3. D33: test kontenera nie wykrywa zepsutego `data-container`

- miejsce: `apps/docs/tests/edges.spec.ts:250-253`, `:320-327`; karta `apps/docs/app/screens/edges/page.tsx:350-358`.
- dowód (sonda, okno 320 px): po zdjęciu `data-container` z karty stopka dalej ma `flex-direction: column`, bo pyta wtedy kontener strony (`surface` `page`, `surface.css:103-104`). Przy 320 i 960 px szerokość karty i strony leżą po tej samej stronie progu 400 px, więc obie asercje nie rozróżniają „karta reaguje na własną szerokość” od „stopka reaguje na okno”.
- wpływ: rdzeń D33 („karta z `data-container` reaguje na własną szerokość”, F17) bez testu, który może zawieść.
- minimalna reakcja: karta z `data-container` w wąskim kontenerze (np. `w-80`) przy szerokim oknie: stopka w kolumnie, a ta sama karta bez `data-container` obok w wierszu.

#### P4. D46 i G23: linia 1 px przy DPR 0,5 dla obrysu kontrolki nie może zawieść, a gałąź kontrastu nie ma testu

- miejsce: `apps/docs/tests/edges.spec.ts:304-309` i `:150-161` (`linePixels`); `docs/specification.md:280`; plan D46 („obrys 1 px (separator, tor w kontraście) widoczny przy DPR 0,5”) i „Deferred” G23 („D46 sprawdza tylko istniejącą gałąź (obrys 2 px)”).
- dowód (sonda, 2560 × 1600 przy DPR 0,5): wycinek 5 × 4 px na lewej krawędzi przycisku „A” różni się między „widoczny” i „ukryty” także po ustawieniu `border-color: transparent` (wynik `true` w obu przypadkach), bo ukrycie całego przycisku zabiera też tło nakładki `::after` i piksele wnętrza. Separator menu jest sprawdzony poprawnie (ukrywany element to sama linia). Kontekst `contrast: 'more'` uruchamia tylko `sectionOverflow` (`edges.spec.ts:203-213`); żaden test nie czyta `--ts-shape-stroke: 2px` z `engines/shape.css:95-97` ani toru w kontraście przy DPR 0,5.
- wpływ: spec (G23) i plan twierdzą, że D46 sprawdza gałąź kontrastu; nie sprawdza. Zanik obrysu 1 px kontrolki przy DPR 0,5 nie zostanie wykryty.
- minimalna reakcja: w `linePixels` dla kontrolki ukrywać tylko ramkę (np. `border-color: transparent` zamiast `visibility`); dodać w kontekście `contrast` asercję grubości obrysu (2 px) i linię toru przy DPR 0,5 z kontrastem.

### Mniejsze

#### M1. `lab.spec.ts:560`: `})` w tej samej linii co asercja

- dowód: `expect(menu.count).toBeLessThanOrEqual(LONG_LIVED_LAYERS)  })`. Składnia poprawna, ale repo nie ma formatera (brak Prettier, dprint, Biome; ESLint bez reguł stylu), więc nic tego nie łapie.
- minimalna reakcja: przenieść `})` do osobnej linii.

#### M2. Próbki `/foundation` sprawdzają arytmetykę strony, nie silnik

- miejsce: `apps/docs/tests/lab.spec.ts:229-233` (pasek 0,4) z `apps/docs/app/foundation/page.tsx:102-107`; `lab.spec.ts:218-224` (przesunięcie kciuka) z `page.tsx:326`.
- dowód: pasek pisze `--ts-i-value` i liczy `width: calc(var(--ts-i-value) * 100%)` na tym samym elemencie, więc wynik jest ten sam bez `@property` i bez `inherits: false`. Przesunięcie kciuka to wzór wpisany w stronie (`translate: calc(track-inline - track-block)`), który test powtarza.
- wpływ: brak dowodu działania rejestru w przeglądarce (rejestr pilnuje tylko `contracts.test.ts` na źródle) i tautologia w teście geometrii.
- minimalna reakcja: pasek: klucz zapisany na rodzicu i odczyt na dziecku daje wartość początkową (dowód `inherits: false`), albo `CSS.registerProperty`/`getComputedStyle` zwraca typ `<number>`; kciuk: usunąć asercję przesunięcia albo liczyć ją z wyjść silnika bez wzoru strony.

#### M3. D38 przy myszy bez ToggleGroup

- miejsce: `apps/docs/tests/edges.spec.ts:373-383`; plan faza 13 („pasek kontrolek … i ToggleGroup, każdy w xs i w md”).
- minimalna reakcja: dla grupy „Hit range xs/md” punkt 1 px poza torem zwraca `null`, punkt wewnątrz segmentu zwraca segment.

#### M4. Zoom bez sprawdzenia poziomego przewijania

- miejsce: `apps/docs/tests/edges.spec.ts:279-299`; plan D46 („przy zoomie test sprawdza … brak poziomego przewijania strony”).
- minimalna reakcja: w tym samym kontekście zoomu asercja `scrollWidth <= clientWidth` (jeden `evaluate`).

#### M5. Klawiatura bez czekania na hydratację

- miejsce: `apps/docs/tests/toggle-group.spec.ts:112-116`, `:120-122` (`page.goto(EDGES)`, potem `focus` i klawisz).
- wpływ: wyścig z hydratacją daje fałszywe niepowodzenie (nie fałszywy sukces); `edges.spec.ts` ma na to `open()` z `hydrated()`.
- minimalna reakcja: `await hydrated(page)` po `goto`.

#### M6. Czas typeahead skopiowany w teście

- miejsce: `apps/docs/tests/toggle-group.spec.ts:19` (`TYPEAHEAD_PAUSE = 600`) wobec `packages/tessera/src/lib/collection.ts:1` (`TYPEAHEAD_RESET = 500`).
- minimalna reakcja: import `TYPEAHEAD_RESET` z `@mattymroz/tessera/lib/collection` (lab.spec importuje już `lib/theme` i `lib/tone`).

#### M7. Propsy `tone` komponentów bez testu; tytuł testu `Heading` szerszy niż asercje

- dowód: testy tonu (`lab.spec.ts:633-687`) działają na surowych próbkach przepisu z `/foundation`; żaden test nie sprawdza, że `Button tone` i `MenuItem tone="danger"` (`/screens/overlays`, „Delete project”) dają `data-tone`. `text.spec.ts:41` „renders a heading of each level” sprawdza tylko poziomy 2 i 3.
- minimalna reakcja: jedna asercja atrybutu `data-tone` na „Delete project” i na przycisku z sekcji Button; tytuł testu zawęzić albo dodać poziomy 1 i 4.

#### M8. Dokumenty: znaczniki faz, lista skipów WebKit, mapa testów

- `docs/structure.md:9` mówi, że pozycje z dopiskiem „(faza N)” jeszcze nie istnieją, a dopiski zostały przy istniejących plikach (`:37-38`, `:56`, `:89`, `:91-93`).
- `docs/structure.md:146-151` („pomija dwa rodzaje asercji”): WebKit pomija też testy trace CDP (`lab.spec.ts:435`, `menu.spec.ts:258`) i podświetlenie hover (`menu.spec.ts:146`).
- `AGENTS.md`, „Mapa kodu”: testy to „`lab.spec.ts` … i po jednym `<komponent>.spec.ts`; narzędzia (rejestrator animacji, trace)”, bez `edges.spec.ts`, kontekstów D46 i licznika warstw w `helpers.ts`; `lab.spec.ts` mierzy też B7 na `/screens/edges`.
- minimalna reakcja: zdjąć dopiski faz z istniejących pozycji drzewa, dopisać brakujące skipy, uzupełnić mapę testów w `AGENTS.md` (faza 16 i tak dotyka pułapek).

#### M9. `vitest` bez limitu procesów w `check` i pre-push

- miejsce: `package.json:20` (`bunx vitest run`), `.pre-commit-config.yaml` hook `vitest` (`entry: bunx vitest run`); brak `maxWorkers` w `vitest.config.ts` i `packages/tessera/vitest.config.ts`.
- wpływ: plan każe bramkom `--maxWorkers=6`, a globalna reguła właściciela zabrania testów równoległych bez jawnej liczby procesów; `check` i pre-push biorą domyślną liczbę zależną od rdzeni.
- minimalna reakcja: `maxWorkers` w korzeniowym `vitest.config.ts` (jedno miejsce dla `check`, pre-push i CI).

### Sugestie

- S1. Test „bez poziomego przewijania” dla wszystkich pięciu stron laboratorium, nie tylko `/screens/edges`: sonda pokazała 0 px nadmiaru na `/`, `/foundation`, `/components`, `/screens/overlays`, `/screens/edges` przy 320, 768, 1280 i 1920 px, ale tylko ostatnia strona ma na to test.
- S2. `edges.spec.ts:208`: `sectionOverflow` w kontekście `forced colors` to test układu; WebKit zmienia wynik zapytania, więc bloki `forced-colors` działają tam na układ. Skip nie jest potrzebny.
- S3. `helpers.ts:143-147` (`frameOf`): pozycja tylko z `transform[12..13]`; sonda potwierdziła, że Chromium daje `offsetX/offsetY = 0`, więc dziś jest dobrze. Dodanie `offsetX/offsetY` kosztuje dwa znaki i uniezależnia klasyfikację „over pill” od tej konwencji.

## Zgodność z kontraktem

- D29: pass; `text.spec.ts` (trim ± 1 px z kontrolą bez trimu, `data-numeric` z i bez, `h2`, warianty).
- D30: pass na próbkach przepisu (`lab.spec.ts:633-687`); propsy komponentów bez testu (M7).
- D31 / B7: pass; definicja B7 nie oślepiła testu na regresję pigułki: warstwa pigułki rysuje, więc stałe `will-change` wraca jako część `pill` i oblewa `lab.spec.ts:539`; test ruchu wymaga `pill > 0` (`:551`, `:559`), więc licznik nie jest ślepy; „brak `Overlap` w spoczynku” (`:583`) pokrywa treść nad pigułką. Warstwy `Overlap`, które nie rysują, wypadają z liczenia zgodnie z decyzją prowadzącego (pamięć GPU). 5 powtórzeń testów B7: stabilne.
- D32: pass (`lab.spec.ts:375-396`).
- D33: fail (P3).
- D34: pass (`lab.spec.ts:261-269`, `:732-742`).
- D35: pass z zastrzeżeniem (zob. „Niewykonane”: symetria rynien).
- D36: częściowo fail (P1); pigułka, tekst, `GrayText`, fokus, pigułka hover rozróżniają.
- D37: częściowo fail (P2); `aria-pressed`, `aria-selected`, `aria-current`, `aria-checked`, `aria-invalid`, `:user-invalid` pass.
- D38: pass dla dotyku i paska; mysz bez ToggleGroup (M3).
- D39: wcięcie 3/7/8/12 pass; pasek 0,4 tautologiczny (M2).
- D40: pass (klik, klawisz, sterowane `open`, `defaultOpen`, podmenu, `TooltipBar`, `motion: off`, B4).
- D41: pass (typeahead, ikony przez `aria-label`, RTL).
- D42: pass; sondy wstawiane na początek `body`, więc równy `z-index` przegrywa z DOM i test rozróżnia kolejność.
- D43: poza zakresem (strażnicy, R1).
- D44: pass (`field-sizing`).
- D46: częściowo fail (P4, M4); 320 px, 320–1920 px, pigułka przy zoomie, separator przy DPR 0,5, dotyk, reduced motion, tryby pass.
- `test.fixme`, `.only`: brak w repo; `forbidOnly: true`; każdy `test.skip` ma powód.
- zero komentarzy w `apps/docs/**` (TS, TSX, CSS, MJS): pass (grep); komentarz w `next.config.ts` usunięty. YAML (`ci.yml`, `.pre-commit-config.yaml`) dostał nowe komentarze w stylu zastanym; reguła `AGENTS.md` wymienia TS, TSX, CSS, skrypty, testy, fixture, nie YAML.
- zero legacy: grep wzorców „Forbidden” faz 12–14a w zakresie planu pusty; `will-change` w `src/` tylko na listach właściwości ESLint, nie w pigułce.
- CI = lokalny `check`: pass; CI instaluje Chromium i WebKit, potem `bun run check` (te same pięć kroków co pre-push), potem `prek`.
- Playwright 1 worker, headless, `fullyParallel: false`: pass.
- responsywność 320–1920 px: pass (sonda na pięciu stronach), test tylko dla `/screens/edges` (S1).

## Regresje i integracja

- Testy części 1 (lab, button, menu, toggle-group, tooltip) mają pełne asercje; części 1 nie da się porównać diffem, bo `apps/docs/tests/` jest w całości nieśledzony w HEAD `378bcee`.
- `decisions/e2-layers.md` zgadza się z kodem: odsyłacze `lab.spec.ts:526-561`, `:563-597`, `:732`, `helpers.ts:139`, `:168`, `:200` trafiają w opisane miejsca; metoda „over pill” (przesunięcie z `transform`) potwierdzona sondą.

## Wykonane kontrole

```text
odczyt: plan część 2 (648–1366), AGENTS.md, structure.md, e2-layers.md, spec (grep pozycji części 2), masterplan (grep), wszystkie pliki apps/docs/tests i apps/docs/app/screens/edges, panel, layout, foundation (fragmenty), ci.yml, .pre-commit-config.yaml, package.json, playwright.config.ts
grep wzorców „Forbidden” (12, 13, 14a) w zakresie planu: 0 trafień; grep komentarzy w apps/docs: 0; grep fixme/only: 0

sonda 1 (node + playwright-core 1.64.1, Chromium headless, serwer out/ na 4393):
  forced-colors bez 4 bloków @media: pole 1px rgb(0,0,0), tor 1px rgb(0,0,0), ghost 1px rgb(0,0,0); pigułka = tor, wybrana = niewybrana
  hover E-mail field: spoczynek 0.04, od razu 0.04, po 400 ms 0.07
  DPR 0,5, obrys przycisku „A”: różnica pikseli z ramką true, bez ramki true
  okno 320 px, karta bez data-container: stopka column (przed: column)
  LayerTree przy przejeździe: offsetX/offsetY = 0, pozycja w transform[12..13]
sonda 2: scrollWidth = clientWidth na 5 stronach × 320/768/1280/1920 px
sonda 3: LAB_PORT=4393 bunx playwright test tests/lab.spec.ts --project=chromium --grep "DPR" --repeat-each=5 --workers=1
  20 passed (16.4s)
```

## Niewykonane lub nierozstrzygające kontrole

- Symetria rynien D35 (`edges.spec.ts:344-345`, `:365-366`): Playwright uruchamia headless Chromium z ukrytymi paskami przewijania (`--hide-scrollbars`, ASSUMED, niesprawdzone sondą z braku limitu), a wtedy rynna ma 0 px i test przechodzi także bez `both-edges`. Do sprawdzenia: `offsetWidth - clientWidth` przewijanego menu w obu silnikach; przy 0 test symetrii trzeba oprzeć na klasycznym pasku (np. `::-webkit-scrollbar` w sondzie testu albo WebKit, jeśli tam pasek ma szerokość).
- `menu.spec.ts:238-246` (`width="trigger"`): nie sprawdzono, czy menu bez reguły `--anchor-width` byłoby węższe od triggera panelu; jeśli nie, asercja `≥` nie rozróżnia.
- Pomiar czasu `check` z fazy 14a (próg +50 % względem części 1) nie jest zapisany w `docs/`; mógł trafić do raportu fazy.
- Pełne bramki i WebKit: nie uruchamiane (zakaz zlecenia); sondy tylko w Chromium. Build `out/` z 04:19 przyjęty jako aktualny.

## Wymagana ocena człowieka

Bez zmian względem planu (faza 15): progi kontenera, rynny i `forced-colors` w prawdziwym motywie kontrastowym Windows (WebView2) ocenia właściciel; P1 przesądza, czy reguła pola i toru w tym trybie w ogóle jest potrzebna.

## Ograniczenia review

- Ocena siły testów przez usunięcie mechanizmu w działającej stronie (CSSOM, atrybuty), nie przez mutację źródeł i przebudowę.
- Silniki, przepisy i strażnicy czytane tylko tam, gdzie od nich zależała ocena testu.

## Zalecany następny krok

- P1–P4 poprawić w testach (P1 także decyzja o regule `forced-colors` pola i toru), potem runda kontrolna tego zakresu; M1–M9 w tym samym diffie, bo są lokalne.
