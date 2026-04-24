const db = require('../config/db');

const getProductsByCollege = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, col.name AS college_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN colleges col ON p.college_id = col.id
       WHERE p.college_id = ?
       ORDER BY p.name ASC`,
      [req.params.collegeId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, col.name AS college_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN colleges col ON p.college_id = col.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, col.name AS college_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN colleges col ON p.college_id = col.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { college_id, category_id, name, description, price, stock } = req.body;
    const image_url = req.file ? req.file.path : null;
    if (!college_id || !category_id || !name || !price) {
      return res.status(400).json({ message: 'college_id, category_id, name, and price are required' });
    }
    const [result] = await db.query(
      'INSERT INTO products (college_id, category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [college_id, category_id, name, description, parseFloat(price), parseInt(stock) || 0, image_url]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { college_id, category_id, name, description, price, stock } = req.body;
    const image_url = req.file ? req.file.path : null;
    const updates = [];
    const values = [];
    if (college_id) { updates.push('college_id = ?'); values.push(college_id); }
    if (category_id) { updates.push('category_id = ?'); values.push(category_id); }
    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (price) { updates.push('price = ?'); values.push(parseFloat(price)); }
    if (stock !== undefined) { updates.push('stock = ?'); values.push(parseInt(stock)); }
    if (image_url) { updates.push('image_url = ?'); values.push(image_url); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    values.push(req.params.id);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProductsByCollege, getProductById, getAllProducts, createProduct, updateProduct, deleteProduct, getCategories };
