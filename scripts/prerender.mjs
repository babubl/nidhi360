/**
 * Build-time prerendering: writes a static HTML file for every route with the page content,
 * title, description, canonical URL, Open Graph tags and structured data, plus sitemap.xml and robots.txt.
 * Search engines and WhatsApp/LinkedIn previews see real content; the browser then hydrates it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { render, allPaths, getMeta, fullTitle, SITE_URL } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);

const template = readFileSync(join(dist, "index.html"), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

// Strip the template's generic head tags; each page gets its own.
const base = template
  .replace(/<title>[\s\S]*?<\/title>/, "")
  .replace(/<meta name="description"[^>]*>/, "")
  .replace(/<meta property="og:[^"]+"[^>]*>/g, "");

function page(path, body) {
  const m = getMeta(path);
  const title = fullTitle(m);
  const url = SITE_URL + (m.path === "/" ? "/" : m.path);
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    m.noindex ? `<meta name="robots" content="noindex">` : `<meta name="robots" content="index,follow">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Nidhi360">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${SITE_URL}/og.png">`,
    `<meta property="og:locale" content="en_IN">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    ...(m.jsonLd ?? []).map((ld) => `<script type="application/ld+json" data-ld="1">${json(ld)}</script>`),
  ].join("\n    ");
  return base.replace("</head>", `    ${head}\n  </head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const paths = allPaths();
for (const p of paths) {
  const body = await render(p);
  const html = page(p, body);
  if (p === "/") { writeFileSync(join(dist, "index.html"), html); continue; }
  // Both forms, so the URL works with or without a trailing slash on any static host.
  for (const file of [join(dist, p.slice(1) + ".html"), join(dist, p.slice(1), "index.html")]) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
}

// Unknown URLs: GitHub Pages serves 404.html; the app renders the right page or "not found" client-side.
writeFileSync(join(dist, "404.html"), page("/__404", ""));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod><changefreq>${p.startsWith("/answers") || p === "/rules" ? "weekly" : "monthly"}</changefreq><priority>${p === "/" ? "1.0" : p.startsWith("/pf") || p.startsWith("/nps") ? "0.9" : "0.7"}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Prerendered ${paths.length} pages, sitemap and robots.txt`);
