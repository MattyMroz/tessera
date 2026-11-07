---
kind: research
created: 2026-11-06
subject: motion
---

# 20 zasad animacji UI (TikTok, 06.11) kontra silnik `motion` Tessery

## Źródło

- Film: https://vm.tiktok.com/ZN8fLoNj3/ („20 Ways to Make Beautiful AI Animations (in under 60 seconds)”, 54,5 s, 720 × 1280, 30 kl./s). Właściciel pobrał go i przepisał tekst (06.11).
- Kopia: `tmp/ref/motion/2026-11-06-tiktok-20-ways-ui-animations/media/video.mp4`. Arkusze klatek (2 kl./s, po 14 s): `frames/sheet-0.png` … `sheet-3.png`.
- Każda zasada ma scenę „Before / After” z podpisem parametru. Podpisy odczytane z klatek są w kolumnie „Scena”.
- Większość zasad pochodzi z kursu Emila Kowalskiego (animations.dev): skala 0,95, `transform-origin` od triggera, krótsze wyjście. Ten sam autor zaleca brak animacji w menu używanym setki razy dziennie (Raycast). Na nim opiera się nasza decyzja z 02.11 o popupach bez przejścia.

## Porównanie

Oznaczenia: **zgodne**; **rozbieżne** (inna decyzja właściciela albo inna wartość); **brak** (nie mamy jeszcze takiego elementu); **wyjątek** (wymaga właściwości spoza `transform`/`opacity`).

| #   | Zasada                                | Scena (Before → After)                                                  | Tessera teraz                                                                                                                                          | Ocena                                                                           |
| --- | ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1   | Ease-out na wejście                   | ease-in 250 ms → ease-out 250 ms (menu „Options”)                       | wejścia bez czasu (hover, popupy); dialog i tło `scene` 250 ms, `ease-emphasized` (0.3, 0, 0, 1), czyli ease-out                                       | zgodne                                                                          |
| 2   | Dropdown 150–250 ms                   | 600 ms → 200 ms                                                         | menu, lista, podmenu, popover i tooltip pojawiają się i znikają w tej samej klatce (właściciel 02.11, `docs/plans/e3-motion-timing.md` zasady 1–2, O1) | rozbieżne: decyzja właściciela                                                  |
| 3   | Stagger wierszy 30 ms                 | 200 ms między wierszami → 30 ms                                         | wiersze menu bez przejścia                                                                                                                             | rozbieżne: wynika z #2                                                          |
| 4   | Skala 0,97 przy wciśnięciu            | brak reakcji → `scale(0.97)` 150 ms                                     | `--ts-motion-press-scale: 0.97`, 50 ms wejście / 224 ms powrót (TE, 02.11)                                                                             | zgodne                                                                          |
| 5   | Rozciąganie kciuka o 12 %             | sztywne koło → rozciąganie z zachowaniem pola (spłaszczone w pionie)    | kciuk Switcha wydłuża się przy wciśnięciu o `--ts-size-thumb-stretch` (¼ kciuka, ok. 25 %), bez spłaszczenia w pionie; nie rozciąga się w ruchu        | rozbieżne: inna wartość i chwila                                                |
| 6   | Stagger, gdy detale osiadają          | sztywny wspólny stop → licznik dojeżdża 50 ms po karcie                 | brak elementu z zależną częścią w ruchu                                                                                                                | brak                                                                            |
| 7   | Łuk dla ruchu obiektu                 | prosta → łuk 32 px                                                      | pigułki jeżdżą po prostej w torze (to ruch w osi, łuk nie dotyczy); tooltip między triggerami po prostej (`popup-flight.ts`)                           | nie dotyczy teraz                                                               |
| 8   | Impuls potwierdza sukces              | sama etykieta „Saved” → etykieta i jeden impuls                         | `ts-pulse` istnieje tylko jako pętla; przycisk nie ma stanu sukcesu                                                                                    | brak                                                                            |
| 9   | Ease-in-out dla przesunięć            | linear 300 ms → ease-in-out 300 ms                                      | pigułka hover: `follow` 100 ms, ease-out; pigułka wyboru: `choice` 220 ms, elastic                                                                     | małe odchylenie (ease-out zamiast ease-in-out); scena walczy głównie z `linear` |
| 10  | Popover od skali 0,95                 | `scale(0)` → 1 kontra `scale(0.95)` → 1                                 | popover bez przejścia                                                                                                                                  | rozbieżne: decyzja właściciela                                                  |
| 11  | Wejście od triggera                   | `transform-origin: center` → `top right`                                | brak wejścia; Base UI daje `--transform-origin` od triggera, gotowe do użycia                                                                          | rozbieżne: wynika z #2                                                          |
| 12  | Wyjście do triggera                   | gaśnięcie do środka → wyjście w stronę triggera                         | brak wyjścia                                                                                                                                           | rozbieżne: wynika z #2                                                          |
| 13  | Bez odbicia w codziennym UI           | karta z wahnięciem → bez przestrzelenia                                 | odbicie tylko przy wyborze (`choice`, przestrzelenie 0,1 wysokości, szczyt w 60 %), bez odbicia przy podążaniu (`follow`); decyzja właściciela 05.11   | rozbieżne częściowo, patrz niżej                                                |
| 14  | Bez tweenu przy trzymaniu             | tween przy przeciąganiu → bezpośrednie śledzenie wskaźnika              | nie mamy przeciągania (Slider, przeciągany Switch)                                                                                                     | brak; reguła na Slider                                                          |
| 15  | Wyjście o 20 % krótsze                | 250 / 250 ms → 250 / 200 ms                                             | dialog `scene` 250 ms w obie strony; hover wchodzi od razu, gaśnie 150 ms; rysowanie znaku 350 / 150 ms                                                | rozbieżne dla dialogu                                                           |
| 16  | Nowy stan wchodzi, gdy stary wychodzi | wyjście, pusta chwila, wejście → nakładają się                          | pigułka wyboru to jeden obiekt w ruchu (brak pustej chwili); przycisk nie ma zmiany etykiety                                                           | zgodne tam, gdzie mamy                                                          |
| 17  | Maski do odsłaniania i koloru         | gaśnięcie treści → przycinanie i maska tekstu (segment „Notes / Files”) | etykieta opcji ToggleGroup zmienia kolor pod pigułką akcentu, bez maski                                                                                | wyjątek: `clip-path` poza listą ruchu                                           |
| 18  | Przenikanie ikon ze skalą i rozmyciem | twarda podmiana → skala, krycie i rozmycie                              | brak podmiany ikon w ruchu                                                                                                                             | wyjątek: `filter: blur` poza listą ruchu                                        |
| 19  | Gumka za granicą                      | twardy stop → malejący opór                                             | brak przeciągania                                                                                                                                      | brak; reguła na Slider i przewijanie                                            |
| 20  | Ten sam `layoutId`                    | rozłączna podmiana → ten sam obiekt się rozszerza                       | jedna pigułka na kontener (`lib/indicator.ts`), jedna pigułka paska menu (05.11)                                                                       | zgodne                                                                          |

## Gdzie film się z nami nie zgadza

1. **Popupy (#2, #3, #10, #11, #12, #15).** Film: menu i popover wchodzą w 150–250 ms od skali 0,95 z punktu triggera i wychodzą do triggera o 20 % krócej. Tessera: pojawiają się i znikają w jednej klatce (właściciel 02.11: „1/10 sekundy razy 10 kliknięć to sekunda czekania”; menu macOS według Rauno Freiberga, Raycast według Emila Kowalskiego). Obie drogi są poprawne. Krótkie wejście pasuje do rzadko otwieranego popovera, a natychmiastowe do menu i listy używanych cały dzień. Technicznie wejście 0,95 → 1 z krycia mieści się w zasadzie „tylko `transform` i `opacity`”, a Base UI daje `--transform-origin` i `data-starting-style`.
2. **Odbicie (#13).** Film odradza sprężynę w codziennych przejściach. Scena pokazuje wahnięcie całej karty przy wejściu. Nasze odbicie dotyczy tylko jazdy pigułki wyboru (0,1 wysokości, jedno przestrzelenie, bez wahnięcia). Radio z referencji Gustava (`e3-radio-reference.md`) też przestrzeliwuje do ok. 1,1. Zasada #13 nie obala decyzji z 05.11, ale wymaga uwagi: w `choice` nie dokładać drugiego wahnięcia i nie dawać odbicia przy wejściu powierzchni.
3. **Kciuk (#5).** Film: rozciąganie o 12 % w trakcie ruchu, z zachowaniem pola (szerszy i niższy). Tessera: ok. 25 % przy wciśnięciu, sama szerokość. Do porównania na żywo przy następnej pracy nad Switchem.
4. **Krzywa ruchu (#9).** Film: ease-in-out. Tessera: pigułka hover ma ease-out. Scena porównuje głównie z `linear`, więc różnica jest mała. Rozstrzygnięte 06.11 po filmie i próbie na żywo: zostaje ease-out, bo ease-in-out rusza każdy przerwany lot od zera i pigułka zostaje za kursorem (decyzja w `docs/decisions/e3-choices.md`).
5. **Wyjście dialogu (#15).** Dialog i tło wchodzą i wychodzą w `scene` 250 ms. Zasada daje wyjście 200 ms. Zmiana wymaga nowego wyjścia silnika (`scene-out`), nie liczby w przepisie.

## Wyjątki ruchu, gdyby właściciel chciał #17 albo #18

- Maska tekstu (#17) potrzebuje `clip-path` albo `mask` w ruchu, a przepisy pozwalają tylko na `transform`/`translate`/`scale`/`rotate`/`opacity` (`AGENTS.md`, „Wydajność i ruch”). Byłby to nowy nazwany wyjątek z pomiarem B2.
- Rozmycie ikon (#18) to `filter: blur()` w ruchu, czyli też nowy wyjątek. Bez rozmycia (sama skala i krycie) mieści się w regule.

## Do decyzji właściciela

- Popupy (#2, #10–12, #15): rozstrzygnięte 06.11 po próbie na żywo. Zostają natychmiastowe (`docs/decisions/e3-choices.md`, „Popupy bez przejścia, potwierdzone”).
- Kciuk Switcha: 12 % z zachowaniem pola kontra obecne 25 %, przy pracy nad Switchem.
- #8, #14, #19 trafiają jako wymagania do Button (stan sukcesu), Slider i przewijania, gdy te elementy przyjdą.
