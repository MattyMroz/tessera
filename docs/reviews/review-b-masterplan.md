---
kind: review
status: fail
reviewed-state: tmp/tessera-v3/masterplan.md (status draft, updated 2026-10-30) + specification.md, structure.md, research r2-r5 ze stanu 2026-10-30
date: 2026-10-30
---

# Review: masterplan Tessery v3

## Zakres

- przedmiot: `tmp/tessera-v3/masterplan.md`, przeczytany w całości (94 linie).
- baseline: pliki w `tmp/tessera-v3/` ze stanu 2026-10-30; v2 na branchu `refactor/tessera-motion` (kod czytany tylko tam, gdzie był potrzebny jako dowód).
- authority: fakty z rozmowy 2026-10-30 z briefu; `specification.md`, `structure.md`; `MangaShift/AGENTS.md`; log `docs/session-logs/2026-10-30-2022-tessera-motion-failed-architecture-next.md`; kryteria skilla `masterplan`.
- ryzyka, których szukałem: zła kolejność (droga niepewność odłożona), warunki wyjścia nieobserwowalne albo dające fałszywy PASS, brakujące lub zbędne bramki właściciela, etapy za duże na jedną sesję, powtórki błędów v2, pseudo-precyzja E5–E7.
- poza review: poprawność merytoryczna research (przyjęta jako REPORTED, poza miejscami sprawdzonymi niżej), treść `r1-engines.md` poza grepem, uruchamianie czegokolwiek.

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** bieżący etap E0 może przejść, a mimo to rzeczywista konfiguracja nie zadziała. Minimalna paczka bez zależności nie wykryje drugiego Reacta wnoszonego przez Base UI, a E0 nie sprawdza `tsdown --watch` obok `bun tauri dev` ani buildu produkcyjnego. Do tego kolejność E0 → E1 → E2 odkłada do E2/E3 dwie niewiadome, które mogą zmienić wynik bardziej niż E0: wygląd ruchu na kompozytorze i kształt zagnieżdżony liczony samym CSS. To ten sam wzór co w v2: najpierw fundament, a pierwsza ocena właściciela w kompozycji dopiero po tygodniach pracy.

Kierunek (osobne repo, silniki → przepisy → komponenty, laboratorium, plan szczegółowy tylko dla bieżącego etapu) jest spójny ze specyfikacją. Do zmiany jest kolejność, granice E2 i E4 oraz warunki wyjścia E0. Planu nie trzeba pisać od nowa.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. E0 nie jest eksperymentem, który najmocniej może zmienić kierunek; największe niewiadome czekają do E2/E3

- miejsce: „Aktualny etap” (l. 52–60), kolejność tabeli etapów (E0 → E1 → E2 → E3), ryzyka l. 80.

- dowód:

  - Porażka v2 z 30.10 to porażka wyglądu ruchu na żywo, nie konsumpcji paczki. W logu sesji (l. 95–105) jest 7 ślepych uliczek ruchu, a ani jednej dotyczącej linkowania.
  - N5 (spec l. 248) ustala wygląd: wskaźnik bez obwódki, cienia i blur (r3 D2), dwie pigułki albo stały rozmiar (D3/D3a), „obrys zamiast cienia na Windows”. Te wybory zmieniają wyjścia silników `depth`, `shape` i `state`, czyli rzeczy budowane w E2, zanim N5 zapadnie w E3.
  - Kształt zagnieżdżony: v2 liczy go pomiarem DOM. `components/_internal/surface-edges.ts:24–61` używa `getBoundingClientRect`, `offsetHeight` i `ResizeObserver`, a `lib/shape.ts:129` ma `edgeDistances`, czyli róg zależy od tego, której krawędzi rodzica dotyka element. v3 zakazuje tego (Z5, Q7) i zastępuje to dziedziczonymi zmiennymi CSS (F2). Żaden raport tego mechanizmu nie potwierdził (grep po `research/`: brak). Do tego zmienna, która przelicza własną wartość z rodzica (`--r: calc(var(--r) - …)`), tworzy w CSS cykl, a cykl unieważnia wartość. Potrzebne jest obejście (nazwy per poziom, `inherit()` albo inny wzór), a jego wybór i wsparcie w WebKit są niezbadane. Rezygnacja z rogów zależnych od krawędzi to zmiana wyglądu, którą musi zatwierdzić właściciel.
  - N7: r2 §6, l. 272 i 293 mówi, że to, czy przelot tooltipa Base UI da się zrobić samym `transform`, „wymaga makiety pomiarowej przed decyzją”.
  - Porażka E0 ma gotowy wariant zapasowy (ryzyka, l. 79) i nie zmienia pracy w E1–E5, bo laboratorium czyta `src` we własnym workspace (U16). Porażka któregokolwiek z trzech punktów wyżej przerabia silniki.

- wpływ: 9 silników powstaje na założeniach, które E3 może obalić. Tak było w v2: E0 i E1 powstały, a 10.10 odrzucono wygląd w kodzie (masterplan v2, l. 32–33).

- minimalna reakcja: E0 dalej jako tani test, ale równolegle z nim (bez repo, w scratchu HTML/CSS) trzy próby, które mogą zmienić kierunek:

  1. warianty ruchu D3, D3a, D4 i D7 pokazane właścicielowi na żywo i na nagraniu obok v2;
  2. promień koncentryczny w 3 poziomach samym CSS, w tym popup w portalu, w Chromium i WebKit;
  3. przelot tooltipa Base UI wyłącznie przez `transform`.

  E2 rusza dopiero po ich wyniku. Klasa: KNOWLEDGE GAP.

#### P2. Brak pionowego wycinka; pierwsza ocena w kompozycji dopiero w E4, a E2 ocenia silniki w izolacji

- miejsce: warunek wyjścia E2 („właściciel ocenia strony próbek na żywo”), E3 (przepisy jako „gołe bloki”), E4 (pierwsze ekrany).
- dowód:
  - U21: „Element ocenia się w kompozycji, nie w izolacji”.
  - Masterplan v2, l. 76–78: „wygląd biblioteki oceniany na galerii i makietach nie dał akceptacji, bo bez prawdziwego konsumenta nie widać, jak komponenty wyglądają razem”.
  - Strony próbek silników (paski kolorów, skale promieni) to dokładnie ta izolowana ocena. Statyczny wygląd przepisów w E3 nie ma w ogóle bramki właściciela (warunek wyjścia E3 obejmuje tylko ruch).
  - Konflikt w specyfikacji: U19 („każde piętro osobno, zanim powstanie następne”) kłóci się z U21 i z lekcją v2. Masterplan wiernie realizuje U19.
- wpływ: pierwsza ocena, która może być ostateczna (S1: przycisk w popupie 2–3 poziomy), przychodzi po E2+E3+E4. Odrzucenie wtedy przerabia trzy etapy. Właściciel jest zmęczony miesiącem bez akceptacji, a plan znowu odsuwa pierwszą ocenę.
- minimalna reakcja: warunkiem wyjścia E2 (albo połączonego E2/E3) jest jeden ekran testowy. Najlepiej „Nakładki w nakładkach”, bo to S1. Zbudowany z minimalnych wersji potrzebnych silników, przepisów `control` i `surface` oraz 3–4 komponentów, oceniony na żywo. Strony próbek zostają jako narzędzie diagnostyczne, nie bramka. Konflikt U19/U21 rozstrzyga autor specyfikacji z właścicielem. Klasa: DESIGN FLAW + konflikt spec.

#### P3. E2 i E4 są za duże na jedną zdrową sesję, a bramka właściciela stoi tylko na ich końcu

- miejsce: wiersze E2 i E4.
- dowód:
  - E2 to: 9 silników, 2 motywy, strony próbek w 2 trybach i skrajnych wyborach, pomiar N8 (na liście 500+ wierszy, a przepis `row` powstaje dopiero w E3), baseline v2 na scenie „stress” (scenę trzeba zbudować w zamrożonej v2) i licznik B11.
  - E4 to: 20 komponentów, 4 ekrany, 20 plików `docs/*.md`, `llms.txt`, budżety B1–B10 w CI, axe i WebKit, a na końcu jedna akceptacja wszystkiego naraz.
  - To ten sam kształt co E0 v2 (jeden wiersz z kilkunastoma warunkami wyjścia) i E2 v2 („komplet komponentów”), który nie zbiegł. Pamięć właściciela mówi „akceptacja partiami” (masterplan v2, l. 102–103).
- wpływ: kontekst sesji pęka w środku etapu, a uwagi właściciela przychodzą po zbudowaniu dwudziestu elementów, więc poprawka w przepisie dotyka wszystkich.
- minimalna reakcja: jednostką akceptacji w E4 jest ekran, nie runda 20 komponentów. Kolejność: Nakładki, Ustawienia, Panel roboczy, Wycinek strony; bramka właściciela po każdym. Infrastruktura budżetów (CI, scena stress, axe, WebKit) staje się osobnym punktem, niezależnym od wyglądu. W E2 pomiar N8 i baseline v2 przechodzą tam, gdzie jest ich obiekt. Klasa: DESIGN FLAW.

#### P4. Brak stop-loss przy niezbieżnym wyglądzie; reakcja przepisana z v2, która przez miesiąc nie zadziałała

- miejsce: „Ryzyka kierunku”, wiersz „Iteracje wyglądu nie zbiegają” (l. 82).
- dowód: masterplan v2, l. 145 ma prawie identyczny wiersz: „plansze wracają z poprawkami więcej niż dwa razy → więcej równoległych wariantów planszy naraz do porównania”. Zgodnie z authority ta reakcja dała miesiąc bez akceptacji. W v3 nie ma limitu rund ani innej reakcji, a na poziomie przedsięwzięcia brak kryterium „co, jeśli E3 też zostanie odrzucone”.
- wpływ: powtórka v2. Dalsze iteracje bez punktu, w którym zmienia się metodę, a nie tylko liczbę wariantów.
- minimalna reakcja: właściciel ustala limit rund dla jednej oceny i jakościowo inną reakcję po jego przekroczeniu, np. zakotwiczenie w konkretnej, już zaakceptowanej referencji zamiast nowych wariantów albo rozmowę o wymaganiu. Klasa: REQUIREMENT (decyzja właściciela, nie zgaduję treści).

#### P5. Warunek wyjścia E0 może dać fałszywy PASS

- miejsce: wiersz E0 (rezultat, warunek wyjścia).

- dowód:

  1. Zależności przechodnie. r4 §4, l. 117 (F, docs bun): przy `link:` „its own dependencies are not installed”. r4 l. 130: importy w plikach Tessery rozwiązują się od prawdziwej ścieżki, czyli z `tessera/node_modules`. Base UI (U17) zaimportuje więc Reacta z repo Tessery. Minimalna paczka bez zależności tego nie wykryje.
  2. Jedna komenda. AGENTS.md MangaShift: „`bun tauri dev` to JEDYNA komenda usera”. U16 i r4 l. 136 wymagają osobnego `tsdown --watch` w Tesserze. E0 nie mówi, czy zmiana idzie przez `dist` z watcherem, ani kto go uruchamia. Jeśli desktop ma sam startować watcher, wraca złożoność `dev-host`/`ensure-build` z v2, którą spec wyrzuca.
  3. „Zmiana w paczce widoczna” nie rozróżnia TSX i CSS, a większość Tessery to CSS kopiowany do `dist`.
  4. Brak buildu produkcyjnego: `next build` (static export) z `turbopack.root` poza repo.
  5. Brak worktree. Ścieżka `link:../…` jest względna wobec `package.json`, a worktree MangaShift ma leżeć gdzie indziej niż obok repo (pamięć), więc link w worktree wskaże pusty katalog.
  6. Na bieżącym branchu `@mattymroz/tessera` jest już członkiem workspace MangaShift (`package.json:9–10`, `web/package.json:23` `workspace:*`). E0 nie mówi, na jakim stanie MangaShift działa, a nazwa koliduje.

- wpływ: E0 „zielone”, a problemy wychodzą dopiero w E6/E7, kiedy cofnięcie jest drogie.

- minimalna reakcja: doprecyzować warunek wyjścia E0:

  - paczka z jedną prawdziwą zależnością (Base UI) i komponentem z hookiem i kontekstem;
  - osobno zmiana TSX i CSS przez `dist` z watcherem;
  - `next build` z eksportem;
  - jedna próba w worktree;
  - stan MangaShift bez v2 albo inna nazwa w scratchu.

  Decyzja „jedna czy dwie komendy dev” trafia do właściciela (REQUIREMENT). Klasa: EVIDENCE GAP.

#### P6. Ryzyko utraty danych przez linki i junctiony przy usuwaniu worktree nie jest w planie

- miejsce: „Ryzyka kierunku” (brak wiersza); E0, E6 i E7 tworzą `link:` z MangaShift do `PROJECTS/tessera`.
- dowód: r4 l. 127 (L): „`git worktree remove` na Windows wchodzi w junctiony i kasuje ich cel”. Log 30.10, l. 124 i pamięć: „nigdy `remove --force` bez zdjęcia junctionów (30.10 skasowało agents/skills)”. AGENTS.md MangaShift: praca równoległa to jeden agent w jednym worktree. Commit i push Tessery dzieje się tylko na słowo właściciela, więc niewypchnięta praca w Tesserze może nie mieć kopii.
- wpływ: usunięcie worktree MangaShift z linkiem może skasować zawartość repo Tessery. Istniejący `hooks-agents/guard.sh` łagodzi ryzyko, ale plan go nie wymienia ani nie sprawdza.
- minimalna reakcja: wiersz ryzyka (rozpoznanie: link wychodzący poza worktree; reakcja: guard aktywny w obu repo, procedura zdejmowania linków) i jedna kontrola w E0, że guard blokuje `worktree remove` w worktree z linkiem. Klasa: ENVIRONMENT ISSUE.

#### P7. Warunek wyjścia E1 wymaga pushu i założenia repo na GitHubie, a plan nie ma na to bramki właściciela

- miejsce: wiersz E1 („CI zielone”), „Sposób wykonania” (Git, l. 69).
- dowód: zielone CI wymaga repo na GitHubie i pushu. Authority: push tylko na wyraźne słowo właściciela. Widoczność repo (publiczne czy prywatne) jest tą samą kwestią co N3 („kod widzi każdy”), a N3 jest oznaczone „nie blokuje E0–E5”. W v2 była identyczna blokada: masterplan v2, l. 167–171 („Bez pushu E0 nie zamknie się w żadnym wariancie”).
- wpływ: E1 nie może się zamknąć bez decyzji, której plan nie przewiduje. To powtórzony błąd v2.
- minimalna reakcja: dopisać do zależności E1 decyzję właściciela: założenie repo, jego widoczność i zgodę na push brancha dla CI. Rozdzielić N3 (paczka) od widoczności repo. Klasa: REQUIREMENT.

#### P8. Zależność E6 „E4 dla komponentów strony” jest fałszywa

- miejsce: wiersz E6, kolumna „Zależności”.
- dowód: r5 §6.1, l. 198: strona przechodnio wciąga 41 komponentów v2 i 11 sekcji. Wśród nich są elementy spoza F10 (`navigation-menu`, `accordion`, `menubar`, `scroll-area`, `toolbar`, `number-field`, `color-picker`) i spoza rdzenia: `logo`, `language-switcher` i `compare-slider` (r5 l. 271: „domena lub blok”) oraz `blocks/editor-demo`, które r5 l. 306 „wyrzuca z rdzenia” bez wskazania miejsca docelowego. Dodatkowo E6 zawiera całą nową warstwę sekcji (27 w v2), wydanie `0.1.0` i decyzję N3.
- wpływ: obietnica, że „sekcje mogą ruszyć przed końcem E5”, nie ma podstawy, a E6 jest kilkukrotnie większe, niż sugeruje wiersz.
- minimalna reakcja: zależność E6 to „komponenty, których strona używa” (z listy r5 §6.1), a nie E4. Miejsce `editor-demo` i sekcji zapisać jako decyzję otwartą. Nie rozpisywać E6 dalej (patrz „Pseudo-precyzja” niżej). Klasa: DESIGN FLAW.

#### P9. Plan nie mówi, co dzieje się ze stroną mangashift.com do E6

- miejsce: brak w całym masterplanie.
- dowód: spec l. 23–24: v2 „nie wraca na `main`”, a wersja strony na Tesserze v2 istnieje tylko na branchu. Log 30.10, l. 37: bieżący branch wyrósł z `feat/site-beta-landing`. Strona na `main` stoi na `@mangashift/ui`. E6 jest po E4, a E4 po E2 i E3.
- wpływ: prace nad stroną (beta landing, odtwarzacz) albo czekają nieokreślony czas, albo wracają na stary kit. Obie drogi dają dodatkową migrację. Plan tego nie nazywa.
- minimalna reakcja: decyzja właściciela zapisana w „Nierozstrzygniętych”: zamrożenie strony do E6 albo wydanie bez Tessery. Klasa: REQUIREMENT.

### Mniejsze

#### m1. Bramka „kontrakt etapu zaakceptowany przez właściciela” (U23) nie występuje w „Sposobie wykonania”

- dowód: U23 i structure.md l. 90 („sprawdza właściciel”). Masterplan l. 42 i 62–69 mówią tylko, że plan powstaje, a nie kto go akceptuje.
- wpływ: konflikt specyfikacji z planem. Dochodzi napięcie z authority: właściciel nie czyta długich tekstów.
- reakcja: zapisać konflikt i rozstrzygnąć z właścicielem formę bramki, np. kontrakt na jednym ekranie. Nie rozstrzygam.

#### m2. E1 buduje strażników silników przed pierwszym silnikiem

- dowód: E1, „strażnicy struktury i warstw (puste listy silników, ale działające)”; U24: „strażnicy powstają razem z regułą”. Kształt folderu silnika może się zmienić po próbach z P1.
- wpływ: strażnik pod hipotetyczną strukturę, czyli ryzyko strażnika rytualnego (Z2).
- reakcja: strażnik warstw CSS komponentu zostaje w E1. Strażników struktury i grafu dodać razem z pierwszym silnikiem w E2.

#### m3. Budżety czasowe w CI są niestabilne i nie mierzą WebView2

- dowód: E4 i S3: B1–B10 w CI. Budżety B3 ≤ 4 ms, B4 ≤ 16 ms i B6 ≤ 300 ms przy CPU 4x na wspólnym runnerze Linux zależą od maszyny. r3 l. 333 utożsamia Chromium z WebView2. O1: komputer właściciela się zacina, więc nie nadaje się do lokalnego pomiaru.
- wpływ: losowo czerwone CI albo progi poluzowane do bezużyteczności.
- reakcja: w CI blokować budżety liczbowe (B2, B7, B9, B10, B11, rozmiar B8). Czasowe raportować z tolerancją albo mierzyć poza bramką. Do decyzji w planie E4.

#### m4. Rola G4 i forma oceny ruchu w E3

- dowód: spec l. 98 przenosi G4 (klatki), a l. 227 odrzuca porównanie zatrzymanych klatek jako dowód jakości ruchu. Warunek wyjścia E3 to wybór „na nagraniach”, a przyczyną odrzucenia 30.10 były szwy i lagi widoczne na żywo.
- reakcja: zapisać w E3, że G4 to wyłącznie wykrywacz regresji, a warunek wyjścia obejmuje nagranie obok v2 oraz interaktywną próbę na żywo na WebView2.

#### m5. E0 łączy dwa różne pytania

- dowód: N9 (HMR `apps/docs`: Next czy Vite we własnym workspace) to inne pytanie niż konsumpcja przez dwa repo. Wynik ma trafić do `decisions/e0-two-repos.md`, a katalogu `decisions/` przed E1 nie ma (masterplan l. 42 każe trzymać plany w `tmp/tessera-v3/plans/`).
- reakcja: N9 jako osobny, krótki pomiar; ścieżka zapisu decyzji przed E1 jednoznaczna.

#### m6. Wygląd samego laboratorium nie ma właściciela w planie

- dowód: pamięć `tessera-cel-osobne-repo-z-dokumentacja.md` (30.10): strona dokumentacji ma „wyglądać i zachowywać się jak obecna strona mangashift.com (one-pager)”. Spec odkłada sekcje strony do migracji strony (E6), a masterplan nie mówi, w jakim motywie i z jakich części powstaje laboratorium.
- reakcja: decyzja właściciela, czy to wymaganie obowiązuje. Jeśli tak, sekcje potrzebne laboratorium przesuwają się przed E6 (REQUIREMENT). Źródłem jest pamięć, nie spec, więc nie rozstrzygam.

### Sugestie

- **s1.** Bramka „właściciel akceptuje drzewo” w E1 dubluje akceptację `structure.md`. Wystarczy jedna akceptacja przy przyjęciu specyfikacji, a w E1 zostaje AGENTS.md (zależne od N6).
- **s2.** Przy każdym etapie jedna linijka „jak właściciel to sprawdzi” (link plus 2–3 kroki). Authority mówi, że to on jest sensorem, a ma mało energii na czytanie.
- **s3.** Q13 (kompilacja React Compilerem, testy na wersji skompilowanej) nie ma etapu. Naturalne miejsce to build w E1.
- **s4.** „`bun run check` zielone dwa razy z rzędu na świeżym klonie” przyszło z v2, gdzie łapało wyścig strażnika buildu. W v3 strażnika nie ma, więc to kontrola o małej sile. Można zostawić, bo jest tania, ale nie liczyć jej jako dowodu stabilności.

## Pseudo-precyzja E5–E7

Ogólnie poprawnie: E5–E7 mają kierunek, zależności i ogólne warunki wyjścia, a tabela planów kończy się na E4. Jedyny problem to fałszywa zależność E6 (P8). Udaje precyzję, której nie ma, i uzasadnia nią równoległość. „Pierwsze wydanie `0.1.0`” w E6 jest zgodne z U3 i nie szkodzi.

## Prostsza droga do tego samego celu

1. Zamiast E0 → E1 → E2 → E3: tani E0 (doprecyzowany wg P5) równolegle z trzema próbami z P1, wszystko w scratchu bez repo. To jeden dzień pracy i jedna ocena właściciela na żywo.
2. E1 z decyzjami z P7.
3. Zamiast osobnych E2 (silniki wszerz) i E3 (przepisy): pionowy wycinek kończący się ekranem „Nakładki w nakładkach” ocenionym na żywo (P2). Dopiero potem poszerzanie silników i ekran po ekranie (P3).

Liczba etapów prawie się nie zmienia. Zmienia się to, kiedy właściciel pierwszy raz widzi coś, co może zaakceptować: po 1–2 sesjach zamiast po E4.

## Zgodność z kontraktem

- Kryteria skilla `masterplan`:
  - etapy jako stany: pass;
  - warunki wyjścia obserwowalne: częściowo (E0 niejednoznaczne, P5);
  - najpierw największa niepewność: fail (P1);
  - przyszłość ogólna: pass z P8;
  - bieżący etap jednoznaczny: pass;
  - dokument jako mapa, nie tracker: pass.
- Spec U21 (ocena w kompozycji): fail w E2/E3 (P2).
- Spec U23 (kontrakt akceptowany przez właściciela): pominięte (m1).
- Spec U16 a reguła „jedna komenda” z AGENTS.md: konflikt nierozstrzygnięty (P5).
- Authority „push tylko na słowo właściciela”: E1 tego nie uwzględnia (P7).
- Spec F2 a zakaz Z5/Q7: zgodne na papierze, mechanizm niepotwierdzony (P1).

## Wykonane kontrole

```text
Odczyt w całości: masterplan.md, specification.md, structure.md, masterplan v2, log 2026-10-30-2022.
Odczyt sekcji: r4 §0, §4, §7–§10 + niewiadome; r3 §6–§9; r2 §6–§7; r5 §6–§8, §11.
grep research/ pod kątem mechanizmu promienia zagnieżdżonego (inherit/cykl/koncentry/portal): brak dowodu mechanizmu CSS.
Kod v2: surface-edges.ts:24–61 (getBoundingClientRect, offsetHeight, ResizeObserver), lib/shape.ts:117–138 (concentricRadius, edgeDistances), hooks/use-shape.tsx (kontekst React).
MangaShift package.json:4–10 (tessera/* jako członkowie workspace), web/package.json:6–23 (workspace:*, predev ensure, dev-host).
Pamięć: tessera-cel-osobne-repo-z-dokumentacja.md, ruch-kompozytor-proba-30-10-odrzucona.md.
```

## Niewykonane lub nierozstrzygające kontrole

- Nie uruchamiałem żadnego spike'a. Teza o cyklu zmiennej CSS opiera się na semantyce cykli w specyfikacji Custom Properties (wiedza, nie pomiar). Wsparcia `inherit()` w WebView2 i WebKit nie sprawdzałem.
- Nie sprawdzałem, czy na `main` istnieje `tessera/` (git zakazany). Kolizję nazw z P5 pkt 6 potwierdziłem tylko dla bieżącego branchu.
- Nie czytałem `r1-engines.md` w całości (poza grepem), więc nie sprawdzałem, czy graf U7 i kształt U8 są poprawne.
- Stanu `feat/site-beta-landing` (P9) nie weryfikowałem w gicie, tylko w specyfikacji i logu.

## Wymagana ocena człowieka

Decyzje dla właściciela, wynikające z tego review:

1. P4: limit rund i inna reakcja przy niezbieżnym wyglądzie.
2. P5: jedna komenda dev (`bun tauri dev`) czy zgoda na drugi proces `tsdown --watch`.
3. P7: założenie repo `tessera` na GitHubie, jego widoczność i zgoda na push brancha dla CI w E1.
4. P9: co ze stroną do E6.
5. m6: czy laboratorium ma wyglądać jak mangashift.com.
6. P2 / U19 a U21: czy pierwsza bramka wyglądu to ekran w kompozycji, a nie strony próbek silników.

## Ograniczenia review

Jeden reviewer, bez uruchamiania kodu. Fakty zewnętrzne z research przyjąłem jako REPORTED. Kod v2 i pliki MangaShift sprawdziłem bezpośrednio (DIRECT).

## Zalecany następny krok

Autor poprawia: E0 (P5, P6), kolejność E0–E3 (P1, P2), granice E2 i E4 (P3), zależności E1 i E6 (P7, P8) i wiersz ryzyka (P4). Decyzje z listy wyżej idą do właściciela w jednej krótkiej wiadomości. Potem druga runda review samego masterplanu.

______________________________________________________________________

## Runda 2

Stan: `masterplan.md`, `specification.md` i `structure.md` przeczytane od nowa w całości (wersje z 2026-10-30, po przebudowie). Raport A (`review-a-spec.md`) przejrzałem tylko pod kątem zmian w spec. Numery etapów w nowym planie: E0 próby, E1 repo, E2 pionowy przekrój, E3 runda wszerz, E4 reszta rdzenia, E5 strona, E6 desktop.

### Werdykt rundy 2

**Status:** FAIL (wąski). Bieżący etap E0 może ruszyć.

**Najważniejszy powód:** 13 z 19 pozycji z rundy 1 jest naprawionych, a kierunek i kolejność E0 → E2 są teraz dobre. Przebudowa wprowadziła jednak dwie sprzeczności, które blokują przyszłe wiersze planu:

1. Wyjście z E2 wymaga bramek B1–B5 i bazowego pomiaru v2 na scenie „stress”, a infrastrukturę budżetów (scena, CI) plan stawia na początku E3.
2. E1 wymaga laboratorium „w stylu mangashift.com”, zanim istnieje jakikolwiek silnik czy komponent, a U19 i W17 zabraniają własnego CSS w aplikacji.

Obie poprawki to edycja tekstu. Nie jest to runda bez uwag poważnych, więc według zasady „do dwóch rund z rzędu bez uwag poważnych” potrzebna jest runda 3.

### Status findingów z rundy 1

| ID  | Status                     | Dowód w nowym tekście / co zostało                                                                                                                                                 |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | PARTIAL                    | Próby ruchu, kształtu i przelotu przeniesione do E0 (masterplan l. 35, 71); E2 zależy od wyniku E0. Zostało: próba (b) nie obejmuje popupu w portalu (patrz R2-m2).                |
| P2  | FIXED                      | E2 „Pionowy przekrój” z oceną ekranu „Nakładki” (l. 37, 50); spec U21 i U23 rozstrzygają konflikt U19/U21 (spec l. 62, 67).                                                        |
| P3  | PARTIAL                    | E3: ekran po ekranie, bramka po każdym (l. 38, 51). E2 nadal przeładowany i niespójny z E3 (R2-P1).                                                                                |
| P4  | FIXED                      | N13 z rekomendacją (spec l. 274); masterplan l. 54 i 96. Resztka: dla prób ruchu w E0 nadal tylko „kolejne warianty” (R2-m4).                                                      |
| P5  | PARTIAL                    | E0(a) ma Base UI, plik CSS, `bun tauri dev` jako jedyną komendę, `next build` i inną nazwę paczki (l. 35); F13 (spec l. 136). Brakuje próby w worktree (ścieżka względna `link:`). |
| P6  | FIXED                      | O6 (spec l. 206), wiersz ryzyka (l. 99), structure l. 92, `guard.sh` w E1 (l. 36).                                                                                                 |
| P7  | FIXED                      | N11 (spec l. 272); E1 zależy od N11 (l. 36); blokery (l. 29). Drobna rozbieżność: N11 „blokuje wyjście z E1”, a masterplan wpisuje N11 jako zależność startu.                      |
| P8  | FIXED                      | E5 obejmuje sekcje (W17) i komponenty strony spoza rdzenia; zależy od E4 (l. 40); fałszywa obietnica równoległości usunięta.                                                       |
| P9  | FIXED                      | N14 (spec l. 275), poprawnie sformułowane.                                                                                                                                         |
| m1  | FIXED                      | „Bramki właściciela”: start każdego etapu (l. 47); U24; structure l. 91.                                                                                                           |
| m2  | FIXED                      | E1 ma tylko test CSS warstw i reguły eslint konsumenta (l. 36).                                                                                                                    |
| m3  | FIXED                      | Podział na liczniki B (CI) i pomiary czasu T (lokalnie, raport) (spec l. 162–183).                                                                                                 |
| m4  | FIXED                      | G4 nie jest przenoszone (spec l. 108); E0(c) i bramki: ocena na żywo plus nagranie (l. 48, 54).                                                                                    |
| m5  | NOT FIXED                  | N9 dalej w E0 (l. 35). „Wyniki w `decisions/`”, a do E1 repo nie istnieje; l. 58 wskazuje tylko miejsce na plany.                                                                  |
| m6  | FIXED, ale wprowadza R2-P2 | U20 (spec l. 61); E1 „jedna strona w stylu mangashift.com” (l. 36).                                                                                                                |
| s1  | NOT FIXED                  | E1 nadal ma osobną akceptację drzewa (l. 49). Nie blokuje.                                                                                                                         |
| s2  | FIXED                      | l. 54: link i instrukcja przy każdej bramce.                                                                                                                                       |
| s3  | PARTIAL                    | Q13 oraz B na `dist` z React Compilerem (spec l. 155, 162); żaden etap nie wymienia wdrożenia kompilatora (naturalne miejsce: E1).                                                 |
| s4  | NOT FIXED                  | E1 nadal wymaga dwóch zielonych przebiegów na świeżym klonie. Akceptowalne.                                                                                                        |

Podsumowanie: FIXED 12 (w tym m6), PARTIAL 4, NOT FIXED 3. Wszystkie REQUIREMENT-y (P4, P7, P9) są w N11, N13 i N14 i sformułowano je poprawnie: pytanie, fakty, rekomendacja, co blokują.

### Nowe problemy

#### Poważne

##### R2-P1. E2 wymaga budżetów i bazowego pomiaru, których infrastruktura powstaje dopiero w E3; E2 nadal przeładowany

- miejsce: masterplan l. 37 (E2: „pomiar N8; baseline v2 na scenie stress”, wyjście „bramki B1–B5 zielone”) i l. 38 (E3: „najpierw infrastruktura budżetów (scena stress, B1–B8 w CI, `bun run perf`)”). Spec l. 160: „wartości startowe kalibruje pomiar v2 na tej samej scenie (E2)”.
- dowód: tych samych bramek i tej samej sceny nie da się mieć zielonych w E2, skoro ich narzędzia powstają w E3. B1 i B2 potrzebują trace w Playwright, B3 i B4 licznika commitów, a bazowy pomiar v2 potrzebuje gotowej sceny. Ekran „Nakładki” angażuje praktycznie wszystkie 9 silników i wszystkie 5 przepisów (menu ze slidingiem to `indicator` i `row`, popup to `depth` i `motion`). E2 dostaje więc pełny zestaw silników, 5 przepisów, 6 komponentów, ekran, strony diagnostyczne wszystkich silników (F1), benchmark N7 na WebView2, pomiar N8 na 500+ wierszach i bazowy pomiar v2. Bramka właściciela jest jedna, na końcu.
- wpływ: wyjście z E2 jest niewykonalne w zapisanej kolejności. Ocena właściciela, czyli cel pionowego przekroju, czeka na pomiary, które jej nie warunkują.
- minimalna reakcja: wyjście z E2 to ekran oceniony na żywo plus test warstw. Bramki B, scena „stress”, bazowy pomiar v2 i N8 idą do „infrastruktury budżetów” na początku E3 (albo całość budżetów na koniec E2). Spec l. 160 trzeba poprawić razem z planem. Klasa: DESIGN FLAW (kolejność).

##### R2-P2. E1 wymaga laboratorium „w stylu mangashift.com”, a w E1 nie ma z czego go zbudować

- miejsce: masterplan l. 36 („`apps/docs` z jedną stroną w stylu mangashift.com”).
- dowód:
  - U19 (spec l. 60): laboratorium „zbudowane wyłącznie z Tessery”.
  - W17 (l. 89): „aplikacja nie ma własnego CSS”.
  - U20 (l. 61): wygląd jak mangashift.com.
  - W E1 nie ma silników, przepisów, komponentów ani sekcji; sekcje strony (hero, navbar, footer) pojawiają się dopiero w E5.
- wpływ: wykonawca E1 albo łamie U19 i W17 ręcznym CSS, albo rozszerza E1 o motyw i sekcje, które należą do E2 i E5. W obu przypadkach plan przeczy spec.
- minimalna reakcja: w E1 laboratorium to „jedna pusta strona pod jednym linkiem”. Styl mangashift.com rośnie razem z Tesserą: motyw w E2, sekcje potrzebne laboratorium przed E5 albo w E5. To autor ustala z właścicielem, kiedy laboratorium ma osiągnąć U20. Klasa: konflikt plan–spec (nie rozstrzygam).

#### Mniejsze

##### R2-m1. E0 nie zmieści się w jednej sesji, a E1 niepotrzebnie czeka na całość E0

- dowód:
  - (a) wymaga desktopu (`bun tauri dev`), `next dev`, `next build`, zmian TSX i CSS, sprawdzenia jednego Reacta, ustalenia „jednej komendy” oraz pomiaru N9.
  - (b) wymaga 3 poziomów w Chromium i WebKit.
  - (c) wymaga strony z pięcioma tematami N5, przelotu Base UI i v2 uruchomionej obok, a do tego sesji właściciela z nagraniami.
  - Realnie to 2–3 sesje plus czas właściciela. E1 zależy od „E0” w całości (l. 36), choć potrzebuje tylko wyniku (a) (konfiguracja `exports`/`source`/`dist`, U17).
- reakcja: E1 zależy od E0(a). E2 zależy od E0(b) i (c). (a) i (b) można prowadzić równolegle bez właściciela, a (c) ma osobną bramkę. Warunki wyjścia są już rozdzielone na (a), (b) i (c), więc to zmiana jednej kolumny.

##### R2-m2. Próba (b) pomija popup w portalu, czyli przypadek S1

- dowód: E0(b) mówi tylko o „3 poziomach”. Popover, menu i dialog trafiają do portalu (r3 §3.2: 11 plików z portalem w v2), a zmienne dziedziczone nie przechodzą przez portal. Nawet jeśli łańcuch zagnieżdżonych powierzchni działa, test „przycisk w popupie 2–3 poziomy” (S1, F9) może się nie udać.
- reakcja: w (b) jeden poziom jako popup w portalu, z promieniem z `depth` (F9).

##### R2-m3. Wyjście awaryjne dla kształtu wymaga zmiany Q7, a nie „wyjątku Q7”

- dowód: masterplan l. 94: „wyjście w JS raz na powierzchnię jako nazwany wyjątek Q7”. Q7 (spec l. 149): „Kształt i rozmiar nie przechodzą przez JS”; lista wyjątków obejmuje tylko zachowanie (pozycjonowanie, wirtualizacja). Z5 dopuszcza pomiar per powierzchnia, ale Q7 już nie.
- reakcja: zapisać, że to wyjście oznacza zmianę Q7 decyzją właściciela.

##### R2-m4. Brak stop-loss dla prób ruchu w E0

- dowód: masterplan l. 95: „Właściciel nie przyjmuje żadnego wariantu ruchu → kolejne warianty na żywo”. N13 dotyczy ekranu, który wraca z poprawkami. Dla E0(c) wraca więc reakcja z v2.
- reakcja: N13 obejmuje także E0(c).

##### R2-m5. N7 rozstrzygane w E2 bez menubara

- dowód: N7 (spec l. 279) ma kryterium nr 1 „parytet zachowań F15”. F15 zawiera Alt/F10/Tab dla menubara, Tab między menu i przelot menubara. Menubara nie ma w E2 ani w F10 (spec l. 126), więc pojawi się dopiero w E4.
- reakcja: albo menubar w E2 (jako część bazy menu), albo N7 zapisane jako wstępne dla menubara.

##### R2-m6. E0(a) zmienia pliki repo produktu, a nie ma kroku sprzątania

- dowód: E0 ma żyć „poza repo produktu” (l. 35), ale `link:` w desktopie i stronie oznacza edycję `desktop/package.json`, `web/package.json`, konfiguracji Vite i Next oraz korzeniowego `bun.lock`, plus junctiony (O6). „Scratch usunięty” dotyczy tylko `tmp/`. Subagenci nie mogą cofnąć tych zmian gitem.
- reakcja: w planie E0 lista dotykanych plików produktu i krok przywracania wykonywany przez prowadzącego (najpierw zdjęcie linków według O6, potem przywrócenie plików).

#### Sugestie

- Wiersz ryzyka „Budżety czasowe niestabilne” (l. 98) opisuje jako reakcję stan, który spec już ustala (T to tylko raport). Można go usunąć.
- N14 jest decyzją na teraz (los obecnych prac nad stroną), a nie warunkiem startu E5. Lepiej zostawić ją tylko w „Następny artefakt” (l. 75).

### Odpowiedzi na pytania rundy

- **E0 z trzema próbami w jednej sesji:** nie. To 2–3 sesje plus bramka właściciela. Próby są niezależne, więc wystarczy rozdzielić zależności (R2-m1).
- **E2 jako pionowy przekrój:** zakres komponentów jest dobrze ograniczony (6 komponentów, jeden ekran). Zakres pomiarów nie jest: budżety, scena „stress”, bazowy pomiar v2 i N8 są w złym etapie (R2-P1).
- **Kolejność i zależności:** dobre w głównym ciągu E0 → E2 → E3 → E4 → E5 → E6. Nie zgadzają się: E2 z E3 (R2-P1), E1 z całym E0 (R2-m1) i N11 jako warunek startu albo wyjścia E1 (drobne).
- **Odwołania do spec:** poprawne poza trzema miejscami: „wyjątek Q7” (R2-m3), N7 a F15/menubar (R2-m5) i „baseline (E2)” w spec l. 160 sprzeczny z E3 w planie (R2-P1).

### Niewykonane kontrole (runda 2)

- Bez uruchamiania czegokolwiek.
- Raport A przeczytany tylko we wstępie (l. 1–40); nie weryfikowałem, czy każda zmiana w spec odpowiada jego findingom.
- Nie sprawdzałem, czy cztery ekrany F11 są pokryte przez E2 i E3 bez luk w przepisach (E2 i E3 razem wymieniają wszystkie cztery, więc nominalnie tak).

______________________________________________________________________

## Runda 3

Stan: `masterplan.md` i `specification.md` przeczytane od nowa (masterplan w całości, spec w miejscach zmian i odwołań); `structure.md` sprawdzony grepem pod kątem odwołań do etapów i `decisions/`.

### Werdykt rundy 3

**Status:** PASS WITH FINDINGS. Brak uwag krytycznych i poważnych. Zostały trzy mniejsze, żadna nie blokuje E0 ani planu E1.

### Status uwag

| ID           | Status                  | Miejsce                                                                                                                                                                                           |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-P1        | FIXED                   | E2 bez budżetów, wyjście = ocena ekranu, test warstw i sonda trace z v2 (masterplan l. 37); E3 zaczyna od infrastruktury budżetów i N8 (l. 38); spec l. 160 (baseline w E3), N8 (spec l. 280, E3) |
| R2-P2        | FIXED                   | E1 „jedna pusta strona” (l. 36); U20 „osiąga to, gdy istnieją sekcje strony (E5); wcześniej bez własnego CSS” (spec l. 61)                                                                        |
| R2-m1        | FIXED                   | „Skala: 2–3 sesje plus bramka właściciela” (l. 35); E1 zależy od E0 (a), E2 od E0 (b) i (c) (l. 36–37)                                                                                            |
| R2-m2        | FIXED                   | E0 (b) „także dla popupu w portalu” (l. 35)                                                                                                                                                       |
| R2-m3        | FIXED                   | ryzyko „to zmiana Q7 i F2 w spec, zapisana przed E2” (l. 94)                                                                                                                                      |
| R2-m4        | FIXED                   | N13 „ekran albo wariant ruchu (także w E0)” (spec l. 274); masterplan l. 96. Wiersz l. 95 („kolejne warianty na żywo”) to resztka bez znaczenia, bo l. 96 go obejmuje                             |
| R2-m5        | NOT FIXED (przesunięte) | N7 ma teraz „E3 dla menubara” (spec l. 279), ale menubara nie ma w F10 (spec l. 126), czyli w zakresie E3; patrz R3-m1                                                                            |
| R2-m6        | FIXED                   | „zmiany w plikach MangaShift tylko na branchu próbnym, po próbie przywrócone, linki zdjęte przed sprzątaniem (O6)”; w wyjściu „working tree MangaShift jak przed próbą” (l. 35)                   |
| P1 (resztka) | FIXED                   | portal w (b)                                                                                                                                                                                      |
| P3 (resztka) | FIXED                   | E2 ograniczony do przekroju bez pomiarów                                                                                                                                                          |
| P5 (resztka) | NOT FIXED               | E0 nadal nie sprawdza `link:` w worktree konsumenta (ścieżka względna). Ryzyko danych pokrywa O6, ryzyka ścieżki nie pokrywa nic. Drobne: wyjdzie najpóźniej przy pierwszym worktree w E5         |
| m5           | FIXED                   | ścieżka `tmp/tessera-v3/decisions/` do E1, potem przeniesienie (l. 35); zgodne ze spec l. 9 i structure l. 32. N9 świadomie zostaje w E0                                                          |
| s3           | FIXED                   | E1 „z buildem (React Compiler)” (l. 36); zgodne z U17 i Q13                                                                                                                                       |

### Sprzeczności między masterplanem a spec po zmianach

Sprawdziłem wszystkie pięć zmian z listy koordynatora. Sprzeczności nie wprowadziła żadna z nich. Zostały dwie drobne niespójności (pierwsza to przesunięta resztka R2-m5, druga jest nowa) i jedna rozbieżność w sformułowaniu:

- **R3-m1. N7 „E3 dla menubara” bez menubara w E3.** Spec l. 279 przypisuje rozstrzygnięcie parytetu menubara do E3, ale E3 to „pozostałe 14 komponentów z F10” (masterplan l. 38), a F10 nie ma Menubara. Menubar dochodzi dopiero w E4. Reakcja: dopisać Menubar do F10 i E3 albo zmienić w N7 „E3” na „E4”.
- **R3-m2. N15 może dać szósty przepis.** N15 (spec l. 283) dopuszcza „osobny przepis” dla `field`, a U10 i cel końcowy masterplanu (l. 11) mówią o pięciu przepisach. N15 stoi w sekcji „rozstrzygane pomiarem”, więc plan E2 mógłby zmienić liczbę z U10 bez decyzji właściciela. Reakcja: dopisać w N15, że wynik „osobny przepis” zmienia U10 i cel.
- **R3-m3 (sformułowanie).** Masterplan l. 29 podaje N11 jako bloker E1, a l. 36 i spec l. 272 mówią „do wyjścia”. Wystarczy ujednolicić.

Sprawdzone bez uwag:

- E2: „sonda trace z v2: 0 animacji poza wyjątkami” używa przenoszonej sondy G3 (spec, „Przenoszone”) i nie wymaga infrastruktury z E3.
- E2 zależy od N1, N2 i N4; spec zgadza się w N1, N2 i N4 („Blokuje E2”).
- `decisions/`: masterplan l. 35, spec l. 9 i structure l. 32 są ze sobą zgodne.
- U17: bramki CI na `dist` z kompilatorem, zgodnie z E1 i E3.
- Q18 („ocenia właściciel w E0”) mieści się w N5, czyli w E0 (c).

### Niewykonane kontrole (runda 3)

- Nic nie uruchamiałem.
- Spec czytałem tylko w zmienionych i powiązanych miejscach (grep), nie w całości.
- Raportu A z rundy 2 nie czytałem.
