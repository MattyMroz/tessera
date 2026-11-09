---
kind: decision
status: done
created: 2026-11-08
---

# Testy laboratorium po przebudowie na jedną stronę `/`

Wykonawca z upoważnienia prowadzącego, 2026-11-08. Dowód: `a11y`, `interaction`, `toggle-group`, `lab`, `edges` w Chromium oraz `contracts.test.ts`, wszystkie zielone.

## Select: opakowanie `data-slot="choice"` z `contain: layout`

- Wybrano: `Select` renderuje `<span data-component="select" data-slot="choice">` wokół `BaseSelect.Root`, a `select.css` daje mu `display: inline-flex`. Przepis `control` dla `[data-slot='choice']:has(> [data-recipe='control'])` ustawia `contain: layout`.
- Powód: ukryte pole Base UI (`position: fixed`, `width: 1px`) stawało się osobną warstwą kompozytora, po jednej na każdy `Select`; sekcja Select na `/screens/edges` podniosła budżet B7 z 11 do 15 warstw (limit 12), a test „adds exactly one compositor layer of its own…” oblewał w obu DPR. Ten sam wzór stosują Checkbox, Radio i Switch.
- Odrzucone: podniesienie `LONG_LIVED_LAYERS` (osłabienie budżetu), `display: contents` (nie tworzy zawierania).

## Select: nazwa dostępna

- Wybrano: lab daje każdemu `SelectTrigger` `aria-label`. Przycisk z rolą `combobox` nie bierze nazwy z treści, więc axe zgłaszał `button-name` (11 węzłów na `/`).
- Odrzucone: domyślna etykieta w komponencie (zakaz tekstu UI w komponentach); nazwa jest obowiązkiem konsumenta, jak przy przycisku samej ikony.

## Testy przepisane na obowiązujący kontrakt

- `helpers.ts`, grupy wciśnięcia: wyzwalacz listy (`button[role='combobox']`) należy do grupy `flat` (kontrakt „wyzwalacz listy nie skaluje się”, test `interaction.spec.ts` o listbox trigger), a wyzwalacz paska menu (`role='menuitem'` w kontenerze z pigułką) do grupy `pill`, jak wiersz menu. Wcześniej żaden z nich nie był na stronie liczonej przez ten test.
- `helpers.ts`, `timingReport`: pigułka `dot` (znacznik Radio, Select, wiersza menu) skaluje się w kategorii `choice` z krzywą `elastic`; test wymagał dla niej bezruchu jak dla pigułki tła. Teraz wybrana kropka ma czas `duration-choice` i krzywą `ease-elastic` silnika, niewybrana stoi.
- `toggle-group.spec.ts`, Tab: kolejność grup w sekcji po przebudowie nie czyni z „One character” następnej grupy po „Nothing chosen yet”. Test sprawdza teraz, że grupa bez wyboru jest jednym przystankiem Tab (po drugim Tab fokus poza nią, Shift+Tab wraca na pierwszą opcję).
- `toggle-group.spec.ts`, pigułka grupy trybu: panel ma menu zamiast grupy trybu. Kontrakt „zmiana motywu zeruje czasy płytek, ale nie pigułki grupy” sprawdza test ze znacznikiem `data-motion-hold` postawionym na `<html>` i kliknięciem opcji zwykłej grupy: pigułka dostaje animację z czasem większym od zera.
- `lab.spec.ts`, „starts no colour animation…”: wybór w menu motywu najpierw zwalniał hover wyzwalacza `soft` (zjazd kursora na opcję), a to zwykłe gaśnięcie 150 ms. Test najedzie na opcję, poczeka na koniec animacji, wyczyści zapis i dopiero klika; zapis po zmianie motywu nie ma animacji koloru.
- `edges.spec.ts`: nawigacja nazywa się „Elements”; etykieta przycięta wielokropkiem w `Select` stoi w `[data-slot='swap-in']`, nie w slocie `label`; popupy zamknięte `Select` zostają w DOM jako ukryty `Positioner` (`hidden`, 0 × 0), więc test „keeps the popup of every section inside the window” liczy tylko widoczne.

## Pokrycie kontraktu komponentu

- Context menu, Menubar i Select dostały sekcje na `/screens/edges` (z przypadkami długich ciągów w `overflow.tsx`) oraz sekcje na `/components`, żeby spełniały „co najmniej dwie strony laboratorium” obok `/`. Gdy ostatni element przejdzie na `/`, kontrakt przestawia się zgodnie z `docs/plans/e3-lab.md`.
