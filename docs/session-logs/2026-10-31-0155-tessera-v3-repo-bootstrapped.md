---
kind: session
status: ready-to-resume
created: 2026-10-31T01:55:00+01:00
subject: tessera-v3-repo-bootstrapped
---

# Punkt wznowienia: Tessera v3, repo założone i wypchnięte (E1 kroki 1–7, 9)

Zastępuje `2026-10-31-0056-tessera-v3-spec-and-e1-start.md`: dokumenty żyją już w repo `tessera`, a kopie w `MangaShift/tmp/tessera-v3/` są nieaktualne.

## Cel

Tessera v3 w osobnym repo: 9 silników → 5 przepisów → cienkie komponenty, Base UI do zachowania, laboratorium pod jednym linkiem; potem desktop MangaShift na v3.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                      | Po co                                          | Tryb      |
| --------- | ------------------------------------------- | ---------------------------------------------- | --------- |
| 1         | `PROJECTS/tessera/AGENTS.md`                | komendy, bramki, warstwy, zakazy, pułapki      | REQUIRED  |
| 2         | `PROJECTS/tessera/docs/plans/masterplan.md` | etapy, bieżący etap                            | REQUIRED  |
| 3         | `PROJECTS/tessera/docs/plans/e1-repo.md`    | stan kroków E1 i „Przekazane do E2”            | REQUIRED  |
| 4         | `PROJECTS/tessera/docs/specification.md`    | jedyne źródło decyzji (U1–U34, W1–W20, N3–N17) | REQUIRED  |
| 5         | `PROJECTS/tessera/docs/decisions/*`         | wyniki E0 i decyzja `dist` w laboratorium      | ON DEMAND |
| 6         | `PROJECTS/tessera/docs/reviews/e1-*`        | recenzje E1 i runda kontrolna                  | ON DEMAND |

## Skille do wczytania

- `coding`, `simple`, `workflow`: wykonanie.
- `subagent`: briefy z pełnym szablonem, skillem zadaniowym i SUBAGENT-RESULT.
- `review`: rundy recenzji po etapach.

## Stan repo / środowiska

- `PROJECTS/tessera`: `main` = `378bcee chore(repo): bootstrap tessera v3 workspace`, wypchnięty do prywatnego `github.com/MattyMroz/tessera`. Ustawienia: tylko squash merge, tytuł i opis PR jako wiadomość, usuwanie brancha po merge. `standard.py check` OK.
- CI nie wystartowało: GitHub odmówił uruchomienia jobu („recent account payments have failed or your spending limit needs to be increased”). Kod nie był przyczyną. Decyzja właściciela: płatności Actions albo self-hosted runner.
- MangaShift: branch `refactor/tessera-motion`, HEAD `7a48b4310` (commit sprzątania z innej sesji, niewypchnięty; nie wypychać bez słowa właściciela).
- `MangaShift/tmp/tessera-v3/`: stare kopie dokumentów i sonda `spikes/concentric`; do usunięcia za zgodą właściciela (tmp jest jego).
- `PROJECTS/tessera-probe/motion`: laboratorium ruchu z E0, materiał do E2; serwer :4700 mógł zostać uruchomiony w tle.

## Stan pracy

### DONE

- E1 kroki 1–7 i 9: standard `agents` (hooki prek, `_typos.toml`, `.gitignore` z wyjątkiem na wzorce zrzutów), workspace bun, paczka (`compose-refs`, `tessera.css`, React Compiler), strażnik warstw CSS (biała lista per warstwa), kontrakt paczki `test/package/`, reguły ESLint konsumenta przepisane na v3, `apps/docs` (Next 16 static export, czyta `dist`), AGENTS.md, README, `.github/` (szablony, CI), dokumenty w `docs/`.
- Recenzje: 3 równoległe (standard, kod, dokumenty) → poprawki przez 3 agentów → runda kontrolna: repo na poziomie PASS WITH FINDINGS.

### NOT STARTED

- E1 krok 8: próba dwóch repo (link `link:` do desktopu i strony MangaShift). Wymaga pytania właściciela, bo przełącza checkout MangaShift.
- E2: pionowy przekrój (ekran „Nakładki w nakładkach”).

## Decyzje tej sesji

- Laboratorium czyta `dist`; `bun run dev` = `tsdown --watch` + `next dev` (U17, Turbopack nie obsługuje własnych warunków `exports`).
- ESLint, nie Biome (U34); formater kodu otwarty (N17).
- Scope'y commitów: `repo, docs, engine, recipe, component, theme, lib, eslint, lab`.
- Reguły ESLint w E1: `no-local-css`, `no-local-appearance`, `no-literal-colors`, `compositor-motion`; `no-data-theme` i tryby komponentów/laboratorium wracają w E2.
- Pierwszy commit na `chore/bootstrap`, `main` przesunięty na ten commit (hook `no-commit-to-branch`).

## Ślepe uliczki

| Próba                         | Dlaczego nie działa                        | Nie wracać bez           |
| ----------------------------- | ------------------------------------------ | ------------------------ |
| katalog testów `test/dist/`   | preset `.gitignore` ignoruje każdy `dist/` | —                        |
| warunek `source` w Turbopacku | Next 16.4 obsługuje tylko `browser`        | wydania Next z warunkami |
| wtyczka Babel podana nazwą    | Babel szuka jej od katalogu startowego     | —                        |

## Następny krok

1. [REKOMENDACJA] Właściciel: decyzja o CI (płatności Actions albo self-hosted runner) i zgoda na krok 8 E1.
2. Potem plan E2 (`docs/plans/e2-vertical-slice.md`) z „Przekazane do E2” z planu E1.
