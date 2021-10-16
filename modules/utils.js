const parseCoord = coord => +parseFloat(coord).toFixed(6);

const handleMutation = mutations => {
  console.log('[mutation observer]');
  // generalisable use-case for picking up many mutation types
  for (const mutation of mutations) {
    // screen for irrelevant values (could paramaterise 'value')
    if (mutation.attributeName !== 'value') {
      console.log('mutation observer picked up non-value attribute mutation');
      continue;
    }

    console.log(
      mutation.target.name,
      '=',
      mutation.target.attributes.value.nodeValue
    );
    // nodeValue is a string but parseCoord handles that
    // console.log('[parseCoord]:', mutation.target.attributes.value.nodeValue);

    mutation.target.value = parseCoord(
      mutation.target.attributes.value.nodeValue
    );
  }
};

let observer = new MutationObserver(handleMutation);

export { observer, parseCoord };
