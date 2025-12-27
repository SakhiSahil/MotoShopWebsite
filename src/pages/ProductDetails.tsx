import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Zap, Gauge, Calendar, Fuel, Weight, ChevronLeft, ChevronRight, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProduct, useProducts, useContactSettings } from '@/hooks/useAPI';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const { product: motorcycle, loading } = useProduct(id || '');
  const { products } = useProducts();
  const { getContactSetting } = useContactSettings();

  // Get contact info for CTA buttons
  const phoneNumber = getContactSetting('phone', 'en') || '+93701234567';
  const whatsappNumber = getContactSetting('whatsapp', 'en') || '+93701234567';

  const handleCall = () => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleWhatsApp = () => {
    const cleanWhatsapp = whatsappNumber.replace(/\s/g, '').replace('+', '');
    const productName = language === 'fa' ? motorcycle?.nameFa : motorcycle?.name;
    const message = language === 'fa' 
      ? `سلام، من علاقمند به خرید ${productName} هستم. لطفا اطلاعات بیشتری بدهید.`
      : `Hello, I'm interested in buying ${productName}. Please provide more information.`;
    window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28  flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 flex items-center justify-center  min-h-[60vh]">
          <div className="text-center ">
            <h1 className={cn(
              "text-2xl font-bold text-foreground mb-4",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {isRTL ? 'محصول یافت نشد' : 'Product Not Found'}
            </h1>
            <Button asChild className="racing-gradient text-primary-foreground">
              <Link to="/products">
                {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                {isRTL ? 'بازگشت به محصولات' : 'Back to Products'}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Use gallery from motorcycle or create mock gallery
  const galleryImages = motorcycle.gallery && motorcycle.gallery.length > 0
    ? motorcycle.gallery
    : [
        motorcycle.image,
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
        'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80',
      ];

  const specs = [
    { icon: Gauge, label: t('products.engine'), value: language === 'fa' ? (motorcycle.engineFa || motorcycle.engine) : motorcycle.engine },
    { icon: Zap, label: t('products.power'), value: language === 'fa' ? (motorcycle.powerFa || motorcycle.power) : motorcycle.power },
    { icon: Fuel, label: t('products.speed'), value: language === 'fa' ? (motorcycle.topSpeedFa || motorcycle.topSpeed) : motorcycle.topSpeed },
    { icon: Calendar, label: t('products.year'), value: language === 'fa' ? (motorcycle.yearFa || String(motorcycle.year)) : String(motorcycle.year) },
    { icon: Weight, label: isRTL ? 'وزن' : 'Weight', value: language === 'fa' ? (motorcycle.weightFa || motorcycle.weight || '200 kg') : (motorcycle.weight || '200 kg') },
    { icon: Fuel, label: isRTL ? 'ظرفیت باک' : 'Fuel Tank', value: language === 'fa' ? (motorcycle.fuelCapacityFa || motorcycle.fuelCapacity || '17 L') : (motorcycle.fuelCapacity || '17 L') },
  ];

  const relatedProducts = products
    .filter(m => m.category === motorcycle.category && String(m.id) !== String(motorcycle.id))
    .slice(0, 4);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      <Helmet>
        <title>{language === 'fa' ? motorcycle.nameFa : motorcycle.name} | {isRTL ? 'فولاد سکلیت' : 'Polad Cyclet'}</title>
        <meta 
          name="description" 
          content={language === 'fa' ? motorcycle.descriptionFa : motorcycle.description} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 md:pt-28">
          {/* Breadcrumb */}
          <section className="py-4 border-b border-border ">
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
                <span>/</span>
                <Link to="/products" className="hover:text-primary transition-colors">
                  {t('nav.products')}
                </Link>
                <span>/</span>
                <span className="text-foreground">
                  {language === 'fa' ? motorcycle.nameFa : motorcycle.name}
                </span>
              </nav>
            </div>
          </section>

          {/* Product Details */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border group">
                    <img
                      src={getImageUrl(galleryImages[selectedImage])}
                      alt={language === 'fa' ? motorcycle.nameFa : motorcycle.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>

                    {/* Featured Badge */}
                    {motorcycle.featured && (
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                        <span className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium racing-gradient text-primary-foreground",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {isRTL ? 'ویژه' : 'Featured'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-4 gap-3">
                    {galleryImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          selectedImage === index
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`${motorcycle.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {/* Brand */}
                  <p className={cn(
                    "text-primary font-medium",
                    isRTL ? "font-vazir" : "font-poppins"
                  )}>
                    {language === 'fa' ? motorcycle.brandFa : motorcycle.brand}
                  </p>

                  {/* Name */}
                  <h1 className={cn(
                    "text-3xl md:text-4xl font-bold text-foreground",
                    isRTL ? "font-vazir" : "font-poppins"
                  )}>
                    {language === 'fa' ? motorcycle.nameFa : motorcycle.name}
                  </h1>

                  {/* Description */}
                  <p className={cn(
                    "text-muted-foreground text-lg leading-relaxed",
                    isRTL ? "font-vazir" : ""
                  )}>
                    {language === 'fa' ? motorcycle.descriptionFa : motorcycle.description}
                    {' '}
                    {isRTL 
                      ? 'این موتورسیکلت با طراحی منحصر به فرد و عملکرد بی‌نظیر، بهترین انتخاب برای علاقه‌مندان به سرعت و هیجان است. موتور قدرتمند و سیستم تعلیق پیشرفته، تجربه رانندگی فوق‌العاده‌ای را برای شما فراهم می‌کند.'
                      : 'This motorcycle with its unique design and exceptional performance is the best choice for speed and excitement enthusiasts. The powerful engine and advanced suspension system provide an extraordinary riding experience.'
                    }
                  </p>

                  {/* Price */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <p className={cn(
                      "text-sm text-muted-foreground mb-2",
                      isRTL ? "font-vazir" : ""
                    )}>
                      {t('products.price')}
                    </p>
                    <p className={cn(
                      "text-3xl md:text-4xl font-bold text-primary",
                      isRTL ? "font-vazir" : "font-poppins"
                    )}>
                      {language === 'fa' 
                        ? `${motorcycle.priceFa} ${t('common.currency')}`
                        : `$${typeof motorcycle.price === 'number' ? motorcycle.price.toLocaleString() : motorcycle.price}`
                      }
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {specs.map((spec, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-card border border-border text-center"
                      >
                        <spec.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className={cn(
                          "text-xs text-muted-foreground mb-1",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {spec.label}
                        </p>
                        <p className={cn(
                          "font-semibold text-foreground",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {spec.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      onClick={handleCall}
                      className={cn(
                        "flex-1 racing-gradient p-3 md:p-0  text-primary-foreground gap-2",
                        isRTL ? "font-vazir" : "font-poppins"
                      )}
                    >
                      <Phone className="h-5 w-5" />
                      {isRTL ? 'تماس برای خرید' : 'Call to Buy'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleWhatsApp}
                      className={cn(
                        "flex-1 border-primary/50 p-3 md:p-0 text-foreground hover:bg-primary/10 gap-2",
                        isRTL ? "font-vazir" : "font-poppins"
                      )}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {isRTL ? 'پیام در واتساپ' : 'WhatsApp'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="py-12 md:py-16 bg-card border-t border-border">
              <div className="container mx-auto px-4">
                <h2 className={cn(
                  "text-2xl md:text-3xl font-bold text-foreground mb-8",
                  isRTL ? "font-vazir" : "font-poppins"
                )}>
                  {isRTL ? 'محصولات مشابه' : 'Related Products'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((product) => (
                    <ProductCard key={product.id} motorcycle={product} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetails;
