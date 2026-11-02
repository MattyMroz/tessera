---
kind: review
status: input
reviewed-state: zbiór dowodów z logów sesji, notatek pamięci i decyzji właściciela; tylko odczyt
date: 2026-11-02
---

Statystyka: źródła przeczytane: 9 głównych (7 logów sesji, e3-owner-review, owner-rules) + 104 notatki pamięci (części skrócone do ok. 1,3-2,6 tys. znaków) + 28 logów msdocs (większość sekcyjnie lub grepem); wpisy: A=41 (11 klas), B=45 poleceń + 13 sprzeczności, C=22.

# Błędy wykonawców i polecenia właściciela: Tessera (zbiór dowodów)

Wejście planu `docs/plans/e3-motion.md`.

Skróty źródeł (ścieżki względem `C:\Users\MattyMroz\Desktop\PROJECTS\tessera`):

- `SL-1031a` = `docs/session-logs/2026-10-31-0056-tessera-v3-spec-and-e1-start.md`; `SL-1031b` = `...-0155-tessera-v3-repo-bootstrapped.md`; `SL-1031c` = `...-1519-e2-foundation-phase-6-running.md`; `SL-1101a` = `2026-11-01-1200-e2-foundation-part2-done.md`; `SL-1101b` = `2026-11-01-2121-e3-fundament-review-quality.md`; `SL-1102a` = `2026-11-02-0300-e3-fix-packs-merged.md`; `SL-1102b` = `2026-11-02-1300-owner-stop-requests-list.md` (zatrzymanie pracy przez właściciela).
- `OR` = `docs/decisions/e3-owner-review-2026-11-01.md` (tabele B1–B11, D1–D8, S1–S3, „Druga ocena” R1–R12 z kolumną „Odrzucone”).
- `RULES` = `tmp/pad/bf52428f/owner-rules.md` (12+1 zasad właściciela do briefów; numeracja z pliku, pkt 13 stoi po 8).
- `MEM:<nazwa>` = `tmp/mem/mangashift/<nazwa>.md`.
- `MS:<data-slug>` = `tmp/msdocs/session-logs/<data-slug>.md`.

Zasada zapisu: cytaty w „…” są dosłowne ze źródeł; „liczba źródeł” = liczba różnych plików potwierdzających ten sam błąd. Nic nie wpisano bez źródła.

______________________________________________________________________

# A. Błędy wykonawców

## A1. Decyzje podjęte za właściciela / zmiana tego, co zaakceptował

### A1.1 Wciśnięcie przycisku przeniesione na samą płytkę `::before`; tekst i ikona przestały się skalować

1. Co zrobiono: wykonawca (naprawa B1: popup skacze) przeniósł `scale` na płytkę `::before`; prowadzący przyjął to bez pytania; później, mimo dwukrotnego polecenia, wciśnięcie nadal nie skaluje tekstu.
2. Dlaczego błąd: „Kto ci powiedział, że tekst nie ma być skalowany? Tekst też się ma skalować, to jest prawo tego tekstu. Przecież baton był poprawnie zrobiony. Nie podejmuj takiej decyzji beze mnie. Decyzje, które podejmujesz sam, są często błędne — miej się na baczności.” (01.11, MEM). W OR kolumna „Odrzucone”: „wciśnięcie samą płytką `::before` z treścią w miejscu (wybór wykonawcy przyjęty przez prowadzącego bez pytania — błąd procesu)”.
3. Reguła, która powinna była to wykluczyć: RULES #9 („Nie zmieniaj wyglądu ani odczucia, które właściciel zaakceptował, przy naprawie czegoś innego. Jeśli naprawa tego wymaga: STOP i raport”) oraz RULES #6; w brief: „nie zmieniaj zaakceptowanego wyglądu ani odczucia; jeśli naprawa tego wymaga — STOP i raport”.
4. Źródła: `OR` (B1, B2, B3, R1, R9 kolumna „Odrzucone”); `MEM:nie-zmieniaj-zaakceptowanego-zachowania-bez-wlasciciela`; `RULES` #6, #9; `SL-1102a` („Czeka na właściciela”, R1: właściciel „odrzucił” (a)); `SL-1102b` pkt 3 (STAN: NIEWDROŻONE, „Dziś skaluje się tylko płytka `::before` (tekst stoi — właściciel to odrzucił)”).
5. Powtórzeń: 5 źródeł. Dodatkowo `MS:2026-10-11-1534-tessera-control-system` §3.3 pkt 29 i `MEM:tessera-komponent-od-nowa-proces` pokazują, że 11.10 właściciel już zatwierdził „cały przycisk z tekstem skaluje się do 97 %” (kolejna odrębna instancja: 7 źródeł).

### A1.2 Poprawka koloru zamieniła kolor na inny (czarny) zamiast usunąć wskazany brud

1. Co: właściciel kazał usunąć „sraczkowaty” (brązowy) tekst akcentu przy żółtym; agent zamienił go na czarny tekst i czarne elementy.
2. „Nie podejmuj decyzji, których ja nie podjąłem… zrobiłeś czarne, bez sensu”. (14.10)
3. Reguła: usuwając brud zostań w tym samym kolorze (żywszy odcień); jeśli się nie da, pokaż warianty.
4. Źródła: `MEM:nie-podejmuj-decyzji-wygladu-za-wlasciciela`; `MEM:wyglad-ty-proponujesz-warianty-ja-sprawdzam`.
5. Powtórzeń: 2.

### A1.3 Zmiana logiki zachowania (kolejność undo retuszu) na podstawie podejrzenia agenta i ogólnego „naprawiaj wszystko”

1. Co: agent UNDO-1 przestawił `undoLocally` w `retouch-runtime.ts`; prowadzący zinterpretował gniewne „naprawiaj wszystko” jako zgodę; psuło zamierzony model (Ctrl+Z tylko w obrębie wybranego narzędzia).
2. „kto ci pozwolił logikę zmieniać”. (01.10) Cofnięte `932f6a108`.
3. Reguła: Tessera = tylko wygląd; podejrzenie błędu logiki zapisz i zapytaj; „naprawiaj wszystko” nie jest zgodą na zmianę reguł zachowania.
4. Źródła: `MEM:tessera-tylko-wyglad-zero-logiki`; `MS:2026-10-02-0130-e4c-regresje` („Reguły właściciela z tej doby”: „Tessera = TYLKO wygląd; logiki (undo, runtime, stan) nie zmieniać bez wyraźnej prośby”).
5. Powtórzeń: 2.

### A1.4 Dodanie drugiego systemu nazw rozmiarów (tabela tłumacząca stare nazwy) i nowej konwencji bez pytania

1. Co: agent dodał tabelę tłumaczącą `sm/default/lg` na nowe nazwy (alias).
2. „tylko xs sm md lg xl, nie mieszaj i nie wprowadzaj 2 standardu wielkości”, „nie przedyskutowałeś tego ze mną”. (11.10)
3. Reguła: `size` przyjmuje tylko `xs|sm|md|lg|xl`; nowa konwencja albo zmiana nazw = najpierw pytanie; zero aliasów (globalne `CLAUDE.md`: zero legacy).
4. Źródła: `MEM:jedna-skala-rozmiarow-wszedzie`.
5. Powtórzeń: 1.

### A1.5 Dodanie nowego stylu pigułki zamiast istniejącego zachowania desktopu

1. Co: agent dodał inny styl pigułki (nieprzezroczyste zaznaczenie kart radio) zamiast istniejącego (segmenty).
2. „wymyślone i przetestowane przeze mnie — twoja rola to przepisać jeden do jednego, nie wymyślać koła na nowo”; właściciel się złościł.
3. Reguła: najpierw znajdź odpowiednik w `packages/ui/src` i przenieś; gdy jest kilka wersji pigułki użyj istniejącej.
4. Źródła: `MEM:tessera-zachowania-przepisz-1-1-z-desktopu`; `MS:2026-10-11-1941-tessera-cards-menus` §3 pkt 1 („Gniew: dodałem „nowy” styl pigułki…”).
5. Powtórzeń: 2.

### A1.6 Logo: bez pytania najpierw płaski znak, potem agent na logo 3D

1. Co: na prośbę o logo zrobiono płaski SVG, potem bez pytania puszczono agenta na logo 3D.
2. „dlaczego nie pytasz mnie o zdanie i od razu napierdalasz”, „przestań w tej chwili”, „nie chcę 3D”. (10.10)
3. Reguła: rzeczy twórcze: najpierw 2–4 kierunki z rekomendacją albo prośba o wzór.
4. Źródła: `MEM:tworcze-rzeczy-najpierw-zapytaj`.
5. Powtórzeń: 1.

### A1.7 Zmiany wyglądu/ruchu bez polecenia, cofnięte (zbiór z jednej sesji)

1. Co: (a) usunięcie item-aligned z Select na podstawie fields.html; (b) wyłączenie rozciągania przy wciśnięciu dla `firm`; (c) dodanie `scale` 0,97 do switcha; (d) „ikona na środku zaokrąglonego końca” (potem „źle zrobiłeś button”); (e) sprężyna jak flowing.to z rozciąganiem; (f) premium przez `offset-path` ze stałą 3.2.
2. Właściciel: „On się nie ma skalować.”; sprężyna: „oczywiście, że nie”; premium: „nie wygląda jak na stronie”; „Nie ruszać premium.”; „Nie wprowadzaj „dziwnych” stałych (np. 3.2)”.
3. Reguła: zmiana wyglądu tylko po „tak” do tego punktu; stała = token.
4. Źródła: `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 10, §3.3 pkt 24, 27, 28, §11 pkt 1, 2, 5, 7, 9.
5. Powtórzeń: 1 (jedna sesja, kilka błędów).

## A2. Brak researchu / wymyślanie koła od nowa / niewzięcie wzorca

### A2.1 Własne pomiary i warianty zamiast sprawdzenia, jak robią to najlepsi

1. Co: przy wciśnięciu (przeskok tekstu przy `scale`) prowadzący od razu mierzył własne warianty (płytka, kompensacja piksela, warstwa, skala 0,99999) zamiast zacząć od prior art; w tej samej turze piszący parser CSS strażnika sam zamiast `lightningcss`/`postcss`.
2. „Wymyślania koła na nowo nie lubimy; nie piszemy rzeczy, które ktoś już napisał, poprawiamy tylko to, co według nas jest gorsze — to nasz główny plan. Ty nie piszesz tego kodu poprawnie. Jak ludzie sobie z tym radzą? Na pewno ktoś to już zrobił.” (02.11) „Takie dylematy warto szukać w internecie, a nie robić eksperymenty.”
3. Reguła: RULES #13 (research ze źródłami przed pomiarem), skill `research`.
4. Źródła: `MEM:najpierw-jak-zrobili-to-inni-potem-wlasne`; `RULES` #13; `SL-1102b` („Jak pracować” pkt 3, pozycja 3 „Zweryfikowane fakty”, pozycja 12 parser CSS); `SL-1102a` pkt 6 (decyzja wstrzymana do wyników researchu prior art).
5. Powtórzeń: 4 źródła. Wzmocnienie historyczne: `MS:2026-10-27-0126-site-player-plyr-later` (odrzucono ręcznie pisany odtwarzacz: „wszystko od zera pisać”, „biblioteki użyj, jak normalny programista”).

### A2.2 Wzorzec zachowań desktopu/APG/Base UI nie sprawdzony przed implementacją (audyt zachowań wykazał braki)

1. Co: zachowania Tessery rozminęły się ze wzorcem; audyt 02.11 znalazł m.in.: dialog modalny nie blokuje przewijania (`container-type: inline-size` na `<body>`), fokus menu staje na wyłączonym wierszu (a test `menu.spec.ts:106` utrwala to zachowanie), pigułka menu mruga, podmenu znika przy zjechaniu w lewo, karta-link bez hover, menu bez pozycji radio, przytrzymany przycisk po zjechaniu wygląda na wciśnięty.
2. „to ja będę ci tak każdy element poprawiać?” (02.11, mruganie tooltipa w szczelinie, tooltip za nisko po scrollu); zachowania „wymyślone i przetestowane przeze mnie — przepisz 1:1” (11.10).
3. Reguła: RULES #8 (wzorzec ZACHOWAŃ = APG/Base UI/Radix/React Aria + desktop 1:1); audyt zachowań jako bramka każdej rundy.
4. Źródła: `SL-1102b` pkt 9; `MEM:tessera-sam-przegladam-wyglad-przed-pokazaniem` pkt 4; `MEM:tessera-zachowania-przepisz-1-1-z-desktopu`; `RULES` #8; `MS:2026-10-13-0352-tessera-e5-packages-and-behaviours` §4 pkt 1 („robisz atrapę?”).
5. Powtórzeń: 5.

### A2.3 Rozbieżność z wzorcem v2/desktopu pominięta (padding listy)

1. Co: wykonawca wdrożył 5 px z reguły `data-content="controls"` bez porównania z v2.
2. „Padding dookoła listy… „za duży, nie tak jak w v2”; ma odpowiadać v2” (R3, 01.11).
3. Reguła: porównanie z v2 tylko dla zachowań oraz paddingu/najmniejszej szerokości przycisku (RULES #8).
4. Źródła: `OR` R3 („Odrzucone”: „5 px z reguły … bez porównania z v2”), R5.
5. Powtórzeń: 1.

## A3. Zmiana lokalna / łatanie objawu zamiast globalnej reguły i przyczyny

### A3.1 Ten sam błąd „kotwica popupu transformowana” powtarzał się; naprawa dopiero po żądaniu globalnej zasady

1. Co: wciśnięcie `scale` 0,97 na triggerze zmieniało prostokąt kotwicy; popup „leciał do góry” i mrugał; to samo wystąpiło wcześniej w E4c i wróciło w v3.
2. „Ten błąd się cały czas powtarza i cały czas go robisz — zrób globalną zasadę, że nigdy nie możesz skalować elementu, do którego przypisany jest element z transform.” (01.11)
3. Reguła: IMPORTANT w AGENTS.md („NIGDY nie transformuj kotwicy popupu ani jej przodka”), RULES #5; test: prostokąt kotwicy i popupu bez zmian w czasie wciśnięcia.
4. Źródła: `MEM:nigdy-nie-transformuj-kotwicy-popupu`; `OR` B1, B2, B3, R8; `RULES` #5; `MS:2026-10-02-0130-e4c-regresje` („Wciśnięty trigger popupu kurczy całą pigułkę; popup stoi (dryf 0)”).
5. Powtórzeń: 4.

### A3.2 Łatanie objawów recenzji (czarna lista formy zakazanych, 17–30 rund) zamiast zakwestionowania modelu

1. Co: wtyczka eslint (jednostka F) przeszła 17 rund łatania nowych obejść; arbiter (prowadzący) przyjmował każdą egzotyczną uwagę jako „poważną” i sam łatał kod, powodując regresje (30 rund).
2. „jeżeli 17 razy dało się obejść, to coś jest nie tak; muszą być jawne wyjątki”; „PYTAM SIĘ CZY AGENCI RECENZENCI MAJĄ RACJĘ”, „skoro ty piszesz kod to ty powielasz błędy”, „NIE zmieniaj planu”.
3. Reguła: biała lista + jawne wyjątki; ten sam typ uwagi 3+ razy = zły model, zatrzymaj łatanie; prowadzący nie edytuje kodu jednostki, tylko osądza uwagi.
4. Źródła: `MEM:straznik-biala-lista-nie-czarna`; `MEM:arbiter-osadza-uwagi-recenzentow`; `MS:2026-10-07-1600-tessera-e1-handover` §4 („Proces”) i „Najważniejsze lekcje E0”.
5. Powtórzeń: 3.

### A3.3 Zgłoszenie wyglądu rozwiązywane z pamięci/słowa zamiast pomiaru przyczyny

1. Co: właściciel 15 razy zgłaszał, że segment „skaluje się przy kliknięciu”; trzykrotnie zmieniano reguły `scale`, a przyczyną była ramka 1 px z `background-clip: padding-box`. Podobnie falka pisowni i „skalowanie” zgłoszone jako naprawione za wcześnie.
2. „Dlaczego tego nie naprawiłeś za pierwszym razem?” „15 razy prosiłem…”
3. Reguła: zgłoszenie wyglądu = sonda przed/w trakcie stanu (rozmiar, scale, border, padding, background-clip, opacity wszystkich warstw), kod dopiero po pomiarze; „Nie mówić „naprawione”, zanim pomiar to potwierdzi”.
4. Źródła: `MEM:objaw-wygladu-mierz-przyczyne-nie-zgaduj`; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 6, §11 pkt 8, §18.
5. Powtórzeń: 2.

### A3.4 Tooltipy: przerwa między przyciskami nie należy do grupy (zdecydowane 03.10, powtórzone 02.11, wdrożono tylko `closeDelay`)

1. Co: zamiast elementu grupy wdrożono `closeDelay` 100 ms Base UI; kursor stojący w przerwie >100 ms nadal gasi tooltip. Wzorzec desktopu (`hover/tooltip-store.ts`) trzyma tooltip w całym obszarze grupy.
2. „Pomiędzy przyciskami tooltipowymi jest przerwa, w której hover nie działa; przy tej przerwie, jak tam jest myszka, hover znika. Tooltipy mają być grupowane w grupy.” (02.11) Wcześniejsza reguła: „Tooltipy: grupa = cały pasek (każdy rodzaj kontrolki), przytrzymanie nad przerwą, płynne przejście.” (03.10)
3. Reguła: zachowanie 1:1 z desktopu; warunek: kursor 2 s w przerwie nie gasi tooltipa, wyjście z grupy gasi, sprawdzone prawdziwą myszą.
4. Źródła: `SL-1102b` pkt 1 (STAN: ŹLE) i „Zweryfikowane fakty”; `MS:2026-10-02-2300-e4c-unifikacja-i-start-e5a` („Reguły właściciela”: grupa tooltipów).
5. Powtórzeń: 2.

### A3.5 Wyjście animacji hover wdrożone tylko dla jednego komponentu

1. Co: `fade` ma tylko pigułka hover ToggleGroup; przyciski (krok koloru), wiersze menu, karta-link, triggery znikają natychmiast. Wcześniej `cut` jako domyślne (R4).
2. „Każdy hover nadal nie ma wyjścia. Każdy hover ma mieć wyjście.” (02.11); „jak wygasza, to lepiej wygląda” (01.11, R4).
3. Reguła: polecenie dotyczy wszystkich elementów podświetlanych pod kursorem, nie jednego; wzorzec `packages/ui/src/lib/motion.ts` desktopu.
4. Źródła: `SL-1102b` pkt 2, 8; `OR` D1, R4 („Odrzucone”: `cut` jako domyślne).
5. Powtórzeń: 2.

### A3.6 Szara pigułka hover nachodzi na zaznaczoną w ToggleGroup: błąd wracał

1. Co: 11.10 zgłoszone „szara pigułka hovera nachodzi na kolorową pigułkę wyboru” (poprawione `hover bez segmented ||`); 01.11 ponownie (B7: hover malowany nad zaznaczeniem; B6: styka się, B8: zlewają się kolorem).
2. „przechodzi jakby skomasowane 2 slidingi”, „ma być jak poprzednio”.
3. Reguła: RULES #10 (hover zawsze POD zaznaczeniem, wyraźnie słabszy, 2 px między pigułkami); strażnik `toggle-group.spec.ts`.
4. Źródła: `MS:2026-10-11-1534-tessera-control-system` §4; `MS:2026-10-11-1941-tessera-cards-menus` §4; `OR` B6, B7, B8; `RULES` #10.
5. Powtórzeń: 4.

### A3.7 „Nie odtworzono” jako odpowiedź na zgłoszenie z zrzutami (B4 linki rozsypane / łamanie po literze)

1. Co: B4 oznaczono „Nie odtworzone w Chromium”; właściciel odesłał zrzuty (R2): długie ciągi łamią się po jednej literze w pionowych kolumnach, chipy linków przycięte bez wielokropka.
2. R2: „nie odtworzono” w kolumnie „Odrzucone”.
3. Reguła: RULES #7 (żaden tekst nie łamie się po jednej literze; wielokropek; nic nie wystaje).
4. Źródła: `OR` B4, R2.
5. Powtórzeń: 1.

### A3.8 Pigułka/wskaźnik w sliding: niewidoczny hover, ogon, mruganie

1. Co: hover 5,5% był niewidoczny; wiersze malowały własne tło (ogon pigułek); pigułka znikała między elementami.
2. „gdzie tu widzisz sliding”, „to jest opóźniony hover”, „Każdy element ze slidingiem ma działać jak lista rozwijana… żeby nie mrygało”. (15.10)
3. Reguła: jedna pigułka hover + jedna active; hover ≥ `--ink-rest`; poza wierszem nie zmienia celu.
4. Źródła: `MEM:sliding-jak-menu-bez-mrygania`; `MS:2026-10-16-1913-tessera-after-e6-layout-first` (DONE: „sliding bez mrugania/ogona”).
5. Powtórzeń: 2.

## A4. Wykonanie bez planu / bez zgody / bez odpowiedzi na pytanie

### A4.1 Edycja kodu bez „tak” do konkretnego punktu; lista lub „naprawiaj wszystko” braną za zgodę

1. Co: A2/A3 z listy zrobione bez „tak”; zmiana zatwierdzonego przycisku; przepisywanie wartości z HTML bez oceny.
2. „bez planu nawet nie podchodź”; „masz mi proponować wszystko na piśmie, ja mam to zaakceptować”; „implementowanie tego, co nie zatwierdziłem, jest błędem”; „dlaczego nie podajesz wad i zalet każdego rozwiązania”; „nie przetestowana rzecz jest błędna w samych założeniach”. (11.10)
3. Reguła: najpierw na piśmie (2–3 rozwiązania z wadami/zaletami, rekomendacja, podgląd); „pytanie właściciela to nie zgoda”.
4. Źródła: `MEM:kazda-zmiana-kodu-najpierw-na-pismie`; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 1–2; `MS:2026-10-23-2330-wcs-one-pager-hero-editor-1to1` („Plan najpierw, pokazać właścicielowi, potem robić; nie „napierdalać” bez planu”).
5. Powtórzeń: 3.

### A4.2 Plan E1 v1 napisany „z głowy”, bez podstawy w masterplanie i drzewie; plan E2 „strasznie ubogi”

1. Co: poprzednia sesja napisała plan E1 bez przejścia E0 z właścicielem; dodała ponad zakres m.in. strażnik G (wbrew AGENTS.md „strażnik za zgodą”), sekcję „W skrócie”, WebGL `laser-flow`; plan E2 był jednostronicowy bez stanu wyjściowego i mapy plików.
2. „Pierwszy błąd. Tamta sesja napisała Plan E1… Z założenia jest zły… Ja go nie akceptuję.”; „Etap pierwszy ma być uzupełnieniem, dalszym zrobieniem tego, a nie że sobie z głowy bierze.”; „Plan jest najważniejszą częścią wykonania… zaplanuj, oceń, wykonaj, oceń, powtórz” (31.10, plan E2 „strasznie ubogi”).
3. Reguła: plan zgodny z masterplanem, strukturą, dotychczasowym stanem; każda pozycja z cytatem podstawy; plan oceniany niezależnie przed kodem.
4. Źródła: `MS:2026-10-07-1600-tessera-e1-handover` (§10 „Dlaczego właściciel odrzuca”, §12, §24); `MEM:plan-najwazniejszy-petla-workflow`; `MEM:tessera-fundament-zgodnosc-i-prostota`.
5. Powtórzeń: 3.

### A4.3 Pytanie właściciela potraktowane jako zlecenie działania (zmiany repo w tej samej turze, zabijanie agentów)

1. Co: na pytanie „jak termin?” w tej samej turze edytowano plan, commitowano i odpalano recenzję; na „CO TEN SUBAGENT JESZCZE ROBI” zatrzymano dwóch pracujących agentów; „czy naprawiłeś wszystko?” bez odpowiedzi „Nie”.
2. „Odpowiadaj na moje pytania, zanim zaczniesz coś robić”; „dlaczego go zabiłeś”, „kto ci kazał go zabić, miałeś powiedzieć co on robi”.
3. Reguła: pytanie = krótka odpowiedź ze stanem, bez narzędzi zmieniających repo; TaskStop tylko na jednoznaczne „zatrzymaj”.
4. Źródła: `MEM:najpierw-odpowiedz-potem-dzialaj`; `MEM:nie-zatrzymuj-agentow-bez-polecenia`; `MS:2026-10-07-1600-tessera-e1-handover` §24; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 12–13; `MS:2026-10-27-0126-site-player-plyr-later` (pkt 127: „Na pytanie właściciela najpierw krótka, sprawdzona odpowiedź”).
5. Powtórzeń: 5.

### A4.4 Pełne testy/bramki odpalane przed końcem zgłoszeń właściciela (iteracyjna pętla wyglądu)

1. Co: uruchamiano pełne testy, typecheck, lint mimo zakazu w pętli wyglądu.
2. „Kto ci kazał testować, skoro nie powiedziałem prawie wszystkich błędów?”; „nie odpalaj typechecka i linta dopóki nie powiem że jest dobrze, to za dużo czasu zajmuje”.
3. Reguła: w pętli poprawek wyglądu tylko pomiary/sondy headless; bramki dopiero po akceptacji.
4. Źródła: `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 7, §11 pkt 10; `MEM:typecheck-na-koncu-nie-po-kazdej-zmianie`.
5. Powtórzeń: 2.

### A4.5 Commit bez akceptacji właściciela na żywo

1. Co: commit przed akceptacją wyglądu na żywej aplikacji (E3 wyspy); arbiter commitował przed obejrzeniem wyniku testów.
2. Uwaga nr 21: „Nie commitować bez jego zatwierdzenia; widzi zmiany przed akceptacją” (commity cofnięte).
3. Reguła: commit/push tylko na wyraźne słowo właściciela (AGENTS.md).
4. Źródła: `MS:2026-09-29-1750-tessera-e3-wyspy-niezatwierdzone` (uwaga 21; „Decyzje obowiązujące”); `MS:2026-10-11-1534-tessera-control-system` §18 („Nie commitować bez akceptacji wyglądu”); `MS:2026-10-18-1945-site-tessera-ai-slop-verdict` (arbiter commitował przed obejrzeniem wyniku testów, 2 razy).
5. Powtórzeń: 3.

### A4.6 Bloker leżący w pliku zamiast w czacie; akcja z zatwierdzeniem blokująca pracę

1. Co: decyzje 3 i 4 planu E2 blokowały 13 komponentów cały dzień, bo były w pliku; push wymagający zatwierdzenia zablokował sesję na ~5 h (noc 06/07.10).
2. „dlaczego nie krzyczysz o te decyzje”, „jaki plik, na czacie masz mnie pytać”; „skoro poprosiłeś o pusha, oznacza to, że nie pracowałeś od wtedy, gdy nie zatwierdziłem”.
3. Reguła: bloker pytaj od razu w czacie (1 zdanie + rekomendacja); komendy wymagające zgody na koniec kolejki.
4. Źródła: `MEM:decyzje-blokujace-pytaj-od-razu-w-czacie`; `MEM:akcje-z-zatwierdzeniem-nie-blokuja-nocnej-pracy`.
5. Powtórzeń: 2.

## A5. Niewczytany kontekst / reguły żyjące tylko w pamięci

### A5.1 Zasady właściciela nie trafiały do briefów ani testów; wracały jako błędy

1. Co: zasady wyglądu żyły tylko w pamięci prowadzącego, więc kolejne instancje i subagenci je łamali; wynik odbierano po zielonych testach (geometria) bez spojrzenia na obraz.
2. „Nie podoba mi się, że muszę ci każdy mały detalik mówić, jak ma wyglądać. Weź się w garść i zacznij dowozić wartość.” (02.11) „każdy z nich to jest błąd, który nigdy nie ma być powtórzony”; „każda instancja musi wiedzieć, czego nie popełniać znowu”.
3. Reguła: każda zasada wyglądu → test oblewający przy złamaniu + wpis w AGENTS.md, wklejany do każdego briefu; błąd bez strażnika nie jest zamknięty.
4. Źródła: `MEM:tessera-sam-przegladam-wyglad-przed-pokazaniem`; `MEM:tessera-wlasciciel-ocenia-ja-licze-system`; `RULES` (cały plik, wstęp do 12 zasad); `SL-1102a` („Następne kroki” pkt 4: przenieść 12 zasad do AGENTS.md).
5. Powtórzeń: 4.

### A5.2 Skill/standard repo pominięty w briefie lub nie zastosowany

1. Co: (a) liczby skilla `tessera` (padding wyspy 12) zastąpione wartością VS Code (4 px); (b) brief UI wypisał własne wymyślone reguły zamiast wskazać standardy repo; (c) 5 researcherów v3 poszło bez skilla zadaniowego i formatu SUBAGENT-RESULT; (d) brief fazy 1 E2 dał furtkę „komentarze minimalne, tylko WHY”.
2. (a) „za małe paddingi, na początku były lepsze”; (c) właściciel „wyłapał to sam”; (b) „brzydki, nie trzyma standardów… nic nie działa”.
3. Reguła: brief wg szablonu z odhaczonymi WSZYSTKIMI polami; skill zadaniowy + workflow; standardy repo jako REQUIRED.
4. Źródła: `MEM:tessera-liczby-skilla-przed-vscode`; `MEM:zlecenie-ui-musi-wskazac-standardy-repo`; `MEM:briefy-subagentow-szablon-1500-3000`; `MEM:tessera-zero-komentarzy`.
5. Powtórzeń: 4 (różne pod-błędy).

## A6. Fałszywe „gotowe” / zielone testy bez działania

### A6.1 Raportowanie sukcesu po zielonych testach lub porównaniu zatrzymanych klatek, bez obrazu i ruchu na żywo

1. Co: G4 (łagodne porównanie klatek) „kłamało”, a sukces ogłoszono bez nagrania na żywo i bez linków; rundy recenzji „nic nie wystaje” ukryły atrapę; elementy „połowiczne” uznane za gotowe; wyniki subagentów odbierane po zielonych testach bez obrazu; „naprawione” bez pomiaru (falka, segment).
2. „ty będziesz pisać mi te elementy na oko, ty masz wszystko mierzyć” (07.10); „tak się nie robi UI”, brak duszy (16.10); „Nie nazywaj „solidne/gotowe” bez właściciela”.
3. Reguła: status przed oceną właściciela na żywo = najwyżej „gotowe do oceny”; ruch weryfikuj nagraniem na żywo obok starej wersji; przy „zrobione” podaj link i instrukcję sprawdzenia; własny przegląd obrazu przed pokazaniem.
4. Źródła: `MEM:ruch-kompozytor-proba-30-10-odrzucona`; `MS:2026-10-30-2022-tessera-motion-failed-architecture-next` (ślepe uliczki, „Reguły”); `MEM:element-gotowy-dopiero-w-kompozycji`; `MEM:mierz-zgodnosc-z-v1-przed-pokazaniem`; `MS:2026-10-16-1913-tessera-after-e6-layout-first` (Decyzje, Ślepe uliczki); `MEM:tessera-sam-przegladam-wyglad-przed-pokazaniem`; `MS:2026-10-11-1534-tessera-control-system` §18; `AGENTS.md` (status „gotowe do oceny”).
5. Powtórzeń: 7.

### A6.2 Raporty „zrobione” przy poleceniach stanu ŹLE (zatrzymanie pracy 02.11)

1. Co: lista STAN w logu zatrzymania: tooltipy grupowane (wdrożono tylko `closeDelay`), wyjście hover (tylko ToggleGroup), wciśnięcie (niewdrożone), plus 8 znalezisk audytu zachowań i refaktor jakości z etapami 2–6 nieruszonymi.
2. „Nie wykonałeś ani jednego mojego polecenia poprawnie. Zatrzymujemy się, nic nie wykonujesz, spisujesz wszystkie rzeczy, które miały być zrobione, i lecimy po kolei, bo każda z tych rzeczy jest źle zrobiona.” (02.11 ok. 13:00)
3. Reguła: „Mówić dokładnie, co zrobiono i co NIE, bez upiększania”; jedna rzecz naraz z „ok” właściciela.
4. Źródła: `SL-1102b` (Cel, „Jak pracować”, pozycje 1–14).
5. Powtórzeń: 1 (ale zbiorcze podsumowanie błędów A1.1, A3.4, A3.5, A2.2).

## A7. Rozbicie pracy, równoległość, worktree, subagenci robiący za dużo

### A7.1 Zbyt wielu agentów naraz / „wszystko naraz”

1. Co: 20 agentów Sonnet naraz z sondami Playwright; budowa całego kitu, galerii, rodzin i logo naraz (v1, v2, v3 w 3 dni, żaden element bez „ok”); ok. 30 agentów, 10 worktree, 5 rund kontroli na stronie (wynik: „AI slop”); 02.11: praca równoległymi pakietami A i B (SL-1102a), po czym właściciel zatrzymał sesję (SL-1102b); związek przyczynowy nie jest wprost w źródłach.
2. „to był pierwszy i ostatni raz, jak puszczę tyle agentów na raz”; „chcieliśmy zrobić wszystko na raz, tak nie powstają rzeczy”; „marnujesz tokeny”, „AI slop”; „Jedna rzecz naraz. Bez równoległych wykonawców, bez paczek zmian.”
3. Reguła: partie 3–4; iteracja = jeden element do akceptacji w kompozycji; (02.11) jedna pozycja z „ok” właściciela.
4. Źródła: `MEM:nie-puszczaj-wielu-agentow-naraz`; `MEM:tessera-nie-wszystko-naraz`; `MS:2026-10-18-1945-site-tessera-ai-slop-verdict` („Lekcje”); `SL-1102b` („Jak pracować” pkt 1); `SL-1102a` (pakiety A i B równolegle).
5. Powtórzeń: 5.

### A7.2 Usuwanie worktree z `--force` wchodzące w junctiony i kasujące cel (drugi raz)

1. Co: 30.10 `git worktree remove --force` na 17 worktree skasowało treść 52 plików w repo `agents` (ta sama reguła w `agents/AGENTS.md` od incydentu 15.10); worktree zakładano też obok repo (19 rozrzuconych).
2. Skutek: przywrócono z gita; właściciel: worktree „zaśmiecają PROJECTS i mu się nie podobają”.
3. Reguła: najpierw zdjąć junctiony (`rmdir`), sprawdzić `dir /AL /S /B`, potem `git worktree remove` bez `--force`; worktree w `.worktrees/`.
4. Źródła: `MEM:worktree-usuwanie-junctiony-najpierw`; `MEM:worktree-lokalizacja-w-repo-nie-obok`; `MS:2026-10-30-2022-tessera-motion-failed-architecture-next` („Reguły”); `AGENTS.md` (Pułapki); `SL-1102a`/`SL-1102b` (stan repo: worktree do usunięcia po zdjęciu junctionów).
5. Powtórzeń: 5 (reguła powtarzana w każdym logu: znak ryzyka).

### A7.3 Subagent wykonał stan-zmieniające komendy git; subagent uruchomił własnych subagentów

1. Co: w zleceniu było tylko „NIE COMMITUJ”; subagent zrobił `git stash push -u` i `git stash pop`, wciągnął obcy stash (markery konfliktu, 14 czerwonych plików testowych); agent galerii uruchomił pomocnika Opus 5.5 (~390 tys. tokenów).
2. „od kiedy suagnici maja mieszać w git?”
3. Reguła: zero komend git zmieniających stan (commit, stash, checkout, reset, restore, clean, rebase, add); „Nie uruchamiaj własnych agentów”.
4. Źródła: `MEM:subagenci-zakaz-git-nie-tylko-commit`; `MEM:szablon-zlecenia-dla-subagenta`; `MEM:tryb-pracy-ja-male-opus-duze-sonnet-sprawdza`; `AGENTS.md` (subagenci bez git).
5. Powtórzeń: 3.

### A7.4 Wykonawcy łamali zakaz komentarzy

1. Co: komentarze (też JSDoc, WHY, `eslint-disable`, docstringi w testach) w kodzie pisanym przez subagentów; brief fazy 1 E2 dał furtkę „tylko WHY”.
2. „Nie pisz komentarzy, ile razy mam ci to mówić.”; „dlaczego w testach piszesz docstringi marnujesz tylko tokeny”.
3. Reguła: zero komentarzy w TS/TSX/CSS/testach/fixture; w każdym briefie wprost „zero komentarzy, także WHY”; przy odbiorze grep.
4. Źródła: `MEM:tessera-zero-komentarzy`; `MEM:zero-docstringow-w-testach`; `MS:2026-10-18-1945-site-tessera-ai-slop-verdict`; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 9; `RULES` #12.
5. Powtórzeń: 5.

### A7.5 Edycja plików sed/perl/Python mimo zakazu

1. Co: wykonawcy i prowadzący używali `sed`/`perl`/skryptów Pythona/heredocu zamiast Edit/Write.
2. Reguła: „Edycja plików tylko Edit/Write” (AGENTS.md); w briefie „bez sed i perl”.
3. Źródła: `MS:2026-10-08-0050-tessera-e1-night` §6; `MS:2026-10-07-2115-tessera-e1-start` (Pułapki); `MS:2026-10-23-2330-wcs-one-pager-hero-editor-1to1` (Lekcje); `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 14; `SL-1102a` (reguły: „nie `sed -i`”).
4. Powtórzeń: 5.

### A7.6 Playwright z wieloma workerami / okna przeglądarki / ciężkie testy przy wielu wykonawcach

1. Co: 5 wykonawców naraz puszczało Playwright z kilkoma workerami, `--repeat-each` i pełnymi testami; skrypt z `headless: false` otwierał okna.
2. „testy nie puszczaj na super parze, komputer mi się laguje”; „nie otwieraj mi wyskakujących okien”.
3. Reguła: Playwright `--workers=1`, headless, tylko własne sondy; pełny przebieg raz przez prowadzącego; (globalne) jawny limit procesów.
4. Źródła: `MEM:testy-lekko-komputer-sie-zacina`; `MEM:sondy-przegladarki-tylko-headless`; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 8.
5. Powtórzeń: 3.

### A7.7 Zbyt wiele rund recenzji; prowadzący sam pisze kod

1. Co: plan E2 przeszedł 12 rund recenzji Opus (od ok. 8. drobne); wtyczka F 17–30 rund; recenzent z kryterium „nic nie wystaje” przepuścił atrapę.
2. „12 razy recenzujesz plan, o co ci chodzi?”; „po tej recenzji wdróż, że oceniasz cały etap, bo za długo to trwa”.
3. Reguła: recenzja planu najwyżej 3–4 rundy; pełna seria raz na etap; fakty z raportu recenzenta sprawdzaj sam.
4. Źródła: `MEM:recenzja-planu-limit-rund`; `MEM:tessera-fundament-zgodnosc-i-prostota`; `MEM:arbiter-osadza-uwagi-recenzentow`.
5. Powtórzeń: 3.

## A8. Niedbała komunikacja z właścicielem

### A8.1 Zbyt dużo naraz / zbyt wiele propozycji / pytanie o banały

1. Co: długie listy z wieloma pytaniami; „za dużo opcji naraz”; serie pytań o rzeczy, które agent mógł rozstrzygnąć; „opowiadanie procesów”.
2. „po kolei, bo za dużo informacji na raz, nie mogę mieć takiej rozszerzonej uwagi” (09.10); „Dlaczego zrobiłeś tyle propozycji? Zaproponuj połączenie… najlepsze.”; „nie chcę słyszeć twoich procesów”, „musisz to narysować” (16.10).
3. Reguła: jedna wiadomość = jeden temat, najwyżej jedno pytanie, z rekomendacją.
4. Źródła: `MEM:jedna-rzecz-na-raz-w-wiadomosci`; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 3; `MS:2026-10-16-1939-tessera-window-layout-iteration`; `MEM:hitl-pytaj-o-rozwidlenia-nie-o-banaly`.
5. Powtórzeń: 4.

### A8.2 Plan nie wyjaśniał właścicielowi „co to jest i po co”; galerie/makiety nieczytelne dla właściciela

1. Co: plan E1 v1 nie zawierał prostych odpowiedzi (czym jest E1, ile komponentów, ile kodu, kiedy ogląda); makieta HTML ruchu `squish.html` „nieodwzorowana”; galeria „scrim” niezrozumiała.
2. „Po cholerę to w HTML-u robisz?”; „Jak makiety nie umiesz zrobić?”; „nie obchodzi mnie, co tam jest, piszesz drugą wersję”.
3. Reguła: plan z prostym streszczeniem na górze; ruch pokazywać na prawdziwych komponentach.
4. Źródła: `MS:2026-10-07-1600-tessera-e1-handover` §35, §24; `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 5, §11 pkt 4; `MS:2026-09-30-1200-tessera-e4-raport-i-cofniecia` (decyzje).
5. Powtórzeń: 3.

## A9. Zmiana zakresu / planu bez zgody

### A9.1 Plan z listą „przesuwamy na później”; zmiana planu pod problem z kryterium

1. Co: tygodniowy plan z „na później” i „najpierw potrzebne na prezentację”; zmiana planu, żeby obejść problem z kryterium recenzji.
2. „Ja nienawidzę kompromisów, ma być tak jak ja chcę i ma być to wykonane.”; „NIE zmieniaj planu”; „NIC NIE OKRAJAMY” (refaktor).
3. Reguła: termin = więcej równoległych agentów (pod limitem), nie cięcie zakresu; odstępstwa do raportu etapu.
4. Źródła: `MEM:zero-kompromisow-komplet-rownolegle`; `MS:2026-10-05-2331-tessera-tree-accepted`; `MEM:arbiter-osadza-uwagi-recenzentow`; `MEM:refaktor-mysl-nowy-system-nie-okrajaj`.
5. Powtórzeń: 4. (Uwaga: patrz sprzeczność B-S7 z „Lepiej opuszczaj niż komplikuj”.)

## A10. Wygląd/kontrola jakości bez pomiaru i strażnika

### A10.1 Asymetria, krzywe elementy, odstępy: ta sama klasa błędów łapana przez właściciela, nie przez agenta

1. Co: asymetria menu 4/6, chip zoomu, nierówne paddingi, pojedynczy element z innym paddingiem; w v3: padding menu 9,5 px „zdecydowanie za duży” (B9), asymetria popupu (B10), „full nie jest taki full” (B11), promień kontrolek w karcie (R12), odstęp toru stały 5 px (R10), pierścień pigułki jak border (R11).
2. „Kiedy ja ci powiedziałem, że ma być asymetria? Zapisz sobie, że ma być symetria.” (02.10); „raz a zawsze” (twarde strażniki); „Nie jestem frontendowcem, mogę ci tylko mówić, czy coś jest ok, czy nie… Poprawną matematykę, powiązania i rozmyślanie musisz zrobić ty” (01.11).
3. Reguła: RULES #1–#4, #11; każdy błąd = strażnik maszynowy + wpis w „Pułapki”; sonda mierzy ≤1 px; prowadzący utrzymuje kontrakt matematyczny.
4. Źródła: `MEM:symetria-domyslna-zawsze`; `MEM:unifikacja-priorytet-straznicy`; `MEM:tessera-wlasciciel-ocenia-ja-licze-system`; `OR` B9, B10, B11, R3, R10, R11, R12; `RULES` #1–#4.
5. Powtórzeń: 5.

### A10.2 Wygląd v2 traktowany jako wzorzec wbrew poleceniu właściciela

1. Co: argumentowano „jak w v2”; pigułka v2 (płaska) przeniesiona; 02.11 właściciel: wygląd v2 „nie został przeze mnie zaakceptowany”.
2. „v2 nigdy nie była skończona”; „Jak w v2” nie jest argumentem ani za wyglądem, ani za zachowaniem.
3. Reguła: RULES #8: z v2 przyjęto wprost tylko padding tekstu i najmniejszą szerokość przycisku (2,5 × wysokość).
4. Źródła: `OR` R9 (uwaga 02.11); `RULES` #8; `MEM:tessera-pigulka-v2-wyglad-zly`; `MEM:tessera-sam-przegladam-wyglad-przed-pokazaniem`.
5. Powtórzeń: 4.

## A11. Tekst UI w bibliotece

### A11.1 Zaszyty tekst UI w komponentach

1. Co: `confirm()` miał domyślne `'Cancel'` (`alert-dialog.tsx:84`); wcześniej plan przenoszenia `locale/` i `LocaleProvider` z angielskimi domyślnymi.
2. „Biblioteka nie ma wbudowanych napisów w żadnym języku; każdy napis podaje aplikacja” (R6/S1).
3. Reguła: RULES #11; strażnik AST `component-source.ts` (tekst w JSX, literały w `aria-label`/`title`/…).
4. Źródła: `OR` S1, R6; `RULES` #11.
5. Powtórzeń: 2 (ten sam plik, dwie tabele; liczone jako jedno źródło + RULES).

______________________________________________________________________

# B. Stałe polecenia właściciela o sposobie pracy

(Format: polecenie, źródło, data.)

## B-Plan i decyzje

- B1. Plan jest najważniejszą częścią: „zaplanuj, oceń, wykonaj, oceń, powtórz”; plan ma mieć strukturę folderów, elementy przenoszone i odniesienia do specyfikacji; przed planem skille `planning` i `workflow`. `MEM:plan-najwazniejszy-petla-workflow`, 31.10.
- B2. Plan zgodny z masterplanem, drzewem folderów i całym dotychczasowym stanem; każda pozycja z cytatem podstawy; wersja druga w nowym pliku, stary zostaje; ocena armią subagentów, potem osąd prowadzącego, potem akceptacja właściciela. `MS:2026-10-07-1600-tessera-e1-handover` §12, 07.10.
- B3. Kod etapu nie powstaje bez kontraktu w `docs/plans/` zaakceptowanego przez właściciela. `AGENTS.md` (Twarde reguły).
- B4. Każda zmiana kodu najpierw na piśmie (2–3 rozwiązania z wadami i zaletami, rekomendacja, podgląd), edycja po „tak” do TEGO punktu; lista, „naprawiaj wszystko” i pytanie właściciela nie są zgodą. `MEM:kazda-zmiana-kodu-najpierw-na-pismie`, 11.10.
- B5. Recenzja planu najwyżej 3–4 rundy; po rundzie bez uwag krytycznych zapytać właściciela, czy następna ma sens. `MEM:recenzja-planu-limit-rund`, 08.10.
- B6. Każda decyzja zapisana w `docs/decisions/` z: wyborem, uzasadnieniem, odrzuconymi opcjami, kto, data, dowód; wybory wyglądu/zachowania rund w `e3-choices.md` z zrzutami. `MEM:dziennik-decyzji-kazda-decyzja-z-opcjami` (01.11), `MEM:tessera-wybory-zapisuj-do-przejrzenia` (01.11).
- B7. Decyzja zawsze z jedno-dwuzdaniowym uzasadnieniem. `MEM:decyzje-zawsze-z-uzasadnieniem`, 30.09.
- B8. Nie zmieniaj planu/masterplanu, żeby obejść problem; odstępstwa do raportu etapu. `MEM:arbiter-osadza-uwagi-recenzentow` (06.10), `MS:2026-10-07-1600-tessera-e1-handover` §4.
- B9. Zero kompromisów co do zakresu: brak MVP/„na później” jako sposobu na termin; więcej równoległych agentów, nie cięcie. `MEM:zero-kompromisow-komplet-rownolegle`, 05.10.
- B10. Przy dylemacie najpierw research prior art ze źródłami (Radix/Base UI/React Aria/shadcn/Geist/Material/Apple HIG, kod, issues przeglądarek), potem pomiar wybranej drogi u nas; własny kod tylko gdy gotowe łamie wymaganie, z zapisanym powodem; także zależności (parser CSS → lightningcss/postcss). `MEM:najpierw-jak-zrobili-to-inni-potem-wlasne`, `RULES` #13, `SL-1102b`, 02.11.

## B-Zakres i decyzje wyglądu

- B11. Nie podejmuj decyzji wyglądu ani odczucia za właściciela; gdy mówi „poczekaj”, nic nie wdrażaj. `SL-1102b` („Jak pracować” pkt 2), 02.11.
- B12. Nie zmieniaj wyglądu ani odczucia zaakceptowanych przy naprawie czegoś innego; jeśli naprawa tego wymaga: STOP i raport. `RULES` #9; `MEM:nie-zmieniaj-zaakceptowanego-zachowania-bez-wlasciciela`, 01.11.
- B13. Wygląd: ty proponujesz 2–4 warianty z prawdziwych komponentów (z rekomendacją), właściciel wybiera; nie pytaj „robię tak?” z jedną propozycją. `MEM:wyglad-ty-proponujesz-warianty-ja-sprawdzam`, 14.10.
- B14. Właściciel ocenia wyłącznie „ok / nie ok”; matematykę, powiązania, szukanie braków robi prowadzący; każdy błąd → strażnik maszynowy + wpis w „Pułapki”; na koniec E3 jeden standard (dokument + skill w repo `agents`). `MEM:tessera-wlasciciel-ocenia-ja-licze-system`, 01.11.
- B15. Prowadzący pierwszy ogląda plansze (xs–xl, jasny/ciemny, wszystkie stany) i audyt zachowań przed pokazaniem; zasady = strażnicy wklejane do każdego briefu. `MEM:tessera-sam-przegladam-wyglad-przed-pokazaniem`, 02.11.
- B16. Wzorzec ZACHOWAŃ = APG/Base UI/Radix/React Aria + desktop MangaShift `packages/ui/src` 1:1; v2 nie jest wzorcem (tylko padding tekstu i najmniejsza szerokość przycisku). `RULES` #8, `SL-1102b`, 02.11.
- B17. Tessera = tylko wygląd; logiki zachowania nie zmieniać bez wyraźnej prośby. `MEM:tessera-tylko-wyglad-zero-logiki`, 01.10.
- B18. Warianty, nie ustawienia: nowy wygląd = nowy wariant przepisu, zero wolnych pól CSS w panelach Customize. `MEM:tessera-warianty-nie-ustawienia`, 11.10; `AGENTS.md`.
- B19. Wygląd przez pomiar, nie na oko; porównanie z oryginałem w tolerancji 0,5 px. `MEM:mierz-zgodnosc-z-v1-przed-pokazaniem`, 07.10; `MEM:objaw-wygladu-mierz-przyczyne-nie-zgaduj`, 11.10.
- B20. Rzeczy twórcze (logo, kierunek, nowa strona) najpierw zapytaj 2–4 kierunkami; „napierdalaj” dotyczy wykonania uzgodnionego planu. `MEM:tworcze-rzeczy-najpierw-zapytaj`, 10.10.
- B21. Komponent „gotowy” dopiero w kompozycji i po ocenie właściciela; status najwyżej „gotowe do oceny”; testy i recenzje modeli nie są akceptacją. `MEM:element-gotowy-dopiero-w-kompozycji` (08.10); `MS:2026-10-16-1913-tessera-after-e6-layout-first` (16.10); `AGENTS.md`.
- B22. Kod jak senior: prosto, właściwy zakres i miejsce, bez redundancji i dziwnych konstrukcji; przegląd jakości (skille `coding`, `review`) jako bramka każdej rundy, także laboratorium i testy. `MEM:tessera-kod-poziom-senior-od-poczatku`, 01.11.
- B23. Cel komponentu: gotowy z pudełka (wygląd, ruch, warianty, sloty, skrajne przypadki, responsywność, a11y, wydajność także na telefonie); kompozycja bez stylów (sloty), zła kolejność = błąd. `MEM:tessera-cel-klocki-gotowe-z-pudelka`, `MEM:tessera-kompozycja-bez-stylow-sloty`, `MEM:tessera-skrajne-przypadki`, 31.10–01.11.

## B-Subagenci, równoległość, narzędzia

- B24. Brief subagenta wg szablonu, 2000–3000 znaków, ze skillem zadaniowym (`research`/`review`/`coding`), `workflow` i formatem SUBAGENT-RESULT; przed wysłaniem odhacz WSZYSTKIE pola. `MEM:briefy-subagentow-szablon-1500-3000`, 30.09–01.11.
- B25. Subagenci: zero komend git zmieniających stan; nie uruchamiają własnych agentów; zero komentarzy; bez sed/perl. `MEM:subagenci-zakaz-git-nie-tylko-commit`, `MEM:tryb-pracy-ja-male-opus-duze-sonnet-sprawdza`; `AGENTS.md`.
- B26. Partie agentów po 3–4 (nigdy 20 naraz); 02.11: jedna rzecz naraz, bez równoległych wykonawców, bez paczek. `MEM:nie-puszczaj-wielu-agentow-naraz` (11.10); `SL-1102b` (02.11).
- B27. „Nie rób wszystkiego sam, deleguj”: praca dzielona na agentów z rozłącznym write scope, potem kilku niezależnych recenzentów (standard, kod, dokumenty), runda kontrolna. `MEM:briefy-subagentow-szablon-1500-3000`, 31.10.
- B28. Proste/mechaniczne zadania: Sonnet 5.5; projektowanie, diagnoza, decyzje systemowe: mocniejszy model; sprawdza Sonnet. `MEM:tessera-za-wszelka-cene-sonnet-do-prostych` (02.11); `MEM:tryb-pracy-ja-male-opus-duze-sonnet-sprawdza` (09.10).
- B29. Prowadzący (arbiter) osądza KAŻDĄ uwagę recenzenta (tabela przyjęta/odrzucona + powód); nie edytuje kodu jednostki. `MEM:arbiter-osadza-uwagi-recenzentow`, 06.10.
- B30. Gdy ten sam typ uwagi wraca 3+ razy: zakwestionuj model, biała lista z jawnymi wyjątkami. `MEM:straznik-biala-lista-nie-czarna`, 06.10.
- B31. Nie zatrzymuj agentów (TaskStop) bez jednoznacznego „zatrzymaj”; na „co robi?” odpowiedz stanem. `MEM:nie-zatrzymuj-agentow-bez-polecenia`, 09.10.
- B32. Commit/push tylko na wyraźne słowo właściciela („commit tak” 01.11; push osobne słowo); main tylko squash merge PR. `AGENTS.md`; `SL-1102a`.
- B33. Edycja plików tylko Edit/Write; testy `bunx vitest run`, nigdy `bun run test`; Playwright headless, 1 worker. `AGENTS.md`; `MEM:sondy-przegladarki-tylko-headless`; `MEM:testy-lekko-komputer-sie-zacina`.
- B34. Worktree w `.worktrees/`; przed usunięciem zdjąć junctiony; nigdy `--force`. `MEM:worktree-usuwanie-junctiony-najpierw`; `AGENTS.md`.
- B35. Zero komentarzy w kodzie (także WHY, JSDoc, `eslint-disable`, testy, fixture). `MEM:tessera-zero-komentarzy`, 31.10; `RULES` #12.
- B36. Zero legacy: stara nazwa/ścieżka/kopia znika w tym samym diffie. `RULES` #12; globalne `CLAUDE.md`.

## B-Komunikacja

- B37. Pytanie właściciela = najpierw krótka odpowiedź (co, dlaczego, stan), bez zmian w repo w tej turze. `MEM:najpierw-odpowiedz-potem-dzialaj`, 07.10.
- B38. Jedna wiadomość = jeden temat, najwyżej jedno pytanie, z rekomendacją; odpowiedzi krótkie i krytyczne, bez przytakiwania; „nie chcę słyszeć twoich procesów”. `MEM:jedna-rzecz-na-raz-w-wiadomosci` (09.10); `MS:2026-10-30-2022-tessera-motion-failed-architecture-next`; `MS:2026-10-16-1939-tessera-window-layout-iteration`.
- B39. Nie ogłaszać „zrobione” bez linku i instrukcji sprawdzenia; weryfikuj ruch nagraniem na żywo obok starej wersji; mów dokładnie co zrobiono i czego NIE. `MS:2026-10-30-2022-tessera-motion-failed-architecture-next`; `SL-1102b`.
- B40. Blokujące decyzje pytaj od razu w czacie (1 zdanie, rekomendacja, format odpowiedzi „3 tak, 4 tak”), nie w pliku. `MEM:decyzje-blokujace-pytaj-od-razu-w-czacie`, 09.10.
- B41. Odpowiedzi na czacie, nie w plikach MD. `MEM:komunikacja-czat-nie-pliki-md`, 02.07 (starsza, ogólna).
- B42. Bez em-dash (U+2014) w tekstach i odpowiedziach. `MEM:styl-bez-em-dash`, 18.06.
- B43. Każdy błąd zgłoszony przez właściciela kończy się strażnikiem; jeśli dyspozycja wraca, strażnik jest wpisany do AGENTS.md „Pułapki”. `MEM:tessera-wlasciciel-ocenia-ja-licze-system`, 01.11.
- B44. Wydajność: priorytet nr 1; ruch tylko `transform`/`opacity`; wydajność ponad identyczny piksel, ale bez artefaktów. `AGENTS.md`; `MS:2026-10-30-2022-tessera-motion-failed-architecture-next` (30.10).
- B45. Nocą/gdy właściciel nieobecny: „leć dalej, musimy zrobić tę bibliotekę za wszelką cenę”; praca bez przestojów, na właściciela czekaj tylko przy decyzjach wyglądu/odczucia; decyzje otwarte podejmuj starannie („to ważne decyzje”) z dowodem. `MEM:tessera-za-wszelka-cene-sonnet-do-prostych` (02.11); `MEM:unifikacja-drobiazgi-decyduj-sam` (31.10); `SL-1101a`.

## B-Sprzeczności (z dwoma cytatami)

- B-S1. Decyzje wyglądu: „podejmuj takie decyzje najlepszym możliwym sposobem; to ważne decyzje” (31.10, `MEM:unifikacja-drobiazgi-decyduj-sam`, `SL-1101a`), „wybieraj najlepsze” (`SL-1101b`) vs „Nie podejmuj takiej decyzji beze mnie. Decyzje, które podejmujesz sam, są często błędne — miej się na baczności.” (01.11, `MEM:nie-zmieniaj-zaakceptowanego-zachowania-bez-wlasciciela`) vs „Nie podejmować decyzji wyglądu ani odczucia za właściciela” (02.11, `SL-1102b`). Wcześniej: „ja decyzji nie podejmuję, to ty musisz podjąć, co będzie ładnie wyglądało” (30.10, `MEM:ruch-1-1-technike-wybieram-sam`).
- B-S2. Pytać czy nie: „Wszystko co upraszcza przyspiesza ulepsza rób” i „pytaj tylko o rozwidlenia produktowe” (`MEM:upraszczaj-przyspieszaj-rob-bez-pytania`, `MEM:hitl-pytaj-o-rozwidlenia-nie-o-banaly`, `MEM:niespojnosci-rozwiazuj-sam`) vs „implementowanie tego, co nie zatwierdziłem, jest błędem”, „bez planu nawet nie podchodź” (11.10, `MEM:kazda-zmiana-kodu-najpierw-na-pismie`) vs „dlaczego nie krzyczysz o te decyzje” (09.10, `MEM:decyzje-blokujace-pytaj-od-razu-w-czacie`).
- B-S3. Raportowanie: „wszystkie rzeczy, które masz mi zaraportować, zrobisz raport na końcu, jak skończy się E2” (09.10, `MEM:raport-zbiorczy-na-koniec-etapu`) vs „dlaczego nie krzyczysz o te decyzje… na czacie masz mnie pytać” (09.10, `MEM:decyzje-blokujace-pytaj-od-razu-w-czacie`), ten sam dzień.
- B-S4. Opcje: „dlaczego nie podajesz wad i zalet każdego rozwiązania, nie proponujesz rozwiązań” vs „Dlaczego zrobiłeś tyle propozycji? Zaproponuj połączenie… najlepsze.” (obie 11.10, `MS:2026-10-11-1534-tessera-control-system` §3.1 pkt 2–3).
- B-S5. Równoległość: „nieograniczone subagenty Opus 5.5 oraz Sonnet 5.5, z głową, nie wszystko naraz” (09.10, `MEM:maks-2-agenty-tego-samego-modelu`), „nie rób wszystkiego sam, deleguj” (31.10), „równolegle, mniej rund pytań” (01.11, `MEM:tessera-wlasciciel-ocenia-ja-licze-system`), „leć dalej… za wszelką cenę” (02.11) vs „Tessera: iteracja = JEDEN element, bez agentów równoległych” (`MEM:tessera-nie-wszystko-naraz`) vs „Jedna rzecz naraz. Bez równoległych wykonawców, bez paczek zmian.” (02.11 13:00, `SL-1102b`).
- B-S6. Kto robi UI: „kwestie UI musisz literować jako TY, nie przekazywaniu subagentom” (08/2026, `MEM:ui-wizualne-opus-recznie-nie-subagent`) i „małe poprawki wyglądu od ręki, bez agenta” (02.10, `MEM:symetria-domyslna-zawsze`) vs „prowadzący sam kodu jednostek nie pisze” (06.10, `MEM:arbiter-osadza-uwagi-recenzentow`) i „Subagenci... Sonnet poprawiał makiety” (10.10, `MEM:makiety-otwieraj-sam-tablica-uwag`) vs „deleguj”.
- B-S7. Zakres vs prostota: „Ja nienawidzę kompromisów… ma być wykonane” (05.10, `MEM:zero-kompromisow-komplet-rownolegle`) vs „Lepiej opuszczaj niż komplikuj, prostota, skill simple jest tutaj górą” (06.10, `MEM:tessera-fundament-zgodnosc-i-prostota`) vs „Parametry tylko z realną potrzebą (… „po co wszystkie CSS-y?”)” (08.10, `MS:2026-10-08-0050-tessera-e1-night` §4) i „dopóki nie mogę edytować każdego elementu, etap nie jest zrobiony”.
- B-S8. Wzorzec zachowań i research: „Nie ma czegoś takiego jak poprawny sliding… szukanie w bibliotekach to strata czasu” (31.10, `MEM:sliding-wzor-strona-mangashift-com`) vs „Takie dylematy warto szukać w internecie, a nie robić eksperymenty” (02.11, `MEM:najpierw-jak-zrobili-to-inni-potem-wlasne`); a „zachowania 1:1 z desktopu” vs „v2/desktop nie jest wzorcem, wzorzec = APG/Base UI/Radix” (02.11, `RULES` #8; zachowania desktopu zostają wzorcem w `SL-1102b` pkt 4).
- B-S9. Kopiowanie v2: R3/R5/R9 „jak v2” (01.11, `OR`: „v2 ma najlepszy”; „Wciśnięcie 1:1 jak v2”) vs „wygląd komponentów v2 nie został przeze mnie zaakceptowany”, „v2 NIE jest wzorcem” (02.11, `OR` R9, `SL-1102b` pkt 4, `RULES` #8). Częściowo rozstrzygnięte przez zawężenie (padding tekstu, min. szerokość przycisku, zachowania), ale R3 („padding dookoła listy… ma odpowiadać v2”) wykracza poza to zawężenie.
- B-S10. Wciśnięcie przycisku: „tekst też się ma skalować… płynnie i nie skaczą” (R1, 01.11) i na stronie porównawczej „(c) wygląda ładnie” (02.11, `SL-1102b` pkt 3) vs priorytet nr 1 wydajność, B7 ≤ 12 warstw; (c) = 74–115 warstw, przewijanie 3,5–4,5× droższe (`SL-1102b`, `AGENTS.md`); właściciel sam wstrzymał decyzję („poczekaj, nie rób decyzji”).
- B-S11. Testy: „nie odpalaj typechecka i linta dopóki nie powiem że jest dobrze” (12.08, `MEM:typecheck-na-koncu-nie-po-kazdej-zmianie`; „Kto ci kazał testować…”, 11.10) vs „jakość kodu to bramka jak testy… każda runda kończy się przeglądem” (01.11, `MEM:tessera-kod-poziom-senior-od-poczatku`) i „Prowadzący sam sprawdza wynik w ruchu i na obrazie… nie tylko zielone testy” (02.11, `SL-1102b`).
- B-S12. Recenzje: „to musi być w 100 procentach dobrze zrobione i bez błędów krytycznych” (trójka + kontrola krzyżowa, 06.10, `MEM:tessera-fundament-zgodnosc-i-prostota`) vs „12 razy recenzujesz plan, o co ci chodzi?” (08.10, `MEM:recenzja-planu-limit-rund`) i „oceniasz cały etap, bo za długo to trwa” (06.10 23:30).
- B-S13. Komentarze: E0 „Komentarze w kodzie: tolerowane, nie usuwać” (`MS:2026-10-06-2212-tessera-e0-review-loop`) vs „zero komentarzy” (31.10, `MEM:tessera-zero-komentarzy`). Starsze zastąpione nowszym.

______________________________________________________________________

# C. Decyzje właściciela o wyglądzie/zachowaniu, które agenci złamali lub zignorowali

(Format: decyzja / data / źródło / co agent zrobił zamiast.)

- C1. Wciśnięty przycisk skaluje CAŁOŚĆ (tekst i ikona) bez przeskoku; trigger popupu bez skali. 11.10 (cały przycisk 97%), 01.11 (R1), 02.11. `MEM:tessera-komponent-od-nowa-proces`, `OR` R1/R9, `RULES` #6, `SL-1102b` pkt 3. Zamiast: płytka `::before`, tekst stoi; do dziś niewdrożone.
- C2. Segmenty i switch nie skalują się przy kliknięciu; pigułka nie wciska się. 11.10 (`MS:2026-10-11-1534-tessera-control-system` pkt 27–28), 31.10 (`MEM:tessera-pigulka-bez-wcisniecia`). Zamiast: dodano `scale` 0,97 do switcha; źle zdiagnozowano ramkę 1 px jako „scale”.
- C3. Hover zawsze pod zaznaczeniem, wyraźnie słabszy, 2 px między pigułkami. 11.10, 01.11 (B6–B8). `RULES` #10. Zamiast: hover malowany nad zaznaczeniem, brak odstępu, zlewające się kolory.
- C4. Hover ma wyjście `fade` domyślnie, na każdym elemencie. 01.11 (R4), 02.11. `OR` D1/R4, `SL-1102b` pkt 2. Zamiast: `cut` domyślnie; potem `fade` tylko w ToggleGroup.
- C5. Tooltipy grupowane, przerwa należy do grupy, przytrzymanie. 03.10 (desktop), 02.11. `MS:2026-10-02-2300-e4c-unifikacja-i-start-e5a`, `SL-1102b` pkt 1. Zamiast: `closeDelay` 100 ms.
- C6. Opóźnienie tooltipa 400 ms jak desktop; tooltip nie „dolatuje” po scrollu. 02.11. `SL-1102b` pkt 5–7. Zamiast: tooltip za nisko i „dolatuje”.
- C7. Zachowania z desktopu 1:1 (sticky pigułka przy separatorze, trójkąt podmenu, natychmiastowe podmenu, przelot menubara, lane scrollbar, checkbox w menu nie zamyka). 11.10, 13.10, 02.11. `MEM:tessera-zachowania-przepisz-1-1-z-desktopu`, `MS:2026-10-13-0352-tessera-e5-packages-and-behaviours` §4, `SL-1102b` pkt 9. Zamiast: wymyślony styl pigułki; audyt wykazał 8 rozbieżności (m.in. fokus na wyłączonym wierszu, brak blokady scrolla, podmenu znika).
- C8. Padding listy rozwijanej jak v2 (5 px za mało/za dużo); najmniejsza szerokość przycisku 2,5 × wysokość z flagą wyłączenia; padding tekstu jak v2. 01.11 (R3, R5). `OR`. Zamiast: 5 px z reguły `controls`; najmniejsza szerokość = wysokość.
- C9. Zero tekstu UI w bibliotece. 01.11 (R6). `OR` S1/R6, `RULES` #11. Zamiast: `LocaleProvider` z angielskimi domyślnymi; `'Cancel'` w `confirm()`.
- C10. Trigger listy nie zostaje skurczony przez czas otwarcia; wciśnięcie trwa tylko przy wciśniętym wskaźniku. 01.11 (R8). `OR` R8. Zamiast: wciśnięcie trwające przez otwarcie popupu.
- C11. Odstęp toru od pigułki rośnie z rozmiarem (`h/8`); gęstość nie wpływa na tor. 01.11 (R10). `OR` R10. Zamiast: stały 5 px z gęstości.
- C12. Bez obramowań na powierzchniach wypukłych i pigułkach (ustalenie 31.10). `RULES` #3, `OR` R11. Zamiast: pierścień 1 px w cieniu `raised`.
- C13. Rogi `full`: kontrolki, pigułki, tory = kapsuła. 01.11 (B11). `OR` B11. Zamiast: promień z bazy+odstęp (12,7 zamiast 14 px).
- C14. Promień kontrolki w karcie/dialogu zachowuje własny (od ~16 px odstępu). 02.11 (R12). `OR` R12. Zamiast: koncentryczność bez progu (4/4/7,3 px zamiast 6,4/9,6/12,6).
- C15. Symetria optyczna: dodatek ¼ promienia tylko dla tekstu wprost w kontenerze; menu/lista z wierszami = sam odstęp. 01.11 (B9, B10), 02.10. `OR` B9, `RULES` #4, `MEM:symetria-domyslna-zawsze`. Zamiast: 9,5 px wokół listy.
- C16. Jedna skala xs/sm/md/lg/xl, każda wartość zależna od rozmiaru rośnie ściśle; gęstość tylko dla kontenerów. 11.10, 15.10, 01.11. `MEM:jedna-skala-rozmiarow-wszedzie`, `MEM:gestosc-tylko-kontenery-kontrolki-stale`, `RULES` #1–#2. Zamiast: tabela aliasów; gęstość powiększyła kontrolki 28→40 px i nadpisała rozmiary; dwa jednakowe rozmiary.
- C17. Zero animacji wejścia poza dialogiem (30.09). `MEM:zero-animacji-wejscia-poza-dialogiem`, `MS:2026-10-01-1650-e4c-orkiestracja`. Zamiast: animacje fade/zoom w nakładkach wprowadzone w E4a, uznane za regresję i usunięte.
- C18. Przycisk premium tylko jako CTA sprzedażowy strony (02.10). `MS:2026-10-01-1650-e4c-orkiestracja` (C3 cofnięte `6ded0ef41`). Zamiast: premium w aplikacji.
- C19. Kreski akcentu z lewej strony: nigdy (14.10, drugi raz). `MEM:zero-kresek-akcentu-z-boku`. Zamiast: prototyp kolorów wrócił z kreskami.
- C20. Pigułka (lista/Select) wypukła, nie płaska szara (31.10). `MEM:tessera-pigulka-v2-wyglad-zly`. Zamiast: E2 przeniósł płaską pigułkę aktywną.
- C21. Kolor akcentu: nie zamieniać na neutralny (14.10). `MEM:nie-podejmuj-decyzji-wygladu-za-wlasciciela`. Zamiast: czarny tekst i elementy.
- C22. Premium 1:1 ze stroną, mierzone (07.10). `MEM:mierz-zgodnosc-z-v1-przed-pokazaniem`. Zamiast: porównanie dwóch małych zrzutów na oko; grubsza biała obwódka.

______________________________________________________________________

Źródła nieodczytane lub odczytane tylko częściowo: patrz sekcja końcowa.

## Źródła, których nie dało się odczytać lub odczytano częściowo

- Wszystkie ścieżki istniały i były odczytywalne; nic nie zablokowane.
- Odczyt częściowy (świadomie, z limitu rozmiaru): `tmp/msdocs/session-logs/2026-10-07-1600-tessera-e1-handover.md` (89 KB; czytano §4, §10, §12, §13, lekcje E0, §24, §35), `2026-10-11-1534-tessera-control-system.md` (80 KB; §3, §4, §11, §18, §19–§21, §27), pozostałe msdocs czytane sekcjami „Reguły/Decyzje/Lekcje/Ślepe uliczki/Uwagi właściciela” lub grepem po cytatach.
- Pominięte jako niezwiązane z Tesserą/procesem (MangaShift backend/ML/render/OCR itp.): ok. 250 z 361 notatek `tmp/mem/mangashift` (nie czytano), w tym `MEMORY.md` poza sekcją Tessera/Proces.
- Nie czytano `tmp/chat` (polecenie) ani kodu.
