import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { faqAPI } from '@/lib/api';
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  question_fa: string;
  answer: string;
  answer_fa: string;
  sort_order: number;
  active: boolean;
}

const FAQSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { isVisible, sectionRef, scrollDirection } = useScrollAnimation({ threshold: 0.15 });

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await faqAPI.getAll();
        if (data && data.length > 0) {
          setFaqs(data);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  // Don't render if no FAQs from database
  if (!loading && faqs.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h2 
          className={cn(
            "text-center text-xl md:text-2xl font-bold text-foreground mb-10",
            getAnimationClasses(isVisible, scrollDirection),
            isRTL ? "font-vazir" : "font-poppins"
          )}
        >
          {isRTL ? 'سوالات متداول' : 'Frequently Asked Questions'}
        </h2>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={getAnimationClasses(isVisible, scrollDirection)}
                style={{ transitionDelay: isVisible ? `${(index + 1) * 80}ms` : '0ms' }}
              >
                <AccordionItem
                  value={`faq-${faq.id}`}
                  className="bg-card border border-border rounded-xl px-5 overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg"
                >
                  <AccordionTrigger 
                    className={cn(
                      "text-foreground hover:text-primary hover:no-underline py-4 text-sm",
                      isRTL ? "font-vazir text-right" : "font-poppins"
                    )}
                  >
                    {isRTL ? faq.question_fa : faq.question}
                  </AccordionTrigger>
                  <AccordionContent 
                    className={cn(
                      "text-muted-foreground pb-4 text-xs md:text-sm",
                      isRTL ? "font-vazir text-right" : ""
                    )}
                  >
                    {isRTL ? faq.answer_fa : faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
