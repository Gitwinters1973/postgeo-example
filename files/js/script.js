var map = new L.map('mapid').setView([1.364340, 103.808939], 12);
var popup = L.popup();
var marker;
var results;
var geodata;

var dayCareIcon = new L.icon({
    iconUrl: '/js/images/daycare.png',
    shadowUrl: '/js/images/marker-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
};

var dayCareIconOptions = {
    icon: dayCareIcon
}

/*
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(map);
*/	
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY3NpbmdldSIsImEiOiJjaW52Z3phdnYxNTl3dThrajBvcmk1dDJ4In0.Ynvps-s0Ii8HelIjofpLEw'
}).addTo(map);

function onMapClick(e) {
    if (marker) {
    	marker.setLatLng(e.latlng);
    } else {
    	marker = L.marker(e.latlng).addTo(map);
    };
	marker.bindPopup(e.latlng.lng+ ", " + e.latlng.lat).openPopup();
	// $.post('/findWith', e.latlng, function )
	getResults();
};

function getResults() {
    var param = {
	  lat: marker.getLatLng().lat,
	  lng: marker.getLatLng().lng,
	  distance: $("#distance").val()
	};
	
	$.post( "/findWithin", param, function (data) {
	   //alert(data);
	   geodata = data;
	   if (results) {
	       map.removeLayer(results);
	   };
	   results = L.geoJson(data, {
	        pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: onEachFeature
        });
        results.addTo(map);
        populateTable(data);
	});
};

function populateTable(data) {
    $('#results-tab tbody > tr').remove();
    var tb = $("#results-tab tbody");
 
    var f = data.features;
    for (var i = 0; i < f.length; i++) {
        // creates a table row
        var row = document.createElement("tr");
        var lat = f[i].geometry.coordinates[0];
        var lng = f[i].geometry.coordinates[1];
        var latlng = L.latLng(lng, lat);
        var zoom = 18;
        
        for (var j = 0; j < 3; j++) {
          // Create a <td> element and a text node, make the text
          // node the contents of the <td>, and put the <td> at
          // the end of the table row
          var cell = document.createElement("td");
          var cellText;
          if (j == 0) {
            cellText = document.createTextNode(i+1);    
          };
          if (j == 1) {
            cellText = document.createTextNode(f[i].properties.name);
          };
          if (j == 2) {
            cellText = document.createTextNode(f[i].properties.distance);
          };
          
          cell.appendChild(cellText);
          row.appendChild(cell);
          
        }
        // add the row to the end of the table body
        tb.append(row);
    };
};

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.distance) {
        layer.bindPopup(feature.properties.name + '\n' + feature.properties.distance + 'm away');
    }
};

map.on('click', onMapClick);