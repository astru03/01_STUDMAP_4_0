// create a variable for the map
var map = L.map('map', {
  zoomControl: false
}).setView([51.975, 7.61], 12);

// Zoom-Control manuell hinzufügen – oben rechts
L.control.zoom({
  position: 'topright'
}).addTo(map);

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

// Container-Klasse hinzufügen
layerButton._container.classList.add("layer-button-container");

// Dynamically Add Categories and Subcategories
const categories = {
  'UAS 2018': {
    name: 'UAS 2018',
    subcategories: {
      'Orthophotos & Multispektrale Daten': {
        layers: {
          'Orthophoto (RGB) 2018': 'UASarcgis:Orthophoto_RGB_2018',
          'Orthophoto (Multispectral) 2018': 'UASarcgis:Orthophoto_Multispectral_2018'
        }
      },
      'Vegetations- & Indexkarten': {
        layers: {
          'NDVI Index 2018': 'UASarcgis:NDVI Index 2018'
        }
      },
      'Höhen- & Oberflächenmodelle': {
        layers: {
          'Digital Surface Model (DSM) 2018': 'UASarcgis:Digital_Surface_Model_DSM_2018'
        }
      },
      'Landbedeckung & Flächeninformation': {
        layers: {
          'Land Cover 2018': 'UASarcgis:Land Cover 2018',
          'Study Area 2018': 'UASarcgis:Study Area 2018'
        }
      },
      'Flug- & Messdaten': {
        layers: {
          'Flight Path 40m 2018': 'UASarcgis:Flight Path 40m 2018',
          'Flight Points 40m 2018': 'UASarcgis:Flight Points 40m 2018'
        }
      },
      'Umweltdaten': {
        layers: {
          'Air Qualitiy PM10 2018': 'UASarcgis:Air Qualitiy PM10 2018',
          'LiDAR Stations 2018': 'UASarcgis:LiDAR Stations 2018'
        }
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
          'Geländestufen Metadaten': 'OpenNRW:nw_gelaendestufen_info'
        }
      },
      'Höhenlinien und Höhenpunkte': {
        layers: {
          'WMS_NW_HL_HP_SCHWARZ': 'OpenNRW:WMS_NW_HL_HP_SCHWARZ'
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

function getLayerLabel(layerName) {
  for (const catKey in categories) {
    const category = categories[catKey];
    for (const subKey in category.subcategories) {
      const layers = category.subcategories[subKey].layers;
      for (const label in layers) {
        if (layers[label] === layerName) {
          return label;
        }
      }
    }
  }
  return layerName; // fallback, falls nicht gefunden
}

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
            <input class="form-check-input layer-checkbox" type="checkbox" value="${subcategory.layers[layerKey]}" id="${layerKey}" data-category="${catKey}">
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

  const activeLayers = {}; // <== GLOBALE Variable ganz oben im Skript definieren

$('#applyFilters').on('click', function () {
  const selectedLayers = $('.layer-checkbox:checked').map(function () {
    return $(this).val();
  }).get();

  if (selectedLayers.length === 1 && selectedCategory) {
    const selectedLayer = selectedLayers[0];
    const selectedLayerCheckbox = $('.layer-checkbox:checked');
    selectedCategory = selectedLayerCheckbox.data('category') || selectedCategory;

    // Layer bereits geladen?
    if (activeLayers[selectedLayer]) {
      alert("Dieser Layer wurde bereits geladen.");
      return;
    }

    let geoserverBaseUrl;
    if (selectedCategory === 'OpenNRW') {
      geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/OpenNRW/ows";
    } else if (selectedCategory === 'UAS 2018') {
      geoserverBaseUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/UASarcgis/ows";
    } else {
      alert("Ungültige Kategorie gewählt.");
      return;
    }

    const wmsUrl = `${geoserverBaseUrl}?service=WMS&version=1.3.0&request=GetMap&layers=${selectedLayer}&styles=&format=image/png&transparent=true`;

    // WMS-Layer hinzufügen
    const wmsLayer = L.tileLayer.wms(geoserverBaseUrl, {
      layers: selectedLayer,
      format: 'image/png',
      transparent: true,
      attribution: "&copy; Geoserver"
    }).addTo(map);

    // DEBUG LOGS
console.log("Layer geladen:", selectedLayer);
console.log("Aktive Layeranzahl:", Object.keys(activeLayers).length);
console.log("Aktive Layer:", Object.keys(activeLayers));

    // Layer-Objekt speichern
    activeLayers[selectedLayer] = {
      layer: wmsLayer,
      visible: true,
      category: selectedCategory // <== hier wird die Quelle gespeichert
    };

    // Contentliste (Checkbox)
    $('#activeLayerList').append(`
      <div class="form-check d-flex align-items-center justify-content-between active-layer-entry" data-layer="${selectedLayer}">
        <div>
          <input class="form-check-input content-layer-toggle" type="checkbox" id="content-${selectedLayer}" checked data-layer="${selectedLayer}">
          <label class="form-check-label ms-1" for="content-${selectedLayer}">
            ${getLayerLabel(selectedLayer)}
          </label>
        </div>
        <button class="btn btn-sm btn-danger remove-layer-btn" data-layer="${selectedLayer}" title="Layer entfernen">&times;</button>
      </div>
    `);


    // Layer aus Auswahl entfernen (visuell)
    $(`.layer-checkbox[value="${selectedLayer}"]`).closest('.form-check').remove();

    // WMS-Info anzeigen
    $('#wmsUrlInput').val(wmsUrl);
    $('#wmsLayerName').text(selectedLayer);

    const getCapabilitiesUrl = `http://localhost:3000/proxy?url=${encodeURIComponent("http://zdm-studmap.uni-muenster.de:8080/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities")}`;

    $('#loadingCircle').show();

    $.ajax({
      url: getCapabilitiesUrl,
      dataType: 'xml',
      success: function (xml) {
        const layerElement = $(xml).find('Layer > Layer > Name').filter(function () {
          return $(this).text() === selectedLayer;
        }).closest('Layer');

        if (layerElement.length === 0) {
          console.error("Layer nicht gefunden in GetCapabilities.");
          alert("Layer nicht gefunden in GetCapabilities.");
          return;
        }

        let bbox;
        const bboxElement = layerElement.find('BoundingBox[CRS="EPSG:4326"], BoundingBox[CRS="CRS:84"]').first();
        if (bboxElement.length > 0) {
          bbox = [
            [parseFloat(bboxElement.attr('miny')), parseFloat(bboxElement.attr('minx'))],
            [parseFloat(bboxElement.attr('maxy')), parseFloat(bboxElement.attr('maxx'))]
          ];
        } else {
          const anyBbox = layerElement.find('BoundingBox').first();
          if (anyBbox.length > 0) {
            bbox = [
              [parseFloat(anyBbox.attr('miny')), parseFloat(anyBbox.attr('minx'))],
              [parseFloat(anyBbox.attr('maxy')), parseFloat(anyBbox.attr('maxx'))]
            ];
          }
        }

        if (bbox && selectedCategory === 'UAS 2018') {
          map.fitBounds(bbox);
        }

        if (selectedLayer === 'OpenNRW:WMS_NW_VK250') {
        const muensterBounds = [
          [51.8, 7.4],
          [52.1, 7.8]
        ];
        map.fitBounds(muensterBounds);
      }

        const abstractText = layerElement.children('Abstract').first().text() || "Keine Beschreibung verfügbar.";
        $('#wmsAbstract').text(abstractText);

        const crsList = layerElement.find('CRS').map(function () {
          return $(this).text();
        }).get();

        $('#wmsCrs').text(crsList.join(", "));
        $('#loadingCircle').hide();
        $('#wmsInfoModal').modal('show');
      },
      error: function (xhr, status, error) {
        console.error("Fehler bei der CRS-Abfrage:", status, error);
        alert("Fehler beim Abrufen der GetCapabilities: " + error);
        $('#loadingCircle').hide();
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

  $(document).on('change', '.layer-checkbox', function () {
    if (this.checked) {
      $('.layer-checkbox').not(this).prop('checked', false);
    }
  });

  // Sichtbarkeit über Contentliste (Checkbox) steuern
$(document).on('change', '.content-layer-toggle', function () {
  const layerName = $(this).data('layer');
  const isChecked = $(this).is(':checked');

  if (activeLayers[layerName]) {
    if (isChecked) {
      map.addLayer(activeLayers[layerName].layer);
      activeLayers[layerName].visible = true;
    } else {
      map.removeLayer(activeLayers[layerName].layer);
      activeLayers[layerName].visible = false;
    }
  }
});

// Layer komplett entfernen
$(document).on('click', '.remove-layer-btn', function () {
  const layerName = $(this).data('layer');

  if (activeLayers[layerName]) {
  // 👉 Kategorie und Layer-Metadaten sichern, bevor sie gelöscht werden
  const originalCategory = activeLayers[layerName].category;

  // Von der Karte entfernen
  map.removeLayer(activeLayers[layerName].layer);

  // Aus activeLayers entfernen
  delete activeLayers[layerName];

  // Aus der aktiven Liste entfernen
  $(this).closest('.active-layer-entry').remove();

  // Layer wieder zur Auswahl-Liste hinzufügen
  const matchingLabel = Object.entries(categories[originalCategory].subcategories).flatMap(([subKey, sub]) =>
    Object.entries(sub.layers).map(([label, name]) => ({ label, name, subKey }))
  ).find(layer => layer.name === layerName);

  if (matchingLabel) {
      const subcategories = $(`.category-button[data-category="${originalCategory}"]`).siblings('.subcategories');
      subcategories.slideDown(); // Subkategorie sichtbar machen (nur wenn notwendig)

      const subLayerContainer = subcategories
        .find('.subcategory-section')
        .filter((i, el) => $(el).find('button').text() === matchingLabel.subKey)
        .find('.layers');

          const newLayerCheckbox = $(`
        <div class="form-check">
          <input class="form-check-input layer-checkbox" type="checkbox" value="${matchingLabel.name}" id="${matchingLabel.label}" data-category="${originalCategory}">
          <label class="form-check-label" for="${matchingLabel.label}">
            ${matchingLabel.label}
          </label>
        </div>
      `);

      subLayerContainer.append(newLayerCheckbox);
  }
}
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

// Container-Klasse hinzufügen
uploadButton._container.classList.add("upload-button-container");

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
// Funktion zum Verarbeiten von CSV mit Punkten, Linien & Polygonen (FERTIG)
function handleCSV(file) {
  const reader = new FileReader(); // Erstellen eines FileReader-Objekts, um die Datei zu lesen

  reader.onload = function (e) {
    const lines = e.target.result.split('\n'); // CSV-Datei in Zeilen aufteilen
    const header = splitCSVLine(lines[0]); // Erste Zeile (Header) mit der splitCSVLine-Funktion in Spalten aufteilen

    // Indizes der verschiedenen Spalten anhand des Headers selektieren
    const nameIndex = header.indexOf('name');
    const latIndex = header.indexOf('lat');
    const lonIndex = header.indexOf('lon');
    const geomIndex = header.indexOf('geometry');

    // Überprüfen, ob alle erforderlichen Spalten vorhanden sind
    if (nameIndex === -1 || latIndex === -1 || lonIndex === -1 || geomIndex === -1) {
      showErrorModal('Die CSV-Datei muss die Spalten "name", "geometry", "lat" und "lon" enthalten.');
      return;
    }

    const features = []; // Array, um die gezeichneten Features (Marker, Polylinien, Polygone) zu speichern

    for (let i = 1; i < lines.length; i++) {  // Durchlauf jeder Zeile der CSV-Datei. Beginn ab der zweiten Zeile
      let line = lines[i];
      if (!line.trim()) continue; // Überspringe leere Zeilen

      const values = splitCSVLine(line); // Teile die Zeile in Spalten auf mit der splitCSVLine-Funktion

      // Extrahiere die Werte für "name", "lat", "lon" und "geometry" aus der Zeile
      const name = values[nameIndex] || "Unbenannt"; // Wenn "name" fehlt, setze es auf "Unbenannt"
      const lat = values[latIndex] ? parseFloat(values[latIndex]) : NaN; // "lat" als Zahl zu parsen
      const lon = values[lonIndex] ? parseFloat(values[lonIndex]) : NaN; // "lon" als Zahl zu parsen
      const geometry = values[geomIndex] ? values[geomIndex].trim() : ""; // Extrahiere "geometry" und entferne unnötige Leerzeichen


      if (!isNaN(lat) && !isNaN(lon) && geometry === "") { // Wenn lat und lon vorhanden sind, aber geometry leer ist, füge einen Marker hinzu
        features.push(L.marker([lat, lon]).bindPopup(name)); // Marker mit Popup hinzufügen
      } else if (geometry.startsWith("LINESTRING")) { // Wenn geometry ein "LINESTRING" ist, erstelle eine Polyline
        const coords = parseWKT(geometry); // Parse die Koordinaten aus dem WKT (Well-Known Text) Format
        features.push(L.polyline(coords, { color: 'blue' }).bindPopup(name)); // Polyline mit Popup hinzufügen
      } else if (geometry.startsWith("POLYGON")) { // Wenn geometry ein "POLYGON" ist, erstelle ein Polygon
        const coords = parseWKT(geometry); // Parse die Koordinaten aus dem WKT
        features.push(L.polygon(coords, { color: 'green' }).bindPopup(name)); // Polygon mit Popup hinzufügen
      } else {
        // Wenn keine gültige Geometrie gefunden wird, überspringe die Zeile
        console.warn(`Skipping invalid line ${i}: ${line}`);
      }
    }

    // Wenn Features hinzugefügt wurden, füge sie der Karte hinzu
    if (features.length > 0) {
      L.featureGroup(features).addTo(map); // Alle Features (Marker, Polylinien, Polygone) zur Karte hinzufügen
    } else {
      showErrorModal('Es wurden keine gültigen Geometrien in der CSV-Datei gefunden.');
    }
  };
  reader.readAsText(file);
}

// CSV-Zusatzfunktion: Funktion zum Parsen von WKT (Well-Known Text)
function parseWKT(wkt) {
  return wkt.match(/[-+]?\d*\.\d+ [-+]?\d+\.\d+/g).map(coord => {
    const [lon, lat] = coord.split(' ').map(Number); // WKT hat Koordinaten als "lon lat", Leaflet erwartet "lat, lon"
    return [lat, lon]; // Rückgabe in Leaflet-kompatible Reihenfolge [lat, lon]
  });
}
// CSV-Zusatzfunktion: Funktion zum sicheren Parsen einer CSV-Zeile
function splitCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  // Gehe jedes Zeichen der Zeile durch und überprüfe, ob es sich um ein Komma handelt, das nicht in Anführungszeichen steht
  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    // Umschalten des inQuotes-Flags, wenn ein Anführungszeichen gefunden wird
    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      // Wenn ein Komma gefunden wird und wir nicht in Anführungszeichen sind, teile die Zeile
    } else if (char === "," && !inQuotes) {
      values.push(current.trim()); // Füge den aktuellen Wert hinzu
      current = ""; // Setze den aktuellen Wert zurück
    } else {
      current += char; // Ansonsten füge das Zeichen zum aktuellen Wert hinzu
    }
  }
  values.push(current.trim()); // Letztes Element hinzufügen
  // Falls weniger als 4 Spalten, ergänze leere Strings
  while (values.length < 4) {
    values.push("");
  }
  return values;
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
  document.getElementById('loadingCircle').style.display = 'block';
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
        opacity: 1.0,
        resolution: 256 // Standardwert für bessere Darstellung
      });

      // Layer zur Leaflet-Karte hinzufügen
      layer.addTo(map);

      // Karte automatisch auf das GeoTIFF zoomen
      map.fitBounds(layer.getBounds());

      console.log("GeoTIFF erfolgreich geladen");

    } catch (error) {
      console.error("Fehler beim Laden des GeoTIFF:", error);
    } finally {
      document.getElementById('loadingCircle').style.display = 'none';
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
// Layer-Metadaten: BoundingBox und EPSG für beide Layer
const layerMeta = {
  "Sentinel2_NDVI:Sentinel2 Muenster": {
    bbox: [400000, 5753000, 410500, 5762000], // [minX, minY, maxX, maxY]
    epsg: "32632"
  },
  "Sentinel2_NDVI:Sentinel2 Norderney": {
    bbox: [773000, 5957000, 787000, 5962500], // Beispielwerte, bitte ggf. anpassen!
    epsg: "32631"
  }
};

const ndviButton = L.easyButton(
  `<img src="../images/NDVI.svg" alt="NDVI" style="width:20px;height:20px;">`,
  function () {
    const ndviModal = new bootstrap.Modal(document.getElementById('ndviModal'));
    ndviModal.show();
  }
).addTo(map);

ndviButton.button.classList.add("ndvi-button");
ndviButton.button.setAttribute("title", "Select Layer for processing NDVI");
ndviButton._container.classList.add("ndvi-button-container");

// NDVI-Layer auf Karte anzeigen
let ndviLayerOnMap = null;

document.getElementById("ndviModalStart").onclick = function () {
  const layerName = document.getElementById("ndviLayerSelect").value;
  const modalInstance = bootstrap.Modal.getInstance(document.getElementById('ndviModal'));
  if (modalInstance) modalInstance.hide();
  runNdviWpsProcess(layerName);
};

// Hilfsfunktion für XML-URL-Escaping
function escapeXmlUrl(url) {
  return url.replace(/&/g, '&amp;');
}

function runNdviWpsProcess(layerName) {
  //**********WICHTIG FÜR SERVER ANPASSEN***********
  const geoserverWpsUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/Sentinel2_NDVI/wps";
  const wpsUrl = "http://localhost:3000/proxy?url=" + encodeURIComponent(geoserverWpsUrl);
  //const geoserverWpsUrl = "http://zdm-studmap.uni-muenster.de:8080/geoserver/Sentinel2_NDVI/wps";
  //const wpsUrl = "/proxy?url=" + encodeURIComponent(geoserverWpsUrl);

  // Layername für URL und XML korrekt encodieren
  const meta = layerMeta[layerName];
  const [minX, minY, maxX, maxY] = meta.bbox;
  const epsg = meta.epsg;

  const wcsUrlRaw = `http://zdm-studmap.uni-muenster.de:8080/geoserver/Sentinel2_NDVI/ows?` +
    `service=WCS&version=2.0.0&request=GetCoverage&coverageId=${encodeURIComponent(layerName)}` +
    `&format=image/tiff&subset=E(${minX},${maxX})&subset=N(${minY},${maxY})&outputCRS=EPSG:4326`;

  const wcsUrl = escapeXmlUrl(wcsUrlRaw);

  const jiffleScript = "nir = src[7]; red = src[3]; dest = (nir - red) / (nir + red);";

  const xml = `
    <wps:Execute service="WPS" version="1.0.0"
        xmlns:wps="http://www.opengis.net/wps/1.0.0"
        xmlns:ows="http://www.opengis.net/ows/1.1"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wps/1.0.0
        http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
      <ows:Identifier>ras:Jiffle</ows:Identifier>
      <wps:DataInputs>
        <wps:Input>
          <ows:Identifier>coverage</ows:Identifier>
          <wps:Reference xlink:href="${wcsUrl}" method="GET"/>
        </wps:Input>
        <wps:Input>
          <ows:Identifier>script</ows:Identifier>
          <wps:Data>
            <wps:LiteralData>${jiffleScript}</wps:LiteralData>
          </wps:Data>
        </wps:Input>
      </wps:DataInputs>
      <wps:ResponseForm>
        <wps:RawDataOutput mimeType="image/tiff">
          <ows:Identifier>result</ows:Identifier>
        </wps:RawDataOutput>
      </wps:ResponseForm>
    </wps:Execute>
  `;

  // Ladeindikator anzeigen, falls vorhanden
  if (typeof $('#loadingCircle').show === 'function') {
    $('#loadingCircle').show();
  }
  console.log("WPS XML Request:", xml);

  fetch(wpsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml
  })
    .then(response => {
      if (!response.ok) throw new Error("WPS-Fehler: " + response.statusText);
      return response.blob();
    })
    .then(blob => {
      if (typeof $('#loadingCircle').hide === 'function') {
        $('#loadingCircle').hide();
      }
      // Download-Link erzeugen (optional)
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'ndvi_result.tif';
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Anzeige auf Leaflet
      const reader = new FileReader();
      reader.onload = function () {
        parseGeoraster(reader.result).then(georaster => {
          console.log("GeoRaster geladen:", georaster);

          if (!georaster || !georaster.width || !georaster.height) {
            alert("GeoTIFF konnte nicht geladen werden.");
            return;
          }

          // Min und Max aus den Werten ermitteln
          let min = Infinity;
          let max = -Infinity;

          const values = georaster.values[0]; // NDVI-Band (1. Band)
          for (let y = 0; y < values.length; y++) {
            for (let x = 0; x < values[y].length; x++) {
              const val = values[y][x];
              if (val === null || isNaN(val)) continue;
              if (val < min) min = val;
              if (val > max) max = val;
            }
          }

          console.log("NDVI Min:", min);
          console.log("NDVI Max:", max);
          
          // Vorherigen Layer entfernen
          if (ndviLayerOnMap) {
            map.removeLayer(ndviLayerOnMap);
          }

          ndviLayerOnMap = new GeoRasterLayer({
            georaster: georaster,
            opacity: 1.0,
            resolution: 256,
            pixelValuesToColorFn: values => {
              const ndvi = values[0];
              if (ndvi === null || isNaN(ndvi)) return null;

              const norm = (ndvi - min) / (max - min);
              const gray = Math.round(norm * 255);
              const hex = `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
              return hex;
            }
          });

          ndviLayerOnMap.addTo(map);

          const bounds = ndviLayerOnMap.getBounds();
          console.log("NDVI Layer Bounds:", bounds);
          map.fitBounds(bounds);
        }).catch(err => {
          console.error("Fehler beim Parsen des GeoTIFFs:", err);
          alert("Fehler beim Parsen des GeoTIFFs.");
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(err => {
      if (typeof $('#loadingCircle').hide === 'function') {
        $('#loadingCircle').hide();
      }
      console.error(err);
      alert("Fehler beim NDVI-Prozess: " + err);
    });
}


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
      $('.layer-button-container').css('cssText', 'top: 220px !important;');
      $('.upload-button-container').css('cssText', 'top: 260px !important;');
      $('.ndvi-button-container').css('cssText', 'top: 300px !important;');
    } else {
      console.log('Navbar collapsed or larger screen size.');
      $('.leaflet-control-zoom').css('cssText', 'top: 70px !important;');
      $('.layer-button-container').css('cssText', 'top: 70px !important;');
      $('.upload-button-container').css('cssText', 'top: 110px !important;');
      $('.ndvi-button-container').css('cssText', 'top: 150px !important;');
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