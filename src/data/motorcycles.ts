export interface Motorcycle {
  id: number | string;
  name: string;
  nameFa: string;
  brand: string;
  brandFa: string;
  price: number | string;
  priceFa: string;
  year: number | string;
  yearFa?: string;
  engine: string;
  engineFa?: string;
  power: string;
  powerFa?: string;
  topSpeed: string;
  topSpeedFa?: string;
  weight?: string;
  weightFa?: string;
  fuelCapacity?: string;
  fuelCapacityFa?: string;
  image: string;
  gallery?: string[];
  category: 'sport' | 'cruiser' | 'adventure' | 'naked' | string;
  categoryFa?: string;
  featured: boolean;
  inStock?: boolean;
  description: string;
  descriptionFa: string;
}

export const motorcycles: Motorcycle[] = [
  {
    id: 1,
    name: 'Kawasaki Ninja ZX-10R',
    nameFa: 'کاوازاکی نینجا ZX-10R',
    brand: 'Kawasaki',
    brandFa: 'کاوازاکی',
    price: 1600000,
    priceFa: '۱,۶۰۰,۰۰۰',
    year: 2024,
    engine: '998cc',
    power: '203 HP',
    topSpeed: '299 km/h',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category: 'sport',
    featured: true,
    description: 'The ultimate supersport machine with cutting-edge technology.',
    descriptionFa: 'قدرتمندترین موتورسیکلت اسپرت با فناوری پیشرفته.',
  },
  {
    id: 2,
    name: 'Ducati Panigale V4',
    nameFa: 'دوکاتی پانیگاله V4',
    brand: 'Ducati',
    brandFa: 'دوکاتی',
    price: 2500000,
    priceFa: '۲,۵۰۰,۰۰۰',
    year: 2024,
    engine: '1103cc',
    power: '214 HP',
    topSpeed: '310 km/h',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
    category: 'sport',
    featured: true,
    description: 'Italian masterpiece of speed and design.',
    descriptionFa: 'شاهکار ایتالیایی سرعت و طراحی.',
  },
  {
    id: 3,
    name: 'BMW S1000RR',
    nameFa: 'ب‌ام‌و S1000RR',
    brand: 'BMW',
    brandFa: 'ب‌ام‌و',
    price: 2100000,
    priceFa: '۲,۱۰۰,۰۰۰',
    year: 2024,
    engine: '999cc',
    power: '205 HP',
    topSpeed: '305 km/h',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    category: 'sport',
    featured: true,
    description: 'German engineering at its finest.',
    descriptionFa: 'بهترین مهندسی آلمانی.',
  },
  {
    id: 4,
    name: 'Honda CBR1000RR-R',
    nameFa: 'هوندا CBR1000RR-R',
    brand: 'Honda',
    brandFa: 'هوندا',
    price: 2400000,
    priceFa: '۲,۴۰۰,۰۰۰',
    year: 2024,
    engine: '999cc',
    power: '217 HP',
    topSpeed: '299 km/h',
    image: 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80',
    category: 'sport',
    featured: true,
    description: 'Race-bred performance for the street.',
    descriptionFa: 'عملکرد مسابقه‌ای برای خیابان.',
  },
  {
    id: 5,
    name: 'Yamaha YZF-R1',
    nameFa: 'یاماها YZF-R1',
    brand: 'Yamaha',
    brandFa: 'یاماها',
    price: 1500000,
    priceFa: '۱,۵۰۰,۰۰۰',
    year: 2024,
    engine: '998cc',
    power: '197 HP',
    topSpeed: '299 km/h',
    image: 'https://images.unsplash.com/photo-1571646750394-de26684c4dd7?w=800&q=80',
    category: 'sport',
    featured: false,
    description: 'MotoGP technology for the street.',
    descriptionFa: 'فناوری MotoGP برای خیابان.',
  },
  {
    id: 6,
    name: 'Harley-Davidson Fat Boy',
    nameFa: 'هارلی دیویدسون فت بوی',
    brand: 'Harley-Davidson',
    brandFa: 'هارلی دیویدسون',
    price: 1800000,
    priceFa: '۱,۸۰۰,۰۰۰',
    year: 2024,
    engine: '1868cc',
    power: '93 HP',
    topSpeed: '180 km/h',
    image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80',
    category: 'cruiser',
    featured: false,
    description: 'Iconic American cruiser.',
    descriptionFa: 'کروزر نمادین آمریکایی.',
  },
  {
    id: 7,
    name: 'KTM 1290 Super Duke R',
    nameFa: 'کی‌تی‌ام 1290 سوپر دوک R',
    brand: 'KTM',
    brandFa: 'کی‌تی‌ام',
    price: 1700000,
    priceFa: '۱,۷۰۰,۰۰۰',
    year: 2024,
    engine: '1301cc',
    power: '180 HP',
    topSpeed: '280 km/h',
    image: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80',
    category: 'naked',
    featured: false,
    description: 'The Beast - raw power unleashed.',
    descriptionFa: 'هیولا - قدرت خام آزاد شده.',
  },
  {
    id: 8,
    name: 'BMW R1250GS Adventure',
    nameFa: 'ب‌ام‌و R1250GS ادونچر',
    brand: 'BMW',
    brandFa: 'ب‌ام‌و',
    price: 1950000,
    priceFa: '۱,۹۵۰,۰۰۰',
    year: 2024,
    engine: '1254cc',
    power: '136 HP',
    topSpeed: '220 km/h',
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80',
    category: 'adventure',
    featured: false,
    description: 'Go anywhere, do anything.',
    descriptionFa: 'به هر جایی برو، هر کاری انجام بده.',
  },
];

export const brands = [
  { name: 'Kawasaki', nameFa: 'کاوازاکی', logo: '🏍️' },
  { name: 'Ducati', nameFa: 'دوکاتی', logo: '🏍️' },
  { name: 'BMW', nameFa: 'ب‌ام‌و', logo: '🏍️' },
  { name: 'Honda', nameFa: 'هوندا', logo: '🏍️' },
  { name: 'Yamaha', nameFa: 'یاماها', logo: '🏍️' },
  { name: 'Harley-Davidson', nameFa: 'هارلی دیویدسون', logo: '🏍️' },
  { name: 'KTM', nameFa: 'کی‌تی‌ام', logo: '🏍️' },
];
