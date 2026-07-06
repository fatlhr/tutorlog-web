interface TplKlasikProps {
  acc?: string;
  data?: InvoiceData;
}

export interface InvoiceData {
  no: string;
  date: string;
  due: string;
  period: string;
  from: { name: string; lines: string[] };
  to: { name: string; lines: string[] };
  bank: { bank: string; no: string; name: string };
  items: { date: string; desc: string; h: number; rate: number }[];
  notes: string;
}

function formatIDR(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

const sampleData: InvoiceData = {
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
    lines: ["Orang tua Bintang Wijaya", "Kelas 10 – SMA Al-Azhar", "Jl. Kemang Raya No. 42, Jakarta Selatan"],
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

export default function TplKlasik({ acc = "#006C53", data = sampleData }: TplKlasikProps) {
  const sub = data.items.reduce((s, it) => s + it.h * it.rate, 0);
  const hours = data.items.reduce((s, it) => s + it.h, 0);

  return (
    <div className="tpl tpl-klasik" style={{ ["--acc" as string]: acc }}>
      <div className="k-header">
        <div>
          <div className="brand-line">
            <span className="dot"></span>
            <span className="nm">Rina Novianti · Bimbel Privat</span>
          </div>
          <h1>INVOICE</h1>
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
            <th>Deskripsi</th>
            <th className="right mono" style={{ width: "46px" }}>Jam</th>
            <th className="right mono" style={{ width: "80px" }}>Tarif/jam</th>
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
        <div className="body">{data.notes}</div>
      </div>

      <div className="k-bank">
        <div className="lbl">Pembayaran ke</div>
        <div className="val">{data.bank.bank} · {data.bank.no} · a/n {data.bank.name}</div>
      </div>
    </div>
  );
}