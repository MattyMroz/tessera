---
kind: decision
date: 2026-10-31
stage: E2 (faza 5)
---

# Base UI 1.9.0 w Tesserze: N7 i ToggleGroup

## Odpowiedź

- **Menu, Popover, Dialog, Tooltip: Base UI tak**, bez `Viewport`. Positioner stawia popup przez `transform: translate()` (inline), `Popup` nie ma własnego `transform`, więc przelot `lib/popup-flight.ts` (WAAPI `transform` na `Popup`) nie koliduje z pozycjonowaniem: 0 animacji na Positionerze, 0 animacji poza kompozytorem w trace Chromium.
- **Wymagania F15 dla menu daje Base UI**: natychmiastowe podmenu (`SubmenuTrigger delay={0}`: 3 ms zamiast 104 ms), checkbox nie zamyka, trójkąt do podmenu (`safePolygon`), pełna klawiatura. **Własny kod** zostaje dla pigułki przy separatorze: Base UI zdejmuje `data-highlighted` na separatorze, etykiecie grupy i poza popupem.
- **ToggleGroup: własny kod** (U18 bez zmian), zob. „Rewizja po recenzji”. Pasek narzędzi z `aria-pressed` to Base UI `ToggleGroup`/`Toggle`, ale dopiero razem z komponentem paska (poza E2).
- Zamknięty popup: 0 węzłów DOM i 0 listenerów pozycji (Q10, B5). 200 zamkniętych tooltipów montuje się w 7,4 ms, a z jednym `Root` i `createHandle` w 3,7 ms (Chromium, mediana z 5).

## Rewizja po recenzji

Recenzja kodu E2 (`reviews/e2-code-behavior.md`, P2) wykazała, że sekcja 7 nie porównała Q9: każdy `Radio.Root` czyta `checkedValue` z kontekstu `RadioGroup`, więc zmiana wyboru re-renderuje wszystkie elementy grupy (przy 20 elementach 20 renderów na klik). Tego nie da się naprawić po stronie Tessery, bo kontekst należy do Base UI. Decyzja prowadzącego: ToggleGroup wraca do własnego kodu (U18) i spełnia Q9 z założenia. Grupa to `<div role="radiogroup">`, a element to jeden `<button role="radio">` z `aria-checked` i roving tabindex (strzałki przenoszą fokus i wybór z zawijaniem, Home/End, Tab wchodzi na zaznaczony). Wybór trzyma mały sklep `lib/single-choice.ts`; każdy element subskrybuje go przez `useSyncExternalStore` z selektorem własnego stanu, więc zmiana wyboru re-renderuje tylko poprzednio i nowo zaznaczony element. Klik i klawiaturę obsługuje jeden nasłuch na grupie. Przy okazji znika ukryty `<input type="radio">` (B5: 1 węzeł na element, Q11). Koszt: własne testy klawiatury i sklepu (`single-choice.test.ts`) zamiast `CompositeRoot` Base UI.

## Zakres i metoda

- Base UI `@base-ui/react` 1.9.0 (z `packages/tessera`), Next 16.4.3 static export (build produkcyjny), Playwright 1.64.1 headless, Chromium i WebKit, 1 worker, okno 1280 × 900, DPR 1 (osobny test DPR 1,5).
- Tymczasowa strona `apps/docs/app/probe` i spec `apps/docs/tests/probe.spec.ts`, serwowane z kopii `out/` poza repo (inni agenci przebudowywali `out/` w trakcie). Pliki sondy usunięte po pomiarze; kopia kodu, surowe JSON-y i konfiguracja leżą w scratchpadzie sesji: `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\probe-base-ui\` (`src/`, `raw/<przeglądarka>-<test>.json`, `size/`).
- Pomiar czasu w stronie przez `performance.now()` (zdarzenie `pointerover` → atrybut `data-open` z `MutationObserver`), węzły przez `querySelectorAll('*')`, listenery przez opakowanie `EventTarget.prototype.addEventListener`, trace przez CDP `Tracing` (kategorie jak w sondzie E0: `blink.animations`, `devtools.timeline`).
- WebView2 nie był mierzony. Czasy WebKit (headless na Windows) mają duży rozrzut; rozstrzygają liczby z Chromium.

## 1. Pozycjonowanie (Menu, Popover, Tooltip bez `Viewport`)

**Fakty (DIRECT, Chromium i WebKit):**

- Positioner ma inline `position: absolute; top: 0px; left: 0px; transform: translate(Xpx, Ypx)` oraz zmienne `--available-width`, `--available-height`, `--anchor-width`, `--anchor-height`, `--transform-origin`. Przykład menu: `transform: translate(81px, 84px)`, obliczone `matrix(1, 0, 0, 1, 81, 84)`.
- Przed pierwszym obliczeniem pozycji Positioner ma `position: fixed; top: 0; left: 0` bez `transform` (`internals/useAnchorPositioning.mjs`, gałąź `!isPositioned`).
- `Popup` nie ma własnego `transform` (obliczone `none`, w obu silnikach).
- Przy DPR 1,5 Positioner dostaje inline `will-change: transform` (Chromium i WebKit), więc każdy otwarty popup jest wtedy stałą warstwą.
- Dialog: `Popup` bez Positionera, inline `--nested-dialogs: 0`; pozycję daje przepis (`position: fixed`).
- WebKit dopisał do Positionera Popovera `transition: none` (Chromium nie); nic tam nie animuje.

**Rekomendacja:** używać części `Portal` → `Positioner` → `Popup`, bez `Viewport` i bez animacji na Positionerze. Cały ruch popupu (wejście dialogu, przelot) idzie na `Popup` albo jego dziecko. Wygląd (tło, promień, cień, materiał) na `Popup`, nigdy na Positionerze.

## 2. Zagnieżdżenie i portale

**Fakty (DIRECT, oba silniki):**

| Przypadek                | Łańcuch rodziców popupu                                                   | `closest('[data-surface]')`   |
| ------------------------ | ------------------------------------------------------------------------- | ----------------------------- |
| Popover                  | `Positioner` < `div[data-base-ui-portal]` < `body`                        | sam popup (ma `data-surface`) |
| Popover → Menu           | `Positioner` < portal menu < **portal popovera** < `body`                 | `null`                        |
| Popover → Menu → podmenu | `Positioner` < portal podmenu < portal menu < portal popovera < `body`    | `null`                        |
| Dialog → Menu → podmenu  | `Positioner` < portal podmenu < portal menu < **portal dialogu** < `body` | `null`                        |

- Zagnieżdżony portal ląduje w węźle portalu rodzica, nigdy w jego `Popup`. Żaden zagnieżdżony popup nie jest potomkiem `[data-surface]` rodzica.
- Każdy otwarty popup to 3 węzły opakowania: `div[data-base-ui-portal]`, Positioner (`role="presentation"`), Popup.
- Popover → Menu: klik w pozycję podmenu zamyka menu, popover zostaje; pierwszy Escape zamyka tylko menu. Dialog → Menu: klik w pozycję zamyka menu, dialog zostaje.

**Wniosek dla sposobu B (D13):** popup w portalu ma zawsze głębokość 1, także 2–3 poziomy w głąb; `body` i korzeń laboratorium nie mogą mieć `data-surface`.

## 3. Menu: podmenu, checkbox, trójkąt, klawiatura

**Fakty (DIRECT):**

| Zachowanie                                                                 | Chromium                                                | WebKit             |
| -------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| Otwarcie podmenu od `pointerover` do `data-open`, `delay={0}` (5 prób)     | 2,7–4,6 ms                                              | 8–15 ms            |
| To samo, domyślne `delay` (100 ms)                                         | 104–114 ms                                              | 119–396 ms         |
| `CheckboxItem` po kliku                                                    | menu otwarte, `data-checked`                            | jak Chromium       |
| Ukośny ruch od `SubmenuTrigger` do 3. pozycji podmenu przez obszar rodzica | podmenu otwarte, podświetlona pozycja docelowa          | podmenu otwarte    |
| Zjazd w dół na pozycję rodzica                                             | podmenu się zamyka, podświetla się pozycja pod kursorem | podmenu się zamyka |

- Trójkąt to `safePolygon({ blockPointerEvents: true })` (`menu/submenu-trigger/MenuSubmenuTrigger.mjs:154`). Przy otwartym podmenu `Popup` rodzica i jego pozycje mają `pointer-events: none`, a Positioner rodzica `data-base-ui-inert`. Klik testowy w pozycję rodzica bez ruchu myszy wisi (Playwright: Positioner „intercepts pointer events”); po ruchu kursora podmenu się zamyka i klik przechodzi. Testy F15 w fazie 6 muszą najpierw ruszyć myszą.
- Podświetlenie myszą (Chromium): najazd na separator, etykietę grupy albo wyjście poza popup **zdejmuje** `data-highlighted` ze wszystkich pozycji. W WebKit headless podświetlenie myszą zostawało na poprzedniej pozycji; wynik niejednoznaczny.
- Klawiatura (oba silniki): ArrowDown na triggerze otwiera i podświetla pierwszą pozycję; ArrowDown/ArrowUp, Home/End, zawijanie (`loopFocus`, ArrowUp z pierwszej → ostatnia); ArrowRight lub Enter na `SubmenuTrigger` otwiera podmenu z fokusem na pierwszej pozycji; ArrowLeft i Escape zamykają tylko podmenu, fokus wraca na `SubmenuTrigger`; Escape w menu zamyka je i oddaje fokus triggerowi; Tab zamyka menu i przenosi fokus na następny element po triggerze. Klik w pozycję podmenu zamyka całe menu, fokus na trigger.
- `data-highlighted` dostaje też `CheckboxItemIndicator` (nie tylko wiersz).
- `Menu.Root` ma domyślnie `modal={true}`.

**Rekomendacja:** Base UI Menu z częściami z planu i `SubmenuTrigger delay={0}`; `CheckboxItem` bez zmian (`closeOnClick` domyślnie `false`). Pigułka czyta cel z `[role^="menuitem"][data-highlighted]` (bez wskaźnika checkboxa), a „zostaje na ostatnim wierszu przy separatorze” robi `lib/indicator.ts` (Base UI tego nie daje, tylko gasi podświetlenie).

## 4. Tooltip: grupa i przelot

**Fakty (DIRECT):**

- Pierwszy tooltip otwiera się po 613–666 ms (`Trigger.delay` 600). W `Tooltip.Provider` kolejny tooltip w grupie (osobne `Root`) otwiera się po 3–10 ms i ma `data-instant="delay"`.
- Wariant `createHandle` (jeden `Root`, wiele `Trigger`, treść z `payload`): przejście między sąsiednimi triggerami bez przerwy zostawia ten sam `Popup`, a Positioner zmienia tylko `transform` (np. `translate(296px, 232px)` → `translate(351px, 232px)`). Po przejściu przez szparę między triggerami popup się zamyka i otwiera od nowa (z `Provider` po 2,6 ms); taki nowy popup **nie ma** `data-instant`.
- Prototyp przelotu: `MutationObserver` na atrybucie `style` Positionera; przy zmianie: odczyt bieżącego przesunięcia animacji, `cancel()`, pomiar celu, WAAPI `transform: translate(dx, dy) → translate(0, 0)` na `Popup`, 150 ms. Wynik:
  - klatki (Chromium): popup jedzie płynnie, np. lewa krawędź 73 → 84 → 103 → 112 → 118 → 122 → 124 → 126 → 127 px w ~150 ms; w WebKit podobnie;
  - `getAnimations()` na `Popup`: jedna animacja, tylko `transform`; na Positionerze 0 animacji (oba silniki);
  - trace Chromium: 25 zdarzeń śledzenia `Animation` (początki, końce, zmiany stanu) dla wszystkich przelotów, żadne nie ma `compositeFailed`.
- Base UI przed odmontowaniem czeka na wszystkie skończone animacje samego `Popup` (`internals/useAnimationsFinished.mjs`, `getFiniteAnimations(element)` bez `subtree`). Przelot na zamykanym popupie przytrzymałby go na ekranie, więc prototyp anuluje animację przy `data-closed`; wtedy stary popup znika po jednej klatce.
- Każda zmiana triggera dała dwie mutacje `style` Positionera (dwa wpisy przelotu); druga zaczyna od bieżącego przesunięcia, więc ruch się nie urywa, ale to zbędna praca.
- Tooltip Base UI nie dodaje `role="tooltip"` ani `aria-describedby` na triggerze; nazwę daje `aria-label` triggera.

**Rekomendacja:** Base UI Tooltip + `Tooltip.Provider`, bez `Viewport`; przelot przez `lib/popup-flight.ts` na `Popup`. Kontrakt `popup-flight.ts` z pomiaru:

1. pomija Positioner jeszcze nieustawiony (inline bez `transform`);
2. przy `data-closed` anuluje własną animację;
3. pamięta ostatni cel z czasem i leci, gdy poprzedni popup grupy był widoczny ≤ `Provider.timeout` (400 ms) temu albo gdy ten sam Positioner przeszedł na inny trigger (wariant `createHandle`: tożsamość triggera z `payload`); przesunięcie Positionera przy tym samym triggerze (przewinięcie, zmiana rozmiaru, `autoUpdate`) nie startuje przelotu, a tylko przenosi trwający przelot do nowego celu (druga mutacja tej samej zmiany triggera); nie polega na `data-instant`, bo wariant `createHandle` go nie ustawia;
4. scala mutacje z jednej klatki.

Grupa na pasku narzędzi: jeden `Root` z `createHandle` w `Provider` (połowa kosztu montażu, ten sam element w locie, płynne zawrócenie).

## 5. Popover i Dialog

**Fakty (DIRECT):** Popover: `Popup` z `role="dialog"`, trigger `aria-haspopup="dialog"`, `data-popup-open`, `data-pressed`. Dialog: `Backdrop` z `role="presentation"`, `aria-hidden`, `data-base-ui-inert`; `Popup` z `role="dialog"`, `aria-labelledby`/`aria-describedby` z `Title`/`Description`. Wejście i wyjście znakują `data-starting-style` i `data-ending-style` (krótko, także bez animacji).

**Rekomendacja:** Base UI Popover i Dialog z częściami z planu; wejście dialogu (W16) jako przejście `opacity`/`scale` na `Popup` przez `[data-starting-style]`/`[data-ending-style]`.

## 6. Atrybuty stanu do przepisów

| Część                               | Atrybuty i role (zaobserwowane)                                                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Menu.Trigger`                      | `data-popup-open`, `data-pressed`, `data-disabled`; `aria-haspopup="menu"`, `aria-expanded`                                                                           |
| `*.Positioner`                      | `data-open`/`data-closed`, `data-side`, `data-align`, `data-anchor-hidden`, `data-instant`; `role="presentation"`; rodzic przy otwartym podmenu: `data-base-ui-inert` |
| `Menu.Popup`, `Popover.Popup`       | `data-open`/`data-closed`, `data-side`, `data-align`, `data-instant`, `data-starting-style`, `data-ending-style`; `role="menu"` / `role="dialog"`                     |
| `Menu.Item`                         | `role="menuitem"`, `data-highlighted`, `data-disabled`, roving `tabindex` 0/−1                                                                                        |
| `Menu.CheckboxItem` (+ `Indicator`) | `role="menuitemcheckbox"`, `aria-checked`, `data-checked`/`data-unchecked`, `data-highlighted` (także na wskaźniku)                                                   |
| `Menu.SubmenuTrigger`               | `role="menuitem"`, `aria-haspopup`, `aria-expanded`, `data-popup-open`, `data-highlighted`                                                                            |
| `Menu.GroupLabel`, `Menu.Separator` | etykieta: `aria-hidden="true"` + `id` dla `aria-labelledby` grupy; separator: `role="separator"`, `data-orientation`                                                  |
| `Tooltip.Trigger`                   | `data-popup-open`, `data-trigger-disabled`                                                                                                                            |
| `Tooltip.Popup`                     | `data-open`/`data-closed`, `data-side`, `data-align`, `data-instant` (`delay` w grupie), `data-starting-style`, `data-ending-style`                                   |
| `Dialog.Backdrop`, `Dialog.Popup`   | `data-open`/`data-closed`, `data-starting-style`, `data-ending-style`                                                                                                 |
| `Radio` (render `<button>`)         | `role="radio"`, `aria-checked`, `data-checked`/`data-unchecked`, `data-disabled`; zachowuje własne `data-recipe`, `data-variant`                                      |
| `Toggle` (render `<button>`)        | `aria-pressed`, `data-pressed`, `aria-disabled`; zachowuje własne atrybuty                                                                                            |

## 7. ToggleGroup

**Fakty (DIRECT, oba silniki; rozmiar: `bun build --minify`, `NODE_ENV=production`, React zewnętrzny, gzip -9):**

| Kryterium                                                    | Base UI `ToggleGroup` + `Toggle`                    | Base UI `RadioGroup` + `Radio`                                                                                                               | Własny kod            |
| ------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Węzły DOM na element (B5 ≤ 3)                                | 1 (`<button>`)                                      | 2 (`<button>` + ukryty `<input type="radio">` obok)                                                                                          | 1 (z założenia)       |
| Semantyka                                                    | grupa `role="group"`, element `aria-pressed`        | `role="radiogroup"`, element `role="radio"` + `aria-checked`                                                                                 | dowolna, do napisania |
| Strzałki                                                     | tylko fokus (zaznaczenie bez zmian)                 | fokus i zaznaczenie                                                                                                                          | do napisania          |
| Klik / Space na zaznaczonym                                  | zdejmuje wybór (wartość `[]`)                       | wybór zostaje                                                                                                                                | do napisania          |
| Tab do grupy                                                 | ostatnio fokusowany element (także gdy wybór pusty) | zaznaczony element (fokus i wybór idą razem)                                                                                                 | do napisania          |
| `render={<button data-recipe … />}`                          | działa, atrybuty zostają                            | działa z `nativeButton`, atrybuty zostają                                                                                                    | n/d                   |
| Wpływ na układ                                               | brak                                                | brak: `input` ma `position: fixed`, 1 × 1 px, `clip-path`; szerokość grupy i krawędzie przycisków identyczne jak w `ToggleGroup` (189,75 px) | brak                  |
| Przyrost obok Menu + Popover + Dialog + Tooltip (70,0 kB gz) | +2,6 kB gz                                          | +4,9 kB gz                                                                                                                                   | ≤ 3 kB (budżet B6)    |

- Ukryty `input` ma `aria-hidden="true"` i `tabindex="-1"`; w drzewie dostępności Playwright widać go jako `radio [aria-hidden]`.
- Wymagania: segment (pojedynczy wybór) = `radiogroup`, strzałki zaznaczają (v2 #32, `r2-behavior.md`); pasek narzędzi = `aria-pressed`, strzałki przenoszą fokus po pasku.

**Rekomendacja:** komponent ToggleGroup w E2 (panel: tryb jasny/ciemny, ekran „Nakładki”) na Base UI `RadioGroup` + `Radio` z `render={<button type="button" … />}` i `nativeButton`. Spełnia semantykę i zachowanie segmentu bez własnego roving focus i jego testów; `CompositeRoot` jest wspólny z Menu, więc przyrost to 4,9 kB gz. Koszt do zaakceptowania: drugi węzeł na element (B5 trzymany, Q11 nadwyrężony: `input` istnieje dla formularza, którego segment nie potrzebuje) i reguła dla przepisów: celować w `[role="radio"]`, nie w `> *`, `:first-child`, `:last-child`. `ToggleGroup` Base UI odpada dla segmentu (semantyka `aria-pressed`, strzałki bez wyboru, możliwy pusty wybór); wraca przy komponencie paska narzędzi z `aria-pressed`. Własny kod odpada, bo powiela `CompositeRoot` i wymaga testów klawiatury, a nic nie zyskuje poza jednym węzłem.

## 8. Koszt montażu: 200 zamkniętych popupów

**Fakty (DIRECT; czas od kliku do końca efektów układu, 5 prób, posortowane):**

| Wariant                                   | Chromium [ms]         | WebKit [ms] | Węzły ponad stronę (Chromium; WebKit +1) | Węzły popupów | Listenery natywne                                                   |
| ----------------------------------------- | --------------------- | ----------- | ---------------------------------------- | ------------- | ------------------------------------------------------------------- |
| 200 × `<button>`                          | 0,4–0,7 (mediana 0,4) | 1–58        | 201                                      | 0             | 0                                                                   |
| 200 × Tooltip (`Root` w `Provider`)       | 7,0–12,1 (7,4)        | 19–221      | 201                                      | 0             | 200 × (`mouseenter`, `mouseleave` na triggerze, `blur` na `window`) |
| 200 × Trigger + 1 `Root` (`createHandle`) | 3,4–4,2 (3,7)         | 6–78        | 201                                      | 0             | 400 × każdy z tych trzech                                           |
| 200 × Menu (`Root`, `Trigger`)            | 13,3–20,7 (19,1)      | 23–101      | 201                                      | 0             | 0                                                                   |

- Zamknięty popup: 0 węzłów (brak portalu, Positionera i `Popup`), 0 listenerów `scroll`/`resize` (Q10 spełnione; `autoUpdate` tylko przy zamontowanym popupie, `whileElementsMounted`).
- Czas „do bezczynności” (`setTimeout` z kliku) wynosi w Chromium 13–29 ms dla każdego wariantu, także gołych przycisków, więc mierzy pętlę zdarzeń, nie montaż.

## Wpływ na plan

- **D13:** potwierdzone pomiarem: popup w portalu ma głębokość 1 na każdym poziomie zagnieżdżenia.
- **D16:** bez zmian; `data-material` i wygląd na `Popup`.
- **D17:** Base UI dla Menu, Popover, Dialog, Tooltip potwierdzone; ToggleGroup = własny kod (U18 bez zmian, Q9), zob. „Rewizja po recenzji”.
- **D18:** `popup-flight.ts` wykonalny na `Popup`; kontrakt z czterech punktów w sekcji 4 trafia do testów fazy 5 (pkt 3). Źródłem zdarzenia jest `MutationObserver` na `style` Positionera, więc `popup-flight.ts` musi być na liście plików z odczytem DOM (Q7).
- **B7/Q4:** przy DPR ≥ 1,5 (Windows 150 %) każdy otwarty Positioner jest stałą warstwą (`will-change: transform` od Base UI); test B7 na `/screens/overlays` liczy je razem z pigułkami.
- **Testy F15 (faza 6):** przed klikiem w pozycję rodzica przy otwartym podmenu ruszyć myszą (trójkąt blokuje `pointer-events`); pigułka przy separatorze to test `lib/indicator.ts`, nie Base UI.

## Niewiadome

- WebView2: nie mierzony; Chromium z Playwright jest tym samym silnikiem, ale nie tym samym środowiskiem (N7 wymienia WebView2).
- Podświetlenie myszą w WebKit headless (zostawało na poprzedniej pozycji): nie rozstrzygnięte, czy to Base UI, czy symulacja myszy Playwright w WebKit.
- Skutki `Menu.Root modal={true}` dla strony pod menu (blokada przewijania, inert tła) nie były mierzone.
- Przelot podmenu (D18, drugi konsument) nie był prototypowany; mechanizm jest ten sam co dla tooltipa w wariancie z osobnymi `Root`.
