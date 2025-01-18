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


//------------------------------------------------------------------------
// Hinzufügen von Leaflet-EasyButton
//------------------------------------------------------------------------
L.easyButton(`<img src="../images/Layers.svg" alt="Layer" style="width:20px;height:20px;">`, function() {
  console.log('Layer button clicked!');
}).addTo(map).button.classList.add("layer-button");

L.easyButton(`<img src="../images/Upload.svg" alt="Upload" style="width:20px;height:20px;">`, function() {
  console.log('Upload button clicked!');
}).addTo(map).button.classList.add("upload-button");

L.easyButton(`<img src="../images/NDVI.svg" alt="NDVI" style="width:20px;height:20px;">`, function() {
  console.log('NDVI button clicked!');
}).addTo(map).button.classList.add("ndvi-button");
//------------------------------------------------------------------------


//------------------------------------------------------------------------
// Überwache den Zustand der Navbar und die Fenstergröße um die Easy-Buttons entsprechend zu verschieben
//------------------------------------------------------------------------
$(document).ready(function () {
  let isNavbarExpanded = false; // Zustand der Navbar

  function adjustButtonPositions(isNavbarExpanded) {
    if (isNavbarExpanded) {
      console.log('Navbar expanded or small screen size.');
      $('.leaflet-control-zoom').css('cssText', 'top: 220px !important;');
      $('.layer-button').css('cssText', 'top: 290px !important;');
      $('.upload-button').css('cssText', 'top: 320px !important;');
      $('.ndvi-button').css('cssText', 'top: 350px !important;');
    } else {
      console.log('Navbar collapsed or larger screen size.');
      $('.leaflet-control-zoom').css('cssText', 'top: 70px !important;');
      $('.layer-button').css('cssText', 'top: 140px !important;');
      $('.upload-button').css('cssText', 'top: 170px !important;');
      $('.ndvi-button').css('cssText', 'top: 200px !important;');
    }
  }

  // Überwache das Öffnen der Navbar
  $('#navbarNav').on('shown.bs.collapse', function () {
    console.log('Navbar is expanded.');
    isNavbarExpanded = true; // Navbar ist offen
    adjustButtonPositions(true);
  });

  // Überwache das Schließen der Navbar
  $('#navbarNav').on('hidden.bs.collapse', function () {
    console.log('Navbar is collapsed.');
    isNavbarExpanded = false; // Navbar ist geschlossen
    adjustButtonPositions(false);
  });

  // Überwache die Fenstergröße
  window.addEventListener('resize', function () {
    console.log('Window resized.');
    if (window.innerWidth >= 768) { 
      // Wenn der Bildschirm groß wird, behandle Navbar als geschlossen
      isNavbarExpanded = false;
      adjustButtonPositions(false);
    } else {
      // Wenn der Bildschirm klein wird, überprüfe den Navbar-Zustand. Ist die Navbar initial offen oder geschlossen
      const navbarIsExpanded = $('#navbarNav').hasClass('show');
      adjustButtonPositions(navbarIsExpanded);
    }
  });

  // Initialer Check, um die korrekte Position beim Laden zu setzen
  if (window.innerWidth >= 768) { // Großer Bildschirm, Navbar geschlossen
    adjustButtonPositions(false); 
  } else {
    adjustButtonPositions($('#navbarNav').hasClass('show'));
  }
});
//------------------------------------------------------------------------