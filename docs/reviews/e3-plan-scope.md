---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, docs/plans/e3-first-round.md (niezacommitowany, 828 linii, ok. 87 kB) + wiersz E3 w docs/plans/masterplan.md („plan w recenzji”); stan 2026-11-01
date: 2026-11-01
---

# Review: plan E3 „runda wszerz”, oś zgodności, zakresu i prostoty

## Zakres

- **Przedmiot:** `docs/plans/e3-first-round.md` w całości oraz zmiana statusu E3 w masterplanie.
- **Authority:** `docs/specification.md`, `AGENTS.md`, `docs/structure.md`, `docs/plans/masterplan.md` („Wejście planu E3 (start)”), `docs/plans/e2-foundation.md` (D29–D47), `docs/reviews/e2-foundation-gaps-2.md`, `docs/research/inspiration.md`; zachowania 1:1 (F15): stary kit `MangaShift/packages/ui/src` i desktop `MangaShift/desktop/src`.
- **Ryzyka:** luka w pokryciu wejścia E3, sprzeczność ze spec lub regułami właściciela, mechanizm bez konsumenta, plan za ciężki dla wykonawcy i właściciela, streszczenie niezgodne z planem.
- **Poza review:** poprawność techniczna mechanizmów (scroll-driven animations, Base UI, pomiary): to oś drugiego recenzenta. Wygląd: tylko właściciel.

## Werdykt

**Status:** FAIL w obecnej formie, ocena **6/10**. Poprawki są punktowe i nie wymagają przeplanowania.

**Najważniejszy powód:** plan pokrywa całe wejście E3 (5 decyzji, M-01…M-16, S-A, S-B, wszystkie pozycje „Odłożone” na E3) i ma dobrą drogę komponentu, ale w pięciu miejscach łamie reguły właściciela albo spec: „lane” wprowadza zachowanie, którego desktop nie ma, i porzuca jego symetryczne rynny; propozycje Select i Tabs ponownie otwierają wypukłą pigułkę; ekran Ustawienia nie da się złożyć „według prawdziwego ekranu” w miejscu, które daje mu kolejność; zmiany spec i `AGENTS.md` są niekompletne; streszczenie, na podstawie którego właściciel mówi „Ok”, pomija decyzje wymagające jego zgody.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. „Lane” (D54) nie jest 1:1 z desktopem i przeczy własnemu zakazowi

- **Miejsce:** D54 (l. 99), Forbidden (l. 177), próba P-LANE (l. 586), zmiana F16 (l. 456), impact scan (l. 237: „przy lane rynny 0”).
- **Dowód (DIRECT):** desktop `packages/ui/src/lib/scroll-lane.ts`, `useLaneState`: stany `hidden | hover | touch` liczone tylko z `pointerenter`/`pointerleave` i przepełnienia; nie ma stanu „przewijanie” ani timera bezczynności. `useLaneGutter` przy przepełnieniu daje równy padding po obu stronach (`paddingLeft` i `paddingRight` = `SCROLL_GUTTER_PX`). `list/lane-scrollbar.tsx`, `laneInsets`: pasek omija zaokrąglone rogi powierzchni. Plan dodaje „pojawianie się przy przewijaniu” ze stałą `LANE_IDLE`, a jednocześnie zakazuje JS na każdym zdarzeniu `scroll` i wymaga w P-LANE „brak zadań JS na zdarzenie scroll”. Wykrycie przewijania i odliczanie bezczynności wymaga właśnie takiego słuchacza (albo osobnej techniki, której plan nie nazywa). Plan zeruje też rynny przy „lane”, a desktop je zachowuje symetrycznie (W5). O rogach plan nic nie mówi.
- **Wpływ:** nowe zachowanie wbrew F15 i Z10; sprzeczne kryterium próby, więc P-LANE albo obleje, albo zostanie po cichu złagodzone; treść przewijanych popupów i list traci symetrię.
- **Minimalna poprawka:** w D54 stany paska jak w desktopie (ukryty, hover, dotyk z `pointerenter`/`pointerleave`), bez `LANE_IDLE`; rynny przy „lane” symetryczne, z szerokości paska i odstępu z silnika (`lane.ts` już mierzy przepełnienie, więc może zapisać atrybut przepełnienia); odsunięcie paska od rogów liczone w CSS z promienia silnika `shape` (bez pomiaru, Q7); zmiana F16 i impact scan odpowiednio poprawione.

#### P2. Propozycje Select i Tabs otwierają ponownie wypukłą pigułkę

- **Miejsce:** D63 (l. 108: „pigułka wyboru (`raised`, wypukła)”) kontra R4 fazy 7 (l. 595: „pigułka wyboru w liście `raised` kontra `active`”); D64 (l. 109: „Pigułka wyboru wypukła”) kontra R4 fazy 9 (l. 633: „pigułka `active` bez toru”).
- **Dowód:** W14, standard pigułki: zaznaczenie jednego wyboru „domyślnie pigułka wypukła (`raised`)”; kryterium właściciela z briefu: wypukła pigułka bez wciśnięcia.
- **Wpływ:** plan przeczy sam sobie, a właściciel dostaje do ponownej decyzji regułę, którą już ustalił.
- **Minimalna poprawka:** usunąć warianty `active` z R4 Select i Tabs; propozycje dotyczą tylko tego, czego W14 nie ustala (np. ptaszek przy wybranej opcji, wariant zakładek pod treścią dokumentu).

#### P3. Ekrany nie składają się w miejscu, które daje im kolejność D73

- **Miejsce:** faza 8 (l. 599–625), D73 (l. 118), D52 (l. 97), faza 11 (l. 651), faza 13 (l. 669).
- **Dowód (DIRECT, desktop `desktop/src/features/settings/components/`):** `backend-card.tsx:236-244` używa `Alert` (błąd i informacja); `appearance-card.tsx` i `shortcuts-card.tsx` używają `Tabs` jako segmentów; `shortcuts-card.tsx` używa `Dialog` i `Kbd`; żaden plik ekranu (także `ui-scale-control.tsx`) nie używa Switch, Checkbox ani Slider. Plan robi Ustawienia w fazie 8, a Alert dopiero w fazie 10; checkpoint ekranu (l. 616) każe właścicielowi ocenić „Select, Switch, Checkbox, Slider”, których prawdziwy ekran nie ma. Panel roboczy ma pasek narzędzi z `ButtonGroup` i `ToggleGroup`, a Wycinek strony pasek nawigacji z przyciskami-linkami; oba ekrany mają test „brak poziomego przewijania 320–1920 px”, a D52 odkłada regułę przepełnienia Toolbar i nawigacji do E4.
- **Wpływ:** ekran Ustawienia albo dostanie atrapy zamiast prawdziwej treści (wbrew „prawdziwe ekrany, nie atrapy”), albo uruchomi „ekran wymaga komponentu spoza zakresu” w połowie etapu; dwa pozostałe ekrany trafią na nierozstrzygnięte przepełnienie przy 320 px.
- **Minimalna poprawka:** przenieść U-ALERT do rundy B (to powierzchnia jak Card, D68 potrzebuje tylko slotu ikony w `surface`); w fazie 8 wypisać skład według desktopu (segmenty = ToggleGroup, nawigacja boczna = `Item`/`row`, Alert, Dialog, Kbd, Badge z kropką, Select, Input), a Switch, Checkbox i Slider pokazać na Panelu roboczym (wyspa właściwości już je ma); w D52 jawnie objąć poziome rzędy przycisków na ekranach (pasek narzędzi, nawigacja strony) tym samym przewijaniem w `ScrollArea` poziomo.

#### P4. Zmiany spec i `AGENTS.md` są niekompletne, a kilka wierszy łączy pozycje

- **Miejsce:** „Zmiany specyfikacji” (l. 447–467), „In scope” dokumenty (l. 164), warunek końcowy (l. 26).
- **Dowód:**
  - D52 (przepełnienie poziome) to reguła dla rodzin E4, a masterplan wymienia ją jako „Decyzja”; tabela zmian spec jej nie ma.
  - D53 daje torowi `container-type`, a F17 mówi, które elementy są kontenerami („nie każda powierzchnia”); brak wiersza F17. Literały `100cqi`/`100cqb` przeczą liście liczb przepisu w `AGENTS.md` (Model warstw: „liczb `0`, `1`, `-1`, `100%`”) i w `structure.md`.
  - `ts-scroll` musi działać przy `motion: off` (test w fazie 7, l. 597), a Q2 i F6 mówią, że przy `motion: off` nazwy klatek = `none`; wiersz „Q2, F6” nie nazywa wyjątku.
  - `AGENTS.md` ma zamknięte listy, które plan zmienia: `@keyframes` „wyłącznie `ts-spin`, `ts-sweep`, `ts-pulse`”, lista plików pomiaru w akapicie TSX („`lib/indicator.ts`, `lib/popup-flight.ts`”), `@starting-style` zabroniony. Plan aktualizuje `AGENTS.md` tylko w mapie testów i pułapce osi koloru.
  - Wiersz „Odłożone” nie ma M-07, menu „więcej” (D52) ani przeciągania w drzewie, a warunek końcowy (l. 26) wymaga jawnego odłożenia „w spec” i jednocześnie wskazuje tabelę z planu.
  - Masterplan, „Wejście planu E3”: M-08 dalej „(E4)”, choć D66 przenosi go do E3.
  - Wiersze „Q2, F6”, „B5, B6”, „F18, pułapka `AGENTS.md`” łączą po dwie pozycje (zasada: jedna pozycja = jeden wiersz).
- **Wpływ:** po E3 spec i `AGENTS.md` przeczą kodowi (spec jest jedynym źródłem decyzji; wykonawca czyta `AGENTS.md` jako regułę), a E4 nie ma źródła dla reguły przepełnienia.
- **Minimalna poprawka:** dopisać wiersze: D52 (nowa reguła przy W14 albo F19), F17 (tor jako kontener), osobno Q2 i F6 z wyjątkiem `motion: off` dla `ts-scroll`, B5 i B6 rozdzielone, F18 i `AGENTS.md` rozdzielone; dodać `AGENTS.md` (lista klatek, lista Q7, liczby przepisu, `@starting-style`) i `structure.md` (liczby przepisu) w tej samej fazie co zmiana kodu; uzupełnić „Odłożone” o M-07, menu „więcej” i przeciąganie w drzewie; poprawić linię M-08 w masterplanie w fazie 0.

#### P5. Streszczenie pomija decyzje, które wymagają zgody właściciela

- **Miejsce:** „Streszczenie dla właściciela” (l. 813–827), D71 (l. 116), D50 (l. 95), wiersz N5 (l. 463), D66, D75, D69.
- **Dowód:**
  - D71 luzuje twardy budżet B5: spec mówi „kontrolka ≤ 3”, plan „przypadek typowy ≤ 3, każdy dodatkowy slot konsumenta + 1”.
  - D50 rozstrzyga hover zaznaczonej kontrolki wielokrotnego wyboru, a `e2-foundation-gaps-2.md` (N-03, „Wymagane decyzje” pkt 1) wskazywał tu właściciela.
  - Wiersz N5 zamyka w fazie 0 część „ptaszek”, a N5 stoi w spec w „Decyzjach właściciela”; nagrania przychodzą dopiero w R5 rundy D.
  - Radio do E4 (D75), M-08 do E3 (D66), menu „więcej” i koncentryczność G17 do E4.
  - Desktop ma dziś stos toastów jako „talię kart” (Sonner z domyślnym `expand`, `packages/ui/src/feedback/toaster.tsx`) i bez przejść (`transition-none!`), a D69 ustawia domyślnie zwykłą kolumnę.
  - Liczba checkpointów: 8 rund, 3 ekrany i raport budżetów, czyli ok. 12 rozmów.
    Żadnej z tych pozycji streszczenie nie podaje.
- **Wpływ:** właściciel akceptuje plan („Ok”) ze streszczenia na telefonie, więc te zmiany przeszłyby bez jego świadomej decyzji; dla B5 to luzowanie bramki przy priorytecie nr 1 (wydajność).
- **Minimalna poprawka:** dopisać do streszczenia 4–5 linii: B5 (+1 za slot konsumenta), hover zaznaczonego pola zostaje, ptaszek przez `scale` + `opacity` (zamknięcie N5 po nagraniach rundy D, nie w fazie 0), przesunięcia zakresu (Radio, M-08, menu „więcej”, G17), toast: na desktopie talia bez wejścia, pytanie w rundzie F z tą wersją jako jedną z opcji, ok. 12 checkpointów.

### Mniejsze

#### m1. Plan da się skrócić o ok. 20–25 % bez utraty informacji

- **Miejsce i dowód:** pomiar rozmiarów sekcji: „Decyzje planu” ok. 22 tys. znaków (27 % pliku), „Docelowe drzewo” 5,2 tys., „Strategia dowodu” 3 tys.
- **Do usunięcia:**
  - „Strategia dowodu” powtarza „Testy dodatkowe” faz i kolumnę „Skutek” decyzji; zostawić jedno miejsce.
  - „Rozstrzygnięcie wejścia E3” ma podwójne wiersze M-01, M-05 i M-09; scalić je w kolumnę „wejście” w tabeli decyzji.
  - „Lokalna adaptacja” powtarza „Dozwolone decyzje lokalne”.
  - „Definition of Done” powtarza „Warunki końcowe”.
  - „Co jest (E2)” powtarza `structure.md`; zostawić tylko odwołanie.
  - „Docelowe drzewo” wymienia pliki komponentów z tabeli jednostek; zostawić tylko pliki spoza niej (`lib/`, testy, `perf/`, trasy).
  - „Regression obligations” powtarza impact scan.
  - D48 powtarza tabelę R1–R8.
  - Szczegóły wykonania w D54 i D71 (dokładne formuły, nazwy testów) można przenieść do R2 faz.
- **Wpływ:** wykonawca jednostki czyta mniej i nie trafia na rozjechane kopie tej samej reguły.
- **Reakcja:** skrócić przed drugą rundą recenzji.

#### m2. Propozycje oceniane w izolacji

- **Miejsce:** D49 (l. 94), szablon R5 (l. 749–762).
- **Dowód:** U23 („element ocenia się w kompozycji”); lekcja v2 w masterplanie: ocena w izolacji przez miesiąc nie dała akceptacji. R5 prosi o „spójność z przyciskiem i polem obok”, ale D49 nie wymaga sąsiadów.
- **Reakcja:** w D49 każda propozycja w małym fragmencie kompozycji (na karcie, w popupie, obok Button i Input).

#### m3. `/stress` i `/proposals` zaliczają F12 za darmo

- **Miejsce:** D71, D49; kontrakt „≥ 2 strony laboratorium” w `contracts.test.ts` liczy importy `apps/docs/app/**/page.tsx` (`structure.md`).
- **Wpływ:** komponent może spełnić F12 samym `/components` + `/stress`.
- **Reakcja:** wyłączyć obie trasy z liczenia w kontrakcie.

#### m4. Mechanizmy bez konsumenta (YAGNI)

- **Dowód:**
  - D70 dodaje `typeset` do osi poddrzewa, a `lib/theme.ts:18` ma jedną wartość (`'inter'`).
  - `orientation` w `ButtonGroup` i `Slider` oraz literał `100cqb` (D53) nie mają konsumenta: w `desktop/src` i `packages/ui/src` nie ma pionowego Slidera ani pionowej grupy przycisków.
- **Reakcja:** usunąć do pierwszego konsumenta. `/proposals`, `virtual-list.ts` (Q12, drzewo do 25 000 węzłów) i warunkowy `toast-stack.ts` mają konsumenta albo warunek, więc zostają.

#### m5. Odwrócona zależność Tree i Context menu

- **Miejsce:** D65 (Tree: „menu kontekstowe przez kompozycję z `ContextMenu`”) kontra tabela jednostek (U-CONTEXT zależy od U-TREE).
- **Reakcja:** Tree wystawia tylko `onContextMenu`, a kompozycja dzieje się na Panelu roboczym; albo U-CONTEXT przed U-TREE.

#### m6. Pytanie w Karcie powtarza checkpoint 3 E2

- **Miejsce:** R4 fazy 4 (l. 554: „czy pierścień 1 px … liczy się jako ramka”).
- **Dowód:** W14 już to rozstrzyga („pierścień 1 px … to cień wypukłości, nie ramka”), a pytanie należy do checkpointu 3 E2 (`e2-foundation-gaps-2.md`, „Wymagana ocena człowieka”).
- **Reakcja:** usunąć z R4, jeśli checkpoint 3 da odpowiedź.

#### m7. Gate fazy 2 jest rytuałem

- **Miejsce:** l. 522 (`git -C MangaShift status` jak przed fazą).
- **Dowód:** D72 sam mówi, że working tree MangaShift dzielą inne sesje, a `git archive` tylko czyta.
- **Reakcja:** sprawdzać brak zmian pod `tessera/` w MangaShift albo usunąć gate.

#### m8. Nakładające się rundy i `data-proposal`

- **Miejsce:** ryzyko „Rundy czekają na właściciela” (l. 773).
- **Dowód:** R2 następnej rundy zmienia te same przepisy, w których stoją jeszcze reguły `[data-proposal]` poprzedniej.
- **Reakcja:** zasada: R6 rundy N przed R2 rundy N+1 w tym samym pliku przepisu.

#### m9. Paczka R5 na telefon będzie ciężka

- **Miejsce:** R5 (l. 752–754): PNG każdej propozycji w dwóch trybach.
- **Dowód:** w rundzie B to ok. 10 pytań.
- **Reakcja:** jeden PNG na pytanie (wszystkie wersje obok siebie, jasny nad ciemnym). Narzędzie `SendUserFile` jest wymienione bez sprawdzenia, że istnieje u prowadzącego.

### Sugestie

- **S1.** D70: zamiast emitować reguły koloru „także” dla `[data-mode][data-accent]` poza `:root` (dwie kopie), jedna forma selektora dla korzenia i poddrzewa; mniej CSS przy B6.
- **S2.** D72: dynamiczny pomiar v2 (strona „stress” w galerii v2, perf i B3–B7) to najdroższa część fazy 2, a budżety B1–B5 i B7–B8 w spec są liczbami bezwzględnymi; tylko B6 (CSS) wymaga liczby v2. Warto zapytać właściciela, czy pomiar statyczny wystarczy.
- **S3.** Desktop ma też maskę zanikania krawędzi przewijania (`scrollFadeMask` w `scroll-lane.ts`); F15 jej nie wymienia, ale warto ją wpisać jako pozycję do decyzji (E3 albo E4), żeby nie zginęła.

## Zgodność z kontraktem

- **5 decyzji z „Wejścia planu E3”:** pass. Części i hover (D50), `mixed` (D51), przepełnienie (D52), Slider (D53, D61), toast (D69).
- **M-01…M-16:** pass. Każda pozycja ma decyzję albo odłożenie z powodem; M-07 bez wpisu w spec (P4), M-12 warunkowe z pomiarem na ekranie.
- **S-A, S-B, G10, F1, G17 (część), G22, G23, G25, typeahead, wirtualizacja, zmienne dostawcy, textarea:** pass.
- **F10 (20 komponentów):** pass. 7 z E2 + 13 nowych, plus `ButtonGroup`, `ScrollArea` i `ThemeScope` jako zależności.
- **Przesunięcia zakresu:**
  - M-08 do E3: uzasadnione (F10 wymienia Context).
  - Radio do E4: uzasadnione (F10 go nie wymienia), części D50 obsłużą go bez zmiany przepisu.
  - Premium poza rdzeniem: zgodne z Z7 i „Odłożone”.
  - Wszystkich trzech brak w streszczeniu (P5).
- **Zero legacy:** pass. ToggleGroup przechodzi na hook w tym samym diffie (D64), `/proposals` i kopia v2 znikają, D47 obowiązuje.
- **Reguły właściciela:**
  - Skrajności i responsywność: macierz F19 pełna.
  - Bez obramowań w dużych układach: pass.
  - W16: pass.
  - Wygląd ocenia właściciel: pass, poza N5 (P5).
  - Wypukła pigułka: fail (P2).
  - Symetria i F15 przy „lane”: fail (P1).
  - Prawdziwy ekran Ustawień: fail (P3).
- **Streszczenie a plan:** zgodne w tym, co mówi; niepełne (P5).

## Wykonane kontrole

```text
Odczyt w całości: e3-first-round.md (828 l.), masterplan.md, specification.md, e2-foundation-gaps-2.md,
  AGENTS.md, structure.md; e2-foundation.md: nagłówki, D41, D44, D46, D47; inspiration.md: nagłówki sekcji,
  kolumna „Też”, trafienia toast/premium/badge.
git status / git diff --stat (worktree e2): plan nowy, masterplan zmieniony (wiersz E3 „plan w recenzji”).
Fakty w kodzie Tessery: type.css:44 (--ts-type-measure-narrow istnieje), theme.ts:18 (typeset: ['inter']),
  theme.ts:23 (SUBTREE_AXES), indicator.ts:449-457 (ResizeObserver na pozycjach, N-01 zamknięte), button.tsx:36,
  row.css:121, edges/page.tsx 451 l., css-layers.ts:402-416 (podmiot selektora = element przepisu, przodek dowolny,
  więc [data-proposal] przechodzi bez wyjątku, jak twierdzi D49), surface.css:108 (jedyny container-type w przepisach).
Źródła F15: wszystkie 49 ścieżek v2 i desktopu z tabeli jednostek istnieją (pętla [ -e ]).
Desktop: scroll-lane.ts (stany lane, rynny), lane-scrollbar.tsx (laneInsets), toaster.tsx (Sonner, transition-none),
  settings/components/* (importy: Tabs, Alert, Dialog, Kbd, Select, Input, Badge; brak Switch/Checkbox/Slider),
  brak orientation="vertical" dla Slider i ButtonGroup w desktop/src i packages/ui/src.
Rozmiary sekcji planu: awk po nagłówkach.
```

## Niewykonane lub nierozstrzygające kontrole

- Bez buildów i testów (brief). Stan bramek E2 (vitest 758/758, Playwright 256/12) jest REPORTED przez plan.
- Nie sprawdzałem technicznej wykonalności `animation-timeline` dla kciuka poza przewijanym elementem, zachowania Base UI `Select` ani kosztu reguł koloru poddrzewa; to oś recenzenta technicznego.
- Wynik checkpointu 3 E2 nieznany; plan sam uzależnia od niego D57, D62 i D64.

## Zalecany następny krok

1. Poprawić P1–P5 (zmiany w D52, D54, D63, D64, D73, fazie 8, tabeli zmian spec, „In scope” i streszczeniu).
2. Przy tej samej edycji skrócić plan według m1.
3. Druga runda recenzji tylko dla zmienionych miejsc.
