import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { settingsAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<{ en: string; fa: string }>({ en: 'MotoShop', fa: 'موتوشاپ' });
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsAPI.getAll();
        if (settings.site_logo?.value) {
          setLogoUrl(settings.site_logo.value);
        }
        if (settings.site_name?.value || settings.site_name?.value_fa) {
          setSiteName({
            en: settings.site_name?.value || 'MotoShop',
            fa: settings.site_name?.value_fa || 'موتوشاپ'
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/dealers', label: t('nav.dealers') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={getImageUrl(logoUrl)} 
                alt="Logo" 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full racing-gradient flex items-center justify-center glow-effect">
                <span className="text-primary-foreground font-bold text-lg md:text-xl">M</span>
              </div>
            )}
            <span className={cn(
              "font-bold text-lg md:text-xl text-foreground",
              isRTL ? "font-vazir" : "font-orbitron"
            )}>
              {isRTL ? siteName.fa : siteName.en}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors duration-300",
                  isRTL ? "font-vazir" : "font-orbitron",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
              className="h-9 w-9 rounded-full"
            >
              <Languages className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-3 text-base font-medium transition-colors duration-300",
                  isRTL ? "font-vazir" : "font-orbitron",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
