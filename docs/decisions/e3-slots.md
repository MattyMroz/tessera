---
kind: decision
date: 2026-11-01
stage: E3, fundament między rundą C a D
---

# Sloty komponentów złożonych i odporność na overflow

Kto: prowadzący z upoważnienia właściciela („przy wyborze wybieraj te najlepsze”), 2026-11-01. Status: wdrożone, gotowe do oceny; pozycje oznaczone **do przejrzenia** zmieniają wygląd albo API ocenione w rundach A–C.

Wnioski właściciela, które to rozstrzyga (masterplan, „Wnioski właściciela 01.11”): „Chcę dialog z nazwą i 2 przyciskami — nie piszemy stylów, tylko składamy. Każdy element ma automatycznie wskakiwać na swoje miejsce; zablokować jego położenie w miejscu, w którym nie może być.” oraz „Komponenty muszą być odporne na overflow.”

## 1. Jeden model slotów

**Wybór.** Komponent złożony to gospodarz i nazwane części. Ta sama rola ma tę samą nazwę części i ten sam slot (`data-slot`) w każdej rodzinie:

| Rola                 | Nazwa części   | Slot                    | Gdzie                                                        |
| -------------------- | -------------- | ----------------------- | ------------------------------------------------------------ |
| tytuł                | `…Title`       | `title`                 | Dialog, Popover                                              |
| opis                 | `…Description` | `description`           | Dialog, Popover, Field                                       |
| stopka z przyciskami | `…Actions`     | `actions`               | Dialog (też okno `AlertDialog` i `confirm()`), Popover, Card |
| „×” w rogu           | `…Dismiss`     | `close`                 | Dialog, Popover                                              |
| przycisk zamykający  | `…Close`       | — (kontrolka, nie slot) | Dialog, Popover                                              |

| Komponent            | Gospodarz              | Części                                                                                     | Forma                             |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- |
| Dialog, Alert Dialog | `DialogPopup`          | `DialogTitle`, `DialogDescription`, `DialogActions` (było `DialogFooter`), `DialogDismiss` | części                            |
| Popover              | `PopoverPopup`         | `PopoverTitle`, `PopoverDescription`, `PopoverActions` (nowa), `PopoverDismiss`            | części                            |
| Card                 | `Card`                 | `CardHeader` (tytuł, opis, akcja jako propsy), `CardActions` (było `CardFooter`)           | części, nagłówek z propsami       |
| Field                | `Field`                | `FieldLabel`, `FieldDescription`, kontrolka, `FieldError`                                  | części                            |
| Alert                | `Alert`                | `icon`, `title`, `children` (opis)                                                         | propsy                            |
| Menu                 | `Menu` → `MenuContent` | `MenuItem` z `icon`/`trail`, `MenuGroupLabel`, `MenuSeparator`                             | części Base UI, wiersz z propsami |

Stare nazwy (`DialogFooter`, `CardFooter`, slot `footer`) zniknęły w tym samym diffie, razem z wywołaniami w laboratorium, testach i dokumentach. Laboratorium nie ma już wierszy przycisków z klasami układu w popoverze: to `PopoverActions`.

**Dlaczego.** Propsy zostają tam, gdzie już były (Alert, nagłówek karty, wiersz menu): tam część nie może stanąć gdzie indziej, bo jej nie ma poza propsem. Dialog, Popover i Field zostają przy częściach, bo części Base UI wiążą tytuł i opis z `aria-labelledby` i `aria-describedby`, a zlecenie i W5 nazywają je wprost (`DialogDismiss`, `PopoverDismiss`).

## 2. Kolejność slotów: wymuszona, nie przestawiana

**Wybór.** Gospodarz ma jedną kolejność slotów: Dialog i Popover `title`, `description`, treść, `actions`, `close`; Card `header`, treść, `actions`; Field `label`, `description`, kontrolka i treść, `error`. Kolejność w DOM jest kolejnością czytania, Tab i obrazu. Slot w złej kolejności jest błędem (punkt 3), a nie przestawia się sam.

**Opcje odrzucone.**

- **`order` albo `grid-template-areas` w przepisie** (propozycja zlecenia): obraz rozjechałby się z kolejnością Tab i czytnika (WCAG 1.3.2, 2.4.3), np. przyciski napisane przed tytułem dostają fokus pierwsze, choć stoją na dole; przycięcie pierwszej i ostatniej linii tekstu (W5) opiera się na `:first-child` i `:last-child`, więc przestawiony tytuł straciłby przycięcie; strażnik przepisów dopuszcza tylko liczby `-1`, `0`, `1`, a czterech rang (tytuł, opis, treść, stopka) nie da się nimi zapisać; nazwane obszary siatki kładą drugi i dalszy element treści za stopką.
- **Przestawianie dzieci w React według typu elementu:** w laboratorium dialogi składają komponenty serwera, a Flight serializuje komponent klienta w pozycji typu jako leniwą referencję (`$L`), więc `child.type === DialogTitle` zawodzi i porządek zależałby od tego, gdzie powstał JSX.
- **Wszystkie sloty jako propsy** (`<DialogPopup title actions dismiss>`): najmocniejsza blokada (typ), ale przepisuje API Dialogu i Popovera ocenione w rundach i odbiega od wzoru zlecenia (`<DialogTitle>`, `<DialogActions>`); zostaje tam, gdzie już jest.

## 3. Blokada złego miejsca

**Wybór.** `lib/slot.ts`, dwa sprawdzenia, oba rzucają błąd zawsze (nie tylko w trybie deweloperskim), jak Base UI dla swoich części:

- `usePart(host, part)`: gospodarz daje kontekst ze swoją nazwą, a każda część z dziećmi zeruje go dla swoich dzieci. Część poza gospodarzem, w innym gospodarzu albo w innej części (`DialogDismiss` w `DialogActions`, `CardActions` jako akcja `CardHeader`, `FieldError` w `FieldLabel`) rzuca przy renderze: `Tessera: <DialogDismiss> is a part of <DialogPopup>: place it inside <DialogPopup>, outside its other parts.` Błąd przy renderze łapie też `next build` (prerender).
- `useSlotOrder(host, order)`: sprawdza `data-slot` dzieci gospodarza przy podpięciu elementu (ref) i po każdym renderze gospodarza (`useLayoutEffect`): `Tessera: <DialogPopup> lays out its slots in the order title, description, content, actions, close, so the title cannot come after the actions.` Sprawdzenie w ref jest konieczne, bo popup montuje się w portalu przy otwarciu bez ponownego renderu gospodarza; sam efekt nie widział elementu (błąd znaleziony ręcznym zepsuciem, Pułapki w AGENTS.md).

**Opcje odrzucone.**

- **Typy** (`children` przyjmujące tylko dozwolone części): TypeScript typuje każde wyrażenie JSX jako `JSX.Element`, więc `children` nie odróżni `<DialogTitle>` od `<div>`; `expectTypeOf` nie ma czego sprawdzić.
- **Sam Base UI:** rzuca tylko przy braku `Root` (`DialogRootContext is missing`), więc tytuł dialogu w popoverze otwartym z dialogu albo „×” w stopce przechodzą.
- **Reguła ESLint konsumenta:** widzi tylko literalny JSX w jednym pliku, a nie kompozycję przez komponenty konsumenta; zostaje możliwym uzupełnieniem dla jedynej luki niżej.

**Znane ograniczenie.** Część owinięta w element konsumenta wewnątrz gospodarza (`<DialogPopup><div><DialogTitle>`) renderuje się: kontekst przechodzi przez `<div>`, a sprawdzenie kolejności widzi tylko bezpośrednie dzieci. Warunek zastąpienia: pierwszy taki przypadek w aplikacji albo reguła ESLint.

**Testy i dowód oblania.** `packages/tessera/src/lib/slot.test.ts` (16 testów: kolejność jako czysta funkcja, 10 złych miejsc przez `renderToString`): z wyłączonym `usePart` 10 z 16 oblewa. `apps/docs/tests/edges.spec.ts` „blocks a part out of the slot order…”: sekcja Composition na `/screens/edges` ma dwa popovery z błędem w granicy błędu laboratorium (`blocked.tsx`) i pokazuje komunikat reguły. Ręczne zepsucie (akcje przed tytułem w dialogu sekcji krawędzi) dało `pageerror` z komunikatem kolejności; przed poprawką ref sprawdzenie milczało.

## 4. Akcje w stopce

**Wybór.** Jedna reguła przepisu `surface` dla Dialogu, Popovera i Karty (`> [data-slot='actions']`): przyciski w rzędzie na końcu z odstępem `inset`, główna akcja jako ostatnia w DOM, więc stoi na końcu rzędu; w kontenerze węższym niż `narrow` kolumna, akcja na dole (jak Confirm A); w `alertdialog` przyciski równej szerokości. Karta i popover mają tę samą stopkę co dialog. **Opcja odrzucona:** przestawianie akcji głównej przez `order` (ten sam rozjazd z Tab co w punkcie 2).

## 5. „×” i akcja nagłówka karty koncentryczne w każdym rozmiarze (do przejrzenia)

**Problem.** Test kompozycji przy rogach `md` i rozmiarze `sm` pokazał „×” o promieniu 6,9 px zamiast koncentrycznego 9,9 px: promień kontrolki w powierzchni to `min(własny, inner)`, a własny promień małej kontrolki jest mniejszy niż koncentryczny. Przy `lg` oba się pokrywały, dlatego wcześniejszy strażnik (tylko `lg`) tego nie widział.

**Wybór.** Nowe wyjście silnika `shape`: `--ts-shape-concentric` = `min(--ts-shape-inner, wysokość / 2)`; przepis `control` daje je slotowi `close` i kontrolce w akcji nagłówka karty. **Opcje odrzucone:** dzielenie w przepisie (literał `2` zakazany w przepisach); zmiana `--ts-shape-control-radius` dla wszystkich kontrolek w powierzchni (zaokrągliłaby każdy mały przycisk na karcie, nie tylko ten w rogu). **Skutek wyglądu:** „×” przy `xs` i `sm` jest bardziej okrągły niż sąsiednie przyciski tego rozmiaru.

## 6. Overflow: jawne zachowanie każdego slotu

| Slot                                                                                                     | Zachowanie przy braku miejsca                                                                  | Reguła                                                                                              |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| etykieta kontrolki (Button, Badge, Kbd, opcja ToggleGroup, ButtonGroup, wiersz Menu, wyzwalacze popupów) | jedna linia, wielokropek; kontrolka nigdy szersza niż rodzic, nigdy węższa niż wysoka          | `control`: `[data-slot='label']` z `text-overflow: ellipsis` (było), `max-inline-size: 100%` (nowe) |
| tytuł, opis, błąd, Alert, Tooltip, Text, Heading, każdy tekst w powierzchni                              | zawijanie, słowo dłuższe niż linia łamie się w dowolnym miejscu                                | `text` i `surface`: `overflow-wrap: anywhere` (Tooltip miał je sam, teraz z powierzchni)            |
| stopka `actions` i akcja nagłówka karty                                                                  | przyciski kurczą się razem do swojej wysokości; slot może być węższy niż etykiety              | `surface`: `min-inline-size: 0`                                                                     |
| popup, Menu, Dialog, Alert Dialog                                                                        | nigdy szerszy ani wyższy niż miejsce w oknie; dłuższa treść przewija się w pionie, nigdy w bok | `surface` (było, F16)                                                                               |
| Textarea                                                                                                 | zawijanie z łamaniem słów; przewija się tylko z `maxRows`                                      | `control` (było)                                                                                    |
| Input                                                                                                    | wartość przewija się w natywnym polu                                                           | natywne                                                                                             |

**`anywhere` czy `break-word`.** Wybór: `anywhere`. `break-word` łamie słowo dopiero przy układzie linii, ale nie zmienia najmniejszej szerokości treści (min-content), więc w siatce `1fr auto` nagłówka karty, w `fit-content` dialogu i w elemencie flex z automatycznym minimum długi URL dalej rozpycha rodzica. `anywhere` liczy możliwość złamania także do min-content. Koszt: w ciasnym rzędzie flex tekst może złamać się w środku słowa zamiast ścisnąć sąsiada bardziej; zdarza się tylko tam, gdzie bez tego coś by się nie zmieściło.

**Dlaczego `max-inline-size` i `min-inline-size: 0`.** Najmniejsza szerokość kontrolki to cała jej etykieta (etykieta nie łamie linii, a `min-width: 0` etykiety nie zmienia jej min-content), więc kontrolka `inline-flex` w bloku węższym niż etykieta wychodziła poza rodzica, a slot z kontrolkami jako element siatki dostawał automatyczne minimum = cała etykieta (karta 120 px rozpychana do 837 px). **Odrzucone:** `max-inline-size: 100%` na całej powierzchni (test zielony bez niej, więc jej nie ma); `contain: inline-size` na etykiecie (zeruje też max-content, przycisk traciłby szerokość etykiety).

**Testy i dowód oblania.** `/screens/edges`, sekcja Overflow: każdy komponent (zbiór równy sekcjom krawędzi, sprawdza test) z URL-em ok. 120 znaków, ścieżką Windows, hashem 64 znaki, niemieckim złożeniem i liczbą 30 cyfr w ramce 120 px (węższej niż minimum komponentu), osiem popupów (długie menu, popover, dialog, okno potwierdzenia, tooltip, przycisk w karcie w dialogu, wysoki dialog i popover). `edges.spec.ts`: w jasnym, ciemnym, przy zoomie 200 % i oknie 320 px żaden element nie wychodzi poza ramkę (prostokąty w poziomie i pionie poza przycinającymi przodkami), nic nie przewija się w bok poza polem, polem tekstowym i etykietą z wielokropkiem (`overflowProblems`), popupy mieszczą się w oknie (`windowProblems`); w oknie 320 × 480 wysoki dialog i popover mieszczą się i przewijają. Te same sprawdzenia przechodzą przez ramki 320 px sekcji krawędzi. Zepsucie każdej reguły osobno: bez `anywhere` oblewa Alert, karta, okno potwierdzenia i inne; bez `max-inline-size` kontrolki oblewa przycisk, Badge, wyzwalacze; bez `min-inline-size: 0` oblewa karta (837 px w 120 px). Kompozycja: `symmetry.spec.ts` „pads a card, a popover and a dialog composed of their parts alone…” (rogi `none`, `md`, `full` × rozmiary `sm`, `lg`, `opticalGaps`).

**Koszt w skrajnej szerokości (do przejrzenia).** Nic nie wychodzi poza ramkę 120 px, ale wygląd jest tam słaby: w karcie bez `container` z długą akcją nagłówka kolumna akcji (`auto`) bierze wolne miejsce przed kolumną tytułu (`1fr`), więc tytuł z URL-em łamie się po jednym znaku, a przyciski stopki zwężają się do swojej wysokości bez czytelnej etykiety; pole w takiej ramce przy szerokiej stronie zostaje w dwóch kolumnach (próg pyta kontener strony, F17). Zalecenie dla konsumenta: karta w wąskiej lub zmiennej kolumnie dostaje `container`, wtedy poniżej `narrow` akcja schodzi pod tytuł. Opcje na później, każda zmienia oceniony wygląd: nagłówek karty na `flex-wrap` (akcja schodzi pod tytuł, gdy się nie mieszczą, także w średnich szerokościach) albo próg kolumny akcji (np. połowa nagłówka) jako nowa liczba silnika. Zrzut `e3-choices/slots-overflow-1280.png`.

**Zmiana istniejącego testu.** `edges.spec.ts` „keeps every control at least as wide as…” porównywał szerokość kontrolki z jej wysokością. Textarea w ramce 120 px rośnie z tekstem (W1 i `field-sizing` pozwalają) i jest wyższa niż szeroka, więc test porównuje teraz szerokość z mniejszą z wartości: wysokość pudełka albo wysokość jednej linii rozmiaru (`--ts-size-height`). Dla kontrolek jednowierszowych to ta sama asercja co wcześniej (dla nich obie wartości są równe), więc kontrakt W1 („`min-width` = wysokość”) nie słabnie.

Zrzuty: `e3-choices/slots-composition-1280.png`, `slots-composition-320.png`, `slots-overflow-1280.png`, `slots-overflow-320.png`.
