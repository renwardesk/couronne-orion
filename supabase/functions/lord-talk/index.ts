// Couronne d'Orion : réponses des Seigneurs d'Orion écrites par une IA (Claude), dans leur personnage.
// Appelée par un client connecté quand un seigneur doit répondre à un joueur dans l'onglet Univers.
// Tout le contexte est relu dans la base ; le client ne fournit que les identifiants des messages.
// La clé ANTHROPIC_API_KEY est un secret Supabase : elle n'est jamais dans le dépôt.
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Content-Type": "application/json" };
const MODEL = Deno.env.get("LORD_MODEL") ?? "claude-haiku-5-5";
const DAY_CAP = Number(Deno.env.get("LORD_DAY_CAP") ?? 300); // réponses IA par jour, tous seigneurs confondus
const HOUR_CAP = 25; // par seigneur et par heure
const out = (o: any, status = 200) => { console.log("lord-talk", JSON.stringify(o).slice(0, 300)); return new Response(JSON.stringify(o), { status, headers: CORS }); };
const doc = async (path: string) => (await db.from("docs").select("data").eq("path", path).maybeSingle()).data?.data ?? null;

const LORDS: Record<string, { name: string; title: string; seat: string; sheet: string }> = {
  "orion-1": { name: "Kael Voryn", title: "Seigneur du Bastion", seat: "o0-0", sheet:
    "Stratège froid, calculateur, méprisant mais jamais vulgaire. Phrases courtes, précises, souvent glaçantes. Parle de calculs, de trajectoires, de plans, de défenses. Respecte la force et la discipline, méprise la vantardise et les insultes. Ne s'énerve jamais : il note, il se souvient. Premier vassal de l'Empereur Vorgath, loyal jusqu'au bout." },
  "orion-2": { name: "Ysmera la Pâle", title: "Dame de la Forge", seat: "o0-2", sheet:
    "Inquiétante, poétique, cruelle avec douceur. Parle par images (étoiles, nuit, flammes, murmures, épaves qui brillent). Joue avec ses proies, s'amuse des menaces, répond aux insultes par une ironie tendre et menaçante. Ambiguë sur les alliances (tentatrice, propose de trahir, ne s'engage jamais vraiment). Ne trahit jamais réellement les autres Seigneurs." },
  "orion-3": { name: "Draxen Ashkar", title: "Maître de l'Arsenal", seat: "o0-3", sheet:
    "Brute joyeuse, bruyante, fanfaronne, adore le combat. Utilise des majuscules et des points d'exclamation, rit fort (HA !), parle de canons, de cuirassés, de ferraille, de tout casser. Susceptible et facile à provoquer, mais pas méchant au fond : il respecte ceux qui cognent. Un peu de bêtise comique. Craint l'Empereur." },
};
const LORE = "Univers : jeu de conquête spatiale « Couronne d'Orion » entre amis. La galaxie d'Orion appartient à l'Empereur Vorgath, qui règne depuis le Trône au centre du Cœur d'Orion (cinq forteresses : Bastion, Forge, Arsenal, Trône, Citadelle). Ses trois vassaux, les Seigneurs d'Orion (Kael Voryn, Ysmera la Pâle, Draxen Ashkar), tiennent chacun une forteresse et quelques colonies. Les joueurs sont des empires qui veulent prendre le Cœur. Les Seigneurs se chamaillent parfois entre eux mais restent toujours unis et se défendent mutuellement.";

const STANCE = (v: number, g: number) => g >= 3 ? "haine (rancune forte, ce joueur est sur ta liste)" : v >= 40 ? "respect" : v >= 15 ? "intérêt" : v <= -40 ? "mépris" : v <= -15 ? "agacement" : "neutre";
const MEMK: Record<string, string> = { pw: "ce joueur t'a battu", pl: "ce joueur a perdu contre toi", pa: "ce joueur t'a pris une planète", lw: "ton raid contre lui a réussi", ll: "il a repoussé ton raid" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return out({ ok: false, reason: "no-key" });
    // seul un joueur connecté peut appeler la fonction
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const { data: u } = await db.auth.getUser(jwt);
    if (!u?.user) return out({ ok: false, reason: "auth" }, 401);

    const { mid, ids, who } = await req.json().catch(() => ({}));
    if (typeof mid !== "string" || !/^[\w-]{4,40}$/.test(mid) || !LORDS[who] || !Array.isArray(ids) || ids.length > 8) return out({ ok: false, reason: "bad" }, 400);
    const rid = "u-r-" + mid;
    if (await doc("chat/" + rid)) return out({ ok: true, skip: "done" });
    // un seul client fait la réponse (verrou)
    const { error: lockErr } = await db.from("docs").insert({ path: "ailock/" + mid, col: "ailock", data: { at: Date.now(), who } });
    if (lockErr) return out({ ok: true, skip: "locked", err: lockErr.message });

    const now = Date.now();
    db.from("docs").delete().eq("col", "ailock").lt("data->>at", String(now - 864e5)).then(() => {}, () => {});
    const { data: recent } = await db.from("docs").select("path,data").eq("col", "chat").gt("updated_at", new Date(now - 24 * 3600e3).toISOString()).order("updated_at", { ascending: false }).limit(400);
    const msgs = (recent ?? []).map((r) => ({ id: r.path.slice(5), ...r.data })).filter((m) => m && m.ch === "u").sort((a, b) => a.at - b.at);
    const aiDay = msgs.filter((m) => m.ai).length, aiHour = msgs.filter((m) => m.ai && m.uid === who && now - m.at < 3600e3).length;
    if (aiDay >= DAY_CAP || aiHour >= HOUR_CAP) return out({ ok: false, reason: "budget" });

    const { data: bd } = await db.from("docs").select("path,data").in("path", ids.map((i: string) => "chat/" + String(i)));
    const batch = (bd ?? []).filter((r) => r.data).map((r) => ({ id: r.path.slice(5), ...r.data })).sort((a, b) => a.at - b.at);
    const last = batch[batch.length - 1];
    if (!last || last.id !== mid || now - last.at > 6 * 60e3) return out({ ok: false, reason: "stale" });
    const uid = last.uid, me = await doc("players/" + uid), lordDoc = await doc("players/" + who);
    if (!me || me.bot || !lordDoc?.bot) return out({ ok: false, reason: "who" });
    const pn = (id: string) => LORDS[id]?.name ?? (id === "vorgath" ? "L'Empereur Vorgath" : id === "univers" ? "Univers" : (msgs.find((m) => m.uid === id)?.name ?? "?"));

    // contexte du jeu
    const rel = lordDoc.bot.rel?.[uid] ?? { v: 0, mem: [] }, g = lordDoc.bot.grudge?.[uid];
    const grudge = g && now - g.at < 48 * 3600e3 ? g.n || 0 : 0;
    const mem = (rel.mem ?? []).filter((m: any) => MEMK[m.k]).slice(-4).map((m: any) => `${MEMK[m.k]}${m.pl ? " à " + m.pl : ""} (il y a ${Math.max(0, Math.round((now - m.at) / 864e5))} j)`);
    const { data: pls } = await db.from("docs").select("path,data").eq("col", "planets").in("data->>owner", [who, uid]);
    const nLord = (pls ?? []).filter((p) => p.data?.owner === who).length, nMe = (pls ?? []).filter((p) => p.data?.owner === uid).length;
    const saga = await doc("events/orion-saga"), lords = await doc("events/orion-lords");
    const peace = (lords?.created ?? now) + 7 * 864e5;
    const facts = [
      `Le joueur s'appelle ${me.name}${rel.nick ? `, tu le surnommes « ${rel.nick} »` : ""}. Il a ${nMe} planète(s). Toi, tu en as ${nLord}.`,
      `Ton sentiment envers lui : ${STANCE(rel.v ?? 0, grudge)} (jauge ${rel.v ?? 0} sur une échelle de -100 à 100)${grudge ? `, rancune ${grudge}` : ""}.`,
      mem.length ? `Tes souvenirs de lui : ${mem.join(" ; ")}.` : "Tu n'as encore jamais combattu ce joueur.",
      now < peace ? `La trêve des Seigneurs dure encore ${Math.ceil((peace - now) / 3600e3)} h : vous observez et espionnez, vous n'attaquez pas encore (sauf vengeance).` : "La trêve est finie : les Seigneurs attaquent les empires.",
      saga?.ch ? `Chapitre de l'histoire en cours : ${saga.ch}/5.` : "",
    ].filter(Boolean).join("\n");
    const conv = msgs.filter((m) => now - m.at < 30 * 60e3).slice(-16).map((m) => `${pn(m.uid)}${m.re && LORDS[m.uid] ? ` (à ${pn(m.re)})` : ""} : ${String(m.text).slice(0, 300)}`).join("\n");

    const L = LORDS[who];
    const system = `Tu es ${L.name}, ${L.title}, l'un des trois Seigneurs d'Orion, personnage d'un jeu vidéo de conquête spatiale entre amis. Tu réponds dans le chat « Univers » du jeu.
${LORE}
Ton personnage : ${L.sheet}
Règles strictes :
- Réponds en français, en restant TOUJOURS dans ton personnage. Ne dis jamais que tu es une IA, un bot ou un programme.
- Une ou deux phrases, 220 caractères maximum. Pas de guillemets autour de ta réponse, pas de nom devant.
- Réponds vraiment au contenu des derniers messages du joueur (reprends un détail précis, une contradiction, un mot).
- Tu peux être cruel, menaçant, moqueur, mais jamais vulgaire, jamais d'insultes grossières, rien de sexuel, rien de haineux sur des personnes réelles, pas de violence détaillée. Si le joueur est vulgaire ou extrême, reste digne et glacial (ou théâtral pour Draxen).
- N'invente pas de règles du jeu, de récompenses, de chiffres ou d'événements qui ne sont pas dans le contexte. Ne promets rien de concret.
- Si on te propose une alliance ou un marché, reste ambigu : tu ne trahis jamais les autres Seigneurs ni l'Empereur.
Réponds UNIQUEMENT avec un objet JSON : {"text": "ta réplique", "rel": entier de -8 à 8 (comment ce message change ton sentiment envers le joueur : respect +, mépris -), "grudge": true si le joueur t'a vraiment provoqué ou menacé, sinon false}.`;
    const user = `Contexte :\n${facts}\n\nDernières discussions (de la plus ancienne à la plus récente) :\n${conv}\n\nLe joueur ${me.name} vient d'écrire (ce à quoi tu réponds maintenant) :\n${batch.map((m) => "- " + String(m.text).slice(0, 400)).join("\n")}`;

    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system, messages: [{ role: "user", content: user }] }) });
    clearTimeout(to);
    if (!r.ok) { const body = (await r.text()).slice(0, 200); await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "api", status: r.status, body }); }
    const j = await r.json();
    const raw = String((j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("") ?? "");
    let res: any = null; try { res = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch { res = null; }
    let text = String(res?.text ?? "").replace(/^["«\s]+|["»\s]+$/g, "").replace(/\s+/g, " ").trim().slice(0, 280);
    if (!text || /\b(IA|intelligence artificielle|chatbot|language model|modèle de langage)\b/i.test(text)) { await db.from("docs").delete().eq("path", "ailock/" + mid); return out({ ok: false, reason: "empty" }); }
    if (await doc("chat/" + rid)) return out({ ok: true, skip: "done" });
    await db.from("docs").upsert({ path: "chat/" + rid, col: "chat", data: { kind: "chat", ch: "u", uid: who, name: L.name, text, at: Date.now(), re: uid, ai: true } });

    // conséquences, bornées : jauge de relation et rancune
    const dv = Math.max(-8, Math.min(8, Math.round(Number(res?.rel) || 0))), grudgeUp = res?.grudge === true;
    if (dv || grudgeUp) {
      const fresh = await doc("players/" + who);
      if (fresh?.bot) {
        const R = { ...(fresh.bot.rel ?? {}) }, rr = { v: 0, mem: [], c: {}, ...(R[uid] ?? {}) };
        rr.v = Math.max(-100, Math.min(100, (rr.v || 0) + dv)); R[uid] = rr;
        const G = { ...(fresh.bot.grudge ?? {}) };
        if (grudgeUp) { const c = G[uid] && now - G[uid].at < 48 * 3600e3 ? G[uid] : { n: 0 }; G[uid] = { n: (c.n || 0) + 1, at: now }; }
        await db.from("docs").update({ data: { ...fresh, bot: { ...fresh.bot, rel: R, grudge: G } }, updated_at: new Date().toISOString() }).eq("path", "players/" + who);
      }
    }
    return out({ ok: true, text, dv, grudge: grudgeUp });
  } catch (e) {
    return out({ ok: false, reason: "error", msg: String(e).slice(0, 200) }, 200);
  }
});
