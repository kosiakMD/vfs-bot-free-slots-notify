const captchaId = 'CaptchaImage';

let captcha;

document.onready = () => {
  console.log('____onready');
};

window.onload = () => {
  // captcha = document.getElementById(captchaId);
  captcha = document.getElementsByClassName('customcapcha')[0];
  console.log('____', captcha);
  captcha.onloadeddata = () => console.log('____onloadeddata');
  captcha.onload = () => console.log('____onload');

  const time = 1000;
  // setTimeout(() => {
  //   html2canvas(captcha, {
  //     logging: true,
  //     allowTaint: true,
  //     // foreignObjectRendering: true,
  //     // canvas: true
  //   }).then(function (canvas) {
  //     console.log('____canvas', canvas);
  //     document.body.appendChild(canvas);
  //   });
  // }, time);


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('___onMessage capture', request, sender);
    if (request.type !== 'capture') return;
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');

    console.log(request.stream);

  });

  chrome.runtime.sendMessage({
    type: 'capture',
    dimensions: document.getElementById('CaptchaImage').getBoundingClientRect(),
  }, function (response) {
    console.log('response', response);
    response && console.log('response.stream', response.stream);
    const img = document.createElement('img');
    img.src = response.stream;
    document.body.appendChild(img);
  });


  try {
    chrome.tabs.captureVisibleTab({
      format: 'jpeg',
    }, (stream) => {
      console.log('captureVisibleTab', stream);
    });
  } catch (e) {
    console.error(e);
  } finally {

  }

  // try {
  //   // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   //   var currTab = tabs[0];
  //   //   if (currTab) { // Sanity check
  //   //     console.log(curreTav);
  //   chrome.tabCapture.capture(currTab, (stream) => {
  //     console.log(stream);
  //   });
  //   //   }
  //   // });
  // } catch (e) {
  //   console.error(e);
  // } finally {
  //
  // }
};
