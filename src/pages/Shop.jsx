import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { allProducts } from '../data/products';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const urlCategory = searchParams.get('category');

  useEffect(() => {
    if (urlCategory) {
      setCategoryFilter(urlCategory);
    }
  }, [urlCategory]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery) || 
        p.brand.toLowerCase().includes(searchQuery) || 
        p.category.toLowerCase().includes(searchQuery);
      
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [categoryFilter, priceRange, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 max-w-[1440px] mx-auto flex px-4 md:px-12">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 pt-12 pr-8 border-r border-gray-100 flex-shrink-0">
           <h2 className="font-bold text-sm uppercase tracking-wider mb-8">Filters</h2>
           
           <div className="mb-10">
              <h3 className="font-bold text-[13px] uppercase mb-4">Categories</h3>
              <div className="space-y-3">
                 {['All', 'Men', 'Women', 'Kids', 'Yarn', 'Laddu Gopal'].map(cat => (
                   <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        checked={categoryFilter === cat}
                        onChange={() => setCategoryFilter(cat)}
                        className="w-4 h-4 accent-[var(--primary)]"
                      />
                      <span className={`text-sm tracking-wide ${categoryFilter === cat ? 'font-bold text-black' : 'text-gray-600 group-hover:text-black'}`}>{cat}</span>
                   </label>
                 ))}
              </div>
           </div>

           <div className="mb-10">
              <h3 className="font-bold text-[13px] uppercase mb-4">Price Range</h3>
              <div className="space-y-3">
                 {[[0, 10000], [0, 3000], [3000, 5000], [5000, 10000]].map((range, idx) => (
                    <label key={idx} className="flex items-center space-x-3 cursor-pointer group">
                       <input 
                          type="radio" 
                          name="price"
                          checked={priceRange[0] === range[0] && priceRange[1] === range[1]}
                          onChange={() => setPriceRange(range)}
                          className="w-4 h-4 accent-[var(--primary)]"
                       />
                       <span className="text-sm text-gray-600 group-hover:text-black tracking-wide">
                          {range[0] === 0 && range[1] === 10000 ? "All Prices" : `₹${range[0].toLocaleString('en-IN')} - ${range[1].toLocaleString('en-IN')}`}
                       </span>
                    </label>
                 ))}
              </div>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow pt-12 lg:pl-12 pb-24">
          <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-4">
             <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Home / {categoryFilter} {searchQuery && ` / Search: "${searchQuery}"`}
             </div>
             <div className="text-sm font-bold text-gray-800">
                {filteredProducts.length} items found
             </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
