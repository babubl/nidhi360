/**
 * PPF planner (Public Provident Fund Scheme, 2019; rate per R34).
 * Financial years are counted from the year of opening (FY 1). The account matures after
 * 15 complete financial years from the end of FY 1, i.e. after FY 16.
 *  - Deposit ₹500 to ₹1.5 lakh per FY. Interest on the lowest balance between the 5th and the
 *    end of each month, credited at year end; depositing by 5 April earns interest for the full year.
 *  - Loan: FY 3 to FY 6, up to 25% of the balance at the end of the second preceding FY.
 *  - Partial withdrawal: once a year from FY 7, up to 50% of the lower of the balance at the end
 *    of the fourth preceding FY or the end of the preceding FY.
 *  - After maturity: extend in 5-year blocks with deposits (withdraw up to 60% of the opening
 *    balance of the block over the block) or without (withdraw any amount once a year).
 */
export const PPF_MAX = 150000;
export const PPF_MIN = 500;

export interface PpfInput {
  /** Calendar year in which the FY of opening started (2020 for FY 2020-21). */
  openedFy: number;
  /** FY now (2026 for FY 2026-27). */
  currentFy: number;
  /** Balance at the start of the current FY (i.e. at the end of the previous FY). */
  balance: number;
  /** Yearly deposit from the current FY onward. */
  yearly: number;
  ratePct: number;
  /** Deposit by 5 April each year (true) or monthly, by the 5th of each month (false). */
  earlyInYear: boolean;
  /** Number of 5-year extensions after maturity. */
  extensions: number;
  extendWithDeposits: boolean;
}

export interface PpfYear {
  fy: number;
  /** FY number since opening (1-based). */
  n: number;
  deposit: number;
  interest: number;
  balance: number;
  loanLimit: number;
  withdrawLimit: number;
  phase: "lock-in" | "loan" | "withdraw" | "extension";
}

export interface PpfResult {
  maturityFy: number;
  maturityBalance: number;
  finalFy: number;
  finalBalance: number;
  totalDeposits: number;
  totalInterest: number;
  years: PpfYear[];
  depositCapped: boolean;
  matured: boolean;
}

export const fyLabel = (fy: number) => `FY ${fy}-${String((fy + 1) % 100).padStart(2, "0")}`;

export function projectPpf(i: PpfInput): PpfResult {
  const r = i.ratePct / 100;
  const yearly = Math.min(PPF_MAX, Math.max(0, i.yearly));
  const nNow = i.currentFy - i.openedFy + 1;
  const maturityN = 16;
  const lastN = maturityN + Math.max(0, Math.floor(i.extensions)) * 5;

  // End-of-FY balances by FY number. Past years are estimated backwards from today's balance
  // with the same deposit, only to work out loan and withdrawal limits.
  const end = new Map<number, number>();
  let b = Math.max(0, i.balance);
  end.set(nNow - 1, b);
  for (let n = nNow - 2; n >= 0; n--) {
    b = Math.max(0, b / (1 + r) - yearly);
    end.set(n, b);
  }
  end.set(0, 0);

  const years: PpfYear[] = [];
  let bal = Math.max(0, i.balance);
  let deposits = 0, interestTotal = 0;
  for (let n = Math.max(1, nNow); n <= lastN; n++) {
    const extension = n > maturityN;
    const deposit = extension && !i.extendWithDeposits ? 0 : yearly;
    const interest = i.earlyInYear ? (bal + deposit) * r : bal * r + deposit * r * (13 / 24);
    const loanLimit = n >= 3 && n <= 6 ? 0.25 * (end.get(n - 2) ?? 0) : 0;
    const withdrawLimit = n >= 7 && !extension ? 0.5 * Math.min(end.get(n - 4) ?? 0, end.get(n - 1) ?? 0) : 0;
    bal = bal + deposit + interest;
    deposits += deposit;
    interestTotal += interest;
    end.set(n, bal);
    years.push({ fy: i.openedFy + n - 1, n, deposit, interest, balance: bal, loanLimit, withdrawLimit, phase: extension ? "extension" : n <= 2 ? "lock-in" : n <= 6 ? "loan" : "withdraw" });
  }

  const matured = nNow > maturityN;
  return {
    maturityFy: i.openedFy + maturityN - 1,
    maturityBalance: end.get(maturityN) ?? bal,
    finalFy: i.openedFy + lastN - 1,
    finalBalance: bal,
    totalDeposits: deposits,
    totalInterest: interestTotal,
    years,
    depositCapped: i.yearly > PPF_MAX,
    matured,
  };
}
