---
kind: decision
date: 2026-11-02
stage: E3, pakiet poprawek po drugiej ocenie właściciela
---

# Skala rozmiaru, kształtu i krawędzi: decyzje z audytu wizualnego

Kto: prowadzący (matematyka systemu, rola z `tessera-wlasciciel-ocenia-ja-licze-system`), 2026-11-02; wygląd każdego punktu ocenia właściciel na żywo. Dowód: audyt wizualny 02.11 (151 plansz, `xs`–`xl`, jasny/ciemny, gęstość skrajna; pomiary `getComputedStyle`), plansze obejrzane przez prowadzącego; pomiar promieni w powierzchniach przy rogach `sm`/`md`/`lg` (02.11); post Haz/Ariakit 01.11 o promieniu koncentrycznym (katalog inspiracji). Uzupełnia `e3-owner-review-2026-11-01.md` R1–R12.

Przyczyna wspólna większości odchyleń: oś `size` dociera tylko do kontrolek; to, co je bezpośrednio otacza (tor, menu, tooltip, „×”, odstęp ikona–tekst), bierze wartości z gęstości albo stałych. Właściciel: „po to są rozmiary, żeby dostosowywać”; wartości rosną ściśle od xs do xl, jak w przycisku.

## Reguła podziału: rozmiar kontra gęstość

| Rodzaj                                             | Przykłady                                                  | Wymiary z                                                      | Promień                                             |
| -------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Kontrolka                                          | przycisk, pole, opcja, wiersz, „×”, Kbd, Badge             | `size`                                                         | własny (kapsuła lub róg osi `corners`)              |
| Opakowanie kontrolek (dzieci to kontrolki/wiersze) | tor ToggleGroup i ButtonGroup, grupa `joined`, menu, lista | `size`: odstęp = `round(wysokość / 8, 0,5 px)` + obrys (R10)   | koncentryczny z dzieckiem: promień dziecka + odstęp |
| Etykieta przy kontrolce                            | tooltip                                                    | `size` (font, wysokość, padding jak kontrolka danego rozmiaru) | jak kontrolka                                       |
| Kontener z tekstem                                 | karta, popover, dialog, alert                              | gęstość (`density`) i typografia                               | silnik powierzchni; kontrolki w środku: R12         |

Gęstość nie zmienia kontrolek ani opakowań kontrolek (dziś zmienia tor: 38→46 px — błąd).

## Decyzje

1. **Odstęp ikona–tekst** rośnie ściśle (dziś xs = sm = 3 px): wzór z wysokości, zaokrąglenie 0,5 px, wartości do tabeli w teście.
2. **Opakowania kontrolek** (tor, `joined`, menu): odstęp `round(h/8, 0,5 px)` + obrys, bez gęstości; promień koncentryczny z dzieckiem (menu xs nie ma już rogu 28,8 px przy wierszach 16 px; xl nie ma 4 px przy wierszach 36 px).
3. **Tooltip** idzie za osią `size` (font, wysokość, padding, promień jak kontrolka).
4. **Kbd i Badge** bez propa dziedziczą rozmiar otoczenia (dziś zawsze xs/sm); jawny `size` zostaje.
5. **„×” w rogu** popupu: rozmiar z linii tytułu kontenera (nie z osi `size` kontrolek), promień wg R12 (koncentryczny przy odstępie < ~16 px, własny przy większym); tytuł i „×” zachowują hierarchię w każdym rozmiarze.
6. **Kontrolki w kontenerze z dużym odstępem** (R12): od ~16 px odstępu kontrolka zachowuje własny promień; koncentryczność tylko tam, gdzie ciasno.
7. **Krawędź nakładek** (menu, popover, dialog: dziś obrys 1 px; karta i pigułka: pierścień w cieniu, R11): zasada właściciela 31.10 „bez obramowań, oddzielenie wypełnieniem i cieniem”. Wykonawca daje plansze 3 wariantów (obrys 1 px / sam cień / cień z różnicą wypełnienia tła) w obu trybach, prowadzący wybiera na planszach i pokazuje właścicielowi.
8. **Wciśnięcie opcji ToggleGroup** jak w v2 (zachowanie): pigułka hover przyjmuje krok wciśnięcia.
9. **Widoczność hover** na wypełnieniu `soft` i triggerach w jasnym trybie (dziś krok 4 %→7 %, na planszach ledwo widoczny): próg jasności OKLab jak w B8, test.

## Strażnicy

- Tabela wartości per rozmiar (wysokość, boki, font, promień, ikona, odstęp ikona–tekst, odstęp opakowania, padding menu, tooltip, Kbd/Badge domyślnie) liczona w Playwright: każda kolumna ściśle rośnie xs→xl.
- Gęstość skrajna nie zmienia wymiarów kontrolek ani opakowań kontrolek.
- Promień kontrolki w karcie/dialogu = promień tej samej kontrolki poza powierzchnią przy rogach `none`–`full`; wiersz menu koncentryczny z menu.
- Brak pierścienia `0 0 0 1px` w cieniach powierzchni wypukłych.
