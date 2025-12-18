const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../upload');

const router = express.Router();

// Get all products (public)
router.get('/', (req, res) => {
  try {
    const products = prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    const parsed = products.map(p => ({
      ...p,
      gallery: JSON.parse(p.gallery || '[]'),
      featured: Boolean(p.featured),
      inStock: Boolean(p.in_stock)
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product (public)
router.get('/:id', (req, res) => {
  try {
    const product = prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      ...product,
      gallery: JSON.parse(product.gallery || '[]'),
      featured: Boolean(product.featured),
      inStock: Boolean(product.in_stock)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to parse boolean from string
const parseBool = (val) => val === '1' || val === 'true' || val === true;

// Create product (admin only)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const id = uuidv4();
    const {
      name, name_fa, brand, brand_fa, category, category_fa,
      price, price_fa, year, year_fa, engine, engine_fa, power, power_fa,
      top_speed, top_speed_fa, weight, weight_fa,
      fuel_capacity, fuel_capacity_fa, description, description_fa,
      featured, in_stock, inStock
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    const gallery = req.body.gallery ? JSON.stringify(JSON.parse(req.body.gallery)) : '[]';
    const isFeatured = parseBool(featured);
    const isInStock = parseBool(in_stock) || parseBool(inStock);

    prepare(`
      INSERT INTO products (
        id, name, name_fa, brand, brand_fa, category, category_fa,
        price, price_fa, year, year_fa, engine, engine_fa, power, power_fa,
        top_speed, top_speed_fa, weight, weight_fa,
        fuel_capacity, fuel_capacity_fa, description, description_fa,
        image, gallery, featured, in_stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, name_fa, brand, brand_fa, category, category_fa,
      price, price_fa, year || '', year_fa || '', engine, engine_fa, power, power_fa,
      top_speed, top_speed_fa, weight, weight_fa,
      fuel_capacity, fuel_capacity_fa, description, description_fa,
      image, gallery, isFeatured ? 1 : 0, isInStock ? 1 : 0
    );

    res.json({ id, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = prepare('SELECT * FROM products WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name, name_fa, brand, brand_fa, category, category_fa,
      price, price_fa, year, year_fa, engine, engine_fa, power, power_fa,
      top_speed, top_speed_fa, weight, weight_fa,
      fuel_capacity, fuel_capacity_fa, description, description_fa,
      featured, in_stock, inStock
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || existing.image);
    const gallery = req.body.gallery ? JSON.stringify(JSON.parse(req.body.gallery)) : existing.gallery;
    const isFeatured = parseBool(featured);
    const isInStock = parseBool(in_stock) || parseBool(inStock);

    prepare(`
      UPDATE products SET
        name = ?, name_fa = ?, brand = ?, brand_fa = ?, category = ?, category_fa = ?,
        price = ?, price_fa = ?, year = ?, year_fa = ?, engine = ?, engine_fa = ?, power = ?, power_fa = ?,
        top_speed = ?, top_speed_fa = ?, weight = ?, weight_fa = ?,
        fuel_capacity = ?, fuel_capacity_fa = ?, description = ?, description_fa = ?,
        image = ?, gallery = ?, featured = ?, in_stock = ?
      WHERE id = ?
    `).run(
      name, name_fa, brand, brand_fa, category, category_fa,
      price, price_fa, year || '', year_fa || '', engine, engine_fa, power, power_fa,
      top_speed, top_speed_fa, weight, weight_fa,
      fuel_capacity, fuel_capacity_fa, description, description_fa,
      image, gallery, isFeatured ? 1 : 0, isInStock ? 1 : 0, id
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const result = prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
