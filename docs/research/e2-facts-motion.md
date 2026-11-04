---
kind: research
stage: E2
date: 2026-10-31
scope: fakty o ruchu i slidingu: stary kit `@mangashift/ui`, strona mangashift.com, Tessera v2
---

# Fakty o ruchu i slidingu (stary kit, strona, v2)

## Odpowiedź w skrócie

1. **Stary kit nie ma bounce w slidingu.** Pigułka jedzie po `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` (krzywa bez przestrzału) przez 150 ms (hover) albo 200 ms (active) i animuje `width`/`height` przez CSS `transition`. Przestrzał w starym kicie mają tylko `--ease-spring` (thumb switcha) i `--ease-pop` (wskaźnik color pickera).
2. **Nagłówek mangashift.com nie korzysta ze slidingu starego kitu.** Strona na branchu wyjętym z `main` (worktree `fix/tracked-docs-page-and-test-decoding`) robi pigułki przez `framer-motion` `layoutId` ze sprężyną `stiffness 420, damping 36` (nawigacja), `480/38` (panel menu, przełącznik języka) i `380/34` (`TabPill`). Współczynnik tłumienia ζ ≈ 0,87–0,88: przestrzał 0,3–0,4% dystansu (0,3 px na 100 px), 1% od celu po ok. 215–245 ms, ogon do ok. 500 ms. „Lekki bounce” na stronie to więc miękkie hamowanie z prawie niewidocznym przestrzałem, a nie odbicie. **Trzeba potwierdzić z właścicielem, co ma na myśli** (niżej, „Niewiadome”).
3. **Wyraźny bounce ma dopiero v2 (`elastic`)**: 220 ms, przestrzał = 0,1 × wysokość kontrolki (np. 2,8 px przy 28 px), najwyżej połowa dystansu, szczyt w 60% czasu, a przy ścianie rodzica pigułka się zgniata. Krzywa jest zapisana jako `linear()` (łamie Q5), a ruch rusza `width`/`height` (łamie Q3 i Z4). Menu v2 jedzie zawsze `firm`, także przy wyborze `elastic`.
4. Przelot okienek (`popup-slide`) w starym kicie jest czysto `transform` (150 ms, `--ease-standard`). v2 dodała morf rozmiaru (`width`/`height` popupu i zamrażanie wrappera), który łamie Q3.
5. Zachowania do przeniesienia 1:1 (sticky przy separatorze i przerwie, hover pigułka nie wchodzi pod active, pojawienie się bez przelotu, chowanie przez opacity z zapamiętaną pozycją, start przelotu popupu od celu poprzedniego) mają testy w obu kitach (pytanie 5).

## Zakres, źródła i stan

Stan plików na 2026-10-31, bez komend git (zakaz z briefu). Skróty ścieżek:

- **KIT** = `MangaShift/packages/ui/src/` (working tree, branch `refactor/tessera-motion`).
- **V2** = `MangaShift/tessera/packages/tessera/src/` (ten sam working tree; v2 zamrożona).
- **SITE** = `MangaShift/.worktrees/docs-page-and-test-decoding/web/src/` (branch `fix/tracked-docs-page-and-test-decoding`, worktree założony 31.10 o 12:19, ref `main` zmieniony o 11:41). `web/` w tym worktree zależy tylko od `@mangashift/ui` i `framer-motion ^13.4.0` (`web/package.json:14,16`). To, że ten worktree odpowiada `main` i wdrożonej stronie, jest **wnioskiem z dat i zależności**, nie sprawdzeniem gitem.
- Uwaga: `web/` w głównym working tree (branch `refactor/tessera-motion`) stoi już na v2 (`NavbarCentered`, preset `mangashift-site` z `sliding: 'elastic'`, V2 `lib/theme-data.ts:269`). To nie jest wersja na produkcji.
- `KIT` na `main` ma inną, płaską strukturę (`sliding-pill*.ts`, `sliding-menu.tsx` w korzeniu `src/`). Brief wskazał wersję z working tree i tę opisuję.

## 1. Tokeny ruchu

### Stary kit (KIT `styles/ui.css`)

| Token                 | Wartość                                      | Gdzie użyty (wybór)                                                                                                                                                                                                            | Przestrzał          |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `--motion-fast`       | 50ms (`:86`)                                 | przez `--motion-fade`                                                                                                                                                                                                          | —                   |
| `--motion-base`       | 100ms (`:87`)                                | `.btn-press` transform/opacity (`:252`), `--motion-press`, `--motion-state`                                                                                                                                                    | —                   |
| `--motion-slide`      | 150ms (`:88`)                                | pigułka hover (`sliding/sliding-pill-style.ts:26`), przelot popupu (`sliding/popup-slide.ts:54`), minimalne trzymanie wciśnięcia (`sliding/sliding-pill-trackers.ts:163`, `lib/motion.ts:49`), switch (`toggle/switch.tsx:31`) | —                   |
| `--motion-emphasized` | 200ms (`:89`)                                | pigułka active (`sliding-pill-style.ts:26`), box-shadow neonu (`:176`)                                                                                                                                                         | —                   |
| `--motion-fade-out`   | 800ms (`:90`)                                | chowanie paska „lane” (`lib/scroll-lane.ts:7`)                                                                                                                                                                                 | —                   |
| `--motion-press`      | `var(--motion-base)` (`:92`)                 | —                                                                                                                                                                                                                              | —                   |
| `--motion-state`      | `var(--motion-base)` (`:93`)                 | kolory stanów                                                                                                                                                                                                                  | —                   |
| `--motion-fade`       | `var(--motion-fast)` (`:94`)                 | `opacity` pigułki (`sliding-pill-style.ts:30`)                                                                                                                                                                                 | —                   |
| `--motion-loop`       | 1.8s (`:96`)                                 | `loading-slide`                                                                                                                                                                                                                | —                   |
| `--motion-pulse`      | 2s (`:97`)                                   | `pulse-neon`                                                                                                                                                                                                                   | —                   |
| `--motion-caret`      | 1s (`:98`)                                   | —                                                                                                                                                                                                                              | —                   |
| `--motion-bump`       | 420ms (`:99`)                                | puls color pickera (`color/color-picker.tsx:210`)                                                                                                                                                                              | —                   |
| `--ease-standard`     | `cubic-bezier(0.2, 0, 0, 1)` (`:101`)        | **pigułka slidingu** i przelot popupu                                                                                                                                                                                          | nie                 |
| `--ease-out`          | `cubic-bezier(0, 0, 0.2, 1)` (`:102`)        | opacity pigułki, `.btn-press`, kolory                                                                                                                                                                                          | nie                 |
| `--ease-emphasized`   | `cubic-bezier(0.3, 0, 0, 1)` (`:103`)        | `dialog/sheet.tsx:63`                                                                                                                                                                                                          | nie                 |
| `--ease-loop`         | `cubic-bezier(0.4, 0, 0.2, 1)` (`:104`)      | pętle                                                                                                                                                                                                                          | nie                 |
| `--ease-spring`       | `cubic-bezier(0.34, 1.56, 0.64, 1)` (`:105`) | tylko thumb switcha (`toggle/switch.tsx:31`)                                                                                                                                                                                   | **tak** (y1 = 1,56) |
| `--ease-pop`          | `cubic-bezier(0.4, 2.2, 0.6, 0.5)` (`:106`)  | tylko wskaźnik color pickera (`ui.css:473,484,489`)                                                                                                                                                                            | **tak** (y1 = 2,2)  |
| `--press-scale`       | 0.92 (`:120`)                                | skala wciśnięcia przycisku (`:286`) i pigułki (`sliding-pill-core.ts:74`)                                                                                                                                                      | —                   |

Reduced motion (`ui.css:157-165`): `--motion-fast/base/slide/emphasized/bump` → `1ms`.

### v2 (V2 `styles/motion.css`)

Wspólne ze starym kitem (te same wartości): `--motion-fast/base/slide/emphasized/fade-out/press/state/bump` (`:2-9`) i sześć krzywych `--ease-standard` … `--ease-pop` (`:52-57`). Nowe:

| Token                                     | Wartość (`motion.css:linia`)                  | Rola                                                                                             | Przestrzał / Q5                  |
| ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| `--sliding-duration`                      | `var(--motion-slide)` (`:10`)                 | tylko przełącznik „czy jest ruch” (`floating-indicator.tsx:56`)                                  | —                                |
| `--sliding-elastic`                       | 1 (`:11`)                                     | 1 = `elastic`, 0 = `firm` (`floating-indicator.tsx:82`)                                          | —                                |
| `--sliding-clip-margin`                   | 0.5rem (`:12`)                                | `overflow-clip-margin` rodzica, żeby przestrzał nie był obcięty (`floating-indicator.css:24-27`) | —                                |
| `--motion-firm`                           | `var(--motion-slide)` = 150ms (`:13`)         | czas `firm`                                                                                      | —                                |
| `--ease-firm`                             | `var(--ease-standard)` (`:14`)                | krzywa `firm`                                                                                    | nie                              |
| `--motion-elastic`                        | 220ms (`:15`)                                 | czas `elastic`                                                                                   | —                                |
| `--sliding-distance-step`                 | 40px (`:16`)                                  | wydłużanie `firm` z dystansem                                                                    | —                                |
| `--sliding-distance-gain`                 | 0.25 (`:17`)                                  | j.w.                                                                                             | —                                |
| `--sliding-distance-max`                  | 2 (`:18`)                                     | j.w., najwyżej 2 × czas                                                                          | —                                |
| `--elastic-overshoot`                     | 0.1 (`:19`)                                   | przestrzał = 0,1 × `--size-height`                                                               | —                                |
| `--elastic-press-stretch`                 | 0.25 (`:20`)                                  | rozciągnięcie thumba switcha przy wciśnięciu (`components/switch.css:93-97`)                     | —                                |
| `--indicator-fade`                        | `var(--motion-fast)` = 50ms (`:21`)           | opacity wskaźnika                                                                                | —                                |
| `--motion-press-in`                       | `var(--motion-fast)` (`:22`)                  | wejście wciśnięcia                                                                               | —                                |
| `--motion-press-out`                      | 224ms (`:23`)                                 | wyjście wciśnięcia                                                                               | —                                |
| `--motion-press-hold`                     | 100ms (`:24`)                                 | minimalne trzymanie (`lib/motion.ts:51`)                                                         | —                                |
| `--motion-hover-in` / `-out`              | 0ms / `var(--motion-slide)` (`:25-26`)        | kolory hover                                                                                     | —                                |
| `--motion-check-draw` / `-erase`          | 350ms / `var(--motion-slide)` (`:27-28`)      | ptaszek                                                                                          | —                                |
| `--ease-check`                            | `cubic-bezier(0.22, 1, 0.36, 1)` (`:29`)      | ptaszek, ring kliknięcia                                                                         | nie                              |
| `--ease-press-out`                        | `linear(…)` 13 punktów, szczyt 1.001 (`:30`)  | wyjście wciśnięcia (`_internal/control.css:35`, `menubar.css:47`)                                | ~0,1%; **`linear()` łamie Q5**   |
| `--button-press-scale`                    | 0.97 (`:31`)                                  | skala wciśnięcia (`_internal/control.css:72-74`, `menubar.css:52`)                               | —                                |
| `--ease-elastic-out`                      | `linear(…)` 41 punktów, szczyt 1.3641 (`:32`) | hamburger, editor-demo                                                                           | **tak**; **`linear()` łamie Q5** |
| `--press-opacity`                         | 0.82 (`:33`)                                  | —                                                                                                | —                                |
| `--motion-rubber-band`, `--rubber-band-*` | 380ms, 0.55, 0.06, 0.08, 0.6 (`:34-38`)       | slider (`slider.css:345` z `--ease-spring`)                                                      | tak (`--ease-spring`)            |
| `--ease-approach`                         | `linear(…)` (`:51`)                           | przycisk premium                                                                                 | nie; **`linear()` łamie Q5**     |

Tryby (`V2 styles/settings.css:167-178`): `[data-sliding="elastic"]` → `--sliding-elastic: 1`; `firm` → `0`; `off` → `--sliding-duration: 0ms`. Reduced motion (`:220-232`) dodaje m.in. `--motion-press-out: 1ms`, `--sliding-duration: 0ms`, `--button-press-scale: 1`. Domyślnie oba presety mają `sliding: 'elastic'` (`lib/theme-data.ts:251,269`).

### Strona (SITE, framer-motion)

| Miejsce                                 | Parametry                                                         | Pointer                                             |
| --------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| pigułka nawigacji nagłówka              | `spring, stiffness 420, damping 36`                               | `widgets/header/ui/desktop-nav.tsx:98-102, 147-151` |
| pigułka w panelu menu nagłówka          | `spring, 480, 38`                                                 | `desktop-nav.tsx:187-191`                           |
| pigułka przełącznika języka             | `spring, 480, 38`                                                 | `shared/ui/language-switcher.tsx:158-163`           |
| `TabPill` (zaznaczona zakładka)         | `spring, 380, 34`                                                 | `shared/ui/tab-pill.tsx:50-55`                      |
| wejście panelu menu                     | `opacity 0→1, y −8→0, scale 0.98→1`, 200 ms, `[0.23, 1, 0.32, 1]` | `desktop-nav.tsx:169-172`                           |
| przycisk motywu (`whileHover/whileTap`) | `spring, 300, 20` (ζ ≈ 0,58, przestrzał ok. 11%)                  | `shared/ui/theme-switcher.tsx:45-47`                |

Krzywa sprężyny (estymacja: oscylator tłumiony, masa 1 = domyślna w Motion, start z zerową prędkością; brak `node_modules/framer-motion`, więc nie sprawdziłem w źródle):

| k/c    | ζ      | szczyt  | czas szczytu | ±1% od | postęp w 50/100/150/200/250 ms        |
| ------ | ------ | ------- | ------------ | ------ | ------------------------------------- |
| 420/36 | 0,8783 | 1,00312 | 321 ms       | 235 ms | 0,290 / 0,656 / 0,870 / 0,964 / 0,996 |
| 480/38 | 0,8672 | 1,00420 | 288 ms       | 213 ms | 0,320 / 0,700 / 0,903 / 0,981 / 1,002 |
| 380/34 | 0,8721 | 1,00370 | 329 ms       | 243 ms | 0,271 / 0,629 / 0,851 / 0,955 / 0,993 |

Przerwanie lotu w Motion przenosi prędkość, więc przy szybkim przejeździe po kilku pozycjach przestrzał jest większy niż w tabeli (nie mierzyłem).

## 2. Mechanika slidingu w starym kicie

Pliki: KIT `sliding/sliding-pill-core.ts`, `sliding-pill-style.ts`, `use-sliding-pill.ts`, `sliding-pill-trackers.ts`, `sliding-pill.tsx`.

**Element.** `<div aria-hidden data-sliding-pill class="absolute pointer-events-none">` w kontenerze listy (`sliding-pill.tsx:17-23`). Startowy styl: `transform: translate(0,0)`, `opacity: 0`, `transition: none` (`use-sliding-pill.ts:190-194`). Komponent ma zwykle dwie pigułki: hover i active (np. `navigation/tabs.tsx:72-83, 112-127`; `list/scroll-list.tsx:89-114` ma cztery: hover, active, secondary, tertiary).

**Algorytm `update()`** (`use-sliding-pill.ts:139-156`):

1. Cel = pierwszy podłączony element w kolejności `pin > hover > focus > attribute > active` (`sliding-pill-core.ts:97-109`).
2. Brak celu albo kontenera → `hide()`: `transition` = przejście pigułki, `opacity: 0`; `transform` zostaje, czyli pozycja jest zapamiętana (`:129-137`). ResizeObserver się odłącza.
3. Pomiar (`measure`) jednego z trzech sposobów:
   - `measureOffset`: `offsetLeft/Top/Width/Height` + `getComputedStyle(item).borderRadius` (`core.ts:11-17`);
   - `measureOffsetChain`: suma `offsetLeft/Top` po łańcuchu `offsetParent` do kontenera, odporna na przodka z transformacją FLIP (`:19-39`);
   - `measureRect`: `getBoundingClientRect` celu minus kontener minus jego ramka (`:46-59`).
4. Pusty pomiar (w i h ≤ 0) → nic (`:151`). Ten sam cel i geometria różna o < 0,5 px → nic (`:65-73, 152`).
5. `applyPlacement(motion)` (`:92-116`), gdzie `motion` = `reveal` (pierwsze pokazanie), `follow` (ten sam cel, nowa geometria) albo `slide` (nowy cel):
   - `style.transition` = przejście pigułki tylko przy `slide`; przy `reveal`, `follow` i trybie `instant` `none` (`:97`);
   - `style.transform` = wynik `place` (`:98`);
   - `style.width` i/lub `style.height` (`:99-106`);
   - przy `radiusFromItem` `style.borderRadius` = promień celu, bez animacji (`:107`; używa tylko `navigation/navigation-menu.tsx:29`);
   - `reveal`: `opacity: 0`, wymuszony reflow `void pill.offsetHeight`, potem `opacity: 1` z przejściem (`:108-114`). Pigułka pojawia się na miejscu i tylko się wyłania (50 ms).
6. `place` (`core.ts:76-95`): `placeBox` = `translate(x+offset, y+offset) scale(press)` + `width` + `height`; `placeAxisY` = `translateY(y)` + `height`; `placeAxisYPressable` = to samo + skala; `placeAxisX` = `translateX(x) scale(press)` + `width`.
7. Przejście (`sliding-pill-style.ts:25-31`): `transform` i animowane wymiary osi (`x` → `width`, `y` → `height`, `xy` → oba) przez `--motion-slide` (hover) albo `--motion-emphasized` (active) po `--ease-standard`, a `opacity` przez `--motion-fade` po `--ease-out`.

**Śledzenie.** ResizeObserver na celu i kontenerze wywołuje `update` (wynik `follow`, bez animacji) (`use-sliding-pill.ts:118-127, 205-219`). Zdarzenie `theme:tokens-changed` też odświeża (`:11, 208`). Listy z przewijaniem odświeżają na `scroll` (`list/scroll-list.tsx:283`, `select/select.tsx:156`, `menu/command.tsx:123`); pigułka leży w przewijanej treści, więc przewija się z nią.

**Hover vs active.**

- Pointer: `pointermove` → `closest(itemSelector)` → cel hover. Ruch poza elementem nic nie zmienia, więc pigułka zostaje nad przerwą. Czyści tylko trafienie w `clearSelector`, `pointerleave` kontenera i `blur` okna (`sliding-pill-trackers.ts:25-44`).
- Pigułka hover nie wchodzi pod active: `hover.set('hover', hoverEl !== activeEl ? hoverEl : null)` (`navigation/tabs.tsx:96`). Po zejściu z active wraca z miejsca, gdzie się schowała (pozycja z `transform` została, a `positioned` zostaje `true`, więc `slide`).
- Active z atrybutu (`useAttributeTracker`, MutationObserver, `:61-89`) albo klucza (`useActiveKeyTracker`, `:103-119`).

**Menu i separator** (`menu/sliding-menu.tsx`): jedna pigułka `measureRect + placeAxisY`, przejście hover (`:57-62, 22`). `pointermove` na wierszu → pigułka na wiersz (`:146-156`). Poza wierszem czyści tylko element `[data-sliding-menu-clear]` (własny węzeł, `:159-160, 286-293`). Separator nie ma tego atrybutu, więc pigułka zostaje na ostatnim wierszu. Otwarty sub-trigger trzyma pigułkę (`:72-81`). Podmenu otwiera się od razu na `pointermove` (mysz) przez `trigger.click()` w mikrotasku, chyba że zdarzenie ma `defaultPrevented` (okno łaski, `:135-144`).

**Wciśnięcie.** `usePressTracker` (`sliding-pill-trackers.ts:129-190`): `pointerdown` na elemencie → `setPressed(true)`; zwolnienie trzyma co najmniej `--motion-slide` (150 ms) od wciśnięcia (`:161-176`). `setPressed` przelicza `place` ze `scale(var(--press-scale))` = 0,92 i animuje przejściem `slide` (`use-sliding-pill.ts:169-174`). Przyciski: `.btn-press[data-pressing]` → `scale(0.92)` + `opacity: 0.82` przez 100 ms `--ease-out` (`ui.css:250-291`); globalny tracker ma to samo minimum 150 ms (`lib/motion.ts:19-81`).

**Kiedy znika.** Wyjście wskaźnika z kontenera, `blur` okna, trafienie w strefę czyszczącą, brak celu po zmianie stanu, `clearAll()`. Znika przez `opacity` 50 ms, pozycja zostaje.

**Odbicie od ściany.** Brak. Krzywa nie ma przestrzału, więc nie ma czego odbijać.

**Reduced motion.** Brak gałęzi w JS; tokeny czasu spadają do 1 ms (`ui.css:157-165`), więc przejścia są natychmiastowe.

## 3. `popup-slide`: przelot okienek

**Stary kit** (KIT `sliding/popup-slide.ts`):

1. `leave(popup)`: zapamiętaj prostokąt, do którego zmierzał poprzedni popup (`lastRef`), a nie miejsce w połowie lotu; jeśli to inny popup, weź jego `getBoundingClientRect` (`:69-72`).
2. `arrive(popup)` po `onPlaced` Radixa (`placedProps`, `:43-46`): `slideIn` mierzy nowy popup i liczy przesunięcie (`:48-58, 73-77`).
3. Popup jeszcze niespozycjonowany (Radix parkuje go na `translate(0, -200%)`) nie ma skąd lecieć (`isPlaced`, `:13-16`).
4. `slideOffset` (`:36-41`): w poprzek strony przesuwa się tylko krawędź przy triggerze (`edgeGap`, `:23-28`) i tylko wtedy, gdy obie strony są takie same; wzdłuż wyrównanie `start`/`end`/`center` (`alignGap`, `:30-34`).
5. Animacja: `popup.animate([{transform: translate(dx,dy)}, {transform: translate(0,0)}], {duration: --motion-slide (150), easing: --ease-standard})` (`:53-56`). Bez zmiany rozmiaru. Przesunięcie < 0,5 px pomijane.
6. `reset()` → następny popup otwiera się na miejscu (`:78-80`).

Użycie: menubar (`menu/menubar.tsx:309, 506`), podmenu (`menu/sliding-menu.tsx:163-173`), tooltipy w grupie (`hover/tooltip.tsx:11`, `hover/tooltip-store.ts`; opóźnienie 400 ms `lib/motion.ts:1`, `skipDelayDuration` 300 ms `hover/tooltip.tsx:20`, zamknięcie po 100 ms `tooltip-store.ts:17`).

**v2** (V2 `hooks/use-popup-slide.ts`): ta sama logika `leave`/`arrive`/`reset` i `slideOffset` (`:184-224, 341-363`), ale:

- ruch idzie przez silnik wskaźnika: `slide(popup, …, 'firm', 'xy', { fixedDuration: true, viewport: true })` (`:306-317`), czyli 150 ms `--ease-firm` bez wydłużania z dystansem;
- przy innym rozmiarze nowego popupu morf `width`/`height` z poprzedniego prostokąta (`:302-308`), a na czas lotu zamrożenie wrappera Radixa (`width`, `height`, `min-width`, `flex-shrink`; `freezeWrapper`, `:232-255`) i dzieci (`width`, `height`, `max-height`, `flex`; `freezeContent`, `:257-281`);
- `arrival.centred` dla viewportu nawigacji: lot górnego środka (`:283-293`);
- `settle()` dla zmiany rozmiaru w spoczynku (`:356-361`); dzielenie przez `--css-zoom` (`floating-indicator.tsx:155-160`).

**Strona (SITE):** panel menu nagłówka nie przelatuje. `AnimatePresence` z `key={openGroup.key}` daje wyjście starego i wejście nowego panelu (opacity + y + scale, 200 ms, `desktop-nav.tsx:163-172`). To wejście z niczego, które W16 zabrania dla popupów (W16 dopuszcza je tylko dla dialogu i sekcji strony).

## 4. Tryby `elastic` / `firm` / `off` w v2

Silnik: V2 `components/_internal/floating-indicator.tsx` (`readFlight`, `:80-95`). Tryb z argumentu `motion` albo z `--sliding-elastic`.

| Tryb    | Czas                                                                                                                                                         | Krzywa                                                                                                                                                                                                                 | Ściana rodzica                                                                                                                                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| elastic | `--motion-elastic` = 220 ms, stały (`:85, 92`)                                                                                                               | `elasticProgress(t, o)`: dla t ≤ 0,6 `(1+o)·(1−(1−t/0,6)³)`, potem `1 + o·(1 − smoothstep)` (`:19-23`); `o = min(0,1 × --size-height, dystans/2) / dystans` (`:84, 86`); zapis jako `linear()` z 21 punktów (`:25-31`) | gdy wskaźnik ma animowany rozmiar i nie jest w viewport (`:162`): 21 klatek z `offset`, `easing: 'linear'`, a pozycja i rozmiar przycięte do wewnętrznych krawędzi rodzica (`clientWidth/Height` − padding), więc przód staje na ścianie, a pigułka się zgniata (`:100-138, 164-165`) |
| firm    | `--motion-firm` = 150 ms × `min(max(1, 2), 1 + 0,25·log2(dystans / max(rozmiar w osi, 40px)))`, czyli najwyżej 300 ms (`:63-72`); stały przy `fixedDuration` | `--ease-firm` = `cubic-bezier(0.2, 0, 0, 1)` (`:93`)                                                                                                                                                                   | brak                                                                                                                                                                                                                                                                                  |
| off     | brak ruchu: `--sliding-duration: 0ms` → `slidesInstantly` (`:53-57`); bieżąca animacja anulowana (`:143-144`)                                                | —                                                                                                                                                                                                                      | —                                                                                                                                                                                                                                                                                     |

Wspólne:

- reduced motion = `off` (`:55`), opacity wskaźnika bez przejścia (`floating-indicator.css:37-45`);
- przesunięcie < 0,5 px i brak zmiany rozmiaru → bez ruchu (`:14, 146-149`);
- przelot zaczyna się od pola, które widać teraz (`glide` + `boxOf` czyta `translate`, `width`, `height` z `getComputedStyle`, `:46-50, 181-188`);
- `animation.startTime = document.timeline.currentTime`, żeby szybki przejazd po wielu wierszach (retarget co klatkę) nie zamrażał wskaźnika (`:167-170`);
- menu zawsze `firm`: `MenuHighlight` przekazuje `motion="firm"` (`components/_internal/base-menu.tsx:125`), test `base-menu.test.tsx:78`;
- przelot popupu zawsze `firm` (`use-popup-slide.ts:309`).

**Squish przy kliknięciu** nie zależy od trybu:

- wciśnięcie kontrolki: `scale: var(--button-press-scale)` = 0,97; wejście 50 ms `--ease-out`, wyjście 224 ms `--ease-press-out` (`_internal/control.css:32-35, 67-74`), minimalne trzymanie 100 ms (`lib/motion.ts:51`);
- wskaźnik menubara skaluje się tak samo (`menubar.css:45-55`);
- wskaźniki tabs i toggle group przy wciśnięciu zmieniają tylko kolor (`--indicator-tint`, `tabs.css:71-75`, `toggle-group.css:95-99, 133`);
- thumb switcha rozciąga szerokość o 25% (`switch.css:93-97`), a `glide` na osi `x` animuje `width` (`switch.tsx:9-23`).

## 5. Zachowania z F15 dotyczące slidingu i ich testy

| Zachowanie                                                                   | Stary kit (KIT)                                                                                                            | v2 (V2)                                                                                                                                                                          |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pigułka zostaje na ostatnim wierszu przy separatorze; chowa się nad etykietą | `menu/sliding-menu.test.tsx:288` „hides the pill over a label, restores it on a row, and keeps it sticky over a separator” | `components/_internal/menu-list.test.tsx:297` „hides the pill over a label, restores it on a row and keeps it over a separator”                                                  |
| jedna ciągle widoczna pigułka między wierszami                               | `menu/sliding-menu.test.tsx:241`                                                                                           | `hooks/use-floating-indicator.test.tsx:219`                                                                                                                                      |
| sticky nad przerwą, czyści strefa i wyjście                                  | `sliding/sliding-pill.test.tsx:302`, `list/scroll-list.test.tsx:71`, `menu/menubar.test.tsx:187`                           | `hooks/use-bar-indicators.test.tsx:44`                                                                                                                                           |
| hover nie wchodzi pod active                                                 | `list/scroll-list.test.tsx:93, 111`                                                                                        | `components/tabs.test.tsx:187`, `toggle-group.test.tsx:310`                                                                                                                      |
| pierwsze pokazanie bez przelotu, potem przelot                               | `sliding/sliding-pill.test.tsx:57`, `:198` (remount bez lotu z (0,0))                                                      | `hooks/use-floating-indicator.test.tsx:137`                                                                                                                                      |
| chowanie zostawia pozycję; powrót przelotem z miejsca schowania              | `sliding/sliding-pill.test.tsx:76`                                                                                         | `hooks/use-floating-indicator.test.tsx:204`                                                                                                                                      |
| zmiana rozmiaru celu: bez przelotu                                           | `sliding/sliding-pill.test.tsx:131`                                                                                        | `hooks/use-floating-indicator.test.tsx:235`                                                                                                                                      |
| zwinięty cel chowa wskaźnik                                                  | —                                                                                                                          | `hooks/use-floating-indicator.test.tsx:305`                                                                                                                                      |
| zawrócenie w locie od miejsca, które widać                                   | —                                                                                                                          | `hooks/use-floating-indicator.test.tsx:147, 271`; `floating-indicator.test.ts:44` (retarget co klatkę)                                                                           |
| odbicie od ściany                                                            | —                                                                                                                          | `components/_internal/floating-indicator.test.ts:65, 91`                                                                                                                         |
| sub-trigger trzyma pigułkę; natychmiastowe podmenu                           | `menu/sliding-menu.test.tsx:202, 218, 327, 345-408`                                                                        | `components/_internal/menu-list.test.tsx:358-422`                                                                                                                                |
| przelot menubara i tooltipów: start od celu poprzedniego                     | `sliding/popup-slide.test.ts:52, 66`; `hover/tooltip-store.test.ts:36, 55, 67`; `hover/tooltip.test.tsx:161`               | `hooks/use-popup-slide.test.ts:270, 285, 301`; `components/menubar.test.tsx:204`; `tooltip.test.tsx:173`; `_internal/base-menu.test.tsx:125`; `_internal/menu-list.test.tsx:539` |
| geometria przelotu (krawędź przy triggerze, środek do środka, zmiana strony) | `sliding/popup-slide.test.ts:19-34`                                                                                        | `hooks/use-popup-slide.test.ts:43-58`                                                                                                                                            |
| minimalne trzymanie wciśnięcia                                               | `sliding/sliding-pill.test.tsx:372`                                                                                        | `lib/motion.test.ts:32, 69`                                                                                                                                                      |

Strona (SITE) nie ma testów pigułek. Sama mechanika `layoutId` daje (wniosek z kodu): hover pigułka w nagłówku jedzie do pozycji pod wskaźnikiem albo do otwartej grupy (`pillKey = hoveredKey ?? openKey`, `desktop-nav.tsx:72`); po wyjściu z `nav` znika od razu, bez wygaszania (nie jest w `AnimatePresence`), chyba że grupa jest otwarta, bo wtedy wraca na nią (`:80-83`, zamknięcie po 140 ms, `:14`). W przełączniku języka pigułka po wyjściu wraca na aktywny język (`language-switcher.tsx:142, 158`), czyli jest jedna pigułka hover+active, a nie dwie.

## 6. Co łamie regułę transform/opacity (Q2–Q5, Z4, Z6, Q7)

### Stary kit

| Miejsce                                   | Co                                                                                                       | Reguła                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| `sliding/sliding-pill-style.ts:18-31`     | `transition` obejmuje `width` / `height` pigułki                                                         | Q3, Z4                   |
| `sliding/use-sliding-pill.ts:99-106`      | zapis `style.width/height` przy każdym przelocie (animowany powyższym przejściem)                        | Q3                       |
| `sliding/sliding-pill-core.ts:16, 37, 57` | `getComputedStyle(item).borderRadius` przy każdym pomiarze; `use-sliding-pill.ts:107` przepisuje promień | Q7, Z5                   |
| `sliding/use-sliding-pill.ts:110`         | wymuszony reflow `void pill.offsetHeight` przy `reveal`                                                  | koszt layoutu (nie ruch) |
| `toggle/switch.tsx:31`                    | `--ease-spring` z `background-color` w jednym przejściu                                                  | kolor: N8                |
| `popup-slide.ts`                          | tylko `transform` — zgodne                                                                               | —                        |

### v2

| Miejsce                                             | Co                                                                                                                            | Reguła                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `components/_internal/floating-indicator.tsx:1`     | `eslint-disable tessera/compositor-motion` dla całego pliku z powodem „size runs on the main thread”                          | Q2–Q4                     |
| `floating-indicator.tsx:74-78, 130-135, 164-166`    | klatki WAAPI z `width`/`height` (oś z rozmiarem); zgniecenie przy ścianie przez zmniejszanie `width`/`height`                 | Q3, Z4                    |
| `floating-indicator.tsx:25-31, 93`                  | krzywa `elastic` jako `linear()`                                                                                              | Q5                        |
| `styles/motion.css:30, 32, 51`                      | `--ease-press-out`, `--ease-elastic-out`, `--ease-approach` jako `linear()`                                                   | Q5                        |
| `floating-indicator.tsx:33-39, 46-50`               | `getComputedStyle` (`--size-height`, `translate`, `width`, `height`) przy każdym przelocie                                    | Q7 (pomiar w JS do ruchu) |
| `hooks/use-floating-indicator.ts:61-63`             | zapis `style.width/height` wskaźnika, potem `glide` je animuje                                                                | Q3                        |
| `hooks/use-popup-slide.ts:302-308, 232-281`         | morf `width`/`height` popupu, zamrażanie wrappera i dzieci w stylach inline                                                   | Q3, Z4                    |
| `components/switch.css:93-97` + `switch.tsx:9-23`   | rozciągnięcie thumba przez `width`, animowane `glide` na osi `x`                                                              | Q3                        |
| `components/_internal/floating-indicator.css:12-22` | `.cn-indicator-cover`: obrys i odcienie jako `box-shadow inset` na elemencie, którego rozmiar się animuje → repaint co klatkę | Q3, B2                    |

Wyjątki z v2 (`MangaShift/tessera/packages/tessera/test/motion-exceptions.ts:9-36`) nie obejmują wskaźnika ani popupu; plik wyłącza lint w całości.

## Do przeniesienia 1:1

- Dwie pigułki: hover i active. Hover nie wchodzi pod active (KIT `tabs.tsx:96`, V2 `tabs.tsx:101`). Kolejność źródeł v2: `hover > focus > active` (V2 `hooks/use-floating-indicator.ts:18`); stary kit miał dodatkowo `pin` i `attribute` (`sliding-pill-core.ts:99`).
- Sticky: ruch poza elementem nie rusza pigułki; czyści tylko wyjście z kontenera, `blur` okna i jawne strefy (etykieta, własny węzeł). Separator nie czyści.
- Pierwsze pokazanie na miejscu z wygaszeniem 50 ms; chowanie przez `opacity` 50 ms bez ruchu; powrót przelotem z miejsca schowania.
- Zmiana rozmiaru celu albo kontenera (ResizeObserver, zmiana motywu, przewijanie): przeskok bez animacji.
- Zawrócenie w locie od widocznej pozycji; `startTime = currentTime` przy retargecie.
- Pusty cel (w = h = 0) chowa wskaźnik; w trakcie usuwania (`[data-removing]`) bez pomiaru (V2 `use-floating-indicator.ts:131-140`).
- Wciśnięcie: minimalne trzymanie (stary kit 150 ms, v2 100 ms); skala (stary 0,92, v2 0,97).
- Przelot popupu: start od celu poprzedniego, nieruchoma krawędź przy triggerze, środek do środka wzdłuż rzędu, przy zmianie strony tylko wzdłuż, `reset` = otwarcie na miejscu, pominięcie popupu zaparkowanego na `-200%`, `firm` 150 ms.
- Natychmiastowe podmenu na `pointermove` (mysz), z poszanowaniem `defaultPrevented` (okno łaski).
- Parametry `elastic` z decyzji E0 (`docs/decisions/e0-motion.md`): 220 ms, przestrzał 0,1 × wysokość, maks. połowa dystansu, szczyt w 60%; `firm` 150 ms z wydłużeniem log2 do 2×; `off` i reduced motion = brak ruchu.
- Odbicie od ściany rodzica: przód staje na wewnętrznej krawędzi (padding), pigułka się zgniata i wraca. W v3 przez `scale` z `transform-origin` przy ścianie zamiast przycinania `width`.

## Do przepisania na transform

- Rozmiar pigułki (stary kit: `transition` na `width/height`; v2: klatki z `width/height`) → rozmiar w jednej klatce i przejście rozmiaru przez `scale` (FLIP), jak w decyzji E0. Przy równych wierszach to czysty `translate`.
- Krzywa `elastic` z `linear()` → klatki z `offset` (21 punktów `elasticProgress`) i `easing` per klatka albo `linear`, bez funkcji `linear()`.
- `--ease-press-out`, `--ease-elastic-out`, `--ease-approach` → `cubic-bezier` albo klatki z `offset` (Q5).
- Zgniecenie przy ścianie → `scale` w osi ruchu z `transform-origin` na ścianie.
- Morf rozmiaru popupu w przelocie → przelot `translate` popupu w docelowym rozmiarze; rozmiar w jednej klatce. Zamrażanie wrappera i dzieci znika.
- Thumb switcha: rozciągnięcie przez `scale` w osi x zamiast `width`.
- Promień pigułki: z dziedziczonej zmiennej silnika `shape` (F2), nie z `getComputedStyle(item).borderRadius`.
- Wariant „cover” (`box-shadow inset` na wskaźniku) przy skalowaniu zniekształci obrys; to ryzyko N5 i Z6, rozstrzyga ocena na żywo.
- Jeśli właściciel chce czucia strony (sprężyna Motion), krzywą da się spróbkować tak jak `elastic` (tabela w pytaniu 1); sprężyny wprost są zablokowane do zniesienia Q5 (F6).

## Niewiadome

1. **Co znaczy „jak na stronie mangashift.com (lekki bounce)”.** Strona na `main` jedzie sprężyną Motion ζ ≈ 0,88 (praktycznie bez przestrzału, miękki ogon do ok. 500 ms), a nie slidingiem starego kitu (ten nie ma przestrzału wcale). Wyraźny bounce ma tylko v2 `elastic`, którą właściciel mógł widzieć na stronie lokalnie na branchu v2 (preset `mangashift-site`, `sliding: 'elastic'`). Pytanie do właściciela: chodzi o wdrożoną stronę (sprężyna Motion) czy o lokalną stronę na v2 (`elastic`)?
2. Czy worktree `fix/tracked-docs-page-and-test-decoding` to dokładnie `main` i wdrożona strona: wniosek z dat i zależności, bez gita.
3. Parametry Motion poza kodem strony (domyślna masa, `restDelta`, przenoszenie prędkości, korekta promienia przy `layoutId`) nie są sprawdzone w źródle, bo `framer-motion` nie jest zainstalowany lokalnie.
4. Czy menu w v3 ma jechać `firm` jak w v2 (`base-menu.tsx:125`), czy w trybie wybranym przez właściciela; na stronie panel menu ma tę samą sprężynę co nawigacja (480/38).
5. Wartość skali wciśnięcia w v3: stary kit 0,92 i trzymanie 150 ms, v2 0,97 i 100 ms.
