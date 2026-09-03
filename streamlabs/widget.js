// Hellias 70/30 — Streamlabs Sub Goal Custom Widget Script
(function () {
  'use strict';

  var currentPoints = 0;
  var targetGoal = 800;
  var pastMonths = 0; // Mois passés validés (0-2)

  var titleEl = document.getElementById('goal-title');
  var currentEl = document.getElementById('current-amount') || document.getElementById('goal-current');
  var totalEl = document.getElementById('target-amount') || document.getElementById('goal-total');
  var fillEl = document.getElementById('progress-bar') || document.getElementById('goal-bar-fill');
  var shellEl = document.getElementById('hellias-goal') || document.querySelector('.custom__container');
  var streakDots = document.querySelectorAll('.streak-dot');
  var streakText = document.getElementById('goal-streak-text');
  var footerEl = document.getElementById('hellias-footer');

  function updateDisplay(current, target, title, animate) {
    if (title && titleEl) {
      titleEl.textContent = title;
    }

    var numCurrent = Number(current) || 0;
    var numTarget = Number(target) || 800;
    currentPoints = numCurrent;
    targetGoal = numTarget;

    if (currentEl) currentEl.textContent = numCurrent;
    if (totalEl) totalEl.textContent = numTarget;

    var pct = numTarget > 0 ? Math.min(100, Math.max(0, (numCurrent / numTarget) * 100)) : 0;
    if (fillEl) {
      fillEl.style.width = pct + '%';
    }

    // Calcul du streak 3 mois : mois passés validés + 1 si l'objectif actuel est atteint
    var currentMonthAchieved = numCurrent >= numTarget ? 1 : 0;
    var totalStreak = Math.min(3, pastMonths + currentMonthAchieved);

    if (streakDots && streakDots.length) {
      streakDots.forEach(function (dot, idx) {
        if (idx < totalStreak) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    }

    if (streakText) {
      streakText.textContent = totalStreak + '/3';
    }

    if (animate && shellEl) {
      shellEl.classList.remove('anim-sub');
      void shellEl.offsetWidth; // Force le reflow CSS pour rejouer l'animation
      shellEl.classList.add('anim-sub');
    }
  }

  // Streamlabs onWidgetLoad (pour les Custom Fields)
  window.addEventListener('onWidgetLoad', function (obj) {
    if (obj && obj.detail && obj.detail.fieldData) {
      var fd = obj.detail.fieldData;
      if (fd.streakPast !== undefined && fd.streakPast !== '') {
        pastMonths = parseInt(fd.streakPast, 10) || 0;
      }
      if (fd.showStreak === 'no' || fd.showStreak === false) {
        if (footerEl) footerEl.style.display = 'none';
      } else {
        if (footerEl) footerEl.style.display = 'flex';
      }
      if (fd.customTitle && titleEl) {
        titleEl.textContent = fd.customTitle;
      }
    }
  });

  // Streamlabs goalLoad (chargement initial du widget)
  document.addEventListener('goalLoad', function (obj) {
    if (!obj || !obj.detail) return;
    var d = obj.detail;
    var title = d.title || 'Sub Points';
    var current = d.amount ? d.amount.current : 0;
    var target = d.amount ? d.amount.target : 800;
    updateDisplay(current, target, title, false);
  });

  // Streamlabs goalEvent (mise à jour lors d'un nouvel abonnement)
  document.addEventListener('goalEvent', function (obj) {
    if (!obj || !obj.detail) return;
    var d = obj.detail;
    var current = d.amount ? d.amount.current : 0;
    var target = d.amount ? d.amount.target : targetGoal;
    updateDisplay(current, target, null, true);
  });

  // Fallback / Initialisation si ouvert directement hors environnement Streamlabs
  if (!window.__streamlabsInit) {
    updateDisplay(476, 800, 'Sub Points', false);
  }
})();
