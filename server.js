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
      // Prüfen ob Startdaten geladen werden müssen
      checkInitialData();
    }
  });
}

// Beispiel-Startdaten einfügen, falls die Tabelle leer ist
function checkInitialData() {
  db.get("SELECT COUNT(*) as count FROM entries", (err, row) => {
    if (row.count === 0) {
      console.log("Füge initiale Standarddaten ein...");
      const initialEntries = [
        ["Düren – Patienten", "", "Schmitz", "Klaus", "12.03.1950", "Roonstraße 15", "52351", "Düren", "+49 2421 112233", "GKV", "Krankenhaus Düren", "Ambulante Nachsorge"],
        ["Düren – Patienten", "", "Becker", "Hannelore", "05.07.1939", "Dr.-Overhues-Allee 10", "52355", "Düren", "+49 2421 445566", "PKV", "Alten- und Pflegezentrum St. Nikolaus", "Kurzzeitpflege"],
        ["Düren – Heime", "Alten- und Pflegezentrum St. Nikolaus", "Dr.-Overhues-Allee 42", "52355", "Düren", "+49 2421 699-0", "Unklar", "Unklar", "", "", ""],
        ["Köln – Patienten", "PK-5001", "Müller", "Anna", "15.04.1958", "Aachener Str. 12", "50674", "Köln", "+49 221 1234567", "GKV", "Uniklinik Köln", "Regelmäßige Dialyse"]
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