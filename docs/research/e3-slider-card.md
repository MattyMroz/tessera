---
kind: research
status: draft
updated: 2026-11-09
---

# Karta elementu: Slider

Wymagania właściciela: `decisions/e3-choices.md`, „Slider: wymagania właściciela przed kartą (09.11)”. Materiał: posty w `tmp/ref/insp/x/`, biblioteki w `tmp/ref/slider/` (zrzuty stanów, klatki w `s/*-frames.json`).

## Cel

Wybór wartości z zakresu w panelach ustawień MangaShift (rozmiar, krycie, głośność, moc modelu). Rodzina: suwak (ten element), potem liczba przeciągana w bok (Scrub, osobny element).

## Referencje

| Źródło                         | Co bierzemy                                                                                                                                                                                    | Błąd wzorca                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Kevin @keviduk, 28.10          | kciuk w spoczynku cienka kreska, przy chwycie rośnie w pigułkę wyższą od toru, przy puszczeniu wraca; nazwy stopni (Low, Medium, High, Extra high); ta sama geometria co nasz Switch i segment | nazwa stopnia przewija się 0,2–0,3 s (opóźnienie informacji)              |
| Nitish @nitishkmrk, 09.11      | wypełnienie to jedna pigułka z wartością w środku, rośnie z wartością                                                                                                                          | chwyt to kreska 1 px; brak squisha                                        |
| Mikk Martin (prototyp na żywo) | cały wiersz to suwak: etykieta po lewej, wartość po prawej, kropki kroków gasną pod kciukiem; skala wiersza na krańcu                                                                          | `width` wypełnienia i `height` kreski w ruchu (układ w klatce)            |
| Arc UI Elastic                 | rozciągnięcie toru za krańcem tylko `scaleX` 1,07 i `scaleY` 1,45; kciuk `scale` 1,28 przy chwycie; strefa trafienia kciuka +12 px                                                             | sprężyny w JS w każdej klatce                                             |
| Arc UI Slider, Number field    | —                                                                                                                                                                                              | cyfry rolowane (odrzucone przez właściciela)                              |
| Base UI Slider                 | zachowanie: klawiatura (strzałki, Page, Home/End, Shift = duży krok), krok, kliknięcie w tor, pointer capture, `data-dragging`, natywny `input[type=range]`, Field/Form                        | kciuk i wypełnienie pozycjonowane układem (`inset-inline-start`, `width`) |
| shadcn, Material Web           | —                                                                                                                                                                                              | kciuk-kropka bez ruchu, pozycja układem                                   |
| Material 3 Expressive          | kciuk jako pionowa pigułka, zmiana kształtu przy chwycie, wartość tylko w trakcie dotyku                                                                                                       | na żywo niezweryfikowane                                                  |
| Apple HIG                      | wypełnienie od minimum, ikony końców, wartość także w polu przy szerokim zakresie                                                                                                              | —                                                                         |

## Części

- `Root` (gospodarz, `data-dragging`), `Track` (pigułka toru), `Indicator` (wypełnienie), `Thumb` (kciuk z ukrytym `input`), `Value` (`<output>`, `tabular-nums`). Opcjonalnie kropki kroków.
- Dostawca: Base UI Slider. Ryzyko do planu: jego pozycja przez układ trzeba zastąpić wartością instancji `--ts-i-*` (postęp 0–1), z której przepis liczy `translate` kciuka i `scale` wypełnienia.

## Stany

- **Spoczynek:** kciuk kreską albo pigułką (wariant), wypełnienie do wartości.
- **Hover:** płytka toru z drabinki `state`, gaśnięcie 150 ms.
- **Chwyt:** kciuk rośnie (`scale`), squish w `choice` z odbiciem.
- **Przeciąganie:** wartość w tej samej klatce, bez rolowania.
- **Kraniec:** tor rozciąga się `scaleX`/`scaleY` i wraca.
- **Puszczenie:** kciuk wraca do spoczynku.
- **Klawiatura:** krok skacze w `follow`.
- **Fokus:** przepis `focus`.
- **Wyłączenie:** z `state`.
- **Kroki:** kropki gasną pod kciukiem.

Rozmiary `xs`–`xl` z silnika `size` (wysokość toru = wysokość kontrolki). Osie `corners` i `curve` dają kształt (kwadratowa pigułka albo kapsuła), `density`, `motion` (`off` i `prefers-reduced-motion`: bez skali i rozciągania). Dotyk: strefa trafienia, `touch-action: pan-y`.

## Wydajność

- Ruch tylko `translate`, `scale`, `opacity`.
- JS zapisuje jedną wartość instancji na zmianę wartości. Sprężyny i rozciągnięcie robią przejścia CSS, nie rAF.

## Warianty do kroku 2 (na żywo)

- **A „Kevin”:** cienki tor, kciuk-kreska rośnie przy chwycie w pigułkę wyższą od toru.
- **B „Nitish”:** wypełnienie to pigułka z wartością w środku, tor tła, chwyt rozciąga pigułkę (pigułka jak w `ToggleGroup`).
- **C „Mikk”:** suwak jako wiersz pełnej wysokości kontrolki, etykieta i wartość w torze, kropki kroków.
- **D „kulka”:** klasyczny kciuk okrągły, squishy przy chwycie i na krańcu (Arc Elastic na CSS).

Wspólne dla wszystkich: rozciągnięcie toru na krańcu i wartość natychmiast.

## Luki

- Profil @CJfromJBW nieprzejrzany pod kątem suwaków.
- Squish w postach niewidoczny przy 2–4 kl./s; momenty chwytu i puszczenia u Kevina do wycięcia gęściej.
- Material 3 Expressive niezmierzony na żywo.
