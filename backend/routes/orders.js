const express = require('express');
const router = express.Router();
const { createOrder, confirmPayment, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, createOrder);
router.post('/confirm-payment', authenticate, confirmPayment);
router.get('/my-orders', authenticate, getUserOrders);
router.get('/all', authenticate, authorizeAdmin, getAllOrders);
router.put('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

module.exports = router;
