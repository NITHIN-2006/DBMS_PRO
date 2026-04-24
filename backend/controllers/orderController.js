const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const createOrder = async (req, res, next) => {
  const conn = await (require('../config/db')).getConnection();
  try {
    await conn.beginTransaction();
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    let total = 0;
    const enrichedItems = [];
    for (const item of items) {
      const [rows] = await conn.query('SELECT id, price, stock FROM products WHERE id = ?', [item.product_id]);
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }
      const product = rows[0];
      if (product.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
      }
      total += product.price * item.quantity;
      enrichedItems.push({ product_id: item.product_id, quantity: item.quantity, price: product.price });
    }
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.id, total, 'pending']
    );
    const orderId = orderResult.insertId;
    for (const item of enrichedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { order_id: orderId.toString() }
    });
    await conn.query(
      'INSERT INTO payments (order_id, stripe_payment_intent_id, amount, status) VALUES (?, ?, ?, ?)',
      [orderId, paymentIntent.id, total, 'pending']
    );
    await conn.commit();
    res.status(201).json({
      order_id: orderId,
      client_secret: paymentIntent.client_secret,
      total
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { order_id, payment_intent_id } = req.body;
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (intent.status === 'succeeded') {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', order_id]);
      await db.query('UPDATE payments SET status = ? WHERE order_id = ?', ['succeeded', order_id]);
      return res.json({ message: 'Payment confirmed' });
    }
    res.status(400).json({ message: 'Payment not completed' });
  } catch (err) {
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name AS product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name AS product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, confirmPayment, getUserOrders, getAllOrders, updateOrderStatus };
