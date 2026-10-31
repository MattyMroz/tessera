# Tessera

System stylu i komponentów React (`@mattymroz/tessera`) dla aplikacji właściciela: konsument składa interfejs z części Tessery i nie pisze własnych stylów. Repo to bun workspace z jedną paczką i stroną dokumentacji, która jest zarazem laboratorium.

## Bramki jakości

```sh
bun run check          # typecheck (TS 7) → eslint → build (tsdown, potem next build) → bunx vitest run
bun run dev            # tsdown --watch paczki i next dev laboratorium równolegle, jeden link
SKIP=no-commit-to-branch prek run --all-files   # hooki commitów na całym drzewie (na main bez SKIP zawsze czerwone)
```

- IMPORTANT: testy tylko `bunx vitest run`, NIGDY `bun run test`.
- Playwright tylko headless i z jednym workerem; testy lekkie, komputer właściciela się zacina.
- Hook pre-push uruchamia te same cztery kroki co `bun run check`. Instalacja po klonie: `git config --local core.autocrlf false`, `prek install`.

## Twarde reguły

- IMPORTANT: commit i push tylko na wyraźne słowo właściciela. Subagenci nie wykonują żadnych komend git.
- `main` dostaje tylko squash merge PR (hook `no-commit-to-branch`). Praca na branchach w worktree `.worktrees/<nazwa>`. Tytuł PR = nagłówek commita, opis PR = streszczenie i blok `Validation:` (ustawienie repo: domyślna wiadomość squash = tytuł i opis PR).
- Commit: `type(scope): description`, scope obowiązkowy z zamkniętej listy `--scopes` w `.pre-commit-config.yaml`; pod nagłówkiem streszczenie i blok `Validation:` z kontrolami faktycznie uruchomionymi przez `mm-validate` (hook `commit-validation`; instalacja `uv tool install git+https://github.com/MattyMroz/agents@hooks-v1.3.1`). Format: `presets/hooks/references/commit-message.md` w repo MattyMroz/agents. Zero śladów AI w commitach i PR.
- Kod etapu nie powstaje bez kontraktu w `docs/plans/` zaakceptowanego przez właściciela.
- Status przed oceną właściciela na żywo, w kompozycji, to najwyżej „gotowe do oceny”.
- Zero legacy: bez warstw zgodności z v1/v2, aliasów starych nazw i słowa `legacy` w kodzie. Kod przenoszony z v2 przepisuj na model v3.
- Zero pustych folderów i pakietów „na zapas”: folder powstaje z pierwszym plikiem.
- Kod, komentarze, nazwy, git i tekst UI po angielsku; dokumenty w `docs/` i ten plik po polsku.
- Zależności tylko przez bun: `bun add` w katalogu członka workspace, wspólne wersje przez `catalog:` w korzeniowym `package.json`.
- YOU MUST edytować pliki tylko narzędziami Edit/Write. Nigdy PowerShell (`Set-Content`, `Out-File`) ani skrypty: PS 5.1 robi mojibake z polskich znaków. Pliki są UTF-8 + LF (`.gitattributes`).

## Model warstw

Trzy piętra: **silniki** → **przepisy** → **komponenty**; motyw to tylko zestaw wyborów silników. Warstwy w `packages/tessera/src/` powstają z pierwszym plikiem:

- `engines/<silnik>/`: wejścia (`data-*`, `--in-*`) → wyjścia `--<silnik>-<rola>`, jedyne publiczne API. Silnik deklaruje tylko własne wyjścia, `--in-*` i prywatne `--_*` i czyta tylko silniki, od których zależy.
- `recipes/`: wartości wyłącznie z wyjść silników i prywatnych `--_*`, nigdy liczby ani kolory.
- `components/<nazwa>/`: CSS tylko z rozmieszczeniem części (`display`, `gap`, wyrównania, `flex*`, `order`, kolumny i wiersze siatki) i wartościami z tokenów. Rozmiar, pozycja, kolor, promień, cień, ruch, liczby poza `-1`/`0`/`1` i własny `:focus-visible` należą do przepisów i silników.
- Zmiana wyglądu jednego elementu = wariant przepisu, nie token komponentu. Poprawki wyglądu idą do silników i przepisów, nie do komponentów.
- Pilnuje tego `packages/tessera/test/guards/css-layers.ts` (biała lista per warstwa, fixture `good/` i `bad/`). Nowa reguła dostaje strażnika od razu: biała lista plus jawne wyjątki z powodem, nigdy kopia listy tokenów.

## Wydajność i ruch

Priorytet nr 1 to wydajność. Pełna lista wymagań i budżetów: `docs/specification.md`, sekcja „Wymagania jakościowe”.

- Ruch tylko `transform`/`translate`/`scale`/`rotate`/`opacity`. Każdy inny przypadek to nazwany wyjątek z powodem w jednym pliku. Zmiana rozmiaru dzieje się w jednej klatce, nigdy w ruchu.
- Nie udawaj zmiany rozmiaru kopiami DOM ani kawałkami wskaźnika lub popupu: ta droga została sprawdzona i odrzucona.
- Zero runtime CSS-in-JS. Wariant i motyw to atrybuty `data-*` + CSS, nie kontekst React.
- Kształt i rozmiar nie przechodzą przez JS (bez `ResizeObserver` + `getComputedStyle` + `setProperty`); pomiar DOM tylko tam, gdzie wymaga go zachowanie, w plikach z nazwanej listy.

## Mapa kodu

- `packages/tessera/`: jedyna paczka. `exports` per ścieżka (bez zbiorczego `.`): `dist/` dla każdego konsumenta, także laboratorium; warunek `source` → `src/` czyta tylko TypeScript (`customConditions`), bo Turbopack nie obsługuje własnych warunków (`docs/decisions/e1-source-condition.md`); `sideEffects` tylko CSS.
  - `src/styles/tessera.css`: jedyne miejsce kolejności `@layer`. Drugie wejście, `tailwind.css` (most tokenów do Tailwinda), powstaje z pierwszymi tokenami silników.
  - `src/eslint/`: reguły konsumenta; `index.ts` eksportuje wtyczkę `@mattymroz/tessera/eslint` z `configs.recommended`, testy w `rules.test.ts`.
  - `src/lib/`: wspólne zachowanie bez wyglądu.
  - `test/guards/`: strażnicy struktury i warstw CSS.
  - `test/package/`: kontrakt zbudowanej paczki (exports, `'use client'`, brak efektów ubocznych, React Compiler). Nie `test/dist/`: preset `.gitignore` ignoruje każdy katalog `dist/`.
  - `tsdown.config.ts`: ESM, plik na plik, `.d.ts`, React Compiler. `vitest.config.ts`: projekty `unit` i `package` (z korzenia nazywają się `@mattymroz/tessera (unit)` i `(package)`); korzeniowy `vitest.config.ts` tylko wskazuje `packages/*`, żeby `bunx vitest run` nie zbierał testów z `.worktrees/`.
- `apps/docs/`: strona dokumentacji = laboratorium (Next 16, static export), czyta `dist` paczki jak każdy konsument; `agentRules: false`, bo repo ma jeden AGENTS.md.
- `docs/`: dokumenty projektu, poza paczką.
- `.worktrees/`: worktree agentów; zawartość ignorowana przez gita.

## Dokumentacja

- `docs/specification.md`: jedyne źródło decyzji (model, wygląd, wydajność, zakazy, nierozstrzygnięte). Gdy ten plik albo kod przeczy spec, zgłoś konflikt właścicielowi, nie wybieraj wygodniejszej wersji.
- `docs/structure.md`: docelowe drzewo repo i reguły wzrostu ze strażnikami.
- `docs/plans/`: `masterplan.md` (etapy i bieżący etap) i kontrakty etapów `eNN-<slug>.md`.
- `docs/research/`, `docs/decisions/` (wyniki prób i pomiarów), `docs/reviews/`.
- Wykonany plan albo research znika, a wiedza przechodzi do kodu, testów i tego pliku.

## Pułapki

- Testy `test/package/` i laboratorium czytają `packages/tessera/dist/`: bez świeżego `bun run build` oblewają albo widzą stary build. `bun run check` buduje przed testami. Na świeżym klonie przed pierwszym `bun run dev` zrób `bun run build`, bo `--parallel` nie czeka, aż tsdown skończy.
- Typecheck idzie przez TypeScript 7 (`typescript7` = `npm:typescript@^7`, skrypt `typecheck` każdego członka). TypeScript 6 zostaje tylko jako peer `typescript-eslint`; nie zamieniaj ich.
- `git worktree remove` (z `--force` i bez) wchodzi na Windows w junctiony i kasuje ich cel. Junctiony robią `link:` u konsumenta (paczka Tessery w worktree MangaShift) i linki skilli. Przed usunięciem worktree albo katalogu najpierw zdejmij linki (`rmdir` na junction), potem `git worktree remove` bez `--force`. Globalny `guard.sh` odmawia usunięcia, dopóki linki istnieją.
- W worktree nie synchronizuj skilli: `@core` jest globalny.
