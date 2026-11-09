---
kind: decision
date: 2026-10-31
stage: E0 (b)
---

# Promień koncentryczny samym CSS

## Wynik

Działa bez JS w Chromium 153 (WebView2) i WebKit 26.6 (build Playwrighta na Windows), sposobem B. F2 i Q7 zostają bez zmian. Uwaga z 31.10: WebKit Playwrighta nie jest Safari stabilnym; wspiera np. `corner-shape`, którego Safari stabilne nie ma (`reviews/e2-plan-tech.md` P1), więc gałęzie zapasowe trzeba testować osobno.

| Sposób                                                                          | Chromium 153                                     | WebKit 26.6          |
| ------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| A: `inherit(--r)` (CSS Values 5)                                                | nie wspiera (`CSS.supports` = false, wartości 0) | działa, 6/6          |
| B: nazwa zmiennej per poziom zagnieżdżenia, reguła na dokładnie jedną głębokość | działa, 6/6 + portal                             | działa, 6/6 + portal |

Przypadki: promień korzenia 16/24/10 px, padding na poziomach 8/6/4, 4/4/4, 8/8/8, minimum 4 px, 4 poziomy; popup w portalu jako nowy korzeń (12 px, padding 6 → 6 px).

## Wzorzec (B)

- Poziom N czyta `--c{N-1}` od rodzica i zapisuje własne `--r{N}` oraz `--c{N}` = `max(--r{N} − padding, minimum)` dla dzieci. Żaden poziom nie nadpisuje nazwy, którą dziedziczą jego dzieci, więc nie ma cyklu.
- Selektor trafia w dokładnie jedną głębokość: `.root .s:not(.root .s .s)` itd. Wrappery między powierzchniami nie przeszkadzają (selektor potomka).
- Kontrolki nie znają poziomu: każdy poziom publikuje dodatkowo wspólne `--inner` = swoje `--c{N}`, a kontrolka tylko je czyta (czytanie bez zapisu nie tworzy cyklu). Do potwierdzenia w E2.
- Popup w portalu jest nowym korzeniem z promieniem z silnika `depth`/`shape` dla swojego poziomu; koncentryczność działa w jego wnętrzu, nie względem triggera.

## Ograniczenia

- Głębokość skończona: tyle reguł, ile poziomów (proponowany limit 4–5; więcej zagnieżdżonych powierzchni w jednym korzeniu to sygnał złej kompozycji).
- Gdy Chromium wyda `inherit()`, wzorzec można uprościć do jednej reguły (sposób A); do tego czasu B.
- Sonda: `spikes/concentric/index.html` + `probe.mjs` (Playwright headless). Pierwszy przebieg pokazał 0 w Chromium dla obu sposobów, bo nieobsługiwane `inherit()` zepsuło parsowanie reszty arkusza; po rozdzieleniu arkuszy B działa. Wniosek dla v3: nowej funkcji CSS nie łączyć w jednym arkuszu z regułami, od których zależy wygląd, bez `@supports`.
