import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const IntroVideo = ({ onComplete }) => {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Lock scroll while intro is playing
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(err => {
        console.warn('Autoplay failed or was interrupted:', err);
      });
    };

    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      onClick={onComplete}
      className="fixed inset-0 z-[9999] bg-white flex flex-col justify-between items-center py-12 px-6 overflow-hidden select-none cursor-pointer"
      style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
      title="Click anywhere to enter website"
    >
      {/* Top Header - Brand Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center z-10"
      >
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--primary)]">
          Welcome to
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-[0.2em] text-[var(--primary)] uppercase mt-1">
          Karigiri
        </h1>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-1.5">
          Artisanal Handcrafted Heritage
        </p>
      </motion.div>

      {/* Video Container - Seamless White BG with Natural Dimensions */}
      <div 
        className="relative w-full flex-1 flex items-center justify-center bg-white z-10 overflow-hidden"
        style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
      >
        <video
          ref={videoRef}
          src="/Video Project 6.mp4"
          muted
          playsInline
          autoPlay
          onEnded={onComplete}
          className={`max-w-full max-h-[70vh] w-auto h-auto transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: '#ffffff', 
            background: '#ffffff',
            outline: 'none',
            border: 'none',
            boxShadow: '0 0 0 4px #ffffff', // Overwrites browser subpixel rendering black boundary line
            transform: 'translate3d(0,0,0)', // Triggers hardware acceleration cleanly
          }}
        />
      </div>

      {/* Elegant Minimal Footer Helper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-center z-10"
      >
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">
          Click anywhere to skip
        </p>
      </motion.div>
    </motion.div>
  );
};

export default IntroVideo;
