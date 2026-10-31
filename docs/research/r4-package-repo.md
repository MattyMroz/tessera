# R4: repo, build, dystrybucja, dokumentacja i testy Tessery v3

Stan na 2026-10-30. Researcher, tylko odczyt. Źródła zewnętrzne sprawdzone 2026-10-30, każde z URL i wersją lub datą widoczną na stronie; gdy strona nie podawała wersji, piszę to wprost.

Oznaczenia: **F** fakt ze źródła, **L** fakt lokalny (plik na dysku), **W** wniosek z kilku faktów, **O** opinia, **R** rekomendacja, **?** niewiadoma.

## Odpowiedź w skrócie

01. **Repo:** bun workspaces bez Turbo, dwóch członków: `packages/tessera` (jedyna paczka) i `apps/docs` (strona = laboratorium = galeria testów). Tak samo układają się Ark UI i Park UI (bun) oraz HeroUI i shadcn (pnpm + `apps/docs` / `apps/v4`).
02. **Build:** tsdown w trybie `unbundle`, tylko ESM, `exports` bez zbiorczego `.`, `sideEffects: ["**/*.css"]`. CSS jako zwykłe pliki CSS kopiowane do `dist`, nie kompilowane przez Tailwinda.
03. **Tailwind:** komponenty bez klas Tailwinda w TSX, więc konsument nie potrzebuje `@source` do `node_modules`. Tokeny w `:root` (działają bez Tailwinda), most do Tailwinda w osobnym `tailwind.css` z `@theme inline`, CSS komponentów w `@layer components`.
04. **Dwa repo:** laboratorium w repo Tessery czyta `src` (natychmiastowy HMR, zero watchera). Zewnętrzni konsumenci linkują paczkę przez `link:` i czytają `dist` z `tsdown --watch`. Dwie pułapki do spike'a: podwójny React przy symlinku i Turbopack, który nie rozwiązuje plików spoza `turbopack.root`.
05. **Publikacja:** same fakty w punkcie 5. Decyzja (publiczna czy prywatna, licencja) należy do właściciela.
06. **Wersje:** do pierwszej migracji 0.y.z ręcznie; potem release-please, bo repo i tak wymusza Conventional Commits.
07. **Strona:** własna aplikacja na Next 16 (static export) z MDX, budowana wyłącznie z Tessery; opcjonalnie `fumadocs-core`/`fumadocs-mdx` bez `fumadocs-ui`. Bez Storybooka.
08. **Agenci:** markdown w paczce (`node_modules/@mattymroz/tessera/docs/`) + jedna linijka w `AGENTS.md` konsumenta + `llms.txt` na stronie z tych samych plików. Bez MCP, registry i własnego CLI.
09. **Testy:** Vitest (logika w node, komponenty w browser mode z Playwrightem), Playwright na galerii strony (e2e, zrzuty, axe).
10. **Presety:** `presets/git`, CORE z `presets/hooks`, `hooks-agents` i `standard.py` pasują bez zmian. Brakuje bramek pre-push dla TS/bun, decyzji ESLint czy Biome i wyjątku `.gitignore` na wzorce zrzutów.

## Kontekst lokalny: co już robi Tessera v2

- **L** v2 żyje w `MangaShift/tessera/` i ma jedną paczkę `packages/tessera`. Ma też `apps/gallery` (Vite) oraz `apps/next-fixture` i `apps/next-fixture-css-file` (Next static export). Źródło: `MangaShift/tessera/AGENTS.md`, sekcja „Mapa kodu”.
- **L** Build idzie przez tsdown: `unbundle: true`, `format: 'esm'`, `platform: 'neutral'`, `dts: true`, `checks: { moduleLevelDirective: false }`. Źródło: `tessera/packages/tessera/tsdown.config.ts`. AGENTS.md mówi, że komponent z handlerem ma `'use client'`, czyli dyrektywy przechodzą przez unbundle.
- **L** `package.json` v2 ma `exports` tylko do `dist` (bez zbiorczego `.`), `sideEffects: ["**/*.css"]`, `files: ["dist", "skills", "docs"]`. Katalogu `skills/` w paczce nie ma, więc wpis w `files` jest martwy.
- **L** Konsumpcja `dist` wymusiła „strażnika buildu”: `scripts/ensure-build.ts` (znacznik w `node_modules/.cache`, blokada przez nasłuch TCP na porcie z hasha ścieżki, czekanie do 120 s) i `scripts/dev-host.ts`. Do tego hooki `predev`/`prebuild`/`pretypecheck`/`prelint` w każdej aplikacji i osobne testy strażnika (ok. 2,5 min). Źródło: `tessera/AGENTS.md`, „Pułapki”.
- **W** Tę złożoność rodzi kilku konsumentów `dist` w jednym workspace, którzy ścigają się o build. v3 może ją usunąć: laboratorium czyta `src`, a watcher `dist` jest jeden i uruchamia go tylko ten, kto pracuje na zewnętrznym konsumencie (punkt 4).

## 1. Struktura repo

| biblioteka       | menedżer / narzędzie monorepo                                                           | gdzie docs                                                  | laboratorium                                   | testy                                                                                             | źródło                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui        | pnpm + Turborepo, `.changeset/`                                                         | `apps/v4` (strona)                                          | strona                                         | `vitest.config.ts`, `vitest.workspace.ts` w korzeniu                                              | https://github.com/shadcn-ui/ui (2026-10-30, brak tagu na stronie)                                                                                                                          |
| Radix Primitives | pnpm, `.changeset/`, oxlint/oxfmt                                                       | strona poza repo (radix-ui.com), `apps/`                    | `apps/`                                        | `e2e/` + `playwright.config.ts`, `vitest.config.mts`                                              | https://github.com/radix-ui/primitives (2026-10-30)                                                                                                                                         |
| Base UI          | pnpm + nx + lerna                                                                       | `docs/` = Next 16.4.3 + `@next/mdx`, skrypt `generate-llms` | `playground/vite-app`                          | `test/`, Vitest: jsdom domyślnie, Playwright browser mode przy `VITEST_ENV`                       | https://github.com/mui/base-ui, https://raw.githubusercontent.com/mui/base-ui/master/docs/package.json, https://raw.githubusercontent.com/mui/base-ui/master/vitest.shared.mts (2026-10-30) |
| Ark UI           | **bun 1.4.2** (`bun.lock`, `bunfig.toml`), bez Turbo, changesets 3.0.3, lefthook, Biome | `website/`                                                  | `.storybook/` (Storybook 10.6.1)               | Vitest 5.0.3 + happy-dom + `vitest-axe`                                                           | https://github.com/chakra-ui/ark, `packages/react/package.json`, korzeniowy `package.json` (2026-10-30)                                                                                     |
| React Aria       | yarn + lerna, Parcel                                                                    | strona poza repo, `docs/contributing`                       | `.storybook/`, `.storybook-s2/`, `.chromatic/` | `jest.config.js`, `vitest.browser.config.ts`, `test/browser/`                                     | https://github.com/adobe/react-spectrum (2026-10-30)                                                                                                                                        |
| Park UI          | **bun** (`bun.lock`, `bunfig.toml`), lefthook, Biome                                    | `website/`                                                  | `website/`                                     | brak widocznych                                                                                   | https://github.com/chakra-ui/park-ui (2026-10-30)                                                                                                                                           |
| Mantine          | yarn                                                                                    | `docs/`, mantine.dev                                        | `.storybook/`, `.demo/`                        | Jest + jsdom                                                                                      | https://github.com/mantinedev/mantine (2026-10-30)                                                                                                                                          |
| HeroUI v3        | pnpm + Turborepo, husky, commitlint                                                     | `apps/docs`                                                 | `packages/storybook`                           | `packages/testing`, Vitest 5.0.5: projekty `react-jsdom` i `react-browser` (`*.browser.test.tsx`) | https://github.com/heroui-inc/heroui (gałąź v3, `@heroui/react` 3.2.7)                                                                                                                      |

Ustalenia:

- **F** Bun jako menedżer workspace stosują Ark UI i Park UI. Ark spina paczki samym `bun run --filter`, bez Turbo: `"build": "bun run --filter='./packages/*' build"`, `"workspaces": ["packages/*", "templates/**", "scripts", "website"]`. Źródło: https://raw.githubusercontent.com/chakra-ui/ark/main/package.json (2026-10-30).
- **F** Ark i HeroUI trzymają w repo `exports` wskazujące na `src` (`"." : "./src/index.ts"`), a przy publikacji podmieniają je narzędziem `clean-package` (`prepack`/`postpack`). Źródła: Ark `packages/react/package.json` (5.40.0), HeroUI `packages/react/package.json` (3.2.7).
- **F** shadcn w monorepo zostawia paczkę UI jako źródła: `"./components/*": "./src/components/*.tsx"`, `"./globals.css": "./src/styles/globals.css"`. Źródło: https://ui.shadcn.com/docs/monorepo (2026-10-30, brak daty na stronie).
- **W** Każda z badanych bibliotek ma docs w tym samym repo co kod, jako aplikację workspace. Laboratorium jest albo stroną (shadcn, Park, Base UI ma dodatkowo `playground/`), albo Storybookiem (Ark, Mantine, React Aria, HeroUI).

**R** Bun workspaces bez Turbo i dwóch członków: `packages/tessera` i `apps/docs`. Kryteria: najmniej narzędzi (bun już jest w MangaShift), jeden lockfile, wzorzec Ark/Park. Turbo daje cache zadań, którego przy jednej paczce i jednej aplikacji nie ma czego cache'ować. Wersje wspólne przez `catalog:` w korzeniu, tak jak dziś w MangaShift.

- **F** Bun trzyma katalogi w `workspaces.catalog`/`workspaces.catalogs`, a `bun publish` i `bun pm pack` podmieniają `catalog:` na konkretne zakresy. Źródło: https://bun.com/docs/pm/catalogs (Bun 1.4.4).
- **F** Nowe workspace'y bun mają domyślnie linker `isolated`, pojedyncze projekty `hoisted` (o domyślnym decyduje `configVersion` w lockfile). Źródło: https://bun.com/docs/pm/cli/install (Bun 1.4.4).

## 2. Build

| narzędzie               | stan                 | `.d.ts`                              | struktura plików                       | `'use client'`                                                                           | CSS                                                                                                      | źródło                                                                                                                                       |
| ----------------------- | -------------------- | ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| tsdown 0.23.4           | aktywny, Rolldown    | tak (`dts`)                          | `unbundle: true` odwzorowuje `src` 1:1 | strona Reacta nie opisuje; lokalnie v2 przechodzi z `checks.moduleLevelDirective: false` | eksperymentalne: domyślnie jeden `style.css`, w unbundle `css.splitting` domyślnie `true`, Lightning CSS | https://tsdown.dev/guide/, https://tsdown.dev/options/css, https://tsdown.dev/options/unbundle (0.23.4)                                      |
| tsup                    | **nieutrzymywany**   | tak                                  | bundle                                 | baner                                                                                    | proste                                                                                                   | README: „This project is not actively maintained anymore… Please consider using tsdown instead.” https://github.com/egoist/tsup (2026-10-30) |
| `bun build` (Bun 1.4.4) | aktywny              | tak, `--dts` (typecheck przy okazji) | bundle, `splitting` opcjonalne         | `banner: '"use client";'` na całym bundlu                                                | wszystkie pliki CSS w jeden `.css`, `--css-chunking`                                                     | https://bun.com/docs/bundler (1.4.4)                                                                                                         |
| Vite library mode       | aktywny (Vite 8.3.4) | przez `vite-plugin-dts`              | konfigurowalna                         | przez wtyczki                                                                            | tak                                                                                                      | Ark: `"build": "vite build"`, `vite-plugin-dts` 5.1.2                                                                                        |
| własny skrypt + Rollup  | HeroUI 3.2.7         | `--tsc`                              | dowolna                                | dowolnie                                                                                 | osobna paczka `@heroui/styles`                                                                           | HeroUI `packages/react/package.json`                                                                                                         |

Ustalenia:

- **F** tsdown umie generować `exports` (`exports: true`) oraz `devExports`, które w repo wskazują na źródła, a wersję z `dist` zapisują do `publishConfig`. Docs zastrzegają: działa przy `pack`/`publish` yarn i pnpm, „not supported by npm”. Źródło: https://tsdown.dev/options/package-exports (0.23.4).
- **F** `bun publish` obsługuje w `publishConfig` tylko `access`, `tag`, `registry`, `@scope:registry` i `provenance` (ustawienie `true` daje błąd). O podmianie `exports` docs milczą. Źródło: https://bun.com/docs/pm/cli/publish (1.4.4).
- **W** Mechanizm `devExports` z tsdown nie zadziała z `bun publish`. Wzorzec „src w repo, dist w paczce” wymagałby `clean-package` jak w Ark/HeroUI. To jeden ruchomy element więcej.
- **F** Tailwind ignoruje pliki CSS przy skanowaniu klas, a `node_modules` pomija domyślnie. Źródło: https://tailwindcss.com/docs/detecting-classes-in-source-files (2026-10-30).
- **F** HeroUI rozdziela JS (`@heroui/react`, `sideEffects: false`) i CSS (`@heroui/styles`, `sideEffects: ["*.css"]`). CSS idzie przez mapę `exports`: całość `./css`, części `./base`, `./themes/*`, `./utilities`, `./variants` i każdy komponent `./components/*.css`. Źródło: https://raw.githubusercontent.com/heroui-inc/heroui/v3/packages/styles/package.json (3.2.7).

**R** Build i `exports`:

- **tsdown, `unbundle: true`, ESM, `dts: true`**, tak jak w v2 (L). Kryteria: utrzymywany następca tsup; jeden plik wyjściowy na plik źródłowy daje tree-shaking bez polegania na bundlerze konsumenta i zachowuje `'use client'` per komponent. `bun build` przegrywa, bo baner dokleja dyrektywę do całego bundla, a nie do pojedynczych plików. Vite library mode wymaga osobnej wtyczki do `.d.ts`.
- **`exports` tylko do `dist`, bez zbiorczego `.`** (już tak jest w v2). Podścieżki na rodzinę: `./components/*`, `./hooks/*`, `./lib/*`, `./tessera.css`, `./tailwind.css`. Do tego `"source"` jako warunek niestandardowy wskazujący `src`, czytany tylko przez laboratorium (punkt 4). Kompromis: jeden warunek dodatkowy zamiast `clean-package`.
- **CSS jako zwykłe pliki kopiowane do `dist`**, bez przetwarzania przez Tailwinda i bez eksperymentalnego bundlowania CSS w tsdown. Jedno wejście `tessera.css` importuje części w ustalonej kolejności `@layer`. Każdy komponent ma swój plik, osiągalny przez wildcard, ale konsument importuje jedno wejście. Kryterium: jedno źródło kolejności kaskady, zero zależności od narzędzia konsumenta.
- **`sideEffects: ["**/*.css"]`** (CSS nie może wypaść przy tree-shakingu, JS może).
- **`'use client'`** tylko w plikach z hookami lub handlerami, zostaje w `dist` dzięki unbundle. Kontrakt sprawdza Next w laboratorium (punkt 7).

## 3. Tailwind v4 w bibliotece

| mechanizm                         | co robi                                                                                                                                                 | źródło                                                                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@import "tailwindcss"`           | rozwija się do `@layer theme, base, components, utilities;` i importów `theme.css`, `preflight.css`, `utilities.css` z `layer(...)`                     | https://tailwindcss.com/docs/preflight (2026-10-30)                                                                                                                  |
| `@layer components`               | „complicated classes you want to add… that you'd still like to be able to override with utility classes”; dobre miejsce na CSS komponentów zewnętrznych | https://tailwindcss.com/docs/adding-custom-styles                                                                                                                    |
| `@theme`                          | zmienne, z których powstają utility (`--color-mint-500` → `bg-mint-500`); muszą stać na najwyższym poziomie                                             | https://tailwindcss.com/docs/theme                                                                                                                                   |
| `@theme inline`                   | utility używa wartości zmiennej, nie referencji; do zmiennych wskazujących inne zmienne                                                                 | jw.                                                                                                                                                                  |
| emisja zmiennych                  | „only the CSS variables that are actually used are generated”; `@theme static` wymusza wszystkie                                                        | jw.                                                                                                                                                                  |
| dzielenie motywu                  | „publish them to NPM and import them just like any other third-party CSS files”                                                                         | jw.                                                                                                                                                                  |
| reset przestrzeni                 | `--color-*: initial` usuwa domyślne utility koloru; `--*: initial` cały motyw                                                                           | jw.                                                                                                                                                                  |
| `prefix(tw)`                      | prefiks dla utility i zmiennych, podawany na importach                                                                                                  | https://tailwindcss.com/docs/preflight                                                                                                                               |
| `@source "../node_modules/@x/ui"` | jawne skanowanie biblioteki zbudowanej na klasach Tailwinda; ścieżka względem arkusza                                                                   | https://tailwindcss.com/docs/detecting-classes-in-source-files                                                                                                       |
| symlinki w `@source`              | changelog 4.1.4: poprawka śledzenia symlinków przy `@source` (#17391); dyskusja #19118 opisuje brak skanowania `node_modules` na 4.1.13 z Vite          | wynik wyszukiwania prowadzący do changelogu Tailwinda i https://github.com/tailwindlabs/tailwindcss/discussions/19118 (nie otwierałem changelogu, status: supported) |

Jak robią inni:

- **F** HeroUI v3: `@import "tailwindcss"; @import "@heroui/styles";`, „Import order matters. Always import `tailwindcss` first.”; `tailwindcss >=4.0.0` jako peer. Źródło: https://www.heroui.com/docs/react/getting-started/quick-start (gałąź v3, 2026-10-30).
- **F** shadcn w monorepo: `globals.css` żyje w paczce UI (`packages/ui/src/styles/globals.css`), aplikacja wskazuje go w `components.json`; dla v4 pole `tailwind` w `components.json` zostaje puste. Linii `@source` strona nie pokazuje. Źródło: https://ui.shadcn.com/docs/monorepo.
- **F** Catalyst nie jest paczką npm: „you download a ZIP file with the React components and add them directly to your project”. Wymaga projektu z Tailwindem i `@headlessui/react@next`. Źródło: https://catalyst.tailwindui.com/docs i https://tailwindcss.com/plus/ui-kit (stos: Tailwind 4.2, React 19). **W** Konfliktów z aplikacją tu nie ma, bo kod staje się kodem aplikacji.

Konflikty z aplikacją (W):

- CSS biblioteki poza warstwami wygrywa z każdą warstwą Tailwinda, więc utility aplikacji go nie nadpiszą. W `@layer components` utility wygrywają, co odpowiada intencji „Tailwind do układu”.
- Nazwy tokenów biblioteki mogą kolidować z `@theme` aplikacji. Prefiks nazw w `:root` (np. `--ts-*`) i jawny most w `tailwind.css` ograniczają to do jednego pliku.
- `@theme` bez `static` emituje tylko zmienne użyte w utility (F). Jeżeli CSS komponentów czyta token zdefiniowany wyłącznie w `@theme`, a aplikacja nie użyje odpowiedniej klasy, zmienna może nie trafić do wyniku (**?** nie sprawdzałem, czy `var()` w zaimportowanym CSS liczy się jako użycie).

**R**

- Komponenty Tessery **bez klas Tailwinda w TSX**, wygląd wyłącznie z CSS paczki. Wtedy konsument nie potrzebuje `@source` do `node_modules`, a znikają też pułapki symlinków i `.gitignore` przy skanowaniu. Kryterium: zero kosztu po stronie konsumenta, CSS paczki działa także bez Tailwinda.
- Trzy warstwy plików:
  - `tokens.css`: zmienne w `:root` i `[data-*]`, źródło prawdy;
  - `tessera.css`: `@layer components` z CSS komponentów, importuje `tokens.css`;
  - `tailwind.css`: tylko `@theme inline { --color-primary: var(--ts-primary); ... }`, most nazw do utility, wzorzec `@theme inline` z dokumentacji.
- Konsument pisze: `@import "tailwindcss"; @import "@mattymroz/tessera/tessera.css"; @import "@mattymroz/tessera/tailwind.css";`. Kolejność jak w HeroUI.
- Spike: czy `@import` paczkowego CSS z `@layer components` przez `@tailwindcss/vite` i przez Next (PostCSS) daje tę samą kolejność warstw. v2 ma już fixture `next-fixture-css-file`, który bada podobny wariant (L).

## 4. Rozwój na dwóch repo

| sposób                                    | mechanizm                                                                   | na żywo                                                                              | zależności paczki                        | źródło                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------- |
| `bun link` + `bun link <nazwa>`           | rejestracja globalna, potem symlink w `node_modules` konsumenta             | tak                                                                                  | nie instaluje                            | https://bun.com/docs/pm/cli/link (1.4.4)                              |
| `"x": "link:../tessera/packages/tessera"` | „a single symlink to the linked directory”; ścieżka względem `package.json` | tak                                                                                  | „its own dependencies are not installed” | https://bun.com/docs/pm/cli/link, https://bun.com/docs/pm/cli/install |
| `"x": "file:../…"`                        | domyślnie **hardlink** plików; zależności z `node_modules` projektu         | **W** nie: nowe pliki i zapisy atomowe edytora zrywają hardlink, trzeba reinstalować | rozwiązywane z projektu                  | https://bun.com/docs/pm/cli/install                                   |
| workspace                                 | tylko w jednym repo                                                         | tak                                                                                  | wspólne                                  | jw.                                                                   |

Konsumpcja przez bundlery:

- **F Vite 8.3.4:** zależność rozwiązana spoza `node_modules` jest traktowana „as source code”, nie jest pre-bundlowana i musi być ESM. Źródło: https://vite.dev/guide/dep-pre-bundling. `server.fs.strict` domyślnie `true`, dozwolony jest korzeń workspace; plików w `node_modules` nie da się obserwować. Źródło: https://vite.dev/config/server-options. Strona nie mówi wprost o symlinkach spoza korzenia (**?**).
- **F Next 16 / Turbopack:** „Files outside of the project root are not resolved.” Dla `npm link` trzeba ustawić `turbopack.root` na wspólnego rodzica albo użyć `experimental.turbopackAdditionalRoots`. Ta opcja jest eksperymentalna, od 16.4.0, i działa tylko na granicy symlinku. Docs ostrzegają przed zbyt szerokim korzeniem (Turbopack obserwuje wszystko w środku). Na Windows symlinki wymagają Developer Mode lub uprawnień, z fallbackiem do junctionów z bezwzględnymi ścieżkami. Źródło: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack (lastUpdated 2026-09-24).
- **F `transpilePackages`:** Turbopack sam transpiluje paczki workspace. Paczkę w `node_modules` z surowym TS/JSX trzeba wpisać na listę albo zbudować do JS. Źródło: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages (lastUpdated 2026-05-27).
- **F Podwójny React:** React wprost wymienia `npm link` jako przyczynę, bo bundler „might see two Reacts”. Źródło: https://react.dev/link/invalid-hook-call. Vite ma `resolve.dedupe`, którego logika działa, gdy importujący plik leży poza korzeniem projektu (https://github.com/vitejs/vite/pull/6591). Dla Turbopacka nie znalazłem udokumentowanego odpowiednika (**?**).
- **L** `node_modules` MangaShift ma 4123 linki bun (junctiony) na 112 tys. wpisów, a `git worktree remove` na Windows wchodzi w junctiony i kasuje ich cel. Źródło: `agents/presets/hooks-agents/README.md`, „Koszt” i „Linki w worktree”.

Wnioski (W):

- Symlink `link:` sprawia, że `import 'react'` w plikach Tessery rozwiązuje się od prawdziwej ścieżki, czyli z `tessera/node_modules/react` (React jest tam devDependency laboratorium). To dotyczy tak samo `src`, jak i `dist`. Problemu podwójnego Reacta nie rozwiązuje wybór „źródła czy dist”, tylko dedupe lub alias po stronie konsumenta.
- Konsumpcja `src` przez zewnętrznego konsumenta Next wymaga `transpilePackages`. tsc konsumenta sprawdzałby wtedy pliki `.ts` Tessery z jego własnym `tsconfig` (`skipLibCheck` dotyczy tylko `.d.ts`). Konsumpcja `dist` tego nie ma.
- W obu wariantach Next potrzebuje `turbopack.root` albo `turbopackAdditionalRoots`, bo Tessera leży poza repo konsumenta.

**R** Dwie ścieżki, każda z jednym źródłem prawdy:

1. **Laboratorium (`apps/docs`) czyta `src`** przez warunek `"source"` w `exports` (Vite: `resolve.conditions`, TS: `customConditions`). Next transpiluje paczkę workspace sam (F). Efekt: natychmiastowy HMR bez watchera i bez strażnika z v2. To codzienna pętla pracy nad Tesserą.
2. **Zewnętrzni konsumenci (desktop, strona, AniShift) czytają `dist`**: `"@mattymroz/tessera": "link:../tessera/packages/tessera"` i `bun run dev` w Tesserze (`tsdown --watch`). Watcher jest jeden, więc nie ma wyścigu, przez który v2 potrzebowało blokady TCP. Kryterium: konsument widzi dokładnie to, co dostanie z publikacji.

- Spike przed decyzją (każdy na jednym konsumencie, mierzony):
  - Vite + `link:` do `dist` poza korzeniem: czy zmiana w `dist` daje HMR; czy `server.fs.allow` i `resolve.dedupe: ['react','react-dom']` wystarczą.
  - Next 16 + `turbopackAdditionalRoots` (eksperymentalne) albo `turbopack.root` na wspólny rodzic: czy Fast Refresh łapie zmiany `dist`; jak usunąć drugi React (`turbopack.resolveAlias` na absolutną ścieżkę Reacta konsumenta, niesprawdzone).
  - Windows: czy `bun link` tworzy symlink czy junction i czy Turbopack za nim idzie bez Developer Mode.

## 5. Publikacja (fakty, bez decyzji)

| kanał            | koszt                                                                              | instalacja przez bun                                                                                                             | uwagi                                                                                                                                                                          | źródło                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm publiczny    | darmowy; organizacja darmowa dla paczek publicznych                                | `bun add @scope/x` bez konfiguracji                                                                                              | kod i paczka widoczne dla wszystkich; `bun publish` nie generuje provenance                                                                                                    | https://npmjs.com/pricing (przez wyszukiwarkę, strona 403), https://bun.com/docs/pm/cli/publish                                                      |
| npm prywatny     | „paid user or organization account”; Pro 7 USD/mies., Teams 7 USD/użytkownik/mies. | token w `.npmrc` lub `bunfig.toml`                                                                                               | paczki scoped są domyślnie prywatne                                                                                                                                            | https://docs.npmjs.com/about-private-packages; ceny z wyników wyszukiwania (status: supported, strona cennika zwróciła 403)                          |
| GitHub Packages  | darmowe limity zależne od planu (nie sprawdzałem)                                  | `[install.scopes] "@mattymroz" = { token = "$GITHUB_TOKEN", url = "https://npm.pkg.github.com/" }`                               | **token wymagany nawet do instalacji paczki publicznej**; tylko PAT classic (`read:packages`); scope = właściciel                                                              | https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry, https://bun.com/docs/pm/scopes-registries |
| JSR              | darmowy                                                                            | docs pokazują `npx jsr add`; pnpm 10.9+ i Yarn 4.9+ natywnie; Bun natywnie nie wymieniony; rejestr `npm.jsr.io` pod scope `@jsr` | JSR transpiluje TS do JS i generuje `.d.ts`; o plikach CSS docs milczą (**?**)                                                                                                 | https://jsr.io/docs/npm-compatibility (2026-10-30)                                                                                                   |
| zależność z gita | darmowa                                                                            | `github:user/repo#tag`, `git+ssh://…#tag`                                                                                        | bun nie uruchamia skryptów cyklu życia zależności poza `trustedDependencies`; czy wykona `prepare` zależności, docs nie mówią (**?**) → `dist` musiałby być w repo albo w tagu | https://bun.com/docs/pm/cli/install (1.4.4)                                                                                                          |
| `link:` lokalnie | 0                                                                                  | jak w punkcie 4                                                                                                                  | bez wersji i bez publikacji                                                                                                                                                    | jw.                                                                                                                                                  |

Licencja (F, bez rekomendacji):

- `license` w `package.json` przyjmuje identyfikator SPDX (np. `MIT`). Dla własnych warunków: `"SEE LICENSE IN <plik>"`. Dla braku jakichkolwiek praw: `"UNLICENSED"`, a przed przypadkową publikacją chroni `"private": true`. LICENSE i README trafiają do paczki zawsze, niezależnie od `files`. Źródło: https://docs.npmjs.com/cli/v11/configuring-npm/package-json.
- **W** Paczka zastrzeżona opublikowana publicznie na npm jest dalej do pobrania i czytania przez każdego. Licencja ogranicza prawo użycia, nie dostęp. Realnie prywatny kod daje płatny npm, GitHub Packages (token) albo `link:`/git z prywatnego repo.
- **W** MIT pozwala innym używać i forkować Tesserę, także komercyjnie. Konkurencyjnie to oddanie fundamentu UI produktu. Decyzja właściciela.

## 6. Wersjonowanie

| podejście      | jak działa                                                                                                                                                                            | dla kogo                                                                                                                         | źródło                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| changesets     | autor dopisuje plik changeset; `changeset version` podbija wersje i changelog; `changeset publish` publikuje                                                                          | monorepo wielu paczek; Ark na bun: `"version": "changeset version …"`, `"release": "changeset publish"`, `@changesets/cli` 3.0.3 | https://github.com/changesets/changesets (gałąź v3), Ark `package.json`         |
| release-please | czyta Conventional Commits, utrzymuje PR wydania, po merge taguje i tworzy GitHub Release; `fix:` patch, `feat:` minor, `!` major; zaleca squash merge; **nie publikuje do rejestru** | repo z wymuszonym formatem commitów                                                                                              | https://github.com/googleapis/release-please (2026-10-30, brak tagu na stronie) |
| ręcznie        | wersja w `package.json`, CHANGELOG ręcznie, tag                                                                                                                                       | jedna paczka, rzadkie wydania                                                                                                    | (O)                                                                             |

- **F** SemVer: „Major version zero (0.y.z) is for initial development. Anything MAY change at any time.”; wersja główna rośnie przy każdej niekompatybilnej zmianie publicznego API; zalecany start od 0.1.0. Źródło: https://semver.org/ (2.0.0).
- **O** W bibliotece UI publiczne API to nie tylko propsy i ścieżki `exports`. Obejmuje też nazwy tokenów CSS, atrybuty `data-*`, warstwy CSS i strukturę DOM, na której opiera się stylowanie konsumenta. Zmianę wyglądu bez zmiany API zwykle traktuje się jako minor lub patch. Opinia, nie norma.
- **W** Właściciel już wymusza `type(scope): opis` hookiem `conventional-pre-commit` i squash merge (`MangaShift/AGENTS.md`, `agents/presets/hooks/README.md`). release-please czyta dokładnie ten format, changesets dokłada drugi rytuał.

**R** Do migracji pierwszego konsumenta: wersja `0.y.z` ręcznie, bez narzędzia, bo `link:` nie potrzebuje wersji. Przy pierwszej publikacji: release-please (jedna paczka, PR wydania) + krok `bun publish` w CI. Kryterium: zero nowych rytuałów dla autora. Do sprawdzenia przy wdrożeniu: domyślny tytuł PR wydania release-please ma scope, który musi być na zamkniętej liście `--scopes` (niesprawdzone).

## 7. Strona dokumentacji jako laboratorium

| narzędzie                      | baza                                            | strona tylko z Tessery                                                                                        | HMR            | MDX                                          | playground / `llms.txt`                                                      | źródło                                                                                                                    |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fumadocs                       | Next, React Router, TanStack Start, Waku, Astro | tak, jeśli `fumadocs-core` + `fumadocs-mdx` bez `fumadocs-ui` (strona sugeruje rozdzielność, nie mówi wprost) | bundlera hosta | `fumadocs-mdx`                               | `llms.txt`, `llms-full.txt`, `*.md` per strona, nagłówek `Accept`            | https://www.fumadocs.dev/docs, https://www.fumadocs.dev/docs/integrations/llms (2026-10-30, wersja niepodana)             |
| Fumadocs + React Router        | Vite                                            | jw.                                                                                                           | Vite           | jw.                                          | statyczny build przez SPA + `prerender`; wyszukiwanie liczone w przeglądarce | https://fumadocs.dev/docs/mdx/vite/react-router (wynik wyszukiwania + oficjalna domena)                                   |
| Nextra 4                       | tylko Next App Router                           | własny motyw                                                                                                  | Turbopack      | tak                                          | brak wzmianki o `llms.txt`                                                   | https://nextra.site/docs („Last updated on October 3, 2025”)                                                              |
| Starlight                      | Astro, React w wyspach                          | tylko wyspy                                                                                                   | Vite           | tak                                          | nie sprawdzałem                                                              | (**?** nie otwierałem docs)                                                                                               |
| Docusaurus                     | własny                                          | własny motyw                                                                                                  |                | tak                                          | nie sprawdzałem                                                              | (**?**)                                                                                                                   |
| Next 16 + `@next/mdx` (własna) | Next                                            | tak                                                                                                           | Turbopack      | tak                                          | skrypt `generate-llms`                                                       | Base UI `docs/package.json` (Next 16.4.3)                                                                                 |
| Vite + MDX (własna)            | Vite                                            | tak                                                                                                           | Vite           | `@mdx-js/rollup` (niesprawdzone w tej sesji) | ręcznie                                                                      | (W)                                                                                                                       |
| Storybook 10                   | Vite, ESM-only (od X 2025)                      | nie, to rama Storybooka                                                                                       | Vite           | tak                                          | Vitest addon w browser mode                                                  | https://storybook.js.org/blog/storybook-10/, https://storybook.js.org/docs/writing-tests/integrations/vitest-addon (10.3) |
| Ladle                          | Vite (tematy repo)                              | rama Ladle                                                                                                    | Vite           | nie                                          |                                                                              | https://github.com/tajo/ladle (status utrzymania nieustalony)                                                             |
| Histoire                       | Vite, nastawiony na Vue                         |                                                                                                               |                |                                              |                                                                              | (**?** nie sprawdzałem)                                                                                                   |

- **F** Playwright usunął pakiety `@playwright/experimental-ct-*`. Nowy model: strona galerii w `playwright/gallery/` serwowana przez własny dev server, pliki `*.story.*`, `window.mount({ story, props })`, fixture `mount('components/Button/Primary')`. Źródło: https://playwright.dev/docs/test-components (2026-10-30; strona radzi zostać na 1.62 do czasu migracji).
- **W** Laboratorium na stronie dokumentacji może być jednocześnie galerią dla Playwrighta. Jedna aplikacja zastępuje Storybooka, galerię v2 i fixture Next v2.

**R** Własna aplikacja **Next 16, `output: 'export'`**, w `apps/docs`, z MDX i własnymi komponentami Tessery. Opcjonalnie `fumadocs-core` + `fumadocs-mdx` dla drzewa stron, wyszukiwania i `llms.txt`, bez `fumadocs-ui`. Kryteria:

- dogfooding: strona składa się wyłącznie z Tessery, więc `fumadocs-ui`, Nextra, Starlight i Storybook odpadają jako rama;
- jeden link, statyczny deploy jak mangashift.com;
- Next sprawdza kontrakt `'use client'`/RSC i static export, który dziś pilnują osobne `next-fixture` v2;
- precedens Base UI (Next 16.4.3 + `@next/mdx` + `generate-llms`).

Kompromis: dev server Vite startuje szybciej, a desktop konsumuje przez Vite. Tę ścieżkę sprawdza jednak sam desktop, a Next jest jedynym konsumentem z RSC. Pomiaru HMR Turbopack kontra Vite w tym repo nie mam (**?**). Jeśli pomiar wyjdzie wyraźnie na korzyść Vite: Fumadocs na React Router z prerenderem, a kontrakt Next zostaje jako mała fixture.

## 8. Dostęp agentów AI do dokumentacji

| sposób                                     | kto stosuje (2025–2026)                                                                                                                                                 | koszt utrzymania                              | źródło                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| markdown w paczce + `AGENTS.md` konsumenta | Next.js: docs w `node_modules/next/dist/docs/` od 16.2, zarządzany blok w `AGENTS.md` od 16.3; badanie Vercela: 100% przy bundlowanych docs wobec maks. 79% przy Skills | niski: te same pliki co strona                | https://nextjs.org/docs/app/guides/ai-agents (lastUpdated 2026-10-15) |
| `llms.txt` + `*.md` per strona             | Next.js (`/docs/llms.txt`, `llms-full.txt`, `.md` per strona, `Accept: text/markdown`), Fumadocs wbudowane, Base UI `generate-llms`                                     | niski przy generatorze                        | https://llmstxt.org/ (J. Howard, 2024-09-03, zm. 2026-08-10)          |
| shadcn registry + MCP                      | `npx shadcn@latest mcp`; działa z każdym registry zgodnym ze specyfikacją, także prywatnym (nagłówki z tokenem)                                                         | średni: registry JSON i model kopiowania kodu | https://ui.shadcn.com/docs/mcp (brak daty)                            |
| własny serwer MCP                          | Ark UI (`packages/mcp`)                                                                                                                                                 | wysoki                                        | https://github.com/chakra-ui/ark                                      |
| Context7                                   | Radix ma `context7.json` w korzeniu                                                                                                                                     | niski, ale zależy od zewnętrznej usługi       | https://github.com/radix-ui/primitives                                |
| skille w repo                              | HeroUI (`skills/`, `prompts/`), shadcn (`skills/`), Next.js (`skills/` na skills.sh)                                                                                    | średni                                        | strony repo (2026-10-30)                                              |

- **L** v2 już wysyła `docs/` w paczce (`files`) i generuje tabele API w `docs/<nazwa>.md` (`scripts/generate-docs.ts`).
- **F** Next.js: wiedza o frameworku pochodzi z bundlowanych docs; Skills służą wieloetapowym workflow, nie lookupom. Źródło: jw.

**R** Markdown per element w `packages/tessera/docs/`, wysyłany w paczce. Strona renderuje te same pliki (jedno źródło). Generator robi z nich `llms.txt` i `*.md` na stronie. Konsument dostaje w swoim `AGENTS.md` jedną linię: „Przed użyciem komponentu Tessery przeczytaj `node_modules/@mattymroz/tessera/docs/<nazwa>.md`”. Kryteria: najprostsze, wersja docs zgodna z zainstalowaną paczką, zero usług. MCP, registry i CLI odrzucam (YAGNI), bo Tessera to paczka, a nie kod kopiowany do projektu. Przy okazji: usunąć martwy wpis `skills` z `files` (L).

## 9. Testy biblioteki

| narzędzie                  | stan                                                                                                                                                    | do czego                                                                                                                                     | źródło                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Vitest browser mode        | stabilny od Vitest 4 (ogłoszenie 2025-10-22); dostawca jako osobna paczka `@vitest/browser-playwright`; render przez `vitest-browser-react`; docs 5.0.5 | komponenty w prawdziwym Chromium; `userEvent` przez CDP/WebDriver                                                                            | https://vitest.dev/guide/browser/ (5.0.5), https://main.vitest.dev/blog/vitest-4 (przez wynik wyszukiwania)   |
| Vitest `toMatchScreenshot` | od Vitest 4, API może się zmieniać                                                                                                                      | wzorce w `__screenshots__` obok testu, nazwa z przeglądarką i platformą; „sensitive to environmental differences”; zalecany jednolity runner | https://vitest.dev/guide/browser/visual-regression-testing (5.0.5)                                            |
| jsdom / happy-dom          | nadal w użyciu                                                                                                                                          | logika i render bez układu                                                                                                                   | HeroUI jsdom 30.1.3 + osobny projekt browser; Ark happy-dom 21.0.4; Base UI jsdom domyślnie                   |
| Playwright na galerii      | stabilny (`fixtures.mount`)                                                                                                                             | e2e, interakcje, zrzuty, wiele przeglądarek                                                                                                  | https://playwright.dev/docs/test-components                                                                   |
| Chromatic                  | free 5000 snapshotów/mies., potem pauza; ceny płatnych planów się rozjeżdżają                                                                           | wizualne w chmurze                                                                                                                           | https://chromatic.com/pricing (przez wyszukiwanie; konflikt cen Starter 149 vs 179 USD)                       |
| Lost Pixel                 | nie sprawdzałem                                                                                                                                         |                                                                                                                                              | (**?**)                                                                                                       |
| axe                        | `vitest-axe` (Ark), `@storybook/addon-a11y` (Ark), `@axe-core/playwright`: `new AxeBuilder({ page }).analyze()`; wersja śledzi axe-core, bez SemVer     | a11y                                                                                                                                         | Ark `packages/react/package.json`, https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright |

- **L** v2 ma projekty Vitest `unit` (jsdom) i `dist` (node, kontrakty zbudowanego `dist`), Playwright w Chromium i WebKit z `--workers=1` oraz benchmarki w `test/perf`.
- **L** Pamięć właściciela: Playwright tylko headless, testy lekko, bo komputer się zacina (MEMORY.md, „Testy i makiety”).

**R**

- **Vitest, projekt `unit` w środowisku node** dla czystych funkcji (silniki stylu, przepisy, `lib/`), bez DOM. Najtańszy i najszybszy.
- **Vitest, projekt `browser`** (`*.browser.test.tsx`, Chromium headless, `@vitest/browser-playwright`) dla komponentów, wzorem HeroUI. Prawdziwy układ zamiast jsdom: przy bibliotece, której priorytetem jest wydajność i CSS, jsdom nie widzi ani layoutu, ani kaskady.
- **Playwright na galerii strony** (`apps/docs`) dla e2e, zrzutów (`toHaveScreenshot`) i `@axe-core/playwright`. Jedna przeglądarka lokalnie, wzorce generowane tylko na Windows właściciela; WebKit świadomie, bo Tauri na macOS używa WebKit.
- **Kontrakt `dist`** jako jeden test node na zbudowanym pakiecie (`exports` się rozwiązują, `'use client'` jest tam, gdzie trzeba, brak efektów ubocznych przy imporcie), jak projekt `dist` w v2.
- Chromatic dopiero, gdy zrzuty zaczną się rozjeżdżać między maszynami; dziś jest jedna maszyna.

## 10. Lokalne presety repo `agents`

Co przeczytałem: `agents/AGENTS.md`, `presets/git/README.md` + `assets/universal.gitignore`, `presets/hooks/README.md` + `assets/pre-commit-config.yaml` + `references/commit-message.md`, `presets/hooks-agents/README.md`, `scripts/standard.py` (nagłówek, stałe, `_check_*`), `.pre-commit-hooks.yaml`.

| element                   | pasuje do repo bun/TS? | uwagi (L)                                                                                                                                                                                                                               |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `universal.gitignore`     | tak                    | sekcja „Node / Bun / Vite” ignoruje `node_modules/`, `dist/`, `out/` (wynik `next export`), `.next/`, `*.tsbuildinfo`, `next-env.d.ts`, `coverage/`; `bun.lock` jest w „Final invariants”                                               |
| ↳ binaria                 | **konflikt**           | `*.png` i `*.webp` są ignorowane; wyjątki obejmują tylko `assets/`, `public/`, `docs/`, `fixtures/`. Wzorce zrzutów (`__screenshots__/` w Vitest, `*-snapshots/` w Playwright) wypadną z gita bez wpisu w sekcji „Re-includes”          |
| ↳ `tmp/`, `temp/`         | tak                    | zgodne z regułą `tmp`                                                                                                                                                                                                                   |
| `universal.gitattributes` | tak                    | LF, lockfile jako `linguist-generated`                                                                                                                                                                                                  |
| hooks CORE                | tak                    | whitespace, EOF, `mixed-line-ending --fix=lf`, `check-json` z wykluczeniem `tsconfig*.json` i `biome.json`, `check-illegal-windows-names`, `typos` (bez `.md`)                                                                          |
| `conventional-pre-commit` | tak                    | trzeba ustalić zamkniętą listę scope'ów dla Tessery (np. `engine`, `recipe`, `component`, `docs`, `build`, `test`, `repo`)                                                                                                              |
| OWN STANDARDS             | częściowo              | `commit-validation` stack-agnostyczny (środowisko Pythona buduje runner); `no-test-prose` obejmuje `.ts`/`.tsx`; `const-docstrings` tylko `types: [python]`, w repo TS martwy, więc do usunięcia (README: „hook musi mieć co pilnować”) |
| MARKDOWN (`mdformat`)     | częściowo              | formatuje `.md`; `.mdx` strony nie (**?** zachowanie na MDX niesprawdzone)                                                                                                                                                              |
| FRONTEND                  | **za mało**            | jeden hook: `biome-check`. Brak odpowiednika PYTHON-owych pre-push (`mypy`, `lint-imports`, `pytest`): nie ma typecheck, lint, vitest ani build na pre-push                                                                             |
| `prek`                    | tak                    | `bun add -D @j178/prek` jest w README presetu                                                                                                                                                                                           |
| `hooks-agents/guard.sh`   | tak, globalny          | blokada `git worktree remove` przy linkach wychodzących poza worktree; `link:` do Tessery w konsumencie to taki link                                                                                                                    |
| `standard.py`             | tak                    | sprawdza presety git, dwa hooki, `AGENTS.md` bez `CLAUDE.md`, `.agent-skills`, `.claude/settings.json` (`disableClaudeAiConnectors`, zakaz kluczy luzujących), `.worktrees/.gitkeep`, `main`; nic nie zależy od Pythona w projekcie     |

Czego brakuje dla repo bun/TS (W):

1. **Blok FRONTEND z pre-push:** `bun run typecheck`, `bun run lint`, `bunx vitest run --project unit`, `bun run build` (paczka), wzorem bloku PYTHON (`language: system`, `pass_filenames: false`, `stages: [pre-push]`).
2. **Decyzja ESLint czy Biome.** Preset zakłada Biome; MangaShift i v2 Tessery używają ESLint z własną wtyczką (`tessera.configs.recommended`, `no-local-appearance`). Dwa formattery w jednym repo to dwa źródła prawdy. Ark i Park używają Biome (F, repo jw.).
3. **Wyjątek `.gitignore` na wzorce zrzutów** w sekcji „Re-includes” (`!**/__screenshots__/**/*.png` albo `!**/*-snapshots/**/*.png`, z katalogami najpierw, zgodnie z regułą presetu).
4. **Kontrola paczki przed publikacją:** sprawdzenie `exports`, `files` i typów (`bun pm pack --dry-run`, kandydaci: publint, attw; niesprawdzone w tej sesji). W presetach nic takiego nie ma, bo `agents` nie publikuje na npm.
5. **Szablon CI dla bun** (setup bun, `bun install --frozen-lockfile`, bramki). `presets/hooks` ma tylko CI wiadomości commitów.
6. **Scope'y release-please** na liście `conventional-pre-commit`, jeśli wejdzie release-please (punkt 6).

## Proponowane drzewo repo `PROJECTS/tessera`

```text
tessera/
├── AGENTS.md                  # jedyny plik instrukcji (standard.py)
├── README.md
├── LICENSE                    # treść = decyzja właściciela
├── package.json               # "workspaces": { "packages": ["packages/*","apps/*"], "catalog": {...} }, "packageManager": "bun@1.4.x"
├── bun.lock
├── tsconfig.base.json         # strict; "customConditions": ["source"]
├── eslint.config.js           # albo biome.json, nie oba
├── .pre-commit-config.yaml    # CORE + conventional + OWN (bez const-docstrings) + FRONTEND z pre-push
├── .gitignore                 # universal + wyjątek na wzorce zrzutów
├── .gitattributes
├── .agent-skills
├── .claude/settings.json
├── .worktrees/.gitkeep
├── .github/workflows/ci.yml
├── scripts/                   # generatory dzielone przez całe repo (docs API, llms.txt, kolory)
├── packages/
│   └── tessera/
│       ├── package.json       # exports: {"source": src, "types": dist .d.ts, "default": dist .js}, sideEffects: ["**/*.css"], files: ["dist","docs"]
│       ├── tsdown.config.ts   # unbundle, esm, dts, watch dla zewnętrznych konsumentów
│       ├── vitest.config.ts   # projekty: unit (node), browser (chromium), dist (node)
│       ├── README.md
│       ├── docs/              # <element>.md: źródło strony, docs w node_modules i llms.txt
│       ├── src/
│       │   ├── engines/       # silniki stylu
│       │   ├── recipes/       # przepisy
│       │   ├── components/    # cienkie komponenty <nazwa>.tsx + <nazwa>.css
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── styles/        # tokens.css (:root), tessera.css (@layer components), tailwind.css (@theme inline)
│       └── test/              # *.test.ts (unit), *.browser.test.tsx, dist/
└── apps/
    └── docs/                  # Next 16 static export: dokumentacja = laboratorium
        ├── app/               # strony z MDX; komponenty wyłącznie z @mattymroz/tessera
        ├── gallery/           # strona mount() dla Playwrighta + *.story.tsx
        ├── playwright.config.ts
        └── tests/             # e2e, toHaveScreenshot, axe
```

Celowo bez: Turbo, Storybooka, `clean-package`, osobnych fixture Next, strażnika buildu, MCP, registry i katalogu `skills/` w paczce.

## Sprzeczności i niewiadome

| temat                                            | stan                                                                                                                   | co rozstrzygnie                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| podwójny React przy `link:` w Next/Turbopack     | brak udokumentowanego dedupe w Turbopacku (**?**)                                                                      | spike: `turbopack.resolveAlias` albo instalacja Reacta w Tesserze tylko jako peer + devDependency laboratorium w workspace |
| HMR Vite i Next przy `dist` spoza korzenia       | docs Vite nie mówią o symlinkach spoza korzenia; Next wymaga roota lub eksperymentalnych dodatkowych korzeni (od 16.4) | spike na desktopie i stronie                                                                                               |
| `bun link` na Windows: symlink czy junction      | docs mówią „symlink”, bez Windows                                                                                      | `bun link` w pustym katalogu + `fsutil reparsepoint query`                                                                 |
| `@theme` bez `static` a `var()` w CSS biblioteki | docs: emitowane tylko użyte zmienne                                                                                    | test w laboratorium; omija go rekomendacja „tokeny w `:root`”                                                              |
| tsdown i `'use client'`                          | docs nie opisują; v2 działa z `moduleLevelDirective: false` (L)                                                        | test kontraktu `dist`                                                                                                      |
| ceny Chromatic                                   | konflikt źródeł (149 vs 179 USD Starter)                                                                               | strona cennika w dniu decyzji; dziś nieistotne                                                                             |
| JSR a pliki CSS                                  | docs milczą                                                                                                            | odpada, jeśli nie JSR                                                                                                      |
| bun a `prepare` zależności z gita                | docs nie mówią                                                                                                         | odpada, jeśli nie git                                                                                                      |
| Starlight, Docusaurus, Histoire, Lost Pixel      | nie otwierałem źródeł                                                                                                  | rekomendacja ich nie potrzebuje (odpadają na kryterium dogfoodingu albo nie są potrzebne)                                  |

## Decyzje właściciela (nie rozstrzygam)

1. Publiczna czy prywatna paczka i kanał (npm publiczny, npm płatny, GitHub Packages z tokenem także do instalacji, sam `link:`/git).
2. Licencja: MIT, zastrzeżona (`UNLICENSED` / `SEE LICENSE IN`) albo inna.
3. ESLint czy Biome.
4. Next czy Vite dla `apps/docs`, po pomiarze HMR (rekomenduję Next).

## Źródła

Lokalne (odczyt 2026-10-30):

- `C:\Users\MattyMroz\Desktop\PROJECTS\agents\AGENTS.md`
- `agents/presets/git/README.md`, `agents/presets/git/assets/universal.gitignore`
- `agents/presets/hooks/README.md`, `agents/presets/hooks/assets/pre-commit-config.yaml`, `agents/presets/hooks/references/commit-message.md`, `agents/.pre-commit-hooks.yaml`
- `agents/presets/hooks-agents/README.md`
- `agents/scripts/standard.py` (linie 1-120)
- `MangaShift/tessera/AGENTS.md`, `MangaShift/tessera/packages/tessera/package.json`, `MangaShift/tessera/packages/tessera/tsdown.config.ts`

Zewnętrzne (dostęp 2026-10-30):

- https://github.com/shadcn-ui/ui ; https://ui.shadcn.com/docs/monorepo ; https://ui.shadcn.com/docs/mcp
- https://github.com/radix-ui/primitives
- https://github.com/mui/base-ui ; https://raw.githubusercontent.com/mui/base-ui/master/docs/package.json ; https://raw.githubusercontent.com/mui/base-ui/master/vitest.shared.mts
- https://github.com/chakra-ui/ark ; https://raw.githubusercontent.com/chakra-ui/ark/main/package.json ; https://raw.githubusercontent.com/chakra-ui/ark/main/packages/react/package.json (5.40.0)
- https://github.com/chakra-ui/park-ui
- https://github.com/adobe/react-spectrum
- https://github.com/mantinedev/mantine
- https://github.com/heroui-inc/heroui (v3) ; https://raw.githubusercontent.com/heroui-inc/heroui/v3/packages/react/package.json ; https://raw.githubusercontent.com/heroui-inc/heroui/v3/packages/styles/package.json ; https://raw.githubusercontent.com/heroui-inc/heroui/v3/packages/react/vitest.config.ts ; https://www.heroui.com/docs/react/getting-started/quick-start
- https://tsdown.dev/guide/ ; https://tsdown.dev/options/css ; https://tsdown.dev/options/unbundle ; https://tsdown.dev/options/package-exports ; https://tsdown.dev/recipes/react-support (0.23.4)
- https://github.com/egoist/tsup
- https://bun.com/docs/bundler ; https://bun.com/docs/pm/cli/link ; https://bun.com/docs/pm/cli/publish ; https://bun.com/docs/pm/scopes-registries ; https://bun.com/docs/pm/cli/install ; https://bun.com/docs/pm/catalogs (Bun 1.4.4)
- https://tailwindcss.com/docs/detecting-classes-in-source-files ; https://tailwindcss.com/docs/theme ; https://tailwindcss.com/docs/adding-custom-styles ; https://tailwindcss.com/docs/preflight ; https://github.com/tailwindlabs/tailwindcss/discussions/19118
- https://catalyst.tailwindui.com/docs ; https://tailwindcss.com/plus/ui-kit
- https://vite.dev/guide/dep-pre-bundling ; https://vite.dev/config/server-options (8.3.4) ; https://github.com/vitejs/vite/pull/6591
- https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack (2026-09-24) ; https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages (2026-05-27) ; https://nextjs.org/docs/app/guides/ai-agents (2026-10-15)
- https://react.dev/link/invalid-hook-call
- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry
- https://docs.npmjs.com/about-private-packages ; https://docs.npmjs.com/cli/v11/configuring-npm/package-json ; https://npmjs.com/pricing (403, ceny z wyników wyszukiwania)
- https://jsr.io/docs/npm-compatibility
- https://github.com/googleapis/release-please ; https://github.com/changesets/changesets ; https://semver.org/
- https://www.fumadocs.dev/docs ; https://www.fumadocs.dev/docs/integrations/llms ; https://fumadocs.dev/docs/mdx/vite/react-router ; https://nextra.site/docs
- https://storybook.js.org/blog/storybook-10/ ; https://storybook.js.org/docs/writing-tests/integrations/vitest-addon ; https://github.com/tajo/ladle
- https://llmstxt.org/
- https://vitest.dev/guide/browser/ ; https://vitest.dev/guide/browser/visual-regression-testing (5.0.5) ; https://main.vitest.dev/blog/vitest-4
- https://playwright.dev/docs/test-components
- https://chromatic.com/pricing ; https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
