// Creating the map object
var myMap = L.map("map", {
    center: [39.592804810941, -100.7810524794416],
    zoom: 5
  });

  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // Store the API query variables.
  // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
  // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
  var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  // Assemble the API query URL.
  var url = baseURL;
  
  // Get the data with d3.
  d3.json(url).then(function(response) {
    console.log(response)
    console.log(response.features[0])
    console.log(response.features[0].geometry.coordinates)

  
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
      });
  
    // Loop through the data.
    for (var i = 0; i < response.length; i++) {
  
      // Set the data location property to a variable.
      var location = response.features[i].geometry;
      var properties = response.features[i].properties
  
      // Check for the location property.
      if (location) {
  
        // Add a new marker to the cluster group, and bind a popup.
        markers.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
          .bindPopup(properties.title));
      }
  
    }
  
    // Add our marker cluster layer to the map.
    myMap.addLayer(markers);
  
  });
  