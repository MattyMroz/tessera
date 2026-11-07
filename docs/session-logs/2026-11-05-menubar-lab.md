---
kind: session
status: ready-to-resume
created: 2026-11-05
subject: lab-menubar
---

# Punkt wznowienia: laboratorium ze wszystkimi elementami, Menubar przyjęty wizualnie

## Cel

Laboratorium `/` (trzy kolumny: lista | elementy | panel) jako miejsce oceny elementów; poprawianie elementów po kolei według uwag właściciela.

## Czytaj przy wznowieniu

1. `docs/plans/e3-lab.md` (REQUIRED): szablon tymczasowy, stan elementów (przyjęte: Button wstępnie, Checkbox „jako tako”, Menubar wizualnie), uwagi właściciela, co do sprawdzenia później.
2. `docs/plans/e3-menubar.md` (REQUIRED): co zrobione w Menubarze i co otwarte.
3. `docs/decisions/e3-choices.md`, sekcja „Do decyzji właściciela (otwarte)” (REQUIRED).
4. `docs/decisions/e3-scroll-lock.md` (ON DEMAND): Select bez blokady, wyjątek `PAGE_SCROLLER`.

## Skille do wczytania

- `tessera-element`, `workflow`, `coding` (+ `references/typescript-javascript.md`, `html-css.md`).

## Stan repo

- branch `feat/e3-motion`, HEAD `00e682c`; commity tej sesji: `3d96d37` (laboratorium), `cae3d45` (Select bez blokady), `00e682c` (Menubar, Switch). Nic nie wypchnięte.
- pre-push padnie na `bunx vitest run`: budżet B6 `menubar.js` 3586 B > 3072 B oraz 4 kontrakty laboratorium (Context menu, Menubar, Select na < 2 stronach; brak sekcji edges dla nich).
- `git stash@{0}`: odrzucona przebudowa laboratorium z 04.11 (zawiera też stare testy menu, np. `menu.spec.ts` ze slotem `mark`); nie przywracać bez polecenia.
- podgląd: `next dev` na 127.0.0.1:4450 (po buildzie paczki: zatrzymać, usunąć `apps/docs/.next`, postawić od nowa).

## Następne kroki (kolejność do potwierdzenia przez właściciela)

00. 06.11: runda „wszystko naraz” (ToggleGroup, odbicie Switcha, Tooltip, Slider) odrzucona przez właściciela w całości i cofnięta; od nowa, jeden element naraz, według skilla `tessera-element`. Wymagania właściciela z tej oceny:
    - ToggleGroup: szara pigułka hover przelatuje pod wybraną z widocznym ruchem, na lewo i na prawo od wybranej opcji. Chowanie jej w locie nad wybraną jest błędem.
    - Switch: ma mocniej odbijać. Odbicie przez większy wybieg, który ściana toru zamienia w ściśnięcie (kciuk dosunięty do krawędzi, krzywy), jest złe.
    - Tooltip: ze strzałką; domyślnie nad triggerem, pod nim tylko, gdy nad nim brak miejsca; przy pionowym rzędzie domyślnie z prawej, z lewej, gdy z prawej brak miejsca.
    - Slider: musi być miejsce w laboratorium, gdzie da się go sprawdzić; sama karta nie wystarcza.
01. `ToggleGroup`: patrz punkt 0 i `e3-choices.md` (otwarte).
02. Budżet B6 `menubar.js`: odchudzić pasek albo decyzja o limicie.
03. Migracja testów laboratorium na `/`: kontrakt „≥ 2 strony” i sekcje edges dla Context menu, Menubar, Select; testy szablonu (`toggle-group.spec.ts` grupa trybu, `lab.spec.ts` „starts no colour animation…”, `edges.spec.ts` nawigacja „Pages”, `menu.spec.ts` slot `mark`, `interaction.spec.ts` triggery paska bez grupy wciśnięcia, kropka Selecta `scale` 220 ms).
04. Context menu chowa pasek przewijania (Base UI zawsze modalne): przebudowa na `Menu` z `modal={false}` i kotwicą w miejscu kursora; decyzja właściciela.
05. Ślad wydajności Menubara przy CPU ×4 (nie zrobiony).
06. Do przemyślenia: odbicie `choice` przy oddaleniu za słabe; wciśnięcie triggerów paska przy ogólnych zasadach kotwic; hover listy nawigacyjnej (z przyszłym komponentem); lupa 2× w podglądzie VS Code.
07. Kolory i ciemny tryb: M-17.
08. Radio: referencja właściciela i obserwacje w `docs/research/e3-radio-reference.md` (gruby czarny pierścień, przeskok przy zaznaczeniu, rosnący otwór przy odznaczeniu). Zrobić porównanie na żywo: obecne Radio kontra wariant z referencji. Odznaczanie Radio: rekomendacja nie (standard HTML, ARIA, Base UI), decyzja właściciela.
09. Zasady ruchu z TikToka (06.11): `docs/research/e3-motion-rules-tiktok.md`, czyli 20 zasad kontra silnik `motion`. Popupy zostają natychmiastowe, pigułka hover zostaje na ease-out (decyzje w `e3-choices.md`). Do decyzji: kciuk Switcha 12 % kontra 25 %.
10. Zrobione 06.11: trójkąt podmenu (łatka Base UI, przyjęty na żywo, `docs/plans/e3-submenu-triangle.md`).
11. Propozycja właściciela (06.11, pytanie, nie zlecenie): wskaźnik przewijania w popupie, który się nie mieści (dziś pasek ukryty, `scrollbar-width: none` w `surface`). Rekomendacja: cienki pasek nakładany (Base UI `ScrollArea`, bez rynien) dla każdej przewijanej powierzchni; alternatywa: strzałki u góry i dołu jak w macOS (Base UI ma je tylko dla Selecta). Osobny element według procesu.

## Reguły, które muszą przetrwać

- „Tak jest, Generale”, krótko; jedno zadanie naraz; status najwyżej „gotowe do oceny”; nie pytać w kółko o zgodę na rzecz już zleconą.
- Grupy w laboratorium: jedna grupa = jedna cecha (wzór Button), nigdy kilka rzeczy pod jednym podpisem.
- Odbicie tylko przy wyborze (`choice`), bez odbicia przy podążaniu za kursorem (`follow`).
- Nigdy nie transformuj kotwicy popupu; animuj jej części i płytkę `::before`.
- Test przed poprawką ma być czerwony; testy po zmianie JS paczki dopiero po `bun run build`.
- Commit na słowo właściciela, bez śladów AI; push dopiero przy zielonym pre-push.
