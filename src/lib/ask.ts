import { config } from "../config";

export interface ChatMessage { role: "user" | "assistant"; text: string }

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.askUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("rate");
  if (!res.ok) throw new Error(`http ${res.status}`);
  return res.json() as Promise<T>;
}

export const askQuestion = (messages: ChatMessage[]) =>
  post<{ text: string }>("/ask", { messages: messages.slice(-10) }).then((r) => r.text);

export const explainRejection = (text: string, image?: { mimeType: string; data: string }) =>
  post<{ text: string }>("/decode", { text, image }).then((r) => r.text);
