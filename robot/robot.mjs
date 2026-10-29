// Robot d'Orion : ouvre le jeu dans un navigateur invisible, se connecte avec son propre compte (sans empire)
// et le laisse tourner 24 h sur 24 pour que combats, retours, raids et Seigneurs avancent même quand personne ne joue.
// Identifiants : variables d'environnement ROBOT_PSEUDO et ROBOT_PASS (jamais dans le dépôt).
import { chromium } from 'playwright';

const URL = process.env.ORION_URL || 'https://renwardesk.github.io/couronne-orion/?robot=1';
const PSEUDO = process.env.ROBOT_PSEUDO, PASS = process.env.ROBOT_PASS;
if (!PSEUDO || !PASS) { console.error('ROBOT_PSEUDO et ROBOT_PASS doivent être définis.'); process.exit(1); }
const log = (...a) => console.log(new Date().toISOString(), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function session() {
  const browser = await chromium.launch({ args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    page.on('pageerror', e => log('erreur page :', e.message));
    await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => typeof window.__robotReady === 'function' && window.__robotReady(), null, { timeout: 90000 });
    const r = await page.evaluate(([p, w]) => window.__robotLogin(p, w), [PSEUDO, PASS]);
    if (r !== 'ok') throw new Error('connexion refusée : ' + r);
    log('connecté, le jeu tourne');
    const start = Date.now();
    for (;;) {
      await sleep(60000);
      const st = await page.evaluate(() => ({ beat: window.__robotBeat || 0, v: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '?' })).catch(() => null);
      if (!st) throw new Error('page perdue');
      const age = Date.now() - st.beat;
      log(`version ${st.v} · dernière résolution il y a ${Math.round(age / 1000)} s`);
      if (age > 5 * 60000) throw new Error('plus de résolution depuis 5 min');
      if (Date.now() - start > 12 * 3600e3) { log('redémarrage de routine (12 h)'); return; }
    }
  } finally { await browser.close().catch(() => {}); }
}

for (;;) {
  try { await session(); } catch (e) { log('problème :', e.message, '· nouvel essai dans 30 s'); await sleep(30000); }
}
