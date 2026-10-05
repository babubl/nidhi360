import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, MessageSquareText, Search, Wrench } from "lucide-react";
import { search, type SearchResult } from "../lib/search";
import { cx } from "./ui";
import { track } from "../lib/track";

const KIND = {
  answer: { label: "Answer", icon: MessageSquareText },
  tool: { label: "Tool", icon: Wrench },
  term: { label: "Glossary", icon: BookOpen },
};

/** Problem search with live suggestions. Enter with nothing highlighted opens the full results page. */
export default function SearchBox({ size = "md", placeholder = "Describe your problem, e.g. claim pending for 30 days", autoFocus, initial = "", onSubmitted }: {
  size?: "lg" | "md" | "sm"; placeholder?: string; autoFocus?: boolean; initial?: string; onSubmitted?: () => void;
}) {
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const nav = useNavigate();
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const results: SearchResult[] = useMemo(() => (q.trim().length > 1 ? search(q, 6) : []), [q]);

  useEffect(() => setQ(initial), [initial]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (to: string) => { setOpen(false); setActive(-1); onSubmitted?.(); nav(to); };
  const submit = () => {
    track("Search", { matched: results.length > 0 });
    if (active >= 0 && results[active]) go(results[active].to);
    else if (q.trim()) go(`/answers?q=${encodeURIComponent(q.trim())}`);
  };

  const big = size === "lg";
  return (
    <div ref={box} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor={id} className="sr-only">Search PF and NPS help</label>
        <Search className={cx("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted", big ? "left-4 size-5" : "left-3 size-4")} aria-hidden />
        <input
          id={id} type="search" autoComplete="off" autoFocus={autoFocus} value={q} placeholder={placeholder}
          role="combobox" aria-expanded={open && results.length > 0} aria-controls={id + "-list"} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
            if (e.key === "Escape") setOpen(false);
          }}
          className={cx(
            "w-full rounded-xl border border-line bg-white text-ink outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
            big ? "py-4 pl-12 pr-28 text-[17px] shadow-[0_8px_24px_-12px_rgba(16,24,40,0.18)]" : size === "sm" ? "py-2 pl-9 pr-3 text-sm" : "py-3 pl-10 pr-3 text-[15px]",
          )}
        />
        {big && <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-700">Search</button>}
      </form>
      {open && results.length > 0 && (
        <ul id={id + "-list"} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-xl">
          {results.map((r, i) => {
            const K = KIND[r.kind];
            return (
              <li key={r.kind + r.to + r.title} id={`${id}-o${i}`} role="option" aria-selected={i === active}>
                <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(r.to)}
                  className={cx("flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left", i === active && "bg-canvas")}>
                  <K.icon className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug text-ink">{r.title}</span>
                    <span className="mt-0.5 line-clamp-1 text-[13px] text-muted">{K.label} · {r.snippet}</span>
                  </span>
                </button>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => go(`/answers?q=${encodeURIComponent(q.trim())}`)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-brand-600 hover:bg-canvas">
              See all results for "{q.trim()}"
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
