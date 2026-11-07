---
kind: plan
status: accepted
baseline: 00e682c + łatka `patches/@base-ui%2Freact@1.9.0.patch` (niezacommitowana)
created: 2026-11-06
---

# Plan: trójkąt podmenu, który trzyma drogę do podmenu i nie blokuje reszty menu

## Cel

Kursor, który leci do podmenu, nie zamyka go po drodze (także przy wolnym ruchu i zawahaniu). Kursor, który jedzie gdzie indziej albo staje na innym wierszu, od razu dostaje hover i klik na wierszu pod sobą.

## Stan i przyczyny (pomiary 06.11, Chromium, okno 1280 × 900, pasek „Bar A”, File → Export → Archive → Compression)

- Base UI 1.9.0: wyzwalacz podmenu używa `safePolygon({ blockPointerEvents: true })` (`floating-ui-react/safePolygon.mjs`, `menu/submenu-trigger/MenuSubmenuTrigger.mjs`). Po zejściu z wyzwalacza reszta menu dostaje `pointer-events: none`, a podmenu trzyma się, dopóki kursor jest w trójkącie do jego bliższej krawędzi.
- Błąd 1 (naprawiony łatką, niezacommitowaną): podmenu zamykało się przy ruchu wolniejszym niż 0,1 px/ms i po 40 ms bez ruchu w trójkącie, nawet przy zawahaniu 60 ms. Łatka usuwa próg prędkości i daje 300 ms łaski (jak Radix i menu-aim). Testy: `menubar.spec.ts` „keeps a nested submenu open while the pointer pauses…” (przed: pada, po: 20/20) i „closes a nested submenu at once when the pointer leaves its trigger for another row” (zielony przed i po).
- Błąd 2 (zgłoszenie właściciela, odtworzony): wiersze tego samego menu leżące w trójkącie (np. „Close project” pod „Export”) przez czas łaski nie dostają hovera ani kliku. Klik po 100 ms trafia w tło menu i nic nie robi. Po zamknięciu podmenu wiersz pod stojącym kursorem nie podświetla się, dopóki mysz się nie ruszy, bo przeglądarka nie wysyła zdarzenia po zdjęciu `pointer-events`. Łatka wydłużyła ten okres z 40 do 300 ms, więc teraz go widać.

## Jak robią to najlepsi (źródła pierwotne, research 06.11)

|                                           | Kiedy trzyma                                         | Czas    | Blokada wierszy                               | Wiersz pod stojącym kursorem                                |
| ----------------------------------------- | ---------------------------------------------------- | ------- | --------------------------------------------- | ----------------------------------------------------------- |
| Base UI 1.9.0                             | trójkąt + prędkość ≥ 0,1 px/ms                       | 40 ms   | `pointer-events: none`                        | brak zdarzenia (błąd 2)                                     |
| Radix (`menu.tsx`)                        | wielokąt do dalszej krawędzi + ruch w stronę podmenu | 300 ms  | bez blokady DOM, wejście na wiersz ignorowane | dopiero przy następnym ruchu                                |
| React Aria (`useSafelyMouseToSubmenu.ts`) | stożek kąta ±15°, 2 złe ruchy                        | 1000 ms | `pointer-events: none` na menu rodzica        | po czasie sztuczny `pointerover` na `elementFromPoint`      |
| menu-aim (Amazon)                         | nachylenie z 3 pozycji                               | 300 ms  | brak                                          | stojący kursor: aktywacja od razu przy ponownym sprawdzeniu |

Base UI i floating-ui nie mają zgłoszenia o błędzie 2 ani o progu prędkości (wyszukanie 06.11).

## Docelowe zachowanie (cztery reguły w łatce Base UI)

1. **Kierunek (Radix).** Łaska trwa tylko wtedy, gdy kursor jest w trójkącie i jego ruch w poziomie idzie w stronę podmenu. Ruch w dół wzdłuż menu albo od podmenu zamyka podmenu od razu, a wiersze dostają hover w trakcie ruchu.
2. **Postój na wierszu (menu-aim).** Kursor stoi 100 ms (czas `follow`) nad innym wierszem tego menu: podmenu się zamyka, wiersz pod kursorem przejmuje hover. Postój w szczelinie (nad brzegiem menu albo poza menu) dalej ma 300 ms łaski, bo to zawahanie w drodze do podmenu.
3. **Przekazanie hovera (React Aria).** Przy zamknięciu z reguły 1 albo 2 i po upływie łaski: zdjęcie blokady, a w następnej klatce sztuczny `mousemove` z prawdziwymi współrzędnymi na `elementFromPoint`. Wiersze Base UI podświetlają się na `mousemove` (`useListNavigation`, `useMenuItemCommonProps`).
4. **Klik w czasie łaski.** `pointerdown` nad wierszem tego menu kończy łaskę od razu (reguła 3), a klik, który przeglądarka skieruje w tło menu, trafia do wiersza pod kursorem.

Rozpoznanie wiersza pod kursorem w czasie blokady: prostokąty `[role^="menuitem"]` menu rodzica (`elementFromPoint` widzi wtedy tło).

## Pliki

- `patches/@base-ui%2Freact@1.9.0.patch` (MODIFY, przez `bun patch`): `floating-ui-react/safePolygon.{mjs,js}` (reguły 1, 2), `floating-ui-react/hooks/useHoverReferenceInteraction.{mjs,js}` (reguły 3, 4). Paczka Tessery i jej CSS bez zmian.
- `apps/docs/tests/menubar.spec.ts` (MODIFY): testy niżej.
- `docs/decisions/e3-menus.md` albo `e3-choices.md` (MODIFY): decyzja z powodami; pułapka w `AGENTS.md` ze strażnikami.

## Dowody (każdy test czerwony przed regułą, zielony po; Chromium i WebKit, `--repeat-each=5`)

- Zawahanie 200 ms w szczelinie w drodze do „Compression”: podmenu zostaje (jest).
- Zjazd z „Archive” na inny wiersz: podmenu znika w ≤ 3 klatki (jest).
- Ruch w dół przez wiersze pod otwartym „Open recent”: każdy przecinany wiersz dostaje `data-highlighted`, podmenu zamyka się od razu.
- Szybki skos z „Export” na „Close project” i postój: „Close project” podświetlony ≤ 100 ms + 2 klatki bez ruchu myszy.
- Ten sam skos i klik od razu po dojeździe: „Close project” wykonuje się (menu się zamyka).
- Regresja: `menu.spec.ts` (pigułka rodzica na wyzwalaczu podmenu przy przecinaniu wierszy), `context-menu.spec.ts`, cała `menubar.spec.ts`.

## Ryzyka

- Łatka rośnie z ok. 30 do ok. 80 linii w dwóch plikach Base UI: przy każdej aktualizacji Base UI trzeba ją przenieść (`bun install` pada, gdy łatka się nie nakłada, więc nie przejdzie cicho).
- Reguła 1 może zamknąć podmenu przy niezdarnym ruchu, który na chwilę cofa się w poziomie. Jeśli testy albo ocena właściciela to pokażą, wzorem React Aria tolerujemy 2 złe ruchy.

## Poza planem

- Zgłoszenie w Base UI (publiczne): osobna decyzja właściciela.
- Wejście do podmenu z opóźnieniem otwarcia (`delay` wyzwalacza zostaje 0).
