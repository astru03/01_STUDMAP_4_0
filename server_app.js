const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// bereitstellen statischer Datein wie HTML, CSS, JavaScript, die sich im Ordner /public oder / node_modules befinden
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

// Routes
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/startseite.html"); });
app.get("/dokumentation", (req, res) => { res.sendFile(__dirname + "/public/dokumentation.html"); });
app.get("/impressum", (req, res) => { res.sendFile(__dirname + "/public/impressum.html"); });

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
