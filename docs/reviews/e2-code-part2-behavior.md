---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, HEAD 378bcee + niezacommitowany working tree (stan 2026-11-01 rano)
date: 2026-11-01
---

# Review: E2 część 2, zachowanie (`lib/`, komponenty, `docs/*.md`)

## Zakres

- przedmiot: `packages/tessera/src/lib/**` (indicator, popup-flight, press, scope, collection, instance, single-choice, theme, use-theme, theme-script, tone, input-modality, compose-refs) i `src/components/**` (button, input, toggle-group, menu, popover, dialog, tooltip, text, heading) z testami jednostkowymi; `packages/tessera/docs/*.md`.
- baseline: kod czytany bezpośrednio z worktree (pliki untracked), `dist/` z 04:19.
- authority: `docs/specification.md` (F15, F18, W14, W16, W20, W21, Q2–Q11, Q17, U16, U18), `docs/plans/e2-foundation.md` (D1–D47, faza 14a/14b, rozstrzygnięcia rund 2–3), `AGENTS.md`, `docs/decisions/e2-base-ui.md`, Base UI 1.9.0 w `node_modules/.bun`.
- ryzyka: pigułka (odstępy, wyłączone, wyjście kursora, podmenu, trójkąt, klawiatura), Q9, D40 (`inheritScope`, `TooltipBar`), Q6/Q7 (`writeInstance`), `readMotion`/`forgetMotion`, press, kaskada motywu i osie `platform`/`typeset`, React Compiler i `'use client'`, cleanup nasłuchów, wyścigi, a11y, typy, zero legacy i komentarzy, zgodność dokumentów.
- poza review: silniki i przepisy CSS (poza miejscami, które dokument komponentu opisuje), strażnicy, laboratorium i `edges.spec.ts` (czytane tylko jako dowód), wygląd.

## Werdykt

**Status:** FAIL (bramka fazy 16: brak uwag krytycznych i poważnych).

**Najważniejszy powód:** jedna uwaga poważna, mała w naprawie: `ToggleGroup` z wyłączoną opcją wybraną jest nieosiągalny klawiaturą (Q17). Pozostałe mechanizmy części 2 są poprawne i mają testy: D40 działa przy każdym sposobie otwarcia (ref callback na `Popup`, łańcuch podmenu, ponowna kopia w `TooltipBar`), `writeInstance` pisze tylko `indicator.ts`, Q9 trzyma się przy każdej zmianie poza pierwszym wyborem, cleanup jest kompletny, komentarzy, `any`, `className`/`style`/`render` w typach publicznych ani śladów starych nazw nie ma.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Model miejsca tabulacji w `ToggleGroup`: wybrana opcja wyłączona odcina grupę od klawiatury, a brak wyboru robi z każdej opcji osobny przystanek

- miejsce: `src/components/toggle-group/toggle-group.tsx:153` (`tabIndex={state === 'idle' ? -1 : 0}`), `src/lib/single-choice.ts:15-18` (`stateOf` nie zna `disabled`; `'open'` dla każdej opcji przy `current === null`); test kodujący: `src/lib/single-choice.test.ts:31-37`; dokument: `docs/toggle-group.md` („while nothing is chosen, every option is a tab stop”).
- dowód (DIRECT, kod): (1) wybrana opcja z `disabled` dostaje `tabIndex=0`, ale wyłączony `<button>` nie przyjmuje fokusu; pozostałe mają `-1`, więc Tab omija całą grupę, a strzałki nie działają, bo `onKeyDown` startuje od opcji z fokusem (`:101`). (2) Bez wyboru każda opcja ma `tabIndex=0`: Tab przechodzi przez wszystkie segmenty po kolei, wbrew APG „Radio Group” i natywnej grupie `<input type="radio">` (jeden przystanek, potem wyjście z grupy). (3) Ten sam stan `'open'` sprawia, że pierwszy wybór zmienia stan każdej opcji (`open → idle`), więc re-renderuje całą grupę (Q9 łamane raz, przy pierwszym wyborze).
- wpływ: (1) łamie Q17 („każdy interaktywny element obsługiwalny klawiaturą”) w realnym stanie aplikacji (bieżący tryb wyłączony, bo niedostępny w kontekście); (2) dłuższa ścieżka Tab w panelu i ekranach bez wartości domyślnej; (3) mniejsze, ale to ta sama przyczyna.
- minimalna reakcja: jedna reguła przystanku z APG w `ToggleGroup`: przystankiem jest wybrana opcja, gdy jest włączona, w przeciwnym razie pierwsza włączona. Najprościej: sklep zwraca `'chosen' | 'idle'`, a grupa wylicza jeden `tabStop` (wartość) i podaje go przez ten sam sklep, tak by zmiana przystanku dotykała tylko dwóch opcji (Q9 zostaje). Poprawić `single-choice.test.ts:31` i `docs/toggle-group.md`; dodać przypadek Playwright „wybrana opcja wyłączona: Tab wchodzi na pierwszą włączoną”.

### Mniejsze

#### M1. `MenuSubmenu` z `defaultOpen` nie trzyma pigułki rodzica na pozycji-rodzicu (W14)

- miejsce: `src/components/menu/menu.tsx:170-177, 185-188`.
- dowód (DIRECT, kod; fakt Base UI z planu, baseline części 2): `shown = open ?? opened`, a `opened` zmienia tylko `onOpenChange`, którego Base UI nie woła dla `defaultOpen`. Podmenu otwarte od startu nie woła `scope.hold(trigger)`, więc pigułka rodzica nie stoi na wierszu „Export”. `docs/menu.md` wymienia `defaultOpen` jako stan `MenuSubmenu`.
- wpływ: rzadki przypadek, ale łamie zasadę W14 „otwarte podmenu: pigułka rodzica stoi na pozycji-rodzicu” dla udokumentowanego propsa; test zakresu z `defaultOpen` dotyczy tylko menu głównego.
- minimalna reakcja: `useState(props.defaultOpen ?? false)` (albo zdjąć `defaultOpen` z typu `MenuSubmenu` i z dokumentu).

#### M2. Jeden moduł przelotu dla wszystkich tooltipów: samotny tooltip leci od innego, wciąż otwartego (W16)

- miejsce: `src/components/tooltip/tooltip.tsx:12` (jeden `flight` na moduł), `src/lib/popup-flight.ts:111-114` (`recent`: `closedAt === null` = lot bez limitu czasu); test kodujący dla podmenu: `popup-flight.test.ts:183-188`.
- dowód (DIRECT, kod): reguła „poprzedni jeszcze otwarty = leć” jest właściwa dla podmenu i grupy, ale `flight` tooltipów jest wspólny dla całej aplikacji, bez związku z `TooltipProvider`. Tooltip A otwarty fokusem klawiatury (Base UI trzyma go otwartym) i najechanie na odległy trigger B poza grupą: B wlatuje od A przez pół ekranu.
- wpływ: przelot poza „tooltip w grupie” (W16) w scenariuszu klawiatura + mysz; dziś niewidoczny w laboratorium.
- minimalna reakcja: `flight` per `TooltipProvider` i per `TooltipBar` (kontekst ze stałym obiektem, jak `ScopeContext`); tooltip bez grupy bez przelotu.

#### M3. `readMotion` nie widzi zmiany `data-motion` na poddrzewie poza popupem

- miejsce: `src/lib/indicator.ts:107-130`; jedyne `forgetMotion` w `src/lib/scope.ts:25`.
- dowód (DIRECT, kod): pamięć per element czyści tylko zdarzenie motywu, `prefers-reduced-motion` i `inheritScope`. Kontener `ToggleGroup` albo przycisk w sekcji, której aplikacja przełączy `data-motion` (oś poddrzewa z `subtreeAxes`), trzyma stary tryb do następnej zmiany motywu.
- wpływ: pigułka dalej jedzie (albo stoi) po zmianie osi poddrzewa; zgodne z literą D40 („czyszczona przy zmianie motywu”), ale oś poddrzewa jest publiczna. W E2 laboratorium ustawia ją statycznie.
- minimalna reakcja: zapisać ograniczenie w D40/`AGENTS.md` albo czytać tryb przy starcie lotu bez pamięci (jeden `getComputedStyle` na start lotu, nie na klatkę).

#### M4. Typeahead nie przełącza modalności na klawiaturę

- miejsce: `src/lib/input-modality.ts:11` (lista `keys` bez znaków), `src/components/toggle-group/toggle-group.tsx:100-119`.
- dowód (DIRECT, kod): litera przenosi fokus (`next.focus()`), ale `data-input` zostaje `pointer`, więc obrys fokusu przycisku (bramka `:root:not([data-input='pointer'])`, D32) się nie pokazuje. Ścieżka: klik w segment, potem litera.
- wpływ: fokus przeniesiony klawiaturą bez widocznego obrysu (F8, Q17); wybór pokazuje pigułka, więc szkoda mała. Dotyczy też typeahead Base UI w menu.
- minimalna reakcja: w `navigates` uznać za nawigację pojedynczy znak wpisany poza polem tekstowym (`key.length === 1`, bez modyfikatorów), test w `input-modality.test.ts`.

#### M5. `docs/dialog.md` opisuje wejście ze `scale`, kod wchodzi samym `opacity`

- miejsce: `packages/tessera/docs/dialog.md`, sekcja „Behaviour” („`opacity` and `scale` (from `--ts-motion-press-scale`)”) wobec `src/recipes/surface.css:145-149` (tylko `transition: opacity`, `[data-starting-style]` → `opacity: 0`).
- dowód (DIRECT): `scale` usunięto w części 1 (recenzja silników P5, Q14: blur w ruchu); dokument został.
- wpływ: dokument dla agentów (U30) przeczy kodowi.
- minimalna reakcja: „`opacity` over `--ts-motion-duration-overlay` …”; to samo zdanie w `llms.txt`, jeśli generowane.

#### M6. `Button`: ref złożony bez `useMemo` (otwarte M4 z części 1)

- miejsce: `src/components/button/button.tsx:31` (`composeRefs(ref, pressable)` w renderze); pozostałe komponenty używają `useMemo` (`menu.tsx:78, 201, 213`, `toggle-group.tsx:83`, `popover.tsx:25`, `tooltip.tsx:52`).
- dowód (DIRECT, kod + `dist/components/button/button.js`): w `dist` kompilator memoizuje callback na `ref`; w wersji nieskompilowanej (vitest na `src`, Q13) każdy render to nowy ref, więc cleanup `trackPress` zdejmuje `data-pressing` w trakcie wciśnięcia.
- wpływ: różnica zachowania wersji skompilowanej i nieskompilowanej; jedyny wyjątek od wzorca paczki.
- minimalna reakcja: `useMemo(() => composeRefs(ref, pressable), [ref])`.

### Sugestie

- **S1.** `src/lib/scope.ts:28-38`: `createScopeAnchor` trzyma jeden węzeł; dwa `PopoverTrigger`/`MenuTrigger` w jednym `Root` (Base UI 1.9 na to pozwala) nadpisują się, a odmontowanie któregokolwiek zeruje uchwyt. Dziś nikt tak nie składa; przy pierwszym takim konsumencie użyć `createScopeTriggers` z kluczem z `eventDetails.trigger`.
- **S2.** `src/lib/scope.ts:54`: `createContext` w module bez `'use client'` (strażnik `use-client.test.ts` liczy tylko wywołania `use*`). Import `@mattymroz/tessera/lib/scope` z komponentu serwerowego wywróci się w RSC. Dziś importują go tylko moduły klienta.
- **S3.** `src/lib/popup-flight.ts:85` (`width <= 0 && height <= 0`) i `:99` (`last` trzyma odłączony Positioner): dawne S4/S5 części 1 bez zmian.
- **S4.** `src/lib/scope.ts:17-26`: `inheritScope` usuwa atrybut osi z popupu, gdy trigger nie ma przodka z osią, także atrybut podany jawnie przez konsumenta (`<MenuContent data-size="xl">`, JSX nie sprawdza nazw z myślnikiem). Albo zostawić i zapisać w `menu.md`/`popover.md`, albo zdejmować `data-<oś>` z typów i propsów popupu.
- **S5.** `Tooltip` z pustym `content` otwiera pusty dymek; przy E3 rozważyć `content` typu `string | ReactElement` bez pustego łańcucha albo brak popupu.

## Zgodność z kontraktem

- W14 pigułka: pass poza M1. `stickyHover` + `enabled()` trzymają ostatnią pozycję nad separatorem, nagłówkiem, odstępem i wyłączoną (`indicator.ts:141-148, 551-561`); wyłączona osiągnięta strzałkami nie rusza `focused` (`:567-573`); `pointerleave` i `blur` okna gaszą hover (`:562-566, 580-584`); świeża lista bez pigułki (stan `box: null`, `reveal` dopiero przy celu); podmenu: `hold` jako `active` (`menu.tsx:173-177`), trójkąt dzięki `blockPointerEvents: true` w `MenuSubmenuTrigger.mjs:155` Base UI.
- Q4/D31: pass; `will-change` nie występuje w `lib/` ani komponentach.
- Q6/Q7/D39: pass; jedyne `writeInstance` w `indicator.ts:484`, komponenty bez `style`.
- D40/F18: pass. Menu i Popover kopiują w ref callbacku `Popup` (przed pomiarem Positionera), podmenu łańcuchem przez popup rodzica, `TooltipBar` kopiuje ponownie przy zmianie `trigger` (efekt warstwy; Floating UI mierzy po `await`, więc po kopii), dialog bez kontekstu zakresu. Kontekst niesie tylko stałe obiekty (`useState`), bez wartości osi (Q8, B4).
- D41: pass; `collection.ts` czysty, RTL przez `:dir(rtl)`, nazwa z `aria-label`.
- Q9: pass poza pierwszym wyborem (P1 pkt 3).
- Q10: pass; `MutationObserver`, `ResizeObserver` i nasłuchy żyją tylko z zamontowanym popupem/kontenerem; `press` słucha `window` od wciśnięcia do puszczenia.
- D43: pass; stałe czasu w `lib/` (`SUBMENU_FLIGHT_GRACE`, `TOOLTIP_GROUP_GRACE`, `TYPEAHEAD_RESET`, `SAMPLE_STEP`), ikony bez `strokeWidth`.
- D33/W21: pass; `platform` i `typeset` w `AXES` i `DEFAULT_CHOICES`, `profile` tylko w teście odrzucenia starego klucza.
- U16/Q13: pass; `'use client'` dokładnie w modułach z hookami lub runtime kompilatora, `ThemeScript` z `'use no memo'` zostaje serwerowy; `dist` każdego komponentu importuje `react/compiler-runtime`.
- Q17: fail (P1); M4 częściowo.
- W16: pass poza M2.
- Zero legacy, zero komentarzy, brak `any`: pass (grep `src/lib`, `src/components`).
- Dokumenty komponentów: pass poza M5 i M1 (`defaultOpen`).

## Regresje i integracja

- Uwagi części 1 zachowania: P1–P3, M1–M3, M5, M7 zamknięte w kodzie; M4 otwarte (M6 tutaj); S2, S4, S5 otwarte (S3 tutaj).
- Kolejność zdarzeń: odpięcie i podpięcie refów opcji `ToggleGroup` (`setActive(null)` w fazie mutacji, `setActive(B)` w fazie layoutu) daje zawsze nową opcję; `hold`/`release` sąsiednich podmenu porównuje trigger, więc kolejność cleanupu nie gubi pigułki.

## Wykonane kontrole

```text
bunx vitest run --maxWorkers=6 packages/tessera/src/lib/indicator.test.ts
  1 plik, 65 testów, wszystkie zielone, 140 ms
bunx vitest run --maxWorkers=6 packages/tessera/src/lib/popup-flight.test.ts
  1 plik, 22 testy, wszystkie zielone, 127 ms
odczyt: wszystkie pliki z zakresu w całości; dist/components/button/button.js;
  Base UI: useMergedRefs (utils 0.5.0), MenuSubmenuTrigger.mjs:155 (blockPointerEvents)
grep: komentarze, 'use client', any, profile/nextOption/MenuItemVariant/SUBMENU_SWITCH/GROUP_TIMEOUT/will-change, writeInstance/readMotion/forgetMotion
```

## Niewykonane lub nierozstrzygające kontrole

- Playwright (`menu.spec.ts`, `toggle-group.spec.ts`, `edges.spec.ts`) nieuruchamiany: wyniki trójkąta, zakresu D40 i Q9 na `dist` są REPORTED (testy istnieją i asercje sprawdzają opisane zachowanie).
- P1 i M1 potwierdzone odczytem kodu, bez testu odtwarzającego (zakaz zapisu poza raportem).
- Pozostałe testy jednostkowe (`press`, `collection`, `single-choice`, `theme`, `input-modality`) nieuruchamiane w tej recenzji.

## Wymagana ocena człowieka

```text
Uruchom: bun run dev
Zrób: w panelu motywu wyłącz klawiaturą (w kodzie lub próbce) wybraną opcję segmentu, potem przejdź Tabem przez stronę
Oczekiwany wynik: Tab wchodzi do grupy na pierwszą włączoną opcję (po poprawce P1)
Zwróć uwagę na: grupę bez wartości domyślnej: jeden przystanek Tab, nie po jednym na opcję
```

## Ograniczenia review

- Odczyt bez wykonania w przeglądarce; zachowania zależne od heurystyki `:focus-visible` i od Base UI oceniane z kodu i istniejących testów.

## Zalecany następny krok

- Poprawka P1 (przystanek Tab w `ToggleGroup` + test), M1, M5, M6 jedną małą paczką; M2–M4 do decyzji prowadzącego (M3 może zostać zapisanym ograniczeniem); potem runda kontrolna tylko dla P1.
