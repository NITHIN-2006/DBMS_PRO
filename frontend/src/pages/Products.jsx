import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { collegeId } = useParams();
  const [products, setProducts] = useState([]);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, collegeRes] = await Promise.all([
          api.get(`/products/college/${collegeId}`),
          api.get(`/colleges/${collegeId}`)
        ]);
        setProducts(productRes.data);
        setCollege(collegeRes.data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collegeId]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .products-header {
          background: linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #0d1f3c 100%);
          position: relative;
          overflow: hidden;
          padding: 48px 24px 56px;
        }

        .products-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 90% 50%, rgba(212,175,55,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 5% 20%, rgba(59,130,246,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        .products-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .products-header-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
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
          margin-bottom: 18px;
        }

        .products-college-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .products-college-meta {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .products-location {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 300;
          color: rgba(203,213,225,0.75);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .products-count-badge {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: #d4af37;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.2);
          padding: 3px 10px;
          border-radius: 100px;
          letter-spacing: 0.05em;
        }

        .products-grid-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 44px 24px 64px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 22px;
        }

        @media (min-width: 500px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 800px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1100px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .product-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(15,32,68,0.08);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }

        .product-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          border: 1.5px solid transparent;
          transition: border-color 0.3s;
          pointer-events: none;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(10,22,40,0.12);
        }

        .product-card:hover::after {
          border-color: rgba(212,175,55,0.3);
        }

        .product-img-wrap {
          height: 190px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #0f2044, #162a52);
          flex-shrink: 0;
        }

        .product-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .product-card:hover .product-img-wrap img {
          transform: scale(1.06);
        }

        .product-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #0a1628 0%, #162a52 100%);
          position: relative;
        }

        .product-no-image::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 70% at 60% 30%, rgba(212,175,55,0.08), transparent);
        }

        .product-no-image-icon {
          font-size: 2rem;
          opacity: 0.35;
          position: relative;
          z-index: 1;
        }

        .product-no-image-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          color: rgba(212,175,55,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .stock-pill {
          position: absolute;
          top: 12px;
          right: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          border-radius: 100px;
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .stock-pill.in-stock {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #10b981;
        }

        .stock-pill.out-of-stock {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
        }

        .product-body {
          padding: 18px 18px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-category {
          font-family: 'DM Sans', sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 6px;
        }

        .product-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0a1628;
          letter-spacing: -0.01em;
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .product-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.775rem;
          color: #94a3b8;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .product-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .product-price {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #0a1628;
          letter-spacing: -0.02em;
        }

        .product-stock-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          color: #cbd5e1;
          font-weight: 400;
        }

        .btn-add-cart {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .btn-add-cart.available {
          background: linear-gradient(135deg, #0a1628 0%, #0f2044 100%);
          color: #d4af37;
          box-shadow: 0 3px 12px rgba(10,22,40,0.18);
        }

        .btn-add-cart.available:hover {
          background: linear-gradient(135deg, #d4af37 0%, #f0c84a 100%);
          color: #0a1628;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,175,55,0.3);
        }

        .btn-add-cart.unavailable {
          background: #f1f5f9;
          color: #cbd5e1;
          cursor: not-allowed;
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

        .empty-state {
          text-align: center;
          padding: 80px 24px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.35;
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
      `}</style>

      {/* Header */}
      <div className="products-header">
        <div className="products-header-inner">
          <div className="header-eyebrow">✦ Official Uniforms</div>
          <h1 className="products-college-name">
            {college ? college.name : 'Uniforms'}
          </h1>
          <div className="products-college-meta">
            {college?.location && (
              <div className="products-location">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {college.location}
              </div>
            )}
            {!loading && products.length > 0 && (
              <div className="products-count-badge">
                {products.length} item{products.length !== 1 ? 's' : ''} available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="products-grid-wrap">
        {loading ? (
          <div className="loading-wrap">
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <div className="loading-text">Loading uniforms…</div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👕</div>
            <div className="empty-text">No uniforms yet</div>
            <div className="empty-sub">No uniform items are available for this college yet.</div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-img-wrap">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-no-image">
                      <div className="product-no-image-icon">👕</div>
                      <div className="product-no-image-text">No image</div>
                    </div>
                  )}
                  <div className={`stock-pill ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                  </div>
                </div>

                <div className="product-body">
                  {product.category_name && (
                    <div className="product-category">{product.category_name}</div>
                  )}
                  <div className="product-name">{product.name}</div>
                  {product.description && (
                    <div className="product-desc">{product.description}</div>
                  )}
                  <div className="product-footer">
                    <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`btn-add-cart ${product.stock === 0 ? 'unavailable' : 'available'}`}
                  >
                    {product.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;