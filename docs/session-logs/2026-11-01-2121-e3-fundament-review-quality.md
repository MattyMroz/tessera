---
kind: session
status: in-progress
created: 2026-11-01T21:21:00+01:00
subject: e3-fundament-review-quality
---

# Punkt wznowienia: E3 po rundzie C — fundament (odstępy, sloty, overflow), poprawki z oceny właściciela na żywo, przegląd jakości kodu

## Cel

Tessera v3 = UI z klocków: każdy komponent gotowy z pudełka (wygląd, ruch, warianty, sloty, skrajności, overflow, responsywność, a11y, wydajność także na telefonie), wszystkie platformy, kod na poziomie senior. Bieżący etap: E3 (plan `docs/plans/e3-first-round.md`, zaakceptowany 01.11). Teraz: przerwa na fundament między rundą C a rundą D.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                                                                                                                                                                                                                                    | Po co                                                                                                      | Tryb                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1         | `AGENTS.md`                                                                                                                                                                                                                                               | reguły repo, IMPORTANT: zero komentarzy, dziennik decyzji, NIGDY nie transformuj kotwicy popupu, „Pułapki” | REQUIRED                                                                    |
| 2         | `docs/plans/masterplan.md` („Wnioski właściciela 01.11”, E3, decyzja: silnik układu jako runda U w E3, model udostępnienia odłożony)                                                                                                                      | kierunek i zasady właściciela                                                                              | REQUIRED                                                                    |
| 3         | `docs/decisions/e3-owner-review-2026-11-01.md`                                                                                                                                                                                                            | ocena właściciela na żywo: błędy B1–B11, decyzje D1–D8, semantyka S1–S3                                    | REQUIRED                                                                    |
| 4         | `docs/decisions/e3-choices.md` (+ `e3-choices/*.png`)                                                                                                                                                                                                     | wszystkie wybory wyglądu/zachowania do wspólnego przejrzenia                                               | REQUIRED                                                                    |
| 5         | `docs/plans/e3-first-round.md`                                                                                                                                                                                                                            | plan E3 (D48–D81, fazy 0–12, kroki rund R1–R8)                                                             | REQUIRED                                                                    |
| 6         | `docs/decisions/{e3-slots,e3-budgets,e3-base-ui,e3-icons,e2-layers}.md`                                                                                                                                                                                   | decyzje techniczne                                                                                         | ON DEMAND                                                                   |
| 7         | raporty w toku (jeśli powstały): `docs/research/e3-semantics.md`, `docs/reviews/e3-code-quality-package.md`, `docs/reviews/e3-code-quality-lab.md`                                                                                                        | wejście następnych kroków                                                                                  | REQUIRED, gdy istnieją                                                      |
| 8         | scratchpad decyzji rund: `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\e3-r1\decisions-{a-b,c-d,e-f,g-h}.md` + research `rounds-*.md`, `budgets-screens.md` | wiążące rozstrzygnięcia rund D–H (przeniesione też do planu w rundzie 3)                                   | ON DEMAND (scratchpad jest tymczasowy — przy utracie: plan zawiera decyzje) |

## Skille do wczytania

- `workflow`, `planning`, `subagent`, `review`, `coding`, `research`, `save-session`: pętla plan → wykonanie → ocena → braki; briefy subagentów ~2000 słów z `coding` + `review`.

## Stan repo i środowiska

- repo: `C:\Users\MattyMroz\Desktop\PROJECTS\tessera`, worktree `.worktrees/e2`, branch `feat/e2-foundation`, HEAD `378bcee` (bootstrap).
- CAŁA praca E2 i E3 NIEZACOMMITOWANA: 143 wpisy `git status` (wiele untracked). Właściciel nie dał zgody na commit („commit tak” / „D28 tak”). `origin/main` = `589061f` (PR #1, #2: hooki agents v1.3.2; konflikty spodziewane w `.pre-commit-config.yaml`, `ci.yml`, `AGENTS.md`).
- Kopia zapasowa (21:21): `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\e2-backup-2121\{tracked.patch,untracked.tgz}` (starsza: `e2-backup\`). Przywrócenie: `git apply tracked.patch` + rozpakowanie `untracked.tgz` w worktree.
- Issue GitHub: `MattyMroz/tessera#3` (łamanie linii zależne od języka, kropki w podpisach, silnik tekstu).
- Laboratorium na żywo dla właściciela: statyczna kopia `out/` serwowana przez `scratchpad\live\serve.ts` na `http://localhost:4400` (LAN `http://192.168.18.145:4400`), proces w tle `bgnulc1ml`; odświeżenie = skopiować świeże `apps/docs/out` do `scratchpad\live\out`.

## Gdzie przerwano

- **W toku (subagenci w tle):**
  1. Wykonawca poprawek oceny właściciela: B1–B11 (globalna reguła kotwic, skoki popupu przy wciśnięciu, linki rozsypane, lag nakładek, odstęp 2 px w torze, hover pod zaznaczeniem, kontrast hover vs zaznaczenie, reguła odstępu „¼ promienia tylko dla tekstu”, rogi `full`), D1 (opcja wygaszania hover w panelu), D7 (porównanie przycisków z v2), D8 (panel „Motion” z parametrami sprężyny), S1–S3 (zero tekstu UI w bibliotece, test konturu nagłówków i punktów orientacyjnych, kontrakt elementów).
  2. Badacz semantyki HTML → `docs/research/e3-semantics.md` (standard: poziomy nagłówków — kontekst vs `level`, sekcje, landmarks, `div` vs semantyka, kolejność czytania, i18n tekstu, strażnicy).
  3. Recenzent jakości kodu paczki → `docs/reviews/e3-code-quality-package.md`.
  4. Recenzent jakości kodu laboratorium i testów → `docs/reviews/e3-code-quality-lab.md`.
- **Następne (kolejność):** odebrać 1–4, osądzić każdą uwagę (arbiter) → refaktor jakości kodu w paczkach (jeden wykonawca naraz, plan z raportów) → wdrożyć standard semantyki → profil telefonu w pomiarach (emulacja Android CPU 6×/DPR 2,75, iPhone WebKit DPR 3, B7 przy DPR 3) → głęboki audyt całości świeżymi oczami (porównanie z Apple HIG, Material 3, Fluent 2, Radix Themes) → runda D (Checkbox, Switch, Slider) według `decisions-c-d.md`.

## Stan pracy

### DONE (E3)

- Faza 0: ikony lucide 1.66 (`e3-icons.md`), dokumenty.
- Faza 1: `/stress`, budżety B1–B8 w testach, `bun run perf`, axe, N8 → stan jako krok rampy koloru (bez `::after`), kontrast etykiet na wypełnieniu, B3 jeden commit przy wyborze, B7 = warstwy rysujące.
- Runda A (Button, ButtonGroup, split, link, busy, title-when-cut) — wygląd A.
- Runda B (Kbd B, Badge A, Card A, Alert A) + deterministyczny build tsdown.
- Runda C (Field układ C, Input A, Textarea A, Alert Dialog + `confirm` A).
- Audyt symetrii optycznej (`symmetry.spec.ts`, `opticalGaps`, „×” w rogu `DialogDismiss`/`PopoverDismiss`, text-box trim, wspólna kolumna pól, bez rynien paska w popupach).
- Sloty (`lib/slot.ts`: `usePart`, `useSlotOrder`, części `…Title/Description/Actions/Dismiss`, zła kolejność = błąd) i overflow (`overflowProblems`, 17 komponentów, `overflow-wrap: anywhere`).
- Ostatnia zielona bramka (przed poprawkami oceny): vitest 821/821, Playwright 473 passed / 16 skipped / 0 failed.

### NOT STARTED

- Runda D, E (+ ekran Ustawienia), F, G, U (silnik układu — nowa, przed Panelem roboczym), ekran Panel roboczy, H, ekran Wycinek strony, zamknięcie E3, standard (pułapki + decyzje → dokument + skill w repo `agents`).

## Decyzje i ich skutki (najważniejsze z sesji)

- Właściciel delegował wybory („wybieraj najlepsze”; „to ważne decyzje”) — prowadzący decyduje starannie, z dowodem, zapisuje w `docs/decisions/` (wybór, opcje odrzucone, kto, data); właściciel przegląda później (`e3-choices.md`).
- Role: właściciel ocenia wygląd „ok / nie ok”; prowadzący odpowiada za matematykę systemu, powiązania, szukanie braków. Każdy błąd → strażnik maszynowy + wpis „Pułapki”.
- Silnik układu (splitter, panele, zakładki dokumentów, zapamiętany układ, ruch między komponentami) w E3 jako runda „U” po rundzie G, przed ekranem Panel roboczy.
- Model udostępnienia (open source / sprzedaż) odłożony po E5 (masterplan).
- Geist Serif — kandydat na krój display strony w rundzie H, gdy wyjdą wagi (katalog L937).

## Reguły i zakazy, które muszą przetrwać

- Commit/push tylko na wyraźne słowo właściciela; subagenci bez git (tylko odczyt).
- Zero komentarzy w kodzie Tessery; zero legacy; edycja tylko Edit/Write.
- Budżet maszyny: 6 procesów na sesję; vitest `--maxWorkers=6`; Playwright headless, 1 worker; jedna ciężka rzecz naraz w worktree (jeden piszący wykonawca naraz — wszystko w jednym niezacommitowanym worktree).
- NIGDY nie transformuj kotwicy popupu ani jej przodka.
- Kod jak senior: prosto, właściwy zakres i miejsce, bez redundancji i dziwnych konstrukcji, najlepsze praktyki React/TS; przegląd jakości jako bramka każdej rundy (też laboratorium i testy).
- Komponenty: kompozycja bez stylów (sloty), odporność na overflow, symetria optyczna (odstęp od liter, ¼ promienia dla tekstu), skrajne przypadki i responsywność, telefon nigdy się nie zacina.
- `tmp/` właściciela nie czyścić; nigdy `git worktree remove --force`.

## Następny krok

1. [REKOMENDACJA] Odebrać 4 wyniki w toku; osądzić; odświeżyć laboratorium na `:4400` i pokazać właścicielowi poprawki B1–B11.
2. Refaktor jakości kodu według raportów, potem standard semantyki.
3. Ponowić prośbę o „commit tak” — po nim worktree na rundy równolegle.
