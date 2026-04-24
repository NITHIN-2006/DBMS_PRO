const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

const getAllColleges = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM colleges ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const getCollegeById = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM colleges WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'College not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const createCollege = async (req, res, next) => {
  try {
    const { name, location } = req.body;
    const image_url = req.file ? req.file.path : null;
    if (!name) return res.status(400).json({ message: 'College name is required' });
    const [result] = await db.query(
      'INSERT INTO colleges (name, location, image_url) VALUES (?, ?, ?)',
      [name, location, image_url]
    );
    res.status(201).json({ id: result.insertId, name, location, image_url });
  } catch (err) {
    next(err);
  }
};

const updateCollege = async (req, res, next) => {
  try {
    const { name, location } = req.body;
    const image_url = req.file ? req.file.path : null;
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (location) { updates.push('location = ?'); values.push(location); }
    if (image_url) { updates.push('image_url = ?'); values.push(image_url); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    values.push(req.params.id);
    await db.query(`UPDATE colleges SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'College updated' });
  } catch (err) {
    next(err);
  }
};

const deleteCollege = async (req, res, next) => {
  try {
    await db.query('DELETE FROM colleges WHERE id = ?', [req.params.id]);
    res.json({ message: 'College deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllColleges, getCollegeById, createCollege, updateCollege, deleteCollege };
