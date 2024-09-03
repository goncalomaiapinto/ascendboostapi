const request = require('supertest');
const app = require('../../index');
const sequelize = require('../../config/database');
const User = require('../../models/User');
const Order = require('../../models/Order');

let adminToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin.user@example.com',
    password: 'adminpassword',
    role: 'Admin'
  });

  const res = await request(app)
    .post('/auth/login')
    .send({
      email: admin.email,
      password: 'adminpassword'
    });

  adminToken = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Admin Routes', () => {
  it('should get a list of all users', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        password: 'password123',
        role: 'Client'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should update an existing user', async () => {
    const user = await User.create({
      firstName: 'Update',
      lastName: 'Me',
      email: 'update.me@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .put(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        lastName: 'Updated'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.lastName).toBe('Updated');
  });

  it('should delete a user', async () => {
    const user = await User.create({
      firstName: 'Delete',
      lastName: 'Me',
      email: 'delete.me@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .delete(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should get a list of all orders', async () => {
    const res = await request(app)
      .get('/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
