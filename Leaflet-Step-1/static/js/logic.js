// Store our API endpoint inside queryUrl - this is 'All Earthquakes from the Past 7 Days'
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// The circles were too small so I had to multiply by a large number so that they could be more visible on the map
function circleRadius(magnitude) {
  return magnitude * 10000;
}

function circleColor(magnitude) {
  if (magnitude <= 1) {
      return "#FFFF00";
  } else if (magnitude <= 2) {
      return "#FFA500";
  } else if (magnitude <= 3) {
      return "#FF8C00";
  } else if (magnitude <= 4) {
      return "#FF4500";
  } else if (magnitude <= 5) {
      return "#FF0000";
  } else {
      return "#8B0000";
  };
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  var earthquakes = L.geoJSON(earthquakeData, {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
   onEachFeature : function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
      },
      pointToLayer: function (feature, latitudeLongitude) {
        return new L.circle(latitudeLongitude, {
          radius: circleRadius(feature.properties.mag),
          fillColor: circleColor(feature.properties.mag),
          fillOpacity: 1,
          stroke: false
      })
    }
  });
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

  // Define lightmap layer
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXdhcmRlaCIsImEiOiJja2FkNGZ0OGgyMGtqMnlwbThnNXR3bWNpIn0.uFK4y-WgrYAmarpTNRzedg", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'), magnitudes = [0, 1, 2, 3, 4, 5], labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML += '<i style="background:' + circleColor(magnitudes[i] + 1) + '"></i> ' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(map);

};