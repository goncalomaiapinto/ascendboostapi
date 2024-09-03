const sequelize = require('./config/database'); // Adjust the path as needed
const User = require('./models/User');
const Order = require('./models/Order');

(async () => {
  try {
    await sequelize.sync({ force: true }); // This forces table recreation
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
})();
