---
kind: decision
date: 2026-10-31
stage: E0 (c)
---

# Ruch slidingu w v3

## Decyzja właściciela (31.10)

- Bazą są tryby slidingu z v2: `elastic` (bouncy), `firm` (zwykły), `off` (brak ruchu, to samo co `prefers-reduced-motion`); domyślny jest `spring` (uzupełnienie niżej). Właściciel nie wybiera między technikami (A przenikanie, B ugięcie, C stały rozmiar); technikę dobiera prowadzący, właściciel ocenia efekt na żywo (pamięć `ruch-1-1-technike-wybieram-sam`).
- Próby ruchu w laboratorium przerwane na prośbę właściciela („zamiast testów zacznij robić repo”). Pierwsza ocena ruchu na żywo: ekran „Nakładki w nakładkach” w E2.
- Uzupełnienie 31.10 (plan E2, D6): właściciel chce „lekkiego bounce jak na mangashift.com”. Strona jedzie sprężyną Motion (k 420, c 36), która prawie nie przestrzeliwuje (0,31 % drogi), więc dochodzi czwarty tryb `spring` i jest domyślny do oceny na żywo; `elastic` z v2 zostaje jako tryb z widocznym odbiciem. Domyślny tryb wybiera właściciel w checkpoincie 2 E2.

| Tryb dodany | Czas                           | Krzywa                                                                                      | Inne                                   |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| spring      | do 0,5 px od celu (ok. 300 ms) | sprężyna k 420, c 36, masa 1, klatki WAAPI z `offset`; prędkość przenoszona przy zawróceniu | przestrzał przycięty do ściany rodzica |

## Parametry v2 do odtworzenia (repo MangaShift, branch `refactor/tessera-motion`: `tessera/packages/tessera/src/components/_internal/floating-indicator.tsx`, `src/styles/motion.css`)

| Tryb    | Czas                                         | Krzywa                                                                                                                 | Inne                                                                    |
| ------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| elastic | 220 ms                                       | `elasticProgress`: szczyt w 60% czasu, przestrzał = 0,1 × wysokość kontrolki (najwyżej połowa dystansu), powrót gładki | przy ścianie rodzica przód się zatrzymuje, pigułka się zgniata i odbija |
| firm    | 150 ms, wydłużane logarytmicznie z dystansem | `cubic-bezier(0.2, 0, 0, 1)`                                                                                           | —                                                                       |
| off     | 0                                            | —                                                                                                                      | także przy `prefers-reduced-motion`                                     |

## Technika v3 (decyzja prowadzącego, do oceny na żywo w E2)

- Ruch tylko `transform`/`opacity` (Q2–Q4). Krzywa `elastic` jako klatki kluczowe z `offset` (20 kroków `elasticProgress`), nie `linear()` (Q5).
- Pigułka = jazda (`translate`) + zgniecenie przy ścianie (`scale`, ten sam element maluje pigułkę), dwa elementy; pigułka się nie wciska (decyzja właściciela 31.10), więc trzeci element (osobna warstwa wciśnięcia) zniknął; dwie animacje tej samej właściwości na jednym elemencie wypychały ruch z kompozytora (powód 64, laboratorium 31.10; potwierdzone w recenzji `reviews/e2-plan-tech.md` P7).
- Rozmiar pigułki zmienia się w jednej klatce na starcie przelotu; FLIP przez skalę odłożony (zniekształca promień). Przy równych elementach (listy, menu, drzewo) to czysty `translate`.
- Laboratorium `PROJECTS/tessera-probe/motion` (warianty A, B, B+, C): 0 animacji poza kompozytorem w Chromium; posłuży jako materiał do E2, potem do usunięcia.
