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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-navy-900 mb-8">My Orders</h1>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No orders placed yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">Order #{order.id}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="font-bold text-navy-900 mt-2">${parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-slate-600">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
