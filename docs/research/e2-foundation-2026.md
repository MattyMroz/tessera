# Research: jak w 2026 zamknąć luki fundamentu Tessery v3 (audyt `e2-foundation-gaps.md`)

Stan na 2026-10-31. Wejście: `docs/reviews/e2-foundation-gaps.md` (G1–G25, F-A…F-M, D-A…D-F) i `docs/specification.md` (U10, U18, U27, U28, W1, W3, W6–W8, W14, W16, W19–W21, Q2–Q7, Q9, Q12, B7). Tylko odczyt; nic nie budowano ani nie testowano.

Źródła i ich waga:

- **Wsparcie przeglądarek:** MDN browser-compat-data (BCD), gałąź `main` pobrana 2026-10-31 (ostatni release v8.1.7 z 2026-10-22). Wersje „preview” w BCD oznaczają Safari Technology Preview, nie stabilne Safari.
- **Aktualne wersje (BCD `browsers/*.json`, 2026-10-31):** Chrome/WebView2 156 (od 2026-10-20; Chrome przeszedł na wydania co 2 tygodnie od 153), Edge 156, Safari 27.2 (2026-10-26). Safari 27 jest dostępne na macOS Sequoia i Tahoe (Apple, „About the security content of Safari 27”, wydane 2026-09-14). Safari 26.2 było dostępne na macOS Sonoma i Sequoia (Apple, support 125892, 2025-12-12), więc Sonoma kończy na linii 26.x.
- **Base UI 1.9.0** (wydane 2026-10-09): kod i dokumentacja dołączona do paczki w `node_modules/.bun/@base-ui+react@1.9.0+…/node_modules/@base-ui/react/` (`docs/react/**`, `*.mjs`, `*.d.ts`).
- **Systemy porównawcze:** kod źródłowy z GitHuba (Radix Themes `main`, Fluent UI v9 `master`, shadcn `apps/v4`, Material Web tokeny `v0_192`, Motion `main`), Apple HIG (dane JSON stron Accessibility i Color), WCAG 2.2 Understanding (W3C), WAI-ARIA APG.
- Etykiety: **FAKT** (źródło wprost), **WNIOSEK** (z kilku faktów), **REKOMENDACJA**, **NIEWIADOMA**.

## Odpowiedź

| #   | Pozycja                   | Rekomendacja                                                                                                                                                                                                                                                                                                                                                                                                                        | Chromium (WebView2) / Safari, min. wersja                                                                                                                                                            | Koszt dla Tessery                                                                                                        | Pewność                                                  |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 1   | G1/F-F rozmiar popupu     | Zmienne Base UI: `max-block-size: var(--available-height)` + `overflow-y: auto` na popupie listy, `min-inline-size: var(--anchor-width)` dla Select, `max-inline-size: min(<wyjście silnika>, var(--available-width))` dla tooltipa. CSS Anchor Positioning nie teraz.                                                                                                                                                              | zmienne custom properties: wszędzie; Anchor Positioning: Chrome 125 / Safari 26 (tylko dla porównania)                                                                                               | biała lista 5 zmiennych dostawcy w strażniku + 3–4 deklaracje w `surface` + 1 wyjście `size` + test małego okna          | wysoka                                                   |
| 2   | F-E wartość per instancja | Kanał zarejestrowanych zmiennych instancji `--ts-i-*` (`@property`, `inherits: false`) zapisywany przez `style` w JSX (tylko klucze z listy) albo przez `lib/` przy wartościach z gestów; drzewo: wcięcie z `aria-level` przez zamkniętą listę selektorów. Typowane `attr()` i `if()` odrzucone na dziś.                                                                                                                            | `@property`: Chrome 85 / Safari 16.4; typowane `attr()`: Chrome 133 / Safari tylko Preview; `if()`: Chrome 137 / Safari brak                                                                         | 1 rejestr zmiennych w silniku, zmiana reguły ESLint (wyjątek dla kluczy `--ts-i-*`), lista w strażniku przepisu          | wysoka                                                   |
| 3   | F-H/G13 container queries | `@container (inline-size < Npx)` z zamkniętą listą 3 literałów pilnowaną przez strażnika; `container-type: inline-size` jako opcja powierzchni. `var()` w warunku nie działa i 2026 tego nie zmienia; `@custom-media` tylko Firefox.                                                                                                                                                                                                | size queries: Chrome 105 / Safari 16; style queries (`style(--x: y)`): Chrome 111 / Safari 18; zakresy w style queries: Chrome 142 / Safari brak; `@custom-media`: Chrome brak / Safari brak         | 3 literały, 1 reguła strażnika, opcja `container` na powierzchni                                                         | wysoka                                                   |
| 4   | G11 `forced-colors`       | `@media (forced-colors: active)` w silnikach i przepisach: pigułka zaznaczenia `Highlight`, tekst wybranej opcji `HighlightText`, hover jako obrys `ButtonText`, wyłączone `GrayText`, fokus wyłącznie `outline` (box-shadow znika). `forced-color-adjust: none` tylko punktowo.                                                                                                                                                    | media query: Chrome 89 / Safari 16 (macOS nie ma trybu forced colors); `forced-color-adjust`: Chrome 89 / Safari brak                                                                                | 1 zapytanie na białej liście, ok. 10 deklaracji w `indicator`, `control`, `row`, test `emulateMedia`                     | wysoka (Chromium), WebView2 do potwierdzenia w aplikacji |
| 5   | F-A oś tonu               | `data-tone` (`neutral`, `accent`, `danger`, `success`, `warning`, `info`) ortogonalnie do wariantu, ustawia lokalne `--_tint`, `--_on-tint`; statusy dostają osobne wartości ciemne. `color-mix()` dopuszczony w przepisie. `contrast-color()` nie zamiast par `on-`.                                                                                                                                                               | `color-mix()`: Chrome 111 / Safari 16.2; OKLCH: Chrome 111 / Safari 15.4; `contrast-color()`: Chrome 147 / Safari 26; `light-dark()`: Chrome 123 / Safari 17.5                                       | 1 atrybut, 6 reguł w każdym z 3 przepisów, 4–8 wyjść koloru (statusy ciemne), `color-mix` na liście funkcji przepisu     | wysoka                                                   |
| 6   | F-B typografia            | Szósty przepis `text` z zamkniętą listą wariantów (`body`, `label`, `description`, `caption`, `error`, `title`, `display`, `mono`, `numeric`) i cienkie komponenty `Text`/`Heading`. `text-box: trim-both cap alphabetic` dla `title`/`display`, `tabular-nums` jako wariant lub wyjście, `text-wrap: balance`/`pretty`.                                                                                                            | `text-box`: Chrome 133 / Safari 18.2; `font-variant-numeric`: wszędzie; `text-wrap: balance`: Chrome 114 / Safari 17.5; `pretty`: Chrome 117 / Safari 26; `font-size-adjust`: Chrome 127 / Safari 17 | 1 plik przepisu, zmiana U10, 3–6 wyjść `type`, słowa kluczowe na białej liście                                           | wysoka (technika), decyzja właściciela                   |
| 7   | F-C stany i fokus pola    | Stany w przepisach przez atrybuty ARIA, które i tak muszą istnieć (`aria-pressed`, `aria-selected`, `aria-checked`, `aria-current`, `aria-invalid`, `aria-readonly`), natywne pseudoklasy (`:checked`, `:indeterminate`, `:user-invalid`, `:read-only`) i `data-*` Base UI tam, gdzie ARIA nie ma (`data-highlighted`, `data-invalid` na `Field.Root`). Fokus pola: `field` używa natywnego `:focus-visible` bez bramki modalności. | `:focus-visible`: Chrome 86 / Safari 15.4; `:user-invalid`: Chrome 119 / Safari 16.5; `:has()`: Chrome 105 / Safari 15.4                                                                             | ok. 4 wyjścia `state`, jedna lista selektorów stanu w przepisach, wyłączenie `field` z bramki `data-input`               | wysoka                                                   |
| 8   | F-D tor i kciuk           | Silnik `size` wylicza geometrię z wysokości rozmiaru (proporcje w silniku, nie w przepisie): `box`, `track-inline`, `track-block`, `thumb`, `rail`; `shape` daje promień kciuka. Obszar trafienia 24 px wyśrodkowany w `control` i `row`.                                                                                                                                                                                           | czysty `calc()`: wszędzie                                                                                                                                                                            | ok. 5 wyjść × 5 rozmiarów (liczone przez reguły `data-size`, więc 5 nazw publicznych), 1 wyjście `shape`                 | wysoka                                                   |
| 9   | F-J/G8 `will-change`      | Bez stałej warstwy. Warstwa w czasie aktywności grupy: `will-change: transform` od `pointerenter`/`focusin` grupy do końca animacji po wyjściu; sama animacja WAAPI i tak tworzy warstwę w obu silnikach. B7 liczy warstwy w spoczynku i aktywne grupy.                                                                                                                                                                             | `will-change`: Chrome 36 / Safari 9.1; kompozycja na czas animacji: Blink `kActiveTransformAnimation`, WebKit `requiresCompositingForAnimation`                                                      | zmiana w `lib/indicator.ts` (2 zdarzenia, 1 czyszczenie), test liczby warstw przez CDP, scena z ≥ 8 grupami przy DPR 1,5 | średnia (brak pomiaru pamięci)                           |
| 10  | F-K/G14 pętle i toast     | Pętle przez `@keyframes` zdefiniowane w silniku `motion` (tylko `transform`/`opacity`, easing słowami kluczowymi, bez `linear()`), czas z wyjścia silnika; przy `prefers-reduced-motion` szkielet staje, pasek nieokreślony pulsuje kryciem, spinner zostaje (to informacja o stanie). Wejście toastu: `translate` + `opacity` przez `@starting-style` lub `data-starting-style`.                                                   | `@keyframes`: wszędzie; `@starting-style`: Chrome 117 / Safari 17.5; `linear()` na wątku głównym w wydanym Safari 26 (bug WebKit 312407)                                                             | 3 `@keyframes` w silniku, 2 wyjścia `motion`, at-rule na białej liście silnika                                           | wysoka (technika), decyzja właściciela (toast)           |
| 11  | F-G/G9 portale            | Jedna funkcja `lib/` dla wszystkich popupów: przy otwarciu kopiuje osie zakresu (`data-size`, `data-density`, `data-corners`, `data-curve`, `data-mode`, `data-accent`, `data-neutral`, `data-motion`) z najbliższych przodków triggera na element popupu; `readMotion` czyta z popupu, nie z `<html>`. Nie przenosić portalu do poddrzewa.                                                                                         | DOM API: wszędzie                                                                                                                                                                                    | 1 moduł, wywołanie w 4–5 komponentach popupów, 2 testy                                                                   | wysoka                                                   |
| 12  | F-I kolekcja              | Własny moduł `lib/collection` (roving tabindex, orientacja, kierunek, Home/End, typeahead, pomijanie wyłączonych, zawijanie) dla Tabs, Tree, ToggleGroup, listy. Base UI `Toolbar` można używać, bo nie ma zaznaczenia. `CompositeRoot` jest tylko w `@base-ui/react/internals/composite` (API wewnętrzne), a Tree w Base UI nie istnieje (issue #3327 otwarte).                                                                    | n/d                                                                                                                                                                                                  | 1 moduł + testy; port semantyki `use-collection.ts` z v2                                                                 | wysoka                                                   |
| 13  | G13 oś `profile`          | Rozdzielić: `data-platform` (`app`/`web`: kursor, zachowanie zaznaczenia tekstu) i `data-type` lub `data-typeset` (profil krojów, W19). Cechy urządzenia (`hover`, `pointer`, `any-pointer`) zostają zapytaniami `@media`, nie osią motywu.                                                                                                                                                                                         | `hover`/`pointer`/`any-*`: Chrome 41 / Safari 9                                                                                                                                                      | zmiana nazw w `lib/theme.ts` i 2 silnikach, test                                                                         | wysoka                                                   |
| 14  | Inne techniki             | Przyjąć: `field-sizing: content` (Textarea bez pomiaru JS, Q7), `scrollbar-gutter: stable`, `text-wrap`, `@starting-style`, `light-dark()` (opcjonalnie dla statusów i sekcji odwróconych), `scrollbar-width`. Odrzucić na dziś: `interpolate-size`/`calc-size()`, `if()`, typowane `attr()`, `@custom-media`, element-scoped View Transitions. `corner-shape` zostaje stopniowym ulepszeniem (W3). `@scope` niepotrzebny.          | szczegóły w §14                                                                                                                                                                                      | małe, każde osobno                                                                                                       | wysoka                                                   |

**Minimalna wersja Safari dla Tessery (REKOMENDACJA):** Safari 26.2, czyli macOS Sonoma 14 z aktualizacją Safari, Sequoia 15 albo Tahoe 26.2. To najniższa wersja, w której działają wszystkie mechanizmy z tabeli bez obejść (`field-sizing` 26.2, `scrollbar-color` 26.2, `text-wrap: pretty` 26, style queries 18, `text-box` 18.2, `@starting-style` 17.5). Jeśli `field-sizing` ma fallback, dolna granica spada do Safari 18.2. Dla Tauri na macOS ustawić `minimumSystemVersion` na 14.0 i sprawdzić rzeczywistą wersję WebKit w aplikacji (patrz „Niewiadome”).

## Zakres i stan na dzień

- **Pytanie:** jaki mechanizm 2026 zamyka każdą lukę z audytu przy ograniczeniach Tessery (statyczny CSS, warstwy silnik → przepis → komponent, komponent bez `className`/`style`, ruch tylko `transform`/`opacity`, tsdown + React Compiler, Base UI 1.9) i działa w WebView2 (Chromium, aktualnie 156) oraz WKWebView/Safari.
- **Cel:** odpowiedzi na D-A…D-F i lista zmian fazy 0 E3.
- **Poza zakresem:** wygląd, ocena E2, projekt komponentów.
- **Fakt o buildzie Tessery (kod):** `packages/tessera/tsdown.config.ts` kopiuje CSS do `dist` bez transformacji (`copy: [{ from: 'src/{engines,recipes,components,styles}/**/*.css', … }]`). Każda składnia CSS trafia do konsumenta dosłownie, więc składnia wspierana tylko w jednym silniku przeglądarki nie zostanie przetłumaczona przez build Tessery.

______________________________________________________________________

## 1. G1 / F-F: rozmiar popupu przy braku miejsca

### Fakty

- **Base UI 1.9 wystawia na Positionerze** `--available-width`, `--available-height`, `--anchor-width`, `--anchor-height`, `--transform-origin`, `--positioner-width`, `--positioner-height` (`utils/CommonPositionerCssVars.d.ts`). Opis: „The available height between the trigger and the edge of the viewport”. Popup jest dzieckiem Positionera, więc dziedziczy te zmienne (zmienne niezarejestrowane dziedziczą się).
- **Base UI nie ogranicza wysokości sam.** Własne demo Menu w 1.9 ustawia na liście `max-height: min(22rem, var(--available-height)); overflow-y: auto; scroll-padding-block: 0.25rem;` i dla podmenu `max-height: min(28rem, var(--available-height))` (`docs/react/components/menu.md:4677-4692`). Demo Select: `Select.List { max-height: var(--available-height); overflow-y: auto }`, `Select.Popup { min-width: var(--anchor-width) }` (`select.md:265, 298`) oraz `Select.ScrollUpArrow`/`ScrollDownArrow` w trybie `alignItemWithTrigger` (`select.md:543-551`).
- **Kolizje:** Positioner ma `collisionAvoidance` (`side`: `flip`/`shift`/`none`, `align`, `fallbackAxisSide`), `collisionPadding`, `sticky`, `positionMethod` (`absolute` domyślnie albo `fixed`) (`menu.md:5514-5518`). Base UI liczy pozycję przez Floating UI (`@floating-ui/react-dom` 2.1.9), nie przez CSS Anchor Positioning: grep `anchor-name`/`positionAnchor` w paczce Base UI daje 0 trafień.
- **CSS Anchor Positioning (BCD):** `anchor-name`, `@position-try`, `anchor-size()`: Chrome 125 / Safari 26; `position-try-fallbacks`: Chrome 128 / Safari 26; `position-area`: Chrome 129 / Safari 26; `position-try-order: most-height`: Chrome 125 / Safari 26; `position-visibility`: Chrome 125 / Safari 26.2; słowa `flip-x`/`flip-y`: Chrome 144 / Safari 26.2.

### Wniosek

Zmienne Base UI rozwiązują G1 w całości i działają w każdej przeglądarce, bo to zwykłe custom properties zapisane przez JS dostawcy. CSS Anchor Positioning dałby to samo bez JS, ale Base UI ustawia pozycję inline (`top/left/transform`), więc drugi mechanizm pozycji walczyłby z dostawcą (U18). Anchor Positioning ma sens dopiero, gdy Base UI sam na niego przejdzie albo gdy Tessera zrezygnuje z pozycjonowania Base UI, czego spec nie przewiduje.

### Rekomendacja

- `surface` wariant `overlay`: `max-block-size: var(--available-height); overflow-y: auto; overscroll-behavior: contain; scroll-padding-block: <padding powierzchni>`. Przewija się element, w którym jest lista i pigułka (pigułka już liczy przewinięcie, `lib/indicator.ts:431, 440`).
- Opcjonalny sufit z silnika: `max-block-size: min(var(--ts-size-popup-max), var(--available-height))`, jak demo Base UI (22rem). Jedno wyjście `size`.
- Select: `min-inline-size: var(--anchor-width)`.
- Tooltip: `max-inline-size: min(var(--ts-size-tooltip-max), var(--available-width))` i `overflow-wrap: anywhere`.
- Strażnik (G2): biała lista nazw dostawcy z powodem, wzorem `RECIPE_SELECTOR_EXCEPTIONS`: `--available-height`, `--available-width`, `--anchor-width`, `--anchor-height`, `--transform-origin`. Fixture `good/` (overlay z `--available-height`) i `bad/` (nieznana zmienna dostawcy).

### Odrzucone

- **CSS Anchor Positioning (`position-try`, `anchor-size()`)**: konflikt z pozycjonowaniem Base UI; wymaga Safari 26.
- **Pomiar w JS i `max-height` inline**: łamie Q7 i duplikuje to, co Floating UI już liczy.

### Test

Playwright, okno 900×360 (jak sonda audytu): menu z 20 pozycjami. Asercje: `getBoundingClientRect().bottom ≤ innerHeight`, `scrollHeight > clientHeight`, `End` przewija do ostatniej pozycji i jest ona widoczna. Tooltip z długim zdaniem: szerokość ≤ wyjście silnika. Oba silniki przeglądarki (Chromium i WebKit w Playwright).

______________________________________________________________________

## 2. F-E (G7): wartość per instancja bez `style`

### Fakty (wsparcie, BCD)

| Mechanizm                                                             | Chromium | Safari                     | Uwagi                                                |
| --------------------------------------------------------------------- | -------- | -------------------------- | ---------------------------------------------------- |
| `@property`                                                           | 85       | 16.4                       | `CSS.registerProperty`: Chrome 78 / Safari 16.4      |
| `attr()` z fallbackiem dla dowolnej właściwości (`declaration-value`) | 133      | 18.4                       | wartość jest tekstem, nie liczbą                     |
| typowane `attr(data-x type(<number>))`                                | 133      | Preview (brak w stabilnym) | Firefox 155                                          |
| `if()`                                                                | 137      | brak                       | `if(style(…))` z zakresami: Chrome 142               |
| `progress()`                                                          | 138      | 26                         | `no-clamp`: Safari Preview/27 wg notatek WebKit 27.0 |
| `sibling-index()`/`sibling-count()`                                   | 138      | 26.2                       | indeks wśród rodzeństwa, nie głębokość               |
| scroll-driven `animation-timeline`                                    | 115      | 26                         |                                                      |

- Notatki WebKit dla Safari 27.0, 27.1 i 27.2 nie wymieniają typowanego `attr()` ani `if()` (webkit.org/blog/18325, 18486, 18515; odczyt 2026-10-31).
- **Base UI już pisze wartości instancji sam:** `Progress.Indicator` ustawia inline `insetInlineStart: 0; width: <procent>%` (`progress/indicator/ProgressIndicator.js:30-34`); `Slider.Thumb` ustawia `position: absolute; insetInlineStart: <procent>%; translate: -50% -50%` (`slider/thumb/SliderThumb.js:214-235`), a `Slider.Indicator` pisze `--start-position`, `--relative-size` i `width` (`slider/indicator/SliderIndicator.js:16-33`). Tabs.Indicator wystawia `--active-tab-left/width/top/height` (`tabs.md:752-757`).
- **React 19** ustawia klucze `style` zaczynające się od `--` przez `style.setProperty`; atrybuty `data-*` jako tekst. React Compiler memoizuje obiekty `style`, nie zmienia semantyki. Brak znanego konfliktu z `attr()` (atrybut to zwykły string). [WNIOSEK z modelu Reacta; nie sprawdzano kodu kompilatora.]
- Q6 (spec): zmienne zapisywane przez JS na pojedynczym elemencie są rejestrowane przez `@property` z `inherits: false`.

### Wniosek

Dziś jedynym mechanizmem, który przenosi liczbę z instancji do CSS w obu silnikach, jest custom property ustawiona na elemencie (przez atrybut `style` albo `setProperty`). Typowane `attr()` byłoby najczystsze (atrybut `data-value`, zero inline style), ale nie działa w stabilnym Safari, więc na macOS i na stronie dałoby pusty pasek postępu. `if()` jest tylko w Chromium.

Wydajność: zmiana atrybutu `data-*` i zmiana zarejestrowanej zmiennej `inherits: false` na tym samym elemencie kosztują podobnie (unieważnienie stylu jednego elementu); zmienna dziedziczona przelicza całe poddrzewo, stąd Q6. Koszt różni się po stronie Reacta: wartość jako prop oznacza commit komponentu, wartość zapisywana z gestu przez `lib/` (ref + `setProperty`) omija Reacta. [WNIOSEK.]

### Rekomendacja

1. **Rejestr zmiennych instancji** w jednym silniku (np. `space` albo nowy blok w `state`): `@property --ts-i-value { syntax: '<number>'; inherits: false; initial-value: 0 }` itd. Zamknięta lista, np. `--ts-i-value` (0–1, postęp i suwak własny), `--ts-i-offset` (`<length>`, lista wirtualna), `--ts-i-size` (`<length>`, kolumna tabeli). Prefiks `i` odróżnia je od wyjść silników i liczy się do B8 osobno.
2. **Dwa dozwolone kanały zapisu, jedna nazwa:** (a) `style={{ '--ts-i-value': x }}` w JSX komponentu, gdy wartość przychodzi z propsa (renderuje się w statycznym eksporcie Next, więc pierwsza klatka ma wartość); (b) `lib/` przez ref i `setProperty`, gdy wartość zmienia się z gestu lub przewijania (bez commitu Reacta). Reguła ESLint `no-local-appearance` dostaje wyjątek: `style` wolno tylko z obiektem literalnym, którego wszystkie klucze należą do rejestru.
3. **Przepisy czytają tylko rejestr** (lista w strażniku obok `ENGINE_OUTPUT`), a ruch z tej wartości wyrażają `transform` (np. wypełnienie `scale: var(--ts-i-value) 1` albo `translate`), nie `width`, gdy wartość ma się animować (Q2/Q3).
4. **Slider i Progress z Base UI:** zostawić dostawcy jego inline style (to nie `style` komponentu Tessery). Pamiętać, że `Progress.Indicator` zmienia `width` (układ), więc animacja wypełnienia wymaga własnego wskaźnika z `--ts-i-value` i `scale`. Decyzja na etapie komponentu.
5. **Drzewo:** `aria-level` musi istnieć przy wirtualizacji (APG Tree View: wymagane, gdy nie cały zbiór jest w DOM). Wcięcie z niego, bez drugiego źródła: w `row` zamknięta lista `[aria-level='2'] { --_level: 1 } … [aria-level='8'] { --_level: 7 }` i `padding-inline-start: calc(var(--_level, 0) * var(--ts-space-indent))`. Gdy Safari wyda typowane `attr()`, lista zamienia się na `attr(aria-level type(<integer>), 1)`.

### Odrzucone

- **Typowane `attr()`**: brak w stabilnym Safari (BCD: `preview`).
- **`if()`**: tylko Chromium.
- **`progress()`**: działa w obu (Chrome 138 / Safari 26), ale nie usuwa potrzeby przekazania liczby; procent i tak liczy JS. Przydatny dopiero przy mapowaniu jednej zmiennej na kilka zakresów.
- **Kontekst Reacta albo zmienne na `:root`**: łamie Q6 i Q8.

### Test

- Strażnik: fixture `bad/` z `style={{ color: 'red' }}` i z nieznanym `--ts-i-*`; `good/` z kluczem z rejestru.
- Vitest: `getComputedStyle(el).getPropertyValue('--ts-i-value')` po zmianie propsa.
- Playwright: Next static export, Progress z `value=40` ma szerokość lub skalę 40 % przed hydratacją (wyłączony JS).
- B3: licznik commitów przy przeciąganiu suwaka własnego (kanał `lib/`) = 0.

______________________________________________________________________

## 3. F-H / G13: container queries

### Fakty

- **`var()` w warunku:** MDN `var()`: „The `var()` function cannot be used in property names, selectors or anything else besides property values.” Warunek `@media`/`@container` nie jest wartością właściwości. Stan 2026 tego nie zmienia: specyfikacja przewiduje do tego `@custom-media` (Media Queries 5, `@custom-media --name <media-query-list>`), ale BCD: Chrome brak, Safari brak, Firefox 148.
- **Size queries** (`@container (inline-size < 480px)`, składnia zakresów): Chrome 105 / Safari 16. `container-query_optional` (zapytanie bez nazwy w niektórych formach): Chrome 148 / Safari 26.4.
- **Style queries dla custom properties** (`@container style(--x: y)`): Chrome 111 / Safari 18 / Firefox 151. **Zakresy w style queries** (`style(--x > 3)`): Chrome 142 / Safari brak.
- `scroll-state` queries: Chrome 133 / Safari brak. Anchor position queries: Chrome 143 / Safari brak.
- Build Tessery nie transformuje CSS (sekcja „Zakres”), więc `@custom-media` nie zostałby przetłumaczony na literały. \[FAKT z `tsdown.config.ts`.\]

### Wniosek

Progi kontenera muszą być literałami w regule. Style queries z równością działają w obu silnikach od Safari 18, ale nie zastąpią progów szerokości (nie porównują długości w Safari), a do przełączania osi Tessera ma już atrybuty `data-*`, które są prostsze.

### Rekomendacja

- Zamknięta lista 3 progów (wartości kalibruje właściciel na ekranach Ustawienia i Panel roboczy), np. nazwy `narrow`, `medium`, `wide`, zapisane w strażniku jako zbiór dozwolonych literałów `px`. Strażnik odrzuca `@container` z innym literałem, a test sprawdza, że lista w strażniku i dokumentacja są tym samym zbiorem.
- `@container` dozwolone w przepisie i w CSS komponentu, ale wewnątrz tylko właściwości układu (ta sama polityka, co dziś dla CSS komponentu).
- `container-type: inline-size` jako opcja powierzchni (`data-container`), nie domyślnie: kontener z zawieraniem rozmiaru w osi inline nie może brać szerokości z treści, co psuje elementy dopasowane do treści.
- Jednostki: `px`, bo silnik `type` i W1 są w `px` (G21 to osobna decyzja).

### Odrzucone

- `@custom-media`: brak w Chromium i Safari; build Tessery go nie przetłumaczy. Możliwe później przez Lightning CSS w buildzie, ale to nowa zależność i nowy krok dla trzech liczb.
- Progi przez style queries z zakresami: brak w Safari.
- `@media` zamiast `@container`: panele desktopu zmieniają szerokość niezależnie od okna.

### Test

Playwright: ta sama karta w kontenerze 320/600/900 px, asercja układu (np. `flex-direction` lub pozycja etykiety). Strażnik: fixture z literałem spoza listy w `bad/`.

______________________________________________________________________

## 4. G11: Windows High Contrast (`forced-colors`)

### Fakty

- **Wsparcie (BCD):** `@media (forced-colors)`: Chrome 89 / Safari 16 / Firefox 89. `forced-color-adjust`: Chrome 89 / Safari brak; `preserve-parent-color`: Chrome 106. macOS nie ma trybu forced colors (audyt, „Niewykonane kontrole”), więc w praktyce dotyczy Chromium na Windows.
- **Co wymusza przeglądarka (MDN `forced-colors`):** `color`, `background-color`, `border-color`, `outline-color`, `fill`, `stroke` i inne kolory dostają wartości przeglądarki; `box-shadow` i `text-shadow` → `none`; `background-image` (nie-URL, czyli gradienty) → `none`; `color-scheme` → `light dark`; `scrollbar-color` → `auto`. „When a system color is specified explicitly, it is used instead of the value that would otherwise be forced.” Kolory systemowe wybierane są według natywnej semantyki elementu, nie ról ARIA.
- **Kolory systemowe (MDN):** `Highlight`/`HighlightText` (zaznaczone elementy), `SelectedItem`/`SelectedItemText` (np. zaznaczony checkbox), `ButtonFace`/`ButtonText`/`ButtonBorder`, `Canvas`/`CanvasText`, `Field`/`FieldText`, `GrayText` (wyłączone), `AccentColor`/`AccentColorText` (Chrome 149 / Safari 16.5). `ButtonBorder`, `Mark`: Safari brak.
- **Fluent UI v9 (kod, `master`, 2026-10-31):** Tab: zaznaczona zakładka `border: … Highlight`, hover `backgroundColor: 'Highlight'` + `forcedColorAdjust: 'none'` + tekst `HighlightText`, wybrany wskaźnik `ButtonText` z tekstem `ButtonFace` (`react-tabs/…/useTabStyles.styles.ts:213-290, 361`). Switch: `color: CanvasText`, ikona kciuka `forcedColorAdjust: 'none'`, wyłączony `GrayText` (`react-switch/…/useSwitchStyles.styles.ts:67-72, 195-207`).
- Base UI 1.9 nie ma reguł forced colors (komponenty bez stylu; grep w `.mjs`: 0 trafień dla `forced-colors`).
- Sonda audytu: przy `forcedColors: 'active'` pigułka i tor mają `rgb(255,255,255)`, wybór niewidoczny.
- Fokus Tessery to `outline` (`recipes/focus.css`), więc przetrwa; poświata `box-shadow: var(--ts-depth-glow)` zniknie (to dobrze).

### Rekomendacja

- `(forced-colors: active)` na białej liście at-rule silnika i przepisu.
- `indicator`: pigułka zaznaczenia `background-color: Highlight`; pigułka hover `background-color: transparent; outline: 1px solid ButtonText` (inaczej niż zaznaczenie, bez wypełnienia).
- `control`/`row`: tekst i ikona elementu wybranego (ta sama lista selektorów stanu co w §7) `color: HighlightText`; wyłączone `color: GrayText`; tło stanu zaznaczenia przy wielu wyborach (drzewo, lista) `background-color: Highlight`.
- Tor (`data-surface="track"`) i pola: `border: 1px solid ButtonText` lub `CanvasText`, bo bez obramowania (W9) tor i pole znikają w forced colors.
- Checkbox/Switch z wypełnieniem: wypełnienie `Highlight` (lub `SelectedItem`), kciuk `HighlightText`. `forced-color-adjust: none` tylko na elementach, którym przeglądarka nadpisałaby jawny kolor systemowy w złym kontekście (wzór Fluent), nigdy na całym komponencie.
- Fokus: zostaje `outline`; w forced colors jawnie `outline-color: Highlight`.

### Odrzucone

- `forced-color-adjust: none` na korzeniu: wyłącza dopasowanie użytkownika, łamie cel trybu.
- Rozpoznawanie stanu po rolach ARIA przez przeglądarkę: MDN mówi wprost, że przeglądarka ich nie używa.

### Test

Playwright `page.emulateMedia({ forcedColors: 'active' })`: ToggleGroup, menu (hover), checkbox, switch, pole. Asercja: tło pigułki zaznaczenia ≠ tło toru, wybrana opcja ma inny kolor tekstu niż niewybrana, obrys fokusu istnieje. Jednorazowo ręcznie w WebView2 z motywem kontrastowym Windows (NIEWIADOMA poniżej).

______________________________________________________________________

## 5. F-A (D-B): oś tonu obok wariantu

### Fakty

- **Radix Themes:** `variant` (`classic`, `solid`, `soft`, `surface`, `outline`, `ghost`) i osobny `color`, ale `color` to **odcień palety** (26 barw: `red`, `green`, `amber`…), nie rola (`props/color.prop.ts`, `_internal/base-button.props.ts`). Każdy odcień ma skalę jasną i ciemną (`radix-ui/colors`: `red` i `redDark`, np. `red1 #fffcfc` / `red1 #191111`).
- **Fluent 2 (v9):** `Badge` ma `appearance` (`filled`, `ghost`, `outline`, `tint`) × `color` (`brand`, `danger`, `important`, `informative`, `severe`, `subtle`, `success`, `warning`); `MessageBar` ma `intent`. `Button` ma tylko `appearance` (`secondary`, `primary`, `outline`, `subtle`, `transparent`), bez tonu destrukcyjnego (`react-badge/…/Badge.types.ts:15, 21`; `react-button/…/Button.types.ts:32`).
- **Material 3:** role systemowe zawierają tylko `error`, `on-error`, `error-container`, `on-error-container` jako status; brak `success`/`warning` (tokeny `_md-sys-color.scss` w Material Web `v0_192`; to tokeny z 2023, nowsza wersja M3 Expressive nie była sprawdzana).
- **shadcn (apps/v4, `main`):** ton wtopiony w wariant: `variant: default | destructive | outline | secondary | ghost | link` w Button i Badge, a `destructive` ma osobne reguły trybu ciemnego (`dark:bg-destructive/60`).
- **Apple HIG Color:** kolory systemowe (Red, Orange, Yellow, Green, Blue…) mają cztery wartości: domyślna jasna, domyślna ciemna, zwiększony kontrast jasna, zwiększony kontrast ciemna (dane strony HIG Color, tabela „System colors”).
- **Wsparcie:** `color-mix()`: Chrome 111 / Safari 16.2 (wiele argumentów: Safari 27, Chrome brak); OKLCH: Chrome 111 / Safari 15.4; `light-dark()`: Chrome 123 / Safari 17.5; `contrast-color()`: Chrome 147 / Safari 26.
- **Kod Tessery:** `engines/color.css` ma statusy (`success`, `warning`, `danger`, `info` w OKLCH, `on-*`) tylko w `:root`; blok `[data-mode="dark"]` ich nie nadpisuje. Silnik `focus` już używa `color-mix(in oklab, …)`. Strażnik przepisu dopuszcza tylko `calc/min/max/clamp` (`test/guards/css-layers.ts`, `MATH_FUNCTIONS`).
- **Mechanika custom properties:** `var()` w deklaracji zmiennej rozwiązuje się na elemencie, na którym zmienna jest zadeklarowana. Wyjście silnika na `:root` nie może więc odwołać się do lokalnego `--_tint` przepisu. [FAKT z modelu kaskady CSS Variables; skutek dla Tessery to WNIOSEK.]

### Wniosek

Oś `tone` × `variant` to wzorzec Fluent (Badge) i Apple (rola `destructive` + tint), a pojedyncza oś z `destructive` (shadcn) jest dokładnie tym mnożeniem wariantów, którego audyt chce uniknąć. Radix rozdziela osie, ale po odcieniu, nie po roli; dla Tessery rola jest lepsza, bo motyw decyduje o barwie (U12). Statusy potrzebują wartości ciemnych: robią to Apple i Radix, a W6 tego wymaga.

Ponieważ wyjście silnika nie widzi lokalnej zmiennej przepisu, mieszanie tonu z drabinką stanów (soft = ton 8/16/24 %) musi dziać się w przepisie, więc `color-mix()` musi wejść na listę funkcji przepisu.

### Rekomendacja

- `data-tone` z 6 wartościami w `control`, `row`, `surface`: `[data-tone='danger'] { --_tint: var(--ts-color-danger); --_on-tint: var(--ts-color-on-danger) }`. Warianty czytają tylko `--_tint`/`--_on-tint`. Domyślny ton `accent` zachowuje dzisiejsze zachowanie `solid`.
- `color-mix` na liście funkcji przepisu (tylko `in oklab`, procenty z wyjść `state`), fixture.
- Statusy per tryb generowane przez `scripts/colors.ts` (wartości ze źródeł, W6: Apple lub Radix), z zachowaniem W7 (żywe przed WCAG). `light-dark()` jest alternatywą zapisu jednej deklaracji na dwa tryby, ale wymaga `color-scheme` na węźle trybu; generator i tak pisze bloki per tryb, więc nie jest potrzebny.
- `on-*` zostają liczone w buildzie.

### Odrzucone

- **Wariant na ton** (`solid-danger`): mnożenie wariantów w trzech przepisach.
- **`contrast-color()`** zamiast `on-*`: zwraca tylko biel albo czerń, a dobór par jest już robiony w buildzie; przydałby się dopiero przy akcencie wybieranym dowolnie przez użytkownika.
- **Odcień zamiast roli** (Radix): motyw traci kontrolę nad znaczeniem koloru.

### Test

Kontrakt: każda wartość `data-tone` ma regułę w każdym przepisie (rozszerzenie `contracts.test.ts`). Wizualnie: macierz ton × wariant × tryb na `/foundation`. Strażnik: `color-mix` dozwolony, inne funkcje nie.

______________________________________________________________________

## 6. F-B (D-A): typografia samodzielnego tekstu

### Fakty

- **Radix Themes:** komponenty `Text` (`as`: `span|div|label|p`; `size` 1–9; `weight`, `align`, `trim`, `truncate`, `wrap`, `color`, `highContrast`) i `Heading` (`text.props.tsx`). `trim` jest emulowany pseudoelementami z ujemnym marginesem (`styles/utilities/leading-trim.css`), czyli przed `text-box`.
- **Base UI 1.9:** brak komponentów typografii (lista eksportów `index.d.ts`).
- **shadcn:** typografia to strona dokumentacji z klasami, bez komponentu. [Opis znany; nie otwierano strony w tej sesji.]
- **Wsparcie (BCD):** `text-box`/`text-box-trim`: Chrome 133 / Safari 18.2 / Firefox 154 (dla elementów inline Safari tylko częściowo od 26.5). `font-variant-numeric` (`tabular-nums`): Chrome 52 / Safari 9.1. `font-size-adjust`: Chrome 127 / Safari 16.4, `from-font` Safari 17. `text-wrap: balance`: Chrome 114 / Safari 17.5; `text-wrap: pretty`: Chrome 117 / Safari 26.
- Kod Tessery: `engines/type.css` 6 stopni do 20 px, bez cyfr tabelarycznych; strażnik nie zna słów `tabular-nums`, `balance`, `pretty` (audyt G20).

### Wniosek

Tekst poza kontrolką powtarza się w co najmniej 8 rodzinach (audyt G4). Sloty w istniejących przepisach rozproszą tę samą regułę po trzech plikach (I2). Przepis `text` to jedno miejsce, tak jak `Text`/`Heading` w Radix Themes. `text-box` jest w obu silnikach, więc wyrównanie optyczne nagłówków może być natywne zamiast emulacji Radixa.

### Rekomendacja

- Szósty przepis `text` (zmiana U10) z zamkniętą listą wariantów: `body`, `label`, `description`, `caption`, `error`, `title`, `display`, `mono`, plus modyfikator `numeric`.
- Cienkie komponenty `Text` i `Heading` (bez `className`/`style`, `as` z zamkniętej listy).
- `title`/`display`: `text-box: trim-both cap alphabetic`, `text-wrap: balance`. Akapity `description`: `text-wrap: pretty`.
- `numeric`: `font-variant-numeric: tabular-nums` (też dla wartości suwaka, tabel, Kbd).
- Skala display tylko w profilu `web` typografii (W19); desktop zostaje na 6 stopniach.
- `font-size-adjust: from-font` dopiero, gdy profil miesza kroje (W19, strona); nie w fundamencie.

### Odrzucone

- Sloty w `control`/`row`/`surface`: ta sama reguła w kilku przepisach.
- Emulacja trimu marginesami (Radix): niepotrzebna przy `text-box` w obu silnikach.

### Test

Kontrakt wariantów jak w innych przepisach; Playwright: wysokość bloku `title` z trimem = wysokość wersalików ± 1 px w Chromium i WebKit; `tabular-nums` daje równe szerokości cyfr „111” i „888”.

______________________________________________________________________

## 7. F-C (G5, D-D): stany w CSS i fokus pola

### Fakty: atrybuty Base UI 1.9 (dokumentacja w paczce)

| Część                                | Atrybuty stanu                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Menu/ContextMenu Item                | `data-highlighted`; CheckboxItem/RadioItem: `data-checked`, `data-highlighted`                                                  |
| Select Item                          | `data-selected`, `data-highlighted`                                                                                             |
| Combobox Item                        | `data-selected`, `data-highlighted`                                                                                             |
| Toggle                               | `data-pressed`, ARIA `aria-pressed` (`toggle/Toggle.mjs:71`)                                                                    |
| Tabs Tab                             | `data-active`, ARIA `aria-selected` (`tabs/tab/TabsTab.mjs:175`), `data-activation-direction`                                   |
| Switch, Checkbox                     | `data-checked`/`data-unchecked`, `data-invalid`, `data-readonly`, `data-required`, `data-dirty`, `data-touched`, `data-focused` |
| Field (Root, Label, Control, Error…) | `data-invalid`, `data-valid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`                                       |
| NumberField, Combobox, Autocomplete  | `data-readonly`, `data-invalid`, `data-pressed`                                                                                 |
| NavigationMenu                       | `data-active`                                                                                                                   |
| Menu Viewport                        | `data-current`/`data-previous` (przejście treści, nie stan „bieżący”)                                                           |

- U18: checkbox, radio, switch są natywne w Tessera v3, więc ich stany to `:checked`, `:indeterminate`, `:disabled`, `:user-invalid` (Chrome 119 / Safari 16.5), `:read-only`.
- **WCAG 2.2:** 2.4.7 Focus Visible (AA): „Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.” Understanding: wskaźnik dla myszy to dobra praktyka, nie wymóg; przykład pola tekstowego wymienia pionową kreskę kursora. 2.4.11 Focus Not Obscured (Minimum) to AA i dotyczy zasłaniania, nie wyglądu. 2.4.13 Focus Appearance to AAA (obszar ≥ obwód 2 px, kontrast 3:1).
- **`:focus-visible` (MDN):** „when a button is clicked using a pointing device, the focus is generally not visually indicated, but when a text box needing user input has focus, focus is indicated.” Sonda audytu potwierdza: kliknięte pole ma `:focus-visible: true`.
- **Kod Tessery:** `recipes/focus.css` warunkuje obrys `:root:not([data-input='pointer'])`, a `lib/input-modality.ts` przełącza modalność tylko klawiszami nawigacji. To nadpisuje heurystykę przeglądarki dla pól.

### Wniosek

ARIA i tak musi być ustawiona dla dostępności (Toggle i Tabs Base UI ustawiają ją same; własne komponenty muszą). Selektory po ARIA dają jedno źródło prawdy dla czytnika ekranu i wyglądu. `data-*` Base UI potrzebne są tylko tam, gdzie stan nie ma odpowiednika ARIA na tym samym elemencie (`data-highlighted`, `data-invalid` na `Field.Root` lub etykiecie).

Fokus pola: Tessera jest zgodna z 2.4.7 bez zmian (tryb klawiatury pokazuje fokus), ale przez własną bramkę ukrywa coś, co przeglądarka celowo pokazuje. Pole bez ramki (W9) i z kliknięciem myszy nie ma żadnego wskaźnika poza kursorem.

### Rekomendacja

- Silnik `state`: wyjścia `selected` (tło stanu dla wielu wyborów), `invalid` (kolor i obrys błędu z tonu `danger`), `readonly` (bez drabinki hover/press), `current` (nawigacja).
- Jedna lista selektorów stanu w przepisach, np. zaznaczenie: `:is([aria-pressed='true'], [aria-selected='true'], [aria-checked='true'], :checked, [data-checked], [data-selected])`; błąd: `:is([aria-invalid='true'], [data-invalid], :user-invalid)`; bieżący: `[aria-current]:not([aria-current='false'])`.
- Zasada do spec: pigułka dla jednego wyboru, tło stanu dla wielu (audyt G5).
- **D-D:** wariant `field` pokazuje fokus po natywnym `:focus-visible`, bez bramki `data-input` (np. stopień drabinki albo obrys `--ts-focus-width`). Kontrolki przycisków zostają przy obecnej bramce.

### Odrzucone

- Tylko `data-*` Base UI: własne komponenty (Tabs, ToggleGroup, Tree) musiałyby emulować atrybuty Base UI obok ARIA, czyli dwa źródła.
- `:focus` dla pól: pokazywałby fokus także po programowym `focus()` w dialogu, gdzie przeglądarka i tak decyduje sama.

### Test

Playwright: kliknięcie pola → obrys lub zmiana tła różna od spoczynku; Tab na przycisk → obrys; kliknięcie przycisku → brak obrysu. Kontrakt: każdy przepis ma reguły dla 4 stanów. `aria-invalid` + forced colors: błąd widoczny.

______________________________________________________________________

## 8. F-D: geometria toru i kciuka, obszar trafienia

### Fakty

- **Radix Themes `switch.css`:** `--switch-width: calc(var(--switch-height) * 1.75)`, `--switch-thumb-inset: 1px`, `--switch-thumb-size: calc(var(--switch-height) - var(--switch-thumb-inset) * 2)`, `--switch-thumb-translate-x: calc(var(--switch-width) - var(--switch-height))`; rozmiary 1–3 ustawiają tylko `--switch-height` ze skali odstępów.
- **Material 3 (Material Web, tokeny `v0_192`):** switch tor 52×32, kciuk zaznaczony 24, wciśnięty 28, warstwa stanu 40; slider tor 4, uchwyt 20×20, warstwa stanu 40; checkbox 18, warstwa stanu 40; linear progress 4. (Tokeny z 2023; M3 Expressive nie sprawdzano.)
- **Apple HIG Accessibility (tabela „Default/Minimum control size”):** iOS/iPadOS 44×44 / 28×28 pt; **macOS 28×28 / 20×20 pt**; visionOS 60×60 / 28×28; tvOS 66×66 / 56×56. Odstęp: ok. 12 pt wokół elementów z ramką, ok. 24 pt bez ramki.
- **WCAG 2.5.8 Target Size (Minimum), AA:** ≥ 24×24 CSS px albo wyjątek odstępu: koło o średnicy 24 px wyśrodkowane na celu nie przecina innego celu ani koła innego małego celu; wyjątki inline, user agent, equivalent, essential.
- Tessera W1: wysokości 16/20/24/28/36, domyślny `lg` = 28, czyli domyślny rozmiar macOS. `xs` (16) jest poniżej minimum macOS (20) i WCAG (24 bez odstępu). Obszar trafienia istnieje tylko przy `pointer: coarse` i nie jest wyśrodkowany (audyt G22).

### Wniosek

Wszystkie trzy systemy wyrażają geometrię jako funkcję jednej wysokości (Radix wprost wzorem, Material stałymi z tej samej siatki). W Tesserze wzór musi być w silniku, bo przepis może mieć tylko `0`, `±1`, `100%`.

### Rekomendacja

- `size` per `data-size`: `--ts-size-box` (checkbox/radio), `--ts-size-track-inline`, `--ts-size-track-block` (switch), `--ts-size-thumb`, `--ts-size-rail` (suwak, postęp, pasek „lane”). Proporcje jako liczby silnika (np. tor = wysokość × 1,75, kciuk = tor − 2 × inset); dokładne liczby do oceny właściciela na żywo.
- `shape`: promień kciuka (koło dla radio i suwaka, kapsuła dla switcha, W3).
- Obszar trafienia: w `control` i `row` pseudoelement wyśrodkowany: `inset: min(0px, calc((100% - var(--ts-size-hit)) / 2))` z `--ts-size-hit` = 24 px; włączony zawsze dla `xs`/`sm` w toolbarach, a dla reszty przy `pointer: coarse`. Alternatywa zgodna z WCAG bez powiększania: odstęp ≥ 24 px między środkami małych celów (wyjątek odstępu).

### Odrzucone

- Rozmiary toru jako literały w przepisie: zakaz liczb w przepisie.
- 44 pt jako cel desktopu: to wartość iOS; dla macOS Apple podaje 28/20 pt.

### Test

Vitest/Playwright: dla każdego `data-size` kciuk mieści się w torze (`thumb ≤ track-block`), przesunięcie kciuka = `track-inline − track-block`; test 2.5.8: dla toolbaru `xs` koła 24 px się nie przecinają albo `::before` ma ≥ 24×24.

______________________________________________________________________

## 9. F-J / G8 (D-C): koszt stałych warstw `will-change`

### Fakty

- **MDN `will-change`:** „Use the `will-change` property as a last resort … Don't use it to anticipate performance problems.” „Overusing the property can cause the page to slow down.” Zalecany wzór: włączyć skryptem tuż przed zmianą i wyłączyć po niej; „use caution with the `will-change` property directly in stylesheets. It may cause the browser to keep the optimization in memory for much longer than it is needed.”
- **Blink (`compositing_reasons.h`, `main`):** osobne powody `kActiveTransformAnimation`, `kActiveOpacityAnimation` i `kWillChangeTransform`, czyli element z trwającą animacją transform/opacity dostaje warstwę bez `will-change`.
- **WebKit (`RenderLayerCompositor.cpp`, `main`):** `requiresCompositingForAnimation` sprawdza `hasRunningAcceleratedAnimations()`; osobno `requiresCompositingForWillChange`.
- **Motion (`motiondivision/motion`, `main`):** `WillChangeMotionValue` ustawia `will-change: transform`, gdy zaczyna się animacja wartości przyspieszanej, i jej nie zdejmuje; test `"Don't remove values when they finish animating"` (`framer-motion/src/value/use-will-change/__tests__/will-change.test.tsx:89`). Czyli warstwa od pierwszej animacji danego elementu do jego odmontowania, nie od montowania.
- **Base UI / Floating UI:** `@floating-ui/react-dom` 2.1.9 dodaje `willChange: 'transform'` do Positionera tylko przy `devicePixelRatio ≥ 1.5` (`floating-ui.react-dom.mjs:217-221`); popup żyje tylko gdy otwarty (Q10).
- **Kod Tessery:** `lib/indicator.ts:469` ustawia `ride.style.willChange = 'transform'` na cały czas życia pigułki, a ruch to WAAPI (`ride.animate(...)`, `:502-505`).
- **NIEWIADOMA:** pamięć GPU jednej warstwy pigułki przy DPR 1,5 w WebView2 i WKWebView. Nie znalazłem pomiaru producenta; rząd wielkości to szerokość × wysokość × DPR² × 4 B na kafel (dla pigułki 120×28 px przy DPR 1,5 to ok. 30 kB), ale narzut na warstwę (kafle, drzewo właściwości) jest nieznany bez pomiaru.

### Wniosek

Stała warstwa nie jest potrzebna do płynności: obie przeglądarki promują element na czas animacji WAAPI. `will-change` przed ruchem chroni tylko pierwszą klatkę przed kosztem utworzenia warstwy i rasteryzacji, co dla prostokąta z wypełnieniem jest małe. Budżet B7 ≤ 12 przy 6 segmentach × 2 pigułki pęka bez zysku. Wzór Motion (warstwa od pierwszego ruchu) i MDN (włącz przed, wyłącz po) są zgodne co do jednego: nie od montowania.

### Rekomendacja (D-C)

- Warstwa na czas aktywności grupy: `will-change: transform` na pigułkach grupy przy `pointerenter`/`focusin` kontenera, zdjęcie po `pointerleave`/`focusout` i po `finished` ostatniej animacji (MDN). Pigułka zaznaczenia w spoczynku bez warstwy.
- B7 liczy warstwy długiego życia w spoczynku (cel: 0 pigułek) oraz osobno maksimum w trakcie interakcji (1 grupa = 2 warstwy).
- Q4 i plan E2 (N1) poprawić: „wskaźnik jest warstwą od wejścia do grupy do końca ruchu”.

### Odrzucone

- Stała warstwa (D8): koszt B7 rośnie liniowo z liczbą grup, zysk tylko w pierwszej klatce.
- Brak `will-change` w ogóle: możliwe i najprostsze, ale ryzyko zauważalnego skoku w pierwszej klatce przy `spring` na słabym GPU; do sprawdzenia pomiarem T1 (LoAF). Jeśli T1 nie pokaże różnicy, wybrać ten wariant.

### Test

Playwright + CDP `LayerTree.enable`/`layerTreeDidChange`: scena z ≥ 8 grupami przy DPR 1,5, liczba warstw w spoczynku i w trakcie hovera; trace B2 (zero Layout/Paint w poddrzewie podczas ruchu) bez zmian; T1 porównanie wariantów „aktywność” i „bez `will-change`”.

______________________________________________________________________

## 10. F-K / G14 (D-F): pętle i wejście toastu

### Fakty

- `@keyframes`: Chrome 43 / Safari 9. WAAPI `Element.animate`: Chrome 36 / Safari 13.1. Obie drogi są animacjami przyspieszanymi dla `transform`/`opacity` w Blink i WebKit (powody kompozycji z §9 nie rozróżniają CSS i WAAPI). [FAKT dla kompozycji; „na kompozytorze w całości” zależy od easingu, niżej.]
- **WebKit bug 312407** (2026-04-15): „CSS linear() easing curve forces animations onto the main thread” w wydanym Safari 26; Antoine Quint: zmieni to flaga „Time-based Threaded Animations”, włączona domyślnie na portach Cocoa w trunk. Notatki Safari 27.0–27.2 tego nie ogłaszają, więc Q5 dalej obowiązuje.
- `@starting-style`: Chrome 117 / Safari 17.5; `transition-behavior: allow-discrete`: Chrome 117 / Safari 17.4.
- Base UI 1.9 Toast wystawia `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-x/y` i atrybuty `data-starting-style`/`data-ending-style`; U18 przypisuje toast do własnego kodu Tessery.
- Q2: `rotate`/`transform` nie na elementach SVG (opakowanie w element HTML). W16: zero animacji wejścia popupu; toast nie jest wymieniony.
- Kod Tessery: pigułka używa WAAPI z wyliczonymi klatkami (`lib/indicator.ts:494-505`), czyli sprężyna jest próbkowana w JS, bez `linear()`.

### Wniosek

Dla pętli bez parametrów zależnych od geometrii (`rotate` spinnera, `translate` paska nieokreślonego, przesuw połysku szkieletu) `@keyframes` jest prostszy od WAAPI: działa w statycznym eksporcie przed hydratacją, nie potrzebuje kodu montowania ani obsługi `prefers-reduced-motion` w JS, a zatrzymuje go to samo zapytanie `@media`, które silnik `motion` już ma. WAAPI zostaje tam, gdzie klatki liczy się z geometrii (pigułka, przelot popupu).

### Rekomendacja (D-F)

- `@keyframes` dopuszczone **tylko w silniku `motion`** (3 nazwy: `ts-spin`, `ts-sweep`, `ts-pulse`), z właściwościami `transform`/`translate`/`rotate`/`opacity`; przepisy wybierają je przez `animation-name: var(--ts-motion-…)` lub nazwę z białej listy, czas z wyjścia `--ts-motion-loop`. Easing tylko słowami kluczowymi (`linear` jako słowo, nie funkcja `linear()`).
- Szkielet: połysk to pseudoelement z gradientem przesuwany `translate` (gradient się nie animuje).
- `prefers-reduced-motion` (i `data-motion="off"`): szkielet bez połysku, pasek nieokreślony pulsuje kryciem, spinner obraca się dalej (niesie stan ładowania); to rekomendacja, decyzja właściciela.
- Toast: wejście `translate` + `opacity` przez `@starting-style` (albo `data-starting-style`, jeśli komponent oprze się na Base UI Toast), ok. 150–200 ms z silnika; przy ograniczonym ruchu tylko `opacity`. Dopisać toast do W16 jako wyjątek, jeśli właściciel się zgodzi.

### Odrzucone

- Pętle przez WAAPI w `lib/`: więcej kodu, brak ruchu przed hydratacją na stronie, osobna obsługa preferencji.
- Animacja `background-position` szkieletu: nie jest kompozytorowa (Q2).
- `linear()` do sprężyn w CSS: główny wątek w wydanym Safari (bug 312407, Q5).

### Test

Trace B1/B2 dla sceny ze spinnerem, szkieletem i paskiem (0 Layout/Paint); `emulateMedia({ reducedMotion: 'reduce' })`: `getAnimations()` szkieletu puste; strażnik: `@keyframes` z `width` w `bad/`.

______________________________________________________________________

## 11. F-G / G9: osie motywu w popupach w portalu

### Fakty

- **Radix Themes:** treść popupu jest owinięta w `<Theme asChild>` wewnątrz `Portal` (`dropdown-menu.tsx:69-100`), a `Theme` czyta kontekst Reacta rodzica (`theme.tsx:42-63, 137`) i powtarza atrybuty motywu na popupie.
- **Base UI 1.9:** `Portal` ma prop `container` („A parent element to render the portal element into”), Positioner `positionMethod: 'absolute' | 'fixed'` (`menu.md:5445, 5518`).
- **MDN Containing block:** dla `position: absolute` i `fixed` blok zawierający tworzy najbliższy przodek z `filter`, `backdrop-filter`, `transform`, `perspective`, `rotate`, `scale`, `translate` ≠ `none`, `contain: layout|paint|strict|content`, `will-change` takiej właściwości albo `content-visibility: auto`.
- Kod Tessery: portale do `body`; `readMotion` czyta `document.documentElement` (`lib/indicator.ts:113-120`). Q8: motyw to atrybuty + CSS, nie kontekst Reacta; B4: 0 re-renderów przy zmianie motywu.

### Wniosek

Wzór Radix (kontekst Reacta + `Theme` w portalu) łamie Q8 i B4. Portal do kontenera w poddrzewie (`container`) łamie się na panelach ze szkłem (W10: `backdrop-filter` tworzy blok zawierający) i na przodkach z `overflow: hidden`. Zostaje kopia atrybutów z drzewa triggera w chwili otwarcia: popup żyje krótko (Q10), więc zmiana motywu w trakcie otwarcia jest rzadkim przypadkiem.

### Rekomendacja

- Jedna funkcja `lib/scope.ts`: dla elementu triggera zbiera z najbliższych przodków (`closest('[data-size]')` itd.) wartości osi zakresu i zapisuje je na elemencie Positionera lub Popupu w ref callbacku (przed malowaniem). Wszystkie popupy (Popover, Menu, Tooltip, Select, Dialog, Combobox) wołają ją jednakowo.
- `readMotion(element)` czyta styl z elementu, nie z `<html>`.
- G10 (element zakresu koloru) korzysta z tego samego mechanizmu: węzeł zakresu ma komplet `data-mode`, `data-accent`, `data-neutral` (i `color-scheme`), a popup go kopiuje.

### Odrzucone

- `Theme` w portalu przez kontekst Reacta (Radix): Q8, B4.
- Portal w poddrzewie (`container`): blok zawierający od `backdrop-filter`, przycinanie przez `overflow`.

### Test

Playwright: menu otwarte z paska `data-size="xs"` ma wysokość pozycji jak `xs`; popup z sekcji `data-mode="dark"` na jasnej stronie ma ciemne tło; B4 bez zmian.

______________________________________________________________________

## 12. F-I: kolekcja i roving focus

### Fakty

- **Base UI 1.9 ma publicznie:** `Tabs` (orientacja, `loopFocus`, `activateOnFocus`, `Tabs.Indicator` z `--active-tab-*`), `Toolbar` (Root, Group, Button, Link, Input, Separator), `ToggleGroup`, `Menu`, `Menubar`, `NavigationMenu`, `DirectionProvider` (`index.d.ts`, `docs/react/components/*.md`).
- **Brak Tree.** Issue mui/base-ui #3327 „Add Tree component” otwarte (stan 2026-10-31).
- **`CompositeRoot`** jest eksportowany tylko ścieżką `@base-ui/react/internals/composite` (sekcja `exports` w `package.json`); obsługuje `orientation` (`horizontal|vertical|both`), `grid`, `loopFocus`, `enableHomeAndEndKeys`, `disabledIndices`, `highlightItemOnHover`, `modifierKeys`; typeahead nie jest jego częścią (osobny `useTypeahead` wspomniany w `CompositeList.d.ts`). `Toolbar.Root` opiera się na `CompositeRoot` (`toolbar/root/ToolbarRoot.mjs:4, 50`).
- **Tabs Base UI:** każdy `Tab` czyta `activeTabValue` z kontekstu korzenia i liczy `active = value === activeTabValue` (`tabs/tab/TabsTab.mjs:43, 68`). WNIOSEK: zmiana zakładki re-renderuje każdą zakładkę, ten sam problem Q9 co `RadioGroup` w `decisions/e2-base-ui.md`.
- **APG Tree View:** prawo/lewo otwiera, zamyka lub przechodzi do dziecka/rodzica; góra/dół bez zmiany rozwinięcia; Home/End; typeahead zalecany (zwłaszcza > 7 węzłów korzenia); `*` opcjonalnie; `aria-level`/`aria-setsize`/`aria-posinset` wymagane, gdy nie cały zbiór jest w DOM.

### Wniosek

Base UI nie daje drzewa, a jedyny mechanizm wspólny (`CompositeRoot`) to API wewnętrzne bez gwarancji semver i bez typeahead. Tabs Base UI łamie Q9 tak samo jak RadioGroup. Toolbar nie ma zaznaczenia, więc Q9 go nie dotyczy.

### Rekomendacja

- Własny `lib/collection` przed Tabs i Tree: lista elementów z DOM (kolejność dokumentu), roving `tabIndex`, orientacja, kierunek (z Base UI `DirectionProvider` lub atrybutu `dir`), Home/End, PageUp/PageDown dla list, typeahead, pomijanie wyłączonych, zawijanie; drzewo dokłada prawo/lewo według APG. Zaznaczenie przez atrybuty na elementach DOM (bez kontekstu, Q9), jak `single-choice`.
- Base UI `Toolbar` dla pasków narzędzi (gotowe zachowanie, zgodne z Q9).
- Nie importować `internals/composite`.

### Odrzucone

- `internals/composite`: API wewnętrzne.
- Base UI `Tabs`: Q9.

### Test

Vitest na module (strzałki w obu orientacjach i RTL, Home/End, typeahead, wyłączone, zawijanie); Playwright: Tree z 3 poziomami według APG; B3: zmiana zaznaczenia = commity tylko starego i nowego elementu (albo 0 przy zapisie atrybutów).

______________________________________________________________________

## 13. G13: oś `profile` i cechy urządzenia

### Fakty

- `hover`/`any-hover`: Chrome 38/41 / Safari 9; `pointer`/`any-pointer`: Chrome 41 / Safari 9. MDN: `pointer` sprawdza urządzenie **główne**, `any-pointer` każde dostępne; „More than one value can match if the available devices have different characteristics.”
- Kod Tessery: `profile=web` zmienia tylko kursor (`engines/state.css:29-36`), profil typografii tylko `desktop` (`engines/type.css:23`); spec W19 (profil krojów) i W21 (kursor według profilu) używają tego samego słowa.
- NIEWIADOMA: jak WebView2 na laptopie z ekranem dotykowym i touchpadem raportuje `pointer` w trybie tabletu Windows. Chromium raportuje cechy urządzeń wejścia systemu, więc na typowym laptopie `pointer: fine` i `any-pointer: coarse` jednocześnie [WNIOSEK z definicji MDN, bez sondy].

### Rekomendacja

- `data-platform` (`app`, `web`): kursor (W21), zaznaczanie tekstu w UI, ewentualnie zachowania okna.
- `data-typeset` (W19): zestaw krojów i presety tekstu.
- Dotyk i hover zostają zapytaniami `@media` (`hover: hover` już jest; `pointer: coarse` dla obszaru trafienia), bo to cecha urządzenia, nie wybór motywu.

### Test

Kontrakt osi (obie osie mają reguły w silnikach), Playwright z `hasTouch` i `isMobile: false` dla obszaru trafienia.

______________________________________________________________________

## 14. Inne techniki 2026 (tylko te, które zmniejszają złożoność)

| Technika                                   | Chromium / Safari | Werdykt                                   | Powód                                                                                                      |
| ------------------------------------------ | ----------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `field-sizing: content`                    | 123 / 26.2        | **przyjąć** dla Textarea i pola rosnącego | usuwa pomiar JS (Q7); fallback w Safari < 26.2: stała wysokość                                             |
| `scrollbar-gutter: stable`                 | 94 / 18.2         | **przyjąć** w przewijanych powierzchniach | brak skoku treści, gdy pojawia się pasek (popup z G1)                                                      |
| `scrollbar-width: thin`                    | 121 / 18.2        | przyjąć jako słowo na białej liście       | jeśli pasek „lane” (F15) nie zastępuje natywnego                                                           |
| `scrollbar-color`                          | 121 / 26.2        | opcjonalnie                               | w forced colors i tak `auto`                                                                               |
| `text-wrap: balance` / `pretty`            | 114/117 / 17.5/26 | **przyjąć** w przepisie `text`            | zero kosztu, lepsze łamanie                                                                                |
| `@starting-style`                          | 117 / 17.5        | **przyjąć** dla dialogu i toastu          | wejście bez JS i bez `requestAnimationFrame`                                                               |
| `light-dark()`                             | 123 / 17.5        | opcjonalnie                               | upraszcza zapis wartości per tryb i sekcje odwrócone, ale generator pisze bloki per tryb                   |
| `content-visibility: auto`                 | 85 / 26           | przyjąć (Q12)                             | uwaga: tworzy blok zawierający (MDN), nie stosować na przodkach portali                                    |
| `progress()`                               | 138 / 26          | nie teraz                                 | patrz §2                                                                                                   |
| `sibling-index()`                          | 138 / 26.2        | nie teraz                                 | brak potrzeby w fundamencie (opóźnienia kaskadowe to ruch wejścia, W16)                                    |
| `corner-shape`                             | 139 / Preview     | zostaje jak W3                            | stopniowe ulepszenie za `@supports` (już w `shape.css:70`)                                                 |
| `interpolate-size`, `calc-size()`          | 129 / brak        | **odrzucić**                              | brak w Safari; animacja rozmiaru łamie Q3                                                                  |
| View Transitions dokumentu                 | 111 / 18          | nie w fundamencie                         | Tessera ma własny silnik ruchu; element-scoped tylko Chrome 147                                            |
| `@scope`                                   | 118 / 26.4        | **odrzucić**                              | zakres selektorów pilnuje strażnik (`recipeScope`), drugi mechanizm nic nie usuwa                          |
| `if()`, typowane `attr()`, `@custom-media` | Chromium / brak   | **odrzucić na dziś**                      | brak w Safari                                                                                              |
| `prefers-reduced-transparency`             | 118 / brak        | tylko Chromium                            | G23: na Windows działa, na macOS WebKit nie wystawia; materiał `solid` za zapytaniem bez szkody dla Safari |
| `accent-color`                             | 93 / 26.2         | nie                                       | natywne checkboxy będą stylowane przez przepis; `accent-color` daje tylko kolor                            |
| `appearance: base-select`                  | 135 / 27          | nie                                       | Select idzie przez Base UI (U18)                                                                           |
| CSS Anchor Positioning                     | 125 / 26          | nie teraz                                 | §1                                                                                                         |

______________________________________________________________________

## Sprzeczności i niewiadome

- **WebView2 a `forced-colors`:** nie znalazłem dokumentacji Microsoft, która wprost potwierdza, że WebView2 podąża za motywem kontrastowym Windows. Chromium go wspiera, Edge też; dla WebView2 to wniosek. Sprawdzenie: włączyć motyw kontrastowy Windows i otworzyć desktop.
- **WKWebView a wersja Safari:** Tauri pisze, że WKWebView jest aktualizowany razem z systemem i że niewspierane wersje macOS nie dostają aktualizacji WebKit. Nie znalazłem źródła Apple, które mówi wprost, że osobna aktualizacja Safari na Sonomie podnosi WebKit dla wszystkich aplikacji (to praktyka obserwowana, nie dokument). Sprawdzenie na maszynie: wersja z `/System/Library/Frameworks/WebKit.framework/Resources/Info.plist` (komenda z dokumentacji Tauri „Webview Versions”).
- **Pamięć warstwy przy DPR 1,5:** brak pomiaru (§9).
- **Material 3 tokeny** pochodzą z Material Web `v0_192` (2023); wymiary M3 Expressive (2025) mogą się różnić. Nie zmienia to rekomendacji (wzór „geometria z jednej wysokości”).
- **Re-render Tabs Base UI** to wniosek z kodu, bez pomiaru B3.
- **shadcn typografia:** opis z wiedzy ogólnej, strona nie otwierana.

## Rekomendowane odpowiedzi na D-A…D-F

- **D-A (typografia): szósty przepis `text`.** Uzasadnienie: tekst poza kontrolką ma co najmniej 8 konsumentów (G4), a sloty w trzech przepisach to ta sama reguła w trzech miejscach (I2). Radix Themes rozwiązuje to osobnym `Text`/`Heading`, Base UI nie ma nic. `text-box` (Chrome 133 / Safari 18.2) daje trim bez emulacji. Koszt: zmiana U10 („pięć przepisów” → sześć), 1 plik, 3–6 wyjść `type`.
- **D-B (ton): tak, `data-tone` obok wariantu; statusy dostają wartości ciemne.** Uzasadnienie: wzór Fluent (Badge `appearance` × `color`) i Apple (rola `destructive`, kolory systemowe z czterema wartościami) unika mnożenia wariantów, które widać w shadcn (`destructive` jako wariant). W6 wymaga wartości jasnej i ciemnej, a W7 dotyczy żywości, nie liczby wartości, więc konfliktu nie ma: generator daje żywe statusy w obu trybach. Wymaga `color-mix()` na liście funkcji przepisu.
- **D-C (warstwa pigułki): warstwa na czas aktywności grupy, nie stała.** Uzasadnienie: Blink i WebKit kompozytują element na czas trwającej animacji transform bez `will-change`; MDN odradza `will-change` w arkuszu na stałe; Motion trzyma warstwę dopiero od pierwszego ruchu. B7 liczy warstwy w spoczynku (cel 0 pigułek) i maksimum w trakcie interakcji. Jeśli pomiar T1 nie pokaże różnicy, zrezygnować z `will-change` całkowicie.
- **D-D (fokus pola): tak, pole pokazuje fokus po kliknięciu.** Uzasadnienie: przeglądarki celowo dopasowują `:focus-visible` do pól tekstowych po kliknięciu (MDN, sonda audytu), a Tessera to dziś nadpisuje własną bramką. WCAG 2.4.7 tego nie wymaga (wystarcza tryb klawiatury), ale Understanding nazywa to dobrą praktyką, a pole bez ramki (W9) nie ma innego sygnału. Jedna zmiana: wariant `field` poza bramką `data-input`.
- **D-E (kontenery i profil): tak, zamknięta lista 3 literałów i rozdział osi.** Uzasadnienie: `var()` nie działa w warunku zapytania (MDN), `@custom-media` nie ma w Chromium ani Safari, zakresy w style queries nie ma w Safari, a build Tessery nie transformuje CSS. Oś `profile` rozdzielić na `data-platform` (W21) i `data-typeset` (W19); dotyk i hover zostają w `@media`.
- **D-F (pętle i toast): `@keyframes` z białej listy w silniku `motion`; toast z krótkim wejściem `translate` + `opacity`.** Uzasadnienie: oba mechanizmy są kompozytorowe dla `transform`/`opacity`, ale `@keyframes` działa przed hydratacją i przy ograniczonym ruchu bez kodu JS; WAAPI zostaje dla ruchu liczonego z geometrii (pigułka, przelot). Easing bez `linear()` (WebKit bug 312407, Q5). Toast nie wyskakuje z triggera, więc nie jest „popupem z niczego” z W16; wejście ułatwia zauważenie komunikatu, a przy ograniczonym ruchu zostaje samo krycie. Decyzja o toaście należy do właściciela.

## Źródła (dostęp 2026-10-31)

- MDN browser-compat-data, gałąź `main`: https://github.com/mdn/browser-compat-data (pliki `css/types/{attr,if,progress,anchor-size,color,calc-size,sibling-index,corner-shape-value,easing-function}.json`, `css/at-rules/{property,container,custom-media,media,position-try,starting-style,scope,view-transition,keyframes}.json`, `css/properties/{…}.json`, `css/selectors/{focus-visible,has,user-invalid,open}.json`, `api/{Element,Document,Animation,CSS}.json`, `browsers/{chrome,edge,safari,webview_android}.json`); release v8.1.7 (2026-10-22).
- Apple: „About the security content of Safari 27” https://support.apple.com/en-us/149039 ; „…Safari 26.2” https://support.apple.com/en-us/125892 ; HIG Accessibility https://developer.apple.com/design/human-interface-guidelines/accessibility (dane: `developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json`); HIG Color (`…/color.json`).
- WebKit: „WebKit Features for Safari 27.0” https://webkit.org/blog/18325/webkit-features-for-safari-27-0/ ; 27.1 https://webkit.org/blog/18486/webkit-features-for-safari-27-1/ ; 27.2 https://webkit.org/blog/18515/webkit-features-for-safari-27-2/ ; bug 312407 https://bugs.webkit.org/show_bug.cgi?id=312407 ; `Source/WebCore/rendering/RenderLayerCompositor.cpp` (GitHub `WebKit/WebKit`, `main`).
- Chromium: `third_party/blink/renderer/platform/graphics/compositing_reasons.h` (chromium.googlesource.com, `main`).
- Tauri: Webview Versions https://v2.tauri.app/reference/webview-versions/
- MDN: `var()` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var ; `forced-colors` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors ; `<system-color>` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color ; `will-change` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change ; `:focus-visible` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible ; `any-pointer` https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/any-pointer ; Containing block https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block
- CSSWG: Media Queries 5 (`@custom-media`) https://drafts.csswg.org/mediaqueries-5/
- W3C WAI: Understanding 2.4.7 https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html ; 2.4.13 https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html ; 2.5.8 https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; APG Tree View https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
- Base UI 1.9.0 (paczka w worktree): `docs/react/components/{menu,select,tabs,toolbar,toggle,toggle-group,switch,slider,progress,field,toast}.md`, `docs/react/overview/releases/v1-9-0.md`, `utils/CommonPositionerCssVars.d.ts`, `internals/composite/**`, `progress/indicator/ProgressIndicator.js`, `slider/thumb/SliderThumb.js`, `tabs/tab/TabsTab.mjs`, `toggle/Toggle.mjs`, `toolbar/root/ToolbarRoot.mjs`; issue #3327 https://github.com/mui/base-ui/issues/3327
- Floating UI: `@floating-ui/react-dom` 2.1.9 `dist/floating-ui.react-dom.mjs:217-221` (worktree).
- Radix Themes (`radix-ui/themes`, `main`): `components/{dropdown-menu.tsx,theme.tsx,switch.css,text.props.tsx,_internal/base-button.props.ts}`, `props/color.prop.ts`, `styles/utilities/leading-trim.css`; Radix Colors `src/{light,dark}.ts`.
- Fluent UI v9 (`microsoft/fluentui`, `master`): `react-switch/…/useSwitchStyles.styles.ts`, `react-tabs/…/useTabStyles.styles.ts`, `react-badge/…/Badge.types.ts`, `react-message-bar/…/MessageBar.types.ts`, `react-button/…/Button.types.ts`.
- shadcn/ui (`apps/v4/registry/new-york-v4/ui/{button,badge}.tsx`, `main`).
- Material Web tokeny `tokens/versions/v0_192/_md-comp-{switch,slider,checkbox,linear-progress-indicator}.scss`, `_md-sys-color.scss`.
- Motion (`motiondivision/motion`, `main`): `packages/framer-motion/src/value/use-will-change/WillChangeMotionValue.ts`, `__tests__/will-change.test.tsx`, `packages/motion-dom/src/value/will-change/add-will-change.ts`.
- Kod Tessery (worktree `e2`, stan 2026-10-31): `packages/tessera/tsdown.config.ts`, `src/engines/{color,focus}.css`, `src/recipes/focus.css`, `src/lib/{indicator,input-modality}.ts`, `test/guards/css-layers.ts`.
