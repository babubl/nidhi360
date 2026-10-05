import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import SearchBox from "../components/SearchBox";

const POPULAR = [
  ["/answers/withdraw-after-resigning", "Can I withdraw my full PF after resigning?"],
  ["/answers/claim-pending-too-long", "My PF claim has been pending for weeks"],
  ["/answers/transfer-pf", "How do I transfer PF to my new job?"],
  ["/pf/withdraw", "How much PF can I withdraw?"],
  ["/nps/retirement", "What will I get from NPS at exit?"],
];

export default function NotFound() {
  return (
    <Container className="max-w-2xl py-20">
      <p className="text-sm font-semibold text-brand-600">Page not found</p>
      <h1 className="mt-2 text-3xl font-extrabold">We couldn't find that page</h1>
      <p className="mt-3 text-body">It may have moved. Tell us what you're trying to sort out and we'll point you to the right place.</p>
      <div className="mt-6"><SearchBox size="lg" label="Search after page not found" /></div>
      <p className="mt-8 text-sm font-semibold text-ink">People often look for</p>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {POPULAR.map(([to, label]) => <li key={to}><Link to={to} className="block py-3 font-medium text-ink no-underline hover:text-brand-700">{label}</Link></li>)}
      </ul>
    </Container>
  );
}
