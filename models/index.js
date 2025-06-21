const sequelize = require('../config/database');
const Merchant = require('./Merchant');
const Pattern = require('./Pattern');
const UserPattern = require('./UserPattern');
const Inventory = require('./Inventory');

// Define associations
Merchant.hasMany(UserPattern, { foreignKey: 'merchantId', as: 'userPatterns' });
UserPattern.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Pattern.hasMany(UserPattern, { foreignKey: 'patternId', as: 'userPatterns' });
UserPattern.belongsTo(Pattern, { foreignKey: 'patternId', as: 'pattern' });

Merchant.hasMany(Inventory, { foreignKey: 'merchantId', as: 'inventories' });
Inventory.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

UserPattern.hasMany(Inventory, { foreignKey: 'userPatternId', as: 'inventories' });
Inventory.belongsTo(UserPattern, { foreignKey: 'userPatternId', as: 'userPattern' });

module.exports = {
  sequelize,
  Merchant,
  Pattern,
  UserPattern,
  Inventory
};