// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;
const SALT_ROUNDS = 10;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )`);
        console.log('Database tables ensured.');
    }
});

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        (err) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Username already exists.' });
            }
            res.status(200).json({ message: 'Registration successful!' });
        }
    );
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Set cookie
        res.cookie('username', username, { httpOnly: true });
        res.status(200).json({ message: 'Login successful!' });
    });
});

// Logout
app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.status(200).json({ message: 'Logged out successfully!' });
});

// Middleware to check user session
function authenticate(req, res, next) {
    if (!req.cookies.username) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
}

// Check login status
app.get('/check-login', (req, res) => {
    const username = req.cookies.username;
    if (username) {
        res.status(200).json({ username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Save score endpoint
app.post('/save-score', authenticate, (req, res) => {
    const score = req.body.score;
    const name = req.cookies.username;

    if (!name || score == null) {
        return res.status(400).json({ error: 'Name and score are required.' });
    }

    const insertQuery = `INSERT INTO scores (name, score) VALUES (?, ?)`;
    db.run(insertQuery, [name, score], function (err) {
        if (err) {
            console.error('Error saving score:', err);
            return res.status(500).json({ error: 'Failed to save score.' });
        }
        res.status(200).json({ message: 'Score saved successfully!', id: this.lastID });
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

// Socket.IO – Chat functionality
io.on('connection', (socket) => {
    const username = socket.handshake.headers.cookie
        ?.split('; ')
        ?.find(row => row.startsWith('username='))
        ?.split('=')[1] || 'Anonymous';

    console.log(`${username} connected`);

    socket.on('chat message', (message) => {
        io.emit('chat message', { nick: username, message });
    });

    socket.on('disconnect', () => {
        console.log(`${username} disconnected`);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});