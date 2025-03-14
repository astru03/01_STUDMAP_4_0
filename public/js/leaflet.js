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
  'UAS': {
    name: 'UAS',
    subcategories: {
      'Höhenmodelle & Geländeanalyse': {},
      'Multispektrale Analysen & NDVI': {},
      'Orthophotos & RGB-Aufnahmen': {},
      'Flüsse': {}
    }
  },
  'OpenNRW': {
    name: 'OpenNRW',
    subcategories: {
      'Basiskarten': {
        layers: {
          'WMS_NW_ABK': 'OpenNRW:WMS_NW_ABK',
          'WMS_NW_DGK5': 'OpenNRW:WMS_NW_DGK5'
        }
      },
      'Orthophotos & Overlay': {
        layers: {
          'WMS_NW_DOP': 'OpenNRW:WMS_NW_DOP',
          'WMS_NW_DOP_OVERLAY': 'OpenNRW:WMS_NW_DOP_OVERLAY'
        }
      },
      'Topographische Karten': {
        layers: {
          'WMS_NW_DTK10': 'OpenNRW:WMS_NW_DTK10',
          'WMS_NW_DTK25': 'OpenNRW:WMS_NW_DTK25',
          'WMS_NW_DTK50': 'OpenNRW:WMS_NW_DTK50',
          'WMS_NW_DTK100': 'OpenNRW:WMS_NW_DTK100',
        }
      },
      'Digitales Geländemodell': {
        layers: {
          'WMS_NW_GELAENDESTUFEN': 'OpenNRW:WMS_NW_GELAENDESTUFEN',
          'Geländestufen': 'OpenNRW:nw_gelaendestufen',
          'Geländestufen Metadaten': 'OpenNRW:nw_gelaendestufen_info'
        }
      },
      'Höhenlinien und Höhenpunkte': {
        layers: {
          'WMS_NW_HL_HP_SCHWARZ': 'OpenNRW:WMS_NW_HL_HP_SCHWARZ',
          'WMS_NW_DGK5': 'OpenNRW:WMS_NW_DGK5'
        }
      },
      'Digitales Oberflächenmodell': {
        layers: {
          'WMS_NW_NDOM': 'OpenNRW:WMS_NW_NDOM',
          'WMS_NW_TDOM': 'OpenNRW:WMS_NW_TDOM',
        }
      },
      'Verwaltungskarte': {
        layers: {
          'WMS NW VK250': 'OpenNRW:WMS_NW_VK250'
        }
      }
    }
  }
};

$(document).ready(function () {
  const $categories = $('#categories');
  let selectedCategory = null;

  Object.keys(categories).forEach((catKey) => {
    const category = categories[catKey];
    const $categorySection = $(`<div class="category-section mb-3">
      <button class="btn btn-outline-primary w-100 category-button" data-category="${catKey}">${category.name}</button>
      <div class="subcategories mt-2" style="display: none;"></div>
    </div>`);

    $categories.append($categorySection);
    const $subcategories = $categorySection.find('.subcategories');

    Object.keys(category.subcategories).forEach((subKey) => {
      const subcategory = category.subcategories[subKey];
      const $subCategorySection = $(`<div class="subcategory-section mb-2">
        <button class="btn btn-outline-secondary w-100">${subKey}</button>
        <div class="layers mt-2" style="display: none;"></div>
      </div>`);

      $subcategories.append($subCategorySection);
      const $layers = $subCategorySection.find('.layers');

      if (subcategory.layers) {
        Object.keys(subcategory.layers).forEach((layerKey) => {
          $layers.append(`
            <div class="form-check">
              <input class="form-check-input layer-checkbox" type="checkbox" value="${subcategory.layers[layerKey]}" id="${layerKey}">
              <label class="form-check-label" for="${layerKey}">
                ${layerKey}
              </label>
            </div>`);
        });
      }

      $subCategorySection.find('button').on('click', function (e) {
        e.stopPropagation();
        $layers.slideToggle();
      });
    });

    $categorySection.find('.category-button').on('click', function (e) {
      selectedCategory = $(this).data('category');
      if ($subcategories.is(":visible")) {
        $subcategories.slideUp();
      } else {
        $subcategories.slideDown();
      }
      e.stopPropagation();
    });
  });

  var wmsLayer;

  $('#applyFilters').on('click', function () {
    const selectedLayers = $('.layer-checkbox:checked').map(function () {
        return $(this).val();
    }).get();
    //Unterscheidung ob UAS oder OpenNRW gewählt wurde, je nach auswahl wird die URL für das WMS angepasst.
    if (selectedLayers.length === 1 && selectedCategory) {
        const selectedLayer = selectedLayers[0];
        let geoserverBaseUrl;

        if (selectedCategory === 'OpenNRW') {
            geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/OpenNRW/ows";
        } else if (selectedCategory === 'UAS') {
            geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/ivv6mapsarcgis/ows";
        } else {
            alert("Ungültige Kategorie gewählt.");
            return;
        }

        const wmsUrl = `${geoserverBaseUrl}?service=WMS&version=1.3.0&request=GetMap&layers=${selectedLayer}&styles=&format=image/png&transparent=true`;

        if (wmsLayer) {
            map.removeLayer(wmsLayer);
        }

        wmsLayer = L.tileLayer.wms(geoserverBaseUrl, {
            layers: selectedLayer,
            format: 'image/png',
            transparent: true,
            attribution: "&copy; OpenNRW"
        }).addTo(map);

        //setzt die WMSURL und den Namen
        $('#wmsUrlInput').val(wmsUrl);
        $('#wmsLayerName').text(selectedLayer);

        const getCapabilitiesUrl = `http://localhost:3000/proxy?url=${encodeURIComponent("http://zdm-studmap.uni-muenster.de:8080/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities")}`;

        //hole aus den getCapabilities das entsprechende Koordinatensystem
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

                $('#wmsCrs').text(crsList.join(", "));
                $('#wmsInfoModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.error("Fehler bei der CRS-Abfrage:", status, error);
                alert("Fehler beim Abrufen der GetCapabilities: " + error);
                $('#wmsInfoModal').modal('show');
            }
        });

        $('#layerModal').modal('hide');
    } else {
        alert("Bitte genau einen Layer auswählen und eine Kategorie wählen.");
    }
  });

  $('#copyWmsUrl').on('click', function () {
      var wmsUrlInput = document.getElementById("wmsUrlInput");
      wmsUrlInput.select();
      wmsUrlInput.setSelectionRange(0, 99999);
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