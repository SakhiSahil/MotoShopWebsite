const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all pages (public)
router.get('/', (req, res) => {
  try {
    const pages = prepare('SELECT * FROM pages').all();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single page (public)
router.get('/:id', (req, res) => {
  try {
    const page = prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update page (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_fa, content, content_fa, meta_description, meta_description_fa } = req.body;

    prepare(`
      INSERT OR REPLACE INTO pages (id, title, title_fa, content, content_fa, meta_description, meta_description_fa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, title_fa, content, content_fa, meta_description, meta_description_fa);

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
