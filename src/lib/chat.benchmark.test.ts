/**
 * Chat benchmark: real questions, phrased the way people actually type them, by age group.
 * Each must get the right answer or tool as the bot's FIRST reply. Wrong-but-confident is the
 * failure we care most about, so "acceptable" lists are kept tight.
 */
import { describe, expect, it } from "vitest";
import { localReply } from "./assistant";

const CASES: [string, string[]][] = [
  // 25: first jobs, first switch
  ["how much should i invest in NPS", ["/answers/nps-how-much"]],
  ["how much to invest in nps every month", ["/answers/nps-how-much"]],
  ["what is uan", ["/glossary", "/answers/activate-uan", "/answers/forgot-uan"]],
  ["how to activate uan", ["/answers/activate-uan"]],
  ["forgot my uan number", ["/answers/forgot-uan"]],
  ["i changed job how to transfer pf", ["/answers/transfer-pf", "/pf/job-change"]],
  ["i have 2 uan numbers", ["/answers/two-uans"]],
  ["how to check pf balance", ["/answers/check-balance"]],
  ["how much money is in my pf account", ["/answers/check-balance"]],
  ["otp not coming epfo", ["/answers/otp-not-received"]],
  ["epfo site not working", ["/answers/portal-not-working"]],
  ["is it safe to give otp to pf agent", ["/answers/pf-agent-safe"]],
  ["should i open nps", ["/answers/nps-open-account", "/answers/nps-how-much", "/answers/nps-new-regime"]],
  ["how to open nps account", ["/answers/nps-open-account"]],
  ["which nps fund is best", ["/answers/nps-choose-fund"]],
  ["active choice or auto choice", ["/answers/nps-choose-fund"]],
  ["nps returns", ["/answers/nps-choose-fund"]],
  ["pf or nps which is better", ["/answers/pf-vs-nps", "/compare"]],
  ["ppf vs nps", ["/answers/pf-vs-nps", "/compare"]],
  ["what is vpf", ["/answers/vpf"]],
  ["should i increase my pf contribution", ["/answers/vpf"]],
  // 35: switching, house, family
  ["i resigned 2 months back can i take full pf", ["/answers/withdraw-after-resigning"]],
  ["can i withdraw pf while working", ["/answers/withdraw-while-working"]],
  ["pf withdrawal for house purchase", ["/answers/withdraw-while-working", "/pf/withdraw"]],
  ["withdraw pf for medical emergency", ["/answers/withdraw-while-working", "/pf/withdraw"]],
  ["is pf withdrawal taxable", ["/answers/withdraw-tax"]],
  ["tds on pf withdrawal", ["/answers/withdraw-tax"]],
  ["how many days for pf claim settlement", ["/answers/withdraw-time"]],
  ["my claim is pending for 35 days", ["/answers/claim-pending-too-long"]],
  ["pf claim rejected", ["/answers/claim-rejected", "/pf/claim-rejected"]],
  ["claim settled but money not credited", ["/answers/settled-not-credited"]],
  ["employer not depositing pf", ["/answers/employer-not-depositing"]],
  ["hr not approving my kyc", ["/answers/employer-not-approving"]],
  ["company closed how to get pf", ["/answers/employer-closed"]],
  ["name spelling wrong in pf", ["/answers/change-name-dob"]],
  ["date of birth wrong in epfo", ["/answers/change-name-dob"]],
  ["how to add nominee in pf", ["/answers/add-nominee"]],
  ["form 15g for pf", ["/answers/form-15g-15h"]],
  ["moving to usa what happens to my pf", ["/answers/moving-abroad"]],
  ["can i withdraw pf using upi", ["/answers/withdraw-upi"]],
  ["download pf passbook", ["/answers/download-passbook", "/answers/check-balance"]],
  ["what is the pf interest rate", ["/answers/interest-rate"]],
  ["is pf interest taxable", ["/answers/interest-tax"]],
  ["new 25000 wage ceiling", ["/answers/wage-ceiling-25000"]],
  ["is nps worth it in new tax regime", ["/answers/nps-new-regime"]],
  ["nps tax benefit 50000", ["/answers/nps-new-regime"]],
  ["nps tier 2 withdrawal", ["/answers/nps-tier-2"]],
  ["nps for my child", ["/answers/nps-vatsalya"]],
  ["can i stop nps contribution", ["/answers/nps-stop-contributing"]],
  ["minimum amount for nps", ["/answers/nps-stop-contributing"]],
  // 45: planning, old accounts, EPS
  ["how much pf will i get at retirement", ["/answers/pf-at-retirement", "/pf/calculator"]],
  ["how much pension will i get from eps", ["/answers/eps-how-much", "/pf/pension"]],
  ["should i withdraw eps or take scheme certificate", ["/answers/eps-withdraw-or-certificate"]],
  ["old pf account from 2012", ["/answers/old-account"]],
  ["withdraw nps before 60", ["/answers/nps-before-60"]],
  ["loan against nps", ["/answers/nps-loan"]],
  ["higher pension status", ["/answers/higher-pension"]],
  ["ups or nps for central govt employee", ["/answers/ups-vs-nps"]],
  // 55: retirement, family claims
  ["how much nps can i take at 60", ["/answers/nps-at-60"]],
  ["nps lump sum at retirement", ["/answers/nps-at-60"]],
  ["how to withdraw nps at retirement", ["/answers/nps-exit-process"]],
  ["eps pension stopped", ["/answers/life-certificate"]],
  ["jeevan pramaan life certificate", ["/answers/life-certificate"]],
  ["my father died how to claim his pf", ["/answers/family-member-died"]],
  ["edli insurance claim", ["/answers/family-member-died"]],
  ["why is my eps pension so low", ["/answers/minimum-pension"]],
  ["minimum eps pension", ["/answers/minimum-pension"]],
];

describe("chat benchmark", () => {
  const fails: string[] = [];
  for (const [q, ok] of CASES) {
    const r = localReply(q);
    const first = r.links[0]?.to;
    const second = r.links[1]?.to;
    // The first link is the answer page; for answers with a tool, the tool is second. Both count.
    if (!r.matched || !(ok.includes(first) || (first?.startsWith("/answers/") === false && ok.includes(second)))) fails.push(`${q} → ${first ?? "(no match)"}`);
  }
  it(`answers all ${CASES.length} questions correctly`, () => expect(fails).toEqual([]));
});

// Written separately from the tuned set above, to check the bot generalises to new phrasings.
const FRESH: [string, string[]][] = [
  ["what amount should i put in nps yearly", ["/answers/nps-how-much"]],
  ["is 50000 in nps enough", ["/answers/nps-how-much", "/answers/nps-new-regime"]],
  ["nps equity percentage", ["/answers/nps-choose-fund"]],
  ["how do i join nps", ["/answers/nps-open-account"]],
  ["quit my job last month need pf money", ["/answers/withdraw-after-resigning"]],
  ["lost my job can i get my pf", ["/answers/withdraw-after-resigning"]],
  ["my pf claim got rejected what to do", ["/answers/claim-rejected", "/pf/claim-rejected"]],
  ["how long will epfo take to pay", ["/answers/withdraw-time"]],
  ["it has been 2 months and claim not settled", ["/answers/claim-pending-too-long"]],
  ["company is cutting pf but not paying", ["/answers/employer-not-depositing"]],
  ["merge two pf accounts", ["/answers/two-uans", "/answers/transfer-pf"]],
  ["previous employer pf transfer", ["/answers/transfer-pf", "/pf/job-change"]],
  ["will i pay tax if i take pf after 3 years", ["/answers/withdraw-tax"]],
  ["pf for marriage", ["/answers/withdraw-while-working", "/pf/withdraw"]],
  ["pf for children education", ["/answers/withdraw-while-working", "/pf/withdraw"]],
  ["how to update nominee epf", ["/answers/add-nominee"]],
  ["my dob is incorrect in uan", ["/answers/change-name-dob"]],
  ["eps pension calculation", ["/answers/eps-how-much", "/pf/pension"]],
  ["pension after 10 years service", ["/answers/eps-how-much", "/answers/eps-withdraw-or-certificate", "/pf/pension"]],
  ["husband passed away pf claim", ["/answers/family-member-died"]],
  ["what to do with nps when i retire", ["/answers/nps-exit-process", "/answers/nps-at-60"]],
  ["annuity compulsory in nps", ["/answers/nps-at-60"]],
  ["nps partial withdrawal rules", ["/answers/nps-before-60"]],
  ["how to save tax using nps", ["/answers/nps-new-regime", "/nps/tax"]],
  ["corporate nps from employer", ["/answers/nps-new-regime", "/answers/nps-open-account"]],
  ["vpf or ppf", ["/answers/pf-vs-nps", "/answers/vpf", "/compare"]],
  ["pf interest when credited", ["/answers/interest-rate"]],
  ["inactive pf account", ["/answers/old-account"]],
  ["epf balance at 58", ["/answers/pf-at-retirement", "/pf/calculator"]],
  ["going to canada pf", ["/answers/moving-abroad"]],
];

const OFF_TOPIC = ["what is the weather today", "best mutual fund to buy", "sukanya samriddhi interest", "how to file itr", "tell me a joke", "zzqx blorp"];

describe("chat benchmark: fresh phrasings and off-topic", () => {
  it("answers fresh phrasings correctly", () => {
    const fails = FRESH.filter(([q, ok]) => { const r = localReply(q); return !(r.matched && (ok.includes(r.links[0]?.to) || ok.includes(r.links[1]?.to))); }).map(([q]) => q);
    expect(fails).toEqual([]);
  });
  it("never gives a confident answer to an off-topic question", () => {
    expect(OFF_TOPIC.filter((q) => localReply(q).matched)).toEqual([]);
  });
});
