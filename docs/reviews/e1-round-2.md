---
kind: review
status: fail
reviewed-state: tessera, branch chore/bootstrap, index = working tree (76 plików zaindeksowanych, bez commita), 2026-10-31 ok. 01:45
date: 2026-10-31
---

# Review: runda kontrolna E1 (czy uwagi z trzech recenzji są naprawione)

## Zakres

- przedmiot: każdy finding z `docs/reviews/e1-standard.md`, `e1-code.md` i `e1-docs.md` oraz nowe błędy wprowadzone poprawkami;
- baseline: stan opisany w trzech raportach rundy 1;
- authority: `docs/specification.md`, `docs/plans/e1-repo.md`, `docs/decisions/e1-source-condition.md`, decyzje prowadzącego z briefu (świadome odstępstwa, oceniana tylko spójność);
- ryzyka: poprawka zgłoszona jako zrobiona, a nieskuteczna; nowe obejścia strażnika; rozjazd dokumentów;
- poza review: krok 8 i 9 planu E1, CI na GitHubie, świeży klon (brak commita).

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** jedyny otwarty finding poważny to `e1-docs.md` P2: najnowszy punkt wznowienia w MangaShift (`docs/session-logs/2026-10-31-0056-tessera-v3-spec-and-e1-start.md`) nadal każe świeżej sesji czytać jako REQUIRED stare kopie z `MangaShift/tmp/tessera-v3/` i twierdzi, że `PROJECTS/tessera` nie istnieje. Leży poza repo Tessery i zamyka go nowy zapis sesji (oraz, za zgodą właściciela, usunięcie `tmp/tessera-v3/`).

Samo repo Tessery po poprawkach spełnia próg PASS WITH FINDINGS: wszystkie pozostałe poważne findingi są naprawione i potwierdzone sondami; zostają tylko mniejsze i sugestie. `bun run check` i `prek run --all-files` są zielone i nie zmieniają plików.

## Status findingów rundy 1

### `e1-standard.md`

| Finding                                              | Status             | Dowód                                                                                                                                                                                                                           |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 test kontraktu ignorowany przez gita              | FIXED              | katalog to `packages/tessera/test/package/`; `git check-ignore -v .../test/package/package.test.ts` → rc 1 (nieignorowany); `git ls-files -o --exclude-standard` pusty; `AGENTS.md:56`, `structure.md` opisują powód nazwy      |
| P2 `typos` blokuje commit                            | FIXED              | `_typos.toml:1-3` (`styl = "styl"`); `prek run --all-files` → `typos ... Passed`                                                                                                                                                |
| P3 CI nie uruchamia hooków                           | FIXED              | `ci.yml:41-54`: instalacja `prek` i krok `Hooks` z `SKIP: no-commit-to-branch` dla każdej gałęzi                                                                                                                                |
| P4 squash zależny od ustawienia, kontrola po fakcie  | ACCEPTED-DEVIATION | ustawienie zapisane w `AGENTS.md:20` i `ci.yml:63-65`, krok 9 planu (`e1-repo.md:35`) je ustawia; kontrola tylko na `main` (`ci.yml:66-67`) zgodnie z decyzją prowadzącego. Spójne                                              |
| M1 pierwszy push `main` czerwony                     | FIXED              | `ci.yml:74-75`: przy `before` z samych zer zakres = `PUSH_AFTER` (cała historia), więc pierwszy push sprawdza commity zamiast kończyć się `exit 1`                                                                              |
| M2 `no-commit-to-branch` czerwony na `main`          | FIXED              | `AGENTS.md:10` (`SKIP=no-commit-to-branch prek run --all-files`, z wyjaśnieniem), `AGENTS.md:20` („tylko squash merge PR”)                                                                                                      |
| M3 dokumenty niesformatowane mdformat                | FIXED              | `SKIP=no-commit-to-branch prek run --all-files` → `mdformat Passed`, `git diff --stat` po runie pusty                                                                                                                           |
| M4 lista scope'ów niepełna i rozjechana              | FIXED              | `.pre-commit-config.yaml:56` (`repo,docs,engine,recipe,component,theme,lib,eslint,lab`); dropdowny `area` w `bug.yml:36-44`, `feature.yml:28-36`, `task.yml:19-27` mają ten sam zbiór; `structure.md` sekcja „Scope'y commitów” |
| M5 vitest w korzeniu bez configu paczki              | FIXED              | `vitest.config.ts:1-7` (`projects: ['packages/*']`); `bunx vitest list --filesOnly` → 6 plików z prefiksami `(unit)` i `(package)`                                                                                              |
| M6 brak `no-test-prose`                              | FIXED              | `.pre-commit-config.yaml:73-74`; `prek run` → `no docstrings or comments in tests ... Passed`                                                                                                                                   |
| M7 brak formatera                                    | ACCEPTED-DEVIATION | spec U34 (`specification.md:62`) i N17 (`:283`) zapisują brak formatera jako otwartą decyzję, nieblokującą                                                                                                                      |
| Sug. odnośnik do `commit-message.md` i `mm-validate` | FIXED              | `AGENTS.md:21`: „w repo MattyMroz/agents” i komenda `uv tool install ...@hooks-v1.1.0`                                                                                                                                          |
| Sug. Playwright bez testów                           | ACCEPTED-DEVIATION | `e1-repo.md:27` (krok 1) zamawia wyjątek `.gitignore` na wzorce zrzutów; `AGENTS.md:14` to reguła właściciela                                                                                                                   |
| Sug. martwa alternatywa `\.vscode/`                  | NOT FIXED          | `.pre-commit-config.yaml:82` bez zmian; `check-useless-excludes` przechodzi, bo pasuje `tsconfig.*\.json`. Sugestia, nie blokuje                                                                                                |

### `e1-code.md`

| Finding                                         | Status                             | Dowód                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 strażnik warstw do obejścia                  | FIXED (resztki w N1)               | `css-layers.ts`: wartości `--_*` w przepisach sprawdzane (`:172-173`), w komponentach `--_*` odrzucane jako nie-układ (`:164`), fallback `var()` (`:144`), `!important` (`:142`, `:199`), w silnikach tylko zmienne (`:197`), każdy `src/**/*.css` dostaje warstwę albo „CSS outside a layer” (`:230-235`), at-rules w komponentach poza `@layer components` odrzucane (`:162`). Wszystkie 16 obejść z rundy 1 są w fixture `bad/` z oczekiwanym błędem (`css-layers.test.ts:261-350`). S4 spełnione dla koloru, promienia, cienia, ruchu i liczb poza wyjątkami z N2 |
| P2 test `dist` z fałszywym PASS                 | FIXED                              | `test/package/use-client.test.ts`: dyrektywa vs hooki, handlery i `react/compiler-runtime` w AST, fixture z handlerem bez dyrektywy oblewa (`:348-350`); `side-effects.test.ts`: proxy DOM, timery, storage, listenery, prototypy, 11 celowych wycieków wykrytych (`:205-243`); `package.test.ts`: `*` rozwijane z `src` (`:36-46`), `source` i `types` z manifestu (`:86-98`), brak `.` (`:80-84`), import z tarballa (`:100-117`)                                                                                                                                   |
| P3 vitest w korzeniu bez configu, `.worktrees/` | FIXED                              | jak standard M5; `include` żyje tylko w `packages/tessera/vitest.config.ts:5-8`, ścieżki względem paczki                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P4 `no-local-css` odrzuca wejście v3            | FIXED                              | `no-local-css.ts:43-55`: biała lista `tailwindcss`, `tessera.css`, `tailwind.css`, każde raz, z `tessera.css`; testy `rules.test.ts:261-270` (trzy linie, kolejność odwrócona, BOM/CRLF, odrzucenia)                                                                                                                                                                                                                                                                                                                                                                  |
| P5 reguły ESLint 1:1 z v2                       | FIXED / ACCEPTED-DEVIATION         | `grep -i 'library\|typeset\|radix\|data-theme\|useTheme\|gallery\|globals.css\|accent-bright\|legacy\|allowCssEntry\|AppearanceOptions'` w `src`, `test`, `apps/docs/app` → 0 trafień; `index.ts:13-18` ma tylko cztery reguły; powrót `no-data-theme` i trybu komponentów w E2 zapisany w `e1-repo.md:31`. Spójne z decyzją prowadzącego                                                                                                                                                                                                                             |
| M1 nic nie pilnuje React Compilera              | FIXED                              | `use-client.test.ts:352-355`: fixture `button.js` i `label.js` muszą importować `react/compiler-runtime`                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| M2 wtyczka konsumenta nie działa w repo         | NOT FIXED                          | `eslint.config.js:7-13` nie stosuje `configs.recommended`; `eslint --print-config apps/docs/app/page.tsx` → 0 reguł `tessera/*`. Laboratorium (U19: „zbudowana wyłącznie z Tessery”, F14) nie ma strażnika. Mniejszy                                                                                                                                                                                                                                                                                                                                                  |
| M3 martwe `@types/babel__core`                  | FIXED                              | `packages/tessera/package.json:39-55` bez tej zależności                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| M4 wspólne wersje poza `catalog:`               | NOT FIXED                          | `eslint ^10.14.0` osobno w `package.json:28` i `packages/tessera/package.json:47`; `@typescript-eslint/parser` i `rule-tester` przypięte `8.72.1` obok `typescript-eslint ^8.72.1`. Dziś `bun.lock` rozwiązuje wszystko do tych samych wersji, ryzyko rozjazdu przy aktualizacji zostaje. Mniejszy                                                                                                                                                                                                                                                                    |
| M5 komentarz „single entry”                     | FIXED                              | `src/styles/tessera.css:1-3`: „The style entry of the package and the only place of the cascade order”                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| M6 nieprawdziwy komentarz i proza w helperze    | FIXED                              | `test/guards/css-layers.ts` bez komentarzy; regex liczb komponentu (`:47`) i jego testy są jawne                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| M7 biała lista układu szersza niż F7            | ACCEPTED-DEVIATION (niespójne, N2) | `css-layers.ts:24-29` bez `width`, `height`, `position`, `inset`, `cursor`; `AGENTS.md:36` zgodne z decyzją prowadzącego. Spec F7 (`specification.md:137`), I1 (`:208`) i S4 (`:272`) nadal mówią „ani liczb”, a AGENTS dopuszcza `-1/0/1` i kolumny siatki                                                                                                                                                                                                                                                                                                           |
| M8 duplikacja                                   | PARTIAL                            | `asNode` jest jeden (`static-values.ts:14`, import w `compositor-motion.ts`); zostają dwie listy właściwości układu (`css-layers.ts:24` dla CSS komponentu, `style-policy.ts:20` dla konsumenta) bez nazwania różnicy, kopia grafu silników w `css-layers.ts:4` oraz `binding` (`compositor-motion.ts:32`) obok `constInit` (`static-values.ts:52`), które różnią się semantyką (mutacje, nazwy funkcji), więc ta para jest uzasadniona. Mniejszy                                                                                                                     |
| M9 brak testu odpięcia `composeRefs`            | FIXED                              | `compose-refs.test.ts:17-26`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| M10 AGENTS o laboratorium czytającym `src`      | FIXED                              | `AGENTS.md:51`, `:58`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| S1 reguły komponentu w `@layer components`      | NOT FIXED                          | sonda: `.ts-top { display: grid; }` poza `@layer` w `components/x/x.css` nie daje błędu. Patrz N1                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| S2 reguły kompilatora w lincie                  | FIXED (potwierdzone)               | `eslint --print-config apps/docs/app/page.tsx`: `react-hooks/purity`, `immutability`, `refs`, `unsupported-syntax`, `incompatible-library` i inne aktywne                                                                                                                                                                                                                                                                                                                                                                                                             |

### `e1-docs.md`

| Finding                                                 | Status    | Dowód                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 AGENTS i plan: laboratorium czyta `src`              | FIXED     | `AGENTS.md:9`, `:51`, `:58`; `README.md:35`; `e1-repo.md:20` i `:32`; zgodne z `decisions/e1-source-condition.md`                                                                                                                                                                                                                         |
| P2 punkt wznowienia prowadzi do `tmp/tessera-v3`        | NOT FIXED | `MangaShift/docs/session-logs/2026-10-31-0056-tessera-v3-spec-and-e1-start.md` nadal najnowszy (`ls -t`), linie 18-24 (REQUIRED: `MangaShift/tmp/tessera-v3/...`), 37 („`PROJECTS/tessera`: nie istnieje”); `MangaShift/tmp/tessera-v3/` istnieje (spec, structure, masterplan, plans, decisions, research, reviews, spikes). **Poważny** |
| P3 brak `tailwind.css`                                  | FIXED     | odłożenie zapisane w `e1-repo.md:18`, spec U15 (`specification.md:61`), `AGENTS.md:52`, `structure.md` (`(E2+)` przy `tailwind.css`); komentarz w `tessera.css` nie mówi już „single entry”                                                                                                                                               |
| P4 brak stanu kroków E1                                 | FIXED     | kolumna „Stan” w `e1-repo.md:25-35`; `masterplan.md:74` wskazuje kroki 8 i 9                                                                                                                                                                                                                                                              |
| m1 projekty vitest z korzenia                           | FIXED     | jak standard M5                                                                                                                                                                                                                                                                                                                           |
| m2 N10 rozstrzygnięte                                   | FIXED     | spec U34 (`specification.md:62`); `structure.md:22` (`ESLint (U34)`), bez wariantu Biome                                                                                                                                                                                                                                                  |
| m3 zakres U i daty                                      | PARTIAL   | `structure.md` bez „U1–U25”, `updated: 2026-10-31` w spec i structure, historia masterplanu notuje U17 (`masterplan.md:107`); ale `masterplan.md:4` ma nadal `updated: 2026-10-30`, choć plik ma zmiany z 31.10 (`:74`, `:106-107`)                                                                                                       |
| m4 `build` to nie tylko tsdown                          | FIXED     | `AGENTS.md:8` („build (tsdown, potem next build)”)                                                                                                                                                                                                                                                                                        |
| m5 wykonany plan E0 nie znika                           | FIXED     | `docs/plans/e0-spikes.md` nie istnieje i nie jest w indeksie                                                                                                                                                                                                                                                                              |
| m6 niejednoznaczna ścieżka v2                           | FIXED     | `decisions/e0-motion.md:14`: „repo MangaShift, branch `refactor/tessera-motion`: ...”                                                                                                                                                                                                                                                     |
| m7 krok 1 i pierwszy commit                             | FIXED     | `e1-repo.md:21` (pierwszy commit na `chore/bootstrap`, `main` przesunięty na ten sam commit), krok 1 bez „OWN”; repo stoi na `chore/bootstrap`                                                                                                                                                                                            |
| m8 pułapka świeżego klonu                               | FIXED     | `AGENTS.md:72`                                                                                                                                                                                                                                                                                                                            |
| Sug. „każda reguła ma strażnika” w czasie teraźniejszym | NOT FIXED | `structure.md:84-97` bez oznaczeń, który strażnik już istnieje. Sugestia                                                                                                                                                                                                                                                                  |
| Sug. plik wyjątków ruchu bez nazwy                      | NOT FIXED | `AGENTS.md:44` („w jednym pliku”). Sugestia                                                                                                                                                                                                                                                                                               |
| Sug. README: warstwy od E2                              | NOT FIXED | `README.md:7-16` bez zmian. Sugestia                                                                                                                                                                                                                                                                                                      |

## Nowe problemy

### Krytyczne

Brak.

### Poważne

Brak w repo Tessery. Otwarty poważny z rundy 1 to `e1-docs.md` P2 (wyżej).

### Mniejsze

#### N1. Strażnik warstw nie sprawdza selektorów ani warstwy w `components/` i `styles/` ani grafu wejść `--in-*`

- miejsce: `css-layers.ts:161` (reguła w komponencie zawsze OK), `:204` (każde `@layer a, b;` w `styles/` OK), `:59` (`layer(<dowolna>)` w imporcie), `:177` (`--in-*` należy do każdego silnika).

- dowód: sonda w scratchpadzie (`checkLayers` z repo na drzewie testowym) zgłosiła tylko `--_x: var(--in-shape-radius)` w przepisie. Przeszły m.in.:

  ```css
  /* components/x/x.css, w @layer components */
  .ts-x:focus-visible { display: none; }
  * { display: none; }
  /* components/x/x.css, poza @layer */
  .ts-top { display: grid; }
  /* engines/shape/shape.css */
  :root { --shape-x: var(--in-color-mode); --in-color-mode: 1; }
  /* styles/tessera.css i drugi plik styles/second.css */
  @layer utilities, components, base, theme;
  @import "../components/x/x.css" layer(utilities);
  @layer components, theme;
  ```

- wpływ: `AGENTS.md:36` mówi, że własny `:focus-visible` należy do przepisów, a `AGENTS.md:52` i I4, że kolejność `@layer` jest w jednym miejscu; strażnik tego nie egzekwuje. CSS komponentu poza `@layer components` albo wciągnięty do `utilities` wygrywa z utility aplikacji (U15). Selektor `*` w pliku komponentu działa globalnie. Dziś nie ma żadnego pliku tych warstw, więc wpływ jest przyszły, ale to strażnik dla E2.

- minimalna reakcja: w `components/` i `recipes/` każda reguła tylko wewnątrz `@layer components` i selektor zaczynający się od klasy `.ts-*` bez `:focus-visible`; w `styles/` `@layer` tylko w `tessera.css` i dokładnie `theme, base, components, utilities`; `layer()` w imporcie tylko zgodne z warstwą katalogu; `--in-*` przypisane do silnika (np. `--in-<silnik>-*`) albo zapisany wyjątek. Każda próba jako fixture `bad`.

#### N2. Liczby w CSS komponentu: strażnik, AGENTS i spec mówią trzy różne rzeczy

- miejsce: `css-layers.ts:47` (`0`, `-1`, `1`, `100%`, `[1-9]\d*fr`), `AGENTS.md:36` („liczby poza -1/0/1 ... należą do przepisów”), spec F7 (`:137`), I1 (`:208`), S4 (`:272`): „ani liczb”.
- dowód: sonda: `grid-template-columns: 1fr 99fr`, `flex-basis: var(--size-h)` i `grid-template-columns: var(--size-h) 100%` w komponencie przechodzą. Rozmiar przez `flex-basis` z tokenem `--size-*` też przechodzi, choć AGENTS mówi, że rozmiar należy do przepisów.
- wpływ: brak jednego źródła reguły (AGENTS.md:64 każe zgłaszać rozjazd z spec). Dla `Nfr` i `100%` decyzja prowadzącego (-1/0/1) nie jest egzekwowana.
- minimalna reakcja: zaktualizować F7/I1/S4 w spec do decyzji prowadzącego; w strażniku albo dopisać `100%` i `1fr` jako nazwane wyjątki w AGENTS, albo zawęzić regex do `0|-?1|1fr`; rozstrzygnąć, czy `flex-basis` z tokenem rozmiaru jest układem.

### Sugestie

- `AGENTS.md:57` nazywa projekty `unit` i `package`, a vitest nadaje im nazwy `@mattymroz/tessera (unit)` i `@mattymroz/tessera (package)`: `bunx vitest list --project unit` w korzeniu kończy się „No projects were found” (rc 1). Dopisać prawdziwe nazwy albo przykład `--project '*unit*'`.
- `e1-docs.md` P2 po zamknięciu: nowy zapis sesji powinien wskazywać `PROJECTS/tessera/docs/`, stan kroków z `e1-repo.md` i ten raport.

## Wykonane kontrole

```text
bun run check (korzeń)
  typecheck (2 członków) exit 0 → eslint . exit 0 → build: tsdown 16 plików, next build 3 strony → vitest
  Test Files 6 passed (6), Tests 277 passed (277), 4.10 s; exit 0

SKIP=no-commit-to-branch prek run --all-files
  wszystkie Passed albo Skipped (no-commit-to-branch Skipped, illegal windows names i submodules: no files); exit 0
  git diff --stat po runie: puste (hooki nic nie zmieniły)

prek run --all-files --hook-stage manual
  check-hooks-apply Passed, check-useless-excludes Passed, pozostałe Passed

python .../agents/scripts/standard.py check --project .
  FAIL branch: primary checkout is on chore/bootstrap, not main   (oczekiwany jedyny FAIL); exit 1

git status --short: tylko "A " (76 plików), brak niezaindeksowanych zmian przed i po kontrolach
git check-ignore -v packages/tessera/test/package/package.test.ts → rc 1
git ls-files -o --exclude-standard → puste
bunx vitest list --filesOnly → 6 plików w projektach (unit) i (package)
bunx vitest list --project unit → "No projects were found", rc 1
bunx eslint --print-config apps/docs/app/page.tsx → 16 reguł react-hooks/*, 0 tessera/*
grep v2 resztek (library, typeset, radix, data-theme, useTheme, gallery, globals.css, accent-bright, legacy,
  allowCssEntry, AppearanceOptions) w src, test, apps/docs/app → 0
grep wersji w bun.lock: eslint 10.14.0, typescript-eslint/parser/rule-tester 8.72.1
sonda checkLayers (scratchpad poza repo, komponent, przepis, silnik, dwa pliki styles)
  → zgłoszone tylko --_x: var(--in-shape-radius); obejścia z N1 i N2 przepuszczone
MangaShift: ls -t docs/session-logs, ls tmp/tessera-v3, grep w logu sesji (tylko odczyt)
```

## Niewykonane lub nierozstrzygające kontrole

- CI na GitHubie i `bun run check` na Linuksie: repo nie jest wypchnięte. Nie sprawdzono, czy `MattyMroz/agents@hooks-v1.1.0` jest dostępne dla `pip install` i `repo:` w prek z runnera.
- Świeży klon (dwa razy `bun run check`, warunek wyjścia E1): brak commita.
- Rzeczywiste zebranie testów z `.worktrees/`: nie tworzyłem plików w repo; wniosek z konfiguracji (`include` tylko w configu paczki) i z listy 6 plików.
- `bun run dev` i zachowanie `next dev` przed pierwszym buildem tsdown.
- Czy skompilowany komponent bez hooków (z `c()` kompilatora) jest bezpieczny w RSC; test traktuje go zachowawczo jako moduł klienta.
- Poprawność merytoryczna każdego przypadku `rules.test.ts`: uruchomione i zielone, nieprzeglądane przypadek po przypadku.

## Ograniczenia review

- Sondy strażnika uruchomione na kopii poza repo (`checkLayers` importowany z repo); nie są fixture'ami i zostały w scratchpadzie sesji.
- `e1-docs.md` P2 dotyczy repo MangaShift; oceniony tylko odczytem.

## Zalecany następny krok

1. Zamknąć `e1-docs.md` P2: nowy zapis sesji wskazujący `PROJECTS/tessera/docs/`; usunięcie `MangaShift/tmp/tessera-v3/` tylko za zgodą właściciela.
2. Przed E2 (pierwsze pliki warstw): N1 i N2 w strażniku, F7/I1/S4 w spec zgodne z decyzją prowadzącego.
3. Przy okazji: `masterplan.md:4` data, M2 (wtyczka na `apps/docs`), M4 (`catalog:` dla eslint i typescript-eslint).
