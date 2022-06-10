const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const PORT = 3001;

const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'bd881c4e6eac07',
    password: '0a17163a',
    database: 'heroku_7ffb2eb2cf5ac41'
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');

    db.query(
    "INSERT INTO users (username, email, password, registrationdate, lastlogindate, status) VALUES (?, ?, ?, ?, ?, ?);",
    [username, email, password, currentDate, currentDate,0],
    (err, result) => {
        if (err) {
            res.send({err: err});
        };
        res.send(result);
    });
});

app.post('/login', (req, res) => {
    const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "SELECT id FROM users WHERE username = ? AND password = ? AND status = 0",
        [username, password],
        (err, result) => {
            if (err) {
                res.send({err: err});
            };

            if (result.length > 0) {
                db.query("UPDATE users SET lastlogindate = ? WHERE id = ?",
                    [currentDate, result[0].id],
                    (err) => {
                        if (err) {
                            res.send({err: err});
                        };
                    });
                res.send(result);

            } else {
                res.send({message: 'Wrong username/password combination or you had been blocked!'});
            };
        }
    );
});

app.get('/getusers', (req, res) => {
    db.query(
        "SELECT * FROM users",
        (err, result) => {
            if (err) {
                res.send({err: err});
            };
            if (result === undefined) {
                res.send({message: 'There are no users in the table!'});
            } else if (result.length > 0) {
                res.send(result);
            } else {
                res.send({message: 'There are no users in the table!'});
            };
        });
});

app.put('/block', (req, res) => {
    db.query("UPDATE users SET status = 1 WHERE id IN (?)",
        [req.body.selectedIds],
        (err, result) => {
            if (err) {
                res.send({err: err});
            };
                res.send({message: 'User(s) will be blocked!'});
    });
});

app.put('/unblock', (req, res) => {
    db.query("UPDATE users SET status = 0 WHERE id IN (?)",
        [req.body.selectedIds],
        (err, result) => {
            if (err) {
                res.send({err: err});
            };
            res.send({message: 'User(s) will be unblocked!'});
        });
});

app.put('/delete', (req, res) => {
    db.query("DELETE FROM users WHERE id IN (?)",
        [req.body.selectedIds],
        (err, result) => {
            if (err) {
                res.send({err: err});
            };
            res.send({message: 'User(s) will be deleted!'});
        });
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`running server on PORT ${PORT}`);
});