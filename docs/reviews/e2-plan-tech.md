---
kind: review
status: fail
reviewed-state: docs/plans/e2-foundation.md (draft, 2026-10-31), worktree .worktrees/e2, branch feat/e2-foundation @ 378bcee
date: 2026-10-31
---

# Review: wykonalność mechanizmów planu E2 (recenzja techniczna)

## Zakres

- przedmiot: mechanizmy techniczne planu `docs/plans/e2-foundation.md`: Base UI 1.9.0, `corner-shape`, promień sposobem B, zmiany strażnika `css-layers.ts`, sliding na WAAPI, testy Playwright, Tailwind v4 w Next 16, B8 i nazewnictwo wyjść.
- baseline: `378bcee` (pliki czytane z worktree), Base UI 1.9.0 z cache bun (`~/.bun/install/cache/@base-ui/react@1.9.0@@@1`, zawiera `docs/react/**`), Tailwind 4.3.3 z `packages/tessera/node_modules`, Playwright 1.63 z `MangaShift/tessera/apps/gallery` (Chromium 153, WebKit 26.6).
- authority: `docs/specification.md` (Q1–Q18, B1–B8, U14–U18, F2, F6, F15, W3, W14, W20, N8), decyzje E0/E1.
- ryzyka: mechanizm, który nie działa albo działa tylko w teście; test, który przechodzi niezależnie od wyniku; strażnik z furtką.
- poza review: trafność wartości wyglądu, wybór palety, kolejność faz i podział na wykonawców (to recenzja planu od strony spec).

## Werdykt

**Status:** FAIL (do poprawy w planie przed fazą 1; rdzeń mechanizmów jest wykonalny).

**Najważniejszy powód:** trzy kontrole dowodowe planu przechodziłyby bez względu na wynik (test squircle w WebKit, licznik B8 w `dist/styles`, B4 przez Profiler w buildzie produkcyjnym). Do tego plan nie wymienia zmian w strażniku, buildzie i regułach ESLint, bez których fazy 1–3 nie ruszą. Sam sposób B, sliding na WAAPI z klatkami, trace B1 headless i rozwiązywanie CSS z `dist` działają, co sprawdziłem eksperymentami.

Etykiety dowodu: **DIRECT** (sam sprawdziłem kod albo eksperyment), **REPORTED** (dokument lub źródło trzecie), **ASSUMED** (wniosek bez potwierdzenia).

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Test squircle w WebKit nie sprawdza wersji zapasowej, bo Playwright WebKit wspiera `corner-shape`

- miejsce: D5 (l. 105), D15 (l. 115), strategia dowodu „squircle ma wersję zapasową … WebKit nie ma `corner-shape`” (l. 549), faza 3 pkt 7 (l. 445).
- dowód: DIRECT, eksperyment `scratchpad/rev-tech/probe.mjs` i `flag.mjs`. W Playwright WebKit 26.6 (UA `Version/26.6`) `CSS.supports('corner-shape','superellipse(2)') === true`, `squircle` też `true`, a `getComputedStyle(...).cornerShape === 'superellipse(2)'`; reguła w `@supports` działa (promień 12,8 px = 8 × 1,6). REPORTED: caniuse (dostęp 31.10.2026) podaje dla Safari stabilnego 3.1–27.2 „nie wspiera”, wsparcie tylko w Technology Preview. Chromium 139+, Edge 139+, Firefox 162+ wspierają. Silnik Playwright to więc nie Safari stabilne. Ta sama uwaga dotyczy zapisu E0 „WebKit 26.6 (Safari/macOS)”: to build Playwrighta na Windows z UA Maca.
- wpływ: kontrola Q16 i W3 przechodzi na gałęzi `superellipse`, a gałąź `round` (jedyna, którą dostanie użytkownik Safari) nie jest wykonywana nigdzie. Próba wyłączenia funkcji flagą Chromium (`--disable-blink-features=CornerShape|CSSCornerShape|CSSSuperellipse|BorderShape`) nie zadziałała (`supports` dalej `true`).
- minimalna reakcja: w strategii dowodu zamienić „WebKit” na jawny test gałęzi zapasowej, np. strona próbki ładowana z arkuszem bez bloku `@supports` (albo z warunkiem podmienionym na nieistniejącą wartość) i oczekiwane promienie × 1. Poprawić opis środowiska w E0 i D15.

#### P2. `dist` nie dostanie CSS silników, przepisów ani komponentów, a test B8 liczy w złym miejscu

- miejsce: drzewo docelowe (l. 343–361, brak `tsdown.config.ts`), strategia „B8 … liczy `--<silnik>-*` w `dist/styles`” (l. 550).
- dowód: DIRECT, `packages/tessera/tsdown.config.ts:15`: `copy: [{ from: 'src/styles/**/*.css', to: 'dist/styles' }]`. Kopiowany jest tylko `src/styles`, a `tessera.css` ma importować `../engines/*`, `../recipes/*`, `../components/*` (`css-layers.ts:53, 203-207`).
- wpływ: `next build` laboratorium nie rozwiąże importów warstw z `dist`. Jeśli kopia trafi do `dist/engines`, test B8 liczący w `dist/styles` znajdzie 0 zmiennych i przejdzie zawsze. CSS komponentu importowany z `.tsx` dodatkowo wpada w bundler tsdown (nie sprawdziłem, co z nim zrobi; ASSUMED ryzyko).
- minimalna reakcja: dopisać `tsdown.config.ts` (MODIFY) z kopią `src/{engines,recipes,components}/**/*.css` z zachowaniem struktury; CSS komponentów importować tylko z `tessera.css`, nigdy z `.tsx`; test B8 liczy w tym samym drzewie i wymaga liczby > 0 (np. ≥ 9 silników × 1).

#### P3. Strażnik wymaga zmian, których plan nie wymienia, a jeden inwariant fazy 1 jest sprzeczny z istniejącym testem

- miejsce: „Kształt silnika” (l. 218–223), faza 1 (l. 393–399), faza 2 pkt 2 (l. 412), drzewo `styles/tailwind.css` (l. 357).
- dowód: DIRECT, `css-layers.ts`:
  - `@font-face` w `engines/type`: deklaracje deskryptorów (`font-family`, `src`, `size-adjust`, `ascent-override` …) nie zaczynają się od `--`, więc `checkEngine` zwróci „engines declare only variables” (`:197`). Dopuszczenie samej at-rule nie wystarczy; potrzebna lista deskryptorów jak `DESCRIPTORS` dla `@property` (`:52, 194-196`).
  - `checkStyles` (`:203-207`) przepuszcza tylko `@layer` i `@import` względny do `engines|recipes|components`. Import fontsource (`@import "@fontsource-variable/inter"`) jest odrzucany; istniejący test potwierdza to dla gołego specyfikatora (`css-layers.test.ts`: `['@import "tailwindcss"', 'styles hold only …']`).
  - `checkFor` (`:218`) stosuje `checkStyles` do każdego pliku w `styles/`, więc `styles/tailwind.css` z `@theme inline` (U15, D16) też zostanie odrzucony.
  - fixture `bad/recipes/control.css:19` ma `@media (hover: hover)` z oczekiwaniem „at-rule not allowed” (`css-layers.test.ts:70`), a plan wymaga tej reguły w przepisach (l. 250). Inwariant fazy 1 „każdy dotychczasowy fixture `bad/` nadal oblewa” (l. 399) jest więc niewykonalny.
- wpływ: faza 1 albo się zatrzyma, albo wykonawca doda wyjątki bez decyzji planu, czyli dokładnie furtkę, przed którą plan ostrzega w impact scan (l. 202).
- minimalna reakcja: w fazie 1 wymienić jawnie: deskryptory `@font-face` w `type`; w `checkStyles` dokładną listę dozwolonych importów spoza warstw (konkretne pakiety fontów) i osobną politykę dla `styles/tailwind.css` (tylko `@theme inline` z wartościami `var(--<silnik>-*)`); przenieść `@media (hover: hover)` z `bad/` do `good/` i zapisać to jako świadomą zmianę inwariantu.

#### P4. Strażnik przepisów zabrania każdej liczby, a przepisy z planu potrzebują `0`, `1` i `-1`

- miejsce: tabela przepisów (l. 253–259: `indicator` „widoczny lub schowany (`opacity`)”, `focus` „inset”), lokalna adaptacja „rozszerzenie białych list o słowo kluczowe” (l. 166, 594).
- dowód: DIRECT, `css-layers.ts:50, 141-154`: polityka `RECIPE` przepuszcza wyłącznie tokeny z `RECIPE_KEYWORDS` (`:38-43`), bez żadnej liczby; `padding: 0 12px` oblewa jako „literal value” (`css-layers.test.ts:58`), także przez zmienne `--_*` (`--_h: 28px`). Komponent dopuszcza `0|-1|1|100%|Nfr` (`:47`), przepis nie.
- wpływ: `opacity: 0/1` pigułki, `inset: 0`/`top: 0` elementu jazdy, wariant fokusu wewnątrz (`outline-offset` ujemny) i `z-index` nie dają się zapisać w przepisie. Zostają wyjścia silników w rodzaju „opacity-hidden: 0” (rośnie B8, rozmywa U9) albo samowolne poluzowanie strażnika, a lokalna adaptacja pozwala tylko na słowa kluczowe.
- minimalna reakcja: decyzja w planie: przepisy dopuszczają ten sam mały zbiór liczb co komponenty (`0`, `1`, `-1`, `100%`) z fixture `bad/` dla innych liczb; offset fokusu wewnątrz jako wyjście `focus` (np. `--focus-offset-inset`).

#### P5. Wyjścia pochodne liczone na `:root` nie widzą wejść ustawionych na poddrzewie

- miejsce: „Kształt silnika” (`:root, [data-<oś>=…]`, l. 213), tabela wyjść: `size` z `data-size` na poddrzewie, `shape.control` „dla bieżącego `size`” (l. 235–236), `depth` z `data-level` (l. 237).
- dowód: DIRECT, `scratchpad/rev-tech/stale.mjs`: `:root { --size-height: 28px; --shape-control: calc(var(--size-height) * 8 / 28) }`, `[data-size=lg] { --size-height: 40px }`; przycisk z `data-size="lg"` dostaje `border-radius: 8px` zamiast 11,43 px. Zmienna własna dziedziczy wartość już podstawioną w elemencie, który ją deklaruje. Z redeklaracją `[data-size] { --shape-control: … }` wynik jest poprawny (18,29 px dla 40 px ze squircle; `probe.mjs`).
- wpływ: każdy silnik, który czyta wyjście zależne od wejścia poddrzewa (`shape` od `data-size`, `depth`/`shape` od `data-surface` i `data-level`, `hit` od rozmiaru), da cicho złe wartości poza `:root`. Testy z faz 3–4 złapią to tylko, jeśli próbki ustawiają rozmiar na poddrzewie, a nie na `<html>`.
- minimalna reakcja: reguła w „Kształt silnika”: wyjście zależne od wejścia poddrzewa jest deklarowane także w selektorze tego wejścia (`:root, [data-size]` itd.); w `engines.spec.ts` przypadek „rozmiar na zagnieżdżonym elemencie” dla promienia, paddingu i `hit`.

#### P6. Wyjścia silnika `color` (`--color-*`) leżą w przestrzeni nazw Tailwinda i nadpisze je motyw konsumenta

- miejsce: tabela wyjść `color` (l. 231), U9/`ENGINE_OUTPUT` (`css-layers.ts:54`), D16 (l. 116), „materialna zmiana: zmiana nazw publicznych wyjść po checkpoincie 1” (l. 598).
- dowód: DIRECT, `scratchpad/rev-tech/tw2.mjs` (Tailwind 4.3.3, `compile` z prawdziwym `tailwindcss/index.css`): konsument z `@theme inline { --color-accent: var(--accent); --color-background: var(--background) }` i przepisem Tessery czytającym `var(--color-accent)` dostaje w wyjściu `@layer theme { :root, :host { --color-accent: var(--accent); --color-background: var(--background) } }`. Tailwind emituje zmienną motywu, bo widzi jej użycie w CSS, mimo `inline`. Przy wejściu bez `@import "tailwindcss"` (`tw.mjs`) ta sama zmienna wychodzi nawet poza warstwami. MangaShift `packages/ui/src/styles/ui.css:30-48` definiuje dokładnie `--color-background`, `--color-accent`, `--color-success`, `--color-warning`, `--color-info`, czyli nazwy z tabeli planu. Wynik zależy od kolejności importu i od tego, czy Tessera trafi do podwarstwy `theme.theme` (`@import … layer(theme)` + własne `@layer theme {}` w pliku silnika daje zagnieżdżoną warstwę, a bezpośrednie style warstwy `theme` wygrywają z jej podwarstwami).
- wpływ: konsument (F13: desktop i strona MangaShift) cicho podmienia akcent i tła Tessery, czyli łamie I3, a komentarz w `tessera.css` („kolejność importu bez znaczenia”) przestaje być prawdą. Przyszły most kolorów w `tailwind.css` (`--color-accent: var(--color-accent)`) byłby cyklem. Nazwy zamrażają się na checkpoincie 1.
- minimalna reakcja: przed checkpointem 1 rozstrzygnąć nazwę wyjść koloru poza `--color-*` (i sprawdzić resztę tabeli wobec przestrzeni Tailwinda: `--text-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--spacing-*`, `--blur-*`), dopisać test strażnika „żadne wyjście silnika nie leży w przestrzeni nazw Tailwinda” i wybrać jedną formę warstwy (albo `layer()` przy imporcie, albo `@layer theme` w pliku). To decyzja dotykająca U7/U9, więc wraca do właściciela.

#### P7. Wciśnięcie i zgniecenie przy ścianie animują `scale` tego samego `face`, co Chromium zdejmuje z kompozytora

- miejsce: D7 (l. 107), przepis `indicator` „wciśnięty (`scale` na `face`)” (l. 258), pseudokod slidingu (l. 288, 292).

- dowód: DIRECT, `scratchpad/rev-tech/trace.mjs` (trace `blink.animations`, Chromium 153 headless):

  | scenariusz                                                                          | animacje | `compositeFailed` |
  | ----------------------------------------------------------------------------------- | -------- | ----------------- |
  | przejście CSS `scale` (wciśnięcie) + WAAPI `scale` (zgniecenie) na jednym elemencie | 2        | 64, 64            |
  | dwie animacje WAAPI `scale` na jednym elemencie                                     | 2        | 64, 64            |
  | dwie animacje WAAPI `transform` na jednym elemencie                                 | 2        | 64, 64            |
  | przejście `scale` + WAAPI `transform` na jednym elemencie                           | 2        | brak              |
  | jazda (`transform`, 31 klatek z `offset`, `easing: linear`) + `face` (`scale`)      | 2        | brak              |
  | sama sprężyna w klatkach na `transform`                                             | 1        | brak              |

  Podział jazda/`face` z D7 działa, ale plan kładzie oba ruchy `face` na tej samej właściwości.

- wpływ: szybkie kliknięcie i przejazd do skrajnego elementu (wyjście wciśnięcia 200 ms trwa, pigułka dojeżdża do ściany) daje dwie animacje `scale` na `face`, czyli B1 > 0 w realnym użyciu. Scenariusze trace z fazy 6 (l. 501) tego przypadku nie zawierają.

- minimalna reakcja: rozdzielić właściwości albo elementy, np. wciśnięcie na `scale`, zgniecenie na `transform` (oba `transform-origin` wspólne, więc lepiej trzeci element pod `face`); dopisać scenariusz „wciśnij, potem jedź do ściany” do `motion-trace.spec.ts`.

#### P8. Reguły ESLint konsumenta w `apps/docs` zablokują próbki na stronach silników, a plan nie ma na nie mechanizmu

- miejsce: D16 (l. 116), impact scan „laboratorium nie ma własnego CSS poza wejściem” (l. 203), strony `/engines/[engine]` z próbkami wszystkich wyjść (l. 315, F1).
- dowód: DIRECT (odczyt kodu, nie uruchomiłem): `no-local-appearance` zgłasza każdą klasę spoza układu i każdą właściwość `style` spoza układu (`src/eslint/no-local-appearance.ts:16-26`), `no-local-css` dopuszcza tylko plik wejścia z trzema importami (`no-local-css.ts:11-23`). Próbka 45 ról koloru, cieni, promieni i stopni tekstu wymaga nałożenia wyjścia na właściwość wyglądu, a przepisy z planu nie mają wariantu „próbka”.
- wpływ: albo `bun run lint` czerwony w fazie 3, albo strony silników nie pokażą wyjść (F1, checkpoint 1).
- minimalna reakcja: nazwać mechanizm w planie: np. wewnętrzny przepis/atrybut próbki w paczce (`data-specimen` + rola), albo jawny, wąski wyjątek ESLint dla `apps/docs/app/engines/**` z powodem. Pierwsza droga zachowuje U14 i F14 bez wyjątku.

### Mniejsze

#### M1. Formuła promienia sposobem B: brak wartości poza powierzchnią, źródło `inset`, prywatność `--_*`

- miejsce: „Promień koncentryczny” (l. 243), tabela `shape` (l. 236).
- dowód: DIRECT, `probe.mjs`. Sposób B bez cyklu działa w Chromium 153 i WebKit 26.6: powierzchnie 16 / 8 / 4 px, kontrolki w nich `min(12,8; inner)` = 8 / 4 / 4 px, wrapper bez `data-surface` między poziomami nie przeszkadza. Kontrolka poza powierzchnią z `min(var(--shape-control), var(--niezdefiniowana))` dostaje **0 px** (zmienna niezdefiniowana unieważnia deklarację w czasie obliczania). Działa wartość domyślna `--shape-inner` na `:root` (np. bardzo duża), a strażnik zabrania fallbacku w `var()` przepisu. Portal: DIRECT, `floating-ui-react/components/FloatingPortal.mjs:55`, kontener zagnieżdżonego portalu = węzeł portalu rodzica (`parentPortalNode ?? document.body`), nie popup. Menu w popoverze czy dialogu nie jest więc potomkiem `[data-surface]` rodzica i dostaje głębokość 1, o ile `body` ani korzeń aplikacji nie ma `data-surface`. Strażnik: `owns()` przepuszcza każde `--_*` w każdym silniku (`css-layers.ts:176-184`), a przepisy też czytają `--_*` (`:145`), więc „prywatne `--_shape-c1..c4`” czyta każdy. v2 liczy `inset = padding + border` (`e2-facts-shape.md:127`), a plan tylko „inset”.
- wpływ: kontrolki poza powierzchnią bez promienia; rozjazd 1 px z przypadkami v2; promień i padding powierzchni mogą pochodzić z różnych zmiennych (I2).
- minimalna reakcja: `--shape-inner` domyślne na `:root`; `inset` = padding + `--shape-stroke`, a padding powierzchni w przepisie `surface` czyta tę samą zmienną, z której liczy silnik; reguła strażnika „`--_<silnik>-*` tylko w swoim silniku”; w laboratorium `data-surface` nigdy na `body` ani korzeniu układu.

#### M2. Base UI: wbudowany przelot tooltipa idzie przez `top/left`, więc `lib/popup-flight.ts` nie jest warunkowy

- miejsce: drzewo `popup-flight.ts warunkowo` (l. 85, 122, 355), faza 5 pkt 3 (l. 482), ryzyko (l. 584).
- dowód: DIRECT. Wszystkie części z planu istnieją w 1.9.0 (`menu/index.parts.d.ts`: `SubmenuRoot`, `SubmenuTrigger`, `CheckboxItem`, `GroupLabel`, `Group`, `Separator`; `tooltip`: `Provider`, `Viewport`, `createHandle`; `dialog`: `Backdrop`, `Popup`, `Title`, `Description`, `Close`). 1.9.0 to najnowsze wydanie (9.10.2026, https://base-ui.com/react/overview/releases.md, dostęp 31.10.2026). Positioner bez `Viewport` używa stylów floating-ui: `top:0; left:0; transform: translate(x,y)`, przy DPR ≥ 1,5 z `will-change: transform` (`internals/useAnchorPositioning.mjs:347-356`, `@floating-ui/react-dom@2.1.9 …mjs:204-229`). Z `Viewport` (`utils/usePopupViewport.mjs:56`) przechodzi na `top/left/right/bottom`, a dokumentacja przelotu każe animować `top/left` Positionera i `width/height` Popupu (`docs/react/components/tooltip.md:1508-1511, 1807-1838`). `Provider.timeout` = 400 ms (natychmiastowe otwarcie kolejnego), `SubmenuTrigger.delay` = 100 ms domyślnie, `CheckboxItem.closeOnClick` = `false`, `SubmenuTrigger` używa `safePolygon` (`menu/submenu-trigger/MenuSubmenuTrigger.mjs:154`).
- wpływ: przelot Base UI łamie Q2/Q3, więc własny przelot jest pewny, nie warunkowy. Animacja `transform` na Positionerze zderza się z jego `transform` inline (i tworzy dwie animacje na jednym elemencie, P7).
- minimalna reakcja: `popup-flight.ts` jako stały element planu, animacja na `Popup`, nie na `Positioner`; bez `Tooltip.Viewport`; `SubmenuTrigger delay={0}` dla „natychmiastowego podmenu”; budżet B7 uwzględnia warstwy Positionerów przy DPR ≥ 1,5 (Windows 150 %).

#### M3. `offset*` zaokrągla do pełnych pikseli

- miejsce: pseudokod slidingu „pomiar celu: `offsetLeft/Top/Width/Height`” (l. 282).
- dowód: DIRECT, `probe.mjs`: element w układzie ułamkowym: `offsetTop` 41 przy `getBoundingClientRect` 41,375; `offsetHeight` 20 przy 20,297 (Chromium i WebKit). Pomiar `offset*` jest odporny na `transform` przodka (zaleta w popupie w przelocie), łańcuch `offsetParent` w popupie Base UI kończy się na Positionerze (`position: absolute`) albo pozycjonowanym popupie.
- wpływ: pigułka do 0,5 px obok wiersza i o ułamek niższa przy ułamkowej geometrii (skalowanie 125 % w Windows, `leading` × rozmiar tekstu); próg „różnica < 0,5 px” nic nie wnosi przy wartościach całkowitych.
- minimalna reakcja: kontener pigułki zawsze pozycjonowany; albo geometria całkowita z silników (do sprawdzenia testem), albo pomiar `getBoundingClientRect` celu minus kontener podzielony przez skalę kontenera (stary kit `measureRect` w menu).

#### M4. Wzór `firm` bez dolnego ograniczenia daje ujemny czas

- miejsce: pseudokod (l. 289): `150 ms × min(2, 1 + 0,25·log2(dystans / max(rozmiar, 40)))`.
- dowód: DIRECT, v2 `components/_internal/floating-indicator.tsx:63-72`: `if (steps <= 1) return base`, czyli dolna granica 1. Dla dystansu 1 px i rozmiaru 40 wzór z planu daje 150 × (1 − 1,33) < 0; WAAPI odrzuca ujemny `duration` wyjątkiem.
- minimalna reakcja: `clamp(1, 1 + 0,25·log2(…), 2)` w pseudokodzie i test jednostkowy krótkiego dystansu.

#### M5. Zawrócenie w locie i długość sprężyny są niedookreślone

- miejsce: pseudokod (l. 287, 291), lokalna decyzja „liczba klatek 20–40” (l. 165).
- dowód: DIRECT (`trace.mjs`): druga animacja `transform` na tym samym elemencie bez anulowania pierwszej = 64. REPORTED (`e2-facts-motion.md` §1): sprężyna 420/36 dochodzi do ±1 % po ok. 235 ms, ogon do ok. 500 ms; Motion przenosi prędkość przy przerwaniu.
- wpływ: bez jawnego `cancel()` poprzedniej animacji (po odczycie widocznej pozycji) retarget zdejmuje jazdę z kompozytora; klatki liczone zawsze od zerowej prędkości dają hamowanie i ponowne przyspieszanie przy szybkim przejeździe; ucięcie ogona na 1 % daje skok o 1 % dystansu na końcu (2 px na 200 px).
- minimalna reakcja: w pseudokodzie „odczytaj pozycję, `cancel()`, nowa animacja”; czas sprężyny do progu w pikselach (np. 0,5 px), nie w procentach; klatki z prędkością początkową z poprzedniego lotu (analitycznie, nadal tylko `transform`).

#### M6. Sprężyna strony prawie nie ma przestrzału, więc „odbicie od ściany” praktycznie nie zadziała; F6 nie jest aktualizowane

- miejsce: D6 (l. 106), D7 (l. 107), faza 0 pkt 1 (l. 379).
- dowód: REPORTED (`e2-facts-motion.md:104`): przestrzał 420/36 = 0,31 % dystansu, czyli 0,3 px na 100 px. Spec F6: „Sprężyny dopiero po zniesieniu Q5”, a plan dodaje sprężynę i aktualizuje tylko W20. Klatki z `offset` i `easing: 'linear'` (słowo kluczowe, nie funkcja `linear()`) spełniają literę Q5 i idą na kompozytorze w Chromium (DIRECT, `trace.mjs`); zachowania Safari stabilnego nie sprawdziłem (ASSUMED: Core Animation obsługuje animacje z wieloma klatkami).
- wpływ: zgniecenie przy ścianie (W14, W20 „bounce”) będzie niewidoczne w trybie domyślnym; ocena właściciela na żywo tego nie wyłapie jako błędu, tylko jako „brak bounce”.
- minimalna reakcja: w fazie 0 doprecyzować F6 (sprężyna dozwolona jako klatki z `offset` w `lib/indicator`, nie jako wyjście silnika `motion`); w checkpoincie 2 jawne pytanie o odbicie przy ścianie.

#### M7. Playwright na static export potrzebuje serwera, którego plan nie wskazuje

- miejsce: D15 (l. 115), `playwright.config.ts` (l. 318).
- dowód: REPORTED (wiedza o Next: `next start` nie obsługuje `output: 'export'`); DIRECT (`apps/docs/next.config.ts`: `output: 'export'`, bez `trailingSlash`), więc `/engines/color` w `out/` to `engines/color.html`, a zasoby `/_next/*` są ścieżkami bezwzględnymi (nie działają z `file://`).
- minimalna reakcja: `webServer` w `playwright.config.ts` z małym serwerem statycznym (`Bun.serve` z mapowaniem `ścieżka → ścieżka.html`, bez nowej zależności) albo `trailingSlash: true`; w planie jedna linia z komendą.

#### M8. `getComputedStyle` na zmiennej własnej zwraca niepoliczony tekst

- miejsce: faza 3 pkt 7 (l. 439–443), D14 (l. 114).
- dowód: DIRECT, `probe.mjs`: `border-top-left-radius` z `min()`/`calc()` wraca jako px (`12.8px`, `8px`, w WebKit `18.285715px`), ale `getPropertyValue('--shape-inner')` = `max(calc(16px - 8px), 4px)`, a `--shape-control` = `calc(28px * 8 / 28)`.
- minimalna reakcja: `engines.spec.ts` mierzy wyjścia przez prawdziwe właściwości próbek (promień, wysokość, padding, kolor), a nie przez odczyt zmiennych; tolerancja ≤ 0,5 px jak w v2.

#### M9. Test B4 przez React Profiler w buildzie produkcyjnym niczego nie zliczy

- miejsce: strategia dowodu „licznik renderów komponentu” (l. 551).
- dowód: REPORTED (dokumentacja React: `<Profiler>` jest wyłączony w buildzie produkcyjnym; Next włącza go flagą `next build --profile`). Laboratorium to build produkcyjny (`output: 'export'`).
- wpływ: licznik = 0 zawsze, czyli B4 przechodzi niezależnie od kodu.
- minimalna reakcja: liczyć commity przez `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot` wstrzyknięty `addInitScript` (działa w produkcji) albo budować laboratorium testowe z `--profile`; test sprawdza, że licznik rośnie przy zmianie stanu, który re-render powinien wywołać.

#### M10. Rozjazdy planu ze spec w testach i stanach

- miejsce: D15 (l. 115), przejście koloru stanów (l. 261).
- dowód: DIRECT (spec): Q15 „każdy ekran testowy jest sprawdzany też w WebKit”, a D15 ogranicza WebKit do testu kształtu; Q13 „testy biegną na wersji skompilowanej i nieskompilowanej”, a Playwright biegnie tylko na `dist`; N8 „nakładka z animowaną `opacity` (start w E2, zgodna z Q2)”, a plan startuje od przejścia `background-color` jako wyjątku ruchu.
- minimalna reakcja: albo zmiana spec w fazie 0 z powodem (O1: lekkie testy), albo zakres testów zgodny ze spec; dla stanów start według N8 albo zapis, dlaczego E2 odstępuje.

#### M11. Biała lista warunków at-rules w silnikach jest szersza niż potrzeba i nie mówi, jak dopasować warunek

- miejsce: l. 221.
- dowód: DIRECT (plan): lista zawiera `prefers-color-scheme` (tryb `system` rozstrzyga JS w kaskadzie D12, więc drugie źródło trybu), `hover` (potrzebny w przepisach, nie w silnikach), `forced-colors` i `prefers-reduced-transparency` (bez konsumenta w E2). Dopasowanie po podciągu przepuściłoby `(prefers-reduced-motion: reduce) or (min-width: 1px)`.
- minimalna reakcja: lista tylko z konsumentem w E2 i dopasowanie całego prelude do wzorców (np. `(prefers-reduced-motion: reduce)`, `(pointer: coarse)`, `(prefers-contrast: more)`, `(corner-shape: superellipse(2))`), z fixture `bad/` dla `or`/`and`/`not`.

### Sugestie

- S1. Stałe slidingu w JS (150 ms, `cubic-bezier(0.2, 0, 0, 1)`, 420/36) dublują wyjścia silnika `motion` (I2). Skoro JS ma czytać atrybut, nie `getComputedStyle` (D6), dodać test zgodności stałych JS z `motion.css`.
- S2. E0 sprawdził koncentryczność tylko dla zwykłego łuku; dla squircle z promieniem × 1,6 (D5) różnica „R − inset” nie daje krzywej równoległej. Do oceny na checkpoincie 1 (bez zmiany mechanizmu).
- S3. Skrypt anty-FOUC zmienia atrybuty `<html>` przed hydracją: `suppressHydrationWarning` na `<html>` w `layout.tsx` (tak robi v2 przez `presetAttributes`, ASSUMED).
- S4. `@fontsource-variable/inter` `index.css` ładuje wszystkie podzbiory (cyrylica, grecki, wietnamski; DIRECT, `index.css` w cache 5.3.0); import tylko `latin` i `latin-ext` od razu, nie dopiero po pomiarze B6.

## Zgodność z kontraktem (pytania 1–8 briefu)

1. Base UI 1.9.0: pass. Części i nazwy istnieją, pozycja przez `transform` (bez `Viewport`) albo `top/left` (z `Viewport`), wbudowany przelot przez `top/left` + `width/height` (M2). DIRECT.
2. `corner-shape: superellipse(2)`: pass dla składni (= `squircle`, MDN, dostęp 31.10.2026), `@supports` działa w `@layer theme`; wsparcie: Chrome/Edge 139+, Firefox 162+, Safari stabilne brak (caniuse). Fail dla strategii testu (P1).
3. Sposób B: pass bez cyklu, także w portalu (DIRECT); fail dla kontrolki poza powierzchnią bez wartości domyślnej i dla wejść na poddrzewie (M1, P5).
4. Strażnik: `:not(` wystarczy dopisać do `ROOT_OR_CHOICE` (`css-layers.ts:58`), bo wnętrze przechodzi przez ten sam filtr (`:not(.klasa)` zostawia `.klasa` i oblewa); reszta wymaga zmian spoza listy planu (P3, P4, M1, M11).
5. Sliding: pass dla klatek z `offset` i `easing: linear` na kompozytorze oraz podziału jazda/`face` (DIRECT trace); fail dla dwóch `scale` na `face` (P7); `offset*` w popupie w portalu działa z zaokrągleniem (M3).
6. Testy: static export wymaga serwera (M7); `getComputedStyle` daje px dla `border-radius` z `min()` (DIRECT), ale nie dla zmiennych (M8); trace B1 headless wykonalny (DIRECT, `compositeFailed` z `blink.animations`).
7. Tailwind v4: `@tailwindcss/node` 4.3.3 rozwiązuje importy CSS z warunkiem `style`, więc `exports` `"default"` → `dist` (DIRECT, `conditionNames:["style"]` w `dist/index.js`); `globals.css` z trzema importami przechodzi `no-local-css` (DIRECT, odczyt `no-local-css.ts:17-23`); kolizja nazw `--color-*` (P6), próbki silników a ESLint (P8). Przepisywanie `url()` fontów przez Tailwind i HMR `dist` w Turbopacku: ASSUMED, nie uruchamiałem Next.
8. B8 i nazwy: `--<silnik>-<rola>` zgodne z `ENGINE_OUTPUT`; licznik w złym miejscu (P2); przestrzeń nazw Tailwinda (P6). Szacunek ~126 ≤ 250 wiarygodny przy obecnej tabeli.

## Wykonane kontrole

```text
node scratchpad/rev-tech/probe.mjs   (Chromium 153 headless, WebKit 26.6)
  corner-shape supports: true / true; promienie s1..s3 = 16/8/4 px, kontrolki 8/4/4 px; poza powierzchnią bez sentinela 0px
  zmienne własne: tekst niepoliczony; offsetTop 41 vs rect 41.375; offsetHeight 20 vs 20.297
node scratchpad/rev-tech/stale.mjs   data-size na poddrzewie: 8px zamiast 11.43px
node scratchpad/rev-tech/trace.mjs <scenariusz>   compositeFailed: tabela w P7
node scratchpad/rev-tech/flag.mjs    4 nazwy --disable-blink-features: corner-shape nadal wspierane
node scratchpad/rev-tech/tw.mjs, tw2.mjs   Tailwind 4.3.3: emisja --color-accent konsumenta w @layer theme
odczyt: Base UI 1.9.0 (kod i docs w paczce), css-layers.ts + test + fixtures, tsdown.config.ts, eslint/no-local-*.ts, v2 floating-indicator.tsx
WebFetch: base-ui.com releases.md, MDN corner-shape, caniuse corner-shape (31.10.2026)
```

Katalog eksperymentów: `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\rev-tech\`.

## Niewykonane lub nierozstrzygające kontrole

- Kompozycja klatek WAAPI w Safari stabilnym: brak Safari; Playwright WebKit nie mówi nic o Core Animation.
- `next build` z Tailwind i importem fontsource z `dist`: nie budowałem Next (brak zależności w repo, zakaz instalacji w repo).
- Sposób wymuszenia gałęzi zapasowej `corner-shape` w Chromium: nie znalazłem działającej flagi.
- `inherit()` i E0 sposób A: poza zakresem.

## Ograniczenia review

- Jedno polecenie git (`git log --oneline -3`, tylko odczyt) wykonałem na początku wbrew zakazowi briefu; nie zmieniło stanu repo ani wniosków.
- Wnioski o Next (serwer statyczny, Profiler) są REPORTED z wiedzy o narzędziach, nie z uruchomienia.

## Zalecany następny krok

Poprawić plan w miejscach P1–P8 (sześć z nich to dopisanie pliku albo reguły do fazy 0–1), decyzję o nazwach `--color-*` (P6) przekazać właścicielowi przed checkpointem 1, potem jedna runda kontrolna tej recenzji tylko dla zmienionych akapitów.
