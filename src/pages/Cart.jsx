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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="glass-card p-6 flex items-center space-x-6"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                <div className="flex-grow">
                  <h3 className="text-lg font-serif text-[var(--primary)]">{item.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{item.category}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-50"><Minus size={14}/></button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50"><Plus size={14}/></button>
                  </div>
                  <span className="font-bold w-24 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-32">
              <h2 className="text-2xl font-serif text-[var(--primary)] mb-8">Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-xl text-[var(--primary)]">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
              {user ? (
                <Link to="/checkout" className="w-full btn-primary flex items-center justify-center space-x-2">
                  <span>Go to Checkout</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/auth?redirect=checkout" className="w-full btn-primary flex items-center justify-center space-x-2">
                  <span>Login to Checkout</span>
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
