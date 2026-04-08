/*
 * Shared Button Action Guard
 * Centralizes in-flight lock, dedupe window, and disabled/busy checks.
 */
(function() {
  'use strict';

  const DEFAULTS = {
    dedupeMs: 300,
    lockTimeoutMs: 8000
  };

  const scopes = new Map();

  function emitReliabilityEvent(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
    } catch (_error) {
      // Ignore event dispatch failures.
    }
  }

  function getOrCreateScope(scopeName) {
    const key = String(scopeName || 'global').trim() || 'global';
    if (scopes.has(key)) return scopes.get(key);
    const scope = {
      name: key,
      inFlight: new Map(),
      lastAt: new Map()
    };
    scopes.set(key, scope);
    return scope;
  }

  function isActivatable(target) {
    if (!target) return false;
    if (target.disabled === true) return false;
    if (typeof target.getAttribute === 'function' && target.getAttribute('aria-disabled') === 'true') return false;
    if (target.dataset && target.dataset.busy === '1') return false;
    return true;
  }

  function getDefaultActionKey(target) {
    if (!target) return 'unknown';
    if (target.id) return `id:${target.id}`;
    const attrs = [
      'data-nature-subtab',
      'data-bird-toggle',
      'data-bird-favorite',
      'data-bird-open',
      'data-birds-more',
      'data-sync-resolve'
    ];
    for (let i = 0; i < attrs.length; i += 1) {
      const value = typeof target.getAttribute === 'function' ? target.getAttribute(attrs[i]) : null;
      if (value != null) return `${attrs[i]}:${value}`;
    }
    return `tag:${String(target.tagName || '').toLowerCase()}`;
  }

  async function withActionGuard(options) {
    const opts = options || {};
    const target = opts.target || null;
    const action = typeof opts.action === 'function' ? opts.action : null;
    const scope = getOrCreateScope(opts.scope || 'global');
    const dedupeMs = Math.max(0, Number(opts.dedupeMs) || DEFAULTS.dedupeMs);
    const lockTimeoutMs = Math.max(1000, Number(opts.lockTimeoutMs) || DEFAULTS.lockTimeoutMs);
    const getActionKey = typeof opts.getActionKey === 'function' ? opts.getActionKey : getDefaultActionKey;
    const onBlocked = typeof opts.onBlocked === 'function' ? opts.onBlocked : null;
    const onStart = typeof opts.onStart === 'function' ? opts.onStart : null;
    const onEnd = typeof opts.onEnd === 'function' ? opts.onEnd : null;

    if (!target || !action) return false;

    const key = String(getActionKey(target) || 'unknown');

    if (!isActivatable(target)) {
      emitReliabilityEvent('reliability:action-blocked', {
        scope: scope.name,
        reason: 'disabled',
        actionKey: key,
        targetId: target && target.id ? target.id : ''
      });
      if (onBlocked) onBlocked('disabled', { key, target });
      return false;
    }

    const now = Date.now();

    if (scope.inFlight.get(key)) {
      emitReliabilityEvent('reliability:action-blocked', {
        scope: scope.name,
        reason: 'in-flight',
        actionKey: key,
        targetId: target && target.id ? target.id : ''
      });
      if (onBlocked) onBlocked('in-flight', { key, target });
      return false;
    }

    const lastAt = Number(scope.lastAt.get(key) || 0);
    if (now - lastAt < dedupeMs) {
      emitReliabilityEvent('reliability:action-blocked', {
        scope: scope.name,
        reason: 'dedupe',
        actionKey: key,
        targetId: target && target.id ? target.id : ''
      });
      if (onBlocked) onBlocked('dedupe', { key, ageMs: now - lastAt, target });
      return false;
    }

    scope.inFlight.set(key, true);
    scope.lastAt.set(key, now);
    if (target.dataset) {
      target.dataset.busy = '1';
      target.dataset.busySince = String(now);
    }
    window.__lastActionKey = key;
    emitReliabilityEvent('reliability:action-start', {
      scope: scope.name,
      actionKey: key,
      targetId: target && target.id ? target.id : ''
    });

    if (onStart) onStart({ key, target });

    const safetyTimer = window.setTimeout(() => {
      scope.inFlight.delete(key);
      if (target.dataset) {
        delete target.dataset.busy;
        delete target.dataset.busySince;
      }
    }, lockTimeoutMs);

    try {
      await action();
      return true;
    } finally {
      clearTimeout(safetyTimer);
      scope.inFlight.delete(key);
      if (target.dataset) {
        delete target.dataset.busy;
        delete target.dataset.busySince;
      }
      emitReliabilityEvent('reliability:action-end', {
        scope: scope.name,
        actionKey: key,
        targetId: target && target.id ? target.id : ''
      });
      if (onEnd) onEnd({ key, target });
    }
  }

  function createScope(name, config) {
    const scopeName = String(name || 'global').trim() || 'global';
    const scopeConfig = config || {};
    return {
      withActionGuard(target, action, options = {}) {
        return withActionGuard({
          scope: scopeName,
          target,
          action,
          dedupeMs: options.dedupeMs != null ? options.dedupeMs : scopeConfig.dedupeMs,
          lockTimeoutMs: options.lockTimeoutMs != null ? options.lockTimeoutMs : scopeConfig.lockTimeoutMs,
          getActionKey: options.getActionKey,
          onBlocked: options.onBlocked,
          onStart: options.onStart,
          onEnd: options.onEnd
        });
      }
    };
  }

  window.ButtonActionGuard = {
    DEFAULTS,
    isActivatable,
    withActionGuard,
    createScope,
    getScopeState(scopeName) {
      const scope = getOrCreateScope(scopeName || 'global');
      return {
        scope: scope.name,
        inFlightCount: scope.inFlight.size,
        trackedActionCount: scope.lastAt.size
      };
    }
  };
})();

