// Funzione Netlify: legge e salva i punteggi live della lega.
// GET  /api/live  -> pubblico, restituisce lo stato di tutte le partite
// POST /api/live  -> solo admin (header X-Admin-Key = ADMIN_PASSWORD), salva una partita
import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

// confronto a tempo costante
function sameKey(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const ID_RE = /^(sa|ci)\d{1,2}-\d{1,2}$/; // es. sa11-0 (eSerie A, 11ª giornata, 1ª partita)
const num = (x, min, max, def) => (Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : def);

function cleanSide(x) {
  return {
    b: num(x?.b, 0, 200, 66),
    ev: (Array.isArray(x?.ev) ? x.ev : []).slice(0, 200).map((e) => ({
      k: String(e?.k ?? "").slice(0, 12),
      p: String(e?.p ?? "").slice(0, 40),
      v: num(e?.v, -20, 20, 0),
      t: Number.isFinite(e?.t) ? e.t : Date.now(),
    })),
  };
}

function cleanMatch(d) {
  return {
    s: ["pre", "live", "final"].includes(d?.s) ? d.s : "pre",
    h: cleanSide(d?.h),
    a: cleanSide(d?.a),
    u: Date.now(),
  };
}

export default async (req) => {
  const store = getStore({ name: "live", consistency: "strong" });

  if (req.method === "GET") {
    const state = (await store.get("state", { type: "json" })) || { matches: {} };
    return json(state);
  }

  if (req.method === "POST") {
    const pass = Netlify.env.get("ADMIN_PASSWORD") || "";
    if (!pass || !sameKey(req.headers.get("x-admin-key") || "", pass)) {
      return json({ error: "unauthorized" }, 401);
    }
    if (Number(req.headers.get("content-length") || 0) > 200000) return json({ error: "too_large" }, 413);
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad_request" }, 400);
    }
    if (body?.check) return json({ ok: true });
    if (!ID_RE.test(String(body?.id ?? ""))) return json({ error: "bad_id" }, 400);
    const state = (await store.get("state", { type: "json" })) || { matches: {} };
    state.matches = state.matches || {};
    state.matches[body.id] = cleanMatch(body.data);
    state.u = Date.now();
    await store.setJSON("state", state);
    return json({ ok: true });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/live" };
