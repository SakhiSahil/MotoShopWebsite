import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { MapPin, Phone, Mail, Clock, Search, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDealers, Dealer } from '@/hooks/useAPI';

// Fallback static data
const staticDealers: Dealer[] = [
  {
    id: 1,
    name: 'Kabul Central Dealership',
    name_fa: 'نمایندگی مرکزی کابل',
    address: 'Kabul, Shahr-e-Naw, Main Road',
    address_fa: 'کابل، شهر نو، سرک اصلی',
    city: 'Kabul',
    city_fa: 'کابل',
    phone: '+93-799-111111',
    email: 'kabul@poladcyclet.af',
    hours: 'Sat-Thu: 8 AM - 6 PM',
    hours_fa: 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52615.37529687997!2d69.13503772695312!3d34.55301080000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb0d2b5b7f5%3A0xfff531b6e2a3d6f8!2sKabul%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s',
    sort_order: 0,
    active: true,
  },
  {
    id: 2,
    name: 'Herat Dealership',
    name_fa: 'نمایندگی هرات',
    address: 'Herat, Welayat Road',
    address_fa: 'هرات، جاده ولایت',
    city: 'Herat',
    city_fa: 'هرات',
    phone: '+93-799-222222',
    email: 'herat@poladcyclet.af',
    hours: 'Sat-Thu: 8 AM - 6 PM',
    hours_fa: 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107234.02741999999!2d62.1540!3d34.3529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f3ce1da33f91f7d%3A0x7a6348f7ab8e6f2!2sHerat%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s',
    sort_order: 1,
    active: true,
  },
  {
    id: 3,
    name: 'Mazar-i-Sharif Dealership',
    name_fa: 'نمایندگی مزار شریف',
    address: 'Mazar-i-Sharif, Main Street',
    address_fa: 'مزار شریف، سرک عمومی',
    city: 'Mazar-i-Sharif',
    city_fa: 'مزار شریف',
    phone: '+93-799-333333',
    email: 'mazar@poladcyclet.af',
    hours: 'Sat-Thu: 8 AM - 6 PM',
    hours_fa: 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51234.09241999999!2d67.1128!3d36.7069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f6007b5a16c48d7%3A0x7f3b89c9f8d1e2a4!2sMazar-i-Sharif%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s',
    sort_order: 2,
    active: true,
  },
  {
    id: 4,
    name: 'Kandahar Dealership',
    name_fa: 'نمایندگی قندهار',
    address: 'Kandahar, Shaheed Square',
    address_fa: 'قندهار، چهارراهی شهید',
    city: 'Kandahar',
    city_fa: 'قندهار',
    phone: '+93-799-444444',
    email: 'kandahar@poladcyclet.af',
    hours: 'Sat-Thu: 8 AM - 6 PM',
    hours_fa: 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54321.12341999999!2d65.7101!3d31.6078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed8f7ab8e6f2d3c%3A0x8a7b6c5d4e3f2a1b!2sKandahar%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s',
    sort_order: 3,
    active: true,
  },
];

const Dealers: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { dealers: apiDealers, loading } = useDealers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Use API data if available, fallback to static
  const dealers: Dealer[] = apiDealers.length > 0 ? apiDealers : staticDealers;

  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities: Record<string, { en: string; fa: string }> = {};
    dealers.forEach(dealer => {
      if (dealer.city && !uniqueCities[dealer.city]) {
        uniqueCities[dealer.city] = { en: dealer.city, fa: dealer.city_fa || dealer.city };
      }
    });
    return Object.entries(uniqueCities).map(([key, value]) => ({ key, ...value }));
  }, [dealers]);

  // Filter dealers based on search and city
  const filteredDealers = useMemo(() => {
    return dealers.filter(dealer => {
      const matchesSearch = searchQuery === '' || 
        dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.name_fa.includes(searchQuery) ||
        dealer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.address_fa?.includes(searchQuery) ||
        dealer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.city_fa?.includes(searchQuery);
      
      const matchesCity = selectedCity === 'all' || dealer.city === selectedCity;
      
      return matchesSearch && matchesCity;
    });
  }, [dealers, searchQuery, selectedCity]);

  const openMapInNewTab = (mapUrl: string) => {
    // Extract coordinates or location from embed URL and open in Google Maps
    window.open(mapUrl.replace('/embed?', '/place?'), '_blank');
  };

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'نمایندگی‌ها | فولاد سکلیت' : 'Dealers | Polad Cyclet'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'لیست نمایندگی‌های فولاد سکلیت در سراسر افغانستان' 
            : 'List of Polad Cyclet dealerships across Afghanistan'
          } 
        />
      </Helmet>

      <div className={cn("min-h-screen bg-background", isRTL ? "font-vazir" : "font-poppins")}>
        <Header />
        
        <main className="pt-12">
          {/* Hero Section */}
          <section className="relative py-8 md:py-10 bg-gradient-to-b from-primary/10 to-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className={cn(
                "text-xl md:text-2xl font-bold mb-4 text-foreground",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {t('dealers.title')}
              </h1>
              <p className="text-[12px] md:text-[14px]    text-muted-foreground max-w-2xl mx-auto">
                {t('dealers.subtitle')}
              </p>
            </div>
          </section>

          {/* Search and Filter Section */}
          <section className="py-6 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'جستجو در نمایندگی‌ها...' : 'Search dealers...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10", isRTL && "text-right")}
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={isRTL ? 'انتخاب شهر' : 'Select City'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isRTL ? 'همه شهرها' : 'All Cities'}
                    </SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.key} value={city.key}>
                        {language === 'fa' ? city.fa : city.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Dealers Grid */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredDealers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {isRTL ? 'نمایندگی‌ای یافت نشد' : 'No dealers found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDealers.map((dealer) => (
                    <Card key={dealer.id} className="bg-card border-border hover:border-primary/50 transition-colors duration-300">
                      <CardHeader className="flex flex-row items-start justify-between">
                        <CardTitle className={cn(
                          "text-xl md:text-2xl text-primary",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {language === 'fa' ? dealer.name_fa : dealer.name}
                        </CardTitle>
                        {dealer.map_url && (
                          <button
                            onClick={() => openMapInNewTab(dealer.map_url)}
                            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                            title={isRTL ? 'مشاهده در نقشه' : 'View on Map'}
                          >
                            <ExternalLink className="w-5 h-5 text-primary" />
                          </button>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(dealer.city || dealer.city_fa) && (
                          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            {language === 'fa' ? dealer.city_fa : dealer.city}
                          </div>
                        )}
                        {(dealer.address || dealer.address_fa) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {language === 'fa' ? dealer.address_fa : dealer.address}
                            </span>
                          </div>
                        )}
                        {dealer.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                            <a 
                              href={`tel:${dealer.phone}`} 
                              className="text-muted-foreground hover:text-primary transition-colors"
                              dir="ltr"
                            >
                              {dealer.phone}
                            </a>
                          </div>
                        )}
                        {dealer.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                            <a 
                              href={`mailto:${dealer.email}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {dealer.email}
                            </a>
                          </div>
                        )}
                        {(dealer.hours || dealer.hours_fa) && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {language === 'fa' ? dealer.hours_fa : dealer.hours}
                            </span>
                          </div>
                        )}
                        
                        {/* Google Maps Embed */}
                        {dealer.map_url && (
                          <div className="mt-4 rounded-lg overflow-hidden border border-border">
                            <iframe
                              src={dealer.map_url}
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title={`${dealer.name} location`}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Dealers;
