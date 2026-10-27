// appel à l'aide : les alliés voient l'attaque et la défense de la planète menacée
const P1=window.__P1,now=Date.now();
const P3=Object.keys(PLANETS).find(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!isBody(k)&&galOf(k)===galOf(P1));
S.planets[P3]={...S.planets[P1],pid:P3,owner:'u3',capital:false,ships:{...zeroShips(),fighter:400,cruiser:90},lv:{...S.planets[P1].lv,def:3,shld:2,mines:1},bq:[],shipQ:[]};
S.fleets.hA={fid:'hA',owner:'u2',from:'x',to:P3,mission:'attack',phase:'out',depart:now,arrive:now+9e5,ships:{fighter:500,cruiser:120},cargo:{m:0,c:0,f:0},spied:['u3']};
S.players.u3={...S.players.u3,help:{pid:P3,fid:'hA',arrive:now+9e5,at:now}};T.sync();
const h=helpHtml(),txt=h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
T.L('   ',txt.slice(0,400));
T.ok(/Appels à l’aide/.test(txt)&&/Scorpius/.test(txt),'appel de Scorpius visible');
T.ok(/500 chasseurs|500/.test(txt)&&/120/.test(txt),'composition de l’attaque partagée (espionnée par Scorpius)');
T.ok(/Scorpius possède/.test(txt)&&/12 tourelles/.test(txt)&&/bouclier niv\. 2/.test(txt)&&/mines niv\. 1/.test(txt),'défense de la planète partagée (vaisseaux, tourelles, bouclier, mines)');
T.ok(/Chance de tenir/.test(txt)&&/\d+ %/.test(txt),'chance de tenir affichée');
T.ok(/Envoyer un renfort/.test(h)&&!/Demander de l’aide/.test(h)&&/Ton trajet/.test(txt),'boutons de l’allié : renfort / interception, et trajet');
// non espionnée : inconnue
S.fleets.hA.spied=[];T.sync();T.ok(/n’a pas été espionnée/.test(helpHtml()),'attaque non espionnée : composition inconnue');
// appel lancé par moi : le rapport contient le détail
delete S.players.u3.help;delete S.fleets.hA;
S.fleets.hB={fid:'hB',owner:'u2',from:'x',to:P1,mission:'attack',phase:'out',depart:now,arrive:now+9e5,ships:{fighter:200,cruiser:40},cargo:{m:0,c:0,f:0},spied:['u1']};T.sync();
await callHelp('hB');await sleep(30);
const rp=S.reports.find(r=>/demande de l’aide/.test(r.title||''));T.L('   ',rp&&rp.lines.join(' / '));
T.ok(rp&&rp.lines.some(l=>/^Ennemis : 200 chasseurs/.test(l))&&rp.lines.some(l=>/^Défense :/.test(l))&&rp.lines.some(l=>/Chance de tenir estimée : \d+ %/.test(l)),'rapport d’appel : attaque, défense et chance de tenir');
delete S.fleets.hB;delete S.planets[P3];T.sync();
