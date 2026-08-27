# at.tension Show Planner

Kleine statische Webapp zur persönlichen Programmplanung für at.tension #11.

## Funktionen

- Tages-Tabs und chronologische Zeitblöcke
- Filter nach Show-Typ
- Auswahl eines persönlichen Plans
- Detailansicht mit Beschreibung und Link zum offiziellen Programm
- PDF-Druck und iCal-Export

## Daten

`data.json` enthält die Show-Termine. Sie wird aus `at.tension-2026.xlsx` erzeugt; bei leeren Zeit-Zellen im Tab `Show-Kalender` muss die letzte Zeit nach unten übernommen werden, damit parallele Shows korrekt gruppiert werden.
