const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');

const router = express.Router();

// Get all active slides (public)
router.get('/', (req, res) => {
  try {
    const slides = prepare('SELECT * FROM slides WHERE active = 1 ORDER BY sort_order ASC').all();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all slides (admin)
router.get('/all', authMiddleware, (req, res) => {
  try {
    const slides = prepare('SELECT * FROM slides ORDER BY sort_order ASC').all();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create slide (admin only)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { title, title_fa, subtitle, subtitle_fa, button_text, button_text_fa, button_link, sort_order, active } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const result = prepare(`
      INSERT INTO slides (title, title_fa, subtitle, subtitle_fa, image, button_text, button_text_fa, button_link, sort_order, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, title_fa, subtitle, subtitle_fa, image, button_text, button_text_fa, button_link, sort_order || 0, active ? 1 : 0);

    res.json({ id: result.lastInsertRowid, message: 'Slide created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update slide (admin only)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = prepare('SELECT * FROM slides WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    const { title, title_fa, subtitle, subtitle_fa, button_text, button_text_fa, button_link, sort_order, active } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || existing.image);

    prepare(`
      UPDATE slides SET 
        title = ?, title_fa = ?, subtitle = ?, subtitle_fa = ?, image = ?,
        button_text = ?, button_text_fa = ?, button_link = ?, sort_order = ?, active = ?
      WHERE id = ?
    `).run(title, title_fa, subtitle, subtitle_fa, image, button_text, button_text_fa, button_link, sort_order || 0, active ? 1 : 0, id);

    res.json({ message: 'Slide updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete slide (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM slides WHERE id = ?').run(req.params.id);
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
