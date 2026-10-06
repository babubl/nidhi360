import { Link } from "react-router-dom";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, XCircle } from "lucide-react";
import { ruleById } from "../data/rules";
import type { Area, RuleStatus } from "../data/types";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

type Variant = "primary" | "secondary" | "ghost" | "gold";
const btn: Record<Variant, string> = {
  primary: "bg-night text-ivory hover:bg-slate shadow-[0_8px_18px_-10px_rgba(13,13,15,0.7)]",
  secondary: "bg-white text-ink border border-line hover:border-brand-200 hover:bg-brand-50",
  ghost: "text-brand-600 hover:bg-brand-50",
  gold: "bg-gold text-night hover:bg-gold-light shadow-[0_8px_20px_-10px_rgba(201,168,106,0.9)]",
};
const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({ variant = "primary", className, ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cx(btnBase, btn[variant], className)} {...p} />;
}
export function ButtonLink({ variant = "primary", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(btnBase, btn[variant], className)} {...p} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(13,13,15,0.04),0_10px_28px_-18px_rgba(13,13,15,0.25)] sm:p-6", className)}>{children}</div>;
}

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && <p className="text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink num shadow-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function NumberInput({ id, value, onChange, prefix, suffix, min, max, step }: {
  id: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{prefix}</span>}
      <input
        id={id} type="number" inputMode="decimal" min={min} max={max} step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className={cx(inputCls, prefix && "pl-7", suffix && "pr-14")}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
    </div>
  );
}

export function Select({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputCls, "appearance-none pr-10")}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

export function Segmented<T extends string | number>({ value, onChange, options, label, size = "md" }: {
  value: T | undefined; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string; size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line bg-canvas p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={String(o.value)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            className={cx("rounded-md font-semibold transition-colors", size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-3.5 py-2 text-sm",
              on ? "bg-night text-ivory shadow-sm" : "text-muted hover:text-ink")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const areaLabel: Record<Area, string> = { pf: "PF", nps: "NPS", tax: "Tax" };
const areaCls: Record<Area, string> = { pf: "bg-brand-50 text-brand-700", nps: "bg-sky-50 text-sky-800", tax: "bg-amber-50 text-amber-800" };
export function AreaBadge({ area }: { area: Area }) {
  return <span className={cx("inline-flex rounded-md px-2 py-0.5 text-xs font-bold", areaCls[area])}>{areaLabel[area]}</span>;
}
export function StatusBadge({ status }: { status: RuleStatus }) {
  return status === "live"
    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />In force</span>
    : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><span className="size-1.5 rounded-full bg-amber-500" />Announced, not live</span>;
}

type Tone = "info" | "warn" | "danger" | "success";
const toneCls: Record<Tone, string> = {
  info: "bg-canvas border-line text-body",
  warn: "bg-amber-50 border-amber-200 text-amber-900",
  danger: "bg-red-50 border-red-200 text-red-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
};
const toneIcon = { info: Info, warn: AlertTriangle, danger: XCircle, success: CheckCircle2 };
export function Callout({ tone = "info", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  const Icon = toneIcon[tone];
  return (
    <div className={cx("flex gap-3 rounded-lg border p-3.5 text-[14.5px] leading-relaxed", toneCls[tone])}>
      <Icon className="mt-0.5 size-[18px] shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0">{title && <p className="font-semibold">{title}</p>}{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "danger" }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className={cx("num text-[2.1rem] font-bold leading-tight tracking-tight", tone === "danger" ? "text-red-700" : "text-ink")}>{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "danger" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className={cx("num text-right text-[15px]", strong ? "font-bold text-ink" : "font-semibold text-ink", tone === "danger" && "text-red-700")}>{value}</dd>
    </div>
  );
}

/** Small linked reference to a rule in the register. */
export function Cites({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {ids.map((id) => {
        const r = ruleById(id);
        if (!r) return null;
        return (
          <Link key={id} to={`/rules#${id}`} title={r.title}
            className="rounded border border-brand-200 bg-brand-50 px-1.5 text-[11px] font-bold leading-[18px] text-brand-700 no-underline hover:bg-brand-100">
            {id}
          </Link>
        );
      })}
    </span>
  );
}

export function SectionTitle({ title, intro, action }: { title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <h2 className="text-[28px] leading-tight sm:text-[36px]">{title}</h2>
        {intro && <p className="mt-1.5 text-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export { cx };
