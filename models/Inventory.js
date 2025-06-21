const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Inventory extends Model {}

Inventory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  userPatternId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'user_patterns',
      key: 'id'
    }
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of inventory items with their details'
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Inventory',
  tableName: 'inventories',
  indexes: [
    {
      fields: ['merchantId'],
      using: 'BTREE'
    }
  ]
});

module.exports = Inventory;