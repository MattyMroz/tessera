---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, niezacommitowane docs/plans/e2-foundation.md (część 2, linie 646–1267) i docs/plans/masterplan.md, stan 2026-10-31
date: 2026-10-31
---

# Review: plan E2, część 2, runda kontrolna 2

## Zakres

- **Przedmiot:** „Część 2: fundament pod rodziny” (D29–D47, fazy 9–16 z 14a/14b, tabela zmian spec, streszczenie, tabela „Rozstrzygnięcia recenzji rundy 2”) i `docs/plans/masterplan.md`.
- **Wejście:** `reviews/e2-plan-part2-scope.md` (6/10, fail) i `reviews/e2-plan-part2-tech.md` (7/10, fail).
- **Authority:** `docs/specification.md`, `AGENTS.md`, `reviews/e2-foundation-gaps.md`, `research/e2-foundation-2026.md`.
- **Pytania:** (1) zamknięcie uwag rundy 1; (2) nowe sprzeczności po poprawkach; (3) czy świeży wykonawca ruszy z każdą fazą bez zgadywania; (4) streszczenie dla właściciela.
- **Poza review:** trafność liczb wyglądu (D38, D33, D42), wsparcie przeglądarek (rozstrzygnięte sondami rundy 1).
- **Dowód:** odczyt planu, raportów, masterplanu i spec (DIRECT); jedna sonda kodu: `recipes/control.css`, `recipes/surface.css`, `components/{dialog,popover}.tsx`, `test/guards/css-layers.ts`, `lib/theme.ts`, grep `profile` (DIRECT). Bez buildów i testów.

## Werdykt

**Status:** `fail`. **Ocena: 8/10.**

**Najważniejszy powód:** wszystkie uwagi poważne rundy 1 są zamknięte, a mniejsze prawie wszystkie. Poprawki wprowadziły jednak dwie nowe uwagi poważne. Faza 10 włącza strażników, którzy na obecnym kodzie oblewają, więc jej gate „obecny kod przechodzi” jest niewykonalny. Wyśrodkowany obszar trafienia D38 przy dotyku pozwala sąsiadowi „ukraść” stuknięcie w prawą część kontrolki w gęstym pasku, a test tego nie wykryje. Obie poprawki to po 1–3 zdania w planie. Po nich wystarczy celowane sprawdzenie tych dwóch miejsc, bez pełnej rundy.

## Findings

### Krytyczne

Brak.

### Poważne

#### R2-P1. Faza 10 włącza strażników, którzy oblewają obecny kod; gate fazy jest niewykonalny

- **Miejsce:** faza 10 (`:986-994`): „Wymagania „> 0” (tony, rejestr, progi) włączane w fazie, w której powstaje pierwszy konsument”; gate: „obecny kod przechodzi”; D47 i nagłówek planu wykonania (`:973`): bramki zielone po każdej fazie.
- **Dowód:**
  - ESLint D43 w fazie 10 zakazuje `strokeWidth` i liczb w wartościach atrybutów JSX. `menu.tsx:46` ma `strokeWidth={1.5}` (baseline planu `:695`), a ikony bez `strokeWidth` wchodzą dopiero w fazie 13 (krok 6). `bun run lint` oblewa w fazach 10–12.
  - Strażnik warstw oblewa nieużyty wyjątek: `css-layers.ts:121, 310-311, 510` (`unused selector exception`, DIRECT). `ARIA_LEVEL_INDENT` i nowy tekst `KEYBOARD_FOCUS` (D32) mają konsumenta dopiero w fazie 13. Lista `VENDOR_VARIABLES` ma regułę „nieużyta oblewa” (`:851`), a jej konsumenci (D35) też wchodzą w fazie 13.
  - Kontrakt „każda oś z `subtreeAxes` ma regułę silnika poza `:root`” dotyczy pola, którego jeszcze nie ma. `lib/theme.ts` eksportuje tylko `AXES` (DIRECT), a `subtreeAxes` powstaje w fazie 12 (`:1017`). Test fazy 10 się nie skompiluje albo zostanie pusty.
  - Wyjątek „> 0” nazywa tylko tony, rejestr i progi; żadnej z powyższych pozycji nie obejmuje.
- **Wpływ:** subagent D (faza 10) dostaje sprzeczny kontrakt. Albo osłabi regułę, żeby gate był zielony, albo zostawi czerwone bramki, albo sam zmieni przypisanie pracy do faz. To ta sama klasa błędu co P2 rundy 1 (bramki po każdej fazie).
- **Minimalna poprawka:** jedna reguła w fazie 10: „Faza 10 dodaje reguły i ich fixture `good/`/`bad/`. Wpis na liście wyjątków lub dostawcy, kontrakt na pole, które jeszcze nie istnieje, i reguła, której obecny kod nie spełnia, wchodzą w fazie pierwszego konsumenta lub w fazie, która usuwa naruszenie”. Do tego lista z fazą przy każdej pozycji: `ARIA_LEVEL_INDENT`, `KEYBOARD_FOCUS` i `VENDOR_VARIABLES` w fazie 13, `subtreeAxes` w fazie 12, literały i `strokeWidth` w fazie 13. Prostsza droga dla `strokeWidth`: usunąć `strokeWidth={1.5}` z `menu.tsx` już w fazie 10.

#### R2-P2. D38 przy dotyku: sąsiad przejmuje stuknięcie w prawą część kontrolki; test tego nie wykrywa

- **Miejsce:** D38 (`:723`): `::before` z `inset: calc(var(--ts-size-hit-inset) * -1)`, cel 44 px przy `pointer: coarse`, kontrolka z `isolation: isolate`; test obszaru trafienia w fazie 13 (`:1048`); strategia D38 (`:1167`).
- **Dowód:**
  - `control.css:8` ma `isolation: isolate`, a `::before` ma `z-index: -1` (DIRECT). Każda kontrolka jest więc osobnym kontekstem warstwowym, malowanym w kolejności drzewa, a kontekst maluje się w całości. `::before` kontrolki B (późniejszej w DOM) leży nad całym pudełkiem kontrolki A.
  - Przy xs: wysokość 16 px, `hit-inset` = (44 − 16) / 2 = 14 px, odstęp 3 px. `::before` B wchodzi o ok. 11 px w pudełko A.
  - Hit-testing idzie odwrotnie do malowania, więc stuknięcie w prawe ok. 11 px przycisku A zwraca B. To samo dzieje się przy każdym rozmiarze, w którym `hit-inset` > odstęp.
  - Dziś `::before` ma tylko `min-width`/`min-height` (`control.css:34-40`, DIRECT): rośnie od pozycji statycznej w prawo i w dół, więc sąsiad nie wchodzi w pudełko poprzednika. Wyśrodkowanie z D38 wprowadza ten błąd nowo.
  - Wniosek z kolejności malowania CSS (CSS 2 Appendix E), ASSUMED bez sondy w przeglądarce.
  - Test fazy 13 przy `hasTouch` sprawdza punkt 2 px poza krawędzią i punkt w odstępie, a punkt wewnątrz kontrolki sprawdza tylko przy myszy. Przy dotyku przejdzie więc mimo błędu.
  - Sam test „2 px poza krawędzią zwraca tę kontrolkę” jest dla krawędzi między sąsiadami sprzeczny z „punkt w odstępie zwraca jednego z dwóch”: przy odstępie 3 px punkt 2 px za prawą krawędzią A leży w odstępie i wygrywa B.
- **Wpływ:** regresja stuknięć w gęstych paskach i ToggleGroup na dotyku, czyli w przypadku, który D38 miał poprawić. Test daje fałszywy PASS.
- **Minimalna poprawka:**
  - Projekt: `hit-inset` w kontrolce mającej sąsiada ograniczyć do połowy odstępu, czyli `min((cel − wysokość) / 2, odstęp / 2)`, zgodnie ze wzorem odstępu WCAG. Pełne 44 px zostaje dla kontrolki bez sąsiada. Albo zapisać wprost, że gęsty pasek na dotyku dostaje rozmiar ≥ 44 px przez oś `size`, nie przez obszar trafienia.
  - Test: przy `hasTouch` punkt 1 px wewnątrz kontrolki, przy krawędzi od strony sąsiada, zwraca tę kontrolkę, w pasku xs i w ToggleGroup xs. „2 px poza krawędzią” ograniczyć do krawędzi zewnętrznych grupy.

### Mniejsze

#### R2-M1. Grep starych nazw (D47) ma złe wzorce i brak zakresu

- **Dowód (DIRECT):**
  - Gate fazy 13 (`:1052`) szuka `data-slot="header"`, a CSS ma `[data-slot='header']` (`surface.css:148, 155`). Gate złapie zostawiony TSX, ale nie zostawiony CSS.
  - `--ts-size-hit:` łapie tylko deklarację, nie odczyt `var(--ts-size-hit)`.
  - Sam `profile` (gate fazy 12) trafia w `apps/docs/out/**` i `packages/tessera/dist/**` oraz w ten plan, recenzje i research. Bez zakresu gate nigdy nie będzie pusty.
- **Poprawka:** jedna komenda w nagłówku planu wykonania, np. `git grep -nE '<wzorce>' -- . ':!docs/plans' ':!docs/reviews' ':!docs/research' ':!docs/session-logs'`. Wzorce:
  - `--ts-size-hit([^-]|$)`
  - `data-slot=["']?(header|body)`
  - `data-variant=["']danger`
  - `data-profile|profile:`

#### R2-M2. Wcięcie dla `aria-level` > 8 nie ma mechanizmu

- **Miejsce:** D39 (`:724`: lista `[aria-level='1']`…`[aria-level='8']` → `--_level` 0–7, „głębsze = 7”), strażnik `ARIA_LEVEL_INDENT` (`:858`: `--_level` tylko pod `[aria-level='N']`), test fazy 13 (`:1047`: `aria-level='9'` → 7 × `indent`).
- **Wpływ:** przy `aria-level='9'` nic nie ustawia `--_level`, więc `calc` w `padding-inline-start` jest nieważny i daje 0. Test zawiedzie, a wykonawca musi zgadnąć, jak uzyskać „głębsze = 7”, nie łamiąc wyjątku strażnika.
- **Poprawka:** do wyjątku dodać regułę bazową `[aria-level] { --_level: 7 }`, którą nadpisuje lista 1–7. Alternatywa: lista do 8 i test na poziomie 8.

#### R2-M3. D38: wyjątek odstępu WCAG 2.5.8 nie zachodzi dla xs

- **Dowód:** kontrolka xs ma 16 px, odstęp 3 px, więc środki są 19 px od siebie, mniej niż 24 px. Koła 24 px się przecinają i wyjątek odstępu nie jest spełniony. Spec nie wymaga 2.5.8 (grep spec, DIRECT), więc to kwestia rzetelności uzasadnienia, nie łamanie kontraktu. Streszczenie p. 5 opisuje zachowanie uczciwie.
- **Poprawka:** w D38 napisać wprost, że przy myszy gęsty pasek xs (i sm przy małym odstępie) nie spełnia 2.5.8, a gęstość to wybór właściciela. Nie przypisywać zgodności wyjątkowi odstępu.

#### R2-M4. Strażnik F19 a `Text` i `Heading`

- **Miejsce:** faza 11 krok 4 włącza kontrakt „każdy komponent z `components/**` ma sekcję”; faza 13 krok 1 tworzy `Text` i `Heading`, ale nie wymienia sekcji `data-edge-component` na `/screens/edges`.
- **Wpływ:** bramki fazy 13 będą czerwone, dopóki wykonawca sam się nie domyśli. Nie wiadomo też, czy „komponent” oznacza folder (`components/text/` ma dwa pliki) czy eksport.
- **Poprawka:** w fazie 13 krok 1 dopisać sekcje `text` i `heading`; w kontrakcie F19 napisać, że jednostką jest eksport komponentu z `index`.

#### R2-M5. Faza 11: testy „które dziś przechodzą” bez sprawdzenia

- **Miejsce:** faza 11 krok 3 (`:1004`): pigułka ± 0,5 px przy zoomie 50–200 % i obrys 1 px przy DPR 0,5 trafiają do grupy „dziś przechodzą”. Nikt tego nie sprawdził.
- **Wpływ:** jeśli któryś zawiedzie, żadna faza nie jest właścicielem poprawki, a `test.fail`/`skip` jest zakazany, więc wykonawca utknie.
- **Poprawka:** jedno zdanie w „Zatrzymaj się”: skrajność, która w fazie 11 zawodzi, a nie należy do żadnej luki G, wraca do prowadzącego jako decyzja (która faza ją naprawia).

#### R2-M6. Checkpoint 3: brak kanału dostarczenia na telefon

- **Miejsce:** faza 15 (`:1085`): „pliki w scratchpadzie sesji, ścieżki w raporcie”.
- **Dowód:** właściciel nie otworzy na telefonie lokalnego scratchpadu, a U24 i masterplan (`:55`) wymagają linku.
- **Poprawka:** nazwać kanał, np. prywatna strona z nagraniami i zrzutami pod jednym linkiem, albo inny ustalony z właścicielem.

#### R2-M7. Drobne niespójności tekstu

- `:686` i `:710` mówią „D29–D46”, a decyzje kończą się na D47 (`:665` mówi już D29–D47).
- Wiersz Q4 w tabeli zmian spec (`:958`) podaje tylko pigułkę. Brak dopisku, że reszta Q4 (popup w przelocie, poświata, orby) zostaje bez zmian, więc wykonawca może przepisać Q4 w całości.

### Sugestie

- **R2-S1.** Rynny `both-edges` w popupie przy klasycznym pasku Windows zwiększają odstęp poziomy od pozycji do krawędzi, a pionowy nie. Promień koncentryczny pozycji jest wtedy dobrany do innego odstępu niż widoczny z boku. Do punktu 7 checkpointu 3 warto dopisać „rogi pozycji równoległe do rogów popupu”.
- **R2-S2.** Faza 13 jest największa (7 grup, pisze prowadzący). Commit po każdej grupie z D47 ułatwia cofnięcie, gdy jedna grupa się wysypie; nie jest to wymóg.

## 1. Zamknięcie uwag rundy 1

### Recenzja zakresu (`e2-plan-part2-scope.md`)

| Uwaga                        | Stan                                | Dowód w planie                                                                                                                                                                                         |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1 toast i W16               | zamknięta                           | D34 `:719` (bez wariantu i wejścia), Nie-cel `:677`, Forbidden `:757-758`, Deferred `:776`, fixture `bad/` z `@starting-style` `:854`, streszczenie p. 7                                               |
| P2 zmiany nazw między fazami | zamknięta                           | D47 `:732`; faza 12 bez nazw czytanych przez przepisy `:1016`; faza 13 grupy 1–5 z konsumentami `:1029-1033`; faza 14a `nextOption` i stałe `:1061-1063`. Nowa uwaga tej samej klasy w fazie 10: R2-P1 |
| P3 tabela spec               | zamknięta                           | U9 `:931`, F7 `:948`, W9 `:940`, S1 `:965`, Zakres `:966`, B7 `:962`; rozbite wiersze; masterplan `:11, :39`                                                                                           |
| P4 checkpoint 3              | częściowo                           | nagrania przed/po, część telefon i komputer, „ma być” są (`:1085-1118`); brak kanału dostarczenia i linku (R2-M6)                                                                                      |
| P5 obrys powierzchni z tonem | zamknięta                           | D30 `:715`, Forbidden `:757`, contracts `:860`, test `:1039`, checkpoint p. 3                                                                                                                          |
| P6 streszczenie              | zamknięta                           | p. 5, 8–11 `:1219-1225`                                                                                                                                                                                |
| M1 D8                        | zamknięta                           | `:108`                                                                                                                                                                                                 |
| M2 `raised`                  | zamknięta                           | D30, D37, D36 `raised` = `Highlight`                                                                                                                                                                   |
| M3 `level`                   | zamknięta                           | D43 `:728` (pozycje typów), fixture `good/`                                                                                                                                                            |
| M4 strażnik F19              | zamknięta                           | D46 `:731`, contracts `:860`, faza 11 krok 4; skutek uboczny: R2-M4                                                                                                                                    |
| M5 pomiar D31                | zamknięta                           | D31 `:716`, faza 14b `:1069-1081`                                                                                                                                                                      |
| M6 odłożone                  | zamknięta                           | G24 jeden termin `:770`, `tabular-nums` odrzucony z powodem `:774`, „Odłożone” z kolumnami `:969`                                                                                                      |
| M7 warianty bez konsumenta   | zamknięta                           | In scope `:740`, Out of scope `:749`, Deferred `:777`                                                                                                                                                  |
| M8 typeahead                 | zamknięta (inaczej niż proponowano) | prowadzący zostawia typeahead z bramką właściciela: streszczenie p. 10, checkpoint (komputer) p. 6, gate fazy 15 `:1120`                                                                               |
| M9 `AGENTS.md`               | zamknięta                           | faza 9 `:981`, drzewo `:879`                                                                                                                                                                           |
| M10 rynna                    | zamknięta                           | D35 `both-edges` + `thin`, test równych odstępów `:1042`; zob. R2-S1                                                                                                                                   |
| M11 grep w gate              | zamknięta co do miejsca             | gate każdej fazy `:973`; wzorce i zakres: R2-M1                                                                                                                                                        |
| S1 `Text` jako etykieta      | zamknięta                           | D29                                                                                                                                                                                                    |
| S2 D45                       | zamknięta                           | `:730, :1174`                                                                                                                                                                                          |
| S3 gate fazy 9               | zamknięta                           | `:926, :984`                                                                                                                                                                                           |

### Recenzja techniczna (`e2-plan-part2-tech.md`)

| Uwaga                  | Stan      | Dowód w planie                                                                                                                                                   |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 pomiar D31          | zamknięta | faza 14b, faza 11 bez pomiaru                                                                                                                                    |
| P2 obszar trafienia    | częściowo | mysz zamknięta (D38: `hit-inset` 0, test `elementFromPoint`); `isolation: isolate` potwierdzone w `control.css:8`. Przy dotyku nowa regresja i luka testu: R2-P2 |
| P3 źródło triggera     | zamknięta | D40 `:725` (węzeł z triggera, stały obiekt ref, `TooltipBar`), przepływ `:864-873`, preflight `:982`, testy `:1064`, „Zatrzymaj się” `:791`                      |
| M1 zoom                | zamknięta | D46, strategia D46                                                                                                                                               |
| M2 `tabular-nums`      | zamknięta | `:1045`                                                                                                                                                          |
| M3 vitest bez DOM      | zamknięta | D41, drzewo `:902-904`                                                                                                                                           |
| M4 `tabIndex`, ikony   | zamknięta | D41                                                                                                                                                              |
| M5 `level`             | zamknięta | D43                                                                                                                                                              |
| M6 `inherits: false`   | zamknięta | D39, faza 12 krok 4                                                                                                                                              |
| M7 definicja B7        | zamknięta | D31, B7 `:962`, faza 14b krok 4                                                                                                                                  |
| M8 test warstwy toastu | zamknięta | D42, `:1050`                                                                                                                                                     |
| M9 stopka dialogu      | zamknięta | D33 (zachowanie zamierzone)                                                                                                                                      |
| M10 rynna dialogu      | zamknięta | D44, checkpoint; pomiaru szerokości nie dodano, ocenę oddano właścicielowi (świadome)                                                                            |
| M11 nazwy w fazie 12   | zamknięta | faza 12 `:1016`, faza 13                                                                                                                                         |
| S1–S4                  | zamknięte | 14a/14b; preflight tylko D40; Q7 w D39; zrzut tekstu w 14b i checkpoincie                                                                                        |

## 2. Nowe sprzeczności

- **D29–D47 między sobą:** brak sprzeczności w mechanizmach. D30 ↔ D37 (`raised` jako domyślne zaznaczenie, `selected-fill` jako wariant `active`) spójne. D35 ↔ D44 (rynny) spójne. D40 ↔ Forbidden (stały uchwyt, nie wartość osi) spójne. D42 ↔ D34 (tylko `layer-toast`) spójne.
- **Z częścią 1:** D8 poprawione (`:108`), faza 8 części 1 łączy się z fazą 16 (`:706, :1128`). Bez sprzeczności.
- **Ze spec:** tabela zmian pokrywa sprzeczności wskazane w rundzie 1; luka tylko w Q4 (R2-M7).
- **Z masterplanem:** zgodny: sześć przepisów i pięć ekranów (`:11`), E2 obejmuje fazy 9–16, toast w E3 (`:39`), log (`:113`).
- **Kolejność faz i zależności:** poprawna dla zmian nazw. Niespójna dla włączania strażników w fazie 10 (R2-P1).
- **Zmiany nazw razem z konsumentami:** zgodne z D47 we wszystkich fazach. Grep w gate'ach ma złe wzorce (R2-M1).
- **Bramki zielone po każdej fazie:** łamie je faza 10 (R2-P1), a fazę 13 mogą złamać sekcje F19 dla `Text` i `Heading` (R2-M4).

## 3. Gotowość dla świeżego wykonawcy

| Faza | Ruszy bez zgadywania? | Uwagi                                                                          |
| ---- | --------------------- | ------------------------------------------------------------------------------ |
| 9    | tak                   | gate wykonalny (odhaczenie wierszy z linią spec)                               |
| 10   | **nie**               | R2-P1                                                                          |
| 11   | tak, z ryzykiem       | R2-M5                                                                          |
| 12   | tak                   | gate `profile`: R2-M1                                                          |
| 13   | częściowo             | R2-P2 (projekt i test D38), R2-M2 (poziom 9), R2-M4 (sekcje F19), R2-M1 (grep) |
| 14a  | tak                   | jednostka H dobrze opisana, testy zawiodą przy złej implementacji              |
| 14b  | tak                   | ten sam skrypt przed i po, warunek regresji i wariant awaryjny opisane         |
| 15   | tak, z luką           | R2-M6                                                                          |
| 16   | tak                   |                                                                                |

## 4. Streszczenie dla właściciela

- Zgodne z planem w każdym punkcie: 9 faz, toast w E3, obszar 44 px tylko na dotyku, W9, W14, O7, typeahead, `profile` → `platform`/`typeset`, scalenie warstw, ocena z telefonu i komputera.
- Na telefonie czytelne: 12 krótkich punktów, jedna myśl na punkt. Wyjątek: p. 10 łączy dwie niezależne decyzje (O7 i typeahead), co utrudnia odpowiedź „tak/nie” na każdą z osobna.
- Po poprawce R2-P2 p. 5 musi uwzględnić to, co zmieni się w gęstych paskach na dotyku.

## Wykonane kontrole

```text
Odczyt: e2-foundation.md 646–1267 i D8 (:108); e2-plan-part2-scope.md, e2-plan-part2-tech.md (całość);
  masterplan.md (grep: cel, E2, E3, bramki, log); specification.md (grep: W7, Q4, B7, WCAG/2.5.8).
Sonda (jedna komenda, odczyt):
  control.css:8 isolation: isolate; :34-40 ::before z z-index -1 i min-width/min-height var(--ts-size-hit)
  surface.css:148,155 [data-slot='header'|'body'] (pojedyncze cudzysłowy); dialog.tsx:30,34, popover.tsx:30,34 data-slot="…"
  css-layers.ts:121,310-311,510 nieużyty wyjątek selektora = błąd 'unused selector exception'
  lib/theme.ts: tylko AXES, brak subtreeAxes
  grep 'profile': apps/docs/out/**, packages/tessera/dist/**, apps/docs/tests/button.spec.ts
```

## Niewykonane lub nierozstrzygające kontrole

- R2-P2: kolejność malowania i hit-testing przy wyśrodkowanym `::before` w sąsiednich kontekstach `isolation` to wniosek z reguł CSS, bez sondy w przeglądarce. Rozstrzygnie go test z poprawki.
- Czy testy fazy 11 „dziś przechodzą” rzeczywiście przechodzą: nie uruchamiałem.
- `menu.tsx:46` `strokeWidth={1.5}`: za baseline planu i recenzją rundy 1 (REPORTED), bez własnego odczytu.

## Zalecany następny krok

1. Poprawić R2-P1 (reguła aktywacji strażników z fazą przy każdej pozycji) i R2-P2 (ograniczenie `hit-inset` przy sąsiedzie albo decyzja o rozmiarze na dotyku; test stuknięcia wewnątrz kontrolki przy sąsiedzie).
2. Przy okazji R2-M1–M7 (po jednym zdaniu).
3. Celowane sprawdzenie tylko R2-P1 i R2-P2, bez pełnej rundy 3.
