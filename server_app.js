const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// bereitstellen statischer Datein wie HTML, CSS und JavaScript, die sich im Ordner /public oder /node_modules befinden
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

// CORS-Konfiguration: Erlaubt Cross-Origin-Anfragen von beliebigen Ursprüngen.
app.use(cors()); // Mit dieser Zeile werden CORS-Anfragen für alle Routen aktiviert

// Routes
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/startseite.html"); });
app.get("/dokumentation", (req, res) => { res.sendFile(__dirname + "/public/dokumentation.html"); });
app.get("/impressum", (req, res) => { res.sendFile(__dirname + "/public/impressum.html"); });

// Proxy für Get-Anfrage vom GeoServer
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send("Fehlende URL-Parameter.");
    }
    try {
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer', // Wichtig für Binärdaten (Bilder, XML, etc.)
            headers: {
                'Accept': 'application/xml,text/xml,*/*',
            }
        });
        // CORS-Header für Client freigeben
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error("Fehler beim Proxy-Request:", error.message);
        res.status(500).send("Fehler beim Abrufen der Daten: " + error.message);
    }
});
// Proxy für POST-Anfragen vom GeoServer
app.post('/proxy', express.text({ type: '*/*' }), async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send("Fehlende URL-Parameter.");
    }
    try {
        const response = await axios.post(targetUrl, req.body, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': req.headers['content-type'] || 'text/xml',
                'Accept': 'application/xml,text/xml,*/*'
            }
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error("Fehler beim Proxy-POST-Request:", error.message);
        res.status(500).send("Fehler beim POST an den Zielserver: " + error.message);
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
