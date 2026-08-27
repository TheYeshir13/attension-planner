# at.tension Show Planner

Statische Webapp zur persönlichen Programmplanung für at.tension #11.

## Funktionen

- Tages-Tabs und chronologische Zeitblöcke
- Filter und Farbcodierung nach sechs Kategorien:
  `Vouchershow`, `Theater/Tanz/Zirkus`,
  `Sideshows/Walkacts/Installationen`, `Kinderprogramm` und
  `Kino/Workshops/Lesungen` sowie `Musik`
- Shows zum persönlichen Plan hinzufügen und daraus entfernen
- Detailansicht mit Beschreibung, Bühne und Link zum offiziellen Programm
- Export als PDF oder iCalendar-Datei (`.ics`)

## Datenaktualisierung

Die Termindaten in `data.json` werden direkt aus der offiziellen
[Programmseite](https://attension-festival.de/programm) erzeugt. Der
dependency-freie Scraper
[`scripts/fetch_program_from_website.py`](scripts/fetch_program_from_website.py)
liest die Spielzeiten aus den Programmdetails und übernimmt Beschreibungen,
Bühnen, Genres und Programmlinks.

Die Kategorie wird direkt aus der jeweiligen Kategorie-Sektion der Website
übernommen. Das ursprüngliche Website-Genre bleibt zusätzlich im Feld `genre`
erhalten.

GitHub Actions führt die Aktualisierung täglich aus. Der Workflow kann auch
manuell gestartet werden:

`.github/workflows/update-program.yml`

Für eine lokale Aktualisierung:

```bash
python scripts/fetch_program_from_website.py data.json
```

Der Scraper bricht bei einer leeren oder unerwarteten Antwort ab, damit eine
funktionierende `data.json` nicht versehentlich überschrieben wird.

## Lokale Nutzung

Da der Browser `data.json` per `fetch` lädt, muss die App über einen lokalen
Webserver gestartet werden:

```bash
python -m http.server
```

Danach `http://localhost:8000` öffnen. Alternativ kann das Repository direkt
über GitHub Pages veröffentlicht werden.

## Projektstruktur

```text
.
├─ index.html
├─ styles.css
├─ app.js
├─ data.json
├─ scripts/
│  ├─ fetch_program_from_website.py
└─ .github/workflows/update-program.yml
```
