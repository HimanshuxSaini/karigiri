import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  Mail, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useStore';
import { sendOtp, verifyOtp, requestPasswordReset } from '../services/api';

const LoginModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('otp'); // 'otp', 'login', 'signup', 'forgot'
  const [step, setStep] = useState('number'); // 'number', 'verify'
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('number');
      setIdentifier('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) return setError('Email is required');
    if (!identifier.includes('@')) return setError('Please enter a valid email');
    
    const normalizedEmail = identifier.trim().toLowerCase();
    setLoading(true);
    setError('');

    try {
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (methods.length === 0) {
        setError('ACCOUNT NOT FOUND. PLEASE SIGN UP FIRST.');
        setLoading(false);
        return;
      }

      await sendOtp(normalizedEmail);
      setStep('verify');
      setLoading(false);
    } catch (err) {
      console.error('OTP send error:', err);
      let errorMessage = 'FAILED TO SEND OTP. PLEASE TRY AGAIN.';
      if (err.message === 'Failed to fetch') {
        errorMessage = 'SERVER UNREACHABLE. PLEASE ENSURE BACKEND IS RUNNING.';
      } else if (err.message) {
        errorMessage = err.message.toUpperCase();
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError('Enter 6-digit code');
    
    setLoading(true);
    setError('');

    try {
      const verification = await verifyOtp(identifier.trim().toLowerCase(), otp);
      if (!verification.success) throw new Error(verification.message || 'Invalid code');

      const userEmail = identifier.trim().toLowerCase();
      const mockUser = {
        uid: 'otp-' + Date.now(),
        email: userEmail,
        displayName: userEmail.split('@')[0],
        photoURL: null
      };
      
      setUser(mockUser);
      onClose();
      navigate('/profile');
    } catch (err) {
      setError(err.message?.toUpperCase() || 'INVALID CODE. PLEASE TRY AGAIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (view === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      setUser(userCredential.user);
      onClose();
      navigate('/profile');
    } catch (error) {
      const msg = error.code?.split('/')[1]?.replace(/-/g, ' ').toUpperCase() || 'AUTH ERROR';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestPasswordReset(email);
      setSuccess('Reset link sent to your email!');
      setTimeout(() => setView('login'), 3000);
    } catch (error) {
      const msg = error.code?.split('/')[1]?.replace(/-/g, ' ').toUpperCase() || 'ERROR SENDING LINK';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        lastLogin: new Date().toISOString(),
        provider: 'google.com'
      };

      setUser(userData);
      onClose();
      navigate('/profile');
    } catch (error) {
      setError(error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
          />
          
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    {view === 'forgot' && (
                      <button onClick={() => setView('login')} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                        <ArrowLeft size={20} />
                      </button>
                    )}
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {view === 'signup' ? 'Create Account' : 
                         view === 'forgot' ? 'Reset Password' : 'Welcome Back'}
                      </h2>
                      <p className="text-gray-500 font-medium text-xs mt-1">Experience Karigiri Excellence</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600"
                  >
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-emerald-600"
                  >
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
                  </motion.div>
                )}

                {view === 'otp' ? (
                  <div className="space-y-6">
                    {step === 'number' ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                            Email Address for OTP
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              placeholder="email@example.com"
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-bold"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[var(--primary)]/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <span>{loading ? 'Sending...' : 'Get OTP Code'}</span>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-center block">Enter 6-Digit Code</label>
                          <input
                            type="text" maxLength="6" placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-900 font-black tracking-[0.8em] text-center text-2xl"
                          />
                        </div>
                        <button 
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
                        </button>
                        <button onClick={() => setStep('number')} className="w-full text-gray-400 text-xs font-bold hover:text-[var(--primary)] transition-all uppercase tracking-widest">
                          Change Email Address
                        </button>
                      </div>
                    )}
                  </div>
                ) : view === 'forgot' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email" required placeholder="your@email.com"
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-md shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2">
                      <KeyRound size={18} />
                      <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {view === 'signup' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          type="text" required placeholder="John Doe"
                          value={name} onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email" required placeholder="your@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        {view === 'login' && (
                          <button 
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-[9px] font-bold text-[var(--primary)] hover:underline uppercase tracking-tighter"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <input
                        type="password" required placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold text-md shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50 mt-1">
                      {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                  </form>
                )}

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black"><span className="px-4 bg-white text-gray-300">OR</span></div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white border border-gray-100 py-3 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span className="font-bold text-gray-700 text-sm">Continue with Google</span>
                </button>

                <div className="mt-6 text-center space-y-3">
                  {view === 'otp' ? (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm text-gray-500 font-medium">
                        New to Karigiri? 
                        <button 
                          onClick={() => setView('signup')}
                          className="ml-2 text-[var(--primary)] font-bold hover:underline"
                        >
                          Create One Now
                        </button>
                      </p>
                      <button 
                        onClick={() => setView('login')}
                        className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] transition-all uppercase tracking-widest"
                      >
                        Login with Password instead
                      </button>
                    </div>
                  ) : view === 'login' ? (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm text-gray-500 font-medium">
                        New here? 
                        <button 
                          onClick={() => setView('signup')}
                          className="ml-2 text-[var(--primary)] font-bold hover:underline"
                        >
                          Create One Now
                        </button>
                      </p>
                      <button 
                        onClick={() => setView('otp')}
                        className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] transition-all uppercase tracking-widest"
                      >
                        Try Email OTP Login
                      </button>
                    </div>
                  ) : view === 'forgot' ? (
                    <button 
                      onClick={() => setView('login')}
                      className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] transition-all uppercase tracking-widest"
                    >
                      Back to Login
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm text-gray-500 font-medium">
                        Already have an account? 
                        <button 
                          onClick={() => setView('login')}
                          className="ml-2 text-[var(--primary)] font-bold hover:underline"
                        >
                          Sign In
                        </button>
                      </p>
                      <button 
                        onClick={() => setView('otp')}
                        className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] transition-all uppercase tracking-widest"
                      >
                        Use Email OTP Login
                      </button>
                    </div>
                  )}
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
