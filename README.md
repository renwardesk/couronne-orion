# Couronne d'Orion

Jeu de conquête spatiale multijoueur entre amis, installable sur iPhone comme une application (PWA).

## Mise en route (une seule fois)

1. **Firebase** (console.firebase.google.com)
   - Crée un projet, puis **Firestore Database** (mode production, région `europe-west`).
   - **Authentication** → méthodes de connexion → active **Adresse e-mail/Mot de passe**.
   - **Firestore → Règles** : colle le contenu de `firestore.rules`, puis **Publier**.
   - Paramètres du projet → ajoute une **application Web** → copie le bloc `firebaseConfig` dans `firebase-config.js`.
2. **GitHub Pages** : Settings → Pages → *Deploy from a branch* → `main` / `/ (root)` → Save.
3. Le jeu est en ligne sur `https://renwardesk.github.io/couronne-orion/`.

## Installer sur iPhone

Ouvre l'adresse dans **Safari** → bouton **Partager** → **Sur l'écran d'accueil**.

## Comptes

Chaque joueur crée un compte avec un **pseudo** et un **mot de passe** (6 caractères minimum).
Mot de passe oublié : console Firebase → Authentication → Utilisateurs → retrouve `pseudo@joueurs.couronne-orion.app` → réinitialise ou supprime le compte.

## Fichiers

- `index.html` : le jeu complet.
- `firebase-config.js` : la configuration de ton projet Firebase.
- `firestore.rules` : règles de sécurité à coller dans Firestore.
- `manifest.webmanifest`, `sw.js`, `icons/` : installation sur l'écran d'accueil.
