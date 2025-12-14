import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSlides, useProducts } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

const HeroCarousel: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { slides, loading: slidesLoading } = useSlides();
  const { products, loading: productsLoading } = useProducts();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: isRTL ? 'rtl' : 'ltr' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Use slides from API, fallback to featured products
  const displaySlides = slides.length > 0 ? slides : products.filter(p => p.featured).map(m => ({
    id: 0,
    title: m.name,
    titleFa: m.nameFa,
    subtitle: m.description,
    subtitleFa: m.descriptionFa,
    image: m.image,
    buttonText: 'View Products',
    buttonTextFa: 'مشاهده محصولات',
    buttonLink: '/products',
    power: m.power,
    topSpeed: m.topSpeed,
    engine: m.engine,
    brand: m.brand,
    brandFa: m.brandFa,
  }));

  const currentSlide = displaySlides[selectedIndex] || displaySlides[0];

  if (slidesLoading && productsLoading) {
    return (
      <section className="h-screen min-h-[600px] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/50 z-[1] pointer-events-none" />
      
      {/* Carousel - only for background images */}
      <div ref={emblaRef} className="h-full overflow-hidden absolute inset-0 z-0">
        <div className="flex h-full">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div className="absolute inset-0">
                <img
                  src={getImageUrl(slide.image)}
                  alt={language === 'fa' ? slide.titleFa : slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Overlay - separate layer with proper z-index for clickable buttons */}
      {currentSlide && (
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl animate-fade-in">
              {/* Badge */}
              {'brand' in currentSlide && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className={cn(
                    "text-sm text-primary font-medium",
                    isRTL ? "font-vazir" : "font-orbitron"
                  )}>
                    {language === 'fa' ? (currentSlide as any).brandFa : (currentSlide as any).brand}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className={cn(
                "text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-tight",
                isRTL ? "font-vazir" : "font-orbitron"
              )}>
                {language === 'fa' ? currentSlide.titleFa : currentSlide.title}
              </h1>

              {/* Description */}
              <p className={cn(
                "text-lg md:text-xl text-muted-foreground mb-6 max-w-xl",
                isRTL ? "font-vazir" : ""
              )}>
                {language === 'fa' ? currentSlide.subtitleFa : currentSlide.subtitle}
              </p>

              {/* Specs (if available) */}
              {'power' in currentSlide && (
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {(currentSlide as any).power}
                    </p>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRTL ? "font-vazir" : "font-orbitron"
                    )}>
                      {t('products.power')}
                    </p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {(currentSlide as any).topSpeed}
                    </p>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRTL ? "font-vazir" : "font-orbitron"
                    )}>
                      {t('products.speed')}
                    </p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {(currentSlide as any).engine}
                    </p>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRTL ? "font-vazir" : "font-orbitron"
                    )}>
                      {t('products.engine')}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons - fully clickable */}
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "racing-gradient text-primary-foreground hover:opacity-90 glow-effect",
                    isRTL ? "font-vazir" : "font-orbitron"
                  )}
                >
                  <Link to={currentSlide.buttonLink || "/products"}>
                    {language === 'fa' ? (currentSlide.buttonTextFa || t('hero.cta')) : (currentSlide.buttonText || t('hero.cta'))}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "border-primary/50 text-foreground hover:bg-primary/10",
                    isRTL ? "font-vazir" : "font-orbitron"
                  )}
                >
                  <Link to="/contact">{t('hero.secondary')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 left-4 right-4 z-20 flex justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground pointer-events-auto transition-all duration-300"
        >
          {isRTL ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground pointer-events-auto transition-all duration-300"
        >
          {isRTL ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
