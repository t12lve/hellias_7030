(function (global) {
  'use strict';

  var Store = global.HelliasStore;

  function LiveSL(onSub) {
    this.onSub = onSub || function () {};
    this.socket = null;
    this.scriptLoaded = false;
  }

  LiveSL.prototype.loadSocketIo = function () {
    if (this.scriptLoaded || global.io) {
      return Promise.resolve();
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js';
      s.onload = function () {
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    }).then(function () {
      this.scriptLoaded = true;
    }.bind(this));
  };

  LiveSL.prototype.isEligibleSub = function (msg) {
    if (!msg) return false;
    if (msg.gifted || msg.is_gift || msg.isGift) return false;
    var plan = msg.sub_plan || msg.tier;
    if (plan === 'Prime' || plan === 'prime') return false;
    return Store.tierToPoints(plan) > 0;
  };

  LiveSL.prototype.extractSub = function (eventData) {
    if (!eventData || eventData.for !== 'twitch_account') return null;
    if (eventData.type !== 'subscription') return null;
    var messages = eventData.message;
    if (!Array.isArray(messages) || !messages.length) return null;
    var msg = messages[0];
    if (!this.isEligibleSub(msg)) return null;
    var tier = msg.sub_plan || msg.tier || '1000';
    var pts = Store.tierToPoints(tier);
    if (pts <= 0) return null;
    return { points: pts, tier: tier, name: msg.name || '?' };
  };

  LiveSL.prototype.connect = function (cfg) {
    var self = this;
    self.disconnect();
    if (!cfg.slSocketToken) return;

    self.loadSocketIo().then(function () {
      var socket = global.io('https://sockets.streamlabs.com?token=' + encodeURIComponent(cfg.slSocketToken), {
        transports: ['websocket']
      });
      self.socket = socket;

      socket.on('event', function (eventData) {
        var sub = self.extractSub(eventData);
        if (sub) self.onSub(sub);
      });
    }).catch(function () {});
  };

  LiveSL.prototype.disconnect = function () {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  };

  global.HelliasLiveSL = LiveSL;
})(typeof window !== 'undefined' ? window : globalThis);
