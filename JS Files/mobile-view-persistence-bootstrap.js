(function mobileViewPersistenceBootstrap() {
  'use strict';

  var STORAGE_KEY = 'iphoneViewEnabled';
  var lastApplied = null;

  function parseStoredFlag(rawValue) {
    var text = String(rawValue == null ? '' : rawValue).trim().toLowerCase();
    if (text === '1' || text === 'true' || text === 'yes' || text === 'on') return true;
    if (text === '0' || text === 'false' || text === 'no' || text === 'off') return false;
    return null;
  }

  function readStorageSafe(storageObject) {
    if (!storageObject || typeof storageObject.getItem !== 'function') return null;
    try {
      return parseStoredFlag(storageObject.getItem(STORAGE_KEY));
    } catch (_error) {
      return null;
    }
  }

  function readFromOpenerSafe() {
    try {
      if (!window.opener || window.opener.closed) return null;

      if (typeof window.opener.isIphoneViewEnabled === 'function') {
        return Boolean(window.opener.isIphoneViewEnabled());
      }

      var openerBody = window.opener.document && window.opener.document.body;
      if (!openerBody || !openerBody.classList) return null;
      if (openerBody.classList.contains('mobile-view') || openerBody.classList.contains('iphone-view')) {
        return true;
      }
      return false;
    } catch (_error) {
      return null;
    }
  }

  function readPersistedMobileView() {
    var localFlag = readStorageSafe(window.localStorage);
    if (localFlag !== null) return localFlag;

    var sessionFlag = readStorageSafe(window.sessionStorage);
    if (sessionFlag !== null) return sessionFlag;

    var openerFlag = readFromOpenerSafe();
    if (openerFlag !== null) return openerFlag;

    return false;
  }

  function applyMobileViewState(enabled, source) {
    var isEnabled = Boolean(enabled);

    document.documentElement.classList.toggle('mobile-view', isEnabled);
    document.documentElement.classList.toggle('iphone-view', isEnabled);

    if (document.body) {
      document.body.classList.toggle('mobile-view', isEnabled);
      document.body.classList.toggle('iphone-view', isEnabled);
      document.body.dataset.mobileView = isEnabled ? '1' : '0';
    }

    if (lastApplied === isEnabled && source !== 'storage') {
      return isEnabled;
    }

    lastApplied = isEnabled;
    window.dispatchEvent(new CustomEvent('app:mobile-view-changed', {
      detail: {
        enabled: isEnabled,
        source: String(source || 'bootstrap')
      }
    }));

    return isEnabled;
  }

  function syncFromStorageEvent(event) {
    if (!event || event.key !== STORAGE_KEY) return;
    var parsed = parseStoredFlag(event.newValue);
    if (parsed === null) return;
    applyMobileViewState(parsed, 'storage');
  }

  function syncFromMessageEvent(event) {
    var data = event && event.data;
    if (!data || data.type !== 'app:mobile-view-sync') return;
    applyMobileViewState(Boolean(data.enabled), 'message');
  }

  function bootstrap() {
    var initial = readPersistedMobileView();
    applyMobileViewState(initial, 'init');

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () {
        applyMobileViewState(initial, 'dom-ready');
      }, { once: true });
    }
  }

  window.addEventListener('storage', syncFromStorageEvent);
  window.addEventListener('message', syncFromMessageEvent);

  window.readPersistedMobileView = window.readPersistedMobileView || readPersistedMobileView;
  window.applyMobileViewState = window.applyMobileViewState || function (enabled) {
    return applyMobileViewState(Boolean(enabled), 'api');
  };

  bootstrap();
})();

