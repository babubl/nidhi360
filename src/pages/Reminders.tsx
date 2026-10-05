import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Repeat } from "lucide-react";
import { buildReminders, toIcs } from "../lib/calc/reminders";
import { track } from "../lib/track";
import { fmtDate } from "../lib/format";
import { Button, Card, Field, Segmented } from "../components/ui";
import { PageHero, RulesUsed, SavedNote, ToolGrid } from "../components/ToolPage";
import { useMe } from "../lib/storage";

const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export default function Reminders() {
  const [left, setLeft] = useState<"yes" | "no">("no");
  const [lwd, setLwd] = useMe("lastWorkingDay", "");
  const [dob, setDob] = useMe("dob", "");
  const [nps, setNps] = useState<"yes" | "no">("no");
  const [pensioner, setPensioner] = useState<"yes" | "no">("no");
  const list = buildReminders({ lastWorkingDay: left === "yes" && lwd ? lwd : undefined, dob: dob || undefined, hasNps: nps === "yes", pensioner: pensioner === "yes" });
  const todayIso = new Date().toISOString().slice(0, 10);

  const download = () => {
    const site = location.origin + import.meta.env.BASE_URL;
    const blob = new Blob([toIcs(list, site)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pf-nps-reminders.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    track("Calendar downloaded", { events: list.length });
  };

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Never miss a PF or NPS deadline"
        intro="Most PF and NPS problems come from missing a date: an exit date never marked, a pension life certificate that lapsed, an NPS decision taken in a hurry. Add yours to your calendar in one tap. Nothing you enter leaves your device." />
      <ToolGrid
        form={
          <Card className="space-y-5">
            <Field label="Have you left a job recently?">
              <Segmented label="Left a job" value={left} onChange={setLeft} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
            </Field>
            {left === "yes" && (
              <Field label="Last working day" htmlFor="lwd">
                <input id="lwd" type="date" max={todayIso} className={inputCls} value={lwd} onChange={(e) => setLwd(e.target.value)} />
              </Field>
            )}
            <Field label="Date of birth" htmlFor="dob" hint="For age-based dates: 55, 58 and 60. Stays on your device.">
              <input id="dob" type="date" max={todayIso} className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} />
            </Field>
            <Field label="Do you have an NPS account?">
              <Segmented label="Has NPS" value={nps} onChange={setNps} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
            </Field>
            <Field label="Are you already receiving an EPS pension?">
              <Segmented label="Pensioner" value={pensioner} onChange={setPensioner} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
            </Field>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-bold text-ink">Your dates ({list.length})</p>
              <Button onClick={download}><CalendarPlus className="size-4" />Add to my calendar</Button>
            </div>
            <ol className="divide-y divide-line">
              {list.map((r) => (
                <li key={r.title + r.date} className="flex gap-4 py-3">
                  <div className="w-24 shrink-0 text-sm font-semibold text-ink">{fmtDate(r.date)}{r.recurring && <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted"><Repeat className="size-3" />{r.recurring === "quarterly" ? "Every 3 months" : "Every year"}</span>}</div>
                  <div className="min-w-0">
                    <Link to={r.path} className="font-semibold text-ink no-underline hover:text-brand-700">{r.title}</Link>
                    <p className="text-sm text-body">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-[13px] text-muted">Works with Google Calendar, Outlook and Apple Calendar. Each reminder links back to the right page here.</p>
          </Card>
        }
      />
      <RulesUsed ids={["R4", "R5", "R14", "R24", "R27", "R17"]} />
    </>
  );
}
