const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const boosterRoutes = require('./routes/booster');
const chatRoutes = require('./routes/chat'); // Novo: importando as rotas de chat
require('dotenv').config();

const app = express();

// Criar servidor HTTP
const http = require('http').createServer(app);

// Integrar Socket.io ao servidor HTTP
const io = require('socket.io')(http);

// Swagger Setup
require('./config/swaggerConfig')(app);

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);
app.use('/booster', boosterRoutes);
app.use('/chat', chatRoutes); // Novo: adicionando as rotas de chat

// Configuração do Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Entrar na sala específica da order
  socket.on('joinOrderRoom', ({ orderId }) => {
    socket.join(orderId);
    console.log(`Client joined room: ${orderId}`);
  });

  // Receber e emitir mensagens
  socket.on('sendMessage', (message) => {
    io.to(message.orderId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'An unexpected error occurred!',
    error: err.message,
  });
});

// Sync Models and Start Server
sequelize.sync().then(() => {
  console.log('Database synced');
  http.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Swagger UI available on http://localhost:3000/api-docs');
  });
});

module.exports = { app, io };
