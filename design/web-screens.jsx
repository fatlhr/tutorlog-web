// web-screens.jsx — Screens for TutorLog Web mockups
// Depends: web-shared.jsx, web-invoices.jsx

// =========================================================
// LANDING v2 — Dark hero selaras dengan login constellation
// =========================================================
function ScreenLanding() {
  const heroParticles = [
    { x: '5%', y: '12%', s: 5, glow: false, pd: '4s', po: .3, pt: '0s' },
    { x: '18%', y: '6%', s: 7, glow: true, pd: '5s', po: .5, pt: '.6s' },
    { x: '35%', y: '15%', s: 4, glow: false, pd: '4.5s', po: .25, pt: '1s' },
    { x: '52%', y: '8%', s: 6, glow: true, pd: '6s', po: .45, pt: '.3s' },
    { x: '68%', y: '20%', s: 8, glow: true, pd: '5s', po: .4, pt: '1.5s' },
    { x: '82%', y: '10%', s: 5, glow: false, pd: '4s', po: .3, pt: '2s' },
    { x: '90%', y: '25%', s: 6, glow: true, pd: '5.5s', po: .45, pt: '.8s' },
    { x: '8%', y: '55%', s: 4, glow: false, pd: '5s', po: .2, pt: '1.2s' },
    { x: '25%', y: '75%', s: 6, glow: true, pd: '6s', po: .4, pt: '0s' },
    { x: '48%', y: '85%', s: 5, glow: false, pd: '4s', po: .35, pt: '1.8s' },
    { x: '72%', y: '70%', s: 7, glow: true, pd: '6s', po: .45, pt: '.5s' },
    { x: '88%', y: '80%', s: 4, glow: false, pd: '5s', po: .25, pt: '2.2s' },
    { x: '95%', y: '60%', s: 5, glow: true, pd: '4.5s', po: .4, pt: '1s' },
    { x: '15%', y: '40%', s: 3, glow: false, pd: '4s', po: .2, pt: '1.6s' },
    { x: '60%', y: '50%', s: 4, glow: false, pd: '5.5s', po: .25, pt: '2s' },
    { x: '78%', y: '45%', s: 5, glow: true, pd: '5s', po: .35, pt: '.4s' },
  ];

  return (
    <div className="web-page tw" style={{ background: '#0d1f18' }}>
      {/* ---- HERO ---- */}
      <section className="hero-v2">
        {/* Dark nav */}
        <nav className="nav-top-dark">
          <div className="brand">
            <span className="mk" style={{ width: 40, height: 40, borderRadius: 'var(--r-md)' }}>
              <img src="tutorlog-logo.png" alt="" />
            </span>
            <span className="wm">TutorLog</span>
          </div>
          <div className="links">
            <a href="#">Fitur</a>
            <a href="#">Harga</a>
            <a href="#">Panduan</a>
          </div>
          <button className="btn btn-primary btn-sm" style={{ background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)' }}>Masuk</button>
        </nav>

        {/* Particles */}
        <div className="hero-particles">
          {heroParticles.map((p, i) => (
            <div key={i}
              className={'login-particle pulse' + (p.glow ? ' glow' : '')}
              style={{ left: p.x, top: p.y, width: p.s, height: p.s,
                '--pd': p.pd, '--po': p.po, '--pt': p.pt }}
            />
          ))}
          {/* Connection lines */}
          <svg className="hero-connections" preserveAspectRatio="none">
            <line x1="5%" y1="12%" x2="18%" y2="6%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
            <line x1="18%" y1="6%" x2="35%" y2="15%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="35%" y1="15%" x2="52%" y2="8%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
            <line x1="52%" y1="8%" x2="68%" y2="20%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="68%" y1="20%" x2="82%" y2="10%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
            <line x1="82%" y1="10%" x2="90%" y2="25%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="8%" y1="55%" x2="25%" y2="75%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="25%" y1="75%" x2="48%" y2="85%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
            <line x1="72%" y1="70%" x2="88%" y2="80%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="60%" y1="50%" x2="78%" y2="45%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
            <line x1="78%" y1="45%" x2="95%" y2="60%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
            <line x1="15%" y1="40%" x2="8%" y2="55%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
          </svg>
        </div>

        {/* Text content */}
        <div className="hero-text">
          <span className="kicker-dark anim-up">
            <span className="dot"></span>
            Companion Web · Untuk Tutor
          </span>
          <h1 className="anim-up-d1">Rekap sesi les.<br/>Invoice <span className="em">rapi</span> tiap bulan.</h1>
          <p className="hero-desc anim-up-d2">
            TutorLog di ponsel mencatat — companion web ini merangkum, menagih, dan mengarsipkan. Satu flow, dari sesi ke tagihan.
          </p>
          <div className="cta-row anim-up-d3">
            <button className="btn-hero primary">
              <Icons.mail size={18} />
              <span>Masuk dengan Magic Link</span>
            </button>
            <button className="btn-hero ghost">
              <span>Lihat demo</span>
              <Icons.arrowR size={18} />
            </button>
          </div>
          <div className="trust-row anim-up-d4">
            <span><Icons.checkCircle size={14} /> Gratis untuk mulai</span>
            <span><Icons.checkCircle size={14} /> Tanpa kartu kredit</span>
            <span><Icons.checkCircle size={14} /> Sinkron dengan app</span>
          </div>
        </div>

        {/* Visual — glass invoice card */}
        <div className="hero-visual-wrap">
          {/* Orb glow behind */}
          <div className="hero-orb"></div>

          {/* Concentric rings */}
          <svg className="hero-rings" width="440" height="440" viewBox="0 0 440 440">
            <circle cx="220" cy="220" r="80" />
            <circle cx="220" cy="220" r="135" />
            <circle cx="220" cy="220" r="195" />
          </svg>

          {/* Glass card */}
          <div className="hero-glass-card login-glass-card anim-scale">
            <div className="gc-hdr">
              <span className="gc-title">INV-2026/06-014</span>
              <span className="gc-date">Juni 2026</span>
            </div>
            <div className="gc-rows">
              <div className="gc-r">
                <span>
                  <div className="nm">Bintang Wijaya</div>
                  <div className="meta">Matematika · 4 sesi</div>
                </span>
                <span className="amt">Rp 720rb</span>
              </div>
              <div className="gc-r">
                <span>
                  <div className="nm">Bintang Wijaya</div>
                  <div className="meta">Fisika · 4 sesi</div>
                </span>
                <span className="amt">Rp 1.04jt</span>
              </div>
              <div className="gc-r">
                <span>
                  <div className="nm">Kirana Putri</div>
                  <div className="meta">B. Inggris · 3 sesi</div>
                </span>
                <span className="amt">Rp 360rb</span>
              </div>
              <div className="gc-r">
                <span>
                  <div className="nm">Meilani Sari</div>
                  <div className="meta">Matematika · 5 sesi</div>
                </span>
                <span className="amt">Rp 600rb</span>
              </div>
            </div>
            <div className="gc-total">
              <span className="lbl">Total</span>
              <span className="val">Rp 2.72jt</span>
            </div>
          </div>

          {/* Floating stat nodes */}
          <div className="hero-stat-node anim-fade-d1" style={{ position: 'absolute', top: '14%', right: '-10%', animation: 'floatA 6s ease-in-out infinite .5s' }}>
            <div className="sn-label">Bulan ini</div>
            <div className="sn-val">32 sesi</div>
          </div>
          <div className="hero-stat-node anim-fade-d2" style={{ position: 'absolute', bottom: '12%', left: '-6%', animation: 'floatB 7s ease-in-out infinite 1s' }}>
            <div className="sn-label">4 murid</div>
            <div className="sn-val">Rp 5.9jt</div>
          </div>

          {/* Floating icons */}
          <div className="login-fi-dark df1" style={{ position: 'absolute', top: '6%', left: '-12%' }}>
            <Icons.time size={20} />
          </div>
          <div className="login-fi-dark lav df3" style={{ position: 'absolute', bottom: '6%', right: '-16%' }}>
            <Icons.invoice size={20} />
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className="features-v2">
        <div className="features-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 34, letterSpacing: '-.5px', margin: 0, maxWidth: 640 }}>
            Semua yang kamu butuh setelah sesi berakhir.
          </h2>
          <div style={{ fontFamily: 'var(--f-body)', fontSize: 15, color: 'var(--tw-text-3)', maxWidth: 320 }}>
            App mobile mencatat. Web ini merangkum, menagih, dan mengarsipkan — jadi kamu tinggal ngajar.
          </div>
        </div>
        <div className="feature-grid">
          {[
            { ic: <Icons.chart size={22} />, t: 'Rekap Bulanan', d: 'Filter per bulan, per murid. Total sesi, jam, dan pendapatan langsung terlihat.' },
            { ic: <Icons.file size={22} />, t: 'Export PDF & CSV', d: 'Sesi bulan ini jadi dokumen rapi — arsip pribadi atau lampiran pajak.' },
            { ic: <Icons.invoice size={22} />, t: 'Invoice Builder', d: '3 template siap pakai. Pilih warna, isi rekening, ekspor PDF, kirim ke orangtua.' },
            { ic: <Icons.spark size={22} />, t: 'Sinkron dengan App', d: 'Data sesi otomatis dari TutorLog di ponsel. Login sekali via Magic Link.' },
          ].map((f, i) => (
            <div key={i} className={'feature-card anim-card-' + i}>
              <div className="ic" style={{ color: 'var(--tw-primary)' }}>{f.ic}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <div className="landing-footer">
        <div className="l">
          <span className="mk" style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--tw-surface-soft)', border: '1px solid var(--tw-border)' }}>
            <img src="tutorlog-logo.png" alt="" />
          </span>
          <span className="brand-sm">TutorLog</span>
          <span>© 2026 · Buat tutor Indonesia dengan ♥</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div className="r">
            <a href="#">Fitur</a>
            <a href="#">Harga</a>
            <a href="#">Panduan</a>
            <a href="#">Blog</a>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--tw-border)' }}></div>
          <div className="r">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Account Deletion</a>
            <a href="#">Kontak</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared right panel — D · Data Particles (dark constellation)
function LoginRightPanel({ quoteTitle, quoteSub }) {
  // Particle positions
  const particles = [
    { x: '15%', y: '8%', s: 5, glow: false, pd: '4s', po: .3, pt: '0s' },
    { x: '62%', y: '12%', s: 8, glow: true, pd: '5s', po: .5, pt: '.6s' },
    { x: '85%', y: '18%', s: 4, glow: false, pd: '4.5s', po: .25, pt: '1s' },
    { x: '8%', y: '28%', s: 6, glow: true, pd: '6s', po: .45, pt: '.3s' },
    { x: '42%', y: '14%', s: 7, glow: true, pd: '5s', po: .4, pt: '1.5s' },
    { x: '78%', y: '35%', s: 5, glow: false, pd: '4s', po: .3, pt: '2s' },
    { x: '22%', y: '52%', s: 9, glow: true, pd: '6s', po: .5, pt: '.8s' },
    { x: '88%', y: '55%', s: 4, glow: false, pd: '5s', po: .2, pt: '1.2s' },
    { x: '55%', y: '65%', s: 6, glow: true, pd: '5.5s', po: .4, pt: '0s' },
    { x: '12%', y: '72%', s: 5, glow: false, pd: '4s', po: .35, pt: '1.8s' },
    { x: '72%', y: '78%', s: 7, glow: true, pd: '6s', po: .45, pt: '.5s' },
    { x: '38%', y: '82%', s: 4, glow: false, pd: '5s', po: .25, pt: '2.2s' },
    { x: '90%', y: '85%', s: 6, glow: true, pd: '4.5s', po: .4, pt: '1s' },
    { x: '48%', y: '90%', s: 5, glow: false, pd: '5s', po: .3, pt: '.4s' },
    { x: '30%', y: '38%', s: 3, glow: false, pd: '4s', po: .2, pt: '1.6s' },
    { x: '68%', y: '48%', s: 4, glow: false, pd: '5.5s', po: .25, pt: '2s' },
  ];

  return (
    <div className="login-right-v2">
      {/* Logo */}
      <div className="login-right-logo">
        <span className="mk"><img src="tutorlog-logo.png" alt="" /></span>
        <span className="wm">TutorLog</span>
      </div>

      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i}
          className={'login-particle pulse' + (p.glow ? ' glow' : '')}
          style={{
            left: p.x, top: p.y,
            width: p.s, height: p.s,
            '--pd': p.pd, '--po': p.po, '--pt': p.pt,
          }}
        />
      ))}

      {/* Connection lines */}
      <svg className="login-connections" preserveAspectRatio="none">
        <line x1="15%" y1="8%" x2="42%" y2="14%" stroke="rgba(140,246,210,.08)" strokeWidth="1" />
        <line x1="42%" y1="14%" x2="62%" y2="12%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
        <line x1="62%" y1="12%" x2="85%" y2="18%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="8%" y1="28%" x2="30%" y2="38%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
        <line x1="22%" y1="52%" x2="55%" y2="65%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="55%" y1="65%" x2="72%" y2="78%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
        <line x1="78%" y1="35%" x2="68%" y2="48%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="12%" y1="72%" x2="38%" y2="82%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
        <line x1="68%" y1="48%" x2="88%" y2="55%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
        <line x1="38%" y1="82%" x2="48%" y2="90%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="72%" y1="78%" x2="90%" y2="85%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
      </svg>

      {/* Ambient orb glow behind card */}
      <div className="login-orb-wrap">
        <div className="login-orb"></div>
      </div>

      {/* Concentric rings */}
      <svg className="login-rings" width="500" height="500" viewBox="0 0 500 500">
        <circle cx="250" cy="250" r="85" />
        <circle cx="250" cy="250" r="145" />
        <circle cx="250" cy="250" r="210" />
      </svg>

      {/* Frosted glass invoice card — dark */}
      <div className="login-glass-card">
        <div className="gc-hdr">
          <span className="gc-title">INV-2026/06-014</span>
          <span className="gc-date">Juni 2026</span>
        </div>
        <div className="gc-rows">
          <div className="gc-r">
            <span>
              <div className="nm">Bintang Wijaya</div>
              <div className="meta">Matematika · 4 sesi</div>
            </span>
            <span className="amt">Rp 720rb</span>
          </div>
          <div className="gc-r">
            <span>
              <div className="nm">Bintang Wijaya</div>
              <div className="meta">Fisika · 4 sesi</div>
            </span>
            <span className="amt">Rp 1.04jt</span>
          </div>
          <div className="gc-r">
            <span>
              <div className="nm">Kirana Putri</div>
              <div className="meta">B. Inggris · 3 sesi</div>
            </span>
            <span className="amt">Rp 360rb</span>
          </div>
        </div>
        <div className="gc-total">
          <span className="lbl">Total</span>
          <span className="val">Rp 2.12jt</span>
        </div>
      </div>

      {/* Floating feature icons */}
      <div className="login-fi-dark df1" style={{ top: '12%', left: '10%' }}>
        <Icons.time size={22} />
      </div>
      <div className="login-fi-dark lav df2" style={{ top: '58%', right: '8%' }}>
        <Icons.invoice size={22} />
      </div>
      <div className="login-fi-dark warm df3" style={{ bottom: '16%', left: '16%' }}>
        <Icons.users size={22} />
      </div>
      <div className="login-fi-dark df4" style={{ top: '26%', right: '10%' }}>
        <Icons.check size={22} />
      </div>
      <div className="login-fi-dark df5" style={{ bottom: '28%', right: '18%' }}>
        <Icons.chart size={22} />
      </div>

      {/* Stat nodes */}
      <div className="login-stat-node fA" style={{ top: '6%', right: '6%' }}>
        <div className="sn-label">Bulan ini</div>
        <div className="sn-val">32 sesi</div>
        <div className="sn-sub">+6 dari Mei</div>
      </div>

      <div className="login-stat-node fB" style={{ bottom: '10%', left: '6%' }}>
        <div className="sn-label">Pendapatan</div>
        <div className="sn-val">Rp 5.9jt</div>
        <div className="sn-sub">4 murid aktif</div>
      </div>

      {/* Quote */}
      <div className="login-right-quote">
        <h3>{quoteTitle || 'Data aman. Terstruktur.'}</h3>
        <p>{quoteSub || 'Setiap sesi jadi titik dalam konstelasi pengajaranmu.'}</p>
      </div>
    </div>
  );
}

// =========================================================
// LOGIN — form state (v2: atmospheric orb + floating icons)
// =========================================================
function ScreenLogin() {
  return (
    <div className="web-page tw">
      <div className="login-wrap-v2">
        <div className="login-left-v2">
          <div style={{ padding: '4px 8px' }}><Brand /></div>
          <div className="login-form">
            <h1>Masuk ke TutorLog.</h1>
            <p className="lead">Ketik email yang kamu pakai di app. Kami kirim link masuk sekali pakai — gak perlu password.</p>
            <div className="field">
              <div className="lbl">Email</div>
              <div className="input focused" style={{ borderColor: 'var(--tw-primary)' }}>
                rina@tutorlog.id<span style={{ background: 'var(--tw-primary)', width: 2, height: 18, marginLeft: 4, animation: 'none' }}></span>
              </div>
              <div className="help">Belum punya akun? Link masuk akan otomatis mendaftarkan kamu.</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Btn variant="primary" size="lg" icon={<Icons.mail size={18} />} style={{ width: '100%' }}>
                Kirim Magic Link
              </Btn>
            </div>
            <div className="terms">
              Dengan masuk kamu setuju dengan <a href="#">Privacy Policy</a> dan <a href="#">Terms</a>.
            </div>
          </div>
        </div>
        <LoginRightPanel />
      </div>
    </div>
  );
}

// =========================================================
// LOGIN — sent state (v2: same atmospheric right panel)
// =========================================================
function ScreenLoginSent() {
  return (
    <div className="web-page tw">
      <div className="login-wrap-v2">
        <div className="login-left-v2">
          <div style={{ padding: '4px 8px' }}><Brand /></div>
          <div className="login-form login-sent">
            <div className="icn" style={{ color: 'var(--tw-primary)' }}>
              <Icons.mail size={32} />
            </div>
            <h1>Cek email kamu.</h1>
            <p className="lead">Kami sudah kirim link masuk ke:</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="email-badge">rina@tutorlog.id</div>
            </div>
            <p className="lead" style={{ marginBottom: 24 }}>Klik link di email untuk masuk. Link berlaku 15 menit.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn variant="secondary" size="lg" style={{ width: '100%' }}>Buka Gmail</Btn>
              <Btn variant="ghost" size="sm" style={{ width: '100%' }}>Kirim ulang link</Btn>
            </div>
            <div className="terms" style={{ marginTop: 24 }}>
              Salah alamat? <a href="#">Ganti email</a>
            </div>
          </div>
        </div>
        <LoginRightPanel
          quoteTitle="Sambil menunggu — tarik napas."
          quoteSub="Link masuk biasanya sampai dalam 30 detik."
        />
      </div>
    </div>
  );
}

// =========================================================
// REKAP (protected)
// =========================================================
function ScreenRekapWeb({ layout = 'vertical' }) {
  const Shell = layout === 'horizontal' ? AppShellH : AppShellV;
  const rows = [
    { d: '03 Jun 2026', m: 'Bintang Wijaya', s: 'Matematika · Trigonometri', h: 1.5, t: 'Rp 180.000' },
    { d: '05 Jun 2026', m: 'Kirana Putri', s: 'Bahasa Inggris · Speaking', h: 1.0, t: 'Rp 120.000' },
    { d: '05 Jun 2026', m: 'Bintang Wijaya', s: 'Matematika · Latihan Soal', h: 1.5, t: 'Rp 180.000' },
    { d: '10 Jun 2026', m: 'Bintang Wijaya', s: 'Fisika · Gerak Lurus', h: 2.0, t: 'Rp 260.000' },
    { d: '11 Jun 2026', m: 'Aditya Rahman', s: 'Kimia · Stoikiometri', h: 1.5, t: 'Rp 195.000' },
    { d: '12 Jun 2026', m: 'Bintang Wijaya', s: 'Matematika · Trigonometri', h: 1.5, t: 'Rp 180.000' },
    { d: '15 Jun 2026', m: 'Meilani Sari', s: 'Matematika · Aljabar', h: 1.5, t: 'Rp 180.000' },
    { d: '17 Jun 2026', m: 'Bintang Wijaya', s: 'Fisika · Hukum Newton', h: 2.0, t: 'Rp 260.000' },
    { d: '19 Jun 2026', m: 'Kirana Putri', s: 'Bahasa Inggris · Grammar', h: 1.0, t: 'Rp 120.000' },
    { d: '24 Jun 2026', m: 'Bintang Wijaya', s: 'Fisika · Energi & Usaha', h: 2.0, t: 'Rp 260.000' },
    { d: '26 Jun 2026', m: 'Bintang Wijaya', s: 'Matematika · Review UH', h: 1.5, t: 'Rp 180.000' },
    { d: '28 Jun 2026', m: 'Meilani Sari', s: 'Matematika · Persiapan UH', h: 1.5, t: 'Rp 180.000' },
  ];
  return (
    <div className="web-page tw">
      <Shell active="rekap">
          <div className="app-header">
            <div>
              <h1>Rekap Sesi</h1>
              <div className="sub">Ringkasan semua sesi les yang sudah tercatat dari app mobile.</div>
            </div>
            <div className="export-row">
              <button className="export-btn">
                <Icons.download size={16} />
                <span>Export CSV</span>
              </button>
              <button className="export-btn">
                <Icons.file size={16} />
                <span>Export PDF</span>
                <span className="quota">1 tersisa</span>
              </button>
            </div>
          </div>

          <div className="rekap-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="month-picker">
                <button><Icons.chevL size={18} /></button>
                <span className="m">Juni 2026</span>
                <button><Icons.chevR size={18} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="input" style={{ height: 44, width: 150, fontSize: 13, padding: '0 14px', borderRadius: 'var(--r-md)' }}>
                  01 Jun 2026
                </div>
                <span style={{ color: 'var(--tw-text-3)', fontSize: 13, fontWeight: 700 }}>—</span>
                <div className="input" style={{ height: 44, width: 150, fontSize: 13, padding: '0 14px', borderRadius: 'var(--r-md)' }}>
                  30 Jun 2026
                </div>
              </div>
            </div>
            <div className="seg">
              <button className="on">Semua</button>
              <button>Bintang</button>
              <button>Kirana</button>
              <button>Aditya</button>
              <button>Meilani</button>
            </div>
          </div>

          <div className="stat-row" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="lbl">Total Sesi</div>
              <div className="val">32</div>
              <div className="foot"><span className="accent">+6</span> dari Mei</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Jam</div>
              <div className="val">48,5</div>
              <div className="foot"><span className="accent">+8,5 jam</span> dari Mei</div>
            </div>
            <div className="stat-card">
              <div className="lbl">Total Pendapatan</div>
              <div className="val">Rp 5.9jt</div>
              <div className="foot"><span className="accent">+Rp 900rb</span> dari Mei</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="tw-title-md">Detail Sesi</div>
              <div className="tw-helper">Menampilkan 12 dari 32 sesi</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Tanggal</th>
                  <th>Murid</th>
                  <th>Sesi</th>
                  <th className="right">Jam</th>
                  <th className="right" style={{ paddingRight: 24 }}>Tagihan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ paddingLeft: 24 }}>{r.d}</td>
                    <td style={{ fontWeight: 700 }}>{r.m}</td>
                    <td style={{ color: 'var(--tw-text-2)' }}>{r.s}</td>
                    <td className="right"><span className="mono">{r.h.toFixed(1)}</span></td>
                    <td className="right" style={{ paddingRight: 24 }}><span className="mono" style={{ color: 'var(--tw-primary)' }}>{r.t}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </Shell>
    </div>
  );
}

// =========================================================
// INVOICE BUILDER (protected)
// =========================================================
function ScreenInvoiceBuilder({ template = 'klasik', accent = '#006C53', paywall = false, layout = 'vertical' }) {
  const Shell = layout === 'horizontal' ? AppShellH : AppShellV;
  const colors = ['#006C53', '#235C8F', '#805346', '#635880', '#8A5A00', '#161D1F'];
  const Tpl = template === 'klasik' ? TplKlasik : template === 'modern' ? TplModern : TplMinimal;
  return (
    <div className="web-page tw">
      <Shell active="invoice" mainStyle={{ padding: '32px 40px 40px', position: 'relative' }}>
          <div className="app-header">
            <div>
              <h1>Invoice Builder</h1>
              <div className="sub">Pilih murid & rentang tanggal — semua sesi akan otomatis dimasukkan.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" size="sm">Simpan draft</Btn>
              <Btn variant="primary" size="sm" icon={<Icons.lockSm />}>Export PDF</Btn>
            </div>
          </div>

          <div className="invoice-layout">
            <div className="inv-form">
              <h3>Data Invoice</h3>

              <Field label="Murid">
                <div className="input" style={{ justifyContent: 'space-between' }}>
                  <span>Bintang Wijaya</span>
                  <Icons.chevD size={16} />
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Mulai">
                  <div className="input">01 Jun 2026</div>
                </Field>
                <Field label="Sampai">
                  <div className="input">30 Jun 2026</div>
                </Field>
              </div>

              <div className="divide"></div>

              <Field label="Template">
                <div className="template-picker">
                  {['klasik', 'modern', 'minimal'].map(t => (
                    <div key={t} className={'opt' + (template === t ? ' on' : '')}>
                      <div className="preview" style={{ background: t === 'klasik' ? `linear-gradient(${accent} 22%, #fff 22%)` : t === 'modern' ? '#fff' : '#fff' }}>
                        {t === 'modern' && <div style={{ height: 3, background: accent, marginBottom: 4 }}></div>}
                        {t === 'minimal' && <div style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 3, fontFamily: 'var(--f-title)', fontSize: 8, fontWeight: 700 }}>INVOICE</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                          <div style={{ height: 2, background: '#eee', width: '80%' }}></div>
                          <div style={{ height: 2, background: '#eee', width: '90%' }}></div>
                          <div style={{ height: 2, background: '#eee', width: '70%' }}></div>
                          <div style={{ height: 2, background: '#eee', width: '85%' }}></div>
                        </div>
                        <div style={{ marginTop: 'auto', height: 4, background: accent, width: '40%', alignSelf: 'flex-end' }}></div>
                      </div>
                      <span className="nm">{t[0].toUpperCase() + t.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </Field>

              <Field label="Warna Aksen">
                <div className="color-picker">
                  {colors.map(c => (
                    <span key={c}
                      className={'sw' + (c === accent ? ' on' : '')}
                      style={{ background: c, color: c }}
                    ></span>
                  ))}
                </div>
              </Field>

              <div className="divide"></div>

              <Field label="Rekening penerima">
                <div className="input" style={{ justifyContent: 'space-between' }}>
                  <span>BCA · 1234 5678 9012</span>
                  <Icons.chevD size={16} />
                </div>
              </Field>

              <Field label="Catatan (opsional)">
                <div className="input" style={{ height: 'auto', minHeight: 72, alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14, lineHeight: 1.5 }}>
                  Terima kasih atas kepercayaannya. Pembayaran paling lambat 7 Juli 2026.
                </div>
              </Field>

              <div style={{ marginTop: 'auto' }}>
                <Btn variant="primary" size="lg" icon={<Icons.lockSm />} iconRight={<Icons.download size={16} />}
                  style={{ width: '100%' }}>
                  Export PDF
                </Btn>
                <div className="tw-helper" style={{ textAlign: 'center', marginTop: 8 }}>
                  Fitur premium — perlu langganan aktif.
                </div>
              </div>
            </div>

            <div className="inv-preview-wrap">
              <div className="inv-preview-toolbar">
                <div className="tw-title-md">Preview · {template[0].toUpperCase() + template.slice(1)}</div>
                <div className="zoom-ctl">
                  <button><Icons.minus size={14} /></button>
                  <span className="z">75%</span>
                  <button><Icons.plus size={14} /></button>
                </div>
              </div>
              <div className="a4-stage">
                <A4Page>
                  <Tpl acc={accent} />
                </A4Page>
              </div>
            </div>
          </div>

          {paywall && <PaywallDialog />}
      </Shell>
    </div>
  );
}

// =========================================================
// PAYWALL DIALOG
// =========================================================
function PaywallDialog() {
  return (
    <div className="paywall-scrim">
      <div className="paywall-dialog">
        <div className="lock" style={{ color: 'var(--tw-primary)' }}>
          <Icons.lock size={30} />
        </div>
        <h2>Fitur Premium</h2>
        <p>Export PDF invoice adalah bagian dari langganan TutorLog Plus. Aktifkan untuk mulai kirim tagihan tanpa batas ke murid kamu.</p>
        <ul className="feats">
          <li><span className="ck"><Icons.check size={12} /></span>Export invoice PDF tanpa batas</li>
          <li><span className="ck"><Icons.check size={12} /></span>Export rekap PDF tanpa batas</li>
          <li><span className="ck"><Icons.check size={12} /></span>3 template invoice + kustomisasi warna</li>
          <li><span className="ck"><Icons.check size={12} /></span>Prioritas dukungan</li>
        </ul>
        <div className="actions">
          <Btn variant="primary" size="lg" iconRight={<Icons.arrowR size={16} />}>Lihat Langganan</Btn>
          <Btn variant="ghost" size="sm">Nanti saja</Btn>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// LANGGANAN (protected)
// =========================================================
function ScreenLangganan({ layout = 'vertical' }) {
  const Shell = layout === 'horizontal' ? AppShellH : AppShellV;
  return (
    <div className="web-page tw">
      <Shell active="langganan">
          <div className="app-header">
            <div>
              <h1>Langganan</h1>
              <div className="sub">Aktifkan TutorLog Plus untuk fitur export tanpa batas.</div>
            </div>
            <span className="chip"><span className="chip-dot"></span>Free plan aktif</span>
          </div>

          <div className="subs-layout">
            <div className="plan-card">
              <span className="tag">Direkomendasikan</span>
              <div className="plan-title">TutorLog Plus</div>
              <div className="p-desc">Untuk tutor yang mengelola lebih dari 3 murid dan butuh tagihan rutin.</div>
              <div className="price-row">
                <span className="price">Rp 39rb</span>
                <span className="per">/ bulan</span>
              </div>
              <ul className="p-feats">
                <li><span className="ck"><Icons.check size={12} /></span>Export invoice PDF tanpa batas</li>
                <li><span className="ck"><Icons.check size={12} /></span>Export rekap PDF & CSV tanpa batas</li>
                <li><span className="ck"><Icons.check size={12} /></span>3 template invoice + kustom warna</li>
                <li><span className="ck"><Icons.check size={12} /></span>Simpan rekening + template favorit</li>
                <li><span className="ck"><Icons.check size={12} /></span>Prioritas dukungan via WhatsApp</li>
              </ul>
              <Btn variant="primary" size="lg" iconRight={<Icons.ext size={16} />}
                style={{ background: '#fff', color: 'var(--tw-primary)', width: '100%' }}>
                Bayar via Lynk.id
              </Btn>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="pay-info">
                <h3>Transfer manual</h3>
                <div className="tw-helper">Sudah bayar di Lynk.id? Konfirmasi manual di sini kalau otomatisasi belum tersinkron.</div>
                <div className="bank-block">
                  <div className="lg">BCA</div>
                  <div>
                    <div className="bn">Bank Central Asia</div>
                    <div className="no">7712 3456 789</div>
                    <div className="an">a/n Kalilinux Studio</div>
                  </div>
                  <button className="copy"><Icons.copy size={12} /> Salin</button>
                </div>
                <Btn variant="secondary" size="lg" icon={<Icons.checkCircle size={16} />}>
                  Konfirmasi pembayaran
                </Btn>
              </div>

              <div className="pay-info">
                <h3>Cara aktivasi</h3>
                <ul className="step-list">
                  <li>
                    <span className="num">1</span>
                    <span>Klik <b>"Bayar via Lynk.id"</b> → selesaikan pembayaran di halaman Lynk.</span>
                  </li>
                  <li>
                    <span className="num">2</span>
                    <span>Status langganan akan otomatis aktif dalam 5 menit setelah pembayaran berhasil.</span>
                  </li>
                  <li>
                    <span className="num">3</span>
                    <span>Kalau belum aktif setelah 15 menit, gunakan <b>"Konfirmasi pembayaran"</b> dan lampirkan bukti transfer.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </Shell>
    </div>
  );
}

// =========================================================
// SHARED — Legal page header (dark constellation band)
// =========================================================
function LegalHeroBand({ title, subtitle, icon }) {
  const particles = [
    { x: '8%', y: '20%', s: 5, glow: true, pd: '5s', po: .4 },
    { x: '25%', y: '35%', s: 4, glow: false, pd: '4s', po: .25 },
    { x: '55%', y: '15%', s: 6, glow: true, pd: '6s', po: .45 },
    { x: '78%', y: '30%', s: 5, glow: false, pd: '4.5s', po: .3 },
    { x: '92%', y: '20%', s: 7, glow: true, pd: '5s', po: .4 },
    { x: '40%', y: '55%', s: 4, glow: false, pd: '5.5s', po: .2 },
    { x: '70%', y: '60%', s: 5, glow: true, pd: '4s', po: .35 },
    { x: '15%', y: '65%', s: 6, glow: true, pd: '6s', po: .4 },
  ];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', padding: '100px 96px 56px',
      background: 'linear-gradient(160deg, #0f2920 0%, #143328 35%, #122a22 60%, #0d1f18 100%)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(140,246,210,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(140,246,210,.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}></div>
      {particles.map((p, i) => (
        <div key={i} className={'login-particle pulse' + (p.glow ? ' glow' : '')}
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, '--pd': p.pd, '--po': p.po, '--pt': (i * .4) + 's' }}
        />
      ))}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} preserveAspectRatio="none">
        <line x1="8%" y1="20%" x2="25%" y2="35%" stroke="rgba(140,246,210,.06)" strokeWidth="1" />
        <line x1="55%" y1="15%" x2="78%" y2="30%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="78%" y1="30%" x2="92%" y2="20%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
        <line x1="15%" y1="65%" x2="40%" y2="55%" stroke="rgba(140,246,210,.05)" strokeWidth="1" />
        <line x1="40%" y1="55%" x2="70%" y2="60%" stroke="rgba(140,246,210,.04)" strokeWidth="1" />
      </svg>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--r-lg)',
            background: 'rgba(140,246,210,.08)', border: '1px solid rgba(140,246,210,.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--tw-primary-soft)',
          }}>{icon}</div>
          <div>
            <h1 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 36, letterSpacing: '-.5px', margin: 0, color: '#F5EFE4' }}>{title}</h1>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: 13, color: 'rgba(140,246,210,.55)', margin: '4px 0 0' }}>{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalFooter() {
  return (
    <div className="landing-footer">
      <div className="l">
        <span className="mk" style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--tw-surface-soft)', border: '1px solid var(--tw-border)' }}>
          <img src="tutorlog-logo.png" alt="" />
        </span>
        <span className="brand-sm">TutorLog</span>
        <span>© 2026</span>
      </div>
      <div className="r">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
        <a href="#">Account Deletion</a>
        <a href="#">Kontak</a>
      </div>
    </div>
  );
}

function LegalBody({ children }) {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 32px 64px', fontFamily: 'var(--f-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--tw-text-2)' }}>
      {children}
    </div>
  );
}

function LH2({ children }) {
  return <h2 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 22, margin: '0 0 16px', color: 'var(--tw-text)' }}>{children}</h2>;
}

// =========================================================
// PRIVACY POLICY (public) — redesigned
// =========================================================
function ScreenPrivacyPolicy() {
  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Kebijakan Privasi" subtitle="Terakhir diperbarui: 3 Juni 2026" icon={<Icons.lock size={24} />} />
      <LegalBody>
        <div className="card" style={{ padding: '24px 28px', marginBottom: 32, background: 'var(--tw-secondary-soft)', border: 'none' }}>
          <h2 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 20, margin: '0 0 12px', color: 'var(--tw-text)' }}>Ringkasan</h2>
          <p style={{ margin: 0 }}>TutorLog membantu tutor privat mencatat sesi les, menyimpan riwayat murid, membuat rekap tagihan, dan export rekap ke PDF/CSV. Kebijakan ini menjelaskan data yang dipakai TutorLog dan alasannya.</p>
        </div>

        <LH2>Data yang Dipakai TutorLog</LH2>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}><b>Data akun:</b> alamat email dan ID autentikasi.</li>
          <li style={{ marginBottom: 8 }}><b>Profil tutor:</b> nama tutor untuk laporan dan export PDF.</li>
          <li style={{ marginBottom: 8 }}><b>Data murid:</b> nama, tingkat pendidikan, tipe tagihan, tarif, dan status aktif/tersembunyi.</li>
          <li style={{ marginBottom: 8 }}><b>Data lokasi:</b> lokasi belajar murid dan lokasi sesi saat user menyimpan lokasi murid, mulai sesi tatap muka, atau menyelesaikan sesi.</li>
          <li style={{ marginBottom: 8 }}><b>Aktivitas sesi:</b> waktu mulai, waktu selesai, mode ajar, durasi, estimasi tagihan, status sinkronisasi, dan riwayat sesi.</li>
          <li style={{ marginBottom: 8 }}><b>Data akses premium:</b> voucher, status akses, tanggal aktif, dan counter penggunaan export.</li>
          <li style={{ marginBottom: 8 }}><b>File export:</b> PDF atau CSV yang dibuat hanya saat user memilih export/share.</li>
        </ul>
        <p style={{ marginBottom: 32 }}>TutorLog tidak mengambil lokasi di background dan tidak melacak pergerakan user secara langsung.</p>

        <LH2>Alasan Data Digunakan</LH2>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}>Login dan pengelolaan akun tutor.</li>
          <li style={{ marginBottom: 8 }}>Mencocokkan sesi tatap muka dengan lokasi murid yang tersimpan.</li>
          <li style={{ marginBottom: 8 }}>Mencatat riwayat sesi dan durasi mengajar.</li>
          <li style={{ marginBottom: 8 }}>Menghitung rekap tagihan.</li>
          <li style={{ marginBottom: 8 }}>Membuat PDF/CSV saat diminta user.</li>
          <li style={{ marginBottom: 8 }}>Mengelola limit akses, voucher, dan early access.</li>
          <li style={{ marginBottom: 8 }}>Membantu debugging atau support saat user melaporkan masalah.</li>
        </ul>

        <LH2>Penggunaan Lokasi</LH2>
        <p style={{ marginBottom: 12 }}>TutorLog meminta izin lokasi hanya untuk fungsi yang berkaitan dengan sesi les, yaitu menyimpan lokasi murid, mulai sesi tatap muka di dekat lokasi murid, dan menyimpan titik lokasi saat sesi selesai.</p>
        <p style={{ marginBottom: 32 }}>TutorLog hanya memakai foreground location. App tidak meminta permission <code style={{ background: 'var(--tw-surface-soft)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>ACCESS_BACKGROUND_LOCATION</code>.</p>

        <LH2>Penyimpanan dan Keamanan</LH2>
        <p style={{ marginBottom: 12 }}>TutorLog menyimpan data app di Supabase. Data dikirim melalui koneksi HTTPS terenkripsi. Access rules dikonfigurasi agar user yang login hanya bisa mengakses data TutorLog miliknya sendiri.</p>
        <p style={{ marginBottom: 32 }}>File PDF dan CSV dibuat dari data rekap yang dipilih user. Setelah export, user mengontrol sendiri tempat file tersebut dibagikan atau disimpan.</p>

        <LH2>Retensi dan Penghapusan Data</LH2>
        <p style={{ marginBottom: 12 }}>TutorLog menyimpan data akun, murid, sesi, voucher, dan rekap selama akun aktif agar tutor bisa melihat riwayat dan membuat laporan.</p>
        <p style={{ marginBottom: 32 }}>Jika user meminta penghapusan akun atau data, TutorLog akan memverifikasi request tersebut lalu menghapus atau menganonimkan data terkait sesuai proses penghapusan akun.</p>

        <LH2>Kontak</LH2>
        <p style={{ marginBottom: 0 }}>Untuk pertanyaan privasi atau penghapusan data, kirim email ke <a href="mailto:tutorlog.admin@gmail.com" style={{ color: 'var(--tw-primary)', fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</p>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// ACCOUNT DELETION (public) — redesigned
// =========================================================
function ScreenAccountDeletion() {
  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Minta Hapus Akun" subtitle="Terakhir diperbarui: 3 Juni 2026" icon={<Icons.users size={24} />} />
      <LegalBody>
        <LH2>Cara Mengajukan Penghapusan</LH2>
        <p style={{ marginBottom: 16 }}>User TutorLog bisa meminta penghapusan akun dan data meskipun app sudah dihapus dari perangkat.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {[
            { n: '1', t: 'Kirim email', d: <span>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com" style={{ color: 'var(--tw-primary)', fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</span> },
            { n: '2', t: 'Gunakan subjek yang benar', d: <span>Gunakan subjek: <b>Hapus akun TutorLog</b>.</span> },
            { n: '3', t: 'Sertakan email login', d: 'Sertakan email yang dipakai untuk login TutorLog.' },
            { n: '4', t: 'Tulis konfirmasi', d: 'Tulis konfirmasi singkat bahwa kamu ingin akun dan data TutorLog dihapus.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                width: 36, height: 36, borderRadius: 'var(--r-full)',
                background: 'var(--tw-secondary-soft)', color: 'var(--tw-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 15,
              }}>{s.n}</span>
              <div>
                <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 16, color: 'var(--tw-text)', marginBottom: 4 }}>{s.t}</div>
                <div style={{ fontSize: 14 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        <LH2>Data yang Akan Dihapus atau Dianonimkan</LH2>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}>Akun autentikasi TutorLog.</li>
          <li style={{ marginBottom: 8 }}>Profil tutor.</li>
          <li style={{ marginBottom: 8 }}>Data murid dan lokasi belajar.</li>
          <li style={{ marginBottom: 8 }}>Riwayat sesi dan attendance records.</li>
          <li style={{ marginBottom: 8 }}>Data akses premium, voucher, dan counter penggunaan fitur.</li>
          <li style={{ marginBottom: 8 }}>Catatan support terkait request, jika sudah tidak dibutuhkan.</li>
        </ul>
        <p style={{ marginBottom: 32 }}>Jika ada data yang perlu disimpan untuk alasan keamanan, pencegahan penyalahgunaan, atau kewajiban hukum, TutorLog akan menyimpan data seminimal mungkin dan menghapus detail les personal jika memungkinkan.</p>

        <LH2>Verifikasi Request</LH2>
        <p style={{ marginBottom: 32 }}>Untuk menjaga keamanan akun, TutorLog akan memverifikasi bahwa request berasal dari email yang sama dengan akun TutorLog. Jika email berbeda, owner TutorLog dapat meminta konfirmasi tambahan.</p>

        <LH2>Estimasi Proses</LH2>
        <p style={{ marginBottom: 0 }}>Request yang sudah terverifikasi akan diproses secepatnya selama early access. Target proses penghapusan adalah maksimal 7 hari setelah verifikasi selesai.</p>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// TERMS OF SERVICE (public)
// =========================================================
function ScreenTerms() {
  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Syarat & Ketentuan" subtitle="Terakhir diperbarui: 3 Juni 2026" icon={<Icons.file size={24} />} />
      <LegalBody>
        <LH2>Penerimaan Syarat</LH2>
        <p style={{ marginBottom: 32 }}>Dengan menggunakan aplikasi TutorLog ("Layanan"), kamu setuju untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, jangan gunakan Layanan.</p>

        <LH2>Deskripsi Layanan</LH2>
        <p style={{ marginBottom: 32 }}>TutorLog adalah aplikasi pencatat sesi les untuk tutor privat di Indonesia. Layanan mencakup pencatatan sesi, rekap tagihan, export PDF/CSV, dan invoice builder melalui aplikasi mobile dan companion web.</p>

        <LH2>Akun Pengguna</LH2>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}>Kamu bertanggung jawab menjaga kerahasiaan akses akun (email login dan magic link).</li>
          <li style={{ marginBottom: 8 }}>Satu akun hanya boleh digunakan oleh satu orang tutor.</li>
          <li style={{ marginBottom: 8 }}>TutorLog berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
        </ul>

        <LH2>Penggunaan yang Diperbolehkan</LH2>
        <p style={{ marginBottom: 12 }}>Kamu setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan fungsi yang disediakan:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}>Mencatat dan mengelola sesi les privat.</li>
          <li style={{ marginBottom: 8 }}>Membuat rekap dan tagihan untuk murid/orang tua murid.</li>
          <li style={{ marginBottom: 8 }}>Mengexport data sesi dalam format PDF atau CSV.</li>
        </ul>

        <LH2>Langganan dan Pembayaran</LH2>
        <ul style={{ paddingLeft: 20, marginBottom: 32 }}>
          <li style={{ marginBottom: 8 }}>Beberapa fitur (export PDF tanpa batas, invoice builder) memerlukan langganan TutorLog Plus.</li>
          <li style={{ marginBottom: 8 }}>Pembayaran diproses melalui Lynk.id atau transfer manual.</li>
          <li style={{ marginBottom: 8 }}>Langganan berlaku per bulan dan tidak diperpanjang otomatis.</li>
          <li style={{ marginBottom: 8 }}>Pembayaran yang sudah dilakukan tidak dapat dikembalikan (non-refundable).</li>
        </ul>

        <LH2>Batasan Tanggung Jawab</LH2>
        <p style={{ marginBottom: 32 }}>TutorLog disediakan "sebagaimana adanya" (as-is). Kami tidak menjamin bahwa Layanan akan selalu tersedia, bebas error, atau memenuhi semua kebutuhan spesifik kamu. TutorLog tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.</p>

        <LH2>Perubahan Ketentuan</LH2>
        <p style={{ marginBottom: 32 }}>TutorLog dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan Layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.</p>

        <LH2>Kontak</LH2>
        <p style={{ marginBottom: 0 }}>Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi <a href="mailto:tutorlog.admin@gmail.com" style={{ color: 'var(--tw-primary)', fontWeight: 700 }}>tutorlog.admin@gmail.com</a>.</p>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// KONTAK (public)
// =========================================================
function ScreenKontak() {
  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Kontak" subtitle="Ada pertanyaan? Kami senang mendengar dari kamu." icon={<Icons.mail size={24} />} />
      <LegalBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--r-lg)',
              background: 'var(--tw-secondary-soft)', color: 'var(--tw-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icons.mail size={24} /></div>
            <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 20, margin: 0 }}>Email</h3>
            <p style={{ margin: 0 }}>Untuk pertanyaan umum, saran, bug report, atau permintaan penghapusan akun.</p>
            <a href="mailto:tutorlog.admin@gmail.com" style={{ color: 'var(--tw-primary)', fontWeight: 700, fontSize: 16, textDecoration: 'none', fontFamily: 'var(--f-title)' }}>tutorlog.admin@gmail.com</a>
          </div>
          <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--r-lg)',
              background: 'var(--tw-secondary-soft)', color: 'var(--tw-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icons.time size={24} /></div>
            <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 20, margin: 0 }}>Waktu Respons</h3>
            <p style={{ margin: 0 }}>Kami berusaha membalas dalam 1–2 hari kerja. Untuk request penghapusan akun, proses maksimal 7 hari setelah verifikasi.</p>
          </div>
        </div>

        <LH2>FAQ Singkat</LH2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {[
            { q: 'Bagaimana cara masuk ke TutorLog Web?', a: 'Klik "Masuk dengan Magic Link" di halaman utama, masukkan email yang sama dengan akun app mobile kamu. Link login akan dikirim ke email.' },
            { q: 'Apakah data sesi otomatis muncul di web?', a: 'Ya, semua sesi yang dicatat di app mobile akan otomatis tersinkron ke companion web setelah kamu login.' },
            { q: 'Bagaimana cara berlangganan TutorLog Plus?', a: 'Buka halaman Langganan di sidebar, lalu pilih "Bayar via Lynk.id" atau transfer manual ke rekening yang tertera.' },
            { q: 'Apakah bisa menghapus akun?', a: 'Bisa. Kirim email ke tutorlog.admin@gmail.com dengan subjek "Hapus akun TutorLog". Lihat halaman Account Deletion untuk detail.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 16, color: 'var(--tw-text)', marginBottom: 8 }}>{f.q}</div>
              <p style={{ margin: 0, fontSize: 14 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// FITUR (public) — feature deep-dive
// =========================================================
function ScreenFitur() {
  const features = [
    {
      ic: <Icons.chart size={28} />, t: 'Rekap Bulanan',
      d: 'Lihat total sesi, jam mengajar, dan pendapatan per bulan dalam satu dashboard. Filter per murid untuk detail lebih dalam.',
      details: [
        'Stat cards: total sesi, total jam, total pendapatan',
        'Tabel sesi lengkap dengan tanggal, murid, materi, durasi',
        'Filter per murid via tab segmented control',
        'Custom date range untuk rentang tanggal spesifik',
        'Month picker navigasi cepat antar bulan',
      ]
    },
    {
      ic: <Icons.file size={28} />, t: 'Export PDF & CSV',
      d: 'Ubah data sesi jadi dokumen rapi — arsip pribadi, lampiran pajak, atau laporan untuk orang tua murid.',
      details: [
        'Export rekap bulanan ke PDF dengan format rapi',
        'Export ke CSV untuk olah data di spreadsheet',
        'Quota badge untuk user Free plan (1 export/bulan)',
        'Unlimited export untuk TutorLog Plus',
      ]
    },
    {
      ic: <Icons.invoice size={28} />, t: 'Invoice Builder',
      d: 'Buat invoice profesional untuk menagih orang tua murid. Pilih template, kustomisasi warna, isi rekening, langsung export.',
      details: [
        '3 template siap pakai: Klasik, Modern, Minimal',
        '6 preset warna aksen yang bisa dipilih',
        'Live preview A4 di sebelah kanan form',
        'Isi data rekening sekali, pakai terus',
        'Watermark "Generated by TutorLog" otomatis',
      ]
    },
    {
      ic: <Icons.spark size={28} />, t: 'Sinkronisasi App ↔ Web',
      d: 'Semua data sesi yang dicatat di app mobile otomatis tersinkron ke companion web. Login sekali via Magic Link, data langsung tersedia.',
      details: [
        'Login tanpa password — cukup Magic Link via email',
        'Data sesi real-time dari app mobile TutorLog',
        'Satu akun, dua platform (mobile + web)',
        'Tidak perlu input ulang data secara manual',
      ]
    },
  ];

  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Fitur" subtitle="Semua yang kamu butuh setelah sesi berakhir." icon={<Icons.spark size={24} />} />
      <LegalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-lg)',
                  background: 'var(--tw-secondary-soft)', color: 'var(--tw-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>{f.ic}</div>
                <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 24, margin: '0 0 12px', color: 'var(--tw-text)' }}>{f.t}</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{f.d}</p>
              </div>
              <div className="card" style={{ padding: '24px 28px' }}>
                <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 13, color: 'var(--tw-text-3)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 16 }}>Detail</div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {f.details.map((d, j) => (
                    <li key={j} style={{ marginBottom: 10, fontSize: 14, lineHeight: 1.5 }}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <div className="card" style={{ padding: '32px', background: 'var(--tw-secondary-soft)', border: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 480 }}>
            <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 22, margin: 0 }}>Siap mencoba?</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--tw-text-2)' }}>Mulai gratis, upgrade kapan saja kamu butuh export tanpa batas.</p>
            <Btn variant="primary" size="lg" icon={<Icons.mail size={16} />}>Masuk dengan Magic Link</Btn>
          </div>
        </div>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// HARGA (public) — pricing page
// =========================================================
function ScreenHarga() {
  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Harga" subtitle="Mulai gratis, upgrade kalau butuh." icon={<Icons.chart size={24} />} />
      <LegalBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          {/* Free plan */}
          <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 13, color: 'var(--tw-text-3)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 36, color: 'var(--tw-text)' }}>Rp 0</span>
              <span style={{ fontSize: 14, color: 'var(--tw-text-3)' }}>/ selamanya</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--tw-text-2)', marginBottom: 24, lineHeight: 1.6 }}>Untuk tutor yang baru mulai atau mengelola sedikit murid.</p>
            <ul style={{ paddingLeft: 0, margin: '0 0 32px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Rekap bulanan lengkap',
                'Filter per murid',
                'Custom date range',
                'Export PDF rekap (1×/bulan)',
                'Export CSV rekap (1×/bulan)',
                'Invoice builder (preview only)',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 'var(--r-full)', background: 'var(--tw-secondary-soft)', color: 'var(--tw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 20px', marginTop: 1 }}><Icons.check size={11} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Btn variant="secondary" size="lg" style={{ width: '100%' }}>Mulai Gratis</Btn>
            </div>
          </div>

          {/* Plus plan */}
          <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(170deg, #0f2920, #143328)', color: '#F5EFE4', border: '1px solid rgba(140,246,210,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 13, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--tw-primary-soft)' }}>TutorLog Plus</div>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-body)', padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'rgba(140,246,210,.15)', color: 'var(--tw-primary-soft)' }}>Rekomendasi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 36 }}>Rp 39rb</span>
              <span style={{ fontSize: 14, color: 'rgba(140,246,210,.6)' }}>/ bulan</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(245,239,228,.65)', marginBottom: 24, lineHeight: 1.6 }}>Untuk tutor yang mengelola banyak murid dan butuh tagihan rutin.</p>
            <ul style={{ paddingLeft: 0, margin: '0 0 32px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Semua fitur Free',
                'Export invoice PDF tanpa batas',
                'Export rekap PDF & CSV tanpa batas',
                '3 template invoice + kustom warna',
                'Simpan rekening + template favorit',
                'Prioritas dukungan via WhatsApp',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 'var(--r-full)', background: 'rgba(140,246,210,.12)', color: 'var(--tw-primary-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 20px', marginTop: 1 }}><Icons.check size={11} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Btn variant="primary" size="lg" iconRight={<Icons.ext size={16} />}
                style={{ width: '100%', background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)' }}>
                Bayar via Lynk.id
              </Btn>
            </div>
          </div>
        </div>

        <LH2>Pertanyaan Umum</LH2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {[
            { q: 'Apakah data saya hilang kalau tidak upgrade?', a: 'Tidak. Data sesi kamu tetap tersimpan dan bisa dilihat di rekap. Hanya fitur export PDF/CSV dan invoice builder yang terbatas di Free plan.' },
            { q: 'Bagaimana cara bayar?', a: 'Klik "Bayar via Lynk.id" di halaman Langganan. Kamu juga bisa transfer manual ke rekening yang tertera, lalu konfirmasi di halaman Langganan.' },
            { q: 'Apakah langganan otomatis diperpanjang?', a: 'Tidak. Langganan berlaku per bulan dan tidak diperpanjang otomatis. Kamu perlu bayar ulang setiap bulan.' },
            { q: 'Bisa refund?', a: 'Pembayaran yang sudah dilakukan bersifat non-refundable. Pastikan kamu sudah yakin sebelum membayar.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 16, color: 'var(--tw-text)', marginBottom: 8 }}>{f.q}</div>
              <p style={{ margin: 0, fontSize: 14 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

// =========================================================
// PANDUAN (public) — getting started guide
// =========================================================
function ScreenPanduan() {
  const steps = [
    {
      n: '1', t: 'Download TutorLog di Play Store',
      d: 'Cari "TutorLog" di Google Play Store, install, dan buat akun dengan email kamu.',
      ic: <Icons.ext size={20} />,
    },
    {
      n: '2', t: 'Tambah murid',
      d: 'Buka app → tap "Tambah Murid" → isi nama, tingkat pendidikan, tarif per jam, dan tipe tagihan.',
      ic: <Icons.users size={20} />,
    },
    {
      n: '3', t: 'Mulai sesi les',
      d: 'Di halaman utama, pilih murid lalu tap "Mulai Sesi". Timer berjalan otomatis. Selesai mengajar? Tap "Selesaikan Sesi".',
      ic: <Icons.time size={20} />,
    },
    {
      n: '4', t: 'Login ke TutorLog Web',
      d: 'Buka website ini, klik "Masuk dengan Magic Link", masukkan email yang sama. Cek inbox untuk link login.',
      ic: <Icons.mail size={20} />,
    },
    {
      n: '5', t: 'Lihat rekap & export',
      d: 'Semua sesi otomatis muncul di Rekap. Filter per bulan atau per murid, lalu export ke PDF/CSV.',
      ic: <Icons.chart size={20} />,
    },
    {
      n: '6', t: 'Buat invoice',
      d: 'Buka Invoice Builder, pilih murid & template, kustomisasi warna, isi rekening, dan export PDF untuk dikirim ke orangtua.',
      ic: <Icons.invoice size={20} />,
    },
  ];

  return (
    <div className="web-page tw">
      <TopNav />
      <LegalHeroBand title="Panduan" subtitle="Mulai dari nol sampai invoice pertama dalam 10 menit." icon={<Icons.file size={24} />} />
      <LegalBody>
        <div className="card" style={{ padding: '24px 28px', marginBottom: 40, background: 'var(--tw-secondary-soft)', border: 'none' }}>
          <h2 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 20, margin: '0 0 12px', color: 'var(--tw-text)' }}>Sebelum mulai</h2>
          <p style={{ margin: 0 }}>TutorLog terdiri dari 2 bagian: <b>app mobile</b> (Play Store) untuk mencatat sesi les, dan <b>companion web</b> (website ini) untuk rekap tagihan dan export. Keduanya terhubung dengan email yang sama.</p>
        </div>

        <LH2>Langkah-langkah</LH2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--r-lg)',
                background: i < 3 ? 'var(--tw-secondary-soft)' : 'linear-gradient(135deg, rgba(140,246,210,.12), rgba(140,246,210,.04))',
                border: i >= 3 ? '1px solid rgba(0,108,83,.12)' : 'none',
                color: 'var(--tw-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 22,
              }}>{s.n}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ color: 'var(--tw-primary)' }}>{s.ic}</span>
                  <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 18, margin: 0, color: 'var(--tw-text)' }}>{s.t}</h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <LH2>Tips</LH2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            { t: 'Konsistensi', d: 'Catat setiap sesi langsung setelah selesai mengajar — jangan numpuk di akhir bulan.' },
            { t: 'Template favorit', d: 'Coba ketiga template invoice, pilih satu yang paling cocok, pakai terus untuk konsistensi.' },
            { t: 'Export rutin', d: 'Export rekap di awal bulan berikutnya. Ini jadi arsip digital rapi tanpa perlu buku catatan.' },
            { t: 'Upgrade kalau butuh', d: 'Free plan sudah cukup untuk mulai. Upgrade ke Plus kalau kamu butuh export lebih dari 1×/bulan.' },
          ].map((t, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 16, color: 'var(--tw-text)', marginBottom: 6 }}>{t.t}</div>
              <p style={{ margin: 0, fontSize: 14 }}>{t.d}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="card" style={{ padding: '32px', background: 'var(--tw-secondary-soft)', border: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 480 }}>
            <h3 style={{ fontFamily: 'var(--f-title)', fontWeight: 700, fontSize: 22, margin: 0 }}>Butuh bantuan?</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--tw-text-2)' }}>Kirim email ke kami, kami bantu secepatnya.</p>
            <Btn variant="primary" size="lg" icon={<Icons.mail size={16} />}>Hubungi Kami</Btn>
          </div>
        </div>
      </LegalBody>
      <LegalFooter />
    </div>
  );
}

Object.assign(window, {
  ScreenLanding, ScreenLogin, ScreenLoginSent, LoginRightPanel,
  ScreenRekapWeb, ScreenInvoiceBuilder, ScreenLangganan, PaywallDialog,
  ScreenPrivacyPolicy, ScreenAccountDeletion, ScreenTerms, ScreenKontak,
  ScreenFitur, ScreenHarga, ScreenPanduan,
});
