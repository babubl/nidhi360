/**
 * The chat assistant's offline brain. Works with no backend: it matches the question against the
 * answers library, tools and glossary, and replies with the straight answer, the first steps and links.
 * When the AI proxy is configured, the widget uses it for open-ended questions and still shows these links.
 */
import { answerBySlug } from "../data/answers";
import { search, topicsIn } from "./search";
import { containsSensitive } from "./calc/rejection";

export interface ChatLink { label: string; to: string }
export interface BotReply { text: string; steps?: string[]; links: ChatLink[]; matched: boolean }

export const SENSITIVE_REPLY = "That looks like an Aadhaar, PAN or OTP, so I've hidden it. Please never share those here. I don't need them. Ask again without the number.";

export const STARTERS = [
  "Can I withdraw full PF after resigning?",
  "My claim was rejected",
  "How do I transfer my old PF?",
  "How much NPS can I take at 60?",
];

const GREETING = /^(hi|hello|hey|namaste|good (morning|afternoon|evening)|help|hii+)\b[\s!.?]*$/i;
const THANKS = /^(thanks?|thank you|ok(ay)?|great|cool|got it)\b[\s!.?]*$/i;

const relatedLinks = (results: ReturnType<typeof search>, skip: string): ChatLink[] =>
  results.filter((r) => r.to !== skip).slice(0, 3).map((r) => ({ label: r.title, to: r.to }));

export function localReply(question: string): BotReply {
  const q = question.trim();
  if (containsSensitive(q)) return { text: SENSITIVE_REPLY, links: [], matched: false };
  if (GREETING.test(q)) return { text: "Hi! I can help with PF withdrawals, rejected claims, transfers, EPS pension and NPS rules. What's the problem you're facing?", links: [], matched: false };
  if (THANKS.test(q)) return { text: "Happy to help. If anything else about PF or NPS is unclear, just ask.", links: [], matched: false };

  const results = search(q, 6);
  const top = results[0];
  if (!top) {
    return {
      text: "I couldn't find a match for that. Try describing the problem in a few words, such as \"claim pending 30 days\" or \"NPS lump sum\". Or browse the library.",
      links: [{ label: "Browse all answers", to: "/answers" }, { label: "Get expert help", to: "/help" }],
      matched: false,
    };
  }
  // Confidence: a weak match, or a question that never mentions PF, EPS or NPS and only loosely
  // matches, gets "did you mean" options instead of a confident (and possibly wrong) answer.
  const onTopic = topicsIn(" " + q.toLowerCase() + " ").length > 0;
  if (top.score < 10 || (!onTopic && top.score < 18)) {
    return {
      text: onTopic
        ? "I'm not sure I've understood. Is it one of these?"
        : "I cover PF, EPS pension and NPS. If your question is about one of these, is it one of the following? Otherwise, try rephrasing with PF or NPS in it.",
      links: results.slice(0, 3).map((r) => ({ label: r.title, to: r.to })),
      matched: false,
    };
  }
  if (top.kind === "answer") {
    const slug = top.to.split("/").pop() ?? "";
    const a = answerBySlug(slug);
    if (a) {
      const links: ChatLink[] = [{ label: "Read the full answer", to: top.to }];
      if (a.tool) links.push({ label: a.tool.label, to: a.tool.to });
      links.push(...relatedLinks(results, top.to).filter((l) => l.to !== a.tool?.to).slice(0, 2));
      return { text: a.short, steps: a.steps?.slice(0, 3), links, matched: true };
    }
  }
  const prefix = top.kind === "tool" ? "This tool should help: " : "";
  return { text: `${prefix}${top.snippet}`, links: [{ label: top.kind === "term" ? "Glossary" : top.title, to: top.to }, ...relatedLinks(results, top.to).slice(0, 2)], matched: true };
}
