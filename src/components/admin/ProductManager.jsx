import React, { useState, useMemo } from 'react';
import { Search, Plus, ShoppingBag, Eye, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductManager = ({ products, handleEditProduct, handleDeleteProduct, handleAddProduct }) => {
  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const searchLower = productSearch.toLowerCase();
    return products.filter(p => {
      const nameMatch = String(p?.name || '').toLowerCase().includes(searchLower);
      const catMatch = String(p?.category || '').toLowerCase().includes(searchLower);
      const brandMatch = String(p?.brand || '').toLowerCase().includes(searchLower);
      return nameMatch || catMatch || brandMatch;
    });
  }, [products, productSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-white shadow-sm"
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center space-x-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">No products found</p>
                  <p className="text-sm text-gray-500">Add a new product to get started.</p>
                </div>
              </div>
            </div>
          ) : (
            filteredProducts.map((p, idx) => (
              <div key={p?._id || p?.id || `prod-mob-${idx}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <img
                      src={p?.image || p?.images?.[0] || '/placeholder.png'}
                      alt={p?.name || 'Product'}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{p?.name || 'Unnamed Product'}</p>
                    <p className="text-xs text-gray-400 mb-1">{p?.brand || 'KARIGIRI'}</p>
                    <p className="font-bold text-[var(--primary)]">₹{(Number(p?.price) || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p?.category === 'Kids' ? 'bg-blue-50 text-blue-600' :
                        p?.category === 'Women' ? 'bg-rose-50 text-rose-600' :
                          p?.category === 'Men' ? 'bg-slate-100 text-slate-700' :
                            p?.category === 'Bouquet' ? 'bg-pink-50 text-pink-600' :
                              p?.category === 'Laddu Gopal' ? 'bg-orange-50 text-orange-600' :
                                p?.category === 'Yarn' ? 'bg-amber-50 text-amber-600' :
                                  'bg-gray-100 text-gray-600'
                      }`}>
                      {p?.category || 'Uncategorized'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p?.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                      {p?.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/product/${p?._id || p?.id}`}
                      target="_blank"
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                    <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteProduct(p?._id || p?.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Price</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">No products found</p>
                        <p className="text-sm text-gray-500">Add a new product to get started.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <tr key={p?._id || p?.id || `prod-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                          <img
                            src={p?.image || p?.images?.[0] || '/placeholder.png'}
                            alt={p?.name || 'Product'}
                            className="w-full h-full object-contain bg-white transition-transform group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.png';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p?.name || 'Unnamed Product'}</p>
                          <p className="text-xs text-gray-400">{p?.brand || 'KARIGIRI'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${p?.category === 'Kids' ? 'bg-blue-50 text-blue-600' :
                            p?.category === 'Women' ? 'bg-rose-50 text-rose-600' :
                              p?.category === 'Men' ? 'bg-slate-100 text-slate-700' :
                                p?.category === 'Bouquet' ? 'bg-pink-50 text-pink-600' :
                                  p?.category === 'Laddu Gopal' ? 'bg-orange-50 text-orange-600' :
                                    p?.category === 'Yarn' ? 'bg-amber-50 text-amber-600' :
                                      'bg-gray-100 text-gray-600'
                          }`}>
                          {p?.category || 'Uncategorized'}
                        </span>
                        {p?.subCategory && (
                          <span className="text-[10px] text-gray-400 font-bold ml-1">{p.subCategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{(Number(p?.price) || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p?.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {p?.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/product/${p?._id || p?.id}`}
                          target="_blank"
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Live"
                        >
                          <Eye size={18} />
                        </Link>
                        <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                        <button onClick={() => handleDeleteProduct(p?._id || p?.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
