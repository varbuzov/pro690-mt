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
