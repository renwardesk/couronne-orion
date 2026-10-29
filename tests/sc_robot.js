// mode robot : un appareil sans empire fait avancer le jeu (arrivées, combats de boss, Seigneurs) sans apparaître nulle part
const P1=window.__P1;await T.tick(2);
const ME0=ME;ME='rb1';ROBOT=true;S.players.rb1={kind:'player',uid:'rb1',name:'Robot d’Orion',robot:true,joined:0,cmds:[]};
T.ok(!humanIds().includes('rb1')&&!allPlayers().includes('rb1'),'le robot n’est ni un empire ni un destinataire');
T.ok(!/Robot/.test(onlinePill()),'absent de la liste en ligne');
// une attaque de u1 sur un repaire arrive : c'est le robot qui la résout
const tgt=Object.keys(RAIDS).find(k=>!RAIDS[k].boss&&!RAIDS[k].bounty&&!RAIDS[k].mid&&galOf(k)===galOf(P1));
const now=Date.now();S.fleets.RF={kind:'fleet',fid:'RF',owner:'u1',from:P1,to:tgt,mission:'attack',ships:{fighter:20000,cruiser:6000,battleship:2000},cargo:{m:0,c:0,f:0},depart:now-HR,arrive:now-1000,phase:'out',spied:[]};T.sync();
for(let i=0;i<40&&!(S.fleets.RF&&S.fleets.RF.phase!=='out'&&S.fleets.RF.phase!=='battle');i++){T.adv(30e3);await T.tick(2);await sleep(10)}
const f=S.fleets.RF;T.ok(!f||f.phase==='hold'||f.phase==='back','attaque résolue par le robot ('+(f?f.phase:'supprimée')+')');
T.ok(S.reports.some(r=>(r.to||[]).includes('u1')&&/anéantis|repoussé|abattu/.test(r.title||'')),'le joueur reçoit son rapport');
T.ok(!S.reports.some(r=>(r.to||[]).includes('rb1')),'aucun rapport adressé au robot');
BOT_T=0;await T.tick(2);T.ok(typeof window.__robotBeat==='number'&&Date.now()-window.__robotBeat<60e3,'battement du robot à jour');
ME=ME0;ROBOT=false;delete S.players.rb1;
