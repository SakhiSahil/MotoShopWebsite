import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { settingsAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<{ en: string; fa: string }>({ en: 'Polad Cyclet', fa: 'فولاد سکلیت' });
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
            en: settings.site_name?.value,
            fa: settings.site_name?.value_fa
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
    <div className="flex items-center justify-between h-[6vh] md:h-[9vh]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        {logoUrl && (
          <img
            src={getImageUrl(logoUrl)}
            alt="Logo"
            className="w-8 h-8 md:w-8 md:h-7  object-contain"
          />
        )}
        <span
          className={cn(
            "font-bold text-[14px] md:text-[18px] text-foreground",
            isRTL ? "font-vazir" : "font-poppins"
          )}
        >
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
                  isRTL ? "font-vazir" : "font-poppins",
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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? 'right' : 'left'}
                className="w-72 bg-background/95 backdrop-blur-lg border-border"
              >
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "relative py-3 px-4 text-base font-medium transition-colors duration-300 rounded-lg",
                        isRTL ? "font-vazir text-right" : "font-poppins text-left",
                        isActive(item.path)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {item.label}
                      {isActive(item.path) && (
                        <span className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full",
                          isRTL ? "right-0" : "left-0"
                        )} />
                      )}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
