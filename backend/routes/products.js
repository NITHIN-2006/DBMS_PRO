const express = require('express');
const router = express.Router();
const { getProductsByCollege, getProductById, getAllProducts, createProduct, updateProduct, deleteProduct, getCategories } = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/categories', getCategories);
router.get('/', getAllProducts);
router.get('/college/:collegeId', getProductsByCollege);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
