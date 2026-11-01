---
kind: research
status: draft
updated: 2026-10-31
---

# Inspiracje z Discorda właściciela

Katalog rzeczy, które właściciel zapisywał na kanałach #manga-shift i #tests (stan 2026-10-31), opisanych pod kątem Tessery. Tylko pozycje o wartości wysokiej i średniej; pełny indeks (937 linków, 252 obrazy, wszystkie oceny) i materiał (filmy, arkusze klatek, obrazy) leżą poza repo w `PROJECTS/tessera-probe/inspiration/` (`index.json`, `raw/describe-out-*.json`).

Wcześniejsza lista 13 postów i zrzutów z czatu (15–30.10) zostaje w repo MangaShift: `docs/plans/ui-kit/inspiration-posts.md` (branch `refactor/tessera-motion`).

Filmy oglądane jako arkusze klatek (6x6, z czasem), bez dźwięku; czasy ruchu są przybliżone. „Domysł” to przypuszczenie, dlaczego właściciel coś zapisał: do potwierdzenia albo skreślenia.

Opisane: 470 pozycji · wysokie 55 · średnie 60 · niskie 132 · bez wartości 223.

## Sliding

### ★ I:ms-2026-08-22-1540698907548455082-0-HQNtnAJaMAATPVf.png · obraz `ms-2026-08-22-1540698907548455082-0-HQNtnAJaMAATPVf.png`

- **Co pokazuje:** Aplikacja Knowledge Base: szyna ikon z kafelkiem zaznaczenia, panel z wyszukiwarką, segmented control Folders/Tags (biały kciuk na szarym torze), drzewo folderów z liniami prowadzącymi, liczniki w pigułkach i zaznaczony wiersz jako szara pigułka. Obok karty folderów z ikonami integracji i tabela plików.
- **Dla Tessery:** Drzewo z cienkimi liniami prowadzącymi zakończonymi zaokrąglonym kolankiem, licznik w obrysowanej pigułce wyrównany do prawej, zaznaczenie jako pełna szara pigułka (przepis wiersza). Segmented control z białym kciukiem i cieniem to gotowy kandydat na sliding wskaźnika. Kafelek zaznaczenia w szynie ikon. Silniki stanu i kształtu.
- **Domysł:** Wzór drzewa projektu i panelu bocznego dla edytora MangaShift (rozdziały, strony).
- **Też:** Drzewo, Zakładki, Listy, Układ i panele, Karty, Pigułki

### ★ L243 · [Designmotionhq](https://vm.tiktok.com/ZN8JJq5to/) · ms 2026-07-22

- **Co pokazuje:** Ciemne plansze o zakładkach z czerwono-turkusowym akcentem w 5 częściach: 01 Indicator (hard cut 0 ms vs smooth slide 280 ms; spring damping 22, stiffness 280; content fade 180 ms; ease-out), 02 Overflow (8 zakładek: przewijanie w poziomie, zanikające krawędzie, strzałki na desktopie, nigdy nie zawijać do 2 linii), 03 Keyboard (strzałki, Home, End, Tab; focus nigdy nie wygląda jak active), 04 Mobile (cele dotyku ≥44 px), 05 Content (fade out 80 ms, 80 ms pauzy, fade in 80 ms; wysokość kontenera interpolowana bez przesunięcia układu).
- **Ruch:** Podkreślenie przesuwa się sprężyście między zakładkami w ok. 280 ms z ledwie widocznym dociągnięciem; treść zmienia się sekwencją wyjście–pauza–wejście po 80 ms.
- **Dla Tessery:** Konkretne liczby dla sliding wskaźnika (spring damping 22 / stiffness 280, ok. 280 ms) i dla zmiany treści zakładek (80/80/80 ms); zasady overflow (fade krawędzi, bez zawijania) i 'focus ≠ active' wprost do przepisów wskaźnika i fokusu.
- **Domysł:** Dokładnie jego temat: sliding wskaźnika, który nie skacze; szukał liczb.
- **Też:** Zakładki, Ruch (ogólnie), Przewijanie

### ★ L291 · [Danny Williams (@dannyjpwilliams)](https://x.com/dannyjpwilliams/status/2084637478699348014?s=20) · ms 2026-08-05

- **Co pokazuje:** Czarny pływający dock-pigułka na białym tle (Home, About, Playground, Connect, przycisk rozwinięcia). Rozwinięcie zamienia pigułkę w czarny panel z segmentowanym przełącznikiem Dark/Light/Auto i listą; 'Connect >' przechodzi do podmenu (Back, Twitter/X, Cosmos, LinkedIn, Email).
- **Ruch:** Ikony rozmywają się, pigułka spłaszcza do paska (ok. 100 ms), po czym rośnie do panelu z lekkim przestrzeleniem i osiada (ok. 300 ms); treść wchodzi z blur→ostro kaskadą. Drill-down: lista znika z blur i lekkim ruchem w górę, nowa wchodzi tak samo, wysokość panelu płynnie dopasowuje się do 5 wierszy (ok. 300–400 ms).
- **Dla Tessery:** Morfing pigułka→panel i drill-down z płynną zmianą wysokości kontenera; dla Tessery wersja kompozytorowa: scale + opacity + krótki translateY treści, bez blur, z lekkim bounce przy osiadaniu.
- **Domysł:** Wzór menu z zagłębianiem i przejścia pigułki w panel, bliski jego pigułkowym kontrolkom.
- **Też:** Menu, Pigułki, Ruch (ogólnie), Przełączniki i segmenty

### ★ L306 · [nick (@n\_\_\_vc)](https://x.com/n___vc/status/2086827876616204443?s=20) · ms 2026-08-11

- **Co pokazuje:** Mały biały pasek formatowania na jasnym tle (B, I, U, link, kosz) z czarnymi tooltipami (Bold, Italic, Underline, Add link, Delete). Tekst posta: tooltipy jednej grupy nie powinny gasnąć i otwierać się od nowa, tylko przesuwać jako jeden (grupowany tooltip w Base UI).
- **Ruch:** Po pierwszym otwarciu dymek przy przejściu na sąsiedni przycisk przesuwa się poziomo i płynnie zmienia szerokość i tekst (ok. 150–200 ms), bez ponownego opóźnienia i bez fade-out/in.
- **Dla Tessery:** Grupowany tooltip z Base UI (współdzielony dymek ślizgający się między kotwicami) to wprost przypadek sliding wskaźnika Tessery dla pasków narzędzi; po pierwszym tooltipie bez opóźnienia.
- **Domysł:** Ten sam mechanizm co jego sliding pigułki, tylko dla tooltipów; Tessera stoi na Base UI.
- **Też:** Tooltip, Ruch (ogólnie)

### ★ L315 · [Léo (@leouiux)](https://x.com/leouiux/status/2089081346819772908?s=20) · ms 2026-08-17

- **Co pokazuje:** Ciemne menu (Dashboard, Profile, Settings, Projects, Documentation, Support, Logout na czerwono). Kliknięcie pozycji z '>' wprowadza podlistę: kliknięty wiersz staje się nagłówkiem '< Settings' na górze, a podpozycje (Usage, Billing, Appearance...) mają większe wcięcie, co sygnalizuje zagłębienie; drugi film ma nakładkę debug pokazującą zmianę paddingu; widać też obrys fokusu klawiatury na wierszu.
- **Ruch:** Wejście do podlisty: wiersz-rodzic przesuwa się do pozycji nagłówka, pozostałe znikają, nowe pozycje wsuwają się z boku i z fade; wysokość menu dopasowuje się płynnie; całość ok. 250–350 ms, bez wyraźnego odbicia. Powrót odwraca ruch.
- **Dla Tessery:** Wzór drill-down menu dla Tessery: rodzic morfuje w nagłówek z '\<', a głębokość komunikuje dodatkowy padding zamiast nowego panelu; translate + opacity + animacja wysokości kontenera (lub scaleY z kompensacją).
- **Domysł:** Menu kontekstowe MangaShift z podmenu; chciał eleganckiego zagłębiania.
- **Też:** Menu, Ruch (ogólnie), Listy

### ★ L322 · [link](https://emilkowal.ski/ui/the-magic-of-clip-path) · ms 2026-08-19

- **Co pokazuje:** Brak plików; artykuł 'The Magic of Clip Path': clip-path inset do animacji bez layoutu (sprzętowo przyspieszane): suwak przed/po, maska tekstu, odsłanianie obrazu, a zwłaszcza zakładki z duplikatem listy w stylu aktywnym przyciętym clip-path do aktywnej zakładki, animowanym przy zmianie (płynna zmiana koloru tekstu pod wskaźnikiem, jak na blogu Stripe).
- **Dla Tessery:** Technika dla sliding wskaźnika Tessery: zduplikowana warstwa 'aktywna' przycinana clip-path daje idealne przejście koloru tekstu pod pigułką bez animowania koloru; do przepisu wskaźnika i silnika ruchu (sprawdzić zgodność z zasadą transform/opacity).
- **Domysł:** Rozwiązanie problemu koloru tekstu pod przesuwaną pigułką.
- **Też:** Zakładki, Ruch (ogólnie)

### ★ L330 · [Lorenzo Cabra (@cabralorenzo)](https://x.com/cabralorenzo/status/2090879486074008046?s=20) · ms 2026-08-22

- **Co pokazuje:** Jasne tło w kropki, czarna pigułka „+ Create new”. Po kliku zamienia się w ciemne menu z zaokrąglonymi rogami: Document, Presentation, Spreadsheet, Folder, hover jako jaśniejsza pigułka wiersza. Po wyborze menu zwija się z powrotem w pigułkę z potwierdzeniem „✓ Folder added”, która po chwili wraca do „+ Create new”.
- **Ruch:** Morf pigułka → menu i menu → pigułka przez fazę okrągłego bloba, ok. 0,3–0,4 s; treść menu pojawia się z opóźnieniem i fade. Wskaźnik hovera przesuwa się między wierszami. W oryginale dźwięk (arkusz go nie oddaje).
- **Dla Tessery:** Wzorzec „przycisk, który staje się swoim menu, a potem potwierdzeniem”: jedna powierzchnia, trzy stany. Dotyczy przepisu powierzchni i silnika ruchu; do zrobienia scale/clip na kontenerze plus opacity treści.
- **Domysł:** Podoba mu się ciągłość jednej powierzchni zamiast osobnego popovera i toastu.
- **Też:** Przycisk, Menu, Pigułki, Ruch (ogólnie)

### ★ L345 · [Dinil Thilakarathne](https://sona-ui.vercel.app/docs/fluid-tooltip) · ms 2026-09-01

- **Co pokazuje:** Dokumentacja Fluid Tooltip z Sona UI (tekst strony, brak nagrania). Jedna powierzchnia tooltipa wędruje za aktywnym przyciskiem w grupie (toolbar, nawigacja); pierwszy tooltip czeka openDelay 350 ms, sąsiednie otwierają się od razu; closeDelay 100 ms; orientacja grupy steruje kierunkiem wjazdu treści.
- **Ruch:** Według opisu: tooltip przesuwa się między triggerami, treść wjeżdża kierunkowo; przy reduced motion bez podróży, tylko etykieta. Fokus klawiatury otwiera od razu bez przejazdu.
- **Dla Tessery:** Zbudowane na Base UI, jak Tessera: grupowy tooltip z jedną powierzchnią i sliding to bezpośredni kandydat na przepis tooltipa w toolbarach edytora. Silnik ruchu + wskaźnik.
- **Domysł:** Sliding tooltip pasuje do jego „sliding jak menu, bez mrugania” w paskach ikon.
- **Też:** Tooltip, Ruch (ogólnie)

### ★ L417 · [Jakub Krehel (@jakubkrehel)](https://x.com/jakubkrehel/status/2113292054151270727?s=20) · ms 2026-10-22

- **Co pokazuje:** Dwa identycznie wyglądające segmented „Day / Week / Month”: górny animuje left i width, dolny transform. Pionowa kreska z boku (jasna u góry, ciemna u dołu) wygląda na wskaźnik obciążenia. Tekst: właściwości layoutu wywołują przeliczenie układu przy każdej klatce, transform nie.
- **Ruch:** Pigułka zaznaczenia przesuwa się ok. 300–400 ms w obu wersjach, wizualnie tak samo (zbliżenie L417-zoom.jpg).
- **Dla Tessery:** Potwierdza regułę Tessery: wskaźnik sliding tylko przez translateX/scaleX, nigdy left/width. Gotowy przykład do dokumentacji silnika ruchu.
- **Domysł:** Uzasadnienie decyzji „ruch tylko transform/opacity”.
- **Też:** Zakładki, Wydajność, Ruch (ogólnie)

### L391 · [Jakub Antalik (@Jakubantalik)](https://x.com/jakubantalik/status/2108227168287314050?s=46&t=2RAXW1xB-Hl4YwLE9tMsyQ) · ms 2026-10-10

- **Co pokazuje:** Transitions Builder: karty składane z kropkowej siatki i wireframe'u (wydarzenie z mapą, asystent głosowy z gradientem „listening”, pogoda 24° z zakładkami dni, bilet SFO–JFK) plus panele ASCII „AGENT.LOG // PARTS” i „MOTION.CSS // 60 RECIPES”. Wszystko wygenerowane jednym promptem przez agenta.
- **Ruch:** Karty materializują się z siatki punktów; w pogodzie wybór dnia przesuwa pigułkę i zmienia tło karty z niebieskiego na szare.
- **Dla Tessery:** Nazwa i forma „przepisów ruchu” (MOTION.CSS, 60 recipes) jak w Tesserze; warto porównać ich katalog przepisów z naszym.
- **Domysł:** Agent generujący dopracowane przejścia, bliskie jego systemowi przepisów.
- **Też:** Karty, Zakładki, Ruch (ogólnie), Design systemy i zasady

### L801 · [DevFlash](https://vm.tiktok.com/ZNdsESjAw/) · tests 2025-09-27

- **Co pokazuje:** DevFlash „Sticky Cursor”. Pasek 5 ikon (play, pobierz, aparat, nuta, profil) na jasnym, potem ciemnym tle w kratkę i własny kursor: czarne lub białe kółko (.bubble: position fixed, translate(-50%,-50%), mix-blend-mode: difference, pointer-events: none). Nad ikoną kółko się powiększa i przykleja do niej, a ikona odwraca kolor.
- **Ruch:** Zbliżenie 30 fps (2,0–3,0 s): po zejściu z ikony bąbel w ok. 0,35 s kurczy się z ok. 1,5× do bazowego rozmiaru, rozciąga w elipsę wzdłuż kierunku ruchu i obraca zgodnie z wektorem prędkości (squash and stretch). Podąża za kursorem z opóźnieniem (lerp), bez wyraźnego odbicia. Na ikonie wskakuje na jej środek i rośnie.
- **Dla Tessery:** Dla przepisu wskaźnika i slidingu: rozciągnięcie wskaźnika w kierunku ruchu (scaleX proporcjonalne do prędkości plus rotate) podczas przeskoku między opcjami, a potem powrót do kształtu. To transform-only i daje „żywy” sliding obok lekkiego bounce. Samego niestandardowego kursora nie bierzemy.
- **Domysł:** Podobał mu się magnetyczny, elastyczny wskaźnik przyklejający się do ikon: odniesienie do slidingu.
- **Też:** Ruch (ogólnie), Ikony

## Pigułki

### ★ I:ms-2026-08-21-1540363244869263410-0-image.png · obraz `ms-2026-08-21-1540363244869263410-0-image.png`

- **Co pokazuje:** Jasne paski narzędzi w kształcie pigułek: grupa trzech okrągłych przycisków ikon, pasek formatowania z pionowymi separatorami i osobnym okrągłym X, odtwarzacz nagrania (0:00, kosz, niebieski play), trwające nagranie z falą dźwięku i niebieskim zapisem, zakres czasu 12:00 → 12:30 30min.
- **Dla Tessery:** Przepis powierzchni „pigułka w pigułce”: zewnętrzna biała wyspa z miękkim cieniem, w niej jasnoszary tor, okrągłe przyciski ikon w jednej skali, separator pionowy między grupami, zamknięcie jako osobny okrąg poza torem. Kolor akcentu tylko dla głównej akcji (play/zapisz). Silniki kształtu (pełne zaokrąglenie), głębi (cień wyspy) i rozmiaru (jedna wysokość). Pasuje do reguły „kontrolki = pigułki” i stylu wysp.
- **Domysł:** Wzór kontekstowego paska narzędzi (formatowanie tekstu, audio/TTS, czas) dla edytora MangaShift.
- **Też:** Przycisk, Ikony, Układ i panele, Karty

### ★ I:ms-2026-09-02-1544783432301809704-0-HRIt69XbAAAoUUJ.png · obraz `ms-2026-09-02-1544783432301809704-0-HRIt69XbAAAoUUJ.png`

- **Co pokazuje:** Zestaw odznak statusu w pastelach: Pending (trójkąt ostrzeżenia), In progress (przerywany okrąg), Submitted, In review, Success (okrąg z ptaszkiem), Failed (okrąg z X), Expired (zegar). Tło w lekkim odcieniu koloru, tekst i ikona w pełnym kolorze, duże zaokrąglenie.
- **Dla Tessery:** Przepis wskaźnika/odznaki statusu: tło w odcieniu ok. 10% koloru semantycznego, tekst i obrysowa ikona w pełnym kolorze, jedna wysokość i promień. In progress jako przerywany okrąg (łatwo dodać obrót). Mapuje się na stany pipeline'u MangaShift (oczekuje / w toku / gotowe / błąd). Silniki koloru i stanu.
- **Domysł:** Wzór odznak statusu dla kroków pipeline'u i zadań w MangaShift.
- **Też:** Kolor, Ikony

### ★ I:tests-2026-10-18-1561498853977362513-0-HU6-AfXaMAAgwIH.png · obraz `tests-2026-10-18-1561498853977362513-0-HU6-AfXaMAAgwIH.png`

- **Co pokazuje:** Powiększone dwie odznaki-pigułki statusu na jasnych wierszach tabeli: „Pending” (pomarańczowy tekst, jasnopomarańczowe tło, pomarańczowa obwódka, ikona częściowego pierścienia postępu) i „Scheduled” (szare tło i obwódka, ikona kalendarza). Obie mają wewnętrzną jaśniejszą linię, czyli efekt podwójnej krawędzi.
- **Ruch:** Ikona Pending wygląda na spinner albo pierścień postępu; sam obraz jest statyczny.
- **Dla Tessery:** Przepis wskaźnik dla statusu: pigułka z zabarwionym tłem, obwódką w tym samym odcieniu i inset highlight (silniki kolor, głębia, kształt); ikona plus etykieta w kolorze statusu. Pierścień postępu jako ikona stanu oczekiwania, animowalny tylko obrotem (transform), co pasuje do reguły ruchu tylko na kompozytorze. Wariant neutralny dla statusów bez akcentu.
- **Domysł:** Wzór odznak statusu zadań, np. etapów pipeline'u (oczekuje, zaplanowane) w MangaShift.
- **Też:** Ikony, Kolor

### ★ L263 · [Benji Taylor](https://benji.org/drawesome) · ms 2026-07-29

- **Co pokazuje:** Brak plików wizualnych; meta to opis Drawesome (Benji Taylor): pasek narzędzi do rysowania w React, który zmienia kształt zamiast podmieniać panele: wybór koloru zamienia rząd pisaków w paletę, rozmiar w dwa suwaki, minimalizacja zwija pasek do krążka z bieżącym narzędziem; każdy stan płynnie morfuje w następny. Animacji nie obejrzano.
- **Ruch:** Według opisu: płynny morfing kontenera paska między stanami (szczegóły czasu nieznane).
- **Dla Tessery:** Wzór 'jeden kontener zmienia kształt' dla pasków narzędzi edytora MangaShift (np. retusz, pędzle): zawartość podmieniana w obrębie tej samej pigułki z animacją rozmiaru zamiast nowych paneli.
- **Domysł:** MangaShift ma narzędzia rysowania (retusz, maski); szukał eleganckiego paska narzędzi.
- **Też:** Menu, Przycisk, Ruch (ogólnie)

### ★ L265 · [dmytro (@pqoqubbw)](https://x.com/pqoqubbw/status/2082509358189948931?s=20) · ms 2026-07-29

- **Co pokazuje:** Dwie pigułki endpointu API (jasna i ciemna): zielona etykieta GET, ścieżka z parametrami w zielonych chipach ({organizationId}, {projectId}). Długa ścieżka przewija się poziomo w ScrollArea zamiast natywnego paska; ikona kopiowania po prawej zamienia się w ptaszek po kliknięciu.
- **Ruch:** Przewijanie poziome z cienkim paskiem pojawiającym się przy hover; ikona kopiuj→ptaszek z szybkim przenikaniem; hover na chipie lekko podświetla.
- **Dla Tessery:** Wzór pigułki z treścią przewijaną w poziomie (ScrollArea z Base UI, zanikający pasek) i akcją kopiowania z potwierdzeniem ikoną; do przepisu powierzchni/pigułki i ikon stanu.
- **Domysł:** Pigułki to jego ulubiona forma kontrolek; podobało mu się eleganckie rozwiązanie przewijania.
- **Też:** Przewijanie, Ikony

### ★ L287 · [Florian (@flornkm)](https://x.com/flornkm/status/2084308096206196979?s=20) · ms 2026-08-03

- **Co pokazuje:** Przed/po na białym tle (przełącznik Before/After): karta 'Invite your team' z przyciskami Copy link/Settings, menu (Profile, Settings, Appearance, Log out), toast pigułka 'Changes saved / Undo'; wersja 'before' ma twarde ramki, 'after' miękkie wielowarstwowe cienie z cienkim pierścieniem. Cytowany post: wtyczka shadow z klasami smooth-shadow-ring-sm/md/lg/xl, pokazana na kartach, menu z podmenu, stosie toastów, pasku narzędzi i dialogu w jasnym i ciemnym motywie.
- **Ruch:** W cytowanym filmie menu i podmenu otwierają się z lekką skalą, toasty układają się w stos; bez istotnych szczegółów czasu.
- **Dla Tessery:** Silnik głębi Tessery: zamiast ramki 1 px używać warstwowego cienia + pierścienia (ring) w skali sm–xl; skala smooth-shadow-ring jako gotowy wzór tokenów cienia.
- **Domysł:** Chce, by Tessera wyglądała 'drożej'; cienie zamiast ramek to rzecz do decyzji w silniku głębi.
- **Też:** Karty, Menu, Dialog i popup, Design systemy i zasady

### ★ L324 · [Emil Kowalski (@emilkowalski)](https://x.com/emilkowalski/status/2080645760530448733?s=20) · ms 2026-08-19

- **Co pokazuje:** Jasny, monochromatyczny kreator zapisu na kurs animacji w trzech wariantach, przełączanych czarną pigułką na dole „Quiet / Focus / Ledger” z ikoną resetu. Quiet: karta ze stepperem kropek, pola Name/Email, opcje jako karty z obramowaniem zaznaczenia i chipy narzędzi. Focus: jedno duże pytanie na ekran z inputem podkreślonym i „press Enter”. Ledger: akordeon kroków (About you / Experience / Tools) z checkiem, „Edit” i „Save & continue”.
- **Ruch:** Przejście między pytaniami w Focus: stare pytanie rozmywa się i znika, nowe wjeżdża z blur do ostrości, ok. 0,4 s. W Ledger sekcja zwija się i następna rozwija wysokością. Przełącznik wariantów to segmented z przesuwaną pigułką.
- **Dla Tessery:** Proces: w galerii Tessery dodać przełącznik wariantów (segmented) nad makietą, żeby porównywać propozycje na żywo zamiast osobnych plików. Sam przełącznik to gotowy wzorzec przepisu kontrolki z wskaźnikiem.
- **Domysł:** Pasuje do jego reguły „ty proponujesz warianty, ja sprawdzam”; chce szybko przełączać propozycje w jednej makiecie.
- **Też:** Przełączniki i segmenty, Pola, Zakładki, Karty, Ruch (ogólnie), Układ i panele

### ★ L425 · [Jay Dwivedi (@jaydwivedi\_)](https://x.com/jaydwivedi_/status/2115119045611851975?a=1CynoEiP6RnUPZAQ6jg&s=20) · ms 2026-10-28

- **Co pokazuje:** Cztery obrazy z jasnymi, „wypukłymi” kontrolkami: pigułki statusów (Pending, Submitted, Success, Failed, Expired) na białym tle z kolorową ikoną i tekstem; zestaw: Ask AI z gradientem, chip z awatarem i x, przerywany Upload, Filter · 2 z x, segmented wyrównania z białym aktywnym, stepper „30 mins” z Book a Call, Online, In progress z przerywanym kółkiem, Search z okrągłym przyciskiem; toolbar tekstu (Inter · Regular, 14px, kolor, B/I/U, grupa wyrównań w zagnieżdżonej pigułce, tooltip „Bold: ⌘ + B”).
- **Dla Tessery:** Wzorcowy zestaw pigułek i toolbara: zagnieżdżona grupa z koncentrycznym promieniem, aktywny segment jako biała wypukła wyspa, statusy z kolorem tylko w ikonie i tekście. Silniki koloru, kształtu i głębi.
- **Domysł:** Wygląd kontrolek-pigułek i toolbara stylu tekstu bardzo bliski jego koncepcji UI.
- **Też:** Przycisk, Przełączniki i segmenty, Zakładki, Tooltip, Kolor, Ikony

### ★ L860 · [Florian (@flornkm)](https://x.com/flornkm/status/2072346223189631437) · tests 2026-07-01

- **Co pokazuje:** Florian (@flornkm) porównuje dwa jasne ekrany Sign in (Continue with Google/GitHub, checkbox „I accept the Terms & Conditions”) z przełącznikiem Bad/Good u dołu. „Bad”: kliknięcie bez zgody pokazuje czerwony tekst błędu pod checkboxem. „Good”: brak komunikatu, a wiersz z checkboxem tylko się trzęsie. Drugi film to inspiracja z Raycast Glaze („Welcome to Glaze”, ten sam szturchający wiersz zgody obok złotej bryły 3D).
- **Ruch:** Zbliżenie 30 fps: po kliknięciu wiersz checkboxa drga poziomo, ok. ±7 px w lewo i prawo, z gasnącą amplitudą przez ok. 0,4 s (3–4 wahnięcia, translateX), potem wraca na miejsce. Przycisk przy kliknięciu ledwo się wciska. Przełącznik Bad/Good u dołu to segmentowana pigułka z białym wskaźnikiem na szarym tle.
- **Dla Tessery:** „Nudge” jako stan błędu w silniku stanu: krótkie, gasnące drganie translateX (±6–8 px, ok. 400 ms) zamiast czerwonego komunikatu dla oczywistych błędów (niezaznaczony checkbox, puste pole). To czyste transform, zgodne z regułą ruchu. Do przepisu kontrolki jako wariant stanu invalid.
- **Domysł:** Elegancka sygnalizacja błędu bez tekstu, czyli mikro-interakcja do kontrolek Tessery.
- **Też:** Pola, Ruch (ogólnie), Przełączniki i segmenty

### ★ L918 · [Michael Nowak (@mnowakdesign)](https://x.com/mnowakdesign/status/2109660881634373844?s=20) · tests 2026-10-12

- **Co pokazuje:** Cztery kwadratowe zbliżenia detali jasnego UI (Michael Nowak): pigułka statusu „Pending” (pomarańczowy tekst i spinner na jasnopomarańczowym tle z obwódką w tym samym odcieniu) i szara „Scheduled” z ikoną kalendarza, karta „Readiness trend” z zieloną linią wykresu w wewnętrznej, zaokrąglonej karcie i kropkami paginacji, pole „Type your idea...” z gradientową obwódką (róż→fiolet) i okrągłym gradientowym przyciskiem oraz chipy akcji, a także segment „All / Connected / Available” (czarna pigułka aktywna) z kartą integracji Slack i tagami „Active” (zielony) i „Communication” (szary).
- **Dla Tessery:** Pigułka statusu jako tint: tekst i ikona w kolorze, tło 10–15% i obwódka ok. 25% tego samego odcienia. To gotowy przepis wskaźnika statusu dla silnika koloru (Pending/Scheduled/Active). Karta w karcie z koncentrycznymi promieniami i segment z wypełnioną aktywną pigułką także pasują do przepisów powierzchni i kontrolki.
- **Domysł:** „If you notice the little things”: detale pigułek, tintów i promieni jako wzór jakości dla Tessery.
- **Też:** Zakładki, Pola, Karty, Kolor

### ★ L921 · [Noman (@Nomandsign)](https://x.com/Nomandsign/status/2111119916917252263?s=20) · tests 2026-10-16

- **Co pokazuje:** Dwa filmy o uchwycie zmiany szerokości panelu. Noman (jasny, beżowy interfejs Are.na): na granicy sidebara i treści widać krótką, ciemną, pionową pigułkę (ok. 3×30 px) w miejscu kursora. Oryginał Mariany Castilho (Profound, ciemny): ta sama pigułka na granicy grafu sieci i listy „Brand Context Records” (Offerings, Company, Audience… w kolorach) z kursorem ◁|▷.
- **Ruch:** Zbliżenia 30 fps: pigułka uchwytu podąża za kursorem w pionie wzdłuż krawędzi panelu (w quote zmienia y razem z kursorem), a w poziomie przykleja się do kursora i przesuwa krawędź. Panel zmienia szerokość w czasie rzeczywistym, bez opóźnienia. Przy dociągnięciu do krańca sidebar się zwija, pigułka znika i pojawia się po drugiej stronie. Po zjechaniu kursora pigułka zostaje lub gaśnie. Bounce brak.
- **Dla Tessery:** Uchwyt podziału jako krótka pigułka, która pojawia się tylko na hover i jedzie za kursorem w osi Y (transform translateY), zamiast stałej linii na całą wysokość. Pasuje do przepisu wskaźnika i do ustalonego „uchwyt = jeden system” w MangaShift (resizable panele edytora).
- **Domysł:** Mały, dopracowany uchwyt zmiany rozmiaru do paneli edytora MangaShift.
- **Też:** Układ i panele, Ruch (ogólnie)

### ★ L925 · [Jamie Merrill (@Jamie_Merrill)](https://x.com/Jamie_Merrill/status/2111898313478094895?s=20) · tests 2026-10-18

- **Co pokazuje:** Statyczny obraz „Rule builder” (Jamie Merrill), jasny i minimalistyczny. Nagłówek „WHEN”, zablokowany wiersz „Expense status is [Submitted ▾]” z kłódką, potem wiersze warunków w szarych zaokrąglonych kontenerach z uchwytem drag (6 kropek) i białymi selectami („Seniority ▾ is Equal to ▾ Manager”). Zagnieżdżona grupa „Group · 3 conditions” z łącznikiem „Or”, multi-chipami „Food & drink ×”, „Travel ×”, przyciskiem „Add condition”, łącznikiem „And” po lewej i przyciskami „Add rule” / „Add group”.
- **Dla Tessery:** Wiersz jako szara powierzchnia z białymi kontrolkami w środku (koncentryczne promienie, kontrolka o jeden poziom jaśniejsza niż wiersz) i łączniki And/Or jako małe pigułki na liniach drzewa. Bezpośredni wzór dla przepisów wiersza i kontrolki oraz dla zagnieżdżania (drzewo warunków, np. filtry pipeline).
- **Domysł:** Czysty wzór zagnieżdżonych wierszy z kontrolkami: hierarchia powierzchni i kontrolek.
- **Też:** Pola, Listy, Drzewo, Przycisk, Układ i panele

### I:ms-2026-01-20-1463231563767611433-0-image.png · obraz `ms-2026-01-20-1463231563767611433-0-image.png`

- **Co pokazuje:** Edytor tekstu ElevenLabs v3: obrysowana pigułka mówcy „David – American Narrator” z ikoną, akapit z wplecionymi tagami emocji ([doubtful], [annoyed], [slow], [pause], [laugh]) jako fioletowe chipy z obrysem, zaznaczenie tekstu na niebiesko, separator „+ Add speaker”.
- **Dla Tessery:** Wzór chipów inline w polu tekstowym: tagi jako mały obrysowany chip w kolorze akcentu, w linii tekstu, bez przerywania akapitu. Pigułka mówcy z ikoną nad blokiem. Separator z wyśrodkowaną akcją „+ Add”. Pasuje do edytora TTS MangaShift (silnik koloru i kształtu, przepis wskaźnika).
- **Domysł:** Wzór edycji tekstu do TTS z tagami emocji dla kroku TTS w MangaShift.
- **Też:** Pola, Typografia

### I:ms-2026-04-13-1493334075111379126-0-image.png · obraz `ms-2026-04-13-1493334075111379126-0-image.png`

- **Co pokazuje:** Ciemne okno desktopowej aplikacji BridgeVoice, ekran Shortcuts: sidebar z zaznaczonym wierszem (niebieskawe tło), karty sekcji z ikoną w kafelku, zielone pigułki „Active” z kropką, pole przechwytywania skrótu „Press any key combination…” z obramowaniem akcentu i Cancel, chip „fn”, pole skrótu „⌘ + S” z przyciskami Change (niebieski) i Clear. Na środku pływająca pigułka nagrywania.
- **Dla Tessery:** Kompletny wzór ekranu ustawień w desktopowej apce: karta sekcji z ikoną w kafelku, tytułem i opisem; pigułka statusu z kropką w kolorze semantycznym; pole przechwytywania skrótu z obramowaniem akcentu w stanie aktywnym i kbd-chipy klawiszy; sidebar z sekcją użytkownika i przyciskiem Collapse na dole. Mapuje się na przepisy powierzchni, kontrolki i wskaźnika oraz silniki stanu i fokusu.
- **Domysł:** Wzór ekranu skrótów i ustawień dla desktopu MangaShift (Tauri), plus pomysł z pigułką nagrywania.
- **Też:** Układ i panele, Karty, Pola, Przycisk, Listy

### I:tests-2026-05-31-1510561375829753918-0-image0.jpg · obraz `tests-2026-05-31-1510561375829753918-0-image0.jpg`

- **Co pokazuje:** Post UXBrainy „Which is better?”: dwa jasne ekrany logowania; A ma cztery pełnoszerokościowe przyciski-pigułki logowania społecznościowego, B cztery okrągłe przyciski z samymi ikonami. Pola z ikoną z lewej i przyciskiem oka z prawej, czarny przycisk-pigułka „Login”, separator „or”.
- **Dla Tessery:** Przepis kontrolka: pole z ikoną wiodącą i akcją końcową (pokaż hasło) w jednej obwódce; pigułka pełnej szerokości jako główny przycisk, przyciski drugorzędne obrysowane; porównanie przycisków z etykietą i samych ikon (A czytelniejsze).
- **Domysł:** Inspiracja UX do ekranu logowania lub konta (BYOK, strona).
- **Też:** Pola, Przycisk, Układ i panele

### I:tests-2026-09-26-1553468981350895699-0-image.png · obraz `tests-2026-09-26-1553468981350895699-0-image.png`

- **Co pokazuje:** Kadr z filmu (napis „GPT-6 Astra”) z landingiem useplunk.com: duży, ciasny nagłówek, czarna pigułka CTA ze strzałką obok obrysowanej pigułki, delikatna siatka w tle i rząd statystyk z dużymi liczbami i podpisami monospace.
- **Dla Tessery:** Dla strony składanej z Tessery: para CTA (wypełniona pigułka ze strzałką i obrysowana pigułka), rząd statystyk duża liczba plus podpis mono (silnik typografia); siatka tła jako subtelna powierzchnia.
- **Domysł:** Przykład strony zbudowanej przez model AI; możliwy wzór dla mangashift.com.
- **Też:** Przycisk, Typografia, Układ i panele

### L276 · [Jeet (@jeetnirnejak)](https://x.com/jeetnirnejak/status/2083538333708533772?s=20) · ms 2026-08-02

- **Co pokazuje:** Biała karta 'Activity' z rzędem pigułek-filtrów z kolorową kropką (Commits zielony, Focus fioletowy, Writing żółty, Exercise czerwony), licznikiem i siatką heatmapy w stylu GitHuba; tooltip z wartością i datą nad komórką; stopka ze statystykami i legendą Less/More.
- **Ruch:** Po zmianie kategorii siatka przebarwia się falą od lewej do prawej (stagger kolumn ok. 0,5–1 s), licznik się aktualizuje; aktywna pigułka dostaje tło w kolorze kategorii; tooltip podąża za kursorem.
- **Dla Tessery:** Pigułki-filtry z kolorową kropką i tłem aktywnym w kolorze kategorii oraz kaskadowa zmiana danych (stagger opacity) jako wzór; tooltip na siatce danych.
- **Domysł:** Ładny wzór małego dashboardu z pigułkami; może do statystyk projektu.
- **Też:** Tooltip, Ruch (ogólnie), Karty

### L295 · [Teddy Ni (@Teddarific)](https://x.com/Teddarific/status/2085397160716365956?s=20) · ms 2026-08-07

- **Co pokazuje:** UI agenta na jasnym tle: lista zadań równoległych (Mapping design tokens, Tracing business logic, Inventorying custom components, Understanding product intent) z małymi ikonami-orbami i aktualizowanym podpisem (Read 5 files, Matched ...). Cytowany post: biblioteka Thinking Orbs, ciemne pigułki z kulkami z kropek i etykietami Solving/Thinking/Searching/Planning/Listening, duży i mały rozmiar.
- **Ruch:** Tekst aktywnego zadania ma przesuwający się połysk (shimmer, gradient przez litery, cykl ok. 1–1,5 s); orby z kropek obracają się/pulsują w pętli; pigułki w demo przewijają się w górę.
- **Dla Tessery:** Shimmer tekstu jako wskaźnik 'w toku' dla wierszy zadań pipeline'u (maska gradientu przesuwana transformem) i mały animowany znacznik stanu w pigułce; pasuje do przepisu wiersza i wskaźnika.
- **Domysł:** MangaShift pokazuje postęp kroków pipeline'u; chciał ładnego wskaźnika pracy agenta.
- **Też:** Listy, Ruch (ogólnie), Typografia

### L335 · [Inspora (@insporadesign)](https://x.com/insporadesign/status/2091528207962947664?s=20) · ms 2026-08-24

- **Co pokazuje:** Jasna karta „Trip Dates”: badge z liczbą nocy, pola Check-in / Check-out z podkreśleniem aktywnego, siatka września 2026. Zakres to ciągła pigułka tła łącząca dni, z kółkami na końcach. Presety na dole (Weekend, 3 nights, 1 week, 2 weeks) mają własne kolory (żółty, zielony, niebieski, fiolet) i kolorują zakres; jest Clear.
- **Ruch:** Podgląd zakresu na hover, kolor zakresu i badge zmieniają się przy wyborze presetu; przejścia krótkie, bez bounce.
- **Dla Tessery:** Zakres jako jedna pigułka przez komórki (nie osobne tła dni) i kolor powiązany z presetem. Dotyczy przepisu wskaźnika i silnika koloru.
- **Domysł:** Ładny picker z presetami; ogólna inspiracja zaznaczania zakresu (np. zakres stron).
- **Też:** Pola, Kolor, Karty

### L390 · [link](https://metalforge.xyz/interactions#component=pay) · ms 2026-10-09

- **Co pokazuje:** MetalForge (tekst strony, kod zablokowany za Pro): 24 animowane komponenty SwiftUI i Web, m.in. Quantity Stepper, Hold to Confirm, Segmented Control, Toast, Expanding Search, Code Input, Select, Switch + Disclosure, Popover Menu, Status Pill, Progress Button, Checkout. Panel parametrów: stan wyniku (success/failed), efekty sukcesu Sheen/Holo/Sparks/Aura, długość/siła ruchu.
- **Ruch:** Brak nagrania; z opisu: efekty sukcesu i parametry ruchu (Length, Strength).
- **Dla Tessery:** Pomysł na galerię Tessery: panel parametrów przy komponencie (długość, siła ruchu, stan) do strojenia na żywo.
- **Domysł:** Katalog dopracowanych mikrointerakcji z regulacją parametrów.
- **Też:** Przycisk, Przełączniki i segmenty, Pola, Design systemy i zasady, Ruch (ogólnie)

### L411 · [mi©k (@mickces)](https://x.com/mickces/status/2112339676690616816?s=20) · ms 2026-10-20

- **Co pokazuje:** Ciemna karta z trzema komórkami OTP i ikoną menedżera haseł wciśniętą w pole; po wpisaniu cyfr komórki zlewają się w pigułkę „✓ Verified”. Tekst porady: autocomplete="one-time-code" oraz data-1p-ignore i data-lpignore wyłączają przejmowanie pola przez menedżery haseł. Obraz z cytatu to baner bencho.dev.
- **Ruch:** Komórki zlewają się w pigułkę z blur ok. 0,2 s.
- **Dla Tessery:** Atrybuty data-1p-ignore / data-lpignore dla pól, które nie są hasłami (np. klucze API w BYOK MangaShift). Do przepisu inputu.
- **Domysł:** Pola kluczy API w ustawieniach przejmowane przez menedżery haseł.
- **Też:** Pola, Ruch (ogólnie)

### L677 · [orcdev](https://vm.tiktok.com/ZNHgF4RQ7GnUL-6WGYj/) · tests 2025-07-11

- **Co pokazuje:** orcdev na fioletowym tle pokazuje 4 dodatki do shadcn: Shadcn Extension z Multi Select (ciemny input z chipami „react ×” „vue ×” i rozwijaną listą z ptaszkami), motion-primitives z Text Shimmer, RigidUI z Guided Tour (dymek „Your Statistics” z krokami, paskiem postępu, Skip Tour / Back / Next / Finish i podświetleniem karty) oraz Aceternity ze Spotlight (smuga światła na ciemnej siatce za nagłówkiem).
- **Ruch:** Text Shimmer to przesuwający się w poziomie połysk po tekście „Generating code...”, w pętli. Guided Tour: dymek przeskakuje między celami (Profile → Statistics → Settings → Recent Activities), a pasek postępu w dymku rośnie. Spotlight wjeżdża ukośnie przy załadowaniu.
- **Dla Tessery:** Multi Select z chipami jako wzór kontrolki input z pigułkami (przepis kontrolki + wiersza listy z ptaszkiem). Text Shimmer (gradient przesuwany translate/background-position, w pętli) przyda się jako wskaźnik stanu „generuje” w pipeline.
- **Domysł:** Szukał gotowych komponentów: multi select, onboarding tour i shimmer ładowania.
- **Też:** Pola, Tooltip, Ruch (ogólnie), Design systemy i zasady

### L909 · [yui540 (@yui540)](https://x.com/yui540/status/2107277692127379823?s=20) · tests 2026-10-06

- **Co pokazuje:** yui540 („yui.”), cztery szare kafle z zaokrąglonymi rogami na białym tle, każdy z innym zabawnym ekranem ładowania z czarnym kotkiem-glutkiem. Pierwszy: kot skacze na pasku i spłaszcza się. Drugi: napis LOAD, w którym „O” zamienia się w pigułkę paska postępu wypełnianą od lewej. Trzeci: stos kotów na półce. Czwarty: pasek postępu z japońskimi podpisami (読み込み中 → あと半分 → もうちょっと → 完了!), a koty wskakują w róg i na koniec obsiadają kafel.
- **Ruch:** Pętla ok. 6 s. Kot skacze ze squash and stretch (spłaszczenie przy lądowaniu, z cieniem pod spodem). Litery LOAD rozsuwają się, a „O” rozciąga się w pigułkę i wypełnia od lewej. Pasek postępu rośnie skokowo z podpisami etapów. Wszystko to CSS, z wyraźną sprężystością przy lądowaniu.
- **Dla Tessery:** Litera O, która rozciąga się w pigułkę paska postępu, to pomysł na wskaźnik ładowania w przepisie wskaźnika (scaleX na pigułce plus etykiety etapów jak „Detection → OCR → …” w pipeline). Squash przy lądowaniu potwierdza charakter lekkiego bounce w silniku ruchu.
- **Domysł:** Urocze, japońskie animacje ładowania z maskotką; pasuje do mangi i maskotki MangaShift.
- **Też:** Ruch (ogólnie)

### L911 · [Nizam (@nizamdesign)](https://x.com/nizamdesign/status/2107214242369921430?s=20) · tests 2026-10-06

- **Co pokazuje:** Nizam pokazuje redesign aplikacji „Permitly” (pozwolenia budowlane). Jasny dashboard z lewym sidebarem, „Good morning, Nizam”, kartą projektu ze zdjęciem domu, statystykami (128, 47, 18, 7), tabelą „Needs attention” z czerwonymi pigułkami statusu, czarną kartą AI i limonkową kartą „Package compliance 94”. Dalej siatka projektów, strona projektu, dokumenty, compliance review z wynikiem 87 → 96, dialog AI i ekran „23 of 23 requirements complete” z limonkowym paskiem.
- **Ruch:** Przejścia między widokami: treść znika i pojawia się nowa (fade ok. 0,3 s, w klatkach co 0,65 s widać pusty ekran przejściowy). Dialogi wchodzą z przyciemnieniem tła. Wskaźnik kołowy 87 → 96 przelicza się.
- **Dla Tessery:** Jeden nasycony akcent (limonka) tylko na stanach sukcesu i postępu, a reszta neutralna: dobra lekcja dla silnika koloru. Tabela z pigułkami statusu i gęsty sidebar to wzór dla przepisu wiersza i listy rozdziałów w MangaShift.
- **Domysł:** Dopracowany, gęsty dashboard produktowy jako wzór jakości UI.
- **Też:** Układ i panele, Listy, Karty, Dialog i popup, Kolor

### L924 · [Michael Nowak (@mnowakdesign)](https://x.com/mnowakdesign/status/2111834200932520302?s=20) · tests 2026-10-18

- **Co pokazuje:** Ten sam projektant i prawie ten sam zestaw co L918, tylko w innych kadrach: pigułki Pending/Scheduled, ekran „Home – Create something amazing” z polem prompta w gradientowej obwódce, chipami (Text to speech, Generate image, muzyka) i pomarańczowo-różowym banerem z rastrem „Premium sounds. Better storytelling.”, segment All/Connected/Available z kartą Slack oraz karta „Readiness trend”.
- **Dla Tessery:** To samo co L918, plus chipy akcji z ikoną w szarej pigułce pod polem prompta, czyli wzór rzędu szybkich akcji (przepis kontrolki, wariant ghost/soft). Baner z rastrem to raczej strona niż aplikacja.
- **Domysł:** Kolejny post tego samego autora z detalami UI. Pomysł z TTS i generacją zbliżony do MangaShift.
- **Też:** Zakładki, Pola, Karty, Kolor

## Zakładki

### ★ L426 · [Kevin (@keviduk)](https://x.com/keviduk/status/2115445879725256843?a=mcUyKyKpbo-dCGv2M2w&s=20) · ms 2026-10-28

- **Co pokazuje:** Kontrolki zbudowane na jednej geometrii (36×20 pt, promień 4, inset 2) z podpisanymi tokenami Surface / Muted / Accent. Kolejno: checkbox → switch z białym kciukiem → stepper (tor poszerza się do 68×20, kciuk zostaje, pojawia się liczba i +) → segmented Day/Week/Month → suwak z podziałkami i etykietą Low/High/Extra high → range z wypełnieniem → spinner → chipy Design/Motion/Code.
- **Ruch:** Przełączanie między kontrolkami to jedna forma zmieniająca kształt: tor się rozszerza, kciuk przesuwa, treść fade; ok. 300 ms, bez bounce (zbliżenie L426-zoom.jpg). Etykieta suwaka rośnie przy przeciąganiu.
- **Dla Tessery:** Dokładnie idea przepisu „kontrolka”: wspólny tor, kciuk i inset dla checkboxa, switcha, steppera, segmented i suwaka. Wziąć jako test spójności przepisów Tessery.
- **Domysł:** Potwierdza jego „unifikację” i jedną rodzinę elementów.
- **Też:** Przełączniki i segmenty, Suwak, Przycisk, Design systemy i zasady, Ruch (ogólnie)

### L294 · [dmytro (@pqoqubbw)](https://x.com/pqoqubbw/status/2085403794859540805?s=20) · ms 2026-08-06

- **Co pokazuje:** Biała karta z tekstowymi zakładkami GitHub/GitLab/Bitbucket; u góry nagłówek z kropkowym wzorem shadera w kolorze marki (szary, pomarańczowy, niebieski) i ikoną w środku, pod nim tytuł 'X connection required', opis, czarny przycisk i link 'Learn more'.
- **Ruch:** Zmiana zakładki: cała treść karty rozmywa się i przenika do nowej (ok. 300 ms), wysokość bez zmian; kropki wzoru delikatnie migoczą.
- **Dla Tessery:** Zmiana treści karty przy przełączaniu zakładek jako szybki cross-fade (Tessera bez blur, sama opacity) przy stałej wysokości; kropkowy nagłówek w kolorze kategorii jako dekoracja stanu pustego.
- **Domysł:** Ładny stan pusty/połączenia z zakładkami.
- **Też:** Karty, Kolor, Ruch (ogólnie)

### L346 · [Dinil Thilakarathne](https://sona-ui.vercel.app/components) · ms 2026-09-01

- **Co pokazuje:** Katalog Sona UI (tekst strony, brak nagrań): 26 animowanych komponentów React, m.in. Morph Surface, Animated Dropdown, Animated Dialog, Accordion, Fluid Tabs, Fluid Tooltip, Animated Switch, Expanding Action, Fluid Slider, Hold To Delete Button. Instalacja przez shadcn, oparte na Base UI i Motion, MIT.
- **Ruch:** Nie do oceny bez nagrań; z opisów: fluid tabs, morph surface, dropdown z animacją.
- **Dla Tessery:** Referencja kodu z tym samym fundamentem (Base UI); warto przeczytać źródła Fluid Tabs, Morph Surface i Fluid Tooltip przed własnym przepisem sliding.
- **Domysł:** Biblioteka bliska Tesserze technicznie, do podglądania rozwiązań.
- **Też:** Design systemy i zasady, Ruch (ogólnie), Menu, Dialog i popup, Przełączniki i segmenty

### L399 · [Maxim Kuznetsov (@disarto_max)](https://x.com/disarto_max/status/2107575107267052006?s=20) · ms 2026-10-11

- **Co pokazuje:** Karta „Context window” z etykietą Live: 142,6K tokenów, 10,99 $, siatka komórek jako skumulowany pasek (fiolet, żółty, zielony, niebieski) z czarnym tooltipem na hover segmentu. Pod spodem segmented do przełączania list i lista plików z mini paskami; przypięcie lub wyrzucenie elementu daje toast; pomarańczowy przycisk „Compact history”.
- **Ruch:** Liczby tokenów rolują w górę i w dół (139,0K → 148,4K), komórki siatki zmieniają kolor, tooltip jedzie za kursorem.
- **Dla Tessery:** Wskaźnik zajętości z segmentów i rolujące liczby to przepis wskaźnika; przydatny np. do VRAM w MangaShift.
- **Domysł:** Wizualizacja zużycia zasobu (VRAM, kolejka).
- **Też:** Karty, Tooltip, Listy, Kolor

### L422 · [Kelvin (@kelvinzhg)](https://x.com/kelvinzhg/status/2114756680047321369?s=46&t=2RAXW1xB-Hl4YwLE9tMsyQ) · ms 2026-10-27

- **Co pokazuje:** Glisse, liquid glass z iOS 26 w przeglądarce, na niebieskiej tapecie: segmented Day/Week/Month, przycisk ikonowy, „Continue”, menu „…”, suwak, wyszukiwarka, przełącznik jasny/ciemny, menu kontekstowe Pin / Rename / Duplicate / Delete (czerwony).
- **Ruch:** Kciuk suwaka przy przeciąganiu rozdyma się w szklaną soczewkę; szkło jaśnieje przy zmianie motywu; menu wysuwa się.
- **Dla Tessery:** Rozdęcie kciuka podczas drag (scale) jako stan aktywny suwaka; samo szkło (backdrop-filter) jest drogie dla kompozytora, raczej nie dla aplikacji.
- **Domysł:** Ciekawość efektu liquid glass jako motywu.
- **Też:** Kolor, Suwak, Menu, Design systemy i zasady

## Menu

### ★ L320 · [link](https://emilkowal.ski/ui/you-dont-need-animations) · ms 2026-08-19

- **Co pokazuje:** Brak plików; artykuł 'You Don't Need Animations': animacja musi mieć cel; częstotliwość użycia decyduje (Raycast bez animacji); akcje z klawiatury nigdy nie animowane (podświetlenie listy przy strzałkach ma być natychmiastowe); UI poniżej 300 ms (dropdown 180 ms lepszy niż 400 ms); tooltip z opóźnieniem tylko za pierwszym razem, kolejne bez opóźnienia i animacji; press scale przycisku jako celowy ruch.
- **Dla Tessery:** Zasady do silnika ruchu: brak animacji dla nawigacji klawiaturą i częstych akcji (także sliding wskaźnika przy strzałkach), limit 300 ms, tooltip bez opóźnienia po pierwszym.
- **Domysł:** Granice, kiedy Tessera ma NIE animować; zgodne z jego 'wydajność > piksel'.
- **Też:** Ruch (ogólnie), Tooltip, Listy

### ★ L349 · [Nitish Khagwal (@nitishkmrk)](https://x.com/nitishkmrk/status/2094614024357048716?s=20) · ms 2026-09-01

- **Co pokazuje:** Jasne menu-drzewo z samej typografii: Foundation, Components, Gestures, Interactions, Patterns. Klik w gałąź chowa rodzeństwo, gałąź staje się szarym nagłówkiem ze strzałką wstecz, a dzieci (Tap, Swipe, Drag…) pojawiają się z wcięciem; można zejść poziom niżej (Swipe → Swipe Left/Right…). Hover to szara pigułka.
- **Ruch:** Rodzeństwo znika z blur + fade, wybrany element przesuwa się na górę, dzieci wjeżdżają; powrót odwraca sekwencję, ok. 0,3 s.
- **Dla Tessery:** Nawigacja drill-down zamiast rozwijanego drzewa: dobra dla wąskich paneli (np. ustawienia, kategorie). Przepis wiersza + przesunięcie nagłówka transformem.
- **Domysł:** Ma w planach drzewo i nawigację; podoba mu się czysta typografia bez ramek.
- **Też:** Drzewo, Listy, Ruch (ogólnie)

### ★ L397 · [Maxim Kuznetsov (@disarto_max)](https://x.com/disarto_max/status/2109014020535767360?s=20) · ms 2026-10-11

- **Co pokazuje:** Cztery warianty sidebara na jasnym tle z przerywaną siatką: sam rail ikon w pigułce; pełny panel (Acme Inc., wyszukiwarka ze skrótem, Inbox z badge, rozwinięte Automations z liniami drzewa, Favorites, pasek „Credits used 810/3100”, karta użytkownika); rail + panel Reports z drzewem i aktywnym wierszem na szarym tle; rail z awatarem i pierścieniem kredytów. Białe wyspy, duży promień, miękki cień.
- **Ruch:** Podmenu rozwija się, dropdown użytkownika wysuwa się, panel zwija do railu z tooltipem „Expand sidebar”.
- **Dla Tessery:** Komplet stanów sidebara (rail / pełny / rail+panel) w stylu wysp, który właściciel ma jako domyślny; linie drzewa i pierścień zużycia jako przepis wskaźnika.
- **Domysł:** Układ okna MangaShift z szyną i panelem; styl wysp.
- **Też:** Układ i panele, Drzewo, Listy, Tooltip

### ★ L408 · [csakani (@csakanii)](https://x.com/samosemudiamhe/status/2112236552701243610?s=20) · ms 2026-10-20

- **Co pokazuje:** Dwa sidebary SakaniUI obok siebie: „Regular tokens · Solid surface” i „Liquid glass · Refractive panel”. Ciemny rail z inicjałami workspace'ów, panel Northwind z wyszukiwarką ⌘K, sekcje CUSTOMER MANAGEMENT (Overview aktywny, Accounts…, Approvals z badge 4) i WORKSPACE.
- **Ruch:** Hover podświetla wiersz; przycisk zwija panel do railu w obu motywach naraz.
- **Dla Tessery:** Ten sam komponent, dwa motywy tylko przez tokeny powierzchni: dokładnie model silnika koloru i głębi Tessery; dobry test, czy przepisy nie zaszywają wyglądu.
- **Domysł:** Chce motywów, które zmieniają wygląd bez zmiany komponentów.
- **Też:** Design systemy i zasady, Kolor, Układ i panele

### ★ L410 · [Samuel Okpere](https://www.sakaniui.com/docs/components/sidebar) · ms 2026-10-20

- **Co pokazuje:** Dokumentacja Sidebar w SakaniUI (tekst strony): „kompozycja, nie config”. Sidebar nie bierze tablicy items; składa się z dziewięciu części ułożonych ręcznie. collapsed przekazywany każdej części osobno; zwinięte wiersze mają natywny tooltip, który wyłącza się, gdy owijasz własnym Tooltipem. Propsy SidebarItem: label, icon (komponent), active, activeIndicator, badge, hasSubmenu, disabled, href.
- **Dla Tessery:** API kompozycyjne zamiast configu i jawna reguła „natywny tooltip albo nasz, nigdy oba”. Pasuje do Base UI i przepisu wiersza.
- **Domysł:** Decyzja API sidebara w Tesserze.
- **Też:** Układ i panele, Design systemy i zasady

### ★ L427 · [kev (@koppkev)](https://x.com/koppkev/status/2115799686166495598?a=4oHWw9U-E6_exoptjSk&s=20) · ms 2026-10-29

- **Co pokazuje:** Czarne tło, okrągły przycisk „…” i pigułka „Share”. Klik „…” zamienia przycisk w menu Edit / Duplicate / Archive / Delete (różowy); „Share” otwiera w dół Copy link / Email / Embed. Hover to szare tło wiersza. Czysty HTML/CSS/JS.
- **Ruch:** Przycisk rośnie w rozmyty blob ku górze i wyostrza się w menu, ok. 250–300 ms (zbliżenie L427-zoom.jpg); zamknięcie odwraca morf z blur. Kierunek zależy od miejsca przycisku.
- **Dla Tessery:** Popover rosnący z triggera (transform-origin na przycisku, scale + opacity, krótki blur). Wariant otwierania menu dla przepisu powierzchni; blur ograniczyć, bo filter kosztuje.
- **Domysł:** Chce menu, które wychodzi z przycisku, a nie pojawia się obok.
- **Też:** Przycisk, Ruch (ogólnie)

### ★ L428 · [shawn. (@zzzzshawn)](https://x.com/zzzzshawn/status/2116196000864084403?a=h_oDsgliD2c4d1osnQA&s=20) · ms 2026-10-30

- **Co pokazuje:** Ciemne zagnieżdżone menu: przycisk „+ Create application” zamienia się w menu z nagłówkiem i x (Git repository ›, Hello World, Template, Upload). Najechanie „Git repository” otwiera przylegający panel w prawo (Artifacts, GitHub, GitLab, Other source) z przyciskiem ←.
- **Ruch:** Panel podmenu dokleja się z boku i zanika przy zamknięciu, ok. 0,3 s; hover przesuwa się między wierszami.
- **Dla Tessery:** Podmenu jako przyklejony panel tej samej wyspy zamiast osobnego popovera; przepis powierzchni dla menu kontekstowych edytora.
- **Domysł:** Zagnieżdżone menu w aplikacji, wygenerowane bez instrukcji przez narzędzie do prototypów.
- **Też:** Przycisk, Ruch (ogólnie)

### ★ L935 · [Maxim Kuznetsov (@disarto_max)](https://x.com/disarto_max/status/2112944618559910363?s=20) · tests 2026-10-21

- **Co pokazuje:** Maxim Kuznetsov, sidebar w trybie ciemnym w kilku wariantach obok siebie. Pełny sidebar (Acme Inc., Search ⌘K, Inbox z czerwonym licznikiem 3, Deals, People, Tasks, Reports, rozwijane Automations z Workflows/Sequences, Schedule, Favorites, Settings, Help center, pasek „Credits used 810/3,100”, karta użytkownika), wąska szyna ikon, szyna z drugim panelem drzewa „Reports” (Overview, Leads, Sales z podpozycjami i linią drzewa) oraz menu profilu z przełącznikiem Dark mode w pomarańczu.
- **Ruch:** Hover podświetla wiersz szarym tłem. Na szynie ikon pojawia się tooltip z nazwą (np. „Deals”) obok ikony. Menu profilu rozwija się w górę nad kartą użytkownika. Rozwijanie Sales w drzewie. Arkusz co 0,95 s nie łapie krzywych.
- **Dla Tessery:** Komplet stanów jednego sidebara (pełny / szyna / szyna + panel drzewa) z identycznymi wierszami: aktywny wiersz jako jaśniejsza pigułka, liczniki jako małe pigułki, linie drzewa dla zagnieżdżenia. To wzór dla przepisu wiersza i dla drzewa projektu w MangaShift, w tym tooltip na szynie ikon.
- **Domysł:** Wzór sidebara i drzewa w wielu stanach dla układu okna MangaShift.
- **Też:** Listy, Drzewo, Układ i panele, Tooltip, Przełączniki i segmenty

### I:ms-2026-10-25-1563908407478714521-0-image.png · obraz `ms-2026-10-25-1563908407478714521-0-image.png`

- **Co pokazuje:** Edytor strony mangi: zaznaczony fioletową ramką boks tekstu z gradientowym napisem „HELLO” i pływający ciemny pasek formatowania (B, I, U, S, próbki koloru, select „Layer font”, select „100% (lay…)”, czyszczenie formatowania).
- **Dla Tessery:** Pływający pasek formatowania nad płótnem: ciemna zaokrąglona wyspa z przełącznikami stylu, próbkami koloru i kompaktowymi selectami w jednej wysokości. Wzór przepisu kontrolki w gęstym pasku kontekstowym (silniki rozmiaru i głębi).
- **Domysł:** Prawdopodobnie edytor tekstu MangaShift albo konkurencji. Wzór paska edycji tekstu na stronie.
- **Też:** Przycisk, Przełączniki i segmenty, Pola

### L424 · [Sean Galt (@seanaiux)](https://x.com/seanaiux/status/2115462341261402428?a=QRBcKkAmWKxCWOLCCBE&s=20) · ms 2026-10-28

- **Co pokazuje:** Trzy ujęcia ciemnego, czystego dashboardu studia AI. (1) FAB „+” obraca się w x i otwiera menu poleceń „Create anything…” (Image, Video, Voice, 3D scene, New project ze skrótami), podmenu Video jako panel obok; po wyborze menu zwija się do paska postępu na dole. (2) Graf węzłów generacji obrazu (Model, Prompt, Style → Image settings → Output), obraz wyłania się z szumu. (3) Biblioteka: karty folderów, lista plików z awatarami, przeciąganie wielu plików do folderu z licznikiem, pasek akcji, toast.
- **Ruch:** Obrót plusa, menu morfuje w pasek postępu, przeciągany plik jako duch z licznikiem; przejścia ok. 0,3 s.
- **Dla Tessery:** Menu, które po wyborze zostaje jako pasek postępu tej samej akcji, oraz przeciąganie z licznikiem: oba pasują do kolejki zadań i biblioteki projektów MangaShift.
- **Domysł:** Wzór czystego ciemnego UI narzędzia kreatywnego, bliski edytorowi MangaShift.
- **Też:** Przycisk, Listy, Układ i panele, Ruch (ogólnie)

### L594 · [SetupsAI](https://vm.tiktok.com/ZNdBvY7gu/) · tests 2025-06-04

- **Co pokazuje:** Film SetupsAI (część 405) pokazuje reactbits.dev: ciemna strona z fioletowymi akcentami i katalog animowanych komponentów React. Każdy ma podgląd, zakładki Preview/Code, panel Customize z suwakami i tabelę props. W filmie przewijają się Metallic Paint, Scrambled Text, Profile Card (karta z poświatą 3D), Pixel Card, Lightning, Letter Glitch, Magnet Lines, Card Swap, Flowing Menu i Infinite Scroll.
- **Ruch:** Flowing Menu: po najechaniu na wiersz menu (MOJAVE/SONOMA/...) wjeżdża pas z marquee tekstu i obrazka, wsuwany od krawędzi, z której wszedł kursor; w klatkach co ok. 0,45 s pas jest w pełni widoczny już w następnej klatce, więc wejście trwa poniżej 0,4 s. Magnet Lines: kreski obracają się w stronę kursora. Card Swap: karty przekładane w głąb stosu.
- **Dla Tessery:** Układ strony komponentu (podgląd + Preview/Code + panel Customize z suwakami + tabela props) to dobry wzorzec dla galerii Tessery. Z ruchu: wjazd podświetlenia wiersza od strony wejścia kursora jako wariant przepisu wiersza (transform translate), bez efektów WebGL.
- **Domysł:** Źródło gotowych animowanych komponentów i wzór dokumentacji z żywymi kontrolkami.
- **Też:** Ruch (ogólnie), Karty, Design systemy i zasady

## Tooltip

### ★ L288 · [Gabriel (@gabriell_lab)](https://x.com/gabriell_lab/status/2084276632353690061?s=20) · ms 2026-08-03

- **Co pokazuje:** Cztery kwadranty na jasnym tle z ikonką info przy krawędzi; dymki 'Tooltip from left/right/top' pojawiają się po stronie, gdzie jest miejsce. Tekst posta: CSS @container anchored(fallback: flip-block) pozwala wykryć, którą pozycję wybrała przeglądarka, i animować z właściwego kierunku.
- **Ruch:** Tooltip wsuwa się kilka px z kierunku kotwicy z fade, ok. 150–200 ms; przy odbiciu od krawędzi kierunek wejścia odwraca się.
- **Dla Tessery:** Kierunek wejścia tooltipa/popovera zależny od faktycznej strony (w Base UI atrybut data-side) to przepis dla ruchu powierzchni pływających; translate o kilka px + opacity.
- **Domysł:** Detal jakości dla tooltipów Tessery przy krawędzi okna.
- **Też:** Ruch (ogólnie)

### ★ L305 · [Jakub Krehel (@jakubkrehel)](https://x.com/jakubkrehel/status/2086833399675646207?s=20) · ms 2026-08-10

- **Co pokazuje:** Jasne plansze numeru 'Accessibility as Craft' (Interfaces): pierścień fokusu na przycisku ikonowym z Tab, Options default vs reduced-motion, etykiety dostępne przycisków ikonowych ('Copy link, button' vs nazwa ikony), toast 'Link copied', skrót ⌘K, obszar trafienia 28 px vs 44 px, aria-live polite vs assertive, kolorowe obrysy fokusu, outline-offset i promień obrysu, :focus vs :focus-visible, link <a> vs <div>, alt opisujący treść.
- **Ruch:** Wersja reduced-motion bez animacji rozwijania; reszta to statyczne porównania.
- **Dla Tessery:** Przepis fokusu Tessery: :focus-visible zamiast :focus, obrys z offsetem i promieniem koncentrycznym z kontrolką, cel trafienia ≥44 px przez pseudo-element, nazwy akcji zamiast nazw ikon, obsługa prefers-reduced-motion w silniku ruchu.
- **Domysł:** Tessera ma silnik fokusu; to lista sprawdzianów dostępności.
- **Też:** Przycisk, Ikony, Design systemy i zasady

### ★ L342 · [Nitish Khagwal (@nitishkmrk)](https://x.com/nitishkmrk/status/2093354742105980954?s=20) · ms 2026-08-28

- **Co pokazuje:** Jasny, gruby tor-pigułka z jasnożółtym wypełnieniem i żółtym okrągłym kciukiem; pod torem pięć kropek-podziałek, aktywna żółta. Nad kciukiem dymek „Aa”, którego rozmiar fontu rośnie z wartością, czyli podgląd efektu ustawienia.
- **Ruch:** Dymek pojawia się na hover/drag i znika z blur + fade ok. 0,2 s; kciuk przeskakuje do podziałek; dymek jedzie za kciukiem.
- **Dla Tessery:** Suwak z podglądem skutku zamiast liczby (rozmiar tekstu, grubość obrysu w panelu stylu MangaShift). Przepis kontrolki + wskaźnika, snap do kroków.
- **Domysł:** Pasuje do panelu stylu tekstu w edytorze (rozmiar fontu).
- **Też:** Suwak, Typografia, Ruch (ogólnie)

### L331 · [Raul (@raul_dronca)](https://x.com/raul_dronca/status/2090786420411547686?s=20) · ms 2026-08-22

- **Co pokazuje:** Jasny suwak z niebieskim wypełnieniem i białym okrągłym kciukiem. Po bokach ikony w kółkach: idący ludzik po lewej, biegnący po prawej; aktywna dostaje niebieskie tło zależnie od wartości (poniżej ok. 50 idzie, powyżej biegnie). Przy przeciąganiu nad kciukiem pojawia się dymek z wartością (6…97).
- **Ruch:** Dymek wartości pojawia się przy drag i znika po puszczeniu; tło ikon przełącza się płynnie przy przekroczeniu połowy; ludzik w ikonie animuje się.
- **Dla Tessery:** Suwak z ikonami końców, które reagują na wartość, i dymkiem tylko podczas przeciągania. Przepis kontrolki i wskaźnika: dymek przez opacity/scale z origin na kciuku.
- **Domysł:** Szukał żywego suwaka (np. prędkość odtwarzania wideo w MangaShift).
- **Też:** Suwak, Ikony, Ruch (ogólnie)

## Dialog i popup

### ★ L244 · [Designmotionhq](https://vm.tiktok.com/ZN8JJxkrR/) · ms 2026-07-22

- **Co pokazuje:** Ciemne plansze 'secrets' czasów animacji: Entrance 200–300 ms (50 ms za szybko, 700 ms za wolno), Exit szybszy od wejścia (250 ms in → 150 ms out, o 30% szybciej), Feedback poniżej 100 ms (press, hover, toggle; próg Doherty'ego), Attention 500–800 ms z bounce (błędy, alerty; shake), Stagger 50 ms między elementami listy/menu (30 za szybko, 100 za wolno). Na końcu ściąga liczb.
- **Ruch:** Modale i przyciski pokazane w trzech tempach obok siebie; alert z bounce i shake; lista wjeżdża kaskadą co 50 ms.
- **Dla Tessery:** Gotowa tabela tokenów czasu do silnika ruchu: feedback \<100 ms, wejście 200–300, wyjście ok. 150 (krótsze od wejścia), stagger 50 ms, bounce tylko dla uwagi/błędów.
- **Domysł:** Chciał liczb do skali czasów ruchu w Tesserze.
- **Też:** Ruch (ogólnie), Listy, Przycisk

### ★ L312 · [rico (@\_heyrico)](https://x.com/_heyrico/status/2086890096599716108?s=20) · ms 2026-08-11

- **Co pokazuje:** Trzy jasne makiety UI workspace AI: okno z górnymi zakładkami (Chat, Agent, Code, Design), sidebar z wierszami ikona+etykieta, nagłówkami grup (Projects, Recents) i aktywnym tłem; czat 'Orchestrator' z osią czasu kroków i chipami źródeł; dialog 'Add Meta campaign' z segmentowanym przełącznikiem, kartami celu z ikonami 3D, wierszem z toggle i polami. Tekst posta: SF Pro 24 px Medium tytuły, 16/26 body, tracking −0,15 px; DM Mono 14 px; paski 38 px, padding 12 px, promień 10 px; wiersze nawigacji 28 px, etykiety 13 px, promień 9 px; tekst #292929/#5D5D5D/#7F7F7F.
- **Dla Tessery:** Konkretne liczby do porównania z silnikami Tessery: wiersz nawigacji 28 px z etykietą 13 px i promieniem 9 px, paski 38 px/r10, trzy poziomy szarości tekstu; segmentowany przełącznik i wiersz ustawienia z toggle jako wzory przepisów.
- **Domysł:** Szukał gotowej ściągi gęstości i typografii dla desktopowego UI.
- **Też:** Układ i panele, Typografia, Listy, Przełączniki i segmenty, Design systemy i zasady

### L912 · [Nizam (@nizamdesign)](https://x.com/nizamdesign/status/2106927352043434387?s=20) · tests 2026-10-06

- **Co pokazuje:** Nizam, projekt UX/UI „Clawback” (reklamacje gwarancyjne). Jasny interfejs z beżowym tłem, lewym sidebarem, kartą „$84,620” z niebieskim gradientem i słupkami, tabelą reklamacji, szczegółem „Compressor replacement” z osią czasu i kartą $1,840, dialogiem „Submit CL-10482 to Carrier”, panelem bocznym „Failure photo”, toastem u dołu oraz widokami Recovery i Manufacturers z kartami w niebieskich gradientach.
- **Ruch:** Widoki zmieniają się przez fade (puste klatki przejściowe). Panel szczegółu wsuwa się z prawej z przyciemnieniem. Toast pojawia się u dołu na środku.
- **Dla Tessery:** Panel szczegółu wysuwany z prawej nad listą (sheet z przyciemnieniem) i toast u dołu na środku jako wzorce powierzchni. Delikatny gradient tylko na kartach z danymi, a reszta płaska: zasada akcentu dla silnika koloru.
- **Domysł:** Wzór czystego, nowoczesnego UI aplikacji SaaS.
- **Też:** Układ i panele, Listy, Karty, Kolor

## Przycisk

### ★ L149 · [designparser | Design Rules](https://vm.tiktok.com/ZNR5HkGQQ/) · ms 2026-02-24

- **Co pokazuje:** Biała siatka, niebieski przycisk 'SHARE VIDEO' z ikoną udostępniania. Pokazane: symetryczny padding 20/20 px, gap 8 px między ikoną a tekstem, potem korekta: 12 px po stronie ikony i 20 px po stronie tekstu; reguła P_icon = P_text − gap; porównanie dwóch przycisków 'Perception is now aligned'.
- **Ruch:** Tylko proste przejścia między planszami tutorialu.
- **Dla Tessery:** Reguła optycznego paddingu przycisku z ikoną: padding strony ikony = padding tekstu − gap; wprost do przepisu kontrolki i silnika odstępów (wariant z ikoną leading/trailing).
- **Domysł:** Pasuje do jego reguły 'padding optyczny'; chciał to zakodować w przycisku Tessery.
- **Też:** Design systemy i zasady

### ★ L229 · [Jakub Krehel (@jakubkrehel)](https://x.com/jakubkrehel/status/2068715109065613564) · ms 2026-06-21

- **Co pokazuje:** Seria porównań przed/po (×/✓) na białym tle z niebieskimi znacznikami: powiększony obszar trafienia ikony (przerywana ramka), wymiana ikony kopiuj→ptaszek, cyfry tabelaryczne (1006→1019 bez skakania szerokości), text-wrap balance/pretty, przycisk z press-scale, stagger wejścia listy, will-change: transform przeciw drganiu subpikseli, Border vs Shadow, subpixel vs antialiased, wyrównanie geometryczne vs optyczne (24/24 vs 24/20 px przy przycisku ze strzałką), koncentryczne promienie (wewnętrzny 12 + padding 8 = zewnętrzny 20). Na końcu Claude Code stosujący poprawki z tabelami przed/po.
- **Ruch:** Wymiana ikon przez krzyżowe przenikanie ze skalą i lekkim blur (ok. 0,2–0,3 s); press-scale przycisku do ok. 0,96; stagger elementów co kilkadziesiąt ms; liczby zmieniają się bez przesunięcia układu.
- **Dla Tessery:** Gotowa lista reguł do przepisów Tessery: koncentryczny promień (silnik kształtu), optyczny padding przy ikonie (odstępy), tabular-nums w licznikach (typografia), cień zamiast ramki (głębia), press-scale i wymiana ikon przez opacity/scale (ruch), większy hit area (stan/fokus). Skill make-interfaces-feel-better można przeczytać jako checklistę.
- **Domysł:** Skill zbiera dokładnie te detale, które chce mieć zakodowane w silnikach Tessery i dać agentom.
- **Też:** Ikony, Typografia, Karty, Ruch (ogólnie), Wydajność, Design systemy i zasady

### ★ L270 · [Sebastiano Guerriero (@guerriero_se)](https://x.com/guerriero_se/status/2082834598892106121?s=20) · ms 2026-07-30

- **Co pokazuje:** Dwa kwadratowe przyciski ikonowe z cieniem na jasnym tle, oba z ikoną pobierania. Lewy: zamiana ikon (pobieranie → spinner → wypełniony ptaszek, osobne ikony). Prawy: morfing (kreska ikony pobierania przechodzi w łuk spinnera, a ten w ptaszek jedną ciągłą ścieżką).
- **Ruch:** Nagranie spowolnione; lewy przenika ikony ze skalą, prawy rysuje i przekształca jedną linię SVG; cykl ok. 4–5 s w spowolnieniu.
- **Dla Tessery:** Stany ładowania przycisku ikonowego (idle → loading → done); dla Tessery tańsza i zgodna z zasadą ruchu jest zamiana ikon przez opacity/scale; morfing ścieżek tylko jako wyjątek.
- **Domysł:** Porównanie dwóch technik, by wybrać sposób wymiany ikon w Tesserze.
- **Też:** Ikony, Ruch (ogólnie)

### ★ L353 · [R (@wheresryan22)](https://x.com/wherescz/status/2096184499016999199?s=20) · ms 2026-09-05

- **Co pokazuje:** Sekcja „Anatomy” na stronie biblioteki UI: przycisk „Deploy” narysowany w 2,5× jako wireframe na siatce z linijkami, z opisem „każda wartość to token”. Najechanie na wymiar izoluje go: wysokość 32 px, szerokość 104 px, padding 13 px (kreskowane pola), promień 16 px (podświetlone łuki), font 13,5 px; reszta przygasa. W rogu panel „BUTTON / MEDIUM” z wartościami.
- **Ruch:** Wejście: wireframe dorysowuje się i wypełnia; izolacja wymiaru to fade reszty ok. 0,2 s.
- **Dla Tessery:** Gotowy pomysł na stronę dokumentacji Tessery: anatomia każdej kontrolki z tokenami silników (rozmiar, kształt, odstępy, typografia), interaktywna. Pasuje do docs w stylu strony.
- **Domysł:** Fokus na osobnym repo Tessery z dokumentacją; to wzór pokazania tokenów.
- **Też:** Design systemy i zasady, Układ i panele, Typografia

### ★ L420 · [Nexvyn (@nexvyn)](https://x.com/nexvyn/status/2114227957640122619?s=20) · ms 2026-10-25

- **Co pokazuje:** Dwa przyciski „Download” z ikoną: lewy z ikoną 28 px (czerwony X), prawy z block-size: 1cap (zielony check). Suwak font-size 19–44 px: ikona prawego rośnie razem z tekstem, lewego zostaje stała.
- **Ruch:** Zmiana rozmiaru fontu suwakiem; brak animacji UI.
- **Dla Tessery:** Rozmiar ikony = 1cap, ikona skaluje się z tekstem w każdej skali xs–xl. Pasuje do reguły „ikona jak tekst” i silnika rozmiaru.
- **Domysł:** Ma regułę „ikona jak tekst” i jedną skalę rozmiarów.
- **Też:** Ikony, Typografia

### I:tests-2025-07-15-1394673636043919360-0-image.png · obraz `tests-2025-07-15-1394673636043919360-0-image.png`

- **Co pokazuje:** Ciemny wycinek ustawień: nagłówek „Voice” i pod nim zaokrąglony wiersz-wybierak z okrągłym awatarem głosu, nazwą „Burt Reynolds™” i szewronem w prawo.
- **Dla Tessery:** Przepis wiersz/kontrolka: wybór głosu TTS jako pełnoszerokościowy wiersz z awatarem, nazwą i szewronem otwierającym listę zamiast klasycznego selecta; cienka obwódka, ciemna powierzchnia (silniki kształt, kolor).
- **Domysł:** Wzór wyboru głosu TTS dla MangaShift (prawdopodobnie z ElevenLabs).
- **Też:** Listy, Pola

### I:tests-2026-04-06-1490726252343201872-0-image.png · obraz `tests-2026-04-06-1490726252343201872-0-image.png`

- **Co pokazuje:** Strona „Tool System” z narzędziami Claude Code w kolumnach kategorii: małe kolorowe nagłówki wersalikami z licznikiem, pod nimi kafelki-przyciski monospace; niedostępne narzędzia przygaszone z ikoną kłódki.
- **Dla Tessery:** Stan wyłączony jako przygaszenie plus ikona kłódki zamiast osobnego koloru (silnik stan); nagłówek grupy wersalikami z licznikiem pod spodem pasuje do reguły szarych wielkich nagłówków grup.
- **Domysł:** Mapa narzędzi Claude Code; możliwe też zainteresowanie gęstą siatką kafelków.
- **Też:** Typografia, Listy, Układ i panele

### I:tests-2026-07-24-1530303999209898186-0-image.png · obraz `tests-2026-07-24-1530303999209898186-0-image.png`

- **Co pokazuje:** Symulator iPhone'a z jasną aplikacją „Today”: pasek dni tygodnia z wybranym dniem w niebieskim kółku, lista aktywności z okrągłymi kolorowymi ikonami, nastrojem kursywą, czasem, kolorową kropką i menu „…”; pływające okrągłe przyciski na dole.
- **Dla Tessery:** Przepis wiersz: ikona w kolorowym kółku, dwie linie tekstu i strefa końcowa (wartość, kropka statusu, menu przepełnienia); wybór dnia jako wypełnione kółko (przepis wskaźnik); kolor kategorii niesiony przez ikonę i kropkę.
- **Domysł:** Inspiracja aplikacją zbudowaną z AI (kadr z filmu o vibe codingu).
- **Też:** Listy, Ikony, Przełączniki i segmenty

### I:tests-2026-07-24-1530304125072314489-0-image.png · obraz `tests-2026-07-24-1530304125072314489-0-image.png`

- **Co pokazuje:** Kadr z filmu: jasna aplikacja do schowka i historii wklejeń; środek to tekst monospace z kodowymi chipami (branch, ścieżka, hash), po prawej panel „LOCAL LIBRARY / Paste history” ze zwijanymi grupami, licznikami i kartami z tytułem i uciętym podglądem.
- **Dla Tessery:** Mała etykieta sekcji wersalikami nad tytułem panelu; grupa zwijana z licznikiem po prawej (przepis wiersz, drzewo); inline chip kodu z tłem i zaokrągleniem (silniki kształt, typografia); karty z dwulinijkowym uciętym podglądem.
- **Domysł:** Inspiracja wyglądem narzędzia dla devów z filmu, ewentualnie sam workflow agenta.
- **Też:** Listy, Drzewo, Karty, Typografia

### I:tests-2026-09-27-1553814648543772674-0-image.png · obraz `tests-2026-09-27-1553814648543772674-0-image.png`

- **Co pokazuje:** Ciemny landing Starlight (Astro, framework dokumentacji): pole wyszukiwania ze skrótem ⌘K, fioletowa pigułka „Get started” ze strzałką, link „View on GitHub”, siatka kart funkcji z ikonami w kolorowych kwadratach.
- **Dla Tessery:** Kandydat na silnik dokumentacji osobnego repo Tessery; pole wyszukiwania ze skrótem klawiszowym w środku (przepis kontrolka); karty funkcji z ikoną w zabarwionym kafelku (przepis powierzchnia).
- **Domysł:** Szuka narzędzia do dokumentacji Tessery lub MangaShift w stylu strony.
- **Też:** Pola, Karty, Design systemy i zasady, Układ i panele

### L241 · [Syed Subhan](https://amicro.vercel.app/) · ms 2026-07-21

- **Co pokazuje:** Brak plików wizualnych; meta to tekst strony Amicro: ponad 170 komponentów mikrointerakcji React (Motion + Tailwind, instalacja przez shadcn): przyciski ze sprężyną, magnetycznym hoverem, morfującymi ikonami i press feedback, karty 3D, karuzele, ponad 120 loaderów, morfujące kształty, animacje tekstu. Wyglądu nie obejrzano.
- **Dla Tessery:** Katalog do podglądania pojedynczych mikrointerakcji (press feedback, morfing ikon w przycisku); większość efektów (3D, magnetyzm) wykracza poza zasadę transform/opacity i spokojny UI desktopu.
- **Domysł:** Szukał gotowych mikrointerakcji przycisków na tym samym stosie (Motion).
- **Też:** Ruch (ogólnie), Design systemy i zasady

### L248 · [AI Honeycove](https://vm.tiktok.com/ZN8JNuAXJ/) · ms 2026-07-23

- **Co pokazuje:** TikTok z autorem przy biurku i nagraniami ekranu getdesign.md: katalog plików DESIGN.md marek (Apple, Linear, Nike, Coinbase itd.) z tokenami: warianty przycisków pigułkowych (Primary, Secondary, Disabled, na jasnym i ciemnym tle), skala odstępów oparta na 4/8 px, skala promieni od ostrego do pełnej pigułki; przykłady stron wygenerowanych w Lovable/Bolt/V0 w stylu Nike i Apple.
- **Dla Tessery:** Format DESIGN.md (tokeny + opis wariantów w jednym pliku do czytania przez agenta) to wzór, jak dokumentować kontrakt wyglądu Tessery dla agentów; same style marek nieprzydatne.
- **Domysł:** Szukał sposobu na przekazanie agentom spójnego design systemu.
- **Też:** Design systemy i zasady

### L333 · [Best Designs On X (@bestdesignsonx)](https://x.com/bestdesignsonx/status/2091072884034953432?s=20) · ms 2026-08-23

- **Co pokazuje:** Czarne tło, ciemna pigułka „+ Add new”. Na hover wnętrze pigułki wypełnia się płynną, chromowo-tęczową iryzacją (biel, błękit, żółć) z poświatą na zewnątrz. Bez hovera przycisk jest matowy i ciemny.
- **Ruch:** Rozbłysk efektu przy wejściu kursora ok. 0,3 s, fala iryzacji płynie w środku ciągle; po zjechaniu gaśnie ok. 0,3 s.
- **Dla Tessery:** Ewentualny wariant przycisku premium (CTA strony), nie kontrolki aplikacji; efekt jako warstwa z opacity nad stałym tłem, gradient przesuwany transformem.
- **Domysł:** Efektowny przycisk do strony lub głównego CTA.
- **Też:** Kolor, Ruch (ogólnie)

### L373 · [Yates | AI Content](https://vm.tiktok.com/ZN86wX4Hp/) · ms 2026-09-20

- **Co pokazuje:** TikTok: co powiedzieć Claude, żeby strona nie wyglądała na zrobioną z AI. Czerwone X: fioletowy gradient, mglisty tekst hero, fałszywe opinie i liczby, przyciski w kształcie pigułek, ikony emoji, długie myślniki, za dużo animacji przy scrollu, kursor-animacja, tag „made with AI”, obrazy i tekst AI. Zielone: favicon, własna domena, prywatność, regulamin.
- **Dla Tessery:** Lista anty-slopu do recenzji strony; uwaga: „pill shaped buttons” kłóci się z ustaloną regułą Tessery „kontrolki = pigułki”, więc to rozstrzyga właściciel, nie autor filmu.
- **Domysł:** Zbieżne z jego notatką „AI slop” i zakazem długich myślników.
- **Też:** Design systemy i zasady

### L398 · [Maxim Kuznetsov (@disarto_max)](https://x.com/disarto_max/status/2107877823394259362?s=20) · ms 2026-10-11

- **Co pokazuje:** Karta „Knowledge sources” z izometryczną ilustracją bazy wiedzy. Wiersze Docs site / Code repository / Help centre / Meeting notes z przyciskiem Connect; po kliku stan pomarańczowy z paskiem synchronizacji, potem zielone „Connected”, a ze źródła do bazy rysuje się kolorowa linia. Nagłówek „Indexing 1 source” → „Knowledge base is ready”, toast „Docs site connected · 1,284 chunks”, Reset.
- **Ruch:** Linie połączeń dorysowują się, paski postępu rosną, toast wjeżdża od dołu; tempo spokojne, ok. 1–2 s na źródło.
- **Dla Tessery:** Wiersz z trzema stanami akcji (Connect → syncing → Connected) to przepis wiersza przydatny przy modelach do pobrania w MangaShift.
- **Domysł:** Stan łączenia i postępu w wierszu, np. instalacja modeli.
- **Też:** Listy, Karty, Ruch (ogólnie)

## Przełączniki i segmenty

### ★ L216 · [yui540 (@yui540)](https://x.com/yui540/status/2064886835420271004?s=20) · ms 2026-06-11

- **Co pokazuje:** Szare, monochromatyczne zestawienie pięciu przełączników CSS na jasnych kafelkach: przełącznik z gałką-buzią (oczka), duży kwadratowy przełącznik OFF/ON z 3D krawędzią, klasyczny toggle z gałką, suwakowy toggle z kreską i toggle z kropką rosnącą w środku.
- **Ruch:** Gałka z oczkami przy przejściu rozciąga się w pigułkę na całą szerokość toru i kurczy z powrotem do koła po drugiej stronie (squash and stretch, ok. 0,4–0,5 s); kwadratowa gałka przesuwa się z przechyłem; inny wariant najpierw robi pusty obrys, potem wypełnia; w innym kropka rośnie od zera. Bez wyraźnego odbicia za cel.
- **Dla Tessery:** Rozciąganie gałki w kierunku ruchu (scaleX na transform, z dopasowanym origin) to tani, kompozytorowy sposób na 'żywy' toggle i sliding wskaźnik; pasuje do silnika ruchu i przepisu wskaźnika.
- **Domysł:** Szukał charakteru dla przełącznika Tessery, zwłaszcza efektu rozciągania gałki.
- **Też:** Ruch (ogólnie)

### ★ L933 · [diip3sh (@diip3sh)](https://x.com/diip3sh/status/2112576679218696242?s=20) · tests 2026-10-21

- **Co pokazuje:** diip3sh, „Your nested corners are off”. Na czarnym tle czerwona ramka z wymiarami: zewnętrzny promień 20px i wewnętrzny 28px, czyli rogi się nie zgadzają. Po włączeniu przełącznika „rounded-concentric” ramka robi się niebieska, oba promienie mają 20px („One class. Even gap.”). Dalej karta z obrazkiem gór, tekstem i przyciskami Read/Save, gdzie zmiana rounded-[42px] p-[8px] daje automatycznie img rounded-concentric = 33px (także 53/8 → 44, 56/16 → 39) oraz diff „Add it to the child. Leave the parent alone.” i npm i tailwindcss-concentric (zero JS, ok. 3,5 KB, Tailwind v4).
- **Ruch:** Przełącznik przeskakuje, a ramka płynnie zmienia kolor z czerwonego na niebieski i kształt rogu. Karta płynnie zmienia promień i padding, a wewnętrzny obraz dopasowuje się na żywo (klatki co 0,4 s). Przejścia między slajdami przez rozmycie i fade.
- **Dla Tessery:** Prosto do silnika kształtu: promień dziecka = promień rodzica − padding (− border), liczony automatycznie, np. calc() na zmiennych CSS przepisu powierzchni, zamiast ręcznych tokenów. Właściciel już ma regułę „padding optyczny”, a to jej uzupełnienie dla zagnieżdżonych rogów.
- **Domysł:** Koncentryczne promienie: jedna zasada kształtu dla wszystkich zagnieżdżonych powierzchni Tessery.
- **Też:** Układ i panele, Karty, Design systemy i zasady

### I:ms-2025-10-19-1429462109271359528-0-image.png · obraz `ms-2025-10-19-1429462109271359528-0-image.png`

- **Co pokazuje:** Wycinek ciemnego UI miksera głosów TTS („create custom voice combinations”). Rząd kart głosów (Default, Bella, Sarah, Nicole, Sky z emoji i flagą „us”), każda z zielonym kółkiem zaznaczenia (albo pustym przy wyłączonej), polem liczbowym wagi (0,5 / 1 / 0) z przyciskiem resetu ↺ i pionowym suwakiem 0–1. Aktywny suwak ma zielony tor, nieaktywny szary.
- **Dla Tessery:** Pionowy suwak wagi w karcie z polem liczbowym i resetem to gotowy wzór miksera głosów TTS w MangaShift. Uwaga: wypełnienie toru jest tu niespójne (zielone nad gałką, przy wartości 0 cały tor zielony), więc przepis suwaka w Tesserze powinien wypełniać tor od 0 do wartości.
- **Domysł:** Mikser głosów (Kokoro TTS) jako wzór dla panelu TTS w MangaShift.
- **Też:** Suwak, Karty, Pola

## Pola

### ★ L240 · [Florian (@flornkm)](https://x.com/flornkm/status/2079230601224216823) · ms 2026-07-20

- **Co pokazuje:** Biała karta 'Export' (Format: Word (.docx), Page size: A4, czarny przycisk Export) zmieniana uchwytem szerokości. Bez container query pola ściskają się do 'W'/'Word (d...'; z włączonym przełącznikiem 'Container query' przy wąskiej karcie pola układają się jedno pod drugim.
- **Ruch:** Zmiana szerokości przeciąganiem; układ przeskakuje z dwóch kolumn na jedną po przekroczeniu progu, bez animacji.
- **Dla Tessery:** Komponenty Tessery (formularze w panelach, inspektor) powinny reagować na szerokość kontenera (@container), nie okna; do silnika rozmiaru/odstępów jako zasada responsywności paneli.
- **Domysł:** Panele desktopu MangaShift zmieniają szerokość, więc container queries rozwiązują jego problem.
- **Też:** Układ i panele, Karty

### ★ L266 · [dmytro (@pqoqubbw)](https://x.com/pqoqubbw/status/2082123145763344492?s=20) · ms 2026-07-29

- **Co pokazuje:** Jasne tło: pole koloru (próbka + wartość + procent krycia w osobnej pigułce) i pod nim lista formatów (#ff8800, hsl, color(display-p3), oklch, rgb z alfą, transparent). Wklejenie dowolnego formatu jest parsowane i normalizowane, klawisze pokazane na nakładce (⌘V, Enter, Tab, Shift+↑).
- **Ruch:** Brak efektów; szybkie podmiany wartości, zielona kropka potwierdza rozpoznany format.
- **Dla Tessery:** Pole koloru Tessery: jedno wejście tekstowe przyjmujące każdy format CSS (hex, rgb, hsl, oklch, p3), osobna kontrolka krycia ze zmianą strzałkami; dla edytora stylu tekstu MangaShift.
- **Domysł:** Potrzebuje selektora koloru do panelu stylu tekstu; szukał idealnego wzoru.
- **Też:** Kolor

### ★ L393 · \[Flo (@flohoeller)\](https://x.com/flohoeller/status/2108852654957011295?s=20) · ms 2026-10-10

- **Co pokazuje:** Dropzone w wersji jasnej i ciemnej. Przy przeciąganiu pole dostaje niebieski odcień i obramowanie, napis „Release to upload 4 files” i wachlarz ikon plików. Potem lista plików z paskami postępu i „2s left”, błędy na czerwono („Connection lost”, „Too large, max 25 MB”) z retry i x; stopka „Uploading 3 of 4 · 4.7 of 8.1 MB” → „2 of 4 uploaded · Clear”.
- **Ruch:** Wachlarz ikon rozkłada się przy drag-over; wiersze wjeżdżają do listy, usunięty wiersz zwija listę; paski postępu rosną.
- **Dla Tessery:** Bezpośredni wzór importu stron/rozdziałów w MangaShift: stany drop-over, kolejka z postępem, błędy per plik z retry, podsumowanie w stopce. Przepis powierzchni (drop-over) i wiersza (postęp/błąd).
- **Domysł:** Import plików mangi to kluczowy przepływ aplikacji.
- **Też:** Listy, Karty, Ruch (ogólnie)

### L238 · [Mikk Martin 🇪🇪🇺🇦 (@mikkmartin)](https://x.com/mikkmartin/status/2077706511405453754?s=20) · ms 2026-07-16

- **Co pokazuje:** Jasnoszare tło: biała karta 'Notion MCP Connector' ze Skip/Connect nad polem 'Ask anything...'; pod spodem suwak 'Gap' (od −58 do 16 px), checkbox Debug i przycisk Toggle. Przy ujemnym odstępie karta wtapia się w pole jak kropla (efekt gooey/metaball zamiast szkła).
- **Ruch:** Karta zjeżdża w dół i zlewa się z polem z rozmyciem treści, przy powrocie odkleja się; przełączenie Toggle chowa kartę w ok. 0,4–0,7 s płynnie, bez wyraźnego odbicia.
- **Dla Tessery:** Pomysł 'przyklejanej' karty kontekstowej nad polem wpisywania; sam efekt metaball wymaga filtra SVG/blur, więc dla Tessery tylko jako inspiracja, wykonalna wersja: translateY + opacity przy wjeździe karty nad input.
- **Domysł:** Spodobał mu się organiczny efekt łączenia elementów bez Liquid Glass.
- **Też:** Ruch (ogólnie), Karty

### L735 · [Coding2GO](https://youtu.be/44FTAS-qT8Q?si=BBKiZOR3UMNVjGPU) · tests 2025-08-22

- **Co pokazuje:** Coding2GO, 9 minut, „10 CSS PRO Tips”. Arkusz obejmuje pierwsze 3 minuty: border-image z gradientem na obramowaniu przycisku „My Button” (niebiesko-różowy), masonry przez columns: 3 300px, accent-color na checkboxie, radio, suwaku i inpucie (z niebieskiego na czerwony) oraz inset. Z rozdziałów meta wynika dalej: overflow auto zamiast scroll, filter: drop-shadow dla ikon z przezroczystością, animacja do height:auto (grid-template-rows 0fr→1fr albo interpolate-size/calc-size), clip-path i attr() w pseudo-elementach.
- **Ruch:** W rozdziale 7 (04:47) rozwijanie dropdownu do wysokości auto przez przejście grid-template-rows 0fr→1fr. Tego fragmentu nie ma w arkuszu; opis pochodzi z napisów.
- **Dla Tessery:** accent-color pozwala jednym tokenem silnika koloru zabarwić natywne kontrolki. filter: drop-shadow nadaje się do cieni ikon w silniku głębi. Uwaga: przejście 0fr→1fr animuje layout, więc przy regule „tylko transform/opacity” zwijanie sekcji trzeba robić inaczej (np. scaleY plus clip) albo jawnie dopuścić wyjątek.
- **Domysł:** Zbiór nowoczesnych sztuczek CSS do własnych kontrolek.
- **Też:** Inne

## Listy

### ★ L242 · [bakai (@samakov0)](https://x.com/samakov0/status/2079589575274774911?s=20) · ms 2026-07-21

- **Co pokazuje:** Jasny sidebar w stylu Vercel/Linear: sekcje (Playground, Embeddings, Enrichments; Data: Datasets, Sources, Webhooks; Projects: Production z drzewem Endpoints/API keys/Logs; Developer: Usage, SDKs, Rate limits), szare tło hover/aktywne, breadcrumb po prawej.
- **Ruch:** Każda ikona ma własną mikroanimację na hover: np. stos dysków Datasets rozdziela się na dwa stosy (ok. 0,3–0,4 s), wykres Usage rośnie, ikony drgają lub obracają się; tło wiersza zanika płynnie ok. 150 ms.
- **Dla Tessery:** Animacja ikony na hover wiersza (transform w obrębie ikony, ok. 300 ms) jako opcjonalna warstwa przepisu wiersza; tło hover z fade jak w Tesserze; drzewo z linią wcięcia jak w panelu warstw.
- **Domysł:** Wzór żywego sidebara/drzewa dla MangaShift.
- **Też:** Ikony, Drzewo, Ruch (ogólnie)

### ★ L348 · [Inspora (@insporadesign)](https://x.com/insporadesign/status/2094766257690005998?s=20) · ms 2026-09-01

- **Co pokazuje:** Jasna karta „Sandbox node26” ze statusem (Booting / Running / Done, zielona kropka) i cienkim zielonym paskiem postępu pod nagłówkiem. Lista kroków (Allocate microVM, Restore snapshot, Mount FS, Boot runtime, Execute main.js, Reclaim): aktywny ma jasnozielone tło i spinner, gotowe zielony check i czas w ms. Pod listą rozwija się mini-terminal z logiem, w stopce „Exited 0 · 2300ms” i czarny przycisk „Re-run (warm)”; drugi bieg ma badge „cached”.
- **Ruch:** Wskaźnik aktywnego kroku schodzi wiersz po wierszu ok. 0,3–0,4 s na krok; pasek postępu rośnie; terminal rozwija się wysokością.
- **Dla Tessery:** Gotowy wzór widoku postępu kroków pipeline'u MangaShift (detekcja → OCR → tłumaczenie…): wiersz z ikoną stanu, czasem i badge „cached”. Przepis wiersza i wskaźnika (aktywny wiersz jako przesuwane tło).
- **Domysł:** Przypomina postęp pipeline'u i ponowne uruchomienie z cache.
- **Też:** Karty, Ruch (ogólnie)

### I:ms-2026-06-03-1511680358582845601-0-image.png · obraz `ms-2026-06-03-1511680358582845601-0-image.png`

- **Co pokazuje:** Obok siebie Adobe Photoshop 2021 i Unreal Engine 5: gęste profesjonalne interfejsy z dokowanymi panelami (warstwy, właściwości, outliner, content browser, pasek narzędzi).
- **Dla Tessery:** Gęstość profesjonalnego edytora: dokowane panele z małymi nagłówkami, outliner jako drzewo z kolumną typu, panel szczegółów z sekcjami do zwijania i polami liczbowymi X/Y/Z. Wzór dla silników rozmiaru i odstępów (gęste kontenery przy stałych kontrolkach) oraz przepisu wiersza.
- **Domysł:** Punkt odniesienia dla układu desktopowego edytora MangaShift (narzędzie klasy pro, nie strona www).
- **Też:** Układ i panele, Drzewo, Design systemy i zasady

### L381 · [Alvish 🧙‍♂️ (@alvish)](https://x.com/alvishbaldha/status/2105538797970809133?s=20) · ms 2026-10-01

- **Co pokazuje:** Jasna tabela „Deals” w panelu kontekstowym czatu, grupy (Proposal, Demo, Leads, Closed Won) z kolorowymi kropkami. Panel poszerzany uchwytem: przy progu kwota odkleja się od nazwy do własnej kolumny, data oddziela się od właściciela; długie nazwy się obcinają. Autor: „magnetycznie, snap bez bounce, szanuje reduced motion”.
- **Ruch:** Przy zbliżaniu do progu kwota „ciągnie się” w stronę kolumny, potem przeskakuje; zwężanie jest lustrzane; ikony kolumn wjeżdżają od strony, skąd przyszły dane; snap bez sprężyny.
- **Dla Tessery:** Responsywny wiersz listy, który przy szerokości panelu rozkłada się na kolumny z animacją FLIP (transform). Przepis wiersza; ważne zdanie „snap, bez bounce” dla zmian układu.
- **Domysł:** Panele w edytorze mają zmienną szerokość; chce, by lista sama się dopasowała.
- **Też:** Układ i panele, Ruch (ogólnie)

### L759 · [Coding2GO](https://www.youtube.com/watch?v=Jo8ABAJtMM0) · tests 2025-09-07

- **Co pokazuje:** Coding2GO, tutorial IntersectionObserver. Kod w VS Code obok podglądu strony (galeria zdjęć, FAQ) i diagram root/target z przerywanymi ramkami. Pokazuje entries, isIntersecting i classList.add('show'). Wśród przykładów są lista zadań (todo) z animowanym wejściem i karuzela.
- **Ruch:** Elementy (sekcje, zdjęcia, wiersze listy) pojawiają się przy wejściu w viewport: opacity 0→1 i przesunięcie x:-50 → 0 (widać fragment kodu opacity:0, x:-50, duration:1). Arkusz co 5 s nie pokazuje krzywej.
- **Dla Tessery:** IntersectionObserver jako tani mechanizm dla wirtualizacji i lazy-load długich list (setki stron mangi) w przepisie wiersza i scrolla. Animacji wejścia przy przewijaniu nie bierzemy, bo reguła właściciela to zero animacji wejścia poza dialogiem.
- **Domysł:** Wydajność długich list i animacje przy przewijaniu.
- **Też:** Przewijanie, Ruch (ogólnie)

## Karty

### L788 · [Huy Ngô](https://vm.tiktok.com/ZNdpmVHcd/) · tests 2025-09-20

- **Co pokazuje:** Huy Ngô pokazuje glass3d.dev, generator efektu „liquid glass”: półprzezroczysty, ciemny panel ze szkłem nad tłem (czerwona ryba koi, potem kwiaty wiśni) z trybami Dark/Video/Light, sekcjami backdrop-filter (blur, brightness, saturation), color i texture (rice paper, egg shell, ink jet, coarse, topology) oraz kodem CSS z wielowarstwowym box-shadow i przyciskiem Copy CSS.
- **Ruch:** Zmiany suwaków na żywo zmieniają rozmycie i jasność szkła. Animacji UI brak.
- **Dla Tessery:** Dla silnika głębi wzór szkła: backdrop-filter blur + brightness + saturation, ziarno z tekstury i wielowarstwowy cień hsl. Uwaga: backdrop-filter jest kosztowny (WYDAJNOŚĆ > piksel), więc najwyżej dla jednej powierzchni typu popover, nie dla list.
- **Domysł:** Efekt liquid glass (moda po Apple) jako możliwy styl powierzchni.
- **Też:** Kolor

### L802 · [DevFlash](https://vm.tiktok.com/ZNdsEAVCM/) · tests 2025-09-27

- **Co pokazuje:** DevFlash „FlipBounce Cards”: dwie karty ze zdjęciami (Horizontal Flip z torami w lesie, Vertical Flip z czaplą) na beżowym tle. Po kliknięciu karta obraca się w 3D i pokazuje ciemny rewers z tytułem (Sendero de Hierro, Vigilante del Río) i opisem. CSS: perspective 1200px, transform-style: preserve-3d, border-radius 12px, cień.
- **Ruch:** Zbliżenie 30 fps: obrót rotateY trwa ok. 0,3 s (karta na krawędzi po ok. 0,2 s), potem 0,15–0,2 s dociągania z lekkim przechyłem za pozycję końcową i powrotem, czyli mały overshoot. Pionowy flip (rotateX) działa tak samo, z wyraźną perspektywą trapezu.
- **Dla Tessery:** Krzywa „szybki obrót + mały overshoot przy lądowaniu” to ten sam charakter co lekki bounce slidingu. Dobre odniesienie do strojenia sprężyny w silniku ruchu (transform-only). Samego flipa kart Tessera nie potrzebuje.
- **Domysł:** Przyjemne odbicie przy obrocie: wzorzec sprężystości ruchu.
- **Też:** Ruch (ogólnie)

## Układ i panele

### ★ L262 · [Derek Briggs (@PixelJanitor)](https://x.com/PixelJanitor/status/2082151940478398497?s=20) · ms 2026-07-29

- **Co pokazuje:** Okno macOS na fioletowym tle z jasnym sidebarem bez treści: autor przeciąga krawędź sidebara; szerokość ma minimum i maksimum, przycisk w pasku tytułu chowa sidebar całkowicie.
- **Ruch:** Za granicą max/min sidebar rośnie wolniej niż kursor (opór gumki), a po puszczeniu wraca sprężyście do granicy w ok. 0,2–0,3 s; zwijanie i rozwijanie przyciskiem płynne, ok. 0,3 s.
- **Dla Tessery:** Opór gumki za granicą min/max i sprężysty powrót przy zmianie szerokości paneli MangaShift; do silnika ruchu jako zachowanie uchwytu zmiany rozmiaru (animacja transform/clip, nie width w każdej klatce, jeśli to możliwe).
- **Domysł:** Panele desktopu MangaShift są zmienne; chciał 'żywego' resize.
- **Też:** Ruch (ogólnie)

### ★ L337 · [gsimone (@ggsimm)](https://x.com/ggsimm/status/2092250921644261395?s=20) · ms 2026-08-26

- **Co pokazuje:** Wzór Steve'a Ruiza na koncentryczny promień: dwa zagnieżdżone zaokrąglone prostokąty (zewnętrzny szary, wewnętrzny niebieski) z kołami pomocniczymi promieni. Zmiana paddingu p i zewnętrznego promienia R przelicza na żywo wewnętrzny r = R − p; gdy wynik spada do zera, róg staje się ostry.
- **Ruch:** Animowana zmiana R i p pokazuje przeliczanie promienia; demonstracja, nie ruch UI.
- **Dla Tessery:** Reguła silnika kształtu: promień dziecka = promień rodzica − odstęp, z dolnym limitem 0. Do wpisania w tokeny i przepis powierzchni (wyspy, wiersze w menu, wskaźnik w segmented).
- **Domysł:** Ma regułę „padding optyczny: baza + 1/4 promienia” i chce matematycznie zgranych zagnieżdżonych zaokrągleń.
- **Też:** Design systemy i zasady

### ★ L402 · [Michael · Design Partner (@MichaelFilipi](https://x.com/MichaelFilipiuk/status/2111383736243859714?s=20) · ms 2026-10-17

- **Co pokazuje:** Wireframe dashboardu (sidebar, 4 karty KPI, wykres słupkowy, lista) z kolorowymi nakładkami odstępów: szerokość sidebara 184 → 248, padding 20 → 40, odstęp rzędów 20 → 48, kolumn 20 → 12, kart 12 → 24, z chipami liczb na dole. Na końcu powrót do ciasnego układu, czyli porównanie przed i po. Teza: gdy aplikacja „wygląda nie tak”, winne są odstępy.
- **Ruch:** Układ płynnie rośnie i kurczy się przy zmianie wartości; demonstracja.
- **Dla Tessery:** Silnik odstępów: osobne tokeny dla paddingu kontenera, odstępu rzędów, kolumn i kart, z większym oddechem między sekcjami niż w środku. Dobra kontrola do galerii (nakładka odstępów).
- **Domysł:** Ma regułę „gęstość = kontenery, kontrolki stałe”; to potwierdzenie.
- **Też:** Design systemy i zasady

### ★ L890 · [link](https://www.skills.sh/jakubkrehel/skills/better-ui) · tests 2026-09-14

- **Co pokazuje:** Brak obrazu; opis z meta (strona skills.sh). Skill better-ui (jakubkrehel) to dokładne wartości dopracowania powierzchni, ikon i ruchu: konkretne krzywe (cubic-bezier(0.2, 0, 0, 1)), skala przyciśnięcia 0.96, zasada „zewnętrzny promień = wewnętrzny + padding + border” (do paddingu 24px) i optyczne wyrównanie (np. 2px mniej paddingu po stronie ikony, przesunięcie trójkąta play).
- **Ruch:** Skill ustala dokładne krzywe i skale ruchu (np. cubic-bezier(0.2,0,0,1), scale 0.96 przy wciśnięciu). Sama strona nie ma animacji.
- **Dla Tessery:** Bezpośrednio dla silników kształtu i ruchu: promień koncentryczny dla zagnieżdżonych powierzchni, scale 0.96 dla stanu wciśnięcia w przepisie kontrolki, jedna krzywa ease-out. Skill jest już w środowisku (better-ui). Kontrakt wyglądu właściciela ma pierwszeństwo przed liczbami ze skilla.
- **Domysł:** Źródło dokładnych wartości polerki UI dla Tessery.
- **Też:** Design systemy i zasady, Ruch (ogólnie), Ikony

### L208 · [CyberTimon](https://github.com/CyberTimon/RapidRAW) · ms 2026-06-06

- **Co pokazuje:** Brak obrazu lokalnie; meta to README RapidRAW: edytor RAW na Tauri + React + Rust/WGSL, alternatywa Lightrooma (biblioteka zdjęć, panel regulacji, maski AI, porównanie przed/po, kolejka zadań). Zrzutu edytora nie obejrzano.
- **Dla Tessery:** Ten sam stos co MangaShift (Tauri + React); warto podejrzeć układ edytora (biblioteka, płótno, panel regulacji z przełącznikami widoczności) i podejście do wydajności przy dużych obrazach.
- **Domysł:** Wzór desktopowego edytora graficznego na tym samym stosie, z ładnym UI.
- **Też:** Wydajność

### L359 · [Michael Nowak (@mnowakdesign)](https://x.com/mnowakdesign/status/2098789521429319951?s=20) · ms 2026-09-13

- **Co pokazuje:** Ciemny film w stylu rysunku konstrukcyjnego: linie pomocnicze, kąty 167,7° i 173,2°, budowanie zaokrąglonego rogu (squircle). Z punktu wyrasta niebieska ikona aplikacji, potem ciemna ikona przycisku panelu z wymiarami 28,0 / 31,7 / 12,2, wreszcie sidebar „Cadence” (VIEWS: Overview, Explore, My rituals z gradientowym badge New), tekst wpisywany z kursorem.
- **Ruch:** Kamera sunie po skosie nad siatką, elementy rosną z punktu, tekst się dopisuje; ok. 19 s, na końcu logo.
- **Dla Tessery:** Wizualny język „konstrukcji” do strony dokumentacji Tessery (squircle, wymiary na liniach). Dla silnika kształtu: rogi o ciągłej krzywiźnie zamiast zwykłego border-radius to temat do rozważenia.
- **Domysł:** Teza „szczegóły pokazują staranność” plus estetyka blueprintu.
- **Też:** Design systemy i zasady, Ikony

### L406 · [Recent (@recentdesign)](https://x.com/recentdesign/status/2111763882507149567?s=20) · ms 2026-10-18

- **Co pokazuje:** Ten sam film co L402 (inny plik, identyczna treść arkusza): wireframe dashboardu z kolorowymi nakładkami odstępów i porównaniem przed/po, tu podpisany jako „Spacing Tips” Michaela Filipiuka.
- **Ruch:** Jak w L402.
- **Dla Tessery:** Duplikat L402; brać stamtąd.
- **Domysł:** Zapisany drugi raz z innego konta.
- **Też:** Design systemy i zasady

### L407 · [Amichai Mantinband (@amihai)](https://x.com/amihai/status/2111688920304083295?s=20) · ms 2026-10-18

- **Co pokazuje:** Aplikacja canvasowa w stylu Figmy (lista warstw po lewej, panel właściwości po prawej, pasek narzędzi na dole) z siatką setek tysięcy prostokątnych ramek. Płynny zoom od szarej masy do pojedynczych ramek i przesuwanie, „250K+ elementów, prędkość 1×, w przeglądarce”.
- **Ruch:** Zoom i pan bez zacięć w czasie rzeczywistym.
- **Dla Tessery:** Dowód, że płótno z dużą liczbą obiektów działa w przeglądarce; ważne dla edytora MangaShift, nie dla kitu. Dla Tessery: panele wokół płótna nie mogą obciążać głównego wątku.
- **Domysł:** Wydajność edytora (100–250 rozdziałów × 50–100 stron).
- **Też:** Wydajność

## Typografia

### L937 · [Nyx (@fopgirl67)](https://x.com/fopgirl67/status/2116384029822050690) · czat 2026-11-01

- **Co pokazuje:** Cytat ogłoszenia Vercela „Introducing Geist Serif” (szeryfowa siostra Geist Sans/Mono). Autorka chwali krój, ale dopisuje, że wydana jest tylko waga Regular — reszta (Thin…Ultra Black) „Soon” (zrzut menu wag). W odpowiedziach: zarzut wtórności wobec Klim Signifier, spór „szeryfy w UI”, uwaga, że pokaz kroju bez `1 L l I | i 0 O` obok siebie jest bezużyteczny; ktoś: Geist Sans najbliżej SF Pro w UI.
- **Dla Tessery:** Kandydat na krój display/nagłówków strony (runda H, obok K1 Bricolage, K2 Sora, K3 Inter Display), nie na UI aplikacji (tam Inter). Warunki przed wyborem: komplet wag, licencja (Geist jest na OFL — sprawdzić dla Serif), polskie znaki (`latin-ext`), dostępność jako `@fontsource`, test rozróżnialności `1 L l I | i 0 O` i rozmiar pliku. Do porównania na prawdziwej stronie, nie w izolacji.
- **Też:** Kolor (marka strony)

### ★ L261 · [jakubkrehel](https://github.com/jakubkrehel/skills) · ms 2026-07-28

- **Co pokazuje:** Brak plików; meta to README repozytorium jakubkrehel/skills: skille agentów better-interface, better-ui (promienie, wyrównanie optyczne, cienie, stany ikon, animacje), better-typography, better-colors, better-accessibility i inne, wszystkie pod marką Interfaces.
- **Dla Tessery:** Gotowe reguły do przeniesienia w kontrakt wyglądu Tessery (część skilli już jest lokalnie, np. better-ui); źródło wartości dla silników kształtu, głębi i ruchu.
- **Domysł:** Chce dać agentom gust w formie skilli (por. L229, L321).
- **Też:** Design systemy i zasady, Ruch (ogólnie), Kolor

### ★ L318 · [Emil Kowalski (@emilkowalski)](https://x.com/emilkowalski/status/2089372767934115883?s=20) · ms 2026-08-19

- **Co pokazuje:** Trzy ciemne grafiki w stylu 'markdown': monospace na prawie czarnym tle, przerywane ramki z narożnikami '+', tytuły w nawiasach na niebiesko: NESTED RADII (outer 16 px, inset 4 px, inner 12 px; inner = outer − inset), tabela kosztów researchu agentów (tokeny, wywołania, czas), schemat 'AI is an amplifier' z niebieskimi słupkami.
- **Dla Tessery:** Reguła koncentrycznego promienia (inner = outer − inset) do silnika kształtu; styl diagramów monospace z jednym akcentem do dokumentacji Tessery.
- **Domysł:** Podobał mu się styl grafik i zasada promieni zagnieżdżonych.
- **Też:** Kolor, Design systemy i zasady

### ★ L321 · [link](https://emilkowal.ski/ui/agents-with-taste) · ms 2026-08-19

- **Co pokazuje:** Brak plików; artykuł 'Agents with Taste': przelewanie gustu w skille dla agentów; tabela praktycznych porad (press scale(0.97), start od scale(0.95) zamiast 0, will-change: transform, transform-origin od wyzwalacza, kolejne tooltipy bez opóźnienia, 44 px hit area, subtelny blur \<20 px), schemat wyboru easingu (wejście/wyjście ease-out, ruch na ekranie ease-in-out, hover ease, stały ruch linear), czasy (mikro 100–150 ms, tooltipy/dropdowny 150–250 ms, modale 200–300 ms, wyjście ok. 20% szybciej), reguły typografii (65ch, tabular-nums, …).
- **Dla Tessery:** Gotowa tabela tokenów do silnika ruchu (czasy, easing, origin) i reguły typografii; format 'reguły w skillu' zgodny z kontraktem wyglądu Tessery.
- **Domysł:** Wzór, jak zapisać gust Tessery dla agentów.
- **Też:** Ruch (ogólnie), Design systemy i zasady

### L110 · [orcdev](https://vm.tiktok.com/ZGdaTuEXn/) · ms 2025-12-05

- **Co pokazuje:** TikTok z twarzą autora i nagraniami ekranu na tęczowym gradiencie: trzy biblioteki animacji React: Animate UI (Morphing Text, Rolling Text, Rotating Text), Aceternity UI (karty z efektami) i React Bits (bąble, ASCII, tła).
- **Ruch:** Pokazy tekstu morfującego litera po literze i przewijanego jak licznik, efekty hover kart; z arkusza widać tylko stany pośrednie, bez precyzyjnych czasów.
- **Dla Tessery:** Animate UI jest zbudowane na tym samym stosie (Motion + shadcn/Radix/Base) i można tam podejrzeć implementację rolling/morphing text; reszta to efekciarstwo marketingowe, które łamie zasadę 'ruch tylko transform/opacity'.
- **Domysł:** Szukał gotowych bibliotek ruchu dla Reacta przy budowie Tessery.
- **Też:** Ruch (ogólnie), Design systemy i zasady

### L246 · [rystal](https://vm.tiktok.com/ZN8J871CT/) · ms 2026-07-23

- **Co pokazuje:** Film (ok. 3 min) o animacjach tekstu w stylu Apple: plansze 'Bad text animation' vs dobre, potem DaVinci Resolve z wtyczką TypeFlow; zdania 'Landing is how the text stops', 'Distance is how far the text moves', 'It's bouncing less' na fioletowo-granatowym gradiencie.
- **Ruch:** Słowa wchodzą po kolei, każde z małym przesunięciem w górę i fade, lądują miękko bez odbicia; złe przykłady mają duży dystans i sprężyste przestrzelenie.
- **Dla Tessery:** Dla ruchu Tessery: mały dystans (kilka px) i miękkie lądowanie bez overshootu przy pojawianiu się tekstu/treści; bounce zostawić tylko wskaźnikom.
- **Domysł:** Chciał zrozumieć, dlaczego animacje Apple wyglądają drogo, do strony i UI.
- **Też:** Ruch (ogólnie)

### L679 · [orcdev](https://vm.tiktok.com/ZNHgF4gMxbN6v-sPKKP/) · tests 2025-07-11

- **Co pokazuje:** orcdev omawia blog Tailwind CSS v4.1: utilities text-shadow-2xs…lg na fioletowo-różowym gradiencie z przykładowym zdaniem oraz utilities mask-\* (mask-r-from-30%, mask-l-from-50% mask-l-to-90%, mask-b-from-20%) na zdjęciu góry, które wygaszają krawędzie obrazu.
- **Dla Tessery:** mask-\* z Tailwind 4.1 pozwala wygaszać krawędzie przewijanych list i pasków (fade na brzegach scrolla) bez dodatkowych warstw. To kandydat dla powierzchni lub scrolla. text-shadow przyda się co najwyżej przy neonie.
- **Domysł:** Nowości Tailwind, na którym stoi Tessera.
- **Też:** Inne

## Kolor

### I:tests-2025-03-16-1350864463774879825-0-linia-ruchomy-obrazek-0379_1.gif · obraz `tests-2025-03-16-1350864463774879825-0-linia-ruchomy-obrazek-0379_1.gif`

- **Co pokazuje:** Animowany GIF 565x4 px (11 klatek po 60 ms): cienka czarna linia z fioletowymi rozmytymi punktami światła; widoczna tylko pierwsza klatka, ruch świateł wzdłuż linii wnioskowany z nazwy i liczby klatek.
- **Ruch:** Prawdopodobnie fioletowe poświaty przesuwają się wzdłuż linii w krótkiej pętli (nie obejrzano kolejnych klatek).
- **Dla Tessery:** Pomysł na separator albo wskaźnik postępu nieokreślonego z wędrującą poświatą w kolorze akcentu: silnik ruchu + przepis wskaźnik; realizować przesunięciem gradientu przez transform/opacity (tylko kompozytor), nie przez animowany background-position ani GIF.
- **Domysł:** Ozdobna linia-separator (np. na stronę albo Discord) w klimacie neonowej poświaty; do potwierdzenia, czy chodziło o ruch.
- **Też:** Ruch (ogólnie)

### L655 · [viantvivaldy (@viantvivaldy)](https://vm.tiktok.com/ZNHb3xFkVy25k-RSqxq/) · tests 2025-07-08

- **Co pokazuje:** Karuzela 5 plansz „gradient color pallete” (@viantvivaldy). Na każdej 4 pionowe pasy z gradientami i kodami hex na tle w kolorze motywu: róż-koral-fiolet (#FCCBF0, #FF5A57, #E02F75, #6700A3, #050C38), lawenda-niebieski (#977DFF, #0033FF, #00033D), róż-magenta-fiolet (#FFE5F1, #F042FF, #7226FF, #010030), zielenie (#F2E0DF, #034C36, #003332) i pomarańcze (#FFEAF0, #F09410, #BC4300, #241705).
- **Dla Tessery:** Gotowe 4-5-stopniowe rampy od jasnego tinta do prawie czarnego tła w jednym odcieniu. Pomocne w silniku koloru przy budowie nazwanych palet akcentu (tło, powierzchnia, akcent, tint) dla trybu ciemnego.
- **Domysł:** Inspiracja kolorystyczna do palet akcentu i neonu (fiolet/magenta pasuje do marki).

## Ikony

### ★ L936 · [Haz (@diegohaz)](https://x.com/diegohaz/status/2116622805710074220) · czat 2026-11-01

- **Co pokazuje:** Ariakit „design tip” (wideo 1:12): ikona strzałki linku zewnętrznego po ostatnim słowie linku, która przy łamaniu wiersza nigdy nie zostaje sama w nowej linii. Kolejne próby: `white-space: nowrap` na całym linku (łamie układ), word joiner `&#x2060;` (sam nie wystarcza), `<span class="nowrap">` ze słowem i ikoną (działa, ale dodatkowy markup i niewidoczny znak w nazwie dostępnej). Wersja końcowa tylko w CSS: `a[target="_blank"]::after { content: "\2060" / ""; padding-inline-start: 1em; background: currentColor; mask: var(--arrow) 0 0 / 100% 100%; }` — znak WJ skleja ikonę z ostatnim słowem, ikona malowana na paddingu przez `mask`, alternatywny tekst `/ ""` trzyma znak poza nazwą dostępną.
- **Dla Tessery:** Wzór dla linku w stylu tekstu i przycisku-linku (runda A, `Button link` / `href`) oraz każdego „tekst + ikona na końcu” (`iconEnd`, Badge, link w Alert): ikona nie odrywa się od słowa w wąskim kontenerze (skrajność 320 px). Kolor z `currentColor`, rozmiar w `em`. Uwaga: Tessera nie używa `::after` w przepisach do stanu (N8), więc ikonę końca linku robić tylko jeśli przepis linku powstanie; zgodność z ikonami lucide (maska z SVG ikony albo slot ikony + WJ).
- **Też:** Przycisk, Typografia, Pola

### L307 · [Misha (@mishanaer)](https://x.com/mishanaer/status/2087035200047853744?s=20) · ms 2026-08-11

- **Co pokazuje:** Szara ikonka w zaokrąglonym białym kwadracie: rysunkowa postać kreską (twarz z dużymi oczami i nosem) czytająca otwartą książkę; animacja SVG wygenerowana przez model Sol 5.6.
- **Ruch:** Subtelna pętla: oczy przesuwają się i mrugają, kreski lekko drgają jak rysowane odręcznie; ok. 27 s nagrania, ruch drobny.
- **Dla Tessery:** Pomysł na animowaną ikonę/maskotkę 'czytelnika' (pasuje do mangi) w stanach pustych lub ładowania; SVG z transformami jest tanie.
- **Domysł:** Postać czytająca książkę kojarzy się z MangaShift; możliwy wzór animowanej maskotki.
- **Też:** Ruch (ogólnie)

### L325 · [Guillermolg Com](https://www.morphicons.com/) · ms 2026-08-19

- **Co pokazuje:** Strona biblioteki morphicons (tylko tekst strony, brak nagrania). Komponent MorphIcon morfuje dowolną ikonę SVG w inną (Lucide, Tabler, Heroicons), także obrys w wypełnienie, sprężyną, bez konfiguracji. 10 KB, zero zależności, jeden wspólny rAF dla wszystkich ikon na ekranie.
- **Ruch:** Według opisu: sprężynowe morfowanie ścieżek SVG z obrotem, skalą i przesunięciem liczonym w formie zamkniętej. Brak nagrania do oceny czasu.
- **Dla Tessery:** Kandydat na zamianę ikon stanu (menu↔x, play↔pause) w silniku ruchu; uwaga: morfowanie atrybutu d nie jest transform/opacity, więc łamie regułę „tylko kompozytor” i wymaga zgody właściciela.
- **Domysł:** Szukał płynnej zmiany ikon przy przełączaniu stanów przycisków.
- **Też:** Ruch (ogólnie)

### L637 · [Nuuvie Studio](https://vm.tiktok.com/ZNHb4L4MHMTHW-HRZgi/) · tests 2025-07-05

- **Co pokazuje:** Mówiący do kamery autor (Nuuvie Studio) przedstawia 5 darmowych bibliotek ikon: Feather (Customize: rozmiar 28px, stroke 1,5px, currentColor), Lucide (ciemna siatka ok. 1600 ikon), Phosphor (9072 ikon, menu wag Thin/Light/Regular/Bold/Duotone), Tabler (5944 ikon) i Google Material Symbols (filtry, wypełnienie).
- **Dla Tessery:** Potwierdza wybór biblioteki liniowej z regulowanym stroke. Phosphor ma wagi Thin–Duotone, co pasuje do silnika rozmiaru i stanu: waga ikony może iść za stanem, np. Regular w spoczynku i Fill w stanie aktywnym. Grubość linii (np. 1,5px) warto ustalić jako token.
- **Domysł:** Wybór biblioteki ikon dla Tessery i MangaShift.

## Ruch (ogólnie)

### ★ L323 · [link](https://emilkowal.ski/ui/train-your-judgement) · ms 2026-08-19

- **Co pokazuje:** Artykuł Emila Kowalskiego (bez plików wideo, tylko tekst strony). Ćwiczenia parami: dwie animacje obok siebie, wybierasz lepszą, zapisujesz dlaczego, potem czytasz jego rozbiór. Teza: AI pisze ruch, który działa, ale jest przeciętny; trzeba umieć nazwać, co jest źle.
- **Dla Tessery:** Metoda do galerii Tessery: przy każdym przepisie ruchu pokazać parę „dobrze / źle” z krótkim uzasadnieniem (krzywa, czas, origin), żeby właściciel oceniał ruch, a nie kod. Dotyczy silnika ruchu.
- **Domysł:** Właściciel sam ocenia ruch na nagraniach i chce mieć słownik do nazywania, co mu nie pasuje.

### L279 · [Karol Stefański 🤘 Design tech](https://vm.tiktok.com/ZN8dRGKHE/) · ms 2026-08-02

- **Co pokazuje:** Polski TikTok o Figma Motion: oś czasu i keyframe'y w Figmie, krzywe easing (presety, custom bezier, spring), 'Motion tokens' (np. Brand Linear, Playful, Snappy), animowanie pozycji, skali, obrotu, krycia, rozmiaru, shadery.
- **Ruch:** Pokazy animacji gwiazdy (obrót, kolor, ruch) i przycisków; szczegóły czasów nieczytelne.
- **Dla Tessery:** Pojęcie 'motion tokens' (nazwane zestawy easing/czasu) pokrywa się z silnikiem ruchu Tessery; warto nazwać tokeny ruchu podobnie (np. snappy, playful).
- **Domysł:** Narzędzie do projektowania ruchu przed kodem.
- **Też:** Design systemy i zasady

### L319 · [link](https://emilkowal.ski/) · ms 2026-08-19

- **Co pokazuje:** Brak plików; meta to strona Emila Kowalskiego (design engineer, wcześniej Linear i Vercel): projekty Sonner (toasty), Vaul (drawer), animations.dev, aiforui.dev; artykuły o animacjach, guście i agentach.
- **Dla Tessery:** Źródło: Sonner jako wzór toastów, artykuły L320–L322 jako zasady silnika ruchu.
- **Domysł:** Autor najbliższy jego podejściu do ruchu i agentów.
- **Też:** Design systemy i zasady

### L814 · [SetupsAI](https://vm.tiktok.com/ZNdt7uXT6/) · tests 2025-10-06

- **Co pokazuje:** Film SetupsAI (część 520) pokazuje animejs.com (Anime.js v4, „All-in-one animation engine”): ciemną dokumentację z sekcjami Timeline, Timer, Getters, frameRate, delay, splitText (Split and wrap text), Time stagger i Scroll Observer. Każda sekcja ma żywy podgląd na żółtych lub turkusowych kartach z suwakami. Jest też „Default spring easing configurator” z wykresem krzywej z wyraźnym overshootem i suwakami parametrów.
- **Ruch:** Konfigurator sprężyny: krzywa wyskakuje ponad 1 i wraca (overshoot i tłumienie), a żółty kwadrat w podglądzie przesuwa się z odbiciem. Demo stagger: elementy ruszają z przesunięciem w czasie. Hero to obracające się pierścienie i wypełniająca się czerwona fala.
- **Dla Tessery:** Konfigurator sprężyny (parametry bounce i duration z wykresem krzywej) to dobry wzór na strojenie lekkiego bounce slidingu w silniku ruchu i na pokazanie krzywej w galerii Tessery. Anime.js v4 animuje też przez WAAPI (transform/opacity), co pasuje do reguły ruchu.
- **Domysł:** Silnik animacji ze sprężynami i staggerem jako kandydat albo wzór dla ruchu Tessery.
- **Też:** Design systemy i zasady

### L891 · [link](https://www.skills.sh/emilkowalski/skills/emil-design-eng) · tests 2026-09-14

- **Co pokazuje:** Brak obrazu; opis z meta (strona skills.sh). Skill emil-design-eng to filozofia Emila Kowalskiego (Sonner, Vaul): „taste is trained”, budowanie interfejsów, które „feel right”, analizowanie i odtwarzanie cudzych animacji. Meta zawiera tylko wstęp skilla, bez konkretnych reguł.
- **Dla Tessery:** Kierunek, nie wartości: ruch ma być krótki, celowy i przerywalny. Pasuje do zasad silnika ruchu (transform/opacity, interruptible), ale konkretnych liczb z meta brak, więc trzeba przeczytać pełny skill.
- **Domysł:** Wiedza Emila Kowalskiego o ruchu w UI jako wzór dla silnika ruchu Tessery.
- **Też:** Design systemy i zasady

### L910 · [link](https://yui540.com/motions) · tests 2026-10-06

- **Co pokazuje:** Brak obrazu; opis z meta. yui540.com/motions to japońska galeria kilkudziesięciu animacji CSS (7 stron) w wersji wideo i „CSSアニメーション版”, część z kodem na GitHubie (yui540/css-animations). Autor zastrzega zakaz kopiowania i trenowania AI poza repo GitHub.
- **Ruch:** Animacje CSS nagrywane z przeglądarki; w ramach tego zadania nie obejrzane.
- **Dla Tessery:** Źródło do studiowania charakteru ruchu (squash and stretch, sprężystość) w czystym CSS. Kodu nie kopiować poza repo z licencją; brać tylko zasady do silnika ruchu.
- **Domysł:** Cała kolekcja autora animacji z L909.

### L931 · [Chase AI](https://vm.tiktok.com/ZN8AXVt7q/) · tests 2026-10-21

- **Co pokazuje:** Chase AI mówi do kamery o 7 skillach Claude do designu, pokazując repozytoria GitHub: Taste Skill (Leonxlnx/taste-skill, TasteCode), designlang (wyciąganie języka projektowego ze strony), React Bits (skill dla agenta), GSAP AI Skills (GreenSock), playwright-cli (Playwright CLI zamiast MCP do testowania UI), Impeccable (pbakaus/impeccable, 24 komendy i wykrywacz „AI slop”) oraz Transitions.dev (ponad 43 gotowe przejścia CSS).
- **Dla Tessery:** Dla Tessery warto przejrzeć Impeccable (antywzorce AI slop jako lista kontrolna przeglądu) i Transitions.dev (gotowe przejścia CSS do porównania z silnikiem ruchu). Reszta to narzędzia agentowe, a Kontrakt wyglądu właściciela ma pierwszeństwo przed skillami.
- **Domysł:** Skille Claude do lepszego UI; szuka narzędzi przeciw „AI slop”.
- **Też:** Design systemy i zasady
