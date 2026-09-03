# Thème Hellias 70/30 — Widget Sub Goal Streamlabs

Ce dossier contient le code personnalisé à copier-coller dans le widget **Sub Goal** officiel de Streamlabs via l'option **Enable Custom HTML/CSS**.

> 📖 **Débutant ?** Consultez le [**Mode Opératoire Pas-à-Pas pour Débutants**](../MODE_OPERATOIRE.md) avec explications détaillées et conseils de dépannage.

## 🚀 Installation rapide (4 étapes)

### 1. Ouvrir les réglages Sub Goal dans Streamlabs
1. Rendez-vous sur votre [Dashboard Streamlabs](https://streamlabs.com/dashboard).
2. Dans le menu de gauche, cliquez sur **All Widgets** (Tous les widgets) puis sur **Sub Goal** (Objectif de subs).
3. Définissez votre objectif de départ (titre et montant cible).

### 2. Activer le mode Custom HTML/CSS
1. Descendez en bas des paramètres du widget jusqu'à l'option **"Enable Custom HTML/CSS"**.
2. Activez l'interrupteur (passez-le sur **Enabled** / **Activé**).
3. 4 onglets apparaissent : **HTML**, **CSS**, **JS**, et éventuellement **Custom Fields**.

### 3. Copier-coller le code
- **Onglet HTML** : copiez l'intégralité du contenu de [`widget.html`](widget.html) et collez-le.
- **Onglet CSS** : copiez l'intégralité du contenu de [`widget.css`](widget.css) et collez-le.
- **Onglet JS** : copiez l'intégralité du contenu de [`widget.js`](widget.js) et collez-le.
- **Onglet Custom Fields** *(si disponible)* : copiez le contenu de [`customFields.json`](customFields.json).

> 💡 **Astuce** : Vous pouvez également vous rendre sur la page `settings.html` du projet pour copier le code déjà personnalisé avec vos couleurs d'accent favorites en 1 clic !

### 4. Sauvegarder et tester
1. Cliquez sur le bouton vert **Save Settings** en bas de page.
2. Copiez l'URL du widget fournie par Streamlabs (`https://streamlabs.com/widgets/sub-goal?token=...`).
3. Dans OBS : ajoutez une source **Navigateur** (Browser Source) avec cette URL (dimensions recommandées : **460 × 120**).
4. Testez l'animation en direct avec le bouton **Test Widgets** de Streamlabs.

---

## 🧪 Tester en local

Ouvrez le fichier [`test-streamlabs.html`](test-streamlabs.html) dans votre navigateur pour tester les réactions du widget aux nouveaux subs, aux baisses de points et à l'atteinte de l'objectif sur un damier simulant la transparence OBS.

---

## 🎨 Personnalisation des couleurs

Si vous n'utilisez pas l'onglet Custom Fields, vous pouvez modifier directement les variables en tête de `widget.css` :
```css
:root {
  --accent: #c8ff00; /* Jaune/Vert néon Hellias */
  --bg: #1a1a1e;     /* Fond sombre */
  --text: #f0f0f0;   /* Couleur du texte */
  --grid: #000000;   /* Lignes de la grille */
}
```
