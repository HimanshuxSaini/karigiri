import { useState, useEffect } from 'react';

const FlashSaleTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endTime) return 0;
    const diff = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!endTime) return 0;
      const diff = new Date(endTime).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };

    const updateTime = () => {
      const seconds = calculateTimeLeft();
      setTimeLeft(seconds);
      if (seconds <= 0 && onExpire) {
        onExpire();
      }
    };
    
    const timeoutId = setTimeout(updateTime, 0);

    const timer = setInterval(() => {
      const seconds = calculateTimeLeft();
      setTimeLeft(seconds);
      
      if (seconds <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timer);
    };
  }, [endTime, onExpire]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      d: String(days).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
      days
    };
  };

  const { d, h, m, s, days } = formatTime(timeLeft);

  if (timeLeft <= 0) return null;

  return (
    <div className="flex space-x-3 md:space-x-4 font-mono">
      {days > 0 && (
        <div>{d} <span className="text-[10px] font-normal opacity-80 font-sans">DAYS</span></div>
      )}
      <div>{h} <span className="text-[10px] font-normal opacity-80 font-sans">HRS</span></div>
      <div>{m} <span className="text-[10px] font-normal opacity-80 font-sans">MIN</span></div>
      <div>{s} <span className="text-[10px] font-normal opacity-80 font-sans">SEC</span></div>
    </div>
  );
};

export default FlashSaleTimer;
