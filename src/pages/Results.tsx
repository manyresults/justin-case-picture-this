import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { BeforeAfter } from "../components/BeforeAfter";
import { Starburst } from "../components/Brand";
import { openQuote } from "../components/Layout";
import { useApp } from "../state";

export default function Results() {
  const { ready, photo, request, after, status, error, generate, reset } = useApp();
  const nav = useNavigate();

  if (!ready) return null;
  if (!photo || !request) return <Navigate to="/" replace />;

  if (status === "generating") {
    return (
      <section className="mx-auto max-w-md space-y-6 py-12 text-center" aria-live="polite">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-full border-4 border-teal/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange border-t-transparent" />
          <Starburst className="absolute inset-0 m-auto h-12 w-12 animate-pulse text-teal" />
        </div>
        <h2 className="text-3xl font-bold">Making your home hum…</h2>
        <p className="font-semibold text-ink/75">This usually takes 15–30 seconds. Please keep this page open.</p>
      </section>
    );
  }

  if (status !== "done" || !after) {
    return (
      <section className="mx-auto max-w-md space-y-5 py-12 text-center">
        <h2 className="text-3xl font-bold">We hit a snag</h2>
        <p role="alert" className="font-semibold">{error ?? "Your picture wasn't finished. Let's try again."}</p>
        <div className="flex flex-col gap-3">
          <button className="btn btn-primary" onClick={generate}>Try Again</button>
          <Link to="/" className="btn btn-secondary">Edit My Description</Link>
        </div>
      </section>
    );
  }

  const save = () => {
    const a = document.createElement("a");
    a.href = after;
    a.download = "picture-this-after.png";
    a.click();
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="mb-1 inline-flex items-center gap-2 font-bold text-teal"><CheckCircle2 className="h-5 w-5 text-orange" /> Picture ready</p>
          <h1 className="text-4xl font-bold">Your new space</h1>
        </div>
        <div className="no-print flex gap-3">
          <button className="btn btn-secondary !py-2 !text-base" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</button>
          <button className="btn btn-secondary !py-2 !text-base" onClick={save}><Download className="h-4 w-4" /> Save Image</button>
        </div>
      </div>

      <BeforeAfter before={photo.dataUrl} after={after} caption={request} />
      <p className="text-center text-sm font-semibold text-ink/60">
        This is an AI illustration of an idea, not a promise of final materials, colors or scope. We confirm every detail in your quote.
      </p>

      <div className="no-print rounded-3xl bg-teal p-8 text-center sm:p-12">
        <h2 className="!text-cream text-3xl font-bold sm:text-4xl">Love what you see?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-cream/90">
          Let’s make it real. Get a clear quote from Justin Case Home Pros — and if a job needs a licensed specialist, we’ll point you to the right one.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="btn btn-primary !px-10 !py-4 !text-xl" onClick={openQuote}>Get a Quote Now</button>
          <button className="btn border-2 border-cream !px-10 !py-4 !text-xl text-cream hover:bg-cream hover:text-teal"
            onClick={() => { reset(); nav("/"); }}>Picture Another Space</button>
        </div>
      </div>
    </section>
  );
}
