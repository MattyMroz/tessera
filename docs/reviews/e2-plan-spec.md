---
kind: review
status: fail
reviewed-state: docs/plans/e2-foundation.md (niezacommitowany, worktree .worktrees/e2, branch feat/e2-foundation @ 378bcee)
date: 2026-10-31
---

# Review: plan E2 (fundament Tessery v3) względem specyfikacji i standardu planowania

## Zakres

- przedmiot: `docs/plans/e2-foundation.md` (cały plan).
- baseline: working tree `.worktrees/e2`; spec, masterplan, structure, AGENTS.md, `research/e2-facts-*.md`, `decisions/e0-*.md`, `plans/e1-repo.md` w stanie z 31.10.
- authority: `docs/specification.md` (jedyne źródło decyzji), potem `masterplan.md`, `structure.md`, decyzje E0. Fakty od prowadzącego: właściciel 31.10 chce „najpierw podstawę wszystkich podstaw”, sliding „jak na mangashift.com (lekki bounce)”.
- ryzyka: ciche zmiany wymagań, decyzje zostawione wykonawcy, gate'y niezdolne wykryć porażki, rozjazd planu z drzewem i strażnikiem.
- poza review: jakość wizualna (ocenia właściciel), poprawność wersji bibliotek (bez sieci), wynik `bun run check` (nie uruchamiany; plan podaje 277 testów, REPORTED).

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** plan ma jedenaście uwag poważnych, w tym trzy ciche zmiany spec bez wpisu w fazie 0 (D14 wobec U32, D6 wobec decyzji E0 i F6, stany wobec N8) i kilka miejsc, w których świeży wykonawca musi sam podjąć decyzję materialną: skąd silnik `shape` bierze promień i wcięcie na poziomie N, której drabinki stanów użyć (v7 czy W8), jak strony silników rysują próbki przy włączonym lincie konsumenta. Poprawki są lokalne w dokumentach (plan i faza 0), bez zmiany architektury. Struktura planu, graf, kolejność faz i strategia dowodu są dobre.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. D14 przeczy U32 i tabeli „Przenoszone z v2”, a faza 0 tego nie zmienia

- miejsce: „Decyzje planu” D14 (plan:114); faza 0, działanie 1 (plan:379).
- dowód: spec:38 U32 „źródłem wartości silników jest TypeScript, jak w v2” [W, 31.10]; spec:114 „Formuła kształtu z testami `lib/shape.ts` → jedyne źródło formuły silnika `shape`”. Plan:114 „Wartości silników poza kolorem: CSS jest jedynym źródłem; oczekiwane liczby siedzą w testach przeglądarkowych, nie w drugiej implementacji TS”. Faza 0 zmienia tylko N15, W20, W8 i U31.
- wpływ: plan po cichu odwraca ustalenie właściciela. AGENTS.md:64 każe przy sprzeczności ze spec zgłosić konflikt, a nie wybierać wygodniejszą wersję. Spec sama jest tu niejednoznaczna (U9 dopuszcza wyprowadzenie „w buildzie albo w CSS”), więc tym bardziej rozstrzyga właściciel.
- minimalna reakcja: oznaczyć D14 jako zmianę U32 i wiersza „Formuła kształtu” i dopisać ją do fazy 0 po akceptacji właściciela. Druga droga: zostawić TS jako źródło wartości (jak `color`) i z niego generować CSS.

#### P2. D6 zmienia znaczenie `elastic` z decyzji E0 na podstawie interpretacji, którą fakty wskazały jako otwartą, i gasi odbicie od ściany z W14 i W20

- miejsce: D6 (plan:106), D7 (plan:107), algorytm slidingu (plan:286-288).
- dowód:
  - `decisions/e0-motion.md:11,18` (decyzja właściciela 31.10): `elastic` to „bouncy, domyślny” z parametrami v2: 220 ms, przestrzał 0,1 × wysokość, „przy ścianie rodzica przód się zatrzymuje, pigułka się zgniata i odbija”.
  - `e2-facts-motion.md:274` (Niewiadome 1): nie wiadomo, czy „lekki bounce” to wdrożona strona (sprężyna Motion), czy lokalna strona na v2 (`elastic`); fakty każą zapytać właściciela.
  - `e2-facts-motion.md:104`: sprężyna 420/36 ma szczyt 1,00312, czyli 0,3 px przestrzału na 100 px.
- wpływ: przy przestrzale 0,3 % przycięcie do ściany z D7 praktycznie nigdy się nie włączy (padding rodzica to kilka px), więc squishy i bounce z W20 (spec:103) i W14 (spec:99) nie wystąpią w trybie domyślnym. `e0-motion.md` nie jest aktualizowany, a faza 0 dopisuje D6 tylko do W20. Pierwszy raz właściciel oceni ruch dopiero w fazie 8, po pełnej recenzji z fazy 7.
- minimalna reakcja: potwierdzić z właścicielem, którą stronę miał na myśli, zanim powstanie `lib/indicator/spring.ts`; zaktualizować `e0-motion.md` albo D6. Alternatywnie dodać krótki checkpoint ruchu po fazie 5 (ToggleGroup w laboratorium, oba warianty obok siebie: sprężyna strony i `elastic` v2).

#### P3. Parametry ruchu w JS tworzą drugie źródło obok silnika `motion`, a F6 nie jest zmienione

- miejsce: D6 („JS czyta atrybut, nie `getComputedStyle`”, plan:106), algorytm slidingu (plan:280-292), D8 (plan:108).
- dowód: spec:133 F6: silnik `motion` daje czasy i krzywe `cubic-bezier`, „przepisy wybierają z nich, nie definiują własnych czasów. Sprężyny dopiero po zniesieniu Q5”. Spec I2: „jedna formuła, jedno miejsce wartości”. Plan każe JS-owi brać tryb z atrybutu, więc 150 ms, `cubic-bezier(0.2,0,0,1)`, 50 ms chowania, 100 ms trzymania i sprężynę 420/36 trzeba wpisać w `lib/` na stałe, obok `--motion-duration-*` z tabeli silnika (plan:233).
- wpływ: dwa źródła tej samej wartości (I2), a strojenie w motywie nie dotrze do slidingu. Sprężyna łamie dosłowne brzmienie F6, mimo że rozsądnie omija Q5 (bez `linear()`).
- minimalna reakcja: w fazie 0 zmienić F6 (sprężyna spróbkowana do klatek jest dozwolona). Ustalić jedno źródło liczb ruchu: albo JS czyta wyjścia silnika raz na zmianę motywu (to nie jest pomiar kształtu z Q7), albo silnik `motion` w CSS powstaje z tych samych stałych TS, z których korzysta `lib/indicator`.

#### P4. Drabinka stanów ma trzy niezgodne źródła; kolor pigułki nie jest określony, a W14 kłóci się z W8

- miejsce: D2 (plan:102), D3 (plan:103), tabela wyjść `color` (`fill-1..4`, plan:231) i `state` (plan:238), przepis `indicator` (plan:258).
- dowód:
  - D2 bierze „nazwy ról i wartości” z makiety v7. Makieta ma własną drabinkę stanów: `TINT_ALPHA = { light: [0.1, 0.16, 0.24], dark: [0.18, 0.24, 0.3] }` (`colors-v7-opus-a-tokens.js:196-198`) i rampę Apple `fill` / `secondary-fill` / `tertiary-fill` / `quaternary-fill`, opisaną jako „Pressed / Hovered / Control at rest / Hover of rows” (`:386-389`). Wyłączenie ma tam 40 % w jasnym i 50 % w ciemnym (`:336`).
  - D3 i W8 (spec:92) dają akcent 8/16/24 % i wyłączenie 40 %.
  - `e2-facts-shape.md:323` każe zrobić „jedną drabinkę zamiast równoległych”.
  - W14 (spec:99) wymaga pigułki hover ≥ 10/12 %, a W8 daje w jasnym hover 7 %.
- wpływ: wykonawca jednostki A przeniesie z v7 drabinkę sprzeczną z D3. Silnik `color` dostaje `fill-1..4` równolegle do `state.fill-*`, czyli dwie drabinki, a nie jedną. Przepis `indicator` nie mówi, którego wyjścia użyć. Na stronie „Nakładki” pigułka z drabinki W8 nie spełni W14 w trybie jasnym.
- minimalna reakcja: w D2 wyłączyć z v7 wszystko, co dotyczy stanów (tint-container, fills, disabled), albo usunąć `fill-1..4` z silnika `color`. Nazwać wyjście pigułki (np. `state-indicator-hover`) z wartością zgodną z W14 i w fazie 0 zapisać relację W8 ↔ W14. W fazie 0 dopisać też do W8 rozszerzenia z D3 („czysty czarny/biały”, wyłączenie 40 %).

#### P5. Przepływ danych promienia koncentrycznego nie jest rozstrzygnięty

- miejsce: „Promień koncentryczny (D4, sposób B)” (plan:243), tabela `shape` (plan:236), faza 3, działanie 2 (plan:427).
- dowód: plan:243 mówi „`--_shape-c1..c4` = `max(R − inset, 4px)`”, ale nie definiuje R ani inset na poziomie N. `e0-concentric.md:22` wymaga, żeby poziom N czytał `--c{N-1}` od rodzica. Plan:243 mówi jednak, że element z `data-surface` „dostaje promień z `--shape-surface` swojego poziomu”, a faza 3 definiuje `--shape-surface` jako `REF + spread × inset`. Wartości `spread` (1 i 0,5 w v2, `e2-facts-shape.md:115`) nie są przypisane do żadnej powierzchni. Wejścia silnika `shape` to `data-corners`, `data-curve`, `data-surface` i `--in-radius` (plan:236); wcięcia nie ma wśród nich, a padding powierzchni ustawia przepis `surface`, czyli warstwa wyżej.
- wpływ: to jest test „przycisk w popupie” całego E2 (S1). Wykonawca musi sam rozstrzygnąć, czy zagnieżdżona karta ma promień `c{N-1}`, czy własny spread, i jak padding z przepisu dociera do silnika: przez `--in-*` ustawiane w przepisie, czego strażnik dziś nie przewiduje (css-layers.ts:172), czy przez wyjście `space` wybrane atrybutem. To decyzja materialna.
- minimalna reakcja: rozpisać w planie wzór poziomu N: R_N = c\_{N−1} (korzeń: `REF + spread × inset`), inset_N = wyjście `space` wybrane atrybutem powierzchni (np. `data-inset="inset|group|card"`), spread przypisany do wariantu powierzchni. Oczekiwane liczby testu zapisać według tego wzoru.

#### P6. Materiał `translucent` łamie Q14 na ekranie „Nakładki” i na latającym tooltipie

- miejsce: faza 3, `depth` (plan:434), Tooltip `surface (overlay)` (plan:273), ekran „Nakładki” (plan:325-326).
- dowód: spec:170 Q14: „na elementach ruchomych ≤ 10 px; najwyżej 2 `backdrop-filter` widoczne naraz”. Plan:434 daje blur 24 px dla poziomów `overlay` i `modal` i wpisuje w nawias „Q14: ≤ 2 naraz”, ale bez mechanizmu. Tooltip ma poziom `overlay` i przelatuje między triggerami (jest elementem ruchomym). Ekran ma ścieżkę Popover → Menu → podmenu, czyli 3 popupy `overlay` naraz, a w dialogu modal i menu.
- wpływ: przy `material: translucent` ekran z planu narusza twardą regułę wydajności, a żaden gate tego nie liczy.
- minimalna reakcja: rozstrzygnąć w silniku `depth`: tooltip zawsze `solid`, a blur dostaje tylko najwyższy otwarty popup (np. zagnieżdżony popup `overlay` bez `backdrop-filter`) albo tylko `modal` i pierwszy popup. Dodać licznik `backdrop-filter` do `motion-trace.spec.ts` albo `engines.spec.ts`.

#### P7. F12 (≥ 2 strony laboratorium) jest niespełnialny w zaprojektowanym laboratorium

- miejsce: warunek końcowy (plan:28), „Laboratorium” (plan:308-328), faza 6, działanie 6.
- dowód: spec:142 F12. Laboratorium planu ma: panel w layoucie (ToggleGroup i Menu), `/` (wszystkie 7 komponentów), `/engines/[engine]` (próbki tokenów) i `/recipes` („bez komponentów”, plan:468). Popover, Dialog, Tooltip i Input (Button zależnie od panelu) są więc tylko na `/`. `structure.md:76-77` przewiduje `app/components/` (strona komponentu) i `app/screens/` (ekrany testowe), a plan ich nie tworzy i nie podaje powodu.
- wpływ: test pokrycia oblewa albo wykonawca dopisuje strony na ślepo. Rozjazd z `structure.md` bez decyzji.
- minimalna reakcja: dodać `app/components/[name]/page.tsx` (kilka sytuacji na komponent, jak w structure.md) i ekran pod `app/screens/overlays/`. Jeśli `/` zostaje ekranem, zapisać to jako zmianę structure.md.

#### P8. Strony silników muszą rysować wygląd, a plan włącza lint konsumenta, który to blokuje

- miejsce: D16 (plan:116), `/engines/[engine]` (plan:315), F1 (próbki wszystkich wyjść).
- dowód: `src/eslint/no-local-appearance.ts:21-25` i `style-policy.ts:20-30,97-100` odrzucają każdy styl spoza listy właściwości układu (`background`, `border-radius`, `box-shadow`, `color`…). U19 (spec:69) i U20 (spec:70): laboratorium zbudowane wyłącznie z Tessery, bez własnego CSS. Próbka koloru, cienia albo promienia wymaga jednej z tych właściwości.
- wpływ: wykonawca musi wybrać między `eslint-disable`, stylem inline, własnym CSS w laboratorium albo nowym przepisem „próbka” (to szósty przepis, czyli zmiana U10 i materialna zmiana planu, plan:598). Plan tego nie rozstrzyga.
- minimalna reakcja: zdecydować w planie, np. strony silników rysują próbki gołymi elementami z `data-recipe` istniejących przepisów (surface, control) plus jeden nazwany wyjątek lintu w `apps/docs/app/engines/**` z powodem. Druga droga: wariant przepisu `surface` dla próbki.

#### P9. Włączenie wtyczki ESLint konsumenta w `apps/docs` psuje `bun run check` na świeżym klonie

- miejsce: D16 (plan:116), impact scan „Reguły ESLint konsumenta” (plan:203), drzewo, `eslint.config.js` MODIFY (plan:369).
- dowód: `package.json` (korzeń): `"check": "bun run typecheck && bun run lint && bun run build && bunx vitest run"`, więc lint idzie przed buildem. `packages/tessera/package.json`: `./eslint` → `default: ./dist/eslint/index.js`, a `dist/` jest ignorowany. `plans/e1-repo.md:48`: „wtyczka ESLint konsumenta włączona w `apps/docs` (dziś import z `dist` przed buildem psułby lint na świeżym klonie)”. Plan:203 odpowiada tylko „reguły zielone lokalnie”.
- wpływ: S7 (spec:275) i hook pre-push oblewają na świeżym klonie. Problem przekazany z E1 zostaje niedomknięty.
- minimalna reakcja: rozstrzygnąć w planie, np. lint po buildzie w `check`, korzeniowy `eslint.config.js` importujący regułę ze `src` przez loader TS albo osobny krok `lint` w `apps/docs` po `build`. Dodać kontrolę „świeży klon” do gate'u fazy 1 albo 6.

#### P10. Faza 0 przenosi krok 8 E1 (próba dwóch repo, F13) do E5 bez decyzji i uzasadnienia

- miejsce: faza 0, działanie 2 (plan:380).
- dowód: `masterplan.md:36`: warunek wyjścia E1 zawiera „próba (a) z E0: desktop i strona MangaShift widzą zmianę w paczce z osobnego repo (F13)”. `masterplan.md:72` nazywa to „największą niewiadomą”. Spec:274 S6 mówi „pomiar w E0, potem test przy migracji”. W „Decyzjach planu” nie ma wpisu D#, a w planie nie ma powodu ani odniesienia do słów właściciela.
- wpływ: zmiana warunku wyjścia poprzedniego etapu i odłożenie najdroższej niewiadomej na koniec, czyli powtórka błędu opisanego w historii masterplanu (`masterplan.md:105`). Bez dokumentu wykonawca nie wie, czy ma do tego zgodę.
- minimalna reakcja: dodać decyzję D17 ze źródłem (słowa właściciela, data) i skutkiem dla S6 i ryzyk masterplanu albo usunąć to działanie z fazy 0.

#### P11. Mechanizm stanów kontrolki jest cichą zmianą N8 i dopisuje wyjątek do Q2

- miejsce: „Stan na kontrolce” (plan:261).
- dowód: spec:289 N8: „nakładka z animowaną `opacity` (start w E2, zgodna z Q2) czy krok rampy koloru”. Spec:158 Q2: lista wyjątków ruchu „ma maleć”. Plan:261 startuje odwrotnie: podmiana `background-color` z przejściem 100 ms jako nazwany wyjątek.
- wpływ: E2 zaczyna od wariantu niezgodnego z Q2, który spec wskazała jako drugi, i powiększa listę wyjątków. Nie ma decyzji D# ani zmiany N8 w fazie 0.
- minimalna reakcja: albo start zgodny z N8 (nakładka `::after` w przepisie `control` z `opacity`, kolor z `state`), albo zapisać odstępstwo jako D# i zmianę N8 w fazie 0.

### Mniejsze

#### M1. Strażnik `styles/` nie przepuści `tailwind.css` ani importu fontsource; fazy 1 tego nie planują

- miejsce: faza 1 (plan:393-397), faza 2, działanie 2 (plan:412), D16.
- dowód: `css-layers.ts:203-208` (`checkStyles`): w `styles/` dozwolone są tylko `@layer` i `@import` do `engines/`, `recipes/` i `components/`, a `checkFor` stosuje tę samą regułę do każdego pliku w `styles/` (`:218`). `@font-face` w silniku oblewa też na „engines declare only variables” (`:197`). Lokalna adaptacja pozwala tylko na słowa kluczowe (plan:166).
- wpływ: gate fazy 2 („cztery silniki w dist, strażnik zielony”) oblewa. Wykonawca zmienia politykę strażnika bez kontraktu.
- minimalna reakcja: dopisać do fazy 1 zasady dla `styles/tailwind.css` (`@theme inline` z wyjściami silników), import paczek fontów w `tessera.css` i deskryptory `@font-face` w `engines/type/`, każde z fixture `bad/`.

#### M2. Brak przelotu podmenu (W16) i ryzyko dwóch mechanizmów przelotu

- miejsce: komponenty (plan:270-273), faza 5, działanie 3, `behavior.spec.ts` (plan:497-500).
- dowód: spec:101 W16 wymienia przelot „menubar, podmenu, tooltip w grupie” jako „jeden wspólny mechanizm”. Plan przewiduje przelot tylko dla tooltipa, a `lib/popup-flight.ts` dodaje warunkowo.
- wpływ: podmenu bez przelotu, możliwe dwa mechanizmy (Base UI dla tooltipa, własny dla innych).
- minimalna reakcja: dopisać przelot między podmenu do zakresu i testów albo jawnie przenieść go do E4 razem z menubarem. Ustalić jeden mechanizm dla obu przypadków.

#### M3. Części bez przepisu: etykieta grupy menu, separator, tytuł i opis dialogu, tekst tooltipa

- miejsce: tabela przepisów (plan:253-259), komponenty (plan:270-273).
- dowód: W18 (spec:104): nagłówki grup menu wielkimi szarymi literami. F7 i I1 zabraniają wyglądu w komponencie. `row` ma tylko sloty `lead`, `label`, `trail`, a `surface` tylko `header`, `body`, `footer`, bez typografii.
- wpływ: wykonawca dopisuje warianty lub sloty, czego lokalna adaptacja (plan:164-167) nie obejmuje.
- minimalna reakcja: dodać do tabeli `row` wariant `group-label` i slot lub wariant `separator`, a do `surface` typografię slotu `header`. Albo pozwolić na nowe warianty i sloty istniejących przepisów jako decyzję lokalną.

#### M4. Neon nie ma konsumenta w E2, a checkpoint 1 każe go oceniać

- miejsce: `depth.glow` (plan:237,435), przepisy (plan:255-259), checkpoint 1 (plan:455).
- dowód: W11 (spec:95) mówi o poświacie na primary i fokusie. Żaden przepis w tabeli nie czyta `--depth-glow`.
- wpływ: przełącznik neonu w panelu niczego nie zmienia poza stroną silnika.
- minimalna reakcja: `control` `solid` z akcentem kolorowym i przepis `focus` czytają `--depth-glow`. Albo usunąć neon z checkpointu 1.

#### M5. Panel z U31 jest niepełny w opisie

- miejsce: „Rezultat użytkownika” (plan:18), checkpoint 1, D13.
- dowód: U31 (spec:71) wymienia profil typograficzny i każde wejście silnika, a D13 ma osie `size` i `profile`. Listy w rezultacie i checkpoincie ich nie mają. Fragmentu „zapisuje wybór jako motyw” plan nie adresuje (D12 zapisuje warstwę użytkownika).
- minimalna reakcja: dopisać `size` i `profile` do panelu i jedno zdanie, jak panel realizuje „zapis jako motyw” (albo że w E2 to zapis użytkownika).

#### M6. F3 i F4 nie są uzgodnione z tabelą wyjść

- dowód: F3 (spec:130) każe silnikowi `size` dawać padding. Plan daje padding w `shape` (`control-side`, plan:236), co ma sens, bo padding zależy od promienia, ale spec nie jest zmieniana. F4 (spec:131) wymaga „warstwy” per poziom, a plan ma 3 warstwy dla 5 poziomów.
- minimalna reakcja: dopisać do fazy 0 korektę F3 (padding w `shape`) i doprecyzowanie F4.

#### M7. Pigułki jako warstwy długiego życia (Q4, B7) nie są opisane

- dowód: spec:160 Q4 i spec:186 B7 ≤ 12. Plan nie mówi, czy element jazdy ma stałe `will-change`. Panel (około 11 osi, jeśli każda jest ToggleGroup z dwiema pigułkami) plus ekran przekroczy 12 warstw na każdej stronie laboratorium.
- minimalna reakcja: zapisać decyzję (warstwa stała albo tylko w czasie ruchu) i układ panelu, który nie mnoży pigułek (np. Menu zamiast ToggleGroup dla długich list).

#### M8. Pomiar DOM bez strażnika listy plików

- dowód: spec:163 Q7 („na nazwanej liście plików”), `structure.md:95` („eslint z białą listą plików”). Plan dodaje pomiar `offset*` w `lib/indicator` (plan:282,295), a strażnika nie planuje.
- minimalna reakcja: plik listy i reguła lub test w fazie 1 albo 5.

#### M9. Kontrole ze „Strategii dowodu” nie mają miejsca w fazach

- dowód: plan:551-552 (licznik renderów B4, anty-FOUC w Playwright). W żadnej fazie nie ma tych testów, a lista plików `apps/docs/tests/` (plan:317) ma tylko `engines`, `behavior` i `motion-trace`.
- minimalna reakcja: przypisać oba testy do fazy 3 albo 6 i do drzewa.

#### M10. Brak nagrania ruchu w kontrakcie wyniku (U24)

- dowód: spec:79 U24 i `masterplan.md:53`: przy ruchu nagranie obok poprzedniej wersji. Plan:611-621 tego nie wymaga, a checkpoint 2 przerzuca porównanie na właściciela.
- minimalna reakcja: dodać nagranie (laboratorium i strona mangashift.com lub v2) do checkpointu 2 i kontraktu wyniku.

#### M11. Części F10 i F15 ani w zakresie, ani poza nim

- dowód: F10 (spec:140): „baza menu (Dropdown, Context)”, „Dialog (z Alert Dialog i Confirm)”. F15 (spec:146): pasek przewijania „lane”. Lista poza zakresem (plan:139) ich nie wymienia.
- minimalna reakcja: dopisać do „Out of scope” z etapem docelowym.

#### M12. Spójność wewnętrzna

- jednostka C „po fazie 5” (plan:538), a jej praca (plan:497) wymaga komponentów i ekranu z fazy 6;
- „pozostałe 13 komponentów” (plan:37) wobec `masterplan.md:38` („14”) i nazwa planu `e2-vertical-slice.md` (`masterplan.md:63`): faza 0 zmienia tylko wiersz E2;
- `structure.md` i `AGENTS.md` są w zakresie (plan:134), ale żadna faza ich nie aktualizuje;
- D2 mówi „nazwy z v7”, a tabela ma inne (`accent*` zamiast v7 `tint*`, `fill-1..4` zamiast `fill`/`secondary-fill`/…, `background-secondary` zamiast `secondary-background`);
- `structure.md:45` przewiduje projekt przeglądarkowy vitest w paczce, a D15 wybiera Playwright w `apps/docs`; zmiana dobra, ale nie wpisana do fazy 0.

#### M13. Q13 i Q17 bez pokrycia w E2

- dowód: spec:169 Q13 (testy na wersji skompilowanej i nieskompilowanej). Plan testuje komponenty tylko na `dist`. Spec:203 Q17 (klawiatura): `behavior.spec.ts` nie ma scenariuszy klawiatury (roving focus ToggleGroup, nawigacja w menu).
- minimalna reakcja: dodać 2–3 scenariusze klawiatury do `behavior.spec.ts`; Q13 jawnie odłożyć albo pokryć.

### Sugestie

- **S1.** D12 używa klucza `tessera-appearance`, który v2 zapisywała jako `{ version: 2 }` (`e2-facts-color.md:250`), a v3 zaczyna od wersji 1. Na `localhost:3000`, gdzie wcześniej działała strona na v2, laboratorium trafi na rekord „nowszy” niż własny. Prościej użyć nowego klucza albo zapisać, że rekord o innej wersji jest ignorowany.
- **S2.** Checkpoint ruchu przed fazą 7 (ToggleGroup i menu po fazie 6, przed trzema recenzentami) obniży koszt rundy, jeśli właściciel odrzuci sprężynę (łączy się z P2).

## Zgodność z kontraktem

| Wymaganie                             | Stan                                                                                          | Dowód               |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| U9 kształt silnika                    | pass                                                                                          | plan:212-223        |
| U10 pięć przepisów                    | pass (zagrożone przez P8, M3)                                                                 | plan:253-259        |
| U13 kaskada 4 warstw                  | pass                                                                                          | D12                 |
| U15 `tailwind.css`                    | pass co do treści; strażnik (M1)                                                              | D16                 |
| U30 docs `.md`                        | pass; `llms.txt` jawnie poza zakresem                                                         | plan:131,144        |
| U31 panel                             | częściowo (M5)                                                                                | plan:18             |
| U32 TS źródłem wartości               | **fail** (P1)                                                                                 | D14                 |
| W1 skala                              | pass                                                                                          | plan:426            |
| W3 squircle i fallback                | pass                                                                                          | D5                  |
| W4 padding optyczny                   | pass                                                                                          | faza 4, gate        |
| W6 paleta                             | pass co do nazw Apple; konflikt stanów (P4)                                                   | D2                  |
| W8 drabinka                           | **fail** wobec v7 (P4)                                                                        | D3                  |
| W9 pola z drabinki                    | pass                                                                                          | D11                 |
| W10 szkło                             | pass co do miejsc; Q14 (P6)                                                                   | plan:434            |
| W11 neon                              | częściowo: orby jawnie w E3, mini bez konsumenta (M4)                                         | plan:143            |
| W14 sliding, hover ≥ 10/12 %, odbicie | **fail** (P2, P4)                                                                             | D6, D7              |
| W16 przelot podmenu                   | brak (M2)                                                                                     | plan:270-273        |
| W18 nagłówki grup menu                | brak przepisu (M3)                                                                            | —                   |
| W20 squishy, bounce, jeden silnik     | **fail** co do bounce (P2)                                                                    | D6                  |
| F1 strony silników                    | zagrożone (P8)                                                                                | plan:315            |
| F2 promień koncentryczny              | niedookreślone (P5)                                                                           | plan:243            |
| F3 padding w `size`                   | rozjazd (M6)                                                                                  | plan:235            |
| F5 rampy w buildzie                   | pass (interpretacja: generator + plik + test)                                                 | D2                  |
| F6 motion ≤ 10 wyjść, bez sprężyn     | **fail** (P3)                                                                                 | D6                  |
| F7, F8, I1 komponenty bez wyglądu     | pass                                                                                          | „Forbidden”         |
| F9 przycisk w popupie                 | pass co do celu; zależy od P5                                                                 | plan:325-328        |
| F12 ≥ 2 strony                        | **fail** (P7)                                                                                 | plan:308-319        |
| F15 menu, sliding, tooltipy           | pass dla E2; lane i menubar poza zakresem (M11)                                               | plan:480,497-500    |
| Q2–Q5 ruch                            | pass co do techniki; wyjątek stanów (P11)                                                     | D6, D7              |
| Q6, Q8                                | pass                                                                                          | plan:447            |
| Q7 lista plików pomiaru               | brak strażnika (M8)                                                                           | plan:295            |
| Q14 blur                              | **fail** (P6)                                                                                 | plan:434            |
| Q15 WebKit na ekranach                | odłożone do E3 zgodnie z `masterplan.md:38`                                                   | D15                 |
| Q16 fallback                          | pass                                                                                          | D5                  |
| B1 trace                              | pass                                                                                          | faza 6, działanie 5 |
| B8 ≤ 250                              | pass (szacunek 126, test)                                                                     | plan:241            |
| N7, N15 (wyjście E2 z masterplanu)    | pass                                                                                          | D10, D11            |
| N8 start nakładką z `opacity`         | **fail** (P11)                                                                                | plan:261            |
| E1 „Przekazane do E2”                 | częściowo: ESLint w `apps/docs` niedomknięty (P9), „jedna lista właściwości układu” pominięta | `e1-repo.md:47-49`  |

## Pytania 1–12 ze skilla `planning`

01. Jeden rezultat: tak (fundament, jeden model mentalny); zakres duży, ale spójny.
02. Stan aktualny z dowodami: tak, pointery do strażnika sprawdzone (`css-layers.ts:24-58,160-221,186-201,168-174`); pominięty `checkStyles` (M1).
03. Decyzje materialne rozstrzygnięte: nie (P4, P5, P8, P9).
04. Wymagania niezmienione dla wygody: nie (P1, P3, P10, P11).
05. Właściciel i source of truth: niejednoznaczne dla stanów (P4) i liczb ruchu (P3).
06. Impact scan: brak `checkStyles` (M1) i świeżego klonu (P9).
07. Kolejność: poprawna według grafu; jednostka C źle osadzona (M12).
08. Zakres i zakazy: jasne, z lukami w F10 i F15 (M11).
09. Weryfikacja wykrywa zły rezultat: częściowo; brak liczników Q14 i B4 w fazach (P6, M9).
10. Checkpoint przed fan-outem: checkpoint 1 dobrze ustawiony; ruch dopiero po recenzji (P2, S2).
11. Prostsza droga: nie znalazłem materialnie prostszej dla tego zakresu.
12. Start bez decyzji za autora: nie (P4, P5, P8, P9).

## Wykonane kontrole

```text
odczyt w całości: plan, specification.md, masterplan.md, structure.md, AGENTS.md,
  e2-facts-color.md, e2-facts-shape.md, e2-facts-motion.md, e0-motion.md, e0-concentric.md,
  e1-repo.md (sekcje kroków i „Przekazane do E2”)
odczyt kodu: packages/tessera/test/guards/css-layers.ts (cały), src/eslint/no-local-appearance.ts,
  src/eslint/style-policy.ts, package.json (korzeń, paczka, apps/docs), eslint.config.js
odczyt makiety: MangaShift docs/plans/ui-kit/prototypes/colors-v7-opus-a-tokens.js (:196-269, role :371-404, :336)
```

## Niewykonane lub nierozstrzygające kontrole

- `bun run check` i liczba 277 testów: nie uruchamiane (REPORTED przez plan).
- „Base UI 1.9.0 najnowsze”: bez sieci, niesprawdzone.
- Czy Base UI pozycjonuje przez `transform`: plan słusznie odkłada to do próby w fazie 5.

## Ograniczenia review

- Ocena dotyczy dokumentu, nie wykonania. Wagi P1–P11 są osądem recenzenta; ostateczną klasyfikację robi prowadzący (arbiter).
- Słowa właściciela z 31.10 znam tylko ze streszczenia prowadzącego.

## Zalecany następny krok

Poprawić plan w miejscach P1–P11 (głównie decyzje D2, D3, D6, D14, D16, wzór koncentryczny, strony laboratorium i faza 0). Z właścicielem rozstrzygnąć: U32 wobec D14, znaczenie „lekkiego bounce” (D6 wobec `e0-motion.md`), przeniesienie kroku 8 E1. Potem runda kontrolna recenzji.
