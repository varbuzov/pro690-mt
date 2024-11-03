To create a single-page application with Node.js, Bootstrap, and an Azure SQL database, we can set up a project with the following steps:

### 1. Setup Project Directory

1. Initialize a Node.js project:
   ```bash
   mkdir notesApp
   cd notesApp
   npm init -y
   ```

2. Install necessary packages:
   ```bash
   npm install express mssql body-parser
   ```

### 2. Create Project Structure

```
notesApp
├── app.js           # Main application file
├── public
│   ├── css
│   │   └── style.css
│   └── js
│       └── script.js
└── views
    └── index.html   # Main HTML file
```

### 3. Create `app.js`

In `app.js`, configure the Express server and SQL database connection.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Azure SQL database configuration
const dbConfig = {
    user: "your_db_username",
    password: "your_db_password",
    server: "your_server.database.windows.net",
    database: "your_database_name",
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
```

### 4. Create `views/index.html`

This HTML file includes the Bootstrap form and a table to display notes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notes App</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
    <div class="container mt-5">
        <h2>Add Note</h2>
        <form id="noteForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" required>
            </div>
            <div class="form-group">
                <label for="note">Note</label>
                <textarea class="form-control" id="note" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>

        <h2 class="mt-5">Notes</h2>
        <table class="table table-bordered mt-3" id="notesTable">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Note</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <!-- Notes will be added here -->
            </tbody>
        </table>
    </div>

    <script src="js/script.js"></script>
</body>
</html>
```

### 5. Create `public/js/script.js`

This JavaScript file handles form submission, fetching notes, and deleting notes.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();

    document.getElementById('noteForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const note = document.getElementById('note').value;
        
        await fetch('/add-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, note })
        });
        
        fetchNotes();
        document.getElementById('noteForm').reset();
    });
});

async function fetchNotes() {
    const response = await fetch('/get-notes');
    const notes = await response.json();
    
    const notesTable = document.getElementById('notesTable').getElementsByTagName('tbody')[0];
    notesTable.innerHTML = '';
    
    notes.forEach(note => {
        const row = notesTable.insertRow();
        row.insertCell(0).textContent = note.name;
        row.insertCell(1).textContent = note.note;
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            await fetch(`/delete-note/${note.id}`, { method: 'DELETE' });
            fetchNotes();
        };
        row.insertCell(2).appendChild(deleteButton);
    });
}
```

### 6. Create SQL Table

In your Azure SQL database, create the `Notes` table:

```sql
CREATE TABLE Notes (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50),
    note NVARCHAR(MAX)
);
```

### 7. Run the Application

1. Start the Node.js server:
   ```bash
   node app.js
   ```
2. Open a browser and navigate to `http://localhost:3000`.