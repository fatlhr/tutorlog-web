import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import { formatDurationMinutes } from "@/lib/data/session-metrics.mjs";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
  getInvoiceRateCellLabel,
  getInvoiceRateColumnLabel,
  getInvoiceTotals,
  hasInvoiceDescriptions,
  hasMixedInvoiceBillingTypes,
  hasInvoiceSubtotalColumn,
  sampleInvoiceData,
  type InvoiceData,
  type InvoicePageLayout,
} from "./invoice-data";

export type { InvoiceData } from "./invoice-data";

interface TplKlasikProps {
  acc?: string;
  data?: InvoiceData;
  layout?: InvoicePageLayout;
}

export default function TplKlasik({ acc = "#006C53", data = sampleInvoiceData, layout }: TplKlasikProps) {
  const { amount: sub, durationMinutes } = getInvoiceTotals(data.items);
  const showDescription = hasInvoiceDescriptions(data.items);
  const showSubtotal = hasInvoiceSubtotalColumn(data.items);
  const showRateDetails = hasMixedInvoiceBillingTypes(data.items);
  const rateLabel = getInvoiceRateColumnLabel(data.items);
  const pageItems = layout?.items ?? data.items;
  const showHeader = layout?.showHeader ?? true;
  const showTable = layout?.showTable ?? true;
  const showTail = layout?.showTail ?? true;

  return (
    <div className="tpl tpl-klasik" style={createInvoiceAccentStyle(acc)}>
      {showHeader ? <div className="k-header">
        <div>
          {data.lembaga && (
            <div className="brand-line">
              <span className="dot"></span>
              <span className="nm">{data.from.name} · {data.lembaga}</span>
            </div>
          )}
          <div className="inv-document-title">INVOICE</div>
          <div className="subj">Rekap sesi les periode {data.period}</div>
        </div>
        <div className="no">
          <div className="lbl">TANGGAL</div>
          <div className="val">{data.date}</div>
        </div>
      </div> : null}

      {showHeader ? <div className="k-parties">
        <div className="col">
          <div className="lbl">DARI</div>
          <div className="n">{data.from.name}</div>
          <div className="d">{data.from.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
        </div>
        <div className="col">
          <div className="lbl">DITAGIH KEPADA</div>
          <div className="n">{data.to.name}</div>
          <div className="d">{data.to.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
        </div>
      </div> : null}

      {showTable ? <table className="k-table">
        <thead>
          <tr>
            <th className="col-date" style={{ width: "64px" }}>Tgl</th>
            {showDescription ? <th className="col-desc">Deskripsi</th> : null}
            <th className="right mono" style={{ width: "92px" }}>Durasi</th>
            <th className="right mono stacked" style={{ width: "112px" }}>
              Tarif{rateLabel ? <><br />({rateLabel})</> : null}
            </th>
            {showSubtotal ? <th className="right mono" style={{ width: "106px" }}>Subtotal</th> : null}
          </tr>
        </thead>
        <tbody>
          {pageItems.map((it, i) => {
            const rateDetail = showRateDetails ? getInvoiceRateCellLabel(it.billingType) : "";
            return (
              <tr key={i} data-invoice-row>
                <td className="col-date">{it.date}</td>
                {showDescription ? <td className="col-desc">{it.desc.trim() || "-"}</td> : null}
                <td className="right mono">{formatDurationMinutes(it.durationMinutes)}</td>
                <td className="right mono col-rate">
                  <span className="invoice-rate-cell">
                    <span>{formatIDR(it.rate)}</span>
                    {rateDetail ? <span className="invoice-rate-meta">{rateDetail}</span> : null}
                  </span>
                </td>
                {showSubtotal ? <td className="right mono">{formatIDR(it.amount)}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table> : null}

      {showTail ? <>
      <div className="k-total-block" data-invoice-tail-start>
        <div className="row">
          <span>Total durasi</span>
          <span className="val">{formatDurationMinutes(durationMinutes)}</span>
        </div>
        <div className="total">
          <span className="lbl">TOTAL TAGIHAN</span>
          <span className="val">{formatIDR(sub)}</span>
        </div>
      </div>

      <div className="k-notes">
        <div className="lbl">Catatan</div>
        <InvoiceNotes notes={data.notes} />
      </div>

      <div className="k-bank">
        <div className="lbl">Pembayaran ke</div>
        <div className="val">{data.bank.bank} · {data.bank.no} · a/n {data.bank.name}</div>
      </div>
      </> : null}
    </div>
  );
}
