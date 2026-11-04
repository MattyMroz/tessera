---
kind: plan
status: wdrożony i przyjęty przez właściciela na żywo 2026-11-03 (decyzje 20–23 w `docs/decisions/e3-motion.md`)
updated: 2026-11-03
---

# Plan: jedna skala czasów ruchu dla każdego elementu

## Cel

Każdy ruch w Tesserze bierze czas i krzywą z jednej skali w silniku `motion`. Żaden element nie ma własnej szybkości. Skala obejmuje każdy element i każdy jego ruch: hover, wciśnięcie, wybór, otwarcie, zamknięcie i pętle, w trzech trybach: ruch zwykły, systemowe „ogranicz ruch” i ruch wyłączony w aplikacji. Wynik ma być szybki („szybkość jest najważniejsza”), ale nie surowy tam, gdzie płynność pomaga („150 ms na wyjściu wygląda premium, smooth”).

Źródła: `docs/research/e3-interaction-states.md`, `docs/research/e3-no-enter-animation.md`, `docs/decisions/e3-motion.md` (sekcje „Decyzja właściciela 02.11” i „hover”), strona porównawcza https://claude.ai/artifact/5Rn43A7HrxiU7sDzp5zsvY.

## Zasady (wiążą każdą pozycję tabel)

1. **Otwarcie bez czekania.** Hover, menu, lista rozwijana, podmenu, tooltip i popover pojawiają się w tej samej klatce, w której nastąpiło działanie (właściciel 02.11: „1/10 sekundy razy 10 kliknięć to sekunda czekania”; menu macOS według Rauno Freiberga, Raycast według Emila Kowalskiego).
2. **Zamknięcie popupu bez czekania.** Menu, lista rozwijana, podmenu, tooltip i popover znikają w tej samej klatce (właściciel 02.11: „zamykanie chyba tak samo szybkie, bez opóźnienia”). Do potwierdzenia na stronie stanu końcowego (O1).
3. **Płynne wyjście hovera tylko dla elementu, który stoi pojedynczo.** Przycisk, ikona, trigger, pole i segment grupy zapalają się od razu i gasną w 150 ms (właściciel: „150 wygląda bardzo premium, smooth”).
4. **W gęstej liście nie ma poświaty.** Wiersz listy, menu i drzewa bez pigułki zapala się i gaśnie od razu, bo każde wyjście z czasem zostawia za kursorem ogon (właściciel: „na 100 też jest poświata, zawsze jest poświata”; VS Code i WinUI `ListViewItem` mają tak samo). Gdy lista ma pigułkę (sliding), jedna pigułka jedzie za kursorem i gaśnie z czasem wyjścia hovera dopiero po zjechaniu z całej listy; wtedy gaśnie jeden element, więc poświaty nie ma.
5. **Jedno działanie, jeden sygnał.** Opcja wyboru (toggle group, zakładka, przyszłe checkbox i switch) i wiersz menu nie mają kroku wciśnięcia; sygnałem jest wynik. Opcja wybrana nie reaguje na hover (Radix Themes, research punkt 1).
6. **Zmiana całej sceny ma krótką animację.** Dialog z tłem i przyszły panel boczny animują wejście i wyjście, bo to przejście całości, nie reakcja elementu (właściciel: „to się liczy jako animacja całości”; dzisiejszy dialog „fajnie animowany”).
7. **Element, który przychodzi sam, ma animację wejścia.** Przyszły toast (Emil Kowalski: nagłe pojawienie się „would feel off”; właściciel: „toasty powinny mieć animację”).
8. **Kategoria, nie element.** Czas wynika z kategorii; element dostaje kategorię, nigdy własną liczbę.

## Kategorie czasu (stan końcowy)

| Kategoria                                                                 | Wejście                                | Wyjście | Krzywa                           | Wyjście silnika                                               | Status                                    |
| ------------------------------------------------------------------------- | -------------------------------------- | ------- | -------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| Natychmiast                                                               | 0                                      | 0       | –                                | brak przejścia                                                | zasada 1, 2, 4                            |
| Wyjście hovera                                                            | 0                                      | 150 ms  | `ease-out`                       | `--ts-motion-duration-hover-out`                              | decyzja właściciela 02.11                 |
| Wciśnięcie (TE)                                                           | 50 ms                                  | 224 ms  | `ease-out` / `standard`          | `--ts-motion-duration-press-in`, `-press-out` (są)            | decyzja 02.11                             |
| Najkrótsze wciśnięcie                                                     | 50 ms                                  | –       | –                                | `--ts-motion-press-hold` (jest)                               | wdrożone                                  |
| Pogoń (pigułka hover za kursorem, tooltip przelatujący między triggerami) | 100 ms, bez odbicia                    | –       | `ease-out`                       | `--ts-motion-duration-follow`                                 | rekomendacja, O2                          |
| Wybór (pigułka wyboru w toggle group i zakładkach)                        | elastic 220 ms, odbicie 10 % wysokości | –       | krzywa elastic z `lib/flight.ts` | `--ts-motion-duration-choice`, `--ts-motion-choice-overshoot` | rekomendacja, O2                          |
| Scena (dialog, tło dialogu, przyszły panel)                               | 250 ms                                 | 250 ms  | `emphasized`                     | `--ts-motion-duration-scene`                                  | dzisiejsza wartość, właściciel zadowolony |
| Powiadomienie (przyszły toast)                                            | wartość przy rundzie toastu            |         |                                  |                                                               | poza zakresem                             |
| Pętla zajętości (spinner)                                                 | 1,2 s / obrót                          | –       | `linear`                         | `--ts-motion-loop` (jest)                                     | bez zmian                                 |

Opóźnienia zachowania, nie ruchu (stałe w `lib/tooltip-group.ts`, bez zmian): otwarcie tooltipa po 400 ms, zamknięcie tooltipa po 100 ms w przerwie między przyciskami, łaska grupy 400 ms.

## Każdy element i każdy jego ruch (stan końcowy)

| Element                                                       | Hover                                                                                                    | Wciśnięcie                                       | Wybór / przejazd                        | Otwarcie / zamknięcie                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | -------------------------------------------- |
| Button                                                        | wyjście hovera (0 / 150)                                                                                 | TE                                               | –                                       | –                                            |
| Button z ikoną, pasek narzędzi                                | wyjście hovera                                                                                           | TE                                               | –                                       | –                                            |
| Trigger menu, popovera, dialogu, tooltipa                     | wyjście hovera                                                                                           | TE4 (trigger stoi)                               | –                                       | –                                            |
| Trigger listy rozwijanej (`aria-haspopup='listbox'`)          | wyjście hovera                                                                                           | brak skali, tylko krok koloru (właściciel 02.11) | –                                       | –                                            |
| Segment grupy `joined`                                        | wyjście hovera                                                                                           | według O3                                        | –                                       | –                                            |
| Input, Textarea                                               | wyjście hovera                                                                                           | brak                                             | –                                       | –                                            |
| Opcja ToggleGroup                                             | pigułka: pojawia się od razu, pogoń 100 ms, gaśnie po zjechaniu z toru w 150 ms; na wybranej brak        | brak                                             | pigułka wyboru: wybór (elastic 220 ms)  | –                                            |
| Wiersz menu i podmenu                                         | pigułka jak w torze                                                                                      | brak                                             | –                                       | –                                            |
| Wiersz listy lub drzewa bez pigułki (przyszłe)                | natychmiast (0 / 0)                                                                                      | brak                                             | –                                       | –                                            |
| Menu, podmenu, lista rozwijana, popover                       | –                                                                                                        | –                                                | –                                       | natychmiast / natychmiast (O1)               |
| Tooltip                                                       | –                                                                                                        | –                                                | przelot między triggerami: pogoń 100 ms | natychmiast po 400 ms czekania / natychmiast |
| Dialog, AlertDialog, tło                                      | –                                                                                                        | –                                                | –                                       | scena 250 / 250 ms (tylko `opacity`)         |
| Obrys fokusu                                                  | –                                                                                                        | –                                                | –                                       | natychmiast                                  |
| Card, Alert, Badge, Kbd, Text, Heading                        | –                                                                                                        | –                                                | –                                       | bez ruchu                                    |
| Button zajęty                                                 | –                                                                                                        | –                                                | –                                       | pętla spinnera                               |
| Card jako link                                                | O7 planu `e3-motion.md`                                                                                  |                                                  |                                         | poza zakresem                                |
| Przyszłe Checkbox, Switch, Slider, Tabs, Select, Toast, panel | dostają kategorię z tej tabeli w swojej rundzie; Checkbox, Switch i Tabs bez kroku wciśnięcia (zasada 5) |                                                  |                                         |                                              |

## Trzy tryby ruchu (rekomendacja, O4)

| Ruch                   | Zwykły           | Systemowe „ogranicz ruch” (`prefers-reduced-motion`)                       | Ruch wyłączony w aplikacji (`data-motion='off'`) |
| ---------------------- | ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| Wyjście hovera (kolor) | 150 ms           | 150 ms (zmiana koloru nie jest ruchem; Apple zamienia ruch na przenikanie) | 0                                                |
| Wciśnięcie (skala)     | TE               | brak skali, zostaje krok koloru                                            | brak skali                                       |
| Pogoń i wybór pigułki  | 100 ms / elastic | pigułka przeskakuje w jednej klatce                                        | przeskakuje                                      |
| Scena (dialog)         | 250 ms `opacity` | 250 ms `opacity` (przenikanie, bez ruchu)                                  | 0                                                |
| Pętla spinnera         | kręci się        | kręci się (informacja, że coś trwa; WCAG 2.3.3 dopuszcza ruch niezbędny)   | kręci się                                        |

Dziś oba tryby ograniczenia działają jak „off” i zatrzymują też spinner (`--ts-motion-spin: none`).

## Silnik `motion` po zmianie

- **Dodane:** `--ts-motion-duration-hover-out` (150 ms), `--ts-motion-ease-hover` (`ease-out`), `--ts-motion-duration-follow` (100 ms), `--ts-motion-duration-choice` (220 ms), `--ts-motion-choice-overshoot` (0,1), `--ts-motion-duration-scene` (250 ms).
- **Usunięte (zero legacy):** `--ts-motion-duration-hover-exit`, wejście `--ts-in-motion-hover-fade`, `--ts-motion-duration-overlay`, `--ts-motion-duration-slide`, `--ts-motion-duration-elastic`, `--ts-motion-elastic-overshoot`, `--ts-motion-spring-stiffness`, `--ts-motion-spring-damping`, `--ts-motion-duration-emphasized`, `--ts-motion-ease-spring`; `--ts-motion-duration-instant` zostaje tylko, jeśli ma konsumenta po zmianie.
- **Oś `data-motion`:** wartości `on` i `off`; tryby `spring`, `elastic`, `firm` znikają (trzy szybkości tego samego ruchu łamią jedną skalę). `prefers-reduced-motion` to osobny blok według tabeli trybów.

## Przepisy i biblioteka

- `control`: przejście `background-color` płytki `::before` z `hover-out` tylko na wyjściu (wejście bez przejścia) dla przycisku, ikony, triggera, pola i segmentu; opcja toru i wiersz bez kroku wciśnięcia; wybrana opcja bez hovera.
- `row`: bez przejścia (zasada 4).
- `indicator`: pigułka hover pojawia się bez przejścia, gaśnie z `hover-out`; ruch pigułki: pogoń dla hover, wybór dla pigułki wyboru.
- `surface`: dialog i tło ze `scene`; menu, popover i tooltip bez przejścia otwarcia i zamknięcia.
- `lib/flight.ts`: dwa ruchy (pogoń: krzywa 100 ms; wybór: elastic) zamiast trzech trybów; `lib/motion.ts` czyta nowe wyjścia; `lib/popup-flight.ts` bierze `follow`.

## Koszt i spec

- Wyjście hovera z przejściem koloru maluje płytkę w każdej klatce na wątku głównym, ale tylko przy gaśnięciu jednego elementu. Pomiar sekcji B dziennika (przejazd po 10 przyciskach: 17 ms bez przejścia, 46 ms przy 100 / 100) zostanie powtórzony dla 0 / 150 przed i po wdrożeniu w jednej sesji.
- Spec do zmiany razem z wdrożeniem: B2 dostaje nazwany wyjątek „przejście koloru przy wyjściu hovera kontrolki”, T2 bez zmiany celu (4 ms; wynik pomiaru do decyzji właściciela), N8 obowiązuje dla wierszy, a dla kontrolek przestaje (D-W3), R4 (zgaśnięcie pigułki 300 ms) zastąpione 150 ms.

## Otwarte decyzje właściciela

Wszystkie cztery rozstrzygnięte przez właściciela 02.11 (`docs/decisions/e3-motion.md`, „Akceptacja stanu końcowego”).

| #   | Pytanie                                                 | Rekomendacja               | Jak ocenić                                    | Stan                     |
| --- | ------------------------------------------------------- | -------------------------- | --------------------------------------------- | ------------------------ |
| O1  | Zamknięcie menu, listy rozwijanej, tooltipa i popovera  | natychmiast                | strona stanu końcowego                        | rozstrzygnięte: przyjęte |
| O2  | Pigułka: pogoń 100 ms bez odbicia, wybór elastic 220 ms | tak                        | strona stanu końcowego                        | rozstrzygnięte: przyjęte |
| O3  | Wciśnięcie segmentu grupy `joined`                      | (a) bez skali, krok koloru | strona porównawcza D9                         | rozstrzygnięte: przyjęte |
| O4  | Trzy tryby ruchu według tabeli                          | tak                        | strona stanu końcowego z przełącznikiem trybu | rozstrzygnięte: przyjęte |

## Wykonanie

1. **Strona stanu końcowego (Sonnet, z szablonu stron porównawczych):** każdy element z tabeli „Każdy element” w stanie końcowym, w jednym widoku: pasek przycisków, pola, grupa `joined`, ToggleGroup, menu i podmenu, lista rozwijana, tooltip, popover, dialog, lista 12 wierszy bez pigułki i z pigułką, spinner. Przełącznik trybu: zwykły, „ogranicz ruch”, „ruch wyłączony”; przełącznik jasny i ciemny; spowolnienie 10×. Bez wariantów: to ma wyglądać jak gotowa biblioteka. Kontrola: prowadzący czyta kod i sprawdza stronę przed wysłaniem.
2. **Checkpoint właściciela:** O1–O4 zapisane w `docs/decisions/e3-motion.md` w chwili decyzji.
3. **Wdrożenie (Sonnet, wąski brief, zero git):** silnik → `lib/motion.ts`, `flight.ts`, `popup-flight.ts` → przepisy → dokumenty (spec B2, T2, N8, W8; `AGENTS.md`; `e3-choices.md`; `packages/tessera/docs/*.md`).
4. **Strażnicy:** `interaction.spec.ts` czyta czas i krzywą każdego elementu z tabeli z computed style i porównuje z wyjściem silnika jego kategorii, w trzech trybach; `contracts.test.ts`: każde wyjście czasu ma konsumenta, żadnego czasu poza silnikiem; `budgets.spec.ts`: wyjątek B2 nazwany i mierzony.
5. **Bramki:** `bun run check`; `bun run perf` przed i po w jednej sesji.
6. **Ocena:** prowadzący na żywo, potem właściciel w laboratorium.

## Poza zakresem

Grupowanie tooltipów (przerwa należy do grupy), wygląd szwu `joined` (R9), karta-link (O7), własny pasek przewijania (ScrollArea), toast i panel boczny jako komponenty, runda D.

## Definition of Done

- Każdy ruch z tabeli „Każdy element” bierze czas z jednej kategorii silnika, w trzech trybach; zero czasów poza silnikiem i stałymi zachowania tooltipa.
- O1–O4 rozstrzygnięte i zapisane z datą i dowodem.
- Strażnik czasów czerwony na celowo zmienionym czasie jednego elementu, zielony po przywróceniu.
- `bun run check` zielone; pomiar przed i po w jednej sesji w dzienniku.
- Właściciel powiedział „ok” na żywo.
