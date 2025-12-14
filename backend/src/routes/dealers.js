const express = require('express');
const router = express.Router();
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Get all active dealers (public)
router.get('/', (req, res) => {
  try {
    const dealers = prepare('SELECT * FROM dealers WHERE active = 1 ORDER BY sort_order ASC').all();
    res.json(dealers);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Get all dealers including inactive (admin)
router.get('/all', authMiddleware, (req, res) => {
  try {
    const dealers = prepare('SELECT * FROM dealers ORDER BY sort_order ASC').all();
    res.json(dealers);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Create dealer (admin)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url, sort_order, active } = req.body;
    
    if (!name || !name_fa) {
      return res.status(400).json({ error: 'Name is required in both languages' });
    }

    const result = prepare(`
      INSERT INTO dealers (name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url, sort_order, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, name_fa, address || '', address_fa || '', city || '', city_fa || '', phone || '', email || '', hours || '', hours_fa || '', map_url || '', sort_order || 0, active !== false ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Dealer created successfully' });
  } catch (error) {
    console.error('Error creating dealer:', error);
    res.status(500).json({ error: 'Failed to create dealer' });
  }
});

// Update dealer (admin)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fa, address, address_fa, city, city_fa, phone, email, hours, hours_fa, map_url, sort_order, active } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (name_fa !== undefined) { updates.push('name_fa = ?'); values.push(name_fa); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (address_fa !== undefined) { updates.push('address_fa = ?'); values.push(address_fa); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (city_fa !== undefined) { updates.push('city_fa = ?'); values.push(city_fa); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (hours !== undefined) { updates.push('hours = ?'); values.push(hours); }
    if (hours_fa !== undefined) { updates.push('hours_fa = ?'); values.push(hours_fa); }
    if (map_url !== undefined) { updates.push('map_url = ?'); values.push(map_url); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }
    if (active !== undefined) { updates.push('active = ?'); values.push(active ? 1 : 0); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    prepare(`UPDATE dealers SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    res.json({ message: 'Dealer updated successfully' });
  } catch (error) {
    console.error('Error updating dealer:', error);
    res.status(500).json({ error: 'Failed to update dealer' });
  }
});

// Delete dealer (admin)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    prepare('DELETE FROM dealers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Dealer deleted successfully' });
  } catch (error) {
    console.error('Error deleting dealer:', error);
    res.status(500).json({ error: 'Failed to delete dealer' });
  }
});

module.exports = router;
