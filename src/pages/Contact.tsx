import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useContactSettings } from '@/hooks/useAPI';
import { contactAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const Contact: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const { contactSettings, loading, getContactSetting } = useContactSettings();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'نام و پیام الزامی است' : 'Name and message are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await contactAPI.sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      
      toast({
        title: isRTL ? 'پیام ارسال شد!' : 'Message Sent!',
        description: isRTL 
          ? 'به زودی با شما تماس خواهیم گرفت.'
          : 'We will contact you soon.',
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در ارسال پیام. لطفا دوباره تلاش کنید.' : 'Error sending message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const lang = language === 'fa' ? 'fa' : 'en';

  const contactInfo = [
    { 
      icon: MapPin, 
      title: t('contact.address'),
      value: getContactSetting('address', lang) || t('contact.addressText'),
    },
    { 
      icon: Phone, 
      title: isRTL ? 'تلفن' : 'Phone',
      value: getContactSetting('phone', lang) || t('contact.phoneNumber'),
    },
    { 
      icon: Mail, 
      title: isRTL ? 'ایمیل' : 'Email',
      value: getContactSetting('email', lang) || t('contact.emailAddress'),
    },
    { 
      icon: Clock, 
      title: isRTL ? 'ساعات کاری' : 'Working Hours',
      value: getContactSetting('working_hours', lang) || (isRTL ? 'شنبه تا پنجشنبه: ۹ صبح تا ۶ عصر' : 'Sat - Thu: 9 AM - 6 PM'),
    },
  ];

  const mapUrl = getContactSetting('map_url', 'en') || 
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52615.37529687997!2d69.13503772695312!3d34.55301080000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb0d2b5b7f5%3A0xfff531b6e2a3d6f8!2sKabul%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s";

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'تماس با ما | فولاد سکلیت' : 'Contact Us | Polad Cyclet'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'با فولاد سکلیت تماس بگیرید. آدرس، تلفن و فرم تماس.'
            : 'Contact Polad Cyclet. Address, phone, and contact form.'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-12">
          {/* Hero */}
          <section className="py-8 md:py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="container text-center mx-auto px-4">
              <h1 className={cn(
                "text-[24px]  font-bold text-foreground mb-4",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {t('contact.title')}
              </h1>
              <p className={cn(
                "text-[16px] text-muted-foreground ",
                isRTL ? "font-vazir" : ""
              )}>
                {t('contact.subtitle')}
              </p>
            </div>
          </section>

          {/* Content */}
          <section className="py-4 md:py-0">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {contactInfo.map((item, index) => (
                      <div
                        key={index}
                        className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-center items-center card-hover text-center animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className={cn(
                          "font-semibold text-foreground mb-2",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {item.title}
                        </h3>
                        <p className={cn(
                          "text-muted-foreground text-sm",
                          isRTL ? "font-vazir" : ""
                        )}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Map */}
                  <div className="h-64 rounded-2xl bg-card border border-border overflow-hidden">
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location"
                    />
                  </div>
                </div>

                {/* Contact Form */}
                <div className="animate-slide-in-right">
                  <div className="p-8 rounded-2xl bg-card border border-border">
                    <h2 className={cn(
                      "text-2xl font-bold text-foreground mb-6",
                      isRTL ? "font-vazir" : "font-poppins"
                    )}>
                      {isRTL ? 'ارسال پیام' : 'Send Message'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className={cn(
                          "block text-sm font-medium text-foreground mb-2",
                          isRTL ? "font-vazir" : ""
                        )}>
                          {t('contact.name')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className={cn(isRTL ? "font-vazir" : "")}
                          disabled={submitting}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={cn(
                            "block text-sm font-medium text-foreground mb-2",
                            isRTL ? "font-vazir" : ""
                          )}>
                            {t('contact.email')}
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className={cn(
                            "block text-sm font-medium text-foreground mb-2",
                            isRTL ? "font-vazir" : ""
                          )}>
                            {t('contact.phone')}
                          </label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={submitting}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={cn(
                          "block text-sm font-medium text-foreground mb-2",
                          isRTL ? "font-vazir" : ""
                        )}>
                          {t('contact.message')} *
                        </label>
                        <Textarea
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          className={cn(isRTL ? "font-vazir" : "")}
                          disabled={submitting}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className={cn(
                          "w-full racing-gradient text-primary-foreground gap-2",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {submitting 
                          ? (isRTL ? 'در حال ارسال...' : 'Sending...')
                          : t('contact.send')
                        }
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
