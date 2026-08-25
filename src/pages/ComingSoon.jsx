import React from 'react';
import { motion } from 'framer-motion';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--text-main)] relative px-6 font-sans">
      <div className="z-10 flex flex-col items-center text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="px-5 py-2 rounded-full border border-[var(--primary)]/20 bg-white text-xs font-semibold tracking-widest uppercase text-[var(--primary)] shadow-sm">
            Coming Soon
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[var(--primary)] font-serif"
        >
          We are working on it.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-[var(--text-muted)] mb-12 max-w-lg leading-relaxed"
        >
          Our new experience is being crafted with care. Please stay tuned as we prepare to launch something beautiful.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <div className="w-12 h-[1px] bg-[var(--primary)]/30"></div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
              />
            ))}
          </div>
          <div className="w-12 h-[1px] bg-[var(--primary)]/30"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
