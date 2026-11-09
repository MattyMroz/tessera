---
kind: plan
status: in-progress
baseline: feat/e3-motion f27ab64
created: 2026-11-04
---

# Plan: laboratorium jako jedna strona w trzech kolumnach, budowana element po elemencie

## Cel

Właściciel ocenia w spokoju i bez wysiłku elementy budowane na filarach: po lewej lista elementów, na środku elementy, po prawej globalne ustawienia wyglądu.

## Szablon tymczasowy (właściciel, 04.11: „wszystko oprócz kolorów jest poprawnie zrobione”, „tylko szablon tymczasowy, nie mówię, że to jest poprawnie zrobione”)

- Lewa kolumna `md:w-36` (9rem), lista elementów (linki do kotwic na `/`); docelowo komponent listy, którego jeszcze nie ma.
- Środek: najszersza, jedna kolumna; strona `/` z sekcjami elementów.
- Prawa kolumna `md:w-44` (11rem), trochę szersza od lewej; panel `data-size="sm"`: lupa 1× / 2× / 4× (powiększa tylko środek), każda oś motywu jako lista z ikoną lucide osi.
- Żadna kolumna nie ma własnego przewijania; przewija się tylko strona (kolumny boczne `sticky`, `z-10`). Tło strony `min-h-dvh`.
- Sekcja elementu: `h2` z nazwą, potem grupy z podpisem `h3` (wzór Button: Variants, Tones, Icons, Sizes, States, Blocked activation, Links, In a card), każda grupa w swoim rzędzie.
- Kolory i ciemny tryb poza oceną (M-17 w masterplanie).

## Stan elementów w laboratorium

Laboratorium tylko pokazuje element; obecność na stronie nie znaczy, że element jest przyjęty. Stan każdego elementu stoi przy jego nazwie w lewej kolumnie, a jedynym źródłem jest pole `status` w `apps/docs/app/elements.ts` (właściciel, 06.11):

- ✗ `not-ready`: niegotowy, nieoceniony albo nieprzyjęty;
- – `accepted`: przyjęty przez właściciela, ale ma otwarte uwagi (np. Button przyjęty wstępnie, Checkbox „jako tako”, Menubar wizualnie, z otwartym budżetem B6);
- ✓ `done`: zrobiony, nic do zrobienia.

Stan zmienia się tylko na słowo właściciela.

## Uwagi właściciela do elementów (04.11, do zrobienia)

- Switch, Radio, Checkbox (06.11): przyjęte z otwartymi uwagami (–). Switch: ma mocniej odbijać (właściciel 06.11), ale nie przez dosunięcie kciuka do ściany toru i ściśnięcie. 07.11: kciuk 3/4 toru i spoczynek z CSS przyjęte (`e3-choices.md`); otwarte: kciuk poza środkiem o 0,2–0,8 piksela ekranu przy powiększeniu innym niż 100 % (czerwony test w `switch.spec.ts`). Odbicie: przy xs i sm miejsce do ściany toru to tylko ok. 1 px, a odbicie 10 % już dziś dochodzi do ściany; następna poprawka po krzywiźnie.

- Ruch (05.11, do przemyślenia): przy oddaleniu (lupa, małe rozmiary) odbicie kciuka Switcha i innych elementów z kategorią `choice` wydaje się za słabe; sprawdzić, czy odbicie ma rosnąć z rozmiarem albo skalą, zanim cokolwiek zmienimy.

- Switch: przy `motion` = `off` kciuk nadal odkształcał się przy wciśnięciu. Właściciel: wyłączony ruch wyłącza też rozciągnięcie; zrobione wyjściem `--ts-motion-press-stretch` silnika `motion` (gotowe do oceny). Otwarte: przy `motion` = `on` kliknięcie wygląda na zlagowane; test „stretches only the thumb towards the middle on a press” jest czerwony także na starych regułach (rozciągnięcie 5 px zamiast 4,5 px, zaokrąglenie do pełnego piksela).

- Testy szablonu do przestawienia: `toggle-group.spec.ts` (pigułka grupy trybu, której już nie ma), `lab.spec.ts` „starts no colour animation…” (zmiana trybu przez listę zostawia gaśnięcie hovera triggera `soft`), `edges.spec.ts` (nawigacja „Pages” → „Elements”).

- Select: w przeglądarce VS Code kliknięcie przenosi stronę na samą górę; w Chromium i przy lupie 1× / 2× / 4×, myszą i klawiaturą, nie odtworzone (strona stoi). Właściciel: prawdopodobnie błąd przeglądarki VS Code. 07.11: w przeglądarce VS Code tooltipy i pigułki po zmianach nie działały, w zwykłej przeglądarce działały; ocena na żywo w Chrome.

- Menubar (07.11): między wyzwalaczami jest przerwa; kursor w przerwie nie zaznacza żadnego, więc pigułka gaśnie i pojawia się znowu zamiast przejechać (ta sama klasa błędu co mruganie tooltipa w szczelinie, `e3-tooltip.md`). Właściciel: przejście ma być płynne, pigułka jedzie i zmienia rozmiar jak w MangaShift. Należy do wspólnego standardu slidingu (pigułka `lib/indicator.ts` i lot popupu `lib/popup-flight.ts`: jedna rzecz jedzie z A do B, zamiast zniknąć i pojawić się). Kolejność: po Tooltipie.

- Menu, łatka trójkąta podmenu (07.11, naprawione, gotowe do oceny): przy szybkim przejeździe przez kilka wierszy sztuczny `mousemove` łatki (`hoverUnderPointer`) otwierał podmenu wiersza, nad którym kursor tylko przeleciał („Share”); przeglądarka nie widziała wejścia na ten wiersz, więc nie było wyjścia i podmenu zostawało otwarte bez końca, a menu rodzica miało `pointer-events: none`. Poprawka w łatce: sztuczny ruch idzie w bieżące miejsce kursora i nie trafia w wyzwalacz podmenu (podmenu otwiera tylko prawdziwy ruch). Dowód: `menu.spec.ts` „slides the pill on the compositor” czerwony przed, zielony po. `menu.spec.ts` „wraps every icon of a row in the icon slot…” czerwony także na HEAD, niezwiązany z ruchem.

- Czerwone także na HEAD 00e682c (pomiar 07.11, worktree `.worktrees/base`, port 4460), niezwiązane ze standardem suwnicy: `a11y.spec.ts` na `/` (przyciski bez nazwy), `button.spec.ts` „keeps a lone button with a label at least 2.5 heights wide…”, `edges.spec.ts` „stacks the page navigation…” (320 px), `interaction.spec.ts` na `/` i „equal the engine output…”, `symmetry.spec.ts` (wiersz menu i odstęp menu, 8 testów), `scale.spec.ts` „grows every value…”, `toggle-group.spec.ts` 95 i 140, `lab.spec.ts` 815.

- Podmenu, granica dwóch wierszy z podmenu (07.11, naprawione, gotowe do oceny): na jednym pikselu ekranu przy granicy podmenu się zamykało, a pigułka stała na złym wierszu (każde powiększenie). Przyczyna: sztuczny ruch łatki nie trafiał w wyzwalacz podmenu (poprawka „Share” z tego samego dnia). Poprawka: sztuczny ruch trafia w każdy wiersz pod kursorem, a wiersz, który go dostał, dostaje też sztuczne `mouseleave`, gdy kursor naprawdę z niego zjedzie. Strażnicy `sliding.spec.ts`: granica co piksel ekranu w dół i w górę przy DSF 1 / 1,25 / 1,5, menu „Tools” (pięć wierszy z podmenu jeden pod drugim) przejechane w dół i w górę, w każdej klatce pigułka na wierszu widocznego podmenu.

- Lista elementów (07.11, naprawione): drugie kliknięcie tego samego wpisu po przewinięciu nie przewijało (Next `Link` z tym samym adresem nic nie robi); zwykły odnośnik → strażnik `lab.spec.ts` („…clicked a second time after scrolling away”).

- Lupa (07.11): przy 2× i 4× środek się powiększa, a menu, podmenu i tooltipy (portal w `<body>`) nie; popup ma mieć skalę elementu, z którego się otwiera.

- Context menu: Base UI jest zawsze modalne, więc przy otwartym menu znika pasek przewijania; usunięcie wymaga Context menu na `Menu` z `modal={false}` (decyzja właściciela).

## Odrzucone 04.11

- Przebudowa wszystkiego naraz (22 sekcje, 14 „filarów” z Foundation, usunięcie stron, migracja testów subagentami): błędy lupy, paski przewijania w kolumnach, wymyślone filary, dwa systemy naraz. Zmiany leżą w `git stash` („lab rebuild rejected 2026-11-04”), nie wracać do nich bez polecenia właściciela.
- Filary jako sekcje na górze strony: właściciel nie widzi ich jako sekcji elementów.
- Prawa kolumna 2× szersza od lewej i 28rem jak v2: za szeroka.

## Dalej

1. Dodawać elementy po kilka, każdy przepisany na grupy jak Button, zrzut w obu trybach i przy lupie 1× / 2× / 4×, ocena właściciela.
2. Do sprawdzenia później (właściciel, 04.11): przy lupie 2× w podglądzie przeglądarki VS Code (z własnym powiększeniem) przycisk „Pressed” w Button → States był ucięty z prawej; nie odtworzone w Chromium przy szerokościach 800–1920 px. Odtworzone: przy 4× w oknie ≤ 1024 px przyciski kart i „Crop” wychodzą poza środkową kolumnę.
3. Stare strony (`/foundation`, `/components`, `/screens/*`, `/proposals/select`) zostają, dopóki ich elementy nie przejdą na `/`; testy i kontrakt `≥ 2 strony` przestawiamy razem z ostatnim elementem.
