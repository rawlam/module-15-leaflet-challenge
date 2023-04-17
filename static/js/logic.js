// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Adding the tile layer
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

// Creating the map object
var myMap = L.map("map", {
  center: [
    25, -25
  ],  
  zoom: 2,
  layers: [streets]
});

var overlayMaps = {
  earthquakes: 
};

// adding control layer
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// #####################################################################

// read earthquake data
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  // createFeatures(data.features);
  console.log(data)

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
        // red
        return "#FF0000";
      case depth > 50: 
        // green
        return "#00FF00";
      case depth > 10: 
        // blue
        return "#0000FF";
      default :
        // black
        return "#000000"; 
    }
  }

  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng);
    }, 
    style: style,
    // #################################
    onEachFeature: function (feature, layer) {
      // does this feature have a property named popupContent?
      layer.bindPopup(
        "<b>Location: </b>" + feature.properties.place
        + "<br><b>Magnitude: </b>" + (Math.round((feature.properties.mag + Number.EPSILON)* 100) / 100)
        + "<br><b>Depth: </b>" + (Math.round((feature.geometry.coordinates[2] + Number.EPSILON) * 100) / 100)
        + "<br><b>id: </b>" + feature.id
      );
    }
  }).addTo(myMap);
  
});


// legend
var info = L.control({
  position: "bottomright"
});

// update legend count
var earthquakeCount = {
  earthquake1: 0,
  earthquake2: 0,
  earthquake3: 0
};

// combine TWO SETS OF DATA into one variable list
var station = Object.assign({}, stationInfo[i], stationStatus[i]);

//   // Store the API query variables.
//   // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
//   // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
//   var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
//   // Assemble the API query URL.
//   var url = baseURL;
  
//   // Get the data with d3.
//   d3.json(url).then(function(response) {
//     console.log(response)
//     console.log(response.features[0])
//     console.log(response.features[0].geometry.coordinates)

  
//     var earthquakes = L.geoJSON(earthquakeData, {
//         onEachFeature: onEachFeature
//       });
  
//     // Loop through the data.
//     for (var i = 0; i < response.length; i++) {
  
//       // Set the data location property to a variable.
//       var location = response.features[i].geometry;
//       var properties = response.features[i].properties
  
//       // Check for the location property.
//       if (location) {
  
//         // Add a new marker to the cluster group, and bind a popup.
//         markers.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
//           .bindPopup(properties.title));
//       }
  
//     }
  
//     // Add our marker cluster layer to the map.
//     myMap.addLayer(markers);
  
//   });
  