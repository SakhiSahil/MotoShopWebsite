import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aboutAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

interface AboutData {
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  image: string;
}

const AboutSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.15 });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await aboutAPI.get();
        if (data && (data.title || data.title_fa || data.content || data.content_fa)) {
          setAbout(data);
        }
      } catch (error) {
        console.error('Error fetching about:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // Don't render if no about data from database
  if (!loading && !about) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const title = language === 'fa' ? about?.title_fa : about?.title;
  const content = language === 'fa' ? about?.content_fa : about?.content;
  const image = about?.image || '/placeholder.svg';

  return (
    <section ref={sectionRef} className="py-16  bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center  ">
            <div className="inline-flex bg-[#f6bcaf89]   shadow-[0_0_80px_rgba(239,68,68,0.7)]  items-center gap-2 px-4 py-2 rounded-full  border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className={cn(
                "text-xs  text-primary font-medium",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {isRTL ? 'درباره ما' : 'About Us'}
              </span>
            </div>
          
        </div>
        <div className="flex justify-center">
                   <h2 className={cn(
              "text-[12px] md:text-[14px]  text-[#7f8c8d]  mb-6 leading-tight",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {title}
            </h2>
        </div>
          
       
        <div className="grid md:grid-cols-2 gap-10 md:gap-80 items-center">
          {/* Content */}
          <div 
            className={cn(
              "transition-all duration-700 mr-4 md:mr-20 ease-out",
              isVisible ? "opacity-100 translate-x-0" : scrollDirection === 'down' ? "opacity-0 translate-x-12" : "opacity-0 -translate-x-12",
              isRTL && "md:order-1"
            )}
            style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
          >

         
            
            <p className={cn(
              "text-muted-foreground text-sm md:text-base leading-relaxed mb-8",
              isRTL ? "font-vazir" : ""
            )}>
              {content && content.length > 300 ? content.substring(0, 300) + '...' : content}
            </p>

          
          </div>

          {/* imgs */}
         <div 
            className={cn(
              "relative transition-all duration-700 flex justify-center ease-out",
              isVisible ? "opacity-100 translate-x-0" : scrollDirection === 'down' ? "opacity-0 -translate-x-12" : "opacity-0 translate-x-12",
              isRTL && "md:order-2"
            )}
          >
            <div className="relative">
              {/* Main image */}
              <div className="relative w-80 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={getImageUrl(image)}
                  alt={title || ''}
                  className="w-80 h-80 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
              {/* Decorative frame */}
              <div className="absolute -bottom-4 -right-4 w-80 h-80 border-2 border-primary/20 rounded-3xl -z-10" />
              <div className="absolute -bottom-8 -right-8 w-80 h-80 border border-primary/10 rounded-3xl -z-20" />
            </div>
          </div>
        </div>
          <Button
              asChild
              className={cn(
                "racing-gradient mt-10 md:-mt-8 text-primary-foreground hover:opacity-90 gap-2",
                isRTL ? "font-vazir" : "font-poppins"
              )}
            >
              <Link to="/about">
                {isRTL ? 'بیشتر بدانید' : 'Learn More'}
                {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </Button>
      </div>
    </section>
  );
};

export default AboutSection;
