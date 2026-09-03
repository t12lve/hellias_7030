# 📖 Mode Opératoire Pas-à-Pas (Spécial Débutant)
## Installer le Thème Hellias 70/30 sur votre Sub Goal Streamlabs

> 💡 **Pas de panique si vous n'avez jamais touché à du code !**  
> Ce guide vous prend par la main de A à Z. Vous avez simplement besoin de faire 3 copier-coller. Aucun outil compliqué n'est nécessaire.

---

## 🎯 Ce que vous allez obtenir
Une barre d'objectif d'abonnements au look **cyberpunk néon** pour votre stream :
- Fond sombre translucide élégant avec effet de lueur néon.
- Jauge de progression animée avec un motif de grille géométrique unique.
- Compteur en direct (`476 / 800`).
- Pastilles de suivi du **Streak 3 mois** (`0/3`, `1/3`, etc.).
- Pulsation lumineuse automatique sur l'écran à chaque nouvel abonnement.

---

## 📋 Étape 1 : Accéder aux réglages dans Streamlabs

1. Ouvrez votre navigateur internet et connectez-vous sur [Streamlabs.com](https://streamlabs.com/dashboard).
2. Dans le menu vertical tout à gauche, cliquez sur **All Widgets** (ou **Tous les widgets** si c'est en français).
3. Cliquez sur **Sub Goal** (ou **Objectif d'abonnements**).
4. *(Optionnel)* Si vous ne l'avez pas encore fait, configurez votre objectif :
   - **Titre de l'objectif** : ex. `Sub Points` ou `Objectif 70/30`.
   - **Montant de l'objectif** : ex. `800` (ou `300`).
   - **Date de fin** : facultatif.
   - Cliquez sur **Démarrer l'objectif** (Start Goal).

---

## 🔘 Étape 2 : Activer le mode "HTML/CSS personnalisés"

1. Faites défiler la page de Streamlabs vers le bas jusqu'à voir l'encart grisé intitulé :  
   **HTML/CSS personnalisés** *(Custom HTML/CSS)*.
2. Cliquez sur le petit interrupteur à droite pour qu'il devienne vert : **Activé** *(Enabled)*.
3. Trois onglets apparaissent alors au-dessus d'une zone noire :  
   `HTML` | `CSS` | `JS`

---

## 📋 Étape 3 : Remplir les 3 onglets (Le fameux Copier-Coller)

### 🔹 Onglet 1 : HTML
1. Cliquez sur l'onglet **HTML** dans Streamlabs.
2. **Effacez tout** ce qui s'y trouve déjà (sélectionnez tout avec `Ctrl + A` puis touche `Suppr`).
3. Copiez l'intégralité du code ci-dessous et collez-le :

```html
<!-- Hellias 70/30 — Streamlabs Sub Goal Custom Widget -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet">

<div class="hellias-goal-shell custom__container" id="hellias-goal">
  <div class="hellias-blobs" aria-hidden="true">
    <div class="hellias-blob"></div>
    <div class="hellias-blob"></div>
  </div>
  
  <div class="hellias-content">
    <div class="hellias-header custom__current-amount">
      <span class="hellias-label custom__title" id="goal-title">Sub Points</span>
      <span class="hellias-counter">
        <span class="current" id="current-amount">0</span>
        <span class="sep">/</span>
        <span class="goal custom__amount" id="target-amount">800</span>
      </span>
    </div>
    
    <div class="hellias-bar-wrap">
      <div class="hellias-bar-track">
        <div class="hellias-bar-fill custom__bar" id="progress-bar" style="width: 0%;"></div>
      </div>
    </div>
    
    <div class="hellias-footer" id="hellias-footer">
      <div class="hellias-streak" id="goal-streak">
        <span class="streak-dot" data-dot="1"></span>
        <span class="streak-dot" data-dot="2"></span>
        <span class="streak-dot" data-dot="3"></span>
        <span class="streak-text" id="goal-streak-text">0/3</span>
      </div>
      <div class="hellias-badge" id="goal-badge" hidden></div>
    </div>
  </div>
</div>
```

---

### 🔹 Onglet 2 : CSS
1. Cliquez sur l'onglet **CSS** dans Streamlabs (juste à côté de HTML).
2. **Effacez tout** ce qui s'y trouve (`Ctrl + A` puis `Suppr`).
3. Copiez tout ce bloc et collez-le :

```css
/* Hellias 70/30 — Thème pour Streamlabs Sub Goal */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Libre+Baskerville:wght@700&display=swap');

:root {
  --accent: #c8ff00; /* Couleur d'accent néon (jaune/vert Hellias) */
  --bg: #1a1a1e;     /* Fond sombre */
  --text: #f0f0f0;   /* Couleur du texte */
  --grid: #000000;   /* Lignes de la grille */
  --bg-opacity: 1;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: transparent !important;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'Consolas', monospace;
  color: var(--text, #f0f0f0);
}

*, *::before, *::after {
  box-sizing: border-box;
}

#wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent !important;
}

.hellias-goal-shell,
.custom__container {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--bg, #1a1a1e) calc(var(--bg-opacity, 1) * 100%), transparent);
  border-radius: 6px;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'Consolas', monospace;
  color: var(--text, #f0f0f0);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hellias-blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.35;
}

.hellias-blob {
  position: absolute;
  border-radius: 50%;
  background: #0d0d10;
  filter: blur(18px);
}

.hellias-blob:nth-child(1) {
  width: 70%;
  height: 90%;
  top: -30%;
  left: -20%;
}

.hellias-blob:nth-child(2) {
  width: 50%;
  height: 60%;
  bottom: -25%;
  right: -10%;
}

.hellias-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hellias-header,
.custom__current-amount {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.hellias-label,
#goal-title,
.custom__title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--text, #f0f0f0);
}

.hellias-counter,
.custom__current-amount span,
.custom__amount {
  font-family: 'IBM Plex Mono', Consolas, monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
}

.hellias-counter .sep {
  opacity: 0.5;
  margin: 0 3px;
}

.current,
#current-amount {
  color: var(--accent, #c8ff00);
}

#target-amount,
.custom__amount {
  opacity: 0.9;
}

.hellias-bar-wrap {
  position: relative;
  width: 100%;
}

.hellias-bar-track {
  position: relative;
  width: 100%;
  height: 18px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hellias-bar-fill,
#progress-bar,
.custom__bar {
  height: 18px;
  background-color: var(--accent, #c8ff00);
  background-image:
    linear-gradient(var(--grid, #000000) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid, #000000) 1px, transparent 1px);
  background-size: 8px 8px;
  background-blend-mode: multiply;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent, #c8ff00) 50%, transparent);
}

.shadow-overlay {
  display: none !important;
}

.hellias-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.hellias-streak {
  display: flex;
  align-items: center;
  gap: 5px;
}

.streak-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}

.streak-dot.filled {
  background: var(--accent, #c8ff00);
  border-color: var(--accent, #c8ff00);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent, #c8ff00) 65%, transparent);
  transform: scale(1.15);
}

.streak-text {
  font-size: 11px;
  opacity: 0.75;
  margin-left: 4px;
}

@keyframes subGlow {
  0% { transform: scale(1); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); }
  30% { transform: scale(1.025); box-shadow: 0 0 24px color-mix(in srgb, var(--accent, #c8ff00) 45%, transparent), 0 8px 24px rgba(0, 0, 0, 0.6); }
  100% { transform: scale(1); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); }
}

.anim-sub {
  animation: subGlow 0.85s ease-out;
}
```

---

### 🔹 Onglet 3 : JS
1. Cliquez sur l'onglet **JS** dans Streamlabs (à droite de CSS).
2. **Effacez tout** ce qui s'y trouve (`Ctrl + A` puis `Suppr`).
3. Copiez tout ce bloc et collez-le :

```javascript
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
    if (title && titleEl) titleEl.textContent = title;
    var numCurrent = Number(current) || 0;
    var numTarget = Number(target) || 800;
    currentPoints = numCurrent;
    targetGoal = numTarget;

    if (currentEl) currentEl.textContent = numCurrent;
    if (totalEl) totalEl.textContent = numTarget;

    var pct = numTarget > 0 ? Math.min(100, Math.max(0, (numCurrent / numTarget) * 100)) : 0;
    if (fillEl) fillEl.style.width = pct + '%';

    // Calcul du streak 3 mois : mois passés + 1 si objectif du mois atteint
    var currentMonthAchieved = numCurrent >= numTarget ? 1 : 0;
    var totalStreak = Math.min(3, pastMonths + currentMonthAchieved);

    if (streakDots && streakDots.length) {
      streakDots.forEach(function (dot, idx) {
        if (idx < totalStreak) dot.classList.add('filled');
        else dot.classList.remove('filled');
      });
    }

    if (streakText) streakText.textContent = totalStreak + '/3';

    if (animate && shellEl) {
      shellEl.classList.remove('anim-sub');
      void shellEl.offsetWidth; // Force le reflow CSS
      shellEl.classList.add('anim-sub');
    }
  }

  // Initialisation au chargement
  document.addEventListener('goalLoad', function (obj) {
    if (!obj || !obj.detail) return;
    var d = obj.detail;
    updateDisplay(d.amount ? d.amount.current : 0, d.amount ? d.amount.target : 800, d.title || 'Sub Points', false);
  });

  // Mise à jour en direct lors d'un sub
  document.addEventListener('goalEvent', function (obj) {
    if (!obj || !obj.detail) return;
    var d = obj.detail;
    updateDisplay(d.amount ? d.amount.current : 0, d.amount ? d.amount.target : targetGoal, null, true);
  });
})();
```

---

## 💾 Étape 4 : Sauvegarder dans Streamlabs

1. Descendez tout en bas de la page des réglages de Streamlabs.
2. Cliquez sur le gros bouton vert **Enregistrer les paramètres** *(Save Settings)*.
3. Remontez tout en haut de la page : à côté de **Widget URL**, cliquez sur le bouton **Copier** *(Copy)*.  
   *(Cette URL ressemble à : `https://streamlabs.com/widgets/sub-goal?token=...`)*.

---

## 📺 Étape 5 : Ajouter le widget dans OBS Studio

1. Lancez **OBS Studio**.
2. Dans le panneau **Sources** en bas, cliquez sur le petit **`+`**.
3. Choisissez **Navigateur** *(Browser)*.
4. Nommez la source : par exemple `Sub Goal Hellias`, puis validez.
5. Dans la fenêtre qui s'ouvre :
   - **URL** : Collez l'URL de Streamlabs que vous venez de copier à l'étape 4.
   - **Largeur** *(Width)* : mettez `460` (ou `500`).
   - **Hauteur** *(Height)* : mettez `120` (ou `140`).
   - Cochez **"Actualiser le navigateur lorsque la scène devient active"**.
   - Cliquez sur **OK**.
6. Placez la barre où vous voulez sur votre écran de stream !

---

## 🎨 Personnaliser la couleur néon (Optionnel)

Par défaut, la couleur néon est le **jaune/vert néon Hellias** (`#c8ff00`).  
Si vous préférez du rose, du bleu cyan ou du violet :
1. Dans Streamlabs, retournez sur l'onglet **CSS**.
2. À la ligne 5, remplacez simplement `#c8ff00` par le code couleur de votre choix :
   - Rose bonbon : `--accent: #ff2d95;`
   - Bleu cyan / Tron : `--accent: #00e5ff;`
   - Violet synthwave : `--accent: #bd00ff;`
   - Vert émeraude : `--accent: #00ff88;`
   - Orange braise : `--accent: #ff6600;`
3. Cliquez sur **Enregistrer les paramètres** en bas de page.

---

## ❓ FAQ & Dépannage rapide

### Le fond n'est pas transparent ?
Vérifiez dans les propriétés de la source navigateur OBS que le champ *CSS personnalisé* contient bien :
```css
body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }
```

### Les textes sont coupés ?
Augmentez légèrement la largeur dans les propriétés de la source OBS (ex. passez de `460` à `480` ou `500`).

### Comment tester l'animation ?
Sur le Dashboard Streamlabs, allez sur l'onglet **Widgets**, puis cliquez sur le bouton **Tester les widgets** en haut à droite et choisissez **Abonnement**. Vous verrez votre barre clignoter en néon dans OBS !
