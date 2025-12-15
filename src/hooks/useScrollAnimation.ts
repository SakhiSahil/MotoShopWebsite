import { useState, useEffect, useRef } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const { threshold = 0.15, rootMargin = '0px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fallback timeout
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, 800);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          clearTimeout(fallbackTimer);
        } else if (hasAnimated) {
          // Only hide when scrolling away after first animation
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [threshold, rootMargin, hasAnimated]);

  return { isVisible, sectionRef, scrollDirection, hasAnimated };
};

// Animation classes based on visibility and scroll direction
export const getAnimationClasses = (
  isVisible: boolean, 
  scrollDirection: 'up' | 'down' = 'down',
  delay: number = 0
): string => {
  const baseTransition = 'transition-all duration-700 ease-out';
  
  if (isVisible) {
    return `${baseTransition} opacity-100 translate-y-0`;
  }
  
  // When scrolling down, items come from below
  // When scrolling up, items come from above
  const translateClass = scrollDirection === 'down' ? 'translate-y-12' : '-translate-y-12';
  return `${baseTransition} opacity-0 ${translateClass}`;
};
