---
kind: plan
status: accepted
updated: 2026-11-04
---

# Plan: rodzina list (Menu, menu kontekstowe, pasek menu, Select)

## Cel

Jedna lista rozwijana (popup, pigułka hover, wiersz, znacznik) w czterech elementach, które różnią się tylko tym, co ją otwiera i co robi wybór. Pasek menu jak w v2 i MangaShift desktop: jedna pigułka, przełączanie najechaniem, przelot popupu między triggerami, menu niemieszczące się chowane pod „…”.

Warunek sukcesu: każdy element na żywo w laboratorium, `bun run check` zielony, zero kopii popupu, pigułki i środka wiersza w TSX, właściciel ocenia każdy element osobno.

## Stan dziś (zmierzony 2026-11-04)

| część                                               | gdzie                                     | stan                                                            |
| --------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| wygląd wiersza, nagłówka, separatora                | przepis `row`                             | wspólny                                                         |
| popup                                               | przepis `surface` (`overlay`, `controls`) | wspólny wygląd, atrybuty skopiowane w `menu.tsx` i `select.tsx` |
| pigułka hover                                       | `lib/indicator.ts` + przepis `indicator`  | wspólna logika, znaczniki skopiowane w obu plikach              |
| środek wiersza (znacznik → ikona → tekst → `trail`) | `Row` w `menu.tsx`, kopia w `SelectItem`  | zdublowany                                                      |
| ptaszek, kropka                                     | `Mark` (`checkbox.tsx`)                   | wspólny                                                         |
| lot popupu                                          | `lib/popup-flight.ts` (tooltip, podmenu)  | wspólny                                                         |
| kolumna tekstu, nachodzenie podmenu, szewron        | `row.css`, `surface.css`                  | zrobione dziś, zapisane w `e3-choices.md`                       |

## v2 i MangaShift kontra Tessera

| cecha                    | v2                                                      | MangaShift desktop                                             | Tessera (plan)                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prymityw                 | Radix Menubar                                           | Radix Menubar                                                  | Base UI `Menubar`                                                                                                                                                                                  |
| pigułki paska            | dwie (hover, otwarte)                                   | dwie                                                           | **jedna**: jedzie za kursorem, trzyma się otwartego triggera (jak pigułka menu na triggerze podmenu); przy otwartym menu najechanie i tak przełącza menu, więc druga pigułka nigdy nie stoi osobno |
| ruch pigułki             | elastic 220 ms albo firm 150 ms                         | 150 / 200 ms                                                   | `follow` 100 ms z silnika, ten sam co w menu i torze                                                                                                                                               |
| przełączanie najechaniem | Radix                                                   | Radix                                                          | Base UI (`hasSubmenuOpen`), bez kodu                                                                                                                                                               |
| przelot popupu           | `usePopupSlide` + animacja rozmiaru                     | to samo                                                        | `lib/popup-flight.ts` bez zmiany rozmiaru w ruchu (reguła AGENTS.md)                                                                                                                               |
| położenie menu           | 8 px pod paskiem, brzeg wiersza w linii brzegu triggera | 8 px, to samo                                                  | `--ts-space-inset` pod paskiem (jak każdy popup), brzeg wiersza w linii brzegu triggera                                                                                                            |
| „…”                      | brak (`flex-wrap`)                                      | kod aplikacji: lustrzany DOM + `ResizeObserver`, bez histerezy | w paczce: pomiar prawdziwych triggerów, ukryte menu jako podmenu w „…”                                                                                                                             |
| Tab między menu, Alt/F10 | dopisane                                                | dopisane                                                       | **tak**, 1:1 z desktopu (spec F15): Alt, F10 i Tab fokusują pasek, Tab przy otwartym menu przechodzi do następnego menu; `lib/menubar-hotkey.ts` (spec: lista `lib/`)                              |
| modalność                | Radix bez blokady                                       | to samo                                                        | pasek `modal={false}` jak `Menu` (Base UI domyślnie `true`: blokada przewijania i `inert`, pułapka „otwarcie menu laguje”)                                                                         |
| tło paska                | brak                                                    | brak                                                           | brak (pasek bez obrysu i tła, pigułka na tle strony)                                                                                                                                               |

## Kroki

### 1. Wspólna lista

- Nowy plik `components/menu/list.tsx` (rodzina `menu`): `ListPopup` (atrybuty powierzchni `overlay` + `controls` + pigułka hover z `useIndicator`; przyjmuje komponent popupu Base UI, selektor wierszy `items`, opcjonalny `held` (trzymanie pigułki, tylko menu) i dodatkowe atrybuty `data-width` / `data-size`) i `ListRow` (znacznik → ikona → tekst → `trail`, tekst przez `render`, bo Select owija go w `ItemText`). Konteksty `SubmenusContext` i `MarkContext` zostają u właścicieli.
- `menu.tsx` i `select.tsx` biorą oba; `Row` i kopie znikną w tym samym diffie.
- Dowód: wszystkie istniejące testy menu bez zmian, zrzuty menu i Selecta piksel w piksel, test, że tekst na triggerze Selecta dalej leży 0,00 px na wartości (`alignText` czyta `[data-slot="label"]`).

### 2. Menu: domknięcie

- Separator jak v2 i MangaShift (`-mx-1 h-px bg-glass-border`): 1 px (`--ts-shape-stroke`), od brzegu do brzegu popupu (ujemny margines o odstęp listy w przepisie `row`), kolor porównany na zrzucie z v2 w obu trybach; dziś kończy się na odstępie listy.
- Hover całej listy jak w v2: pigułka nie gaśnie i nie mruga, gdy kursor przechodzi przez separator, nagłówek grupy albo szczelinę między wierszami (`stickyHover` już to robi); gaśnie dopiero po wyjściu z popupu. Test klatka po klatce przejazdu przez separator (spec F15: pigułka zostaje na ostatnim wierszu przy separatorze).
- `docs/menu.md` w paczce zaktualizowany (kolumna tekstu, podmenu, wiersze).
- Dowody: `menu.spec.ts` + nowe przypadki: kolumna tekstu (z ikoną, ze znacznikiem, bez), nachodzenie podmenu = `--ts-shape-inset`, szewron od brzegu = bok ikony, cztery poziomy podmenu.

### 3. Menu kontekstowe

- `components/menu/context-menu.tsx`: `ContextMenu` (obszar, `ContextMenu.Trigger` Base UI), `ContextMenuContent` (`ListPopup`); wiersze, grupy i podmenu z `menu.tsx`.
- Położenie: Base UI dla menu kontekstowego daje `sideOffset -5` i `alignOffset 2`, a nasz `surface` dokłada margines strony popupu, więc pierwszy wiersz nie trafia pod kursor. `ContextMenuContent` zeruje oba przesunięcia (`0`), a przepis `surface` przesuwa popup o `--ts-shape-inset` pod atrybutem `data-variant='context'` (wzór: reguła podmenu w `surface.css`), żeby brzeg pierwszego wiersza stał pod kursorem.
- Modalność: Base UI wymusza modalne menu kontekstowe (`MenuStore`: `modal` dla `context-menu`, brak propa). Mierzę koszt otwarcia na `/components` (CPU ×4) i zapisuję wynik w `docs/decisions/e3-menus.md`; jeśli koszt przekracza budżet, to decyzja dla właściciela.
- Dowody: `context-menu.spec.ts` (otwarcie prawym przyciskiem i klawiszem menu, brzeg pierwszego wiersza pod kursorem, popup w oknie przy rogach, koszt otwarcia), sekcje na `/components`, `/screens/overlays`, `/screens/edges`, `docs/context-menu.md`.

### 4. Pasek menu

- `components/menu/menubar.tsx`: `Menubar` (Base UI `Menubar` z `modal={false}`, wymagany `moreLabel`, `size`), `MenubarMenu` (`label`, wiersze Menu jako dzieci).
- Triggery: `Button` w wariancie `ghost` jako kotwica (stoi, wciskają się sloty i płytka, reguła AGENTS.md); płytka hover triggera wyłączona w pasku, bo pokazuje ją pigułka.
- Pigułka: jedna, `useIndicator({ axis: 'x', items, hover: true, focus: true })`; każde `MenubarMenu` przy otwarciu wywołuje `hold(trigger)`, przy zamknięciu `release(trigger)` tylko gdy to wciąż jego trigger (wzór `release` z `MenuPopup`), bo przy przełączaniu sprzątanie A przychodzi po otwarciu B.
- Menu paska: brzeg wiersza w linii brzegu triggera; przepis `surface` przesuwa popup o `--ts-shape-inset` tylko pod atrybutem paska (`data-variant='bar'`), nie każde menu `bottom-start`.
- Przelot: jeden `createPopupFlight` na pasek, łaska ta sama co dla podmenu: jedna stała `FLIGHT_GRACE` w `lib/popup-flight.ts` (dawne `SUBMENU_FLIGHT_GRACE`).
- Klawiatura (spec F15): `lib/menubar-hotkey.ts`: Alt, F10 i Tab z `body` fokusują pierwszy trigger; Tab i Shift+Tab przy otwartym menu otwierają następne i poprzednie menu, za ostatnim zamykają.
- „…”: `lib/bar-overflow.ts` (nowy plik pomiaru Q7, dopisany do `MEASURING_FILES` w `contracts.test.ts` i do listy w AGENTS.md):
  - czysta funkcja `visibleCount(widths, gap, more, available)` (ostatni trigger bez rezerwy na „…”), test granic: równa szerokość, zero miejsca, jeden trigger;
  - pomiar `offsetWidth`; `ResizeObserver` na pasku i na każdym triggerze (font, oś `size`), jak w `indicator.ts`;
  - pasek ma szerokość rodzica (`inline-size: 100%`, `min-inline-size: 0`), nie treści, więc schowanie triggera nie zmienia jego szerokości i nie ma pętli;
  - trigger poza miejscem dostaje `data-overflow` i `disabled`: przepis `control` stawia go poza przepływem (`position: absolute`, `visibility: hidden`, mierzalny bez lustrzanej kopii DOM), Base UI przenosi z niego fokus i strzałki, a pigułka go pomija; przycisk „…” zawsze w DOM, schowany tak samo, gdy wszystko się mieści, więc jego szerokość jest znana;
  - „…” to `MenuTrigger` z ikoną lucide `ellipsis` i `aria-label={moreLabel}`, a w nim po jednym `MenuSubmenu` na ukryte menu; `MenubarMenu` rejestruje w kontekście paska swoją etykietę i funkcję wierszy, „…” renderuje z rejestru (bez czytania `Children`).
- Dopasowanie do miejsca (Base UI `collisionAvoidance`, sprawdzone, nie zakładane): menu przy prawej krawędzi okna przesuwa się w lewo, podmenu odwraca stronę (`inline-start`), a nachodzenie i wyrównanie wiersza działają po obu stronach; menu wyższe niż okno przewija się bez paska; separatory, nagłówki grup, skróty i podmenu jak w zwykłym menu.
- Dowody: `menubar.spec.ts` (menu i podmenu w oknie przy lewej i prawej krawędzi oraz przy 320–1920 px, podmenu odwrócone nachodzi tak samo, otwarcie bez blokady przewijania, najechanie przełącza tylko przy otwartym menu, pigułka trzyma otwarty trigger i idzie za fokusem, przelot co 8 ms bez skoku, strzałki ←/→ pomijają schowane menu, Tab trafia na widoczny trigger, Alt / F10 / Tab, „…” przy 320–1920 px bez migania na granicy, kotwica stoi przy wciśnięciu), B7 warstwy, `interaction.spec.ts`, sekcje na trzech stronach, `docs/menubar.md`, budżet B6, fixture strażnika dla reguły `data-overflow` w `control`.

### 5. Select

- Plan Selecta z makiety (`e3-select.md`) na wspólnej liście: pomiar wyrównania do pliku Q7 w `lib/`, `ALIGN_PASSES` i klatki zamiany (`SWAP_FRAMES` z literałami) do `lib/` albo przepisu, `docs/select.md`, dwie strony laboratorium, sekcja na edges, B6.

## Pliki

- nowe: `components/menu/list.tsx`, `components/menu/context-menu.tsx`, `components/menu/menubar.tsx`, `lib/bar-overflow.ts` (+ test), `docs/context-menu.md`, `docs/menubar.md`, testy Playwright, sekcje laboratorium
- zmieniane: `menu.tsx`, `select.tsx`, przepisy `surface`, `control`, `row` (tylko gdy pomiar pokaże potrzebę), `test/guards/contracts.test.ts` (lista Q7), `AGENTS.md` (lista Q7, mapa kodu), `docs/structure.md`
- bez zmian: silniki (wszystkie wartości już są: `follow`, `choice`, `scene`, `--ts-space-inset`, `--ts-shape-inset`)

## Decyzje

Przyjęte przez właściciela 2026-11-04 (rekomendacje prowadzącego), zapis: `docs/decisions/e3-menus.md`; spec F20 i tabela nierozstrzygniętych zaktualizowane.

## Następny element po tej rodzinie

- Nawigacja (`NavigationMenu` Base UI, nagłówek MangaShift web): linki i panele otwierane najechaniem; bierze z paska pigułkę, przelot popupu i „…” bez zmian, więc pasek buduje je bez założeń o wierszach menu.

## Czego nie robię

- animacji otwierania i zamykania menu (AGENTS.md: menu bez przejścia);
- animacji rozmiaru popupu przy przelocie (v2 to robiło; reguła: rozmiar w jednej klatce);
- lustrzanej kopii DOM do pomiaru „…”.
