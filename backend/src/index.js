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

const app = express();
const PORT = process.env.PORT || 3001;

// Uploads directory
const uploadsDir = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// API routes
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
  res.json({ status: 'ok', message: 'Moto Shop API is running' });
});

// Serve frontend
const frontendDist = path.join(__dirname, '../../dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Uploads: ${uploadsDir}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
