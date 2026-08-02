import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import { formatDurationMinutes } from "@/lib/data/session-metrics.mjs";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
  getInvoiceRateColumnLabel,
  getInvoiceTotals,
  hasInvoiceDescriptions,
  sampleInvoiceData,
  type InvoiceData,
} from "./invoice-data";

export type { InvoiceData } from "./invoice-data";

interface TplKlasikProps {
  acc?: string;
  data?: InvoiceData;
}

export default function TplKlasik({ acc = "#006C53", data = sampleInvoiceData }: TplKlasikProps) {
  const { amount: sub, durationMinutes } = getInvoiceTotals(data.items);
  const showDescription = hasInvoiceDescriptions(data.items);

  return (
    <div className="tpl tpl-klasik" style={createInvoiceAccentStyle(acc)}>
      <div className="k-header">
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
      </div>

      <div className="k-parties">
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
      </div>

      <table className="k-table">
        <thead>
          <tr>
            <th style={{ width: "56px" }}>Tgl</th>
            {showDescription ? <th>Deskripsi</th> : null}
            <th className="right mono" style={{ width: "92px" }}>Durasi</th>
            <th className="right mono" style={{ width: "112px" }}>Tarif ({getInvoiceRateColumnLabel(data.items)})</th>
            <th className="right mono" style={{ width: "106px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td><span className="cell-content">{it.date}</span></td>
              {showDescription ? <td><span className="cell-content">{it.desc.trim() || "-"}</span></td> : null}
              <td className="right mono">
                <span className="cell-content">{formatDurationMinutes(it.durationMinutes)}</span>
              </td>
              <td className="right mono"><span className="cell-content">{formatIDR(it.rate)}</span></td>
              <td className="right mono"><span className="cell-content">{formatIDR(it.amount)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="k-total-block">
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
    </div>
  );
}
