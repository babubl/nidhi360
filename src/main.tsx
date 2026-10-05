import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/plus-jakarta-sans";
import "./styles.css";
import AppRoutes, { preloadFor } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { initAnalytics } from "./lib/track";

initAnalytics();

const app = (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

const root = document.getElementById("root")!;
// Pages are prerendered at build time; hydrate them so content is visible before JS loads.
if (root.firstElementChild) {
  // Load this page's code first so hydration matches the prerendered HTML without a loading flash.
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = location.pathname.startsWith(base) ? location.pathname.slice(base.length) || "/" : location.pathname;
  preloadFor(path.replace(/\/$/, "") || "/").finally(() =>
    hydrateRoot(root, app, { onRecoverableError: () => { /* device-only state (saved inputs, today's date) may differ from the prerender */ } }),
  );
} else createRoot(root).render(app);
