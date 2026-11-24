# Picture This — Justin Case Home Pros

Upload a photo → describe the change → lead capture → photorealistic "after" with a before/after slider → **Get a Quote**.

Branded with the *Atomic Age* direction from the Justin Case Home Pros brand kit
(Petrol Teal `#164E53`, Atomic Orange `#E66F36`, Buttercream `#FFF2D5`, Ink `#293638`; rounded Fredoka headings + Nunito body).

## Stack
React 18 + Vite + TypeScript + Tailwind. AI: Gemini 2.5 Flash Image via a Vercel serverless function (`api/generate.ts`) — **the API key never reaches the browser**.

## Run locally
```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY
npx vercel dev               # runs the SPA and /api together
```
(`npm run dev` serves the UI only; `/api/generate` needs `vercel dev`.)

## Deploy to Vercel
1. Push to GitHub, import the repo in Vercel (Framework: Vite, build `npm run build`, output `dist`).
2. Add env var `GEMINI_API_KEY` (server only). Optionally `VITE_QUOTE_URL`, `VITE_PHONE`, `VITE_LEAD_FORM_URL`, `VITE_LEAD_WEBHOOK_URL` (see `.env.example`).
3. Deploy, then add your domain.

## Notes
- Uploads are downscaled to 1600px JPEG in the browser; the function validates type/size/length and rate-limits per IP (in-memory, best effort — use Vercel KV/Upstash for a hard limit).
- The system prompt lives server-side in `api/generate.ts`.
- The emblem in `src/components/Brand.tsx` is a concept placeholder; swap in final logo artwork when approved.
- Footer shows only verified-safe info. Add phone/license via env/footer once confirmed.
