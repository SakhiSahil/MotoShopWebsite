const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');
const { deleteFile } = require('../fileManager');

const router = express.Router();

// Get all active videos (public)
router.get('/', (req, res) => {
  try {
    const videos = prepare('SELECT * FROM videos WHERE active = 1 ORDER BY sort_order ASC').all();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all videos (admin)
router.get('/all', authMiddleware, (req, res) => {
  try {
    const videos = prepare('SELECT * FROM videos ORDER BY sort_order ASC').all();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create video (admin only)
router.post('/', authMiddleware, upload.single('video'), (req, res) => {
  try {
    const { title, title_fa, sort_order, active } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : req.body.url;

    const result = prepare(`
      INSERT INTO videos (url, title, title_fa, sort_order, active)
      VALUES (?, ?, ?, ?, ?)
    `).run(url, title || '', title_fa || '', sort_order || 0, active ? 1 : 0);

    res.json({ id: result.lastInsertRowid, message: 'Video created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update video (admin only)
router.put('/:id', authMiddleware, upload.single('video'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = prepare('SELECT * FROM videos WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { title, title_fa, sort_order, active } = req.body;
    const newUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    const url = newUrl || existing.url;

    // Delete old video if new one is uploaded and old exists
    if (newUrl && existing.url && newUrl !== existing.url) {
      deleteFile(existing.url);
    }

    prepare(`
      UPDATE videos SET 
        url = ?, title = ?, title_fa = ?, sort_order = ?, active = ?
      WHERE id = ?
    `).run(url, title || '', title_fa || '', sort_order || 0, active ? 1 : 0, id);

    res.json({ message: 'Video updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete video (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = prepare('SELECT url FROM videos WHERE id = ?').get(req.params.id);
    
    // Delete the video file
    if (existing?.url) {
      deleteFile(existing.url);
    }
    
    prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
