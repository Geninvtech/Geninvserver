require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

/**
 * Quickly initialize the database with basic tables and an admin user
 */
const quickInit = async () => {
  try {
    console.log('Starting quick database initialization...');

    // Sync all models
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create admin user
    const adminPassword = 'admin123';
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

    console.log('Quick database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the initialization
quickInit();