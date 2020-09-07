/**
 * "*://row1.vfsglobal.com/GlobalAppointment/Account/RegisteredLogin"
 * Reload page if server gives this error
 */
const delay = 1e3; // 1 sec
setTimeout(() => {
  window.location.search = '';
  window.location.pathname = '/GlobalAppointment';
}, delay);
