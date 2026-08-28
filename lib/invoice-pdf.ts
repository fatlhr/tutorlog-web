import type { jsPDF } from "jspdf";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const EXPORT_SCALE = 2;
const JPEG_QUALITY = 0.88;
const PAGINATION_WAIT_FRAMES = 30;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForPagination(pageRoot: HTMLElement) {
  for (let frame = 0; frame < PAGINATION_WAIT_FRAMES; frame += 1) {
    if (pageRoot.dataset.invoicePagesReady === "true") return;
    await nextFrame();
  }
  throw new Error("INVOICE_PAGINATION_NOT_READY");
}

type Html2Canvas = typeof import("html2canvas")["default"];

const H2C_SAMPLE_TEXT = "Hidden Text";
const H2C_SMALL_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function estimateHtml2CanvasBaseline(
  doc: Document,
  fontFamily: string,
  fontSize: string,
): number {
  const container = doc.createElement("div");
  const img = doc.createElement("img");
  const span = doc.createElement("span");

  container.style.visibility = "hidden";
  container.style.fontFamily = fontFamily;
  container.style.fontSize = fontSize;
  container.style.margin = "0";
  container.style.padding = "0";
  container.style.whiteSpace = "nowrap";
  doc.body.appendChild(container);

  img.src = H2C_SMALL_IMAGE;
  img.width = 1;
  img.height = 1;
  img.style.margin = "0";
  img.style.padding = "0";
  img.style.verticalAlign = "baseline";

  span.style.fontFamily = fontFamily;
  span.style.fontSize = fontSize;
  span.style.margin = "0";
  span.style.padding = "0";
  span.appendChild(doc.createTextNode(H2C_SAMPLE_TEXT));

  container.appendChild(span);
  container.appendChild(img);
  const baseline = img.offsetTop - span.offsetTop + 2;
  doc.body.removeChild(container);

  return baseline;
}

function measureRenderedBaseline(element: HTMLElement): number {
  const doc = element.ownerDocument;
  const probe = doc.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  element.insertBefore(probe, element.firstChild);

  const range = doc.createRange();
  range.selectNodeContents(element);
  const lineTop = range.getBoundingClientRect().top;
  range.detach();
  const baselineTop = probe.getBoundingClientRect().top;

  element.removeChild(probe);
  return baselineTop - lineTop;
}

function wrapEveryTextRun(root: HTMLElement): HTMLElement[] {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const runs: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    if (node.textContent?.trim()) runs.push(node as Text);
    node = walker.nextNode();
  }

  return runs.map((text) => {
    const span = doc.createElement("span");
    text.parentNode?.insertBefore(span, text);
    span.appendChild(text);
    return span;
  });
}

function neutralizeBaselineDriftForCapture(page: HTMLElement) {
  const doc = page.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;

  const targets = wrapEveryTextRun(page);
  const baselineCache = new Map<string, number>();

  const corrections = targets.map((element) => {
    const styles = view.getComputedStyle(element);
    const key = `${styles.fontFamily}|${styles.fontSize}`;

    if (!baselineCache.has(key)) {
      baselineCache.set(
        key,
        estimateHtml2CanvasBaseline(document, styles.fontFamily, styles.fontSize),
      );
    }

    const estimated = baselineCache.get(key) ?? 0;
    return { element, delta: estimated - measureRenderedBaseline(element) };
  });

  for (const { element, delta } of corrections) {
    if (Math.abs(delta) < 0.05) continue;
    if (view.getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }
    element.style.top = `${-delta}px`;
  }
}

async function capturePage(html2canvas: Html2Canvas, page: HTMLElement) {
  return html2canvas(page, {
    scale: EXPORT_SCALE,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    onclone: (_document, clonedPage) => neutralizeBaselineDriftForCapture(clonedPage),
  });
}

export async function exportInvoicePdf(pageRoot: HTMLElement): Promise<jsPDF> {
  if (document.fonts?.ready) await document.fonts.ready;
  await waitForPagination(pageRoot);

  const pages = Array.from(pageRoot.querySelectorAll<HTMLElement>("[data-invoice-page]"));
  if (pages.length === 0) throw new Error("INVOICE_PAGES_NOT_FOUND");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (const [index, page] of pages.entries()) {
    const canvas = await capturePage(html2canvas, page);
    const imgData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    if (index > 0) pdf.addPage();
    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      PAGE_WIDTH_MM,
      PAGE_HEIGHT_MM,
      undefined,
      "FAST",
    );
  }

  return pdf;
}
