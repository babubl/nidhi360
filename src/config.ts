/** Runtime configuration from build-time env vars (see .env.example). */
export const config = {
  /** Base URL of the AI proxy (Cloudflare Worker in /worker). Empty = AI features hidden. */
  askUrl: (import.meta.env.VITE_ASK_URL as string | undefined)?.replace(/\/$/, "") ?? "",
  /** WhatsApp number for expert help, international format without "+", e.g. 919876543210. */
  whatsapp: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "",
  /** Contact email for employer enquiries. */
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "",
};

export const aiEnabled = Boolean(config.askUrl);
