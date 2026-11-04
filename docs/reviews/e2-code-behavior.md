---
kind: review
status: fail
reviewed-state: feat/e2-foundation, drzewo robocze worktree .worktrees/e2 (zmiany niezacommitowane względem 378bcee), dist z 2026-10-31 16:38
date: 2026-10-31
---

# Review: E2 zachowanie, sliding, przelot okienek, komponenty

## Zakres

- przedmiot: `packages/tessera/src/lib/{indicator,popup-flight,press,input-modality,theme,use-theme}.ts`, `lib/theme-script.tsx` i ich testy; `src/components/**`; `src/themes/mangashift.ts`; `test/guards/contracts.test.ts`.
- baseline: `378bcee`; stan oceniany = pliki w worktree; `dist` zbudowany po ostatniej edycji źródeł (16:38 vs 16:25).
- authority: `docs/specification.md` (W14, W16, W20, F6–F9, F15, Q2–Q10, B3–B5, B7, U13, U18), `docs/plans/e2-foundation.md` (D6–D10, D12, D16–D18, D20, D26, „Sliding”, „Kaskada motywu”), `docs/decisions/e2-base-ui.md`, `docs/research/e2-facts-motion.md` §5, `AGENTS.md`.
- ryzyka: ruch poza kompozytorem, łamanie F15, wycieki obserwatorów i animacji, kaskada motywu i FOUC, wygląd w komponentach, re-rendery (Q8, Q9, B3, B4), React Compiler (Q13).
- poza review: silniki i przepisy poza tym, co wpływa na ruch (recenzent 1), laboratorium, paczka i dokumenty (recenzent 3), testy Playwright (nieuruchamiane).

## Werdykt

**Status:** FAIL (bramka fazy 7 wymaga zera uwag poważnych).

**Najważniejszy powód:** React Compiler po cichu pomija `useIndicator`, `MenuItem`, `Tooltip` i `TooltipBar` w `dist` (Q13), a nic tego nie wykrywa. Do tego `ToggleGroup` łamie Q9 z założenia, a śledzenie wejścia (`input-modality`) nie jest nigdzie włączone, choć dokumentacja na nim polega.

Rdzeń mechaniki jest dobry: jazda i zgniecenie na osobnych elementach, rozmiar w jednej klatce, czasy z silnika, klatki z `offset` bez `linear()`, zawrócenie z prędkością, `firm` z `clamp`, przycięcie przy ścianie, cztery punkty kontraktu przelotu, sprzątanie przy odmontowaniu.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. React Compiler pomija cztery funkcje w `dist`, bez strażnika (Q13)

- miejsce: `src/lib/indicator.ts:606-607` (`useIndicator`, domyślne wartości w destrukturyzacji `hover = false`, `focus = false`, `active = null`, `under = null`), `src/components/menu/menu.tsx:109` (`MenuItem`, `variant = 'default'`), `src/components/tooltip/tooltip.tsx:56` (`Tooltip`, `side = 'top'`), `:68` (`TooltipBar`, `side = 'top'`).
- dowód (DIRECT): kompilator z loggerem (Babel `@babel/core` 8.0.10 z paczki + `babel-plugin-react-compiler` 1.0.0, `target: '19'`) zgłasza dla każdej z nich `CompileError: (BuildHIR::lowerAssignment) Expected object property value to be an LVal, got: AssignmentPattern`. W `dist`: `lib/indicator.js` nie importuje `react/compiler-runtime` (0 trafień), `components/menu/menu.js:232` i `components/tooltip/tooltip.js:59, 71` to funkcje bez `c(...)`. Pliki bez domyślnych wartości w parametrach (`button.tsx` używa `variant ?? 'ghost'`, `popup-flight.ts`, `use-theme.ts`, dialog, popover, input, toggle-group) kompilują się w całości.
- wpływ: Q13 („paczka jest kompilowana React Compilerem”) nie jest prawdą dla hooka slidingu i trzech komponentów; testy na `dist` sprawdzają skompilowaną wersję tylko tam, gdzie kompilator zadziałał. `test/package/use-client.test.ts` sprawdza kompilację tylko na fixture, więc każdy następny komponent z domyślną wartością w parametrze też przejdzie po cichu.
- minimalna reakcja: (1) w tych czterech funkcjach zastąpić domyślne wartości w destrukturyzacji wzorcem z `button.tsx` (`?? wartość` po destrukturyzacji) albo naprawić łańcuch narzędzi (wersja kompilatora zgodna z Babel 8); (2) strażnik: `panicThreshold: 'all_errors'` w `tsdown.config.ts` albo test na `dist`, że każdy eksportowany komponent i hook ma `c(` z `react/compiler-runtime`.
- route: IMPLEMENTATION BUG + EVIDENCE GAP (brak strażnika).

#### P2. `ToggleGroup`: zmiana zaznaczenia re-renderuje wszystkie elementy grupy (Q9)

- miejsce: `src/components/toggle-group/toggle-group.tsx:74` (`<SelectionContext value={{ current, setActive }}>`), `:80` (`use(SelectionContext)` w każdym `ToggleGroupItem`); Base UI `radio/root/RadioRoot.mjs:50-79` (`useRadioGroupContext()` → `checkedValue`).
- dowód (DIRECT, kod): wartość własnego kontekstu zmienia się z `current` (także po kompilacji, bo `current` jest zależnością), więc każdy `ToggleGroupItem` renderuje się przy każdej zmianie wyboru. Niezależnie od tego każdy `Radio.Root` Base UI czyta `checkedValue` z kontekstu grupy, więc też renderuje się przy każdej zmianie. `decisions/e2-base-ui.md` §7 porównuje węzły DOM, semantykę, klawiaturę i rozmiar, ale nie Q9.
- wpływ: twarda reguła wydajności Q9 złamana z założenia, i to w dwóch miejscach: własnym (do naprawy lokalnie) i u dostawcy (do decyzji). Przy grupach 20 elementów (scena „stress”) każdy klik = 20 renderów elementów.
- minimalna reakcja: własna część: element aktywny wyznaczać bez kontekstu zależnego od `current` (np. ref każdego elementu przekazuje węzeł, a `ToggleGroup` wybiera aktywny po `data-checked`/`aria-checked` w efekcie, albo stabilny store z subskrypcją per element). Część Base UI: dopisać Q9 do kryteriów N7 w `e2-base-ui.md` i rozstrzygnąć (zaakceptowany wyjątek z powodem albo własny kod segmentu).
- route: DESIGN FLAW (decyzja prowadzącego/właściciela dla części Base UI) + IMPLEMENTATION BUG (kontekst).

#### P3. Śledzenie modalności wejścia nie jest nigdzie włączone

- miejsce: `src/lib/input-modality.ts:33` (`trackInputModality`), `src/recipes/focus.css:10` (`:root:not([data-input='pointer'])`), `packages/tessera/docs/button.md:25` („Focus ring only for keyboard input (`data-input` on `<html>`)”).
- dowód (DIRECT, grep): `trackInputModality` ma wywołanie tylko w `input-modality.test.ts`; ani komponenty, ani `apps/docs/app/**` go nie wywołują. Bez niego `data-input` nigdy nie powstaje, więc warunek w `focus.css` jest zawsze prawdziwy.
- wpływ: „wygaszanie fokusu przy wskaźniku” (plan, tabela Reuse, wiersz „Fokus”) nie działa ani w laboratorium, ani u konsumenta; klik w `Input` pokazuje obwódkę, bo pola tekstowe mają natywne `:focus-visible` także po kliknięciu. Dokumentacja opisuje zachowanie, którego nie ma, a testy jednostkowe dają fałszywą pewność (moduł zielony, ale niepodłączony). Checkpoint 2 oceni inny fokus niż zamierzony.
- minimalna reakcja: jedno miejsce instalacji, które konsument dostaje bez pamiętania o nim (np. w skrypcie `ThemeScript` albo w jednym efekcie modułu klienta, który ładuje każda aplikacja), plus test na `/screens/overlays`: klik myszą w pole nie daje `outline`, Tab daje.
- route: INTEGRATION BUG.

### Mniejsze

#### M1. Ściany pigułki nie uwzględniają przewinięcia kontenera (utajone)

- miejsce: `src/lib/indicator.ts:435-440` (`wallsOf`: `clientHeight − padding`, bez `scrollTop`) wobec `:431` (`measureIn` przelicza cel na współrzędne treści, `− scrollTop`).
- dowód (DIRECT, kod): pozycje pigułki są we współrzędnych przewijanej treści, a ściany we współrzędnych okna kontenera. Po przewinięciu `boundsOf` (`:365`) bierze `end = max(walls.end, to + extent)`, czyli koniec celu, więc każdy przestrzał w dół jest przycinany na krawędzi celu i daje zgniecenie w środku listy (tryb `elastic`), a prawdziwa ściana dolna jest ignorowana.
- wpływ: w E2 żaden kontener ze wskaźnikiem nie przewija się (menu nie ma `overflow`), więc dziś nie do zobaczenia; wyjdzie przy liście, drzewie i select w E3.
- minimalna reakcja: w `wallsOf` dodać przesunięcie przewinięcia (`start = scrollTop + paddingTop`, `end = scrollTop + clientHeight − paddingBottom`, analogicznie w osi x) i przypadek testowy „przewinięty kontener”.

#### M2. Przelot leci przy każdym przestawieniu tego samego Positionera, nie tylko przy zmianie triggera

- miejsce: `src/lib/popup-flight.ts:127-137` (gałąź `same`), test `popup-flight.test.ts:221-235` koduje to zachowanie.
- dowód (DIRECT, kod): każda zmiana `style.transform` Positionera (także `autoUpdate` Base UI przy przewijaniu zagnieżdżonego kontenera, zmianie rozmiaru okna albo zmianie rozmiaru treści podmenu) startuje 150 ms przelot. Stary kit leciał tylko przy przybyciu (`arrive` po `onPlaced`), v2 miał osobne `settle()` dla zmiany w spoczynku (`e2-facts-motion.md` §3).
- wpływ: otwarty tooltip albo podmenu w przewijanym dialogu (`surface.css:111-113`: dialog ma `overflow: auto`) goni swój trigger z opóźnieniem zamiast trzymać się go. Punkt 3 kontraktu w `e2-base-ui.md` („albo gdy ten sam Positioner się przesunął”) nie odróżnia przejścia na inny trigger od przestawienia.
- minimalna reakcja: w gałęzi `same` lecieć tylko wtedy, gdy zmienił się trigger (np. `data-popup-open` na innym elemencie albo `payload` przy `createHandle`); w pozostałych przypadkach anulować bieżący lot i zostawić popup na miejscu. Doprecyzować punkt 3 w decyzji.

#### M3. Każdy przycisk trzyma na stałe trzy nasłuchy na `window`

- miejsce: `src/lib/press.ts:44-47`, wywołanie w `src/components/button/button.tsx:19-21` (każdy `Button`) i `src/lib/indicator.ts:581` (każdy wskaźnik).
- dowód (DIRECT, kod): `pointerup`, `pointercancel` i `blur` na `window` są dodawane przy montażu i zdejmowane dopiero przy odmontowaniu.
- wpływ: scena „stress” (500 kontrolek) = 1500 nasłuchów na `window`; każde `pointerup` w aplikacji woła 500 funkcji. Koszt pojedynczo mały, ale to priorytet nr 1 i rośnie liniowo z liczbą kontrolek (T2, T5).
- minimalna reakcja: dodawać nasłuchy `window` w `press` i zdejmować w `release`/`lift`.

#### M4. Stabilność refów zależy od kompilatora

- miejsce: `src/components/button/button.tsx:28` (`composeRefs(ref, pressable)`), `src/components/toggle-group/toggle-group.tsx:57` (`composeRefs(activeTrack, hoverTrack)`); dla porównania `menu.tsx:68, 176, 188` używają `useMemo`.
- dowód (DIRECT, kod + `dist`): w wersji nieskompilowanej (vitest na `src`, każdy konsument przez warunek `source` w TypeScripcie) każdy render daje nowy callback refa, więc React woła cleanup (`lift()` w `press.ts:53` zdejmuje `data-pressing`, nasłuchy idą od nowa) i instaluje `trackPress` jeszcze raz. Re-render w trakcie wciśnięcia (np. `MenuTrigger` otwiera menu na `pointerdown`) kasuje wciśnięcie przed minimalnym czasem trzymania. W `dist` oba miejsca są memoizowane, bo te funkcje kompilator objął.
- wpływ: zachowanie różni się między wersją skompilowaną i nieskompilowaną (Q13 wymaga obu); po P1 widać, że pominięcie przez kompilator zdarza się po cichu.
- minimalna reakcja: `useMemo` jak w `menu.tsx`, jeden wzorzec w paczce.

#### M5. Czas zachowania w komponencie i dziurawy strażnik literałów czasu

- miejsce: `src/components/menu/menu.tsx:25` (`SUBMENU_SWITCH_GRACE = 150`); `test/guards/contracts.test.ts:94-105`.
- dowód (DIRECT): 150 to ta sama liczba co `--ts-motion-duration-slide`, ale wpisana w komponencie (I1: komponent nie definiuje czasu). Wyrażenie `TIME_LITERAL` łapie tylko liczbę wpisaną w `animate(…)`, `setTimeout(…)` lub obiekt opcji, więc nazwana stała (`const HOLD = 100` + `setTimeout(lift, HOLD)`) przechodzi; test „names the sampling step … as the one time constant” sprawdza tylko istnienie `SAMPLE_STEP`, nie to, że jest jedyny. `GROUP_TIMEOUT = 400` w `tooltip.tsx:7` jest w porządku: jedno źródło dla `Provider.timeout` i okna przelotu.
- wpływ: drugie źródło czasu poza silnikiem; strażnik D7 nie wykryje następnego.
- minimalna reakcja: okno łaski podmenu brać z `readMotion().slide` (albo nazwać jako wyjątek z powodem w decyzji); strażnik rozszerzyć o stałe liczbowe z nazwą czasu w `lib/` i `components/` z jawną białą listą (`SAMPLE_STEP`, `GROUP_TIMEOUT`).

#### M6. Tryb `system` śledzi zmianę systemu tylko przy zamontowanym `useTheme`

- miejsce: `src/lib/use-theme.ts:56-62`; `src/lib/theme.ts:92-101` (skrypt startowy rozstrzyga `system` raz).
- dowód (DIRECT, kod): nasłuch `prefers-color-scheme` istnieje wyłącznie w efekcie hooka.
- wpływ: aplikacja bez panelu (desktop, strona) zostaje w trybie z chwili startu, aż do przeładowania, mimo wyboru `system`.
- minimalna reakcja: nasłuch `matchMedia` w jednym miejscu ładowanym zawsze (to samo miejsce co P3) albo rozstrzyganie `system` w CSS silnika `color`.

#### M7. Opcja `ToggleGroup` z samą ikoną może nie mieć nazwy

- miejsce: `src/components/toggle-group/toggle-group.tsx:28-34`.
- dowód (DIRECT): `aria-label` jest opcjonalne zawsze; `ButtonProps` (`button.tsx:17`) wymusza je typem, gdy nie ma `children`.
- wpływ: przycisk `role="radio"` bez nazwy dostępnej (Q17); dokumentacja (`toggle-group.md:25`) tylko o tym mówi.
- minimalna reakcja: ta sama unia typów co w `ButtonProps`.

### Sugestie

- **S1.** `src/lib/indicator.ts:469` ustawia `ride.style.willChange = 'transform'`, a `recipes/indicator.css:17` już to deklaruje: dwa źródła, zostawić CSS. Plan przeczy sam sobie: D8 („stała warstwa przez cały czas życia”) wobec sekcji „Sliding” („`will-change: transform` tylko na czas ruchu”); kod idzie za D8, poprawić pseudokod w planie.
- **S2.** `src/components/tooltip/tooltip.tsx:30-31, 63`: `TooltipPopup` (z `usePopupFlight`, dwa `useState` i efekt) istnieje dla każdego zamkniętego tooltipa, bo stoi nad `Portal`. Przeniesienie hooka do dziecka wewnątrz `Positioner` obniży koszt montażu 200 tooltipów (§8 decyzji).
- **S3.** B5/Q11: `Button` z `icon`, etykietą i `iconEnd` ma 4 elementy, `ToggleGroupItem` z ikoną i etykietą 4 (`button`, ukryty `input`, 2 × `span`), każda pigułka 3 (`face` mogłoby być pseudo-elementem `squash` z własnym `scale`). Ustalić w E3, co liczy B5.
- **S4.** `src/lib/popup-flight.ts:79`: `width <= 0 && height <= 0` przepuszcza popup zwinięty w jednej osi; `||` jest bezpieczniejsze.
- **S5.** `src/lib/popup-flight.ts:93, 137` i moduł `tooltip.tsx:9`: `last` trzyma odłączony Positioner (z poddrzewem) do następnego tooltipa. Mały wyciek; wystarczy zapisywać tylko `transform`, `target` i tożsamość jako `WeakRef` albo czyścić po `grace`.
- **S6.** Zmiana motywu: każdy wskaźnik w swoim `update()` czyta (`getBoundingClientRect`) i zapisuje (`rest`) po kolei, więc N wskaźników = N wymuszonych układów. Przy rosnącej liczbie grup (T3) zebrać odczyty przed zapisami.

## Zgodność z kontraktem

| Wymaganie                                               | Wynik                    | Dowód                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q2: WAAPI tylko `transform`/`opacity`                   | pass                     | jedyne `animate()`: `indicator.ts:502, 505`, `popup-flight.ts:117`, wszystkie `transform`; CSS: `opacity` i `scale`                                                                                                                                                                                            |
| brak dwóch animacji tej samej właściwości na elemencie  | pass                     | `stop()` przed każdą nową (`indicator.ts:471-474, 492`, `popup-flight.ts:95-98, 133`); jazda `transform` na `ride`, zgniecenie `transform` na `squash`, wciśnięcie `scale` na `face`                                                                                                                           |
| Q3: rozmiar w jednej klatce                             | pass                     | `rest()` `indicator.ts:476-480`, poza animacją                                                                                                                                                                                                                                                                 |
| Q5: bez `linear()` i `playbackRate`                     | pass                     | grep: brak; klatki z `offset` i `easing: 'linear'`, `firm` = `cubic-bezier`                                                                                                                                                                                                                                    |
| D7: czasy z silnika, parser jednostek                   | pass z uwagą M5          | `parseMotion`/`milliseconds` (`ms`, `s`, forma zminifikowana), cache unieważniany zdarzeniem motywu i `prefers-reduced-motion`; test `indicator.test.ts:101-111`                                                                                                                                               |
| D9: zawrócenie z prędkością                             | pass (spring)            | `startFrom` + `resume`, `startTime = currentTime`; test `:405-432`; `firm`/`elastic` startują z widocznej pozycji bez prędkości, zgodnie z pseudokodem planu                                                                                                                                                   |
| D6: `firm` z `clamp`                                    | pass                     | `firmStretch` `:328-331`, test `:363-377` (także odległość 0 i 1 px)                                                                                                                                                                                                                                           |
| W14/W20: przycięcie i zgniecenie przy ścianie           | pass, M1 dla przewijania | `course`/`clampAt`; sonda zawrócenia sprężyny przy ścianie (28 przypadków): przekroczenie ściany 0 px                                                                                                                                                                                                          |
| F15 sticky przy separatorze i przerwie, etykieta czyści | pass                     | `stickyHover` + `data-indicator-clear` (`menu.tsx:143`); test `:175-182`                                                                                                                                                                                                                                       |
| hover nie pod active                                    | pass                     | `pickTarget(…, under)`, `ToggleGroup under: active`                                                                                                                                                                                                                                                            |
| reveal bez przelotu                                     | pass                     | `place` → `reveal` → `rest`, tylko `opacity`                                                                                                                                                                                                                                                                   |
| chowanie z pamięcią pozycji                             | pass                     | `hide` zostawia `state.box` i `transform`; powrót = `slide`                                                                                                                                                                                                                                                    |
| follow bez animacji                                     | pass                     | `follow` → `stop()` + `rest()`; ResizeObserver na celu i kontenerze, zdarzenie motywu                                                                                                                                                                                                                          |
| pusty cel chowa                                         | pass                     | `place` dla `width/height ≤ 0`                                                                                                                                                                                                                                                                                 |
| wciśnięcie tylko pigułki celu                           | pass                     | `pressesPill` + `trackPress({ accepts, marked: ride })`                                                                                                                                                                                                                                                        |
| sub-trigger trzyma pigułkę, natychmiastowe podmenu      | pass                     | `MenuSubmenu` `hold/release`, `delay={0}` wymuszone typem                                                                                                                                                                                                                                                      |
| przelot: 4 punkty `e2-base-ui.md` §4                    | pass, M2                 | 1: `transform === ''`; 2: `data-closed` → `release`; 3: `recent()` z `grace` = `Provider.timeout`, bez `data-instant`; 4: mutacje w jednym zadaniu scala MutationObserver, a druga mutacja w tej samej klatce startuje z tego samego punktu dzięki `drifted` (bez osobnego scalania w `requestAnimationFrame`) |
| brak animacji na Positionerze                           | pass                     | animacja tylko na `popup`                                                                                                                                                                                                                                                                                      |
| sprzątanie przy odmontowaniu                            | pass                     | `disconnect()` (`indicator.ts:592-602`), `watch` cleanup (`popup-flight.ts:147-150`), `trackPress` cleanup; jedyny trwały nasłuch to `readMotion` (raz na moduł); S5                                                                                                                                           |
| kaskada: kolejność, walidacja, wyjątki storage          | pass                     | `resolveChoices`, `readSaved` per wartość, wersja, `try/catch` także dla gettera `localStorage`; testy `theme.test.ts`                                                                                                                                                                                         |
| skrypt anty-FOUC bez zależności od modułu               | pass                     | serializowane funkcje dostają `config` jawnie; `dist/lib/theme.js` bez importów i `__name`; test uruchamia skrypt przez `new Function`                                                                                                                                                                         |
| Q8: bez kontekstu React dla motywu                      | pass                     | atrybuty `data-*` na `<html>`; kontekst tylko dla zachowania (menu, wybór)                                                                                                                                                                                                                                     |
| Q6: bez zapisu zmiennych CSS z JS                       | pass                     | JS pisze atrybuty, `color-scheme` na `<html>` przy zmianie motywu i `transform`/`width`/`height` pigułki                                                                                                                                                                                                       |
| Q9: zaznaczenie bez re-renderu grupy                    | **fail**                 | P2                                                                                                                                                                                                                                                                                                             |
| Q10: zamknięty popup bez DOM i nasłuchów                | pass (kod)               | Portal bez `keepMounted`; `usePopupFlight` bez węzłów nic nie obserwuje                                                                                                                                                                                                                                        |
| Q13: kompilacja React Compilerem                        | **fail**                 | P1                                                                                                                                                                                                                                                                                                             |
| F7/I1: komponenty bez wyglądu                           | pass z uwagą M5          | komponenty tylko ustawiają `data-recipe`, `data-variant`, `data-level`, `data-material`; `toggle-group.css` = `display` + `align-items`                                                                                                                                                                        |
| F8: jeden przepis fokusu                                | pass, P3                 | `data-focus` w Button, Input, ToggleGroupItem; `input-modality` niepodłączone                                                                                                                                                                                                                                  |
| W16: bez animacji wejścia popupu                        | pass                     | wejście tylko w Dialogu (`surface.css:115-121`)                                                                                                                                                                                                                                                                |
| D16: materiał                                           | pass                     | Menu i Tooltip `data-material="solid"`, Popover i Dialog dziedziczą                                                                                                                                                                                                                                            |
| `'use client'`                                          | pass                     | test paczki; `theme.ts`, `theme-script.tsx` bez dyrektywy                                                                                                                                                                                                                                                      |
| a11y (role, aria, klawiatura)                           | pass z M7                | role i klawiatura z Base UI; `Button` wymusza `aria-label` dla samej ikony                                                                                                                                                                                                                                     |
| `exactOptionalPropertyTypes`                            | pass                     | `bun run typecheck` (TS 7) w paczce: exit 0                                                                                                                                                                                                                                                                    |
| zero komentarzy, zero legacy                            | pass                     | grep: brak komentarzy, `legacy`, `compat`, `eslint-disable`, `ts-ignore`                                                                                                                                                                                                                                       |

## Testy: kontrakt czy implementacja

- `indicator.test.ts`: testuje kontrakt na czystych funkcjach (wybór celu, sticky, placement, pomiar, krzywe, zawrócenie, ściany). Luka: `connectIndicator`/`useIndicator` (podpięcie DOM, kolejność `stop`/`rest`/`fly`, sprzątanie) nie mają testu jednostkowego; pokrywają je tylko specyfikacje Playwright (`components-b.spec.ts`, `components-c.spec.ts`), których nie uruchamiałem. `vi.stubGlobal` w ciele `describe` działa już przy zbieraniu testów, więc obejmuje cały plik (dziś nieszkodliwe).
- `popup-flight.test.ts`: dobry kontrakt geometrii i czterech punktów; test `:221` utrwala zachowanie z M2.
- `press.test.ts`, `theme.test.ts`: kontrakt, dobre przypadki brzegowe (blokada storage, `<` w danych skryptu).
- `input-modality.test.ts`: zielony dla modułu, którego nic nie instaluje (P3).
- `contracts.test.ts`: dobre testy grafu silników, generatora koloru i reguł osi motywu; strażnik czasu z luką (M5); lista pomiaru DOM nie obejmuje `clientWidth`/`scrollTop` (dziś bez skutku, bo pomiar i tak jest tylko w dwóch plikach).
- Żaden test nie pilnuje, że kompilator objął każdy komponent i hook (P1).

## Regresje i integracja

- Base UI + przelot: animacja na `Popup`, anulowana przy `data-closed`, więc `useAnimationsFinished` nie przytrzymuje zamykanego popupu; pigułka w `Popup` nie blokuje odmontowania (Base UI sprawdza animacje bez poddrzewa).
- Pigułka menu w podmenu, które leci: kontener i cel mierzone razem z transformacją przelotu, różnica się znosi.
- Skrypt startowy i hook używają tych samych funkcji; konsument musi podać ten sam motyw w `ThemeScript` i `useTheme` (dwa wywołania, jedno źródło w `themes/mangashift.ts`).

## Wykonane kontrole

```text
bunx vitest run packages/tessera/src/lib packages/tessera/test/guards/contracts.test.ts
  7 plików, 350 testów passed, 189 ms

packages/tessera: bun run typecheck (TS 7)
  exit 0

Kompilator z loggerem (scratchpad e2-review/compile.mjs, Babel 8.0.10 + babel-plugin-react-compiler 1.0.0, target 19)
  indicator.ts: CompileError useIndicator (linia 606); menu.tsx: MenuItem (109); tooltip.tsx: Tooltip (56), TooltipBar (68)
  button, dialog, popover, input, toggle-group, popup-flight, use-theme: wszystkie funkcje skompilowane
dist (16:38, nowszy od źródeł): lib/indicator.js bez react/compiler-runtime; MenuItem, Tooltip, TooltipBar bez c(...)

Sonda zawrócenia (scratchpad e2-review/probe2.ts): spring 4→164 px, zawrócenie po 80–200 ms na 124/84/44 px, ściana 204 px
  największe przekroczenie ściany: 0 px

grep: linear(, playbackRate, komentarze, legacy/compat, eslint-disable, ts-ignore → brak
grep: trackInputModality → wywołanie tylko w teście
```

## Niewykonane lub nierozstrzygające kontrole

- Playwright (`lab.spec.ts`, `components-b.spec.ts`, `components-c.spec.ts`): zakaz w zleceniu; trace B1, B7, Q14, zachowania F15 w przeglądarce oraz anty-FOUC na `dist` mam tylko jako REPORTED.
- `bun run check`, build: zakaz w zleceniu; oceniałem istniejący `dist`.
- Pomiar B3/Q9 (commity na zmianę wyboru): wniosek P2 z kodu, nie z licznika.
- Zachowanie przy przewijaniu z otwartym popupem (M2) i w przewijanym kontenerze ze wskaźnikiem (M1): wniosek z kodu, bez sondy w przeglądarce.

## Wymagana ocena człowieka

```text
Uruchom: bun run dev → http://localhost:3000/screens/overlays
Zrób: kliknij myszą w pole, potem naciśnij Tab; otwórz dialog, przewiń jego treść z otwartym tooltipem lub podmenu
Oczekiwany wynik: po kliknięciu myszą bez obwódki, po Tab z obwódką; popup trzyma się triggera bez doganiania
Zwróć uwagę na: obwódkę pola po kliknięciu (P3), opóźnienie popupu przy przewijaniu (M2)
```

## Ograniczenia review

- Przeglądarka nie była uruchamiana; ocena ruchu i wyglądu należy do checkpointu 2.
- Przyczyna odrzucenia przez kompilator (domyślne wartości w destrukturyzacji pod Babel 8) ustalona loggerem na tej samej wersji narzędzi co build; nie sprawdzałem, czy wersja kompilatora zgodna z Babel 8 już istnieje.

## Zalecany następny krok

1. P1: usunąć domyślne wartości z parametrów czterech funkcji i dodać strażnika kompilacji.
2. P3: zainstalować `trackInputModality` w jednym miejscu ładowanym zawsze, razem z nasłuchem trybu `system` (M6).
3. P2: lokalnie usunąć zależność kontekstu od `current`; część Base UI (Q9) do decyzji prowadzącego, wpis w `e2-base-ui.md`.
4. M1–M5 w tej samej rundzie poprawek; S1–S6 według uznania.
