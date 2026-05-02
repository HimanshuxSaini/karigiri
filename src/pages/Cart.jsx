import Navbar from '../components/Navbar';
import { useCartStore, useAuthStore } from '../store/useStore';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { user } = useAuthStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center p-8">
          <h2 className="text-4xl font-serif text-[var(--primary)] mb-6">Your cart is empty</h2>
          <p className="text-[var(--text-muted)] mb-10">Start your creative journey with our premium yarns.</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-[var(--primary)] mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="glass-card p-4 md:p-6 flex flex-row items-center space-x-4 md:space-x-6"
              >
                <div className="w-20 md:w-24 aspect-[3/4] bg-gray-50 flex items-center justify-center rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm md:text-lg font-serif text-[var(--primary)] truncate">{item.name}</h3>
                  <p className="text-[10px] md:text-sm text-[var(--text-muted)]">{item.category}</p>
                  
                  {/* Mobile Quantity & Price */}
                  <div className="flex items-center justify-between mt-2 md:hidden">
                    <div className="flex items-center border border-gray-100 rounded-lg bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5"><Minus size={12}/></button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5"><Plus size={12}/></button>
                    </div>
                    <span className="font-black text-sm text-[var(--primary)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-50"><Minus size={14}/></button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50"><Plus size={14}/></button>
                  </div>
                  <span className="font-bold w-24 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>

                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 md:p-8 sticky top-32">
              <h2 className="text-xl md:text-2xl font-serif text-[var(--primary)] mb-6 md:mb-8">Summary</h2>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex justify-between text-sm md:text-base text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-[var(--text-muted)]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between font-black text-lg md:text-xl text-[var(--primary)]">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              {/* Desktop Checkout Button */}
              <div className="hidden md:block">
                {user ? (
                  <Link to="/checkout" className="w-full btn-primary flex items-center justify-center space-x-2">
                    <span>Checkout Now</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/" className="w-full btn-primary flex items-center justify-center space-x-2">
                    <span>Login to Checkout</span>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Checkout Bar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
             <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Amount</p>
                <p className="text-xl font-black text-[var(--primary)]">₹{getTotal().toLocaleString('en-IN')}</p>
             </div>
             {user ? (
                <Link to="/checkout" className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg">
                  <span>Checkout</span>
                  <ArrowRight size={16} />
                </Link>
             ) : (
                <Link to="/" className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg">
                  <span>Login</span>
                  <ArrowRight size={16} />
                </Link>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
