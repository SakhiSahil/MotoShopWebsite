const express = require('express');
const router = express.Router();
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Get about content (public)
router.get('/content', (req, res) => {
  try {
    const content = prepare('SELECT * FROM about_content WHERE id = ?').get('main');
    if (!content) {
      return res.json({
        id: 'main',
        title: 'Our Story',
        title_fa: 'داستان ما',
        content: 'With over 20 years of experience in the motorcycle industry, we are proud to have earned the trust of thousands of customers.',
        content_fa: 'ما با بیش از ۲۰ سال تجربه در صنعت موتورسیکلت، مفتخریم که توانسته‌ایم اعتماد هزاران مشتری را جلب کنیم.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        years_experience: '20+',
      });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update about content (admin only)
router.put('/content', authMiddleware, (req, res) => {
  try {
    const { title, title_fa, content, content_fa, image, years_experience } = req.body;
    prepare(`
      INSERT OR REPLACE INTO about_content (id, title, title_fa, content, content_fa, image, years_experience)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('main', title, title_fa, content, content_fa, image, years_experience);
    res.json({ message: 'About content updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all values (public)
router.get('/values', (req, res) => {
  try {
    const values = prepare('SELECT * FROM about_values ORDER BY sort_order').all();
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create value (admin only)
router.post('/values', authMiddleware, (req, res) => {
  try {
    const { title, title_fa, description, description_fa, icon, sort_order } = req.body;
    const result = prepare(`
      INSERT INTO about_values (title, title_fa, description, description_fa, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, title_fa, description, description_fa, icon, sort_order || 0);
    res.json({ id: result.lastInsertRowid, message: 'Value created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update value (admin only)
router.put('/values/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_fa, description, description_fa, icon, sort_order } = req.body;
    prepare(`
      UPDATE about_values SET title = ?, title_fa = ?, description = ?, description_fa = ?, icon = ?, sort_order = ?
      WHERE id = ?
    `).run(title, title_fa, description, description_fa, icon, sort_order || 0, id);
    res.json({ message: 'Value updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete value (admin only)
router.delete('/values/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM about_values WHERE id = ?').run(req.params.id);
    res.json({ message: 'Value deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all team members (public)
router.get('/team', (req, res) => {
  try {
    const team = prepare('SELECT * FROM about_team ORDER BY sort_order').all();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team member (admin only)
router.post('/team', authMiddleware, (req, res) => {
  try {
    const { name, name_fa, role, role_fa, image, sort_order } = req.body;
    const result = prepare(`
      INSERT INTO about_team (name, name_fa, role, role_fa, image, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, name_fa, role, role_fa, image, sort_order || 0);
    res.json({ id: result.lastInsertRowid, message: 'Team member created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team member (admin only)
router.put('/team/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fa, role, role_fa, image, sort_order } = req.body;
    prepare(`
      UPDATE about_team SET name = ?, name_fa = ?, role = ?, role_fa = ?, image = ?, sort_order = ?
      WHERE id = ?
    `).run(name, name_fa, role, role_fa, image, sort_order || 0, id);
    res.json({ message: 'Team member updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete team member (admin only)
router.delete('/team/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM about_team WHERE id = ?').run(req.params.id);
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
