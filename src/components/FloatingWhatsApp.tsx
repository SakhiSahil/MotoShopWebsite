import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { contactAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const FloatingWhatsApp: React.FC = () => {
  const { isRTL } = useLanguage();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const contactSettings = await contactAPI.getSettings();
        if (contactSettings?.whatsapp?.value) {
          setWhatsappNumber(contactSettings.whatsapp.value.replace(/[^0-9+]/g, ''));
        } else {
          // Fallback number for demo
          setWhatsappNumber('+93700000000');
        }
      } catch (error) {
        // Fallback number for demo
        setWhatsappNumber('+93700000000');
      }
    };
    fetchWhatsApp();

    // Show tooltip after 3 seconds
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    // Hide tooltip after 8 seconds
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = () => {
    if (!whatsappNumber) return;
    const message = isRTL 
      ? 'سلام، من از وبسایت شما بازدید کردم و سوالی دارم.'
      : 'Hello, I visited your website and have a question.';
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!whatsappNumber) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-6 z-50 flex items-center gap-3",
        isRTL ? "left-6" : "right-6"
      )}
    >
      {/* Tooltip */}
      <div 
        className={cn(
          "bg-card border border-border rounded-2xl px-4 py-3 shadow-xl transition-all duration-500",
          showTooltip && !isHovered ? "opacity-100 translate-x-0" : "opacity-0",
          isRTL ? "translate-x-4" : "-translate-x-4"
        )}
      >
        <button 
          onClick={() => setShowTooltip(false)}
          className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <p className={cn(
          "text-sm text-foreground whitespace-nowrap",
          isRTL ? "font-vazir" : ""
        )}>
          {isRTL ? 'سوالی دارید؟ با ما صحبت کنید!' : 'Need help? Chat with us!'}
        </p>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300",
          "hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]",
          "active:scale-95"
        )}
        aria-label="WhatsApp"
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        
        {/* Icon */}
        <span className="relative flex items-center justify-center w-full h-full">
          <MessageCircle className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
        </span>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
