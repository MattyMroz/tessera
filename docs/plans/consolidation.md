---
kind: plan
status: draft
baseline: tessera main 589061f; worktree e2 feat/e2-foundation 0e05eba; MangaShift refactor/tessera-motion 7a48b4310
created: 2026-11-02
---

# Plan: wszystkie materiały Tessery w `tessera/tmp/`, worktree sprawdzone i spięte

## Cel

Każda informacja wyprodukowana dotąd o Tesserze (pamięć, rozmowy, dokumenty, research, pobrane materiały, zrzuty, plansze, scratchpady sesji, kod v2 i wzorzec desktopu, historia gałęzi) leży w jednym miejscu: `C:\Users\MattyMroz\Desktop\PROJECTS\tessera\tmp\`, z jednym spisem. Nikt nie szuka danych po dysku. Worktree repo tessera są sprawdzone; te, które nie zawierają niczego poza commitami `feat/e2-foundation`, są usunięte, a praca zostaje w jednym miejscu.

## Rezultat właściciela

- Otwiera `tmp/index.md` i widzi każde źródło: skąd pochodzi, gdzie leży kopia, ile plików i bajtów, czego nie skopiowano i dlaczego.
- `git worktree list` w tessera pokazuje tylko główny folder; `feat/e2-foundation` jest wyjęty w głównym folderze; żaden commit ani plik nie zginął.
- AGENTS.md ma dwie zasady nadrzędne właściciela (sekcja „Faza 5”).

## Warunki końcowe

- [ ] Każde źródło z „Inwentarza” ma kopię w `tmp/` albo zapisany powód pominięcia zatwierdzony przez właściciela.
- [ ] Dla każdej kopii liczba plików i suma bajtów = źródło (log robocopy), różnice nazwane.
- [ ] Gałęzie Tessery z repo MangaShift w jednym pliku `git bundle`, `git bundle verify` zielony.
- [ ] Niezacommitowany log `2026-11-02-1300-owner-stop-requests-list.md` zachowany.
- [ ] Worktree usunięte dopiero po audycie fazy 3 i „ok” właściciela; po usunięciu te same commity i gałęzie co przed.
- [ ] Żadne źródło nie zostało zmienione ani usunięte (kopia, nie przeniesienie).

## Nie-cel

- Porządkowanie, streszczanie ani przepisywanie treści materiałów na nowo (to osobny plan po tym).
- Usuwanie czegokolwiek z MangaShift, z pamięci MangaShift ani ze scratchpadów.
- Commit, push, merge do `main`.
- Naprawy kodu biblioteki.

## Authority i baseline

- Polecenia właściciela 02.11: „zebrać każdą informację i wsadzić do temp”, „trzyliterowy folder tmp, wszystkie materiały ze wszystkiego, nie obchodzi mnie skąd”, „zobaczyć, co jest w worktree i w razie czego usunąć”, „najpierw zaplanuj”.
- Reguły: `AGENTS.md` (Pułapki: junctiony przy `git worktree remove`), globalny `CLAUDE.md` (katalogi po linuksowemu, jedna ciężka rzecz naraz na sesję).
- `tmp/` jest ignorowany przez git (`.gitignore:154`), więc kopia nie trafia do historii repo.
- Wolne miejsce na C: 334 GB (`df -h`, 02.11).

## Stan aktualny (zweryfikowany 02.11, odczytem)

### Repo tessera

- Główny folder: `main` `589061f`, czysty. Worktree:
  - `.worktrees/e2`: `feat/e2-foundation` `0e05eba`; jedyny plik spoza commitów: nieśledzony `docs/session-logs/2026-11-02-1300-owner-stop-requests-list.md`.
  - `.worktrees/e3-behavior`: `fix/e3-behavior` `0e05eba`, czysty.
  - `.worktrees/e3-scale`: `fix/e3-tooltip` `b781e48`, czysty.
- `git branch --merged feat/e2-foundation`: `fix/e3-behavior`, `fix/e3-scale`, `fix/e3-tooltip` (wszystkie scalone).
- Pliki ignorowane w każdym worktree (poza `node_modules`): `apps/docs/.next/`, `apps/docs/next-env.d.ts`, `apps/docs/out/`, `apps/docs/test-results/`, `packages/tessera/dist/` — wyniki builda i testów, odtwarzalne z commita.
- Linki (junction/symlink): e2 881, e3-behavior 750, e3-scale 750; żaden nie wskazuje poza własny worktree (sprawdzone na celach bezwzględnych).
- Nic z `feat/e2-foundation` nie jest wypchnięte.

### Źródła materiałów (inwentarz)

01. Pamięć Claude projektu MangaShift: `C:\Users\MattyMroz\.claude\projects\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\memory\` — 361 notatek (69 wprost o Tesserze).
02. Rozmowy (transkrypty) sesji MangaShift: ten sam katalog projektu, 8 plików `*.jsonl` (wszystkie wspominają Tesserę) i katalogi sesji z wynikami narzędzi; razem z pamięcią 3,6 GB.
03. Pamięć projektu MangaShiftWebsite: `…\.claude\projects\c--Users-MattyMroz-Desktop-PROJECTS-MangaShiftWebsite\` — 23 notatki (strona, wygląd).
04. Pamięć `…\C--Users-MattyMroz-Pictures-MangaShiftSlime-main-source\` — 3 notatki; temat: grafiki MangaShift Slime, nie UI.
05. Dokumenty MangaShift:
    - `MangaShift/docs/plans/ui-kit/` (181 plików: plany, research, inspiracje, prototypy, referencje),
    - `MangaShift/docs/archive/2026-10/tessera-v1/` (20 plików),
    - `MangaShift/docs/session-logs/` (28 logów z „tessera/ui-kit/kit” w nazwie; pozostałe logi do sprawdzenia treścią w fazie 0),
    - inne pliki `MangaShift/docs/**` wspominające Tesserę albo kit (do znalezienia w fazie 0).
06. `MangaShift/tmp/`: 75 folderów; Tesserowe m.in. `tessera-v3` (dokumenty v3 sprzed repo), `tessera-v2`, `tessera-e4`, `tessera-motion-2026-10-30`, `apple-design` (jedyny wynik skilla `download`, 191 MB), `button-gaps`, `pill-inset`, `ui-shots*`, `ui-geometry`, `geometry-sweep`, `spacing-*`, `tooltip-sliding`, `tree-*`, `research`, `ref`, `site-*`. Poza UI (do decyzji właściciela, faza 0): `backbones` (5,6 GB), `mts-v2-weights` (1,7 GB, wagi modelu), `code` (1,3 GB, treść nieznana).
07. Kod v2: `MangaShift/tessera/` na gałęzi `refactor/tessera-motion` (2242 pliki bez `node_modules` i `dist`); MangaShift czysty (`git status` 0 zmian).
08. Wzorzec zachowań desktopu: `MangaShift/packages/ui/src/` (224 pliki).
09. Gałęzie Tessery w repo MangaShift: 23 lokalne (`feat/tessera-*`, `refactor/tessera-*`, `feat/desktop-tessera`, `feat/site-on-tessera`, `verify/tessera`) i 5 zdalnych.
10. Scratchpady sesji (`C:\Users\MattyMroz\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\<id>\scratchpad`), 5 niepustych z 448:
    - `bf52428f` (sesja v3 30.10–02.11: `owner-rules.md`, `behavior-audit`, `fix-a` z planszami R9, `live` z laboratorium i `press-demo.html`): 57 020 plików, 0,4 GB;
    - `8b501218` (09.10, v2: agent-\*, apple, …): 13 370 plików, 2,5 GB, 2 katalogi `node_modules`;
    - `571b8d21` (29.09, kit: before/after, diff): 12 760 plików, 1,4 GB, 2 katalogi `node_modules`;
    - `8f62a104` (04.10, astra, dist-\*): 772 pliki, 0,1 GB;
    - `4431a428` (06.10, button, gal, shots): 433 pliki, < 0,1 GB.
11. Scratchpady sesji tessera (`…\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-tessera\`): do sprawdzenia w fazie 0 (lista z 02.11 zawierała tylko puste albo bieżącą sesję).
12. Niezacommitowany log w `.worktrees/e2` (patrz wyżej).

## Zakres

### In scope

- Kopia źródeł 1–12 do `tmp/` (bez zmian w źródłach), spis `tmp/index.md`, kontrola kopii.
- Audyt worktree tessera i usunięcie tych, które audyt uzna za puste, po „ok” właściciela.
- Wyjęcie `feat/e2-foundation` w głównym folderze, `bun install`, `bun run build`, żeby laboratorium działało z jednego miejsca.
- Dwie zasady w AGENTS.md (faza 5).

### Out of scope

- Streszczenie i optymalizacja treści notatek i dokumentów (następny plan, na tym spisie).
- Zmiany w MangaShift, w pamięci MangaShift, w scratchpadach.

### Forbidden

- `git worktree remove --force`, `git branch -D`, `rm -rf` na katalogu z linkami, robocopy z `/MIR` albo `/MOV`.
- Kopiowanie przez linki (junction) poza drzewo źródła: robocopy zawsze z `/XJ`.
- Commit, push, zmiana `main`.
- Usunięcie czegokolwiek przed kontrolą kopii i „ok” właściciela.
- Podejmowanie decyzji „to nie dotyczy Tessery” bez zapisu na liście do akceptacji właściciela.

### Dozwolone decyzje lokalne

- Pominięcie `node_modules`, `.mypy_cache`, `__pycache__`, `.next` w kopiach (odtwarzalne, zależności).
- Kolejność kopiowania i nazwy logów robocopy.

### Zatrzymaj się i wróć do właściciela, gdy

- audyt worktree znajdzie cokolwiek poza commitami `feat/e2-foundation` i plikami odtwarzalnymi;
- źródło ma pliki zablokowane albo kopia różni się od źródła;
- folder ma nieznaną treść, a jego rozmiar przekracza 1 GB;
- `bun run build` w głównym folderze po spięciu oblewa.

## Target: drzewo `tmp/`

Ścieżki w środku odwzorowują źródło, nic nie jest przemianowane:

```text
tmp/
├── index.md                     # CREATE: spis źródeł, kopii, liczb i pominięć
├── mem/                         # pamięć Claude
│   ├── mangashift/              # źródło 1 (361 notatek + MEMORY.md)
│   ├── website/                 # źródło 3
│   └── slime/                   # źródło 4, tylko jeśli właściciel zatwierdzi
├── chat/mangashift/             # źródło 2: transkrypty *.jsonl i katalogi sesji
├── msh/                         # MangaShift, ścieżki jak w repo
│   ├── docs/…                   # źródło 5
│   ├── tmp/…                    # źródło 6
│   ├── tessera/                 # źródło 7 (v2)
│   └── packages/ui/src/         # źródło 8
├── git/mangashift-tessera.bundle  # źródło 9
├── pad/<id>/                    # źródła 10–11, każdy scratchpad osobno
└── wtr/e2/                      # źródło 12
```

## Plan wykonania

Każda faza: **plan** (co dokładnie, na liście) → **wykonanie** → **ocena** (dowód). Następna faza rusza po zielonej ocenie poprzedniej. Kopiowanie to ciężka praca dyskowa: jedna kopia naraz, w tle.

### Faza 0 — inwentarz końcowy (tylko odczyt)

**Cel:** zamknięta lista „co kopiujemy”.

**Działania:**

1. Przejrzeć 75 folderów `MangaShift/tmp/` (pierwsze pliki, README, typy plików) i oznaczyć każdy: UI/Tessera albo inne, z jednym zdaniem dowodu. Szczególnie `code`, `backbones`, `mts-v2-weights`, `astra*`, `bridgemind-ai`, `promo`, `logo-lab`, `splash-*`, `comfyui` (nie w tmp, tylko dla porządku).
2. `grep -ril 'tessera\|ui-kit\|ui kit'` po `MangaShift/docs/` poza `plans/ui-kit` i `archive/…/tessera-v1`: lista dodatkowych dokumentów i logów sesji.
3. Lista scratchpadów sesji tessera (źródło 11) z rozmiarem.
4. Rozmiar i liczba plików każdego źródła (bez wykluczonych katalogów).

**Ocena:** tabela w `tmp/index.md` (sekcja „Plan kopii”) z każdym źródłem, rozmiarem i oznaczeniem; lista „poza UI — do decyzji”.

**Human checkpoint:** właściciel zatwierdza listę „poza UI” (kopiować czy nie). Domyślnie, bez odpowiedzi, kopiowane jest wszystko poza wagami modeli ML (`backbones`, `mts-v2-weights`).

### Faza 1 — kopia

**Cel:** każde zatwierdzone źródło w `tmp/`.

**Działania (dla każdego źródła osobno):**

```text
robocopy "<źródło>" "tmp\<cel>" /E /XJ /COPY:DAT /DCOPY:T /R:1 /W:1 /XD node_modules .mypy_cache __pycache__ .next /NP /LOG:"tmp\_logs\<nazwa>.log"
```

- Gałęzie MangaShift: `git -C MangaShift bundle create tmp/git/mangashift-tessera.bundle <lista 23 gałęzi Tessery>`.
- Log z `.worktrees/e2` do `tmp/wtr/e2/docs/session-logs/`.

**Ocena:** dla każdego logu robocopy: `Files: Total = Copied`, `Failed = 0`, `Mismatch = 0`; `git bundle verify` = ok i `git bundle list-heads` = 23 gałęzie.

**Gate:** wszystkie kopie zielone; każda czerwona = stop i raport.

### Faza 2 — spis i kontrola

**Cel:** `tmp/index.md` gotowy dla właściciela.

**Działania:** dla każdego źródła: ścieżka źródła, ścieżka kopii, liczba plików i bajtów źródła i kopii (z logów), pominięte katalogi, czego nie skopiowano i dlaczego; na górze krótki przewodnik „gdzie czego szukać” (pamięć, rozmowy, decyzje v2, zrzuty rund, wzorzec desktopu, kod v2, research, pobrane).

**Ocena:** niezależne przeliczenie plików `tmp/<cel>` (`(Get-ChildItem -Recurse -File).Count`) zgodne z logiem; 5 losowych plików porównanych hashem ze źródłem.

**Human checkpoint:** właściciel otwiera `tmp/index.md` i ocenia, czy czegoś brakuje.

### Faza 3 — audyt worktree (tylko odczyt)

**Cel:** dowód, co jest w każdym worktree poza commitami.

**Działania (dla `e2`, `e3-behavior`, `e3-scale`):**

1. `git status --short` i `git status --ignored --short` (poza `node_modules`).
2. `git log feat/e2-foundation..<gałąź worktree>` — puste = wszystkie commity w `feat/e2-foundation`.
3. `git stash list` (stos wspólny dla repo).
4. Pliki ignorowane: czy któryś nie jest wynikiem builda/testów (np. ręczne pliki w `apps/docs/out`, `perf/last.json` zmieniony, a niezacommitowany).
5. Procesy trzymające pliki w worktree (serwer laboratorium, `bun dev`): lista procesów `bun`/`node` z katalogiem roboczym.

**Ocena:** raport w `tmp/index.md` (sekcja „Worktree”): dla każdego worktree „nic poza commitami” albo dokładna lista rzeczy unikalnych.

**Human checkpoint:** właściciel daje „ok” na usunięcie albo wskazuje, co zachować. Bez „ok” faza 4 nie rusza.

### Faza 4 — spięcie (po „ok”)

**Cel:** jedno miejsce pracy, nic nie zginęło.

**Działania:**

1. Zapisać stan przed: `git worktree list`, `git branch -a`, `git log --oneline -20 feat/e2-foundation` do `tmp/_logs/git-before.txt`.
2. Zatrzymać procesy z fazy 3, które trzymają pliki worktree.
3. Dla każdego worktree: zdjąć wszystkie linki (`dir /AL /S /B`, od najgłębszych, `rmdir` dla katalogów, `del` dla plików), sprawdzić `dir /AL /S /B` = 0, potem `git worktree remove .worktrees/<nazwa>` bez `--force`. Jeśli git odmówi, stop i raport.
4. `git branch -d fix/e3-behavior fix/e3-scale fix/e3-tooltip` (tylko `-d`: git odmówi, jeśli coś nie jest scalone).
5. W głównym folderze: `git switch feat/e2-foundation`; przenieść zachowany log z `tmp/wtr/e2/…` do `docs/session-logs/` (nieśledzony, bez commita); `bun install`; `bun run build`.

**Ocena:** `git worktree list` = jeden wpis; `git log --oneline -20 feat/e2-foundation` = zapis „przed”; `git branch -a` = przed minus trzy scalone gałęzie; `bun run build` exit 0; laboratorium otwiera się z `apps/docs/out`.

### Faza 5 — zasady w AGENTS.md

**Cel:** dwie zasady właściciela jako pierwsze „Twarde reguły” (na `feat/e2-foundation`, bez commita).

**Treść do wpisania:**

- IMPORTANT: każda zmiana jest globalna. Poprawka wyglądu albo zachowania jednego elementu idzie do silnika albo przepisu i dziedziczą ją wszystkie elementy tego rodzaju. Nigdy nie stylujesz elementu w jego własnym kontekście. Zmiana tylko dla jednego elementu jest błędem: reszta zostaje w tyle, a biblioteka traci standard.
- IMPORTANT: żadnej zmiany bez researchu. Najpierw sprawdzasz, jak problem rozwiązali najlepsi (kod, dokumentacja, issues przeglądarek), potem przenosisz i optymalizujesz to rozwiązanie u nas.
- Każda praca idzie w kolejności zaplanuj → wykonaj → oceń; wykonanie bez zaakceptowanego planu i oddanie bez oceny są zabronione.
- Materiały źródłowe całej historii Tessery: `tmp/index.md`.

**Ocena:** diff AGENTS.md pokazany właścicielowi przed zapisem; po zapisie `prek run --files AGENTS.md` zielony.

## Ryzyka i reakcje

- `git worktree remove` wchodzi w junction i kasuje jego cel → wszystkie linki zdjęte i policzone (0) przed usunięciem; cele linków sprawdzone (żaden nie wychodzi poza worktree).
- Kopia przez junction ściąga cudze drzewo albo zapętla się → robocopy `/XJ`.
- Ścieżki dłuższe niż 260 znaków w scratchpadach → robocopy je obsługuje; błędy trafiają do logu i do raportu.
- Pliki zablokowane (serwer laboratorium) → zatrzymanie procesu przed kopią/usunięciem.
- Pamięć MangaShift zmienia się w trakcie (inna sesja zapisuje) → kopia jest migawką z datą w `index.md`.
- Brak miejsca → szacunek przed fazą 1 (suma fazy 0 kontra 334 GB wolnego).

## Definition of Done

- [ ] `tmp/index.md` opisuje każde źródło i każde pominięcie.
- [ ] Wszystkie logi kopii zielone, kontrola hashy zielona.
- [ ] Bundle gałęzi zweryfikowany.
- [ ] Worktree usunięte tylko po „ok”; commity i gałęzie zgodne z zapisem „przed”.
- [ ] Główny folder na `feat/e2-foundation`, `bun run build` zielony, zachowany log na miejscu.
- [ ] AGENTS.md z zasadami po akceptacji diffu.
- [ ] Żadne źródło nie zmienione.

## Kontrakt wyniku

```text
status
co skopiowano (źródło → cel, pliki, bajty)
czego nie skopiowano i dlaczego
wynik audytu worktree
stan git przed / po
wyniki kontroli (robocopy, hash, bundle, build)
odchylenia od planu
następny krok
```
