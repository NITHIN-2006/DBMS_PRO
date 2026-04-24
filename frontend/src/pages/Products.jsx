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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-navy-900">
          {college ? college.name : 'Uniforms'}
        </h1>
        {college?.location && (
          <p className="text-slate-500 mt-1">{college.location}</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No uniforms available for this college.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="h-48 bg-slate-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs text-gold-600 font-medium uppercase tracking-wide">
                  {product.category_name}
                </span>
                <h3 className="font-semibold text-navy-900 mt-1">{product.name}</h3>
                {product.description && (
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-navy-900 text-lg">${parseFloat(product.price).toFixed(2)}</span>
                  <span className="text-xs text-slate-400">{product.stock} in stock</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="btn-primary w-full mt-3 text-sm py-2"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
