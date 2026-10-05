import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fullTitle, getMeta, SITE_NAME, SITE_URL } from "../seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
}

/** Keeps <head> in sync with the route on client-side navigation (prerendered pages already have it). */
export default function Head() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const m = getMeta(pathname);
    const q = new URLSearchParams(search).get("q");
    const title = q && m.path === "/answers" ? `Results for "${q}" · ${SITE_NAME}` : fullTitle(m);
    document.title = title;
    setMeta("name", "description", m.description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", m.description);
    setMeta("property", "og:url", SITE_URL + m.path);
    setMeta("name", "robots", m.noindex || q ? "noindex" : "index,follow");
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = SITE_URL + (m.path === "/" ? "/" : m.path);
    document.head.querySelectorAll("script[data-ld]").forEach((s) => s.remove());
    for (const ld of m.jsonLd ?? []) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.ld = "1";
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }
  }, [pathname, search]);
  return null;
}
