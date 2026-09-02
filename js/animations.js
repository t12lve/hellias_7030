(function (global) {
  'use strict';

  var confettiInstance = null;

  function Animations(shellEl, fillEl, counterEl) {
    this.shell = shellEl;
    this.fill = fillEl;
    this.counter = counterEl;
    this.label = shellEl ? shellEl.querySelector('.widget-label') : null;
    this.canvas = shellEl ? shellEl.querySelector('.widget-confetti-canvas') : null;
    this.fxLayer = shellEl ? shellEl.querySelector('.widget-fx-layer') : null;
    this.lastMilestone = 0;
    if (this.canvas && global.confetti) {
      confettiInstance = global.confetti.create(this.canvas, {
        resize: true,
        useWorker: false
      });
    }
  }

  Animations.prototype.getAccent = function () {
    if (!this.shell) return '#c8ff00';
    return getComputedStyle(this.shell).getPropertyValue('--accent').trim() || '#c8ff00';
  };

  Animations.prototype.getThemePalette = function () {
    var accent = this.getAccent();
    return [
      accent,
      '#ffff00',
      '#ff2d95',
      '#00e5ff',
      '#ffffff',
      '#000000',
      accent
    ];
  };

  Animations.prototype.clearFx = function () {
    if (this.fxLayer) this.fxLayer.innerHTML = '';
  };

  Animations.prototype.spawnRain = function () {
    if (!this.fxLayer) return;
    var count = 14 + Math.floor(Math.random() * 8);
    for (var i = 0; i < count; i++) {
      var drop = document.createElement('span');
      drop.className = 'fx-rain-drop';
      drop.style.left = (Math.random() * 100) + '%';
      drop.style.animationDuration = (0.45 + Math.random() * 0.35) + 's';
      drop.style.animationDelay = (Math.random() * 0.25) + 's';
      drop.style.opacity = String(0.35 + Math.random() * 0.45);
      drop.style.height = (6 + Math.random() * 10) + 'px';
      this.fxLayer.appendChild(drop);
      drop.addEventListener('animationend', function () {
        if (drop.parentNode) drop.parentNode.removeChild(drop);
      });
    }
  };

  Animations.prototype.spawnSadEmojis = function () {
    if (!this.fxLayer) return;
    var faces = ['\u2639', '\uD83D\uDE22', '\uD83D\uDE14', '\uD83D\uDCA7'];
    var n = 2 + Math.floor(Math.random() * 2);
    for (var i = 0; i < n; i++) {
      var el = document.createElement('span');
      el.className = 'fx-sad-emoji';
      el.textContent = faces[Math.floor(Math.random() * faces.length)];
      el.style.left = (15 + Math.random() * 70) + '%';
      el.style.animationDuration = (1.1 + Math.random() * 0.5) + 's';
      el.style.animationDelay = (i * 0.12) + 's';
      el.style.fontSize = (14 + Math.random() * 6) + 'px';
      this.fxLayer.appendChild(el);
      el.addEventListener('animationend', function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
  };

  Animations.prototype.playUp = function (delta, goal, current) {
    if (!this.shell) return;
    var self = this;
    var palette = this.getThemePalette();
    var accent = palette[0];

    this.clearFx();
    this.shell.classList.remove('state-down', 'anim-level-down');
    this.shell.classList.add('state-up', 'anim-punch', 'anim-level-up');
    setTimeout(function () {
      self.shell.classList.remove('anim-punch', 'anim-level-up');
    }, 700);

    if (global.gsap) {
      if (this.fill) {
        global.gsap.fromTo(this.fill, {
          filter: 'brightness(2.5) saturate(1.8)',
          boxShadow: '0 0 16px ' + accent
        }, {
          filter: 'brightness(1.1) saturate(1.2)',
          boxShadow: '0 0 0px transparent',
          duration: 0.65,
          ease: 'power2.out'
        });
      }
      if (this.label) {
        global.gsap.fromTo(this.label, { color: '#ffffff' }, {
          color: accent,
          duration: 0.35,
          yoyo: true,
          repeat: 2
        });
      }
      if (this.counter) {
        global.gsap.fromTo(this.counter, { scale: 1.15, color: '#ffff00' }, {
          scale: 1,
          color: getComputedStyle(this.shell).getPropertyValue('--text').trim() || '#f0f0f0',
          duration: 0.5,
          ease: 'back.out(2)'
        });
      }
    }

    if (confettiInstance && delta > 0) {
      var burst = Math.min(55, 20 + delta * 10);
      confettiInstance({
        particleCount: burst,
        spread: 75,
        startVelocity: 28,
        origin: { x: 0.15, y: 0.55 },
        colors: palette,
        ticks: 100,
        gravity: 0.75,
        scalar: 0.85,
        shapes: ['square', 'circle']
      });
      confettiInstance({
        particleCount: burst,
        spread: 75,
        startVelocity: 28,
        origin: { x: 0.85, y: 0.55 },
        colors: palette,
        ticks: 100,
        gravity: 0.75,
        scalar: 0.85,
        shapes: ['square', 'circle']
      });
      setTimeout(function () {
        if (!confettiInstance) return;
        confettiInstance({
          particleCount: Math.floor(burst * 0.6),
          spread: 100,
          origin: { x: 0.5, y: 0.35 },
          colors: palette,
          ticks: 80,
          gravity: 0.6,
          scalar: 1.1
        });
      }, 120);
    }

    var pct = goal > 0 ? (current / goal) * 100 : 0;
    var milestone = Math.floor(pct / 25) * 25;
    if (milestone > this.lastMilestone && milestone > 0) {
      this.lastMilestone = milestone;
      if (confettiInstance) {
        confettiInstance({
          particleCount: 40,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: palette,
          ticks: 90,
          scalar: 1.2
        });
      }
    }
  };

  Animations.prototype.playDown = function () {
    if (!this.shell) return;
    var self = this;

    this.clearFx();
    this.shell.classList.remove('state-up', 'anim-level-up');
    this.shell.classList.add('state-down', 'anim-level-down');
    this.spawnRain();
    this.spawnSadEmojis();

    if (global.gsap && this.fill) {
      global.gsap.timeline()
        .to(this.fill, {
          skewX: -6,
          scaleY: 0.88,
          transformOrigin: 'left center',
          filter: 'saturate(0.4) brightness(0.7)',
          duration: 0.3,
          ease: 'power2.in'
        })
        .to(this.fill, {
          skewX: 2,
          scaleY: 0.95,
          duration: 0.35,
          ease: 'power1.inOut'
        })
        .to(this.fill, {
          skewX: 0,
          scaleY: 1,
          filter: 'saturate(1) brightness(1)',
          duration: 0.4,
          ease: 'power2.out'
        });
    }

    if (global.gsap && this.counter) {
      global.gsap.to(this.counter, {
        y: 3,
        opacity: 0.55,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
    }

    setTimeout(function () {
      self.shell.classList.remove('state-down', 'anim-level-down');
      self.clearFx();
    }, 1600);
  };

  Animations.prototype.playStreakGain = function () {
    if (!confettiInstance) return;
    var palette = this.getThemePalette();
    confettiInstance({
      particleCount: 45,
      spread: 100,
      origin: { x: 0.2, y: 0.5 },
      colors: palette,
      ticks: 100,
      scalar: 1.1
    });
    if (this.shell) {
      this.shell.classList.add('anim-level-up');
      var self = this;
      setTimeout(function () {
        self.shell.classList.remove('anim-level-up');
      }, 600);
    }
  };

  Animations.prototype.resetMilestone = function (pct) {
    this.lastMilestone = Math.floor(pct / 25) * 25;
  };

  Animations.prototype.tweenCounter = function (from, to, duration) {
    if (!this.counter || !global.gsap) {
      if (this.counter) this.counter.textContent = String(to);
      return;
    }
    var obj = { val: from };
    global.gsap.to(obj, {
      val: to,
      duration: duration || 0.6,
      ease: 'power2.out',
      onUpdate: function () {
        var el = document.querySelector('.widget-counter .current');
        if (el) el.textContent = Math.round(obj.val);
      }
    });
  };

  global.HelliasAnimations = Animations;
})(typeof window !== 'undefined' ? window : globalThis);
