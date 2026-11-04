---
kind: session
status: in-progress
created: 2026-10-31T15:19:00+01:00
subject: e2-foundation-phase-6-running
---

# Punkt wznowienia: E2 fundament, faza 6 w toku

## Cel

Plan `docs/plans/e2-foundation.md`: 9 silników, 5 przepisów, motyw `mangashift`, kaskada wyborów, 7 komponentów (Button, Input, ToggleGroup, Menu, Popover, Dialog, Tooltip), sliding w 4 trybach, przelot okienek, laboratorium z panelem, `/foundation`, `/components`, `/screens/overlays`; potem checkpoint 2 właściciela, recenzja kodu, zamknięcie.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                               | Po co                                                                                               | Tryb      |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------- |
| 1         | `AGENTS.md`                                          | reguły (zero komentarzy, kolejność bramek, model warstw `--ts-`)                                    | REQUIRED  |
| 2         | `docs/plans/e2-foundation.md`                        | decyzje D1–D28, drzewo, fazy                                                                        | REQUIRED  |
| 3         | `docs/decisions/e2-base-ui.md`                       | jak używać Base UI, ToggleGroup = RadioGroup, kontrakt `popup-flight`                               | REQUIRED  |
| 4         | `docs/specification.md`                              | zmienione w fazie 0: U9, U10, U19, U31, U32, W8, W20, F1, F3, F4, F6, Q13, N8; U18 zmienia agent 6b | REQUIRED  |
| 5         | `docs/reviews/e2-plan-*.md`, `docs/research/e2-*.md` | uzasadnienia decyzji                                                                                | ON DEMAND |

## Skille do wczytania

- `coding`, `simple`, `workflow`: wykonanie; `subagent`: briefy (szablon, zero komentarzy, zero git); `review`: faza 7; `save-session`.

## Stan repo / środowiska

- Repo: `C:\Users\MattyMroz\Desktop\PROJECTS\tessera`, worktree `.worktrees/e2`, branch `feat/e2-foundation` = `378bcee` (NIC niezacommitowane, ~92 zmienione/nowe pliki).
- Zgoda na lokalne commity (D28): BRAK — właściciel nie odpowiedział wprost. Nie commitować bez słowa.
- Remote `origin/main` = `122f769` (PR #1 właściciela: hooki `agents` v1.3.1, `no-replacement-char`; zmienia `.pre-commit-config.yaml`, `ci.yml`, `AGENTS.md`). Przed pierwszym commitem: rebase `feat/e2-foundation` na `origin/main` i ręczne scalenie tych 3 plików (zachować obie strony: tu build przed lint, hook `test-browser`, reguła zero komentarzy).
- CI GitHuba nie startuje (płatności konta); runner self-hosted po stronie właściciela.
- Bramka: `bun run check` (typecheck → build → lint → vitest → Playwright `test:browser`). Ostatni zielony: po fazie 5b — vitest 632, Playwright 16.

## Aktualizacja przed restartem komputera (31.10, wieczór)

- 6a (Button, Input, Popover, Dialog), 6b (ToggleGroup na Base UI RadioGroup, Tooltip z przelotem, nowe API `lib/popup-flight.ts`: `createPopupFlight({ grace })`, `usePopupFlight`), 6c (Menu z pigułką, podmenu `delay={0}`, `SUBMENU_SWITCH_GRACE = 150`) — GOTOWE. Ostatni pełny wynik: vitest 646, typecheck, build, lint zielone; `test:browser` czekał na stronę `/components`.
- `tessera.css` importuje `../components/toggle-group/toggle-group.css`.
- 6d PRZERWANE restartem (status do sprawdzenia w plikach): zadania: (1) `apps/docs/app/components/page.tsx` z 7 sekcji; (2) `app/screens/overlays/page.tsx`; (3) panel na Tessera Menu + ToggleGroup (mode); (4) margines `data-side` i `outline: none` dla wszystkich `[data-level='overlay']` w `recipes/surface.css`, Menu `align="start"`, podmenu wyrównane do triggera; (5) `lib/indicator.ts`: `data-pressing` tylko dla pigułki wciśniętego celu (+ test); (6) `lab.spec.ts` część „zachowanie” (B1 trace, ≤ 2 `backdrop-filter`, B7 ≤ 12, klawiatura); (7) nagrania do checkpointu 2 w scratchpadzie (`cp2/*.webm`). Po restarcie: sprawdzić, które pliki istnieją i czy są spójne, uruchomić `bun run check` raz, dokończyć brakujące punkty nowym subagentem.
- Nowa reguła maszyny (~/.claude/CLAUDE.md „Zasoby maszyny”): jedna ciężka rzecz naraz, jawny limit procesów (≤ 19, mniej przy innych sesjach), Playwright 1 worker, przed długim przebiegiem `ListAgents` i powiadomienie aktywnych sesji; w briefach subagentów limit procesów.
- Sesja `agents-e2` scala na `main` Tessery commit hooków `v1.3.2` (z `.worktrees/hooks-132`) — przy rebase E2 scalić także to.

## Gdzie przerwano

- Fazy 0–5 zrobione i sprawdzone (B8 = 124/250, zero komentarzy).
- Faza 6 w toku u trzech subagentów (równolegle, rozłączne pliki):
  - 6a: Button, Input (wrapper + `<input data-slot="input">`), Popover, Dialog (+ warianty `backdrop`/`dialog` w `recipes/surface.css`), `exports ./components/*`, docs, sekcje `apps/docs/app/components/sections/*`.
  - 6b: ToggleGroup (Base UI RadioGroup, dwie pigułki), Tooltip (Provider + `createHandle`, przelot), poprawki `lib/popup-flight.ts` (4 punkty z `e2-base-ui.md`), U18 w spec.
  - 6c: Menu (Base UI, pigułka pionowo, sticky przy separatorze, podmenu `delay={0}`, przelot podmenu).
- Następna czynność po ich powrocie: sprawdzić `bun run check`, potem agent 6d: strona `/components` z sekcji, ekran `/screens/overlays`, panel na komponentach Tessery (Menu dla osi, ToggleGroup tylko mode), `lab.spec.ts` część „zachowanie” (F15, klawiatura, trace B1, ≤ 2 `backdrop-filter`, B7), nagrania trybów ruchu (scratchpad), kontrola świeżego klonu (wymaga commita → D28).
- Checkpoint 1 właściciela (silniki na `/foundation`): podany, bez odpowiedzi.

## Decyzje tej sesji (poza planem)

- Zero komentarzy w kodzie Tessery (właściciel) — w AGENTS.md.
- Wciśnięcie = atrybut `data-pressing` (Base UI `Toggle` używa `data-pressed`).
- Przepisy: `content: ''` tylko we właściwości `content`; `uppercase` dozwolone; blur przez wyjście `--ts-depth-backdrop`.
- Input = wrapper + natywne `<input>` (miejsce na Button w polu).
- ToggleGroup = Base UI RadioGroup (ocena 8/10 po sondzie; zmiana U18).
- Fonty: `@fontsource-variable/*/wght.css` (leniwy `unicode-range`).
- Build przepisuje czasy na sekundy (`.1s`); `readMotion()` parsuje `ms` i `s`.
- Tryb `off` wyłącza tylko sliding; czasy zeruje `prefers-reduced-motion`.

## Ślepe uliczki

| Próba                                             | Dlaczego nie działa                                   | Nie wracać bez |
| ------------------------------------------------- | ----------------------------------------------------- | -------------- |
| przelot tooltipa przez `Tooltip.Viewport` Base UI | animuje `top/left` i `width/height`                   | —              |
| dwie animacje `scale` na jednym elemencie pigułki | `compositeFailed` 64                                  | —              |
| `getComputedStyle` zmiennej jako dowód wartości   | zwraca niepoliczony tekst                             | —              |
| test squircle tylko w Playwright WebKit           | WebKit Playwrighta wspiera `corner-shape`, Safari nie | —              |

## Reguły, które muszą przetrwać

- Commit i push tylko na słowo właściciela; subagenci zero komend git; edycja tylko Edit/Write; `bunx vitest run`, nigdy `bun run test`; Playwright 1 worker.
- Wygląd ocenia właściciel na żywo; status przed oceną = „gotowe do oceny”.

## Następny krok

1. [REKOMENDACJA] Odebrać 6a/6b/6c, `bun run check`, puścić 6d.
2. Zapytać właściciela o D28, potem rebase na `origin/main`, commit, kontrola świeżego klonu.
3. Checkpoint 2 (ekran + ruch + nagrania), potem faza 7 (trzech recenzentów), faza 8.
