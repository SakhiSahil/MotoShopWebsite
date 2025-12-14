import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrands } from '@/hooks/useAPI';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

const BrandsSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const { brands, loading } = useBrands();

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className={cn(
          "text-center text-2xl md:text-3xl font-bold text-foreground mb-12",
          isRTL ? "font-vazir" : "font-orbitron"
        )}>
          {isRTL ? 'برندهای معتبر' : 'Trusted Brands'}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className="group flex flex-col items-center animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:scale-110 group-hover:shadow-lg overflow-hidden">
                {brand.logo.startsWith('http') || brand.logo.startsWith('/') ? (
                  <img src={getImageUrl(brand.logo)} alt={brand.name} className="w-14 h-14 object-contain" />
                ) : (
                  <span className="text-4xl md:text-5xl">{brand.logo}</span>
                )}
              </div>
              <p className={cn(
                "mt-3 text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300",
                isRTL ? "font-vazir" : "font-orbitron"
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
