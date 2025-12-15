const express = require('express');
const { prepare, saveDatabase } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all FAQs (public - only active)
router.get('/', (req, res) => {
  try {
    const stmt = prepare('SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order ASC');
    const faqs = stmt.all();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Get all FAQs (admin - including inactive)
router.get('/all', authMiddleware, (req, res) => {
  try {
    const stmt = prepare('SELECT * FROM faqs ORDER BY sort_order ASC');
    const faqs = stmt.all();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Create FAQ
router.post('/', authMiddleware, (req, res) => {
  try {
    const { question, question_fa, answer, answer_fa, sort_order = 0, active = true } = req.body;
    
    const stmt = prepare(`
      INSERT INTO faqs (question, question_fa, answer, answer_fa, sort_order, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(question, question_fa, answer, answer_fa, sort_order, active ? 1 : 0);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'FAQ created successfully' });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Update FAQ
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { question, question_fa, answer, answer_fa, sort_order, active } = req.body;
    
    const stmt = prepare(`
      UPDATE faqs 
      SET question = ?, question_fa = ?, answer = ?, answer_fa = ?, sort_order = ?, active = ?
      WHERE id = ?
    `);
    stmt.run(question, question_fa, answer, answer_fa, sort_order, active ? 1 : 0, id);
    
    res.json({ message: 'FAQ updated successfully' });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// Delete FAQ
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = prepare('DELETE FROM faqs WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
