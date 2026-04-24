const express = require('express');
const router = express.Router();
const { getAllColleges, getCollegeById, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getAllColleges);
router.get('/:id', getCollegeById);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createCollege);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateCollege);
router.delete('/:id', authenticate, authorizeAdmin, deleteCollege);

module.exports = router;
