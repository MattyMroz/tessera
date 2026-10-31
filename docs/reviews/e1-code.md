---
kind: review
status: fail
reviewed-state: working tree C:\Users\MattyMroz\Desktop\PROJECTS\tessera przed pierwszym commitem, 2026-10-31 01:20–01:28
date: 2026-10-31
---

# Review: kod i paczka Tessery po E1

## Zakres

- przedmiot: `packages/tessera` (konfiguracja, `src/lib/compose-refs*`, `src/styles/tessera.css`, `src/eslint/**`, `test/dist/`, `test/guards/`), `apps/docs/**`, korzeń (`package.json`, `tsconfig.base.json`, `eslint.config.js`), CI w zakresie bramki;
- baseline: v2 `MangaShift/tessera/packages/tessera` na `refactor/tessera-motion`;
- authority: `docs/plans/e1-repo.md` (kroki 2–6), `docs/specification.md` (U14–U17, F7, F14, Q13, I1–I4, Z1, Z3, Z8, S4, linia 107: „Przeniesienie = przepisanie na model v3, bez starych nazw”), `docs/decisions/e1-source-condition.md`;
- ryzyka: strażnik warstw, który przepuszcza wygląd; test `dist`, który daje fałszywy PASS; React Compiler, który nie działa; ślady v2;
- poza review: dokumenty (osobne review `e1-docs.md`), krok 1 (`standard.py`, `prek`), krok 8 (dwa repo), świeży klon (nie ma commita).

## Werdykt

**Status:** FAIL

**Najważniejszy powód:** strażnik warstw (krok 4, S4) przepuszcza kolor, liczbę, promień i obcą zmienną w CSS komponentu i przepisu po jednej zmiennej pośredniej, a test `dist` (krok 3) przepuszcza zbudowany komponent z handlerem bez `'use client'`. Oba obalone sondą. Do tego bramka `bunx vitest run` w korzeniu nie używa konfiguracji paczki i zbiera testy z `.worktrees/`.

`bun run check` przechodzi (potwierdzone), React Compiler w buildzie działa (potwierdzone sondą).

## Findings

### Poważne

#### P1. Strażnik warstw CSS da się obejść jedną zmienną `--_*`, fallbackiem `var()` albo plikiem poza trzema folderami

- miejsce:

  - `packages/tessera/test/guards/css-layers.ts:91-94`: wartość zmiennej `--_*` nie jest sprawdzana (`continue`), także w komponentach, choć Z1 zakazuje tam lokalnych zmiennych wyglądu;
  - `:65-68`: `var(--x, <fallback>)` jest wycinany w całości, więc fallback nie jest sprawdzany;
  - `:85-90`: w `engines/` sprawdzane są tylko zmienne, a zwykłe deklaracje (`background`, `border-radius`, `transition`) przechodzą bez kontroli;
  - `:112-115`: skanowane są tylko `engines/`, `recipes/` i `components/`; `styles/` (gdzie U15 kładzie CSS komponentów) i `@import` z komponentu nie są sprawdzane;
  - `:35-60`: preludia at-rules (`@media (min-width: 640px)`, `@import`) nie są sprawdzane;
  - `:75`: liczby niecałkowite, ujemne, `%`, `fr` i `!important` są dozwolone także w komponencie.

- dowód: sonda poza repo (`checkLayers` na drzewie z 16 próbami obejścia) zgłosiła tylko 2 (`transition: width …` w przepisie i `padding-inline` w komponencie). Przeszły m.in.:

  ```css
  /* components/button/button.css */
  --_bg: hotpink;  --_gap: 13px;  gap: var(--_gap);
  width: var(--size-h, 999px);  display: none !important;
  order: 99;  grid-template-columns: 37% 1fr;
  @media (min-width: 640px) { … }  @import "../../styles/look.css";
  /* recipes/control.css */
  --_c: var(--brand-blue);  color: var(--_c);
  --_h: 28px;  height: var(--_h);  background: var(--color-surface, red);
  /* engines/color/color.css */
  .ts-button { background: red; border-radius: 9px; transition: width 300ms; }
  /* styles/look.css */
  .ts-button { background: red; }
  ```

  Przypadek z fixture `bad` (`color: var(--brand-blue)`) przechodzi po jednej zmiennej pośredniej. Także `gap: calc(var(--space-2) * 1.5)` przechodzi, bo `1.5` jest dozwolone.

- wpływ: S4 („test warstw oblewa celowo dodany kolor, promień, cień, ruch i liczbę w CSS komponentu”) nie jest spełnione dla kolorów, promieni, czasów i liczb podanych przez zmienną `--_*`. F7, I1 i Z1 nie mają strażnika. To główny produkt kroku 4 E1.

- minimalna reakcja:

  - wartość `--_*` sprawdzać tą samą białą listą co deklaracje, a w `components/` zakazać `--_*` (Z1);
  - sprawdzać fallbacki `var()`;
  - w `engines/` dopuszczać tylko deklaracje zmiennych (tak robił v2: `test/dist/css-layers.test.ts`, „allows only custom property declarations in value files”);
  - skanować każdy `src/**/*.css` i każdemu przypisywać warstwę albo regułę;
  - sprawdzać preludia at-rules w komponentach;
  - w komponentach zakazać `!important` i liczb poza `0`;
  - każde obejście dodać do fixture `bad`.

  Route: IMPLEMENTATION BUG.

#### P2. Test `dist` może dać fałszywy PASS w trzech z czterech asercji

- miejsce: `packages/tessera/test/dist/package.test.ts:45-53` (`'use client'`), `:17-23` (eksporty z `*`), `:39-43` (efekty uboczne), `:32-37` (typy).

- dowód:

  - `'use client'`: sonda z identyczną konfiguracją tsdown i React Compilerem zbudowała `export function Plain({ onPick, label }) { return <button onClick={() => onPick(label)}>…` do modułu z `import { c } from "react/compiler-runtime"`, `c(6)` i `onClick: t1`, bez dyrektywy. Regex testu dał `client false, needsClient false`, czyli PASS. U16 wymaga `'use client'` w plikach z handlerami. Regex nie zna też `use(`, `useId`, `useTransition`, `useImperativeHandle`, własnych hooków ani `c()` kompilatora.
  - eksporty z `*`: `targets()` wylicza pliki z `dist/lib`, a potem sprawdza, czy istnieją w `dist/lib`. Dla wzorca to tautologia: plik `src/lib/*.ts`, który nie trafił do builda, jest niewidoczny. Cele `source` nie są sprawdzane w ogóle.
  - efekty uboczne: porównuje tylko enumerowalne klucze `globalThis`; `setTimeout`, `queueMicrotask`, `Object.defineProperty(globalThis…)` czy zmiana prototypu przechodzą.
  - typy: plik `.d.ts` jest zgadywany przez `.js → .d.ts`, a nie czytany z `exports[…].types`, więc literówka w `types` przechodzi.
  - v2 miał mocniejsze kontrakty (`test/dist/use-client.test.ts`: dyrektywa ze źródła ↔ prolog w `dist`; `side-effects.test.ts`: proxy DOM, timerów i storage), a spec (tabela „Przenoszone z v2”) każe przenieść `test/dist/*`.

- wpływ: krok 3 obiecuje „kontrakt: exports się rozwiązują, `'use client'` gdzie trzeba, brak efektów ubocznych JS”, a test tego nie wykryje. Pierwszy komponent z handlerem bez dyrektywy przejdzie CI i wybuchnie w RSC u konsumenta Next.

- minimalna reakcja:

  - przenieść z v2 `use-client.test.ts` (źródło decyduje, `dist` musi zachować prolog) i `side-effects.test.ts`;
  - wzorce `*` rozwijać z `src`, nie z `dist`;
  - sprawdzać `source` i `types` z manifestu oraz brak eksportu `.`.

  Route: IMPLEMENTATION BUG.

#### P3. `bunx vitest run` w korzeniu nie używa `packages/tessera/vitest.config.ts` i zbiera testy z `.worktrees/`

- miejsce: `package.json:20` (`check` → `bunx vitest run` w korzeniu, brak `vitest.config.*` w korzeniu); `packages/tessera/vitest.config.ts:5-8`; `.pre-commit-config.yaml:128-133`; CI przez `check`.
- dowód:
  - `bunx vitest run --project dist` w korzeniu kończy się błędem „No projects matched the filter "dist"”. Z katalogu paczki ten sam zestaw biegnie w projektach;
  - sonda z vitest 5.0.5 z repo, w drzewie z `a.test.ts`, `.worktrees/feature/pkg/b.test.ts` i `apps/docs/out/c.test.ts`, uruchomiła wszystkie trzy pliki.
- wpływ:
  - projekty `unit` i `dist` są martwą konfiguracją;
  - gdy istnieje worktree (AGENTS.md: praca w `.worktrees/<nazwa>`), `bun run check` i pre-push w głównym checkoucie odpalają testy innego brancha, w tym testy `dist` na jego `dist` albo bez niego. Bramka zależy wtedy od stanu cudzego worktree.
- minimalna reakcja: `vitest.config.ts` w korzeniu z `test: { projects: ['packages/*'] }`, żeby konfiguracja paczki była jedynym źródłem `include`. Route: INTEGRATION BUG.

#### P4. `no-local-css` z `allowCssEntry` odrzuca jedyny działający plik wejściowy konsumenta v3

- miejsce: `packages/tessera/src/eslint/no-local-css.ts:10` (`ENTRY` = cały plik to dokładnie jeden `@import "@mattymroz/tessera/tessera.css";`), `:15`, `:26`.
- dowód:
  - sonda (ESLint z repo, wtyczka z `dist`) na `globals.css` z `@import "tailwindcss"; @import "@mattymroz/tessera/tessera.css"; @import "@mattymroz/tessera/tailwind.css";` zwraca `tessera/no-local-css: Local CSS is not allowed. A CSS entry … holds only @import "@mattymroz/tessera/tessera.css";`;
  - w v2 reguła działała, bo `globals.css` v2 sam importował `tailwindcss`. W v3 komponenty nie używają Tailwinda (U14), a paczka ma dwa wejścia (U15), więc aplikacja musi sama zaimportować `tailwindcss` i `tailwind.css` w jednym pliku CSS (`@theme inline` działa tylko w tej samej kompilacji Tailwinda).
- wpływ: pierwszy konsument (desktop) albo wyłącza regułę, albo nie ma Tailwinda; F14 jest wtedy dziurawe. Rename `globals.css` → `tessera.css` przeniósł regułę na model v2.
- minimalna reakcja: `ENTRY` jako biała lista importów (`tailwindcss`, `@mattymroz/tessera/tessera.css`, `@mattymroz/tessera/tailwind.css`, w ustalonej kolejności), z testem na trzy linie. Decyzja razem z brakującym `tailwind.css` (`e1-docs.md` P3). Route: DESIGN FLAW (reguła), zależna od U15.

#### P5. Reguły ESLint skopiowane 1:1 z v2, a nie przepisane na model v3

- miejsce:

  - `src/eslint/style-policy.ts:106-121` i `no-local-appearance.ts:11,60-62,71-74`: tryb `library` (klasy `cn-*`, odczyty `(--radix-*)`, wymiary w klasach Tailwinda w `cva`);
  - `style-policy.ts:131-142` i `no-local-appearance.ts:59,75`: `typeset*`, `--typeset-*` (shadcn Typeset z v2);
  - `no-data-theme.ts:19,21`: „Use the dark class and useTheme() from Tessera”;
  - `no-local-appearance.ts:9`: „Gallery pages”;
  - `no-local-css.ts:15`: `./globals.css`;
  - `rules.test.ts:343`: `const token = "--accent-bright"`, martwy fragment po `no-legacy-tokens`, którego żadna reguła już nie zgłasza.

- dowód: `diff` v2 ↔ v3 dla `src/eslint/*`: poza usunięciem `no-legacy-tokens` różnice to tylko `globals.css` → `tessera.css` i dwa `?? ''` pod `noUncheckedIndexedAccess`. Spec linia 107: „Przeniesienie = przepisanie na model v3, bez starych nazw”; AGENTS.md:24; Z3. W v3 komponenty nie mają klas Tailwinda (U14), Radix wypada (U18), motyw to atrybuty `data-*` (Q8), a `useTheme()` i klasa `dark` w v3 nie istnieją.

- wpływ:

  - publiczny typ `AppearanceOptions` dokumentuje model v2;
  - `no-data-theme` w `recommended` zakazuje `data-theme`, choć v3 nie rozstrzygnęło, czy motyw nie będzie właśnie tym atrybutem (Q8), i odsyła do nieistniejącego API;
  - około 1/3 testów reguł (tryb `library`, `typeset`) pilnuje martwego kontraktu.

- minimalna reakcja: konflikt plan (krok 5: „przeniesione z v2”) ↔ spec (przepisanie) do decyzji prowadzącego. Rekomendacja:

  - usunąć `library`, `libraryHook`, `libraryValue`, `RADIX_READ` i `typeset*` z testami;
  - `no-data-theme` wyjąć z `recommended`, dopóki E2 nie ustali mechanizmu motywu, albo przepisać komunikat na API v3;
  - usunąć `--accent-bright` z testu.

  Route: REQUIREMENT/PLAN CONFLICT.

### Mniejsze

- **M1. Nic w repo nie pilnuje React Compilera.** Sonda potwierdza, że działa: `counter.tsx` → `c(6)` z `react/compiler-runtime`, `useMemo` w hooku `.ts` usunięty przez kompilator, `'use client'` zostaje w pierwszej linii. Ale `dist` nie ma dziś żadnego modułu po kompilatorze (`grep compiler-runtime dist` = 0), a wyłączenie wtyczki niczego nie zepsuje. Q13 (testy na wersji skompilowanej i nieskompilowanej) jeszcze nie istnieje. Reakcja: przy pierwszym komponencie asercja w `test/dist` (moduł komponentu importuje `react/compiler-runtime`).
- **M2. Wtyczka konsumenta nie działa nigdzie w repo.** `eslint --print-config` dla pliku paczki pokazuje 0 reguł `tessera/*`, a `eslint.config.js:9-13` nie stosuje `configs.recommended` do `apps/docs`, choć laboratorium ma być zbudowane wyłącznie z Tessery (U19, U20, F14). Reakcja: blok `files: ['apps/docs/**']` z `recommended`.
- **M3. Martwa zależność `@types/babel__core` ^7.20.5** (`packages/tessera/package.json:42`): nic nie importuje `@babel/core`, a Babel 8 ma własne typy (`@babel/core/lib/index.d.ts`).
- **M4. Wersje wspólne poza `catalog:`.** `eslint ^10.14.0` jest osobno w korzeniu i w paczce; `@typescript-eslint/parser` i `rule-tester` są przypięte na `8.72.1`, a `typescript-eslint` ma `^8.72.1`. Mogą się rozjechać (AGENTS.md:27).
- **M5. `src/styles/tessera.css:1-3`.** Komentarz mówi „The single entry of the package” (sprzeczne z U15) i opisuje treść, której jeszcze nie ma (tokeny, przepisy). Pokrywa się z `e1-docs.md` P3.
- **M6. `test/guards/css-layers.ts:62-63`.** Komentarz jest nieprawdziwy: mówi o „unitless integer”, a regex przyjmuje ułamki, liczby ujemne i `!important`. Komentarze w helperze testu (`:16`, `:20`, `:62`) łamią regułę „helpery testów bez prozy” ze skilla `coding`.
- **M7. Biała lista układu komponentu szersza niż F7.** `css-layers.ts:21-29` dopuszcza `width`, `height`, `position`, `inset`, `cursor`, `user-select` i `pointer-events`. Zgadza się to z AGENTS.md:36 („rozmiar, pozycja”), ale nie z F7 („gap, wyrównanie, kolejność”). Konflikt spec ↔ AGENTS do decyzji, zanim powstanie pierwszy komponent.
- **M8. Duplikacja.** Dwie listy „właściwości układu” o różnej treści (`css-layers.ts:21-29` i `style-policy.ts:20-30`) to dwie wersje jednej reguły (I2); jeśli różnica jest celowa (padding i margin to układ u konsumenta, a wygląd w komponencie), trzeba ją nazwać. `ENGINES` (`css-layers.ts:4`) to druga kopia U7. `asNode` występuje dwa razy (`compositor-motion.ts:18`, `static-values.ts:14`), a `binding` i `constInit` to prawie ten sam spacer po scope (odziedziczone z v2).
- **M9. `compose-refs.test.ts` nie sprawdza odpięcia.** Brakuje przypadku, w którym React woła złożony ref z `null`, gdy żaden ref nie zwrócił cleanupu.
- **M10. AGENTS.md:9 i :58 opisują laboratorium czytające `src`.** Sprzeczne z U17 i decyzją `e1-source-condition.md`; pokrywa się z `e1-docs.md` P1, tu tylko odnotowane.

### Sugestie

- **S1.** W strażniku sprawdzać, że reguły z `recipes/` i `components/` trafiają do `@layer components` (v2 to sprawdzał), bo CSS spoza warstwy wygrywa z utility aplikacji (U15, I4). `!important` w warstwie odwraca pierwszeństwo warstw względem aplikacji: kolejny powód, by go nie dopuszczać.
- **S2.** Ciche bail-outy kompilatora: `eslint-plugin-react-hooks` 7 w `recommended` zgłasza diagnostykę kompilatora w lincie. Warto potwierdzić, że reguły kompilatora są w tym zestawie aktywne, zanim powstaną komponenty. Alternatywa to `panicThreshold` w buildzie.

## Zgodność z kontraktem

| Wymaganie                                           | Wynik | Dowód                                                                       |
| --------------------------------------------------- | ----- | --------------------------------------------------------------------------- |
| Krok 2, workspace i skrypty                         | pass  | `bun run check` exit 0                                                      |
| Krok 3, build ESM, plik na plik, dts                | pass  | 18 plików w `dist`, `compose-refs.js`, `.d.ts`                              |
| Krok 3, `tailwind.css` (U15)                        | fail  | brak pliku i eksportu (także `e1-docs.md` P3)                               |
| Krok 3, React Compiler (Q13 build)                  | pass  | sonda: `c(6)`, `react/compiler-runtime`                                     |
| Krok 3, test `dist`                                 | fail  | P2                                                                          |
| Krok 4, strażnik warstw (S4, F7, Z1)                | fail  | P1                                                                          |
| Krok 5, reguły bez `no-legacy-tokens`               | pass  | brak pliku i odwołań                                                        |
| Krok 5, przepisanie na model v3                     | fail  | P5, P4                                                                      |
| Krok 6, `next build` z `tessera.css` z `dist` (U17) | pass  | `out/_next/static/chunks/*.css` = `@layer theme,base,components,utilities;` |
| I4, jedna kolejność `@layer`                        | pass  | `tessera.css:4`, jedyne `@layer` w paczce                                   |
| Z8, bez pustych folderów                            | pass  | drzewo `src/`                                                               |
| Zero legacy                                         | fail  | P5, `rules.test.ts:343`                                                     |

## Wykonane kontrole

```text
bun run check (korzeń)                              exit 0; typecheck → lint → build → vitest: 4 pliki, 377 testów, 11.3 s
bunx vitest run --project dist (korzeń)             Startup Error: No projects matched the filter "dist"
cd packages/tessera && bunx vitest run              377 passed
sonda vitest: .worktrees/…/b.test.ts, out/…/c.test.ts   3 pliki uruchomione, w tym worktree i out
sonda checkLayers na 16 obejściach                  2 zgłoszone, 14 przepuszczonych
sonda React Compiler (tsdown + @rolldown/plugin-babel + babel-plugin-react-compiler, konfiguracja jak w repo)
                                                    komponent: c(6) i memo; hook: useMemo usunięty; 'use client' w 1. linii
sonda regex 'use client' z package.test.ts na skompilowanym komponencie z onClick   client false, needsClient false → PASS
sonda ESLint (wtyczka z dist) na 3-liniowym wejściu CSS z tailwindcss   no-local-css: error
eslint --print-config (plik paczki) | grep tessera  0
diff v2 src/eslint ↔ v3 src/eslint                  tylko rename globals→tessera, ?? '' i usunięty no-legacy-tokens
grep legacy/radix/typeset/useTheme/globals.css/gallery/accent-bright poza docs   trafienia w P5
```

Sondy powstały w `PROJECTS/tessera-probe/` (`build.mjs`, `src/`, `dist/`, `guard/`, `vt/`, `lint/`) i zostały usunięte. Folder `tessera-probe/motion/` istniał wcześniej i nie był ruszany.

## Niewykonane lub nierozstrzygające kontrole

- `bun run check` na świeżym klonie (S7): repo nie ma jeszcze commita.
- `bun run dev` (dwa procesy, zachowanie `next dev`, gdy `tsdown --watch` czyści `dist`): poza dozwolonymi komendami.
- CI na GitHubie, `prek run --all-files`, `standard.py check`: poza zakresem.
- Czy `c()` z `react/compiler-runtime` jest bezpieczne w RSC dla komponentu bez handlerów: nie sprawdzone; wpływa na to, które pliki potrzebują `'use client'`.
- Poprawność merytoryczna 366 przypadków `rules.test.ts`: uruchomione i zielone, nieprzeglądane przypadek po przypadku.

## Ograniczenia review

Review czyta stan roboczy bez commita; pliki mogły zmieniać się równolegle (np. `docs/reviews/e1-docs.md` powstał w trakcie). Ocena zgodności z planem opiera się na `e1-repo.md` ze statusem `active`.

## Zalecany następny krok

1. P1 i P2: naprawić strażnika i test `dist` (przeniesienie kontraktów z v2), każde obejście z tej recenzji jako fixture `bad`.
2. P3: `vitest.config.ts` w korzeniu z `projects`.
3. P4 i P5 z `tailwind.css`: decyzja prowadzącego (przepisać czy przenieść 1:1), potem jedna zmiana w `src/eslint/`.
4. Mniejsze przy okazji tych zmian; M7 do właściciela razem z F7.
