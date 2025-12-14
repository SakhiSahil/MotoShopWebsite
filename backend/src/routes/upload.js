const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');

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

module.exports = router;
