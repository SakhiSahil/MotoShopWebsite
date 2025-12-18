import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    'nav.home': 'خانه',
    'nav.products': 'محصولات',
    'nav.dealers': 'نمایندگی‌ها',
    'nav.about': 'درباره ما',
    'nav.contact': 'تماس با ما',
    'nav.faq': 'سوالات متداول',
    'dealers.title': 'نمایندگی‌های ما',
    'dealers.subtitle': 'شبکه نمایندگی‌های فولاد سکلیت در سراسر افغانستان',
    'hero.title': 'قدرت را احساس کنید',
    'hero.subtitle': 'موتورسیکلت‌های برتر جهان با بهترین قیمت',
    'hero.cta': 'مشاهده محصولات',
    'hero.secondary': 'تماس با ما',
    'products.title': 'محصولات ما',
    'products.subtitle': 'بهترین موتورسیکلت‌های دنیا',
    'products.featured': 'محصولات ویژه',
    'products.viewAll': 'مشاهده همه',
    'products.details': 'جزئیات',
    'products.price': 'قیمت',
    'products.year': 'سال ساخت',
    'products.engine': 'موتور',
    'products.power': 'قدرت',
    'products.speed': 'حداکثر سرعت',
    'about.title': 'درباره ما',
    'about.subtitle': 'تاریخچه و داستان ما',
    'about.story': 'داستان ما',
    'about.storyText': 'ما از سال ۱۳۸۰ در زمینه واردات و فروش موتورسیکلت‌های برند در افغانستان فعالیت می‌کنیم. هدف ما ارائه بهترین موتورسیکلت‌ها با کیفیت و قیمت مناسب است.',
    'about.mission': 'ماموریت ما',
    'about.missionText': 'ارائه تجربه رانندگی بی‌نظیر با موتورسیکلت‌های با کیفیت و خدمات پس از فروش عالی.',
    'about.values': 'ارزش‌های ما',
    'about.quality': 'کیفیت',
    'about.trust': 'اعتماد',
    'about.service': 'خدمات',
    'contact.title': 'تماس با ما',
    'contact.subtitle': 'ما آماده پاسخگویی به شما هستیم',
    'contact.name': 'نام و نام خانوادگی',
    'contact.email': 'ایمیل',
    'contact.phone': 'شماره تماس',
    'contact.message': 'پیام شما',
    'contact.send': 'ارسال پیام',
    'contact.address': 'آدرس',
    'contact.addressText': 'کابل، شهر نو، سرک اصلی، پلاک ۱۲۳',
    'contact.phoneNumber': '۰۷۹۹-۱۲۳۴۵۶',
    'contact.emailAddress': 'info@poladcyclet.af',
    'footer.rights': 'تمامی حقوق محفوظ است',
    'footer.description': 'بزرگترین فروشگاه موتورسیکلت در افغانستان',
    'footer.quickLinks': 'دسترسی سریع',
    'footer.social': 'شبکه‌های اجتماعی',
    'stats.customers': 'مشتری راضی',
    'stats.motorcycles': 'موتورسیکلت فروخته شده',
    'stats.brands': 'برند معتبر',
    'stats.experience': 'سال تجربه',
    'common.learnMore': 'بیشتر بدانید',
    'common.currency': 'افغانی',
  },
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.dealers': 'Dealers',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.faq': 'FAQ',
    'dealers.title': 'Our Dealers',
    'dealers.subtitle': 'Polad Cyclet dealership network across Afghanistan',
    'hero.title': 'Feel The Power',
    'hero.subtitle': "World's Premium Motorcycles at Best Prices",
    'hero.cta': 'View Products',
    'hero.secondary': 'Contact Us',
    'products.title': 'Our Products',
    'products.subtitle': "World's Best Motorcycles",
    'products.featured': 'Featured Products',
    'products.viewAll': 'View All',
    'products.details': 'Details',
    'products.price': 'Price',
    'products.year': 'Year',
    'products.engine': 'Engine',
    'products.power': 'Power',
    'products.speed': 'Top Speed',
    'about.title': 'About Us',
    'about.subtitle': 'Our History & Story',
    'about.story': 'Our Story',
    'about.storyText': 'Since 2001, we have been importing and selling premium brand motorcycles in Afghanistan. Our goal is to provide the best motorcycles with quality and competitive prices.',
    'about.mission': 'Our Mission',
    'about.missionText': 'Delivering an exceptional riding experience with quality motorcycles and excellent after-sales service.',
    'about.values': 'Our Values',
    'about.quality': 'Quality',
    'about.trust': 'Trust',
    'about.service': 'Service',
    'contact.title': 'Contact Us',
    'contact.subtitle': "We're Ready to Assist You",
    'contact.name': 'Full Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone Number',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.address': 'Address',
    'contact.addressText': 'Kabul, Shahr-e-Naw, Main Road, No. 123',
    'contact.phoneNumber': '+93-799-123456',
    'contact.emailAddress': 'info@poladcyclet.af',
    'footer.rights': 'All Rights Reserved',
    'footer.description': 'Largest Motorcycle Store in Afghanistan',
    'footer.quickLinks': 'Quick Links',
    'footer.social': 'Social Media',
    'stats.customers': 'Happy Customers',
    'stats.motorcycles': 'Motorcycles Sold',
    'stats.brands': 'Premium Brands',
    'stats.experience': 'Years Experience',
    'common.learnMore': 'Learn More',
    'common.currency': 'AFN',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('fa');

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL: language === 'fa', t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
