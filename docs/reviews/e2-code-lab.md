---
kind: review
status: fail
reviewed-state: feat/e2-foundation @ 378bcee + niezacommitowany working tree (.worktrees/e2), stan z 31.10 po fazie 6
date: 2026-10-31
---

# Review: E2, laboratorium, kontrakt paczki, testy przeglądarkowe, dokumenty

## Zakres

- przedmiot: `apps/docs/**`, `packages/tessera/package.json`, `packages/tessera/test/package/**`, `packages/tessera/docs/*.md`, korzeniowe `package.json`, `eslint.config.js`, `.pre-commit-config.yaml`, `.gitignore`, `AGENTS.md`, `docs/structure.md`, `docs/specification.md`, `docs/plans/{masterplan,e2-foundation,e1-repo}.md`, `docs/decisions/*`.
- baseline: `378bcee`; ocena finalnych plików w working tree.
- authority: spec (U14–U21, U30, U31, F1, F11, F12, Q13–Q17, B1, B4, B7), plan E2 („Docelowe drzewo”, „Laboratorium”, fazy 3, 4 i 6, „Strategia dowodu”), `AGENTS.md`, `research/e2-package-layout.md`.
- ryzyka: testy, które przechodzą niezależnie od wyniku; laboratorium pokazujące co innego niż paczka; dryf dokumentów; bramka `check` nie do powtórzenia poza tą maszyną.
- poza review: poprawność silników, przepisów i `lib/` jako takich (recenzenci 1 i 2); wygląd (checkpointy właściciela).

## Werdykt

**Status:** FAIL (4 poważne, 0 krytycznych).

**Najważniejszy powód:** piętro przepisów nie ma w laboratorium ani strony, ani testu wartości: `lab.spec.ts` mierzy kopię formuł przepisów wpisaną stylem inline w `/foundation`, która już rozjechała się z przepisem `control`. Do tego test B4 patrzy na stronę bez żadnego komponentu Tessery, a `bun run check` wymaga przeglądarek Playwrighta, których CI ani instrukcja świeżego klonu nie instalują.

## Findings

### Krytyczne

Brak.

### Poważne

#### P1. Przepisy bez strony i bez testu; testy wartości mierzą kopię przepisu w stylu inline

- miejsce: `apps/docs/app/foundation/page.tsx:47-100` (obiekty `control`, `surface`), `:129`, `:210`, `:234`; `apps/docs/tests/lab.spec.ts:143-203`; `packages/tessera/src/recipes/control.css:17`; `apps/docs/css-properties.d.ts:1-7`.
- dowód (DIRECT): `/foundation` nie ma ani jednego `data-recipe` (grep: 0 w `foundation/*.tsx`). Próbki kontrolki i powierzchni to style inline, które przepisują formuły przepisów: `borderRadius: 'min(var(--ts-shape-control), var(--ts-shape-inner))'`, `padding: 'calc(var(--ts-shape-inset) - var(--ts-shape-stroke))'`. Na tych próbkach (`size-*`, `surface-*`, `control-*`, `surface-depth-*`) stoją wszystkie testy wysokości, promienia, squircle, zagnieżdżonego rozmiaru i koncentryczności. Kopia już się rozjechała: próbka ma `paddingInline: var(--ts-shape-control-side)` przy ramce 1 px, a przepis `calc(var(--_side-start) - var(--ts-shape-stroke))`, więc próbka jest o 2 × `stroke` szersza od prawdziwej kontrolki. Brakuje testów z fazy 4 planu: padding kontrolki identyczny poza powierzchnią i w niej (W4) oraz promień kontrolki w powierzchniach 1–3 na przepisie (grep `padding` w `apps/docs/tests`: 0). `css-properties.d.ts` istnieje tylko po to, żeby kopia mogła pisać `cornerShape` inline.
- wpływ: zmiana albo błąd w `recipes/control.css` czy `recipes/surface.css` (promień, padding, `corner-shape`) nie oblewa żadnego testu przeglądarkowego; „wartości silników na prawdziwych właściwościach” ze Strategii dowodu sprawdzają formułę napisaną w laboratorium, nie tę z paczki. U21 („laboratorium pokazuje każde piętro”) i F1/plan („/foundation … gołe przepisy”) nie są spełnione. Właściciel na checkpoincie 1 ocenia proporcje próbki, której nie ma w paczce.
- minimalna reakcja: sekcja przepisów na `/foundation` z prawdziwymi `data-recipe="control"`/`"surface"` (wariant × rozmiar × poziom, w kartach i popupie). Testy wysokości, promienia, squircle, koncentryczności i W4 przenieść na te elementy. Próbki inline zostawić tylko dla wyjść silników, których nie da się pokazać przepisem (kolory, cienie, czasy), i usunąć kopie formuł oraz `css-properties.d.ts`, jeśli przestanie być potrzebny.

#### P2. Test B4 nie może wykryć re-renderu komponentu przy zmianie motywu

- miejsce: `apps/docs/tests/lab.spec.ts:237-249`; `apps/docs/app/foundation/page.tsx:1-3`.
- dowód (DIRECT): test działa na `/foundation`, gdzie poza panelem nie ma żadnego komponentu Tessery (importy strony: tylko `LiveValues` i `MotionSample`, oba bez motywu w stanie React). Panel jest z założenia wyłączony (`render !== 'panel'`). Sonda fiberów jest poprawna, ale nie ma czego obserwować: Button, Menu, ToggleGroup i Tooltip na stronie nigdy nie biorą udziału w pomiarze.
- wpływ: B4 („re-rendery komponentów przy zmianie motywu = 0”) jest twardym budżetem; komponent subskrybujący motyw (np. hook na `useSyncExternalStore` w `useIndicator`) przejdzie ten test. W E3 dochodzi 13 komponentów, a dowód B4 nie obejmuje żadnego.
- minimalna reakcja: ten sam test na `/components` albo `/screens/overlays` (lub na obu), z warunkiem wstępnym, że przed zmianą osi zarejestrowano commity komponentów strony.

#### P3. Playwright w `check` i pre-push, ale bez instalacji przeglądarek w CI i na świeżym klonie; dokumenty opisują cztery kroki

- miejsce: `package.json:20`, `.pre-commit-config.yaml:138-143`, `.github/workflows/ci.yml:34-39` (komentarz `:37`), `AGENTS.md:8`, `:15`, `:75`.
- dowód (DIRECT): `check` kończy się `bun run --filter @mattymroz/tessera-docs test:browser`. CI robi `bun install --frozen-lockfile` i od razu `bun run check`, bez `bunx playwright install --with-deps chromium webkit`. `AGENTS.md:8` opisuje `check` jako typecheck → build → eslint → vitest, `:15` mówi o „tych samych czterech krokach” w pre-push (jest pięć), instrukcja po klonie (`:15`) i pułapki (`:75`) nie wspominają o instalacji przeglądarek. Komentarz w `ci.yml:37` też wylicza cztery bramki. Plan nie miał `ci.yml` w „Docelowym drzewie”, więc luka jest już w planie.
- wpływ: CI po uruchomieniu runnera będzie czerwone na każdym pushu (S7, warunek „CI zielone”); kontrola świeżego klonu z fazy 6 przechodzi tylko dlatego, że przeglądarki leżą w profilu użytkownika tej maszyny. Agent czytający `AGENTS.md` nie wie, że `check` uruchamia Playwrighta.
- minimalna reakcja: krok instalacji przeglądarek w `ci.yml` (przed `bun run check`) z poprawionym komentarzem; w `AGENTS.md` piąty krok w opisie `check` i pre-push oraz `bunx playwright install chromium webkit` w instrukcji po klonie.

#### P4. Dokument laboratorium nie ma wyglądu z Tessery (tło, kolor tekstu, font, nagłówki, linki)

- miejsce: `apps/docs/app/layout.tsx:19-29`, `apps/docs/app/globals.css:1-3`, `packages/tessera/src/styles/tessera.css:1`, `packages/tessera/src/lib/theme.ts:88`, `apps/docs/app/page.tsx:6`, `apps/docs/app/screens/overlays/page.tsx:158`, `apps/docs/app/foundation/motion-sample.tsx:34`.
- dowód (DIRECT, odczyt kodu; nieoglądane w przeglądarce): żaden plik paczki nie stylizuje `html`/`body`, a warstwa `base` jest zadeklarowana w `tessera.css:1` i pusta. Tło strony to więc płótno przeglądarki: białe w jasnym i ciemne płótno UA w ciemnym (`applyChoices` ustawia tylko `color-scheme`), a nie `--ts-color-background`. Font nawigacji, nagłówków `<h1>`/`<h2>`, etykiet panelu i `<dl>` pochodzi z preflightu Tailwinda (systemowy sans), nie z `--ts-type-family-sans`. Przycisk „Move” w `motion-sample.tsx` to goły `<button>`, nie `Button` Tessery.
- wpływ: U19 („zbudowana wyłącznie z Tessery”) nie jest spełnione. Checkpoint 1 każe ocenić „ciemny nie jaśniejszy niż #101012, jasny mleczny”, a największa powierzchnia ekranu ma kolor przeglądarki. Na `/screens/overlays` wyspa (`--ts-depth-base-bg`) leży na obcym tle, więc ocena głębi i kontrastu jest zafałszowana.
- minimalna reakcja: decyzja projektowa prowadzącego (route DESIGN), gdzie mieszka wygląd dokumentu: reguła w `@layer base` paczki (tło, kolor etykiety, font i rozmiar body z silników) albo wariant przepisu `surface` dla strony. Do tego `Button` w `MotionSample`. Nagłówki i linki laboratorium dostają typografię z tej samej reguły do czasu komponentów E3.

### Mniejsze

#### M1. Drugi wyjątek lintu poza U19/D23; brak testu „wyjątek obejmuje dokładnie jeden plik”

- miejsce: `eslint.config.js:23-36`.
- dowód: obok wyjątku D23 (`lab/foundation-draws-engine-outputs-inline`: jeden plik, jedna reguła, poprawnie wąski) jest `lab/first-frame-probe`: `compositor-motion` z opcją `animationFrameReason` dla `apps/docs/tests/lab.spec.ts`. Spec U19 mówi o „jedynym wyjątku”. Planowany test D23 nie istnieje (grep `eslint.config` w testach: 0).
- wpływ: wyjątek jest wąski i ma powód, ale nie ma go w spec, w planie ani pod strażnikiem; następny wyjątek może się dopisać bez śladu.
- minimalna reakcja: zapisać drugi wyjątek w spec/planie (powód: sonda pierwszej klatki) i dodać test, który czyta `eslint.config.js` i sprawdza listę wyjątków (pliki i reguły).

#### M2. Strażnicy obiecani w `structure.md` i planie, których nie ma

- miejsce: `docs/structure.md:89-90`; plan, wiersz `contracts.test.ts` w „Docelowym drzewie”; `packages/tessera/test/guards/contracts.test.ts` (całość).
- dowód: brak „testu pokrycia” (komponent ma `docs/<nazwa>.md` i występuje w ≥ 2 stronach, F12) i testu „klucze motywu ⊂ osie”. Ten drugi pilnuje typ `Theme` w `themes/mangashift.ts` (typecheck), co wystarcza, ale `structure.md` nazywa to testem.
- wpływ: dziś F12 jest spełnione (7 komponentów na `/components` i `/screens/overlays`, `docs/*.md` dla każdego), ale w E3 nic tego nie pilnuje, a `structure.md` twierdzi, że każda reguła ma strażnika.
- minimalna reakcja: test pokrycia w `contracts.test.ts` (pliki `src/components/*/*.tsx` ↔ `docs/*.md` ↔ importy w `apps/docs/app/**`); w `structure.md` przy motywach wpisać „typ `Theme` (typecheck)”.

#### M3. Drzewo odbiega od planu i `structure.md`

- miejsce: `apps/docs/tests/components-b.spec.ts`, `components-c.spec.ts`, `helpers.ts`, `apps/docs/app/components/sections/*.tsx`, `app/foundation/live-values.tsx`, `motion-sample.tsx`, `apps/docs/css-properties.d.ts`, `packages/tessera/src/components/toggle-group/toggle-group.css`; `docs/structure.md:9`, `:74`; plan `:395-398`.
- dowód: plan i `structure.md` przewidują w `tests/` tylko `lab.spec.ts` i `serve.ts`. Nazwy `components-b`/`components-c` pochodzą od jednostek wykonawców, nie od treści. `structure.md:9` nadal mówi, że pozycje `(E2+)` „jeszcze nie istnieją”.
- wpływ: następny wykonawca nie wie, gdzie dopisać test; dokument drzewa kłamie.
- minimalna reakcja: nazwy plików według treści (np. `toggle-group.spec.ts`, `tooltip.spec.ts`, `menu.spec.ts` albo jeden `components.spec.ts`), `structure.md` z `helpers.ts`, `sections/` i plikiem CSS komponentu; zdjąć oznaczenia `(E2+)` przy zamknięciu E2.

#### M4. Dwa rejestratory animacji; rejestrator ignoruje klatki w formie obiektu

- miejsce: `apps/docs/tests/helpers.ts:45-64` (`:57`), `apps/docs/tests/components-b.spec.ts:7-30`.
- dowód: `components-b` ma własne opakowanie `Element.prototype.animate` i własne `animatedProperties`, a `helpers.ts` ma `recordAnimations`. W `helpers.ts:57` klatki inne niż tablica dają pustą listę właściwości, więc `animate({ width: [...] })` przejdzie `offCompositor` bez śladu. Dziś `lib/` używa tylko tablic, a reguła ESLint `compositor-motion` łapie formę obiektu, więc to brak w drugiej linii obrony, nie aktywny fałszywy wynik.
- wpływ: duplikacja wiedzy o tym, jak mierzyć ruch; furtka w jednym z dwóch strażników B1.
- minimalna reakcja: jeden rejestrator w `helpers.ts` obsługujący obie formy klatek (`Object.keys` obiektu indeksowanego), używany przez wszystkie speki.

#### M5. Stały sen zamiast odpytywania przy pomiarze pozycji

- miejsce: `apps/docs/tests/components-b.spec.ts:108-110`; razem 7 × `waitForTimeout(600)` w spekach.
- dowód: „moves the choice with the arrow keys” czeka 600 ms i mierzy pigułkę raz; ten sam przypadek w `lab.spec.ts:339` używa `expect.poll`. Pozostałe sny poprzedzają zatrzymanie trace i są uzasadnione.
- wpływ: na obciążonej maszynie (O1, kilka sesji naraz) pomiar może trafić przed końcem ruchu.
- minimalna reakcja: `expect.poll` jak w `lab.spec.ts`.

#### M6. Q14 sprawdzane tylko jako liczba; dialog animuje `scale` z blur 24 px

- miejsce: `packages/tessera/src/recipes/surface.css:81-87`, `:102-123`; `packages/tessera/src/engines/depth.css:42-46`; `apps/docs/tests/lab.spec.ts:306-318`, `:262-304`; plan D16.
- dowód: przy `material: translucent` popup dialogu ma `backdrop-filter: blur(24px)` i wejście `opacity` + `scale` przez 250 ms. Q14: „na elementach ruchomych ≤ 10 px”. Test Q14 liczy tylko elementy z blur (≤ 2); trace B1 nie otwiera dialogu, jedynego popupu z animacją wejścia.
- wpływ: możliwe naruszenie Q14 bez sygnału z testów; D16 dał blur dialogowi, nie odnosząc się do jego ruchu.
- minimalna reakcja: decyzja prowadzącego (route DESIGN/REQUIREMENT): czy dialog przy wejściu jest „ruchomy” w sensie Q14. Jeśli tak, mniejszy blur albo `solid` dla dialogu. Niezależnie od tego otwarcie dialogu w trace B1 i asercja promienia blur na animowanych elementach.

#### M7. Dryf dokumentów

- `docs/decisions/e0-motion.md:11`: „`elastic` (bouncy, domyślny)”, a `:13` i spec W20 mówią, że domyślny jest `spring`.
- `docs/plans/masterplan.md:24-28`: „pozostaje niepewne: promień koncentryczny w 3 poziomach” mimo E0 (b) accepted; stan nie wspomina zaakceptowanego E1.
- `docs/decisions/e2-base-ui.md:13`, `:157`: zmiana U18 na `RadioGroup` „wymaga zgody właściciela / do akceptacji”, a spec `:65` podaje ją jako ustalenie [W, 31.10]. Albo dopisać datę zgody w decyzji, albo oznaczyć ustalenie w spec jako oczekujące.
- `.github/workflows/ci.yml:37`: komentarz z czterema bramkami (zob. P3).
- minimalna reakcja: poprawić te zdania przy fazie 8.

#### M8. Ekran „Nakładki” bez kontrolki „na stronie”; F11 bez trybu ciemnego i skrajnych kształtów w testach

- miejsce: `apps/docs/app/screens/overlays/page.tsx:159-182`; plan `:20`; spec F11 (`specification.md:141`).
- dowód: każdy zestaw kontrolek leży w wyspie albo karcie (`data-surface`), więc na tym ekranie nie da się porównać kontrolki poza powierzchnią z kontrolką w popupie (sedno W4 i wyjścia z E2 w masterplanie: „przycisk na stronie = w popupie 2–3 poziomy”). Poziomy 1–3 są: wyspa/karta (1), Quick edit / Chapter settings (2), Style w dialogu (3), plus menu i podmenu. Żaden test nie uruchamia ekranu w trybie ciemnym ani przy `corners: none`/`full`.
- wpływ: porównanie „strona = popup” zostaje tylko na oko.
- minimalna reakcja: jeden rząd kontrolek bezpośrednio na stronie; po P1 test W4 na tym ekranie; ciemny tryb i skrajne rogi zostawić checkpointowi 2, jawnie zapisane w jego instrukcji.

#### M9. Stały port serwera testów bez ponownego użycia

- miejsce: `apps/docs/playwright.config.ts:3`, `:17`.
- dowód: port 4310 i `reuseExistingServer: false`. Repo pracuje równolegle w kilku worktree (`.worktrees/e2-*`), a na maszynie działa kilka sesji.
- wpływ: dwa równoczesne `test:browser` kończą się błędem zajętego portu, a nie wynikiem testów.
- minimalna reakcja: port z `process.env` z domyślnym 4310 albo jawna pułapka w `AGENTS.md` („jeden `test:browser` naraz na maszynę”).

### Sugestie

- S1. Panel wybiera wartość osi przez `MenuCheckboxItem` z `closeOnClick` (`apps/docs/app/panel.tsx:51-57`): semantyka `menuitemcheckbox` dla wyboru jednego z wielu. Gdy Menu dostanie pozycję radio (E3), panel powinien jej użyć.
- S2. Listy ról na `/foundation` (`page.tsx:5-28`) są ręczną kopią wyjść silników. Test porównujący je z deklaracjami w `engines/*.css` pilnowałby F1 („wszystkie wyjścia”) bez ręcznej synchronizacji.
- S3. `components-b.spec.ts` rzutuje `window as unknown as Flights`, a pozostałe speki deklarują pola `Window` w `declare global`. Wystarczy jedna forma (po M4 znika sama).

## Zgodność z kontraktem

| Wymaganie                                                                     | Wynik                                          | Dowód                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Drzewo zgodne z „Docelowym drzewem” i `structure.md`                          | fail (mniejszy)                                | M3                                                                                                                                                                 |
| Laboratorium wyłącznie z Tessery (U19)                                        | fail                                           | P4; wyjątek inline D23 poprawnie wąski                                                                                                                             |
| Jedyny wyjątek lintu D23 na jednym pliku                                      | partial                                        | D23 = 1 plik, 1 reguła; drugi wyjątek M1; brak testu D23                                                                                                           |
| „Nakładki” z elementami na 1., 2., 3. poziomie (F11)                          | pass                                           | `overlays/page.tsx`; uwaga M8                                                                                                                                      |
| Każdy komponent na ≥ 2 stronach (F12)                                         | pass (bez strażnika)                           | 7/7 na `/components` i `/screens/overlays`; M2                                                                                                                     |
| Każde piętro w laboratorium (U21)                                             | fail                                           | P1: brak przepisów na `/foundation`                                                                                                                                |
| Wartości na prawdziwych właściwościach (D22)                                  | partial                                        | właściwości tak, ale elementów z kopii przepisu (P1)                                                                                                               |
| Trace B1                                                                      | pass z uwagą                                   | `lab.spec.ts:262-304`: przejazd, wciśnięcie przy ścianie, menu, podmenu, popover, przelot; asercja, że trace złapał `Animation`; bez dialogu (M6)                  |
| ≤ 2 `backdrop-filter` (Q14)                                                   | pass (liczba) / unknown (≤ 10 px na ruchomych) | `lab.spec.ts:306-318`; M6                                                                                                                                          |
| B7 ≤ 12                                                                       | pass (pośrednik `will-change: transform`)      | `lab.spec.ts:320-326`                                                                                                                                              |
| B4 po fiberach                                                                | fail (dowód)                                   | P2                                                                                                                                                                 |
| Anty-FOUC                                                                     | pass                                           | `lab.spec.ts:215-235` rozróżnia brak skryptu (pierwsza klatka i `DOMContentLoaded`)                                                                                |
| Chromium + WebKit, 1 worker (Q15, O1)                                         | pass                                           | `playwright.config.ts`; trace tylko Chromium (CDP), jawny `skip`                                                                                                   |
| Klawiatura (Q17, F15)                                                         | partial                                        | ToggleGroup i Menu tak; Dialog, Popover, Tooltip bez testu klawiatury (axe w E3)                                                                                   |
| `exports` kompletne i spójne z plikami (D27, U16)                             | pass                                           | `package.json:8-42`; `package.test.ts` rozwija wzorce i sprawdza source/types/default w tarballu                                                                   |
| `sideEffects` tylko CSS                                                       | pass                                           | `["**/*.css"]`; `side-effects.test.ts` z kontrolą negatywną                                                                                                        |
| Zależności: Base UI i fonty w `dependencies`, React/Tailwind/ESLint jako peer | pass                                           | `package.json`; `dist/eslint` importuje tylko `node:*` i własne pliki                                                                                              |
| `'use client'` tylko w modułach z hookami/handlerami/kompilatorem             | pass (odczyt testu)                            | `use-client.test.ts` z fixture negatywnymi; `theme-script` serwerowy                                                                                               |
| Laboratorium czyta `dist` (U17)                                               | pass                                           | brak importów `src`/`packages/` w `apps/docs`; `exports.default` → `dist`                                                                                          |
| `docs/*.md` zgodne z API                                                      | pass                                           | 7/7 porównane z `src/components/**` (propsy, części, atrybuty, czasy 600/400 ms)                                                                                   |
| Spec, masterplan, structure, AGENTS zgodne z kodem                            | fail (P3, M2, M3, M7)                          |                                                                                                                                                                    |
| Zero komentarzy w TS/TSX/CSS/konfiguracji                                     | pass                                           | grep po `apps/docs`, `packages/tessera/{src,test,scripts}`, `eslint.config.js`, `*.config.ts`; jedyny trafiony plik to generowany `next-env.d.ts` (w `.gitignore`) |
| Zero legacy                                                                   | pass                                           | grep `legacy`/`compat`/`TODO`/`eslint-disable`/`@ts-*`: brak w kodzie                                                                                              |

## Regresje i integracja

- `check` i pre-push są w kolejności D24 (typecheck → build → lint → vitest → Playwright); integracja z CI nie (P3).
- `eslint.config.js` czyta wtyczkę z `dist`, więc lint bez builda pada; kolejność bramek to obsługuje.
- Testy przeglądarkowe są niezależne od kolejności (świeży kontekst i `localStorage` na test; `choose()` czeka na zamknięcie menu i atrybut na `<html>`).

## Wykonane kontrole

```text
bunx eslint apps/docs eslint.config.js      exit 0, ok. 2 s (dist/eslint z 16:38, nowszy od src/eslint)
grep: data-recipe w apps/docs/app/foundation          0 trafień
grep: padding w apps/docs/tests                       0 trafień
grep: komentarze w TS/TSX/CSS/JS/MJS                  tylko next-env.d.ts (generowany)
grep: legacy/compat/TODO/eslint-disable/@ts-*         brak w kodzie
grep: importy dist (components, lib, themes, eslint)  @base-ui/react/*, react, react/jsx-runtime, react/compiler-runtime, node:*
odczyt: wszystkie pliki z przedmiotu review, plan E2, spec, structure, AGENTS, masterplan, e0-motion, e2-base-ui, ci.yml
```

## Niewykonane lub nierozstrzygające kontrole

- Playwright, build, vitest i typecheck nieuruchamiane (zakaz briefu). Zielony wynik `check` z Playwrightem jest REPORTED (log sesji `2026-10-31-1519`: „Playwright 16” po fazie 5b); obecnego zestawu speków nikt w tym review nie uruchomił.
- P4 oparty na odczycie kodu (brak reguł `html`/`body`, preflight Tailwinda, `color-scheme`); wygląd nieoglądany.
- Czas pre-push z Playwrightem (plan: decyzja przy > 3 min) niezmierzony.

## Wymagana ocena człowieka

```text
Uruchom: bun run dev → http://localhost:3000/screens/overlays, potem /foundation
Zrób: przełącz tryb jasny/ciemny w panelu
Oczekiwany wynik: tło strony i tekst nawigacji w kolorach i foncie Tessery (dziś przewidywane: płótno przeglądarki i font systemowy, P4)
Zwróć uwagę na: kontrast wyspy (`base`) do tła strony; dialog przy `material: translucent` w czasie wejścia (M6)
```

## Ograniczenia review

- Poza zakresem, przekazane recenzentowi 2: stałe czasu w komponentach (`SUBMENU_SWITCH_GRACE = 150` w `menu.tsx`, `GROUP_TIMEOUT = 400` w `tooltip.tsx`) wobec D7 („jedno źródło parametrów ruchu”; test literałów czasu obejmuje tylko `lib/`); `use-theme.ts:62-68` zakłada nasłuch `matchMedia` przy każdym renderze, bo `choices` to nowy obiekt w każdym renderze.
- Poprawność trace (kategorie, `compositeFailed`) przyjęta za sondą E0; nie weryfikowana od nowa.

## Zalecany następny krok

1. P1 i P2 (laboratorium i testy, route IMPLEMENTATION), P3 (CI i AGENTS.md), P4 jako decyzja projektowa prowadzącego przed poprawką.
2. Mniejsze M1–M9 w tej samej rundzie albo w fazie 8.
3. Runda kontrolna tylko dla P1–P4: pliki laboratorium, `lab.spec.ts`, `ci.yml`, `AGENTS.md`.
