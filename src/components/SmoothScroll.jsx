import { ReactLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function SmoothScroll({ children }) {
  const location = useLocation();
  const lenisRef = useRef();

  useEffect(() => {
    // Optionally reset scroll on location change if lenis doesn't do it automatically
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  // Global solution to freeze smooth scroll when any modal locks body scroll
  useEffect(() => {
    const handleOverflowChange = () => {
      const isHidden = document.body.style.overflow === 'hidden';
      if (isHidden) {
        lenisRef.current?.lenis?.stop();
      } else {
        lenisRef.current?.lenis?.start();
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          handleOverflowChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    handleOverflowChange(); // Check initial state

    return () => observer.disconnect();
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
