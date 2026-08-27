"use client";

import { useLayoutEffect, useRef, useState, type Ref } from "react";
import A4Page from "./A4Page";
import TplKlasik from "./TplKlasik";
import TplMinimal from "./TplMinimal";
import TplModern from "./TplModern";
import type { InvoiceData, InvoicePageLayout } from "./invoice-data";

export type InvoiceTemplateName = "klasik" | "modern" | "minimal";

interface InvoicePagesProps {
  accent: string;
  data: InvoiceData;
  rootRef?: Ref<HTMLDivElement>;
  template: InvoiceTemplateName;
  variant?: "preview" | "export";
}

interface Measurement {
  continuationFixedHeight: number;
  firstFixedHeight: number;
  rowHeights: number[];
  tailHeight: number;
}

interface PageDraft extends InvoicePageLayout {
  fixedHeight: number;
  rowsHeight: number;
}

const A4_HEIGHT_PX = 1123;
const A4_PADDING_PX = 42;
const PAGE_CONTENT_HEIGHT_PX = A4_HEIGHT_PX - A4_PADDING_PX * 2;
const FIT_EPSILON_PX = 0.5;

function singlePageLayout(data: InvoiceData): InvoicePageLayout {
  return {
    items: data.items,
    showHeader: true,
    showTable: true,
    showTail: true,
  };
}

function buildPageLayouts(data: InvoiceData, measurement: Measurement): InvoicePageLayout[] {
  if (data.items.length === 0 || measurement.rowHeights.length !== data.items.length) {
    return [singlePageLayout(data)];
  }

  const pages: PageDraft[] = [];
  let itemIndex = 0;
  let isFirstPage = true;

  while (itemIndex < data.items.length) {
    const startIndex = itemIndex;
    const fixedHeight = isFirstPage
      ? measurement.firstFixedHeight
      : measurement.continuationFixedHeight;
    const availableRowsHeight = Math.max(0, PAGE_CONTENT_HEIGHT_PX - fixedHeight);
    let rowsHeight = 0;

    while (itemIndex < data.items.length) {
      const nextRowsHeight = rowsHeight + measurement.rowHeights[itemIndex];
      const isFirstRowOnPage = itemIndex === startIndex;
      if (!isFirstRowOnPage && nextRowsHeight > availableRowsHeight + FIT_EPSILON_PX) break;
      rowsHeight = nextRowsHeight;
      itemIndex += 1;
    }

    pages.push({
      fixedHeight,
      items: data.items.slice(startIndex, itemIndex),
      rowsHeight,
      showHeader: isFirstPage,
      showTable: true,
      showTail: false,
    });
    isFirstPage = false;
  }

  const lastPage = pages[pages.length - 1];
  const remainingHeight = PAGE_CONTENT_HEIGHT_PX - lastPage.fixedHeight - lastPage.rowsHeight;
  if (measurement.tailHeight <= remainingHeight + FIT_EPSILON_PX) {
    lastPage.showTail = true;
  } else {
    pages.push({
      fixedHeight: 0,
      items: [],
      rowsHeight: 0,
      showHeader: false,
      showTable: false,
      showTail: true,
    });
  }

  return pages.map(({ fixedHeight: _fixedHeight, rowsHeight: _rowsHeight, ...layout }) => layout);
}

function readMeasurement(page: HTMLDivElement): Measurement | null {
  const template = page.querySelector<HTMLElement>(".tpl");
  const table = page.querySelector<HTMLElement>("table");
  const rows = Array.from(page.querySelectorAll<HTMLElement>("[data-invoice-row]"));
  if (!template || !table || rows.length === 0) return null;

  const pageRect = page.getBoundingClientRect();
  const renderedScale = page.offsetWidth > 0 ? pageRect.width / page.offsetWidth : 1;
  const scale = renderedScale > 0 ? renderedScale : 1;
  const templateRect = template.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const firstRowRect = rows[0].getBoundingClientRect();
  const lastRowRect = rows[rows.length - 1].getBoundingClientRect();
  const tableMarginTop = Number.parseFloat(getComputedStyle(table).marginTop) || 0;

  return {
    continuationFixedHeight: tableMarginTop + (firstRowRect.top - tableRect.top) / scale,
    firstFixedHeight: (firstRowRect.top - templateRect.top) / scale,
    rowHeights: rows.map((row) => row.getBoundingClientRect().height / scale),
    tailHeight: (templateRect.bottom - lastRowRect.bottom) / scale,
  };
}

function InvoiceTemplate({
  accent,
  data,
  layout,
  template,
}: {
  accent: string;
  data: InvoiceData;
  layout?: InvoicePageLayout;
  template: InvoiceTemplateName;
}) {
  if (template === "modern") return <TplModern acc={accent} data={data} layout={layout} />;
  if (template === "minimal") return <TplMinimal acc={accent} data={data} layout={layout} />;
  return <TplKlasik acc={accent} data={data} layout={layout} />;
}

export default function InvoicePages({
  accent,
  data,
  rootRef,
  template,
  variant = "preview",
}: InvoicePagesProps) {
  const measurementRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  const [layouts, setLayouts] = useState<InvoicePageLayout[]>(() => [singlePageLayout(data)]);
  const [ready, setReady] = useState(false);
  const paginationKey = JSON.stringify(data);
  dataRef.current = data;

  useLayoutEffect(() => {
    let cancelled = false;
    let fontFrame = 0;
    const currentData = dataRef.current;
    setReady(false);
    setLayouts([singlePageLayout(currentData)]);

    const measure = (isFinal: boolean) => {
      if (cancelled || !measurementRef.current) return;
      const measurement = readMeasurement(measurementRef.current);
      if (measurement) setLayouts(buildPageLayouts(currentData, measurement));
      if (isFinal) setReady(true);
    };

    const initialFrame = requestAnimationFrame(() => {
      const fontsLoaded = !document.fonts || document.fonts.status === "loaded";
      measure(fontsLoaded);
    });

    if (document.fonts) {
      void document.fonts.ready.then(() => {
        if (!cancelled) fontFrame = requestAnimationFrame(() => measure(true));
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(initialFrame);
      if (fontFrame) cancelAnimationFrame(fontFrame);
    };
  }, [paginationKey, template]);

  return (
    <>
      <div className="invoice-pagination-measure" aria-hidden="true">
        <A4Page pageRef={measurementRef} variant="measure">
          <InvoiceTemplate accent={accent} data={data} template={template} />
        </A4Page>
      </div>

      <div
        ref={rootRef}
        className="invoice-page-stack"
        data-invoice-pages-ready={ready ? "true" : "false"}
      >
        {layouts.map((layout, index) => (
          <A4Page
            key={`${template}-${index}`}
            pageNumber={index + 1}
            variant={variant}
          >
            <InvoiceTemplate accent={accent} data={data} layout={layout} template={template} />
          </A4Page>
        ))}
      </div>
    </>
  );
}
