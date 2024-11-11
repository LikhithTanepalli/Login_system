const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For serving static files like CSS
app.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change this to your actual MySQL username
    password: '21255-Ec-130', // Change this to your actual MySQL password
    database: 'login_system'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                bcrypt.compare(password, results[0].password, (err, match) => {
                    if (match) {
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.redirect('/dashboard');
                    } else {
                        res.send('Incorrect Username and/or Password!');
                    }
                });
            } else {
                res.send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.send('Please enter Username and Password!');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}!`);
    } else {
        res.send('Please login to view this page!');
    }
    res.end();
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, results) => {
            if (err) throw err;
            res.send('Registration successful! <a href="/">Login</a>');
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http:// nlocalhost:3000');
});
