# Couronne d'Orion

Jeu de conquête spatiale multijoueur entre amis, installable sur iPhone comme une application (PWA).
Base de données et comptes : **Supabase** (projet `sbymnsyjnbkdvdjrohza`).

## Mise en route (une seule fois)

1. **Supabase → SQL Editor → New query** : colle tout le contenu de `supabase-setup.sql`, puis **Run**.
2. **Supabase → Authentication → Sign In / Providers → Email** : laisse *Email* activé et **désactive « Confirm email »**, puis **Save**
   (les joueurs utilisent un pseudo, pas une vraie adresse e-mail).
3. **GitHub → Settings → Pages** : *Deploy from a branch* → `main` / `/ (root)` → **Save**.
4. Le jeu est en ligne sur `https://renwardesk.github.io/couronne-orion/`.

## Installer sur iPhone

Ouvre l'adresse dans **Safari** → bouton **Partager** → **Sur l'écran d'accueil**.

## Comptes

Chaque joueur crée un compte avec un **pseudo** et un **mot de passe** (6 caractères minimum).
Mot de passe oublié : Supabase → Authentication → Users → retrouve `pseudo@joueurs.couronne-orion.app` → supprime le compte (le joueur le recrée) ou change son mot de passe.

## Fichiers

- `index.html` : le jeu complet.
- `supabase-config.js` : adresse du projet et clé publique.
- `supabase-setup.sql` : table, sécurité et temps réel, à exécuter une fois.
- `manifest.webmanifest`, `sw.js`, `icons/` : installation sur l'écran d'accueil.
