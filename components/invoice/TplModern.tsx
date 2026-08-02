import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
  getInvoiceTotals,
  hasInvoiceDescriptions,
  sampleInvoiceData,
  type InvoiceData,
} from "./invoice-data";

interface TplModernProps {
  acc?: string;
  data?: InvoiceData;
}

export default function TplModern({ acc = "#006C53", data = sampleInvoiceData }: TplModernProps) {
  const { amount: sub, hours } = getInvoiceTotals(data.items);
  const showDescription = hasInvoiceDescriptions(data.items);

  return (
    <div className="tpl tpl-modern" style={createInvoiceAccentStyle(acc)}>
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

      <table className="m-table">
        <thead>
          <tr>
            <th style={{ width: "56px" }}>Tgl</th>
            {showDescription ? <th>Deskripsi</th> : null}
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "112px" }}>Tarif</th>
            <th className="right mono" style={{ width: "106px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr className="m-table-gap" aria-hidden="true">
            <td colSpan={showDescription ? 5 : 4}></td>
          </tr>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td>{it.date}</td>
              {showDescription ? <td>{it.desc.trim() || "-"}</td> : null}
              <td className="right mono">{it.h.toFixed(1)}</td>
              <td className="right mono">{formatIDR(it.rate)}</td>
              <td className="right mono">{formatIDR(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="m-total-summary">
        <div className="m-total-hours">
          <span>Total jam</span>
          <strong>{hours.toFixed(1)} jam</strong>
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
    </div>
  );
}
