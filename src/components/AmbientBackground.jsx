import { motion } from 'framer-motion';

const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--background)]">
      <motion.div 
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--secondary)] blur-[120px] opacity-20"
      />
      <motion.div 
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--primary)] blur-[150px] opacity-[0.08]"
      />
      <motion.div 
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-slate-200 blur-[100px] opacity-30"
      />
    </div>
  );
};

export default AmbientBackground;
