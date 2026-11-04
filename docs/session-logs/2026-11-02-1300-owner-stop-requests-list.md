---
kind: session
status: blocked
created: 2026-11-02T13:00:00+01:00
subject: owner-stop-requests-list
---

# Punkt wznowienia: właściciel zatrzymał pracę — lista jego poleceń do wykonania po kolei

## Cel

Tessera v3 = UI z klocków gotowych z pudełka, telefon bez zacięć. Właściciel 02.11 ok. 13:00: „Nie wykonałeś ani jednego mojego polecenia poprawnie. Zatrzymujemy się, nic nie wykonujesz, spisujesz wszystkie rzeczy, które miały być zrobione, i lecimy po kolei, bo każda z tych rzeczy jest źle zrobiona.” Ten plik jest tą listą. Nowa sesja wykonuje pozycje **jedna po drugiej**, każdą pokazuje właścicielowi na żywo i czeka na „ok”, zanim ruszy następną.

## Jak pracować w nowej sesji (wymagania właściciela z tej sesji)

1. **Jedna rzecz naraz.** Bez równoległych wykonawców, bez paczek zmian. Po każdej pozycji: pokazać na żywo (`:4400`), czekać na „ok / nie ok”.
2. **Nie podejmować decyzji wyglądu ani odczucia za właściciela.** Gdy właściciel mówi „poczekaj”, nic nie wdrażać.
3. **Nie wymyślamy koła:** przy dylemacie najpierw research ze źródłami (jak robią to najlepsi), dopiero potem pomiar u nas.
4. **Wzorzec ZACHOWAŃ = desktop MangaShift (`MangaShift/packages/ui/src`) 1:1** oraz najlepsze praktyki (WAI-ARIA APG, Base UI, Radix). **v2 NIE jest wzorcem** (nigdy nie była skończona).
5. **Prowadzący sam sprawdza wynik w ruchu i na obrazie** (prawdziwe przejazdy kursora, przewijanie, klik), zanim pokaże — nie tylko zielone testy.
6. Mówić dokładnie, co zrobiono i co NIE, bez upiększania.

## Czytaj przy wznowieniu

1. `AGENTS.md` (REQUIRED): reguły repo, Pułapki.
2. Ten plik (REQUIRED): lista poleceń i ich stan.
3. `docs/decisions/e3-owner-review-2026-11-01.md` sekcja „Druga ocena” R1–R12 (REQUIRED): treść wcześniejszych poleceń.
4. `docs/decisions/e3-fix-a.md` (ON DEMAND): pomiary wciśnięcia (b/c/d), szew `joined`, R9.
5. `docs/decisions/e3-tooltip.md` (ON DEMAND): co zrobiono z tooltipami i dlaczego to nie spełnia polecenia.
6. Desktop MangaShift `packages/ui/src/hover/tooltip-store.ts`, `tooltip.tsx`, `lib/motion.ts` (REQUIRED dla pozycji 1–2): wzorzec grupowania tooltipów i wyjścia hover.
7. Research wciśnięcia (ON DEMAND): wynik subagenta w rozmowie — skrót w sekcji „Zweryfikowane fakty” niżej.
8. Audyt zachowań (ON DEMAND): skrypty `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\behavior-audit\` (scratchpad tymczasowy; znaleziska spisane niżej).

## Skille do wczytania

- `coding`, `review`: każda zmiana i jej odbiór.
- `research`: przed każdym dylematem (prior art ze źródłami).
- `save-session`, `load-session`.

## Stan repo / środowiska

- repo: `C:\Users\MattyMroz\Desktop\PROJECTS\tessera`, worktree `.worktrees/e2`, branch `feat/e2-foundation`, HEAD `0e05eba`, working tree czysty (poza tym plikiem), bez pushu.
- Worktree `.worktrees/e3-behavior` (`fix/e3-behavior` = `0e05eba`) i `.worktrees/e3-scale` (`fix/e3-tooltip` = `b781e48`, scalone): do usunięcia — NAJPIERW zdjąć junctiony z `node_modules` (Pułapki), potem `git worktree remove` bez `--force`.
- Ostatnia bramka (scalenie `0e05eba`): typecheck, lint, build, vitest 842/842, Playwright 581 passed / 16 skipped / 0 failed.
- Laboratorium właściciela: `http://localhost:4400` = kopia `apps/docs/out` w `scratchpad\live\out` + strona porównawcza `press-demo.html` (warianty wciśnięcia a–e); serwer `bun serve.ts 4400` w `scratchpad\live` (proces w tle tej sesji — po restarcie uruchomić ponownie). Serwer nie podaje plików prefetch Next (`__next.*.txt`, 404 w konsoli — nieszkodliwe).
- Pamięć sesji żyje w projekcie MangaShift; przed pierwszą sesją w folderze `tessera` przeprowadzka (pozycja 13).

## Lista poleceń właściciela — stan RZECZYWISTY

Kolejność = proponowana kolejność wykonania (najpierw to, co właściciel zgłosił ostatnio i najmocniej).

01. **Tooltipy grupowane w grupy — przerwa między przyciskami należy do grupy.** „Pomiędzy przyciskami tooltipowymi jest przerwa, w której hover nie działa; przy tej przerwie, jak tam jest myszka, hover znika. Tooltipy mają być grupowane w grupy.” **STAN: ŹLE.** Wdrożono tylko `closeDelay` 100 ms Base UI (`lib/tooltip-group.ts`, `components/tooltip/tooltip.tsx`) — kursor stojący w przerwie dłużej niż 100 ms nadal gasi tooltip. Wzorzec: desktop `hover/tooltip-store.ts` trzyma tooltip w całym obszarze grupy (przerwy też) bez limitu, zamyka po wyjściu z grupy. Wymaga elementu grupy (zmiana API `TooltipBar` / grupa przycisków) — właściciel tego chce. Warunek: kursor stojący w przerwie 2 s nie gasi tooltipa; wyjście z grupy gasi; sprawdzone prawdziwą myszą przez właściciela.
02. **Każdy hover ma mieć animację wyjścia.** „Każdy hover nadal nie ma wyjścia. Każdy hover ma mieć wyjście.” **STAN: ŹLE / NIEZROBIONE.** Wyjście (`fade`) ma tylko pigułka hover w ToggleGroup (`--ts-in-motion-hover-fade`). Przyciski (krok koloru `--_step`), wiersze menu, karta-link, triggery itd. znikają natychmiast. Wzorzec: desktop (`packages/ui/src/lib/motion.ts`, CSS hover komponentów). Warunek: każdy element podświetlany pod kursorem gaśnie płynnie po zejściu (czas jak desktop), wejście bez zmian; brak ruchu przy `motion: off` / reduced motion.
03. **Wciśnięcie przycisku: tekst i ikony skalują się z przyciskiem, płynnie, bez przeskoku.** „Dlaczego button nie skaluje się?” **STAN: NIEWDROŻONE — czeka na jedną literę od właściciela.** Dziś skaluje się tylko płytka `::before` (tekst stoi — właściciel to odrzucił). Właściciel wstrzymał decyzję („poczekaj, nie rób decyzji”), na stronie porównawczej powiedział, że **(c) wygląda ładnie**, (b) w normalnym tempie wygląda źle (mignięcie wygładzania). Warianty na `:4400/press-demo`: (a) płytka, (b) skala całości, (c) stała warstwa jak Adobe React Spectrum S2, (d) niewidoczna stała transformacja (krawędzie rozmyte — właściciel: „jakby brakowało piksela”), (e) jak Linear (`will-change` tylko w `:active`). Pomiary w `e3-fix-a.md`: (c) 74–115 warstw, przewijanie 3,5–4,5× droższe dla GPU, tekst w spoczynku szary; (b) skok ~1,1 px; (d) skok ~1 px + staje przy zajętym wątku. Triggery popupów, wiersze menu, opcje ToggleGroup i segmenty `joined`/`track` NIE skalują się (tylko kolor). Pierwsza czynność: zapytać właściciela o literę, wdrożyć dokładnie ją.
04. **Szew przycisku podzielonego (R9).** **STAN: CZEKA NA DECYZJĘ.** Szczelina w `joined` naprawiona (scalenie `0bc0631`, cień w kolorze podstawy, test). Wygląd szwu: plansze `scratchpad\fix-a\r1\r9-{a,b1,b2,c}-{light,dark}.png` — (a) separator 1 px, (b2) odstęp 2 px z zaokrągleniem, (c) sam kolor. Prowadzący rekomenduje (a); decyduje właściciel.
05. **Tooltip pojawia się za nisko i „dolatuje” po przewinięciu.** **STAN: wdrożone (`popup-flight.ts` `seenAt`), test zielony — DO POTWIERDZENIA przez właściciela na żywo.** Ograniczenie: przewinięcie kontenera (nie okna) w ciągu 400 ms po zamknięciu nadal daje stary start.
06. **Mruganie tooltipa po kliknięciu („znika i wraca”).** **STAN: nie odtworzono** (54 wyzwalacze, Chromium/WebKit, headless). Base UI ma `closeOnClick` jak Radix. Możliwe tylko przy prawdziwej myszy w WebView2 — zapytać właściciela o dokładne miejsce.
07. **Opóźnienie tooltipa 400 ms jak desktop.** **STAN: wdrożone** (`TOOLTIP_OPEN_DELAY`) — do potwierdzenia.
08. **Gaśnięcie pigułki hover przy wyborze opcji ToggleGroup.** „Hover pod klikniętą opcją ma mieć animację wyjścia.” **STAN: działa technicznie (300 ms), ale słabo widać** — zaznaczenie przykrywa po ~140 ms. Właściciel ocenia; ewentualna zmiana krzywej/opóźnienia to decyzja wyglądu. Łączy się z pozycją 2.
09. **Znaleziska audytu zachowań (wzorzec: desktop + APG/Base UI/Radix):** **NIEZROBIONE.**
    - Dialog modalny nie blokuje przewijania strony w Chromium/WebView2 — przyczyna: `container-type: inline-size` na `<body>` z przepisu `surface` wariant `page` (`recipes/surface.css:134`); Base UI `useScrollLock` (`@base-ui/utils/useScrollLock.js`) wybiera element do zablokowania przez `getViewportScroller`.
    - Menu: fokus klawiatury staje na wyłączonym wierszu, pigułka zostaje na poprzednim; desktop (Radix) pomija wyłączone; test `apps/docs/tests/menu.spec.ts:106` utrwala złe zachowanie.
    - Pigułka menu mruga (opacity 0,69–0,81) przy zejściu z wiersza z otwartym podmenu.
    - Podmenu znika, gdy kursor zjedzie w lewo poza menu (desktop: zostaje do wejścia w inny wiersz).
    - Karta-link bez reakcji na hover/wciśnięcie.
    - Menu bez pozycji radio (desktop używa: kierunek czytania).
    - Długie menu: po kółku pigułka na wierszu obok kursora.
    - Przytrzymany przycisk po zjechaniu kursorem nadal wygląda na wciśnięty (React Aria lepiej).
10. **Odstęp toru od pigułki rośnie z rozmiarem (`h/8`)** — zrobione (R10), właściciel zatwierdził „eighth”. Do potwierdzenia na żywo razem z resztą pakietu skali (tor, menu, tooltip, Kbd/Badge, „×”, nakładki bez obrysu, R11, R12).
11. **Przyciski jak v2: minimum 2,5 × wysokość, flaga `hug`, bok tekstu +1 px** (R5) — zrobione; do potwierdzenia na żywo.
12. **Refaktor jakości kodu całości** (właściciel: „musisz zrefaktorować to wszystko, żeby nie było głupich błędów”) — etap 1 zrobiony; etapy 2–6 `docs/plans/e3-code-quality.md` NIEZROBIONE; w tym: parser CSS strażnika `test/guards/css-layers.ts` → gotowy `lightningcss`/`postcss` („nie wymyślamy koła”).
13. **Przeprowadzka pamięci** przed pierwszą sesją w folderze `tessera` — NIEZROBIONE (plan w `docs/session-logs/2026-11-02-0300-e3-fix-packs-merged.md` pkt 5).
14. **Runda D (Checkbox, Switch, Slider)** — NIE ZACZYNAĆ przed pozycjami 1–9; fakty w `docs/research/e3-round-d-facts.md` (22 luki); Slider najpierw sprawdzić gotowy Base UI `Slider`.

## Zweryfikowane fakty

- Research wciśnięcia (źródła sprawdzone u źródła przez prowadzącego): Adobe React Spectrum S2 `pressScale.ts` — `will-change: transform` zawsze; Linear (`static.linear.app/.../DM5BVKTu.css`) — `will-change: transform` tylko w `:active`, `scale(.97)`; shadcn/Mantine/Radix Themes/Arc — przesunięcie 1 px zamiast skali; Material/Fluent/Apple/Ant/Chakra/Base UI — tekst się nie skaluje. Przeskok przy `scale` to zachowanie Chromium (crbug 1155029 naprawione tylko dla translacji).
- Tooltip: przyczyna mrugania w przerwie — `safePolygon` Base UI + `closeDelay` 0 (8–11 pustych klatek); obecne 100 ms to półśrodek.
- Kontrolki stoją na ułamkach pikseli (każda ma ułamkowe x); wyzerowanie w CSS dla wszystkich DPR niewykonalne.

## Ślepe uliczki (nie wracać bez nowego dowodu)

- Kompensacja ułamka piksela przy wciśnięciu (jedno przesunięcie przycisku) — ikony SVG dociągane osobno, skok 0,6–1,3 px.
- Wariant (d) niewidoczna transformacja — rozmyte krawędzie, animacja staje przy zajętym wątku.
- „Trzymanie tooltipa” przez sam `closeDelay` — nie spełnia polecenia (pozycja 1).

## Reguły i zakazy, które muszą przetrwać

- Commit na branchach na słowo właściciela („commit tak” 01.11); push tylko na osobne słowo; bramka przez `mm-validate` (Pułapki: `bun run --cwd apps/docs test:browser`, `prek run` przed walidacją).
- Zero komentarzy, zero legacy, edycja tylko Edit/Write (nie `sed -i`), subagenci bez git zapisu.
- NIGDY nie transformuj kotwicy popupu ani jej przodka.
- Nie zmieniaj zaakceptowanego wyglądu bez właściciela.

## Następny krok

1. [REKOMENDACJA] `load-session` z tego pliku; uruchomić serwer `:4400`; przeczytać desktop `hover/tooltip-store.ts` i zaplanować pozycję 1 (grupy tooltipów, przerwa należy do grupy) — pokazać właścicielowi plan w 3–5 zdaniach, po „ok” wdrożyć, sprawdzić samemu prawdziwym przejazdem kursora, pokazać na żywo.
2. Potem pozycja 2, 3 (zapytać o literę), 4 (zapytać), 9… — każda osobno, z „ok” właściciela.

## Decyzja użytkownika obowiązująca dalej

- Sesja zatrzymana przez właściciela 02.11 ok. 13:00; nowa sesja, jedna rzecz naraz.
