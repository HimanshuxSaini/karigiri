import { motion } from 'framer-motion';
import { CloudSnow, Thermometer } from 'lucide-react';

const AnnouncementBar = () => {
  const temperature = 14; // Mock temperature
  const weatherMessage = temperature < 15 ? 
    `It's ${temperature}°C in your area – try our Heavy Knit Cardigans!` : 
    `Perfect weather for our Merino base layers.`;

  const announcements = [
    weatherMessage,
    "FREE SHIPPING ACROSS INDIA ON ALL ORDERS",
    "CASH ON DELIVERY (COD) AVAILABLE PAN INDIA",
    "USE CODE: FESTIVE30 FOR 30% OFF ON WINTER ETHNIC WEAR",
  ];

  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden fixed top-0 w-full z-[60] h-9 flex items-center">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex whitespace-nowrap space-x-20 px-4"
      >
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
            <span className="w-1 h-1 bg-[var(--primary)] rounded-full mr-4"></span>
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default AnnouncementBar;
