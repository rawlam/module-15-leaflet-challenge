// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Adding the tile layers
var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// create base map
var baseMaps = {
  "Street Map": streets,
  "Topographic Map": topo
};

// Initialize all the LayerGroups that we'll use.
var layers = {
  EQ_M_LARGE: new L.LayerGroup(),
  EQ_M_MEDIUM: new L.LayerGroup(),
  EQ_M_SMALL: new L.LayerGroup()
};

// Creating the map object
var myMap = L.map("map", {
  center: [
    25, -25
  ],  
  zoom: 2,
  layers: [
    streets,
    layers.EQ_M_LARGE,
    layers.EQ_M_MEDIUM,
    layers.EQ_M_SMALL
  ]
});

// Create an overlays object to add to the layer control.
var overlays = {
  "M 4.5 +": layers.EQ_M_LARGE,
  "M 2.5 +": layers.EQ_M_MEDIUM,
  "M 1.0 +": layers.EQ_M_SMALL
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(myMap);

// Create a legend to display information about our map.
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map.
info.addTo(myMap);

// Perform an API call to the Earthquakes Hazard Program endpoint.
d3.json(queryUrl).then(function (data) {

  var updatedAt = data.metadata.generated;
  var earthquakeInfo = data.features;


  // create function for style info
  function style(feature){
    return {
      radius: getRadius(feature.properties.mag),
      opacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#ffffff",
      weight: 0.7
    }
  };

  // create radius function
  function getRadius(magnitude){
    if (magnitude === 0){
      return 1;
    }
    return magnitude * 5
  }

  // make function for fill color
  function getColor(depth){
    switch (true){
      case depth > 100: 
        // black
        return "#000000";
      case depth > 50: 
        // dark red
        return "#b30000";
      case depth > 10: 
        // red
        return "#FF0000";
      default :
        // orange
        return "#ff8000"; 
    }
  }

  // Create varying magnitude lists
  var large = []
  var medium = []
  var small = []

  // loop though data
  for (var i = 0; i < earthquakeInfo.length; i++) {
    // Append to large list
    if (earthquakeInfo[i].properties.mag >= 4.5) {
      large.push(earthquakeInfo[i]);
    }
    // Append to medium list
    else if (earthquakeInfo[i].properties.mag >= 2.5) {
      medium.push(earthquakeInfo[i]);
    }
    // Otherwise, append to small list earthquake is small.
    else {
      small.push(earthquakeInfo[i]);
    }
  }
  
  // link large earthquake date to EQ_M_LARGE layer
  L.geoJson(large, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng);
    }, 
    style: style,
    // go through each record
    onEachFeature: function (feature, layer) {
      // create pop ups for each data point
      layer.bindPopup(
        "<b>Location: </b>" + feature.properties.place
        + "<br><b>Magnitude: </b>" + (Math.round((feature.properties.mag + Number.EPSILON)* 100) / 100)
        + "<br><b>Depth: </b>" + (Math.round((feature.geometry.coordinates[2] + Number.EPSILON) * 100) / 100)
        + "<br><b>id: </b>" + feature.id
      );
    }
  }).addTo(layers.EQ_M_LARGE);

  // link medium earthquake date to EQ_M_MEDIUM layer
  L.geoJson(medium, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng);
    }, 
    style: style,
    // go through each record
    onEachFeature: function (feature, layer) {
      // create pop ups for each data point
      layer.bindPopup(
        "<b>Location: </b>" + feature.properties.place
        + "<br><b>Magnitude: </b>" + (Math.round((feature.properties.mag + Number.EPSILON)* 100) / 100)
        + "<br><b>Depth: </b>" + (Math.round((feature.geometry.coordinates[2] + Number.EPSILON) * 100) / 100)
        + "<br><b>id: </b>" + feature.id
      );
    }
  }).addTo(layers.EQ_M_MEDIUM);

  // link small earthquake date to EQ_M_SMALL layer
  L.geoJson(small, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng);
    }, 
    style: style,
    // go through each record
    onEachFeature: function (feature, layer) {
      // create pop ups for each data point
      layer.bindPopup(
        "<b>Location: </b>" + feature.properties.place
        + "<br><b>Magnitude: </b>" + (Math.round((feature.properties.mag + Number.EPSILON)* 100) / 100)
        + "<br><b>Depth: </b>" + (Math.round((feature.geometry.coordinates[2] + Number.EPSILON) * 100) / 100)
        + "<br><b>id: </b>" + feature.id
      );
    }
  }).addTo(layers.EQ_M_SMALL);

  // Create an object to keep the number of markers in each layer.
  var EQCount = {
    EQ_M_SMALL: 0,
    EQ_M_MEDIUM: 0,
    EQ_M_LARGE: 0
  };

  // Initialize EQCode
  var EQCode;

  // Loop through the earthquakes
  for (var i = 0; i < earthquakeInfo.length; i++) {

    // Create a new earthquake object.
    var earthquake = earthquakeInfo[i];

    // Set EQCode to EQ_M_LARGE
    if (earthquake.properties.mag >= 4.5) {
      EQCode = "EQ_M_LARGE";
    }
    // Set EQCode to EQ_M_MEDIUM
    else if (earthquake.properties.mag >= 2.5) {
      EQCode = "EQ_M_MEDIUM";
    }
    // Otherwise, the earthquake is EQ_M_SMALL.
    else {
      EQCode = "EQ_M_SMALL";
    }

    // Update the earthquake count.
    EQCount[EQCode]++;
  }

  // Call the updateLegend function, which will update the legend
  updateLegend(updatedAt, EQCount);
});

// Update the legend's innerHTML with the last updated time and earthquake count.
function updateLegend(time, EQCount) {
  document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='eq-large'>M4.5+: " + EQCount.EQ_M_LARGE + "</p>",
    "<p class='eq-medium'>M2.5+: " + EQCount.EQ_M_MEDIUM + "</p>",
    "<p class='eq-small'>M1.0+: " + EQCount.EQ_M_SMALL + "</p>",
  ].join("");
}
