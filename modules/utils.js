// not working currently
const observer = new MutationObserver(mutations => {
  // generalisable use-case for picking up many mutation types
  for (const mutation of mutations) {
    // screen for irrelevant values (could paramaterise 'value')
    if (mutation.attributeName !== 'value') {
      console.log('mutation observer picked up non-value attribute mutation');
      continue;
    }

    console.log(mutation.target.name, '=', mutation.target.value);
    mutation.target.value = parseCoord(mutation.target.value);
    console.log(mutation.target.name, '=', mutation.target.value);
  }
});

// global function to use from leaflet.js too?
const parseCoord = coord => +parseFloat(coord).toFixed(6);

export { observer, parseCoord };
