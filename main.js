/*
  todo
    - if user manually sets lat/long, use same toFixed() rounding
    - tailwind refactor (swap all possible css styles for tailwind classes)
    - clear form after submit (especially images cos they could stack..)
    - proper auto-complete + ease of use UI
    - required fields?
*/

// globals to be updated when page is loaded
let reader, preview;

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

const handleReader = e => {
  if (reader.result) {
    // console.log('got a base64 result', reader.result.substring(0, 18));
    const preview = document.querySelector('img.img-preview');

    preview.src = reader.result;

    preview.style.display = 'inline-block';

    // add this to hidden textarea element
    document.getElementById('hidden-base64').value = reader.result;
  } else {
    console.error('[reader.result error]:', reader.result);
    return;
  }
};

window.addEventListener('DOMContentLoaded', e => {
  // instatiate global file reader
  reader = new FileReader();

  // const fileInput = document.getElementById('picture');

  // listen for user added image
  document
    .getElementById('picture')
    .addEventListener('change', handleImg, false);

  // runs when reader.readAsDataURL(file) is called
  reader.addEventListener('load', handleReader, false);
});
