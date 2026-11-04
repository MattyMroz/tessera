---
kind: session
status: ready-to-resume
created: 2026-11-03T23:00:00Z
subject: round-d-choice-controls
---

# Punkt wznowienia: runda D (Checkbox, Radio, Switch)

## Cel

Trzy pola wyboru gotowe do oceny właściciela, zoptymalizowane (zero pracy głównego wątku na klatkę), potem cel graniczny (komponent złożony). Sposób pracy: skill `tessera-element` (cykl, pole na błędy, lekcje rundy D).

## Czytaj przy wznowieniu

1. `.claude/skills/tessera-element/SKILL.md` (REQUIRED): proces i lekcje.
2. `docs/decisions/e3-choice-controls.md` (REQUIRED): decyzje właściciela.
3. `docs/plans/e3-choice-controls.md` (ON DEMAND): plan i wartości.
4. Pamięć: `strategia-pole-na-bledy`, `bramki-silnikow`, `jeden-element-proces`.

## Stan repo

- `feat/e3-motion` @ `0408e5c`, wszystko niezacommitowane w głównym drzewie (bez worktree, decyzja właściciela).
- Podgląd: `apps/docs` `bunx next dev --port 4450 --hostname 127.0.0.1`; v2: `MangaShift/tessera/apps/gallery` `bunx vite preview --port 4451 --host 127.0.0.1`.

## Status

- Checkbox, Radio, Switch: gotowe do oceny, NIE zatwierdzone przez właściciela (zatwierdzony jest tylko podstawowy Button).
- Testy: 845/845 jednostkowych; specyfikacje checkbox/radio/switch zielone w Chromium i WebKit; ostatnia pełna bramka 650/651 (jeden niestabilny `alert-dialog` WebKit) przed zmianą znaku Checkboxa i kropki Radia — pełnej bramki na obecnym kodzie nie puszczono.
- W toku (subagent Sonnet, 03.11 ok. 23:00): usunięcie pełnego układu dokumentu przy kliknięciu w silniku pigułki (148 ms przy CPU ×4, Switch i ToggleGroup) i rozciąganie kciuka Switcha na kompozytorze (dziś animacja `width`). Sprawdzić jego raport i diff.

## Następne kroki

1. Ocenić wynik optymalizacji (ślad przy CPU ×4, testy), potem pełna bramka `LAB_PORT=4377 bun run check` bez zmian kodu w trakcie.
2. Ocena właściciela trzech elementów na żywo.
3. Otwarte: ruch kropki Radia (referencje i kandydaci), Switch z etykietą obok, bramki silników (strażnik), cel graniczny z wzorców @disarto_max.
4. Commit tylko na słowo właściciela.
