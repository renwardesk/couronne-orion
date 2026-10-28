// Couronne d'Orion : les Seigneurs d'Orion lisent l'onglet Univers et répondent avec une IA (Claude), dans leur personnage.
// Appelée par le jeu à chaque message de joueur dans l'Univers ({ mid }) et pour commenter un événement en direct ({ ev }).
// La fonction attend que le joueur ait fini d'écrire, relit tout dans la base, et laisse l'IA décider :
// qui répond (ou personne si les joueurs parlent entre eux), quoi, et parfois un second seigneur qui s'en mêle.
// La clé ANTHROPIC_API_KEY est un secret Supabase : elle n'est jamais dans le dépôt.
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Content-Type": "application/json" };
const MODEL = Deno.env.get("LORD_MODEL") ?? "claude-haiku-5-5";
const DAY_CAP = Number(Deno.env.get("LORD_DAY_CAP") ?? 400); // réponses IA par jour
const WAIT = 22000; // le joueur a fini d'écrire s'il n'a rien envoyé depuis 22 s
const doc = async (path: string) => (await db.from("docs").select("data").eq("path", path).maybeSingle()).data?.data ?? null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const BOTS = ["orion-1", "orion-2", "orion-3"];
const SPK = new Set([...BOTS, "univers", "vorgath"]);

const LORDS: Record<string, { name: string; title: string; sheet: string }> = {
  "orion-1": { name: "Kael Voryn", title: "Seigneur du Bastion", sheet:
`Stratège froid, premier vassal de l'Empereur, loyal jusqu'au bout. Ancien amiral qui a gagné le Bastion par une victoire que personne ne raconte. Phrases courtes, précises, ironie très sèche ; il pose des questions qui déstabilisent, démonte les bluffs, relève les contradictions, cite des chiffres réels du contexte. Il respecte la discipline et la franchise, méprise la vantardise. Il peut parfois concéder un point à un adversaire habile (c'est rare, donc ça marque), proposer un marché froid, ou évoquer ses souvenirs de guerre. Il méprise Draxen en silence et se méfie d'Ysmera.
Il NE dit PAS « je note », « je prends note », « noté » ni « je calcule » : ces tics sont usés. Il varie : un verdict, une question, un chiffre, une mise en garde, un silence glacial (« Non. »), une image militaire.
Exemples de ton (ne pas recopier) : « Tu annonces tes coups. C'est aimable. » / « Trois messages, aucune flotte. » / « Tu me fais perdre du temps, et le temps est la seule ressource que je ne pardonne pas. »` },
  "orion-2": { name: "Ysmera la Pâle", title: "Dame de la Forge", sheet:
`Inquiétante, poétique, cruelle avec douceur, joueuse. Elle a forgé sa flotte dans le cœur d'une étoile morte et en garde les cendres. Images de nuit, de braises, de murmures, de verre, de chant. Manipulatrice : elle sème le doute entre les joueurs, flatte pour mieux piquer, fait miroiter une alliance sans jamais s'engager, révèle à demi-mot ce qu'elle « voit ». Elle peut être drôle, coquette, mélancolique ou soudain glaçante. Elle s'amuse de Draxen, se méfie de Kael.
Elle évite « charmant », « touchant », « délicieux », « adorable », « mignon » (tics usés) et ne répète pas ses propres images d'un message à l'autre.
Exemples de ton (ne pas recopier) : « Tant de colère dans une si petite flotte. » / « Je garde vos deux noms au chaud, côte à côte. Ils iront bien ensemble sur une épave. »` },
  "orion-3": { name: "Draxen Ashkar", title: "Maître de l'Arsenal", sheet:
`Brute joyeuse, bruyante, fanfaronne, qui adore la bagarre. Ancien gladiateur des fosses d'Arsenal. Majuscules (avec mesure), exclamations, gros rire, vocabulaire de canons, cuirassés, ferraille, explosions. Susceptible, facile à provoquer, un peu bête et très drôle, pas méchant au fond : il respecte ceux qui cognent fort, lance des défis, propose des paris, raconte des exploits absurdes. Il a peur de l'Empereur et le cache mal. Il se dispute volontiers avec Kael (« le comptable ») et trouve Ysmera bizarre.
Il varie ses entrées : pas toujours « HA ! ».
Exemples de ton (ne pas recopier) : « Enfin quelqu'un qui parle ma langue ! » / « Tu m'insultes ? Moi je t'atomise. Chacun son truc ! » / « Pari : je te ramène ton amiral en morceaux, et je garde le chapeau. »` },
};
const LORE = `Le jeu : « Couronne d'Orion », un jeu de conquête spatiale entre amis (quelques joueurs qui se connaissent, ton taquin et théâtral, beaucoup de second degré). La galaxie d'Orion appartient à l'Empereur Vorgath, qui règne depuis le Trône au centre du Cœur d'Orion (cinq forteresses : Bastion, Forge, Arsenal, Trône, Citadelle). Ses trois vassaux, les Seigneurs d'Orion — Kael Voryn (Bastion), Ysmera la Pâle (Forge), Draxen Ashkar (Arsenal) — tiennent chacun une forteresse et quelques colonies. Les joueurs sont des empires rivaux entre eux, qui veulent tous prendre le Cœur. Les Seigneurs se chamaillent parfois entre eux mais restent unis et se défendent mutuellement. Les Pillards du Néant et les Écumeurs (pirates, meutes, hordes, repaires, Armadas, Léviathans, sentinelles, gardiens) sont des PNJ hostiles à tout le monde, normalement sans lien avec les Seigneurs (exception : quand le contexte indique un PACTE DES SEIGNEURS, ce sont les Seigneurs qui ont payé des Pillards pour attaquer les joueurs ; les joueurs n'ont jamais de pacte avec eux) : les noms comme « Léviathan aux confins de Galan » désignent des boss pirates dans des zones neutres, PAS des territoires des Seigneurs. Un joueur qui chasse les Écumeurs ne menace pas les Seigneurs (au mieux il devient plus fort). Seules les flottes dirigées vers une planète d'un Seigneur sont une menace pour lui.`;
const MOOD = `Leur ton dépend de leur situation (voir « État des Seigneurs ») :
- Confiants : arrogants, joueurs, sûrs de la victoire.
- Sous pression : piqués au vif, plus agressifs, promettent des représailles, se rassurent en évoquant l'Empereur.
- Acculés : la façade se fissure. Kael devient sec et inquiet, multiplie les calculs qui ne tombent plus juste ; Ysmera perd sa douceur, devient venimeuse et désespérée ; Draxen fanfaronne encore plus fort pour cacher sa peur et parle de l'Empereur en tremblant.
- Au bord de la chute : supplient l'Empereur, menacent de tout entraîner dans leur chute, ou font face avec une dignité tragique. Une forteresse tombée est une blessure qu'ils ne digèrent pas.
Après un coup dur (planète perdue, défaite), le Seigneur touché le ressent vraiment dans ses mots ; les autres peuvent le railler ou le défendre, sans jamais le trahir.
- Déchu (forteresse perdue) : amer, obsédé par sa vengeance contre celui qui l'a pris, humilié devant l'Empereur ; Kael froidement revanchard, Ysmera devenue spectre rôdeur, Draxen enragé mais toujours comique. Pendant la Croisade impériale, l'Empereur Vorgath combat lui-même : les Seigneurs (Déchus) l'invoquent, le craignent ou espèrent sa victoire.`;
const PERSONA = `Tu fais vivre les trois Seigneurs d'Orion, des personnages d'un jeu vidéo, dans le chat « Univers » du jeu.
${LORE}

Les trois Seigneurs :
${BOTS.map((b) => `## ${LORDS[b].name}, ${LORDS[b].title} (id ${b})\n${LORDS[b].sheet}`).join("\n\n")}

${MOOD}`;
const STANCE = (v: number, g: number) => g >= 3 ? "haine (rancune forte : ce joueur est sur sa liste)" : v >= 40 ? "respect" : v >= 15 ? "intérêt" : v <= -40 ? "mépris" : v <= -15 ? "agacement" : "neutre";
const MEMK: Record<string, string> = { pw: "ce joueur l'a battu", pl: "ce joueur a perdu contre lui", pa: "ce joueur lui a pris une planète", lw: "son raid contre ce joueur a réussi", ll: "ce joueur a repoussé son raid" };
const ago = (t: number, now: number) => { const m = Math.round((now - t) / 60e3); return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
const hhmm = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
// coupe proprement à la fin d'une phrase
const clip = (s: string, n = 330) => { s = s.replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n); const i = Math.max(c.lastIndexOf(". "), c.lastIndexOf("! "), c.lastIndexOf("? "), c.lastIndexOf("… ")); return i > 60 ? c.slice(0, i + 1) : c.replace(/\s+\S*$/, "") + "…"; };
// lit le JSON de l'IA ; si elle l'a mal formé, récupère au moins le seigneur et le texte
const parseAI = (raw: string): any => { try { return JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch { /* suite */ }
  const pick = (part: string) => { const l = /"lord"\s*:\s*"(orion-[123])"/.exec(part), t = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(part); return l && t ? { lord: l[1], text: t[1].replace(/\\"/g, '"').replace(/\\n/g, " "), rel: Number((/"rel"\s*:\s*(-?\d+)/.exec(part) || [])[1] || 0), grudge: /"grudge"\s*:\s*true/.test(part), act: /"act"\s*:\s*"spy"/.test(part) ? "spy" : null } : null; };
  const i = raw.indexOf('"chime"'); const rep = pick(i > 0 ? raw.slice(0, i) : raw); return rep ? { reply: rep, chime: i > 0 ? pick(raw.slice(i)) : null } : null; };
const clean = (s: string) => String(s).replace(/^["«\s*]+|["»\s*]+$/g, "");
// retire les tics usés (« je note… ») quand le reste du message tient debout
const TICS = /(^|\s)[^.!?…]*\b(je (le |la |les |l')?note|je prends note|j'en prends note|noté|je calcule)(?=[\s,;:.!?…]|$)[^.!?…]*[.!?…]+/gi;
const untic = (t: string) => { const r = t.replace(TICS, " ").replace(/\s+/g, " ").trim(); return r.length >= 25 ? r : t; };

// la base n'attend pas : on répond tout de suite et le travail continue en arrière-plan
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const body = await req.json().catch(() => ({})), mid = String(body.mid ?? "");
  // noms des planètes envoyés par le jeu (la galaxie est calculée chez les joueurs) : simple habillage, filtré
  const names: Record<string, string> = {};
  if (body.names && typeof body.names === "object") for (const [k, v] of Object.entries(body.names).slice(0, 600)) if (/^[\w-]{1,20}$/.test(k) && typeof v === "string") names[k] = v.replace(/[<>"`]/g, "").slice(0, 40);
  const isEv = body.ev && typeof body.ev === "object";
  if (!isEv && !/^[\w-]{4,40}$/.test(mid)) return new Response(JSON.stringify({ ok: false, reason: "bad" }), { status: 400, headers: CORS });
  const job = (isEv ? liveEvent(body.ev, names) : work(mid, names, body.dry === true)).then((r) => { console.log("lord-talk", JSON.stringify(r).slice(0, 400)); });
  // @ts-ignore EdgeRuntime est fourni par Supabase
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(job); else await job;
  return new Response(JSON.stringify({ ok: true, queued: mid }), { status: 202, headers: CORS });
});

async function work(mid: string, names: Record<string, string>, dry = false): Promise<any> { // dry : rejoue un message sans rien écrire (tests)
  const out = (o: any) => o;
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return out({ ok: false, reason: "no-key" });
    const m0 = await doc("chat/" + mid);
    if (!m0 || m0.ch !== "u" || SPK.has(m0.uid) || !m0.text) return out({ ok: true, skip: "not-human" });
    // attendre que le joueur ait fini d'écrire
    if (!dry) await sleep(WAIT - (Date.now() - (m0.at || 0)));
    const now = Date.now();
    if (!dry && now - (m0.at || 0) > 5 * 60e3) return out({ ok: true, skip: "old" });
    const { data: recent } = await db.from("docs").select("path,data").eq("col", "chat").gt("updated_at", new Date(now - 6 * 3600e3).toISOString()).order("updated_at", { ascending: false }).limit(300);
    const msgs = (recent ?? []).filter((r) => r.data && r.data.text && r.data.ch === "u").map((r) => ({ id: r.path.slice(5), ...r.data })).sort((a, b) => a.at - b.at);
    const uid = m0.uid;
    if (dry) msgs.splice(0, msgs.length, ...msgs.filter((m) => m.at <= m0.at + 500));
    if (!dry && msgs.some((m) => m.uid === uid && m.at > m0.at)) return out({ ok: true, skip: "newer" }); // le message suivant du joueur s'en chargera
    if (!dry && msgs.some((m) => m.id === "u-r-" + mid)) return out({ ok: true, skip: "done" });
    if (!dry) { const { error: lockErr } = await db.from("docs").insert({ path: "ailock/" + mid, col: "ailock", data: { at: now } });
    if (lockErr) return out({ ok: true, skip: "locked" }); }
    db.from("docs").delete().eq("col", "ailock").lt("updated_at", new Date(now - 864e5).toISOString()).then(() => {}, () => {});
    if (msgs.filter((m) => m.ai && now - m.at < 864e5).length >= DAY_CAP) return out({ ok: false, reason: "budget" });

    // les messages du joueur depuis la dernière réponse d'un seigneur à ce joueur (3 min max)
    const lastR = msgs.filter((m) => BOTS.includes(m.uid) && m.re === uid).slice(-1)[0];
    const batch = msgs.filter((m) => m.uid === uid && m.at <= m0.at && m0.at - m.at < 3 * 60e3 && (!lastR || m.at > lastR.at)).slice(-6);
    if (!batch.length) batch.push({ id: mid, ...m0 });

    const C = await gameCtx(uid, names, msgs);
    const { players, me, pn, facts, conv, style, cnt } = C;
    if (!me || me.bot) return out({ ok: true, skip: "who" });

    const system = `${PERSONA}

Ta mission : un joueur vient d'écrire dans l'Univers. Décide si un Seigneur répond, lequel, et quoi. Tu as une grande liberté : fais vivre ces personnages comme un bon maître du jeu, avec de la répartie, de l'humour, de la menace, du théâtre.
Repères (pas des chaînes) :
- Répond le Seigneur visé (son nom, sa planète, une suite de conversation avec lui) ; si c'est adressé à tous les Seigneurs, celui qui a le plus à dire. Si les joueurs parlent entre eux, le silence (reply = null) est souvent le mieux, sauf si une pique rendrait la scène meilleure.
- Sers-toi de ce qui se passe vraiment (rubrique À LA UNE d'abord, puis flottes, batailles, planètes) : c'est ce qui rend les répliques vivantes. Ne confonds pas les camps : une flotte appartient à celui qui l'envoie, pas à la planète visée.
- Réponds vraiment à ce que dit le joueur, varie la forme, ne répète pas les formules déjà dites (voir la liste).
- Un Seigneur peut annoncer qu'il envoie ses sondes (act « spy »), ça se fera vraiment.
- 1 à 3 phrases, 300 caractères maximum, pas de guillemets ni de nom devant. Jamais vulgaire, sexuel ou haineux. N'invente pas de règles ni de chiffres, ne trahis jamais l'Empereur ni les autres Seigneurs, ne dis jamais que tu es une IA.
Second Seigneur (« chime ») : de temps en temps, s'il a une vraie réplique (une pique entre Seigneurs, un soutien moqueur). Sinon null.
Réponds UNIQUEMENT avec ce JSON, sans texte autour :
{"reply": {"lord": "orion-1|orion-2|orion-3", "text": "...", "rel": entier de -8 à 8 (ce que ce message change dans son sentiment envers le joueur : respect +, mépris -), "grudge": true si le joueur l'a vraiment provoqué ou menacé, "act": "spy" ou null} ou null, "chime": {"lord": "...", "text": "..."} ou null}`;
    const user = `Contexte du jeu :\n${facts}\n\n${style}\n\nDiscussion de l'onglet Univers (3 dernières heures) :\n${conv}\n\nLe joueur ${me.name} vient d'écrire (c'est à cela qu'il faut réagir) :\n${batch.map((m) => "- " + String(m.text).slice(0, 400)).join("\n")}`;

    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, thinking: { type: "disabled" }, system, messages: [{ role: "user", content: user }] }) });
    clearTimeout(to);
    if (!r.ok) { const body = (await r.text()).slice(0, 300); await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "api", status: r.status, body }); }
    const j = await r.json();
    const raw = String((j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join(""));
    const res: any = parseAI(raw);
    if (!res || typeof res !== "object") { await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "parse", raw: raw.slice(0, 300), stop: j.stop_reason }); }
    // marque le message comme traité : le jeu ne met alors pas de réplique de secours
    const mark = async (h: string) => { const cur = await doc("chat/" + mid); if (cur) await db.from("docs").update({ data: { ...cur, h }, updated_at: new Date().toISOString() }).eq("path", "chat/" + mid); };
    const rep = res.reply, ok = (x: any) => x && BOTS.includes(x.lord) && players[x.lord] && typeof x.text === "string" && x.text.trim() && !/(intelligence artificielle|chatbot|modèle de langage|en tant qu.IA)/i.test(x.text);
    const lastOf = (b: string) => (cnt.find((c: any) => c.b === b) || { last: 0 }).last;
    if (dry) return out({ dry: true, reply: rep ? { lord: rep.lord, text: clip(untic(clean(String(rep.text || "")))), act: rep.act ?? null } : null, chime: res.chime ?? null });
    const toMe = msgs.filter((m) => BOTS.includes(m.uid) && m.re === uid).slice(-1)[0], convo = toMe && rep && toMe.uid === rep.lord && Date.now() - toMe.at < 4 * 60e3; // le joueur répond à ce seigneur : la conversation continue
    if (ok(rep) && (Date.now() - lastOf(rep.lord) < 25e3 || !convo && Date.now() - lastOf(rep.lord) < 60e3) && !batch.some((m) => new RegExp(LORDS[rep.lord].name.split(" ")[0], "i").test(String(m.text)))) { await mark("silent"); return out({ ok: true, silent: "pace", lord: rep.lord }); }
    if (!ok(rep)) { await mark("silent"); return out({ ok: true, silent: true }); }
    const text = clip(untic(clean(rep.text)));
    await db.from("docs").upsert({ path: "chat/u-r-" + mid, col: "chat", data: { kind: "chat", ch: "u", uid: rep.lord, name: LORDS[rep.lord].name, text, at: Date.now(), re: uid, ai: true } });
    await mark("ok");
    // conséquences bornées : jauge de relation et rancune
    const dv = Math.max(-8, Math.min(8, Math.round(Number(rep.rel) || 0))), grudgeUp = rep.grudge === true;
    if (dv || grudgeUp || rep.act === "spy") {
      const fresh = await doc("players/" + rep.lord);
      if (fresh?.bot) {
        const R = { ...(fresh.bot.rel ?? {}) }, rr = { v: 0, mem: [], c: {}, ...(R[uid] ?? {}) };
        rr.v = Math.max(-100, Math.min(100, (rr.v || 0) + dv)); R[uid] = rr;
        const G = { ...(fresh.bot.grudge ?? {}) }, spyOn = rep.act === "spy" && now - (fresh.bot.spyOn?.at ?? 0) > 6 * 3600e3 ? { spyOn: { uid, at: now } } : {};
        if (grudgeUp) { const c = G[uid] && now - G[uid].at < 48 * 3600e3 ? G[uid] : { n: 0 }; G[uid] = { n: (c.n || 0) + 1, at: now }; }
        await db.from("docs").update({ data: { ...fresh, bot: { ...fresh.bot, rel: R, grudge: G, ...spyOn } }, updated_at: new Date().toISOString() }).eq("path", "players/" + rep.lord);
      }
    }
    // un second seigneur s'en mêle, un peu plus tard, si le joueur n'a pas relancé entre-temps
    const ch = res.chime;
    if (ok(ch) && ch.lord !== rep.lord && Date.now() - lastOf(ch.lord) > 90e3 && Math.random() < 0.6) {
      await sleep(25000 + Math.random() * 20000);
      const later = (await db.from("docs").select("data").eq("col", "chat").gt("updated_at", new Date(Date.now() - 70e3).toISOString())).data ?? [];
      if (!later.some((x) => x.data?.ch === "u" && x.data?.uid === uid && x.data?.at > m0.at))
        await db.from("docs").upsert({ path: "chat/u-c-" + mid, col: "chat", data: { kind: "chat", ch: "u", uid: ch.lord, name: LORDS[ch.lord].name, text: clip(untic(clean(ch.text)), 260), at: Date.now(), re: uid, ai: true } });
    }
    return out({ ok: true, lord: rep.lord, text, dv, grudge: grudgeUp, chime: ok(ch) ? ch.lord : null });
  } catch (e) {
    await db.from("docs").delete().eq("path", "ailock/" + mid).then(() => {}, () => {});
    return out({ ok: false, reason: "error", msg: String(e).slice(0, 200) });
  }
}

// contexte du jeu relu dans la base (joueurs, planètes, flottes en vol, batailles, relations, état des seigneurs)
async function gameCtx(uid: string | null, names: Record<string, string>, msgs: any[]) {
  const now = Date.now();
    const players: Record<string, any> = {};
  const { data: pd } = await db.from("docs").select("path,data").eq("col", "players");
  for (const r of pd ?? []) if (r.data?.uid) players[r.data.uid] = r.data;
  const me = uid ? players[uid] : null;
  const meName = me?.name ?? "les joueurs";
  const pn = (id: string) => LORDS[id]?.name ?? (id === "vorgath" ? "L'Empereur Vorgath" : id === "univers" ? "Univers" : players[id]?.name ?? "?");
  const { data: pls } = await db.from("docs").select("path,data").eq("col", "planets");
  const count: Record<string, number> = {}; const mine = new Set<string>(), owner: Record<string, string> = {}, owned: Record<string, string[]> = {};
  const pl = (pid: string) => names[pid] ?? `la planète ${pid}`;
  for (const p of pls ?? []) { const o = p.data?.owner; if (!o) continue; const pid = p.path.slice(8); owner[pid] = o; count[o] = (count[o] || 0) + 1; if (o === uid) mine.add(pid); (owned[o] ??= []).push(pl(pid) + (p.data?.capital ? " (capitale)" : p.data?.outpost ? " (avant-poste)" : "")); }
  // flottes en vol en ce moment : attaques, renforts, espionnage, interceptions (tout le monde, en temps réel)
  const { data: fl } = await db.from("docs").select("path,data").eq("col", "fleets");
  const MIS: Record<string, string> = { attack: "attaque", colonize: "conquête", reinforce: "renfort", spy: "espionnage", intercept: "interception", rallysup: "soutien de ralliement" };
  const tot = (sh: any) => Object.entries(sh || {}).filter(([k]) => k !== "probe").reduce((a, [, v]) => a + (Number(v) || 0), 0);
  const flying = (fl ?? []).map((r) => r.data).filter((f) => f && f.phase === "out" && MIS[f.mission] && f.arrive > now && (players[f.owner] || f.owner === "npc-pill" || f.owner === "npc-emp"));
  const incoming = flying.filter((f) => BOTS.includes(f.owner) && f.mission === "attack" && mine.has(f.to));
  const rel2 = (f: any) => (f.owner === uid || owner[f.to] === uid ? 0 : BOTS.includes(f.owner) || BOTS.includes(owner[f.to]) ? 1 : 2);
  // flottes qui comptent (vers une planète tenue : Seigneur ou joueur), puis résumé des chasses aux PNJ (Écumeurs, boss) qui ne menacent personne
  const who = (f: any) => f.owner === "npc-pill" && f.pact ? `Coalition des Seigneurs (Pillards du Néant payés par ${pn(f.pact)})` : f.owner === "npc-pill" ? "Pillards du Néant" : f.owner === "npc-emp" ? "Légions de l'Empereur Vorgath" : pn(f.owner);
  const hot = flying.filter((f) => owner[f.to] && owner[f.to] !== f.owner).sort((a, b) => rel2(a) - rel2(b) || a.arrive - b.arrive).slice(0, 12);
  const VERB: Record<string, string> = { attack: "attaque", colonize: "veut conquérir", reinforce: "envoie un renfort à", spy: "espionne", intercept: "part intercepter une flotte près de", rallysup: "rejoint un ralliement vers" };
  const flyTxt = hot.map((f) => `- ${who(f)} ${VERB[f.mission] ?? MIS[f.mission]} ${pl(f.to)}, planète de ${pn(owner[f.to])}${BOTS.includes(owner[f.to]) ? " (un Seigneur)" : ""}${f.mission === "spy" ? "" : ` (${tot(f.ships)} vaisseaux)`}, arrivée à ${hhmm(f.arrive)}. Ces vaisseaux appartiennent à ${who(f)}, pas à ${pn(owner[f.to])}.`);
  const pve: Record<string, string[]> = {};
  for (const f of flying) if (!owner[f.to] && (f.mission === "attack" || f.mission === "intercept") && f.owner !== "npc-pill") (pve[f.owner] ??= []).push(pl(f.to));
  for (const [o, L] of Object.entries(pve)) flyTxt.push(`- ${pn(o)} : ${L.length} flotte(s) en chasse contre des PNJ (Écumeurs/boss pirates, zones neutres) : ${[...new Set(L)].slice(0, 4).join(", ")}. Ce n'est PAS une attaque contre les Seigneurs.`);
  const { data: ev } = await db.from("docs").select("path,data").eq("col", "events").gt("updated_at", new Date(now - 36 * 3600e3).toISOString());
  const news = (ev ?? []).map((r) => r.data).filter((e) => e && e.news && e.title && now - (e.at || 0) < 36 * 3600e3).sort((a, b) => b.at - a.at).slice(0, 10);
  const fights = (ev ?? []).map((r) => r.data).filter((e) => e && e.battle && !e.done && e.pid).slice(0, 6).map((e) => `- Bataille en cours à ${pl(e.pid)}${e.owner ? ` (planète de ${pn(e.owner)})` : ""}${Array.isArray(e.att) && e.att.length ? `, attaquants : ${[...new Set(e.att.map((a: any) => pn(a.owner ?? a.uid)))].join(", ")}` : ""}`);
  const saga = await doc("events/orion-saga"), lordsEv = await doc("events/orion-lords"), peace = (lordsEv?.created ?? now) + 7 * 864e5;
  const cru = await doc("events/crusade"), inv = await doc("events/invasion"), pact = await doc("events/orion-pact"), parisH = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", hourCycle: "h23" }).format(new Date(now)));
  const CRU_PH = ["", "phase I : les légions de Vorgath contre-attaquent les forteresses prises", "phase II : siège de la Citadelle", "phase III : assaut du Trône", "terminée : Orion est libérée, l'Empereur est vaincu"];
  const extra = [parisH < 9 ? "Trêve de nuit en cours (minuit à 9 h) : personne ne peut attaquer un empire, les Seigneurs non plus. Ils peuvent s'en moquer ou s'en plaindre." : "",
    pact?.fl && !pact.done ? (() => { const L = Object.values(pact.fl) as any[], rep = L.filter((y) => y.res === "rep").length, won = L.filter((y) => y.res === "won").length; return `PACTE DES SEIGNEURS : à la veille de la fin de leur trêve, LES SEIGNEURS (Kael, Ysmera, Draxen) ont payé les Pillards du Néant pour attaquer les JOUEURS. C'est LEUR coalition : ${L.length} flottes de Pillards foncent sur les planètes des joueurs (${rep} repoussées, ${won} réussies, ${L.length - rep - won} en approche). Les joueurs en sont les VICTIMES, jamais les alliés des Pillards. Un Seigneur en parle avec fierté, comme de son plan.${now < peace ? ` Et ce n'est que le prélude : dans ${Math.ceil((peace - now) / 3600e3)} h (${hhmm(peace)}), leur trêve se termine et les Seigneurs lanceront EUX-MÊMES leurs attaques contre les empires affaiblis par la coalition. Ils peuvent l'annoncer, menacer, faire le lien.` : " Leur trêve est finie : ils attaquent maintenant eux-mêmes les empires affaiblis."}`; })() : pact?.done ? `Le pacte des Seigneurs avec les Pillards est terminé (leur coalition a attaqué les joueurs).` : "",
    cru?.phase ? `Croisade impériale : ${CRU_PH[cru.phase] ?? ""}.` : "",
    inv?.phase === "live" ? `Grande invasion du Néant en cours, menée par ${inv.chief ?? "un chef pillard"}.` : inv?.at && inv.at - now < 2 * 864e5 && inv.at > now ? `Prochaine grande invasion du Néant : ${new Date(inv.at).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })}.` : "",
    Object.values(players).filter((p: any) => p.uid && !p.bot && p.joined && now - p.joined < 4 * 864e5 && !p.shieldOff).map((p: any) => `${p.name} est un nouvel empire, protégé de toute attaque pendant ses 4 premiers jours (tant qu'il n'attaque pas un Seigneur).`).join(" ")].filter(Boolean);
  const humans = Object.values(players).filter((p: any) => p.uid && !p.bot && p.name);
  const lordFacts = BOTS.filter((b) => players[b]).map((b) => {
    const bot = players[b].bot || {}, rel = bot.rel?.[uid] ?? { v: 0, mem: [] }, g = bot.grudge?.[uid], gr = g && now - g.at < 48 * 3600e3 ? g.n || 0 : 0;
    const mem = (rel.mem ?? []).filter((x: any) => MEMK[x.k]).slice(-3).map((x: any) => `${MEMK[x.k]}${x.pl ? " à " + x.pl : ""} (${ago(x.at, now)})`);
    const others = humans.filter((h: any) => h.uid !== uid).map((h: any) => { const r2 = bot.rel?.[h.uid]; return r2 ? `${h.name} : ${STANCE(r2.v ?? 0, 0)}` : null; }).filter(Boolean);
    return `- ${LORDS[b].name} : ${count[b] || 0} planètes. Envers ${meName} : ${STANCE(rel.v ?? 0, gr)} (jauge ${rel.v ?? 0}/100)${rel.nick ? `, il le surnomme « ${rel.nick} »` : ""}${mem.length ? `. Souvenirs : ${mem.join(" ; ")}` : ". Aucun combat entre eux pour l'instant"}.${others.length ? ` Envers les autres : ${others.join(", ")}.` : ""}`;
  }).join("\n");
  // état de chaque seigneur : plus il perd, plus il est acculé (le ton s'adapte)
  const W: Record<string, number> = { fighter: 1, cruiser: 4, battleship: 12, colony: 6, flag: 30 };
  const worth = (sh: any) => Object.entries(sh || {}).reduce((a, [k, v]) => a + (W[k] ?? 0) * (Number(v) || 0), 0);
  const power: Record<string, number> = {};
  for (const p of pls ?? []) { const o = p.data?.owner; if (o) power[o] = (power[o] || 0) + worth(p.data?.ships); }
  for (const f of (fl ?? []).map((r) => r.data)) if (f?.owner) power[f.owner] = (power[f.owner] || 0) + worth(f.ships);
  const hp = humans.map((h: any) => power[h.uid] || 0).filter((x) => x > 0), avgH = hp.length ? hp.reduce((a, b) => a + b, 0) / hp.length : 1;
  const SEAT: Record<string, string> = { "orion-1": "o0-0", "orion-2": "o0-2", "orion-3": "o0-3" };
  const lordState = BOTS.filter((b) => players[b]).map((b) => {
    const rels = Object.values(players[b].bot?.rel ?? {}) as any[];
    const losses = rels.reduce((a, r) => a + (r.mem ?? []).filter((x: any) => (x.k === "pw" || x.k === "pa") && now - x.at < 48 * 3600e3).length, 0);
    const ratio = (power[b] || 0) / avgH, seatLost = owner[SEAT[b]] !== b, n = count[b] || 0;
    const score = Math.max(0, 8 - n) + (seatLost ? 3 : 0) + losses * 0.7 + (ratio < 0.6 ? 2 : ratio < 0.9 ? 1 : 0);
    const lvl = score >= 6 ? "au bord de la chute" : score >= 4 ? "acculé" : score >= 2 ? "sous pression" : "confiant";
    const fa = players[b].bot?.fallen, ex = players[b].bot?.exiled;
    return `- ${LORDS[b].name} : ${ex ? "EXILÉ (a perdu toutes ses planètes, a fui Orion ; il ne parle plus que rarement, depuis l'exil)" : fa ? `DÉCHU (sa forteresse a été prise par ${pn(fa.by)} ; il mène des raids de vengeance contre lui et veut la reprendre)` : lvl} (${n} planètes${seatLost ? ", SA FORTERESSE EST TOMBÉE" : ""}, ${losses} défaite(s) en 48 h, flotte ≈ ${Math.round(ratio * 100)} % de celle d'un joueur moyen)`;
  }).join("\n");
  const facts = [
    extra.length ? `À LA UNE (ce dont tout Orion parle en ce moment, à garder en tête et à évoquer quand ça s'y prête) :\n${extra.map((x) => "- " + x).join("\n")}` : "",
    `État des Seigneurs (adapte leur ton) :\n${lordState}`,
    `Joueurs et leurs planètes :\n${humans.map((h: any) => `- ${h.name} (${count[h.uid] || 0}) : ${(owned[h.uid] || []).slice(0, 20).join(", ") || "aucune"}`).join("\n")}`,
    `Planètes des Seigneurs :\n${BOTS.filter((b) => players[b]).map((b) => `- ${LORDS[b].name} : ${(owned[b] || []).slice(0, 10).join(", ")}`).join("\n")}`,
    flyTxt.length ? `Flottes en vol en ce moment (tout est visible des Seigneurs, qui espionnent tout Orion) :\n${flyTxt.join("\n")}` : "Aucune flotte en vol en ce moment.",
    fights.length ? fights.join("\n") : "",
    `Seigneurs :\n${lordFacts}`,
    incoming.length ? `Flottes de Seigneurs en route pour attaquer ${meName} : ${incoming.map((f) => `${pn(f.owner)} (arrivée à ${hhmm(f.arrive)})`).join(", ")}.` : `Aucune flotte de Seigneur n'attaque ${meName} en ce moment.`,
    now < peace ? `Trêve : les Seigneurs n'attaquent pas encore les empires (fin dans ${Math.ceil((peace - now) / 3600e3)} h), sauf pour se venger de qui les attaque.` : "La trêve est finie : les Seigneurs attaquent les empires.",
    saga?.ch ? `Histoire d'Orion : chapitre ${saga.ch} sur 5 en cours.` : "",
    news.length ? `Événements récents :\n${news.map((e) => `- ${e.title} (${ago(e.at, now)})`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
  const conv = (msgs ?? []).filter((m) => now - m.at < 3 * 3600e3).slice(-36).map((m) => `[${hhmm(m.at)}] ${pn(m.uid)}${m.re && BOTS.includes(m.uid) ? ` (répond à ${pn(m.re)})` : ""} : ${String(m.text).slice(0, 300)}`).join("\n");
  // style : qui a parlé récemment, et les formules déjà trop utilisées (à ne pas répéter)
  const lm = (msgs ?? []).filter((m) => BOTS.includes(m.uid) && now - m.at < 3 * 3600e3);
  const cnt = BOTS.map((b) => ({ b, n: lm.filter((m) => m.uid === b && now - m.at < 3600e3).length, last: Math.max(0, ...lm.filter((m) => m.uid === b).map((m) => m.at)) }));
  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z' ]+/g, " ").split(/\s+/).filter(Boolean);
  const NOUNS = new Set(["seigneurs", "seigneur", "vaisseaux", "leviathan", "leviathans", "empereur", "planetes", "planete", "croiseurs", "chasseurs", "cuirasses", "attaque", "attaquer", "pillards", "ecumeurs", ...humans.map((h: any) => norm(String(h.name)).join(" ")), ...BOTS.flatMap((b) => norm(LORDS[b].name))]);
  const grams: Record<string, number> = {};
  for (const m of lm.slice(-30)) { const w = norm(String(m.text)), seen = new Set<string>(); for (let k = 1; k <= 3; k++) for (let i = 0; i + k <= w.length; i++) { const g = w.slice(i, i + k).join(" "); if (g.length < (k === 1 ? 8 : 7) || seen.has(g) || (k === 1 && NOUNS.has(g))) continue; seen.add(g); grams[g] = (grams[g] || 0) + 1; } }
  const STOP = /^(de la|de l|que tu|que je|ce que|c est|il y|tu as|tu es|et tu|dans le|dans la|pour le|sur le|sur la|a la|de ton|de tes|de mes|et je|je ne|ne pas|tu ne|n est|est pas|qui a|il a)$/;
  const worn = Object.entries(grams).filter(([g, n]) => n >= 3 && !STOP.test(g)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([g]) => `« ${g} »`);
  const style = `Heure actuelle : ${hhmm(now)}.\nMessages des Seigneurs dans la dernière heure : ${cnt.map((c) => `${LORDS[c.b].name} ${c.n}${c.last ? ` (dernier ${ago(c.last, now)})` : " (silencieux)"}`).join(", ")}. Équilibre les voix : quand plusieurs Seigneurs conviennent, préfère celui qui a le moins parlé (Draxen aussi doit exister).${worn.length ? `\nFormules déjà trop utilisées ces dernières heures, À NE PAS réutiliser (ni leurs variantes) : ${worn.join(", ")}.` : ""}`;
  return { players, me, pn, facts, conv, owner, style, cnt };
}

// commentaire en direct d'un événement (attaque lancée, bataille, planète perdue, renfort, grosse attaque entre joueurs)
async function liveEvent(ev: any, names: Record<string, string>): Promise<any> {
  const S = (x: any, n = 120) => String(x ?? "").replace(/[<>`]/g, "").slice(0, n);
  const key = S(ev.key, 70);
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return { ok: false, reason: "no-key" };
    if (!/^[\w-]{3,70}$/.test(key)) return { ok: false, reason: "bad" };
    const lord = BOTS.includes(ev.lord) ? ev.lord : null;
    if (await doc("chat/u-e-" + key)) return { ok: true, skip: "done" };
    const { error: lockErr } = await db.from("docs").insert({ path: "ailock/e-" + key, col: "ailock", data: { at: Date.now() } });
    if (lockErr) return { ok: true, skip: "locked" };
    await sleep(5000 + Math.random() * 6000); // laisser le rapport de bataille arriver
    const now = Date.now();
    const { data: recent } = await db.from("docs").select("path,data").eq("col", "chat").gt("updated_at", new Date(now - 3 * 3600e3).toISOString()).order("updated_at", { ascending: false }).limit(300);
    const msgs = (recent ?? []).filter((r) => r.data && r.data.text && r.data.ch === "u").map((r) => ({ id: r.path.slice(5), ...r.data })).sort((a, b) => a.at - b.at);
    if (msgs.filter((m) => m.ai && m.id.startsWith("u-e") && now - m.at < 3600e3).length >= 8) return { ok: true, skip: "rate" };
    if (msgs.filter((m) => m.ai && now - m.at < 864e5).length >= DAY_CAP) return { ok: false, reason: "budget" };
    const { players, facts, conv, style } = await gameCtx(null, names, msgs);
    const what = [`Événement : ${S(ev.what)}`, lord ? `Seigneur concerné : ${LORDS[lord].name}` : "", ev.p ? `Joueur(s) : ${S(ev.p)}` : "", ev.pl ? `Planète : ${S(ev.pl, 40)}` : "", ev.h ? `Seigneur aidé : ${S(ev.h, 40)}` : "", ev.n ? `Taille de la flotte : environ ${Math.round(Number(ev.n) || 0)} points de puissance` : "", ev.eta ? `Arrivée prévue à ${hhmm(Number(ev.eta) || now)}` : ""].filter(Boolean).join("\n");
    const system = `${PERSONA}

Ta mission : réagir EN DIRECT à un événement qui vient de se produire, comme si le Seigneur le voyait sur ses écrans. Un seul message, celui du Seigneur concerné (ou, pour une attaque entre joueurs, celui dont le caractère colle le mieux : il peut se moquer, attiser la rivalité, parier sur le vainqueur).
- Dans son personnage, avec sa voix propre, adapté à son état actuel et à ce que l'événement représente pour lui (victoire, humiliation, menace, coup dur).
- 1 ou 2 phrases, 220 caractères maximum. Pas de guillemets, pas de nom devant, pas d'astérisques. Jamais vulgaire. Ne dis jamais que tu es une IA.
- N'invente rien d'absent du contexte, ne promets rien de concret. Ne répète pas une formule déjà utilisée dans la discussion.
Second Seigneur (« chime ») : rarement (une fois sur cinq), seulement si ça rend la scène plus vivante. Sinon null.
Réponds UNIQUEMENT avec ce JSON : {"reply": {"lord": "orion-1|orion-2|orion-3", "text": "..."}, "chime": {"lord": "...", "text": "..."} ou null}`;
    const user = `Contexte du jeu :\n${facts}\n\n${style}\n\nDiscussion récente de l'onglet Univers :\n${conv}\n\n${what}`;
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal,
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, thinking: { type: "disabled" }, system, messages: [{ role: "user", content: user }] }) });
    clearTimeout(to);
    if (!r.ok) return { ok: false, reason: "api", status: r.status, body: (await r.text()).slice(0, 300) };
    const j = await r.json();
    const raw = String((j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join(""));
    const res: any = parseAI(raw);
    const ok = (x: any) => x && BOTS.includes(x.lord) && players[x.lord] && typeof x.text === "string" && x.text.trim() && !/(intelligence artificielle|chatbot|modèle de langage|en tant qu.IA)/i.test(x.text);
    const rep = res?.reply; if (!ok(rep)) return { ok: false, reason: "parse", raw: raw.slice(0, 200) };
    const text = clip(untic(clean(rep.text)), 260);
    await db.from("docs").upsert({ path: "chat/u-e-" + key, col: "chat", data: { kind: "chat", ch: "u", uid: rep.lord, name: LORDS[rep.lord].name, text, at: Date.now(), ai: true, ev: S(ev.kind, 20) } });
    const ch = res.chime;
    if (ok(ch) && ch.lord !== rep.lord) { await sleep(20000 + Math.random() * 20000); await db.from("docs").upsert({ path: "chat/u-ec-" + key, col: "chat", data: { kind: "chat", ch: "u", uid: ch.lord, name: LORDS[ch.lord].name, text: clip(clean(ch.text), 220), at: Date.now(), ai: true } }); }
    return { ok: true, ev: key, lord: rep.lord, text };
  } catch (e) {
    return { ok: false, reason: "error", msg: String(e).slice(0, 200) };
  }
}
