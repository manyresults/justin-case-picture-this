import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Printer, Sparkles, UploadCloud } from "lucide-react";
import { BeforeAfter } from "./components/BeforeAfter";
import { PHONE, QUOTE_URL, Starburst, Wordmark } from "./components/Brand";
import { preparePhoto, type PreparedPhoto } from "./lib/image";

type Step = "hero" | "upload" | "describe" | "lead" | "generating" | "result";

const LEAD_FORM_URL: string = import.meta.env.VITE_LEAD_FORM_URL || "";
const LEAD_WEBHOOK_URL: string = import.meta.env.VITE_LEAD_WEBHOOK_URL || "";

function openQuote() {
  if (QUOTE_URL.startsWith("#")) document.querySelector(QUOTE_URL)?.scrollIntoView({ behavior: "smooth" });
  else window.open(QUOTE_URL, "_blank", "noopener");
}

export default function App() {
  const [step, setStep] = useState<Step>("hero");
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [request, setRequest] = useState("");
  const [after, setAfter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("hero"); setPhoto(null); setRequest(""); setAfter(null); setError(null);
  };

  async function onFile(file?: File) {
    if (!file) return;
    setError(null);
    try {
      setPhoto(await preparePhoto(file));
      setStep("describe");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function generate() {
    if (!photo) return;
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo.base64, mimeType: photo.mimeType, request }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setAfter(`data:${data.mimeType};base64,${data.image}`);
      setStep("result");
    } catch (e) {
      setError((e as Error).message);
      setStep("describe");
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (LEAD_WEBHOOK_URL) {
      // Best effort: never block the rendering on the CRM call.
      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ ...lead, request, source: "Picture This" }),
      }).catch(() => undefined);
    }
    generate();
  }

  function save() {
    if (!after) return;
    const a = document.createElement("a");
    a.href = after;
    a.download = "picture-this-after.png";
    a.click();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b-4 border-teal bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={reset} aria-label="Picture This home"><Wordmark /></button>
          <button onClick={openQuote} className="btn btn-primary hidden !py-2 !text-base sm:inline-flex">Get a Quote</button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
        <Starburst className="pointer-events-none absolute -left-6 top-24 h-24 w-24 text-orange/25" />
        <Starburst className="pointer-events-none absolute -right-8 bottom-20 h-32 w-32 text-teal/10" />

        <div className="relative mx-auto max-w-4xl">
          {error && (
            <div role="alert" className="mb-6 rounded-2xl border-2 border-orange bg-white p-4 font-semibold text-ink">
              {error}
            </div>
          )}

          {step === "hero" && (
            <section className="space-y-8 py-6 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-1.5 text-sm font-bold text-cream">
                <Sparkles className="h-4 w-4 text-orange" /> A brighter fix for home
              </p>
              <h1 className="text-5xl font-bold leading-[1.05] sm:text-7xl">
                Picture this: <span className="text-orange">your home, finished.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg font-semibold text-ink/80 sm:text-xl">
                Snap a photo of the room or spot you want updated, tell us what you have in mind, and see a photorealistic
                “after” in seconds. Then let Justin Case Home Pros make it real.
              </p>
              <button className="btn btn-primary !px-10 !py-4 !text-xl" onClick={() => setStep("upload")}>
                Start Your Picture <ArrowRight className="h-5 w-5" />
              </button>
              <ol className="mx-auto grid max-w-3xl gap-4 pt-6 text-left sm:grid-cols-3">
                {["Upload a photo", "Describe the change", "Slide to compare"].map((t, i) => (
                  <li key={t} className="rounded-2xl border-2 border-teal bg-white p-5">
                    <span className="font-display text-3xl font-bold text-orange">{i + 1}</span>
                    <p className="font-display text-lg font-semibold text-teal">{t}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {step === "upload" && (
            <section className="mx-auto max-w-2xl space-y-6 text-center">
              <h2 className="text-4xl font-bold">Upload your photo</h2>
              <p className="font-semibold text-ink/75">A clear, well-lit photo of the space works best.</p>
              <button
                className="flex w-full flex-col items-center gap-4 rounded-3xl border-4 border-dashed border-teal/50 bg-white p-12 transition hover:border-orange"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal">
                  <UploadCloud className="h-10 w-10 text-cream" />
                </span>
                <span className="font-display text-xl font-semibold text-teal">Click to browse or drag and drop</span>
                <span className="text-sm font-semibold text-ink/60">JPG, PNG or WebP</span>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])} />
            </section>
          )}

          {step === "describe" && photo && (
            <section className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-center text-4xl font-bold">Describe your vision</h2>
              <div className="space-y-5 rounded-3xl border-2 border-teal bg-white p-6">
                <img src={photo.dataUrl} alt="Your uploaded space" className="h-52 w-full rounded-2xl object-cover" />
                <button className="text-sm font-bold text-teal underline" onClick={() => setStep("upload")}>Change photo</button>
                <label htmlFor="req" className="block font-display text-lg font-semibold text-teal">
                  What should we change?
                </label>
                <textarea
                  id="req" rows={4} maxLength={1000} className="field resize-none" value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="e.g. Paint the walls warm white, swap the carpet for light oak plank flooring, and add a grab bar by the tub."
                />
                <button className="btn btn-primary w-full" disabled={!request.trim()}
                  onClick={() => { setError(null); setStep("lead"); }}>
                  Show My Picture <Sparkles className="h-5 w-5" />
                </button>
              </div>
            </section>
          )}

          {step === "lead" && (
            <section className="mx-auto max-w-2xl space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold">Almost there!</h2>
                <p className="mt-2 font-semibold text-ink/75">Where should we send your quote follow-up? Then your picture appears.</p>
              </div>
              <div className="overflow-hidden rounded-3xl border-2 border-teal bg-white p-6">
                {LEAD_FORM_URL ? (
                  <>
                    <iframe src={LEAD_FORM_URL} title="Contact form" className="h-[572px] w-full border-0" />
                    <button className="btn btn-primary mt-4 w-full" onClick={generate}>
                      I’ve Submitted — Show My Picture <Sparkles className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <form onSubmit={submitLead} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="mb-1 block font-bold text-teal">Name</label>
                      <input id="name" required autoComplete="name" className="field" value={lead.name}
                        onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1 block font-bold text-teal">Phone</label>
                      <input id="phone" type="tel" required autoComplete="tel" className="field" value={lead.phone}
                        onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1 block font-bold text-teal">Email</label>
                      <input id="email" type="email" required autoComplete="email" className="field" value={lead.email}
                        onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                      Show My Picture <Sparkles className="h-5 w-5" />
                    </button>
                  </form>
                )}
              </div>
              <button className="mx-auto flex items-center gap-2 font-bold text-teal" onClick={() => setStep("describe")}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </section>
          )}

          {step === "generating" && (
            <section className="mx-auto max-w-md space-y-6 py-12 text-center" aria-live="polite">
              <div className="relative mx-auto h-32 w-32">
                <div className="absolute inset-0 rounded-full border-4 border-teal/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange border-t-transparent" />
                <Starburst className="absolute inset-0 m-auto h-12 w-12 animate-pulse text-teal" />
              </div>
              <h2 className="text-3xl font-bold">Making your home hum…</h2>
              <p className="font-semibold text-ink/75">This usually takes 15–30 seconds.</p>
            </section>
          )}

          {step === "result" && photo && after && (
            <section className="space-y-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="mb-1 inline-flex items-center gap-2 font-bold text-teal">
                    <CheckCircle2 className="h-5 w-5 text-orange" /> Picture ready
                  </p>
                  <h2 className="text-4xl font-bold">Your new space</h2>
                </div>
                <div className="no-print flex gap-3">
                  <button className="btn btn-secondary !py-2 !text-base" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print
                  </button>
                  <button className="btn btn-secondary !py-2 !text-base" onClick={save}>
                    <Download className="h-4 w-4" /> Save Image
                  </button>
                </div>
              </div>

              <BeforeAfter before={photo.dataUrl} after={after} caption={request} />
              <p className="text-center text-sm font-semibold text-ink/60">
                This is an AI illustration of an idea, not a promise of final materials, colors or scope. We confirm every detail in your quote.
              </p>

              <div className="no-print rounded-3xl bg-teal p-8 text-center sm:p-12">
                <h3 className="!text-cream text-3xl font-bold sm:text-4xl">Love what you see?</h3>
                <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-cream/90">
                  Let’s make it real. Get a clear quote from Justin Case Home Pros — and if a job needs a licensed specialist, we’ll point you to the right one.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button className="btn btn-primary !px-10 !py-4 !text-xl" onClick={openQuote}>Get a Quote Now</button>
                  <button className="btn border-2 border-cream text-cream hover:bg-cream hover:text-teal !px-10 !py-4 !text-xl" onClick={reset}>
                    Picture Another Space
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer id="contact" className="border-t-4 border-orange bg-teal px-4 py-12 text-cream sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <h3 className="!text-cream text-3xl font-bold">Ready to fix, upgrade, or improve something?</h3>
            <button className="btn btn-primary" onClick={openQuote}>Request a Quote</button>
          </div>
          <div className="space-y-2 font-semibold md:border-l md:border-cream/20 md:pl-10">
            <h4 className="!text-orange text-xl font-bold">Justin Case Home Pros</h4>
            <p>Serving homeowners across Lower Bucks County, PA</p>
            {PHONE && <p><a className="underline hover:text-orange" href={`tel:${PHONE.replace(/[^\d+]/g, "")}`}>{PHONE}</a></p>}
            <p className="pt-3 text-sm text-cream/70">A brighter fix for home.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
