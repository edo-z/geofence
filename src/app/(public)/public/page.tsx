// src/app/(public)/page.tsx
import Link from 'next/link'
import { Show, UserButton } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <> 
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --teal:      #0F9B76;
          --teal-light:#E3F5EE;
          --teal-dark: #0A6B52;
          --ink:       #111813;
          --ink-mid:   #3D4840;
          --ink-soft:  #718575;
          --border:    #E2E8E4;
          --bg:        #FAFBFA;
          --white:     #FFFFFF;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Navbar ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(250,251,250,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          height: 60px;
          display: flex; align-items: center;
          padding: 0 6%;
        }
        .nav-inner {
          width: 100%; max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo-dot {
          width: 28px; height: 28px; border-radius: 7px;
          background: var(--teal);
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-dot svg { width: 14px; height: 14px; }
        .nav-logo-text {
          font-size: 15px; font-weight: 500; color: var(--ink);
          letter-spacing: -0.02em;
        }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .btn-ghost {
          padding: 7px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          color: var(--ink-mid); background: transparent;
          border: 1px solid transparent; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
        }
        .btn-ghost:hover { background: var(--teal-light); color: var(--teal-dark); }
        .btn-primary {
          padding: 8px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          color: #fff; background: var(--teal);
          border: none; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { background: var(--teal-dark); }

        /* ── Hero ── */
        .hero {
          padding: 140px 6% 100px;
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          background: var(--teal-light);
          font-size: 12px; font-weight: 500; color: var(--teal-dark);
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--teal);
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4.5vw, 54px);
          line-height: 1.1; letter-spacing: -0.02em;
          color: var(--ink); margin-bottom: 20px;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .hero-title em {
          font-style: italic; color: var(--teal);
        }
        .hero-desc {
          font-size: 16px; line-height: 1.7; color: var(--ink-soft);
          font-weight: 300; margin-bottom: 36px;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .hero-cta {
          display: flex; align-items: center; gap: 12px;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .btn-large {
          padding: 13px 28px; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          color: #fff; background: var(--teal);
          border: none; cursor: pointer;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(15,155,118,0.25);
        }
        .btn-large:hover {
          background: var(--teal-dark);
          box-shadow: 0 4px 20px rgba(15,155,118,0.35);
          transform: translateY(-1px);
        }
        .btn-outline {
          padding: 13px 28px; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          color: var(--ink-mid); background: transparent;
          border: 1px solid var(--border); cursor: pointer;
          text-decoration: none; transition: all 0.15s;
        }
        .btn-outline:hover { border-color: var(--teal); color: var(--teal); }

        /* ── Hero Visual ── */
        .hero-visual {
          animation: fadeUp 0.6s 0.2s ease both;
          position: relative;
        }
        .map-mockup {
          width: 100%; aspect-ratio: 4/3;
          border-radius: 16px;
          background: #1a2e22;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.1);
        }
        .map-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(15,155,118,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,155,118,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .map-zone {
          position: absolute;
          border-radius: 4px;
          animation: pulse 3s ease-in-out infinite;
        }
        .zone-a {
          width: 38%; height: 32%; top: 18%; left: 12%;
          background: rgba(15,155,118,0.2);
          border: 1.5px solid rgba(15,155,118,0.7);
          animation-delay: 0s;
        }
        .zone-b {
          width: 28%; height: 26%; top: 38%; left: 44%;
          background: rgba(55,138,221,0.15);
          border: 1.5px solid rgba(55,138,221,0.6);
          animation-delay: 0.8s;
        }
        .zone-c {
          width: 22%; height: 20%; top: 52%; left: 20%;
          background: rgba(226,75,74,0.15);
          border: 1.5px solid rgba(226,75,74,0.5);
          animation-delay: 1.6s;
        }
        .map-dot {
          position: absolute; width: 10px; height: 10px;
          border-radius: 50%; background: #fff;
          top: 28%; left: 26%;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.2);
          animation: ping 2s ease-in-out infinite;
        }
        .map-label {
          position: absolute;
          font-size: 9px; font-weight: 500; color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif;
        }
        .label-a { top: 22%; left: 14%; color: rgba(15,155,118,0.9); }
        .label-b { top: 42%; left: 46%; color: rgba(55,138,221,0.9); }
        .label-c { top: 56%; left: 22%; color: rgba(226,75,74,0.9); }
        .map-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 44px; background: rgba(10,20,14,0.8);
          backdrop-filter: blur(8px);
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 16px; gap: 12px;
        }
        .bar-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }
        .bar-text { font-size: 10px; color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif; }
        .bar-result {
          margin-left: auto; font-size: 10px; font-weight: 500;
          color: var(--teal); font-family: 'DM Sans', sans-serif;
        }
        .floating-card {
          position: absolute; right: -20px; top: 20px;
          background: #fff; border-radius: 10px;
          padding: 10px 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border: 1px solid var(--border);
          font-family: 'DM Sans', sans-serif;
        }
        .fc-label { font-size: 9px; color: var(--ink-soft); margin-bottom: 2px; }
        .fc-value { font-size: 14px; font-weight: 500; color: var(--teal); }

        /* ── Features ── */
        .features {
          padding: 80px 6% 80px;
          background: var(--white);
          border-top: 1px solid var(--border);
        }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--teal);
          margin-bottom: 12px;
        }
        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.15; letter-spacing: -0.02em;
          color: var(--ink); margin-bottom: 48px;
          max-width: 480px;
        }
        .feat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
        }
        .feat-card {
          padding: 28px 24px;
          border: 1px solid var(--border);
          background: var(--bg);
          transition: all 0.2s;
        }
        .feat-card:first-child { border-radius: 12px 0 0 12px; }
        .feat-card:last-child  { border-radius: 0 12px 12px 0; }
        .feat-card:hover {
          background: var(--white);
          z-index: 1;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .feat-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--teal-light);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .feat-icon svg { width: 18px; height: 18px; color: var(--teal); }
        .feat-name {
          font-size: 14px; font-weight: 500; color: var(--ink);
          margin-bottom: 8px;
        }
        .feat-desc {
          font-size: 13px; line-height: 1.6; color: var(--ink-soft);
          font-weight: 300;
        }

        /* ── How it works ── */
        .how {
          padding: 80px 6%;
          max-width: 1100px; margin: 0 auto;
        }
        .steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0; margin-top: 48px;
          position: relative;
        }
        .steps::before {
          content: '';
          position: absolute; top: 22px; left: 12%; right: 12%; height: 1px;
          background: var(--border);
          z-index: 0;
        }
        .step { text-align: center; padding: 0 24px; position: relative; }
        .step-num {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--white); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 500; color: var(--teal);
          margin: 0 auto 20px; position: relative; z-index: 1;
        }
        .step-title {
          font-size: 15px; font-weight: 500; color: var(--ink);
          margin-bottom: 10px;
        }
        .step-desc {
          font-size: 13px; line-height: 1.6; color: var(--ink-soft);
          font-weight: 300;
        }

        /* ── CTA Banner ── */
        .cta-banner {
          margin: 0 6% 80px;
          max-width: 1100px; margin-left: auto; margin-right: auto;
          background: var(--ink); border-radius: 16px;
          padding: 56px 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 40px;
        }
        .cta-banner-left {}
        .cta-banner-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px; line-height: 1.15;
          color: #fff; margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .cta-banner-title em { font-style: italic; color: var(--teal); }
        .cta-banner-desc {
          font-size: 14px; color: rgba(255,255,255,0.5);
          font-weight: 300;
        }
        .btn-large-white {
          padding: 13px 28px; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          color: var(--ink); background: #fff;
          border: none; cursor: pointer; white-space: nowrap;
          text-decoration: none; transition: all 0.15s;
          flex-shrink: 0;
        }
        .btn-large-white:hover { background: var(--teal-light); color: var(--teal-dark); }

        /* ── Footer ── */
        .footer {
          border-top: 1px solid var(--border);
          padding: 28px 6%;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 100%;
        }
        .footer-text { font-size: 12px; color: var(--ink-soft); }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; gap: 40px; padding: 100px 5% 60px; }
          .feat-grid { grid-template-columns: 1fr 1fr; }
          .feat-card:first-child { border-radius: 12px 12px 0 0; }
          .feat-card:last-child  { border-radius: 0 0 12px 12px; }
          .steps { grid-template-columns: 1fr; gap: 32px; }
          .steps::before { display: none; }
          .cta-banner { flex-direction: column; text-align: center; padding: 40px 32px; }
          .floating-card { display: none; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="nav-logo-dot">
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="3" fill="white"/>
                <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <span className="nav-logo-text">GeoResearch</span>
          </a>
          <div className="nav-actions">
            <Show when="signed-out">
              <Link href="/sign-in" className="btn-ghost">Sign in</Link>
              <Link href="/sign-up" className="btn-primary">
                Get started
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/map" className="btn-ghost">Open app</Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div>
          <h1 className="hero-title">
            Draw zones.<br />
            <em>Simulate</em> boundaries.<br />
            Research faster.
          </h1>
          <p className="hero-desc">
            Platform riset geofencing interaktif untuk researcher dan developer.
            Gambar area, simpan ke database, dan uji logika geospasial tanpa perlu setup infrastruktur.
          </p>
          <div className="hero-cta">
            <Show when="signed-out">
              <Link href="/sign-up" className="btn-large">
                Mulai gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/map" className="btn-large">
                Buka peta
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </Show>
            <a href="#features" className="btn-outline">Lihat fitur</a>
          </div>
        </div>

        {/* Map mockup */}
        <div className="hero-visual">
          <div className="map-mockup">
            <div className="map-grid" />
            <div className="map-zone zone-a" />
            <div className="map-zone zone-b" />
            <div className="map-zone zone-c" />
            <div className="map-dot" />
            <span className="map-label label-a">Zona A</span>
            <span className="map-label label-b">Zona B</span>
            <span className="map-label label-c">Restricted</span>
            <div className="map-bar">
              <div className="bar-dot" />
              <span className="bar-text">Point simulation — lat: -7.2575, lng: 112.7521</span>
              <span className="bar-result">Inside Zona A</span>
            </div>
          </div>
          <div className="floating-card">
            <div className="fc-label">Distance to boundary</div>
            <div className="fc-value">342 m</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-label">Fitur utama</div>
          <h2 className="section-title">Semua yang kamu butuhkan untuk riset geospasial</h2>
          <div className="feat-grid">
            {[
              {
                icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="9,2 16,6 16,12 9,16 2,12 2,6"/><circle cx="9" cy="9" r="2"/></svg>,
                name: 'Drawing Tools',
                desc: 'Gambar polygon dan garis langsung di peta interaktif. Data disimpan otomatis ke MongoDB dalam format GeoJSON.',
              },
              {
                icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 3"/></svg>,
                name: 'Point Simulation',
                desc: 'Klik titik mana saja di peta untuk langsung tahu apakah koordinat tersebut berada di dalam zona geofence.',
              },
              {
                icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9h14M9 2v14"/><circle cx="9" cy="9" r="7"/></svg>,
                name: 'Spatial Analysis',
                desc: 'Hitung area, perimeter, centroid, dan cari zona yang saling beririsan dengan presisi menggunakan Turf.js.',
              },
              {
                icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l4-4 4 4 4-8"/><rect x="1" y="1" width="16" height="16" rx="2"/></svg>,
                name: 'Export CSV & PDF',
                desc: 'Export semua data zona beserta hasil simulasi ke CSV atau PDF report lengkap dengan screenshot peta.',
              },
            ].map((f, i) => (
              <div key={i} className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-name">{f.name}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how" id="how">
        <div className="section-label">Cara kerja</div>
        <h2 className="section-title">Dari gambar zona ke hasil riset dalam hitungan menit</h2>
        <div className="steps">
          {[
            { n: '01', title: 'Gambar zona', desc: 'Pilih draw tool, gambar polygon di area yang ingin diteliti, beri nama dan kategori.' },
            { n: '02', title: 'Simpan & kelola', desc: 'Data tersimpan ke MongoDB. Atur layer, edit metadata, atau hapus zona kapan saja.' },
            { n: '03', title: 'Simulasi & export', desc: 'Uji titik koordinat, analisis spatial, lalu export hasil ke CSV atau PDF report.' },
          ].map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <div style={{ padding: '0 6% 80px' }}>
        <div className="cta-banner">
          <div className="cta-banner-left">
            <div className="cta-banner-title">Siap mulai <em>penelitian</em>?</div>
            <div className="cta-banner-desc">Tidak perlu kartu kredit. Mulai menggambar zona dalam 30 detik.</div>
          </div>
          <Show when="signed-out">
            <Link href="/sign-up" className="btn-large-white">Mulai sekarang →</Link>
          </Show>
          <Show when="signed-in">
            <Link href="/map" className="btn-large-white">Buka peta →</Link>
          </Show>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <span className="footer-text">© 2026 GeoResearch. Built with Next.js, MapLibre & Turf.js.</span>
        <span className="footer-text">Platform Riset Geofencing</span>
      </footer>
    </>
  )
}