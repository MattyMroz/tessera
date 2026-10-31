---
kind: review
status: fail
reviewed-state: tessera working tree before the first commit (main unborn), 2026-10-31 01:25
date: 2026-10-31
---

# Review: zgodność repo Tessera ze standardem repo `agents`

## Zakres

- przedmiot: `.pre-commit-config.yaml`, `.gitignore`, `.gitattributes`, `.agent-skills`, `.claude/settings.json`, `.worktrees/.gitkeep`, `.github/**`, `AGENTS.md`, `README.md`, `package.json`;
- baseline: drzewo robocze `tessera` bez commitów, standard z dysku `agents` (HEAD `f03a462` plus niezacommitowane zmiany tylko w `docs/`);
- authority: `agents/AGENTS.md`, `agents/presets/git/`, `agents/presets/hooks/` (README, asset, `commit-message.md`, `pitfalls.md`), `agents/.github/`, `agents/.pre-commit-config.yaml`, `agents/scripts/standard.py`, skill `agents-md`;
- ryzyka: pierwszy commit się nie uda albo wejdzie niekompletny, CI przepuści to, co hooki lokalne blokują, `AGENTS.md` przeczy rzeczywistości;
- poza review: treść paczki (silniki, reguły ESLint), spec i masterplan, działanie CI na GitHubie.

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** planowany pierwszy commit w obecnym stanie nie przejdzie hooka `typos`, a po naprawie tego hooka i tak po cichu pominie test kontraktu paczki `packages/tessera/test/dist/package.test.ts`, bo ignoruje go reguła `dist/` z presetu. Obie poprawki są małe.

`standard.py check` przechodzi (exit 0), więc minimalny standard maszynowy jest spełniony; findingi dotyczą miejsc, których `standard.py` nie sprawdza.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Test kontraktu paczki jest ignorowany przez gita

- miejsce: `.gitignore:87` (`dist/`, sekcja Node z presetu) kontra `packages/tessera/test/dist/package.test.ts`; `AGENTS.md:56` i `:72`, `packages/tessera/vitest.config.ts:7`.
- dowód: `git check-ignore -v packages/tessera/test/dist/package.test.ts` daje `.gitignore:87:dist/`; plik nie występuje w `git ls-files -o --exclude-standard` (62 pliki), a `bunx vitest list --filesOnly` lokalnie go widzi.
- wpływ: pierwszy commit i każdy klon (CI, worktree) nie mają testu `dist`; CI raportuje zielone `bun run check` na 3 plikach testów zamiast 4, a `AGENTS.md` opisuje katalog, którego w repo nie będzie. Błąd jest cichy, bo lokalnie wszystko przechodzi.
- minimalna reakcja: zmienić nazwę katalogu na nazwę bez kolizji z wyjściem builda (np. `test/package/`, wtedy poprawić `vitest.config.ts:7`, `AGENTS.md:56`, `AGENTS.md:72`) albo dopisać w sekcji „Re-includes” `!packages/tessera/test/dist/` i `!packages/tessera/test/dist/*.test.ts`. Rekomendacja: zmiana nazwy, bo nie dokłada wyjątku do presetu.

#### P2. Hook `typos` blokuje pierwszy commit

- miejsce: `packages/tessera/src/eslint/no-local-css.ts:7` i `packages/tessera/src/eslint/rules.test.ts:247` (rozszerzenie Stylus `styl`); w repo brak `_typos.toml`.
- dowód: `prek run --files <62 pliki>` daje `typos ... Failed`, `error: 'styl' should be 'style'` w obu miejscach.
- wpływ: `git commit` planowanego commita bootstrap kończy się błędem hooka.
- minimalna reakcja: `_typos.toml` w korzeniu z `[default.extend-words]` i wpisem `styl = "styl"`, tak jak opisuje preset (`presets/hooks/assets/pre-commit-config.yaml:116`).

#### P3. CI nie uruchamia warstwy hooków

- miejsce: `.github/workflows/ci.yml:34-39` (tylko `bun install` i `bun run check`); dla porównania `agents/scripts/check.py:46` uruchamia w CI `prek run --all-files`.
- dowód: odczyt obu plików; `pitfalls.md:141-148` mówi, że na GitHub.com jedyną niepomijalną warstwą jest CI.
- wpływ: `git commit --no-verify` (pamięć właściciela notuje świadome używanie `--no-verify`) albo edycja na GitHubie wprowadzają bez kontroli błędy whitespace, mdformat, `typos`, `check-json` i `detect-private-key`. Kontrola kształtu wiadomości działa tylko na `main` (P4).
- minimalna reakcja: krok `SKIP=no-commit-to-branch prek run --all-files` dla każdej gałęzi (instalację `prek` wyjąć spod `if: main`). `SKIP` jest konieczny, bo `actions/checkout` dla pusha na `main` tworzy lokalną gałąź `main`, a `no-commit-to-branch` działa zawsze (M2).

#### P4. Kontrakt wiadomości squash-merge zależy od nieudokumentowanego ustawienia i jest sprawdzany dopiero po fakcie

- miejsce: `.github/pull_request_template.md:4-5` („A squash merge turns the title and this description into the commit message”), `ci.yml:51-60` (kontrola tylko na `main`), brak workflow na `pull_request`.
- dowód: to zdanie jest prawdziwe tylko przy ustawieniu repo GitHub „Default commit message: Pull request title and description” dla squash merge; domyślnie GitHub dla PR z wieloma commitami składa body z listy commitów. Ustawienie nie jest zapisane w `AGENTS.md`, `README.md` ani w żadnym pliku. Preset (`presets/hooks/README.md:112-113`) jako lekarstwo na squash-merge wskazuje workflow sprawdzający tytuł PR przed merge.
- wpływ: zły tytuł albo body PR wychodzi dopiero jako czerwony run na `main`, czyli po wejściu do historii; naprawa wymaga przepisania historii `main`. Bez ustawienia repo wiadomości na `main` mogą systematycznie oblewać `commit-validation --shape-only`. Odstępstwo „CI na push każdej gałęzi” ma sens kosztowy (jeden job, status PR z gałęzi), ale samo nie daje dostępu do tytułu ani opisu PR.
- minimalna reakcja: zapisać ustawienie squash (tytuł i opis PR) jako krok setupu w `README.md` lub `AGENTS.md` i ustawić je przy zakładaniu repo. Dodatkowo albo zamienić wyzwalacz gałęzi na `pull_request` (typy `opened`, `synchronize`, `reopened`, `edited`) i sprawdzać tytuł z opisem przez `env:`, albo jawnie zapisać, że kontrola jest wyłącznie post-merge.

### Mniejsze

#### M1. Pierwszy push `main` da czerwony run CI, a komentarz w CI to ukrywa

- miejsce: `ci.yml:66-75` kontra komentarz `ci.yml:56-58`.
- dowód: pętla kończy się `exit 1`, gdy `before` to same zera, czyli przy każdej nowej gałęzi, także pierwszym pushu `main`. Komentarz wymienia tylko force-push, choć komunikat w `:72` mówi o nowej gałęzi.
- wpływ: plan bootstrap (commit na `chore/bootstrap`, `main` na ten sam commit) z pewnością da czerwony pierwszy run `main`.
- minimalna reakcja: poprawić komentarz; przed pushem sprawdzić wiadomość lokalnie przez `commit-validation --shape-only` i przyjąć jeden czerwony run jako znany.

#### M2. `no-commit-to-branch` w CORE robi bramkę `prek run --all-files` czerwoną w głównym checkoucie

- miejsce: `.pre-commit-config.yaml:41`, `AGENTS.md:10` i `:20`, `ci.yml:4`.
- dowód: `prek run --all-files` w `tessera` (główny checkout na `main`, czego wymaga `standard.py`) daje `don't commit to branch ... Failed`.
- wpływ: udokumentowana bramka jest czerwona z założenia w miejscu, gdzie robi się review i integrację, co uczy ignorowania wyniku hooków. Lokalny `git merge` z konfliktem na `main` też wymaga `--no-verify`, które wyłącza przy okazji `commit-msg`. Do tego `AGENTS.md:20` mówi „tylko merge”, a `ci.yml:4` i szablon PR mówią o squash-merge PR, więc przepływ nie jest jednoznaczny.
- minimalna reakcja: w `AGENTS.md:10` wpisać `SKIP=no-commit-to-branch prek run --all-files` albo „uruchamiaj w worktree”, a w `:20` dopisać jednoznacznie „PR, squash merge na GitHubie”. Samo odstępstwo jest spójne ze `standard.py` (główny checkout na `main`, praca w `.worktrees/`).

#### M3. 14 dokumentów nie było sformatowanych przez mdformat; ten review je przeformatował

- miejsce: `docs/specification.md`, `docs/structure.md`, `docs/plans/masterplan.md`, `docs/plans/e1-repo.md`, `docs/decisions/e0-concentric.md`, `docs/decisions/e0-motion.md`, `docs/decisions/e1-source-condition.md`, `docs/research/r1-engines.md`, `r2-behavior.md`, `r3-performance.md`, `r4-package-repo.md`, `r5-v2-audit.md`, `docs/reviews/review-a-spec.md`, `review-b-masterplan.md`.
- dowód: md5 sprzed i po `prek run --files ...` różni się dla tych 14 plików i tylko dla nich (`AGENTS.md`, `README.md`, `e0-spikes.md` i szablon PR bez zmian, więc wykluczenie szablonu działa). Przed runem nie zrobiłem kopii, więc dokładny pre-image odtworzyłem pośrednio: kopie z `MangaShift/tmp/tessera-v3/` po tym samym mdformat (0.7.22, gfm 0.4.1, tables 1.0.0, frontmatter 2.0.8, `--number`) są identyczne z obecnymi plikami dla 11 z nich. `specification.md`, `structure.md` i `masterplan.md` mają po kopii do tmp jeszcze zmiany treści, więc ich różnicy od mdformat nie da się odtworzyć bajt w bajt. Charakter zmian: wyrównanie tabel do szerokości kolumn, `[X]` na `\[X\]`, `---` na linię `______`, puste linie. Treść bez zmian.
- wpływ: pierwszy commit zatrzymałby mdformat; tabele w research są teraz bardzo szerokie (np. `r5-v2-audit.md:7-15`). Pułapka narzędzia: przy plikach nieśledzonych `prek` raportuje mdformat jako `Passed`, mimo że zmienił pliki, bo zmian szuka przez `git diff`.
- minimalna reakcja: przejrzeć zmiany przy `git add`; hooki uruchamiać dopiero na zaindeksowanym drzewie.

#### M4. Lista scope'ów nie pokrywa istniejących obszarów i jest powielona

- miejsce: `.pre-commit-config.yaml:55`; dropdowny `area` w `.github/ISSUE_TEMPLATE/bug.yml:35-44`, `feature.yml:27-36` i `task.yml:18-27`.
- dowód: brak scope'a dla `src/eslint/` (publiczne wejście `@mattymroz/tessera/eslint`, `README.md:55`) i `src/lib/`; `build`, `test` i `ci` dublują typy (`test(test)`); dropdowny nie mają `test`. Preset (`pre-commit-config.yaml:69`) mówi: `repo`, `docs` i jeden scope na obszar najwyższego poziomu.
- wpływ: commit zmieniający regułę ESLint nie ma uczciwego scope'a; lista żyje w 4 miejscach i już się rozjechała.
- minimalna reakcja: dodać `eslint` (i `lib`, jeśli ma osobne commity), zsynchronizować dropdowny albo je usunąć.

#### M5. Główna bramka vitest nie używa configu paczki i w głównym checkoucie zbiera testy z worktree'ów

- miejsce: `package.json:20`, `.pre-commit-config.yaml:128-133`, `ci.yml:39`; `packages/tessera/vitest.config.ts`; `AGENTS.md:57`.
- dowód: w korzeniu nie ma `vitest.config.*`; `bunx vitest list` w korzeniu pokazuje pliki bez prefiksów projektów, a w `packages/tessera` jako `[unit]` i `[dist]`. Vitest 5.0.5 ma `defaultExclude = ["**/node_modules/**", "**/.git/**"]` i globuje z `dot: true` (`node_modules/vitest/dist/chunks/index.1TqnEahn.js:6320-6326`), więc `.worktrees/<n>/packages/**/*.test.ts` trafi do runu w głównym checkoucie. ESLint ignoruje `.worktrees` (`eslint.config.js:8`), vitest nie.
- wpływ: projekty `unit` i `dist` są martwe dla bramki; review w głównym checkoucie odpala też testy cudzych worktree'ów w połowie pracy.
- minimalna reakcja: korzeniowy `vitest.config.ts` z `projects: ['packages/*']` i wykluczeniem `.worktrees/**`; poprawić `AGENTS.md:57`.

#### M6. Brak `no-test-prose` przy testach TS z prozą

- miejsce: `.pre-commit-config.yaml` (brak hooka); `packages/tessera/src/eslint/rules.test.ts:26`, `:144`, `:164`, `:284`, `:303`, `:320`.
- dowód: hook z `hooks-v1.1.0` obejmuje `\.(py|ts|tsx|js|jsx|mjs|cjs|mts|cts)$` (`agents` `.pre-commit-hooks.yaml` przy tagu); globalny standard właściciela (skill `coding`, „Testy i dowody”) wymaga testów bez prozy. Preset trzyma hook w bloku PYTHON, więc jego pominięcie zgadza się z literą presetu, ale nie z celem.
- wpływ: reguła właściciela nie ma strażnika, a 6 komentarzy już ją łamie.
- minimalna reakcja: dodać `no-test-prose` z `MattyMroz/agents@hooks-v1.1.0` i usunąć prozę albo zapisać świadomy wyjątek.

#### M7. Zamiana Biome na ESLint usunęła też formatowanie

- miejsce: `.pre-commit-config.yaml:1-2` i `:105-133`; `eslint.config.js`.
- dowód: blok FRONTEND presetu (`biome-check`) formatuje, sortuje importy i naprawia lint przy każdym commicie. Tessera ma tylko `eslint .` na pre-push i nie ma żadnego formatera TS, CSS ani JSON.
- wpływ: uzasadnienie („Tessera wysyła wtyczkę ESLint”) tłumaczy wybór lintera, ale nie brak formatera; styl kodu nie jest nigdzie egzekwowany.
- minimalna reakcja: decyzja właściciela: formatter (Biome tylko jako formatter albo Prettier) w pre-commit, albo zapisany brak formatowania jako świadome odstępstwo.

### Sugestie

- `AGENTS.md:21` odsyła do `../agents/presets/hooks/references/commit-message.md`, czyli działa tylko z sąsiednim checkoutem; `ci.yml:92` i szablon PR używają formy „in MattyMroz/agents”. Warto ujednolicić i dopisać instalację `mm-validate`: `uv tool install git+https://github.com/MattyMroz/agents@hooks-v1.1.0`.
- Playwright nie istnieje w repo, a ma regułę (`AGENTS.md:14`) i wyjątek w `.gitignore:361-363`. Według skilla `agents-md` (aktualny stan, nie zamiar) i YAGNI można to dodać razem z pierwszym testem Playwright.
- Alternatywa `\.vscode/` w wykluczeniu `check-json` (`.pre-commit-config.yaml:79`) nigdy nie trafi w plik, bo `$` wymaga ścieżki kończącej się na `/`; to błąd odziedziczony z `agents/presets/hooks/assets/pre-commit-config.yaml:105`, który warto naprawić w presecie. W Tessera nie ma `.vscode/`, więc można ją usunąć.

## Zgodność z kontraktem

- `standard.py check`: pass; `OK ... matches the standard`, exit 0.
- `.gitattributes` równy presetowi: pass; `diff` bez różnic.
- `.gitignore` zawiera preset w kolejności: pass (standard.py); jedyna różnica to blok Playwright, ale reguła presetu `dist/` koliduje z `test/dist` (P1).
- hooki zainstalowane: pass; `.git/hooks/` ma `pre-commit`, `commit-msg`, `pre-push` od `prek`; `core.autocrlf=false`.
- `.agent-skills` (`@core`), `.claude/settings.json` (`disableClaudeAiConnectors: true`, bez kluczy poluzowujących), `.worktrees/.gitkeep`: pass.
- CORE presetu: pass poza świadomym dodaniem `no-commit-to-branch` (M2); `conventional-pre-commit` v4.4.0 z identycznymi typami i `--force-scope`; `commit-validation` z `hooks-v1.1.0`.
- DATA FILES: pass; usunięte `check-toml` i `check-symlinks`, bo repo nie ma TOML ani symlinków.
- wykluczenie mdformat dla szablonu PR: pass; szablon nietknięty po runie mdformat (md5).
- format commita i PR: częściowo; szablon PR zgodny z `agents`, ale zależność od ustawienia squash (P4).
- CI: częściowo; P3, P4, M1.
- `AGENTS.md` według `agents-md`: częściowo; 75 linii, bez ID zadań, z mapą i pułapkami, ale mapa opisuje katalog ignorowany przez gita (P1), config niedziałający w bramce (M5) i bramkę czerwoną z założenia (M2).
- odstępstwa świadome: ESLint zamiast Biome jest uzasadniony dla lintu, nie dla braku formatera (M7); własny FRONTEND z bramkami pre-push jest spójny z blokiem PYTHON PROJECT presetu i zielony lokalnie; `no-commit-to-branch` w CORE jest spójny ze `standard.py`, ale ma skutki uboczne (M2); CI na push każdej gałęzi jest uzasadnione kosztem, ale nie zastępuje kontroli PR (P4); szablony zgłoszeń z MangaShift są w porządku poza listą obszarów (M4).

## Wykonane kontrole

```text
python ../agents/scripts/standard.py check --project .
OK    C:\Users\MattyMroz\Desktop\PROJECTS\tessera matches the standard   exit 0

prek run --all-files --hook-stage manual      (prek 0.5.4)
wszystko "(no files to check) Skipped": repo nie ma śledzonych plików, więc wynik jest pusty

prek run --all-files
wszystko Skipped poza no-commit-to-branch: Failed ("You are not allowed to commit to branch 'main'")

prek run --files <62 nieśledzone, nieignorowane pliki>
Passed: whitespace, EOF, line endings, BOM, yaml, merge conflict, large files, case conflict,
private key, symlinks, U+FFFD, check-json, mdformat (mimo zmiany 14 plików, patrz M3)
Failed: no-commit-to-branch (M2), typos (P2)

prek run --hook-stage manual --files <te same pliki>
check-useless-excludes Failed: oba wykluczenia "nie pasują", ale to artefakt braku śledzonych plików
(meta hooki liczą tylko git ls-files); typos Failed (P2)

bun run check
typecheck, eslint, build (tsdown, next build) OK; vitest: 4 pliki, 377/377 passed, 9,5 s
(lokalnie, z ignorowanym test/dist; w czystym klonie byłyby 3 pliki)

git check-ignore -v packages/tessera/test/dist/package.test.ts  ->  .gitignore:87:dist/
bunx vitest list (korzeń i packages/tessera)  ->  M5
md5 62 plików przed i po prek  ->  14 zmienionych (M3)
```

## Niewykonane lub nierozstrzygające kontrole

- `check-hooks-apply` i `check-useless-excludes` na prawdziwym indeksie: niemożliwe bez `git add` (zakaz); po zaindeksowaniu trzeba je powtórzyć.
- Hooki `commit-msg` i `pre-push` end to end: brak commita i pusha (zakaz).
- `commit-validation --shape-only` na planowanej wiadomości bootstrap: wiadomość nieznana.
- CI na GitHubie: nie uruchomiono; nie sprawdzono, czy `MattyMroz/agents` jest dostępne publicznie dla `pip install git+...` i dla `repo:` w prek (bez sieci i `gh`).
- Ustawienia repo GitHub (squash message, branch protection): niedostępne (`gh` zabronione).
- `bun run check` na Linuksie (runner CI): uruchomione tylko na Windows.

## Ograniczenia review

- Pre-image 14 dokumentów sprzed mdformat odtworzyłem pośrednio z kopii w `MangaShift/tmp/tessera-v3/`; dla 3 plików różnica od samego mdformat nie jest odtworzona bajt w bajt.
- W trakcie review pojawił się cudzy plik `docs/reviews/e1-docs.md` (równoległy review); nie był oceniany.

## Zalecany następny krok

1. P1 i P2 (zmiana nazwy `test/dist` albo re-include, `_typos.toml`), potem `git add` i powtórzenie `prek run --all-files --hook-stage manual` oraz `prek run --all-files` w worktree albo z `SKIP=no-commit-to-branch`.
2. Decyzja właściciela w P4 (ustawienie squash i PR check albo jawna kontrola post-merge) i M7 (formatter).
3. P3, M1, M2, M4, M5, M6 w tym samym commicie bootstrap, bo dotyczą tych samych plików konfiguracji.
