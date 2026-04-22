import { motion } from 'framer-motion';

const Snowfall = () => {
  const flakes = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {flakes.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: -20, 
            opacity: Math.random() * 0.5 + 0.3 
          }}
          animate={{ 
            y: "110vh",
            x: (Math.random() * 100 - 50) + "vw",
            rotate: 360
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

export default Snowfall;
