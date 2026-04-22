import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthStore } from '../store/useStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../services/api';
import Navbar from '../components/Navbar';
import { Mail, Lock, ChevronRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOtp(email);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        // Since we are using a custom OTP flow, we'll simulate a Firebase user object
        // In a real app, you'd probably link this with Firebase Custom Tokens or just use JWT from backend
        const mockUser = {
          email: email,
          displayName: name || email.split('@')[0],
          photoURL: `https://ui-avatars.com/api/?name=${name || email}&background=random`,
          uid: 'temp-uid-' + Date.now()
        };
        setUser(mockUser);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
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
      navigate(redirectPath);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-y-auto">
      <Navbar />
      
      <div className="flex flex-col items-center pt-32 md:pt-40 pb-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100"
        >
          {/* Brand Logo / Tagline */}
          <div className="flex justify-center pt-8">
            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)]">
              <span className="text-2xl font-serif font-bold">K</span>
            </div>
          </div>

          {/* Header */}
          <div className="pt-6 pb-8 px-10 text-center">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              {step === 'email' ? (isLogin ? 'Welcome Back' : 'Create Account') : 'Verify OTP'}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 'email' 
                ? (isLogin ? 'Sign in to access your premium collection' : 'Join Karigiri for an exclusive experience')
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          <div className="px-10 pb-12">
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                {!isLogin && (
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
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_10px_20px_rgba(0,128,128,0.2)] mt-4 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      maxLength="6"
                      placeholder="000000"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-medium tracking-[0.5em] text-center"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_10px_20px_rgba(0,128,128,0.2)] mt-4 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-gray-500 font-medium hover:text-[var(--primary)] transition-colors"
                >
                  Change Email
                </button>
              </form>
            )}

            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center px-2">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-200 py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-300 transition-all mb-8 disabled:opacity-50 font-bold text-gray-700"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-500 text-[10px] text-center mb-6 font-bold uppercase tracking-wider bg-red-50 py-3 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="text-center pt-6 space-y-4">
              <p className="text-sm text-gray-500 font-medium">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-[var(--primary)] font-bold hover:underline"
                >
                  {isLogin ? 'Create One' : 'Log In'}
                </button>
              </p>
              
              <div className="pt-4 border-t border-gray-50">
                <button 
                  onClick={() => navigate('/')}
                  className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-[var(--primary)] transition-colors"
                >
                  ← Back to Store
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
