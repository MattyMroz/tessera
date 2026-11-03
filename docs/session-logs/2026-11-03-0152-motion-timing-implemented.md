---
kind: session
status: ready-to-resume
created: 2026-11-03T00:52:00Z
subject: motion-timing-implemented
---

# Punkt wznowienia: skala czasów ruchu wdrożona, czeka na ocenę właściciela

## Cel

Skala czasów ruchu z `docs/plans/e3-motion-timing.md` wdrożona globalnie (silnik `motion`, przepisy, `lib/`), zielone bramki, ocena właściciela na żywo, potem commit i push na jego słowo.

## Czytaj przy wznowieniu

1. `docs/plans/e3-motion-timing.md` (REQUIRED): kontrakt: zasady, kategorie czasów, tabela per element, trzy tryby.
2. `docs/decisions/e3-motion.md` (REQUIRED), sekcje „Decyzja właściciela 02.11: hover” i „Wdrożenie skali czasów: decyzje techniczne” (punkty 1–19): co wdrożono, pomiary, otwarte sprawy.
3. `AGENTS.md`, „Wydajność i ruch” (ON DEMAND): reguły ruchu i kotwic po zmianie.

## Skille do wczytania

- `coding`: dalsze poprawki po ocenie właściciela.
- `review`: gdy trzeba ponownie ocenić diff.

## Stan repo / środowiska

- branch: `feat/e3-motion`, HEAD `297e1ba` (= `origin/feat/e3-motion`).
- working tree: 44 zmienione pliki śledzone + 3 nowe (`docs/plans/e3-motion-timing.md`, `docs/research/e3-interaction-states.md`, `docs/research/e3-no-enter-animation.md`) + ten log; nic niezacommitowane.
- push/PR: brak; commit i push tylko na słowo właściciela.

## Gdzie przerwano

- Wdrożenie, naprawa T3, niezależna recenzja (świeży Sonnet) i poprawki po niej zrobione; bramki zielone.
- Następna czynność: ocena właściciela na żywo (`bun run dev`), potem jego decyzje z listy niżej, potem commit (`mm-validate`, `prek run` aż drzewo stoi) na jego słowo.

## Stan pracy

### DONE

- Silnik `motion`: oś `on`/`off`; czasy hover-out 150, follow 100, choice 220 (overshoot 0,1), scene 250, press 50/224; tryby off i reduced wg planu.
- Przepisy: gaśnięcie koloru tylko w spoczynku (wejście 0), trigger listy i segment `joined` bez skali, opcje i wiersze menu bez kroku wciśnięcia, popupy bez przejścia, dialog i tło `scene`.
- Wejście `data-motion-hold` (pokolenie w wartości atrybutu, zdjęcie po dwóch klatkach): zmiana motywu nie animuje płytek.
- Recenzja: 7 ustaleń, wszystkie naprawione (decyzje 14–18): N8 na prawdziwych wierszach menu w `/stress`, cel T2 z powrotem 4 ms, dokumenty bez starego modelu, węższy filtr `motionWork`, warstwy pogoni pigułki hover, wyścig hold, status planu.

### Do decyzji właściciela

- Perf (CPU 4x, 11 % obciążenia, mediana z 5): T1 10 klatek, T2 hover 66,2 / press 98,3 ms (cel 4), T3 1x 41,2 / 4x 277 ms (cel 16 / 100), T4 264, T5 532, N8 wiersze menu 53 ms (nowa metoda, nieporównywalna), warstwy 4. `last.json` nienadpisany.
- T3: widoczne przełączenie kosztuje tyle co `297e1ba`; nadwyżka to drugie przeliczenie stylu przy zdjęciu atrybutu (decyzja 13, rozbicie prowadzącego). Jedyna droga bez niego: znacznik wyjścia z JS, odłożona.
- Pigułki `active`/`raised` bez przejścia opacity 50 ms (zgodne z planem, do potwierdzenia wzrokiem).
- Obwódka „Exporting” (busy) czasem niewidoczna: nieodtwarzalna headless, istniała przed zmianą; potrzebna skala Windows właściciela.

## Weryfikacja

```text
bunx vitest run --maxWorkers=6 -> 20 plików, 836 testów zielone
LAB_PORT=4441 bun run check -> exit 0, 629 przeglądarkowych zielonych, 16 pominiętych
SKIP=no-commit-to-branch prek run --all-files -> zielone (mdformat przepisał Markdown w pierwszym przebiegu)
bun run perf -> tabela wyżej
```

**Nie uruchomiono:** `mm-validate` (zapis kontroli robi się przy commicie na dokładnym drzewie), ocena właściciela na żywo.

## Reguły i zakazy, które muszą przetrwać

- Commit i push tylko na wyraźne słowo właściciela; subagenci bez gita.
- Progów T1–T5 i N8 nie zmieniać bez decyzji właściciela.

## Następny krok

1. [REKOMENDACJA] Właściciel ocenia na żywo `bun run dev` (przyciski, ToggleGroup, menu, lista rozwijana, dialog, zmiana motywu) i rozstrzyga sprawy z listy „Do decyzji właściciela”.
2. Na jego słowo: `git add -A`, `prek run` aż drzewo stoi, `mm-validate`, commit `feat(engine): …`, push.
