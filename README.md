# Tessera

Tessera is a style system and React component library for the owner's apps (the MangaShift desktop first). Apps build
their interface from Tessera parts and write no styles of their own: a component has no look of its own, it takes it
from shared engines, so the same button looks right on a page, in a card, in a popup and in a menu.

The system has three layers:

- **engines** turn theme choices into tokens (`color`, `type`, `motion`, `space`, `size`, `shape`, `depth`, `state`,
  `focus`);
- **recipes** combine engine outputs into kinds of elements;
- **components** are thin and only lay out their parts.

A theme is a set of engine choices; an app's unique style lives only in its theme.

Status: version 3, early work. Private, unpublished, no license yet.

## Requirements

- [Bun](https://bun.sh) 1.4.3 (`packageManager` in `package.json`)
- [prek](https://github.com/j178/prek) for git hooks

## Setup

```sh
bun install
git config --local core.autocrlf false
prek install
```

## Commands

```sh
bun run build        # build every workspace member; run once after cloning
bun run dev          # the package in watch mode and the docs site and lab (Next.js) in apps/docs
bun run check        # typecheck, lint, build, tests
bunx vitest run      # tests only; run after a build, the package tests read packages/tessera/dist
```

Use `bunx vitest run`, never `bun run test`.

## Layout

| Path                | What it holds                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `packages/tessera/` | the `@mattymroz/tessera` package: source in `src/`, build output in `dist/`, guards in `test/` |
| `apps/docs/`        | docs site that is also the lab where every part is checked in composition                      |
| `docs/`             | project documents: specification, repo structure, plans, research, decisions, reviews          |

## Package entry points

| Import                           | Content                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `@mattymroz/tessera/tessera.css` | the CSS entry; declares the `@layer` order                                                |
| `@mattymroz/tessera/eslint`      | ESLint plugin that stops consumer apps from adding their own look (`configs.recommended`) |
| `@mattymroz/tessera/lib/*`       | shared behaviour helpers                                                                  |

There is no barrel `.` export; import each entry by its path.

## Documents

- [docs/specification.md](docs/specification.md): the single source of decisions
- [docs/structure.md](docs/structure.md): target repo tree and growth rules
- [docs/plans/masterplan.md](docs/plans/masterplan.md): stages and the current stage
- [AGENTS.md](AGENTS.md): working rules for agents
