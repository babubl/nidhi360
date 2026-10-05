import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const LifeStage = lazy(() => import("./pages/LifeStage"));
const HealthCheck = lazy(() => import("./pages/pf/HealthCheck"));
const ClaimRejected = lazy(() => import("./pages/pf/ClaimRejected"));
const JobChange = lazy(() => import("./pages/pf/JobChange"));
const Withdraw = lazy(() => import("./pages/pf/Withdraw"));
const Pension = lazy(() => import("./pages/pf/Pension"));
const NpsTax = lazy(() => import("./pages/nps/NpsTax"));
const NpsRetirement = lazy(() => import("./pages/nps/NpsRetirement"));
const Rules = lazy(() => import("./pages/Rules"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Employers = lazy(() => import("./pages/Employers"));
const About = lazy(() => import("./pages/About"));
const Ask = lazy(() => import("./pages/Ask"));

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="start/:slug" element={<LifeStage />} />
            <Route path="pf/health-check" element={<HealthCheck />} />
            <Route path="pf/claim-rejected" element={<ClaimRejected />} />
            <Route path="pf/job-change" element={<JobChange />} />
            <Route path="pf/withdraw" element={<Withdraw />} />
            <Route path="pf/pension" element={<Pension />} />
            <Route path="nps/tax" element={<NpsTax />} />
            <Route path="nps/retirement" element={<NpsRetirement />} />
            <Route path="rules" element={<Rules />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="employers" element={<Employers />} />
            <Route path="about" element={<About />} />
            <Route path="ask" element={<Ask />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
