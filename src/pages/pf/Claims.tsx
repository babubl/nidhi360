import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Check, Plus, Trash2, X } from "lucide-react";
import { addDaysIso, KIND_LABELS, sortClaims, viewClaim, type ClaimKind, type ClaimState, type Stage, type TrackedClaim } from "../../lib/calc/claims";
import { toIcs } from "../../lib/calc/reminders";
import { containsSensitive } from "../../lib/calc/rejection";
import { useStoredState } from "../../lib/storage";
import { fmtDate } from "../../lib/format";
import { Button, ButtonLink, Callout, Card, Container, Field, Select, cx } from "../../components/ui";
import { PageHero, RulesUsed } from "../../components/ToolPage";

const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

const STAGE: Record<Stage, { bar: string; chip: string }> = {
  "on-track": { bar: "bg-brand-600", chip: "bg-brand-50 text-brand-700" },
  "due-soon": { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-800" },
  overdue: { bar: "bg-red-600", chip: "bg-red-50 text-red-800" },
  "settled-waiting": { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-800" },
  "settled-not-credited": { bar: "bg-red-600", chip: "bg-red-50 text-red-800" },
  rejected: { bar: "bg-red-600", chip: "bg-red-50 text-red-800" },
  done: { bar: "bg-emerald-600", chip: "bg-emerald-50 text-emerald-800" },
};

const newKey = () => Math.random().toString(36).slice(2, 10);

function downloadReminder(c: TrackedClaim) {
  const site = location.origin + import.meta.env.BASE_URL;
  const ics = toIcs([{ date: addDaysIso(c.filedOn, 21), title: `PF claim ${c.claimId || ""} passed EPFO's 20-day deadline`.replace("  ", " "), detail: "If it isn't settled, raise a grievance on EPFiGMS. Nidhi360 drafts it for you.", path: "/pf/claims" }], site);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = "pf-claim-deadline.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function Claims() {
  const [claims, setClaims] = useStoredState<TrackedClaim[]>("claims", []);
  const [claimId, setClaimId] = useState("");
  const [kind, setKind] = useState<ClaimKind>("advance");
  const [filedOn, setFiledOn] = useState("");
  const [today, setToday] = useState<Date | null>(null);
  const [todayIso, setTodayIso] = useState("");
  useEffect(() => { const d = new Date(); setToday(d); setTodayIso(d.toISOString().slice(0, 10)); }, []);

  const leaked = containsSensitive(claimId);
  const canAdd = !!filedOn && !leaked && (!todayIso || filedOn <= todayIso);
  const add = () => {
    if (!canAdd) return;
    setClaims([{ key: newKey(), claimId: claimId.trim().toUpperCase(), kind, filedOn, state: "pending" as ClaimState }, ...claims].slice(0, 30));
    setClaimId(""); setFiledOn("");
  };
  const update = (key: string, state: ClaimState) => setClaims(claims.map((c) => (c.key === key ? { ...c, state, changedOn: todayIso } : c)));
  const remove = (key: string) => setClaims(claims.filter((c) => c.key !== key));
  const list = today ? sortClaims(claims, today) : claims;

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Track your PF claim against EPFO's 20-day deadline"
        intro="EPFO must settle a complete claim within 20 days. Add your claim and see the countdown, what to do at each stage, and a ready complaint the day it's late. Saved only on this device." />
      <Container className="grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8">
        <Card className="space-y-5">
          <p className="text-sm font-semibold text-ink">Add a claim</p>
          <Field label="Claim ID" htmlFor="cid" hint="From the acknowledgement SMS or Track Claim Status. Optional, but it goes into the complaint.">
            <input id="cid" className={inputCls} value={claimId} onChange={(e) => setClaimId(e.target.value.slice(0, 40))} placeholder="e.g. TNMAS260900012345" autoComplete="off" spellCheck={false} />
          </Field>
          {leaked && <Callout tone="danger">That looks like an Aadhaar, PAN or OTP. Don't enter those here; the claim ID is enough.</Callout>}
          <Field label="Type of claim" htmlFor="kind">
            <Select id="kind" value={kind} onChange={(v) => setKind(v as ClaimKind)} options={Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }))} />
          </Field>
          <Field label="Date filed" htmlFor="filed">
            <input id="filed" type="date" className={inputCls} value={filedOn} max={todayIso || undefined} onChange={(e) => setFiledOn(e.target.value)} />
          </Field>
          <Button onClick={add} disabled={!canAdd} className="w-full"><Plus className="size-4" />Track this claim</Button>
          <p className="text-[13px] text-muted">Check the live status on the <a href="https://passbook.epfindia.gov.in/MemberPassBook/login" target="_blank" rel="noopener noreferrer">EPFO passbook site</a> (Claim Status) or UMANG, then update it here.</p>
        </Card>

        <div className="space-y-4">
          {list.length === 0 && (
            <Card className="text-center">
              <p className="text-[17px] font-semibold text-ink">No claims tracked yet</p>
              <p className="mt-1 text-[15px] text-muted">Add the claim you filed. We'll tell you when to wait and when to push.</p>
              <div className="mx-auto mt-6 max-w-sm text-left">
                {[["Day 0", "You file the claim online"], ["Day 1–5", "KYC-complete advances under ₹5 lakh often settle automatically"], ["Day 20", "EPFO's deadline under the EPF Scheme 2026"], ["Day 21+", "Complain on EPFiGMS; delay earns penal interest"]].map(([d, t]) => (
                  <div key={d} className="flex gap-3 border-l-2 border-line py-2 pl-4"><span className="num w-16 shrink-0 text-sm font-semibold text-ink">{d}</span><span className="text-sm text-muted">{t}</span></div>
                ))}
              </div>
            </Card>
          )}
          {list.map((c) => {
            const v = today ? viewClaim(c, today) : null;
            const s = v ? STAGE[v.stage] : STAGE["on-track"];
            return (
              <Card key={c.key} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="num truncate font-semibold text-ink">{c.claimId || "Claim"}</p>
                    <p className="text-sm text-muted">{KIND_LABELS[c.kind]} · filed {fmtDate(c.filedOn)}</p>
                  </div>
                  {v && <span className={cx("rounded-full px-3 py-1 text-xs font-bold", s.chip)}>{v.headline}</span>}
                </div>
                {v && (c.state === "pending") && (
                  <div>
                    <div className="h-2 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-label="Days used of the 20-day deadline" aria-valuenow={Math.min(20, v.daysPending)} aria-valuemin={0} aria-valuemax={20}>
                      <div className={cx("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.max(4, v.progress * 100)}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[12.5px] text-muted"><span>Filed</span><span>Deadline {fmtDate(v.dueOn)}</span></div>
                  </div>
                )}
                {v && <p className="text-[15px] leading-relaxed text-body">{v.next}</p>}
                <div className="flex flex-wrap gap-2">
                  {v?.action && <ButtonLink to={v.action.to} variant={v.stage === "overdue" || v.stage === "settled-not-credited" ? "primary" : "secondary"}>{v.action.label}</ButtonLink>}
                  {c.state === "pending" && <>
                    <Button variant="secondary" onClick={() => update(c.key, "settled")}><Check className="size-4" />Settled</Button>
                    <Button variant="secondary" onClick={() => update(c.key, "rejected")}><X className="size-4" />Rejected</Button>
                    {v && v.daysLeft > 0 && <Button variant="ghost" onClick={() => downloadReminder(c)}><CalendarPlus className="size-4" />Remind me on day 21</Button>}
                  </>}
                  {c.state === "settled" && <Button variant="secondary" onClick={() => update(c.key, "credited")}><Check className="size-4" />Money received</Button>}
                  <Button variant="ghost" onClick={() => remove(c.key)} aria-label={`Remove claim ${c.claimId}`}><Trash2 className="size-4" /></Button>
                </div>
              </Card>
            );
          })}
          {list.length > 0 && <p className="text-[13px] text-muted">Rejected? Most rejections are fixable. <Link to="/pf/claim-rejected">See why and fix it</Link>.</p>}
        </div>
      </Container>
      <RulesUsed ids={["R6", "R7"]} />
    </>
  );
}
