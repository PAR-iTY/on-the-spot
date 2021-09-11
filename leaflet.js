/**
 * Created by yawno on 25/11/2017.
 */

// being a dirty globalist...for now...
let mymap;

window.addEventListener('DOMContentLoaded', e => {
  // mapbox tiler and general map-click function.
  mymap = L.map('mapid').setView([-40.246051, 162.817383], 4);

  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoiajJ0aGVvaG5vIiwiYSI6ImNrbXR5Njg0cjB3ZWkycHBnNWxlMjE0MTkifQ.TEVsTYpsxtZD6rjLO4pXbw'
    }
  ).addTo(mymap);

  mymap.on('click', onMapClick);
});

const onMapClick = e => {
  var popup = L.popup({ maxHeight: 300 });

  document.getElementById('latitude').value = e.latlng.lat;
  document.getElementById('longitude').value = e.latlng.lng;

  popup
    .setLatLng(e.latlng)
    .setContent('You clicked the map at ' + e.latlng.toString())
    .openOn(mymap);
};
