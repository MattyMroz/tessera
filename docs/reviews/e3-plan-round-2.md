---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, docs/plans/e3-first-round.md (runda 2, niezacommitowany, 783 linie, 85 147 B) + docs/plans/masterplan.md (wiersz E3, „Wejście planu E3”, historia 2026-11-01); stan 2026-11-01
date: 2026-11-01
---

# Review: plan E3 „runda wszerz”, runda 2 (kontrolna)

## Zakres

- **Przedmiot:** przepisany plan E3 i zmiany masterplanu po rundzie 1.
- **Wejście:** `reviews/e3-plan-scope.md` (P1–P5, m1–m9, S1–S3), `reviews/e3-plan-tech.md` (P1–P7, M1–M8, S1–S3), tabela „Rozstrzygnięcia recenzji rundy 1” w planie.
- **Authority:** `docs/specification.md`, `AGENTS.md`, `docs/structure.md`.
- **Ryzyka:** uwaga rundy 1 zamknięta tylko w tabeli rozstrzygnięć, nowa sprzeczność wprowadzona poprawką, drzewo katalogów niezgodne z konwencją, wykonawca zgaduje, streszczenie rozjechane z planem.
- **Poza review:** wygląd, techniczna wykonalność mechanizmów poza miejscami zmienionymi w rundzie 2, buildy i testy (brief).

## Werdykt

**Status:** FAIL, ocena **8/10**. Poprawki są punktowe (dwa zdania w decyzjach i kilka wierszy), bez przeplanowania; trzecia runda może sprawdzić tylko zmienione miejsca.

**Najważniejszy powód:** wszystkie 12 uwag poważnych rundy 1 jest zamkniętych w treści planu, ale poprawki wprowadziły dwie nowe luki poważne: D52 każe przewijać `ButtonGroup` w `ScrollArea`, który powstaje cztery rundy później, i nie mówi, czy przewijanie siedzi w komponencie, czy w kompozycji; D70 dodaje drugi mechanizm rozwiązywania `mode: 'system'` i `color-scheme` obok istniejącego JS na korzeniu, wbrew zasadzie „jedno źródło, zero podwójnych ścieżek”.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. D52: przepełnienie `ButtonGroup` i `ToggleGroup` bez fazy, bez właściciela i przed `ScrollArea`

- **Miejsce:** D52 (l. 81), D73 (l. 102), faza 2 (l. 557–562), faza 6 (l. 601–604), macierz F19 (l. 205: „rzędy poziome przewijają się (D52)”), drzewo (`docs/toggle-group.md` MODIFY „przepełnienie”, brak `components/sections/toggle-group.tsx` MODIFY).
- **Dowód:** D52 wymienia `ButtonGroup` i „ToggleGroup w pasku” jako rzędy przewijane w `ScrollArea`. `ButtonGroup` powstaje w rundzie A (faza 2), `ScrollArea` w rundzie E (faza 6). Testy fazy 2 nie mają przypadku przepełnienia, fazy 6 też nie (tylko „lane”, Item, Select). Jedyny jawny test przewijania rzędu to Tabs w fazie 8 i pasek narzędzi na ekranie w fazie 10. D52 nie mówi, czy `ScrollArea` siedzi wewnątrz komponentu (jak w Tabs: „wybrana pozycja wjeżdża w widok”), czy składa go konsument (pasek narzędzi, nawigacja strony). Od tego zależą B5 i B6 `ButtonGroup` i `ToggleGroup` (dodatkowe węzły przewijacza, toru i kciuka) i publiczne API.
- **Wpływ:** wykonawca U-GROUP nie ruszy bez zgadywania; macierz F19 przy 320 px dla grupy nie ma w rundzie A mechanizmu, który D52 nakazuje; `toggle-group.tsx` dostaje zmianę, której nie ma żadna jednostka ani R2.
- **Minimalna reakcja:** jedno zdanie w D52: które rzędy mają `ScrollArea` wewnątrz (proponuję: tylko Tabs, bo przewija wybraną pozycję w widok), a które składa konsument (`ButtonGroup`, `ToggleGroup`, pasek narzędzi, nawigacja); przy kompozycji test przewijania grupy w rundzie E (sekcja `scroll-area` na `/screens/edges` z grupą w środku), a w rundzie A macierz sprawdza tylko „bez łamania do drugiej linii”.

#### P2. D70: drugi mechanizm `mode: 'system'` i `color-scheme` obok JS na korzeniu

- **Miejsce:** D70 (l. 99), faza 11 R2 (l. 651), drzewo (`lib/theme.ts` MODIFY „osie poddrzewa, typeset”).
- **Dowód (REPORTED, `e3-plan-tech.md` P7, odczyt kodu):** dziś `system` rozwiązuje `bootTheme` przez `matchMedia` (`lib/theme.ts:108-114`), a `color-scheme` ustawia JS na korzeniu (`lib/theme.ts:94-96`). D70 dodaje dla poddrzewa rozwiązanie w CSS (`@media (prefers-color-scheme: dark)` dla `[data-mode='system']` z generatora) i `--ts-color-scheme` czytane przez `surface`. Generator emituje „jedną formę selektora dla korzenia i poddrzewa”, więc reguła `[data-mode='system']` zadziała też na `<html>`; plan nie mówi, czy ścieżka JS na korzeniu znika, czy zostaje i dlaczego.
- **Wpływ:** dwa źródła tej samej reguły (I2), rozjazd przy zmianie motywu w trakcie sesji, ryzyko anty-FOUC i B4; łamie twardą regułę właściciela „zero podwójnych ścieżek” (diff z taką parą recenzja kodu musi odrzucić w R7).
- **Minimalna reakcja:** w D70 jedno zdanie: korzeń przechodzi na ten sam mechanizm CSS (rozwiązywanie `system` w `theme.ts` znika w tym samym diffie) albo nazwany powód, dla którego korzeń zostaje przy JS (np. `color-scheme` widoku, którego przepis `surface` na `<body>` nie obejmuje), z testem, że obie drogi dają ten sam tryb.

### Mniejsze

#### m1. „Części w wierszu” w `row` kontra jedno źródło części w `control` (D50)

- **Miejsce:** D50 („Reguły części mają jedno źródło w `control`… wyjątek `CHOICE_PARTS`”), „Odpowiedzialności” (l. 247: „części w wierszu (`row`)”), drzewo (`row.css` MODIFY „części w wierszu”), faza 8 R2.
- **Reakcja:** dopisać, że `row.css` tylko rozmieszcza slot `box` w wierszu (układ), a wygląd i stany części zostają w `control`; inaczej wykonawca zrobi dwa źródła (I2).

#### m2. Wyjątek dostawcy od „rozmiar w jednej klatce” bez miejsca w dokumentach

- **Miejsce:** D63; `AGENTS.md:46` („Zmiana rozmiaru dzieje się w jednej klatce, nigdy w ruchu”), Q2 („nazwany wyjątek z powodem w jednym pliku”); tabela „Zmiany dokumentów” nie ma wiersza.
- **Reakcja:** wiersz „`AGENTS.md` model warstw / spec Q2: Base UI `Select` na triggerze rośnie przy przewijaniu, wyjątek dostawcy” w fazie 6, z plikiem wyjątku (np. `docs/select.md`).

#### m3. Zamknięcie N5 (ptaszek) „po nagraniach rundy D”, a runda D nie ma nagrania

- **Miejsce:** streszczenie pkt 10, wiersz „spec N5” (faza 5), R4 fazy 5 (l. 584: tylko tint/atrament i rozmiar ptaszka).
- **Dowód:** N5 jest decyzją właściciela z opcją „nazwany wyjątek rysowania czy `scale` + `opacity`” (`specification.md:315`); D50 zamyka ją z góry na `scale` + `opacity`.
- **Reakcja:** w R4 fazy 5 pytanie z MP4 pojawienia ptaszka (`scale` + `opacity`), żeby właściciel faktycznie zamknął N5 w R5 rundy D.

#### m4. Nagrania W16 w rundzie F nie mają gdzie powstać

- **Miejsce:** D69, faza 8 (l. 633), faza 9 R1.
- **Dowód:** toast powstaje w rundzie G, a próba N7 (sklep, region, atrybuty przejścia Base UI) jest w R1 rundy G; wariant „`translate` od krawędzi + `opacity`” może wymagać `@starting-style`, który strażnik odrzuca w przepisach, także pod `[data-proposal]`.
- **Reakcja:** zdanie, gdzie powstaje prototyp nagrań (scratch poza repo albo `/proposals` bez `@starting-style`, na atrybutach przejścia Base UI) i że nagranie „desktop” pochodzi z aplikacji desktopu.

#### m5. Write scope jednostki a kontrakty i importy

- **Miejsce:** „Write scope jednostki” (l. 240), „Kontrole” (l. 685–690).
- **Dowód:** importy sekcji w `components/page.tsx` i `screens/edges/page.tsx` oraz import CSS komponentu w `tessera.css` robi prowadzący; `contracts.test.ts` wymaga `docs/<nazwa>.md`, sekcji `data-edge-component` i ≥ 2 stron (F12, F19), więc `bunx vitest run` jednostki jest czerwony do integracji, a jej spec Playwright nie widzi CSS układu części.
- **Reakcja:** jednostka dopisuje linie importu w trzech plikach integracji (w write scope) albo brief nazywa oczekiwane czerwone kontrakty do integracji; do rozstrzygnięcia w pilocie U-GROUP.

#### m6. „Docelowe drzewo po E3” niepełne w kilku miejscach

- `src/eslint/layout.ts` bez MODIFY, choć „Dozwolone decyzje lokalne” i R4 fazy 4 dodają próg `CONTAINER_WIDTHS` (a nowy CSS komponentu może potrzebować `COMPONENT_LAYOUT`); dopisek „bez zmian reguł” zostaje, plik danych zmienia się.
- Pliki `<nazwa>.css` spoza listy (np. `slider`, `checkbox`, `switch`, `select`, `tree`, `scroll-area`): write scope ich pozwala, a reguła briefu „ścieżki tylko z Docelowego drzewa” i warunek stopu „plik nie mieści się w drzewie” je zabraniają. Jedno zdanie: CSS układu części w folderze rodziny jest objęty drzewem.
- `apps/docs/app/components/sections/toggle-group.tsx` bez MODIFY (D52, D64).
- Sekcja mówi o pełnym drzewie, a pomija istniejące pliki bez zmian: `tests/tooltip.spec.ts`, `tests/text.spec.ts`, `tests/serve.ts`, `foundation/live-values.tsx`, `foundation/motion-sample.tsx` (sonda: `ls`).
- B4 na `/stress` jest jednocześnie w `budgets.spec.ts` (D71) i w `lab.spec.ts` MODIFY (drzewo); wskazać jeden plik.

Reszta drzewa zgodna z kodem i `structure.md`: 9 istniejących `docs/*.md`, wszystkie pliki `lib/` (z `compose-refs.ts`) i `components/text/text.test.ts` są na swoich miejscach; folder rodziny, `lib/` płasko z testem obok czystych funkcji, silniki i przepisy płasko, brak `utils`/`helpers`/`common` w nowych ścieżkach, nazwy plików komponentów unikalne.

#### m7. `package.json`: fonty jako `peerDependencies` i ikony bez `devDependencies`

- **Dowód (sonda):** dziś fonty są w `dependencies` (`@fontsource-variable/inter`, `cascadia-code`), Base UI też; `react` ma zakres w `peerDependencies` i `catalog:` w `devDependencies`. Drzewo (l. 260) wpisuje „fonty strony” do `peerDependencies`, a faza 11 mówi „`bun add` w paczce”. D76 mówi „`peerDependencies` z wersją w `catalog:`”, bez kopii w `devDependencies` potrzebnej do builda i typecheck.
- **Reakcja:** fonty strony w `dependencies` jak Inter; ikony: zakres w `peerDependencies` + `catalog:` w `devDependencies` (wzór `react`).

#### m8. B6: brak narzędzia minifikacji w teście

- **Dowód (sonda):** `test/package/budget.test.ts` nie ma dziś ani minify, ani gzip (tylko B8); w korzeniu `node_modules` nie ma `esbuild`, `oxc`, `terser`; vitest biegnie w node, więc `Bun.build` nie zadziała w procesie testu. Recenzja techniczna mierzyła `bun build --minify` z wiersza poleceń.
- **Reakcja:** w D71 albo fazie 1 nazwać narzędzie (np. podproces `bun build --minify -e …` albo `rolldown` z tsdown jako jawna `devDependency` po klasyfikacji); bez tego wykonawca sam dodaje zależność.

#### m9. Drobne niespójności sformułowań

- F20 (wiersz „spec nowe F20”, D52) mówi „bez menu »więcej«”, a „Odłożone” odkłada to menu do E4: zapisać jako „w E3 bez menu »więcej«, decyzja w E4”.
- Literał `100cqb` w liczbach przepisu (D53, wiersz `AGENTS.md` w fazie 5): klatki z `100cqb` leżą w silniku `motion`, a kontener jazdy ma długość z `100%` minus kciuk; jeśli żaden przepis go nie użyje, wpis nie ma konsumenta. Potwierdzić albo usunąć.
- D61 nie mówi, kto aktualizuje `aria-valuenow` przy przeciąganiu bez re-renderu Slidera (recenzja techniczna P6 proponowała `lib/slider.ts`).
- D66 zmienia F18 (osie także z samego obszaru, nie tylko z przodków), a jedyny wiersz F18 w „Zmianach dokumentów” jest w fazie 11 i dotyczy `platform` i osi koloru; dodać wiersz w fazie 9.
- R1 każdej rundy zaczyna od wniosków z poprzedniego checkpointu, a ryzyko „checkpoint czeka” pozwala następnej rundzie zrobić R1–R3 przed nim; dopisać, że R1 wtedy pomija wnioski i wraca do nich w R8.

#### m10. Długość (m1 rundy 1) zamknięta częściowo

- 85 147 B kontra ok. 87 kB w rundzie 1: usunięte sekcje zwolniły miejsce, które zajęło drzewo zamówione przez właściciela. Nie blokuje; „Decyzje planu” dalej trzymają szczegóły wykonania (formuły D53, D54, lista testów D71).

### Sugestie

- **S1.** Konwencja drzewa: dopisać, że `lib/` przyjmuje tylko `.ts` (wpis `./lib/*` w `exports` ma `source: ./src/lib/*.ts`; `.tsx` wymagałby nowego wpisu jak `theme-script`).
- **S2.** `confirm()` (D67) potrzebuje zamontowanego hosta; nazwać go w publicznym kontrakcie (np. `ConfirmHost` w `dialog/alert-dialog.tsx`, wzór v2 `confirm-dialog.tsx`).
- **S3.** P-LANE: zapisać też wywołania `ResizeObserver` z `lib/lane.ts` w czasie, gdy lista Selecta rośnie przy przewijaniu (to zadania kodu Tessery wywołane przewijaniem, choć nie na zdarzeniu `scroll`).

## Zgodność z kontraktem

### Uwagi rundy 1

| Uwaga                            | Stan                            | Dowód w planie                                                                                                                                            |
| -------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zakres P1 „lane”                 | zamknięta                       | D54 (stany `hidden`/`hover`/`touch`, bez `LANE_IDLE`, rynny symetryczne, wcięcie z `shape`), impact scan l. 162, wiersz F16                               |
| zakres P2 pigułka `active`       | zamknięta                       | D63, D64, R4 faz 6 i 8, Forbidden l. 121                                                                                                                  |
| zakres P3 ekrany a kolejność     | zamknięta                       | D73 (Alert w B), D52 (pasek narzędzi, nawigacja), faza 7 według desktopu, R4 fazy 5 w kompozycji z `Field`                                                |
| zakres P4 spec i `AGENTS.md`     | zamknięta                       | „Zmiany dokumentów”: F20, F17, Q2 i F6 osobno, B5 dwa wiersze, B6, F18, cztery wiersze `AGENTS.md`, „Odłożone”; masterplan l. 85 M-08 bez „(E4)” (odczyt) |
| zakres P5 streszczenie           | zamknięta                       | pkt 1, 7–12                                                                                                                                               |
| zakres m1 długość                | częściowo                       | m10                                                                                                                                                       |
| zakres m2 izolacja               | zamknięta                       | D49                                                                                                                                                       |
| zakres m3 F12                    | zamknięta                       | D71, faza 1 krok 2, wiersze spec F12 i `structure.md`                                                                                                     |
| zakres m4 YAGNI                  | zamknięta                       | D53, D55 a, D70; `100cqb` do potwierdzenia (m9)                                                                                                           |
| zakres m5 Tree i Context         | zamknięta                       | D65, U-CONTEXT zależy od Menu E2                                                                                                                          |
| zakres m6 pierścień karty        | zamknięta                       | R4 fazy 3 bez pytania                                                                                                                                     |
| zakres m7 gate MangaShift        | zamknięta                       | D72, faza kopii usunięta                                                                                                                                  |
| zakres m8 nakładanie rund        | zamknięta                       | D49 (R6 rundy N przed R2 rundy N+1 w tym samym pliku), ryzyko „checkpoint czeka” (z uwagą m9)                                                             |
| zakres m9 paczka                 | zamknięta                       | „Paczka checkpointu rundy”                                                                                                                                |
| zakres S1–S3                     | zamknięte                       | D70, D72, „Odłożone”                                                                                                                                      |
| tech P1 B6                       | zamknięta (narzędzie: m8)       | D71, wiersz spec B6, R1 fazy 8                                                                                                                            |
| tech P2 Select                   | zamknięta (dokument: m2)        | D63, P-LANE, testy fazy 6, streszczenie pkt 7                                                                                                             |
| tech P3 klatki a graf            | zamknięta                       | D54 (kontener jazdy, klatki bez zmiennych), impact scan l. 163                                                                                            |
| tech P4 warstwa kciuka           | zamknięta                       | D54, impact scan l. 162, macierz „ruch `off`”, P-LANE (pomiar bazowy)                                                                                     |
| tech P5 N7 po regułach           | zamknięta                       | R1 (l. 173), R1 faz 4, 5, 9; D71 B5 z węzłami dostawcy                                                                                                    |
| tech P6 Slider                   | zamknięta (`aria-valuenow`: m9) | D53, D61, testy fazy 5                                                                                                                                    |
| tech P7 `ThemeScope`             | częściowo                       | D70 rozwiązuje poddrzewo, ale tworzy drugą ścieżkę (P2)                                                                                                   |
| tech M1–M8                       | zamknięte                       | D55 a, D65, D63, R2 fazy 2, D72, warunki końcowe, D66 i testy fazy 9, „Ograniczenia dowodu”                                                               |
| tech S1–S3                       | zamknięte                       | D69, U-TREE-A/B, faza 1 krok 2                                                                                                                            |
| właściciel: ikony, kroje, drzewo | zamknięte                       | D76 i faza 0, D70 i faza 11, „Docelowe drzewo po E3” (uwagi m6, m7)                                                                                       |

### Spójność

- D48–D76: komplet, bez luk w numeracji; kolumna „Wejście” pokrywa każdą pozycję „Wejścia planu E3” i każdy wiersz „Odłożone” z terminem E3.
- Kolejność faz, D73, tabela jednostek i streszczenie pkt 1, 5, 6 zgodne: 8 rund (A–H) + 3 ekrany + ikony + budżety = 13 checkpointów.
- Zasada „R6 rundy N przed R2 rundy N+1”: zapisana w D49 i zgodna z ryzykiem „checkpoint czeka”; drobna niespójność z R1 (m9).
- Masterplan: wiersz E3 („v2 tylko jako próg CSS w B6”, „pozostałe 13 komponentów”), historia D72 i M-08 zgodne z planem.
- Eksporty: wpisy z gwiazdką `./components/*` (`.tsx`), `./lib/*` (`.ts`), `./themes/*` (`.ts`) obejmują każdy nowy plik z drzewa (sonda `package.json`); twierdzenie planu „exports bez zmian” prawdziwe.

### Streszczenie dla właściciela

Zgodne z planem w każdym punkcie, z dwoma zastrzeżeniami: pkt 10 obiecuje nagrania ptaszka, których runda D nie ma (m3); pkt 8 i 12 nie mówią, gdzie przewijają się grupy przycisków (P1).

## Wykonane kontrole

```text
Odczyt w całości: e3-first-round.md (783 l.), masterplan.md, structure.md, e3-plan-scope.md, e3-plan-tech.md.
specification.md: B5–B7, U7, U10, U18, U20, U22, U23, U33, W8, W9, W14–W16, W21, F1, F6, F10–F12, F15–F19,
  Q2, Q7, Q11, Q12, Q17, I1, I2, O1, Z7, Z8, Z10, N5, N7, N8, „Odłożone”.
AGENTS.md: linie modelu warstw (liczby przepisu, lista Q7, @keyframes, „rozmiar w jednej klatce”).
git status, git diff --stat masterplan.md; wc -c planu (85 147 B); ls docs/research, docs/decisions.
Sonda (jedna): packages/tessera/package.json (exports, dependencies, peerDependencies), lista plików
  src/, docs/, test/package/, apps/docs/app/{components,foundation,screens}, apps/docs/tests,
  eksporty tests/helpers.ts (installCommitProbe istnieje), budget.test.ts bez minify/gzip,
  brak esbuild/oxc/terser/rolldown w korzeniu node_modules.
```

## Niewykonane lub nierozstrzygające kontrole

- Bez buildów i testów (brief); stan bramek E2 REPORTED przez plan.
- `lib/theme.ts:94-114` (podstawa P2) nie czytany ponownie; dowód z recenzji technicznej rundy 1.
- Nie sprawdzałem, czy wyjścia `--ts-size-box`, `--ts-size-track-*`, `--ts-size-thumb`, `--ts-size-rail` i `--ts-shape-box/track/thumb` istnieją w silnikach (plan zakłada, że tak).
- Wynik checkpointu 3 E2 nieznany; plan sam uzależnia od niego D57, D62, D64.

## Zalecany następny krok

1. Poprawić P1 (zdanie w D52 + test w rundzie E) i P2 (zdanie w D70).
2. Przy tej samej edycji m1–m9 jako pojedyncze zdania lub wiersze.
3. Runda 3 tylko dla D52, D70 i dopisanych wierszy; przy braku nowych poważnych plan idzie do właściciela.
