// web-shared.jsx — Icons + shared UI atoms for TutorLog Web mockups

// ------------ Icons (24px stroke, current color) ------------
function I(props) {
  const { d, size = 20, sw = 2, fill = 'none', children, style = {}, viewBox = '0 0 24 24' } = props;
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
      {d ? <path d={d} /> : children}
    </svg>
  );
}

const Icons = {
  chart: (p) => <I {...p} d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" />,
  file: (p) => <I {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5" />,
  wallet: (p) => <I {...p} d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M3 9h18 M17 15h.01" />,
  cog: (p) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></I>,
  play: (p) => <I {...p} d="M8 5l14 7-14 7Z" />,
  mail: (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>,
  arrowR: (p) => <I {...p} d="M5 12h14 M13 6l6 6-6 6" />,
  arrowL: (p) => <I {...p} d="M19 12H5 M11 6l-6 6 6 6" />,
  chevL: (p) => <I {...p} d="M15 18l-6-6 6-6" />,
  chevR: (p) => <I {...p} d="M9 18l6-6-6-6" />,
  chevD: (p) => <I {...p} d="M6 9l6 6 6-6" />,
  check: (p) => <I {...p} d="M20 6 9 17l-5-5" />,
  checkCircle: (p) => <I {...p}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></I>,
  download: (p) => <I {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
  lock: (p) => <I {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></I>,
  lockSm: (p) => <I {...p} size={14} sw={2.2} d="M6 10V7a3 3 0 0 1 6 0v3 M4 10h10v7H4z" />,
  bolt: (p) => <I {...p} d="M13 2 3 14h8l-1 8 10-12h-8Z" />,
  time: (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>,
  users: (p) => <I {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"><circle cx="9" cy="7" r="4" /></I>,
  book: (p) => <I {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z M4 19.5V22h16" />,
  spark: (p) => <I {...p} d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1" />,
  invoice: (p) => <I {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" />,
  plus: (p) => <I {...p} d="M12 5v14 M5 12h14" />,
  minus: (p) => <I {...p} d="M5 12h14" />,
  ext: (p) => <I {...p} d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3" />,
  copy: (p) => <I {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></I>,
};

// ------------ Brand mark helpers ------------
function BrandMark({ size = 40 }) {
  return (
    <span className="mk" style={{ width: size, height: size }}>
      <img src="tutorlog-logo.png" alt="" />
    </span>
  );
}

function Brand({ compact }) {
  return (
    <div className="brand">
      <BrandMark size={compact ? 36 : 40} />
      <span className="wm">TutorLog</span>
    </div>
  );
}

// ------------ Buttons ------------
function Btn({ children, variant = 'primary', size = '', icon, iconRight, ...rest }) {
  const cls = 'btn btn-' + variant + (size ? ' btn-' + size : '');
  return (
    <button className={cls} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

// ------------ Field ------------
function Field({ label, help, children }) {
  return (
    <div className="field">
      {label && <div className="lbl">{label}</div>}
      {children}
      {help && <div className="help">{help}</div>}
    </div>
  );
}

// ------------ App sidebar ------------
function AppSidebar({ active }) {
  const items = [
    { id: 'rekap', label: 'Rekap Sesi', icon: <Icons.chart size={18} /> },
    { id: 'invoice', label: 'Invoice Builder', icon: <Icons.invoice size={18} /> },
    { id: 'langganan', label: 'Langganan', icon: <Icons.wallet size={18} /> },
    { id: 'setting', label: 'Pengaturan', icon: <Icons.cog size={18} /> },
  ];
  return (
    <aside className="app-side">
      <div className="brand">
        <span className="mk"><img src="tutorlog-logo.png" alt="" /></span>
        <span className="wm">TutorLog</span>
      </div>
      <nav className="nav">
        {items.map(it => (
          <a key={it.id} href="#" className={active === it.id ? 'active' : ''}>
            {it.icon}
            <span>{it.label}</span>
          </a>
        ))}
      </nav>
      <div className="user">
        <div className="av">RN</div>
        <div className="who">
          <span className="em">Rina Novianti</span>
          <span className="sub">rina@tutorlog.id</span>
        </div>
      </div>
    </aside>
  );
}

// ------------ App top bar (horizontal tabs) ------------
function AppTopBar({ active }) {
  const items = [
    { id: 'rekap', label: 'Rekap Sesi', icon: <Icons.chart size={16} /> },
    { id: 'invoice', label: 'Invoice Builder', icon: <Icons.invoice size={16} /> },
    { id: 'langganan', label: 'Langganan', icon: <Icons.wallet size={16} /> },
    { id: 'setting', label: 'Pengaturan', icon: <Icons.cog size={16} /> },
  ];
  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="app-topbar-left">
          <div className="brand">
            <span className="mk"><img src="tutorlog-logo.png" alt="" /></span>
            <span className="wm">TutorLog</span>
          </div>
          <nav className="app-topbar-nav">
            {items.map(it => (
              <a key={it.id} href="#" className={active === it.id ? 'active' : ''}>
                {it.icon}
                <span>{it.label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="app-topbar-right">
          <div className="app-topbar-user">
            <div className="av">RN</div>
            <span className="em">Rina Novianti</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ------------ App shell wrappers ------------
function AppShellV({ active, children, mainStyle }) {
  return (
    <div className="app-shell">
      <AppSidebar active={active} />
      <main className="app-main" style={mainStyle}>{children}</main>
    </div>
  );
}

function AppShellH({ active, children, mainStyle }) {
  return (
    <div className="app-shell-h">
      <AppTopBar active={active} />
      <main className="app-main" style={mainStyle}>{children}</main>
    </div>
  );
}

// ------------ Public top nav ------------
function TopNav({ cta = true }) {
  return (
    <div className="nav-top">
      <Brand />
      <div className="links">
        <a href="#">Fitur</a>
        <a href="#">Harga</a>
        <a href="#">Panduan</a>
        <a href="#">Blog</a>
      </div>
      {cta ? (
        <Btn variant="primary" size="sm">Masuk</Btn>
      ) : <span style={{ width: 68 }} />}
    </div>
  );
}

Object.assign(window, { Icons, BrandMark, Brand, Btn, Field, AppSidebar, AppTopBar, AppShellV, AppShellH, TopNav });
