# R1. Silniki i architektura tokenów dla Tessery v3

Stan na: 2026-10-30. Autor: subagent researcher (tylko odczyt). Źródła numerowane `[Sx]`, lista na końcu.

Etykiety: **F** fakt ze źródła (status: verified = źródło otwarte; supported = źródło wtórne lub port społeczności), **O** opinia źródła, **W** mój wniosek, **R** rekomendacja, **?** niewiadoma.

## 0. Odpowiedź w skrócie

| #   | Wniosek                                                                                                                                                                                                                                               | Typ                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | Dojrzałe systemy mają ten sam rdzeń: kolor, typografia, odstępy, kształt, głębia, ruch, ikony. Różnią się tym, czy rozmiar, stany, materiał i focus są osobnym działem, czy siedzą w innych.                                                          | W z tabeli 1              |
| 2   | v3 potrzebuje 9 silników: `color`, `type`, `size`, `space`, `shape`, `depth`, `state`, `focus`, `motion`. Ikony, obramowanie, z-index i materiał wchodzą jako wyjścia tych silników, nie osobne silniki.                                              | R                         |
| 3   | Silniki tworzą graf bez cykli. Kolejność: `color`, `type`, `motion`, `space` → `size` → `shape` → `depth` → `state`, `focus`.                                                                                                                         | W, tabela 9               |
| 4   | Najsilniejsza zależność: promień zagnieżdżony = promień rodzica minus jego padding (Apple, WWDC25). Druga: promień i kolor powierzchni rosną z poziomem głębi (Geist, M3).                                                                            | F [S16][S29][S6]          |
| 5   | Dwa poziomy publiczne (primitive ukryty w buildzie, semantic jako CSS vars) plus zmienne lokalne przepisu. Bez globalnych tokenów komponentu. To odchodzi od M3, Primer i Spectrum, które mają trzeci poziom component; kompromis opisany w sekcji 6. | R                         |
| 6   | Eksplozję zmiennych w v2 robią: tokeny konkretnych komponentów w `:root`, gotowe rampy na każdy akcent (40 presetów × ~17 ról) i osie motywu mnożone przez siebie.                                                                                    | W z v2                    |
| 7   | Osie motywu jako mnożniki i formuły (Radix: `--radius-factor`, `--scaling`), nie jako osobne zestawy wartości.                                                                                                                                        | F [S25], R                |
| 8   | Stany najtaniej i bez artefaktów: nakładka `::before` z `opacity` (state layer M3). Spełnia regułę właściciela „ruch tylko transform/opacity”. `color-mix` na tle wymaga repaintu przy przejściu.                                                     | W, F [S10]                |
| 9   | `@property` z `inherits: false` przyspiesza przeliczenie stylu ~850× w benchmarku web.dev, ale tokeny motywu na `:root` muszą dziedziczyć; zysk dotyczy tylko zmiennych lokalnych elementu.                                                           | F [S33], W                |
| 10  | Format DTCG 2025.10 jest stabilny (Format, Color z `oklch`, Resolver do trybów). Nadaje się na źródło prawdy, ale to raport grupy społecznościowej W3C, nie standard W3C.                                                                             | F [S1][S2][S3][S4]        |
| 11  | `corner-shape` (squircle) działa tylko w Chromium 139+. Na macOS (WebKit) nie ma, więc desktop wyglądałby różnie na Windows i macOS.                                                                                                                  | F [S30]                   |
| 12  | `contrast-color()` jest Baseline od 2026-04 (Chrome 147, Firefox 146, Safari 26), ale zwraca tylko biel lub czerń. Do akcentów na kolorze wystarczy, do generowania palety nie.                                                                       | F [S31][S40]              |
| 13  | Sprężyny da się podać w CSS przez `linear()` (Chrome 113, Firefox 112, Safari 17.2). Wartości sprężyn M3 Expressive znam tylko z portów społeczności, które się różnią.                                                                               | F [S35], conflicted [S11] |

## 1. Zakres i metoda

| Element               | Ustalenie                                                                                                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pytanie główne        | Jakie silniki i jaka architektura tokenów dają spójny system, w którym przycisk w popupie wygląda tak samo jak na stronie, i jak silniki od siebie zależą                                                                                       |
| Decyzja, której służy | Lista silników v3, wspólny kształt silnika, lista przepisów, warstwy tokenów                                                                                                                                                                    |
| W zakresie            | 12 systemów z tabeli 1, CSS platformy 2024–2026 (WebView2/Chromium, WebKit), DTCG 2025.10, struktura v2 (tylko nagłówki)                                                                                                                        |
| Poza zakresem         | Audyt v2, wybór biblioteki komponentów, implementacja, wygląd (decyzje właściciela)                                                                                                                                                             |
| Ograniczenia          | Strony m3.material.io, developer.apple.com (HIG) i część dokumentacji Android renderują się JS-em i nie dały się odczytać. Dla M3 korzystam z repo material-web, bloga Material, Compose API i portów społeczności, oznaczonych jako supported. |

## 2. Pytanie 1: system × silnik

Legenda: ✓ osobny dział lub grupa tokenów; ~ obecne, ale wewnątrz innego działu; – nie znalazłem (to nie dowód nieistnienia); ? nie zweryfikowałem.

| System (wersja/data)                                                           | Kolor                               | Typo          | Rozmiar/gęstość                                           | Przestrzeń         | Kształt                             | Głębia                                         | Materiał                                | Stany                                   | Focus                 | Ruch                       | Ikony        | Obramowanie     | Z-index         |
| ------------------------------------------------------------------------------ | ----------------------------------- | ------------- | --------------------------------------------------------- | ------------------ | ----------------------------------- | ---------------------------------------------- | --------------------------------------- | --------------------------------------- | --------------------- | -------------------------- | ------------ | --------------- | --------------- |
| Material 3 + Expressive (2025-05) [S5][S6][S8][S9][S10]                        | ✓ role + surface containers         | ✓ typescale   | ?                                                         | ?                  | ✓ corner scale + 35 shapes          | ✓                                              | –                                       | ✓ state layers                          | ?                     | ✓ springs, spatial/effects | ✓            | –               | –               |
| Fluent 2 [S12][S13][S14][S15]                                                  | ✓ global/alias, stany w nazwie      | ✓             | –                                                         | ✓ (port Flutter)   | ✓ corner radius                     | ✓ shadow 2…64                                  | ? (Mica/Acrylic, niezweryfikowane)      | ✓ `…Hover`, `…Pressed`                  | ?                     | ✓ duration 50–500 ms       | ✓            | ✓ stroke width  | –               |
| Apple HIG (iOS/macOS 26, 2025-06) [S16][S17][S18]                              | ✓                                   | ✓             | ?                                                         | ✓ layout           | ✓ concentric/capsule/fixed          | ~ przez materiały                              | ✓ Liquid Glass                          | ?                                       | ?                     | ✓                          | ✓ SF Symbols | –               | –               |
| IBM Carbon [S19]                                                               | ✓ + layering                        | ✓             | –                                                         | ✓ `$spacing-01…13` | –                                   | ~ layering kolorem                             | –                                       | ✓ sufiks `-hover`                       | ?                     | ✓ productive/expressive    | ✓            | ~               | –               |
| Adobe Spectrum 2 [S20][S21]                                                    | ✓                                   | ✓             | ✓ `component-height-75…300`, skala platformy medium/large | ✓                  | ✓ `corner-radius-*`                 | ?                                              | –                                       | ?                                       | ?                     | ?                          | ✓            | ?               | –               |
| GitHub Primer (primitives 11.x) [S22]                                          | ✓ `bgColor/fgColor/borderColor`     | ✓             | ✓ `control-*-size`                                        | ✓                  | ?                                   | ✓ `boxShadow`                                  | –                                       | ✓ `rest/hover`                          | ?                     | ?                          | ✓            | ✓               | ?               |
| Atlassian [S23]                                                                | ✓                                   | ✓             | –                                                         | ✓                  | ✓ `radius.*` + `radius.focus.*`     | ✓ `elevation.surface.*` + `elevation.shadow.*` | –                                       | ✓ `.hovered/.pressed` na powierzchniach | ✓ promień focus +2 px | ✓                          | ✓            | ✓ Border        | –               |
| Shopify Polaris (tokens; React deprecated, Web Components od 2025-10-01) [S24] | ✓                                   | ✓ font + text | ✓ height                                                  | ✓ space            | ~ w border                          | ✓ shadow                                       | –                                       | ?                                       | ?                     | ✓ motion                   | ✓            | ✓ border        | ✓ zIndex        |
| Radix Themes 3.x [S25]                                                         | ✓ 12 kroków na skalę                | ✓             | ✓ `scaling` 90–110%                                       | ✓ `--space-1…9`    | ✓ `--radius-factor`, `--radius-1…6` | ?                                              | ✓ `panelBackground` solid/translucent   | ~ kroki 4/5 i 10 skali                  | ~ krok 8              | –                          | –            | ~ kroki 6–8     | –               |
| Open Props 1.7.23 [S26]                                                        | ✓ + OKLCH `--color-1…16`            | ✓             | ✓ sizes, fluid                                            | ✓                  | ✓ radius, conditional, blob         | ✓ shadows + inner                              | –                                       | –                                       | –                     | ✓ easings ze sprężynami    | –            | ✓ border-size   | ✓ `--layer-1…5` |
| Panda CSS v2 / Park UI [S27][S28]                                              | ✓ + semantic z warunkami            | ✓             | ✓ sizes                                                   | ✓ spacing          | ✓ radii                             | ✓ shadows                                      | ?                                       | ~ w recipes                             | ~                     | ?                          | –            | ✓ borders       | ?               |
| Vercel Geist [S29]                                                             | ✓ 10 skal × kroki 100–1000 z rolami | ✓             | –                                                         | ✓ grid             | ~ w materials                       | ✓ materials                                    | ✓ materials (radius+fill+stroke+shadow) | ~ kroki 100–300                         | ?                     | ?                          | ✓            | ~ kroki 400–600 | –               |

**W:** każdy system ma kolor, typografię, przestrzeń i głębię. Rozmiar kontrolki jako osobny silnik mają tylko Spectrum, Primer, Polaris i Radix. Stany jako mechanizm (nie tylko kolory) ma tylko M3. Focus jako geometrię ma tylko Atlassian. Materiał mają Apple, Geist i Radix, ale Geist i Radix traktują go jako przepis powierzchni, nie silnik.

## 3. Pytanie 2: kandydaci na silnik

### 3.1 Kształt (shape)

| Aspekt         | Treść                                                                                                                                                                                        | Źródło                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Definicja      | Geometria krawędzi: promień, styl narożnika, grubość obrysu                                                                                                                                  | W                                                   |
| Wejścia        | poziom zaokrąglenia (`none…full` albo mnożnik), styl narożnika (`round`/`squircle`), tryb kapsuły kontrolek                                                                                  | F Radix `radius` none/small/medium/large/full [S25] |
| Wyjścia        | `radius.control(size)`, `radius.surface(level)`, `radius.inner` (concentric), `radius.focus`, `stroke.hairline/default/strong`                                                               | R                                                   |
| M3             | skala corner: extra-small, small, medium, large, large-increased (20 dp), extra-large, extra-large-increased (32 dp), extra-extra-large (48 dp), full; nazwy z Compose, wartości z portu     | supported [S9]                                      |
| Atlassian      | 2/4/6/8/12/16 px + full + tile 25%; promień przypisany do typu elementu (kontrolka 6, kontener 8, modal 12); `radius.focus.*` = promień + 2 px, bo ring stoi 2 px na zewnątrz                | verified [S23]                                      |
| Geist          | promień rośnie z poziomem materiału: base/small 6, medium/large 12, tooltip 6, menu 12, modal 12, fullscreen 16                                                                              | verified [S29]                                      |
| Radix          | `--radius-factor` mnoży skalę `--radius-1…6`; Checkbox nigdy nie staje się okrągły, żeby nie mylić z Radio; panele dziedziczą promień motywu                                                 | verified [S25]                                      |
| Concentric     | Apple: kształt koncentryczny = promień rodzica minus padding rodzica; kapsuła = połowa wysokości; „fallback radius”, gdy element stoi sam; unikać narożników „ściśniętych” i „rozszerzonych” | verified [S16], [S17]                               |
| Squircle       | `corner-shape` w Chrome/Edge 139 (2025-08); Firefox i Safari brak, bez publicznego terminu                                                                                                   | supported [S30]                                     |
| Dobre praktyki | promień kontrolki ≤ połowa wysokości (inaczej kapsuła); wewnętrzny = `max(outer − padding − border, 0)`; promień focus = promień + offset                                                    | W z [S16][S23]                                      |
| v2             | `--corner-xs…xl`, `--corner-full`, `--control-shape`, `--control-ratio`, `--control-cap` w `scale.css`; `data-corners`                                                                       | v2                                                  |

**W:** `corner-shape` daje inny wygląd na Windows (WebView2 = Chromium) i na macOS (WKWebView). Przy tym samym promieniu squircle wygląda mniej okrągło, więc wzór concentric też musiałby to uwzględniać. To decyzja wyglądu, zostawiam ją właścicielowi (pytanie O3).

### 3.2 Kolor (color)

| Aspekt             | Treść                                                                                                                                                                                        | Źródło                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Definicja          | Rampy i role kolorów dla trybu, akcentu, neutralu i statusów                                                                                                                                 | W                                              |
| Wejścia            | tryb (light/dark), akcent (hue + chroma albo preset), odcień neutralu, poziom kontrastu (standard/high), żywość                                                                              | F Radix `accentColor`, `grayColor: auto` [S25] |
| Wyjścia            | role: `canvas`, `surface.{sunken,base,raised,overlay}`, `fg.{default,muted,subtle,on-accent}`, `border.{subtle,default,strong}`, `accent.{solid,solid-hover,soft,soft-hover,fg}`, `status.*` | R                                              |
| Radix              | 12 kroków o stałym znaczeniu: 1–2 tło, 3–5 tło elementu (rest/hover/active), 6–8 obramowania (8 też focus ring), 9–10 solid, 11–12 tekst                                                     | verified [S25]                                 |
| Geist              | 10 skal; 100–300 tło komponentu (default/hover/active), 400–600 obramowania, 700–800 tło wysokiego kontrastu, 900–1000 tekst i ikony; P3 tam, gdzie wspierane                                | verified [S29]                                 |
| M3                 | od 2023-03 kolor powierzchni zależy od roli `surface-container-{lowest…highest}`, nie od nakładki elewacji                                                                                   | verified [S6], [S7]                            |
| Fluent             | alias tokeny niosą stan w nazwie, np. `colorNeutralBackground1Hover` (grey[96] light, grey[24] dark), `colorBrandBackgroundPressed`                                                          | verified [S14]                                 |
| Carbon             | layering: w light warstwy naprzemiennie White i Gray 10, w dark każda warstwa o krok jaśniejsza                                                                                              | verified [S19]                                 |
| OKLCH              | DTCG Color 2025.10 przyjmuje `oklch` (L 0–1, C ≥ 0, H 0–360, słowo `none`)                                                                                                                   | verified [S2]                                  |
| Generowanie        | Adobe Leonardo: kolory z docelowych współczynników kontrastu względem wspólnego tła, osobno dla light i dark                                                                                 | supported [S38]                                |
| Kontrast           | WCAG 3 to nadal Working Draft (2026-03-03), wymagania „będą inne”; status APCA w drafcie niepotwierdzony; WCAG 2.2 AA obowiązuje operacyjnie                                                 | F [S37], status APCA unknown                   |
| `contrast-color()` | Baseline newly available 2026-04; zwraca biel albo czerń (CSS Color 5); wersja z celem kontrastu jest w drafcie Color 6                                                                      | supported [S31][S40]                           |
| v2                 | `colors.css`: tryby `:root`/`.dark`, `--tint-rest/hover/press` 10/16/24%, `--ink-*`; `accents.css` generowany przez `scripts/generate-colors.ts`, 40 presetów `data-accent-color`            | v2                                             |

**W:** rampa akcentu da się wyliczyć w CSS z jednego hue przez relative color syntax (`oklch(from var(--accent-seed) L C h)`), co v2 już sprawdza w `@supports` (`colors.css:75`). Ale chroma w OKLCH trzeba przyciąć do gamutu per hue, a CSS robi to sam przy wyświetlaniu (gamut mapping), więc wynik bywa różny między silnikami. Bezpieczniej generować rampy w buildzie (jak v2), a w runtime tylko wybierać preset.

### 3.3 Głębia (depth)

| Aspekt        | Treść                                                                                                                                                                                                   | Źródło                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Definicja     | Pozycja powierzchni na osi z: kolor tła, cień, obrys, warstwa (z-index)                                                                                                                                 | W                         |
| Wejścia       | styl głębi (cień / obrys / kolor), intensywność cienia, tryb, materiał (solid/translucent, blur)                                                                                                        | R                         |
| Wyjścia       | dla każdego poziomu `sunken, base, raised, overlay, modal`: `bg`, `shadow`, `border`, `radius`, `layer`                                                                                                 | R                         |
| Atlassian     | 4 poziomy: sunken, default, raised, overlay; tokeny `elevation.surface.*` z `.hovered/.pressed` + pasujący `elevation.shadow.*`                                                                         | verified [S23]            |
| Fluent        | cień = key (ostry, kierunkowy) + ambient (miękki); rampa 2/4/8/16 i 28/64; w dark key ma 28% zamiast 14%; na kolorowych powierzchniach krycie z luminancji; **Windows używa obrysu zamiast key shadow** | verified [S13]            |
| Geist         | materiały: „na stronie” base/small/medium/large i „ponad stroną” tooltip/menu/modal/fullscreen, każdy z promieniem, fill, stroke, shadow                                                                | verified [S29]            |
| M3            | kolor powierzchni z roli kontenera, nie z elewacji                                                                                                                                                      | verified [S6]             |
| Radix         | `panelBackground: translucent` domyślnie, `solid` gdy treść ma być bez przebić                                                                                                                          | verified [S25]            |
| Z-index       | Open Props `--layer-1…5`, `--layer-important`; Polaris ma grupę `zIndex`                                                                                                                                | verified [S26][S24]       |
| Materiał/blur | koszt `backdrop-filter` rośnie z polem × promieniem rozmycia × liczbą warstw × zmianą tła pod spodem; WebKitGTK wolniejszy od Chromium                                                                  | supported, anegdota [S39] |
| v2            | `--elevation-overlay`, `--glass-*`, `data-transparency`, `data-neon`                                                                                                                                    | v2                        |

**W:** materiał to wejście silnika głębi (fill alpha + blur dla wybranych poziomów), nie osobny silnik. Fluent pokazuje, że styl głębi zależy od platformy: na Windows obrys zamiast key shadow. To pasuje do osi `data-platform`, którą v2 już ma.

### 3.4 Stany (state)

| Aspekt        | Treść                                                                                                                                                  | Źródło                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Definicja     | Jak element reaguje na hover, press, selected, drag, disabled                                                                                          | W                                           |
| Wejścia       | intensywności nakładki per stan, krycie disabled, tryb                                                                                                 | R                                           |
| Wyjścia       | `state.hover`, `state.press`, `state.selected`, `state.drag` (krycie nakładki), `state.disabled-opacity`, kolor nakładki = `fg` danej powierzchni      | R                                           |
| M3            | state layer: nakładka w kolorze treści; hover 8%, focus 10%, pressed 10%, dragged 16% (Compose `StateTokens`); starsze material-web: focus/pressed 12% | supported, conflicted między wersjami [S10] |
| Fluent        | gotowe tokeny per stan (`…Hover`, `…Pressed`, `…Selected`)                                                                                             | verified [S14]                              |
| Radix / Geist | stany jako kolejne kroki rampy (3→4→5; 100→200→300)                                                                                                    | verified [S25][S29]                         |
| Atlassian     | stany per powierzchnia (`elevation.surface.raised.hovered`)                                                                                            | verified [S23]                              |
| v2            | `--tint-rest/hover/press` 10/16/24%, `--ink-rest/hover/press`, `--disabled-opacity: 0.4`                                                               | v2                                          |

**W, ważne:** właściciel ustalił, że ruch to tylko transform/opacity. Stan wyrażony krokiem rampy (Radix, Geist, Fluent) zmienia `background-color`, więc przejście wymaga repaintu. Nakładka `::before` z kolorem treści i animowaną `opacity` (model M3) przechodzi na kompozytorze. Koszt: każda animowana nakładka to osobna warstwa kompozytora; w długich listach to pamięć GPU. To trzeba zmierzyć (O9).

### 3.5 Focus

| Aspekt    | Treść                                                                                                                                                                                     | Źródło               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Definicja | Pierścień widoczności klawiatury: szerokość, offset, kolor, promień                                                                                                                       | W                    |
| Wejścia   | szerokość, offset, źródło koloru (akcent / kontrast), styl (outline / inset)                                                                                                              | R                    |
| Wyjścia   | `focus.width`, `focus.offset`, `focus.color`, `focus.radius` = promień elementu + offset                                                                                                  | F Atlassian [S23], R |
| Atlassian | ring 2 px na zewnątrz, promień focus = promień + 2 px, liczony w komponencie                                                                                                              | verified [S23]       |
| Radix     | krok 8 skali jako kolor focus ringu                                                                                                                                                       | verified [S25]       |
| Pułapka   | ring na zewnątrz jest obcinany przez rodzica z `overflow: hidden` (np. wiersz w liście ze scrollem); wtedy potrzebny wariant inset                                                        | W                    |
| ?         | Czy `outline` z `outline-offset` sam rysuje łuk o promieniu promień + offset we wszystkich docelowych silnikach. Nie potwierdziłem wersji; jeśli tak, `focus.radius` nie musi być tokenem | unknown              |

### 3.6 Ruch (motion)

| Aspekt           | Treść                                                                                                                                                        | Źródło                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Definicja        | Czasy, krzywe i sprężyny przejść                                                                                                                             | W                                                                          |
| Wejścia          | schemat (standard / expressive / reduced), mnożnik tempa                                                                                                     | F M3 `MotionScheme` standard/expressive (Compose, z pamięci + porty) [S11] |
| Wyjścia          | `duration.{instant,fast,normal,slow}`, `ease.{standard,enter,exit}`, `spring.spatial.{fast,default,slow}` jako `linear()`, `effects` bez przestrzału         | R                                                                          |
| M3 Expressive    | system sprężyn zastępuje easing+duration; podział spatial (pozycja, rozmiar) i effects (kolor, krycie), każdy fast/default/slow                              | supported [S8][S11]                                                        |
| Wartości sprężyn | porty: expressive spatial fast damping 0.6 / stiffness 800 (dwa porty zgodne); default i slow różnią się między portami; effects damping 1 (bez przestrzału) | conflicted [S11]                                                           |
| Fluent           | `durationUltraFast` 50, `Faster` 100, `Fast` 150, `Normal` 200, `Gentle` 250, `Slow` 300, `Slower` 400, `UltraSlow` 500 ms                                   | verified, `@fluentui/tokens` 1.0.0-alpha.24 [S15]                          |
| Carbon           | dwa style: productive `cubic-bezier(0.2,0,0.38,0.9)`, expressive `cubic-bezier(0.4,0.14,0.3,1)`; krzywe standard/entrance/exit                               | supported [S19]                                                            |
| CSS              | `linear()` przybliża sprężyny i bounce; Chrome 113, Firefox 112, Safari 17.2                                                                                 | verified [S35]                                                             |
| Open Props       | gotowe `--ease-spring-*`, `--ease-elastic-*`                                                                                                                 | verified [S26]                                                             |
| v2               | `motion.css`: ~60 zmiennych, wiele per interakcja (`--motion-press-in`, `--motion-check-draw`, `--sliding-*`), `linear()` już użyty w `--ease-press-out`     | v2                                                                         |

**W:** zasada M3 „effects bez przestrzału” pasuje do reguły transform/opacity: sprężyny tylko dla `transform`, krycie zawsze bez przestrzału. v2 ma ~60 zmiennych ruchu, bo każda interakcja ma swój czas; silnik powinien dać ~10 wyjść, a przepisy wybierać z nich.

### 3.7 Rozmiar i gęstość (size)

| Aspekt    | Treść                                                                                                | Źródło                                               |
| --------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Definicja | Wymiary kontrolki dla danego rozmiaru: wysokość, padding, odstęp, ikona, stopień tekstu              | W                                                    |
| Wejścia   | rozmiar (`xs…xl`), skala platformy (desktop/touch), globalny mnożnik                                 | F Spectrum medium/large [S20], Radix `scaling` [S25] |
| Wyjścia   | `size.h`, `size.pad-x`, `size.gap`, `size.icon`, `size.type` (wskaźnik na rolę z `type`), `size.hit` | R                                                    |
| Spectrum  | `component-height-75/100/200/300` = S/M/L/XL; `100` = 32 px desktop, 40 px mobile                    | supported [S20]                                      |
| Primer    | wzorzec `control` wspólny dla przycisków, pól i wierszy ActionList; rozmiary xsmall…xxlarge          | verified [S22]                                       |
| Radix     | `scaling` 90–110% mnoży odstępy, fonty i interlinię; dostępny jako `--scaling`                       | verified [S25]                                       |
| v2        | `data-size` xs…xl z `--size-height`, `--size-font`, `--size-icon`, `--size-gap`, `--size-inner-*`    | v2                                                   |

### 3.8 Przestrzeń i układ (space)

| Aspekt        | Treść                                                                                                                | Źródło         |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- |
| Definicja     | Skala odstępów i paddingi kontenerów; gęstość                                                                        | W              |
| Wejścia       | jednostka bazowa, gęstość (`compact…spacious`)                                                                       | R              |
| Wyjścia       | `space.1…n` (skala), `inset.{tight,default,loose}` dla kontenerów, `gap.{group,section}`                             | R              |
| Carbon        | 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 px; wielokrotności 2, 4, 8, spięte z 2x Grid                        | verified [S19] |
| Radix         | 4, 8, 12, 16, 24, 32, 40, 48, 64 px, mnożone przez `--scaling`                                                       | verified [S25] |
| Tailwind v4.3 | `--spacing` jako baza wszystkich utility; `@theme` emituje tylko użyte zmienne; `--*: initial` czyści domyślne       | verified [S36] |
| v2            | `--space-2…40`; `data-density` 5 poziomów zmienia tylko kontenery (`--inset-tight`, `--card-spacing`, `--group-gap`) | v2             |

**W:** reguła właściciela „gęstość = kontenery, kontrolki stałe” (pamięć) oznacza, że `space` i `size` są rozdzielne: gęstość nie zmienia wysokości kontrolki. Radix robi odwrotnie (`scaling` zmienia wszystko). Oba modele są spójne, wybór należy do właściciela (O6).

### 3.9 Typografia (type)

| Aspekt  | Treść                                                                                                                    | Źródło                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Wejścia | rodziny (sans, heading, mono), rozmiar bazowy, waga (regular/medium), skala                                              | v2 `data-font*`, `data-weight` |
| Wyjścia | role `label, body, title, display, code, detail` × `size, leading, weight, tracking`                                     | R                              |
| M3      | typescale jako system tokens (`--md-sys-typescale-body-medium-size`, `-line-height`); Expressive dodaje style emphasized | verified [S5], supported [S8]  |
| Fluent  | alias tokeny łączą wartości typografii w jeden token                                                                     | verified [S12]                 |

### 3.10 Silniki spoza listy

| Kandydat               | Kto ma                                                | Werdykt v3                                                         |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Materiał / blur        | Apple (Liquid Glass), Geist, Radix `panelBackground`  | wejście `depth`                                                    |
| Obramowanie            | Atlassian Border, Fluent stroke width, Polaris border | grubość w `shape`, kolor w `color`                                 |
| Siatka / breakpointy   | Carbon 2x Grid, Geist grid, Polaris breakpoints       | zostaje w Tailwind (układ), wartości z `space`                     |
| Z-index / warstwy      | Open Props, Polaris                                   | wyjście `depth.layer`                                              |
| Ikony                  | wszyscy                                               | rozmiar z `size.icon`, grubość z `type` (waga)                     |
| Kursor                 | Radix (cursor tokens, niezweryfikowane)               | poza silnikami                                                     |
| Pikselowe przyciąganie | brak w źródłach                                       | W: `round(…, 1px)` w formułach, v2 już tak robi (`tokens.css:454`) |

## 4. Pytanie 3: macierz zależności

Wiersz = silnik, który czyta; kolumna = silnik, z którego czyta; komórka = co czyta.

| Czyta ↓ / z →       | color                                            | type                                                    | motion                  | space                          | size                                          | shape                               | depth                             |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------- | ----------------------- | ------------------------------ | --------------------------------------------- | ----------------------------------- | --------------------------------- |
| **size**            | –                                                | stopień tekstu, interlinia (wysokość ≥ leading + 2·pad) | –                       | jednostka bazowa               | –                                             | –                                   | –                                 |
| **shape**           | –                                                | –                                                       | –                       | padding kontenera (concentric) | wysokość (kapsuła = h/2), promień per rozmiar | –                                   | –                                 |
| **depth**           | rampa powierzchni, kolor cienia, alpha materiału | –                                                       | –                       | –                              | –                                             | promień per poziom (Geist)          | –                                 |
| **state**           | kolor nakładki = `fg` powierzchni                | –                                                       | czas i krzywa przejścia | –                              | –                                             | promień nakładki = promień elementu | powierzchnia, na której leży stan |
| **focus**           | kolor ringu kontrastowy do powierzchni           | –                                                       | czas pojawienia         | odstęp, żeby ring się zmieścił | –                                             | promień + offset, grubość obrysu    | poziom, na którym leży element    |
| **ikony** (wyjście) | `fg`                                             | waga → grubość kreski                                   | –                       | –                              | `size.icon`                                   | –                                   | –                                 |

Kolejność topologiczna (bez cykli): `color`, `type`, `motion`, `space` → `size` → `shape` → `depth` → `state`, `focus`.

| Zależność                                                | Dowód                                       | Typ |
| -------------------------------------------------------- | ------------------------------------------- | --- |
| promień zagnieżdżony = promień rodzica − padding rodzica | Apple WWDC25 [S16]                          | F   |
| promień focus = promień + offset                         | Atlassian [S23]                             | F   |
| promień rośnie z poziomem powierzchni                    | Geist [S29]                                 | F   |
| kolor powierzchni zależy od poziomu                      | M3 surface containers [S6], Atlassian [S23] | F   |
| krycie cienia zależy od luminancji powierzchni i trybu   | Fluent [S13]                                | F   |
| stany per powierzchnia                                   | Atlassian `.hovered` [S23]                  | F   |
| wysokość kontrolki ≥ interlinia tekstu + padding         | W                                           | W   |
| ring obcięty przez `overflow` rodzica                    | W                                           | W   |

## 5. Pytanie 4: architektura tokenów

### 5.1 Poziomy w systemach

| System            | Poziomy                                                                                                                                           | Nazewnictwo               | Źródło              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------- |
| M3 (material-web) | 3: reference `--md-ref-*` → system `--md-sys-*` → component (bez prefiksu `comp`, np. `--md-filled-button-container-shape`)                       | rola-kategoria            | verified [S5]       |
| Fluent 2          | 2 opisane: global (surowe) → alias (znaczenie); dodatkowo stan w nazwie aliasu                                                                    | camelCase z rolą i stanem | verified [S12][S14] |
| Primer            | 3: base → functional → component/pattern; 7 pozycji nazwy: prefix, namespace, pattern, variant, property, variant, scale; wymagane tylko property | kebab                     | verified [S22]      |
| Spectrum          | global → alias → component; nowa Design Data Specification: warstwy foundation/platform/product z kaskadą                                         | 3 części nazwy            | supported [S20]     |
| Atlassian         | semantyczne, kropkowane (`elevation.surface.raised.hovered`)                                                                                      | kropki                    | verified [S23]      |
| Radix Themes      | skale + kilka mnożników; brak tokenów komponentu, komponenty mają klasy                                                                           | numeryczne kroki          | verified [S25]      |
| Panda v2          | tokens + semantic tokens z warunkami (`base`, `_dark`), format zgodny z DTCG                                                                      | kropki                    | verified [S27]      |

### 5.2 DTCG 2025.10

| Element   | Treść                                                                                                                                                  | Źródło               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Status    | 2025-10-28, Final Community Group Report, „stable”; nie jest standardem W3C                                                                            | verified [S1][S4]    |
| Typy      | color, dimension (px/rem), fontFamily, fontWeight, duration (ms/s), cubicBezier, number, strokeStyle, border, transition, shadow, gradient, typography | verified [S1]        |
| Aliasy    | `"{group.token}"` do całego tokenu; `$ref` (JSON Pointer) do pod-właściwości                                                                           | verified [S1]        |
| Grupy     | `$extends` (dziedziczenie grup, deep merge), `$root`, `$type` na grupie, `$deprecated`                                                                 | verified [S1]        |
| Kolor     | 14 przestrzeni, w tym `oklch`, `oklab`, `display-p3`                                                                                                   | verified [S2]        |
| Resolver  | sets + modifiers (np. `theme: light/dark`) + `resolutionOrder`; plik `.resolver.json`                                                                  | verified [S3]        |
| Brak      | sprężyny (brak typu spring), `linear()` (tylko cubicBezier)                                                                                            | W z listy typów [S1] |
| Narzędzia | Style Dictionary, Tokens Studio, Terrazzo jako implementacje referencyjne                                                                              | supported [S4]       |

**W:** Resolver modeluje osie motywu v2 (tryb, akcent, gęstość, preset strony) jako modifiers. Ale każda kombinacja to osobny wynik, więc do ustawień zmienianych w runtime lepiej pasują formuły CSS na kilku zmiennych wejściowych. DTCG nie ma typu na sprężyny, więc `motion.spring.*` wymagałby `$extensions`.

### 5.3 Wydajność zmiennych CSS

| Pomiar                                                             | Wynik                                                        | Źródło                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| zarejestrowana `@property` z `inherits: true` vs niezarejestrowana | 98% szybkości, ~0,06 ms różnicy                              | verified, 2024-10-02, M1 Pro [S33] |
| `inherits: false`                                                  | 214 110 vs 256 przebiegów/s (~850×)                          | verified [S33]                     |
| 25 000 dodatkowych rejestracji                                     | jednorazowo ~32 ms                                           | verified [S33]                     |
| wiele zmiennych na `:root`                                         | +1,8% czasu renderu (10 ms) przy porównywalnym rozmiarze CSS | supported, jeden test GitLab [S34] |
| 3 poziomy aliasów vs 1                                             | ~14% dłużej                                                  | supported, jeden test [S34]        |

**W:** sama liczba zmiennych kosztuje mało; kosztuje głębokość łańcucha aliasów i przeliczenie dziedziczenia przy zmianie na `:root`. Tokeny motywu muszą dziedziczyć, więc `inherits: false` dotyczy tylko zmiennych lokalnych przepisu, np. animowanego `--press` na jednym elemencie.

### 5.4 Jak uniknąć eksplozji

| Przyczyna w v2                           | Dowód w v2                                                                                                                                   | Zasada v3                                                                             | Wzór                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------ |
| tokeny konkretnych komponentów w `:root` | prefiksy `--premium` 29, `--hero` 24, `--comparison` 23, `--footer` 18, `--media` 58, `laser-flow` w `tokens.css`                            | zero tokenów komponentu globalnie; wartości lokalne w klasie przepisu                 | Radix [S25]                                |
| gotowa rampa na każdy akcent             | `accents.css`: 40 presetów, 682 deklaracje `--primary*`                                                                                      | rampy w buildzie, w runtime jeden preset podstawiony atrybutem; v3 emituje tylko role | Radix, Geist                               |
| stan jako osobna zmienna per element     | `--motion-press-in`, `--primary-fill-hover` itd.                                                                                             | stan jako 4 krycia nakładki                                                           | M3 [S10]                                   |
| osie jako pełne zestawy wartości         | 16 osi `data-*` (accent-color, font×3, platform, density, scaling, neon, preset, weight, size, corners, transparency, curve, sliding, prose) | oś = 1 zmienna wejściowa + formuła                                                    | Radix `--radius-factor`, `--scaling` [S25] |
| ruch per interakcja                      | ~60 zmiennych w `motion.css`                                                                                                                 | ~10 wyjść, przepis wybiera                                                            | Fluent [S15]                               |
| wszystko emitowane                       | `@theme inline` w v2                                                                                                                         | `@theme` emituje tylko użyte zmienne; nie używać `@theme static`                      | Tailwind [S36]                             |

**R, budżet:** cel ≤ 250 publicznych zmiennych semantycznych (szacunek: color ~70, type ~30, size ~35, space ~20, shape ~15, depth ~35, state ~6, focus ~4, motion ~12) wobec ~2440 deklaracji w `styles/` v2. To estymacja, nie pomiar.

### 5.5 Rekomendacja warstw

| Warstwa         | Gdzie żyje                                                            | Publiczna                           | Przykład                                   |
| --------------- | --------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| L0 primitive    | źródło (DTCG JSON albo TS), rozwijane w buildzie                      | nie                                 | `oklch` rampy, skala px                    |
| L1 input        | atrybuty `data-*` + ≤ 12 zmiennych `--in-*` na `:root` lub poddrzewie | tak (API motywu)                    | `data-mode`, `--in-radius`, `--in-density` |
| L2 semantic     | CSS vars na `:root`, wyliczane formułą z L0 + L1                      | tak (API dla przepisów i aplikacji) | `--surface-raised-bg`, `--size-md-h`       |
| L3 recipe-local | zmienne w klasie przepisu, `@property inherits:false` gdy animowane   | nie                                 | `--_ctl-h`, `--_ctl-radius`                |

Kompromis: M3, Primer i Spectrum mają publiczne tokeny komponentu, bo pozwalają konsumentom zmienić jeden komponent bez forka. v3 tego nie daje; zmiana wyglądu jednego elementu wymaga wariantu przepisu. Zysk: kompozycja nie może się rozjechać, bo żaden komponent nie ma własnego stylu (to główny błąd v2).

## 6. Pytanie 5: przepisy

### 6.1 Jak robią to inni

| System       | Mechanizm                                                                                                                                                                                                                       | Wspólne rodzaje                                                                           | Źródło                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| Radix Themes | klasy komponentu + wspólny słownik wariantów: `classic, solid, soft, surface, outline, ghost`; `size 1–4`, `color`, `highContrast`, `radius`                                                                                    | warianty wspólne dla wielu komponentów; panele (Card, Dialog, Popover) dziedziczą promień | verified [S25]           |
| Primer       | wzorzec `control` w nazwie tokenu dla przycisków, pól i wierszy ActionList; `overlay` dla nakładek                                                                                                                              | control, overlay                                                                          | verified [S22]           |
| Geist        | materiały jako przepisy powierzchni (promień + fill + stroke + shadow per poziom)                                                                                                                                               | surface (8 poziomów)                                                                      | verified [S29]           |
| Panda v2     | `cva` (recipe) i `sva` (slot recipe): `slots`, `base`, `variants`, `compoundVariants`, `defaultVariants`; config recipes `defineRecipe/defineSlotRecipe`; `sva` emituje wszystkie warianty jako atomic CSS w `@layer utilities` | dowolne; slot = część komponentu                                                          | verified [S27]           |
| Chakra v3    | recipes + `colorPalette` jako wirtualny kolor podstawiany w wariantach                                                                                                                                                          | wirtualny kolor                                                                           | verified [S28]           |
| Spectrum S2  | `style` macro w buildzie generuje atomic CSS; prop `styles` przyjmuje tylko układ, odstępy, rozmiar, pozycję; kolory i wewnętrzny padding nie do zmiany; S2 używa `@layer`                                                      | brak przepisów publicznych; komponent jest zamknięty                                      | supported [S21]          |
| Fluent       | alias tokeny ze stanem w nazwie; wspólny „rodzaj” tylko na poziomie tokenów                                                                                                                                                     | –                                                                                         | verified [S14], reszta ? |

**W:** Spectrum S2 robi to, czego chce v3 (komponenty bez własnego stylu z zewnątrz), ale przez makro w buildzie. Radix i Primer pokazują, że wspólny słownik wariantów (`solid/soft/outline/ghost`) jest prostszym nośnikiem spójności niż tokeny komponentu.

### 6.2 Przepisy v3

| Przepis     | Czym jest                             | Sloty                                 | Warianty                                                                       | Czyta silniki                                      | Przykłady                                            |
| ----------- | ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| `control`   | interaktywne pudełko z etykietą/ikoną | root, icon, label, state-layer        | `solid, soft, outline, ghost, field` × `size`                                  | size, type, shape, color, state, focus, motion     | Button, Input, Select trigger, Toggle, Tab           |
| `surface`   | kontener na poziomie głębi            | root, header, body, footer            | `level: sunken, base, raised, overlay, modal` × `material: solid, translucent` | depth, color, shape, space                         | Card, Popover, Menu, Dialog, Tooltip, Toast          |
| `row`       | element wewnątrz powierzchni          | root, lead, label, trail, state-layer | `default, selected, danger`                                                    | size, space, state, shape (concentric z rodzica)   | MenuItem, ListItem, TreeRow, Option                  |
| `indicator` | mały znacznik stanu                   | track, thumb, mark                    | `checkbox, radio, switch, slider, progress, dot`                               | size (względny do `control`), color, motion, shape | Checkbox, Radio, Switch, Slider, Progress, Badge dot |
| `focus`     | pierścień                             | ring                                  | `outer, inset`                                                                 | focus, shape                                       | każdy element interaktywny                           |

Kandydaci do decyzji: `field` jako wariant `control` (Primer tak robi) albo osobny przepis; `text` (wiązanie ról typografii) jako lekki przepis bez tła.

**R, wspólny kształt silnika:**

```text
engine <name>
  inputs:   data-<axis> (enum) | --in-<name> (number)      # L1, ustawia motyw lub użytkownik
  derive:   build (rampy, skale) | css (calc, color-mix, round)
  outputs:  --<name>-<role>[-<step>]                        # L2, jedyne publiczne API
  reads:    outputs innych silników wg macierzy z sekcji 4
  readers:  tylko przepisy; komponent nie czyta L0 ani L2 bezpośrednio
```

## 7. Rekomendacja: silniki v3

Kryteria: (1) wydajność: płytkie aliasy, zmiana osi = jedno przeliczenie `:root`, ruch tylko transform/opacity; (2) brak artefaktów: concentric, przyciąganie do pikseli, kontrast; (3) jak najmniej pojęć.

| #   | Silnik   | Wejścia (L1)                                                                                     | Wyjścia (L2)                                                                                                                                                                                                                                                     | Gdzie liczony                     |
| --- | -------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | `color`  | `data-mode`, `data-accent` (preset), `data-neutral`, `data-contrast`                             | `--color-canvas`, `--color-surface-{sunken,base,raised,overlay}`, `--color-fg-{default,muted,subtle,on-accent}`, `--color-border-{subtle,default,strong}`, `--color-accent-{solid,solid-hover,soft,fg}`, `--color-{danger,warning,success,info}-{solid,soft,fg}` | rampy w buildzie, role w CSS      |
| 2   | `type`   | `data-font`, `data-font-heading`, `data-font-mono`, `data-weight`                                | `--type-{label,body,title,display,code,detail}-{size,leading,weight,tracking}`                                                                                                                                                                                   | build + CSS                       |
| 3   | `motion` | `data-motion: standard/expressive/reduced`, `--in-motion-speed`                                  | `--motion-{instant,fast,normal,slow}`, `--ease-{standard,enter,exit}`, `--spring-{fast,default,slow}` (`linear()`)                                                                                                                                               | build (`linear()`), CSS (mnożnik) |
| 4   | `space`  | `--in-space-unit`, `data-density`                                                                | `--space-{1…9}`, `--inset-{tight,default,loose}`, `--gap-{group,section}`                                                                                                                                                                                        | CSS z `round(…,1px)`              |
| 5   | `size`   | `data-size` (xs…xl, na poddrzewie), `data-platform`                                              | `--size-{h,pad-x,gap,icon,hit}` + wskaźnik `--size-type`                                                                                                                                                                                                         | CSS                               |
| 6   | `shape`  | `--in-radius` (mnożnik), `data-corner: round/squircle`, `--in-stroke`                            | `--shape-control`, `--shape-surface-{level}`, `--shape-inner` (concentric), `--shape-full`, `--stroke-{hairline,default,strong}`                                                                                                                                 | CSS                               |
| 7   | `depth`  | `data-depth-style: shadow/stroke` (platforma), `data-material: solid/translucent`, `--in-shadow` | per poziom `--depth-{level}-{bg,shadow,border,radius,layer}`, `--depth-blur`                                                                                                                                                                                     | CSS                               |
| 8   | `state`  | `--in-state-{hover,press,selected,drag}`, `--in-disabled`                                        | `--state-{hover,press,selected,drag}` (krycie), `--state-disabled`                                                                                                                                                                                               | CSS                               |
| 9   | `focus`  | `--in-focus-width`, `--in-focus-offset`, `data-focus-color`                                      | `--focus-{width,offset,color}`; promień = `--shape-*` + offset w przepisie                                                                                                                                                                                       | CSS                               |

Formuły kluczowe (W, do sprawdzenia w prototypie):

| Wyjście           | Formuła                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `--shape-control` | `min(var(--shape-base) * var(--in-radius), var(--size-h) / 2)`                                                                  |
| `--shape-inner`   | `max(var(--shape-parent) - var(--inset) - var(--stroke-default), var(--shape-min))`                                             |
| focus radius      | `calc(var(--shape-control) + var(--focus-offset))`                                                                              |
| `--size-h`        | `round(max(var(--size-h-base), var(--type-leading) + 2 * var(--size-pad-y)), 1px)`                                              |
| nakładka stanu    | `::before { background: currentColor; opacity: var(--_state, 0); transition: opacity var(--motion-fast) var(--ease-standard) }` |

## 8. Struktura v2 dla porównania (tylko nagłówki)

| Plik            | Linie | Deklaracje `--` | Zawartość                                                                                                                                                                                                                |
| --------------- | ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens.css`    | 544   | 441             | breakpointy w `@media`, wartości strony (hero, laser, section), wartości menu i popupów czytane z TS (`read-token`), gradienty premium/timeline/tree, `@theme inline` z `--radius-*`, `--text-label`, `--shadow-overlay` |
| `scale.css`     | 731   | 558             | `--control-*` (ratio, cap, shape), `--corner-xs…xl`, `--space-2…40`, `data-size` xs…xl, `data-weight`, `data-density` 5 poziomów, wartości stron (`--comparison-table-*`, `cn-footer-columns`, `cn-marquee`)             |
| `colors.css`    | 484   | 403             | marka i gradienty, `@supports` relative color, light `:root`, `.dark`, `data-neon`, `data-transparency`, preset `mangashift-site`, `@theme inline`                                                                       |
| `accents.css`   | 841   | 720             | generowany z `lib/theme.ts`, 40 presetów `data-accent-color`                                                                                                                                                             |
| `motion.css`    | 67    | 62              | czasy per interakcja, sprężyny `linear()`                                                                                                                                                                                |
| razem `styles/` | 4548  | ~2440           | 16 osi `data-*` + `.dark`                                                                                                                                                                                                |

**W:** v2 ma już zalążki silników (`--control-*`, `--tint-*`, `data-size`, `data-density`), ale wartości warstw L0, L2 i tokenów komponentu leżą w tych samych blokach `:root`. To ten sam błąd, który rozjeżdża kompozycję.

## 9. Sprzeczności i niewiadome

| Temat                   | Strona A                                 | Strona B                               | Status                                                                         |
| ----------------------- | ---------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Krycie stanów M3        | Compose `StateTokens`: focus/pressed 10% | starsze material-web: 12%              | conflicted, wersje [S10]                                                       |
| Sprężyny M3 Expressive  | port A: spatial default 0.8/380          | inne porty bez liczb lub inne          | conflicted; oficjalne wartości niedostępne (m3.material.io renderuje JS) [S11] |
| Gęstość                 | Radix: `scaling` zmienia wszystko        | v2/pamięć właściciela: tylko kontenery | decyzja właściciela                                                            |
| Tokeny komponentu       | M3, Primer, Spectrum: publiczne          | Radix: brak                            | rekomendacja v3: brak, kompromis w 5.5                                         |
| APCA                    | wymieniane w starszych draftach WCAG 3   | brak potwierdzenia w WD 2026-03-03     | unknown [S37]                                                                  |
| `outline` z promieniem  | moja wiedza: działa w nowych silnikach   | brak źródła z wersjami                 | unknown                                                                        |
| Koszt `backdrop-filter` | anegdoty: WebKitGTK wolniejszy           | brak benchmarku Chromium vs WebKit     | supported słabo [S39]                                                          |
| `if()` w CSS            | Chromium 137+                            | Firefox i Safari brak (2026-05)        | supported, źródła wtórne [S32]; nie opierać na nim v3                          |
| Spectrum 2 promienie    | nazwy `corner-radius-*` są               | wartości per skala nieznalezione       | unknown [S20]                                                                  |

Czego nie sprawdziłem: oficjalnych stron HIG i m3.material.io (JS), Fluent spacing w webie, Primer motion, Polaris wartości, Radix shadows/cursors, kosztu `corner-shape` w renderze, wersji WebKit na minimalnym macOS dla Tauri.

## 10. Otwarte pytania do właściciela

| #   | Pytanie                                                                                                                                                  | Od czego zależy                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| O1  | Źródło prawdy: DTCG JSON (+ resolver, narzędzia, przyszła interoperacyjność z Figmą) czy typowany TS (jak `lib/theme.ts` w v2)? Czy Figma jest w planie? | koszt narzędzi vs interop      |
| O2  | Które z 16 osi v2 przechodzą do v3 jako ustawienia użytkownika? Każda oś mnoży przypadki testowe                                                         | zakres ustawień desktopu       |
| O3  | Squircle: tylko Chromium (Windows) jako ulepszenie, czy zero, żeby Windows i macOS wyglądały tak samo?                                                   | wygląd, spójność platform      |
| O4  | Minimalna wersja macOS / WebKit dla desktopu (wpływa na `contrast-color`, relative color, `corner-shape`)                                                | wsparcie platform              |
| O5  | Standard kontrastu: WCAG 2.2 AA jako bramka, APCA tylko informacyjnie? Pamięć: „żywe kolory przed WCAG”                                                  | priorytet koloru vs dostępność |
| O6  | Gęstość: tylko kontenery (v2) czy globalny mnożnik (Radix)?                                                                                              | reguła „kontrolki stałe”       |
| O7  | Głębia na Windows: obrys zamiast key shadow (jak Fluent), czy jeden styl na obu platformach?                                                             | wygląd                         |
| O8  | Materiał/blur: na których poziomach dozwolony (np. tylko overlay i modal)? Budżet wydajności?                                                            | wydajność vs wygląd            |
| O9  | Stany: nakładka z `opacity` (kompozytor, warstwy GPU) czy krok rampy (repaint, mniej warstw)? Wymaga pomiaru w liście 500+ wierszy                       | reguła transform/opacity       |
| O10 | Czy aplikacje (desktop, strona) mogą nadpisywać cokolwiek poniżej L1? Jeśli tak, potrzebny jest publiczny poziom wariantów przepisu                      | granica API                    |
| O11 | Preset strony `mangashift-site` jako kontekst resolvera (modifier) czy osobny motyw?                                                                     | struktura motywów              |
| O12 | `field` jako wariant `control` czy osobny przepis?                                                                                                       | spójność pól i przycisków      |

## Źródła

Data dostępu dla wszystkich: 2026-10-30.

| Id  | Źródło                                                                                                                                                                                                                                                                                                     | Wersja/data                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| S1  | https://www.designtokens.org/tr/2025.10/format/                                                                                                                                                                                                                                                            | 2025-10-28                                         |
| S2  | https://www.designtokens.org/tr/2025.10/color/                                                                                                                                                                                                                                                             | 2025-10-28                                         |
| S3  | https://www.designtokens.org/tr/2025.10/resolver/                                                                                                                                                                                                                                                          | 2025-10-28                                         |
| S4  | https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/                                                                                                                                                                                            | 2025-10-28                                         |
| S5  | https://github.com/material-components/material-web/blob/main/docs/theming/README.md                                                                                                                                                                                                                       | gałąź main                                         |
| S6  | https://material.io/blog/tone-based-surface-color-m3                                                                                                                                                                                                                                                       | 2023-03-23                                         |
| S7  | https://docs.flutter.cn/release/breaking-changes/new-color-scheme-roles                                                                                                                                                                                                                                    | Flutter 3.22                                       |
| S8  | https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/                                                                                                                                                                                     | 2025-05-13                                         |
| S9  | https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-shape-defaults/-large-increased.html ; https://pub.dev/documentation/material_3_expressive/latest/foundations_m3e_shapes/M3EShapes-class.html                                                                       | Compose MP; port społeczności                      |
| S10 | https://docs.rs/crate/frust-material/latest/source/src/state_layer.rs ; https://docs.rs/crate/hydrolysis-m3/latest/source/src/theme/state_layer.rs                                                                                                                                                         | porty z Compose `StateTokens` v0_210               |
| S11 | https://pub.dev/documentation/motor/latest/ ; https://docs.rs/frust-material/0.6.2/src/frust_material/tokens/motion.rs.html                                                                                                                                                                                | porty społeczności                                 |
| S12 | https://fluent2.microsoft.design/design-tokens                                                                                                                                                                                                                                                             | bez daty                                           |
| S13 | https://fluent2.microsoft.design/elevation                                                                                                                                                                                                                                                                 | bez daty                                           |
| S14 | https://fluent2.microsoft.design/color-tokens                                                                                                                                                                                                                                                              | bez daty                                           |
| S15 | https://app.unpkg.com/@fluentui/tokens/files/lib/global/durations.js                                                                                                                                                                                                                                       | 1.0.0-alpha.24                                     |
| S16 | https://developer.apple.com/videos/play/wwdc2025/356/                                                                                                                                                                                                                                                      | WWDC 2025-06 (przez opisy w wynikach wyszukiwania) |
| S17 | https://developer.apple.com/forums/thread/794685                                                                                                                                                                                                                                                           | 2025                                               |
| S18 | https://developer.apple.com/design/human-interface-guidelines/foundations                                                                                                                                                                                                                                  | layout zaktualizowany 2025-06-09                   |
| S19 | https://www.carbondesignsystem.com/building-blocks/foundations/color ; https://carbondesignsystem.com/elements/spacing/overview/ ; https://carbondesignsystem.com/elements/motion/overview/                                                                                                                | bez daty                                           |
| S20 | https://spectrum.adobe.com/page/design-tokens ; https://opensource.adobe.com/spectrum-design-data/articles/understanding-spectrum-tokens/ ; https://opensource.adobe.com/spectrum-web-components/tools/styles                                                                                              | `@spectrum-css/tokens` 16.0.2                      |
| S21 | https://react-spectrum.adobe.com/styling                                                                                                                                                                                                                                                                   | S2                                                 |
| S22 | https://primer.style/product/primitives/token-names/                                                                                                                                                                                                                                                       | primitives 11.x                                    |
| S23 | https://atlassian.design/foundations/elevation ; https://atlassian.design/foundations/radius                                                                                                                                                                                                               | © 2026                                             |
| S24 | https://github.com/Shopify/polaris/tree/main/polaris-tokens/src/themes/base ; https://raw.githubusercontent.com/Shopify/polaris/HEAD/README.md                                                                                                                                                             | Web Components 2025-10-01                          |
| S25 | https://www.radix-ui.com/themes/docs/theme/radius ; https://www.radix-ui.com/themes/docs/theme/spacing ; https://www.radix-ui.com/themes/docs/components/button ; https://www.radix-ui.com/themes/docs/components/theme ; https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale | Themes 3.x                                         |
| S26 | https://open-props.style/                                                                                                                                                                                                                                                                                  | 1.7.23                                             |
| S27 | https://panda-css.com/docs/concepts/slot-recipes ; https://panda-css.com/docs/theming/tokens                                                                                                                                                                                                               | v2, aktualizacja 2026-10-24                        |
| S28 | https://chakra-ui.com/docs/theming/recipes                                                                                                                                                                                                                                                                 | v3                                                 |
| S29 | https://vercel.com/geist/colors ; https://vercel.com/geist/materials                                                                                                                                                                                                                                       | bez daty                                           |
| S30 | https://web-platform-dx.github.io/web-features-explorer/features/corner-shape ; https://squircle.js.org/blog/squircles-in-css                                                                                                                                                                              | Chrome 139, 2025-08                                |
| S31 | https://developer.chrome.com/blog/new-in-web-ui-io26 ; https://web.dev/blog/web-platform-04-2026                                                                                                                                                                                                           | 2026-04                                            |
| S32 | https://blog.openreplay.com/use-css-if-vs-container-style-queries/                                                                                                                                                                                                                                         | 2026, wtórne                                       |
| S33 | https://web.dev/blog/at-property-performance                                                                                                                                                                                                                                                               | 2024-10-02                                         |
| S34 | https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/issues/2344                                                                                                                                                                                                                              | bez daty                                           |
| S35 | https://developer.chrome.com/docs/css-ui/css-linear-easing-function                                                                                                                                                                                                                                        | bez daty                                           |
| S36 | https://tailwindcss.com/docs/theme                                                                                                                                                                                                                                                                         | v4.3                                               |
| S37 | https://www.w3.org/TR/2026/WD-wcag-3.0-20260303/ ; https://www.w3.org/WAI/WCAG3                                                                                                                                                                                                                            | WD 2026-03-03                                      |
| S38 | https://github.com/adobe/leonardo ; https://leonardocolor.io/api.html                                                                                                                                                                                                                                      | bez daty                                           |
| S39 | https://github.com/marinom2/lightnode/pull/175 ; https://www.react.doctor/docs/rules/react-doctor/no-large-animated-blur                                                                                                                                                                                   | anegdota                                           |
| S40 | https://developer.mozilla.org/docs/Web/CSS/color_value/contrast-color ; https://drafts.csswg.org/css-color-6/                                                                                                                                                                                              | Color 5 / draft Color 6                            |
