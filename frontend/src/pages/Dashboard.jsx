import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .dashboard-hero {
          background: linear-gradient(135deg, #0a1628 0%, #0f2044 40%, #162a52 70%, #0d1f3c 100%);
          position: relative;
          overflow: hidden;
        }

        .dashboard-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(212,175,55,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 80% at 10% 80%, rgba(59,130,246,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.3);
          color: #d4af37;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }

        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .hero-title span {
          color: #d4af37;
          position: relative;
          display: inline-block;
        }

        .hero-title span::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #d4af37, #f0c84a, #d4af37);
          border-radius: 2px;
          opacity: 0.6;
        }

        .hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 300;
          color: rgba(203,213,225,0.85);
          line-height: 1.7;
          max-width: 480px;
          margin: 0 auto 40px;
          letter-spacing: 0.01em;
        }

        .btn-primary {
          background: linear-gradient(135deg, #d4af37 0%, #f0c84a 50%, #d4af37 100%);
          background-size: 200% 100%;
          color: #0a1628;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(212,175,55,0.35);
        }

        .btn-primary:hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212,175,55,0.45);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-top: 56px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #d4af37;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          color: rgba(148,163,184,0.8);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .section-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 700;
          color: #0a1628;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .step-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 36px 32px;
          border: 1px solid rgba(15,32,68,0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          cursor: default;
        }

        .step-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #d4af37, #f0c84a);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .step-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(10,22,40,0.12);
        }

        .step-card:hover::before {
          opacity: 1;
        }

        .step-number {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #d4af37, #f0c84a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
        }

        .step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #0a1628;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .step-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.7;
          font-weight: 400;
        }

        .step-icon {
          position: absolute;
          bottom: 20px;
          right: 24px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,200,74,0.05));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          opacity: 0.7;
          transition: opacity 0.3s, transform 0.3s;
        }

        .step-card:hover .step-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .connector-line {
          display: none;
        }

        @media (min-width: 768px) {
          .connector-line {
            display: block;
            position: absolute;
            top: 48px;
            left: calc(100% + 8px);
            width: calc(100% - 16px);
            height: 1px;
            background: linear-gradient(90deg, rgba(212,175,55,0.4), rgba(212,175,55,0.1));
            z-index: 1;
          }
        }
      `}</style>

      {/* Hero */}
      <div className="dashboard-hero py-28 px-6">
        <div className="hero-grid" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="hero-badge">
            <span>✦</span> Official Uniform Partner
          </div>
          <h1 className="hero-title">
            Your College.<br />
            <span>Official Uniforms.</span>
          </h1>
          <p className="hero-subtitle">
            Browse partner institutions, select verified uniform items, and get the perfect fit delivered to your door.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/colleges" className="btn-primary">
              Browse Colleges
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </Link>
            {!user && (
              <Link to="/register" className="btn-secondary">
                Create Account
              </Link>
            )}
          </div>

          <div className="stats-bar">
            {[['120+', 'Colleges'], ['5,000+', 'Uniforms'], ['48hr', 'Dispatch'], ['100%', 'Official']].map(([n, l]) => (
              <div className="stat-item" key={l}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="section-eyebrow">Simple Process</div>
          <h2 className="section-title">How it works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', position: 'relative' }}>
          {[
            { step: '01', title: 'Find Your College', desc: 'Browse our curated directory of partner colleges and accredited institutions nationwide.', icon: '🏛️' },
            { step: '02', title: 'Select Uniforms', desc: 'Choose from the full range of official uniform items approved for your institution.', icon: '👕' },
            { step: '03', title: 'Place Your Order', desc: 'Checkout securely with your preferred payment method and track every step of your delivery.', icon: '📦' }
          ].map((item, i) => (
            <div key={item.step} className="step-card">
              <div className="step-number">{item.step}</div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-desc">{item.desc}</p>
              <div className="step-icon">{item.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;