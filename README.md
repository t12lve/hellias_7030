# Hellias 70/30 — Widget overlay

Widget overlay pour OBS, Streamlabs et StreamElements. Par défaut : **Sub Points** communautaire (Streamlabs Sub Goal). Option : **Plus Points** Twitch (70/30, hors Prime/gifts) avec badge Partner Plus et animation level up.

## Démo GitHub Pages

- Accueil : https://t12lve.github.io/hellias_7030/
- Réglages OBS : https://t12lve.github.io/hellias_7030/settings.html
- Onglet Code Streamlabs : https://t12lve.github.io/hellias_7030/settings.html#streamlabs
- Mode d'emploi pas-à-pas (Aide) : https://t12lve.github.io/hellias_7030/aide.html
- Overlay transparent : https://t12lve.github.io/hellias_7030/overlay.html

## Fichiers

| Fichier / Dossier | Rôle |
|-------------------|------|
| `MODE_OPERATOIRE.md` | **Guide débutant pas-à-pas** pour installer le thème sur Streamlabs |
| `overlay.html` | Source navigateur OBS — fond **100 % transparent**, widget seul visible |
| `settings.html` | Réglages plein écran, preview damier, test API, exporteur Streamlabs |
| `streamlabs/` | **Pack Custom HTML/CSS/JS** pour le widget Sub Goal natif Streamlabs |
| `js/` | Logique store, API, live SE/SL, widget, animations |
| `css/` | Styles widget + settings |

## Deux méthodes d'utilisation

### Méthode 1 : Widget natif Streamlabs Sub Goal (Custom HTML/CSS)
Idéal si vous utilisez déjà le widget Sub Goal de Streamlabs et voulez lui donner le look & feel Hellias 70/30 sans héberger de fichiers.
👉 Consultez le [**Mode Opératoire Débutant (MODE_OPERATOIRE.md)**](MODE_OPERATOIRE.md) pour le tutoriel illustré complet.

1. Allez sur votre **Dashboard Streamlabs → All Widgets → Sub Goal**.
2. Activez **"Enable Custom HTML/CSS"**.
3. Ouvrez `settings.html` et cliquez sur **"Code Streamlabs"** (ou consultez le dossier [`streamlabs/`](streamlabs/README.md)) pour copier-coller les 4 onglets : HTML, CSS, JS et Custom Fields.
4. Sauvegardez et utilisez l'URL Streamlabs dans OBS !

### Méthode 2 : Source Navigateur locale / GitHub Pages (overlay.html)

## Installation OBS

1. Cloner ou copier ce dossier en local.
2. Ouvrir `settings.html` → renseigner token Sub Goal **et/ou** Channel ID Twitch.
3. Dans OBS : **Sources → + → Browser**.
4. Cocher **Local file** → sélectionner `overlay.html`.
5. Dimensions selon la taille choisie :

   | Taille | Largeur | Hauteur |
   |--------|---------|---------|
   | S | 280 | 80 |
   | M | 360 | 100 |
   | L | 440 | 120 |

6. Custom CSS (si le fond n'est pas transparent) :

   ```css
   body { background-color: rgba(0,0,0,0); }
   ```

## Données

### 1. Streamlabs Sub Goal (défaut — Sub Points)

Goal communautaire (ex. 476/800 sur Twitch). Polling de `GET https://streamlabs.com/api/v5/widgets/goals/sub?token=…`

1. Streamlabs Dashboard → **All Widgets** → **Sub Goal**
2. Copier l'URL : `https://streamlabs.com/widgets/sub-goal?token=VOTRE_TOKEN`
3. Coller dans settings → *URL ou token Sub Goal Streamlabs*

### 2. Plus Points API (option — 70/30 officiel)

Polling de `https://partner-plus.milanitommaso.com/data/{channelId}` — Plus Points Twitch.

| Niveau | Split | Seuil |
|--------|-------|-------|
| Level 1 | 60/40 | 100 pts/mois |
| Level 2 | 70/30 | 300 pts/mois |

- **Badge Partner Plus** : option settings, affiche ex. `Plus L2 · 18/300 · 70/30`
- **Level up auto** : animation premium au franchissement de 100 ou 300 Plus Points

### Source live (optionnelle)

| Plateforme | Token | Rôle |
|------------|-------|------|
| **StreamElements** | JWT + Channel ID | Anims instantanées |
| **Streamlabs** | Socket token | Anims instantanées |

Le **Socket Token** ≠ le **token Sub Goal**. Seul le Sub Goal pilote le compteur principal.

## Streak 3 mois

Basé sur les **Plus Points** si Channel ID renseigné, sinon sur le compteur principal.

- **Mois validés passés** : 0, 1 ou 2
- Affichage : pastilles + `n/3`

## Animations

- **Up / Down** : confetti ou pluie + emojis
- **Milestone ±30 pts** : intensité croissante vers le goal
- **Plus Level up** : animation premium L1 (60/40) ou L2 (70/30)
- **Preview** : boutons dans settings (milestone, level up L1/L2)

## Développement local

```bash
npx serve .
```

Puis ouvrir `http://localhost:3000/settings.html`.

## Sécurité

Les tokens sont stockés uniquement dans `localStorage` — ne pas committer de config avec tokens.
