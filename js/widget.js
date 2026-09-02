(function (global) {
  'use strict';

  var Store = global.HelliasStore;

  function Widget(rootEl, options) {
    this.root = rootEl;
    this.options = options || {};
    this.previewOnly = !!this.options.previewOnly;
    this.cfg = Store.load();
    this.prevPoints = null;
    this.prevPlusPoints = null;
    this.prevStreak = null;
    this.anims = null;
    this.dataApi = null;
    this.liveSE = null;
    this.liveSL = null;
    this.demoTimer = null;
    this.demoToggle = false;
    this._plusInitDone = false;
  }

  Widget.prototype.buildDOM = function () {
    this.root.innerHTML =
      '<div class="widget-shell size-M" id="widget-shell">' +
        '<div class="widget-blobs"><div class="widget-blob"></div><div class="widget-blob"></div></div>' +
        '<canvas class="widget-confetti-canvas" aria-hidden="true"></canvas>' +
        '<div class="widget-fx-layer" aria-hidden="true"></div>' +
        '<div class="widget-content">' +
          '<div class="widget-header">' +
            '<span class="widget-label">Sub Points</span>' +
            '<span class="widget-counter"><span class="current">0</span><span class="sep">/</span><span class="goal">800</span></span>' +
          '</div>' +
          '<div class="widget-bar-wrap">' +
            '<div class="widget-bar-track"><div class="widget-bar-fill"></div></div>' +
          '</div>' +
          '<div class="widget-plus-row" hidden>' +
            '<span class="widget-plus-badge"></span>' +
          '</div>' +
          '<div class="widget-footer">' +
            '<div class="widget-streak">' +
              '<span class="streak-dot"></span><span class="streak-dot"></span><span class="streak-dot"></span>' +
              '<span class="streak-text">0/3</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.shell = this.root.querySelector('#widget-shell');
    this.fill = this.root.querySelector('.widget-bar-fill');
    this.label = this.root.querySelector('.widget-label');
    this.currentEl = this.root.querySelector('.current');
    this.goalEl = this.root.querySelector('.goal');
    this.plusRow = this.root.querySelector('.widget-plus-row');
    this.plusBadge = this.root.querySelector('.widget-plus-badge');
    this.dots = this.root.querySelectorAll('.streak-dot');
    this.streakText = this.root.querySelector('.streak-text');
    this.anims = new global.HelliasAnimations(this.shell, this.fill, this.currentEl);
  };

  Widget.prototype.getMainGoal = function (cfg) {
    if (cfg.dataSource === 'plus-api') {
      var level = Number(cfg.plusTargetLevel) || 2;
      return Store.plusGoalForLevel(level);
    }
    return Number(cfg.goal) || 800;
  };

  Widget.prototype.renderPlusBadge = function (cfg) {
    if (!this.plusRow || !this.plusBadge) return;
    var show = !!(cfg.showPlusLevel && Store.shouldPollPlus(cfg));
    this.plusRow.hidden = !show;
    if (!show) return;

    var level = Number(cfg.plusTargetLevel) || 2;
    var meta = Store.PLUS_LEVELS[level] || Store.PLUS_LEVELS[2];
    var pts = Number(cfg.plusPoints) || 0;
    var goal = Number(cfg.plusGoal) || meta.goal;
    this.plusBadge.textContent = meta.label + ' · ' + pts + '/' + goal + ' · ' + meta.split;
  };

  Widget.prototype.applyConfig = function (cfg) {
    var demoDelta = null;
    if (this._demoActive && this.cfg) {
      demoDelta = this.cfg.optimisticDelta;
    }

    this.cfg = cfg;
    if (demoDelta !== null && (cfg.demoMode || this.options.forceDemo)) {
      this.cfg = Object.assign({}, cfg, { optimisticDelta: demoDelta });
    }

    var size = cfg.size || 'M';
    var anchor = cfg.anchor || 'top-left';

    this.root.setAttribute('data-anchor', anchor);
    this.shell.className = 'widget-shell size-' + size;

    var colors = cfg.colors || Store.DEFAULTS.colors;
    this.shell.style.setProperty('--accent', colors.accent);
    this.shell.style.setProperty('--bg', colors.bg);
    this.shell.style.setProperty('--text', colors.text);
    this.shell.style.setProperty('--grid', colors.grid);
    this.shell.style.setProperty('--bg-opacity', String(cfg.bgOpacity != null ? cfg.bgOpacity : 1));
    this.shell.style.background = Store.hexToRgba(colors.bg, cfg.bgOpacity != null ? cfg.bgOpacity : 1);

    this.label.textContent = cfg.label || 'Sub Points';
    this.goalEl.textContent = String(this.getMainGoal(cfg));

    this.renderPlusBadge(cfg);
    this.render(false);

    var wantDemo = !!(cfg.demoMode || this.options.forceDemo);
    if (wantDemo !== this._demoActive) {
      this.syncDemoMode();
    }
  };

  Widget.prototype.milestoneIntensity = function (points, goal) {
    goal = goal || 1;
    return Math.min(2.2, 1 + (Math.max(0, points) / goal) * 1.2);
  };

  Widget.prototype.render = function (animate) {
    var cfg = this.cfg;
    var points = Store.displayPoints(cfg);
    var goal = this.getMainGoal(cfg);
    var pct = goal > 0 ? Math.min(100, (points / goal) * 100) : 0;
    var streakPts = Store.streakPoints(cfg);
    var streak = Store.computeStreak(cfg, streakPts);

    if (animate && this.prevPoints !== null && !this.anims.isPlusLevelUpActive()) {
      if (points > this.prevPoints) {
        var prevFloor = Store.milestoneFloor(this.prevPoints);
        var newFloor = Store.milestoneFloor(points);
        if (newFloor > prevFloor && newFloor > 0) {
          this.anims.playMilestoneUp(this.milestoneIntensity(points, goal));
        } else {
          this.anims.playUp(points - this.prevPoints, goal, points);
        }
        this.anims.tweenCounter(this.prevPoints, points);
      } else if (points < this.prevPoints) {
        var prevFloorDown = Store.milestoneFloor(this.prevPoints);
        var newFloorDown = Store.milestoneFloor(points);
        if (newFloorDown < prevFloorDown) {
          this.anims.playMilestoneDown(this.milestoneIntensity(this.prevPoints, goal));
        } else {
          this.anims.playDown();
        }
        this.currentEl.textContent = String(points);
      }
    } else {
      this.currentEl.textContent = String(points);
    }

    if (this.prevStreak !== null && streak > this.prevStreak && !this.anims.isPlusLevelUpActive()) {
      this.anims.playStreakGain();
    }

    this.fill.style.width = pct + '%';
    this.anims.resetMilestone(points);

    for (var i = 0; i < this.dots.length; i++) {
      this.dots[i].classList.toggle('filled', i < streak);
    }
    this.streakText.textContent = streak + '/3';

    this.renderPlusBadge(cfg);

    this.prevPoints = points;
    this.prevStreak = streak;
  };

  Widget.prototype.tryPlusLevelUp = function (prev, next) {
    var cfg = Store.load();
    if (!this._plusInitDone) {
      Store.save({
        lastPlusLevelCelebrated: Store.initPlusCelebrated(next)
      });
      this._plusInitDone = true;
      this.cfg = Store.load();
      this.prevPlusPoints = next;
      this.renderPlusBadge(this.cfg);
      return false;
    }

    var levelUp = Store.detectPlusLevelUp(prev, next);
    var celebrated = Number(cfg.lastPlusLevelCelebrated) || 0;

    if (levelUp && levelUp > celebrated) {
      Store.save({ lastPlusLevelCelebrated: levelUp });
      this.cfg = Store.load();
      this.renderPlusBadge(this.cfg);
      this.anims.playPlusLevelUp(levelUp);
      this.prevPlusPoints = next;
      return true;
    }

    this.renderPlusBadge(cfg);
    this.prevPlusPoints = next;
    return false;
  };

  Widget.prototype.handlePlusUpdate = function (payload) {
    if (this.cfg.demoMode) return;

    var prev = this.prevPlusPoints != null
      ? this.prevPlusPoints
      : (Number(Store.load().plusPoints) || 0);
    var next = payload.points;
    var patch = { plusPoints: next };

    if (payload.goal != null) patch.plusGoal = payload.goal;
    else if (payload.threshold != null) patch.plusGoal = payload.threshold;

    Store.save(patch);
    this.cfg = Store.load();
    this.tryPlusLevelUp(prev, next);
  };

  Widget.prototype.handleApiUpdate = function (payload) {
    if (this.cfg.demoMode) return;

    var cfg = Store.load();
    var prevPlus = this.prevPlusPoints != null
      ? this.prevPlusPoints
      : (Number(cfg.plusPoints) || 0);

    cfg.points = payload.points;
    cfg.optimisticDelta = 0;
    if (payload.goal != null && payload.source === 'streamlabs-subgoal') {
      cfg.goal = payload.goal;
    }
    if (payload.source === 'plus-api') {
      cfg.plusPoints = payload.points;
      if (payload.goal != null) cfg.plusGoal = payload.goal;
    }
    Store.save(cfg);
    this.cfg = Store.load();

    if (payload.source === 'plus-api') {
      if (this.tryPlusLevelUp(prevPlus, payload.points)) return;
    }

    if (payload.delta > 0 || payload.delta < 0) {
      this.render(true);
    } else {
      this.render(false);
    }
  };

  Widget.prototype.handleOptimisticSub = function (sub) {
    if (this.cfg.demoMode) return;

    var cfg = Store.load();
    cfg.optimisticDelta = (Number(cfg.optimisticDelta) || 0) + sub.points;
    Store.save(cfg);
    this.cfg = Store.load();
    this.render(true);
  };

  Widget.prototype.startLive = function () {
    var self = this;
    var cfg = this.cfg;

    if (this.liveSE) {
      this.liveSE.disconnect();
      this.liveSE = null;
    }
    if (this.liveSL) {
      this.liveSL.disconnect();
      this.liveSL = null;
    }

    if (cfg.demoMode || this.previewOnly) return;

    if (cfg.liveSource === 'se') {
      this.liveSE = new global.HelliasLiveSE(function (sub) {
        self.handleOptimisticSub(sub);
      });
      this.liveSE.connect(cfg);
    } else if (cfg.liveSource === 'sl') {
      this.liveSL = new global.HelliasLiveSL(function (sub) {
        self.handleOptimisticSub(sub);
      });
      this.liveSL.connect(cfg);
    }
  };

  Widget.prototype.startPolling = function () {
    var self = this;
    if (this.dataApi) this.dataApi.stop();
    if (this.previewOnly || this.cfg.demoMode) return;

    this.dataApi = new global.HelliasDataApi(
      function (payload) {
        self.handleApiUpdate(payload);
      },
      function () {},
      function (payload) {
        self.handlePlusUpdate(payload);
      }
    );

    this.dataApi.start(function () {
      return Store.load();
    });
  };

  Widget.prototype.stopDemo = function () {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
  };

  Widget.prototype.runDemoTick = function () {
    var goal = this.getMainGoal(this.cfg);
    var pts = Store.displayPoints(this.cfg);
    this.demoToggle = !this.demoToggle;

    var nextDelta = Number(this.cfg.optimisticDelta) || 0;
    if (this.demoToggle || pts < 5) {
      var gain = [1, 1, 2, 6][Math.floor(Math.random() * 4)];
      nextDelta += gain;
      if ((Number(this.cfg.points) || 0) + nextDelta > goal) {
        nextDelta = Math.max(0, goal - (Number(this.cfg.points) || 0));
      }
    } else {
      var loss = Math.min(pts, [1, 2, 3][Math.floor(Math.random() * 3)]);
      nextDelta -= loss;
    }

    this.cfg = Object.assign({}, this.cfg, { optimisticDelta: nextDelta });
    this.render(true);
  };

  Widget.prototype.syncDemoMode = function () {
    var self = this;
    this.stopDemo();
    var wantDemo = !!(this.cfg.demoMode || this.options.forceDemo);
    this._demoActive = wantDemo;
    if (!wantDemo) return;

    if (!this.previewOnly && this.dataApi) this.dataApi.stop();
    if (!this.previewOnly) {
      if (this.liveSE) this.liveSE.disconnect();
      if (this.liveSL) this.liveSL.disconnect();
    }

    this.demoTimer = setInterval(function () {
      self.runDemoTick();
    }, 2800);
  };

  Widget.prototype.init = function () {
    var self = this;
    this.buildDOM();
    this.applyConfig(Store.load());

    var cfg = Store.load();
    if (Store.shouldPollPlus(cfg)) {
      this.prevPlusPoints = Number(cfg.plusPoints) || 0;
      if (!cfg.lastPlusLevelCelebrated) {
        Store.save({ lastPlusLevelCelebrated: Store.initPlusCelebrated(cfg.plusPoints) });
        this.cfg = Store.load();
      }
      this._plusInitDone = true;
    }

    if (!this.previewOnly) {
      this.startPolling();
      this.startLive();
    }

    function applyFromStore(cfg) {
      self.applyConfig(cfg);
      if (!self.previewOnly) {
        self.startLive();
        if (self.dataApi) self.dataApi.stop();
        self.startPolling();
      }
    }

    Store.subscribe(applyFromStore);

    if (!this.previewOnly) {
      /* Cross-tab / OBS dock ↔ Browser Source (même origine Pages) */
      window.addEventListener('storage', function (e) {
        if (e.key === Store.STORAGE_KEY) {
          applyFromStore(Store.load());
        }
      });

      /* Fallback si BroadcastChannel ne traverse pas le dock OBS */
      var lastRaw = null;
      try { lastRaw = localStorage.getItem(Store.STORAGE_KEY); } catch (e) {}
      setInterval(function () {
        var raw = null;
        try { raw = localStorage.getItem(Store.STORAGE_KEY); } catch (e) { return; }
        if (raw !== lastRaw) {
          lastRaw = raw;
          applyFromStore(Store.load());
        }
      }, 1500);
    }
  };

  Widget.prototype.previewAnimUp = function () {
    var cfg = this.cfg;
    var gain = 31;
    this.cfg = Object.assign({}, cfg, {
      optimisticDelta: (Number(cfg.optimisticDelta) || 0) + gain
    });
    this.render(true);
  };

  Widget.prototype.previewAnimDown = function () {
    var cfg = this.cfg;
    var pts = Store.displayPoints(cfg);
    var loss = Math.min(pts, 31);
    this.cfg = Object.assign({}, cfg, {
      optimisticDelta: (Number(cfg.optimisticDelta) || 0) - loss
    });
    this.render(true);
  };

  Widget.prototype.previewPlusLevelUp = function (level) {
    this.anims.playPlusLevelUp(level || 2);
  };

  Widget.prototype.previewMilestone = function () {
    var cfg = this.cfg;
    var pts = Store.displayPoints(cfg);
    var goal = this.getMainGoal(cfg);
    var floor = Store.milestoneFloor(pts);
    var target = floor + 31;
    this.cfg = Object.assign({}, cfg, {
      optimisticDelta: (Number(cfg.optimisticDelta) || 0) + (target - pts)
    });
    this.render(true);
  };

  global.HelliasWidget = Widget;
})(typeof window !== 'undefined' ? window : globalThis);
