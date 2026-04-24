import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const TABS = ['Colleges', 'Products', 'Orders'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Colleges');
  const [colleges, setColleges] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);

  const [collegeForm, setCollegeForm] = useState({ name: '', location: '', image: null });
  const [editingCollege, setEditingCollege] = useState(null);

  const [productForm, setProductForm] = useState({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null });
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(false);

  const fetchColleges = async () => {
    const { data } = await api.get('/colleges');
    setColleges(data);
  };

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await api.get('/orders/all');
    setOrders(data);
  };

  const fetchCategories = async () => {
    const { data } = await api.get('/products/categories');
    setCategories(data);
  };

  useEffect(() => {
    fetchColleges();
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, []);

  const handleCollegeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('name', collegeForm.name);
    fd.append('location', collegeForm.location);
    if (collegeForm.image) fd.append('image', collegeForm.image);
    try {
      if (editingCollege) {
        await api.put(`/colleges/${editingCollege.id}`, fd);
        toast.success('College updated');
      } else {
        await api.post('/colleges', fd);
        toast.success('College created');
      }
      setCollegeForm({ name: '', location: '', image: null });
      setEditingCollege(null);
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save college');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!confirm('Delete this college?')) return;
    try {
      await api.delete(`/colleges/${id}`);
      toast.success('College deleted');
      fetchColleges();
    } catch {
      toast.error('Failed to delete college');
    }
  };

  const startEditCollege = (college) => {
    setEditingCollege(college);
    setCollegeForm({ name: college.name, location: college.location || '', image: null });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(productForm).forEach(([k, v]) => {
      if (k === 'image') { if (v) fd.append('image', v); }
      else fd.append(k, v);
    });
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, fd);
        toast.success('Product updated');
      } else {
        await api.post('/products', fd);
        toast.success('Product created');
      }
      setProductForm({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      college_id: product.college_id,
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image: null
    });
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-navy-900 mb-8">Admin Panel</h1>

      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Colleges' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold text-navy-900 mb-4">
              {editingCollege ? 'Edit College' : 'Add College'}
            </h2>
            <form onSubmit={handleCollegeSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  className={inputCls}
                  value={collegeForm.name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                  required
                  placeholder="College name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  className={inputCls}
                  value={collegeForm.location}
                  onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCollegeForm({ ...collegeForm, image: e.target.files[0] })}
                  className="text-sm text-slate-600"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : editingCollege ? 'Update' : 'Add College'}
                </button>
                {editingCollege && (
                  <button type="button" onClick={() => { setEditingCollege(null); setCollegeForm({ name: '', location: '', image: null }); }} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 mb-4">All Colleges ({colleges.length})</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {colleges.map((college) => (
                <div key={college.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{college.name}</p>
                    {college.location && <p className="text-xs text-slate-500">{college.location}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditCollege(college)} className="text-sm text-navy-700 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteCollege(college.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold text-navy-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
                <select
                  className={inputCls}
                  value={productForm.college_id}
                  onChange={(e) => setProductForm({ ...productForm, college_id: e.target.value })}
                  required
                >
                  <option value="">Select college</option>
                  {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  className={inputCls}
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  className={inputCls}
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputCls}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                  className="text-sm text-slate-600"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setProductForm({ college_id: '', category_id: '', name: '', description: '', price: '', stock: '', image: null }); }} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 mb-4">All Products ({products.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.college_name} - {product.category_name}</p>
                    <p className="text-xs text-slate-400">${parseFloat(product.price).toFixed(2)} | Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2 ml-3 flex-shrink-0">
                    <button onClick={() => startEditProduct(product)} className="text-sm text-navy-700 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div>
          <h2 className="font-semibold text-navy-900 mb-4">All Orders ({orders.length})</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-navy-900">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">{order.user_name} ({order.user_email})</p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-navy-900">${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mb-3 space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-xs text-slate-500">{item.product_name} x{item.quantity} @ ${item.price}</p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-600">Update status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
                  >
                    {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
