# E2: fakty z v2 o kolorze, typografii i kaskadzie motywu

Stan: working tree MangaShift, branch `refactor/tessera-motion`, sprawdzone 2026-10-31. Ścieżki względem `MangaShift/tessera/packages/tessera/` (dalej „v2”). Linie odnoszą się do tego stanu plików. Raport opisuje, co jest w kodzie; ocena należy do prowadzącego.

## 1. Paleta

### Źródło wartości

- **Akcenty to paleta Tailwind v4, nie Apple ani Radix.** `ACCENT_SHADES` (`src/lib/theme-data.ts:307-327`) ma dla każdego koloru trzy odcienie `bright` / `main` / `dim`, a te odpowiadają krokom Tailwind `400` / `500` / `700`. Sprawdzone porównaniem z `node_modules/tailwindcss/theme.css` (tailwindcss 4.3.3): red 400/500/700 (`:14,15,17`), amber 400/700 (`:38,41`), blue 400/700 (`:134,137`), zinc 400/500/700 (`:242,243,245`) zgadzają się co do znaku. Pozostałych kolorów nie porównywałem pojedynczo, ale wzór jest ten sam. W kodzie nie ma komentarza o źródle.
- **Neutralne kolory (tła, tekst, obrysy) to ręcznie wpisane literały** hex/rgb w `src/styles/colors.css:84-252`, bez komentarza o źródle. W kodzie v2 nie ma rampy Apple ani Radix. Nazwy w stylu Apple (`label`, `secondary-label`, `inverse-background` itd.) i rodziny Radix 3.0.0 są w prototypie poza kodem v2: `MangaShift/docs/plans/ui-kit/prototypes/colors-v7-opus-a-tokens.js:1,62-64,126-127`. Tam `#fdfdfe` i `#141417` też się pojawiają.
- Statusy: `--success` `oklch(72.3% 0.219 149.579)` = green-500, `--warning` `oklch(70.5% 0.213 47.604)` = orange-500, `--info` `oklch(62.3% 0.214 259.815)` = blue-500, `--destructive` `oklch(63.7% 0.237 25.331)` = red-500 (`colors.css:102,145-147`). To te same wartości co `main` w `ACCENT_SHADES`.

### Nazwy i rampy

- `ACCENTS` (`theme-data.ts:3-24`) ma 20 wartości: `contrast` oraz 19 kolorowych: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, zinc.
- **Rampy wielostopniowej nie ma.** Każdy kolorowy akcent ma 3 odcienie (`AccentShades`, `theme-data.ts:301-305`), wszystkie w formacie `oklch(L% C H)`. Odcienie są wspólne dla jasnego i ciemnego trybu: generator wstawia te same wartości w `[data-accent-color=X]` i `.dark[data-accent-color=X]` (`scripts/generate-colors.ts:58-77,100-105`).
- Neutralne kolory są w hex i `rgb(... / a)`, osobno dla `:root` (jasny) i `.dark`.

### Tryb Contrast

`CONTRAST_SHADES` (`theme-data.ts:338-355`) ma osobne wartości dla jasnego i ciemnego trybu: `main`, `hover`, `press`, `foreground`, `mark`, `ring`.

| tryb  | main                         | hover                        | press                        | foreground                   | mark               | ring                               |
| ----- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ------------------ | ---------------------------------- |
| light | `oklch(19.3% 0.006 285.823)` | `oklch(29.5% 0.009 285.837)` | `oklch(36.2% 0.009 285.966)` | `oklch(99.4% 0.001 286.376)` | `oklch(100% 0 0)`  | `oklch(19.3% 0.006 285.823 / 0.6)` |
| dark  | `oklch(94.3% 0 0)`           | `oklch(89.8% 0 0)`           | `oklch(84.5% 0 0)`           | `oklch(13.4% 0 0)`           | `oklch(13.4% 0 0)` | `oklch(94.3% 0 0 / 0.7)`           |

Contrast różni się od akcentów kolorowych (`contrastDeclarations`, `generate-colors.ts:79-98`):

- `--primary-action*` to pełne wypełnienie (`var(--primary)`);
- `--primary-subtle` i `--primary-fill-*` to atrament `--ink-*`, nie tint akcentu;
- `--primary-glow` ma wartość `transparent`.

W akcentach kolorowych `--primary-action*` to tint (`--primary-subtle`), a etykieta ma kolor `var(--primary)` (`generate-colors.ts:69-73`).

### Pary `on-`

Prefiksu `on-` w v2 nie ma. Parę z kolorem tekstu tworzy przyrostek `-foreground`: `--primary-foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`, `--muted-foreground`, `--chip-foreground`, `--primary-action-foreground`, `--scrim-foreground`.

`--primary-foreground` dla akcentu liczy generator. Gdy jasność `main` w OKLCH przekracza 65%, tekst jest ciemny: `oklch(15% 0 0)`. W przeciwnym razie jest biały: `oklch(100% 0 0)` (`generate-colors.ts:18-20,54-56`). Kontrastu WCAG generator nie liczy.

### Generator

`scripts/generate-colors.ts` wywołuje się ręcznie (`bun scripts/generate-colors.ts`, `import.meta.main`, `:170-172`). Nie jest częścią builda, bo `ensure-build.ts` uruchamia tylko `generate-docs`. Generator zapisuje dwa pliki:

1. `src/styles/accents.css`: 40 bloków (20 akcentów × light/dark), po 18 deklaracji `--primary*` i `--ring` (`renderAccentsCss`, `:107-110`). Nagłówek pliku mówi „from lib/theme.ts”, ale źródło to `theme-data.ts` (`:37`), więc nagłówek się rozjechał ze źródłem.
2. `src/lib/theme-colors.ts`: `THEME_COLORS` z `--background` każdego presetu, przeliczonym na hex przez `culori`. Generator czyta wartość parserem bloków `colors.css` (`renderThemeColors`, `parseCssBlocks`, `:112-163`). Wynik to `mangashift` `#fdfdfe` / `#080808` i `mangashift-site` `#fdfdfe` / `#09090b` (`theme-colors.ts:4-7`). Te wartości trafiają do `<meta name="theme-color">`.

Strażnik `test/generate-colors.test.ts` porównuje wygenerowany wynik z plikiem w repo i sprawdza 18 ról (`ACCENT_ROLES`) oraz kroki presetów (`PRESET_STEPS`). Wzory pomocnicze w generatorze:

- tint: `color-mix(in srgb, var(--primary) var(--tint-*), transparent)` (`:44-46`);
- hover i press wypełnienia: `color-mix(in oklch, var(--primary), var(--foreground) var(--solid-hover|press))` (`:66-67`);
- glow: alfa 0.35 (`:21`).

### Drabinka stanów: kod v2 a W8

Wartości z kodu (`colors.css`, `presets/mangashift-site.css:7-9`):

| zmienna                           | light                                              | dark                                                 | mangashift-site        |
| --------------------------------- | -------------------------------------------------- | ---------------------------------------------------- | ---------------------- |
| `--tint-rest / hover / press`     | 10% / 16% / 24% (`:85-87`)                         | 18% / 24% / 30% (`:170-172`)                         | rest 12% w obu trybach |
| `--tint-border`                   | 25% (`:52`)                                        | 25%                                                  | 30%                    |
| `--ink-rest / hover / press`      | `rgb(116 116 127 / 0.1 / 0.15 / 0.2)` (`:106-108`) | `rgb(139 139 139 / 0.12 / 0.17 / 0.22)` (`:191-193`) | brak nadpisania        |
| `--solid-hover` / `--solid-press` | 12% / 22% (`:56-57`)                               | jak light                                            | brak nadpisania        |
| `--selection-mix`                 | 30% (`:58`)                                        | jak light                                            | 24%                    |

**Wartości z kodu są inne niż w W8** (atrament 4/7/10 light i 8/12/16 dark, akcent 8/16/24 i ramka 25%). Tint rest preset strony nadpisuje w obu trybach, bo `presets/*.css` jest importowany po `colors.css` (`globals.css:16-18`), a selektory mają tę samą wagę.

## 2. Role semantyczne

- Blok jasny (`colors.css:84-167`) i ciemny (`:169-252`) mają po **78** deklaracji o identycznym zestawie nazw. Komentarz w `:1` tłumaczy, że zmienne niezależne od trybu siedzą w osobnym bloku `:root`, żeby oba zestawy pozostały równe.
- Blok niezależny od trybu (`:2-73`) ma **58** deklaracji. Są w nim marka, wiązki, kolory detekcji, editor-demo, scrim, kroki stanów, `--destructive-*`, `--status-*` i `*-vivid`.
- Generator dokłada **18** ról akcentu (`accents.css`).
- `@theme inline` wystawia do Tailwinda **75** aliasów `--color-*` (`:408-484`).

Grupy ról z jasnego i ciemnego bloku:

| grupa                  | zmienne                                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| powierzchnie           | `--background`, `--card`, `--popover`, `--secondary`, `--muted`, `--card-surface`, `--card-nested`, `--card-raised`, `--panel`, `--chip`, `--glass`, `--glass-subtle`, `--window-background-transparent` |
| tekst                  | `--foreground`, `--*-foreground` (card, popover, secondary, accent, chip), `--muted-foreground`, `--dim-foreground`, `--faint-foreground`, `--primary-text`                                              |
| obrysy                 | `--border`, `--border-strong`, `--input-border(-hover)`, `--control-border`, `--row-border`, `--card-border(-hover)`, `--card-nested-border`, `--panel-border`, `--glass-border(-subtle)`                |
| wypełnienia interakcji | `--accent` (to neutralny hover w stylu shadcn, nie akcent), `--input`, `--ink-*`, `--fill`, `--control`, `--control-hover`, `--row`, `--tube-fill`                                                       |
| cienie                 | `--card-shadow`, `--chip-shadow`, `--thumb-shadow`                                                                                                                                                       |
| statusy                | `--destructive`, `--warning`, `--success`, `--info`, `--*-container`, `--destructive-glow`, `--status-success(-subtle/-border)`                                                                          |
| domenowe               | `--track-audio`, `--track-caption`, `--chart-1..8`, `--editor-demo-checker-*`, `--scrollbar-thumb(-hover)`, `--disabled-opacity`                                                                         |

Role akcentu (`generate-colors.test.ts`, `ACCENT_ROLES`):

- `--primary`, `-foreground`, `-bright`, `-dim`, `-glow`;
- `-hover`, `-press`;
- `-subtle`, `-fill-hover`, `-fill-press`, `-border`;
- `-action`, `-action-hover`, `-action-press`, `-action-foreground`, `-action-border`;
- `-mark`, `--ring`.

Inne nadpisania kolorów:

- `[data-neon=mini|full]` i `[data-transparency=on]` zmieniają `--card-surface`, `--glass*` i `--card-border/shadow` (`colors.css:255-289`).
- Preset `mangashift-site` nadpisuje około 40 ról w obu trybach (`:300-382`). Nadpisuje też `--accent` wewnątrz klas `cn-*` (`:384-398`) i `--ring` przy akcencie violet (`:400-406`).

Najciemniejsze tła: desktop `#080808`, strona `#09090b`, karta strony `#101012`, karta desktopu `#121212` (`:175,177,343,345`). Tło jasne to `#fdfdfe` (`:90`).

## 3. Fonty

### Pliki i dołączanie

- Paczka zależy od `@fontsource-variable/inter`, `sora`, `cascadia-code` i `@fontsource/lato` (`package.json:86-89`).

- `globals.css:19-22` importuje index.css tych trzech paczek variable oraz tylko `@fontsource/lato/latin-900.css`.

- Format: `woff2` z `format('woff2-variations')` i `font-display: swap`, podzielone na podzbiory `unicode-range`. Zakresy osi wagi:

  - Inter Variable 100–900 (42 pliki, także osie opsz i italic);
  - Sora Variable 100–800 (2 pliki: latin, latin-ext);
  - Cascadia Code Variable 200–700 (20 plików).

  Lato 900 ma woff2 i woff. Wszystko pochodzi z `node_modules/@fontsource*/…/index.css`.

- Pozostałe 24 fonty z `FONTS` mają `dependency` na paczkę fontsource (`theme-data.ts:116-121`), **ale paczka ich nie importuje i nie ma ich w zależnościach.** Bez instalacji po stronie konsumenta stos `font-family` spada do `sans-serif`, `serif` albo `monospace`.

- `theme-panel.tsx:390-412` (`availablePairings`) pokazuje tylko te pary krojów, których rodziny są zarejestrowane w `document.fonts`. Odświeża się na zdarzenia `loading` i `loadingdone`.

- Strona `web` dodatkowo preloaduje pliki fontów (`web/src/app/layout.tsx:65`, `FONT_FILES`).

### Fallbacki z metrykami

`src/styles/font-fallbacks.css:1-49` definiuje `@font-face` z `local('Arial')` albo `local('Arial Bold')`:

| rodzina        | wagi                 | size-adjust | ascent  | descent | line-gap |
| -------------- | -------------------- | ----------- | ------- | ------- | -------- |
| Inter Fallback | 100–599              | 106.7%      | 90.79%  | 22.61%  | 0%       |
| Inter Fallback | 600–900              | 101.8%      | 95.16%  | 23.69%  | 0%       |
| Sora Fallback  | 100–599              | 112.2%      | 86.45%  | 25.85%  | 0%       |
| Sora Fallback  | 600–900              | 107.3%      | 90.4%   | 27.03%  | 0%       |
| Lato Fallback  | 100–900 (Arial Bold) | 98.2%       | 100.51% | 21.69%  | 0%       |

### Lista i definicje

- `FONTS` (`theme-data.ts:26-58`) ma 31 fontów: 20 sans, 7 serif, 4 mono.
- `FONT_DEFINITIONS` (`:123-190`) przypisuje każdemu fontowi `title`, `type`, `family` i `dependency`. `dependency: null` mają `system`, `segoe-ui` i `system-mono`.
- `FONT_PAIRINGS` (`:192-214`) ma 10 par, każda z polami `font`, `fontHeading` i `fontMono`.
- Domyślne stosy w `scale.css:31-35`:
  - `--font-sans` = stos Inter;
  - `--font-heading: var(--font-sans)`;
  - `--font-mono` = stos Cascadia;
  - `--font-logo` = `'Lato', 'Lato Fallback'`, waga 900.

### Generator fontów

`scripts/generate-fonts.ts` tworzy `src/styles/fonts.css`. Dla każdego fontu powstają trzy reguły:

- `[data-font=X]` ustawia `--font-sans`;
- `[data-font-heading=X|inherit]` ustawia `--font-heading`;
- `[data-font-mono=X]` ustawia `--font-mono`.

Każdy font może więc być fontem mono i odwrotnie (`fonts.css:324,332`). Strażnik `test/generate-fonts.test.ts:12` porównuje wynik z plikiem w repo.

### Nazwa fontu jego krojem

`FontName` renderuje `<span data-font={font}>{title}</span>` (`theme-panel.tsx:250-252`). Reguła `[data-font]` z `fonts.css` ustawia na tym spanie `--font-sans`, a `base.css:40-42` (`[data-font] { font-family: var(--font-sans) }`) nakłada ten krój. Ten sam selektor działa na `<html>`.

## 4. Typografia

Stopnie UI (`scale.css:37-49`) i dwa stopnie spoza tej skali:

| token                                        | rozmiar   | interlinia |
| -------------------------------------------- | --------- | ---------- |
| `--type-mini`                                | 0.625rem  | 0.875rem   |
| `--type-small`                               | 0.6875rem | 0.9375rem  |
| `--type-detail`                              | 0.75rem   | 1rem       |
| `--type-body`                                | 0.8125rem | 1.125rem   |
| `--type-title`                               | 0.9375rem | 1.25rem    |
| `--type-screen-title`                        | 1.25rem   | 1.75rem    |
| `--type-label-size` (`tokens.css:7-8`)       | 0.6875rem | 1rem       |
| `--surface-title-font` (`scale.css:486-487`) | 0.875rem  | 1.25rem    |

Skala rozmiarów kontrolek `[data-size=xs|sm|md|lg|xl]` (`scale.css:411-480`) mapuje `--size-font` na stopnie mini, small, detail, body i title. Wartością domyślną jest `lg`, czyli `:root`.

Skala strony (`scale.css:50-60`):

- `--display-hero-size: clamp(2.75rem, 0.9rem + 7.6vw, 5.25rem)`;
- `--display-section-size: clamp(2rem, 1.125rem + 3vw, 3.5rem)`;
- interlinia display 1 (sekcja 1.05), tracking -0.035em;
- eyebrow 0.75rem, tracking 0.14em;
- lead 1.125rem, interlinia 1.5;
- `--tracking-caps: 0.04em`.

`scale.css` zawiera też wiele tokenów typografii pojedynczych sekcji. Według specyfikacji te tokeny nie przechodzą do v3.

Wagi: `[data-weight]` ustawia `--weight-regular / medium / semibold`, `--display-weight` i `--icon-stroke`:

| wybór                         | regular / medium / semibold | display | icon-stroke |
| ----------------------------- | --------------------------- | ------- | ----------- |
| regular (`scale.css:490-497`) | 400 / 500 / 600             | 600     | 1.8         |
| medium (`settings.css:32-39`) | 450 / 550 / 650             | 650     | 2           |
| bold (`settings.css:41-48`)   | 500 / 600 / 700             | 700     | 2.2         |

Presety prose: `[data-prose]` albo klasa `.typeset-*` (`scale.css:506-531`):

| prose                                 | size      | leading | flow   |
| ------------------------------------- | --------- | ------- | ------ |
| default                               | 1em       | 1.75    | 1.25em |
| compact                               | 0.875rem  | 1.6     | 1em    |
| docs                                  | 0.9375rem | 1.75    | 1.5em  |
| reading                               | 1.125rem  | 1.9     | 2em    |
| `.typeset-chat` (`typeset.css:28-32`) | 1em       | 1.6     | 1em    |

Klasa `.typeset` (`typeset.css:19-49` i dalej) działa tak:

- rozmiar to `--typeset-size × 1.125` poniżej 48rem, a od 48rem i w druku samo `--typeset-size`;
- nagłówki h1–h6 mają rozmiary 1.75 / 1.25 / 1.125 / 1 / 0.875 / 0.8125em i interlinie 1.3 / 1.4 / 1.45 / 1.5 / 1.5 / 1.5;
- h6 jest pisany wersalikami z rozstrzeleniem 0.08em;
- nagłówki biorą `--font-heading`, a kod `--font-mono`.

Liczby tabelaryczne: `font-variant-numeric: tabular-nums` dostaje lista selektorów komponentów i `[data-numeric]` (`typeset.css:2-17`).

## 5. Kaskada motywu

### 16 osi (`Choices`, `theme-data.ts:216-233`)

| oś              | atrybut na `<html>`                    | wartości                                  | domyślne `mangashift` | domyślne `mangashift-site` |
| --------------- | -------------------------------------- | ----------------------------------------- | --------------------- | -------------------------- |
| mode            | klasa `.dark` i `style.colorScheme`    | light, dark, system                       | system                | dark                       |
| accent          | `data-accent-color`                    | 20 (sekcja 1)                             | contrast              | violet                     |
| font            | `data-font`                            | 31                                        | inter                 | inter                      |
| fontHeading     | `data-font-heading`                    | inherit + 31                              | inherit               | sora                       |
| fontMono        | `data-font-mono`                       | 31                                        | cascadia-code         | system-mono                |
| weight          | `data-weight`                          | regular, medium, bold                     | regular               | regular                    |
| prose           | `data-prose`                           | compact, docs, default, reading           | default               | default                    |
| corners         | `data-corners`                         | none, sm, md, lg, full                    | full                  | full                       |
| curve           | `data-curve`                           | round, squircle                           | squircle              | round                      |
| density         | `data-density`                         | compact, snug, default, relaxed, spacious | compact               | compact                    |
| scale           | `data-scaling` (wyjątek opisany niżej) | 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5         | 1                     | 1                          |
| panelBackground | `data-panel-background`                | solid, translucent                        | translucent           | solid                      |
| transparency    | `data-transparency`                    | off, on                                   | off                   | off                        |
| windowControls  | `data-window-controls`                 | platform, dots                            | platform              | platform                   |
| sliding         | `data-sliding`                         | elastic, firm, off                        | elastic               | elastic                    |
| neon            | `data-neon`                            | off, mini, full                           | off                   | off                        |

Źródła tabeli: wartości `theme-data.ts:1-88`, domyślne `PRESET_CHOICES` (`:235-272`), atrybuty `CHOICE_ATTRIBUTES` (`:274-290`).

Atrybuty stanu, które nie są wyborami (`STATE_ATTRIBUTES`, `:292-297`):

- `data-preset`;
- `data-platform` (windows, macos, linux, web);
- `data-window-focused`;
- `data-window-maximized`. Tego atrybutu nie czyta żaden plik CSS w `src` (grep).

Prawie wszystkie osie trafiają do pliku CSS z regułą `[data-…]`. Kolor obsługują `accents.css` i `colors.css`, fonty `fonts.css`, weight, prose i density `scale.css` i `settings.css`, pozostałe osie `settings.css:78-181`.

### Mechanizm

1. **Domyślne → motyw.** Osobnej warstwy „domyślne” nie ma: `PRESET_CHOICES[preset]` to pełny zestaw 16 wartości.
2. **Zapis.** `resolveChoices` łączy preset z zapisem: `{ ...config.presets[preset], ...saved }` (`theme-store.ts:38-40`).
3. **System.** System wpływa tylko na oś mode. `mode: 'system'` rozstrzyga `matchMedia('(prefers-color-scheme: dark)')` (`:44`), a provider nasłuchuje `change` (`theme-provider.tsx:200,208`).
4. **Zapis w localStorage.** Klucz to `tessera-appearance` (`theme-data.ts:299`), rekord `{ version: 2, choices }` (`theme-store.ts:124`). Odczyt przyjmuje wersję 1 albo 2 (`:102`). Każda wartość przechodzi walidację względem `THEME_CONFIG.values`, a niepoprawne są odrzucane pojedynczo (`:86-96`). Błąd dostępu do storage połyka się i rozróżnia go od braku rekordu (`:109-132`).
5. **Migracje legacy w kodzie.** `createChoiceStorage` zawiera mapy `legacyCorners` (`radius` / `controlRadius` → `corners`, `xl` → `full`), `legacyFonts` (`mono` / `segoe` / `serif`) i zamianę `density: comfortable` → `default` (`:61-84`).
6. **Zapis na `<html>`.** `applyTheme` (`:42-58`) ustawia `data-preset` i wszystkie `CHOICE_ATTRIBUTES` oprócz `scale`. Dalej przełącza klasę `.dark`, ustawia `style.colorScheme`, a jeśli trzeba, tworzy `<meta name="theme-color">` z `THEME_COLORS[preset][mode]`.
7. **Wyjątek `scale`.** `data-scaling` ustawia dopiero provider po zastosowaniu zoomu przez adapter (`theme-provider.tsx:72-75,107-110`). Kolejka zoomu jest w `theme-store.ts:139-185`. Gdy adapter rzuci błąd, fallbackiem jest `root.style.zoom`, a wynik trafia do `--css-zoom`.

### Anty-FOUC

`themeBootstrapScript(preset)` (`theme-bootstrap.ts:14-18`) serializuje `bootstrapTheme` oraz `createChoiceStorage`, `resolveChoices` i `applyTheme` przez `Function.toString`. Razem z nimi idzie JSON z presetem i `THEME_CONFIG`, w którym `<` jest escapowane do `<`. Ten sam kod uruchamia się więc w skrypcie inline i w runtime.

Skrypt trafia do strony na dwa sposoby:

- `<ThemeScript preset nonce?>`, czyli `<script dangerouslySetInnerHTML>` (`components/theme-script.tsx`). Używa go `web/src/app/layout.tsx:77`.
- Plugin Vite `tessera({ preset })` z hookiem `transformIndexHtml`, który wstrzykuje skrypt do `<head>` (`src/vite/index.ts`). Używa go `apps/gallery/vite.config.ts:7`.

Dla SSR `presetAttributes(preset)` (`lib/theme.ts:9-17`) zwraca statyczne atrybuty `data-*` presetu bez `scale`. Strona rozkłada je na `<html>` i ustawia `className="… dark"` (`web/src/app/layout.tsx:70-73`).

## 6. React kontra czysty CSS i atrybuty

**Czysty CSS:** całe wyprowadzenie wyglądu z atrybutów. Należą tu:

- `accents.css` i `colors.css`;
- `fonts.css`, `font-fallbacks.css`, `presets/*.css`;
- `settings.css`, `scale.css` (wagi, prose, size), `base.css`, `typeset.css`.

**Czysty JS bez Reacta, działa w skrypcie inline:**

- `theme-data.ts`, `theme-colors.ts`;
- `theme-store.ts` (`resolveChoices`, `applyTheme`, `createChoiceStorage`, kolejka zoomu);
- `theme-bootstrap.ts`, `lib/theme.ts` (`presetAttributes`, `importChoices`, `validateChoices`);
- plugin `src/vite/index.ts`, który zależy od typu `vite`.

**Zależne od Reacta** (`components/theme-provider.tsx`):

- store z `useSyncExternalStore` i `useTheme()`;
- akcje `setChoice`, `setChoices`, `reset` (zapisuje pusty rekord `{}` zamiast usuwać klucz, `:144-145`), `resetChoices`, `zoomIn` / `zoomOut` / `resetZoom`;
- synchronizacja między oknami przez zdarzenie `storage` (`:201-204`);
- nasłuch `prefers-color-scheme`;
- `data-window-focused`, `data-platform`, `data-window-maximized`;
- wstrzymanie zmiany `sliding`, dopóki trwają animacje `SLIDE_ANIMATION` (`:77-93`);
- ustawienie `data-scaling` po zoomie;
- `ShapeProvider` z `corners` i `curve` (squircle tylko przy `CSS.supports('corner-shape','squircle')`, `:185-196`);
- globalne instalatory: input-modality, press feedback, resize-close, scrollbar, click ring.

Komponent `ThemeScript` też jest reactowy, ale tylko opakowuje string.

## Do przeniesienia 1:1

- `ACCENT_SHADES`, czyli trójki Tailwind v4 400/500/700, i `CONTRAST_SHADES`, jeśli v3 przyjmie te źródła. Tabela jest wyżej.
- Metryki `font-fallbacks.css`, bo są zmierzone dla Arial i Arial Bold.
- Wybór paczek fontsource i formatu woff2 variable dla Inter, Sora i Cascadia Code (W13). Zostaje też Lato 900 dla logo.
- Mechanizm anty-FOUC: serializacja tych samych funkcji do skryptu inline i dwa sposoby wstrzyknięcia (komponent i plugin Vite). Do tego `presetAttributes` dla SSR i escapowanie `<`.
- Rozstrzyganie `{...preset, ...saved}`, walidacja każdej wartości zapisu osobno, rozróżnienie „storage niedostępny” od „brak rekordu” i synchronizacja przez zdarzenie `storage`.
- `FontName` przez `data-font` i regułę `[data-font] { font-family: var(--font-sans) }`.
- Presety prose (4 i chat) oraz trzy zestawy wag.

## Do przepisania

- **Paleta neutralna:** literały hex/rgb bez źródła (`colors.css:84-252`). W6 wymaga wartości ze źródeł Apple/Radix z nazwami w stylu Apple. Kod v2 tego nie spełnia; nazwy są w stylu shadcn (`--card`, `--muted`, `--accent`).
- **Rampy:** v2 ma 3 odcienie wspólne dla obu trybów. F5 wymaga ramp generowanych w buildzie, a generator v2 działa ręcznie, poza buildem, i pilnuje go tylko test zgodności z plikiem w repo.
- **Kroki stanów:** wartości v2 nie zgadzają się z W8 (tabela w sekcji 1).
- **Pary `on-`:** v2 używa przyrostka `-foreground`, a kolor tekstu na akcencie wybiera progiem L > 65%.
- **Fonty z `FONT_DEFINITIONS`:** 24 z 31 nie są dołączone do paczki. W19 wymaga profili, czyli par krojów.
- **`--accent`:** w v2 to neutralny hover w stylu shadcn, więc nazwa koliduje z akcentem z W6.
- **Nagłówek `accents.css`** wskazuje zły plik źródłowy.

## Nie przenosić (powód z kodu)

- Migracje `legacyCorners`, `legacyFonts`, `comfortable` i akceptacja `version: 1` (`theme-store.ts:61-84,102`). To kod zgodności wstecznej w produkcie; zgodnie z regułą „zero legacy” ewentualne dane przenosi jednorazowy skrypt.
- Role domenowe z `colors.css`: `--detection-*`, `--editor-demo-*`, `--beam-*`, `--track-*` (`:17-37,155-156,165-166`). Należą do aplikacji, nie do kitu.
- Nadpisania wewnątrz klas komponentów: `.cn-dialog-overlay` (`colors.css:291-297`) i `[data-preset="mangashift-site"] :is([class^="cn-"]…)` (`:384-398`). Specyfikacja nie przenosi CSS komponentów ani tokenów komponentów.
- Tokeny typografii sekcji ze `scale.css` (`--feature-tabs-*`, `--faq-split-*` itd.), wyłączone w specyfikacji („Nie przenosimy”).
- `data-window-maximized`: nie ma konsumenta CSS w `src`. Gdzie indziej nie sprawdzałem.

## Niewiadome

- Źródło neutralnych hexów v2 (`#fdfdfe`, `#141417`, `rgb(116 116 127)`, `#080808`): w kodzie brak informacji. Badania w `MangaShift/docs/plans/ui-kit/research/` (`colors-best-practices.md`, `component-colour-table.md`) cytują Apple i Radix dla innych wartości. Nie ustaliłem, czy te konkretne hexy z nich pochodzą.
- Nie porównałem pojedynczo wszystkich 19 trójek z Tailwindem. Sprawdziłem red, amber, blue i zinc oraz zgodność `main` z `-500` dla statusów.
- Wersji pakietów fontsource w lockfile nie sprawdzałem; `package.json` ma zakresy `^5.3.0`.
- W v2 nie ma oddzielnego profilu typografii (W19) ani presetów zachowania tekstu poza prose. Nie znalazłem nic więcej.
