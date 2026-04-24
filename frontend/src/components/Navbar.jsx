import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-navy-950 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-semibold tracking-wide text-gold-400">
            UniformHub
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/colleges" className="hover:text-gold-400 transition-colors">Colleges</Link>
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className="hover:text-gold-400 transition-colors">Admin Panel</Link>
                ) : (
                  <>
                    <Link to="/cart" className="hover:text-gold-400 transition-colors relative">
                      Cart
                      {count > 0 && (
                        <span className="absolute -top-2 -right-3 bg-gold-500 text-navy-950 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="hover:text-gold-400 transition-colors">Orders</Link>
                  </>
                )}
                <button onClick={handleLogout} className="hover:text-gold-400 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gold-400 transition-colors">Login</Link>
                <Link to="/register" className="bg-gold-500 text-navy-950 px-4 py-1.5 rounded-lg hover:bg-gold-400 transition-colors font-semibold">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
