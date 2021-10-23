/**
 * Created by yawno on 25/11/2017.
 */

// being a dirty globalist...for now...
let mymap, lat, lng;

window.addEventListener('DOMContentLoaded', async () => {
  lat = document.getElementById('latitude');
  lng = document.getElementById('longitude');

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

  const spots = await fetchJSON('./assets/data/spots.geojson');

  console.log(spots);

  // Coordinates in GeoJSON: [longitude, latitude]
  // Coordinates in Leaflet: [latitude, longitude]
  L.geoJSON(spots).addTo(mymap);

  mymap.on('click', onMapClick);
});

const onMapClick = e => {
  var popup = L.popup({ maxHeight: 300 });

  // lat, lng are global refs to input elements

  // will activate a mutation observer
  // observer runs parseCoord for us
  lat.setAttribute('value', e.latlng.lat);
  lng.setAttribute('value', e.latlng.lng);

  popup
    .setLatLng(e.latlng)
    .setContent('You clicked the map at ' + e.latlng.toString())
    .openOn(mymap);
};

const fetchJSON = async url => {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
    return;
  }
};

// will not trigger an input event (because programmatic)
// will not trigger a mutation observer (because not an attribute)
// lat.value = e.latlng.lat;
// lng.value = e.latlng.lng;
// trigger event to parse coord from main.js function call
// lat.dispatchEvent(new Event('input'));
// lng.dispatchEvent(new Event('input'));

// const myStyle = {
//   color: '#ff7800',
//   weight: 5,
//   opacity: 0.65
// };

// function onEachFeature(feature, layer) {
//   layer.bindPopup(feature.properties.name);
// }

// create your custom icon
// var myIcon = L.icon({
//   iconUrl:
//     'https://banner2.cleanpng.com/20180423/igw/kisspng-park-merlo-weston-location-citizens-telephone-corp-local-5ade0004ebd0a9.1830609215244984369659.jpg',
//   iconSize: [32, 37],
//   iconAnchor: [16, 37],
//   popupAnchor: [0, -28]
// });

// function addMarker(feature, latlng) {
//   return L.marker(latlng, { icon: myIcon });
// }

// var geojsonMarkerOptions = {
//   radius: 8,
//   fillColor: '#ff7800',
//   color: '#000',
//   weight: 1,
//   opacity: 1,
//   fillOpacity: 0.8
// };

// const pointToLayerCircleMarker = (feature, latlng) =>
//   L.circleMarker(latlng, geojsonMarkerOptions);

// style: myStyle,
// onEachFeature: onEachFeature,
// pointToLayer: addMarker
// const config = {
//   pointToLayer: pointToLayerCircleMarker
// };
