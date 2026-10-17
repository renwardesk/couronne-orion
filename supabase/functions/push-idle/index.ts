// Couronne d'Orion : rappelle aux joueurs, sur leur téléphone, qu'une file de construction ou un chantier spatial est à l'arrêt.
// Appelée toutes les 15 minutes par pg_cron. Au plus un rappel par joueur toutes les 8 heures (table push_sent), jamais la nuit.
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
import webpush from "npm:web-push@3.6.7";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const J = { "Content-Type": "application/json" };
const MIN = 60_000;

Deno.serve(async () => {
  try {
    const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Paris" }));
    if (hour < 8 || hour >= 23) return new Response(JSON.stringify({ ok: true, skip: "nuit" }), { headers: J }); // pas de rappel la nuit
    const { data: keys } = await db.from("push_vapid").select("pub, priv").eq("id", 1).maybeSingle();
    if (!keys) return new Response(JSON.stringify({ ok: false, error: "no-vapid" }), { headers: J });
    webpush.setVapidDetails("https://renwardesk.github.io/couronne-orion/", keys.pub, keys.priv);
    const { data: subs } = await db.from("push_subs").select("endpoint, uid, sub");
    const byUid = new Map<string, { endpoint: string; sub: unknown }[]>();
    for (const s of subs ?? []) { const l = byUid.get(s.uid) ?? []; l.push(s); byUid.set(s.uid, l); }
    if (!byUid.size) return new Response(JSON.stringify({ ok: true, sent: 0 }), { headers: J });
    const { data: rows } = await db.from("docs").select("path, data").eq("col", "planets").not("data", "is", null);
    const now = Date.now(), todo = new Map<string, { b: string[]; s: string[]; keys: string[] }>();
    for (const r of rows ?? []) {
      const p = r.data as Record<string, any>;
      if (!p?.owner || !byUid.has(p.owner) || p.kind !== "planet") continue;
      const name = (p.pid as string) ?? r.path, t = todo.get(p.owner) ?? { b: [], s: [], keys: [] };
      if (!p.outpost) {
        const lastB = Math.max(0, ...((p.bq ?? []) as { until: number }[]).map((x) => x.until || 0));
        if (lastB < now - 5 * MIN) { t.b.push(name); t.keys.push(`idle-b:${p.pid}:${lastB}`); }
        if ((p.lv?.yard ?? 0) >= 1) {
          const lastS = Math.max(0, ...((p.shipQ ?? []) as { start: number; n: number; per: number }[]).map((x) => (x.start || 0) + (x.n || 0) * (x.per || 0) * 1000));
          if (lastS < now - 5 * MIN) { t.s.push(name); t.keys.push(`idle-s:${p.pid}:${lastS}`); }
        }
      }
      todo.set(p.owner, t);
    }
    let sent = 0;
    for (const [uid, t] of todo) {
      if (!t.keys.length) continue;
      // un seul rappel par tranche de 8 heures
      const { error: dup } = await db.from("push_sent").insert({ k: `idle:${uid}:${Math.floor(now / (8 * 60 * MIN))}` });
      if (dup) continue;
      const fresh = t.keys;
      const b = fresh.some((k) => k.startsWith("idle-b:")), s = fresh.some((k) => k.startsWith("idle-s:"));
      const body = b && s ? "Ta file de construction et ton chantier spatial sont à l’arrêt. Lance de nouveaux travaux !"
        : b ? "Ta file de construction est vide. Lance une nouvelle amélioration !" : "Ton chantier spatial est à l’arrêt. Construis de nouveaux vaisseaux !";
      const payload = JSON.stringify({ title: "🛠 Ton empire t’attend", body, tag: "idle" });
      for (const s2 of byUid.get(uid) ?? []) {
        try { await webpush.sendNotification(s2.sub as webpush.PushSubscription, payload, { TTL: 3 * 3600, urgency: "normal" }); sent++; }
        catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) await db.from("push_subs").delete().eq("endpoint", s2.endpoint); }
      }
    }
    return new Response(JSON.stringify({ ok: true, sent }), { headers: J });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: J });
  }
});
