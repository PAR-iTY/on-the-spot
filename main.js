import { parseCoord } from './modules/utils.js';

// global reader object (shared between all functions atm)
const reader = new FileReader();

const handleImg = e => {
  const file = e.target.files[0];

  if (file) {
    if (file.size > 2097152) {
      console.error('file size must be under 2 megabytes');
      alert('file size must be under 2 megabytes');
      return;
    }
    try {
      // pretty sure this is async -> wait for reader load event to fire
      // alternatives: reader.readAsBinaryString(file); or ArrayBuffer...
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[base64 error]:', error);
      return;
    }
  } else {
    console.error('[file error]:', file);
    return;
  }
};

const handleReader = () => {
  if (reader.result) {
    // console.log('binary string:', reader.result);
    // console.log('got a base64 result', reader.result.substring(0, 18));
    const preview = document.querySelector('img.img-preview');

    preview.src = reader.result;

    preview.style.display = 'inline-block';

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

// handles coords by calling utils.js function
const handleCoords = e => {
  e.target.value = parseCoord(e.target.value);
};

window.addEventListener('DOMContentLoaded', e => {
  // listen for user added image
  document
    .getElementById('picture')
    .addEventListener('change', handleImg, false);

  // runs when reader.readAsDataURL(file) is called
  reader.addEventListener('load', handleReader, false);

  // listen for user input coords (will not catch programmatic input changes)
  document
    .getElementById('latitude')
    .addEventListener('input', handleCoords, false);
  document
    .getElementById('longitude')
    .addEventListener('input', handleCoords, false);
});

// use mutations and .setAttribute to listen for programmatic value changes across scripts
// seems to have an issue with the 'value' attribute vs. property...
// wierdly works if i double call observer using both .value and setAttribute
// observer.observe(document.getElementById('latitude'), {
//   attributes: true,
//   attributeFilter: ['value']
// });
// observer.observe(document.getElementById('longitude'), {
//   attributes: true,
//   attributeFilter: ['value']
// });
