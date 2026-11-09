---
kind: review
status: fail
reviewed-state: docs/plans/e2-foundation.md, część 2 (linie 648–1152), worktree .worktrees/e2 na branchu feat/e2-foundation z niezacommitowanym stanem części 1
date: 2026-10-31
---

# Review: plan E2, część 2 (fazy 9–16), oś wykonalności i dowodu

## Zakres

- przedmiot: sekcja „Część 2: fundament pod rodziny” planu `docs/plans/e2-foundation.md` (D29–D46, fazy 9–16, strategia dowodu);
- baseline: kod `packages/tessera/src/**`, `test/**`, `apps/docs/**`, Base UI 1.9.0 z `node_modules/.bun/@base-ui+react@1.9.0…`, Playwright 1.64.1 (Chromium 1248, WebKit 2370);
- authority: `AGENTS.md`, `docs/specification.md`, `docs/research/e2-foundation-2026.md`, `docs/decisions/e2-base-ui.md`;
- ryzyka: mechanizm nie działa przy tej architekturze; test nie oblewa przy złej implementacji; pomiar nie mierzy tego, co twierdzi; kolejność faz łamie zależności;
- poza review: trafność decyzji wyglądu (liczby D38, kolory D30), zgodność ze spec poza mechanizmami, styl dokumentu.

## Werdykt

**Status:** FAIL (3 uwagi poważne; każdą zamyka zmiana 1–3 zdań w planie, bez przeprojektowania).

**Najważniejszy powód:** trzy miejsca, w których plan twierdzi dowód, a go nie dostanie: pomiar D31 „przed/po” porównuje stany różniące się o trzy fazy zmian; test obszaru trafienia D38 mierzy geometrię pseudo-elementu, a nie to, czy klik trafia w kontrolkę; zakres osi D40 nie ma źródła triggera przy otwarciu sterowanym (`open`, `defaultOpen`), a preflight tego nie sprawdza.

Reszta mechanizmów jest wykonalna; sondy potwierdziły większość założeń planu (sekcja „Zgodność z kontraktem”).

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Pomiar D31 „przed” jest w złej fazie: wynik nie przypisze zmiany do D31

- miejsce / scenariusz: D31 (linia 713) mówi „Kolejność w fazie 14: najpierw pomiar przed …, potem zmiana, potem po”, a faza 11, krok 4 (linia 978) robi pomiar „przed” na kodzie sprzed faz 12–13. Faza 14, krok 3 (linia 1026) robi „po” po zmianach przepisów i komponentów.
- dowód: między fazą 11 a 14 zmieniają się rzeczy, które same zmieniają warstwy i malowanie: `control::before` dostaje obszar trafienia 24 px także przy myszy (D38; dziś `--ts-size-hit: 0px`, `engines/size.css:43-51`), `row` dostaje warstwę `::after` (D37), popup dostaje `overflow-y: auto` (D35), pigułka zmienia rozmiar przez rejestr (D39). Sonda 2 pokazała, że koszt pigułki to nie tylko jej własna warstwa: przy `will-change` w spoczynku Chromium tworzy 2 warstwy (`DIV#pill 192×24` i scaloną warstwę treści nad nią `DIV.item 200×480`), więc każda zmiana treści nad pigułką zmienia wynik.
- wpływ: `decisions/e2-layers.md` porówna dwa różne drzewa; regresja albo zysk z innej fazy zostanie przypisany D31, a reguła awaryjna („wariant z warstwą od wejścia do grupy”) może się włączyć albo nie z niewłaściwego powodu. Plan jest też wewnętrznie sprzeczny (D31 i faza 11).
- minimalna reakcja: pomiar „przed” D31 robić w fazie 14 bezpośrednio przed krokiem 3 (po krokach 1–2), tym samym skryptem co „po”. Pomiar z fazy 11 zostawić jako punkt odniesienia części 1 i tak go nazwać. Ujednolicić tekst D31 i fazy 11.

#### P2. Obszar trafienia D38: test nie wykryje, że klik nie trafia, a przy myszy obszary sąsiadów nachodzą na siebie

- miejsce / scenariusz: D38 (linia 720) daje `--ts-size-hit-inset` z celem 24 px także przy myszy, na każdej kontrolce; test fazy 13 (linia 1013) i strategia D38 (linia 1096): „środek `::before` = środek kontrolki ± 0,5 px, rozmiar ≥ 24 px”.
- dowód: (1) `recipes/control.css:34-40`: `::before` ma `position: absolute; z-index: -1`. Z ujemnym `z-index` pseudo-element maluje się w najbliższym kontekście warstwowym, pod tłami pozycjonowanych przodków bez `z-index` (np. tor `surface` grupy, który dostaje `position: relative` z `recipes/indicator.css:2-4`). Hit-testing idzie odwrotnie do kolejności malowania, więc część `::before` poza pudełkiem kontrolki może trafiać w tor albo wyspę, a nie w kontrolkę. To wniosek z reguł malowania CSS (ASSUMED, bez sondy). (2) `engines/size.css`: xs = 16 px, `--ts-size-gap` xs = 3 px; przy celu 24 px `hit-inset` = 4 px na stronę, więc w pasku xs i w ToggleGroup obszary sąsiadów nachodzą na siebie o ok. 5 px, a klik przy krawędzi przycisku A trafia w B (późniejszy w DOM). Plan odkłada ten sam problem dla wierszy (G22: „sąsiednie wiersze nachodziłyby na siebie”), ale nie dla kontrolek. (3) Test mierzy wyłącznie geometrię pseudo-elementu, więc przechodzi w obu złych przypadkach.
- wpływ: zmiana zachowania kliknięć we wszystkich gęstych paskach przy myszy (regresja względem dzisiejszego 0 px) albo obszar, który istnieje tylko na papierze; test daje fałszywy PASS.
- minimalna reakcja: test zachowania zamiast geometrii: `elementFromPoint` 2 px poza krawędzią kontrolki xs zwraca tę kontrolkę, a punkt w połowie odstępu między dwiema kontrolkami paska xs nie zwraca złej; przypadki w pasku xs i w ToggleGroup na `/screens/edges`. W projekcie: przy myszy skorzystać z wyjątku odstępu WCAG 2.5.8 (bez rozszerzania albo z `hit-inset` nie większym niż połowa odstępu) i rozszerzać do 44 px tylko przy `pointer: coarse`, albo jawnie odłożyć kontrolki w grupach razem z G22. Kolejność malowania `::before` sprawdzić tym samym testem.

#### P3. D40: brak źródła triggera przy otwarciu sterowanym; kanał od `Root` do `Popup` nieopisany

- miejsce / scenariusz: D40 (linia 722), przepływ (linie 855–863), preflight fazy 9 (b) (linia 955), decyzja lokalna (linia 775).
- dowód: `eventDetails.trigger` istnieje (`internals/createBaseUIEventDetails.d.ts:71`) i Base UI podaje go przy otwarciu kliknięciem i klawiszem Enter/Spacja (`floating-ui-react/hooks/useClick.mjs:31`), najechaniem (`useHoverReferenceInteraction.mjs:181, 309`), fokusem (`useFocus.mjs:112`), strzałką (`useListNavigation.mjs:503`), w tooltipie (`tooltip/trigger/TooltipTrigger.mjs:160`) i przez uchwyt (`utils/popups/popupHandle.mjs:203`). Przy sterowanym `open` albo `defaultOpen` `onOpenChange` w ogóle się nie wywołuje, więc trigger nie trafia do referencji i popup nie dostaje osi. Dziś `Menu = BaseMenu.Root` i `Popover = BasePopover.Root` (`menu.tsx`, `popover.tsx`), więc konsument może sterować `open`. `TooltipBar` (`tooltip.tsx:80-93`) ma jeden popup dla wielu triggerów: przy przejściu między triggerami popup zostaje zamontowany, więc ref callback z `inheritScope` nie uruchomi się ponownie. Plan nie mówi też, jak referencja z wrappera `Root` dociera do `Popup` w portalu: potrzebny jest kontekst ze stałą wartością (obiekt ref), a „Forbidden” (linia 751) zakazuje „kontekstu Reacta dla zakresu osi”, więc wykonawca może uznać to za zakaz.
- wpływ: menu albo popover otwarty programowo z paska `xs` ma rozmiar domyślny, bez sygnału błędu; preflight (b) sprawdza tylko mysz i klawiaturę, więc tego nie wykryje.
- minimalna reakcja: (1) źródło triggera = węzeł zarejestrowany przez trigger Tessery (wzór `SubmenuTriggerContext`), a `eventDetails.trigger` tylko do rozróżnienia triggerów jednego uchwytu (`TooltipBar`), nie odwrotnie; (2) zapisać, że kanał `Root → Popup` to kontekst ze stałym obiektem ref (bez zmiany wartości, B4 bez zmian) i że to nie jest „kontekst dla zakresu osi”; (3) preflight i test D40: `defaultOpen` w pasku `xs` daje wiersze 16 px.

### Mniejsze

#### M1. Test zoomu D46 „wysokości i promienie w px CSS bez zmian” nie może oblać

- miejsce: D46 (linia 728), strategia D46 (linia 1104).
- dowód: emulacja zoomu = `viewport` / z + `deviceScaleFactor` z. Px CSS nie zależą od DPR (poza zapytaniem `resolution` i zaokrąglaniem do pikseli urządzenia), więc ta asercja przejdzie przy każdej implementacji. Sonda 1: DPR 0,5 działa w Chromium i WebKit (`devicePixelRatio: 0.5`).
- wpływ: rytuał; realne ryzyka zoomu są gdzie indziej: pigułka przy ułamkowym DPR (jest w planie), obrys `--ts-shape-stroke` 1 px przy DPR 0,5 (0,5 px urządzenia może zniknąć), poziome przewijanie przy szerokim viewporcie.
- minimalna reakcja: usunąć tę asercję albo zastąpić ją sprawdzeniem widoczności obrysu przy DPR 0,5 (zrzut wycinka); zostawić pigułkę ± 0,5 px i brak poziomego przewijania.

#### M2. `kbd`: „111” = „888” przechodzi bez `tabular-nums`

- miejsce: faza 13 (linia 1010), strategia D29 (linia 1087).
- dowód: D29 daje `kbd` krój mono, a w kroju mono cyfry i tak mają równą szerokość.
- minimalna reakcja: testować `data-numeric` na wariancie z krojem proporcjonalnym (`label` w Inter), osobno.

#### M3. Vitest działa w środowisku `node`: testy `collection`, `scope`, `instance` nie mają DOM

- miejsce: faza 14, krok 1 (linia 1024), strategia D41 (linia 1099).
- dowód: `packages/tessera/vitest.config.ts:6`: `environment: 'node'`. `element.matches(':dir(rtl)')`, `closest` i `style.setProperty` nie istnieją; `theme.test.ts:119` stawia ręczne atrapy.
- minimalna reakcja: `collection` jako czysta funkcja (lista `{ label, disabled }`, indeks, klawisz, `direction`, `orientation`), test w vitest; odczyt kierunku i DOM w komponencie, test w Playwright (już jest: RTL i litera w `toggle-group.spec.ts`). `scope.ts` i `writeInstance` testować w Playwright, bez atrap DOM.

#### M4. `collection` a `tabIndex` ToggleGroup; typeahead przy samych ikonach

- miejsce: D41 (linia 723).
- dowód: `toggle-group.tsx:137`: `tabIndex` wynika ze stanu wyboru (renderuje React). „Roving `tabIndex`” w module, który pisze `tabIndex` do DOM, kłóci się z Reactem. Pozycje z samą ikoną mają tylko `aria-label`, więc `textContent` jest pusty.
- minimalna reakcja: `collection` zwraca następny element i nie pisze `tabIndex`; o miejscu tabulacji decyduje konsument. Typeahead czyta nazwę dostępną (`aria-label` albo tekst).

#### M5. Reguła „zakaz liczb w TSX” trafi w typ `Heading`

- miejsce: D43 (linia 725), D29 (`level` 1–4).
- dowód: `level: 1 | 2 | 3 | 4` to w AST `TSLiteralType` z węzłem `Literal`; reguła oparta na `Literal` (wzór `src/eslint/static-values.ts:37, 76, 94`) oznaczy 2, 3 i 4.
- minimalna reakcja: reguła pomija pozycje typów; fixture `good/` z unią literałów w typie.

#### M6. `--ts-i-value` z `inherits: false` nie dotrze do dziecka paska

- miejsce: D39 (linia 721), próbka paska w fazie 12.
- dowód: zarejestrowana właściwość bez dziedziczenia ma w dziecku wartość początkową; wypełnienie paska to zwykle dziecko korzenia.
- minimalna reakcja: zapisać, że klucz rejestru pisze się na elemencie, który go czyta (wypełnienie); test próbki z wartością ≠ początkowej.

#### M7. B7 przez CDP jest mierzalny, ale definicja „warstw pigułek” pominie połowę kosztu

- miejsce: D31, warunek B7 (linia 668), faza 14, krok 4 (linia 1027).
- dowód (sondy 1 i 2, headless Chromium): `LayerTree.layerTreeDidChange` działa, warstwy mają `backendNodeId` (mapowanie przez `DOM.describeNode` działa), rozmiary są w px CSS (192×24 przy DPR 1 i 1,5), więc wzór „pole × DPR² × 4 B” jest poprawny. Warstwa treści nad pigułką jest przypisana pierwszej pozycji (`DIV.item 200×480`), nie pigułce. W trakcie animacji WAAPI Chromium wynosi też późniejsze, nachodzące rodzeństwo (sonda 1: animowany `#b` i nachodzący `#c` jako osobne warstwy). WebKit nie ma CDP, więc B7 w WebKit nie jest mierzony.
- minimalna reakcja: B7 jako liczba i suma pól wszystkich warstw poza korzeniem (nie „warstwy, których węzeł to pigułka”); „0 warstw pigułek w spoczynku” sprawdzać obiema miarami; test B7 z `test.skip` dla WebKit i zapis tego ograniczenia w `structure.md`; w `e2-layers.md` lista węzłów warstw w trakcie przejazdu.

#### M8. Test „toast nad dialogiem” nie ma scenariusza

- miejsce: impact scan (linia 805), faza 14, krok 4, D42.
- dowód: toast w E2 to próbka `surface` `toast` na `/foundation` (w treści strony, bez portalu), a dialog jest modalny (tło poza nim nie przyjmuje kliknięć). Dopóki próbka nie jest `position: fixed` z `z-index` warstwy w kontekście `<body>`, test nie ma czego porównać.
- minimalna reakcja: zapisać scenariusz: próbka toastu `fixed`, pokazywana skryptem testu albo przyciskiem w dialogu; `elementFromPoint` w miejscu nakładania.

#### M9. Stopka dialogu nie ma kontenera

- miejsce: D33 (linia 715).
- dowód: `recipes/surface.css:118`: dialog ma `width: fit-content`, więc z `container-type: inline-size` by się zwinął (ten sam powód, który plan podaje dla popupów). Stopka dialogu zapyta więc najbliższy kontener, czyli `<body>` (`page`), i przejdzie w kolumnę według szerokości okna, nie dialogu.
- minimalna reakcja: zapisać to w D33 jako zachowanie zamierzone albo dać dialogowi szerokość niezależną od treści przed włączeniem `data-container`.

#### M10. `scrollbar-gutter: stable both-edges` na dialogu bez testu

- miejsce: D44 (linia 726).
- dowód: dialog ma `overflow: auto` i `width: fit-content` (`surface.css:111-122`); `stable` rezerwuje rynnę także bez przewijania, a `both-edges` po obu stronach. Przy klasycznych paskach (Windows, główny cel U28) każdy dialog dostaje 2 puste pasy szerokości paska; na macOS z paskami nakładanymi nic.
- minimalna reakcja: pomiar szerokości dialogu bez przewijania w Chromium (Windows) przed i po albo `scrollbar-width: thin` razem z rynną; pozycja do checkpointu 3.

#### M11. Zmiany nazw w fazie 12 wymuszają zmiany semantyki przed fazą 13

- miejsce: faza 12 (linie 984–994) a faza 13.
- dowód: `--ts-size-hit` (używane w `control.css:38-39` jako `min-width`/`min-height`) znika na rzecz `hit-inset` o innej semantyce (`inset`), a `--ts-state-indicator-active*` jest czytane w `recipes/indicator.css:27-28`. Reguła „jedna zmiana nazwy w całym repo w tej samej fazie” wciąga więc część D38 i D37 do fazy 12.
- minimalna reakcja: zapisać w fazie 12, że `control::before` (D38) i odczyt `selected` w `indicator.css` wchodzą razem ze zmianą nazw; testy D38 też w fazie 12.

### Sugestie

- S1. Faza 14 jest za duża na jeden przebieg (3 moduły `lib/`, 7 komponentów, D31 z pomiarem, ok. 8 grup testów, świeży klon). Podział: 14a (lib, komponenty, testy) i 14b (D31: pomiar przed → zmiana → pomiar po). Przy okazji zamyka to P1. Jednostki delegowane D, E, F i G mają dobry rozmiar na jednego subagenta.
- S2. Preflight fazy 9 (a) i (c) jest już rozstrzygnięty sondą 1 (niżej). Wystarczy przenieść wynik do raportu fazy; zostaje (b) z rozszerzeniem z P3.
- S3. `writeInstance` jako publiczny kanał rozmiaru z JS stoi blisko zakazu z `AGENTS.md` („Kształt i rozmiar nie przechodzą przez JS”). Dopisać kontrakt: wywołania `writeInstance` z wartościami z pomiaru DOM tylko w plikach z listy pomiaru (Q7). Wartość z propsów (`--ts-i-value`) może przychodzić z każdego miejsca.
- S4. W pomiarze „po” D31 dodać zrzut wycinka tekstu pozycji przy DPR 1 w spoczynku i w połowie przejazdu. Wyniesienie treści do warstwy (M7) może zmienić antyaliasing tekstu (N5/Q18), a kryteria `Paint` i LoAF tego nie widzą. To nie regresja względem `will-change` (dziś treść też jest wynoszona przy przejeździe), ale checkpoint 3 powinien wiedzieć, na co patrzeć.

## Zgodność z kontraktem (mechanizmy z osi przeglądu)

- `@property --ts-i-*` + zapis tylko przez `lib/` a zakaz `style` i React Compiler: wykonalne. React ustawia `--*` z obiektu `style` przez `setProperty`, kompilator tego nie dotyka, a zapis w ref callbacku i handlerach jest poza renderem. Uwagi: M6, S3; typ `style` wymaga rozszerzenia `CSSProperties` o klucze rejestru, bez rzutowania. ASSUMED dla typów, DIRECT dla `vitest.config.ts`.
- `eventDetails.trigger` w Base UI 1.9: istnieje dla Menu, Popover, Tooltip i Dialog (wspólne `BaseUIChangeEventDetails`, `createBaseUIEventDetails.d.ts:71`), wypełniany na ścieżkach interakcji (P3, DIRECT). Brak przy sterowanym otwarciu (P3).
- Zagnieżdżony portal w węźle portalu rodzica: DIRECT, `floating-ui-react/components/FloatingPortal.mjs:55` (`containerProp ?? parentPortalNode ?? document.body`). Kolejność D42 z DOM przy równym `z-index` jest więc poprawna dla menu i popovera z dialogu: `z-index` stoi na Positionerze (`surface.css:2-4`), Positioner dziecka leży w węźle portalu dialogu po jego `Popup`, w tym samym kontekście warstwowym.
- `container-type` a popupy: sonda 1, Chromium i WebKit: `<body>` z `container-type: inline-size` nie staje się blokiem zawierającym dla `position: fixed` (element `fixed; top: 0` po przewinięciu o 500 px ma `top = 0`, computed `contain: none`). Floating UI liczy blok zawierający z `contain` (`@floating-ui/utils/dist/floating-ui.utils.dom.mjs:80`), więc `page` jako kontener nie psuje pozycjonowania. PASS.
- `forced-colors` przy przezroczystych tłach i `opacity` pigułki: sonda 1, Chromium: emulacja Playwrighta naprawdę wymusza kolory (tło `rgb(200,0,0)` → `rgb(255,255,255)`, alfa zachowana: `rgba(255,255,255,0.3)`, `opacity: 0.1` niezmienione, `Highlight` z autora zachowany). Strategia D36 (krycie 1, słowa systemowe) jest więc konieczna i testowalna. WebKit: `matchMedia('(forced-colors: active)')` = true, ale kolory nie są wymuszane, więc ograniczenie „tylko Chromium” jest słuszne. Przy D36 pilnować też wariantu pigułki `raised` (`indicator.css:31-38`, cień znika w trybie wymuszonym).
- Pigułka bez `will-change`: sonda 2: w spoczynku 0 warstw dodatkowych (z `will-change` 2 warstwy: pigułka i scalona treść nad nią); w trakcie animacji WAAPI ta sama para wraca przy DPR 1 i 1,5. Mechanizm D31 działa; ryzyko skoku pierwszej klatki to raster warstwy treści na starcie (`200×480` dla 20 pozycji), co pomiar `Paint` wykryje, jeśli zrobi się go poprawnie (P1).
- `@keyframes` w silniku a strażnik: wykonalne. `css-layers.ts` ma już obsługę bloków at-rule z deskryptorami (`@property` i `@font-face`, linie 403–420); `@keyframes` to ten sam wzór z listą selektorów `from`/`to`/`N%`.
- `field-sizing` i `text-box` w WebKit Playwrighta: sonda 1: `CSS.supports` true w obu silnikach, `textarea` z `field-sizing: content` rośnie po wpisaniu 4 linii, `text-box: trim-both cap alphabetic` daje tę samą wysokość bloku w obu (26,48 px przy 40 px). Warunek stopu z linii 785 nie zajdzie.
- `lib/collection` z typeahead a Q9: wybór literą idzie przez `choose()` → `useSyncExternalStore`, więc renderują się 2 pozycje (`toggle-group.tsx:129`, `single-choice.ts`). PASS, z uwagami M3 i M4.
- Emulacje Playwrighta (sonda 1): `contrast: 'more'`, `reducedMotion: 'reduce'`, `hasTouch` → `(pointer: coarse)`, `(any-pointer: coarse)` i `(hover: none)` działają w Chromium i WebKit (`hasTouch` sam, bez innych opcji, też daje `coarse`); `deviceScaleFactor: 0.5` działa w obu; `forcedColors` patrz wyżej.
- Kolejność faz: strażnicy (10) przed kodem, szkielet skrajności (11) przed zmianami: dobrze. Wyjątki: pomiar D31 (P1) i nazwy w fazie 12 (M11).

## Regresje i integracja

- `overflow-y: auto` na popupie menu: pomiar pigułki uwzględnia już przewinięcie (`lib/indicator.ts:422-439`, `scrollTop` w `measureIn` i `wallsOf`), więc test z linii 1007 („End pokazuje ostatnią pozycję, pigułka na niej”) jest właściwą kontrolą.
- Obszar trafienia (P2) to jedyna zmiana z części 2, która zmienia zachowanie kliknięć istniejących komponentów przy myszy.

## Wykonane kontrole

```text
Sonda 1: node probe.cjs (Playwright 1.64.1, headless, Chromium i WebKit po kolei, 1 przeglądarka naraz)
  emulacje: forced-colors/contrast/reduced-motion/pointer coarse/hover none = true w obu
  forced colors: Chromium wymusza tło (alfa zachowana, opacity bez zmian), WebKit tylko media query
  hasTouch sam: pointer coarse = true w obu; DSF 0.5: dpr 0.5 w obu
  text-box, field-sizing, corner-shape: supported w obu; textarea rośnie; trim 26.48 px w obu
  body container-type inline-size: fixed top = 0 po scrollY 500 w obu (nie jest blokiem zawierającym)
  CDP LayerTree (Chromium): will-change → warstwa 123×45 z backendNodeId; bez → brak; animacja → warstwa animowanego i nachodzącego rodzeństwa
Sonda 2: node probe2.cjs (Chromium, menu 20 pozycji z pigułką)
  will-change spoczynek: 4 warstwy (pusta, dokument, DIV#pill 192×24, DIV.item 200×480)
  bez will-change spoczynek: 2 (pusta, dokument)
  animacja WAAPI bez will-change: 4, te same węzły; DPR 1.5: te same rozmiary (px CSS)
Odczyt kodu: Base UI 1.9.0 (typy i .mjs wymienione w uwagach), recipes/*.css, engines/size.css, depth.css, state.css,
  components/{menu,popover,dialog,tooltip,toggle-group,input}.tsx, lib/indicator.ts, lib/single-choice.ts,
  vitest.config.ts, apps/docs/playwright.config.ts, apps/docs/tests/lab.spec.ts:395-415
```

Skrypty sond: `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\plan-tech\probe.cjs` i `probe2.cjs`.

## Niewykonane lub nierozstrzygające kontrole

- Hit-testing `::before` z `z-index: -1` pod tłem pozycjonowanego przodka (P2): wniosek z kolejności malowania CSS, bez sondy; rozstrzygnie go test proponowany w P2.
- `eventDetails.trigger` przy otwarciu z klawiatury dla `SubmenuTrigger` i przy przejściu między triggerami `TooltipBar`: tylko odczyt kodu.
- WebView2 w prawdziwym motywie kontrastowym Windows: poza zasięgiem sond (plan ma to w checkpoincie 3).
- Czas `check` po dodaniu `edges.spec.ts`: nie do zmierzenia przed implementacją.

## Ocena na osi wykonalności i dowodu: 7/10

Mechanizmy są dobrane do architektury i w większości potwierdzone w kodzie Base UI i w sondach: emulacje, `text-box`, `field-sizing`, kontener na `<body>`, wymuszanie kolorów w Chromium, CDP `LayerTree`, zagnieżdżone portale. Plan ma strażników przed kodem, fixture `bad/` dla każdej furtki i jawne warunki stopu. Trzy punkty obniżają ocenę, bo dotyczą samego dowodu: pomiar D31 nie przypisze wyniku zmianie (P1), test D38 nie wykrywa porażki (P2), a D40 nie obejmuje otwarcia sterowanego i nie ma tego w preflighcie (P3). Do tego kilka testów, które przejdą zawsze (M1, M2), i testy jednostkowe bez DOM (M3). Po poprawkach P1–P3, M1–M3 ocena 9/10.

## Zalecany następny krok

Poprawić w planie P1 (pomiar D31 w fazie 14b), P2 (test `elementFromPoint` i decyzja o obszarze przy myszy), P3 (źródło triggera i kanał `Root → Popup`, preflight z `defaultOpen`), potem M1–M3; resztę dopisać przy okazji. Ponowna recenzja tylko dotkniętych punktów.
