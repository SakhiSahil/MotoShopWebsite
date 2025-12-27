import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSlides, useProducts } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

const HeroCarousel: React.FC = () => {
  const { isRTL, language } = useLanguage();
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
    image: m.image,
  }));

  if (slidesLoading && productsLoading) {
    return (
      <section className="h-[25vh] md:h-[90vh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }
  // سلادیر
  return (
    <section className="relative h-[25vh] md:h-[90vh] w-full overflow-hidden bg-muted">
      {/* Carousel */}
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="flex-[0_0_100%] min-w-0 relative h-full"
            >
              <img
                src={getImageUrl(slide.image)}
                alt={language === 'fa' ? slide.titleFa : slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 z-10 flex justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/30 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground pointer-events-auto transition-all duration-300"
        >
          {isRTL ? <ChevronRight className="h-5 w-5 md:h-6 md:w-6" /> : <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/30 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground pointer-events-auto transition-all duration-300"
        >
          {isRTL ? <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" /> : <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />}
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-6 bg-primary"
                : "w-2 bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;