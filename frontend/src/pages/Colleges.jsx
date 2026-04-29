import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/colleges');
        setColleges(data);
      } catch {
        toast.error('Failed to load colleges');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .colleges-header {
          background: linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #0d1f3c 100%);
          position: relative;
          overflow: hidden;
          padding: 56px 24px 64px;
        }

        .colleges-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 90% 50%, rgba(212,175,55,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 5% 20%, rgba(59,130,246,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        .colleges-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .header-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        .header-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #d4af37;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.25);
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .header-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .header-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          color: rgba(203,213,225,0.75);
          letter-spacing: 0.01em;
        }

        .colleges-grid-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 64px;
        }

        .college-card {
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(15,32,68,0.08);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          position: relative;
        }

        .college-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1.5px solid transparent;
          transition: border-color 0.3s;
          pointer-events: none;
        }

        .college-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 24px 56px rgba(10,22,40,0.13);
        }

        .college-card:hover::after {
          border-color: rgba(212,175,55,0.35);
        }

        .college-img-wrap {
          height: 180px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #0f2044, #162a52);
        }

        .college-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .college-card:hover .college-img-wrap img {
          transform: scale(1.08);
        }

        .college-initial {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          color: #d4af37;
          background: linear-gradient(135deg, #0a1628 0%, #162a52 100%);
          letter-spacing: -0.02em;
          position: relative;
        }

        .college-initial::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 70% at 60% 30%, rgba(212,175,55,0.12), transparent);
        }

        .college-img-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(10,22,40,0.5), transparent);
        }

        .college-body {
          padding: 22px 24px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .college-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0a1628;
          letter-spacing: -0.01em;
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .college-location {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .college-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
          padding-top: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #d4af37;
          transition: gap 0.2s;
        }

        .college-card:hover .college-cta {
          gap: 10px;
        }

        .college-cta-arrow {
          transition: transform 0.2s;
        }

        .college-card:hover .college-cta-arrow {
          transform: translateX(3px);
        }

        .empty-state {
          text-align: center;
          padding: 80px 24px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.4;
        }

        .empty-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #0a1628;
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        .empty-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          gap: 16px;
        }

        .loading-dots {
          display: flex;
          gap: 8px;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4af37;
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }

        .loading-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .colleges-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
        }

        @media (min-width: 560px) {
          .colleges-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 900px) {
          .colleges-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Header */}
      <div className="colleges-header">
        <div className="header-inner">
          <div className="header-eyebrow">✦ Partner Institutions</div>
          <h1 className="header-title">Browse Colleges</h1>
          <p className="header-subtitle">Select a college to view and order official uniforms</p>
        </div>
      </div>

      {/* Content */}
      <div className="colleges-grid-wrap">
        {loading ? (
          <div className="loading-wrap">
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <div className="loading-text">Loading colleges…</div>
          </div>
        ) : colleges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <div className="empty-text">No colleges yet</div>
            <div className="empty-sub">Partner institutions will appear here once added.</div>
          </div>
        ) : (
          <div className="colleges-grid">
            {colleges.map((college) => (
              <Link
                key={college.id}
                to={`/colleges/${college.id}/products`}
                className="college-card"
              >
                <div className="college-img-wrap">
                  {college.image_url ? (
                    <>
                      <img src={college.image_url} alt={college.name} />
                      <div className="college-img-overlay" />
                    </>
                  ) : (
                    <div className="college-initial">
                      {college.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="college-body">
                  <div className="college-name">{college.name}</div>
                  {college.location && (
                    <div className="college-location">
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      {college.location}
                    </div>
                  )}
                  <div className="college-cta">
                    View Uniforms
                    <svg className="college-cta-arrow" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;