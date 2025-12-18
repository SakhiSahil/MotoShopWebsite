import { useState, useEffect } from 'react';
import { productsAPI, settingsAPI, brandsAPI, slidesAPI, pagesAPI, categoriesAPI, dealersAPI, contactAPI, faqAPI, checkAPIHealth } from '@/lib/api';
import { motorcycles as staticMotorcycles, brands as staticBrands, Motorcycle } from '@/data/motorcycles';

export interface Slide {
  id: number;
  title: string;
  titleFa: string;
  subtitle: string;
  subtitleFa: string;
  image: string;
  buttonText?: string;
  buttonTextFa?: string;
  buttonLink?: string;
}

export interface Brand {
  id?: number;
  name: string;
  nameFa: string;
  logo: string;
}

export interface Settings {
  [key: string]: { value: string; value_fa: string };
}

export interface Stat {
  id: number;
  label: string;
  label_fa: string;
  value: string;
  icon: string;
}

// Transform API product to Motorcycle format
const transformProduct = (p: any): Motorcycle => ({
  id: p.id,
  name: p.name,
  nameFa: p.name_fa,
  brand: p.brand,
  brandFa: p.brand_fa,
  category: p.category,
  categoryFa: p.category_fa,
  price: typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0 : p.price,
  priceFa: p.price_fa,
  year: p.year || new Date().getFullYear(),
  yearFa: p.year_fa || '',
  engine: p.engine,
  engineFa: p.engine_fa,
  power: p.power,
  powerFa: p.power_fa,
  topSpeed: p.top_speed,
  topSpeedFa: p.top_speed_fa,
  weight: p.weight,
  weightFa: p.weight_fa,
  fuelCapacity: p.fuel_capacity,
  fuelCapacityFa: p.fuel_capacity_fa,
  description: p.description,
  descriptionFa: p.description_fa,
  image: p.image,
  gallery: p.gallery || [],
  featured: Boolean(p.featured),
  inStock: Boolean(p.inStock || p.in_stock),
});

const transformSlide = (s: any): Slide => ({
  id: s.id,
  title: s.title,
  titleFa: s.title_fa,
  subtitle: s.subtitle,
  subtitleFa: s.subtitle_fa,
  image: s.image,
  buttonText: s.button_text,
  buttonTextFa: s.button_text_fa,
  buttonLink: s.button_link,
});

const transformBrand = (b: any): Brand => ({
  id: b.id,
  name: b.name,
  nameFa: b.name_fa,
  logo: b.logo,
});

// Check if API is available (with retry mechanism)
let apiAvailable: boolean | null = null;
let lastCheck = 0;
const CHECK_INTERVAL = 5000; // Retry every 5 seconds if failed

const isAPIAvailable = async (): Promise<boolean> => {
  const now = Date.now();
  // If we have a cached true result, use it
  if (apiAvailable === true) return true;
  // If we have a cached false result but enough time has passed, retry
  if (apiAvailable === false && now - lastCheck < CHECK_INTERVAL) return false;
  
  lastCheck = now;
  apiAvailable = await checkAPIHealth();
  return apiAvailable;
};

// Products hook
export const useProducts = () => {
  const [products, setProducts] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await productsAPI.getAll();
          setProducts(data.map(transformProduct));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Single product hook
export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await productsAPI.getById(id);
          setProduct(transformProduct(data));
        } else {
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  return { product, loading, error };
};

// Slides hook
export const useSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await slidesAPI.getAll();
          setSlides(data.map(transformSlide));
        } else {
          setSlides([]);
        }
      } catch {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  return { slides, loading };
};

// Brands hook
export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await brandsAPI.getAll();
          setBrands(data.map(transformBrand));
        } else {
          setBrands([]);
        }
      } catch {
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading };
};

// Settings hook
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await settingsAPI.getAll();
          setSettings(data);
        }
      } catch {
        // Settings will remain empty, components will use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const getSetting = (key: string, lang: 'en' | 'fa' = 'en'): string => {
    if (!settings[key]) return '';
    return lang === 'fa' ? settings[key].value_fa : settings[key].value;
  };

  return { settings, loading, getSetting };
};

// Stats hook
export const useStats = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await settingsAPI.getStats();
          if (data.length > 0) {
            setStats(data);
          }
        }
      } catch {
        // Will use default stats from component
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};

// Pages hook
export const usePage = (pageId: string) => {
  const [page, setPage] = useState<{ title: string; titleFa: string; content: string; contentFa: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await pagesAPI.getById(pageId);
          setPage({
            title: data.title,
            titleFa: data.title_fa,
            content: data.content,
            contentFa: data.content_fa,
          });
        }
      } catch {
        // Page content will be null, components use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  return { page, loading };
};

// Categories hook
export interface Category {
  id: number;
  name: string;
  name_fa: string;
  value: string;
  sort_order: number;
  active: boolean;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await categoriesAPI.getAll();
          // Only show active categories
          setCategories(data.filter((c: Category) => c.active));
        }
      } catch {
        // Use empty array, component will fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

// Dealers hook
export interface Dealer {
  id: number;
  name: string;
  name_fa: string;
  address: string;
  address_fa: string;
  city: string;
  city_fa: string;
  phone: string;
  email: string;
  hours: string;
  hours_fa: string;
  map_url: string;
  sort_order: number;
  active: boolean;
}

export const useDealers = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await dealersAPI.getAll();
          setDealers(data.map((d: any) => ({ ...d, active: Boolean(d.active) })));
        }
      } catch {
        // Use empty array, component will fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  return { dealers, loading };
};

// Contact settings hook
export interface ContactSettings {
  phone?: { value: string; value_fa: string };
  whatsapp?: { value: string; value_fa: string };
  email?: { value: string; value_fa: string };
  address?: { value: string; value_fa: string };
  working_hours?: { value: string; value_fa: string };
  map_url?: { value: string; value_fa: string };
  [key: string]: { value: string; value_fa: string } | undefined;
}

export const useContactSettings = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await contactAPI.getSettings();
          setContactSettings(data);
        }
      } catch {
        // Will use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchContactSettings();
  }, []);

  const getContactSetting = (key: string, lang: 'en' | 'fa' = 'en'): string => {
    const setting = contactSettings[key as keyof ContactSettings];
    if (!setting) return '';
    return lang === 'fa' ? setting.value_fa : setting.value;
  };

  return { contactSettings, loading, getContactSetting };
};

// FAQs hook
export interface FAQ {
  id: number;
  question: string;
  question_fa: string;
  answer: string;
  answer_fa: string;
  sort_order: number;
  active: boolean;
}

export const useFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        if (await isAPIAvailable()) {
          const data = await faqAPI.getAll();
          setFaqs(data.map((f: any) => ({ ...f, active: Boolean(f.active) })));
        }
      } catch {
        // Use empty array
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return { faqs, loading };
};
