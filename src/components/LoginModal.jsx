import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { auth } from '../firebase/config';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { useAuthStore } from '../store/useStore';
import { sendOtp, verifyOtp } from '../services/api';

const LoginModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('otp'); // 'otp', 'login', 'signup'
  const [step, setStep] = useState('email'); // 'email', 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return setError('Email is required');
    
    setLoading(true);
    setError('');
    try {
      await sendOtp(email);
      setStep('verify');
    } catch (error) {
      console.error('OTP Send Error:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send OTP';
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        const mockUser = {
          email: email,
          displayName: email.split('@')[0],
          photoURL: `https://ui-avatars.com/api/?name=${email}&background=random`,
          uid: 'temp-uid-' + Date.now()
        };
        setUser(mockUser);
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      onClose();
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (view === 'login') {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else if (view === 'signup') {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      setUser(result.user);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
          />
          
          {/* Modal Container - "Up Side Mid" & "Horizontally Mid" */}
          <div className="fixed inset-0 z-[101] flex flex-col items-center pt-8 md:pt-16 pb-12 px-4 overflow-y-auto scrollbar-hide">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative border border-gray-100 my-auto flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-all z-10"
              >
                <X size={20} />
              </button>

              {/* Header with Brand Color */}
              <div className="pt-8 pb-3 px-8 text-center flex-shrink-0">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  {view === 'otp' ? 'Welcome Back' : view === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {view === 'otp' ? 'Login with your email for quick access' : 'Enter your details to proceed'}
                </p>
              </div>

              {/* Scrollable Content Area */}
              <div className="px-8 pb-8 overflow-y-auto scrollbar-hide">
                {view === 'otp' ? (
                  <div className="space-y-6">
                    {step === 'email' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_10px_20px_rgba(0,128,128,0.2)] flex items-center justify-center space-x-2 group disabled:opacity-50"
                        >
                          <span>{loading ? 'Sending...' : 'Get Secure OTP'}</span>
                          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              maxLength="6"
                              placeholder="000000"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium tracking-[0.5em] text-center"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_10px_20px_rgba(0,128,128,0.2)] flex items-center justify-center space-x-2 group disabled:opacity-50"
                        >
                          <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
                          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button 
                          onClick={() => setStep('email')}
                          className="w-full py-2 text-gray-500 text-xs font-bold hover:text-[var(--primary)] transition-all"
                        >
                          Change Email
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => setView('login')}
                      className="w-full py-2 text-[var(--primary)] text-sm font-bold hover:bg-[var(--primary)]/5 rounded-xl transition-all"
                    >
                      Login with Password instead
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-5">
                    {view === 'signup' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_10px_20px_rgba(0,128,128,0.2)] disabled:opacity-50 mt-2"
                    >
                      {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                    </button>

                    <button 
                      type="button"
                      onClick={() => setView('otp')}
                      className="w-full py-2 text-[var(--primary)] text-sm font-bold hover:bg-[var(--primary)]/5 rounded-xl transition-all"
                    >
                      Use OTP Login
                    </button>
                  </form>
                )}

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center px-2">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                    <span className="px-4 bg-white text-gray-400">Or</span>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 py-3.5 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 disabled:opacity-50 font-bold text-gray-700"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                {error && (
                  <p className="text-red-500 text-[10px] text-center mb-6 font-bold uppercase tracking-wider bg-red-50 py-3 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 font-medium">
                    {view === 'signup' ? 'Already have an account?' : "New to Karigiri?"}
                    <button 
                      onClick={() => setView(view === 'signup' ? 'login' : 'signup')}
                      className="ml-2 text-[var(--primary)] font-bold hover:underline"
                    >
                      {view === 'signup' ? 'Sign In' : 'Create One Now'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
