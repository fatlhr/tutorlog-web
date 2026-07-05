// web-mobile-screens.jsx — Mobile v3: Premium mobile-native redesign (390px)
// Depends: web-shared.jsx

// ---- Particles helper ----
function MobParticles({ items }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {items.map((p, i) => (
        <div key={i} className={'login-particle pulse' + (p.glow ? ' glow' : '')}
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, '--pd': p.pd || '5s', '--po': p.po || .3, '--pt': p.pt || '0s' }} />
      ))}
    </div>
  );
}

const defaultParticles = [
  { x: '8%', y: '10%', s: 5, glow: true, pd: '5s', po: .35, pt: '0s' },
  { x: '78%', y: '8%', s: 4, glow: false, pd: '4s', po: .2, pt: '.6s' },
  { x: '92%', y: '28%', s: 6, glow: true, pd: '6s', po: .4, pt: '1.2s' },
  { x: '15%', y: '52%', s: 4, glow: false, pd: '4.5s', po: .25, pt: '1.8s' },
  { x: '62%', y: '62%', s: 7, glow: true, pd: '5s', po: .35, pt: '.4s' },
  { x: '38%', y: '82%', s: 4, glow: false, pd: '5.5s', po: .2, pt: '2.2s' },
  { x: '88%', y: '72%', s: 5, glow: true, pd: '4s', po: .3, pt: '1s' },
];

// ---- Mobile nav ----
function MobNav({ dark }) {
  return (
    <nav className={'mob-nav' + (dark ? ' mob-nav-dark' : '')}>
      <div className="brand">
        <span className="mk"><img src="tutorlog-logo.png" alt="" /></span>
        <span className="wm">TutorLog</span>
      </div>
      <button className="hamburger"><span></span><span></span><span></span></button>
    </nav>
  );
}

// ---- Mobile footer ----
function MobFooter() {
  return (
    <div className="mob-footer">
      <div className="top">
        <span style={{ width: 24, height: 24, borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="tutorlog-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>
        <span className="brand-sm">TutorLog</span>
      </div>
      <div className="links">
        <a href="#">Fitur</a><a href="#">Harga</a><a href="#">Panduan</a>
        <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Kontak</a>
      </div>
      <div className="copy">© 2026 · Buat tutor Indonesia dengan ♥</div>
    </div>
  );
}

// ---- Mobile tab bar ----
function MobTabBar({ active }) {
  const tabs = [
    { id: 'rekap', label: 'Rekap', icon: <Icons.chart size={18} /> },
    { id: 'invoice', label: 'Invoice', icon: <Icons.invoice size={18} /> },
    { id: 'langganan', label: 'Langganan', icon: <Icons.wallet size={18} /> },
    { id: 'setting', label: 'Lainnya', icon: <Icons.cog size={18} /> },
  ];
  return (
    <div className="mob-tab-bar">
      {tabs.map(t => (
        <a key={t.id} href="#" className={'mob-tab' + (active === t.id ? ' active' : '')}>
          <span className="tab-ic">{t.icon}</span>
          <span>{t.label}</span>
        </a>
      ))}
    </div>
  );
}
function MobAppShell({ active, children }) {
  return (
    <div className="mob-app-shell">
      <div className="mob-app-main">{children}</div>
      <MobTabBar active={active} />
    </div>
  );
}

// ---- Reusable: soft banner hero (no dark, no glow) ----
function MobSoftHero({ icon, title, subtitle, children }) {
  return (
    <div className="mob-soft-hero">
      <MobNav />
      <div className="mob-soft-hero__content">
        {icon && <div className="mob-soft-hero__icon">{icon}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="mob-soft-hero__sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// =========================================================
// LANDING
// =========================================================
function MobScreenLanding() {
  return (
    <div className="mob-page tw">
      <div className="mob-hero">
        <MobNav dark />
        <MobParticles items={defaultParticles} />
        <div className="hero-content">
          <span className="kicker-dark"><span className="dot"></span>Companion Web</span>
          <h1>Rekap sesi les.<br/>Invoice <span className="em">rapi</span>.</h1>
          <p className="hero-desc">TutorLog di ponsel mencatat — companion web merangkum dan menagih.</p>
          <div className="cta-col">
            <button className="btn-hero primary"><Icons.mail size={18} /><span>Masuk dengan Magic Link</span></button>
            <button className="btn-hero ghost"><span>Lihat demo</span><Icons.arrowR size={18} /></button>
          </div>
          <div className="trust-row">
            <span><Icons.checkCircle size={14} /> Gratis untuk mulai</span>
            <span><Icons.checkCircle size={14} /> Tanpa kartu kredit</span>
            <span><Icons.checkCircle size={14} /> Sinkron dengan app</span>
          </div>
        </div>
        <div className="stat-float" style={{ top: '58%', right: 20, animation: 'fadeSlideUp .7s ease-out .5s both' }}>
          <div className="sf-lbl">Bulan ini</div><div className="sf-val">32 sesi</div>
        </div>
        <div className="mob-glass-wrap">
          <div className="mob-orb"></div>
          <svg className="mob-rings" width="320" height="320" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="100" /><circle cx="160" cy="160" r="140" />
          </svg>
          <div className="mob-glass-card login-glass-card">
            <div className="gc-hdr"><span className="gc-title">INV-2026/06-014</span><span className="gc-date">Juni 2026</span></div>
            <div className="gc-rows">
              <div className="gc-r"><span><div className="nm">Bintang Wijaya</div><div className="meta">Matematika · 4 sesi</div></span><span className="amt">Rp 720rb</span></div>
              <div className="gc-r"><span><div className="nm">Kirana Putri</div><div className="meta">B. Inggris · 3 sesi</div></span><span className="amt">Rp 360rb</span></div>
            </div>
            <div className="gc-total"><span className="lbl">Total</span><span className="val" style={{ fontSize: 18 }}>Rp 1.08jt</span></div>
          </div>
        </div>
        <div className="mob-fi" style={{ bottom: 60, left: 16, animation: 'fadeScale .5s ease-out .7s both' }}><Icons.chart size={18} /></div>
        <div className="mob-fi lav" style={{ bottom: 110, right: 20, animation: 'fadeScale .5s ease-out .8s both' }}><Icons.file size={18} /></div>
      </div>
      <div className="mob-features">
        <h2>Semua yang kamu butuh.</h2>
        <p className="sub">App mobile mencatat. Web merangkum dan menagih.</p>
        <div className="mob-feature-grid">
          {[
            { ic: <Icons.chart size={20} />, t: 'Rekap Bulanan', d: 'Filter per bulan, per murid. Total sesi, jam, dan pendapatan.' },
            { ic: <Icons.file size={20} />, t: 'Export PDF & CSV', d: 'Sesi bulan ini jadi dokumen rapi — arsip atau lampiran pajak.' },
            { ic: <Icons.invoice size={20} />, t: 'Invoice Builder', d: '3 template siap pakai. Kustom warna, isi rekening, export PDF.' },
            { ic: <Icons.spark size={20} />, t: 'Sinkron dengan App', d: 'Data sesi otomatis dari TutorLog di ponsel.' },
          ].map((f, i) => (
            <div key={i} className="mob-feature-card"><div className="ic">{f.ic}</div><div><h3>{f.t}</h3><p>{f.d}</p></div></div>
          ))}
        </div>
      </div>
      <MobFooter />
    </div>
  );
}

// =========================================================
// LOGIN
// =========================================================
function MobScreenLogin() {
  return (
    <div className="mob-page tw">
      <div className="mob-login-full">
        <MobNav dark />
        <MobParticles items={[
          { x: '12%', y: '15%', s: 5, glow: true, pd: '5s', po: .35 },
          { x: '75%', y: '10%', s: 4, glow: false, pd: '4s', po: .2, pt: '.5s' },
          { x: '90%', y: '35%', s: 6, glow: true, pd: '6s', po: .4, pt: '1s' },
          { x: '25%', y: '65%', s: 4, glow: false, pd: '5s', po: .25, pt: '1.5s' },
          { x: '60%', y: '78%', s: 5, glow: true, pd: '4.5s', po: .3, pt: '.3s' },
          { x: '85%', y: '85%', s: 4, glow: false, pd: '5.5s', po: .2, pt: '2s' },
        ]} />
        <div className="mob-login-card">
          <h1>Masuk ke TutorLog.</h1>
          <p className="lead">Ketik email yang kamu pakai di app. Kami kirim link masuk — gak perlu password.</p>
          <div className="field">
            <div className="lbl" style={{ fontFamily: 'var(--f-body)', fontWeight: 700, fontSize: 12, color: 'var(--tw-text-2)', marginBottom: 6 }}>Email</div>
            <div className="input focused" style={{
              height: 48, fontSize: 14, padding: '0 14px', borderRadius: 'var(--r-md)',
              background: 'var(--tw-surface)', border: '2px solid var(--tw-primary)',
              display: 'flex', alignItems: 'center', fontFamily: 'var(--f-body)', color: 'var(--tw-text)',
              boxShadow: '0 0 0 4px rgba(0,108,83,.08)',
            }}>
              rina@tutorlog.id
              <span style={{ background: 'var(--tw-primary)', width: 2, height: 18, marginLeft: 2, borderRadius: 1, animation: 'particlePulse 1s ease-in-out infinite' }}></span>
            </div>
            <div style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--tw-text-3)', marginTop: 6 }}>
              Belum punya akun? Link akan otomatis mendaftarkan kamu.
            </div>
          </div>
          <Btn variant="primary" size="lg" icon={<Icons.mail size={16} />} style={{ width: '100%', height: 48, fontSize: 14 }}>
            Kirim Magic Link
          </Btn>
          <div className="terms">Dengan masuk kamu setuju dengan <a href="#">Privacy Policy</a> dan <a href="#">Terms</a>.</div>
        </div>
        <div className="mob-login-quote">
          <h3>Data aman. Terstruktur.</h3>
          <p>Setiap sesi jadi titik dalam konstelasi pengajaranmu.</p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// LOGIN SENT
// =========================================================
function MobScreenLoginSent() {
  return (
    <div className="mob-page tw">
      <div className="mob-login-full">
        <MobNav dark />
        <MobParticles items={[
          { x: '20%', y: '18%', s: 5, glow: true, pd: '5s', po: .3 },
          { x: '70%', y: '12%', s: 4, glow: false, pd: '4s', po: .2, pt: '.5s' },
          { x: '50%', y: '50%', s: 6, glow: true, pd: '6s', po: .35, pt: '1s' },
          { x: '85%', y: '75%', s: 4, glow: false, pd: '5s', po: .2, pt: '1.5s' },
        ]} />
        <div className="mob-login-sent-card">
          <div className="icn"><Icons.mail size={28} /></div>
          <h1>Cek email kamu.</h1>
          <p className="lead">Kami sudah kirim link masuk ke:</p>
          <div className="email-badge">rina@tutorlog.id</div>
          <p className="lead" style={{ marginBottom: 20 }}>Klik link di email untuk masuk.<br/>Link berlaku 15 menit.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Btn variant="secondary" size="lg" style={{ width: '100%', height: 48, fontSize: 14 }}>Buka Gmail</Btn>
            <Btn variant="ghost" size="sm" style={{ width: '100%' }}>Kirim ulang link</Btn>
          </div>
          <div style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--tw-text-3)', textAlign: 'center', marginTop: 14 }}>
            Salah alamat? <a href="#" style={{ color: 'var(--tw-primary)', fontWeight: 700, textDecoration: 'none' }}>Ganti email</a>
          </div>
        </div>
        <div className="mob-login-quote">
          <h3>Sambil menunggu…</h3>
          <p>Link masuk biasanya sampai dalam 30 detik.</p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// REKAP — Richer with grouped date headers, mini chart
// =========================================================
function MobScreenRekap() {
  const groups = [
    { date: '28 Jun', items: [
      { m: 'Meilani Sari', s: 'Matematika · Persiapan UH', h: 1.5, t: 'Rp 180.000', initials: 'MS', color: '#E8D5F5' },
    ]},
    { date: '26 Jun', items: [
      { m: 'Bintang Wijaya', s: 'Matematika · Review UH', h: 1.5, t: 'Rp 180.000', initials: 'BW', color: '#D5EDE4' },
    ]},
    { date: '24 Jun', items: [
      { m: 'Bintang Wijaya', s: 'Fisika · Energi & Usaha', h: 2.0, t: 'Rp 260.000', initials: 'BW', color: '#D5EDE4' },
      { m: 'Kirana Putri', s: 'B. Inggris · Grammar', h: 1.0, t: 'Rp 120.000', initials: 'KP', color: '#D5E0F5' },
    ]},
    { date: '17 Jun', items: [
      { m: 'Bintang Wijaya', s: 'Fisika · Hukum Newton', h: 2.0, t: 'Rp 260.000', initials: 'BW', color: '#D5EDE4' },
    ]},
    { date: '15 Jun', items: [
      { m: 'Meilani Sari', s: 'Matematika · Aljabar', h: 1.5, t: 'Rp 180.000', initials: 'MS', color: '#E8D5F5' },
    ]},
    { date: '12 Jun', items: [
      { m: 'Bintang Wijaya', s: 'Matematika · Trigonometri', h: 1.5, t: 'Rp 180.000', initials: 'BW', color: '#D5EDE4' },
      { m: 'Aditya Rahman', s: 'Kimia · Stoikiometri', h: 1.5, t: 'Rp 195.000', initials: 'AR', color: '#F5E8D5' },
    ]},
    { date: '10 Jun', items: [
      { m: 'Bintang Wijaya', s: 'Fisika · Gerak Lurus', h: 2.0, t: 'Rp 260.000', initials: 'BW', color: '#D5EDE4' },
    ]},
  ];

  // Mini bar chart data for 6 months
  const bars = [
    { m: 'Jan', h: 32 }, { m: 'Feb', h: 38 }, { m: 'Mar', h: 28 },
    { m: 'Apr', h: 42 }, { m: 'Mei', h: 40 }, { m: 'Jun', h: 48.5 },
  ];
  const maxH = 50;

  return (
    <div className="mob-page tw">
      <MobAppShell active="rekap">
        <div className="mob-app-hdr">
          <div className="top-row"><h1>Rekap Sesi</h1><div className="av">RN</div></div>
          <div className="sub">Rina Novianti</div>
        </div>

        <div className="mob-month-picker">
          <button><Icons.chevL size={16} /></button>
          <span className="m">Juni 2026</span>
          <button><Icons.chevR size={16} /></button>
        </div>

        {/* Summary card with mini chart */}
        <div className="mob-summary-card">
          <div className="mob-summary-top">
            <div className="mob-summary-stat">
              <div className="mob-summary-val">Rp 5.9jt</div>
              <div className="mob-summary-label">Pendapatan</div>
            </div>
            <div className="mob-summary-stats-sm">
              <div><span className="v">32</span><span className="l">Sesi</span></div>
              <div><span className="v">48,5</span><span className="l">Jam</span></div>
              <div><span className="v">4</span><span className="l">Murid</span></div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="mob-mini-chart">
            {bars.map((b, i) => (
              <div key={i} className="mob-mini-bar-col">
                <div className="mob-mini-bar-track">
                  <div className={'mob-mini-bar' + (i === bars.length - 1 ? ' active' : '')}
                    style={{ height: (b.h / maxH * 100) + '%' }}></div>
                </div>
                <span className="mob-mini-bar-label">{b.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mob-export-bar">
          <button className="mob-export-btn"><Icons.download size={14} /><span>CSV</span></button>
          <button className="mob-export-btn">
            <Icons.file size={14} /><span>PDF</span>
            <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--tw-warning-soft)', color: 'var(--tw-warning)', padding: '1px 6px', borderRadius: 99 }}>1×</span>
          </button>
        </div>

        <div className="mob-filter-row">
          <span className="mob-chip on">Semua</span>
          <span className="mob-chip">Bintang</span>
          <span className="mob-chip">Kirana</span>
          <span className="mob-chip">Aditya</span>
          <span className="mob-chip">Meilani</span>
        </div>

        {/* Grouped session list */}
        <div className="mob-session-groups">
          {groups.map((g, gi) => (
            <div key={gi} className="mob-session-group">
              <div className="mob-group-date">{g.date}</div>
              {g.items.map((r, ri) => (
                <div key={ri} className="mob-session-row">
                  <div className="mob-session-avatar" style={{ background: r.color }}>
                    <span>{r.initials}</span>
                  </div>
                  <div className="mob-session-info">
                    <div className="mob-session-name">{r.m}</div>
                    <div className="mob-session-subj">{r.s}</div>
                  </div>
                  <div className="mob-session-end">
                    <div className="mob-session-amt">{r.t}</div>
                    <div className="mob-session-hrs">{r.h.toFixed(1)} jam</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '14px 0', fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--tw-text-3)' }}>
          Menampilkan 9 dari 32 sesi
        </div>
      </MobAppShell>
    </div>
  );
}

// =========================================================
// INVOICE BUILDER — Desktop dialog (immersive)
// =========================================================
function MobScreenInvoiceBuilder() {
  const MonitorIcon = () => (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8 M12 17v4" />
    </svg>
  );

  return (
    <div className="mob-page tw">
      <MobAppShell active="invoice">
        {/* Scrim overlay */}
        <div className="mob-dialog-scrim">
          {/* Simple white dialog card */}
          <div className="mob-dialog-card">
            <div className="mob-dialog-icon"><MonitorIcon /></div>
            <h2 className="mob-dialog-title">Buka di Desktop</h2>
            <p className="mob-dialog-desc">Invoice Builder dirancang untuk layar lebar. Buka di laptop atau PC untuk pengalaman terbaik.</p>
            <div className="mob-dialog-url">
              <Icons.lock size={14} />
              <span>web.tutorlog.id</span>
            </div>
            <div className="mob-dialog-actions">
              <Btn variant="primary" size="sm" style={{ width: '100%' }}>Salin Link</Btn>
              <Btn variant="ghost" size="sm" icon={<Icons.arrowL size={14} />} style={{ width: '100%' }}>Kembali ke Rekap</Btn>
            </div>
          </div>
        </div>
      </MobAppShell>
    </div>
  );
}

// =========================================================
// LANGGANAN — Cleaner layout with visual hierarchy
// =========================================================
function MobScreenLangganan() {
  return (
    <div className="mob-page tw">
      <MobAppShell active="langganan">
        <div className="mob-app-hdr">
          <div className="top-row"><h1>Langganan</h1><div className="av">RN</div></div>
          <div className="sub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="chip" style={{ height: 22, padding: '0 8px', fontSize: 10 }}>
              <span className="chip-dot" style={{ width: 5, height: 5 }}></span>Free plan aktif
            </span>
          </div>
        </div>

        {/* Current plan mini card */}
        <div className="mob-current-plan">
          <div className="mob-cp-left">
            <div className="mob-cp-icon"><Icons.spark size={16} /></div>
            <div>
              <div className="mob-cp-name">Free Plan</div>
              <div className="mob-cp-desc">Export terbatas · 1×/bulan</div>
            </div>
          </div>
          <div className="mob-cp-badge">Aktif</div>
        </div>

        <div className="mob-plan-card">
          <div className="plan-orb"></div>
          <span className="tag">Upgrade</span>
          <div className="plan-title">TutorLog Plus</div>
          <div className="price-row">
            <span className="price">Rp 39rb</span><span className="per">/ bulan</span>
          </div>
          <ul className="p-feats">
            <li><span className="ck"><Icons.check size={10} /></span>Export invoice PDF tanpa batas</li>
            <li><span className="ck"><Icons.check size={10} /></span>Export rekap PDF & CSV tanpa batas</li>
            <li><span className="ck"><Icons.check size={10} /></span>3 template invoice + kustom warna</li>
            <li><span className="ck"><Icons.check size={10} /></span>Prioritas dukungan via WhatsApp</li>
          </ul>
          <Btn variant="primary" size="lg" iconRight={<Icons.ext size={14} />}
            style={{ width: '100%', height: 46, fontSize: 14, background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)' }}>
            Bayar via Lynk.id
          </Btn>
        </div>

        {/* Divider with "atau" */}
        <div className="mob-or-divider">
          <div className="mob-or-line"></div>
          <span className="mob-or-text">atau transfer manual</span>
          <div className="mob-or-line"></div>
        </div>

        <div className="mob-pay-info" style={{ marginTop: 0 }}>
          <div className="mob-bank-block">
            <div className="lg">BCA</div>
            <div>
              <div className="bn">Bank Central Asia</div>
              <div className="no">7712 3456 789</div>
              <div className="an">a/n Kalilinux Studio</div>
            </div>
          </div>
          <Btn variant="secondary" size="sm" icon={<Icons.checkCircle size={14} />} style={{ width: '100%' }}>
            Konfirmasi pembayaran
          </Btn>
        </div>

        {/* How it works — compact accordion style */}
        <div className="mob-how-it-works">
          <h3>Cara aktivasi</h3>
          <div className="mob-hiw-steps">
            {[
              { ic: <Icons.ext size={14} />, t: 'Bayar via Lynk.id atau transfer' },
              { ic: <Icons.time size={14} />, t: 'Tunggu 5 menit untuk aktivasi' },
              { ic: <Icons.checkCircle size={14} />, t: 'Belum aktif? Tap "Konfirmasi"' },
            ].map((s, i) => (
              <div key={i} className="mob-hiw-step">
                <div className="mob-hiw-num">{i + 1}</div>
                <span>{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </MobAppShell>
    </div>
  );
}

// =========================================================
// FITUR — Visual showcase with alternating card styles
// =========================================================
function MobScreenFitur() {
  return (
    <div className="mob-page tw">
      <MobSoftHero
        icon={<Icons.spark size={22} />}
        title="Fitur"
        subtitle="Semua yang kamu butuh setelah sesi berakhir."
      />

      <div className="mob-fitur-body">
        {/* Feature 1: Rekap — showcase card */}
        <div className="mob-fitur-showcase">
          <div className="mob-fitur-showcase__head">
            <div className="mob-fitur-showcase__icon"><Icons.chart size={24} /></div>
            <h2>Rekap Bulanan</h2>
            <p>Total sesi, jam, dan pendapatan per bulan. Filter per murid dengan satu tap.</p>
          </div>
          {/* Mini UI mockup */}
          <div className="mob-fitur-mockup">
            <div className="mfm-stats">
              <div className="mfm-stat"><span className="mfm-v">32</span><span className="mfm-l">Sesi</span></div>
              <div className="mfm-stat"><span className="mfm-v">48,5</span><span className="mfm-l">Jam</span></div>
              <div className="mfm-stat"><span className="mfm-v">5.9jt</span><span className="mfm-l">Pendapatan</span></div>
            </div>
            <div className="mfm-row"><span className="mfm-dot" style={{ background: '#D5EDE4' }}></span><span className="mfm-name">Bintang W.</span><span className="mfm-amt">Rp 2.6jt</span></div>
            <div className="mfm-row"><span className="mfm-dot" style={{ background: '#E8D5F5' }}></span><span className="mfm-name">Meilani S.</span><span className="mfm-amt">Rp 1.4jt</span></div>
            <div className="mfm-row"><span className="mfm-dot" style={{ background: '#D5E0F5' }}></span><span className="mfm-name">Kirana P.</span><span className="mfm-amt">Rp 1.1jt</span></div>
          </div>
        </div>

        {/* Feature 2: Export — horizontal card */}
        <div className="mob-fitur-hcard">
          <div className="mob-fitur-hcard__icon" style={{ background: 'oklch(.92 .03 280)' }}><Icons.file size={22} /></div>
          <div className="mob-fitur-hcard__text">
            <h3>Export PDF & CSV</h3>
            <p>Sesi bulan ini jadi dokumen rapi. Arsip pribadi atau lampiran pajak.</p>
            <div className="mob-fitur-tags">
              <span>PDF</span><span>CSV</span><span>Free: 1×/bln</span>
            </div>
          </div>
        </div>

        {/* Feature 3: Invoice — showcase card */}
        <div className="mob-fitur-showcase" style={{ background: 'var(--tw-surface)' }}>
          <div className="mob-fitur-showcase__head">
            <div className="mob-fitur-showcase__icon" style={{ background: 'oklch(.92 .04 160)' }}><Icons.invoice size={24} /></div>
            <h2>Invoice Builder</h2>
            <p>3 template profesional. Kustomisasi warna brand, isi rekening sekali, pakai terus.</p>
          </div>
          <div className="mob-fitur-templates">
            <div className="mft-card">
              <div className="mft-top" style={{ background: '#006C53' }}></div>
              <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
              <span>Klasik</span>
            </div>
            <div className="mft-card active">
              <div className="mft-top" style={{ background: '#1a1a1a' }}></div>
              <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
              <span>Modern</span>
            </div>
            <div className="mft-card">
              <div className="mft-top" style={{ background: '#E8E0D4' }}></div>
              <div className="mft-body"><div className="mft-line"></div><div className="mft-line short"></div></div>
              <span>Minimal</span>
            </div>
          </div>
        </div>

        {/* Feature 4: Sync — horizontal card */}
        <div className="mob-fitur-hcard">
          <div className="mob-fitur-hcard__icon" style={{ background: 'oklch(.92 .04 90)' }}><Icons.spark size={22} /></div>
          <div className="mob-fitur-hcard__text">
            <h3>Sinkronisasi</h3>
            <p>Data sesi otomatis dari app mobile. Login sekali via Magic Link — selesai.</p>
            <div className="mob-fitur-tags">
              <span>Magic Link</span><span>Real-time</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mob-fitur-cta">
          <h3>Siap mencoba?</h3>
          <p>Mulai gratis, upgrade kapan saja.</p>
          <Btn variant="primary" size="lg" icon={<Icons.mail size={16} />} style={{ width: '100%', height: 48, fontSize: 14 }}>
            Masuk dengan Magic Link
          </Btn>
        </div>
      </div>
      <MobFooter />
    </div>
  );
}

// =========================================================
// HARGA — Immersive pricing comparison
// =========================================================
function MobScreenHarga() {
  return (
    <div className="mob-page tw">
      <MobSoftHero
        icon={<Icons.wallet size={22} />}
        title="Harga"
        subtitle="Mulai gratis, upgrade kalau butuh."
      />
      <div className="mob-harga-body">
        {/* Free tier */}
        <div className="mob-price-card mob-price-card--free">
          <div className="mob-price-header">
            <span className="mob-price-tier">Free</span>
            <div className="mob-price-amount">
              <span className="mob-price-currency">Rp</span>
              <span className="mob-price-value">0</span>
            </div>
            <span className="mob-price-period">selamanya</span>
          </div>
          <div className="mob-price-divider"></div>
          <ul className="mob-price-features">
            {['Rekap bulanan lengkap', 'Filter per murid', 'Export PDF rekap (1×/bulan)', 'Export CSV (1×/bulan)', 'Invoice builder (preview only)'].map((f, i) => (
              <li key={i}><span className="mob-price-check"><Icons.check size={10} /></span>{f}</li>
            ))}
          </ul>
          <Btn variant="secondary" size="sm" style={{ width: '100%' }}>Mulai Gratis</Btn>
        </div>

        {/* Plus tier */}
        <div className="mob-price-card mob-price-card--plus">
          <div className="mob-price-badge">Rekomendasi</div>
          <div className="plan-orb"></div>
          <div className="mob-price-header">
            <span className="mob-price-tier">TutorLog Plus</span>
            <div className="mob-price-amount">
              <span className="mob-price-currency">Rp</span>
              <span className="mob-price-value">39rb</span>
            </div>
            <span className="mob-price-period">per bulan</span>
          </div>
          <div className="mob-price-divider"></div>
          <ul className="mob-price-features">
            {['Semua fitur Free', 'Export invoice PDF tanpa batas', 'Export rekap tanpa batas', '3 template + kustom warna', 'Prioritas dukungan WA'].map((f, i) => (
              <li key={i}><span className="mob-price-check"><Icons.check size={10} /></span>{f}</li>
            ))}
          </ul>
          <Btn variant="primary" size="lg" iconRight={<Icons.ext size={14} />}
            style={{ width: '100%', height: 46, fontSize: 14, background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)' }}>
            Bayar via Lynk.id
          </Btn>
        </div>

        {/* FAQ */}
        <div className="mob-faq-section">
          <h3>Pertanyaan Umum</h3>
          {[
            { q: 'Data hilang kalau tidak upgrade?', a: 'Tidak. Data tetap ada. Hanya export dan invoice terbatas.' },
            { q: 'Otomatis diperpanjang?', a: 'Tidak. Bayar ulang setiap bulan.' },
            { q: 'Bisa refund?', a: 'Pembayaran non-refundable.' },
          ].map((f, i) => (
            <div key={i} className="mob-faq-item">
              <div className="mob-faq-q"><Icons.chevR size={14} /><span>{f.q}</span></div>
              <div className="mob-faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
      <MobFooter />
    </div>
  );
}

// =========================================================
// PANDUAN — Visual timeline with connected steps
// =========================================================
function MobScreenPanduan() {
  const steps = [
    { n: '1', t: 'Download di Play Store', d: 'Cari "TutorLog", install, buat akun.', ic: <Icons.download size={16} />, phase: 'App' },
    { n: '2', t: 'Tambah murid', d: 'Isi nama, tingkat pendidikan, tarif per jam.', ic: <Icons.users size={16} />, phase: 'App' },
    { n: '3', t: 'Mulai sesi les', d: 'Pilih murid, tap "Mulai Sesi". Timer jalan otomatis.', ic: <Icons.time size={16} />, phase: 'App' },
    { n: '4', t: 'Login ke Web', d: 'Buka website, "Masuk dengan Magic Link", email yang sama.', ic: <Icons.mail size={16} />, phase: 'Web' },
    { n: '5', t: 'Lihat rekap', d: 'Semua sesi muncul otomatis. Filter dan export.', ic: <Icons.chart size={16} />, phase: 'Web' },
    { n: '6', t: 'Buat invoice', d: 'Pilih murid & template, kustom warna, export PDF.', ic: <Icons.invoice size={16} />, phase: 'Web' },
  ];
  return (
    <div className="mob-page tw">
      <MobSoftHero
        icon={<Icons.file size={22} />}
        title="Panduan"
        subtitle="Dari nol sampai invoice pertama."
      />
      <div className="mob-panduan-body">
        <div className="mob-panduan-intro">
          <div className="mob-panduan-intro__icon"><Icons.spark size={16} /></div>
          <div>
            <strong>TutorLog</strong> = app mobile (pencatatan) + web (rekap & invoice). Terhubung via email.
          </div>
        </div>

        {/* Phase labels + connected timeline */}
        <div className="mob-timeline">
          {steps.map((s, i) => {
            const showPhase = i === 0 || steps[i - 1].phase !== s.phase;
            return (
              <React.Fragment key={i}>
                {showPhase && (
                  <div className="mob-timeline-phase">
                    <div className="mob-tp-dot"></div>
                    <span className="mob-tp-label">{s.phase === 'App' ? '📱 App Mobile' : '💻 Companion Web'}</span>
                  </div>
                )}
                <div className="mob-timeline-step">
                  <div className="mob-ts-rail">
                    <div className="mob-ts-num">{s.n}</div>
                    {i < steps.length - 1 && <div className="mob-ts-line"></div>}
                  </div>
                  <div className="mob-ts-card">
                    <div className="mob-ts-icon">{s.ic}</div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="mob-fitur-cta">
          <h3>Butuh bantuan?</h3>
          <p>Kirim email, kami bantu secepatnya.</p>
          <Btn variant="primary" size="sm" icon={<Icons.mail size={14} />} style={{ width: '100%' }}>Hubungi Kami</Btn>
        </div>
      </div>
      <MobFooter />
    </div>
  );
}

// =========================================================
// LEGAL PAGES — Shared hero, cleaner body
// =========================================================

function MobScreenPrivacy() {
  return (
    <div className="mob-page tw">
      <MobSoftHero icon={<Icons.lock size={22} />} title="Kebijakan Privasi" subtitle="Terakhir diperbarui: 3 Juni 2026" />
      <div className="mob-legal-body">
        <div className="mob-legal-callout">
          <div className="mob-legal-callout__icon"><Icons.spark size={16} /></div>
          <div><strong>Ringkasan:</strong> TutorLog membantu tutor privat mencatat sesi les, menyimpan riwayat murid, membuat rekap tagihan, dan export ke PDF/CSV.</div>
        </div>
        <h2>Data yang Dipakai</h2>
        <ul>
          <li><b>Data akun:</b> email dan ID autentikasi.</li>
          <li><b>Profil tutor:</b> nama untuk laporan dan export.</li>
          <li><b>Data murid:</b> nama, tingkat pendidikan, tarif.</li>
          <li><b>Data lokasi:</b> lokasi murid dan sesi (foreground only).</li>
          <li><b>Aktivitas sesi:</b> waktu, durasi, estimasi tagihan.</li>
          <li><b>Data premium:</b> voucher, status akses.</li>
        </ul>
        <h2>Penggunaan Lokasi</h2>
        <p>TutorLog hanya memakai foreground location untuk fungsi sesi les. Tidak ada background tracking.</p>
        <h2>Penyimpanan & Keamanan</h2>
        <p>Data disimpan di Supabase via HTTPS. User hanya bisa akses data miliknya sendiri.</p>
        <h2>Penghapusan Data</h2>
        <p>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a> untuk request penghapusan akun dan data.</p>
      </div>
      <MobFooter />
    </div>
  );
}

function MobScreenTerms() {
  return (
    <div className="mob-page tw">
      <MobSoftHero icon={<Icons.file size={22} />} title="Syarat & Ketentuan" subtitle="Terakhir diperbarui: 3 Juni 2026" />
      <div className="mob-legal-body">
        <h2>Penerimaan Syarat</h2>
        <p>Dengan menggunakan TutorLog, kamu setuju dengan syarat ini.</p>
        <h2>Deskripsi Layanan</h2>
        <p>TutorLog adalah app pencatat sesi les untuk tutor privat — mobile app untuk mencatat, companion web untuk rekap dan invoice.</p>
        <h2>Akun Pengguna</h2>
        <ul>
          <li>Kamu bertanggung jawab menjaga akses akun.</li>
          <li>Satu akun untuk satu tutor.</li>
          <li>TutorLog berhak menonaktifkan akun yang melanggar.</li>
        </ul>
        <h2>Langganan</h2>
        <ul>
          <li>Beberapa fitur memerlukan TutorLog Plus.</li>
          <li>Pembayaran via Lynk.id atau transfer manual.</li>
          <li>Tidak diperpanjang otomatis.</li>
          <li>Non-refundable.</li>
        </ul>
        <h2>Kontak</h2>
        <p>Hubungi <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</p>
      </div>
      <MobFooter />
    </div>
  );
}

function MobScreenAccountDeletion() {
  return (
    <div className="mob-page tw">
      <MobSoftHero icon={<Icons.users size={22} />} title="Minta Hapus Akun" subtitle="Terakhir diperbarui: 3 Juni 2026" />
      <div className="mob-legal-body">
        <div className="mob-legal-callout" style={{ borderLeftColor: 'var(--tw-warning)' }}>
          <div className="mob-legal-callout__icon" style={{ background: 'var(--tw-warning-soft)', color: 'var(--tw-warning)' }}><Icons.bolt size={16} /></div>
          <div>Penghapusan akun bersifat <strong>permanen</strong>. Semua data akan dihapus dan tidak bisa dikembalikan.</div>
        </div>
        <h2>Cara Mengajukan</h2>
        <p>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a> dengan subjek "Hapus akun TutorLog" dan sertakan email login kamu.</p>
        <h2>Data yang Dihapus</h2>
        <ul>
          <li>Akun autentikasi</li>
          <li>Profil tutor</li>
          <li>Data murid dan lokasi</li>
          <li>Riwayat sesi</li>
          <li>Data akses premium dan voucher</li>
        </ul>
        <h2>Estimasi Proses</h2>
        <p>Maksimal 7 hari setelah verifikasi selesai.</p>
      </div>
      <MobFooter />
    </div>
  );
}

function MobScreenKontak() {
  return (
    <div className="mob-page tw">
      <MobSoftHero icon={<Icons.mail size={22} />} title="Kontak" subtitle="Ada pertanyaan? Kami senang mendengar." />
      <div className="mob-legal-body" style={{ paddingTop: 24 }}>
        {/* Contact cards */}
        <div className="mob-contact-cards">
          <div className="mob-contact-card">
            <div className="mob-cc-icon"><Icons.mail size={20} /></div>
            <div className="mob-cc-body">
              <h3>Email</h3>
              <p>Untuk pertanyaan, saran, atau bug report.</p>
              <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>
            </div>
          </div>
          <div className="mob-contact-card">
            <div className="mob-cc-icon"><Icons.time size={20} /></div>
            <div className="mob-cc-body">
              <h3>Waktu Respons</h3>
              <p>1–2 hari kerja. Penghapusan akun maks 7 hari.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mob-faq-section">
          <h3>FAQ</h3>
          {[
            { q: 'Cara masuk ke TutorLog Web?', a: 'Klik "Masuk dengan Magic Link", masukkan email akun app mobile.' },
            { q: 'Data sesi otomatis muncul?', a: 'Ya, semua sesi dari app mobile tersinkron otomatis setelah login.' },
            { q: 'Cara berlangganan Plus?', a: 'Buka Langganan, pilih "Bayar via Lynk.id" atau transfer manual.' },
          ].map((f, i) => (
            <div key={i} className="mob-faq-item">
              <div className="mob-faq-q"><Icons.chevR size={14} /><span>{f.q}</span></div>
              <div className="mob-faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
      <MobFooter />
    </div>
  );
}

Object.assign(window, {
  MobNav, MobFooter, MobTabBar, MobAppShell, MobParticles, MobSoftHero,
  MobScreenLanding, MobScreenLogin, MobScreenLoginSent,
  MobScreenRekap, MobScreenInvoiceBuilder, MobScreenLangganan,
  MobScreenPrivacy, MobScreenTerms, MobScreenAccountDeletion,
  MobScreenKontak, MobScreenFitur, MobScreenHarga, MobScreenPanduan,
});
