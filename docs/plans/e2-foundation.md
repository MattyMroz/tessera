---
kind: plan
status: draft (część 1: runda 3, po recenzjach e2-plan-spec, e2-plan-tech, e2-plan-round-2 i decyzjach właściciela 31.10; część 2: zaakceptowana przez właściciela 2026-11-01, w toku)
baseline: tessera main @ 378bcee (branch feat/e2-foundation, worktree .worktrees/e2); v2 = MangaShift refactor/tessera-motion @ 7a48b4310 (working tree); strona = MangaShift .worktrees/docs-page-and-test-decoding/web
created: 2026-10-31
---

# Plan E2: fundament Tessery v3

## Cel

Zbudować całą podstawę wyglądu Tessery v3 w wersji roboczej: dziewięć silników, pięć przepisów, motyw `mangashift` (jasny i ciemny), kaskadę wyborów motywu, siedem komponentów na tej podstawie i laboratorium, w którym boczny panel zmienia każdy wybór silników, a ekran „Nakładki w nakładkach” pokazuje wynik w kompozycji. Wygląd ustawia prowadzący według W1–W20 i wartości przeniesionych z v2; to punkt startu do rund po komponencie, nie wersja ostateczna (decyzja właściciela 31.10).

## Rezultat użytkownika

Właściciel uruchamia `bun run dev`, otwiera http://localhost:3000 i:

- w bocznym panelu przełącza tryb, akcent, odcień czerni, rogi, krzywą, gęstość, domyślny rozmiar, ruch, neon, materiał i profil typografii; cały ekran przebudowuje się od razu, a wybór zostaje po odświeżeniu;
- na stronie `/foundation` widzi próbki wyjść wszystkich silników i gołe przepisy;
- na ekranie `/screens/overlays` („Nakładki w nakładkach”) widzi przyciski, pola, toggle group i menu na stronie, w karcie, w popoverze, w dialogu i w podmenu, z tym samym wyglądem i koncentrycznym promieniem;
- widzi sliding w menu (pionowo) i w toggle group (poziomo) w trybach `spring` (jak mangashift.com), `elastic` (jak v2, widoczne odbicie), `firm` i `off`, oraz przelot tooltipa i podmenu;
- na stronie `/components` widzi każdy z 7 komponentów w kilku sytuacjach.

## Warunki końcowe

- [ ] Dziewięć plików `engines/<silnik>.css` o jednym kształcie; strażnik warstw zielony; publiczne zmienne `--ts-*` ≤ 250 (B8), test liczy > 0 i ≤ 250.
- [ ] Pięć przepisów w `recipes/`, wartości wyłącznie z wyjść silników, `--_*` i liczb `0`, `1`, `-1`, `100%`.
- [ ] Motyw `mangashift`; kaskada domyślne → motyw → zapis użytkownika → system działa bez mignięcia przy starcie.
- [ ] Siedem komponentów bez własnego wyglądu, każdy z `docs/<nazwa>.md`, na `/screens/overlays` i `/components` (F12).
- [ ] Ruch tylko `transform`/`opacity`, stany przez nakładkę z `opacity` (N8); zachowania F15 dla menu, slidingu, tooltipów i podmenu mają testy i przechodzą.
- [ ] Trace na `/screens/overlays`: 0 animacji poza wyjątkami (B1), także dla „wciśnij i jedź do ściany”; ≤ 2 `backdrop-filter` naraz (Q14).
- [ ] `bun run check` (z testami przeglądarkowymi) i `prek run --all-files` (z `SKIP=no-commit-to-branch`) zielone, także na świeżym klonie.
- [ ] Właściciel ocenił silniki (checkpoint 1) i ekran z ruchem (checkpoint 2); recenzja kodu bez uwag krytycznych i poważnych.

## Nie-cel

Dopracowany wygląd każdego komponentu (rundy po komponencie po E2) i pozostałe 13 komponentów pierwszej rundy F10 (20 − 7; E3).

## Authority i baseline

| Źródło                                                                                                                                 | Co rozstrzyga                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docs/specification.md`                                                                                                                | U, W, F, Q, B, I, Z; jedyne źródło decyzji (zmiany z tego planu wchodzą w fazie 0) |
| `docs/plans/masterplan.md`, `docs/structure.md`                                                                                        | etap, bramki, drzewo i reguły wzrostu                                              |
| `docs/decisions/e0-concentric.md`, `e0-motion.md`, `e1-source-condition.md`                                                            | sposób B promienia, tryby ruchu, laboratorium czyta `dist`                         |
| `docs/research/r1-engines.md` §4–7, `r2-behavior.md`, `r3-performance.md`, `r5-v2-audit.md`                                            | kontrakty silników, Base UI, budżety                                               |
| `docs/research/e2-facts-color.md`, `e2-facts-shape.md`, `e2-facts-motion.md`                                                           | fakty z v2, starego kitu i strony z pointerami                                     |
| `docs/research/e2-prior-art.md`, `e2-package-layout.md`                                                                                | gotowe biblioteki (żadna nowa zależność poza Base UI i fontami) i układ paczek npm |
| `docs/reviews/e2-plan-spec.md`, `e2-plan-tech.md`                                                                                      | uwagi do rundy 1; każda rozstrzygnięta w tym planie (tabela na końcu)              |
| `docs/research/inspiration.md`                                                                                                         | wejście do rund po komponencie                                                     |
| MangaShift `docs/plans/ui-kit/research/owner-colour-intent.md`, `owner-type-layout-intent.md`, `prototypes/colors-v7-opus-a-tokens.js` | słowa właściciela o kolorze i typografii, ostatnia makieta palety                  |

**Baseline (sprawdzony 31.10):** `feat/e2-foundation` = `378bcee`. Paczka: `lib/compose-refs.ts`, `styles/tessera.css` (kolejność `@layer`), reguły ESLint konsumenta, strażnik `test/guards/css-layers.ts` (`ENGINE_GRAPH`, silnik rozpoznany po folderze `engines/<silnik>/`), kontrakt `test/package/`. `tsdown.config.ts` kopiuje tylko `src/styles/**/*.css`. `apps/docs` = pusta strona Next 16.4.3. Base UI 1.9.0 (najnowsze, 9.10.2026) niezainstalowane. `bun run check` zielone (277 testów).

**Znane wcześniejsze failures:** CI na GitHubie nie startuje (płatności konta; runner po stronie właściciela).

## Stan aktualny

### Gap

- Brak silników, przepisów, motywu, kaskady, komponentów, slidingu, przelotu okienek i laboratorium.
- Strażnik nie przepuszcza mechanizmów wymaganych przez spec (`@supports`, `@media`, `@font-face`, `:not(`, liczby `0/1` w przepisach, `styles/tailwind.css`, import fontów) i rozpoznaje silnik po folderze.
- Build nie kopiuje CSS spoza `styles/`.
- `check` uruchamia lint przed buildem, więc wtyczka konsumenta czytana z `dist` psuje świeży klon.

### Dowody (skrót; pełne w recenzjach i raportach faktów)

- Strażnik: `css-layers.ts:24-58, 141-221`; build: `tsdown.config.ts:15`; kolejność bramek: korzeniowy `package.json` (`check`), `.pre-commit-config.yaml` (pre-push).
- Wyjścia liczone na `:root` nie widzą wejścia na poddrzewie (`e2-plan-tech.md` P5, eksperyment `stale.mjs`).
- Dwie animacje `scale` na jednym elemencie zdejmują ruch z kompozytora; jazda (`transform`) + osobny element (`scale`) działa (`e2-plan-tech.md` P7, `trace.mjs`).
- Base UI z `Tooltip.Viewport` przelatuje przez `top/left` i `width/height` (`e2-plan-tech.md` M2).
- Playwright WebKit 26.6 wspiera `corner-shape`, Safari stabilne nie (`e2-plan-tech.md` P1).
- Tailwind 4 emituje `--color-*` konsumenta w `@layer theme` (`e2-plan-tech.md` P6).
- Sprężyna strony 420/36: przestrzał 0,31 % (`e2-facts-motion.md` §1).

### Reuse

| Element                                                              | Skąd                                                                            | Forma w v3                                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nazwana paleta (Apple-style), drabina czerni K1–K4, akcenty, statusy | `colors-v7-opus-a-tokens.js`                                                    | `packages/tessera/scripts/palette.ts` (dane) + `scripts/colors.ts` (generator) → `src/engines/color.css`; bez drabinki stanów v7                                    |
| Skala xs–xl                                                          | v2 `scale.css:410-479`                                                          | `engines/size.css`                                                                                                                                                  |
| Stopnie typu, wagi, fonty Inter + Cascadia, metryki fallbacku        | v2 `scale.css:37-49, 490-497`, `font-fallbacks.css`                             | `engines/type.css`; fontsource `wght.css` (pliki podzbiorów ładowane leniwie przez `unicode-range`, więc przeglądarka pobiera tylko używane, np. latin i latin-ext) |
| Gęstość (5 poziomów)                                                 | v2 `scale.css:533-578`                                                          | `engines/space.css`                                                                                                                                                 |
| Formuła kształtu (REF, 1,6, 0,45, padding optyczny, boczny padding)  | v2 `lib/shape.ts`, `_internal/control.css:15-30`                                | `engines/shape.css`; przypadki `shape.test.ts` jako oczekiwane wartości w `lab.spec.ts`                                                                             |
| Sposób B promienia                                                   | `decisions/e0-concentric.md`                                                    | `engines/shape.css`                                                                                                                                                 |
| Cienie, poziomy, materiał, neon                                      | v2 `colors.css`, `scale.css:323-339`, `settings.css:137-197`                    | `engines/depth.css`                                                                                                                                                 |
| Fokus 2/2 px, wygaszanie przy wskaźniku                              | v2 `scale.css:259-260`, `base.css:80-88`, `lib/input-modality.ts`               | `engines/focus.css`, `recipes/focus.css`, `lib/input-modality.ts`                                                                                                   |
| Kaskada, zapis, anty-FOUC                                            | v2 `theme-store.ts`, `theme-bootstrap.ts`, `theme-script.tsx`                   | `lib/theme.ts`, `lib/theme-script.tsx` (bez migracji legacy)                                                                                                        |
| Algorytm slidingu                                                    | stary kit `sliding/*`, v2 `use-floating-indicator.ts`, `floating-indicator.tsx` | `lib/indicator.ts` na `transform`                                                                                                                                   |
| Sprężyna jako klatki                                                 | `motion-dom` `spring.mjs` (wzór, ok. 40 linii; `e2-prior-art.md` 5b)            | funkcja w `lib/indicator.ts`                                                                                                                                        |
| Korekta zaokrągleń pozycji                                           | Base UI `TabsIndicator.mjs` `getLayoutOffset` (`e2-prior-art.md` 5a)            | pomiar w `lib/indicator.ts`                                                                                                                                         |
| Przelot okienek                                                      | stary kit `sliding/popup-slide.ts` (czysty `transform`)                         | `lib/popup-flight.ts` dla tooltipów i podmenu                                                                                                                       |
| Testy F15                                                            | tabela `e2-facts-motion.md` §5                                                  | `lib/*.test.ts` + `apps/docs/tests/lab.spec.ts`                                                                                                                     |

## Decyzje planu

Decyzje właściciela z 31.10 (ocena 0–10, wdrażane przy ≥ 8) oznaczone [W].

| #   | Decyzja                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Powód                                                                                                                         | Skutek                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | E2 = fundament (wszystkie silniki, przepisy, 7 komponentów, panel, ekran)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | właściciel: najpierw podstawa wszystkiego, potem najlepsza droga per komponent                                                | masterplan E2 zmieniony w fazie 0                                                                                                                                                        |
| D2  | Silniki jako pliki `engines/<silnik>.css` (płasko) [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | jeden plik na silnik; Radix Themes trzyma tokeny jako `styles/tokens/<dziedzina>.css` (`e2-package-layout.md`)                | zmiana F1 („plik o jednym kształcie”, sekcja na `/foundation`) i `checkFor` w strażniku                                                                                                  |
| D3  | Komponenty w folderach według rodziny: `components/<rodzina>/<nazwa>.tsx` [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | konwencja właściciela z MangaShift („folder = rodzina widżetu”); Base UI, Ark, Chakra, Mantine                                | bez zmiany spec                                                                                                                                                                          |
| D4  | Źródłem wartości silników są ich pliki CSS; wyjątek: kolor ma dane w TS i generator w `packages/tessera/scripts/` [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | generator dla 8 silników to warstwa bez zysku; paleta v7 jest liczona i właściciel chce akcentu z jednego koloru              | zmiana U32 i wiersza „Formuła kształtu” w spec; `color.css` generowany i w repo, test zgodności                                                                                          |
| D5  | Prefiks `--ts-` dla wszystkich publicznych zmiennych: wyjścia `--ts-<silnik>-<rola>`, wejścia `--ts-in-<silnik>-<nazwa>` (wejście przypisane do silnika nazwą; domyka punkt z „Przekazane do E2”) [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `--color-*` itd. to przestrzeń Tailwinda i starego kitu MangaShift; biblioteki npm mają prefiks (`--mantine-*`, `--chakra-*`) | `ENGINE_OUTPUT`, `INPUT` w strażniku; test „żadne wyjście bez prefiksu”                                                                                                                  |
| D6  | Tryby ruchu: `spring` (domyślny, sprężyna strony k 420 / c 36), `elastic` (v2: 220 ms, przestrzał 0,1 × h, szczyt w 60 %), `firm` (150 ms `cubic-bezier(0.2,0,0,1)`, × `clamp(1, 1 + 0,25·log2(d / max(rozmiar, 40)), 2)`), `off` (też przy reduced motion) [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                      | właściciel ocenia na żywo; sprężyna strony prawie nie odbija, `elastic` odbija                                                | aktualizacja F6, W20 i `e0-motion.md` w fazie 0                                                                                                                                          |
| D7  | Parametry ruchu mają jedno źródło: silnik `motion` (czasy, krzywe, `press-scale`, parametry sprężyny i `elastic`). Czyta je jedna funkcja `readMotion(element)` w `lib/indicator.ts` (`getComputedStyle` elementu, który ruch dotyczy) przy każdym starcie ruchu, bez pamięci: jeden odczyt stylu na start, nie na klatkę, więc zmiana motywu i osi `motion` poddrzewa działa od następnego ruchu; `lib/popup-flight.ts` i `lib/press.ts` biorą wynik z niej. To odczyt wyjść silnika, nie pomiar kształtu z Q7                                                                                                                                                                                                      | I2; F6                                                                                                                        | test „bez literałów czasu”: w `lib/` żaden czas nie jest liczbą wpisaną w `animate()`, `setTimeout` ani obiekt opcji; stała kroku próbkowania (1/60 s) ma nazwę i jest jedynym wyjątkiem |
| D8  | Pigułka = 2 elementy: jazda (`transform: translate`, WAAPI) i zgniecenie (`transform: scale` przy ścianie, WAAPI, `transform-origin` na ścianie), które też maluje pigułkę. Pigułka się nie wciska [W, 31.10]. Rozmiar zmienia się w jednej klatce. Warstwa pigułki według D31 (część 2): bez `will-change`, warstwa tylko w czasie ruchu                                                                                                                                                                                                                                                                                                                                                                            | trace: dwa ruchy na jednej właściwości jednego elementu = błąd 64 (`e2-plan-tech.md` P7); Q3                                  | FLIP rozmiaru poza E2; B7 według D31                                                                                                                                                     |
| D9  | Zawrócenie w locie: odczyt widocznej pozycji → `cancel()` → nowa animacja z prędkością początkową z poprzedniego lotu; sprężyna kończy się przy 0,5 px od celu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `e2-plan-tech.md` M5; Motion przenosi prędkość                                                                                | test jednostkowy zawrócenia                                                                                                                                                              |
| D10 | Pomiar celu: `getBoundingClientRect` celu minus kontener, podzielone przez skalę kontenera (stary kit `measureRect`) z korektą Base UI `getLayoutOffset`; kontener zawsze pozycjonowany                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `offset*` zaokrągla do pikseli (`e2-plan-tech.md` M3)                                                                         | pomiar tylko w plikach z listy Q7                                                                                                                                                        |
| D11 | Stany przez nakładkę `::after` w przepisie: kolor `--ts-state-ink` (czysty czarny w jasnym, biały w ciemnym) albo akcent, krycie z drabinki W8 (atrament 4/7/10 % jasny, 8/12/16 % ciemny; akcent 8/16/24 %, ramka 25 %; wyłączenie 40 %), przejście `opacity` 100 ms                                                                                                                                                                                                                                                                                                                                                                                                                                                | N8 („nakładka z animowaną opacity, start w E2”), Q2; jedna drabinka (`e2-plan-spec.md` P4, P11)                               | silnik `color` nie ma ról `fill-*`; W8 doprecyzowane w fazie 0                                                                                                                           |
| D12 | Pigułka hover: krycie `--ts-state-indicator` = 10 % w jasnym, 12 % w ciemnym (W14); pigułka active: akcent 16 %, w trybie Contrast atrament 10 % / 16 %                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | W14 wymaga ≥ 10/12 %, a W8 hover w jasnym ma 7 %                                                                              | relacja W8 ↔ W14 zapisana w spec w fazie 0                                                                                                                                               |
| D13 | Promień koncentryczny (sposób B): powierzchnia ma `data-surface` i `data-inset` (`inset`, `group`, `card` = wyjścia `space`). Silnik `shape` publikuje `--ts-shape-inset` (= wybrany odstęp + `--ts-shape-stroke`) i `--ts-shape-surface`. Głębokość 1: R₁ = `REF_surface + spread × inset` (spread: 1 dla `inset`/`group`, 0,5 dla `card`, jak v2). Głębokość N ≥ 2: R_N = c\_{N−1}. Dla dzieci c_N = `max(R_N − inset_N, 4px)`, publikowane jako `--ts-shape-inner`. Na `:root` `--ts-shape-inner` = 9999px, więc kontrolka poza powierzchnią ma własny promień. Popup w portalu = głębokość 1 (`body` i korzeń laboratorium nigdy nie mają `data-surface`). Do 4 poziomów; bez promienia na róg i grup sklejonych | `e2-plan-spec.md` P5, `e2-plan-tech.md` M1; E0 sprawdził tę formułę                                                           | przepis `surface` bierze padding z `--ts-shape-inset` (jedno źródło)                                                                                                                     |
| D14 | Wyjście zależne od wejścia poddrzewa jest deklarowane także w selektorze tego wejścia (`:root, [data-size]`, `[data-surface]`, `[data-level]`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | zmienna dziedziczy wartość już podstawioną (`e2-plan-tech.md` P5)                                                             | przypadek „rozmiar na zagnieżdżonym elemencie” w testach                                                                                                                                 |
| D15 | Squircle: `corner-shape: superellipse(2)`, promień × 1,6 (≤ 45 % wysokości) w `@supports (corner-shape: superellipse(2))`; bez wsparcia łuk × 1. Gałąź zapasową sprawdza test, który usuwa regułę `@supports` przez CSSOM                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Playwright WebKit wspiera `corner-shape`, Safari stabilne nie                                                                 | poprawka opisu środowiska w `e0-concentric.md`                                                                                                                                           |
| D16 | Materiał `translucent` (blur 24 px) dostają tylko popup Popover i popup Dialogu; Menu, podmenu i Tooltip są zawsze `solid`, a tło za dialogiem (`Backdrop`) to sam scrim bez blur. Komponent ustawia `data-material="solid"` na swoich popupach, więc CSS nie musi rozpoznawać „rzędu”                                                                                                                                                                                                                                                                                                                                                                                                                               | Q14 (≤ 2 `backdrop-filter`, ≤ 10 px na ruchomych); najgorszy przypadek na ekranie = Dialog + Popover w nim = 2                | test liczy `backdrop-filter` na ekranie                                                                                                                                                  |
| D17 | Dostawca zachowania: Base UI 1.9.0 dla Menu, Popover, Dialog, Tooltip (bez `Tooltip.Viewport`, `SubmenuTrigger delay={0}`); natywne `<button>`, `<input>`. ToggleGroup: sonda w fazie 5 porównuje Base UI `ToggleGroup`, Base UI `RadioGroup` i własny kod (węzły DOM B5, semantyka, pigułka), wynik w `decisions/e2-base-ui.md` [W]                                                                                                                                                                                                                                                                                                                                                                                 | U18; `e2-prior-art.md` 7                                                                                                      | U18 zmieniane dopiero, gdy sonda wybierze Base UI                                                                                                                                        |
| D18 | Przelot okienek: jeden mechanizm `lib/popup-flight.ts` (WAAPI `transform` na `Popup`, nie na `Positioner`) dla tooltipów w grupie i podmenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Base UI przelatuje przez `top/left` (`e2-plan-tech.md` M2); W16                                                               | menubar w E4 użyje tego samego                                                                                                                                                           |
| D19 | Pole (`field`) = wariant przepisu `control` (N15)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | R1 §6.2; mniej pojęć                                                                                                          | N15 zamknięte w fazie 0                                                                                                                                                                  |
| D20 | Kaskada: domyślne → motyw → zapis (`localStorage` `ts-appearance`, `{ version: 1, choices }`) → system (`mode: system`); walidacja per wartość, rekord innej wersji ignorowany; bez migracji. Panel zapisuje warstwę użytkownika                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U13; zero legacy; klucz v2 `tessera-appearance` zajęty na localhost                                                           | „zapis jako motyw” z U31 → odłożone                                                                                                                                                      |
| D21 | Osie w E2: `mode`, `accent`, `neutral` (K1–K4), `corners`, `curve`, `density`, `size`, `motion` (D6), `neon`, `material`, `profile` (`desktop`: Inter + Cascadia Code, kursor `default`; `web`: te same kroje, kursor `pointer`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U31, W19                                                                                                                      | nowe osie z pierwszym konsumentem                                                                                                                                                        |
| D22 | Testy przeglądarkowe: Playwright w `apps/docs/tests/lab.spec.ts` na static export (`out/`, serwer `tests/serve.ts` na `node:http`, bez nowych typów i zależności), Chromium i WebKit, 1 worker; wartości mierzone na prawdziwych właściwościach (promień, wysokość, padding, kolor), nie na zmiennych; B4 przez `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot` (`addInitScript`)                                                                                                                                                                                                                                                                                                                                 | Q15, O1, `e2-plan-tech.md` M7–M9                                                                                              | `vitest` zostaje dla logiki (wersja nieskompilowana), Playwright na `dist` (skompilowana) = Q13                                                                                          |
| D23 | Lint laboratorium ma dwa nazwane wyjątki w `eslint.config.js`: (1) `lab/foundation-draws-engine-outputs-inline` wyłącza `no-local-appearance` tylko dla `apps/docs/app/foundation/page.tsx`, bo strony `/foundation` rysują próbki stylem inline z `var(--ts-*)`; (2) `lab/first-frame-probe` nie wyłącza reguły, tylko konfiguruje `compositor-motion` z powodem (`animationFrameReason`) dla `apps/docs/tests/lab.spec.ts`, bo test anty-FOUC czyta atrybuty motywu w pierwszej klatce (`requestAnimationFrame`)                                                                                                                                                                                                   | F1 wymaga próbek; szósty przepis „próbka” zmieniałby U10; pierwszej klatki nie da się zmierzyć bez `requestAnimationFrame`    | test w `contracts.test.ts`: dokładna lista bloków laboratorium (nazwa, pliki, reguły) i jedna wyłączona reguła w całej konfiguracji                                                      |
| D24 | Kolejność bramek: typecheck → build → lint → vitest → test:browser, w `check` i w pre-push                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | wtyczka konsumenta czytana z `dist` (`e2-plan-spec.md` P9)                                                                    | kontrola „świeży klon” w gate fazy 6                                                                                                                                                     |
| D25 | Krok 8 E1 (podpięcie desktopu i strony MangaShift, F13) przechodzi do E5 [W]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | komponenty ocenia się w laboratorium; podpięcie ma sens przy migracji                                                         | masterplan: ryzyko „dwa repo” na początku E5, S6 bez zmian                                                                                                                               |
| D26 | Kaskada w trzech plikach: `lib/theme.ts` (czyste funkcje i ciąg skryptu, bez hooków, bez `'use client'`), `lib/use-theme.ts` (`'use client'`, hook), `lib/theme-script.tsx` (komponent serwerowy, importuje tylko `theme.ts`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | hook i komponent serwerowy w jednym pliku nie zbudują się (`e2-plan-round-2.md` P1)                                           | `exports` ma osobny wpis `./lib/theme-script` (`.tsx`)                                                                                                                                   |
| D27 | `exports` paczki: `./lib/*` (`src/lib/*.ts`), `./lib/theme-script` (`src/lib/theme-script.tsx`), `./components/*` (`src/components/*.tsx`, import `@mattymroz/tessera/components/button/button`, jak `@mangashift/ui/src/button/button`), `./themes/*` (`src/themes/*.ts`), `./tessera.css`, `./tailwind.css`, `./eslint`; każdy z `source`/`types`/`default`                                                                                                                                                                                                                                                                                                                                                        | U16; konwencja rodzin z MangaShift                                                                                            | test kontraktu sprawdza każdy wpis                                                                                                                                                       |
| D28 | Commity: praca na `feat/e2-foundation` wymaga lokalnych commitów po każdej fazie (worktree jednostek A–C i kontrola świeżego klonu startują z commita). Właściciel daje zgodę na lokalne commity tego brancha bez pusha na start E2; push i PR tylko na osobne słowo                                                                                                                                                                                                                                                                                                                                                                                                                                                 | reguła „commit tylko na słowo właściciela”; bez commitów kontrola świeżego klonu sprawdza baseline (`e2-plan-round-2.md` P2)  | pytanie do właściciela przy akceptacji planu                                                                                                                                             |

## Zakres

### In scope

- Silniki, przepisy, motyw `mangashift`, `lib/theme.ts`, `lib/use-theme.ts`, `lib/theme-script.tsx`, `lib/indicator.ts`, `lib/popup-flight.ts`, `lib/press.ts`, `lib/input-modality.ts`, generator koloru.
- Komponenty: Button (`solid`, `soft`, `outline`, `ghost`; xs–xl; z ikoną, sama ikona), Input (`field`), ToggleGroup (sliding poziomo), Menu (pozycje, separator, etykieta grupy, podmenu, checkbox; sliding pionowo, przelot podmenu), Popover, Dialog (tytuł, opis, akcje), Tooltip (grupa z przelotem).
- Neon `mini` i `full` jako poświata na `control solid` z akcentem kolorowym i na fokusie (W11); orby poza E2.
- `packages/tessera/docs/<nazwa>.md` dla 7 komponentów.
- Laboratorium: `/`, `/foundation`, `/components`, `/screens/overlays`, panel w układzie.
- Strażnicy i testy z sekcji „Plan wykonania”.
- Aktualizacja spec, masterplanu, `structure.md`, `e1-repo.md`, `e0-motion.md`, `e0-concentric.md`, `AGENTS.md` (faza 0 i 8).

### Out of scope

- Motyw `mangashift-site`, sekcje strony, migracja strony (U29).
- Pozostałe komponenty F10, w tym Context menu (E3), Alert Dialog i Confirm (E3), Card jako komponent (E3); ekrany Ustawienia, Panel roboczy, Wycinek strony (E3).
- Scena „stress”, B2–B7 w CI, `bun run perf`, axe (E3).
- Menubar, Alt/F10, Tab między menu (E4); pasek przewijania „lane” (E3, z listą i drzewem).
- Grupy przycisków A/B, grupy sklejone, promień na róg (E3).
- Orby neonu (E3, ekran Panel roboczy).
- `llms.txt`, generator dokumentacji API, README paczki (przy N3).

### Forbidden

- Wartości wyglądu w komponentach (F7, I1, Z1); własny `:focus-visible` w komponencie (F8); CSS komponentu importowany z `.tsx` (tylko przez `tessera.css`).
- Pomiar DOM poza plikami z listy Q7 (`lib/indicator.ts`, `lib/popup-flight.ts`); zapis zmiennych z JS na `:root`/`body` poza zmianą motywu (Q6).
- Animowanie `width`, `height`, `margin`, `box-shadow`, `background-color`, promienia blur, `grid-template-*` (Z4, Q2); `linear()`, `playbackRate ≠ 1` (Q5); kopie DOM wskaźnika (Z6); dwie animacje tej samej właściwości na jednym elemencie.
- Kontekst React dla motywu i wariantów (Q8); runtime CSS-in-JS (Q1).
- Nazwy v2 (`--primary`, `--card`, `--ink-*`), migracje legacy, kopiowanie kodu v2 bez przepisania (Z3).
- Komendy git u subagentów; commit i push bez słowa właściciela; edycja plików inaczej niż Edit/Write; `bun run test`.
- Status „gotowe” przed oceną właściciela (Z9).

### Deferred

- Profile typografii poza `desktop`, presety zachowania tekstu (W19) → z pierwszym konsumentem.
- Akcent z dowolnego koloru (generator `trioFrom`) w panelu → gdy aplikacja go potrzebuje.
- Zapis wyboru jako motyw (U31) → po E2.
- FLIP rozmiaru pigułki → gdy skok rozmiaru będzie widoczny na żywo.

### Dozwolone decyzje lokalne

- Nazwy funkcji i podział kodu wewnątrz pliku; układ stron laboratorium.
- Liczby, których spec nie ustala (czas zgniecenia, cienie w granicach v2), z zapisem w `docs/` komponentu albo w komentarzu WHY w silniku.
- Nowe warianty i sloty istniejących przepisów (np. `row` `group-label`, `separator`; typografia slotu `header` w `surface`).
- Rozszerzenie białej listy słów kluczowych strażnika o słowo CSS z powodem w teście.

### Zatrzymaj się i wróć po decyzję, gdy

- wartość W1–W20 jest niewykonalna albo sprzeczna z inną;
- B8 > 250;
- Base UI wymusza ruch poza kompozytorem bez obejścia na `Popup` (N7);
- ekran wymaga promienia na róg, grup sklejonych albo komponentu spoza zakresu;
- trzeba zmienić graf U8 albo dodać silnik lub przepis;
- sposób B nie działa z portalami Base UI.

## Kontekst do przeczytania

1. `AGENTS.md`, `docs/specification.md` (full).
2. Ten plan (full).
3. `docs/research/e2-facts-shape.md`, `e2-facts-motion.md`, `e2-facts-color.md`, `e2-prior-art.md` (full).
4. `docs/reviews/e2-plan-tech.md` (full): eksperymenty i pułapki mechanizmów.
5. `docs/decisions/e0-concentric.md`, `e0-motion.md`.
6. `packages/tessera/test/guards/css-layers.ts`, `src/eslint/no-local-appearance.ts`, `no-local-css.ts`.

Warunkowo: faza 2 kolor → `owner-colour-intent.md`, `colors-v7-opus-a-tokens.js` (full); faza 5 → dokumentacja Base UI (Menu, Popover, Dialog, Tooltip, ToggleGroup, RadioGroup) w `node_modules/@base-ui/react/docs/`, stary kit `sliding/*`, `motion-dom` `spring.mjs`.

## Impact scan

| Kontrakt                     | Ryzyko                                                                                                                   | Obowiązek                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `exports` paczki             | nowe `./components/*`, `./themes/*`, `./tailwind.css`                                                                    | `test/package/*` rozszerzone; `'use client'` tylko w plikach z hookami                                                                |
| Build (`tsdown.config.ts`)   | bez zmiany `dist` nie ma CSS silników i przepisów                                                                        | `copy` dla `src/{engines,recipes,components}/**/*.css` z zachowaniem ścieżek; test: każdy `@import` w `dist` wskazuje istniejący plik |
| `tessera.css`                | jedyne miejsce kolejności `@layer` (I4); nazwy warstw te same co w Tailwind (`theme`, `base`, `components`, `utilities`) | pliki silników i przepisów deklarują własną warstwę, `tessera.css` importuje je bez `layer()` (jedna forma)                           |
| Strażnik                     | zmiany list mogą otworzyć furtkę                                                                                         | każda zmiana z fixture `bad/`; `@media (hover: hover)` przechodzi z `bad/` do `good/` jako świadoma zmiana                            |
| Reguły ESLint konsumenta     | lint laboratorium i świeży klon                                                                                          | D23, D24                                                                                                                              |
| Pre-push                     | czas rośnie o Playwright                                                                                                 | pomiar w fazie 6; przy > 3 min decyzja właściciela                                                                                    |
| Laboratorium (static export) | brak serwera, hydracja z atrybutami anty-FOUC                                                                            | `tests/serve.ts`; `suppressHydrationWarning` na `<html>`; `ThemeScript` jako komponent serwerowy                                      |

## Target design

### Silnik (U9)

```text
engines/<silnik>.css
  @layer theme {
    :root, [data-<wejście>=…] { --ts-in-*, --_ts-<silnik>-*, --ts-<silnik>-<rola> }
    @supports / @media z białej listy (całe prelude): (corner-shape: superellipse(2)), (prefers-reduced-motion: reduce),
                                                     (pointer: coarse), (prefers-contrast: more)
  }
  @property --ts-… (tylko zmienne animowane)
  @font-face (tylko engines/type.css, z białą listą deskryptorów)
```

Silnik czyta tylko wyjścia silników z wcześniejszych pięter U8; `--_ts-<silnik>-*` czyta tylko on sam (nowa reguła strażnika).

### Wyjścia silników

| Silnik   | Wejścia                                                                           | Wyjścia `--ts-<silnik>-*`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ~   |
| -------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| `color`  | `data-mode`, `data-accent` (contrast + 19), `data-neutral` (k1–k4)                | nazwy z v7 bez zmian (statusy z mapowania `STATUS` v7 na trójki akcentów; `scrim` z v2 `colors.css:291-297`, 18 % / 40 %): `background`, `secondary-background`, `tertiary-background`, `raised-background`, `inverse-background`, `chip`, `tooltip`, `label`, `secondary-label`, `hint-label`, `tertiary-label`, `quaternary-label`, `inverse-label`, `tooltip-label`, `inverse-hover`, `inverse-press`, `thumb`, `separator`, `opaque-separator`, `control-border`, `tint`, `tint-bright`, `tint-dim`, `on-tint`, `glow`, `success`, `warning`, `danger`, `info` + `on-*`, `scrim` | ~38 |
| `type`   | `data-profile`                                                                    | `family-sans`, `family-mono`, `family-heading`; `mini`, `small`, `detail`, `body`, `title`, `screen-title` × `size`/`leading`; `weight-regular`, `weight-medium`, `weight-semibold`; `tracking-caps`                                                                                                                                                                                                                                                                                                                                                                                 | ~22 |
| `motion` | `data-motion` (spring/elastic/firm/off), reduced motion                           | `duration-instant` 50, `duration-fast` 100, `duration-slide` 150, `duration-emphasized` 200, `duration-overlay` 250, `duration-elastic` 220; `ease-standard`, `ease-out`, `ease-emphasized`, `ease-spring`; `press-scale` 0,97; `spring-stiffness` 420, `spring-damping` 36; `elastic-overshoot` 0,1; `mode` (słowo trybu)                                                                                                                                                                                                                                                           | 15  |
| `space`  | `data-density`                                                                    | `inset` 4–8, `group` 8–16, `card` 16–32, `card-small` 12–20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 4   |
| `size`   | `data-size` (xs–xl, poddrzewo)                                                    | `height`, `text`, `leading`, `icon`, `gap`, `hit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 6   |
| `shape`  | `data-corners`, `data-curve`, `data-surface`, `data-inset`, `--ts-in-radius`      | `control`, `control-side`, `control-side-icon`, `corner`, `surface`, `inset`, `inner`, `stroke`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 8   |
| `depth`  | `data-level` (sunken, base, raised, overlay, modal), `data-material`, `data-neon` | per poziom `bg`, `border`, `shadow`; `blur`; `layer-overlay`, `layer-modal`, `layer-tooltip`; `glow`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ~20 |
| `state`  | pośrednio przez `color`; `data-profile`                                           | `ink`, `rest`, `hover`, `press` (krycie W8), `tint-rest`, `tint-hover`, `tint-press`, `tint-border`, `indicator`, `indicator-active`, `disabled`, `cursor` (`default` w `desktop`, `pointer` w `web`)                                                                                                                                                                                                                                                                                                                                                                                | 12  |
| `focus`  | pośrednio                                                                         | `width` 2, `offset` 2, `offset-inset` −2, `color`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 4   |

Razem ~128 (B8 ≤ 250). F6 w fazie 0: „~15 wyjść, w tym parametry sprężyny i `elastic`; klatki liczy `lib/indicator.ts`”.

### Przepisy

Plik `recipes/<nazwa>.css` w `@layer components`; selektor `[data-recipe="<nazwa>"]` i warianty `data-variant`, `data-size`, `data-level`, `data-surface`, `data-inset`; stany z atrybutów Base UI i natywnych; hover tylko w `@media (hover: hover)`. Wartości: wyjścia silników, `--_*`, `calc/min/max/clamp`, liczby `0`, `1`, `-1`, `100%`.

| Przepis     | Sloty                      | Warianty                                                         | Stany                                                                                                       |
| ----------- | -------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `control`   | `icon`, `label`            | `solid`, `soft`, `outline`, `ghost`, `field`; xs–xl; `icon-only` | hover, press (`scale`), disabled — nakładka `::after` (D11); `solid` z akcentem: poświata `--ts-depth-glow` |
| `surface`   | `header`, `body`, `footer` | `level` × `material`; `inset`/`group`/`card`                     | —                                                                                                           |
| `row`       | `lead`, `label`, `trail`   | `default`, `danger`, `group-label` (W18), `separator`            | highlighted (tło daje pigułka), disabled                                                                    |
| `indicator` | `squash`                   | `hover`, `active`; oś `x`/`y`                                    | widoczny lub schowany (`opacity`); bez wciśnięcia                                                           |
| `focus`     | —                          | `outer`, `inset`                                                 | `:focus-visible` bez `[data-input="pointer"]`; poświata `--ts-depth-glow` przy neonie                       |

### Komponenty

| Komponent   | Plik                                       | Zachowanie                                                                                                                                                                         | Przepisy                                           |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Button      | `components/button/button.tsx`             | natywny `<button>`, `lib/press.ts`                                                                                                                                                 | `control`, `focus`                                 |
| Input       | `components/input/input.tsx`               | natywny `<input>`                                                                                                                                                                  | `control` `field`, `focus`                         |
| ToggleGroup | `components/toggle-group/toggle-group.tsx` | według sondy D17                                                                                                                                                                   | `control` `ghost`, `indicator`, `surface`, `focus` |
| Menu        | `components/menu/menu.tsx`                 | Base UI Menu (Root, Trigger, Portal, Positioner, Popup, Item, Separator, Group, GroupLabel, SubmenuRoot, SubmenuTrigger `delay={0}`, CheckboxItem), pigułka hover, przelot podmenu | `surface` `overlay`, `row`, `indicator`, `focus`   |
| Popover     | `components/popover/popover.tsx`           | Base UI Popover                                                                                                                                                                    | `surface` `overlay`                                |
| Dialog      | `components/dialog/dialog.tsx`             | Base UI Dialog; wejście z animacją (W16)                                                                                                                                           | `surface` `modal`                                  |
| Tooltip     | `components/tooltip/tooltip.tsx`           | Base UI Tooltip + Provider, bez Viewport; przelot przez `lib/popup-flight.ts`                                                                                                      | `surface` `overlay` `solid`, kolor `tooltip`       |

### Sliding (`lib/indicator.ts`)

```text
parametry ruchu: z wyjść silnika motion, czytane raz po zmianie motywu (subskrypcja lib/theme)
cel = pierwszy podłączony: hover > focus > active        (hover nie wchodzi pod active)
brak celu -> opacity 0 (duration-instant), pozycja zostaje
pomiar: rect celu − rect kontenera, / skala kontenera, korekta zaokrągleń (D10)
  ten sam cel, różnica < 0,5 px -> nic
  pierwsze pokazanie -> pozycja i rozmiar od razu, opacity 0 -> 1
  ten sam cel, inna geometria -> od razu, bez animacji
  nowy cel -> rozmiar od razu (jedna klatka); jazda translate z widocznej pozycji:
     spring: klatki z parametrów sprężyny, koniec przy 0,5 px, prędkość początkowa z poprzedniego lotu
     elastic: klatki v2 (szczyt w 60 %, przestrzał 0,1 × h, ≤ połowa dystansu)
     oba: przestrzał przycięty do wewnętrznej krawędzi rodzica; nadwyżka -> squash: scale w osi ruchu,
          transform-origin na ścianie
     firm: cubic-bezier, czas × clamp(1, 1 + 0,25·log2(d / max(rozmiar, 40)), 2)
     off: od razu
  zawrócenie: odczyt pozycji -> cancel() -> nowa animacja (D9)
wciśnięcie: pigułka się nie wciska
will-change: transform tylko na czas ruchu
```

### Kaskada motywu (`lib/theme.ts`)

- `lib/theme.ts`: osie D21 (nazwy, wartości, domyślne), `resolve(defaults, theme, saved)`, storage z walidacją, `apply(choices)` → `data-*` na `<html>` i zdarzenie zmiany motywu, ciąg skryptu anty-FOUC (serializacja tych samych funkcji). Bez hooków.
- `lib/use-theme.ts`: `'use client'`, `useTheme()` na `useSyncExternalStore`, zdarzenie `storage`, `prefers-color-scheme` dla `mode: system`.
- `lib/theme-script.tsx`: komponent serwerowy `<ThemeScript theme={mangashift} />`.
- `themes/mangashift.ts`: wybory motywu.

### Laboratorium

| Trasa               | Plik                            | Treść                                                                      |
| ------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `/`                 | `app/page.tsx`                  | spis stron                                                                 |
| `/foundation`       | `app/foundation/page.tsx`       | sekcja na każdy silnik (próbki wszystkich wyjść, F1) i gołe przepisy (U21) |
| `/components`       | `app/components/page.tsx`       | każdy komponent w kilku sytuacjach (F12)                                   |
| `/screens/overlays` | `app/screens/overlays/page.tsx` | „Nakładki w nakładkach” (F11)                                              |

Panel wyborów: `app/panel.tsx`, montowany w `app/layout.tsx` (w app routerze trasą jest tylko `page.tsx`, więc sąsiedni plik nią nie jest). Osie w panelu wybiera się z Menu (jeden otwarty popup naraz), a ToggleGroup obsługuje tylko tryb jasny/ciemny; to trzyma B7. Ekran „Nakładki”: wyspa (`surface base`, `inset`) z paskiem narzędzi (Button `ghost` icon-only + Tooltip w grupie), ToggleGroup, Input z Button; karta (`raised`, `card`) z tym samym zestawem; Popover z polem i przyciskami, z którego Menu z podmenu i checkboxem; Dialog z polem, ToggleGroup i Menu. Każdy element na 1., 2. i 3. poziomie.

### Docelowe drzewo

Każdy plik, który E2 tworzy albo zmienia; pozostałe bez zmian. Folder powstaje z pierwszym plikiem (Z8).

```text
tessera/
├── AGENTS.md                                    # MODIFY: faza 0 kolejność bramek i generate:colors; faza 8 test:browser i pułapki E2
├── package.json                                 # MODIFY: faza 0 check = typecheck → build → lint → vitest; faza 3 + test:browser
├── eslint.config.js                             # MODIFY (faza 3): wtyczka konsumenta dla apps/docs/**; wyjątek D23 dla app/foundation/page.tsx
├── .pre-commit-config.yaml                      # MODIFY: faza 0 pre-push w kolejności D24; faza 3 + test:browser
├── .gitignore                                   # MODIFY (faza 3): apps/docs/test-results/, apps/docs/playwright-report/
├── docs/
│   ├── specification.md                         # MODIFY (faza 0): U9 (--ts-), U19/U20 (wyjątek D23), U31, U32, F1, F3, F4, F6,
│   │                                            #   W8↔W14, W20, N8, N15, Q13 (D22); wiersz „Formuła kształtu”
│   ├── structure.md                             # MODIFY (faza 0): to drzewo i reguły wzrostu (plik silnika, prefiks, Playwright,
│   │                                            #   test/package/budget.test.ts, scripts/ w paczce)
│   ├── plans/masterplan.md                      # MODIFY (faza 0): E2 = fundament, liczby F10, D25
│   ├── plans/e1-repo.md                         # MODIFY (faza 0): krok 8 → E5
│   ├── plans/e2-foundation.md                   # CREATE: ten plan
│   ├── decisions/e0-motion.md                   # MODIFY (faza 0): tryby D6
│   ├── decisions/e0-concentric.md               # MODIFY (faza 0): WebKit Playwrighta ≠ Safari stabilne
│   ├── decisions/e2-base-ui.md                  # CREATE (faza 5): N7, sonda ToggleGroup
│   ├── research/e2-facts-{color,shape,motion}.md   # CREATE teraz, DELETE w fazie 8 (wiedza w kodzie i spec)
│   ├── research/e2-prior-art.md, e2-package-layout.md   # CREATE: wejście planu, zostają jako uzasadnienie decyzji
│   ├── research/inspiration.md                  # CREATE: katalog inspiracji
│   ├── reviews/e2-plan-spec.md, e2-plan-tech.md, e2-plan-round-2.md   # CREATE: recenzje planu
│   ├── reviews/e2-code-{engines,behavior,lab}.md   # CREATE (faza 7)
│   └── session-logs/                            # KEEP: przeniesione z MangaShift
├── packages/tessera/
│   ├── package.json                             # MODIFY: exports według D27; deps @base-ui/react,
│   │                                            #   @fontsource-variable/inter, @fontsource-variable/cascadia-code; script generate:colors
│   ├── tsconfig.json                            # MODIFY: include + scripts
│   ├── tsdown.config.ts                         # MODIFY: copy src/{engines,recipes,components,styles}/**/*.css → dist z flatten: false
│   │                                            #   (domyślne true nadpisałoby engines/focus.css plikiem recipes/focus.css)
│   ├── scripts/
│   │   ├── palette.ts                           # CREATE: dane palety v7 (bez drabinki stanów)
│   │   └── colors.ts                            # CREATE: generator → src/engines/color.css
│   ├── docs/
│   │   └── button.md, input.md, toggle-group.md, menu.md, popover.md, dialog.md, tooltip.md   # CREATE
│   ├── src/
│   │   ├── engines/
│   │   │   ├── color.css                        # CREATE: GENERATED (scripts/colors.ts)
│   │   │   └── type.css, motion.css, space.css, size.css, shape.css, depth.css, state.css, focus.css   # CREATE
│   │   ├── recipes/
│   │   │   └── control.css, surface.css, row.css, indicator.css, focus.css   # CREATE
│   │   ├── themes/
│   │   │   └── mangashift.ts                    # CREATE
│   │   ├── components/
│   │   │   ├── button/button.tsx                # CREATE
│   │   │   ├── input/input.tsx                  # CREATE
│   │   │   ├── toggle-group/toggle-group.tsx    # CREATE
│   │   │   ├── menu/menu.tsx                    # CREATE
│   │   │   ├── popover/popover.tsx              # CREATE
│   │   │   ├── dialog/dialog.tsx                # CREATE
│   │   │   └── tooltip/tooltip.tsx              # CREATE
│   │   ├── lib/
│   │   │   ├── compose-refs.ts, compose-refs.test.ts   # KEEP
│   │   │   ├── theme.ts, theme.test.ts          # CREATE: czyste funkcje kaskady i ciąg skryptu (D26)
│   │   │   ├── use-theme.ts                     # CREATE: 'use client', hook
│   │   │   ├── theme-script.tsx                 # CREATE: komponent serwerowy
│   │   │   ├── indicator.ts, indicator.test.ts  # CREATE
│   │   │   ├── popup-flight.ts, popup-flight.test.ts   # CREATE
│   │   │   ├── press.ts, press.test.ts          # CREATE
│   │   │   └── input-modality.ts, input-modality.test.ts   # CREATE
│   │   ├── eslint/                              # KEEP
│   │   └── styles/
│   │       ├── tessera.css                      # MODIFY: fontsource wght.css + importy silników i przepisów
│   │       └── tailwind.css                     # CREATE: @theme inline, most --ts-space-* do utility
│   └── test/
│       ├── guards/
│       │   ├── css-layers.ts, css-layers.test.ts   # MODIFY: faza 1
│       │   ├── fixtures/good/**, fixtures/bad/**    # MODIFY: silniki płasko, nowe przypadki
│       │   └── contracts.test.ts                # CREATE: na src: 9 silników = ENGINE_GRAPH; klucze motywu ⊂ osie;
│       │                                        #   docs + 2 strony; lista plików pomiaru DOM (Q7); lib bez literałów czasu (D7);
│       │                                        #   color.css = generator; jedna lista właściwości układu dla strażnika i ESLint
│       └── package/
│           ├── helpers.ts, package.test.ts, use-client.test.ts, side-effects.test.ts   # MODIFY: exports D27, importy CSS w dist
│           └── budget.test.ts                   # CREATE: na dist: B8 (> 0, ≤ 250), każde wyjście z prefiksem --ts-
└── apps/docs/
    ├── package.json                             # MODIFY: tailwindcss, @tailwindcss/postcss, @playwright/test; script test:browser
    ├── postcss.config.mjs                       # CREATE
    ├── playwright.config.ts                     # CREATE: Chromium + WebKit, 1 worker, webServer = bun tests/serve.ts
    ├── app/
    │   ├── layout.tsx                           # MODIFY: ThemeScript, globals.css, panel, nawigacja
    │   ├── page.tsx                             # MODIFY: spis stron
    │   ├── globals.css                          # CREATE: importy tailwindcss, tessera.css, tailwind.css
    │   ├── panel.tsx                            # CREATE
    │   ├── foundation/page.tsx                  # CREATE
    │   ├── components/page.tsx                  # CREATE
    │   └── screens/overlays/page.tsx            # CREATE
    └── tests/
        ├── serve.ts                             # CREATE: node:http dla out/ (ścieżka → ścieżka.html)
        └── lab.spec.ts                          # CREATE: wartości, zachowania F15 z klawiaturą, trace B1, Q14, B4, B7, anty-FOUC,
                                                 #   nagranie trybów ruchu (wynik poza repo, *.webm jest ignorowane)
```

## Plan wykonania

### Faza 0: dokumenty, kolejność bramek, zależności

**Działania:**

1. Spec: U9 (prefiks `--ts-`, wejścia `--ts-in-<silnik>-*`, D5), U19/U20 (wyjątek próbek D23), U31 (D20, D21), U32 i wiersz „Formuła kształtu” (D4), F1 (plik silnika, sekcja na `/foundation`), F3 (padding w `shape`), F4 (warstwy z-index tylko dla `overlay`, `modal`, `tooltip`), F6 (D6, D7), W8 doprecyzowane i relacja z W14 (D11, D12), W20 (D6), N8 i N15 zamknięte (D11, D19), Q13 (vitest = wersja nieskompilowana, Playwright = skompilowana, D22); U18 bez zmian do sondy.
2. Masterplan (E2 = fundament, E3 = 13 pozostałych komponentów F10, plan `e2-foundation.md`, D25), `e1-repo.md`, `e0-motion.md`, `e0-concentric.md`, `structure.md` (drzewo i reguły wzrostu z tego planu).
3. Kolejność bramek D24 w korzeniowym `package.json` i `.pre-commit-config.yaml` (bez `test:browser`, który dochodzi w fazie 3 razem z pierwszym testem); `AGENTS.md`: nowa kolejność i `generate:colors`.
4. `bun add @base-ui/react @fontsource-variable/inter @fontsource-variable/cascadia-code` (paczka); `bun add -d tailwindcss @tailwindcss/postcss @playwright/test` (`apps/docs`); `bunx playwright install chromium webkit`.

**Kontrola:** `bun run check`. **Gate:** zielone; spec bez sprzeczności z planem (sprawdza recenzja fazy 7).

### Faza 1: strażnicy

**Działania (`css-layers.ts` + fixture `good/` i `bad/` dla każdej zmiany):**

1. Silnik rozpoznany po pliku `engines/<silnik>.css` (D2); wyjścia `--ts-<silnik>-*`, wejścia `--ts-in-*`, prywatne `--_ts-<silnik>-*` czyta tylko właściciel.
2. At-rules w silnikach: `@layer theme`, `@property`, `@supports`/`@media` z dokładnymi prelude z „Silnik”, `@font-face` tylko w `type.css` z listą deskryptorów (`font-family`, `src`, `font-weight`, `font-style`, `font-display`, `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`, `unicode-range`); `bad/` dla `or`/`and`/`not` w prelude.
3. Selektory silników: `:root`, `[data-*]`, potomek i `:not(` z tych samych elementów.
4. Przepisy: `@media (hover: hover)` (fixture przechodzi z `bad/` do `good/`), liczby `0`, `1`, `-1`, `100%`.
5. `styles/`: `tessera.css` = `@layer` + importy względne + importy fontsource z listy; `tailwind.css` = tylko `@theme inline` z `var(--ts-*)`.
6. Domknięcia z „Przekazane do E2”: selektory komponentów (`:focus-visible`, `*`), reguły komponentu poza `@layer components`, wejścia przypisane do silnika (D5), jedna lista właściwości układu w jednym module, z której czyta strażnik i reguła ESLint `style-policy`.
7. `contracts.test.ts` i `test/package/budget.test.ts`; wymagania „> 0” (9 silników, B8) włączane w fazie 3, kiedy silniki istnieją.

**Kontrola:** `bunx vitest run packages/tessera/test/guards`. **Gate:** każdy `bad/` oblewa, każdy `good/` przechodzi.

### Faza 2: silniki bez zależności (`color`, `type`, `motion`, `space`)

**Działania:**

1. Kolor (jednostka A): `scripts/palette.ts` z v7 (bez `TINT_ALPHA`, `fills`, `disabled`, `container`), `scripts/colors.ts` → `src/engines/color.css`, `generate:colors`; sprawdzenie w `contracts.test.ts`.
2. `type.css` (stopnie, wagi, rodziny, `@font-face` fallbacku); importy `@fontsource-variable/inter/wght.css` i `@fontsource-variable/cascadia-code/wght.css` w `tessera.css`.
3. `motion.css` (15 wyjść, `data-motion`, reduced motion = `off`); `space.css`.
4. `tsdown.config.ts` (`copy`), test kontraktu: importy CSS w `dist` wskazują istniejące pliki.

**Kontrola:** strażnik, `bun run build`. **Gate:** cztery silniki w `dist`.

### Faza 3: silniki zależne, kaskada, panel, `/foundation`

**Działania:**

1. `size.css`, `shape.css` (D13, D14, D15), `depth.css` (D16), `state.css` (D11, D12), `focus.css`.
2. `lib/theme.ts`, `lib/use-theme.ts`, `lib/theme-script.tsx`, `themes/mangashift.ts` (jednostka B).
3. Laboratorium: `postcss.config.mjs`, `globals.css`, `layout.tsx` (`suppressHydrationWarning` na `<html>`), `panel.tsx` (natywne kontrolki do fazy 6), `page.tsx`, `foundation/page.tsx` (D23); `eslint.config.js` z wtyczką konsumenta i wyjątkiem D23.
4. `playwright.config.ts`, `tests/serve.ts`, `.gitignore`, `test:browser` w `check` i pre-push, `lab.spec.ts` (część „silniki”): tabela rozmiarów, promienie 5 rogów × 2 krzywe × 5 rozmiarów, gałąź zapasowa squircle (D15), koncentryczność (przypadki E0 + kontrolka poza powierzchnią + popup w portalu), rozmiar na zagnieżdżonym elemencie (D14), drabinka stanów, anty-FOUC (pierwsza klatka ma atrybuty zapisu), B4 (0 commitów przy zmianie osi).

**Kontrola:** `bunx vitest run`, `bun run test:browser`, B8. **Gate:** zielone.

**Human checkpoint 1:**

```text
Uruchom: bun run dev → http://localhost:3000/foundation
Zrób: przełącz w panelu tryb, akcent, czerń K1–K4, rogi, krzywą, gęstość, rozmiar, neon, materiał
Oczekiwany rezultat: próbki zmieniają się od razu; ciemny nie jaśniejszy niż #101012, jasny mleczny;
      rogi i squircle zgodne z oczekiwaniem; nazwy ról kolorów czytelne
Zwróć uwagę na: kolory, kontrast tekstu, cienie, promienie, rozmiary, krycie stanów
Przekaż wynik jako: „zmień X w sekcji Y” albo „OK”
```

**Gate:** uwagi wprowadzone albo zapisane jako decyzja; nazwy wyjść zamrożone.

### Faza 4: przepisy

**Działania:** `recipes/*.css` według tabeli; sekcja przepisów na `/foundation` (wariant × rozmiar × poziom, w kartach i popupach); `lab.spec.ts`: padding kontrolki identyczny poza powierzchnią i w niej (W4), promień kontrolki w powierzchniach 1–3, nakładka stanu zmienia tylko `opacity`.

**Gate:** strażnik i testy zielone.

### Faza 5: zachowanie

**Działania:**

1. `lib/press.ts`, `lib/input-modality.ts` (+ testy).
2. `lib/indicator.ts` (+ testy jednostkowe: wybór celu, sticky przy separatorze i przerwie, hover nie pod active, reveal bez przelotu, chowanie z pamięcią pozycji, follow bez animacji, zawrócenie z prędkością, klatki `spring` i `elastic`, przycięcie i zgniecenie przy ścianie, `firm` z `clamp`, brak literałów czasu).
3. `lib/popup-flight.ts` (+ testy geometrii przelotu: krawędź przy triggerze, środek do środka, zmiana strony, start od celu poprzedniego, `reset`).
4. Sonda Base UI na stronie laboratorium: Menu, Popover, Dialog, Tooltip (pozycjonowanie przez `transform`, przelot na `Popup`), ToggleGroup (3 opcje D17); wynik w `decisions/e2-base-ui.md`.

**Gate:** testy zielone; N7 i wybór ToggleGroup zapisane.

### Faza 6: komponenty, `/components`, ekran

**Działania:**

1. Komponenty według tabeli; `docs/<nazwa>.md`.
2. Panel na ToggleGroup i Menu Tessery; `/components`; `/screens/overlays`.
3. `lab.spec.ts` (część „zachowanie”, jednostka C): menu (pigułka przy separatorze, natychmiastowe podmenu, checkbox nie zamyka, trójkąt do podmenu, przelot podmenu, klawiatura), ToggleGroup (hover nie pod active, strzałki), tooltip (przelot w grupie, start od celu poprzedniego), trace B1 (przejazd, „wciśnij i jedź do ściany”, otwarcie menu, podmenu, popovera, przelot), ≤ 2 `backdrop-filter`.
4. Kontrakt paczki dla nowych `exports`; commit fazy (D28), potem `bun run check` na świeżym klonie (`git clone --branch feat/e2-foundation` z lokalnego repo do scratchpadu, `bun install`, `bun run check`).
5. Nagranie (Playwright `recordVideo`): sliding w trybach `spring`, `elastic`, `firm` na `/screens/overlays` oraz nawigacja mangashift.com dla porównania; pliki w scratchpadzie sesji (poza repo), ścieżka w raporcie.

**Gate:** wszystko zielone; czas `check` zmierzony.

**Human checkpoint 2 (przed recenzją kodu):**

```text
Uruchom: bun run dev → http://localhost:3000/screens/overlays
Obejrzyj też: nagrania z fazy 6 (spring, elastic, firm i nawigacja mangashift.com), ścieżka w raporcie
Zrób: przejedź po menu, toggle group i pasku z tooltipami; popover → menu → podmenu; dialog;
      w panelu: ruch spring/elastic/firm/off, rogi, krzywa, gęstość, tryb
Oczekiwany rezultat: przycisk, pole i wiersz wyglądają tak samo na stronie i 2–3 poziomy niżej (poza promieniem
      koncentrycznym); pigułka bez skoków i mignięć, nie wychodzi poza rodzica; przelot tooltipa i podmenu
Pytanie: który tryb ruchu domyślny; czy odbicie przy ścianie ma być widoczne
Przekaż wynik jako: uwagi per element i wybór trybu ruchu
```

**Gate:** uwagi wprowadzone; przy drugiej rundzie tej samej rzeczy U33.

### Faza 7: recenzja kodu

Trzech recenzentów (skill `review`): (1) silniki, strażnicy, spec; (2) zachowanie, sliding, komponenty wobec F15, Q2–Q10; (3) laboratorium, paczka, dokumenty. Prowadzący osądza każdą uwagę; runda kontrolna przy uwagach poważnych (najwyżej 3–4). **Gate:** brak uwag krytycznych i poważnych.

### Faza 8: zamknięcie

Krótkie potwierdzenie właściciela po poprawkach z recenzji (link, lista zmian od checkpointu 2), `AGENTS.md` z pułapkami E2, usunięcie `research/e2-facts-*` (wiedza w kodzie i spec), commit i PR tylko na słowo właściciela.

## Dodatkowi wykonawcy

| Jednostka         | Cel                                                                                               | Write scope (worktree)                                        | Kiedy                   | Integracja        |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- | ----------------- |
| A: paleta         | `scripts/palette.ts`, `scripts/colors.ts`, `engines/color.css`, sprawdzenie w `contracts.test.ts` | `.worktrees/e2-color`: te pliki                               | faza 2                  | prowadzący        |
| B: kaskada        | `lib/theme.ts` (+ test), `lib/theme-script.tsx`, `themes/mangashift.ts`                           | `.worktrees/e2-theme`: te pliki                               | faza 3, równolegle z A  | prowadzący        |
| C: testy zachowań | część „zachowanie” `lab.spec.ts`                                                                  | `.worktrees/e2-tests`: `apps/docs/tests/lab.spec.ts` (sekcja) | faza 6, po komponentach | prowadzący        |
| R1–R3             | recenzja kodu                                                                                     | read-only + `docs/reviews/e2-code-*.md`                       | faza 7                  | prowadzący osądza |

Briefy według szablonu `subagent`, ze skillami `coding` (albo `review`) i `workflow`, regułą „zero legacy” i zakazem komend git. Silniki, przepisy, komponenty, sliding, przelot i laboratorium pisze prowadzący.

## Strategia dowodu

| Twierdzenie                                  | Kontrola                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| warstwy bez przemytu wyglądu                 | strażnik + fixture                                                           |
| wartości silników (W1, W3, W4, W8, E0)       | `lab.spec.ts` na prawdziwych właściwościach, tolerancja ≤ 0,5 px             |
| wersja zapasowa squircle                     | test z usuniętą regułą `@supports`                                           |
| wejścia na poddrzewie                        | przypadek zagnieżdżonego `data-size`                                         |
| B8 > 0 i ≤ 250, prefiks `--ts-`              | `test/package/budget.test.ts` na `dist`                                      |
| B7 ≤ 12 warstw, które rysują i mają pole > 0 | `lab.spec.ts` na `/screens/overlays` i `/screens/edges` (pętla, DPR 1 i 1,5) |
| motyw bez re-renderu (B4)                    | hook DevTools w `lab.spec.ts`                                                |
| anty-FOUC                                    | pierwsza klatka w `lab.spec.ts`                                              |
| F15                                          | `lib/*.test.ts` + `lab.spec.ts` (mysz i klawiatura)                          |
| ruch na kompozytorze (B1), Q14               | trace i licznik `backdrop-filter` w `lab.spec.ts`                            |
| paczka u konsumenta                          | `test/package/` + `next build` laboratorium                                  |
| świeży klon                                  | gate fazy 6                                                                  |
| wygląd i ruch                                | checkpointy 1 i 2                                                            |

```text
bun run typecheck → bun run build → bun run lint → bunx vitest run → bun run test:browser
SKIP=no-commit-to-branch prek run --all-files
```

## Ryzyka i reakcje

| Ryzyko                                                            | Rozpoznanie              | Reakcja                                                                         |
| ----------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| przelot na `Popup` zderza się z transformacją Positionera Base UI | trace fazy 5             | animacja na wewnętrznym elemencie popupu; przy braku obejścia N7 do właściciela |
| sposób B z portalami                                              | test popupu w portalu    | popup = głębokość 1 (D13)                                                       |
| sprężyna różni się od Motion                                      | checkpoint 2 obok strony | strojenie klatek; U33                                                           |
| zgniecenie zniekształca obrys/squircle                            | checkpoint 2             | zgniecenie wyłączone, zostaje przycięcie                                        |
| B8 > 250                                                          | test                     | scalić role; właściciel                                                         |
| `check` > 3 min                                                   | pomiar fazy 6            | właściciel: test:browser poza pre-push                                          |
| squircle przy koncentryczności nie jest równoległy                | checkpoint 1             | ocena właściciela, bez zmiany mechanizmu                                        |

## Lokalna adaptacja i materialna zmiana

Lokalnie wolno to, co w „Dozwolone decyzje lokalne”. Zatrzymanie i powrót do planu: zmiana nazw wyjść po checkpoincie 1, nowy silnik, przepis albo oś, zmiana U8, rezygnacja z Base UI dla któregoś z czterech prymitywów, inny mechanizm promienia, ruch poza `transform`/`opacity` bez wyjątku.

## Definition of Done

- [ ] warunki końcowe spełnione, z wynikami komend w raporcie;
- [ ] checkpointy 1 i 2 wykonane, uwagi wprowadzone;
- [ ] recenzja bez uwag krytycznych i poważnych;
- [ ] spec, masterplan, structure, AGENTS.md zgodne z kodem.

## Kontrakt wyniku

```text
status; link i instrukcja; ścieżki nagrań ruchu; drzewo zmian; komendy i wyniki; uwagi właściciela i co z nimi zrobiono;
odchylenia; odkrycia (N7, ToggleGroup); ograniczenia; branch/commit/PR; następny krok (rundy po komponencie, E3)
```

## Rozstrzygnięcie uwag recenzji rundy 1

| Uwaga                                                                                                                                                          | Rozstrzygnięcie                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| spec P1 (U32)                                                                                                                                                  | D4 [W], faza 0                                                                                |
| spec P2, tech M6 (bounce)                                                                                                                                      | D6 \[W\]: tryby `spring` i `elastic`, checkpoint 2 przed recenzją                             |
| spec P3 (drugie źródło ruchu)                                                                                                                                  | D7                                                                                            |
| spec P4 (trzy drabinki), W14                                                                                                                                   | D11, D12                                                                                      |
| spec P5, tech M1 (koncentryczność)                                                                                                                             | D13                                                                                           |
| spec P6 (Q14)                                                                                                                                                  | D16                                                                                           |
| spec P7 (F12)                                                                                                                                                  | strony `/components` i `/screens/overlays`                                                    |
| spec P8, tech P8 (próbki a lint)                                                                                                                               | D23                                                                                           |
| spec P9 (świeży klon)                                                                                                                                          | D24, gate fazy 6                                                                              |
| spec P10 (krok 8 E1)                                                                                                                                           | D25 [W]                                                                                       |
| spec P11, tech M10 (N8)                                                                                                                                        | D11                                                                                           |
| spec M1, tech P3 (strażnik `styles/`, `@font-face`)                                                                                                            | faza 1, działania 2 i 5                                                                       |
| spec M2, tech M2 (przelot)                                                                                                                                     | D18                                                                                           |
| spec M3 (części bez przepisu)                                                                                                                                  | warianty `row` i slot `header`; decyzje lokalne                                               |
| spec M4 (neon)                                                                                                                                                 | zakres: `control solid` i `focus` czytają `--ts-depth-glow`                                   |
| spec M5 (panel)                                                                                                                                                | D20, D21                                                                                      |
| spec M6 (F3, F4)                                                                                                                                               | faza 0; warstwy F4 tylko dla `overlay`, `modal`, `tooltip`                                    |
| spec M7 (B7), runda 2 P3 (Q4)                                                                                                                                  | D8: stała warstwa zgodnie z Q4, B7 trzyma układ panelu; test B7                               |
| runda 2 P1 (`ThemeScript`)                                                                                                                                     | D26, D27                                                                                      |
| runda 2 P2 (commity)                                                                                                                                           | D28, pytanie do właściciela                                                                   |
| runda 2 P3 (zmiany spec poza fazą 0)                                                                                                                           | faza 0, działanie 1                                                                           |
| runda 2: drzewo (10 pozycji), `flatten`, `node:http`, `.gitignore`, `test:browser` od fazy 3, `budget.test.ts` w `test/package/`, liczba 13, statusy i `scrim` | sekcje „Docelowe drzewo”, fazy 0, 3, 6                                                        |
| spec M8, tech M3 (pomiar)                                                                                                                                      | D10, lista plików w `contracts.test.ts`                                                       |
| spec M9, tech M9 (B4, FOUC)                                                                                                                                    | D22, faza 3                                                                                   |
| spec M10 (nagranie)                                                                                                                                            | checkpoint 2                                                                                  |
| spec M11 (F10, F15 poza zakresem)                                                                                                                              | „Out of scope” z etapami                                                                      |
| spec M12 (spójność)                                                                                                                                            | liczby, nazwy z v7, jednostka C w fazie 6, faza 0                                             |
| spec M13, tech M10 (Q13, Q15, klawiatura)                                                                                                                      | D22, WebKit w `lab.spec.ts`, scenariusze klawiatury                                           |
| spec S1 (klucz zapisu)                                                                                                                                         | D20                                                                                           |
| tech P1 (squircle)                                                                                                                                             | D15                                                                                           |
| tech P2 (`dist`, B8)                                                                                                                                           | faza 2, `contracts.test.ts`                                                                   |
| tech P4 (liczby w przepisach)                                                                                                                                  | faza 1, działanie 4; `focus-offset-inset`                                                     |
| tech P5 (poddrzewo)                                                                                                                                            | D14                                                                                           |
| tech P6 (`--color-*`)                                                                                                                                          | D5 [W]                                                                                        |
| tech P7 (dwa `scale`)                                                                                                                                          | D8                                                                                            |
| tech M4 (`firm` ujemny)                                                                                                                                        | D6 (`clamp`)                                                                                  |
| tech M5 (zawrócenie)                                                                                                                                           | D9                                                                                            |
| tech M7 (serwer)                                                                                                                                               | `tests/serve.ts`                                                                              |
| tech M8 (zmienne jako tekst)                                                                                                                                   | D22                                                                                           |
| tech M11 (lista warunków)                                                                                                                                      | faza 1, działanie 2                                                                           |
| tech S1–S4                                                                                                                                                     | D7, checkpoint 1, `suppressHydrationWarning`, fontsource `wght.css` z leniwym `unicode-range` |

## Wynik recenzji kodu

Trzy recenzje fazy 7 (`reviews/e2-code-engines.md`, `e2-code-behavior.md`, `e2-code-lab.md`) dały 12 uwag poważnych. Poprawki szły w trzech paczkach: F1 (silniki, przepisy, strażnicy), F2 (zachowanie i komponenty), F3 (laboratorium, testy, CI, dokumenty).

| Uwaga                                                   | Co zrobiono                                                                                                                                                                                                                                                                                           | Paczka                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| silniki P1 (`motion: off` nie wyłącza przepisów)        | `[data-motion='off']` zeruje czasy i `press-scale` jak `prefers-reduced-motion`; test „moves nothing on the overlays screen with the motion off”                                                                                                                                                      | F1, test F3                    |
| silniki P2 (furtki białej listy przepisu)               | osobna polityka wartości dla deklaracji ruchu (`transition`, `transition-property`, `will-change`) w `css-layers.ts`                                                                                                                                                                                  | F1                             |
| silniki P3 (TSX komponentów bez strażnika)              | blok `tessera/components` w `eslint.config.js`: `no-local-appearance` w trybie `components`                                                                                                                                                                                                           | F1                             |
| silniki P4 (`className`/`style` z aplikacji)            | komponenty nie przyjmują `className` ani `style` (typy i reguła z P3)                                                                                                                                                                                                                                 | F2                             |
| silniki P5, laboratorium M6 (blur dialogu w ruchu, Q14) | dialog wchodzi samym `opacity`, bez `scale`                                                                                                                                                                                                                                                           | F1                             |
| zachowanie P1 (React Compiler pomija funkcje)           | `panicThreshold: 'all_errors'` w `tsdown.config.ts`; `dist` hooka slidingu, Menu i Tooltip importuje `react/compiler-runtime`                                                                                                                                                                         | przed F3, stan sprawdzony w F3 |
| zachowanie P2 (ToggleGroup re-renderuje grupę, Q9)      | własny `role="radiogroup"` z `button[role="radio"][aria-checked]`, sklep `lib/single-choice.ts` (re-render tylko dwóch opcji), decyzja w `decisions/e2-base-ui.md`; testy w `toggle-group.spec.ts` (klawiatura, `aria-checked`, jeden element na opcję)                                               | F2, testy F3                   |
| zachowanie P3 (modalność wejścia niewłączona)           | skrypt motywu instaluje `data-input` i nasłuch `prefers-color-scheme` (też M6); testy fokusu z klawiatury i trybu `system` samym skryptem                                                                                                                                                             | F2, testy F3                   |
| laboratorium P1 (przepisy bez strony i testu)           | `/foundation` na prawdziwych `data-recipe` (`control`, `surface`, `row`), style inline tylko dla surowych próbek tokenów; testy wysokości, promienia, koncentryczności (z wierszami), W4 i drabinki stanów na `::after` przepisu; `css-properties.d.ts` usunięty; wyjście `--ts-shape-control-radius` | F3 (wyjście F1)                |
| laboratorium P2 (B4 bez komponentów)                    | sonda fiberów na `/screens/overlays`, dwie osie, warunek wstępny: commity strony i widoczna pigułka                                                                                                                                                                                                   | F3                             |
| laboratorium P3 (Playwright bez przeglądarek w CI)      | krok `bunx playwright install --with-deps chromium webkit` w `ci.yml`; `AGENTS.md`: pięć kroków `check`, instalacja przeglądarek po klonie                                                                                                                                                            | F3                             |
| laboratorium P4 (dokument bez wyglądu Tessery)          | wariant `page` przepisu `surface` na `<body>`; przycisk „Move” = `Button`; nagłówki i nawigacja bez własnego CSS                                                                                                                                                                                      | F1 (wariant), F3               |

F3 domknęła też mniejsze uwagi laboratorium: M1 (strażnik wyjątku D23 w `contracts.test.ts`), M2 (strażnicy F12 i osi motywu ↔ CSS w obu kierunkach), M3 (testy po jednym pliku na komponent, `structure.md` = faktyczne drzewo), M4 (jeden rejestrator animacji, także klatki w formie obiektu), M5 (`expect.poll` zamiast stałego czekania przy pomiarze), M8 (rząd kontrolek na stronie i test W4 na ekranie „Nakładki”), M9 (`LAB_PORT`, `reuseExistingServer` poza CI), oraz testy przeglądarkowe do uwag zachowania M2 (popup zostaje na triggerze przy przewijaniu dialogu i zmianie rozmiaru okna) i M3 (wciśnięcie przycisku).

______________________________________________________________________

# Część 2: fundament pod rodziny

**Status:** zaakceptowana przez właściciela 2026-11-01 („Ok”) razem ze zmianami jego reguł ze streszczenia: W9 (obrys pola w błędzie i w `forced-colors`), W14 (pigułka bez stałej warstwy, powierzchnia z tonem bez ramki), O7 (minimum Safari/WKWebView 26.2), W1 (wysokość ≥ 24 px przy dotyku), typeahead w ToggleGroup i podział osi `profile` na `platform` i `typeset`. W toku od fazy 9.

## Cel części 2

Domknąć luki fundamentu z audytu `reviews/e2-foundation-gaps.md`, zanim powstanie ok. 30 rodzin komponentów (E3, E4). Rezultat: silniki, osie, przepisy, mechanizmy `lib/` i strażnicy, na których komponenty E3 powstaną bez obejść; każda pozycja ma test i scenę skrajności w laboratorium. Część 2 nie tworzy komponentów E3 (Select, Tabs, Tree, Checkbox, Switch, Slider, Toast i inne): powstaje tylko to, czego będą potrzebować, sprawdzone na 7 istniejących komponentach, na dwóch cienkich komponentach tekstu (`Text`, `Heading`, decyzja D29) i na próbkach w `/foundation`. Warianty przepisów powstają tylko z konsumentem w E2; reszta to próbki z wyjść silników.

## Rezultat użytkownika (część 2)

Właściciel uruchamia `bun run dev` i:

- na `/foundation` widzi nowe sekcje: tony (`neutral`, `accent`, `danger`, `success`, `warning`, `info`) × warianty (z `raised`) × tryb, warianty tekstu, geometrię toru i kciuka (checkbox, switch, suwak, pasek) w xs–xl, pętle (obrót, przesuw, pulsowanie: przycisk zajęty, szkielet, pasek nieokreślony);
- na nowym ekranie `/screens/edges` widzi 7 komponentów i tekst w skrajnościach: 1 znak, długi tekst, sama ikona, wąski kontener, małe okno, xs–xl × rogi none–full, stany (błąd, tylko do odczytu, wyłączone, zajęte), pasek w rozmiarze xs z menu i tooltipem, grupa w `dir="rtl"`, 8 grup z pigułkami;
- na `/screens/overlays` widzi menu, które w niskim oknie przewija się zamiast wychodzić poza ekran, długi tooltip łamany do czytelnej szerokości, pole z widocznym fokusem po kliknięciu myszą i pozycję menu w tonie `danger`;
- w panelu zamiast osi `profile` są dwie osie: `platform` (kursor, zachowanie platformy) i `typeset` (zestaw krojów).

## Warunki końcowe (część 2)

- [ ] Decyzje D29–D47 wdrożone; każda ma test z kolumny „Strategia dowodu”, który zawodzi przy złej implementacji.
- [ ] Strażnik warstw i ESLint komponentów znają nowe mechanizmy (zmienne Base UI, `forced-colors`, `@container`, `@keyframes`, `color-mix`, rejestr `--ts-i-*`, wcięcie z `aria-level`, atrybuty SVG, literały wyglądu w TSX) wyłącznie przez białe listy z powodem; każda zmiana ma fixture `good/` i `bad/`.
- [ ] `/screens/edges` istnieje, jest zbudowany wyłącznie z Tessery, każdy komponent ma tam sekcję (strażnik w `contracts.test.ts`), a `edges.spec.ts` sprawdza każdą skrajność z D46.
- [ ] Po każdej fazie bramki zielone i grep starych nazw z „Forbidden” pusty.
- [ ] B8 ≤ 250 (po fazie 13: 146); B7 (definicja D31: warstwy poza korzeniem, które rysują i mają pole > 0): w spoczynku żadna nie należy do pigułki ani do treści nad nią, ≤ 12 warstw przy aktywnej grupie i otwartym popupie przy DPR 1,5 na `/screens/overlays` oraz w spoczynku i przy otwartym menu z działającą pętlą przy DPR 1 i 1,5 na `/screens/edges`; B1 i B4 bez regresji.
- [ ] Pomiar warstw przed i po D31 (faza 14b, ten sam skrypt) zapisany w `docs/decisions/e2-layers.md`; nagrania MP4 przed i po.
- [ ] Spec, `structure.md`, masterplan i `AGENTS.md` zgodne z kodem (lista „Zmiany specyfikacji”).
- [ ] `bun run check` i `SKIP=no-commit-to-branch prek run --all-files` zielone, także na świeżym klonie.
- [ ] Właściciel ocenił `/foundation`, `/screens/edges` i `/screens/overlays` na żywo (checkpoint 3); recenzja kodu bez uwag krytycznych i poważnych; ponowny audyt luk bez luk poważnych dla E3.

## Nie-cel (część 2)

Komponenty E3 i E4 (także Toast, Spinner, Skeleton, Progress, Checkbox, Switch, Slider, Tabs, Tree, Field, Select, Textarea jako komponenty), wariant i wejście toastu (pytanie do właściciela przy komponencie Toast, E3; W16 bez zmian), scena „stress” i budżety B2, B3, B5, B6, T1–T5 (E3), dopracowany wygląd komponentów (rundy po komponencie).

## Authority i baseline (część 2)

| Źródło                                                                         | Co rozstrzyga                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `docs/specification.md`                                                        | obowiązujące U, W, F, Q, B, O, Z; zmiany z tej części wchodzą w fazie 9             |
| `docs/reviews/e2-foundation-gaps.md`                                           | luki G1–G25, fundamenty F-A…F-M, niespójności N1–N8 (audytu), pytania D-A…D-F       |
| `docs/research/e2-foundation-2026.md`                                          | mechanizmy 2026 ze wsparciem przeglądarek (BCD, stan 31.10) i odrzucone techniki    |
| decyzje prowadzącego z 31.10 (właściciel przekazał mu decyzje wyglądu i ruchu) | D29–D47 poniżej                                                                     |
| `docs/decisions/e2-base-ui.md` §1–2                                            | zmienne Positionera, zagnieżdżone portale, `will-change` Floating UI przy DPR ≥ 1,5 |

**Baseline (sprawdzony 31.10 wieczorem, odczyt kodu):** branch `feat/e2-foundation` = `378bcee` + niezacommitowany stan części 1 (fazy 0–7 z poprawkami F1–F3). Fakty, na których stoi część 2:

- `engines/*.css`: 126 publicznych zmiennych (licznik audytu); `size.css` ma `--ts-size-hit` (0 px, 44 px przy `pointer: coarse`); `depth.css:52-56` warstwy 1040/1040/1050; `state.css:29-36` i `type.css:23` czytają `data-profile`; statusy w `color.css:27-35` tylko na `:root`.
- `recipes/indicator.css:17` i `lib/indicator.ts:469`: stałe `will-change: transform` pigułki; `lib/indicator.ts:113-123`: `readMotion()` czyta tylko `document.documentElement`.
- `recipes/focus.css:10`: obrys fokusu tylko poza `[data-input='pointer']`, także dla pola.
- `recipes/surface.css:38-79, 99-103`: popup bez ograniczenia wysokości i przewijania, tooltip bez maksymalnej szerokości; sloty `header` i `body` niosą typografię tytułu i opisu.
- `recipes/row.css:52-54`: `data-variant='danger'`; `components/menu/menu.tsx:10, 27, 38, 46` (`MenuItemVariant`, `SUBMENU_SWITCH_GRACE = 150`, `strokeWidth={1.5}`); `components/tooltip/tooltip.tsx:7` (`GROUP_TIMEOUT = 400`).
- `lib/single-choice.ts:10, 35-43`: `nextOption` bez orientacji, kierunku i typeahead; ToggleGroup z niego korzysta (`toggle-group.tsx:218, 297`).
- `test/guards/css-layers.ts`: przepis zna tylko `@media (hover: hover)`, funkcje `calc/min/max/clamp`, zmienne `--ts-<silnik>-*` i `--_*`; silnik deklaruje tylko zmienne, `@property` tylko dla własnych nazw; `@keyframes` nigdzie.
- `src/eslint/no-local-appearance.ts:8-19`: tryb `components` zakazuje `className` i `style`, nie widzi liczb ani atrybutów SVG.
- `apps/docs/tests/lab.spec.ts:409-415`: B7 liczy elementy z `will-change: transform` i oczekuje > 0.
- Base UI 1.9: `onOpenChange(open, eventDetails)` daje `eventDetails.trigger` przy otwarciu interakcją, ale nie wywołuje się przy sterowanym `open` ani `defaultOpen` (`e2-plan-part2-tech.md` P3); zagnieżdżony portal ląduje w węźle portalu rodzica (`FloatingPortal.mjs:55`, `decisions/e2-base-ui.md` §2).
- `packages/tessera/vitest.config.ts:6`: środowisko `node`, bez DOM.
- Sondy recenzji technicznej (`e2-plan-part2-tech.md`, Playwright 1.64.1): emulacje `contrast`, `reducedMotion`, `hasTouch` → `(pointer: coarse)`, `deviceScaleFactor: 0.5` działają w Chromium i WebKit; `forcedColors` wymusza kolory tylko w Chromium (alfa i `opacity` zostają, jawny `Highlight` zostaje); `text-box`, `field-sizing` działają w WebKit Playwrighta; `<body>` z `container-type` nie jest blokiem zawierającym dla `fixed`; CDP `LayerTree` daje `backendNodeId` i rozmiary w px CSS; pigułka z `will-change` w spoczynku = 2 warstwy (pigułka i scalona treść nad nią), bez `will-change` = 0, w trakcie WAAPI te same 2.

**Znane wcześniejsze failures:** CI na GitHubie nie startuje (runner po stronie właściciela).

**Wymagane wejście:** fazy 0–7 części 1 zamknięte i zacommitowane lokalnie (D28). Faza 8 części 1 (zamknięcie) przechodzi na koniec części 2 i łączy się z fazą 16.

## Decyzje planu (część 2)

Decyzje D29–D47 podjął prowadzący na prośbę właściciela; uzasadnienie w tabeli, dowody w `research/e2-foundation-2026.md` (§ w nawiasie).

| #                         | Decyzja                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Powód                                                                                                                                                           | Skutek                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| D29 (D-A, G4, G20)        | Szósty przepis `text`, zamknięta lista wariantów: `label` (stopień z `--ts-size-text` i `--ts-size-leading`, waga medium, więc etykieta obok kontrolki ma jej rozmiar), `description` (stopień `detail`, `secondary-label`, `text-wrap: pretty`), `error` (jak `description`, kolor `--ts-state-invalid-color`), `title` (stopień `title`, krój `heading`, semibold), `kbd` (krój mono, stopień `small`, `tabular-nums`), `display` (nowy stopień `display`, krój `heading`, semibold). `title` i `display`: `text-box: trim-both cap alphabetic` i `text-wrap: balance`. Modyfikator `data-numeric` daje `tabular-nums` każdemu wariantowi. Kolor: wariant bazowy, `label`, `kbd`, `title` i `display` dziedziczą `color` rodzica (F6: tekst w odwróconym tle, np. w tooltipie), własny kolor mają tylko `description` i `error`. Komponenty bez wyglądu: `Text` (`as`: `span`, `p`, `div`, `label`; warianty `label`, `description`, `error`, `kbd`; `numeric`) i `Heading` (`level` 1–4 → `h1`–`h4`, semantyka dokumentu, nie liczba wyglądu; wygląd daje wariant; element z ciągu szablonu, bez literałów liczbowych w kodzie). Sloty `header` i `body` znikają z `surface` w tej samej fazie, w której `DialogTitle`/`PopoverTitle` dostają `text` `title`, a opisy `text` `description` (D47). `kbd` to tylko typografia (mono, `tabular-nums`); keycap Kbd jako komponent w E3. Etykieta pola w E3 (Field + Label) to `Text` `variant="label"` `as="label"`, nie drugi komponent etykiety                                                                                                                          | tekst poza kontrolką ma ≥ 8 rodzin-konsumentów; sloty w trzech przepisach to ta sama reguła w kilku miejscach (I2); `text-box` działa w obu silnikach (§6)      | zmiana U10 (sześć przepisów); stopnie `display` tylko w `type`; F12 dla `Text` i `Heading` |
| D30 (D-B, G3, G16)        | Oś `data-tone` (`neutral`, `accent`, `danger`, `success`, `warning`, `info`) ortogonalna do wariantu w `control`, `row`, `surface`. Ton ustawia lokalne `--_tint` i `--_on-tint`; warianty czytają tylko je. Bez atrybutu: `solid` = `accent` (dzisiejszy przycisk główny), pozostałe warianty = `neutral` (drabinka atramentu). `soft`, `ghost`, `outline` z tonem innym niż `neutral` barwią tekst, nakładkę stanu (krycia `tint-*` z W8) i obrys kontrolki `outline` (`tint-border`) przez `color-mix(in oklab, …)`; `raised` z tonem zostaje wypukły (tło i cień `raised`), ton barwi tylko tekst i nakładkę stanu. Poświata neonu tylko przy tonie `accent` (W11). `row` `data-variant='danger'` znika na rzecz `data-tone='danger'` w tej samej fazie co `MenuItem` `tone` zamiast `variant` (D47). `surface` z tonem: samo tło (`color-mix` tonu z kryciem `tint-rest` i tła poziomu) i cień poziomu, bez obrysu i bez `tint-border` (W14: duże układy bez obramowań). Statusy zostają jak akcenty z jedną wartością (`family.base`) w obu trybach; tryb zmienia tylko `glow` akcentu (jedna reguła dla akcentów i statusów; decyzja prowadzącego po fazie 12 z reguły właściciela „żywe kolory przed WCAG, ciemnego motywu nie ruszać”, `color.css` bez zmian). Bez `contrast-color()`: pary `on-*` liczy build                                                                                                                                                                                                                                                                                                   | wariant na ton (`solid-danger`) mnoży warianty w trzech przepisach; wzór Fluent (`appearance` × `color`) i Apple (rola + tint); W6: statusy jak akcenty (§5)    | `color-mix` na liście funkcji przepisu; zmiana W6, W7, U10                                 |
| D31 (D-C, G8, N1 audytu)  | Pigułka bez `will-change`. Warstwę w czasie ruchu daje sama animacja WAAPI (Blink `kActiveTransformAnimation`, WebKit `requiresCompositingForAnimation`, §9; sonda recenzji: 0 warstw w spoczynku, 2 w trakcie). Pomiar jest w jednym miejscu, faza 14b: ten sam skrypt tuż przed zmianą i tuż po niej, na sekcji 8 grup `/screens/edges`. Skrypt liczy wszystkie warstwy poza korzeniem (CDP `LayerTree`: liczba i suma pól × DPR² × 4 B) i przypisuje każdą do węzła przez `backendNodeId` i geometrię rodzica, więc widzi też scaloną warstwę treści nad pigułką; stany: spoczynek, przejazd hover, otwarte menu; DPR 1 i 1,5; trace pierwszej klatki (`Paint`, LoAF); zrzut wycinka tekstu pozycji w spoczynku i w połowie przejazdu (antyaliasing, Q18). Wynik w `decisions/e2-layers.md`, nagrania MP4 przed i po do checkpointu 3. Gdy „po” pokaże `Paint` poddrzewa pigułki na starcie ruchu albo ramkę LoAF > 50 ms, której nie ma w „przed”: `will-change: transform` od `pointerenter`/`focusin` grupy do `finished` ostatniej animacji, nigdy na stałe. B7 liczy z warstw poza korzeniem tylko te, które rysują (`drawsContent`) i mają pole > 0: budżet mierzy pamięć GPU, a warstwy 0 × 0 bez rysowania (strażnicy fokusu Base UI, `span[aria-owns]` z `position: fixed`) jej nie kosztują (decyzja prowadzącego po fazie 14b, `decisions/e2-layers.md`); budżet zostaje 12                                                                                                                                                                                                                                 | MDN odradza stałe `will-change`; 6 segmentów = 12 warstw (24 z treścią), zanim dojdą Tabs i drzewo                                                              | D8 poprawione; zmiana Q4, W14 i definicji B7                                               |
| D32 (D-D, G12)            | Pole pokazuje fokus po kliknięciu myszą: reguła `[data-focus]:has(> [data-slot='input']:focus-visible)` w `recipes/focus.css` bez bramki `data-input`, ten sam obrys co klawiatura. Bramka `:root:not([data-input='pointer'])` zostaje dla `[data-focus]:focus-visible` (przyciski, segmenty)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | przeglądarka celowo uznaje kliknięte pole za `:focus-visible` (MDN, sonda audytu); pole bez ramki (W9) nie ma innego sygnału (§7)                               | wyjątek `KEYBOARD_FOCUS` w strażniku zmienia tekst; zmiana F8; `docs/input.md`             |
| D33 (D-E, G13, N2 audytu) | Kontenery: `container-type: inline-size` na powierzchni z `data-container` (opcja) i zawsze na `surface` `page`; nie domyślnie na każdej powierzchni, bo zawieranie rozmiaru w osi inline odcina szerokość od treści i popup o szerokości treści by się zwinął (§3). Zamknięta lista progów w `src/eslint/layout.ts` (`CONTAINER_WIDTHS`; w E2 tylko `narrow` 400 px, bo próg wchodzi na listę z pierwszym konsumentem, a kontrakt „każdy próg użyty” oblewa próg bez konsumenta; dalsze progi w E3 razem z konsumentem; kalibruje właściciel w checkpoincie 3), jedyna dozwolona forma warunku: `(inline-size < Npx)` lub `(inline-size >= Npx)` z N z listy; wewnątrz tylko właściwości układu (`COMPONENT_LAYOUT`). Pierwszy konsument: stopka `surface` układa akcje w kolumnę poniżej `narrow`. Dialog ma `width: fit-content`, więc sam nie jest kontenerem; jego stopka pyta kontener strony (`page`), czyli przechodzi w kolumnę według szerokości okna. To zamierzone: dialog jest tak szeroki jak treść, a o braku miejsca decyduje okno. Karta z `data-container` reaguje na własną szerokość. Oś `profile` znika: `data-platform` (`desktop`, `web`: kursor W21, zachowania platformy) i `data-typeset` (`inter`: Inter + Cascadia Code, W19). Zero aliasów; stary klucz `profile` w zapisie odpada przez istniejącą walidację osi (`readSaved`), bez kodu migracji                                                                                                                                                                                                                                           | `var()` nie działa w warunku `@container`, `@custom-media` nie istnieje w Chromium ani Safari, build nie transformuje CSS (§3); jedna oś miała dwa znaczenia    | zmiana U31, W19, W21; nowe F17                                                             |
| D34 (D-F, G14)            | Pętle: `@keyframes` tylko w silniku `motion` (zamknięta lista `ts-spin` = `rotate`, `ts-sweep` = `translate`, `ts-pulse` = `opacity`), tylko `transform`/`translate`/`rotate`/`scale`/`opacity`, easing słowami kluczowymi (`linear`, `ease-in-out`), bez `linear()`. Wyjścia `--ts-motion-spin`, `--ts-motion-sweep`, `--ts-motion-pulse` (nazwa klatek albo `none`) i `--ts-motion-loop` (czas); `[data-motion='off']` i `prefers-reduced-motion` dają `none`, więc pętle stoją. Konsument w E2: `control` z `aria-busy='true'` obraca slot ikony (opakowanie HTML, Q2), `Button` dostaje `busy`. Szkielet (`pulse`) i pasek nieokreślony (`sweep`) to próbki `/foundation` z wyjść silnika; warianty przepisów przyjdą z komponentami Skeleton i Progress (E4). Toast w części 2 nie ma wariantu ani wejścia; W16 bez zmian                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `@keyframes` działa przed hydratacją i staje bez kodu JS; WAAPI zostaje dla ruchu liczonego z geometrii (§10); Safari wykonuje `linear()` na wątku głównym (Q5) | zmiana Q2, F6                                                                              |
| D35 (G1, G2, F-F)         | Popup `overlay`: `max-block-size: calc(var(--available-height) - var(--ts-space-inset))` (margines strony popupu), `max-inline-size: var(--available-width)`, `overflow-y: auto`, `overscroll-behavior: contain`, `scrollbar-width: thin`, `scrollbar-gutter: stable both-edges` (W5: przy klasycznym pasku Windows rynna po obu stronach, więc padding zostaje symetryczny także w przewijanym popupie; to samo w `dialog`, D44). Koszt: popup szerszy o dwie cienkie rynny przy klasycznych paskach, zero przy paskach nakładanych; szerokość ocenia właściciel w checkpoincie 3. Tooltip: `max-inline-size: min(var(--ts-type-measure-narrow), var(--available-width))`, `overflow-wrap: anywhere`. `surface` `[data-width='trigger']`: `min-inline-size: var(--anchor-width)`; `MenuContent` dostaje `width: 'content' \| 'trigger'`, panel używa `trigger`. Biała lista zmiennych dostawcy w strażniku (wzór `RECIPE_SELECTOR_EXCEPTIONS`, każda z powodem, nieużyta oblewa test): `--available-height`, `--available-width`, `--anchor-width`. `--anchor-height` i `--transform-origin` wchodzą z pierwszym konsumentem (Select z `alignItemWithTrigger`), bo wpis bez użycia łamie regułę „nieużyty wyjątek oblewa”                                                                                                                                                                                                                                                                                                                                                                                                | Base UI liczy te zmienne, a sam nie ogranicza popupu (§1); Anchor Positioning walczyłby z pozycją Base UI                                                       | nowe F16; strażnik: `VENDOR_VARIABLES`                                                     |
| D36 (G11)                 | `forced-colors` (wzór Fluent v9, §4): `@media (forced-colors: active)` dozwolone w przepisach; słowa kolorów systemowych (`Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `Highlight`, `HighlightText`, `GrayText`) tylko wewnątrz tego bloku. Pigułka zaznaczenia (`raised` i `active`): `Highlight` z kryciem 1 (cień `raised` znika w tym trybie, więc wypukłość niesie kolor); pigułka hover: bez wypełnienia, obrys `ButtonText`; tekst wybranej opcji `HighlightText`; wyłączone `GrayText` z kryciem 1; wybrana albo wciśnięta kontrolka zostaje `Highlight` z `HighlightText` także pod kursorem i przy wciśnięciu; tor (`data-surface='track'`) i pole (`field`) nie mają reguły w tym bloku, bo przeglądarka sama wymusza kolor systemowy na przezroczystej ramce przepisu (W9), więc `surface` nie ma bloku `forced-colors`; pole w błędzie dostaje w tym bloku obrys o grubości dwóch `--ts-shape-stroke`, bo kolor błędu przegrywa z systemowym (F6); opcja z `aria-checked` nad pigułką pisze `HighlightText` przez wyjątek `INDICATOR_CHOICE_LABEL` w `indicator` (F6); fokus zostaje `outline` (kolor wymusza przeglądarka). `forced-color-adjust: none` tylko punktowo, gdy test pokaże nadpisanie jawnego koloru systemowego                                                                                                                                                                                                                                                                                                                                                                        | Windows to główny cel (U28), a dziś wybór w ToggleGroup jest w tym trybie niewidoczny (sonda audytu)                                                            | nowe Q19; test Chromium                                                                    |
| D37 (F-C, G5)             | Stany przez ARIA i natywne pseudoklasy, jedna zamknięta lista selektorów: zaznaczony `:is([aria-pressed='true'], [aria-selected='true'])` (`control`; `aria-checked` i `:checked` wypadły w F6, bo Checkbox, Switch i Radio dostaną własne części w E3) i `[aria-selected='true']` (`row`, tło tylko w `[aria-multiselectable='true']`, F6; pozycja menu z `aria-checked` pokazuje ptaszek, nie tło); bieżący `[aria-current]:not([aria-current='false'])`; błąd `:is([aria-invalid='true'], :user-invalid)` (pole: na `[data-slot='input']`); tylko do odczytu `[readonly]` (pole bez drabinki hover i wciśnięcia). `data-*` Base UI tylko tam, gdzie ARIA nie ma (dziś `data-highlighted`; `data-invalid` na `Field.Root` w E3). Pigułka zaznaczenia jednego wyboru zostaje domyślnie wypukła (`raised`, W14: tło i cień poziomu `raised`). Silnik `state`: `--ts-state-indicator-active` i `-color` zmieniają nazwy na `--ts-state-selected-fill` i `--ts-state-selected-fill-color`: płaskie wypełnienie zaznaczenia, czyli pigułka w wariancie `active` i tło wielu wyborów; nazwa mówi, że to wypełnienie, nie domyślny wygląd zaznaczenia. Nowe `--ts-state-invalid-color`. Zmiana nazw w tej samej fazie co odczyt w `recipes/indicator.css` (D47). Zasada: pigułka = jeden wybór w kontenerze; wiele wyborów = tło stanu wiersza lub kontrolki (`selected-fill`)                                                                                                                                                                                                                                                 | ARIA i tak musi istnieć; jedno źródło dla czytnika i wyglądu (§7)                                                                                               | zmiana W8, W14; `row` dostaje warstwę `::after` stanu                                      |
| D38 (F-D, G6, G22)        | Geometria z wysokości w silniku `size` (przepis nie może liczyć proporcji): `--ts-size-box` (= ikona: 10/12/14/16/18), `--ts-size-track-block` (= ikona + 4 px), `--ts-size-track-inline` (`round(track-block × 1,75, 1px)`), `--ts-size-thumb` (= track-block − 2 × 2 px), `--ts-size-rail` (`max(2px, round(wysokość / 7, 1px))`). Silnik `shape`: `--ts-shape-box` (proporcja rogów jak kontrolka), `--ts-shape-track` (kapsuła, W3), `--ts-shape-thumb` (koło, W3). Obszar trafienia kontrolki = jej pudełko, bez rozszerzenia na zewnątrz: `--ts-size-hit` i `control::before` znikają. Przy `pointer: coarse` silnik `size` podnosi wysokość kontrolki do co najmniej 24 px (`max(wysokość rozmiaru, 24px)`, czyli xs i sm rosną do 24 px), a przepis `control` ma `min-width` = wysokość, więc każda kontrolka ma pudełko ≥ 24 × 24 px i spełnia WCAG 2.5.8 samym pudełkiem; środki sąsiadów są ≥ 24 px od siebie nawet bez odstępu. Rozszerzenie poza pudełko byłoby zbędne, a wchodziłoby do przewijanego przepełnienia przodka (kontener 320 px, F19). Znane ograniczenie gęstego trybu desktopowego: przy myszy kontrolki xs (16 px, odstęp 3 px, środki 19 px) i sm przy małym odstępie nie spełniają WCAG 2.5.8 ani jego wyjątku odstępu; to skutek gęstości wybranej przez właściciela, a spec nie wymaga 2.5.8. Usunięcie `--ts-size-hit` w tej samej fazie co jego odczyt (D47). Wiersze bez obszaru trafienia (odłożone)                                                                                                                                                                                 | wszystkie trzy systemy porównawcze liczą geometrię z jednej wysokości (§8); WCAG 2.5.8 przez rozmiar pudełka przy dotyku, bez nachodzenia na sąsiada            | zmiana F3, W1 (wysokość i pudełko przy dotyku), W3; liczby oceni właściciel                |
| D39 (F-E, G7, N8 audytu)  | Kanał wartości instancji: rejestr `@property --ts-i-*` (`inherits: false`) w silniku `size`, lista kluczy w jednym miejscu `lib/instance.ts` (`INSTANCE_KEYS`: `--ts-i-value` `<number>`, `--ts-i-inline-size` i `--ts-i-block-size` `<length>`). Zapis tylko przez `writeInstance(element, values)` z `lib/instance.ts` albo przez `style` komponentu z obiektem literalnym o kluczach z rejestru (pierwsza klatka statycznego eksportu). Przepisy czytają klucze rejestru jak wyjścia silników. Bez dziedziczenia klucz pisze się na tym elemencie, który go czyta (np. wypełnienie paska, nie jego korzeń). `writeInstance` z wartością z pomiaru DOM tylko w plikach z listy pomiaru (Q7: `indicator.ts`, `popup-flight.ts`), pilnuje `contracts.test.ts`; wartość z propsów może przychodzić z każdego komponentu. Typ `style` komponentu rozszerza `CSSProperties` o klucze rejestru, bez rzutowania. Pierwszy konsument: pigułka (`lib/indicator.ts` pisze rozmiar przez `writeInstance`, przepis `indicator` czyta `inline-size`/`block-size`; pozycja zostaje ruchem `transform` w pliku pomiaru); `--ts-i-value` ma próbkę paska na `/foundation`. Wcięcie drzewa: `row` ma regułę bazową `[data-recipe='row'][aria-level] { --_level: 7 }` (każdy poziom ≥ 8 = 7 × `indent`) i zamkniętą listę `[aria-level='1']`…`[aria-level='7']` → `--_level` 0–6, która ją nadpisuje (później w pliku, ta sama specyficzność), oraz `padding-inline-start: calc(var(--ts-shape-control-side) + var(--_level) * var(--ts-space-indent))`; strażnik ma nazwany wyjątek `ARIA_LEVEL_INDENT` obejmujący regułę bazową i listę | typowane `attr()` brak w stabilnym Safari, `if()` tylko Chromium (§2); `aria-level` musi istnieć przy wirtualizacji (APG)                                       | zmiana Q6; contracts: rejestr CSS = `INSTANCE_KEYS`                                        |
| D40 (F-G, G9)             | Zakres osi w popupach: `lib/scope.ts` `inheritScope(trigger, popup)` kopiuje z najbliższych przodków triggera osie poddrzewa `THEME_CONFIG.subtreeAxes` (`size`, `density`, `corners`, `curve`, `motion`) na element `Popup` w ref callbacku (przed malowaniem); brak przodka = brak atrybutu. Źródło triggera: węzeł zarejestrowany przez trigger Tessery (`MenuTrigger`, `PopoverTrigger`, `Tooltip`, `MenuSubmenuTrigger`; wzór `SubmenuTriggerContext` z `menu.tsx`) w ref callbacku. Kanał `Root → Popup`: wrapper `Root` tworzy raz stały obiekt referencji i podaje go kontekstem; wartość kontekstu nigdy się nie zmienia, więc nic się nie renderuje ponownie (B4), a przez Reacta nie przechodzi żadna wartość osi, tylko uchwyt do węzła DOM (zakaz w „Forbidden” dotyczy wartości osi w kontekście albo stanie, nie tego uchwytu). Rejestracja działa niezależnie od sposobu otwarcia: kliknięcie, klawisz, sterowane `open`, `defaultOpen`. `eventDetails.trigger` służy tylko do rozróżnienia triggerów jednego uchwytu. `TooltipBar`: każdy trigger rejestruje węzeł pod swoim `trigger` (`useId`), a przy zmianie triggera tam, gdzie dziś startuje przelot (`usePopupFlight(flight, trigger)`), `inheritScope` kopiuje osie ponownie. Podmenu dziedziczy łańcuchem przez popup rodzica. Dialog nie dziedziczy: okno modalne to osobny kontekst strony. `readMotion(element)` czyta styl elementu przy każdym starcie ruchu, bez pamięci (D7); `indicator` podaje kontener, `popup-flight` popup, `press` przycisk                                                                                        | kontekst Reacta w portalu łamie Q8 i B4, portal w poddrzewie psuje `backdrop-filter` i `overflow` (§11)                                                         | nowe F18; `mode`, `accent`, `neutral` zostają na `<html>` (G10 odłożone)                   |
| D41 (F-I, G18)            | `lib/collection.ts` jako czyste funkcje bez DOM: wejście = lista `{ name, disabled }`, indeks bieżący, klawisz, `orientation`, `direction`, bufor typeahead; wyjście = indeks następnej pozycji i nowy bufor. Obsługuje orientację, kierunek, Home/End, pomijanie wyłączonych, zawijanie, typeahead (bufor liter kasowany po `TYPEAHEAD_RESET`, cykl po tej samej literze). Moduł nie pisze `tabIndex` ani fokusu: o miejscu tabulacji decyduje konsument (ToggleGroup renderuje `tabIndex` ze stanu wyboru), kierunek odczytuje konsument (`element.matches(':dir(rtl)')`, bez pomiaru), a `name` = nazwa dostępna (`aria-label` albo tekst, więc działa przy samych ikonach). ToggleGroup stoi na nim już w E2: strzałki zamieniają się w RTL, litera przenosi fokus i wybór jak strzałka (w grupie radiowej wybór idzie za fokusem; zmiana zachowania do potwierdzenia przez właściciela w streszczeniu). `nextOption` znika z `single-choice.ts` w tej samej fazie (sklep wyboru zostaje). Tabs i Tree w E3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Base UI nie ma Tree, `CompositeRoot` to API wewnętrzne, Base UI Tabs łamie Q9 (§12)                                                                             | U18 bez zmian                                                                              |
| D42 (F-L, G15)            | Warstwy w `depth`: `--ts-depth-layer-popup` (popup i okno modalne w jednej warstwie) < `--ts-depth-layer-toast` < `--ts-depth-layer-tooltip`; `layer-overlay` i `layer-modal` znikają. Kolejność „overlay < modal” prowadzącego wynika wtedy z DOM: Base UI wkłada portal dziecka do węzła portalu rodzica (`decisions/e2-base-ui.md` §2), więc menu w dialogu leży za dialogiem i jest nad nim, a dialog otwarty później leży później i przykrywa wcześniejszy popover. Osobna, niższa wartość dla `overlay` schowałaby popover otwarty z dialogu pod dialogiem. Toast nad oknem modalnym, bo komunikat ma być widoczny także przy otwartym dialogu; tooltip na samej górze, bo jest chwilowy, przypięty do kursora i opisuje element pod nim. W E2 toast nie ma komponentu ani wariantu: test kolejności wstawia skryptem testu element `position: fixed` z `z-index: var(--ts-depth-layer-toast)` przy otwartym dialogu i sprawdza `elementFromPoint`; tak samo sonda z warstwą tooltipa nad nim                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | jedna warstwa = mniej pojęć i poprawny przypadek „popup w dialogu”                                                                                              | zmiana F4; test kolejności                                                                 |
| D43 (F-M, G19, N6 audytu) | Grubość ikony: `--ts-size-icon-stroke` per rozmiar (jednostki użytkownika dla `viewBox` 24, konwencja lucide); przepisy `control` i `row` ustawiają `stroke-width` na `<svg>` slotu ikony (atrybut prezentacji ikony aplikacji przegrywa z CSS). Ikony Tessery rysowane na `viewBox` 24 bez `strokeWidth`. ESLint tryb `components`: biała lista atrybutów SVG (`viewBox`, `d`, `points`, `cx`, `cy`, `r`, `x`, `y`, `fill` ∈ {`none`, `currentColor`}, `stroke` = `currentColor`, `strokeLinecap`, `strokeLinejoin`, `aria-hidden`, `focusable`, `data-slot`) i zakaz literałów wyglądu w TSX komponentu: literałów liczbowych poza `0`, `1`, `-1` w całym pliku komponentu, także w inicjatorach stałych (dzisiejsze `SUBMENU_SWITCH_GRACE = 150`, `GROUP_TIMEOUT = 400`), poza atrybutami geometrii SVG; reguła pomija pozycje typów (`TSLiteralType`, np. unia `level: 1 \| 2 \| 3 \| 4` w `Heading`), bo to semantyka, nie wygląd (fixture `good/` z unią literałów w typie). Czasy zachowania (nie ruchu, więc nie zerują się przy `motion: off`) jako nazwane stałe w `lib/`: `SUBMENU_FLIGHT_GRACE` i `TOOLTIP_GROUP_GRACE` (`lib/popup-flight.ts`), `TYPEAHEAD_RESET` (`lib/collection.ts`); contracts: liczbowe stałe czasu w `lib/` tylko z tej listy i `SAMPLE_STEP`                                                                                                                                                                                                                                                                                                                                          | literały w TSX omijały strażników (N6 audytu); U7                                                                                                               | zmiana I1, U7                                                                              |
| D44                       | Inne techniki 2026 (§14). Przyjęte: `field-sizing: content` (v3 nie ma pomiaru JS do usunięcia; reguła przepisu wchodzi z komponentem Textarea w E3, a teraz próbka `/foundation` potwierdza działanie w obu silnikach); `scrollbar-gutter: stable both-edges` ze `scrollbar-width: thin` w `surface` `dialog` i w popupie (D35; symetria W5, brak skoku treści); `text-wrap` w `text` (D29). `@starting-style` przyjęty jako technika dla wejścia toastu, gdy właściciel o nim zdecyduje (E3). Odrzucone z powodem: `interpolate-size`/`calc-size()` (brak w Safari, animacja rozmiaru łamie Q3), `if()` i typowane `attr()` (brak w stabilnym Safari), `@custom-media` (brak w Chromium i Safari, build go nie przetłumaczy), `@scope` (zakres selektorów pilnuje strażnik, drugi mechanizm nic nie usuwa), `contrast-color()` (tylko biel lub czerń, pary `on-*` liczy build), CSS Anchor Positioning (walczy z pozycją Base UI)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | mniejsza złożoność albo brak wsparcia                                                                                                                           | sekcja „Odrzucone” w spec                                                                  |
| D45                       | Minimalne wsparcie: Chromium/WebView2 w kanale Evergreen (aktualny), Safari/WKWebView 26.2 (macOS Sonoma z aktualizacją Safari, Sequoia, Tahoe 26.2). Poniżej brak `field-sizing`, `scrollbar-color`, `text-wrap: pretty`; `corner-shape` zostaje stopniowym ulepszeniem (W3, Q16)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | najniższa wersja, w której wszystkie mechanizmy D29–D44 działają bez obejść (§ „Minimalna wersja Safari”)                                                       | nowe O7; decyzja dokumentu bez testu (WebKit Playwrighta jest powyżej progu)               |
| D46                       | Scena skrajności `/screens/edges` (U19: tylko Tessera, układ klasami Tailwinda) dla fundamentu i 7 komponentów (+ `Text`, `Heading`), z `apps/docs/tests/edges.spec.ts`. Konteksty testu jako funkcja w `tests/helpers.ts`, jeden kontekst na przypadek: zoom 50/100/150/200 % emulowany jak zoom przeglądarki (`viewport` = baza / z, `deviceScaleFactor` = z), `forcedColors: 'active'`, `contrast: 'more'`, `reducedMotion: 'reduce'`, `hasTouch` (daje `pointer: coarse` w obu silnikach), tryb jasny i ciemny, szerokości 320/768/1280/1920 px. Przy zoomie test sprawdza to, co od DPR zależy: pigułka przy celu ± 0,5 px po przejeździe, obrys 1 px (separator, tor w kontraście) widoczny przy DPR 0,5 (zrzut wycinka ma piksele inne niż tło), brak poziomego przewijania strony; nie sprawdza wysokości w px CSS, bo te od DPR nie zależą. Pomiary jednym `evaluate` na kontekst (testy lekkie, O1). `forced-colors` tylko Chromium (WebKit zmienia zapytanie, ale nie wymusza kolorów; macOS nie ma tego trybu); B7 tylko Chromium (WebKit nie ma CDP); oba `test.skip` z powodem zapisanym w `structure.md`. Strażnik F19: każda sekcja ekranu ma `data-edge-component="<nazwa>"`, `contracts.test.ts` wymaga sekcji dla każdego pliku komponentu `components/**/<nazwa>.tsx` (ta sama jednostka co dzisiejszy kontrakt F12, więc `text.tsx` i `heading.tsx` to dwie sekcje), a `edges.spec.ts` przechodzi po wszystkich sekcjach przy kontenerze 320 px (brak poziomego przepełnienia, treść w granicach), więc komponent E3 dostaje test skrajności automatycznie                                           | zasada właściciela: biblioteka jest tak dobra jak jej skrajne przypadki, każdy komponent responsywny                                                            | nowe F11 (ekran skrajności), F19                                                           |
| D47 (zmiany nazw)         | Faza, która zmienia nazwę wyjścia, osi, atrybutu, slotu albo propsa, przenosi w tym samym diffie wszystkich konsumentów: silniki, przepisy, komponenty, `lib/`, testy, strony laboratorium, `docs/*.md`. Gate każdej fazy obejmuje grep starych nazw z „Forbidden” (wynik pusty). Kolejność faz 12–14 wynika z tej reguły                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | zero legacy (Z3); bramki zielone po każdej fazie                                                                                                                | podział faz 12–14 poniżej                                                                  |

## Zakres (część 2)

### In scope

- Silniki: `color` (statusy jak akcenty, bez zmian), `type` (`display`, `measure-narrow`, oś `typeset`), `motion` (pętle), `space` (`indent`), `size` (geometria, wysokość przy dotyku, `icon-stroke`, rejestr `--ts-i-*`), `shape` (`box`, `track`, `thumb`), `depth` (warstwy D42), `state` (`selected-fill`, `invalid-color`, oś `platform`).
- Przepisy: nowy `text`; `control`, `row`, `surface` (ton, stany, `forced-colors`, rozmiar i symetria popupu, kontenery, pętla zajętości, wcięcie, grubość ikony); `indicator` (bez `will-change`, rozmiar z rejestru, `selected-fill`, `forced-colors`); `focus` (D32).
- Próbki `/foundation` bez wariantu przepisu: geometria toru i kciuka, szkielet (`pulse`), pasek nieokreślony (`sweep`), pasek z `--ts-i-value`, `textarea` z `field-sizing`.
- `lib/instance.ts`, `lib/scope.ts`, `lib/collection.ts` (+ testy obok); zmiany `indicator.ts`, `popup-flight.ts`, `press.ts`, `single-choice.ts`, `theme.ts`.
- Komponenty: `Text`, `Heading` (nowe, D29); Button (`busy`, `tone`), Menu (`tone`, `width`, zakres, ikony, stałe), ToggleGroup (kolekcja), Tooltip, Popover, Dialog (tytuł i opis przez `text`, zakres); `docs/<nazwa>.md` dla każdego.
- Strażnicy: `css-layers.ts` + fixture, ESLint tryb `components`, `contracts.test.ts`, `test/package/budget.test.ts`.
- Laboratorium: `/screens/edges`, sekcje `/foundation`, sekcja `text` na `/components`, panel (osie D33, menu o szerokości triggera), `edges.spec.ts`, `text.spec.ts`, B7 przez CDP.
- Dokumenty: spec, `structure.md`, masterplan, `AGENTS.md`, `decisions/e2-layers.md`, recenzje i ponowny audyt.

### Out of scope

- Komponenty E3/E4 i ich recepty specyficzne (keycap Kbd, toast z wejściem i stosem, szkielet, pasek postępu, `textarea`, checkbox, switch); próbki na `/foundation` wystarczą dla geometrii, pętli i `field-sizing`.
- Scena „stress”, B2, B3 (poza istniejącym testem ToggleGroup), B5 (poza ToggleGroup), B6, T1–T5, axe (E3).

### Forbidden

- Wszystko z „Forbidden” części 1.
- Aliasy i ślady starych nazw: `profile`, cała rodzina `--ts-size-hit`, `--ts-state-indicator-active*`, `--ts-depth-layer-overlay`, `--ts-depth-layer-modal`, `row` `data-variant='danger'`, `MenuItemVariant`, `nextOption` w `single-choice.ts`, sloty `header`/`body` w `surface`; kod migracji zapisu; stara nazwa żyjąca dłużej niż faza, która ją zmienia (D47).
- `will-change` na pigułce na stałe; wartości osi przekazywane kontekstem Reacta albo stanem (dozwolony jest tylko stały uchwyt do węzła triggera, D40); portal popupu w poddrzewie.
- `color-mix` poza `in oklab`; słowa kolorów systemowych poza blokiem `forced-colors`; `@keyframes` poza silnikiem `motion`; `@starting-style` w przepisach (do decyzji o toaście); próg `@container` spoza listy; zmienna dostawcy spoza listy; obrys powierzchni z tonem.
- Wariant albo wejście toastu, zmiana W16.
- Komentarze w kodzie (także WHY), edycja plików inaczej niż Edit/Write, komendy git u subagentów, `bun run test`, więcej niż 6 procesów testów naraz.

### Deferred (z audytu, z powodem)

| Luka                                                                                           | Kiedy                                  | Powód                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G10 sekcja odwrócona (`mode`/`accent` na poddrzewie), N4 audytu (F1 „oba tryby naraz”)         | E3, ekran „Wycinek strony”             | pierwszy konsument; mechanizm D40 przyjmie osie koloru, gdy element zakresu zapisze ich komplet; F1 do tego czasu: „w każdym trybie, przełącznik panelu”            |
| G17 kontrolka w polu (koncentryczność, slot ikony)                                             | E3, Select i Combobox                  | kierunek promienia (pole z dziecka czy dziecko z pola) zależy od pierwszego konsumenta                                                                              |
| G21 skalowanie tekstu Windows (px kontra ustawienie czcionki)                                  | E5, pomiar w WebView2                  | niewiadoma, czy WebView2 stosuje skalowanie tekstu systemu do treści; DPR i zoom sprawdza D46                                                                       |
| G22 obszar trafienia wierszy i obszar złożony                                                  | E3, lista i drzewo                     | sąsiednie wiersze nachodziłyby na siebie; potrzebny wzór z wyjątkiem odstępu WCAG                                                                                   |
| G23 `prefers-contrast` szerzej, `prefers-reduced-transparency`                                 | E3                                     | `prefers-reduced-transparency` brak w WebKit; D46 sprawdza tylko istniejącą gałąź (obrys 2 px)                                                                      |
| G24 RTL pełne (pigułka i przelot liczone fizycznie, `DirectionProvider`, `direction.tsx` z v2) | gdy pojawi się konsument RTL           | brak konsumenta; D41 daje kierunek strzałek                                                                                                                         |
| G25 budżety B2, B3, B5, B6, T1–T5                                                              | E3 start (scena „stress”)              | plan części 1 i masterplan                                                                                                                                          |
| Typeahead w Tabs i Tree, wirtualizacja (Q12, `virtual-list.ts` z v2)                           | E3                                     | moduł D41 gotowy, konsumenci w E3                                                                                                                                   |
| Strażnik `locale` z v2                                                                         | E4                                     | teksty wbudowane przychodzą z rodzinami E4                                                                                                                          |
| Strażnik `tabular-nums` z v2                                                                   | odrzucony jako osobny strażnik         | zastępuje go wariant `kbd` i modyfikator `data-numeric` (D29) z testem; komponenty z liczbami w E3 (Table, Slider, liczniki) dostają `data-numeric` w swoim teście  |
| `--anchor-height`, `--transform-origin` na białej liście                                       | E3, Select                             | wpis bez użycia oblewa strażnika (D35)                                                                                                                              |
| Wariant i wejście toastu (W16)                                                                 | E3, komponent Toast                    | pytanie do właściciela: czy toast wjeżdża od krawędzi ekranu (`translate` + `opacity`, `@starting-style`) jako wyjątek od W16; do decyzji tylko `layer-toast` (D42) |
| Warianty przepisów `skeleton`, pasek postępu, `textarea` z `field-sizing`                      | E3 (Textarea), E4 (Skeleton, Progress) | wariant przepisu powstaje z komponentem; teraz próbki `/foundation`                                                                                                 |

### Dozwolone decyzje lokalne

- Liczby D38 (proporcje toru, kciuka, szyny, grubości ikony), czasy pętli, progi D33 i wartości warstw D42, jeśli zachowują zależności i kolejność; zapis w `docs/<komponent>.md` albo w decyzji.
- Dokładne kolory systemowe w bloku `forced-colors` i punktowe `forced-color-adjust: none`, jeśli test D36 przechodzi.
- Szczegóły rejestracji triggera w D40 (nazwa kontekstu, kształt obiektu referencji), jeśli źródłem zostaje węzeł zarejestrowany przez trigger Tessery i jedna funkcja `inheritScope`.
- Wariant warstwy „od wejścia do grupy do końca ruchu” (D31), jeśli pomiar „po” go wymusza.
- Nowe słowa kluczowe na białych listach strażnika z powodem w teście.

### Zatrzymaj się i wróć po decyzję, gdy

- B8 > 250 albo nowy silnik, przepis (poza `text`), oś lub zmiana grafu U8;
- `forced-colors` nie da się uzyskać bez `forced-color-adjust: none` na całym komponencie;
- trigger Tessery nie może zarejestrować węzła dla któregoś popupu (np. trigger podany przez konsumenta jako `render`);
- pomiar D31 pokazuje regresję w obu wariantach (bez `will-change` i z warstwą od wejścia do grupy);
- edge test wymaga zmiany kontraktu komponentu E3 albo nowego komponentu.

## Kontekst do przeczytania (część 2)

1. `AGENTS.md`, `docs/specification.md` (full), ta część planu (full), decyzje D1–D28 części 1.
2. `docs/reviews/e2-foundation-gaps.md` (full), `docs/research/e2-foundation-2026.md` (sekcja odpowiadająca jednostce).
3. `docs/decisions/e2-base-ui.md` §1–2.
4. `packages/tessera/test/guards/css-layers.ts`, `src/eslint/no-local-appearance.ts`, `src/eslint/layout.ts` (przed zmianą strażników).
5. Plik, który jednostka zmienia, w całości (pliki stanu i zachowania czyta się w całości, nie fragmentami).

## Impact scan (część 2)

| Kontrakt                                               | Ryzyko                                                                                        | Obowiązek                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publiczne nazwy (`--ts-*`, osie motywu, sloty, propsy) | zmiany nazw D29, D30, D33, D37, D38, D42 łamią przepisy, komponenty, testy, panel i dokumenty | D47: konsumenci w tym samym diffie; grep starych nazw w gate każdej fazy; `contracts.test.ts` (osie ↔ silniki) pilnuje obu kierunków                                                                                                                                                                                  |
| Zapis motywu `ts-appearance`                           | klucz `profile` w zapisie                                                                     | walidacja per oś odrzuca nieznany klucz; test `theme.test.ts` z rekordem zawierającym `profile`                                                                                                                                                                                                                       |
| Strażnik i ESLint                                      | nowe białe listy otwierają furtki                                                             | fixture `bad/` dla każdej furtki (zła nazwa klatek, `width` w klatkach, próg spoza listy, kolor systemowy poza blokiem, `color-mix` w `srgb`, nieznana zmienna dostawcy, klucz spoza rejestru w `style`, `strokeWidth`, liczba w wartości atrybutu TSX, `@starting-style` w przepisie, obrys w regule tonu `surface`) |
| Kliknięcia                                             | stuknięcie przy krawędzi trafia w sąsiada albo kontrolka przy dotyku ma pudełko < 24 × 24 px  | test `elementFromPoint` i rozmiaru pudełka D38 przy myszy i dotyku                                                                                                                                                                                                                                                    |
| Pigułka (sliding)                                      | rozmiar przez rejestr i brak `will-change` zmieniają ruch                                     | istniejące testy `menu.spec.ts`, `toggle-group.spec.ts` (kompozytor, ściana, zawrócenie) bez zmian asercji; pomiar D31                                                                                                                                                                                                |
| Popupy                                                 | przewijanie zmienia pomiar pigułki; zakres osi zmienia promień                                | test przewiniętej pozycji z pigułką; koncentryczność w popupie z paska `xs`                                                                                                                                                                                                                                           |
| Warstwy z-index                                        | scalenie `overlay`/`modal`                                                                    | testy: menu w dialogu nad dialogiem, popover z dialogu nad dialogiem, sonda `layer-toast` nad dialogiem, sonda `layer-tooltip` nad nią (`elementFromPoint`, sondy wstawia skrypt testu)                                                                                                                               |
| B4                                                     | wrappery `Root` z `onOpenChange`                                                              | test B4 na `/screens/edges`: zmiana osi i otwarcie popupu bez dodatkowych commitów komponentów                                                                                                                                                                                                                        |
| Czas `check` i pre-push                                | nowe testy Playwright                                                                         | pomiar w fazie 14a; wzrost > 50 % względem części 1 = decyzja właściciela                                                                                                                                                                                                                                             |

## Target design (część 2)

### Nowe i zmienione wyjścia silników

| Silnik   | Zmiana                                                                                                                    | Nowe nazwy                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `color`  | bez zmian: statusy jak akcenty, jedna wartość w obu trybach (D30)                                                         | 0                                                                                                                  |
| `type`   | `[data-typeset='inter']` zamiast `[data-profile='desktop']`; stopień display; miara                                       | `display-size`, `display-leading`, `measure-narrow` (3)                                                            |
| `motion` | `@keyframes` (D34); zerowanie w `off` i reduced motion                                                                    | `spin`, `sweep`, `pulse`, `loop` (4)                                                                               |
| `space`  | wcięcie drzewa                                                                                                            | `indent` (1)                                                                                                       |
| `size`   | geometria D38, grubość ikony, rejestr `@property --ts-i-*` (faza 12); `hit` znika, wysokość ≥ 24 px przy dotyku (faza 13) | `box`, `track-inline`, `track-block`, `thumb`, `rail`, `icon-stroke`, bez `hit` (−1 netto) (5) + 3 klucze rejestru |
| `shape`  | promienie geometrii                                                                                                       | `box`, `track`, `thumb` (3)                                                                                        |
| `depth`  | warstwy D42 (zmiana nazw w fazie 13 razem z `surface`)                                                                    | `layer-popup`, `layer-toast` zamiast `layer-overlay`, `layer-modal` (0 netto)                                      |
| `state`  | `[data-platform]` zamiast `[data-profile]`; `indicator-active*` → `selected-fill*` (D37)                                  | `invalid-color` (1)                                                                                                |
| `focus`  | bez zmian                                                                                                                 | 0                                                                                                                  |

Razem ok. 20 nowych nazw (z rejestrem): B8 = 146 z 250 po fazie 13. `test/package/budget.test.ts` liczy też klucze rejestru `--ts-i-*` (deklarowane przez `@property`, nie przez `--x:`), bo to publiczne API.

### Przepisy

| Przepis       | Zmiana                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text` (nowy) | warianty D29, `data-numeric`; bez `data-tone` (kolor błędu z `state`)                                                                                                                                                                                                                                                                             |
| `control`     | `data-tone` (D30, z `raised`); stany D37 na `::after`; `field` z `aria-invalid`/`:user-invalid` (obrys `invalid-color`) i `[readonly]`; `aria-busy` + pętla `spin` na slocie ikony (D34); bez `::before` obszaru trafienia (D38); `stroke-width` ikony (D43); blok `forced-colors` (D36)                                                          |
| `row`         | `data-tone` zamiast `danger`; `::after` dla `[aria-selected='true']` i `aria-current`; wcięcie `aria-level` (D39); `stroke-width` ikony; blok `forced-colors`                                                                                                                                                                                     |
| `surface`     | `data-tone` (tło i cień, bez obrysu); rozmiar, przewijanie i rynny popupu i tooltipa (D35); `data-width='trigger'`; `data-container` i `page` jako kontener (D33); stopka w kolumnie poniżej `narrow`; `dialog` z `scrollbar-gutter`; bez slotów `header`/`body`; z-index z D42; bez bloku `forced-colors` (obrys toru wymusza przeglądarka, D36) |
| `indicator`   | bez `will-change`; `inline-size`/`block-size` z rejestru; pigułka `active` z `--ts-state-selected-fill*`; blok `forced-colors` (`raised` i `active` = `Highlight`)                                                                                                                                                                                |
| `focus`       | reguła pola bez bramki (D32)                                                                                                                                                                                                                                                                                                                      |

### Strażnik warstw: nowe białe listy (każda z fixture `good/` i `bad/`)

| Lista                                        | Gdzie                                       | Zawartość                                                                                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VENDOR_VARIABLES`                           | przepisy                                    | `--available-height`, `--available-width`, `--anchor-width`; powód przy każdej; nieużyta oblewa                                                                                                                                         |
| `INSTANCE_KEYS` (import z `lib/instance.ts`) | przepisy (odczyt), `size.css` (`@property`) | D39                                                                                                                                                                                                                                     |
| funkcje przepisu                             | przepisy                                    | `calc`, `min`, `max`, `clamp`, `color-mix` (tylko `in oklab`)                                                                                                                                                                           |
| at-rule przepisu                             | przepisy                                    | `@media (hover: hover)`, `@media (forced-colors: active)`, `@container` z progiem z `CONTAINER_WIDTHS` (wewnątrz tylko `COMPONENT_LAYOUT`); `@starting-style` zostaje zabroniony (fixture `bad/`) do decyzji o toaście                  |
| at-rule komponentu                           | CSS komponentu                              | `@container` jak wyżej                                                                                                                                                                                                                  |
| at-rule silnika                              | `motion.css`                                | `@keyframes` z listy `ts-spin`, `ts-sweep`, `ts-pulse`; selektory `from`, `to`, `N%`; deklaracje tylko `transform`, `translate`, `rotate`, `scale`, `opacity`                                                                           |
| słowa przepisu                               | przepisy                                    | `linear`, `ease-in-out`, `infinite`, `thin`, `stable`, `both-edges`, `balance`, `pretty`, `tabular-nums`, `trim-both`, `cap`, `alphabetic`, `content`, `inline-size`, `in`, `oklab`; kolory systemowe D36 tylko w bloku `forced-colors` |
| wyjątki selektorów                           | przepisy                                    | `KEYBOARD_FOCUS` z nowym tekstem (D32); `ARIA_LEVEL_INDENT` (`row`: `--_level` 0–7 tylko pod `[aria-level='N']`, wyłączony ze sprawdzenia „arytmetyka na literale”)                                                                     |

ESLint `no-local-appearance` w trybie `components`: `style` tylko jako obiekt literalny z kluczami z `INSTANCE_KEYS`; biała lista atrybutów SVG i literałów wyglądu, z pominięciem pozycji typów (D43). `contracts.test.ts`: każda wartość `data-tone` ma regułę w `control`, `row`, `surface` (z `raised` w `control`), a reguła tonu w `surface` nie deklaruje `border*`; `@property --ts-i-*` w `size.css` = `INSTANCE_KEYS`; `writeInstance` z wartością z pomiaru tylko w plikach z listy pomiaru; każda oś z `subtreeAxes` ma regułę silnika poza `:root`; stałe czasu w `lib/` = lista D43; `CONTAINER_WIDTHS` użyte co najmniej raz; każdy komponent z `components/**` ma sekcję `data-edge-component` na `/screens/edges` (F19).

### Przepływ zakresu osi (D40)

```text
montaż triggera Tessery
-> ref callback zapisuje węzeł w stałym obiekcie referencji wrappera Root (kontekst, wartość niezmienna)
otwarcie dowolną drogą (klik, klawisz, sterowane open, defaultOpen)
-> Popup montuje się; ref callback: inheritScope(węzeł triggera, popup)
   (closest('[data-size]'), …; <html> pomijany)
TooltipBar: zmiana triggera (start przelotu) -> inheritScope(nowy węzeł, ten sam popup)
-> CSS silników działa na popupie jak na poddrzewie (D14)
-> readMotion(popup) czyta tryb ruchu popupu
```

### Docelowe drzewo (część 2)

```text
tessera/
├── AGENTS.md                                      # MODIFY (faza 9): model warstw (style z kluczami rejestru, color-mix i kolory
│                                                  #   systemowe w przepisach, @container z progami, @keyframes w motion);
│                                                  #   (faza 16): pułapki (forced-colors i B7 tylko Chromium)
├── docs/
│   ├── specification.md                           # MODIFY (faza 9): lista „Zmiany specyfikacji”
│   ├── structure.md                               # MODIFY (faza 9, 16): drzewo, reguły wzrostu, wyjątki strażnika, skipy WebKit
│   ├── plans/masterplan.md                        # MODIFY (teraz): E2 obejmuje część 2, cel końcowy
│   ├── plans/e2-foundation.md                     # MODIFY (teraz): ta część; D8 wskazuje D31
│   ├── decisions/e2-layers.md                     # CREATE (faza 14b): pomiar warstw przed i po D31
│   ├── research/e2-foundation-2026.md             # DELETE (faza 16): wiedza w spec i kodzie
│   ├── reviews/e2-code-part2-{engines,behavior,lab}.md   # CREATE (faza 16)
│   └── reviews/e2-foundation-gaps-2.md            # CREATE (faza 16): ponowny audyt luk
├── packages/tessera/
│   ├── docs/text.md, heading.md                   # CREATE
│   ├── docs/{button,menu,toggle-group,tooltip,popover,dialog,input}.md   # MODIFY
│   ├── src/engines/color.css                      # MODIFY (GENERATED)
│   ├── src/engines/{type,motion,space,size,shape,depth,state}.css        # MODIFY
│   ├── src/recipes/text.css                       # CREATE
│   ├── src/recipes/{control,row,surface,indicator,focus}.css              # MODIFY
│   ├── src/styles/tessera.css                     # MODIFY: import recipes/text.css
│   ├── src/components/text/text.tsx, heading.tsx  # CREATE (rodzina text)
│   ├── src/components/{button,menu,toggle-group,tooltip,popover,dialog}/*.tsx   # MODIFY
│   ├── src/lib/instance.ts                        # CREATE (lista w fazie 10, funkcja w 14a; test w Playwright)
│   ├── src/lib/scope.ts                           # CREATE (test w Playwright, vitest jest w środowisku node)
│   ├── src/lib/collection.ts, collection.test.ts  # CREATE (czyste funkcje, test vitest)
│   ├── src/lib/{indicator,popup-flight,press,single-choice,theme}.ts + testy   # MODIFY
│   ├── src/eslint/layout.ts                       # MODIFY: CONTAINER_WIDTHS
│   ├── src/eslint/no-local-appearance.ts, rules.test.ts   # MODIFY
│   ├── test/guards/css-layers.ts, css-layers.test.ts, fixtures/**   # MODIFY
│   ├── test/guards/contracts.test.ts              # MODIFY
│   └── test/package/budget.test.ts                # MODIFY: klucze rejestru w B8
└── apps/docs/
    ├── app/screens/edges/page.tsx                 # CREATE
    ├── app/foundation/page.tsx                    # MODIFY: tony, tekst, geometria, pętle, szkielet, textarea, drzewo, pasek --ts-i-value
    ├── app/components/page.tsx, sections/text.tsx # MODIFY / CREATE
    ├── app/components/sections/menu.tsx, app/screens/overlays/page.tsx   # MODIFY: tone
    ├── app/panel.tsx                              # MODIFY: osie platform i typeset, MenuContent width="trigger"
    └── tests/
        ├── edges.spec.ts                          # CREATE
        ├── text.spec.ts                           # CREATE
        ├── helpers.ts                             # MODIFY: konteksty D46, licznik warstw CDP
        └── lab.spec.ts, button.spec.ts, menu.spec.ts, toggle-group.spec.ts, tooltip.spec.ts   # MODIFY
```

## Zmiany specyfikacji (wchodzą w fazie 9)

Jedna pozycja spec = jeden wiersz. Gate fazy 9 odhacza każdy wiersz z numerem linii w spec.

| Pozycja                  | Zmiana                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U7                       | grubość ikony = wyjście `size` (D43)                                                                                                                                                                                                                                                                                                                              |
| U9                       | publiczne API = wyjścia `--ts-<silnik>-<rola>` oraz klucze rejestru wartości instancji `--ts-i-*` (`@property` w silniku `size`, lista w `lib/instance.ts`, liczone do B8) (D39)                                                                                                                                                                                  |
| U10                      | sześć przepisów: `control`, `surface`, `row`, `indicator`, `focus`, `text` (D29)                                                                                                                                                                                                                                                                                  |
| U10a (nowe zdanie w U10) | słownik wariantów: `solid`, `soft`, `outline`, `ghost`, `raised` (wariant istniał w kodzie, N5 audytu), `field`                                                                                                                                                                                                                                                   |
| U10b (nowe zdanie w U10) | oś tonu `data-tone` (`neutral`, `accent`, `danger`, `success`, `warning`, `info`) ortogonalna do wariantu w `control`, `row`, `surface` (D30)                                                                                                                                                                                                                     |
| U31                      | osie panelu: `platform` i `typeset` zamiast `profile` (D33)                                                                                                                                                                                                                                                                                                       |
| W3                       | geometria toru, kciuka i pola z wysokości (D38)                                                                                                                                                                                                                                                                                                                   |
| W6                       | statusy mają wartość jasną i ciemną (D30)                                                                                                                                                                                                                                                                                                                         |
| W7                       | bez zmiany treści; dopisek: żywość dotyczy także ciemnych statusów (D30)                                                                                                                                                                                                                                                                                          |
| W8                       | zaznaczenie płaskie `--ts-state-selected-fill` (pigułka `active`, tło wielu wyborów); błąd `invalid-color` (D37)                                                                                                                                                                                                                                                  |
| W9                       | pola bez ramki z dwoma wyjątkami: obrys `invalid-color` pola w błędzie (D37) i widoczny obrys pola i toru w trybie `forced-colors`, który przeglądarka wymusza sama z przezroczystej ramki przepisu (D36)                                                                                                                                                         |
| W14                      | pigułka zaznaczenia jednego wyboru domyślnie `raised`; wiele wyborów = tło stanu (wiersz tylko w `[aria-multiselectable='true']`); pigułka bez stałej warstwy (D31, D37); powierzchnia z tonem bez obrysu (D30); poziomy `base` i `raised` bez obrysu (F6)                                                                                                        |
| W19                      | oś `typeset` (zestaw krojów) (D33)                                                                                                                                                                                                                                                                                                                                |
| W21                      | kursor według osi `platform` (D33)                                                                                                                                                                                                                                                                                                                                |
| F1                       | próbki „w każdym trybie” (przełącznik panelu) do czasu G10                                                                                                                                                                                                                                                                                                        |
| F3                       | `size`: `box`, `track-*`, `thumb`, `rail`, `icon-stroke`, wysokość ≥ 24 px przy `pointer: coarse`; bez obszaru trafienia poza pudełkiem (D38, D43)                                                                                                                                                                                                                |
| W1                       | obszar trafienia = pudełko kontrolki; przy `pointer: coarse` wysokość kontrolki co najmniej 24 px (xs i sm rosną), z `min-width` = wysokość pudełko ≥ 24 × 24 px; skala bez zmian przy myszy (D38)                                                                                                                                                                |
| F4                       | warstwy `popup` < `toast` < `tooltip`; kolejność popupów i okien z DOM (D42)                                                                                                                                                                                                                                                                                      |
| F6                       | wyjścia pętli (D34)                                                                                                                                                                                                                                                                                                                                               |
| F7                       | CSS komponentu może mieć `@container` z progiem px z zamkniętej listy `CONTAINER_WIDTHS`; inne liczby bez zmian (D33)                                                                                                                                                                                                                                             |
| F8                       | pole pokazuje fokus po natywnym `:focus-visible` (D32)                                                                                                                                                                                                                                                                                                            |
| F10                      | `Text` i `Heading` jako komponenty E2 (D29)                                                                                                                                                                                                                                                                                                                       |
| F11                      | piąty ekran: „Skrajności” `/screens/edges` (D46)                                                                                                                                                                                                                                                                                                                  |
| F12                      | `Text` i `Heading` mają `docs/<nazwa>.md` i ≥ 2 strony laboratorium (D29)                                                                                                                                                                                                                                                                                         |
| F16 (nowe)               | popup mieści się w oknie: wysokość i szerokość z `--available-*`, przewijanie, symetryczne rynny (D35)                                                                                                                                                                                                                                                            |
| F17 (nowe)               | kontenery: `data-container` i `page`, zamknięta lista progów, w E2 tylko `narrow` (D33)                                                                                                                                                                                                                                                                           |
| F18 (nowe)               | zakres osi w popupach: osie poddrzewa triggera kopiowane na popup (D40)                                                                                                                                                                                                                                                                                           |
| F19 (nowe)               | skrajności i responsywność: każdy komponent ma sekcję i test na `/screens/edges`, z kontenerem 320 px; strażnik w `contracts.test.ts` (D46)                                                                                                                                                                                                                       |
| Q2                       | pętle tylko `@keyframes` silnika `motion`; `motion: off` i reduced motion je zatrzymują (D34)                                                                                                                                                                                                                                                                     |
| Q4                       | zdanie o pigułce: wskaźnik slidingu nie jest warstwą długiego życia, warstwa tylko w czasie ruchu (D31); reszta Q4 (popup w przelocie, poświata, orby jako warstwy długiego życia z budżetem B7, N5 dla wciśnięcia) bez zmian                                                                                                                                     |
| Q6                       | rejestr `--ts-i-*`, zapis przez `lib/instance.ts` lub `style` z kluczami rejestru; wartość z pomiaru tylko w plikach Q7; wcięcie z `aria-level` (D39)                                                                                                                                                                                                             |
| Q7                       | lista plików pomiaru bez zmian (`scope.ts` i `collection.ts` nie mierzą)                                                                                                                                                                                                                                                                                          |
| Q19 (nowe)               | `forced-colors`: strategia D36, test w Chromium                                                                                                                                                                                                                                                                                                                   |
| B7 (tabela budżetów)     | definicja: liczba i suma pól warstw poza korzeniem, które rysują i mają pole > 0 (CDP `LayerTree`, Chromium); w spoczynku żadna nie należy do pigułki ani do treści nad nią; ≤ 12 przy aktywnej grupie i otwartym popupie przy DPR 1,5 na `/screens/overlays` oraz w spoczynku i przy otwartym menu z działającą pętlą przy DPR 1 i 1,5 na `/screens/edges` (D31) |
| I1                       | bez literałów wyglądu i atrybutów wyglądu SVG w TSX komponentu; pozycje typów dozwolone (D43)                                                                                                                                                                                                                                                                     |
| O7 (nowe)                | minimalne wsparcie D45                                                                                                                                                                                                                                                                                                                                            |
| S1                       | „pięć ekranów testowych” (z „Skrajności”) zamiast czterech                                                                                                                                                                                                                                                                                                        |
| Zakres (sekcja spec)     | „sześć przepisów” zamiast „pięć”; ekran „Skrajności” w laboratorium                                                                                                                                                                                                                                                                                               |
| N5                       | część o pigułce zamknięta (D31); wciśnięcie przycisku zostaje otwarte                                                                                                                                                                                                                                                                                             |
| Odrzucone                | lista z D44                                                                                                                                                                                                                                                                                                                                                       |
| Odłożone                 | tabela „Deferred” części 2 z kolumnami „kiedy” i „powód” (w tym wejście toastu jako pytanie do właściciela)                                                                                                                                                                                                                                                       |

## Plan wykonania (część 2)

Bramki każdej fazy w tej kolejności: `bun run typecheck` → `bun run build` → `bun run lint` → `bunx vitest run --maxWorkers=6` → `bun run test:browser` (Playwright, 1 worker, headless), potem grep starych nazw z „Forbidden” (wynik pusty, D47). Faza kończy się lokalnym commitem (D28); w fazie 13 zalecany commit po każdej grupie.

Grep starych nazw: jedna komenda, `--untracked`, bo nowe pliki są niezacommitowane do końca fazy; `.gitignore` wyklucza `dist/` i `out/`, a zakres ścieżek wyklucza `docs/plans/`, `docs/reviews/`, `docs/research/` i `docs/session-logs/` (tam stare nazwy są historią):

```text
git grep -nE --untracked -e '<wzorzec>' -- packages/tessera/src packages/tessera/test packages/tessera/docs \
  packages/tessera/scripts apps/docs/app apps/docs/tests docs/specification.md docs/structure.md AGENTS.md
```

Wzorce (rozszerzone wyrażenia regularne, jeden `-e` na wzorzec):

```text
faza 12:  data-profile
          profile:
          ['"`]profile['"`]
faza 13:  --ts-size-hit                      (cała rodzina, także deklaracja i var())
          layer-(overlay|modal)
          indicator-active
          data-slot=['"](header|body)['"]   (CSS [data-slot='header'] i TSX data-slot="header")
          variant=['"]danger
          MenuItemVariant
faza 14a: nextOption
          SUBMENU_SWITCH_GRACE
          GROUP_TIMEOUT
faza 14b: will-?[cC]hange                   (tylko src/lib/indicator.ts i src/recipes/indicator.css)
```

Grep fazy obejmuje też wzorce wszystkich wcześniejszych faz. Spec, `structure.md` i `AGENTS.md` opisują stan bieżący bez starych nazw (historia zmian jest w masterplanie i w tym planie). Kolejność faz 12–14 wynika z D47: każda zmiana nazwy ląduje w fazie razem ze wszystkimi konsumentami, więc po każdej fazie bramki są zielone.

### Faza 9: dokumenty i preflight

**Cel:** spec i `AGENTS.md` mówią to samo co część 2, zanim pracę dostaną subagenci; ostatnia niewiadoma mechanizmu rozstrzygnięta.

**Działania:**

1. Spec według tabeli „Zmiany specyfikacji”; `structure.md` (drzewo, reguły wzrostu, nowe listy strażnika, kontrakty, skipy WebKit dla `forced-colors` i B7); `AGENTS.md`, sekcja „Model warstw” (`style` komponentu tylko z kluczami rejestru, `color-mix` i kolory systemowe w przepisach, `@container` z progami w CSS komponentu, `@keyframes` tylko w `motion`), bo subagenci od fazy 10 czytają go jako pierwszy plik; masterplan już zaktualizowany razem z planem.
2. Preflight (jednorazowy skrypt w scratchpadzie sesji, poza repo): emulacje Playwrighta, `text-box`, `field-sizing` i kontener na `<body>` są już rozstrzygnięte sondami recenzji (`e2-plan-part2-tech.md`), wynik przepisany do raportu fazy. Zostaje D40: czy węzeł zarejestrowany przez trigger Tessery jest dostępny w ref callbacku `Popup` przy otwarciu kliknięciem, klawiszem, sterowanym `open` i `defaultOpen` (pierwszy commit montuje trigger i popup naraz) dla Menu, podmenu, Popover, Tooltip i `TooltipBar`. Gdy przy `defaultOpen` ref popupu przychodzi przed refem triggera: `inheritScope` w efekcie układu popupu (nadal przed malowaniem); decyzja lokalna D40.

**Gate:** bramki zielone; każdy wiersz tabeli „Zmiany specyfikacji” odhaczony z numerem linii w spec; wynik preflightu zapisany.

**Wynik preflightu D40 (2026-11-01):** jednorazowa sonda poza repo (React 19.3.1, Base UI 1.9.0 z `node_modules` worktree, Playwright 1.64.1, headless, Chromium i WebKit po kolei). Mechanizm D40 odtworzony w miniaturze: stały obiekt referencji w kontekście wrappera `Root`, trigger zapisuje węzeł w ref callbacku, ref callback `Popup` wywołuje `inheritScope` (kopiuje `data-size` i `data-corners` z przodków triggera); trigger w poddrzewie `data-size="xs"`.

| Popup                                   | klik / najechanie | klawisz           | sterowane `open`  | `defaultOpen`     | `open` od montażu |
| --------------------------------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- |
| Menu                                    | xs / xs           | xs / xs           | xs / xs           | xs / xs           | xs / xs           |
| Podmenu (łańcuch przez popup rodzica)   | xs / xs           | xs / xs           | xs / xs           | xs / xs           | xs / xs           |
| Popover                                 | xs / xs           | xs / xs           | xs / xs           | xs / xs           | xs / xs           |
| Tooltip                                 | xs / xs           | xs / xs           | xs / xs           | xs / xs           | xs / xs           |
| `TooltipBar` (A w `xs`, potem B w `xl`) | xs → xl / xs → xl | xs → xl / xs → xl | xs → xl / xs → xl | xs → xl / xs → xl | xs → xl / xs → xl |

Komórka: Chromium / WebKit; wartość `data-size` popupu odczytana już w `MutationObserver` przy wstawieniu popupu do DOM (przed malowaniem). Wnioski:

- Ref triggera przychodzi przed refem popupu we wszystkich 20 przypadkach Menu, podmenu, Popover i Tooltip w obu silnikach, także przy `defaultOpen` i `open` od montażu (portal Base UI montuje treść popupu commit później niż trigger). Wariant awaryjny „`inheritScope` w efekcie układu popupu” nie jest potrzebny.
- `TooltipBar`: popup montuje się commit po zmianie `payload`, a przy `defaultOpen` `payload` przychodzi commit po refie popupu. Kopia działa tylko wtedy, gdy węzeł popupu jest w stanie (`useState`, jak dziś w `usePopupFlight`), a `inheritScope` biegnie w efekcie układu zależnym od pary (węzeł popupu, `trigger`). Sam ref callback albo efekt zależny tylko od `trigger` gubi pierwsze otwarcie (pierwsza wersja sondy: brak osi przy najechaniu, klawiszu i sterowanym `open`). Decyzja lokalna D40 dla fazy 14a.
- Wartość kontekstu paska (uchwyt i mapa triggerów) musi być stała (`useState`); obiekt tworzony w renderze zmienia ref callbacki triggerów przy każdym renderze (sonda: odpięcie i ponowne przypięcie wszystkich triggerów).
- Emulacje Playwrighta, `text-box`, `field-sizing` i kontener na `<body>` rozstrzygnęła wcześniej sonda recenzji (`reviews/e2-plan-part2-tech.md`): `contrast`, `reducedMotion`, `hasTouch` (`pointer: coarse`), `deviceScaleFactor: 0.5`, `text-box`, `field-sizing` działają w obu silnikach; `forcedColors` wymusza kolory tylko w Chromium; `<body>` z `container-type` nie jest blokiem zawierającym dla `fixed` w obu.

### Faza 10: strażnicy

**Cel:** każdy nowy mechanizm ma regułę, zanim powstanie kod, który jej używa.

**Działania:** kod reguł i ich fixture `good/`/`bad/` dla wszystkich pozycji z „Strażnik warstw: nowe białe listy”, reguł ESLint D43 i D39 i kontraktów z tej samej sekcji; `INSTANCE_KEYS` powstaje teraz w `lib/instance.ts` (sama lista i typ), bo czytają ją strażnik i ESLint. Reguła jest **włączona na kodzie produktu** (wpis na liście wyjątków albo dostawcy, blok w `eslint.config.js`, test kontraktu na `src/`) dopiero w fazie z kolumny „Włączenie”: w fazie 10 tylko to, co obecny kod spełnia albo co jest samym pozwoleniem; reszta w fazie pierwszego konsumenta albo w fazie, która usuwa naruszenie. Do tej fazy reguła działa tylko na fixture.

| Pozycja                                                                         | Włączenie | Powód                                                                    |
| ------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| funkcja `color-mix` (tylko `in oklab`) w przepisach                             | 10        | pozwolenie; obecny kod go nie używa                                      |
| `@media (forced-colors: active)` i kolory systemowe tylko w tym bloku           | 10        | pozwolenie i zakaz poza blokiem; obecny kod nie ma ani jednego           |
| `@container` tylko z progiem z `CONTAINER_WIDTHS`                               | 10        | obecny kod nie ma `@container`                                           |
| kontrakt „`CONTAINER_WIDTHS` użyte co najmniej raz”                             | 13        | pierwszy konsument: stopka `surface`                                     |
| zakaz `@starting-style` w przepisach                                            | 10        | obecny kod go nie ma                                                     |
| `@keyframes` tylko w `motion.css`, tylko z listy, tylko właściwości kompozytora | 10        | obecny kod nie ma `@keyframes`                                           |
| `@property --ts-i-*` w `size.css`, odczyt kluczy rejestru w przepisach          | 10        | pozwolenie                                                               |
| kontrakt `@property --ts-i-*` = `INSTANCE_KEYS`                                 | 12        | rejestr powstaje w fazie 12                                              |
| ESLint: `style` w komponencie tylko z kluczami rejestru                         | 10        | obecne komponenty nie mają `style`                                       |
| ESLint: biała lista atrybutów SVG (`strokeWidth` poza nią)                      | 13        | `menu.tsx` ma `strokeWidth={1.5}`; ikony bez niego w fazie 13            |
| ESLint: literały liczbowe w TSX komponentu                                      | 14a       | `SUBMENU_SWITCH_GRACE = 150` i `GROUP_TIMEOUT = 400` znikają w fazie 14a |
| kontrakt stałych czasu w `lib/` = lista D43                                     | 14a       | stałe powstają w fazie 14a                                               |
| kontrakt `writeInstance` z pomiarem tylko w plikach Q7                          | 14a       | pierwsze wywołanie `writeInstance`                                       |
| `VENDOR_VARIABLES` (nieużyty wpis oblewa)                                       | 13        | konsumenci D35 w fazie 13                                                |
| nowy tekst wyjątku `KEYBOARD_FOCUS`                                             | 13        | reguła D32 w fazie 13; do tego czasu obowiązuje dzisiejszy tekst         |
| wyjątek `ARIA_LEVEL_INDENT`                                                     | 13        | wcięcie w fazie 13                                                       |
| kontrakt `subtreeAxes` ↔ reguły silników poza `:root`                           | 12        | pole `subtreeAxes` powstaje w fazie 12                                   |
| kontrakt tonów (każdy ton w 3 przepisach, ton `surface` bez `border*`)          | 13        | ton w fazie 13                                                           |
| kontrakt F19 (sekcja `/screens/edges` dla każdego komponentu)                   | 11        | ekran powstaje w fazie 11                                                |

**Kontrola:** `bunx vitest run --maxWorkers=6 packages/tessera/test/guards packages/tessera/src/eslint` i pełne bramki.

**Gate:** każdy `bad/` oblewa z oczekiwaną regułą, każdy `good/` przechodzi; obecny kod przechodzi wszystkie reguły z „Włączenie” = 10 (lista wyżej); bramki zielone. Gate każdej późniejszej fazy obejmuje włączenie pozycji z jej numerem.

### Faza 11: scena skrajności (szkielet)

**Cel:** harness skrajności na obecnym kodzie, zanim cokolwiek się zmieni.

**Działania:**

1. `/screens/edges`: po jednej sekcji `data-edge-component="<nazwa>"` na każdy z 7 komponentów (treść: 1 znak, długi tekst, sama ikona; kontener `w-80` = 320 px i pełny), sekcje fundamentu: siatka xs–xl × none–full, stany, pasek `xs`/`compact`/`none` z menu i tooltipem, poddrzewo `data-motion="off"`, grupa `dir="rtl"`, 8 grup ToggleGroup + menu.

2. `tests/helpers.ts`: kontekst D46 i licznik warstw CDP (`LayerTree.enable`, `layerTreeDidChange`, `DOM.describeNode` po `backendNodeId`: liczba i suma pól × DPR² × 4 B wszystkich warstw poza korzeniem, z listą węzłów).

3. `edges.spec.ts`: skrajności obecnych komponentów z fazą odpowiedzialną za każdą, która może być czerwona:

   | Skrajność                                              | Jeśli w fazie 11 zawodzi, naprawia faza                    |
   | ------------------------------------------------------ | ---------------------------------------------------------- |
   | wielokropek długiej etykiety, szerokość min = wysokość | 13 (przepisy)                                              |
   | brak poziomego przepełnienia każdej sekcji przy 320 px | 13 (D35 rozmiar popupu, D33 kontenery)                     |
   | brak poziomego przewijania strony przy 320–1920 px     | 13                                                         |
   | pigułka przy celu ± 0,5 px przy zoomie 50–200 %        | 14a (pomiar `indicator.ts`, rozmiar przez `writeInstance`) |
   | obrys 1 px widoczny przy DPR 0,5                       | 12 (`--ts-shape-stroke` w silniku `shape`)                 |

   Test, który w fazie 11 zawodzi, wchodzi z pełną asercją jako `test.fixme` z adnotacją fazy naprawy (`fixme: faza 13`); gate tej fazy wymaga zdjęcia jej `fixme` i zielonego testu. Bez osłabiania asercji i bez `skip`. Skrajności znanych luk (G1, G11, G12 i reszta) dochodzą od razu w swojej fazie. Skrajność, która zawodzi, a nie pasuje do żadnej fazy z tabeli, wraca do prowadzącego jako decyzja.

4. Strażnik F19 w `contracts.test.ts` włączony: każdy komponent ma sekcję.

**Gate:** bramki zielone.

### Faza 12: silniki i osie (bez zmian nazw czytanych przez przepisy)

**Cel:** nowe wyjścia, które są dodatkami, i zmiana osi `profile`, której wszyscy konsumenci przechodzą w tej fazie.

**Działania:**

1. Statusy bez zmian (D30 po fazie 12: jedna wartość jak akcenty), `color.css` nietknięty.
2. Nowe wyjścia: `type` (`display-*`, `measure-narrow`), `motion` (pętle), `space` (`indent`), `size` (geometria, `icon-stroke`, `@property --ts-i-*`), `shape` (`box`, `track`, `thumb`), `state` (`invalid-color`). Bez zmian obszaru trafienia, `layer-*` i `selected-fill`: te nazwy zmieniają się w fazie 13 razem z przepisami.
3. Oś `profile` → `platform` i `typeset` w jednym diffie: `lib/theme.ts` (`platform`, `typeset`, `subtreeAxes`), `type.css`, `state.css`, `theme.test.ts`, `button.spec.ts`, panel, `docs/*.md`, fixture strażnika.
4. `/foundation`: próbki nowych wyjść (geometria toru i kciuka xs–xl; pętle: obrót ikony `spin`, szkielet `pulse`, pasek nieokreślony `sweep`; pasek z `--ts-i-value` zapisanym na elemencie wypełnienia z wartością ≠ początkowej; `textarea` z `field-sizing: content`).
5. Testy: `lab.spec.ts` (geometria dla każdego rozmiaru: kciuk ≤ tor, przesunięcie kciuka = `track-inline − track-block`, szyna ≥ 2 px; pętle mają `none` przy `motion: off` i reduced motion; pasek `--ts-i-value` 0,4 ma 40 % szerokości szyny; `textarea` po 3 liniach wyższa niż pusta); `theme.test.ts` (rekord z `profile` odrzucony, `platform` i `typeset` zapisane); `budget.test.ts` (B8 z rejestrem).

**Gate:** bramki zielone; grep fazy 12 pusty; włączone pozycje strażników z numerem 12; `fixme` z adnotacją fazy 12 zdjęte; B8 ≤ 250 i zapisany w raporcie.

### Faza 13: przepisy i ich konsumenci

**Cel:** przepisy z tabeli „Przepisy” (bez D31) i każda zmiana nazwy razem ze wszystkimi konsumentami (D47).

**Działania, każda grupa jednym diffem z konsumentami:**

1. Tekst: `recipes/text.css`, import w `tessera.css`, `Text` i `Heading` + `docs/text.md`, `docs/heading.md`, sekcja `text` na `/components`, sekcje `data-edge-component="text"` i `data-edge-component="heading"` na `/screens/edges` (strażnik F19 jest włączony od fazy 11); usunięcie slotów `header`/`body` z `surface` razem z `DialogTitle`, `DialogDescription`, `PopoverTitle`, `PopoverDescription`, `docs/dialog.md`, `docs/popover.md` i testami.
2. Ton: `data-tone` w `control` (z `raised`), `row`, `surface` (tło i cień, bez obrysu); `row` `danger` → `data-tone` razem z `MenuItem` `tone`, `docs/menu.md`, `/components`, `/screens/overlays`; `Button` `tone`.
3. Stany: lista D37; `--ts-state-indicator-active*` → `--ts-state-selected-fill*` w `state.css` razem z odczytem w `recipes/indicator.css` i testami (tylko nazwa; `will-change` zostaje do 14b); `field` z błędem i `readonly`.
4. Obszar trafienia = pudełko kontrolki: `--ts-size-hit` i `control::before` znikają; `size.css` podnosi wysokość do ≥ 24 px przy `pointer: coarse`.
5. Warstwy: `layer-overlay`/`layer-modal` → `layer-popup`, nowe `layer-toast` w `depth.css` razem z regułami `surface` i testami.
6. Popup (D35), `forced-colors` (D36), kontenery (D33), fokus pola (D32, `docs/input.md`), `aria-busy` + `Button` `busy`, wcięcie `aria-level`, grubość ikony + ikony Tessery na `viewBox` 24 bez `strokeWidth`.
7. `/foundation`: macierz ton × wariant (z `raised`) × tryb dla kontrolki, wiersza i powierzchni; warianty `text`; drzewo z `aria-level` 1–12.

**Testy (`lab.spec.ts`, `edges.spec.ts`, `text.spec.ts`), każdy zawodzi przy złej implementacji:**

- ton: dla każdego tonu tło `solid` = kolor roli, tekst = `on-*`; `raised` z tonem ma cień `raised` i tekst w kolorze tonu; `danger` w `row` barwi tekst; `soft` z tonem ma nakładkę w kolorze tonu; `surface` z tonem ma `border-color` przezroczysty i tło ≠ tło poziomu;
- stany: `aria-pressed='true'` zmienia krycie `::after` kontrolki; `aria-selected='true'` daje tło wiersza; pozycja menu z `aria-checked` nie dostaje tła; `aria-invalid` i `:user-invalid` (wpisany zły e-mail, potem blur) dają obrys `invalid-color`; `readonly` nie zmienia krycia przy hover;
- fokus pola: klik w pole → obrys; klik w przycisk → brak; Tab → obrys;
- popup: okno 900×360, menu 20 pozycji: dół ≤ `innerHeight`, `scrollHeight > clientHeight`, `End` pokazuje ostatnią pozycję, pigułka stoi na niej; odstęp od pierwszej pozycji do lewej i prawej krawędzi popupu równy ± 0,5 px w menu przewijanym i nieprzewijanym (rynny D35); okno 320 px: popup ≤ szerokość okna; długi tooltip ≤ `measure-narrow`;
- `forced-colors` (Chromium): pigułka zaznaczenia `raised` i `active` ≠ tło toru, tekst wybranej opcji ≠ niewybranej, pigułka hover ma obrys > 0, wyłączone = `GrayText`, pole i tor mają obrys > 0, fokus ma `outline` ≥ 2 px;
- kontener: ta sama karta z `data-container` przy 320 i 960 px ma stopkę w kolumnie i w wierszu;
- `text`: `title` z trimem ma wysokość bloku = wysokość wersalików ± 1 px (bez trimu jest wyższa, więc test może zawieść); `label` (Inter, krój proporcjonalny) z `data-numeric`: „111” i „888” mają równą szerokość, a bez `data-numeric` różną; `Heading level={2}` renderuje `h2`;
- pętla: `aria-busy` obraca ikonę (`getAnimations()` tylko `rotate`); przy `motion: off` i reduced motion brak animacji;
- wcięcie: wiersz `aria-level='3'` jest wcięty o 2 × `indent`, `aria-level='7'` o 6 ×, `aria-level='8'` i `aria-level='12'` o 7 × `indent`;
- obszar trafienia (`elementFromPoint`, pasek kontrolek z odstępem `inset` i ToggleGroup, każdy w xs i w md, na `/screens/edges`):
  - przy myszy: punkt wewnątrz kontrolki zwraca ją; punkt 1 px poza jej krawędzią i punkt w odstępie między sąsiadami nie zwracają żadnej kontrolki;
  - przy `hasTouch`: każda widoczna kontrolka w sekcjach `/screens/edges` ma pudełko ≥ 24 × 24 px; punkt wewnątrz kontrolki 2 px od krawędzi od strony sąsiada zwraca tę kontrolkę, nie sąsiada, w obu kierunkach (lewy sąsiad i prawy sąsiad), w pasku i w ToggleGroup;
- ikona: `stroke-width` svg w slocie = `--ts-size-icon-stroke` dla każdego rozmiaru, także dla ikony z atrybutem `stroke-width="2"`;
- warstwy D42: menu otwarte z dialogu i popover otwarty z dialogu są nad dialogiem; sonda `layer-toast` (wstawiona skryptem testu, `position: fixed`) nad dialogiem; sonda `layer-tooltip` nad nią.

**Gate:** bramki zielone; grep faz 12 i 13 pusty; włączone pozycje strażników z numerem 13; `fixme` z adnotacją fazy 13 zdjęte.

### Faza 14a: lib i komponenty

**Cel:** mechanizmy `lib/` i ostatnie zmiany komponentów. Jedna jednostka dla jednego subagenta.

**Działania:**

1. `lib/instance.ts` (`writeInstance`); pigułka pisze rozmiar przez `writeInstance`, przepis `indicator` czyta `inline-size`/`block-size` z rejestru (`will-change` zostaje do 14b).
2. `lib/collection.ts` (czyste funkcje, D41) + `collection.test.ts` w vitest (orientacja, RTL, Home/End, zawijanie, wyłączone, typeahead z cyklem po tej samej literze, nazwa z `aria-label` przy samej ikonie); ToggleGroup na `collection`, `nextOption` usunięte z `single-choice.ts` w tym samym diffie.
3. `lib/scope.ts`, wrappery `Root` z rejestracją triggera (D40) w Menu, Popover, Tooltip, `TooltipBar`; `readMotion(element)` w `indicator`, `popup-flight`, `press`.
4. `MenuContent` `width`, panel na `width="trigger"`; stałe czasu D43 (`SUBMENU_FLIGHT_GRACE`, `TOOLTIP_GROUP_GRACE`, `TYPEAHEAD_RESET`).
5. Testy Playwright (DOM): zakres osi (menu z paska `xs` ma wiersze 16 px i promień 0 przy `corners: none`, także przy `defaultOpen` i sterowanym `open`; podmenu tak samo; tooltip z paska `xs` po przejściu między triggerami `TooltipBar`; menu z poddrzewa `motion: off` nie animuje pigułki); `writeInstance` (rozmiar pigułki = rozmiar celu); `width="trigger"`: popup ≥ trigger; kolekcja w `toggle-group.spec.ts` (litera wybiera opcję, RTL odwraca strzałki); B4 na `/screens/edges` (zmiana osi i otwarcie menu bez commitów komponentów poza popupem); istniejące testy pigułki bez zmian asercji.
6. Kontrakt paczki dla `components/text/*`; czas `check` zmierzony.

**Gate:** bramki zielone; grep faz 12–14a pusty; włączone pozycje strażników z numerem 14a; `fixme` z adnotacją fazy 14a zdjęte (w całym repo nie zostaje żadne `fixme`).

### Faza 14b: warstwa pigułki (D31)

**Cel:** zmiana D31 z pomiarem przed i po tym samym skryptem, bez innych zmian między pomiarami. Jedna jednostka dla jednego subagenta.

**Działania:**

1. Pomiar „przed” (skrypt z `tests/helpers.ts`, sekcja 8 grup `/screens/edges`): spoczynek, przejazd hover, otwarte menu; DPR 1 i 1,5; liczba i suma pól wszystkich warstw poza korzeniem z listą węzłów; trace pierwszej klatki (`Paint`, LoAF); zrzut wycinka tekstu pozycji w spoczynku i w połowie przejazdu. Nagrania (Playwright `recordVideo`, potem `ffmpeg` do MP4 H.264, pliki w scratchpadzie sesji, poza repo): przejazd pigułki w ToggleGroup (`spring`, `elastic`) i w menu.
2. Zmiana: usunięcie `will-change` z `recipes/indicator.css` i `lib/indicator.ts`.
3. Pomiar „po” i nagrania „po” tym samym skryptem; nagranie pętli (przycisk zajęty, szkielet, pasek nieokreślony); oba wyniki w `decisions/e2-layers.md`. Przy regresji wariant z warstwą od wejścia do grupy (decyzja lokalna D31) i trzeci pomiar.
4. B7 w `lab.spec.ts` przez CDP według nowej definicji (warstwy, które rysują i mają pole > 0; spoczynek: żadna nie należy do pigułki ani do treści nad nią; aktywna grupa + otwarte menu przy DPR 1,5 na `/screens/overlays` oraz spoczynek i otwarte menu z pętlą przy DPR 1 i 1,5 na `/screens/edges`: ≤ 12); `test.skip` w WebKit z powodem (brak CDP).
5. Commit fazy, potem `bun run check` na świeżym klonie (jak faza 6 części 1).

**Gate:** bramki zielone; grep faz 12–14b pusty; `e2-layers.md` ma „przed” i „po” z tego samego skryptu; nagrania MP4 przed i po gotowe w scratchpadzie prowadzącego; świeży klon zielony.

### Faza 15: checkpoint 3 właściciela

Kanał na telefon: prowadzący wysyła każdy plik właścicielowi narzędziem `SendUserFile` w swojej sesji; link z U24 to pełne ścieżki plików w scratchpadzie prowadzącego, wpisane w wiadomość checkpointu i w raport fazy (np. `<scratchpad>/e2-part2/pill-toggle-before.mp4`). Paczka: nagrania MP4 z fazy 14b (pigułka w ToggleGroup `spring` i `elastic` oraz w menu: przed i po zmianie warstwy; pętle) i zrzuty ekranu PNG (tony × warianty w jasnym i ciemnym, warianty tekstu, tor i kciuk xs–xl, `/screens/edges` przy 320 px, długie menu w niskim oknie, pole po kliknięciu, `forced-colors` z emulacji Chromium).

**Na telefonie (nagrania i zrzuty):**

```text
1. Nagrania pigułki przed/po: ma być ten sam ruch, bez skoku na starcie i bez mignięcia tekstu pozycji.
2. Nagranie pętli: obrót, pulsowanie i przesuw mają spokojne tempo; przy ruchu „off” (osobny zrzut) stoją.
3. Tony × warianty, jasny i ciemny: kolory czytelne; powierzchnia w tonie ma samo tło, bez ramki;
   zaznaczenie w segmentach dalej wypukłe.
4. Tekst: tytuł, opis, błąd, kbd, display mają czytelną hierarchię.
5. Tor i kciuk xs–xl: proporcje checkboxa, switcha i suwaka wyglądają jak jedna rodzina.
6. /screens/edges przy 320 px: nic nie wychodzi poza ekran, długie etykiety kończą się wielokropkiem.
7. Długie menu w niskim oknie: przewija się, odstępy po lewej i prawej równe, rogi pozycji równoległe do rogów popupu.
8. Pole po kliknięciu myszą: widoczny obrys fokusu; pole w błędzie: obrys w kolorze błędu.
9. Tryb wysokiego kontrastu (zrzut): wybrana opcja segmentu i hover w menu są widoczne.
Przekaż wynik jako: „zmień X na zrzucie/nagraniu Y” albo „OK”.
```

**Na komputerze (na żywo, gdy będziesz przy nim):**

```text
Uruchom: bun run dev → http://localhost:3000
1. /screens/edges, pasek xs: otwórz menu i tooltip; mają być tak małe jak pasek. Na ekranie dotykowym (jeśli masz)
   ten pasek ma kontrolki 24 px i stuknięcie przy krawędzi trafia w dotkniętą kontrolkę.
2. /screens/edges, 8 grup: przejedź kursorem po kilku grupach; pigułka jedzie płynnie, bez skoku na starcie.
3. /screens/edges: Ctrl + kółko od 50 do 200 %; pigułka zostaje na opcji, linie 1 px nie znikają.
4. /screens/edges: zwęż okno do ok. 320 px i poszerz; karta przechodzi ze stopką w kolumnę i z powrotem
   (oceń progi kontenera).
5. /screens/overlays: kliknij pole myszą (fokus widoczny), otwórz długie menu w niskim oknie (przewija się),
   „Delete project” w tonie danger.
6. Segmenty w panelu: litera przenosi wybór (typeahead); sprawdź, czy chcesz to zachowanie.
7. Opcjonalnie: motyw kontrastowy Windows (lewy Alt + lewy Shift + Print Screen) w WebView2/Edge:
   wybór w segmentach i hover w menu widoczne.
Przekaż wynik jako: „zmień X na ekranie Y” albo „OK”; przy drugiej rundzie tej samej rzeczy obowiązuje U33.
```

**Gate:** uwagi wprowadzone (poprawki w silnikach i przepisach) albo zapisane jako decyzja; liczby D38, progi D33 i szerokość rynien D35 zamrożone; typeahead w segmentach potwierdzony albo usunięty z ToggleGroup (moduł zostaje dla E3).

### Faza 16: recenzja, ponowny audyt luk, zamknięcie E2

**Działania:**

1. Trzech recenzentów (skill `review`): (1) silniki, strażnicy, spec; (2) `lib/`, komponenty, zachowanie wobec F15, Q2–Q10, B4, B7; (3) laboratorium, `edges.spec.ts`, paczka, dokumenty. Prowadzący osądza każdą uwagę; runda kontrolna przy uwagach poważnych (najwyżej 3–4).
2. Ponowny audyt luk tym samym pytaniem co `e2-foundation-gaps.md` (świeży recenzent, kod bez wniosków prowadzącego) → `reviews/e2-foundation-gaps-2.md`. Luka poważna dla E3 → powrót do fazy, która ją obejmuje; mniejsza → lista E3 w masterplanie.
3. Zamknięcie (dawna faza 8 części 1): krótkie potwierdzenie właściciela po poprawkach (link, lista zmian od checkpointu 3); `AGENTS.md`: pułapki E2 (model warstw zmieniony już w fazie 9); usunięcie `research/e2-facts-*` i `research/e2-foundation-2026.md`; masterplan: E2 accepted; commit i PR tylko na słowo właściciela.

**Gate:** brak uwag krytycznych i poważnych; audyt bez luk poważnych; właściciel potwierdził.

## Dodatkowi wykonawcy (część 2)

| Jednostka             | Cel                                                                  | Write scope                                                                                                                                         | Kiedy          | Integracja                   |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------- |
| D: strażnicy          | listy, fixture, ESLint i kontrakty z fazy 10 według tabel tej części | `test/guards/**`, `src/eslint/**`, `src/lib/instance.ts` (lista)                                                                                    | faza 10        | prowadzący                   |
| F: harness skrajności | konteksty D46 i licznik CDP w `tests/helpers.ts`                     | `apps/docs/tests/helpers.ts`                                                                                                                        | faza 11        | prowadzący (`edges.spec.ts`) |
| H: lib i komponenty   | faza 14a w całości (D39 zapis, D40, D41, D43 stałe, `width`)         | `src/lib/**`, `src/components/**`, `src/recipes/indicator.css` (tylko rozmiar), `apps/docs/app/panel.tsx`, `apps/docs/tests/**`, `docs/*.md` paczki | faza 14a       | prowadzący                   |
| I: warstwa pigułki    | faza 14b w całości (pomiar, zmiana, pomiar, nagrania, B7)            | `src/lib/indicator.ts`, `src/recipes/indicator.css`, `apps/docs/tests/**`, `docs/decisions/e2-layers.md`; nagrania w scratchpadzie                  | faza 14b, po H | prowadzący                   |
| R1–R3, A              | recenzja i ponowny audyt                                             | read-only + `docs/reviews/*`                                                                                                                        | faza 16        | prowadzący osądza            |

Silniki (poza kolorem), przepisy, `Text`, `Heading`, zmiany komponentów z fazy 13 i strony laboratorium pisze prowadzący. H i I nie biegną równolegle (ten sam plik `indicator.ts`, jedna ciężka rzecz naraz).

**Reguły do każdego briefu (szablon `subagent`, skille `coding` albo `review` i `workflow`):**

- zero komentarzy w kodzie, testach i fixture, także WHY; powód idzie do `docs/`;
- zero legacy: stara nazwa znika w tym samym diffie, bez aliasów, warstw zgodności i kodu migracji;
- pliki tylko przez Edit/Write (UTF-8, LF), nigdy PowerShell ani skrypty;
- zero komend git;
- budżet 6 procesów: `bunx vitest run --maxWorkers=6`, Playwright 1 worker, headless, jedna ciężka rzecz naraz; nigdy `bun run test`;
- wynik w formacie SUBAGENT-RESULT z komendami i ich wynikami.

## Strategia dowodu (część 2)

| Decyzja | Test, który zawiedzie przy złej implementacji                                                                                                                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D29     | `title` z trimem: wysokość bloku = wersaliki ± 1 px (Chromium, WebKit; bez trimu wyższa); `label` (Inter) z `data-numeric`: „111” = „888”, bez niego różne; `Heading level={2}` renderuje `h2`; typ bez `className`                                                                               |
| D30     | tło `solid` każdego tonu = rola; `raised` z tonem zachowuje cień; `surface` z tonem bez obrysu (test i contracts); każdy ton ma regułę w 3 przepisach                                                                                                                                             |
| D31     | CDP (wszystkie warstwy poza korzeniem, z treścią nad pigułką): w spoczynku żadna nie należy do pigułki; testy kompozytora pigułki bez zmian; `e2-layers.md` przed/po z jednego skryptu w 14b                                                                                                      |
| D32     | klik w pole → `outline-width` > 0; klik w przycisk → 0                                                                                                                                                                                                                                            |
| D33     | stopka w kolumnie przy 320 px i w wierszu przy 960 px; `bad/` z progiem 500 px oblewa; brak `profile` w repo (contracts osi)                                                                                                                                                                      |
| D34     | `getAnimations()` pętli ma tylko `rotate`/`translate`/`opacity`; przy `off` i reduced motion pusta; `bad/` z `@keyframes` zawierającym `width` i z `@starting-style` w przepisie oblewa                                                                                                           |
| D35     | menu w oknie 900×360 mieści się i przewija; odstępy lewy i prawy równe w menu przewijanym; tooltip ≤ miara; `bad/` z nieznaną zmienną dostawcy oblewa                                                                                                                                             |
| D36     | asercje `forced-colors` z fazy 13 (Chromium)                                                                                                                                                                                                                                                      |
| D37     | `aria-pressed`, `aria-selected`, `aria-invalid`, `:user-invalid`, `readonly`; pozycja z `aria-checked` bez tła                                                                                                                                                                                    |
| D38     | geometria per rozmiar; przy dotyku każda kontrolka w sekcjach `/screens/edges` ma pudełko ≥ 24 × 24 px; `elementFromPoint`: stuknięcie 2 px od krawędzi od strony sąsiada trafia w dotkniętą kontrolkę w obu kierunkach, xs i md, w pasku i w ToggleGroup; przy myszy obszar = pudełko            |
| D39     | `bad/` ze `style={{ color }}` i z kluczem spoza rejestru oblewa; contracts: `@property` = `INSTANCE_KEYS`, `writeInstance` z pomiarem tylko w plikach Q7; pasek `--ts-i-value` 0,4 = 40 %; wcięcie `aria-level` 3, 7, 8 i 12                                                                      |
| D40     | menu, podmenu i tooltip z paska `xs` mają rozmiar `xs`, także przy `defaultOpen`, sterowanym `open` i zmianie triggera `TooltipBar`; poddrzewo `motion: off` bez animacji pigułki; B4                                                                                                             |
| D41     | vitest kolekcji jako czystych funkcji (RTL, typeahead, nazwa z `aria-label`, wyłączone, zawijanie); Playwright: litera i RTL w ToggleGroup                                                                                                                                                        |
| D42     | `elementFromPoint`: menu i popover z dialogu nad dialogiem, sonda `layer-toast` nad dialogiem, sonda `layer-tooltip` nad nią                                                                                                                                                                      |
| D43     | `bad/` ze `strokeWidth`, z liczbą `150` w wartości atrybutu TSX i z `const GRACE = 150` w komponencie oblewa, `good/` z unią literałów w typie przechodzi; `stroke-width` z silnika także przy atrybucie ikony; contracts: lista stałych czasu                                                    |
| D44     | próbka `textarea` rośnie z treścią bez JS (wysokość po 3 liniach > wysokość pustej)                                                                                                                                                                                                               |
| D45     | decyzja dokumentu (O7), bez testu: WebKit Playwrighta jest powyżej progu                                                                                                                                                                                                                          |
| D46     | `edges.spec.ts`: pigułka przy celu ± 0,5 px przy zoomie 50–200 %, obrys 1 px widoczny przy DPR 0,5, 320–1920 px bez poziomego przewijania, każda sekcja `data-edge-component` bez przepełnienia przy 320 px, tryb jasny i ciemny, dotyk, kontrast, reduced motion, `forced-colors`; contracts F19 |
| D47     | grep starych nazw w gate każdej fazy                                                                                                                                                                                                                                                              |

**Regresja:** wszystkie testy części 1 (lab, button, menu, toggle-group, tooltip, strażnicy, paczka) bez osłabiania asercji; zmiany nazw przenoszą asercje na nowe nazwy w tym samym diffie.

**Wpływ na budżety:** B1: pętle są ruchem kompozytora, testy trace obejmują `/screens/edges`; B2, B3, B5, B6 bez zmian zakresu (E3); B4: test na `/screens/edges` (także wrappery `Root`); B7: nowa definicja (warstwy poza korzeniem, które rysują i mają pole > 0, CDP, tylko Chromium), pigułka i treść nad nią bez warstwy w spoczynku; B8: 146 z 250 po fazie 13.

## Ryzyka i reakcje (część 2)

| Ryzyko                                                                                    | Rozpoznanie                                   | Reakcja                                                                                   |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| WebView2 inaczej niż Chromium w `forced-colors` (np. przezroczyste tło, nadpisane krycie) | testy D36 przechodzą tylko w emulacji         | checkpoint 3 w motywie kontrastowym Windows; poprawka w przepisie; wynik w `structure.md` |
| Brak stałej warstwy daje skok na starcie sprężyny                                         | pomiar „po” (`Paint`, LoAF) albo checkpoint 3 | wariant „warstwa od wejścia do grupy” (D31); bez powrotu do stałej warstwy                |
| Ref popupu przychodzi przed refem triggera przy `defaultOpen`                             | preflight fazy 9                              | `inheritScope` w efekcie układu popupu (decyzja lokalna D40)                              |
| Rynny `both-edges` poszerzają każde menu i dialog przy klasycznych paskach Windows        | test symetrii, checkpoint 3                   | szerokość ocenia właściciel; inna droga do symetrii = nowa decyzja                        |
| Białe listy strażnika otwierają furtki                                                    | fixture `bad/`, recenzja R1                   | zawężenie listy, nie wyjątek per plik                                                     |
| `text-box` trim zmienia rytm dialogu i popovera                                           | checkpoint 3                                  | stopnie i odstępy w silniku, nie w komponencie                                            |
| Czas `check` rośnie przez `/screens/edges`                                                | pomiar fazy 14a                               | jeden kontekst na przypadek, jeden `evaluate`; przy > 50 % decyzja właściciela            |
| Zmiany nazw zostawiają ślady                                                              | grep starych nazw w gate każdej fazy (D47)    | poprawka w tym samym diffie                                                               |

## Definition of Done (część 2)

- [ ] warunki końcowe części 2 spełnione, z wynikami komend w raporcie;
- [ ] `decisions/e2-layers.md` z pomiarem przed i po z jednego skryptu; nagrania MP4 przed i po;
- [ ] checkpoint 3 wykonany, uwagi wprowadzone;
- [ ] recenzja i ponowny audyt bez uwag poważnych;
- [ ] spec, `structure.md`, masterplan, `AGENTS.md` zgodne z kodem; grep starych nazw z „Forbidden” pusty.

## Kontrakt wyniku (część 2)

```text
status; link i instrukcja; ścieżki nagrań MP4 i zrzutów; drzewo zmian; komendy i wyniki; B7 i B8 w liczbach;
e2-layers.md (przed/po); wynik preflightu (rejestracja triggera przy defaultOpen i sterowanym open);
uwagi właściciela i co z nimi zrobiono; odchylenia (w tym D35: 3 zmienne dostawcy zamiast 5; D42: overlay
i modal w jednej warstwie); odkrycia; ograniczenia; branch/commit; następny krok (E3: scena „stress”,
pytanie o wejście toastu, potem rundy komponentów)
```

## Streszczenie dla właściciela

01. Przed 30 rodzinami komponentów łatamy fundament z audytu: 9 faz (9–16, faza 14 w dwóch częściach), bez komponentów E3.
02. Nowe: przepis `text` i komponenty `Text`, `Heading`; ton koloru (`danger`, `success` …) obok wariantu; statusy jak akcenty, jedna żywa wartość w obu trybach.
03. Menu w niskim oknie się przewija, z równymi odstępami po bokach; długi tooltip się łamie; menu z małego paska jest małe.
04. Geometria checkboxa, switcha i suwaka liczona z rozmiaru; pętle (spinner, szkielet) stają przy ruchu „off”.
05. Na dotyku kontrolki mają co najmniej 24 px, a obszar stuknięcia nie wchodzi na sąsiada; myszą klikasz w samą kontrolkę, jak dziś (xs myszą nie spełnia normy WCAG: to koszt gęstego trybu).
06. Nowy ekran `/screens/edges`: 1 znak, długi tekst, 320 px, zoom, dotyk, kontrast, jasny i ciemny, każdy przypadek z testem.
07. Toast i jego wejście zostają na E3; wtedy zapytam, czy może wjeżdżać od krawędzi (W16 bez zmian).
08. Zmieniam Twoje reguły, potwierdź albo odrzuć: W9 – pole w błędzie i pole w trybie wysokiego kontrastu dostają obrys.
09. W14 – pigułka nie jest już stałą warstwą GPU (mierzę przed i po, dostaniesz nagrania MP4); powierzchnia w tonie bez ramki.
10. Nowe O7 – minimum Safari/WKWebView 26.2 (starsze macOS bez Tessery).
11. ToggleGroup – wpisanie litery przenosi wybór na opcję na tę literę (typeahead).
12. Oś `profile` dzielę na `platform` (kursor) i `typeset` (kroje); popup i okno modalne w jednej warstwie (kolejność z DOM).
13. Ocena: nagrania i zrzuty dostaniesz plikami na telefon, potem kroki na komputerze (faza 15); na końcu recenzja i ponowny audyt luk.

## Rozstrzygnięcia recenzji rundy 2

Recenzje: `reviews/e2-plan-part2-scope.md` (6/10) i `reviews/e2-plan-part2-tech.md` (7/10); rozstrzygnięcia prowadzącego.

| Uwaga                                               | Co zrobiono                                                                                                                                                                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zakres P1 (toast i W16)                             | wariant i wejście toastu usunięte z D34, przepisów, faz, checkpointu i streszczenia; zostaje `layer-toast` (D42); „Deferred”: pytanie do właściciela przy Toast (E3); `@starting-style` w przepisie na liście zakazanej z fixture `bad/`              |
| zakres P2, tech M11 (zmiany nazw między fazami)     | D47: zmiana nazwy z wszystkimi konsumentami w jednej fazie; faza 12 bez nazw czytanych przez przepisy; faza 13 = przepisy i konsumenci (`hit`, `layer-*`, `indicator-active*`, sloty `header`/`body`, `danger`); grep starych nazw w gate każdej fazy |
| zakres P3 (tabela spec)                             | dopisane U9, F7, W9, S1, „Zakres” spec i B7; rozbite U10, W6/W7, W19/W21, F10/F12, F16–F19; masterplan „Cel końcowy”: sześć przepisów, pięć ekranów                                                                                                   |
| zakres P4 (checkpoint 3)                            | nagrania MP4 przed i po (pigułka bez stałej warstwy, pętle) i zrzuty na telefon; osobne kroki na komputerze; przy każdym punkcie „ma być”                                                                                                             |
| zakres P5 (obrys powierzchni z tonem)               | D30: powierzchnia z tonem = tło i cień, bez obrysu i `tint-border`; contracts i test                                                                                                                                                                  |
| zakres P6, tech P2 (streszczenie, obszar trafienia) | streszczenie wymienia W9, W14, O7, typeahead, warstwę popupu; p. 5 opisuje obszar tylko na dotyku                                                                                                                                                     |
| zakres M1 (D8)                                      | D8 bez zdania o stałej warstwie, odsyłacz do D31                                                                                                                                                                                                      |
| zakres M2 (`raised`)                                | D37: pigułka zaznaczenia domyślnie `raised`; wyjście `selected-fill` (płaskie wypełnienie); D30 i macierz z `raised`; `forced-colors` dla `raised`                                                                                                    |
| zakres M3, tech M5 (`level` w `Heading`)            | D43: zakaz literałów wyglądu, reguła pomija pozycje typów; `level` = semantyka; fixture `good/`                                                                                                                                                       |
| zakres M4 (strażnik F19)                            | sekcje `data-edge-component`, contracts wymaga sekcji dla każdego komponentu, `edges.spec.ts` sprawdza każdą przy 320 px                                                                                                                              |
| zakres M5, tech P1 (pomiar D31)                     | pomiar tylko w fazie 14b, tuż przed i tuż po zmianie, tym samym skryptem; faza 11 bez pomiaru                                                                                                                                                         |
| zakres M6 (odłożone, `tabular-nums`)                | jeden termin dla RTL i `direction.tsx`; strażnik `tabular-nums` odrzucony z powodem (zastępuje go `data-numeric` z testem); „Odłożone” w spec z kolumnami „kiedy” i „powód”                                                                           |
| zakres M7 (warianty bez konsumenta)                 | `skeleton` i `textarea` jako próbki `/foundation`, warianty z komponentami E3/E4; `kbd` zostaje jako typografia (D29)                                                                                                                                 |
| zakres M8 (typeahead)                               | rozstrzygnięcie prowadzącego: zostaje w ToggleGroup; pozycja do potwierdzenia przez właściciela (streszczenie, checkpoint 3, gate fazy 15)                                                                                                            |
| zakres M9 (`AGENTS.md`)                             | model warstw w fazie 9, pułapki w fazie 16                                                                                                                                                                                                            |
| zakres M10, tech M10 (symetria rynny)               | popup i dialog: `scrollbar-gutter: stable both-edges` + `scrollbar-width: thin`; test równych odstępów; szerokość w checkpoincie 3                                                                                                                    |
| zakres M11                                          | gate każdej fazy z grepem (D47)                                                                                                                                                                                                                       |
| zakres S1 (`Text` jako etykieta)                    | D29: Label w E3 = `Text` `label` `as="label"`                                                                                                                                                                                                         |
| zakres S2 (D45)                                     | strategia dowodu: decyzja dokumentu bez testu                                                                                                                                                                                                         |
| zakres S3 (gate fazy 9)                             | odhaczenie każdego wiersza tabeli zmian spec z numerem linii                                                                                                                                                                                          |
| tech P2 (obszar trafienia)                          | D38: rozszerzenie tylko przy `pointer: coarse` (44 px), mysz = pudełko z wyjątkiem odstępu WCAG 2.5.8; test `elementFromPoint` przy krawędzi, w odstępie i w torze, mysz i dotyk                                                                      |
| tech P3 (źródło triggera)                           | D40: węzeł zarejestrowany przez trigger Tessery, stały obiekt referencji w kontekście `Root → Popup` (bez wartości osi, zgodne z „Forbidden”); `TooltipBar` kopiuje osie przy zmianie triggera; preflight i testy z `defaultOpen` i sterowanym `open` |
| tech M1 (zoom)                                      | asercja wysokości w px CSS usunięta; obrys 1 px przy DPR 0,5, pigułka ± 0,5 px, brak poziomego przewijania                                                                                                                                            |
| tech M2 (`tabular-nums`)                            | test na `label` (Inter) z i bez `data-numeric`                                                                                                                                                                                                        |
| tech M3 (vitest bez DOM)                            | `collection` jako czyste funkcje w vitest; `scope` i `writeInstance` w Playwright                                                                                                                                                                     |
| tech M4 (`tabIndex`, ikony)                         | `collection` nie pisze `tabIndex` ani fokusu; nazwa z `aria-label` albo tekstu                                                                                                                                                                        |
| tech M6 (`inherits: false`)                         | klucz pisany na elemencie, który go czyta; test paska 0,4                                                                                                                                                                                             |
| tech M7 (definicja B7)                              | wszystkie warstwy poza korzeniem z przypisaniem po `backendNodeId` i geometrii rodzica; WebKit `test.skip` z powodem w `structure.md`                                                                                                                 |
| tech M8 (test warstwy toastu)                       | sonda `fixed` z `layer-toast` wstawiana skryptem testu przy otwartym dialogu, sonda tooltipa nad nią                                                                                                                                                  |
| tech M9 (stopka dialogu)                            | D33: dialog nie jest kontenerem, stopka reaguje na szerokość okna (zamierzone); karta z `data-container` na własną                                                                                                                                    |
| tech S1 (faza 14)                                   | podział na 14a (lib i komponenty, jednostka H) i 14b (D31, jednostka I)                                                                                                                                                                               |
| tech S2 (preflight)                                 | emulacje, `text-box`, `field-sizing`, kontener na `<body>` przepisane z sond; preflight tylko dla D40                                                                                                                                                 |
| tech S3 (`writeInstance` a Q7)                      | wartości z pomiaru DOM tylko w plikach z listy Q7; contracts                                                                                                                                                                                          |
| tech S4 (antyaliasing)                              | zrzut wycinka tekstu w pomiarze 14b i punkt w checkpoincie 3                                                                                                                                                                                          |

## Rozstrzygnięcia recenzji rundy 3

Recenzja: `reviews/e2-plan-part2-round-2.md` (8/10); rozstrzygnięcia prowadzącego.

| Uwaga                                            | Co zrobiono                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-P1 (strażnicy w fazie 10 oblewają obecny kod) | faza 10 pisze kod reguł i fixture dla wszystkich pozycji, a włączenie na kodzie produktu ma tabelę „Włączenie” z fazą przy każdej pozycji (10 tylko dla pozwoleń i zakazów, które obecny kod spełnia; `VENDOR_VARIABLES`, `KEYBOARD_FOCUS`, `ARIA_LEVEL_INDENT`, atrybuty SVG, tony, progi w 13; `subtreeAxes` i rejestr w 12; literały, stałe czasu i `writeInstance` w 14a; F19 w 11); gate fazy 10 wymienia tę listę; reguła literałów obejmuje też inicjatory stałych          |
| R2-P2 (dotyk: sąsiad przejmuje stuknięcie)       | D38: przy `pointer: coarse` silnik `size` podnosi wysokość do ≥ 24 px (środki sąsiadów ≥ 24 px), rozszerzenie najwyżej połowa `--ts-space-inset`, 0 w osi inline toru; dwa wyjścia `hit-inset-block`/`-inline` liczone w silniku; uczciwe uzasadnienie WCAG 2.5.8 i znane ograniczenie xs/sm przy myszy; test stuknięcia 2 px od krawędzi od strony sąsiada w obu kierunkach, xs i md, pasek i ToggleGroup; zmiana W1 w tabeli spec i w streszczeniu                               |
| R2-M1 (grep)                                     | jedna komenda `git grep -nE --untracked` z zakresem `packages/tessera/{src,test,docs,scripts}`, `apps/docs/{app,tests}`, spec, `structure.md`, `AGENTS.md` (bez `dist/`, `out/` i `docs/{plans,reviews,research,session-logs}`); poprawne wzorce per faza (m.in. odczyt `var(--ts-size-hit)` obok deklaracji, `data-slot` w CSS z apostrofem i w TSX z cudzysłowem, `data-profile`, `profile:`; lista w nagłówku planu wykonania); gate każdej fazy obejmuje wzorce wcześniejszych |
| R2-M2 (`aria-level` > 8)                         | D39: reguła bazowa `[aria-level]` = 7, lista 1–7 ją nadpisuje; test poziomów 3, 7, 8 i 12; drzewo próbki 1–12                                                                                                                                                                                                                                                                                                                                                                      |
| R2-M3 (WCAG dla xs)                              | D38: przy myszy xs i sm nie spełniają 2.5.8 ani wyjątku odstępu, zapisane jako znane ograniczenie gęstego trybu                                                                                                                                                                                                                                                                                                                                                                    |
| R2-M4 (F19 a `Text`/`Heading`)                   | jednostka F19 = plik `components/**/<nazwa>.tsx` (jak F12); faza 13 dodaje sekcje `text` i `heading` na `/screens/edges`                                                                                                                                                                                                                                                                                                                                                           |
| R2-M5 (testy fazy 11)                            | tabela skrajności fazy 11 z fazą naprawy; test czerwony w fazie 11 wchodzi jako `test.fixme` z adnotacją fazy, gate tej fazy wymaga jego zdjęcia; po 14a żadnego `fixme`                                                                                                                                                                                                                                                                                                           |
| R2-M6 (kanał na telefon)                         | prowadzący wysyła MP4 i PNG przez `SendUserFile` w swojej sesji; link U24 = pełne ścieżki w scratchpadzie prowadzącego w wiadomości checkpointu i w raporcie                                                                                                                                                                                                                                                                                                                       |
| R2-M7 (tekst)                                    | „D29–D47” wszędzie; wiersz Q4 mówi, że reszta Q4 zostaje; punkt 10 streszczenia rozbity na O7 i typeahead (13 linii)                                                                                                                                                                                                                                                                                                                                                               |
| R2-S1 (rogi przy rynnach)                        | punkt 7 checkpointu na telefonie: rogi pozycji równoległe do rogów popupu                                                                                                                                                                                                                                                                                                                                                                                                          |
| R2-S2 (commity w fazie 13)                       | zalecany commit po każdej grupie fazy 13                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## Rozstrzygnięcia recenzji kodu części 2

Recenzje fazy 16: `reviews/e2-code-part2-engines.md` (silniki, strażnicy, spec), `reviews/e2-code-part2-behavior.md` (`lib/`, komponenty, zachowanie) i `reviews/e2-code-part2-lab.md` (laboratorium, testy, dokumenty); rozstrzygnięcia prowadzącego. Paczka F5a = kod, F5b = testy laboratorium i dokumenty.

| Uwaga                                                                                  | Co zrobiono                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Paczka                      |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| silniki P1 (zaznaczenie przegrywa z hover i wciśnięciem, `forced-colors`)              | hover i wciśnięcie pomijają zaznaczoną kontrolkę (`:not(…)` z listą zaznaczenia D37); wciśnięty przycisk zostaje `Highlight` z `HighlightText` pod kursorem i przy wciśnięciu; test `edges.spec.ts` w zwykłym trybie i w `forced-colors`; D36 i Q19                                                                                                                                                                                                                                                               | F5a                         |
| silniki M1 (ton `surface` przez `--_border`)                                           | `toneProblems` zakazuje `border*`, `outline*`, `--_border` innego niż `transparent` i cienia `inset`, fixture `bad/`                                                                                                                                                                                                                                                                                                                                                                                              | F5a                         |
| silniki M2 (wpisy białych list bez konsumenta)                                         | `ease-in-out` i `content` zdjęte z `RECIPE_KEYWORDS`; `CLIP_SUPPORTS` przypisany do `control` (`RECIPE_SUPPORTS`), nieużyty oblewa                                                                                                                                                                                                                                                                                                                                                                                | F5a                         |
| silniki M3 (zajęty przycisk obraca `iconEnd`)                                          | obraca się tylko pierwszy slot ikony; przycisk zajęty bez ikony rysuje własny spinner; `docs/button.md`                                                                                                                                                                                                                                                                                                                                                                                                           | F5a                         |
| silniki M4 (checkbox jako koło przy `full`)                                            | `box` ma górną granicę proporcji poniżej koła; test „rounded square, never a circle”                                                                                                                                                                                                                                                                                                                                                                                                                              | F5a                         |
| silniki M5 (margines popupu w osi inline)                                              | `max-inline-size` popupu po stronie inline odejmuje `--ts-space-inset`; test podmenu w wąskim oknie                                                                                                                                                                                                                                                                                                                                                                                                               | F5a                         |
| silniki M6 (dwa znaczenia slotu `icon`)                                                | slot `icon` w menu to opakowanie `<span>`, jak w `control`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | F5a                         |
| silniki M7 (furtki ESLint)                                                             | atrybuty SVG po nazwie elementu, rozwinięcie literału obiektu sprawdzane, stała czasu dowolnej wielkości liter                                                                                                                                                                                                                                                                                                                                                                                                    | F5a                         |
| silniki M8 (`AGENTS.md`, tabela „Włączenie”)                                           | zdanie usunięte                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | F5a                         |
| zachowanie P1 (przystanek Tab w `ToggleGroup`)                                         | jeden przystanek: wybrana opcja, gdy włączona, inaczej pierwsza włączona; pierwszy wybór re-renderuje tylko dawny przystanek i nową opcję; `single-choice.test.ts`, `toggle-group.spec.ts`, `docs/toggle-group.md`                                                                                                                                                                                                                                                                                                | F5a                         |
| zachowanie M1 (`MenuSubmenu` z `defaultOpen`)                                          | stan otwarcia startuje od `defaultOpen`; test `menu.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | F5a                         |
| zachowanie M2 (przelot samotnego tooltipa)                                             | przelot tylko w `TooltipBar` (osobny `flight` na grupę), samotny tooltip otwiera się w miejscu; spec W16; test `tooltip.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                  | F5a (kod), F5b (W16)        |
| zachowanie M3 (`readMotion` nie widzi zmiany `data-motion`)                            | pamięć usunięta: odczyt przy każdym starcie ruchu; D7, D40                                                                                                                                                                                                                                                                                                                                                                                                                                                        | F5a (kod), F5b (plan)       |
| zachowanie M4 (typeahead bez modalności klawiatury)                                    | pojedynczy znak poza polem tekstowym to nawigacja klawiaturą; test obrysu po literze                                                                                                                                                                                                                                                                                                                                                                                                                              | F5a                         |
| zachowanie M5 (`docs/dialog.md`, `scale`)                                              | dokument: samo `opacity`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | F5a                         |
| zachowanie M6 (`Button`, ref bez `useMemo`)                                            | `useMemo(() => composeRefs(ref, pressable), [ref])`                                                                                                                                                                                                                                                                                                                                                                                                                                                               | F5a                         |
| laboratorium P1 (D36: obrys pola i toru przechodzi bez reguły)                         | reguła `ButtonText` pola i toru usunięta (przeglądarka wymusza obrys sama); test zostaje jako kontrakt zachowania; W9, Q19, D36                                                                                                                                                                                                                                                                                                                                                                                   | F5a (kod, spec), F5b (plan) |
| laboratorium P2 (read-only sprawdzany przed przejściem)                                | odczyt po ustaleniu wartości (`expect.poll` bez trwających animacji) i kontrola dodatnia: zwykłe pole osiąga `hover`, tylko do odczytu zostaje `rest`; oblewa po zdjęciu `[readonly]` z reguły hover                                                                                                                                                                                                                                                                                                              | F5b                         |
| laboratorium P3 (D33: test kontenera nie wykrywa `data-container`)                     | dwie karty w kontenerze 320 px przy oknie 1280 px: z `data-container` stopka w kolumnie, bez niego w wierszu; przy oknie 320 px obie w kolumnie (kontener strony); oblewa po zdjęciu `data-container`                                                                                                                                                                                                                                                                                                             | F5b                         |
| laboratorium P4 (D46: obrys 1 px i gałąź kontrastu)                                    | zrzut wycinka ukrywa tylko ramkę (`border-color: transparent`); nowy test `contrast: 'more'`: `--ts-shape-stroke` 2 px i widoczny obrys 2 px kontrolki `outline`; oba oblewają przy przezroczystym obrysie `outline`, kontrast przy zdjętej gałęzi `prefers-contrast`                                                                                                                                                                                                                                             | F5b                         |
| laboratorium M1–M9                                                                     | formatowanie `lab.spec.ts`; pasek 0,4 i kciuk liczone z wyjść silnika `size` (pasek także `inherits: false` rejestru); obszar trafienia myszą z ToggleGroup; brak poziomego przewijania przy zoomie; czekanie na hydratację w testach klawiatury (`visit`); `TYPEAHEAD_RESET` z paczki; testy propsu `tone` w `Button` i `MenuItem`, tytuł testu `Heading` zawężony; `structure.md` bez dopisków faz, pełna lista skipów WebKit, mapa testów w `AGENTS.md`; `bunx vitest run --maxWorkers=6` w `check` i pre-push | F5b                         |
| laboratorium S1 (przewijanie wszystkich stron)                                         | test braku poziomego przewijania przy 320, 768, 1280 i 1920 px dla `/`, `/foundation`, `/components`, `/screens/overlays`, `/screens/edges`                                                                                                                                                                                                                                                                                                                                                                       | F5b                         |
| laboratorium: symetria rynien D35, `width="trigger"` (kontrole niewykonane w recenzji) | sonda: headless Chromium rysuje klasyczny pasek (dwie rynny po 10 px), więc test równych rynien rozróżnia (oblewa przy samym `stable`) bez zmiany argumentów przeglądarki; asercja „rynny > 0” w Chromium; headless WebKit ma pasek o szerokości 0 (zapisane w `structure.md`). Menu panelu bez reguły ma 111–131 px przy triggerze 228–232 px, więc test `width="trigger"` oblewa po zdjęciu `min-inline-size`                                                                                                   | F5b                         |
| laboratorium S2 (zbędny skip `forced-colors` przy przepełnieniu sekcji)                | pominięte: skip zostaje, bo w WebKit test i tak mierzy tylko układ, a decyzja nie zmienia wyniku                                                                                                                                                                                                                                                                                                                                                                                                                  | —                           |
| laboratorium S3 (`frameOf` z `offsetX/offsetY`)                                        | pominięte: sonda recenzji potwierdziła, że Chromium daje 0, a klasyfikacja „over pill” działa                                                                                                                                                                                                                                                                                                                                                                                                                     | —                           |
| silniki S1 (separator i obrys popupu półprzezroczyste w `forced-colors`)               | pominięte w kodzie: ocena w motywie kontrastowym Windows (checkpoint 3, punkt 7 na komputerze)                                                                                                                                                                                                                                                                                                                                                                                                                    | —                           |
| silniki S2 (`forced-color-adjust: none` bez strażnika)                                 | pominięte: żaden przepis produktu go nie używa; pierwsze użycie dostanie pozwolenie tylko w bloku `forced-colors`                                                                                                                                                                                                                                                                                                                                                                                                 | —                           |
| silniki S3 (komentarze CSS bez strażnika)                                              | pominięte: zasada „zero komentarzy” pilnowana w recenzji; strażnik do decyzji właściciela (propozycja)                                                                                                                                                                                                                                                                                                                                                                                                            | —                           |
| silniki S4 (pierwsza klatka wybranej opcji w `forced-colors`)                          | pominięte: do sprawdzenia w motywie kontrastowym Windows przy checkpoincie                                                                                                                                                                                                                                                                                                                                                                                                                                        | —                           |
| silniki S5, S6 (fokus a cień, przycinanie poświaty w popupie)                          | pominięte: decyzje wyglądu właściciela, poza zakresem części 2                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                           |
| zachowanie S1 (kilka triggerów jednego `Root`)                                         | pominięte: brak konsumenta w E2; `createScopeTriggers` przy pierwszym                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                           |
| zachowanie S2 (`createContext` w `lib/scope.ts` bez `'use client'`)                    | pominięte: importują go tylko moduły klienta                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                           |
| zachowanie S3 (`popup-flight`: pusty prostokąt, odłączony Positioner)                  | pominięte: bez objawu w E2, wraca przy menubarze (E4)                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                           |
| zachowanie S4 (`inheritScope` zdejmuje jawny atrybut osi)                              | pominięte: do decyzji przy pierwszym konsumencie jawnej osi popupu (E3)                                                                                                                                                                                                                                                                                                                                                                                                                                           | —                           |
| zachowanie S5 (pusty `content` tooltipa)                                               | pominięte: typ `content` do rozstrzygnięcia w E3                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                           |
