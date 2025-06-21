require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');
const { Table } = db;

/**
 * Initialize the database with system tables and an admin user
 */
const initializeDb = async () => {
  try {
    console.log('Starting database initialization...');

    // Sync all models
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await db.User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '1234567890',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created:', {
      email: admin.email,
      password: adminPassword
    });

    // Create system tables metadata
    const tables = [
      {
        name: 'Inventory',
        description: 'Inventory items management',
        modelName: 'Inventory',
        tableName: 'Inventories',
        accessControl: 'all',
        isSystem: true,
        status: 'active'
      },
      {
        name: 'Sales',
        description: 'Sales transactions management',
        modelName: 'Sale',
        tableName: 'Sales',
        accessControl: 'all',
        isSystem: true,
        status: 'active'
      },
      {
        name: 'Sale Items',
        description: 'Individual items in sales transactions',
        modelName: 'SaleItem',
        tableName: 'SaleItems',
        accessControl: 'all',
        isSystem: true,
        status: 'active'
      },
      {
        name: 'Expenses',
        description: 'Expense tracking',
        modelName: 'Expense',
        tableName: 'Expenses',
        accessControl: 'all',
        isSystem: true,
        status: 'active'
      }
    ];

    // Create table metadata entries
    for (const tableData of tables) {
      const table = await Table.create(tableData);
      console.log(`Created table metadata for ${table.name}`);
    }

    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDb();