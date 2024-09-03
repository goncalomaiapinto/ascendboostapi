const Order = require('../../models/Order');
const User = require('../../models/User');

describe('Order Model', () => {
  beforeAll(async () => {
    await User.sync({ force: true });
    await Order.sync({ force: true });
  });

  it('should create an order with status Pending by default', async () => {
    const user = await User.create({ 
      firstName: 'Test', 
      lastName: 'User', 
      email: 'test.user@example.com', 
      password: 'password123' 
    });

    const order = await Order.create({ 
      userId: user.id, 
      type: 'Leveling', 
      accountLogin: 'test_login', 
      accountPassword: 'gamepassword', 
      price: 29.99 
    });

    expect(order.status).toBe('Pending');
  });

  it('should allow associating an order with a booster', async () => {
    const client = await User.create({ 
      firstName: 'Client', 
      lastName: 'User', 
      email: 'client.user@example.com', 
      password: 'password123', 
      role: 'Client' 
    });

    const booster = await User.create({ 
      firstName: 'Booster', 
      lastName: 'User', 
      email: 'booster.user@example.com', 
      password: 'password123', 
      role: 'Booster' 
    });

    const order = await Order.create({ 
      userId: client.id, 
      type: 'Placements', 
      accountLogin: 'client_login', 
      accountPassword: 'gamepassword', 
      price: 49.99 
    });

    order.boosterId = booster.id;
    await order.save();

    expect(order.boosterId).toBe(booster.id);
  });
});

const sequelize = require('../../config/database');

afterAll(async () => {
  await sequelize.close();
});
