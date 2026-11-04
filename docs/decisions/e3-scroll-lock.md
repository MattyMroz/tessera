---
kind: decision
created: 2026-11-04
---

# Blokada przewijania: Select bez blokady, przyklejone kolumny przy Context menu

## Objaw

Po otwarciu Selecta z listą nad triggerem (`align="trigger"`) albo Context menu:

- lewa lista i panel laboratorium (`position: sticky`) znikały z ekranu (strona przewinięta o 2739 px, górna krawędź kolumn 16 px przed otwarciem i −2723 px po nim; Chromium, okno 1440 × 900);
- znikał pasek przewijania strony, a strona przestawała się przewijać.

Wymaganie właściciela (04.11): element nie może zmieniać układu strony ani chować paska przewijania; lista powstaje lokalnie, jak w MangaShift.

## Przyczyna

- Base UI 1.9 blokuje przewijanie przy Selekcie w trybie `alignItemWithTrigger` niezależnie od `modal` (`SelectPositioner`: `useAnchoredPopupScrollLock((alignItemWithTriggerActive || modal) && open, …)`): ten tryb przypina listę do okna (`position: fixed`, bez śledzenia kotwicy), więc bez blokady rozjechałby się z triggerem. Wyłączyć się tego nie da.
- Context menu Base UI jest zawsze modalne (`MenuStore`: `modal` = `state.modal ?? true` dla rodzica `context-menu`, a `MenuRoot` nie przekazuje `modal` pod Context menu) i zawsze blokuje.
- Blokada (`@base-ui/utils/useScrollLock`) stawia `overflow: hidden` na elemencie, który przewija okno: na `<html>`, gdy ten ma własne `overflow`, w przeciwnym razie na `<body>`. `<body>` strony to przepis `surface` w wariancie `page`, czyli kontener `@container` (`container-type: inline-size`, potrzebny progom `@container` w `field`, `toggle-group`, `text` i `surface`). Ograniczenie układu kontenera wyłącza przeniesienie `overflow` z `<body>` na okno, więc `<body>` stawał się osobnym, nieprzewiniętym obszarem, a elementy `sticky` wracały na swoją pozycję na górze dokumentu.

## Wybór

1. Select: lista nad triggerem bez trybu `alignItemWithTrigger`. Positioner stoi zwykłym zakotwiczeniem pod triggerem (`alignItemWithTrigger={false}`, `positionMethod="absolute"`) z `sideOffset` i `alignOffset` liczonymi w `lib/select-align.ts` tak, by tekst wybranej opcji leżał na tekście wartości; przy braku miejsca lista przesuwa się (`collisionAvoidance: { side: 'shift', align: 'shift' }`), nie odwraca. Blokady nie ma, pasek zostaje, lista jedzie z triggerem przy przewijaniu. Błąd położenia tekstu ≤ 0,45 px (DSF 1 / 1,25 / 1,5, lupa 1× i 2×); poprzednia wersja (trzy przebiegi pomiaru po `position: fixed`) miała 0,00 px, ale tylko dzięki blokadzie.
2. Context menu zostaje modalne (Base UI nie pozwala inaczej). Żeby jego blokada nie zrywała przyklejonych kolumn, `:root:has(> [data-recipe='surface'][data-variant='page'])` dostaje `overflow-y: auto` w przepisie `surface` (wyjątek selektora `PAGE_SCROLLER` w `css-layers.ts`): `<html>` przewija okno sam, więc Base UI blokuje `<html>`, a `<body>` zostaje bez zmian. To samo chroni kolumny pod modalnym dialogiem. Pasek przy otwartym Context menu nadal znika (blokada); usunięcie jej wymaga Context menu zbudowanego na `Menu` z `modal={false}` i kotwicą w miejscu kursora: decyzja właściciela.

Zdecydował właściciel (04.11: „tak” na Select bez blokady i test); wyjątek `PAGE_SCROLLER` prowadzący z upoważnienia („działaj”).

## Odrzucone

- Zostawienie `alignItemWithTrigger`: blokuje stronę i chowa pasek wbrew wymaganiu.
- Nadpisywanie pozycji Positionera własnym `left`/`top` po każdym zapisie Floating UI (stary `watchAlignText` bez blokady): przy każdym przewinięciu jedna klatka w złym miejscu.
- Zdjęcie `container-type` z `<body>`: progi `@container` bez kontenera nie działają wcale.
- Kontener na `<html>`: ograniczenie na korzeniu też wyłącza przeniesienie `overflow` z `<body>`.
- Kolumny laboratorium jako `position: fixed`: łata w laboratorium; każda aplikacja z przyklejonym panelem miałaby ten sam błąd.

## Dowód

`apps/docs/tests/lab.spec.ts` (Chromium i WebKit):

- „opens a select over its trigger without locking the page, keeps its scrollbar and carries the list with the trigger”: na starym buildzie czerwony (`overflow-y` `<html>` = `hidden`), po zmianie zielony;
- „keeps the sticky columns of the page in the window while a context menu locks the scroll”: przed wyjątkiem `PAGE_SCROLLER` kolumny na −2823 px, po nim bez ruchu.
