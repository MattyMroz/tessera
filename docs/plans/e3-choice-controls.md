---
kind: plan
status: draft (czeka na akceptację właściciela)
baseline: feat/e3-motion @ 0408e5c, drzewo czyste poza docs/research/inspiration.md
created: 2026-11-03
---

# Plan: pola wyboru (Checkbox, Switch, Radio)

## Cel

Trzy pola wyboru w v3, które wyglądają jak w v2 (wierna kopia wyglądu i ruchu), z wyjątkiem błędów v2 nazwanych niżej, zbudowane wyłącznie z silników i jednej części przepisu `control`. Żaden element nie ma własnej liczby ani zmiennej do ustawiania ręcznie.

## Zakres

- `Checkbox` (+ `CheckboxGroup` z polem nadrzędnym Base UI), `Switch`, `Radio` (+ `RadioGroup`).
- Poza zakresem: Slider, pozycje radio w Menu, drzewo trójstanowe.

## Zasady (obowiązują w każdym kroku)

1. Wygląd i ruch z v2, zmierzone na ekranie v2 (`apps/gallery`, port 4451), nie z dokumentów.
2. Każda wartość pochodzi z wyjścia silnika; brakujące wyjście dopisuję do istniejącego silnika jako wartość liczoną z rozmiaru, wspólną dla wszystkich pól wyboru.
3. Jedna część przepisu `control` dla pola i toru: hover, wciśnięcie, drabinka stanów i stan zaznaczony w jednym miejscu dla wszystkich trzech.
4. Błędy v2 nie są kopiowane: asymetryczne odbicie kciuka Switcha, przelot kropki Radia między opcjami.
5. Kod powstaje dopiero po akceptacji tego planu; każdy element: kod → pomiar wobec v2 → klatki ruchu → testy → bramka. Raport dopiero po wszystkich trzech.

## Wygląd (wartości zmierzone w v2, `lg`)

### Wspólne

| Co                             | Wartość                                                                              | Źródło v3                                  |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| Odstęp pole–etykieta           | połowa pola (8 px przy `lg`), v2 i shadcn                                            | nowe wyjście `size`: `--ts-size-label-gap` |
| Odstęp między opcjami w grupie | 12 px (v2)                                                                           | `--ts-space-card-small`                    |
| Etykieta                       | wyśrodkowana do pola (różnica 0 px)                                                  | układ komponentu                           |
| Pusty stan                     | atrament spoczynku drabinki + obrys 1 px `--ts-color-control-border`                 | silnik `state`, `color`                    |
| Zaznaczony                     | pełny `tint`, obrys znika pod wypełnieniem, znak w kolorze `on-tint`, poświata neonu | `color`, `depth`                           |
| Hover                          | szczebel hover drabinki, także na zaznaczonym                                        | `state`                                    |
| Wyłączony                      | krycie 40 %                                                                          | `state`                                    |
| Fokus                          | pierścień `data-focus="outer"` jak przycisk                                          | `focus`                                    |
| Dotyk                          | pole co najmniej 24 px (W1)                                                          | `size` (`pointer: coarse`)                 |

### Checkbox

- Pole = ikona stopnia: 10 / 12 / 14 / 16 / 18 px.
- Promień = reguła batona z limitem 35 % pola (v2: 3,66 / 5,49 / 5,6 / 5,6 px przy `sm` / `md` / `lg` / `full`); zmiana jednej linii wyjścia `--ts-shape-box`.
- Znak: ptaszek i minus, szerokość ok. 7 px przy `lg`, kreska 1,5 px (v2: glif ¾ pola, kreska 3 na viewBox 24).

### Switch

- Tor = wysokość × 6/7, kciuk = tor × ¾, szerokość = tor + kciuk (v2 co do piksela: 25×14, 30×17, 37×21, 42×24, 54×31); wyjścia `--ts-size-track-*` i `--ts-size-thumb` przechodzą na te wzory.
- Kciuk w spoczynku 1,5–4 px od krawędzi toru (odstęp v2 = (tor − kciuk) / 2).
- Kciuk: biały z cieniem `raised` przy wyłączonym, `on-tint` przy włączonym (inaczej znika w ciemnym trybie).
- Wyłączony tor: patrz D2.

### Radio

- Koło = pole Checkboxa, kropka 0,43 pola (v2: 0,44), w kolorze `on-tint` na `tint`.

## Ruch

| Element         | Ruch                                                                                                 | Wartości                                                                             | Źródło                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Checkbox, Radio | wciśnięcie całego pola                                                                               | 0,97, 50 / 224 ms, jak baton                                                         | grupa „skala” silnika `motion`                                                                       |
| Checkbox        | ptaszek się rysuje (najpierw krótkie ramię)                                                          | 350 ms wejście, 150 ms wyjście, krzywa v2 `cubic-bezier(0.22, 1, 0.36, 1)`           | nowa kategoria `draw` silnika `motion`                                                               |
| Checkbox        | minus rysuje się od lewej przez cały czas `draw`                                                     | jak wyżej                                                                            | jak wyżej                                                                                            |
| Switch          | kliknięcie: kciuk rozciąga się do kapsuły ×1,25 od strony, przy której stoi, sprężyście (z odbiciem) | czas i odbicie kategorii `choice`                                                    | silnik pigułki; szerokość kciuka = nazwany wyjątek ruchu poza kompozytorem (`scale` zrobiłby elipsę) |
| Switch          | przejazd kciuka                                                                                      | 220 ms elastic, wychylenie 0,1 × wysokość, symetryczne w obie strony, bez zgniecenia | silnik pigułki (`useIndicator`), bez nowego mechanizmu                                               |
| Switch          | tor                                                                                                  | nie skaluje się                                                                      | —                                                                                                    |
| Radio           | kropka: biały krążek wypełnia koło i kurczy się do kropki (Kevin @keviduk), bez przelotu             | czas `choice`                                                                        | `motion`                                                                                             |
| Wszystkie       | `motion: off` i reduced motion: stan w jednej klatce                                                 | —                                                                                    | `motion`                                                                                             |

## Zmiany silników (pełna lista)

- `size`: `--ts-size-label-gap` (pole / 2), `--ts-size-dot-scale` (kropka Radia jako ułamek koła), wzory toru i kciuka v2, pole ≥ 24 px przy dotyku.
- `shape`: limit 35 % w `--ts-shape-box`; jedno wyjście kształtu koła i kapsuły.
- `motion`: kategoria `draw` (350 / 150 ms, krzywa v2) i krzywa sprężyny kliknięcia z kategorii `choice`.
- Strażnik `css-layers.ts`: nazwane wyjątki z powodem (glif znaku, rysowanie kreski, szerokość kciuka).

## Części i DOM

- Base UI: `Checkbox`, `CheckboxGroup`, `Switch`, `Radio`, `RadioGroup` (klawiatura, formularz, `Field`).
- Część `[data-slot='box']` (pole i koło), `[data-slot='track']` (tor), znak w `[data-slot='mark']`, kropka w `[data-slot='dot']`; etykieta obok pola w `<label data-slot='choice'>`.

## Dowody (warunek oddania)

1. Pomiar v2 i v3 obok siebie: wymiary, promienie, pozycje kciuka, odstępy przy każdym rozmiarze i każdym `corners` (skrypt, liczby w raporcie).
2. Zrzuty z bliska DSF 1 / 1,25 / 1,5, jasny i ciemny.
3. Klatki ruchu spowolnione 20× dla każdego ruchu z tabeli, obie strony Switcha.
4. Testy Playwright (`checkbox.spec.ts`, `switch.spec.ts`, `radio.spec.ts`): geometria z wyjść silnika, stany, klawiatura, klik w etykietę, ruch tylko przez nazwane właściwości, `motion: off`.
5. Dokumenty `docs/<nazwa>.md`, sekcje na `/components` i `/screens/edges`, wpisy w dzienniku decyzji.
6. `bun run check` zielony.

## Decyzje właściciela przed kodem

- **D1 ptaszek:** (a) ścieżka v2 `M5 12.5l4.5 4.5L19 7.5` jako nazwany wyjątek od zestawu lucide — wierna kopia (rekomendacja); (b) `Check` lucide (ok. 1 px szerszy, środek 0,35 px wyżej).
- **D2 wyłączony Switch:** (a) jak v2: tło 12 / 16 % bez obrysu; (b) obrys 1 px jak Checkbox i Radio, jedna rodzina (rekomendacja).
- **D3 zmiana tła pola i toru przy zaznaczeniu:** (a) jak v2: płynnie 150 ms; (b) w jednej klatce jak każdy stan v3 (W8, rekomendacja).
- **D4 hover pustego pola:** (a) jak v2: obrys ciemnieje; (b) zmienia się tylko wypełnienie, jak pole tekstowe v3 (rekomendacja).
