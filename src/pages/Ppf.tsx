import { useState } from "react";
import { fyLabel, PPF_MAX, projectPpf } from "../lib/calc/ppf";
import { inr, inrShort } from "../lib/format";
import { useStoredState } from "../lib/storage";
import { ruleById } from "../data/rules";
import { Callout, Card, Field, NumberInput, Row, Segmented, Select, Stat, cx } from "../components/ui";
import { PageHero, RulesUsed, SavedNote, ToolGrid } from "../components/ToolPage";

/** Current financial year's starting calendar year (April–March). */
function currentFy(d = new Date()) {
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

const PHASE: Record<string, { label: string; cls: string }> = {
  "lock-in": { label: "Locked", cls: "bg-canvas text-muted" },
  loan: { label: "Loan", cls: "bg-sky-50 text-sky-800" },
  withdraw: { label: "Withdraw", cls: "bg-emerald-50 text-emerald-800" },
  extension: { label: "Extended", cls: "bg-amber-50 text-amber-800" },
};

const CURRENT_RATE = Number(ruleById("R34")?.title.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 7.1);

export default function Ppf() {
  const now = currentFy();
  const [opened, setOpened] = useStoredState("ppf.opened", now);
  const [balance, setBalance] = useStoredState("ppf.balance", 0);
  const [yearly, setYearly] = useStoredState("ppf.yearly", PPF_MAX);
  const [early, setEarly] = useState<"april" | "monthly">("april");
  const [rate, setRate] = useState(CURRENT_RATE);
  const [ext, setExt] = useState(0);
  const [extDeposit, setExtDeposit] = useState<"yes" | "no">("yes");

  const openedFy = Math.min(now, Math.max(now - 40, opened));
  const isNew = openedFy === now;
  const r = projectPpf({ openedFy, currentFy: now, balance: isNew ? 0 : balance, yearly, ratePct: rate, earlyInYear: early === "april", extensions: ext, extendWithDeposits: extDeposit === "yes" });
  const nNow = now - openedFy + 1;
  const thisYear = r.years[0];
  const yearsLeft = Math.max(0, r.maturityFy - now + 1);
  const options = Array.from({ length: 41 }, (_, k) => now - k).map((y) => ({ value: String(y), label: y === now ? `${fyLabel(y)} (opening now)` : fyLabel(y) }));

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "Savings tools" }} title="PPF planner: maturity, loans and withdrawals"
        intro="See what your PPF will be worth at 15 years, when you can borrow or withdraw and how much, and what extending it adds. Uses the current rate and the PPF Scheme 2019 rules." />
      <ToolGrid
        summary={{ label: r.matured && !ext ? "Account has matured" : `At maturity, ${fyLabel(r.maturityFy)}`, value: inrShort(ext ? r.finalBalance : r.maturityBalance) }}
        form={
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Account opened in" htmlFor="opened" hint="The financial year of your first deposit">
                <Select id="opened" value={String(openedFy)} onChange={(v) => setOpened(Number(v))} options={options} />
              </Field>
              {!isNew && (
                <Field label={`Balance on 1 April ${now}`} htmlFor="bal" hint="From your passbook or net banking">
                  <NumberInput id="bal" prefix="₹" value={balance} onChange={setBalance} min={0} step={10000} />
                </Field>
              )}
              <Field label="Deposit each year" htmlFor="yr" hint="₹500 to ₹1.5 lakh">
                <NumberInput id="yr" prefix="₹" value={yearly} onChange={setYearly} min={0} max={PPF_MAX} step={10000} />
              </Field>
              <Field label="Interest rate" htmlFor="rate" hint={`${CURRENT_RATE}% now; reset every quarter`}>
                <NumberInput id="rate" value={rate} onChange={setRate} min={0} max={12} step={0.1} suffix="% a year" />
              </Field>
            </div>
            <Field label="When you deposit" hint="Money in by 5 April earns interest for the whole year">
              <Segmented label="Deposit timing" size="sm" value={early} onChange={setEarly} options={[{ value: "april", label: "Lump sum by 5 April" }, { value: "monthly", label: "Monthly, by the 5th" }]} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Extend after maturity" hint="In blocks of 5 years">
                <Segmented label="Extensions" size="sm" value={ext} onChange={setExt} options={[0, 1, 2, 3].map((n) => ({ value: n, label: n ? `+${n * 5} yrs` : "No" }))} />
              </Field>
              {ext > 0 && (
                <Field label="Keep depositing while extended?">
                  <Segmented label="Deposit during extension" size="sm" value={extDeposit} onChange={setExtDeposit} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </Field>
              )}
            </div>
            {r.depositCapped && <Callout tone="warn">PPF accepts at most ₹1.5 lakh a year across your deposits; we've used ₹1.5 lakh. Money above that earns no interest and is refunded.</Callout>}
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-6">
            {r.matured && !ext ? (
              <Callout tone="info" title="Your PPF has completed 15 years">
                <p>You can close it and take the full balance, extend it for 5 years with deposits (submit Form 4 within a year of maturity), or simply leave it: it then continues without deposits, still earning interest, and you can withdraw any amount once a year. Choose an extension above to project it.</p>
              </Callout>
            ) : (
              <Stat label={ext ? `Value at the end of ${fyLabel(r.finalFy)}` : `Value at maturity, after ${fyLabel(r.maturityFy)}`} value={inr(ext ? r.finalBalance : r.maturityBalance)}
                sub={`${yearsLeft > 0 ? `${yearsLeft} more ${yearsLeft === 1 ? "deposit" : "deposits"} to maturity · ` : ""}tax-free`} />
            )}
            <dl>
              <Row label="You'll put in from now" value={inr(r.totalDeposits)} />
              <Row label="Interest you'll earn from now" value={inr(r.totalInterest)} />
              {ext > 0 && <Row label={`Value at maturity (${fyLabel(r.maturityFy)})`} value={inrShort(r.maturityBalance)} />}
            </dl>

            {thisYear && (
              <div className="rounded-xl border border-line p-4">
                <p className="text-sm font-semibold text-ink">This year, {fyLabel(now)} (year {nNow} of 16)</p>
                <p className="mt-1 text-[15px] text-body">
                  {thisYear.phase === "lock-in" && "No loan or withdrawal yet. Loans open from year 3."}
                  {thisYear.phase === "loan" && <>You can borrow up to <strong className="num">{inr(thisYear.loanLimit)}</strong>, at 1% above the PPF rate, repaid within 36 months. Withdrawals open in year 7.</>}
                  {thisYear.phase === "withdraw" && <>You can withdraw up to <strong className="num">{inr(thisYear.withdrawLimit)}</strong> once this year, tax-free, with no penalty.</>}
                  {thisYear.phase === "extension" && "Your account is in an extension block."}
                </p>
                {!isNew && thisYear.phase !== "lock-in" && <p className="mt-1 text-[13px] text-muted">Limits use balances estimated from today's balance; your bank's figure may differ slightly.</p>}
              </div>
            )}

            {r.years.length > 0 && (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-line">
                <table className="w-full text-left text-[13.5px]">
                  <caption className="sr-only">PPF balance year by year</caption>
                  <thead className="sticky top-0 bg-canvas text-muted">
                    <tr><th scope="col" className="p-2.5 font-semibold">Year</th><th scope="col" className="p-2.5 text-right font-semibold">Balance</th><th scope="col" className="p-2.5 text-right font-semibold">Can access</th></tr>
                  </thead>
                  <tbody>
                    {r.years.map((y) => (
                      <tr key={y.n} className={cx("border-t border-line", y.n === 16 && "bg-brand-50")}>
                        <td className="p-2.5"><span className="block font-medium text-ink">{fyLabel(y.fy)}</span><span className={cx("mt-0.5 inline-block rounded px-1.5 text-[11px] font-bold", PHASE[y.phase].cls)}>{y.n === 16 ? "Matures" : PHASE[y.phase].label}</span></td>
                        <td className="num p-2.5 text-right text-ink">{inrShort(y.balance)}</td>
                        <td className="num p-2.5 text-right text-body">{y.withdrawLimit ? `${inrShort(y.withdrawLimit)} out` : y.loanLimit ? `${inrShort(y.loanLimit)} loan` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Callout title="Good to know">
              <ul className="list-disc space-y-1 pl-4">
                <li>Deposit at least ₹500 every year, or the account becomes discontinued (revive it with ₹50 a year as penalty plus the missed ₹500s).</li>
                <li>Closing early is allowed after 5 full years only for serious illness, higher education or moving abroad, with 1% less interest.</li>
                <li>Deposits get the 80C deduction only in the old tax regime. Interest and maturity are tax-free in both.</li>
              </ul>
            </Callout>
          </Card>
        }
      />
      <RulesUsed ids={["R34"]} />
    </>
  );
}
