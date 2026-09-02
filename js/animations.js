(function (global) {
  'use strict';

  var confettiInstance = null;
  var plusLevelUpActive = false;

  function Animations(shellEl, fillEl, counterEl) {
    this.shell = shellEl;
    this.fill = fillEl;
    this.counter = counterEl;
    this.label = shellEl ? shellEl.querySelector('.widget-label') : null;
    this.canvas = shellEl ? shellEl.querySelector('.widget-confetti-canvas') : null;
    this.fxLayer = shellEl ? shellEl.querySelector('.widget-fx-layer') : null;
    this.lastMilestoneFloor = 0;
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
    return [accent, '#ffff00', '#ff2d95', '#00e5ff', '#ffffff', '#000000', accent];
  };

  Animations.prototype.clearFx = function () {
    if (this.fxLayer) this.fxLayer.innerHTML = '';
  };

  Animations.prototype.fireConfetti = function (opts) {
    if (!confettiInstance) return;
    confettiInstance(Object.assign({
      colors: this.getThemePalette(),
      ticks: 100,
      gravity: 0.75,
      scalar: 0.85,
      shapes: ['square', 'circle']
    }, opts || {}));
  };

  Animations.prototype.spawnRain = function (density) {
    if (!this.fxLayer) return;
    var count = Math.floor((14 + Math.floor(Math.random() * 8)) * (density || 1));
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

  Animations.prototype.spawnSadEmojis = function (density) {
    if (!this.fxLayer) return;
    var faces = ['\u2639', '\uD83D\uDE22', '\uD83D\uDE14', '\uD83D\uDCA7'];
    var n = Math.floor((2 + Math.floor(Math.random() * 2)) * (density || 1));
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
    if (!this.shell || plusLevelUpActive) return;
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
      this.fireConfetti({ particleCount: burst, spread: 75, startVelocity: 28, origin: { x: 0.15, y: 0.55 } });
      this.fireConfetti({ particleCount: burst, spread: 75, startVelocity: 28, origin: { x: 0.85, y: 0.55 } });
    }
  };

  Animations.prototype.playMilestoneUp = function (intensity) {
    if (!this.shell) return;
    var self = this;
    var scale = Math.max(1, Math.min(2.2, intensity || 1));
    var palette = this.getThemePalette();

    this.clearFx();
    this.shell.classList.remove('state-down', 'anim-level-down');
    this.shell.classList.add('state-up', 'anim-milestone-up');
    setTimeout(function () {
      self.shell.classList.remove('anim-milestone-up');
    }, 900);

    if (global.gsap && this.shell) {
      global.gsap.fromTo(this.shell, { scale: 1 }, {
        scale: 1 + 0.08 * scale,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }

    if (confettiInstance) {
      var burst = Math.floor(35 + 25 * scale);
      this.fireConfetti({ particleCount: burst, spread: 90, startVelocity: 32 + scale * 4, origin: { x: 0.1, y: 0.5 }, scalar: 0.9 + scale * 0.15 });
      this.fireConfetti({ particleCount: burst, spread: 90, startVelocity: 32 + scale * 4, origin: { x: 0.9, y: 0.5 }, scalar: 0.9 + scale * 0.15 });
      setTimeout(function () {
        if (!confettiInstance) return;
        self.fireConfetti({
          particleCount: Math.floor(burst * 0.8),
          spread: 110,
          origin: { x: 0.5, y: 0.3 },
          scalar: 1 + scale * 0.2,
          colors: palette
        });
      }, 150);
    }
  };

  Animations.prototype.playMilestoneDown = function (intensity) {
    if (!this.shell) return;
    var self = this;
    var density = Math.max(1, Math.min(2.2, intensity || 1));

    this.clearFx();
    this.shell.classList.remove('state-up', 'anim-level-up', 'anim-milestone-up');
    this.shell.classList.add('state-down', 'anim-milestone-down');
    this.spawnRain(density);
    this.spawnSadEmojis(density);

    if (global.gsap && this.fill) {
      global.gsap.timeline()
        .to(this.fill, {
          skewX: -8,
          scaleY: 0.85,
          transformOrigin: 'left center',
          filter: 'saturate(0.35) brightness(0.65)',
          duration: 0.35,
          ease: 'power2.in'
        })
        .to(this.fill, {
          skewX: 0,
          scaleY: 1,
          filter: 'saturate(1) brightness(1)',
          duration: 0.45,
          ease: 'power2.out'
        });
    }

    setTimeout(function () {
      self.shell.classList.remove('state-down', 'anim-milestone-down');
      self.clearFx();
    }, 1800);
  };

  Animations.prototype.playDown = function () {
    if (!this.shell || plusLevelUpActive) return;
    var self = this;

    this.clearFx();
    this.shell.classList.remove('state-up', 'anim-level-up', 'anim-milestone-up');
    this.shell.classList.add('state-down', 'anim-level-down');
    this.spawnRain(1);
    this.spawnSadEmojis(1);

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

  Animations.prototype.showLevelUpBanner = function (title, subtitle) {
    if (!this.fxLayer) return null;
    var banner = document.createElement('div');
    banner.className = 'fx-level-up-banner';
    banner.innerHTML =
      '<span class="fx-level-up-title">' + title + '</span>' +
      '<span class="fx-level-up-sub">' + subtitle + '</span>';
    this.fxLayer.appendChild(banner);
    if (global.gsap) {
      global.gsap.fromTo(banner, { opacity: 0, scale: 0.7, y: 8 }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: 'back.out(2.5)'
      });
    }
    return banner;
  };

  Animations.prototype.playPlusLevelUp = function (level) {
    if (!this.shell) return;
    var self = this;
    var isL2 = level >= 2;
    var title = isL2 ? 'Plus Level 2' : 'Plus Level 1';
    var subtitle = isL2 ? '70/30' : '60/40';
    var palette = this.getThemePalette();
    var salvoCount = isL2 ? 5 : 3;

    plusLevelUpActive = true;
    this.clearFx();
    this.shell.classList.remove('state-down', 'anim-level-down', 'anim-milestone-down');
    this.shell.classList.add('state-up', 'anim-plus-level-up');
    if (isL2) this.shell.classList.add('anim-plus-level-up--l2');

    var banner = this.showLevelUpBanner(title, subtitle);

    if (global.gsap) {
      global.gsap.fromTo(this.shell, { scale: 1 }, {
        scale: isL2 ? 1.12 : 1.1,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
      if (this.fill) {
        global.gsap.fromTo(this.fill, {
          filter: 'brightness(3) saturate(2)',
          width: '100%'
        }, {
          filter: 'brightness(1.2) saturate(1.3)',
          duration: 1.2,
          ease: 'power2.out'
        });
      }
      if (this.label) {
        global.gsap.fromTo(this.label, { color: '#ffffff', scale: 1 }, {
          color: palette[0],
          scale: 1.08,
          duration: 0.6,
          yoyo: true,
          repeat: 2
        });
      }
    }

    if (confettiInstance) {
      var origins = [
        { x: 0.08, y: 0.55 },
        { x: 0.92, y: 0.55 },
        { x: 0.5, y: 0.25 },
        { x: 0.25, y: 0.4 },
        { x: 0.75, y: 0.4 }
      ];
      for (var i = 0; i < salvoCount; i++) {
        (function (idx) {
          setTimeout(function () {
            var burst = isL2 ? 55 + idx * 8 : 40 + idx * 6;
            self.fireConfetti({
              particleCount: burst,
              spread: 80 + idx * 8,
              startVelocity: 30 + idx * 3,
              origin: origins[idx % origins.length],
              scalar: isL2 ? 1.1 + idx * 0.08 : 0.95 + idx * 0.06
            });
          }, idx * 180);
        })(i);
      }
      if (isL2) {
        setTimeout(function () {
          self.fireConfetti({
            particleCount: 80,
            spread: 120,
            origin: { x: 0.5, y: 0.45 },
            scalar: 1.4,
            startVelocity: 38
          });
        }, salvoCount * 180 + 100);
      }
    }

    setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      self.shell.classList.remove('anim-plus-level-up', 'anim-plus-level-up--l2', 'state-up');
      plusLevelUpActive = false;
    }, 2500);
  };

  Animations.prototype.playStreakGain = function () {
    if (!confettiInstance || plusLevelUpActive) return;
    this.fireConfetti({
      particleCount: 45,
      spread: 100,
      origin: { x: 0.2, y: 0.5 },
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

  Animations.prototype.resetMilestone = function (points) {
    this.lastMilestoneFloor = Math.floor(Math.max(0, Number(points) || 0) / 30) * 30;
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

  Animations.prototype.isPlusLevelUpActive = function () {
    return plusLevelUpActive;
  };

  global.HelliasAnimations = Animations;
})(typeof window !== 'undefined' ? window : globalThis);
