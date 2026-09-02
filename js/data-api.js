(function (global) {
  'use strict';

  var PLUS_API_BASE = 'https://partner-plus.milanitommaso.com/data/';
  var SL_GOALS_API = 'https://streamlabs.com/api/v5/widgets/goals/sub';
  var SL_SETTINGS_API = 'https://streamlabs.com/api/v5/slobs/widget/subgoal/settings';

  function extractSlWidgetToken(input) {
    if (!input) return '';
    var raw = String(input).trim();
    var match = raw.match(/[?&]token=([^&#]+)/i);
    if (match) return decodeURIComponent(match[1]).trim();
    return raw;
  }

  function parseSlSubGoalPayload(data) {
    if (!data || typeof data !== 'object') return null;
    var root = data.data != null ? data.data : data;
    var goal = root.goal;
    if (Array.isArray(goal)) goal = null;

    var points = null;
    var goalTarget = null;
    var title = null;

    if (goal) {
      title = goal.title || goal.name || null;
      if (goal.amount && goal.amount.current != null) {
        points = Number(goal.amount.current);
        if (goal.amount.target != null) goalTarget = Number(goal.amount.target);
      } else if (goal.current_amount != null) {
        points = Number(goal.current_amount);
        if (goal.goal_amount != null) goalTarget = Number(goal.goal_amount);
        else if (goal.target != null) goalTarget = Number(goal.target);
      } else if (goal.current != null) {
        points = Number(goal.current);
        if (goal.target != null) goalTarget = Number(goal.target);
      }
    }

    if (points == null && root.amount && root.amount.current != null) {
      points = Number(root.amount.current);
      if (root.amount.target != null) goalTarget = Number(root.amount.target);
      title = root.title || title;
    }

    if (points == null || Number.isNaN(points)) return null;
    return {
      points: points,
      goal: goalTarget != null && !Number.isNaN(goalTarget) ? goalTarget : null,
      title: title
    };
  }

  function fetchJson(url) {
    return fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (!res.ok) {
        var err = new Error('HTTP ' + res.status);
        err.status = res.status;
        throw err;
      }
      return res.json();
    });
  }

  function DataApi(onUpdate, onError, onPlusUpdate) {
    this.onUpdate = onUpdate || function () {};
    this.onError = onError || function () {};
    this.onPlusUpdate = onPlusUpdate || function () {};
    this.timer = null;
    this.plusTimer = null;
    this.lastPoints = null;
    this.lastPlusPoints = null;
  }

  DataApi.prototype.fetchPlusPoints = function (channelId) {
    if (!channelId) {
      return Promise.reject(new Error('Channel ID manquant'));
    }
    return fetchJson(PLUS_API_BASE + encodeURIComponent(channelId)).then(function (data) {
      var points = Number(data.points);
      if (Number.isNaN(points)) throw new Error('Réponse Plus Points invalide');
      var threshold = data.threshold != null ? Number(data.threshold) : null;
      return {
        points: points,
        goal: threshold != null && !Number.isNaN(threshold) ? threshold : null,
        threshold: threshold,
        source: 'plus-api'
      };
    });
  };

  DataApi.prototype.fetchStreamlabsSubGoal = function (tokenInput) {
    var token = extractSlWidgetToken(tokenInput);
    if (!token) {
      return Promise.reject(new Error('Token Streamlabs Sub Goal manquant'));
    }

    var qs = '?token=' + encodeURIComponent(token);

    return fetchJson(SL_GOALS_API + qs)
      .catch(function (err) {
        if (err.status === 401 || err.status === 404) {
          return fetchJson(SL_SETTINGS_API + qs);
        }
        throw err;
      })
      .then(function (data) {
        var parsed = parseSlSubGoalPayload(data);
        if (!parsed) throw new Error('Réponse Streamlabs Sub Goal invalide');
        return {
          points: parsed.points,
          goal: parsed.goal,
          title: parsed.title,
          source: 'streamlabs-subgoal'
        };
      });
  };

  DataApi.prototype.fetchPoints = function (cfg) {
    if (cfg.dataSource === 'streamlabs-subgoal') {
      return this.fetchStreamlabsSubGoal(cfg.slSubGoalToken);
    }
    return this.fetchPlusPoints(cfg.channelId);
  };

  DataApi.prototype.pollMain = function (cfg) {
    var self = this;

    if (cfg.dataSource === 'streamlabs-subgoal') {
      if (!extractSlWidgetToken(cfg.slSubGoalToken)) return;
    } else if (!cfg.channelId) {
      return;
    }

    self.fetchPoints(cfg)
      .then(function (result) {
        var prev = self.lastPoints;
        self.lastPoints = result.points;
        self.onUpdate({
          points: result.points,
          goal: result.goal,
          delta: prev === null ? 0 : result.points - prev,
          source: result.source
        });
      })
      .catch(function (err) {
        self.onError(err);
      });
  };

  DataApi.prototype.pollPlus = function (cfg) {
    var self = this;
    if (!cfg.channelId) return;

    self.fetchPlusPoints(cfg.channelId)
      .then(function (result) {
        var prev = self.lastPlusPoints;
        self.lastPlusPoints = result.points;
        self.onPlusUpdate({
          points: result.points,
          goal: result.goal,
          threshold: result.threshold,
          delta: prev === null ? 0 : result.points - prev,
          source: 'plus-api'
        });
      })
      .catch(function () {});
  };

  DataApi.prototype.poll = function (cfg) {
    this.pollMain(cfg);
    if (global.HelliasStore && global.HelliasStore.shouldPollPlus(cfg) && cfg.dataSource !== 'plus-api') {
      this.pollPlus(cfg);
    }
  };

  DataApi.prototype.start = function (getConfig) {
    var self = this;
    self.stop();

    function tick() {
      self.poll(getConfig());
    }

    tick();
    var cfg = getConfig();
    var interval = Math.max(15, Number(cfg.pollInterval) || 45) * 1000;
    self.timer = setInterval(tick, interval);
  };

  DataApi.prototype.stop = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.plusTimer) {
      clearInterval(this.plusTimer);
      this.plusTimer = null;
    }
  };

  global.HelliasDataApi = DataApi;
  global.HelliasSlApi = {
    extractSlWidgetToken: extractSlWidgetToken,
    parseSlSubGoalPayload: parseSlSubGoalPayload
  };
})(typeof window !== 'undefined' ? window : globalThis);
