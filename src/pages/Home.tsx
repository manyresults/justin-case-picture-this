import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, UploadCloud } from "lucide-react";
import { preparePhoto } from "../lib/image";
import { useApp } from "../state";

type Step = "hero" | "upload" | "describe" | "lead";
const LEAD_FORM_URL: string = import.meta.env.VITE_LEAD_FORM_URL || "";

export default function Home() {
  const { photo, setPhoto, request, setRequest, generate, submitLead } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("hero");
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const fileRef = useRef<HTMLInputElement>(null);

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

  function go(l?: typeof lead) {
    if (l) submitLead(l);
    generate();
    nav("/results");
  }

  return (
    <>
      {error && <div role="alert" className="mb-6 rounded-2xl border-2 border-orange bg-white p-4 font-semibold">{error}</div>}

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
          <button className="btn btn-primary !px-10 !py-4 !text-xl" onClick={() => setStep(photo ? "describe" : "upload")}>
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
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal"><UploadCloud className="h-10 w-10 text-cream" /></span>
            <span className="font-display text-xl font-semibold text-teal">Click to browse or drag and drop</span>
            <span className="text-sm font-semibold text-ink/60">JPG, PNG or WebP</span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </section>
      )}

      {step === "describe" && photo && (
        <section className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-center text-4xl font-bold">Describe your vision</h2>
          <div className="space-y-5 rounded-3xl border-2 border-teal bg-white p-6">
            <img src={photo.dataUrl} alt="Your uploaded space" className="h-52 w-full rounded-2xl object-cover" />
            <button className="text-sm font-bold text-teal underline" onClick={() => setStep("upload")}>Change photo</button>
            <label htmlFor="req" className="block font-display text-lg font-semibold text-teal">What should we change?</label>
            <textarea id="req" rows={4} maxLength={1000} className="field resize-none" value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="e.g. Paint the walls warm white, swap the carpet for light oak plank flooring, and add a grab bar by the tub." />
            <button className="btn btn-primary w-full" disabled={!request.trim()} onClick={() => setStep("lead")}>
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
                <button className="btn btn-primary mt-4 w-full" onClick={() => go()}>I’ve Submitted — Show My Picture <Sparkles className="h-5 w-5" /></button>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); go(lead); }} className="space-y-4">
                {([["name", "Name", "text", "name"], ["phone", "Phone", "tel", "tel"], ["email", "Email", "email", "email"]] as const).map(([k, label, type, ac]) => (
                  <div key={k}>
                    <label htmlFor={k} className="mb-1 block font-bold text-teal">{label}</label>
                    <input id={k} type={type} required autoComplete={ac} className="field" value={lead[k]}
                      onChange={(e) => setLead({ ...lead, [k]: e.target.value })} />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary w-full">Show My Picture <Sparkles className="h-5 w-5" /></button>
              </form>
            )}
          </div>
          <button className="mx-auto flex items-center gap-2 font-bold text-teal" onClick={() => setStep("describe")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </section>
      )}
    </>
  );
}
