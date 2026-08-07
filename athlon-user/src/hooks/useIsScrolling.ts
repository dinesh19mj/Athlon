import { useState, useEffect } from 'react';

export function useIsScrolling() {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;
    const threshold = 10;
    let ticking = false;

    const handleScroll = (e: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = e.target as HTMLElement | Document;
          let currentScrollY = 0;

          if (target === document || target === window) {
            currentScrollY = window.scrollY || document.documentElement.scrollTop;
          } else if (target instanceof HTMLElement) {
            currentScrollY = target.scrollTop;
          }

          if (currentScrollY <= 0) {
            setIsHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          const diff = currentScrollY - lastScrollY;

          if (Math.abs(diff) < threshold) {
            ticking = false;
            return;
          }

          if (diff > 0 && currentScrollY > 50) {
            // Scrolling down and past initial 50px
            setIsHidden(true);
          } else {
            // Scrolling up
            setIsHidden(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  return isHidden;
}
