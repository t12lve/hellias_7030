(function (global) {
  'use strict';

  var API_BASE = 'https://partner-plus.milanitommaso.com/data/';

  function DataApi(onUpdate, onError) {
    this.onUpdate = onUpdate || function () {};
    this.onError = onError || function () {};
    this.timer = null;
    this.lastPoints = null;
  }

  DataApi.prototype.fetchPoints = function (channelId) {
    if (!channelId) {
      return Promise.reject(new Error('Channel ID manquant'));
    }
    return fetch(API_BASE + encodeURIComponent(channelId), {
      method: 'GET',
      cache: 'no-store'
    }).then(function (res) {
      if (!res.ok) throw new Error('API HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var points = Number(data.points);
      if (Number.isNaN(points)) throw new Error('Réponse API invalide');
      return points;
    });
  };

  DataApi.prototype.poll = function (cfg) {
    var self = this;
    if (!cfg.channelId) return;

    self.fetchPoints(cfg.channelId)
      .then(function (points) {
        var prev = self.lastPoints;
        self.lastPoints = points;
        self.onUpdate({
          points: points,
          delta: prev === null ? 0 : points - prev,
          source: 'api'
        });
      })
      .catch(function (err) {
        self.onError(err);
      });
  };

  DataApi.prototype.start = function (getConfig) {
    var self = this;
    self.stop();

    function tick() {
      var cfg = getConfig();
      self.poll(cfg);
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
  };

  global.HelliasDataApi = DataApi;
})(typeof window !== 'undefined' ? window : globalThis);
