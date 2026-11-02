---
kind: session
status: in-progress
created: 2026-11-02T03:00:00+01:00
subject: e3-fix-packs-merged
---

# Punkt wznowienia: E3, pakiety poprawek A i B scalone, czeka decyzja właściciela R1, potem runda D

## Cel

Tessera v3 = UI z klocków gotowych z pudełka, wszystkie platformy, telefon bez zacięć, kod senior. Właściciel 02.11: „musimy zrobić tę bibliotekę za wszelką cenę”, pracować bez przestojów, proste rzeczy na Sonnecie. Fundament poprawiany równolegle z rundami.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                                              | Po co                                                                                                    |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1         | `AGENTS.md`                                                         | reguły, Pułapki (nowe: `mm-validate`, `mdformat`, łamanie po literze, minimum przycisku, nagłówek karty) |
| 2         | `docs/plans/masterplan.md` „Aktualny etap”                          | kierunek                                                                                                 |
| 3         | `docs/decisions/e3-owner-review-2026-11-01.md` „Druga ocena” R1–R12 | stan poprawek właściciela                                                                                |
| 4         | `docs/decisions/e3-size-scale.md`, `docs/decisions/e3-fix-a.md`     | co wdrożono w pakietach B i A, pomiary R1                                                                |
| 5         | `docs/research/e3-round-d-facts.md` (22 luki w sekcji 7)            | wejście planu rundy D                                                                                    |
| 6         | `docs/plans/e3-code-quality.md`                                     | refaktor jakości: etap 1 zrobiony, 2–6 czekają                                                           |
| 7         | scratchpad sesji `bf52428f-…\scratchpad\owner-rules.md`             | 12 zasad właściciela do briefów (przenieść do `AGENTS.md`)                                               |

## Stan repo

- `feat/e2-foundation` (worktree `.worktrees/e2`): `0a84693` E2+E3 A–C + etap 1 refaktoru → `efe9525` dokumenty → `779d67f` pakiet B (skala, kształt, cienie, nakładki) → `f3e79f6` pakiet A (przyciski, fade, overflow, nagłówek karty) → `5660a81` scalenie. Bramka scalenia: typecheck, lint, build, vitest 840/840, Playwright 555 passed / 16 skipped / 0 failed. Bez pushu.
- Worktree `.worktrees/e3-behavior` i `.worktrees/e3-scale` (gałęzie scalone) można usunąć — NAJPIERW zdjąć junctiony z `node_modules` (Pułapki), potem `git worktree remove` bez `--force`.
- Laboratorium właściciela: kopia `out` w `scratchpad\live\out`; serwer `bun serve.ts 4400` w `scratchpad\live` trzeba uruchomić ponownie po restarcie komputera.

## Zrobione w tej sesji (02.11)

R2 (łamanie po literze, wielokropek pól), R3/R10 (opakowania kontrolek z rozmiaru: tor, menu, `joined` = `round(h/8)` + obrys, promień koncentryczny), R4 (`fade` domyślnie), R5 (2,5 × wysokość kontekstowo, `hug`, bok tekstu jak v2, rzędy akcji się zawijają), R8 (tylko strażnik — nie odtworzono), R11 (bez pierścienia w cieniu), R12 (własny promień kontrolki od ~16 px odstępu), skala: tooltip, Kbd/Badge dziedziczą rozmiar, „×” z linii tytułu, odstęp ikona–tekst ściśle rośnie; nakładki bez obrysu (jasny: sam cień, ciemny: cień + uniesione wypełnienie); hover jasny 4/8/12; wciśnięcie opcji ToggleGroup; nagłówek karty zawijany z tytułem ≥ 12ch.

## Czeka na właściciela

**R1 — wciśnięcie przycisku.** Właściciel: tekst i ikona skalują się z przyciskiem, płynnie, bez przeskoku. Pomiar (pakiet A, `docs/decisions/e3-fix-a.md`): Chrome w spoczynku przyciąga każdą ikonę i tekst do siatki pikseli osobno, a w transformacji rysuje je w prawdziwym położeniu; żadne przesunięcie całego przycisku tego nie wyrówna. Drogi:

- (a) płytka `::before` (stan obecny): zero przeskoku, ale tekst się nie skaluje — właściciel odrzucił;
- (b) skala całego przycisku jak przed B1 (triggery popupów bez skali): budżet warstw OK, przeskok 0,5–1 px na starcie i końcu, chwilowa zmiana wygładzania tekstu;
- (c) stała warstwa jak v2 (`will-change` na stałe): przeskok ≤ 0,15 px przy DPR 1 i 2 (0,67 przy 1,5), ale 55–318 warstw zamiast ≤ 12 (zacinanie na telefonie) i szary tekst w spoczynku.
  Rekomendacja prowadzącego: (b) — przeskok mniejszy niż sam ruch skali (krawędź przycisku 60 px przesuwa się o ~0,9 px), wydajność bez strat; pokazać na żywo obok (a).
  Od wyboru zależą: R9 (szew przycisku podzielonego, 3 warianty), tooltip przy wciśnięciu, strażnicy wciśnięcia.

## Następne kroki

1. Właściciel: R1 na żywo (`:4400`), ocena pakietów (tor, menu, tooltip, nakładki, przyciski, karta).
2. Po R1: wdrożenie wybranej drogi + R9 (warianty szwu, wybór prowadzącego z plansz).
3. Plan rundy D z `e3-round-d-facts.md` (rozstrzygnąć 22 luki: m.in. szyna Slidera sm = md, obszar trafienia Checkboxa, Enter, `largeStep`, etykieta Slidera bez `internals`), wykonanie w osobnym worktree; refaktor jakości etapy 2–6 obok (osobny worktree).
4. Przenieść 12 zasad właściciela do `AGENTS.md`.

## Reguły, które muszą przetrwać

- Commit na branchach na słowo właściciela („commit tak”, 01.11); push tylko na osobne słowo.
- Prowadzący pierwszy ogląda plansze; zasady właściciela = strażnicy; nie zmieniać zaakceptowanego wyglądu bez właściciela; „jak v2” tylko dla zachowań i paddingu/najmniejszej szerokości przycisku.
- Zero komentarzy, zero legacy, edycja tylko Edit/Write (nie `sed -i`), subagenci bez git zapisu, osobne porty laboratorium na worktree, Sonnet do prostych zadań.
