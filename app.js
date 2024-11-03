const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Azure SQL database configuration
const dbConfig = {
    user: "sqladmin",
    password: "P@ssw0rd123",
    server: "pro690mt-dbsrv.database.windows.net",
    database: "pro690mt-db01",
    options: {
        encrypt: true
    }
};

// Route to render HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Route to add a note
app.post('/add-note', async (req, res) => {
    const { name, note } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('note', sql.VarChar, note)
            .query("INSERT INTO Notes (name, note) VALUES (@name, @note)");
        
        res.status(200).send({ message: 'Note added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to add note.' });
    }
});

// Route to get all notes
app.get('/get-notes', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM Notes");
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to retrieve notes.' });
    }
});

// Route to delete a note by ID
app.delete('/delete-note/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Notes WHERE id = @id");
        
        res.status(200).send({ message: 'Note deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to delete note.' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
