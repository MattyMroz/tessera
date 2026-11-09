---
kind: decision
status: draft
updated: 2026-11-09
---

# Slider: decyzje techniczne i pomiary

Wybory wyglądu i zachowania właściciela: `e3-choices.md`, wpisy „Slider” z 09.11. Plan: `plans/e3-slider.md`. Decyzje niżej podjął prowadzący z upoważnienia, o ile nie zaznaczono inaczej.

## 1. Plan przyjęty przez właściciela

Właściciel po planie: „Dobra, dodaj do tej głównej strony ten komponent i tyle” (09.11). Przyjęte z rekomendacjami P1–P7: odstępstwa S1–S4, bez układu z etykietą w torze, jedno zachowanie kroków, odbicie lotu `choice`, przenikanie tekstu kroków, opcjonalny napis końca, bez szarej pigułki.

## 2. Własny `role="slider"`, bez natywnego pola

- **Wybrano:** gospodarz `div role="slider" tabindex="0"`, `aria-valuenow` i `aria-valuetext` pisane przez `lib/slider.ts` (jak D61).
- **Odpadło:** ukryty `<input type="range">` (klawiatura i formularz za darmo). Pomiar na próbie, Chromium, CPU ×4, 60 ruchów przeciągania bez tekstu wartości: z polem 53 × `Layout` i 106 × `Paint`, bez pola 0 i 0. Przeglądarka przelicza wewnętrzny kciuk pola przy każdej zmianie `value`.

## 3. Pigułka z trzech części

- **Wybrano:** początek (szerokość z tekstu), prostokątny pas skalowany w osi X i koniec na jeźdźcu przesuwanym `translate`; pas zaczyna się i kończy w środkach końców, więc nie ma szwu. Cień: `filter` na grupie (`--ts-depth-raised-drop`), jak kciuk Switcha.
- **Dlaczego:** przycięcie pełnego wypełnienia torem (D53) ucina cień białej pigułki. Pomiar: 0 × `Layout`, 0 × `Paint` w ruchu z cieniem.
- **Odpadło:** `box-shadow` na każdej części (cienie nakładają się w miejscach styku); `clip-path` (malowanie w każdej klatce).
- **Szerokość początku bez JS:** gospodarz to siatka `auto 1fr`, pigułka dziedziczy kolumny (`subgrid`), a pierwszą kolumnę wyznaczają niewidoczne wzorce tekstu (`widestValues`: wszystkie kroki suwaka krokowego albo dwa pierwsze i dwa ostatnie suwaka ciągłego). Skutek uboczny zauważony przez właściciela: przy „Low” pigułka ma zapas na „Extra high”. Stała szerokość jest celowa, bo zmienna przesuwałaby drogę końca przy każdej zmianie tekstu.

## 4. Loty przez Web Animations i `lib/flight.ts`

- **Wybrano:** położenie spoczynkowe z `--ts-i-value` (bez `transition`), a każdy ruch bez ręki (krok, klawisz, klik) to lot `choice` z `planFlight`, przycięty do drogi. Lot do wskaźnika po wciśnięciu poza końcem ląduje po czasie `choice` od wciśnięcia: każdy ruch ręki zaczyna lot od bieżącego położenia z pozostałym czasem.
- **Odpadło:** `transition` na położeniu z `transition: none` przy przeciąganiu (strażnik przepisów nie przepuszcza, a próba pokazała opóźnienie przy szybkim chwycie); własna krzywa odbicia (wychodziła poza tor przy skrajnych krokach).

## 5. Warstwy dopiero w ruchu

- **Wybrano:** `will-change` na pasie i jeźdźcu od pierwszego ruchu, który zmienia położenie (`data-moving`), na torze tylko za krańcem (`data-over`). Ruch wskaźnika o mniej niż 0,05 px drogi nie tworzy warstwy.
- **Pomiar:** wciśnięcie i ruch o 1 px w pionie nie zmieniają żadnego piksela przy DSF 1 / 1,25 / 1,5 / 2 (sześć suwaków laboratorium). Z warstwą od `pointerdown` zmieniało się do 475 px obrazu.
- **Ograniczenie:** po pierwszym ruchu warstwa końca pigułki rysuje krawędź inaczej o ułamek piksela (25–130 px obrazu, różnica do 27/255); znika przy puszczeniu.

## 6. Koniec pigułki jedzie w jednostkach kontenera drogi

- **Wybrano:** koniec pigułki ma szerokość wysokości kontrolki i `translate: calc(var(--ts-i-value) * 100cqi)`; droga ma `container-type: inline-size`. Strażnik przepisów dopuszcza literał `100cqi` (`LANE_LENGTH`), jak przewidywał D53.
- **Dlaczego:** pierwsza wersja przesuwała część o szerokości drogi w procentach własnej szerokości. Niewidoczna część wychodziła poza tor i poszerzała stronę (zgłoszenie właściciela: poziomy pasek przy rosnącej wartości; `scrollWidth` 1510 przy oknie 1500), a `edges.spec.ts` zgłaszał ją poza ramką 320 px.
- **Odpadło:** `overflow-x: clip` na torze (chowało objaw, część dalej wystawała i oblewała strażnika ramki).
- **Skala toru tylko za krańcem:** tor nie ma skali w spoczynku (`interaction.spec.ts` wymaga, żeby gospodarz `role="slider"` się nie skalował); skala rozciągnięcia i warstwa istnieją tylko przy `data-over`.
- **Ograniczenie:** rozciągnięcie toru za kraniec (do 2/7 wysokości) poszerza obszar przewijania, gdy suwak stoi bliżej krawędzi strony niż ta wartość.

## 7. Kierunek z atrybutu, nie z `:dir()`

- **Wybrano:** `[dir='rtl'] &` w przepisach, `matches(':dir(rtl)')` w JS. Droga jest lustrzana przez `scale: -1 1`, więc `translate` i skala pasa nie zmieniają znaku.
- **Dlaczego:** Lightning CSS laboratorium zamienił `:dir(rtl)` na listę `:lang(…)` i lustro nie działało przy `dir="rtl"`.
- **Ograniczenie:** `dir="ltr"` zagnieżdżone w `dir="rtl"` dostanie lustro.

## 8. Napis końca przez `IntersectionObserver`

- **Wybrano:** jeden pomiar przy montażu (odległość napisu od krawędzi toru) i obserwator końca pigułki z marginesem; próg 0,9, bo spoczynkowa skala daje stosunek tuż poniżej 1.
- **Odpadło:** próg jako ułamek wartości (rozjeżdża się po zmianie szerokości bez `ResizeObserver`); pomiar przy każdej zmianie wartości.

## 9. Nowe wyjścia silników

`--ts-size-half` (połowa wysokości kontrolki), `--ts-size-grip` (2/5 wysokości, do parzystego piksela), `--ts-motion-grab-scale` (1,5; bez ruchu 1), klucz rejestru `--ts-i-stretch`. Słowo `pan-y` na białej liście przepisów (`touch-action`).

## 10. Budżet B6: wyjątek 5120 B

Zmierzone: `slider.js` + `lib/slider.js` + `lib/range.js` = ok. 4720 B (limit 3072 B). Po odchudzeniu (części szukane selektorem zamiast sześciu refów) bez zmiany rzędu wielkości. Wyjątek 5120 B dla Slidera, wpis i powód w `e3-budgets.md` („B6: `slider`”).

## 10a. Przenikanie tekstu w czasie lotu

- **Wybrano (właściciel, 09.11):** tekst suwaka krokowego przenika się z rozmyciem przez `choice` (220 ms), czyli tyle, ile leci pigułka. Właściciel: „Liczby się nie zmieniają… nie mają tej animacji bluru”, po wyjaśnieniu: „Popraw tylko ten jeden element”.
- **Dlaczego:** przy `follow` (100 ms) zmiana „400” → „500” mieściła się w jednej–dwóch klatkach i była niewidoczna, bo liczby różnią się jedną cyfrą w tym samym miejscu (klatki z buildu produkcyjnego).
- **Koszt:** nowy tekst jest w pełni ostry o 120 ms później; dotyczy też nazw kroków.

## 11. Dowody

- `apps/docs/tests/slider.spec.ts`: 15 testów, Chromium i WebKit (WebKit bez testu pikseli); razem z `edges`, `interaction`, `symmetry`, `lab` i `text`: 305 zielonych, 11 pominiętych, 0 czerwonych (09.11). `a11y.spec.ts` zielony w Chromium.

- `packages/tessera/src/lib/range.test.ts`: 20 testów; `bunx vitest run`: 913 zielonych, 1 czerwony (budżet B6, punkt 10).

- **Ślad przeciągania**, build produkcyjny, Chromium, CPU ×4, 60 ruchów wskaźnika, jeden przebieg:

  | Scena                                    | `Layout`      | `Paint`        | `Layerize`     |
  | ---------------------------------------- | ------------- | -------------- | -------------- |
  | suwak 0–100 (tekst zmienia się co ruch)  | 55 × (217 ms) | 114 × (265 ms) | 103 × (758 ms) |
  | suwak o 4 krokach (dwa loty, dwa teksty) | 0             | 0              | 70 × (2 ms)    |
  | zwykły przycisk, 10 wciśnięć             | 0             | 54 × (119 ms)  | 123 × (532 ms) |

  Układ przy zmianie tekstu obejmuje 13 obiektów z 4890 i zaczyna się od korzenia dokumentu; `contain: strict` na etykiecie tego nie zmienił (pomiar, bez zysku ponad szum). Zero warstw w spoczynku.

- **`bun run perf`** (scena `/stress`, bez suwaka), dwa przebiegi po zmianie: bramka przeszła (nic ponad 2 × `last.json`), ale wyniki są o 4–70 % wyższe niż `last.json` przy rozrzucie 20–296 %. Maszyna była obciążona (podgląd, inne sesje), więc pomiar nie rozstrzyga, czy zmiana coś kosztuje. Do powtórzenia na spokojnej maszynie przed scaleniem, razem z przebiegiem na `main`.

- Nie zrobiono: filmy ruchu, zrzuty przy trzech DSF w obu trybach, przegląd `forced-colors` i dotyku na żywo, przegląd diffu przez świeżego recenzenta.
