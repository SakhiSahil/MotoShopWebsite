const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');
const { deleteFile, getStorageStats, getAllFiles, getFilenameFromUrl } = require('../fileManager');
const { prepare } = require('../database');

const router = express.Router();

// Error handler for multer
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

// Upload single image
router.post('/', authMiddleware, handleUpload(upload.single('image')), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', authMiddleware, handleUpload(upload.array('images', 10)), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a single file
router.delete('/:filename', authMiddleware, (req, res) => {
  try {
    const { filename } = req.params;
    const url = `/uploads/${filename}`;
    
    if (deleteFile(url)) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or could not be deleted' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get storage statistics
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = getStorageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup orphan files (files not referenced in database)
router.post('/cleanup', authMiddleware, (req, res) => {
  try {
    // Get all files from uploads directory
    const allFiles = getAllFiles();
    
    // Collect all file URLs from database
    const usedUrls = new Set();
    
    // Products: image and gallery
    const products = prepare('SELECT image, gallery FROM products').all();
    products.forEach(p => {
      if (p.image) usedUrls.add(p.image);
      if (p.gallery) {
        try {
          const gallery = JSON.parse(p.gallery);
          gallery.forEach(url => usedUrls.add(url));
        } catch (e) {}
      }
    });
    
    // Slides
    const slides = prepare('SELECT image FROM slides').all();
    slides.forEach(s => {
      if (s.image) usedUrls.add(s.image);
    });
    
    // Brands
    const brands = prepare('SELECT logo FROM brands').all();
    brands.forEach(b => {
      if (b.logo) usedUrls.add(b.logo);
    });
    
    // Settings (logos, videos, etc.)
    const settings = prepare('SELECT value, value_fa FROM settings').all();
    settings.forEach(s => {
      if (s.value && s.value.includes('/uploads/')) usedUrls.add(s.value);
      if (s.value_fa && s.value_fa.includes('/uploads/')) usedUrls.add(s.value_fa);
    });
    
    // About content
    try {
      const about = prepare('SELECT image FROM about_content LIMIT 1').get();
      if (about?.image) usedUrls.add(about.image);
    } catch (e) {}
    
    // Find orphan files
    const orphanFiles = allFiles.filter(file => !usedUrls.has(file.url));
    
    // Delete orphan files
    let deletedCount = 0;
    let freedSpace = 0;
    
    for (const file of orphanFiles) {
      if (deleteFile(file.url)) {
        deletedCount++;
        freedSpace += file.size;
      }
    }
    
    res.json({
      message: `Cleanup completed`,
      deletedFiles: deletedCount,
      freedSpaceBytes: freedSpace,
      freedSpaceMB: (freedSpace / (1024 * 1024)).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
