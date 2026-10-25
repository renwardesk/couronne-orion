# Couronne d'Orion — fiche de travail pour Claude

Jeu de conquête spatiale multijoueur entre amis (PWA), en phase de test avec de vrais joueurs.
À relire au début de chaque session. Répondre à l'utilisateur **en français**.

## Règles de travail (fixées avec l'utilisateur)

- **Toujours `sh bump.sh` avant chaque déploiement.**
- **Montrer les gros changements visuels avant de publier** (aperçu / exemples d'abord).
- Quand l'utilisateur dit « change rien », « répond moi juste » : on discute seulement, aucune modif.
- **Stats modestes** : pas de bonus démesurés, pas de doublement.
- Bugs qui ont coûté des vaisseaux aux joueurs : **rembourser + message d'explication** dans leurs rapports. Vérifier ensuite les hangars.
- Ne pas modifier les animations du Léviathan et de l'Empereur sans accord.
- « Routes commerciales / postes avancés » : **à discuter**, ne pas implémenter.
- Sécurité :
  - Le dépôt est **public**. N'y mettre ni identifiants de joueurs, ni e-mails, ni clés secrètes.
  - Ne jamais demander la clé `service_role` ni un mot de passe.
  - Les assets téléchargés ne contiennent que des modèles et des textures, jamais d'exécutable.

## Déploiement

1. `sh bump.sh`. Il incrémente `version.json`, `APP_VERSION` dans `index.html` et `CACHE` dans `sw.js`. Les joueurs sont déconnectés et l'appli se recharge en moins de 2 min.
2. `git commit` puis `git push` sur `main`. GitHub Pages sert https://renwardesk.github.io/couronne-orion/.
3. Copier `index.html` vers le scratchpad (`orion.html`) et republier l'artifact d'aperçu, si on l'utilise.

Vérifier la syntaxe avant de pousser : extraire le `<script>` inline principal et lancer `node --check` dessus.

## Architecture

- **`index.html`** contient tout le jeu, avec le JS inline (≈4 000 lignes). Le code est découpé en sections `// ---------- titre ----------` : chercher le titre avec grep plutôt que se fier aux numéros de ligne.
- **`supabase-config.js`** : URL et clé publique. **`supabase/functions/`** : `push-attack`, `push-idle` (notifications push).
- **Base Supabase** : table unique `docs(path, col, data, updated_at)`. Supprimer un doc = mettre `data=null`. Les données sont lisibles et modifiables par tout utilisateur authentifié (RLS simple).
- **Pas de serveur de jeu** : toute la logique tourne chez les clients. `resolveDue()` est appelée à chaque tick par n'importe quel client connecté et résout arrivées, retours, combats et raids.
  - Toute écriture concurrente passe par `locked(path, fn(data, ref))`.
  - `resolveDue` ne fait rien tant que flottes, événements, planètes et joueurs ne sont pas chargés (`S.got.f/e/p/pl`). Sans ce garde-fou, les raids pillards partaient en double.
- Rapports aux joueurs : docs `reports/…`. `push:true` (+ `ptitle`) pour envoyer une notif téléphone.
- Galaxie déterministe (graine) : `PLANETS`, `SYSTEMS`, `galOf(pid)`. Les zones profondes (épaves, trous noirs, sentinelles) ont `deep:true`.

### Fonctions clés (grep par nom)

| Domaine | Fonctions |
|---|---|
| Résolution | `resolveDue`, `arrival`, `homecoming`, `locked` |
| Combat | `fightCtx`, `raidSettle`, `defMods`, `withDef`, `CMDCTX` |
| Combats de boss (plusieurs rounds) | `bossMaxR`, `bossJoin`, `bossRound`, `battleTicks`, `bossBattle`, `activeBattle`, `joinBattle` |
| Force des ennemis | `ENEMY_PCT`, `enemyKind`, `livePW`, `enemyPW`, `enemyPwTick`, `enemyMul`, `raidGarrison`, `lootMul` |
| Pillards | `pillArmy`, `pillardTick` |
| Ralliements | `rallyLaunch`, `rallyPlacesHtml`, `launch0`, `launchHeld`, `joinable` |
| Envoi de flotte | `jumpCost`, `galPos` |
| Commandants | `cmdGridHtml`, `cmdCard`, `cmdWhere`, `cmdLand`, `cmdBusy`, `openChest`, `grantLegend`, `legKey` |
| Carte | `mpLevs`, `mpLoop`, `armadaMark`, `armadaAnim`, `bossTag`, `btWho` |
| Notifs | `visitNotice` (1re visite d'un système ou d'une galaxie, champ `player.firsts`) |

## Décisions de game design déjà prises

- **Force des ennemis indexée sur la flotte moyenne des joueurs** (`ENEMY_PCT`) :
  - meute 5 %, repaire 8 %, horde 12 %
  - Léviathan 25 %, corsaire 25 %, Armada 45 %
  - sentinelle 60 %, légende 90 %, gardien 110 %, Empereur 200 %

  Lissage : au plus +25 % ou −20 % par jour. **Le Léviathan est moins fort que l'Armada et que les sentinelles.**
- **Coût des bâtiments** : il augmente de 75 % par niveau (`bCost`, auparavant 55 %, l'ancien barème reste dans `bCostOld`). Les stocks des joueurs ont été gardés tels quels. Une annulation rembourse ce qui a réellement été payé (`paid` dans la file de construction).
- **Butin des PNJ réduit de 30 %** (`LOOT_K=.7`) : pirates, Écumeurs, boss et épaves. Le pillage entre joueurs n'est pas concerné.
- **Planètes : 20 max** (`MAXP`, 10 → 15 → 20 à la demande de l'utilisateur). Emplacements payés en culture (`slotCost`) : même courbe jusqu'au 10e, **prix doublé du 11e au 15e, triplé à partir du 16e** (choix de l'utilisateur, ×1,5 refusé). Les Seigneurs restent à 8 planètes (`BOT_MAXP`). Avant-postes : 10 max (`MAXO`).
- **Seigneurs d'Orion** (bots, `BOTS`, `botTick`, `botTurn`, `botInit`, uid `orion-1..3`, champ `bot` du doc joueur) : vassaux de l'Empereur, un par planète du Cœur (Bastion, Forge, Arsenal ; Trône et Citadelle restent à l'Empereur). Ils jouent comme des joueurs : constructions, vaisseaux (flotte plafonnée à 1,6 × la flotte moyenne des joueurs, `BOT_PWK`, relevé à la demande de l'utilisateur ; défenses plus hautes : `BOT_DEFK`, renfort unique `boost1` défense/bouclier/mines + flottes ×1,4), colonisation **dans Orion**, chacun son tiers autour du Cœur (`sysSector`, champ `sec`), du centre vers l'extérieur, jamais dans un système où un joueur a une planète (8 planètes max). Les 6 premières colonies, créées dans d'autres galaxies, ont été déplacées une fois (`moved` dans `events/orion-lords`). Ils gardent les bonus de seigneur de système mais sans annonce ni coffre, espionnage toutes les 8 à 16 h, attaques (pillage, ≥ 60 % de chances) seulement après 7 jours (`BOT_PEACE`). Exclus de : force des ennemis, Pillards, contre-attaques de l'Empereur, liste en ligne, visibilité. Leurs planètes ne sont pas des capitales (annexables). **Entraide** (`botWatch`) : dès qu'un joueur lance une attaque sur un seigneur, jusqu'à 2 seigneurs envoient 35 % de leur plus grosse flotte en renfort s'ils arrivent à temps (retour 3 h après) ; l'attaquant est prévenu. **Vengeance** (`bot.rev`) : 1 à 3 h après l'impact, la victime attaque une planète de l'agresseur (≥ 50 % de chances), même pendant la trêve. Équipement simulé : +15 % attaque/PV.
- **Bonus du Cœur** (`coreStats`, `coreProdMul`) : +2 % de production pour tous les joueurs par planète du Cœur tenue par un joueur (`CORE_ALL`), +5 % sur toutes ses planètes pour le détenteur, par planète (`CORE_OWN`, choix de l'utilisateur), Seigneur d'Orion (les 5) : +15 % de production (`CORE_LORD`) et +8 % attaque/PV (`CORE_LORD_ATK`). Encart dans l'onglet Joueurs. Alerte noir/violet avec compte à rebours de la trêve en haut des Actus (`lordsAlertHtml`) ; notifs téléphone à l'arrivée, la veille de la fin de trêve et au début des attaques (champ `warned` de `events/orion-lords`).
- **Pas de cumul Pillards + Écumeurs** : un repaire (`lairInfoAt`) ne s'installe jamais sur une planète tenue par les Pillards (`pill` / `pbase`), et les bases pillardes évitent la planète du repaire.
- **Pillards** : on garde l'ancienne formule de `pillArmy`. Le passage à 15 % a été refusé. Raids personnels toutes les 28 à 48 h (`PILL_MIN`). **Jamais plus d'une attaque pillarde par empire toutes les 18 h** (`PILL_GAP`, `pillReady`, `markPill`, champ `pillLast`), toutes sources confondues : raids, expéditions punitives contre un seigneur de système, raids des bases.
- **Commandants renommables** (`cmdRename`, champ `nick`, bouton ✎ sur la fiche) : `cmdInfo` renvoie le surnom partout, `cmdInfo0` le nom d'origine.
- **Combats de boss longs** : Léviathan 30 rounds (10 min), sentinelles et capitaines légendaires 45 (15 min), gardiens de trou noir et Empereur 60 (20 min). Les renforts arrivés pendant le combat le rejoignent.
- **Étiquette « combat en cours »** : visible seulement en vue système, jamais en vue galaxie ou univers, et elle nomme les combattants.
- **Marqueur Armada** : drapeau orange spectral « B » portant l'emblème du Léviathan, avec un vaisseau fantôme simple en dessous (formes géométriques, **pas un modèle 3D**). Pas de points ni de cercles de raid en vue système.
- **Commandants** :
  - Plusieurs joueurs peuvent avoir le même commandant (doublons autorisés).
  - Un commandant blessé ne part pas en mission.
  - Chasseur de pirates : bonus contre tous les Écumeurs (boss compris, sauf la Ruche), **en attaque seulement**.
  - Gardien : +% d'attaque et de PV à tous les défenseurs.
- **Espace profond** : compté comme une demi-galaxie. L'aller coûte 1 iridium et 0,4 xénite par place de hangar, le retour est gratuit. Le coût est affiché dans la fenêtre d'envoi.
- **Sentinelles des épaves** : elles reviennent **48 h** après leur défaite (`respawnOf`), contre 24 h pour les autres gardiens. Sur la carte, une épave libre propose « Récupérer » et « Coloniser ».
- **Épaves** : en mission Récupérer, le saut coûte moitié prix. Les minerais rares rapportés augmentent avec la soute (×1 jusqu'à 1 500 de soute, jusqu'à ×4).
- **Butin** : il peut dépasser le plafond des entrepôts (choix validé). Le joueur choisit la planète de livraison (« 📦 Butin livré à », champ `drop` de la flotte). Le butin d'une flotte rattachée à un avant-poste va à la capitale.
- **Rappel de ralliement** : notif au chef et aux soutiens 5 min avant le départ (`rallyRemind`, une seule fois). Pas de rappel pour les ralliements de 6 min ou moins.
- **Serveur qui fait avancer le jeu hors ligne** : à discuter plus tard avec l'utilisateur.
- **Ralliements** : un soutien qui arriverait après le départ est refusé. L'interface affiche « ⚠ Trop loin » et nomme les vaisseaux trop lents.
- **Satellites et planètes : un seul propriétaire.** Le premier vaisseau colon arrivé s'installe. Une mission « installer » qui trouve la cible déjà prise par un joueur l'attaque, et l'annexe si elle gagne. Règle confirmée par l'utilisateur (option A) : pas de demi-tour automatique.
- **Jauges de quantité** (`qrHtml`, `qrVal`, attribut `data-qr`) : Chantier (1 → max constructible), fenêtre d'envoi (0 → stock), Empire en **% du maximum de chaque planète** (`S.empP`, `empN`) avec bouton Max. File du chantier : 5 lots (`SQ_MAX`).
- **Points de vie en navigation** (`FLY_HP` 100, `flyDamage`, `flyExplode`, `flyRespawn`, `flyLifeTick`, `flyPeerBoom`) : −8 PV par tir reçu d'un autre pilote, régénération 4 PV/s après 6 s sans être touché. À 0 : explosion, « Vaisseau détruit · Abattu par X », retour à la capitale au bout de 2,2 s avec 3 s de bouclier. Les autres pilotes voient l'explosion (événement `x` du canal) et les PV sur les étiquettes. Rien n'est écrit en base. Test : `flyhp.js` (WebGL logiciel).
- **Planète perdue : bâtiments conservés** (`keepLv`, 3e paramètre de `colonyPlanet`). Quand les Pillards prennent une planète, ou qu'une garnison est vaincue, le doc sans propriétaire garde `lv`. Celui qui la recolonise ou l'annexe retrouve les niveaux. Ulzarri V (Scorpius) restaurée par estimation, Épave δ (wk0-3) : ruines drill 5 / silo 5. Test : `sc_ruins`.
- **Accueil des nouveaux joueurs** (`newcomerRp`, appelé à la fondation de la capitale dans `join`) : notif de bienvenue au nouveau, annonce aux autres (et dans les Actus), menace RP d'un Seigneur d'Orion tiré au sort (`LORD_THREATS`), visible aussi des autres. Test : `sc_welcome`.
- **Résumé « Pendant ton absence »** (`awayHtml`, `S.awayFrom` = dernier `seen` ou retour après 2 h en arrière-plan) : carte en haut de la Base, bilan par catégories + 5 faits marquants. **Rapports regroupés** (`groupReps`) : mêmes titres à moins d'1 h d'écart → une entrée « ×N » dépliable. Test : `sc_away`.
- **Grands projets d'Orion** (`PROJ`, `projGive`, onglet dédié **Projets** `renderProjects`/`projHtml` (raccourci depuis l'Empire), `events/proj-<clé>` avec `got`, `by`, `done`, `top`) : chantiers financés par tous. Balises 60 M + 40 k iridium (trajets dans Orion −10 %), Bouclier 120 M + 60 k ir + 40 k xé (raids pillards −20 %, `pillK`), Portail 300 M + 25 k antimatière (ouvre Céphéide et trajets Orion↔Céphéide −40 % quand les joueurs tiennent ≥ 3 planètes du Cœur, `portalOpen`). Jauge en % du stock de la planète choisie + choix des ressources à envoyer (`pjSel`, puces, rares prises sur la réserve de l'empire). Notif d'explication envoyée une fois à tous (`projIntro`, `events/proj-intro`). Le plus gros contributeur reçoit un titre et un coffre d'or. Sabotage par les Seigneurs (`projSabotage`, −3 %, au plus toutes les 36 h par projet). Test : `sc_proj`.
- **Sélecteur de planète** : préfixe « ⚔ » sur les planètes attaquées. La pastille « attaque » a été retirée (débordait sur mobile).

## Pièges connus

- **Commentaires `//` inline** : le script est très compact, souvent plusieurs instructions par ligne. Un `//` en milieu de ligne avale tout le code qui suit. Mettre les commentaires uniquement en fin de ligne, après la dernière instruction.
- **Téléphone mis en veille en pleine résolution** : au réveil, le code repartait avec des données vieilles de plusieurs minutes et refaisait un combat déjà joué. Par exemple, l'avant-poste de l'Anomalie d'Ontaphe a été effacé de cette façon. Garde-fou `SUSP` / `suspGuard` dans la couche Supabase : après une pause de l'horloge, les écritures des opérations en cours sont refusées. Ne pas contourner ce garde-fou.
- Penser **mobile d'abord** : tout ajout dans les barres ou les sélecteurs doit tenir sur un écran étroit.
- **Chances de victoire affichées** (`winChance`) : chaque affichage doit reprendre exactement les bonus du vrai combat (commandant ennemi via `raidMods`, contexte `withCtx('raid')`, bonus de ralliement `rb`, flottes groupées). Il y a trois endroits : `modalIntel`, `rallyOddsHtml`, `attackCards`. Tests : `sc_odds`, `sc_defodds`.
- Les cotes de victoire en défense incluent les renforts et les flottes en soutien. Les prendre en compte avant de conclure à un bug.
- Tests locaux : `python3 -m http.server 8777` + Playwright (Chromium dans `/opt/pw-browsers/chromium`) avec une base simulée en mémoire.
- **Batterie de tests** dans `tests/` (base simulée et horloge avançable).
  - Lancer `python3 -m http.server 8777` depuis la racine, puis `cd tests && THREE_JS=<chemin de three.min.js r128> NODE_PATH=$(npm root -g) node run.js ui attack build spy colo reinf pvp rally salvage offline wreck remind drop odds defodds slider wkcol lairpill slots bots botmove mapsys ruins botwar misc23 welcome away proj`. Un `return` dans un scénario coupe le résultat : ne pas en mettre. `mapcore.js` : vrais clics sur la carte 3D (Cœur, épaves, trou noir). `edge.js` / `drag.js` : cas limites des jauges et glissement au doigt.
  - `node duo.js` teste deux clients connectés en même temps sur une même base, avec de vrais verrous.
  - **La relancer après toute modification de la logique** (flottes, combats, ressources).
