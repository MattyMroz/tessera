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
