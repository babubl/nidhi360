/*
 * Nidhi360 service worker: makes the site installable and usable offline.
 *  - Pages: network first (always the latest rules when online), cached copy when offline.
 *  - Built assets (hashed file names): cache first, they never change.
 *  - Everything else on this origin: cached copy immediately, refreshed in the background.
 * Nothing personal is cached: tools keep their data in localStorage, not in requests.
 */
const VERSION = "n360-v1";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const scope = new URL(self.registration.scope);
const HOME = scope.pathname;
const WARM = ["", "pf/passbook", "pf/withdraw", "pf/claims", "pf/health-check", "me", "answers"].map((p) => HOME + p);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(WARM).catch(() => undefined)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const normalise = (url) => {
  const u = new URL(url);
  u.search = "";
  u.hash = "";
  if (u.pathname.length > HOME.length && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
  return u.toString();
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(HOME)) return;

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const key = normalise(req.url);
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(PAGES)).put(key, res.clone());
        return res;
      } catch {
        const cache = await caches.open(PAGES);
        return (await cache.match(key)) || (await cache.match(HOME)) || new Response("<h1>You're offline</h1><p>Reconnect to load this page.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith(HOME + "assets/")) {
    e.respondWith((async () => {
      const cache = await caches.open(ASSETS);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(ASSETS);
    const hit = await cache.match(req);
    const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || (await fresh) || Response.error();
  })());
});
