# Robot d'Orion

Un « joueur robot » qui garde le jeu ouvert 24 h sur 24 : combats, retours de flottes, raids et Seigneurs avancent même quand personne n'est connecté. Il n'a pas d'empire, n'apparaît dans aucune liste et ne reçoit aucun rapport.

## Comment ça marche

- `robot.mjs` ouvre `https://renwardesk.github.io/couronne-orion/?robot=1` dans un Chromium invisible (Playwright) et se connecte avec son propre compte.
- Le compte est créé automatiquement à la première connexion si le pseudo n'existe pas encore.
- Toutes les minutes, il vérifie que le jeu résout bien (`window.__robotBeat`). S'il bloque plus de 5 min, il relance le navigateur. Il redémarre aussi de lui-même toutes les 12 h.
- Les mises à jour du jeu sont prises automatiquement (la page se recharge comme chez les joueurs).

## Variables (à mettre chez l'hébergeur, jamais dans le dépôt)

| Variable | Exemple | Rôle |
|---|---|---|
| `ROBOT_PSEUDO` | `robot-orion` | pseudo du compte du robot (ne pas fonder d'empire avec) |
| `ROBOT_PASS` | (long mot de passe) | mot de passe du compte |
| `ORION_URL` | facultatif | autre adresse du jeu, pour un test |

## Hébergement conseillé : Railway (sans terminal)

1. Se connecter sur railway.com avec son compte GitHub.
2. **New Project → Deploy from GitHub repo** → choisir `couronne-orion`.
3. Dans le service : **Settings → Root Directory** = `robot` (Railway trouve le `Dockerfile`).
4. **Variables** : ajouter `ROBOT_PSEUDO` et `ROBOT_PASS`.
5. Déployer. Dans **Logs**, on doit voir `connecté, le jeu tourne`, puis une ligne par minute.

## Autre option : un petit serveur Linux (Hetzner, OVH…)

```sh
sudo apt update && sudo apt install -y docker.io git
git clone https://github.com/renwardesk/couronne-orion.git && cd couronne-orion/robot
sudo docker build -t orion-robot .
sudo docker run -d --restart=always --name orion-robot -e ROBOT_PSEUDO=robot-orion -e ROBOT_PASS='...' orion-robot
sudo docker logs -f orion-robot
```
