import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="bg-navy-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl font-semibold mb-4">College Uniform Store</h1>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
            Find and order official uniforms for your college. Browse by institution and get the right fit.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/colleges" className="bg-gold-500 text-navy-900 px-8 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors">
              Browse Colleges
            </Link>
            {!user && (
              <Link to="/register" className="bg-white/10 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="font-display text-3xl font-semibold text-navy-900 text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Find Your College', desc: 'Browse our directory of partner colleges and institutions.' },
            { step: '02', title: 'Select Uniforms', desc: 'Choose from official uniform items for your college.' },
            { step: '03', title: 'Place Your Order', desc: 'Checkout securely and track your order status.' }
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="text-gold-500 font-display text-4xl font-bold mb-4">{item.step}</div>
              <h3 className="font-semibold text-navy-900 text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
