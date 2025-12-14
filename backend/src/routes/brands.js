const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');

const router = express.Router();

// Get all brands (public)
router.get('/', (req, res) => {
  try {
    const brands = prepare('SELECT * FROM brands WHERE active = 1').all();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all brands including inactive (admin)
router.get('/all', authMiddleware, (req, res) => {
  try {
    const brands = prepare('SELECT * FROM brands').all();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create brand (admin only)
router.post('/', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    const { name, name_fa, active } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : req.body.logo;

    const result = prepare(`
      INSERT INTO brands (name, name_fa, logo, active) VALUES (?, ?, ?, ?)
    `).run(name, name_fa, logo, active ? 1 : 0);

    res.json({ id: result.lastInsertRowid, message: 'Brand created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update brand (admin only)
router.put('/:id', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = prepare('SELECT * FROM brands WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const { name, name_fa, active } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : (req.body.logo || existing.logo);

    prepare(`
      UPDATE brands SET name = ?, name_fa = ?, logo = ?, active = ? WHERE id = ?
    `).run(name, name_fa, logo, active ? 1 : 0, id);

    res.json({ message: 'Brand updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete brand (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
