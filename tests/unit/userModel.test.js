const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../../models/User');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Model', () => {

  it('should create a user with default role as Client', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });

    expect(user.role).toBe('Client');
  });

  it('should hash the password before saving', async () => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'securepassword'
    });

    // Assuming you have a hook that hashes the password before saving
    expect(user.password).not.toBe('securepassword');
    expect(user.password.length).toBeGreaterThan(30); // Hash length check
  });

  it('should not create a user without an email', async () => {
    try {
      await User.create({
        firstName: 'Missing',
        lastName: 'Email',
        password: 'password123'
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should not create a user with an invalid email', async () => {
    try {
      await User.create({
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'invalid-email',
        password: 'password123'
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should not create a user with a duplicate email', async () => {
    await User.create({
      firstName: 'Original',
      lastName: 'User',
      email: 'unique.email@example.com',
      password: 'password123'
    });

    try {
      await User.create({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'unique.email@example.com',
        password: 'password123'
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SequelizeUniqueConstraintError');
    }
  });

  it('should have a status of Active by default', async () => {
    const user = await User.create({
      firstName: 'Active',
      lastName: 'User',
      email: 'active.user@example.com',
      password: 'password123'
    });

    expect(user.status).toBe('Active');
  });

  it('should update the updatedAt field on save', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.update@example.com',
      password: 'password123'
    });

    const initialUpdatedAt = user.updatedAt;

    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    user.lastName = 'Updated';
    await user.save();

    expect(user.updatedAt).not.toBe(initialUpdatedAt);
  });

});

