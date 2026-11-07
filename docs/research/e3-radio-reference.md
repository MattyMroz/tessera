---
kind: research
created: 2026-11-05
subject: radio
---

# Radio: referencja właściciela (Gustavo, X, 04.11)

## Źródło

- Post: https://x.com/guhrodrrigues/status/2118003586873352510 („bring your ui controls to life”, 12 s, 60 kl./s, 2560 × 1440).
- Pobrany: `tmp/ref/radio/2026-11-04-x-gustavo-bring-your-ui-controls-to-life-https-t-co-0zyf8yiy12/` (`media/*.mp4`, `content.md`).
- Klatki: `frames/sheet.png` (cały film, 2 kl./s), `frames/radio-sheet.png` (samo Radio, 1,2–3,8 s, 20 kl./s = 50 ms na klatkę).
- Właściciel (05.11): „tylko radio powinno tak wyglądać”; nie mówi, że nasza animacja jest zła, chce porównania.

## Co widać (Radio)

- Spoczynek: cienki jasny pierścień; hover: jasnoszare wypełnienie koła.
- Zaznaczenie: koło na chwilę maleje (ok. 0,6 rozmiaru), w tej samej klatce staje się czarne z małą białą kropką w środku, potem w następnej klatce przeskakuje ponad rozmiar (ok. 1,1) i w 2–3 klatkach (ok. 100–150 ms) siada na 1. Odbicie sprężyny: wciśnięcie → przeskok → osiadanie.
- Stan zaznaczony: gruby czarny pierścień (pełne czarne koło z białym otworem ok. 35 % średnicy), nie mała kropka na jasnym tle.
- Odznaczenie: biały otwór rośnie na zewnątrz, pierścień cienieje do cienkiego ciemnego, potem kolor gaśnie do jasnego pierścienia; ok. 4–5 klatek (200–250 ms).
- Checkbox i Switch w tym samym filmie: Checkbox ciemny kwadrat ze znakiem, Switch zielony z białym kciukiem; poza zakresem tej notatki.

## Czy Radio można odznaczyć

- W filmie tak: drugie kliknięcie w zaznaczone Radio je odznacza. To demonstracja pojedynczej kontrolki, nie grupy.
- Standard: nie. HTML (`<input type="radio">`), WAI-ARIA (`radiogroup`: dokładnie jedna opcja wybrana po pierwszym wyborze) i Base UI `RadioGroup`: kliknięcie zaznaczonej opcji nic nie zmienia; wybór zmienia się tylko przez wybór innej opcji. Do odznaczania służy Checkbox albo Switch.
- Rekomendacja: Radio w Tesserze bez odznaczania; z referencji bierzemy wygląd i ruch zaznaczenia i odznaczenia (odznaczenie poprzedniej opcji, gdy wybierasz inną). Decyzja właściciela.

## Do zrobienia (krok 2 procesu elementu: warianty na żywo)

- Porównanie obok siebie w laboratorium: obecne Radio Tessery i wariant według referencji (gruby pierścień, wciśnięcie → przeskok → osiadanie przy zaznaczeniu, rosnący otwór przy odznaczeniu), na tych samych rozmiarach `xs`–`xl`, klatki obu przy 50 ms.
- Ruch tylko `transform` i `opacity`; czas i krzywa z silnika `motion` (`choice`); kolor znaku zależny od akcentu (M-17).
