import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrands } from '@/hooks/useAPI';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

const BrandsSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const { brands, loading } = useBrands();
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.15 });

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Don't render if no brands from database
  if (brands.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 
          className={cn(
            "text-center text-xl md:text-2xl font-bold text-foreground mb-10",
            getAnimationClasses(isVisible, scrollDirection),
            isRTL ? "font-vazir" : "font-poppins"
          )}
        >
          {isRTL ? 'برندهای معتبر ما' : 'Trusted Brands'}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className={cn(
                "group flex flex-col items-center cursor-pointer",
                getAnimationClasses(isVisible, scrollDirection)
              )}
              style={{ transitionDelay: isVisible ? `${(index + 1) * 60}ms` : '0ms' }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-background border  flex items-center justify-center border-red-300  shadow-[0_0_100px_rgba(239,68,68,0.3)]  transition-all duration-300 group-hover:border-primary group-hover:scale-110 group-hover:shadow-lg overflow-hidden">
                {brand.logo.startsWith('http') || brand.logo.startsWith('/') ? (
                  <img src={getImageUrl(brand.logo)} alt={brand.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                ) : (
                  <span className="text-3xl md:text-4xl">{brand.logo}</span>
                )}
              </div>
              <p className={cn(
                "mt-2 text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {language === 'fa' ? brand.nameFa : brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
