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

interface TplMinimalProps {
  acc?: string;
  data?: InvoiceData;
  layout?: InvoicePageLayout;
}

export default function TplMinimal({ acc = "#006C53", data = sampleInvoiceData, layout }: TplMinimalProps) {
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
    <div className="tpl tpl-minimal" style={createInvoiceAccentStyle(acc)}>
      {showHeader ? <>
      {data.lembaga && (
        <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--tw-text-3)", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>{data.from.name} · {data.lembaga}</div>
      )}
      <div className="mn-title">INVOICE</div>
      <div className="mn-underline"></div>

      <div className="mn-head">
        <div className="col">
          <div className="lbl">TANGGAL</div>
          <div className="val">{data.date}</div>
          <div className="sub">{data.period}</div>
        </div>
        <div className="col">
          <div className="lbl">DARI</div>
          <div className="val">{data.from.name}</div>
          <div className="sub">{data.from.lines.map((line) => <div key={line}>{line}</div>)}</div>
        </div>
        <div className="col">
          <div className="lbl">DITAGIH KE</div>
          <div className="val">{data.to.name}</div>
          <div className="sub">{data.to.lines.map((line) => <div key={line}>{line}</div>)}</div>
        </div>
      </div>
      </> : null}

      {showTable ? <table className="mn-table">
        <thead>
          <tr>
            <th className="col-date" style={{ width: "64px" }}>Tgl</th>
            {showDescription ? <th className="col-desc">Deskripsi sesi</th> : null}
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
                <td className="right mono">
                  <span>{formatDurationMinutes(it.durationMinutes)}</span>
                </td>
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
      <div className="mn-total-row" data-invoice-tail-start>
        <span className="hours">Total durasi <strong>{formatDurationMinutes(durationMinutes)}</strong></span>
        <span className="lbl">TOTAL</span>
        <span className="val">{formatIDR(sub)}</span>
      </div>

      <div className="mn-foot">
        <div className="box">
          <div className="lbl">CATATAN</div>
          <InvoiceNotes notes={data.notes} />
        </div>
        <div className="box bank">
          <div className="lbl">TRANSFER KE</div>
          <div className="val">{data.bank.bank} · {data.bank.no}</div>
          <div className="body">a/n {data.bank.name}</div>
        </div>
      </div>
      </> : null}
    </div>
  );
}
