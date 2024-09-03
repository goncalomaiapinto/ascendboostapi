// routes/chat.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Middleware para autenticação
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat between client and booster
 */

/**
 * @swagger
 * /chat/orders/{orderId}:
 *   get:
 *     summary: Get all messages for an order
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/orders/:orderId', async (req, res) => {
  const messages = await Message.findAll({ where: { orderId: req.params.orderId } });
  res.json(messages);
});

/**
 * @swagger
 * /chat/orders/{orderId}:
 *   post:
 *     summary: Send a message in the chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/orders/:orderId', async (req, res) => {
  try {
    const { content } = req.body;
    const { orderId } = req.params;

    // Aqui, definimos o remetente e o destinatário com base no contexto (client ou booster)
    const senderId = req.user.id;
    const receiverId = await determineReceiverId(orderId, senderId);  // Função que você terá que definir

    const message = await Message.create({
      content,
      senderId,
      receiverId,
      orderId,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Error sending message', details: error.message });
  }
});

// Função para determinar o destinatário da mensagem
async function determineReceiverId(orderId, senderId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');

  if (order.userId === senderId) {
    return order.boosterId;
  } else if (order.boosterId === senderId) {
    return order.userId;
  } else {
    throw new Error('Invalid sender');
  }
}

module.exports = router;
