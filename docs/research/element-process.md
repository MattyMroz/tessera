---
kind: research
status: draft
created: 2026-11-03
subject: proces jednego elementu i skill tessera-element
---

# Research: jak dodawać nowy element i jak zapisać ten proces jako skill

## Pytanie

1. Jak najlepsze zespoły systemów projektowania prowadzą nowy komponent od pomysłu do akceptacji (fazy, bramki, artefakty)?
2. Co według źródeł sprawia, że skill agenta poprawia wynik, a co go pogarsza?

Cel: skill `tessera-element`, wczytywany przy każdym dodaniu albo przeróbce jednego elementu, który zmienia zachowanie agenta tak, żeby porażki rundy D nie wróciły.

## Porażki rundy D (baseline, relacjonowany przez właściciela, nie zmierzony)

- kod bez planu, trzy elementy naraz;
- łatanie objawów punktowo, cztery przeróbki jednej animacji (kreska Checkboxa);
- wygląd z dokumentów zamiast z pomiaru na ekranie;
- „zrobione” bez akceptacji właściciela;
- zmiany, gdy właściciel tylko pytał; zmiana skali Checkboxa i Radia bez zgody;
- element bez hovera, z obwódką albo skalą wbrew klasie elementu;
- połówki pikseli i część przesunięta o piksel od środka;
- Opus do pracy mechanicznej, subagenci uruchomieni na złym modelu;
- zmiany kodu w trakcie bramki, operacje nieodwracalne (`rm -r` katalogu).

## 0. Nasze referencje (pierwszy krok każdego elementu)

Zanim powstanie plan, wiemy, co budujemy: z czego element się składa (części), jakie ma stany i jak się rusza. Źródła w tej kolejności:

- posty z X: `docs/research/inspiration.md`, `tmp/v2/docs/inspiration-posts.md`, inspiracje z Discorda `tmp/ref/insp/index.md`;
- Apple (pobrane): `tmp/ref/apple/`; pozostałe pobrane wzorce: `tmp/ref/` (`layout`, `site`, `islands`, `vscode`, `bridgemind`);
- v2: `tmp/v2/` (plany, research, kod) i galeria v2 na żywo, mierzona na ekranie;
- wyszukiwarka po wszystkim: `python -I tmp/search.py "<słowa>"`;
- dopiero potem biblioteki z sekcji 1 (jak definiują stany i bramki).

Wynik tego kroku: lista części elementu i pełna lista stanów (spoczynek, hover, gaśnięcie, wciśnięcie, wybór, ruch w obie strony, fokus, wyłączenie, błąd, rozmiary `xs`–`xl`, osie motywu, dotyk), każdy z referencją, z której go bierzemy.

## 1. Proces komponentu w systemach projektowania

Źródła przeczytane:

- **Primer** (https://primer.style/product/contribute/adding-new-components): pięć faz po kolei: istnieje i jest odkrywalny, podstawowa jakość designu, dokumentacja, dostępność (axe bez błędów), gotowy do upstreamu. Bramkę upstreamu trzymają maintainerzy; kryteria: potrzebny wielu zespołom, dobrze rozwiązuje problem, bez skutków ubocznych (m.in. wydajność), pasuje do motywu, wart utrzymania.
- **Carbon** (https://carbondesignsystem.com/contributing/get-started/overview/, https://carbondesignsystem.com/contributing/component-checklist/): eksperymenty żyją osobno (Carbon Labs), dopóki nie spełnią „definition of done”. Checklista: specyfikacja tylko z tokenów, wymiary, wszystkie stany (hover, focus, selected, disabled, read-only, error), zachowania (overflow, responsywność), kontrast i fokus; kod bez magic numbers; regresja wizualna zrzutami (Percy) na domyślnym i trudnych stanach; czytniki ekranu ręcznie. Stable dopiero, gdy wszystkie kategorie spełnione.
- **GOV.UK** (https://design-system.service.gov.uk/community/contribution-criteria/): dwie bramki. Przed pracą: useful i unique (nie duplikuje istniejącego). Przed publikacją: usable, consistent, versatile.
- **React Spectrum** (https://github.com/adobe/react-spectrum/blob/main/CONTRIBUTING.md): większa zmiana zaczyna się od RFC; każdy stan wizualny ma swoją story; testy, lint i typy w CI; dokumentacja razem ze zmianą.
- **Base UI** (https://github.com/mui/base-ui/blob/master/CONTRIBUTING.md): duża zmiana od issue z uzasadnieniem; mały PR z testami, typami i stroną docs; regresja wizualna zrzutami (Argos); merge po zielonym CI.
- **Radix** (https://github.com/radix-ui/primitives/blob/main/.github/CONTRIBUTING.md): issue i dyskusja przed dużą zmianą; złożoność tylko gdy nieunikniona.
- **Atlassian** (https://atlassian.design/contribution): nowych komponentów z zewnątrz nie przyjmuje; brak opisu faz.

Nie otwarto (bez wniosków): Polaris (przekierowanie), Material 3 (strony bez treści), artykuły Nathana Curtisa (403), kryteria dojrzałości Primera.

Wspólny rdzeń źródeł:

1. uzasadnienie: potrzeba i brak duplikatu;
2. specyfikacja przed kodem: anatomia, tokeny, pełna matryca stanów, zachowanie;
3. zatwierdzenie specyfikacji przez właściciela systemu;
4. kod tylko z tokenów, story albo przykład na każdy stan;
5. testy: jednostkowe, dostępność, regresja wizualna zrzutami;
6. dokumentacja razem z kodem;
7. przegląd końcowy z checklistą i dopiero wtedy status stabilny.

Luka: żadne przeczytane źródło nie opisuje porównania kilku kandydatów wyglądu przed wyborem ani ruchu jako osobnej bramki. Krok „kandydaci na żywo” jest nasz, bez wzorca w źródłach.

## 2. Skuteczny skill agenta

- **Anthropic, Skill authoring best practices** (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): `description` mówi co i kiedy; rdzeń poniżej 500 linii; swoboda dopasowana do kruchości (wąski most: dokładne kroki i lista kontrolna); pętla waliduj, popraw, powtórz; jedna domyślna droga zamiast menu opcji; tylko to, czego model nie wie; ewaluacja przed pisaniem: agent bez skilla, realne porażki, co najmniej 3 scenariusze.
- **Claude Code, skills** (https://code.claude.com/docs/en/skills): załadowany skill zostaje w kontekście; po kompakcie wraca najwyżej pierwsze 5000 tokenów skilla, więc najważniejsze reguły na początek pliku.
- **Claude Code, best practices** (https://code.claude.com/docs/en/best-practices): Claude kończy, gdy praca wygląda na skończoną, więc warunek ukończenia to dowód pass/fail (komenda i wynik, zrzut obok wzorca); po dwóch nieudanych poprawkach tej samej rzeczy nie robić trzeciej, tylko zacząć od lepszego ujęcia; reguły bez wyjątków egzekwuje hook albo strażnik, nie tekst; niezależny przegląd świeżym subagentem; tańszy model do rutyny.
- **Building effective agents** (https://www.anthropic.com/engineering/building-effective-agents): najprostsze rozwiązanie; prawda ze środowiska w każdym kroku; punkty kontrolne człowieka i warunek stopu.
- **SkillsBench** (https://arxiv.org/html/2602.12670v1): skille kuratorowane średnio +16 pkt proc., wygenerowane przez model bez kuracji ok. −1,3 pkt proc.; najlepiej działają zwięzłe, z jednym działającym przykładem, z wiedzą proceduralną, której model nie ma; wyczerpujące wypadają gorzej. Zastrzeżenie: zadania spoza UI, przeniesienie na nasz przypadek to ekstrapolacja.
- **Evaluating AGENTS.md** (https://arxiv.org/abs/2602.11988, tylko abstrakt): pliki kontekstu zwykle nie poprawiają wyniku i podnoszą koszt; pomagają niestandardowe praktyki projektu.
- **Anthropic frontend-design skill** (https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md): plan, build, krytyka; bez akceptacji człowieka i bez pomiarów, więc nie jest wzorem dla naszego problemu.

## Wnioski dla skilla (propozycja, do decyzji właściciela)

1. Bramki: referencje (sekcja 0: części i stany) → uzasadnienie → specyfikacja z pełną matrycą stanów i ruchu → akceptacja właściciela → kod → dowody → „gotowe do oceny” → akceptacja właściciela.
2. Matryca stanów przed kodem (spoczynek, hover, gaśnięcie, wciśnięcie, wybór, ruch w obie strony, fokus, wyłączenie, błąd, rozmiary `xs`–`xl`, osie motywu, dotyk): luka wychodzi w specyfikacji, nie w łataniu.
3. Reguła dwóch porażek: druga nieudana poprawka tej samej rzeczy to stop, przyczyna w silniku albo przepisie i nowy plan do akceptacji.
4. Ukończenie tylko z dowodem: pomiar, zrzuty z bliska, klatki ruchu, ślad głównego wątku, `bun run check`; raport zawiera komendę i wynik.
5. Reguły bez wyjątków (commit, jeden element, komentarze, ruch z silnika) do strażników i hooków; skill tylko odsyła.
6. Skill krótki, najważniejsze na początku, jeden przykład dobrego przebiegu, bez powtarzania `AGENTS.md`.
7. Mechanika (pomiary, zrzuty, research ze źródłami, przegląd) do Sonneta, decyzje i wygląd u Opusa.
8. Skill sprawdzamy na żywym materiale, przy budowie następnego elementu, nie osobnymi testami na agencie (decyzja właściciela 03.11); każda porażka w tej pracy wraca jako poprawka skilla.

## Nierozstrzygnięte

- Warianty (2–4 wersje wyglądu i ruchu na żywo, właściciel wybiera; zasada właściciela z 14.10): szybkie próby wyrzucane po wyborze, bramka dopiero przed kodem docelowym, czy żaden kod przed wyborem? Rekomendacja: próby wyrzucane, bramka przed kodem docelowym.
