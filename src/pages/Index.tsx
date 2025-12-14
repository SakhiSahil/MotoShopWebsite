import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';
import FeaturedProducts from '@/components/FeaturedProducts';
import StatsSection from '@/components/StatsSection';
import BrandsSection from '@/components/BrandsSection';
import FAQSection from '@/components/FAQSection';

const Index: React.FC = () => {
  const { isRTL } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'موتوشاپ | فروشگاه موتورسیکلت' : 'MotoShop | Motorcycle Store'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'بزرگترین فروشگاه موتورسیکلت در افغانستان. موتورسیکلت‌های برند با بهترین قیمت و خدمات پس از فروش.'
            : 'Largest motorcycle store in Afghanistan. Premium brand motorcycles with best prices and after-sales service.'
          } 
        />
        <meta name="keywords" content="motorcycle, motorbike, Kawasaki, Ducati, BMW, Honda, Yamaha, موتورسیکلت, موتور, افغانستان, کابل" />
        <link rel="canonical" href="https://motoshop.af" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroCarousel />
          <FeaturedProducts />
          <StatsSection />
          <BrandsSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
