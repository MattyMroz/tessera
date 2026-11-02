---
kind: decision
date: 2026-11-02
stage: E3, silnik interakcji (plan `docs/plans/e3-motion.md`, faza 0, punkty 1, 3 i 4)
---

# Silnik interakcji: wciśnięcie i hover, wejście i pomiary fazy 0

Kto: wykonawca pomiarów na zlecenie prowadzącego, 2026-11-02. Build `feat/e2-foundation` z 02.11 (`apps/docs/out`, 14:03), kopia w scratchpadzie sesji, wstrzykiwany CSS i JS; kod produktu bez zmian. Surowe dane, skrypty i strona porównawcza: scratchpad sesji, katalog `motion/` (`data/`, `harness/`, `out/motion-demo.html`). Ten dziennik podaje liczby i koszty; wybory O1–O7 należą do właściciela.

## Co dokładnie testowano

- **Przeglądarki.** Chromium 1248 z Playwright 1.64.1 w trybie headless (powłoka `chrome-headless-shell`), bez sprzętowego GPU (rasteryzacja programowa), na Windows 11 tej maszyny. WebKit z Playwright (build Windows), headless. Nie testowano: Chrome z GPU na ekranie, Edge i WebView2, Safari na macOS i iOS, Firefox, prawdziwego telefonu.
- **Mechanizmy gęstości pikseli.** (a) „DSF” = flaga `--force-device-scale-factor` bez emulacji (ta sama droga co skala ekranu Windows); wartości 0,5–3. (b) Wcześniejsze przebiegi „emulacja” = Playwright `deviceScaleFactor` (CDP `Emulation.setDeviceMetricsOverride`); przy DPR ≠ 1 przyciąga do siatki inaczej niż (a), więc rozstrzygające liczby są z (a), a emulacja jest oznaczona. (c) Przybliżenie strony Ctrl +/− = prawdziwy zoom strony przez `chrome.tabs.setZoom` z rozszerzenia w pełnym Chromium (kanał `chromium`, headless), który przelicza układ jak skrót klawiszowy; obraz z CDP `Page.captureScreenshot` w pikselach urządzenia (zrzut Playwright jest przy zoomie przeskalowany do px CSS i nie nadaje się do pomiaru). (d) Szczypanie = skala strony na emulacji telefonu (390 px, DPR 3); `Input.synthesizePinchGesture` w headless nie działa, więc `Emulation.setPageScaleFactor` 1,5× (2,5× nie zmierzone). Tabele niżej podają mechanizm przy każdej liczbie.
- **Przyciski.** Skok klatka po klatce: „New” `outline` z dwiema ikonami, `solid`, „Crop” w grupie History (`track`); kotwice „Project” (trigger menu) i „Pan” (tooltip w pasku). Identyczność obrazu: 40 przycisków grupy „skala” z sekcji Button i Button group na `/components`, jasny motyw. Telefon: 390 px, `hasTouch`, DPR 3 (emulacja), dotyk przez CDP.
- **Skok.** Środek ciężkości pikseli etykiety i każdej ikony liczony na zrzutach kolejnych klatek przy przejściu spowolnionym 10×; skok = największa zmiana położenia między sąsiednimi klatkami w px CSS, próg 0,25 px. Krok samego ruchu (0,1–0,2 px na klatkę) też jest krokiem, więc wynik ≤ 0,25 px oznacza brak przeskoku, a nie brak ruchu.
- **Identyczność obrazu.** Zrzut przycisku w spoczynku kontra zrzut z wymuszonym rysowaniem jak w ruchu (`will-change: scale` albo animacja `scale` zatrzymana w chwili startu). „Identyczne” = 0 pikseli różniących się o więcej niż 24 poziomy w kanale; to bezpośrednio sprawdza, czy pierwsza i ostatnia klatka ruchu różnią się od spoczynku.
- **Czego ten test nie sprawdza.** Wyglądu na ekranie z GPU (inny raster tekstu i warstw niż SwiftShader), monitora właściciela i jego ustawienia ClearType, WebView2, Safari, prawdziwego telefonu, odczucia ruchu (to ocenia właściciel na `motion-demo.html`), ciemnego motywu w teście identyczności (skok mierzony w jasnym), stron innych niż laboratorium.

## Słowa właściciela 02.11

- „Cały baton ma się skalować.”
- „Płytka nie jest decyzją.”
- „Skaluje się tylko płytka — błędne rozpoznanie problemu, decyzja bez mojej zgody.”
- „Button ma być zoptymalizowany. Cały silnik odnośnie animacji.”
- „Każdy hover ma mieć wyjście.”

Polecenia prowadzącego w trakcie fazy 0 (02.11, od właściciela): stała warstwa (`Pc`, wariant (c)) odrzucona przez właściciela z powodu kosztu zasobów, mierzona tylko jako odniesienie; rozwiązanie ma istnieć i spełniać naraz: (1) prosto i skutecznie, (2) ruch na kompozytorze (`transform`/`scale`/`opacity`, bez animacji w JS ani na wątku głównym), (3) zero przeskoku tekstu i ikon, (4) poprawnie w siatce pikseli przy każdym przybliżeniu (50–200 %), DPR 1 / 1,25 / 1,5 / 1,75 / 2 / 3 i na telefonie, (5) bez stałego kosztu (zero warstw w spoczynku ponad `P0`). Ta sama reguła siatki dotyczy listy rozwijanej otwieranej nad triggerem (tekst wybranej pozycji ma stać na tekście triggera).

## O6: wartości z trzech źródeł (z planu)

| Wartość                      | Notatka 11.10 (decyzja właściciela) | Desktop (`tmp/desk/styles/ui.css`)                | v2 (`control.css`, `button.css`)             |
| ---------------------------- | ----------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| skala                        | 0,97                                | 0,92 + `opacity` 0,82 (`:120`, `:281-289`)        | `--button-press-scale` (`:72-73`)            |
| wciśnięcie: wejście / powrót | 50 ms / 224 ms bez odbicia          | 100 ms / 100 ms `ease-out` (`:85-92`, `:250-252`) | `--motion-press-in` / czasy powrotu `:32-35` |
| hover: wejście / wyjście     | 100 ms / 150 ms                     | 100 ms / 100 ms (`--motion-state`)                | `--control-state-time` hover in/out          |
| warstwa                      | `will-change: scale` stale          | `will-change: transform` stale (`:251`)           | `will-change: scale` stale (`button.css:30`) |

W pomiarach: zestaw (W) = 0,97, wejście 50 ms `cubic-bezier(0, 0, 0.2, 1)`, powrót 224 ms `cubic-bezier(0.2, 0, 0, 1)`, hover 100 / 150 ms; zestaw (D) = 0,92 + `opacity` 0,82, 100 / 100 ms `cubic-bezier(0, 0, 0.2, 1)`, hover 100 / 100 ms.

## Prior art

Źródło: `tmp/v3/research-press-2026-11-02.md` (research 02.11, 16 bibliotek i produktów, kod Chromium na SHA `b5129177`). Najważniejsze:

- Tekst z przyciskiem skalują tylko Linear (`will-change: transform` tylko w `:active`), Raycast (bez obejścia), React Spectrum S2 (`will-change: transform` stale, `pressScale.ts:40-58`) i zalecenia Emila Kowalskiego (`will-change` „only once you see it” przy przeskoku o 1 px). shadcn (nowe style), Mantine, Radix Themes i Arc przesuwają o całe piksele zamiast skalować; Material, Fluent, Ant, Chakra, Base UI i Apple nie ruszają geometrii tekstu.
- Chromium odrzuca ułamkową resztę przesunięcia malowania („subpixel accumulation”) przy każdej transformacji innej niż przesunięcie, przy trwającej animacji transformacji i przy `will-change: transform/scale` (`paint_property_tree_builder.cc:707-737`, `:752-786`; `compositing_reasons.h:115-118`). Commit dla crbug 1155029 naprawił „1-pixel glitch at the start or end” tylko dla animacji przesunięcia.
- Warstwa z `will-change` i trwająca animacja transformacji nie mają tekstu LCD (`picture_layer_impl.cc:695-746`); przy DSF ≥ 1,5 Blink ignoruje preferencję LCD przy decyzjach kompozycji (`widget_base.cc`).
- Wniosek researchu: żadna znana biblioteka nie skaluje tekstu bez przeskoku bez stałej warstwy.

Pomiar niżej (część A) znajduje taką drogę: stała transformacja w spoczynku bez warstwy, która wyrównuje rysowanie spoczynku z rysowaniem w ruchu.

## A. Wciśnięcie

### Metoda

- **Skok w ruchu** (harness `e3-fix-a`, `frames.ts`): przejście spowolnione 10× (CDP `Animation.setPlaybackRate`, w WebKit czasy × 10 w CSS), zrzut klatka po klatce, środek ciężkości pikseli etykiety i każdej ikony, największy krok między sąsiednimi klatkami w px CSS; próg 0,25 px. Cele: „New” `outline` (dwie ikony), `solid`, „Crop” w grupie History (`track`), dla kotwic „Project” (trigger menu) i „Pan” (tooltip w pasku). Kolumna „start/środek/koniec” rozdziela krok na początku ruchu, w trakcie i na końcu; przeskok to krok na początku lub końcu wyraźnie większy niż kroki w trakcie.
- **Obraz w warstwie = obraz bez warstwy** (`static.ts`, nowy): ten sam przycisk w spoczynku i z wymuszonym rysowaniem jak w ruchu (`will-change: scale` albo animacja `scale` 1 → 0,97 zatrzymana w chwili 0), porównanie piksel do piksela i przesunięcie środka ciężkości każdej części. To bezpośredni test przyczyny: przeskok na starcie i końcu ruchu to dokładnie różnica tych dwóch obrazów. 40 przycisków grupy „skala” z sekcji Button i Button group na `/components`.
- **Prawdziwy DPR zamiast emulacji.** Emulacja Playwright (`deviceScaleFactor`) daje przy DPR ≠ 1 inne przyciąganie do siatki niż prawdziwy współczynnik ekranu: z emulacją wyrównanie przycisku do całych px CSS usuwało różnicę, a do pikseli urządzenia nie; z flagą `--force-device-scale-factor` (ta sama droga co skala ekranu Windows i przybliżenie przeglądarki, `devicePixelRatio` = DSF × zoom) jest odwrotnie (wyrównanie do pikseli urządzenia: przy 1,25 i 2 różnica ≤ 0,23 px, przy 1,5 ikony nadal o 0,67 px). Dlatego wszystkie liczby rozstrzygające niżej są z prawdziwym DSF; przybliżenie 50–200 % mierzone jako DSF 0,5 / 0,67 / 0,75 / 0,8 / 0,9 / 1,1 / 1,25 / 1,5 / 1,75 / 2 / 2,5 / 3 (ta sama siatka pikseli; szerokość okna w px CSS zostaje 1280, więc układ strony nie jest identyczny z prawdziwym przybliżeniem). Wnioski `e3-fix-a` przy DPR 1,25–2 pochodziły z emulacji.

### Przyczyna przeskoku (pomiar)

Spoczynek bez transformacji kontra rysowanie w ruchu, 40 przycisków, prawdziwy DSF:

| DSF  | przyciski z różnicą > 0,25 px | największa różnica         |
| ---- | ----------------------------- | -------------------------- |
| 0,67 | 21 z 40                       | 1,64 px (etykieta)         |
| 0,9  | 27                            | 1,31                       |
| 1    | 20                            | 1,00 (ikona końcowa „New”) |
| 1,1  | 29                            | 1,07                       |
| 1,25 | 2 z 12                        | 0,35                       |
| 1,5  | 8 z 12                        | 0,67 (ikony)               |
| 1,75 | 11 z 40                       | 0,57                       |
| 2    | 0 z 12                        | 0,16                       |
| 2,5  | 1 z 40                        | 0,40                       |
| 3    | 1 z 40                        | 0,33                       |

`will-change` i trwająca animacja dają identyczny obraz (obie drogi odrzucają ułamek przesunięcia, research pkt 3); spoczynek bez transformacji rysuje części z ułamkiem. Różnica ma dwa składniki: (1) geometryczny, przesunięcie ikon i etykiety o ułamek piksela, (2) wygładzanie tekstu: spoczynek LCD (barwne obwódki), ruch szary.

### Rozwiązanie: spoczynek rysowany tak samo jak ruch (kandydatury T i TG)

- **T**: grupa „skala” ma w spoczynku `scale: 0.99999` (transformacja bez warstwy: nie ma `will-change`, nie ma animacji). Chromium odrzuca ułamek przesunięcia także w spoczynku, więc spoczynek i ruch przyciągają części do siatki tak samo. Wciśnięcie: przejście `scale` na kompozytorze od 0,99999 do skali wciśnięcia i z powrotem do 0,99999; warstwa istnieje tylko w czasie animacji.
- **TG** = T + etykieta rysowana w spoczynku w skali szarości przez filtr bez skutku wizualnego (`filter: drop-shadow(0 0 0 transparent)` na `[data-slot='label']`). Usuwa składnik (2): ruch na kompozytorze zawsze rysuje tekst szaro (research pkt 1), więc spoczynek też musi.

Obraz w ruchu kontra spoczynek, 40 przycisków, prawdziwy DSF (przesunięcie środka ciężkości; „identyczne” = 0 zmienionych pikseli):

| DSF  | T: > 0,25 px / największa | TG: identyczne / największa           | bez zmiany (dziś przy skali całego elementu) |
| ---- | ------------------------- | ------------------------------------- | -------------------------------------------- |
| 0,5  | 6 / 0,58 (etykieta)       | 40 z 40 / 0,03                        | –                                            |
| 0,67 | 3 / 0,44                  | 40 / 0,01                             | 21 / 1,64                                    |
| 0,75 | 1 / 0,25                  | 40 / 0,01                             | –                                            |
| 0,8  | 3 / 0,28                  | 40 / 0,01                             | –                                            |
| 0,9  | 4 / 0,30                  | 40 / 0,02                             | 27 / 1,31                                    |
| 1    | 1 / 0,42                  | 38 / 0,003                            | 20 / 1,00                                    |
| 1,1  | 0 / 0,22                  | 40 / 0,02                             | 29 / 1,07                                    |
| 1,25 | 0 / 0,23                  | 39 / 0,002                            | 2 z 12 / 0,35                                |
| 1,5  | 0 / 0,18                  | 28 / 0,06 (cień `raised`, 12 pikseli) | 8 z 12 / 0,67                                |
| 1,75 | 0 / 0,16                  | 38 / 0,001                            | 11 / 0,57                                    |
| 2    | 0 / 0,16                  | 30 / 0,003                            | 0 z 12 / 0,16                                |
| 2,5  | 0 / 0,12                  | 25 / 0,02                             | 1 / 0,40                                     |
| 3    | 0 / 0,07                  | 31 / 0,002                            | 1 / 0,33                                     |

**Przybliżenie strony (Ctrl +/−).** Prawdziwy zoom przez `chrome.tabs.setZoom` z rozszerzenia (ta sama mapa zoomu co skrót klawiszowy), pełny Chromium w trybie headless, DSF 1, okno 1280 px; układ jest przeliczany (przy 125 % strona ma 1010 px CSS szerokości). Zrzut Playwright przy zoomie strony jest przeskalowany do px CSS (sprawdzone: przycisk 90 × 28 px zamiast 113 × 35 przy 125 %), więc obraz brany jest z CDP `Page.captureScreenshot` w pikselach urządzenia i przycinany bez skalowania. Liczba identycznych obrazów z 40 / największe przesunięcie (px CSS):

| Zoom  | bez zmiany (Pb, dziś przy skali całego elementu) | T         | TG        |
| ----- | ------------------------------------------------ | --------- | --------- |
| 50 %  | 5 / 1,14                                         | 32 / 0,01 | 32 / 0,01 |
| 67 %  | 5 / 1,63                                         | 40 / 0,00 | 40 / 0,00 |
| 75 %  | 0 / 1,33                                         | 40 / 0,00 | 40 / 0,00 |
| 80 %  | 0 / 1,77                                         | 40 / 0,00 | 40 / 0,00 |
| 90 %  | 3 / 1,31                                         | 40 / 0,01 | 40 / 0,01 |
| 110 % | 3 / 1,06                                         | 40 / 0,00 | 40 / 0,00 |
| 125 % | 5 / 0,54                                         | 40 / 0,00 | 40 / 0,00 |
| 150 % | 3 / 0,67                                         | 40 / 0,00 | 40 / 0,00 |
| 175 % | 0 / 0,81                                         | 40 / 0,00 | 40 / 0,00 |
| 200 % | 5 / 0,24                                         | 40 / 0,00 | 40 / 0,00 |

Bez zmiany 15–40 z 40 przycisków przeskakuje o więcej niż 0,25 px przy każdym poziomie od 50 do 175 %. T i TG dają obraz w ruchu identyczny ze spoczynkiem przy każdym poziomie (przy 50 % 32 z 40 identycznych, reszta ≤ 0,01 px). Zastrzeżenie: w tej przeglądarce (pełny Chromium headless, inny niż `chrome-headless-shell` z tabel DSF) T i TG wychodzą tak samo, co wskazuje, że tekst nie jest tu rysowany z LCD; różnicy wygładzania między T i TG przy zoomie strony ten pomiar nie pokazuje (pokazują ją tabele DSF wyżej).

Pierwszy przebieg zoomu (zrzuty Playwright w px CSS) był błędny i został odrzucony; liczby wyżej są z drugiego przebiegu.

Skok klatka po klatce przy przybliżeniu strony (zestaw W; największy krok, w nawiasie start / koniec; zrzut z CDP jest wolniejszy, więc klatek jest ok. 105 zamiast 140, a kroki samego ruchu większe):

| Kandydatura | 50 %               | 67 %               | 75 % | 80 %               | 90 % | 110 % | 125 % | 150 % | 175 % | 200 % |
| ----------- | ------------------ | ------------------ | ---- | ------------------ | ---- | ----- | ----- | ----- | ----- | ----- |
| P0          | 0,29               | 0,26               | 0,12 | 0,10               | 0,12 | 0,05  | 0,21  | 0,05  | 0,06  | 0,04  |
| Pb          | 2,06 (2,06 / 2,00) | 1,65 (1,65 / 1,65) | 0,68 | 1,82               | 1,11 | 1,06  | 1,13  | 0,73  | 0,60  | 0,24  |
| Pc          | 0,17               | 0,17               | 0,21 | 0,20               | 0,23 | 0,23  | 0,24  | 0,22  | 0,23  | 0,21  |
| T           | 0,54 (0,33 / 0,03) | 0,31 (0,27 / 0,22) | 0,28 | 0,40 (0,36 / 0,09) | 0,32 | 0,35  | 0,29  | 0,24  | 0,26  | 0,30  |
| TG          | 0,46 (0,33 / 0,02) | 0,33               | 0,28 | 0,42 (0,42 / 0,09) | 0,34 | 0,35  | 0,29  | 0,26  | 0,34  | 0,22  |

Przy przybliżeniu strony T i TG nie przeskakują na granicy spoczynek ↔ ruch (obraz identyczny, tabela wyżej; krok końcowy ≤ 0,22 px), ale w pierwszych 2–3 klatkach ruchu mają nieregularne kroki 0,26–0,54 px, których Pc nie ma (0,14–0,24 px, płynnie malejące). Przykład, zoom 80 %, ikona końcowa „New”: T 0,08 → 0,37 → 0,40 → 0,09, Pc 0,05 → 0,17 → 0,14 → 0,12. Porównanie połowy wciśnięcia z Pc przy zoomie: spoczynek 0 pikseli różnicy, połowa wciśnięcia 56–218 pikseli i przesunięcie do 0,37 px (67 %). Wniosek: tekstura animacji bez `will-change` zmienia się w trakcie ruchu (Chromium dobiera skalę rastra animacji), a tekstura z `will-change` (Pc) jest stała od startu. Kandydatura TE = T + `will-change: scale` tylko w czasie `[data-pressing]` (start dalej identyczny ze spoczynkiem, bo w T obraz z `will-change` = spoczynek); wynik niżej.

### TE: T z warstwą tylko w czasie wciśnięcia

| Pomiar                                                                    | T                                                                   | TE                                                                  | Pc                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| skok, DSF 0,67 / 1 / 1,25 / 1,5 / 1,75 / 2 / 3 (W)                        | 0,41 / 0,22 / 0,30 / 0,21 / 0,21 / 0,16 / 0,15                      | 0,37 / 0,21 / 0,24 / 0,20 / 0,21 / 0,16 / 0,16                      | 0,17 / 0,18 / 0,19 / 0,16 / 0,15 / 0,20 / 0,16 |
| krok startowy / końcowy, DSF 1–3                                          | 0,15–0,30 / ≤ 0,22                                                  | 0,15–0,24 / ≤ 0,22                                                  | 0,15–0,20 / ≤ 0,10                             |
| skok, zoom strony 50 / 67 / 75 / 80 / 90 / 110 / 125 / 150 / 175 / 200 %  | 0,54 / 0,31 / 0,28 / 0,40 / 0,32 / 0,35 / 0,29 / 0,24 / 0,26 / 0,30 | 0,37 / 0,33 / 0,28 / 0,24 / 0,32 / 0,24 / 0,25 / 0,24 / 0,21 / 0,20 | 0,17–0,24                                      |
| połowa wciśnięcia vs Pc, DSF 1 / 1,25 / 1,5 / 2 / 3                       | 73–510 px różnicy                                                   | **0 px** przy każdym DSF                                            | –                                              |
| połowa wciśnięcia vs Pc, zoom 67 / 90 / 110 / 125 / 150 %                 | 56–218 px, do 0,37 px                                               | **0 px** przy każdym poziomie                                       | –                                              |
| spoczynek vs Pc                                                           | LCD zamiast szarego (115–482 px), położenie ≤ 0,23 px               | to samo co T                                                        | –                                              |
| warstwy w spoczynku                                                       | jak P0                                                              | jak P0                                                              | 75–133                                         |
| 1000 przycisków: `Layerize` przewijania 1× / 4×                           | 27,3 / 142,6 ms                                                     | 27,2 / 136,9 ms                                                     | –                                              |
| 1000 przycisków: 100 wciśniętych naraz, wątek główny / warstwy w szczycie | 324,6 ms / 171                                                      | 327,1 ms / 171                                                      | –                                              |

Zestaw D z TE nadal ma krok 0,32–0,67 px w środku cyklu (DSF 0,67–3), tylko na etykiecie i w pionie, w pierwszej klatce powrotu; `will-change` w czasie przytrzymania go nie usuwa. Próba TK (przytrzymanie jako trwająca animacja z klatką kluczową 1, żeby skala rastra się nie zmieniała) wypadła gorzej (krok końcowy 0,81–2,13 px) i jest odrzucona. Zestaw D nie ma dziś drogi bez przeskoku etykiety przy powrocie.

TE w ruchu rysuje się piksel w piksel jak Pc (stała warstwa, wzorzec bez przeskoku) przy każdym DSF i zoomie, a w spoczynku jest bez warstwy i z ostrym tekstem LCD jak dziś. Warstwa istnieje tylko między `pointerdown` a końcem powrotu. Zostaje jedna różnica wobec Pc: przy DSF z LCD (Windows, DSF < ok. 1,5) etykieta w pierwszej klatce ruchu traci barwną obwódkę LCD (to samo co w T, do 0,42 px przesunięcia środka ciężkości kolorowego tekstu przy DSF 1); TGE (TE + szara etykieta w spoczynku) usuwa i to, kosztem ostrości.

W T ikony mają 0,00 px przy każdym DSF; zostaje tylko etykieta, i to z kolorowym tekstem (`danger`, `accent`, `success`) przy DSF ≤ 1. Z flagą `--disable-lcd-text` T daje 38–40 z 40 identycznych obrazów przy DSF 0,5 / 0,67 / 1 / 1,25, więc reszta T to wyłącznie przełączenie LCD → szary, nie położenie. TG usuwa ją bez flagi.

### Skok w ruchu, prawdziwy DSF (klatka po klatce)

Największy krok między klatkami (px CSS) w całym cyklu spoczynek → wciśnięcie → przytrzymanie → powrót → spoczynek; w nawiasie krok na starcie / na końcu ruchu. Cele „New” `outline`, `solid`, „Crop”; dla wersji „4” kotwice „Project” i „Pan”. „!” = powyżej 0,25 px.

| Kandydatura                   | DSF 0,67            | 1                   | 1,25                | 1,5                 | 1,75                | 2                   | 3                   |
| ----------------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| P0 (dziś, płytka)             | 0,38! (0,15 / 0,16) | 0,14                | 0,21                | 0,04                | 0,07                | 0,04                | 0,03                |
| Pb (skala bez warstwy)        | 1,58! (1,58 / 1,46) | 1,19! (1,19 / 1,00) | 1,13! (1,08 / 1,13) | 0,76! (0,76 / 0,67) | 0,67! (0,67 / 0,57) | 0,16                | 0,15                |
| Pc (stała warstwa, odrzucona) | 0,17                | 0,18                | 0,19                | 0,16                | 0,15                | 0,20                | 0,16                |
| T (W)                         | 0,41! (0,21 / 0,10) | 0,22 (0,22 / 0,10)  | 0,30! (0,30 / 0,22) | 0,21                | 0,21                | 0,16                | 0,15                |
| TG (W)                        | 0,41! (0,21 / 0,02) | 0,17 (0,15 / 0,03)  | 0,17 (0,16 / 0,01)  | 0,21 (0,15 / 0,03)  | 0,21 (0,16 / 0,09)  | 0,16 (0,15 / 0,02)  | 0,15 (0,15 / 0,02)  |
| TG (D)                        | 0,58! (0,35 / 0,02) | 0,24 (0,24 / 0,03)  | 0,25 (0,25 / 0,01)  | 0,67! (0,24 / 0,03) | 0,57! (0,24 / 0,09) | 0,51! (0,23 / 0,02) | 0,33! (0,23 / 0,02) |
| TG4 (W), kotwice              | 0,30! (0,29 / 0,01) | 0,18                | 0,19                | 0,10                | 0,15                | 0,27! (0,27 / 0,04) | 0,09                |
| TG4 (D), kotwice              | 0,40! (0,20 / 0,01) | 0,28!               | 0,25                | 0,69!               | 0,58!               | 0,51!               | 0,31!               |

Odczyt:

- Krok startowy TG (0,15–0,25) jest taki sam jak w Pc, który ma warstwę cały czas i nie może przeskoczyć: to pierwszy krok samego ruchu (50 ms wejścia rozciągnięte do 500 ms daje kilka klatek). Krok końcowy TG ≤ 0,09 px przy każdym DSF; Pb na tym samym końcu 0,57–1,46 px.
- DSF 0,67: wszystkie kandydatury, także P0 (0,38), mają kroki 0,3–0,4 px w trakcie ruchu; 1 piksel urządzenia to tam 1,5 px CSS, a środek ciężkości tekstu przeskalowanego w teksturze drga o ułamek piksela urządzenia. To szum pomiaru przy oddaleniu, nie przełączenie rysowania (test statyczny wyżej: TG identyczne 40 z 40 przy 0,67).
- Zestaw D (0,92): duże kroki leżą w środku cyklu, nie na starcie ani końcu. Seria klatek `solid` przy DSF 1,5: −0,66 px w pionie w klatce, w której kończy się animacja wejścia, i +0,64 px w pierwszej klatce powrotu. Przytrzymany przycisk po końcu animacji traci warstwę i jest rysowany na nowo w skali 0,92 na wątku głównym (glify w innym rozmiarze), a przy powrocie wraca do tekstury z animacji. Przy 0,97 (W) ta różnica zostaje w progu (≤ 0,21). `will-change` w czasie wciśnięcia (TE, niżej) tego nie usuwa: krok zostaje w pierwszej klatce powrotu (0,32–0,67 px); zestaw D nie spełnia progu przy DSF ≥ 1,5.
- WebKit (Playwright, Windows): obraz w warstwie i bez niej jest identyczny już dziś (24 z 24 przy DPR 1 / 1,25 / 1,5 / 2 / 3, także bez transformacji spoczynku); z T i TG też 24 z 24. Pomiar klatek w WebKit nie rozróżnia kandydatur: zrzut trwa dłużej, więc z 500 ms wejścia są 4–5 klatek i kroki samego ruchu mają 0,3–0,6 px w Pb i TG jednakowo. WebKit Playwright na Windows nie jest Safari na macOS (inne wygładzanie); Safari nie mierzone.
- Telefon (390 px, `hasTouch`, DPR 3, dotyk przez CDP): TG największy krok 0,18 px (start 0,18, koniec ≤ 0,01), Pb „Crop” 1,13 px na starcie i 1,12 na końcu.

### Szczypanie (pinch zoom)

Emulacja telefonu (390 px, DPR 3, `isMobile`, `hasTouch`), cele `solid` i „Crop” („New” przy przybliżeniu wypada poza obraz). `Input.synthesizePinchGesture` w trybie headless nie zmienia skali `visualViewport` (sprawdzone odczytem), więc skalę 1,5× ustawia `Emulation.setPageScaleFactor` (ta sama skala strony co po szczypnięciu, bez gestu). Wiarygodna jest tylko identyczność obrazu spoczynek ↔ ruch (oba zrzuty w tym samym kadrze); kroki klatka po klatce wychodzą jednakowe dla wszystkich kandydatur, także Pc (1,09 px na `solid`), więc kadr jest źle odwzorowany i ich nie podaję. Skala 2,5× nie zmierzona (zrzut poza obrazem).

| Kandydatura | `solid`: spoczynek ↔ ruch | „Crop”: spoczynek ↔ ruch |
| ----------- | ------------------------- | ------------------------ |
| Pb          | 0,00 px                   | 1,74 px                  |
| Pc          | identyczne                | identyczne               |
| T, TG, TE   | 0,29 px (nie identyczne)  | 0,35 px (nie identyczne) |

Przy szczypaniu T, TG i TE nie dają obrazu identycznego ze spoczynkiem (0,29–0,35 px), w przeciwieństwie do DSF i zoomu strony; Pc tak. Przyczyny nie badałem (prawdopodobnie raster strony w skali szczypnięcia inny niż raster warstwy animacji). Wynik do potwierdzenia na prawdziwym telefonie.

### Pozostałe kandydatury (emulacja DPR, zestaw W)

Mierzone przed odkryciem różnicy emulacja / prawdziwy DSF, więc liczby przy DPR ≠ 1 są orientacyjne. Research (`tmp/v3/research-press-2026-11-02.md`, pkt 3) przewidywał dla nich przeskok w chwili założenia albo zdjęcia warstwy; pomiar to potwierdza.

| Kandydatura        | Jak działa                                                                       | Skok DPR 1 / 1,25 / 1,5 / 2                                                                   | Stała warstwa                      |
| ------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| E1                 | `will-change` tylko przy `[data-pressing]` (Linear)                              | 1,04 / 1,12 / 1,36 / 1,07 (start)                                                             | nie                                |
| E2                 | warstwa przy `pointerdown`, skala 2 klatki później, zdjęcie po powrocie + 100 ms | 1,04 / 1,01 / 1,34 / 1,00 (w chwili założenia warstwy)                                        | nie                                |
| E3b                | wyrównanie przycisku do pikseli urządzenia (prototyp JS) + Pb                    | 0,17 / 0,89 / 0,74 / 1,01                                                                     | nie                                |
| E3e1, E3e2         | E3 + E1, E3 + E2                                                                 | 0,21 / 0,89 / 0,74 / 1,01; 0,18 / 0,83 / 0,67 / 1,00                                          | nie                                |
| E4                 | warstwa na rodzicu tylko w czasie wciśnięcia                                     | 1,04 / 1,12 / 1,10 / 1,07                                                                     | nie                                |
| E5 (N3 tylko mysz) | `will-change` od najechania                                                      | 0,16 / 0,25 / 0,67 / 0,16 przy wciśnięciu; przeskok przeniesiony na najechanie (nie mierzony) | pod kursorem                       |
| E6                 | E3 + skala na wątku głównym                                                      | 0,17 / 0,91 / 0,75 / 1,00                                                                     | nie (łamie „ruch na kompozytorze”) |
| N2                 | stała warstwa na rodzicu przycisków                                              | 1,15 / 0,96 / 1,44 / 1,12                                                                     | tak                                |
| N1                 | stała warstwa tylko przy `(hover: hover) and (pointer: fine)`                    | na komputerze = Pc; na telefonie = Pb                                                         | tak (komputer)                     |

Wyrównanie do siatki (E3) nie wystarcza: z prawdziwym DSF wyrównanie pudełka przycisku do pikseli urządzenia daje przy 1,25 i 2 różnicę ≤ 0,23 px, ale przy 1,5 ikony nadal 0,67 px, bo przesunięcia wewnątrz przycisku (ramka 1 px = 1,5 piksela urządzenia, padding, przycięcie etykiety `text-box`) zostają ułamkowe; CSS nie wyrazi kroku `1px / DPR` dla wszystkich części (`e3-fix-a`). T i TG nie wyrównują niczego: zmieniają spoczynek tak, żeby przyciągał do siatki tak samo jak ruch, więc działają przy każdym DSF bez odczytu DPR.

### Koszt (prawdziwy DSF, mediana z 3, w nawiasie rozrzut)

Warstwy B7 w spoczynku (`/screens/edges` / `/components` / `/screens/overlays`) i największa liczba warstw w czasie wciśnięcia przycisku na tej stronie:

| Kandydatura | DSF 1 spoczynek | DSF 1,5 spoczynek | w czasie wciśnięcia (DSF 1) | telefon DPR 3 spoczynek |
| ----------- | --------------- | ----------------- | --------------------------- | ----------------------- |
| P0          | 1 / 10 / 1      | 2 / 10 / 1        | 43 / 65 / 7                 | 3 / 10 / 1              |
| Pb          | 1 / 10 / 1      | 2 / 10 / 1        | 43 / 66 / 7                 | –                       |
| T           | 1 / 10 / 1      | 2 / 10 / 1        | 64 / 66 / 7                 | –                       |
| TG          | 1 / 10 / 1      | 2 / 10 / 1        | 64 / 66 / 7                 | 3 / 10 / 1              |
| Pc          | 75 / 133 / 5    | 76 / 133 / 5      | 103 / 172 / 11              | 131 / 133 / 5           |

Szczyt w czasie wciśnięcia to warstwy z nakładania (`Overlap`) wokół animowanego elementu; jest już dziś w P0 (animacja płytki), w T i TG na `/screens/edges` o 21 więcej. Trwa tylko w czasie ruchu.

Przewijanie `/screens/edges` (20 kroków kółka) i wciśnięcie `solid` na `/components`, ms wątku głównego:

| Kandydatura | `Layerize` 1× (DSF 1 / 1,5) | `Layerize` 4× (DSF 1 / 1,5) | wątek główny 4× (DSF 1 / 1,5) | wciśnięcie 4×, wątek główny (DSF 1) |
| ----------- | --------------------------- | --------------------------- | ----------------------------- | ----------------------------------- |
| P0          | 23,9 (±15 %) / 27,5         | 128,5 / 140,7               | 605,9 (±15 %) / 584,6         | 208,0 (±28 %)                       |
| Pb          | 18,5 / 22,3                 | 96,5 / 119,3                | 356,3 / 425,0                 | 133,4                               |
| T           | 31,3 / 32,5                 | 168,5 / 179,7               | 511,9 / 483,2                 | 121,3                               |
| TG          | 38,0 (±19 %) / 35,6         | 222,9 (±15 %) / 199,2       | 651,7 (±15 %) / 505,6         | 142,0                               |
| Pc          | 111,2 / 114,8               | 685,7 / 667,9               | 1025,3 / 1017,7               | 173,4                               |

- Ostrzeżenie o stabilności: P0 i Pb mają w spoczynku identyczny DOM i CSS, a różnią się o 30–70 % (P0 mierzony jako pierwszy w sesji). Różnice między kandydaturami poniżej ok. 40 % są w tym pomiarze nierozstrzygalne; za punkt odniesienia biorę Pb (ta sama sesja, ten sam spoczynek co P0).
- Względem Pb: T ma ok. 1,5–1,75× `Layerize` przy przewijaniu, TG ok. 1,6–2,3×, Pc 5–7×. Przyczyna (wniosek z kodu Chromium, nie pomiar): transformacja inna niż przesunięcie nie daje się złożyć z rodzicem, więc każdy przycisk z `scale: 0.99999` (i każda etykieta z filtrem w TG) to osobny węzeł, który `Layerize` musi rozpatrzyć przy każdej klatce przewijania; bez nowych warstw. Wątek główny jako całość: TG 506–652 ms wobec P0 585–606 i Pb 356–425.
- Telefon (DPR 3, CPU 4×, `/screens/edges`): przewijanie 1× `Layerize` P0 9,8, TG 14,7, Pc 33,6 ms; wciśnięcie 4× wątek główny P0 199,3, TG 235,7, Pc 287,6 ms.
- Ostrość tekstu w spoczynku (średnia barwna obwódka tekstu, 0 = szary): P0 65–87, T 67–87 (bez zmian), TG 0,4 i Pc 0,4 (szary) przy DSF 1 / 1,25 / 1,5.

### Test obciążenia: 1000 przycisków

Kopia `/stress` z 1000 przycisków Tessery wstrzykniętych skryptem (5 wariantów × 5 rozmiarów, co trzeci z ikoną), prawdziwy DSF 1, mediana z 3 (rozrzut ≤ 23 %). Wciśnięcie = `data-pressing` ustawione naraz na N widocznych przyciskach, zdjęte po 300 ms; CPU 4×.

| Metryka                                                                         | P0                        | T                          | TG                         |
| ------------------------------------------------------------------------------- | ------------------------- | -------------------------- | -------------------------- |
| warstwy w spoczynku (pamięć)                                                    | 1 (15,6 MB)               | 1 (15,6 MB)                | 1 (15,6 MB)                |
| przewijanie 1×: `Layerize` / wątek główny / najdłuższa klatka                   | 11,8 / 78,3 / 43,8 ms     | 27,3 / 97,6 / 40,4         | 39,2 / 117,0 / 49,6        |
| przewijanie 4×: `Layerize` / wątek główny / najdłuższa klatka                   | 59,9 / 406,9 / 117,2      | 142,6 / 503,1 / 117,0      | 216,7 / 607,7 / 139,6      |
| 1 wciśnięty: wątek główny / `Layerize` / najdłuższa klatka / warstwy w szczycie | 203,6 / 39,5 / 103,4 / 76 | 221,2 / 61,4 / 198,6 / 76  | 282,8 / 86,4 / 183,6 / 76  |
| 10 naraz                                                                        | 150,0 / 43,6 / 151,4 / 94 | 157,8 / 54,8 / 199,8 / 85  | 216,7 / 81,3 / 199,5 / 85  |
| 100 naraz                                                                       | 299,8 / 53,0 / 99,1 / 270 | 324,6 / 60,4 / 196,6 / 171 | 365,7 / 86,8 / 196,1 / 171 |

- Zero dodatkowych warstw i pamięci w spoczynku w T i TG.
- Przewijanie: `Layerize` T 2,3–2,4× P0, TG 3,3–3,6× P0; wątek główny T +24 %, TG +49 % przy 4×. To jedyny stały koszt T i TG (rośnie z liczbą przycisków w dokumencie).
- Wciśnięcie: wątek główny T +4–9 %, TG +16–44 %; najdłuższa klatka przy 4× ok. 200 ms w T i TG wobec 99–151 ms w P0; w szczycie przy 100 naraz mniej warstw niż P0 (171 wobec 270).

### Koszt stały: próby zdjęcia

Mechanizm pomiaru (dla każdej liczby w tej sekcji): Chromium `chrome-headless-shell` 1248, prawdziwy DSF 1 (`--force-device-scale-factor=1`), `/stress` z 1000 wstrzykniętych przycisków w 50 grupach po 20 (5 wariantów × 5 rozmiarów, co trzeci z ikoną), 20 kroków kółka po 150 px co 50 ms, ślad CDP (`Layerize`, `RunTask` wątku głównego, najdłuższe zadanie), 9 przebiegów na kandydaturę **na przemian** (P0, TE, …, potem odwrotnie), mediana i [min–max]. „Kursor na treści” = kursor stoi nad przyciskami w czasie przewijania (pod nim zmienia się hover), „kursor poza” = kursor w rogu strony. „Rozłączne” = przedziały min–max kandydatury i P0 nie nachodzą na siebie. Identyczność i skok: jak w części A, prawdziwy DSF 1 / 1,25 / 1,5 / 2.

| Wariant                                                                                      | `Layerize` 1×                     | wątek główny 1×       | `Layerize` 4×          | wątek główny 4×        | najdłuższe zadanie 4× | kursor poza, 4×: `Layerize` / wątek główny | spoczynek ↔ ruch                              | skok DSF 1 / 1,25 / 1,5 / 2 |
| -------------------------------------------------------------------------------------------- | --------------------------------- | --------------------- | ---------------------- | ---------------------- | --------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------- |
| P0                                                                                           | 16,7 [15,6–17,2]                  | 61,9 [59,8–64,5]      | 87,5 [81,4–91,4]       | 305,5 [287,1–332,8]    | 18,9 [16,9–22,4]      | 0,2 / 135,3                                | –                                             | 0,14 / 0,21 / 0,04 / 0,04   |
| TE                                                                                           | 39,3 [37,2–41,4] ×2,36, rozłączne | 90,4 ×1,46, rozłączne | 206,2 ×2,36, rozłączne | 473,1 ×1,55, rozłączne | 28,6 ×1,51            | 0,2 (jak P0) / 174,5 ×1,29                 | geometria identyczna, etykieta LCD do 0,42 px | 0,21 / 0,24 / 0,20 / 0,16   |
| a) `transform: scale(0.99999)`                                                               | 39,3 ×2,36                        | 91,1 ×1,47            | 206,3 ×2,36            | 469,8 ×1,54            | 29,0 ×1,53            | 0,2 / 176,7                                | jak TE                                        | 0,21 / 0,24 / 0,20 / 0,16   |
| b) + `contain: paint`                                                                        | 42,8 ×2,57                        | 98,0 ×1,58            | 228,6 ×2,61            | 503,3 ×1,65            | 33,1 ×1,75            | 0,4 / 125,2                                | jak TE                                        | jak TE                      |
| b) + `contain: layout paint`                                                                 | 42,3 ×2,54                        | 97,0 ×1,57            | 227,5 ×2,60            | 493,9 ×1,62            | 30,5 ×1,61            | 0,2 / 118,2                                | jak TE                                        | jak TE                      |
| c) TE + `content-visibility: auto` na grupach (**zmiana po stronie aplikacji**)              | 80,7 ×4,84                        | 184,5 ×2,98           | 347,7 ×3,98            | 684,1 ×2,24            | 35,0 ×1,85            | 172,7 / 440,3                              | –                                             | –                           |
| c) samo `content-visibility: auto` bez TE (odniesienie)                                      | 47,9 ×2,87                        | 144,6 ×2,33           | 207,3 ×2,37            | 544,2 ×1,78            | 25,9 ×1,37            | 109,7 / 396,8                              | –                                             | –                           |
| d) skala spoczynkowa tylko w rodzicu pod kursorem (`:has(> …):hover`)                        | 24,8 ×1,49                        | 98,2 ×1,59            | 130,0 ×1,49            | 498,2 ×1,63            | 29,0 ×1,53            | 0,2 / 124,1                                | jak TE (w strefie)                            | 0,21 / 0,25 / 0,20 / 0,16   |
| e) skala spoczynkowa tylko blisko okna (`IntersectionObserver`, margines 50 %), osobna sesja | 70,7 ×4,23                        | 206,9 ×3,31           | 372,0 ×4,38            | 1114,0 ×3,74           | 42,3 ×2,34            | 200,8 / 861,6                              | –                                             | –                           |

W sesji e) P0 i TE powtórzyły się w granicach 2 % (P0 16,7 / 297,8 ms, TE 39,1 / 457,9 ms), więc pomiar jest stabilny.

- **Koszt jest prawdziwy, nie szum.** Przy 9 przebiegach na przemian przedziały TE i P0 są rozłączne we wszystkich miarach z kursorem na treści; wynik powtórzył się w dwóch sesjach. Wcześniejsze zastrzeżenie („różnice < 40 % nierozstrzygalne”) dotyczyło pomiaru bez przeplatania.
- **Kiedy powstaje.** Z kursorem poza treścią `Layerize` w czasie przewijania wynosi 0,2–0,4 ms w P0 i w TE: samo przewijanie nie layerizuje. Koszt pojawia się, gdy w czasie przewijania coś maluje się na nowo (tu hover pod nieruchomym kursorem), i rośnie z liczbą przycisków z transformacją w całym dokumencie. Z kursorem poza treścią zostaje +29 % wątku głównego (przyczyny nie ustaliłem). Wniosek z kodu Chromium, niezmierzony: każda skala inna niż 1 to osobny węzeł transformacji, którego kawałków malowania nie da się złączyć z rodzicem, więc każda aktualizacja warstw rozpatruje 1000 osobnych grup zamiast jednej.
- **a)** `transform` zamiast `scale`: ten sam koszt (ten sam rodzaj węzła). **b)** `contain`: drożej o 8–11 % i zmienia wygląd spoczynku (płytka `::before` z `inset: −1px` przycięta: 540–1405 zmienionych pikseli na przycisk wobec P0, przy samym T 310–693). `isolation: isolate` przepis `control` ma już dziś, więc tej próby nie było. **c)** `content-visibility`: dużo drożej (przy przewijaniu grupy wchodzą i wychodzą z renderowania, `Layerize` także z kursorem poza treścią); odrzucone. **d)** strefa pod kursorem: `Layerize` 1,49× zamiast 2,36×, ale wątek główny i malowanie jak TE albo gorzej (+79 % `Paint`), a wejście kursora do grupy przesuwa nieruchome sąsiednie przyciski: 22 z 40 o więcej niż 0,25 px (do 1,00 px) przy DSF 1, 10–17 z 40 przy 1,25–1,5 (dla porównania bez strefy 40 z 40 identycznych); odrzucone zgodnie z warunkiem z polecenia. **e)** `IntersectionObserver`: przełączanie atrybutu w czasie przewijania kosztuje 3–4× więcej; odrzucone.
- **Spoczynek T wobec dzisiejszego.** Transformacja spoczynkowa sama zmienia przyciąganie do siatki w spoczynku: 13 z 40 przycisków przy DSF 1 rysuje się identycznie jak dziś, reszta przesunięta jednorazowo o ułamek piksela (do 1,00 px przy DSF 1, 0,50 przy 1,25, 0,67 przy 1,5, 0,35 przy 2). To zmiana stała, nie ruch; widać ją tylko przy porównaniu z dzisiejszym zrzutem.
- **Szczypanie 2,5×: nie da się zmierzyć w headless.** Zrzut CDP całego okna na emulacji telefonu (DPR 3) wychodzi w rozmiarze 390 × 844 (px CSS, przeskalowany), a zrzut z `clip` i `scale` kasuje skalę strony (`visualViewport.scale` wraca do 1). Potrzebny prawdziwy telefon albo Chrome z oknem i ekranem dotykowym.

Żadna z prób a)–e) nie zdejmuje kosztu bez złamania innego warunku. Bez zmiany w Chromium TE ma stały koszt przy przewijaniu z kursorem nad treścią: na 1000 przycisków `Layerize` ok. 2,4×, wątek główny +46–55 %, najdłuższe zadanie +51 %; bez nowych warstw i pamięci.

### Kotwice (O5 b) i popup w czasie wciśnięcia

Prostokąt popupu menu („Project”) i tooltipa („Pan”) w każdej klatce od wciśnięcia do 700 ms po puszczeniu (DSF 1,5):

| Wariant                                                        | Chromium: menu x / y      | WebKit: menu x / y | tooltip                                     |
| -------------------------------------------------------------- | ------------------------- | ------------------ | ------------------------------------------- |
| P0                                                             | 0,00 / 0,00               | 0,00 / 0,00        | 0,00                                        |
| TG4 W i D (kotwica stoi, skalują się sloty i płytka)           | 0,00 / 0,00               | 0,00 / 0,00        | 0,00                                        |
| skala samej kotwicy (zabronione przez D-W2, odniesienie) W / D | 0,67 / 0,67 i 2,67 / 1,33 | to samo            | 0,00 (tooltip zamknięty przy `pointerdown`) |

Czy T może stać na samej kotwicy (`scale: 0.99999` w spoczynku na triggerze menu i przycisku z tooltipem, prawdziwy DSF), porównanie z P0:

| DSF                          | prostokąt kotwicy (szer. × wys.) P0 → T                                    | `--anchor-width`         | położenie popupu P0 → T                                      | ruch popupu w klatkach (T) |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ | -------------------------- |
| 1                            | menu 75,8125 × 28 → 75,8117 × 27,9997; tooltip 28 × 28 → 27,9997 × 27,9997 | bez zmian (76 px, 28 px) | menu bez zmian; **tooltip y −1,00 px**                       | 0,000                      |
| 1,25                         | menu −0,0008 / −0,0003 px                                                  | bez zmian                | bez zmian                                                    | 0,000                      |
| 1,5                          | menu −0,0007 / −0,0002 px                                                  | bez zmian                | **menu y −0,67 px (1 piksel urządzenia)**; tooltip bez zmian | 0,000                      |
| zoom strony 90 / 110 / 125 % | –                                                                          | bez zmian                | menu i tooltip bez zmian (0,000)                             | 0,000                      |

Niewidoczna skala zmniejsza prostokąt kotwicy o ok. 0,0003–0,0008 px, a Floating UI zaokrągla położenie popupu do piksela urządzenia; gdy dolna krawędź kotwicy leży na granicy zaokrąglenia (435,5 + 28 = 463,5), popup przeskakuje o 1 piksel urządzenia w górę. Popup stoi (0 px ruchu w klatkach), ale jego położenie różni się od dzisiejszego o 1 piksel urządzenia w 2 z 6 przypadków. Wniosek: T nie powinno stać na samej kotwicy; dla kotwic droga TG4/T4 (transformacja na slotach i płytce, kotwica bez transformacji) daje 0,00 px różnicy popupu (tabela wyżej).

### T i TG wobec Pc (stała warstwa, wzorzec „bez przeskoku”)

Te same przyciski („New”, `solid`, „Crop”) w trzech kandydaturach, zrzut w spoczynku i w połowie wciśnięcia (animacja zatrzymana w połowie czasu), prawdziwy DSF; liczba pikseli różniących się o > 24 poziomy i przesunięcie środka ciężkości etykiety lub ikon (px CSS), największe z trzech przycisków:

| DSF  | T vs Pc spoczynek | T vs Pc połowa wciśnięcia | TG vs Pc spoczynek | TG vs Pc połowa wciśnięcia |
| ---- | ----------------- | ------------------------- | ------------------ | -------------------------- |
| 1    | 115–167 px / 0,10 | 73–197 px / 0,13          | **0 px** / 0,00    | 73–197 px / 0,13           |
| 1,25 | 143–226 px / 0,23 | 84–223 px / 0,13          | **0 px** / 0,00    | 84–223 px / 0,13           |
| 1,5  | 217–255 px / 0,06 | 117–357 px / 0,20         | 2–26 px / 0,06     | 117–357 px / 0,20          |
| 2    | 253–321 px / 0,05 | 247–493 px / 0,12         | 0–5 px / 0,00      | 247–493 px / 0,12          |
| 3    | 352–482 px / 0,01 | 402–510 px / 0,11         | 0–13 px / 0,00     | 402–510 px / 0,11          |

- Spoczynek: TG rysuje się jak Pc piksel w piksel (bez warstwy); T różni się od Pc tylko wygładzaniem (LCD zamiast szarego), położenie ≤ 0,23 px.
- Połowa wciśnięcia: T i TG różnią się od Pc identycznie (te same liczby pikseli, więc w ruchu rysują się tak samo), a od Pc różnią się wygładzaniem tekstury (Pc ma teksturę z chwili założenia `will-change`, T i TG teksturę animacji); położenie ≤ 0,20 px.

### Lista rozwijana nad triggerem (druga reguła siatki): nierozwiązane

Prototyp `out/select-proto.html` (trigger „Medium” `outline`, lista z pozycją „Medium” ustawioną tak, by jej tekst padł na tekst triggera; ten sam krój i rozmiar), przesunięcie środka ciężkości tekstu przed otwarciem i po (px CSS), prawdziwy DSF:

| Pozycjonowanie                                                  | 0,67      | 0,8  | 0,9  | 1    | 1,1  | 1,25 | 1,5  | 1,75 | 2    | 2,5  | 3    |
| --------------------------------------------------------------- | --------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| `translate` zaokrąglony do piksela urządzenia (jak Floating UI) | 1,55      | 0,46 | 0,72 | 0,13 | 1,02 | 0,18 | 0,54 | 0,14 | 0,48 | 0,62 | 0,09 |
| `left`/`top` dokładne (ułamek jak trigger)                      | 0,41      | 0,60 | 0,39 | 0,28 | 0,66 | 0,34 | 0,37 | 0,14 | 0,19 | 0,38 | 0,22 |
| dokładne + otwarcie z `scale`/`opacity`                         | jak wyżej |      |      |      |      |      |      |      |      |      |      |
| dokładne + `scale: 0.99999` na etykiecie triggera i na liście   | 1,58      | 0,81 | 1,33 | 1,02 | 1,20 | 0,08 | 0,54 | 0,01 | 0,12 | 0,51 | 0,07 |

Żaden wariant nie trzyma 0,25 px przy wszystkich DSF. Najbliżej jest pozycja dokładna (bez zaokrąglania), ale reszta 0,3–0,66 px jest prawie wyłącznie pozioma, co wskazuje na tekst LCD na dwóch różnych tłach i różne położenie glifów w wierszu; nie sprawdzono wersji z szarym tekstem na obu elementach (filtr jak w TG) ani prawdziwego Base UI `Select` z `alignItemWithTrigger` (laboratorium nie ma jeszcze `Select`).

## B. Hover z wyjściem (O2)

Techniki wstrzyknięte na `/stress` (zamontowana scena, 300 przycisków i 500 wierszy-przycisków), CPU 4×, DPR 1, 5 przebiegów na przemian w jednej sesji, mediana; T2 liczony jak w `apps/docs/perf/stress.perf.ts` (czas zadań wątku głównego od ruchu kursora do końca animacji, minus bieg jałowy). H1 = `transition: background-color` na płytce `::before`; H2 = zarejestrowana `@property --_step` z przejściem (spoczynkowe `--_wash` przestawione na atrament, żeby wyjście nie gasło w jednej klatce; zmienia spoczynek wariantów z kolorem, tylko do pomiaru kosztu); H3 = nakładka `::after` z przejściem `opacity`.

| Technika                | T2 hover, 10 przycisków | T2 hover, 20 wierszy (500 w DOM) | warstwy przy przejeździe po 20 wierszach | `Paint` / `Layerize` na klatkę przejazdu |
| ----------------------- | ----------------------- | -------------------------------- | ---------------------------------------- | ---------------------------------------- |
| P0 dziś (bez przejścia) | 17,1 ms (±12 %)         | 9,9 (±38 %)                      | 1                                        | 2,5 / 1,7 ms                             |
| H1 (W: 100 / 150 ms)    | 70,8 (±17 %)            | 49,7 (±15 %)                     | 1                                        | 2,5 / 1,2                                |
| H1 (D: 100 / 100 ms)    | 46,4 (±14 %)            | 32,0 (±21 %)                     | 1                                        | 2,6 / 1,2                                |
| H2 (W)                  | 104,6 (±16 %)           | 73,6 (±10 %)                     | 1                                        | 2,7 / 1,4                                |
| H3 (W)                  | 79,1 (±17 %)            | 45,0 (±17 %)                     | 9                                        | 2,0 / 2,1                                |

- Każda technika z wyjściem kosztuje wielokrotność P0 (cel T2 = 4 ms; P0 już go przekracza): najtańsza jest H1 z krótszym wyjściem (D), 2,7× P0 dla przycisków; H1 (W) 4,1×, H3 4,6× i 9 warstw, H2 6,1×. Koszt rośnie z liczbą klatek przejścia, bo `background-color` i zmienna maluje płytkę w każdej klatce (nazwany wyjątek B2), a nakładka H3 promuje warstwy.
- Chromium i WebKit: H1, H2 i H3 animują wejście i wyjście (wartość pośrednia w połowie przejścia), P0 przełącza w jednej klatce. W WebKit H3 w pierwszym odczycie spoczynku miała krycie 0,07 (przejście startowe po wstrzyknięciu stylu).
- Rozrzut wierszy P0 38 % (powyżej progu 20 %); pozostałe ≤ 21 %.

## C. Mechanizm wciśnięcia (O3)

Prototypy: M-a jeden nasłuch na `document` (jak `installGlobalPressFeedback` z desktopu + Space trzyma do `keyup`, Enter błyska na czas najkrótszego trzymania 100 ms, zjazd poza prostokąt sprzed skali puszcza, powrót wciska), M-b obecne `pressable`, M-c sam CSS `:active:hover`. Przycisk `solid`, skala jak Pb (W).

| Sprawdzenie                                                 | M-a Chromium / WebKit | M-b Chromium / WebKit       | M-c Chromium / WebKit  |
| ----------------------------------------------------------- | --------------------- | --------------------------- | ---------------------- |
| przytrzymanie myszą                                         | tak / tak             | tak / tak                   | tak / tak              |
| szybki klik (down + up bez przerwy): klatki ze skalą        | 16 / 18               | 16 / 18                     | 0 / 0                  |
| zjazd z wciśniętego: puszcza / powrót: wciska               | tak, tak / tak, tak   | **nie**, tak / **nie**, tak | tak, tak / tak, tak    |
| kursor 1 px od krawędzi, trzymanie z drganiem: przełączenia | 0 / 0                 | 0 / 0                       | 0 / 0                  |
| Space trzyma do `keyup`                                     | tak / tak             | **nie** / **nie**           | **nie** / **nie**      |
| Enter błyska (klatki ze skalą)                              | 15 / 18               | 0 / 0                       | 0 / 0                  |
| dotyk: stuknięcie (klatki ze skalą)                         | 15 / 19               | 15 / 18                     | 19 / **0**             |
| dotyk: przytrzymanie 300 ms                                 | tak / nie mierzone    | tak / nie mierzone          | **nie** / nie mierzone |
| wyłączony i `aria-busy`: skala                              | brak / brak           | brak / brak                 | brak / brak            |
| commity Reacta (B3) na hover / wciśnięcie                   | 0 / 0                 | 0 / 0                       | 0 / 0                  |

Tylko M-a spełnia D-W4 (Space, Enter, zjazd i powrót) w obu silnikach. Uwaga do wiersza „wyłączony”: atrybut `data-pressing` ustawia też dzisiejsze `pressable` na wyłączonym przycisku; skali nie ma, bo wyklucza ją CSS. WebKit w Playwright nie ma przytrzymania dotykiem, tylko stuknięcie.

## Decyzja właściciela 02.11

- **Wybrano:** TE dla grupy „skala” (cały element: płytka, tekst, ikony), TE4 dla kotwic (kotwica stoi, skalują się jej sloty i płytka), zestaw W (0,97, wciśnięcie 50 ms, powrót 224 ms), mechanizm M-a (jeden nasłuch na dokumencie). Decyduje właściciel.
- **Dlaczego:** jedyna zmierzona droga, która skaluje cały przycisk bez przeskoku geometrii, bez stałej warstwy i z ruchem na kompozytorze; w ruchu piksel w piksel jak (c). Właściciel ocenił stronę porównawczą na telefonie („nie widać, wszystko wygląda okej”) i przyjął koszt: „najwyżej będzie to poprawić”.
- **Przyjęty koszt:** przewijanie przez 1000 przycisków z kursorem nad treścią: `Layerize` 2,36×, wątek główny +46 % (1×) i +55 % (4×); zmiana wygładzania etykiety w pierwszej klatce ruchu (do 0,42 px przy DSF 1). Odstępstwo od D-W5 („zero stałego kosztu”) zatwierdzone przez właściciela.
- **Odrzucone:** P0 (płytka; treść się nie skaluje), Pc (75–133 stałe warstwy), T (w ruchu inny obraz niż Pc), TG (szary tekst w spoczynku, `Layerize` 2–3,6×), zestaw D (przeskok etykiety przy powrocie), próby zdjęcia kosztu a–e (sekcja „Koszt stały: próby zdjęcia”).
- **Otwarte:** ocena na monitorze właściciela z ClearType (DSF 1–1,5, zoom Ctrl ±); szczypanie 2,5×; lista rozwijana nad triggerem (przy elemencie Select); hover z wyjściem (osobna jednostka).
- **Dowód:** strona porównawcza https://claude.ai/artifact/GJYuViAjYmoLJYbadozvEY (TE, Pc, T, TG, P0).

## Wnioski i rekomendacja techniczna

Ocena właściciela na żywo (02.11, przekazana przez prowadzącego): T i TG wyglądają poprawnie; rekomendowane T (szybsze, ostry tekst). Niżej liczby, na których ta ocena może się oprzeć, i to, czego T nie spełnia.

**Spełnione przez T (zestaw W):**

- Ruch na kompozytorze, bez JS w klatce: przejście `scale` od 0,99999 do 0,97 i z powrotem.
- Brak przeskoku geometrii: ikony 0,00 px różnicy spoczynek ↔ ruch przy każdym DSF 0,5–3 (40 przycisków); w ruchu największy krok 0,15–0,30 px, przy czym krok na końcu ≤ 0,22 px, na starcie 0,15–0,30 px (DSF 1,25: 0,30, jedyna wartość ponad próg; TG w tym samym miejscu 0,16).
- Zero warstw i pamięci ponad P0 w spoczynku (`/screens/edges`, `/components`, `/screens/overlays`, telefon, 1000 przycisków).
- Tekst w spoczynku ostry jak dziś (LCD 67–87, P0 65–87).
- WebKit: obraz spoczynku i ruchu identyczny (24 z 24).

**Niespełnione albo kosztowne w T:**

- Etykieta zmienia wygładzanie LCD → szary w chwili startu ruchu i z powrotem na końcu: przesunięcie środka ciężkości do 0,42 px (DSF 1, kolorowy tekst) i do 0,58 px (DSF 0,5); ikony bez zmian. Tego nie da się usunąć przy ruchu na kompozytorze (kompozytor nie rysuje LCD w animacji transformacji); usuwa to TG kosztem szarego tekstu w spoczynku.
- Stały koszt przewijania (potwierdzony 9 przebiegami na przemian, przedziały rozłączne, dwie sesje): przy 1000 przycisków i kursorze nad treścią `Layerize` 2,36×, wątek główny +46 % (1×) i +55 % (4×), najdłuższe zadanie +51 %. Pojawia się tylko, gdy w czasie przewijania coś się maluje na nowo (z kursorem poza treścią `Layerize` jak P0, wątek główny +29 %). Bez nowych warstw, ale łamie „zero stałego kosztu” i kryterium D-W5. Próby zdjęcia (`transform`, `contain`, `content-visibility`, strefa pod kursorem, `IntersectionObserver`) nie pomogły albo łamią inny warunek (sekcja „Koszt stały: próby zdjęcia”).
- Kotwice: `scale: 0.99999` na samej kotwicy przesuwa popup o 1 piksel urządzenia w 2 z 6 przypadków (zaokrąglenie Floating UI); dla kotwic potrzebna wersja T4/TG4 (transformacja slotów i płytki).
- Zestaw D (0,92 + krycie 0,82): krok etykiety 0,32–0,67 px w pierwszej klatce powrotu (T, TG, TE); próba TK gorsza; dziś bez rozwiązania.
- Przy zoomie strony T ma w pierwszych klatkach ruchu nieregularne kroki do 0,54 px (tekstura animacji zmienia się w trakcie ruchu); TE to usuwa (połowa wciśnięcia = Pc, 0 pikseli różnicy).
- Szczypanie 1,5×: T, TG i TE nie identyczne ze spoczynkiem (0,29–0,35 px), Pc tak; pomiar przez `setPageScaleFactor`, nie gestem, i tylko 1,5×.

**Rekomendacja techniczna (z liczbami):** TE (= T + `will-change: scale` tylko w czasie `[data-pressing]`) dla grupy „skala” i jego wersja „4” dla kotwic (transformacja slotów i płytki, kotwica stoi), zestaw W. Uzasadnienie: spoczynek bez warstwy i z ostrym tekstem jak dziś (zero warstw ponad P0 na trzech stronach, telefonie i przy 1000 przycisków), a ruch rysowany piksel w piksel jak Pc, który z definicji nie przeskakuje (0 pikseli różnicy w połowie wciśnięcia przy DSF 1–3 i zoomie 67–150 %); granica spoczynek ↔ ruch identyczna geometrycznie przy każdym DSF 0,5–3 i każdym zoomie 50–200 % (ikony 0,00 px). Zostaje świadomy koszt: (1) przy DSF z LCD etykieta traci barwną obwódkę w pierwszej klatce ruchu (do 0,42 px przesunięcia środka ciężkości kolorowego tekstu przy DSF 1; TGE usuwa to kosztem szarego tekstu w spoczynku), (2) stały koszt przewijania przy kursorze nad treścią: na 1000 przycisków `Layerize` 2,36×, wątek główny +46–55 % (to łamie „zero stałego kosztu”; żadna z pięciu prób go nie zdjęła), (3) warstwa na wciśnięty przycisk na czas ruchu, (4) spoczynek rysowany jednorazowo inaczej niż dziś (do 1 px przy DSF 1, stała zmiana, nie ruch), (5) szczypanie niemierzalne w headless, zestaw D nierozwiązany. Właściciel wybiera między TE z tym kosztem a P0 (płytka, bez kosztu, treść się nie skaluje); trzeciej drogi spełniającej wszystkie warunki pomiary nie znalazły. T bez `will-change` ma te same zalety w spoczynku, ale w ruchu przy zoomie strony nieregularne kroki do 0,54 px. TG/TGE dają jedyny obraz spoczynku identyczny z ruchem także przy LCD, kosztem szarego tekstu etykiet i 2–3,6× `Layerize`. Pc odrzucone (75–133 warstwy, 5–7× `Layerize`). Wybór i zgoda na koszt `Layerize` należą do właściciela.

**Co zmienić w silniku i przepisie, żeby działało globalnie (do planu fazy 2, nie wdrożone):**

- Silnik `motion`: wyjście spoczynkowej skali (np. `--ts-motion-press-rest: 0.99999`; w `off` i `prefers-reduced-motion` `1`), czasy i krzywe wejścia i powrotu z O6.
- Przepis `control`: grupa „skala” ma `scale: var(--ts-motion-press-rest)` w spoczynku, `scale: var(--ts-motion-press-scale)` i `will-change: scale` przy `[data-pressing]`, przejście `scale` na elemencie; płytka `::before` przestaje się skalować.
- Konflikt do rozstrzygnięcia przez właściciela: `AGENTS.md` (sekcja „Wydajność i ruch”, reguła wciśnięcia na płytce `::before`, „pudełko kontrolki i jej treść stoją”) i spec W8/W20 mówią dziś co innego niż D-W1 i ta rekomendacja dla zwykłych przycisków; dla kotwic obie zgadzają się, że kotwica stoi. Kotwice (`[data-anchor]`): ta sama para wartości na `> [data-slot]` i `::before`, kotwica bez transformacji. Przy TG dodatkowo filtr bez skutku na `[data-slot='label']` (nazwany wyjątek: `filter` nie jest ruchem).
- Mechanizm: M-a (jeden nasłuch na dokumencie) — jedyny spełnia D-W4 w Chromium i WebKit.
- Strażnik: obraz przycisku z wymuszonym `will-change` = obraz w spoczynku (ten sam test co `static.ts`), przy DSF 1 / 1,25 / 1,5 / 2 z prawdziwym `--force-device-scale-factor`, nie z emulacją Playwright.

## Ograniczenia pomiaru

- Headless bez sprzętowego GPU; na ekranie z GPU raster tekstu i warstw może się różnić. Monitor i ClearType właściciela nie są odtworzone.
- Zoom strony mierzony w pełnym Chromium headless, w którym tekst najpewniej nie jest rysowany z LCD (T i TG wychodzą tam identycznie); różnicę wygładzania T przy zoomie strony na ekranie właściciela pokazują tylko tabele DSF.
- Pierwsze liczby kosztu (bez przeplatania, mediana z 3) miały rozrzut do ±28 % i do 70 % między P0 a Pb o tym samym spoczynku; dla tamtych tabel różnice < 40 % są nierozstrzygalne. Koszt TE rozstrzyga pomiar z 9 przebiegami na przemian (sekcja „Koszt stały: próby zdjęcia”), z rozrzutem (min–max wokół mediany) zwykle ±2–8 %, najwięcej ±20 % (`contain: paint`, `Layerize` 4×).
- Szczypanie w headless niemierzalne (zrzut przeskalowany albo kasujący skalę strony); wynik 1,5× z wcześniejszej tabeli traktować jako orientacyjny.
- WebKit to build Playwright na Windows, nie Safari.
- Zestaw D: krok etykiety przy powrocie nierozwiązany; TGE, TGH (tekst szary tylko pod kursorem) i TE4/TGE4 dla kotwic przygotowane w harnessie, niezmierzone.
- Kandydatury E1–E6, N1, N2 tylko z emulacją DPR.
- Szczypanie tylko 1,5×, przez `setPageScaleFactor` (gest w headless nie działa); kroki klatka po klatce przy szczypaniu nieczytelne (kadr), podana tylko identyczność.
- Koszt TE z testu obciążenia mierzony w osobnej sesji niż P0, T i TG.
