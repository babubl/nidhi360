/** Who's behind Nidhi360. Edit freely; shown on About, Home and the expert help page. */
export const FOUNDER = {
  name: "Babu Balasubramanian",
  role: "Founder",
  location: "Chennai",
  credentials: ["NISM Series V-A certified", "CFP candidate", "MA Economics (pursuing)"],
  bio: "16 years in banking, payments, fintech, insurance and US healthcare, including program and business-analysis roles at PayPal and Fidelity Investments. Started Nidhi360 after seeing how many people lose weeks, and sometimes their money, to avoidable PF and NPS errors.",
};

export const REPO_URL = "https://github.com/babubl/nidhi360";

/** Prefilled GitHub issue for reporting a wrong or outdated answer. Public and free; no backend needed. */
export function reportErrorUrl(where: string, title: string) {
  const body = `Page: ${where}\n\nWhat is wrong or outdated?\n\nSource for the correct rule (circular, notification or official page):\n`;
  return `${REPO_URL}/issues/new?labels=content-error&title=${encodeURIComponent("Error: " + title)}&body=${encodeURIComponent(body)}`;
}
