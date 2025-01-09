const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
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

// Socket.IO – Chat functionality
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming messages
    socket.on('chat message', ({ nick, message }) => {
        console.log(`${nick}: ${message}`);
        io.emit('chat message', { nick, message }); // Broadcast to all connected users
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Save score endpoint
app.post('/save-score', (req, res) => {
    const { name, score } = req.body;

    if (!name || score == null) {
        return res.status(400).json({ error: 'Name and score are required.' });
    }

    // Check if the score already exists for the given name
    const checkQuery = `SELECT id FROM scores WHERE name = ? AND score = ?`;
    db.get(checkQuery, [name, score], (err, row) => {
        if (err) {
            console.error('Error checking existing score:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (row) {
            // If a record exists, update it
            const updateQuery = `UPDATE scores SET score = ? WHERE id = ?`;
            db.run(updateQuery, [score, row.id], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating score:', updateErr);
                    return res.status(500).json({ error: 'Failed to update score.' });
                }
                res.status(200).json({ message: 'Score updated successfully!' });
            });
        } else {
            // If no record exists, insert a new one
            const insertQuery = `INSERT INTO scores (name, score) VALUES (?, ?)`;
            db.run(insertQuery, [name, score], function (insertErr) {
                if (insertErr) {
                    console.error('Error inserting score:', insertErr);
                    return res.status(500).json({ error: 'Failed to save score.' });
                }
                res.status(200).json({ message: 'Score saved successfully!', id: this.lastID });
            });
        }
    });
});


// Get scores endpoint
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

// Serve the HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
