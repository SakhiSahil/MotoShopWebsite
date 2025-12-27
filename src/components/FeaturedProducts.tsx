import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useAPI';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FeaturedProducts: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { products, loading } = useProducts();
  const featuredMotorcycles = products.filter(m => m.featured);
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.1 });

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Don't render if no featured products
  if (featuredMotorcycles.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "flex flex-col  md:flex-row  justify-center gap-3 mb-8",
          getAnimationClasses(isVisible, scrollDirection)
        )}>
         
          <div className="flex flex-col justify-center">
            <h2 className={cn(
              "text-xl md:text-2xl font-bold text-foreground mb-1",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {t('products.featured')}
            </h2>
            <p className={cn(
              "text-muted-foreground mt-4 text-sm",
              isRTL ? "font-vazir" : ""
            )}>
              {t('products.subtitle')}
            </p>
            
         <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              "self-start mt-4 md:self-auto border-primary/50 text-foreground bg-primary/10 hover:bg-primary/20 gap-2 text-xs",
              isRTL ? "font-vazir" : "font-poppins"
            )}
          >
            <Link to="/products">
              {t('products.viewAll')}
              {isRTL ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
            </Link>
          </Button>
          </div>
        
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredMotorcycles.map((motorcycle, index) => (
            <div
              key={motorcycle.id}
              className={cn(
                getAnimationClasses(isVisible, scrollDirection)
              )}
              style={{ transitionDelay: isVisible ? `${(index + 1) * 80}ms` : '0ms' }}
            >
              <ProductCard motorcycle={motorcycle} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
