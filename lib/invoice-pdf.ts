import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

/* html2canvas 1.4.1 menaruh setiap text run di `bounds.top + baseline`, dengan
   baseline dari FontMetrics.parseMetrics:

     var baseline = img.offsetTop - span.offsetTop + 2;

   Probe itu punya dua cacat. `offsetTop` mengembalikan integer, jadi hasilnya
   dibulatkan, lalu ditambah fudge `+2`. Dan probe-nya diukur di container
   `line-height: normal`, sehingga line-height asli elemen diabaikan padahal
   jarak line-box-top ke baseline ikut half-leading.

   Akibatnya teks digambar 1-4px terlalu rendah, dan besar errornya berbeda per
   (font-family, font-size). Di dalam kotak tinggi tetap (sel header 34px, pill
   .k-bank 36px) teks jadi terlihat tidak rata tengah; di baris label+value yang
   sengaja beda ukuran, baseline yang presisi di preview jadi meleset 1-2px.

   Koreksinya: hitung selisih antara tebakan html2canvas dan baseline yang
   benar-benar dipakai browser, lalu geser elemen naik sebesar selisih itu.
   Pakai `position: relative` supaya murni visual - tidak ada reflow, jadi
   posisi potong halaman tetap sama dengan preview yang sudah dipaginasi. */

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

/* Jarak sebenarnya dari atas line box ke baseline. Span inline-block 0x0 dengan
   vertical-align: baseline duduk tepat di baseline barisnya, dan karena tanpa
   ukuran ia tidak mengubah tinggi line box. */
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

/* Koreksi harus geser SPAN pembungkus, bukan elemen aslinya. th/td dan pill
   .k-bank punya border, background, border-radius - kalau position:relative
   ditaruh langsung di situ, html2canvas menggeser seluruh kotaknya (bukan cuma
   teks), dan sel-sel bertetangga yang butuh koreksi berbeda jadi tidak sejajar
   satu sama lain (border antar sel pecah). Span baru selalu inline dan tanpa
   style sendiri, jadi aman digeser murni visual tanpa menyentuh kotak induk. */
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

    /* html2canvas membuat FontMetrics-nya dengan `new FontMetrics(document)`,
       yaitu dokumen utama - bukan dokumen kloningan. Probe di tempat yang sama,
       kalau tidak tebakannya diukur terhadap style body yang berbeda. */
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

async function capturePage(page: HTMLElement) {
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

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (const [index, page] of pages.entries()) {
    const canvas = await capturePage(page);
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
