# at.tension Show Planner

Archivierter Planer für at.tension #11 (2026). Die App ist statisch; Programmdaten werden über den GitHub-Actions-Workflow aus `https://attension-festival.de/programm` aktualisiert.

## Nächstes Festival

1. Prüfen, ob `scripts/` und `.github/workflows/update-program.yml` weiterhin zur Struktur der Programmseite passen.
2. Den Workflow wieder zeitgesteuert aktivieren oder manuell ausführen.
3. Die erzeugte `data.json` auf Spielzeiten, parallele Shows, Beschreibungen und Programm-Links prüfen.
4. In `app.js` die Festivaldaten im `dayMap` für den iCal-Export anpassen.
5. GitHub Pages testen.

Lokal starten: `python -m http.server`
