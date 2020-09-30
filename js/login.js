this.log = console.log.bind(this, '____Login');
// var log = log.bind(this, '____Login');

log('Start');

const captchaId = 'CaptchaImage';

let captcha;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('___onMessage capture', request, sender);
  if (request.type !== 'capture') return;
  log(sender.tab ?
    'from a content script:' + sender.tab.url :
    'from the extension');

  log(request.stream);

});

function submitForm() {
  document.querySelector('#ApplicantListForm').submit();
}

function fillForm(captchaText, email, password) {
  captchaText && (document.querySelector('#CaptchaInputText').value = captchaText);
  email && (document.querySelector('#EmailId').value = email);
  password && (document.querySelector('#Password').value = password);
}

async function fillCaptcha() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.capture,
    dimensions: document.getElementById('CaptchaImage').getBoundingClientRect(),
  }, function (response) {
    log('response', response);
    // response && log('response.stream', response.stream);
    const img = document.createElement('img');
    img.src = response.stream;
    document.body.appendChild(img);
    const captchaText = response.captchaText;
    log('captchaText', captchaText);

    fillForm(captchaText);
  });
}

function fillAndSubmitForm(email, password) {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.capture,
    dimensions: document.getElementById('CaptchaImage').getBoundingClientRect(),
  }, function (response) {
    log('response', response);
    // response && log('response.stream', response.stream);
    const img = document.createElement('img');
    img.src = response.stream;
    document.body.appendChild(img);
    const captchaText = response.captchaText;
    log('captchaText', captchaText);

    fillForm(captchaText, email, password);

    submitForm();
  });
}

function getError() {
  const errorBlock = document.querySelector('.validation-summary-errors li');
  return errorBlock ? errorBlock.textContent : undefined;
}

const Errors = {
  captcha: [
    'The verification words are incorrect.',
    'Слова проверки введены неверно',
    'Слова перевірки введені невірно',
  ],
  blockIncorrectPass: [
    'Your account is locked. Please try accessing the system after 1 minutes.',
    'Ваш обліковий запис заблоковано. Будь ласка, спробуйте зайти до системи через 1 хвилин',
  ],
  blockMultipleEnter: [
    'Your account has been locked, please login after 2 minutes.',
    'Ваш обліковий запис заблоковано, будь ласка, увійдіть після 2 хвилин.',
  ],
};

function sendLoginError(error, errorContext) {
  const type = MessageTypeEnum.error;
  const ErrorClass = LoginError;
  sendError(ErrorClass, error, errorContext);
}

function pageErrorValidation() {
  const doesFormExist = Boolean(document.querySelector('#ApplicantListForm'));
  if (!doesFormExist) {
    sendLoginError('No Form at the page - Server Side Error')
  }
  return doesFormExist;
}

function errorValidation() {
  const reloadPeriodInMin = 8;
  const loginError = getError();
  if (loginError) {
    log('loginError', loginError);
    if (Errors.captcha.includes(loginError)) {
      sendLoginError(loginError, 'captcha');
      // runScript();
      return true;
    } else {
      sendLoginError(loginError, 'other');
      log(`Reload in ${reloadPeriodInMin} min`);
      setTimeout(() => window.location.reload(), reloadPeriodInMin * 60e3);
      return false;
    }
  } else {
    log('runScript');
    // runScript();
    return true;
  }
}

function closeAllOtherTabs() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.closeAllTheRest,
  }, function (response) {
    log('response', response);
  });
}

function runScript() {
  storage.get([emailField, passwordField, workStatusField], (result) => {
    const workStatus = result[workStatusField];
    console.warn(`Bot is Turned-${workStatus ? 'ON' : 'OFF'}`);
    // Bot is Turned OFF
    if (!workStatus) return;

    if (!pageErrorValidation()) {
      window.location.search = '';
      window.location.pathname = '/GlobalAppointment';
      return;
    }

    const email = result[emailField];
    const password = result[passwordField];
    log('email', email);
    log('password', password);
    if (email && password) {
      if (errorValidation()) {
        closeAllOtherTabs();
        fillAndSubmitForm(email, password);
      }
    } else {
      alert('No credentials!');
    }
  });
}

function addFillCaptchaBtn() {
  const btn = document.createElement('button');
  btn.innerText = 'Captcha';
  btn.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 999';
  btn.addEventListener('click', () => {
    log('fillCaptcha');
    fillCaptcha();
  });
  document.body.appendChild(btn);
}

// document.onready = () => {
//   log('____onready');
// };

window.onload = () => {
  const captcha = document.getElementsByClassName('customcapcha')[0];
  log('captcha', captcha);
  if (captcha) {
    // captcha.onloadeddata = () => log('____onloadeddata');
    // captcha.onload = () => log('____onload');

    addFillCaptchaBtn();
    runScript();
  } else {
    setTimeout(() => {
      $('.recaptcha-checkbox-border').click();
      $('.recaptcha-checkbox-borderAnimation').click();
      runScript();
    }, 3e3);
  }

};
