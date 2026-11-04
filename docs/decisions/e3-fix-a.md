---
kind: decision
date: 2026-11-02
stage: E3, pakiet poprawek A (R1, R2, R4, R5, R8, R9 drugiej oceny właściciela)
---

# Pakiet poprawek A: wciśnięcie, overflow, hover, przyciski

Kto: wykonawca pakietu A na zlecenie prowadzącego, 2026-11-02. Rozstrzygnięcia właściciela: `e3-owner-review-2026-11-01.md` (R1–R12). Plansze i surowe pomiary: scratchpad sesji, katalog `fix-a/` (`index.html`).

## R1: wciśnięcie całego przycisku — nierozstrzygnięte, do właściciela

Pomiar: środek ciężkości pikseli etykiety i ikon klatka po klatce (Chromium, przejście spowolnione 10×, „New” outline, „solid”, „Crop”, jasny i ciemny), próg skoku 0,25 px między klatkami; warstwy B7 z `LayerTree` CDP.

| Droga                                           | Warstwy w spoczynku (overlays / edges / components) | Największy skok (DPR 1 / 1,5 / 2)                        |
| ----------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| płytka `::before` (stan dziś)                   | 1 / 2 / 10                                          | 0 (treść stoi)                                           |
| skala na elemencie, bez `will-change`           | 1 / 2 / 10                                          | 1,07 / 1,06 / 1,06 px, start i koniec                    |
| stała `will-change: scale` (v2)                 | 55 / 235 / 318 (budżet 12)                          | 0,12 / 0,67 / 0,15 px; tekst w spoczynku traci subpiksel |
| `will-change` przy `:hover` i `[data-pressing]` | +1 przy najechaniu                                  | 1,0 px przy samym najechaniu i po szybkim zjechaniu      |
| skala w wątku głównym (`@property`)             | 1 / 2 / 10                                          | 1,07 px na starcie                                       |
| kompensacja ułamka piksela + kompozytor (g)     | 1 / 2 / 10                                          | 0,60 / 1,27 / 1,09 px                                    |
| kompensacja ułamka piksela + wątek główny (h)   | 1 / 2 / 10                                          | 0,60 px (DPR 1)                                          |

Przyczyna: w spoczynku Chromium przyciąga do siatki pikseli każdą część treści osobno (ikona SVG z własnym ułamkiem pozycji, tekst z pozycją subpikselową), a każde przekształcenie (warstwa kompozytora albo wątek główny) rysuje treść w prawdziwym położeniu. Jedno przesunięcie całego przycisku nie wyrówna dwóch ikon z różnym ułamkiem (po kompensacji ikona startowa skacze o +0,53 px, końcowa o −0,60 px). Warstwa kompozytora zmienia też wygładzanie tekstu z subpikselowego na szare. Żadna droga nie spełnia jednocześnie B7 i warunku „bez przeskoku”; decyzję podejmuje właściciel na podstawie tej tabeli i plansz. Do tego czasu zostaje płytka `::before`.

### Pomiary 02.11 (druga runda, bez zmiany kodu; decyzja właściciela wstrzymana)

Warianty wstrzyknięte CSS-em na build `f56073c`: (b) skala całego zwykłego przycisku bez warstwy, przejście jak v2 (wejście 50 ms, wyjście 224 ms); (c) to samo ze stałym `will-change: scale` tylko przy `(hover: hover) and (pointer: fine)`; (d) stała skala 0,99999 w spoczynku i wciśnięcie przez zarejestrowaną zmienną `@property` (wątek główny, bez warstwy). Skaluje się tylko samodzielny przycisk (bez triggerów, opcji, segmentów `joined`/`track`). Cele: „New” outline, „solid”, jasny i ciemny.

| Wariant                                             | Skok DPR 1 / 1,25 / 1,5 / 2                                                     | Tekst w spoczynku (średnia barwna obwódka, 0 = szary) | Warstwy w spoczynku edges / components / overlays (DPR 1,5) | `Layerize` przy przewijaniu `/screens/edges` CPU 1× / 4× | Wciśnięcie CPU 4×: wątek główny / `Layerize` |
| --------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| dziś (płytka)                                       | 0 (treść stoi)                                                                  | 30–42 (subpiksel)                                     | 2 / 10 / 1                                                  | 19 / 104 ms                                              | 101 / 24 ms                                  |
| (b)                                                 | 1,11 / 1,13 / 1,10 / 1,10 px (start i koniec)                                   | 30–42                                                 | 2 / 10 / 1                                                  | 24 / 141 ms                                              | 112 / 24 ms                                  |
| (c) desktop                                         | 0,18 / 0,20 / 0,67 / 0,16 px (DPR 1,5: etykieta o 1 piksel urządzenia na końcu) | 2,5–3 (szary na stałe)                                | 74 / 115 / 20                                               | 87 / 504 ms                                              | 138 / 46 ms                                  |
| (c) dotyk (telefon 390 px, `hasTouch`)              | jak (b)                                                                         | jak dziś                                              | 3 / 10 / 1                                                  | jak dziś                                                 | jak dziś                                     |
| (d)                                                 | 1,00 / 1,02 / 1,00 / 1,00 px (ikona końcowa na końcu powrotu)                   | 30–43 (subpiksel)                                     | 2 / 10 / 1                                                  | 29 / 151 ms                                              | 232 / 94 ms                                  |
| (b) telefon DPR 3                                   | 0,24 px                                                                         | –                                                     | –                                                           | –                                                        | –                                            |
| (b) / (d) z przyciskiem na całym pikselu urządzenia | (b) 0,26 / 0,61 / 0,69 px; (d) 0,22 / 0,67 / 0,67 px (DPR 1 / 1,25 / 1,5)       | –                                                     | –                                                           | –                                                        | –                                            |

- Najdłuższa klatka przewijania w headless wynosi ok. 67 ms we wszystkich wariantach, także dziś (przerwy między krokami kółka), więc nie rozróżnia wariantów; rozróżniają je praca wątku głównego i `Layerize`: (c) daje 3,5–4,5× więcej `Layerize` przy przewijaniu `/screens/edges` (kryterium prowadzącego: wyraźny koszt na desktopie). Pamięć warstw (szacunek szer. × wys. × DPR² × 4 B): 106 wobec 104 MB.
- Wątek główny zablokowany na 50 ms w trakcie powrotu: odczyt w `requestAnimationFrame` stoi 51 ms we wszystkich wariantach; w (d) animacja jest liczona tylko na wątku głównym, więc na ekranie staje na ten czas, w (b) i (c) biegnie w kompozytorze.
- WebKit: (d) działa (zmienna `@property` animuje skalę 0,99999 → 0,97 → 1), (b) też.
- Ostrość obrysu w spoczynku („New”, zrzut 4×): przy DPR 1 górna i dolna krawędź to jeden rząd we wszystkich wariantach, w (d) o 1–2 poziomy jaśniejsza; przy DPR 1,25 i 1,5 krawędź 1 px zajmuje dwa rzędy urządzenia w każdym wariancie.
- Przyczyna wspólna: położenie na ułamku piksela. Audyt (`/components`, `/screens/overlays`, `/screens/edges`, okno 1280, DPR 1 / 1,25 / 1,5): każda widoczna kontrolka ma ułamkowe x (312–403 na stronę), ułamkowe y ma 25–358, szerokość 33–274, wysokość 0–11. Źródła: szerokość tekstu etykiet (213–247 kontrolek na `/components`), kolumna `main` zaczyna się na ułamku (rodzeństwo w rzędzie flex dziedziczy ułamek), `--ts-size-wrap` 3,5 / 4,5 px w torach. Wyrównanie początku przycisku usuwa skok ikon przy DPR 1, ale nie etykiety przy DPR ułamkowym (szerokość tekstu i pozycja etykiety w środku zostają ułamkowe).
- Zerowanie ułamków w silniku (ocena, nic nie wdrożone): całe px CSS dają całe piksele urządzenia tylko przy DPR całkowitym; przy 1,25 / 1,5 potrzebny krok `1px / DPR`, którego CSS nie wyrazi bez wartości per `@media (resolution)`, a i tak położenie zależy od rodzica i tekstu sąsiadów. Szerokość etykiety w górę przez `calc-size(fit-content, round(up, size, 1px))` działa tylko w Chromium (WebKit zostaje przy ułamku) i daje całe px CSS, nie urządzenia. Tor bez połówek (R10 3,5 → 3 / 4 px) łamie „ściśle rośnie” albo wymaga kroków co 1 px, co zmienia zaakceptowany wygląd toru. Ułamków nie da się wyzerować w silniku dla wszystkich kontrolek i DPR.

## Szew grupy `joined` (02.11)

- Objaw (zrzut właściciela): między segmentami grupy złączonej jasna albo ciemna linia. Pomiar jasności OKLab na szwie: przy DPR 1 i 2 brak, przy DPR 1,25 / 1,5 / 1,75 „Export ⌄” (solid) +0,18 / +0,23 / +0,18 w jasnym i −0,13 / −0,18 / −0,13 w ciemnym, „Filter ×” (raised) do 0,03.
- Przyczyna: przy ułamkowym DPR krawędzie dwóch sąsiednich płytek wypadają w jednym pikselu urządzenia; każda kryje go częściowo i półprzezroczysto, więc prześwituje strona (artefakt łączenia krawędzi wygładzanych). Płytka z `inset: 0` daje gorzej (szczelina 2 px, bo `inset` liczy się od paddingu, a ramka 1 px zostaje odkryta); tło na samym elemencie zamiast płytki daje ten sam szew.
- Wybór: cień płytki segmentu przesunięty o obrys w stronę początku, w kolorze podstawy wariantu (`--_shade: calc(-1 * var(--ts-shape-stroke)) 0 0 var(--_base)`), więc szew ma pod spodem nieprzezroczyste tło; przy przezroczystej podstawie (soft, ghost, outline) cień nic nie rysuje, a szew i tak ma najwyżej 0,003. Po zmianie szew 0,000 przy DPR 1–1,75 w obu trybach (Chromium). Strażnik `button-group.spec.ts` (DPR 1,25 i 1,5; na `f56073c` oblewa).
- Znany wyjątek: WebKit przy DPR 1,5 rysuje szew grupy z przezroczystą podstawą („Pages”, soft) o 0,03 jaśniejszy, także na `f56073c`; cień w kolorze przezroczystej podstawy nic tam nie wypełnia, a cień w kolorze tła stanu dałby ciemniejszy pas w nakładce. Pełna naprawa wymaga jednego tła na całej grupie zamiast tła na segmentach (zmiana modelu stanów segmentu), więc strażnik w WebKit sprawdza tylko grupy z nieprzezroczystą podstawą (`OPAQUE_GROUPS`).

## R9: warianty szwu (plansze, bez wdrożenia)

Plansze `scratchpad/fix-a/r1/r9-{a,b1,b2,c}-{light,dark}.png`: sm i lg, outline / soft / solid, spoczynek, hover lewej i prawej, wciśnięcie lewej (płytka segmentu bez skali na planszach). (a) separator 1 px z marginesem ¼ wysokości, (b1) odstęp 2 px bez wewnętrznego zaokrąglenia, (b2) odstęp 2 px z własnym wewnętrznym zaokrągleniem segmentów, (c) sam kolor (stan po naprawie szwu). W outline odstęp (b) nie jest widoczny, bo grupa nie ma tła. Wybór należy do prowadzącego.

## ToggleGroup: pigułka hover przy wyborze opcji pod kursorem (02.11)

Pomiar (plansza `scratchpad/fix-a/r1/toggle-choose.png`, animacje spowolnione 10×): po kliknięciu pigułka hover gaśnie w czasie wyjścia (`--ts-motion-duration-hover-exit`, 300 ms, krzywa `ease-out` jak przy wyjściu kursora), a pigułka zaznaczenia dojeżdża w ok. 140 ms i ją przykrywa; przy krzywej `ease-out` po 100 ms zostaje 30–40 % krycia, więc wygaszanie słabo widać. Zachowanie już spełnia zamówienie (ten sam czas i krzywa, warstwa hover pod zaznaczeniem, tylko `opacity`), kod bez zmian; strażnik `toggle-group.spec.ts` („fades the hover pill out over the exit time when the option under the cursor is chosen…”). Gdyby właściciel chciał wygaszanie bardziej widoczne, trzeba zmienić krzywą wyjścia (np. liniową) albo opóźnić wygaszanie do dojazdu zaznaczenia; obie zmiany dotyczą też wyjścia kursora.

## R2: łamanie po literze w karcie i polu

- Przyczyna: siatka `1fr auto` nagłówka karty, karty z polami i pola w dwóch kolumnach. Kolumna `auto` rośnie do max-content akcji albo kontrolki, zanim `1fr` dostanie miejsce, a minimum `1fr` to jedna litera (`overflow-wrap: anywhere`). Dotyczy każdej szerokości, nie tylko progu `@container` (karta 500 px z długą akcją: tytuł 13,5 px). Próg czyta stronę, więc przy oknie 320 px karta przechodziła w jedną kolumnę i błąd znikał.
- Wybór dla nagłówka karty (prowadzący, 02.11, bez zapytań kontenera): zawijany rząd flex (`card.css`), opis w osobnej linii (`order: 1`, `flex-basis: 100%`), tytuł z podstawą i minimum `min(var(--ts-type-measure-min), 100%)` w przepisie `surface`; akcja spada pod tytuł tylko wtedy, gdy tytuł w swoim minimum i akcja nie mieszczą się w linii. Podstawa = minimum, nie `auto`: przy `auto` długi, zwykły tytuł szerokiej karty spychałby akcję pod siebie (zmiana zaakceptowanego wyglądu). Usunięty próg `@container` nagłówka.
- Wartość `--ts-type-measure-min: 12ch` (silnik `type`) z pomiaru tytułu karty (Inter 600 15 px, akcja „Settings” 83 px, odstęp 8 px): 8ch = 79 px ≈ 10 znaków, 10ch = 99 px ≈ 13, **12ch = 119 px ≈ 15 znaków (2–3 słowa w linii), akcja obok do 210 px treści karty**, 14ch = 139 px (akcja obok do 230 px), 16ch = 158 px (249 px). 12ch to najmniejsza wartość z co najmniej dwoma słowami w linii; przy niej karta 320 px (ok. 275 px treści) trzyma krótką akcję obok tytułu, a 14ch i więcej spychałyby szersze akcje już w karcie telefonu.
- Wynik: w ramce 120 px (75 px treści) tytuł ma pełną szerokość treści, akcja w następnej linii; w karcie 320 px i szerszej układ jak przed zmianą.
- Pole i karta z polami: rząd flex z zawijaniem rozbiłby wspólne kolumny pól (`subgrid`), więc zostaje siatka `auto auto` z `justify-content: space-between` (brak miejsca dzieli się po równo; pole w ramce 120 px: etykieta 46 px, kontrolka 66 px; szerokie pole bez zmian, 289 / 203 px przy 500 px). Nagłówek rozciągnięty na obie kolumny karty z polami ma `min-inline-size: 0` (przepis `surface`), bo inaczej wnosił do minimum kolumn pełną etykietę akcji i karta w dialogu przy oknie 320 px rozpychała się do 512 px.
- Strażniki: `letterBreaks` (węzeł tekstu w kilku liniach po średnio mniej niż 2 znaki; na buildzie efe9525 20 problemów w ramkach Overflow, po zmianie 0) i `card.spec.ts` (tytuł ≥ min(12ch, szerokość nagłówka), w wąskiej karcie tytuł na pełną szerokość i akcja pod nim).
- Odrzucone: `container-type` na karcie albo nagłówku (karta dopasowana do treści zapada się do paddingu), `minmax(0, 1fr) minmax(0, auto)` (tytuł 0 px), `1fr min-content` (akcja 816 px), `auto auto` w nagłówku (w ramce 120 px tytuł 26 px, ok. 3 znaki w linii).
- Chipy linków („https://manc”, „C:\\Users\\Ma”): to `Input` z ikoną `Link` w sekcji Overflow `/screens/edges`, nie `/components`; natywny `<input>` przewijał tekst bez wielokropka. Wybór: `text-overflow: ellipsis` slotu `input`.

## R4: wyjście hover

Domyślnie `fade`: wejście `--ts-in-motion-hover-fade: 1` silnika `motion`; panel „Motion lab” startuje i resetuje się na `fade`, `cut` zostaje do porównania. Decyzja właściciela (R4).

## R5: przyciski

- Najmniejsza szerokość przycisku z etykietą = 2,5 × wysokość: wyjście `--ts-size-label-min` silnika `size` (przepis nie może mieć liczby 2,5), reguła w przepisie `control` dla `button`/`a[href]` bez `role` i bez `data-hug`, z dzieckiem `[data-slot='label']`. Opcje ToggleGroup (`role="radio"`), pola i przyciski z samą ikoną poza regułą.
- Wyłączenie: prop `hug` → `data-hug` (nazwa prowadzącego).
- Bok tekstu i ikony startowej jak v2: `padding-inline` przepisu `control` = bok silnika `shape` wewnątrz 1 px ramki (wcześniej bok minus obrys), tak samo `padding-block` `Textarea`; dotyczy każdej kontrolki z obrysem (przycisk, pole, opcja, Badge z tekstem); kontrolki liczbowe (`data-numeric`: Kbd, licznik Badge) zostają przy boku minus obrys, bo jedna cyfra albo litera ma dać kwadrat, a wiersze bez obrysu bez zmian.
- Odrzucone: `min-width: min(…, 100%)` (procent w minimum = 0 przy liczeniu szerokości rodzica, akcje karty dopasowanej do treści wystawały o 3 px).
- Konflikt z zasadą 7 (dwa przyciski z długą etykietą w ramce 120 px wystawały) rozstrzygnięty przez prowadzącego 02.11 („zależy, gdzie ten przycisk jest”): minimum dotyczy samodzielnego `Button`; segmenty opakowań kontrolek (`[data-surface='track'] > *`, `[data-surface='joined'] > *`) obejmują treść jak opcje ToggleGroup (reguła przez kontekst w przepisie, nie prop); rząd akcji (`CardActions`, `DialogActions`, `PopoverActions`, slot `actions` przepisu `surface`) zawija się (`flex-wrap: wrap`, do końca), więc przycisk w wąskim kontenerze spada do nowej linii. Przypadki testowe ramki 120 px bez zmian.

## Wciśnięcie opcji ToggleGroup (pkt 8 `e3-size-scale.md`)

Opcja ustawia `data-pressing` (`pressable` z `lib/press.ts`), nic się nie skaluje, a pigułka hover pod wciśniętą, niewybraną opcją bierze jeden krok wciśnięcia: `--ts-state-indicator-track` + (`--ts-state-press` − `--ts-state-hover`), jasny 4 → 7 %, ciemny 4 → 8 %. Bez nowego tokenu: krok to ta sama różnica, co w rampie stanu kontrolki.

## R8: trigger menu zostaje wciśnięty

Nie odtworzono (Chromium i WebKit, pięć sposobów: klik, przytrzymanie 600 ms, przytrzymanie z przejazdem na listę, dwuklik, Enter): menu otwiera się ok. 25 ms po `pointerdown`, `pointerup` dociera do `window`, `data-pressing` znika przy puszczeniu. `lib/press.ts` bez zmian, strażnik w `button.spec.ts`.
