import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { settingsAPI, contactAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
  key: string;
}

interface ContactInfo {
  address: { en: string; fa: string };
  phone: { en: string; fa: string };
  email: { en: string; fa: string };
}

const Footer: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<{ en: string; fa: string }>({ en: 'Polad Cyclet', fa: 'فولاد سکلیت' });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: { en: 'Kabul, Shahr-e-Naw, Main Road, No. 123', fa: 'کابل، شهر نو، سرک اصلی، پلاک ۱۲۳' },
    phone: { en: '+93-799-123456', fa: '۰۷۹۹-۱۲۳۴۵۶' },
    email: { en: 'info@polad.af', fa: 'info@polad.af' },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch site settings (logo, name, social links)
        const settings = await settingsAPI.getAll();
        if (settings.site_logo?.value) {
          setLogoUrl(getImageUrl(settings.site_logo.value));
        }
        if (settings.site_name?.value || settings.site_name?.value_fa) {
          setSiteName({
            en: settings.site_name?.value,
            fa: settings.site_name?.value_fa
          });
        }
        
        // Update social links from settings
        setSocialLinks([
          { icon: Instagram, href: settings.instagram?.value || '', label: 'Instagram', key: 'instagram' },
          { icon: Twitter, href: settings.twitter?.value || '', label: 'Twitter', key: 'twitter' },
          { icon: Facebook, href: settings.facebook?.value || '', label: 'Facebook', key: 'facebook' },
          { icon: Youtube, href: settings.youtube?.value || '', label: 'YouTube', key: 'youtube' },
        ]);

        // Fetch contact settings (single source of truth for contact info)
        const contactSettings = await contactAPI.getSettings();
        if (contactSettings) {
          // WhatsApp from contact settings
          if (contactSettings.whatsapp?.value) {
            setWhatsappNumber(contactSettings.whatsapp.value.replace(/[^0-9+]/g, ''));
          }
          
          setContactInfo({
            address: { 
              en: contactSettings.address?.value || 'Kabul, Shahr-e-Naw, Main Road, No. 123',
              fa: contactSettings.address?.value_fa || 'هرات ،  جاده قمندانی، پلاک ۱۲۳'
            },
            phone: { 
              en: contactSettings.phone?.value || '+93-799-123456',
              fa: contactSettings.phone?.value_fa || '۰۷۹۹-۱۲۳۴۵۶'
            },
            email: { 
              en: contactSettings.email?.value || 'info@polad.af',
              fa: contactSettings.email?.value_fa || 'info@polad.af'
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchData();
  }, []);

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];
  
  const lang = language === 'fa' ? 'fa' : 'en';

  return (
    <footer className="bg-card border-t border-border">
      <div className="container  mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex justify-center items-center flex-col">
                <Link to="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-10 h-10 rounded-full object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-full racing-gradient flex items-center justify-center glow-effect">
                  <span className="text-primary-foreground font-bold text-lg">M</span>
                </div>
              )}
              <span className={cn(
                "font-bold text-xl text-foreground",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {isRTL ? siteName.fa : siteName.en}
              </span>
            </Link>
            <p className={cn(
              "text-muted-foreground text-sm leading-relaxed",
              isRTL ? "font-vazir" : ""
            )}>
              {t('footer.description')}
            </p>
            </div>
          
            <div className="flex gap-3 justify-center items-center">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors duration-300"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {socialLinks.filter(s => s.href && s.href !== '#' && s.href !== '').map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "text-muted-foreground hover:text-primary transition-colors duration-300 text-sm",
                      isRTL ? "font-vazir" : ""
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {t('nav.contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className={cn(
                  "text-muted-foreground text-sm",
                  isRTL ? "font-vazir" : ""
                )}>
                  {contactInfo.address[lang]}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {contactInfo.phone[lang]}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {contactInfo.email[lang]}
                </span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRTL ? "font-vazir" : "font-poppins"
            )}>
              {t('footer.social')}
            </h4>
            <p className={cn(
              "text-muted-foreground text-sm mb-4",
              isRTL ? "font-vazir" : ""
            )}>
              {isRTL 
                ? 'ما را در شبکه‌های اجتماعی دنبال کنید'
                : 'Follow us on social media'
              }
            </p>
            <div className="flex gap-3">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
              {socialLinks.filter(s => s.href && s.href !== '#' && s.href !== '').map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className={cn(
            "text-muted-foreground text-sm",
            isRTL ? "font-vazir" : ""
          )}>
             {isRTL ? siteName.fa : siteName.en}. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
