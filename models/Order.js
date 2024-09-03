const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Message = require('./Message'); // Importe o modelo de Message para definir a associação

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nome da tabela referenciada
      key: 'id'
    },
    onDelete: 'CASCADE' // Comportamento em exclusões
  },
  boosterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users', // Nome da tabela referenciada
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountLogin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountPassword: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending'
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  additionalInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Definição do relacionamento entre Order e Message
Order.hasMany(Message, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Message.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = Order;