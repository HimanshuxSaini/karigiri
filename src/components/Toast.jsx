import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { useToastStore } from '../store/useStore';

const ToastItem = ({ id, message, type, removeToast }) => {
  const icons = {
    success: <CheckCircle2 className="text-[var(--accent)]" size={22} />,
    error: <AlertCircle className="text-[var(--primary)]" size={22} />,
    info: <Info className="text-[var(--primary-light)]" size={22} />,
  };

  const glowStyles = {
    success: 'shadow-[var(--accent)]/10',
    error: 'shadow-[var(--primary)]/10',
    info: 'shadow-[var(--primary-light)]/10',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }}
      className={`
        flex items-center space-x-4 p-5 rounded-[2rem] 
        bg-white/80 backdrop-blur-xl border border-white/50
        shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${glowStyles[type]}
        min-w-[320px] max-w-md pointer-events-auto mb-4
        relative overflow-hidden group
      `}
    >
      {/* Dynamic Background Accent */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        type === 'success' ? 'bg-[var(--accent)]' : 
        type === 'error' ? 'bg-[var(--primary)]' : 'bg-[var(--primary-light)]'
      }`} />

      <div className="flex-shrink-0 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-50">
        {icons[type]}
      </div>
      
      <div className="flex-1 pr-2">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${
          type === 'success' ? 'text-[var(--accent)]' : 
          type === 'error' ? 'text-[var(--primary)]' : 'text-[var(--primary-light)]'
        }`}>
          {type === 'success' ? 'Pure Success' : type === 'error' ? 'Craftsman Note' : 'Artisan Info'}
        </h4>
        <p className="text-sm font-bold text-[var(--text-main)] leading-tight">
          {message}
        </p>
      </div>

      <button 
        onClick={() => removeToast(id)}
        className="text-gray-300 hover:text-gray-900 transition-all p-2 hover:bg-gray-50 rounded-full"
      >
        <X size={18} />
      </button>

      {/* Subtle Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 opacity-30 ${
          type === 'success' ? 'bg-[var(--accent)]' : 
          type === 'error' ? 'bg-[var(--primary)]' : 'bg-[var(--primary-light)]'
        }`}
      />
    </motion.div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center pointer-events-none w-full px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
