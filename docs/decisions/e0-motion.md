---
kind: decision
date: 2026-10-31
stage: E0 (c)
---

# Ruch slidingu w v3

## Decyzja właściciela (31.10)

- Bazą są tryby slidingu z v2: `elastic` (bouncy, domyślny), `firm` (zwykły), `off`. Właściciel nie wybiera między technikami (A przenikanie, B ugięcie, C stały rozmiar); technikę dobiera prowadzący, właściciel ocenia efekt na żywo (pamięć `ruch-1-1-technike-wybieram-sam`).
- Próby ruchu w laboratorium przerwane na prośbę właściciela („zamiast testów zacznij robić repo”). Pierwsza ocena ruchu na żywo: ekran „Nakładki w nakładkach” w E2.

## Parametry v2 do odtworzenia (repo MangaShift, branch `refactor/tessera-motion`: `tessera/packages/tessera/src/components/_internal/floating-indicator.tsx`, `src/styles/motion.css`)

| Tryb    | Czas                                         | Krzywa                                                                                                                 | Inne                                                                    |
| ------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| elastic | 220 ms                                       | `elasticProgress`: szczyt w 60% czasu, przestrzał = 0,1 × wysokość kontrolki (najwyżej połowa dystansu), powrót gładki | przy ścianie rodzica przód się zatrzymuje, pigułka się zgniata i odbija |
| firm    | 150 ms, wydłużane logarytmicznie z dystansem | `cubic-bezier(0.2, 0, 0, 1)`                                                                                           | —                                                                       |
| off     | 0                                            | —                                                                                                                      | także przy `prefers-reduced-motion`                                     |

## Technika v3 (decyzja prowadzącego, do oceny na żywo w E2)

- Ruch tylko `transform`/`opacity` (Q2–Q4). Krzywa `elastic` jako klatki kluczowe z `offset` (20 kroków `elasticProgress`), nie `linear()` (Q5).
- Pigułka = zewnętrzny element (jazda) + wewnętrzny `face` (wygląd i ugięcie przy kliknięciu); dwie animacje `transform` na jednym elemencie wypychały ruch z kompozytora (powód 64, laboratorium 31.10).
- Rozmiar pigułki zmienia się w jednej klatce; przejście rozmiaru przez skalę (FLIP). Przy równych elementach (listy, menu, drzewo) to czysty `translate`.
- Laboratorium `PROJECTS/tessera-probe/motion` (warianty A, B, B+, C): 0 animacji poza kompozytorem w Chromium; posłuży jako materiał do E2, potem do usunięcia.
