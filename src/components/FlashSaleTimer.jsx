import { useState, useEffect } from 'react';

const FlashSaleTimer = () => {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 44 * 60 + 32); // 02:44:32 in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(2 * 3600 + 44 * 60 + 32); // Reset loop
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0')
    };
  };

  const { h, m, s } = formatTime(timeLeft);

  return (
    <div className="flex space-x-4">
      <div>{h} <span className="text-[10px] font-normal">HRS</span></div>
      <div>{m} <span className="text-[10px] font-normal">MIN</span></div>
      <div>{s} <span className="text-[10px] font-normal">SEC</span></div>
    </div>
  );
};

export default FlashSaleTimer;
