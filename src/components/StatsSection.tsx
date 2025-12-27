import React, { useEffect, useState, useRef } from 'react';
import { Users, Bike, Award, Clock, Wrench, MapPin, Star, Shield, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStats } from '@/hooks/useAPI';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  bike: Bike,
  award: Award,
  clock: Clock,
  wrench: Wrench,
  calendar: Clock,
  mappin: MapPin,
  star: Star,
  shield: Shield,
};

// Animated counter component with easing - re-animates on each visibility change
const AnimatedCounter: React.FC<{ value: string; isVisible: boolean }> = ({ value, isVisible }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (!isVisible) {
      // Reset to 0 when not visible
      setDisplayValue('0');
      return;
    }
    
    // Extract number from value (e.g., "5000+" -> 5000)
    const numMatch = value.match(/\d+/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetNum = parseInt(numMatch[0]);
    const suffix = value.replace(/[\d۰-۹]+/, '');
    const duration = 2000;
    const startTime = Date.now();
    
    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(targetNum * easedProgress);
      
      // Convert to Persian numerals if the original value has Persian
      const hasPersian = /[۰-۹]/.test(value);
      const displayNum = hasPersian 
        ? currentValue.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
        : currentValue.toString();
      
      setDisplayValue(displayNum + suffix);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, isVisible]);
  
  return <>{displayValue}</>;
};

const StatsSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const { stats: apiStats, loading } = useStats();
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.2 });

  // Don't render if no stats from database
  if (!loading && apiStats.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-card/50 to-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-background via-card/50 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto  relative z-10">
        {/* Section Title */}
        <div 
          className={cn(
            "text-center mb-12",
            getAnimationClasses(isVisible, scrollDirection)
          )}
        >
          <h2 className={cn(
            "text-xl md:text-2xl font-bold text-foreground mb-2",
            isRTL ? "font-vazir" : "font-poppins"
          )}>
            {isRTL ? 'دستاوردهای ما' : 'Our Achievements'}
          </h2>
          <p className={cn(
            "text-muted-foreground text-sm",
            isRTL ? "font-vazir" : ""
          )}>
            {isRTL ? 'اعداد گویای کیفیت کار ما هستند' : 'Numbers that speak for our quality'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {apiStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon?.toLowerCase()] || Users;
            return (
              <div
                key={stat.id || index}
              className={cn(
                "group  relative text-center p-6 md:p-8 rounded-3xl bg-card backdrop-blur-sm border border-primary/20 stats-card",
                getAnimationClasses(isVisible, scrollDirection)
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative  z-10">
                  <div className="inline-flex  items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-lg  group-hover:shadow-primary/20">
                    <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-primary transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <p className={cn(
                    "text-xl md:text-4xl lg:text-2xl font-bold text-foreground mb-2 tracking-tight",
                    isRTL ? "font-vazir" : "font-poppins"
                  )}>
                    <AnimatedCounter value={stat.value} isVisible={isVisible} />
                  </p>
                  <p className={cn(
                    "text-muted-foreground text-xs md:text-sm transition-colors duration-300 group-hover:text-foreground",
                    isRTL ? "font-vazir" : ""
                  )}>
                    {language === 'fa' ? (stat.label_fa || stat.label) : stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
