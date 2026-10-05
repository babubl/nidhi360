import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { track } from "../lib/track";
import { config } from "../config";
import { cx } from "./ui";

/** "Did this solve it?" — the resolution metric. A "no" routes straight to the next best help. */
export function ResolvedPrompt({ id, topic }: { id: string; topic: string }) {
  const key = "n360:resolved:" + id;
  const [v, setV] = useState<"yes" | "no" | null>(() => { try { return localStorage.getItem(key) as "yes" | "no" | null; } catch { return null; } });
  const answer = (x: "yes" | "no") => {
    setV(x);
    try { localStorage.setItem(key, x); } catch { /* storage blocked */ }
    track(x === "yes" ? "Resolved" : "Not resolved", { page: id });
  };
  return (
    <div className="no-print rounded-xl border border-line p-4">
      {!v && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-ink">Did this solve your problem?</p>
          <div className="flex gap-2">
            <button onClick={() => answer("yes")} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:border-brand-200 hover:bg-brand-50"><ThumbsUp className="size-4" />Yes</button>
            <button onClick={() => answer("no")} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:border-red-200 hover:bg-red-50"><ThumbsDown className="size-4" />Not yet</button>
          </div>
        </div>
      )}
      {v === "yes" && <p className="flex items-center gap-2 text-[15px] text-emerald-700"><Check className="size-4" />Glad it helped. Share it with someone who's stuck with the same problem.</p>}
      {v === "no" && (
        <div className="text-[15px]">
          <p className="font-semibold text-ink">Sorry it didn't. Here's what to do next:</p>
          <ul className="mt-2 space-y-1.5 text-body">
            <li>• <Link to="/pf/grievance" className="font-semibold text-brand-700">File a complaint with EPFO</Link>: we draft it for you.</li>
            <li>• <Link to="/answers" className="font-semibold text-brand-700">Search other answers</Link> in your own words.</li>
            {config.whatsapp && <li>• <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hi Nidhi360, I need help with: " + topic)}`} onClick={() => track("Expert contact", { page: id })} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700">Talk to a PF expert on WhatsApp</a></li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/** WhatsApp is where Indian users share money tips; one tap, prefilled. */
export function ShareWhatsApp({ text, path, id, className }: { text: string; path: string; id: string; className?: string }) {
  const url = location.origin + import.meta.env.BASE_URL + path.replace(/^\//, "");
  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => track("Share WhatsApp", { page: id })}
      className={cx("inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink no-underline hover:border-brand-200 hover:bg-brand-50", className)}>
      <Share2 className="size-4" />Share on WhatsApp
    </a>
  );
}
