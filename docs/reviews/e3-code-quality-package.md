---
kind: review
status: fail
reviewed-state: worktree .worktrees/e2, praca niezacommitowana (packages/tessera/src, test, scripts), odczyt 2026-11-01
date: 2026-11-01
---

# Review: jakość kodu paczki `@mattymroz/tessera`

## Zakres

- przedmiot: `packages/tessera/src/**` (components, lib, eslint, engines, recipes, styles, themes), `packages/tessera/test/**`, `packages/tessera/scripts/**`, plus `package.json` i `tsdown.config.ts` paczki jako granica publicznego API.
- baseline: bieżący stan plików w worktree; równolegle inny wykonawca poprawia błędy, więc numery linii mogą się przesunąć.
- authority: wymaganie właściciela (prosto, właściwy zakres i miejsce, bez redundancji, bez dziwnych konstrukcji, najlepsze praktyki React i TS), `AGENTS.md` repo Tessery, `docs/structure.md`.
- ryzyka: zła granica modułów i publicznego API, zduplikowana wiedza, sprytne konstrukcje, wzorce React niezgodne z modelem danych.
- poza review: poprawność wizualna i zachowanie w przeglądarce, laboratorium `apps/docs` (osobna recenzja `e3-code-quality-lab.md`), `packages/tessera/docs/*.md`.

## Werdykt

**Status:** FAIL względem poprzeczki właściciela.

**Najważniejszy powód:** lokalnie kod jest porządny (strict TS bez `any`, nazwy niosą sens, testy opisują zachowanie, strażnicy działają), ale ma osiem strukturalnych problemów zakresu i redundancji: publiczne API obejmuje każdy moduł `lib/`, wewnętrzny strażnik komponentów jest wysyłany w publicznej wtyczce ESLint, `lib/indicator.ts` miesza pięć odpowiedzialności, mapa ton → kolor i lista „elementów interaktywnych” są skopiowane po przepisach, układ pola w karcie jest rozsmarowany po czterech plikach CSS, a konteksty React i stan `ToggleGroup` mają po dwie drogi do tego samego. To nie jest bałagan, ale nie jest też „od początku najwyższy poziom”, i każdy z tych punktów będzie drożał z każdym nowym komponentem E3.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Publiczne API paczki = każdy plik `lib/`

- miejsce: `packages/tessera/package.json:14` (`"./lib/*"`), `src/lib/*.ts`.
- dowód: wzorzec `./lib/*` eksportuje wszystkie moduły, w tym czysto wewnętrzne: `collection`, `single-choice`, `slot`, `compose-refs`, `press`, `focus-field`, `title-when-cut`, `scope`, `popup-flight`, `instance` i `indicator` (ok. 40 eksportów, m.in. `oscillator`-owe `planFlight`, `course`, `wallsOf`, `ownScale`). Konsument (laboratorium) używa tylko `theme`, `use-theme`, `theme-script`, `tone`, oraz `indicator` i `collection` w próbkach i testach.
- wpływ: każda zmiana nazwy czy podział modułu wewnętrznego staje się zmianą łamiącą API; zasada biblioteki „eksportuj małą, świadomą powierzchnię” (skill coding, „Biblioteka i SDK”) jest złamana. Uzasadnia też, czemu wiele funkcji jest eksportowanych wyłącznie dla testów.
- minimalna reakcja: jawne wpisy `exports` tylko dla `lib/theme`, `lib/use-theme`, `lib/theme-script`, `lib/tone` (ewentualnie `lib/instance`, jeśli ma być kontraktem); laboratorium testuje wskaźnik i klawiaturę przez komponenty, nie przez `lib/indicator` i `lib/collection`. `test/package/package.test.ts` sprawdza nową listę.

#### P2. Wewnętrzny strażnik komponentów siedzi w publicznej wtyczce ESLint

- miejsce: `src/eslint/no-local-appearance.ts:7`, `:49-102`, `:124-127`; `eslint.config.js:18-21`; `src/eslint/layout.ts:1-8`.
- dowód: jedna reguła ma opcję `mode: 'app' | 'components'`, która podmienia cały wizytor i połowę komunikatów (`component`, `instance`, `svg`, `literal` dotyczą tylko trybu `components`). Tryb `components` służy wyłącznie do pilnowania źródeł Tessery, a jest wysyłany konsumentom w `@mattymroz/tessera/eslint`. To samo dotyczy `COMPONENT_LAYOUT` i `CONTAINER_WIDTHS` w `src/eslint/layout.ts` (konsumuje je tylko `test/guards/css-layers.ts`) oraz eksportów `LAYOUT_CLASSES`, `LAYOUT_FAMILIES` w `style-policy.ts:3,13` (konsumuje je tylko `rules.test.ts`).
- wpływ: dwie reguły udające jedną (opcja przełącza semantykę, nie parametr), publiczne API wtyczki szersze o wewnętrzną politykę, a lint własnych źródeł zależy od świeżego `dist` (pułapka opisana w `AGENTS.md`, sztucznie wymuszona tym miejscem). `CONTAINER_WIDTHS` to próg wyglądu, nie wiedza ESLint.
- minimalna reakcja: rozdzielić na regułę konsumenta (`no-local-appearance`, bez opcji) i lokalną regułę repo dla `src/components` poza `dist` (np. `packages/tessera/lint/` ładowany ze źródła przez `eslint.config.js`); `CONTAINER_WIDTHS` przenieść do miejsca, które opisuje wygląd (obok przepisów albo do strażnika), a eksporty tylko-dla-testów zastąpić testem kontraktu reguły.

#### P3. `lib/indicator.ts` (616 linii) łączy pięć odpowiedzialności, a sąsiednie moduły zależą od niego po typy i ruch

- miejsce: `src/lib/indicator.ts:7-109` (odczyt silnika ruchu), `:129-166` (geometria i pomiar), `:171-374` (fizyka sprężyny, krzywe Béziera, lot, ściany), `:441-587` (sterownik DOM), `:589-616` (hook React); `src/lib/press.ts:1`, `src/lib/popup-flight.ts:4`, `src/components/tooltip/tooltip.tsx:6`, `src/components/menu/menu.tsx:8`.
- dowód: `press.ts` importuje `readMotion` z modułu wskaźnika; `popup-flight.ts` bierze z niego `Motion`, `Point`, `Rect`; tooltip i menu też biorą `readMotion` z `indicator`.
- wpływ: brak spójności (GRASP: high cohesion), wiedza o silniku ruchu ukryta w pliku wskaźnika, każdy konsument ruchu ciągnie w zależnościach cały moduł wskaźnika. Plik jest trudny do objęcia bez kontekstu.
- minimalna reakcja: `lib/motion.ts` (`Motion`, `parseMotion`, `readMotion`, `milliseconds`), `lib/flight.ts` (czysta fizyka: oscylator, krzywe, `planFlight`, `course`, `resume`, `visibleAt`, typy `Point`/`Box`/`Rect`/`Size`), `lib/indicator.ts` tylko sterownik DOM i `useIndicator`. Czysty podział plików, bez zmiany zachowania; testy idą za funkcjami.

#### P4. Mapa ton → kolor skopiowana w trzech przepisach, a strażnik wymusza kopię

- miejsce: `src/recipes/control.css:173-206`, `src/recipes/surface.css:240-262`, `src/recipes/row.css:53-75`; `test/guards/css-layers.ts:712` (`toneProblems`).
- dowód: w każdym przepisie ten sam blok `&[data-tone='danger'] { --_tint: var(--ts-color-danger); }` itd. dla sześciu tonów; `control` dodatkowo `--_on-tint` i pięć razy `--_glow: 0 0 transparent`.
- wpływ: jedna reguła wiedzy (który kolor jest tonem) w trzech miejscach; nowy ton = trzy edycje plus strażnik, który pilnuje, że kopie istnieją, zamiast tego, żeby ich nie było (DRY, jedno źródło prawdy).
- minimalna reakcja: wyjście silnika (np. w `state.css` albo `color.css`): `[data-tone='danger'] { --ts-tone-tint: var(--ts-color-danger); --ts-tone-on-tint: var(--ts-color-on-danger); }`, z domyślnym brakiem poświaty dla tonów innych niż `accent`; przepisy czytają `--ts-tone-*`. `toneProblems` zamienić na test, że każda wartość `TONES` ma regułę silnika.

#### P5. Lista „elementów interaktywnych” i lista „wyłączonych” powtórzone 7 i 9 razy

- miejsce: `src/recipes/control.css:44, 52, 155, 269, 290, 296, 301` (`:where(button, a[href], input, select, textarea, [role='button'], [role='radio'], [role='tab'], [role='menuitem'], [tabindex], :has(> [data-slot='input']))`); `:disabled, [data-disabled], [aria-disabled='true']` w `control.css`, `row.css:131,135,147`, `indicator.css:56` i w JS `src/lib/indicator.ts:125-127`.
- dowód: siedem kopii listy selektorów w jednym pliku, z jedną wersją bez `:has(...)` (`control.css:301`), czyli kopie już się rozjechały.
- wpływ: nowa rola interaktywna (np. `menuitemcheckbox`, `option`) wymaga zmian w siedmiu miejscach; selektory są nieczytelne (linie po ponad 250 znaków). Laboratorium trzyma jeszcze trzecią kopię (`INTERACTIVE_CONTROL` w `apps/docs/tests/helpers.ts`).
- minimalna reakcja: komponent wie, czy jest statyczny (Badge, Kbd), więc niech to powie atrybutem (np. `data-variant` statyczne albo `data-static`), a przepis odwraca warunek jednym prostym selektorem; jeśli atrybut odpada, jedna prywatna zmienna przełącznika ustawiana raz (`--_interactive: 1`) i czytana w regułach.

#### P6. Układ pola w karcie i reguły komponentów rozsmarowane po przepisach i obcych komponentach

- miejsce: `src/recipes/text.css:59` i `:80` (`[data-component='field']` w przepisie), `src/recipes/control.css:274` (`[role='alertdialog'] > [data-slot='actions'] > [data-recipe='control'] { flex: 1 }`), `src/recipes/surface.css:104-112` (`[role='menu']`), `:188-221` (układ popovera i dialogu: `display: flex; flex-direction: column; gap`), `src/components/field/field.css:9,14` (`[data-component='card']`), `src/components/toggle-group/toggle-group.css:10` (`[data-component='field']`), `src/components/card/card.css:30-38`.
- dowód: jedno zachowanie („pola w karcie dzielą kolumny”, `docs/structure` i `AGENTS.md` pułapka subgrid) jest w `card.css`, `field.css`, `toggle-group.css` i `text.css`; przepis `text` zna komponent `field`, przepis `control` zna rolę `alertdialog`, przepis `surface` niesie układ popovera, choć układ karty i alertu jest w CSS komponentów.
- wpływ: łamie model warstw (przepis nie powinien znać komponentu; układ części należy do CSS komponentu), zmiana jednego komponentu wymaga szukania po trzech warstwach.
- minimalna reakcja: układ (`display`, `flex-direction`, `gap`, `flex: 1`) popovera, dialogu i akcji alert dialogu przenieść do `components/<rodzina>/<nazwa>.css`; reguły „pole w karcie” zebrać w jednym pliku właściciela (karta jest gospodarzem, więc `card.css`), a przepis `text` wyrazić bez `data-component` (np. slot albo zmienna ustawiana przez kartę).

#### P7. Konteksty React: trzy różne polityki dla „część poza gospodarzem”

- miejsce: `src/lib/slot.ts:9-11` (`usePart` rzuca błąd), `src/lib/scope.ts:52` (domyślny kontekst z no-opami), `src/components/toggle-group/toggle-group.tsx:29` (domyślny kontekst z prawdziwym `createSingleChoice(null)`), `src/components/menu/menu.tsx:40-45` (domyślny kontekst tworzy `createSubmenuFlight()` przy imporcie modułu), `src/components/tooltip/tooltip.tsx:16` (`null`).
- dowód: `PopoverTrigger` poza `Popover` cicho nic nie rejestruje, `ToggleGroupItem` poza grupą renderuje się z fałszywym stanem, `PopoverTitle` poza `PopoverPopup` rzuca czytelny błąd. Typy `Group.setActive` i `Group.arrange` są `| undefined` (`toggle-group.tsx:25-26`) tylko dlatego, że domyślna wartość jest atrapą.
- wpływ: dwie drogi do tego samego (U35 „część stoi tylko w gospodarzu” obowiązuje wybiórczo), sztuczne `?.` w kodzie, obiekt tworzony jako efekt importu.
- minimalna reakcja: wszystkie konteksty gospodarzy `createContext<T | null>(null)` plus jeden pomocnik w `lib/slot.ts` (np. `useHost(context, host, part)`), który rzuca ten sam błąd co `usePart`; usunąć `| undefined` z `Group`.

#### P8. `ToggleGroup` synchronizuje props do zewnętrznego magazynu efektem i ma dwa wyzwalacze `arrange`

- miejsce: `src/components/toggle-group/toggle-group.tsx:80`, `:97-103`, `:163-165`, `:169`.
- dowód: kontrolowane `value` trafia do `choice` w `useLayoutEffect(() => { if (value !== undefined) choice.choose(value) })`, więc pierwszy render elementów czyta stary stan i dopiero drugi (wymuszony synchronicznie przez `useSyncExternalStore`) pokazuje nowy. `group.arrange?.()` biegnie po każdym renderze gospodarza bez tablicy zależności i jeszcze raz z każdego elementu przy zmianie `value`/`disabled`; każde wywołanie odpytuje DOM. Ref `setActive` jest przełączany między funkcją a `undefined` (`ref={state === 'chosen' ? setActive : undefined}`), żeby wykryć wybrany element.
- wpływ: wzorzec „synchronizuj props do stanu efektem” zamiast wyliczenia (React: you might not need an effect), podwójny render przy każdej zmianie kontrolowanej, sprytny ref jako zdarzenie, logika do odszyfrowania.
- minimalna reakcja: wybrana wartość = `value ?? wewnętrzny stan` liczona w renderze i podawana elementom przez kontekst (albo `choice.choose` wołane w handlerze, nie w efekcie); jeden wyzwalacz `arrange` (efekt gospodarza bez zależności wystarcza, bo elementy renderują się w nim); wybrany element zgłasza się jawnym efektem z zależnością `state`, nie podmianą refa.

### Mniejsze

#### M1. Kolizje nazw i zdublowane stałe między modułami `lib/`

- miejsce: `src/lib/theme.ts:21` (`Axis` = oś motywu) i `src/lib/indicator.ts:24` (`Axis = 'x' | 'y'`); `src/lib/collection.ts:5` (`Direction = 'ltr' | 'rtl'`); `Placement` w `indicator.ts:29` i `popup-flight.ts:42` (inne znaczenia); `SETTLED = 0.5` w `indicator.ts:60` i `popup-flight.ts:50`; `MotionMode` (`indicator.ts:7,57`) powtarza `THEME_CONFIG.axes.motion`; „scope” znaczy kopię osi motywu (`ScopeContext`) i stan podmenu (`MenuScopeContext`, `menu.tsx:28,40`).
- wpływ: te same słowa = różne pojęcia, te same pojęcia = różne słowa; czytelnik musi sprawdzać import.
- minimalna reakcja: przy podziale z P3: `MotionMode = Choices['motion']`, jedna stała progu w `flight.ts`, oś ekranu nazwać inaczej niż oś motywu, `MenuScope` → np. `SubmenuHold`.

#### M2. `useMemo(() => composeRefs(...))` powtórzone 10 razy przy włączonym React Compiler

- miejsce: `button.tsx:62`, `field.tsx:33`, `card.tsx:52`, `dialog.tsx:26`, `popover.tsx:36`, `menu.tsx:69,190,209`, `toggle-group.tsx:95`, `tooltip.tsx:61`; także `useCallback` w `tooltip.tsx:96`, `slot.ts:45`, `indicator.ts:610`.
- wpływ: build kompiluje wszystko React Compilerem (`tsdown.config.ts:29`, `panicThreshold: 'all_errors'`), więc ręczna memoizacja to drugi mechanizm robiący to samo i szum w każdym komponencie złożonym.
- minimalna reakcja: wołać `composeRefs(...)` wprost i zostawić memoizację kompilatorowi; jeśli stabilność refa ma być jawna, jeden hook `useComposedRefs` w `lib/compose-refs.ts` zamiast dziesięciu kopii `useMemo`.

#### M3. `Omit<..., 'className' | 'style' | 'render'>` powtórzone 28 razy

- miejsce: wszystkie komponenty, najgęściej `menu.tsx` (7), `dialog.tsx`, `field.tsx`, `popover.tsx` (po 4).
- wpływ: reguła „części Base UI bez wyglądu” jest wiedzą powtórzoną w każdej sygnaturze; pominięcie jednego klucza w jednym miejscu jest łatwe (np. `textarea.tsx:9` i `input.tsx:8` mają różne zestawy).
- minimalna reakcja: jeden typ w `lib/` (np. `type Part<P> = Omit<P, 'className' | 'style' | 'render'>`) i jego użycie; strażnik w `contracts.test.ts` może wtedy sprawdzać jeden typ.

#### M4. Części `Dialog` i `Popover` są kopiami

- miejsce: `dialog.tsx:12-16, 45-79` i `popover.tsx:13-17, 56-90`.
- dowód: identyczne `DIALOG_SLOTS` i `POPOVER_SLOTS`, identyczne `DialogDismissProps`/`PopoverDismissProps` i `DialogActionsProps`/`PopoverActionsProps`, ta sama budowa Title/Description/Actions/Dismiss.
- wpływ: kolejność slotów powierzchni nakładki to jedna reguła w dwóch miejscach; trzeci gospodarz (np. toast albo sheet w E3) zrobi trzecią kopię.
- minimalna reakcja: wspólna stała kolejności i wspólne typy (`DismissProps`, `ActionsProps`) w jednym module; część `Actions` może być jedna, sparametryzowana nazwą gospodarza.

#### M5. Niespójne nazwy i polityka propsów między rodzinami

- miejsce: `menu.tsx:108` `MenuContent` vs `PopoverPopup`, `DialogPopup`; `DialogClose` i `DialogDismiss` (`dialog.tsx:72,76`) obok siebie bez różnicy w nazwie wyjaśniającej „×”; `ButtonGroup`, `ToggleGroup`, `ToggleGroupItem`, `CardHeader`, `CardActions` nie przyjmują reszty propsów ani refa, a `Badge`, `Kbd`, `Alert`, `Field*` przyjmują; `aria-hidden` (`menu.tsx:82`) vs `aria-hidden="true"` (`toggle-group.tsx:56`); warunki slotów `!= null &&` (`button.tsx:93`) vs `icon ? … : null` (`toggle-group.tsx:181-186`, które gubi `0`).
- wpływ: te same pojęcia, różne słowa i różne kontrakty; konsument musi pamiętać, który komponent co przyjmuje.
- minimalna reakcja: jedna nazwa dla popupu (`…Popup` albo `…Content`) we wszystkich rodzinach; zasada „każdy komponent przekazuje atrybuty i ref do elementu głównego” albo jawna lista wyjątków w `docs/`; jeden zapis warunku slotu.

#### M6. `ConfirmHost`: dziecko zapisuje ref rodzica w efekcie

- miejsce: `src/components/dialog/alert-dialog.tsx:52-59`, `:93-107`.
- dowód: `ConfirmPopup` dostaje `activeRef` w propsach i w `useLayoutEffect` przepisuje do niego swój stan `run.pending`, a gospodarz czyta go w `onOpenChange`.
- wpływ: odwrócony przepływ danych (dziecko synchronizuje kopię stanu dla rodzica), dwa źródła prawdy o `pending`.
- minimalna reakcja: stan `pending` i `error` w `ConfirmHost` (albo w `payload` żądania) i przekazany w dół; `onOpenChange` czyta stan właściciela.

#### M7. `Tooltip` wewnątrz `TooltipBar` po cichu ignoruje `side`

- miejsce: `src/components/tooltip/tooltip.tsx:91-97`, `:117`.
- wpływ: prop przyjęty w typie nie działa w jednym kontekście; pułapka API.
- minimalna reakcja: typ rozłączny (w pasku bez `side`) albo `side` niesiony w `payload`.

#### M8. Drobne dziwne konstrukcje w komponentach

- `alert.tsx:7, 37`: `{...(title == null ? {} : DESCRIPTION)}` zamiast `variant={title == null ? undefined : 'description'}`.
- `textarea.tsx:14-31`: część propsów idzie do `BaseField.Control`, reszta do `<textarea>` w `render`, a `Input` przekazuje wszystko do `BaseField.Control`; ten sam rodzaj pola, dwa wzorce.
- `textarea.tsx:28-29`: `maxRows` jedzie dwa razy (`data-max-rows` jako flaga i `--ts-i-value` jako liczba) z rzutowaniem `as CSSProperties`.
- `button.tsx:31, 33`, `card.tsx:38`: typy mapowane `{ [K in 'variant' | ...]: ButtonLook[K] | undefined }` do odszyfrowania tam, gdzie wystarczy zwykły typ obiektu.
- `button.tsx:69`: parametr `disabled` przyjmuje wartość `aria-disabled`.
- minimalna reakcja: uprościć w miejscu, bez zmiany zachowania.

#### M9. Dwie drogi kopiowania osi motywu do popupu

- miejsce: `src/lib/scope.ts:26-50` (`createScopeAnchor` i `createScopeTriggers`), `popover.tsx:36` i `menu.tsx:69` (ref callback `copyTo`), `tooltip.tsx:54-61` (stan `node` plus `useLayoutEffect`).
- wpływ: kotwica to mapa wyzwalaczy z jednym kluczem; dwa obiekty i dwa sposoby wywołania dla jednej operacji.
- minimalna reakcja: jeden `createScopeTriggers` (kotwica = klucz stały) i jeden sposób podpięcia w popupie.

#### M10. Parser strażnika i statyczne rozwiązywanie wartości napisane dwa razy

- miejsce: `src/eslint/static-values.ts:50-68` (`constInit`, `resolve`) i `src/eslint/compositor-motion.ts:29-75` (`binding`, `keysOf`), oba z własnym `MAX_DEPTH = 6`; własny typ AST `Node` z `[key: string]: unknown` i rzutowania `raw as Node`, `as unknown as Rule.Node`, `key.name as string` w każdej regule (`static-values.ts:3`, `no-local-css.ts:52-66`, `no-local-appearance.ts:51,79-96`).
- wpływ: dwa rozwiązywacze stałych do utrzymania; ręczny typ AST wyłącza sprawdzanie typów dokładnie tam, gdzie łatwo o pomyłkę.
- minimalna reakcja: jeden rozwiązywacz w `static-values.ts` (z wariantem „także funkcja budująca”) i typy ESTree z `eslint` (`Rule.Node`, `ESTree.*`) albo `@typescript-eslint/utils` zamiast własnego `Node`.

#### M11. Silniki CSS: powtórzone bloki i aliasy

- `engines/motion.css:65-77` i `:79-93`: blok `[data-motion='off']` skopiowany 1:1 do `@media (prefers-reduced-motion)` (11 deklaracji).
- `engines/focus.css:17-24` i `engines/state.css:38-45`: ten sam prywatny przełącznik „akcent ≠ contrast” liczony dwa razy (`--_ts-focus-accent`, `--_ts-state-accent`); to wyjście koloru, nie prywatna wiedza dwóch silników.
- `engines/depth.css:8-9` i `:39-47`: `--ts-depth-overlay-bg` i `--ts-depth-modal-bg` deklarowane domyślnie i drugi raz identycznie pod `[data-material='solid']`, a selektor `[data-material='solid']` ma dwa bloki.
- `engines/size.css:68-70`: `--_ts-size-step` → `--ts-size-step` → `--ts-size-height`, oraz `--ts-size-box: var(--ts-size-icon)`: trzy nazwy jednej wartości.
- `engines/shape.css:107-110`: `[data-inset='group']` powtarza domyślne `--_ts-shape-spread: 1`.
- minimalna reakcja: jedno wyjście `--ts-color-accented` (0/1) w silniku koloru; wyłączenie ruchu przez jeden prywatny przełącznik ustawiany w obu miejscach; usunąć powtórzone deklaracje i aliasy bez konsumenta.

#### M12. Strażnik wymusza nieczytelny CSS

- miejsce: `recipes/control.css:130` (`calc(var(--ts-size-leading) + var(--ts-size-leading) + var(--ts-size-leading))`), `:319` (`calc(var(--ts-shape-stroke) + var(--ts-shape-stroke))`), `recipes/surface.css:202-203, 217`, `recipes/row.css:77-108` (drabina `aria-level`) i jej kopia w `test/guards/css-layers.ts:145-154` (`ARIA_LEVEL_INDENT`).
- wpływ: zakaz liczb innych niż `0`, `1`, `-1` w przepisach daje mnożenie przez dodawanie; strażnik trzyma dosłowną kopię kodu przepisu.
- minimalna reakcja: liczby wyglądu jako nazwane wyjścia silnika (np. `--ts-size-field-rows`), a drabinę poziomów porównywać ze wzorem, nie z kopią.

#### M13. Ta sama lista w dwóch źródłach: akcenty, neutralne, tryby

- miejsce: `src/lib/theme.ts:3-19` (`AXES.accent`, `neutral`, `mode`) i `scripts/palette.ts` (`ACCENT_FAMILIES`, `ACCENTS`, `NEUTRALS`, `MODES`); `STATUSES` w `palette.ts` obok `TONES` w `src/lib/tone.ts`.
- wpływ: zgodność pilnują pośrednio dwa testy w `contracts.test.ts:76-115`, ale wiedza jest podwójna (jedno źródło prawdy).
- minimalna reakcja: `palette.ts` wylicza nazwy z `THEME_CONFIG.axes`, a dane palety mają typ `Record<Choices['accent'] wykluczając 'contrast', AccentFamily>`, więc rozjazd jest błędem typu, nie testu.

#### M14. `readSaved` rozróżnia „brak dostępu” od „brak zapisu”, czego nikt nie używa

- miejsce: `src/lib/theme.ts:60-82`; wywołania `use-theme.ts:17, 48` i `theme.ts:110` zawsze robią `?? {}`; test `theme.test.ts:71`.
- wpływ: dodatkowy stan bez konsumenta (YAGNI), test koduje rozróżnienie, które nie jest kontraktem.
- minimalna reakcja: zwracać `Theme` (`{}` w obu przypadkach) i usunąć ten test.

#### M15. Dyrektywa `'use no memo'` bez zapisanego powodu

- miejsce: `src/lib/theme-script.tsx:4`; powód (moduł serwerowy bez `react/compiler-runtime`, test `use-client.test.ts:116-120`) jest tylko w starych recenzjach.
- wpływ: projekt zabrania komentarzy, więc dyrektywa bez wpisu w `docs/decisions/` wygląda jak łatka.
- minimalna reakcja: jedno zdanie w dzienniku decyzji.

### Sugestie

- S1. `themeScript` (`src/lib/theme.ts:99-123`) serializuje funkcje przez `String(fn)` i wstrzykuje do `bootTheme` osiem parametrów; domyślne `config = THEME_CONFIG` w czterech publicznych sygnaturach istnieją tylko dla tej sztuczki, a `applyChoices` mimo wstrzykniętego `root` woła globalny `window.dispatchEvent` (`:96`). Prostsza droga: osobny moduł skryptu startowego budowany przez tsdown jako jeden plik i wklejany jako tekst; publiczne funkcje bez parametru `config`.
- S2. `moveInCollection` (`src/lib/collection.ts:4,31-36`) obsługuje `orientation: 'horizontal' | 'vertical' | 'both'`, a jedyny konsument podaje `'both'`; zostawić, jeśli E3 ma listę pionową w planie, inaczej uprościć.
- S3. 13 publicznych tokenów silników bez konsumenta w przepisach ani komponentach (widoczne tylko na `/foundation`): `--ts-color-chip`, `-hint-label`, `-inverse-hover`, `-inverse-press`, `-opaque-separator`, `-secondary-background`, `-tertiary-background`, `-tertiary-label`, `-tint-bright`, `-tint-dim`, `--ts-depth-layer-toast`, `--ts-type-screen-title-size`, `--ts-type-screen-title-leading`. Liczą się do budżetu B8; decyzja właściciela, czy paleta ma być pełna z góry.
- S4. Komponenty bez stanu i handlerów (`Text`, `Heading`, `Kbd`, `Badge`, `Alert`, `ButtonGroup`) są klientowe tylko dlatego, że React Compiler dokłada `react/compiler-runtime`, a `use-client.test.ts:122-128` tego wymaga. Jeśli konsument z RSC ma je renderować na serwerze, wyłączyć je z kompilatora (jak `ThemeScript`) i zmienić test.
- S5. `test/guards/css-layers.ts` (772 linie) to własny parser CSS i silnik polityk. Działa i ma fixture, ale parser warto zastąpić gotowym (np. `lightningcss` lub `postcss`, jeśli już jest w drzewie zależności), żeby strażnik był mniejszy od tego, czego pilnuje.
- S6. `TOOLTIP_GROUP_GRACE` mieszka w `lib/popup-flight.ts:7`, choć używa go też `TooltipProvider` jako czasu grupy Base UI (`tooltip.tsx:88`); stała zachowania tooltipa powinna być w module tooltipa po stronie `lib/`, nie lotu popupu.
- S7. `focusFieldOnPress` (`lib/focus-field.ts`) i `focusUnlabelled` z selektorem `FOCUSABLE` (`components/field/field.tsx:8, 22-29`) to dwa podobne mechanizmy „kliknięcie fokusuje pole” w dwóch miejscach; rozważyć jeden moduł.

## Zgodność z kontraktem

- prostota (KISS/YAGNI): częściowo; P3, P8, M14, S1, S2.
- zakres i miejsce: fail; P1, P2, P3, P6.
- redundancja: fail; P4, P5, M2, M3, M4, M9, M10, M11, M13.
- React: częściowo; P7, P8, M2, M6, M7. Plus: brak efektów liczących dane w renderze poza `ToggleGroup`, cleanup obserwatorów i słuchaczy kompletny (`indicator.ts:575-585`, `press.ts:41-45`, `title-when-cut.ts:21-24`, `popup-flight.ts:156-159`), `useSyncExternalStore` użyty poprawnie w `use-theme.ts`.
- TS: dobrze w `components/` i `lib/` (strict, `exactOptionalPropertyTypes`, unie rozłączne dla `ButtonProps`/`ButtonLinkProps`, `KbdProps`, `TextProps`); słabo w `eslint/` (M10).
- CSS: częściowo; P4, P5, P6, M11, M12.
- nazewnictwo: częściowo; M1, M5.
- testy: dobrze; nazwy opisują zachowanie, testy `lib/` sprawdzają kontrakt funkcji czystych z fałszywymi granicami DOM. Uwagi: fixture `Motion` powtórzony w `indicator.test.ts:24-33` i `popup-flight.test.ts:5-14`; `contracts.test.ts:13,28` sprawdza istnienie `lib/single-choice.ts` jako kotwicę skanera; M12 i M14.

## Regresje i integracja

- Nie oceniano zachowania; findingi są strukturalne. Dla P4, P5 i P6 refaktor zmienia selektory, więc wymaga pełnego `bun run check` z Playwright (kaskada tonów, `symmetry.spec.ts`, `edges.spec.ts`).

## Wykonane kontrole

```text
Odczyt wszystkich plików src/components, src/lib, src/eslint, src/engines, src/recipes, src/styles,
src/themes, scripts/, test/package/{helpers,use-client}.test, nagłówki test/guards/*.ts i list testów lib.
Skrypt grep: tokeny --ts-* silników bez konsumenta w src, test, apps/docs (13 trafień, S3).
Zliczenia grep: Omit 'className' | 'style' = 28; useMemo(() => composeRefs = 10;
lista interaktywna w recipes = 7; lista wyłączonych w recipes/lib = 9.
```

## Niewykonane lub nierozstrzygające kontrole

- Bez buildu i testów (zgodnie z zakazem); nie użyto dozwolonej sondy vitest, bo żaden finding nie dotyczy wyniku testu.
- Nie czytano całych `css-layers.ts` (772 linie) i `contracts.test.ts` poza nagłówkami i fragmentami potrzebnymi do P4, M12, M13.
- Stan równoległych poprawek drugiego wykonawcy nie jest uwzględniony.

## Ograniczenia review

- Ocena dotyczy jakości struktury, nie poprawności wizualnej ani wydajności.
- Część uwag CSS (P5, P6) dotyka reguł z `AGENTS.md` i `docs/structure.md`; jeśli któraś konstrukcja jest tam świadomym wyjątkiem, zostaje decyzja właściciela, czy wyjątek ma zostać.

## Plan refaktoru

Każda paczka to spójny zakres plików dla jednego wykonawcy. Reguła zero legacy: stara nazwa, ścieżka i eksport znikają w tym samym diffie, bez aliasów.

1. **Paczka A: podział `lib/` i nazwy** (P3, M1, S6). Pliki: `src/lib/indicator.ts` → `motion.ts`, `flight.ts`, `indicator.ts`; `src/lib/press.ts`, `src/lib/popup-flight.ts`, `src/components/tooltip/tooltip.tsx`, `src/components/menu/menu.tsx` (importy), testy `indicator.test.ts`, `popup-flight.test.ts`, `press.test.ts` (wspólny fixture `Motion`), `test/guards/contracts.test.ts` (`MEASURING_FILES`, lista stałych czasu), `AGENTS.md` i `docs/structure.md` (mapa `lib/`). Kontrola: typecheck, vitest unit, `bun run check`.
2. **Paczka B: wtyczka ESLint** (P2, M10). Pliki: `src/eslint/*`, `eslint.config.js`, nowa lokalna reguła komponentów poza `dist`, `src/eslint/layout.ts` (`CONTAINER_WIDTHS` poza ESLint), `test/guards/css-layers.ts` i `contracts.test.ts` (importy progów), `rules.test.ts`. Niezależna od A, może iść równolegle.
3. **Paczka C: silniki i przepisy CSS** (P4, P5, M11, M12). Pliki: `src/engines/{color,state,focus,motion,depth,size,shape}.css`, `scripts/colors.ts` jeśli wyjście tonu trafia do koloru, `src/recipes/{control,surface,row,indicator}.css`, komponenty statyczne (`badge.tsx`, `kbd.tsx`) jeśli dostają atrybut statyczności, `test/guards/css-layers.ts` (`toneProblems`, `ARIA_LEVEL_INDENT`), fixture `good/` i `bad/`, `apps/docs/tests/helpers.ts` (`INTERACTIVE_CONTROL`). Kontrola: pełne `bun run check` z Playwright.
4. **Paczka D: miejsce układu** (P6). Po C, ten sam wykonawca albo kolejny. Pliki: `src/recipes/{text,surface,control}.css`, `src/components/{card,field,toggle-group}/*.css`, nowe `components/popover/popover.css`, `components/dialog/dialog.css`, `src/styles/tessera.css` (importy), `docs/structure.md`. Kontrola: `symmetry.spec.ts`, `edges.spec.ts`, `field.spec.ts`.
5. **Paczka E: komponenty React** (P7, P8, M2, M3, M4, M5, M6, M7, M8, M9). Po A. Pliki: `src/lib/{slot,scope,compose-refs}.ts`, wszystkie `src/components/**/*.tsx`, `test/guards/contracts.test.ts` (typ części), `packages/tessera/docs/*.md` przy zmianie nazw lub propsów, sekcje laboratorium przy zmianie nazw. Kontrola: typecheck, vitest, Playwright komponentów, licznik commitów dla `ToggleGroup`.
6. **Paczka F: motyw i paleta** (M13, M14, M15, S1, S3). Niezależna. Pliki: `src/lib/{theme,use-theme,theme-script}.ts(x)`, `src/lib/theme.test.ts`, `scripts/palette.ts`, `scripts/colors.ts`, `src/engines/color.css` (regeneracja), `docs/decisions/` (wpis o `'use no memo'`). S3 i S1 tylko po decyzji właściciela.
7. **Paczka G: publiczne API** (P1, S4). Ostatnia, gdy moduły są już ustalone. Pliki: `packages/tessera/package.json` (`exports`), `test/package/package.test.ts`, `test/package/use-client.test.ts` (jeśli S4), laboratorium: `apps/docs/app/screens/edges/indicator-samples.tsx`, `apps/docs/tests/toggle-group.spec.ts` (bez importu `lib/indicator` i `lib/collection`).

Kolejność: A i B równolegle, potem C → D, E po A, F w dowolnym momencie, G na końcu. Jedna ciężka kontrola (`bun run check`) naraz.

## Zalecany następny krok

- Właściciel rozstrzyga P1 (lista publicznych modułów `lib/`), P5 (atrybut statyczności komponentu czy przełącznik CSS) i S3 (pełna paleta z góry czy tylko używane tokeny); reszta to decyzje techniczne do wykonania paczkami.
