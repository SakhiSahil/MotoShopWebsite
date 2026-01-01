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

// Create new page (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { id, title, title_fa, content, content_fa, meta_description, meta_description_fa } = req.body;

    if (!id || !title || !title_fa) {
      return res.status(400).json({ error: 'ID, title and title_fa are required' });
    }

    // Check if page already exists
    const existing = prepare('SELECT id FROM pages WHERE id = ?').get(id);
    if (existing) {
      return res.status(400).json({ error: 'Page with this ID already exists' });
    }

    prepare(`
      INSERT INTO pages (id, title, title_fa, content, content_fa, meta_description, meta_description_fa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, title_fa, content || '', content_fa || '', meta_description || '', meta_description_fa || '');

    res.json({ id, message: 'Page created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update page (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_fa, content, content_fa, meta_description, meta_description_fa } = req.body;

    prepare(`
      UPDATE pages SET title = ?, title_fa = ?, content = ?, content_fa = ?, meta_description = ?, meta_description_fa = ?
      WHERE id = ?
    `).run(title, title_fa, content, content_fa, meta_description, meta_description_fa, id);

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete page (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    prepare('DELETE FROM pages WHERE id = ?').run(id);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
