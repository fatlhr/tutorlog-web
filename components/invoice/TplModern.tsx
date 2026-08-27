import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import { formatDurationMinutes } from "@/lib/data/session-metrics.mjs";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
  getInvoiceRateColumnLabel,
  getInvoiceTotals,
  hasInvoiceDescriptions,
  hasInvoiceRateColumn,
  sampleInvoiceData,
  type InvoiceData,
  type InvoicePageLayout,
} from "./invoice-data";

interface TplModernProps {
  acc?: string;
  data?: InvoiceData;
  layout?: InvoicePageLayout;
}

export default function TplModern({ acc = "#006C53", data = sampleInvoiceData, layout }: TplModernProps) {
  const { amount: sub, durationMinutes } = getInvoiceTotals(data.items);
  const showDescription = hasInvoiceDescriptions(data.items);
  const showRate = hasInvoiceRateColumn(data.items);
  const columnCount = 3 + (showDescription ? 1 : 0) + (showRate ? 1 : 0);
  const pageItems = layout?.items ?? data.items;
  const showHeader = layout?.showHeader ?? true;
  const showTable = layout?.showTable ?? true;
  const showTail = layout?.showTail ?? true;

  return (
    <div className="tpl tpl-modern" style={createInvoiceAccentStyle(acc)}>
      {showHeader ? <>
      <div className="m-strip"></div>

      <div className="m-head">
        <div>
          {data.lembaga && (
            <div className="sub">{data.from.name} · {data.lembaga}</div>
          )}
          <div className="inv-document-title">Invoice.</div>
        </div>
        <div className="meta">
          <div className="row"><span className="lbl">Tanggal</span><span className="val">{data.date}</span></div>
          <div className="row"><span className="lbl">Periode</span><span className="val">{data.period}</span></div>
        </div>
      </div>

      <div className="m-parties">
        <div className="col">
          <div className="lbl">Dari</div>
          <div className="n">{data.from.name}</div>
          <div className="d">{data.from.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
        </div>
        <div className="col">
          <div className="lbl">Ditagihkan ke</div>
          <div className="n">{data.to.name}</div>
          <div className="d">{data.to.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
        </div>
      </div>
      </> : null}

      {showTable ? <table className="m-table">
        <thead>
          <tr>
            <th className="col-date" style={{ width: "64px" }}>Tgl</th>
            {showDescription ? <th className="col-desc">Deskripsi</th> : null}
            <th className="right mono" style={{ width: "92px" }}>Durasi</th>
            {showRate ? (
              <th className="right mono stacked" style={{ width: "112px" }}>Tarif<br />per {getInvoiceRateColumnLabel(data.items)}</th>
            ) : null}
            <th className="right mono" style={{ width: "106px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr className="m-table-gap" aria-hidden="true">
            <td colSpan={columnCount}></td>
          </tr>
            {pageItems.map((it, i) => (
              <tr key={i} data-invoice-row>
              <td className="col-date">{it.date}</td>
              {showDescription ? <td className="col-desc">{it.desc.trim() || "-"}</td> : null}
              <td className="right mono">
                <span>{formatDurationMinutes(it.durationMinutes)}</span>
              </td>
              {showRate ? <td className="right mono">{formatIDR(it.rate)}</td> : null}
              <td className="right mono">{formatIDR(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table> : null}

      {showTail ? <>
      <div className="m-total-summary" data-invoice-tail-start>
        <div className="m-total-hours">
          <span>Total durasi</span>
          <strong>{formatDurationMinutes(durationMinutes)}</strong>
        </div>
        <div className="m-total-amount">
          <span className="lbl">Total</span>
          <span className="val">{formatIDR(sub)}</span>
        </div>
      </div>

      <div className="m-foot">
        <div className="box">
          <div className="lbl">Catatan</div>
          <InvoiceNotes notes={data.notes} />
        </div>
        <div className="box bank">
          <div className="lbl">Transfer ke</div>
          <div className="val">{data.bank.bank} · {data.bank.no}</div>
          <div className="body">a/n {data.bank.name}</div>
        </div>
      </div>
      </> : null}
    </div>
  );
}
