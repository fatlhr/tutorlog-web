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

async function capturePage(page: HTMLElement) {
  return html2canvas(page, {
    scale: EXPORT_SCALE,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
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
