(function (global) {
  'use strict';

  var STORAGE_KEY = 'hellias7030';
  var CHANNEL_NAME = 'hellias7030-sync';

  var DEFAULTS = {
    channelId: '',
    goal: 300,
    label: '70/30',
    streakPast: 0,
    streakOverride: null,
    liveSource: 'none',
    seToken: '',
    seChannelId: '',
    slSocketToken: '',
    pollInterval: 45,
    pointsOverride: null,
    points: 0,
    optimisticDelta: 0,
    size: 'M',
    anchor: 'top-left',
    bgOpacity: 1,
    demoMode: false,
    colors: {
      accent: '#c8ff00',
      bg: '#1a1a1e',
      text: '#f0f0f0',
      grid: '#000000'
    }
  };

  var SIZES = {
    S: { width: 280, height: 80 },
    M: { width: 360, height: 100 },
    L: { width: 440, height: 120 }
  };

  var TIER_POINTS = { 1: 1, 2: 2, 3: 6, 1000: 1, 2000: 2, 3000: 6 };

  var bc = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeDefaults(partial) {
    var cfg = clone(DEFAULTS);
    if (!partial || typeof partial !== 'object') return cfg;
    Object.keys(partial).forEach(function (key) {
      if (key === 'colors' && partial.colors) {
        cfg.colors = Object.assign({}, DEFAULTS.colors, partial.colors);
      } else if (partial[key] !== undefined) {
        cfg[key] = partial[key];
      }
    });
    return cfg;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return mergeDefaults(raw ? JSON.parse(raw) : null);
    } catch (e) {
      return mergeDefaults(null);
    }
  }

  function save(partial) {
    var cfg = mergeDefaults(Object.assign(load(), partial || {}));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    if (bc) {
      bc.postMessage({ type: 'update', config: cfg });
    }
    return cfg;
  }

  function subscribe(callback) {
    if (!bc) return function () {};
    var handler = function (event) {
      if (event.data && event.data.type === 'update') {
        callback(event.data.config);
      }
    };
    bc.addEventListener('message', handler);
    return function () {
      bc.removeEventListener('message', handler);
    };
  }

  function tierToPoints(tier) {
    if (tier === 'prime' || tier === 'Prime') return 0;
    var n = typeof tier === 'string' ? parseInt(tier, 10) : tier;
    if (TIER_POINTS[tier]) return TIER_POINTS[tier];
    if (n >= 3000) return 6;
    if (n >= 2000) return 2;
    if (n >= 1000) return 1;
    if (n >= 1 && n <= 3) return TIER_POINTS[n];
    return 0;
  }

  function computeStreak(cfg, points) {
    if (cfg.streakOverride !== null && cfg.streakOverride !== undefined && cfg.streakOverride !== '') {
      return Math.min(3, Math.max(0, Number(cfg.streakOverride)));
    }
    var past = Math.min(2, Math.max(0, Number(cfg.streakPast) || 0));
    var currentOnTrack = points >= cfg.goal ? 1 : 0;
    return Math.min(3, past + currentOnTrack);
  }

  function displayPoints(cfg) {
    var base = cfg.pointsOverride !== null && cfg.pointsOverride !== undefined && cfg.pointsOverride !== ''
      ? Number(cfg.pointsOverride)
      : Number(cfg.points) || 0;
    return Math.max(0, base + (Number(cfg.optimisticDelta) || 0));
  }

  function hexToRgba(hex, alpha) {
    if (!hex) return 'rgba(26,26,30,' + alpha + ')';
    var h = String(hex).replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(function (c) { return c + c; }).join('');
    }
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return 'rgba(26,26,30,' + alpha + ')';
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  global.HelliasStore = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULTS: DEFAULTS,
    SIZES: SIZES,
    TIER_POINTS: TIER_POINTS,
    load: load,
    save: save,
    subscribe: subscribe,
    tierToPoints: tierToPoints,
    computeStreak: computeStreak,
    displayPoints: displayPoints,
    hexToRgba: hexToRgba
  };
})(typeof window !== 'undefined' ? window : globalThis);
