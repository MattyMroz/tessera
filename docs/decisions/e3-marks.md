# Znacznik wyboru: jedna część dla pudełka i wiersza

Data: 2026-11-04. Zdecydował: właściciel („nie rób tego od nowa, używaj istniejących animacji”), wykonanie prowadzący.

## Wybór

Ptaszek i kropka to jedna część `Mark` (`components/checkbox/checkbox.tsx`): `<span data-slot="mark" data-recipe="indicator" data-variant="check | dot">`. Wygląd i ruch znacznika żyją tylko w przepisie `indicator` (warianty `check` i `dot`):

- ptaszek: jedna ścieżka `M5 12.5l4.5 4.5L19 7.5` w `viewBox="0 0 24 24"`, rysowanie `stroke-dashoffset` czasami `draw-in` / `draw-out` i krzywą `ease-draw`; minus (`mixed`) to druga ścieżka tej samej części;
- kropka: koło `currentColor`, skala `0` → `--ts-size-dot-scale` w czasie `choice` z `ease-elastic`;
- stan z rodzica: `aria-checked` (pudełko, wiersz menu) albo `aria-selected` (opcja listy).

Gospodarz daje tylko miejsce i rozmiar slotu `mark`: `control` (pudełko `Checkbox`, kółko `Radio`; ptaszek odsunięty o `--ts-shape-mark-inset`, czyli dawny margines `viewBox` −4…28, więc pudełko wygląda jak przedtem), `row` (slot w rozmiarze ikony, z przodu wiersza, odstęp od krawędzi `--ts-shape-control-side-icon`).

## Odrzucone

- Kopia reguł rysowania i kropki w przepisie `row` obok `control`: dwie kopie rozjechały się od razu (ptaszek z lucide rysował się od prawej, `Checkbox` od lewej).
- Siódmy przepis „mark”: lista przepisów jest zamknięta (sześć).
- Ikona lucide `Check` w wierszu: inny kształt i kierunek rysowania niż w `Checkbox`.

## Skutek

Glif ptaszka w pudełku `Checkbox` ma ¾ pudełka (`--ts-shape-mark-inset` odsuwa slot z każdej strony o ⅛ pudełka), nie całe pudełko jak przy marginesie `viewBox` −4…28; widoczny ptaszek jest ten sam (14/24 · ¾ = 14/32). Test `checkbox.spec.ts` pilnuje proporcji ¾ i środka. Zmiana testu: 08.11, wykonanie prowadzący.

Testy, które biorą `[data-recipe="indicator"]` za pigułkę, pomijają znaczniki (`:not([data-slot="mark"])` w `tests/helpers.ts`).
