const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create data directory if not exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'poladcyclet.db');

async function initDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables
  db.run(`
    -- Admin users table
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      brand TEXT NOT NULL,
      brand_fa TEXT NOT NULL,
      category TEXT NOT NULL,
      category_fa TEXT NOT NULL,
      price TEXT NOT NULL,
      price_fa TEXT NOT NULL,
      year TEXT,
      year_fa TEXT,
      engine TEXT NOT NULL,
      engine_fa TEXT NOT NULL,
      power TEXT NOT NULL,
      power_fa TEXT NOT NULL,
      top_speed TEXT NOT NULL,
      top_speed_fa TEXT NOT NULL,
      weight TEXT NOT NULL,
      weight_fa TEXT NOT NULL,
      fuel_capacity TEXT NOT NULL,
      fuel_capacity_fa TEXT NOT NULL,
      description TEXT NOT NULL,
      description_fa TEXT NOT NULL,
      image TEXT NOT NULL,
      gallery TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    -- Brands table
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      logo TEXT NOT NULL,
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    -- Slides table (Hero Carousel)
    CREATE TABLE IF NOT EXISTS slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_fa TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      subtitle_fa TEXT NOT NULL,
      image TEXT NOT NULL,
      button_text TEXT,
      button_text_fa TEXT,
      button_link TEXT,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      value_fa TEXT
    )
  `);

  db.run(`
    -- Pages content table
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_fa TEXT NOT NULL,
      content TEXT NOT NULL,
      content_fa TEXT NOT NULL,
      meta_description TEXT,
      meta_description_fa TEXT
    )
  `);

  db.run(`
    -- Stats table
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      label_fa TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      value TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    -- Dealers table
    CREATE TABLE IF NOT EXISTS dealers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      address TEXT,
      address_fa TEXT,
      city TEXT,
      city_fa TEXT,
      phone TEXT,
      email TEXT,
      hours TEXT,
      hours_fa TEXT,
      map_url TEXT,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    -- About content table
    CREATE TABLE IF NOT EXISTS about_content (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_fa TEXT NOT NULL,
      content TEXT NOT NULL,
      content_fa TEXT NOT NULL,
      image TEXT,
      years_experience TEXT DEFAULT '20+'
    )
  `);

  db.run(`
    -- About values table
    CREATE TABLE IF NOT EXISTS about_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_fa TEXT NOT NULL,
      description TEXT NOT NULL,
      description_fa TEXT NOT NULL,
      icon TEXT DEFAULT 'shield',
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    -- About team table
    CREATE TABLE IF NOT EXISTS about_team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      role TEXT NOT NULL,
      role_fa TEXT NOT NULL,
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    -- Contact settings table
    CREATE TABLE IF NOT EXISTS contact_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      value_fa TEXT
    )
  `);

  db.run(`
    -- Contact messages table
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      product_id INTEGER,
      product_name TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    -- FAQs table
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      question_fa TEXT NOT NULL,
      answer TEXT NOT NULL,
      answer_fa TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `);

  // Migration: Add year columns to existing products table
  try {
    db.run('ALTER TABLE products ADD COLUMN year TEXT');
    console.log('✅ Added year column to products table');
  } catch (e) {
    // Column already exists
  }
  try {
    db.run('ALTER TABLE products ADD COLUMN year_fa TEXT');
    console.log('✅ Added year_fa column to products table');
  } catch (e) {
    // Column already exists
  }

  // Insert default admin (password: admin123)
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  try {
    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
    console.log('✅ Default admin created (username: admin, password: admin123)');
  } catch (e) {
    console.log('ℹ️  Admin already exists');
  }

  // Insert default settings
  const defaultSettings = [
    ['site_name', 'Polad Cyclet', 'فولاد سکلیت'],
    ['phone', '+93 70 123 4567', '+۹۳ ۷۰ ۱۲۳ ۴۵۶۷'],
    ['email', 'info@poladcyclet.af', 'info@poladcyclet.af'],
    ['address', 'Kabul, Afghanistan, District 4, Main Street', 'کابل، افغانستان، ناحیه ۴، جاده اصلی'],
    ['whatsapp', '+93701234567', '+93701234567'],
    ['instagram', '@poladcyclet_af', '@poladcyclet_af'],
    ['facebook', 'poladcycletaf', 'poladcycletaf'],
    ['about_text', 'We are the leading motorcycle dealership in Afghanistan...', 'ما بزرگترین نمایندگی موتورسیکلت در افغانستان هستیم...'],
    ['footer_text', 'Your trusted motorcycle partner in Afghanistan', 'شریک مورد اعتماد شما در موتورسیکلت در افغانستان'],
  ];

  defaultSettings.forEach(([key, value, value_fa]) => {
    db.run('INSERT OR REPLACE INTO settings (key, value, value_fa) VALUES (?, ?, ?)', [key, value, value_fa]);
  });
  console.log('✅ Default settings inserted');

  // Insert default stats
  const defaultStats = [
    ['Years Experience', 'سال تجربه', '10+', 'calendar'],
    ['Happy Customers', 'مشتری راضی', '5000+', 'users'],
    ['Motorcycle Models', 'مدل موتورسیکلت', '50+', 'bike'],
    ['Service Centers', 'مرکز خدمات', '5', 'wrench'],
  ];

  defaultStats.forEach(([label, label_fa, value, icon], index) => {
    db.run('INSERT INTO stats (label, label_fa, value, icon, sort_order) VALUES (?, ?, ?, ?, ?)', [label, label_fa, value, icon, index]);
  });
  console.log('✅ Default stats inserted');

  // Insert default categories
  const defaultCategories = [
    ['Sport', 'اسپرت', 'sport'],
    ['Cruiser', 'کروزر', 'cruiser'],
    ['Adventure', 'ادونچر', 'adventure'],
    ['Naked', 'نیکد', 'naked'],
  ];

  defaultCategories.forEach(([name, name_fa, value], index) => {
    db.run('INSERT OR IGNORE INTO categories (name, name_fa, value, sort_order, active) VALUES (?, ?, ?, ?, 1)', [name, name_fa, value, index]);
  });
  console.log('✅ Default categories inserted');

  // Insert default dealers with map URLs
  const defaultDealers = [
    ['Kabul Central Dealership', 'نمایندگی مرکزی کابل', 'Kabul, Shahr-e-Naw, Main Road', 'کابل، شهر نو، سرک اصلی', 'Kabul', 'کابل', '+93-799-111111', 'kabul@poladcyclet.af', 'Sat-Thu: 8 AM - 6 PM', 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52615.37529687997!2d69.13503772695312!3d34.55301080000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb0d2b5b7f5%3A0xfff531b6e2a3d6f8!2sKabul%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s'],
    ['Herat Dealership', 'نمایندگی هرات', 'Herat, Welayat Road', 'هرات، جاده ولایت', 'Herat', 'هرات', '+93-799-222222', 'herat@poladcyclet.af', 'Sat-Thu: 8 AM - 6 PM', 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107234.02741999999!2d62.1540!3d34.3529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f3ce1da33f91f7d%3A0x7a6348f7ab8e6f2!2sHerat%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s'],
    ['Mazar-i-Sharif Dealership', 'نمایندگی مزار شریف', 'Mazar-i-Sharif, Main Street', 'مزار شریف، سرک عمومی', 'Mazar-i-Sharif', 'مزار شریف', '+93-799-333333', 'mazar@poladcyclet.af', 'Sat-Thu: 8 AM - 6 PM', 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51234.09241999999!2d67.1128!3d36.7069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f6007b5a16c48d7%3A0x7f3b89c9f8d1e2a4!2sMazar-i-Sharif%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s'],
    ['Kandahar Dealership', 'نمایندگی قندهار', 'Kandahar, Shaheed Square', 'قندهار، چهارراهی شهید', 'Kandahar', 'قندهار', '+93-799-444444', 'kandahar@poladcyclet.af', 'Sat-Thu: 8 AM - 6 PM', 'شنبه تا پنجشنبه: ۸ صبح - ۶ عصر', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54321.12341999999!2d65.7101!3d31.6078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed8f7ab8e6f2d3c%3A0x8a7b6c5d4e3f2a1b!2sKandahar%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s'],
  ];

  defaultDealers.forEach(([name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url], index) => {
    db.run('INSERT INTO dealers (name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', 
      [name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url, index]);
  });
  console.log('✅ Default dealers inserted');
  // Insert default pages
  const defaultPages = [
    ['about', 'About Us', 'درباره ما', 'We are the leading motorcycle dealership in Afghanistan with over 10 years of experience. Our mission is to provide quality motorcycles and excellent service to our customers.', 'ما بزرگترین نمایندگی موتورسیکلت در افغانستان هستیم با بیش از ۱۰ سال تجربه. ماموریت ما ارائه موتورسیکلت‌های با کیفیت و خدمات عالی به مشتریان است.'],
    ['contact', 'Contact Us', 'تماس با ما', 'Get in touch with us for any inquiries about our motorcycles and services.', 'برای هرگونه سوال درباره موتورسیکلت‌ها و خدمات ما با ما تماس بگیرید.'],
  ];

  defaultPages.forEach(([id, title, title_fa, content, content_fa]) => {
    db.run('INSERT OR REPLACE INTO pages (id, title, title_fa, content, content_fa) VALUES (?, ?, ?, ?, ?)', [id, title, title_fa, content, content_fa]);
  });
  console.log('✅ Default pages inserted');

  // Insert default about content
  db.run(`INSERT OR REPLACE INTO about_content (id, title, title_fa, content, content_fa, image, years_experience) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    ['main', 'Our Story', 'داستان ما', 
     'With over 20 years of experience in the motorcycle industry, we are proud to have earned the trust of thousands of customers. Our team consists of specialists who love motorcycles and always provide you with the best service.', 
     'ما با بیش از ۲۰ سال تجربه در صنعت موتورسیکلت، مفتخریم که توانسته‌ایم اعتماد هزاران مشتری را جلب کنیم. تیم ما متشکل از متخصصانی است که عاشق موتورسیکلت هستند و همواره بهترین خدمات را به شما ارائه می‌دهند.',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', '20+']);
  console.log('✅ Default about content inserted');

  // Insert default values
  const defaultValues = [
    ['Quality', 'کیفیت', 'We only offer genuine and high-quality motorcycles.', 'فقط موتورسیکلت‌های اصل و با کیفیت را عرضه می‌کنیم.', 'shield'],
    ['Trust', 'اعتماد', 'Customer trust is our most valuable asset.', 'اعتماد مشتریان مهم‌ترین سرمایه ماست.', 'heart'],
    ['Service', 'خدمات', 'Professional and fast after-sales service.', 'خدمات پس از فروش حرفه‌ای و سریع.', 'wrench'],
  ];

  defaultValues.forEach(([title, title_fa, description, description_fa, icon], index) => {
    db.run('INSERT INTO about_values (title, title_fa, description, description_fa, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)', 
      [title, title_fa, description, description_fa, icon, index]);
  });
  console.log('✅ Default about values inserted');

  // Insert default team members
  const defaultTeam = [
    ['Ali Mohammadi', 'علی محمدی', 'CEO', 'مدیرعامل', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80'],
    ['Sara Ahmadi', 'سارا احمدی', 'Sales Manager', 'مدیر فروش', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80'],
    ['Reza Karimi', 'رضا کریمی', 'Technical Manager', 'مدیر فنی', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'],
  ];

  defaultTeam.forEach(([name, name_fa, role, role_fa, image], index) => {
    db.run('INSERT INTO about_team (name, name_fa, role, role_fa, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)', 
      [name, name_fa, role, role_fa, image, index]);
  });
  console.log('✅ Default about team inserted');

  // Insert default contact settings
  const defaultContactSettings = [
    ['phone', '+93 70 123 4567', '+۹۳ ۷۰ ۱۲۳ ۴۵۶۷'],
    ['whatsapp', '+93701234567', '+۹۳۷۰۱۲۳۴۵۶۷'],
    ['email', 'info@motoshop.af', 'info@motoshop.af'],
    ['address', 'Kabul, Afghanistan, District 4, Main Street', 'کابل، افغانستان، ناحیه ۴، جاده اصلی'],
    ['working_hours', 'Sat - Thu: 9 AM - 6 PM', 'شنبه تا پنجشنبه: ۹ صبح تا ۶ عصر'],
    ['map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52615.37529687997!2d69.13503772695312!3d34.55301080000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb0d2b5b7f5%3A0xfff531b6e2a3d6f8!2sKabul%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1702000000000!5m2!1sen!2s', ''],
  ];

  defaultContactSettings.forEach(([key, value, value_fa]) => {
    db.run('INSERT OR REPLACE INTO contact_settings (key, value, value_fa) VALUES (?, ?, ?)', [key, value, value_fa]);
  });
  console.log('✅ Default contact settings inserted');

  // Insert default FAQs
  const defaultFAQs = [
    ['What brands do you offer?', 'چه برندهایی عرضه می‌کنید؟', 'We offer a wide range of premium motorcycle brands including Kawasaki, Honda, Yamaha, Ducati, BMW, and more.', 'ما طیف گسترده‌ای از برندهای معتبر موتورسیکلت از جمله کاوازاکی، هوندا، یاماها، دوکاتی، ب‌ام‌و و موارد دیگر را عرضه می‌کنیم.'],
    ['Do you provide warranty?', 'آیا گارانتی ارائه می‌دهید؟', 'Yes, all our motorcycles come with manufacturer warranty. Extended warranty options are also available.', 'بله، تمام موتورسیکلت‌های ما دارای گارانتی کارخانه هستند. گزینه‌های گارانتی تمدید شده نیز موجود است.'],
    ['What payment methods do you accept?', 'چه روش‌های پرداختی را قبول می‌کنید؟', 'We accept cash, bank transfers, and installment plans. Contact us for financing options.', 'ما پول نقد، حواله بانکی و اقساط را قبول می‌کنیم. برای گزینه‌های تامین مالی با ما تماس بگیرید.'],
    ['Do you offer test rides?', 'آیا تست سواری ارائه می‌دهید؟', 'Yes, we offer test rides for most models. Please schedule an appointment in advance.', 'بله، برای اکثر مدل‌ها تست سواری ارائه می‌دهیم. لطفا از قبل وقت رزرو کنید.'],
    ['What after-sales services do you provide?', 'چه خدمات پس از فروشی ارائه می‌دهید؟', 'We provide comprehensive after-sales services including maintenance, repairs, spare parts, and technical support.', 'ما خدمات جامع پس از فروش شامل نگهداری، تعمیرات، قطعات یدکی و پشتیبانی فنی ارائه می‌دهیم.'],
    ['Is shipping to other cities available?', 'آیا امکان ارسال به شهرستان‌ها وجود دارد؟', 'Yes, we ship motorcycles to all cities across Afghanistan. Shipping costs vary based on distance and are calculated at checkout.', 'بله، ما موتورسیکلت‌ها را به تمام شهرهای افغانستان ارسال می‌کنیم. هزینه ارسال بر اساس فاصله محاسبه می‌شود.'],
    ['What are the maintenance costs?', 'هزینه تعمیر و نگهداری چقدر است؟', 'Maintenance costs vary by model and service type. We offer competitive pricing and service packages. Contact us for a detailed quote.', 'هزینه تعمیر و نگهداری بسته به مدل و نوع سرویس متفاوت است. ما قیمت‌های رقابتی و بسته‌های خدماتی ارائه می‌دهیم.'],
    ['Do you sell used motorcycles?', 'آیا موتورسیکلت دست دوم هم دارید؟', 'Yes, we have a selection of certified pre-owned motorcycles. All used bikes are thoroughly inspected and come with a limited warranty.', 'بله، ما مجموعه‌ای از موتورسیکلت‌های دست دوم تایید شده داریم. تمام موتورها کاملا بازرسی شده و گارانتی محدود دارند.'],
    ['How can I place an order?', 'چگونه می‌توانم سفارش دهم؟', 'You can visit our showroom, call us, or send a message via WhatsApp. Our team will guide you through the ordering process.', 'می‌توانید به نمایشگاه ما مراجعه کنید، تماس بگیرید یا از طریق واتساپ پیام دهید. تیم ما شما را در فرآیند سفارش راهنمایی می‌کند.'],
    ['Do you provide riding training?', 'آیا آموزش رانندگی ارائه می‌دهید؟', 'We offer basic riding courses for new buyers. Professional training programs are also available through our partner riding schools.', 'ما دوره‌های پایه رانندگی برای خریداران جدید ارائه می‌دهیم. برنامه‌های آموزشی حرفه‌ای از طریق آموزشگاه‌های همکار نیز در دسترس است.'],
  ];

  defaultFAQs.forEach(([question, question_fa, answer, answer_fa], index) => {
    db.run('INSERT INTO faqs (question, question_fa, answer, answer_fa, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)', 
      [question, question_fa, answer, answer_fa, index]);
  });
  console.log('✅ Default FAQs inserted');

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log('\n🎉 Database initialized successfully!');
  console.log('📁 Database location: backend/data/motoshop.db');
  console.log('\n👤 Admin Login:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
}

initDb().catch(console.error);
