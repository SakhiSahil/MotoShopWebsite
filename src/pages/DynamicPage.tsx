import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pagesAPI } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

interface Page {
  id: string;
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  meta_description?: string;
  meta_description_fa?: string;
}

const DynamicPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!id) return;
      
      try {
        const data = await pagesAPI.getById(id);
        setPage(data);
      } catch (error) {
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return null;
  }

  const isRTL = language === "fa";
  const title = isRTL ? page.title_fa : page.title;
  const content = isRTL ? page.content_fa : page.content;
  const metaDescription = isRTL ? page.meta_description_fa : page.meta_description;

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Helmet>
        <title>{title}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          {title}
        </h1>
        
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DynamicPage;