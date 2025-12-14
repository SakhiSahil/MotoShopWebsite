import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useAPI';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FeaturedProducts: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { products, loading } = useProducts();
  const featuredMotorcycles = products.filter(m => m.featured);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className={cn(
              "section-title text-foreground mb-2",
              isRTL ? "font-vazir" : "font-orbitron"
            )}>
              {t('products.featured')}
            </h2>
            <p className={cn(
              "text-muted-foreground text-lg",
              isRTL ? "font-vazir" : ""
            )}>
              {t('products.subtitle')}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className={cn(
              "self-start md:self-auto border-primary/50 text-foreground hover:bg-primary/10 gap-2",
              isRTL ? "font-vazir" : "font-orbitron"
            )}
          >
            <Link to="/products">
              {t('products.viewAll')}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMotorcycles.map((motorcycle, index) => (
            <div
              key={motorcycle.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
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
