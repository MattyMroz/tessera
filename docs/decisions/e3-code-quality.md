---
kind: decision
date: 2026-11-01
stage: E3, fundament między rundą C a D
---

# Jakość kodu: decyzje z przeglądów paczki i laboratorium

Kto: prowadzący z upoważnienia właściciela („przy wyborze wybieraj te najlepsze”), 2026-11-01. Źródła: `docs/reviews/e3-code-quality-package.md` (FAIL, 8 poważnych), `docs/reviews/e3-code-quality-lab.md` (FAIL). Prowadzący sprawdził kluczowe twierdzenia obu raportów w kodzie (grep, liczby linii) — potwierdzone. Wykonanie: `docs/plans/e3-code-quality.md`.

Wniosek właściciela, który to rozstrzyga: „kod jak senior developer: prosto, wszystko ma mieć swój zakres i miejsce, bez redundancji, bez dziwnych konstrukcji, najlepsze praktyki React/JS”.

## 1. Publiczne API paczki (P1)

**Wybór.** `exports` wymienia jawnie tylko `lib/theme`, `lib/use-theme`, `lib/theme-script`, `lib/tone`, komponenty, style i wtyczkę ESLint. Pozostałe moduły `lib/` są wewnętrzne. Laboratorium sprawdza wskaźnik i klawiaturę przez komponenty, nie przez `lib/indicator` ani `lib/collection`. Test `test/package/package.test.ts` pilnuje listy.

**Odrzucone.** Wzorzec `./lib/*` (każdy refaktor wnętrza łamie konsumenta; ok. 40 eksportów wewnętrznych było publicznych). Publiczne `lib/instance` — brak konsumenta; wraca, gdy pojawi się kontrakt.

## 2. Stałe wariantów (R0 laboratorium)

**Wybór.** Komponent z wariantami eksportuje stałą obok typu, jak `TONES`: `BUTTON_VARIANTS`, `BADGE_VARIANTS`, `TOGGLE_GROUP_VARIANTS`; typ wyprowadzony przez `(typeof X)[number]`. Laboratorium i testy biorą listę z biblioteki.

**Odrzucone.** Lokalna lista w laboratorium (druga kopia wiedzy, rozjeżdża się — dziś są 5 kopii).

## 3. Interaktywność w przepisie `control` (P5)

**Wybór.** Komponent statyczny (Badge, Kbd) mówi to atrybutem `data-static`; przepis odwraca warunek jednym selektorem (`:not([data-static])`). Lista „wyłączonych” (`:disabled, [data-disabled], [aria-disabled='true']`) ma jedno miejsce w przepisie. Kopia `INTERACTIVE_CONTROL` w testach znika.

**Odrzucone.** Siedem kopii listy elementów interaktywnych (już się rozjechały). Prywatna zmienna przełącznika `--_interactive` (działa pośrednio, trudniejsza do czytania niż atrybut, który komponent i tak zna).

## 4. Tokeny bez konsumenta (S3)

**Wybór.** 13 tokenów widocznych tylko na `/foundation` (`--ts-color-chip`, `-hint-label`, `-inverse-hover`, `-inverse-press`, `-opaque-separator`, `-secondary-background`, `-tertiary-background`, `-tertiary-label`, `-tint-bright`, `-tint-dim`, `--ts-depth-layer-toast`, `--ts-type-screen-title-size`, `--ts-type-screen-title-leading`) znika z silników, laboratorium i specyfikacji. Token wraca w rundzie, której komponent go używa (np. warstwa toastu w rundzie G).

**Odrzucone.** Pełna paleta z góry (YAGNI; każdy token liczy się do budżetu B8 i do wzorca, który kopiują kolejne rundy).

## 5. Struktura (decyzje techniczne, bez wpływu na wygląd)

- Przepis nie zna komponentu ani roli: układ popovera, dialogu i akcji alert dialogu mieszka w CSS komponentu; reguły „pole w karcie” w jednym pliku gospodarza (`card.css`) (P6).
- Mapa ton → kolor istnieje raz, w silniku; przepisy czytają wynik (P4).
- `lib/indicator.ts` dzieli się według odpowiedzialności: odczyt silnika ruchu, lot (geometria i fizyka), sterownik wskaźnika (P3).
- Wtyczka ESLint konsumenta to jedna reguła bez trybów; strażnik źródeł Tessery jest lokalną regułą repo ładowaną ze źródła, nie z `dist` (P2).
- Części poza gospodarzem: jedna polityka w każdym kontekście — błąd jak `usePart` (P7).
- `ToggleGroup` bez kopiowania kontrolowanego `value` w efekcie (P8).
- Laboratorium: jedno opakowanie sekcji, jedna lista stron, jedne próbki, `tests/support/*` zamiast worka `helpers.ts`, zero `waitForTimeout` poza nazwanymi wyjątkami.

## 6. Etap 1 (TS i React paczki): rozstrzygnięcia wykonawcy

Kto: wykonawca etapu 1, 2026-11-02, do oceny prowadzącego. Dowód: bramka w raporcie etapu (typecheck, lint, build, vitest, Playwright).

- **Podział `lib/indicator.ts` (P3, M1).** `motion.ts` (`Motion`, `MotionMode = Choices['motion']`, `parseMotion`, `readMotion`, `milliseconds`, `MILLISECONDS_PER_SECOND`), `flight.ts` (typy `Point`/`Box`/`Rect`/`Size`, oś ekranu `ScreenAxis`, sprężyna, krzywe, `planFlight`, `course`, `resume`, `visibleAt`, jedna stała `SETTLED`), `indicator.ts` (wybór celu, pomiar `measureBox`/`wallsOf`, sterownik DOM, `useIndicator`). `measureBox` i `wallsOf` zostają przy sterowniku, bo przyjmują prostokąty i paddingi z DOM, a lot o DOM nic nie wie. `motion.ts` czyta `getComputedStyle`, więc wchodzi na listę pomiaru Q7 (spec Q7 i strażnik zaktualizowane). Odrzucone: `measureBox` w `flight.ts` (miesza geometrię pomiaru z fizyką lotu). Typ wewnętrzny `Placement` w `popup-flight.ts` → `Shown` (inne znaczenie niż `Placement` wskaźnika).
- **`TOOLTIP_GROUP_GRACE` (S6)** w nowym `lib/tooltip-group.ts`. Odrzucone: stała w `tooltip.tsx` (strażnik literałów komponentu i lista stałych czasu wymagają `lib/`), wspólny moduł czasów (niska spójność).
- **Konteksty (P7).** `useHost(context, host, part)` w `lib/slot.ts`, ten sam tekst błędu co `usePart` bez dopisku o innych częściach. Konteksty gospodarzy: `ScopeContext` (Menu, MenuSubmenu, Popover), `GroupContext`, `SubmenusContext` (dawny `MenuScopeContext`, M1), `SubmenuTriggerContext`. `BarContext` zostaje `null` czytanym wprost: `Tooltip` bez paska jest poprawnym stanem, nie złym miejscem części; jedyny wpis listy wyjątków strażnika z powodem. `SlotHost` czyta tylko `usePart`.
- **Zakres osi w popupie (M9).** Jedna fabryka `createScopeAnchor` i jedno podpięcie: ref popupu `copyTo`. Pasek podpowiedzi niesie `copyScope` wyzwalacza w `payload`, więc mapa wyzwalaczy (`createScopeTriggers`), stan `node` i efekt w `TooltipPopup` znikają. Odrzucone: mapa z jednym stałym kluczem dla Menu i Popover (kod klucza w każdym miejscu użycia).
- **`ToggleGroup` (P8), zmienione względem raportu.** Wybór liczony w renderze i podawany przez kontekst renderuje przy każdej zmianie wszystkie opcje, a kontrakt `toggle-group.spec.ts` („re-renders only the previously and the newly chosen option…”, „re-renders at most the tab stop and the newly chosen option…”) wymaga renderu tylko zmienionych opcji. Selektywny render w tym samym przebiegu wymaga zapisu do magazynu w renderze (zakazane w React). Dlatego magazyn `single-choice` zostaje właścicielem wybranej wartości, a efekt przepisuje do niego tylko kontrolowane `value` (zmiana z zewnątrz grupy, np. reset panelu). Zrobione: jeden wyzwalacz `arrange` (efekt gospodarza), wybrana opcja zgłasza się jawnym efektem z zależnością `state` (`showChosen`), `Group` bez `| undefined`, `icon`/`children` warunkiem `!= null`. Odrzucone: optymistyczne `choose` w handlerze w trybie kontrolowanym (rozjazd z propem, gdy rodzic odrzuci wartość). Do decyzji właściciela: czy budżet renderu per opcja zostaje, czy wybór idzie przez kontekst.
- **`composeRefs` bez `useMemo` (M2).** Build kompiluje wszystko React Compilerem (`tsdown.config.ts`); w `dist` wywołanie `composeRefs` siedzi w kopie pamięci kompilatora (`$[n] !== ref`), więc ręczne `useMemo`/`useCallback` znikają także w `slot.ts`, `indicator.ts` i `tooltip.tsx`.
- **Jeden typ propsów (M3).** `Unstyled<P, K>` w `lib/unstyled.ts`, wyprowadzony ze stałej `APPEARANCE_PROPS` (moduł z samym typem budowałby pusty JS i oblewał kontrakt paczki). Zestaw kluczy jednolity: `className`, `style`, `render` dla każdego elementu i części; dla elementu natywnego `render` nie istnieje, więc różnica `Input`/`Textarea` znika bez zmiany typów.
- **Części Dialog i Popover (M4).** `lib/popup-slots.ts`: `POPUP_SLOTS`, `PopupDismissProps`, `PopupActionsProps`; publiczne `DialogDismissProps`, `PopoverDismissProps`, `DialogActionsProps`, `PopoverActionsProps` to te typy pod nazwą rodziny. Części `Title`, `Description`, `Actions`, `Dismiss` zostają po jednej na rodzinę: różne części Base UI i inny gospodarz w `usePart`; wspólna część w `lib/` ominęłaby strażników komponentów, a plik w `components/` liczy się jako komponent.
- **`ConfirmHost` (M6).** Stan `pending`/`error` należy do `ConfirmHost` (klucz `id` żądania), `ConfirmPopup` zgłasza go w handlerze; ostatnie żądanie zna moduł (`latest` obok `confirmHandle`), więc `onOpenChange` czyta stan właściciela. Odrzucone: rozstrzyganie `false` dopiero przy odmontowaniu (zmienia chwilę rozstrzygnięcia obietnicy).
- **`Tooltip` w `TooltipBar` (M7), bez zmiany.** `docs/tooltip.md` opisuje kontrakt „`side` paska wygrywa nad `side` podpowiedzi”; błąd albo `side` w `payload` zmienia publiczne zachowanie propu. Do decyzji właściciela.
- **Stałe wariantów (§2).** `BUTTON_VARIANTS`, `BADGE_VARIANTS`, `TOGGLE_GROUP_VARIANTS` obok typu, typ `(typeof X)[number]`.
- **Fokus pola (S7).** `focusFieldOfLabel` (dawne `focusUnlabelled` z `field.tsx`) w `lib/focus-field.ts` obok `focusFieldOnPress`: jedna wiedza „wciśnięcie poza kontrolką fokusuje pole”, dwa wejścia (padding i ikona kontrolki, etykieta bez kontrolki).
- **Wtyczka ESLint (P2, M10).** `no-local-appearance` bez schematu opcji; strażnik źródeł to `tessera-source/component-appearance` w `test/guards/component-appearance.ts`, ładowany przez `eslint.config.js` ze źródła (importy z `.ts`, `allowImportingTsExtensions`). `CONTAINER_WIDTHS` w `test/guards/css-layers.ts` (jedyny czytelnik progu). `LAYOUT_CLASSES` i `LAYOUT_FAMILIES` przeniesione do modułu danych `layout.ts` obok `APP_LAYOUT`: polityka (`style-policy.ts`) już ich nie eksportuje, a test martwych wpisów czyta dane, nie politykę; odrzucone: usunięcie testu martwych wpisów (spada liczba testów, wraca gnicie listy). M10 częściowo: jedna stała `MAX_DEPTH` i jedno wyszukanie inicjalizatora `const` (`constInitializer`) dla obu rozwiązywaczy; typy ESTree zamiast własnego `Node` wymagają typów JSX z `@typescript-eslint/utils` (nowa zależność paczki), więc do decyzji właściciela.
- **Rozstrzygnięcia prowadzącego po odbiorze etapu 1 (2026-11-02).** P8: zostaje magazyn `single-choice` z renderem tylko zmienionych opcji i efektem przepisującym kontrolowane `value` (nazwany wyjątek „Pułapek”); drugi commit przy zmianie z zewnątrz jest tańszy niż render wszystkich opcji przy każdym wyborze (telefon). Odrzucone: wybór przez kontekst. M7: zostaje kontrakt `docs/tooltip.md` („`side` paska wygrywa”). M10: bez typów ESTree i bez nowej zależności `@typescript-eslint/utils` (YAGNI). M5: nazwy części (`MenuContent` vs `…Popup`, `DialogClose` vs `DialogDismiss`) ujednolica etap publicznego API (paczka G) razem z dokumentacją, jednym przebiegiem.
- **Bez zmiany (M5, M8 częściowo).** Nazwy `MenuContent` vs `…Popup`, `DialogClose` vs `DialogDismiss` i przyjmowanie reszty propsów przez `ButtonGroup`, `ToggleGroup*`, `CardHeader`, `CardActions` to publiczne API (zakaz etapu). `alert.tsx`: `variant={undefined}` łamie `exactOptionalPropertyTypes` bez poszerzenia publicznego typu `Text`. `textarea.tsx`: podział propsów wymusza typ `BaseField.Control` (pole `<input>`), a `data-max-rows` czyta CSS (etap 2). Uproszczone: typy mapowane `LookAttributes`/`ContentProps` w `button.tsx` i `card.tsx`, parametr `ariaDisabled` w `isBlocked`, jedna forma `aria-hidden="true"`.
