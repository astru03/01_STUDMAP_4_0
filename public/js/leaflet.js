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
// Layer-EasyButton Funktionen
//------------------------------------------------------------------------
// Open the Layer Modal
L.easyButton(`<img src="../images/Layers.svg" alt="Layer" style="width:20px;height:20px;">`, function () {
  $('#layerModal').modal('show'); // Bootstrap function to show modal
}).addTo(map).button.classList.add("layer-button");

// Dynamically Add Categories and Subcategories
const categories = [
  {
    name: 'Kategorie 1',
    subcategories: ['Subkategorie 1.1', 'Subkategorie 1.2', 'Subkategorie 1.3']
  },
  {
    name: 'Kategorie 2',
    subcategories: ['Subkategorie 2.1', 'Subkategorie 2.2']
  },
  {
    name: 'Kategorie 3',
    subcategories: ['Subkategorie 3.1', 'Subkategorie 3.2', 'Subkategorie 3.3', 'Subkategorie 3.4']
  }
];

$(document).ready(function () {
  const $categories = $('#categories');
  categories.forEach((category, index) => {
    // Create a category section with subcategories inline
    const $categorySection = $(`<div class="category-section mb-3">
      <button class="btn btn-outline-primary w-100" data-index="${index}">${category.name}</button>
      <div class="subcategories mt-2" style="display: none;">
        ${category.subcategories.map(subcategory => `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${subcategory}" id="${subcategory}">
            <label class="form-check-label" for="${subcategory}">
              ${subcategory}
            </label>
          </div>
        `).join('')}
      </div>
    </div>`);
    $categories.append($categorySection);

    // Toggle subcategories on category button click
    $categorySection.find('button').on('click', function () {
      $categorySection.find('.subcategories').slideToggle();
    });
  });

  // Handle OK button click
  $('#applyFilters').on('click', function () {
    const selectedLayers = [];
    $categories.find('input:checked').each(function () {
      selectedLayers.push($(this).val());
    });
    console.log('Selected Layers:', selectedLayers); // Replace with actual logic to load layers
    $('#layerModal').modal('hide');
  });
});

//------------------------------------------------------------------------
// Upload-EasyButton Funktionen
//------------------------------------------------------------------------
L.easyButton(`<img src="../images/Upload.svg" alt="Upload" style="width:20px;height:20px;">`, function() {
  console.log('Upload button clicked!');
}).addTo(map).button.classList.add("upload-button");

//------------------------------------------------------------------------
// NDVI-EasyButton Funktionen
//------------------------------------------------------------------------
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