import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Colleges from './pages/Colleges';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/colleges/:collegeId/products" element={<Products />} />
      <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{ duration: 1500 }} />
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
