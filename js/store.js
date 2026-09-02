(function (global) {
  'use strict';

  var STORAGE_KEY = 'hellias7030';
  var CHANNEL_NAME = 'hellias7030-sync';

  var PLUS_LEVELS = {
    1: { goal: 100, split: '60/40', label: 'Plus L1' },
    2: { goal: 300, split: '70/30', label: 'Plus L2' }
  };

  var DEFAULTS = {
    channelId: '',
    dataSource: 'streamlabs-subgoal',
    slSubGoalToken: '',
    goal: 800,
    label: 'Sub Points',
    showPlusLevel: false,
    plusTargetLevel: 2,
    plusPoints: 0,
    plusGoal: 300,
    lastPlusLevelCelebrated: 0,
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

  function plusGoalForLevel(level) {
    var l = PLUS_LEVELS[level];
    return l ? l.goal : PLUS_LEVELS[2].goal;
  }

  function detectPlusLevelUp(prev, next) {
    prev = Number(prev) || 0;
    next = Number(next) || 0;
    if (prev < 100 && next >= 100) return 1;
    if (prev < 300 && next >= 300) return 2;
    return null;
  }

  function initPlusCelebrated(points) {
    points = Number(points) || 0;
    if (points >= 300) return 2;
    if (points >= 100) return 1;
    return 0;
  }

  function shouldPollPlus(cfg) {
    return !!(cfg.channelId && String(cfg.channelId).trim());
  }

  function streakPoints(cfg) {
    if (shouldPollPlus(cfg)) {
      return Number(cfg.plusPoints) || 0;
    }
    return displayPoints(cfg);
  }

  function streakGoal(cfg) {
    if (shouldPollPlus(cfg)) {
      var level = Number(cfg.plusTargetLevel) || 2;
      return plusGoalForLevel(level);
    }
    return Number(cfg.goal) || 300;
  }

  function computeStreak(cfg, points) {
    if (cfg.streakOverride !== null && cfg.streakOverride !== undefined && cfg.streakOverride !== '') {
      return Math.min(3, Math.max(0, Number(cfg.streakOverride)));
    }
    var past = Math.min(2, Math.max(0, Number(cfg.streakPast) || 0));
    var goal = streakGoal(cfg);
    var pts = points != null ? points : streakPoints(cfg);
    var currentOnTrack = pts >= goal ? 1 : 0;
    return Math.min(3, past + currentOnTrack);
  }

  function displayPoints(cfg) {
    var base = cfg.pointsOverride !== null && cfg.pointsOverride !== undefined && cfg.pointsOverride !== ''
      ? Number(cfg.pointsOverride)
      : Number(cfg.points) || 0;
    return Math.max(0, base + (Number(cfg.optimisticDelta) || 0));
  }

  function milestoneFloor(points) {
    return Math.floor(Math.max(0, Number(points) || 0) / 30) * 30;
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
    PLUS_LEVELS: PLUS_LEVELS,
    SIZES: SIZES,
    TIER_POINTS: TIER_POINTS,
    load: load,
    save: save,
    subscribe: subscribe,
    tierToPoints: tierToPoints,
    plusGoalForLevel: plusGoalForLevel,
    detectPlusLevelUp: detectPlusLevelUp,
    initPlusCelebrated: initPlusCelebrated,
    shouldPollPlus: shouldPollPlus,
    streakPoints: streakPoints,
    streakGoal: streakGoal,
    computeStreak: computeStreak,
    displayPoints: displayPoints,
    milestoneFloor: milestoneFloor,
    hexToRgba: hexToRgba
  };
})(typeof window !== 'undefined' ? window : globalThis);
