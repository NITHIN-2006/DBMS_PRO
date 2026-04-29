// SalesDashboard.jsx
// Install dependency: npm install recharts
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';

/* ─── Palette ─────────────────────────────────────────────────────── */
const COLLEGE_COLORS = [
  '#1e2761','#4a90d9','#22c55e','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6',
];

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: '#fef3c7' },
  paid:       { color: '#3b82f6', bg: '#dbeafe' },
  processing: { color: '#8b5cf6', bg: '#ede9fe' },
  shipped:    { color: '#6366f1', bg: '#e0e7ff' },
  delivered:  { color: '#22c55e', bg: '#dcfce7' },
  cancelled:  { color: '#ef4444', bg: '#fee2e2' },
};

/* ─── Custom Tooltip ──────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      {label && <p style={s.tooltipLabel}>{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} style={s.tooltipRow}>
          <span style={{ ...s.tooltipDot, background: entry.color || entry.fill }} />
          <span style={s.tooltipName}>{entry.name}</span>
          <span style={s.tooltipVal}>{prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Card ───────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color = '#1e2761', delay = 0 }) => (
  <div style={{ ...s.statCard, animationDelay: `${delay}ms` }} className="dash-anim">
    <div style={{ ...s.statAccent, background: color }} />
    <div style={s.statBody}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
      {sub && <p style={s.statSub}>{sub}</p>}
    </div>
  </div>
);

/* ─── Section wrapper ─────────────────────────────────────────────── */
const Section = ({ title, subtitle, children, delay = 0 }) => (
  <div style={{ ...s.section, animationDelay: `${delay}ms` }} className="dash-anim">
    <div style={s.sectionHead}>
      <div>
        <h3 style={s.sectionTitle}>{title}</h3>
        {subtitle && <p style={s.sectionSub}>{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────── */
const SalesDashboard = () => {
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [rangeFilter, setRangeFilter] = useState('all'); // all | 30 | 7

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [o, p, c] = await Promise.all([
        api.get('/orders/all'),
        api.get('/products'),
        api.get('/colleges'),
      ]);
      setOrders(o.data);
      setProducts(p.data);
      setColleges(c.data);
    } catch { /* silently fail — dashboard is read-only */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filter orders by date range ── */
  const filteredOrders = orders.filter(order => {
    if (rangeFilter === 'all') return true;
    const days = parseInt(rangeFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(order.created_at) >= cutoff;
  });

  /* ── KPI metrics ── */
  const totalRevenue  = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const totalOrders   = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  /* ── Revenue by college (bar chart) ── */
  const revenueByCollege = colleges.map((college, i) => {
    const collegeOrders = filteredOrders.filter(o =>
      o.items?.some(item => {
        const p = products.find(pr => pr.id === item.product_id);
        return p?.college_id === college.id;
      })
    );
    const revenue = collegeOrders.reduce((sum, o) => {
      const collegeItemsTotal = (o.items || []).reduce((s, item) => {
        const p = products.find(pr => pr.id === item.product_id);
        return p?.college_id === college.id
          ? s + parseFloat(item.price || 0) * (item.quantity || 1)
          : s;
      }, 0);
      return sum + collegeItemsTotal;
    }, 0);
    const units = collegeOrders.reduce((sum, o) =>
      sum + (o.items || []).filter(item => {
        const p = products.find(pr => pr.id === item.product_id);
        return p?.college_id === college.id;
      }).reduce((s, item) => s + (item.quantity || 1), 0), 0
    );
    return { name: college.name.length > 16 ? college.name.slice(0, 16) + '…' : college.name, fullName: college.name, revenue, units, color: COLLEGE_COLORS[i % COLLEGE_COLORS.length] };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  /* ── Sales by product (top 10) ── */
  const salesByProduct = products.map(product => {
    const units = filteredOrders.reduce((sum, o) =>
      sum + (o.items || []).filter(i => i.product_id === product.id)
            .reduce((s, i) => s + (i.quantity || 1), 0), 0
    );
    const revenue = filteredOrders.reduce((sum, o) =>
      sum + (o.items || []).filter(i => i.product_id === product.id)
            .reduce((s, i) => s + parseFloat(i.price || 0) * (i.quantity || 1), 0), 0
    );
    return { name: product.name.length > 18 ? product.name.slice(0, 18) + '…' : product.name, fullName: product.name, units, revenue, college: product.college_name };
  }).filter(p => p.units > 0).sort((a, b) => b.units - a.units).slice(0, 10);

  /* ── Orders by status (pie) ── */
  const statusData = Object.entries(
    filteredOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_META[status]?.color || '#94a3b8',
  }));

  /* ── Revenue over time (line chart — group by day) ── */
  const revenueOverTime = (() => {
    const map = {};
    filteredOrders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + parseFloat(o.total_amount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }));
  })();

  /* ── College share pie ── */
  const collegePieData = revenueByCollege.map((c, i) => ({
    name: c.name,
    value: parseFloat(c.revenue.toFixed(2)),
    color: c.color,
  }));

  if (loading) {
    return (
      <div style={s.loadWrap}>
        <div style={s.loadSpinner} />
        <p style={s.loadText}>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={s.page}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Sales Dashboard</h1>
            <p style={s.pageSubtitle}>Real-time overview of orders, revenue, and product performance</p>
          </div>
          <div style={s.rangeBar}>
            {[['all', 'All Time'], ['30', 'Last 30d'], ['7', 'Last 7d']].map(([val, label]) => (
              <button key={val} onClick={() => setRangeFilter(val)}
                style={{ ...s.rangeBtn, ...(rangeFilter === val ? s.rangeBtnActive : {}) }}
                className="range-btn">
                {label}
              </button>
            ))}
            <button onClick={fetchAll} style={s.refreshBtn} className="range-btn" title="Refresh">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={s.kpiGrid}>
          <StatCard label="Total Revenue"    value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub={`${totalOrders} orders`}         color="#1e2761" delay={0}   />
          <StatCard label="Orders Placed"    value={totalOrders}                                                                                        sub="across all colleges"               color="#4a90d9" delay={60}  />
          <StatCard label="Avg Order Value"  value={`$${avgOrderValue.toFixed(2)}`}                                                                     sub="per transaction"                   color="#22c55e" delay={120} />
          <StatCard label="Delivered"        value={deliveredOrders}                                                                                    sub={`${totalOrders ? Math.round(deliveredOrders/totalOrders*100) : 0}% completion rate`} color="#f59e0b" delay={180} />
        </div>

        {/* ── Revenue over time ── */}
        <Section title="Revenue Over Time" subtitle="Daily revenue trend across all colleges" delay={100}>
          {revenueOverTime.length === 0
            ? <EmptyChart />
            : <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e2761" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1e2761" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<ChartTooltip prefix="$" />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1e2761" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#1e2761', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#1e2761' }} />
                </AreaChart>
              </ResponsiveContainer>
          }
        </Section>

        {/* ── Revenue by College + Pie ── */}
        <div style={s.twoColSection}>
          <Section title="Revenue by College" subtitle="Which colleges drive the most sales" delay={150}>
            {revenueByCollege.length === 0
              ? <EmptyChart />
              : <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueByCollege} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<ChartTooltip prefix="$" />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                      {revenueByCollege.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Section>

          <Section title="Revenue Share" subtitle="College contribution breakdown" delay={200}>
            {collegePieData.length === 0
              ? <EmptyChart />
              : <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={collegePieData} cx="50%" cy="45%" innerRadius={65} outerRadius={100}
                      paddingAngle={3} dataKey="value" nameKey="name"
                      label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                      labelLine={false}>
                      {collegePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip prefix="$" />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(val) => <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'DM Sans' }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
            }
          </Section>
        </div>

        {/* ── Top Products + Order Status ── */}
        <div style={s.twoColSection}>
          <Section title="Top Products by Units Sold" subtitle="Best-performing uniform items" delay={250}>
            {salesByProduct.length === 0
              ? <EmptyChart />
              : <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByProduct} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#475569', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip suffix=" units" />} />
                    <Bar dataKey="units" name="Units Sold" fill="#4a90d9" radius={[0, 6, 6, 0]}>
                      {salesByProduct.map((_, i) => (
                        <Cell key={i} fill={`hsl(${215 + i * 8}, ${70 - i * 3}%, ${45 + i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Section>

          <Section title="Orders by Status" subtitle="Current order pipeline distribution" delay={300}>
            {statusData.length === 0
              ? <EmptyChart />
              : <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                        paddingAngle={2} label={({ name, percent }) => percent > 0.07 ? `${(percent*100).toFixed(0)}%` : ''}
                        labelLine={false}>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip suffix=" orders" />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={s.statusLegend}>
                    {statusData.map((item) => (
                      <div key={item.name} style={{ ...s.statusLegendItem, background: STATUS_META[item.name.toLowerCase()]?.bg || '#f1f5f9' }}>
                        <span style={{ ...s.statusLegendDot, background: item.color }} />
                        <span style={s.statusLegendName}>{item.name}</span>
                        <span style={{ ...s.statusLegendCount, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
            }
          </Section>
        </div>

        {/* ── Product Revenue Table ── */}
        <Section title="Product Revenue Breakdown" subtitle="Detailed revenue and units per product" delay={350}>
          {salesByProduct.length === 0
            ? <EmptyChart />
            : <div style={s.table}>
                <div style={s.tableHead}>
                  <span style={{ ...s.th, flex: 2 }}>Product</span>
                  <span style={s.th}>College</span>
                  <span style={{ ...s.th, textAlign: 'right' }}>Units Sold</span>
                  <span style={{ ...s.th, textAlign: 'right' }}>Revenue</span>
                  <span style={{ ...s.th, textAlign: 'right' }}>Avg Price</span>
                </div>
                {salesByProduct.map((p, i) => (
                  <div key={i} style={{ ...s.tableRow, background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <span style={{ ...s.td, flex: 2, fontWeight: 600, color: '#1a1a2e' }}>{p.fullName}</span>
                    <span style={s.td}>
                      <span style={s.collegePill}>{p.college}</span>
                    </span>
                    <span style={{ ...s.td, textAlign: 'right', fontWeight: 600, color: '#4a90d9' }}>{p.units}</span>
                    <span style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#1e2761' }}>${p.revenue.toFixed(2)}</span>
                    <span style={{ ...s.td, textAlign: 'right', color: '#64748b' }}>${p.units ? (p.revenue / p.units).toFixed(2) : '0.00'}</span>
                  </div>
                ))}
              </div>
          }
        </Section>

      </div>
    </>
  );
};

const EmptyChart = () => (
  <div style={s.emptyChart}>
    <svg width="36" height="36" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
    <p style={s.emptyChartText}>No data for selected range</p>
  </div>
);

/* ─── Global CSS ──────────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .dash-anim { animation: fadeSlideUp 0.45s ease both; }

  .range-btn:hover { background: #f1f5f9 !important; color: #1e2761 !important; }
`;

/* ─── Styles ──────────────────────────────────────────────────────── */
const s = {
  page: {
    maxWidth: 1140,
    margin: '0 auto',
    padding: '40px 24px 80px',
    fontFamily: '"DM Sans", sans-serif',
    background: '#f8f9fc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
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
  rangeBar: {
    display: 'flex',
    gap: 4,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 4,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  rangeBtn: {
    padding: '7px 14px',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: '#64748b',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: '"DM Sans", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  rangeBtnActive: {
    background: '#1e2761',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(30,39,97,0.25)',
  },
  refreshBtn: {
    padding: '7px 10px',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    fontFamily: '"DM Sans", sans-serif',
  },

  /* KPI */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: 16,
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statAccent: {
    width: 5,
    flexShrink: 0,
  },
  statBody: {
    padding: '16px 18px',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    margin: '6px 0 4px',
    lineHeight: 1,
  },
  statSub: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0,
    fontWeight: 400,
  },

  /* Sections */
  section: {
    background: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: 18,
    padding: '22px 22px 18px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  sectionHead: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  sectionSub: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '4px 0 0',
    fontWeight: 400,
  },
  twoColSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 0,
  },

  /* Tooltip */
  tooltip: {
    background: '#1a1a2e',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    minWidth: 140,
  },
  tooltipLabel: {
    fontSize: 11,
    color: '#94a3b8',
    margin: '0 0 6px',
    fontWeight: 500,
    letterSpacing: '0.03em',
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  tooltipDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  tooltipName: {
    fontSize: 12,
    color: '#cbd5e1',
    flex: 1,
  },
  tooltipVal: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ffffff',
  },

  /* Status legend */
  statusLegend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
  },
  statusLegendDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusLegendName: {
    color: '#374151',
    fontWeight: 500,
  },
  statusLegendCount: {
    fontWeight: 700,
    fontSize: 13,
  },

  /* Table */
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
  },
  tableHead: {
    display: 'flex',
    padding: '10px 16px',
    background: '#1e2761',
    gap: 12,
  },
  th: {
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tableRow: {
    display: 'flex',
    padding: '11px 16px',
    gap: 12,
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
  },
  td: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  collegePill: {
    background: '#eff6ff',
    color: '#1e2761',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
  },

  /* Empty */
  emptyChart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '40px 20px',
    color: '#cbd5e1',
  },
  emptyChartText: {
    fontSize: 13,
    color: '#94a3b8',
    margin: 0,
    fontWeight: 500,
  },

  /* Loading */
  loadWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: 16,
    fontFamily: '"DM Sans", sans-serif',
  },
  loadSpinner: {
    width: 36,
    height: 36,
    border: '3px solid #e2e8f0',
    borderTopColor: '#1e2761',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadText: {
    fontSize: 14,
    color: '#94a3b8',
    margin: 0,
    fontWeight: 500,
  },
};

export default SalesDashboard;