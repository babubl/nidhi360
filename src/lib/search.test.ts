import { describe, expect, it } from "vitest";
import { search } from "./search";
import { ANSWERS } from "../data/answers";
import { RULES } from "../data/rules";

/**
 * The resolution challenge: real questions, typed the way people type them.
 * Each must surface the right answer or tool in the top 3 results.
 */
const CHALLENGE: [string, string][] = [
  ["i resigned last month can i take my full pf", "/answers/withdraw-after-resigning"],
  ["pf claim pending since 40 days what to do", "/answers/claim-pending-too-long"],
  ["my pf claim got rejected bank details not verified", "/answers/claim-rejected"],
  ["company deducting pf but not depositing in passbook", "/answers/employer-not-depositing"],
  ["how to check pf balance", "/answers/check-balance"],
  ["forgot uan password", "/answers/forgot-uan"],
  ["i have 2 uan numbers", "/answers/two-uans"],
  ["date of birth wrong in epf", "/answers/change-name-dob"],
  ["father passed away how to claim his pf and insurance", "/answers/family-member-died"],
  ["is pf withdrawal taxable before 5 years", "/answers/withdraw-tax"],
  ["need money for hospital from pf while working", "/answers/withdraw-while-working"],
  ["how much pension will i get from eps", "/answers/eps-how-much"],
  ["should i withdraw eps or scheme certificate", "/answers/eps-withdraw-or-certificate"],
  ["old company closed how to get my pf", "/answers/employer-closed"],
  ["withdraw pf through upi", "/answers/withdraw-upi"],
  ["how much nps lump sum at 60", "/answers/nps-at-60"],
  ["how to withdraw nps after retirement cra", "/answers/nps-exit-process"],
  ["is nps worth it in new tax regime", "/answers/nps-new-regime"],
  ["vpf interest taxable", "/answers/interest-tax"],
  ["my pension stopped coming", "/answers/life-certificate"],
  ["hr not approving my kyc", "/answers/employer-not-approving"],
  ["take money from nps before 60", "/answers/nps-before-60"],
  ["old pf account not touched for years", "/answers/old-account"],
  ["new 25000 wage ceiling", "/answers/wage-ceiling-25000"],
  ["how to transfer pf", "/answers/transfer-pf"],
  ["changed job how to move my old pf", "/answers/transfer-pf"],
  ["claim settled but money not in bank", "/answers/settled-not-credited"],
  ["employer is not paying pf", "/answers/employer-not-depositing"],
  ["my wife died what about her epf insurance", "/answers/family-member-died"],
  ["edli claim amount", "/answers/family-member-died"],
  ["otp not coming epfo", "/answers/otp-not-received"],
  ["epfo website not working", "/answers/portal-not-working"],
  ["pf agent asking my otp is it safe", "/answers/pf-agent-safe"],
  ["do i need to submit form 15g", "/answers/form-15g-15h"],
  ["moving to canada what about my pf", "/answers/moving-abroad"],
  ["how to activate uan face authentication", "/answers/activate-uan"],
  ["download pf passbook pdf", "/answers/download-passbook"],
  ["should i invest in vpf", "/answers/vpf"],
  ["higher pension status supreme court", "/answers/higher-pension"],
  ["why is my eps pension only 1000", "/answers/minimum-pension"],
  ["central govt employee ups or nps", "/answers/ups-vs-nps"],
  ["nps account for my daughter", "/answers/nps-vatsalya"],
];

describe("Resolution challenge: real queries find the right answer", () => {
  for (const [q, expected] of CHALLENGE) {
    it(q, () => {
      const top = search(q, 3).map((r) => r.to);
      expect(top).toContain(expected);
    });
  }
});

describe("Content integrity", () => {
  it("every answer cites rules that exist", () => {
    const ids = new Set(RULES.map((r) => r.id));
    for (const a of ANSWERS) for (const r of a.rules) expect(ids.has(r), `${a.slug} → ${r}`).toBe(true);
  });
  it("related answers exist", () => {
    const slugs = new Set(ANSWERS.map((a) => a.slug));
    for (const a of ANSWERS) for (const r of a.related ?? []) expect(slugs.has(r), `${a.slug} → ${r}`).toBe(true);
  });
  it("slugs are unique", () => {
    expect(new Set(ANSWERS.map((a) => a.slug)).size).toBe(ANSWERS.length);
  });
});
