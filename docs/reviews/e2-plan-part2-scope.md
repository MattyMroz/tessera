---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, branch feat/e2-foundation, niezacommitowane docs/plans/e2-foundation.md (część 2, linie 646–1152) i docs/plans/masterplan.md (stan 2026-10-31)
date: 2026-10-31
---

# Review: plan E2, część 2 (fazy 9–16), oś zgodności i zakresu

## Zakres

- **Przedmiot:** `docs/plans/e2-foundation.md`, „Część 2: fundament pod rodziny” (D29–D46, fazy 9–16, tabela zmian spec, streszczenie), oraz zmiany w `docs/plans/masterplan.md`.
- **Authority:** `docs/specification.md`, `AGENTS.md`, `docs/structure.md`, audyt `docs/reviews/e2-foundation-gaps.md`, research `docs/research/e2-foundation-2026.md`, część 1 planu (D1–D28); zasady właściciela z briefu (skrajne przypadki, responsywność, zero komentarzy, symetria, bez obramowań w dużych układach, pigułka wypukła i bez wciśnięcia, W16).
- **Oś:** zgodność i zakres. Poza review: poprawność techniczna mechanizmów CSS i przeglądarek (inna oś), wygląd.
- **Dowód:** odczyt plików (DIRECT) i grep po kodzie worktree; bez buildów i testów.

## Werdykt

**Status:** `fail` (do poprawy przed akceptacją; żadna uwaga nie jest krytyczna).

**Ocena na tej osi: 6/10.** Pokrycie audytu jest prawie pełne: każda luka „E2 teraz” i „E3 start” ma decyzję albo jawne odłożenie z powodem, a zakres nie buduje komponentów E3. Plan łamie jednak twardą regułę właściciela (W16) bez jego decyzji, rozdziela zmiany nazw między fazy wbrew własnej regule „jedna nazwa = jedna faza” i bramkom „zielone po każdej fazie”, ma niepełną tabelę zmian spec, a checkpoint 3 nie spełnia U24 i nie da się go wykonać z telefonu. Streszczenie nie mówi właścicielowi, które jego reguły plan zmienia.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. D34: wjazd toastu zmienia twardą regułę W16 bez decyzji właściciela i wyprzedza komponent E3

- **Miejsce:** D34 (`:716`), tabela zmian spec W16 (`:923`), przepis `surface` `toast` (`:834`), faza 13, checkpoint 3, streszczenie p. 8.
- **Dowód:** W16 jest regułą [W]. Research sam pisze: „Dopisać toast do W16 jako wyjątek, jeśli właściciel się zgodzi” (`e2-foundation-2026.md:391`) i „Decyzja o toaście należy do właściciela” (`:528`). Pamięć właściciela o trybie delegacji (`wlasciciel-niedostepny-decyzje-astra-opus.md`) wymienia `zero-animacji-wejscia-poza-dialogiem` wśród reguł, które obowiązują także wtedy, gdy prowadzący decyduje za niego. Toast jest w „Nie-cel” części 2 (`:676`), a plan i tak dodaje wariant `toast`, `@starting-style` i połowę ruchu („Krawędź górna przyjdzie z komponentem Toast (E3)”, `:716`, `:769`).
- **Wpływ:** zmiana reguły właściciela przez prowadzącego; wariant przepisu bez konsumenta (YAGNI) i ruch wejścia budowany w połowie.
- **Minimalna poprawka:** usunąć z części 2 wariant `toast`, `@starting-style` i pozycję W16 z tabeli zmian; zostawić `layer-toast` (D42) i pętle D34. Wejście toastu jako pytanie do właściciela przy komponencie Toast (E3), wpis w „Deferred”.

#### P2. Zmiany nazw rozłożone na fazy 12, 13 i 14: łamie zero legacy i bramki faz

- **Miejsce:** faza 12 (silniki: `hit` → `hit-inset`, `layer-overlay`/`layer-modal` → `layer-popup`, `indicator-active*` → `selected*`), faza 13 (przepisy: `row` `danger` → `data-tone`, usunięcie slotów `header`/`body`), faza 14 (`indicator.css`, `MenuItem tone`, tytuły Dialog/Popover przez `text`); Impact scan (`:800`): „jedna zmiana na nazwę w całym repo w tej samej fazie”; bramki „Faza kończy się lokalnym commitem”, gate „bramki zielone”.
- **Dowód (grep):** `recipes/control.css:38-39` czyta `--ts-size-hit`; `recipes/surface.css:3, 86, 137` czyta `layer-overlay`/`layer-modal`; `recipes/indicator.css:26-27` czyta `--ts-state-indicator-active*`, a faza 13 wprost wyłącza zmiany `indicator` do fazy 14 (`:998`); `surface.css:148, 155` ma sloty `header`/`body` używane przez `dialog.tsx`/`popover.tsx`, które zmieniają się w fazie 14; `row.css:52` `danger` używa `menu.tsx` (faza 14).
- **Wpływ:** po fazie 12 przepisy czytają nieistniejące wyjścia (pigułka, z-index, obszar trafienia); po fazie 13 tytuł dialogu i pozycja `danger` w menu tracą wygląd. Bramki fazy nie mogą być zielone, a wykonawca musi albo zostawić starą nazwę na jedną fazę (legacy), albo samowolnie przesunąć pracę.
- **Minimalna poprawka:** jedna reguła w „Plan wykonania”: faza, która zmienia nazwę wyjścia, atrybutu albo slotu, przenosi w tym samym diffie wszystkich konsumentów (przepisy, komponenty, testy, `docs/*.md`). Albo przenieść zmiany nazw do fazy pierwszego konsumenta (np. `indicator-active` → `selected` do fazy 14). Grep starych nazw z „Forbidden” dopisać do gate'u każdej fazy, nie tylko do DoD.

#### P3. Tabela „Zmiany specyfikacji” jest niepełna i miesza pozycje

- **Miejsce:** `:912-942`.
- **Dowód, brakujące pozycje:**
  - **U9** mówi, że jedynym publicznym API są wyjścia `--ts-<silnik>-<rola>`; D39 dodaje publiczne klucze `--ts-i-*` deklarowane w `size.css` i liczone do B8 (`:825`). Q6 jest w tabeli, U9 nie.
  - **F7** pozwala w CSS komponentu tylko na liczby `-1`, `0`, `1`, `100%`, `Nfr`; D33 dopuszcza `@container` z progami 400/640/960 px w CSS komponentu (`:846`). Nowe F17 nie zdejmuje sprzeczności z F7.
  - **W9** („Pola bez ramki”): D37 daje polu z `aria-invalid`/`:user-invalid` obrys `invalid-color` (`:832`), D36 daje polu i torowi obrys w `forced-colors`.
  - **S1** i sekcja **Zakres** spec mówią „cztery ekrany” i „pięć przepisów”; F11 i U10 zmieniają się, S1 i Zakres nie. Masterplan „Cel końcowy” też dalej mówi „pięć przepisów”.
  - **B7** w tabeli budżetów („warstwy długiego życia na widoku (Q4)”): D31 zmienia sposób liczenia (CDP, pigułki 0 w spoczynku, DPR 1,5); jest to tylko w wierszu Q4.
- **Dowód, mieszanie:** wiersze „W6, W7”, „W19, W21”, „F10, F12”, „nowe F16–F19” (cztery nowe wymagania w jednej komórce), „U10” (sześć przepisów + `raised` + oś tonu).
- **Wpływ:** po fazie 9 spec dalej przeczy planowi w kilku miejscach; AGENTS.md każe wtedy wykonawcy zatrzymać się i zgłosić konflikt. Zbiorcze wiersze utrudniają kontrolę „brak sprzeczności spec ↔ plan” (gate fazy 9).
- **Minimalna poprawka:** dopisać U9, F7, W9, S1, „Zakres” (spec) i B7; masterplan „Cel końcowy” i opis E2 na sześć przepisów; rozbić zbiorcze wiersze na jedną pozycję spec na wiersz.

#### P4. Checkpoint 3 nie spełnia U24 i nie ma ścieżki dla telefonu

- **Miejsce:** faza 15 (`:1032-1050`).
- **Dowód:** U24: etap kończy się „linkiem, instrukcją sprawdzenia i (przy ruchu) nagraniem obok poprzedniej wersji”. Część 2 zmienia ruch: pigułka bez stałej warstwy (D31, ryzyko skoku na starcie, `:1115`), pętle (D34), przewijane menu z pigułką. Scenariusz nie ma nagrań „przed/po”. Wszystkie kroki wymagają komputera: `bun run dev` → `localhost:3000`, zwężanie okna do 320 px, Ctrl + kółko, kursor nad 8 grupami, DevTools albo motyw kontrastowy Windows. Scenariusz ma ok. 15 punktów na trzech ekranach w jednym bloku.
- **Wpływ:** właściciel często ocenia z telefonu; bez wariantu telefonu checkpoint czeka na komputer. Bez nagrania „pigułka bez skoku” zależy od tego, czy właściciel zauważy różnicę na żywo bez porównania.
- **Minimalna poprawka:** (a) nagrania obok poprzedniej wersji dla D31 (przejazd pigułki w ToggleGroup i menu) i pętli; (b) podział scenariusza na część „telefon” (adres w sieci lokalnej albo podgląd builda; tony i statusy w obu trybach, tekst, wąski ekran naturalnie, dotyk i obszar trafienia, menu w niskim widoku) i część „komputer” (hover, zoom, forced colors, 8 grup); (c) przy każdym punkcie jedno zdanie „ma być”.

#### P5. D30: powierzchnia z tonem dostaje obrys, wbrew zasadzie „bez obramowań w dużych układach”

- **Miejsce:** D30 (`:712`): „`surface` z tonem: tło `color-mix` tonu i tła poziomu, obrys `tint-border`”; tabela przepisów `surface` (`:834`); contracts „każda wartość `data-tone` ma regułę w `control`, `row`, `surface`”.
- **Dowód:** W14 \[W, 31.10\]: „wyspy i duże układy nie mają obramowań, oddziela je wypełnienie i cień”. Przepis `surface` obsługuje `page`, karty, panele i popupy; plan nie ogranicza tonu ani obrysu do żadnego poziomu.
- **Wpływ:** każda karta lub panel w tonie (Alert, callout, sekcja błędu w E3) dostaje ramkę wbrew zasadzie właściciela; po E3 poprawka dotknie wszystkich rodzin z tonem.
- **Minimalna poprawka:** powierzchnia z tonem = samo tło z `color-mix`, bez obrysu; albo jawny wyjątek dla małych poziomów (np. tylko `overlay`) zapisany w W14 i w streszczeniu jako pytanie do właściciela.

#### P6. Streszczenie nie mówi, które reguły właściciela plan zmienia

- **Miejsce:** „Streszczenie dla właściciela” (`:1139-1152`).
- **Dowód:** streszczenie jest wierne w tym, co wymienia, ale pomija zmiany reguł [W] i decyzje widoczne dla właściciela: wyjątek od W16 dla toastu (p. 8 mówi tylko „toast wjeżdża od dołu”), obrys pola w błędzie (W9), obrys powierzchni z tonem (W14), minimalne Safari 26.2 (nowe O7, D45), typeahead w ToggleGroup, który przy wyborze idącym za fokusem zmienia zaznaczenie po literze (D41), scalenie warstw popupu i okna (D42). P. 7 („obszar kliknięcia co najmniej 24 px”) obiecuje więcej niż D38: wiersze są bez obszaru trafienia (odłożone).
- **Wpływ:** właściciel akceptuje plan po streszczeniu, często z telefonu; zmiany jego reguł przechodzą bez jego decyzji.
- **Minimalna poprawka:** osobny punkt „Zmieniam Twoje reguły (potwierdź albo odrzuć)”: W16 (o ile zostaje po P1), W9, W14, O7, typeahead w segmentach; p. 7 doprecyzować („kontrolki; wiersze w E3”).

### Mniejsze

#### M1. D8 dalej opisuje stałą warstwę

- **Miejsce:** D8 (`:108`). Nagłówek mówi „zastąpione przez D31”, a treść dalej: „Jazda jest stałą warstwą (`will-change: transform`) przez cały czas życia, jak każe Q4”. N1 audytu jest rozwiązane tylko dopiskiem.
- **Poprawka:** usunąć zdanie o stałej warstwie i skutek „test liczy warstwy długiego życia (≤ 12)”, zostawić odsyłacz do D31.

#### M2. D37 i D30 nie mówią, co z pigułką wypukłą `raised`

- **Miejsce:** D37 („`--ts-state-selected` … jedna wartość dla pigułki zaznaczenia i tła wielu wyborów”), tabela `indicator` („aktywna pigułka z `--ts-state-selected*`”), D30 (macierz ton × wariant bez `raised`).
- **Dowód:** W14: zaznaczenie w segmentach i listach to pigułka wypukła `raised`; ToggleGroup domyślnie `variant='raised'` (`toggle-group.tsx:119`), a `active` to wariant dodatkowy. U10 w tabeli zmian dopisuje `raised` do słownika, ale D30 definiuje ton tylko dla `solid`, `soft`, `ghost`, `outline`.
- **Wpływ:** wykonawca może uznać płaskie `selected` za standard zaznaczenia (wbrew W14), a `raised` × ton zostaje bez reguły, którą i tak wymusza contracts.
- **Poprawka:** jedno zdanie w D37: „pigułka zaznaczenia domyślnie `raised` (W14); `selected` = wariant `active` i tło wielu wyborów”; w D30 zachowanie `raised` z tonem (np. jak `soft` albo tylko `neutral`).

#### M3. D43 zabrania liczb w TSX, a D29 wymaga `level` 1–4

- **Miejsce:** D43 („zakaz liczb poza `0`, `1`, `-1` w TSX komponentu”), D29 (`Heading` `level` 1–4 → `h1`–`h4`).
- **Wpływ:** `heading.tsx` nie przejdzie własnej reguły (literały typu `2 | 3 | 4` albo mapa poziomów), a „Dozwolone decyzje lokalne” tego nie obejmują, więc wykonawca musi wrócić po decyzję.
- **Poprawka:** reguła ignoruje pozycje typów (`TSLiteralType`) albo `aria-level`/`level` dostaje nazwany wyjątek; wpisać do „Dozwolone decyzje lokalne” albo do D43.

#### M4. F19 („każdy komponent responsywny”) bez strażnika

- **Miejsce:** nowe F19 (`:932`), D46.
- **Dowód:** U25: strażnik powstaje razem z regułą. `contracts.test.ts` sprawdza dziś „≥ 2 strony laboratorium”, nie obecność na `/screens/edges`.
- **Poprawka:** kontrakt: każdy komponent z `components/**` jest importowany przez `apps/docs/app/screens/edges/page.tsx` (albo jego sekcje). Komponenty E3 dostaną wtedy test skrajności automatycznie.

#### M5. Pomiar „przed” D31 w dwóch miejscach

- **Miejsce:** D31 („Kolejność w fazie 14: najpierw pomiar „przed”…”, `:713`) kontra faza 11 krok 4 („Pomiar „przed” D31”).
- **Wpływ:** fazy 12–13 zmieniają z-index popupów i dodają `overflow-y: auto` (przewijany popup może dostać własną warstwę), więc „przed” z fazy 11 i „po” z fazy 14 różnią się więcej niż samym D31.
- **Poprawka:** jedno miejsce: „przed” na początku fazy 14 (bezpośrednio przed zmianą D31) albo powtórzenie „przed” w fazie 14.

#### M6. Odłożone pozycje: rozjazd terminów i brak przypisania w masterplanie

- **Dowód:** „Deferred” ma G24 (RTL pełne, `DirectionProvider`) „gdy pojawi się konsument RTL” i osobno `direction.tsx` „E4”; to ta sama rzecz z dwoma terminami. N7 audytu prosi o przypisanie strażników i modułów z „Przenoszone” do etapów w masterplanie; masterplan E3/E4 ich nie wymienia (wirtualizacja Q12, `locale`, `direction.tsx`, G17, G22, G23, `--anchor-height`). Plan przenosi to do spec („Odłożone | tabela Deferred”), co wystarcza, jeśli kopia ma kolumny „kiedy” i „powód”. Strażnik v2 `tabular-nums` (spec „Przenoszone”) nie ma pozycji: D29 daje wariant, nie strażnika.
- **Poprawka:** jeden termin dla RTL/`direction.tsx`; w tabeli zmian spec dopisać, że „Odłożone” przejmuje kolumny „kiedy” i „powód”; `tabular-nums` (strażnik) przypisać albo jawnie odrzucić.

#### M7. Warianty przepisów dla komponentów E3/E4 bez konsumenta

- **Miejsce:** `surface` `skeleton` (D34), `textarea` z `field-sizing` w `control` `field` (D44), wariant `kbd` w `text` (D29).
- **Dowód:** „Out of scope” wyłącza „recepty specyficzne (keycap Kbd, … przepis paska postępu …)”, a pasek nieokreślony zostaje próbką `/foundation`. Skeleton i textarea to ten sam przypadek, ale dostają warianty przepisu.
- **Wpływ:** mały; niespójna granica zakresu i zmienne w B8 bez konsumenta.
- **Poprawka:** skeleton i textarea jak pasek: próbka na `/foundation` z wyjść silników, wariant przepisu z komponentem (Skeleton E4, Textarea E3). `kbd` może zostać, bo to typografia, ale wtedy dopisać to do D29 jako świadomy wyjątek od „keycap Kbd poza zakresem”.

#### M8. D41: typeahead w ToggleGroup zmienia zachowanie, o które nikt nie prosił

- **Miejsce:** D41 („litera przenosi fokus i wybór jak strzałka”).
- **Dowód:** F15 przenosi zachowania właściciela 1:1; typeahead w segmentach nie jest wśród nich, a APG nie wymaga go w grupie radiowej. W panelu laboratorium litera zmieni np. tryb jasny/ciemny.
- **Poprawka:** typeahead w `lib/collection.ts` jako opcja z testem vitest, włączony dla Tree i list w E3; ToggleGroup bierze z modułu tylko orientację, kierunek, Home/End i pomijanie wyłączonych.

#### M9. AGENTS.md aktualizowany dopiero w fazie 16

- **Miejsce:** Docelowe drzewo (`AGENTS.md # MODIFY (faza 16)`), faza 9.
- **Dowód:** od fazy 10 obowiązują nowe reguły sprzeczne z obecnym AGENTS.md: `style` z kluczami rejestru w TSX komponentu (AGENTS: „bez `className`, `style`”), `color-mix` i kolory systemowe w przepisach (AGENTS: „nigdy inne … kolory”), `@container` z px w CSS komponentu. Subagenci D–G czytają AGENTS.md jako pierwszy plik.
- **Poprawka:** AGENTS.md (model warstw) w fazie 9 razem ze spec; w fazie 16 tylko pułapki.

#### M10. D35: przewijany popup bez `scrollbar-gutter` traci symetrię

- **Miejsce:** D35 („bez `scrollbar-gutter` (W5: symetria popupu bez przewijania)”), D44 (dialog: `stable both-edges` dla symetrii).
- **Wpływ:** na Windows klasyczny pasek zajmuje miejsce po jednej stronie, więc przewijane menu ma nierówny padding; dialog i popup rozwiązują ten sam problem odwrotnie.
- **Poprawka:** zapisać świadomy wybór dla przewijanego popupu (asymetria tylko przy przewijaniu do czasu paska „lane” z F15) i dodać ten przypadek do checkpointu 3.

#### M11. Gate'y faz 12 i 14 nie mają grepa starych nazw

- **Dowód:** „Ryzyka” (`:1120`): „grep starych nazw w gate fazy 12 i 14”; gate'y faz 12 (`:994`) i 14 (`:1030`) go nie zawierają. Razem z P2.

### Sugestie

- **S1.** `Text` z `as="label"` (D29) wyprzedza `Field + Label` z F10 (E3). Jedno zdanie w „Deferred”: czy Label w E3 to `Text` `label`, czy osobny komponent; inaczej powstaną dwa źródła etykiety.
- **S2.** D45 nie ma testu, który zawiedzie przy złej implementacji (WebKit Playwrighta 26.6 jest powyżej progu 26.2); w „Strategii dowodu” uczciwiej napisać „decyzja dokumentu, bez testu”.
- **S3.** Gate fazy 9 „brak sprzeczności spec ↔ plan” zamienić na kontrolę wykonalną: lista pozycji tabeli zmian, każda odhaczona z numerem linii w spec.

## Zgodność z kontraktem: pokrycie audytu

| Pozycja audytu | Kiedy (audyt)       | W planie                                                                           | Ocena                        |
| -------------- | ------------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| G1, G2         | E2 teraz            | D35 (+ `VENDOR_VARIABLES`, test 900×360)                                           | pass                         |
| G12            | E2 teraz            | D32                                                                                | pass                         |
| G3, G16        | E3 start            | D30                                                                                | pass (P5: obrys powierzchni) |
| G4, G20        | E3 start            | D29                                                                                | pass                         |
| G5             | E3 start            | D37                                                                                | pass (M2)                    |
| G6             | E3 start            | D38                                                                                | pass                         |
| G7, N8         | E3 start            | D39                                                                                | pass (P3: U9)                |
| G8, N1         | E3 start            | D31                                                                                | pass (M1, M5)                |
| G9             | E3 start            | D40                                                                                | pass                         |
| G10, N4        | E3 start            | Deferred: E3 „Wycinek strony”, F1 w tabeli zmian                                   | pass, powód podany           |
| G11            | E3 start            | D36                                                                                | pass                         |
| G13, N2        | E3 start            | D33                                                                                | pass (P3: F7)                |
| G14            | E3 start            | D34                                                                                | pass dla pętli; toast: P1    |
| G15            | E3 start            | D42                                                                                | pass                         |
| G17            | E3 start            | Deferred: E3 Select/Combobox                                                       | pass, powód podany           |
| G18            | E3 start            | D41                                                                                | pass (M8)                    |
| G19, N6        | E3 start            | D43                                                                                | pass (M3)                    |
| G21            | E3 start            | DPR i zoom w D46; skalowanie tekstu Windows → E5                                   | pass, przesunięcie z powodem |
| G22            | później             | D38 dla kontrolek, wiersze → E3                                                    | pass                         |
| G23            | później             | Deferred E3                                                                        | pass                         |
| G24            | później             | D41 (strzałki), reszta Deferred                                                    | pass (M6)                    |
| G25            | E3 start            | B7 przy DPR 1,5 i otwartym popupie (faza 14); reszta E3                            | pass                         |
| F-A…F-M        | —                   | D29–D43                                                                            | pass                         |
| N3             | —                   | D30                                                                                | pass                         |
| N5 (`raised`)  | —                   | U10 w tabeli zmian                                                                 | pass (M2)                    |
| N7             | —                   | częściowo D41, D43, Deferred                                                       | M6                           |
| D-A…D-F        | decyzja właściciela | D29–D34, decyzje prowadzącego „na prośbę właściciela” (REPORTED, bez śladu w repo) | D-F: P1                      |

Nic z audytu nie zginęło; jedyna pozycja bez przypisania to strażnik v2 `tabular-nums` (M6).

## Zero legacy

- Oś `profile`: usunięcie w całym repo w fazie 12 (silniki, testy, panel, `docs/*.md`), bez aliasów; stary klucz w zapisie odpada, bo `readSaved` przepisuje tylko znane osie (`lib/theme.ts:55-75`, DIRECT), a `writeSaved` zapisuje już przefiltrowany rekord. Test z rekordem zawierającym `profile` jest w planie. **pass.**
- Przemianowane wyjścia i atrybuty (`hit`, `layer-*`, `indicator-active*`, `danger`, sloty `header`/`body`, `nextOption`, `MenuItemVariant`): lista w „Forbidden” jest kompletna, ale kolejność faz zostawia stare nazwy u konsumentów na 1–2 fazy. **fail (P2).**
- D8 w części 1 zostawia sprzeczny opis. **M1.**

## Zakres i YAGNI

- Komponenty E3 nie powstają; `Text` i `Heading` mają uzasadnienie (konsument: przepis `text`, Dialog, Popover) i zmianę F10/F12 w tabeli. **pass.**
- Wyprzedzenie E3/E4: wariant `toast` z wejściem (P1), `skeleton` i `textarea` (M7), typeahead w ToggleGroup (M8).
- Geometria D38 i `--ts-i-value` mają tylko próbki `/foundation`; to zgodne z celem „fundament pod rodziny” i z audytem, a liczby oceni właściciel. **pass.**

## Zasady właściciela

| Zasada                             | Wynik                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Biblioteka = skrajne przypadki     | pass: D46, `/screens/edges`, `edges.spec.ts`, bez `test.fail`/`skip` „jeszcze nie działa”                |
| Każdy komponent responsywny        | pass w E2; brak strażnika dla przyszłych komponentów (M4)                                                |
| Zero komentarzy w kodzie           | pass: „Forbidden” i reguły briefów                                                                       |
| Symetria                           | częściowo: M10                                                                                           |
| Bez obramowań w dużych układach    | fail: P5; obrysy pola i toru w `forced-colors` są uzasadnione dostępnością, ale wymagają wpisu w W9 (P3) |
| Pigułka wypukła, bez wciśnięcia    | bez wciśnięcia: pass; wypukła: niejasne (M2)                                                             |
| Zero animacji wejścia popupu (W16) | fail: P1                                                                                                 |

## Fazy i warunki wyjścia

- Fazy 9–16 mają gate'y; fazy 10, 11, 13, 14 mają obserwowalne kontrole (fixture, testy z listą asercji, plik pomiaru). Faza 9 ma gate niewykonalny wprost (S3). Fazy 12–14 mają gate'y sprzeczne z kolejnością zmian nazw (P2).
- Checkpoint 3: P4.

## Streszczenie dla właściciela

- Punkty 1–5, 8–12 zgadzają się z treścią planu. P. 7 obiecuje więcej niż D38. Brakuje zmian reguł właściciela (P6).

## Wykonane kontrole

```text
Odczyt: docs/plans/e2-foundation.md (1–300, 640–1152), docs/specification.md (całość), AGENTS.md, docs/structure.md,
  docs/reviews/e2-foundation-gaps.md (całość), docs/research/e2-foundation-2026.md (nagłówki, tabela odpowiedzi, §10, §14, D-F),
  docs/plans/masterplan.md (całość), git diff masterplan.
Kod (DIRECT): lib/theme.ts:1-95 (readSaved, AXES z profile), recipes/indicator.css (warianty hover/active/raised, will-change),
  grep konsumentów nazw zmienianych w fazie 12: control.css:38-39, surface.css:3/86/137/148/155, indicator.css:26-27, row.css:52;
  toggle-group.tsx:30,119 (domyślnie raised); packages/tessera/docs/input.md.
Pamięć właściciela: zero-animacji-wejscia-poza-dialogiem.md, wlasciciel-niedostepny-decyzje-astra-opus.md.
```

## Niewykonane lub nierozstrzygające kontrole

- Nie sprawdzałem poprawności mechanizmów CSS i wsparcia przeglądarek (inna oś recenzji).
- Delegacja decyzji D-A…D-F przez właściciela: REPORTED (plan, brief), bez śladu w repo.
- Czy `next dev` laboratorium jest osiągalny z telefonu w sieci lokalnej: nie sprawdzałem.

## Zalecany następny krok

1. Poprawić P1–P6 i M1–M3 w planie (koszt: kilkanaście zdań, bez zmiany architektury).
2. Runda kontrolna tylko dla P1, P2, P3 (zakres zmian w planie i tabeli spec).
3. Pytania do właściciela w czacie, po jednym: wjazd toastu (W16), obrys powierzchni z tonem (W14), obrys pola w błędzie (W9).
