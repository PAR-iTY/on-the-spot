import { observer } from './utils.js';

// global reader object (shared between all functions atm)
const reader = new FileReader();

const handleImg = e => {
  // one image per spot for now
  const file = e.target.files[0];

  if (file) {
    // sanity check file size due to base64 encoding
    if (file.size > 2097152) {
      console.error('file size must be under 2 megabytes');

      alert('file size must be under 2 megabytes');
      return;
    }
    try {
      // pretty sure this is async -> wait for reader load event to fire
      // alternatives: reader.readAsBinaryString(file); or ArrayBuffer...
      reader.readAsBinaryString(file);
      // reader.readAsDataURL(file);
    } catch (error) {
      console.error('[file error]:', error);
      return;
    }
  } else {
    console.error('[no file error]:', file);
    return;
  }
};

const handleReader = () => {
  if (reader.result) {
    console.log('binary string:', reader.result.substring(0, 32));

    // console.log('got a base64 result', reader.result.substring(0, 18));
    // const preview = document.querySelector('img.img-preview');

    // preview.src = reader.result;

    // preview.style.display = 'inline-block';

    // add this to hidden textarea element
    document.getElementById('hidden-base64').value = reader.result;
  } else {
    console.error(
      '[reader.result error]:',
      reader.result.toString().substring(0, 32)
    );
    return;
  }
};

// handles coord by calling utils.js functions
const handleCoord = e => {
  // console.log('[input event --> handleCoord]', e.target.value);

  // trigger mutation oberver to run parseCoord
  e.target.setAttribute('value', e.target.value);
};

window.addEventListener('DOMContentLoaded', e => {
  // listen for user added image
  document
    .getElementById('picture')
    .addEventListener('change', handleImg, false);

  // runs when reader.readAsDataURL(file) is called
  reader.addEventListener('load', handleReader, false);

  // listen for user input coords (will not catch programmatic input changes)
  // console.log('lat, lng globals from leaflet.js?', lat, lng);
  const lat = document.getElementById('latitude');
  lat.addEventListener('input', handleCoord, false);

  const lng = document.getElementById('longitude');
  lng.addEventListener('input', handleCoord, false);

  // mutation observer allows programmatic 'input' value change from leaflet.js
  observer.observe(lat, { attributes: true, attributeFilter: ['value'] });
  observer.observe(lng, { attributes: true, attributeFilter: ['value'] });
});
