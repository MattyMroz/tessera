---
kind: specification
status: draft
updated: 2026-10-31
---

# Specyfikacja: Tessera v3

Dokument mówi, co ma być prawdą. Kolejność pracy jest w [plans/masterplan.md](plans/masterplan.md), drzewo repo w [structure.md](structure.md). Dowody są w `research/r1`–`r5` (stan 2026-10-30). Spec jest jedynym źródłem decyzji; `docs/decisions/` trzyma tylko wyniki pomiarów, które je rozstrzygnęły.

Źródło każdego ustalenia w nawiasie: **[W]** właściciel, **[W-del]** prowadzący na prośbę właściciela („ja się ciebie pytam”), **[P]** propozycja prowadzącego z researchu, zatwierdzana razem z tą specyfikacją, **[R#]** raport researchu.

## Cel

Tessera v3 to system stylu i komponentów React, z którego aplikacje właściciela składają interfejs bez pisania własnych stylów. Element dodany raz działa poprawnie w każdej kompozycji: przycisk wygląda dobrze tak samo na stronie, w karcie, w popupie i w menu, bo nie ma własnego wyglądu, tylko bierze go ze wspólnych silników.

## Użytkownik i intencja

- Właściciel (solo dev, Windows 11) i jego aplikacje: desktop MangaShift (Tauri 2 + React 19 + Vite), strona mangashift.com (Next.js 16, static export), później AniShift i kolejne projekty.
- Intencja: „zrobić to raz, a dobrze, i już nigdy nie stylować od nowa”. Tesserę robimy dla siebie i własnych projektów; sprzedaż kiedyś możliwa, nie jest celem.
- Priorytet nr 1: wydajność („jak światło”, setki elementów naraz bez zacięć). Priorytet nr 2: wygląd bez artefaktów. Wygląd jest poprawny dopiero wtedy, gdy właściciel tak oceni na żywo.

## Stan wyjściowy

- v2 jest zamrożona na branchu `refactor/tessera-motion` repo MangaShift (stan zamrożenia: commit `186fdcd37`, wypchnięty 2026-10-30) i nie wraca na `main`.
- Desktop nie używa Tessery; używa starego `@mangashift/ui` w 165 plikach. Strona na `main` stoi na starym kicie; wersja strony na v2 istnieje tylko na branchu.
- Diagnoza v2 \[R5\]: formuła kształtu w 3 implementacjach, dwa mechanizmy wykrywania rodzica (kontekst React i pomiar DOM), 71 ze 116 plików CSS z własnymi wartościami, tokeny per komponent w fundamencie (≥ 320 z 558 w `scale.css`), strażnik wartości oparty na kopii listy, ruch rozmiaru na wątku głównym, galeria większa niż biblioteka.

## Ustalenia

### Repo i dystrybucja

- **U1.** v3 powstaje w nowym, osobnym repo `PROJECTS/tessera`. [W] Skutek: kod biblioteki znika z MangaShift po migracji konsumentów.
- **U2.** Repo jest bun workspace: `packages/tessera` (jedyna paczka) i `apps/docs` (strona dokumentacji). Bez Turbo, Storybooka i strażnika buildu z v2. [P, R4]
- **U3.** Tessera jest prawdziwą paczką `@mattymroz/tessera` instalowaną przez bun. [W] Na co dzień konsument linkuje lokalny folder (`link:`) i widzi zmiany bez publikacji. [P] Do migracji pierwszego konsumenta wersja `0.y.z` ręcznie. [P, R4]
- **U4.** Standard repo (AGENTS.md, `.gitignore`, `.gitattributes`, hooki commitów, bramka agentowa, `standard.py`) pochodzi z presetów repo `agents` w obecnej wersji; są gotowe do użycia. [W, 31.10]
- **U5.** Używamy najnowszych stabilnych wersji bibliotek; typecheck przez TypeScript 7. [W]
- **U32.** Bez Figmy i narzędzi projektowych; źródłem wartości silników jest TypeScript, jak w v2. Powód: ruch biblioteki (squishy, sliding) i tak powstaje i jest oceniany w kodzie. [W, 31.10]
- **U26.** Repo na GitHubie: prywatne `MattyMroz/tessera`, push branchy dla CI dozwolony. [W, 31.10]

### Platformy

- **U27.** Biblioteka działa wszędzie: aktualne Chrome/Edge, Safari i Firefox oraz webview Tauri na każdym systemie. Linux bez gwarancji wyglądu. [W, 31.10]
- **U28.** Desktop MangaShift na razie tylko na Windows (WebView2), więc to główny cel wyglądu i pomiarów. [W, 31.10]
- **U29.** Strona mangashift.com zostaje taka, jaka jest (demo i zbieranie kontaktów); migracja strony na v3 nie jest teraz potrzebna. [W, 31.10]

### Model systemu

- **U6.** Trzy piętra: **silniki** (wybory motywu → tokeny) → **przepisy** (łączą silniki w rodzaje elementów) → **komponenty** (cienkie, bez własnego wyglądu). [W]
- **U7.** Dziewięć silników: `color`, `type`, `motion`, `space`, `size`, `shape`, `depth`, `state`, `focus`. Ikony, obramowanie, warstwy (z-index), materiał (blur) i neon są wejściami lub wyjściami tych silników. Siatka i breakpointy zostają w Tailwindzie. [R1; właściciel chciał „więcej silników” niż 5]
- **U8.** Silniki tworzą graf bez cykli: `color`, `type`, `motion`, `space` → `size` → `shape` → `depth` → `state`, `focus`. [R1]
- **U9.** Każdy silnik ma ten sam kształt: wejścia (atrybuty `data-*` i liczby `--in-*`) → wyprowadzenie (w buildzie albo w CSS) → wyjścia `--<silnik>-<rola>` jako jedyne publiczne API. Silnik czyta tylko wyjścia silników, od których zależy. [W: „na jedno kopyto”; R1]
- **U10.** Pięć przepisów: `control`, `surface`, `row`, `indicator`, `focus`. Wspólny słownik wariantów (np. `solid`, `soft`, `outline`, `ghost`) niesie spójność między komponentami. [P, R1]
- **U11.** Warstwy tokenów: L0 wartości surowe (tylko w buildzie), L1 wejścia motywu, L2 tokeny semantyczne (publiczne), L3 zmienne lokalne przepisu (prywatne). Nie ma publicznych tokenów komponentu. Skutek: zmiana wyglądu jednego elementu wymaga wariantu przepisu, nie nadpisania tokenu. [P, R1]
- **U12.** Motyw (np. `mangashift`, `mangashift-site`) to zestaw wyborów silników. Unikalny styl aplikacji żyje wyłącznie w motywie. [W: „z tego musi wyjść nasz styl”; P]
- **U13.** Kaskada wyborów z v2 zostaje: domyślne → motyw → zapis użytkownika → system. [R5]

### Technologia

- **U14.** Styl to statyczny CSS ze zmiennymi. Tailwind v4 zostaje wyłącznie do układu w aplikacjach (flex, siatka, odstępy z tokenów); w aplikacjach zakazane są dowolne wartości wyglądu (`bg-[#…]`, `rounded-[…]`). Komponenty Tessery nie używają klas Tailwinda, więc konsument nie skanuje `node_modules`. [W-del]
- **U15.** Paczka ma dwa wejścia CSS: `tessera.css` (tokeny, kolejność `@layer`, CSS komponentów w `@layer components`) i `tailwind.css` (`@theme inline`, most tokenów do utility aplikacji). [P, R4] `tailwind.css` powstaje z pierwszymi tokenami silników (E2), bo wcześniej nie ma czego mostkować (Z8).
- **U34.** Lint przez ESLint, nie Biome: reguły konsumenta Tessery są wtyczką ESLint, a dwa narzędzia lintu to dwa źródła prawdy. Formatowania kodu TS, CSS i JSON na razie nic nie wymusza (Biome robiłby to w presecie `agents`); decyzja o formaterze należy do właściciela (N17). [P, E1 31.10]
- **U16.** Build: tsdown, tylko ESM, plik wyjściowy na plik źródłowy, `exports` bez zbiorczego `.`, `sideEffects` tylko dla CSS. `'use client'` tylko w plikach z hookami lub handlerami. [P, R4]
- **U17.** Strona dokumentacji i konsumenci zewnętrzni czytają `dist` paczki (po React Compilerze), a jedna komenda `bun run dev` uruchamia równolegle `tsdown --watch` i `next dev`. Warunek `source` w `exports` służy tylko TypeScriptowi (`customConditions`). Powód: Turbopack w Next 16.4 nie obsługuje własnych warunków `exports` (tylko `browser`), a webpack albo alias do `src` dawałby wolniejszy dev albo drugie źródło prawdy obok `exports`. Laboratorium testuje dzięki temu dokładnie to, co dostaje konsument. \[P, E1 31.10: `decisions/e1-source-condition.md`\]
- **U18.** Dostawcą zachowania (klawiatura, focus, a11y, pozycjonowanie) jest Base UI; Radix wypada. [W, 31.10] Base UI obsługuje dialog, popover, menu, context menu, menubar, select, combobox i tooltip; natywne elementy obsługują checkbox, radio i switch; własny kod obsługuje tabs, toggle group, slider, scroll area i toast [R2]. Prymityw Base UI, który nie daje zachowań z F15 albo przekracza budżet, dostaje własną implementację z udokumentowanym powodem (N7).

### Dokumentacja i laboratorium

- **U19.** Strona dokumentacji jest jednocześnie laboratorium: jeden link lokalnego serwera deweloperskiego, zmiany widoczne po zapisie, zbudowana wyłącznie z Tessery. Zastępuje galerię v2 i luźne pliki HTML. [W]
- **U20.** Strona dokumentacji wygląda i zachowuje się jak obecna strona mangashift.com (one-pager). [W, 30.10] Do czasu powstania sekcji strony jest złożona z tego, co Tessera już ma, bez własnego CSS; sposób i termin dojścia do wyglądu strony do ustalenia (N16).
- **U31.** Laboratorium ma boczny panel wyborów, tak jak v2 miała panel wyglądu; https://ui.shadcn.com/create to tylko przykład idei, nie wzór 1:1. W panelu są wszystkie wejścia silników (więcej niż w shadcn, m.in. kolor i akcent, profil typograficzny, kształt i promień, gęstość, ruch, głębia, neon), a każda zmiana od razu przebudowuje wszystkie ekrany. Panel jest zbudowany z komponentów Tessery i zapisuje wybór jako motyw. [W, 31.10]
- **U30.** Dokumentacja dla agentów to pliki markdown w paczce (`docs/<element>.md`) i `llms.txt` generowany z nich; bez MCP i CLI na start. [W, 31.10]
- **U21.** Laboratorium pokazuje każde piętro (silniki, przepisy, komponenty), ale ocenę właściciela dostają ekrany w kompozycji (U23); strony pięter służą diagnozie. [P]

### Proces

- **U22.** Budowa idzie wszerz: rundy wielu elementów naraz na wspólnych przepisach; poprawki w silnikach i przepisach, nie w komponentach. [P, przyjęte w rozmowie]
- **U23.** Element ocenia się w kompozycji, nie w izolacji. Status przed oceną właściciela to najwyżej „gotowe do oceny”. [W]
- **U24.** Każdy etap zaczyna się od kontraktu w `docs/plans/` zaakceptowanego przez właściciela i kończy linkiem, instrukcją sprawdzenia i (przy ruchu) nagraniem obok poprzedniej wersji. [P, W: „pokazuj linki”]
- **U33.** Limit rund wyglądu: gdy ekran albo wariant ruchu wraca z poprawkami drugi raz, następna runda pokazuje 3 wersje tej samej rzeczy obok siebie i właściciel wskazuje jedną; gdy żadna nie pasuje, stop kodu i najpierw ustalenie wyglądu na przykładach. [W, 31.10: „rozumiem o co chodzi”]
- **U25.** Strażnicy powstają razem z regułą, jako biała lista z jawnymi wyjątkami z powodem. [W]

## Decyzje wyglądu z wcześniejszych ustaleń właściciela (obowiązują)

- **W1.** Skala kontrolek xs/sm/md/lg/xl: wysokość 16/20/24/28/36, font 10/11/12/13/15, ikona 10–18; domyślny `lg` (28). Jedna skala we wszystkich komponentach, bez aliasów.
- **W2.** Gęstość zmienia tylko kontenery (padding, gap, promień kontenera); nigdy rozmiar kontrolek, ich font ani wysokość wiersza.
- **W3.** Kształt: jeden parametr dla wszystkich rozmiarów; kapsuła z prawdziwych półkoli; promień pośredni rośnie proporcjonalnie z wysokością. Squircle domyślnie (`corner-shape`, promień × 1,6, najwyżej 45% wysokości), a gdzie przeglądarka go nie wspiera (WebKit), zostaje zwykły łuk; zwykły łuk jako opcja. Radio = koło, switch = kapsuła. Promień zagnieżdżony koncentryczny.
- **W4.** Padding optyczny: baza + ¼ promienia (`min(promień, wysokość/2) × 0,25`). Ikona i tekst w wierszu mają jeden padding.
- **W5.** Symetria domyślnie: przeciwległe strony mają równy padding.
- **W6.** Kolor: każdy kolor palety ma nazwę w stylu Apple z wartością jasną i ciemną; wartości ze źródeł (Apple, Radix), nie z własnych wzorów; tryb podstawowy Contrast (jasny: biel z czarnymi przyciskami, ciemny odwrotnie), kolorowy akcent jako opcja; kolor tekstu zależy od tła (pary `on-`); ciemny nie jaśniejszy niż `#101012`, jasny „biały jak mleko”. Pełne słowa właściciela: `MangaShift/docs/plans/ui-kit/research/owner-colour-intent.md`.
- **W7.** Żywe kolory akcentu i statusów przed WCAG; kontrast wymuszany tylko w rolach neutralnych i etykiecie na wypełnieniu.
- **W8.** Drabinka stanów: atrament 8/12/16% (ciemny), 4/7/10% (jasny); akcent 8/16/24% + ramka 25%.
- **W9.** Pola bez ramki, tło z drabinki. Grupy kontrolek: A osobne we wspólnym tle, B sklejone bez kresek.
- **W10.** Szkło (blur) tylko w panelach i popupach, nigdy w karcie.
- **W11.** Neon w trzech trybach: off; mini (mała poświata na elementach niosących akcent: włączony switch, checkbox, wypełnienie suwaka, primary, focus, aktywna ikona); full (mini + orby w tle, 1:1 z `desktop/src/app/layout/neon-orbs.tsx`). Nigdy na tekście, nagłówkach i calloutach.
- **W12.** Zero pionowych kresek akcentu z boku elementów (nagłówek, alert, aktywna pozycja, karta); stan aktywny pokazuje tło.
- **W13.** Fonty wbudowane, nie jeden font: Inter i Cascadia Code dołączone do paczki, Mono = Cascadia Code; każdy wybór fontu pokazuje swoją nazwę swoim krojem.
- **W19.** Typografia jako profile \[W, 31.10\]: profil typograficzny to zestaw krojów dobranych w pary, które ze sobą działają (np. tekst, nagłówki, display, mono), wybierany jak motyw. Desktop używa jednego kroju głównego; strona może używać kilku, żeby odróżnić sekcje. Osobno presety zachowania tekstu (rozmiar, interlinia, rytm, szerokość wiersza) dla różnych rodzajów treści. Zestaw profili i presetów rośnie w czasie; domyślny zwykły font nie wystarcza właścicielowi.
- **W14.** Styl „wysp” i sliding zostają. Sliding: jedna pigułka hover i jedna active; pigułka nie znika między elementami; hover ≥ 10/12%; chowa się tylko po wyjściu z listy; odbicie od ściany rodzica zamiast przenikania.
- **W15.** Ekrany typu Start i Settings bez wysp: wyśrodkowane, luźne elementy.
- **W16.** Zero animacji wejścia popupu z niczego (popover, menu, select, tooltip, combobox). Wyjątki: dialog oraz animacje wejścia sekcji strony jako opcja części Tessery. Przelot okienka między triggerami (menubar, podmenu, tooltip w grupie) jest ruchem i zostaje, jako jeden wspólny mechanizm.
- **W17.** Strona składa się wyłącznie z części Tessery: sekcje strony (hero, navbar, footer i inne), ich warianty i opcje są częścią Tessery, z testem i dokumentacją; aplikacja nie ma własnego CSS.
- **W20.** Charakter ruchu biblioteki: „squishy” i „sliding” [W, 31.10]. Jeden silnik działa we wszystkich miejscach: listy i menu, drzewo, zakładki, toggle group, toolbar, menubar, nawigacja, radio, tabela, kalendarz, paginacja, pasek miniatur. Sliding: pigułka przesuwa się między elementami. Squishy: elementy uginają się przy kliknięciu, a pigułka odbija się od krawędzi (bounce). Technikę dobiera E0 (c) w granicach Q2–Q4; zgniecenie kształtu z obwódką i squircle przy nieproporcjonalnej skali to znane ryzyko artefaktu (R3 §6.2), więc właściciel ocenia je na żywo.
- **W18.** Nagłówki grup menu wielkimi szarymi literami. Tekst UI po angielsku.

## Przenoszone z v2

Ścieżki względem `MangaShift/tessera/packages/tessera/src/` na branchu `refactor/tessera-motion`. Przeniesienie = przepisanie na model v3, bez starych nazw.

| Co                                  | Skąd                                                                                                                                                                                                                                                                    | Forma w v3                                                                                                                                                                                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kaskada wyborów motywu              | `lib/theme-data.ts`, `theme-store.ts`, `theme.ts`, `theme-bootstrap.ts`, `components/theme-provider.tsx`, `theme-script.tsx`, `src/vite/`                                                                                                                               | wejścia L1 silników i motywy; 16 osi v2 weryfikowanych pod realnego konsumenta                                                                                                                                                                                               |
| Generator kolorów, fontów i docs    | `scripts/generate-colors.ts`, `generate-fonts.ts`, `generate-docs.ts`; wartości `styles/colors.css`, `ACCENT_SHADES`                                                                                                                                                    | silnik `color` (rampy w buildzie), `type`, generator `docs/`                                                                                                                                                                                                                 |
| Formuła kształtu z testami          | `lib/shape.ts`, `lib/shape.test.ts`                                                                                                                                                                                                                                     | jedyne źródło formuły silnika `shape`                                                                                                                                                                                                                                        |
| Logika slidingu i odbicia od ściany | `_internal/floating-indicator.tsx`, `hooks/use-floating-indicator.ts`, `hooks/use-popup-slide.ts`                                                                                                                                                                       | przepis `indicator` i wspólny przelot okienek; technika ruchu według Q2–Q4                                                                                                                                                                                                   |
| Zachowanie komponentów              | `.tsx` komponentów bez warstwy wyglądu; `lib/popup-store.ts`, `virtual-list.ts`, `compose-refs.ts`, `input-modality.ts`, `hooks/use-collection.ts`, `use-virtual-list.ts`, `use-menubar-hotkey.ts`, `_internal/use-reorder.ts`, `scroll-across.ts`, `title-when-cut.ts` | zachowania z F15 zawsze; reszta tam, gdzie dostawca (N7) jej nie daje                                                                                                                                                                                                        |
| Kontrakty zbudowanej paczki         | `test/dist/*`                                                                                                                                                                                                                                                           | `packages/tessera/test/package/`                                                                                                                                                                                                                                             |
| Reguły eslint konsumenta            | `eslint/no-local-css.ts`, `no-local-appearance.ts`, `no-literal-colors.ts`, `no-data-theme.ts`, `compositor-motion.ts`, `style-policy.ts`, `static-values.ts`                                                                                                           | E1: `no-local-css` (wejście CSS z importów `tailwindcss`, `tessera.css`, `tailwind.css`), `no-local-appearance` (tryb aplikacji), `no-literal-colors`, `compositor-motion`; bez `no-legacy-tokens`; `no-data-theme`, tryb komponentów i laboratorium wracają przepisane w E2 |
| Strażnicy jakości                   | `test/focus-ring`, `icon-stroke`, `tabular-nums`, `no-entry-motion`, `motion-compositor` (+ format `motion-exceptions.ts`), `locale`, `registered-properties`, `generate-*`; sonda trace G3 z `apps/gallery/tests/motion-composited.spec.ts`                            | `test/guards/` i `apps/docs/tests/`                                                                                                                                                                                                                                          |
| Teksty wbudowane                    | `locale/`, `components/locale-provider.tsx`, `direction.tsx`                                                                                                                                                                                                            | bez zmian semantyki                                                                                                                                                                                                                                                          |

Nie przenosimy: `styles/tokens.css`; tokenów komponentów i sekcji ze `scale.css`; helperów kształtu (`button-shape`, `measured-shape`, `surface-edges`, `control-shape-recipe`, `row-shape`, `tooltip-shape`, `shape-context`, `use-shape`); CSS komponentów; białej listy `test/css-values.test.ts`; warstwy legacy v1; galerii i `apps/_legacy`; strażnika buildu (`ensure-build`, `dev-host`); porównania zatrzymanych klatek G4.

## Wymagania funkcjonalne

### Silniki

- **F1.** Każdy z dziewięciu silników ma folder o tym samym kształcie i stronę w laboratorium z próbkami wszystkich wyjść w obu trybach.
- **F2.** Silnik `shape` jest jedynym źródłem promienia, także dla powierzchni na każdym poziomie głębi: formuła w jednym miejscu, wartości w jednym miejscu, a rodzic przekazuje promień i wcięcie dzieciom przez dziedziczone zmienne CSS, bez pomiaru DOM. Promień zagnieżdżony = promień rodzica − padding rodzica, nie mniej niż minimum. Mechanizm sprawdza E0.
- **F3.** Silnik `size` daje dla każdego rozmiaru: wysokość, padding, odstęp, ikonę, stopień tekstu i obszar trafienia.
- **F4.** Silnik `depth` daje dla każdego poziomu (`sunken`, `base`, `raised`, `overlay`, `modal`): tło, cień, obrys, warstwę i materiał. Daje też jedną poświatę neonu zależną od trybu (W11), której używają wyłącznie przepisy elementów niosących akcent.
- **F5.** Silnik `color` generuje rampy w buildzie, w runtime tylko wybiera preset atrybutem; role mają nazwy według W6.
- **F6.** Silnik `motion` daje najwyżej ok. 10 wyjść (czasy i krzywe `cubic-bezier`); przepisy wybierają z nich, nie definiują własnych czasów. Sprężyny dopiero po zniesieniu Q5.

### Przepisy i komponenty

- **F7.** Każdy komponent bierze wygląd z przepisów. CSS komponentu zawiera tylko rozmieszczenie jego części (`display`, `gap`, wyrównanie, `flex*`, kolejność, kolumny i wiersze siatki) z tokenami; nie zawiera rozmiaru, pozycji, koloru, promienia, cienia ani ruchu, a z liczb tylko `-1`, `0`, `1`, `100%` i `Nfr` (kolejność, wzrost, podział siatki).
- **F8.** Focus ma jeden przepis (warianty: na zewnątrz, wewnątrz); żaden komponent nie deklaruje własnego `:focus-visible`.
- **F9.** Popup i powierzchnia biorą poziom z `depth`; przycisk w popupie ma ten sam wygląd co na stronie, poza koncentrycznym promieniem wynikającym z rodzica.
- **F10.** Pierwsza runda obejmuje 20 komponentów: Button (z grupami A/B), Input, Textarea, Select, Checkbox, Switch, Slider, Toggle Group, Tabs, Badge, Kbd, Field + Label, Item, Tree, baza menu (Dropdown, Context), Tooltip, Popover, Dialog (z Alert Dialog i Confirm), Card, Alert + Toast.
- **F11.** Laboratorium ma cztery ekrany testowe, razem pokrywające wszystkie przepisy: Nakładki w nakładkach (test „przycisk w popupie”, 2–3 poziomy), Ustawienia (bez wysp, W15), Panel roboczy na wyspach, Wycinek strony w motywie `mangashift-site`. Każdy w trybie jasnym i ciemnym oraz przy skrajnych wyborach kształtu.
- **F12.** Każdy komponent ma plik `docs/<nazwa>.md` w paczce i występuje w co najmniej dwóch ekranach lub stronach laboratorium.

### Zachowanie

- **F15.** Zachowania wymyślone i przetestowane przez właściciela w desktopie przechodzą 1:1, każde z testem: pigułka slidingu zostaje na ostatnim wierszu przy separatorze; trójkąt do podmenu; natychmiastowe podmenu; przelot menubara i tooltipów między triggerami; pasek przewijania „lane”; checkbox w menu nie zamyka menu; Alt, F10 i Tab fokusują menubar; Tab przy otwartym menu przechodzi do następnego menu. Źródło: `MangaShift/packages/ui/src` i v2.

### Konsumpcja

- **F13.** Desktop (Vite, `bun tauri dev` jako jedyna komenda właściciela) i strona (Next 16) z osobnych repo widzą zmianę TSX i CSS w Tesserze bez restartu, z jedną kopią Reacta; `next build` konsumenta przechodzi.
- **F14.** Aplikacja konsumenta nie może dopisać własnego wyglądu: reguły eslint konsumenta działają w v3.

## Wymagania jakościowe

### Wydajność (twarde reguły)

- **Q1.** Zero runtime CSS-in-JS.
- **Q2.** Ruch tylko `transform`/`translate`/`scale`/`rotate`/`opacity`; `rotate` i `transform` nie na elementach SVG (opakowanie w element HTML). Każdy inny przypadek to nazwany wyjątek z powodem w jednym pliku; lista wyjątków ma maleć.
- **Q3.** Animowany element jest sztywną warstwą: zmienia się tylko położenie, przezroczystość albo jednolita skala bliska 1. Zmiana rozmiaru (`width`, `height`, `margin`, `grid-template-*`) dzieje się w jednej klatce, nigdy w ruchu.
- **Q4.** Elementy o długim życiu w ruchu (wskaźnik slidingu, popup w przelocie, poświata, orby) są warstwą przez cały czas życia; ich liczba ma budżet B7. Wciśnięcie przycisku rozstrzyga N5.
- **Q5.** Easing bez `linear()` i bez `playbackRate ≠ 1`, dopóki stabilny Safari wykonuje je na wątku głównym (U27).
- **Q6.** Kod JS nie zapisuje zmiennych CSS na `:root`/`body` poza zmianą motywu. Zmienne zapisywane przez JS na pojedynczym elemencie są zarejestrowane przez `@property` z `inherits: false`. Zmienne dziedziczone, które rodzic przekazuje dzieciom w CSS (F2), są dozwolone.
- **Q7.** Kształt i rozmiar nie przechodzą przez JS: bez `ResizeObserver` + `getComputedStyle` + `setProperty` do liczenia wyglądu. JS mierzy tylko tam, gdzie wymaga tego zachowanie (pozycjonowanie, wirtualizacja), na nazwanej liście plików.
- **Q8.** Wariant i motyw to atrybuty `data-*` + CSS, nie kontekst React. Zmiana motywu nie robi re-renderu komponentów.
- **Q9.** Zmiana zaznaczenia w grupie nie re-renderuje wszystkich elementów grupy.
- **Q10.** Zamknięty popup nie ma treści w DOM ani aktywnych listenerów pozycji.
- **Q11.** Wrapper DOM istnieje tylko z powodu semantyki albo zachowania; dekoracja w pseudo-elementach.
- **Q12.** Listy nieograniczonej długości są wirtualizowane; długie sekcje mają `content-visibility: auto`.
- **Q13.** Paczka jest kompilowana React Compilerem; testy biegną na wersji skompilowanej i nieskompilowanej.
- **Q14.** Blur: nigdy animowany promień; na elementach ruchomych ≤ 10 px; najwyżej 2 `backdrop-filter` widoczne naraz.

### Budżety

Scena „stress”: 500 kontrolek, lista 200 elementów z tooltipami, 50 triggerów popupów, 3 grupy po 20 elementów ze wskaźnikiem. Wartości startowe kalibruje pomiar v2 na tej samej scenie (E3).

Twarde bramki CI (liczniki, deterministyczne, Chromium headless, na zbudowanym `dist` z React Compilerem):

| ID  | Budżet                                                                                   | Wartość                                                                                                    |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| B1  | animacje poza listą wyjątków w scenach ruchu (trace)                                     | 0                                                                                                          |
| B2  | zdarzenia `Layout`/`Paint` animowanego poddrzewa między pierwszą a ostatnią klatką ruchu | 0                                                                                                          |
| B3  | commity komponentu na hover/press                                                        | ≤ 1                                                                                                        |
| B4  | re-rendery komponentów przy zmianie motywu                                               | 0                                                                                                          |
| B5  | węzły DOM                                                                                | kontrolka ≤ 3, zamknięty popup 0                                                                           |
| B6  | rozmiar paczki (gzip)                                                                    | własny kod komponentu ≤ 3 kB; dostawca zachowania liczony osobno i zamrożony po N7; CSS całości ≤ v2 − 30% |
| B7  | warstwy długiego życia na widoku (Q4)                                                    | ≤ 12                                                                                                       |
| B8  | publiczne zmienne semantyczne (licznik w teście)                                         | ≤ 250                                                                                                      |

Pomiary czasowe (lokalnie na maszynie właściciela, komenda `bun run perf`, mediana z 5 przebiegów, raport bez blokowania CI; regresja > 20% względem poprzedniego pomiaru wymaga decyzji):

| ID  | Pomiar                     | Cel                               |
| --- | -------------------------- | --------------------------------- |
| T1  | ramki LoAF w scenach ruchu | 0 ramek > 50 ms                   |
| T2  | hover/press                | ≤ 4 ms wątku głównego przy CPU 4x |
| T3  | przełączenie motywu        | ≤ 16 ms (1x), ≤ 100 ms (4x)       |
| T4  | INP na scenie              | ≤ 100 ms (4x)                     |
| T5  | montaż sceny               | ≤ 300 ms (4x)                     |

### Wygląd i platformy

- **Q15.** Główny cel renderowania to Chromium (WebView2 na Windows). Każdy ekran testowy jest sprawdzany też w WebKit (Playwright).
- **Q16.** Funkcja CSS dostępna tylko w jednym silniku przeglądarki (np. `corner-shape`, `clip-path` na kompozytorze) ma zapisaną wersję zapasową i nigdy nie jest jedyną techniką.
- **Q17.** Każdy interaktywny element jest obsługiwalny klawiaturą i ma widoczny focus. axe sprawdza ekrany testowe; reguła kontrastu jest twarda dla ról neutralnych i etykiet na wypełnieniu, a dla akcentów i statusów tylko informacyjna (W7).
- **Q18.** Tekst w warstwie długiego życia traci ostry antyaliasing (LCD → szary). Teksty, które mają być ostre, nie leżą na takich warstwach; skutek wizualny ocenia właściciel w E0.

## Inwarianty

- **I1.** Komponent nie definiuje własnego koloru, promienia, cienia, czasu ruchu ani wartości liczbowej poza rozmieszczeniem z F7.
- **I2.** Każda reguła wyglądu ma dokładnie jedno źródło (jedna formuła, jedno miejsce wartości).
- **I3.** Konsument nie zmienia wyglądu inaczej niż przez wybory motywu i warianty przepisu.
- **I4.** Kolejność warstw CSS (`@layer`) jest zdefiniowana w jednym wejściu paczki.

## Ograniczenia

- **O1.** Właściciel pracuje na Windows 11; testy przeglądarkowe tylko headless; Playwright z jednym workerem; testy lekkie, bo komputer się zacina.
- **O2.** Zależności frontu tylko przez bun; `bunx vitest run`, nigdy `bun run test`.
- **O3.** Pliki UTF-8 + LF; edycja tylko narzędziami Edit/Write, nigdy przez PowerShell ani skrypty.
- **O4.** Kod, komentarze, nazwy i git po angielsku; Conventional Commits z zamkniętą listą scope'ów; zero śladów AI w commitach.
- **O5.** Subagenci nie wykonują komend git; commit i push tylko na wyraźne słowo właściciela.
- **O6.** `git worktree remove` na Windows wchodzi w junctiony i kasuje ich cel; przed usunięciem worktree albo katalogu z linkiem `link:` najpierw zdjąć linki.

## Zakazane

- **Z1.** Tokeny komponentu w fundamencie i lokalne zmienne wyglądu w CSS komponentu.
- **Z2.** Biała lista wartości jako kopia pliku tokenów (strażnik rytualny z v2).
- **Z3.** Warstwa zgodności z v1/v2, aliasy starych nazw, `legacy` w kodzie.
- **Z4.** Animowanie `width`, `height`, `margin`, `box-shadow`, promienia blur, `grid-template-*` poza nazwanym wyjątkiem.
- **Z5.** Pomiar DOM per kontrolka do liczenia kształtu.
- **Z6.** Kopie DOM i kawałki wskaźnika lub popupu do udawania zmiany rozmiaru na kompozytorze (ślepa uliczka 30.10).
- **Z7.** Wariant marketingowy w rdzeniu komponentu (np. „premium” w przycisku).
- **Z8.** Puste foldery i pakiety „na zapas”.
- **Z9.** Ogłaszanie „gotowe” bez oceny właściciela na żywo.
- **Z10.** Zastąpienie zachowania z F15 innym, bo dostawca robi to inaczej.

## Zakres

- Repo `PROJECTS/tessera` ze standardem z presetów `agents`.
- Dziewięć silników, pięć przepisów, motywy `mangashift` i `mangashift-site`.
- Rdzeń komponentów: pierwsza runda 20, potem pozostałe rodziny rdzenia (ok. 30 rodzin wspólnych dla katalogów shadcn, Radix Themes, React Aria i Catalyst, z konsumentem w desktopie lub na stronie; R5 §7).
- Sekcje strony jako części Tessery (W17), przy migracji strony.
- Strona dokumentacji = laboratorium z ekranami testowymi.
- Strażnicy: struktura silników, warstwy CSS, wydajność (B1–B8), kontrakt `dist`, a11y.
- Migracja desktopu na v3.

## Poza zakresem

- Logowanie, płatności, baza danych i inne moduły aplikacji. [W: „na razie tego nie robimy”]
- Komponenty bez konsumenta: czat (bubble, message, marker, attachment, questionnaire), wykresy, kalendarz, OTP.

## Odłożone

- **Kafelki (dokowanie paneli):** osobny pakiet po rdzeniu, część wizji właściciela („liście”, panele w panelach). Wejście: implementacja desktopu `desktop/src/features/editor/shell/` i raport R2 §4–5.
- **Migracja strony mangashift.com na v3:** strona zostaje, jaka jest (U29); wraca, gdy właściciel zechce ją zmienić.
- **Premium i demo edytora:** poza rdzeniem; miejsce przy migracji strony.
- **Publikacja w rejestrze, wersjonowanie, licencja:** przy migracji pierwszego konsumenta (N3).
- **Paleta komend (`cmdk`):** przy rodzinie Command.

## Odrzucone

- Budowa v3 w monorepo MangaShift (blokuje rozwój aplikacji). [W]
- Łatanie v2 (dwie próby nie zbiegły: 10.10 i 30.10).
- Runtime CSS-in-JS. [R3]
- Ruch na kompozytorze przez kawałki i kopie wskaźnika lub popupu (szwy, zły róg, inne tło; 30.10).
- Porównanie zatrzymanych klatek (G4) jako dowód jakości ruchu (przepuściło artefakty widoczne na żywo; 30.10).
- Osobne repo na każdy moduł (koszt utrzymania bez zysku dla jednej osoby).

## Warunki sukcesu

- **S1.** Laboratorium pokazuje cztery ekrany testowe zbudowane wyłącznie z Tessery; właściciel ocenia je na żywo jako spójne: przycisk, pole i wiersz wyglądają tak samo na stronie, w karcie i w popupie zagnieżdżonym 2–3 poziomy.
- **S2.** Ruch na ekranach testowych jest płynny i bez artefaktów w ocenie właściciela, oglądany na żywo obok poprzedniej wersji.
- **S3.** Bramki B1–B8 przechodzą w CI na scenie „stress”; pomiary T1–T5 są w raporcie `bun run perf` bez regresji ponad próg.
- **S4.** Test warstw oblewa celowo dodany kolor, promień, cień, ruch i liczbę w CSS komponentu.
- **S5.** Zachowania z F15 mają testy i przechodzą.
- **S6.** Desktop i strona z osobnych repo spełniają F13 (pomiar w E0, potem test przy migracji).
- **S7.** `bun run check` repo Tessery przechodzi dwa razy z rzędu na świeżym klonie, a CI jest zielone.

## Nierozstrzygnięte

Decyzje właściciela:

- **N3. Paczka publiczna czy prywatna i licencja.** Fakty \[R4\]: publiczny npm za darmo i bez tokenów, ale kod widzi każdy; prywatny npm 7 USD/mies.; GitHub Packages wymaga tokenu przy każdej instalacji, też w CI i Cloudflare; licencja zastrzeżona na publicznym npm nie ukrywa kodu. Rekomendacja: do migracji pierwszego konsumenta nic nie publikujemy. Blokuje pierwsze wydanie.
- **N5. Wygląd ruchu** (właściciel wybiera po obejrzeniu na żywo w E0): wskaźnik slidingu jako dwie sztywne pigułki z przenikaniem bez obwódki i cienia czy wskaźnik o stałym rozmiarze; akordeon jako treść nad resztą czy skok wysokości z przesunięciem jednej warstwy; ptaszek checkboxa jako nazwany wyjątek rysowania czy `scale` + `opacity`; głębia na Windows: obrys zamiast cienia czy jeden styl; szary antyaliasing tekstu w warstwach (Q18); wciśnięcie przycisku: warstwa stała (decyzja 10.10 „`will-change: scale` stale, ikona nie skacze”; kosztuje pamięć GPU, wtedy B7 nie liczy przycisków albo dostaje osobny limit) czy warstwa tylko na czas ruchu (skok antyaliasingu na starcie i końcu).
- **N17. Formater kodu.** Lint robi ESLint (U34), ale TS, CSS i JSON nie mają formatera. Rekomendacja: Prettier tylko jako formater w hooku pre-commit, bez reguł lintu. Nie blokuje E2.
- **N16. Docs w stylu mangashift.com.** Jak i kiedy laboratorium dochodzi do wyglądu strony (U20), skoro migracja strony nie jest teraz potrzebna (U29); właściciel: „trzeba będzie to jakoś wymyślić”. Nie blokuje E0–E3.

Decyzje rozstrzygane pomiarem (właściciel tylko wtedy, gdy wynik zmienia wygląd):

- **N7.** Które prymitywy Base UI zostają, a które dostają własny kod. Kryteria w kolejności: parytet zachowań F15 (z menubarem), koszt montażu 200 tooltipów i menu na WebView2, przelot tooltipa tylko przez `transform`. (E0 dla przelotu, E2 dla komponentów przekroju, E4 dla menubara)
- **N8.** Stany: nakładka z animowaną `opacity` (start w E2, zgodna z Q2) czy krok rampy koloru, przez pomiar listy 500+ wierszy na scenie „stress”. (E3)
- **N9.** Next czy Vite dla strony dokumentacji, przez pomiar HMR. Rekomendacja: Next 16 (sprawdza RSC i static export); przy Vite dochodzi mała fixture Next. (E0)
- **N15.** Pole (`field`) jako wariant przepisu `control` (jak Primer) czy osobny przepis; rozstrzyga plan E2 na ekranie „Nakładki”. Osobny przepis zmienia U10 (szósty przepis), więc wtedy decyduje właściciel.
