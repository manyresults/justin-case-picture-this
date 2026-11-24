import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function BeforeAfter({ before, after, caption }: { before: string; after: string; caption: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="group relative aspect-video w-full select-none overflow-hidden rounded-3xl border-4 border-teal bg-ink shadow-xl">
      <img src={after} alt="After rendering" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Original photo" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-1 bg-orange" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-orange bg-cream shadow-lg">
          <ChevronsLeftRight className="h-5 w-5 text-teal" />
        </div>
      </div>
      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-teal px-4 py-1.5 text-sm font-bold text-cream">Before</span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-orange px-4 py-1.5 text-sm font-bold text-ink">After</span>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 text-sm font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100">
        “{caption}”
      </p>
      {/* Native range input gives mouse, touch and keyboard control */}
      <input
        type="range" min={0} max={100} step={0.5} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
