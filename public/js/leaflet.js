// create a variable for the map
var map = L.map('map').setView([51.975, 7.61], 12);

// add the base map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Füge ein Event hinzu, damit die Karte sich anpasst, wenn das Fenster seine Größe ändert
window.addEventListener('resize', function() {
  map.invalidateSize(); // Veranlasst die Karte, ihre Größe neu zu berechnen
});
