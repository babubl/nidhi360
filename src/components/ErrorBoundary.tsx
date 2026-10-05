import { Component, type ReactNode } from "react";

/**
 * Catches render errors. The common production case is a stale page after a new deploy,
 * when an old chunk no longer exists: we reload once to pick up the new version.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: unknown) {
    const msg = String((error as Error)?.message ?? error);
    const isChunk = /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError/i.test(msg);
    try {
      if (isChunk && !sessionStorage.getItem("n360:reloaded")) {
        sessionStorage.setItem("n360:reloaded", "1");
        location.reload();
      }
    } catch { /* storage unavailable */ }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ maxWidth: 560, margin: "15vh auto", padding: 24, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong loading this page</h1>
        <p style={{ color: "#667085" }}>This usually fixes itself with a refresh. Your saved details are safe on this device.</p>
        <button onClick={() => location.reload()} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: 0, background: "#0B5D4B", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Refresh the page</button>
      </div>
    );
  }
}
