import type { InvoiceData } from "./TplKlasik";

function formatIDR(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

interface TplModernProps {
  acc?: string;
  data?: InvoiceData;
}

const defaultData: InvoiceData = {
  no: "INV-2026/06-014",
  date: "30 Juni 2026",
  due: "7 Juli 2026",
  period: "1 – 30 Juni 2026",
  from: {
    name: "Rina Novianti",
    lines: ["Guru Matematika & Fisika", "Jakarta Selatan", "rina@tutorlog.id · 0812-3456-7890"],
  },
  to: {
    name: "Bpk. Ahmad Wijaya",
    lines: ["Wali murid Bintang Wijaya", "Kelas 10 – SMA Al-Azhar"],
  },
  bank: { bank: "BCA", no: "1234 5678 9012", name: "Rina Novianti" },
  items: [
    { date: "03 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
    { date: "05 Jun", desc: "Matematika · Latihan Soal", h: 1.5, rate: 120000 },
    { date: "10 Jun", desc: "Fisika · Gerak Lurus", h: 2.0, rate: 130000 },
    { date: "12 Jun", desc: "Matematika · Trigonometri", h: 1.5, rate: 120000 },
    { date: "17 Jun", desc: "Fisika · Hukum Newton", h: 2.0, rate: 130000 },
    { date: "19 Jun", desc: "Matematika · Persiapan UH", h: 1.5, rate: 120000 },
    { date: "24 Jun", desc: "Fisika · Energi & Usaha", h: 2.0, rate: 130000 },
    { date: "26 Jun", desc: "Matematika · Review UH", h: 1.5, rate: 120000 },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer ke rekening di bawah paling lambat 7 Juli 2026.",
};

export default function TplModern({ acc = "#006C53", data = defaultData }: TplModernProps) {
  const sub = data.items.reduce((s, it) => s + it.h * it.rate, 0);

  return (
    <div className="tpl tpl-modern" style={{ ["--acc" as string]: acc }}>
      <div className="m-strip"></div>

      <div className="m-head">
        <div>
          <div className="sub">Rina Novianti · Bimbel Privat</div>
          <h1>Invoice.</h1>
        </div>
        <div className="meta">
          <div className="row"><span className="lbl">No.</span><span className="val">{data.no}</span></div>
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
            <th style={{ width: "60px" }}>Tgl</th>
            <th>Deskripsi</th>
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "80px" }}>Tarif</th>
            <th className="right mono" style={{ width: "90px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td>{it.date}</td>
              <td>{it.desc}</td>
              <td className="right mono">{it.h.toFixed(1)}</td>
              <td className="right mono">{formatIDR(it.rate)}</td>
              <td className="right mono">{formatIDR(it.h * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="m-total-badge">
        <span className="lbl">Total</span>
        <span className="val">{formatIDR(sub)}</span>
      </div>

      <div className="m-foot">
        <div className="box">
          <div className="lbl">Catatan</div>
          <div className="body">{data.notes}</div>
        </div>
        <div className="box bank">
          <div className="lbl">Transfer ke {data.bank.bank}</div>
          <div className="val">{data.bank.no}</div>
          <div className="body" style={{ marginTop: 2 }}>a/n {data.bank.name}</div>
        </div>
      </div>
    </div>
  );
}