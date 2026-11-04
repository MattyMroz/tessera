# Runda D Tessery v3 (Checkbox, Switch, Slider): fakty i luki

Stan na 2026-11-02, tylko odczyt. Nic nie uruchamiałem, więc liczby węzłów DOM i zachowania przeglądarki pochodzą z czytania kodu. Skróty ścieżek:

- `PL` = `C:\Users\MattyMroz\Desktop\PROJECTS\tessera\.worktrees\e2\docs\plans\e3-first-round.md`
- `SP` = `...\.worktrees\e2\docs\specification.md`
- `TS` = `...\.worktrees\e2\packages\tessera\src\`
- `BUI` = `...\.worktrees\e2\node_modules\.bun\@base-ui+react@1.9.0+2fde69a3fd50c568\node_modules\@base-ui\react\` (wersja 1.9.0, pakiet `@base-ui/react`)
- `DEC` = `C:\Users\MATTYM~1\AppData\Local\Temp\claude\c--Users-MattyMroz-Desktop-PROJECTS-MangaShift\bf52428f-8c8b-4947-ae94-9593f37d8ba6\scratchpad\e3-r1\decisions-c-d.md`
- `RES` = ten sam katalog, plik `rounds-c-d.md` (research, status draft, 2026-11-01)
- `V2` = `C:\Users\MattyMroz\Desktop\PROJECTS\MangaShift\tessera\packages\tessera\src\components\`
- `MS` = `C:\Users\MattyMroz\Desktop\PROJECTS\MangaShift\`

Worktree `e2` ma HEAD `efe9525` (plan podaje `378bcee`) i jeden nieśledzony plik `docs/session-logs/2026-11-02-0130-e3-fix-packs-running.md`.

## 1. Decyzje wiążące rundy D

Źródło `DEC`, data 2026-11-01, "wiążące dla wykonawców faz 4 i 5", właściciel: "przy wyborze wybieraj te najlepsze".

- **DEC pkt 4: dostawca Checkbox i Switch to Base UI**, nie natywny element z importami `@base-ui/react/internals/*`.
  - Powód: brak gwarancji semver.
  - B5 liczy ukryty `input` dostawcy. Limit to 4 węzły dla Checkbox i Switch, zapis w spec B5 i `docs/decisions/e3-base-ui.md`.
  - Części `box`, `track` i `thumb` to elementy renderowane przez Base UI (`Checkbox.Indicator`, `Switch.Thumb`). Reguły bez `~` i `+`.
  - "Enter przełącza Switch jak Radix/v2 (sprawdź Base UI; jeśli nie, `onKeyDown`)".
- **DEC pkt 5: wygląd (wybór prowadzącego, właściciel może zmienić w R5).**
  - Checkbox B: wypukły `box` w spoczynku `raised`, wypełnienie `tint` po zaznaczeniu, ptaszek `scale` + `opacity`. Kontrast granicy pustego boxa ma być ≥ 3:1 w jasnym trybie. Jeśli nie jest, mocniejszy cień `raised` w silniku, a nie ramka.
  - Switch A: próbka z `/foundation`.
  - Slider B: gruby tor `track-block` z kciukiem w środku, to samo DNA co Switch.
- **DEC pkt 6: geometria.** `box` = rozmiar ikony (silnik `size`). Tor i kciuk idą za osią `corners` jak `box`; przy `full` kapsuła i koło.
- **DEC pkt 7: Slider, własny kod (D61).**
  - `useLayoutEffect` po każdym renderze zapisuje wartość z propsów (`writeInstance` i `aria-valuenow`).
  - Wypełnienie na całą długość przesuwane `translate` i przycięte przez tor. Zmiana D53: bez `scale`.
  - Kontrakt `onValueChange` + `onValueCommit` ("desktop używa commit").
  - Tor z `container-type: inline-size` ma `min-inline-size` z silnika.
- **DEC pkt 8: przepisy.** Biała lista interaktywności i reguła fokusu obejmują gospodarza `<label>` lub kontrolki z częścią `box`/`track` przez `:has(...)`, fokus tylko z klawiatury.
- **DEC pkt 9: nowe wyjścia ruchu** (wydłużenie kciuka, drgnięcie przy błędzie) są poza E3 (YAGNI). Można je pokazać jako propozycję B w R4, ale bez nowych wyjść silnika.
- **DEC pkt 1** (dotyczy rundy D przez Field): Base UI `Field`, fallback z v2 (klik etykiety fokusuje kontrolkę bez `htmlFor`, dotyczy Slidera), `FieldError` z `role="alert"`, domyślnie `validationMode` = `onBlur`. Układ B: od progu `narrow` etykieta z opisem po lewej, kontrolka po prawej; poniżej jedna kolumna (1:1 z `setting-row`).

Zatwierdzone w planie (`PL`):

- D60 (`PL:99`) powtarza pkt 4. Próba N7 na starcie rundy D potwierdza DOM, B5, integrację z `Field`, `indeterminate` i `forced-colors`; odstępstwo = stop.
- D50 (`PL:89`):
  - sloty przepisu `control`: `[data-slot='box']`, `'track'`, `'thumb'`;
  - DOM: Checkbox = `Checkbox.Root` (gospodarz, `data-recipe="control"`, `role="checkbox"`) > `Checkbox.Indicator keepMounted` jako `box` > glif;
  - DOM: Switch = `Switch.Root` (gospodarz) > `<span data-slot="track">` > `Switch.Thumb`, obok ukryty `input`;
  - stan czytany z gospodarza `[aria-checked='true']`, gospodarz nie maluje tła zaznaczenia;
  - hover zaznaczonego pola zostaje;
  - znacznik przez `opacity` + `scale`, kciuk jedzie `translate` liczonym w przepisie;
  - `forced-colors`: zaznaczona część `Highlight`, znacznik `HighlightText`;
  - strażnik dostaje wyjątek `CHOICE_PARTS`;
  - reguły części mają jedno źródło w `control`, a `row.css` ich nie definiuje.
- D51 (`PL:90`): `[aria-checked='mixed']` i `:indeterminate` na gospodarzu, `box` wypełniony jak zaznaczony, znak minus. Switch bez `mixed`.
- D53 (`PL:92`):
  - kciuk Slidera: `translate: calc(var(--ts-i-value) * (100cqi - var(--ts-size-thumb)))`;
  - wypełnienie: `translate: calc((var(--ts-i-value) - 1) * (100cqi - var(--ts-size-thumb)))`, `overflow: clip` z promieniem toru;
  - `--ts-i-value` ma `inherits: false`, więc `writeInstance` pisze go osobno na kciuk i na wypełnienie;
  - literał `100cqi` dopuszczony w przepisie z powodem;
  - `getBoundingClientRect` toru raz na start przeciągania w `lib/slider.ts`;
  - bez pionowego Slidera.
- D61 (`PL:100`):
  - `role="slider"`, strzałki, PageUp/PageDown, Home/End, RTL (`lib/collection.ts`, lustro `:dir(rtl)`);
  - `aria-valuenow` i `aria-valuetext` przy każdym kroku zapisuje `lib/slider.ts` bez re-renderu, stan Reacta wyrównuje się na końcu przeciągania;
  - liczba przy suwaku to osobny komponent wartości poza poddrzewem toru, tylko on się re-renderuje;
  - "Tuba" z v2 jako jedna z propozycji.
- D73 (`PL:112`): kolejność C → **D (Checkbox, Switch, Slider)** → E → ekran Ustawienia → F (Tree).
- D78 (`PL:117`): `ButtonGroup` i Slider zostają poziome (brak konsumenta).
- D59 (`PL:98`): `FieldLabel` z fallbackiem; Slider bez `htmlFor`.
- D81 (`PL:120`): NumberScrubber odłożony do E4; "Slider ma konsumenta w Ustawieniach" (`PL:921`).
- Faza 5 (`PL:635-641`):
  - R1: próba N7 D60.
  - R2: `CHOICE_PARTS`, biała lista i fokus, `corners` w `shape.css`, D51, D53, `lib/slider.ts` na liście Q7.
  - R3: U-CHOICE, U-SLIDER.
  - R4: pole wyboru B, przełącznik A, suwak B. Alternatywy: atrament i tint, wydłużenie kciuka przy wciśnięciu (tylko nagranie), szyna i "tuba". Kompozycja jak wiersze ekranu Ustawienia (`Field` B: Switch jak Transparency, Slider jak suwaki OCR z wartością). Paczka ma MP4 ptaszka: wejście i wyjście, jasny i ciemny tryb (zamknięcie N5).
  - Testy: lista w sekcji 2.
- Przebieg rundy R1–R8: `PL:192-203`. R4 = 2–3 propozycje na pytanie; R5 = wybór właściciela.

Czego DEC nie rozstrzyga i nie ma tego w planie (por. sekcja 7): rozmiar boxa 16 vs 20, wypełnienie `translate` vs `scale` (DEC pkt 7 rozstrzyga na `translate`), podziałki, wartość w torze.

## 2. Wymagania ze specyfikacji i planu

Spec (`SP`):

- **F10** (`SP:151`): Checkbox, Switch, Slider należą do pierwszej rundy 20 komponentów. Radio dopiero w E4, na częściach pola wyboru z W8.
- **U18** (`SP:66`): Checkbox i Switch = Base UI (nie natywne); Slider = własny kod.
- **U35** (`SP:57`): kompozycja bez stylów. Gospodarz plus nazwane części, jedna kolejność slotów, część w złym miejscu rzuca błąd (`lib/slot.ts`). Biblioteka bez tekstu UI: każda etykieta to wymagany prop.
- **W1/F3** (`SP:86`, `SP:141`): skala xs/sm/md/lg/xl, wysokości 16/20/24/28/36, ikona 10–18. Obszar trafienia = pudełko kontrolki, bez rozszerzenia na zewnątrz. Przy `pointer: coarse` pudełko interaktywne ≥ 24 × 24.
- **F3**: silnik `size` daje `box`, `track-block`, `track-inline`, `thumb`, `rail`.
- **W3** (`SP:88`): "Radio = koło, switch = kapsuła"; geometria pola wyboru, toru i kciuka z wysokości rozmiaru w silniku `size`: `box` = ikona, `track-block` = ikona + 4 px, `track-inline` = `track-block` × 1,75 zaokrąglone do 1 px, `thumb` = `track-block` − 4 px, `rail` = wysokość / 7, min 2 px. "Promienie z silnika `shape` (`box` w proporcji kontrolki, `track` kapsuła, `thumb` koło)". Liczby ocenia właściciel.
- **W8** (`SP:93`):
  - drabinka stanów 4/7/10% (jasny), 8/12/16% (ciemny), wyłączenie krycie 40%;
  - tło koloru zmienia się w jednej klatce, bez przejścia;
  - "Checkbox, Switch i Radio pokazują stan we własnych częściach, więc `aria-checked` i `:checked` nie dają tła kontrolki";
  - błąd `:is([aria-invalid='true'], :user-invalid)`, tylko do odczytu `[readonly]`;
  - `aria-disabled` i zajętość blokują aktywację, a element zostaje fokusowalny.
- **W9** (`SP:94`): pole i tor w `forced-colors` mają widoczny obrys (przeglądarka wymusza go z przezroczystej ramki).
- **W11** (`SP:96`): neon `mini` = mała poświata na elementach niosących akcent: włączony switch, checkbox, wypełnienie suwaka. Nigdy na tekście.
- **W14** (`SP:100-108`): bez obramowań na wyspach, pigułkach i powierzchniach wypukłych; pierścień 1 px w cieniu `raised` to cień wypukłości.
- **W20** (`SP:113`): ugina się płytka `::before`, nigdy pudełko kontrolki ani jej treść. Tryby `spring` (k 420 / c 36), `elastic`, `firm`, `off`.
- **F8** (`SP:149`): fokus ma jeden przepis. Pole pokazuje go zawsze, przyciski i segmenty tylko przy klawiaturze.
- **F15** (`SP:162`): zachowania z desktopu 1:1. Dotyczy rundy D: klik w rodzica częściowo zaznaczonego w drzewie czyści poddrzewo (D51); "checkbox w menu nie zamyka menu".
- **F17** (`SP:155`, `PL:533`): tor Slidera jest kontenerem (`container-type`).
- **F19** (`SP:156`): każdy komponent ma sekcję `data-edge-component` na `/screens/edges`: 1 znak, długi tekst, sama ikona, kontener 320 px, zoom 50–200%, szerokości 320–1920, dotyk, kontrast, ograniczony ruch, `forced-colors`.
- **F12** (`SP:153`): `docs/<nazwa>.md` plus ≥ 2 strony laboratorium (`PL:301-303`: `checkbox.md`, `switch.md`, `slider.md`).
- **Q2** (`SP:175`): ruch tylko `transform`/`translate`/`scale`/`rotate`/`opacity`.
- **Q3** (`SP:176`): Slider = wypełnienie pełnej długości, `translate`, przycięte torem, bez `scale`; tor ma `min-inline-size` z `size`.
- **Q5** (`SP:178`): easing bez `linear()` i bez `playbackRate ≠ 1`.
- **Q6** (`SP:179`): zmienne instancji `--ts-i-value`, `--ts-i-inline-size`, `--ts-i-block-size` z `@property` `inherits: false`. Zapis tylko przez `writeInstance` (`TS lib/instance.ts`) albo `style` o kluczach rejestru; zapis z pomiaru DOM tylko w plikach z listy Q7.
- **Q7** (`SP:180`): `lib/slider.ts` wchodzi na listę plików z pomiarem z pierwszym konsumentem. Dziś lista w `test/guards/contracts.test.ts:14` ma 4 pliki: `indicator`, `motion`, `popup-flight`, `title-when-cut`. Slidera tam jeszcze nie ma.
- **Q9** (`SP:182`): zmiana zaznaczenia w grupie nie re-renderuje wszystkich elementów.
- **Q11** (`SP:184`): wrapper DOM tylko z powodu semantyki lub zachowania; dekoracja w pseudo-elementach.
- **Q19** (`SP:222`): `forced-colors` zachowuje każdy stan widocznym. Słowa systemowe (`Highlight`, `ButtonText`…) tylko w bloku `@media (forced-colors: active)`.
- **B2** (zero `Layout`/`Paint` w poddrzewie ruchu), **B3** (≤ 1 commit komponentu na hover/press), **B5** (Checkbox i Switch ≤ 4; typowa kontrolka ≤ 3, +1 za slot konsumenta), **B6** (komponent z prywatnym `lib/` ≤ 3072 B po minify + gzip; dostawca liczony osobno), **B7** (warstwy kompozytora): `SP:197-203`.
- **N5** (`SP:340`): otwarte jest "ptaszek checkboxa jako nazwany wyjątek rysowania czy `scale` + `opacity`".

Plan (`PL`) — testy fazy 5 (`PL:641`):

- `mixed`;
- hover zaznaczonego pola;
- fokus gospodarza tylko z klawiatury;
- Enter przełącza Switch;
- kciuk przełącznika jedzie `translate` i stoi przy `motion: off`;
- tor i kciuk przy `corners: none` i `full`;
- ptaszek tylko `opacity`/`scale`;
- Slider: klawiatura, RTL, 0,4 → 40% przejazdu ± 0,5 px (Chromium, WebKit), wypełnienie z zaokrąglonym końcem przy małej wartości, `onValueCommit` na końcu przeciągania, wartość odrzucona przez konsumenta wraca w DOM, tor w popoverze nie zwija się do 0, przeciąganie bez `Layout` z Tessery na klatkę w poddrzewie toru (B2) i bez commitu poza komponentem wartości (B3);
- geometria xs–xl z wyjść silnika;
- B5 = 4 dla Checkbox i Switch;
- `forced-colors`.

Plan — API (`PL:495-497`):

- `Checkbox: { checked?, defaultChecked?, indeterminate?, onCheckedChange?, disabled?, size? } (Base UI)`
- `Switch: { checked?, defaultChecked?, onCheckedChange?, disabled?, size? } (Base UI)`
- `Slider: { value?, defaultValue?, min, max, step?, onValueChange?, onValueCommit?, aria-label | aria-labelledby }`

Plan — tabela zgodności:

- `PL:180`: `shape` (tor i kciuk za `corners`) ma próbkę geometrii `/foundation` i test `corners: none`/`full`.
- `PL:231`: kontrast, `forced-colors`.
- `PL:234`: RTL (Tabs, Slider, Switch, Tree, Select).
- `PL:251-252`: jednostki U-CHOICE (`components/checkbox/checkbox.tsx`, `components/switch/switch.tsx`) i U-SLIDER (`components/slider/slider.tsx`, `lib/slider.ts`), obie zależne od U-FIELD.
- `PL:270`: przepisy rundy: części stanu i tor Slidera z wypełnieniem przyciętym torem (`control`).
- `PL:563`: liczby przepisu `100cqi` (tor Slidera).

Plan — ekran Ustawienia (`PL:665-684`, `PL:68`):

- Transparency, Blur, Window controls jako `Switch` w wierszach `Field`.
- Pipeline: dla OCR trzy wiersze `Field` ze `Slider` i wartością (jak `pipeline-ocr-controls.tsx`).
- Checkpoint ocenia tylko komponenty obecne na ekranie (w tym Switch, Slider).
- Plan P3 rundy 1 ("bez Switch") uznany za fałsz (`PL:68`).
- Test ekranu: 320–1920 px bez poziomego przewijania, axe, WebKit, B4, B5, B7, jasny i ciemny, skrajne `corners`/`density`.
- Strona (`PL:70`, `PL:743`): `Field` + `Checkbox` zgody z opisem i linkiem w formularzu bety.

Reguła rozmiaru/gęstości (`...\.worktrees\e2\docs\decisions\e3-size-scale.md`, 2026-11-02):

- Kontrolka, opakowanie kontrolek i etykieta przy kontrolce biorą wymiary z `size`. Gęstość zmienia tylko kontenery z tekstem (karta, popover, dialog, alert).
- Strażnik: gęstość skrajna nie zmienia wymiarów kontrolek.
- Plik nie wymienia Checkbox, Switch ani Slidera.

Zasady właściciela (`owner-rules.md`), istotne dla D:

- (1) każda wartość zależna od rozmiaru rośnie ściśle od xs do xl;
- (3) bez obramowań na powierzchniach wypukłych;
- (5) nie transformować elementu z przypiętym popupem ani jego przodka;
- (6) wciśnięcie skaluje cały przycisk z tekstem;
- (7) overflow: wielokropek, bez łamania po literze;
- (8) v2 = wzór zachowań, nie wyglądu;
- (11) zero tekstu UI;
- (12) zero komentarzy, zero legacy.

Pułapki z `...\.worktrees\e2\AGENTS.md` (sekcja "Pułapki", `AGENTS.md:81+`) dotykające D:

- Kontrolowany prop kopiowany efektem do stanu daje drugi render; wartość liczona w renderze albo w handlerze, jedyny wyjątek to magazyn ToggleGroup.
- Kontekst gospodarza = `createContext<T | null>(null)` + `useHost`.
- Wciśnięcie skaluje tylko płytkę `::before`; `scale` na całej kontrolce przesuwał popup i ikonę.
- Część w złej kolejności rzuca błąd; `useSlotOrder` sprawdza też w ref.
- React Compiler: funkcje refów rozpakowane do zmiennych (`const { register } = …`).
- Test pikseli: próbka musi leżeć w oknie.
- Etykieta kontrolki w `[data-slot='label']`.
- Brak tekstu UI w bibliotece.

## 3. Base UI 1.9.0: części, propsy, atrybuty, klawiatura, formularze

Ścieżki względem `BUI`. Wszystkie typy z `.d.ts`.

### Checkbox (`checkbox/root/CheckboxRoot.d.ts`, `checkbox/indicator/CheckboxIndicator.d.ts`)

- `CheckboxRoot` renderuje `<span>` i obok **ukryty `<input type="checkbox">`** (komentarz w `.d.ts`).
  - Kod (`CheckboxRoot.js:242-345`): `role: 'checkbox'`, `aria-checked: indeterminate ? 'mixed' : checked`, `aria-readonly`, `aria-required`, `aria-labelledby`, `data-parent` dla rodzica grupy.
  - Dodatkowy `<input type="hidden">` pojawia się tylko gdy `!checked && !groupContext && name && !parent && uncheckedValue !== undefined` (`:330`).
  - `Checkbox.Root` kieruje `onClick` do ukrytego inputu (`dispatchClickWithModifiers`, `:305`). Fokus z inputu przechodzi na root (`onFocus: controlRef.current?.focus()`).
  - Input ma `style: name ? visuallyHiddenInput : visuallyHidden` (`:180`) i `tabIndex: -1`, `aria-hidden`.
- `CheckboxRootProps` (rozszerza `NonNativeButtonProps` i `BaseUIComponentProps<'span', State>` bez `onChange`/`value`):
  - `id?`, `name?`, `form?`
  - `checked?`, `defaultChecked?` (domyślnie false)
  - `disabled?`, `readOnly?`, `required?`
  - `indeterminate?`
  - `onCheckedChange?: (checked: boolean, eventDetails: CheckboxRootChangeEventDetails) => void`
  - `inputRef?: Ref<HTMLInputElement>`
  - `parent?: boolean` (tylko w `CheckboxGroup`)
  - `uncheckedValue?: string`
  - `value?: string`
  - `nativeButton?: boolean` (domyślnie false)
- `CheckboxRootState` = `FieldRootState` + `checked, disabled, readOnly, required, indeterminate`.
- Atrybuty danych (`CheckboxRootDataAttributes.d.ts`): `data-checked`, `data-unchecked`, `data-indeterminate`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-touched`, `data-dirty`, `data-filled`, `data-focused`.
- `CheckboxIndicator`:
  - Renderuje `<span>`. Props: `keepMounted?: boolean` (domyślnie false).
  - `rendered = checked || indeterminate`, montaż przez `useTransitionStatus` i `useOpenChangeComplete`; zwraca `null` gdy `!keepMounted && !mounted` (`CheckboxIndicator.js`).
  - State = `CheckboxRootState` + `transitionStatus`. Atrybuty: te same co root + atrybuty przejścia (`transitionStatusMapping`, `data-starting-style`/`data-ending-style`).
- Klawiatura:
  - Space przez `useButton` (keyup, `internals/use-button/useButton.js:165-171`).
  - **Enter nie przełącza**: `CheckboxRoot.js:268-300` robi `preventDefault` natywnego zdarzenia, a w mikrozadaniu woła `click()` domyślnego przycisku wysyłającego formularza (`getDefaultFormSubmitter(form)`), chyba że ktoś zrobił `preventDefault`.
- `indeterminate`: `useIsoLayoutEffect` ustawia `input.indeterminate` przy zmianie `checked` i `computedIndeterminate`, komentarz: "clicking the input natively resets `indeterminate`" (`:149-157`).
- Formularze: `name` + `value` (domyślnie "on" natywnie), `uncheckedValue` dodaje ukryty `hidden`; `form` dla inputu poza `<form>`; `validation.registerInput`, `useRegisterFieldControl`, `useValueChanged` czyści błędy, ustawia `dirty`.
- Field: `useLabelableId` (`:102`), `useAriaLabelledBy`; pole w `Field` dostaje `labelId`, `getDescriptionProps`; `ownsControlId` = false dla checkboxów w `CheckboxGroup` bez `Field.Item` (komentarz `:95-99`).
- Kod nie czyta `dir` (RTL nie dotyczy checkboxa).

### CheckboxGroup (`checkbox-group/CheckboxGroup.d.ts`, `useCheckboxGroupParent.d.ts`)

- Renderuje `<div>`.
- Props: `value?: string[]`, `defaultValue?: string[]`, `onValueChange?: (value: string[], details) => void`, `allValues?: string[]` ("użyj przy tworzeniu parent checkbox"), `disabled?`.
- Dziecko ustala członkostwo przez `value` na `Checkbox.Root`; rodzic przez `parent`. Rodzic dostaje `indeterminate`/`checked` z `getParentProps()`, `aria-controls`; stan `mixed` liczy grupa.
- Atrybuty: `CheckboxGroupDataAttributes`.
- Plan nie wspomina o `CheckboxGroup` (D51 liczy stan rodzica w `lib/tree.ts`).

### Switch (`switch/root/SwitchRoot.d.ts`, `switch/thumb/SwitchThumb.d.ts`)

- `SwitchRoot` renderuje `<span>` + ukryty `<input type="checkbox">` (`SwitchRoot.js:207-252`), plus opcjonalny `<input type="hidden">` przy `!checked && name && uncheckedValue !== undefined`.
  - `role: 'switch'`, `aria-checked`, `aria-readonly`, `aria-required`, `aria-labelledby` (`:140-167`).
  - Klik kieruje się do ukrytego inputu (`:158-170`).
- `SwitchRootProps`: `id?`, `checked?`, `defaultChecked?`, `disabled?`, `inputRef?`, `name?`, `form?`, `onCheckedChange?: (checked, details)`, `readOnly?`, `required?`, `value?`, `uncheckedValue?`, `nativeButton?`. Uwaga: dla `Switch` nie ma `indeterminate` (potwierdza D51).
- `SwitchRootState` = `FieldRootState` + `checked, disabled, readOnly, required`.
- Atrybuty (`SwitchRootDataAttributes.d.ts`): `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-touched`, `data-dirty`, `data-filled`, `data-focused`.
- `SwitchThumb`: `<span>`, state = `SwitchRootState`, te same atrybuty (`SwitchThumb.js:19-34`). Nie ma własnej logiki, nie czyta pozycji.
- Klawiatura: `useButton` bez natywnego przycisku (`useButton.js:96-171`):
  - **Enter** → `dispatchClickWithModifiers` w `onKeyDown` (`:150-154`), więc **Switch przełącza się na Enter**.
  - **Space** → w `onKeyUp` (`:165-171`).
  - To odpowiada na pytanie z DEC pkt 4 / D60 (próba R1 i tak ma to potwierdzić w przeglądarce).
  - Różnica względem Checkboxa: ten wymusza własne `onKeyDown` dla Enter (wysyła formularz, nie przełącza).

### Slider (Base UI) — referencyjnie, bo D61/U18 to własny kod

(`slider/root/SliderRoot.d.ts` i części; kod `thumb/SliderThumb.js`.) Części: Root `<div>`, Control `<div>`, Track `<div>`, Indicator `<div>`, Thumb `<div>` + zagnieżdżony `<input type="range">` (`SliderThumb.js:362`), Value `<output>`, Label `<div>`.

- `SliderRootProps<Value extends number | readonly number[]>`: `defaultValue?`, `value?`, `disabled?`, `format?: Intl.NumberFormatOptions`, `locale?`, `min?` (0), `max?` (100), `minStepsBetweenValues?` (0), `name?`, `form?`, `orientation?` ('horizontal'), `step?` (1), **`largeStep?` (10, absolutna wartość, nie wielokrotność kroku)**, `thumbAlignment?: 'center' | 'edge' | 'edge-client-only'`, `thumbCollisionBehavior?: 'push' | 'swap' | 'none'`, `onValueChange?(value, details)` z `details.reason` ∈ `input-change | track-press | drag | keyboard | none`, `onValueCommitted?(value, details)` ("nie odpala, jeśli wartość się nie zmieniła; generic event"; reason: `drag | track-press | keyboard | input-change | none`).
- `SliderThumbProps`: `disabled?`, `aria-valuetext?`, `getAriaLabel?`, `getAriaValueText?`, `index?` (wymagany do SSR z wieloma kciukami), `inputRef?`, `onBlur`/`onFocus`/`onKeyDown` przekazywane do inputu, `tabIndex?`.
- Atrybuty: Root/Control/Thumb mają `data-dragging`, `data-orientation`, `data-disabled`, `data-valid/invalid/touched/dirty/focused`; Thumb dodatkowo `data-index`.
- Klawiatura (`SliderThumb.js:290-345`):
  - strzałki: ArrowUp +1, ArrowDown −1;
  - ArrowRight = RTL ? −1 : +1, ArrowLeft = RTL ? +1 : −1 (RTL z `DirectionContext`, nie z `:dir()`);
  - Shift + strzałka używa `largeStep`;
  - PageUp/PageDown = `largeStep`;
  - Home = `min`, End = `max` (przy zakresie granica sąsiedniego kciuka).
- `aria-valuenow`, `aria-orientation` na inpucie; pozycja: `insetInlineStart` w % albo `--position` z `ResizeObserver` przy `thumbAlignment: 'edge'` (`:195-260`); pointer capture na kontrolce, `touchstart`/`pointerdown` rozróżniane (`SliderControl.js:324-443`).
- Typy zdarzeń: zakres/kroki/wiele kciuków/orientacja/RTL/`onValueCommitted` = jak wyżej.

DEC/PL: Slider **nie** jest wykonany na Base UI. `PL:100` zaznacza "sprawdzone: Tessera nie używa Base UI `Slider`".

### Field i formularze (wspólne)

- `Field` kładzie `labelId`, `getDescriptionProps`, `validation`, `fieldState` w kontekstach, z których czytają `CheckboxRoot` i `SwitchRoot` bez kodu Tessery. Wynik odczytu kodu: `docs/decisions/e3-base-ui.md` ("Etykieta ↔ Select, Checkbox, Switch"). Próba w przeglądarce zapowiedziana na rundy D i E; w pliku nie ma jeszcze wyniku dla D.
- Fallback Tessery: `FieldLabel` przy `label.control === null` fokusuje element o `id` z `for` albo pierwszy fokusowalny element pola (`TS lib/focus-field.ts:15-25`, `TS components/field/field.tsx:30-46`).
- `Field` domyślnie `validationMode='onBlur'` (`field.tsx:21-28`); Base UI domyślnie `onSubmit`.

## 4. v2: zachowania (wzór zachowań, nie wyglądu)

V2 opiera się na **Radixie** (`radix-ui/checkbox`, `switch`, `slider`), nie na Base UI.

### Checkbox (`V2 checkbox.tsx`, `checkbox.css`, `checkbox.test.tsx`)

- `forceMount` na `Indicator`, więc znacznik zawsze w DOM (`checkbox.tsx:35`, test `:32-33`: "the mark stays mounted so it can draw in and out").
- Dwa glify naraz: `data-icon="check"` i `data-icon="indeterminate"`, `strokeWidth: 3` (`:36-41`, test `:17`).
- Animacja ptaszka: `stroke-dasharray: 1; stroke-dashoffset: 1`, rysowanie `--motion-check-draw` (350 ms), wygaszanie `--motion-check-erase` (= `--motion-slide`), `--ease-check` `cubic-bezier(0.22, 1, 0.36, 1)` (`checkbox.css:87-97`; wartości `V2 ../styles/motion.css:20,27-29`). Rozmiar glifu = box × 3/4 zaokrąglone (`checkbox.css:82-83`).
- Wciśnięcie: `data-press="true"` + `[data-pressing="true"]` zmienia tło i obrys (`ink-press`); `scale` w `transition` (`:23-27`), `hover` pod `@media (hover: hover)`.
- Zaznaczone/nieokreślone: tło `--primary`, poświata `0 0 var(--space-6) var(--control-glow)` (`:42-48`).
- `aria-invalid` zmienia obrys; `disabled` → `opacity: var(--disabled-opacity)`; fokus `:focus-visible` z wyłączeniem `[data-input="pointer"]` i okna bez fokusu.
- `forced-colors`: obrys `ButtonText`, zaznaczone `Highlight`/`HighlightText` (`:99-109`).
- Testy: rola/`data-press`/`data-size`; 5 rozmiarów; przełączanie uncontrolled i `onCheckedChange` `[[true],[false]]`; kontrolowane `indeterminate` (`aria-checked="mixed"`, klik → `true`); disabled ignoruje klik; nazwany, opisany i `aria-invalid` przez `Field`; klik w etykietę przełącza (`checkbox.test.tsx:63-78`).
- Klik etykiety: przez `useFieldControl` (id/`aria-describedby`/`aria-invalid` z pola).

### Switch (`V2 switch.tsx`, `switch.css`, `switch.test.tsx`)

- `useSlidingThumb`: `glide(element, undefined, 'x')` z `_internal/floating-indicator` plus `MutationObserver` na `data-state`/`data-pressing`/`data-size` (`switch.tsx:9-24`).
- Wymiary: tor = `size-height × 6/7` zaokrąglone, kciuk = tor × 3/4, `inset` = (tor − kciuk)/2, szerokość = 2 × (kciuk + inset) (`switch.css:53-55,64`).
- Przesunięcie kciuka: `translate: var(--switch-thumb-x) 0`; zaznaczony `calc(2 × thumb + inset − thumb-width)`; RTL `:dir(rtl)` mnoży przez −1 (`:122-141`).
- **Wydłużenie kciuka przy wciśnięciu**: `--switch-thumb-width = thumb × (1 + var(--elastic-press-stretch))`, 0.25, tylko `prefers-reduced-motion: no-preference` (`switch.css:143-147`; `styles/motion.css:20`). Zmienia `width`, a nie `scale`.
- Włączony: tło `--primary`, kciuk `--primary-mark` z poświatą (`:93-97`).
- Test: przełączanie, kontrolowany, disabled; nazwa z `FieldLabel`, opis z `FieldDescription` (`switch.test.tsx:63-70`).
- Enter przełącza (Radix `<button>`): wg `RES` Radix `react-switch index.mjs:98-100`.

### Slider (`V2 slider.tsx` 533 l., `slider.css` 577 l., `slider.test.tsx` 457 l.)

- Radix `Slider`, trzy warianty: `default`, `field` (wartość w pigułce `Badge`, granice, zakres z "joined" pigułką), `tube` (tor o wysokości kontrolki, etykieta i wartość w torze, dymek wartości).
- Klawiatura (Radix): strzałki, PageUp/PageDown, Home/End; test `slider.test.tsx:47`. `STEP_KEYS` zestaw 8 klawiszy używany do wyświetlania dymka (`slider.tsx:228,482-485`).
- Wartość: `valueText` = `getAriaValueText` albo `formatNumber` z `LocaleProvider`, `+` przed dodatnimi w zakresie dwubiegunowym (`:451-454`); `aria-valuetext` na kciuku (`:508`).
- `share = clamp((v − min)/(max − min))` z ochroną `max > min` (`:446`).
- Etykieta: `useFieldLabel` (MutationObserver na `[data-slot="field-label"]`, `:31-43`); kciuk dostaje `aria-labelledby` (`:507`); test śledzi etykietę montowaną później (`:117`).
- Zakres: dwa kciuki, `role="group"`, nazwy z `messages['slider.minimum'|'slider.maximum'|'slider.value']` (`:457-461`).
- Tuba: przeciąganie z dowolnego miejsca (`useTubeDrag` → `startDrag`/`follow`, `:244-305`), gumowy opór za krańcem (`rubberBand`, `readBand`, wyłączony przy `prefers-reduced-motion`, `:227-261`), dymek na czas `--motion-value-hold` (700 ms) po klawiszu (`:379-392`, `styles/motion.css:39`), jazda w CSS z `--slider-tube-at`.
- Podziałki: `ticks` + `tickPositions` (`:45-50`, `:514-519`).
- Pionowy: `orientation="vertical"` (test `:146`).
- Disabled: wyłącza klawiaturę i usuwa z Tab (test `:137`).
- Fokus `:focus-visible` na kciuku; `aria-invalid` na kciuku (`slider.css:104-111`).
- Wciśnięcie: `[data-pressing]` zmienia kolor kciuka (`slider.css:45-47`), `data-press="true"` na root.
- Pozycja punktów trafienia (`placeHits`) i wartości (`placeValues`) mierzone w JS (`:64-111`).
- Zadania: `useGroupItemShape`, `useTooltipShape` (zależności z v2).
- Testy `slider.test.tsx`: 25 przypadków (np. "keeps a controlled value and reads the value text from getAriaValueText", "formats the default value text in the language of the provider", "ignores a press on the value row of the field variant", "stretches the tube past an end by the rubber band").
- Klik w tor: przeskakuje (Radix `onSlideStart`, `RES` sekcja Slider); w tubie przeciąganie od pierwszego dotyku.

## 5. Desktop MangaShift: prawdziwe zastosowania

Kit desktopu: `MS packages\ui\src\`. Wszystko oparte o Radix i klasy Tailwind. Lista wszystkich trafień `<Switch|Checkbox|Slider|SliderRow>` w `desktop/src` i `packages/ui/src` (bez testów): poniżej.

### Switch

- `packages/ui/src/toggle/switch.tsx:17-35`: tor `h-6 w-10` (24 × 40 px), kciuk `size-4` (16), `translate-x-0.5` (2 px) → `translate-x-5` (20 px), przejścia `--motion-slide` + `--ease-spring`, kciuk włączony `--accent-bright` z poświatą `0_0_8px_var(--accent-glow)`, wyłączony `--overlay-hover`, tor wyłączony `--overlay`, włączony `--accent-subtle`; `disabled:opacity-40`.
- `packages/ui/src/form/setting-row.tsx:36-93` (`SettingRow`):
  - Układ: `flex items-center justify-between`; lewa kolumna `div.min-w-0` z etykietą i opcjonalnym opisem (`text-sm font-medium` + `text-xs text-muted-foreground mt-0.5`, `:68-79`); prawa `div.flex.items-center.shrink-0` (`:80-90`).
  - Props: `label`, `icon?`, `description?`, `className?`, `disabled?`, `padded?`, `density?: 'comfy' | 'dense'`, `layout?: 'inline' | 'stacked' | 'wrap'`, `sliding?`, `controlWidth?: 'auto' | 'field'`.
  - `dense` → `min-h-7 gap-3`; `comfy` → `gap-4`; `stacked` = kolumna, kontrolka `w-full`; `wrap` = `flex-wrap gap-3`; `controlWidth='field'` → `w-32`.
  - `disabled` → `opacity-40 pointer-events-none`.
  - Przy `checked`/`onCheckedChange` bez dzieci wiersz renderuje `Switch` z `aria-label={label}` (`:87-89`). Etykieta nie jest `<label htmlFor>`.
- `desktop/src/features/settings/components/appearance-card.tsx`:
  - Transparency `:211` (`sliding layout="wrap" label description checked onCheckedChange`), opis "Show the desktop through the window".
  - Blur `:220`, opis "Frosted glass behind menus, dialogs and panels".
  - Window controls `:262`, opis "Use dots instead of standard window buttons", `checked={windowControlsStyle === 'dots'}`.
  - Wszystkie w grupach z `GroupLabel` ("Theme", "Interface", "Window") i `LIST_ROWS`.
- `desktop/src/features/editor/modules/text/components/style/text-style-panel.tsx:237-243`: `SettingRow density="dense" label="Auto wrap"` + `Switch aria-label="Auto wrap"`, warunkowo (`selected.length > 0`), wartość współdzielona `shared(...) ?? false`; kontekst `fieldset disabled={locked}`.
- `desktop/src/features/editor/modules/retouch/components/retouch-properties-panel.tsx:193-195`: `PropertyRow label="Auto" htmlFor={autoId}` + `Switch id={autoId}` oraz `Note` pod spodem ("After every stroke" / "On Apply only"). Jedyny przypadek z `htmlFor`/`id`.
- `desktop/src/features/pipeline/components/pipeline-tts-controls.tsx:106-111`: `option_type === 'boolean'` → `div.flex.items-center.justify-between.gap-3` z `Label.text-sm` i `Switch aria-label={spec.label}`.
- `packages/ui/src/list/list-item.tsx:96-100`: `Switch` w liście bez `aria-label`, w `span.pointer-events-auto` (lista ma `pointer-events-none`).

### Checkbox

- `packages/ui/src/toggle/checkbox.tsx:51-82`: box `size-4` (16), `rounded-sm`, obrys `--field-border`, zaznaczony/nieokreślony tło `--accent` z poświatą `0_0_6px`; ikony `lucide` `CheckIcon`/`MinusIcon` `size-3.5` (14), wybór ikony `props.checked === "indeterminate"`; `transition-none` na `Indicator` (`:73`).
- `desktop/.../playback/components/export-video-params.tsx:237-246`: `Label.w-fit` otacza `Checkbox` i tekst "Export audio" (checkbox wewnątrz `<label>`), `aria-label="Export audio"`, disabled gdy brak narracji (`!hasNarration`), w `Tooltip` z dwoma tekstami (z/bez narracji). `onCheckedChange={(next) => ... next === true}`.
- `desktop/.../text/components/export-params-panel.tsx:127-142`: dwa `Label`/`Checkbox` w kolumnie `gap-3` ("Create project subfolder", "Subfolder per chapter"), `onCheckedChange={(c) => ... c === true}`.
- `desktop/src/features/state/components/delete-history-dialog.tsx:21-39`: `OptionCard htmlFor={id} checked disabled size="sm" title description control={<Checkbox id .../>}`; `onCheckedChange(next === true)`.
- `packages/ui/src/tree/tree-row.tsx:231-238`: `Checkbox checked={checkbox.state}` (tak/nie/mixed), `disabled`, `aria-label={checkbox.label}`, `className="relative z-10 mx-1"` na nakładce z `absolute inset-0` przycisku wyboru.
- Wszystkie wywołania Radixa rzutują `onCheckedChange` (`boolean | "indeterminate"`) na `=== true`.

### Slider

- `packages/ui/src/slider/slider.tsx:9-67`: Radix `Slider`, wartość jako **tablica** (`Array.isArray(value) ? value : defaultValue ?? [min, max]`); tor `h-1.5` (6 px) `bg-[var(--overlay)]`, zakres `--accent-subtle` z obrysem `--accent-border`; kciuk `size-4`, `rounded-full`, `--accent-bright`, `hover:ring-[3px]`; `touch-none` na root (`:36`); `thumbLabel` jako `aria-label`; pionowy wariant istnieje (`data-[orientation=vertical]:...`).
- `packages/ui/src/slider/slider-row.tsx:22-53` (`SliderRow`): props `label`, `icon?`, `value: number`, `onValueChange(number)`, `onValueCommit?: () => void`, `min`, `max`, `step`, `formatValue?`, `className?`. Układ: `FIELD_STACK` (`space-y-1.5`, `lib/control-style.ts:28`), górny rząd `flex items-center justify-between` z `FieldLabel` po lewej i wartością po prawej (`text-xs font-semibold text-foreground tabular-nums`, `:36-41`), pod nim `Slider aria-label={label}` na całą szerokość. Wartość domyślnie `{value}`, z `formatValue` `{formatValue(value)}`.
- `desktop/.../pipeline/components/pipeline-ocr-controls.tsx:6-51`: trzy `SliderRow` w `div.flex.flex-col.gap-3`:
  - "OCR crop padding", ikona `Type`, 0–0.08, krok 0.001;
  - "OCR min crop side", ikona `Type`, 0.001–0.02, krok 0.001;
  - "Mask dilation", ikona `Brush`, 0–0.05, krok 0.001;
  - format `formatRatio` = `` `${(value * 100).toFixed(1)}%` `` (`:6-8`).
- `desktop/.../pipeline/components/pipeline-tts-controls.tsx:134-152`: `SliderRow` dla opcji `float`/`integer`, krok 1 (integer) albo 0.05, format `${current}` (integer) albo `current.toFixed(2)`, min/max z `spec.min_value`/`max_value` (bez ikony).
- `desktop/.../playback/components/timeline-controls.tsx:90-98`: samotny `Slider` bez wartości w UI: min 0.2, max 4, krok 0.1, `value={[zoom]}`, `thumbLabel="Timeline zoom"`, `className="w-24 shrink-0"`, w pasku obok przycisków.
- **`onValueCommit` w desktopie**: `rg onValueCommit` w `desktop/src` i `packages/ui/src` znajduje tylko przekazanie w `slider-row.tsx:14,27,45`. **Żadne wywołanie `SliderRow` ani `Slider` w desktopie go nie przekazuje.** (Brak tego w DEC pkt 7 i `RES` "desktop używa commit"; por. sekcja 7.)
- `desktop/.../text/components/style/text-style-panel.tsx`: wiersze `SettingRow density="dense"` Size, Line height, Letter spacing, Stroke width, Rotation (`:258-440`) — w grepie nie używają `Slider` (nie sprawdzałem ich kontrolek poza grepem na `Switch|Checkbox|Slider`).
- `desktop/src/app/layout/status-resources.tsx:90`: `SettingRow density="dense" label="Project"` z tekstem i `Button` w dzieciach (przykład użycia `SettingRow` bez Switcha).

## 6. Silniki Tessery: tokeny toru i kciuka

### `TS engines/size.css`

Definicje (`:66-74`):

- `--ts-size-box: var(--ts-size-icon)`
- `--ts-size-track-block: calc(var(--ts-size-icon) + 4px)`
- `--ts-size-track-inline: round(var(--ts-size-track-block) * 1.75, 1px)`
- `--ts-size-thumb: calc(var(--ts-size-track-block) - 4px)`
- `--ts-size-rail: max(2px, round(var(--ts-size-height) / 7, 1px))`
- `--ts-size-height: var(--ts-size-step)`; przy `@media (pointer: coarse)` `max(var(--ts-size-step), 24px)` (`:77-82`)
- sąsiednie: `--ts-size-cap-pad`, `--ts-size-icon-cap-pad`, `--ts-size-gap`, `--ts-size-icon-stroke`, `--ts-size-text`, `--ts-size-leading`

Wartości wejściowe (`:22-60`): ikona 10/12/14/16/18, krok (`--ts-size-step`) 16/20/24/28/36, `--ts-size-gap` 3/3/4/5/7, `--ts-size-icon-stroke` 2.4/2.25/2.25/2.25/2 dla xs/sm/md/lg/xl.

Wartości wyliczone z tych formuł (mój rachunek z kodu, nie pomiar; zakładam, że `round()` bez słowa kluczowego to `nearest`, remis w górę, zgodnie ze spec CSS):

| rozmiar | box (= ikona) | track-block | track-inline | thumb | rail (mysz)            | inset kciuka = (block − thumb)/2 |
| ------- | ------------- | ----------- | ------------ | ----- | ---------------------- | -------------------------------- |
| xs      | 10            | 14          | 24,5 → 25    | 10    | 2 (16/7 = 2,29; min 2) | 2                                |
| sm      | 12            | 16          | 28           | 12    | 3 (20/7 = 2,86)        | 2                                |
| md      | 14            | 18          | 31,5 → 32    | 14    | 3 (24/7 = 3,43)        | 2                                |
| lg      | 16            | 20          | 35           | 16    | 4 (28/7 = 4)           | 2                                |
| xl      | 18            | 22          | 38,5 → 39    | 18    | 5 (36/7 = 5,14)        | 2                                |

`lab.spec.ts:195-225` testuje te relacje na `/foundation` (box = ikona, block = ikona + 2·`TRACK_PADDING`, inline = round(block·`TRACK_RATIO`), thumb, inset > 0, `rail ≥ MIN_RAIL`).

- **Rail jest taki sam w sm i md (3 px)** — por. sekcja 7 i zasada właściciela nr 1.

### `TS engines/shape.css`

- `--ts-shape-box` (`:69-72`): `min(min(ratio, square-ratio) × in-shape-radius × size-box × (1 + squircle-gain × control-curve), size-box × (0.5 − 0.05 × control-curve))`. **Zależy od osi `corners`** (`_ts-shape-ratio`: `full` 0.5, `none` 0, `sm` 4/28, `md` 6/28, `lg` `_ts-shape-square-ratio` = 10/28 przez `--_ts-shape-square-ratio`).
- `--ts-shape-track: calc(var(--ts-size-track-block) / 2)` (`:73`) i `--ts-shape-thumb: calc(var(--ts-size-thumb) / 2)` (`:74`) — **stałe, zawsze kapsuła i koło, niezależne od `corners`**. D50/DEC pkt 6 każe to zmienić; w worktree zmiany jeszcze nie ma.
- `--ts-shape-control`, `--ts-shape-control-side`, `--ts-shape-control-side-icon`, `--ts-shape-control-radius`, `--ts-shape-concentric`, `--ts-shape-control-corner` (`superellipse(...)`/`round`), `--ts-shape-stroke` (1px; 2px przy `prefers-contrast: more`).
- Zmiennych `box`/`track`/`thumb` nie używa żaden przepis ani komponent w `TS` (grep po `data-slot='box'|'track'|'thumb'`, `CHOICE_PARTS`: tylko `apps/docs/app/foundation/page.tsx:67-92,306-340` i `apps/docs/tests/lab.spec.ts:195-225`). Reguły części D50 i `CHOICE_PARTS` jeszcze nie istnieją.

### `TS engines/state.css`

- Drabinka (`:2-20`): `--ts-state-rest/hover/press` = 0.04/0.07/0.10 (jasny), 0.08/0.12/0.16 (ciemny); `--ts-state-indicator` 0.10/0.12; `--ts-state-indicator-track` 0.04; `--ts-state-tint-rest/hover/press/border` 0.08/0.16/0.24/0.25; `--ts-state-disabled` 0.4; `--ts-state-invalid-color: var(--ts-color-danger)`; `--ts-state-selected-fill(-color)` (`:52-60`); `--ts-state-cursor` (default na desktop, pointer na web).

### `TS engines/motion.css`

- Czasy (`:43-48`): instant 50 ms, fast 100, slide 150, emphasized 200, overlay 250, elastic 220.
- Krzywe (`:49-52`): standard `cubic-bezier(0.2, 0, 0, 1)`, out `(0, 0, 0.2, 1)`, emphasized `(0.3, 0, 0, 1)`, **spring `(0.34, 1.56, 0.64, 1)`**.
- `--ts-motion-press-scale: 0.97`; sprężyna k 420 / c 36; `--ts-motion-elastic-overshoot: 0.1`.
- `off` i `prefers-reduced-motion`: wszystkie czasy 0 ms, `press-scale: 1`, pętle `none` (`:72-101`).
- Brak wyjścia "wydłużenie kciuka"/"drgnięcie" (zgodne z DEC pkt 9); `--ts-motion-press-scale` służy do wciśnięcia płytki (`control.css:315-317`).

### `TS engines/depth.css`, `engines/color.css`

- `--ts-depth-raised-bg`, `--ts-depth-raised-shadow` (jasny: `0 0 0 1px rgb(20 20 23/0.05), 0 1px 2px rgb(20 20 23/0.1), 0 2px 6px rgb(20 20 23/0.05)`; ciemny: `0 0 0 1px rgb(255 255 255/0.06), 0 1px 2px oklch(0% 0 0/0.5), 0 2px 6px oklch(0% 0 0/0.3)`), `--ts-depth-glow: 0 0 var(--_ts-depth-neon) var(--ts-color-glow)` (neon 0/6 px).
- Kolory: `--ts-color-thumb` (`#ffffff` w obu trybach: `color.css:19,56`), `--ts-color-quaternary-label` (`#c9c9d0` jasny, `#4b4b4b`… ciemne), `--ts-color-control-border` (`rgb(116 116 127 / 0.82)` jasny, `rgb(139 139 139 / 0.74)` ciemny), `--ts-color-tint`, `--ts-color-on-tint`, `--ts-color-glow`.
- Próbka `/foundation` (`apps/docs/app/foundation/page.tsx:67-108`, `:306-340`):
  - box: `border: var(--ts-shape-stroke) solid var(--ts-color-control-border)`, `border-radius: var(--ts-shape-box)`;
  - tor: `quaternary-label` (wyłączony) / `tint` (włączony), kciuk `--ts-color-thumb` + `--ts-depth-raised-shadow`, inset = (block − thumb)/2;
  - kciuk włączony `translate: calc(var(--ts-size-track-inline) - var(--ts-size-track-block)) 0`;
  - szyna: szerokość `track-inline × 3`, wysokość `--ts-size-rail`, `border-radius: var(--ts-size-rail)`, kciuk centrowany `translate: -50% -50%`;
  - pasek: `--ts-i-value: 0.4`, `width: calc(var(--ts-i-value) * 100%)`.

### `TS recipes/control.css`, `recipes/focus.css`, `engines/focus.css`

- Gospodarz `[data-recipe='control']` (`control.css:2-57`): `inline-flex`, `height: var(--ts-size-height)`, `min-width: var(--ts-size-height)`, `padding-inline` z `--ts-shape-control-side`, `border-radius: var(--ts-shape-control-radius)`, płytka `::before` (tło `color-mix(...)`, `box-shadow: var(--_shade)`, `transition: scale var(--ts-motion-duration-fast) var(--ts-motion-ease-out)`).
- Biała lista interaktywności (`:59`, `:67`, `:304`, `:310`, `:315`): `button, a[href], input, select, textarea, [role='button'], [role='radio'], [role='tab'], [role='menuitem'], [tabindex], :has(> [data-slot='input'])`. **Brak `[role='checkbox']`, `[role='switch']`, `[role='slider']` i `:has(> [data-slot='box'|'track'])`** (D50/DEC pkt 8 każą dopisać).
- Wciśnięcie (`:310-317`): `[data-pressing]` zmienia `--_wash`/`--_step` i skaluje tylko `::before` (`scale: var(--ts-motion-press-scale)`), z wyłączeniem `[data-variant='field']`.
- `[aria-pressed='true'], [aria-selected='true']` → wypełnienie zaznaczenia (`:272-275`). Brak reguły dla `[aria-checked]`.
- Wyłączenie (`:277-280`): `:disabled, [data-disabled], [aria-disabled='true'], :has(> [data-slot='input']:disabled)` → `opacity: var(--ts-state-disabled)`. Brak odpowiednika dla `box`/`track`.
- `forced-colors` (`:326-343`): dla pressed/selected `Highlight`/`HighlightText`; wyłączone `GrayText`; błąd pola — obrys 2 × stroke.
- Fokus (`recipes/focus.css:9-14`): `:root:not([data-input='pointer']) [data-focus]:focus-visible, [data-focus]:has(> [data-slot='input']:focus-visible)` → `outline: var(--ts-focus-width) solid var(--ts-focus-color)`, `outline-offset: var(--_focus-offset)`, `box-shadow: var(--_glow), var(--_focus-under)`; warianty `data-focus` `inset`/`outer`. **Brak reguły dla `:has(> :is([data-slot='box'], [data-slot='track']):focus-visible)`.**
- `Input` używa wzorca: `data-recipe="control" data-variant="field" data-focus="outer"` + `onMouseDown={focusFieldOnPress}` (`TS components/input/input.tsx:17`).

### Wzór pigułki ToggleGroup (`TS components/toggle-group/toggle-group.tsx`, `recipes/indicator.css`, `lib/indicator.ts`)

- Tor: `<div role="radiogroup" data-recipe="surface" data-level="sunken" data-surface="track" data-inset="inset">` (`:148-160`); dwie pigułki `<div data-recipe="indicator" data-variant="hover|raised|active" aria-hidden><div data-slot="squash"/></div>` z refów `useIndicator({ axis, items: ITEM, hover? })` (`:66-74`, `:94-96`).
- `IndicatorParts` (`lib/indicator.ts:40-45`): `container`, `ride`, `squash` (callback refs), `select(active, under)`. `ride` dostaje pozycję (`--ts-i-inline-size`, `--ts-i-block-size` z `lib/instance.ts` + WAAPI), `squash` ugina się na ścianie (`transform-origin` z `data-axis`/`data-wall`).
- Przepis `indicator` (`indicator.css`): `position: absolute; inline-size: var(--ts-i-inline-size); block-size: var(--ts-i-block-size); opacity: 0` (widoczne `[data-visible='true']`); `[data-variant='raised']` → `--_fill: var(--ts-depth-raised-bg)`, `--_fill-opacity: 1`, `box-shadow: var(--ts-depth-raised-shadow)` na `[data-slot='squash']`; `border-radius: var(--ts-shape-control-radius)`, `corner-shape: var(--ts-shape-control-corner)`; `hover` wygasa w `--ts-motion-duration-hover-exit`.
- `forced-colors`: raised/active = `Highlight`, hover = obrys `ButtonText` (`indicator.css:74-88`).
- Opcje: `<button type="button" role="radio" aria-checked tabIndex data-recipe="control" data-variant="ghost" data-focus="inset">` ze slotami `icon` i `label` (`:181-200`).
- Stan: `createSingleChoice` (`lib/single-choice.ts`) + `useSyncExternalStore` per opcja (Q9); `useLayoutEffect` woła `showChosen(button.current)`.
- Klawiatura: `moveInCollection` z `lib/collection.ts` (orientation `'both'`, kierunek z `:dir(rtl)`, typeahead).
- Układ (`toggle-group.css`): `inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr`, w `Field` powyżej 400 px `justify-self: end`.
- `lib/collection.ts` obsługuje Home/End i strzałki po **indeksach elementów** z typeahead; **nie ma PageUp/PageDown ani kroku wartości**.

### Wspólne narzędzia, z których będzie korzystać runda D

- `lib/instance.ts`: `writeInstance(element, values)`, `INSTANCE_KEYS = { '--ts-i-value': '<number>', '--ts-i-inline-size': '<length>', '--ts-i-block-size': '<length>' }`. `@property` w `engines/size.css:1-17`, `--ts-i-value` ma `initial-value: 0`.
- `lib/slot.ts`: `SlotHost`, `usePart`, `useHost`, `useSlotOrder`, `misplacedSlot`; `Field` korzysta z `FIELD_SLOTS = ['label', 'description', null, 'error']` (`field.tsx:11`).
- `lib/focus-field.ts`: `focusFieldOnPress`, `focusFieldOfLabel`.
- `components/field/field.css`: siatka `1fr auto` od kontenera 400 px (`CONTAINER_WIDTHS = { narrow: 400 }`, `test/guards/css-layers.ts:7`), etykieta kolumna 1, kontrolka kolumna 2 z `align-items: baseline`, błąd `grid-column: span 1 / -1`; w `Card` podsiatka (`subgrid`).
- `components/field/field.tsx:21-28`: `Field` ustawia `validationMode ?? 'onBlur'`.
- `docs/field.md` mówi, że kontrolki to "`Input`, `Textarea` i, od późniejszych rund, `Select`, `Checkbox` i `Switch`".

## 7. Luki i sprzeczności (bez rozstrzygania)

01. **Natywny vs Base UI.** `RES` (draft, 2026-11-01) rekomenduje natywne `<input type="checkbox">` (3 węzły) dla Checkbox i Switch; `DEC` pkt 4 z tego samego dnia i `PL` D60/U18 wybierają Base UI (4 węzły). Dokument `RES` zachowuje całą analizę natywnej drogi: jego stwierdzenia o natywnym DOM nie obowiązują, ale tabele zachowań (kolumna "Natywny") są dalej w pliku.
02. **Liczenie węzłów w D50 vs `RES`.** D50 mówi: Checkbox = `Root` > `Indicator keepMounted` jako `box` > glif, plus ukryty `input` = Root + Indicator + svg + input = **4**. `RES` (tabela Checkbox, "Base UI z `Checkbox.Indicator`") liczy **5**, bo w jego wariancie `span.box` jest osobnym elementem od `Indicator`. Switch: Root + track + Thumb + input = 4 (zgodne). Zapis `B5 ≤ 4` zależy od tego, czy `Indicator` jest `box`em; rozstrzyga próba N7.
03. **Plan nie określa, co z `Checkbox.Indicator` bez `keepMounted`:** D50 wymaga `keepMounted`; kod `CheckboxIndicator.js` zwraca `null`, gdy `!keepMounted && !mounted`. Wymagana jest animacja wyjścia (`opacity`+`scale`).
04. **Enter.** Switch w Base UI przełącza się na Enter przez `useButton` (`useButton.js:150-154`); Checkbox na Enter wysyła formularz (`CheckboxRoot.js:268-300`). Plan (D60) i DEC mówią tylko o Switchu ("Enter przełącza Switch jak Radix/v2"). V2 i desktop (Radix) nie przełączają Checkboxa na Enter; zgodne z Base UI. `RES` w tabeli Switch pisał (przy opisie Base UI) "oba"; kod to potwierdza dla Enter, a Space przez keyup.
05. **`largeStep`/PageUp.** Plan D61 nie podaje, ile zmienia PageUp/PageDown w własnym Sliderze. Radix (`RES`, `index.mjs:161-163`): 10 kroków (i Shift + strzałka); Base UI: `largeStep` = absolutna wartość, domyślnie 10 (`SliderRoot.d.ts`, `SliderThumb.js:302,317-324`). Przy desktopowych zakresach (0–0,08, krok 0,001) różnica jest istotna (0,01 vs 10). API w `PL:497` nie ma `largeStep`.
06. **Typ `value` Slidera.** `PL:497`: `value?`, `defaultValue?`, bez typu. Desktop i v2 używają tablicy (`value={[zoom]}`, `onValueChange={([v]) => ...}`), SliderRow konwertuje na liczbę. Zakres z dwoma kciukami `RES` oznacza jako "poza kontraktem E3, YAGNI", ale `PL` tego jawnie nie zapisuje (D78 wyklucza tylko pion).
07. **`onValueCommit` w desktopie.** DEC pkt 7 i `PL:100`: "desktop używa commit". W `desktop/src` i `packages/ui/src` żaden call site go nie przekazuje; istnieje wyłącznie prop `onValueCommit?: () => void` w `slider-row.tsx:14,27,45` (bez argumentów). Plan definiuje commit jako koniec przeciągania, "przy klawiaturze od razu".
08. **Rail sm = md = 3 px.** Z formuły `max(2px, round(height/7, 1px))`: xs 2, sm 3, md 3, lg 4, xl 5. Zasada właściciela nr 1 i `e3-size-scale.md` wymagają ścisłego wzrostu każdej wartości zależnej od rozmiaru. Test `lab.spec.ts` sprawdza `rail ≥ MIN_RAIL`, nie ścisły wzrost. Podobnie `--ts-size-gap` xs = sm = 3 (`size.css:30,39`), choć `e3-size-scale.md` pkt 1 każe to zmienić (w `size.css` w worktree jeszcze xs = sm = 3). Slider B nie używa `rail` jako wysokości toru (używa `track-block`), ale wariant A ("szyna") by użył.
09. **`track-inline` w xs/md/xl.** Wzór `round(block × 1,75, 1px)` daje wartości z remisem (24,5 → 25; 31,5 → 32; 38,5 → 39), zależne od tego, jak przeglądarka zaokrągla remisy w `round()`; to mój rachunek, nie pomiar. Test `lab.spec.ts:~216` używa `toBeCloseTo(Math.round(block × TRACK_RATIO), 1)` (JS `Math.round` zaokrągla remis w górę, ta sama konwencja).
10. **Box 16 vs 20.** `box` = rozmiar ikony (lg 16), tor lg 20 × 35. `RES` zgłosił różnicę względem Kevina (L426, box = wysokość toru 20) jako pytanie; `DEC` pkt 6 tylko stwierdza "`box` = rozmiar ikony", nie odnosi się do 20.
11. **Hit area vs `pointer: coarse`.** W1/F3 mówią o obszarze trafienia równym pudełku kontrolki i minimum 24 px dla kontrolek interaktywnych; box jest 10–18 px, tor ma wysokość 14–22 px. `RES` zakłada gospodarza ≥ 24 (wysokość kontrolki z `--ts-size-height`) z boxem w środku; D50 mówi, że gospodarz = `Checkbox.Root` (czyli sam element z `role=checkbox`). Plan nie rozstrzyga, jak gospodarz o wysokości kontrolki (28 w lg) zachowuje się, gdy `box` ma 16 px (gdzie kończy się trafienie, hover "wokół boxu" — `RES` sekcja Checkbox pkt 4).
12. **Biała lista i fokus.** Plan i DEC pkt 8 każą rozszerzyć białą listę przez `:has(> [data-slot='box'], > [data-slot='track'])`, a gospodarz Base UI jest `span[role=checkbox]` z `tabindex` z `useButton`. W `control.css` na białej liście są `[role='radio']` i `[tabindex]`, ale nie `[role='checkbox']`/`[role='switch']`/`[role='slider']`. Czy `tabindex` pojawia się na rootach Base UI, nie zweryfikowałem w `useButton.js`.
13. **Brak odpowiednika `aria-checked` w stanach.** `control.css:272` ustawia wypełnienie tylko dla `aria-pressed`/`aria-selected`; D50 mówi "gospodarz nie maluje tła zaznaczenia" (zgodne), ale brak reguły dla części na `[aria-checked='true']` (do R2). Dotyczy też `[data-checked]` vs `[aria-checked]`: Base UI daje oba; plan wybrał `aria-checked`.
14. **Kolizja z regułą o wciśnięciu.** Spec W20/AGENTS: skalowana jest tylko płytka `::before`. Gospodarz Checkboxa/Switcha z ukrytym inputem: `scale` na `::before` całego gospodarza (28 px) dałby ugięcie większe niż `box`/`track`; sposób ugięcia boxa i kciuka nie jest zapisany (DEC pkt 5: "ptaszek `scale`+`opacity`", wciśnięcie nie omówione poza propozycją B ruchu Switcha).
15. **Slider: `lib/collection.ts` vs krok wartości.** D61 mówi o "strzałki, PageUp/PageDown, Home/End, RTL (`lib/collection.ts`, lustro `:dir(rtl)`)". `moveInCollection` zwraca indeks elementu listy z typeahead; nie obsługuje PageUp/PageDown ani zakresu liczb. Czy Slider ma z niego korzystać (np. tylko kierunek RTL), plan nie mówi. RTL w Base UI Slider idzie z `DirectionContext`; w Tessera (`toggle-group.tsx:135`) z `matches(':dir(rtl)')`.
16. **Slider: B2/B3 vs `onValueChange`.** D61: "tylko komponent wartości się re-renderuje" i "stan Reacta wyrównuje się na końcu przeciągania", a kontrakt `onValueChange` zgłasza krok. `RES` zauważa, że jeśli konsument trzyma wartość w stanie rodzica, każdy krok re-renderuje rodzica; wymagany opis w `docs/slider.md`. Desktop (`pipeline-ocr-controls.tsx:11-16`) trzyma wartość w storze Zustand i przekazuje ją wprost do `SliderRow.value`, więc ten wzorzec jest w użyciu.
17. **Q7.** Lista plików z pomiarem (`contracts.test.ts:14`) nie zawiera jeszcze `lib/slider.ts`; wchodzi z konsumentem w R2/R3 (`PL:638`).
18. **Etykieta Slidera.** `PL:98`/`field.md` obiecują fallback fokusu dla kontrolki bez `htmlFor`; `RES` dodaje, że `role="slider"` nie jest etykietowalny, więc potrzebny jest `labelId` z `useLabelableContext` (internals Base UI) na `aria-labelledby`. Plan nie mówi, jak Slider (własny kod) uzyskuje `labelId` bez importów `internals/*` (D60 wprost odrzuca je dla Checkbox/Switch). V2 robił to `MutationObserver`em na `[data-slot="field-label"]` (`slider.tsx:31-43`); desktop `SliderRow` ma `aria-label={label}` na kciuku i osobny `FieldLabel` bez powiązania.
19. **Wartość w UI Slidera.** Plan: "Slider ze wartością" i osobny komponent wartości (D61); w desktopie wartość stoi w prawym rogu wiersza etykiety (`slider-row.tsx:38-40`), a timeline zoom nie ma jej wcale. DEC pkt 5 (Slider B) nie mówi, czy wartość jest w torze (v2 `tube`/`field`), czy w rzędzie etykiety.
20. **Podziałki (ticks).** V2 i Kevin/Nitish je mają; desktop nie. `RES` zostawia pytanie ("w E3 czy później, brak konsumenta = YAGNI"); `PL` nie wpisuje ich do zakresu.
21. **Kolejne sprzeczności drobne.** (a) `PL:833` ("faza 7 składa Ustawienia według desktopu bez Switch, Checkbox, Slider") jest zastąpione przez `PL:68`, `PL:899` (L4) i fazę 7; to ślad starej wersji w tabeli "zakres P3". (b) `PL:14`/spec F10 podaje kolejność rundy D "Checkbox, Switch, Slider", a D50 przewiduje jedno źródło reguł części w `control` zarówno dla pola wyboru, jak i toru; Slider ma w `PL:270` własną reguły toru "w `control`". Plan nie mówi, czy tor Slidera dostaje slot `track`/`thumb` o tych samych nazwach co Switch (DEC pkt 5 mówi "to samo DNA"; `RES`: "DNA na poziomie wyjść silnika, nie DOM").
22. **Dowody niezweryfikowane przeze mnie.** Wszystkie liczby węzłów (3/4/5), zachowanie Enter/Space/`indeterminate` po kliku, hover zaznaczonego pola i kontrast granicy pustego boxa ≥ 3:1 są z kodu lub rachunku. Żadnej próby przeglądarkowej nie wykonałem; `e3-base-ui.md` nie ma jeszcze sekcji "Runda D". Kontrast granicy (np. `--ts-depth-raised-shadow` jasny, pierścień 0,05 krycia) nie został policzony.
