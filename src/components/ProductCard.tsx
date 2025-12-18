import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Gauge, Zap, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Motorcycle } from '@/data/motorcycles';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

interface ProductCardProps {
  motorcycle: Motorcycle;
}

const ProductCard: React.FC<ProductCardProps> = ({ motorcycle }) => {
  const { t, isRTL, language } = useLanguage();

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden card-hover hover:border-primary/30">
      {/* Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={getImageUrl(motorcycle.image)}
          alt={language === 'fa' ? motorcycle.nameFa : motorcycle.name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Featured Badge */}
        {motorcycle.featured && (
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium racing-gradient text-primary-foreground",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {isRTL ? 'ویژه' : 'Featured'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <p className={cn(
          "text-xs text-primary font-medium mb-1",
          isRTL ? "font-vazir" : "font-poppins"
        )}>
          {language === 'fa' ? motorcycle.brandFa : motorcycle.brand}
        </p>

        {/* Name */}
        <h3 className={cn(
          "text-lg font-bold text-foreground mb-3 line-clamp-1",
          isRTL ? "font-vazir" : "font-poppins"
        )}>
          {language === 'fa' ? motorcycle.nameFa : motorcycle.name}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>{motorcycle.power}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{motorcycle.engine}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{language === 'fa' ? (motorcycle.yearFa || motorcycle.year) : motorcycle.year}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRTL ? "font-vazir" : ""
            )}>
              {t('products.price')}
            </p>
            <p className={cn(
              "text-lg font-bold text-foreground",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {language === 'fa' 
                ? `${motorcycle.priceFa} ${t('common.currency')}`
                : `$${motorcycle.price.toLocaleString()}`
              }
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className={cn(
              "racing-gradient text-primary-foreground gap-1",
              isRTL ? "font-vazir" : "font-poppins"
            )}
          >
            <Link to={`/products/${motorcycle.id}`}>
              {t('products.details')}
              {isRTL ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
