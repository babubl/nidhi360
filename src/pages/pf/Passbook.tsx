import { useRef, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileUp, Info, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { analysePassbook, monthName, parsePassbook, SAMPLE_PASSBOOK, type MonthCell, type ParsedPassbook, type Severity } from "../../lib/calc/passbook";
import { useMe } from "../../lib/storage";
import { inr, inrShort, fmtDate } from "../../lib/format";
import { Button, ButtonLink, Callout, Card, Container, Row, cx } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed } from "../../components/ToolPage";

const STATE: Record<MonthCell["state"], { label: string; cls: string }> = {
  ok: { label: "On time", cls: "bg-emerald-600" },
  arrear: { label: "Arrears", cls: "bg-emerald-400" },
  late: { label: "Late", cls: "bg-amber-500" },
  short: { label: "Short", cls: "bg-orange-600" },
  missing: { label: "Missing", cls: "bg-red-600" },
};
const SEV: Record<Severity, { icon: typeof Info; cls: string }> = {
  high: { icon: XCircle, cls: "border-red-200 bg-red-50 text-red-900" },
  medium: { icon: AlertTriangle, cls: "border-amber-200 bg-amber-50 text-amber-900" },
  info: { icon: Info, cls: "border-line bg-canvas text-body" },
};
const MON = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function MonthGrid({ months }: { months: MonthCell[] }) {
  const byYear = new Map<number, Map<number, MonthCell>>();
  for (const c of months) {
    const [y, m] = c.month.split("-").map(Number);
    if (!byYear.has(y)) byYear.set(y, new Map());
    byYear.get(y)!.set(m, c);
  }
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1 text-[11px]">
          <caption className="sr-only">Contribution status for each month</caption>
          <thead><tr><th scope="col" className="sr-only">Year</th>{MON.map((m, k) => <th key={k} scope="col" className="w-6 font-medium text-muted" aria-label={new Date(2000, k, 1).toLocaleString("en-IN", { month: "long" })}>{m}</th>)}</tr></thead>
          <tbody>
            {[...byYear.entries()].map(([y, ms]) => (
              <tr key={y}>
                <th scope="row" className="pr-2 text-right font-semibold text-muted">{y}</th>
                {MON.map((_, k) => {
                  const c = ms.get(k + 1);
                  return (
                    <td key={k} className="p-0">
                      <span title={c ? `${monthName(c.month)}: ${STATE[c.state].label}` : undefined}
                        className={cx("block size-6 rounded-[5px]", c ? STATE[c.state].cls : "bg-canvas")}>
                        <span className="sr-only">{c ? `${monthName(c.month)}: ${STATE[c.state].label}` : "Not in passbook"}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
        {(["ok", "late", "short", "missing", "arrear"] as const).filter((s) => months.some((m) => m.state === s) || s !== "arrear").map((s) => (
          <li key={s} className="flex items-center gap-1.5"><span className={cx("size-3 rounded-[3px]", STATE[s].cls)} aria-hidden />{STATE[s].label}</li>
        ))}
      </ul>
    </div>
  );
}

function Score({ value }: { value: number }) {
  const r = 34, c = 2 * Math.PI * r;
  const color = value >= 95 ? "#039855" : value >= 75 ? "#DC6803" : "#D92D20";
  return (
    <svg viewBox="0 0 80 80" className="size-24 shrink-0" role="img" aria-label={`Passbook health ${value} out of 100`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-canvas" strokeWidth="8" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor" className="num text-ink">{value}</text>
    </svg>
  );
}

export default function Passbook() {
  const [parsed, setParsed] = useState<ParsedPassbook | null>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");
  const [drag, setDrag] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, setPfBalance] = useMe("pfBalance", 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const load = (text: string, label: string) => {
    const p = parsePassbook(text);
    if (!p.rows.length) {
      setParsed(null);
      setError("We couldn't find monthly contribution rows in that. Make sure it's the EPFO member passbook (passbook.epfindia.gov.in), not a claim status or payslip.");
      return;
    }
    setError(""); setSaved(false); setParsed(p); setSource(label);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const readFiles = async (files: FileList | File[]) => {
    const list = [...files].slice(0, 12);
    if (!list.length) return;
    setBusy(true); setError("");
    try {
      const { pdfToText } = await import("../../lib/pdfText");
      const texts: string[] = [];
      for (const f of list) {
        if (f.size > 15 * 1024 * 1024) throw new Error(`${f.name} is larger than 15 MB.`);
        texts.push(/\.pdf$/i.test(f.name) || f.type === "application/pdf" ? await pdfToText(f) : await f.text());
      }
      load(texts.join("\n"), list.length === 1 ? list[0].name : `${list.length} files`);
    } catch (e) {
      setParsed(null);
      setError(e instanceof Error ? e.message : "Something went wrong reading that file.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.length) readFiles(e.dataTransfer.files); };
  const report = parsed ? analysePassbook(parsed) : null;
  const missingList = report?.missing.map(monthName).join(", ") ?? "";
  const employer = parsed?.establishment ?? "";

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Is all your PF really there?"
        intro="Drop in your EPF passbook. In seconds we check every month: was it deposited, on time, at the full 12%, with the right pension share? Your file is read on this device and never uploaded.">
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] text-ivory/80"><ShieldCheck className="size-4 text-gold" aria-hidden />Private by design: no upload, no login, no UAN needed</p>
      </PageHero>

      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
              className={cx("flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors", drag ? "border-brand-500 bg-brand-50" : "border-line bg-canvas/50")}>
              {busy ? <Loader2 className="size-9 animate-spin text-brand-600" aria-hidden /> : <FileUp className="size-9 text-brand-600" aria-hidden />}
              <p className="mt-3 text-[17px] font-semibold text-ink">{busy ? "Reading your passbook…" : "Drop your passbook PDF here"}</p>
              <p className="mt-1 text-sm text-muted">One or more years at once. PDF or text.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button onClick={() => fileRef.current?.click()} disabled={busy}>Choose file</Button>
                <Button variant="secondary" onClick={() => load(SAMPLE_PASSBOOK, "sample passbook")} disabled={busy}>Try a sample</Button>
              </div>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf,.txt,text/plain" multiple className="hidden" aria-label="Passbook file"
                onChange={(e) => { if (e.target.files) readFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-brand-600">Or paste the passbook text</summary>
              <label htmlFor="paste" className="sr-only">Passbook text</label>
              <textarea id="paste" rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Apr-2025  14-05-2025  CR  Cont. For Due-Month 052025  22,000  15,000  2,640  1,390  1,250"
                className="mt-3 w-full rounded-lg border border-line bg-white p-3 font-mono text-[13px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              <Button variant="secondary" className="mt-2" disabled={!paste.trim()} onClick={() => load(paste, "pasted text")}>Check this text</Button>
            </details>
            {error && <Callout tone="danger">{error}</Callout>}
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-ink">Get your passbook in 1 minute</p>
            <ol className="list-decimal space-y-2 pl-5 text-[15px] text-body">
              <li>Open <a href="https://passbook.epfindia.gov.in/MemberPassBook/login" target="_blank" rel="noopener noreferrer">passbook.epfindia.gov.in</a> and log in with your UAN.</li>
              <li>Pick the member ID (each employer has one) and the year.</li>
              <li>Click <strong>Download Passbook</strong>. Repeat for other years if you like.</li>
              <li>Drop the PDFs here.</li>
            </ol>
            <p className="text-[13px] text-muted">Passbooks update a few days after your employer pays, usually by the 20th. Can't log in? <Link to="/answers/check-balance">Other ways to check</Link>.</p>
          </Card>
        </div>
      </Container>

      {report && parsed && (
        <div ref={resultRef} className="scroll-mt-24">
          <Container className="pb-10">
            <Card className="space-y-7">
              <div className="flex flex-wrap items-center gap-5">
                <Score value={report.score} />
                <div className="min-w-0">
                  <p className="text-sm text-muted">From {source}{parsed.establishment ? ` · ${parsed.establishment}` : ""}</p>
                  <h2 className="mt-1 text-[26px] leading-tight sm:text-[32px]">
                    {report.findings[0]?.id === "clean" ? "All good. Every month checks out." : `${report.findings.filter((f) => f.severity !== "info").length} ${report.findings.filter((f) => f.severity !== "info").length === 1 ? "thing needs" : "things need"} your attention`}
                  </h2>
                  <p className="mt-1 text-[15px] text-muted">{report.months.length} months checked, {monthName(report.first!)} to {monthName(report.last!)}</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-6">
                  <MonthGrid months={report.months} />
                  <dl>
                    <Row label="Your share (incl. VPF)" value={inr(report.contributed.employee)} />
                    <Row label="Employer's PF share" value={inr(report.contributed.employer)} />
                    <Row label="To your pension (EPS)" value={inr(report.contributed.pension)} />
                    <Row label="Months of pension service here" value={`${report.epsMonths} (${+(report.epsMonths / 12).toFixed(1)} years)`} />
                    {parsed.balance && <Row label={`PF balance${parsed.balance.asOn ? ` on ${fmtDate(parsed.balance.asOn)}` : ""}`} value={inr(parsed.balance.amount)} strong />}
                  </dl>
                  {parsed.balance && (
                    <Button variant="secondary" disabled={saved} onClick={() => { setPfBalance(parsed.balance!.amount); setSaved(true); }}>
                      {saved ? <><CheckCircle2 className="size-4" />Saved to My plan</> : `Use ${inrShort(parsed.balance.amount)} as my PF balance`}
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {report.findings.map((f) => {
                    const S = f.id === "clean" ? { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-900" } : SEV[f.severity];
                    return (
                      <div key={f.id} className={cx("flex gap-3 rounded-xl border p-4", S.cls)}>
                        <S.icon className="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden />
                        <div className="min-w-0">
                          <p className="font-semibold">{f.title}</p>
                          <p className="mt-1 text-[14.5px] leading-relaxed">{f.detail}</p>
                          {f.id === "missing" && (
                            <ButtonLink variant="secondary" className="mt-3" to={`/pf/grievance?issue=notDeposited&months=${encodeURIComponent(missingList)}${employer ? `&employer=${encodeURIComponent(employer)}` : ""}`}>Draft the complaint</ButtonLink>
                          )}
                          {f.id === "short" && <ButtonLink variant="secondary" className="mt-3" to="/pf/payslip">Check my payslip</ButtonLink>}
                        </div>
                      </div>
                    );
                  })}
                  {parsed.events.filter((e) => e.kind !== "interest").length > 0 && (
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-sm font-semibold text-ink">Withdrawals and transfers</p>
                      <ul className="mt-2 space-y-1.5 text-[14px]">
                        {parsed.events.filter((e) => e.kind !== "interest").map((e, k) => (
                          <li key={k} className="flex justify-between gap-3"><span className="text-body">{e.kind === "withdrawal" ? "Withdrawal" : e.kind === "transfer-in" ? "Transfer in" : "Transfer out"}{e.date ? ` · ${fmtDate(e.date)}` : ""}</span><span className="num font-semibold text-ink">{inr(e.amount)}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[13px] text-muted">We read the passbook as it's laid out today; if a number looks wrong, check it against the PDF. This page forgets your passbook when you leave it.</p>
              <ExpertHelp context="problems in my PF passbook" />
            </Card>
          </Container>
        </div>
      )}
      <RulesUsed ids={["R1", "R10", "R14", "R6"]} />
    </>
  );
}
