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

## Stan elementów w laboratorium (właściciel, 04.11)

Laboratorium tylko pokazuje element; obecność na stronie nie znaczy, że element jest przyjęty.

- Button: przyjęty wstępnie.
- Checkbox: przyjęty „jako tako”.
- Badge, Button group, Card: nieprzyjęte.

## Uwagi właściciela do elementów (04.11, do zrobienia)

- Ruch (05.11, do przemyślenia): przy oddaleniu (lupa, małe rozmiary) odbicie kciuka Switcha i innych elementów z kategorią `choice` wydaje się za słabe; sprawdzić, czy odbicie ma rosnąć z rozmiarem albo skalą, zanim cokolwiek zmienimy.

- Switch: przy `motion` = `off` kciuk nadal odkształcał się przy wciśnięciu. Właściciel: wyłączony ruch wyłącza też rozciągnięcie; zrobione wyjściem `--ts-motion-press-stretch` silnika `motion` (gotowe do oceny). Otwarte: przy `motion` = `on` kliknięcie wygląda na zlagowane; test „stretches only the thumb towards the middle on a press” jest czerwony także na starych regułach (rozciągnięcie 5 px zamiast 4,5 px, zaokrąglenie do pełnego piksela).

- Testy szablonu do przestawienia: `toggle-group.spec.ts` (pigułka grupy trybu, której już nie ma), `lab.spec.ts` „starts no colour animation…” (zmiana trybu przez listę zostawia gaśnięcie hovera triggera `soft`), `edges.spec.ts` (nawigacja „Pages” → „Elements”).

- Select: w przeglądarce VS Code kliknięcie przenosi stronę na samą górę; w Chromium i przy lupie 1× / 2× / 4×, myszą i klawiaturą, nie odtworzone (strona stoi). Właściciel: prawdopodobnie błąd przeglądarki VS Code.

- Context menu: Base UI jest zawsze modalne, więc przy otwartym menu znika pasek przewijania; usunięcie wymaga Context menu na `Menu` z `modal={false}` (decyzja właściciela).

## Odrzucone 04.11

- Przebudowa wszystkiego naraz (22 sekcje, 14 „filarów” z Foundation, usunięcie stron, migracja testów subagentami): błędy lupy, paski przewijania w kolumnach, wymyślone filary, dwa systemy naraz. Zmiany leżą w `git stash` („lab rebuild rejected 2026-11-04”), nie wracać do nich bez polecenia właściciela.
- Filary jako sekcje na górze strony: właściciel nie widzi ich jako sekcji elementów.
- Prawa kolumna 2× szersza od lewej i 28rem jak v2: za szeroka.

## Dalej

1. Dodawać elementy po kilka, każdy przepisany na grupy jak Button, zrzut w obu trybach i przy lupie 1× / 2× / 4×, ocena właściciela.
2. Do sprawdzenia później (właściciel, 04.11): przy lupie 2× w podglądzie przeglądarki VS Code (z własnym powiększeniem) przycisk „Pressed” w Button → States był ucięty z prawej; nie odtworzone w Chromium przy szerokościach 800–1920 px. Odtworzone: przy 4× w oknie ≤ 1024 px przyciski kart i „Crop” wychodzą poza środkową kolumnę.
3. Stare strony (`/foundation`, `/components`, `/screens/*`, `/proposals/select`) zostają, dopóki ich elementy nie przejdą na `/`; testy i kontrakt `≥ 2 strony` przestawiamy razem z ostatnim elementem.
