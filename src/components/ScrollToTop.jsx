import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when pathname changes
    window.scrollTo(0, 0);
    
    // Fallback for some browsers or transitions
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Using instant to avoid visible scrolling animation during transitions
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
