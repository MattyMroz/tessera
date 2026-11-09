---
kind: decision
date: 2026-11-01
stage: E2 (faza 14b)
---

# Warstwa pigułki: pomiar przed i po D31

## Odpowiedź

- **Pigułka bez `will-change`, warstwa tylko w czasie ruchu** (D31, wariant podstawowy). Wariant „warstwa od wejścia w grupę do końca ruchu” nie jest potrzebny: pomiar „po” nie pokazał ani dodatkowego `Paint` poddrzewa pigułki na starcie ruchu, ani ramki LoAF.
- Scena 8 grup `/screens/edges` w spoczynku: z 62 do 15 warstw poza korzeniem przy DPR 1,5 (z 61 do 19 przy DPR 1), pigułki i treść nad nimi z 52 warstw do 0; pamięć warstw z 40,06 do 35,43 MB przy DPR 1,5.
- Tekst pozycji nie zmienia antyaliasingu: w spoczynku i w połowie przejazdu różnice pikseli leżą tylko na krawędzi pigułki (najwyżej 3/255 przy DPR 1, 15/255 przy DPR 1,5), glify są identyczne.
- B7 liczy tylko warstwy poza korzeniem, które rysują (`drawsContent`) i mają pole > 0 (decyzja prowadzącego, sekcja „Definicja B7”). W `lab.spec.ts`: spoczynek na `/screens/edges` bez warstwy pigułki i treści nad nią; aktywna grupa i otwarte menu na `/screens/overlays` przy DPR 1,5: 3 i 5 warstw B7; `/screens/edges` z działającą pętlą w spoczynku 2 i 3, przy otwartym menu 3 i 6 warstw B7 przy DPR 1 i 1,5 (budżet 12; przy DPR 1,5 jedna z nich to przewijana Textarea z rundy C, sekcja „Wyjątek: przewijany obszar”).
- Pętla `aria-busy` zajmuje już jedną własną warstwę i nie rozlewa się na resztę strony: przepis `control` przycina zajętą kontrolkę do obrysu (sekcja „Pętla `aria-busy`”). Spoczynek `/screens/edges` z działającą pętlą: 5 warstw poza korzeniem przy DPR 1 i 1,5 (wcześniej 19 i 15), z tego 2 warstwy B7.

## Metoda

- Licznik `watchLayers` w `apps/docs/tests/helpers.ts`: CDP `LayerTree` (Chromium). Pomiary w tabelach „Wyniki” liczą wszystkie warstwy poza korzeniem (warstwa bez rodzica); od decyzji „Definicja B7” licznik bierze tylko warstwy B7 (`isBudgetLayer`: poza korzeniem, `drawsContent`, pole > 0) i na nich opiera liczbę, sumę pamięci i wybór szczytu w `peak`. Każda warstwa dostaje węzeł przez `backendNodeId` (`DOM.resolveNode`) i powody kompozycji (`LayerTree.compositingReasons`). Część: `pill`, gdy węzeł leży w `[data-recipe="indicator"]`; `over pill`, gdy warstwa ma powód `Overlap` albo `AssumedOverlap` i jej prostokąt (przesunięcie z macierzy `transform` i rozmiar warstwy) przecina prostokąt warstwy pigułki z tej samej migawki; reszta `other`. Treść nad pigułką istnieje więc tylko wtedy, gdy pigułka ma warstwę. Pamięć: szerokość × wysokość × DPR² × 4 B, tylko dla warstw, które rysują (`drawsContent`); rozmiary warstw są w px CSS (warstwa okna 1280 × 800 przy DPR 1,5). `now()` czyta drzewo po zakończeniu skończonych animacji, `peak(action)` zwraca migawkę z największą liczbą warstw od startu akcji do końca ruchu.
- Jeden skrypt pomiaru, uruchomiony tuż przed zmianą i tuż po niej, bez innych zmian między pomiarami (build z `will-change` w CSS i JS → pomiar „przed” → usunięcie obu → build → pomiar „po”). Skrypt i surowe JSON-y poza repo, w scratchpadzie sesji: `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\scripts\tmp-measure.spec.ts`, wyniki w `scratchpad\layers\{before,after}\dpr{1,1.5}.json` i zrzuty `*-text-{rest,ride}.png`.
- Playwright 1.64.1, Chromium headless shell, okno 1280 × 800, DPR 1 i 1,5, sekcja „Eight groups” przewinięta do widoku, kursor poza grupami. Stany: spoczynek; przejazd hover w „Group 6” z „1” na „6” (pozycje równej szerokości, więc rozmiar pigułki się nie zmienia i każdy `Paint` pochodzi z warstwy, nie z rozmiaru); otwarcie „Groups menu”; przejazd hover w menu z pierwszej pozycji na czwartą; spoczynek z otwartym menu. Trace przejazdu: CDP `Tracing` (`devtools.timeline`), zdarzenia `Paint` z węzłem z `nodeId`; LoAF z `PerformanceObserver` typu `long-animation-frame`.
- Zrzut tekstu: wycinek „Group 6” w spoczynku i w połowie przejazdu z „6” na „2” (animacje spowolnione 20 razy przez CDP `Animation.setPlaybackRate` na czas zrzutu, pigułka hover stoi wtedy nad „4” w obu pomiarach); różnica przed/po w skali szarości (`ffmpeg` `blend=difference`, `signalstats`).

## Wyniki: `/screens/edges`, sekcja 8 grup

Liczba warstw poza korzeniem / pamięć warstw / w tym pigułka + treść nad nią.

| Stan                     | DPR | Przed                   | Po                    | Różnica        |
| ------------------------ | --- | ----------------------- | --------------------- | -------------- |
| spoczynek                | 1   | 61 / 17,03 MB / 22 + 30 | 19 / 15,51 MB / 0 + 0 | −42 / −1,52 MB |
| spoczynek                | 1,5 | 62 / 40,06 MB / 22 + 30 | 15 / 35,43 MB / 0 + 0 | −47 / −4,63 MB |
| przejazd hover (szczyt)  | 1   | 62 / 17,03 MB / 23 + 30 | 21 / 15,53 MB / 1 + 2 | −41 / −1,50 MB |
| przejazd hover (szczyt)  | 1,5 | 63 / 40,07 MB / 23 + 30 | 17 / 35,46 MB / 1 + 2 | −46 / −4,61 MB |
| otwarcie menu (szczyt)   | 1   | 71 / 17,18 MB           | 28 / 15,65 MB         | −43            |
| otwarcie menu (szczyt)   | 1,5 | 75 / 40,74 MB           | 27 / 36,09 MB         | −48            |
| przejazd w menu (szczyt) | 1   | 72 / 17,33 MB / 25 + 33 | 29 / 15,82 MB / 2 + 3 | −43            |
| przejazd w menu (szczyt) | 1,5 | 75 / 40,74 MB / 25 + 33 | 27 / 36,11 MB / 2 + 3 | −48            |
| menu otwarte, spoczynek  | 1   | 71 / 17,29 MB           | 25 / 15,66 MB         | −46            |
| menu otwarte, spoczynek  | 1,5 | 74 / 40,80 MB           | 24 / 36,10 MB         | −50            |

Pierwsza klatka przejazdu (oba DPR, przed i po tak samo): 4 zdarzenia `Paint`, w tym 2 z węzłem pigułki (odsłonięcie pigułki hover), 0 z węzłem pozycji grupy; 0 ramek LoAF. Pamięć zdominowana przez warstwę przewijania dokumentu (1280 × 2835 px CSS, 32,6 MB przy DPR 1,5), która jest w obu pomiarach.

## Odkrycia

- Pętla `aria-busy` (obrót ikony przycisku „Saving” w sekcji „States”, D34) składała w Chromium kaskadę warstw `Overlap` dla treści malowanej później: 11 warstw na `/screens/edges` przy DPR 1,5 i 15 przy DPR 1; szczyt z otwartym menu 27. Mechanizm i poprawka: sekcja „Pętla `aria-busy`” niżej. W tabeli wyżej (pomiar D31) kaskada pętli jest w obu kolumnach.
- Otwarty popup przy DPR 1,5 to ok. 5 warstw niezależnie od pigułki: Positioner z `will-change: transform` od Floating UI (`e2-base-ui.md` §1), przewijanie popupu, treść nad nim, tło modalne Base UI (`role="presentation"`, cały ekran) i jego treść. Wciśnięcie triggera dokłada na czas ruchu 3 warstwy (skala przycisku, N5).
- Bez warstwy pigułki hover nad wybraną pozycją znika, więc zrzut „w połowie przejazdu” celuje w pozycję inną niż wybrana.

## Pętla `aria-busy`: przycięcie do obrysu

### Mechanizm

- CDP przed poprawką, spoczynek `/screens/edges` przy DPR 1,5: warstwy okna i przewijania (4), slot ikony „Saving” z powodem `ActiveRotateAnimation` (16 × 16) i 10 warstw z powodem `Overlap` dla treści malowanej po nim: przycisk „Pressed” (697 × 29), pole, „Select”, „Select xs”, „Cancel”, „Chapters”, grupy „Range from the right”, „Group 1”, „Group 7” i grupa `mode` panelu (240 × 714). Przy DPR 1 tych warstw jest 14.
- Chromium przy teście nakładania nie zna zasięgu aktywnej animacji transformacji i przyjmuje, że animowany element może być wszędzie w granicach najbliższego przycięcia nad nim. Bez takiego przycięcia granicą jest okno, więc każda treść malowana później, której nie da się dołączyć do istniejącej warstwy, dostaje własną warstwę `Overlap`. Kontekst nakładania tego nie zmienia: `control` ma już `isolation: isolate`.
- Dowód przez eliminację (ten sam skrypt, CSS wstrzyknięty do zbudowanej strony, spoczynek przy DPR 1,5): bez zmian 15 warstw; `contain: paint` na samym obracanym slocie 15 (przycięcie leży pod obrotem i obraca się z nim); `contain: paint` albo `overflow: clip` na kontrolce, czyli przodku slotu, 5; zatrzymana pętla 4. Po poprawce jedyny powód nowej warstwy to `ActiveRotateAnimation` slotu, a `Overlap` znika ze spoczynku.

### Zmiana

`packages/tessera/src/recipes/control.css:209-214`: `@supports (overflow-clip-margin: border-box)` z `overflow: clip` i `overflow-clip-margin: border-box` na `[data-recipe='control'][aria-busy='true']`. Obrót zostaje na slocie ikony (HTML, Q2), bez `will-change`. Przycięcie leży na obrysie, więc obejmuje nakładkę stanu `::after` (wystaje o grubość ramki poza pole wewnętrzne) i obrócony slot; obwódka fokusu i cień są własnym malowaniem kontrolki, więc przycięcie ich nie dotyczy. WebKit nie zna `overflow-clip-margin`, a samo `overflow: clip` przycięłoby tam `::after` do pola wewnętrznego (do 19/255 na ramce), dlatego `@supports`. WebKit kaskady nie potrzebuje gasić, a B7 i tak mierzy tylko Chromium.

Strażnik: `test/guards/css-layers.ts:94-95` (`CLIP_SUPPORTS`, `CLIP_PROPERTIES`), `:492` (at-rule przepisu), `:510` (w bloku tylko `overflow` i `overflow-clip-margin`); fixture `good/recipes/control.css` z blokiem, `bad/recipes/control.css` z innym warunkiem (`at-rule not allowed`) i z `opacity` w bloku (`not a clip property in @supports`).

Odrzucone: przycięcie na slocie z obrotem samego `<svg>` (0 różnic pikseli, ale łamie Q2: obrót na elemencie SVG); dodatkowe opakowanie HTML w slocie (zmiana DOM `Button` dla każdej ikony); `contain: paint` (przycina do pola wewnętrznego, czyli ucina `::after` na ramce); `overflow: clip` bez `@supports` (WebKit).

### Wygląd

Zrzuty przycisku „Saving” w wariantach `solid`, `soft`, `outline`, w stanach spoczynek, hover i fokus z klawiatury, DPR 1, 1,5 i 2, obrót zatrzymany na 45°; „przed” = ten sam build z wstrzykniętym `overflow: visible !important`, zrobione dwa razy dla oceny szumu (szum 0 poza jednym zrzutem: 2 px po 3/255).

- WebKit: 0 różnic we wszystkich 27 parach (blok nie działa).
- Chromium: różnice tylko na krawędzi nakładki `::after` i obwódki, najwyżej 5/255 (hover), 3/255 (spoczynek `soft`, fokus), 1/255 w pozostałych; DPR 1,5 w spoczynku `solid` i `outline`: 0. Glif ikony obróconej o 45° nieprzycięty. To mniej niż próg przyjęty dla krawędzi pigułki w D31 (15/255).

### Wyniki

Liczba warstw poza korzeniem; „przed” = build z poprawką i wstrzykniętym `overflow: visible !important` (zgodny liczbowo z pomiarem „po” D31 wyżej), „bez pętli” = wstrzyknięte `animation: none`.

| Scena                           | Stan                               | DPR | Przed  | Po     | Bez pętli |
| ------------------------------- | ---------------------------------- | --- | ------ | ------ | --------- |
| `/screens/edges`                | spoczynek                          | 1   | 19     | 5      | 4         |
| `/screens/edges`                | spoczynek                          | 1,5 | 15     | 5      | 4         |
| `/screens/edges`                | otwarcie menu (szczyt)             | 1   | 28     | 15     | 14        |
| `/screens/edges`                | otwarcie menu (szczyt)             | 1,5 | 27     | 18     | 17        |
| `/screens/edges`                | menu otwarte, spoczynek            | 1   | 25     | 11     | 10        |
| `/screens/edges`                | menu otwarte, spoczynek            | 1,5 | 24     | 14     | 13        |
| `/screens/edges`                | przejazd w menu (szczyt)           | 1   | 29     | 15     | 14        |
| `/screens/edges`                | przejazd w menu (szczyt)           | 1,5 | 27     | 17     | 16        |
| `/screens/overlays` (bez pętli) | menu otwarte, spoczynek / przejazd | 1,5 | 9 / 11 | 9 / 11 | —         |

Pętla kosztuje teraz dokładnie jedną warstwę w każdym stanie. Surowe JSON-y i zrzuty: scratchpad sesji, `loop\final\` (skrypt pomiaru był tymczasowy i został usunięty).

## Definicja B7: warstwy, które rysują i mają pole > 0

### Problem

Przy liczeniu wszystkich warstw poza korzeniem menu otwarte w spoczynku na `/screens/edges` przy DPR 1,5 dawało 14 warstw, a bez pętli 13, więc nadmiar nie pochodził z pętli. Skład 13: 4 warstwy okna i przewijania; 4 warstwy `FixedPosition` 0 × 0 (strażnicy fokusu Base UI `data-base-ui-focus-guard` i `span[aria-owns]` z wbudowanym stylem `position: fixed`; Chromium składa je osobno, bo dokument się przewija, a `/screens/overlays` się nie przewija i ich tam nie ma); tło modalne Base UI 1280 × 800 (`Overlap`); Positioner z `will-change: transform`; przewijanie menu; treść menu (`Overlap`); jedna warstwa bez węzła (165 × 133). Warstwy `FixedPosition` nic nie rysują (0 B). Przy DPR 1 Positioner nie dostaje warstwy, stąd 11.

Odrzucone: przestawienie strażników fokusu Base UI na `position: absolute` (wymaga `!important` przeciw stylowi wbudowanemu dostawcy, zakazane przez strażnika); część „aktywna” B7 tylko na `/screens/overlays`, a na `/screens/edges` sam test „pętla dokłada jedną warstwę” (budżet nie obejmowałby sceny z przewijaniem).

### Decyzja (prowadzący)

B7 mierzy koszt pamięci GPU, więc liczy tylko warstwy poza korzeniem, które rysują (`drawsContent`) i mają pole > 0. Warstwa 0 × 0 bez rysowania nie ma bufora i nie kosztuje pamięci. Budżet zostaje 12. Jedna definicja w `apps/docs/tests/helpers.ts:139` (`isBudgetLayer`), stosowana przy każdej migawce `LayerTree` (`:200`), więc liczba, suma pamięci (`:168`) i wybór szczytu w `peak` opierają się na tym samym zbiorze; testy B7 nie liczą warstw inną drogą.

### Wyniki po zmianie definicji

Warstwy B7 z testów `lab.spec.ts` (Playwright 1.64.1, Chromium headless shell, 1280 × 800); „bez pętli” = reduced motion, ten sam stan.

| Scena               | Stan                       | DPR | Warstwy B7 | Bez pętli |
| ------------------- | -------------------------- | --- | ---------- | --------- |
| `/screens/edges`    | spoczynek (pętla działa)   | 1   | 2          | —         |
| `/screens/edges`    | spoczynek (pętla działa)   | 1,5 | 2          | —         |
| `/screens/edges`    | otwarcie menu (szczyt)     | 1   | 6          | —         |
| `/screens/edges`    | otwarcie menu (szczyt)     | 1,5 | 8          | —         |
| `/screens/edges`    | menu otwarte, spoczynek    | 1   | 3          | 2         |
| `/screens/edges`    | menu otwarte, spoczynek    | 1,5 | 5          | 4         |
| `/screens/overlays` | przejazd w grupie (szczyt) | 1,5 | 3          | —         |
| `/screens/overlays` | przejazd w menu (szczyt)   | 1,5 | 5          | —         |

Skład `/screens/edges`, menu otwarte, DPR 1,5: przewijanie dokumentu (1280 × 2835), slot ikony z `ActiveRotateAnimation` (16 × 16), Positioner z `will-change: transform` (211 × 179), treść menu (`Overlap`, 143 × 129), warstwa bez węzła (165 × 133). Przy DPR 1 zostają przewijanie dokumentu, slot ikony i Positioner (`role="presentation"`, 211 × 179) z powodem `Overlap` zamiast `WillChangeTransform`, z treścią menu w tej samej warstwie. Szczyt otwarcia menu nie ma osobnej asercji: test czeka na koniec ruchu i sprawdza stan otwarty. Tło modalne Base UI na pełny ekran i strażnicy fokusu nie rysują, więc B7 ich nie liczy.

### Testy

`apps/docs/tests/lab.spec.ts:586-633`, „with a busy button at DPR 1” i „… 1.5” (Chromium; WebKit `skip`, brak CDP `LayerTree`): slot ikony ma animację tylko `rotate`; w spoczynku i przy otwartym menu zbiór warstw B7 z działającą pętlą = zbiór po zatrzymaniu pętli (reduced motion, ten sam stan) plus dokładnie jedna warstwa `ActiveRotateAnimation`, łącznie ≤ 12 (`expectOnlyTheLoopLayer`). Test wykrywa kaskadę od pętli, a nie każdą warstwę `Overlap` na stronie. `:550-584` („at DPR 1.5”): spoczynek `/screens/edges` bez warstwy pigułki i treści nad nią, szczyt przejazdu w grupie i w menu na `/screens/overlays` ≤ 12. Test „turns the icon of a busy button…” (`:789`) dalej sprawdza `rotate` i zatrzymanie przy `motion: off` i reduced motion.

### Wyjątek: przewijany obszar (runda C, E3)

Przewijany obszar może mieć własną warstwę kompozytora (przewijanie składane przez kompozytor), także z powodem `Overlap`; nie jest to kaskada od pętli. Na `/screens/edges` taką warstwę ma Textarea z `maxRows`, która przewija długi tekst („Long text”, 290 × 106, powód `Overlap`): przy DPR 1,5 jest w spoczynku i przy otwartym menu, z pętlą i po jej zatrzymaniu, a przy DPR 1 jej nie ma. Dawna asercja „zero warstw `Overlap` w spoczynku” oblewała przez nią przy DPR 1,5, choć pętla dokładała dalej jedną warstwę; asercję zastąpiło porównanie z tym samym stanem bez pętli (decyzja prowadzącego, opcja a).

| Stan (`/screens/edges`) | DPR | Warstwy B7 z pętlą | Bez pętli                           |
| ----------------------- | --- | ------------------ | ----------------------------------- |
| spoczynek               | 1   | 2                  | 1                                   |
| spoczynek               | 1,5 | 3                  | 2 (przewijanie dokumentu, Textarea) |
| menu otwarte, spoczynek | 1   | 3                  | 2                                   |
| menu otwarte, spoczynek | 1,5 | 6                  | 5                                   |

Dowód, że test dalej łapie kaskadę: przy tymczasowo wyłączonym przycięciu pętli (`overflow: visible` zamiast `overflow: clip` w bloku `@supports` przepisu `control`) oba testy oblewają, bo z pętlą pojawia się 17 (DPR 1) i 12 (DPR 1,5) dodatkowych warstw `Overlap` (przyciski, tory segmentów, pole), których bez pętli nie ma. Po przywróceniu przycięcia oba przechodzą.

## Wyjątek: popup nad przewijanym panelem (2026-11-04)

- Od układu aplikacji laboratorium (kolumny stoją, przewija się `#lab-main`, decyzja właściciela 2026-11-04) test pętli pod otwartym menu przy DPR 1 dostawał jedną warstwę więcej: popup menu z portalu (`div[role="presentation"]`, powód `Overlap`). Ikona leżała poza ekranem (y = −676 px w panelu), menu na dole okna: geometrycznie się nie nakładają.
- Mechanizm: przy DPR 1 Chromium nie kompozytuje przewijanego panelu (zachowuje wygładzanie LCD tekstu), dopóki w nim nie ma warstwy; pętla dokłada warstwę, panel dostaje warstwę przewijania, a popup malowany po panelu i leżący nad nim dostaje `Overlap`. Przy DPR 1,5 panel ma warstwę zawsze, więc test przechodził.
- Odrzucone: wymuszenie warstwy panelu na stałe (`will-change: scroll-position`) zabiera wygładzanie LCD całemu tekstowi panelu przy DPR 1, a to gorsze niż jedna warstwa popupu, która istnieje tylko przy otwartym popupie nad pętlą.
- Kontrakt testu (`lab.spec.ts`, „adds exactly one compositor layer of its own…”): pętla dokłada swoją warstwę, a pod otwartym menu dodatkowo najwyżej jedną warstwę samego popupu z powodem `Overlap`; każda inna różnica oblewa. Prowadzący, 2026-11-04.

## Nagrania (checkpoint 3)

MP4 H.264 1280 × 800 w scratchpadzie sesji, katalog `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\cp3\`: `toggle-spring-{before,after}.mp4`, `toggle-elastic-{before,after}.mp4` (kliknięcia wzdłuż „Group 3” i „Group 8”), `menu-{before,after}.mp4` (hover w dół i w górę przez separator), `loops-after.mp4` (`/foundation`: obrót, pulsowanie, przesuw). Skrypt nagrań: `scratchpad\scripts\tmp-video.spec.ts`.
