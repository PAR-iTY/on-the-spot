﻿/**
 * Created by yawno on 25/11/2017.
 */

// originally created in 2017 when learning web development
// this code bears no resemblance to the original only spirit

// ideas: add more leaflet layers/detail or use cesium or google
// could use folium python lib to to data processing with python &
// generate a more configured and detailed leaflet map html output

// globals
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

  // apparently, localhost can resolve relative paths from modules/
  // so the path needs to back ../ to get to assets/

  // github pages resolves that to par-ity.github.io/assets/data/spots.geojson
  // ie it misses /on-the-spot/

  // luckily localhost and servers can make sense of resolving from root
  // const spots_file =
  //   (['localhost', '127.0.0.1', ''].includes(window.location.hostname)
  //     ? '../'
  //     : './') + 'assets/data/spots.geojson';

  // console.log('spots_file:', spots_file);

  const spots = await fetchJSON('./data/spots.geojson');

  // console.log(spots);

  if (spots) {
    // Coordinates in GeoJSON: [longitude, latitude] --> using this one
    // Coordinates in Leaflet: [latitude, longitude]

    // const myStyle = { backgroundColor: 'rgb(31, 41, 55)' };
    // pointToLayer: addMarker
    // pointToLayer: pointToLayerCircleMarker
    // style: myStyle,
    const config = {
      onEachFeature: onEachFeature
    };

    L.geoJSON(spots, config).addTo(mymap);
  }

  mymap.on('click', onMapClick);
});

// bind geojson data features to popups
const onEachFeature = (feature, layer) => {
  // write an extraction of data into a html struct (grid?)
  // use tailwind styling

  // https://stackoverflow.com/questions/387942/google-street-view-url

  // layer= Activates overlays. Current options are "t" traffic, "c" street view. Append (e.g. layer=tc) for simultaneous.

  const streetView = `http://maps.google.com/maps?q=&layer=c&cbll=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;

  let html = `<div>
  <p>${feature.properties.name}</p>
  <a href="${streetView}" target="_blank">Open in Google Street View</a>
  </div>`;

  if (feature.properties.picture) {
    // use picture value to fetch image
    html += `<img src="./data/img/${feature.properties.picture}" alt="a picture of ${feature.properties.name}">`;
  }

  if (feature.properties.city) {
    html += `<p>${feature.properties.city}</p>`;
  }

  const options = {
    className: 'bg-gray-800 rounded font-mono border-2 border-pink-600'
  };

  layer.bindPopup(html, options);
};

const onMapClick = e => {
  var popup = L.popup({
    maxHeight: 300,
    className: 'bg-gray-800 rounded font-mono border-2 border-pink-600'
  });

  const streetView = `http://maps.google.com/maps?q=&layer=c&cbll=${e.latlng.lat},${e.latlng.lng}`;

  let content = `<p>You clicked the map at ${e.latlng.toString()}</p><a href="${streetView}" target="_blank">Open in Google Street View</a>`;

  // lat, lng are global refs to input elements

  // will activate a mutation observer
  // observer runs parseCoord for us
  lat.setAttribute('value', e.latlng.lat);
  lng.setAttribute('value', e.latlng.lng);

  popup.setLatLng(e.latlng).setContent(content).openOn(mymap);
};

// handles error and returns json obj or false
// this is bad error handling for a few reasons:
// it denies the caller the chance to catch errors
// it has two possible return types
// it seems to still require awaiting when called? (this one is confusing)
const fetchJSON = async url => {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// will not trigger an input event (because programmatic)
// will not trigger a mutation observer (because not an attribute)
// lat.value = e.latlng.lat;
// lng.value = e.latlng.lng;
// trigger event to parse coord from main.js function call
// lat.dispatchEvent(new Event('input'));
// lng.dispatchEvent(new Event('input'));

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

// const myStyle = {
//   color: '#ff7800',
//   weight: 5,
//   opacity: 0.65
// };

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
