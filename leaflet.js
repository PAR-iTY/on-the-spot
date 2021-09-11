/**
 * Created by yawno on 25/11/2017.
 */

// being a dirty globalist...for now...
let mymap;

window.addEventListener('DOMContentLoaded', e => {
  // mapbox tiler and general map-click function
  // need to make the default coord + zoom value more responsive...
  // mobile needs portrait shot of all of NZ
  // landscape screens need shot of all of NZ plus some of AU
  mymap = L.map('mapid').setView([-41.789741, 172.424886], 6);

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

  // use prepended '+' to do some bit-magic (drops zero's and forces float type)
  document.getElementById('latitude').value = +e.latlng.lat.toFixed(6);
  document.getElementById('longitude').value = +e.latlng.lng.toFixed(6);

  popup
    .setLatLng(e.latlng)
    .setContent('You clicked the map at ' + e.latlng.toString())
    .openOn(mymap);
};
