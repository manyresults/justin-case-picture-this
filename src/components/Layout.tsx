import { Link, Outlet, useNavigate } from "react-router-dom";
import { PHONE, QUOTE_URL, Starburst, Wordmark } from "./Brand";
import { useApp } from "../state";

export function openQuote() {
  if (QUOTE_URL.startsWith("#")) document.querySelector(QUOTE_URL)?.scrollIntoView({ behavior: "smooth" });
  else window.open(QUOTE_URL, "_blank", "noopener");
}

export default function Layout() {
  const { reset } = useApp();
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b-4 border-teal bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" onClick={() => { reset(); nav("/"); }} aria-label="Picture This home"><Wordmark /></Link>
          <button onClick={openQuote} className="btn btn-primary hidden !py-2 !text-base sm:inline-flex">Get a Quote</button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
        <Starburst className="pointer-events-none absolute -left-6 top-24 h-24 w-24 text-orange/25" />
        <Starburst className="pointer-events-none absolute -right-8 bottom-20 h-32 w-32 text-teal/10" />
        <div className="relative mx-auto max-w-4xl"><Outlet /></div>
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
