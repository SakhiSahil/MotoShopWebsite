const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get contact settings (public)
router.get('/settings', (req, res) => {
  try {
    const settings = prepare('SELECT * FROM contact_settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = { value: s.value, value_fa: s.value_fa };
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact settings (admin only)
router.put('/settings', authMiddleware, (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, data] of Object.entries(settings)) {
      prepare('INSERT OR REPLACE INTO contact_settings (key, value, value_fa) VALUES (?, ?, ?)').run(key, data.value, data.value_fa);
    }

    res.json({ message: 'Contact settings updated successfully' });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all contact messages (admin only)
router.get('/messages', authMiddleware, (req, res) => {
  try {
    const messages = prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit contact message (public)
router.post('/messages', (req, res) => {
  try {
    const { name, email, phone, message, product_id, product_name } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const result = prepare(`
      INSERT INTO contact_messages (name, email, phone, message, product_id, product_name, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(name, email || '', phone || '', message, product_id || null, product_name || null);

    res.json({ id: result.lastInsertRowid, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read (admin only)
router.put('/messages/:id/read', authMiddleware, (req, res) => {
  try {
    prepare('UPDATE contact_messages SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message (admin only)
router.delete('/messages/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
