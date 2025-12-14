import React from 'react';
import { Users, Bike, Award, Clock, Wrench, MapPin, Star, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStats } from '@/hooks/useAPI';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  bike: Bike,
  award: Award,
  clock: Clock,
  wrench: Wrench,
  calendar: Clock,
  mappin: MapPin,
  star: Star,
  shield: Shield,
};

const StatsSection: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { stats: apiStats, loading } = useStats();

  // Default stats if API doesn't return any
  const defaultStats = [
    { id: 1, icon: 'users', value: isRTL ? '۵۰۰۰+' : '5000+', label: t('stats.customers'), label_fa: 'مشتری راضی' },
    { id: 2, icon: 'bike', value: isRTL ? '۳۰۰۰+' : '3000+', label: t('stats.motorcycles'), label_fa: 'موتورسیکلت فروخته شده' },
    { id: 3, icon: 'award', value: isRTL ? '۱۵+' : '15+', label: t('stats.brands'), label_fa: 'برند معتبر' },
    { id: 4, icon: 'clock', value: isRTL ? '۲۰+' : '20+', label: t('stats.experience'), label_fa: 'سال تجربه' },
  ];

  const displayStats = apiStats.length > 0 ? apiStats : defaultStats;

  return (
    <section className="py-16 md:py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon.toLowerCase()] || Users;
            return (
              <div
                key={stat.id || index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <IconComponent className="h-7 w-7 text-primary" />
                </div>
                <p className={cn(
                  "text-3xl md:text-4xl font-bold text-foreground mb-1",
                  isRTL ? "font-vazir" : "font-orbitron"
                )}>
                  {stat.value}
                </p>
                <p className={cn(
                  "text-muted-foreground text-sm",
                  isRTL ? "font-vazir" : ""
                )}>
                  {language === 'fa' ? (stat.label_fa || stat.label) : stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
