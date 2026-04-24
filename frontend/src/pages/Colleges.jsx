import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/colleges');
        setColleges(data);
      } catch {
        toast.error('Failed to load colleges');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-navy-900">Browse Colleges</h1>
        <p className="text-slate-500 mt-2">Select a college to view available uniforms</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No colleges available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college) => (
            <Link
              key={college.id}
              to={`/colleges/${college.id}/products`}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="h-44 bg-slate-100 overflow-hidden">
                {college.image_url ? (
                  <img
                    src={college.image_url}
                    alt={college.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-display">
                    {college.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-navy-900 text-lg">{college.name}</h2>
                {college.location && (
                  <p className="text-slate-500 text-sm mt-1">{college.location}</p>
                )}
                <span className="inline-block mt-3 text-sm text-navy-700 font-medium">
                  View uniforms &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Colleges;
