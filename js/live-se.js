(function (global) {
  'use strict';

  var Store = global.HelliasStore;

  function LiveSE(onSub) {
    this.onSub = onSub || function () {};
    this.ws = null;
    this.reconnectTimer = null;
  }

  LiveSE.prototype.isEligibleSub = function (data) {
    if (!data) return false;
    if (data.gifted || data.bulkGifted || data.isCommunityGift) return false;
    var tier = data.tier || data.sub_plan;
    if (tier === 'prime' || tier === 'Prime') return false;
    return Store.tierToPoints(tier) > 0;
  };

  LiveSE.prototype.extractSub = function (payload) {
    if (!payload) return null;
    var data = payload.data || payload;
    var event = data.event || data.activity || data;

    if (Array.isArray(event)) event = event[0];
    if (!event || typeof event !== 'object') return null;

    var type = String(data.type || event.type || payload.type || '').toLowerCase();
    if (type && type.indexOf('sub') === -1) return null;

    if (!this.isEligibleSub(event)) return null;
    var tier = event.tier || event.sub_plan || event.subPlan || '1000';
    var pts = Store.tierToPoints(tier);
    if (pts <= 0) return null;
    return {
      points: pts,
      tier: tier,
      name: event.name || event.username || event.displayName || '?'
    };
  };

  LiveSE.prototype.connect = function (cfg) {
    var self = this;
    self.disconnect();
    if (!cfg.seToken || !cfg.seChannelId) return;

    var ws = new WebSocket('wss://astro.streamelements.com');
    self.ws = ws;

    ws.addEventListener('open', function () {});

    ws.addEventListener('message', function (event) {
      var msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }

      if (msg.type === 'welcome') {
        ws.send(JSON.stringify({
          type: 'subscribe',
          nonce: String(Date.now()),
          data: {
            topic: 'channel.activities',
            room: cfg.seChannelId,
            token: cfg.seToken,
            token_type: 'jwt'
          }
        }));
        return;
      }

      if (msg.type === 'message' && msg.topic === 'channel.activities') {
        var sub = self.extractSub(msg);
        if (sub) self.onSub(sub);
      }
    });

    ws.addEventListener('close', function () {
      self.ws = null;
      self.reconnectTimer = setTimeout(function () {
        self.connect(cfg);
      }, 5000);
    });

    ws.addEventListener('error', function () {
      ws.close();
    });
  };

  LiveSE.prototype.disconnect = function () {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  };

  global.HelliasLiveSE = LiveSE;
})(typeof window !== 'undefined' ? window : globalThis);
