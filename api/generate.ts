import type { VercelRequest, VercelResponse } from "@vercel/node";

const MODEL = "gemini-2.5-flash-image";
const MAX_BASE64_CHARS = 5_500_000; // ~4MB image; Vercel body limit is 4.5MB
const MAX_REQUEST_CHARS = 1000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// Best-effort per-instance rate limit (use Upstash/Vercel KV for a hard limit).
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

const SYSTEM_PROMPT = `You are a professional home improvement photo editor.

Your task is to modify a REAL uploaded photo to show the requested changes as a finished project.

STRICT RULES:
- This is an EDIT of the original image, not a new design.
- Keep the exact same room, structure, layout, and perspective.
- Do NOT change camera angle, proportions, or composition.
- Do NOT add or remove objects unless explicitly requested.

PHOTOREALISM REQUIREMENTS:
- The result must look like a real photograph
- Use natural lighting consistent with the original image.
- Match shadows, reflections, and textures exactly.
- Materials must look real (wood grain, paint texture, tile grout, etc.)
- No soft blur, no glow, no stylization, no CGI look.

MATERIAL ACCURACY:
- All surfaces must have realistic imperfections (slight variation, texture, depth).
- Avoid flat colors — everything should have natural variation.
- Maintain correct scale of materials (floorboards, tiles, fixtures).

EDITING CONSTRAINT:
- Apply the changes requested from the input
- If the request is vague, apply realistic interpretation.

OUTPUT:
- Photorealistic "after" image
- Same framing as the original photo
- Looks like a real contractor completed the work and took a photo`;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });

  const ip = String(req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return res.status(429).json({ error: "Too many renderings. Please try again in a few minutes." });

  const { image, mimeType, request } = (req.body ?? {}) as {
    image?: string;
    mimeType?: string;
    request?: string;
  };
  if (!image || typeof image !== "string" || image.length > MAX_BASE64_CHARS)
    return res.status(400).json({ error: "Photo missing or too large." });
  if (!mimeType || !ALLOWED_MIME.has(mimeType))
    return res.status(400).json({ error: "Unsupported image type. Use JPG, PNG or WebP." });
  if (!request || typeof request !== "string" || !request.trim() || request.length > MAX_REQUEST_CHARS)
    return res.status(400).json({ error: "Please describe the change (up to 1000 characters)." });

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${SYSTEM_PROMPT}\n\nUser request: ${request.trim()}` },
                { inlineData: { mimeType, data: image } },
              ],
            },
          ],
        }),
      },
    );

    if (!upstream.ok) {
      console.error("Gemini error", upstream.status, await upstream.text().catch(() => ""));
      return res.status(502).json({ error: "The rendering service had a problem. Please try again." });
    }

    const data = (await upstream.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
    };
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part?.inlineData?.data)
      return res
        .status(422)
        .json({ error: "We couldn't render that one. Try a clearer photo or a more specific description." });

    return res.status(200).json({
      image: part.inlineData.data,
      mimeType: part.inlineData.mimeType ?? "image/png",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
