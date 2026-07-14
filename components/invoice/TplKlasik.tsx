import { createInvoiceAccentStyle } from "@/lib/invoice-colors";
import InvoiceNotes from "./InvoiceNotes";
import {
  formatIDR,
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
  const { amount: sub, hours } = getInvoiceTotals(data.items);
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
          <div className="lbl">NOMOR</div>
          <div className="val">{data.no}</div>
          <div className="lbl" style={{ marginTop: 6 }}>TANGGAL</div>
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
            <th style={{ width: "60px" }}>Tgl</th>
            {showDescription ? <th>Deskripsi</th> : null}
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "80px" }}>Tarif/jam</th>
            <th className="right mono" style={{ width: "90px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td><span className="cell-content">{it.date}</span></td>
              {showDescription ? <td><span className="cell-content">{it.desc.trim() || "-"}</span></td> : null}
              <td className="right mono"><span className="cell-content">{it.h.toFixed(1)}</span></td>
              <td className="right mono"><span className="cell-content">{formatIDR(it.rate)}</span></td>
              <td className="right mono"><span className="cell-content">{formatIDR(it.h * it.rate)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="k-total-block">
        <div className="row">
          <span>Total jam</span>
          <span className="val">{hours.toFixed(1)} jam</span>
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
