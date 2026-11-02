---
kind: plan
status: draft
baseline: feat/e2-foundation 0e05eba
created: 2026-11-02
---

# Plan: silnik interakcji — wciśnięcie i hover jednym standardem dla wszystkich elementów

## Cel

Jeden zoptymalizowany standard ruchu interakcji, zapisany raz w silniku `motion`, przepisach i jednym mechanizmie zachowania, który dziedziczy każdy element interaktywny Tessery: wciśnięcie, hover z wejściem i wyjściem, klawiatura i puszczenie.

Button jest pierwszym elementem, na którym właściciel ocenia standard. Akceptacja Buttona = akceptacja standardu, nie komponentu. Każda poprawka po ocenie idzie do silnika, przepisu albo mechanizmu i od razu zmienia wszystkie elementy.

## Rezultat właściciela

- Wciśnięty przycisk skaluje się cały (płytka, tekst, ikona) płynnie, bez przeskoku tekstu i ikon na starcie, w trakcie i po puszczeniu.
- Każdy element podświetlany pod kursorem ma wejście i wyjście hover z czasem; żaden nie gaśnie w jednej klatce.
- Space trzyma wciśnięcie, Enter błyska, zjazd kursora z wciśniętego elementu go puszcza.
- Popup przypięty do triggera (menu, popover, dialog, tooltip) nie skacze, nie mruga i nie zmienia szerokości przy kliknięciu.
- Strona z setkami przycisków przewija się i reaguje bez zacięć, także na telefonie.
- Zmiana czasu, skali albo krzywej w silniku zmienia wszystkie elementy naraz; test oblewa, gdy któryś element nie dziedziczy.

## Warunki końcowe

- [ ] Właściciel rozstrzygnął O1–O7 (faza 1).
- [ ] Każdy element interaktywny laboratorium należy do jednej grupy z tabeli i zachowuje się według niej; strażnik oblewa na elemencie bez grupy i na celowo zepsutym elemencie.
- [ ] Kotwica popupu i jej przodkowie nie mają transformacji (wszystkie popupy, Chromium i WebKit).
- [ ] Skok tekstu i ikon w progu przyjętym przez właściciela przy DPR 1 / 1,25 / 1,5 / 2; budżety zgodne z jego wyborem.
- [ ] Reguła „wciśnięcie tylko płytką” usunięta z każdego miejsca z inwentarza (22 pozycje); spec, `AGENTS.md`, dziennik i dokumentacja paczki mówią to samo.
- [ ] `bun run check` zielone; pomiar przed i po w tej samej sesji bez regresji poza świadomie przyjętym kosztem.
- [ ] Właściciel powiedział „ok” na żywo w kompozycji.

## Nie-cel

- Pozostałe polecenia z logu 02.11 13:00: grupy tooltipów (1), szew `joined` (4), dolot tooltipa (5–7), audyt menu i `<body>` (9, poza przytrzymaniem po zjeździe), skala (10–11), refaktor (12), runda D (14). Osobne jednostki po akceptacji tego standardu. Ten plan obejmuje pozycje 2, 3, 8 i przytrzymanie z pozycji 9.
- Kolory drabinki W8, kształt, cienie, rozmiary: bez zmian.
- Jazda i odbicie pigułki slidingu: bez zmian.

## Decyzje właściciela (wiążące)

- **D-W1 Wciśnięcie skaluje cały element**, nie samą płytkę: „cały baton ma się skalować”, „płytka nie jest decyzją”, „skaluje się tylko płytka — błędne rozpoznanie problemu, decyzja bez mojej zgody” (02.11); „tekst też się ma skalować, to jest prawo tego tekstu” (R1, 01.11). Wartości (skala, czasy, krzywe): O6.
- **D-W2 Kotwica stoi.** Element, do którego przypięty jest popup (menu, popover, dialog, tooltip, podmenu), ani jego przodek nie dostaje transformacji (IMPORTANT, 01.11). Jak kotwica okazuje wciśnięcie: O5.
- **D-W3 Hover ma wejście i wyjście z czasem** na każdym elemencie: „każdy hover ma mieć wyjście” (02.11). Wartości: O6. Decyzja prowadzącego N8 („kolor bez przejścia”) przestaje obowiązywać.
- **D-W4 Klawiatura i puszczenie:** Space trzyma, Enter błyska, zjazd kursora puszcza (11.10, `tmp/mem/mangashift/tessera-komponent-od-nowa-proces.md:18`); przytrzymany przycisk po zjechaniu kursorem nie wygląda na wciśnięty (log 02.11, poz. 9; wzór React Aria `usePress`). Desktop tego nie ma (`tmp/desk/lib/motion.ts:32-72`: tylko wskaźnik).
- **D-W5 Wydajność jest priorytetem nr 1**, telefon bez zacięć (spec „Użytkownik i intencja”; masterplan, wnioski 01.11).
- **D-W6 Wzorzec zachowań:** desktop MangaShift i najlepsze praktyki (Base UI, Radix, React Aria, APG); v2 tylko tam, gdzie wskazał właściciel (log 02.11 13:00, poz. 4 „Jak pracować”).
- **D-W7 Proces:** zmiana globalna; research przed zmianą; zaplanuj → wykonaj → oceń; decyzje wyglądu i odczucia tylko właściciel (`AGENTS.md`).

## Rozstrzygnięcia 02.11 po fazie 0 (podstawa wdrożenia)

- **Technika wciśnięcia = T** (pomiar `docs/decisions/e3-motion.md`): grupa „skala” ma w spoczynku `scale: 0.99999` bez `will-change`; wciśnięcie = przejście `scale` na kompozytorze do skali wciśnięcia i z powrotem do 0,99999; warstwa tylko w czasie animacji. Właściciel na żywo: „TG jest w miarę ok”, „T też jest poprawne”; prowadzący rekomenduje T (bez stałych warstw, przewijanie i kliknięcie nie wolniejsze niż dziś, ostry tekst w spoczynku). TG zostaje zapasem, jeśli właściciel zobaczy zmianę ostrości tekstu przy kliknięciu.
- **Wartości = O6 (W)**, notatka właściciela 11.10: 0,97, wejście 50 ms, powrót 224 ms bez odbicia. Wartości desktopu (0,92 + krycie) z T/TG skaczą (16 z 42 pomiarów), więc odpadają.
- **Kotwice się nie skalują** (decyzja właściciela 11.10: „wyzwalacz menu się nie skaluje”; v2; D-W2); pigułka się nie wciska (31.10); pole bez skali. Wynik pomiaru „T na kotwicy” może to tylko potwierdzić, nie zmienić bez właściciela.
- **Mechanizm = jeden nasłuch na dokumencie** (O3 a): stały koszt niezależny od liczby elementów, D-W4 (Space, Enter, zjazd kursora z prostokąta sprzed skali), zero kabli w komponentach.
- **Hover z wyjściem (O2, O4)**: osobna jednostka po akceptacji wciśnięcia.
- **Warunek wydajności właściciela:** 1000 elementów na stronie i wiele wciśniętych naraz bez spowolnienia; ruch poza wątkiem głównym. Dowód: test obciążenia fazy 0 i strażnik w fazie 2.

## Do decyzji właściciela (faza 1, na pomiarach i porównaniu na żywo)

**O6 Wartości wciśnięcia i hover.** Trzy źródła się różnią:

| Wartość                      | Notatka 11.10 (decyzja właściciela) | Desktop (`tmp/desk/styles/ui.css`)                | v2 (`tmp/v2/code/packages/tessera/src/components/_internal/control.css`, `button.css`) |
| ---------------------------- | ----------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| skala                        | 0,97                                | 0,92 + `opacity` 0,82 (`:120`, `:281-289`)        | `--button-press-scale` (`:72-73`)                                                      |
| wciśnięcie: wejście / powrót | 50 ms / 224 ms bez odbicia          | 100 ms / 100 ms `ease-out` (`:85-92`, `:250-252`) | `--motion-press-in` / czasy powrotu `:32-35`                                           |
| hover: wejście / wyjście     | 100 ms / 150 ms                     | 100 ms / 100 ms (`--motion-state`)                | `--control-state-time` hover in/out                                                    |
| warstwa                      | `will-change: scale` stale          | `will-change: transform` stale (`:251`)           | `will-change: scale` stale (`button.css:30`)                                           |

**O1 Warstwa wciśnięcia.** Wcześniejsze wybory: stała warstwa (11.10; desktop i v2 tak robią), „(c) wygląda ładnie” (02.11, decyzja wstrzymana). Koszt zmierzony (`docs/decisions/e3-fix-a.md`): stała warstwa na każdym przycisku = 74–115 warstw w spoczynku przy budżecie B7 = 12, przewijanie 3,5–4,5× droższe (`Layerize`), szary tekst w spoczynku (Q18); bez stałej warstwy skok ok. 1,1 px na starcie i końcu. Faza 0 mierzy nowe kandydatury, które mogą dać oba naraz (niżej). Jeśli żadna nie da, właściciel wybiera koszt; wtedy zmienia się B7 albo Q18 w spec.

**O2 Technika przejścia koloru hover.** Kandydaci: przejście zarejestrowanej zmiennej szczebla (`@property --_step`), przejście `background-color` na elemencie malującym tło (desktop), krycie osobnej warstwy (pomiar N8: 24,5 ms i 5 warstw przy 4×). Punkt wyjścia: T2 hover dziś 12,4 ms przy celu 4 ms (`apps/docs/perf/last.json`, 01.11).

**O3 Mechanizm wciśnięcia.** (a) jeden nasłuch na dokumencie jak desktop (`installGlobalPressFeedback`), rozszerzony o D-W4; (b) obecne `pressable` per komponent (dziś tylko `button.tsx:100,115`, `toggle-group.tsx:169`); (c) sam CSS `:active:hover`. Kryterium: D-W4 w Chromium i WebKit, widoczne wciśnięcie przy szybkim kliknięciu, dotyk, B3 (commity), zero kabli w komponentach.

**O4 Gaśnięcie pigułki hover.** Dziś 50 ms wejście, 300 ms wyjście (R4 „fade”; pozycja 8 logu: gaśnięcie przy wyborze „słabo widać”). Jedna wartość z O6 dla wszystkich czy pigułka osobno.

**O5 Kotwica przy wciśnięciu.** (a) tylko krok koloru, bez skali (v2: trigger z `aria-haspopup`/`aria-expanded` się nie skaluje); (b) kotwica stoi, a skaluje się jej treść i płytka jako wewnętrzne warstwy (desktop `ui.css:284-289`). Dotyczy też każdego przycisku z tooltipem: dziś trigger tooltipa to sam Button (`components/tooltip/tooltip.tsx:92-104`), więc przy (a) przyciski pasków narzędzi nie skalowałyby się wcale. Faza 0 mierzy, czy tooltip zamykany na `pointerdown` rusza się w czasie wyjścia przy (b).

**O7 Elementy bez rozstrzygnięcia.** Karta-link (`a[href]` z przepisem `surface`, dziś bez hover i wciśnięcia, `card.tsx:29`); przyszłe Checkbox i Switch (11.10: przełącznik się nie skaluje; v2 skaluje `.cn-checkbox`); Slider, opcja listy, wiersz drzewa. Właściciel przypisuje każdy do grupy.

Odchylenie od v2 zapisane wprost: v2 skaluje trigger menubara (`control.css:72`), który jest kotwicą; ten plan tego nie robi (D-W2).

## Authority i baseline

- Kod: `feat/e2-foundation` `0e05eba` w głównym folderze repo, build zielony 02.11.
- Wejście planu (trafia do `docs/reviews/` przy starcie fazy 0): diagnoza dokumentów (`scratchpad/structure.md`), błędy poprzedników (`scratchpad/errors.md`), inwentarz elementów (`scratchpad/inventory.md`), dwie recenzje tego planu.
- Źródła historii: `tmp/` (spis `tmp/index.md`, wyszukiwarka `python -I tmp/search.py`).

## Stan aktualny (dowody; pełny inwentarz `scratchpad/inventory.md`)

- **Silnik `motion`** (`packages/tessera/src/engines/motion.css`): czasy 50/100/150/200/250/220 ms, `--ts-motion-press-scale: 0.97`, `--ts-motion-duration-hover-exit` = `instant` + `--ts-in-motion-hover-fade` × `overlay` (300 ms, tylko pigułka); `off` i `prefers-reduced-motion` zerują czasy i skalę (`:72-101`). Brak wyjść: wciśnięcie wejście i powrót, hover wejście i wyjście, najkrótsze trzymanie.
- **Przepis `control`** (`recipes/control.css`): tło, obrys i cień maluje płytka `::before` (`:45-56`) z `transition: scale var(--ts-motion-duration-fast)` (100 ms w obie strony); hover przestawia `--_wash`/`--_step` bez przejścia (`:309-311`); wciśnięcie = krok koloru (`:315-317`) i `scale` samej płytki (`:320-321`, lista: `button, a[href], input, select, textarea, [role=button], [role=tab], [role=menuitem], [tabindex]`, bez `role=radio`, `field`, `aria-busy`). Trigger z `aria-haspopup` dziś skaluje płytkę. Biała lista interaktywności powtórzona w 7 selektorach (`:59`, `:71`, `:175`, `:288`, `:309`, `:315`, `:320`) i w `apps/docs/tests/helpers.ts:57` (`INTERACTIVE_CONTROL`).
- **Pigułka** (`recipes/indicator.css`): hover wiersza menu i opcji ToggleGroup to pigułka (`menu.tsx:76`, `data-variant="hover"`); wejście 50 ms, wyjście 300 ms (`:20`, `:26-28`); w grupie z pigułką płytka ma samo `--_base` (`:6-8`); wciśnięta niewybrana opcja = krok pigułki (`:48-50`).
- **`row`** (`recipes/row.css`): brak reguł hover i przejść; wiersz nie maluje własnego hover (błąd „ogona pigułek”, `errors.md` A3.8).
- **Mechanizm** (`lib/press.ts`): tylko `pointerdown` lewym przyciskiem; puszczenie na `pointerup`, `pointercancel`, `blur` okna; najkrótsze trzymanie = `fast` 100 ms; brak Space, Enter i puszczenia po zjeździe.
- **Elementy dziś:** 22 reagujące na wskaźnik lub klawiaturę; żaden z przepisu `control` ani wiersz menu nie ma hover z czasem; karta-link bez hover.
- **Reguła płytki:** 22 miejsca w kodzie, `AGENTS.md` (`:54`, `:112`, płytka jako nośnik tła `:120`, `:123`), spec (W8, W20; N5 i N8 powiązane), `docs/decisions/e3-choices.md:35,41,56`, `e3-budgets.md:132,249`, `e3-fix-a.md`, strażnicy `apps/docs/tests/button.spec.ts:143,171,198,332`, dokumentacja paczki `packages/tessera/docs/button.md:30`, `toggle-group.md:45`.
- **Rozjazd:** `e3-choices.md:41` mówi „hover pigułki domyślnie `cut`”, kod i test mają `fade`.
- **Pomiary i harness:** `docs/decisions/e3-fix-a.md`, `tmp/pad/bf52428f/fix-a/`, `tmp/pad/bf52428f/live/out/press-demo.html`; prior art już zebrany (log 02.11 13:00, „Zweryfikowane fakty”).

## Target design

### Grupy elementów (definicja semantyczna, jedna lista w przepisie)

| Grupa               | Kto (selektor po roli i atrybucie)                                                                                                        | Hover                           | Wciśnięcie                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------- |
| Skala               | `button:not([role])`, `[role='button']`, `a[href]:not([role])` z przepisem `control`, które nie są kotwicą ani opcją z pigułką            | przejście koloru (O2), czasy O6 | cały element skaluje się (O1, O6)                 |
| Kotwica             | `[data-anchor]`: atrybut stawiany przez każdy trigger Tessery z przypiętym popupem (Menu, Popover, Dialog, AlertDialog, Tooltip, podmenu) | przejście koloru                | według O5; element i przodkowie bez transformacji |
| Pigułka             | opcje w kontenerze z pigułką (`[role='radio']` ToggleGroup, `[role^='menuitem']` w menu)                                                  | gaśnięcie pigułki (O4)          | krok pigułki, bez skali                           |
| Pole                | `[data-variant='field']` (Input, Textarea)                                                                                                | przejście koloru                | bez skali, bez kroku wciśnięcia                   |
| Statyczny           | `span[data-recipe='control']` (Badge, Kbd), elementy nieinteraktywne                                                                      | brak                            | brak                                              |
| Do przypisania (O7) | karta-link, `checkbox`, `switch`, `slider`, `option`, `treeitem`, `menuitemcheckbox`, `menuitemradio`, gołe `[tabindex]`                  | decyzja właściciela             | decyzja właściciela                               |

Element interaktywny (fokusowalny albo z rolą widżetu), który nie należy do żadnej grupy, jest błędem strażnika.

### Silnik `motion` (wyjścia standardu, wartości z O6)

```text
--ts-motion-press-scale            skala wciśnięcia
--ts-motion-press-dim              krycie przy wciśnięciu (tylko jeśli O6 = desktop)
--ts-motion-duration-press-in      czas wciśnięcia
--ts-motion-duration-press-out     czas powrotu
--ts-motion-ease-press-in          krzywa wciśnięcia
--ts-motion-ease-press-out         krzywa powrotu
--ts-motion-duration-hover-in      czas wejścia hover
--ts-motion-duration-hover-out     czas wyjścia hover (pigułka według O4)
--ts-motion-press-hold             najkrótsze widoczne wciśnięcie
```

`off` i `prefers-reduced-motion`: wszystkie czasy 0, skala 1, krycie 1. `--ts-motion-duration-hover-exit` i `--ts-in-motion-hover-fade` znikają albo stają się wyprowadzeniem z `hover-out`; jedno źródło każdego czasu.

### Przepisy

- `control`: listy grup jako jedne selektory; wciśnięcie grupy „skala” na elemencie (nie na `::before`), przejście `scale` z czasem i krzywą zależnymi od kierunku (`[data-pressing]` → `press-in`, bez → `press-out`), warstwa według O1; kotwica według O5; przejście koloru hover według O2 z `hover-in`/`hover-out`.
- `indicator`: gaśnięcie pigułki według O4, czas z silnika.
- `surface`: karta-link według O7.
- `row`: bez zmian (wiersz nie maluje własnego hover).

### Mechanizm wciśnięcia (według O3)

- Wejście: lewy przycisk wskaźnika, dotyk, Space (trzyma do `keyup`), Enter (błysk na czas `press-hold`).
- Wyjście: puszczenie, `pointercancel`, utrata fokusu, zjazd kursora poza prostokąt elementu sprzed skali (nie po skurczonym obrysie, jak React Aria), ponowne wejście przy trzymanym przycisku wciska znowu; najkrótsze trzymanie `press-hold`.
- Nie dotyczy: wyłączony, `aria-disabled`, `busy`, grupy „pole” i „statyczny”.
- Jeden mechanizm dla wszystkich; przy O3 (a) i (c) komponenty nie podpinają go osobno.

### Mapa plików

```text
packages/tessera/src/
├── engines/motion.css              # MODIFY: wyjścia standardu
├── recipes/control.css             # MODIFY: grupy, wciśnięcie na elemencie, przejścia koloru
├── recipes/indicator.css           # MODIFY: gaśnięcie pigułki (O4)
├── recipes/surface.css             # MODIFY: tylko jeśli O7 obejmuje kartę-link
├── lib/press.ts, press.test.ts     # MODIFY albo zastąpione mechanizmem O3
└── components/**/*.tsx             # MODIFY: atrybut data-anchor na triggerach; usunięcie pressable przy O3 a/c
packages/tessera/docs/button.md, toggle-group.md   # MODIFY: opis wciśnięcia
apps/docs/
├── tests/interaction.spec.ts       # CREATE: strażnik grup i dziedziczenia
├── tests/button.spec.ts            # MODIFY: test płytki → test standardu; zachowany test kotwic i przodków (:171-196)
├── tests/helpers.ts                # MODIFY: grupy z jednego źródła, paintOf według nośnika tła
└── perf/last.json                  # MODIFY: punkt odniesienia po akceptacji
docs/
├── specification.md                # MODIFY: W8, W14, W20, Q2, Q4, Q18, B7, N5, N8, F6
├── decisions/e3-motion.md          # CREATE: cytaty właściciela 02.11, wyniki fazy 0, wybory O1–O7
├── decisions/e3-choices.md         # MODIFY: wiersze :35, :41, :56
└── reviews/                        # CREATE: diagnoza, błędy, inwentarz, recenzje planu
AGENTS.md                           # MODIFY: :53 (wyjątek ruchu dla przejścia koloru), :54, :112, :120, :123
```

## Zakres

### In scope

Silnik `motion`; przepisy `control`, `indicator` (i `surface` przy O7); mechanizm wciśnięcia; atrybut kotwicy na triggerach; strażnicy; dokumenty z mapy.

### Forbidden

- Wciśnięcie samą płytką; transformacja kotwicy albo jej przodka.
- Czas, skala albo krzywa poza silnikiem `motion`.
- Wyjątek dla jednego komponentu bez decyzji właściciela.
- Wiersze malujące własne tło hover (pigułka jest jedynym hover wiersza, W14).
- Wybór O1–O7 przez żołnierza albo prowadzącego.
- Zmiana wyglądu spoczynku poza skutkiem wyboru właściciela w O1 (zrzuty spoczynku przed i po równe ± 1 poziom, chyba że O1 świadomie przyjmuje szary tekst).
- Komendy git u żołnierzy; commit i push tylko na słowo właściciela.

### Dozwolone decyzje lokalne (prowadzący, zapis w `docs/decisions/e3-motion.md`)

Nazwy zmiennych prywatnych przepisu; czy płytka `::before` zostaje nośnikiem tła (bez skali), jeśli zrzuty są równe; struktura testów.

### Zatrzymaj się i wróć do właściciela, gdy

- żadna technika nie spełnia D-W1 i budżetów naraz;
- element nie pasuje do żadnej grupy albo pasuje do dwóch;
- standard wymaga zmiany zaakceptowanego wyglądu albo wyjątku per komponent;
- pomiar A/B w tej samej sesji pokazuje regresję T2 albo `Layerize` ponad koszt przyjęty w O1/O2.

## Impact scan

- **Popupy i kotwice:** skala na kotwicy przesuwa popup i `--anchor-width` (B1). Obowiązek: `[data-anchor]` na każdym triggerze, test przodków kotwic (`button.spec.ts:171-196`) przepisany, nie usunięty; niezależny test: otwórz każdy popup laboratorium, jego trigger musi być w grupie „kotwica”.
- **Grupy `track` i `joined`:** segment skalowany osobno może odsłonić szew (poprawka `--_shade` na płytce, `control.css:300-304`) albo wyjść poza przycięcie grupy. v2: zwykła połówka się skaluje, „⌄” z `aria-haspopup` nie (`control.css:72`). Obowiązek: `button-group.spec.ts` przy DPR 1,25 i 1,5, zrzuty grup przy wciśnięciu.
- **Pigułka:** krok pigułki przy wciśnięciu bez zmian; gaśnięcie według O4.
- **Nośnik tła:** jeśli tło przechodzi z `::before` na element, dotyka `paintOf`, `a11y.spec.ts:116`, `edges.spec.ts:730`, `kbd.spec.ts:84`, szwu `joined` (`AGENTS.md:120`). Obowiązek: zrzuty spoczynku i stanów przed i po.
- **Budżety:** B2 (przejście koloru maluje w każdej klatce: nazwany wyjątek albo technika bez malowania), B3, B7, T2 (press i hover).
- **`motion: off`, `prefers-reduced-motion`, dotyk (`@media (hover: hover)`), `forced-colors` (Q19), WebKit (`will-change`, `@property` inaczej niż w Chromium), stany wyłączone i `busy`.**
- **Obszar trafienia:** skala zmniejsza obrys; puszczenie liczone z prostokąta sprzed skali (D-W4).
- **React Compiler i SSR:** mechanizm O3 (a) instalowany bez kontekstu Reacta (Q8) i bez efektów ubocznych przy imporcie (`sideEffects` tylko CSS).

## Plan wykonania

### Faza 0 — wejście, research i pomiar (bez zmian w kodzie produktu)

1. **Zapis wejścia (prowadzący):** `docs/decisions/e3-motion.md` z cytatami właściciela 02.11 i tabelą O6; diagnoza, błędy, inwentarz i recenzje do `docs/reviews/`.
2. **Research (Opus w chmurze, bez repo):** tylko to, czego jeszcze nie ma: O2 (przejście koloru przy setkach elementów: koszt w Chromium i WebKit, wzorce produkcyjne), O3 (React Aria `usePress`, `:active:hover`, Space i Enter, obszar puszczenia), nowe kandydatury O1: stała warstwa tylko przy `(hover: hover) and (pointer: fine)` i tylko na grupie „skala”, warstwa na kontenerze paska zamiast na każdym przycisku, warstwa na czas najechania z rozgrzaniem przed wciśnięciem. Istniejący prior art (Spectrum S2, Linear, shadcn, Material, Fluent, Apple, crbug 1155029) przenoszony z logu, nie powtarzany.
3. **Pomiar (Opus lokalnie, harness `tmp/pad/bf52428f/fix-a/`, kopia `apps/docs/out`, wstrzyknięty CSS/JS):** każda kandydatura O1 z 0.2 plus (c) i (b) z `e3-fix-a.md` jako punkty odniesienia; skok klatka po klatce (DPR 1 / 1,25 / 1,5 / 2 / 3), warstwy B7 w spoczynku i przy wciśnięciu na trzech stronach, `Layerize` i wątek główny przy przewijaniu (CPU 1× i 4×), telefon 390 px z `hasTouch`, WebKit; O2: T2 hover (10 `Button`, 500 wierszy) i warstwy, A/B w tej samej sesji (mediana z 5); O5 (b): ruch tooltipa przy wciśnięciu triggera; O3: Space, Enter, zjazd przy krawędzi, szybki klik, dotyk, B3.
4. **Strona porównawcza `:4400/motion-demo`:** ten sam przycisk, trigger, przycisk z tooltipem, opcja ToggleGroup i wiersz menu w każdej kandydaturze i w wartościach O6 obok siebie; prowadzący sam ogląda ją w ruchu przed pokazaniem.

**Gate:** liczby z jednego harnessu; każde twierdzenie researchu ze źródłem; tabela w `docs/decisions/e3-motion.md` z kosztem każdej opcji.

### Faza 1 — checkpoint właściciela

```text
Uruchom: http://localhost:4400/motion-demo (i na telefonie, jeśli właściciel chce)
Zrób: wciśnij przycisk myszą, przytrzymaj, zjedź kursorem; Space, Enter; przejedź kursorem po rzędzie; wciśnij przycisk z tooltipem i trigger menu
Oczekiwany rezultat: cały przycisk ugina się i wraca bez przeskoku; hover wchodzi i gaśnie; popup stoi
Zwróć uwagę na: tekst i ikonę na starcie i końcu, ostrość tekstu w spoczynku, płynność przewijania
Przekaż wynik jako: wybór dla O1–O7
```

Po wyborze prowadzący uzupełnia fazę 2 o wybrane techniki i plan wraca do właściciela do akceptacji (`AGENTS.md`: kod tylko z zaakceptowanego kontraktu).

### Faza 2 — wdrożenie (Opus w chmurze albo w worktree `.worktrees/motion`; jeden wykonawca)

Kolejność zależności, każdy krok z kontrolą:

1. Silnik `motion`: wyjścia standardu, `off` i reduced motion, jedno źródło czasów. Kontrola: test wartości silnika (`lab.spec.ts`).
2. Atrybut `data-anchor` na każdym triggerze z popupem. Kontrola: test „trigger każdego otwartego popupu ma `data-anchor`”.
3. Mechanizm wciśnięcia (O3) z D-W4. Kontrola: `press.test.ts` (Space, Enter, zjazd i powrót, krawędź, hold, wyłączony) i test przeglądarkowy w Chromium i WebKit.
4. Przepis `control`: grupy, wciśnięcie (O1, O5), przejście koloru (O2). Kontrola: zrzuty spoczynku przed i po; test kotwic i przodków; test szwu `joined`.
5. Przepis `indicator` (O4) i `surface` (O7). Kontrola: `toggle-group.spec.ts`, `menu.spec.ts`.
6. Strażnik `interaction.spec.ts`: na każdej stronie laboratorium wylicza elementy interaktywne po semantyce (fokusowalne, role widżetów, `a[href]`), przypisuje grupę z tabeli i sprawdza jej zachowanie (skala na elemencie i przejście z czasem silnika; kotwica bez transformacji; pigułka z gaśnięciem; pole bez skali); element bez grupy albo w dwóch = błąd. Kontrola: test czerwony po celowym usunięciu przejścia z jednego elementu i po zdjęciu `data-anchor` z jednego triggera.
7. Strażnik skoku: klatki wciśnięcia przycisku z etykietą i dwiema ikonami, próg przyjęty w fazie 1.
8. Dokumenty (Sonnet, według tekstu prowadzącego): spec, `AGENTS.md`, `e3-choices.md`, `e3-motion.md`, `packages/tessera/docs/*.md`; po zmianie grep po regule płytki = 0 trafień poza historią decyzji.
9. Bramki: `bun run check`, pomiar A/B (`bun run perf` przed i po, ta sama sesja), przegląd własny diffu (skill `review`).

Worktree (jeśli faza 2 lokalnie): po scaleniu najpierw zdjęcie linków (`rmdir` na junctionach), potem `git worktree remove` dosłowną ścieżką bez `--force`, potem `git branch -d`.

### Faza 3 — ocena

1. Niezależny recenzent (Opus, świeży kontekst): diff kontra plan i D-W1–D-W7; szuka elementu bez grupy, wyjątku per komponent i przemyconej decyzji wyglądu.
2. Prowadzący sam: wciśnięcie i hover każdej grupy, Space, Enter, zjazd przy krawędzi, przewijanie strony z setkami przycisków, telefon w emulacji, WebKit.
3. Właściciel na żywo: Button w kompozycji (strona, karta, popup 2–3 poziomy) i ten sam standard na triggerze, przycisku z tooltipem, opcji i wierszu. „Ok” = standard przyjęty; „nie ok” = poprawka w silniku, przepisie albo mechanizmie, nigdy w komponencie.

## Żołnierze

Zasada: co nie wymaga lokalnych plików ani sprzętu, idzie do chmury (właściciel 02.11). Kod w chmurze wymaga pushu gałęzi, a push tylko na słowo właściciela.

Każdy brief według szablonu skilla `subagent`, dla wykonawcy ok. 2000 słów, ze skillami `workflow` i zadaniowym (`research`, `coding`, `review`), decyzjami D-W, zakazami, warunkiem stopu i formatem SUBAGENT-RESULT. Zero komend git.

| Żołnierz      | Gdzie                | Faza         | Zadanie                                              | Zapis                                          |
| ------------- | -------------------- | ------------ | ---------------------------------------------------- | ---------------------------------------------- |
| Opus          | chmura               | 0.2          | research O2, O3, nowe kandydatury O1                 | raport                                         |
| Opus          | lokalnie             | 0.3–0.4      | pomiar na harnessie, strona porównawcza              | `scratchpad/`, kopia laboratorium              |
| Opus          | chmura albo worktree | 2.1–2.7, 2.9 | wdrożenie i strażnicy                                | gałąź `feat/e3-motion`, pliki z mapy           |
| Sonnet        | lokalnie             | 2.8          | synchronizacja dokumentów według tekstu prowadzącego | `docs/`, `AGENTS.md`, `packages/tessera/docs/` |
| Opus (świeży) | chmura               | 3.1          | recenzja                                             | tylko odczyt                                   |

Prowadzący: briefy, odbiór i sprawdzenie każdego wyniku u źródła, integracja, pomiary lokalne do oceny, raport właścicielowi, commit tylko na słowo właściciela.

## Strategia dowodu

- Grupy i dziedziczenie: `interaction.spec.ts` (czerwony na celowym błędzie).
- Kotwice: test przodków kotwic i test triggerów otwartych popupów (Chromium, WebKit).
- Brak przeskoku: strażnik klatek z progiem właściciela; ocena właściciela na żywo (test nie zastępuje oka).
- Klawiatura, zjazd, krawędź: `press.test.ts` i test przeglądarkowy.
- Wydajność: B7 (`lab.spec.ts`), T2 hover i press oraz `Layerize` A/B w tej samej sesji, profil telefonu.
- Wygląd spoczynku: zrzuty przed i po.

## Ryzyka i reakcje

- **Żadna technika nie spełnia D-W1 i B7 naraz** → właściciel wybiera koszt; zmiana B7 albo Q18 w spec.
- **Przejście koloru na setkach elementów obciąża wątek główny** (T2 już 12,4 ms) → O2 mierzone przy 500 wierszach, A/B.
- **Skalowany segment odsłania szew `joined`** → strażnik szwu i zrzuty grup.
- **Globalny nasłuch dodaje rendery albo łapie elementy statyczne** → B3 i filtr grup w mechanizmie.
- **WebKit inaczej interpoluje `@property` i warstwy** → pomiar w obu; wersja zapasowa (Q16).
- **Żołnierz zmienia wygląd albo przypisuje element do grupy sam** → zakazy w briefie, zrzuty w bramce, strażnik grup.

## Definition of Done

- [ ] O1–O7 rozstrzygnięte przez właściciela i zapisane w `docs/decisions/e3-motion.md`.
- [ ] Standard w silniku, przepisach i mechanizmie; żaden komponent nie ma własnej wersji.
- [ ] Strażnicy grup, kotwic, skoku i szwu zieloni; strażnik grup czerwony na celowym błędzie.
- [ ] `bun run check` zielone; pomiar A/B w koszcie przyjętym przez właściciela.
- [ ] Reguła płytki usunięta ze wszystkich miejsc z inwentarza; grep = 0 poza historią decyzji.
- [ ] Właściciel powiedział „ok” na żywo.

## Kontrakt wyniku

```text
status
co zmieniono (silnik, przepisy, mechanizm, strażnicy, dokumenty)
wybory właściciela O1–O7
dowody: komendy i liczby (check, A/B perf, skok, warstwy, T2)
ocena recenzenta i rozstrzygnięcie każdej uwagi
ocena właściciela
odchylenia od planu
następna jednostka (polecenia z logu 02.11 13:00)
```
