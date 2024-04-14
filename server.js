// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');



// Define the port the server will run on (default to 3001 if not specified in the environment variables)
const PORT = process.env.PORT || 3001;
const app = express();// Create an instance of express to serve our HTTP requests


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Route to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err) // Log error to console if reading file fails
      return res.status(500).send('Error reading notes data') // Return 500 status if error occurs
    }
    res.json(JSON.parse(data));// Send back the JSON data
  });
});
// Route to create a new note

app.post('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send ('Error reading note data')
    }
      try {
        const notes = JSON.parse(data)
        const newNote = { ...req.body, id:Date.now()}; // Spread existing note data and add a unique ID
        notes.push(newNote);

        fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error(err)
            return res.status(500).send('Error saving note')
          }
          res.json(newNote) // Return the new note data back to the client
        });
      } catch (jsonError) {
        console.error(jsonError)
        return res.status(500).send('Error parsing JSON')
      }
    });
});
// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
 const noteId = parseInt(req.params.id);// Parse the id parameter to an integer
 console.log(`Deleting note with ID: ${noteId}`)

 fs.readFile('db/db.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return res.status(500).send('Error reading notes data')
  }
  try {
    let notes = JSON.parse(data);
    // Store the original length of the notes array to check later if a note was deleted
    const originalLength = notes.length;
    // Filter out the note with the specified ID, essentially deleting it from the array
  // This creates a new array excluding the note that matches the provided ID
    notes = notes.filter(note => note.id !== noteId);
// The filter function loops over each note, and includes it in the new array only if the ID does not match the noteId

  // If no note has been removed (i.e., the array length remains the same), it means the specified ID was not found
  
    if (notes.length === originalLength) {
      console.log(`No note found with ID: ${noteId}`)
      return res.status(404).send('Note not found');
    }


    fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Error saving notes data')
      }
      res.send('Note deleted')// Confirm deletion
    });
  } catch (jsonError) {
    console.error(jsonError)
    return res.status(500).send('Error parsing JSON');
  }
  });
});

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for feedback page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.listen(PORT, () => 
  console.log(`App listening at http://localhost:${PORT}`)
);