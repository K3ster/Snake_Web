const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )`);
        console.log('Connected to the database and ensured table exists.');
    }
});

// Save score endpoint
app.post('/save-score', (req, res) => {
    const { name, score } = req.body;

    if (!name || score == null) {
        return res.status(400).json({ error: 'Name and score are required.' });
    }

    const query = `INSERT INTO scores (name, score) VALUES (?, ?)`;
    db.run(query, [name, score], function (err) {
        if (err) {
            console.error('Error saving score:', err);
            return res.status(500).json({ error: 'Failed to save score.' });
        }
        res.status(200).json({ message: 'Score saved successfully!', id: this.lastID });
    });
});

// Get scores endpoint (optional, to view scores)
app.get('/scores', (req, res) => {
    const query = `SELECT * FROM scores ORDER BY score DESC LIMIT 10`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching scores:', err);
            return res.status(500).json({ error: 'Failed to fetch scores.' });
        }
        res.status(200).json(rows);
    });
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
