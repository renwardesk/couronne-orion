// Couronne d'Orion : prévient un joueur sur son téléphone quand une flotte d'attaque part vers l'une de ses planètes.
// Appelée par le déclencheur de la base (docs_notify_attack). GET ?key renvoie la clé publique VAPID.
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
import webpush from "npm:web-push@3.6.7";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey", "Content-Type": "application/json" };
const NPC = "npc-pill";

async function vapid() {
  const { data } = await db.from("push_vapid").select("pub, priv").eq("id", 1).maybeSingle();
  if (data) return data;
  const k = webpush.generateVAPIDKeys();
  await db.from("push_vapid").upsert({ id: 1, pub: k.publicKey, priv: k.privateKey }, { onConflict: "id", ignoreDuplicates: true });
  const again = await db.from("push_vapid").select("pub, priv").eq("id", 1).single();
  return again.data!;
}
const doc = async (path: string) => (await db.from("docs").select("data").eq("path", path).maybeSingle()).data?.data ?? null;
const hhmm = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const keys = await vapid();
    if (req.method === "GET") return new Response(JSON.stringify({ pub: keys.pub }), { headers: CORS });

    const { path } = await req.json().catch(() => ({}));
    if (typeof path !== "string" || !path.startsWith("fleets/")) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: CORS });
    // tout est relu dans la base : un appel extérieur ne peut pas inventer une attaque
    const f = await doc(path);
    if (!f || f.mission !== "attack" || f.phase !== "out" || !(f.arrive > Date.now())) return new Response(JSON.stringify({ ok: true, skip: "not-attack" }), { headers: CORS });
    const target = await doc("planets/" + f.to);
    const victim = target?.owner;
    if (!victim || victim === f.owner) return new Response(JSON.stringify({ ok: true, skip: "no-victim" }), { headers: CORS });
    const k = `${f.fid}:${f.to}:${f.arrive}`;
    const { error: dup } = await db.from("push_sent").insert({ k });
    if (dup) return new Response(JSON.stringify({ ok: true, skip: "dup" }), { headers: CORS });

    const who = f.owner === NPC ? "Les Pillards du Néant" : ((await doc("players/" + f.owner))?.name ?? "Un empire");
    const what = target.capital ? "ta capitale" : target.outpost ? "un de tes avant-postes" : "une de tes colonies";
    const payload = JSON.stringify({ title: "⚔ Attaque en approche", body: `${who} ${f.owner === NPC ? "foncent" : "attaque"} sur ${what}. Arrivée à ${hhmm(f.arrive)}.`, tag: "atk-" + f.fid });

    webpush.setVapidDetails("https://renwardesk.github.io/couronne-orion/", keys.pub, keys.priv);
    const { data: subs } = await db.from("push_subs").select("endpoint, sub").eq("uid", victim);
    let sent = 0;
    for (const s of subs ?? []) {
      try { await webpush.sendNotification(s.sub, payload, { TTL: 3600, urgency: "high" }); sent++; }
      catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint); }
    }
    return new Response(JSON.stringify({ ok: true, sent }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: CORS });
  }
});
