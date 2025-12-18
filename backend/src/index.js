require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const settingsRoutes = require('./routes/settings');
const brandsRoutes = require('./routes/brands');
const slidesRoutes = require('./routes/slides');
const pagesRoutes = require('./routes/pages');
const uploadRoutes = require('./routes/upload');
const categoriesRoutes = require('./routes/categories');
const dealersRoutes = require('./routes/dealers');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const faqRoutes = require('./routes/faq');

// Determine upload directory based on environment
const isProduction = process.env.NODE_ENV === 'production';
const uploadsDir = process.env.UPLOAD_PATH || (isProduction ? '/data/uploads' : path.join(__dirname, '../uploads'));

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files in production
if (isProduction) {
  const frontendDist = path.join(__dirname, '../../dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dealers', dealersRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Polad Cyclet API is running' });
});

// Serve frontend for all non-API routes in production
if (isProduction) {
  const frontendDist = path.join(__dirname, '../../dist');
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Initialize database then start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📂 Uploads: ${uploadsDir}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
