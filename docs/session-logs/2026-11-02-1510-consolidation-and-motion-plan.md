---
kind: session
status: ready-to-resume
created: 2026-11-02T15:10:00+01:00
subject: consolidation-and-motion-plan
---

# Punkt wznowienia: materiały zebrane w `tmp/`, plan dopracowania Buttona (wciśnięcie, hover, siatka pikseli) w toku

## Cel

Tessera: optymalna biblioteka dla każdego UI; każdy element doprecyzowany i zunifikowany. Strategia (plan poprzednika `docs/plans/e3-first-round.md`): podstawa E2 jest zrobiona, teraz dopracowanie element po elemencie, aż każdy będzie perfekcyjny; każda poprawka idzie do silnika albo przepisu i dziedziczą ją wszystkie elementy. Bieżący element: Button (faza 2 planu E3).

## Jak pracować (rozkazy właściciela z 02.11, obowiązują)

- Zwracaj się do właściciela „Generale”, odpowiadaj krótko jak żołnierz; na pytanie „tak czy nie” odpowiedz jednym słowem.
- NIE przytakuj. Gdy rozkaz przeczy planowi, spec albo wcześniejszemu rozkazowi, powiedz to wprost z dowodem i daj swoje stanowisko.
- Nie podejmuj decyzji na ślepo: przed decyzją przeczytaj źródło (plan, spec, decyzje). Nie decyduj za właściciela o wyglądzie i odczuciu.
- Zaplanuj → wykonaj → oceń. Kod piszą wykonawcy (subagenci), prowadzący pisze briefy, odbiera i sprawdza u źródła. Opus do zadań trudnych z bardzo konkretnym briefem; Sonnet do powtarzalnych. Co nie wymaga lokalnych plików ani sprzętu, idzie do chmury (kod w chmurze wymaga pushu = słowo właściciela).
- Każda zmiana globalna; research przed zmianą; nie powtarzaj researchu, który już jest (szukaj w `tmp/` wyszukiwarką).
- Worktree „z głową”: tylko dla osobnej pracy, po scaleniu usuwany (najpierw linki, potem `git worktree remove` dosłowną ścieżką, bez `--force`).
- „Nie da się” nie istnieje: wciśnięcie ma działać bez przeskoku, poza wątkiem głównym, w siatce pikseli przy każdym zoomie, DPR i na telefonie, bez stałego kosztu. Jeden element dziedziczący standard z błędem = cały standard zły.

## Czytaj przy wznowieniu

1. `AGENTS.md` (REQUIRED): reguły; na górze „Twardych reguł” 4 nowe zasady (niezacommitowane).
2. Ten plik (REQUIRED).
3. `docs/plans/e3-first-round.md` (REQUIRED, W CAŁOŚCI, w kawałkach po ~60 linii, bo linie są bardzo długie): plan poprzednika. W tej sesji przeczytano tylko linie 1–80, 192–264, 589–619. NIE przeczytano: „Decyzje planu” D48–D81 (81–123), Zakres, Impact scan, Target design, Docelowe drzewo, Publiczne kontrakty, Zmiany dokumentów, fazy 3–12, Rozstrzygnięcia (814–939). Bez tego nie decydować.
4. `docs/plans/e3-motion.md` (REQUIRED): szkic planu wciśnięcia i hover; ma zostać przepięty jako krok R2 fazy 2 planu E3 (patrz „Następny krok”).
5. `docs/reviews/e3-structure.md`, `e3-errors.md`, `e3-interaction-inventory.md` (REQUIRED): diagnoza dokumentów (14 sprzeczności, 10 decyzji), 41 błędów poprzedników, inwentarz 22 elementów interaktywnych.
6. `docs/decisions/e3-owner-review-2026-11-01.md` (R1–R12), `docs/decisions/e3-fix-a.md` (pomiary wciśnięcia 02.11), `tmp/v3/research-press-2026-11-02.md` (research wciśnięcia z 02.11 10:43, kod Chromium) (REQUIRED).
7. `docs/specification.md` (ON DEMAND; przeczytana w całości w tej sesji).
8. `tmp/index.md` (ON DEMAND): spis wszystkich materiałów; wyszukiwarka `python -I tmp/search.py "zapytanie" [--in mem|chat|ref/insp|v2/code|pad]`.
9. `docs/session-logs/2026-11-02-1300-owner-stop-requests-list.md` (REQUIRED): 14 poleceń właściciela i ich stan.

## Skille do wczytania

`load-session`, `workflow`, `planning`, `subagent`, `research`, `coding`, `review`.

## Stan repo

- Główny folder `tessera` na `feat/e2-foundation` `0e05eba`; jedyny worktree. Usunięte worktree `e2`, `e3-behavior`, `e3-scale` i scalone gałęzie `fix/e3-behavior`, `fix/e3-scale`, `fix/e3-tooltip` (commity zachowane w `feat/e2-foundation`; stan przed: `tmp/_logs/git-before.txt`).
- Niezacommitowane: `AGENTS.md` (4 reguły), `docs/plans/masterplan.md` („Aktualny etap” wskazuje `e3-motion.md`), nowe: `docs/plans/consolidation.md` (wykonany plan porządków; do usunięcia po commicie), `docs/plans/e3-motion.md`, trzy `docs/reviews/e3-*.md`, logi sesji 13:00 i ten. Bez commita i pushu (słowo właściciela).
- `bun install` i `bun run build` w głównym folderze: zielone 02.11.
- `tmp/` (19 GB, poza gitem): pamięć MangaShift (361), rozmowy (tekst w `chat/txt/`), inspiracje z Discorda (937 linków, X/YouTube/TikTok), Apple HIG, kod v2, wzorzec desktopu (`tmp/desk`), zrzuty rund, scratchpady, bundle 29 gałęzi Tessery z MangaShift; spisy `index.md` w każdym obszarze, indeks FTS5 `tmp/search.db`.
- Pamięć projektu tessera (`~/.claude/projects/...tessera/memory/`): pusta.

## W toku (żołnierz w tle tej sesji)

- Opus „pomiary etapu 0” pracuje w `scratchpad/motion/` (`C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-tessera\84377e75-e0af-4219-9928-beeb156ecd51\scratchpad\motion\`), serwer kopii na porcie 4410. Ma utworzyć `docs/decisions/e3-motion.md` i `motion-demo.html`. Zadanie po korektach właściciela: znaleźć sposób na wciśnięcie CAŁEGO przycisku bez przeskoku, ruch na kompozytorze, siatka pikseli przy zoomie 50–200 % i DPR 1–3 i na telefonie, zero stałych warstw; drugi przypadek tej samej reguły: lista rozwijana otwierana nad triggerem (Base UI `Select` `alignItemWithTrigger`) bez skoku tekstu. Główna hipoteza: wyrównanie elementu, etykiety i ikon do siatki pikseli urządzenia + warstwa tylko na czas ruchu. Plus hover z wyjściem (3 techniki, T2) i mechanizm wciśnięcia (Space, Enter, zjazd). Jeśli sesja się skończy przed jego wynikiem: sprawdź, czy `docs/decisions/e3-motion.md` i `scratchpad/motion/` istnieją; jeśli nie, zleć pomiar od nowa według `e3-motion.md` faza 0 i rozkazu „siatka pikseli” wyżej.

## Decyzje i fakty z tej sesji

- Wciśnięcie samą płytką `::before` = błąd (właściciel: „cały baton ma się skalować”, „płytka nie jest decyzją”). Wariant (c) stała warstwa = odrzucony przez właściciela (koszt zasobów).
- Wartości do decyzji właściciela (sprzeczne źródła): notatka 11.10 (0,97, 50/224 ms, hover 100/150, `will-change` stale) vs desktop `tmp/desk/styles/ui.css` (0,92 + `opacity` 0,82, 100/100 ms, hover 100/100, trigger stoi a skaluje się jego treść i płytka).
- Research wciśnięcia 02.11: żadna znana biblioteka nie skaluje tekstu bez przeskoku bez stałej warstwy; przyczyna w Chromium: przełączenie rysowania bez warstwy (osobne przyciąganie tekstu i ikon do piksela, LCD) ↔ w warstwie. Właściciel: „ma się dać i koniec”.
- Fakty z kodu: hover w `control` bez przejścia (N8); wyjście hover ma tylko pigułka (300 ms); `lib/press.ts` bez Space, Enter, zjazdu; `pressable` podpięte tylko w `button.tsx`, `toggle-group.tsx`; reguła płytki w 22 miejscach; T2 hover 12,4 ms przy celu 4 ms.
- Spór do zgłoszenia właścicielowi (nie przytakiwać): standard budujemy na Buttonie, ale odbieramy na każdym istniejącym elemencie, który go dziedziczy (trigger, menu, lista rozwijana), bo spec U23 i masterplan 02.11 („nie da się bez większej ilości elementów”).

## Ślepe uliczki

- Powtarzanie researchu wciśnięcia (już jest: `tmp/v3/research-press-2026-11-02.md`).
- Nowe plany i audyty „wszystkiego naraz” zamiast wykonywania planu poprzednika.
- Plan `e3-motion.md` O4 (zmiana czasu gaśnięcia pigułki) = zmiana zaakceptowanego R4; usunąć.

## Następny krok

1. [REKOMENDACJA] `load-session` z tego pliku; przeczytać w całości `docs/plans/e3-first-round.md`; odebrać wynik pomiaru (`docs/decisions/e3-motion.md`).
2. Przepiąć `docs/plans/e3-motion.md` jako krok R2 fazy 2 planu E3 (uwagi R1, R4, R8, R9 drugiej oceny + polecenia 2–3 z 13:00), bez O4 i bez zmian w zaakceptowanych R4, R5, R10, R11, R12 i decyzjach skali; dopisać regułę siatki pikseli (Button i lista rozwijana).
3. Zgłosić właścicielowi spór „odbiór na wszystkich dziedziczących elementach” i decyzję o wartościach (11.10 vs desktop); dopiero po jego słowie zlecić wykonawcy wdrożenie.
