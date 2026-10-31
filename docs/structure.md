---
kind: specification
status: draft
updated: 2026-10-31
---

# Struktura repo Tessery v3

Drzewo docelowe po pierwszej rundzie komponentów i reguły, według których rośnie. Ustalenia, z których wynika, są w [specification.md](specification.md). Foldery powstają dopiero wtedy, gdy etap wkłada do nich pierwszy plik (Z8); pozycje oznaczone `(E2+)` jeszcze nie istnieją.

## Drzewo

```text
tessera/
├── AGENTS.md                      # instrukcje dla agentów (jedyny plik, bez CLAUDE.md)
├── README.md
├── LICENSE                        # (po N3) treść = decyzja właściciela
├── package.json                   # bun workspaces ["packages/*", "apps/*"] + catalog wspólnych wersji
├── bun.lock
├── tsconfig.base.json             # strict, customConditions: ["source"] (tylko TypeScript)
├── vitest.config.ts               # projects: ["packages/*"], żeby nie zbierać testów z .worktrees/
├── eslint.config.js               # ESLint (U34)
├── _typos.toml                    # wyjątki słownika hooka typos
├── .pre-commit-config.yaml        # preset agents: CORE, DATA FILES, SPELLING, MARKDOWN + FRONTEND (pre-push)
├── .gitignore / .gitattributes    # preset agents + wyjątek na wzorce zrzutów
├── .agent-skills
├── .claude/settings.json
├── .worktrees/.gitkeep            # worktree w repo, nie obok (preset agents)
├── .github/
│   ├── ISSUE_TEMPLATE/            # bug, feature, task, config
│   ├── pull_request_template.md   # Summary + Validation (preset agents)
│   └── workflows/ci.yml           # bun run check + prek + kształt commitów na main
├── docs/                          # dokumenty projektu (nie trafiają do paczki)
│   ├── specification.md           # jedyne źródło decyzji
│   ├── structure.md
│   ├── decisions/                 # wyniki pomiarów i prób, które rozstrzygnęły decyzję ze spec
│   ├── plans/                     # masterplan.md i kontrakt bieżącego etapu (eNN-<slug>.md)
│   ├── research/                  # raporty do decyzji; wykonany znika, wiedza przechodzi do kodu i AGENTS.md
│   └── reviews/                   # recenzje dokumentów i etapów
├── scripts/                       # (E2+) generatory: rampy kolorów, fonty, llms.txt, docs API
├── packages/
│   └── tessera/
│       ├── package.json           # exports: types/default → dist (source → src tylko dla TS); sideEffects: ["**/*.css"]
│       ├── tsdown.config.ts       # ESM, plik na plik, .d.ts, React Compiler, kopiuje CSS
│       ├── vitest.config.ts       # projekty: unit (node), package (node); browser (chromium) od E2
│       ├── docs/                  # (E2+) <element>.md: wysyłane w paczce, renderowane przez stronę
│       ├── src/
│       │   ├── engines/           # (E2+)
│       │   │   ├── color/         # color.css + color.ts (rampy w buildzie) + color.test.ts
│       │   │   ├── type/
│       │   │   ├── motion/
│       │   │   ├── space/
│       │   │   ├── size/
│       │   │   ├── shape/
│       │   │   ├── depth/
│       │   │   ├── state/
│       │   │   └── focus/
│       │   ├── recipes/           # (E2+) control.css, surface.css, row.css, indicator.css, focus.css
│       │   ├── themes/            # (E2+) mangashift.ts, mangashift-site.ts (wybory silników)
│       │   ├── components/        # (E2+)
│       │   │   └── <nazwa>/       # <nazwa>.tsx (+ własne zachowanie, gdy dostawca nie działa)
│       │   │                      # + opcjonalnie <nazwa>.css (tylko układ części)
│       │   ├── lib/               # kaskada wyborów, wspólne zachowanie i hooki (roving focus, przelot okienek, kolekcje)
│       │   ├── eslint/            # reguły konsumenta (no-local-css, no-local-appearance…)
│       │   └── styles/
│       │       ├── tessera.css    # wejście 1: kolejność @layer, tokeny silników, przepisy, CSS komponentów
│       │       └── tailwind.css   # (E2+) wejście 2: @theme inline, most tokenów do utility aplikacji
│       └── test/
│           ├── package/           # kontrakt zbudowanej paczki (nie dist/: preset .gitignore ignoruje każdy dist/)
│           └── guards/            # struktura, warstwy, wydajność, wyjątki ruchu
└── apps/
    └── docs/                      # Next 16, static export, czyta dist paczki: dokumentacja = laboratorium
        ├── app/                   # E1: layout.tsx + page.tsx; dalej (E2+):
        │   ├── engines/           # strona próbek każdego silnika
        │   ├── recipes/           # przepisy jako gołe bloki w kompozycji
        │   ├── components/        # strona komponentu: kilka sytuacji
        │   └── screens/           # ekrany testowe: settings, workbench, overlays, site
        ├── tests/                 # (E2+) Playwright: zrzuty, axe, trace ruchu, scena stress
        └── playwright.config.ts   # (E2+)
```

## Reguły wzrostu

Każda reguła ma strażnika: maszynę albo jawną bramkę właściciela.

| Reguła                                                                                                                | Strażnik                                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Nowy silnik = nowy folder w `engines/` o tym samym kształcie (CSS z wyjściami, opcjonalnie TS z wyprowadzeniem, test) | test struktury w `test/guards/`                                                                |
| Silnik czyta tylko wyjścia silników, od których zależy (graf U8)                                                      | jeden test CSS warstw: parsuje `var(--…)` w każdym pliku i sprawdza, z której warstwy pochodzi |
| Przepis czyta tylko wyjścia silników, nigdy liczby ani kolory                                                         | ten sam test CSS warstw (biała lista form wartości dla `recipes/`)                             |
| CSS komponentu zawiera tylko właściwości układu z tokenami                                                            | ten sam test CSS warstw (biała lista właściwości dla `components/`)                            |
| Motyw zawiera tylko wybory (wejścia L1)                                                                               | test motywów: klucze ⊂ wejścia silników                                                        |
| Komponent ma `docs/<nazwa>.md` i występuje w ≥ 2 stronach laboratorium                                                | test pokrycia                                                                                  |
| Ruch tylko z białej listy właściwości; wyjątek = wpis z powodem                                                       | test CSS + reguła eslint + trace Playwright                                                    |
| Pomiar DOM tylko w plikach z nazwanej listy                                                                           | eslint z białą listą plików                                                                    |
| Kod etapu nie powstaje bez kontraktu w `docs/plans/`                                                                  | bramka właściciela na start etapu (masterplan); AGENTS.md                                      |
| Przed usunięciem worktree zdjąć linki `link:`                                                                         | `guard.sh` z presetu `hooks-agents` (globalnie)                                                |

## Scope'y commitów

Jedno źródło: `--scopes` w `.pre-commit-config.yaml`. Scope to obszar drzewa: `repo`, `docs`, `engine`, `recipe`, `component`, `theme`, `lib`, `eslint`, `lab`. `build`, `test` i `ci` są typami commita, nie obszarami.
