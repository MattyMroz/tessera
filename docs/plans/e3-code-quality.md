---
kind: plan
status: accepted
updated: 2026-11-01
---

# Plan: refaktor jakości kodu E3 (paczka, laboratorium, testy)

## Rezultat

Kod paczki, laboratorium i testów spełnia poprzeczkę właściciela („jak senior: prosto, właściwy zakres i miejsce, bez redundancji, bez dziwnych konstrukcji”) bez zmiany wyglądu ani zachowania. Każda wiedza ma jedno miejsce; przepis nie zna komponentu; publiczne API jest świadome; laboratorium ma jeden wzorzec sekcji; testy nie śpią na sztywno.

## Źródła

- `docs/reviews/e3-code-quality-package.md` — findings P1–P8, M1–M15, S1–S7, paczki A–G (pliki i minimalne reakcje).
- `docs/reviews/e3-code-quality-lab.md` — findings i paczki R0–R7 (pliki i warunki).
- `docs/decisions/e3-code-quality.md` — rozstrzygnięcia P1, P5, S3, R0 i decyzje struktury (wiążące).
- `AGENTS.md` (Pułapki, zero komentarzy, kotwice), `docs/structure.md`, `docs/specification.md`.

## Inwarianty

- Wygląd i zachowanie bez zmian: `symmetry.spec.ts`, `edges.spec.ts`, `budgets.spec.ts`, `a11y.spec.ts` i reszta Playwright zielone; liczba testów (`playwright test --list`, vitest) taka sama lub większa — testu nie usuwa się, przenosi się go.
- Zero legacy: stara nazwa, plik, eksport i kopia znikają w tym samym diffie; bez aliasów i reeksportów.
- Zero komentarzy w kodzie; edycja tylko narzędziami Edit/Write.
- Jeden piszący wykonawca naraz w worktree `e2` (praca niezacommitowana). Po „commit tak” właściciela paczki rozłączne mogą iść w osobnych worktree.

## Kolejność

Zależności: laboratorium zależy od API paczki, więc paczka idzie pierwsza; strona TS paczki przed CSS, bo `data-static` i stałe wariantów zmieniają komponenty.

| Etap | Zakres                                                   | Paczki z raportów                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Warunek wyjścia                                                                                                                                                         |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | poprawki oceny właściciela (B1–B11) zakończone i zielone | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | bramka pełna zielona                                                                                                                                                    |
| 1    | paczka: TS i React                                       | A (podział `lib/`: `motion.ts`, `flight.ts`, `indicator.ts`), E (konteksty `useHost`, `ToggleGroup` bez efektu synchronizacji, `composeRefs` bez `useMemo`, jeden typ propsów bez `className`/`style`/`render`, wspólne części Dialog/Popover, stałe wariantów), B (wtyczka ESLint: reguła konsumenta bez trybów, lokalna reguła repo ze źródła, `CONTAINER_WIDTHS` poza ESLint)                                                                                                                  | typecheck, lint, vitest zielone; grep: brak `mode: 'components'`, brak `readMotion` w `indicator.ts`, brak \`                                                           |
| 2    | paczka: CSS i motyw                                      | C (ton → kolor raz w silniku, `data-static`, jedna lista wyłączonych), D (układ w CSS komponentów, „pole w karcie” w `card.css`, przepisy bez `data-component`/ról), F (motyw i paleta, usunięcie 13 tokenów S3 także ze specyfikacji i `/foundation`)                                                                                                                                                                                                                                            | pełna bramka zielona; grep: 1 lista interaktywności, 0 `[data-component=` w `recipes/`, 0 usuniętych tokenów                                                            |
| 3    | laboratorium: aplikacja + publiczne API                  | R1 (`app/lab/`: `LabSection`, `Row`, `RaisedFrame`, `pages.ts`, `samples.ts`), R2 (sekcje komponentów), R3 (podział `foundation/`, wyjątek ESLint zawężony), R4 (ekrany), G (jawne `exports`, laboratorium bez `lib/indicator`/`lib/collection`)                                                                                                                                                                                                                                                  | typecheck, lint, build, Playwright zielone; grep: brak `function Section`, `function Region`, `Foundation(`, lokalnych `LONG`/`TOOLS`/`RANGES`, zbędnych `'use client'` |
| 4    | testy i konfiguracje                                     | R5 (`tests/support/*`, usunięcie `helpers.ts`), R6 (`settle`/`expect.poll` zamiast `waitForTimeout`, podział `lab.spec.ts`/`edges.spec.ts`, osie z `THEME_CONFIG`), R7 (wspólna baza Playwright, `scripts/serve.ts`, `perf/last.json`)                                                                                                                                                                                                                                                            | liczba testów przed = po; 0 `waitForTimeout` poza nazwanymi wyjątkami; 0 `const TOLERANCE`/`const SETTLE` poza `support/`                                               |
| 5    | standard semantyki                                       | 17 reguł z `docs/research/e3-semantics.md`: jawna lista reguł axe semantyki blokująca niezależnie od wpływu (`heading-order`, `page-has-heading-one`, `region`, `landmark-*`, `empty-heading`, `aria-allowed-role`) plus skan z otwartym dialogiem i popoverem; `order` poza białą listą układu; popup bez tytułu i bez `aria-label` = błąd; karta z `href` bez `CardActions`/`action`; `Alert` z wymaganym `role`; zero tekstu UI w bibliotece; standard w `docs/specification.md` i `AGENTS.md` | Playwright zielone z nowymi regułami; testy kontraktu łapią każdy z zakazów                                                                                             |
| 6    | świeży przegląd jakości całości                          | recenzent bez kontekstu autorów                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | PASS lub PASS WITH FINDINGS                                                                                                                                             |

## Kontrola prowadzącego po każdym etapie

Odczyt diffu, greps warunku wyjścia, bramki uruchamiane przez prowadzącego (vitest `--maxWorkers=6`, Playwright 1 worker, jedna ciężka rzecz naraz), wpis w `AGENTS.md` „Pułapki” dla każdego wzorca, który przegląd znalazł, a który może wrócić (np. kopia listy selektorów, przepis znający komponent, `waitForTimeout`), ze strażnikiem maszynowym tam, gdzie da się go napisać.

## Poza zakresem

Zmiany wyglądu, nowe komponenty, słownik `messages` (dopiero przy pierwszym komponencie z więcej niż dwoma wewnętrznymi napisami), S5 (parser CSS w strażniku — po E3), S4 (RSC bez kompilatora — decyzja przy E5).
