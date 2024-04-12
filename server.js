const express = require('express');
const path = require('path');
const fs = require('fs');




const PORT = process.env.PORT || 3001;
const app = express();


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error reading notes data')
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send ('Error reading note data')
    }
      try {
        const notes = JSON.parse(data)
        const newNote = { ...req.body, id:Date.now()};
        notes.push(newNote);

        fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error(err)
            return res.status(500).send('Error saving note')
          }
          res.json(newNote)
        });
      } catch (jsonError) {
        console.error(jsonError)
        return res.status(500).send('Error parsing JSON')
      }
    });
});

app.delete('/api/notes/:id', (req, res) => {
 const noteId = parseInt(req.params.id);
 console.log(`Deleting note with ID: ${noteId}`)

 fs.readFile('db/db.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return res.status(500).send('Error reading notes data')
  }
  try {
    let notes = JSON.parse(data);
    const originalLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);

    if (notes.length === originalLength) {
      console.log(`No note found with ID: ${noteId}`)
      return res.status(404).send('Note not found');
    }


    fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Error saving notes data')
      }
      res.send('Note deleted')
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