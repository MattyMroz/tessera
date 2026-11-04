# Karta: wiersz ze znacznikiem i Select

Krok 1 skilla `tessera-element`. Wzorce: MangaShift desktop (`packages/ui`, Radix) i v2 (`tmp/v2/code/packages/tessera/src`); wartości Tessery z silników. Kodu wzorców nie przenosimy.

## Wiersz (przepis `row`, wspólny dla Menu, Select, paska i menu kontekstowego)

| Część                                         | Karta                                                                                                                                                                  | Źródło                                   | Wada wzorca                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| Kolejność                                     | znacznik → ikona → tekst → `trail` (skrót, cena) → szewron                                                                                                             | desktop, v2, macOS                       | —                                                                |
| Ptaszek                                       | z przodu, lucide `Check` w slocie `icon`, rozmiar `--ts-size-icon`                                                                                                     | desktop menu, v2                         | desktop Select stawia go z tyłu i robi 14 px zamiast 16 px       |
| Kropka                                        | z przodu, koło `currentColor`, `--ts-size-dot-scale` (0,44) slotu `icon`                                                                                               | desktop (8 z 16 px), v2                  | —                                                                |
| Szewron podmenu                               | z tyłu, rozmiar `--ts-size-icon`, jak każda ikona                                                                                                                      | desktop                                  | v2: 14 px obok ikon 16 px                                        |
| Kolumna znacznika                             | lista, w której choć jeden wiersz ma znacznik, wcina tekst wszystkich wierszy o kolumnę znacznika; automatycznie, bez propa                                            | —                                        | oba wzorce: wcięcie ręczne (`inset`), mieszane menu niewyrównane |
| Odstęp od krawędzi                            | od strony tekstu `--ts-shape-control-side`; od strony znacznika, ikony i szewronu `--ts-shape-control-side-icon` (jak w przycisku), także gdy szewron siedzi w `trail` | przycisk Tessery                         | desktop 34 / 12 px, v2 29 / 8 px na sztywno                      |
| Odstęp znacznik–tekst                         | `--ts-size-gap`                                                                                                                                                        | silnik `size`                            | desktop 6 px, v2 5 px na sztywno                                 |
| Ruch ptaszka                                  | rysowanie jak `Checkbox`: wejście `draw-in` 350 ms, wyjście `draw-out` 150 ms, `ease-draw`; znacznik zostaje w DOM (`keepMounted`)                                     | `recipes/control.css`                    | oba wzorce: brak ruchu                                           |
| Ruch kropki                                   | skala jak `Radio`: `choice` z `ease-elastic`                                                                                                                           | `recipes/control.css`                    | oba wzorce: brak ruchu                                           |
| Hover                                         | pigułka `follow` 100 ms bez odbicia, spłaszczenie przy brzegu listy                                                                                                    | `Menu` Tessery, desktop (pigułka 150 ms) | —                                                                |
| Wciśnięcie                                    | brak kroku wciśnięcia (reguła AGENTS.md: wiersz menu)                                                                                                                  | AGENTS.md, desktop                       | —                                                                |
| Wyłączony                                     | `--ts-state-disabled`, szewron zostaje                                                                                                                                 | silnik `state`                           | desktop i v2 chowają szewron                                     |
| Kolor znacznika                               | kolor etykiety                                                                                                                                                         | desktop                                  | v2 Select: przygaszony                                           |
| `prefers-reduced-motion`, `data-motion="off"` | rysowanie i skala bez ruchu (silnik już zeruje `draw`)                                                                                                                 | silnik `motion`                          | —                                                                |

## Select

| Część              | Karta                                                                                            | Źródło                                 | Uwaga                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Trigger            | `Button` (`soft`, `outline`) z szewronem w dół, szewron obrócony przy otwartej liście, bez ruchu | właściciel 04.11                       | —                                                                                                                      |
| Tryby listy        | na triggerze (domyślny), nad, pod                                                                | desktop i v2: `item-aligned` domyślnie | —                                                                                                                      |
| Tryb na triggerze  | tekst wybranej opcji na tekście wartości, 0,00 px przy DSF 1 / 1,25 / 1,5 i lupie 1× / 2× / 4×   | pomiar 04.11                           | sam Base UI chybia o 1–1,3 px                                                                                          |
| Przewijanie strony | lista nie blokuje przewijania; kolumny `sticky` stoją                                            | AGENTS.md (B5, menu niemodalne)        | Base UI w trybie na triggerze zawsze daje `overflow: hidden` na `<body>`, a wtedy `sticky` puszcza (−279 px zmierzone) |
| Szerokość          | lista co najmniej tak szeroka jak trigger                                                        | desktop, v2                            | przy lupie 2× / 4× dwa razy za szeroka (CSS `zoom`)                                                                    |
| Długa lista        | przewija się bez paska; tryb na triggerze przycięty do okna                                      | —                                      | niesprawdzone                                                                                                          |
| Zamiana wartości   | A przesuw albo B przesuw + rozmycie                                                              | referencja z X                         | do wyboru                                                                                                              |

## Strona prób

Wszystkie odmiany naraz w Menu, Selecie, pasku i menu kontekstowym: ptaszek, kropka, szewron, ikona, skrót, `trail`, wiersz wyłączony, mieszana lista (wiersze ze znacznikiem i bez), rozmiary `xs`–`xl`.

## Do decyzji właściciela

1. Blokada przewijania w trybie na triggerze:
   - **A (rekomendacja):** własne wyrównanie bez trybu wyrównania Base UI; brak blokady w każdej aplikacji, lista jedzie ze stroną.
   - B: `overflow` na `<html>` laboratorium; blokada trafia na `<html>`, `sticky` stoi, ale każda aplikacja konsumenta musi zrobić to samo.
2. Zamiana wartości: A albo B (B to wyjątek `filter` od reguły ruchu).
3. Kolumna znacznika automatyczna dla całej listy: tak (rekomendacja) czy nie.
