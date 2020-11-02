const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3001;
const app = express();

// middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// connect to db
const db = new sqlite3.Database('./db/election.db', err => {
    if (err){
        return console.error(err.message);
    }
    console.log('Connected to the election db.');
});

// get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;
    const params = [];
    // all() runs sql query and executes the callback with all resulting rows that match the query
    db.all(sql, params, (err, rows) => {
        if (err){
            // 500 is a server error
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// get a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    // get() to return a single row from the database call
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    // ES5 function to use this
    db.run(sql, params, function(err, result){
        if (err){
            res.status(400).json({error: res.message});
            return;
        }
        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

// // delete a candidate
// db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result) {
//     if (err){
//         console.log(err);
//     }
//     console.log(result, this, this.changes);
// })

// // create candidate
// const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) VALUES (?, ?, ?, ?)`;
// const params = [1, 'Ronald', 'Firbank', 1];
// // ES5 function to use this
// db.run(sql, params, function(err, result){
//     if (err){
//         console.log(err);
//     }
//     console.log(result, this.lastID);
// })

app.use((req, res)=> {
    res.status(404).end();
})

// Start server after db connection
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
