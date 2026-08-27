# at.tension Show Planner

Eine kleine Webapp, um für das at.tension‑Festival einen persönlichen Show‑Plan zu erstellen:  
Shows nach Tag und Uhrzeit anzeigen, Favoriten auswählen und den eigenen Plan als PDF (Druck) oder iCal‑Datei (`.ics`) exportieren. Die App läuft komplett im Browser und kann statisch über GitHub Pages gehostet werden.

## Features

- **Kalenderansicht** nach Tag und Zeit basierend auf dem Festivalprogramm
- **Auswahl per Checkbox**: Shows hinzufügen/entfernen und einen persönlichen Plan zusammenstellen
- **Export als PDF** über die Druckfunktion des Browsers (Print‑optimiertes Layout)
- **Export als iCal (.ics)** für Kalender‑Apps (inkl. Start‑/Endzeit pro Show)
- **Mobil optimiert**: Einspaltige Ansicht mit Tag‑Filter, gut bedienbar auf dem Handy

## Festivaldaten

Das Festival findet von **03.09.2026 (Donnerstag)** bis **06.09.2026 (Sonntag)** statt.  
Die iCal‑Events werden diesen Daten zugeordnet:

- `Do` → `2026-09-03`
- `Fr` → `2026-09-04`
- `Sa` → `2026-09-05`
- `So` → `2026-09-06`

Die Endzeit der Events wird aus der im Datensatz hinterlegten Dauer (z.B. „50 Min.“) berechnet.

## Tech-Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Datenbasis**: `data.json` (aus dem Excel‑Kalender generiert)
- **Hosting**: GitHub Pages als statischer Host[cte:18]

Es gibt keinen Server‑Teil; alle Daten werden clientseitig geladen und verarbeitet.

## Projektstruktur

Typische Struktur im Repository:

```text
.
├─ index.html      # Einstiegspunkt der Webapp (UI, Layout)
├─ styles.css      # Styles, responsives Layout, Typ-Farben
├─ app.js          # Logik: Laden der Daten, Kalender, Auswahl, Export
└─ data.json       # Shows mit Tag, Zeit, Typ, Bühne, Dauer etc.
```

### `data.json` – Datenschema

Jeder Eintrag in `data.json` folgt ungefähr diesem Schema:

```json
{
  "title": "Opéra pour sèche cheveux",
  "day": "Fr",
  "time": "11:00",
  "type": "Vouchershow",
  "stage": "V | La Ballena",
  "organizer": "Blizzard Concept",
  "duration": "60 Min.",
  "minAge": 8,
  "language": "englisch"
}
```

Diese Daten kommen aus den Tabs **Shows** und **Show-Kalender** der ursprünglichen Excel‑Datei.

## Nutzung

### Lokal

1. Repository klonen oder ZIP herunterladen:
   ```bash
   git clone https://github.com/DEIN_USERNAME/DEIN_REPO.git
   cd DEIN_REPO
   ```
2. `index.html` im Browser öffnen (Doppelklick oder `python -m http.server` für einen lokalen Webserver).

### Shows auswählen

- Im Kalenderbereich:
  - Tag über das Dropdown („Alle Tage“, „Do“, „Fr“, „Sa“, „So“) wählen.
  - In den Zeit‑Slots werden die Shows als Karten angezeigt.
  - Per Checkbox kannst du jede Show deinem persönlichen Plan hinzufügen oder sie wieder entfernen.
- Im Bereich **„Mein Plan“**:
  - Siehst du deine Auswahl chronologisch sortiert (Tag + Uhrzeit + Titel + Bühne).

### PDF-Export

- Auf **„Als PDF (Drucken)“** klicken.
- Der Browser öffnet den Druckdialog.
- Als Druckziel **„Als PDF speichern“** wählen.
- Ergebnis ist eine kompakte PDF mit deinem persönlichen Plan (Kalender wird im Print‑Layout automatisch ausgeblendet).

### iCal-Export

- Auf **„Als iCal (.ics)“** klicken.
- Der Browser lädt eine Datei `attension-plan.ics` herunter.
- Diese Datei kann in gängige Kalender‑Apps (z.B. Google Kalender, Outlook, Apple Kalender) importiert werden.

## Entwicklung und Anpassung

### Daten aktualisieren

- Die Datei `data.json` kann jederzeit aus dem Excel‑Kalender neu generiert werden, z.B. per Skript.
- Wichtig ist, dass die Felder `day`, `time`, `title`, `type` und ggf. `duration`, `stage` korrekt gepflegt sind.

### ICS-Datum anpassen

Falls sich die Festivaldaten ändern, kann die Funktion `toICSDateTime(show)` in `app.js` angepasst werden:

```js
const dayMap = {
  'Do': 'YYYYMMDD',
  'Fr': 'YYYYMMDD',
  'Sa': 'YYYYMMDD',
  'So': 'YYYYMMDD'
};
```

Dabei sollte das Format `YYYYMMDD` beibehalten werden (z.B. `20260903`).

### Styling / Typ-Farben

- In `styles.css` können Typ‑abhängige Farben über Klassen wie `.show-type-Vouchershow`, `.show-type-Theater/Tanz/Zirkus` etc. angepasst werden.
- Das mobile Layout (einspaltig) und das Desktop‑Layout (zweispaltig) sind über Media Queries getrennt definiert.

## Deployment auf GitHub Pages

1. Repository auf GitHub anlegen oder pushen.
2. In den Repository‑Settings „Pages“ konfigurieren:
   - Source: Branch (`main`) und Root‑Verzeichnis.
3. Nach wenigen Minuten ist die App unter `https://DEIN_USERNAME.github.io/DEIN_REPO/` erreichbar.

---

Falls du die App gemeinsam mit anderen pflegen willst, kannst du zusätzlich einen Abschnitt „Contributing“ ergänzen (Branch‑Policy, Issues, Pull Requests etc.).
