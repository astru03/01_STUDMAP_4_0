// create a variable for the map
var map = L.map('map').setView([51.975, 7.61], 12);

// add the base map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Füge ein Event hinzu, damit die Karte sich anpasst, wenn das Fenster seine Größe ändert
window.addEventListener('resize', function () {
  map.invalidateSize(); // Veranlasst die Karte, ihre Größe neu zu berechnen
});

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// Layer-EasyButton Funktionen
//------------------------------------------------------------------------
//------------------------------------------------------------------------

// Open the Layer Modal
L.easyButton(`<img src="../images/Layers.svg" alt="Layer" style="width:20px;height:20px;">`, function () {
  $('#layerModal').modal('show'); // Bootstrap function to show modal
}).addTo(map).button.classList.add("layer-button");

// Dynamically Add Categories and Subcategories
const categories = {
  'OpenNRW': {
    name: 'OpenNRW',
    layers: {
      'WMS_NW_ABK': 'OpenNRW:WMS_NW_ABK',
      'WMS_NW_DGK5': 'OpenNRW:WMS_NW_DGK5'
    }
  }
};

$(document).ready(function () {
  const $categories = $('#categories');

  // Categories and Layer checkboxes
  Object.keys(categories).forEach((catKey) => {
    const category = categories[catKey];
    const $categorySection = $(`<div class="category-section mb-3">
      <button class="btn btn-outline-primary w-100">${category.name}</button>
      <div class="subcategories mt-2" style="display: none;">
        ${Object.keys(category.layers).map(layerKey => `
          <div class="form-check">
            <input class="form-check-input layer-checkbox" type="checkbox" value="${category.layers[layerKey]}" id="${layerKey}">
            <label class="form-check-label" for="${layerKey}">
              ${layerKey}
            </label>
          </div>
        `).join('')}
      </div>
    </div>`);
    
    $categories.append($categorySection);
    $categorySection.find('button').on('click', function () {
      $categorySection.find('.subcategories').slideToggle();
    });
  });

  var wmsLayer; // Variable zum Speichern des aktuellen WMS-Layers

  $('#applyFilters').on('click', function () {
    const selectedLayers = $('.layer-checkbox:checked').map(function () {
        return $(this).val();
    }).get();

    if (selectedLayers.length === 1) { // Nur ein Layer erlaubt
        const selectedLayer = selectedLayers[0];
        //An dieser Stelle muss noch eine unterscheidung stattfinden. Zumindest zwischen OpenNRW und ivv6
        const geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/OpenNRW/ows"; //so erhalte ich nur die unter OpenNRW
       // const geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/ivv6mapsarcgis/ows"; //so erhalte ich nur die unter ivv6
        //const geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/ows"; so erhalte ich eine URL die alle WMS dienste enthält die auf dem Geoserverliegen
        const wmsUrl = `${geoserverBaseUrl}?service=WMS&version=1.3.0&request=GetMap&layers=${selectedLayer}&styles=&format=image/png&transparent=true`;

        // WMS-Layer zur Karte hinzufügen
        if (wmsLayer) {
            map.removeLayer(wmsLayer);
        }

        wmsLayer = L.tileLayer.wms(geoserverBaseUrl, {
            layers: selectedLayer,
            format: 'image/png',
            transparent: true,
            attribution: "&copy; OpenNRW"
        }).addTo(map);

        // URL & Layername direkt setzen
        $('#wmsUrlInput').val(wmsUrl);
        $('#wmsLayerName').text(selectedLayer);

        // CRS abrufen & direkt ins Modal schreiben
        const getCapabilitiesUrl = `http://localhost:3000/proxy?url=${encodeURIComponent("http://zdm-studmap.uni-muenster.de:8080/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities")}`;

        $.ajax({
            url: getCapabilitiesUrl,
            dataType: 'xml',
            success: function (xml) {
                const layerElement = $(xml).find(`Layer > Layer > Name:contains(${selectedLayer})`).closest('Layer');
                if (layerElement.length === 0) {
                    console.error("Layer nicht gefunden in GetCapabilities.");
                    alert("Layer nicht gefunden in GetCapabilities.");
                    return;
                }

                const crsList = layerElement.find('CRS').map(function () {
                    return $(this).text();
                }).get();

                // CRS in Modal setzen
                $('#wmsCrs').text(crsList.join(", "));
                
                // Modal erst nach erfolgreicher CRS-Abfrage anzeigen
                $('#wmsInfoModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.error("Fehler bei der CRS-Abfrage:", status, error);
                alert("Fehler beim Abrufen der GetCapabilities: " + error);
                $('#wmsInfoModal').modal('show'); // Falls Fehler, Modal trotzdem zeigen
            }
        });

        $('#layerModal').modal('hide');
    } else {
        alert("Bitte genau einen Layer auswählen.");
    }
});

  // Kopier-Button für die WMS-URL
  $('#copyWmsUrl').on('click', function () {
      var wmsUrlInput = document.getElementById("wmsUrlInput");
      wmsUrlInput.select();
      wmsUrlInput.setSelectionRange(0, 99999); // Für mobile Geräte
      document.execCommand("copy");
      alert("WMS-URL wurde kopiert!");
  });

});







//------------------------------------------------------------------------
//------------------------------------------------------------------------
// Upload-EasyButton Funktionen
//------------------------------------------------------------------------
//------------------------------------------------------------------------
L.easyButton(`<img src="../images/Upload.svg" alt="Upload" style="width:20px;height:20px;">`, function () {
  // Create a file input element dynamically
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true; // Allow multiple files
  fileInput.accept = ".geojson,.shp,.kml,.csv,.gpx,.tif,.png,.jpg,.jpeg";

  fileInput.addEventListener('change', function (event) {
    const files = event.target.files;
    Array.from(files).forEach(file => {
      if (!validateFileType(file)) {
        // Wenn der Dateityp ungültig ist, überspringe den Rest und zeige eine Fehlermeldung an
        return;
      }

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.geojson')) {
        handleGeoJSON(file);
      } else if (fileName.endsWith('.shp')) {
        handleShapefile(file);
      } else if (fileName.endsWith('.kml')) {
        handleKML(file);
      } else if (fileName.endsWith('.csv')) {
        handleCSV(file);
      } else if (fileName.endsWith('.gpx')) {
        handleGPX(file);
      } else if (fileName.endsWith('.tif')) {
        handleGeoTIFF(file);
      } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        handleImageOverlay(file);
      } else {
        alert('Unsupported file format: ' + file.name); // Für den Fall, dass noch ein Format übrig bleibt
      }
    });
  });

  fileInput.click();
}).addTo(map).button.classList.add("upload-button");

// Function to handle GeoJSON
function handleGeoJSON(file) {
  const reader = new FileReader();

  // Lese die Datei ein
  reader.onload = function (e) {
    try {
      // Versuche, die Datei als GeoJSON zu parsen
      const geojson = JSON.parse(e.target.result);

      // Prüfe, ob das GeoJSON gültig ist
      if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
        throw new Error("Die GeoJSON Formatierung ist nicht korrekt.");
       }

      // Zulässige Geometrie-Typen
      const validGeometries = ["Point", "LineString", "Polygon", "MultiPolygon", "MultiLineString", "MultiPoint"];

      // Prüfe jede Feature-Geometrie
      for (const feature of geojson.features) {
        if (!feature.geometry || !validGeometries.includes(feature.geometry.type)) {
          throw new Error(`Ungültige Geometrie im GeoJSON gefunden: ${feature.geometry?.type || "undefined"}`);
        }
      }

      // Füge die GeoJSON-Daten zur Karte hinzu
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          const props = feature.properties || {};
          const popupContent = Object.keys(props).map(key => `<strong>${key}:</strong> ${props[key]}`).join("<br>");
          layer.bindPopup(popupContent || "Keine zusätzlichen Informationen verfügbar.");
        }
      }).addTo(map);

      console.log("GeoJSON erfolgreich hinzugefügt.");
    } catch (err) {
      // Zeige die tatsächliche Fehlermeldung im Modal an
      showErrorModal(err.message);
    }
  };

  reader.readAsText(file);
}

// Function to handle Shapefile
function handleShapefile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    shp(e.target.result).then(function (geojson) {
      L.geoJSON(geojson).addTo(map);
    });
  };
  reader.readAsArrayBuffer(file);
}

// Function to handle KML
function handleKML(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const kmlLayer = omnivore.kml.parse(e.target.result);
    kmlLayer.addTo(map);
  };
  reader.readAsText(file);
}

// Function to handle CSV
function handleCSV(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    const header = lines[0].split(',');
    const latIndex = header.indexOf('lat');
    const lonIndex = header.indexOf('lon');

    if (latIndex === -1 || lonIndex === -1) {
      alert('CSV file must contain lat and lon columns.');
      return;
    }

    const markers = [];
    lines.slice(1).forEach(line => {
      const values = line.split(',');
      const lat = parseFloat(values[latIndex]);
      const lon = parseFloat(values[lonIndex]);

      if (!isNaN(lat) && !isNaN(lon)) {
        markers.push(L.marker([lat, lon]));
      }
    });

    if (markers.length > 0) {
      L.featureGroup(markers).addTo(map);
    } else {
      alert('No valid points found in the CSV file.');
    }
  };
  reader.readAsText(file);
}

// Function to handle GPX
function handleGPX(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const gpxLayer = new L.GPX(e.target.result, {
      async: true
    });
    gpxLayer.addTo(map);
  };
  reader.readAsText(file);
}

// Function to handle GeoTIFF
function handleGeoTIFF(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    parseGeoraster(e.target.result).then(georaster => {
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7
      });
      layer.addTo(map);
    });
  };
  reader.readAsArrayBuffer(file);
}

// Function to handle Image Overlay (PNG, JPG)
function handleImageOverlay(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const bounds = [[51.95, 7.58], [51.99, 7.64]]; // Example bounds, should come from user input
    const imageOverlay = L.imageOverlay(e.target.result, bounds).addTo(map);
    map.fitBounds(bounds);
  };
  reader.readAsDataURL(file);
}

// Function ErrorMessage
function showErrorModal(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message; // Setze die Fehlermeldung
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  errorModal.show(); // Zeige das Modal an
}

// Function Valide Datentyp
function validateFileType(file) {
  const validExtensions = [".geojson", ".shp", ".kml", ".csv", ".gpx", ".tif", ".png", ".jpg", ".jpeg"];
  const fileName = file.name.toLowerCase();
  const isValid = validExtensions.some(ext => fileName.endsWith(ext));
  if (!isValid) {
    showErrorModal("Es wurde ein falsches Datenformat ausgewählt.");
    return false;
  }
  return true;
}
//------------------------------------------------------------------------




//------------------------------------------------------------------------
//------------------------------------------------------------------------
// NDVI-EasyButton Funktionen
//------------------------------------------------------------------------
//------------------------------------------------------------------------
L.easyButton(`<img src="../images/NDVI.svg" alt="NDVI" style="width:20px;height:20px;">`, function () {
  console.log('NDVI button clicked!');
}).addTo(map).button.classList.add("ndvi-button");
//------------------------------------------------------------------------




//------------------------------------------------------------------------
//------------------------------------------------------------------------
// Überwache den Zustand der Navbar und die Fenstergröße um die Easy-Buttons entsprechend zu verschieben
//------------------------------------------------------------------------
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