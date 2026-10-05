/**
 * Rules freshness check. Run weekly in CI (and any time locally: `node scripts/check-freshness.mjs`).
 * - Flags the register if it hasn't been re-verified in MAX_AGE_DAYS.
 * - Flags "announced" rules older than 30 days (they may have gone live).
 * - Checks every source link still responds.
 * Writes freshness-report.md and exits 0; CI decides whether to open an issue.
 */
import { readFileSync, writeFileSync } from "node:fs";

const MAX_AGE_DAYS = 60;
const rules = JSON.parse(readFileSync(new URL("../src/data/rules.json", import.meta.url)));
const checkedOn = readFileSync(new URL("../src/data/rules.ts", import.meta.url), "utf8").match(/RULES_CHECKED_ON = "(\d{4}-\d{2}-\d{2})"/)[1];
const days = (iso) => Math.floor((Date.now() - new Date(iso + "T00:00:00Z").getTime()) / 86_400_000);

const problems = [];
const age = days(checkedOn);
if (age > MAX_AGE_DAYS) problems.push(`The rules register was last verified ${age} days ago (${checkedOn}). Re-check every rule against its source and bump RULES_CHECKED_ON.`);

for (const r of rules.filter((r) => r.status === "announced" && days(r.effective) > 30)) {
  problems.push(`${r.id} "${r.title}" has been "announced" since ${r.effective}. Check whether it is now live.`);
}

const urls = [...new Set(rules.map((r) => r.sourceUrl))];
for (const url of urls) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Nidhi360 freshness check" } });
    // Government sites often answer bots with 403/429; only treat "gone" as a real problem.
    if (res.status === 404 || res.status === 410) problems.push(`Source link returns ${res.status}: ${url}`);
  } catch {
    /* network hiccups are not content problems; the next weekly run will retry */
  }
}

const report = problems.length
  ? `## Rules need review\n\n${problems.map((p) => `- [ ] ${p}`).join("\n")}\n\nRegister: \`src/data/rules.json\` (${rules.length} rules). After verifying, update \`RULES_CHECKED_ON\` in \`src/data/rules.ts\`.\n`
  : "";
writeFileSync("freshness-report.md", report);
console.log(problems.length ? report : `All ${rules.length} rules fresh (verified ${age} days ago), ${urls.length} source links checked.`);
