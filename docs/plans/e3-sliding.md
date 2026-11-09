---
kind: plan
status: accepted
baseline: feat/e3-motion 00e682c + zmiany w drzewie (Switch 07.11)
created: 2026-11-07
---

# Plan: jeden standard suwnicy i Tooltip na nim

## Cel

Wszystko, co jedzie z A do B, działa według jednego zestawu reguł: szara pigułka (menubar, ToggleGroup, menu, Select, Switch) i przenoszony popup (tooltip w pasku, menu menubara, podmenu). Właściciel: „to jest jedna animacja”, „drugi raz nie zamierzam tego wykonywać” (07.11). Pierwszym elementem na nowym standardzie jest Tooltip (strzałka, kolor, strony, szczelina).

## Dowody (krok 1, 07.11)

Cztery badania: Tooltip w internecie, wzorzec właściciela (desktop MangaShift i v2), suwnica w internecie, inwentaryzacja Tessery. Pliki robocze: klatki i skrypty w scratchpadzie sesji. Wnioski poniżej.

### Co robią najlepsi

| Reguła                                                     | Kto                                                                                       | Dowód                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Pigułka jedzie przez `transform` i zmienia rozmiar         | Radix NavigationMenu (250 ms `ease`), desktop MangaShift (150 ms), Motion `layoutId`      | klatki Radix; `MangaShift/packages/ui/src/sliding/sliding-pill-style.ts`       |
| Przerwany ruch startuje z widocznego miejsca               | Radix (pomiar bez skoku), Emil Kowalski („transitions retarget, keyframes restart”)       | klatki Radix; skill Emila                                                      |
| W szczelinie pigułka i tooltip stoją na ostatnim elemencie | desktop MangaShift i v2: bez limitu, aż kursor wejdzie na następny albo wyjdzie z grupy   | klatki: postój 400 i 2000 ms bez zmiany; `tooltip-store.ts` (`overGroup`)      |
| Wejście do grupy i wyjście z niej w miejscu, bez lotu      | Radix (fade 200 ms), Base UI (100 ms), desktop (pigułka 50 ms)                            | klatki                                                                         |
| Tooltip: pierwszy po 300–500 ms, sąsiad od razu            | Kevin Du (400 / 0, okno 300 ms), Base UI, Radix, Emil, NN/g (300–500 ms)                  | `kevdu.co/reads/tooltip-delay`, dokumentacje                                   |
| Tooltip w pionowym pasku z prawej                          | desktop MangaShift (`isVertical ? 'right' : 'bottom'`)                                    | `workspace-sidebar.tsx:51`, `tools-rail.tsx:79`                                |
| Tooltip ze strzałką (część opcjonalna)                     | shadcn, Geist, demo Base UI, desktop i v2 (kwadrat 8–10 px obrócony o 45°); bez: Kevin Du | kod i zrzuty                                                                   |
| Kolor tooltipa odwrócony względem trybu                    | shadcn, Geist, Material, desktop i v2; jak powierzchnia: Kevin Du, demo Base UI           | pomiar; wymaganie właściciela z notatek v2: „w ciemnym jasny, w jasnym ciemny” |
| Ruch wyłączony (`prefers-reduced-motion`): zostaje krycie  | Emil Kowalski, Kevin Du                                                                   | skill Emila, CSS Kevina                                                        |

Przelot jednego dymka tooltipa między przyciskami: desktop i v2 go mają (właściciel tego chce, W16, F15), u innych brak dowodu na klatkach (Base UI i shadcn skaczą, Emil radzi kolejny tooltip bez animacji). Zostaje przelot, bo to wzorzec właściciela.

### Stan Tessery (inwentaryzacja na żywo, `/` na 4450)

Mechanizmy: pigułka `lib/indicator.ts` + fizyka `lib/flight.ts`, popup `lib/popup-flight.ts`, czasy z silnika `motion`. Niespójności z dowodem:

1. Obecność pigułki zależy od prędkości myszy. Decyduje chwilowe krycie z CSS (`gone()`, krycie < 0,05): kto stoi poza celem ponad ok. 130 ms, traci lot i pigułka zapala się w nowym miejscu bez ruchu; kto szybciej, dostaje lot (`indicator.ts:188-198`; klatki `tgf-*`).
2. Powrót w trakcie gaśnięcia daje błysk: krycie skacze do 1 na starym miejscu i dopiero potem pigułka leci (`[data-visible]` bez przejścia na wejściu; klatki `bar-reenter-50/100`).
3. Szczelina ma trzy reguły: pigułka stoi bez limitu (`stickyHover`), tooltip ok. 415–430 ms (zegary Base UI, nie Tessery; `e3-tooltip.md` mówi 100 ms, to nieaktualne), popup menu ma łaskę 150 ms.
4. Łaski i czasy to osobne stałe w kilku plikach: lot popupu menu 150 ms, tooltipa 400 ms, zamknięcie tooltipa 100 ms, gaśnięcie pigułki 150 ms.
5. Pigułki `active`, `raised` i `data-off` znikają od razu, hover gaśnie 150 ms.
6. Samodzielny tooltip w rzędzie nie leci (zgodne z W16), przez ok. 10 ms widać dwa popupy naraz.

Zgłoszenie właściciela „menubar: w przerwie żaden element nie jest zaznaczony, pigułka znika” nie odtworzyło się w laboratorium: wyzwalacze menubara stykają się (szczelina 0 px), krok co 1 px dał krycie 1 w każdej klatce. Pasuje za to do punktów 1 i 2 (wyjście z paska i powrót, szybkie przejście przez wybrany element). Do potwierdzenia z właścicielem: gdzie i jak to widzi (D8).

## Standard suwnicy (propozycja)

Pojęcia: **suwnica** to jedna rzecz, która jeździ w obrębie **grupy** (kontener pigułki, `TooltipBar`, pasek menubara, lista podmenu). **Cel** to element pod kursorem albo fokusem.

- **S1. Jedna rzecz.** W grupie jest jedna pigułka hover, jedna pigułka wyboru i jeden popup. Nigdy dwie kopie ani kawałki (AGENTS: „nie udawaj zmiany rozmiaru kopiami DOM”).
- **S2. Szczelina.** Gdy kursor jest w grupie, ale nie nad celem (szczelina, separator, padding, element wyłączony), suwnica stoi na ostatnim celu bez limitu czasu. Gaśnie albo zamyka się dopiero po wyjściu z grupy. Dotyczy pigułek (już tak jest) i tooltipa w pasku (dziś Base UI zamyka po ok. 415 ms). Wzorzec: desktop MangaShift.
- **S3. Wejście z niczego.** Pigułka zapala się na celu bez lotu, popup otwiera się na miejscu bez przejścia (W16).
- **S4. Wyjście z grupy.** Pigułka hover gaśnie w miejscu przez `--ts-motion-hover-out` (150 ms). Popup zamyka się bez przejścia (W16).
- **S5. Ciepła grupa.** Po wyjściu z grupy pamiętamy ostatnie widoczne miejsce przez okno ciepła. Powrót w tym oknie: suwnica leci z ostatniego widocznego miejsca, a krycie rośnie od bieżącej wartości, nie skacze do 1. Po oknie: S3. O locie decyduje zegar, nie krycie z CSS, więc wynik nie zależy od prędkości myszy (usuwa `gone()`). Okno: pigułki i menu = `--ts-motion-hover-out` (150 ms, koniec gaśnięcia), tooltip = okno grupy 400 ms (`TOOLTIP_GROUP_GRACE`, sąsiad otwiera się wtedy od razu, więc też leci). Jedno źródło: czas z silnika `motion`, okno tooltipa jako nazwana stała obok opóźnień.
- **S6. Przerwanie.** Nowy cel w trakcie lotu: lot startuje z widocznej pozycji (jest).
- **S7. Rozmiar.** Dziś rozmiar zmienia się w pierwszej klatce lotu, a jedzie tylko `translate` (AGENTS: „zmiana rozmiaru dzieje się w jednej klatce”). Desktop interpoluje szerokość pigułki, właściciel chce, by „element się powiększał i pomniejszał”. Wybór techniki to D1, na wariantach na żywo.
- **S8. Czas i krzywa.** Pigułka hover i popup: `follow` 100 ms `ease-out` (decyzja właściciela 06.11). Wybór: `choice` 220 ms z odbiciem. Bez nowych czasów elementu.
- **S9. Ruch wyłączony** (`data-motion="off"`, `prefers-reduced-motion`): suwnica przeskakuje, gaśnięcie zostaje (jest).
- **S10. Strażnik.** Jeden test suwnicy dla każdej grupy w laboratorium: przejście przez szczelinę z postojem 0 / 150 / 400 ms (0 pustych klatek), wyjście i powrót po 50 / 100 / 300 ms (brak błysku krycia, lot tylko w oknie ciepła), szybkie i wolne przejście przez wybraną opcję daje ten sam wynik.

## Karta Tooltipa

- **Cel.** Podpowiedź nazwy i skrótu przy przyciskach ikon: paski narzędzi (poziome i pionowe), samodzielne przyciski. Komponenty złożone: pasek edytora, boczne szyny MangaShift.
- **Części.** `Tooltip` (wyzwalacz Base UI `Tooltip.Trigger` na dziecku), `TooltipBar` (jeden popup grupy, `Tooltip.createHandle`), `TooltipProvider` (okno grupy). Popup: przepis `surface`, wariant `tooltip`. Nowa część: strzałka (`Tooltip.Arrow` Base UI: ustawia oś poprzeczną i `data-side` po przerzuceniu, oś główną daje CSS).
- **Stany.** Zamknięty; czekanie 400 ms; otwarty; sąsiad w oknie grupy (od razu, z lotem w pasku); szczelina w pasku (stoi, S2); wyjście (zamknięcie po 100 ms, S4); klik (zamyka do wyjścia kursora); fokus z klawiatury (od razu); Escape; dotyk (bez tooltipa, `mouseOnly`). Bez hovera, wciśnięcia i wyboru: tooltip nie jest kontrolką.
- **Strona.** Domyślnie nad wyzwalaczem, pod nim przy braku miejsca (Base UI przerzuca domyślnie: `collisionAvoidance` `flip`). W pionowym pasku z prawej, z lewej przy braku miejsca (D5).
- **Rozmiary** `xs`–`xl` z geometrii kontrolki (jest, strażnik `scale.spec.ts`); strzałka rośnie z rozmiarem (D3).
- **Osie.** `corners` i `curve` (promień kontrolki, jest), `density` (odstęp `--ts-space-inset`), `motion` (lot), tryb jasny i ciemny (D4).
- **Znane błędy wzorców.** v2: strzałka Radixa nie nadążała za zmianą rozmiaru (obejście z `MutationObserver`); wejście animowane wbrew W16; własny magazyn zamykania obok biblioteki. Desktop: szerokość skacze w pierwszej klatce, tekst bez przejścia. Base UI bez `Arrow` nie ma strzałki; z `Arrow` oś główną trzeba dać w CSS.

## Decyzje właściciela

- **D1. Rozmiar w locie (S7).** Pokażę trzy warianty na żywo na pigułce menubara i dymku tooltipa:
  - R1: skok rozmiaru na starcie, jedzie tylko `translate` (dziś; zgodne z regułą „rozmiar w jednej klatce”, różnica widoczna przy tooltipach o różnej długości);
  - R2: `scale` w osi ruchu z korektą rogów (tylko kompozytor; ryzyko widocznego spłaszczenia rogów kapsuły w trakcie);
  - R3: nazwany wyjątek `width` / `height` tylko dla suwnicy (jak desktop; praca głównego wątku w klatce ruchu, mierzona śladem jak wyjątek B2).
    Rekomendacja: decyzja po obejrzeniu; R2, jeśli rogi nie zdradzą skalowania, inaczej R3 z pomiarem.
- **D2. Szczelina tooltipa w pasku (S2).** `TooltipBar` dostaje własny element grupy (dziś renderuje tylko dzieci), a popup trzyma się, dopóki kursor jest w nim. To zmiana API (pasek otacza przyciski) i odwraca odrzucenie z 02.11 („drugi mechanizm zamykania”). Rekomendacja: tak, bo to wzorzec właściciela i S2; mechanizm to `closeDelay` Base UI przedłużany tylko w obrębie grupy, bez własnego magazynu.
- **D3. Strzałka.** Wariant: ze strzałką (domyślnie, jak desktop, v2 i wymaganie z 06.11) i bez. Rozmiar: nowe wyjście silnika `size` liczone z rozmiaru (np. połowa `--ts-size-gap` albo wysokość wersalików / 2), kolor = tło tooltipa, odstęp od wyzwalacza = `--ts-space-inset` + wystawanie strzałki. Rekomendacja: tak.
- **D4. Kolor.** Odwrócony względem trybu: w jasnym ciemny dymek z jasnym tekstem (jest), w ciemnym jasny z ciemnym (dziś ciemnoszary `#2a2a2a`, niezgodny z wymaganiem z v2). Zmiana w generatorze koloru (`scripts/palette.ts`). Rekomendacja: odwrócony.
- **D5. Strona w paskach.** `TooltipBar` czyta oś paska: poziomy → nad (przy braku miejsca pod), pionowy → z prawej (przy braku miejsca z lewej); `side` zostaje jako jawne nadpisanie. Desktop stawia tooltip poziomego paska pod spodem, właściciel mówi „zazwyczaj z góry”. Rekomendacja: z góry, zgodnie ze słowami właściciela.
- **D6. Samodzielny tooltip obok innego.** W16 mówi: otwiera się w miejscu, bez lotu. Rekomendacja: zostaje (lot tylko w `TooltipBar`), usunąć tylko 10 ms dwóch popupów naraz.
- **D7. Wejście i wyjście tooltipa.** Wszystkie zmierzone wzorce poza desktopem mają krótkie przejście krycia (100–150 ms); W16 i desktop: zero. Rekomendacja: zero (W16).
- **D8. Menubar.** Gdzie widać znikanie pigułki: który pasek, jaki ruch (wyjście z paska i powrót? menu otwarte?). Bez tego poprawka idzie przez S5 i strażnik S10.

## Kolejność

1. Warianty D1 na żywo (krok 2 skilla `tessera-element`), wybór właściciela do `e3-choices.md`.
2. Plan wykonania (krok 3) dla dwóch spójnych rezultatów, każdy z oceną właściciela:
   - **Rezultat A: standard suwnicy** w `lib/indicator.ts`, `lib/flight.ts`, `lib/popup-flight.ts`, silniku `motion` i przepisie `indicator` (S2–S7, okno ciepła, usunięcie `gone()`), strażnik S10 dla wszystkich grup, opis standardu w `AGENTS.md` (sekcja „Wydajność i ruch”) i specyfikacji (W14).
   - **Rezultat B: Tooltip** na standardzie (D2–D7): szczelina w pasku, strzałka, kolor, strony, sekcja laboratorium z pionowym paskiem przy prawej krawędzi okna (przerzucenie), testy w `tooltip.spec.ts`, poprawka nieaktualnego „100 ms” w `e3-tooltip.md`.
3. Menubar sprawdzony na rezultacie A (D8).

## Czego nie robimy

- Zmiany czasów i krzywych kategorii `motion` (wybór 06.11 zostaje).
- Animacji wejścia popupu (W16).
- Kopii DOM i kawałków pigułki do udawania zmiany rozmiaru.
- Własnego magazynu tooltipów obok Base UI.
