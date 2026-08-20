import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudSnow, Thermometer } from 'lucide-react';
import { fetchSettings } from '../services/api';

const AnnouncementBar = () => {
  const [customAnnouncements, setCustomAnnouncements] = useState([
    "It's 14°C in your area – try our Heavy Knit Cardigans!",
    "SHOP YOUR FIRST ORDER WITH FREE DELIVERY",
    "USE CODE: FESTIVE30 FOR 30% OFF ON WINTER ETHNIC WEAR",
    "EASY 7-DAY RETURNS & EXCHANGE",
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        if (settings?.announcements?.length > 0) {
          setCustomAnnouncements(settings.announcements);
        }
      } catch (error) {
        console.error("Failed to fetch settings for announcement bar:", error);
      }
    };
    loadSettings();
  }, []);

  const announcements = [
    ...customAnnouncements
  ];

  return (
    <div className="hidden md:flex bg-slate-900 text-white py-2 overflow-hidden fixed top-0 w-full z-[60] h-9 items-center">
      <div className="flex whitespace-nowrap space-x-12 px-4 overflow-x-auto no-scrollbar justify-center w-full">
        {announcements.map((text, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
            <span className="w-1 h-1 bg-[var(--primary)] rounded-full mr-2"></span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
