import { lazy, type ComponentType } from "react";
import { matchPath, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

/**
 * Code-split page that can be loaded ahead of rendering.
 * Once preloaded, it renders synchronously: the prerenderer gets complete HTML,
 * and the browser hydrates without flashing a loading state.
 */
type Loader = () => Promise<{ default: ComponentType }>;
const loaded = new Map<Loader, ComponentType>();
function page(loader: Loader) {
  const Lazy = lazy(loader);
  const Page = () => {
    const C = loaded.get(loader);
    return C ? <C /> : <Lazy />;
  };
  Page.preload = async () => { if (!loaded.has(loader)) loaded.set(loader, (await loader()).default); };
  return Page;
}

const PAGES = {
  "start/:slug": page(() => import("./pages/LifeStage")),
  "pf/health-check": page(() => import("./pages/pf/HealthCheck")),
  "pf/claim-rejected": page(() => import("./pages/pf/ClaimRejected")),
  "pf/job-change": page(() => import("./pages/pf/JobChange")),
  "pf/withdraw": page(() => import("./pages/pf/Withdraw")),
  "pf/pension": page(() => import("./pages/pf/Pension")),
  "pf/calculator": page(() => import("./pages/pf/EpfCalculator")),
  "pf/grievance": page(() => import("./pages/pf/Grievance")),
  "nps/tax": page(() => import("./pages/nps/NpsTax")),
  "nps/retirement": page(() => import("./pages/nps/NpsRetirement")),
  "compare": page(() => import("./pages/Compare")),
  "reminders": page(() => import("./pages/Reminders")),
  "help": page(() => import("./pages/Help")),
  "legal": page(() => import("./pages/Legal")),
  "answers": page(() => import("./pages/Answers")),
  "answers/:slug": page(() => import("./pages/AnswerPage")),
  "rules": page(() => import("./pages/Rules")),
  "glossary": page(() => import("./pages/Glossary")),
  "employers": page(() => import("./pages/Employers")),
  "about": page(() => import("./pages/About")),
  "ask": page(() => import("./pages/Ask")),
};

/** Load every page module (used by the prerenderer). */
export const preloadAll = () => Promise.all(Object.values(PAGES).map((p) => p.preload()));

/** Load the page module for one URL path (used before hydrating a prerendered page). */
export async function preloadFor(pathname: string) {
  const entry = Object.entries(PAGES).find(([path]) => matchPath("/" + path, pathname));
  if (entry) await entry[1].preload();
}

/** Route table shared by the browser app and the build-time prerenderer. */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {Object.entries(PAGES).map(([path, P]) => <Route key={path} path={path} element={<P />} />)}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
