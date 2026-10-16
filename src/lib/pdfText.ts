/**
 * Extract text from a PDF in the browser, line by line, with pdf.js loaded only when needed.
 * The file never leaves the device.
 */
export class PdfPasswordError extends Error {}

export async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerSrc } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch (e) {
    if ((e as { name?: string })?.name === "PasswordException") throw new PdfPasswordError("This PDF is password-protected. Open it, print it to a new PDF without a password, and try again.");
    throw new Error("We couldn't read this PDF. Try downloading the passbook again, or copy its text and paste it below.");
  }

  const out: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 60); n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    // Group text items into lines by their vertical position, then order each line left to right.
    const lines: { y: number; items: { x: number; s: string }[] }[] = [];
    for (const it of content.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      const [, , , , x, y] = it.transform as number[];
      let line = lines.find((l) => Math.abs(l.y - y) < 3);
      if (!line) { line = { y, items: [] }; lines.push(line); }
      line.items.push({ x, s: it.str });
    }
    lines.sort((a, b) => b.y - a.y);
    for (const l of lines) out.push(l.items.sort((a, b) => a.x - b.x).map((i) => i.s.trim()).join(" "));
    page.cleanup();
  }
  await doc.loadingTask.destroy();
  return out.join("\n");
}
