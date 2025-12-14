const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public)
router.get('/', (req, res) => {
  try {
    const categories = prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
    const parsed = categories.map(c => ({
      ...c,
      active: Boolean(c.active)
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, name_fa, value, sort_order = 0, active = 1 } = req.body;

    const result = prepare(`
      INSERT INTO categories (name, name_fa, value, sort_order, active)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, name_fa, value, sort_order, active ? 1 : 0);

    res.json({ id: result.lastInsertRowid, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fa, value, sort_order, active } = req.body;

    const existing = prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    prepare(`
      UPDATE categories SET
        name = ?, name_fa = ?, value = ?, sort_order = ?, active = ?
      WHERE id = ?
    `).run(
      name ?? existing.name,
      name_fa ?? existing.name_fa,
      value ?? existing.value,
      sort_order ?? existing.sort_order,
      active !== undefined ? (active ? 1 : 0) : existing.active,
      id
    );

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const result = prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
