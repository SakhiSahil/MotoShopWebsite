import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Loader2, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts, useCategories, useBrands } from '@/hooks/useAPI';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const Products: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { products, loading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();
  
  // Get price range from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 100000000 };
    const prices = products.map(p => typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0).filter(p => p > 0);
    if (prices.length === 0) return { minPrice: 0, maxPrice: 100000000 };
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }, [products]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [selectedYears, setSelectedYears] = useState<(number | string)[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync price range when products load
  useEffect(() => {
    if (products.length > 0 && !priceInitialized) {
      setPriceRange([minPrice, maxPrice]);
      setPriceInitialized(true);
    }
  }, [products, minPrice, maxPrice, priceInitialized]);

  // Get unique years from products
  const availableYears = useMemo(() => {
    const years = [...new Set(products.map(p => p.year))].filter(Boolean).sort((a, b) => Number(b) - Number(a));
    return years;
  }, [products]);

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brandSet = new Map<string, string>();
    products.forEach(p => {
      if (!brandSet.has(p.brand)) {
        brandSet.set(p.brand, p.brandFa);
      }
    });
    return Array.from(brandSet.entries()).map(([en, fa]) => ({ en, fa }));
  }, [products]);

  // Build categories list with "All" option
  const categoryOptions = [
    { value: 'all', labelEn: 'All', labelFa: 'همه' },
    ...categories.map(c => ({
      value: c.value,
      labelEn: c.name,
      labelFa: c.name_fa
    }))
  ];

  // Filter and sort products
  const filteredMotorcycles = useMemo(() => {
    let result = products.filter((motorcycle) => {
      // Search filter
      const matchesSearch = 
        motorcycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        motorcycle.nameFa.includes(searchTerm) ||
        motorcycle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        motorcycle.brandFa.includes(searchTerm);
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || motorcycle.category === selectedCategory;
      
      // Brand filter
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(motorcycle.brand);
      
      // Price filter
      const productPrice = typeof motorcycle.price === 'number' ? motorcycle.price : parseFloat(String(motorcycle.price)) || 0;
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      
      // Year filter
      const matchesYear = selectedYears.length === 0 || selectedYears.includes(motorcycle.year);
      
      // Stock filter
      const matchesStock = !inStockOnly || motorcycle.inStock;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesYear && matchesStock;
    });

    // Sort
    const getPrice = (p: typeof products[0]) => typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0;
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case 'price-desc':
        result.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case 'name-asc':
        result.sort((a, b) => (language === 'fa' ? a.nameFa.localeCompare(b.nameFa, 'fa') : a.name.localeCompare(b.name)));
        break;
      case 'name-desc':
        result.sort((a, b) => (language === 'fa' ? b.nameFa.localeCompare(a.nameFa, 'fa') : b.name.localeCompare(a.name)));
        break;
      case 'newest':
      default:
        result.sort((a, b) => Number(b.year) - Number(a.year));
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedBrands, priceRange, selectedYears, inStockOnly, sortBy, language]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrands.length > 0) count++;
    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) count++;
    if (selectedYears.length > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, selectedBrands, priceRange, selectedYears, inStockOnly, minPrice, maxPrice]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    setSelectedYears([]);
    setInStockOnly(false);
    setSortBy('newest');
  };

  // Toggle brand selection
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Toggle year selection
  const toggleYear = (year: number | string) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  // Format price for display
  const formatPrice = (price: number) => {
    if (language === 'fa') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' افغانی';
    }
    return new Intl.NumberFormat('en-US').format(price) + ' AFN';
  };

  // Filter panel content (shared between desktop sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          {isRTL ? 'دسته‌بندی' : 'Category'}
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  "text-xs",
                  selectedCategory === category.value && 'racing-gradient text-primary-foreground'
                )}
              >
                {language === 'fa' ? category.labelFa : category.labelEn}
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          {isRTL ? 'برند' : 'Brand'}
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {availableBrands.map((brand) => (
            <div key={brand.en} className="flex items-center gap-2">
              <Checkbox 
                id={`brand-${brand.en}`}
                checked={selectedBrands.includes(brand.en)}
                onCheckedChange={() => toggleBrand(brand.en)}
              />
              <Label htmlFor={`brand-${brand.en}`} className="text-sm cursor-pointer">
                {language === 'fa' ? brand.fa : brand.en}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          {isRTL ? 'محدوده قیمت' : 'Price Range'}
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={minPrice}
            max={maxPrice}
            step={100000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Year */}
      {availableYears.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
            {isRTL ? 'سال تولید' : 'Year'}
            <ChevronDown className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <Button
                  key={year}
                  variant={selectedYears.includes(year) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleYear(year)}
                  className="text-xs"
                >
                  {year}
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* In Stock */}
      <div className="flex items-center gap-2 py-2">
        <Checkbox 
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <Label htmlFor="inStock" className="cursor-pointer">
          {isRTL ? 'فقط موجود در انبار' : 'In Stock Only'}
        </Label>
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={resetFilters} className="w-full">
          <X className="w-4 h-4 ml-2" />
          {isRTL ? 'پاک کردن فیلترها' : 'Clear Filters'}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'محصولات | فولاد سکلیت' : 'Products | Polad Cyclet'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'مشاهده و خرید بهترین موتورسیکلت‌های دنیا. کاوازاکی، دوکاتی، ب‌ام‌و، هوندا و یاماها.'
            : 'Browse and buy the world\'s best motorcycles. Kawasaki, Ducati, BMW, Honda, and Yamaha.'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-12">
          {/* Hero */}
          <section className="py-8 md:py-12 border-b border-border bg-gradient-to-b from-primary/10 to-background">
            <div className="container mx-auto text-center px-4">
              <h1 className={cn(
                "section-title text-[20px] md:text-[24px] text-foreground mb-2",
                isRTL ? "font-vazir" : "font-poppins"
              )}>
                {t('products.title')}
              </h1>
              <p className={cn(
                "text-lg text-muted-foreground ",
                isRTL ? "font-vazir" : ""
              )}>
                {t('products.subtitle')}
              </p>
            </div>
          </section>

          {/* Search and Sort Bar */}
          <section className="py-4 bg-card border-b border-border sticky  top-16 md:top-20 z-40">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={isRTL ? 'جستجو در نام یا برند...' : 'Search name or brand...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rtl:pl-4 rtl:pr-10"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden relative">
                        <SlidersHorizontal className="w-4 h-4 ml-2" />
                        {isRTL ? 'فیلترها' : 'Filters'}
                        {activeFiltersCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side={isRTL ? 'right' : 'left'} className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>{isRTL ? 'فیلترها' : 'Filters'}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={isRTL ? 'مرتب‌سازی' : 'Sort by'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{isRTL ? 'جدیدترین' : 'Newest'}</SelectItem>
                      <SelectItem value="price-asc">{isRTL ? 'ارزان‌ترین' : 'Price: Low to High'}</SelectItem>
                      <SelectItem value="price-desc">{isRTL ? 'گران‌ترین' : 'Price: High to Low'}</SelectItem>
                      <SelectItem value="name-asc">{isRTL ? 'نام (الف-ی)' : 'Name (A-Z)'}</SelectItem>
                      <SelectItem value="name-desc">{isRTL ? 'نام (ی-الف)' : 'Name (Z-A)'}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Results count */}
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {filteredMotorcycles.length} {isRTL ? 'محصول' : 'products'}
                  </span>
                </div>
              </div>

              {/* Active filters badges */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {language === 'fa' 
                        ? categoryOptions.find(c => c.value === selectedCategory)?.labelFa 
                        : categoryOptions.find(c => c.value === selectedCategory)?.labelEn}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                    </Badge>
                  )}
                  {selectedBrands.map(brand => (
                    <Badge key={brand} variant="secondary" className="gap-1">
                      {language === 'fa' ? availableBrands.find(b => b.en === brand)?.fa : brand}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(brand)} />
                    </Badge>
                  ))}
                  {selectedYears.map(year => (
                    <Badge key={year} variant="secondary" className="gap-1">
                      {year}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleYear(year)} />
                    </Badge>
                  ))}
                  {inStockOnly && (
                    <Badge variant="secondary" className="gap-1">
                      {isRTL ? 'موجود' : 'In Stock'}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Main Content */}
          <section className="py-8 md:py-12 ">
            <div className="container mx-auto px-4">
              <div className="flex gap-8">
                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block w-64 shrink-0">
                  <div className="sticky top-36 bg-card rounded-lg border border-border p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {isRTL ? 'فیلترها' : 'Filters'}
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </h3>
                    <FilterContent />
                  </div>
                </aside>

                {/* Products Grid */}
                <div className="flex-1">
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredMotorcycles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredMotorcycles.map((motorcycle, index) => (
                        <div
                          key={motorcycle.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <ProductCard motorcycle={motorcycle} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Filter className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className={cn(
                        "text-lg text-muted-foreground mb-4",
                        isRTL ? "font-vazir" : "font-poppins"
                      )}>
                        {isRTL ? 'موتورسیکلتی یافت نشد' : 'No motorcycles found'}
                      </p>
                      <Button variant="outline" onClick={resetFilters}>
                        {isRTL ? 'پاک کردن فیلترها' : 'Clear Filters'}
                      </Button>
                    </div>
                  )}
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

export default Products;