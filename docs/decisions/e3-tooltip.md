---
kind: decision
date: 2026-11-02
stage: E3, poprawki tooltipa (zgłoszenia właściciela z 02.11)
---

# Tooltip: szczelina między przyciskami, start po przewinięciu, klik

Zastąpione 2026-11-08: tooltip nie stoi już na Base UI ani na `popup-flight.ts` (własny `lib/tooltip.ts`, `docs/decisions/e3-choices.md`, „Tooltip od nowa”). Zostają czasy (400 / 400 / 100 ms) i szczelina paska trzymana bez limitu.

Kto: wykonawca poprawki tooltipa na zlecenie prowadzącego, 2026-11-02, gałąź `fix/e3-tooltip`. Wzorzec zachowania: Base UI 1.9 (kod w `node_modules/@base-ui/react`), Radix Tooltip 1.2.16 (kod w `MangaShift/node_modules`), WAI-ARIA APG Tooltip i desktop MangaShift (`MangaShift/packages/ui/src/hover/tooltip-store.ts`); v2 tylko jako podpowiedź.

## 1. Tooltip znika w szczelinie między przyciskami

Pomiar (Chromium i WebKit, klatka po klatce z `requestAnimationFrame`): kursor z „Pan” na „Draw bubble” w pasku (`TooltipBar`, szczelina 4 px), dwa kroki w szczelinie po 20 ms. Przed poprawką 8–11 klatek bez żadnego tooltipa: Base UI przy zejściu z wyzwalacza włącza `safePolygon` (popup da się najechać), ruch w bok w szczelinie wychodzi z wielokąta, a domyślne `closeDelay` 0 zamyka popup od razu; wejście na sąsiada otwiera go na nowo (`isHoverCloseTransition`), a lot popupu startował z zapamiętanego miejsca (`recent`, łaska 400 ms). To samo w rzędzie samodzielnych tooltipów („Undo” → „Redo”) i w pasku `/screens/overlays`. Postój 40 ms w szczelinie bez ruchu w bok nie zamykał popupu (wielokąt go trzymał), więc błąd zależał od drogi kursora.

| Droga                                                                         | Źródło                                                                                                                                                                                                                                              | Wynik                                                                                                                                                                |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `closeDelay` wyzwalacza Base UI (wybrane)                                     | `TooltipTrigger.mjs` (`closeDelay`, `delay().close`), `useHoverReferenceInteraction.mjs`: `mouseenter` sąsiada czyści `openChangeTimeout` i przy otwartym popupie przełącza go od razu („Open immediately when moving between triggers while open”) | jeden popup paska przechodzi na sąsiada bez zamknięcia; w rzędzie samodzielnych grupa `Provider` otwiera sąsiada od razu i zamyka poprzedni (`useDelayGroup`)        |
| `skipDelayDuration` Radix                                                     | `react-tooltip/dist/index.mjs`: zejście zamyka od razu (`onTriggerLeave` → `handleClose`), pominięte jest tylko opóźnienie otwarcia następnego                                                                                                      | odrzucone: dziura między zamknięciem a otwarciem zostaje                                                                                                             |
| obszar grupy trzymający popup (desktop MangaShift `[data-tooltip-group]`, v2) | `tooltip-store.ts`: `overGroup` + `CLOSE_DELAY_MS = 100`                                                                                                                                                                                            | odrzucone: drugi, własny mechanizm zamykania obok Base UI (nasłuch `pointermove`, prostokąt grupy, anulowanie `onOpenChange`); `TooltipBar` nie ma własnego elementu |
| poszerzenie obszaru trafienia przycisku na pół szczeliny                      | —                                                                                                                                                                                                                                                   | odrzucone: klik i `:hover` w szczelinie trafiają w przycisk (zmiana wyglądu i zachowania)                                                                            |
| APG Tooltip                                                                   | wzorzec WAI-ARIA                                                                                                                                                                                                                                    | nie opisuje szczelin; wymaga zamknięcia na Escape i po zejściu, co zostaje                                                                                           |

Wybór: `closeDelay={TOOLTIP_CLOSE_DELAY}` (100 ms, `lib/tooltip-group.ts`, wartość desktopu MangaShift) na każdym wyzwalaczu, w pasku i poza nim. Bez własnego kodu: Base UI sam czyści zamknięcie przy wejściu na sąsiada. Wyjście poza pasek zamyka popup po 100 ms (desktop: tyle samo). Klawiatura (fokus, Escape) i dotyk (`mouseOnly`) bez zmian.

Aktualizacja 07.11: zastąpione standardem suwnicy (`docs/plans/e3-sliding.md`, `e3-choices.md`): `TooltipBar` ma własny element grupy i trzyma dymek w szczelinie bez limitu czasu, jak desktop. Pomiar przed zmianą: szczelina trzymała dymek ok. 415–430 ms (zegary Base UI), nie 100 ms.

Różnica wobec desktopu (stan z 02.11): desktop trzyma popup w całym prostokącie grupy bez limitu czasu, tu szczelina trzyma go 100 ms. Postój w szczelinie dłuższy niż 100 ms (ruch wolniejszy niż ok. 40–80 px/s przez szczelinę 4–8 px) zamyka popup. Jeśli właściciel chce trzymania przestrzennego, potrzebny jest element grupy (`TooltipBar` renderuje dziś tylko dzieci) — to zmiana API, do decyzji.

## 2. Tooltip startuje niżej i dolatuje na miejsce

Pomiar (`/components`, okno 1280 × 720): tooltip „Pan” otwarty, kursor schodzi, strona przewija się o 120 px (kółko albo `scrollBy`), kursor wraca na „Pan” w ciągu 400 ms. Pierwsza klatka popupu stała 120 px niżej (y 378 zamiast 258), potem lot do celu. Ten sam błąd przy otwartym popupie: fokus na „Pan”, przewinięcie, Tab na „Draw bubble” — lot startował 120 px od miejsca, w którym popup było widać.

Przyczyna: `lib/popup-flight.ts` pamiętał prostokąt ostatniego popupu we współrzędnych okna (`getBoundingClientRect`), a pozycjoner Base UI stoi we współrzędnych strony (`position: absolute` w `<body>`), więc przewinięcie okna nie zmienia jego `transform` i nie odświeża zapisu. Hipotezy (b) i (c) prowadzącego odpadły: popup przy otwartym tooltipie trzyma się wyzwalacza (pozycja strony), a odstęp liczy CSS (`margin` po stronie), nie pomiar.

Poprawka: zapis pamięta też przewinięcie okna z chwili pomiaru (`scroll` w `Shown`, domyślnie `window.scrollX/Y`), a start lotu to ten prostokąt przeniesiony o różnicę przewinięć (`seenAt`), dla popupu zamkniętego w łasce i dla popupu, który przechodzi na inny wyzwalacz. Dotyczy też podmenu (ta sama biblioteka). Ograniczenie: przewinięcie kontenera (nie okna) w ciągu 400 ms po zamknięciu nadal daje start ze starego miejsca; przy otwartym popupie Floating UI zmienia wtedy `transform`, więc zapis jest świeży.

## 3. Klik w przycisk z tooltipem

Wzorzec: Radix zamyka na `pointerdown` i `click`, a ponowne otwarcie ruchem blokuje `hasPointerMoveOpenedRef` do `pointerleave`; Base UI 1.9 zamyka na wciśnięcie (`useDismiss` z `referencePress`, `closeOnClick` domyślnie `true`), a po zamknięciu ustawia `blockMouseMove`, więc ruch po przycisku nie otwiera go znowu, dopiero wejście (`mouseenter`). W pasku sąsiad po kliknięciu otwiera się od razu (grupa `Provider`), z lotem z miejsca klikniętego.

Pomiar: każdy wyzwalacz tooltipa na `/components`, `/screens/overlays` i `/screens/edges` (54, Chromium i WebKit, build statyczny; `/components` także na `next dev`): klik i 1 s bez ruchu, a dla „Pan”, „Undo” i „Save” klik i 1 s drgań kursora po 1 px — ani razu ponowne otwarcie. Zgłoszenia nie odtworzyłem. Strażnik zostaje jako kontrakt (klik → brak tooltipa przez 1 s przy drgającym kursorze; zejście i powrót → otwiera). Do ustalenia z właścicielem: przeglądarka, strona i przycisk, na których to widzi.

## 4. Opóźnienie pierwszego otwarcia

Pomiar (od `pointerenter` wyzwalacza do `data-open` popupu): 626 ms (Chromium), 611 ms (WebKit) — domyślne `OPEN_DELAY` 600 ms Base UI (`tooltip/utils/constants.mjs`). Desktop MangaShift: 400 ms (`TOOLTIP_DELAY_MS`, `packages/ui/src/lib/motion.ts`). Radix: 700 ms domyślnie, desktop nadpisuje.

Wybór: `TOOLTIP_OPEN_DELAY = 400` w `lib/tooltip-group.ts` (obok `TOOLTIP_GROUP_GRACE` i `TOOLTIP_CLOSE_DELAY`), podane jako `delay` każdego wyzwalacza razem z `closeDelay` (`TRIGGER_TIMING` w `tooltip.tsx`). `delay` wyzwalacza wygrywa w Base UI z opóźnieniem `Provider`, a okno grupy (sąsiad od razu) liczy się przed nim, więc działa w pasku i poza nim, z `TooltipProvider` i bez.

## 5. Sąsiad w pasku po kliknięciu

Audyt prowadzącego zmierzył 712 ms do otwarcia sąsiada po kliknięciu narzędzia, ale kursor stał na klikniętym przycisku 2,2 s przed przejściem. Base UI po zamknięciu kliknięciem trzyma okno grupy 400 ms (`timeout` `Provider`, `useDelayGroup`); desktop MangaShift po zamknięciu (`hide()`) ustawia `warmUntil = now + skipDelayDuration` (300 ms), Radix uruchamia to samo okno `skipDelayDuration` (300 ms). Po 2,2 s okno wygasło w każdym z trzech wzorców, więc sąsiad czeka na pełne opóźnienie (teraz 400 ms, jak desktop). Przejście zaraz po kliknięciu: sąsiad otwiera się od razu (zmierzone przed tą poprawką i po niej). Bez zmiany kodu; strażnik pilnuje kontraktu.

## Strażnicy

`apps/docs/tests/tooltip.spec.ts`:

- „keeps a tooltip shown in every frame while the pointer crosses the gap…” (pasek `/components`, rząd Undo → Redo, pasek `/screens/overlays`): przed poprawką 8–11 pustych klatek w obu przeglądarkach.
- „closes the tooltip of a bar when the pointer leaves the bar through a gap”.
- „keeps the tooltip of Pan/Save closed after a click until the pointer leaves and comes back”: zielony także przed poprawką (błąd nieodtworzony).
- „opens a tooltip of a bar on its place right after the page scrolls by wheel/scrollBy”: przed poprawką pierwsza klatka 120 px (WebKit, kółko: 64 px) od miejsca.
- „keeps a tooltip of a bar on its trigger while the page scrolls and flies on to the next trigger from where it is seen”: przed poprawką start 120 px od widocznego miejsca.
- „opens the first tooltip the open delay after the pointer enters its trigger” (350–500 ms): przed poprawką 626 / 611 ms.
- „opens the tooltip of a neighbour in a bar at once right after a click” (< 100 ms): zielony także przed poprawką.

`packages/tessera/src/lib/popup-flight.test.ts`: dwa testy przewinięcia, czerwone po cofnięciu `seenAt`.

## Menu i lista

Pigułka menu (`/screens/overlays`, „Show bubbles” → separator 9 px → „Export”, kroki po 20 ms): w separatorze żaden wiersz nie jest podświetlony przez ok. 90 ms, ale pigułka zostaje widoczna (`data-visible="true"`, krycie 1) na poprzednim wierszu i potem jedzie na następny. Mrugania nie ma; nic nie zmieniane.
