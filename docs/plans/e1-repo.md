---
kind: plan
status: active
baseline: brak repo; presety agents @ stan z 2026-10-31; MangaShift refactor/tessera-motion @ 7a48b4310
created: 2026-10-31
---

# Plan E1: repo `tessera` i rama

## Cel

Repo `PROJECTS/tessera` (lokalnie i prywatnie na GitHubie), w którym `bun run check` przechodzi na świeżym klonie, laboratorium otwiera się pod jednym linkiem, a strażnicy warstw i reguły konsumenta działają, zanim powstanie pierwszy silnik. Do tego próba (a) z E0 na prawdziwej paczce.

## Decyzje planu

- **ESLint, nie Biome**: spec U34.
- **TypeScript 7 do typecheck** (`typescript7` = `npm:typescript@^7`), TypeScript 6 tylko jako peer dla `typescript-eslint`, jak w v2.
- **Pierwszy kod paczki** to rzeczy bez wyglądu, potrzebne każdemu dalszemu etapowi: `lib/compose-refs.ts` z testem i wejście `styles/tessera.css` z kolejnością `@layer`. `styles/tailwind.css` powstaje z pierwszymi tokenami (U15). Bez pustych folderów silników (Z8).
- **React Compiler** w buildzie paczki od początku (Q13), przez `@rolldown/plugin-babel`.
- **Laboratorium czyta `dist`** (U17, `decisions/e1-source-condition.md`).
- **Pierwszy commit** powstaje na branchu `chore/bootstrap` (hook `no-commit-to-branch` chroni `main`); `main` dostaje ten sam commit przez przesunięcie wskaźnika, bez osobnego commita na `main`. Potem praca w `.worktrees/`.

## Kroki

| #   | Krok                                                                                                                                                                                                                                                                                 | Stan                                                                                             | Kontrola                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1   | `git init`; `standard.py apply`; `.pre-commit-config.yaml` według aktualnego presetu (CORE, DATA FILES, SPELLING, MARKDOWN) + blok FRONTEND z bramkami pre-push; `_typos.toml`; `.gitignore` z wyjątkiem na wzorce zrzutów; `core.autocrlf false`; `prek install`                    | zrobione                                                                                         | `standard.py check` OK                                      |
| 2   | Korzeń workspace: `package.json` (workspaces, catalog), `tsconfig.base.json`, `eslint.config.js`, `vitest.config.ts` (`projects: ["packages/*"]`); `bun install`                                                                                                                     | zrobione                                                                                         | `bun install` bez błędów                                    |
| 3   | `packages/tessera`: `package.json`, `tsdown.config.ts`, `vitest.config.ts` (projekty `unit` i `package`), `lib/compose-refs.ts` + test, `styles/tessera.css`, `test/package/` (kontrakt `dist`: exports, `'use client'`, efekty uboczne, React Compiler)                             | zrobione; po recenzji kontrakt przepisany (fałszywy PASS, katalog `dist/` ignorowany przez gita) | `bun run build`, `bunx vitest run` zielone                  |
| 4   | Test warstw CSS w `test/guards/`: biała lista per warstwa (`engines/`, `recipes/`, `components/`, `styles/`) z fixture `good/` i `bad/`                                                                                                                                              | zrobione; po recenzji domknięte obejścia                                                         | każdy fixture `bad/` oblewa, `src/` czyste                  |
| 5   | Reguły ESLint konsumenta przepisane na v3: `no-local-css` (wejście CSS z importów `tailwindcss`, `tessera.css`, `tailwind.css`), `no-local-appearance` (tryb aplikacji), `no-literal-colors`, `compositor-motion`; pojęcia v2 (tryb `library`, `cn-*`, `no-data-theme`) wracają w E2 | zrobione; po recenzji usunięte resztki v2                                                        | testy reguł zielone                                         |
| 6   | `apps/docs`: Next 16 static export, jedna strona z importem `tessera.css`, `agentRules: false`; `bun run dev` = `tsdown --watch` + `next dev`                                                                                                                                        | zrobione                                                                                         | `next build` zielony                                        |
| 7   | AGENTS.md, README, `.github/` (szablony zgłoszeń, szablon PR, CI: `bun run check`, `prek run --all-files`, kształt commitów na `main`)                                                                                                                                               | zrobione                                                                                         | `standard.py check` OK; trzy recenzje w `docs/reviews/e1-*` |
| 8   | Próba (a): branch próbny w MangaShift, `link:` do `packages/tessera` w desktopie i stronie, pomiar HMR TSX i CSS, jeden React, `next build`; potem przywrócenie (O6)                                                                                                                 | nie rozpoczęte; wymaga pytania właściciela (przełączenie checkoutu MangaShift)                   | F13 albo opis, gdzie pęka; `decisions/e1-two-repos.md`      |
| 9   | Pierwszy commit (`chore/bootstrap`, `main` na ten sam commit), prywatne `MattyMroz/tessera`, ustawienie squash = tytuł i opis PR, push                                                                                                                                               | po czystej rundzie recenzji; zgoda właściciela 31.10 („wypchnij jako repozytorium prywatne”)     | `bun run check` na świeżym klonie; CI zielone               |

## Zakazy

- Bez wyglądu (silników, przepisów, komponentów) w E1.
- Krok 8 przełącza checkout MangaShift: przed nim pytanie właściciela, czy nie ma uruchomionego `bun tauri dev`.
- Edycja plików tylko narzędziami Edit/Write; nigdy `bun run test`.

## Przekazane do E2

Z rundy kontrolnej (`docs/reviews/e1-round-2.md`), do domknięcia razem z pierwszymi plikami warstw:

- strażnik warstw: selektory komponentów (`:focus-visible`, `*`), reguły komponentu poza `@layer components`, kolejność i jedno źródło `@layer` w `styles/`, `layer(...)` przy `@import`, `--in-*` przypisane do silnika;
- wtyczka ESLint konsumenta włączona w `apps/docs` (dziś import z `dist` przed buildem psułby lint na świeżym klonie);
- jedna lista właściwości układu albo nazwana różnica między regułą aplikacji a strażnikiem komponentu; graf silników w jednym miejscu, gdy powstanie `src/engines`.

## Wyjście

Warunek z masterplanu (E1) spełniony; `structure.md` zgodne z faktycznym drzewem; właściciel akceptuje drzewo i AGENTS.md.
