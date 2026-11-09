---
kind: review
status: fail
reviewed-state: docs/plans/e2-foundation.md (runda 2, niezacommitowany), worktree .worktrees/e2, branch feat/e2-foundation @ 378bcee
date: 2026-10-31
---

# Review: plan E2 po poprawkach (runda kontrolna 2)

## Zakres

- przedmiot: `docs/plans/e2-foundation.md` w wersji po rundzie 1 i decyzjach właściciela z 31.10.
- baseline: working tree `.worktrees/e2`; kod paczki i laboratorium w stanie `378bcee`.
- authority: `docs/specification.md`, `structure.md`, `AGENTS.md`, `masterplan.md`, decyzje E0, `plans/e1-repo.md` („Przekazane do E2”), recenzje rundy 1, `research/e2-package-layout.md`. Decyzje właściciela 31.10 (silniki płasko, komponenty w folderach rodziny, CSS jako źródło poza kolorem, prefiks `--ts-`, tryby `spring`/`elastic`/`firm`/`off`, krok 8 E1 → E5, sonda ToggleGroup) przyjęte jako dane; sprawdzam tylko spójność wdrożenia.
- ryzyka: uwaga rundy 1 „rozstrzygnięta” tylko w tabeli, błąd w drzewie, nowe sprzeczności, decyzje zostawione wykonawcy, zmiany spec poza fazą 0.
- poza review: wartości wyglądu, wynik `bun run check` (nie uruchamiałem; plan podaje 277 testów, REPORTED), sieć.

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** wszystkie uwagi poważne rundy 1 mają w planie decyzję z mechanizmem, a sześć uwag jest domkniętych tylko częściowo. Poprawki wniosły jednak trzy nowe problemy poważne. (1) `ThemeScript` jako komponent serwerowy nie da się zbudować w obecnym kształcie paczki: hook i funkcje skryptu siedzą w jednym module, który musi dostać `'use client'`, React Compiler i kontrakt `use-client` wymuszą dyrektywę także na samym `ThemeScript`, a eksport `./lib/*` nie obejmuje plików `.tsx`. (2) Plan zakłada stan zacommitowany (kontrola „świeży klon”, worktree jednostek A–C), a jednocześnie zakazuje commitu bez słowa właściciela. Kontrola świeżego klonu sprawdzi więc baseline `378bcee` i przejdzie zawsze. (3) Trzy zmiany spec wynikające z decyzji planu nie trafiły do fazy 0: U9 (prefiks `--ts-`), Q4 (warstwa pigułki tylko na czas ruchu) i F4. Każda poprawka jest lokalna w planie i nie zmienia architektury.

## Rozstrzygnięcie uwag rundy 1

Etykiety: **tak** (rozstrzygnięte w treści planu), **częściowo**, **nie**.

| Uwaga                                               | Stan      | Miejsce w planie i komentarz                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| spec P1 (U32)                                       | tak       | D4; faza 0 dz. 1 (U32, wiersz „Formuła kształtu”); reuse `shape.test.ts` → `lab.spec.ts` (plan:84)                                                                                                                                                                                                                                                                                                                                                                                           |
| spec P2, tech M6 (bounce)                           | tak       | D6 [W]; algorytm (plan:272-278); `e0-motion.md` w fazie 0 dz. 2; checkpoint 2 przed recenzją z pytaniem o odbicie (plan:486)                                                                                                                                                                                                                                                                                                                                                                 |
| spec P3 (drugie źródło ruchu)                       | tak       | D7; test „lib bez literałów czasu”; F6 w fazie 0. Uwaga: patrz nowe M3                                                                                                                                                                                                                                                                                                                                                                                                                       |
| spec P4 (drabinki, W14)                             | tak       | D11, D12; kolor „bez drabinki stanów v7” (plan:80, 418); tabela `state` (plan:233)                                                                                                                                                                                                                                                                                                                                                                                                           |
| spec P5, tech M1 (koncentryczność)                  | tak       | D13 (R₁, R_N, c_N, `--ts-shape-inset` = odstęp + obrys, sentinel 9999px na `:root`, portal = głębokość 1); przepis `surface` czyta `--ts-shape-inset`                                                                                                                                                                                                                                                                                                                                        |
| spec P6 (Q14)                                       | częściowo | D16 + licznik w `lab.spec.ts`. Nie wiadomo, jak CSS rozpozna popup „pierwszego rzędu” w portalu (patrz nowe M4)                                                                                                                                                                                                                                                                                                                                                                              |
| spec P7 (F12)                                       | tak       | trasy `/components`, `/screens/overlays` (plan:290-295); test „docs + 2 strony” w `contracts.test.ts`                                                                                                                                                                                                                                                                                                                                                                                        |
| spec P8, tech P8 (próbki a lint)                    | tak       | D23 (jeden nazwany wyjątek, test zakresu). Zmiana U19/U20 bez wpisu w fazie 0 (patrz nowe P3)                                                                                                                                                                                                                                                                                                                                                                                                |
| spec P9 (świeży klon)                               | częściowo | D24 rozwiązuje kolejność bramek, ale kontrola z fazy 6 dz. 4 (`git clone` worktree) nie widzi niezacommitowanej pracy (patrz nowe P2)                                                                                                                                                                                                                                                                                                                                                        |
| spec P10 (krok 8 E1)                                | tak       | D25 [W]; faza 0 dz. 2 (masterplan, `e1-repo.md`)                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| spec P11, tech M10 (N8)                             | tak       | D11 (nakładka `::after`, przejście `opacity`); N8 w fazie 0                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| spec M1, tech P3 (strażnik `styles/`, `@font-face`) | tak       | faza 1 dz. 2 (deskryptory `@font-face`), dz. 4 (`@media (hover: hover)` z `bad/` do `good/`), dz. 5 (`tessera.css`, `tailwind.css`, importy fontsource z listy)                                                                                                                                                                                                                                                                                                                              |
| spec M2, tech M2 (przelot)                          | tak       | D18; `popup-flight.ts` stały; Tooltip bez `Viewport`; `SubmenuTrigger delay={0}` (D17)                                                                                                                                                                                                                                                                                                                                                                                                       |
| spec M3 (części bez przepisu)                       | tak       | dozwolone decyzje lokalne (plan:170); `row` `group-label`, `separator` w tabeli przepisów                                                                                                                                                                                                                                                                                                                                                                                                    |
| spec M4 (neon)                                      | tak       | in scope (plan:133); przepisy `control` i `focus` czytają `--ts-depth-glow`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| spec M5 (panel)                                     | tak       | D20, D21; rezultat użytkownika z `size` i `profile`; „zapis jako motyw” odłożony (plan:163)                                                                                                                                                                                                                                                                                                                                                                                                  |
| spec M6 (F3, F4)                                    | częściowo | F3 w fazie 0 dz. 1. Tabela końcowa podaje „F4: faza 0”, ale F4 nie ma ani w fazie 0 dz. 1 (plan:393), ani w drzewie (plan:310)                                                                                                                                                                                                                                                                                                                                                               |
| spec M7 (B7, Q4)                                    | częściowo | D8 zapisuje decyzję (`will-change` tylko na czas ruchu), ale to odwrócenie Q4 bez wpisu w fazie 0 (patrz nowe P3)                                                                                                                                                                                                                                                                                                                                                                            |
| spec M8, tech M3 (pomiar)                           | tak       | D10; lista plików w `contracts.test.ts`; Forbidden (plan:152). Definicja „pomiaru” niedookreślona (nowe M3)                                                                                                                                                                                                                                                                                                                                                                                  |
| spec M9, tech M9 (B4, FOUC)                         | tak       | D22 (hook DevTools); faza 3 dz. 4                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| spec M10 (nagranie, U24)                            | częściowo | nagranie w checkpoincie 2 (plan:481). Brak go w „Kontrakcie wyniku” (plan:559), nagranie pokazuje trzy tryby obok siebie, a nie „obok poprzedniej wersji” (U24), a miejsca na nagranie nie ma w drzewie (patrz „Drzewo”)                                                                                                                                                                                                                                                                     |
| spec M11 (F10, F15 poza zakresem)                   | tak       | Out of scope z etapami (plan:141-146)                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| spec M12 (spójność)                                 | częściowo | jednostka C w fazie 6 jest OK, a `structure.md` w fazie 0. Do poprawy: (a) „pozostałe 14 komponentów” (plan:37) i „F10 = 14 pozostałych” (plan:394); F10 ma 20 pozycji, E2 robi 7, więc zostaje 13; (b) „nazwy z v7 bez zmian” (plan:226) nie jest prawdą dla `scrim` (brak w v7) i statusów (v7 ma `success-container`, `danger-text`, `success-symbol`; `colors-v7-opus-a-tokens.js:129, 525-545`); (c) in scope mówi „AGENTS.md (faza 0 i 8)” (plan:137), a faza 0 dz. 1–4 go nie zmienia |
| spec M13, tech M10 (Q13, Q15, klawiatura)           | tak       | D22 (WebKit, interpretacja Q13: vitest na źródle, Playwright na `dist`); scenariusze klawiatury w fazie 6 dz. 3                                                                                                                                                                                                                                                                                                                                                                              |
| spec S1 (klucz zapisu)                              | tak       | D20 (`ts-appearance`, inna wersja ignorowana)                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| spec S2 (checkpoint ruchu)                          | tak       | checkpoint 2 przed fazą 7                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| tech P1 (squircle)                                  | tak       | D15 (usunięcie `@supports` przez CSSOM); `e0-concentric.md` w fazie 0                                                                                                                                                                                                                                                                                                                                                                                                                        |
| tech P2 (`dist`, B8)                                | tak       | faza 2 dz. 4 (`copy` z zachowaniem ścieżek, test importów w `dist`); B8 > 0 na `dist`                                                                                                                                                                                                                                                                                                                                                                                                        |
| tech P3                                             | tak       | jak spec M1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| tech P4 (liczby w przepisach)                       | tak       | faza 1 dz. 4; `--ts-focus-offset-inset`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| tech P5 (poddrzewo)                                 | tak       | D14; przypadek w fazie 3 dz. 4                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| tech P6 (`--color-*`)                               | tak       | D5 [W]; jedna forma warstwy (impact scan, plan:199)                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| tech P7 (dwa `scale`)                               | tak       | D8 (trzy elementy); scenariusz „wciśnij i jedź do ściany” w trace                                                                                                                                                                                                                                                                                                                                                                                                                            |
| tech M4 (`firm`)                                    | tak       | D6 (`clamp`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| tech M5 (zawrócenie)                                | tak       | D9                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| tech M7 (serwer)                                    | tak       | `tests/serve.ts`. Typy `Bun` nie wejdą do typechecku (patrz „Drzewo” i nowe M2)                                                                                                                                                                                                                                                                                                                                                                                                              |
| tech M8 (zmienne jako tekst)                        | tak       | D22                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| tech M11 (lista warunków)                           | tak       | „Silnik” (plan:213-214); faza 1 dz. 2                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| tech S1–S4                                          | tak       | D7; ryzyko squircle (plan:543); `suppressHydrationWarning`; fontsource `latin`/`latin-ext`                                                                                                                                                                                                                                                                                                                                                                                                   |

Razem: 0 nierozstrzygniętych, 6 częściowo (spec P6, P9, M6, M7, M10, M12), reszta rozstrzygnięta w treści planu.

Poza ID rundy 1, z `plans/e1-repo.md:45-49` („Przekazane do E2”) nadal otwarte są dwa punkty: „`--in-*` przypisane do silnika” (plan mówi tylko „wejścia `--ts-in-*`”, a `owns()` w `css-layers.ts:176-178` przyznaje każde `--in-*` każdemu silnikowi) i „jedna lista właściwości układu albo nazwana różnica między regułą aplikacji a strażnikiem komponentu”. Patrz nowe M6.

## Drzewo

Sprawdziłem pozycja po pozycji wobec repo, strażnika, `exports`, `tsdown`, Next app router i `e2-package-layout.md`.

**Zgodne:** dziewięć płaskich `engines/<silnik>.css` (D2, R1 z `e2-package-layout.md:213`); `components/<rodzina>/<nazwa>.tsx` (D3; `checkFor` dla `components` nie zależy od głębokości, `css-layers.ts:216`); `scripts/` w paczce poza `src` (konsensus 8, `e2-package-layout.md:111`; `tsdown` bierze tylko `src/**`, `tsdown.config.ts:6`); `tsconfig.json` MODIFY dla `scripts`; `styles/tessera.css` i `styles/tailwind.css`; trasy app router `/`, `/foundation`, `/components`, `/screens/overlays` (każda z `page.tsx`); `app/panel.tsx` nie jest trasą; `apps/docs/tests/` i `playwright.config.ts` poza `app/` (wzorzec Radix Themes); `docs/session-logs/`, `research/inspiration.md`, `e2-prior-art.md`, `e2-package-layout.md` istnieją; fixture strażnika do przeniesienia z folderów na pliki (`fixtures/good/engines/shape/shape.css`, `bad/engines/{color,neon,shape}/`). `copy` w `tsdown` 0.23.4 ma domyślnie `flatten: true` (`node_modules/tsdown/dist/types-Bmc8V7el.d.mts:21-25`). Plan każe zachować ścieżki, więc jest OK, ale bez `flatten: false` `engines/focus.css` i `recipes/focus.css` nadpisałyby się w jednym katalogu (patrz sugestia S1).

**Błędy:**

01. **`packages/tessera/package.json`: eksport `./lib/*` nie obejmuje `lib/theme-script.tsx`.** Dowód: `package.json:9-13` (`"source": "./src/lib/*.ts"`). Typecheck idzie przed buildem (D24), więc na świeżym klonie TypeScript nie znajdzie ani `src/lib/theme-script.ts`, ani `dist/lib/theme-script.d.ts`. `package.test.ts:25-29` rozwija wzorzec po sufiksie `source`, więc tego nie złapie. Szczegóły w nowym P1.
02. **`packages/tessera/package.json`: kształt `./components/*` dla folderów rodziny nie jest zapisany.** `e2-package-layout.md:218` ostrzega, że folder wymusza albo `index.ts`, albo wzorzec z kilkoma `*`. Plan podaje tylko „exports ./components/\*” (plan:197, 324). Patrz nowe M1.
03. **Brak `apps/docs/tsconfig.json` (MODIFY) i typów Bun.** `tests/serve.ts` używa `Bun.serve` (plan:383), a `apps/docs/tsconfig.json:4` ma `"types": ["node"]` i `include: ["**/*.ts"]` (`:7`). Typecheck laboratorium obleje. Faza 0 dz. 4 nie dodaje `@types/bun`; prościej `node:http`. Patrz nowe M2.
04. **Brak `.gitignore` (MODIFY).** Playwright pisze `test-results/` (i `playwright-report/` przy reporterze HTML) obok konfiguracji, a `.gitignore` tych katalogów nie zna (grep: brak dopasowań). Nagrania `.webm` są ignorowane (`.gitignore:193`).
05. **Brak miejsca na nagranie ruchu.** Checkpoint 2 wskazuje `docs/reviews/e2-motion/` (plan:481), a drzewo go nie ma. `.webm` i tak nie trafi do gita (`.gitignore:193`). Trzeba zapisać, że nagranie jest lokalne (ścieżka poza gitem), albo dodać wyjątek.
06. **`docs/specification.md` MODIFY: lista zmian jest niepełna.** Brakuje U9 (prefiks D5), Q4 (D8), F4 (tabela uwag, plan:583) i U19/U20 (wyjątek D23). Patrz nowe P3.
07. **`docs/research/e2-facts-*` oznaczone CREATE, a faza 8 je usuwa** (plan:318 wobec plan:498). Stan końcowy to DELETE w fazie 8.
08. **`docs/structure.md`: „to drzewo” nie obejmuje reguł wzrostu.** `structure.md:88` („Nowy silnik = nowy folder”), `:61-62` (`components/<nazwa>/`) i `:45` (projekt przeglądarkowy vitest) też się zmieniają.
09. **`lib/theme.ts` jako jeden plik koliduje z komponentem serwerowym** (hook i funkcje skryptu w jednym module z `'use client'`). Patrz nowe P1.
10. Drobne: brak `docs/reviews/e2-plan-round-2.md` (CREATE). `test/guards/contracts.test.ts` sprawdza `dist` (B8), choć według `structure.md:69` i `AGENTS.md:56` kontrakt zbudowanej paczki mieszka w `test/package/`. `app/panel.tsx` odbiega od konwencji `_lab/` z `e2-package-layout.md:177, 208`; obie formy działają w app router.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. `ThemeScript` jako komponent serwerowy nie zbuduje się w obecnym kształcie paczki

- miejsce: „Kaskada motywu” (plan:286), impact scan (plan:203), drzewo `lib/theme.ts`, `lib/theme-script.tsx` (plan:351-352), eksporty (plan:197).
- dowód:
  - DIRECT: `use-client.test.ts:80-88, 101-103` wymaga `'use client'` dokładnie w modułach `dist`, które wołają hook albo importują `react/compiler-runtime`. Fixture `label.tsx` (czysty komponent bez hooków) jest oznaczony jako wymagający dyrektywy, bo React Compiler dodaje import runtime (`:23, 106, 109-112`). `tsdown.config.ts:18` kompiluje każdy plik paczki React Compilerem.
  - DIRECT: `lib/theme.ts` ma `useTheme()` na `useSyncExternalStore` oraz „ciąg skryptu anty-FOUC (serializacja tych samych funkcji)” (plan:286), z którego korzysta `ThemeScript`.
  - DIRECT: `package.json:9-13`, eksport `./lib/*` ma `source` `./src/lib/*.ts`.
  - REPORTED (wiedza o Next RSC): funkcji z modułu `'use client'` nie da się wywołać w komponencie serwerowym, bo serwer dostaje referencję klienta. ASSUMED: React Compiler zmemoizuje `ThemeScript` (JSX zależny od propsa `theme`), więc dostanie import `react/compiler-runtime`.
- wpływ: wykonawca jednostki B trafi na trzy sprzeczne wymagania (komponent serwerowy, kontrakt `use-client`, jeden moduł z hookiem) i musi sam wybrać podział modułów, dyrektywę `'use no memo'` albo wyjątek w teście. Do tego `bun run check` na świeżym klonie obleje typecheck laboratorium, które importuje `@mattymroz/tessera/lib/theme-script`.
- minimalna reakcja: w planie rozdzielić `lib/theme.ts` (czyste funkcje: osie, `resolve`, storage, `apply`, ciąg skryptu; bez dyrektywy) od hooka (np. `lib/use-theme.ts`, `'use client'`). Dla `ThemeScript` zdecydować: `'use no memo'` albo plik `.ts` z `createElement`, a jeśli zostaje `.tsx`, poprawić wzorzec eksportu. Dopisać to do drzewa i do `test/package/` (przypadek: moduł serwerowy bez dyrektywy).

#### P2. Plan zakłada stan zacommitowany, a commit wymaga słowa właściciela

- miejsce: faza 6 dz. 4 (`git clone` worktree do katalogu tymczasowego, plan:473), warunek końcowy (plan:32), „Dodatkowi wykonawcy”: worktree `.worktrees/e2-color`, `e2-theme`, `e2-tests` (plan:504-506); Forbidden „commit i push bez słowa właściciela” (plan:156); faza 8 (plan:498).
- dowód: DIRECT. Branch `feat/e2-foundation` stoi na `378bcee`, a cała praca E2 zostaje niezacommitowana do fazy 8. `git clone` i `git worktree add` biorą tylko commity. Jednostka A ma w write scope `contracts.test.ts`, który powstaje w fazie 1, a jednostka C pisze testy zachowań komponentów i ekranu z fazy 6. Żadnego z tych plików nie będzie w worktree utworzonym z `378bcee`.
- wpływ: kontrola świeżego klonu (jedyna dla S7 i spec P9) sprawdzi baseline E1 i przejdzie bez względu na E2, czyli jest rytuałem. Jednostki A–C nie mają na czym pracować, a integracja ich wyniku wymaga commitów albo łatek.
- minimalna reakcja: rozstrzygnąć w planie jedno z dwóch. (a) Commity na branchu `feat/e2-foundation` w punktach kontrolnych za jedną zgodą właściciela udzieloną przed fazą 1 (push dalej osobno). (b) Bez commitów: kontrola „świeży klon” jako kopia drzewa roboczego bez `node_modules`, `dist`, `.next` i `out` do katalogu tymczasowego, a jednostki A–C w tym samym worktree z rozłącznymi plikami (C we własnym pliku spec zamiast sekcji `lab.spec.ts`).

#### P3. Trzy zmiany spec z decyzji planu nie weszły do fazy 0

- miejsce: faza 0 dz. 1 (plan:393), drzewo `specification.md` (plan:310), D5, D8, tabela uwag (plan:583).
- dowód:
  - D5 (prefiks `--ts-`, wejścia `--ts-in-*`) zmienia publiczne API zapisane w U9 („wyjścia `--<silnik>-<rola>`”, wejścia `--in-*`, spec:52). Tego samego dotyczy `AGENTS.md:34-35`. U9 nie ma na liście fazy 0.
  - D8 (`will-change` tylko na czas ruchu) odwraca Q4 (spec:160): „wskaźnik slidingu, popup w przelocie […] są warstwą przez cały czas życia”. To dokładnie ten kompromis, który N5 (spec:282) zostawia właścicielowi dla wciśnięcia przycisku, z kosztem „skok antyaliasingu na starcie i końcu”. Q4 nie ma na liście fazy 0.
  - Tabela uwag rozstrzyga spec M6 zdaniem „F4: faza 0; warstwy tylko dla overlay, modal, tooltip” (plan:583), a faza 0 i drzewo wymieniają tylko F3.
  - Mniejszej wagi: D23 (styl inline w laboratorium) odstępuje od U19/U20 („bez własnego CSS”), a D22 przyjmuje interpretację Q13 bez wpisu w spec.
- wpływ: spec przestaje być jedynym źródłem decyzji (AGENTS.md:64). Recenzent fazy 7 zgłosi konflikt kodu ze spec. Pigułka bez stałej warstwy to zmiana wyglądu, o której spec mówi, że decyduje właściciel.
- minimalna reakcja: dopisać U9, Q4, F4 (oraz jednym zdaniem U19/U20 i Q13) do fazy 0 dz. 1 i do drzewa. Dla Q4 oznaczyć zmianę jako decyzję do potwierdzenia przez właściciela albo wrócić do stałej warstwy pigułki z budżetem B7 (wtedy panel nie może mnożyć ToggleGroup).

### Mniejsze

#### M1. Eksport komponentów w folderach rodziny nie jest zapisany

- dowód: D3; plan:197, 324; `e2-package-layout.md:218`. `package.test.ts:25-34` zastępuje tylko pierwszą `*`, więc działa dla wzorca `./components/*` → `./src/components/*.tsx` / `./dist/components/*.js` (adres `@mattymroz/tessera/components/button/button`, jak w MangaShift `@mangashift/ui/src/button/button`). Nie zadziała dla wariantu z kilkoma `*` ani dla `index.ts`.
- minimalna reakcja: jedno zdanie w impact scan z dokładnym kształtem wpisu `exports` i adresem importu.

#### M2. `tests/serve.ts` obleje typecheck laboratorium

- dowód: „Drzewo”, punkt 3.
- minimalna reakcja: serwer na `node:http` (bez nowej zależności) albo `@types/bun` w fazie 0 i `types` w `apps/docs/tsconfig.json`.

#### M3. Odczyt parametrów ruchu i lista plików pomiaru są niedookreślone

- dowód: D7 („`lib/` czyta je raz po każdej zmianie motywu z wyliczonego stylu `<html>`”); pseudokod przypisuje odczyt `lib/indicator.ts` (plan:265), ale `lib/press.ts` (minimum `duration-fast`, plan:280) i `lib/popup-flight.ts` też potrzebują czasów. Forbidden i `contracts.test.ts` (plan:152, 366) liczą „pomiar DOM” tylko w `indicator.ts` i `popup-flight.ts`, bez definicji, czy `getComputedStyle` się w nim mieści. Test „lib bez literałów czasu” zderzy się z krokiem próbkowania klatek sprężyny (~16 ms, `e2-prior-art.md:105`).
- minimalna reakcja: nazwać jeden moduł odczytu parametrów ruchu (i dodać go do listy Q7 albo jawnie z niej wyłączyć), zdefiniować, co test uznaje za pomiar, i dopisać wyjątek „krok próbkowania” do testu literałów czasu albo liczyć klatki z `duration-*`.

#### M4. „Pierwszy rząd” materiału nie ma mechanizmu

- dowód: D16 („translucent tylko na powierzchniach `overlay` i `modal` pierwszego rzędu”). Według D13 każdy popup w portalu ma głębokość 1, a zagnieżdżony portal Base UI jest dzieckiem węzła portalu rodzica, nie popupu (`e2-plan-tech.md` M1). Atrybut ani selektor, który odróżni popover od menu w nim, nie jest nazwany. Tło dialogu (`Backdrop`) nie ma ustalonego materiału; z blurem ekran „Dialog + Menu” ma 3 `backdrop-filter`.
- minimalna reakcja: nazwać mechanizm (np. komponent ustawia `data-material="solid"` na popupie otwartym z innego popupu, albo selektor po zagnieżdżonym węźle portalu) i zapisać, że `Backdrop` jest bez blura.

#### M5. Kolejność faz łamie gate fazy 0

- dowód: faza 0 dz. 3 dodaje `test:browser` do `check`, a gate fazy 0 to zielone `bun run check` (plan:398). `playwright.config.ts` i `lab.spec.ts` powstają dopiero w fazie 3 (plan:432). Playwright bez testów kończy się kodem 1 („No tests found”; REPORTED). Zmiana `eslint.config.js` (wtyczka konsumenta, wyjątek D23) nie jest przypisana do żadnej fazy, a AGENTS.md (kolejność bramek, „cztery kroki”, `engines/<silnik>/`, `--<silnik>-<rola>`, `AGENTS.md:8, 15, 34-36`) zmienia się dopiero w fazie 8, więc przez fazy 1–7 przeczy planowi.
- minimalna reakcja: `test:browser` w `check` od fazy 3 (albo `--pass-with-no-tests` do tego czasu), `eslint.config.js` w fazie 0 albo 3, model warstw w `AGENTS.md` w fazie 0.

#### M6. Dwa punkty „Przekazane do E2” z E1 nadal otwarte

- dowód: `plans/e1-repo.md:47-49`. „`--in-*` przypisane do silnika”: `owns()` (`css-layers.ts:176-178`) przyznaje każde wejście każdemu silnikowi, a plan zmienia tylko prefiks. „Jedna lista właściwości układu albo nazwana różnica”: nie ma tego w fazie 1.
- minimalna reakcja: dopisać oba punkty do fazy 1 albo jawnie odłożyć z powodem.

#### M7. Liczby i nazwy z M12 rundy 1

- dowód: tabela uwag, wiersz spec M12: 13, nie 14 (F10, spec:140), oraz `scrim` i statusy spoza v7.
- minimalna reakcja: poprawić liczbę w celu, nie-celu i fazie 0. Przy `scrim` i statusach napisać „nazwy z v7, poza …”.

### Sugestie

- **S1.** W fazie 2 dz. 4 napisać wprost `flatten: false`, bo domyślne `flatten: true` w `tsdown` 0.23.4 cicho nadpisze `focus.css` silnika przepisem.
- **S2.** Testy `lib/theme.test.ts` i `lib/input-modality.test.ts` biegną w projekcie `unit` ze środowiskiem `node` (`vitest.config.ts:6`), bez `document`, `localStorage` ani `matchMedia`. Warto zapisać: atrapy w teście, bez `jsdom` (nowa zależność).
- **S3.** Checkpoint 2 pyta „który tryb ruchu domyślny”, choć D6 [W] już wybrało `spring`. Wystarczy pytanie „czy `spring` zostaje domyślny”.
- **S4.** Gdy sonda D17 wybierze własny kod ToggleGroup, roving focus nie ma pliku w drzewie (`e2-package-layout.md` proponował `lib/roving-focus.ts`). Jedno zdanie: w `toggle-group.tsx` albo osobny plik.

## Wykonane kontrole

```text
odczyt w całości: plan, e2-plan-spec.md, e2-plan-tech.md, specification.md, structure.md, AGENTS.md, masterplan.md,
  e2-package-layout.md, e2-prior-art.md, e0-concentric.md, e0-motion.md (część decyzji), e1-repo.md (kroki, Przekazane do E2)
odczyt kodu: packages/tessera/{package.json, tsconfig.json, tsdown.config.ts, vitest.config.ts}, test/guards/css-layers.ts,
  listing fixtures, test/package/{helpers,package.test,use-client.test,side-effects.test}.ts, src/styles/tessera.css,
  korzeniowe package.json, eslint.config.js, vitest.config.ts, tsconfig.base.json, .pre-commit-config.yaml (hooki),
  .gitignore (dist, out, .next, *.webm; brak test-results), apps/docs/{package.json, next.config.ts, tsconfig.json, app/*}
tsdown 0.23.4: CopyEntry.flatten domyślnie true (dist/types-Bmc8V7el.d.mts:21-25, watch-*.mjs:42-46)
v7: grep ról w MangaShift docs/plans/ui-kit/prototypes/colors-v7-opus-a-tokens.js (scrim: 0 trafień; statusy jako *-container, *-text, *-symbol)
F10: policzone 20 pozycji (spec:140)
```

## Niewykonane lub nierozstrzygające kontrole

- `bun run check`, `next build`, Playwright: nie uruchamiałem (recenzja dokumentu, O1).
- Memoizacja `ThemeScript` przez React Compiler i zachowanie RSC przy imporcie z modułu `'use client'`: wniosek z kontraktu `use-client.test.ts` i wiedzy o Next, bez budowania (P1, ASSUMED/REPORTED).
- Kod wyjścia Playwrighta bez testów: wiedza o narzędziu, bez uruchomienia (M5).

## Ograniczenia review

- Decyzje właściciela 31.10 znam z briefu i oznaczeń [W] w planie.
- Wagi P1–P3 to osąd recenzenta; finalną klasyfikację robi prowadzący.

## Zalecany następny krok

Poprawić w planie P1 (podział `lib/theme`, `ThemeScript`, eksport `.tsx`), P2 (sposób commitów albo kopii dla świeżego klonu i jednostek A–C) i P3 (U9, Q4, F4 w fazie 0; Q4 do potwierdzenia przez właściciela), a przy okazji M1–M7 i błędy drzewa 3–8. Potem krótka runda 3 tylko dla zmienionych akapitów.
