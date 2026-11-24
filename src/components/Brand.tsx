/** Concept emblem only — final logo artwork is still to be produced per the brand kit. */
export function Emblem({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Justin Case Home Pros emblem">
      <circle cx="32" cy="32" r="30" fill="#164E53" />
      <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#E66F36" strokeWidth="1.5" transform="rotate(-25 32 32)" />
      <path d="M15 33 32 18l17 15v15H15z" fill="#FFF2D5" />
      <rect x="27" y="37" width="10" height="11" rx="2" fill="#E66F36" />
      <path d="M32 6l1.6 4.4L38 12l-4.4 1.6L32 18l-1.6-4.4L26 12l4.4-1.6z" fill="#E66F36" />
    </svg>
  );
}

export function Starburst({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M20 0l3.6 12.4L36 8l-6.4 11.2L40 20l-10.4.8L36 32l-12.4-4.4L20 40l-3.6-12.4L4 32l6.4-11.2L0 20l10.4-.8L4 8l12.4 4.4z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <Emblem />
      <div className="leading-none">
        <div className="font-display text-xl font-bold text-teal sm:text-2xl">
          Picture <span className="text-orange">This</span>
        </div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-ink/70">Justin Case Home Pros</div>
      </div>
    </div>
  );
}

export const QUOTE_URL: string = import.meta.env.VITE_QUOTE_URL || "#contact";
export const PHONE: string = import.meta.env.VITE_PHONE || "";
