---
kind: session
status: ready-to-resume
created: 2026-11-01T12:00:00Z
subject: e2-foundation-part2-done
---

# Punkt wznowienia: E2 część 1 i 2 wykonane, czeka na zgodę na commit i ocenę właściciela

## Cel

Etap E2 Tessery v3: fundament (silniki, przepisy, 7 komponentów + `Text`/`Heading`, laboratorium) gotowy pod rundy komponentów E3. Zamknięcie E2 = ocena właściciela na żywo + commit + rebase na `origin/main`.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                                                 | Po co                             | Tryb      |
| --------- | ---------------------------------------------------------------------- | --------------------------------- | --------- |
| 1         | `AGENTS.md`                                                            | reguły repo, bramki, model warstw | REQUIRED  |
| 2         | `docs/plans/masterplan.md` (E2, „Wejście planu E3 (start)”)            | stan etapów i lista startowa E3   | REQUIRED  |
| 3         | `docs/plans/e2-foundation.md` (część 2: D29–D47, tabele rozstrzygnięć) | kontrakt i decyzje                | REQUIRED  |
| 4         | `docs/reviews/e2-foundation-gaps-2.md`                                 | ostatni audyt, otwarte pozycje E3 | ON DEMAND |
| 5         | `docs/decisions/e2-layers.md`                                          | pomiar warstw, definicja B7       | ON DEMAND |

## Skille do wczytania

- `workflow`, `planning`, `subagent`, `review`, `research`: pętla właściciela „zaplanuj → oceń → wykonaj → oceń → sprawdź, czego brakuje”.

## Stan repo

- repo: `C:\Users\MattyMroz\Desktop\PROJECTS\tessera`, worktree `.worktrees/e2`
- branch: `feat/e2-foundation`, HEAD `378bcee` (bootstrap); cała praca E2 NIEZACOMMITOWANA (ok. 126 wpisów `git status`, wiele plików untracked)
- `origin/main` ma PR #1 `122f769` i PR #2 `589061f` (hooki agents v1.3.2: `.pre-commit-config.yaml`, `ci.yml`, `AGENTS.md`) → rebase wymaga ręcznego scalenia tych trzech plików
- push/PR: brak

## Gdzie przerwano

- ukończone: fazy 0–7 (część 1), 9–14b (część 2), faza 16: 3 recenzje kodu + poprawki F5a, F5b, ponowny audyt + poprawki F6
- następne: (1) zgoda właściciela „D28 tak” → lokalne commity, rebase na `origin/main`, ręczne scalenie, bramki na świeżym klonie; (2) ocena właściciela na żywo (faza 15): `/foundation`, `/screens/edges`, `/screens/overlays`, domyślny ruch `spring`, typeahead, wypukła pigułka, wyspy bez ramek; (3) zamknięcie: usunąć `docs/research/e2-facts-*.md` i inne wykonane researche DOPIERO po commicie (są untracked — usunięcie przed commitem traci je bezpowrotnie)

## Zweryfikowane fakty (ostatnia bramka F6, z korzenia worktree)

```text
bun run typecheck -> 0
bun run build -> 0
bun run lint -> 0
bunx vitest run --maxWorkers=6 -> 758/758
LAB_PORT=4377 bun run --filter @mattymroz/tessera-docs test:browser -> 256 passed, 12 skipped (WebKit z powodem), 0 failed
```

B8 = 146/250. B7 = warstwy rysujące z polem > 0, ≤ 12 (sceny 2–5).

## Decyzje prowadzącego z tej sesji (właściciel: „podejmuj takie decyzje najlepszym możliwym sposobem; to ważne decyzje”)

- pigułka: wypukła (`raised`) domyślnie, bez wciśnięcia, hover płaski i słabszy; w liście pojedynczego wyboru pigułka, tło zaznaczenia tylko przy `aria-multiselectable`
- wyjście kursora z listy chowa hover (Base UI zdejmuje podświetlenie; strzałka startuje od pierwszej)
- segmenty o równych szerokościach, min. szerokość = wysokość, tor koncentryczny (`data-surface="track"`)
- kursor z osi `platform` (desktop: strzałka, web: rączka); `profile` rozdzielone na `platform` + `typeset`
- statusy jak akcenty: jedna wartość w obu trybach (reguła „żywe kolory, ciemnego nie ruszać”)
- obszar trafienia = pudełko; przy `pointer: coarse` ≥ 24×24
- B7 liczy warstwy rysujące; pętla `aria-busy` przycięta do obrysu (`overflow: clip` w `@supports`)
- wyspy `base` i karty `raised` bez ramki (wypełnienie + cień)
- toast i jego wejście: E3, pytanie do właściciela (W16 bez zmian)

## Reguły i zakazy, które muszą przetrwać

- commit/push tylko na wyraźne słowo właściciela („D28 tak”); subagenci bez git
- zero komentarzy w kodzie Tessery, zero legacy, edycja tylko Edit/Write
- vitest `--maxWorkers=6`, Playwright headless 1 worker, budżet sesji 6 procesów
- nigdy `git worktree remove --force`; najpierw zdjąć junctiony

## Następny krok

1. [REKOMENDACJA] Poczekać na „D28 tak”; wtedy commity logiczne (część 1, część 2, poprawki recenzji) lokalnie, bez pusha.
2. Ocena właściciela na żywo i poprawki z niej.
3. Plan E3 według „Wejście planu E3 (start)” w masterplanie.
