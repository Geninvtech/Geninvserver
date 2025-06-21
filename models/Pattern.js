const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Pattern extends Model {}

Pattern.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  structure: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'JSON structure containing categories and items for the inventory'
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Keywords to help match business types'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Track how often this pattern is used'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata about the pattern'
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
  modelName: 'Pattern',
  tableName: 'patterns',
  indexes: [
    {
      fields: ['businessType'],
      using: 'BTREE'
    },
    {
      fields: ['industry'],
      using: 'BTREE'
    },
    {
      fields: ['keywords'],
      using: 'GIN'
    }
  ]
});

module.exports = Pattern;