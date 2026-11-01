---
kind: research
id: e2-facts-shape
date: 2026-10-31
source: MangaShift, branch refactor/tessera-motion (working tree), commit 7a48b4310
scope: silniki v3 size, space, shape, depth, state, focus; fakty z v2, bez ocen
---

# Fakty z Tessery v2: rozmiar, odstępy, kształt, głębia, stany, fokus

Ścieżki skrócone. `T/` = `MangaShift/tessera/packages/tessera/`, `S/` = `T/src/styles/`, `C/` = `T/src/components/`, `L/` = `T/src/lib/`. Px przy 16 px w `rem`. Liczby wprost z kodu; wyliczenia z formuł oznaczone jako wyliczone.

## Najważniejsze

1. Formuła kształtu żyje w `L/shape.ts` (219 linii, czysta funkcja) i ma 36 przypadków tabelarycznych + 26 testów w `L/shape.test.ts`. CSS powtarza jej część osobno (`C/_internal/control.css:2-30`, `S/settings.css:50-107`).
2. W v2 promień zagnieżdżony liczy JS: kontekst React (`hooks/use-shape.tsx`), pomiar DOM (`ResizeObserver`, `getBoundingClientRect`, `getComputedStyle`) i `style.setProperty` (`C/_internal/surface-edges.ts`, `measured-shape.ts`, `button-shape.tsx`). To łamie Q6/Q7 v3; E0 (b) potwierdził zamiennik w czystym CSS (sposób B).
3. Drabinka stanów w kodzie v2 NIE ma wartości W8. Kod: atrament jasny 10/15/20 %, ciemny 12/17/22 %; odcień akcentu jasny 10/16/24 %, ciemny 18/24/30 %; ramka 25 %. Test v2 to blokuje (`T/test/foundation.test.ts:75`). Wartości W8 (8/12/16, 4/7/10, akcent 8/16/24 + 25 %) pochodzą z decyzji właściciela z 2026-10-09 (`MangaShift/docs/plans/ui-kit/plans/e2-foundation.md:28,31,32`), niewdrożonej.
4. `S/scale.css` ma 473 unikalne nazwy zmiennych (558 deklaracji). Fundament w szerokim sensie: 98; sekcje strony: 331; komponenty desktopu: 32; reszta globalna: 12.
5. Neon: v2 ma zmienne `--neon`, `--neon-blur` bez żadnego konsumenta; działa tylko `--control-glow` (5 komponentów). Orby istnieją w v2 wyłącznie jako keyframes; komponent orbów jest tylko w desktopie (`desktop/src/app/layout/neon-orbs.tsx`).

## 1. Skala kontrolek xs–xl

Źródło wartości: `S/scale.css:410-479` (bloki `[data-size]`, `:root` = `lg`). Ta sama tabela w TS: `CONTROL_SIZES` w `C/_internal/button-shape.tsx:8-14` (tylko wysokość i font). Test: `T/test/foundation.test.ts` (stała `SIZES`, asercje w bloku od `:122`).

| rozmiar                | `--size-height` | `--size-font` / leading   | `--size-icon` | `--size-gap` | `--size-inner-height` / font / icon / gap | `--size-message-font` |
| ---------------------- | --------------- | ------------------------- | ------------- | ------------ | ----------------------------------------- | --------------------- |
| xs                     | 16              | 10 / 14 (`--type-mini`)   | 10            | 3            | 16 / 10 / 10 / 3                          | 10                    |
| sm                     | 20              | 11 / 15 (`--type-small`)  | 12            | 3            | 16 / 10 / 10 / 3                          | 10                    |
| md                     | 24              | 12 / 16 (`--type-detail`) | 14            | 4            | 16 / 10 / 10 / 3                          | 11                    |
| lg (domyślny, `:root`) | 28              | 13 / 18 (`--type-body`)   | 16            | 5            | 20 / 11 / 12 / 3                          | 12                    |
| xl                     | 36              | 15 / 20 (`--type-title`)  | 18            | 7            | 28 / 13 / 16 / 5                          | 13                    |

Stopnie typu: `S/scale.css:38-49` (mini 10/14, small 11/15, detail 12/16, body 13/18, title 15/20, screen-title 20/28).

Padding boczny (nie token, formuła). `C/_internal/control.css:15-30`, ta sama w TS `controlSide` (`C/_internal/button-shape.tsx:36-38`):

```
r_side   = control-ratio × h                      // ratio: none 0, sm 4/28, md 6/28, lg 10/28, full 0.5
side     = round(max(h − font, h/2) − (h/2 − min(r_side, h/2)) / 4, 0.5px)
iconSide = round(side × 0.6, 1px)                 // przy ikonie na początku/końcu
```

Wyliczone `side/iconSide` (px):

| rogi | xs    | sm    | md     | lg     | xl      |
| ---- | ----- | ----- | ------ | ------ | ------- |
| none | 6/4   | 7.5/5 | 9/5    | 11.5/7 | 16.5/10 |
| sm   | 6.5/4 | 8/5   | 10/6   | 12.5/8 | 18/11   |
| md   | 7/4   | 8.5/5 | 10.5/6 | 13/8   | 18.5/11 |
| lg   | 7.5/5 | 9.5/6 | 11/7   | 14/8   | 19.5/12 |
| full | 8/5   | 10/6  | 12/7   | 15/9   | 21/13   |

Inne: min. szerokość przycisku z tekstem `2.5 × h` (`C/button.css:14`); przycisk z samą ikoną `width = h`, padding 0 (`C/button.css:77-81`).

Obszar trafienia: `--hit-target: 0px` (`S/scale.css:261`), `44px` przy `@media (pointer: coarse)` (`S/settings.css:214-218`). Nakładany przez `::before` o rozmiarze `max(100%, var(--hit-target))` na liście 10 kontrolek (`C/_internal/control.css:42-50`).

Skalowanie całości: `--scaling` 0.75/0.8/0.9/1/1.1/1.25/1.5 (`S/settings.css:109-135`), `--css-zoom` (`S/settings.css:3`, użycie `C/_internal/base-popup.css:2-9`).

Równoległe, starsze tokeny rozmiaru w `S/tokens.css:77-80`: `--control-height: 2.25rem` (36), `--row-height: 2rem`, `--icon-size: 1rem`, `--icon-size-sm: 0.875rem`. `--control-height` jest nadpisywane przez przepis do `--size-height` (`C/_internal/control.css:16`).

## 2. Gęstość

Poziomy: `compact` (domyślny, `:root`), `snug`, `default`, `relaxed`, `spacious` (`L/theme-data.ts:68`; oba presety `compact`, `L/theme-data.ts:246,264`). Wartości `S/scale.css:533-578`, mnożnik `S/settings.css:12-30`.

| token               | compact | snug   | default | relaxed | spacious |
| ------------------- | ------- | ------ | ------- | ------- | -------- |
| `--inset-tight`     | 4       | 5      | 6       | 7       | 8        |
| `--group-gap`       | 8       | 10     | 12      | 14      | 16       |
| `--card-spacing`    | 16      | 20     | 24      | 28      | 32       |
| `--card-spacing-sm` | 12      | 14     | 16      | 18      | 20       |
| `--toast-padding`   | 8       | 10     | 12      | 14      | 16       |
| `--space-factor`    | 1       | 1.0625 | 1.125   | 1.25    | 1.375    |

- `--island-gap` i `--panel-padding` = `var(--inset-tight)` (`S/scale.css:574-578`); w Tailwindzie `spacing-island`, `spacing-panel`, `spacing-section` (`S/scale.css:659-665`).
- `--space-factor` mnoży tylko rytm sekcji strony: `--section-py-tight/wide` (`S/scale.css:723-727`, bazy 64/112, od 48rem 96/160: `S/scale.css:398-399,716-721`) i `--hero-*`, `--section-py` (`S/tokens.css:454-460`), z `round(…, 1px)`.
- Gęstość nie zmienia `--size-*`: test „never lets the density touch a control size” (`T/test/foundation.test.ts:122`).
- Związek z kształtem: testy rozrzutu używają tych samych serii, `DENSITY_TIGHT = [4..8]`, `DENSITY_CARD = [16..32]` (`L/shape.test.ts:335-336`).
- Rampa odstępów stała: `--space-2..40` = 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40 (`S/scale.css:18-30`).

## 3. Kształt

### 3.1 Wejścia motywu

- `corners`: `none | sm | md | lg | full`; `curve`: `round | squircle` (`L/theme-data.ts:64,66`). Preset desktopu: `full` + `squircle`; strony: `full` + `round` (`L/theme-data.ts:244-245,262-263`).
- CSS: `[data-corners]` ustawia `--radius` (powierzchnia), `--radius-control`, `--control-ratio`, `--control-full` (`S/settings.css:50-76,99-107`); `[data-curve]` ustawia `--corner-shape`, `--control-shape`, `--control-smooth`, `--control-cap` (`S/settings.css:78-90`); bez wsparcia `corner-shape: squircle` wraca `smooth 1`, `cap 0.5` (`S/settings.css:92-97`); `full` wymusza na kontrolkach `--control-shape: round`, `smooth 1`, `cap 0.5`, ale nie zmienia `--corner-shape` powierzchni.

| rogi | `--radius` (pow.) | `--radius-control` | `--control-ratio` | `REFERENCE_RADIUS` w `shape.ts` |
| ---- | ----------------- | ------------------ | ----------------- | ------------------------------- |
| none | 0                 | 0                  | 0                 | 0                               |
| sm   | 6                 | 4                  | 4/28              | 4                               |
| md   | 10                | 6                  | 6/28              | 6                               |
| lg   | 14                | 10                 | 10/28             | 10                              |
| full | 10                | 9999               | 0.5               | 14                              |

Wartości domyślne na `:root`: `S/scale.css:2-9` (`ratio 0.5`, `smooth 1`, `cap 0.5`, `box-cap 0.35`, `shape round`, `full 1`, `side-step 0.5px`, `pixel-step 1px`) oraz `S/tokens.css:2-3` (`--radius: 0.625rem`, `--radius-control: 6px`). Tailwind: `--radius-sm/md/lg/xl` = `--radius` −4/−2/0/+4 (`S/tokens.css:535-538`). `--panel-radius: min(var(--radius), 0.75rem)` (`S/tokens.css:74`). Skala stała `--corner-xs..full` = 2/4/6/8/12/9999 (`S/scale.css:11-16`), 56 użyć w CSS komponentów.

Rozjazd: dla powierzchni `shape.ts` daje `REFERENCE_RADIUS + 1 × padding` (np. `sm` przy paddingu 4 → 8), a CSS `--radius` dla `sm` = 6, dla `full` = 10 (shape.ts → 18). Dla `md` i `lg` przy paddingu 4 wartości się zgadzają (10, 14).

### 3.2 Formuła `L/shape.ts` (pseudokod, stałe dokładne)

```
REF        = {none: 0, sm: 4, md: 6, lg: 10, full: 14}       // :63
CAPSULE    = 9999; CONTROL_HEIGHT = 28; NESTED_STEP = 4      // :64-66
SQUIRCLE   = 1.6; SQUIRCLE_CAP = 0.45; CAPSULE_CAP = 0.5     // :67-69
BOX_CAP    = 0.35; FACING_SLACK = 0.5                         // :70-71
kind ∈ {surface, media, control, box}; type ∈ {fixed, capsule, concentric}
joint ∈ {only, start, middle, end}; joined ∈ {horizontal, vertical}; spread ∈ {1, 0.5}

curveFactors(theme):                                         // :85-89
  curve = round                  → {control: 1,   surface: 1,   cap: 0.5}
  curve = squircle, corners=full → {control: 1,   surface: 1.6, cap: 0.5}
  curve = squircle, inne         → {control: 1.6, surface: 1.6, cap: 0.45}

controlRadius(c, h) = c = full ? 9999 : REF[c] × h / 28                      // :105-106
spreadRadius(c, p, s) = c = none ? 0 : REF[c] + s × p                         // :100-103
fallbackRadius(kind, theme, h, nested):                                       // :108-115
  surface → nested ? REF[c] : REF[c] + 4
  media   → REF[c]
  control/box → min(controlRadius(c, h), h × (box ? 0.35 : f.cap) / f.control)
concentricRadius(R, d, own) = max(R − d, min(own, R, d))                      // :117-119

resolveShape(input, parent, theme):                                           // :138-210
  kind   = input.kind ?? control
  sized  = kind ∈ {control, box} lub type = capsule
  h      = sized ? (skończone ≥0 input.height ?? 28) : (input.height ≥0 ?? ∞)
  w      = input.width ≥0 ?? ∞
  padding, border = skończone ≥0 ?? 0;  inset = padding + border
  spread = kind ∈ {control, box} ? brak : input.spread
  own    = input.own ?? (spread brak ? fallbackRadius(kind, theme, h, parent ≠ null)
                                     : spreadRadius(c, padding, spread))
  limit  = h × (box ? 0.35 : f.cap) / f.control
  settle(r, R):
    control → max(min(r, limit), c = full ? min(h/2, R ?? h/2) : 0)
    box     → min(r, limit)
    inne    → r
  radii:
    capsule    → każdy róg h/2
    fixed      → każdy róg settle(own, null)
    concentric:
      brak rodzica → settle(own, null)
      rodzic.joined → rogi zewnętrzne wg OUTER_CORNERS[joined][joint ?? only]   // :78-81
                       = max(0, R_róg − rodzic.inset), pozostałe 0; sized → min(…, h/2)
      inaczej:
        sides = edges ?? wszystkie = max(0, rodzic.inset)    // brak strony w liście = ∞
        d_róg = max(dwóch sąsiednich stron)
        v_róg = settle(concentricRadius(R_róg, d_róg, own), R_róg)
        facing = rogi z d_róg ≤ rodzic.inset + 0.5
        jeśli facing niepuste: rogi spoza facing ≤ max(v facing)
  curve  = capsule ? 1 : kind ∈ {control, box} ? f.control : f.surface
  drawn_róg  = radii_róg × curve           // to idzie do border-radius
  radius     = max(radii)
  half       = min(w, h) / 2;  effective = min(radius, half);  quarter = effective / 4
  nominal    = capsule ? h/2 : input.own ?? controlRadius(c, h)
  ownQuarter = sized ? min(nominal, half) / 4 : quarter
  textPadding = padding + min(max(quarter, effective − inset), half)
  children   = {radii, inset, joined: input.joined ?? null}

contentPadding(shape, base) = min(base + ownQuarter, half)                    // :212-214
endPadding(shape, childH)   = h nieskończone ? padding
                              : max(0, (h − 2·border − childH) / 2)           // :216-219
```

Kluczowe skutki:

- Squircle: promień nominalny × 1.6, a limit `h × 0.45 / 1.6` gwarantuje narysowany promień ≤ 45 % wysokości (test `L/shape.test.ts:234-237`: kontrolka 28 przy `lg` → narysowane 12.6).
- Kapsuła: `type capsule` = h/2 zawsze; przy `corners = full` kontrolka nie spada poniżej `min(h/2, R rodzica)`; kapsuła nigdy nie dostaje krzywej squircle (`curve = 1`), powierzchnia przy `full` + squircle zostaje 1.6 (`L/shape.test.ts:226-232`).
- Padding optyczny ¼ promienia: `quarter = min(radius, half) / 4`; `contentPadding = base + ownQuarter`, z limitem `half`. Dla kontrolek `ownQuarter` liczy się z promienia własnego (nie z koncentrycznego), więc padding kontrolki jest ten sam samodzielnie i w każdej powierzchni przy każdej gęstości (`L/shape.test.ts:356-371`).
- Wersja CSS tego samego: `--control-radius = min(ratio × smooth × h, cap × h)` (`C/_internal/control.css:18-21`); `--optical-inset: 0.25` (`S/tokens.css:75`) użyte tylko w `C/bubble.css:21`.

### 3.3 Testy `L/shape.test.ts`

7 bloków `describe`, 36 przypadków `it.each` + 26 `it` (stan: plik 492 linie).

- Tabela (`:50-207`), przykłady: karta w wyspie `lg` → 9, `md` → 5, `sm` → 4, `full` → 13; grafika w karcie `lg` → 5, `full` → 8; przycisk w rogu wyspy `lg` → 9 (przy paddingu 0: tl/bl 13, tr/br 10); środkowy wiersz `lg` → 60/7; ostatni wiersz `lg` → 60/7 u góry, 9 na dole; wyspa wokół kapsuł `full`, spread 1 → 18, wiersz w niej → 12; grupa sklejona `lg` (h 30, border 1) → 75/7, start 68/7 po lewej, middle 0, end 68/7 po prawej; nagłówek pełnej szerokości `lg` → 13 u góry, 80/7 na dole; pole w dialogu (d > R) `lg` → 10, `sm` → 4; przycisk zamknięcia w rogu dialogu → 60/7; d = 0 → promień rodzica (14); kapsułowe pole 32 `full` → 16, przycisk w nim → 12; przycisk w polu `lg` → 52/7; wiersz w kwadratowej wyspie → 0; popover jako nowy korzeń `lg` → 14 (zagnieżdżony byłby 9); squircle wiersz `lg` → 6.75, pole squircle w dialogu → 7.875; `fixed` ignoruje rodzica → 10; kapsuła 16 w kwadratowym rodzicu → 8. Tolerancja do referencji ≤ 0.5 px (`:214`).
- `curve` (`:219-238`): 1.6 i narysowane 10.8; squircle `full`: powierzchnia 1.6 (karta narysowana 20.8), wiersz-kapsuła 1; limit 45 %.
- `content` (`:240-283`): ¼ efektywnego promienia; nigdy ponad połowę krótszego boku; tekst w kontenerze co najmniej przy promieniu (karta `lg` 8, dialog 19.5); bok przy zaokrąglonym końcu = odstęp pionowy (`endPadding` 36/18 → 9, z ramką → 8); domyślna wysokość 28; szerokość 0.
- `guards` (`:285-313`): ujemne odległości i padding → 0; NaN/∞ → domyślne; jawne `own: 0` zostaje 0.
- `joined vertical group` (`:315-332`).
- `surface spread` (`:334-396`): spread 1 przy paddingu 4..8 (`md`) → 10..14; spread 0.5 przy 16..32 → `md` 14..22, `lg` 18..26; `none` kwadrat; `own` wygrywa; padding kontrolki stały; `controlSide` (TS) = `cssSide` (formuła CSS) dla 5 rogów × 2 krzywych × 5 rozmiarów; spread ignorowany na kontrolce.
- `invariants` (`:398-492`): monotoniczność względem R rodzica i względem `none → sm → md → lg`; dziecko nigdy okrąglejsze od rodzica i kwadratowe tylko w kwadratowym rodzicu; skok ≤ 3 px na 1 px wcięcia albo wysokości; nigdy ujemny ani NaN.

Zależność testu spoza rdzenia: `controlSide` importowany z `C/_internal/button-shape.tsx` (`L/shape.test.ts:18`), który v3 nie przenosi.

### 3.4 Jak v2 robi promień zagnieżdżony

- Rodzic publikuje `children = {radii, inset, joined}` przez kontekst React (`hooks/use-shape.tsx:93-111`, `C/_internal/shape-context.ts`); dziecko woła `useShape` i `resolveShape` (`hooks/use-shape.tsx:75-91`). 39 plików `.tsx` woła `useShape(`.
- Odległości do krawędzi powierzchni mierzy `useSurfaceEdges`: `getBoundingClientRect`, `getComputedStyle(...).fontSize`, `ResizeObserver`, przyciąganie do 0.5 px (`C/_internal/surface-edges.ts:23-67`).
- Wynik trafia na element przez `style.setProperty` zmiennych `--shape-radius`, `--shape-corner`, `--side`, `--side-icon` (`C/_internal/button-shape.tsx:40-72`, `setVariables` i `useShapeVariables`) albo `--shape-radius`, `--r`, `--shape-parent-radius`, `--shape-parent-inset`, `--shape-curve` (`C/_internal/measured-shape.ts:39-55`).
- Jedyna formuła koncentryczna w CSS: segmented/tabs (`C/_internal/control.css:2-13`), czyta `--shape-parent-radius` i `--shape-parent-inset` zapisane przez JS.

### 3.5 `docs/decisions/e0-concentric.md` (v3)

- Sposób A, `inherit(--r)`: Chromium 153 nie wspiera, WebKit 26.6 tak.
- Sposób B (wybrany): osobna nazwa zmiennej na poziom. Poziom N czyta `--c{N-1}`, zapisuje `--r{N}` i `--c{N} = max(--r{N} − padding, minimum)`; selektor trafia w jedną głębokość, np. `.root .s:not(.root .s .s)`; wrappery nie przeszkadzają. Kontrolka czyta wspólne `--inner` = `--c{N}` swojego poziomu (do potwierdzenia w E2). Popup w portalu = nowy korzeń z promieniem z `depth`/`shape` swojego poziomu.
- Przetestowane: promień korzenia 16/24/10, padding 8/6/4, 4/4/4, 8/8/8, minimum 4, 4 poziomy, portal 12/6 → 6. Działa 6/6 + portal w obu silnikach.
- Ograniczenia: głębokość skończona (propozycja 4-5 poziomów); nowej funkcji CSS nie łączyć w jednym arkuszu bez `@supports` (nieobsługiwane `inherit()` zepsuło parsowanie arkusza).
- Formuła E0 (`max(R − padding, minimum)`) jest prostsza od `concentricRadius` z `shape.ts` (`max(R − d, min(own, R, d))`, osobno na róg, z regułą „facing”).

## 4. Głębia

v2 nie ma nazwanych poziomów `sunken/base/raised/overlay/modal`. Są role kolorów, cienie i warstwy:

| rola v2                                     | jasny                          | ciemny                      | źródło                                |
| ------------------------------------------- | ------------------------------ | --------------------------- | ------------------------------------- |
| `--background`                              | `#fdfdfe`                      | `#080808`                   | `S/colors.css:90,175`                 |
| `--secondary` / `--card-nested` / `--panel` | `#f9f9fb`                      | `#0d0d0d`                   | `S/colors.css:96,126,129,181,211,214` |
| `--card`                                    | `#ffffff`                      | `#121212`                   | `S/colors.css:92,177`                 |
| `--card-raised`                             | `var(--card)`                  | `#1c1c1c`                   | `S/colors.css:128,213`                |
| `--popover`                                 | `#ffffff`                      | `#1c1c1c`                   | `S/colors.css:94,179`                 |
| `--glass` / `--glass-subtle`                | `rgb(255 255 255 / .92 / .78)` | `rgb(28 28 28 / .85 / .68)` | `S/colors.css:136-137,221-222`        |
| `--card-surface`                            | `rgb(255 255 255 / .85)`       | `rgb(18 18 18 / .62)`       | `S/colors.css:122,207`                |

Preset strony ma osobne neutralne (`S/colors.css:300-382`, ciemne tło `#09090b`, karta `#101012`).

Obrysy: `--border` jasny `rgb(116 116 127 / .26)`, ciemny `rgb(139 139 139 / .24)`; `--glass-border` .2 / .2; `--card-border` `transparent`; `--card-nested-border` .22 / .3; `--panel-border` `transparent` (`S/colors.css:103,123,127,130,138,188,208,212,215,223`). `--border-width: 1px`, `2px` przy `prefers-contrast: more` (`S/scale.css:258`, `S/settings.css:208-212`).

Cienie (`--shadow-color: oklch(0 0 0)`, `S/colors.css:45`; wartości `S/scale.css:323-339`):

| token                                | wartość                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `--elevation-sm`                     | `0 1px 2px` 40 %                                                                                           |
| `--elevation-lg`                     | `0 32px 80px -36px` 90 %                                                                                   |
| `--elevation-overlay`                | `0 10px 15px -3px` 10 %, `0 4px 6px -4px` 10 %                                                             |
| `--elevation-popup-light` / `-dark`  | `0 4px 16px` 10 % + `0 1px 3px` 8 % / `0 8px 24px` 45 % + `0 2px 6px` 30 %                                 |
| `--elevation-dialog-light` / `-dark` | `0 16px 48px` 16 % + `0 4px 12px` 8 % / `0 24px 64px` 60 % + `0 4px 16px` 40 %                             |
| `--card-shadow`                      | jasny `0 1px 3px rgb(20 20 23 / .05), 0 0 1px rgb(20 20 23 / .04)`, ciemny `none` (`S/colors.css:125,210`) |
| `--tooltip-shadow-light/-dark`       | `S/tokens.css:141-142`                                                                                     |

Użycie: popup `--elevation-overlay` (`C/_internal/base-popup.css:16`), popover/combobox `popup-*`, dialog/drawer/command `dialog-*`, sekcje strony `--elevation-lg`. Scrim dialogu 18 % jasny / 40 % ciemny (`S/colors.css:291-297`).

Warstwy (`S/scale.css:312-321`): `--z-raised 1`, `--z-chrome 2`, `--z-navbar-menu 1020`, `--z-navbar 1030`, `--z-popup 1040`, `--z-toast 1050`, `--z-grain 1100`, `--z-click-ring 1200`.

Materiał (blur):

- `[data-panel-background]`: `solid` → `--panel-blur 0px`, `--panel-opacity 1`; `translucent` → `24px`, `0.85` (`S/settings.css:137-145`); `prefers-reduced-transparency` zeruje blur i neon-blur (`S/settings.css:200-206`).
- Konsumenci blur: panel app-shell (`blocks/app-shell/components/app-shell-panel.css:12`, wariant floating `--panel-floating-blur 12px`, `--panel-floating-opacity 0.8`, `S/tokens.css:414-415`), popup (`C/_internal/base-popup.css:17`), navbar 12 px i menu navbaru 24 px (`S/tokens.css:206,228`), mockupy strony 16 px.
- Karta używa `--panel-opacity`, ale bez `backdrop-filter` (`C/card.css:5`), zgodnie z W10.

Neon (3 tryby, `S/settings.css:181-197`):

| tryb | `--neon` | `--neon-blur` | `--control-glow`      | `--card-surface` (jasny / ciemny) |
| ---- | -------- | ------------- | --------------------- | --------------------------------- |
| off  | 0        | 0px           | transparent           | bez zmian                         |
| mini | 0.5      | 0px           | `var(--primary-glow)` | `.7` / `rgb(20 20 24 / .35)`      |
| full | 1        | 32px          | `var(--primary-glow)` | `.55` / `rgb(20 20 24 / .35)`     |

- `--primary-glow` = akcent z alfą 0.35, dla `contrast` `transparent` (`S/accents.css:8,29,50`).
- Konsumenci `--control-glow`: checkbox, radio, questionnaire (`0 0 var(--space-6)`), switch (`0 0 var(--space-8)`), icon-badge (mini `--space-4`, full `--space-10`) (`C/checkbox.css:47`, `C/radio-group.css:51`, `C/questionnaire.css:160`, `C/switch.css:46`, `C/icon-badge.css:59-65`). Brak w przycisku primary, suwaku, fokusie.
- `--neon` i `--neon-blur`: zero konsumentów w `T/src` i `desktop/src` (grep `var(--neon`).
- Orby: v2 ma tylko `@keyframes orb-float-1/2/3` (`S/utilities.css:517-560`) bez komponentu. Desktop: `NeonOrbs` (`desktop/src/app/layout/neon-orbs.tsx`) renderuje się tylko przy `neon = full` i akcencie innym niż contrast; 3 kule `fixed inset-0 z-0`: 36vw / blur 11vw / `--accent` / krycie jasny 35 %, ciemny 18 %; 31vw / 10vw / `--accent-bright` / 30 %, 15 %; 25vw / 9vw / `--accent-dim` / 25 %, 12 %; animacje 20 s, 25 s, 18 s `ease-in-out infinite` (`desktop/src/styles/utilities.css:86-94`), keyframes identyczne jak w v2.

## 5. Stany

Mechanizm: zmienna tła wariantu podmieniana selektorem stanu, tło na pseudo-elemencie `::after` pod treścią (`C/button.css:37-49`), przejście `background-color`. Nie ma nakładki „state layer” ani `--state-*`. Hover tylko w `@media (hover: hover)`, wciśnięcie przez `[data-pressing="true"]` (`C/button.css:139-187`).

Drabinki w kodzie:

| drabinka                               | jasny                                                            | ciemny                               | źródło                                      |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ------------------------------------------- |
| atrament `--ink-rest/hover/press`      | `rgb(116 116 127 / .10 / .15 / .20)`                             | `rgb(139 139 139 / .12 / .17 / .22)` | `S/colors.css:106-108,191-193`              |
| odcień `--tint-rest/hover/press`       | 10 / 16 / 24 %                                                   | 18 / 24 / 30 %                       | `S/colors.css:85-87,170-172`                |
| `--tint-border`                        | 25 %                                                             | 25 %                                 | `S/colors.css:52`                           |
| preset strony                          | `--tint-rest 12 %`, `--tint-border 30 %`, `--selection-mix 24 %` |                                      | `S/presets/mangashift-site.css:3-5`         |
| solid (primary, inverse) hover / press | `color-mix(in oklch, primary, foreground 12 % / 22 %)`           |                                      | `S/colors.css:56-57`, `S/accents.css:51-52` |
| `--accent` (hover outline/ghost)       | `rgb(116 116 127 / .055)`                                        | `rgb(139 139 139 / .07)`             | `S/colors.css:100,185`                      |

- Odcień akcentu: `--primary-subtle/-fill-hover/-fill-press = color-mix(in srgb, var(--primary) var(--tint-*), transparent)`, ramka `color-mix(… var(--tint-border) …)` (`S/accents.css:53-56`); dla akcentu `contrast` subtle/hover/press = atrament (`S/accents.css:11-14`). Destructive tak samo (`S/colors.css:59-62`).
- Warianty przycisku (`C/button.css:94-200`): default/secondary rest `ink-rest`, hover `ink-hover`, press `ink-press`; outline/ghost rest brak tła, hover `--accent`, press `ink-rest`; `aria-pressed` = odcień akcentu + `--primary-border`; `aria-expanded` = `ink-hover`.
- Równoległe neutralne wypełnienia poza drabinką: `--fill`, `--input`, `--control`, `--control-hover`, `--row` (`S/colors.css:104,116-120,189,201-205`).
- Wyłączenie: `opacity: var(--disabled-opacity)`, 0.4 jasny / 0.5 ciemny (`S/colors.css:88,173`; `C/button.css:212-215`, `C/item.css:98`), kursor `not-allowed`.
- Wciśnięcie skalą: `scale: var(--button-press-scale)` na liście kontrolek (`C/_internal/control.css:72-74`); czasy `--control-state-time`, `--control-scale-time` (`C/_internal/control.css:32-70`).
- Zaznaczenie tekstu: `color-mix(in srgb, var(--primary) var(--selection-mix), transparent)`, 30 % (`S/base.css:55-58`, `S/colors.css:58`).
- Test v2 zamraża atrament 10/15/20 i 12/17/22 (`T/test/foundation.test.ts:75,160-164`) oraz odcień z ramką 25 % (`:166-172`).

Rozjazd z W8: decyzja właściciela (`MangaShift/docs/plans/ui-kit/plans/e2-foundation.md:28`) to atrament biały w ciemnym 8/12/16 %, czarny w jasnym 4/7/10 %, akcent i destructive 8/16/24 % z ramką 25 %, wyłączenie 40 %, ghost w spoczynku bez tła; pola z tej samej drabinki (`:31`), segmented hover 12 % / 7 %, wciśnięcie 16 % / 10 % (`:32`). Kod v2 używa szarości `116 116 127` / `139 139 139`, nie czystej bieli i czerni.

## 6. Fokus

- Tokeny: `--focus-ring-width: 2px`, `--focus-ring-offset: 2px` (`S/scale.css:259-260`).
- Kolor `--ring`: akcent `contrast` jasny `oklch(19.3% 0.006 285.823 / 0.6)`, ciemny `oklch(94.3% 0 0 / 0.7)`; akcenty kolorowe = pełny `--primary` (`S/accents.css:21,42,63`); preset strony + violet: ciemny `--primary-bright` (`S/colors.css:400-406`). Globalnie `* { outline-color: color-mix(in oklab, var(--ring) 50%, transparent) }` (`S/base.css:11`).
- Reguła bazowa: `:where(:focus-visible):not([data-slot])` → `outline: 2px solid var(--ring); outline-offset: 2px` (`S/base.css:80-83`); `[data-input="pointer"]` i `[data-window-focused="false"]` gaszą pierścień (`S/base.css:85-88`); wariant Tailwinda `focus-visible` wyklucza wskaźnik (`S/utilities.css:4`).
- Każdy komponent deklaruje własny `:focus-visible` z tym samym warunkiem, np. `C/button.css:83-86`. Plików CSS z `focus-visible`: 47. Deklaracje: `outline: var(--focus-ring-width) solid var(--ring)` × 49; offset zewnętrzny `var(--focus-ring-offset)` × 33; offset wewnętrzny `calc(-1 * var(--focus-ring-width))` × 15 (14 plików: breadcrumb, document-tabs, item, media-timeline, message-scroller, scroll-area, table, tree-select, tree, window-controls, banner-announcement, feature-steps, legal-document, video-embed); `box-shadow: 0 0 0 2px var(--ring)` × 1 (editor-demo).
- Tryb `forced-colors`: 60 bloków; pierścień `Highlight` m.in. w `C/color-picker.css:304-305`.
- Strażnik: `T/test/focus-ring.test.tsx` (pierścień przy klawiaturze, brak przy wskaźniku i nieaktywnym oknie, dla listy komponentów).

## 7. Liczby `S/scale.css`

558 deklaracji, 473 unikalne nazwy (poza blokiem `@theme inline`). Klasyfikacja po prefiksach:

| grupa                     | nazwy                                                                                                                                                                      | liczba |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| rozmiar kontrolek         | `--size-*`                                                                                                                                                                 | 11     |
| gęstość                   | `--inset-tight`, `--group-gap`, `--card-spacing`, `--card-spacing-sm`, `--toast-padding`, `--island-gap`, `--panel-padding`                                                | 7      |
| rytm sekcji               | `--section-py-tight/-wide` (+ `-base`)                                                                                                                                     | 4      |
| promienie                 | `--corner-*` 6 + `--control-*` (ratio, smooth, cap, box-cap, shape, full, side-step, pixel-step) 8                                                                         | 14     |
| cienie                    | `--elevation-*`                                                                                                                                                            | 7      |
| warstwy                   | `--z-*` (w tym `navbar`, `navbar-menu`, `grain`, `click-ring`)                                                                                                             | 8      |
| odstępy                   | `--space-*`                                                                                                                                                                | 13     |
| typografia                | `--type-*` 12, `--tracking-caps`, `--font-sans/heading/mono`, `--weight-*` 3, `--selection-weight`, `--icon-stroke`, `--prose-*` 3, `--surface-*` 6                        | 28     |
| obrys, fokus, trafienie   | `--border-width`, `--focus-ring-width/-offset`, `--hit-target`                                                                                                             | 4      |
| razem fundament (szeroko) |                                                                                                                                                                            | 98     |
| sekcje i bloki strony     | footer 18, feature 42, signup 27, editor-demo 28, comparison 23, media-mockup 22, form-card 22, faq 15, legal 15, …                                                        | 331    |
| komponenty desktopu       | tree 7, media-timeline 5, color-picker 4, toast 2, slider 2, data-list 2, status 2, inne po 1                                                                              | 32     |
| globalne różne            | anchor-offset, click-ring-size/-width, disclosure-turn, font-logo(-weight), grain-image/-opacity, scroll-fade-size, scrollbar-size, skeleton-pulse-opacity, viewport-width | 12     |

W wąskim sensie zlecenia (rozmiary, gęstość, promienie, cienie, poziomy) fundament = 11 + 7 + 4 + 14 + 7 + 8 = 51. Dla porównania `S/tokens.css` ma 432 unikalne nazwy (441 deklaracji), prawie wszystkie komponentowe.

## Do przeniesienia 1:1

- Skala xs–xl: wysokość, font, leading, ikona, gap (tabela §1) i wnętrze `--size-inner-*`; test `foundation.test.ts` `SIZES`.
- Formuły paddingu bocznego i ikony (`control.css:23-29` = `controlSide`), min. szerokość 2.5 × h, ikona-only `w = h`.
- Stałe i logika `shape.ts` jako wzorzec silnika: `REF`, 1.6, 0.45, 0.5, 0.35, `NESTED_STEP 4`, spread 1 / 0.5, `concentricRadius`, `settle`, reguła „facing” 0.5 px, sklejone grupy, `contentPadding`, `endPadding`, `textPadding`; tabela przypadków i niezmienniki z `shape.test.ts` jako testy kontraktu.
- Serie gęstości (§2) i `--space-factor` dla rytmu sekcji.
- Rampa `--space-*` i skala `--corner-*`.
- Fokus: 2 px, offset 2 px, warianty zewnętrzny i wewnętrzny, wygaszanie dla wskaźnika i nieaktywnego okna, `forced-colors`.
- Obszar trafienia 0 / 44 px (coarse) przez `::before`.
- Neon: trzy tryby i `--control-glow` = akcent 35 %, kontrast bez poświaty; parametry orbów z desktopu.

## Do przepisania

- Promień zagnieżdżony: z kontekstu React + pomiaru DOM + `setProperty` na dziedziczone zmienne per poziom (sposób B z E0); przenieść regułę na róg i „facing” albo świadomie uprościć do formuły E0.
- `[data-corners]`/`[data-curve]`: jedna tabela promieni zamiast trzech (`--radius`, `--radius-control`, `REFERENCE_RADIUS`), bo dziś `sm` i `full` dają różne promienie powierzchni w CSS i w TS.
- Drabinka stanów: wartości W8 zamiast obecnych 10/15/20, 12/17/22, 10/16/24, 18/24/30; jedna drabinka zamiast równoległych `--accent`, `--fill`, `--control`, `--row`, `--input`.
- Fokus: jeden przepis zamiast 47 plików z własnym `:focus-visible` (F8).
- Głębia: nazwane poziomy z mapowaniem ról v2 (§4) na `sunken/base/raised/overlay/modal`; cienie light/dark jako jedna wartość na poziom.
- Neon: wyjście silnika `depth` zamiast martwych `--neon`, `--neon-blur`; konsumenci według W11 (switch, checkbox, suwak, primary, fokus, aktywna ikona), których v2 częściowo nie ma.

## Nie przenosić (powód z kodu)

- `S/tokens.css`: 432 nazwy komponentowe, starsze `--control-height: 2.25rem`, `--row-height`, `--icon-size*` sprzeczne ze skalą (`S/tokens.css:77-80`).
- 363 tokeny komponentów i sekcji ze `scale.css` (§7); spec U11 zakazuje publicznych tokenów komponentu.
- Helpery kształtu z pomiarem i zapisem stylu: `surface-edges.ts` (`ResizeObserver`, `getBoundingClientRect`), `measured-shape.ts`, `button-shape.tsx` (`setProperty`), `use-shape.tsx`, `shape-context.ts`, `row-shape.ts` (`ResizeObserver`); łamią Q6/Q7.
- `--neon`, `--neon-blur`: zadeklarowane (`S/settings.css:7-8,181-197`), bez konsumenta.
- Keyframes orbów w `S/utilities.css:517-560` bez komponentu.

## Niewiadome

- Czy W8 „biel / czerń” oznacza czysty `#fff`/`#000` z alfą, czy szarość v2 z nowymi alfami: decyzja mówi „biel w ciemnym, czerń w jasnym” (`e2-foundation.md:28`), kod v2 ma `116 116 127` i `139 139 139`.
- Czy przenieść regułę „facing” i osobny promień na róg, czy wystarczy formuła E0 `max(R − padding, minimum)` z jednym wcięciem; E0 nie testował nierównych wcięć ani grup sklejonych.
- Mechanizm `--inner` dla kontrolek w sposobie B: E0 oznacza go „do potwierdzenia w E2”.
- Sonda E0 `spikes/concentric/` nie istnieje w repo `PROJECTS/tessera` (nie znaleziono katalogu); dowód E0 jest tylko w dokumencie decyzji.
- Które powierzchnie v2 odpowiadają poziomom `sunken` i `modal`: v2 nie ma tych nazw; `--card-nested`/`--panel` i dialog to najbliższe kandydaty (wniosek, nie fakt).
- Minimum promienia zagnieżdżonego (F2 „nie mniej niż minimum”): `shape.ts` nie ma stałej minimum, zamiast niej `min(own, R, d)`; E0 użył 4 px.
