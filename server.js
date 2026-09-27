const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('Error opening database', err.message);
    else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        col1 TEXT, col2 TEXT, col3 TEXT, col4 TEXT, col5 TEXT,
        col6 TEXT, col7 TEXT, col8 TEXT, col9 TEXT, col10 TEXT, col11 TEXT
    )`, () => {
        db.get(`SELECT COUNT(*) as count FROM entries`, (err, row) => {
            if (row.count === 0) seedInitialData();
        });
    });
}

function seedInitialData() {
    const initialData = {
      "Düren – Patienten": [
        ["","Schmitz","Klaus","12.03.1950","Roonstraße 15","52351","Düren","+49 2421 112233","GKV","Krankenhaus Düren","Ambulante Nachsorge"],
        ["","Becker","Hannelore","05.07.1939","Dr.-Overhues-Allee 10","52355","Düren","+49 2421 445566","PKV","Alten- und Pflegezentrum St. Nikolaus","Kurzzeitpflege"]
      ],
      "Düren – Heime": [
        ["Alten- und Pflegezentrum St. Nikolaus","Dr.-Overhues-Allee 42","52355","Düren","+49 2421 699-0","Unklar","Unklar","",""]
      ]
    };
    const stmt = db.prepare(`INSERT INTO entries (category, col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const [cat, rows] of Object.entries(initialData)) {
        rows.forEach(r => {
            while(r.length < 11) r.push("");
            stmt.run(cat, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]);
        });
    }
    stmt.finalize();
}

app.get('/api/data', (req, res) => {
    db.all(`SELECT * FROM entries`, [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post('/api/entries', (req, res) => {
    const { category, cols } = req.body;
    while(cols.length < 11) cols.push("");
    db.run(`INSERT INTO entries (category, col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [category, cols[0], cols[1], cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8], cols[9], cols[10]],
        function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ id: this.lastID, success: true });
        }
    );
});

app.delete('/api/entries/:id', (req, res) => {
    db.run(`DELETE FROM entries WHERE id = ?`, req.params.id, function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ deleted: this.changes });
    });
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));