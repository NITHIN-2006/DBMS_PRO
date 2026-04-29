import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const cardElementOptions = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1a1a2e',
      fontFamily: '"DM Sans", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#e11d48', iconColor: '#e11d48' },
  },
};

const CheckoutForm = ({ clientSecret, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) { toast.error(error.message); return; }
      if (paymentIntent.status === 'succeeded') {
        await api.post('/orders/confirm-payment', {
          order_id: orderId,
          payment_intent_id: paymentIntent.id,
        });
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} style={styles.payForm}>
      <div style={styles.cardFieldWrap}>
        <CardElement options={cardElementOptions} />
      </div>
      <p style={styles.testCardNote}>
        Test card: <strong>4242 4242 4242 4242</strong> · Any future date · Any CVC
      </p>
      <button
        type="submit"
        disabled={processing || !stripe}
        style={{
          ...styles.payBtn,
          ...(processing ? styles.payBtnDisabled : {}),
        }}
      >
        <span style={styles.payBtnInner}>
          {processing ? (
            <>
              <span style={styles.spinner} />
              Processing…
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay Now
            </>
          )}
        </span>
      </button>
    </form>
  );
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const items = cart.map((item) => ({ product_id: item.id, quantity: item.quantity }));
      const { data } = await api.post('/orders', { items });
      setCheckoutData({ clientSecret: data.client_secret, orderId: data.order_id });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.emptyWrap}>
          <div style={styles.emptyIcon}>
            <svg width="52" height="52" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 style={styles.emptyTitle}>Your cart is empty</h1>
          <p style={styles.emptyText}>Looks like you haven't added any uniforms yet.</p>
          <button onClick={() => navigate('/')} style={styles.browseBtn}>Browse Products</button>
        </div>
      </>
    );
  }

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Your Cart</h1>
            <p style={styles.subtitle}>{itemCount} item{itemCount !== 1 ? 's' : ''} ready to order</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
          >
            ← Continue Shopping
          </button>
        </div>

        <div style={styles.grid}>
          {/* Cart Items */}
          <div style={styles.itemsCol}>
            {cart.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  ...styles.cartCard,
                  animationDelay: `${idx * 60}ms`,
                }}
                className="cart-card-anim"
              >
                {/* Product image */}
                <div style={styles.imgWrap}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={styles.img} />
                  ) : (
                    <div style={styles.imgPlaceholder}>
                      <svg width="24" height="24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)} each</p>

                  <div style={styles.qtyRow}>
                    <div style={styles.qtyControl}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.qtyBtn}
                        className="qty-btn"
                      >−</button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.qtyBtn}
                        className="qty-btn"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={styles.removeBtn}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div style={styles.itemTotal}>
                  <span style={styles.itemTotalLabel}>Total</span>
                  <span style={styles.itemTotalValue}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Order Summary */}
            <div style={styles.summaryCard}>
              <h2 style={styles.sectionTitle}>Order Summary</h2>

              <div style={styles.summaryLines}>
                {cart.map((item) => (
                  <div key={item.id} style={styles.summaryLine}>
                    <span style={styles.summaryItemName}>{item.name} × {item.quantity}</span>
                    <span style={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>${total.toFixed(2)}</span>
              </div>

              {!checkoutData && (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ ...styles.checkoutBtn, ...(loading ? styles.checkoutBtnDisabled : {}) }}
                  className="checkout-btn"
                >
                  {loading ? (
                    <><span style={styles.spinner} /> Preparing order…</>
                  ) : (
                    <>Proceed to Payment →</>
                  )}
                </button>
              )}
            </div>

            {/* Payment Panel */}
            {checkoutData && (
              <div style={styles.paymentCard} className="payment-card-anim">
                <div style={styles.paymentHeader}>
                  <div style={styles.paymentIconWrap}>
                    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <h2 style={styles.paymentTitle}>Secure Payment</h2>
                </div>
                <p style={styles.paymentSubtitle}>Your payment is encrypted and secure</p>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    clientSecret={checkoutData.clientSecret}
                    orderId={checkoutData.orderId}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}

            {/* Trust badges */}
            <div style={styles.trustRow}>
              {['SSL Secured', 'Stripe Payments', 'Easy Returns'].map((label) => (
                <div key={label} style={styles.trustBadge}>
                  <span style={styles.trustDot} />
                  <span style={styles.trustLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Styles ────────────────────────────────────────────────────────────── */

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600&display=swap');

  * { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .cart-card-anim {
    animation: fadeSlideUp 0.4s ease both;
  }
  .payment-card-anim {
    animation: fadeSlideUp 0.35s ease both;
  }

  .qty-btn:hover {
    background: #1e2761 !important;
    color: white !important;
    border-color: #1e2761 !important;
  }
  .remove-btn:hover {
    color: #dc2626 !important;
    background: #fef2f2 !important;
  }
  .checkout-btn:hover:not(:disabled) {
    background: #162057 !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(30,39,97,0.35) !important;
  }
`;

const styles = {
  page: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '40px 24px 80px',
    fontFamily: '"DM Sans", sans-serif',
    background: '#f8f9fc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 36,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 36,
    fontWeight: 600,
    color: '#1a1a2e',
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '6px 0 0',
    fontWeight: 400,
  },
  backBtn: {
    background: 'none',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '9px 18px',
    fontSize: 13,
    fontFamily: '"DM Sans", sans-serif',
    color: '#475569',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 28,
    alignItems: 'start',
  },
  itemsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  cartCard: {
    background: '#ffffff',
    borderRadius: 18,
    border: '1px solid #f1f5f9',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  imgWrap: {
    width: 84,
    height: 84,
    borderRadius: 14,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemPrice: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '0 0 12px',
    fontWeight: 400,
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#f8fafc',
  },
  qtyBtn: {
    width: 34,
    height: 34,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: '"DM Sans", sans-serif',
  },
  qtyNum: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a2e',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    lineHeight: '34px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 8,
    transition: 'all 0.15s',
    fontFamily: '"DM Sans", sans-serif',
    letterSpacing: '0.01em',
  },
  itemTotal: {
    textAlign: 'right',
    flexShrink: 0,
  },
  itemTotalLabel: {
    display: 'block',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemTotalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a2e',
    letterSpacing: '-0.02em',
  },

  /* Sidebar */
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'sticky',
    top: 24,
  },
  summaryCard: {
    background: '#ffffff',
    borderRadius: 20,
    border: '1px solid #f1f5f9',
    padding: '24px 22px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 16px',
    letterSpacing: '-0.01em',
  },
  summaryLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  summaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 400,
    flex: 1,
    marginRight: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  summaryItemPrice: {
    fontSize: 13,
    color: '#475569',
    fontWeight: 500,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
    margin: '14px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a2e',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e2761',
    letterSpacing: '-0.03em',
  },
  checkoutBtn: {
    width: '100%',
    background: '#1e2761',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(30,39,97,0.25)',
    letterSpacing: '-0.01em',
  },
  checkoutBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  /* Payment card */
  paymentCard: {
    background: '#ffffff',
    borderRadius: 20,
    border: '1px solid #f1f5f9',
    padding: '22px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  paymentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #1e2761, #4a90d9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '0 0 18px',
    fontWeight: 400,
  },
  payForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardFieldWrap: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    padding: '14px 14px',
    background: '#f8fafc',
    transition: 'border-color 0.2s',
  },
  testCardNote: {
    fontSize: 11,
    color: '#94a3b8',
    margin: 0,
    background: '#f8fafc',
    borderRadius: 8,
    padding: '8px 12px',
    border: '1px dashed #e2e8f0',
    lineHeight: 1.6,
  },
  payBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #1e2761 0%, #4a90d9 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(74,144,217,0.35)',
    transition: 'all 0.2s',
    letterSpacing: '-0.01em',
  },
  payBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  payBtnInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 15,
    height: 15,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  /* Trust badges */
  trustRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px 18px',
    background: '#f8fafc',
    borderRadius: 14,
    border: '1px solid #f1f5f9',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  trustDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
    flexShrink: 0,
  },
  trustLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
  },

  /* Empty state */
  emptyWrap: {
    maxWidth: 400,
    margin: '100px auto',
    textAlign: 'center',
    fontFamily: '"DM Sans", sans-serif',
    padding: '0 24px',
  },
  emptyIcon: {
    width: 96,
    height: 96,
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  emptyTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 28,
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 10px',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    margin: '0 0 28px',
    fontWeight: 400,
  },
  browseBtn: {
    background: '#1e2761',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '13px 28px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(30,39,97,0.25)',
  },
};

export default Cart;