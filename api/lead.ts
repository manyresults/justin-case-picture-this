import type { VercelRequest, VercelResponse } from "@vercel/node";

// Forwards leads to a GoHighLevel inbound-webhook workflow. The URL stays server-side.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 10;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const hook = process.env.GHL_WEBHOOK_URL;
  if (!hook) return res.status(500).json({ error: "Lead webhook not configured." });

  const ip = String(req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > MAX_HITS) return res.status(429).json({ error: "Too many requests." });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const name = clean(b.name, 120);
  const phone = clean(b.phone, 40);
  const email = clean(b.email, 200);
  if (!name || !phone || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Invalid lead." });

  const [firstName, ...rest] = name.split(/\s+/);
  try {
    const r = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName: rest.join(" "),
        name,
        phone,
        email,
        request: clean(b.request, 1000),
        source: "Picture This",
        pageUrl: clean(b.pageUrl, 300),
      }),
    });
    if (!r.ok) {
      console.error("GHL webhook failed", r.status);
      return res.status(502).json({ error: "Lead delivery failed." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Lead delivery failed." });
  }
}
