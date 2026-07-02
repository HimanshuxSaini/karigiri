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
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCustomToken,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore, useToastStore } from '../store/useStore';
import { sendOtp, verifyOtp, requestPasswordReset } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import { trackLogin, trackSignup } from '../utils/analytics';

const LoginModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('login'); // 'otp', 'login', 'signup', 'forgot'
  const [step, setStep] = useState('number'); // 'number', 'verify'
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [slowConnection, setSlowConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToastStore();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setView('login');
      setStep('number');
      setIdentifier('');
      setLoading(false);
      setSlowConnection(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Resend Timer logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) return showToast('Email is required', 'error');
    if (!identifier.includes('@')) return showToast('Please enter a valid email', 'error');
    
    const normalizedEmail = identifier.trim().toLowerCase();
    setLoading(true);
    setSlowConnection(false);

    // Show slow connection warning after 5 seconds
    const slowTimer = setTimeout(() => {
      setSlowConnection(true);
    }, 5000);

    try {
      await sendOtp(normalizedEmail);
      setStep('verify');
      setResendTimer(60);
      setLoading(false);
      clearTimeout(slowTimer);
      setSlowConnection(false);
      showToast('OTP sent successfully!');
    } catch (err) {
      console.error('OTP send error:', err);
      showToast(getFriendlyErrorMessage(err), 'error');
      setLoading(false);
      clearTimeout(slowTimer);
      setSlowConnection(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return showToast('Enter 6-digit code', 'error');
    
    setLoading(true);

    try {
      const verification = await verifyOtp(identifier.trim().toLowerCase(), otp);
      if (!verification.success) throw new Error(verification.message || 'Invalid code');

      // Use the custom token returned by the backend to sign in with Firebase
      const userCredential = await signInWithCustomToken(auth, verification.token);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        lastLogin: new Date().toISOString(),
        provider: 'custom-otp'
      };
      
      setUser(userData);

      // GA4 Track Login
      trackLogin({ method: 'OTP' });

      onClose();
      navigate('/profile');
    } catch (err) {
      showToast(getFriendlyErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;
      if (view === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      setUser(userCredential.user);

      // GA4 Track Login / Signup
      if (view === 'login') {
        trackLogin({ method: 'Email' });
      } else {
        trackSignup({ method: 'Email' });
      }

      onClose();
      navigate('/profile');
    } catch (error) {
      showToast(getFriendlyErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email address', 'error');
    
    setLoading(true);

    try {
      await requestPasswordReset(email);
      showToast('Reset link sent to your email!');
      setTimeout(() => setView('login'), 3000);
    } catch (error) {
      showToast(getFriendlyErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
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

      // GA4 Track Login / Signup
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        trackSignup({ method: 'Google' });
      } else {
        trackLogin({ method: 'Google' });
      }

      onClose();
      navigate('/profile');
    } catch (error) {
      showToast(getFriendlyErrorMessage(error), 'error');
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
                      <p className="text-gray-500 font-medium text-xs mt-1">Experience PrathamKarigiri Excellence</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                    <X size={20} />
                  </button>
                </div>



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
                          className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[var(--primary)]/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center space-y-1 disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{loading ? (slowConnection ? 'Still Sending...' : 'Sending...') : 'Get OTP Code'}</span>
                            {!loading && <ChevronRight size={20} />}
                          </div>
                          {loading && slowConnection && (
                            <span className="text-[10px] opacity-70 animate-pulse">Connection is slow, please wait...</span>
                          )}
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
                        
                        <div className="flex flex-col space-y-4">
                          <button 
                            onClick={handleSendOtp}
                            disabled={loading || resendTimer > 0}
                            className="w-full text-xs font-bold text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                          >
                            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend OTP Code'}
                          </button>
                          
                          <button onClick={() => setStep('number')} className="w-full text-gray-400 text-xs font-bold hover:text-[var(--primary)] transition-all uppercase tracking-widest">
                            Change Email Address
                          </button>
                        </div>
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
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"} required placeholder="••••••••"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
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
                        New to PrathamKarigiri? 
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
