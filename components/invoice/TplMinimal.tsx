import type { InvoiceData } from "./TplKlasik";

function formatIDR(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

interface TplMinimalProps {
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

export default function TplMinimal({ acc = "#006C53", data = defaultData }: TplMinimalProps) {
  const sub = data.items.reduce((s, it) => s + it.h * it.rate, 0);

  return (
    <div className="tpl tpl-minimal" style={{ ["--acc" as string]: acc }}>
      {data.lembaga && (
        <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--tw-text-3)", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>{data.from.name} · {data.lembaga}</div>
      )}
      <h1 className="mn-title">INVOICE</h1>
      <div className="mn-underline"></div>

      <div className="mn-head">
        <div className="col">
          <div className="lbl">NOMOR</div>
          <div className="val">{data.no}</div>
          <div className="sub" style={{ marginTop: 6 }}>{data.period}</div>
        </div>
        <div className="col">
          <div className="lbl">DARI</div>
          <div className="val">{data.from.name}</div>
          <div className="sub">{data.from.lines[0]}<br />{data.from.lines[2]}</div>
        </div>
        <div className="col">
          <div className="lbl">DITAGIH KE</div>
          <div className="val">{data.to.name}</div>
          <div className="sub">{data.to.lines[0]}<br />{data.to.lines[1]}</div>
        </div>
      </div>

      <table className="mn-table">
        <thead>
          <tr>
            <th style={{ width: "55px" }}>Tgl</th>
            <th>Deskripsi sesi</th>
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "90px" }}>Tarif</th>
            <th className="right mono" style={{ width: "100px" }}>Subtotal</th>
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

      <div className="mn-total-row">
        <span className="lbl">TOTAL</span>
        <span className="val">{formatIDR(sub)}</span>
      </div>

      <div className="mn-foot">
        <div className="box">
          <div className="lbl">CATATAN</div>
          <div className="body">{data.notes}</div>
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