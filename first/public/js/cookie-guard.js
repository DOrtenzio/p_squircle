(function () {
  "use strict";

  var STORAGE_KEY = "moneoo_cookie_consent";

  function safeLocalStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function getCookie(name) {
    try {
      var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) { return null; }
  }

  function getStoredConsent() {
    var raw = safeLocalStorageGet(STORAGE_KEY) || getCookie(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  var consent = getStoredConsent();
  if (consent && consent.necessary === true) {
    return;
  }

  var scriptEl = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var src = scriptEl && scriptEl.src ? scriptEl.src : "";
  var rootUrl = src.replace(/js\/cookie-guard\.js(?:\?.*)?$/, "");

  if (!rootUrl) {
    rootUrl = "/";
  }

  var returnTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
  window.location.replace(rootUrl + "index.html?returnTo=" + returnTo);
})();