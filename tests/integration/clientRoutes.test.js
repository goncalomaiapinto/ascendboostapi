const request = require('supertest');
const app = require('../../index');
const sequelize = require('../../config/database');
const User = require('../../models/User');
const Order = require('../../models/Order');

let clientToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const client = await User.create({
    firstName: 'Client',
    lastName: 'User',
    email: 'client.user@example.com',
    password: 'password123',
    role: 'Client'
  });

  const res = await request(app)
    .post('/auth/login')
    .send({
      email: client.email,
      password: 'password123'
    });

  clientToken = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Client Routes', () => {
  it('should create a new order', async () => {
    const res = await request(app)
      .post('/client/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        type: 'Leveling',
        accountLogin: 'client_login',
        accountPassword: 'client_password',
        status: 'Available',
        price: 49.99
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get the client’s order history', async () => {
    const res = await request(app)
      .get('/client/orders/history')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should request a new booster for an order', async () => {
    const order = await Order.create({
      userId: 1,
      type: 'Placements',
      accountLogin: 'client_login',
      accountPassword: 'client_password',
      status: 'Available',
      price: 49.99
    });

    const res = await request(app)
      .put(`/client/orders/${order.id}/request-booster`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
  });
});
