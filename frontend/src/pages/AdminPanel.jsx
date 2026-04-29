import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import SalesDashboard from './SalesDashboard.jsx';

const STATUS_META = {
  pending:    { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  paid:       { color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  processing: { color: '#5b21b6', bg: '#ede9fe', dot: '#8b5cf6' },
  shipped:    { color: '#1e3a5f', bg: '#e0e7ff', dot: '#6366f1' },
  delivered:  { color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
  cancelled:  { color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444' },
};

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const TABS = ['Colleges', 'Products', 'Orders', 'Dashboard'];

const TAB_ICONS = {
  Colleges: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Products: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  Orders: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  Dashboard: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
};

const AdminPanel = () => {
  const [activeTab, setActiveTab]       = useState('Colleges');
  const [colleges, setColleges]         = useState([]);
  const [products, setProducts]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [categories, setCategories]     = useState([]);
  const [collegeForm, setCollegeForm]   = useState({ name: '', location: '', image: null });
  const [editingCollege, setEditingCollege] = useState(null);
  const [productForm, setProductForm]   = useState({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading]           = useState(false);

  const fetchColleges   = async () => { const { data } = await api.get('/colleges'); setColleges(data); };
  const fetchProducts   = async () => { const { data } = await api.get('/products'); setProducts(data); };
  const fetchOrders     = async () => { const { data } = await api.get('/orders/all'); setOrders(data); };
  const fetchCategories = async () => { const { data } = await api.get('/products/categories'); setCategories(data); };

  useEffect(() => {
    fetchColleges(); fetchProducts(); fetchOrders(); fetchCategories();
  }, []);

  const handleCollegeSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData();
    fd.append('name', collegeForm.name);
    fd.append('location', collegeForm.location);
    if (collegeForm.image) fd.append('image', collegeForm.image);
    try {
      if (editingCollege) { await api.put(`/colleges/${editingCollege.id}`, fd); toast.success('College updated'); }
      else                { await api.post('/colleges', fd); toast.success('College created'); }
      setCollegeForm({ name: '', location: '', image: null });
      setEditingCollege(null);
      fetchColleges();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save college'); }
    finally { setLoading(false); }
  };

  const handleDeleteCollege = async (id) => {
    if (!confirm('Delete this college?')) return;
    try { await api.delete(`/colleges/${id}`); toast.success('College deleted'); fetchColleges(); }
    catch { toast.error('Failed to delete college'); }
  };

  const startEditCollege = (college) => {
    setEditingCollege(college);
    setCollegeForm({ name: college.name, location: college.location || '', image: null });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData();
    Object.entries(productForm).forEach(([k, v]) => {
      if (k === 'image') { if (v) fd.append('image', v); } else fd.append(k, v);
    });
    try {
      if (editingProduct) { await api.put(`/products/${editingProduct.id}`, fd); toast.success('Product updated'); }
      else                { await api.post('/products', fd); toast.success('Product created'); }
      setProductForm({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete product'); }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      college_id: product.college_id, category_id: product.category_id,
      name: product.name, description: product.description || '',
      price: product.price, stock: product.stock, image: null,
    });
  };

  const handleOrderStatus = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}/status`, { status }); toast.success('Status updated'); fetchOrders(); }
    catch { toast.error('Failed to update status'); }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={s.page}>

        {/* ── Page Header ── */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Admin Panel</h1>
            <p style={s.pageSubtitle}>Manage your platform from one place</p>
          </div>
          <div style={s.statPills}>
            <div style={s.statPill}><span style={s.statNum}>{colleges.length}</span><span style={s.statLbl}>Colleges</span></div>
            <div style={s.statPill}><span style={s.statNum}>{products.length}</span><span style={s.statLbl}>Products</span></div>
            <div style={s.statPill}><span style={s.statNum}>{orders.length}</span><span style={s.statLbl}>Orders</span></div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={s.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabBtnActive : {}) }}
              className="tab-btn"
            >
              <span style={{ ...s.tabIcon, ...(activeTab === tab ? s.tabIconActive : {}) }}>
                {TAB_ICONS[tab]}
              </span>
              {tab}
              {tab === 'Orders' && orders.length > 0 && (
                <span style={{ ...s.tabBadge, ...(activeTab === tab ? s.tabBadgeActive : {}) }}>
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── COLLEGES TAB ── */}
        {activeTab === 'Colleges' && (
          <div style={s.twoCol}>
            <div>
              <SectionHeading>{editingCollege ? 'Edit College' : 'Add New College'}</SectionHeading>
              <form onSubmit={handleCollegeSubmit} style={s.formCard}>
                <Field label="College Name">
                  <input style={s.input} value={collegeForm.name}
                    onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                    required placeholder="e.g. St. Xavier's College" className="admin-input" />
                </Field>
                <Field label="Location">
                  <input style={s.input} value={collegeForm.location}
                    onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                    placeholder="City, State" className="admin-input" />
                </Field>
                <Field label="College Image">
                  <label style={s.fileLabel} className="file-label">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {collegeForm.image ? collegeForm.image.name : 'Upload image'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => setCollegeForm({ ...collegeForm, image: e.target.files[0] })} />
                  </label>
                </Field>
                <div style={s.formActions}>
                  <button type="submit" disabled={loading} style={s.btnPrimary} className="btn-primary-admin">
                    {loading ? <><Spinner /> Saving…</> : editingCollege ? 'Update College' : 'Add College'}
                  </button>
                  {editingCollege && (
                    <button type="button" style={s.btnSecondary} className="btn-secondary-admin"
                      onClick={() => { setEditingCollege(null); setCollegeForm({ name: '', location: '', image: null }); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <SectionHeading>All Colleges <Count>{colleges.length}</Count></SectionHeading>
              <div style={s.listScroll}>
                {colleges.length === 0 && <EmptyState label="No colleges yet" />}
                {colleges.map((college, i) => (
                  <div key={college.id} style={{ ...s.listCard, animationDelay: `${i * 40}ms` }} className="list-card-anim">
                    <div style={s.listCardAvatar}>
                      {college.image_url
                        ? <img src={college.image_url} alt={college.name} style={s.avatarImg} />
                        : <span style={s.avatarLetter}>{college.name[0]}</span>}
                    </div>
                    <div style={s.listCardBody}>
                      <p style={s.listCardTitle}>{college.name}</p>
                      {college.location && <p style={s.listCardSub}>{college.location}</p>}
                    </div>
                    <div style={s.listCardActions}>
                      <button onClick={() => startEditCollege(college)} style={s.editBtn} className="action-edit">Edit</button>
                      <button onClick={() => handleDeleteCollege(college.id)} style={s.deleteBtn} className="action-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'Products' && (
          <div style={s.twoCol}>
            <div>
              <SectionHeading>{editingProduct ? 'Edit Product' : 'Add New Product'}</SectionHeading>
              <form onSubmit={handleProductSubmit} style={s.formCard}>
                <Field label="College">
                  <select style={s.input} value={productForm.college_id}
                    onChange={(e) => setProductForm({ ...productForm, college_id: e.target.value })}
                    required className="admin-input">
                    <option value="">Select a college</option>
                    {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select style={s.input} value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    required className="admin-input">
                    <option value="">Select a category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Product Name">
                  <input style={s.input} value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required placeholder="e.g. Cotton Shirt" className="admin-input" />
                </Field>
                <Field label="Description">
                  <textarea style={{ ...s.input, resize: 'vertical', minHeight: 72 }} rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Optional description" className="admin-input" />
                </Field>
                <div style={s.fieldRow}>
                  <Field label="Price ($)">
                    <input type="number" step="0.01" min="0" style={s.input}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required placeholder="0.00" className="admin-input" />
                  </Field>
                  <Field label="Stock">
                    <input type="number" min="0" style={s.input}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="0" className="admin-input" />
                  </Field>
                </div>
                <Field label="Product Image">
                  <label style={s.fileLabel} className="file-label">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {productForm.image ? productForm.image.name : 'Upload image'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })} />
                  </label>
                </Field>
                <div style={s.formActions}>
                  <button type="submit" disabled={loading} style={s.btnPrimary} className="btn-primary-admin">
                    {loading ? <><Spinner /> Saving…</> : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button type="button" style={s.btnSecondary} className="btn-secondary-admin"
                      onClick={() => { setEditingProduct(null); setProductForm({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null }); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <SectionHeading>All Products <Count>{products.length}</Count></SectionHeading>
              <div style={s.listScroll}>
                {products.length === 0 && <EmptyState label="No products yet" />}
                {products.map((product, i) => (
                  <div key={product.id} style={{ ...s.listCard, animationDelay: `${i * 40}ms` }} className="list-card-anim">
                    <div style={s.listCardAvatar}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} style={s.avatarImg} />
                        : <span style={s.avatarLetter}>{product.name[0]}</span>}
                    </div>
                    <div style={{ ...s.listCardBody, minWidth: 0 }}>
                      <p style={s.listCardTitle}>{product.name}</p>
                      <p style={s.listCardSub}>{product.college_name} · {product.category_name}</p>
                      <div style={s.productMeta}>
                        <span style={s.priceTag}>${parseFloat(product.price).toFixed(2)}</span>
                        <span style={s.stockTag}>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div style={s.listCardActions}>
                      <button onClick={() => startEditProduct(product)} style={s.editBtn} className="action-edit">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={s.deleteBtn} className="action-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'Orders' && (
          <div>
            <SectionHeading>All Orders <Count>{orders.length}</Count></SectionHeading>
            <div style={s.ordersList}>
              {orders.length === 0 && <EmptyState label="No orders yet" />}
              {orders.map((order, i) => {
                const meta = STATUS_META[order.status] || STATUS_META.pending;
                return (
                  <div key={order.id} style={{ ...s.orderCard, animationDelay: `${i * 50}ms` }} className="list-card-anim">
                    <div style={s.orderHeader}>
                      <div style={s.orderHeaderLeft}>
                        <div style={s.orderNumRow}>
                          <span style={s.orderNum}>Order #{order.id}</span>
                          <span style={{ ...s.statusBadge, color: meta.color, background: meta.bg }}>
                            <span style={{ ...s.statusDot, background: meta.dot }} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p style={s.orderMeta}>
                          {order.user_name}
                          <span style={s.orderMetaDivider}>·</span>
                          {order.user_email}
                          <span style={s.orderMetaDivider}>·</span>
                          {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div style={s.orderTotal}>
                        <span style={s.orderTotalLabel}>Total</span>
                        <span style={s.orderTotalValue}>${parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {order.items?.length > 0 && (
                      <div style={s.orderItems}>
                        {order.items.map((item) => (
                          <div key={item.id} style={s.orderItem}>
                            <span style={s.orderItemName}>{item.product_name}</span>
                            <span style={s.orderItemQty}>×{item.quantity}</span>
                            <span style={s.orderItemPrice}>${parseFloat(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={s.orderFooter}>
                      <label style={s.statusLabel}>Update status</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                        style={s.statusSelect}
                        className="admin-input"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'Dashboard' && (
          <SalesDashboard />
        )}

      </div>
    </>
  );
};

/* ─── Helper Components ───────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={s.label}>{label}</label>
    {children}
  </div>
);

const SectionHeading = ({ children }) => (
  <h2 style={s.sectionHeading}>{children}</h2>
);

const Count = ({ children }) => (
  <span style={s.countBadge}>{children}</span>
);

const EmptyState = ({ label }) => (
  <div style={s.emptyState}>
    <svg width="32" height="32" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <p style={s.emptyLabel}>{label}</p>
  </div>
);

const Spinner = () => <span style={s.spinner} />;

/* ─── Global CSS ──────────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600&display=swap');

  * { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .list-card-anim { animation: fadeSlideUp 0.35s ease both; }
  .tab-btn:hover { background: #f1f5f9 !important; color: #1e2761 !important; }

  .admin-input:focus {
    outline: none;
    border-color: #4a90d9 !important;
    box-shadow: 0 0 0 3px rgba(74,144,217,0.15) !important;
    background: #fff !important;
  }
  .file-label:hover {
    border-color: #4a90d9 !important;
    background: #eff6ff !important;
    color: #1e2761 !important;
  }
  .btn-primary-admin:hover:not(:disabled) {
    background: #162057 !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(30,39,97,0.35) !important;
  }
  .btn-secondary-admin:hover { background: #f1f5f9 !important; }
  .action-edit:hover   { background: #eff6ff !important; color: #1d4ed8 !important; }
  .action-delete:hover { background: #fef2f2 !important; color: #dc2626 !important; }
`;

/* ─── Styles ──────────────────────────────────────────────────────── */
const s = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px 80px',
    fontFamily: '"DM Sans", sans-serif',
    background: '#f8f9fc',
    minHeight: '100vh',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 36,
  },
  pageTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 34,
    fontWeight: 600,
    color: '#1a1a2e',
    margin: 0,
    lineHeight: 1.1,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '6px 0 0',
    fontWeight: 400,
  },
  statPills: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  statPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: '10px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    minWidth: 72,
  },
  statNum: { fontSize: 22, fontWeight: 700, color: '#1e2761', lineHeight: 1, letterSpacing: '-0.03em' },
  statLbl: { fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 3, letterSpacing: '0.04em', textTransform: 'uppercase' },
  tabBar: {
    display: 'flex',
    gap: 4,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 5,
    marginBottom: 32,
    width: 'fit-content',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 18px',
    border: 'none',
    borderRadius: 10,
    background: 'transparent',
    color: '#64748b',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  tabBtnActive: { background: '#1e2761', color: '#ffffff', boxShadow: '0 3px 10px rgba(30,39,97,0.25)' },
  tabIcon: { opacity: 0.6, display: 'flex' },
  tabIconActive: { opacity: 1 },
  tabBadge: { background: '#e2e8f0', color: '#475569', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px', marginLeft: 2 },
  tabBadgeActive: { background: 'rgba(255,255,255,0.25)', color: '#ffffff' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' },
  sectionHeading: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' },
  countBadge: { fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f1f5f9', borderRadius: 20, padding: '2px 9px' },
  formCard: {
    background: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: 20,
    padding: '22px 22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: '0.01em' },
  input: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '10px 13px',
    fontSize: 14,
    fontFamily: '"DM Sans", sans-serif',
    color: '#1a1a2e',
    background: '#f8fafc',
    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1.5px dashed #cbd5e1',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#64748b',
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.18s',
    background: '#f8fafc',
  },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formActions: { display: 'flex', gap: 10, paddingTop: 4 },
  btnPrimary: {
    background: '#1e2761',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '11px 22px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 3px 12px rgba(30,39,97,0.22)',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  btnSecondary: {
    background: '#ffffff',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  spinner: {
    display: 'inline-block',
    width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  listScroll: { display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 540, overflowY: 'auto', paddingRight: 2 },
  listCard: {
    background: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: 14,
    padding: '13px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.18s',
  },
  listCardAvatar: {
    width: 44, height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e0e7ff',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarLetter: { fontSize: 17, fontWeight: 700, color: '#1e2761', textTransform: 'uppercase' },
  listCardBody: { flex: 1, minWidth: 0 },
  listCardTitle: { fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listCardSub: { fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontWeight: 400 },
  productMeta: { display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' },
  priceTag: { fontSize: 12, fontWeight: 700, color: '#1e2761', background: '#eff6ff', borderRadius: 6, padding: '2px 8px' },
  stockTag: { fontSize: 11, color: '#64748b', fontWeight: 500 },
  listCardActions: { display: 'flex', gap: 6, flexShrink: 0 },
  editBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.15s' },
  deleteBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.15s' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', background: '#ffffff', borderRadius: 14, border: '1px dashed #e2e8f0' },
  emptyLabel: { fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 14 },
  orderCard: { background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 18, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' },
  orderHeaderLeft: { flex: 1, minWidth: 0 },
  orderNumRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 },
  orderNum: { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'capitalize' },
  statusDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  orderMeta: { fontSize: 12, color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  orderMetaDivider: { color: '#cbd5e1', fontWeight: 300 },
  orderTotal: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 },
  orderTotalLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' },
  orderTotalValue: { fontSize: 20, fontWeight: 700, color: '#1e2761', letterSpacing: '-0.03em', lineHeight: 1.2 },
  orderItems: { background: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid #f1f5f9' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 },
  orderItemName: { flex: 1, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  orderItemQty: { color: '#94a3b8', fontWeight: 500, flexShrink: 0 },
  orderItemPrice: { color: '#1e2761', fontWeight: 700, flexShrink: 0 },
  orderFooter: { display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 14, flexWrap: 'wrap' },
  statusLabel: { fontSize: 13, fontWeight: 600, color: '#475569' },
  statusSelect: { border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '7px 12px', fontSize: 13, fontFamily: '"DM Sans", sans-serif', color: '#1a1a2e', background: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.18s, box-shadow 0.18s' },
};

export default AdminPanel;