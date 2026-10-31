---
kind: review
status: fail
reviewed-state: tmp/tessera-v3/specification.md, structure.md (stan 2026-10-30); źródła research/r1–r5, masterplan.md
date: 2026-10-30
---

# Review: specyfikacja i drzewo Tessery v3

## Zakres

- przedmiot: `specification.md` (całość), `structure.md` (całość); `masterplan.md` tylko pod kątem spójności odwołań.
- baseline: pliki w `tmp/tessera-v3/` ze stanu 2026-10-30.
- authority: decyzje właściciela z rozmowy 2026-10-30 podane w zleceniu; wcześniejsze decyzje właściciela z pamięci projektu (`~/.claude/projects/c--Users-MattyMroz-Desktop-PROJECTS-MangaShift/memory/*.md`) i z dokumentów v2 (`docs/plans/ui-kit/plans/e2-foundation.md`), gdy spec powołuje się na „decyzje z v2”; dowody w `research/r1`–`r5`.
- ryzyka: propozycja podana jako ustalenie, pominięta decyzja właściciela, sprzeczne reguły, budżet niemożliwy do spełnienia, warunek sukcesu mierzony złym instrumentem, zbędna złożoność drzewa.
- poza review: poprawność zewnętrznych źródeł raportów (nie otwierałem URL-i), kod v2, log sesji 30.10, presety repo `agents`.

## Werdykt

**Status:** FAIL (do poprawy przed akceptacją; prawie wszystkie poprawki to edycja tekstu, bez nowego researchu).

**Najważniejszy powód:** spec jest kompletna strukturalnie i w większości wiernie oddaje raporty, ale (1) miesza decyzje właściciela z rekomendacjami bez oznaczenia, a jedną niepotwierdzoną rekomendację (U20) podaje jako ustalenie, (2) lista W1–W13 pomija kilka zapisanych decyzji wyglądu właściciela, (3) reguły wydajności Q4/B9 są sprzeczne z zaakceptowanym przez właściciela ruchem przycisku, a B8 jest sprzeczny z pomiarem R2, więc S3 nie może przejść w obecnym brzmieniu.

Liczba findingów: krytyczne 0, poważne 7, mniejsze 14, sugestie 2.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Ustalenia bez pochodzenia; U20 to niepotwierdzona rekomendacja podana jako ustalenie

- miejsce: `specification.md` U5–U24 (linie 37–67), U20 (:60), S6 (:237), „Odłożone: MCP / CLI” (:218); `masterplan.md:23`.
- dowód: zlecenie, authority: „Dostęp agentów: właściciel wahał się «MCP czy CLI». Prowadzący zarekomendował markdown w paczce, bez MCP na start. Właściciel tego nie potwierdził wprost.” Spec U20: „Bez MCP, registry i własnego CLI na start.” jako ustalenie, a S6 robi z tego warunek sukcesu. Tylko U1 i „Poza zakresem” mają adnotację „decyzja właściciela”. U13 (Tailwind) to decyzja prowadzącego, na którą właściciel odpowiedział „chyba raczej tak”; `masterplan.md:23` zapisuje ją jako „zaakceptowane”. U6 (dokładnie 9 silników) i U9 (5 przepisów) to rekomendacje R1 (`r1-engines.md:12`, tabela 6.2); właściciel chciał „więcej niż 5” silników, konkretnej listy nie zatwierdzał.
- wpływ: spec jest „tablicą prawdy”. Świeży wykonawca nie odróżni decyzji właściciela (której nie wolno ruszać) od wyboru prowadzącego (który wolno zmienić, gdy pomiar pokaże lepszą drogę). Właściciel, akceptując spec ogólnym „ok”, nie wie, że zatwierdza też U20 (por. pamięć `premium-button-tylko-cta-strony.md`: „ogólna akceptacja rekomendacji planu to nie zgoda na konkretny wygląd”).
- minimalna reakcja: przy każdym U dopisać źródło w nawiasie (właściciel + data / prowadzący + raport). U20 przenieść do „Nierozstrzygnięte” jako N11 z rekomendacją „markdown w paczce” (S6 zostaje, ale jako zależny od N11). W masterplanie U13 jako „zaakceptowane warunkowo („chyba raczej tak”)”.
- route: REQUIREMENT FLAW.

#### P2. Lista „Decyzje wyglądu przenoszone z v2 (obowiązują)” pomija zapisane decyzje właściciela

- miejsce: `specification.md` W1–W13 (:69–83), F11 (:120), „Odłożone: Sekcje strony” (:216), U18 (:58).
- dowód (pamięć właściciela, katalog `memory/`):
  - `zero-kresek-akcentu-z-boku.md`: „NIGDY pionowych kresek akcentu z boku… właściciel powtórzył to drugi raz”. Brak w W i w Z.
  - `neon-trzy-tryby-poswiata-i-orby.md`: neon off / mini / full. Brak w W, brak wejścia w żadnym silniku (U6), choć v2 ma oś `data-neon` (`r1-engines.md:110`).
  - `kolory-paleta-nazwana-kontrast-domyslny.md`: nazwane role w stylu Apple, domyślny tryb Contrast, „wartości ze źródeł (Apple / Radix), nie z własnych wzorów”. Brak w W; R1 proponuje inne nazwy ról (`--color-surface-raised`, `r1-engines.md:341`).
  - `fonty-zakladki-wbudowane-bez-listy-systemowej.md`: 5 wbudowanych krojów, Mono = Cascadia domyślnie. Brak.
  - `start-settings-bez-wysp.md`: ekran ustawień bez wysp. F11 ma ekran „Ustawienia”, bez tej reguły.
  - `e2-foundation.md:22` (przez `r5-v2-audit.md:145`): squircle domyślnie, ×1,6, cap 45%. W4 milczy, a N2 przedstawia squircle jako otwarty wybór, nie jako decyzję z ograniczeniem platformy.
  - `jedna-skala-rozmiarow-wszedzie.md`: `lg 28` jest domyślny. W1 nie podaje domyślnego.
  - `tessera-cel-osobne-repo-z-dokumentacja.md` (30.10): „strona-dokumentacja, która wygląda i zachowuje się jak obecna strona mangashift.com”. U18 tego nie mówi.
  - `strona-skladana-z-tessery-zero-nowych-stylow.md` (18.10): sekcje strony są częścią Tessery, animacje wejścia na stronie dozwolone jako opcja części Tessery. Spec zostawia „miejsce i formę” sekcji otwarte (:216), a W12 nie ma tego wyjątku.
  - konflikt źródeł: W10 („5 stopni, wagi 400/500/600”, `e2-foundation.md:30`, 09.10) kontra `typografia-jak-shadcn-typeset-create.md` (15.10): „typografia = model shadcn 1:1… nie własny system”. Nie rozstrzygam.
- wpływ: wykonawca ze spec w ręku powtórzy błędy, za które właściciel już raz cofał pracę (kreski, neon jako kreska, własne wzory kolorów). Właściciel ocenia wygląd na żywo, więc każdy pominięty punkt to dodatkowa runda odrzuceń.
- minimalna reakcja: dopisać brakujące pozycje do W (z datą i plikiem źródła), squircle przenieść do W4 z ograniczeniem platformy (N2 zostaje tylko jako pytanie o WebKit), sekcje strony zapisać jako część Tessery, konflikt W10 vs Typeset dać właścicielowi jako N.
- route: REQUIREMENT FLAW.

#### P3. Brak kontraktu parytetu zachowań przy wyborze dostawcy (N7, U17)

- miejsce: U17 (:54), N7 (:253), tabela „Przenoszone z v2”, wiersz „Zachowanie komponentów” (:95: „tam, gdzie dostawca (N7) nie daje tego w API”).
- dowód: `memory/tessera-zachowania-przepisz-1-1-z-desktopu.md`: zachowania list, menu, slidingu, przelotu i tooltipów są „wymyślone i przetestowane przeze mnie, twoja rola to przepisać jeden do jednego”, m.in. natychmiastowe podmenu, Tab w menubarze, checkbox w menu nie zamyka, pigułka trzyma się w szparach. R2: Base UI Menu domyślnie `modal: true` (`r2-behavior.md:89`), zachowanie Base UI Menubar przy Tab „nie sprawdzono” (`r2-behavior.md:269, 310`). Kryteria N7 to wyłącznie montaż 200 tooltipów i przelot tylko przez `transform`.
- wpływ: sformułowanie „własne tylko tam, gdzie dostawca nie daje tego w API” prowadzi do podmiany przetestowanego zachowania na domyślne zachowanie Base UI wszędzie, gdzie API coś podobnego oferuje. To zmiana zachowania bez decyzji właściciela, której testy wydajności nie wykryją.
- minimalna reakcja: dodać wymaganie F (lista zachowań właściciela z v2, każde z testem interakcji) i dopisać do N7 kryterium „parytet zachowań z listy”. Odwrócić regułę z :95: zachowanie v2 obowiązuje; dostawca zastępuje kod, nie zachowanie.
- route: DESIGN FLAW.

#### P4. Q4 i B9 są sprzeczne z zaakceptowanym ruchem przycisku; koszt wizualny Q4 ukryty

- miejsce: Q3 (:134), Q4 (:135), B9 (:162), scena „stress” (:149), N5 (:248), N8 (:254).
- dowód: Q3 dopuszcza „jednolitą skalę bliską 1”, a Q4 każe, by „element, który się animuje, był warstwą przez cały czas życia”. B9: „≤ 12” warstw stałych na widoku. Scena stress ma 500 kontrolek. Właściciel zatwierdził przycisk skalujący się do 97% przy wciśnięciu, z `will-change: scale` na stałe (`memory/tessera-komponent-od-nowa-proces.md`). Jeśli N8 wybierze nakładkę stanu z animowaną `opacity`, każdy wiersz listy też staje się warstwą. R3 oznacza D5 („warstwa przez cały czas życia”) i D6 („tekst w animowanej warstwie ma od razu szary antyaliasing”) jako rekomendację „wygląd do akceptacji właściciela” (`r3-performance.md:231, 241–242`). Spec przyjmuje D5 jako twardą regułę Q4 i pomija D6.
- wpływ: na scenie stress Q4 + B9 da się spełnić tylko przez usunięcie ruchu wciśnięcia (decyzja właściciela) albo złamanie Q4. Do tego szary antyaliasing tekstu we wszystkich popupach i przyciskach to zmiana wyglądu, której właściciel („nie powiem, że ładnie, dopóki nie będzie ładnie”) nie widział.
- minimalna reakcja: Q4 zawęzić do nazwanych klas (popup, wskaźnik, poświata) i zdefiniować, co liczy B9; ruch wciśnięcia i hover wiersza rozstrzygnąć pomiarem (warstwa na czas interakcji albo bez ruchu) razem z N8; skutek D6 dopisać do N5 jako rzecz do obejrzenia na żywo.
- route: DESIGN FLAW + REQUIREMENT (D6).

#### P5. Budżet B8 dla popupu i menu jest sprzeczny z pomiarem R2

- miejsce: B8 (:160), U17 (:54), S3 (:234).
- dowód: B8: „popup/menu ≤ 10 kB z zależnościami”. Pomiar R2 (gzip, pojedynczy prymityw): Base UI Popover 40,0 kB, Menu 51,0, Tooltip 33,3, Select 43,9; Radix 19,3–31,8 kB (`r2-behavior.md:66–79`). Głównym kandydatem U17 jest Base UI.
- wpływ: S3 („B1–B11 przechodzą”) nie może przejść przy żadnym ze zmierzonych dostawców. Skończy się albo wiecznie czerwoną bramką, albo cichą „kalibracją” budżetu po fakcie.
- minimalna reakcja: B8 dla popupu podać po N7 jako zmierzony rozmiar wybranego dostawcy plus blokada wzrostu (size-limit), albo liczyć tylko kod Tessery bez dostawcy. Zapisać to przed E3.
- route: DESIGN FLAW.

#### P6. S3: nieokreślony instrument i nieokreślony obiekt pomiaru

- miejsce: S3 (:234), nagłówek budżetów (:147), U16 (:53), Q13 (:144), O1 (:180), B11 (:163); `masterplan.md:33, 35`.
- dowód:
  - budżety czasowe (B1, B3–B6, np. „≤ 4 ms”, „≤ 16 ms”) mają być „sprawdzane automatycznie w CI” bez wskazania maszyny, liczby powtórzeń ani tolerancji; R3 nazywa je „progami do kalibracji” (`r3-performance.md:22, 309`). Throttling CPU 4x na współdzielonym runnerze nie daje powtarzalnych milisekund.
  - laboratorium czyta `src` (U16), a Next 16 ma `reactCompiler` domyślnie wyłączony (`r3-performance.md:92`); Q13 mówi, że paczka jest kompilowana React Compilerem. Spec nie mówi, czy scena stress mierzy kod skompilowany tak jak `dist` konsumenta.
  - B11 („≤ ok. 250”) nie jest pomiarem sceny stress i „ok.” nie da się sprawdzić; `masterplan.md:35` (E4) mówi „B1–B10 w CI”, S3 mówi „B1–B11”.
- wpływ: S3 da wynik niestabilny (flaky = INCONCLUSIVE, nie PASS) albo zmierzy inny artefakt niż ten, który dostaje desktop i strona.
- minimalna reakcja: rozdzielić bramki liczące (B2, B7, B9, B10, B11, liczba commitów z Profilera, rozmiar) od czasowych (stała maszyna, np. istniejący runner self-hosted, mediana z N przebiegów, tolerancja). Zapisać, że scena stress biegnie na kodzie skompilowanym tak jak `dist`. B11 jako twarda liczba, poza S3 (warunek E2). Ujednolicić zakres S3 i E4.
- route: EVIDENCE GAP / DESIGN FLAW.

#### P7. Q17 (axe) jest sprzeczny z W8 (żywe kolory przed WCAG)

- miejsce: Q17 (:169), W8 (:78), E4 „wszystkie bramki zielone” (`masterplan.md:35`).
- dowód: axe w domyślnej konfiguracji sprawdza regułę `color-contrast` na każdym tekście. W8: kontrast wymuszany tylko w rolach neutralnych i etykiecie na wypełnieniu. `memory/kolory-zywe-przed-wcag.md`: w v2 sonda `contrast-matrix` wymusza tylko te pary, „akcenty, statusy i ring są advisory”; przyciemnienie akcentu pod WCAG właściciel cofnął tego samego dnia.
- wpływ: bramka axe zmusi wykonawcę do przyciemnienia akcentów i statusów, czyli dokładnie do zmiany, którą właściciel odrzucił.
- minimalna reakcja: w Q17 dopisać, że `color-contrast` jest twardy tylko dla ról neutralnych i etykiety na wypełnieniu, a dla akcentu i statusów jest informacyjny (jak `contrast-matrix` w v2).
- route: DESIGN FLAW (konfiguracja strażnika).

### Mniejsze

#### m1. Liczba wejść CSS: trzy w spec, jedno w drzewie

- miejsce: U14 (:51), I4 (:176); `structure.md:60–61`.
- dowód: U14 „trzy wejścia CSS: tokeny, CSS komponentów… i most `tailwind.css`”; structure: `tessera.css` „jedyne wejście: kolejność @layer i importy” + `tailwind.css`; R4 §3: `tessera.css` importuje `tokens.css` (`r4-package-repo.md:106–109`).
- wpływ: niejasna mapa `exports` i kolejność importów u konsumenta.
- reakcja: jedno brzmienie: `tessera.css` (tokeny + komponenty + kolejność `@layer`) i `tailwind.css`.

#### m2. Q6 brzmi tak, jakby zabraniał dziedziczonych zmiennych, których wymaga F2

- miejsce: Q6 (:137), F2 (:108).
- dowód: Q6 „Zmienne zapisywane per element są zarejestrowane przez `@property` z `inherits: false`”; F2 „rodzic przekazuje promień i wcięcie przez dziedziczone zmienne CSS”. R3 P4 dotyczy zmiennych pisanych z JS (`setProperty`, `r3-performance.md:298`).
- wpływ: wykonawca może zarejestrować `--shape-parent` z `inherits: false` i zepsuć koncentryczny promień.
- reakcja: „zmienne zapisywane z JS per element”.

#### m3. `depth` wystawia promień, co daje drugie publiczne źródło promienia

- miejsce: F4 (:110) kontra F2 (:108) i I2 (:174).
- dowód: F4 „promień” w wyjściach `depth`; F2 „`shape` jest jedynym źródłem promienia”. R1: `depth` czyta promień z `shape` (`r1-engines.md:213`).
- reakcja: `depth` nie wystawia promienia; przepis czyta `--shape-surface-{poziom}`.

#### m4. Sprężyny w F6 a zakaz `linear()` w Q5; Q5 niepowiązane z N1

- miejsce: F6 (:112), Q5 (:136), N1 (:244).
- dowód: R1 podaje sprężyny jako `linear()` (`r1-engines.md:147, 343`); Q5 zakazuje `linear()`; N1 mówi, że od platform „zależy, czy wolno użyć `linear()`”.
- reakcja: F6: sprężyny bez przestrzału jako `cubic-bezier`, dopóki obowiązuje Q5; Q5 oznaczyć jako zależne od N1.

#### m5. Q2 dopuszcza `rotate` bez zastrzeżenia o SVG

- miejsce: Q2 (:133).
- dowód: Chromium nie komponuje `transform`/`rotate` na elementach SVG (`r3-performance.md:157`).
- reakcja: „nie na elementach SVG; obracany jest kontener HTML”.

#### m6. Q13 pomija testy wersji nieskompilowanej

- miejsce: Q13 (:144).
- dowód: React zaleca testować obie wersje (`r3-performance.md:90`); R3 P8 tak to zapisuje (`:302`).
- reakcja: dopisać albo uzasadnić pominięcie.

#### m7. Rola G4 niejasna: przenoszony i jednocześnie odrzucony

- miejsce: „Przenoszone z v2” (:98), Zakres (:204), `masterplan.md:34` kontra „Odrzucone” (:227).
- dowód: `memory/ruch-kompozytor-proba-30-10-odrzucona.md`: „łagodne porównanie zatrzymanych klatek (G4) kłamało”.
- reakcja: zapisać, że G4 to tylko sygnał regresji i nie występuje w żadnym S ani warunku wyjścia.

#### m8. `structure.md`: reguła bez strażnika, brak pliku wymaganego przez standard, przesądzony N10, brak miejsca na hooki

- miejsce: `structure.md:78` („bez strażnika reguła nie obowiązuje”) kontra `:90` (strażnik = „AGENTS.md; sprawdza właściciel”); drzewo bez `.worktrees/.gitkeep`, który sprawdza `standard.py` (`r4-package-repo.md:253, 279`); `eslint.config.js` (:21) przed rozstrzygnięciem N10; „Przenoszone” wymienia `hooks/*`, drzewo nie ma `hooks/` (R4 je ma, `r4-package-repo.md:293`).
- reakcja: ostatni wiersz tabeli opisać jako regułę procesu, nie strażnika; dodać `.worktrees/.gitkeep`; `eslint.config.js` oznaczyć „wg N10”; wskazać, gdzie idą hooki (np. `lib/`).

#### m9. Lista „Przenoszone z v2” niepełna względem R5

- miejsce: tabela :89–99.
- dowód: R5 8.1 (`r5-v2-audit.md:284–293`) przenosi też `src/vite/`, `eslint/style-policy.ts`, `static-values.ts` (pomocnicze dla przenoszonych reguł eslint), `scripts/generate-docs.ts`, `generate-fonts.ts`, `_internal/use-reorder.ts`, `scroll-across.ts`, `title-when-cut.ts`.
- reakcja: dopisać albo przenieść do „Nie przenosimy” z powodem.

#### m10. U2 „bez osobnych fixture” bezwarunkowo, choć N9 otwarte

- miejsce: U2 (:33), N9 (:255).
- dowód: R4: jeśli pomiar wygra Vite, „kontrakt Next zostaje jako mała fixture” (`r4-package-repo.md:196`).
- reakcja: U2 uzależnić od N9.

#### m11. Pytania otwarte z raportów zgubione albo rozstrzygnięte bez właściciela

- miejsce: U9 (:43), W7 (:77), „Odłożone: Kafelki” (:215).
- dowód: R1 O12 („`field` jako wariant `control` czy osobny przepis”, `r1-engines.md:405`) nie występuje nigdzie. „Odłożone” zapisuje rekomendacje R2 („panele nie mogą tracić stanu”) jako wymaganie, choć R2 kieruje je do właściciela (`r2-behavior.md:304`), a właściciel chciał workbench przenieść 1:1 (`memory/tessera-kierunek-po-e5-strona-galerii-i-standard.md`, pkt 4).
- reakcja: O12 jako N (rozstrzygane w E3); w „Kafelkach” zaznaczyć, że poprawki to propozycja do decyzji.

#### m12. Stan wyjściowy: commit zamrożenia

- miejsce: :23.
- dowód: spec mówi o zamrożeniu na `186fdcd37`; git status na starcie sesji pokazuje HEAD gałęzi `7a48b4310` (późniejszy commit), od którego liczył R5 (`r5-v2-audit.md:3`). Nie sprawdzałem, czy `7a48b4310` jest wypchnięty (git poza zakresem).
- reakcja: podać commit, od którego liczą się ścieżki w „Przenoszone”.

#### m13. „Jeden link” bez adresu

- miejsce: U18 (:58), `masterplan.md:32` („link do laboratorium działa”).
- dowód: nie wiadomo, czy to lokalny serwer dev, czy wdrożona strona; właściciel 13.10 mówił o publicznej stronie Tessery (`memory/tessera-kierunek-po-e5-strona-galerii-i-standard.md`).
- reakcja: zapisać, gdzie żyje link w E1 (lokalnie) i czy wdrożenie jest w zakresie.

#### m14. Pominięta decyzja techniczna: najnowsze biblioteki i TypeScript 7

- miejsce: „Technologia” (:48–54).
- dowód: `memory/tessera-najnowsze-biblioteki-ts7.md`: „użyj najnowszych bibliotek… TypeScript 7”.
- reakcja: dopisać albo potwierdzić z właścicielem, że już nie obowiązuje.

### Sugestie

#### s1. Strażnicy CSS bez nowego narzędzia

`structure.md:84–85` wprowadza stylelint z dwiema białymi listami obok testu grafu (`:83`) i eslint. To dwa narzędzia do jednej czynności (parsowanie CSS). Prościej: jeden test w `test/guards/`, który parsuje CSS raz i sprawdza graf silników, wartości w przepisach i właściwości w komponentach (v2 ma już testy CSS do przeniesienia). Stylelint dopiero, gdy test przestanie wystarczać.

#### s2. `docs/decisions/` a spec: dwa miejsca prawdy

`structure.md:31` („jedna decyzja = jeden plik”) i spec („Ustalenia”, „Odrzucone”) mogą się rozjechać. Proponuję: spec jest jedynym źródłem obowiązujących decyzji, `decisions/` trzyma tylko dowody pomiarów (np. `e0-two-repos.md`), a spec do nich linkuje.

## Zgodność z authority (zlecenie)

| Decyzja właściciela                                                    | Wynik        | Dowód                                                                       |
| ---------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| v3 w osobnym repo, v2 zamrożona bez merge                              | pass         | U1, „Stan wyjściowy”; drobna nieścisłość commitu (m12)                      |
| silniki → przepisy → komponenty, więcej niż 5 silników, „raz a dobrze” | pass z uwagą | U5–U11; konkretna lista bez oznaczenia pochodzenia (P1)                     |
| Tailwind tylko do układu (decyzja prowadzącego, „chyba raczej tak”)    | pass z uwagą | U13; pochodzenie nieoznaczone, masterplan pisze „zaakceptowane” (P1)        |
| paczka przez bun, `link:`, bez publikacji, publiczna/prywatna otwarte  | pass         | U3, N3, „Odłożone”                                                          |
| docs = laboratorium pod jednym linkiem, bez luźnych HTML               | pass z uwagą | U18–U19; adres linku i styl strony nieokreślone (m13, P2)                   |
| MCP czy CLI: niepotwierdzone                                           | **fail**     | U20, S6 jako ustalenie (P1)                                                 |
| logowanie, płatności, baza poza zakresem; kafelki później              | pass         | „Poza zakresem”, „Odłożone”                                                 |
| wydajność nr 1, wygląd nr 2, właściciel ocenia na żywo                 | pass z uwagą | „Użytkownik i intencja”, U21, Z9, S1; reguły Q4/B9 kolidują z wyglądem (P4) |
| budowa wszerz, ocena w kompozycji, struktura folderów                  | pass         | U21–U22, `structure.md`                                                     |
| standard repo z presetów `agents`, w trakcie dopracowania              | pass         | U4, N6                                                                      |
| W1–W13 z pamięci właściciela                                           | **fail**     | lista niepełna (P2), konflikt W8 z Q17 (P7)                                 |

## Regresje i integracja

- Spec → masterplan: S3 vs E4 (B1–B11 vs B1–B10), G4 w E3 vs „Odrzucone” (m7), E1 zależy od N10, a drzewo już ma `eslint.config.js` (m8).
- Spec → structure: U14 vs `tessera.css` jako jedyne wejście (m1), hooki bez miejsca w drzewie (m8).
- Reguły wewnątrz spec: Q4 × B9 × Q3 (P4), Q5 × F6 (m4), Q6 × F2 (m2), F4 × F2/I2 (m3), Q17 × W8 (P7), B8 × U17/R2 (P5).

## Wykonane kontrole

```text
odczyt w całości: specification.md (257 linii), structure.md (95), masterplan.md (95),
r1-engines.md, r2-behavior.md, r3-performance.md, r4-package-repo.md, r5-v2-audit.md
odczyt pamięci właściciela: 30 plików memory/*.md dotyczących wyglądu, ruchu, Tessery, strony
grep docs/plans/ui-kit i tessera/ pod źródła W6, W7, W10 (e2-foundation.md:30, ui-kit-digest.md:12)
porównanie każdej pozycji U/W/F/Q/B/S/N z raportem źródłowym i z authority ze zlecenia
```

## Niewykonane lub nierozstrzygające kontrole

- Rozmowa właściciela z 2026-10-30 znana tylko ze streszczenia w zleceniu; pamięć projektu użyta jako zastępcze źródło wcześniejszych decyzji. Jeśli właściciel w rozmowie uchylił którąś z nich (np. neon, kreski), P2 trzeba zawęzić.
- Nie otwierałem zewnętrznych źródeł raportów; twierdzenia R1–R5 przyjąłem jako REPORTED.
- Nie sprawdzałem kodu v2 ani presetów `agents` (np. czy `standard.py` wymaga `.worktrees/.gitkeep`, podaję za R4).
- Nie sprawdzałem, czy `186fdcd37` / `7a48b4310` są wypchnięte (git poza zakresem).
- Nie sprawdzałem, czy Turbopack respektuje własny warunek `source` w `exports` (U16). R4 tego nie potwierdził, a E0 mierzy tylko konsumentów `dist`; warto dopisać ten punkt do planu E0.

## Ograniczenia review

Review dokumentów, bez uruchamiania czegokolwiek. Werdykt dotyczy zgodności z authority ze zlecenia, z raportami R1–R5 i z pamięcią właściciela, nie poprawności technicznej samych raportów.

## Zalecany następny krok

1. Autor poprawia P1–P7 (głównie edycja tekstu) i mniejsze uwagi, które uzna za zasadne.
2. Do właściciela trafiają jako N: U20 (MCP/CLI), W10 vs shadcn Typeset, D6 (szary antyaliasing w warstwach ruchu), sposób pracy z workbenchem (1:1 czy z poprawkami), O12.
3. Druga runda review po poprawkach.

______________________________________________________________________

# Runda 2

Stan: `specification.md`, `structure.md`, `masterplan.md` przeczytane od nowa w całości (2026-10-30, po poprawkach). Odwołania do linii dotyczą nowych wersji. Raportu `review-b-masterplan.md` nie czytałem; zmiany masterplanu oceniam tylko pod kątem spójności ze spec.

## Werdykt rundy 2

**Status:** FAIL, ale wąsko: jedna uwaga poważna (R2-1), której poprawka to jedno zdanie. Wszystkie pozostałe findingi z rundy 1 są naprawione albo zostały z nich resztki o małym wpływie. Po poprawce R2-1 i drobnych numeracjach dokument nadaje się do akceptacji.

Liczba nowych findingów: krytyczne 0, poważne 1, mniejsze 7, sugestie 1.

## Status findingów z rundy 1

| Finding                        | Status                  | Dowód w nowym tekście                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 pochodzenie ustaleń, U20    | FIXED                   | legenda źródeł spec:11; tagi przy U1–U25; MCP/CLI przeniesione do N12 (spec:273); masterplan:23 nie wymienia już Tailwinda jako zaakceptowanego; U14 ma tag [W-del]. Resztki: U18 (spec:56) nie ma tagu dla samej reguły; U19 [W] zawiera dopisek prowadzącego „lokalnego serwera deweloperskiego”; U22 ma tag [P], choć według authority budowa wszerz to decyzja właściciela (zaniżone, nieszkodliwe) |
| P2 brakujące decyzje W         | FIXED                   | kreski W12, neon W11, paleta W6, fonty W13, Settings W15 (i F11), squircle W3, `lg` domyślnie W1, strona docs jak mangashift.com U20, sekcje strony W17 i Zakres:226, wyjątek animacji wejścia sekcji W16, konflikt typografii N2. Przy W brak dat i plików źródła (poza W6), ale nagłówek sekcji jednoznacznie przypisuje je właścicielowi                                                             |
| P3 parytet zachowań            | FIXED                   | F15 (spec:132), Z10 (:219), N7 z parytetem jako pierwszym kryterium (:279), wiersz „Zachowanie komponentów” odwrócony (:102), S5 (:258)                                                                                                                                                                                                                                                                 |
| P4 Q4/B9 a ruch wciśnięcia; D6 | PARTIAL                 | Q4 zawężone do elementów długiego życia (spec:146), B7 liczy tylko je (:172), D6 jako Q18 (:190) i w N5 (:270). Nowa sprzeczność w drugim zdaniu Q4: R2-1                                                                                                                                                                                                                                               |
| P5 B8 popup ≤ 10 kB            | FIXED                   | B6 (spec:171): własny kod ≤ 3 kB, dostawca liczony osobno i zamrożony po N7                                                                                                                                                                                                                                                                                                                             |
| P6 instrument S3               | FIXED                   | podział na bramki liczące B1–B8 „na zbudowanym `dist` z React Compilerem” (spec:162) i pomiary czasowe T1–T5 lokalnie, z medianą z 5 przebiegów i progiem regresji (:175); B8 ≤ 250 bez „ok.” (:173); S3 (:256) zgodne z E3 (masterplan:38). Resztka: R2-3                                                                                                                                              |
| P7 axe a W7                    | FIXED                   | Q17 (spec:189)                                                                                                                                                                                                                                                                                                                                                                                          |
| m1 wejścia CSS                 | FIXED                   | U15 (spec:53), `structure.md:61–62`, I4                                                                                                                                                                                                                                                                                                                                                                 |
| m2 Q6 a F2                     | FIXED                   | Q6 (spec:148)                                                                                                                                                                                                                                                                                                                                                                                           |
| m3 promień w `depth`           | FIXED                   | F2 „także dla powierzchni na każdym poziomie głębi” (:115), F4 bez promienia (:117)                                                                                                                                                                                                                                                                                                                     |
| m4 sprężyny a Q5               | FIXED                   | F6 (:119), Q5 powiązane z N1 (:147)                                                                                                                                                                                                                                                                                                                                                                     |
| m5 SVG                         | FIXED                   | Q2 (:144)                                                                                                                                                                                                                                                                                                                                                                                               |
| m6 wersja nieskompilowana      | FIXED                   | Q13 (:155)                                                                                                                                                                                                                                                                                                                                                                                              |
| m7 G4                          | FIXED                   | G4 w „Nie przenosimy” (:108) i w „Odrzucone” (:249); masterplan nie wymienia G1–G4                                                                                                                                                                                                                                                                                                                      |
| m8 `structure.md`              | PARTIAL                 | dodane `.worktrees/.gitkeep` (`structure.md:26`), N10 przy `eslint.config.js` (:21). Bez zmian: nagłówek „Każda reguła ma strażnika” (:79) a wiersz :91, gdzie strażnikiem jest „bramka właściciela”, czyli człowiek; drzewo dalej nie mówi, gdzie trafiają przenoszone `hooks/*` (spec:101–102)                                                                                                        |
| m9 lista „Przenoszone”         | FIXED                   | spec:98–104                                                                                                                                                                                                                                                                                                                                                                                             |
| m10 fixture a N9               | FIXED                   | U2 (:34) bez zakazu fixture, N9 (:281)                                                                                                                                                                                                                                                                                                                                                                  |
| m11 zgubione pytania           | PARTIAL                 | „Kafelki” są neutralne (:238). R1 O12 (`field` jako wariant `control` czy osobny przepis) dalej nie występuje nigdzie, a dotyczy W9 i przepisu `control` w E2                                                                                                                                                                                                                                           |
| m12 commit zamrożenia          | NOT FIXED, akceptowalne | spec:25 i masterplan:23 dalej podają `186fdcd37`. Późniejszy `7a48b4310` to według opisu commitu „chore(repo): drop the old claude code settings template”, więc prawdopodobnie nie dotyka `tessera/` (nie sprawdzałem, git poza zakresem)                                                                                                                                                              |
| m13 adres linku                | FIXED                   | U19 (:60)                                                                                                                                                                                                                                                                                                                                                                                               |
| m14 TS 7                       | FIXED                   | U5 (:37)                                                                                                                                                                                                                                                                                                                                                                                                |
| s1 jeden test CSS              | FIXED                   | `structure.md:84–86`                                                                                                                                                                                                                                                                                                                                                                                    |
| s2 `decisions/`                | FIXED                   | spec:9, `structure.md:29, 32`                                                                                                                                                                                                                                                                                                                                                                           |

## Nowe findingi

### Poważne

#### R2-1. Drugie zdanie Q4 jest sprzeczne z decyzją właściciela o przycisku

- miejsce: Q4 (spec:146): „Krótkie mikro-ruchy (wciśnięcie przycisku) są warstwą tylko na czas ruchu.”
- dowód: `memory/tessera-komponent-od-nowa-proces.md` (decyzje właściciela o przycisku, 10-11): „`will-change: scale` stale na przycisku (ikona nie skacze na hoverze)”. R3 D5 opisuje ten sam mechanizm: przełączanie warstwy na starcie i końcu ruchu zmienia antyaliasing i raster, co v2 widziała jako „skok” (`r3-performance.md:19, 241`). Po 30.10 obowiązuje „wydajność ponad identyczny piksel, ale bez artefaktów” (`memory/ruch-kompozytor-proba-30-10-odrzucona.md`).
- wpływ: twarda reguła każe zrobić dokładnie to, co właściciel już raz odrzucił jako artefakt. Wybrał tu prowadzący, a powinien wybrać właściciel albo pomiar: stała warstwa na każdym przycisku kosztuje pamięć GPU i nie mieści się w B7, a warstwa na czas ruchu daje skok.
- minimalna reakcja: usunąć to zdanie z Q4 i dopisać do N5 (E0 (c)) pozycję „wciśnięcie przycisku: warstwa stała, która nie przeskakuje, ale kosztuje pamięć GPU, czy warstwa na czas ruchu, która przeskakuje antyaliasingiem”. Jeśli wygra warstwa stała, B7 musi określić, czy liczy przyciski.
- route: REQUIREMENT FLAW.

### Mniejsze

#### R2-2. Martwe odwołanie: Q4 wskazuje B9, którego już nie ma

- miejsce: Q4 (spec:146) „ich liczba ma budżet B9”; po przenumerowaniu budżet warstw to B7 (:172).
- reakcja: B9 → B7.

#### R2-3. Bramki „na zbudowanym `dist`” a laboratorium czytające `src`

- miejsce: budżety (spec:162) kontra U17 (:55).
- dowód: scena stress żyje w `apps/docs`, które według U17 czyta źródła przez warunek `source`. Nigdzie nie jest zapisane, jak CI przełącza laboratorium na `dist`.
- reakcja: jedno zdanie: CI buduje laboratorium bez warunku `source` (albo osobną komendą perf na `dist`).

#### R2-4. Masterplan: E2 wymaga bramek i baseline'u, których infrastruktura powstaje w E3

- miejsce: masterplan:37 (E2: „baseline v2 na scenie stress”, wyjście „bramki B1–B5 zielone”) kontra :38 (E3: „najpierw infrastruktura budżetów: scena stress, B1–B8 w CI, `bun run perf`”).
- reakcja: zapisać, że w E2 B1–B5 biegną na ekranie „Nakładki”, bez sceny stress, a baseline v2 przenieść do E3. Druga możliwość: scena stress powstaje w E2.

#### R2-5. Numeracja F i N nie idzie po kolei

- miejsce: F15 (spec:132) stoi przed F13 i F14 (:136–137); w „Nierozstrzygniętych” N11–N14 stoją przed N7–N10 i nie ma N2 w starym znaczeniu. Odwołania wewnątrz spec i masterplanu sprawdziłem: poza R2-2 są poprawne (U8 w `structure.md:84`, W7 w Q17, W15 w F11, N13 w masterplan:54).
- reakcja: kosmetyka; przenumerować albo dopisać jedno zdanie, że numery są stałe i nie oznaczają kolejności.

#### R2-6. Masterplan stosuje N13 jak regułę obowiązującą, choć N13 jest otwarte

- miejsce: masterplan:54 „obowiązuje reguła z N13” i :96, kontra spec:274 (N13 w „Decyzje właściciela”, z samą rekomendacją).
- reakcja: „obowiązuje rekomendacja N13 do decyzji właściciela” albo rozstrzygnąć N13 przed E2.

#### R2-7. Neon przypisany do poziomów głębi, a W11 przypisuje go elementom z akcentem

- miejsce: F4 (spec:117): `depth` daje dla każdego poziomu „poświatę neonu”. W11 (:83): poświata mini jest na elementach niosących akcent (włączony switch, checkbox, primary, focus), nie na powierzchniach.
- reakcja: poświatę jako wyjście, które czyta przepis `control`/`indicator` dla stanu z akcentem (np. `color` + `depth`), a nie wartość per poziom głębi. Orby (tryb full) to warstwa długiego życia z Q4.

#### R2-8. `structure.md`: reguła bez strażnika i hooki bez miejsca (resztka m8)

- miejsce: `structure.md:79` kontra `:91`; brak `hooks/` w drzewie przy przenoszonych `hooks/*` (spec:101–102).
- reakcja: wiersz :91 przenieść pod „Reguły procesu (bez strażnika maszynowego)”; w komentarzu `lib/` dopisać, że trafiają tam hooki.

### Sugestie

#### R2-s1. Etykieta [P] „przyjęta w rozmowie bez sprzeciwu”

Brak sprzeciwu to nie zgoda (`memory/premium-button-tylko-cta-strony.md`: „ogólna akceptacja rekomendacji planu to nie zgoda na konkretny wygląd”). Uczciwiej: „[P] propozycja prowadzącego, zatwierdzana razem ze spec”. Nic nie blokuje, bo spec ma status `draft` i trafi do akceptacji właściciela.

## Kontrole rundy 2

```text
odczyt w całości: specification.md (283 linie), structure.md (97), masterplan.md (112)
porównanie każdego findingu rundy 1 z nowym tekstem (tabela wyżej)
sprawdzenie odwołań krzyżowych po przenumerowaniu: U/W/F/Q/B/T/N w spec, structure i masterplan
ponowny odczyt memory/tessera-komponent-od-nowa-proces.md pod R2-1
```

Nie sprawdzałem: raportu `review-b-masterplan.md`, nowych twierdzeń masterplanu niezwiązanych ze spec (np. kolejności E0–E6 jako decyzji kierunku) ani tego, czy `7a48b4310` dotyka `tessera/`.

______________________________________________________________________

# Runda 3

Stan: `specification.md` (284 linie), `structure.md` (97) i `masterplan.md` (112) przeczytane od nowa po poprawkach z rundy 2 obu recenzji.

## Werdykt rundy 3

**Status:** PASS WITH FINDINGS. Nie ma uwag krytycznych ani poważnych. Zostało 5 mniejszych uwag, które nie blokują akceptacji.

## Status uwag z rundy 2

| Finding                           | Status                 | Dowód                                                                                                                               |
| --------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| R2-1 wciśnięcie przycisku w Q4    | FIXED                  | Q4 (spec:146) „Wciśnięcie przycisku rozstrzyga N5”; N5 (:270) ma oba warianty z decyzją 10.10 i skutkiem dla B7                     |
| R2-2 B9 → B7                      | FIXED                  | Q4 (:146)                                                                                                                           |
| R2-3 `dist` a `source`            | FIXED                  | U17 (:55)                                                                                                                           |
| R2-4 E2 a infrastruktura budżetów | FIXED                  | wyjście E2 bez B1–B5, z sondą trace na ekranie (masterplan:37); scena stress, baseline v2 i N8 w E3 (masterplan:38, spec:160, :280) |
| R2-5 numeracja F i N              | NOT FIXED, nie blokuje | identyfikatory są unikalne, a odwołania poprawne (sprawdzone: U8, W7, W15, B7, F15, N5, N13, N15). Kolejność to kosmetyka           |
| R2-6 N13 jak reguła               | FIXED (resztka)        | masterplan:54 „(po decyzji właściciela)”; masterplan:96 w tabeli ryzyk dalej pisze samo „reguła N13”                                |
| R2-7 neon w `depth`               | FIXED                  | F4 (:117): jedna poświata zależna od trybu, używana tylko przez przepisy elementów niosących akcent                                 |
| R2-8 `structure.md`               | FIXED                  | nagłówek :79 „maszynę albo jawną bramkę właściciela”; hooki w `lib/` (:58)                                                          |
| P4, resztka                       | FIXED                  | jak R2-1                                                                                                                            |
| m8, resztka                       | FIXED                  | jak R2-8                                                                                                                            |
| m11, resztka (O12)                | FIXED                  | N15 (:283)                                                                                                                          |

## Nowe zmiany: sprzeczności i propozycje podane jako decyzje

Sprawdzone zmiany: U17, U20, F4, Q4 + N5, N7, N8, N13, N15. Żadna nie łamie authority ani W1–W18, żadna nie daje sprzeczności z bramkami. Uwagi mniejsze:

#### R3-1. U20: zdanie o terminie nie ma tagu, a odsuwa cel właściciela do E5

- miejsce: spec:61, drugie zdanie: „Osiąga to, gdy istnieją sekcje strony (E5)”. Stoi za tagiem [W, 30.10], więc czyta się jak słowa właściciela.
- wpływ: właściciel chciał 30.10 strony-dokumentacji w stylu mangashift.com jako „porządnej prezentacji” Tessery. Termin E5 przypada po całym rdzeniu (E4), więc to zmiana materialna, którą warto mu pokazać wprost.
- reakcja: tag [P] przy tym zdaniu i wzmianka przy akceptacji spec. Kolejność ma sens (W17 wymaga sekcji w Tesserze), więc nie trzeba jej zmieniać.

#### R3-2. U17 „do potwierdzenia w E0”, ale E0 nie ma kroku, który to sprawdza

- miejsce: U17 (:55) kontra E0 (masterplan:35). Próba (a) sprawdza zewnętrznych konsumentów `dist`; nic nie sprawdza, czy laboratorium na Next/Turbopacku honoruje warunek `source` i czy da się je zbudować bez niego.
- reakcja: dopisać to do pomiaru N9 w E0 albo zmienić „E0” na „E1” (pierwsze `apps/docs`).

#### R3-3. N7 rozstrzygany w trzech etapach, a wyjście E2 mówi „N7 zapisane”

- miejsce: N7 (:279) „E0 dla przelotu, E2 dla komponentów przekroju, E3 dla menubara” kontra masterplan:37 „decyzje N7 i N15 zapisane”.
- reakcja: w E2 „N7 dla komponentów przekroju zapisane”. Warto też zapisać, co się stanie, gdy Base UI Menubar (zbudowany na silniku Menu) przegra parytet F15 w E3 po tym, jak menu przeszło w E2.

#### R3-4. N15 stoi w „rozstrzyganych pomiarem”, a rozstrzyga go plan

- miejsce: spec:283. To wybór projektowy w kontrakcie E2, który akceptuje właściciel (U24), a nie pomiar.
- reakcja: kosmetyka; przenieść albo dopisać, że akceptacja planu E2 to akceptacja N15.

#### R3-5. Masterplan:96: N13 bez zastrzeżenia (resztka R2-6)

- reakcja: dopisać „(po decyzji właściciela)” jak w :54.

## Czy R2-5 blokuje

Nie. Numery służą do odwołań, nie do kolejności czytania; są unikalne, a odwołania między trzema dokumentami są poprawne. Jedyny koszt: czytelnik może szukać F13 przed F15. Można to zostawić albo dopisać jedno zdanie, że numery są stałe.

## Kontrole rundy 3

```text
odczyt w całości trzech dokumentów po poprawkach
status R2-1…R2-8 i resztek P4, m8, m11 względem nowego tekstu
przegląd zmienionych punktów (U17, U20, F4, Q4, N5, N7, N8, N13, N15) pod sprzeczności i pochodzenie
sprawdzenie odwołań krzyżowych ID między spec, structure i masterplan
```

Nie sprawdzałem `review-b-masterplan.md` ani zmian masterplanu niezwiązanych ze spec.
