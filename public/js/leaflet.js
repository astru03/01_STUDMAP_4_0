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
const layerButton = L.easyButton(
  `<img src="../images/Layers.svg" alt="Layer" style="width:20px;height:20px;">`,
  function () {
    $('#layerModal').modal('show'); // Bootstrap function to show modal
  }
).addTo(map);

// Tooltip hinzufügen
layerButton.button.classList.add("layer-button");
layerButton.button.setAttribute("title", "Layer");

// Dynamically Add Categories and Subcategories
const categories = {
  'UAS': {
    name: 'UAS',
    subcategories: {
      'Höhenmodelle & Geländeanalyse': {
        layers: {
          'HillShade_UAS_2019': 'ivv6mapsarcgis:HillShade UAS 2019',
          'Hillshade_UAS_2018': 'ivv6mapsarcgis:Hillshade UAS 2018'
        }
      },
      'Multispektrale Analysen & NDVI': {
        layers: {
          'Multispectral__WTL1 UAS 2023': 'ivv6mapsarcgis:Multispectra__WTL1 UAS 2023',
          'Multispectral_WTL1 UAS 2022': 'ivv6mapsarcgis:Multispectral_WTL1 UAS 2022'
        }
      },
      'Orthophotos & RGB-Aufnahmen': {
        layers: {
          'RGB_NIR_Sentinel': 'ivv6mapsarcgis:RGB_NIR Sentinel'
        }
      },
      'Flüsse': {

      }
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
const uploadButton = L.easyButton(
  `<img src="../images/Upload.svg" alt="Upload" style="width:20px;height:20px;">`,
  function () {
    $('#uploadInfoModal').modal('show'); // Öffnet das Popupfenster. Zeigt welche Datenformate untersützt werden.
  }
).addTo(map);

// Tooltip für den Upload-Button
uploadButton.button.classList.add("upload-button");
uploadButton.button.setAttribute("title", "Upload");

// Event-Listener für den OK-Button
document.getElementById("confirmUpload").addEventListener("click", function () {
  $('#uploadInfoModal').modal('hide'); // Popup fenster schließen

  // Datei-Upload-Dialog öffnen
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true; // mehrere Daten können gleichzeitig ausgewählt werden
  fileInput.accept = ".shp,.shx,.prj,.dbf,.geojson,.kml,.csv,.gpx,.tif"; // Diese Formate zum temporären hochladen werden unterstützt

  // Event-Listener für das Hochladen von Dateien
  fileInput.addEventListener('change', function (event) {
    let files = Array.from(event.target.files); // Setzt die hochgeladenen Dateien in ein Array

    //Prüft, ob eine Shape-Datei enthalten ist
    const containsShapefile = files.some(file =>
      file.name.endsWith('.shp') || file.name.endsWith('.shx') ||
      file.name.endsWith('.prj') || file.name.endsWith('.dbf')
    );

    // Wenn Shape-Datei enthalten, dann werden diese gruppiert.
    if (containsShapefile) {
      const fileGroups = groupShapefileComponents(files);

      // Prüft, ob für das Anzeigen einer Shape-Datei alle benötigten Shapefile-Komponenten vorhanden sind
      fileGroups.forEach(fileSet => {
        if (fileSet.shp && fileSet.shx && fileSet.prj && fileSet.dbf) {
          handleShapefile(fileSet);
        } else {
          showErrorModal("Fehlende Dateien für Shapefile! Es werden .shp, .shx, .prj und .dbf benötigt.");
        }
      });

      // Verarbeitete Shape-Datein werden aus der Liste entfernt, damit doppelte Verarbeitung verhindert wird
      files = files.filter(file =>
        !file.name.endsWith('.shp') && !file.name.endsWith('.shx') &&
        !file.name.endsWith('.prj') && !file.name.endsWith('.dbf')
      );
    }

    // restliche Datenformate werden verarbeitet
    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      if (validateFileType(file)) { // Prüft, ob das Dateiformat gültig ist
        if (fileName.endsWith('.geojson')) {
          handleGeoJSON(file);
        } else if (fileName.endsWith('.kml')) {
          handleKML(file);
        } else if (fileName.endsWith('.csv')) {
          handleCSV(file);
        } else if (fileName.endsWith('.gpx')) {
          handleGPX(file);
        } else if (fileName.endsWith('.tif')) {
          handleGeoTIFF(file);
        }
      }
    });
  });

  fileInput.click();
});


//------------------------------------------------
// Funktion zum Verarbeiten von Shapefiles (FERTIG)
function handleShapefile(fileSet) {
  const shpReader = new FileReader(); // generiert ein FileReader-Objekt zum Lesen der .shp-Datei

  shpReader.onload = function (e) {
    const shpData = e.target.result; // Enthält die gelesenen Daten der .shp-Datei als ArrayBuffer

    // Alle zugehörigen Dateien als ArrayBuffer lesen
    Promise.all([
      readFileAsArrayBuffer(fileSet.shx),
      readFileAsArrayBuffer(fileSet.dbf),
      readFileAsArrayBuffer(fileSet.prj)
    ]).then(([shxData, dbfData, prjData]) => {
      // Verwende die shpjs-Bibliothek zur Umwandlung in GeoJSON mit shpjs-Bibliothek
      shp({ shp: shpData, shx: shxData, dbf: dbfData, prj: prjData }).then(geojson => {
        const layer = L.geoJSON(geojson).addTo(map);
        map.fitBounds(layer.getBounds());
      }).catch(err => {
        showErrorModal("Fehler beim Verarbeiten der Shapefile: " + err.message);
      });
    }).catch(err => {
      showErrorModal("Fehler beim Lesen der Shapefile-Dateien: " + err.message);
    });
  };

  shpReader.readAsArrayBuffer(fileSet.shp);
}
// Shapefile-Zusatzfunktion: Funktion zum Gruppieren von Shapefile-Komponenten
function groupShapefileComponents(files) {
  let fileGroups = {};

  files.forEach(file => {
    const baseName = file.name.replace(/\.(shp|shx|prj|dbf)$/i, ''); // Entferne die Endung
    if (!fileGroups[baseName]) { // Sollte der Basisname noch nicht in fileGroups existiert, wird ein neues Objekt erstellt
      fileGroups[baseName] = {};
    }
    // Weist die jeweilige Datei dem entsprechenden Typ (shp, shx, prj, dbf) im Gruppenobjekt zu
    if (file.name.endsWith('.shp')) fileGroups[baseName].shp = file;
    if (file.name.endsWith('.shx')) fileGroups[baseName].shx = file;
    if (file.name.endsWith('.prj')) fileGroups[baseName].prj = file;
    if (file.name.endsWith('.dbf')) fileGroups[baseName].dbf = file;
  });

  return Object.values(fileGroups);
}
// Shapefile-Zusatzfunktion: Funktion zum Lesen von Dateien als ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    // Falls keine Datei übergeben wurde, wird null zurückgegeben
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Wenn das Lesen erfolgreich abgeschlossen ist, wird der ArrayBuffer zurückgegeben
    reader.onerror = () => reject(reader.error); // Falls ein Fehler beim Lesen auftritt, wird das Promise abgelehnt
    reader.readAsArrayBuffer(file);  // Startet das Lesen der Datei als ArrayBuffer
  });
}
//------------------------------------------------


//------------------------------------------------
// Funktion zum Verarbeiten von GeoJSON (FERTIG)
function handleGeoJSON(file) {
  const reader = new FileReader();
  // Lese die Datei ein
  reader.onload = function (e) {
    try {

      const content = e.target.result.trim(); // Entfernt Leerzeichen am Anfang/Ende
      if (!content) { // Prüfe, ob die Datei leer ist
        throw new Error("Die Datei ist leer.");
      }

      // Versuche, die Datei als GeoJSON zu parsen
      const geojson = JSON.parse(e.target.result);

      // Prüfe, ob das GeoJSON gültig ist
      if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
        throw new Error("Die GeoJSON Formatierung ist nicht korrekt.");
      }
      // Prüfe, ob die Datei Features enthält
      if (geojson.features.length === 0) {
        throw new Error("Die GeoJSON-Datei enthält keine Features.");
      }

      // Zulässige Geometrie-Typen
      const validGeometries = ["Point", "LineString", "Polygon", "MultiPolygon", "MultiLineString", "MultiPoint"];

      // Prüfe jede Feature-Geometrie und Koordinaten
      for (const feature of geojson.features) {
        if (!feature.geometry || !validGeometries.includes(feature.geometry.type)) {
          throw new Error(`Ungültige Geometrie im GeoJSON gefunden: ${feature.geometry?.type || "undefined"}`);
        }
        // Prüfe, ob Koordinaten vorhanden und gültig sind
        if (!Array.isArray(feature.geometry.coordinates)) {
          throw new Error("Ein Feature enthält ungültige oder fehlende Koordinaten.");
        }
        if (!isValidCoordinate(feature.geometry.coordinates)) {
          throw new Error(`Ein Feature enthält ungültige Koordinaten: ${JSON.stringify(feature.geometry.coordinates)}`);
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
// Hilfsfunktion zur Prüfung der Koordinaten
function isValidCoordinate(coord) {
  // Falls es sich um ein MultiPolygon handelt, überprüfe rekursiv alle Koordinaten
  if (Array.isArray(coord[0])) {
    return coord.every(isValidCoordinate); // rekursiver Aufruf für verschachtelte Arrays
  }
  
  // Basisüberprüfung: Koordinaten müssen 2 numerische Werte sein, die im gültigen Bereich für WGS84 liegen
  return (
    Array.isArray(coord) &&
    coord.length >= 2 &&
    typeof coord[0] === "number" &&
    typeof coord[1] === "number" &&
    coord[0] >= -180 && coord[0] <= 180 && // Längengrad
    coord[1] >= -90 && coord[1] <= 90     // Breitengrad
  );
}

//------------------------------------------------


//------------------------------------------------
// Funktion zum Verarbeiten von KML (FERTIG)
function handleKML(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const kmlText = e.target.result;
    const kmlLayer = omnivore.kml.parse(kmlText);

    kmlLayer.on('ready', function () {
      map.fitBounds(kmlLayer.getBounds()); // Karte zoomt auf das KML-Gebiet
    });

    kmlLayer.addTo(map);
  };
  reader.readAsText(file);
}
//------------------------------------------------


//------------------------------------------------
// Funktion zum Verarbeiten von CSV mit Punkten, Linien & Polygonen (nochmal überarbeiten)
function handleCSV(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    const header = splitCSVLine(lines[0]); // Verbesserte Split-Funktion
    const nameIndex = header.indexOf('name');
    const latIndex = header.indexOf('lat');
    const lonIndex = header.indexOf('lon');
    const geomIndex = header.indexOf('geometry');

    if (nameIndex === -1 || geomIndex === -1) {
      alert('CSV file must contain name and geometry columns.');
      return;
    }

    const features = [];
    lines.slice(1).forEach(line => {
      if (!line.trim()) return; // Überspringt leere Zeilen

      const values = splitCSVLine(line); // Korrektes Parsen der Zeile
      const name = values[nameIndex] || "Unbenannt";
      const lat = parseFloat(values[latIndex]);
      const lon = parseFloat(values[lonIndex]);
      const geometry = values[geomIndex] ? values[geomIndex].trim() : "";

      if (!isNaN(lat) && !isNaN(lon) && geometry === "") {
        // 🟢 Punkt erstellen
        features.push(L.marker([lat, lon]).bindPopup(name));
      } else if (geometry.startsWith("LINESTRING")) {
        // 🔵 Linie parsen
        const coords = parseWKT(geometry);
        features.push(L.polyline(coords, { color: 'blue' }).bindPopup(name));
      } else if (geometry.startsWith("POLYGON")) {
        // 🟢 Polygon parsen
        const coords = parseWKT(geometry);
        features.push(L.polygon(coords, { color: 'green' }).bindPopup(name));
      }
    });

    if (features.length > 0) {
      L.featureGroup(features).addTo(map);
    } else {
      alert('No valid geometries found in the CSV file.');
    }
  };
  reader.readAsText(file);
}
// CSV-Zusatzfunktion: Funktion zum Parsen von WKT (Well-Known Text)
function parseWKT(wkt) {
  return wkt.match(/[-+]?\d*\.\d+ [-+]?\d+\.\d+/g).map(coord => {
    const [lon, lat] = coord.split(' ').map(Number);
    return [lat, lon]; // Leaflet braucht [lat, lon] statt [lon, lat]
  });
}
// CSV-Zusatzfunktion: Funktion zum sicheren Parsen einer CSV-Zeile
function splitCSVLine(line) {
  return line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(value => value.replace(/^"|"$/g, '')) || [];
}
//------------------------------------------------


//------------------------------------------------
// Funktion zum Verarbeiten von GPX (FERTIG)
function handleGPX(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    // Definition des Icons für Waypoints (ohne Schatten)
    const waypointIcon = new L.Icon({
      iconUrl: '/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: null,
      alt: ""
    });

    const gpxLayer = new L.GPX(e.target.result, {
      async: true,
      marker_options: {
        startIconUrl: '/images/marker-icon.png',
        endIconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png', // Schatten für Start- und Endmarker entfernen
        waypointIcon: waypointIcon, // Verwende das definierte Icon für Waypoints
        wptIconUrls: {
          '': '/images/marker-icon.png'  // Leerer String als Schlüssel
        },
        pointMatchers: [
          {
            regex: /./,  // Matcht alles
            icon: waypointIcon
          }
        ]
      }
    }).on('loaded', function (e) {
      map.fitBounds(e.target.getBounds());

    }).on('addpoint', function (e) {
      console.log("Waypoint hinzugefügt:", e.point);
      // Extrahiere den Namen aus e.point.options.title
      const waypointName = e.point.options.title;

      let waypointDescription = '';
      if (e.point._popup && e.point._popup._content) {
        waypointDescription = e.point._popup._content.replace(/<[^>]*>?/gm, ''); // Entferne HTML-Tags
      }

      if (waypointName) {
        L.marker(e.point._latlng, { icon: waypointIcon, title: "" }) // Verwende das definierte Icon
          .addTo(map)
          .bindPopup(`<b>${waypointName}</b><br>${waypointDescription || 'Keine Beschreibung'}`)
          .openPopup();
      }
    }).on('error', function () {
      alert("Fehler beim Laden der GPX-Datei. Bitte prüfen Sie das Format.");
    });

    gpxLayer.addTo(map);
  };
  reader.readAsText(file);
}
//------------------------------------------------


//------------------------------------------------
// Funktion zum Verarbeiten von GeoTIFF (FERTIG)
function handleGeoTIFF(file) {
  const reader = new FileReader();

  reader.onload = async function (e) {
    try {
      // GeoTIFF parsen
      const georaster = await parseGeoraster(e.target.result);

      // Sicherstellen, dass die Daten korrekt geladen wurden
      if (!georaster || !georaster.width || !georaster.height) {
        console.error("Ungültiges GeoTIFF");
        return;
      }

      // GeoRasterLayer erstellen
      const layer = new GeoRasterLayer({
        georaster,
        opacity: 0.7,
        resolution: 256 // Standardwert für bessere Darstellung
      });

      // Layer zur Leaflet-Karte hinzufügen
      layer.addTo(map);

      // Karte automatisch auf das GeoTIFF zoomen
      map.fitBounds(layer.getBounds());

      console.log("GeoTIFF erfolgreich geladen");

    } catch (error) {
      console.error("Fehler beim Laden des GeoTIFF:", error);
    }
  };

  reader.readAsArrayBuffer(file);
}
//------------------------------------------------


//------------------------------------------------
// Globale Variable für die Fehlermeldung Modal-Instanz
let errorModalInstance = null;

// Funktion zum Anzeigen einer Fehlermeldung
function showErrorModal(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;
  // Stelle sicher, dass die Modal-Instanz nur einmal erstellt wird
  if (!errorModalInstance) {
    const errorModalElement = document.getElementById("errorModal");
    errorModalInstance = new bootstrap.Modal(errorModalElement);
  }
  errorModalInstance.show();
}

// Funktion zur Validierung von Dateitypen
function validateFileType(file) {
  const validExtensions = [".geojson", ".kml", ".csv", ".gpx", ".tif"];

  // Wenn eine Shapefile-Komponenten über validateFileType ankommt, wird diese nicht blockiert.
  // sorgt dafür, dass Shapefile-Komponenten nicht fälschlicherweise als ungültig gewertet werden.
  if (file.name.endsWith(".shp") || file.name.endsWith(".shx") || file.name.endsWith(".prj") || file.name.endsWith(".dbf")) {
    return true;
  }

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
//------------------------------------------------------------------------
// NDVI-EasyButton Funktionen
//------------------------------------------------------------------------
//------------------------------------------------------------------------
const ndviButton = L.easyButton(
  `<img src="../images/NDVI.svg" alt="NDVI" style="width:20px;height:20px;">`,
  function () {
    console.log('NDVI button clicked!');
  }
).addTo(map);

// Tooltip hinzufügen
ndviButton.button.classList.add("ndvi-button");
ndviButton.button.setAttribute("title", "NDVI");
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