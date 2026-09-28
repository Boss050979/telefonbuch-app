const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für JSON-Daten
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Datenbank initialisieren (wird als Datei im Projekt gespeichert)
const dbPath = path.resolve(__dirname, 'telefonbuch.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank', err.message);
  } else {
    console.log('Mit SQLite-Datenbank verbunden.');
    createTable();
  }
});

// Tabelle erstellen falls sie nicht existiert
function createTable() {
  const sql = `CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    col1 TEXT, col2 TEXT, col3 TEXT, col4 TEXT, col5 TEXT,
    col6 TEXT, col7 TEXT, col8 TEXT, col9 TEXT, col10 TEXT, col11 TEXT
  )`;
  db.run(sql, (err) => {
    if (!err) {
      checkInitialData();
    }
  });
}

// Beispiel- und Standarddaten einfügen, falls die Tabelle leer ist
function checkInitialData() {
  db.get("SELECT COUNT(*) as count FROM entries", (err, row) => {
    if (row && row.count === 0) {
      console.log("Füge initiale Standarddaten (Krankenhäuser & Heime) ein...");
      const initialEntries = [
        // Patienten Düren
        ["Düren – Patienten", "", "Schmitz", "Klaus", "12.03.1950", "Roonstraße 15", "52351", "Düren", "+49 2421 112233", "GKV", "Krankenhaus Düren", "Ambulante Nachsorge"],
        ["Düren – Patienten", "", "Becker", "Hannelore", "05.07.1939", "Dr.-Overhues-Allee 10", "52355", "Düren", "+49 2421 445566", "PKV", "Alten- und Pflegezentrum St. Nikolaus", "Kurzzeitpflege"],
        
        // Patienten Köln
        ["Köln – Patienten", "PK-5001", "Müller", "Anna", "15.04.1958", "Aachener Str. 12", "50674", "Köln", "+49 221 1234567", "GKV", "Uniklinik Köln", "Regelmäßige Dialyse"],

        // Krankenhäuser Düren
        ["Düren – Krankenhäuser", "Krankenhaus Düren", "Roonstraße 30", "52351", "Düren", "+49 2421 300", "PKV", "GKV", "www.krankenhaus-dueren.de", "Akademisches Lehrkrankenhaus", ""],
        ["Düren – Krankenhäuser", "St. Marien-Hospital Düren", "Hospitalstraße 44", "52353", "Düren", "+49 2421 805-0", "PKV", "GKV", "www.marien-hospital-dueren.de", "Teil der Josefs-Gesellschaft", ""],

        // Krankenhäuser Köln
        ["Köln – Krankenhäuser", "Uniklinik Köln", "Kerpener Straße 62", "50937", "Köln", "+49 221 478-0", "PKV", "GKV", "www.uk-koeln.de", "Maximalversorger", ""],
        ["Köln – Krankenhäuser", "Krankenhaus Köln-Merheim", "Ostmerheimer Straße 200", "51109", "Köln", "+49 221 8907-0", "PKV", "GKV", "www.kliniken-koeln.de", "Kliniken der Stadt Köln", ""],
        ["Köln – Krankenhäuser", "Krankenhaus Holweide", "Neufelder Straße 32", "51067", "Köln", "+49 221 8907-0", "PKV", "GKV", "www.kliniken-koeln.de", "Kliniken der Stadt Köln", ""],

        // Heime Düren
        ["Düren – Heime", "Alten- und Pflegezentrum St. Nikolaus", "Dr.-Overhues-Allee 42", "52355", "Düren", "+49 2421 699-0", "PKV", "GKV", "www.sj.de", "Stationäre Pflege & Kurzzeitpflege", ""],
        ["Düren – Heime", "Cellitinnen-Seniorenhaus St. Gertrud", "Kölnstraße 62", "52351", "Düren", "+49 2421 3064-0", "PKV", "GKV", "www.sh-st-gertrud.de", "Vollstationäre Pflege", ""],
        ["Düren – Heime", "Seniorenzentrum Düren-Birkesdorf", "Akazienstraße 1b", "52353", "Düren", "+49 2421 955-0", "PKV", "GKV", "www.seniorenzentrum-dueren.de", "Josefs-Gesellschaft", ""],

        // Heime Köln
        ["Köln – Heime", "Seniorenzentrum Köln-Riehl (SBK)", "Boltensternstraße 16", "50735", "Köln", "+49 221 7775-2000", "PKV", "GKV", "www.sbk.koeln", "SBK Köln", ""],
        ["Köln – Heime", "Cellitinnen-Seniorenhaus St. Anna", "Franzstraße 16", "50931", "Köln", "+49 221 940523-0", "PKV", "GKV", "www.sh-st-anna.de", "Lindenthal", ""],
        ["Köln – Heime", "Johanniter-Stift Köln-Ehrenfeld", "Mechternstraße 28", "50823", "Köln", "+49 221 5695-0", "PKV", "GKV", "www.johanniter.de", "Stationäre Pflege", ""]
      ];
      
      const stmt = db.prepare(`INSERT INTO entries (category, col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      initialEntries.forEach(entry => stmt.run(entry));
      stmt.finalize();
    }
  });
}

// API: Alle Einträge abrufen
app.get('/api/data', (req, res) => {
  db.all("SELECT * FROM entries", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API: Neuen Eintrag hinzufügen
app.post('/api/entries', (req, res) => {
  const { category, cols } = req.body;
  const sql = `INSERT INTO entries (category, col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    category,
    cols[0] || '', cols[1] || '', cols[2] || '', cols[3] || '',
    cols[4] || '', cols[5] || '', cols[6] || '', cols[7] || '',
    cols[8] || '', cols[9] || '', cols[10] || ''
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: "Erfolgreich hinzugefügt" });
  });
});

// API: Bestehenden Eintrag aktualisieren (Bearbeiten)
app.put('/api/entries/:id', (req, res) => {
  const id = req.params.id;
  const { category, cols } = req.body;
  
  const sql = `UPDATE entries SET category = ?, col1 = ?, col2 = ?, col3 = ?, col4 = ?, col5 = ?, col6 = ?, col7 = ?, col8 = ?, col9 = ?, col10 = ?, col11 = ? WHERE id = ?`;
  const params = [
    category, 
    cols[0] || '', cols[1] || '', cols[2] || '', cols[3] || '', 
    cols[4] || '', cols[5] || '', cols[6] || '', cols[7] || '', 
    cols[8] || '', cols[9] || '', cols[10] || '', 
    id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Erfolgreich aktualisiert", changes: this.changes });
  });
});

// API: Eintrag löschen
app.delete('/api/entries/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM entries WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Gelöscht", changes: this.changes });
  });
});

// Fallback für alle anderen Routen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
