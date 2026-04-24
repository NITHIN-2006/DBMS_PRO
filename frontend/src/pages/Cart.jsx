import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (paymentIntent.status === 'succeeded') {
        await api.post('/orders/confirm-payment', {
          order_id: orderId,
          payment_intent_id: paymentIntent.id
        });
        toast.success('Payment successful');
        onSuccess();
      }
    } catch {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <CardElement options={{ style: { base: { fontSize: '14px', color: '#1e293b' } } }} />
      </div>
      <p className="text-xs text-slate-400">Use test card: 4242 4242 4242 4242 | Any future date | Any CVC</p>
      <button type="submit" disabled={processing || !stripe} className="btn-primary w-full">
        {processing ? 'Processing...' : 'Pay Now'}
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-navy-900 mb-4">Your Cart</h1>
        <p className="text-slate-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-navy-900 mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900">{item.name}</h3>
                <p className="text-slate-500 text-sm">${parseFloat(item.price).toFixed(2)} each</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-sm"
                  >-</button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-sm"
                  >+</button>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs ml-2 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-navy-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-navy-900 mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 my-3"></div>
            <div className="flex justify-between font-bold text-navy-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {!checkoutData && (
              <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full mt-4">
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            )}
          </div>

          {checkoutData && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Payment</h2>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={checkoutData.clientSecret}
                  orderId={checkoutData.orderId}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
