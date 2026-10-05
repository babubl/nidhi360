import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRoutes, { preloadAll } from "./App";
import { allPaths, fullTitle, getMeta, SITE_URL } from "./seo";

export { allPaths, getMeta, fullTitle, SITE_URL };

/**
 * Render one route to static HTML. Every page module is loaded first, so nothing suspends
 * and the full content is inline (readable without JavaScript, by crawlers and link previews).
 */
export async function render(url: string): Promise<string> {
  await preloadAll();
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  );
}
