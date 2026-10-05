import { Fragment, type ReactNode } from "react";
import { Cites } from "./ui";

/** Minimal, safe renderer for AI replies: paragraphs, bullet/numbered lists, **bold**, and [R#] rule citations. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(R\d{1,3})\]/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] ? <strong key={k++} className="font-semibold text-ink">{m[1]}</strong> : <Cites key={k++} ids={[m[2]]} />);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={blocks.length} className="my-2 list-disc space-y-1 pl-5">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
    if (m) list.push(m[1]);
    else { flush(); if (line.trim()) blocks.push(<p key={blocks.length} className="my-2">{inline(line)}</p>); }
  }
  flush();
  return <Fragment>{blocks}</Fragment>;
}
