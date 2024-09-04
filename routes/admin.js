const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// Middleware para autenticação e autorização de Admin
router.use(authenticate);
router.use(authorize(['Admin']));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management of users and orders
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/orders', async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
});

/**
 * @swagger
 * /admin/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all clients
 */
router.get('/clients', async (req, res) => {
  const clients = await User.findAll({ where: { role: 'Client' } });
  res.json(clients);
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all admins
 */
router.get('/admins', async (req, res) => {
  const admins = await User.findAll({ where: { role: 'Admin' } });
  res.json(admins);
});

/**
 * @swagger
 * /admin/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 */
router.post('/orders', async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
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
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [Client, Booster, Admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

/**
 * @swagger
 * /admin/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  await order.update(req.body);
  res.json(order);
});

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
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
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [Client, Booster, Admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update(req.body);
  res.json(user);
});

/**
 * @swagger
 * /admin/orders/{id}/remove-booster:
 *   put:
 *     summary: Remove booster from an order
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Booster removed successfully
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/remove-booster', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.boosterId = null;
  await order.save();
  res.json(order);
});

/**
 * @swagger
 * /admin/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/orders/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  await order.destroy();
  res.json({ message: 'Order deleted' });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.destroy();
  res.json({ message: 'User deleted' });
});

/**
 * @swagger
 * /admin/orders/{id}/assign-booster:
 *   put:
 *     summary: Assign a booster to an order
 *     description: Admin can assign a booster to an order. The order must be in 'Available' status.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order
 *       - in: body
 *         name: boosterId
 *         description: The ID of the booster to assign to the order
 *         schema:
 *           type: object
 *           required:
 *             - boosterId
 *           properties:
 *             boosterId:
 *               type: integer
 *               example: 5
 *     responses:
 *       200:
 *         description: Booster assigned to order
 *       400:
 *         description: Order is not available for assignment
 *       404:
 *         description: Order or Booster not found
 */
router.put('/orders/:id/assign-booster', async (req, res) => {
  const { boosterId } = req.body;
  const order = await Order.findByPk(req.params.id);
  const booster = await User.findByPk(boosterId);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!booster || booster.role !== 'Booster') return res.status(404).json({ error: 'Booster not found' });

  if (order.status !== 'Available') {
    return res.status(400).json({ error: 'Order is not available for assignment' });
  }

  // Associar o booster à order
  order.boosterId = booster.id;
  order.status = 'In Progress';
  await order.save();

  res.json({ message: 'Booster assigned to order' });
});

/**
 * @swagger
 * /admin/boosters/{id}/add-funds:
 *   put:
 *     summary: Add funds to a booster's wallet
 *     description: Admin can add a specified amount of money to a booster's wallet.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the booster
 *       - in: body
 *         name: amount
 *         description: The amount of money to add to the wallet
 *         schema:
 *           type: object
 *           required:
 *             - amount
 *           properties:
 *             amount:
 *               type: number
 *               example: 100.00
 *     responses:
 *       200:
 *         description: Funds added to wallet
 *       404:
 *         description: Booster not found
 */
router.put('/boosters/:id/add-funds', async (req, res) => {
  const { amount } = req.body;
  const booster = await User.findByPk(req.params.id);

  if (!booster || booster.role !== 'Booster') {
    return res.status(404).json({ error: 'Booster not found' });
  }

  // Adicionar o valor à wallet
  booster.wallet += parseFloat(amount);
  await booster.save();

  res.json({ message: 'Funds added to wallet', wallet: booster.wallet });
});


/**
 * @swagger
 * /admin/boosters/{id}/remove-funds:
 *   put:
 *     summary: Remove funds from a booster's wallet
 *     description: Admin can remove a specified amount of money from a booster's wallet, allowing the balance to become negative.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the booster
 *       - in: body
 *         name: amount
 *         description: The amount of money to remove from the wallet
 *         schema:
 *           type: object
 *           required:
 *             - amount
 *           properties:
 *             amount:
 *               type: number
 *               example: 50.00
 *     responses:
 *       200:
 *         description: Funds removed from wallet
 *       404:
 *         description: Booster not found
 */
router.put('/boosters/:id/remove-funds', async (req, res) => {
  const { amount } = req.body;
  const booster = await User.findByPk(req.params.id);

  if (!booster || booster.role !== 'Booster') {
    return res.status(404).json({ error: 'Booster not found' });
  }

  // Remover o valor da wallet (permitindo que fique negativa)
  booster.wallet -= parseFloat(amount);
  await booster.save();

  res.json({ message: 'Funds removed from wallet', wallet: booster.wallet });
});

module.exports = router;
