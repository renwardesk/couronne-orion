// Couronne d'Orion : les Seigneurs d'Orion lisent l'onglet Univers et répondent avec une IA (Claude), dans leur personnage.
// Appelée par la base de données à chaque message de joueur dans l'Univers (déclencheur docs_lord_talk) avec { mid }.
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
`Stratège froid et calculateur, premier vassal de l'Empereur, loyal jusqu'au bout. Il parle peu, avec des phrases courtes et précises, souvent glaçantes, parfois une ironie très sèche. Vocabulaire : calculs, trajectoires, plans, défenses, variables, probabilités. Il ne s'énerve jamais : il note, il se souvient, il prévient. Il respecte la force, la discipline et la franchise ; il méprise la vantardise, la flatterie et les insultes, qu'il traite comme des données. Il démonte les bluffs, relève les contradictions, pose parfois une question qui déstabilise. Exemples de ton : « Tu annonces tes coups. C'est très aimable. » / « Trois messages, aucune flotte. Je note l'écart. »` },
  "orion-2": { name: "Ysmera la Pâle", title: "Dame de la Forge", sheet:
`Inquiétante, poétique, cruelle avec douceur, joueuse. Elle parle par images (étoiles, nuit, flammes, murmures, épaves qui brillent, cendres) et s'amuse de tout : des menaces, des insultes, des déclarations. Manipulatrice et tentatrice : elle aime semer le doute entre les joueurs, flatter pour mieux piquer, faire miroiter une alliance sans jamais s'engager. Elle ne trahit jamais réellement les autres Seigneurs. Elle peut être drôle et coquette, mais toujours menaçante en filigrane. Exemples de ton : « Tant de colère dans une si petite flotte. » / « L'un m'appelle sa reine, l'autre me promet la mort… Vous êtes adorables, tous les deux. »` },
  "orion-3": { name: "Draxen Ashkar", title: "Maître de l'Arsenal", sheet:
`Brute joyeuse, bruyante, fanfaronne, qui adore la bagarre. Majuscules, points d'exclamation, gros rire (HA !), vocabulaire de canons, cuirassés, ferraille, « tout casser ». Susceptible, facile à provoquer, un peu bête et très drôle, mais pas méchant au fond : il respecte ceux qui cognent fort et il lance des défis. Il a peur de l'Empereur et le cache mal. Exemples de ton : « HA ! Enfin quelqu'un qui parle ma langue ! » / « Tu m'insultes ? Moi je t'atomise. Chacun son truc ! »` },
};
const LORE = `Le jeu : « Couronne d'Orion », un jeu de conquête spatiale entre amis (quelques joueurs qui se connaissent, ton taquin et théâtral, beaucoup de second degré). La galaxie d'Orion appartient à l'Empereur Vorgath, qui règne depuis le Trône au centre du Cœur d'Orion (cinq forteresses : Bastion, Forge, Arsenal, Trône, Citadelle). Ses trois vassaux, les Seigneurs d'Orion — Kael Voryn (Bastion), Ysmera la Pâle (Forge), Draxen Ashkar (Arsenal) — tiennent chacun une forteresse et quelques colonies. Les joueurs sont des empires rivaux entre eux, qui veulent tous prendre le Cœur. Les Seigneurs se chamaillent parfois entre eux mais restent unis et se défendent mutuellement. Les Pillards du Néant sont une menace à part (des pirates), sans lien avec les Seigneurs.`;
const STANCE = (v: number, g: number) => g >= 3 ? "haine (rancune forte : ce joueur est sur sa liste)" : v >= 40 ? "respect" : v >= 15 ? "intérêt" : v <= -40 ? "mépris" : v <= -15 ? "agacement" : "neutre";
const MEMK: Record<string, string> = { pw: "ce joueur l'a battu", pl: "ce joueur a perdu contre lui", pa: "ce joueur lui a pris une planète", lw: "son raid contre ce joueur a réussi", ll: "ce joueur a repoussé son raid" };
const ago = (t: number, now: number) => { const m = Math.round((now - t) / 60e3); return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
const hhmm = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
// coupe proprement à la fin d'une phrase
const clip = (s: string, n = 330) => { s = s.replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n); const i = Math.max(c.lastIndexOf(". "), c.lastIndexOf("! "), c.lastIndexOf("? "), c.lastIndexOf("… ")); return i > 60 ? c.slice(0, i + 1) : c.replace(/\s+\S*$/, "") + "…"; };
const clean = (s: string) => String(s).replace(/^["«\s*]+|["»\s*]+$/g, "");

// la base n'attend pas : on répond tout de suite et le travail continue en arrière-plan
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const body = await req.json().catch(() => ({})), mid = String(body.mid ?? "");
  // noms des planètes envoyés par le jeu (la galaxie est calculée chez les joueurs) : simple habillage, filtré
  const names: Record<string, string> = {};
  if (body.names && typeof body.names === "object") for (const [k, v] of Object.entries(body.names).slice(0, 600)) if (/^[\w-]{1,20}$/.test(k) && typeof v === "string") names[k] = v.replace(/[<>"`]/g, "").slice(0, 40);
  if (!/^[\w-]{4,40}$/.test(mid)) return new Response(JSON.stringify({ ok: false, reason: "bad" }), { status: 400, headers: CORS });
  const job = work(mid, names).then((r) => { console.log("lord-talk", JSON.stringify(r).slice(0, 400)); });
  // @ts-ignore EdgeRuntime est fourni par Supabase
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(job); else await job;
  return new Response(JSON.stringify({ ok: true, queued: mid }), { status: 202, headers: CORS });
});

async function work(mid: string, names: Record<string, string>): Promise<any> {
  const out = (o: any) => o;
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return out({ ok: false, reason: "no-key" });
    const m0 = await doc("chat/" + mid);
    if (!m0 || m0.ch !== "u" || SPK.has(m0.uid) || !m0.text) return out({ ok: true, skip: "not-human" });
    // attendre que le joueur ait fini d'écrire
    await sleep(WAIT - (Date.now() - (m0.at || 0)));
    const now = Date.now();
    if (now - (m0.at || 0) > 5 * 60e3) return out({ ok: true, skip: "old" });
    const { data: recent } = await db.from("docs").select("path,data").eq("col", "chat").gt("updated_at", new Date(now - 6 * 3600e3).toISOString()).order("updated_at", { ascending: false }).limit(300);
    const msgs = (recent ?? []).filter((r) => r.data && r.data.text && r.data.ch === "u").map((r) => ({ id: r.path.slice(5), ...r.data })).sort((a, b) => a.at - b.at);
    const uid = m0.uid;
    if (msgs.some((m) => m.uid === uid && m.at > m0.at)) return out({ ok: true, skip: "newer" }); // le message suivant du joueur s'en chargera
    if (msgs.some((m) => m.id === "u-r-" + mid)) return out({ ok: true, skip: "done" });
    const { error: lockErr } = await db.from("docs").insert({ path: "ailock/" + mid, col: "ailock", data: { at: now } });
    if (lockErr) return out({ ok: true, skip: "locked" });
    db.from("docs").delete().eq("col", "ailock").lt("updated_at", new Date(now - 864e5).toISOString()).then(() => {}, () => {});
    if (msgs.filter((m) => m.ai && now - m.at < 864e5).length >= DAY_CAP) return out({ ok: false, reason: "budget" });

    // les messages du joueur depuis la dernière réponse d'un seigneur à ce joueur (3 min max)
    const lastR = msgs.filter((m) => BOTS.includes(m.uid) && m.re === uid).slice(-1)[0];
    const batch = msgs.filter((m) => m.uid === uid && m.at <= m0.at && m0.at - m.at < 3 * 60e3 && (!lastR || m.at > lastR.at)).slice(-6);
    if (!batch.length) batch.push({ id: mid, ...m0 });

    // contexte du jeu, relu dans la base
    const players: Record<string, any> = {};
    const { data: pd } = await db.from("docs").select("path,data").eq("col", "players");
    for (const r of pd ?? []) if (r.data?.uid) players[r.data.uid] = r.data;
    const me = players[uid]; if (!me || me.bot) return out({ ok: true, skip: "who" });
    const pn = (id: string) => LORDS[id]?.name ?? (id === "vorgath" ? "L'Empereur Vorgath" : id === "univers" ? "Univers" : players[id]?.name ?? "?");
    const { data: pls } = await db.from("docs").select("path,data").eq("col", "planets");
    const count: Record<string, number> = {}; const mine = new Set<string>(), owner: Record<string, string> = {}, owned: Record<string, string[]> = {};
    const pl = (pid: string) => names[pid] ?? `la planète ${pid}`;
    for (const p of pls ?? []) { const o = p.data?.owner; if (!o) continue; const pid = p.path.slice(8); owner[pid] = o; count[o] = (count[o] || 0) + 1; if (o === uid) mine.add(pid); (owned[o] ??= []).push(pl(pid) + (p.data?.capital ? " (capitale)" : p.data?.outpost ? " (avant-poste)" : "")); }
    // flottes en vol en ce moment : attaques, renforts, espionnage, interceptions (tout le monde, en temps réel)
    const { data: fl } = await db.from("docs").select("path,data").eq("col", "fleets");
    const MIS: Record<string, string> = { attack: "attaque", colonize: "conquête", reinforce: "renfort", spy: "espionnage", intercept: "interception", rallysup: "soutien de ralliement" };
    const tot = (sh: any) => Object.entries(sh || {}).filter(([k]) => k !== "probe").reduce((a, [, v]) => a + (Number(v) || 0), 0);
    const flying = (fl ?? []).map((r) => r.data).filter((f) => f && f.phase === "out" && MIS[f.mission] && f.arrive > now && (players[f.owner] || f.owner === "npc-pill"));
    const incoming = flying.filter((f) => BOTS.includes(f.owner) && f.mission === "attack" && mine.has(f.to));
    const rel2 = (f: any) => (f.owner === uid || owner[f.to] === uid ? 0 : BOTS.includes(f.owner) || BOTS.includes(owner[f.to]) ? 1 : 2);
    const flyTxt = flying.sort((a, b) => rel2(a) - rel2(b) || a.arrive - b.arrive).slice(0, 14).map((f) => `- ${f.owner === "npc-pill" ? "Pillards du Néant" : pn(f.owner)} → ${pl(f.to)}${owner[f.to] ? ` (${pn(owner[f.to])})` : ""} : ${MIS[f.mission]}${f.mission === "spy" ? "" : `, ${tot(f.ships)} vaisseaux`}, arrivée à ${hhmm(f.arrive)}`);
    const { data: ev } = await db.from("docs").select("path,data").eq("col", "events").gt("updated_at", new Date(now - 36 * 3600e3).toISOString());
    const news = (ev ?? []).map((r) => r.data).filter((e) => e && e.news && e.title && now - (e.at || 0) < 36 * 3600e3).sort((a, b) => b.at - a.at).slice(0, 10);
    const fights = (ev ?? []).map((r) => r.data).filter((e) => e && e.battle && !e.done && e.pid).slice(0, 6).map((e) => `- Bataille en cours à ${pl(e.pid)}${e.owner ? ` (planète de ${pn(e.owner)})` : ""}${Array.isArray(e.att) && e.att.length ? `, attaquants : ${[...new Set(e.att.map((a: any) => pn(a.owner ?? a.uid)))].join(", ")}` : ""}`);
    const saga = await doc("events/orion-saga"), lordsEv = await doc("events/orion-lords"), peace = (lordsEv?.created ?? now) + 7 * 864e5;
    const humans = Object.values(players).filter((p: any) => p.uid && !p.bot && p.name);
    const lordFacts = BOTS.filter((b) => players[b]).map((b) => {
      const bot = players[b].bot || {}, rel = bot.rel?.[uid] ?? { v: 0, mem: [] }, g = bot.grudge?.[uid], gr = g && now - g.at < 48 * 3600e3 ? g.n || 0 : 0;
      const mem = (rel.mem ?? []).filter((x: any) => MEMK[x.k]).slice(-3).map((x: any) => `${MEMK[x.k]}${x.pl ? " à " + x.pl : ""} (${ago(x.at, now)})`);
      const others = humans.filter((h: any) => h.uid !== uid).map((h: any) => { const r2 = bot.rel?.[h.uid]; return r2 ? `${h.name} : ${STANCE(r2.v ?? 0, 0)}` : null; }).filter(Boolean);
      return `- ${LORDS[b].name} : ${count[b] || 0} planètes. Envers ${me.name} : ${STANCE(rel.v ?? 0, gr)} (jauge ${rel.v ?? 0}/100)${rel.nick ? `, il le surnomme « ${rel.nick} »` : ""}${mem.length ? `. Souvenirs : ${mem.join(" ; ")}` : ". Aucun combat entre eux pour l'instant"}.${others.length ? ` Envers les autres : ${others.join(", ")}.` : ""}`;
    }).join("\n");
    const facts = [
      `Joueurs et leurs planètes :\n${humans.map((h: any) => `- ${h.name} (${count[h.uid] || 0}) : ${(owned[h.uid] || []).slice(0, 20).join(", ") || "aucune"}`).join("\n")}`,
      `Planètes des Seigneurs :\n${BOTS.filter((b) => players[b]).map((b) => `- ${LORDS[b].name} : ${(owned[b] || []).slice(0, 10).join(", ")}`).join("\n")}`,
      flyTxt.length ? `Flottes en vol en ce moment (tout est visible des Seigneurs, qui espionnent tout Orion) :\n${flyTxt.join("\n")}` : "Aucune flotte en vol en ce moment.",
      fights.length ? fights.join("\n") : "",
      `Seigneurs :\n${lordFacts}`,
      incoming.length ? `Flottes de Seigneurs en route pour attaquer ${me.name} : ${incoming.map((f) => `${pn(f.owner)} (arrivée à ${hhmm(f.arrive)})`).join(", ")}.` : `Aucune flotte de Seigneur n'attaque ${me.name} en ce moment.`,
      now < peace ? `Trêve : les Seigneurs n'attaquent pas encore les empires (fin dans ${Math.ceil((peace - now) / 3600e3)} h), sauf pour se venger de qui les attaque.` : "La trêve est finie : les Seigneurs attaquent les empires.",
      saga?.ch ? `Histoire d'Orion : chapitre ${saga.ch} sur 5 en cours.` : "",
      news.length ? `Événements récents :\n${news.map((e) => `- ${e.title} (${ago(e.at, now)})`).join("\n")}` : "",
    ].filter(Boolean).join("\n");
    const conv = msgs.filter((m) => now - m.at < 3 * 3600e3).slice(-36).map((m) => `[${hhmm(m.at)}] ${pn(m.uid)}${m.re && BOTS.includes(m.uid) ? ` (répond à ${pn(m.re)})` : ""} : ${String(m.text).slice(0, 300)}`).join("\n");

    const system = `Tu fais vivre les trois Seigneurs d'Orion, des personnages d'un jeu vidéo, dans le chat « Univers » du jeu.
${LORE}

Les trois Seigneurs :
${BOTS.map((b) => `## ${LORDS[b].name}, ${LORDS[b].title} (id ${b})\n${LORDS[b].sheet}`).join("\n\n")}

Ta mission : un joueur vient d'écrire. Décide si un Seigneur répond, lequel, et quoi.
Qui répond :
- Le Seigneur nommé ou visé (son nom, sa planète, « toi » juste après qu'il a parlé à ce joueur, une suite évidente de conversation avec lui).
- « Vous les Seigneurs » ou un sujet qui les concerne tous : le plus pertinent (celui qui attaque le joueur, celui avec qui il a un passé, celui dont le caractère colle le mieux).
- Si les joueurs parlent entre eux de choses qui ne concernent pas les Seigneurs, personne ne répond (reply = null). S'ils parlent des Seigneurs, complotent contre l'un d'eux ou se trahissent, un Seigneur peut s'inviter, avec malice.
Comment répondre :
- Reste totalement dans le personnage, avec sa voix propre. Varie les tournures : ne réutilise pas les formules déjà dites dans la conversation.
- Réponds vraiment au contenu : reprends un détail, relève une contradiction ou un bluff, réagis aux alliances et trahisons entre joueurs, aux plaisanteries (le ton entre amis est souvent au second degré : tu peux jouer le jeu).
- Tu as de la liberté : poser une question, lancer un défi, menacer, flatter pour mieux piquer, semer la zizanie entre joueurs, faire de l'humour, bluffer vaguement sur ta puissance.
- 1 à 3 phrases, 300 caractères maximum. Pas de guillemets autour, pas de nom devant, pas d'astérisques.
- Jamais vulgaire ni sexuel, rien de haineux, pas de violence détaillée, même si les joueurs le sont (réponds avec classe, froideur ou théâtre). Ne dis jamais que tu es une IA.
- Sers-toi du contexte (planètes de chacun, flottes en vol, batailles) avec justesse : ne confonds pas une planète d'un joueur avec la tienne. N'invente pas de règles du jeu, de récompenses, de chiffres ou d'événements absents du contexte. Ne promets rien de concret (pas d'alliance réelle, pas d'attaque à une heure précise).
- Un Seigneur ne trahit jamais les autres Seigneurs ni l'Empereur.
Second Seigneur (« chime ») : rarement (environ une fois sur quatre), et seulement si ça rend la scène plus vivante (une pique entre Seigneurs, un soutien moqueur). Sinon null.
Réponds UNIQUEMENT avec ce JSON, sans texte autour :
{"reply": {"lord": "orion-1|orion-2|orion-3", "text": "...", "rel": entier de -8 à 8 (ce que ce message change dans son sentiment envers le joueur : respect +, mépris -), "grudge": true si le joueur l'a vraiment provoqué ou menacé} ou null, "chime": {"lord": "...", "text": "..."} ou null}`;
    const user = `Contexte du jeu :\n${facts}\n\nDiscussion de l'onglet Univers (3 dernières heures) :\n${conv}\n\nLe joueur ${me.name} vient d'écrire (c'est à cela qu'il faut réagir) :\n${batch.map((m) => "- " + String(m.text).slice(0, 400)).join("\n")}`;

    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, thinking: { type: "disabled" }, system, messages: [{ role: "user", content: user }] }) });
    clearTimeout(to);
    if (!r.ok) { const body = (await r.text()).slice(0, 300); await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "api", status: r.status, body }); }
    const j = await r.json();
    const raw = String((j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join(""));
    let res: any = null; try { res = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch { res = null; }
    if (!res || typeof res !== "object") { await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "parse", raw: raw.slice(0, 300), stop: j.stop_reason }); }
    // marque le message comme traité : le jeu ne met alors pas de réplique de secours
    const mark = async (h: string) => { const cur = await doc("chat/" + mid); if (cur) await db.from("docs").update({ data: { ...cur, h }, updated_at: new Date().toISOString() }).eq("path", "chat/" + mid); };
    const rep = res.reply, ok = (x: any) => x && BOTS.includes(x.lord) && players[x.lord] && typeof x.text === "string" && x.text.trim() && !/(intelligence artificielle|chatbot|modèle de langage|en tant qu.IA)/i.test(x.text);
    if (!ok(rep)) { await mark("silent"); return out({ ok: true, silent: true }); }
    const text = clip(clean(rep.text));
    await db.from("docs").upsert({ path: "chat/u-r-" + mid, col: "chat", data: { kind: "chat", ch: "u", uid: rep.lord, name: LORDS[rep.lord].name, text, at: Date.now(), re: uid, ai: true } });
    await mark("ok");
    // conséquences bornées : jauge de relation et rancune
    const dv = Math.max(-8, Math.min(8, Math.round(Number(rep.rel) || 0))), grudgeUp = rep.grudge === true;
    if (dv || grudgeUp) {
      const fresh = await doc("players/" + rep.lord);
      if (fresh?.bot) {
        const R = { ...(fresh.bot.rel ?? {}) }, rr = { v: 0, mem: [], c: {}, ...(R[uid] ?? {}) };
        rr.v = Math.max(-100, Math.min(100, (rr.v || 0) + dv)); R[uid] = rr;
        const G = { ...(fresh.bot.grudge ?? {}) };
        if (grudgeUp) { const c = G[uid] && now - G[uid].at < 48 * 3600e3 ? G[uid] : { n: 0 }; G[uid] = { n: (c.n || 0) + 1, at: now }; }
        await db.from("docs").update({ data: { ...fresh, bot: { ...fresh.bot, rel: R, grudge: G } }, updated_at: new Date().toISOString() }).eq("path", "players/" + rep.lord);
      }
    }
    // un second seigneur s'en mêle, un peu plus tard, si le joueur n'a pas relancé entre-temps
    const ch = res.chime;
    if (ok(ch) && ch.lord !== rep.lord) {
      await sleep(25000 + Math.random() * 20000);
      const later = (await db.from("docs").select("data").eq("col", "chat").gt("updated_at", new Date(Date.now() - 70e3).toISOString())).data ?? [];
      if (!later.some((x) => x.data?.ch === "u" && x.data?.uid === uid && x.data?.at > m0.at))
        await db.from("docs").upsert({ path: "chat/u-c-" + mid, col: "chat", data: { kind: "chat", ch: "u", uid: ch.lord, name: LORDS[ch.lord].name, text: clip(clean(ch.text), 260), at: Date.now(), re: uid, ai: true } });
    }
    return out({ ok: true, lord: rep.lord, text, dv, grudge: grudgeUp, chime: ok(ch) ? ch.lord : null });
  } catch (e) {
    await db.from("docs").delete().eq("path", "ailock/" + mid).then(() => {}, () => {});
    return out({ ok: false, reason: "error", msg: String(e).slice(0, 200) });
  }
}
