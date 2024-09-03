const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// Middleware para autenticação e autorização de Client
router.use(authenticate);
router.use(authorize(['Client']));

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Client interactions with orders
 */

/**
 * @swagger
 * /client/orders:
 *   post:
 *     summary: Create a new order for the client
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 type:
 *                   type: string
 *                 price:
 *                   type: number
 *       400:
 *         description: Error creating order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.post('/orders', async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, userId: req.user.id });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Error creating order', details: error.message });
  }
});

/**
 * @swagger
 * /client/orders/{id}/request-booster:
 *   put:
 *     summary: Request a new booster for an order
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Booster request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 boosterId:
 *                   type: integer
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/request-booster', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  order.boosterId = null;  // Desassociar booster
  await order.save();
  res.json(order);
});

/**
 * @swagger
 * /client/orders/history:
 *   get:
 *     summary: Get the client's order history
 *     tags: [Client]
 *     responses:
 *       200:
 *         description: List of the client's order history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   type:
 *                     type: string
 *                   price:
 *                     type: number
 */
router.get('/orders/history', async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.user.id } });
  res.json(orders);
});

/**
 * @swagger
 * /client/orders/{id}/feedback:
 *   post:
 *     summary: Submit feedback for an order
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.post('/orders/:id/feedback', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  // Adicionar lógica para salvar o feedback
  order.feedback = req.body.feedback;
  await order.save();
  res.json({ message: 'Feedback submitted' });
});

/**
 * @swagger
 * /client/orders/{id}/notifications:
 *   put:
 *     summary: Update notification settings for an order
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Notifications settings updated
 */
router.put('/orders/:id/notifications', async (req, res) => {
  // Implementar lógica para configurar notificações
  res.json({ message: 'Notifications settings updated' });
});

/**
 * @swagger
 * /client/account:
 *   put:
 *     summary: Update the client's account details
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 */
router.put('/account', async (req, res) => {
  const user = await User.findByPk(req.user.id);
  await user.update(req.body);
  res.json(user);
});

module.exports = router;
