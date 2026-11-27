---
kind: plan
status: draft
baseline: 7621bb4
created: 2026-11-09
---

# Plan: Slider (runda D, wariant E)

## Cel

Komponent `Slider` w paczce: biała pigułka z wartością w środku, która rośnie w torze `ToggleGroup`, z zachowaniem przyjętym przez właściciela na próbie `/proposals` (runda 3, 09.11), szybki od pierwszej wersji.

## Rezultat użytkownika

Konsument pisze `<Slider min={0} max={100} defaultValue={40} format={percent} aria-label="Opacity" />` i dostaje suwak z próby: ten sam wygląd, chwyt, kroki, rozciąganie i klawiaturę, bez własnych stylów.

## Warunki końcowe

- [ ] Wygląd i zachowanie jak wariant E z próby (lista w „Zachowanie”), w `xs`–`xl`, przy każdym `corners` i `curve`, w jasnym i ciemnym.
- [ ] Klik bez ruchu nie zmienia żadnego piksela poza kreską (DSF 1 / 1,25 / 1,5 / 2).
- [ ] W klatce przeciągania zero `Layout` i zero `Paint` poza tekstem wartości w chwili jego zmiany; zero commitów Reacta poza częścią wartości.
- [ ] W spoczynku zero warstw kompozytora i zero nasłuchów poza `pointerdown` i `keydown` na gospodarzu.
- [ ] `bun run check` zielony, `bun run perf` bez regresu, B6 w budżecie 3072 B.
- [ ] Ocena właściciela na żywo.

## Nie-cel

Liczba przeciągana w bok (Scrub, wariant C), suwak pionowy, zakres z dwoma uchwytami, szara pigułka (F), linijka, filar koloru.

## Authority i baseline

- Wybory właściciela: `decisions/e3-choices.md`, cztery wpisy „Slider” z 09.11. Karta: `research/e3-slider-card.md`.
- Kontrakt etapu: `plans/e3-first-round.md` D53, D61; spec U18, Q3, Q7, W11.
- Baseline: `main` 7621bb4, CI zielone. Próba: `apps/docs/app/proposals/` (nieśledzona, do usunięcia w fazie 5).

## Stan aktualny (zmierzone na próbie)

- **Pigułka z trzech części nie maluje w ruchu.** Ślad Chromium, CPU ×4, 60 ruchów przeciągania, bez tekstu wartości i bez natywnego pola: 0 × `Layout`, 0 × `Paint`, z cieniem `filter: drop-shadow` na grupie pigułki. Zostają `UpdateLayoutTree`, `PrePaint`, `Layerize`, `Commit`.
- **Natywny `<input type="range">` kosztuje układ przy każdej wartości.** Ten sam ślad z ukrytym polem: 53 × `Layout` i 106 × `Paint` na 60 ruchów. Przeglądarka przelicza jego wewnętrzny kciuk.
- **Tekst wartości kosztuje układ i malowanie tylko przy zmianie tekstu.**
- **Warstwa przy kliknięciu przesuwa piksele.** `will-change` włączone na `pointerdown` zmieniało do 475 px obrazu przy DSF 1. Po przeniesieniu warstw na pierwszy ruch (a warstwy toru na ciągnięcie za kraniec) klik nie zmienia żadnego piksela przy czterech DSF.
- **Próba działała na React dev i dziedziczonej zmiennej**, więc jej czasy JS i stylu nie są miarą; miarą będzie build produkcyjny.

## Odstępstwa od kontraktu etapu (do akceptacji)

| Nr  | Kontrakt etapu                                                                             | Plan                                                                                                                                                                                                | Powód                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | D53, spec Q3: wypełnienie pełnej długości jedzie `translate`, przycięte torem, bez `scale` | Pigułka z trzech części: dwa końce o stałym kształcie i prostokątny pas skalowany w osi X; koniec jedzie `translate` w `100cqi` drogi (jak D53; zmiana w wykonaniu, `decisions/e3-slider.md` p. 6). | Biała pigułka ma cień, a przycięcie torem go ucina. Zakaz `scale` chronił zaokrąglony koniec; tu skaluje się tylko prostokąt. Ten sam chwyt ma już kciuk Switcha. |
| S2  | D61: liczba to osobny komponent poza poddrzewem toru                                       | Wartość stoi w pigułce, w poddrzewie toru. Jej układ i malowanie przy zmianie tekstu to nazwany wyjątek z pomiarem.                                                                                 | Wybór właściciela (wariant E).                                                                                                                                    |
| S3  | R4: „suwak B (gruby tor `track-block`, kciuk w środku)”                                    | Tor i pigułka `ToggleGroup`, kreska zamiast kciuka.                                                                                                                                                 | Wybór właściciela.                                                                                                                                                |
| S4  | spec W11: neon `mini` świeci także na wypełnieniu suwaka                                   | Pigułka jest biała, bez akcentu, więc bez poświaty; „wypełnienie suwaka” znika z listy W11.                                                                                                         | Wybór właściciela (akcent odrzucony).                                                                                                                             |

D61 zostaje w reszcie: własny kod, gospodarz `role="slider"`, `aria-valuenow` i `aria-valuetext` pisane przez `lib/slider.ts` bez renderu. Natywne pole odpada z pomiaru wyżej.

## Zakres

- **In scope:** komponent, dwa pliki `lib/`, wariant przepisu `indicator`, wariant przepisu `surface`, trzy wyjścia silników, klucz rejestru, strażnicy, dokument, laboratorium, testy, usunięcie próby.
- **Forbidden:** zmiana wyglądu ToggleGroup, Switcha i toru; `transition` na pozycji pigułki; `ResizeObserver`; pomiar DOM poza `pointerdown`, `keydown` i zmianą wartości z propsów; warstwa w spoczynku; liczba w TSX komponentu poza `0`, `1`, `-1`; podniesienie budżetu B6 bez decyzji właściciela.
- **Dozwolone lokalnie:** nazwy prywatnych funkcji, podział funkcji w dwóch plikach `lib/`, kolejność reguł w przepisie.
- **Stop i pytanie:** B6 ponad 3072 B; `Paint` albo `Layout` w klatce poza wyjątkiem S2; różnica pikseli przy kliknięciu; zachowanie inne niż na próbie.

## Target design

### API

```ts
type SliderProps = {
  min: number
  max: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  onValueCommit?: (value: number) => void
  format?: (value: number) => string
  end?: string
  size?: Choices['size']
  disabled?: boolean
} & ({ 'aria-label': string } | { 'aria-labelledby': string })
```

- `onValueChange` przy każdej zmianie wartości, `onValueCommit` przy puszczeniu i od razu przy klawiaturze.
- `format` daje tekst w pigułce i `aria-valuetext`; bez niego liczba.
- `end` to napis końca toru („100%”). Komponent nie ma własnego tekstu.
- **Krokowy** jest suwak o najwyżej 12 krokach (`MAX_MARKS`): dostaje kropki i przyciąganie. Pozostałe są ciągłe.

### Części

```text
div role="slider" tabindex="0" data-component="slider"
    data-recipe="surface" data-level="sunken" data-surface="track" data-variant="slider" data-focus="outer"
├── span data-slot="marks"                    kropki kroków, pod pigułką
├── span data-slot="end"                      napis końca, pod pigułką
├── span data-recipe="indicator" data-variant="fill"
│   ├── span data-slot="cap"                  początek: szerokość z tekstu wartości
│   └── span data-slot="lane"                 droga końca pigułki
│       ├── span data-slot="bar"              prostokąt, scale X = wartość
│       └── span data-slot="ride"             koniec o szerokości wysokości kontrolki, translate X = wartość × 100cqi
│           └── span data-slot="grip"         kreska
└── output data-slot="value"                  tekst wartości i niewidoczne wzorce szerokości
```

- **Szerokość początku bez JS.** Gospodarz jest siatką `auto 1fr`; pigułka dziedziczy kolumny (`subgrid`), a kolumnę pierwszą wyznacza najszerszy tekst wartości: niewidoczne wzorce (`min`, `min + step`, `max − step`, `max` albo wszystkie kroki suwaka krokowego). Znika stałe „2,5 × wysokość” z próby i „Extra high” mieści się zawsze.
- **Cień:** `filter` z `--ts-depth-raised-drop` na grupie pigułki, jak kciuk Switcha. Tekst leży poza grupą.

### Wartości

| Co                                | Źródło                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| tor: tło, odstęp, promień         | przepis `surface`, `data-surface="track"`, bez zmian                                                       |
| wysokość pigułki, szerokość końca | `--ts-size-height`                                                                                         |
| promień i krzywa pigułki          | `--ts-shape-control-radius`, `--ts-shape-control-corner`                                                   |
| kolor pigułki, cień               | `--ts-depth-raised-bg`, `--ts-depth-raised-drop`                                                           |
| tekst wartości                    | `--ts-size-text`, `--ts-size-leading`, `--ts-type-weight-medium`, bok `--ts-shape-control-side`            |
| napis końca, kropki               | `--ts-color-secondary-label`, `--ts-color-tertiary-label`; kropka = 2 × `--ts-shape-stroke`                |
| kreska: grubość, długość          | 2 × `--ts-shape-stroke`; nowe `--ts-size-grip` = wysokość × 2/5                                            |
| kreska: spoczynek, hover, chwyt   | `--ts-color-tertiary-label`, `--ts-color-secondary-label`, `--ts-color-label`                              |
| wzrost kreski przy chwycie        | nowe `--ts-motion-grab-scale` (1,5; `motion: off` i ograniczony ruch: 1), czas i krzywa `choice`           |
| rozciągnięcie toru                | nowy klucz `--ts-i-stretch`, mnożony przez `--ts-motion-press-stretch`; oś Y ściska się o 2 × tyle         |
| spoczynek toru i części           | `--ts-motion-press-rest`                                                                                   |
| czasy lotów                       | `readMotion`: `choice`, odbicie `--ts-motion-choice-overshoot` × wysokość, krzywa `--ts-motion-ease-hover` |

Stałe zachowania w `lib/range.ts`: limit rozciągnięcia 2/7 wysokości (8 px przy `lg`), osiągany 15 limitów za krańcem; próg kliknięcia 3 px; `MAX_MARKS` 12.

### Zachowanie

1. **Chwyt.** `pointerdown` na końcu pigułki (prostokąt końca, „niewidoczna kulka”) nie zmienia niczego; ruch jedzie 1:1. Bez ruchu puszczenie ustawia wartość w klikniętym punkcie.
2. **Wciśnięcie poza końcem** (środek pigułki, pusty tor): koniec leci pod wskaźnik i ląduje po czasie `choice` od wciśnięcia, także gdy ręka się rusza (kolejny ruch skraca lot do pozostałego czasu). Potem 1:1.
3. **Suwak krokowy.** Pigułka stoi na kroku i leci do następnego, gdy wskaźnik do niego dojedzie; nigdy przed wskaźnikiem. Lot `choice` z odbiciem silnika, przycięty do toru (`lib/flight.ts`, jak pigułka ToggleGroup).
4. **Kraniec.** Tor rozciąga się w stronę ciągnięcia do limitu i wraca lotem `choice`.
5. **Klawiatura.** Strzałki o krok (w RTL lustro), PageUp i PageDown o większy z kroku i 1/10 zakresu, Home i End; każda zmiana to lot `choice` i od razu `onValueCommit`.
6. **Tekst.** Suwak ciągły zmienia tekst natychmiast. Krokowy przenika stary i nowy tekst z rozmyciem w czasie lotu `choice` (pierwotnie `follow`; zmiana właściciela 09.11, `decisions/e3-slider.md`).
7. **Napis końca** gaśnie w `hover-out`, zanim pigułka do niego dojedzie (próg z jednego pomiaru na sesję zmiany).
8. **Wyłączony:** `aria-disabled`, bez fokusu, krycie `--ts-state-disabled`.
9. **RTL:** pigułka rośnie od prawej; `translate` i punkt skali w lustrze.

### Wydajność

- **Spoczynek:** części mają skalę `--ts-motion-press-rest`, żadnej warstwy. Nasłuchy `pointermove` i `pointerup` zakłada `pointerdown` i zdejmuje puszczenie.
- **Ruch:** jeden odczyt prostokątów na `pointerdown`. Na ruch: zapis `--ts-i-value` na pasie i jeźdźcu (klucz ma `inherits: false`), przy zmianie wartości zapis ARIA na gospodarzu i emisja do magazynu wartości. Bez odczytów.
- **Warstwy:** pas i jeździec od pierwszego ruchu (`data-moving`), tor tylko za krańcem (`data-over`); znikają przy puszczeniu.
- **React:** wartość w trakcie przeciągania żyje w magazynie (`useSyncExternalStore`), więc renderuje się tylko część wartości. Gospodarz renderuje się przy zatwierdzeniu.
- **Wyjątki poza kompozytorem**, każdy na liście strażnika z powodem:
  - układ i malowanie tekstu wartości przy zmianie tekstu (S2);
  - `filter` w przenikaniu tekstu suwaka krokowego (ten sam wzór co tooltip).

### Pliki

| Plik                                                                                                   | Operacja       | Rola                                                                                                  |
| ------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------- |
| `packages/tessera/src/lib/range.ts`, `range.test.ts`                                                   | CREATE         | czyste funkcje: ułamek i wartość, krok „za wskaźnikiem”, klawisze, limit rozciągnięcia, wzorce tekstu |
| `packages/tessera/src/lib/slider.ts`                                                                   | CREATE         | sterownik DOM: wskaźnik, loty, zapis instancji i ARIA; plik pomiaru (Q7)                              |
| `packages/tessera/src/components/slider/slider.tsx`, `slider.css`                                      | CREATE         | części, propsy, magazyn wartości; układ siatki                                                        |
| `packages/tessera/src/recipes/indicator.css`                                                           | MODIFY         | wariant `fill`: końce, pas, jeździec, kreska                                                          |
| `packages/tessera/src/recipes/surface.css`                                                             | MODIFY         | wariant `slider`: rozciągnięcie, sloty `marks`, `end`, `value`                                        |
| `packages/tessera/src/engines/size.css`, `motion.css`; `lib/instance.ts`                               | MODIFY         | `--ts-size-grip`, `--ts-motion-grab-scale`, rejestr `--ts-i-stretch`                                  |
| `packages/tessera/src/styles/tessera.css`                                                              | MODIFY         | import `slider.css`                                                                                   |
| `packages/tessera/test/guards/css-layers.ts`, fixture, `css-layers.test.ts`, `contracts.test.ts`       | MODIFY         | słowo `pan-y`, wyjątek przenikania tekstu, `lib/slider.ts` na liście pomiaru                          |
| `packages/tessera/docs/slider.md`                                                                      | CREATE         | dokument komponentu                                                                                   |
| `apps/docs/app/components/sections/slider.tsx`, `screens/edges/sections/slider.tsx`                    | CREATE         | sekcje laboratorium (stany, rozmiary, kroki, pole w karcie, 320 px, długie teksty)                    |
| `apps/docs/app/elements.ts`, `components/page.tsx`, `screens/edges/page.tsx`, `overflow.tsx`           | MODIFY         | wpisy Slidera                                                                                         |
| `apps/docs/tests/slider.spec.ts`; `a11y.spec.ts`                                                       | CREATE, MODIFY | testy z „Dowody”; rola komponentu                                                                     |
| `docs/specification.md` (Q3, Q7, W11), `docs/structure.md`, `AGENTS.md`, `docs/decisions/e3-slider.md` | MODIFY, CREATE | S1–S4, lista pomiaru, pułapki, pomiary                                                                |
| `apps/docs/app/proposals/`                                                                             | DELETE         | próba, po przyjęciu komponentu                                                                        |

## Plan wykonania

Branch `feat/slider` w `.worktrees/slider`, własny `LAB_PORT`.

1. **Fundament.** Wyjścia silników, klucz rejestru, strażnicy z fixture. Bramka: `bunx vitest run` zielony.
2. **Czyste funkcje.** `lib/range.ts` z testami: krok „za wskaźnikiem” w obie strony, limit, klawisze, RTL. Bramka: testy.
3. **Przepisy i części.** Statyczny Slider w laboratorium z wartością z propsów. Bramka: zrzuty `xs`–`xl`, rogi, tryby równe próbie.
4. **Sterownik.** `lib/slider.ts`, magazyn wartości, klawiatura. Bramka: `slider.spec.ts`.
5. **Dowody i zapis.** Pomiary, dokumenty, pułapki, usunięcie próby, przegląd diffu przez świeżego Sonneta. Bramka: `bun run check`, `bun run perf`.

## Dowody

- **Piksele kliknięcia:** zrzut przed, w trakcie i po `pointerdown` bez ruchu, DSF 1 / 1,25 / 1,5 / 2, równość pikseli poza kreską.
- **Ślad przeciągania:** build produkcyjny, CPU ×4, obok wciśnięcia zwykłego przycisku w tym samym przebiegu; `Layout` i `Paint` tylko w klatkach zmiany tekstu; lista warstw w spoczynku i w ruchu.
- **Klatki:** chwyt, lot do wskaźnika z ręką w ruchu (lądowanie pod wskaźnikiem), krok (pigułka nigdy przed wskaźnikiem), kraniec i powrót, lot klawiatury; film każdego ruchu w obie strony.
- **Geometria:** koniec pigułki = wartość ± 0,5 px (Chromium, WebKit); szew pasa z końcami 0 px; pigułka i odbicie w torze przy skrajnych krokach.
- **Zachowanie:** klik w odległości 6 px od kreski przesuwa o 6 px; przytrzymanie nie rusza; `onValueCommit` raz na przeciągnięcie; wartość odrzucona przez konsumenta wraca; RTL; wyłączony; `motion: off`; `forced-colors`; dotyk (`pan-y`).
- **Skrajności:** tor w popoverze i w ramce 120 px nie zwija się, długi tekst kroku nie wypycha gospodarza.
- **Commity:** przeciąganie renderuje tylko część wartości.
- **Bramki:** `bun run check`, `bun run perf` przed i po, B6.

## Ryzyka

| Ryzyko                                                       | Rozpoznanie               | Reakcja                                                                |
| ------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------- |
| B6 ponad 3072 B (sterownik, loty, magazyn)                   | test budżetu              | odchudzenie; jeśli nie wystarczy, stop i decyzja właściciela           |
| WebKit maluje `filter` z ruchomymi dziećmi w każdej klatce   | ślad niedostępny; klatki  | pomiar czasu klatek; jeśli gorzej, cień bez `filter` do decyzji        |
| `subgrid` z szerokością z tekstu daje skok przy zmianie cyfr | test geometrii            | wzorce szerokości obejmują najdłuższy tekst; brak wzorca to błąd testu |
| Lot i zapis instancji rozjeżdżają się przy szybkich ruchach  | klatki „lot do wskaźnika” | jedna funkcja licząca położenie z lotu (`visibleAt`)                   |

## Decyzje właściciela

| Nr  | Pytanie                                   | Rekomendacja                                                                                          |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P1  | Odstępstwa S1–S4                          | przyjąć                                                                                               |
| P2  | Układ „etykieta i wartość w torze”        | nie budować („chyba nie”)                                                                             |
| P3  | Tryby kroków jako prop                    | nie: wychodzi jedno zachowanie (krok za wskaźnikiem); prop dopiero z konsumentem, który go potrzebuje |
| P4  | Odbicie na końcu lotu do kroku (ok. 3 px) | zostaje: to lot `choice` jak w ToggleGroup                                                            |
| P5  | Przenikanie tekstu suwaka krokowego       | tak, jak tooltip; liczby suwaka ciągłego natychmiast                                                  |
| P6  | Napis końca toru (`end`)                  | zostaje jako opcja, gaśnie przed pigułką                                                              |
| P7  | Szara pigułka (F)                         | nie budować                                                                                           |

## Definition of Done

- [ ] warunki końcowe spełnione, dowody z liczbami w `docs/decisions/e3-slider.md`;
- [ ] odstępstwa S1–S4 zapisane w spec i strukturze;
- [ ] próba usunięta, pułapki w `AGENTS.md`;
- [ ] status „gotowe do oceny” i ocena właściciela na żywo.
