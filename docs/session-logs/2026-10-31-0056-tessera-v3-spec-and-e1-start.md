---
kind: session
status: ready-to-resume
created: 2026-10-31T00:56:00+01:00
subject: tessera-v3-spec-and-e1-start
---

# Punkt wznowienia: Tessera v3, specyfikacja gotowa, start E1 (repo)

## Cel

Tessera v3 jako osobne repo `PROJECTS/tessera` (system stylu: 9 silników → 5 przepisów → cienkie komponenty, Base UI do zachowania), z laboratorium pod jednym linkiem; potem desktop MangaShift na v3. Teraz: etap E1, założenie repo według planu.

## Czytaj przy wznowieniu

| Kolejność | Źródło                                                                 | Po co                                                             | Tryb                  |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
| 1         | `MangaShift/tmp/tessera-v3/plans/e1-repo.md`                           | bieżący plan, 9 kroków                                            | REQUIRED              |
| 2         | `MangaShift/tmp/tessera-v3/specification.md`                           | co ma być prawdą (U, W, F, Q, B, T, Z, N)                         | REQUIRED              |
| 3         | `MangaShift/tmp/tessera-v3/masterplan.md`                              | etapy E0–E5, bramki właściciela                                   | REQUIRED              |
| 4         | `MangaShift/tmp/tessera-v3/structure.md`                               | drzewo repo i reguły wzrostu                                      | REQUIRED              |
| 5         | `MangaShift/tmp/tessera-v3/decisions/e0-concentric.md`, `e0-motion.md` | wyniki E0                                                         | REQUIRED              |
| 6         | `MangaShift/tmp/tessera-v3/research/r1`–`r5`                           | dowody (silniki, Base UI, wydajność, repo, audyt v2)              | ON DEMAND             |
| 7         | `MangaShift/tmp/tessera-v3/reviews/`                                   | 3 rundy recenzji spec i masterplanu (ostatnia PASS WITH FINDINGS) | ON DEMAND             |
| 8         | `PROJECTS/agents/scripts/standard.py`, `presets/`                      | standard repo do kroku 1                                          | REQUIRED przy kroku 1 |

## Skille do wczytania

- `coding`, `simple`: wykonanie E1.
- `agents-md`: AGENTS.md nowego repo (krok 7).
- `subagent`: każdy brief z pełnym szablonem, skillem zadaniowym i formatem SUBAGENT-RESULT.
- `review`: recenzja po krokach.

## Stan repo / środowiska

- MangaShift: branch `refactor/tessera-motion`, HEAD `7a48b4310` (commit sprzątania z innej sesji Claude, niewypchnięty; nie wypychać bez słowa właściciela). v2 zamrożona w `186fdcd37`, wypchnięta.
- `PROJECTS/tessera`: nie istnieje.
- `PROJECTS/tessera-probe/motion`: laboratorium ruchu E0 (c), serwer `bun run dev` na :4700 mógł zostać uruchomiony w tle; do usunięcia po E2.
- `MangaShift/tmp/tessera-v3/spikes/concentric`: sonda E0 (b), do usunięcia przy przenosinach dokumentów.

## Stan pracy

### DONE

- Research R1–R5 (5 agentów Opus), specyfikacja + structure + masterplan, 3 rundy recenzji (A: spec, B: masterplan).
- Odpowiedzi właściciela 31.10 wpisane do spec (U26–U33, W19, W20): MangaShift tylko Windows, biblioteka wszędzie; typografia jako profile; strona zostaje jak jest (migracja wypada, E5 = desktop); Base UI zamiast Radixa; prywatne repo `MattyMroz/tessera` + push branchy dla CI; docs dla agentów = markdown w paczce; boczny panel wyborów jak v2 (shadcn create tylko jako idea); bez Figmy; limit rund U33; ruch „squishy + sliding”.
- E0 (b): promień koncentryczny samym CSS działa (nazwa zmiennej per poziom). E0 (c): zamknięte decyzją, tryby v2 elastic/firm/off, technikę wybiera prowadzący.

### NOT STARTED

- E1 kroki 1–9 (plan `e1-repo.md`).

## Decyzje i ich skutki

- Repo małą literą: `tessera`, paczka `@mattymroz/tessera`.
- ESLint, nie Biome (decyzja prowadzącego w planie E1, N10).
- Próba dwóch repo (E0 a) przeniesiona do E1 krok 8 na prawdziwej paczce.

## Ślepe uliczki

| Próba                                                              | Dlaczego nie działa                                  | Nie wracać bez                        |
| ------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------- |
| `inherit()` dla promienia koncentrycznego                          | brak w Chromium 153; psuje parsowanie reszty arkusza | wydania w Chromium                    |
| dwie animacje `transform` na jednym elemencie (jazda + wciśnięcie) | Chromium wypycha z kompozytora (powód 64)            | — rozdzielić na element i jego `face` |
| kopie DOM / kawałki wskaźnika (30.10)                              | szwy, zły róg                                        | nigdy (Z6)                            |

## Reguły i zakazy, które muszą przetrwać

- Commit i push tylko na wyraźne słowo właściciela; subagenci zero git.
- Edycja plików tylko Edit/Write; nigdy `bun run test`; Playwright headless, 1 worker.
- Przed usunięciem worktree albo folderu z linkiem `link:` najpierw zdjąć linki (junctiony kasują cel).
- Odpowiedzi do właściciela krótkie, z linkami i instrukcją sprawdzenia; krytycznie, bez przytakiwania.
- „Zanim podejmiesz akcję, przyczyny i konsekwencje” — przy krokach dotykających MangaShift (krok 8) pytać.

## Następny krok

1. [REKOMENDACJA] E1 krok 1: `git init` w `PROJECTS/tessera`, `standard.py apply`, `.pre-commit-config.yaml` z presetu, `prek install`; kontrola `standard.py check` i `prek run --all-files`.
2. Kroki 2–7 według planu, potem krok 8 po pytaniu właściciela, krok 9 po jego słowie.
