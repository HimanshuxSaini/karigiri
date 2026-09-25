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
  EyeOff,
  ChevronDown,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCustomToken,
  getAdditionalUserInfo,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore, useToastStore } from '../store/useStore';
import { sendOtp, verifyOtp, requestPasswordReset, saveUserProfile } from '../services/api';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import { trackLogin, trackSignup } from '../utils/analytics';
import { countryCodes } from '../utils/countryCodes';

const LoginModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('login'); // 'otp', 'login', 'signup', 'forgot'
  const [step, setStep] = useState('number'); // 'number', 'verify'
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [slowConnection, setSlowConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useToastStore();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setView('login');
      setStep('number');
      setIdentifier('');
      setPhoneError('');
      setLoading(false);
      setSlowConnection(false);
      setShowPassword(false);
      document.body.style.overflow = 'unset';
    } else {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
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
      await sendOtp(normalizedEmail, false, true);
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
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
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
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
    
    if (view === 'signup') {
      try {
        const phoneNumberStr = `${countryCode}${phone}`;
        const phoneNumber = parsePhoneNumberWithError(phoneNumberStr);
        if (!phoneNumber.isValid()) {
          setPhoneError('Please choose the correct country code according to your number.');
          return;
        }
      } catch (err) {
        setPhoneError('Please choose the correct country code according to your number.');
        return;
      }

      setLoading(true);
      setSlowConnection(false);
      const slowTimer = setTimeout(() => setSlowConnection(true), 5000);

      try {
        await sendOtp(email.trim().toLowerCase(), true);
        setStep('verify-signup');
        setResendTimer(60);
        showToast('OTP sent to verify your email!');
      } catch (err) {
        console.error('OTP send error:', err);
        showToast(getFriendlyErrorMessage(err), 'error');
      } finally {
        clearTimeout(slowTimer);
        setSlowConnection(false);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      trackLogin({ method: 'Email' });
      onClose();
      navigate('/profile');
    } catch (error) {
      showToast(getFriendlyErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
    if (otp.length !== 6) return showToast('Enter 6-digit code', 'error');
    
    setLoading(true);

    try {
      const verification = await verifyOtp(email.trim().toLowerCase(), otp);
      if (!verification.success) throw new Error(verification.message || 'Invalid code');

      const userCredential = await signInWithCustomToken(auth, verification.token);
      const user = userCredential.user;

      await updatePassword(user, password);
      await updateProfile(user, { displayName: name });

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: name || user.email.split('@')[0],
        photoURL: user.photoURL,
        phoneNumber: `${countryCode}${phone}`,
        lastLogin: new Date().toISOString(),
        provider: 'password'
      };
      
      // Save profile to MongoDB explicitly during signup
      try {
        await saveUserProfile(user.uid, { phone: `${countryCode}${phone}`, displayName: name });
      } catch (err) {
        console.error("Failed to save phone to db:", err);
      }

      setUser(userData);
      trackSignup({ method: 'Email' });

      onClose();
      navigate('/profile');
    } catch (err) {
      showToast(getFriendlyErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
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
    if (!navigator.onLine) return showToast('Please check your internet connection and try again.', 'error');
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
              className="bg-white w-full max-w-sm max-h-[90vh] rounded-lg overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 md:p-5 flex-1 overflow-y-auto scrollbar-hide" data-lenis-prevent="true">
                <div className="flex justify-between items-start mb-3">
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
                  <div className="space-y-2">
                    {step === 'number' ? (
                      <div className="space-y-2">
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
                              className="w-full pl-12 pr-5 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-800 font-bold"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-lg hover:shadow-xl hover:shadow-[var(--primary)]/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center space-y-1 disabled:opacity-50"
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
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-center block">Enter 6-Digit Code</label>
                          <input
                            type="text" maxLength="6" placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full py-2 rounded-lg bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-900 font-black tracking-[0.8em] text-center text-2xl"
                          />
                        </div>
                        <button 
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-lg shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
                        </button>
                        
                        <div className="flex flex-col space-y-2">
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
                  <form onSubmit={handleForgotPassword} className="space-y-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email" required placeholder="your@email.com"
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-5 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded-lg font-bold text-md shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2">
                      <KeyRound size={18} />
                      <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </form>
                ) : view === 'signup' && step === 'verify-signup' ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-center block">Verify Email to Create Account</label>
                      <input
                        type="text" maxLength="6" placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-2 rounded-lg bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-gray-900 font-black tracking-[0.8em] text-center text-2xl"
                      />
                    </div>
                    <button 
                      onClick={handleVerifySignupOtp}
                      disabled={loading}
                      className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-lg shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <span>{loading ? 'Creating Account...' : 'Verify & Create Account'}</span>
                    </button>
                    
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={(e) => handleEmailAuth(e || { preventDefault: () => {} })}
                        disabled={loading || resendTimer > 0}
                        className="w-full text-xs font-bold text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend OTP Code'}
                      </button>
                      
                      <button onClick={() => setStep('number')} className="w-full text-gray-400 text-xs font-bold hover:text-[var(--primary)] transition-all uppercase tracking-widest">
                        Back to Signup Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-2">
                    {view === 'signup' && (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input
                            type="text" required placeholder="Enter your name"
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <div className={`relative flex rounded-lg bg-white border transition-all ${phoneError ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20' : 'border-gray-100 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20'}`}>
                            <div 
                              onClick={() => setShowCountryDropdown(true)}
                              className="relative flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors border-r border-gray-100 px-3 w-[75px] cursor-pointer rounded-l-xl"
                            >
                              <img 
                                src={`https://flagcdn.com/w20/${countryCodes.find(c => c.code === countryCode)?.iso.toLowerCase() || 'in'}.png`}
                                alt="flag"
                                className="w-5 h-auto mr-1.5 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                              />
                              <ChevronDown size={14} className="text-gray-400" />
                            </div>
                            
                            <div className="flex-1 flex items-center px-4 py-2 bg-white">
                              <span className="text-gray-500 font-bold mr-2 text-sm">{countryCode}</span>
                              <input
                                type="tel" required placeholder="Phone number"
                                value={phone}
                                onChange={(e) => {
                                  setPhone(e.target.value.replace(/\D/g, ''));
                                  setPhoneError('');
                                }}
                                onBlur={() => {
                                  if (phone.length > 3) {
                                    try {
                                      const phoneNumberStr = `${countryCode}${phone}`;
                                      const phoneNumber = parsePhoneNumberWithError(phoneNumberStr);
                                      if (!phoneNumber.isValid()) {
                                        setPhoneError('Invalid number for this country code.');
                                      }
                                    } catch (err) {
                                      setPhoneError('Invalid number for this country code.');
                                    }
                                  }
                                }}
                                className="flex-1 w-full bg-transparent outline-none text-sm font-bold tracking-widest text-gray-800 placeholder-gray-300"
                              />
                            </div>
                          </div>
                          {phoneError && (
                            <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-1">
                              <AlertCircle size={10} /> {phoneError}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email" required placeholder="your@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
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
                          className="w-full pl-5 pr-12 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm font-bold"
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
                    <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-md shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50 mt-1">
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
                  className="w-full bg-white border border-gray-100 py-2 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span className="font-bold text-gray-700 text-sm">Continue with Google</span>
                </button>

                <div className="mt-6 text-center space-y-2">
                  {view === 'otp' ? (
                    <div className="flex flex-col space-y-2">
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
                    <div className="flex flex-col space-y-2">
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
                    <div className="flex flex-col space-y-2">
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
      {showCountryDropdown && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCountryDropdown(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[70vh] border border-gray-100"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
              <Search size={18} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search country or code..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
              <button onClick={() => setShowCountryDropdown(false)} className="p-1 hover:bg-gray-200 rounded-full ml-2">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 scrollbar-hide">
              {countryCodes.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)).map((c, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setCountryCode(c.code);
                    setShowCountryDropdown(false);
                    setCountrySearch('');
                    setPhoneError('');
                  }}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${c.iso.toLowerCase()}.png`}
                    alt={c.name}
                    className="w-5 h-auto mr-3 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                  />
                  <span className="font-bold text-gray-800 text-sm flex-1">{c.name}</span>
                  <span className="text-gray-400 font-bold text-xs">{c.code}</span>
                </div>
              ))}
              {countryCodes.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)).length === 0 && (
                <div className="p-6 text-center text-gray-400 font-bold text-sm">
                  No countries found.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
