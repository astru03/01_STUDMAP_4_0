const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Static files in "public" verfügbar machen
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'startseite.html'));
});

app.get('/dokumentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dokumentation.html'));
});

app.get('/impressum', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'impressum.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
