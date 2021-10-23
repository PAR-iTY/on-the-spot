import { observer } from './utils.js';

// global reader object (shared between all functions atm)
const reader = new FileReader();

const handleImg = e => {
  // one image per spot for now
  const file = e.target.files[0];

  if (file) {
    // sanity check file size due to base64 encoding
    // 2 mb in binary = 2097152
    // 3 mb in binary = 3145728
    if (file.size > 3145728) {
      console.error('file size must be under 3 megabytes');

      alert('file size must be under 2 megabytes');
      return;
    }
    try {
      // pretty sure this is async -> wait for reader load event to fire
      // alternatives: reader.readAsBinaryString(file); or ArrayBuffer...
      // reader.readAsBinaryString(file);
      reader.readAsDataURL(file);
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
    // console.log('binary string:', reader.result.substring(0, 32));
    // console.log('got a base64 result', reader.result.substring(0, 18));

    const preview = document.querySelector('img.img-preview');

    const toggle = document.querySelector('div.img-preview-toggle');

    preview.src = reader.result;

    toggle.style.visibility = 'visible';

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

// const wipeReader = () ={};

// handles clearing form on submit
const handleSubmit = e => {
  console.log('submit event', e);

  // remove image preview
  document.querySelector('img.img-preview').src = '';

  document.querySelector('div.img-preview-toggle').style.visibility = 'hidden';
  // preview.style.display = 'inline-block';
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

  // wary of this interferreing with formspree somehow
  document.getElementById('submit').addEventListener('submit', handleSubmit);
});

// from https://developers.google.com/web/updates/2018/07/page-lifecycle-api#the-unload-event
const terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';

addEventListener(
  terminationEvent,
  event => {
    console.log(`terminationEvent: ${event}`);
    // note: if the browser is able to cache the page, `event.persisted`
    // is `true`, and the state is frozen rather than terminated.

    // reset form? may interfere with formspree
    // something crude like a setInterval? better some kind of event?
    document.getElementById('spot-form').reset();
  },
  { capture: true }
);
