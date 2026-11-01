---
kind: research
id: e2-prior-art
created: 2026-10-31
baseline: tessera feat/e2-foundation (worktree .worktrees/e2), plan docs/plans/e2-foundation.md
---

# E2: gotowe biblioteki i wzorce dla części fundamentu

## Odpowiedź

Nikt nie zrobił całości tak, jak chce Tessera, a żadna nowa zależność nie skraca E2 bez złamania spec. Jedynym realnym skrótem jest **Base UI `RadioGroup`**, które już wchodzi do paczki z D10 i pokrywa dokładnie zachowanie planowanego ToggleGroup (radiogroup, `aria-checked`, roving focus, strzałki zaznaczają). Dziś jednak stoi w sprzeczności z literą U18, więc to decyzja właściciela. Reszta to wzorce do przepisania. Najcenniejsze są dwa: wzór sprężyny Motion (dokładnie ten sam, który napędza stronę, z jej progami spoczynku) i pomiar pozycji z `Tabs.Indicator` Base UI (korekta zaokrągleń `offsetLeft`). Po drodze wyszły dwa odkrycia, które mogą zmienić plan (sekcja „Sprzeczności”): sprężyna strony prawie nie ma przestrzału, a przelot okienek Base UI z `Viewport` jedzie po `top`/`left`.

## Tabela decyzji

| #   | Część E2                                  | Rekomendacja                                                                                                                    | Kandydat                                                                                                    | Powód                                                                                                                                                                                                                 | Koszt                                                                                   |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Palety i rampy kolorów w buildzie         | **odpada** (zależność); **wzorzec** = matematyka OKLCH już zapisana w makiecie v7                                               | `@radix-ui/colors` 3.0.0, `culori` 4.0.2, Leonardo 1.1.0, `colorjs.io` 0.7.1                                | v7 ma własne ~50 linii OKLCH, WCAG i APCA oraz stałe Radix 3.0.0 i Tailwind; biblioteka zmieniłaby wartości zaakceptowane przez właściciela (inny gamut mapping). Leonardo liczy kolory wzorem kontrastu, co łamie W6 | 0                                                                                       |
| 2   | Build tokenów                             | **odpada**                                                                                                                      | Style Dictionary 5.7.1, Terrazzo 2.10.0, Panda 2.4.0                                                        | źródło w DTCG JSON zamiast TS (U32), brak `@layer` i `@property`, a silniki to formuły CSS, nie lista wartości; jedyny generowany silnik (`color`) mieści się w jednym skrypcie                                       | 0                                                                                       |
| 3   | Squircle i wersja zapasowa                | **odpada** (biblioteki); **wzorzec** = `@supports (corner-shape: superellipse(2))` z D5                                         | `smooth-corners` (Houdini), `figma-squircle`, `@squircle-js/react`                                          | Paint API i `corner-shape` są tylko w Chromium; biblioteki SVG mierzą element w JS (Z5, Q7), przycinają obwódkę i focus                                                                                               | 0                                                                                       |
| 4   | Promień koncentryczny                     | **odpada**; sposób B z E0 zostaje jedyną drogą                                                                                  | słowo kluczowe CSS (#7707), `overflow-clip-margin`, `tailwindcss-padded-radius`                             | natywnego `concentric` nie ma; `overflow: clip` przycina focus, cienie i treść; plugin Tailwinda to utility wyglądu (U14)                                                                                             | 0                                                                                       |
| 5a  | Sliding: mechanizm pigułki                | **odpada** jako zależność; **wzorzec** = pomiar z Base UI `Tabs.Indicator`                                                      | Motion `layoutId`, Base UI `Tabs.Indicator`, Ark `SegmentGroup.Indicator`, `react-use-measure`              | `layoutId` liczy klatki w JS i skaluje rozmiar (Q2, Q3); wskaźniki Base UI i Ark śledzą tylko `active` i animują `width` (Z4)                                                                                         | 0                                                                                       |
| 5b  | Sprężyna jako klatki WAAPI                | **wzorzec**: przepisać rozwiązanie zamknięte z Motion (`motion-dom` `spring.mjs`)                                               | Motion `spring()`, `spring-easing` 2.3.3, Open Props `--ease-spring-*`                                      | ten sam wzór i te same progi co strona; `spring-easing` (2023) i Open Props dają `linear()` (Q5)                                                                                                                      | ~40 linii                                                                               |
| 6   | Anty-FOUC i zapis wyborów                 | **odpada**; **wzorzec** = własny skrypt inline z v2 w komponencie serwerowym                                                    | `next-themes` 0.4.6, `@wrksz/themes` 2.1.1                                                                  | provider React (Q8), jedna oś zamiast 11 (D13), ostrzeżenie React 19 o `<script>` w kliencie                                                                                                                          | 0                                                                                       |
| 7   | Roving focus i toggle group               | **decyzja właściciela**: Base UI `RadioGroup` + `Radio` (zależność już w paczce) albo własny `lib/roving-focus.ts` według planu | Base UI `RadioGroup`, `ToggleGroup`, `Toolbar`                                                              | `RadioGroup` robi dokładnie to, co plan opisuje dla ToggleGroup; `ToggleGroup` Base UI ma `role="group"` i `aria-pressed`, a strzałki tylko przenoszą focus                                                           | +~7 kB gz (część samodzielnie, wspólny kod Base UI liczony osobno), 0 nowych zależności |
| 8   | Testy CSS i trace ruchu                   | **zależność już w planie** (`@playwright/test` 1.64.1) + **wzorzec** sondy G3 z v2                                              | `toHaveCSS` (z `pseudo` od 1.60), `reducedMotion` (1.63), `document.getAnimations()`, CDP `compositeFailed` | gotowego helpera npm nie znaleziono; wbudowane API wystarczają                                                                                                                                                        | 0 ponad D15                                                                             |
| 9   | Systemy „silniki → przepisy → komponenty” | **wzorce** z Radix Themes; reszta odpada                                                                                        | Radix Themes 3.3.0, Open Props, Panda/Park, StyleX, Vanilla Extract, Tamagui, Ark                           | Radix Themes ma najbliższy model (`data-*` presety, jeden mnożnik promienia); pozostałe wymagają kompilatora albo łamią Q5, Q8, Z4                                                                                    | 0                                                                                       |

Rozmiary gzip: bundlephobia (pełne wejście paczki, bez tree-shakingu), odczyt 2026-10-31. Wersje i daty: rejestr npm, odczyt 2026-10-31.

## Zakres i stan na dzień

- Stan na 2026-10-31. Pominąłem to, co już zbadano w `r1`–`r4` i `e2-facts-*` (porównanie dostawców zachowania, budżety, CI, wartości v2). Te pliki tylko uzupełniam.
- Kod bibliotek czytałem z tarballi npm w scratchpadzie, poza repo (`@base-ui/react` 1.9.0, `motion-dom` 14.9.0, `@radix-ui/themes` 3.3.0). Niczego nie instalowałem i niczego nie uruchamiałem w przeglądarce.
- Wnioski „z kodu” są sprawdzone w źródle, ale nie w działającej aplikacji.

## Ustalenia per część

### 1. Palety i rampy kolorów

**Fakty**

| Kandydat                                                                          | Wersja (data)                          | Licencja, zależności                      | gzip    | Co daje                                                |
| --------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------- | ------- | ------------------------------------------------------ |
| `@radix-ui/colors`                                                                | 3.0.0 (2023-10-02), jedyne wydanie 3.x | MIT, 0                                    | 27,4 kB | 12-stopniowe skale light/dark, P3; dane, nie generator |
| `culori`                                                                          | 4.0.2 (2025-06-27)                     | MIT, 0                                    | 21,7 kB | konwersje, gamut mapping CSS Color 4, `wcagContrast`   |
| `colorjs.io`                                                                      | 0.7.1 (2026-07-24)                     | MIT, 0                                    | 31,6 kB | jw., gamut mapping                                     |
| `@adobe/leonardo-contrast-colors`                                                 | 1.1.0 (2026-02-18)                     | Apache-2.0, 5 (`chroma-js`, `apca-w3`, …) | 23,1 kB | kolory z docelowego kontrastu                          |
| paczki „Apple colors” (`ios-colors` 1.0.2 z 2020, `@windijs/colors` 1.0.4 z 2022) | —                                      | MIT                                       | —       | obiekty JS bez nazw ról w stylu `label` i bez CSS      |

- Makieta właściciela `MangaShift/docs/plans/ui-kit/prototypes/colors-v7-opus-a-tokens.js` ma już własne funkcje: OKLab/OKLCH (Ottosson), binarne szukanie chromy w gamucie, WCAG 2 i APCA 0.0.98G (`:4-57`). Ma też stałe: neutralne light, drabinę L dla czerni K1–K4, trójki Tailwind 500/400/700 i krok 9 z Radix 3.0.0 dla brakujących rodzin (`:58-122`).
- Gotowej paczki z rolami Apple (`label`, `secondaryLabel` itd.) jako zmiennymi CSS nie znalazłem (wyszukiwanie 2026-10-31).

**Rekomendacja.** Generator `scripts/colors.ts` przenosi matematykę i stałe z v7 bez biblioteki. `culori` czy `colorjs.io` mapuje gamut inaczej (redukcja chromy z ΔE zamiast binarnego szukania), więc wartości rozjechałyby się z makietą zaakceptowaną przez właściciela. Leonardo łamie W6 („wartości ze źródeł, nie z własnych wzorów”). `@radix-ui/colors` nic nie wnosi, bo v7 już przepisała z niego 8 potrzebnych stałych.

### 2. Tokeny i ich build

**Fakty**

- Style Dictionary 5.7.1 (2026-10-24, Apache-2.0, 13 zależności). Tokeny w JSON albo ESM (default export obiektu); TS jako źródło nie jest opisany. Tryby jako selektory `[data-*]` wymagają własnego formatu albo kilku buildów (strona „Tokens” o tym milczy). Źródło: https://styledictionary.com/info/tokens/ (2026-10-31).
- Terrazzo `@terrazzo/cli` 2.10.0 (2026-10-21, MIT, 18 zależności, m.in. `vite`, `vite-node`) i `plugin-css` 2.10.0. Tokeny w DTCG JSON. Tryby mapuje na dowolny selektor (`permutations` + `prepare`), wypisuje `oklch()` z gamutem przez Color.js. `@layer` ani `@property` w dokumentacji nie ma. Źródło: https://terrazzo.app/docs/integrations/css/ (2026-10-31).
- Panda 2.4.0 (2026-10-22): tokeny i semantic tokens z warunkami, ale wynikiem jest atomic CSS Pandy (r1 §, S27).

**Rekomendacja.** Odpada. Silniki Tessery (poza `color`) to formuły CSS (`max`, `min`, `calc`, selektory głębokości), a nie wartości do przepisania. Spec każe trzymać źródło w TS (U32), a `@layer theme` i `@property` trzeba by dopisywać obok narzędzia. Jeden skrypt TS → CSS dla `color` ma mniej pojęć niż DTCG plus konfiguracja.

### 3. Squircle (`corner-shape`) i wersja zapasowa

**Fakty**

- `corner-shape`: Chrome i Edge od 139 (2025-08), Firefox i Safari bez wsparcia. Stanowisko WebKit to „support”, Mozilli „positive”, terminu brak. Baseline: „Limited availability”. Źródło: https://web-platform-dx.github.io/web-features-explorer/features/corner-shape/ (2026-10-31). Przegląd z 2026 potwierdza „Chromium-only” (https://squircle.js.org/blog/squircles-in-css, autor sprzedaje bibliotekę clip-path, więc źródło niezależne tylko co do dat).
- CSS Paint API (`paint()`), na którym stoi `smooth-corners` 1.1.0: tylko Chromium, Safari i Firefox bez wsparcia. Źródło: https://web-platform-dx.github.io/web-features-explorer/features/paint/ (2026-10-31).
- `figma-squircle` 1.1.0 (2024-09) i `@squircle-js/react` 1.3.0 (2026-02, zależy od `@radix-ui/react-slot`) liczą ścieżkę SVG z wymiarów elementu i przycinają go `clip-path`. README `@squircle-js/react`: „Does not currently support `border-width`”.

**Rekomendacja.** Odpada każda biblioteka. Houdini nie działa w WebKit, czyli dokładnie tam, gdzie potrzebna byłaby wersja zapasowa. Ścieżki SVG wymagają pomiaru per kontrolka (Z5, Q7), a `clip-path` ucina obwódkę, focus ring i cień. D5 (`@supports` + zwykły łuk) pozostaje jedynym rozwiązaniem zgodnym z Q16.

### 4. Promień koncentryczny

**Fakty**

- CSSWG #7707 („New `border-radius` value for perfectly matching nested radii”) jest otwarte od 2022-09-07, bez rezolucji. Ostatni komentarz (2025-07-01) proponuje słowo kluczowe `concentric` w `corner-shape`. Źródło: https://github.com/w3c/csswg-drafts/issues/7707 (2026-10-31).
- Obejście z tego wątku, `overflow: clip` + `overflow-clip-margin: content-box` na rodzicu, przycina dzieci kształtem rodzica. Według autora działało tylko w Chromium (2023-03-07, https://nerdy.dev/perfect-nested-radius-with-overflow-clip-margin). Przycina też focus ring, cień i wysuwane elementy.
- `tailwindcss-padded-radius` 1.0.0 (2020-08-05): warianty utility Tailwinda.
- Radix Themes 3.3.0: `Inset` liczy `calc(var(--inset-border-radius) - var(--inset-border-width))`, a rodzic (Card) podaje swój promień (`styles.css`, tarball 3.3.0). To tylko jeden poziom.

**Rekomendacja.** Odpada. Wzór Tab Atkinsa z #7707 („promień rodzica minus padding, nie mniej niż 0”) to ten sam wzór co E0. Wielopoziomowy wariant bez JS daje tylko sposób B (selektory per głębokość), bo zmienna CSS nie może wyliczyć się z wartości odziedziczonej po samej sobie.

### 5. Sliding i sprężyna

**5a. Mechanizm pigułki: fakty**

- Motion `layoutId` (Motion 14.9.0, 2026-10-30, MIT; całość 57,8 kB gz, „layout animations are around 12kb” według dokumentacji). Dokumentacja: layout animuje `transform: scale()` z korektą `borderRadius` i `boxShadow` (https://motion.dev/docs/react-layout-animations, 2026-10-31). W kodzie `motion-dom` 14.9.0 projekcja animuje wartość 0→1000 (`projection/node/create-projection-node.mjs:44,1246`) i co klatkę miesza delty. **Wniosek:** to JS na wątku głównym, a zmiana rozmiaru idzie przez skalę, czyli łamie Q2, Q3 i D7.
- Base UI `Tabs.Indicator` (1.9.0). Wystawia `--active-tab-left/top/right/bottom/width/height` w `style` elementu. Przykład w dokumentacji: `transition-property: translate, width`, 150 ms (https://base-ui.com/react/components/tabs.md, 2026-10-31). W kodzie przy każdej zmianie wymusza re-render Reacta (`useForcedRerendering`) i śledzi tylko aktywną zakładkę, bez hover (`tabs/indicator/TabsIndicator.mjs:52-120`).
- Ark `SegmentGroup.Indicator`: zmienne `--left`, `--top`, `--width`, `--height`, `--transition-property` (https://ark-ui.com/docs/components/segment-group, 2026-10-31). Rozmiar idzie przez `width`.
- `react-use-measure` 2.1.7 (2025-01): `ResizeObserver` + rect. Nie daje nic ponad odczyt `offset*` z planu.

**5a. Wzorzec do skopiowania.** Funkcje `getLayoutOffset` i `getCumulativeOffset` z `TabsIndicator.mjs:155-200`. Komentarz w kodzie: „`offsetLeft`/`offsetTop` are rounded to whole pixels and the error can compound across the offset parent chain” (`:24-26`). Base UI sumuje `offset*` z `clientLeft/Top` rodziców i odejmuje scroll pośrednich kontenerów. Gdy wynik różni się od pozycji z `getBoundingClientRect` o ≤ 2 px (po odjęciu `translate` samej zakładki), bierze subpikselową wartość z recta. Plan (`lib/indicator`, „pomiar celu: offsetLeft/Top/Width/Height”) używa samych `offset*`. Przy kontrolkach o ułamkowej szerokości, na przykład przy skali 1,25 w Windows, pigułka może stać 1 px obok celu. Ta korekta rozwiązuje to w ~40 liniach.

**5b. Sprężyna: fakty**

- `motion-dom` 14.9.0 `animation/generators/spring.mjs`. Domyślnie masa 1. Gdy ruch ≥ 5 px, animacja kończy się przy `restSpeed` 2 px/s i `restDelta` 0,5 px; przy mniejszym ruchu przy 0,01 i 0,005 (`:7-19, 245-253`). Sprężyna niedotłumiona ma rozwiązanie zamknięte (`:262-290`). Sprężyna zdefiniowana fizyką (stiffness/damping, czyli przypadek strony) dziedziczy prędkość przy przekierowaniu (`inheritVelocity`, `:220-225`), a sprężyna zdefiniowana czasem jej nie dziedziczy.
- `spring(…)` zamieniony na tekst daje gotową krzywą do `transition` (https://motion.dev/docs/spring). Cała ta ścieżka idzie przez `linear()` (`generateLinearEasing`, import w `:2`), więc łamie Q5.
- `spring-easing` 2.3.3 (2023-05-19, 2,7 kB gz) zwraca tablicę wartości i czas. Wariant CSS daje `linear()`. Model domyślny to masa 1, sztywność 100, tłumienie 10; zgodności z Motion README nie deklaruje.
- Open Props 1.7.23: `--ease-spring-1…` to `linear(…)` (`easings.min.css`), czyli łamie Q5. `--ease-elastic-*` to zwykłe `cubic-bezier` z przestrzałem.

**5b. Rekomendacja.** Przepisać rozwiązanie zamknięte z `spring.mjs` do `lib/indicator/spring.ts`: próbkowanie pozycji co ~16 ms do klatek z `offset`, koniec według progów Motion (0,5 px, 2 px/s), prędkość początkowa z pochodnej przy zawróceniu w locie. Wtedy klatki odtwarzają dokładnie krzywą strony bez zależności. Paczka `motion` tylko dla generatora to zależność z wieloma eksportami, a z planu wykorzystalibyśmy jedną funkcję.

### 6. Motyw bez mignięcia i zapis wyborów

**Fakty**

- `next-themes` 0.4.6 (2025-03-11, MIT, 1,5 kB gz). Wymaga `ThemeProvider` (komponent kliencki z kontekstem), ma jeden `attribute` (string), jeden `storageKey` i jedną listę `themes`. README nie opisuje kilku niezależnych osi (https://github.com/pacocoursey/next-themes, 2026-10-31). Zgłoszenie #385: ostrzeżenie React 19 o `<script>` renderowanym w komponencie klienckim po aktualizacji do Next 16.2.0 (https://github.com/pacocoursey/next-themes/issues/385).
- `@wrksz/themes` 2.1.1 (2026-10-18). Też provider, jedna oś (`light`/`dark`, klasa albo atrybut). Według opisu autora obchodzi ostrzeżenie przez `useServerInsertedHTML` (README z unpkg, wpis dev.to).
- Base UI ma wewnętrzny `PrehydrationScript` (np. dla `Tabs.Indicator`, `renderBeforeHydration`), ale nie jako publiczne API motywu.

**Rekomendacja.** Odpada. Plan (D12, `lib/theme/`) jest prostszy niż którakolwiek z bibliotek. Pułapka do zapisania w planie: `ThemeScript` musi być komponentem serwerowym, bez `'use client'`, w `layout.tsx`. Inaczej React 19 i Next 16 zgłoszą to samo ostrzeżenie co #385. To wniosek z opisu zgłoszenia, nie sprawdziłem go w Next 16.4.

### 7. Roving focus i toggle group

**Fakty (kod `@base-ui/react` 1.9.0)**

- `ToggleGroup` ma `role: 'group'` (`toggle-group/ToggleGroup.mjs:74`) z `CompositeRoot` (roving, `loopFocus`, `orientation`). `Toggle` ma `aria-pressed` (`toggle/Toggle.mjs:71`). Strzałki przenoszą tylko focus, a wartość to `string[]` z `multiple`. Dokumentacja: https://base-ui.com/react/components/toggle-group.md (2026-10-31).
- `RadioGroup` ma `role: 'radiogroup'` (`radio-group/RadioGroup.mjs:180`) i `CompositeRoot`. Strzałka ustawia `touched` (`onKeyDownCapture`, `:194-198`), a `Radio` przy focusie z `touched` klika ukryty `<input type="radio">` (`radio/root/RadioRoot.mjs:134-141`). Efekt: strzałki zaznaczają. `Radio` ma `role: 'radio'` i `aria-checked` (`:111-112`). Działa też z `Field` i formularzem.
- Rozmiary samodzielne (bundlephobia exports-sizes, 1.9.0): `RadioGroup` 7,0 kB, `Radio` 6,7 kB, `ToggleGroup` 5,7 kB, `Toggle` 4,0 kB, `Tabs` 11,5 kB gz. Wspólny kod Base UI liczy się w każdym wierszu, więc realny przyrost obok Menu i Popovera jest mniejszy (wniosek).
- Ark `SegmentGroup` realizuje ten sam wzorzec radio (strzałki zaznaczają).

**Rekomendacja.** Plan (tabela komponentów) chce dla ToggleGroup „`role="radiogroup"` + `aria-checked`, roving”, czyli dokładnie zachowania Base UI `RadioGroup`. Zależność już wchodzi z D10, a `lib/roving-focus.ts` z testami klawiatury mógłby zniknąć. U18 wymienia jednak toggle group jako „własny kod [R2]”. R2 uzasadniało to Radixem, który zmieniał semantykę (#32), a Base UI tego problemu nie ma. Zmiana U18 należy do właściciela. Do sprawdzenia przed decyzją:

- (a) czy ukryte `<input>` nie psuje Q11 ani pomiaru pigułki;
- (b) czy `Radio` daje się wyrenderować jako `<button>` z przepisem `control` (`render`, `nativeButton`).

Bez zgody właściciela zostaje plan: własny `lib/roving-focus.ts`, a wzorcem jest `CompositeRoot` Base UI.

### 8. Testy wartości CSS i trace ruchu w Playwright

**Fakty**

- `@playwright/test` 1.64.1 (2026-10-14, Apache-2.0). Wydanie 1.60 dodało opcję `pseudo` w `expect(locator).toHaveCSS()` (odczyt `::before`/`::after`). Wydanie 1.63 dodało `testOptions.reducedMotion`, `forcedColors` i `contrast`. Wydanie 1.59 dodało zdarzenia `cdpSession.on('event')`. Źródło: https://playwright.dev/docs/release-notes (2026-10-31).
- `document.getAnimations()` zwraca CSS Animations, CSS Transitions i Web Animations; Baseline „Widely available” od 2020-09. Źródło: https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations.
- Chrome wpisuje przyczyny braku kompozycji do trace DevTools, a Lighthouse je czyta (https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations). Sonda v2 G3 już to robi (`r3-performance.md:266`).
- Gotowego helpera npm (Playwright + `compositeFailed`) nie znalazłem.

**Rekomendacja.** Bez nowej zależności poza D15:

- `toHaveCSS` z `pseudo` dla `engines.spec.ts`; przy obliczonych liczbach `getComputedStyle` w `evaluate`;
- `reducedMotion` z opcji testu;
- dla B1 dwa poziomy: (1) w Chromium i WebKit `document.getAnimations()` w trakcie przejazdu, sprawdzając, że każda animacja zmienia tylko `transform`, `translate`, `scale` lub `opacity` (`effect.getKeyframes()`, `transitionProperty`); (2) w Chromium trace CDP z G3 (`compositeFailed`).

Poziom (1) to tani sprawdzian, który działa też w WebKit, gdzie nie ma CDP.

### 9. Systemy całościowe

**Fakty**

| System          | Wersja              | Model                                                                                                                                                                                                                                                              | Co łamie spec                                                                                |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Radix Themes    | 3.3.0 (2026-01-31)  | atrybuty `data-accent-color`, `data-gray-color`, `data-radius`, `data-scaling`, `data-panel-background` na elemencie motywu; `--radius-N = calc(Npx * var(--scaling) * var(--radius-factor))`, `data-radius` ustawia `--radius-factor` 0/0,75/1/1,5 (`styles.css`) | komponent `Theme` z kontekstem React (`dist/esm/components/theme.js`, Q8); klasy komponentów |
| Open Props      | 1.7.23 (2026-01-31) | same zmienne CSS                                                                                                                                                                                                                                                   | sprężyny przez `linear()` (Q5)                                                               |
| Panda / Park UI | 2.4.0 (2026-10-22)  | tokeny, semantic tokens, recipe/slot recipe                                                                                                                                                                                                                        | kompilator, atomic CSS; warianty to klasy, nie `data-*`                                      |
| StyleX          | 0.19.1 (2026-09-15) | `defineVars`/`createTheme` w kompilatorze                                                                                                                                                                                                                          | mały runtime (r3), wtyczka Babel                                                             |
| Vanilla Extract | 1.21.3 (2026-10-08) | `createThemeContract` w buildzie                                                                                                                                                                                                                                   | wtyczka bundlera; 11 zależności                                                              |
| Tamagui         | 3.1.9 (2026-10-30)  | kompilator z React Native                                                                                                                                                                                                                                          | ok. 60 podpaczek, kontekst                                                                   |
| Ark UI          | 5.40.0 (2026-10-29) | `data-scope`/`data-part`, wskaźniki przez zmienne                                                                                                                                                                                                                  | wskaźniki animują `width` (Z4)                                                               |

**Rekomendacja (wzorce z Radix Themes).**

- Jeden mnożnik promienia na całą skalę (`--radius-factor` × wartość bazowa) potwierdza W3 („jeden parametr”). Silnik `shape` może zapisać `data-corners` jako mnożnik, a nie listę wartości.
- Oś `data-panel-background` (solid/translucent) to ten sam pomysł co `data-material` (D13), więc nazwy i podział są sprawdzone w produkcji.
- `Inset` z jednym poziomem koncentryczności pokazuje, gdzie gotowe systemy się zatrzymują. Sposób B (do 4 poziomów) wychodzi poza nie.
- Kontekst `Theme` Radixa jest przeciwwzorcem dla Q8: Tessera ustawia atrybuty bez Reacta.

Spectrum 2 nie sprawdzałem ponad r1.

## Sprzeczności i odkrycia materialne

1. **Sprężyna strony prawie nie ma przestrzału.** Policzyłem to rozwiązaniem zamkniętym z `spring.mjs`, przy prędkości startowej 0 (estymacja):

   | k/c    | ζ     | przestrzał | czas do spoczynku, 40 / 100 / 300 px |
   | ------ | ----- | ---------- | ------------------------------------ |
   | 420/36 | 0,878 | 0,31 %     | 297 / 309 / 488 ms                   |
   | 480/38 | 0,867 | 0,42 %     | 271 / 281 / 461 ms                   |
   | 380/34 | 0,872 | 0,37 %     | 306 / 319 / 512 ms                   |

   Na 100 px pigułka przejeżdża więc za cel o ~0,3 px, a na 300 px o ~0,9 px. „Lekki bounce jak na stronie” (D6) jest w praktyce miękkim hamowaniem bez widocznego odbicia. Przycięcie do ściany i zgniecenie pigułki (D7) przy tej sprężynie prawie nigdy się nie włączy, chyba że przy zawróceniu w locie z odziedziczoną prędkością. W20 („pigułka odbija się od krawędzi”) i D7 mogą więc wymagać mocniejszego wariantu (v2 `elastic` w odwodzie). Ocena należy do właściciela przy checkpoincie 2. Pozostaje niewiadoma: czy `layoutId` przekazuje prędkość przy przekierowaniu (projekcja miesza delty; nie sprawdziłem).

2. **Przelot okienek Base UI z `Viewport` jedzie po właściwościach układu.** Floating UI pozycjonuje domyślnie przez `transform: translate` (`useFloating` bez opcji `transform` w `floating-ui-react/hooks/useFloating.mjs:5`, `internals/useAnchorPositioning.mjs:317-357`). Gdy jednak użyty jest `Viewport` (`utils/usePopupViewport.mjs:56`) i pozycjoner ma `transition`, middleware `adaptiveOrigin` przełącza pozycję na `top`/`left`/`right`/`bottom` (`utils/adaptiveOriginMiddleware.mjs:20-65`). Przelot Base UI jest więc przejściem CSS po `top`/`left`, co łamie Q2. To wzmacnia ścieżkę `lib/popup-flight.ts` z planu (N7, faza 5). Sprawdzone w kodzie, nie w trace.

3. **W6 kontra v7.** W6 mówi „wartości ze źródeł, nie z własnych wzorów”, a v7 liczy drabinę ciemnych teł i trójki dla rodzin Radix własnym wzorem OKLCH (`trioFrom`, `darkNeutral`). Nie zmienia to rekomendacji 1, bo biblioteka niczego tu nie rozwiązuje, ale warto, żeby właściciel to wiedział.

4. **U18 kontra Base UI `RadioGroup`** (sekcja 7): uzasadnienie R2 dotyczyło Radixa.

## Niewiadome

- Czy Base UI `Radio` z `render={<button>}` przyjmuje przepis `control` bez dodatkowego wrappera i jak ukryte `<input>` wpływa na pomiar pigułki. Wymaga sondy.
- Czy `layoutId` w Motion przenosi prędkość przy przekierowaniu. Od tego zależy, czy „zawrócenie w locie” ma wierne odczucie strony.
- Czy ostrzeżenie z next-themes #385 dotyczy też skryptu w komponencie serwerowym w Next 16.4. Wnioskuję, że nie, ale tego nie sprawdziłem.
- Rozmiary gzip części Base UI liczone samodzielnie; realnego przyrostu obok Menu, Popovera, Dialogu i Tooltipa nie zmierzyłem.

## Źródła (dostęp 2026-10-31)

- Rejestr npm: `https://registry.npmjs.org/<pakiet>` (wersje, daty, licencje, zależności); bundlephobia API `size` i `exports-sizes`.
- Base UI: https://base-ui.com/react/components/tabs.md, https://base-ui.com/react/components/toggle-group.md; tarball `@base-ui/react` 1.9.0 (ścieżki w tekście).
- Motion: https://motion.dev/docs/react-layout-animations, https://motion.dev/docs/spring; tarball `motion-dom` 14.9.0.
- Radix Themes: tarball `@radix-ui/themes` 3.3.0 (`styles.css`, `dist/esm/components/theme.js`).
- Open Props: https://unpkg.com/open-props@1.7.23/easings.min.css.
- Ark: https://ark-ui.com/docs/components/segment-group.
- `corner-shape`: https://web-platform-dx.github.io/web-features-explorer/features/corner-shape/; Paint API: https://web-platform-dx.github.io/web-features-explorer/features/paint/; https://squircle.js.org/blog/squircles-in-css.
- Koncentryczność: https://github.com/w3c/csswg-drafts/issues/7707; https://nerdy.dev/perfect-nested-radius-with-overflow-clip-margin.
- next-themes: https://github.com/pacocoursey/next-themes, https://github.com/pacocoursey/next-themes/issues/385; `@wrksz/themes` README (unpkg 2.1.1).
- Tokeny: https://styledictionary.com/info/tokens/, https://terrazzo.app/docs/integrations/css/.
- Playwright: https://playwright.dev/docs/release-notes; MDN `getAnimations`: https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations; Lighthouse: https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations.
