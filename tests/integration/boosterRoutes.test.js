const request = require('supertest');
const app = require('../../index');
const sequelize = require('../../config/database');
const User = require('../../models/User');
const Order = require('../../models/Order');

let boosterToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const client = await User.create({
    firstName: 'Client',
    lastName: 'User',
    email: 'client.user@example.com',
    password: 'password123',
    role: 'Client'
  });

  await Order.create({
    userId: client.id,
    type: 'Leveling',
    accountLogin: 'client_login',
    accountPassword: 'client_password',
    status: 'Available',
    price: 49.99
  });

  const booster = await User.create({
    firstName: 'Booster',
    lastName: 'User',
    email: 'booster.user@example.com',
    password: 'password123',
    role: 'Booster'
  });

  const res = await request(app)
    .post('/auth/login')
    .send({
      email: booster.email,
      password: 'password123'
    });

  boosterToken = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Booster Routes', () => {
  it('should get a list of available orders', async () => {
    const res = await request(app)
      .get('/booster/orders')
      .set('Authorization', `Bearer ${boosterToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow a booster to claim an available order', async () => {
    const order = await Order.findOne({ where: { status: 'Available' } });

    const res = await request(app)
      .put(`/booster/orders/${order.id}/claim`)
      .set('Authorization', `Bearer ${boosterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  it('should get the booster’s order history', async () => {
    const res = await request(app)
      .get('/booster/orders/history')
      .set('Authorization', `Bearer ${boosterToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
