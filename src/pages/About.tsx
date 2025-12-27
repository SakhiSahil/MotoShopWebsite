import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Heart, Shield, Award, Users, Wrench, Star, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface AboutContent {
  id: string;
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  image?: string;
  years_experience?: string;
}

interface Value {
  id: number;
  title: string;
  title_fa: string;
  description: string;
  description_fa: string;
  icon: string;
  sort_order: number;
}

interface TeamMember {
  id: number;
  name: string;
  name_fa: string;
  role: string;
  role_fa: string;
  image: string;
  sort_order: number;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  shield: Shield,
  heart: Heart,
  wrench: Wrench,
  award: Award,
  users: Users,
  target: Target,
  star: Star,
  check: Check,
};

const About: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, valuesRes, teamRes] = await Promise.all([
          fetch(`${API_BASE_URL}/about/content`),
          fetch(`${API_BASE_URL}/about/values`),
          fetch(`${API_BASE_URL}/about/team`),
        ]);

        if (contentRes.ok) {
          const content = await contentRes.json();
          setAboutContent(content);
        }
        if (valuesRes.ok) {
          const valuesData = await valuesRes.json();
          setValues(valuesData);
        }
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData);
        }
      } catch (error) {
        console.error('Failed to fetch about data:', error);
        // Use fallback data
        setAboutContent({
          id: 'main',
          title: 'Our Story',
          title_fa: 'داستان ما',
          content: 'With over 20 years of experience in the motorcycle industry, we are proud to have earned the trust of thousands of customers.',
          content_fa: 'ما با بیش از ۲۰ سال تجربه در صنعت موتورسیکلت، مفتخریم که توانسته‌ایم اعتماد هزاران مشتری را جلب کنیم.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
          years_experience: '20+',
        });
        setValues([
          { id: 1, title: 'Quality', title_fa: 'کیفیت', description: 'We only offer genuine and high-quality motorcycles.', description_fa: 'فقط موتورسیکلت‌های اصل و با کیفیت را عرضه می‌کنیم.', icon: 'shield', sort_order: 0 },
          { id: 2, title: 'Trust', title_fa: 'اعتماد', description: 'Customer trust is our most valuable asset.', description_fa: 'اعتماد مشتریان مهم‌ترین سرمایه ماست.', icon: 'heart', sort_order: 1 },
          { id: 3, title: 'Service', title_fa: 'خدمات', description: 'Professional and fast after-sales service.', description_fa: 'خدمات پس از فروش حرفه‌ای و سریع.', icon: 'wrench', sort_order: 2 },
        ]);
        setTeamMembers([
          { id: 1, name: 'Ali Mohammadi', name_fa: 'علی محمدی', role: 'CEO', role_fa: 'مدیرعامل', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80', sort_order: 0 },
          { id: 2, name: 'Sara Ahmadi', name_fa: 'سارا احمدی', role: 'Sales Manager', role_fa: 'مدیر فروش', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', sort_order: 1 },
          { id: 3, name: 'Reza Karimi', name_fa: 'رضا کریمی', role: 'Technical Manager', role_fa: 'مدیر فنی', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', sort_order: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Shield;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'درباره ما | فولاد سکلیت' : 'About Us | Polad Cyclet'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'درباره فولاد سکلیت - بزرگترین فروشگاه موتورسیکلت در افغانستان با بیش از ۲۰ سال تجربه.'
            : 'About Polad Cyclet - The largest motorcycle store in Afghanistan with over 20 years of experience.'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-12">
          {/* Hero */}
          <section className="py-8 md:py-12  relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 " />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className={cn(
                  "section-title text-[28px] text-foreground mb-2",
                  isRTL ? "font-vazir" : "font-poppins"
                )}>
                  {t('about.title')}
                </h1>
                <p className={cn(
                  "text-[14px] text-muted-foreground",
                  isRTL ? "font-vazir" : ""
                )}>
                  {t('about.subtitle')}
                </p>
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in">
                  <h2 className={cn(
                    "text-xl md:text-2xl font-bold text-foreground mb-6",
                    isRTL ? "font-vazir" : "font-poppins"
                  )}>
                    {isRTL ? aboutContent?.title_fa : aboutContent?.title}
                  </h2>
                  <p className={cn(
                    "text-muted-foreground leading-relaxed mb-6",
                    isRTL ? "font-vazir" : ""
                  )}>
                    {isRTL ? aboutContent?.content_fa : aboutContent?.content}
                  </p>
                </div>
                <div className="relative flex justify-center animate-slide-in-right">
                  <div className="aspect-square rounded-3xl w-[360px] md:w-[400px] overflow-hidden">
                    <img
                      src={aboutContent?.image ? getImageUrl(aboutContent.image) : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'}
                      alt="About us"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-8 -right-1 rtl:-right-auto rtl:-left-6 w-32 h-32 rounded-2xl racing-gradient flex items-center justify-center glow-effect">
                    <div className="text-center text-primary-foreground">
                      <p className="text-3xl font-bold">{aboutContent?.years_experience || '20+'}</p>
                      <p className="text-xs">{isRTL ? 'سال تجربه' : 'Years'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission */}
          {/* <section className="py-16 md:py-24 bg-card border-y border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className={cn(
                  "text-2xl md:text-3xl font-bold text-foreground mb-6",
                  isRTL ? "font-vazir" : "font-poppins"
                )}>
                  {t('about.mission')}
                </h2>
                <p className={cn(
                  "text-lg text-muted-foreground",
                  isRTL ? "font-vazir" : ""
                )}>
                  {t('about.missionText')}
                </p>
              </div>
            </div>
          </section> */}

          {/* Values */}
          {values.length > 0 && (
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                <h2 className={cn(
                  "text-2xl md:text-3xl font-bold text-foreground text-center mb-12",
                  isRTL ? "font-vazir" : "font-poppins"
                )}>
                  {t('about.values')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {values.map((value, index) => {
                    const IconComponent = getIcon(value.icon);
                    return (
                      <div
                        key={value.id}
                        className="text-center p-8 rounded-2xl bg-card border border-border card-hover animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className={cn(
                          "text-xl font-bold text-foreground mb-3",
                          isRTL ? "font-vazir" : "font-poppins"
                        )}>
                          {isRTL ? value.title_fa : value.title}
                        </h3>
                        <p className={cn(
                          "text-muted-foreground",
                          isRTL ? "font-vazir" : ""
                        )}>
                          {isRTL ? value.description_fa : value.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Team */}
          {teamMembers.length > 0 && (
            <section className="py-10 md:py-14 bg-card ">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className={cn(
                    "text-xl md:text-2xl font-bold text-foreground",
                    isRTL ? "font-vazir" : "font-poppins"
                  )}>
                    {isRTL ? 'تیم ما' : 'Our Team'}
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="text-center animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-20 h-20 md:h-32 md:w-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 mb-4">
                        <img
                          src={getImageUrl(member.image)}
                          alt={isRTL ? member.name_fa : member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className={cn(
                        "text-[14px] font-bold text-foreground",
                        isRTL ? "font-vazir" : "font-poppins"
                      )}>
                        {isRTL ? member.name_fa : member.name}
                      </h3>
                      <p className={cn(
                        "text-primary text-[8px] text-sm",
                        isRTL ? "font-vazir" : "font-poppins"
                      )}>
                        {isRTL ? member.role_fa : member.role}
                      </p>
                    </div>
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

export default About;
