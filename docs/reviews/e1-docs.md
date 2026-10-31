---
kind: review
status: fail
reviewed-state: working tree C:\Users\MattyMroz\Desktop\PROJECTS\tessera (main, bez commitów), 2026-10-31 ok. 01:20
date: 2026-10-31
---

# Review: zgodność dokumentów z repo Tessera po E1 (kroki 1–7)

## Zakres

- przedmiot: `AGENTS.md`, `README.md`, `docs/structure.md`, `docs/plans/masterplan.md`, `docs/plans/e1-repo.md`, odnośniki do `docs/specification.md` i `docs/decisions/*`, ślady `MangaShift/tmp/tessera-v3`.
- baseline: working tree przed pierwszym commitem; `structure.md` to drzewo docelowe (brak folderów silników, przepisów, motywów, `scripts/`, `LICENSE` nie jest rozbieżnością, Z8).
- authority: `docs/specification.md` (U17 po zmianie 31.10), `docs/decisions/e1-source-condition.md`, faktyczne pliki i komendy.
- ryzyko: świeży agent dostaje fałszywą mapę (powtórka błędu v2).
- poza review: treść research i starszych recenzji, poprawność kodu poza tym, co twierdzą dokumenty, E1 kroki 8–9 (jeszcze nie wykonane).

## Werdykt

**Status:** FAIL (naprawialny kilkoma edycjami dokumentów i jedną decyzją).

**Najważniejszy powód:** zmiana U17 z 31.10 (laboratorium czyta `dist`) nie dotarła do `AGENTS.md` ani do planu E1, a najnowszy punkt wznowienia w MangaShift kieruje świeżą sesję do starych kopii dokumentów w `MangaShift/tmp/tessera-v3/`, które mówią to samo stare U17.

## Findings

### Poważne

#### P1. AGENTS.md i plan E1 opisują laboratorium czytające `src` przez warunek `source`

- miejsce: `AGENTS.md:51` („warunek `source` → `src/` dla workspace”), `AGENTS.md:58` („czyta źródła paczki przez warunek `source`”), `AGENTS.md:9` i `README.md:34` (`bun run dev` opisane jako sam `next dev`), `docs/plans/e1-repo.md:30` (krok 6: „importująca `tessera.css` przez warunek `source`”).
- dowód: `docs/specification.md:63` (U17: strona czyta `dist`, `source` tylko dla TypeScriptu), `docs/decisions/e1-source-condition.md` (Turbopack obsługuje tylko warunek `browser`; pomiar: CSS pochodzi z `dist`), `package.json:24` (`dev` = `bun run --filter '*' --parallel dev`, czyli `tsdown --watch` w paczce + `next dev`), `apps/docs/next.config.ts` bez żadnej konfiguracji warunków.
- wpływ: agent uruchomi samo `next dev` w `apps/docs` albo zmieni `src` i będzie oczekiwał zmiany w laboratorium bez builda; recenzent oceni laboratorium jako test źródeł, a nie tego, co dostaje konsument. To dokładnie klasa błędu z v2 (AGENTS.md przeczy kodowi).
- minimalna reakcja: `AGENTS.md:51` → „warunek `source` → `src/` tylko dla TypeScriptu (`customConditions`); bundlery, laboratorium i konsumenci czytają `dist/` (U17)”; `AGENTS.md:58` → „czyta `dist` paczki jak każdy konsument (U17)”; `AGENTS.md:9` i `README.md:34` → „`tsdown --watch` w paczce + `next dev` w `apps/docs`”; w `e1-repo.md:30` skreślić „przez warunek `source`” i dopisać odwołanie do `decisions/e1-source-condition.md`.

#### P2. Najnowszy punkt wznowienia prowadzi do starych kopii dokumentów w `MangaShift/tmp/tessera-v3/`

- miejsce: `MangaShift/docs/session-logs/2026-10-31-0056-tessera-v3-spec-and-e1-start.md:18-24` (źródła REQUIRED: `MangaShift/tmp/tessera-v3/plans/e1-repo.md`, `specification.md`, `masterplan.md`, `structure.md`, `decisions/`), `:37` („`PROJECTS/tessera`: nie istnieje”), `:49` („E1 kroki 1–9 NOT STARTED”); `docs/plans/e1-repo.md:44` (wyjście: dokumenty „przeniesione”).
- dowód: `MangaShift/tmp/tessera-v3/` nadal zawiera spec, structure, masterplan, decisions, plans, research, reviews i `spikes/`; `diff` pokazuje, że kopie już się rozjechały z `tessera/docs/`: stare U17 (`tmp/.../specification.md:63`: „Strona dokumentacji czyta źródła paczki”), brak `decisions/e1-source-condition.md`, masterplan z linkami sprzed przeniesienia i zdaniem „Do E1 w `MangaShift/tmp/tessera-v3/plans/`”. Log jest nieśledzony i jest najnowszym plikiem w `docs/session-logs/`, więc to on trafi do `load-session`.
- wpływ: świeża sesja wczyta jako REQUIRED nieaktualną spec i plan oraz uzna, że repo nie istnieje i E1 nie ruszył. Dokumenty w repo mówią co innego niż te, które agent dostanie pierwsze.
- minimalna reakcja: za zgodą właściciela (reguła MangaShift: `tmp/` nie czyścić bez zgody) usunąć `MangaShift/tmp/tessera-v3/` razem ze `spikes/concentric` (log sam każe go usunąć „przy przenosinach dokumentów”, `:39`) i zapisać nowy punkt wznowienia wskazujący `PROJECTS/tessera/docs/` oraz stan E1 (kroki 1–7 zrobione, 8–9 przed nami).

#### P3. Brak `styles/tailwind.css`, a komentarz w kodzie mówi „jedyne wejście”, wbrew U15 i planowi E1

- miejsce: `docs/plans/e1-repo.md:18` i `:27` (pierwszy kod paczki: „`styles/tessera.css` … , `styles/tailwind.css`”), `docs/structure.md:61-62` (wejście 1 i wejście 2), `docs/specification.md:61` (U15: „Paczka ma dwa wejścia CSS”).
- dowód: `packages/tessera/src/styles/` zawiera tylko `tessera.css`; `packages/tessera/src/styles/tessera.css:1` („The single entry of the package”); `packages/tessera/package.json` `exports` bez `./tailwind.css`; `README.md:52-56` wymienia jedno wejście CSS. Ani masterplan, ani `e1-repo.md` nie zapisują odłożenia.
- wpływ: albo krok 3 E1 jest niedokończony, albo spec zmieniła się bez zapisu. `AGENTS.md:64` każe w takim wypadku zgłosić konflikt właścicielowi, a komentarz w kodzie już wybrał wersję.
- minimalna reakcja: decyzja prowadzącego lub właściciela. Jeśli `tailwind.css` czeka na pierwsze tokeny (Z8: nie ma czego mostkować), dopisać to w `e1-repo.md` przy kroku 3 i zmienić komentarz na „the entry that declares the layer order”; jeśli nie, dodać plik i wpis w `exports` oraz README.

#### P4. Żaden dokument nie mówi, które kroki E1 są zrobione

- miejsce: `docs/plans/masterplan.md:74` („Następny artefakt lub decyzja: plan E1 (`plans/e1-repo.md`)”), `docs/plans/e1-repo.md:1-6` (`status: active`, tabela kroków bez stanu).
- dowód: plan istnieje i jest wykonywany; w repo są wyniki kroków 1–7: `python ../agents/scripts/standard.py check` → „matches the standard”, hooki `commit-msg`, `pre-commit`, `pre-push` w `.git/hooks`, `core.autocrlf=false`, workspace, paczka z `test/dist/package.test.ts`, strażnik `test/guards/css-layers.ts`, reguły w `src/eslint/`, `apps/docs`, AGENTS/README/CI. `bunx vitest list` zbiera 34 testy, w tym 4 z `test/dist` i 5 strażnika warstw.
- wpływ: świeży agent nie odróżni z dokumentów kroków zrobionych od pozostałych (8: próba z MangaShift, 9: commit i GitHub) ani odstępstw od planu (P1, P3, m7).
- minimalna reakcja: w `masterplan.md:74` wpisać „E1 krok 8 (próba dwóch repo, po pytaniu właściciela), potem krok 9”; w `e1-repo.md` dodać kolumnę stanu albo krótką sekcję „Stan” z krokami 1–7 i odstępstwami.

### Mniejsze

- **m1. Projekty vitest nie działają z korzenia.** `AGENTS.md:57` („`vitest.config.ts`: projekty `unit` i `dist`”) i `structure.md:40` sugerują projekty, ale korzeń nie ma konfiguracji vitest, więc `bunx vitest run` z korzenia ignoruje `packages/tessera/vitest.config.ts`. Dowód: `bunx vitest list --project unit` → „No projects matched the filter "unit"”; `bunx vitest list` wypisuje testy bez nazw projektów. Wszystkie testy i tak biegną. Reakcja: korzeniowy `vitest.config.ts` z `projects: ['packages/*']` albo poprawka zdania w AGENTS. Do sprawdzenia przy okazji: domyślny `exclude` vitest nie obejmuje `.worktrees/`, więc bieg w głównym drzewie może zebrać testy z worktree agentów (nie weryfikowałem, worktree są dziś puste).
- **m2. N10 rozstrzygnięte, dokumenty jeszcze nie.** `structure.md:21` („albo biome.json, po decyzji N10”) i `specification.md:289` (N10 w „Nierozstrzygnięte”), a `e1-repo.md:16` rozstrzyga ESLint i `eslint.config.js` istnieje. Reakcja: N10 jako ustalenie w spec, w structure usunąć wariant Biome.
- **m3. Zakres U i daty.** `structure.md:9` odwołuje się do U1–U25, a spec ma U1–U33 (`specification.md:79`). Frontmatter `updated: 2026-10-30` w `structure.md:4`, `masterplan.md:4` i `specification.md:4`, choć wszystkie trzy mają zmiany z 31.10. Historia kierunku w masterplanie (`:100-108`) nie notuje zmiany U17.
- **m4. `build` to nie tylko tsdown.** `AGENTS.md:8` („build (tsdown)”), a `bun run build` uruchamia też `next build` w `apps/docs` (`apps/docs/package.json:8`). README (`:36`) mówi to dobrze.
- **m5. Wykonany plan nie znika.** `AGENTS.md:68` („Wykonany plan albo research znika”), a `docs/plans/e0-spikes.md` zostaje, choć E0 jest zamknięty (`masterplan.md:35`, accepted 31.10). Reakcja: usunąć albo zapisać wyjątek (np. do końca E1, bo część (a) przeszła do kroku 8).
- **m6. Niejednoznaczna ścieżka do v2.** `docs/decisions/e0-motion.md:21` podaje `tessera/packages/tessera/src/components/_internal/floating-indicator.tsx`; w nowym repo to wygląda jak ścieżka tego repo. Plik istnieje w `MangaShift/tessera/...` na branchu `refactor/tessera-motion`. Reakcja: prefiks `MangaShift/` i nazwa brancha, jak w `specification.md:110`.
- **m7. Krok 1 planu E1 nie zgadza się z repo i z presetem.** `e1-repo.md:25` każe pracować na `chore/bootstrap`; repo stoi na nienarodzonym `main` (`git branch --show-current` → `main`, brak commitów). „OWN bez `const-docstrings`”: preset nie ma bloku OWN, `const-docstrings` jest w bloku PYTHON (`agents/presets/hooks/assets/pre-commit-config.yaml:134-155`), który repo słusznie pomija. Ważne dla kroku 9: `no-commit-to-branch` (`.pre-commit-config.yaml:41`) zablokuje pierwszy commit na `main`, a `e1-repo.md:37` dopuszcza go tylko warunkowo. Plan powinien powiedzieć, jak powstaje pierwszy commit (np. `git switch -c chore/bootstrap` przed nim).
- **m8. Pułapka świeżego klonu dla laboratorium.** `decisions/e1-source-condition.md` („Skutek”) mówi, że laboratorium wymaga zbudowanej paczki; `AGENTS.md` „Pułapki” (`:72`) mówi to tylko o `test/dist`. `--parallel` w `dev` nie czeka na pierwszy build tsdown (nie sprawdzałem, czy `next dev` się po nim podnosi). Reakcja: jedno zdanie w Pułapkach.

### Sugestie

- `structure.md:79-92`: „Każda reguła ma strażnika” w czasie teraźniejszym; dziś istnieje tylko strażnik warstw CSS i reguły eslint konsumenta (nieużywane na samym repo, `eslint.config.js` ich nie włącza). Oznaczenie „jest / powstaje z pierwszym …” przy każdym wierszu usunie dwuznaczność.
- `AGENTS.md:44`: „nazwany wyjątek z powodem w jednym pliku” bez nazwy pliku; warto wskazać docelową ścieżkę (spec wspomina format `motion-exceptions.ts`, `specification.md:118`).
- `README.md:7-14`: model trzech warstw opisany jak istniejący; „Status: version 3, early work” łagodzi, ale można dodać „engines, recipes and components land from E2”.

## Zgodność z kontraktem

- `AGENTS.md` komendy `bun run check`, `prek run --all-files`, kolejność bramek (`package.json:20`, `.pre-commit-config.yaml:108-133`): pass.
- scope'y commitów (`structure.md:96` = `--scopes` w `.pre-commit-config.yaml:55`): pass.
- ścieżki z `AGENTS.md` (`src/styles/tessera.css`, `src/eslint/index.ts` z `configs.recommended`, `src/lib/`, `test/guards/css-layers.ts` z `fixtures/good|bad`, `test/dist/`, `tsdown.config.ts` ESM/unbundle/dts/React Compiler, `.worktrees/.gitkeep` i ignorowanie zawartości, `.agent-skills` = `@core`): pass.
- zewnętrzne: `../agents/presets/hooks/references/commit-message.md`, `~/.claude/hooks/guard.sh` podpięty w `~/.claude/settings.json`, `mm-validate`, `prek`: istnieją.
- relatywne linki: `README.md:62-65`, `masterplan.md:15-16,112` (`../specification.md`, `../structure.md`), `specification.md:9` (`plans/masterplan.md`): pass. Ścieżki MangaShift w `masterplan.md:18-19` i `specification.md` (W6, „Przenoszone z v2”): istnieją.
- `README.md` wymagania (bun 1.4.3 = `packageManager`), komendy, eksporty `lib/*`, `eslint`, `tessera.css`, brak `.`: pass (poza P1 i P3).
- `masterplan.md` E1 = current, rezultat E1 zgodny z repo poza P3; `standard.py check`: pass.

## Wykonane kontrole

```text
find (drzewo bez node_modules/dist/.next/out/.git/.claude/skills/.agents) + ls -la
  uwaga: pierwszy listing przyciął też packages/tessera/test/dist (nazwa „dist”); poprawione ręcznie
python ../agents/scripts/standard.py check      -> OK, matches the standard
bunx vitest list                                -> 34 testy, bez nazw projektów
bunx vitest list --project unit                 -> Error: No projects matched the filter "unit"
diff MangaShift/tmp/tessera-v3/* vs tessera/docs/* -> spec, structure, masterplan różne; brak e1-source-condition w tmp
git (tylko odczyt): branch main, brak commitów; hooki zainstalowane; core.autocrlf=false
```

## Niewykonane lub nierozstrzygające kontrole

- `bun run check`, `bun run build`, `bun run dev`, `next build`: nie uruchamiane (zapisują `dist`/`.next`/`out`; zakres read-only). Twierdzenia o zielonych bramkach nie są tu potwierdzone.
- Czy `bun run --filter '*' build` buduje w kolejności zależności (twierdzenie `e1-source-condition.md`): nie sprawdzone.
- Zachowanie `next dev` na świeżym klonie przed pierwszym buildem tsdown (m8): nie sprawdzone.
- CI na GitHubie: repo jeszcze nie wypchnięte.
- Treść research r1–r5 i recenzji A/B: tylko grep ścieżek.

## Zalecany następny krok

- Poprawić P1 i P4 w dokumentach (kilka linii), rozstrzygnąć P3, a P2 zamknąć nowym punktem wznowienia i, za zgodą właściciela, usunięciem `MangaShift/tmp/tessera-v3/`. Mniejsze można zebrać w tej samej rundzie.
