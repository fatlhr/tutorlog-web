import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
  getInvoiceTotals,
  hasInvoiceDescriptions,
  sampleInvoiceData,
  type InvoiceData,
} from "./invoice-data";

interface TplMinimalProps {
  acc?: string;
  data?: InvoiceData;
}

export default function TplMinimal({ acc = "#006C53", data = sampleInvoiceData }: TplMinimalProps) {
  const { amount: sub, hours } = getInvoiceTotals(data.items);
  const showDescription = hasInvoiceDescriptions(data.items);

  return (
    <div className="tpl tpl-minimal" style={createInvoiceAccentStyle(acc)}>
      {data.lembaga && (
        <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--tw-text-3)", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>{data.from.name} · {data.lembaga}</div>
      )}
      <div className="mn-title">INVOICE</div>
      <div className="mn-underline"></div>

      <div className="mn-head">
        <div className="col">
          <div className="lbl">NOMOR</div>
          <div className="val">{data.no}</div>
          <div className="sub" style={{ marginTop: 6 }}>{data.date}</div>
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

      <table className="mn-table">
        <thead>
          <tr>
            <th style={{ width: "56px" }}>Tgl</th>
            {showDescription ? <th>Deskripsi sesi</th> : null}
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "112px" }}>Tarif</th>
            <th className="right mono" style={{ width: "106px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
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

      <div className="mn-total-row">
        <span className="hours">Total jam <strong>{hours.toFixed(1)} jam</strong></span>
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
    </div>
  );
}
