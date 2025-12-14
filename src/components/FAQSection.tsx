import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { faqAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Loader2 } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  question_fa: string;
  answer: string;
  answer_fa: string;
  sort_order: number;
  active: boolean;
}

const defaultFAQs: FAQ[] = [
  {
    id: 1,
    question: 'What is the warranty on motorcycles?',
    question_fa: 'گارانتی موتورسیکلت‌ها چقدر است؟',
    answer: 'All our motorcycles come with a 2-year manufacturer warranty and 1-year after-sales service.',
    answer_fa: 'تمامی موتورسیکلت‌های ما دارای ۲ سال گارانتی کارخانه و ۱ سال خدمات پس از فروش هستند.',
    sort_order: 1,
    active: true
  },
  {
    id: 2,
    question: 'Do you offer installment plans?',
    question_fa: 'آیا امکان خرید اقساطی وجود دارد؟',
    answer: 'Yes, we offer various installment plans from 6 to 24 months with easy conditions.',
    answer_fa: 'بله، ما طرح‌های اقساطی متنوعی از ۶ تا ۲۴ ماه با شرایط آسان ارائه می‌دهیم.',
    sort_order: 2,
    active: true
  },
  {
    id: 3,
    question: 'Is it possible to ship to other provinces?',
    question_fa: 'آیا امکان ارسال به ولایات دیگر وجود دارد؟',
    answer: 'Yes, we ship motorcycles to all provinces of Afghanistan with special packaging and insurance.',
    answer_fa: 'بله، ما موتورسیکلت‌ها را به تمام ولایات افغانستان با بسته‌بندی ویژه و بیمه ارسال می‌کنیم.',
    sort_order: 3,
    active: true
  },
  {
    id: 4,
    question: 'How can I place an order?',
    question_fa: 'چگونه می‌توانم سفارش دهم؟',
    answer: 'You can place orders by visiting our store, calling us, or through WhatsApp.',
    answer_fa: 'شما می‌توانید با مراجعه حضوری به فروشگاه، تماس تلفنی یا از طریق واتساپ سفارش دهید.',
    sort_order: 4,
    active: true
  },
  {
    id: 5,
    question: 'Do you have used motorcycles?',
    question_fa: 'آیا موتورسیکلت دست دوم هم دارید؟',
    answer: 'Currently, we only offer brand new motorcycles with full warranty.',
    answer_fa: 'در حال حاضر ما فقط موتورسیکلت‌های صفر کیلومتر با گارانتی کامل عرضه می‌کنیم.',
    sort_order: 5,
    active: true
  }
];

const FAQSection: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header - matching BrandsSection style */}
        <h2 className={cn(
          "text-center text-2xl md:text-3xl font-bold text-foreground mb-12",
          isRTL ? "font-vazir" : "font-orbitron"
        )}>
          {isRTL ? 'سوالات متداول' : 'Frequently Asked Questions'}
        </h2>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccordionItem
                  value={`faq-${faq.id}`}
                  className="bg-card border border-border rounded-2xl px-6 overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg"
                >
                  <AccordionTrigger 
                    className={cn(
                      "text-foreground hover:text-primary hover:no-underline py-5",
                      isRTL ? "font-vazir text-right" : "font-orbitron"
                    )}
                  >
                    {isRTL ? faq.question_fa : faq.question}
                  </AccordionTrigger>
                  <AccordionContent 
                    className={cn(
                      "text-muted-foreground pb-5 text-sm",
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