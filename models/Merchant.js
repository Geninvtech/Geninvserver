const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class Merchant extends Model {
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}

Merchant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true
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
  modelName: 'Merchant',
  tableName: 'merchants',
  hooks: {
    beforeCreate: async (merchant) => {
      const salt = await bcrypt.genSalt(10);
      merchant.password = await bcrypt.hash(merchant.password, salt);
    },
    beforeUpdate: async (merchant) => {
      if (merchant.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        merchant.password = await bcrypt.hash(merchant.password, salt);
      }
    }
  }
});

module.exports = Merchant;