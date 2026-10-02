# FORGE52 – Dein Trainingsjahr bei McFit

Eine Trainings- und Lernplattform als Web-App fürs Handy: ein periodisierter **52-Wochen-Plan** mit genauen Geräten, Sätzen, Wiederholungen und Pausen, dazu ein Trainings-Tracker, eine Übungsbibliothek und eine Akademie mit Quiz.

**Live:** https://samubraila.github.io/tranning-platform/

## Funktionen

- **Jahresplan (52 Wochen, 6 Phasen):** Fundament → Aufbau → Hypertrophie I → Kraft → Hypertrophie II → Definition & Peak, mit Deload- und Testwochen.
- **Heute-Ansicht:** zeigt das Training des Tages, die Wochenübersicht, verpasste Einheiten zum Nachholen und Ruhetags-Empfehlungen.
- **Training tracken:** Gewicht und Wiederholungen pro Satz eintragen, „Vorher“-Werte, Pausen-Timer mit Ton/Vibration, Übungen tauschen, wenn ein Gerät besetzt ist.
- **Automatische Steigerung (doppelte Progression):** Die App schlägt vor, wann du das Gewicht erhöhen solltest, und erkennt neue Bestleistungen.
- **62 Übungen** für McFit-Geräte, Kabelzug, Kurz- und Langhanteln: Einstellung, Ausführung, häufige Fehler, Profi-Tipps, Alternativen, Technik-Videos und deine eigene Geräte-Einstellung.
- **Akademie:** 15 Lektionen (Muskelaufbau, RIR, Technik, McFit-Guide, Periodisierung, Ernährung, Supplements, Schlaf, Cardio, Motivation), jede mit Quiz.
- **Kalorien- und Makro-Rechner** (Mifflin-St-Jeor).
- **Fortschritt:** Volumen pro Woche, Kraftkurve pro Übung, Körpergewicht, 23 Erfolge, XP und Level, kompletter Verlauf.
- **Offline-fähig (PWA):** lässt sich wie eine App auf den Home-Bildschirm legen. Die Daten bleiben nur auf deinem Gerät, und du kannst sie als Backup exportieren und wieder importieren.

## Der Plan im Überblick

| Phase | Wochen | Split | Einheiten/Woche | Wiederholungen | Ziel |
|---|---|---|---|---|---|
| 1 · Fundament | 1–8 | Ganzkörper A/B | 3 | 12–15 | Geräte & Technik lernen |
| 2 · Aufbau | 9–16 | Ganzkörper A/B/C | 3 | 8–12 | Freie Gewichte, Grundkraft |
| 3 · Hypertrophie I | 17–28 | Oberkörper / Unterkörper | 4 | 6–12 | Muskelaufbau |
| 4 · Kraft | 29–36 | Oberkörper / Unterkörper | 4 | 5–10 | Stark werden |
| 5 · Hypertrophie II | 37–46 | Beine · Push · Pull · Ganzkörper | 4 | 8–15 | Volumen & Drop-Sätze |
| 6 · Definition & Peak | 47–52 | Ganzkörper + Supersätze | 3 | 8–15 | Form zeigen, Jahrestest |

Innerhalb jeder Phase steigt die Intensität von Woche zu Woche (RIR 3 → 0–1). Danach folgt eine Deload-Woche mit halbem Volumen.

## Auf dem Handy nutzen

1. Den Link oben im Handy-Browser öffnen.
2. **iPhone (Safari):** Teilen → *Zum Home-Bildschirm*.
   **Android (Chrome):** Menü ⋮ → *App installieren*.
3. Die App startet dann im Vollbild und funktioniert auch ohne Internet.

> Die Trainingsdaten werden im Browser des Geräts gespeichert (localStorage). Vor einem Handywechsel oder bevor du die Browserdaten löschst: **Einstellungen → Backup**.

## GitHub Pages einrichten (einmalig)

Repository auf GitHub → **Settings → Pages** → *Source: Deploy from a branch* → Branch **main**, Ordner **/ (root)** → *Save*.
Nach etwa einer Minute ist die App unter `https://<benutzername>.github.io/tranning-platform/` erreichbar.

## Lokal starten

Es gibt keinen Build-Schritt, die App besteht aus reinem HTML, CSS und JavaScript (ES-Module). Ein beliebiger statischer Server reicht:

```bash
npx serve .
# oder
python -m http.server 8080
```

Wenn du Dateien änderst, erhöhe `VERSION` in `sw.js`. Dann laden installierte Apps die neue Version.

## Projektstruktur

```
index.html              App-Shell
manifest.webmanifest    PWA-Manifest
sw.js                   Service Worker (Offline-Cache)
css/app.css             Design-System (hell/dunkel)
js/main.js              Start, Routen, Navigation
js/router.js            Hash-Router + Event-Delegation
js/store.js             Speicherung (localStorage)
js/logic.js             Woche, Fortschritt, Vorschläge, Rekorde, Erfolge
js/data/exercises.js    Übungsdatenbank (McFit)
js/data/program.js      52-Wochen-Plan, Phasen, Trainingseinheiten
js/data/academy.js      Lektionen, Quiz, Tipps, Erfolge
js/views/*.js           Ansichten (Heute, Plan, Training, Übungen, Akademie, Fortschritt, Einstellungen)
js/ui/*.js              Diagramme, Timer, Dialoge
```

## Hinweis

Die Inhalte ersetzen keine ärztliche Beratung. Wenn du Vorerkrankungen oder Beschwerden hast, klär das Training vorher mit einem Arzt oder einer Ärztin ab. Gerätenamen und Ausstattung können je nach McFit-Studio abweichen; zu jeder Übung gibt es Alternativen. McFit ist eine Marke der RSG Group. Diese App ist ein unabhängiges privates Projekt.
