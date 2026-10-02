// FORGE52 Akademie – Lerninhalte mit Quiz. Evidenzbasiert, kurz und praxisnah.

export const MODULES = [
  { id: 'grundlagen', name: 'Grundlagen', desc: 'Wie Muskeln wachsen und wie du dich steigerst.' },
  { id: 'technik', name: 'Technik & Sicherheit', desc: 'Aufwärmen, saubere Ausführung, McFit-Guide.' },
  { id: 'planung', name: 'Planung', desc: 'Dein Jahresplan, Periodisierung und Deloads.' },
  { id: 'ernaehrung', name: 'Ernährung', desc: 'Kalorien, Eiweiß und sinnvolle Supplements.' },
  { id: 'lifestyle', name: 'Regeneration & Lifestyle', desc: 'Schlaf, Cardio, Schmerzen und Motivation.' },
];

export const LESSONS = [
  // ───────────── Grundlagen ─────────────
  {
    id: 'muskelwachstum', module: 'grundlagen', title: 'So wachsen Muskeln', minutes: 4,
    intro: 'Muskeln wachsen nicht im Studio, sondern danach. Training ist das Signal, Ernährung und Schlaf liefern das Baumaterial.',
    sections: [
      { h: 'Das Signal: mechanische Spannung', p: 'Der wichtigste Wachstumsreiz ist Spannung im Muskel unter Last. Am stärksten ist sie in den letzten Wiederholungen eines Satzes, wenn die Bewegung langsam und schwer wird. Darum zählen nur „harte“ Sätze wirklich.' },
      { h: 'Wie viel Training?', list: [
        '10–20 harte Sätze pro Muskel und Woche sind für die meisten ideal.',
        'Einsteiger wachsen schon mit 6–10 Sätzen – deshalb startet dein Plan niedriger.',
        'Jeden Muskel ca. 2× pro Woche zu trainieren ist effektiver als 1× pro Woche.',
      ] },
      { h: 'Welcher Wiederholungsbereich?', p: 'Muskeln wachsen in einem breiten Bereich von etwa 5 bis 30 Wiederholungen, solange du nah ans Muskelversagen gehst. In der Praxis sind 6–15 Wiederholungen am effizientesten: schwer genug für Spannung, leicht genug für saubere Technik.' },
      { h: 'Die Bausteine', list: [
        'Training: der Reiz.',
        'Eiweiß & genug Kalorien: das Baumaterial.',
        'Schlaf & Pausen: die Bauzeit.',
      ] },
    ],
    takeaways: ['Harte Sätze nah am Versagen sind der Schlüssel.', '10–20 Sätze pro Muskel/Woche, 2× Frequenz.', 'Wachstum passiert in der Erholung.'],
    quiz: [
      { q: 'Was ist der wichtigste Reiz für Muskelwachstum?', options: ['Muskelkater', 'Mechanische Spannung', 'Schwitzen', 'Langes Training'], correct: 1, explain: 'Mechanische Spannung unter Last ist der Hauptreiz. Muskelkater und Schweiß sagen wenig über den Trainingseffekt aus.' },
      { q: 'Wie oft pro Woche sollte ein Muskel idealerweise trainiert werden?', options: ['1×', 'Etwa 2×', 'Jeden Tag', 'Alle 2 Wochen'], correct: 1, explain: 'Etwa 2× pro Woche ist für die meisten das beste Verhältnis aus Reiz und Erholung.' },
      { q: 'Wann wachsen Muskeln?', options: ['Während des Trainings', 'In der Erholung danach', 'Nur nachts beim Cardio', 'Nur mit Supplements'], correct: 1, explain: 'Das Training setzt den Reiz, der Aufbau passiert in den Stunden und Tagen danach.' },
    ],
  },
  {
    id: 'progression', module: 'grundlagen', title: 'Progressive Überlastung', minutes: 4,
    intro: 'Wer immer das Gleiche macht, bekommt immer das Gleiche. Dein Körper passt sich nur an, wenn du ihn schrittweise mehr forderst.',
    sections: [
      { h: 'Die Doppelte Progression', p: 'Dein Plan nutzt die einfachste und sicherste Methode: Jede Übung hat eine Wiederholungsspanne, z. B. 10–12. Du bleibst beim Gewicht, bis du in ALLEN Sätzen das obere Ende (12) sauber schaffst. Dann erhöhst du das Gewicht und startest wieder unten (10).' },
      { h: 'Beispiel Brustpresse (3 × 10–12)', list: [
        'Woche 1: 40 kg – 12, 11, 10 → Gewicht bleiben',
        'Woche 2: 40 kg – 12, 12, 11 → Gewicht bleiben',
        'Woche 3: 40 kg – 12, 12, 12 → nächstes Mal 45 kg',
        'Woche 4: 45 kg – 10, 10, 9 → weiter steigern',
      ] },
      { h: 'Die App hilft dir', p: 'Im Training siehst du bei jeder Übung, was du letztes Mal geschafft hast, und bekommst einen Vorschlag: Gewicht erhöhen oder Wiederholungen steigern. So musst du dir nichts merken.' },
      { h: 'Fortschritt ist mehr als Gewicht', list: ['Mehr Wiederholungen mit gleichem Gewicht', 'Sauberere Technik und mehr Bewegungsumfang', 'Weniger Unterstützung bei Klimmzügen/Dips', 'Gleiche Leistung mit kürzerer Pause'] },
    ],
    takeaways: ['Erst Wiederholungen, dann Gewicht steigern.', 'Oberes Ende in allen Sätzen = Gewicht erhöhen.', 'Notiere jedes Training – die App macht das für dich.'],
    quiz: [
      { q: 'Bei 3 × 10–12: Wann erhöhst du das Gewicht?', options: ['Wenn ein Satz 12 Wdh hat', 'Wenn alle Sätze 12 Wdh haben', 'Jede Woche automatisch', 'Nie'], correct: 1, explain: 'Erst wenn du in allen Sätzen das obere Ende sauber schaffst, wird das Gewicht erhöht.' },
      { q: 'Was zählt NICHT als Fortschritt?', options: ['Mehr Wiederholungen', 'Mehr Gewicht', 'Schlechtere Technik mit mehr Gewicht', 'Weniger Unterstützung bei Klimmzügen'], correct: 2, explain: 'Mehr Gewicht mit schlechter Technik ist kein echter Fortschritt – der Zielmuskel arbeitet weniger und das Verletzungsrisiko steigt.' },
      { q: 'Nach der Gewichtserhöhung startest du …', options: ['wieder am unteren Ende der Spanne', 'mit dem oberen Ende', 'mit 1 Wiederholung', 'mit einem Satz weniger'], correct: 0, explain: 'Mit mehr Gewicht schaffst du zuerst weniger Wiederholungen – dann arbeitest du dich wieder hoch.' },
    ],
  },
  {
    id: 'rir', module: 'grundlagen', title: 'RIR – Wie hart ist hart genug?', minutes: 3,
    intro: 'RIR heißt „Reps in Reserve“ – Wiederholungen im Tank. Damit steuert dein Plan, wie anstrengend jeder Satz sein soll.',
    sections: [
      { h: 'So funktioniert die Skala', list: [
        'RIR 4: Du könntest noch ca. 4 saubere Wiederholungen machen – locker.',
        'RIR 2: Noch 2 Wiederholungen möglich – fordernd.',
        'RIR 1: Nur noch 1 – sehr hart, die Bewegung wird langsam.',
        'RIR 0: Muskelversagen – keine saubere Wiederholung mehr möglich.',
      ] },
      { h: 'Warum nicht immer bis zum Versagen?', p: 'Versagen in jedem Satz erhöht die Ermüdung stark, bringt aber kaum mehr Wachstum. Sätze mit 0–3 RIR sind fast genauso effektiv. Darum steigt die Härte in deinem Plan über die Wochen an (RIR 3 → 1) und fällt im Deload wieder ab.' },
      { h: 'Einsteiger-Tipp', p: 'Am Anfang schätzt man RIR oft zu hoch ein – man könnte meist mehr, als man denkt. Teste ab und zu bei einer sicheren Maschinen-Übung im letzten Satz, wie viele Wiederholungen wirklich gehen. So lernst du deine Grenze kennen.' },
    ],
    takeaways: ['RIR = Wiederholungen, die du noch schaffen würdest.', 'Die meisten Sätze bei RIR 1–3.', 'Versagen nur gezielt und an sicheren Geräten.'],
    quiz: [
      { q: 'Was bedeutet RIR 2?', options: ['2 Sätze übrig', 'Noch 2 saubere Wiederholungen möglich', '2 Minuten Pause', '2 kg mehr'], correct: 1, explain: 'RIR 2 heißt: Du hörst auf, obwohl noch 2 saubere Wiederholungen gingen.' },
      { q: 'Bei welcher Übung ist Training bis zum Versagen am sichersten?', options: ['Langhantel-Kniebeuge ohne Sicherung', 'Bankdrücken alleine', 'Beinstrecker an der Maschine', 'Kreuzheben'], correct: 2, explain: 'An geführten Maschinen wie dem Beinstrecker kannst du gefahrlos ans Limit gehen.' },
      { q: 'Einsteiger schätzen ihre RIR meist …', options: ['zu hoch ein – sie könnten mehr', 'perfekt ein', 'zu niedrig ein', 'gar nicht'], correct: 0, explain: 'Einsteiger brechen Sätze oft zu früh ab. Gezieltes Testen hilft, die eigene Grenze kennenzulernen.' },
    ],
  },

  // ───────────── Technik & Sicherheit ─────────────
  {
    id: 'aufwaermen', module: 'technik', title: 'Richtig aufwärmen', minutes: 3,
    intro: 'Ein gutes Aufwärmen dauert 8–10 Minuten, macht dich stärker und senkt das Verletzungsrisiko.',
    sections: [
      { h: '1. Allgemein (5–8 Min)', p: 'Locker auf Crosstrainer, Rad oder Laufband, bis du leicht ins Schwitzen kommst. Puls und Körpertemperatur steigen, die Gelenke werden „geschmiert“.' },
      { h: '2. Spezifisch (Aufwärmsätze)', list: [
        'Bei der ersten Übung einer Muskelgruppe: 1 Satz mit ca. 50 % × 10 Wdh.',
        'Dann 1 Satz mit ca. 75 % × 5 Wdh.',
        'Danach starten die Arbeitssätze.',
        'Bei schweren Gewichten (Phase 4) ein dritter Aufwärmsatz mit ca. 85 % × 2–3.',
      ] },
      { h: 'Was du dir sparen kannst', p: 'Langes statisches Dehnen vor dem Training ist nicht nötig und kann kurzfristig die Kraft mindern. Dehnen kannst du nach dem Training oder an freien Tagen.' },
    ],
    takeaways: ['5–8 Min Cardio locker.', '2 Aufwärmsätze bei der ersten Übung.', 'Statisches Dehnen lieber danach.'],
    quiz: [
      { q: 'Wie viele Aufwärmsätze sind bei der ersten Übung sinnvoll?', options: ['Keine', '1–2 (bei schwer bis 3)', '6–8', 'So viele wie Arbeitssätze'], correct: 1, explain: '1–2 Aufwärmsätze reichen meist, bei sehr schweren Gewichten ein dritter.' },
      { q: 'Langes statisches Dehnen VOR dem Training …', options: ['ist Pflicht', 'kann kurzfristig die Kraft mindern', 'ersetzt das Aufwärmen', 'verhindert Muskelkater'], correct: 1, explain: 'Statisches Dehnen vorab kann die Kraft kurzfristig senken und ersetzt kein Aufwärmen.' },
      { q: 'Wie lange sollte das allgemeine Aufwärmen etwa dauern?', options: ['30 Sekunden', '5–8 Minuten', '30 Minuten', '1 Stunde'], correct: 1, explain: '5–8 Minuten genügen, um Puls und Temperatur zu erhöhen.' },
    ],
  },
  {
    id: 'technik', module: 'technik', title: 'Saubere Technik & Verletzungen vermeiden', minutes: 4,
    intro: 'Gute Technik ist kein Selbstzweck: Sie sorgt dafür, dass der richtige Muskel arbeitet – und dass du jahrelang verletzungsfrei trainierst.',
    sections: [
      { h: 'Die 5 Regeln für jede Wiederholung', list: [
        'Kontrolle: 2–3 Sekunden absenken, 1 Sekunde hochdrücken.',
        'Voller Bewegungsumfang – vor allem die gedehnte Position mitnehmen.',
        'Rumpf fest: vor schweren Wiederholungen tief in den Bauch einatmen und anspannen.',
        'Keine Schwungbewegungen – das Gewicht bewegt der Zielmuskel.',
        'Gelenke in Linie: Knie folgen den Fußspitzen, Handgelenke gerade.',
      ] },
      { h: 'Atmung', p: 'Bei normalen Sätzen: in der leichten Phase einatmen, in der schweren Phase ausatmen. Bei schweren Grundübungen hältst du die Luft während der Wiederholung im Bauch (Pressatmung) und atmest oben aus. Bei Bluthochdruck vorher ärztlich abklären.' },
      { h: 'Warnsignale', list: [
        'Stechender, plötzlicher Schmerz → sofort abbrechen.',
        'Gelenkschmerz, der beim Training stärker wird → Übung tauschen (Alternativen in der Bibliothek).',
        'Muskelbrennen und Anstrengung → normal und gewollt.',
      ] },
      { h: 'Profi-Trick: Filme dich', p: 'Ein kurzes Handyvideo von der Seite zeigt dir sofort, ob dein Rücken gerade bleibt oder deine Bewegung vollständig ist. Bei jeder Übung findest du außerdem einen Link zu Technik-Videos.' },
    ],
    takeaways: ['Langsam absenken, voller Bewegungsumfang.', 'Rumpf anspannen bei schweren Übungen.', 'Stechender Schmerz = Stopp.'],
    quiz: [
      { q: 'Wie lange sollte die absenkende Phase etwa dauern?', options: ['So schnell wie möglich', '2–3 Sekunden', '10 Sekunden', 'Egal'], correct: 1, explain: '2–3 Sekunden kontrolliertes Absenken sorgen für Spannung und Sicherheit.' },
      { q: 'Was machst du bei stechendem Schmerz im Gelenk?', options: ['Durchziehen', 'Sofort abbrechen', 'Mehr Gewicht nehmen', 'Schneller werden'], correct: 1, explain: 'Stechender Schmerz ist ein Warnsignal – abbrechen und ggf. ärztlich abklären.' },
      { q: 'Welche Position ist für das Muskelwachstum besonders wertvoll?', options: ['Die gedehnte Position', 'Nur die obere Hälfte', 'Gar keine Bewegung', 'Die Pause zwischen Sätzen'], correct: 0, explain: 'Training in der gedehnten Position liefert einen besonders starken Wachstumsreiz.' },
    ],
  },
  {
    id: 'mcfit-guide', module: 'technik', title: 'McFit-Guide: Geräte & Studio-Knigge', minutes: 4,
    intro: 'So holst du das Beste aus deinem McFit-Studio – und wirst schnell zum Profi an den Geräten.',
    sections: [
      { h: 'Die Bereiche im Studio', list: [
        'Gerätezone: Beinpresse, Brustpresse, Latzug, Beinstrecker, Beinbeuger, Butterfly & Co. – ideal zum Lernen.',
        'Kabelzugstationen: extrem vielseitig – Rudern, Trizeps, Face Pulls, Crunches, Seitheben.',
        'Freihantelbereich: Kurzhanteln, Bänke, SZ-Stangen.',
        'Racks & Multipresse: Kniebeugen, Bankdrücken, Hip Thrust.',
        'Cardiobereich: Laufband, Crosstrainer, Rad, Stepper, Rudergerät.',
      ] },
      { h: 'Geräte richtig einstellen', list: [
        'Drehachse der Maschine (meist markiert) auf Höhe des Gelenks, das sich bewegt.',
        'Sitzhöhe so, dass die Griffe auf Höhe des Zielmuskels liegen.',
        'Notiere dir die Einstellungen (z. B. „Sitz 5, Lehne 3“) – in dieser App bei jeder Übung unter „Meine Einstellung“.',
      ] },
      { h: 'Studio-Knigge', list: [
        'Handtuch auf Polster legen und Gerät nach dem Training kurz desinfizieren.',
        'Hanteln und Scheiben zurücklegen.',
        'Zwischen den Sätzen nicht ewig am Handy auf dem Gerät sitzen – bei vollem Studio „Einschieben“ anbieten.',
      ] },
      { h: 'Stoßzeiten umgehen', p: 'Am vollsten ist es meist werktags zwischen 17 und 20 Uhr und montags. Früh morgens, mittags oder spät abends trainierst du entspannter. Wenn ein Gerät besetzt ist: Nimm eine der Alternativen aus der Übungsbibliothek – der Plan funktioniert trotzdem.' },
    ],
    takeaways: ['Drehachse = Gelenk.', 'Einstellungen notieren spart Zeit.', 'Gerät besetzt? Alternative nehmen.'],
    quiz: [
      { q: 'Worauf richtest du die Drehachse einer Maschine aus?', options: ['Auf die Hüfte', 'Auf das Gelenk, das sich bewegt', 'Auf den Kopf', 'Egal'], correct: 1, explain: 'Beim Beinstrecker z. B. auf das Knie – so läuft die Bewegung sauber und gelenkschonend.' },
      { q: 'Das Gerät aus deinem Plan ist besetzt. Was tun?', options: ['Training abbrechen', 'Eine Alternative aus der Bibliothek nehmen', '20 Minuten warten', 'Übung weglassen'], correct: 1, explain: 'Jede Übung hat gleichwertige Alternativen – so bleibst du im Plan.' },
      { q: 'Wann ist es im Studio meist am vollsten?', options: ['Werktags 17–20 Uhr', 'Sonntag 7 Uhr', 'Mittwoch 13 Uhr', 'Nachts'], correct: 0, explain: 'Nach Feierabend ist am meisten los – wenn möglich ausweichen.' },
    ],
  },

  // ───────────── Planung ─────────────
  {
    id: 'periodisierung', module: 'planung', title: 'Dein Jahresplan erklärt', minutes: 5,
    intro: 'Dein Plan ist periodisiert: Das Jahr ist in 6 Phasen mit unterschiedlichen Zielen aufgeteilt. So wirst du stetig besser, ohne festzustecken.',
    sections: [
      { h: 'Die 6 Phasen', list: [
        'Phase 1 · Fundament (W1–8): Ganzkörper 3×, Maschinen, Technik lernen.',
        'Phase 2 · Aufbau (W9–16): Ganzkörper 3×, freie Gewichte, 8–12 Wdh.',
        'Phase 3 · Hypertrophie I (W17–28): Oberkörper/Unterkörper 4×.',
        'Phase 4 · Kraft (W29–36): schwere Grundübungen, 5–6 Wdh.',
        'Phase 5 · Hypertrophie II (W37–46): Beine/Push/Pull/Ganzkörper, Drop-Sätze.',
        'Phase 6 · Definition & Peak (W47–52): Supersätze, Cardio, Jahrestest.',
      ] },
      { h: 'Welle statt Gerade', p: 'Innerhalb jeder Phase wird es Woche für Woche härter (RIR sinkt, teilweise mehr Sätze). Danach folgt eine Deload-Woche. Diese Welle aus Belastung und Entlastung ist der Kern guter Periodisierung.' },
      { h: 'Warum der Wechsel?', list: [
        'Neue Reize: Der Körper gewöhnt sich an Übungen und Bereiche – Abwechslung hält den Fortschritt am Laufen.',
        'Kraft hilft Masse: Die Kraftphase macht dich stärker für die zweite Muskelaufbauphase.',
        'Motivation: Neue Ziele alle paar Wochen halten dich dran.',
      ] },
      { h: 'Trainingstage', p: 'In Phasen mit 3 Einheiten trainierst du standardmäßig Mo/Mi/Fr, mit 4 Einheiten Mo/Di/Do/Fr. In den Einstellungen kannst du die Tage anpassen. Verpasst? Kein Problem – mach einfach mit dem nächsten offenen Training der Woche weiter.' },
    ],
    takeaways: ['6 Phasen, jede mit eigenem Ziel.', 'Belastung steigt wellenförmig, dann Deload.', 'Verpasste Einheit: einfach nachholen.'],
    quiz: [
      { q: 'Was passiert in Phase 4?', options: ['Nur Cardio', 'Kraftaufbau mit schweren Grundübungen', 'Pause', 'Nur Bauchtraining'], correct: 1, explain: 'In der Kraftphase trainierst du die Hauptübungen schwer im Bereich 5–6 Wiederholungen.' },
      { q: 'Wie verläuft die Belastung innerhalb einer Phase?', options: ['Immer gleich', 'Steigend, dann Deload', 'Zufällig', 'Fallend'], correct: 1, explain: 'Die Härte steigt Woche für Woche, danach folgt eine Entlastungswoche.' },
      { q: 'Du verpasst ein Training. Was tust du?', options: ['Ganze Woche neu starten', 'Mit dem nächsten offenen Training weitermachen', 'Doppelt trainieren', 'Phase abbrechen'], correct: 1, explain: 'Die App zeigt dir immer das nächste offene Training der Woche.' },
    ],
  },
  {
    id: 'deload', module: 'planung', title: 'Deload: Warum Pausen stärker machen', minutes: 3,
    intro: 'Eine Deload-Woche ist eine geplante leichtere Woche. Sie fühlt sich vielleicht nach Rückschritt an – ist aber der Grund, warum du langfristig stärker wirst.',
    sections: [
      { h: 'Was passiert im Deload?', list: [
        'Halbe Satzanzahl.',
        'Ca. 10–15 % weniger Gewicht.',
        'RIR 4–5: Jeder Satz fühlt sich leicht an.',
        'Gleiche Übungen – die Technik bleibt frisch.',
      ] },
      { h: 'Warum?', p: 'Über Wochen sammelt sich Ermüdung an – in Muskeln, Gelenken, Sehnen und im Nervensystem. Diese Ermüdung „versteckt“ deine Fitness. Im Deload baut sie sich ab, und danach bist du oft stärker als vorher (Superkompensation).' },
      { h: 'Typische Fehler', list: ['Deload auslassen, weil man sich gut fühlt.', 'Im Deload doch wieder hart trainieren.', 'Komplett pausieren statt leicht trainieren (das ist auch okay, aber leicht trainieren hält die Routine).'] },
    ],
    takeaways: ['Deload = halbe Sätze, weniger Gewicht.', 'Ermüdung abbauen, Fitness sichtbar machen.', 'Nicht auslassen!'],
    quiz: [
      { q: 'Wie viele Sätze machst du im Deload?', options: ['Doppelt so viele', 'Etwa die Hälfte', 'Gleich viele', 'Nur einen pro Training'], correct: 1, explain: 'Im Deload halbierst du das Volumen.' },
      { q: 'Warum ist ein Deload sinnvoll?', options: ['Ermüdung baut sich ab, Leistung steigt danach', 'Damit man faul sein kann', 'Um Muskeln abzubauen', 'Er ist nicht sinnvoll'], correct: 0, explain: 'Abgebaute Ermüdung lässt deine echte Leistungsfähigkeit wieder zum Vorschein kommen.' },
      { q: 'Wie fühlen sich die Sätze im Deload an?', options: ['Bis zum Versagen', 'Leicht (RIR 4–5)', 'Mittel (RIR 2)', 'Unmöglich'], correct: 1, explain: 'Bewusst leicht – das ist der Sinn der Sache.' },
    ],
  },

  // ───────────── Ernährung ─────────────
  {
    id: 'kalorien', module: 'ernaehrung', title: 'Kalorien & Energiebilanz', minutes: 4,
    intro: 'Ob du zunimmst, abnimmst oder dein Gewicht hältst, entscheidet die Energiebilanz: Kalorien rein gegen Kalorien raus.',
    sections: [
      { h: 'Drei Ziele, drei Strategien', list: [
        'Muskelaufbau („Lean Bulk“): ca. 200–300 kcal Überschuss pro Tag. Ziel: ca. 0,25–0,5 % Körpergewicht Zunahme pro Woche.',
        'Fettabbau („Diät“): ca. 300–500 kcal Defizit. Ziel: ca. 0,5–1 % Körpergewicht pro Woche.',
        'Rekomposition: Erhaltungskalorien + viel Eiweiß – funktioniert gut für Einsteiger und Wiedereinsteiger.',
      ] },
      { h: 'Deinen Bedarf schätzen', p: 'Mit dem Rechner in der Akademie (Mifflin-St-Jeor-Formel × Aktivitätsfaktor) bekommst du einen Startwert. Er ist eine Schätzung: Wiege dich 3–4× pro Woche morgens nüchtern, bilde den Wochendurchschnitt und passe nach 2–3 Wochen um 100–200 kcal an.' },
      { h: 'Die Waage richtig lesen', p: 'Das Gewicht schwankt täglich um 1–2 kg (Wasser, Salz, Verdauung). Nur der Trend über Wochen zählt. Trage dein Gewicht unter „Fortschritt“ ein – die Kurve zeigt dir den Verlauf.' },
    ],
    takeaways: ['Aufbau: kleiner Überschuss, Diät: moderates Defizit.', 'Startwert berechnen, dann nach Trend anpassen.', 'Wochendurchschnitt statt Tageswert.'],
    quiz: [
      { q: 'Welcher Kalorienüberschuss ist für sauberen Muskelaufbau sinnvoll?', options: ['+1.500 kcal', '+200–300 kcal', '−500 kcal', 'Egal'], correct: 1, explain: 'Ein kleiner Überschuss maximiert Muskelaufbau bei minimalem Fettzuwachs.' },
      { q: 'Dein Gewicht steigt über Nacht um 1 kg. Was bedeutet das?', options: ['1 kg Fett zugenommen', 'Wahrscheinlich Wasser/Verdauung – Trend abwarten', 'Diät abbrechen', 'Muskeln verloren'], correct: 1, explain: 'Tägliche Schwankungen sind normal. Nur der Wochentrend ist aussagekräftig.' },
      { q: 'Wie schnell solltest du in einer Diät etwa abnehmen?', options: ['5 % pro Woche', '0,5–1 % des Körpergewichts pro Woche', '0 %', '10 kg pro Monat'], correct: 1, explain: 'So bleibt die Muskelmasse bestmöglich erhalten.' },
    ],
  },
  {
    id: 'makros', module: 'ernaehrung', title: 'Eiweiß, Kohlenhydrate & Fette', minutes: 4,
    intro: 'Kalorien bestimmen das Gewicht – die Makronährstoffe bestimmen, woraus es besteht.',
    sections: [
      { h: 'Eiweiß – der Baustein', list: [
        '1,6–2,2 g pro kg Körpergewicht pro Tag (bei 80 kg: ca. 130–175 g).',
        'Auf 3–5 Mahlzeiten mit je 25–40 g verteilen.',
        'Gute Quellen: Hähnchen, Pute, Fisch, Eier, Magerquark, Skyr, Hüttenkäse, Linsen, Tofu, Proteinpulver.',
      ] },
      { h: 'Kohlenhydrate – der Treibstoff', p: 'Sie füllen deine Muskelspeicher (Glykogen) und machen dich im Training leistungsfähig. Bevorzuge Haferflocken, Reis, Kartoffeln, Vollkornbrot, Obst. Eine kohlenhydratreiche Mahlzeit 1–3 Stunden vor dem Training ist ideal.' },
      { h: 'Fette – die Hormone', p: 'Mindestens ca. 0,8 g pro kg Körpergewicht – wichtig für Hormone und Vitaminaufnahme. Gute Quellen: Olivenöl, Nüsse, Avocado, fetter Fisch (Lachs), Eier.' },
      { h: 'Einfaches Teller-Prinzip', list: ['½ Teller Gemüse/Salat', '¼ Teller Eiweißquelle', '¼ Teller Kohlenhydrate', '+ 1 Daumen gesundes Fett', 'Dazu 2,5–3,5 Liter Wasser am Tag'] },
    ],
    takeaways: ['1,6–2,2 g Eiweiß pro kg.', 'Kohlenhydrate vor dem Training.', 'Mind. 0,8 g Fett pro kg.'],
    quiz: [
      { q: 'Wie viel Eiweiß braucht eine 80-kg-Person für Muskelaufbau ungefähr?', options: ['30 g', '130–175 g', '400 g', '60 g'], correct: 1, explain: '1,6–2,2 g/kg × 80 kg ≈ 130–175 g pro Tag.' },
      { q: 'Wann ist eine kohlenhydratreiche Mahlzeit vor dem Training sinnvoll?', options: ['1–3 Stunden vorher', '5 Minuten vorher', 'Nur am Vortag', 'Nie'], correct: 0, explain: 'So ist sie verdaut und die Energie steht im Training bereit.' },
      { q: 'Welche Aussage über Fette stimmt?', options: ['Fett macht immer dick', 'Fette sind wichtig für Hormone', 'Fett sollte komplett gemieden werden', 'Fette liefern keine Energie'], correct: 1, explain: 'Fette sind lebenswichtig – nur die Gesamtkalorien entscheiden über Zu- oder Abnahme.' },
    ],
  },
  {
    id: 'supplements', module: 'ernaehrung', title: 'Supplements: Was wirklich hilft', minutes: 3,
    intro: 'Die meisten Supplements sind Geldverschwendung. Ein paar wenige sind gut erforscht und sinnvoll.',
    sections: [
      { h: 'Gut belegt', list: [
        'Kreatin-Monohydrat: 3–5 g täglich, jeden Tag, zu einer beliebigen Uhrzeit. Mehr Kraft und mehr Muskelaufbau. Eine Ladephase ist nicht nötig.',
        'Proteinpulver: kein Muss, aber praktisch, um dein Eiweißziel zu erreichen.',
        'Koffein: 1–3 mg pro kg Körpergewicht ca. 30–60 Min vor dem Training steigert die Leistung (z. B. 1–2 Tassen Kaffee). Nicht spät abends.',
      ] },
      { h: 'Je nach Situation', list: [
        'Vitamin D: in den Wintermonaten oft sinnvoll – idealerweise nach Blutwert und ärztlicher Absprache.',
        'Omega-3: wenn du selten fetten Fisch isst.',
      ] },
      { h: 'Meist überflüssig', p: 'BCAAs (wenn du genug Eiweiß isst), „Fatburner“, Testo-Booster und teure Pre-Workout-Mixturen mit langer Zutatenliste. Investiere das Geld lieber in gutes Essen.' },
      { h: 'Wichtig', p: 'Bei Vorerkrankungen oder Medikamenten vor der Einnahme ärztlich abklären. Achte auf geprüfte Qualität (z. B. Kölner Liste).' },
    ],
    takeaways: ['Kreatin 3–5 g täglich.', 'Proteinpulver = praktisches Essen.', 'Fatburner & Booster sparen.'],
    quiz: [
      { q: 'Wie viel Kreatin-Monohydrat ist pro Tag sinnvoll?', options: ['3–5 g', '50 g', '0,1 g', '20 g für immer'], correct: 0, explain: '3–5 g täglich reichen – eine Ladephase ist nicht nötig.' },
      { q: 'Welches Supplement ist meist überflüssig, wenn du genug Eiweiß isst?', options: ['Kreatin', 'BCAAs', 'Wasser', 'Vitamin D bei Mangel'], correct: 1, explain: 'BCAAs sind in jeder Eiweißquelle enthalten.' },
      { q: 'Wann ist Koffein vor dem Training am wirksamsten?', options: ['Ca. 30–60 Min vorher', 'Direkt nach dem Training', 'Um Mitternacht', 'Am Vortag'], correct: 0, explain: 'Koffein wirkt nach ca. 30–60 Minuten am stärksten.' },
    ],
  },

  // ───────────── Regeneration & Lifestyle ─────────────
  {
    id: 'schlaf', module: 'lifestyle', title: 'Schlaf & Erholung', minutes: 3,
    intro: 'Schlaf ist das stärkste legale Leistungsmittel. Zu wenig Schlaf bremst Kraft, Muskelaufbau, Fettabbau und Motivation.',
    sections: [
      { h: 'Wie viel?', p: '7–9 Stunden pro Nacht. Schon mehrere Nächte mit weniger als 6 Stunden verschlechtern die Erholung und steigern den Hunger auf ungesundes Essen.' },
      { h: 'Besser schlafen', list: [
        'Feste Schlaf- und Aufstehzeiten – auch am Wochenende.',
        'Schlafzimmer kühl (ca. 17–19 °C), dunkel und ruhig.',
        'Kein Koffein 8 Stunden vor dem Schlafen.',
        '30–60 Min vor dem Schlafen Bildschirme reduzieren.',
        'Spätes Training ist okay – danach ruhig ausklingen lassen.',
      ] },
      { h: 'Aktive Erholung', p: 'An freien Tagen helfen Spaziergänge, lockeres Radfahren oder leichtes Dehnen. Bewegung fördert die Durchblutung und hilft gegen Steifheit.' },
    ],
    takeaways: ['7–9 Stunden Schlaf.', 'Feste Zeiten, kühles dunkles Zimmer.', 'Freie Tage aktiv gestalten.'],
    quiz: [
      { q: 'Wie viel Schlaf ist für Sportler ideal?', options: ['4–5 Stunden', '7–9 Stunden', '12 Stunden', 'Egal'], correct: 1, explain: '7–9 Stunden unterstützen Erholung, Hormone und Leistung.' },
      { q: 'Wie lange vor dem Schlafen kein Koffein?', options: ['30 Minuten', 'Ca. 8 Stunden', '1 Woche', 'Gar nicht nötig'], correct: 1, explain: 'Koffein wirkt lange nach – rund 8 Stunden Abstand sind sinnvoll.' },
      { q: 'Was hilft an trainingsfreien Tagen?', options: ['Nur liegen', 'Spaziergänge & leichte Bewegung', 'Maximaltest', 'Doppeltraining'], correct: 1, explain: 'Leichte Bewegung fördert die Regeneration.' },
    ],
  },
  {
    id: 'cardio', module: 'lifestyle', title: 'Cardio richtig einsetzen', minutes: 4,
    intro: 'Cardio und Krafttraining sind keine Gegner. Richtig dosiert macht Ausdauer dein Herz gesünder, unterstützt den Fettabbau und verbessert die Erholung zwischen den Sätzen.',
    sections: [
      { h: 'Zone 2 – die Basis', p: 'Locker, aber zügig: Du kannst noch in ganzen Sätzen sprechen (ca. 60–70 % der maximalen Herzfrequenz). Bei McFit ideal: Laufband mit 8–12 % Steigung und 4,5–6 km/h, Crosstrainer oder Rad. 2–3× pro Woche 20–40 Minuten.' },
      { h: 'HIIT – kurz und hart', p: 'Intervalle wie 8 × 30 Sek hart / 60–90 Sek locker auf dem Rad oder Rudergerät. Sehr effektiv für die Kondition, aber anstrengend – maximal 1–2× pro Woche und nicht direkt vor dem Beintraining.' },
      { h: 'Schritte – unterschätzt', p: '8.000–10.000 Schritte am Tag verbrennen oft mehr Kalorien als eine Cardio-Einheit und belasten die Erholung kaum. Treppe statt Aufzug, Telefonate im Gehen.' },
      { h: 'Reihenfolge', list: ['Kraft vor Cardio, wenn beides am selben Tag.', 'Oder Cardio an trainingsfreien Tagen.', 'Das kurze Aufwärmen auf dem Cardiogerät ist immer okay.'] },
    ],
    takeaways: ['Zone 2: noch sprechen können.', 'HIIT max. 1–2× pro Woche.', '8–10k Schritte täglich.'],
    quiz: [
      { q: 'Woran erkennst du Zone 2?', options: ['Du kannst noch in ganzen Sätzen sprechen', 'Du bist völlig außer Atem', 'Puls bei 100 % HFmax', 'Du gehst ganz langsam'], correct: 0, explain: 'Zone 2 ist locker-zügig, Sprechen ist noch möglich.' },
      { q: 'Kraft und Cardio am selben Tag – was zuerst?', options: ['Cardio lang und hart zuerst', 'Krafttraining zuerst', 'Egal', 'Beides gleichzeitig'], correct: 1, explain: 'So hast du die volle Kraft für das Krafttraining.' },
      { q: 'Wie oft HIIT pro Woche?', options: ['Jeden Tag', 'Maximal 1–2×', 'Nie', '3× täglich'], correct: 1, explain: 'HIIT ist sehr fordernd – 1–2× pro Woche reicht.' },
    ],
  },
  {
    id: 'schmerzen', module: 'lifestyle', title: 'Muskelkater, Schmerzen & Krankheit', minutes: 3,
    intro: 'Zu wissen, wann du trainieren kannst und wann nicht, schützt dich vor Rückschlägen.',
    sections: [
      { h: 'Muskelkater', p: 'Muskelkater entsteht vor allem bei neuen Übungen oder ungewohnter Belastung und ist KEIN Maßstab für ein gutes Training. Leichter Muskelkater: Training ist okay. Starker Muskelkater: Diesen Muskel lieber leichter trainieren und Bewegung fördern.' },
      { h: 'Schmerz vs. Anstrengung', list: [
        'Normal: Brennen im Muskel, Ermüdung, Muskelkater.',
        'Warnsignal: stechend, punktuell im Gelenk, ausstrahlend, Taubheit.',
        'Bei Warnsignalen: Übung tauschen oder pausieren, bei anhaltenden Beschwerden ärztlich abklären.',
      ] },
      { h: 'Krank – trainieren?', list: [
        'Fieber, Gliederschmerzen oder Infekt im Brustbereich: kein Training! Mindestens bis einige Tage nach dem Abklingen.',
        'Nur leichter Schnupfen ohne Fieber: höchstens locker trainieren.',
        'Nach Krankheit mit einer Deload-artigen Woche wieder einsteigen.',
      ] },
    ],
    takeaways: ['Muskelkater ≠ Trainingserfolg.', 'Stechender Gelenkschmerz = Warnsignal.', 'Fieber = kein Training.'],
    quiz: [
      { q: 'Ist starker Muskelkater ein Zeichen für ein besonders gutes Training?', options: ['Ja, immer', 'Nein, er sagt wenig über den Erfolg aus', 'Nur bei Beinen', 'Nur bei Anfängern'], correct: 1, explain: 'Muskelkater zeigt ungewohnte Belastung an, nicht den Trainingseffekt.' },
      { q: 'Du hast Fieber. Was tust du?', options: ['Hart trainieren zum Ausschwitzen', 'Pausieren', 'Nur Beine trainieren', 'HIIT'], correct: 1, explain: 'Bei Fieber ist Training gefährlich fürs Herz – unbedingt pausieren.' },
      { q: 'Welcher Schmerz ist ein Warnsignal?', options: ['Brennen im Muskel', 'Stechender Schmerz im Gelenk', 'Leichter Muskelkater', 'Müde Muskeln'], correct: 1, explain: 'Stechender, punktueller Gelenkschmerz ist ein Grund zum Abbrechen.' },
    ],
  },
  {
    id: 'motivation', module: 'lifestyle', title: 'Motivation & Gewohnheiten', minutes: 3,
    intro: 'Motivation kommt und geht. Gewohnheiten bleiben. Ein Jahr hältst du nicht mit Willenskraft durch, sondern mit System.',
    sections: [
      { h: 'Plane deine Trainings wie Termine', p: 'Lege feste Tage und Uhrzeiten fest und trage sie in deinen Kalender ein. Die App zeigt dir jeden Tag, was ansteht.' },
      { h: 'Die 2-Tage-Regel', p: 'Verpasse nie zwei geplante Einheiten hintereinander. Ein Ausfall ist normal – zwei werden schnell zur Gewohnheit.' },
      { h: 'Mach es dir leicht', list: [
        'Tasche am Vorabend packen.',
        'Studio auf dem Arbeitsweg wählen.',
        'An schlechten Tagen: „Ich mache nur das Aufwärmen.“ – meistens wird ein ganzes Training daraus.',
      ] },
      { h: 'Fortschritt sichtbar machen', p: 'Deine Bestleistungen, Erfolge und Kurven in „Fortschritt“ zeigen dir schwarz auf weiß, wie weit du gekommen bist. Mach alle 4 Wochen ein Foto in gleichem Licht – der Spiegel täuscht im Alltag.' },
    ],
    takeaways: ['Training als festen Termin planen.', 'Nie 2× hintereinander ausfallen lassen.', 'Fortschritt dokumentieren.'],
    quiz: [
      { q: 'Was besagt die 2-Tage-Regel?', options: ['Nur 2 Tage pro Woche trainieren', 'Nie zwei geplante Einheiten hintereinander verpassen', '2 Tage fasten', 'Alle 2 Tage Maximaltest'], correct: 1, explain: 'Ein Ausfall ist okay – zwei hintereinander gefährden die Gewohnheit.' },
      { q: 'Was hilft an einem unmotivierten Tag?', options: ['Ganz absagen', 'Sich vornehmen, nur das Aufwärmen zu machen', 'Doppelt so hart trainieren', 'Neuen Plan suchen'], correct: 1, explain: 'Der Start ist die größte Hürde – danach läuft es meist von selbst.' },
      { q: 'Wie oft sind Fortschrittsfotos sinnvoll?', options: ['Täglich', 'Etwa alle 4 Wochen', 'Einmal im Jahr', 'Nie'], correct: 1, explain: 'Alle 4 Wochen unter gleichen Bedingungen zeigt echte Veränderungen.' },
    ],
  },
];

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const TIPS = [
  'Notiere dir bei jeder Maschine deine Sitzposition – das spart dir jedes Mal Minuten.',
  'Kontrolliertes Absenken (2–3 Sekunden) bringt mehr als schnelles Hochdrücken.',
  'Trinke über den Tag verteilt 2,5–3,5 Liter Wasser.',
  'Gerät besetzt? Öffne die Übung und wähle eine Alternative.',
  'Steigere erst die Wiederholungen, dann das Gewicht.',
  'Eiweiß in jeder Mahlzeit: 25–40 g pro Portion.',
  '7–9 Stunden Schlaf sind dein bester Muskelaufbau-Booster.',
  'Kreatin-Monohydrat: 3–5 g täglich – einfach, günstig, wirksam.',
  'Verpasse nie zwei Trainings hintereinander.',
  'Beim Latzug: Ellbogen Richtung Hosentaschen ziehen, nicht die Hände.',
  'Seitheben leichter als gedacht: Saubere 15 Wiederholungen schlagen schlampige 6.',
  'Die gedehnte Position ist der stärkste Wachstumsreiz – volle Bewegung!',
  'Muskelkater ist kein Maßstab für ein gutes Training.',
  'Deload-Woche heißt: halbe Sätze, weniger Gewicht – und trotzdem hingehen.',
  'Mach alle 4 Wochen ein Fortschrittsfoto bei gleichem Licht.',
  '8.000–10.000 Schritte täglich unterstützen den Fettabbau enorm.',
  'Kraft vor Cardio, wenn du beides am selben Tag machst.',
  'Filme deine Technik von der Seite – das Handy ist der beste Trainer.',
  'Bei schweren Sätzen: tief in den Bauch einatmen und den Rumpf anspannen.',
  'Wiege dich morgens nüchtern und betrachte den Wochendurchschnitt.',
  'Kohlenhydratreiche Mahlzeit 1–3 Stunden vor dem Training = mehr Power.',
  'Face Pulls und Reverse Butterfly halten deine Schultern gesund.',
  'Trainiere früh morgens oder spät abends, um McFit-Stoßzeiten zu meiden.',
  'Handtuch aufs Polster, Gerät desinfizieren – Studio-Knigge zahlt sich aus.',
  'Bei Fieber gilt: kein Training. Gesundheit geht vor.',
];

// ───────────── Erfolge ─────────────
export const ACHIEVEMENTS = [
  { id: 'first-workout', name: 'Erster Schritt', desc: 'Dein erstes Training abgeschlossen', icon: 'flag' },
  { id: 'workouts-10', name: 'Dranbleiber', desc: '10 Trainings abgeschlossen', icon: 'flame' },
  { id: 'workouts-25', name: 'Stammgast', desc: '25 Trainings abgeschlossen', icon: 'flame' },
  { id: 'workouts-50', name: 'Eisern', desc: '50 Trainings abgeschlossen', icon: 'dumbbell' },
  { id: 'workouts-100', name: 'Hundert', desc: '100 Trainings abgeschlossen', icon: 'trophy' },
  { id: 'workouts-150', name: 'Legende', desc: '150 Trainings abgeschlossen', icon: 'crown' },
  { id: 'week-complete', name: 'Volle Woche', desc: 'Alle geplanten Trainings einer Woche geschafft', icon: 'calendar' },
  { id: 'streak-4', name: 'Monat der Disziplin', desc: '4 volle Wochen in Folge', icon: 'zap' },
  { id: 'streak-12', name: 'Unaufhaltsam', desc: '12 volle Wochen in Folge', icon: 'zap' },
  { id: 'first-pr', name: 'Neuer Rekord', desc: 'Deine erste Bestleistung', icon: 'trend' },
  { id: 'prs-25', name: 'Rekordjäger', desc: '25 Bestleistungen aufgestellt', icon: 'trend' },
  { id: 'tons-10', name: '10 Tonnen', desc: 'Insgesamt 10.000 kg bewegt', icon: 'weight' },
  { id: 'tons-100', name: '100 Tonnen', desc: 'Insgesamt 100.000 kg bewegt', icon: 'weight' },
  { id: 'tons-500', name: 'Schwerlast', desc: 'Insgesamt 500.000 kg bewegt', icon: 'weight' },
  { id: 'deload', name: 'Clever erholt', desc: 'Ein Training in einer Deload-Woche absolviert', icon: 'leaf' },
  { id: 'test', name: 'Bereit für den Test', desc: 'Ein Training in einer Testwoche absolviert', icon: 'target' },
  { id: 'phase-2', name: 'Fundament steht', desc: 'Phase 2 erreicht', icon: 'layers' },
  { id: 'phase-4', name: 'Halbzeit', desc: 'Phase 4 erreicht', icon: 'layers' },
  { id: 'phase-6', name: 'Zielgerade', desc: 'Phase 6 erreicht', icon: 'layers' },
  { id: 'first-lesson', name: 'Wissbegierig', desc: 'Erste Lektion abgeschlossen', icon: 'book' },
  { id: 'all-lessons', name: 'Trainer-Wissen', desc: 'Alle Lektionen abgeschlossen', icon: 'grad' },
  { id: 'quiz-perfect', name: 'Volle Punktzahl', desc: 'Ein Quiz fehlerfrei gelöst', icon: 'star' },
  { id: 'bodyweight', name: 'Messbar', desc: 'Erstes Körpergewicht eingetragen', icon: 'scale' },
];

export const XP = { workout: 100, lesson: 50, quizPerfect: 25, pr: 20 };

export const LEVELS = [
  { min: 0, name: 'Rookie' },
  { min: 300, name: 'Starter' },
  { min: 1000, name: 'Athlet' },
  { min: 2500, name: 'Kraftpaket' },
  { min: 5000, name: 'Eisen-Profi' },
  { min: 9000, name: 'Elite' },
  { min: 14000, name: 'Legende' },
];
