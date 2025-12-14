const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all settings (public)
router.get('/', (req, res) => {
  try {
    const settings = prepare('SELECT * FROM settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = { value: s.value, value_fa: s.value_fa };
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats (public)
router.get('/stats', (req, res) => {
  try {
    const stats = prepare('SELECT * FROM stats ORDER BY sort_order ASC').all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting (admin only)
router.put('/:key', authMiddleware, (req, res) => {
  try {
    const { key } = req.params;
    const { value, value_fa } = req.body;

    prepare('INSERT OR REPLACE INTO settings (key, value, value_fa) VALUES (?, ?, ?)').run(key, value, value_fa);

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update multiple settings (admin only)
router.put('/', authMiddleware, (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, data] of Object.entries(settings)) {
      const value = data.value || '';
      const value_fa = data.value_fa || '';
      prepare('INSERT OR REPLACE INTO settings (key, value, value_fa) VALUES (?, ?, ?)').run(key, value, value_fa);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stats (admin only)
router.put('/stats/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { label, label_fa, value, icon, sort_order } = req.body;

    prepare(`
      UPDATE stats SET label = ?, label_fa = ?, value = ?, icon = ?, sort_order = ?
      WHERE id = ?
    `).run(label, label_fa, value, icon, sort_order, id);

    res.json({ message: 'Stat updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stat (admin only)
router.post('/stats', authMiddleware, (req, res) => {
  try {
    const { label, label_fa, value, icon, sort_order } = req.body;
    
    const result = prepare(`
      INSERT INTO stats (label, label_fa, value, icon, sort_order) VALUES (?, ?, ?, ?, ?)
    `).run(label, label_fa, value, icon, sort_order || 0);

    res.json({ id: result.lastInsertRowid, message: 'Stat created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete stat (admin only)
router.delete('/stats/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM stats WHERE id = ?').run(req.params.id);
    res.json({ message: 'Stat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
