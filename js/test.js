window.onloadeddata = () => {
  console.log('____test____ window.onloadeddata');
};

window.onloadedmetadata = () => {
  console.log('____test____ window.onloadedmetadata');
};

document.onloadeddata = () => {
  console.log('____test____ document.onloadeddata');
};

document.onloadedmetadata = () => {
  console.log('____test____ document.onloadedmetadata');
};

document.addEventListener('DOMContentLoaded', () => console.log('____test____ DOMContentLoaded'));

$(() => console.log('____test____ $()'))();
