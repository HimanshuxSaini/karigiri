import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { categoryStructure } from '../data/categories';

const ProductSkeleton = () => (
  <div className="animate-pulse flex flex-col h-full">
    <div className="aspect-[3/4] bg-gray-100 rounded-sm mb-4"></div>
    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-3"></div>
    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
  </div>
);

const ShopSearchBar = ({ value, onChange, onSubmit, onClear }) => (
  <form
    onSubmit={onSubmit}
    className="mb-6 md:mb-8 flex items-center gap-2 rounded-[1.75rem] border border-gray-100 bg-white p-2 shadow-sm"
  >
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] bg-gray-50 px-4 py-3">
      <Search size={18} className="shrink-0 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search products, categories, or brands"
        className="w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-white hover:text-black"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
    <button
      type="submit"
      className="shrink-0 rounded-[1.25rem] bg-black px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:opacity-90 active:scale-95 md:px-6"
    >
      Search
    </button>
  </form>
);

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categories = ['All', ...Object.keys(categoryStructure)];
  
  const urlCategory = searchParams.get('category') || 'All';
  const urlSubCategory = searchParams.get('sub');
  const rawSearchQuery = searchParams.get('search') || '';
  const searchQuery = rawSearchQuery.trim().toLowerCase();

  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(rawSearchQuery);

  // Sync state with URL
  useEffect(() => {
    setCategoryFilter(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setSearchInput(rawSearchQuery);
  }, [rawSearchQuery]);

  // Reset scroll when filters change to show the first product first
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [categoryFilter, urlSubCategory, priceRange, searchQuery]);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('API Error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('sub'); // Reset subcategory when changing main category
    setSearchParams(params);
    setCategoryFilter(cat);
  };

  const applySearchQuery = (value) => {
    const params = new URLSearchParams(searchParams);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.set('search', trimmedValue);
    } else {
      params.delete('search');
    }

    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applySearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    applySearchQuery('');
  };

  const clearFilters = () => {
    setSearchParams({});
    setCategoryFilter('All');
    setPriceRange([0, 10000]);
    setSearchInput('');
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => {
      const pCategory = String(p?.category || '').trim().toLowerCase();
      const pSubCategory = String(p?.subCategory || p?.subcategory || '').trim().toLowerCase();
      const pName = String(p?.name || '').trim().toLowerCase();
      const pBrand = String(p?.brand || '').trim().toLowerCase();
      
      const filterCat = categoryFilter.trim().toLowerCase();
      const filterSub = (urlSubCategory || '').trim().toLowerCase();

      const matchesCategory = categoryFilter === 'All' || pCategory === filterCat;
      const matchesSubCategory = !urlSubCategory || pSubCategory === filterSub;
      
      const matchesPrice = (Number(p?.price) || 0) >= priceRange[0] && (Number(p?.price) || 0) <= priceRange[1];
      
      const matchesSearch = !searchQuery || 
        pName.includes(searchQuery.trim().toLowerCase()) || 
        pBrand.includes(searchQuery.trim().toLowerCase()) || 
        pCategory.includes(searchQuery.trim().toLowerCase()) ||
        pSubCategory.includes(searchQuery.trim().toLowerCase());
      
      return matchesCategory && matchesSubCategory && matchesPrice && matchesSearch;
    });
  }, [categoryFilter, urlSubCategory, priceRange, searchQuery, products]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      <div className="pt-16 md:pt-28 max-w-[1440px] mx-auto">
        {/* Mobile Horizontal Categories */}
        <div className="lg:hidden sticky top-14 z-40 bg-white shadow-sm border-b border-gray-50 overflow-hidden">
          <div className="flex overflow-x-auto py-4 px-4 space-x-3 no-scrollbar mask-fade-right">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 ${
                  categoryFilter === cat 
                    ? 'bg-black text-white' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex px-4 md:px-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 pt-12 pr-8 border-r border-gray-100 flex-shrink-0 sticky top-22 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-sm uppercase tracking-wider">Filters</h2>
              {(categoryFilter !== 'All' || searchQuery) && (
                <button 
                  onClick={clearFilters}
                  className="text-[10px] text-gray-400 hover:text-black uppercase font-bold tracking-tighter transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="mb-10">
              <h3 className="font-bold text-[13px] uppercase mb-6 flex items-center">
                <span className="w-4 h-[2px] bg-black mr-3"></span>
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-300 group ${
                      categoryFilter === cat 
                        ? 'bg-black text-white shadow-xl shadow-black/10' 
                        : 'hover:bg-gray-50 text-gray-600 hover:text-black font-medium'
                    }`}
                  >
                    <span className="text-[13px] font-bold tracking-tight">{cat}</span>
                    <ChevronRight 
                      size={14} 
                      className={`transition-transform duration-300 ${
                        categoryFilter === cat ? 'translate-x-1 opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'
                      }`} 
                    />
                  </button>
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
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-black tracking-wide font-medium">
                      {range[0] === 0 && range[1] === 10000 ? "All Prices" : `₹${range[0].toLocaleString('en-IN')} - ${range[1].toLocaleString('en-IN')}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow pt-4 md:pt-12 lg:pl-12 pb-24">
            <div className="md:hidden">
              <ShopSearchBar
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
              />
            </div>

            <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-gray-100 pb-4">
              <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold">
                <Link to="/" className="hover:text-black transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-black">{categoryFilter}</span>
                {searchQuery && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-400 font-normal">Search: </span>
                    <span className="text-black normal-case">"{rawSearchQuery}"</span>
                  </>
                )}
              </div>
              <div className="text-[10px] md:text-sm font-black text-gray-900 uppercase tracking-tight">
                {loading ? '' : `${filteredProducts.length} items`}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-6 md:gap-y-12">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ProductSkeleton />
                    </motion.div>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id || product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 px-4 flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                      <Search size={32} className="text-gray-200" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
                      {searchQuery ? 'No Products Found' : 'Crafted Just For You'}
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                      {searchQuery ? (
                        <>We could not find anything for <span className="text-black font-bold">"{rawSearchQuery}"</span>. Try another keyword or clear the search to explore all products.</>
                      ) : categoryFilter === 'Yarn' ? (
                        <>Our master artisans can handcraft custom <span className="text-black font-bold">Yarn</span> items and deliver them within <span className="text-black font-bold">2-3 days</span>.</>
                      ) : (
                        <>We don't have ready-made items in <span className="text-black font-bold">{urlSubCategory || categoryFilter}</span> right now, but our artisans can handcraft a custom piece for you within <span className="text-black font-bold">2-3 days</span>.</>
                      )}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {!searchQuery && (
                        <a 
                          href={`https://wa.me/917027311213?text=Hi, I want to order a custom product in ${urlSubCategory || categoryFilter} category. I saw the 2-3 days completion promise on your website.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-black/10 flex items-center"
                        >
                          Contact Master Artisan
                        </a>
                      )}
                      <button 
                        onClick={clearFilters}
                        className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors"
                      >
                        {searchQuery ? 'Clear Search' : 'Browse All Products'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
