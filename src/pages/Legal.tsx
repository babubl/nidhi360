import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Container } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import { clearSavedData } from "../lib/storage";

const SECTIONS: { id: string; h: string; items: string[] }[] = [
  { id: "disclaimer", h: "Disclaimer", items: [
    "Nidhi360 provides general information about the Employees' Provident Fund, Employees' Pension Scheme, National Pension System and related tax rules. It is not investment, tax, legal or financial advice.",
    "Nidhi360 is not affiliated with, endorsed by or acting for EPFO, PFRDA, the NPS Trust, the Income Tax Department or any government body. Claims, transfers and complaints are filed by you on the official portals.",
    "Nidhi360 is not a SEBI-registered investment adviser. Projections and estimates use the assumptions shown on each tool; actual amounts are decided by EPFO, PFRDA, your CRA, your annuity provider and the tax authorities.",
    "Rules change often. Each answer shows the date it was last checked. Always confirm on the official portal before you act.",
  ]},
  { id: "privacy", h: "Privacy", items: [
    "You don't need an account. We don't ask for, collect or store your UAN password, OTP, PRAN login, Aadhaar, PAN or bank details, and our forms block Aadhaar, PAN and OTP numbers.",
    "Numbers you type into tools (such as age, balance or dates) are saved only in your browser's local storage on your device, to save you retyping. They are never sent to us. You can clear them below.",
    "If analytics is enabled, we use Plausible, which doesn't use cookies and doesn't collect personal data. We record only page views and anonymous events, such as whether an answer solved the problem. We never record what you type.",
    "If you use the AI assistant, your question is sent to our AI service (Google Gemini via our server) to generate an answer, after it's checked for ID numbers. Don't include personal details.",
    "If you contact us on WhatsApp or email, we use what you send only to help with your case. We will never ask for your password or OTP. You can ask us to delete your messages at any time.",
    "We follow the Digital Personal Data Protection Act, 2023 in how we handle any personal data you choose to share with us.",
  ]},
  { id: "terms", h: "Terms of use", items: [
    "You may use Nidhi360 for your own information and to help others with theirs. Don't misuse the service, attempt to break it, or present its content as official government guidance.",
    "Paid expert help is described on the expert help page, including what's included and the fee, before you pay. We'll tell you if we can't help before charging.",
    "To the extent the law allows, Nidhi360 isn't liable for decisions you make based on its information. Our total liability for paid services is limited to the fee you paid.",
    "These terms are governed by the laws of India.",
  ]},
];

export default function Legal() {
  const [cleared, setCleared] = useState(false);
  return (
    <>
      <PageHero title="Terms, privacy and disclaimer" intro="Plain-language terms. The short version: we're an independent information service, we don't collect your personal data, and you file everything yourself on the official portals." />
      <Container className="max-w-3xl py-10">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 border-b border-line py-6 first:pt-0">
            <h2 className="text-xl font-bold">{s.h}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
        <section className="py-6">
          <h2 className="text-xl font-bold">Clear your saved data</h2>
          <p className="mt-2 text-body">Removes everything Nidhi360 has saved in this browser: tool inputs, your PF check answers and your feedback choices.</p>
          <Button variant="secondary" className="mt-4" onClick={() => { clearSavedData(); setCleared(true); }}><Trash2 className="size-4" />{cleared ? "Cleared" : "Clear my data on this device"}</Button>
        </section>
      </Container>
    </>
  );
}
