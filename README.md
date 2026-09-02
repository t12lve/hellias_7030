# Hellias 70/30 — Widget Plus Points

Widget overlay pour OBS, Streamlabs et StreamElements affichant la progression vers le **70/30 Twitch** (300 Plus Points, hors Prime, hors gifts), avec streak 3 mois et animations.

## Démo GitHub Pages

- Accueil : https://t12lve.github.io/hellias_7030/
- Réglages : https://t12lve.github.io/hellias_7030/settings.html
- Overlay : https://t12lve.github.io/hellias_7030/overlay.html

## Fichiers

| Fichier | Rôle |
|---------|------|
| `overlay.html` | Source navigateur OBS — fond **100 % transparent**, widget seul visible |
| `settings.html` | Réglages, preview damier, test API |
| `js/` | Logique store, API, live SE/SL, widget, animations |
| `css/` | Styles widget + settings |

## Installation OBS

1. Cloner ou copier ce dossier en local.
2. Ouvrir `settings.html` dans un navigateur → renseigner le **Twitch Channel ID**.
3. Dans OBS : **Sources → + → Browser**.
4. Cocher **Local file** → sélectionner `overlay.html`.
5. Dimensions selon la taille choisie :

   | Taille | Largeur | Hauteur |
   |--------|---------|---------|
   | S | 280 | 80 |
   | M | 360 | 100 |
   | L | 440 | 120 |

6. Custom CSS (si le fond n’est pas transparent) :

   ```css
   body { background-color: rgba(0,0,0,0); }
   ```

7. Placer la source dans un coin du layout.

## Streamlabs / StreamElements

- **Streamlabs** : Browser Source → fichier local `overlay.html`, mêmes dimensions.
- **StreamElements** : Custom widget ou Browser Source externe pointant vers le fichier local.

## Données

### API (source de vérité)

Polling de `https://partner-plus.milanitommaso.com/data/{channelId}` toutes les 45 s (configurable).

Réponse exemple : `{"points": 247, "threshold": 350}` — le seuil API est ignoré ; l’objectif par défaut est **300**.

### Source live (optionnelle)

Pour des animations instantanées à chaque sub payé :

| Plateforme | Token | Où le trouver |
|------------|-------|---------------|
| **StreamElements** | JWT + Channel ID | Dashboard SE → avatar → chaîne → copier JWT et ID |
| **Streamlabs** | Socket token | API Streamlabs → `GET /socket/token` |

Seuls les subs **payés récurrents** comptent (T1=1, T2=2, T3=6 pts). Prime et gifts sont filtrés.

Au prochain poll API, le compteur est **réconcilié** avec la valeur officielle.

## Streak 3 mois

L’API ne fournit pas l’historique mensuel. Dans `settings.html` :

- **Mois validés passés** : 0, 1 ou 2 mois déjà au seuil.
- Le mois en cours compte automatiquement si `points ≥ objectif`.
- Affichage : pastilles + `n/3`.

## Transparence alpha

- `html` / `body` : transparent.
- Seul `.widget-shell` a un fond (charcoal + blobs).
- Confetti clippé dans le widget (`canvas-confetti` local).
- Réglage **opacité fond** dans settings (50–100 %).
- Preview settings : damier pour visualiser la zone alpha.

## Animations

- **Level up** : punch scale, flash barre, confetti lime/noir/jaune.
- **Level down** : désaturation légère, skew barre (resync API si points baissent).
- **Preview** : boutons dans settings (widget embarqué, pas d’iframe).
- **Mode démo** : coche dans settings — simule gains/pertes toutes les ~3 s (API/live mis en pause).

## Développement local

Servir le dossier en HTTP local (évite certaines restrictions `file://`) :

```bash
npx serve .
```

Puis ouvrir `http://localhost:3000/settings.html`.

## Sécurité

Les tokens SE/SL sont stockés uniquement dans `localStorage` du navigateur — ne pas committer de config avec tokens.
