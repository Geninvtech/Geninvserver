const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserPattern extends Model {}

UserPattern.init({
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
  patternId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patterns',
      key: 'id'
    }
  },
  customStructure: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Customized version of the pattern structure for this merchant'
  },
  modifications: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Track what modifications were made from the original pattern'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Custom name for this inventory configuration'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUsed: {
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
  modelName: 'UserPattern',
  tableName: 'user_patterns',
  indexes: [
    {
      fields: ['merchantId', 'isActive'],
      using: 'BTREE'
    }
  ]
});

module.exports = UserPattern;