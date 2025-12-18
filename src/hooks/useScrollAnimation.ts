import { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  // Optional: set a custom scroll container as root (e.g., a wrapper with overflow)
  root?: Element | null;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const { threshold = 0, rootMargin = '0px', root = null } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  const lastScrollY = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create/attach observer
  const attachObserver = useCallback(
    (el: HTMLElement) => {
      // Clean up any previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      const obs = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold, rootMargin, root: root ?? null }
      );

      obs.observe(el);
      observerRef.current = obs;
    },
    [threshold, rootMargin, root]
  );

  // Callback ref to attach as soon as the element mounts/changes
  const sectionRef = useCallback((el: HTMLElement | null) => {
    // Unobserve old element
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    elementRef.current = el;

    if (el) {
      // Initial check before paint (prevents "stuck hidden" on refresh/navigation)
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0;
      setIsVisible(inView);

      // Attach observer
      attachObserver(el);
    }
  }, [attachObserver]);

  // Safety: re-validate visibility after mount (accounts for late layout changes)
  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;
    setIsVisible(inView);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { isVisible, sectionRef, scrollDirection };
};

// Animation classes based on visibility and scroll direction
export const getAnimationClasses = (
  isVisible: boolean,
  scrollDirection: 'up' | 'down' = 'down',
): string => {
  // Restrict transitions to the properties we animate
  const baseTransition = 'transition-opacity transition-transform duration-700 ease-out';

  if (isVisible) {
    return `${baseTransition} opacity-100 translate-y-0`;
  }

  const translateClass = scrollDirection === 'down' ? 'translate-y-12' : '-translate-y-12';
  return `${baseTransition} opacity-0 ${translateClass}`;
};
