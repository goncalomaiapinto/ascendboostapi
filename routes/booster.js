const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// Middleware para autenticação e autorização de Booster
router.use(authenticate);
router.use(authorize(['Booster']));

/**
 * @swagger
 * tags:
 *   name: Booster
 *   description: Booster management of orders
 */

/**
 * @swagger
 * /booster/orders:
 *   get:
 *     summary: Get a list of available orders
 *     tags: [Booster]
 *     responses:
 *       200:
 *         description: List of available orders
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
router.get('/orders', async (req, res) => {
  const orders = await Order.findAll({ where: { status: 'Available' } });
  res.json(orders);
});

/**
 * @swagger
 * /booster/orders/{id}/claim:
 *   put:
 *     summary: Claim an available order
 *     tags: [Booster]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 boosterId:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Order is not available
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/claim', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.status !== 'Available') {
    return res.status(400).json({ error: 'Order is not available' });
  }

  order.boosterId = req.user.id;
  order.status = 'In Progress';
  await order.save();
  res.json(order);
});

/**
 * @swagger
 * /booster/orders/history:
 *   get:
 *     summary: Get the booster’s order history
 *     tags: [Booster]
 *     responses:
 *       200:
 *         description: List of the booster’s order history
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
 *                   boosterId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   type:
 *                     type: string
 *                   price:
 *                     type: number
 */
router.get('/orders/history', async (req, res) => {
  const orders = await Order.findAll({ where: { boosterId: req.user.id } });
  res.json(orders);
});

/**
 * @swagger
 * /booster/notifications:
 *   put:
 *     summary: Update notification settings for available orders
 *     tags: [Booster]
 *     responses:
 *       200:
 *         description: Notifications settings updated
 */
router.put('/notifications', (req, res) => {
  // Implementar lógica para configurar notificações
  res.json({ message: 'Notifications settings updated' });
});

/**
 * @swagger
 * /booster/profile:
 *   put:
 *     summary: Update the booster’s profile
 *     tags: [Booster]
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
 *         description: Profile updated successfully
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
router.put('/profile', async (req, res) => {
  const user = await User.findByPk(req.user.id);
  await user.update(req.body);
  res.json(user);
});

module.exports = router;
